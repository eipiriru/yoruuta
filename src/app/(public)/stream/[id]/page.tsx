import { notFound } from 'next/navigation'
import YouTubeStreamPlayer from '@/components/YouTubeStreamPlayer'
import { createClient } from '@/lib/supabase'
import type { Stream } from '@/lib/stream'

export default async function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await createClient().from('streams').select('*').eq('id', id).single()
  if (!data) notFound()
  const stream = data as Stream
  return <main className="mx-auto max-w-7xl px-4 py-8 text-white sm:px-8">
    <header className="mb-6"><h1 className="text-3xl font-bold">{stream.title}</h1><p className="mt-1 text-slate-300">{stream.artist}</p></header>
    <YouTubeStreamPlayer videoId={stream.video_id} pack={stream.lyrics_data} />
  </main>
}