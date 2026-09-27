/**
 * Round 3 #5 (truth defect): a classical-model lab beat shows no quantum ± outcome, and #9 / D6 passport markup.
 * The live check over every rendered L1 beat is in e2e/story.spec.ts; here the rules are pinned without a GPU:
 * the guard itself, the overlay markup of every L1 beat (question and revealed), and writeReadout.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../content/fidelity'
import { LECTURES } from '../content/index'
import type { Beat } from '../content/schema'
import { PASSPORT, PASSPORT_VARIANT, layoutSlots, layoutStates, beatLayout } from '../content/stage'
import { CLASSICAL_NOTE, isOutcomeText, outcomesAllowed } from '../stage/readoutGuard'
import { stage, writeReadout, type StageLabel } from '../stage/store'
import { anchoredLabels, keepMathTogether, passportRelevant } from './overlayText'
import { StageOverlay } from './StageOverlay'

const L1 = LECTURES.find((l) => l.id === 'L1')!
const storyUnits = L1.units.filter((u) => u.story?.length)
const pictures = storyUnits.flatMap((u) =>
  u.story!.flatMap((b) => [{ unit: u, beat: b, revealed: false }, ...(b.reveal ? [{ unit: u, beat: b, revealed: true }] : [])]),
)
const render = (unitId: string, beat: Beat, revealed: boolean) =>
  renderToString(<StageOverlay unitId={unitId} kinds={['lab-r3', 'hilbert-plane', 'bloch', 'bloch-ball']} beat={beat} revealed={revealed} size={{ w: 700, h: 760 }} />)
const isClassical = (beat: Beat, revealed: boolean) => layoutStates(beatLayout(beat, revealed)).some((s) => !outcomesAllowed(s))

/** What LabR3Scene publishes for a bench (readouts + spot labels), so the filter is tested on real names. */
const SCENE_LABELS: Record<string, StageLabel> = {
  sp0: { text: '+ħ/2', tier: 'axis', tone: 'plus' },
  sm0: { text: '−ħ/2', tier: 'axis', tone: 'minus' },
  frac00: { text: '1', tier: 'axis' },
  badge: { text: 'classical model — not what happens', tier: 'axis' },
  rCount0: { text: '', tier: 'readout' },
  rBorn0: { text: '', tier: 'readout' },
  rTheta: { text: '', tier: 'readout', tone: 'silver' },
}

describe('readout guard: what counts as a quantum ± outcome', () => {
  it.each([
    '+ 50.0% · − 50.0%',
    '+ 512 · − 488',
    'z-first · + 12 · − 8',
    '50.0% + · Born 50.0%',
    'P(+) = 0.854 · 2P(+) − 1 = 0.707',
    '⟨σₙ⟩ = 0.707',
    '+ħ/2',
    '−ħ/2',
    '+ 1/2',
    '$+\\tfrac{\\hbar}{2}$',
    '$\\langle\\sigma_n\\rangle$',
  ])('%s is an outcome', (t) => expect(isOutcomeText(t)).toBe(true))
  it.each(['θ = 90°', 'θ = −30°', 'classical model — not what happens', 'z · field gradient', 'OVEN', 'x-first', 'block', CLASSICAL_NOTE, '', '1'])(
    '%j is not an outcome',
    (t) => expect(isOutcomeText(t)).toBe(false),
  )
})

describe('classical-model beats show no quantum ± outcome (Round 3 #5)', () => {
  it('walks every L1 beat (question and revealed): the classical ones get the note and outcome-free readouts', () => {
    let classical = 0
    for (const { unit, beat, revealed } of pictures) {
      const html = render(unit.id, beat, revealed)
      const where = `${beat.id}${revealed ? ' (revealed)' : ''}`
      if (isClassical(beat, revealed)) {
        classical++
        expect(html, where).toContain(CLASSICAL_NOTE)
        expect(html, where).toContain('data-model-note="classical"')
      } else expect(html, where).not.toContain(CLASSICAL_NOTE)
      // whatever is in the markup, no outcome text sits in the readout column of a classical beat
      const column = html.slice(html.indexOf('class="stage-readouts"'))
      if (isClassical(beat, revealed)) expect(isOutcomeText(column.replace(/<[^>]+>/g, ' ')), where).toBe(false)
    }
    expect(pictures.length).toBeGreaterThanOrEqual(31)
    expect(classical).toBeGreaterThanOrEqual(1) // l1-quantized:b2 today
  })

  it('a classical view drops the scene’s outcome labels (+ħ/2, −ħ/2) and keeps the rest', () => {
    const axes = ['x', 'y · beam', 'z · field gradient']
    const on = anchoredLabels(axes, SCENE_LABELS, true).map(([n]) => n)
    const off = anchoredLabels(axes, SCENE_LABELS, false).map(([n]) => n)
    expect(on).toEqual(['axis-0', 'axis-1', 'axis-2', 'sp0', 'sm0', 'frac00', 'badge'])
    expect(off).toEqual(['axis-0', 'axis-1', 'axis-2', 'frac00', 'badge'])
    // on every classical L1 picture the lab state is what switches it off
    for (const { beat, revealed } of pictures)
      for (const s of layoutStates(beatLayout(beat, revealed))) expect(outcomesAllowed(s)).toBe(!(s.kind === 'lab-r3' && s.model === 'classical'))
  })

  it('writeReadout blanks outcome text in a node marked data-outcomes="off" and writes everything else', () => {
    const node = (outcomes?: 'off') => ({ dataset: outcomes ? { outcomes } : {}, textContent: '' }) as unknown as HTMLElement
    const off = node('off')
    const on = node()
    stage.dom.set('t/lab-r3:off', off)
    stage.dom.set('t/lab-r3:on', on)
    try {
      writeReadout('t/lab-r3:off', '+ 50.0% · − 50.0%')
      expect(off.textContent).toBe('')
      writeReadout('t/lab-r3:off', 'θ = 90°')
      expect(off.textContent).toBe('θ = 90°')
      writeReadout('t/lab-r3:on', '+ 50.0% · − 50.0%')
      expect(on.textContent).toBe('+ 50.0% · − 50.0%')
    } finally {
      stage.dom.delete('t/lab-r3:off')
      stage.dom.delete('t/lab-r3:on')
    }
  })
})

