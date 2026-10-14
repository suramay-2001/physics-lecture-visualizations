/**
 * qec/bb.ts against paper-tdg (Yoder et al., Tour de gross, arXiv:2506.03094). Every number a lecture would quote from §2.1 and App. A.1-A.2 is
 * recomputed here from the polynomials and compared with what the paper prints: n and k (from ranks), the check weight, the geometry of the Tanner graph
 * (Fig. 3: north / east / long-range connections), Eq. (29)-(30) for the paper's logical basis (Eq. 31-36), its weights, its commutation pattern, the
 * action of the shifts x and y on the logical qubits against the matrices printed in Eq. (37) and (38), the 36 logical shift classes, the basic shifts of
 * p. 47 and the claim that two of them reach every class. The distance is NOT computed: light logical operators exhibit upper bounds, a small
 * exhaustive search gives a small proved lower bound, and the paper's d = 12 / 18 stay `REPORTED` constants.
 */
import { describe, expect, it, vi } from 'vitest'
import { rng } from '../random'
import { GF2Matrix } from './gf2'
import {
  BBCode,
  BB_LIMITS,
  GROSS_SPEC,
  PAPER_BASIC_SHIFTS,
  REPORTED,
  REPORTED_LOGICAL_COUNTS,
  TWO_GROSS_SPEC,
  TorusRing,
  bbCode,
  logicalXAction,
  makeLogicalSolver,
  pairingMatrix,
  paperLogicalBasis,
  paperSpec,
  searchLightLogicalX,
  validateBBSpec,
} from './bb'
import { cssDistance } from './codes'
import { Pauli } from './pauli'

// the whole repository runs in ~200 parallel workers; these suites do real search and dense simulation, so give each test room
vi.setConfig({ testTimeout: 60_000 })

const gross = bbCode(GROSS_SPEC)
const twoGross = bbCode(TWO_GROSS_SPEC)
const both: ['gross' | 'two-gross', BBCode][] = [
  ['gross', gross],
  ['two-gross', twoGross],
]

/** The matrices printed in Eq. (37) (gross) and Eq. (38) (two-gross), transcribed from the page image of p. 47. */
const PAPER_A: Record<'gross' | 'two-gross', { x: string; y: string }> = {
  gross: {
    x: '010100 010001 001100 110110 010010 111101',
    y: '100001 111001 000010 010000 011001 001101',
  },
  'two-gross': {
    x: '011101 101011 101010 101111 011111 100110',
    y: '111110 110111 011000 100010 100111 100001',
  },
}

