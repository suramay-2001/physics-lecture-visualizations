/**
 * Circuit-level faults for the rotated surface-code patch (P-B1-story §9.1, b1-cycle): the memory circuit (R rounds of check measurements, then an ideal
 * readout of the data qubits), every elementary fault in it, the detector pattern and logical flip each fault causes (Pauli propagation, which is linear
 * over GF(2)), and the circuit distance d_circ: the fewest faults that flip the logical qubit while every detector stays quiet.
 *
 * Noise model of the paper's section 2.6: a reset or a measurement fails as one flip (probability p), an idle qubit as X, Y or Z, a CNOT as one of the 15
 * two-qubit Paulis. Z-memory experiment: Zbar is Z on row 0 of the patch; Z checks are compared from the first round (the data start in |0>), X checks only
 * between consecutive rounds; the final ideal readout gives one more detector per Z check.
 * Numpy twin: pipeline/qec_numpy.py (memory_circuit / locations / signature / circuit_distance); the b1.py claims check 1470 / 221 / 197.
 */
import { patchChecks, checkSteps, type Corner, type PatchCheck } from './schedule'

export type OpKind = 'RZ' | 'RX' | 'CX' | 'MZ' | 'MX'

export interface MemoryOp {
  /** 0 reset, 1–4 the four CNOT steps, 5 measurement */
  layer: number
  kind: OpKind
  /** CX: [control, target]; others: [qubit] */
  qubits: number[]
  /** the measurement this op records */
  meas?: { check: number; round: number }
}

export interface MemoryCircuit {
  d: number
  /** data qubits 0..n-1, then one check qubit per check (n + check index) */
  n: number
  nq: number
  rounds: number
  checks: PatchCheck[]
  ops: MemoryOp[]
}

export function memoryCircuit(d: number, xOrder: readonly Corner[], zOrder: readonly Corner[], rounds: number): MemoryCircuit {
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 4) throw new Error('memoryCircuit: rounds must be a whole number from 1 to 4')
  const checks = patchChecks(d)
  const n = d * d
  const ops: MemoryOp[] = []
  for (let r = 0; r < rounds; r++) {
    for (const c of checks) ops.push({ layer: 0, kind: c.type === 'X' ? 'RX' : 'RZ', qubits: [n + c.index] })
    for (let step = 1; step <= 4; step++)
      for (const c of checks) {
        const hit = checkSteps(c, xOrder, zOrder).find((s) => s.step === step)
        if (hit) ops.push({ layer: step, kind: 'CX', qubits: c.type === 'X' ? [n + c.index, hit.qubit] : [hit.qubit, n + c.index] })
      }
    for (const c of checks) ops.push({ layer: 5, kind: c.type === 'X' ? 'MX' : 'MZ', qubits: [n + c.index], meas: { check: c.index, round: r } })
  }
  return { d, n, nq: n + checks.length, rounds, checks, ops }
}

export interface Fault {
  /** the fault happens just after op number `pos` (−1: before everything) */
  pos: number
  /** the Pauli, as qubit bit masks */
  x: bigint
  z: bigint
  label: 'prep' | 'measure' | 'cnot' | 'idle'
}

const bit = (q: number): bigint => 1n << BigInt(q)

/** Every elementary fault: a flipped reset, a flipped measurement, one of 15 Paulis after each CNOT, X/Y/Z on every idle qubit of every step. */
export function elementaryFaults(c: MemoryCircuit): Fault[] {
  const faults: Fault[] = []
  const per = c.ops.length / c.rounds
  for (let r = 0; r < c.rounds; r++) {
    const base = r * per
    const busy: Set<number>[] = Array.from({ length: 6 }, () => new Set<number>())
    const lastIdx: number[] = new Array<number>(6).fill(-1)
    for (let k = 0; k < per; k++) {
      const op = c.ops[base + k]
      op.qubits.forEach((q) => busy[op.layer].add(q))
      lastIdx[op.layer] = base + k
    }
    for (let k = 0; k < per; k++) {
      const idx = base + k
      const op = c.ops[idx]
      if (op.kind === 'RZ') faults.push({ pos: idx, x: bit(op.qubits[0]), z: 0n, label: 'prep' })
      else if (op.kind === 'RX') faults.push({ pos: idx, x: 0n, z: bit(op.qubits[0]), label: 'prep' })
      else if (op.kind === 'MZ') faults.push({ pos: idx - 1, x: bit(op.qubits[0]), z: 0n, label: 'measure' })
      else if (op.kind === 'MX') faults.push({ pos: idx - 1, x: 0n, z: bit(op.qubits[0]), label: 'measure' })
      else {
        const [a, b] = op.qubits
        for (let pa = 0; pa < 4; pa++)
          for (let pb = 0; pb < 4; pb++) {
            if (pa === 0 && pb === 0) continue
            faults.push({
              pos: idx,
              x: ((pa & 1) !== 0 ? bit(a) : 0n) | ((pb & 1) !== 0 ? bit(b) : 0n),
              z: ((pa & 2) !== 0 ? bit(a) : 0n) | ((pb & 2) !== 0 ? bit(b) : 0n),
              label: 'cnot',
            })
          }
      }
    }
    for (let l = 0; l < 6; l++)
      for (let q = 0; q < c.nq; q++) {
        if (busy[l].has(q)) continue
        if (q >= c.n && (l === 0 || l === 5)) continue
        for (const [x, z] of [[bit(q), 0n], [0n, bit(q)], [bit(q), bit(q)]] as [bigint, bigint][]) faults.push({ pos: lastIdx[l], x, z, label: 'idle' })
      }
  }
  return faults
}

