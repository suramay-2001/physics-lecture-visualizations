/**
 * The notation pre-processor against the whole course: every TeX span of every written chapter, in every track it has
 * (448: Ground-up; 709: both), is marked and rendered both ways. The marked render must (a) parse without error, (b) be
 * IDENTICAL to the unmarked render once the mark wrappers are taken out (so spacing, scripts and sizes cannot differ),
 * (c) carry only marks the trusted renderer accepts. Also counts which notation the course actually uses.
 */
import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { COURSES, courseOfId } from '../content/courses'
import { LECTURES } from '../content/index'
import { QC_CHAPTERS } from '../content/qc709/index'
import { readingOrder, texSpans } from '../content/walk'
import { vocabOf } from './notationCorpus.testkit'
import { markNotation, notationIds } from './notationMark'
import { renderAuthoredTexStrict } from './tex'

/** The render with the mark wrappers (`<span class="enclosing" data-notation=…>…</span>`) taken out. */
export function stripMarks(html: string): string {
  const stack: boolean[] = []
  return html
    .replace(/<span\b[^>]*>|<\/span>/g, (tag) => {
      if (tag === '</span>') return stack.pop() ? '' : tag
      const mark = /^<span class="enclosing(?: [\w-]+)*" data-notation=/.test(tag)
      stack.push(mark)
      return mark ? '' : tag
    })
}

/**
 * What must be the same however the maths is wrapped: every glyph, class, spacing and script position. Two things are
 * left out on purpose. (1) `\mathrel{mark{≈}}` leaves a span around the symbol's own: one box either way. (2) KaTeX
 * starts a new `.katex-base` (a place an inline formula may wrap) after each TOP-LEVEL relation or binary operator, so
 * a break INSIDE a mark (the `+` of |z + w|) is gone, on purpose; the chunking and the struts that depend on it are
 * dropped before comparing. Breaks after a marked symbol itself are checked in notationMark.test.ts.
 */
export function layout(html: string): string {
  let s = html.replace(/<\/span><span class="katex-base"><span class="katex-strut"[^>]*><\/span>/g, '').replace(/<span class="katex-strut"[^>]*><\/span>/g, '')
  for (let prev = ''; prev !== s; ) {
    prev = s
    s = s
      // a symbol inside a span of its own class: one box
      .replace(/<span class="(mrel|mbin|mord)((?: [\w-]+)*)"><span class="(?:mrel|mbin|mord)(?: [\w-]+)*">([^<]*)<\/span><\/span>/g, '<span class="$1$2">$3</span>')
      // KaTeX joins neighbouring glyphs of one class into one span; a wrapper in between keeps them apart
      .replace(/<span class="([^"]+)">([^<]*)<\/span><span class="\1">([^<]*)<\/span>/g, '<span class="$1">$2$3</span>')
      .replace(/<span class="([^"]+)">([^<]*)<\/span><span class="\1"( style="[^"]*")>([^<]*)<\/span>/g, '<span class="$1"$3>$2$4</span>')
  }
  return s
}

const htmlOnly = (src: string, display: boolean) => katex.renderToString(src, { displayMode: display, output: 'html', trust: true, strict: 'ignore', throwOnError: true, maxSize: 20 })

/**
 * The TeX with each `\htmlData{notation=…}{X}` replaced by `X`: the source the marks were added to (a mark in an
 * unbraced script took braces: `^\dagger` → `^{\dagger}`, which KaTeX typesets the same).
 */
export function unwrapMarks(tex: string): string {
  const close = (from: number): number => {
    let d = 0
    for (let i = from; i < tex.length; i++) {
      if (tex[i] === '\\') i++
      else if (tex[i] === '{') d++
      else if (tex[i] === '}' && --d === 0) return i
    }
    return -1
  }
  const head = '\\htmlData{'
  let out = ''
  for (let i = 0; i < tex.length; ) {
    const cls = /^\\math(?:rel|bin)\{\\htmlData\{notation=/.exec(tex.slice(i, i + 40))
    if (cls) {
      // a symbol mark wrapped in \mathrel / \mathbin (ui/notationMark.ts `REL`, `BIN`)
      const brace = i + cls[0].indexOf('{')
      const end = close(brace)
      out += unwrapMarks(tex.slice(brace + 1, end))
      i = end + 1
    } else if (tex.startsWith(`${head}notation=`, i)) {
      const keys = close(i + head.length - 1)
      const body = close(keys + 1)
      out += unwrapMarks(tex.slice(keys + 2, body))
      i = body + 1
    } else out += tex[i++]
  }
  return out
}

interface Span {
  chapter: string
  tex: string
  display: boolean
}
const spans: Span[] = []
for (const l of [...LECTURES, ...QC_CHAPTERS]) {
  const seen = new Set<string>()
  for (const track of COURSES[courseOfId(l.id)].tracks)
    for (const s of readingOrder(l, track))
      for (const sp of texSpans(s.tex === 'display' ? `$$${s.text}$$` : s.text)) {
        const key = `${sp.display}|${sp.tex}`
        if (!seen.has(key)) {
          seen.add(key)
          spans.push({ chapter: l.id, tex: sp.tex, display: sp.display })
        }
      }
}

describe('notation marks over every TeX span of the course', () => {
  it('has a corpus to measure', () => {
    expect(spans.length).toBeGreaterThan(5000)
  })

  it.each([
    ['448 (no gate letters)', (c: string) => courseOfId(c) === 'sl448'],
    ['709 (with gate letters)', (c: string) => courseOfId(c) === 'qc709'],
  ])('%s: marks parse, and the marked render equals the unmarked render', (_name, inCourse) => {
    const bad: string[] = []
    let marked = 0
    for (const s of spans.filter((x) => inCourse(x.chapter))) {
      const gates = courseOfId(s.chapter) === 'qc709'
      const m = markNotation(s.tex, { gates, ...vocabOf(s.chapter) }) // the bit dot and the sets, as the lecture page reads them
      if (m === s.tex) continue
      marked++
      try {
        renderAuthoredTexStrict(m, s.display, true) // every mark passes the trusted renderer
        const a = layout(stripMarks(htmlOnly(m, s.display)))
        const b = layout(htmlOnly(unwrapMarks(m), s.display))
        if (a !== b) bad.push(`${s.chapter}: differs\n  ${s.tex}\n  ${m}`)
      } catch (e) {
        bad.push(`${s.chapter}: ${String(e).slice(0, 160)}\n  ${s.tex}\n  ${m}`)
      }
    }
    expect(marked).toBeGreaterThan(500)
    expect(bad.slice(0, 12).join('\n---\n'), `${bad.length} of ${marked} marked spans differ or fail`).toBe('')
  }, 120_000)

  it('counts the notation the course uses (diagnostic, written to the console)', () => {
    const count = new Map<string, Set<string>>()
    for (const s of spans)
      for (const id of notationIds(s.tex, { gates: courseOfId(s.chapter) === 'qc709' })) {
        if (!count.has(id)) count.set(id, new Set())
        count.get(id)!.add(s.chapter)
      }
    const rows = [...count.entries()].sort((a, b) => b[1].size - a[1].size).map(([id, ch]) => `${id}:${ch.size}`)
    console.info(`[notation] chapters per id: ${rows.join(' ')}`)
    expect(rows.length).toBeGreaterThan(20)
  })
})
