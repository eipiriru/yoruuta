// components/hero/HeroSection.tsx
import Image from "next/image"

export default function FeatureSection() {
  return (
      <section className="relative z-10 pb-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">

          {[
            "Playlist Malam",
            "Visual Estetik",
            "Lagu Menenangkan",
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/50 p-8 shadow-lg"
            >
              <div className="mb-6">
                <Image
                  src="/logo/icon.png"
                  alt="icon"
                  width={42}
                  height={42}
                />
              </div>

              <h3 className="text-2xl font-serif mb-4">
                {item}
              </h3>

              <p className="text-[#4C5B70] leading-relaxed">
                Experience musik malam dengan tampilan lembut dan elegan.
              </p>
            </div>
          ))}
        </div>
      </section>
  )
}