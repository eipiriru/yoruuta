import { supabase } from '@/lib/supabase'

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  description: string;
}

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
            console.log(coverPath);
            await supabase.storage.from("album-covers").remove([coverPath]);
        }
    
        // Delete audio
        if (song.audio_url) {
            const audioPath = song.audio_url.split("/").pop();
            console.log(audioPath);
            await supabase.storage.from("audio-files").remove([audioPath]);
        }
    
        // Delete lyrics
        if (song.lyrics_file_url) {
            const lyricsPath = song.lyrics_file_url.split("/").pop();
            console.log(lyricsPath);
            await supabase.storage.from("lyrics-files").remove([lyricsPath]);
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