/**
 * Print figures (stage/figures/FigureFor.tsx), server-rendered: every beat of 448 Lecture 1 and of the DEV demo
 * chapter Q0 (and, as a sweep, every other written lecture) renders a figure with a numbered title and no NaN; the
 * reading version emits exactly one figure per stage change, numbered through the lecture; the drawn numbers are the
 * engine's (resolve).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DEMO, DEMO_ISLAND } from '../../content/__fixtures__/demoStory'
import { LECTURES } from '../../content/index'
import { Q0 } from '../../content/qc709/__fixtures__/demoChapter'
import type { Lecture } from '../../content/schema'
import { layoutStates, STAGE_KINDS } from '../../content/stage'
import { TrackContext } from '../../ui/trackPref'
import { StaticStory } from '../StaticStory'
import { resolve } from '../resolve'
import { FIGURE_KINDS, FigureFor, FigureNumbersContext, PLACEHOLDER_KINDS, figureNumbers } from './FigureFor'

const L1 = LECTURES.find((l) => l.id === 'L1')!
const beatsOf = (l: Lecture) => l.units.flatMap((u) => u.story ?? [])

function checkFigure(html: string, number: string, where: string) {
  expect(html, where).toContain('<figure class="print-figure"')
  expect(html, where).toContain(`<title>Fig. ${number}: `)
  expect(html, where).toContain(`<b>Fig. ${number}</b>`)
  expect(html, `${where}: NaN`).not.toMatch(/NaN|Infinity|undefined/)
  expect(html, `${where}: an unresolved number`).not.toContain('>?<')
}

describe.each([L1, Q0].map((l) => [l.id, l] as const))('print figures: every beat of %s', (_, lecture) => {
  it('renders a figure with a numbered title and no NaN, for its question and its revealed picture', () => {
    for (const b of beatsOf(lecture))
      for (const layout of b.reveal?.stage ? [b.stage, b.reveal.stage] : [b.stage]) {
        const html = renderToString(<FigureFor layout={layout} number={`${lecture.id}.9`} caption={b.caption} />)
        checkFigure(html, `${lecture.id}.9`, b.id)
        expect(html.match(/<svg /g)?.length, b.id).toBe(layoutStates(layout).length)
      }
  })
  it('the reading version emits one numbered figure per stage change, numbered through the chapter', () => {
    const numbers = figureNumbers(lecture)
    expect(numbers.size).toBeGreaterThan(0)
    let seen = 0
    for (const u of lecture.units.filter((x) => x.story?.length)) {
      for (const track of ['ground', 'formal'] as const) {
        const html = renderToString(
          <TrackContext.Provider value={track}>
            <FigureNumbersContext.Provider value={numbers}>
              <StaticStory unit={u} />
            </FigureNumbersContext.Provider>
          </TrackContext.Provider>,
        )
        const figs = [...html.matchAll(/<figure class="print-figure" data-figure="([^"]+)"[\s\S]*?<\/figure>/g)]
        const want = u.story!.filter((b) => numbers.has(b.id)).map((b) => numbers.get(b.id)!)
        expect(
          figs.map((m) => m[1]),
          `${u.id} ${track}`,
        ).toEqual(want)
        for (const m of figs) checkFigure(m[0], m[1], `${u.id} ${m[1]}`)
        if (track === 'ground') seen += figs.length
      }
    }
    expect(seen).toBe(numbers.size)
    // numbered 1…n with the chapter id, and a new unit always starts with a figure
    expect([...numbers.values()]).toEqual(Array.from({ length: numbers.size }, (_, i) => `${lecture.id}.${i + 1}`))
    for (const u of lecture.units.filter((x) => x.story?.length)) expect(numbers.has(u.story![0].id), u.id).toBe(true)
  })
})

describe('print figures: the sweep', () => {
  it.each([...LECTURES, DEMO, DEMO_ISLAND].map((l) => [l.id, l] as const))('%s: every beat draws without NaN', (_, lecture) => {
    for (const b of beatsOf(lecture)) {
      const html = renderToString(<FigureFor layout={b.stage} number="X.1" />)
      expect(html, b.id).not.toMatch(/NaN|Infinity/)
      expect(html, b.id).toContain('<title>Fig. X.1: ')
    }
  })
  it('the kinds: five are drawn, hopf is a labelled placeholder, and that is every kind', () => {
    expect([...FIGURE_KINDS, ...PLACEHOLDER_KINDS].sort()).toEqual([...STAGE_KINDS].sort())
    const hopf = renderToString(<FigureFor layout={{ kind: 'hopf', fibers: 'one' }} number="X.2" />)
    expect(hopf).toContain('hopf: no print drawing yet')
  })
  it('the drawn numbers are the engine’s: P(+) of the equator state and the Born fractions of a bench', () => {
    const b3 = Q0.units[0].story![2]
    const r = resolve(layoutStates(b3.stage)[0] as Extract<(typeof b3)['stage'], { kind: 'bloch' }>, 1)
    const html = renderToString(<FigureFor layout={b3.stage} number="Q0.3" />)
    expect(html).toContain(`P(+) along n̂ = ${r.pPlus!.toFixed(3)}`)
    const lab = beatsOf(L1).find((b) => 'kind' in b.stage && b.stage.kind === 'lab-r3')!
    const rl = resolve(lab.stage as Extract<typeof lab.stage, { kind: 'lab-r3' }>, 1)
    const labHtml = renderToString(<FigureFor layout={lab.stage} number="L1.1" />)
    expect(labHtml).toContain(`+ ${Math.round(rl.benches[0].theory.plus * 100)} %`)
  })
})
