/**
 * The independent P truth review of the SG bench (docs/roles/audits/P-sg-review.md, 2026-09-28, with the judge's
 * ruling): one test per blocking and should-fix item, named `review #N`, that pins the reviewed defect's absence; the
 * nits (#10–#14) where a file can show them. What only the page can show (#3 the inset camera, #5 the scene's contrast,
 * #4 and #12 on the narrow page) is in e2e/lab.spec.ts under the same names.
 */
import { describe, expect, it } from 'vitest'
import { LECTURE_META } from '../../../content/meta'
import { texSpans } from '../../../content/walk'
import { axisVector } from '../../../physics/sg'
import { rng } from '../../../physics/random'
import { APP_DIR, fs, path } from '../../../security/node'
import { stageCssVars } from '../../../stage/tokens'
import { SG_FIDELITY } from './fidelity'
import {
  CAPTION,
  chainText,
  count,
  emptyCounts,
  fractionScatter,
  MIXTURE_UNIT,
  OFF_GRID_PRESETS,
  pct1,
  plateCaption,
  PRESET_ORDER,
  previousOf,
  ptText,
  readoutsOf,
  seedOf,
  SETUPS,
  sourceNote,
  SOURCES,
  sourceText,
  stopLines,
  theoryOf,
  TRY_THIS,
  tryThisAnswer,
  volleyOf,
  type SgSetup,
} from './model'
import { plateSpotsSvg, sourceTone } from './plate'

const NBSP = ' '
const NNBSP = ' '
const read = (rel: string) => fs.readFileSync(path.join(APP_DIR, rel), 'utf8')
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

/** Random setups: every source, 1–4 magnets, tilts anywhere in [0, 360), both kept signs. */
function randomSetups(n: number, seed = 17): SgSetup[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => {
    const m = 1 + Math.floor(r() * 4)
    const tilts = Array.from({ length: m }, () => Math.floor(r() * 360))
    const keep = Array.from({ length: m - 1 }, () => (r() < 0.5 ? '+' : '-') as '+' | '-')
    return { source: SOURCES[Math.floor(r() * SOURCES.length)], tilts, keep }
  })
}
const ro = (s: SgSetup, c = emptyCounts(s.tilts.length)) => Object.fromEntries(readoutsOf(s, c).map((r) => [r.key, r.text]))

/* ---------------- WCAG contrast from the stylesheets' own tokens ---------------- */
type Rgb = [number, number, number]
const hexRgb = (h: string): Rgb => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
const rgbaOf = (v: string): { c: Rgb; a: number } => {
  const m = /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/.exec(v)
  if (m) return { c: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] }
  if (/^#[0-9a-f]{6}$/i.test(v)) return { c: hexRgb(v), a: 1 }
  throw new Error(`not a colour: ${v}`)
}
/** A translucent backing over a ground (sRGB compositing, as the browser does). */
const over = (top: string, ground: Rgb): Rgb => {
  const { c, a } = rgbaOf(top)
  return c.map((x, i) => a * x + (1 - a) * ground[i]) as Rgb
}
const lum = (c: Rgb) => {
  const [r, g, b] = c.map((x) => x / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
/** Flat rules of a stylesheet: selector (one of a list) → declarations (later rules win). */
function rules(css: string): { sel: string[]; body: Record<string, string> }[] {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    sel: m[1].split(',').map((x) => x.trim().replace(/\s+/g, ' ')),
    body: Object.fromEntries([...m[2].matchAll(/([\w-]+)\s*:\s*([^;]+);?/g)].map((d) => [d[1], d[2].trim()])),
  }))
}
function decl(css: string, selector: string, prop: string): string {
  const hit = rules(css).filter((r) => r.sel.includes(selector) && r.body[prop] !== undefined)
  if (!hit.length) throw new Error(`no ${prop} for ${selector}`)
  return hit[hit.length - 1].body[prop]
}
const varName = (v: string) => /var\((--[\w-]+)/.exec(v)?.[1] ?? null
function schemeTokens(css: string, head: string): Record<string, string> {
  const at = css.indexOf(head)
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at))
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
}

