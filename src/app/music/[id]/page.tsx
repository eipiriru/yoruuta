import { supabase } from '@/lib/supabase'
import { parseLRC, parseASS, LyricLine } from '@/lib/lyricsParser'
import KaraokePlayer from '@/components/KaraokePlayer'

export default async function SongPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params as { id: string }
  const { data } = await supabase.from('songs').select('*').eq('id', id).single()
  const song = data
  if (!song) return <div>Song not found</div>

  let lyrics: LyricLine[] = []
  if (song.lyrics_file_url) {
    const { data: fileData } = await supabase.storage.from('lyrics-files').download(song.lyrics_file_url)
    const text = await new Response(fileData).text()
    const key = song.lyrics_file_url.toLowerCase()
    const isLrc = 
      // matches ".lrc" at end or before a timestamp/suffix like "-1234567890"
      /\.lrc(?:$|[-_])/.test(key)
    const isAss = /\.ass(?:$|[-_])/.test(key)

    if (isLrc) {
      lyrics = parseLRC(text)
    } else if (isAss) {
      lyrics = parseASS(text)
    } else {
      // fallback: try LRC first, then ASS
      try { lyrics = parseLRC(text) } catch { lyrics = parseASS(text) }
    }
  }

  const coverPublic = song.cover_url ? supabase.storage.from('album-covers').getPublicUrl(song.cover_url).data.publicUrl : null
  const audioPublic = song.audio_url ? supabase.storage.from('audio-files').getPublicUrl(song.audio_url).data.publicUrl : null

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold">{song.title}</h1>
          <p className="text-lg text-gray-600">{song.artist}</p>
          <div className="mt-4 justify-items-center">
            {coverPublic && <img src={coverPublic} alt="cover" className="w-64 h-64 object-cover rounded-md" />}
          </div>
          <div className="mt-6">
            <p>{song.description}</p>
          </div>
          <div className="mt-6">
            {audioPublic && (
              <KaraokePlayer audioUrl={audioPublic} lyrics={lyrics} />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
