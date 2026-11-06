/**
 * Every fact the opener captions state, checked against the engine (the frames illustrate; the DOM claims).
 */
import { describe, expect, it } from 'vitest'
import { expi, abs } from '../physics/complex'
import { apply, vscale, vsub, norm } from '../physics/linalg'
import { runCircuit } from '../physics/qc/circuit'
import { groverAngle, groverCircuit, groverOptimalK, groverSuccess } from '../physics/qc/grover'
import { djCircuit } from '../physics/qc/oracles'
import { meanAmplitude } from '../physics/qc/state'
import { APP_DIR, fs, path } from '../security/node'
import { KET, Rz, blochVector, samePhysicalState } from '../physics/spin'
import { GROVER_OPENER, GROVER_TURN_FRAMES, beltOpenerFrame, groverOpenerFrame } from './openerData'
import { starSpokeChances } from '../physics/qc/walk'
import { clonerFidelities } from '../physics/qc/machines'
import { accessibleInfoPair, holevoChiPair } from '../physics/qc/infoq'
import { OPENERS, type OpenerName } from './openerCopy'

const plusZ = KET['+z']

describe('opener captions: the facts they state', () => {
  it('hopf beat 1: a phase e^{iχ} changes nothing measurable (same state, same Bloch point)', () => {
    for (const chi of [0.3, 1.7, Math.PI, 5.1]) {
      const psi = vscale(plusZ, expi(chi))
      expect(samePhysicalState(psi, plusZ)).toBe(true)
      blochVector(psi).forEach((v, i) => expect(Math.abs(v - blochVector(plusZ)[i])).toBeLessThan(1e-12))
      expect(norm(vsub(psi, plusZ))).toBeGreaterThan(0) // …yet a different vector
    }
  })
  it('belt beat 1: R_z(2π)|+z⟩ = −|+z⟩', () => {
    const out = apply(Rz(2 * Math.PI), plusZ)
    out.forEach((z, i) => expect(abs({ re: z.re + plusZ[i].re, im: z.im + plusZ[i].im })).toBeLessThan(1e-12))
  })
  it('belt beat 2: R_z(4π)|+z⟩ = +|+z⟩', () => {
    const out = apply(Rz(4 * Math.PI), plusZ)
    out.forEach((z, i) => expect(abs({ re: z.re - plusZ[i].re, im: z.im - plusZ[i].im })).toBeLessThan(1e-12))
  })
  it('belt beats line up with the film: 360° ends beat 1, 720° ends beat 2, flat at the end of beat 3', () => {
    const [b1, b2, b3] = OPENERS.belt.beats
    expect(beltOpenerFrame(b1.to).alphaDeg).toBeCloseTo(360, 9)
    expect(beltOpenerFrame(b2.to).alphaDeg).toBeCloseTo(720, 9)
    for (const w of beltOpenerFrame(b3.to).widths) expect(w[0]).toBeCloseTo(1, 9)
  })
  it('each opener’s beats cover its frames exactly once, in order', () => {
    for (const o of Object.values(OPENERS)) {
      expect(o.beats[0].from).toBe(0)
      expect(o.beats[o.beats.length - 1].to).toBe(o.frames - 1)
      for (let i = 1; i < o.beats.length; i++) expect(o.beats[i].from).toBe(o.beats[i - 1].to + 1)
    }
  })
})