export interface Signature {
  /** detector pattern as a bit mask */
  det: bigint
  /** 1 if the logical Z flips */
  obs: 0 | 1
}

export function faultSignature(c: MemoryCircuit, f: Fault): Signature {
  let x = f.x
  let z = f.z
  const flips = new Map<string, number>()
  for (let i = f.pos + 1; i < c.ops.length; i++) {
    const op = c.ops[i]
    if (op.kind === 'CX') {
      const [a, b] = op.qubits
      if ((x >> BigInt(a)) & 1n) x ^= bit(b)
      if ((z >> BigInt(b)) & 1n) z ^= bit(a)
    } else if (op.kind === 'RZ' || op.kind === 'RX') {
      const m = ~bit(op.qubits[0])
      x &= m
      z &= m
    } else if (op.kind === 'MZ') flips.set(`${op.meas!.check}:${op.meas!.round}`, Number((x >> BigInt(op.qubits[0])) & 1n))
    else flips.set(`${op.meas!.check}:${op.meas!.round}`, Number((z >> BigInt(op.qubits[0])) & 1n))
  }
  const get = (ci: number, r: number): number => flips.get(`${ci}:${r}`) ?? 0
  const det: number[] = []
  for (const ch of c.checks) {
    for (let r = 0; r < c.rounds; r++) {
      const cur = get(ch.index, r)
      if (ch.type === 'Z') det.push(cur ^ (r > 0 ? get(ch.index, r - 1) : 0))
      else if (r > 0) det.push(cur ^ get(ch.index, r - 1))
    }
    if (ch.type === 'Z') {
      let par = 0
      for (const q of Object.values(ch.corners) as number[]) par ^= Number((x >> BigInt(q)) & 1n)
      det.push(par ^ get(ch.index, c.rounds - 1))
    }
  }
  let obs = 0
  for (let col = 0; col < c.d; col++) obs ^= Number((x >> BigInt(col)) & 1n) // Zbar = Z on row 0 (qubits 0..d-1)
  let mask = 0n
  det.forEach((b, i) => {
    if (b) mask |= bit(i)
  })
  return { det: mask, obs: obs as 0 | 1 }
}

export interface CircuitDistance {
  /** the fewest faults (1–3) with quiet detectors and a logical flip, or null if none up to 3 */
  dCirc: number | null
  /** number of elementary faults ("fault events") */
  events: number
  /** distinct non-trivial signatures */
  signatures: number
}

/** d_circ up to 3 by a meet-in-the-middle over signatures (patches of distance 3 only: 17 qubits, ~1500 faults). */
export function circuitDistance(c: MemoryCircuit): CircuitDistance {
  if (c.d !== 3) throw new Error('circuitDistance: only the distance-3 patch (the enumeration is sized for it)')
  const faults = elementaryFaults(c)
  const sigs = new Map<string, Signature>()
  for (const f of faults) {
    const s = faultSignature(c, f)
    if (s.det === 0n && s.obs === 0) continue
    sigs.set(`${s.det}:${s.obs}`, s)
  }
  const events = faults.length
  const list = [...sigs.values()]
  const out = (dCirc: number | null): CircuitDistance => ({ dCirc, events, signatures: list.length })
  if (list.some((s) => s.det === 0n && s.obs === 1)) return out(1)
  const byDet = new Map<bigint, Set<number>>()
  for (const s of list) {
    if (!byDet.has(s.det)) byDet.set(s.det, new Set())
    byDet.get(s.det)!.add(s.obs)
  }
  for (const [det, os] of byDet) if (det !== 0n && os.has(0) && os.has(1)) return out(2)
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const need = list[i].det ^ list[j].det
      const os = byDet.get(need)
      if (os && os.has(1 ^ list[i].obs ^ list[j].obs)) return out(3)
    }
  return out(null)
}

/* ------------------------------------------------------------------ one check's own circuit ------------------------------------------------------------------ */

export interface CheckCircuitCount {
  type: 'X' | 'Z'
  weight: number
  /** fault places: 1 reset, 1 measurement, `weight` CNOTs, and every data qubit idle during the reset and the measurement step */
  places: { prep: number; measure: number; cnot: number; idle: number; total: number }
  /** the paper's N after splitting every place into 15 equally likely faults of chance q = p / 15 */
  n: number
  /** N·q in units of p: the expected number of faults per run */
  expected: number
  /** distinct elementary Pauli events: 2 flips + 15 per CNOT + 3 per idle place */
  events: number
}

export function checkCircuitCount(type: 'X' | 'Z', weight: number): CheckCircuitCount {
  if (weight !== 2 && weight !== 4) throw new Error('checkCircuitCount: a surface-code check has weight 2 or 4')
  const places = { prep: 1, measure: 1, cnot: weight, idle: 2 * weight, total: 2 + 3 * weight }
  return { type, weight, places, n: places.total * 15, expected: (places.total * 15) / 15, events: 2 + 15 * weight + 3 * 2 * weight }
}

/**
 * A fault on the check qubit of an X check after `k` of its `weight` CNOTs (the check qubit is the control) spreads as X to the remaining weight − k data
 * qubits. Modulo the check itself (X on all of them, which is a stabilizer) the effective weight is min(w, weight − w).
 */
export function hookWeights(weight: number): { data: number[]; effective: number[]; maxEffective: number } {
  const data = Array.from({ length: weight }, (_, k) => weight - k)
  const effective = data.map((w) => Math.min(w, weight - w))
  return { data, effective, maxEffective: Math.max(...effective) }
}
