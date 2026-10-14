/**
 * The code registry (registry.ts) and the dense code words (codewords.ts): every registered code against the engine pieces it is built from and the numpy
 * fixture (pipeline/make_qec_fixtures.py → qec.json), textbook logical operators, the decoder, the distance, the naming of a residual, and the code words
 * checked as eigenstates by the dense-matrix route of physics/qc (kron products), a separate implementation from the symplectic bookkeeping.
 */
import { describe, expect, it, vi } from 'vitest'
import raw from '../__fixtures__/qec.json?raw'
import { c } from '../complex'
import type { Vec } from '../linalg'
import { pauliEigenvalue } from '../qc/gates'
import { REPORTED } from './bb'
import { codewords } from './codewords'
import { Pauli } from './pauli'
import { REGISTERED_CODE_IDS, classifyResidual, decoderOf, distanceOf, isRegisteredCodeId, logicalWitnessOf, registeredCode } from './registry'

vi.setConfig({ testTimeout: 60_000 })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)

const SMALL = ['rep3', 'rep3x', 'shor9', 'steane7', 'five5', 'surface3', 'surface5'] as const
const FIXTURE_KEY: Record<string, string> = { rep3: 'bitflip3', shor9: 'shor', steane7: 'steane', five5: 'five', surface3: 'surface3', surface5: 'surface5' }

describe('registry: the IDs', () => {
  it('lists the ten codes, recognises them and refuses anything else with the list in the message', () => {
    expect([...REGISTERED_CODE_IDS]).toEqual(['rep3', 'rep3x', 'shor9', 'steane7', 'five5', 'surface3', 'surface5', 'gross', 'two-gross', 'c422'])
    for (const id of REGISTERED_CODE_IDS) expect(isRegisteredCodeId(id)).toBe(true)
    expect(isRegisteredCodeId('steane')).toBe(false)
    expect(() => registeredCode('steane')).toThrow(/unknown code "steane".*rep3.*c422/)
  })
})