describe('Grover opener captions: the facts they state', () => {
  const N = 8
  const alphaDeg = (groverAngle(N) * 180) / Math.PI
  const [b1, b2, b3] = OPENERS.grover.beats
  const has = (text: string, ...parts: string[]) => parts.forEach((p) => expect(text, p).toContain(p))
  const rested = (k: number) => GROVER_OPENER.stepStart[k - 1] + GROVER_TURN_FRAMES - 1

  it('beat 1: eight strings, sin α = 1/√8, α = 20.7°; the arrow starts at α and the eight bars are equal', () => {
    has(b1.text, 'eight strings', `$\\alpha = ${alphaDeg.toFixed(1)}°$`, '$\\sin\\alpha = 1/\\sqrt{8}$')
    expect(Math.sin(groverAngle(N))).toBeCloseTo(1 / Math.sqrt(8), 12)
    const start = groverOpenerFrame(b1.to)
    expect(start.angleDeg).toBeCloseTo(alphaDeg, 9)
    start.bars.forEach((a) => expect(a).toBeCloseTo(1 / Math.sqrt(8), 12))
  })
  it('beat 2: a step turns the arrow by 2α = 41.4°; two steps put it at 5α = 103.5°, the nearest to vertical, with chance 0.9453', () => {
    has(b2.text, `$2\\alpha = ${(2 * alphaDeg).toFixed(1)}°$`, `$5\\alpha = ${(5 * alphaDeg).toFixed(1)}°$`, `$${groverSuccess(N, 1, 2).toFixed(4)}$`)
    expect(groverOpenerFrame(rested(2)).angleDeg - groverOpenerFrame(rested(1)).angleDeg).toBeCloseTo(2 * alphaDeg, 9)
    expect(groverOpenerFrame(b2.to).angleDeg).toBeCloseTo(5 * alphaDeg, 9)
    expect(groverOptimalK(N)).toBe(2) // 'as close to straight up as whole steps allow'
    expect(Math.abs(5 * alphaDeg - 90)).toBeLessThan(Math.abs(3 * alphaDeg - 90))
    expect(Math.abs(5 * alphaDeg - 90)).toBeLessThan(Math.abs(7 * alphaDeg - 90))
    const rest = groverOpenerFrame(b2.to).bars.filter((_, i) => i !== GROVER_OPENER.marked)
    rest.forEach((a) => expect(a).toBeLessThan(0)) // 'a bar below its line is a small negative amplitude': after two steps the seven others are
  })
  it('beat 3: a third step takes the arrow to 7α = 144.9° and the chance falls back to 0.3301', () => {
    has(b3.text, `$7\\alpha = ${(7 * alphaDeg).toFixed(1)}°$`, `$${groverSuccess(N, 1, 3).toFixed(4)}$`, 'Unit 17.4')
    expect(groverOpenerFrame(b3.to).angleDeg).toBeCloseTo(7 * alphaDeg, 9)
    expect(groverSuccess(N, 1, 3)).toBeLessThan(groverSuccess(N, 1, 2))
    const marked = groverOpenerFrame(b3.to).bars[GROVER_OPENER.marked]
    expect(marked).toBeLessThan(groverOpenerFrame(b2.to).bars[GROVER_OPENER.marked]) // 'the marked bar shrinks'
  })
  it('the beats start while the arrow is at rest, so a caption never opens mid-turn', () => {
    expect(b2.from).toBe(GROVER_OPENER.stepStart[0])
    expect(b3.from).toBe(GROVER_OPENER.stepStart[2])
    expect(groverOpenerFrame(b2.from - 1).steps).toBe(0)
    expect(groverOpenerFrame(b3.from - 1).steps).toBe(2)
  })
  it('sits on the 709 stage ground, in its own folder', () => {
    expect(OPENERS.grover.ground).toBe(GROVER_OPENER.ground)
    expect(OPENERS.grover.dir).toBe('openers/grover')
  })
})

/** The stage frames the film recorded (public/films/qc709/<id>/manifest.json, written by the scene and checked against the engine by pipeline/films/check_manifest.ts). */
function filmStages(id: OpenerName): { from: number; to: number }[] {
  const m = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'public', OPENERS[id].dir, 'manifest.json'), 'utf8')) as { stages: { frames: { from: number; to: number } }[] }
  return m.stages.map((s) => s.frames)
}
/** a number as a caption writes it: four decimals at most, none that are zero (0.25, 0.3536, −1 as a hyphen, 0) */
const fx = (x: number) => String(Math.round(x * 1e4) / 1e4)
/** a caption states `$x$` for each of these numbers */
const states = (...xs: number[]) => xs.map((x) => `$${fx(x)}$`)
const realParts = (v: { re: number }[]) => v.map((z) => z.re)

