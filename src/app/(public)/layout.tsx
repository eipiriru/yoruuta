// app/(public)/layout.tsx
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/FooterSection';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background text-foreground">
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </main>
  );
}