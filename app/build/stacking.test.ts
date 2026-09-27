/**
 * Stacking contract (W-L1 §2.7): the stage column and every ancestor of the sticky stage box must not
 * create a stacking context or a scroll container, or the labels vanish under the fixed canvas / sticky
 * breaks. A CSS grep over the app's stylesheets for the protected selectors. (Playwright adds the
 * `elementsFromPoint` probe in W1.)
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// overlay.css (D) is loaded from main.tsx next to story.css since Round 3 (D2), so it is part of the contract too
// the 709 sheets too (theme-cryostat.css in the entry, course709.css with the 709 pages): a rule there on a protected
// selector would break a 709 chapter's stage exactly as it would 448's
const SHEET_PATHS = ['../src/index.css', '../src/app.css', '../src/stage/story.css', '../src/stage/overlay.css', '../src/styles/theme-cryostat.css', '../src/styles/course709.css']
const read = (p: string) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8')
const SHEETS: string[] = SHEET_PATHS.map(read)
const PROTECTED = ['main', '.lecture', '.lecture-layout', '.lecture-body', '.unit', '.unit-story', '.story', '.story-stage-col', 'body', 'html', '#root', '.wb']
const FORBIDDEN = [
  /(^|;|\s)transform\s*:/,
  /(^|;|\s)filter\s*:/,
  /(^|;|\s)backdrop-filter\s*:/,
  /(^|;|\s)opacity\s*:\s*0?\.\d/,
  /(^|;|\s)isolation\s*:\s*isolate/,
  /(^|;|\s)contain\s*:\s*(paint|layout|strict|content)/,
  /(^|;|\s)will-change\s*:/,
  /(^|;|\s)overflow(-y)?\s*:\s*(hidden|auto|scroll|clip)/,
]

/** Rules whose selector list contains exactly one of the protected selectors (no descendants). */
function rulesFor(sel: string): string[] {
  const out: string[] = []
  for (const css of SHEETS) {
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
    for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selectors = m[1].split(',').map((s) => s.trim())
      if (selectors.includes(sel)) out.push(m[2])
    }
  }
  return out
}

describe('stacking contract (CSS grep)', () => {
  it.each(PROTECTED)('%s uses none of the forbidden properties', (sel) => {
    for (const body of rulesFor(sel))
      for (const re of FORBIDDEN) {
        // body { overflow-x: hidden } is propagated to the viewport (not a scroll container): allowed
        if (sel === 'body' && /overflow-x\s*:\s*hidden/.test(body) && re.source.includes('overflow')) continue
        expect(re.test(body), `${sel} { ${body.trim()} } matches ${re}`).toBe(false)
      }
  })

  it('the sticky stage box sits above the canvas (z 2 > z 1) and the column backing is non-positioned', () => {
    const box = rulesFor('.story-stage').join(';')
    expect(box).toMatch(/position\s*:\s*sticky/)
    expect(box).toMatch(/z-index\s*:\s*2/)
    expect(rulesFor('.story-stage-col').join(';')).not.toMatch(/position\s*:/)
  })
})

describe('overlay label class (interface change D3)', () => {
  it('every rule that styles .stage-label is scoped to the stage (.stage-overlay / .story-stage): no v1 unit heading leaks in', () => {
    const unscoped: string[] = []
    SHEET_PATHS.forEach((path, i) => {
      const clean = SHEETS[i].replace(/\/\*[\s\S]*?\*\//g, '')
      for (const m of clean.matchAll(/([^{}]+)\{[^{}]*\}/g))
        for (const sel of m[1].split(',').map((x) => x.trim()))
          if (/\.stage-label\b/.test(sel) && !/(^|\s)(\.stage-overlay|\.story-stage)\s(.*\s)?\.stage-label\b/.test(sel)) unscoped.push(`${path}: ${sel}`)
    })
    expect(unscoped).toEqual([])
  })

  it('main.tsx loads overlay.css right after story.css (D2)', () => {
    const main = read('../src/main.tsx')
    const story = main.indexOf("import './stage/story.css'")
    const overlay = main.indexOf("import './stage/overlay.css'")
    expect(story).toBeGreaterThan(0)
    expect(overlay).toBeGreaterThan(story)
    expect(main.slice(story, overlay).split('\n').filter((l) => l.startsWith('import')).length).toBe(1)
  })
})
