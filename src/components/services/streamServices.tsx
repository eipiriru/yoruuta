import { createClient } from '@/lib/supabase'
import type { Stream } from '@/lib/stream'

const supabase = createClient()

export async function getAllStreams() {
  return supabase.from('streams').select('id,video_id,lrclib_url,title,artist,lyrics_data,created_at').order('created_at', { ascending: false })
}

export async function deleteStream(id: string) {
  const { error } = await supabase.from('streams').delete().eq('id', id)
  if (error) throw error
}

export type { Stream }