describe('bb: the paper defines the codes with these parameters (§2.1 and App. A.1)', () => {
  it('gross: ℓ = 12, m = 6, A = 1 + y + x³y⁻¹, B = 1 + x + x⁻¹y⁻³: n = 144, k = 12 from the ranks, check weight 6', () => {
    expect(gross.l).toBe(12)
    expect(gross.m).toBe(6)
    expect(gross.cells).toBe(72)
    expect(gross.n).toBe(144)
    expect(gross.css.rankX).toBe(66)
    expect(gross.css.rankZ).toBe(66)
    expect(gross.k).toBe(12)
    expect(gross.checkWeight).toBe(6)
    expect(gross.n).toBe(REPORTED.gross.n)
    expect(gross.k).toBe(REPORTED.gross.k)
    expect(gross.A).toEqual(gross.ring.fromTerms([[0, 0], [0, 1], [3, 5]])) // y⁻¹ = y⁵ since y⁶ = 1
    expect(gross.B).toEqual(gross.ring.fromTerms([[0, 0], [1, 0], [11, 3]])) // x⁻¹ = x¹¹, y⁻³ = y³
  })

  it('two-gross: ℓ = 12, m = 12, the same a and b: n = 288, k = 12, check weight 6', () => {
    expect(twoGross.n).toBe(288)
    expect(twoGross.css.rankX).toBe(138)
    expect(twoGross.css.rankZ).toBe(138)
    expect(twoGross.k).toBe(12)
    expect(twoGross.checkWeight).toBe(6)
    expect(twoGross.n).toBe(REPORTED['two-gross'].n)
    expect(twoGross.k).toBe(REPORTED['two-gross'].k)
  })

  it('the paper counts 2ℓm data qubits and 2ℓm checks, c = 4ℓm qubits in the module (288 and 576, p. 10)', () => {
    for (const [, code] of both) {
      expect(code.HX.rows + code.HZ.rows).toBe(code.n)
      expect(code.n + code.HX.rows + code.HZ.rows).toBe(4 * code.cells)
    }
    expect(4 * gross.cells).toBe(288)
    expect(4 * twoGross.cells).toBe(576)
  })

  it('H_X H_Zᵀ = AB + BA = 0, every row has weight 6, every qubit sits in 3 X checks and 3 Z checks', () => {
    for (const [, code] of both) {
      expect(code.HX.mul(code.HZ.transpose()).isZero()).toBe(true)
      for (let r = 0; r < code.HX.rows; r++) {
        expect(code.HX.rowWeight(r)).toBe(6)
        expect(code.HZ.rowWeight(r)).toBe(6)
      }
      for (let q = 0; q < code.n; q++) {
        expect(code.HX.colWeight(q)).toBe(3)
        expect(code.HZ.colWeight(q)).toBe(3)
      }
      expect(code.css.stabilizer().check().commuting).toBe(true)
    }
  })

  it('H_X = [A | B] and H_Z = [Bᵀ | Aᵀ] in the polynomial sense: the X check of cell x^i y^j touches the L qubits of x^i y^j A and the R qubits of x^i y^j B (Eq. 27)', () => {
    const R = gross.ring
    for (const [i, j] of [[0, 0], [5, 4], [11, 5], [7, 2]] as const) {
      const row = R.index(i, j)
      const lSupport = gross.HX.rowSupport(row).filter((q) => q < gross.cells)
      const rSupport = gross.HX.rowSupport(row).filter((q) => q >= gross.cells).map((q) => q - gross.cells)
      const mono = R.mono(i, j)
      expect(lSupport).toEqual(R.terms(R.mul(mono, gross.A)).map(([a, b]) => R.index(a, b)).sort((u, v) => u - v))
      expect(rSupport).toEqual(R.terms(R.mul(mono, gross.B)).map(([a, b]) => R.index(a, b)).sort((u, v) => u - v))
      const lZ = gross.HZ.rowSupport(row).filter((q) => q < gross.cells)
      const rZ = gross.HZ.rowSupport(row).filter((q) => q >= gross.cells).map((q) => q - gross.cells)
      expect(lZ).toEqual(R.terms(R.mul(mono, R.transpose(gross.B))).map(([a, b]) => R.index(a, b)).sort((u, v) => u - v))
      expect(rZ).toEqual(R.terms(R.mul(mono, R.transpose(gross.A))).map(([a, b]) => R.index(a, b)).sort((u, v) => u - v))
    }
  })
})

describe('bb: the torus ring', () => {
  const R = new TorusRing(12, 6)
  it('xˡ = 1 and yᵐ = 1; multiplication is commutative and associative; the transpose reverses exponents and is an involution', () => {
    expect(R.mul(R.mono(1, 0), R.mono(11, 0))).toEqual(R.mono(0, 0))
    expect(R.mul(R.mono(0, 3), R.mono(0, 3))).toEqual(R.mono(0, 0))
    const rand = rng(51)
    const randPoly = () => R.fromTerms(Array.from({ length: 1 + Math.floor(rand() * 5) }, () => [Math.floor(rand() * 12), Math.floor(rand() * 6)] as const))
    for (let t = 0; t < 40; t++) {
      const a = randPoly()
      const b = randPoly()
      const c = randPoly()
      expect(R.mul(a, b)).toEqual(R.mul(b, a))
      expect(R.mul(R.mul(a, b), c)).toEqual(R.mul(a, R.mul(b, c)))
      expect(R.mul(a, R.add(b, c))).toEqual(R.add(R.mul(a, b), R.mul(a, c)))
      expect(R.transpose(R.transpose(a))).toEqual(a)
      expect(R.transpose(R.mul(a, b))).toEqual(R.mul(R.transpose(a), R.transpose(b)))
      // matrix(p) is multiplication by p: matrix(a)·matrix(b) = matrix(ab), matrix(aᵀ) = matrix(a)ᵀ
      expect(R.matrix(a).mul(R.matrix(b)).equals(R.matrix(R.mul(a, b)))).toBe(true)
      expect(R.matrix(R.transpose(a)).equals(R.matrix(a).transpose())).toBe(true)
    }
    expect(R.transpose(R.mono(2, 1))).toEqual(R.mono(10, 5))
    expect(R.fromTerms([[1, 1], [1, 1]])).toEqual(R.zero()) // repeated terms cancel
  })
})

