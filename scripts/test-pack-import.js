import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getYouTubeVideoId } from '../src/lib/stream.ts'

function parseImportPack(raw) {
  if (!raw || typeof raw !== 'object') return { items: [], errors: ['Payload must be a JSON object.'] }
  const pack = raw
  if (pack.schemaVersion !== 2) return { items: [], errors: ['Unsupported schemaVersion. Only schemaVersion 2 is supported.'] }
  if (!Array.isArray(pack.lyrics)) return { items: [], errors: ['Field "lyrics" must be an array.'] }
  const items = []
  const errors = []
  const seen = new Set()
  pack.lyrics.forEach((entry, index) => {
    const label = `Item #${index + 1}`
    const item = entry
    const videoId = typeof item?.videoId === 'string' ? getYouTubeVideoId(item.videoId) : null
    if (!videoId) return errors.push(`${label}: Invalid or missing videoId.`)
    if (seen.has(videoId)) return errors.push(`${label}: Duplicate videoId (${videoId}) within pack skipped.`)
    seen.add(videoId)
    items.push({ videoId, title: item.trackName, artist: item.artistName, lyricsData: { schemaVersion: 2, lyrics: [item] } })
  })
  return { items, errors }
}

const exampleRaw = JSON.parse(readFileSync('./public/assets/plan/lyrics-pack-example.json', 'utf8'))
const validResult = parseImportPack(exampleRaw)
assert.equal(validResult.errors.length, 0)
assert.equal(validResult.items.length, 1)
assert.equal(validResult.items[0].videoId, '-VKIqrvVOpo')
assert.equal(validResult.items[0].artist, 'ヨルシカ')
assert.equal(validResult.items[0].title, 'ただ君に晴れ')
assert.equal(validResult.items[0].lyricsData.schemaVersion, 2)

const badSchema = parseImportPack({ schemaVersion: 1, lyrics: [] })
assert.equal(badSchema.items.length, 0)
assert.match(badSchema.errors[0], /Unsupported schemaVersion/)

const duplicatePack = {
  schemaVersion: 2,
  lyrics: [
    { videoId: '-VKIqrvVOpo', lrclibUrl: 'https://lrclib.net/tracks/1', trackName: 'Song A', artistName: 'Artist', syncedLyrics: '[00:00.00] Line' },
    { videoId: '-VKIqrvVOpo', lrclibUrl: 'https://lrclib.net/tracks/2', trackName: 'Song B', artistName: 'Artist', syncedLyrics: '[00:00.00] Line' },
  ],
}
const dupResult = parseImportPack(duplicatePack)
assert.equal(dupResult.items.length, 1)
assert.match(dupResult.errors[0], /Duplicate videoId/)

console.log('lyrics pack import checks passed')