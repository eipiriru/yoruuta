import { supabase } from '@/lib/supabase';
import FeatureSection from '@/components/hero/FeatureSection';
import HeroSection from '@/components/hero/HeroSection';

export default async function Home() {
  const { data: songs } = await supabase.from('songs').select('id,title,artist,cover_url,description').order('created_at', { ascending: false })

  return (
    <>
        <HeroSection />
        {/* <FeatureSection /> */}
    </>
  )
}
