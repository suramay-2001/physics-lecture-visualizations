/**
 * Decor clip media contract (components/DecorVideo.tsx; skills/14-decor-clip/SKILL.md): every clip under
 * app/public/decor/**\/*.mp4 carries no audio track (a decor clip is silent atmosphere; a stray audio track would
 * still cost bytes even muted) and has a matching poster, and every file stays under the shared 1.5 MB budget.
 * Audio-track absence is checked the direct way, on the file's own bytes: an MP4/ISO-BMFF file lists one `hdlr`
 * box per track (moov > trak > mdia > hdlr), whose 4-byte handler_type is 'vide' for a video track and 'soun' for
 * an audio one — so "no audio track" is exactly "no hdlr box says 'soun'".
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path, walk } from '../security/node'

const DECOR_DIR = path.join(APP_DIR, 'public/decor')
const CLIPS = walk(DECOR_DIR, (f) => f.endsWith('.mp4'))
const MAX_BYTES = 1_500_000

/** Box types that are plain containers (their whole body is more boxes, no extra header fields first). */
const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'udta', 'edts'])

/** Every `hdlr` box's 4-char handler_type ('vide', 'soun', …), found by walking the file's box tree. */
function handlerTypes(buf: Uint8Array): string[] {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const text = (o: number, n: number) => String.fromCharCode(...buf.subarray(o, o + n))
  const out: string[] = []
  const walkBoxes = (start: number, end: number) => {
    let p = start
    while (p + 8 <= end) {
      const size32 = view.getUint32(p)
      const type = text(p + 4, 4)
      let headerLen = 8
      let size = size32
      if (size32 === 1) {
        // 64-bit size: next 8 bytes (files this small never need it, but a real muxer could emit one)
        size = view.getUint32(p + 8) * 2 ** 32 + view.getUint32(p + 12)
        headerLen = 16
      } else if (size32 === 0) {
        size = end - p // box runs to the end of its parent
      }
      if (size < headerLen || p + size > end) break // malformed or truncated: stop rather than loop forever
      if (type === 'hdlr') out.push(text(p + headerLen + 8, 4)) // version+flags(4) + pre_defined(4), then handler_type
      else if (CONTAINERS.has(type)) walkBoxes(p + headerLen, p + size)
      p += size
    }
  }
  walkBoxes(0, buf.length)
  return out
}

describe.skipIf(CLIPS.length === 0)('decor clip media contract (app/public/decor)', () => {
  it('found at least the three plate loops', () => {
    expect(CLIPS.length).toBeGreaterThanOrEqual(3)
  })

  it.each(CLIPS.map((f) => path.relative(APP_DIR, f)))('%s: no audio track (no hdlr "soun")', (rel) => {
    const types = handlerTypes(fs.readFileSync(path.join(APP_DIR, rel)))
    expect(types).not.toContain('soun')
    expect(types).toContain('vide') // sanity: the scan found the video track, so it measured something
  })

  it.each(CLIPS.map((f) => path.relative(APP_DIR, f)))('%s: under the 1.5 MB budget, with a matching poster', (rel) => {
    const f = path.join(APP_DIR, rel)
    expect(fs.statSync(f).size).toBeLessThanOrEqual(MAX_BYTES)
    expect(fs.existsSync(f.replace(/\.mp4$/, '.webp'))).toBe(true)
  })
})