describe('film qc-q16-cancel: the facts the captions state', () => {
  const F_BALN = [0, 1, 1, 1, 1, 0, 0, 0] as const
  const F_ONE = [1, 1, 1, 1, 1, 1, 1, 1] as const
  const baln = runCircuit(djCircuit([...F_BALN], 'phase')).states
  const one = runCircuit(djCircuit([...F_ONE], 'phase')).states
  const zero = runCircuit(djCircuit(F_ONE.map(() => 0), 'phase')).states
  const [b1, b2, b3] = OPENERS['qc-q16-cancel'].beats
  const has = (text: string, ...parts: string[]) => parts.forEach((p) => expect(text, p).toContain(p))

  it('beat 1: every bar after the query has height 0.3536; f = 0 everywhere leaves all eight up with the mean on their tops; four switches make the mean 0', () => {
    const bar = Math.abs(baln[2][0].re)
    has(b1.text, ...states(bar, meanAmplitude(baln[2]).re + 0))
    realParts(baln[2]).forEach((a) => expect(Math.abs(a)).toBeCloseTo(bar, 12))
    realParts(zero[2]).forEach((a) => expect(a).toBeCloseTo(bar, 12))
    expect(meanAmplitude(zero[2]).re).toBeCloseTo(bar, 12) // the mean line on their tops
    expect(F_BALN.filter((v) => v === 1)).toHaveLength(4) // 'four strings', and four bars up, four down
    expect(realParts(baln[2]).filter((a) => a < 0)).toHaveLength(4)
    expect(meanAmplitude(baln[2]).re).toBeCloseTo(0, 12)
  })
  it('beat 2: for the balanced f the all-zeros amplitude and chance are 0 and the chance sits on four strings, 0.25 each', () => {
    has(b2.text, ...states(0.25))
    expect(baln[3][0].re).toBeCloseTo(0, 12)
    const p = baln[3].map((z) => z.re * z.re + z.im * z.im)
    expect(p[0]).toBeCloseTo(0, 12)
    expect(p.filter((x) => x > 1e-9)).toHaveLength(4)
    p.filter((x) => x > 1e-9).forEach((x) => expect(x).toBeCloseTo(0.25, 12))
  })
  it('beat 3: for f = 1 every bar is −0.3536 with the mean on their ends, the all-zeros bar is −1 and its chance is 1', () => {
    const bar = Math.abs(one[2][0].re)
    has(b3.text, ...states(-bar, -1))
    realParts(one[2]).forEach((a) => expect(a).toBeCloseTo(-bar, 12))
    expect(meanAmplitude(one[2]).re).toBeCloseTo(-bar, 12)
    expect(one[3][0].re).toBeCloseTo(-1, 12)
    expect(one[3][0].re ** 2).toBeCloseTo(1, 12)
  })
  it('the beats start and end on the film’s own stage boundaries (read from its checked manifest)', () => {
    const stages = filmStages('qc-q16-cancel')
    for (const b of [b1, b2, b3]) {
      expect(stages.map((s) => s.from)).toContain(b.from)
      expect(stages.map((s) => s.to)).toContain(b.to)
    }
  })
})

describe('film qc-q17-mean: the facts the captions state', () => {
  const S = runCircuit(groverCircuit(3, ['101'], 2)).states // columns: 1 = |w₀⟩, 2 = after mark 1, 5 = after step 1, 6 = after mark 2, 9 = after step 2
  const MARKED = 5 // the string 101
  const [b1, b2, b3] = OPENERS['qc-q17-mean'].beats
  const has = (text: string, ...parts: string[]) => parts.forEach((p) => expect(text, p).toContain(p))
  const bars = (col: number) => realParts(S[col])
  const others = (col: number) => bars(col).filter((_, i) => i !== MARKED)

  it('beat 1: the even mix is eight bars of 0.3536; the mark flips only the bar of 101 and the mean drops to 0.2652', () => {
    has(b1.text, ...states(bars(1)[0], meanAmplitude(S[2]).re), '$101$')
    bars(1).forEach((a) => expect(a).toBeCloseTo(bars(1)[0], 12))
    expect(bars(2)[MARKED]).toBeCloseTo(-bars(1)[0], 12)
    others(2).forEach((a) => expect(a).toBeCloseTo(bars(1)[0], 12))
  })
  it('beat 2: unmarked bars 0.3536 → 0.1768, the marked bar −0.3536 → 0.8839, and the mean line does not move (0.2652)', () => {
    has(b2.text, ...states(bars(2)[0], others(5)[0], bars(2)[MARKED], bars(5)[MARKED], meanAmplitude(S[5]).re))
    others(5).forEach((a) => expect(a).toBeCloseTo(others(5)[0], 12))
    expect(meanAmplitude(S[5]).re).toBeCloseTo(meanAmplitude(S[2]).re, 12)
    // inversion about the mean: new = 2·mean − old, for every bar
    bars(2).forEach((a, i) => expect(bars(5)[i]).toBeCloseTo(2 * meanAmplitude(S[2]).re - a, 12))
  })
  it('beat 3: the second mark flips the tall bar to −0.8839 and the mean to 0.0442; the inversion gives 0.9723 and −0.0884; the chance is 0.9453, the square of the bar', () => {
    has(b3.text, ...states(bars(6)[MARKED], meanAmplitude(S[6]).re, bars(9)[MARKED], others(9)[0], groverSuccess(8, 1, 2)))
    expect(bars(6)[MARKED]).toBeCloseTo(-bars(5)[MARKED], 12)
    others(9).forEach((a) => expect(a).toBeCloseTo(others(9)[0], 12))
    expect(bars(9)[MARKED] ** 2).toBeCloseTo(groverSuccess(8, 1, 2), 12)
    expect(meanAmplitude(S[9]).re).toBeCloseTo(meanAmplitude(S[6]).re, 12)
  })
  it('the beats start and end on the film’s own stage boundaries (read from its checked manifest)', () => {
    const stages = filmStages('qc-q17-mean')
    for (const b of [b1, b2, b3]) {
      expect(stages.map((s) => s.from)).toContain(b.from)
      expect(stages.map((s) => s.to)).toContain(b.to)
    }
  })
})

