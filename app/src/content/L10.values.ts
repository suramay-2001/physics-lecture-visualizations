/**
 * Lecture 10 numbers, computed once with the engine (owner: P). Same contract as L1–L9.values.ts: every number a learner reads in
 * L10 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in physics/__fixtures__/claims.json
 * (pipeline/make_claim_fixtures.py, "Lecture 10" block). Keys start with `l10`.
 *
 * Two spins: |u⟩ = |+z⟩ is qubit value 0 and Alice is the FIRST letter, so |ud⟩ = ket('01'); the singlet is (|ud⟩ − |du⟩)/√2 =
 * bell('01-10'). Three spins: |0⟩ ≡ |u⟩ and the players are Alice, Bob, Charlie from the left; the GHZ-game state is
 * |G⟩ = superpose('000-011-101-110'). A displayed magnitude of a negative number gets its own key (the number reader sees digits, not
 * signs). Yes/no facts are 1 or 0. "At every ..." sweeps store the worst sample (`worst`), so the value equals its target only if every
 * sample does. `applyGate` copies its input (platform pass W-448 #6), so the shared singlet and |G⟩ are never changed by a claim.
 *
 * This file imports physics/qc but no stage module: a lecture chunk may use the shared engine and must not pull in stage/svg.
 */
import { abs, abs2, c } from '../physics/complex'
import { apply, inner, madd, matmul, norm2, type Vec } from '../physics/linalg'
import { densityOf, mixtureN, purityN, reducedBloch, reducedDensity } from '../physics/qc/density'
import { pPlus } from '../physics/density'
import { chshFromAxes, chshMaxHorodecki, correlationTensor, correlator, lhvChsh } from '../physics/qc/entangle'
import { merminInstructionSets, instructionSets } from '../physics/qc/bits'
import { ghzAnswerProbs, ghzGame, ghzQuantumWin, ghzState, ghzTableResult, GHZ_ROWS, GHZ_TERMS, type GhzTable } from '../physics/qc/ghz'
import { I2, X, Y, Z, H, S, applyGate, cliffordConj, pauliEigenvalue, pauliMul, pauliString, paulisCommute } from '../physics/qc/gates'
import { expectationN, localBasisProbs, measureInBasis } from '../physics/qc/measure'
import { bell, ghz, ket, kronM, nQubits } from '../physics/qc/state'
import { KET, SIGMA_X, SIGMA_Y, SIGMA_Z, ketFromBloch, nDotSigma, prob } from '../physics/spin'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)
const len3 = (r: readonly number[]) => Math.hypot(r[0], r[1], r[2])

const sing = bell('01-10')
const G = ghzState()
const ud = ket('01')
const du = ket('10')

/* l10-local */
const YonU = apply(SIGMA_Y, KET['+z']) // (0, i)
const YonD = apply(SIGMA_Y, KET['-z']) // (−i, 0)
const joint = localBasisProbs(sing, ['z', 'x'])
const mH = kronM(H, I2)
const mS = kronM(I2, S)
const commutesHS = (() => {
  const a = matmul(mH, mS)
  const b = matmul(mS, mH)
  return a.every((row, i) => row.every((x, j) => abs(c(x.re - b[i][j].re, x.im - b[i][j].im)) < 1e-12))
})()

/* l10-empty-centre */
const rA = reducedBloch(sing, 0)
const rB = reducedBloch(sing, 1)
const axis60 = ketFromBloch(60 * DEG, 30 * DEG)
const axis60perp = ketFromBloch((180 - 60) * DEG, (30 + 180) * DEG)
const axis70 = ketFromBloch(70 * DEG, 0)
const axis70perp = ketFromBloch((180 - 70) * DEG, 180 * DEG)
const mixHalf = mixtureN([{ w: 0.5, psi: KET['+z'] }, { w: 0.5, psi: KET['-z'] }])
const mixThree = mixtureN([{ w: 0.75, psi: KET['+z'] }, { w: 0.25, psi: KET['-z'] }])
const mixZX = mixtureN([{ w: 0.5, psi: KET['+z'] }, { w: 0.5, psi: KET['+x'] }])
const blochOfRho = (rho: ReturnType<typeof mixtureN>): [number, number, number] => [2 * rho[0][1].re, -2 * rho[0][1].im, rho[0][0].re - rho[1][1].re]
const rhoA = reducedDensity(sing, [0])
const udDuMix = mixtureN([{ w: 0.5, psi: ud }, { w: 0.5, psi: du }])

