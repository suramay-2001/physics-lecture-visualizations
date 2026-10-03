/**
 * Chapter Q2 review cards: the exam layer in both tracks (P-Q2-story §6). Ground-up ≤ 25 words per sentence, Formal
 * ≤ 40; ≤ 5 points each. Every number comes from Q2.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q2.values'

export const Q2_REVIEW: Record<string, ReviewCard> = {
  'q2-basis': {
    points: [
      'Arrows are independent when only the all-zero mix gives 0.',
      'The dimension is the most independent arrows: 2 for a qubit.',
      'In a basis every vector has unique components.',
      'In an orthonormal basis a component is an overlap.',
    ],
    equations: '\\sum_i c_i|\\alpha_i\\rangle = 0 \\Rightarrow c_i = 0,\\qquad |\\psi\\rangle = \\sum_i c_i|e_i\\rangle,\\qquad c_i = \\langle e_i|\\psi\\rangle',
    trap: `reading components as overlaps in a slanted basis: |−z⟩ in {|+z⟩, |+x⟩} is (${d(V.q2NonOrthRe0, 0)}, ${d(V.q2NonOrthRe1, 3)}), not (${d(V.q2NonOrthOvZ, 0)}, ${d(V.q2NonOrthOvX)}).`,
    formal: {
      points: ['LI, dim, basis (Axler).', '$\\langle e_i|e_j\\rangle = \\delta_{ij} \\Rightarrow c_i = \\langle e_i|\\psi\\rangle$.', 'A non-ON basis needs a linear solve.'],
      trap: `Non-orthonormal bases need a linear solve, not overlaps: (${d(V.q2NonOrthRe0, 0)}, ${d(V.q2NonOrthRe1, 3)}) vs (${d(V.q2NonOrthOvZ, 0)}, ${d(V.q2NonOrthOvX)}).`,
    },
    claims: [
      claim('q2NonOrthRe0', 'components of |−z⟩ in {|+z⟩, |+x⟩}: (−1, 1.4142)', () => close(V.q2NonOrthRe0, -1)),
      claim('q2NonOrthRe1', 'the second component is 1.4142', () => close(V.q2NonOrthRe1, Math.SQRT2)),
      claim('q2NonOrthOvX', 'the overlap with |+x⟩ is only 0.7071', () => close(V.q2NonOrthOvX, Math.SQRT1_2)),
    ],
  },
  'q2-gram-schmidt': {
    points: [
      'Keep the first arrow.',
      'From each new arrow remove its shadows on the earlier ones.',
      'Rescale each leftover to length 1.',
      'A zero leftover means the input was dependent.',
    ],
    equations:
      "|\\alpha'_j\\rangle = |\\beta_j\\rangle - \\sum_{i<j}|\\alpha'_i\\rangle\\frac{\\langle\\alpha'_i|\\beta_j\\rangle}{\\langle\\alpha'_i|\\alpha'_i\\rangle},\\qquad |\\alpha_j\\rangle = \\frac{|\\alpha'_j\\rangle}{\\sqrt{\\langle\\alpha'_j|\\alpha'_j\\rangle}}",
    trap: 'forgetting to rescale: (0, 0.866) is at right angles to |+z⟩ but has length 0.866.',
    formal: {
      points: ["The notes' formula with unnormalized α'.", 'Spans are preserved step by step.', 'Complex arrows need the conjugated bra.'],
      trap: 'A residual before rescaling is orthogonal to the earlier vectors but not yet unit length.',
    },
    claims: [
      claim('q2GsResRe1', 'the unrescaled leftover of the 60° arrow on |+z⟩: (0, 0.866)', () => close(V.q2GsResRe1, Math.sqrt(3) / 2)),
      claim('q2GsE2Re1', 'rescaled it becomes (0, 1) = |−z⟩', () => close(V.q2GsE2Re1, 1)),
    ],
  },
  'q2-spin-space': {
    points: [
      "A spin state's z components are its amplitudes.",
      'The 50/50 split along z gives |±x⟩ equal sizes.',
      'δ₊ = 0 is a choice; δ₋ = 180° is forced.',
      'The x frame is the z frame turned by 45°.',
    ],
    equations: '|{\\pm x}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle \\pm |{-z}\\rangle),\\qquad |{\\pm z}\\rangle = \\tfrac{1}{\\sqrt2}(|{+x}\\rangle \\pm |{-x}\\rangle)',
    trap: 'thinking any phase will do for |−x⟩: δ₋ = 90° gives |+y⟩, which passes an x magnet half the time.',
    formal: {
      points: ['The notes’ boxed pair and their inverse.', 'State angles are half the sphere’s.', 'The slice is real only.'],
      trap: `$\\delta_- = \\pi/2$ gives $|{+y}\\rangle$: $|\\langle{+x}|\\psi_{\\pi/2}\\rangle|^2 = ${d(V.q2Delta90Prob, 1)}$, not 0.`,
    },
    claims: [
      claim('q2AngZX', '|+z⟩ and |+x⟩ sit 45° apart in this plane', () => close(V.q2AngZX, 45)),
      claim('q2Delta90Prob', 'δ₋ = 90° would give |+y⟩: P(+x) = 0.5, not 0', () => close(V.q2Delta90Prob, 0.5)),
    ],
  },
  'q2-operators': {
    points: [
      'A linear operator turns vectors into vectors and respects mixing.',
      'A turn plus a stretch keeps right angles; most operators do not.',
      '|α⟩⟨β| copies |α⟩, scaled by ⟨β|ψ⟩.',
      'In a basis an operator is a table, A_ij = ⟨e_i|A|e_j⟩.',
    ],
    equations: 'f_i = \\sum_j A_{ij}c_j,\\qquad A_{ij} = \\langle e_i|A|e_j\\rangle,\\qquad A = \\sum_{i,j}A_{ij}|e_i\\rangle\\langle e_j|',
    trap: 'a shift "add |+z⟩" is not linear: it moves the zero vector.',
    formal: {
      points: ['V → V, into (not onto).', '$f = \\hat Ac$.', '$A = \\sum_{ij}A_{ij}|e_i\\rangle\\langle e_j|$.'],
      trap: 'the projector |+z⟩⟨+z| is linear yet not onto: its rank is 1, not 2.',
    },
    claims: [
      claim('q2ProjRank', 'the projector |+z⟩⟨+z| has rank 1: not onto', () => V.q2ProjRank === 1),
      claim('q2FigANorm', 'A stretches every arrow to 1.4142 and turns it 45°', () => close(V.q2FigANorm, Math.SQRT2)),
    ],
  },
  'q2-change': {
    points: [
      "New components are overlaps with the new basis: c' = Uc.",
      'From z to x, U is the Hadamard table H.',
      'U keeps lengths: UU† = I.',
      "Operator tables change as A' = UAU†.",
    ],
    equations: "c'_i = \\sum_j U_{ij}c_j,\\qquad U_{ij} = \\langle\\alpha'_i|\\alpha_j\\rangle,\\qquad UU^\\dagger = I,\\qquad A' = UAU^\\dagger",
    trap: `trusting the notes' printed sign: it turns ψ at 30° into the state at 60° (P(+z) = ${d(V.q2WrongPzPlus, 2)}, not ${d(V.q2WrongPzMinus, 2)}).`,
    formal: {
      points: ['$U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle$ = Spin Lab’s $B^\\dagger$.', 'Completeness proves unitarity.', "The notes' printed sign and $[U^\\dagger]_{ij}$'s indices (see the errata box)."],
      trap: `$[U^\\dagger]_{12} = \\langle+z|-y\\rangle = ${d(V.q2UyRight01Re)}$, not $\\langle-z|+y\\rangle = ${d(V.q2UyNotes01Im)}i$.`,
    },
    claims: [
      claim('q2UisH', 'U_{z→x} is the Hadamard matrix H', () => V.q2UisH === 1),
      claim('q2WrongPzPlus', "the notes' printed sign describes P(+z) = 0.25 instead of 0.75", () => close(V.q2WrongPzPlus, 0.25)),
      claim('q2WrongPzMinus', "the notes' printed sign describes P(−z) = 0.75 instead of 0.25", () => close(V.q2WrongPzMinus, 0.75)),
      claim('q2UyRight01Re', '[U†]12 = ⟨+z|−y⟩ = 0.7071', () => close(V.q2UyRight01Re, Math.SQRT1_2)),
      claim('q2UyNotes01Im', "the notes' printed bracket ⟨−z|+y⟩ = 0.7071i", () => close(V.q2UyNotes01Im, Math.SQRT1_2)),
    ],
  },
  'q2-photon': {
    points: ['A photon has two polarization states, |x⟩ and |y⟩.', "For light the state turns with the filter: Malus's cos²χ.", '|R⟩ and |L⟩ only pick up a phase when the frame turns.', 'So J_z = ±ħ: a photon’s spin.'],
    equations: "|x'\\rangle = \\cos\\chi|x\\rangle + \\sin\\chi|y\\rangle,\\qquad |R'\\rangle = e^{-i\\chi}|R\\rangle,\\qquad J_z|R\\rangle = \\hbar|R\\rangle",
    trap: "a new phase makes a new state: |R'⟩ = −i|R⟩ at 90° is the same state.",
    formal: {
      points: ['The frame U is a rotation (det +1).', "|R'⟩ = e^{−iχ}|R⟩, |L'⟩ = e^{iχ}|L⟩.", 'χ in the lab is 2χ on the qubit sphere.'],
      trap: `light's $\\cos^2 45° = ${d(V.q2Malus45, 1)}$, but a magnet tilted by the same 45° passes $\\cos^2 22.5° = ${d(V.q2Spin45, 4)}$.`,
    },
    claims: [
      claim('q2Rot90P1', "a 90° frame turn multiplies |R⟩ by a phase: it is still |R⟩", () => close(V.q2Rot90P1, 1)),
      claim('q2JzR', 'J_z|R⟩ = ħ|R⟩ (ħ = 1 in the engine)', () => V.q2JzR === 1),
      claim('q2Malus45', "light's Malus law at 45°: cos² 45° = 0.5", () => close(V.q2Malus45, 0.5)),
      claim('q2Spin45', 'spin at the same 45° tilt: 0.8536', () => close(V.q2Spin45, 0.8535533905932737)),
    ],
  },
}