describe('film qc-q19-walker: the facts the captions state', () => {
  const spokes = (n: number) => starSpokeChances(8, { marked: 1 }, n).spokes
  const [b1, b2, b3] = OPENERS['qc-q19-walker'].beats
  const has = (text: string, ...parts: string[]) => parts.forEach((p) => expect(text, p).toContain(p))

  it('beat 1: eight spokes start at 0.125 each; after two steps the marked spoke has 0.78125 and each other 0.03125', () => {
    has(b1.text, 'eight spokes', '$0.125$', '$0.78125$', '$0.03125$')
    expect(spokes(0)).toHaveLength(8)
    spokes(0).forEach((p) => expect(p).toBeCloseTo(0.125, 12))
    expect(spokes(2)[0]).toBeCloseTo(0.78125, 12)
    spokes(2).slice(1).forEach((p) => expect(p).toBeCloseTo(0.03125, 12))
  })
  it('beat 2: after four steps 0.9453 on the marked spoke and 0.0078 on each other: the chance of two Grover steps', () => {
    has(b2.text, ...states(spokes(4)[0], spokes(4)[1]), 'Unit 17.4')
    expect(spokes(4)[0]).toBeCloseTo(groverSuccess(8, 1, 2), 12)
    spokes(4).slice(1).forEach((p) => expect(p).toBeCloseTo(spokes(4)[1], 12))
  })
  it('beat 3: after six steps 0.3301 on the marked spoke (the chance of three Grover steps) and 0.0957 on each other', () => {
    has(b3.text, ...states(spokes(6)[0], spokes(6)[1]), 'Unit 19.3')
    expect(spokes(6)[0]).toBeCloseTo(groverSuccess(8, 1, 3), 12)
    expect(spokes(6)[0]).toBeLessThan(spokes(4)[0])
    spokes(6).slice(1).forEach((p) => expect(p).toBeCloseTo(spokes(6)[1], 12))
  })
  it('the eight chances add to 1, and an odd step leaves them as the even step before it left them', () => {
    for (let n = 0; n <= 6; n++) expect(spokes(n).reduce((s, p) => s + p, 0)).toBeCloseTo(1, 12)
    for (const n of [1, 3, 5]) spokes(n).forEach((p, i) => expect(p).toBeCloseTo(spokes(n - 1)[i], 12))
  })
  it('the beats start and end on the film’s own stage boundaries (read from its checked manifest)', () => {
    const stages = filmStages('qc-q19-walker')
    for (const b of [b1, b2, b3]) {
      expect(stages.map((s) => s.from)).toContain(b.from)
      expect(stages.map((s) => s.to)).toContain(b.to)
    }
  })
})

