/**
 * paths.ts is the one place in-app URLs are built (W-709-platform §A "Routes"): 448's URLs stay exactly as they were,
 * 709's live under /709, and no page hard-codes a chapter URL any more.
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path } from './security/node'
import { courseOfHash, courseOfPath, coursePath, gamePath, lecturePath } from './paths'

describe('paths', () => {
  it('448 keeps its canonical URLs', () => {
    expect(coursePath('sl448')).toBe('/')
    expect(coursePath('sl448', 'map')).toBe('/map')
    expect(coursePath('sl448', 'arcade', 'arcade-L1')).toBe('/arcade#arcade-L1')
    expect(coursePath('sl448', 'formulas')).toBe('/formulas')
    expect(coursePath('sl448', 'help')).toBe('/help')
    expect(lecturePath('L3')).toBe('/lecture/L3')
    expect(lecturePath('L1', 'l1-sequential')).toBe('/lecture/L1#l1-sequential')
    expect(gamePath('sl448', 'bloch-golf')).toBe('/arcade/bloch-golf')
  })
  it('709 lives under /709 (chapters Q and F at /709/ch/:id)', () => {
    expect(coursePath('qc709')).toBe('/709')
    expect(coursePath('qc709', 'map')).toBe('/709/map')
    expect(coursePath('qc709', 'formulas', 'formulas-Q4')).toBe('/709/formulas#formulas-Q4')
    expect(lecturePath('Q3')).toBe('/709/ch/Q3')
    expect(lecturePath('F2', 'f2-inner')).toBe('/709/ch/F2#f2-inner')
    expect(gamePath('qc709', 'qc-chsh')).toBe('/709/arcade/qc-chsh')
  })
  it.each([
    ['/', 'sl448'],
    ['/lecture/L3', 'sl448'],
    ['/map', 'sl448'],
    ['/7090', 'sl448'],
    ['/448/lecture/L2', 'sl448'],
    ['/709', 'qc709'],
    ['/709/', 'qc709'],
    ['/709/ch/Q3', 'qc709'],
    ['/709/map', 'qc709'],
  ] as const)('courseOfPath(%s) = %s', (p, c) => expect(courseOfPath(p)).toBe(c))
  it('courseOfHash reads the router path out of location.hash (query and inner anchor ignored)', () => {
    expect(courseOfHash('')).toBe('sl448')
    expect(courseOfHash('#/')).toBe('sl448')
    expect(courseOfHash('#/lecture/L1#l1-quantized')).toBe('sl448')
    expect(courseOfHash('#/709')).toBe('qc709')
    expect(courseOfHash('#/709/ch/Q3#q3-bloch')).toBe('qc709')
    expect(courseOfHash('#/709?x=1')).toBe('qc709')
  })
})

describe('no hard-coded chapter URLs outside paths.ts', () => {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) files.push(p)
    }
  }
  walk(path.join(APP_DIR, 'src'))
  it('every link to a chapter goes through lecturePath', () => {
    expect(files.length).toBeGreaterThan(50)
    const hits: string[] = []
    for (const f of files) {
      if (f.endsWith(`${path.sep}paths.ts`)) continue
      const text = fs.readFileSync(f, 'utf8')
      // a string or template that builds a chapter URL: `/lecture/${…}`, '/709/ch/…', "/lecture/L3" (route patterns
      // such as "/lecture/:id" are not links)
      for (const m of text.matchAll(/[`'"]\/(?:lecture|709\/ch)\/(?!:)[^`'"]*/g)) hits.push(`${path.relative(APP_DIR, f)}: ${m[0]}`)
    }
    expect(hits).toEqual([])
  })
})