/* l10-correlations */
const T = correlationTensor(sing)
const pathAt = (t: number): Vec => [c(0), c(Math.cos(t * DEG)), c(-Math.sin(t * DEG)), c(0)]
const sigmaDotTau = madd(madd(pauliString('XX'), pauliString('YY')), pauliString('ZZ'))
const dotOnSing = apply(sigmaDotTau, sing)
const TudMix = correlationTensor(udDuMix)
const Tud = correlationTensor(ud)

/* Go deeper 1: σ_n ⊗ σ_m on the singlet is −n·m. The four CHSH settings of the notes' Bell argument: Alice z and x, Bob at 135° and 45°
   between them (the two-qubit stage draws the same axes). */
const angleCorr = (deg: number) => correlator(sing, SIGMA_Z, nDotSigma([Math.sin(deg * DEG), 0, Math.cos(deg * DEG)]))
const aAxes: [[number, number, number], [number, number, number]] = [[0, 0, 1], [1, 0, 0]]
const bAxes: [[number, number, number], [number, number, number]] = [
  [Math.sin(135 * DEG) * Math.cos(180 * DEG), 0, Math.cos(135 * DEG)],
  [Math.sin(135 * DEG), 0, Math.cos(135 * DEG)],
]

/* l10-instructions: the two-player tables. */
const pair2 = instructionSets(['ZZ', 'XX'], { ZZ: -1, XX: -1 }, ['Z', 'X'])
const pair2Match = pair2.assignments.filter((a) => a.matches === 2)
const pair3 = instructionSets(['XX', 'YY', 'ZZ'], { XX: -1, YY: -1, ZZ: -1 }, ['X', 'Y', 'Z'])
const table1: GhzTable = [{ Z: 1, X: -1 }, { Z: -1, X: -1 }, { Z: -1, X: -1 }]
const tableMinus: GhzTable = [{ Z: -1, X: -1 }, { Z: -1, X: -1 }, { Z: -1, X: -1 }]
const tableOther: GhzTable = [{ Z: -1, X: 1 }, { Z: 1, X: -1 }, { Z: 1, X: 1 }]

/** The content of the shared state, for the stage's `{terms}` source (the engine's `superpose` builds the vector). */
export const GT: string = GHZ_TERMS
/**
 * The four row products of three plans (the stage's "card": what each answer sheet predicts for ZZZ, ZXX, XZX, XXZ), from the engine:
 * `minus` = every answer −1, `t1` = A_Z +1, A_X −1 and the rest −1, `other` = a third plan. Content passes these as `values`.
 */
export const CARD = {
  minus: { ...ghzTableResult(tableMinus).values },
  t1: { ...ghzTableResult(table1).values },
  other: { ...ghzTableResult(tableOther).values },
} as const

/* l10-ghz-game / l10-no-table */
const game = ghzGame()
const allProducts = game.tables.map((t) => GHZ_ROWS.reduce((p, r) => p * t.result.values[r], 1))
const T1 = ghzTableResult(table1)
const Tm = ghzTableResult(tableMinus)

