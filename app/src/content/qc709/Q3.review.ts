/**
 * Chapter Q3 review cards: the exam layer in both tracks (P-Q3-story §6). Ground-up ≤ 25 words per sentence, Formal ≤
 * 40; ≤ 5 points each. Every number comes from Q3.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q3.values'

export const Q3_REVIEW: Record<string, ReviewCard> = {
  'q3-born': {
    points: [
      'A chance is |⟨α|β⟩|².',
      'It is a projector sandwich, ⟨ψ|P|ψ⟩.',
      'A basis’s projectors add to I, so its chances add to 1.',
      'After a result, the state is P|ψ⟩ rescaled.',
    ],
    equations: 'p_M = |\\langle M|\\psi\\rangle|^2 = \\langle\\psi|P_M|\\psi\\rangle,\\quad \\sum_i |e_i\\rangle\\langle e_i| = I',
    trap: 'Thinking a phase on |M⟩ changes the chance: P is unchanged.',
    formal: {
      points: ['P_M = |M⟩⟨M|, P² = P.', 'Σ_iΛ_i = 1.', 'p = ‖Pψ‖²; update Pψ/√p.'],
      equations: 'p_M = |\\langle M|\\psi\\rangle|^2 = \\langle\\psi|P_M|\\psi\\rangle,\\quad \\sum_i |e_i\\rangle\\langle e_i| = I',
      trap: 'Treating the update rule as optional: the state after a selective measurement is P_j|ψ⟩/√p_j, never the unrescaled P_j|ψ⟩.',
    },
    claims: [
      claim('q3BornPlus', 'ψ onto |+x⟩: chance 0.933', () => close(V.q3BornPlus, 0.933, 1e-3)),
      claim('q3BornMinus', 'ψ onto |−x⟩: chance 0.067', () => close(V.q3BornMinus, 0.067, 1e-3)),
      claim('q3Complete', 'the ±x and ±z projectors each add to I', () => V.q3Complete === 1),
    ],
  },
  'q3-bloch': {
    points: [
      'Two angles fix any spin state.',
      'They name a point on a sphere of radius 1.',
      'The opposite point is the state at right angles.',
      '−|ψ⟩ is the same point, not the opposite one.',
    ],
    equations:
      '|{+n}\\rangle = \\cos\\tfrac\\theta2|{+z}\\rangle + e^{i\\varphi}\\sin\\tfrac\\theta2|{-z}\\rangle,\\quad |{-n}\\rangle = \\sin\\tfrac\\theta2|{+z}\\rangle - e^{i\\varphi}\\cos\\tfrac\\theta2|{-z}\\rangle',
    trap: 'Taking −|+z⟩ for the south pole: it is |+z⟩ again.',
    formal: {
      points: ['eqs. 1.4–1.5 give |+n⟩ and |−n⟩ from θ, φ.', 'n̂ = (sin θ cos φ, sin θ sin φ, cos θ).', '⟨+n|−n⟩ = 0 ↔ antipodal points are orthogonal states.'],
      trap: 'Confusing a global phase (the same ray) with the antipode (an orthogonal ray): only the second changes the point on the sphere.',
    },
    claims: [
      claim('q3NVecXY', 'n̂’s x and y parts are 0.612 each', () => close(V.q3NVecXY, 0.6124, 1e-3)),
      claim('q3NVecZ', 'n̂’s z part is 0.5', () => close(V.q3NVecZ, 0.5)),
      claim('q3NOrth', '⟨+n|−n⟩ = 0', () => close(V.q3NOrth, 0)),
      claim('q3MinusZpole', 'the south pole is |−z⟩, and −|+z⟩ is the same state as |+z⟩', () => V.q3MinusZpole === 1),
    ],
  },
  'q3-spin-operators': {
    points: [
      'A filter is a projector.',
      'Its table depends on the basis, P² = P does not.',
      'S_z = (ħ/2)(P_{+z} − P_{−z}), and so for x, y.',
      'S_n = (ħ/2)σ_n.',
    ],
    equations: 'S_z = \\tfrac\\hbar2(P_{+z} - P_{-z}),\\quad S_i = \\tfrac\\hbar2\\sigma_i,\\quad \\sigma_n = \\hat n\\cdot\\vec\\sigma',
    trap: 'Reading equal tables in different bases as equal operators: P_{+z} in the x basis and P_{+x} in the z basis have the same four entries.',
    formal: {
      points: ['P̃ = UPU† (a basis change).', 'eq. 1.6, the Pauli matrices.', 'eq. 1.7, σ_n = n̂·σ⃗, with eigenvalues ±1.'],
      trap: 'P_{+z} written in the x basis is the SAME entries as P_{+x} in the z basis, yet P_{+z}|+z⟩ = |+z⟩ while P_{+x}|+z⟩ has length 0.707: the tables coincide, the operators do not.',
    },
    claims: [
      claim('q3XZOverlap', '⟨+x|+z⟩ has size 0.707', () => close(V.q3XZOverlap, 0.7071, 1e-3)),
      claim('q3PzInX', 'P_{+z} in the x basis is ½(1 1; 1 1)', () => V.q3PzInX === 1),
      claim('q3SigmaNEig', 'σ_n’s eigenvalues are ±1', () => V.q3SigmaNEig === 1),
    ],
  },
  'q3-observables': {
    points: [
      'A measurement jumps the state to the result’s state.',
      'The average is Σ value × chance = ⟨ψ|M|ψ⟩.',
      'For |+n⟩, ⟨S⟩ = (ħ/2)n̂.',
      'Real averages in every state force M = M†.',
    ],
    equations: '\\langle M\\rangle = \\langle\\psi|M|\\psi\\rangle = \\sum_\\alpha M_\\alpha P_\\alpha,\\quad \\langle\\vec S\\rangle = \\tfrac\\hbar2\\hat n,\\quad (AB)^\\dagger = B^\\dagger A^\\dagger',
    trap: 'Checking Hermiticity on real arrows only: the quarter turn passes there, yet ⟨+y|J|+y⟩ = −i.',
    formal: {
      points: ['ℳ = ΣM_α|α⟩⟨α|.', '(A†)_ij = A*_ji; (A†)† = A, (AB)† = B†A†, (cA)† = c*A†.', 'The Hermiticity theorem needs ℂ (Axler p. 234).'],
      trap: 'A real-vector test cannot certify Hermiticity: ⟨v, Jv⟩ = 0 for every real v, though J is anti-Hermitian.',
    },
    claims: [
      claim('q3AvgSx', '⟨S_x⟩ = ⟨S_y⟩ = 0.306ħ for |+n⟩', () => close(V.q3AvgSx, V.q3AvgSy) && close(V.q3AvgSx, 0.3062, 1e-3)),
      claim('q3AvgSz', '⟨S_z⟩ = 0.25ħ for |+n⟩', () => close(V.q3AvgSz, 0.25)),
      claim('q3AdjProdEq', '(AB)† = B†A†', () => V.q3AdjProdEq === 1),
    ],
  },
  'q3-spectral': {
    points: [
      'Eigenvalues solve det(A − aI) = 0.',
      'A Hermitian operator’s eigenvalues are real.',
      'Its eigenvectors make an orthonormal basis, where its table is diagonal.',
      '(ΔS_i)² = (ħ²/4)(1 − n_i²).',
    ],
    equations: 'A|a\\rangle = a|a\\rangle,\\quad a = a^*,\\quad (\\Delta A)^2 = \\langle A^2\\rangle - \\langle A\\rangle^2',
    trap: 'Diagonalizing with the wrong side of U: with Unit 2.5’s U the diagonal table is UAU†, not Û†ÂÛ with p. 9’s Û (N21).',
    formal: {
      points: ['D2: aⁿ⟨a|a⟩ chains to a*⟨a|a⟩ via A = A†, so a = a*.', 'A = Σa_i|a_i⟩⟨a_i|, f(A) = Σf(a_i)|a_i⟩⟨a_i|.', '⟨Aⁿ⟩ = Σp_ia_iⁿ.'],
      trap: 'N21: Û†ÂÛ is diagonal only when p. 9’s Û has the eigenvectors as its ROWS, not its columns; the notes’ own rule Â’ = ÛÂÛ† diagonalizes the other side.',
    },
    claims: [
      claim('q3MValLow', "M's low eigenvalue is −4, real", () => close(V.q3MValLow, -4)),
      claim('q3MValHigh', "M's high eigenvalue is 2, real", () => close(V.q3MValHigh, 2)),
      claim('q3VarSz', '(ΔS_z)² = 0.1875ħ² for |+n⟩', () => close(V.q3VarSz, 0.1875)),
      claim('q3DiagUdAUIsDiag', 'Û†ÂÛ, with p. 9’s Û, is not diagonal', () => V.q3DiagUdAUIsDiag === 0),
    ],
  },
  'q3-uncertainty': {
    points: [
      '[A, B] measures how much order matters; [S_x, S_y] = iħS_z.',
      'Commuting observables share eigenvectors.',
      'Schwarz plus the commutator half gives the floor.',
      'The floor depends on the state; compatibility does not.',
    ],
    equations: '[S_i, S_j] = i\\hbar\\epsilon_{ijk}S_k,\\quad \\langle(\\Delta A)^2\\rangle\\langle(\\Delta B)^2\\rangle \\ge \\tfrac14|\\langle[A,B]\\rangle|^2',
    trap: 'Reading 0 ≥ 0 at |+x⟩ as “compatible”: [S_x, S_y] is never the zero operator; the floor merely vanishes in that one state.',
    formal: {
      points: ['eq. 1.8: the commutator and anticommutator of two spin components.', 'B is diagonal in A’s non-degenerate eigenbasis exactly when [A, B] = 0.', 'eq. 1.9, with equality at |+z⟩.'],
      trap: 'N&C’s spread-not-disturbance box is about the statistics of separate, identically prepared ensembles, never about one measurement disturbing another.',
    },
    claims: [
      claim('q3CommXY', '[S_x, S_y] = iħS_z', () => V.q3CommXY === 1),
      claim('q3RobProduct', 'ΔS_x·ΔS_y = 0.156ħ² for |+n⟩', () => close(V.q3RobProduct, 0.15625, 1e-3)),
      claim('q3RobBound', 'the floor ½|⟨S_z⟩| = 0.125ħ²', () => close(V.q3RobBound, 0.125, 1e-3)),
      claim('q3RobZSq', '|+z⟩: both sides equal 0.0625ħ⁴', () => close(V.q3RobZSq, 0.0625)),
      claim('q3Quarter', 'the uncertainty bound carries the constant ¼', () => close(V.q3Quarter, 0.25)),
    ],
  },
}
