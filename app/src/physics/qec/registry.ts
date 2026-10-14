/**
 * The registry of drawable codes (stage kind `code`, content/stage.ts; also for films, openers and the Papers recipes): a code is named by an ID, never by
 * authored coordinates. An entry bundles what a picture of a code needs and asks of the engine, all of it built here from `codes.ts`, `bb.ts` and `stabilizer.ts`:
 *
 *   - the code as a `StabilizerCode` whose generators are the checks in the order the pictures list them (CSS codes: the X checks first, then the Z checks,
 *     exactly `CSSCode.stabilizer()`); n, k and the rank are the engine's;
 *   - a DRAWING position for every data qubit and every check (x to the right, y DOWN, one unit between neighbours). The positions of the small codes are a
 *     drawing choice (a row, a 3 × 3 grid with groups as rows, the corner/edge/centre points of a triangle for Steane, a pentagon); the surface code's are
 *     the engine's own (`rotatedSurfaceCode`: data at (column, row), checks at the face centres, boundary checks half a step outside), and the bicycle codes'
 *     are the engine's Tanner-graph positions (`BBCode.tanner()`, the paper's Fig. 3b: 2 × 2 per cell, y flipped to point down);
 *   - the textbook logical operators X̄, Z̄ (k = 1 codes), which fix what |0̄⟩ and |1̄⟩ mean (codewords.ts) and how a residual is named (`classifyResidual`);
 *   - a lookup decoder (the lightest error per syndrome), the distance (exact where the search is complete, the paper's reported number for the bicycle codes),
 *     and a minimum-weight logical operator whose support the picture can mark (for the bicycle codes: an operator of the weight the paper gives, an upper bound).
 *
 * Everything is built lazily, once per ID. Pure TypeScript (qec/purity.test.ts).
 */
import { BBCode, GROSS_SPEC, REPORTED, TWO_GROSS_SPEC, bbCode, paperLogicalBasis } from './bb'
import { CSSCode, cssDistance, fiveQubitCode, lookupDecoder, repetitionCode, rotatedSurfaceCode, shorCode, stabilizerDistance, steaneCode, type LookupDecoder, type RotatedSurface } from './codes'
import { Pauli } from './pauli'
import type { StabilizerCode } from './stabilizer'

/** The IDs, in the order the stage kind lists them (content/stage.ts `CODE_IDS` repeats this list; a test keeps the two equal). */
export const REGISTERED_CODE_IDS = ['rep3', 'rep3x', 'shor9', 'steane7', 'five5', 'surface3', 'surface5', 'gross', 'two-gross'] as const
export type RegisteredCodeId = (typeof REGISTERED_CODE_IDS)[number]

export type CodeFamily = 'small' | 'surface' | 'torus'
/** What a check acts with: 'X' or 'Z' for a CSS code, 'mixed' when it has more than one kind of letter (the five-qubit code). */
export type CheckKind = 'X' | 'Z' | 'mixed'

export interface CodeDistanceInfo {
  /** The distance, when it is known: the exact minimum weight of a logical operator (n ≤ 25) or null. */
  d: number | null
  /** The distance the paper reports (bicycle codes only; never computed here). */
  reported: number | null
  /** True when `d` is the exact minimum weight. */
  exact: boolean
}

export interface RegisteredCode {
  id: RegisteredCodeId
  name: string
  family: CodeFamily
  n: number
  /** The generators = the checks, in drawing order. */
  stabilizer: StabilizerCode
  css: CSSCode | null
  k: number
  rank: number
  /** The kind of each check (parallel to `stabilizer.generators`). */
  checkKind: CheckKind[]
  /** Drawing positions, x right and y DOWN, one unit between neighbours. */
  qubitPos: [number, number][]
  checkPos: [number, number][]
  /** Faces that group an X check and a Z check of the same support (Steane): the qubits and the two check indices. Drawn as one shaded region. */
  faces: { qubits: number[]; checks: number[] }[]
  /** Textbook logical operators X̄ and Z̄ for k = 1 codes (they define |0̄⟩ as the +1 eigenstate of Z̄ and |1̄⟩ = X̄|0̄⟩), else null. */
  logical: { X: Pauli; Z: Pauli } | null
  surface: RotatedSurface | null
  bb: BBCode | null
  /** The heaviest error the lookup decoder enumerates (0 for a code with no decoder: the bicycle codes). */
  decoderWeight: number
}

/* ------------------------------------------------------------------------------------------------ small helpers */
const P = (s: string): Pauli => Pauli.parse(s)
const kindsOf = (gens: readonly Pauli[]): CheckKind[] =>
  gens.map((g) => {
    const hasX = g.x.some((v, j) => v === 1 && g.z[j] === 0)
    const hasZ = g.z.some((v, j) => v === 1 && g.x[j] === 0)
    const hasY = g.x.some((v, j) => v === 1 && g.z[j] === 1)
    return hasY || (hasX && hasZ) ? 'mixed' : hasX ? 'X' : 'Z'
  })

