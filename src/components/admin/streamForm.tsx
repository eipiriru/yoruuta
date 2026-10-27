'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getYouTubeVideoId, type LyricsPack } from '@/lib/stream'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'

export default function StreamForm({ id }: { id?: string }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [lrclibUrl, setLrclibUrl] = useState('')
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [offset, setOffset] = useState(0)
  const [lyricsData, setLyricsData] = useState<LyricsPack | null>(null)
  const [processingStatus, setProcessingStatus] = useState<'ready' | 'partial' | 'failed' | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('streams').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) setMessage(error.message)
      if (data) {
        setYoutubeUrl(`https://www.youtube.com/watch?v=${data.video_id}`)
        setLrclibUrl(data.lrclib_url)
        setTitle(data.title)
        setArtist(data.artist)
        setLyricsData(data.lyrics_data)
        setProcessingStatus(data.processing_status ?? 'ready')
        setOffset(data.lyrics_data?.lyrics?.[0]?.offset ?? 0)
      }
      setLoading(false)
    })
  }, [id, supabase])

  const fetchSources = async () => {
    const videoId = getYouTubeVideoId(youtubeUrl)
    if (!videoId || !/^https:\/\/lrclib\.net\/tracks\/[1-9]\d*\/?$/.test(lrclibUrl.trim())) return setMessage('URL YouTube atau LRCLIB tidak valid.')
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) throw new Error('Sesi admin berakhir. Silakan login kembali.')
      const response = await fetch('/api/admin/streams/process', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, videoId, lrclibUrl: lrclibUrl.trim(), title: title.trim() || undefined, artist: artist.trim() || undefined, offset, preview: true }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Pemrosesan lirik gagal.')
      setLyricsData(data.lyrics)
      setProcessingStatus(data.status)
      setTitle((value) => value || data.title)
      setArtist((value) => value || data.artist)
      setMessage(data.status === 'partial' ? 'Lirik tersimpan untuk preview; beberapa hasil AI tidak tersedia.' : 'Metadata, romaji, dan terjemahan siap.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal mengambil data sumber.')
    } finally {
      setLoading(false)
    }
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    const videoId = getYouTubeVideoId(youtubeUrl)
    if (!videoId || !/^https:\/\/lrclib\.net\/tracks\/[1-9]\d*\/?$/.test(lrclibUrl.trim()) || !title.trim() || !artist.trim() || !lyricsData) return setMessage('Lengkapi URL, metadata, lalu proses LRCLIB dahulu.')
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi admin berakhir. Silakan login kembali.')
      const response = await fetch('/api/admin/streams/process', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ id, videoId, lrclibUrl: lrclibUrl.trim(), title: title.trim(), artist: artist.trim(), offset }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan stream.')
    } catch (error) {
      setSaving(false)
      return setMessage(error instanceof Error ? error.message : 'Gagal menyimpan stream.')
    }
    setSaving(false)
    router.push('/admin/streams')
  }

  return <div className="py-8"><PageBreadcrumb pageTitle={id ? 'Edit Stream' : 'Add Stream'} />
    <form onSubmit={save} className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <label className="block text-sm font-medium">URL YouTube<input required type="url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="mt-2 w-full rounded border p-3 dark:bg-gray-900" /></label>
      <label className="block text-sm font-medium">URL LRCLIB<input required type="url" value={lrclibUrl} onChange={(event) => setLrclibUrl(event.target.value)} placeholder="https://lrclib.net/tracks/..." className="mt-2 w-full rounded border p-3 dark:bg-gray-900" /></label>
      <button type="button" onClick={fetchSources} disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{loading ? 'Memuat...' : 'Ambil data dari sumber'}</button>
      <label className="block text-sm font-medium">Judul<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded border p-3 dark:bg-gray-900" /></label>
      <label className="block text-sm font-medium">Artist / Channel<input required value={artist} onChange={(event) => setArtist(event.target.value)} className="mt-2 w-full rounded border p-3 dark:bg-gray-900" /></label>
      <label className="block text-sm font-medium">Offset lirik (detik)<input type="number" step="0.1" value={offset} onChange={(event) => setOffset(Number(event.target.value))} className="mt-2 w-full rounded border p-3 dark:bg-gray-900" /></label>
      {lyricsData && <p className={`rounded p-3 text-sm ${processingStatus === 'partial' ? 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200' : 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'}`}>Snapshot {processingStatus}: {lyricsData.lyrics[0]?.syncedLyrics?.split(/\r?\n/).filter(Boolean).length ?? 0} baris lirik sinkron; {lyricsData.lyrics[0]?.translations?.[lyricsData.lyrics[0]?.translateLang || 'id']?.length ?? 0} terjemahan.</p>}
      {message && <p role="status" className="text-sm text-gray-600 dark:text-gray-300">{message}</p>}
      <button disabled={saving || loading} className="w-full rounded bg-green-700 px-4 py-3 text-white disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Stream'}</button>
    </form>
  </div>
}