/* l10-quantum-wins */
const GzzxProbs = ghzAnswerProbs(G, 'ZXX')
const qWin = ghzQuantumWin(G)
const XB_XC = applyGate(applyGate(G, X, [1]), X, [2])
const ZXXonG = applyGate(XB_XC, Z, [0])
const stringsUnderZXX = GzzxProbs.map((p, i) => [p, i] as const).filter(([p]) => p > 1e-9).map(([, i]) => i.toString(2).padStart(3, '0'))
const HS = matmul(S, H) // S after H
let rotated: Vec = ghz(3)
for (const q of [0, 1, 2]) {
  rotated = applyGate(rotated, H, [q])
  rotated = applyGate(rotated, S, [q])
}
let seq: { phase: ReturnType<typeof c>; string: string } = { phase: c(1), string: 'III' }
for (const row of GHZ_ROWS) {
  const m = pauliMul(seq.string, row)
  seq = { phase: c(seq.phase.re * m.phase.re - seq.phase.im * m.phase.im, seq.phase.re * m.phase.im + seq.phase.im * m.phase.re), string: m.string }
}

/* l10-what-ghz-proves */
const marginalAlice = (row: 'ZZZ' | 'ZXX' | 'XZX' | 'XXZ') => ghzAnswerProbs(G, row).reduce((s, p, i) => s + (i < 4 ? p : 0), 0) // Alice answers +1 when her bit is 0
const singAfterBob = applyGate(sing, H, [1])
const mermin = merminInstructionSets()