interface Spec {
  name: string
  family: CodeFamily
  code: StabilizerCode
  css: CSSCode | null
  qubitPos: [number, number][]
  checkPos: [number, number][]
  faces?: { qubits: number[]; checks: number[] }[]
  logical?: { X: string; Z: string }
  surface?: RotatedSurface
  bb?: BBCode
  decoderWeight: number
}

function build(id: RegisteredCodeId, s: Spec): RegisteredCode {
  const gens = s.code.generators
  if (s.qubitPos.length !== s.code.n) throw new Error(`registry ${id}: ${s.qubitPos.length} qubit positions for n = ${s.code.n}`)
  if (s.checkPos.length !== gens.length) throw new Error(`registry ${id}: ${s.checkPos.length} check positions for ${gens.length} checks`)
  return {
    id,
    name: s.name,
    family: s.family,
    n: s.code.n,
    stabilizer: s.code,
    css: s.css,
    k: s.code.k,
    rank: s.code.rank,
    checkKind: kindsOf(gens),
    qubitPos: s.qubitPos,
    checkPos: s.checkPos,
    faces: s.faces ?? [],
    logical: s.logical ? { X: P(s.logical.X), Z: P(s.logical.Z) } : null,
    surface: s.surface ?? null,
    bb: s.bb ?? null,
    decoderWeight: s.decoderWeight,
  }
}

/** A row of n qubits at (0,0) … (n−1,0), the checks Z_iZ_{i+1} above the gaps (edges run down to both qubits). */
function chainPositions(n: number): { qubitPos: [number, number][]; checkPos: [number, number][] } {
  return {
    qubitPos: Array.from({ length: n }, (_, i) => [i, 0] as [number, number]),
    checkPos: Array.from({ length: n - 1 }, (_, i) => [i + 0.5, -0.85] as [number, number]),
  }
}

/** Shor: qubit i at (column i mod 3, row ⌊i/3⌋). The two X checks (six qubits each) sit between the row pairs; the six Z checks sit in the gaps along the rows. */
function shorPositions(): { qubitPos: [number, number][]; checkPos: [number, number][] } {
  const qubitPos = Array.from({ length: 9 }, (_, i) => [i % 3, Math.floor(i / 3)] as [number, number])
  // X checks first (rows 0-5 and 3-8 of the grid), then the Z checks Z0Z1, Z1Z2, Z3Z4, Z4Z5, Z6Z7, Z7Z8 (the order of codes.ts shorCode)
  const checkPos: [number, number][] = [
    [1, 0.5],
    [1, 1.5],
    [0.5, 0],
    [1.5, 0],
    [0.5, 1],
    [1.5, 1],
    [0.5, 2],
    [1.5, 2],
  ]
  return { qubitPos, checkPos }
}

/**
 * Steane: the colour-code triangle. The corners are qubits 1, 2, 4 (1-based; 0-based 0, 1, 3), the edge midpoints 3, 5, 6 (2, 4, 5) and the centre is
 * qubit 7 (6). The three faces are the rows of H = 1010101 / 0110011 / 0001111: each is a corner, two midpoints and the centre. An X check and the Z check
 * with the same support share a face; they are drawn a little left and right of its centre.
 */
function steanePositions(): { qubitPos: [number, number][]; checkPos: [number, number][]; faces: { qubits: number[]; checks: number[] }[] } {
  const s = Math.sqrt(3)
  const qubitPos: [number, number][] = [
    [0, s], // 1: bottom left corner
    [2, s], // 2: bottom right corner
    [1, s], // 3: bottom edge midpoint
    [1, 0], // 4: top corner
    [0.5, s / 2], // 5: left edge midpoint
    [1.5, s / 2], // 6: right edge midpoint
    [1, (2 * s) / 3], // 7: centre
  ]
  // the rows of the Hamming check matrix, in the engine's order: 1010101 (qubits 1,3,5,7), 0110011 (2,3,6,7), 0001111 (4,5,6,7)
  const supports = [
    [0, 2, 4, 6],
    [1, 2, 5, 6],
    [3, 4, 5, 6],
  ]
  const centre = supports.map((sup) => {
    const x = sup.reduce((a, q) => a + qubitPos[q][0], 0) / sup.length
    const y = sup.reduce((a, q) => a + qubitPos[q][1], 0) / sup.length
    return [x, y] as [number, number]
  })
  const dx = 0.17
  const checkPos: [number, number][] = [
    ...centre.map(([x, y]) => [x - dx, y] as [number, number]), // the X checks
    ...centre.map(([x, y]) => [x + dx, y] as [number, number]), // the Z checks
  ]
  return { qubitPos, checkPos, faces: supports.map((qubits, i) => ({ qubits, checks: [i, 3 + i] })) }
}

