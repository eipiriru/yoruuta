"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from '@/components/common/ComponentCard';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";

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
  const supabase = createClient();

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
      <PageBreadcrumb pageTitle="Add Song" />
      <div className="gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <ComponentCard title="Upload New Song">
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Title</Label>
                  <Input type="text" placeholder="ex. Thats why I gave up on music" id="title" defaultValue={title} onChange={(e) => setTitle(e.target.value)} required className="placeholder:italic"/>
                </div>
                <div>
                  <Label>Artist</Label>
                  <Input type="text" placeholder="ex. Yorushika" id="artist" defaultValue={artist} onChange={(e) => setArtist(e.target.value)} required className="placeholder:italic"/>
                </div>
                <div>
                  <Label>Description/Trivia</Label>
                  <TextArea placeholder="ex. because of you Elma" id="description" value={description} onChange={(value) => setDescription(value)} required className="placeholder:italic"/>
                </div>
                <div>
                  <Label>Album Cover (Image)</Label>
                  <FileInput id="cover" accept="image/*" onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)} required className="custom-class" />
                </div>
                <div>
                  <Label>Audio File (.mp3)</Label>
                  <FileInput id="audio" accept="audio/mp3" onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)} required className="custom-class" />
                </div>
                <div>
                  <Label>Lyrics File (.ass or .lrc)</Label>
                  <FileInput id="lyrics"accept=".ass,.lrc" onChange={(e) => setLyricsFile(e.target.files ? e.target.files[0] : null)} className="custom-class" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <button type="submit" disabled={loading} className={`w-full text-white px-4 py-2 rounded 
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-900 hover:bg-green-700 cursor-pointer"
                  }`}
                >{loading ? 'Uploading...' : 'Upload Song'}</button>
              </form>
              {loading && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
                  <div className="bg-white dark:bg-zinc-900 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 text-black dark:text-white">
                    <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="font-medium">Menyimpan lagu...</span>
                  </div>
                </div>
              )}
            </>
          </ComponentCard>
        </div>
      </div>
    </div>
  )
}