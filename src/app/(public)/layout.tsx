// app/(public)/layout.tsx
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/FooterSection';
import { Analytics } from '@vercel/analytics/next';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}