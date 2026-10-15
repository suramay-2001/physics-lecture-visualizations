/**
 * Pauli-based computation (background chapter B4, unit b4-pbc; Litinski 2019 arXiv:1808.02892, Figs. 4-6, and Bravyi, Smith and Smolin 2016 arXiv:1506.01396). Pure TypeScript.
 *
 * A circuit of Clifford gates and T gates is turned into a list of Pauli rotations by sliding every Clifford gate to the END. Convention of the paper this chapter serves (arXiv:2506.03094, Section 3):
 * P(φ) = exp(iφP/2), so φ = ±π/2 is a Clifford rotation and φ = ±π/4 is T-like; T = Z(−π/4) and T† = Z(+π/4) up to a global phase. (Litinski writes exp(−iφP): his "π/4" and "π/8" rotations are
 * this convention's P(−π/2) and P(−π/4).)
 * If the gate C comes BEFORE the rotation R_P(φ), then R_P(φ)·C = C·R_{C†PC}(φ): the rotation moves behind C and its axis becomes C†PC. So a circuit is
 *   U = C_final · R_{P_m} … R_{P_1}   (the first rotation acts first),   P_i = C_i† Z_{w_i} C_i,   C_i = the Cliffords before the i-th T gate,
 * and the axes come from the SYMPLECTIC picture (Pauli.conjugate with exact phases). A dense check (≤ 4 qubits) multiplies the pieces back together. Layers: a rotation joins the layer after the latest
 * earlier rotation it does not commute with.
 */
import { Pauli } from './pauli'
import { D1, dCnot, dEmbed1, dEqualUpToPhase, dEye, dMaxAbsDiff, dMul, dPauli, dRot, dScale, dCombine, type DMat } from './dense'
import { rng } from '../random'

export type TurnAngle = 'c+' | 'c-' | 't+' | 't-'
export type PbcGate =
  | { g: 'H' | 'S' | 'Sdg' | 'T' | 'Tdg'; q: number }
  | { g: 'CNOT'; c: number; t: number }
  | { g: 'R'; pauli: string; angle: TurnAngle }

export const turnRad = (a: TurnAngle): number => ({ 'c+': Math.PI / 2, 'c-': -Math.PI / 2, 't+': Math.PI / 4, 't-': -Math.PI / 4 })[a]
export const isClifford = (g: PbcGate): boolean => g.g === 'H' || g.g === 'S' || g.g === 'Sdg' || g.g === 'CNOT' || (g.g === 'R' && g.angle[0] === 'c')

export const PBC_PRESET_IDS = ['toffoli-textbook', 'toffoli-phase', 'cnot', 'z-then-x'] as const
export type PbcPresetId = (typeof PBC_PRESET_IDS)[number]
export interface PbcProgram {
  wires: number
  labels: string[]
  gates: PbcGate[]
}
const h = (q: number): PbcGate => ({ g: 'H', q })
const cx = (c: number, t: number): PbcGate => ({ g: 'CNOT', c, t })
const t = (q: number): PbcGate => ({ g: 'T', q })
const td = (q: number): PbcGate => ({ g: 'Tdg', q })
const r = (pauli: string, angle: TurnAngle): PbcGate => ({ g: 'R', pauli, angle })

/** The programs the stage names. `toffoli-textbook`: the 15-gate circuit of Nielsen and Chuang (2 H, 6 CNOT, 7 T-type) with wire 3 as target. `toffoli-phase`: H on wire 3, the seven phase rotations of CCZ, H again. */
export const PBC_PRESETS: Readonly<Record<PbcPresetId, PbcProgram>> = {
  'toffoli-textbook': {
    wires: 3,
    labels: ['1', '2', '3'],
    gates: [h(2), cx(1, 2), td(2), cx(0, 2), t(2), cx(1, 2), td(2), cx(0, 2), t(1), t(2), h(2), cx(0, 1), t(0), td(1), cx(0, 1)],
  },
  'toffoli-phase': {
    wires: 3,
    labels: ['1', '2', '3'],
    gates: [h(2), r('ZII', 't-'), r('IZI', 't-'), r('IIZ', 't-'), r('ZZI', 't+'), r('ZIZ', 't+'), r('IZZ', 't+'), r('ZZZ', 't-'), h(2)],
  },
  cnot: { wires: 2, labels: ['c', 't'], gates: [r('ZX', 'c-'), r('IX', 'c+'), r('ZI', 'c+')] },
  'z-then-x': { wires: 1, labels: ['1'], gates: [r('Z', 'c-'), r('X', 't-')] },
}