describe('passport markup (Round 3 #9, D6)', () => {
  it('no literal ⓘ glyph (D’s CSS draws it from aria-expanded); every passport is an expandable button with a slot', () => {
    for (const { unit, beat, revealed } of pictures) {
      const html = render(unit.id, beat, revealed)
      expect(html).not.toContain('ⓘ')
      const passports = html.match(/<button[^>]*class="stage-passport"[^>]*>/g) ?? []
      expect(passports.length).toBe(layoutSlots(beatLayout(beat, revealed)).length)
      for (const p of passports) {
        expect(p).toMatch(/data-slot="(full|top|bottom|main|inset)"/)
        expect(p).toContain('aria-expanded="false"')
      }
    }
  })

  it('a passport carries data-relevant="1" exactly when the beat flags one of its fidelity items', () => {
    let flagged = 0
    for (const { unit, beat, revealed } of pictures) {
      const highlight = [...(beat.fidelity ?? []), ...(revealed ? (beat.reveal?.fidelity ?? []) : [])]
      const html = render(unit.id, beat, revealed)
      const passports = html.match(/<button[^>]*class="stage-passport"[^>]*>/g) ?? []
      layoutStates(beatLayout(beat, revealed)).forEach((s, i) => {
        const key = s.kind === 'lab-r3' && s.variant === 'optical' ? 'optical' : s.kind === 'bloch' && s.labels === 'poincare' ? 'poincare' : s.kind
        const f = fidelityOf(key)
        const want = [...f.exact, ...f.schematic, ...f.misleading].some((x) => highlight.includes(x.id))
        expect(passportRelevant(key, highlight)).toBe(want)
        expect(passports[i].includes('data-relevant="1"'), `${beat.id} passport ${i}`).toBe(want)
        if (want) flagged++
      })
    }
    expect(flagged).toBeGreaterThan(3)
  })

  it('math tokens stay with their words: "real slice of ℂ²" never breaks before ℂ²', () => {
    expect(keepMathTogether(PASSPORT['hilbert-plane'].title)).toBe('STATE SPACE · real slice of\u00a0ℂ²')
    expect(keepMathTogether(PASSPORT['lab-r3'].title)).toBe('PHYSICAL SPACE\u00a0ℝ³ · metres')
    expect(keepMathTogether(PASSPORT.hopf.title)).toBe('STATE SPACE\u00a0S³ · stereographic view')
    expect(keepMathTogether(PASSPORT['operator-space'].title)).toBe('OPERATOR SPACE · A\u00a0=\u00a0a₀I\u00a0+\u00a0a·σ') // plain a: no combining arrow in the mono font
    expect(keepMathTogether('STATE SPACE · Bloch sphere')).toBe('STATE SPACE · Bloch sphere')
    // every passport title and note: no ordinary space right before a word that carries a math symbol
    // (the " · " segment separators may still wrap)
    for (const p of [...Object.values(PASSPORT), ...Object.values(PASSPORT_VARIANT)])
      for (const t of [p.title, p.note]) expect(keepMathTogether(t)).not.toMatch(/(?<!·) [^\s·]*[ℂℝ²³₀\u20d7σ]/)
    // and the rendered hilbert-plane passport carries the no-break space
    const plane = pictures.find(({ beat, revealed }) => layoutStates(beatLayout(beat, revealed)).some((s) => s.kind === 'hilbert-plane'))!
    expect(render(plane.unit.id, plane.beat, plane.revealed)).toContain('real slice of\u00a0ℂ²')
  })
})
