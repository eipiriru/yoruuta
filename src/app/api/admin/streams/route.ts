import { NextResponse } from 'next/server'
import { getYouTubeVideoId } from '@/lib/stream'
import { requireApiUser } from '@/lib/server/auth'
import { createServiceClient } from '@/lib/server/supabase'

export async function PATCH(request: Request) {
  if (!await requireApiUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    if (typeof body.id !== 'string' || !body.id) {
      return NextResponse.json({ error: 'Stream ID is required.' }, { status: 400 })
    }

    const updates: Record<string, string> = {}
    if (body.videoId !== undefined) {
      const videoId = typeof body.videoId === 'string' ? getYouTubeVideoId(body.videoId) : null
      if (!videoId) return NextResponse.json({ error: 'Invalid video ID.' }, { status: 400 })
      updates.video_id = videoId
    }
    if (body.lrclibUrl !== undefined) {
      if (typeof body.lrclibUrl !== 'string' || !/^https:\/\/lrclib\.net\/tracks\/[1-9]\d*\/?$/.test(body.lrclibUrl.trim())) {
        return NextResponse.json({ error: 'Invalid LRCLIB URL.' }, { status: 400 })
      }
      updates.lrclib_url = body.lrclibUrl.trim()
    }
    for (const field of ['title', 'artist'] as const) {
      if (body[field] !== undefined) {
        const value = typeof body[field] === 'string' ? body[field].trim().slice(0, 300) : ''
        if (!value) return NextResponse.json({ error: `${field} is required.` }, { status: 400 })
        updates[field] = value
      }
    }
    if (!Object.keys(updates).length) return NextResponse.json({ error: 'No stream fields to update.' }, { status: 400 })

    const { data, error } = await createServiceClient()
      .from('streams')
      .update(updates)
      .eq('id', body.id)
      .select('id')
      .single()
    if (error) throw error
    return NextResponse.json({ id: data.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stream update failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}