/* ---------------------------------------------------------------- conjugation of a Pauli by a Clifford rotation */

const times = (p: Pauli, k: number): Pauli => new Pauli(p.x, p.z, p.phase + k)

/**
 * Conjugate a Pauli by the Clifford rotation R = P(φ), φ = ±π/2: forward R·Q·R† (the Heisenberg picture of a gate applied to the state) or backward R†·Q·R.
 * A commuting Q is unchanged; for an anticommuting Q, R Q R† = i·s·A·Q and R† Q R = −i·s·A·Q with s = sign of φ and A the axis. Example: Z(π/2) turns X into −Y.
 */
export function rotateConj(q: Pauli, axis: Pauli, angle: 'c+' | 'c-', direction: 'forward' | 'backward'): Pauli {
  if (q.commutesWith(axis)) return q
  const s = angle === 'c+' ? 1 : -1
  const fwd = s > 0 ? 1 : 3
  return times(axis.mul(q), direction === 'forward' ? fwd : (4 - fwd) % 4)
}

/** The signed letters of a Hermitian Pauli: `{ sign, pauli }`. */
export const signedLetters = (p: Pauli): { sign: 1 | -1; pauli: string } => ({ sign: p.sign(), pauli: p.letters().join('') })

/** What a Clifford turn about `axis` does to the single-qubit Paulis X, Y, Z (forward): their images with signs. */
export function turnImages(axis: string, angle: 'c+' | 'c-'): { letter: string; image: string }[] {
  const a = Pauli.parse(axis)
  return ['X', 'Y', 'Z'].map((letter) => {
    const out = signedLetters(rotateConj(Pauli.parse(letter), a, angle, 'forward'))
    return { letter, image: `${out.sign < 0 ? '−' : ''}${out.pauli}` }
  })
}
/** How many of X, Y, Z on one qubit are changed by a Clifford turn about Z (2: X and Y). */
export const changedByTurn = (axis = 'Z'): number => turnImages(axis, 'c+').filter((x) => x.image !== x.letter).length

/* ---------------------------------------------------------------- Clifford bookkeeping */

function forwardGate(gate: PbcGate, p: Pauli): Pauli {
  switch (gate.g) {
    case 'H':
    case 'S':
    case 'Sdg':
      return p.conjugate(gate.g, gate.q)
    case 'CNOT':
      return p.conjugate('CNOT', gate.c, gate.t)
    case 'R':
      return rotateConj(p, Pauli.parse(gate.pauli), gate.angle as 'c+' | 'c-', 'forward')
    default:
      throw new Error(`pbc: ${gate.g} is not a Clifford gate`)
  }
}
function backwardGate(gate: PbcGate, p: Pauli): Pauli {
  switch (gate.g) {
    case 'H':
      return p.conjugate('H', gate.q)
    case 'S':
      return p.conjugate('Sdg', gate.q) // S†·P·S
    case 'Sdg':
      return p.conjugate('S', gate.q)
    case 'CNOT':
      return p.conjugate('CNOT', gate.c, gate.t)
    case 'R':
      return rotateConj(p, Pauli.parse(gate.pauli), gate.angle as 'c+' | 'c-', 'backward')
    default:
      throw new Error(`pbc: ${gate.g} is not a Clifford gate`)
  }
}

const axisOf = (gate: PbcGate, wires: number): string => {
  if (gate.g === 'R') return gate.pauli
  if (gate.g === 'T' || gate.g === 'Tdg') return 'I'.repeat(gate.q) + 'Z' + 'I'.repeat(wires - gate.q - 1)
  throw new Error('pbc: a Clifford gate has no rotation axis')
}
const angleOf = (gate: PbcGate): 't+' | 't-' => (gate.g === 'T' ? 't-' : gate.g === 'Tdg' ? 't+' : (gate as { angle: TurnAngle }).angle) as 't+' | 't-'

