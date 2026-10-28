'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getYouTubeVideoId, type LyricsPack } from '@/lib/stream'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Button from '@/components/ui/button/Button'

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
        setLrclibUrl(data.lrclib_url ?? '')
        setTitle(data.title)
        setArtist(data.artist)
        setLyricsData(data.lyrics_data ?? null)
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
    if (!videoId || !/^https:\/\/lrclib\.net\/tracks\/[1-9]\d*\/?$/.test(lrclibUrl.trim()) || !title.trim() || !artist.trim() || (!id && !lyricsData)) return setMessage('Lengkapi URL, metadata, lalu proses LRCLIB dahulu.')
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi admin berakhir. Silakan login kembali.')
      const response = await fetch(id ? '/api/admin/streams' : '/api/admin/streams/process', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(id
          ? { id, videoId, lrclibUrl: lrclibUrl.trim(), title: title.trim(), artist: artist.trim() }
          : { videoId, lrclibUrl: lrclibUrl.trim(), title: title.trim(), artist: artist.trim(), offset }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan stream.')
    } catch (error) {
      setSaving(false)
      return setMessage(error instanceof Error ? error.message : 'Gagal menyimpan stream.')
    }
    setSaving(false)
    router.push('/admin/streams')
  }

  return (
    <div className="py-8">
      <PageBreadcrumb pageTitle={id ? 'Edit Stream' : 'Add Stream'} />
      <ComponentCard title={id ? 'Edit Stream' : 'Add Stream'}>
        <form onSubmit={save} className="space-y-5">
          <div className="space-y-2">
            <Label>URL YouTube</Label>
            <Input required type="url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div className="space-y-2">
            <Label>URL LRCLIB</Label>
            <Input required type="url" value={lrclibUrl} onChange={(event) => setLrclibUrl(event.target.value)} placeholder="https://lrclib.net/tracks/..." />
          </div>
          {!id && <Button type="button" onClick={fetchSources} disabled={loading} variant="outline" size="sm">
            {loading ? 'Memuat...' : 'Ambil data dari sumber'}
          </Button>}
          <div className="space-y-2">
            <Label>Judul</Label>
            <Input required value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Artist / Channel</Label>
            <Input required value={artist} onChange={(event) => setArtist(event.target.value)} />
          </div>
          {!id && <div className="space-y-2">
            <Label>Offset lirik (detik)</Label>
            <Input type="number" step={0.1} value={offset} onChange={(event) => setOffset(Number(event.target.value))} />
          </div>}
          {!id && lyricsData && (
            <p className={`rounded p-3 text-sm ${processingStatus === 'partial' ? 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200' : 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'}`}>
              Snapshot {processingStatus}: {lyricsData.lyrics[0]?.syncedLyrics?.split(/\r?\n/).filter(Boolean).length ?? 0} baris lirik sinkron; {lyricsData.lyrics[0]?.translations?.[lyricsData.lyrics[0]?.translateLang || 'id']?.length ?? 0} terjemahan.
            </p>
          )}
          {message && <p role="status" className="text-sm text-gray-600 dark:text-gray-300">{message}</p>}
          <Button disabled={saving || loading} className="w-full">
            {saving ? 'Menyimpan...' : 'Simpan Stream'}
          </Button>
        </form>
      </ComponentCard>
    </div>
  )
}
