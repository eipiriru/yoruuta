'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { deleteStream, getAllStreams, type Stream } from '@/components/services/streamServices'

export default function StreamList() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => { getAllStreams().then(({ data, error }) => { if (error) setMessage(error.message); setStreams((data ?? []) as Stream[]) }) }, [])
  const remove = async (stream: Stream) => {
    if (!window.confirm(`Hapus stream "${stream.title}"?`)) return
    try { await deleteStream(stream.id); setStreams((items) => items.filter((item) => item.id !== stream.id)) } catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal menghapus stream.') }
  }
  const filtered = streams.filter((stream) => `${stream.title} ${stream.artist}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="space-y-4"><input className="w-full rounded border p-3 dark:bg-gray-900" placeholder="Cari judul atau artist..." value={query} onChange={(event) => setQuery(event.target.value)} />
    {message && <p className="text-red-500">{message}</p>}
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Judul</th><th className="p-3">Artist</th><th className="p-3">YouTube</th><th className="p-3">Aksi</th></tr></thead><tbody>{filtered.map((stream) => <tr key={stream.id} className="border-b"><td className="p-3">{stream.title}</td><td className="p-3">{stream.artist}</td><td className="p-3 font-mono text-xs">{stream.video_id}</td><td className="space-x-3 p-3"><Link className="text-blue-600" href={`/admin/streams/forms/${stream.id}`}>Edit</Link><button onClick={() => remove(stream)} className="text-red-600">Hapus</button></td></tr>)}</tbody></table></div>
  </div>
}