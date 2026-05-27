function parseLRC(lrcContent) {
  const lines = lrcContent.split(/\r?\n/)
  const result = []
  const timeTagRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g
  for (const line of lines) {
    let match
    const tags = []
    while ((match = timeTagRegex.exec(line)) !== null) {
      const min = parseInt(match[1], 10)
      const sec = parseInt(match[2], 10)
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0
      const time = min * 60 + sec + ms / 1000
      tags.push(time)
    }
    const text = line.replace(timeTagRegex, '').trim()
    for (const t of tags) {
      result.push({ startTime: t, text })
    }
  }
  result.sort((a, b) => a.startTime - b.startTime)
  for (let i = 0; i < result.length; i++) {
    result[i].endTime = i < result.length - 1 ? result[i + 1].startTime : result[i].startTime + 10
  }
  return result
}

function assTimeToSeconds(t) {
  const m = t.match(/(\d+):(\d{2}):(\d{2})\.(\d{1,2})/)
  if (!m) return 0
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const sec = parseInt(m[3], 10)
  const cs = parseInt(m[4].padEnd(2, '0'), 10)
  return h * 3600 + min * 60 + sec + cs / 100
}

function parseASS(assContent) {
  const lines = assContent.split(/\r?\n/)
  const eventsIndex = lines.findIndex((l) => l.trim().toLowerCase().startsWith('[events]'))
  if (eventsIndex === -1) return []
  const afterEvents = lines.slice(eventsIndex + 1)
  const formatLine = afterEvents.find((l) => l.trim().toLowerCase().startsWith('format:'))
  if (!formatLine) return []
  const fields = formatLine.replace(/format:/i, '').split(',').map(f => f.trim().toLowerCase())
  const startIdx = fields.indexOf('start')
  const endIdx = fields.indexOf('end')
  const textIdx = fields.indexOf('text')
  if (startIdx === -1 || textIdx === -1) return []
  const result = []
  for (const rawLine of afterEvents) {
    const line = rawLine.trim()
    if (!line.toLowerCase().startsWith('dialogue:')) continue
    const withoutPrefix = line.replace(/dialogue:/i, '')
    const parts = withoutPrefix.split(',')
    const start = parts[startIdx]?.trim()
    const end = endIdx !== -1 ? parts[endIdx]?.trim() : undefined
    const text = parts.slice(textIdx).join(',').trim()
    const startTime = assTimeToSeconds(start)
    const endTime = end ? assTimeToSeconds(end) : undefined
    result.push({ startTime, endTime, text })
  }
  result.sort((a, b) => a.startTime - b.startTime)
  return result
}

const sampleLRC = `[00:12.00]Line one\n[00:15.50]Line two\n[00:20.00]Line three`
const sampleASS = `[Script Info]\n; This is a test\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:12.00,0:00:15.50,Default,,0,0,0,,Line one\nDialogue: 0,0:00:15.50,0:00:20.00,Default,,0,0,0,,Line two\nDialogue: 0,0:00:20.00,0:00:25.00,Default,,0,0,0,,Line three`

console.log('Parsing sample LRC...')
console.log(parseLRC(sampleLRC))
console.log('\nParsing sample ASS...')
console.log(parseASS(sampleASS))
