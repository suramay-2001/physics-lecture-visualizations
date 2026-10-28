/**
 * Optics Lab page O1, the platform seed: a driven two-level atom and the width of its resonance line (Townsend §4.4, pp. 126 to 128,
 * the same Rabi resonance Spin Lab Lecture 12 works). Two short sections, one number with a numpy twin (`o1PeakAtTwoOmega`,
 * pipeline/claims_optics/o1.py), a bridge from each section into a built Chapter Q3 unit and one paragraph widget (the `optics-bench`
 * demo preset `lorentzian`), so the platform has a real subject. The optics content builder replaces this file's prose.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, close, tf } from './O1.values'

export const O1: Lecture = notesLecture({
  collection: 'optics',
  number: 1,
  title: 'The atom as a resonance',
  book: 'Townsend, A Modern Approach to Quantum Mechanics, §4.4',
  topics: ['a two-level atom under a weak oscillating drive', 'the flip chance and the detuning', 'the Lorentzian line and its width', 'what the drive strength sets'],
  length: 'short',
  symbols: {
    '\\hbar': 'o1-driven-atom:b1',
    '\\omega_0': 'o1-driven-atom:b1',
    '\\omega': 'o1-driven-atom:b1',
    '\\omega_1': 'o1-driven-atom:b1',
    '\\delta': 'o1-line-width:b1',
    '\\Omega': 'o1-line-width:b1',
  },
  sections: [
    {
      id: 'o1-driven-atom',
      label: '§1',
      title: 'A driven two-level atom',
      pages: 'pp. 126–127',
      summary: 'A weak oscillating field can flip a two-level atom, and the flip is largest when the drive matches the level splitting.',
      body: [
        {
          text: 'Take an atom with two levels whose energies differ by $\\hbar\\omega_0$, and shine on it a weak field that oscillates at angular frequency $\\omega$ with strength $\\omega_1$. The field can lift the atom from the lower level to the upper one (Townsend §4.4, pp. 126–127). Where the flip stands between certain and absent depends on how far $\\omega$ lies from $\\omega_0$, and on nothing else about the drive but $\\omega_1$ (<<qc-q3-bloch|Unit 3.2>>).',
        },
        {
          text: 'On the [[qc-bloch-sphere|Bloch sphere]] the atom is a point that the drive tips about an axis. Exactly at resonance the axis is perpendicular to the polar axis and the point runs all the way from pole to pole. Off resonance the axis tilts, and the point can only reach part of the way down.',
        },
      ],
    },
    {
      id: 'o1-line-width',
      label: '§2',
      title: 'The width of the line',
      pages: 'pp. 127–128',
      summary: 'The largest flip chance is a Lorentzian in the detuning, whose width is set by the drive strength and nothing else.',
      body: [
        {
          text: `Call $\\delta = \\omega_0 - \\omega$ the detuning and $\\Omega$ half of $\\omega_1$. Over all times the largest chance of a flip is $\\Omega^2/(\\delta^2 + \\Omega^2)$, a Lorentzian in $\\delta$ (Townsend §4.4, pp. 127–128). It equals one on resonance and falls to one half when $\\delta = \\Omega$. At $\\delta = 2\\Omega$, which is $\\delta = \\omega_1$, the peak is down to $${tf(V.o1PeakAtTwoOmega)}$ (<<qc-q3-spin-operators|Unit 3.3>>). Move the sliders to see the curve narrow and widen.`,
          claims: [claim('o1PeakAtTwoOmega', 'at a detuning equal to the drive strength the flip chance peaks at one fifth', () => close(V.o1PeakAtTwoOmega, 0.2, 1e-12))],
          widget: { kind: 'optics-bench', props: { preset: 'lorentzian' } },
        },
      ],
    },
  ],
})
