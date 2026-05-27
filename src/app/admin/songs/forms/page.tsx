"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
// Using plain HTML controls instead of shadcn UI components for now

export default function formSong() {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [description, setDescription] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [lyricsFile, setLyricsFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()

  const handleFileUpload = async (file: File, bucket: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(`${file.name}-${Date.now()}`, file)
    if (error) {
      throw error
    }
    return data.path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let coverUrl = null
      if (coverFile) {
        coverUrl = await handleFileUpload(coverFile, "album-covers")
      }

      let audioUrl = null
      if (audioFile) {
        audioUrl = await handleFileUpload(audioFile, "audio-files")
      }

      let lyricsUrl = null
      if (lyricsFile) {
        lyricsUrl = await handleFileUpload(lyricsFile, "lyrics-files")
      }

      const { error: dbError } = await supabase.from("songs").insert({
        title,
        artist,
        description,
        cover_url: coverUrl,
        audio_url: audioUrl,
        lyrics_file_url: lyricsUrl,
      })

      if (dbError) {
        throw dbError
      }

      setSuccess("Song uploaded successfully!")
      setTitle("")
      setArtist("")
      setDescription("")
      setCoverFile(null)
      setAudioFile(null)
      setLyricsFile(null)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="w-full bg-white dark:bg-gray-800 rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Upload New Song</h2>
        <p className="text-sm text-gray-500 mb-4">Fill in the details and upload the necessary files for a new song.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="artist" className="block text-sm font-medium">Artist</label>
            <input id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description/Trivia</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="cover" className="block text-sm font-medium">Album Cover (Image)</label>
            <input id="cover" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)} className="mt-1" />
          </div>
          <div>
            <label htmlFor="audio" className="block text-sm font-medium">Audio File (.mp3)</label>
            <input id="audio" type="file" accept="audio/mp3" onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)} required className="mt-1" />
          </div>
          <div>
            <label htmlFor="lyrics" className="block text-sm font-medium">Lyrics File (.ass or .lrc)</label>
            <input id="lyrics" type="file" accept=".ass,.lrc" onChange={(e) => setLyricsFile(e.target.files ? e.target.files[0] : null)} className="mt-1" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button type="submit" disabled={loading} className={`w-full text-white px-4 py-2 rounded 
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 cursor-pointer"
            }`}
          >{loading ? 'Uploading...' : 'Upload Song'}</button>
        </form>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-zinc-900 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 text-black dark:text-white">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="font-medium">Menyimpan lagu...</span>
          </div>
        </div>
      )}
    </div>
  )
}