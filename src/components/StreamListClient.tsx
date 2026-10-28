'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Stream } from '@/lib/stream'

const PAGE_SIZE = 12

export default function StreamListClient() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const fetchPage = useCallback(async (pageIndex: number, isInitial = false) => {
    if (isInitial) setLoading(true)
    else setLoadingMore(true)

    const from = pageIndex * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    // ponytail: search jalan di client array. Server-side text search (ilike) upgrade path kalau data > 1000.
    const { data, error: fetchError } = await createClient()
      .from('streams')
      .select('id,video_id,lrclib_url,title,artist,lyrics_data,created_at')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      const items = (data ?? []) as Stream[]
      setStreams((prev) => (isInitial ? items : [...prev, ...items]))
      setHasMore(items.length === PAGE_SIZE)
      setPage(pageIndex)
    }

    setLoading(false)
    setLoadingMore(false)
  }, [])

  useEffect(() => {
    fetchPage(0, true)
  }, [fetchPage])

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return
    const target = sentinelRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchPage(page + 1)
      },
      { rootMargin: '300px' }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchPage, hasMore, loading, loadingMore, page])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return streams.filter((stream) => !term || `${stream.title} ${stream.artist}`.toLowerCase().includes(term))
  }, [query, streams])

  return <div>
    <input aria-label="Search streams" className="mb-6 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white" placeholder="Search by title or artist..." value={query} onChange={(event) => setQuery(event.target.value)} />
    {error && <p role="alert" className="mb-4 text-red-300">Could not load streams: {error}</p>}
    {loading ? (
      <p className="text-slate-300">Loading streams...</p>
    ) : filtered.length ? (
      <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((stream) => (
            <Link key={stream.id} href={`/stream/${stream.id}`} className="overflow-hidden rounded-xl border border-slate-600 bg-slate-900/60 transition hover:-translate-y-1 hover:border-slate-400">
              <img className="aspect-video w-full object-cover" src={`https://i.ytimg.com/vi/${stream.video_id}/hqdefault.jpg`} alt="" loading="lazy" />
              <div className="p-4">
                <h2 className="font-semibold text-white">{stream.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{stream.artist}</p>
              </div>
            </Link>
          ))}
        </div>
        <div ref={sentinelRef} className="h-8" />
        {loadingMore && <p className="py-4 text-center text-slate-400">Loading more streams...</p>}
      </>
    ) : (
      <p className="text-slate-400">No streams found.</p>
    )}
  </div>
}