describe('review #1: every SG readout colour reads ≥ 4.5 : 1 on its background', () => {
  const index = read('src/index.css')
  const lab = read('src/lab/lab.css')
  const overlay = read('src/stage/overlay.css')
  // the tones the SG model prints (readouts, over random setups and counts)
  const tones = new Set<string>()
  for (const s of randomSetups(60)) {
    for (const r of readoutsOf(s, emptyCounts(s.tilts.length))) tones.add(r.tone)
    for (const r of readoutsOf(s, volleyOf(s, 50, seedOf(1)).counts)) tones.add(r.tone)
  }
  it('the paper column (both schemes): each tone’s colour on the plate, the panel and plate-2; + uses --up-text', () => {
    expect([...tones].sort()).toEqual(['minus', 'plus', 'text'])
    expect(varName(decl(lab, ".lab-readout-list [data-paper-tone='plus']", 'color'))).toBe('--up-text')
    const bad: string[] = []
    const seen: string[] = []
    for (const [scheme, head] of [
      ['light', ':root {'],
      ['dark', ":root[data-theme='dark'] {"],
    ] as const) {
      const t = schemeTokens(index, head)
      // the sticky list's own background and the page's (body: --plate)
      expect(varName(decl(lab, '.lab-readout-list.lab-sticky', 'background'))).toBe('--plate')
      const texts: [string, string][] = [
        ...[...tones].map((tone): [string, string] => [`tone ${tone}`, varName(decl(lab, `.lab-readout-list [data-paper-tone='${tone}']`, 'color'))!]),
        ['the stops list', varName(decl(lab, '.lab-readout-list', 'color'))!],
        ['notes (.lab-small)', varName(decl(lab, '.lab-small', 'color'))!],
      ]
      for (const [what, v] of texts)
        for (const ground of ['--plate', '--plate-2', '--panel']) {
          const r = ratio(hexRgb(t[v]), hexRgb(t[ground]))
          seen.push(`${scheme} ${what} (${v}) on ${ground}: ${r.toFixed(2)}`)
          if (!(r >= 4.5)) bad.push(seen[seen.length - 1])
        }
      // the < 900 px plate picture's ± labels sit on its glass (silver 16 % into the plate)
      const glass = hexRgb(t['--plate']).map((x, i) => 0.84 * x + 0.16 * hexRgb(t['--silver'])[i]) as Rgb
      for (const sign of ['plus', 'minus']) {
        const v = varName(decl(lab, `.sg-plate-label[data-sign='${sign}']`, 'fill'))!
        const r = ratio(hexRgb(t[v]), glass)
        if (!(r >= 4.5)) bad.push(`${scheme} plate label ${sign} (${v}) on the glass: ${r.toFixed(2)}`)
      }
    }
    // hand value (the review): --up #c9820c on #e4eaee was 2.59 : 1; --up-text #804f00 reads 6.0 : 1
    expect(ratio(hexRgb('#c9820c'), hexRgb('#e4eaee'))).toBeCloseTo(2.59, 2)
    expect(bad).toEqual([])
  })
  it('the stage (readouts, labels, the inset tag): tone colours on their backings, over the worst case (white) and the stage', () => {
    const v = stageCssVars('lab-r3')
    const colourOf = (tone: string) => {
      const c = decl(overlay, `.stage-overlay [data-tone='${tone}']`, 'color')
      if (tone === 'text') return v['--stage-text']
      return v[varName(c)!]
    }
    const strong = decl(overlay, '.stage-overlay .stage-readout', 'background')
    const ov = (name: string) => decl(overlay, '.stage-overlay', name)
    const backing = { '--ov-backing': ov('--ov-backing'), '--ov-backing-strong': ov('--ov-backing-strong') } as Record<string, string>
    const grounds: Rgb[] = [[255, 255, 255], hexRgb(v['--stage-bg']), hexRgb(v['--stage-bg-inset'])]
    const bad: string[] = []
    const check = (what: string, fg: string, back: string) => {
      for (const g of grounds) {
        const r = ratio(hexRgb(fg), over(back, g))
        if (!(r >= 4.5)) bad.push(`${what} over rgb(${g.join(',')}): ${r.toFixed(2)}`)
      }
    }
    // readouts: every tone on the strong backing
    for (const tone of tones) check(`readout ${tone}`, colourOf(tone), backing[varName(strong)!])
    // labels: coloured ones on the strong backing, text on the plain one (overlay.css)
    for (const tone of ['plus', 'minus', 'silver']) check(`label ${tone}`, colourOf(tone), backing[varName(decl(overlay, `.stage-overlay .stage-label[data-tone='${tone}']`, 'background'))!])
    check('label text', colourOf('text'), backing[varName(decl(overlay, '.stage-overlay .stage-label', 'background'))!])
    // the inset's tag (lab.css)
    const tagBack = v[varName(decl(lab, '.sg-inset-tag', 'background'))!]
    check('inset tag', v[varName(decl(lab, '.sg-inset-tag', 'color'))!], tagBack)
    expect(bad).toEqual([])
  })
})

