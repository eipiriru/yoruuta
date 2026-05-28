'use client'; // Wajib ditambahkan agar kita bisa menggunakan state (interaksi klik)

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { Menu, X } from 'lucide-react'; // Menggunakan ikon dari lucide-react (bawaan shadcn)

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative z-50 bg-slate-900/95 backdrop-blur-md text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo & Judul */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo/icon.png"
            alt="Yoruuta Logo"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12" // Disesuaikan sedikit lebih kecil di layar HP
          />

          <div>
            <h1 className="text-xl md:text-2xl font-serif font-semibold tracking-wide">
              Yoruuta
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Wildflower swaying in the night breeze
            </p>
          </div>
        </div>

        {/* Navigasi Desktop (Tersembunyi di layar kecil) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <Link href="/music" className="hover:text-slate-300 transition-colors">
            Music
          </Link>
          <Link href="#" className="hover:text-slate-300 transition-colors">
            About
          </Link>
        </nav>

        {/* Tombol Hamburger Mobile (Tersembunyi di layar besar) */}
        <button 
          className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigasi Mobile (Dropdown yang muncul saat tombol diklik) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 absolute w-full shadow-lg">
          <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium">
            <Link 
              href="/" 
              className="py-2 hover:text-slate-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)} // Tutup menu saat diklik
            >
              Home
            </Link>
            <Link 
              href="/music" 
              className="py-2 hover:text-slate-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Music
            </Link>
            <Link 
              href="#" 
              className="py-2 hover:text-slate-300 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}