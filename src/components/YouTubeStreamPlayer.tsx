'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getActiveLyricIndex, type LyricsPack } from '@/lib/stream'

declare global {
  interface Window {
    YT?: { Player?: new (element: HTMLElement, options: Record<string, unknown>) => YouTubePlayer; PlayerState?: { PLAYING: number } }
    onYouTubeIframeAPIReady?: () => void
  }
}

type YouTubePlayer = { getCurrentTime: () => number; destroy: () => void }

type PlayerConfig = {
  showOriginal: boolean
  showRomaji: boolean
  showTranslation: boolean
  fontSize: number
  activeColor: string
  inactiveColor: string
  spacing: number
  offset: number
}

const DEFAULT_CONFIG: PlayerConfig = {
  showOriginal: true,
  showRomaji: true,
  showTranslation: true,
  fontSize: 16,
  activeColor: '#38bdf8',
  inactiveColor: '#64748b',
  spacing: 20,
  offset: 0,
}

export default function YouTubeStreamPlayer({ videoId, pack }: { videoId: string; pack: LyricsPack }) {
    const [config, setConfig] = useState<PlayerConfig>(DEFAULT_CONFIG)
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
      try {
        const raw = localStorage.getItem('yoruuta_karaoke_config')
        if (raw) setConfig((previous) => ({ ...previous, ...JSON.parse(raw) }))
      } catch {}
    }, [])

    const updateConfig = (patch: Partial<PlayerConfig>) => {
      setConfig((previous) => {
        const next = { ...previous, ...patch }
        localStorage.setItem('yoruuta_karaoke_config', JSON.stringify(next))
        return next
      })
    }
  const playerRef = useRef<YouTubePlayer | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lineRefs = useRef<Array<HTMLDivElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const track = pack.lyrics?.[0]
  const lines = track?.syncedLyrics?.split(/\r?\n/).flatMap((line, index) => {
    const match = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)$/)
    if (!match) return []
    const start = Number(match[1]) * 60 + Number(match[2]) + Number((match[3] ?? '0').padEnd(3, '0')) / 1000
    return [{ index, start, text: match[4].trim() }]
  }) ?? []

  const sync = useCallback(() => {
    if (!playerRef.current || !track) return
    const effectiveOffset = (track.offset ?? 0) + config.offset
    setActiveIndex(getActiveLyricIndex(track.syncedLyrics, playerRef.current.getCurrentTime(), effectiveOffset))
  }, [config.offset, track])

  useEffect(() => {
    let active = true
    const createPlayer = () => {
      const Player = window.YT?.Player
      const host = document.getElementById('youtube-stream-player')
      if (!active || !Player || !host || playerRef.current) return

      playerRef.current = new Player(host, {
        videoId,
        playerVars: { playsinline: 1, origin: window.location.origin },
        events: {
          onReady: sync,
          onStateChange: (event: { data: number }) => {
            if (timerRef.current) clearInterval(timerRef.current)
            timerRef.current = event.data === window.YT?.PlayerState?.PLAYING ? setInterval(sync, 250) : null
            sync()
          },
        },
      })
    }

    if (window.YT?.Player) {
      createPlayer()
    } else {
      const previousReady = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.()
        createPlayer()
      }
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.async = true
        script.onerror = () => console.error('Failed to load YouTube IFrame API.')
        document.head.appendChild(script)
      }
    }

    return () => {
      active = false
      if (timerRef.current) clearInterval(timerRef.current)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [sync, videoId])

  useEffect(() => {
    if (activeIndex >= 0) lineRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  return <>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="aspect-video overflow-hidden rounded-xl bg-black"><div id="youtube-stream-player" className="h-full w-full" /></div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm">
          <div className="flex items-center gap-2">
            <button className="rounded border border-slate-700 px-2 py-1" onClick={() => updateConfig({ offset: Number((config.offset - 0.1).toFixed(1)) })}>-0.1s</button>
            <button className="rounded border border-slate-700 px-2 py-1" onClick={() => updateConfig({ offset: 0 })}>Reset ({config.offset >= 0 ? `+${config.offset}` : config.offset}s)</button>
            <button className="rounded border border-slate-700 px-2 py-1" onClick={() => updateConfig({ offset: Number((config.offset + 0.1).toFixed(1)) })}>+0.1s</button>
          </div>
          <button className="rounded border border-slate-700 px-3 py-1 text-slate-200" onClick={() => setDrawerOpen(!drawerOpen)}>⚙️ Pengaturan UI</button>
        </div>
        {drawerOpen && <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300">
          <div className="flex gap-4">
            <label className="flex items-center gap-1"><input type="checkbox" checked={config.showOriginal} onChange={(e) => updateConfig({ showOriginal: e.target.checked })} /> Asli</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={config.showRomaji} onChange={(e) => updateConfig({ showRomaji: e.target.checked })} /> Romaji</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={config.showTranslation} onChange={(e) => updateConfig({ showTranslation: e.target.checked })} /> Terjemahan</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">Ukuran Font ({config.fontSize}px)<input type="range" min="14" max="28" value={config.fontSize} onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })} className="w-full" /></label>
            <label className="block">Jarak Baris ({config.spacing}px)<input type="range" min="8" max="36" value={config.spacing} onChange={(e) => updateConfig({ spacing: Number(e.target.value) })} className="w-full" /></label>
            <label className="block">Warna Aktif<input type="color" value={config.activeColor} onChange={(e) => updateConfig({ activeColor: e.target.value })} className="mt-1 block h-8 w-full rounded border border-slate-700 bg-transparent" /></label>
            <label className="block">Warna Pasif<input type="color" value={config.inactiveColor} onChange={(e) => updateConfig({ inactiveColor: e.target.value })} className="mt-1 block h-8 w-full rounded border border-slate-700 bg-transparent" /></label>
          </div>
        </div>}
      </div>
      <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-950/60 p-5 text-center" aria-live="polite">
        {lines.length ? lines.map((line) => {
          const active = line.index === activeIndex
          const romaji = track?.romajiLyrics?.split(/\r?\n/)[line.index]?.replace(/^\[[^\]]+\]/, '').trim()
          const translation = track?.translations?.[track.translateLang || 'id']?.[line.index]
          return <div key={line.index} ref={(element) => { lineRefs.current[line.index] = element }} style={{ margin: `${config.spacing}px 0`, color: active ? config.activeColor : config.inactiveColor, fontSize: `${active ? config.fontSize + 4 : config.fontSize}px` }} className={`rounded-lg px-3 py-2 transition-all ${active ? 'font-bold' : 'font-normal'}`}>
            {config.showOriginal && line.text && <span className="block">{line.text}</span>}
            {config.showRomaji && romaji && <span className="mt-1 block text-sky-300 italic">{romaji}</span>}
            {config.showTranslation && translation && <span className="mt-1 block text-emerald-300 text-sm italic">{translation}</span>}
          </div>
        }) : <p className="py-10 text-slate-400">Synchronized lyrics unavailable.</p>}
      </div>
    </div>
  </>
}