describe('review #2: the Born line is exact; the ± is the counted fraction’s expected scatter at this N', () => {
  it('no Born line carries a ±; the counted line gives √(p(1−p)/N) in points for each spot, “at N = …”', () => {
    for (const s of randomSetups(150, 5)) {
      const th = theoryOf(s)
      for (const n of [100, 1000, 10000]) {
        const c = volleyOf(s, n, seedOf(n)).counts
        const r = ro(s, c)
        expect(r['born-plus']).toBe(`+ spot · Born ${pct1(th.plus)}`)
        expect(r['born-minus']).toBe(`− spot · Born ${pct1(th.minus)}`)
        const [sp, sm] = [th.plus, th.minus].map((p) => ptText(fractionScatter(n, Math.abs(p) < 5e-13 ? 0 : Math.abs(1 - p) < 5e-13 ? 1 : p)!))
        const pm = (x: string) => `±${NBSP}${x}${NBSP}pt`
        const expectText = sp === sm ? pm(sp) : `${pm(sp)} and ${pm(sm)}`
        expect(r['counted'], chainText(s)).toBe(`counted: +${NBSP}${pct1(c.plus / n)} · −${NBSP}${pct1(c.minus / n)} · expect ${expectText} at N${NBSP}=${NBSP}${count(n)}`)
        expect(r['counted']).not.toMatch(/±\s0\.0\s/)
      }
    }
  })
  it('hand values: z → x → z at N = 1 000 expects ± 1.0 pt (√(⅛·⅞/1000) = 1.05 pt); two decimals below 0.1; never “0.0”', () => {
    const v = volleyOf(SETUPS['l1-zxz'], 1000, seedOf(0)).counts
    expect(ro(SETUPS['l1-zxz'], v)['counted']).toMatch(new RegExp(`expect ±${NBSP}1\\.0${NBSP}pt at N${NBSP}=${NBSP}1${NNBSP}000$`))
    expect(ptText(Math.sqrt((0.0038 * 0.9962) / 10000))).toBe('0.06')
    expect(ptText(0.00099)).toBe('0.10')
    expect(ptText(0.001)).toBe('0.1')
    expect(ptText(0)).toBe('0')
    expect(ptText(1e-7)).toBe(`<${NBSP}0.01`)
    for (let e = -9; e <= -1; e += 0.25) expect(ptText(10 ** e)).not.toMatch(/^0\.0$|^0\.00$/)
    // z then z keeping +: the − spot's Born fraction is exactly 0, so its scatter is exactly 0
    const zz = volleyOf(SETUPS['l1-zz'], 1000, seedOf(3)).counts
    expect(ro(SETUPS['l1-zz'], zz)['counted']).toMatch(new RegExp(`and ±${NBSP}0${NBSP}pt at`))
  })
  it('the fidelity note defines p where the scatter formula first appears', () => {
    const items = [...SG_FIDELITY.exact, ...SG_FIDELITY.schematic, ...SG_FIDELITY.misleading]
    const first = items.find((i) => i.text.includes('p(1-p)'))!
    expect(first.id).toBe('lab-sg-samples')
    expect(first.text).toMatch(/\$p\$ is the spot’s Born fraction/)
    expect(first.text).toMatch(/\$N\$ the number of atoms fired/)
    expect(first.text).toMatch(/percentage points \(pt\)/)
  })
})

