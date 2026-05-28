"use client"

import React, { useEffect, useRef, useState } from 'react'
import type { LyricLine } from '@/lib/lyricsParser'

type Props = { audioUrl: string; lyrics: LyricLine[] }

export default function KaraokePlayer({ audioUrl, lyrics }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !lyrics || lyrics.length === 0) return

    const tick = () => {
      const t = audio.currentTime
      let idx = lyrics.findIndex((l) => t >= l.startTime && (l.endTime ? t < l.endTime : true))
      if (idx === -1) {
        if (t < lyrics[0].startTime) idx = 0
        else idx = lyrics.length - 1
      }
      setCurrentIndex(idx)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [lyrics])

  useEffect(() => {
    const el = document.getElementById(`lyric-${currentIndex}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentIndex])

  return (
    <div className="flex flex-col gap-4">
      {/* Trik style={{ colorScheme: 'dark' }} akan mengubah audio player bawaan menjadi gelap */}
      <audio 
        ref={audioRef} 
        controls 
        src={audioUrl} 
        className="w-full outline-none opacity-90 hover:opacity-100 transition-opacity"
        style={{ colorScheme: 'dark' }} 
      />

      <div className="mt-2 max-h-125 overflow-y-auto space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800 scroll-smooth">
        {lyrics && lyrics.length > 0 ? (
          lyrics.map((line, i) => (
            <div
              key={i}
              id={`lyric-${i}`}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                i === currentIndex 
                  ? 'bg-slate-800 text-rose-400 font-medium scale-[1.02] shadow-sm border border-slate-700/50' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {line.text}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center py-10">
            <p className="text-sm text-slate-500 italic">There are no lyrics available for this wind yet</p>
          </div>
        )}
      </div>

    </div>
  )
}
