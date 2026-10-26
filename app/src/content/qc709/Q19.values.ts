/**
 * Chapter Q19 numbers (Physics 709, "Walks, simulation and hybrid algorithms"), computed once with the engine (physics/qc/walk.ts, trotter.ts, variational.ts, grover.ts).
 * Plan: docs/roles/proposals/P-Q19-story.md; rulings docs/roles/decisions/qc709-Q19.md.
 *
 * Every number a learner reads in Q19 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q19.json (pipeline/claims_qc709/q19.py, an independent route built on pipeline/walk_numpy.py: directed arcs with 2J/n - I, the
 * circuit form X_dir (|0><0| (x) O + |1><1| (x) D), a momentum-space FFT coin walk, Pauli matrices with scipy expm, spectral norms, dense QAOA matrices; never the
 * engine's own code). Keys start with `q19` and are unique across both courses.
 *
 * Running examples (ruling R5). The star graph has N = SPOKES (Bergou's Fig. 7.7 has N = 8 outer vertices; his §7.8 uses N for the vertices of a graph, here n = 4 for the ring).
 * Star N = 8: 16 edge states on four wires, marked spoke 1; the extra edge {1, 2} for the picture (18 states) and N = 64, 1024 for the numbers; the 3-spin Heisenberg chain
 * with J = 1 and t = 2; the 4-cycle for QAOA. Every `...Gap` value is a max-abs difference between two routes and is about 1e-15, not exactly 0: it is shown through d(x, 0),
 * which prints 0, and claimed with close(x, 0, 1e-12).
 */
import { type Mat } from '../../physics/linalg'
import { type Circuit, type Op, runCircuit } from '../../physics/qc/circuit'
import { groverCircuit } from '../../physics/qc/grover'
import {
  bondClosedGap,
  bondSwapChance,
  chainTerms,
  commutatorNorm,
  heisenbergBond,
  magnonChances,
  magnonRoutesGap,
  amplitudeCount,
  amplitudePB,
  swapIdentityGap,
  trotterBound,
  trotterCircuit,
  trotterError,
  trotterMFor,
} from '../../physics/qc/trotter'
import {
  coinWalk,
  coinWalkSigma,
  connectFail,
  connectSteps,
  extraAsymptoticWeights,
  extraDeltaBergou,
  extraPolyGap,
  extraReducedGap,
  extraStepsBergou,
  extraWalkChances,
  extraWalkPeak,
  extraWalkSeries,
  pathHitting,
  scatterRT,
  scatterVertex,
  starCharPoly,
  starCircuitGap,
  starDeltaBergou,
  starEigenAngles,
  starEigenGap,
  starReducedChance,
  starReducedGap,
  starReducedM,
  starSpokeChances,
  starStates,
  starStepsBergou,
  starUnitaryGap,
  starWalkCircuit,
  starWalkFirstPeak,
  starWalkMarked,
  starWalkState,
  vertexInversionGap,
  vertexUnitaryGap,
  walkChance,
  walkGroverGap,
  walkSigmaClassical,
} from '../../physics/qc/walk'
import {
  costHamiltonianGap,
  cutHistogram,
  cutDistribution,
  cutValue,
  maxCut,
  meanCut,
  optimalGuessChance,
  qaoaChance,
  qaoaCircuit,
  qaoaCircuitGap,
  qaoaF,
  qaoaGridBest,
  qaoaPatternSearch,
  qaoaRingFormulaGap,
  ringEdges,
  shotsFor,
} from '../../physics/qc/variational'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180

/* ---------------------------------------------------------------------------------------------- */
/* The circuits (plan "Stage shorthand"), built once so a story's stage states share one object      */
/* ---------------------------------------------------------------------------------------------- */
const gate = (g: 'H', q: number): Op => ({ op: 'gate', gate: g, targets: [q] })
const box = (m: Mat, targets: number[], label: string): Op => ({ op: 'unitary', matrix: m.map((row) => row.map((z): [number, number] => [z.re, z.im])), targets, label })

