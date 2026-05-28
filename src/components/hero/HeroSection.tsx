'use client';

// components/hero/HeroSection.tsx
import Image from "next/image"
import Button2 from "../ui/button2"
import Link from 'next/link'; 

export default function HeroSection() {
  return (
    <section className="relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1F3552] to-[#15263B] min-h-[540px] shadow-2xl">

          {/* Decorative wave */}
          <div className="absolute top-0 right-0 opacity-30">
            <Image
              src="/patterns/wave.svg"
              alt="wave"
              width={500}
              height={200}
            />
          </div>

          {/* Floating stars */}
          <div className="absolute inset-0">
            <div className="absolute top-16 left-20 w-1 h-1 bg-white rounded-full" />
            <div className="absolute top-32 left-1/2 w-2 h-2 bg-white rounded-full" />
            <div className="absolute top-24 right-40 w-1.5 h-1.5 bg-white rounded-full" />
            <div className="absolute bottom-40 right-24 w-1 h-1 bg-white rounded-full" />
          </div>

          <div className="grid lg:grid-cols-2 items-center h-full">
            {/* Left */}
            <div className="relative p-10 lg:p-16">
              {/* Moon */}
              <div className="relative w-[320px] h-[320px]">
                <div className="absolute inset-0 rounded-full bg-[#F3E5DF] blur-2xl opacity-20" />

                <div className="absolute inset-0">
                  <div className="w-full h-full rounded-full border-[40px] border-[#F3E5DF] border-r-transparent rotate-[-25deg]" />
                </div>

                <div className="absolute top-18 left-20">
                  <Image
                    src="/logo/icon.png"
                    alt="flower"
                    width={180}
                    height={180}
                  />
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="relative p-10 lg:p-16">
              {/* <p className="uppercase tracking-[0.3em] text-sm text-[#D6C2BC] mb-4">
                Night Music Experience
              </p> */}

              <h2 className="font-serif text-5xl lg:text-6xl leading-tight mb-6">
                The Voice of
                <br />
                Silent Nights
              </h2>

              <p className="leading-relaxed max-w-lg mb-8">
                Like a wildflower swaying in the night breeze. <br/>
                A quiet place to sing in solitude.
              </p>
              <p className="text-[12px] text-slate-400 leading-relaxed max-w-lg mb-8">
                Seperti bunga liar yang berdesir dihembus angin malam. Sebuah tempat yang tenang untuk menyanyi dan memaknai lagu dalam kesendirian.
              </p>

              <div className="flex flex-wrap gap-4 relative z-10">
                <Link href="/music" className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 transition">
                  Explore
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom blur */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>
    </section>
  )
}