describe('film qc-q20-cloner: the facts the captions state', () => {
  const F = (u: number, theta = 60, phi = 90) => clonerFidelities(u, theta, phi)
  const [b1, b2, b3] = OPENERS['qc-q20-cloner'].beats
  const has = (text: string, ...parts: string[]) => parts.forEach((p) => expect(text, p).toContain(p))
  const grid = Array.from({ length: 61 }, (_, u) => F(u))

  it('beat 1: at 0° the copies have fidelity 1 and 0.5; at 15° they have 0.9553 and 0.6667', () => {
    has(b1.text, ...states(F(0).f1, F(0).f2, F(15).f1, F(15).f2))
    expect(F(0).f1).toBeCloseTo(1, 12)
    expect(F(0).f2).toBeCloseTo(0.5, 12)
  })
  it('beat 2: at 30° both copies have fidelity 5/6, the curves cross once, and every input state gives the same numbers', () => {
    has(b2.text, ...states(F(30).f1), '$5/6$')
    expect(F(30).f1).toBeCloseTo(5 / 6, 12)
    expect(F(30).f2).toBeCloseTo(5 / 6, 12)
    const signs = grid.map((g) => Math.sign(g.f1 - g.f2 + 1e-12))
    expect(signs.filter((s, i) => i > 0 && s !== signs[i - 1])).toHaveLength(1)
    for (const [t, p] of [[20, 30], [130, 250], [0, 0], [90, 10]]) for (const u of [0, 15, 30, 60]) {
      expect(F(u, t, p).f1).toBeCloseTo(F(u).f1, 9)
      expect(F(u, t, p).f2).toBeCloseTo(F(u).f2, 9)
    }
  })
  it('beat 3: at 60° the first copy has 0.5 and the second 1; the worse of the two copies is never better than 0.8333', () => {
    has(b3.text, ...states(F(60).f1, F(60).f2, F(30).f1))
    expect(F(60).f1).toBeCloseTo(0.5, 12)
    expect(F(60).f2).toBeCloseTo(1, 12)
    expect(Math.max(...grid.map((g) => Math.min(g.f1, g.f2)))).toBeCloseTo(F(30).f1, 12)
  })
  it('the beats start and end on the film’s own stage boundaries (read from its checked manifest)', () => {
    const stages = filmStages('qc-q20-cloner')
    for (const b of [b1, b2, b3]) {
      expect(stages.map((s) => s.from)).toContain(b.from)
      expect(stages.map((s) => s.to)).toContain(b.to)
    }
  })
})

describe('film qc-q23-holevo-gap: the facts the captions state', () => {
  const ss = Array.from({ length: 51 }, (_, i) => i / 50)
  const chi = (s: number) => holevoChiPair(s)
  const best = (s: number) => accessibleInfoPair(s)
  const [b1, b2, b3] = OPENERS['qc-q23-holevo-gap'].beats
  const has = (text: string, ...parts: string[]) => parts.forEach((p) => expect(text, p).toContain(p))

  it('beat 1: both are 1 bit at s = 0; at s = 0.5 the bound is 0.8113 and the best reading 0.6454', () => {
    has(b1.text, ...states(chi(0.5), best(0.5)))
    expect(chi(0)).toBeCloseTo(1, 12)
    expect(best(0)).toBeCloseTo(1, 9)
  })
  it('beat 2: at s = 0.8 the bound is 0.469 and the best reading 0.2781; the reading is below the bound at every interior overlap', () => {
    has(b2.text, ...states(chi(0.8), best(0.8)))
    ss.slice(1, -1).forEach((s) => expect(chi(s) - best(s), `s = ${s}`).toBeGreaterThan(1e-9))
  })
  it('beat 3: at s = 1 both are 0; the widest gap on the grid is at s = 0.7 and is 0.2017', () => {
    has(b3.text, ...states(chi(0.7) - best(0.7)))
    expect(chi(1)).toBeCloseTo(0, 12)
    expect(best(1)).toBeCloseTo(0, 12)
    const gaps = ss.map((s) => chi(s) - best(s))
    expect(ss[gaps.indexOf(Math.max(...gaps))]).toBeCloseTo(0.7, 12)
  })
  it('the beats start and end on the film’s own stage boundaries (read from its checked manifest)', () => {
    const stages = filmStages('qc-q23-holevo-gap')
    for (const b of [b1, b2, b3]) {
      expect(stages.map((s) => s.from)).toContain(b.from)
      expect(stages.map((s) => s.to)).toContain(b.to)
    }
  })
})