/** Two fair coins: Hadamards on two wires from 00 (four equal chances). */
export const C_COINS2: Circuit = { version: 1, qubits: 2, init: '00', wires: ['c₁', 'c₂'], columns: [[gate('H', 0), gate('H', 1)]] }
/** The centre vertex of the 8-spoke star as one box U_v on three wires, from the arrival on spoke 1 (the string 000). */
export const C_V: Circuit = { version: 1, qubits: 3, init: '000', wires: ['j₂', 'j₁', 'j₀'], columns: [[box(scatterVertex(8), [0, 1, 2], 'U_v')]] }
/** Chapter Q17's one Grover step on three wires with the marked string 000: oracle, then a mirror about the mean (5 columns). */
export const C_G8: Circuit = groverCircuit(3, [0], 1)
/** The 8-spoke star walk on four wires (d, j₂, j₁, j₀): Hadamards on the spoke wires, then k boxes W. Memoised per k. */
const memoW = new Map<number, Circuit>()
export const C_W = (k: number): Circuit => {
  let C = memoW.get(k)
  if (!C) memoW.set(k, (C = starWalkCircuit(8, 1, k)))
  return C
}
/** One bond gate at Jt = π on two wires from 10 (box U_n). */
export const C_BOND: Circuit = { version: 1, qubits: 2, init: '10', wires: ['s₁', 's₂'], columns: [[box(heisenbergBond(Math.PI), [0, 1], 'U_n')]] }
/** The Trotter circuit on three spins from 100 (t = 2, J = 1): M pieces, first or second order (engine trotterCircuit). */
const memoT = new Map<string, Circuit>()
export const C_TR = (M: number, order: 1 | 2): Circuit => {
  const key = `${M}/${order}`
  let C = memoT.get(key)
  if (!C) memoT.set(key, (C = trotterCircuit(M, order)))
  return C
}
/** QAOA on the 4-cycle at angles (gamma, beta): 4 columns (H, two phase columns, Rx). Memoised. */
const memoQ = new Map<string, Circuit>()
export const C_Q = (gamma: number, beta: number): Circuit => {
  const key = `${gamma}/${beta}`
  let C = memoQ.get(key)
  if (!C) memoQ.set(key, (C = qaoaCircuit(4, EDGES, gamma, beta)))
  return C
}

/* ---------------------------------------------------------------------------------------------- */
/* Values                                                                                          */
/* ---------------------------------------------------------------------------------------------- */
const EDGES = ringEdges(4)
export const GAMMA_A = 0.7 // the drawn circuit of qaoa:b2 and b3
export const BETA_A = 0.3
export const GAMMA_STAR = Math.PI / 4
export const BETA_STAR = Math.PI / 8

const RT8 = scatterRT(8)
const RT5 = scatterRT(5)
const RT2 = scatterRT(2)
const RT1 = scatterRT(1)
const M8 = starReducedM(8)
const EIG8 = starEigenAngles(8)
const EIG16 = starEigenAngles(16)
const GROVER_END = runCircuit(C_G8).states.at(-1)!
const star = (n: number) => starWalkState(8, { marked: 1 }, n)
// the start on all arriving edges: the chance on spoke 1 over the first 13 steps
const inChance = Array.from({ length: 13 }, (_, n) => starSpokeChances(8, { marked: 1 }, n, { start: 'in' }).spokes[0])
const inMax = Math.max(...inChance)
// the chance on spokes 1, 2 and on the extra edge with the plus start, best over n = 0 … 40
const plus64 = extraWalkSeries(64, 40, 1)
const peak64 = extraWalkPeak(64)
const E64 = extraWalkChances(64, peak64)
const classical3 = [-3, -2, -1, 0, 1, 2, 3].map((x) => walkChance(3, x))
const coin3 = coinWalk(3)
const MAG_EXACT = magnonChances(3, 1, 2)
const MAG_M1 = magnonChances(3, 1, 2, 1, 1)
const MAG_M4 = magnonChances(3, 1, 2, 4, 1)
const MAG_M8 = magnonChances(3, 1, 2, 8, 1)
const dist = cutDistribution(4, EDGES, GAMMA_STAR, BETA_STAR)
const best = qaoaGridBest(4, EDGES)
const hist = cutHistogram(4, EDGES)
const loop = qaoaPatternSearch((g, b) => qaoaF(4, EDGES, g, b), [0.3, 0.2], 0.2, 0.01)
const loopStart = loop.path[0]
const loopEnd = loop.path[loop.path.length - 1]