describe('bb: the Tanner graph and its geometry (Fig. 3a/3b, p. 8-9)', () => {
  it('has 4ℓm nodes (L, R, X, Z per cell), 12ℓm edges, every check with four local and two long-range edges, and every node in a distinct place', () => {
    for (const [, code] of both) {
      const T = code.tanner()
      expect(T.nodes.length).toBe(4 * code.cells)
      expect(T.edges.length).toBe(12 * code.cells)
      expect(new Set(T.nodes.map((n) => n.pos.join(','))).size).toBe(T.nodes.length)
      for (const kind of ['X', 'Z'] as const)
        for (let c = 0; c < code.cells; c++) {
          const mine = T.edges.filter((e) => e.checkKind === kind && e.check === c)
          expect(mine.length).toBe(6)
          expect(mine.filter((e) => e.kind === 'local').length).toBe(4)
          expect(mine.filter((e) => e.kind === 'long').length).toBe(2)
          expect(mine.every((e) => e.pauli === kind)).toBe(true)
        }
    }
  })

  it('the edge set is exactly the support of H_X and H_Z', () => {
    for (const [, code] of both) {
      const T = code.tanner()
      for (const [kind, H] of [['X', code.HX], ['Z', code.HZ]] as const) {
        const fromEdges = T.edges.filter((e) => e.checkKind === kind).map((e) => `${e.check},${e.qubit}`).sort()
        const fromMatrix: string[] = []
        for (let r = 0; r < H.rows; r++) for (const q of H.rowSupport(r)) fromMatrix.push(`${r},${q}`)
        expect(fromEdges).toEqual(fromMatrix.sort())
      }
    }
  })

  it('an X check touches the L qubit of its own cell and the cell to the north, the R qubit of its own cell and the cell to the east, and long-range the L qubit at (+3, −1) and the R qubit at (−1, −3) = (−1, +3) on m = 6', () => {
    const cell: [number, number] = [5, 2]
    const c = gross.ring.index(...cell)
    const es = gross.tanner().edges.filter((e) => e.checkKind === 'X' && e.check === c)
    const at = (qk: 'L' | 'R', d: [number, number]) => es.find((e) => e.qubitKind === qk && e.delta[0] === d[0] && e.delta[1] === d[1])
    expect(at('L', [0, 0])?.kind).toBe('local')
    expect(at('L', [0, 1])?.kind).toBe('local') // north
    expect(at('R', [0, 0])?.kind).toBe('local')
    expect(at('R', [1, 0])?.kind).toBe('local') // east
    expect(at('L', [3, -1])?.kind).toBe('long')
    expect(at('R', [-1, 3])?.kind).toBe('long') // (−1, −3) reported as (−1, +3): on m = 6, ±3 are the same cell and delta is wrapped into (−m/2, m/2]
    expect(at('L', [0, 1])?.qubit).toBe(gross.lIndex(5, 3))
    expect(at('R', [1, 0])?.qubit).toBe(gross.rIndex(6, 2))
    expect(at('L', [3, -1])?.qubit).toBe(gross.lIndex(8, 1))
    expect(at('R', [-1, 3])?.qubit).toBe(gross.rIndex(4, 5))
  })

  it('a Z check touches its own L and R qubits, the L qubit to the west and the R qubit to the south, and long-range the L qubit at (+1, +3) and the R qubit at (−3, +1)', () => {
    const cell: [number, number] = [5, 2]
    const c = gross.ring.index(...cell)
    const es = gross.tanner().edges.filter((e) => e.checkKind === 'Z' && e.check === c)
    const at = (qk: 'L' | 'R', d: [number, number]) => es.find((e) => e.qubitKind === qk && e.delta[0] === d[0] && e.delta[1] === d[1])
    expect(at('L', [0, 0])?.kind).toBe('local')
    expect(at('L', [-1, 0])?.kind).toBe('local') // west
    expect(at('R', [0, 0])?.kind).toBe('local')
    expect(at('R', [0, -1])?.kind).toBe('local') // south
    expect(at('L', [1, 3])?.kind).toBe('long') // −b = (+1, +3); the nearest copy of y³ on m = 6 is y³ either way
    expect(at('R', [-3, 1])?.kind).toBe('long') // −a = (−3, +1)
  })

  it('the unit cell of Fig. 3a: R top-left, X top-right, Z bottom-left, L bottom-right, cell (i, j) at (2i, 2j)', () => {
    const T = gross.tanner()
    const get = (id: string) => T.nodes.find((n) => n.id === id)!.pos
    const c = gross.ring.index(3, 4)
    expect(get(`Z${c}`)).toEqual([6, 8])
    expect(get(`L${c}`)).toEqual([7, 8])
    expect(get(`R${c}`)).toEqual([6, 9])
    expect(get(`X${c}`)).toEqual([7, 9])
  })

  it('local edges join nodes within one drawing step, and long edges are not drawn short: drawn lengths agree with the delta', () => {
    for (const e of gross.tanner().edges) {
      const dx = Math.abs(e.to[0] - e.from[0])
      const dy = Math.abs(e.to[1] - e.from[1])
      if (e.kind === 'local') expect(dx + dy).toBeLessThanOrEqual(2)
      else expect(dx + dy).toBeGreaterThan(2)
    }
  })
})

