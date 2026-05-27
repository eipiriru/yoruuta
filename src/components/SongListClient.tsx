"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Song = { id: string; title: string; artist: string; cover_url?: string | null; description?: string | null }

export default function SongListClient({ initialSongs }: { initialSongs: Song[] }) {
  const [query, setQuery] = useState('')
  const [songs, setSongs] = useState<Song[]>(initialSongs)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return songs
    return songs.filter((s) => (s.title || '').toLowerCase().includes(q) || (s.artist || '').toLowerCase().includes(q))
  }, [query, songs])

  const refresh = async () => {
    const { data } = await supabase.from('songs').select('id,title,artist,cover_url,description').order('created_at', { ascending: false })
    setSongs(data ?? [])
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2 bg-white"
          placeholder="Search by title or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={refresh} className="px-4 py-2 bg-gray-800 text-white rounded">Refresh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const cover = s.cover_url ? supabase.storage.from('album-covers').getPublicUrl(s.cover_url).data.publicUrl : '/placeholder.png'
          return (
            <Link key={s.id} href={`/music/${s.id}`} className="block p-4 border rounded hover:shadow bg-card">
              <img src={cover} alt={s.title} className="w-full h-40 object-cover rounded-md mb-2" />
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.artist}</p>
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-gray-500">No songs found. Try a different search.</p>
        )}
      </div>
    </div>
  )
}
