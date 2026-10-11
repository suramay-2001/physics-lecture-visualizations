/**
 * The rendered frames each opener's player fetches (public/<dir>/0000.webp … 0119.webp and poster.webp): all there, every one a
 * 1080 × 1350 lossy WebP, no local path inside, and the size budget (decision D §5.3: the frames are static assets, so the budget is
 * bytes on the wire: an average per frame and a total per opener).
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path } from '../security/node'
import { OPENERS, frameFile, type OpenerSpec } from './openerCopy'

const PUBLIC = path.join(APP_DIR, 'public')
const AVG_KB_PER_FRAME = 40
const TOTAL_MB = 6

/** width and height of a lossy WebP ('VP8 ' chunk): 14 bits each, little-endian, at bytes 26 and 28 */
function webpSize(buf: Uint8Array): { kind: string; w: number; h: number } {
  const ascii = (a: number, b: number) => String.fromCharCode(...buf.slice(a, b))
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  return { kind: `${ascii(0, 4)}/${ascii(8, 12)}/${ascii(12, 16)}`, w: dv.getUint16(26, true) & 0x3fff, h: dv.getUint16(28, true) & 0x3fff }
}

describe.each(Object.values(OPENERS) as OpenerSpec[])('opener frames: $name', (spec) => {
  const files = [...Array.from({ length: spec.frames }, (_, f) => frameFile(f)), spec.poster]
  const at = (file: string) => path.join(PUBLIC, spec.dir, file)
  const read = (file: string) => fs.readFileSync(at(file))

  it('has every frame and its poster', () => {
    for (const f of files) expect(fs.existsSync(at(f)), f).toBe(true)
  })
  it('every file is a 1080 × 1350 lossy WebP carrying no local path', () => {
    for (const f of files) {
      const buf = read(f)
      expect(webpSize(buf), f).toEqual({ kind: 'RIFF/WEBP/VP8 ', w: 1080, h: 1350 })
      expect(new TextDecoder('latin1').decode(buf).includes('/Users/'), f).toBe(false)
    }
  })
  it(`stays within ${AVG_KB_PER_FRAME} KB a frame on average and ${TOTAL_MB} MB in all`, () => {
    const sizes = files.slice(0, spec.frames).map((f) => read(f).length)
    const total = sizes.reduce((s, n) => s + n, 0)
    expect(total / spec.frames / 1024).toBeLessThan(AVG_KB_PER_FRAME)
    expect(total / 1024 / 1024).toBeLessThan(TOTAL_MB)
  })
})