describe('bb: shift automorphisms preserve the code (App. A.2)', () => {
  it('every shift x^a y^b maps X checks to X checks and Z checks to Z checks (all ℓm shifts, both codes)', () => {
    for (const [, code] of both) for (let a = 0; a < code.l; a++) for (let b = 0; b < code.m; b++) expect(code.shiftPreservesCode(a, b), `${code.spec.name} x^${a} y^${b}`).toBe(true)
  })

  it('a shift is a permutation, the identity shift is the identity, shifts compose by adding exponents', () => {
    const p = gross.shiftPermutation(2, 3)
    expect(new Set(p).size).toBe(gross.n)
    expect(gross.shiftPermutation(0, 0)).toEqual(Array.from({ length: gross.n }, (_, i) => i))
    const q = gross.shiftPermutation(5, 1)
    const pq = gross.shiftPermutation(7, 4)
    expect(p.map((v) => q[v])).toEqual(pq)
  })

  it('a permutation that is not a symmetry is refused: swapping L and R qubits of one cell breaks the checks', () => {
    const perm = Array.from({ length: gross.n }, (_, i) => i)
    ;[perm[0], perm[gross.cells]] = [perm[gross.cells], perm[0]]
    expect(gross.preservesChecks(perm, Array.from({ length: gross.cells }, (_, c) => c))).toBe(false)
  })
})