/** The five-qubit code: a pentagon with qubit 0 at the top. Check j misses qubit (j + 4) mod 5; its square sits inside, opposite the missing qubit. */
function fivePositions(): { qubitPos: [number, number][]; checkPos: [number, number][] } {
  const R = 1.35
  const qubitPos = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / 5
    return [R * Math.cos(a), R * Math.sin(a)] as [number, number]
  })
  const checkPos = Array.from({ length: 4 }, (_, j) => {
    const [mx, my] = qubitPos[(j + 4) % 5]
    return [-0.4 * mx, -0.4 * my] as [number, number]
  })
  return { qubitPos, checkPos }
}

function surfaceSpec(d: number): Spec {
  const sf = rotatedSurfaceCode(d)
  // the engine lists the checks in one array; the CSS stabilizer lists the X checks (H_X rows) then the Z checks (H_Z rows), each in that array's order
  const xs = sf.checks.filter((c) => c.type === 'X')
  const zs = sf.checks.filter((c) => c.type === 'Z')
  return {
    name: `rotated surface code, d = ${d}`,
    family: 'surface',
    code: sf.code.stabilizer(),
    css: sf.code,
    qubitPos: sf.data.map(([x, y]) => [x, y] as [number, number]),
    checkPos: [...xs, ...zs].map((c) => [c.center[0], c.center[1]] as [number, number]),
    logical: { X: letters(sf.code.n, sf.logicalX, 'X'), Z: letters(sf.code.n, sf.logicalZ, 'Z') },
    surface: sf,
    decoderWeight: d === 3 ? 1 : 2,
  }
}

/** A Pauli string with `letter` on the listed qubits. */
function letters(n: number, qubits: readonly number[], letter: 'X' | 'Z'): string {
  return Array.from({ length: n }, (_, j) => (qubits.includes(j) ? letter : 'I')).join('')
}

function torusSpec(which: 'gross' | 'two-gross'): Spec {
  const bb = bbCode(which === 'gross' ? GROSS_SPEC : TWO_GROSS_SPEC)
  const t = bb.tanner()
  const qubitPos: [number, number][] = new Array<[number, number]>(bb.n)
  const checkPos: [number, number][] = new Array<[number, number]>(2 * bb.cells)
  for (const node of t.nodes) {
    // the paper's drawing has y pointing north; the pictures point down
    const p: [number, number] = [node.pos[0], -node.pos[1]]
    if (node.kind === 'L' || node.kind === 'R') qubitPos[node.index] = p
    else checkPos[node.kind === 'X' ? node.index : bb.cells + node.index] = p
  }
  return {
    name: which === 'gross' ? 'gross code [[144, 12]]' : 'two-gross code [[288, 12]]',
    family: 'torus',
    code: bb.css.stabilizer(),
    css: bb.css,
    qubitPos,
    checkPos,
    bb,
    decoderWeight: 0,
  }
}

const SPECS: Record<RegisteredCodeId, () => Spec> = {
  rep3: () => {
    const c = repetitionCode(3, 'bit-flip')
    return { name: '3-qubit bit-flip code', family: 'small', code: c.stabilizer(), css: c, ...chainPositions(3), logical: { X: 'XXX', Z: 'ZII' }, decoderWeight: 1 }
  },
  rep3x: () => {
    const c = repetitionCode(3, 'phase-flip')
    return { name: '3-qubit phase-flip code', family: 'small', code: c.stabilizer(), css: c, ...chainPositions(3), logical: { X: 'ZZZ', Z: 'XII' }, decoderWeight: 1 }
  },
  shor9: () => {
    const c = shorCode()
    return { name: 'Shor [[9, 1, 3]]', family: 'small', code: c.stabilizer(), css: c, ...shorPositions(), logical: { X: 'ZZZZZZZZZ', Z: 'XXXXXXXXX' }, decoderWeight: 1 }
  },
  steane7: () => {
    const c = steaneCode()
    return { name: 'Steane [[7, 1, 3]]', family: 'small', code: c.stabilizer(), css: c, ...steanePositions(), logical: { X: 'XXXXXXX', Z: 'ZZZZZZZ' }, decoderWeight: 1 }
  },
  five5: () => {
    const c = fiveQubitCode()
    return { name: '[[5, 1, 3]] code', family: 'small', code: c, css: null, ...fivePositions(), logical: { X: 'XXXXX', Z: 'ZZZZZ' }, decoderWeight: 1 }
  },
  surface3: () => surfaceSpec(3),
  surface5: () => surfaceSpec(5),
  gross: () => torusSpec('gross'),
  'two-gross': () => torusSpec('two-gross'),
}

