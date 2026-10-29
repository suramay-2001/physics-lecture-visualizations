/**
 * Chapter Q26's own invariants (rulings qc709-Q20-Q27.md Z1-Z7): the shape of the chapter (six units, 35 beats, six clues, two Go-deeper beats, all books-phase), the two notation beats, the
 * five derivations, the one proposed Correction (Z3: "our calculation finds ...", shown at a revealing point, for the independent review to confirm), the Rosetta lines, the stage limit of
 * five wires (the six-wire circuit of Fig. 14.7 is the engine's, drawn in pieces), the numbers the builder worded from the engine, every decimal of a challenge read from `V`, and the book
 * references. (The generic lints, symbols before use, claims against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { Q26 } from './Q26'
import Q26Source from './Q26.ts?raw'
import Q26Story from './Q26.story.ts?raw'
import { GLOSSARY } from './Q26.glossary'
import { C_BS, C_BS2, C_CNOT, C_CZ, C_DR, C_ENT, C_HOM, C_KERR, C_RES, C_T1, C_U, V, d } from './Q26.values'
import { gtCircuit, klmNeeded, nsAmplitudes, nsSolve } from '../../physics/qc/photons'
import { AMP_LIMITS } from '../../stage/svg/amplitudes'

const units = Q26.units
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

describe('Q26 shape: six units, 35 beats, six clues, two Go-deeper beats, all books-phase', () => {
  it('has the planned units in order, with 5 + 5 + 5 + 6 + 7 + 7 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q26-encodings', 'q26-beamsplitter', 'q26-hom', 'q26-ns-cz', 'q26-teleport-gate', 'q26-nonlinear'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([5, 5, 5, 6, 7, 7])
    expect(beats).toHaveLength(35)
  })
  it('the phases run books → clue → deeper; each Go-deeper beat is the last of its unit and no unit opens with one', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual([
      'q26-encodings:b5',
      'q26-beamsplitter:b5',
      'q26-hom:b5',
      'q26-ns-cz:b6',
      'q26-teleport-gate:b6',
      'q26-nonlinear:b6',
    ])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q26-teleport-gate:b7', 'q26-nonlinear:b7'])
    for (const u of units) {
      const s = u.story ?? []
      expect(s[0].phase, `${u.id} opens with a books beat`).toBe('books')
      s.forEach((b, i) => b.phase === 'deeper' && expect(i, `${b.id} is the last beat`).toBe(s.length - 1))
    }
    expect(beat('q26-teleport-gate:b7').formal).toContain('Beyond the book')
  })
  it('the two notation beats each introduce one entry, at or before its first use', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q26-beamsplitter:b1', 'qc-scattering-matrix'],
      ['q26-beamsplitter:b4', 'qc-fock-state'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => [g.id, g.introduces, g.first])).toEqual([
      ['qc-scattering-matrix', 'notation', 'q26-beamsplitter:b1'],
      ['qc-fock-state', 'notation', 'q26-beamsplitter:b4'],
    ])
    expect(GLOSSARY).toHaveLength(15)
    for (const g of GLOSSARY) expect(beat(g.first).text + (beat(g.first).formal ?? ''), g.id).toContain(`[[${g.id}|`)
  })
  it('five derivations (Ground 17 steps, Formal 13), each with at least as many Ground-up steps as Formal ones', () => {
    const ds = beats.filter((b) => b.derivation)
    expect(ds.map((b) => b.id)).toEqual(['q26-beamsplitter:b2', 'q26-hom:b1', 'q26-ns-cz:b2', 'q26-teleport-gate:b5', 'q26-nonlinear:b3'])
    for (const b of ds) expect(b.derivation!.ground.length, b.id).toBeGreaterThanOrEqual(b.derivation!.formal!.length)
    expect(ds.reduce((n, b) => n + b.derivation!.ground.length, 0)).toBe(17)
    expect(ds.reduce((n, b) => n + b.derivation!.formal!.length, 0)).toBe(13)
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
    expect(units.flatMap((u) => u.play).filter((c) => c.kind === 'choice').map((c) => c.id)).toEqual(['q26-b-two', 'q26-h-why', 'q26-k-cat'])
    expect(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric')).toHaveLength(15)
  })
})

describe('Q26 stage limits: the stage draws at most five wires, and the six-wire circuit is the engine’s', () => {
  it('every circuit a stage draws has at most five wires; the gate-teleportation circuit has six and is never drawn, only run', () => {
    for (const C of [C_U, C_DR, C_BS(0.3), C_BS(0.5), C_BS2, C_ENT(0.3), C_HOM(0.25), C_HOM(0.5), C_HOM(0.2), C_CZ(false), C_CZ(true), C_RES, C_T1, C_CNOT, C_KERR]) expect(C.qubits).toBeLessThanOrEqual(AMP_LIMITS.qubits)
    expect(gtCircuit().qubits).toBe(6)
    expect(Q26Story).not.toContain('gtCircuit')
    expect(beat('q26-teleport-gate:b2').formal).toContain('six-wire circuit')
  })
})

describe('Q26 rulings: Z2 no hardware digits, Z3 one Correction for the review to confirm, a Rosetta line for each clash', () => {
  it('there is no experimental number: no `reported` claim, and the hardware beat has no digit in its prose', () => {
    expect(beats.every((b) => !b.reported)).toBe(true)
    const noMath = (s: string) => s.replace(/\$[^$]*\$/g, '').replace(/<<[^>]*>>/g, '').replace(/Bergou p\. 2\d\d|Chapter Q2[47]|BB84/g, '')
    expect(noMath(beat('q26-nonlinear:b4').text)).not.toMatch(/\d/)
    expect(noMath(beat('q26-nonlinear:b4').formal!)).not.toMatch(/\d/)
    expect(noMath(beat('q26-encodings:b1').formal!)).not.toMatch(/\d/)
  })
  it('exactly one Correction (the missing factor i, p. 257), worded “our calculation finds” with an engine check, from the book', () => {
    expect(Q26.corrections).toHaveLength(1)
    const c = Q26.corrections![0]
    expect(c.shouldSay).toMatch(/^Our calculation finds/)
    expect(c.source).toBe('book')
    expect(c.check()).toBe(true)
    expect(c.where).toBe('Bergou p. 257, the state U|0⟩ after the wave plates')
    expect(c.shouldSay).toContain('130°')
    expect(c.says).toContain('relative phase')
  })
  it('the Correction is shown where it applies: at wave-plate beat b2, with the true and the printed phase as claims; the angle doubling is a Rosetta line in b3, not a box', () => {
    const b = beat('q26-encodings:b2')
    expect(b.formal).toContain('Correction K1')
    expect(b.claims!.map((c) => c.text.split(' · ')[0])).toEqual(expect.arrayContaining(['q26TruePhase', 'q26PrintedPhase']))
    expect(V.q26TruePhase).toBeCloseTo(130, 9)
    expect(V.q26PrintedPhase).toBeCloseTo(40, 9)
    expect(beat('q26-encodings:b3').formal).toContain('Rosetta')
    expect(Q26.corrections!.every((c) => !c.shouldSay.includes('polar angle'))).toBe(true)
  })
  it('Rosetta lines: the Q5 splitter (beamsplitter:b1), the Fock label (b4), Bergou’s θ (encodings:b3), the two-photon bars (ns-cz:b1) and the signed Δ (nonlinear:b3)', () => {
    expect(beat('q26-beamsplitter:b1').formal).toContain('Rosetta')
    expect(beat('q26-beamsplitter:b4').formal).toMatch(/Rosetta: this is a Fock label, not two qubits/)
    expect(beat('q26-encodings:b3').formal).toMatch(/Rosetta: Bergou calls \$\\theta\$ the polar angle/)
    expect(beat('q26-ns-cz:b1').formal).toContain('Rosetta')
    expect(beat('q26-nonlinear:b3').formal).toContain('signed')
  })
  it('the cited-only items are cited once and never worked: the third problem of the chapter (the truth table), the cited limit 2/27 and the Calsamiglia–Lütkenhaus half', () => {
    expect(beat('q26-teleport-gate:b4').formal).toContain('cited and not worked')
    expect(beat('q26-ns-cz:b5').formal).toContain('cited, not derived')
    expect(beat('q26-teleport-gate:b5').formal).toContain('cited')
    expect(Q26Story).not.toMatch(/\bP14\.\d/)
  })
})

describe('Q26 numbers worded from the engine, not from the plan (the builder’s notes)', () => {
  it('the sign gate: x = (3 − √2)/7 = 0.2265, the angles 150.49 and 61.58 degrees, the other root’s cos θ = 3.04, three photons give 0.657, and P_CZ = x²', () => {
    const s = nsSolve()
    expect(V.q26NsSuccess).toBeCloseTo((3 - Math.SQRT2) / 7, 12)
    expect(V.q26NsTheta).toBeCloseTo(150.49, 2)
    expect(V.q26NsPhi).toBeCloseTo(61.58, 2)
    expect(Math.abs(V.q26NsOtherRootCosTheta)).toBeGreaterThan(1)
    expect(V.q26NsOtherRootCosTheta).toBeCloseTo(3.04, 2)
    expect(V.q26NsRatio3).toBeCloseTo(0.657, 3)
    expect(V.q26CzSuccess).toBeCloseTo(s.success ** 2, 14)
    const A = nsAmplitudes(s.thetaDeg, s.phiDeg, 2)
    expect(A[1] / A[0]).toBeCloseTo(1, 12)
    expect(A[2] / A[0]).toBeCloseTo(-1, 12)
  })
  it('a CZ costs 19.49 attempts, three in a row 7398, the cited ceiling 2/27 is 1.44 times the gate’s chance; ten gates at 0.99 need 2000 photons at once', () => {
    expect(V.q26CzAttempts).toBeCloseTo(19.49, 2)
    expect(V.q26CzAttempts3).toBe(7398)
    expect(V.q26NsBound).toBeCloseTo(2 / 27, 14)
    expect(V.q26NsBoundRatio).toBeCloseTo(1.44, 2)
    expect(V.q26KlmPhotons10).toBe(2000)
  })
  it('KLM: 199 photons for 0.99 (198.5 exact) and 19 for 0.9 (18 gives 0.8975); the Bell analyser gets exactly one half, so one gate gets one quarter, which is KLM with n = 1', () => {
    expect(klmNeeded(0.99).n).toBe(199)
    expect(V.q26KlmExact99).toBeCloseTo(198.5, 1)
    expect(V.q26KlmN90).toBe(19)
    expect(V.q26Klm18).toBeCloseTo(0.8975, 4)
    expect(V.q26BellAnalyserSuccess).toBeCloseTo(0.5, 12)
    expect(V.q26BellGate).toBeCloseTo(V.q26Klm1, 12)
  })
  it('Hong–Ou–Mandel: the three chances at 75:25 are 0.375, 0.25, 0.375, the dip at R = 0.2 is 0.36, photons that can be told apart give 0.5 at 50:50, and the phases are 180 and 0 degrees', () => {
    expect(V.q26HomP20R25).toBeCloseTo(0.375, 12)
    expect(V.q26HomP11R25).toBeCloseTo(0.25, 12)
    expect(V.q26HomP02R25).toBeCloseTo(0.375, 12)
    expect(V.q26HomR20).toBeCloseTo(0.36, 12)
    expect(V.q26HomBunch20).toBeCloseTo(0.64, 12)
    expect(V.q26DistinguishableR50).toBeCloseTo(0.5, 12)
    expect(V.q26HomPhaseReal).toBeCloseTo(180, 9)
    expect(V.q26HomPhaseSym).toBeCloseTo(0, 9)
    expect(V.q26HomTt).toBeCloseTo(0.5, 12)
    expect(V.q26HomRr).toBeCloseTo(-0.5, 12)
  })
  it('the atom: χ = Ω₀²/(4Δ) = 0.025 Ω₀, the exact first step is 0.0248 (downward), χt = π at t = 125.7/Ω₀; the cat: overlap e^{-4} = 0.0183, norm 0.7070, no odd photon numbers, P(0) twice the coherent state’s', () => {
    expect(V.q26Chi).toBeCloseTo(0.025, 12)
    expect(V.q26ChiExact01).toBeCloseTo(0.0248, 4)
    expect(V.q26JcShift1).toBeLessThan(0)
    expect(V.q26ChiPhaseTime).toBeCloseTo(125.66, 2)
    expect(V.q26Overlap1).toBeCloseTo(Math.exp(-4), 12)
    expect(V.q26CatEvenNorm).toBeCloseTo(0.707, 3)
    expect(V.q26CatOddP).toBe(0)
    expect(V.q26CatP0 / V.q26CohP0).toBeCloseTo(2 / (1 + Math.exp(-8)), 6)
    expect(V.q26CatMean).toBeCloseTo(4 * Math.tanh(4), 9)
  })
  it('every `...Gap` value is about 1e-15, never exactly 0 in general: it prints as 0 through d(x, 0) and the chapter never compares one with === 0', () => {
    for (const [k, x] of Object.entries(V)) if (k.endsWith('Gap')) expect(Math.abs(x), k).toBeLessThan(1e-12)
    expect(Q26Story).not.toMatch(/Gap\s*===\s*0/)
    expect(d(V.q26StokesGap, 0)).toBe('0')
  })
})

describe('Q26 challenges read their numbers from V (the Q17 lint, for this chapter)', () => {
  /** Every value a challenge may quote: V itself, V squared, 1 − the targets, and the products the first walkthrough shows. */
  const known: number[] = [
    ...Object.values(V),
    ...Object.values(V).map((x) => x * x),
    Math.sqrt(V.q26Target90),
    Math.sqrt(V.q26Target90) / (1 - Math.sqrt(V.q26Target90)),
    V.q26HomTt - Math.abs(V.q26HomRr),
  ]
  const decimals = (text: string): string[] =>
    [...text.replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ').matchAll(/(?<![\d.{])(\d+\.\d{2,})(?![\d])/g)].map((m) => m[1])
  const texts = (c: (typeof units)[number]['play'][number]): string[] => [
    c.prompt,
    ...c.hints.map((h) => h.text),
    ...(c.walkthrough ?? []).map((w) => w.text),
    ...(c.kind === 'choice' ? c.options.flatMap((o) => [o.text, o.why]) : []),
  ]
  it('every decimal with two or more places in a prompt, hint, walkthrough or option matches a value of V (or a named constant) to its shown precision', () => {
    const bad: string[] = []
    for (const u of units)
      for (const c of u.play)
        for (const t of texts(c))
          for (const shown of decimals(t)) {
            const x = Number(shown)
            const places = shown.split('.')[1].length
            if (!known.some((v) => Math.abs(v - x) <= 0.5 * 10 ** -places + 1e-12)) bad.push(`${c.id}: ${shown}`)
          }
    expect(bad).toEqual([])
  })
  it('and none is typed: in the source of every challenge, a decimal of two or more places appears only inside a ${…} read of V', () => {
    const blocks = [...Q26Source.matchAll(/play: \[([\s\S]*?)\n      \],/g)].map((m) => m[1])
    expect(blocks).toHaveLength(units.length)
    const typed = blocks.flatMap((blk) =>
      [...blk
        .replace(/\$\{[^}]*\}/g, ' ')
        .replace(/tolerance: [\d.]+/g, ' ')
        .replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ')
        .matchAll(/(?<![\d.{])(\d+\.\d{2,})(?![\d])/g)].map((m) => m[1]),
    )
    expect(typed).toEqual([])
  })
  it('the lint sees the numbers (guard against a vacuous pass): the chapter’s challenges carry many decimals', () => {
    expect(units.flatMap((u) => u.play).flatMap((c) => texts(c)).flatMap(decimals).length).toBeGreaterThan(8)
  })
  it('the answers are the engine’s: 0.25, 45, 130, 0.3, 0.881, 0.25, 0.36, 0.2265, 19.49, 5.13, 0.5625, 19, 0.0625, 0.0183, 0.025', () => {
    const ans = Object.fromEntries(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric').map((c) => [c.id, (c as { answer: number }).answer]))
    expect(ans['q26-e-p1']).toBeCloseTo(0.25, 12)
    expect(ans['q26-e-polar']).toBe(45)
    expect(ans['q26-e-phase']).toBe(130)
    expect(ans['q26-b-r']).toBeCloseTo(0.3, 12)
    expect(ans['q26-b-entropy']).toBeCloseTo(0.8813, 4)
    expect(ans['q26-h-p11']).toBeCloseTo(0.25, 12)
    expect(ans['q26-h-r20']).toBeCloseTo(0.36, 12)
    expect(ans['q26-n-success']).toBeCloseTo((3 - Math.SQRT2) / 7, 12)
    expect(ans['q26-n-attempts']).toBeCloseTo(19.4854, 3)
    expect(ans['q26-n-100']).toBeCloseTo(5.1325, 3)
    expect(ans['q26-t-klm3']).toBeCloseTo(0.5625, 12)
    expect(ans['q26-t-n90']).toBe(19)
    expect(ans['q26-t-outcome']).toBeCloseTo(0.0625, 12)
    expect(ans['q26-k-overlap']).toBeCloseTo(0.0183, 4)
    expect(ans['q26-k-chi']).toBeCloseTo(0.025, 12)
  })
  it('an integer answer carries tolerance 0 and a decimal one 0.005; each choice challenge has exactly one correct option', () => {
    for (const c of units.flatMap((u) => u.play)) {
      if (c.kind === 'numeric') expect([0, 0.005], c.id).toContain(c.tolerance)
      if (c.kind === 'numeric' && c.tolerance === 0) expect(Number.isInteger(c.answer), c.id).toBe(true)
      if (c.kind === 'choice') expect(c.options.filter((o) => o.correct), c.id).toHaveLength(1)
    }
  })
})