describe('bb: the paper’s logical basis (Eq. 29-36)', () => {
  it.each(both)('%s: the four operators of Eq. (31) satisfy Eq. (29) and (30), are logical, and have the stated weight', (which, code) => {
    const B = paperLogicalBasis(code, which)
    const st = code.css.stabilizer()
    const { X1, X7, Z1, Z7 } = B.generators
    for (const g of [X1, X7, Z1, Z7]) {
      expect(st.inNormalizer(g)).toBe(true)
      expect(st.isLogical(g)).toBe(true)
      expect(g.weight()).toBe(REPORTED[which].basisWeight)
    }
    // Eq. (29): X(p, q) is logical (or a stabilizer) iff pB + qA = 0; Eq. (30) for Z
    const R = code.ring
    const n2 = code.cells
    const split = (v: readonly number[]) => [v.slice(0, n2), v.slice(n2)] as const
    for (const g of [X1, X7]) expect(code.xCommutes(...split(g.x))).toBe(true)
    for (const g of [Z1, Z7]) expect(code.zCommutes(...split(g.z))).toBe(true)
    // the ZX duality: X(p, q) logical iff Z(qᵀ, pᵀ) logical
    const [p, q] = split(X1.x)
    expect(code.zCommutes(R.transpose(q), R.transpose(p))).toBe(true)
  })

  it.each(both)('%s: the polynomials have the term counts the paper’s weights imply (12 for gross, 20 for two-gross)', (which, code) => {
    const B = paperLogicalBasis(code, which)
    expect(B.generators.X1.weight() + 0).toBe(which === 'gross' ? 12 : 20)
    expect(B.generators.X7.weight()).toBe(which === 'gross' ? 12 : 20)
  })

  it.each(both)('%s: property 1 and 3 of p. 45: X̄₁, Z̄₁ anticommute and X̄₇, Z̄₇ anticommute, every other pair commutes; anticommuting pairs overlap on exactly one qubit, commuting pairs on none', (which, code) => {
    const { X1, X7, Z1, Z7 } = paperLogicalBasis(code, which).generators
    const sup = (p: Pauli) => new Set(p.support())
    const overlap = (a: Pauli, b: Pauli) => [...sup(a)].filter((q) => sup(b).has(q)).length
    const pairs: [Pauli, Pauli, boolean][] = [
      [X1, Z1, false],
      [X7, Z7, false],
      [X1, Z7, true],
      [X7, Z1, true],
      [X1, X7, true],
      [Z1, Z7, true],
    ]
    for (const [a, b, commute] of pairs) {
      expect(a.commutesWith(b)).toBe(commute)
      expect(overlap(a, b)).toBe(commute ? 0 : 1)
    }
  })

  it.each(both)('%s: property 4 of p. 45: the Z checks touching X̄₁ and X̄₇ are disjoint sets; so are the X checks touching Z̄₁ and Z̄₇', (which, code) => {
    const { X1, X7, Z1, Z7 } = paperLogicalBasis(code, which).generators
    const touchedZ = (x: Pauli) => new Set(Array.from({ length: code.HZ.rows }, (_, r) => r).filter((r) => code.HZ.rowSupport(r).some((q) => x.x[q])))
    const touchedX = (z: Pauli) => new Set(Array.from({ length: code.HX.rows }, (_, r) => r).filter((r) => code.HX.rowSupport(r).some((q) => z.z[q])))
    const a = touchedZ(X1)
    const b = touchedZ(X7)
    expect([...a].filter((r) => b.has(r))).toEqual([])
    const c = touchedX(Z1)
    const d = touchedX(Z7)
    expect([...c].filter((r) => d.has(r))).toEqual([])
  })

  it.each(both)('%s: the twelve X̄_i and twelve Z̄_j of Eq. (34) are logical, independent modulo the stabilizers, and X̄_i anticommutes with Z̄_j exactly when i = j (a symplectic basis)', (which, code) => {
    const B = paperLogicalBasis(code, which)
    expect(B.X.length).toBe(12)
    expect(B.Z.length).toBe(12)
    const st = code.css.stabilizer()
    for (const p of [...B.X, ...B.Z]) {
      expect(st.inNormalizer(p)).toBe(true)
      expect(st.isLogical(p)).toBe(true)
    }
    expect(pairingMatrix(B.X, B.Z).equals(GF2Matrix.identity(12))).toBe(true)
    const xs = GF2Matrix.fromRows(B.X.map((p) => [...p.x]), code.n)
    const zs = GF2Matrix.fromRows(B.Z.map((p) => [...p.z]), code.n)
    expect(code.HX.vstack(xs).rank()).toBe(code.css.rankX + 12)
    expect(code.HZ.vstack(zs).rank()).toBe(code.css.rankZ + 12)
    // X̄ commute among themselves (same type), as do the Z̄
    for (const a of B.X) for (const b of B.X) expect(a.commutesWith(b)).toBe(true)
  })

  it('refuses the wrong code for a basis', () => {
    expect(() => paperLogicalBasis(gross, 'two-gross')).toThrow()
    expect(() => paperLogicalBasis(twoGross, 'gross')).toThrow()
    expect(() => paperLogicalBasis(bbCode(paperSpec('other', 6, 6, 3, -1, -1, -3)), 'gross')).toThrow()
  })
})