describe('registry: every code is a valid stabilizer code with positions for all of its qubits and checks', () => {
  for (const id of REGISTERED_CODE_IDS) {
    it(id, () => {
      const e = registeredCode(id)
      const rep = e.stabilizer.check()
      if (e.family === 'torus') {
        // the bicycle codes list ALL 2ℓm checks, and they are dependent (rank n − k): commuting, Hermitian, consistent, not independent
        expect([rep.commuting, rep.hermitian, rep.noMinusIdentity, rep.independent]).toEqual([true, true, true, false])
        expect(e.rank).toBe(e.n - 12)
      } else {
        expect(rep.ok, rep.problems.join('; ')).toBe(true)
        expect(e.rank).toBe(e.stabilizer.generators.length)
      }
      expect(e.qubitPos.length).toBe(e.n)
      expect(e.checkPos.length).toBe(e.stabilizer.generators.length)
      expect(e.checkKind.length).toBe(e.stabilizer.generators.length)
      expect(e.k).toBe(e.n - e.rank)
      for (const [x, y] of [...e.qubitPos, ...e.checkPos]) expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
      // no two data qubits share a position, and no check sits on a qubit
      const q = new Set(e.qubitPos.map((p) => p.join(',')))
      expect(q.size).toBe(e.n)
      for (const p of e.checkPos) expect(q.has(p.join(',')), `a check at ${p}`).toBe(false)
    })
  }

  it('n, k and the rank are the numpy fixture’s (steane, shor, five, surface 3, surface 5, bit-flip 3)', () => {
    for (const [id, key] of Object.entries(FIXTURE_KEY)) {
      const e = registeredCode(id)
      const f = FX.codes[key]
      expect([e.n, e.k], id).toEqual([f.n, f.k])
      expect(e.rank, id).toBe(f.n - f.k)
    }
  })

  it('the bicycle codes: 144 and 288 qubits, 12 logical qubits, weight-6 checks, positions are the engine’s Tanner positions with y flipped', () => {
    for (const [id, n, side] of [['gross', 144, [12, 6]], ['two-gross', 288, [12, 12]]] as const) {
      const e = registeredCode(id)
      expect([e.n, e.k, e.stabilizer.generators.length]).toEqual([n, 12, n])
      expect(Math.max(...e.stabilizer.generators.map((g) => g.weight()))).toBe(6)
      const t = e.bb!.tanner()
      const L0 = t.nodes.find((x) => x.id === 'L5')!
      expect(e.qubitPos[L0.index]).toEqual([L0.pos[0], -L0.pos[1]])
      const Z3 = t.nodes.find((x) => x.id === 'Z3')!
      expect(e.checkPos[e.bb!.cells + 3]).toEqual([Z3.pos[0], -Z3.pos[1]])
      expect(Math.max(...e.qubitPos.map((p) => p[0]))).toBe(2 * side[0] - 1)
    }
  })

  it('the surface codes draw data at (column, row) and checks at the engine’s face centres, X checks first', () => {
    const e = registeredCode('surface3')
    const sf = e.surface!
    expect(e.qubitPos).toEqual(sf.data)
    const xs = sf.checks.filter((k) => k.type === 'X')
    expect(e.checkPos.slice(0, xs.length)).toEqual(xs.map((k) => k.center))
    expect(e.checkKind.slice(0, xs.length).every((k) => k === 'X')).toBe(true)
    expect(e.checkKind.slice(xs.length).every((k) => k === 'Z')).toBe(true)
  })

  it('check kinds: repetition codes Z or X only, Steane 3 + 3, Shor 2 X and 6 Z, the five-qubit code mixed', () => {
    expect(registeredCode('rep3').checkKind).toEqual(['Z', 'Z'])
    expect(registeredCode('rep3x').checkKind).toEqual(['X', 'X'])
    expect(registeredCode('steane7').checkKind).toEqual(['X', 'X', 'X', 'Z', 'Z', 'Z'])
    expect(registeredCode('shor9').checkKind).toEqual(['X', 'X', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z'])
    expect(registeredCode('five5').checkKind).toEqual(['mixed', 'mixed', 'mixed', 'mixed'])
  })

  it('Steane’s three faces: each pairs the X check and the Z check of the same four qubits', () => {
    const e = registeredCode('steane7')
    expect(e.faces.length).toBe(3)
    for (const f of e.faces) {
      const [a, b] = f.checks.map((i) => e.stabilizer.generators[i].support())
      expect(a).toEqual(b)
      expect(a).toEqual(f.qubits)
    }
  })
})

describe('registry: textbook logical operators', () => {
  for (const id of SMALL) {
    it(`${id}: X̄ and Z̄ are logical, anticommute, and Z̄ is the one |0̄⟩ is +1 for`, () => {
      const e = registeredCode(id)
      const L = e.logical!
      expect(e.stabilizer.isLogical(L.X)).toBe(true)
      expect(e.stabilizer.isLogical(L.Z)).toBe(true)
      expect(L.X.commutesWith(L.Z)).toBe(false)
    })
  }
  it('the bicycle codes have none (k = 12) and the registry says so', () => {
    expect(registeredCode('gross').logical).toBeNull()
  })
})

describe('registry: distance and the minimum-weight logical operator', () => {
  it('the exact distances: bit-flip 3 and phase-flip 3 have d = 1 (one Z, or one X, is a logical operator), Shor, Steane, five-qubit and d = 3 surface 3, surface 5 has 5', () => {
    expect(distanceOf(registeredCode('rep3'))).toEqual({ d: 1, reported: null, exact: true })
    expect(distanceOf(registeredCode('rep3x')).d).toBe(1)
    for (const id of ['shor9', 'steane7', 'five5', 'surface3'] as const) expect(distanceOf(registeredCode(id)).d, id).toBe(3)
    expect(distanceOf(registeredCode('surface5')).d).toBe(5)
  })

  it('the fixture’s distance (found by itertools) agrees for Steane, Shor, the five-qubit code and both surface codes', () => {
    expect(distanceOf(registeredCode('steane7')).d).toBe(Math.min(FX.codes.steane.dX, FX.codes.steane.dZ))
    expect(distanceOf(registeredCode('shor9')).d).toBe(Math.min(FX.codes.shor.dX, FX.codes.shor.dZ))
    expect(distanceOf(registeredCode('five5')).d).toBe(FX.codes.five.d)
    expect(distanceOf(registeredCode('surface3')).d).toBe(Math.min(FX.codes.surface3.dX, FX.codes.surface3.dZ))
    expect(distanceOf(registeredCode('surface5')).d).toBe(Math.min(FX.codes.surface5.dX, FX.codes.surface5.dZ))
  })

  it('the witness is a logical operator of weight d', () => {
    for (const id of SMALL) {
      const e = registeredCode(id)
      const w = logicalWitnessOf(e)!
      expect(e.stabilizer.isLogical(w), id).toBe(true)
      expect(w.weight(), id).toBe(distanceOf(e).d)
    }
  })

  it('the bicycle codes: d is NOT computed, the paper’s number is reported, and the witness is the paper’s weight-12 / weight-20 operator (an upper bound)', () => {
    const g = registeredCode('gross')
    expect(distanceOf(g)).toEqual({ d: null, reported: REPORTED.gross.d, exact: false })
    const w = logicalWitnessOf(g)!
    expect(w.weight()).toBe(REPORTED.gross.basisWeight)
    expect(g.stabilizer.isLogical(w)).toBe(true)
    const t = registeredCode('two-gross')
    expect(distanceOf(t).reported).toBe(18)
    expect(logicalWitnessOf(t)!.weight()).toBe(REPORTED['two-gross'].basisWeight)
  })
})

describe('registry: the lookup decoder', () => {
  it('every weight-1 error of the d ≥ 3 codes is corrected to a check or the identity; the bit-flip code only fixes X flips', () => {
    for (const id of ['shor9', 'steane7', 'five5', 'surface3', 'surface5'] as const) {
      const e = registeredCode(id)
      const dec = decoderOf(e)!
      for (let q = 0; q < e.n; q++)
        for (const l of ['X', 'Y', 'Z'] as const) {
          const err = Pauli.single(e.n, q, l)
          const corr = dec.decode(e.stabilizer.syndrome(err))!
          expect(e.stabilizer.syndrome(corr), `${id} ${l}${q}`).toEqual(e.stabilizer.syndrome(err))
          expect(['identity', 'check'], `${id} ${l}${q}`).toContain(classifyResidual(e, corr.mul(err)))
        }
    }
    const e = registeredCode('rep3')
    const dec = decoderOf(e)!
    expect(classifyResidual(e, dec.decode(e.stabilizer.syndrome(Pauli.parse('IXI')))!.mul(Pauli.parse('IXI')))).toBe('identity')
    // a Z flip is invisible to the bit-flip code (syndrome 00): the decoder does nothing and the residual IS the error, a logical Z
    expect(classifyResidual(e, dec.decode(e.stabilizer.syndrome(Pauli.parse('ZII')))!.mul(Pauli.parse('ZII')))).toBe('logical-Z')
  })

  it('the d = 5 surface code corrects every error of weight 2 (the decoder enumerates up to 2)', () => {
    const e = registeredCode('surface5')
    const dec = decoderOf(e)!
    expect(dec.maxWeight).toBe(2)
    const err = Pauli.parse('XIIIIIIIIIIIIIZIIIIIIIIII')
    const corr = dec.decode(e.stabilizer.syndrome(err))!
    expect(['identity', 'check']).toContain(classifyResidual(e, corr.mul(err)))
  })

  it('the bicycle codes have no decoder', () => {
    expect(decoderOf(registeredCode('gross'))).toBeNull()
  })
})

describe('registry: naming a residual', () => {
  const e = registeredCode('steane7')
  it('identity, a check, X̄, Z̄, Ȳ (Steane: X̄ = X⊗7 and Z̄ = Z⊗7 up to checks), and an operator with a syndrome is “detectable”', () => {
    expect(classifyResidual(e, Pauli.parse('IIIIIII'))).toBe('identity')
    expect(classifyResidual(e, e.stabilizer.generators[0])).toBe('check')
    expect(classifyResidual(e, e.stabilizer.generators[0].mul(e.stabilizer.generators[4]))).toBe('check')
    expect(classifyResidual(e, Pauli.parse('XXXIIII'))).toBe('logical-X')
    expect(classifyResidual(e, Pauli.parse('ZZZIIII'))).toBe('logical-Z')
    expect(classifyResidual(e, Pauli.parse('YYYIIII'))).toBe('logical-Y')
    expect(classifyResidual(e, Pauli.parse('XIIIIII'))).toBe('detectable')
  })
  it('a code with k > 1 names a logical operator only as “logical”', () => {
    const g = registeredCode('gross')
    expect(classifyResidual(g, logicalWitnessOf(g)!)).toBe('logical')
  })
})

/* ------------------------------------------------------------------------------------------------ code words */
const dense = (n: number, list: { bits: string; amp: { re: number; im: number } }[]): Vec => {
  const v: Vec = Array.from({ length: 2 ** n }, () => c(0))
  for (const { bits, amp } of list) v[parseInt(bits, 2)] = c(amp.re, amp.im)
  return v
}
const normSq = (list: { amp: { re: number; im: number } }[]): number => list.reduce((s, a) => s + a.amp.re ** 2 + a.amp.im ** 2, 0)

describe('codewords: dense code words of the small codes', () => {
  it('Shor: |0̄⟩ = (|000⟩ + |111⟩)^{⊗3}/(2√2) and |1̄⟩ = (|000⟩ − |111⟩)^{⊗3}/(2√2), Bergou’s words', () => {
    const w = codewords(registeredCode('shor9'))
    expect(w.zero.length).toBe(8)
    expect(w.one.length).toBe(8)
    const strings = new Set<string>()
    for (const a of ['000', '111']) for (const b of ['000', '111']) for (const d of ['000', '111']) strings.add(a + b + d)
    expect(new Set(w.zero.map((x) => x.bits))).toEqual(strings)
    for (const x of w.zero) expect(x.amp.re).toBeCloseTo(1 / (2 * Math.SQRT2), 12)
    for (const x of w.one) {
      const ones = (x.bits.match(/111/g) ?? []).length
      expect(x.amp.re, x.bits).toBeCloseTo(((-1) ** ones) / (2 * Math.SQRT2), 12)
      expect(x.amp.im).toBeCloseTo(0, 12)
    }
  })

  it('Steane: |0̄⟩ is the eight even words of the Hamming code at 1/√8, |1̄⟩ the eight odd ones, |+̄⟩ all sixteen at 1/4', () => {
    const w = codewords(registeredCode('steane7'))
    // the Hamming code: words w with H·w = 0, H = columns 1 … 7 in binary (the rows 1010101, 0110011, 0001111)
    const H = ['1010101', '0110011', '0001111']
    const inHamming = (s: string) => H.every((r) => [...r].reduce((a, ch, i) => a ^ (Number(ch) & Number(s[i])), 0) === 0)
    const words = Array.from({ length: 128 }, (_, b) => b.toString(2).padStart(7, '0')).filter(inHamming)
    expect(words.length).toBe(16)
    const even = words.filter((s) => [...s].filter((ch) => ch === '1').length % 2 === 0)
    const odd = words.filter((s) => [...s].filter((ch) => ch === '1').length % 2 === 1)
    expect(w.zero.map((x) => x.bits)).toEqual(even)
    expect(w.one.map((x) => x.bits)).toEqual(odd)
    expect(w.plus.map((x) => x.bits)).toEqual(words)
    for (const x of w.zero) expect(x.amp.re).toBeCloseTo(1 / Math.sqrt(8), 12)
    for (const x of w.plus) expect(x.amp.re).toBeCloseTo(0.25, 12)
  })

  it('the repetition codes: |000⟩, |111⟩; and |+++⟩, |−−−⟩ for the phase-flip code', () => {
    const b = codewords(registeredCode('rep3'))
    expect(b.zero.map((x) => x.bits)).toEqual(['000'])
    expect(b.one.map((x) => x.bits)).toEqual(['111'])
    const p = codewords(registeredCode('rep3x'))
    expect(p.zero.length).toBe(8)
    for (const x of p.zero) expect(x.amp.re).toBeCloseTo(1 / (2 * Math.SQRT2), 12)
    for (const x of p.one) expect(x.amp.re, x.bits).toBeCloseTo(((-1) ** [...x.bits].filter((ch) => ch === '1').length) / (2 * Math.SQRT2), 12)
  })

  it('the d = 3 surface code: sixteen terms (four X checks), the five-qubit code sixteen terms of ±1/4', () => {
    expect(codewords(registeredCode('surface3')).zero.length).toBe(16)
    const five = codewords(registeredCode('five5'))
    expect(five.zero.length).toBe(16)
    for (const x of five.zero) expect(Math.abs(x.amp.re)).toBeCloseTo(0.25, 12)
  })

  it('every word is normalised, a +1 eigenstate of every check, and |0̄⟩ / |1̄⟩ have Z̄ = +1 / −1 and X̄ swaps them (dense-matrix route of physics/qc)', () => {
    for (const id of ['rep3', 'rep3x', 'shor9', 'steane7', 'five5', 'surface3'] as const) {
      const e = registeredCode(id)
      const w = codewords(e)
      for (const list of [w.zero, w.one, w.plus]) {
        expect(normSq(list), id).toBeCloseTo(1, 12)
        const psi = dense(e.n, list)
        for (const g of e.stabilizer.generators) expect(pauliEigenvalue(psi, g.letters().join('')), `${id} ${g}`).toBe(g.sign())
      }
      expect(pauliEigenvalue(dense(e.n, w.zero), e.logical!.Z.letters().join('')), `${id} Z̄|0̄⟩`).toBe(1)
      expect(pauliEigenvalue(dense(e.n, w.one), e.logical!.Z.letters().join('')), `${id} Z̄|1̄⟩`).toBe(-1)
      expect(pauliEigenvalue(dense(e.n, w.plus), e.logical!.X.letters().join('')), `${id} X̄|+̄⟩`).toBe(1)
    }
  })

  it('a code with k ≠ 1 has no code words here; a code too large for a dense vector is refused', () => {
    expect(() => codewords(registeredCode('gross'))).toThrow(/no single logical qubit/)
    expect(() => codewords(registeredCode('surface5'))).toThrow(/dense limit/)
  })
})
