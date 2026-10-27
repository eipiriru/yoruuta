import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/server/supabase'

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('streams').select('video_id,title,artist,lrclib_url,lyrics_data').order('created_at', { ascending: false })
    if (error) throw error
    const lyrics = (data ?? []).flatMap((stream) => {
      const items = Array.isArray(stream.lyrics_data?.lyrics) ? stream.lyrics_data.lyrics : []
      return items.map((item: Record<string, unknown>) => ({
        ...item,
        videoId: stream.video_id,
        trackName: stream.title,
        artistName: stream.artist,
        lrclibUrl: stream.lrclib_url,
        key: `${stream.artist} ${stream.title}`,
      }))
    })
    const body = JSON.stringify({ schemaVersion: 2, exportedAt: new Date().toISOString(), lyrics })
    if (Buffer.byteLength(body) > 5 * 1024 * 1024) return NextResponse.json({ error: 'Lyrics pack exceeds 5 MB; use paginated export.' }, { status: 413, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } })
    const etag = `"${createHash('sha256').update(body).digest('hex')}"`
    if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: headers(etag) })
    return new Response(body, { headers: headers(etag) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not export lyrics pack.' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } })
  }
}

function headers(etag: string) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'If-None-Match',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
    ETag: etag,
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: headers('') })
}