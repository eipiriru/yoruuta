export type LyricsPack = {
  schemaVersion: number
  exportedAt?: string
  lyrics: Array<{
    key?: string
    videoId: string
    trackName?: string
    artistName?: string
    lrclibId?: number | null
    lrclibUrl: string
    syncedLyrics?: string | null
    plainLyrics?: string | null
    romajiLyrics?: string | null
    translations?: Record<string, string[]> | null
    translateLang?: string | null
    offset?: number
    type: 'synced' | 'plain'
  }>
}

export type Stream = {
  id: string
  video_id: string
  lrclib_url: string
  title: string
  artist: string
  lyrics_data: LyricsPack
  created_at: string
}

export function getYouTubeVideoId(value: string) {
  const input = value.trim()
  if (/^[\w-]{11}$/.test(input)) return input

  try {
    const url = new URL(input)
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtu.be'].includes(url.hostname)) return null
    const videoId = url.hostname === 'youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/)?.[1]
    return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : null
  } catch {
    return null
  }
}

export function getLrclibId(value: string) {
  const match = value.trim().match(/^https:\/\/lrclib\.net\/tracks\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
}

export function getActiveLyricIndex(syncedLyrics: string | null | undefined, currentTime: number, offset = 0) {
  if (!syncedLyrics) return -1
  const entries = syncedLyrics.split(/\r?\n/).flatMap((line, index) => {
    const match = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/)
    if (!match) return []
    const milliseconds = Number((match[3] ?? '0').padEnd(3, '0'))
    return [{ index, time: Number(match[1]) * 60 + Number(match[2]) + milliseconds / 1000 + offset }]
  })

  let activeIndex = -1
  for (const entry of entries) {
    if (currentTime >= entry.time) activeIndex = entry.index
    else break
  }
  return activeIndex
}