describe('Q26 references: the pages and equations the book lists are the ones the text cites', () => {
  it('each unit cites its Bergou pages (253–266), and no N&C page is used (Chapter 14 is Bergou’s own)', () => {
    expect(units.map((u) => u.lecture.pages)).toEqual([
      'Bergou pp. 253–258, Fig. 14.3 (no lecture-notes source)',
      'Bergou pp. 254–256, Fig. 14.2, Eqs. 14.1–14.2 (no lecture-notes source)',
      'Bergou pp. 256–257 (no lecture-notes source)',
      'Bergou pp. 257–260, Fig. 14.4, Fig. 14.5 (no lecture-notes source)',
      'Bergou pp. 260–263, Fig. 14.7 (no lecture-notes source)',
      'Bergou pp. 263–266, Eq. 14.3 (no lecture-notes source)',
    ])
    expect(units.flatMap((u) => u.books.map((b) => b.source))).toEqual(Array(6).fill('bergou'))
  })
  it('the three problems at the end of the chapter are cited only: no challenge is built on them', () => {
    const prompts = units.flatMap((u) => u.play).map((c) => c.prompt.toLowerCase())
    expect(prompts.every((p) => !p.includes('problem'))).toBe(true)
  })
  it('equations are cited as “Eq. 14.1a” or “Eqs. 14.1–14.2”, figures as “Fig. 14.5”, never as a bare (14.1) or “Figs.” the number reader would take for a decimal', () => {
    for (const s of strings()) {
      expect(s, s.slice(0, 60)).not.toMatch(/\(14\.\d+[a-z]?\)/)
      expect(s, s.slice(0, 60)).not.toMatch(/\bFigs\.|\bFigure\s+14\./)
    }
  })
  it('the 25-word Ground and 40-word Formal sentence caps hold for every Try-it line too', () => {
    for (const u of units)
      for (const line of u.visual.tryThis ?? []) for (const s of line.split(/(?<=[.!?])\s+/)) expect(s.split(/\s+/).length, `${u.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('the glossary reuses Q5’s splitter and modes, Q2’s polarization, Q11’s teleportation and 448’s plates without redefining them', () => {
    const ids = GLOSSARY.map((g) => g.id)
    for (const reused of ['qc-beam-splitter', 'qc-photon-modes', 'qc-mach-zehnder', 'qc-phase-shifter', 'qc-polarization', 'qc-photon-space', 'qc-teleportation', 'qc-cnot', 'qc-phase-gate', 'qc-swap-gate', 'qc-bell-measurement'])
      expect(ids).not.toContain(reused)
    for (const g of GLOSSARY) expect(g.id).toMatch(/^qc-/)
  })
})