describe('review #4: the < 900 px plate picture turns with the last magnet and names what its counts are of', () => {
  it('the + spot lies along the last magnet’s +n̂ (z up, x right, like the dials), the − spot opposite, at every tilt', () => {
    for (let t = 0; t < 360; t += 5) {
      const n = axisVector(t)
      const sp = plateSpotsSvg(t, 60, 60, 28)
      expect((sp.plus[0] - 60) / 28, `${t}°`).toBeCloseTo(n[0], 12)
      expect((sp.plus[1] - 60) / 28, `${t}°`).toBeCloseTo(-n[2], 12)
      expect(sp.minus[0] + sp.plus[0]).toBeCloseTo(120, 12)
      expect(sp.minus[1] + sp.plus[1]).toBeCloseTo(120, 12)
    }
    // the default bench ends on an x magnet: + to the right, − to the left
    const zx = plateSpotsSvg(90, 60, 60, 28)
    expect(zx.plus[0]).toBeGreaterThan(80)
    expect(zx.minus[0]).toBeLessThan(40)
  })
  it('its caption gives counts “of the N atoms fired”, with no bare %; the old picture (a fixed + above −) is gone', () => {
    const c = volleyOf(SETUPS['l1-zx'], 1000, seedOf(0)).counts
    expect(plateCaption(c)).toBe(`On the plate: +${NBSP}${count(c.plus)} and −${NBSP}${count(c.minus)} of the 1${NNBSP}000 atoms fired.`)
    expect(plateCaption(c)).not.toMatch(/%/)
    expect(plateCaption(emptyCounts(2))).toBe('Nothing fired yet.')
    const src = read('src/lab/benches/sg/SgBench.tsx')
    expect(src).not.toMatch(/ui\/primitives/)
    expect(src).toMatch(/<PlateFace tilt=\{p\.tilts\[n - 1\]\}/)
  })
})

describe('review #6: the colour note matches what the bench draws', () => {
  it('grey only for the oven’s atoms before a magnet; a sealed box sends its atoms out in its sign’s colour', () => {
    const note = SG_FIDELITY.schematic.find((i) => i.id === 'lab-sg-colour')!.text
    expect(note).not.toMatch(/grey before the first magnet/)
    expect(note).toMatch(/oven’s atoms are grey until they meet a magnet/)
    expect(note).toMatch(/sealed box’s atoms leave in the colour of their sign/)
    // what plate.ts gives the flight: 0 grey, 1 amber, 2 cobalt
    expect(sourceTone({ source: 'oven', tilts: [0], keep: [] })).toBe(0)
    expect(sourceTone({ source: '+y', tilts: [0], keep: [] })).toBe(1)
    expect(sourceTone({ source: '-y', tilts: [0], keep: [] })).toBe(2)
    for (const src of ['+z', '-z', '+x', '-x'] as const) expect(sourceTone({ source: src, tilts: [0], keep: [] })).toBe(0)
  })
})

describe('review #7: a |±y⟩ box counts exactly like the oven on this bench, and the notes say so', () => {
  it('every Born fraction and every stop of a |±y⟩ box equals the oven’s (300 random benches; the review’s |−y⟩ → 30° (+) → 200°)', () => {
    for (const s of randomSetups(300, 29)) {
      const oven = theoryOf({ ...s, source: 'oven' })
      for (const src of ['+y', '-y'] as const) {
        const y = theoryOf({ ...s, source: src })
        expect(y.plus, chainText(s)).toBeCloseTo(oven.plus, 12)
        expect(y.minus, chainText(s)).toBeCloseTo(oven.minus, 12)
        y.blocked.forEach((b, k) => expect(b).toBeCloseTo(oven.blocked[k], 12))
      }
    }
    const r = theoryOf({ source: '-y', tilts: [30, 200], keep: ['+'] })
    expect(r.plus).toBeCloseTo(0.0038, 4)
    expect(r.minus).toBeCloseTo(0.4962, 4)
  })
  it('the source note, the preset note and the fidelity note say it plainly and point to Lecture 6’s mixture unit', () => {
    const l6 = LECTURE_META.find((l) => l.id === 'L6')!
    const k = l6.units.findIndex((u) => u.id === 'l6-mixture')
    expect(k).toBeGreaterThanOrEqual(0)
    expect(MIXTURE_UNIT).toBe(`Unit${NBSP}${l6.number}.${k + 1}`)
    for (const text of [sourceNote('+y'), sourceNote('-y'), SETUPS['l2-plus-y'].note, SG_FIDELITY.misleading.find((i) => i.id === 'lab-sg-y-like-oven')!.text]) {
      expect(text).toMatch(/exactly the oven’s counts/)
      expect(text).toContain(MIXTURE_UNIT)
    }
    expect(sourceNote('+y')).toMatch(/x–z plane/)
    expect(sourceNote('oven')).not.toContain(MIXTURE_UNIT)
  })
})

