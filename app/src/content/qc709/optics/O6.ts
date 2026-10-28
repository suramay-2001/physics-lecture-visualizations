/**
 * Optics Lab page O6: what cold atoms are for (Metcalf and van der Straten, Chapter 6 and the Summary, pp. 65–83). Experiment page: a cesium fountain, sodium
 * collisions in a trap, an atom mirror and a standing-wave splitter; physics, numbers (keyed claims of O6.values.ts, numpy twin claims_optics/o.py) and the presets
 * `ramsey-fountain` and `matter-wave-onset`. Corrections C8, C9, C10, C11. Chapters Q24 and Q25 are named in words only (planned). Paraphrased from the book.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, n0, near } from './O6.values'

export const O6: Lecture = notesLecture({
  collection: 'optics',
  number: 6,
  title: 'What cold atoms are for',
  book: 'Metcalf and van der Straten, Cooling and Trapping of Neutral Atoms, chapters 6 and 7',
  topics: ['brighter beams from transverse cooling', 'the fountain clock and Ramsey fringes', 'cold collisions and the partial waves', 'what a collision can release', 'atom optics and matter-wave interferometers', 'non-linear optics and the outlook'],
  length: 'full',
  symbols: {
    'T': 'o6-clocks:b1',
    'h': 'o6-clocks:b2',
    'g': 'o6-clocks:b2',
    'C_n': 'o6-collisions:b1',
    'R': 'o6-collisions:b1',
    'n': 'o6-collisions:b1',
    '\\hbar': 'o6-collisions:b1',
    '\\ell': 'o6-collisions:b1',
    'm': 'o6-collisions:b1',
    'C_6': 'o6-collisions:b1',
    'k_B': 'o6-collisions:b2',
    'T_Q': 'o6-collisions:b2',
    '\\pi': 'o6-collisions:b2',
    'b_c': 'o6-collisions:b2',
    'E': 'o6-collisions:b2',
    'a': 'o6-collisions:b2',
    't': 'o6-collisions:b2',
    'k': 'o6-matterwaves:b1',
  },
  sections: [
    {
      id: 'o6-beams',
      label: '§6.1',
      title: 'Brighter beams',
      pages: 'pp. 65–67',
      summary: 'Light can cool, deflect and focus an atomic beam, which makes it brighter without changing its speed.',
      body: [
        {
          text: 'The first applications use the cooling of the last four pages on a beam. Molasses beams that cross the beam sideways remove the transverse motion, so the beam stays narrow and bright as it travels (§6.1, pp. 65–67). A beam crossing one laser at an angle is deflected, and the same idea bends a beam into a funnel that gathers atoms from a wide source into a narrow stream.',
        },
        {
          text: 'Converging laser beams and light reflected many times between mirrors focus a beam further. A magneto-optic lens does the same with a field gradient that supplies the restoring force, as in the trap of the last page. These results are described in the book in words, and here too: they show what a cold, collimated beam can do before the atoms are trapped (<<qc-l1-quantized|the Stern–Gerlach unit>>).',
        },
        {
          text: 'In every case the gain is in phase space: a beam that is more collimated or slower carries more atoms into the same small interaction region, and that is what a clock, a collision experiment or an interferometer needs. The cooling is therefore not an end in itself but the first step of each experiment that follows.',
        },
      ],
    },
    {
      id: 'o6-clocks',
      label: '§6.2',
      title: 'The fountain clock',
      pages: 'pp. 67–69',
      summary: 'A fountain gives cold atoms a long time between two passes through a microwave cavity, which narrows the Ramsey fringe far below that of a thermal beam.',
      body: [
        {
          text: `The second is 9,192,631,770 cycles of the cesium hyperfine line (§6.2, pp. 67–69). In a thermal-beam clock the atoms cross the microwave cavity in about ${n0(V.o6BeamT)} ms, a beam of 3 m at 500 m/s. [[qc-op-ramsey-fringes|Ramsey's method]] sends the atom through two microwave pulses a time $T$ apart. The transition chance falls to one half at a detuning of $1/(4T)$ from the line, so the full width of the central fringe is $1/(2T)$: ${d(V.o6RamseyBeam, 1)} Hz for the beam (<<qc-l12-driven|the driven-atom unit>>).`,
          claims: [
            claim('o6BeamT', 'a 3 m beam at 500 m/s needs 6 ms', () => near(V.o6BeamT, 6, 0.5)),
            claim('o6RamseyBeam', 'the fringe of a thermal beam is 83.3 Hz wide', () => near(V.o6RamseyBeam, 83.3, 0.05)),
          ],
        },
        {
          text: `A fountain launches cold atoms up through the cavity, and they fall back through it. For atoms that rise 15 cm above the cavity the time between the passes is $T = 2\\sqrt{2h/g}$ for height $h$ and gravity $g$, which is ${d(V.o6FountainT, 3)} s, and the fringe is ${d(V.o6RamseyFountain, 2)} Hz wide. The second-order Doppler shift of such an atom at the cavity is only $${d(V.o6Doppler2Fountain, 2)}\\times10^{-17}$ of the line frequency (<<qc-q5-interferometer|the interferometer unit>>).`,
          claims: [
            claim('o6FountainT', 'a fountain 15 cm above the cavity has T = 0.350 s', () => near(V.o6FountainT, 0.35, 0.0005)),
            claim('o6RamseyFountain', 'the fountain fringe is 1.43 Hz wide', () => near(V.o6RamseyFountain, 1.43, 0.005)),
            claim('o6Doppler2Fountain', 'the second-order Doppler shift of the fountain atom is 1.64 × 10⁻¹⁷', () => near(V.o6Doppler2Fountain, 1.64, 0.005)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'ramseyFringe', params: { T: 0.35 } }], samples: 120 },
            caption: 'The chance of the transition against the detuning from the clock line, for atoms that spend the fountain time between the two microwave pulses.',
          },
        },
        {
          text: 'Try it. The bench below draws the fringe of the fountain and of the thermal beam against the detuning. Slide ‘Height above the cavity’ to change the time between passes and watch the central fringe narrow as the square root of the height. The readouts give the time, both widths, their ratio and the second-order Doppler shift.',
          widget: { kind: 'optics-bench', props: { preset: 'ramsey-fountain' }, caption: 'Ramsey fringes of a fountain clock and of a thermal beam.' },
        },
      ],
      corrections: [
        {
          where: 'Chapter 6, p. 69, the precision of the clock',
          says: 'an uncertainty of 1.5 mHz with δν/ν ≈ 10⁻¹²/√τ',
          shouldSay: `the two numbers do not belong together. Our calculation finds 1.5 mHz over the 9.19 GHz line to be ${d(V.o6PrecRatio, 2)} × 10⁻¹³, while 10⁻¹² of 9.19 GHz is ${d(V.o6PrecTenMinus12mHz, 1)} mHz.`,
          check: () => near(V.o6PrecRatio, 1.63, 0.005) && near(V.o6PrecTenMinus12mHz, 9.2, 0.05),
        },
      ],
    },
    {
      id: 'o6-collisions',
      label: '§6.3–6.3.1',
      title: 'Cold collisions',
      pages: 'pp. 69–71',
      summary: 'Two cold atoms see an attraction that falls as a power of the distance and a centrifugal barrier, and below a threshold temperature only the s wave gets through.',
      body: [
        {
          text: `Cold atoms collide, and the collision is set by the attraction $-C_n/R^n$ for separation $R$ and the centrifugal barrier $\\hbar^2\\ell(\\ell+1)/2mR^2$ for reduced mass $m$ and [[qc-op-partial-wave|partial wave]] $\\ell$ (§6.3–6.3.1, pp. 69–71). For two sodium atoms with $C_6$ of 1556 atomic units, a stated input, the barrier of partial wave 1 lies at ${d(V.o6RcNm, 2)} nm and is ${n0(V.o6VcNaUK)} µK high (<<qc-l13-flow|the probability-flow unit>>).`,
          claims: [
            claim('o6RcNm', 'the barrier of partial wave 1 for sodium lies at 5.26 nm', () => near(V.o6RcNm, 5.26, 0.005)),
            claim('o6VcNaUK', 'the barrier of partial wave 1 is 1,016 µK high', () => near(V.o6VcNaUK, 1016, 0.5)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'langevinPotential', params: { ell: 0 } }, { fn: 'langevinPotential', params: { ell: 1 } }] },
            caption: 'The interaction energy of two sodium atoms, in microkelvin, against their separation in nanometres, without a barrier and with the barrier of partial wave 1.',
          },
        },
        {
          text: `Only $\\ell = 0$ passes at low energy. Setting the barrier equal to three halves of $k_BT$ gives the onset temperature $T_Q$ of the [[qc-op-quantum-threshold|quantum threshold]], below which collisions are quantum: ${d(V.o6TQNa, 3)} mK for sodium and ${d(V.o6TQCs, 1)} µK for cesium. The book prints 1 mK and 34 µK, the same order. Above threshold the cross section is $\\pi b_c^2$ for the largest impact parameter $b_c$, so it falls with energy $E$ as $E^{-2/n}$ and has the log-slope $-${d(V.o6Slope, 3)} at $n = 6$.`,
          claims: [
            claim('o6TQNa', 'the onset temperature for sodium is 0.677 mK', () => near(V.o6TQNa, 0.677, 0.0005)),
            claim('o6TQCs', 'the onset temperature for cesium is 23.2 µK', () => near(V.o6TQCs, 23.2, 0.05)),
            claim('o6Slope', 'the cross section has the log-slope −0.333 at n = 6', () => near(V.o6Slope, 0.333, 0.0005)),
          ],
          figure: {
            stage: { kind: 'plot', curve: { fn: 'partialWaveCount' }, xScale: 'log', yScale: 'log' },
            caption: 'The largest partial wave that gets over the barrier for two sodium atoms against the temperature in microkelvin, on logarithmic axes.',
          },
        },
        {
          text: 'Try it. The bench below draws the thermal wavelength and the largest partial wave against the temperature. Slide ‘Atomic mass’ and ‘Dispersion constant C₆’ to change the pair, and ‘log₁₀ of the temperature in µK’ to move the marker. The readouts give the wavelength, the largest partial wave, the onset temperature and the barrier.',
          widget: { kind: 'optics-bench', props: { preset: 'matter-wave-onset' }, caption: 'The thermal wavelength and the largest partial wave of a cold pair.' },
        },
      ],
      corrections: [
        {
          where: 'Chapter 6, p. 70, the barrier height',
          says: 'V_c = ((n−2)/2)(ħ²ℓ(ℓ+1)/2m)^{n/(n−2)} C_n^{+2/(n−2)}',
          shouldSay: `the printed form is not an energy. Our calculation finds V_c = ((n−2)/2)(ħ²ℓ(ℓ+1)/nm)^{n/(n−2)} C_n^{−2/(n−2)}, which equals the numerical top of the potential (ratio ${d(V.o6BarrierRatio, 6)}) and agrees with the book's own later equation, which carries nm.`,
          check: () => near(V.o6BarrierRatio, 1, 1e-6),
        },
        {
          where: 'Chapter 6, p. 70, the cross section',
          says: 'the cross section is proportional to b_c and so to E^{−2/n}',
          shouldSay: `the cross section is proportional to b_c². Our calculation finds the log-slopes −${d(V.o6Slope, 3)} for the cross section and −${d(V.o6SlopeB, 3)} for b_c itself at n = 6.`,
          check: () => near(V.o6Slope, 2 * V.o6SlopeB, 0.0015),
        },
      ],
    },
    {
      id: 'o6-decay',
      label: '§6.3.2–6.3.3',
      title: 'What a collision can release',
      pages: 'pp. 71–73',
      summary: 'Light-assisted and internal-energy-changing collisions release energy that is large against any trap depth, so both atoms leave.',
      body: [
        {
          text: `Two atoms close together can also lose energy by emitting a photon during the collision, which a catalysis laser can encourage, or by changing their internal state (§6.3.2–6.3.3, pp. 71–73). In sodium the fine-structure splitting of 17 cm⁻¹ is ${d(V.o6NaFineK, 1)} K, far above any trap depth, so the atoms that change it leave at once (<<qc-l11-two-level|the two-level unit>>).`,
          claims: [claim('o6NaFineK', 'the 17 cm⁻¹ fine-structure splitting of sodium is 24.5 K', () => near(V.o6NaFineK, 24.5, 0.05))],
        },
        {
          text: `The loss of cesium atoms that releases ${d(V.o6CsHfsGHz, 2)} GHz, which is ${n0(V.o6CsHfsmK)} mK, shares it between the two atoms: each leaves with ${d(V.o6CsKick, 2)} m/s. Radiative redistribution and ionization remove atoms in other ways, which the book describes in words.`,
          claims: [
            claim('o6CsHfsGHz', 'the cesium hyperfine frequency is 9.19 GHz', () => near(V.o6CsHfsGHz, 9.19, 0.005)),
            claim('o6CsHfsmK', 'the energy 9.19 GHz is 441 mK', () => near(V.o6CsHfsmK, 441, 0.5)),
            claim('o6CsKick', 'each cesium atom leaves with 5.25 m/s', () => near(V.o6CsKick, 5.25, 0.005)),
          ],
        },
      ],
      corrections: [
        {
          where: 'Chapter 6, p. 72, the loss process in cesium',
          says: 'the process that releases 9.2 GHz is fine-structure changing',
          shouldSay: `the energy 9.19 GHz is the ground-state hyperfine splitting of cesium, the book's own definition of the second on p. 67. Our calculation finds ${n0(V.o6CsHfsmK)} mK and a kick of ${d(V.o6CsKick, 2)} m/s per atom, which matches, so the process changes the hyperfine state; the fine-structure release in sodium is ${d(V.o6NaFineK, 1)} K.`,
          check: () => near(V.o6CsHfsmK, 441, 0.5) && near(V.o6CsKick, 5.25, 0.005) && near(V.o6NaFineK, 24.5, 0.05),
        },
      ],
    },
    {
      id: 'o6-matterwaves',
      label: '§6.4–6.4.4',
      title: 'Atom optics and matter-wave interferometers',
      pages: 'pp. 73–78',
      summary: 'Cold atoms bounce off light mirrors, split in standing waves and interfere, and their thermal de Broglie wavelength sets when the wave nature matters.',
      body: [
        {
          text: `In [[qc-op-atom-optics|atom optics]] an atom can bounce off an evanescent-wave mirror: dropped 3 mm it returns after ${d(V.o6BounceMs, 1)} ms (§6.4–6.4.4, pp. 73–78). A standing wave of light acts as a beam splitter that kicks atoms by multiples of $2\\hbar k$ (<<qc-l13-generator|the momentum-generator unit>>); for sodium at 1,000 m/s one kick turns the beam by ${d(V.o6KDAngle, 1)} µrad. A large-period standing wave and the band structure of a lattice follow, and the cooling itself has a quantum description of atoms hopping among motional states.`,
          claims: [
            claim('o6BounceMs', 'an atom dropped 3 mm onto a mirror returns after 49.5 ms', () => near(V.o6BounceMs, 49.5, 0.05)),
            claim('o6KDAngle', 'one 2ħk kick turns a 1,000 m/s sodium beam by 58.9 µrad', () => near(V.o6KDAngle, 58.9, 0.05)),
          ],
        },
        {
          text: `Interferometers use space, like a Mach–Zehnder with atoms in place of light (<<qc-q5-interferometer|the interferometer unit>>), or time, like Ramsey's pulses. The thermal de Broglie wavelength of sodium is ${d(V.o6LamdBTD, 1)} nm at the Doppler limit and ${n0(V.o6LamdB1uK)} nm at 1 µK. The wave nature rules the lattice once that wavelength reaches half the light wavelength (<<qc-l13-plane-wave|the plane-wave unit>>).`,
          claims: [
            claim('o6LamdBTD', 'the thermal wavelength of sodium at the Doppler limit is 23.8 nm', () => near(V.o6LamdBTD, 23.8, 0.05)),
            claim('o6LamdB1uK', 'the thermal wavelength of sodium at 1 µK is 364 nm', () => near(V.o6LamdB1uK, 364, 0.5)),
          ],
          figure: {
            stage: { kind: 'plot', curve: { fn: 'deBroglieVsT' }, xScale: 'log', yScale: 'log', yLines: [{ y: 294.579, label: 'half the light wavelength' }] },
            caption: 'The thermal de Broglie wavelength of sodium in nanometres against the temperature in microkelvin, on logarithmic axes, with half the wavelength of the sodium line marked.',
          },
        },
      ],
    },
    {
      id: 'o6-nonlinear',
      label: '§6.5+7',
      title: 'Non-linear optics and the outlook',
      pages: 'pp. 78–83',
      summary: 'When the Doppler width falls below the natural width, narrow resonances appear in non-linear optics, and the summary looks ahead to cold atoms as tools.',
      body: [
        {
          text: `Cooling changes non-linear optics (§6.5, pp. 78–80). A sodium vapour at 300 K has a Doppler width of ${d(V.o6DopplerGHz, 2)} GHz, far above the natural width of ${d(V.o6NaNaturalMHz, 2)} MHz. At the Doppler limit the width is ${d(V.o6DopplerTDMHz, 2)} MHz, below the natural width, so narrow features that the Doppler broadening hid become visible (<<qc-l12-driven|the driven-atom unit>>).`,
          claims: [
            claim('o6DopplerGHz', 'the Doppler width of sodium at 300 K is 1.32 GHz', () => near(V.o6DopplerGHz, 1.32, 0.005)),
            claim('o6NaNaturalMHz', 'the natural width of sodium is 9.79 MHz', () => near(V.o6NaNaturalMHz, 9.79, 0.005)),
            claim('o6DopplerTDMHz', 'the Doppler width at the Doppler limit is 1.17 MHz', () => near(V.o6DopplerTDMHz, 1.17, 0.005)),
          ],
        },
        {
          text: 'The book lists narrow Raman gain, recoil-induced resonances and phase conjugation among the new effects. Its Summary in Chapter 7 (pp. 82–83) looks ahead: traps as refrigerators for other systems, and chaos and quantum levels in trapped atoms. A later chapter of this course, Chapter Q24, treats photons as carriers of quantum information and takes up where the light of these pages leaves off.',
        },
        {
          text: 'These effects share one lesson of the whole book. Once the motion of the atoms no longer smears the resonance, the interaction of light and atoms can be studied at its natural scale. The atoms become a controllable quantum system rather than a hot gas.',
        },
      ],
    },
  ],
})
