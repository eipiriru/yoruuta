import { createClient } from '@/lib/supabase';

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  description: string;
}

const supabase = createClient();

export async function getAllSongs() {
  const { data, error } = await supabase.from('songs').select('id,title,artist,cover_url,description').order('created_at', { ascending: false })
  return { data, error };
}

export async function deleteSongs(id: string) {
    try {
        const { data } = await supabase.from('songs').select('*').eq('id', id).single();
        const song = data;
        
        // Delete cover
        if (song.cover_url) {
            const coverPath = song.cover_url.split("/").pop();
            if(!deleteStorage("album-covers", coverPath)){
                var err = ("Gagl hapus album");
                throw err;
            }
        }
    
        // Delete audio
        if (song.audio_url) {
            const audioPath = song.audio_url.split("/").pop();
            if(!deleteStorage("audio-files", audioPath)){
                var err = ("Gagl hapus audio");
                throw err;
            }
        }
    
        // Delete lyrics
        if (song.lyrics_file_url) {
            const lyricsPath = song.lyrics_file_url.split("/").pop();
            if(!deleteStorage("lyrics-files", lyricsPath)){
                var err = ("Gagl hapus lyric");
                throw err;
            }
        }
    
        // Delete database row
        const { error } = await supabase.from("songs").delete().eq("id", song.id);
    
        if (error) throw error;

        alert("Song deleted");
    } catch (err) {
        console.error(err)
        alert("Failed to delete")
    }
}

export async function deleteStorage(bucket : string, path: string) {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
        return true;
    } catch (err) {
        return false;
    }
}