// app/(public)/layout.tsx
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/FooterSection';
import Image from "next/image";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background text-foreground">
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gradient-to-br from-[#1F3552] to-[#15263B]">
          {children}
        </main>
        <Footer />
      </div>
    </main>
  );
}