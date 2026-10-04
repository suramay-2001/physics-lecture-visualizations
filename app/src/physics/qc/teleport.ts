/**
 * Teleportation, dense coding and entanglement swapping (E2 `teleport`; P-709-map/P-709-remap §6, P-Q11-story §9.1).
 * Pure TypeScript; numpy twin pipeline/make_qc_fixtures.py block "teleport" (independent route: explicit 3- and
 * 4-qubit vectors). `circuit.ts` `branches` (mid-circuit measurement + classical control) is the independent SECOND
 * route for every branch probability and fidelity here (P-Q11-story §9.1 "already in the engine"): a property test
 * cross-checks `teleport`/`swapIdentity` against a `Circuit` run through `branches`.
 *
 * Conventions: q0 is the LEFT factor. The shared resource defaults to Φ+ = bell('00+11'); a resource's two halves are
 * always adjacent wires, the first held by the sender.
 */
import { abs, c, ZERO } from '../complex'
import { apply, inner, type Mat, type Vec } from '../linalg'
import { kronM } from './cmat'
import { fidelity as fidelityOf, reducedDensity, schmidt } from './density'
import { I2, X, Y, Z } from './gates'
import { bellMeasure } from './measure'
import { bell, BELL_BASIS, kron } from './state'

const GATE_OF_BITS: Readonly<Record<'00' | '01' | '10' | '11', Mat>> = { '00': I2, '01': X, '10': Z, '11': Y }

/**
 * The standard Bell names → the 2-bit readout a Bell measurement reports (P-Q11-story §9.1 "dense coding", "the
 * correction is Z^{M1}X^{M2}"): bit 0 (M1) controls the Z correction, bit 1 (M2) the X correction. Φ+ → 00 (no
 * error), Ψ+ → 01 (an X twist), Φ− → 10 (a Z twist), Ψ− → 11 (both).
 */
const READOUT_OF_BELL: Readonly<Record<string, '00' | '01' | '10' | '11'>> = { 'Φ+': '00', 'Ψ+': '01', 'Φ−': '10', 'Ψ−': '11' }

const bestOf = <T extends { p: number }>(outcomes: readonly T[]): T => outcomes.reduce((best, o) => (o.p > best.p ? o : best))

/** The Bell state (op ⊗ I)|Φ+⟩ lands on, and which standard name it matches (P-Q11-story §9.1 "already in the engine"). */
export function bellCycle(op: 'I' | 'X' | 'Y' | 'Z'): { ket: Vec; name: string } {
  const GATE: Readonly<Record<'I' | 'X' | 'Y' | 'Z', Mat>> = { I: I2, X, Y, Z }
  const ket = apply(kronM(GATE[op], I2), bell('00+11'))
  return { ket, name: bestOf(bellMeasure(ket, 0, 1)).name }
}

/**
 * Superdense coding: Alice applies one of I, X, Z, Y to her half of `resource` (default Φ+) by `bits`, and Bob's Bell
 * measurement reads those same two bits back exactly (`prob` = 1, every time: encoding a Bell state by a LOCAL
 * unitary on one qubit always lands on another exact Bell-basis state).
 */
export function denseCode(bits: '00' | '01' | '10' | '11', resource: Vec = bell('00+11')): { encoded: Vec; readout: string; prob: number } {
  const encoded = apply(kronM(GATE_OF_BITS[bits], I2), resource)
  const outcome = bestOf(bellMeasure(encoded, 0, 1))
  return { encoded, readout: READOUT_OF_BELL[outcome.name] ?? outcome.name, prob: outcome.p }
}

/**
 * Teleport `psi` (wire 0) through `resource` (default Φ+, wires 1–2; Alice holds 0 and 1, Bob holds 2) for ONE
 * branch of Alice's Bell measurement, chosen by `outcome` (default '00'): her measurement always lands on each of
 * the four Bell states with probability ¼, so to see all four branches call this once per outcome.
 *
 * `bobPre` is the reduced state of Bob's qubit BEFORE any measurement happens at all — tracing Alice's two wires out
 * of ψ⊗resource directly, independent of `outcome` — and is exactly ½I for any ψ (the no-signalling fact: Bob's
 * qubit alone carries no information about ψ or about whether Alice has measured). `bobPost` is Bob's qubit's exact
 * state in this branch, read off by `density.ts` `schmidt` (the branch's post-measurement state is an exact product
 * across Alice | Bob), after applying his correction Z^{M1}X^{M2} (M1M2 = `outcome`): `fidelity` = 1 in every branch.
 */
export function teleport(
  psi: Vec,
  resource: Vec = bell('00+11'),
  outcome: '00' | '01' | '10' | '11' = '00',
): { outcome: string; prob: number; bobPre: Mat; bobPost: Vec; fidelity: number } {
  const full = kron(psi, resource)
  const bobPre = reducedDensity(full, [2])
  const branch = bellMeasure(full, 0, 1).find((o) => READOUT_OF_BELL[o.name] === outcome)
  if (!branch?.post) throw new Error(`teleport: outcome ${outcome} has probability 0`)
  let bobRaw = schmidt(branch.post, [2]).a[0]
  if (outcome[1] === '1') bobRaw = apply(X, bobRaw)
  if (outcome[0] === '1') bobRaw = apply(Z, bobRaw)
  return { outcome, prob: branch.p, bobPre, bobPost: bobRaw, fidelity: fidelityOf(psi, bobRaw) }
}

/**
 * Entanglement swapping: two independent resources r1 (A–B1) and r2 (B2–C), default both Φ+. Bob's Bell measurement
 * on B1, B2 projects A and C — never themselves entangled — into a Bell state, one of the four outcomes each with
 * probability ¼ (P-Q11-story §9.1).
 */
export function swapIdentity(r1: Vec = bell('00+11'), r2: Vec = bell('00+11')): { outcome: string; prob: number; ac: Vec; name: string }[] {
  const full = kron(r1, r2)
  return bellMeasure(full, 1, 2).map((o) => {
    const ac = schmidt(o.post ?? full, [0, 3]).a[0] ?? full
    return { outcome: READOUT_OF_BELL[o.name] ?? o.name, prob: o.p, ac, name: matchBellName(ac) }
  })
}

function matchBellName(ket: Vec): string {
  let best = BELL_BASIS[0]
  let bestOverlap = -1
  for (const b of BELL_BASIS) {
    const ov = abs(inner(b.ket, ket))
    if (ov > bestOverlap) {
      bestOverlap = ov
      best = b
    }
  }
  return best.name
}

/**
 * The Weyl–Bell operator basis on ℂᴺ⊗ℂᴺ: χ_{n,m} = N^{−1/2} Σⱼ e^{2πijn/N} |j⟩|j⊕m⟩ (⊕ mod N). N = 2 reproduces the
 * qubit Bell basis exactly: weylBell(2,0,0) = Φ+, (1,0) = Φ−, (0,1) = Ψ+, (1,1) = Ψ− (up to the engine's own phase).
 */
export function weylBell(N: number, n: number, m: number): Vec {
  const out: Vec = new Array(N * N).fill(ZERO)
  const r = 1 / Math.sqrt(N)
  const mm = ((m % N) + N) % N
  for (let j = 0; j < N; j++) {
    const k = (j + mm) % N
    out[j * N + k] = c(r * Math.cos((2 * Math.PI * j * n) / N), r * Math.sin((2 * Math.PI * j * n) / N))
  }
  return out
}
