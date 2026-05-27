import { supabase } from '@/lib/supabase';
import FeatureSection from '@/components/hero/FeatureSection';
import HeroSection from '@/components/hero/HeroSection';
import Navbar from '@/components/layout/Navbar';

export default async function Home() {
  const { data: songs } = await supabase.from('songs').select('id,title,artist,cover_url,description').order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <Navbar/>
      <HeroSection />
      <FeatureSection />
    </main>
  )
}