const cache = new Map<RegisteredCodeId, RegisteredCode>()

export const isRegisteredCodeId = (id: unknown): id is RegisteredCodeId => typeof id === 'string' && (REGISTERED_CODE_IDS as readonly string[]).includes(id)

/** The registered code with this ID (built once). Throws on an unknown ID. */
export function registeredCode(id: string): RegisteredCode {
  if (!isRegisteredCodeId(id)) throw new Error(`unknown code "${id}" (the registry has: ${REGISTERED_CODE_IDS.join(', ')})`)
  let e = cache.get(id)
  if (!e) {
    e = build(id, SPECS[id]())
    cache.set(id, e)
  }
  return e
}

/* ------------------------------------------------------------------------------------------------ decoder, distance, logical witness */
const decoders = new Map<RegisteredCodeId, LookupDecoder>()

/** The lookup decoder of a code with one: the lightest error per syndrome up to `decoderWeight` (the bicycle codes have none). */
export function decoderOf(entry: RegisteredCode): LookupDecoder | null {
  if (entry.decoderWeight < 1) return null
  let d = decoders.get(entry.id)
  if (!d) {
    d = lookupDecoder(entry.stabilizer, entry.decoderWeight)
    decoders.set(entry.id, d)
  }
  return d
}

interface Cached {
  info: CodeDistanceInfo
  witness: Pauli | null
}
const distances = new Map<RegisteredCodeId, Cached>()

function computeDistance(entry: RegisteredCode): Cached {
  if (entry.family === 'torus') {
    const which = entry.id as 'gross' | 'two-gross'
    // the paper's own light X-type logical operator: its weight is an UPPER bound on d, and the paper's d is reported, not computed
    const basis = paperLogicalBasis(entry.bb!, which)
    return { info: { d: null, reported: REPORTED[which].d, exact: false }, witness: basis.X[0] }
  }
  if (entry.k < 1) return { info: { d: null, reported: null, exact: false }, witness: null }
  if (entry.css && entry.n > 9) {
    const r = cssDistance(entry.css)
    const x = r.X.witness
    const z = r.Z.witness
    const w = x && z ? (z.weight() < x.weight() ? z : x) : (x ?? z)
    return { info: { d: r.exact ? r.upper : null, reported: null, exact: r.exact }, witness: w }
  }
  const r = stabilizerDistance(entry.stabilizer)
  return { info: { d: r.exact ? r.upper : null, reported: null, exact: r.exact }, witness: r.witness }
}

function cachedDistance(entry: RegisteredCode): Cached {
  let c = distances.get(entry.id)
  if (!c) {
    c = computeDistance(entry)
    distances.set(entry.id, c)
  }
  return c
}

/** The distance of a code (exact where the search is complete, or the paper's reported value for the bicycle codes). */
export const distanceOf = (entry: RegisteredCode): CodeDistanceInfo => cachedDistance(entry).info
/**
 * A logical operator of least known weight: for n ≤ 25 the lightest one the exhaustive search finds (its weight is d), for the bicycle codes the paper's
 * first X-type basis operator (weight 12 for the gross code, 20 for the two-gross one: an upper bound on d, the paper's own words).
 */
export const logicalWitnessOf = (entry: RegisteredCode): Pauli | null => cachedDistance(entry).witness

/* ------------------------------------------------------------------------------------------------ naming a residual */
export type ResidualKind =
  | 'identity'
  /** a product of checks (any non-identity element of the stabilizer group up to sign): the stored qubit is untouched */
  | 'check'
  | 'logical-X'
  | 'logical-Z'
  | 'logical-Y'
  /** a logical operator of a code with k > 1 (not named by letter) */
  | 'logical'
  /** has a nonzero syndrome: the correction did not share the error's syndrome */
  | 'detectable'

/**
 * What an operator that should commute with every check is, as the engine reads it: the identity, a product of checks, or a logical operator (X̄ if it flips the
 * stored Z̄ eigenvalue and keeps X̄ unchanged, Z̄ the other way round, Ȳ both). Letters only: a phase is ignored.
 */
export function classifyResidual(entry: RegisteredCode, residual: Pauli): ResidualKind {
  if (residual.n !== entry.n) throw new Error(`classifyResidual: ${residual.n} qubits, the code has ${entry.n}`)
  if (residual.weight() === 0) return 'identity'
  if (!entry.stabilizer.inNormalizer(residual)) return 'detectable'
  if (entry.stabilizer.membership(residual) !== 'outside') return 'check'
  if (!entry.logical) return 'logical'
  const flipsZ = !residual.commutesWith(entry.logical.Z)
  const flipsX = !residual.commutesWith(entry.logical.X)
  return flipsZ && flipsX ? 'logical-Y' : flipsZ ? 'logical-X' : flipsX ? 'logical-Z' : 'logical'
}