export interface Rotation {
  /** The axis letters (no sign). */
  pauli: string
  /** The sign of the axis (−1 means the rotation is about −pauli). */
  sign: 1 | -1
  /** The angle code of the gate as written (T = t−, T† = t+); the effective turn about `pauli` is this times `sign`. */
  angle: 't+' | 't-'
  /** Index of the gate it came from. */
  source: number
  /** The axis as written in the input (Z on the gate's wire for T and T†). */
  written: string
  changed: boolean
}
export interface Compiled {
  wires: number
  upTo: number
  /** Rotations collected from the first `upTo` gates, in order. */
  rotations: Rotation[]
  /** The gates not yet passed, as written. */
  remaining: PbcGate[]
  /** How many Clifford gates have been passed (they make up the pending Clifford). */
  passed: number
  pendingIdentity: boolean
  pendingName: string
  /** Layers among the collected rotations (0 when none). */
  layers: number
  /** T-like gates in the WHOLE program, and how many of the collected rotations changed axis. */
  tCount: number
  changed: number
}

/** Layer of each rotation: one after the latest earlier rotation it does not commute with. */
export function layersOf(rots: readonly { pauli: string }[]): number[] {
  const ps = rots.map((x) => Pauli.parse(x.pauli))
  const layer: number[] = []
  ps.forEach((p, i) => {
    let l = 0
    for (let j = 0; j < i; j++) if (!p.commutesWith(ps[j])) l = Math.max(l, layer[j] + 1)
    layer.push(l)
  })
  return layer
}

function imagesOfPending(wires: number, passed: readonly PbcGate[]): { x: Pauli; z: Pauli }[] {
  return Array.from({ length: wires }, (_, w) => {
    let x = Pauli.single(wires, w, 'X')
    let z = Pauli.single(wires, w, 'Z')
    for (const g of passed) {
      x = forwardGate(g, x)
      z = forwardGate(g, z)
    }
    return { x, z }
  })
}

function nameOfPending(wires: number, passed: readonly PbcGate[]): { identity: boolean; name: string } {
  const imgs = imagesOfPending(wires, passed)
  const same = (a: { x: Pauli; z: Pauli }[], b: { x: Pauli; z: Pauli }[]): boolean => a.every((p, i) => p.x.equals(b[i].x) && p.z.equals(b[i].z))
  const idImgs = imagesOfPending(wires, [])
  if (same(imgs, idImgs)) return { identity: true, name: 'identity' }
  const candidates: [string, PbcGate[]][] =
    wires === 1
      ? [['H', [{ g: 'H', q: 0 }]], ['S', [{ g: 'S', q: 0 }]], ['S†', [{ g: 'Sdg', q: 0 }]]]
      : wires === 2
        ? [['CNOT', [{ g: 'CNOT', c: 0, t: 1 }]], ['CNOT', [{ g: 'CNOT', c: 1, t: 0 }]]]
        : []
  for (const [name, gs] of candidates) if (same(imgs, imagesOfPending(wires, gs))) return { identity: false, name }
  return { identity: false, name: 'a Clifford' }
}

/** Slide the first `upTo` gates of the program to the end (default: all of them). */
export function compileAt(prog: PbcProgram, upTo = prog.gates.length): Compiled {
  if (!Number.isInteger(upTo) || upTo < 0 || upTo > prog.gates.length) throw new Error(`pbc.compileAt: upTo must be 0 … ${prog.gates.length}`)
  const passed: PbcGate[] = []
  const rotations: Rotation[] = []
  for (let i = 0; i < upTo; i++) {
    const g = prog.gates[i]
    if (isClifford(g)) {
      passed.push(g)
      continue
    }
    const written = axisOf(g, prog.wires)
    let p = Pauli.parse(written)
    for (let j = passed.length - 1; j >= 0; j--) p = backwardGate(passed[j], p)
    const { sign, pauli } = signedLetters(p)
    rotations.push({ pauli, sign, angle: angleOf(g), source: i, written, changed: pauli !== written })
  }
  const nm = nameOfPending(prog.wires, passed)
  return {
    wires: prog.wires,
    upTo,
    rotations,
    remaining: prog.gates.slice(upTo),
    passed: passed.length,
    pendingIdentity: nm.identity,
    pendingName: nm.name,
    layers: rotations.length ? Math.max(...layersOf(rotations)) + 1 : 0,
    tCount: prog.gates.filter((g) => !isClifford(g)).length,
    changed: rotations.filter((x) => x.changed).length,
  }
}
export const compile = (prog: PbcProgram): Compiled => compileAt(prog)

/* ---------------------------------------------------------------- the dense check */

