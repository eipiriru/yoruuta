import { NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/server/auth'
import { parseImportPack } from '@/lib/server/packImport'
import { createServiceClient } from '@/lib/server/supabase'

export async function POST(request: Request) {
  if (!await requireApiUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 5 * 1024 * 1024) return NextResponse.json({ error: 'File exceeds 5 MB limit.' }, { status: 413 })

  try {
    const raw = await request.json()
    const parsed = parseImportPack(raw)
    if (!parsed.items.length) return NextResponse.json({ error: 'No valid lyrics items found.', errors: parsed.errors }, { status: 400 })

    const supabase = createServiceClient()
    const ids = parsed.items.map(({ videoId }) => videoId)
    const { data: existing, error: lookupError } = await supabase.from('streams').select('video_id').in('video_id', ids)
    if (lookupError) throw lookupError
    const existingIds = new Set((existing ?? []).map(({ video_id }) => video_id))
    const newItems = parsed.items.filter(({ videoId }) => !existingIds.has(videoId))
    const skipped = parsed.items.length - newItems.length

    let created = 0
    let insertErrors: string[] = []
    if (newItems.length) {
      const { data, error } = await supabase.from('streams').insert(newItems.map((item) => ({
        video_id: item.videoId,
        lrclib_url: item.lrclibUrl,
        title: item.title,
        artist: item.artist,
        lyrics_data: item.lyricsData,
        processing_status: item.lyricsData.lyrics[0]?.translations ? 'ready' : 'partial',
        processing_error: item.lyricsData.lyrics[0]?.translations ? null : 'Imported pack has no translated lyrics.',
      }))).select('id')
      if (error) insertErrors = [error.message]
      else created = data?.length ?? 0
    }

    return NextResponse.json({ created, skipped, invalid: parsed.errors.length, errors: [...parsed.errors, ...insertErrors] }, { status: insertErrors.length ? 207 : 200 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Import failed.' }, { status: 500 })
  }
}