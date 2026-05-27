// components/layout/Navbar.tsx
import Image from "next/image"

export default function Navbar() {
  return (
    <header className="relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/icon.svg"
            alt="Yoruuta Logo"
            width={48}
            height={48}
          />

          <div>
            <h1 className="text-2xl font-serif font-semibold">
              Yoruuta
            </h1>
            <p className="text-sm text-[#4C5B70]">
              Menemukan suara di malam hari
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="/" className="hover:opacity-70 transition">
            Home
          </a>

          <a href="/music" className="hover:opacity-70 transition">
            Music
          </a>

          {/* <a href="#" className="hover:opacity-70 transition">
            Playlist
          </a> */}

          <a href="#" className="hover:opacity-70 transition">
            About
          </a>
        </nav>
      </div>
    </header>
  )
}