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
    <div>
      <audio ref={audioRef} controls src={audioUrl} className="w-full rounded-md" />
      <div className="mt-4 max-h-100 overflow-auto space-y-1 bg-muted-foreground">
        {lyrics && lyrics.length > 0 ? (
          lyrics.map((line, i) => (
            <div
              key={i}
              id={`lyric-${i}`}
              className={`px-3 py-1 transition-colors duration-150 ${i === currentIndex ? 'bg-yellow-300 text-black font-semibold' : 'text-gray-600'}`}
            >
              {line.text}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No lyrics available</p>
        )}
      </div>
    </div>
  )
}
