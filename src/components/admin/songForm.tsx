"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from '@/components/common/ComponentCard';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import { useRouter } from 'next/navigation';
import { deleteStorage } from "../services/songServices";

export default function FormSong({ idx }: { idx: string }) {
    const router = useRouter();
    
    // State Teks
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [description, setDescription] = useState("");
    
    // State File Baru (jika user upload ulang)
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [lyricsFile, setLyricsFile] = useState<File | null>(null);

    // State URL Lama (untuk menyimpan data bawaan dari DB agar tidak hilang)
    const [existingCover, setExistingCover] = useState<string | null>(null);
    const [existingAudio, setExistingAudio] = useState<string | null>(null);
    const [existingLyrics, setExistingLyrics] = useState<string | null>(null);

    // State UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [pageTitle, setpageTitle] = useState("");
    
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const fetchSong = async () => {
            setIsFetching(true);
            try {
                const { data, error } = await supabase.from('songs').select('*').eq('id', idx).single();
                if (error) throw error;

                if (data) {
                    setTitle(data.title ?? "");
                    setArtist(data.artist ?? "");
                    setDescription(data.description ?? "");
                    
                    // ✅ Simpan URL lama ke state khusus URL, JANGAN ke state File
                    setExistingCover(data.cover_url);
                    setExistingAudio(data.audio_url);
                    setExistingLyrics(data.lyrics_file_url);
                }
            } catch (err: any) {
                setFetchError(err.message ?? "Gagal memuat lagu.");
            } finally {
                setIsFetching(false);
            }
        };

        if (idx) {
            fetchSong();
            setpageTitle("Edit Song");
        } else {
            setpageTitle("Add Song");
            setIsFetching(false);
        }
    }, [idx, supabase]);

    const handleFileUpload = async (file: File, bucket: string, oldUrl: string | null) => {
        if(oldUrl){
            var old = oldUrl.split("/").pop() || "";
            if(!deleteStorage(bucket, old)){
    
            }
        }

        const { data, error } = await supabase.storage.from(bucket).upload(`${file.name}-${Date.now()}`, file);
        if (error) throw error;
        return data.path;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // 1. Tentukan URL akhir: Gunakan URL lama sebagai default
            let finalCoverUrl = existingCover;
            let finalAudioUrl = existingAudio;
            let finalLyricsUrl = existingLyrics;

            // 2. Jika user MENGUPLOAD FILE BARU, upload filenya dan timpa variabel finalUrl
            if (coverFile) finalCoverUrl = await handleFileUpload(coverFile, "album-covers", existingCover);
            if (audioFile) finalAudioUrl = await handleFileUpload(audioFile, "audio-files", existingAudio);
            if (lyricsFile) finalLyricsUrl = await handleFileUpload(lyricsFile, "lyrics-files", existingLyrics);

            const payloadData = {
                title,
                artist,
                description,
                cover_url: finalCoverUrl,
                audio_url: finalAudioUrl,
                lyrics_file_url: finalLyricsUrl,
            };

            // 3. Eksekusi ke Database (Insert atau Update)
            if (idx) {
                const { error: dbError } = await supabase.from("songs").update(payloadData).eq("id", idx);
                if (dbError) throw dbError;
            } else {
                const { error: dbError } = await supabase.from("songs").insert([payloadData]);
                if (dbError) throw dbError;
            }

            setSuccess(idx ? "Song updated successfully!" : "Song created successfully!");
            setTimeout(() => {
                router.push('/admin/songs/');
            }, 1000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (isFetching) {
        return (
            <div className="container mx-auto py-8">
                <PageBreadcrumb pageTitle={pageTitle} />
                <div className="text-center text-gray-500">Memuat detail lagu...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <PageBreadcrumb pageTitle={pageTitle} />
            <div className="gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <ComponentCard title={pageTitle}>
                        <>
                            {fetchError && <p className="text-red-500 text-sm">{fetchError}</p>}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label>Title</Label>
                                    <Input type="text" placeholder="ex. Thats why I gave up on music" defaultValue={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                
                                <div>
                                    <Label>Artist</Label>
                                    <Input type="text" placeholder="ex. Yorushika" defaultValue={artist} onChange={(e) => setArtist(e.target.value)} required />
                                </div>
                                
                                <div>
                                    <Label>Description/Trivia</Label>
                                    <TextArea placeholder="ex. because of you Elma" value={description} onChange={(value) => setDescription(value)} required />
                                </div>

                                {/* Bagian File Upload dengan Preview existing data */}
                                <div>
                                    <Label>Album Cover (Image)</Label>
                                    {existingCover && !coverFile && <p className="text-xs text-blue-500 mb-2">Has existing cover. Upload new to replace.</p>}
                                    <FileInput accept="image/*" onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)} />
                                </div>

                                <div>
                                    <Label>Audio File (.mp3)</Label>
                                    {existingAudio && !audioFile && <p className="text-xs text-blue-500 mb-2">Has existing audio. Upload new to replace.</p>}
                                    <FileInput accept="audio/mp3" onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)} />
                                </div>

                                <div>
                                    <Label>Lyrics File (.ass or .lrc)</Label>
                                    {existingLyrics && !lyricsFile && <p className="text-xs text-blue-500 mb-2">Has existing lyrics. Upload new to replace.</p>}
                                    <FileInput accept=".ass,.lrc" onChange={(e) => setLyricsFile(e.target.files ? e.target.files[0] : null)} />
                                </div>

                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                {success && <p className="text-green-500 text-sm">{success}</p>}
                                
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className={`w-full text-white px-4 py-2 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-900 hover:bg-green-700 cursor-pointer"}`}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                            
                            {loading && (
                                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
                                    <div className="bg-white dark:bg-zinc-900 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin"></div>
                                        <span className="font-medium">Menyimpan data...</span>
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