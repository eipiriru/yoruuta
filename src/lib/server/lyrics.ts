import { getLrclibId, type LyricsPack } from '@/lib/stream'

type ProviderName = 'Gemini' | '9Router' | 'OpenRouter'
type Settings = Partial<{
  providers: ProviderName[]; language: 'id' | 'en'; gemini_enabled: boolean; gemini_api_key_encrypted: string | null; gemini_model: string
  nine_router_enabled: boolean; nine_router_url: string; nine_router_api_key_encrypted: string | null; nine_router_model: string
  open_router_enabled: boolean; open_router_api_key_encrypted: string | null; open_router_model: string
}>

type LrclibTrack = { id: number; trackName: string; artistName: string; syncedLyrics?: string | null; plainLyrics?: string | null }

function lrcLines(lrc: string) {
  return lrc.split(/\r?\n/).filter((line) => /^\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/.test(line)).map((line, id) => ({ id, text: line.replace(/^.*?\]/, '').trim() }))
}

function withTimestamps(lrc: string, texts: string[]) {
  let index = 0
  return lrc.split(/\r?\n/).map((line) => /^\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/.test(line) ? `${line.match(/^.*?\]/)?.[0] ?? ''}${texts[index++] ?? ''}` : line).join('\n')
}

function parseOutput(value: string, count: number) {
  try {
    const parsed = JSON.parse(value.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()) as Array<{ id?: number; text?: string }>
    if (!Array.isArray(parsed) || parsed.length !== count) return null
    const byId = new Map(parsed.map((item) => [item.id, item.text?.trim()]))
    const result = Array.from({ length: count }, (_, id) => byId.get(id))
    return result.every((item): item is string => typeof item === 'string' && item.length > 0) ? result : null
  } catch { return null }
}

async function requestProvider(provider: ProviderName, prompt: string, settings: Settings, getSecret: (value: string) => string) {
  if (!settings) return ''
  if (provider === 'Gemini' && settings.gemini_enabled && settings.gemini_api_key_encrypted) {
    const key = getSecret(settings.gemini_api_key_encrypted)
    if (!key) return ''
    const model = settings.gemini_model || 'gemini-1.5-flash'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }) })
    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`)
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }
  const config = provider === '9Router' ? { enabled: settings.nine_router_enabled, url: settings.nine_router_url, key: settings.nine_router_api_key_encrypted, model: settings.nine_router_model || 'gemini-flash' } : { enabled: settings.open_router_enabled, url: 'https://openrouter.ai/api/v1/chat/completions', key: settings.open_router_api_key_encrypted, model: settings.open_router_model || 'google/gemini-2.5-flash' }
  if (!config.enabled || !config.key || !config.url) return ''
  const secret = getSecret(config.key)
  if (!secret) return ''
  const response = await fetch(config.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` }, body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: prompt }], stream: false }) })
  if (!response.ok) throw new Error(`${provider} HTTP ${response.status}`)
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}

async function processLines(kind: 'romaji' | 'translation', original: string, title: string, artist: string, settings: Settings, getSecret: (value: string) => string) {
  const lines = lrcLines(original)
  if (!lines.length) return null
  const target = settings.language === 'id' ? 'Bahasa Indonesia' : 'English'
  const instruction = kind === 'romaji' ? 'Transliterate every line to romaji. Do not translate.' : `Translate every line to ${target}.`
  const prompt = `${instruction} Keep each id and return valid JSON only: [{"id":0,"text":"..."}]. Song: ${artist} - ${title}. Lines: ${JSON.stringify(lines)}`
  const providers = settings.providers ?? []
  for (const provider of providers) {
    try {
      const result = parseOutput(await requestProvider(provider, prompt, settings, getSecret), lines.length)
      if (result) return result
    } catch { continue }
  }
  return null
}

export async function createLyricsPack({ videoId, lrclibUrl, offset, settings, getSecret }: { videoId: string; lrclibUrl: string; offset: number; settings: Settings; getSecret: (value: string) => string }) {
  const id = getLrclibId(lrclibUrl)
  if (!id) throw new Error('URL LRCLIB tidak valid.')
  const response = await fetch(`https://lrclib.net/api/get/${id}`)
  if (!response.ok) throw new Error(`LRCLIB HTTP ${response.status}`)
  const source = await response.json() as LrclibTrack
  const syncedLyrics = source.syncedLyrics ?? null
  if (!syncedLyrics) throw new Error('Track LRCLIB tidak memiliki lirik bertimestamp.')
  const [romaji, translations] = await Promise.all([processLines('romaji', syncedLyrics, source.trackName, source.artistName, settings, getSecret), processLines('translation', syncedLyrics, source.trackName, source.artistName, settings, getSecret)])
  const lang = settings.language === 'en' ? 'en' : 'id'
  const pack: LyricsPack = { schemaVersion: 2, exportedAt: new Date().toISOString(), lyrics: [{ key: `${source.artistName} ${source.trackName}`, videoId, trackName: source.trackName, artistName: source.artistName, lrclibId: source.id, lrclibUrl, syncedLyrics, plainLyrics: source.plainLyrics ?? null, romajiLyrics: romaji ? withTimestamps(syncedLyrics, romaji) : null, translations: translations ? { [lang]: translations } : null, translateLang: translations ? lang : null, offset, type: 'synced' }] }
  return { pack, title: source.trackName, artist: source.artistName, partial: !romaji || !translations }
}