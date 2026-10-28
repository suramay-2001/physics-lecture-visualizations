/**
 * Optics Lab page O5: traps made of light (Metcalf and van der Straten, Chapter 5, pp. 56–63). Experiment page: a focused red beam or a lattice, and a
 * six-beam MOT on a cesium cell; physics, numbers (keyed claims of O5.values.ts, numpy twin claims_optics/o.py) and the presets `dipole-well` and `mot-force`.
 * Correction C7 (p. 61). Our dipole depth is a one-beam model, stated; no Correction on the book's printed value (note N4). Paraphrased from the book.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, n0, near } from './O5.values'

export const O5: Lecture = notesLecture({
  collection: 'optics',
  number: 5,
  title: 'Traps made of light',
  book: 'Metcalf and van der Straten, Cooling and Trapping of Neutral Atoms, chapter 5',
  topics: ['a far-detuned beam as a dipole trap', 'optical lattices and their levels', 'the magneto-optical trap', 'how a vapour fills the trap', 'variants of the trap'],
  length: 'full',
  symbols: {
    's': 'o5-dipole:b2',
    '\\delta': 'o5-dipole:b2',
    '\\hbar': 'o5-dipole:b2',
    '\\Omega': 'o5-dipole:b2',
    '\\gamma': 'o5-dipole:b2',
    'k': 'o5-lattice:b1',
    '\\omega': 'o5-lattice:b2',
    'U_b': 'o5-lattice:b2',
    'E_R': 'o5-lattice:b2',
    '\\mu': 'o5-mot:b1',
    'A': 'o5-mot:b1',
    'v': 'o5-mot:b1',
    '\\kappa': 'o5-mot:b2',
    '\\beta': 'o5-mot:b2',
    'v_c': 'o5-capture:b2',
  },
  sections: [
    {
      id: 'o5-dipole',
      label: '§5.1–5.1.1',
      title: 'A far-detuned beam as a trap',
      pages: 'pp. 56–58',
      summary: 'Light far below resonance draws atoms to the intensity maximum while scattering little, but the fluctuations of the force heat the atoms.',
      body: [
        {
          text: 'The first apparatus is two focused counter-propagating beams, tuned far below resonance, that hold sodium at their common focus. The same light can be a standing wave. An oscillating field induces a dipole in the atom, and the energy of that dipole in the field is a potential: red-detuned atoms are drawn to the intensity maximum. This is the [[qc-op-dipole-force|dipole force]], and the light along the beam still scatters and pushes (§5.1–5.1.1, pp. 56–58).',
        },
        {
          text: `For one beam of saturation $s$ and detuning $\\delta$ the depth is $\\hbar(\\Omega - |\\delta|)/2$ with $\\Omega = \\sqrt{\\gamma^2 s/2 + \\delta^2}$ and linewidth $\\gamma$. With the book's numbers, $s = 2\\times10^{8}$ and $\\delta = -10^{6}\\gamma$ for sodium, our one-beam model gives ${d(V.o5DipoleDepthmK, 2)} mK and ${n0(V.o5DipoleRate)} scattered photons per second. A standing wave raises the intensity at an antinode, which is why the book quotes a larger depth (<<qc-l4-eigen|the eigenvector unit>>).`,
          claims: [
            claim('o5DipoleDepthmK', 'one beam gives a depth of 11.75 mK for the book’s numbers', () => near(V.o5DipoleDepthmK, 11.75, 0.005)),
            claim('o5DipoleRate', 'the scattering rate for those numbers is 1,538 per second', () => near(V.o5DipoleRate, 1538, 0.5)),
          ],
        },
        {
          text: `The fluctuations of the dipole force heat the atoms and do not saturate with intensity, so the energy settles near the depth and atoms leak out. Recoil heating alone would warm an atom to the full depth in ${d(V.o5HeatTimeS, 2)} s (<<qc-l12-driven|the driven-atom unit>>).`,
          claims: [claim('o5HeatTimeS', 'recoil heating alone takes 3.18 s to reach the depth', () => near(V.o5HeatTimeS, 3.18, 0.005))],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'dipoleDepth', params: { s: 2e8 } }, { fn: 'dipoleScatter', params: { s: 2e8 } }], xScale: 'log', yScale: 'log' },
            caption: 'The depth and the scattering rate, each divided by its value at a detuning of a hundred linewidths, against the detuning in linewidths, on logarithmic axes.',
          },
        },
        {
          text: 'Try it. The bench below draws the depth and the scattering rate against the detuning, as base-ten logarithms on linear axes. Slide ‘log₁₀ of the detuning |δ|/γ’ to move the marker and ‘log₁₀ of the saturation s’ to change the power. Far out the depth falls as one over the detuning and the rate as its square, so going farther is cheaper in heating than in depth.',
          widget: { kind: 'optics-bench', props: { preset: 'dipole-well' }, caption: 'Depth and scattering rate of a far-detuned beam on sodium.' },
        },
      ],
    },
    {
      id: 'o5-lattice',
      label: '§5.1.2–5.1.3',
      title: 'Standing waves and optical lattices',
      pages: 'pp. 58–60',
      summary: 'A standing wave makes cells half a wavelength wide, in which atoms vibrate at levels that show up as Raman sidebands.',
      body: [
        {
          text: `In a standing wave, an [[qc-op-optical-lattice|optical lattice]], the potential cells are half a wavelength wide, which confines the atom and removes the Doppler broadening of its line. An atom with momentum $2\\hbar k$ for wave number $k$ has a de Broglie wavelength that is ${d(V.o5DeBroglieHalf, 1)} of the light wavelength, the width of one cell (§5.1.2–5.1.3, pp. 58–60; <<qc-l13-plane-wave|the plane-wave unit>>).`,
          claims: [claim('o5DeBroglieHalf', 'an atom with momentum 2ħk has a wavelength of 0.5 of the light wavelength', () => near(V.o5DeBroglieHalf, 0.5, 1e-12))],
        },
        {
          text: `Atoms vibrate in the wells with a quantum $\\hbar\\omega = 2\\sqrt{U_bE_R}$ for the modulation depth $U_b$ and the recoil energy $E_R$. For rubidium at $\\delta = -4\\gamma$ and saturation one half per beam, it is ${d(V.o5LatticeVibkHz, 1)} kHz, or ${d(V.o5LatticeVibER, 1)} recoil energies. The levels appear as Raman sidebands of the atomic line. An array of such atoms is an optical crystal, and cooling in it is optical pumping among the vibrational states (<<qc-l13-stationary|the stationary-wave unit>>).`,
          claims: [
            claim('o5LatticeVibkHz', 'the vibrational quantum of the rubidium lattice is 61.3 kHz', () => near(V.o5LatticeVibkHz, 61.3, 0.05)),
            claim('o5LatticeVibER', 'the vibrational quantum is 16.2 recoil energies', () => near(V.o5LatticeVibER, 16.2, 0.05)),
          ],
        },
        {
          text: 'The lattice is also a tool for measurement. The depth, the vibration spacing and the Raman sidebands each give an independent check of the laser intensity at the atoms. A clean spectrum is the signature of atoms confined well below one wavelength.',
        },
      ],
    },
    {
      id: 'o5-mot',
      label: '§5.2–5.2.1',
      title: 'The magneto-optical trap',
      pages: 'pp. 60–61',
      summary: 'A field gradient and circularly polarized beams give the restoring force that radiation pressure lacks, and the Doppler shift adds damping.',
      body: [
        {
          text: 'Radiation pressure alone cannot trap atoms: the optical version of Earnshaw’s theorem forbids it. A pair of circularly polarized beams in a field gradient adds the missing restoring force. The Zeeman shift $\\mu\' A z/\\hbar$ for effective moment $\\mu\'$, gradient $A$ and position $z$ brings an atom into resonance with the beam that pushes it back. This is the [[qc-op-mot|magneto-optical trap]] (§5.2–5.2.1, pp. 60–61). With the Doppler shift $kv$ the resonance condition is $\\delta = kv + \\mu\' A z/\\hbar$, which also damps the motion.',
        },
        {
          text: `The apparatus is six circular beams and an anti-Helmholtz pair of coils around a cesium vapour cell. For rubidium with a gradient of 10 G/cm, saturation 1 and $\\delta = -\\gamma$, the ratio of spring to damping $\\kappa/\\beta = \\mu\' A/\\hbar k$ is ${n0(V.o5MotKappaOverBeta)} per metre and the atoms oscillate at ${n0(V.o5MotFreqHz)} Hz. The cloud half-size $\\hbar|\\delta|/\\mu\' A$ is ${d(V.o5MotSizeMm, 2)} mm. The motion is overdamped (<<qc-l1-quantized|the Stern–Gerlach unit>>, <<qc-l11-two-level|the two-level unit>>).`,
          claims: [
            claim('o5MotKappaOverBeta', 'the spring over the damping of the rubidium trap is 1,092 per metre', () => near(V.o5MotKappaOverBeta, 1092, 0.5)),
            claim('o5MotFreqHz', 'the oscillation frequency of the trap is 540 Hz', () => near(V.o5MotFreqHz, 540, 0.5)),
            claim('o5MotSizeMm', 'the cloud half-size is 4.33 mm', () => near(V.o5MotSizeMm, 4.33, 0.005)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'motForceVsZ', params: { v: 0 } }, { fn: 'motForceVsZ', params: { v: 0.5 } }] },
            caption: 'The force of the trap in units of the largest one-beam force against the position, for an atom at rest and for one moving at a steady speed.',
          },
        },
        {
          text: 'Try it. The bench below draws the force for an atom at rest and for one moving at the speed you choose. Slide ‘Field gradient A’ and ‘Detuning δ/γ’ to see the restoring slope and the zero crossing move; ‘Atom speed v’ shifts the curve and shows the damping. The readouts give the spring over the damping, the frequency, the damping rate, the size and the damping ratio.',
          widget: { kind: 'optics-bench', props: { preset: 'mot-force' }, caption: 'The force of a magneto-optical trap on rubidium.' },
        },
      ],
    },
    {
      id: 'o5-capture',
      label: '§5.2.2',
      title: 'How a vapour fills the trap',
      pages: 'pp. 61–62',
      summary: 'The trap catches atoms from a room-temperature vapour because the stopping force acts over centimetres, and the caught share scales with the cube of the capture speed.',
      body: [
        {
          text: `Why can a cell of vapour load a trap? The force $\\hbar k\\gamma/2$ acts over a beam diameter of a few centimetres, so the energy it can remove is large (§5.2.2, pp. 61–62). For cesium and a 3 cm beam the capture speed is ${d(V.o5CsCaptureMs, 1)} m/s and the energy ${d(V.o5CsCaptureEK, 1)} K. At $10^{-5}$ torr and 300 K the vapour density is $${d(V.o5CsDensity, 2)}\\times10^{11}$ per cubic centimetre, high enough for a quick fill.`,
          claims: [
            claim('o5CsCaptureMs', 'the capture speed of cesium for a 3 cm beam is 59.0 m/s', () => near(V.o5CsCaptureMs, 59, 0.05)),
            claim('o5CsCaptureEK', 'the capture energy is 27.8 K', () => near(V.o5CsCaptureEK, 27.8, 0.05)),
            claim('o5CsDensity', 'the vapour density at 10⁻⁵ torr and 300 K is 3.22 × 10¹¹ per cubic centimetre', () => near(V.o5CsDensity, 3.22, 0.005)),
          ],
        },
        {
          text: `The share of the vapour below a speed $v_c$ grows as the cube of $v_c$, not linearly. Doubling $v_c$ multiplies it by ${d(V.o5FracRatio, 2)}. The share of cesium atoms below one kelvin of kinetic energy is $${d(V.o5Frac1K, 2)}\\times10^{-4}$. A cell of cesium fills within a second, as the book reports (<<qc-q8-mixed|the ensemble unit>>).`,
          claims: [
            claim('o5FracRatio', 'doubling the capture speed multiplies the share by 7.99', () => near(V.o5FracRatio, 7.99, 0.005)),
            claim('o5Frac1K', 'the share below one kelvin is 1.44 × 10⁻⁴', () => near(V.o5Frac1K, 1.44, 0.005)),
          ],
          figure: {
            stage: { kind: 'plot', curve: { fn: 'vaporFraction' }, xScale: 'log', yScale: 'log' },
            caption: 'The share of a room-temperature cesium vapour below a given speed against that speed, on logarithmic axes, where the slope is three.',
          },
        },
      ],
      corrections: [
        {
          where: 'Chapter 5, p. 61, the captured share',
          says: 'the share of the vapour below v_c scales linearly with v_c',
          shouldSay: `the share scales as v_c³: our calculation, with the error function and by direct integration, finds that doubling v_c multiplies it by ${d(V.o5FracRatio, 2)} at 300 K.`,
          check: () => near(V.o5FracRatio, 7.99, 0.005),
        },
      ],
    },
    {
      id: 'o5-variants',
      label: '§5.2.3',
      title: 'Variants of the trap',
      pages: 'pp. 62–63',
      summary: 'The density of a trap is limited by reabsorbed light, and several variants of the beams and fields raise it.',
      body: [
        {
          text: 'The density of a MOT is limited by the pressure of light that neighbouring atoms scatter and reabsorb. A dark-spot trap leaves the centre of the cloud unlit, so the atoms there rest in a level that does not absorb, and the cloud can be much denser (§5.2.3, pp. 62–63). A spin-polarized racetrack trap does the same with a different arrangement of fields.',
        },
        {
          text: 'Other variants use four beams in a tetrahedral arrangement instead of six, or add a stimulated force that does not saturate as the scattering force does. A cloud held in a single sublevel is a nearly pure state of the atomic spin rather than a spread over many sublevels (<<qc-q8-pure-rho|the pure-state unit>>).',
        },
        {
          text: 'Compare the kinds of trap. The dipole trap holds atoms with little scattering but is shallow for a single beam. The magneto-optical trap is shallow in energy but catches atoms from a room-temperature vapour, and it is the usual first stage for loading everything else. In practice an experiment loads a MOT, cools the cloud further, and moves it into a dipole or magnetic trap where the light can be turned off.',
        },
      ],
    },
  ],
})