describe('bb: the logical action of the shifts against Eq. (37) and (38) (App. A.2, p. 47)', () => {
  const solverFor = (which: 'gross' | 'two-gross', code: BBCode) => {
    const B = paperLogicalBasis(code, which)
    return { B, solver: makeLogicalSolver(code, B.X) }
  }
  const block = (M: GF2Matrix, r0: number, c0: number) => M.sliceRows(r0, r0 + 6).sliceCols(c0, c0 + 6)

  it.each(both)('%s: the shift x acts on X̄₁ … X̄₆ by exactly the printed matrix A_x, and y by A_y (M[i][j] = 1 when X̄_i appears in the image of X̄_j: |x⟩ → |Ax⟩)', (which, code) => {
    const { B, solver } = solverFor(which, code)
    const Mx = logicalXAction(code, B.X, code.shiftPermutation(1, 0), solver)!
    const My = logicalXAction(code, B.X, code.shiftPermutation(0, 1), solver)!
    expect(block(Mx, 0, 0).toText().replace(/\n/g, ' ')).toBe(PAPER_A[which].x)
    expect(block(My, 0, 0).toText().replace(/\n/g, ' ')).toBe(PAPER_A[which].y)
  })

  it.each(both)('%s: the action never mixes qubits 1-6 with 7-12; on qubits 7-12 it is the TRANSPOSE of the printed matrix (the paper writes the pair as one A, "M = A ⊗ A")', (which, code) => {
    const { B, solver } = solverFor(which, code)
    for (const [a, b] of [[1, 0], [0, 1]] as const) {
      const M = logicalXAction(code, B.X, code.shiftPermutation(a, b), solver)!
      expect(block(M, 0, 6).isZero()).toBe(true)
      expect(block(M, 6, 0).isZero()).toBe(true)
      expect(block(M, 6, 6).equals(block(M, 0, 0).transpose())).toBe(true)
    }
  })

  it.each(both)('%s: the printed matrices have order 6 (A⁶ = I, no smaller power is I)', (which) => {
    for (const key of ['x', 'y'] as const) {
      const A = GF2Matrix.fromText(PAPER_A[which][key])
      let P = GF2Matrix.identity(6)
      const orders: number[] = []
      for (let t = 1; t <= 6; t++) {
        P = P.mul(A)
        if (P.equals(GF2Matrix.identity(6))) orders.push(t)
      }
      expect(orders).toEqual([6])
    }
  })

  it.each(both)('%s: shifts by x⁶ and y⁶ act as the logical identity, and the ℓm shifts fall into exactly 36 logical classes (35 nontrivial)', (which, code) => {
    const { B, solver } = solverFor(which, code)
    const I12 = GF2Matrix.identity(12)
    expect(logicalXAction(code, B.X, code.shiftPermutation(6, 0), solver)!.equals(I12)).toBe(true)
    expect(logicalXAction(code, B.X, code.shiftPermutation(0, 6), solver)!.equals(I12)).toBe(true)
    const classes = new Set<string>()
    for (let a = 0; a < code.l; a++) for (let b = 0; b < code.m; b++) classes.add(logicalXAction(code, B.X, code.shiftPermutation(a, b), solver)!.toText())
    expect(classes.size).toBe(36)
    expect(classes.has(I12.toText())).toBe(true)
  })

  it.each(both)('%s: the shifts compose as exponents add, and the logical action is a homomorphism: M(x^a y^b) M(x^c y^d) = M(x^{a+c} y^{b+d})', (which, code) => {
    const { B, solver } = solverFor(which, code)
    const M = (a: number, b: number) => logicalXAction(code, B.X, code.shiftPermutation(a, b), solver)!
    for (const [a, b, c, d] of [[1, 2, 3, 1], [5, 0, 0, 5], [11, 5, 2, 3], [4, 4, 4, 4]] as const) expect(M(a, b).mul(M(c, d)).equals(M(a + c, b + d))).toBe(true)
  })
})

