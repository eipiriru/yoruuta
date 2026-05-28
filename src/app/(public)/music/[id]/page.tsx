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
    <main className="overflow-y-hidden">
      <section className="relative z-10 mx-auto px-10 py-8 flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-1/4 p-6 text-center rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <h1 className="text-3xl font-bold">{song.title}</h1>
          <p className="text-lg text-slate-400 mt-1">{song.artist}</p>
          <div className="mt-6 flex justify-center">
            {coverPublic && (
              <img 
                src={coverPublic} 
                alt="cover" 
                className="w-64 h-64 object-cover rounded-xl shadow-lg" 
              />
            )}
          </div>
          
          <div className="mt-6 text-slate-300 text-sm leading-relaxed">
            <p>{song.description}</p>
          </div>
        </div>
        <div className="w-full lg:w-3/4 flex flex-col justify-center">
          <div className="w-full bg-slate-900/50 rounded-2xl p-4 lg:p-8">
            {audioPublic && (
              <KaraokePlayer audioUrl={audioPublic} lyrics={lyrics} />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
