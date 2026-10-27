import assert from 'node:assert/strict'

const getYouTubeVideoId = (value) => {
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

assert.equal(getYouTubeVideoId('https://www.youtube.com/watch?v=-VKIqrvVOpo'), '-VKIqrvVOpo')
assert.equal(getYouTubeVideoId('https://youtu.be/-VKIqrvVOpo'), '-VKIqrvVOpo')
assert.equal(getYouTubeVideoId('https://evil.example/watch?v=-VKIqrvVOpo'), null)
assert.equal(getYouTubeVideoId('invalid'), null)
console.log('stream utility checks passed')