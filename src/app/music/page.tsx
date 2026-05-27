import { supabase } from '@/lib/supabase';
import SongListClient from '@/components/SongListClient';
import Navbar from '@/components/layout/Navbar';

export default async function Home() {
  const { data: songs } = await supabase.from('songs').select('id,title,artist,cover_url,description').order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-4">Music</h1>
          {/* Server passes initial songs to client component for search and interactivity */}
          <SongListClient initialSongs={songs ?? []} />
        </div>
      </section>
    </main>
  )
}
