'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Stream } from '@/lib/stream'

export default function StreamListClient() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient().from('streams').select('id,video_id,lrclib_url,title,artist,lyrics_data,created_at').order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError.message)
        setStreams((data ?? []) as Stream[])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return streams.filter((stream) => !term || `${stream.title} ${stream.artist}`.toLowerCase().includes(term))
  }, [query, streams])

  return <div>
    <input aria-label="Search streams" className="mb-6 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white" placeholder="Search by title or artist..." value={query} onChange={(event) => setQuery(event.target.value)} />
    {error && <p role="alert" className="mb-4 text-red-300">Could not load streams: {error}</p>}
    {loading ? <p className="text-slate-300">Loading streams...</p> : filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((stream) => <Link key={stream.id} href={`/stream/${stream.id}`} className="overflow-hidden rounded-xl border border-slate-600 bg-slate-900/60 transition hover:-translate-y-1 hover:border-slate-400">
        <img className="aspect-video w-full object-cover" src={`https://i.ytimg.com/vi/${stream.video_id}/hqdefault.jpg`} alt="" />
        <div className="p-4"><h2 className="font-semibold text-white">{stream.title}</h2><p className="mt-1 text-sm text-slate-400">{stream.artist}</p></div>
      </Link>)}
    </div> : <p className="text-slate-400">No streams found.</p>}
  </div>
}