/** The unitary of a gate on `n` wires. */
export function gateMatrix(g: PbcGate, n: number): DMat {
  switch (g.g) {
    case 'CNOT':
      return dCnot(g.c, g.t, n)
    case 'R':
      return dRot(g.pauli, turnRad(g.angle))
    default:
      return dEmbed1(D1[g.g], g.q, n)
  }
}
export function circuitMatrix(prog: PbcProgram, upTo = prog.gates.length): DMat {
  let U = dEye(2 ** prog.wires)
  for (const g of prog.gates.slice(0, upTo)) U = dMul(gateMatrix(g, prog.wires), U)
  return U
}
/** Multiply the Cliffords and the compiled rotations back together: is the circuit equal to C_final · R_m … R_1 (up to a global phase)? At most 4 wires. */
export function pbcEquivalent(prog: PbcProgram): boolean {
  if (prog.wires > 4) throw new Error('pbc.pbcEquivalent: at most 4 wires')
  const res = compile(prog)
  let C = dEye(2 ** prog.wires)
  for (const g of prog.gates) if (isClifford(g)) C = dMul(gateMatrix(g, prog.wires), C)
  let W = dEye(2 ** prog.wires)
  for (const x of res.rotations) W = dMul(dRot(x.pauli, turnRad(x.angle) * x.sign), W)
  return dEqualUpToPhase(circuitMatrix(prog), dMul(C, W))
}
/** Does the program multiply out to the 3-qubit Toffoli (controls 1 and 2, target 3) up to a phase? */
export function isToffoli(prog: PbcProgram): boolean {
  if (prog.wires !== 3) return false
  const T = dEye(8)
  // controlled-controlled-X: identity on |00x>, |01x>, |10x>; X on the last wire for |11x>
  for (let i = 6; i < 8; i++) T.re[i * 8 + i] = 0
  T.re[6 * 8 + 7] = 1
  T.re[7 * 8 + 6] = 1
  return dEqualUpToPhase(circuitMatrix(prog), T)
}
/** The same set of (axis, sign, angle) in two compilations (order does not matter)? */
export function sameRotationSet(a: readonly Rotation[], b: readonly Rotation[]): boolean {
  const key = (x: Rotation): string => `${x.pauli}${x.sign}${x.angle}`
  const ka = a.map(key).sort()
  const kb = b.map(key).sort()
  return ka.length === kb.length && ka.every((k, i) => k === kb[i])
}

/** Do all axes in the list commute pairwise? */
export const allCommute = (rots: readonly { pauli: string }[]): boolean => layersOf(rots).every((l) => l === 0)

/* ---------------------------------------------------------------- a measurement swallows a turn */

/**
 * The identity behind unit b4-pbc beat b5: for anticommuting Paulis P and Q and W = i·s·Q·P (s = ±1 the outcome of measuring P),
 *   e^{iπQ/4} Π_P^s = √2 · Π_W^+ Π_P^s,   Π_P^s = (1 + sP)/2.
 * Returns the largest entry of the difference (≈ 1e-16).
 */
export function absorb(P: string, Q: string, s: 0 | 1): number {
  const n = P.length
  const Pm = dPauli(P)
  const Qm = dPauli(Q)
  const sg = s === 0 ? 1 : -1
  const I = dEye(2 ** n)
  const projP = dScale(dCombine(I, 1, 0, Pm, sg, 0), 0.5)
  const W = dScale(dMul(Qm, Pm), 0, sg) // i·s·Q·P
  const projW = dScale(dCombine(I, 1, 0, W, 1, 0), 0.5)
  const lhs = dMul(dCombine(I, Math.SQRT1_2, 0, Qm, 0, Math.SQRT1_2), projP)
  const rhs = dScale(dMul(projW, projP), Math.SQRT2)
  return dMaxAbsDiff(lhs, rhs)
}
/** A seeded sweep over anticommuting pairs of 1-3 qubit Pauli strings and both outcomes: how many cases, and how many differ by more than 1e-9. */
export function absorbSweep(cases = 240, seed = 2024): { cases: number; bad: number; worst: number } {
  const rand = rng(seed)
  const L = ['I', 'X', 'Y', 'Z']
  let done = 0
  let bad = 0
  let worst = 0
  while (done < cases) {
    const n = 1 + Math.floor(rand() * 3)
    const word = (): string => Array.from({ length: n }, () => L[Math.floor(rand() * 4)]).join('')
    const P = word()
    const Q = word()
    if (/^I+$/.test(P) || /^I+$/.test(Q) || Pauli.parse(P).commutesWith(Pauli.parse(Q))) continue
    const d = absorb(P, Q, rand() < 0.5 ? 0 : 1)
    worst = Math.max(worst, d)
    if (d > 1e-9) bad++
    done++
  }
  return { cases, bad, worst }
}
