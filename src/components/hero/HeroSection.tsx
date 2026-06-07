'use client';

// components/hero/HeroSection.tsx
import Image from "next/image";
import Link from 'next/link'; 
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";
import RealisticMoon from "./RealisticMoon";

export default function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const starsX = useTransform(smoothX, (v) => v * 0.5);
  const starsY = useTransform(smoothY, (v) => v * 0.5);
  
  const moonHaloX = useTransform(smoothX, (v) => v * -1);
  const moonHaloY = useTransform(smoothY, (v) => v * -1);

  const moonBaseX = useTransform(smoothX, (v) => v * -2);
  const moonBaseY = useTransform(smoothY, (v) => v * -2);

  const flowerX = useTransform(smoothX, (v) => v * -4);
  const flowerY = useTransform(smoothY, (v) => v * -4);

  const waveX = useTransform(smoothX, (v) => v * -4);
  const waveY = useTransform(smoothY, (v) => v * -4);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / 20; 
    const y = (clientY - top - height / 2) / 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="relative z-10">
      <div 
        // className="max-w-7xl mx-auto px-6 py-12"
        className="max-w-7md mx-auto px-0 py-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          // className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1F3552] to-[#15263B] min-h-[540px] shadow-2xl"
          className="relative overflow-hidden min-h-[740px]"
          
        >
          <motion.div 
              className="absolute top-0 right-0 opacity-30 pointer-events-none"
              style={{ x: waveX, y: waveY }}
            >
            <Image src="/patterns/wave.svg" alt="wave" width={500} height={200} priority />
          </motion.div>
          <motion.div 
              className="absolute top-98 left-20 opacity-35 pointer-events-none z-10"
              style={{ x: waveX, y: waveY }}
            >
            <Image src="/patterns/wave.svg" alt="wave" width={500} height={200} priority />
          </motion.div>

          <motion.div 
            className="absolute inset-0 pointer-events-none"
            style={{ x: starsX, y: starsY }}
          >
            <div className="absolute top-16 left-20 w-1 h-1 bg-white rounded-full" />
            <div className="absolute top-32 left-1/2 w-2 h-2 bg-white rounded-full" />
            <div className="absolute top-24 right-40 w-1.5 h-1.5 bg-white rounded-full" />
            <div className="absolute bottom-40 right-24 w-1 h-1 bg-white rounded-full" />
          </motion.div>

          <div className="grid lg:grid-cols-2 items-center h-full">
            <div className="relative p-10 lg:p-16 flex justify-center lg:justify-start">
              <div className="relative w-[320px] h-[320px]">
                
                {/* Parallax Layer: Moon Halo (Glow) */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-[#F3E5DF] blur-3xl opacity-20" 
                  style={{ x: moonHaloX, y: moonHaloY }}
                />

                {/* Parallax Layer: Sabit Bulan SVG Baru */}
                <motion.div 
                  className="absolute inset-0"
                  style={{ x: moonBaseX, y: moonBaseY }}
                >
                  <div className="w-full h-full p-4 -rotate-12">
                    <RealisticMoon />
                  </div>
                </motion.div>

                {/* Parallax Layer: Bunga/Logo */}
                <motion.div 
                  className="absolute top-16 left-24 z-10"
                  style={{ x: flowerX, y: flowerY }}
                >
                  <Image
                    src="/logo/icon.png"
                    alt="flower"
                    width={180}
                    height={180}
                    className="pointer-events-none drop-shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>

            {/* Right Side */}
            <div className="relative p-10 lg:p-16 z-20">
              <h2 className="font-serif text-5xl lg:text-6xl leading-tight mb-6 text-white">
                The Voice of
                <br />
                Silent Nights
              </h2>

              <p className="leading-relaxed max-w-lg mb-8 text-white/90">
                Like a wildflower swaying in the night breeze. <br/>
                A quiet place to sing in solitude.
              </p>
              <p className="text-[12px] text-slate-400 leading-relaxed max-w-lg mb-8">
                Seperti bunga liar yang berdesir dihembus angin malam. Sebuah tempat yang tenang untuk menyanyi dan memaknai lagu dalam kesendirian.
              </p>

              <div className="flex flex-wrap gap-4 relative z-10">
                <Link href="/music" className="px-8 py-4 rounded-xl border border-white/20 text-white hover:bg-white/10 transition">
                  Explore
                </Link>
              </div>
            </div>
          </div>

          {/* <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" /> */}
        </div>
      </div>
    </section>
  )
}