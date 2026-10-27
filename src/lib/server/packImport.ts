import { getYouTubeVideoId, type LyricsPack } from '../stream'

export type ImportItem = {
  videoId: string
  lrclibUrl: string
  title: string
  artist: string
  lyricsData: LyricsPack
}

export function parseImportPack(raw: unknown): { items: ImportItem[]; errors: string[] } {
  if (!raw || typeof raw !== 'object') return { items: [], errors: ['Payload must be a JSON object.'] }
  const pack = raw as Record<string, unknown>
  if (pack.schemaVersion !== 2) return { items: [], errors: ['Unsupported schemaVersion. Only schemaVersion 2 is supported.'] }
  if (!Array.isArray(pack.lyrics)) return { items: [], errors: ['Field "lyrics" must be an array.'] }

  const items: ImportItem[] = []
  const errors: string[] = []
  const seen = new Set<string>()

  pack.lyrics.forEach((entry, index) => {
    const label = `Item #${index + 1}`
    if (!entry || typeof entry !== 'object') {
      errors.push(`${label}: Must be an object.`)
      return
    }
    const item = entry as Record<string, unknown>
    const videoId = typeof item.videoId === 'string' ? getYouTubeVideoId(item.videoId) : null
    if (!videoId) {
      errors.push(`${label}: Invalid or missing videoId.`)
      return
    }
    if (seen.has(videoId)) {
      errors.push(`${label}: Duplicate videoId (${videoId}) within pack skipped.`)
      return
    }
    seen.add(videoId)

    const lrclibUrl = typeof item.lrclibUrl === 'string' && /^https:\/\/lrclib\.net\/tracks\/[1-9]\d*\/?$/.test(item.lrclibUrl.trim())
      ? item.lrclibUrl.trim()
      : Number.isInteger(item.lrclibId) && Number(item.lrclibId) > 0
      ? `https://lrclib.net/tracks/${item.lrclibId}`
      : ''
    if (!lrclibUrl) {
      errors.push(`${label}: Missing or invalid LRCLIB URL / ID.`)
      return
    }

    const title = typeof item.trackName === 'string' && item.trackName.trim()
      ? item.trackName.trim().slice(0, 300)
      : typeof item.key === 'string' && item.key.includes(' ')
      ? item.key.split(' ').slice(1).join(' ').trim().slice(0, 300)
      : ''
    const artist = typeof item.artistName === 'string' && item.artistName.trim()
      ? item.artistName.trim().slice(0, 300)
      : typeof item.key === 'string' && item.key.includes(' ')
      ? item.key.split(' ')[0].trim().slice(0, 300)
      : ''
    if (!title || !artist) {
      errors.push(`${label}: Missing trackName/artistName.`)
      return
    }

    const syncedLyrics = typeof item.syncedLyrics === 'string' ? item.syncedLyrics : null
    const plainLyrics = typeof item.plainLyrics === 'string' ? item.plainLyrics : null
    if (!syncedLyrics && !plainLyrics) {
      errors.push(`${label}: Must contain syncedLyrics or plainLyrics.`)
      return
    }

    const offset = Number.isFinite(item.offset) ? Math.min(30, Math.max(-30, Number(item.offset))) : 0
    const singlePack: LyricsPack = {
      schemaVersion: 2,
      exportedAt: typeof pack.exportedAt === 'string' ? pack.exportedAt : new Date().toISOString(),
      lyrics: [{
        key: `${artist} ${title}`,
        videoId,
        trackName: title,
        artistName: artist,
        lrclibId: Number.isInteger(item.lrclibId) ? Number(item.lrclibId) : null,
        lrclibUrl,
        syncedLyrics,
        plainLyrics,
        romajiLyrics: typeof item.romajiLyrics === 'string' ? item.romajiLyrics : null,
        translations: item.translations && typeof item.translations === 'object' ? item.translations as Record<string, string[]> : null,
        translateLang: typeof item.translateLang === 'string' ? item.translateLang : null,
        offset,
        type: item.type === 'plain' ? 'plain' : 'synced',
      }],
    }

    items.push({ videoId, lrclibUrl, title, artist, lyricsData: singlePack })
  })

  return { items, errors }
}