export const V = {
  // ---- q19-random-walk
  q19P2Left: walkChance(2, -2),
  q19P2Mid: walkChance(2, 0),
  q19P10Zero: walkChance(10, 0),
  q19SigmaClass100: walkSigmaClassical(100),
  q19ConnSteps10: connectSteps(10),
  q19ConnFail5: connectFail(5),
  q19PathHit10: pathHitting(10),
  q19CoinSigma10: coinWalkSigma(10),
  q19CoinSigma100: coinWalkSigma(100),
  q19CoinRatio100: coinWalkSigma(100) / 100,
  q19Coin3Binomial: Math.max(...classical3.map((p, k) => Math.abs(p - coin3[k]))),
  q19P4Zero: walkChance(4, 0),
  q19Conn6: connectSteps(6),

  // ---- q19-scatter
  q19EdgeStates8: starStates(8).length,
  q19Vertex8R: RT8.r,
  q19Vertex8T: RT8.t,
  q19VertexUnit8: vertexUnitaryGap(8),
  q19VertexIsInv8: vertexInversionGap(8),
  q19Grover8Marked: Math.hypot(GROVER_END[0].re, GROVER_END[0].im),
  q19Grover8Other: Math.hypot(GROVER_END[1].re, GROVER_END[1].im),
  q19Vertex1: -RT1.r,
  q19Vertex2R: RT2.r,
  q19Vertex2T: RT2.t,
  q19Vertex5T: RT5.t,
  q19Vertex5MinusR: -RT5.r,

  // ---- q19-star-search
  q19WalkUnit8: starUnitaryGap(8, { marked: 1 }),
  q19WalkCircuitGap: starCircuitGap(8, 1, 4),
  q19MGap: starReducedGap(8),
  q19MR: -M8[0][1],
  q19MT: M8[0][3],
  q19Alpha8: EIG8[0] / DEG,
  q19Delta8Deg: starDeltaBergou(8) / DEG,
  q19CharPoly8: Math.max(...starCharPoly(8).map((a, k) => Math.abs(a - [1, 0, -2 * RT8.r, 0, 1][k]))),
  q19EigenGap8: starEigenGap(8),
  q19StarP2: starWalkMarked(8, 2),
  q19StarP4: starWalkMarked(8, 4),
  q19StarAmp4: star(4)[0],
  q19StarAmp5: star(5)[8],
  q19StarPeak8: starWalkFirstPeak(8),
  q19Bergou8: starStepsBergou(8),
  q19WalkIsGrover: walkGroverGap(30),
  q19StarN1024: starWalkFirstPeak(1024),
  q19StarP1024: starReducedChance(1024, starWalkFirstPeak(1024)),
  q19Bergou1024: starStepsBergou(1024),
  q19ClassAvg1024: (1024 + 1) / 2,
  q19StarPeak16: starWalkFirstPeak(16),
  q19StarP16: starWalkMarked(16, starWalkFirstPeak(16)),
  q19InStart8: inMax,
  q19InStartStep: inChance.findIndex((p) => p >= inMax - 1e-9),
  q19InStart4: inChance[4],
  q19Alpha16: EIG16[0] / DEG,
  q19StarPeak64: starWalkFirstPeak(64),

  // ---- q19-extra-edge
  q19Extra8Dim: starStates(8, { extra: [1, 2] }).length,
  q19ExtraUnit: starUnitaryGap(8, { extra: [1, 2] }),
  q19M5Gap: extraReducedGap(8),
  q19ExtraPoly: extraPolyGap(8),
  q19ExtraDelta64: extraDeltaBergou(64),
  q19ExtraAsym: extraAsymptoticWeights(Math.PI / 2).near,
  q19ExtraAsymEdge: extraAsymptoticWeights(Math.PI / 2).edge,
  q19ExtraPeak64: peak64,
  q19ExtraNear64: E64.near,
  q19ExtraEdge64: E64.edge,
  q19ExtraBergou64: extraStepsBergou(64),
  q19ExtraPeak8: extraWalkPeak(8),
  q19Extra8Near: extraWalkChances(8, extraWalkPeak(8)).near,
  q19ExtraPlus64: Math.max(...plus64.near),
  q19ExtraPlusEdge64: Math.max(...plus64.edge),
  q19ExtraPeak1024: extraWalkPeak(1024),
  q19ExtraBergou1024: extraStepsBergou(1024),

  // ---- q19-simulation
  q19Amps50: amplitudeCount(50) / 1e15,
  q19Bytes50: amplitudePB(50),
  q19Terms50: chainTerms(50),
  q19Amps20: amplitudeCount(20),
  q19SwapIdentity: swapIdentityGap(),
  q19BondClosed: Math.max(bondClosedGap(Math.PI), bondClosedGap(1.7), bondClosedGap(0.5)),
  q19BondSwapChance: bondSwapChance(Math.PI),
  q19SwapJt: Math.PI,
  q19Comm: commutatorNorm(3, 1),
  q19TrotErr1: trotterError(3, 1, 2, 1, 1),
  q19TrotErr4: trotterError(3, 1, 2, 4, 1),
  q19TrotErr8: trotterError(3, 1, 2, 8, 1),
  q19TrotErr14: trotterError(3, 1, 2, 14, 1),
  q19TrotErr15: trotterError(3, 1, 2, 15, 1),
  q19TrotBound8: trotterBound(3, 1, 2, 8),
  q19TrotRatio1: trotterError(3, 1, 2, 4, 1) / trotterError(3, 1, 2, 8, 1),
  q19Trot2Err3: trotterError(3, 1, 2, 3, 2),
  q19Trot2Err4: trotterError(3, 1, 2, 4, 2),
  q19Trot2Ratio: trotterError(3, 1, 2, 4, 2) / trotterError(3, 1, 2, 8, 2),
  q19TrotMFor05: trotterMFor(3, 1, 2, 1, 0.05)!,
  q19Trot2MFor05: trotterMFor(3, 1, 2, 2, 0.05)!,
  q19MagnonExact1: MAG_EXACT[0],
  q19MagnonExact2: MAG_EXACT[1],
  q19MagnonExact3: MAG_EXACT[2],
  q19MagnonTrotM1: MAG_M1[2],
  q19MagnonTrotM4: MAG_M4[2],
  q19MagnonTrotM8: MAG_M8[2],
  q19MagnonRoutes: magnonRoutesGap(3, 1, 2),

  // ---- q19-qaoa
  q19Assign4: hist.reduce((s, k) => s + k, 0),
  q19MaxCut: maxCut(4, EDGES).value,
  q19CutCount4: maxCut(4, EDGES).strings.length,
  q19CutMean: meanCut(4, EDGES),
  q19CutHist0: hist[0],
  q19CutHist2: hist[2],
  q19HcGap: costHamiltonianGap(4, EDGES),
  q19GammaA: GAMMA_A,
  q19BetaA: BETA_A,
  q19F0Gamma: qaoaF(4, EDGES, 0, BETA_A),
  q19F0Beta: qaoaF(4, EDGES, GAMMA_A, 0),
  q19QaoaCircuitGap: qaoaCircuitGap(4, EDGES, GAMMA_A, BETA_A),
  q19RingFormulaGap: qaoaRingFormulaGap(),
  q19FStar: best.F,
  q19GammaStar: best.gammaDeg,
  q19BetaStar: best.betaDeg,
  q19QaoaRatio: best.F / maxCut(4, EDGES).value,
  q19QaoaPOpt: dist[4],
  q19QaoaP0101: qaoaChance(4, EDGES, GAMMA_STAR, BETA_STAR, '0101'),
  q19QaoaP2: dist[2],
  q19QaoaP0: dist[0],
  q19CutRandomP: optimalGuessChance(4, EDGES),
  q19LoopStartG: loopStart.gamma,
  q19LoopStartB: loopStart.beta,
  q19LoopMoves: loop.moves,
  q19LoopEvals: loop.evals,
  q19LoopStart: loopStart.f,
  q19LoopEnd: loopEnd.f,
  q19LoopGamma: loopEnd.gamma,
  q19LoopBeta: loopEnd.beta,
  q19LoopGammaDeg: loopEnd.gamma / DEG,
  q19LoopBetaDeg: loopEnd.beta / DEG,
  q19Shots90: shotsFor(dist[4], 0.9),
  q19Shots90Random: shotsFor(optimalGuessChance(4, EDGES), 0.9),
  q19Cut0011: cutValue('0011', EDGES),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
