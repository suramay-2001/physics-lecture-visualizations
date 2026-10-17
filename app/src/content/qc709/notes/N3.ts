/**
 * Physics 709 Lecture 3 notes (N3), a short companion: sections I.E (measurement and projectors), I.F (spin operators and the Bloch sphere,
 * Eqs. 1.4 to 1.8) and I.G (observables as Hermitian operators), printed pages 13 to 18 of the new edition. The prose paraphrases the notes
 * and links the Chapter Q3 unit that teaches each section; both numbers are Chapter Q3's own (q3Pzx, q3NVecXY).
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close, d } from '../Q3.values'

export const N3: Lecture = notesLecture({
  number: 3,
  title: 'Measurement and the Bloch sphere',
  date: '2026-09-14',
  topics: [
    'chances from projectors',
    'a spin-½ state as a point on a sphere',
    'the Pauli matrices and the Bloch vector',
    'observables as Hermitian operators',
  ],
  length: 'short',
  symbols: {
    '|\\cdot\\rangle': 'n3-born:b1',
    '|\\psi\\rangle': 'n3-born:b1',
    '|M\\rangle': 'n3-born:b1',
    '\\langle\\cdot|\\cdot\\rangle': 'n3-born:b1',
    '\\langle\\cdot|': 'n3-born:b1',
    'P_M': 'n3-born:b1',
    '|+z\\rangle': 'n3-born:b1',
    '|+x\\rangle': 'n3-born:b1',
    '\\theta': 'n3-bloch:b1',
    '\\varphi': 'n3-bloch:b1',
    '|+n\\rangle': 'n3-bloch:b1',
    '|-z\\rangle': 'n3-bloch:b1',
    'e': 'n3-bloch:b1',
    'i': 'n3-bloch:b1',
    '|-n\\rangle': 'n3-bloch:b1',
    'S_i': 'n3-spin-operators:b1',
    '\\hbar': 'n3-spin-operators:b1',
    '\\sigma_i': 'n3-spin-operators:b1',
    'n': 'n3-spin-operators:b1',
    '\\sigma_n': 'n3-spin-operators:b1',
    '\\sigma': 'n3-spin-operators:b1',
    '\\langle\\cdot\\rangle': 'n3-spin-operators:b1',
    'M': 'n3-observables:b1',
    'M_\\alpha': 'n3-observables:b1',
    'P_\\alpha': 'n3-observables:b1',
    '\\dagger': 'n3-observables:b1',
  },
  sections: [
    {
      id: 'n3-born',
      label: '§I.E',
      title: 'Measurement and projectors',
      pages: 'p. 13',
      summary: 'The chance of a result is the squared size of an overlap, which is the mean value of a projector, and the projectors onto a basis add up to the identity.',
      body: [
        {
          text: `The chance of finding a system prepared in $|\\psi\\rangle$ in the state $|M\\rangle$ is $|\\langle M|\\psi\\rangle|^2$, the mean value of the projector $P_M = |M\\rangle\\langle M|$. A system prepared in $|{+z}\\rangle$ is found in $|{+x}\\rangle$ with chance ${d(V.q3Pzx, 1)}, and the projectors onto a basis sum to the identity (<<qc-q3-born|Unit 3.1>>).`,
          claims: [claim('q3Pzx', 'a z-up state is found in the x-up state with chance one half', () => close(V.q3Pzx, 0.5, 1e-9))],
        },
      ],
    },
    {
      id: 'n3-bloch',
      label: '§I.F.1',
      title: 'States on the Bloch sphere',
      pages: 'p. 14',
      summary: 'Dropping an unobservable overall factor and fixing the norm leaves two angles, so every spin-½ state is a point of a sphere.',
      body: [
        {
          text: 'A spin-½ state has four real parameters, but an unobservable overall factor and the norm remove two. What remains are the angles $\\theta$ and $\\varphi$ in $|{+n}\\rangle = \\cos(\\theta/2)|{+z}\\rangle + e^{i\\varphi}\\sin(\\theta/2)|{-z}\\rangle$ (Eq. 1.4), and the state $|{-n}\\rangle$ sits at the opposite point (Eq. 1.5; <<qc-q3-bloch|Unit 3.2>>).',
        },
      ],
    },
    {
      id: 'n3-spin-operators',
      label: '§I.F.2–F.4',
      title: 'Spin operators and the Bloch vector',
      pages: 'pp. 14–16',
      summary: 'The spin operators are the Pauli matrices times a half, and the mean values of the three Pauli matrices are the components of the Bloch vector.',
      body: [
        {
          text: `The spin operators are $S_i = \\tfrac{\\hbar}{2}\\sigma_i$ with the Pauli matrices $\\sigma_i$ (Eq. 1.6), and the operator along the unit vector $n$ is $\\sigma_n = n\\cdot\\sigma$ (Eq. 1.7). Since $\\langle\\sigma\\rangle = n$ (Eq. 1.8), the vector $n$ is the Bloch vector; at $\\theta = 60^\\circ$ and $\\varphi = 45^\\circ$ its x and y components are each ${d(V.q3NVecXY, 4)} (<<qc-q3-spin-operators|Unit 3.3>>).`,
          claims: [claim('q3NVecXY', 'at 60 and 45 degrees the Bloch vector has x and y components 0.6124', () => close(V.q3NVecXY, (Math.sqrt(3) / 2) * Math.SQRT1_2, 1e-9))],
        },
      ],
    },
    {
      id: 'n3-observables',
      label: '§I.G',
      title: 'Observables and Hermitian operators',
      pages: 'pp. 16–18',
      summary: 'A measurement has real outcomes, so the operator that represents it must equal its own adjoint.',
      body: [
        {
          text: 'An observable $M$ with outcomes $M_\\alpha$ and chances $P_\\alpha$ has the mean value $\\langle M\\rangle = \\sum_\\alpha M_\\alpha P_\\alpha$. Every outcome is real, so the operator must equal its adjoint, $M^\\dagger = M$, which is what Hermitian means. A selective measurement keeps one outcome and rejects the rest, as a Stern–Gerlach device with a slit for a single beam does (<<qc-q3-observables|Unit 3.4>>).',
        },
      ],
    },
  ],
})