describe('bb: the basic shift automorphisms of p. 47', () => {
  it('A_iA_jᵀ and B_iB_jᵀ (i ≠ j) give the six shifts {x, y, x³y⁻¹, xy³, x³y⁻², x²y³} and their inverses, exactly the paper’s list', () => {
    const neg = ([a, b]: readonly [number, number]): [number, number] => [-a, -b]
    const sub = (u: readonly [number, number], v: readonly [number, number]): [number, number] => [u[0] - v[0], u[1] - v[1]]
    const gens: [number, number][] = []
    for (const T of [GROSS_SPEC.A, GROSS_SPEC.B])
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) if (i !== j) gens.push(sub(T[i] as [number, number], T[j] as [number, number])) // monomial A_i · A_jᵀ has exponent A_i − A_j
    // 12 shifts: the six paper shifts and their inverses (mod ℓ, m)
    const key = ([a, b]: readonly [number, number], l = 12, m = 6) => `${((a % l) + l) % l},${((b % m) + m) % m}`
    const want = new Set<string>()
    for (const s of PAPER_BASIC_SHIFTS) {
      want.add(key(s))
      want.add(key(neg(s)))
    }
    expect(want.size).toBe(12)
    expect(new Set(gens.map((g) => key(g))).size).toBe(12)
    expect(new Set(gens.map((g) => key(g)))).toEqual(want)
    // the same set on the two-gross torus (the polynomials are the same, only m differs)
    expect(new Set(gens.map((g) => key(g, 12, 12)))).toEqual(new Set(PAPER_BASIC_SHIFTS.flatMap((s) => [key(s, 12, 12), key(neg(s), 12, 12)])))
  })

  it.each(both)('%s: every logical class of shift is a product of at most two basic shifts (or their inverses), as the paper says', (which, code) => {
    const B = paperLogicalBasis(code, which)
    const solver = makeLogicalSolver(code, B.X)
    const M = (a: number, b: number) => logicalXAction(code, B.X, code.shiftPermutation(a, b), solver)!.toText()
    const basic: [number, number][] = PAPER_BASIC_SHIFTS.flatMap((s) => [[s[0], s[1]] as [number, number], [-s[0], -s[1]] as [number, number]])
    const reached = new Set<string>([M(0, 0)])
    for (const u of basic) {
      reached.add(M(u[0], u[1]))
      for (const v of basic) reached.add(M(u[0] + v[0], u[1] + v[1]))
    }
    expect(reached.size).toBe(36)
  })
})