export const V = {
  /* l10-local */
  l10SingAmp: sing[1].re, // 0.7071: the amplitude of |ud⟩
  l10YonU: YonU[1].im, // 1: Y|u⟩ = i|d⟩
  l10YonDsize: -YonD[0].im, // 1: Y|d⟩ = −i|u⟩ (the size of the coefficient)
  l10ZAdu: pauliEigenvalue(du, 'ZI') ?? 0, // −1: Z_A|du⟩ = −|du⟩
  l10XBdu: yes(abs2(applyGate(du, X, [1])[3]) > 1 - 1e-12), // 1: X_B|du⟩ = |dd⟩
  l10LocalCommute: yes(paulisCommute('ZI', 'IX')), // 1
  l10LocalCommuteHS: yes(commutesHS), // 1: H on Alice and S on Bob commute as well
  l10XAYAcommute: yes(paulisCommute('XI', 'YI')), // 0: two operators of the SAME spin do not
  l10ZXjoint: worst(joint, 0.25), // ¼ for each of the four joint outcomes
  /* l10-empty-centre */
  l10ZAavg: expectationN(sing, Z, [0]).re, // 0
  l10XAoverlap: abs(inner(sing, applyGate(sing, X, [0]))), // 0
  l10YAavg: expectationN(sing, Y, [0]).re, // 0
  l10BobAvgs: worst([expectationN(sing, X, [1]).re, expectationN(sing, Y, [1]).re, expectationN(sing, Z, [1]).re], 0), // 0: Bob's three
  l10RA: len3(rA), // 0: Alice's Bloch vector
  l10RB: len3(rB), // 0
  l10Phalf: measureInBasis(sing, 0, [axis60, axis60perp]).p[0], // ½ along (60°, 30°)
  l10Axis70: measureInBasis(sing, 0, [axis70, axis70perp]).p[0], // ½ along 70° from z
  l10MixCentre: len3(blochOfRho(mixHalf)), // 0: half |+z⟩ and half |−z⟩
  l10Mix3to1Rz: blochOfRho(mixThree)[2], // 0.5: ¾ up and ¼ down
  l10MixZX: len3(blochOfRho(mixZX)), // 0.7071: half |+z⟩ and half |+x⟩
  l10PlusZx: prob(KET['+x'], KET['+z']), // ½
  l10CentreChance: worst([[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.6, 0, 0.8]].map((n) => pPlus([0, 0, 0], n as [number, number, number])), 0.5), // ½ along every axis at the centre of the ball
  l10PairPure: purityN(densityOf(sing)), // 1: the pair is one known pure state
  l10RhoA: rhoA[0][0].re, // ½ (and ρ_A has ½ on both diagonal places, none off it)
  l10RhoAoff: abs(rhoA[0][1]), // 0
  l10RhoAPurity: purityN(rhoA), // ½
  l10MixXX: TudMix[0][0], // 0: half |ud⟩, half |du⟩ has no xx correlation
  l10SingXX: T[0][0], // −1
  /* l10-correlations */
  l10ZZ: pauliEigenvalue(sing, 'ZZ') ?? 0, // −1
  l10ZZequal: localBasisProbs(sing, ['z', 'z'])[0] + localBasisProbs(sing, ['z', 'z'])[3], // 0: never equal
  l10ZZoneSide: localBasisProbs(sing, ['z', 'z'])[1], // ½: each of the two opposite pairs
  l10XX: pauliEigenvalue(sing, 'XX') ?? 0, // −1
  l10YY: pauliEigenvalue(sing, 'YY') ?? 0, // −1
  l10TgridDev: Math.max(...T.flatMap((row, i) => row.map((x, j) => Math.abs(x - (i === j ? -1 : 0))))), // 0: the grid is −I
  l10PathR0: len3(reducedBloch(pathAt(0), 0)), // 1
  l10PathR30: len3(reducedBloch(pathAt(30), 0)), // 0.5
  l10PathR45: len3(reducedBloch(pathAt(45), 0)), // 0
  l10PathXX0: correlationTensor(pathAt(0))[0][0], // 0
  l10PathXX30Size: -correlationTensor(pathAt(30))[0][0], // 0.8660: the size of the xx cell at 30°
  l10PathXX45Size: -correlationTensor(pathAt(45))[0][0], // 1
  l10DotST: (() => {
    const e = inner(sing, dotOnSing) // ⟨ψ|(σ·τ)|ψ⟩ with ψ the singlet: the eigenvalue when ψ is an eigenvector
    return e.re
  })(), // −3
  l10DotSTeigen: yes(dotOnSing.every((a, i) => abs(c(a.re + 3 * sing[i].re, a.im + 3 * sing[i].im)) < 1e-12)), // 1: (σ·τ)|singlet⟩ = −3|singlet⟩
  l10ZX: correlator(sing, SIGMA_Z, SIGMA_X), // 0
  l10UDzz: Tud[2][2], // −1: |ud⟩ has a zz correlation
  l10UDxx: Tud[0][0], // 0
  l10UDrz: reducedBloch(ud, 0)[2], // 1: Alice's arrow reaches the surface
  /* Go deeper 1 */
  l10Ang60: angleCorr(60), // −0.5
  l10Ang60size: Math.abs(angleCorr(60)), // 0.5
  l10Ang90: angleCorr(90), // 0
  l10Ang120: angleCorr(120), // 0.5
  l10Ang180: angleCorr(180), // 1
  l10Ang0: angleCorr(0), // −1
  l10Opp60: (1 - angleCorr(60)) / 2, // 0.75: the results differ with this chance at 60°
  l10LhvMax: lhvChsh().maxS, // 2
  l10Tsirelson: chshMaxHorodecki(sing), // 2.8284
  l10ChshDrawn: chshFromAxes(sing, aAxes, bAxes), // 2.8284 at the drawn settings
  /* l10-instructions */
  l10TableRows: yes(pair2Match.every((a) => pauliEigenvalue(sing, 'ZZ') === a.values.ZZ && pauliEigenvalue(sing, 'XX') === a.values.XX)), // 1: the singlet's ZZ and XX are the tables' −1, −1
  l10Tables2: pair2Match.length, // 4
  l10Tables2Of: pair2.assignments.length, // 16
  l10Tables2AliceUp: pair2Match.filter((a) => a.answers[0].Z === 1).length, // 2: of the four matching tables Alice's A_Z is +1 in two
  l10Tables2AliceShare: pair2Match.filter((a) => a.answers[0].Z === 1).length / pair2Match.length, // ½
  l10Tables3: pair3.histogram[3], // 8
  l10Tables3Of: pair3.assignments.length, // 64
  /* l10-ghz-game */
  l10Dim3: 2 ** nQubits(ket('000')), // 8
  l10ZXXsize: pauliString('ZXX').length, // 8
  l10AllMinusWins: Tm.wins, // 3
  l10AllMinusRate: Tm.wins / 4, // ¾: the long-run win rate of the plan
  l10AllMinusLoses: yes(!Tm.win.ZZZ && Tm.win.ZXX && Tm.win.XZX && Tm.win.XXZ), // 1: it loses ZZZ only
  l10Tables: game.tables.length, // 64
  l10Wins3: game.histogram[3], // 32
  l10Wins1: game.histogram[1], // 32
  l10Wins0or2or4: Object.keys(game.histogram).filter((k) => !['1', '3'].includes(k)).length, // 0: no table fails an even number of inputs
  /* l10-no-table */
  l10ProdCard: worst(allProducts, 1), // +1 for all 64 tables
  l10ProdTarget: game.targetsProduct, // −1
  l10Classical: game.classicalBound, // 0.75
  l10MaxWins: game.maxWins, // 3
  l10T1Wins: T1.wins, // 3
  l10T1Loses: yes(T1.win.ZZZ && !T1.win.ZXX && T1.win.XZX && T1.win.XXZ), // 1: it loses ZXX only
  l10RandomTable: game.tables.reduce((s, t) => s + t.result.wins / 4, 0) / game.tables.length, // ½
  /* l10-quantum-wins */
  l10GampSize: abs(G[0]), // ½
  l10Gnorm: norm2(G), // 1
  l10Gterms: G.filter((a) => abs(a) > 1e-9).length, // 4
  l10ZZZ: pauliEigenvalue(G, 'ZZZ') ?? 0, // +1
  l10GzzzProbs: worst(localBasisProbs(G, ['z', 'z', 'z']).filter((p) => p > 1e-9), 0.25), // ¼ on each of the four strings
  l10AliceHalf: marginalAlice('ZZZ'), // ½: Alice's own answer under ZZZ
  l10ZXX: pauliEigenvalue(G, 'ZXX') ?? 0, // −1
  l10ZXXvec: yes(ZXXonG.every((a, i) => abs(c(a.re + G[i].re, a.im + G[i].im)) < 1e-12)), // 1: ZXX|G⟩ = −|G⟩
  l10XZX: pauliEigenvalue(G, 'XZX') ?? 0, // −1
  l10XXZ: pauliEigenvalue(G, 'XXZ') ?? 0, // −1
  l10QWin: worst(qWin.perInput.map((p) => p.win), 1), // 1 for each input
  l10QWinMean: qWin.mean, // 1
  l10AliceZXX: worst(GHZ_ROWS.map((r) => marginalAlice(r)), 0.5), // ½ under every input
  l10StringsZXX: stringsUnderZXX.length, // 4
  l10String001: yes(stringsUnderZXX.includes('001')), // 1: 001 can appear under ZXX
  l10String000: yes(stringsUnderZXX.includes('000')), // 0: 000 cannot
  /* Go deeper 2 */
  l10Rotated: yes(rotated.every((a, i) => abs(c(a.re - G[i].re, a.im - G[i].im)) < 1e-12)), // 1: H then S on each spin turns the textbook GHZ state into |G⟩
  l10ConjX: cliffordConj(HS, 'X')?.sign ?? 0, // +1 (and the letter is Z)
  l10ConjXletterIsZ: yes(cliffordConj(HS, 'X')?.pauli === 'Z'), // 1
  l10ConjYletterIsX: yes(cliffordConj(HS, 'Y')?.pauli === 'X' && cliffordConj(HS, 'Y')?.sign === 1), // 1
  l10MerminMax: mermin.maxMatches, // 3, the same ceiling
  /* l10-what-ghz-proves */
  l10OpProductSign: seq.phase.re, // −1: ZZZ·ZXX·XZX·XXZ = −III
  l10OpProductIsIdentity: yes(seq.string === 'III' && Math.abs(seq.phase.im) < 1e-12), // 1
  l10NoSignal: worst([marginalAlice('ZZZ'), marginalAlice('ZXX'), marginalAlice('XZX'), marginalAlice('XXZ')], 0.5), // ½ whatever the others measure
  l10RAstill: len3(reducedBloch(singAfterBob, 0)), // 0: a local gate on Bob leaves Alice at the centre
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L10 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