/** Sentences of a note (TeX spans count as one word; bold marks dropped). */
const sentencesOf = (text: string) =>
  text
    .replace(/\$[^$]*\$/g, 'X')
    .replace(/\*\*/g, '')
    .split(/(?<=[.?!])\s+/)
    .filter((x) => x.trim())
const wordsOf = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

describe('review #8: the Try this asks about the number of atoms in the + spot, in short sentences, with no undefined ket', () => {
  it('asks how many atoms, not where the spot went; every sentence ≤ 25 words; no |+60°⟩', () => {
    expect(TRY_THIS).toMatch(/Why did the number of atoms in the \+ spot change\?$/)
    expect(TRY_THIS).not.toMatch(/Why did the \+ spot change/)
    for (const text of [TRY_THIS, tryThisAnswer()]) {
      for (const s of sentencesOf(text)) expect(wordsOf(s), s).toBeLessThanOrEqual(25)
      // a ket named by an angle is never used: the answer says "the + state along 60°" in words
      expect(text).not.toMatch(/\|[^⟩|]*°[^⟩]*⟩/)
    }
    expect(tryThisAnswer()).toMatch(/the \+ state along 60°/)
  })
})

describe('review #9: the homework guard is the judge’s rule (HW1 P2: no function, no plot against the tilt, no maximum)', () => {
  const zAxis = (t: number) => t % 180 === 0
  const xAxis = (t: number) => t % 180 === 90
  it('no preset tilt off the quarter turns unless a judge’s ruling lists it (the list is empty today)', () => {
    expect(OFF_GRID_PRESETS).toEqual([])
    for (const id of PRESET_ORDER) if (!OFF_GRID_PRESETS.includes(id)) for (const t of SETUPS[id].tilts) expect(t % 90, `${id}: ${t}°`).toBe(0)
  })
  it('the only preset with a 90° magnet between two z magnets is l1-zxz, Lecture 1’s own example (also with repeats collapsed)', () => {
    const between = PRESET_ORDER.filter((id) => {
      const t = SETUPS[id].tilts
      return t.some((d, k) => k > 0 && k < t.length - 1 && xAxis(d) && zAxis(t[k - 1]) && zAxis(t[k + 1]))
    })
    expect(between).toEqual(['l1-zxz'])
    // stricter: collapse runs of parallel magnets (z z → z), then look for any magnet at right angles to two parallel
    // neighbours (z x z or x z x): the same homework picture however the preset spells it
    const embedded = PRESET_ORDER.filter((id) => {
      const t = SETUPS[id].tilts.filter((d, k, a) => k === 0 || (d - a[k - 1]) % 180 !== 0)
      return t.some((d, k) => k > 0 && k < t.length - 1 && (t[k + 1] - t[k - 1]) % 180 === 0 && (d - t[k - 1]) % 180 !== 0)
    })
    expect(embedded).toEqual(['l1-zxz'])
    expect(chainText(SETUPS['l1-zxz'])).toBe('oven → z keep + → x keep + → z')
  })
  it('no text in the bench mentions a maximum or an optimum (every string the page can print, and the source’s strings)', () => {
    const banned = /maxim|optim|\bmax\b|largest|smallest|best tilt|as a function/i
    const texts: string[] = [TRY_THIS, tryThisAnswer(), CAPTION, ...SOURCES.flatMap((s) => [sourceNote(s), sourceText(s)])]
    for (const id of PRESET_ORDER) texts.push(SETUPS[id].name, SETUPS[id].note)
    for (const i of [...SG_FIDELITY.exact, ...SG_FIDELITY.schematic, ...SG_FIDELITY.misleading]) texts.push(i.text)
    for (const s of randomSetups(80, 41)) {
      const c = volleyOf(s, 200, seedOf(2)).counts
      texts.push(...readoutsOf(s, c).map((r) => r.text), ...stopLines(s, c), chainText(s), plateCaption(c), previousOf(s, c)?.text ?? '')
    }
    for (const f of ['SgBench.tsx', 'model.ts', 'fidelity.ts', 'plate.ts', 'layout.ts', 'store.ts']) {
      const src = stripComments(read(`src/lab/benches/sg/${f}`))
      // string literals, and JSX text in the page (code such as Math.max is not text)
      for (const m of src.matchAll(/'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\\n]|\\.)*"/g)) texts.push(m[0])
      if (f.endsWith('.tsx')) for (const m of src.matchAll(/(?<![=-])>([^<>{}]+)<(?=\/?[A-Za-z])/g)) texts.push(m[1])
    }
    expect(texts.length).toBeGreaterThan(500)
    const hits = texts.filter((t) => banned.test(t))
    expect(hits).toEqual([])
  })
})

describe('the review’s nits (#10–#14)', () => {
  it('#10: every sentence of the bench’s prose is ≤ 25 words (notes, caption, Try this, source notes, the canvas label)', () => {
    const canvas = /\bsg: '([^']+)'/.exec(read('src/lab/useLabEngine.ts'))![1]
    const prose = [CAPTION, TRY_THIS, tryThisAnswer(), canvas, ...SOURCES.map(sourceNote), ...PRESET_ORDER.map((id) => SETUPS[id].note)]
    for (const i of [...SG_FIDELITY.exact, ...SG_FIDELITY.schematic, ...SG_FIDELITY.misleading]) prose.push(i.text)
    const long = prose.flatMap(sentencesOf).filter((s) => wordsOf(s) > 25)
    expect(long).toEqual([])
    // the counter counts: the old samples note's first sentence (the review's fidelity.ts:17) would fail
    expect(wordsOf('Every count is an honest sample: each atom’s fate is drawn by the engine with a seeded random number, a new seed per volley, so small volleys scatter.')).toBeGreaterThan(25)
    // the notes' TeX is still there to typeset (model.test.ts renders every span)
    expect(texSpans(SG_FIDELITY.exact[1].text).length).toBeGreaterThan(0)
  })
  it('#11: the passport claims no unit on a bench that is not to scale', () => {
    const src = read('src/lab/benches/sg/SgBench.tsx')
    const passport = /const PASSPORT[^\n]*/.exec(src)![0]
    expect(passport).not.toMatch(/metre|\bm\b/)
    expect(passport).toMatch(/not to scale/)
  })
  it('#12: × removes a magnet, so + and − only ever name a beam (the caption; the scene’s remove pads)', () => {
    expect(CAPTION).toMatch(/“×” above one to remove it/)
    expect(CAPTION).not.toMatch(/“−” above one/)
    expect(read('src/lab/babylon/sgScene.ts')).toMatch(/pad\(`remove-\$\{i\}`, '×', base\)/)
  })
  it('#13: the note carries the lecture’s sign line (the moment is opposite the spin; + is always amber, along +n̂)', () => {
    const m = SG_FIDELITY.misleading.find((i) => i.id === 'lab-sg-moment')!.text
    expect(m).toMatch(/moment points opposite to the spin/)
    expect(m).toMatch(/labelling choice/)
    expect(m).toMatch(/\+\\hat n/)
  })
  it('#14: a tally or counted line wraps only between its parts, never inside a number, sign or denominator', () => {
    for (const s of randomSetups(40, 9)) {
      const c = volleyOf(s, 10000, seedOf(7)).counts
      const r = ro(s, c)
      for (const key of ['tally', 'counted']) for (const part of r[key].replace(/^counted: /, '').split(/ · | and | at |expect /)) expect(part, `${key}: ${part}`).not.toMatch(/ /)
    }
  })
})