describe('bb: the distance is reported, not computed', () => {
  it('REPORTED carries n, k, d and where the paper says it, and the paper’s own counts of light logical operators', () => {
    expect(REPORTED.gross).toMatchObject({ n: 144, k: 12, d: 12 })
    expect(REPORTED['two-gross']).toMatchObject({ n: 288, k: 12, d: 18 })
    expect(REPORTED.gross.where).toMatch(/p\. 8-9/)
    expect(REPORTED['two-gross'].where).toMatch(/p\. 9/)
    expect(REPORTED_LOGICAL_COUNTS.gross.weight12).toBe(1884)
    expect(REPORTED_LOGICAL_COUNTS['two-gross'].weight18).toBe(336)
  })

  it('upper bounds: the paper’s own X̄₁ has weight 12 (gross) and 20 (two-gross) and is a logical operator; this gives d ≤ 12 and d ≤ 20 from the paper’s construction alone', () => {
    for (const [which, code] of both) {
      const x = paperLogicalBasis(code, which).generators.X1
      expect(code.css.stabilizer().isLogical(x)).toBe(true)
      expect(x.weight()).toBe(REPORTED[which].basisWeight)
    }
  })

  it('a cheap randomized search (information-set decoding, seeded) finds a logical operator of weight 12 on the gross code and 18 on the two-gross code', () => {
    const g = searchLightLogicalX(gross, rng(1), 300)!
    expect(g.weight).toBe(12)
    expect(gross.css.stabilizer().isLogical(g.operator)).toBe(true)
    expect(g.operator.weight()).toBe(12)
    const t = searchLightLogicalX(twoGross, rng(2), 1500)!
    expect(t.weight).toBe(18)
    expect(twoGross.css.stabilizer().isLogical(t.operator)).toBe(true)
    expect(t.operator.weight()).toBe(18)
  }, 60_000)

  it('the search is consistent with the reported distances: no witness it finds is lighter (a lighter one would contradict the paper)', () => {
    for (const [which, code] of both)
      for (let seed = 1; seed <= 3; seed++) {
        const r = searchLightLogicalX(code, rng(seed), 60)
        if (r) expect(r.weight).toBeGreaterThanOrEqual(REPORTED[which].d)
      }
  }, 60_000)

  it('exhaustive search proves only a small lower bound: no logical operator of weight ≤ 3 (so d ≥ 4), and it says it did not finish', () => {
    const r = cssDistance(gross.css, { maxWeight: 3 })
    expect(r.exact).toBe(false)
    expect(r.lower).toBe(4)
    expect(r.X.upper).toBeNull()
  }, 60_000)
})

describe('bb: validating a spec that arrives as data (a recipe’s parameters)', () => {
  it('accepts the paper’s specs round-tripped through JSON and builds the same code', () => {
    const v = validateBBSpec(JSON.parse(JSON.stringify(GROSS_SPEC)))
    expect(v.ok).toBe(true)
    if (v.ok) {
      const c = bbCode(v.spec)
      expect(c.n).toBe(144)
      expect(c.k).toBe(12)
    }
  })

  it('rejects wrong shapes, non-integers, out-of-range sides, too many cells, too many terms, huge exponents and unknown fields', () => {
    const base = { l: 12, m: 6, A: [[0, 0], [0, 1], [3, -1]], B: [[0, 0], [1, 0], [-1, -3]] }
    for (const bad of [
      null,
      [],
      'x',
      { ...base, l: 1 },
      { ...base, m: 2.5 },
      { ...base, l: BB_LIMITS.maxSide + 1 },
      { ...base, l: 24, m: 24 },
      { ...base, A: [] },
      { ...base, A: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
      { ...base, B: [[0, 0, 0]] },
      { ...base, B: [[0, 'a']] },
      { ...base, A: [[0, BB_LIMITS.maxExponent + 1]] },
      { ...base, extra: 1 },
    ])
      expect(validateBBSpec(bad).ok, JSON.stringify(bad)).toBe(false)
  })

  it('a spec whose terms coincide still builds (the cancelling terms drop out) and reports the smaller check weight instead of crashing', () => {
    const c = bbCode({ name: 'degenerate', l: 4, m: 4, A: [[0, 0], [0, 0], [1, 0]], B: [[0, 0], [1, 0], [0, 1]] })
    expect(c.A.reduce((s, b) => s + b, 0)).toBe(1)
    expect(c.checkWeight).toBeLessThan(6)
  })
})
