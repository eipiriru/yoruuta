import { NextResponse } from 'next/server'
import { getYouTubeVideoId } from '@/lib/stream'
import { requireApiUser } from '@/lib/server/auth'
import { decryptSecret } from '@/lib/server/crypto'
import { createLyricsPack } from '@/lib/server/lyrics'
import { createServiceClient } from '@/lib/server/supabase'

export async function POST(request: Request) {
  if (!await requireApiUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const videoId = typeof body.videoId === 'string' ? getYouTubeVideoId(body.videoId) : null
    const lrclibUrl = typeof body.lrclibUrl === 'string' ? body.lrclibUrl : ''
    const offset = Number(body.offset ?? 0)
    if (!videoId || !Number.isFinite(offset) || Math.abs(offset) > 30) return NextResponse.json({ error: 'Invalid video ID or offset.' }, { status: 400 })
    const supabase = createServiceClient()
    const { data: rawSettings } = await supabase.from('ai_settings').select('*').eq('id', 'default').maybeSingle()
    const canDecrypt = Boolean(process.env.AI_SETTINGS_ENCRYPTION_KEY && /^[a-f0-9]{64}$/i.test(process.env.AI_SETTINGS_ENCRYPTION_KEY))
    const safeDecrypt = (secret: string) => {
      if (!canDecrypt) return ''
      try { return decryptSecret(secret) } catch { return '' }
    }
    const settings = rawSettings ? {
      ...rawSettings,
      providers: canDecrypt ? (rawSettings.providers ?? []).filter((provider: string) => provider === 'Gemini' ? rawSettings.gemini_enabled && rawSettings.gemini_api_key_encrypted : provider === '9Router' ? rawSettings.nine_router_enabled && rawSettings.nine_router_api_key_encrypted : rawSettings.open_router_enabled && rawSettings.open_router_api_key_encrypted) : [],
    } : { providers: [], language: 'id' as const }
    const processed = await createLyricsPack({ videoId, lrclibUrl, offset, settings, getSecret: safeDecrypt })
    const payload = { video_id: videoId, lrclib_url: lrclibUrl, title: String(body.title || processed.title).trim().slice(0, 300), artist: String(body.artist || processed.artist).trim().slice(0, 300), lyrics_data: processed.pack, processing_status: processed.partial ? 'partial' : 'ready', processing_error: processed.partial ? 'Some AI results unavailable; original lyrics retained.' : null }
    if (!payload.title || !payload.artist) return NextResponse.json({ error: 'Title and artist are required.' }, { status: 400 })
    if (body.preview === true) return NextResponse.json({ title: payload.title, artist: payload.artist, lyrics: payload.lyrics_data, status: payload.processing_status, processingError: payload.processing_error })
    const result = body.id ? await supabase.from('streams').update(payload).eq('id', body.id).select('id').single() : await supabase.from('streams').insert(payload).select('id').single()
    if (result.error) throw result.error
    return NextResponse.json({ id: result.data.id, status: payload.processing_status, lyrics: processed.pack })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stream processing failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}