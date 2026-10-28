/**
 * Optics Lab page O4: a magnetic bowl for atoms (Metcalf and van der Straten, Chapter 4, pp. 46–54). Experiment page: an anti-Helmholtz pair, sodium from a
 * slower, an on-axis probe and an rf field; physics, numbers (keyed claims of O4.values.ts, numpy twin claims_optics/o.py) and the presets `quadrupole-orbit`
 * and `airy-levels`. No Correction (the mismatch of the orbit speed and period on p. 48 is a note, shown nowhere). Paraphrased from the book.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, n0, near } from './O4.values'

export const O4: Lecture = notesLecture({
  collection: 'optics',
  number: 4,
  title: 'A magnetic bowl for atoms',
  book: 'Metcalf and van der Straten, Cooling and Trapping of Neutral Atoms, chapter 4',
  topics: ['two opposed coils and a field minimum', 'the quadrupole potential', 'circular orbits and the adiabatic condition', 'levels of a V-shaped well', 'what the first traps showed'],
  length: 'full',
  symbols: {
    'U': 'o4-why:b2',
    '\\mu': 'o4-why:b2',
    'B': 'o4-why:b2',
    'A': 'o4-quadrupole:b1',
    '\\rho': 'o4-quadrupole:b1',
    'v': 'o4-orbits:b1',
    'a': 'o4-orbits:b1',
    '\\pi': 'o4-orbits:b1',
    'M': 'o4-orbits:b1',
    '\\omega_Z': 'o4-orbits:b2',
    '\\omega_T': 'o4-orbits:b2',
    '\\hbar': 'o4-orbits:b2',
    'n': 'o4-orbits:b2',
    'E_1': 'o4-quantum:b1',
    'h': 'o4-quantum:b1',
    'F': 'o4-quantum:b2',
  },
  sections: [
    {
      id: 'o4-why',
      label: '§4.1',
      title: 'Why a field minimum',
      pages: 'pp. 46–47',
      summary: 'A magnetic moment can be held only at a minimum of the field, and the energy is stored inside the atom, so magnetic traps are shallow.',
      body: [
        {
          text: 'The apparatus is two coils with opposite currents, which make a magnetic field that is zero at the centre and grows in every direction. Sodium atoms from a Zeeman slower are loaded into the region. An on-axis probe records absorption against the field, and a radio-frequency field flips sublevels. The trap holds the atoms in a bowl of magnetic energy (Chapter 4, pp. 46–54).',
        },
        {
          text: `Why a field minimum? A static field cannot have a maximum in empty space, so a moment whose energy rises with the field, $U = \\mu B$ for moment $\\mu$ and field $B$, is pushed toward the weakest field (<<qc-l1-quantized|the Stern–Gerlach unit>>). This is the [[qc-op-magnetic-trap|magnetic trap]]. The energy is stored inside the atom, so the levels shift with the field and the trap is shallow. One gauss moves a moment of one Bohr magneton by ${d(V.o4GaussUK, 1)} µK, so a wall of 200 G is only ${d(V.o4DepthmK, 1)} mK deep. Such a trap needs cold atoms and a good vacuum.`,
          claims: [
            claim('o4GaussUK', 'one gauss moves a moment of one Bohr magneton by 67.2 µK', () => near(V.o4GaussUK, 67.2, 0.05)),
            claim('o4DepthmK', 'a wall of 200 G is 13.4 mK deep', () => near(V.o4DepthmK, 13.4, 0.05)),
          ],
        },
      ],
    },
    {
      id: 'o4-quadrupole',
      label: '§4.2',
      title: 'The quadrupole potential',
      pages: 'pp. 47–48',
      summary: 'Near its centre the coil pair gives a field that grows linearly, twice as fast along the axis as across it, so the potential is neither central nor harmonic.',
      body: [
        {
          text: 'Near its centre the field of the coil pair is a quadrupole, $|B| = A\\sqrt{\\rho^2 + 4z^2}$ for the gradient $A$ across the axis, the radius $\\rho$ and the distance $z$ along it (§4.2, pp. 47–48). The potential energy rises linearly from the centre, and twice as steeply along the axis as across it. It is neither a central nor a harmonic potential, so the angular momentum of an atom about the axis is not conserved (<<qc-l4-average|the average unit>>).',
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'quadrupoleU', params: { axis: 'radial' } }, { fn: 'quadrupoleU', params: { axis: 'axial' } }] },
            caption: 'The potential energy of a sodium atom, in millikelvin, against the distance from the centre of the trap, across the axis and along it.',
          },
        },
        {
          text: 'The moment must follow the direction of the field as the atom moves, or it would flip into an untrapped orientation and be lost. Whether it can follow depends on how the Larmor rate of the moment compares with the rate at which the field direction turns along the orbit, which the next section turns into numbers.',
        },
        {
          text: 'The quadrupole field has one more property worth noting. Its magnitude vanishes at the exact centre, where the direction of the field is undefined. An atom that passes through that point cannot keep its moment aligned, and it can flip into an orientation that the field expels. The loss is small while the atoms stay far from the centre, which is the adiabatic condition of the next section. It is also the reason for the Ioffe design met at the end of the chapter, which keeps the field minimum above zero.',
        },
      ],
    },
    {
      id: 'o4-orbits',
      label: '§4.3–4.3.2',
      title: 'Orbits and the adiabatic condition',
      pages: 'pp. 48–49',
      summary: 'A circular orbit has a speed and a period set by the gradient, and the moment follows the field when the orbit is much larger and faster than a small quantum limit.',
      body: [
        {
          text: `An atom in a circular orbit of radius $\\rho$ has speed $v = \\sqrt{\\rho a}$ and period $2\\pi\\sqrt{\\rho/a}$, where $a = \\mu A/M$ is the constant acceleration toward the axis for atomic mass $M$ (§4.3, pp. 48–49). For sodium in a gradient of 1 T/m, $a$ is ${n0(V.o4TrapAccel)} m/s². At a radius of 1 cm the speed is ${d(V.o4OrbitV, 2)} m/s and the period ${d(V.o4OrbitT, 1)} ms.`,
          claims: [
            claim('o4TrapAccel', 'the acceleration of sodium at 1 T/m is 243 m/s²', () => near(V.o4TrapAccel, 243, 0.5)),
            claim('o4OrbitV', 'at 1 cm the orbital speed is 1.56 m/s', () => near(V.o4OrbitV, 1.56, 0.005)),
            claim('o4OrbitT', 'at 1 cm the orbital period is 40.3 ms', () => near(V.o4OrbitT, 40.3, 0.05)),
          ],
        },
        {
          text: `The moment follows the field only if its Larmor rate $\\omega_Z$ is far above the orbital rate $\\omega_T$. That needs $\\rho$ much larger than the cube root of $\\hbar^2/M^2a$, which is ${d(V.o4RhoMin, 3)} µm, and $v$ much larger than the cube root of $\\hbar a/M$, ${d(V.o4VMin, 3)} cm/s. This is [[qc-op-adiabatic-motion|adiabatic motion]]. At 1 cm the orbit number $n = M v\\rho/\\hbar$, which equals $\\omega_Z/\\omega_T$, is ${d(V.o4OrbitN, 2)} million, so only a tiny volume at the centre breaks the condition (<<qc-l11-two-level|the two-level unit>>).`,
          claims: [
            claim('o4RhoMin', 'the smallest adiabatic radius is 0.316 µm', () => near(V.o4RhoMin, 0.316, 0.0005)),
            claim('o4VMin', 'the smallest adiabatic speed is 0.876 cm/s', () => near(V.o4VMin, 0.876, 0.0005)),
            claim('o4OrbitN', 'at 1 cm the orbit number is 5.64 million', () => near(V.o4OrbitN, 5.64, 0.005)),
          ],
        },
        {
          text: 'Try it. In the bench below the potential is drawn across and along the axis for sodium, with a marker at the orbit radius. Slide ‘Field gradient A’ to steepen the bowl and ‘Orbit radius ρ’ to move the orbit outward. The readouts give the acceleration, the speed, the period, the two adiabatic limits and the orbit number.',
          widget: { kind: 'optics-bench', props: { preset: 'quadrupole-orbit' }, caption: 'The quadrupole potential and an orbit in it, for sodium.' },
        },
      ],
    },
    {
      id: 'o4-quantum',
      label: '§4.4–4.4.3',
      title: 'Quantum levels of the trap',
      pages: 'pp. 50–53',
      summary: 'A heuristic rule and an exact solution of the V-shaped well give the energy levels, and the rule is right only for large level numbers.',
      body: [
        {
          text: `A heuristic quantization sets the orbital angular momentum to $n\\hbar$ for whole $n$. The energy of the $n$th orbit is then three halves of $E_1$ times $n$ to the two-thirds power, where $E_1$ is the cube root of $Ma^2\\hbar^2$ (§4.4, pp. 50–53). For sodium at 1 T/m, $E_1/h$ is ${d(V.o4E1kHz, 2)} kHz. The estimate treats the orbits as circles, so it is best for large $n$ (<<qc-l13-stationary|the stationary-wave unit>>).`,
          claims: [claim('o4E1kHz', 'E₁ over h for sodium at 1 T/m is 4.42 kHz', () => near(V.o4E1kHz, 4.42, 0.005))],
        },
        {
          text: `In one dimension the V-shaped well, potential $F|x|$ for a force $F$, can be solved exactly. The levels are the zeros of the derivative of the Airy function and of the Airy function itself, taken in turn. For sodium at 1 T/m the first three lie ${d(V.o4AiryE1kHz, 2)}, ${d(V.o4AiryE2kHz, 2)} and ${d(V.o4AiryE3kHz, 2)} kHz above the bottom. The ratio of the second to the first is ${d(V.o4AiryRatio21, 3)}, not the ${d(V.o4HeurRatio21, 3)} of the orbit rule (<<qc-l13-flow|the probability-flow unit>>).`,
          claims: [
            claim('o4AiryE1kHz', 'the first level of the V-shaped well is 3.57 kHz', () => near(V.o4AiryE1kHz, 3.57, 0.005)),
            claim('o4AiryE2kHz', 'the second level is 8.20 kHz', () => near(V.o4AiryE2kHz, 8.2, 0.005)),
            claim('o4AiryE3kHz', 'the third level is 11.39 kHz', () => near(V.o4AiryE3kHz, 11.39, 0.005)),
            claim('o4AiryRatio21', 'the exact ratio of the second level to the first is 2.295', () => near(V.o4AiryRatio21, 2.295, 0.0005)),
            claim('o4HeurRatio21', 'the orbit rule gives the ratio 1.587', () => near(V.o4HeurRatio21, 1.587, 0.0005)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'airyLevels' }, { fn: 'heuristicLevels' }], xRange: { from: 1, to: 6 }, samples: 5 },
            caption: 'The first six levels of the V-shaped well for sodium, in kilohertz, from the exact solution and from the orbit rule, against the level number.',
          },
        },
        {
          text: 'The bound states mix with the continuum above the well, so none of them is strictly bound, and the levels could be seen only after cooling below the recoil limit, so that the atoms do not wash them out. Try it. The bench below draws the exact and the orbit-rule levels against the level number. Slide ‘Field gradient A’ to scale them all; the readouts give the first level, the first spacing and how far the exact ratio is from the rule.',
          widget: { kind: 'optics-bench', props: { preset: 'airy-levels' }, caption: 'Exact levels and orbit-rule levels of a V-shaped well for sodium.' },
        },
      ],
    },
    {
      id: 'o4-experiments',
      label: '§4.4.4',
      title: 'What the first traps showed',
      pages: 'pp. 53–54',
      summary: 'The first trap was limited by the residual gas, a superconducting trap held atoms for minutes, and absorption and radio-frequency spectra map where the atoms sit.',
      body: [
        {
          text: 'The first magnetic trap lost its atoms to collisions with the residual gas. A superconducting Ioffe trap, with a field minimum that does not touch zero, later held atoms for minutes (§4.4.4, pp. 53–54). The Ioffe design avoids the loss at the centre, where the field direction is undefined and the moment cannot follow it.',
        },
        {
          text: 'The atoms are read in two ways. The absorption spectrum of an on-axis probe maps the field the atoms sit in, and so their positions. A radio-frequency field flips the sublevels where its frequency matches the Zeeman splitting, which again selects a position. That flip is a driven two-level atom (<<qc-l12-driven|the driven-atom unit>>). Laser and radio-frequency cooling of the trapped cloud followed, and it opened the way to colder samples.',
        },
        {
          text: 'Put together, the magnetic trap is a storage ring for cold atoms more than a cooling device. It keeps atoms that were cooled elsewhere, in a place with no light to heat them. That is its great advantage over the optical traps of the next page.',
        },
      ],
    },
  ],
})
