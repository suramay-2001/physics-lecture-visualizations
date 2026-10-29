/**
 * Chapter Q25's own invariants (rulings qc709-Q20-Q27.md Z1-Z7): the shape of the chapter (six units, 33 beats, three clues, one Go-deeper beat, all books-phase, every clue last in its
 * unit), the one notation entry, the ten derivations, the one proposed Correction (Z3: "our calculation finds ...", shown at a revealing point, for the independent review to confirm),
 * the Optics Lab reuse and links (Z4), no hardware digits (Z2), every decimal of a challenge read from `V`, and the book references. (The generic lints, symbols before use, claims against
 * numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { Q25 } from './Q25'
import Q25Source from './Q25.ts?raw'
import Q25Story from './Q25.story.ts?raw'
import AtomsSource from '../../physics/qc/atoms.ts?raw'
import { GLOSSARY } from './Q25.glossary'
import { C_SITE, V, d } from './Q25.values'
import { circuitUnitary } from '../../physics/qc/circuit'
import { Rx } from '../../physics/qc/gates'

const units = Q25.units
const beats = units.flatMap((u) => u.story ?? [])
const beat = (id: string) => beats.find((b) => b.id === id)!
const strings = (): string[] => {
  const out: string[] = []
  for (const b of beats) {
    out.push(b.text, b.formal ?? '', b.caption ?? '', b.captionFormal ?? '')
    if (b.reveal) out.push(b.reveal.text, b.reveal.formal ?? '', b.reveal.caption ?? '', b.reveal.captionFormal ?? '')
    for (const s of [...(b.derivation?.ground ?? []), ...(b.derivation?.formal ?? [])]) out.push(s.why, s.tex)
  }
  for (const u of units) out.push(u.insight, u.insightFormal ?? '', ...(u.pitfalls ?? []), u.lecture.summary, ...(u.visual.tryThis ?? []))
  return out
}

describe('Q25 shape: six units, 33 beats, three clues, one Go-deeper beat, all books-phase', () => {
  it('has the planned units in order, with 7 + 5 + 6 + 5 + 5 + 5 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q25-cooling', 'q25-readout', 'q25-atom-gates', 'q25-ion-trap', 'q25-phonons', 'q25-ion-gates'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([7, 5, 6, 5, 5, 5])
    expect(beats).toHaveLength(33)
  })
  it('the phases run books → clue → deeper; the clue is the LAST ramp beat of its unit (the plan numbered some in the middle: the phase lint wants books first), and no unit opens with one', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['q25-cooling:b7', 'q25-readout:b5', 'q25-atom-gates:b5', 'q25-ion-trap:b5', 'q25-phonons:b5', 'q25-ion-gates:b5'])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q25-atom-gates:b6'])
    for (const u of units) expect((u.story ?? [])[0].phase, `${u.id} opens with a books beat`).toBe('books')
  })
  it('the one notation entry, the Lamb-Dicke number, is introduced by exactly one beat, at or before its first use; 14 glossary terms in all', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([['q25-phonons:b2', 'qc-lamb-dicke']])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => [g.id, g.introduces, g.first])).toEqual([['qc-lamb-dicke', 'notation', 'q25-phonons:b2']])
    expect(GLOSSARY).toHaveLength(14)
  })
  it('ten derivations, each with at least as many Ground-up steps as Formal ones', () => {
    const ds = beats.filter((b) => b.derivation)
    expect(ds.map((b) => b.id)).toEqual(['q25-cooling:b3', 'q25-readout:b2', 'q25-readout:b4', 'q25-atom-gates:b3', 'q25-atom-gates:b4', 'q25-ion-trap:b3', 'q25-ion-trap:b4', 'q25-phonons:b2', 'q25-ion-gates:b1', 'q25-ion-gates:b2'])
    for (const b of ds) expect(b.derivation!.ground.length, b.id).toBeGreaterThanOrEqual(b.derivation!.formal!.length)
  })
  it('eighteen challenges, three per unit, each with exactly three hints and a full walkthrough (no sheet assigns any of them); three are choices', () => {
    for (const u of units) {
      expect(u.play, u.id).toHaveLength(3)
      for (const c of u.play) {
        expect(c.hints, c.id).toHaveLength(3)
        expect(c.walkthrough?.length ?? 0, c.id).toBeGreaterThan(0)
        expect(c.assigned, c.id).toBeFalsy()
      }
    }
    expect(units.flatMap((u) => u.play).filter((c) => c.kind === 'choice').map((c) => c.id)).toEqual(['q25-a-phase', 'q25-p-cool', 'q25-g-hot'])
  })
})

describe('Q25 rulings: Z2 no hardware digits, Z3 one Correction for the review to confirm, Z4 the Optics Lab engine and pages', () => {
  it('there is no experimental number: no `reported` claim and no measured hardware figure (model inputs are named as such)', () => {
    expect(beats.every((b) => !b.reported)).toBe(true)
    expect(Q25Story).not.toMatch(/\b\d+(\.\d+)?\s*(kHz|ms|µs|μs)\s+(coherence|phase time)/)
    expect(beat('q25-readout:b4').formal).toContain('model input')
    expect(beat('q25-phonons:b2').formal).toContain('our input')
    expect(beat('q25-ion-gates:b4').formal).toContain('no number is quoted here')
  })
  it('exactly one Correction, worded “our calculation finds”, with an engine check, from the book, naming the page of the table', () => {
    expect(Q25.corrections).toHaveLength(1)
    const c = Q25.corrections![0]
    expect(c.shouldSay).toMatch(/^Our calculation finds/)
    expect(c.source).toBe('book')
    expect(c.check()).toBe(true)
    expect(c.where).toContain('p. 225')
    expect(c.says).not.toContain('$')
    expect(c.shouldSay).not.toContain('$')
    expect(V.q25TDSr689).toBeCloseTo(0.1776, 3)
    expect(V.q25TDPrinted).toBe(1.02)
  })
  it('the Correction is shown where it applies: the table beat shows the narrow-line value against the printed one and flags the printed points', () => {
    const b = beat('q25-cooling:b5')
    expect(b.formal).toContain('Errata')
    expect(b.formal).toContain(d(V.q25TDSr689, 3))
    expect(b.fidelity).toContain('qc-plot-points-printed')
  })
  it('Z4: the cooling numbers reuse the Optics Lab engine (imports physics/optics/cooling) and the beats link its pages O2, O3 and O5', () => {
    expect(AtomsSource).toContain("from '../optics/cooling'")
    for (const fn of ['recoilVelocity', 'maxAcceleration', 'recoilTemperature', 'dopplerTemperature', 'slowRow']) expect(AtomsSource).toContain(fn)
    for (const id of ['qc-q25-o2-limit', 'qc-q25-o3-gradient', 'qc-q25-o5-dipole']) expect(Q25Story).toContain(id)
  })
  it('the Q24 link-backs: the beats name the units that own Lindblad, the Bloch equations, Rabi and Ramsey and define none of them again', () => {
    for (const id of ['qc-q24-bloch-eq', 'qc-q24-ramsey', 'qc-q24-rabi']) expect(Q25Story).toContain(id)
    expect(GLOSSARY.map((g) => g.bridge)).toContain('qc-q24-lindblad')
    const ids = GLOSSARY.map((g) => g.id)
    for (const reused of ['qc-t1', 'qc-t2', 'qc-rabi-frequency', 'qc-ramsey-interferometry', 'qc-w-state', 'hyperfine', 'rotating-wave']) expect(ids).not.toContain(reused)
  })
  it('review Q25-S6: the Optics Lab terms recoil, optical molasses and Doppler limit are linked from the Optics Lab glossary, not defined again here', () => {
    const ids = GLOSSARY.map((g) => g.id)
    for (const dup of ['qc-photon-recoil', 'qc-optical-molasses', 'qc-doppler-limit']) expect(ids).not.toContain(dup)
    for (const id of ['qc-op-recoil', 'qc-op-optical-molasses', 'qc-op-doppler-limit']) expect(Q25Story, id).toContain(`[[${id}|`)
  })
})

describe('Q25 numbers worded from the engine', () => {
  it('Table 13.1 recomputed: the four Doppler temperatures and the narrow-line slip; the stopping row; the loading ceiling', () => {
    expect([V.q25TDRb, V.q25TDCs, V.q25TDSr461, V.q25TDSr689].map((x) => Number(x.toFixed(1)))).toEqual([145.7, 125.5, 731.9, 0.2])
    expect(V.q25NstopRb).toBeCloseTo(49862.057, 3)
    expect(V.q25PodMu1).toBeLessThan(0.5)
  })
  it('the readout, gate and trap numbers: best cutoff 3, error 0.0065, two-thirds exponent, edge 0.908, Zeq 5.97 µm, eta0 0.3433, Bell chance 0.254 at n = 1', () => {
    expect(V.q25ncOpt).toBe(3)
    expect(V.q25ErrOpt).toBeCloseTo(0.0065, 4)
    expect(V.q25RydSlopeErr).toBeCloseTo(0.667, 3)
    expect(V.q25StabEdge).toBeCloseTo(0.908, 3)
    expect(V.q25Zeq).toBeCloseTo(5.97, 2)
    expect(V.q25eta0).toBeCloseTo(0.3433, 4)
    expect(V.q25CZbell1).toBeCloseTo(0.254, 3)
    expect(V.q25MSInfid1736).toBeGreaterThan(50 * V.q25MSInfidK17)
  })
  it('review Q25-S1: the site-selective circuit, read in time order from left to right, multiplies to R_x(0.7) and not to R_x(-0.7)', () => {
    const U = circuitUnitary(C_SITE)
    const gap = (A: typeof U, B: typeof U) => Math.max(...A.flatMap((row, i) => row.map((z, j) => Math.hypot(z.re - B[i][j].re, z.im - B[i][j].im))))
    expect(gap(U, Rx(0.7))).toBeLessThan(1e-12)
    expect(gap(U, Rx(-0.7))).toBeGreaterThan(0.5)
  })
  it('review Q25-S2: the speed a learner computes from the rounded givens in the prompt is accepted, and the heat walkthrough prints five digits', () => {
    const speed = units.flatMap((u) => u.play).find((c) => c.id === 'q25-c-speed') as { answer: number; tolerance: number }
    const fromPrompt = Number(d(V.q25vRb300, 1)) - (20000 * Number(d(V.q25vRecRb, 3))) / 1000
    expect(Math.abs(fromPrompt - speed.answer)).toBeLessThanOrEqual(speed.tolerance)
    expect(Q25Source).toContain('d(V.q25HeatPerPhoton, 5)')
  })
})

describe('Q25 challenges: every number is read from the engine, none is typed', () => {
  it('in the source of every challenge, a decimal of two or more places appears only inside a ${…} read of V', () => {
    const blocks = [...Q25Source.matchAll(/play: \[([\s\S]*?)\n      \],/g)].map((m) => m[1])
    expect(blocks).toHaveLength(units.length)
    const typed = blocks.flatMap((blk) =>
      [
        ...blk
          .replace(/\$\{[^}]*\}/g, ' ')
          .replace(/tolerance: [\d.]+/g, ' ')
          .replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ')
          .matchAll(/(?<![\d.{])(\d+\.\d{2,})(?![\d])/g),
      ].map((m) => m[1]),
    )
    // the inputs a prompt states (the beryllium trap's own 0.5411, the 0.2405 of a prompt, the weak drive 0.05 of Unit 25.6) are model inputs, not results
    expect(typed.filter((x) => !['0.5411', '0.2405', '0.05'].includes(x))).toEqual([])
  })
  it('the answers are the engine’s: 175.73, 24.13, 0.4908, 0.6065, 6.3, 0.0100, 2048, 0.0157, 0.2405, 1.275, 1.732, 0.04, 0.3, 0.02, 100', () => {
    const ans = Object.fromEntries(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric').map((c) => [c.id, (c as { answer: number }).answer]))
    expect(ans['q25-c-speed']).toBeCloseTo(175.73, 2)
    expect(ans['q25-c-heat']).toBeCloseTo(24.13, 2)
    expect(ans['q25-c-odd']).toBeCloseTo(0.4908, 4)
    expect(ans['q25-r-p0']).toBeCloseTo(Math.exp(-0.5), 12)
    expect(ans['q25-r-sum']).toBeCloseTo(6.3, 12)
    expect(ans['q25-r-err']).toBeCloseTo(0.01, 3)
    expect(ans['q25-a-scale']).toBe(2048)
    expect(ans['q25-a-raman']).toBeCloseTo(Math.PI / 200, 12)
    expect(ans['q25-t-q']).toBeCloseTo(0.2405, 4)
    expect(ans['q25-t-wz']).toBeCloseTo(1.275, 3)
    expect(ans['q25-t-stretch']).toBeCloseTo(1.732, 3)
    expect(ans['q25-p-eta2']).toBeCloseTo(0.04, 12)
    expect(ans['q25-p-blue']).toBeCloseTo(0.3, 12)
    expect(ans['q25-g-omt']).toBeCloseTo(0.02, 12)
    expect(ans['q25-g-loops']).toBe(100)
  })
  it('an integer answer carries tolerance 0 and a decimal one 0.005 (0.05 for the speed, whose stated givens are rounded to 293.4 and 5.885: review Q25-S2); each choice challenge has exactly one correct option', () => {
    for (const c of units.flatMap((u) => u.play)) {
      if (c.kind === 'numeric') expect(c.id === 'q25-c-speed' ? [0.05] : [0, 0.005], c.id).toContain(c.tolerance)
      if (c.kind === 'numeric' && c.tolerance === 0) expect(Number.isInteger(c.answer), c.id).toBe(true)
      if (c.kind === 'choice') expect(c.options.filter((o) => o.correct), c.id).toHaveLength(1)
    }
  })
})

describe('Q25 references: the pages and equations the book lists are the ones the text cites', () => {
  it('each unit cites its Bergou pages (221–247), and no N&C page is used', () => {
    expect(units.map((u) => u.lecture.pages)).toEqual([
      'Bergou §13.1–13.3, pp. 221–228, Eqs. 13.1–13.5 (no lecture-notes source)',
      'Bergou §13.3, pp. 228–232, Eqs. 13.6–13.10, Fig. 13.5 (no lecture-notes source)',
      'Bergou §13.4–13.5, pp. 232–236, Figs. 13.6–13.7; Problem 3 cited (no lecture-notes source)',
      'Bergou §13.6–13.7.1, pp. 236–239, Fig. 13.8 (no lecture-notes source)',
      'Bergou §13.8, pp. 239–243, Fig. 13.9 (no lecture-notes source)',
      'Bergou §13.9–13.10, pp. 243–247, Fig. 13.10 (no lecture-notes source)',
    ])
    expect(units.flatMap((u) => u.books.map((b) => b.source))).toEqual(Array(6).fill('bergou'))
  })
  it('equations are cited as “Eq. 13.6” or “Eqs. 13.1–13.4”, never as a bare (13.6) the number reader would take for a decimal; "Table 13.1" is "the table on p. 225"', () => {
    for (const s of strings()) {
      expect(s, s.slice(0, 60)).not.toMatch(/\(13\.\d+[a-c]?\)/)
      expect(s, s.slice(0, 60)).not.toMatch(/Table 13\.1/)
    }
  })
  it('the glossary text is plain apart from its TeX spans and every Correction text is plain (no TeX)', () => {
    for (const g of GLOSSARY) expect(g.gloss, g.id).not.toContain('$')
    for (const c of Q25.corrections ?? []) {
      expect(c.says).not.toContain('\\')
      expect(c.shouldSay).not.toContain('\\')
    }
  })
})
