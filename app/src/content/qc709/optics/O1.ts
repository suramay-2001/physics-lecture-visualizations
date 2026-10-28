/**
 * Optics Lab page O1: slowing a sodium beam with one laser (Metcalf and van der Straten, Introduction and Chapter 1, pp. 6–15). An experiment
 * page: the oven beam, the counter-propagating laser, the tapered solenoid and the probe; then the physics, the numbers and two bench presets
 * (`slower-force`, `zeeman-slower`). Every number is a keyed claim of O1.values.ts with a numpy twin (pipeline/claims_optics/o.py). Paraphrased
 * from the book, never quoted; the first table of Chapter 1 is not reprinted (our rows agree with it to about 5 per cent). Corrections C1, C2.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, n0, near } from './O1.values'

export const O1: Lecture = notesLecture({
  collection: 'optics',
  number: 1,
  title: 'Slowing a sodium beam',
  book: 'Metcalf and van der Straten, Cooling and Trapping of Neutral Atoms, Introduction and chapter 1',
  topics: ['an oven beam, a counter-propagating laser and a tapered solenoid', 'the photon kick and the largest deceleration', 'keeping a slowing atom in resonance', 'reading the speeds with a probe laser', 'slowing is not yet cooling'],
  length: 'full',
  symbols: {
    'T': 'o1-why:b2',
    '\\Delta': 'o1-why:b2',
    '\\nu': 'o1-why:b2',
    'k': 'o1-why:b3',
    '\\hbar': 'o1-why:b3',
    '\\pi': 'o1-force:b1',
    '\\lambda': 'o1-force:b1',
    'M': 'o1-force:b1',
    's': 'o1-force:b2',
    'I': 'o1-force:b2',
    'I_s': 'o1-force:b2',
    '\\delta': 'o1-force:b2',
    '\\omega_L': 'o1-force:b2',
    '\\omega_A': 'o1-force:b2',
    '\\gamma': 'o1-force:b2',
    '\\tau': 'o1-force:b2',
    'a_\\max': 'o1-force:b3',
    'v': 'o1-force:b3',
    'a': 'o1-compensation:b2',
    'B': 'o1-compensation:b2',
    '\\mu': 'o1-compensation:b2',
    'v_R': 'o1-compensation:b2',
    'v_0': 'o1-compensation:b2',
    '\\eta': 'o1-compensation:b3',
    'z_0': 'o1-compensation:b3',
    'B_0': 'o1-compensation:b3',
    '\\beta': 'o1-cooling:b1',
    '\\gamma_R': 'o1-cooling:b1',
  },
  sections: [
    {
      id: 'o1-why',
      label: '§Intro',
      title: 'Why slow atoms',
      pages: 'pp. 6–7',
      summary: 'Brighter atomic beams and sharper clocks need atoms that move slowly, and light can slow them although one photon hardly touches an atom.',
      body: [
        {
          text: 'The experiment starts with an oven at 712 K that sends sodium atoms down a long vacuum tube. A laser tuned a little below the sodium resonance runs against the beam. A solenoid wound in layers of decreasing length surrounds the tube, and a weak chopped probe laser 40 cm further on reads the speeds from the light the atoms scatter. The probe measures the speed distribution of the beam, before and after the slowing laser acts.',
        },
        {
          text: `Why slow atoms at all? A beam is only as bright as its collimation allows, and a line measured on a beam cannot be narrower than the inverse of the flight time $T$ through the apparatus (Introduction, pp. 6–7). That gives $\\Delta\\nu \\ge 1/T$, which is ${n0(V.o1TransitHz)} Hz for a beam that crosses 3 m at 500 m/s. A moving clock also runs slow: at 500 m/s this second-order Doppler shift is $${d(V.o1Doppler2Beam, 2)}\\times10^{-12}$ of the line frequency.`,
          claims: [
            claim('o1TransitHz', 'a beam crossing 3 m at 500 m/s limits a line to 167 Hz', () => near(V.o1TransitHz, 167, 0.5)),
            claim('o1Doppler2Beam', 'the second-order Doppler shift at 500 m/s is 1.39 parts in 10^12', () => near(V.o1Doppler2Beam, 1.39, 0.005)),
          ],
        },
        {
          text: 'Light looks like a poor tool for the job, because one photon barely disturbs an atom. A photon of wave number $k$ carries the momentum $\\hbar k$, a tiny change in the momentum of an atom, and Einstein expected such recoil to stay negligible (<<qc-l13-plane-wave|the plane-wave unit>>). For one photon he was right. But an atom can absorb and re-emit a very large number of photons, and the sum of the kicks is a force that can stop it.',
        },
      ],
    },
    {
      id: 'o1-force',
      label: '§1.1–1.2',
      title: 'The push of a photon',
      pages: 'pp. 8–10',
      summary: 'Each absorbed photon pushes the atom by one recoil, and the atom can scatter half the time at most, which sets the largest deceleration.',
      body: [
        {
          text: `Let the laser have wave number $k = 2\\pi/\\lambda$ for wavelength $\\lambda$. The atom absorbs a photon, which kicks it by $\\hbar k$ along the beam, and a moment later it re-emits the photon in a random direction. The random kicks average to zero, so the net [[qc-op-scattering-force|scattering force]] is one $\\hbar k$ for each absorbed photon (§1.1, pp. 8–9). For sodium of mass $M$ that is a [[qc-op-recoil|recoil]] velocity $\\hbar k/M$ of ${d(V.o1RecoilNa, 2)} cm/s per photon.`,
          claims: [claim('o1RecoilNa', 'one photon changes the speed of a sodium atom by 2.95 cm/s', () => near(V.o1RecoilNa, 2.95, 0.005))],
        },
        {
          text: `How many photons per second? Let $s = I/I_s$ be the beam intensity in units of the [[qc-op-saturation|saturation]] intensity $I_s$, and let $\\delta = \\omega_L - \\omega_A$ be the [[qc-op-detuning|detuning]] of the laser frequency from the atomic one. The natural linewidth is $\\gamma = 1/\\tau$, the inverse of the excited-state lifetime, and the scattering rate is $\\frac{\\gamma}{2}\\,\\frac{s}{1 + s + (2\\delta/\\gamma)^2}$ (Eq. 1.1). For sodium $I_s$ is ${d(V.o1IsatNa, 2)} mW/cm². At most the atom is excited half of the time, so the rate never exceeds $\\gamma/2$, however strong the light (<<qc-l12-driven|the driven-atom unit>>, <<qc-l11-two-level|the two-level unit>>).`,
          claims: [claim('o1IsatNa', 'the saturation intensity of sodium is 6.26 mW/cm²', () => near(V.o1IsatNa, 6.26, 0.005))],
        },
        {
          text: `Multiplying the maximum rate by the kick and dividing by the mass gives the largest deceleration, $a_{\\max} = \\hbar k\\gamma/2M$. For sodium it is ${n0(V.o1AmaxNa)} km/s². A sodium atom at the thermal peak speed of ${n0(V.o1VPeakNa)} m/s therefore stops within $\\frac{v^2}{2a_{\\max}}$ = ${d(V.o1StopLenNa, 3)} m and ${d(V.o1StopTimeNa, 3)} ms (§1.2, p. 10), a short flight for an oven beam.`,
          claims: [
            claim('o1AmaxNa', 'the largest deceleration of sodium is 907 km/s²', () => near(V.o1AmaxNa, 907, 0.5)),
            claim('o1VPeakNa', 'the thermal peak speed of sodium at 712 K is 879 m/s', () => near(V.o1VPeakNa, 879, 0.5)),
            claim('o1StopLenNa', 'the stopping length at the thermal peak is 0.426 m', () => near(V.o1StopLenNa, 0.426, 0.0005)),
            claim('o1StopTimeNa', 'the stopping time at the thermal peak is 0.970 ms', () => near(V.o1StopTimeNa, 0.97, 0.0005)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'scatterVsDetuning', params: { s: 0.1 } }, { fn: 'scatterVsDetuning', params: { s: 1 } }, { fn: 'scatterVsDetuning', params: { s: 10 } }] },
            caption: 'The scattering rate of one beam, in units of its largest value, against twice the detuning in units of the linewidth, for a weak, a moderate and a strong beam.',
          },
        },
        {
          text: 'Try it. In the bench below the push is drawn against the speed of an atom that moves against the beam. Move the slider ‘Detuning δ/γ’ and watch the peak slide to the speed that is resonant; raise ‘Saturation s’ to see the peak widen and saturate at the largest deceleration. The readouts give the peak deceleration and the width.',
          widget: { kind: 'optics-bench', props: { preset: 'slower-force' }, caption: 'Slowing force on a moving sodium atom for two saturations.' },
        },
      ],
      corrections: [
        {
          where: 'Chapter 1, p. 10, the first table, hydrogen row',
          says: 'wavelength 12.2 nm and γ/k = 128 m/s',
          shouldSay: `the Lyman-alpha line lies at ${d(V.o1HLambdaNm, 1)} nm (the printed recoil of 325 cm/s would need ${d(V.o1HLambdaFromRecoil, 1)} nm), and the speed γ/k is ${d(V.o1HGammaOverK, 1)} m/s.`,
          check: () => near(V.o1HLambdaNm, 121.6, 0.05) && near(V.o1HLambdaFromRecoil, 121.8, 0.05) && near(V.o1HGammaOverK, 12.1, 0.05),
        },
      ],
    },
    {
      id: 'o1-compensation',
      label: '§1.2.1',
      title: 'Keeping the atom in tune',
      pages: 'pp. 10–13',
      summary: 'As an atom slows its Doppler shift fades and it leaves the resonance, so the laser, the atom or the spectrum must be adjusted along the way.',
      body: [
        {
          text: `Slowing sets a trap for itself. As the atom decelerates its Doppler shift $kv$ shrinks, and after losing a few $\\gamma/k$ of speed the atom is out of [[qc-op-doppler-compensation|resonance]]. At the thermal peak of sodium the shift $kv/\\gamma$ is about ${n0(V.o1DopplerOverGamma)}, so a hundred linewidths or more must be compensated (§1.2.1, pp. 10–13). The book names three cures, each of which keeps the atom resonant for the whole slowing.`,
          claims: [claim('o1DopplerOverGamma', 'the Doppler shift at the thermal peak is about 152 linewidths', () => near(V.o1DopplerOverGamma, 152, 0.5))],
        },
        {
          text: 'The first cure sweeps the laser frequency at the rate $ka$ for deceleration $a$, so that the laser follows the atom down: a chirp. The second tunes the atom instead. A field $B(z)$ along the beam shifts the atomic level by $\\mu\' B$ for the effective moment $\\mu\'$, and the choice $\\hbar k v_R(z) = \\mu\' B(z)$ keeps every atom resonant, the [[qc-op-zeeman-slower|Zeeman slower]] (<<qc-l1-quantized|the Stern–Gerlach unit>> shows why a moment feels the field). The third uses broadband light, which always holds the shifted frequency, at about $kv_0/\\gamma$ times the power. Stark slowing of Rydberg atoms gets one sentence in the book.',
        },
        {
          text: `For a uniform deceleration $a = \\eta a_{\\max}$ the resonant speed falls as $v_R(z) = v_0\\sqrt{1 - z/z_0}$, and the field must have the same shape, $B(z) = B_0\\sqrt{1 - z/z_0}$. Here $v_0$ is the entry speed, $B_0 = \\hbar k v_0/\\mu\'$, and the length is $z_0 = M v_0^2/\\eta\\hbar k\\gamma$. For sodium entering at ${n0(V.o1VPeakNa)} m/s with $\\eta$ of one half, $B_0$ is ${n0(V.o1SlowerB0G)} G and $z_0$ is ${d(V.o1SlowerLenM, 3)} m. Halfway along, the field is ${d(V.o1HalfwayB, 3)} of its entry value.`,
          claims: [
            claim('o1SlowerB0G', 'the entry field of the sodium slower is 1,066 G', () => near(V.o1SlowerB0G, 1066, 0.5)),
            claim('o1SlowerLenM', 'the slower is 0.852 m long', () => near(V.o1SlowerLenM, 0.852, 0.0005)),
            claim('o1HalfwayB', 'halfway along the field is 0.707 of its entry value', () => near(V.o1HalfwayB, 0.707, 0.0005)),
          ],
          figure: {
            stage: { kind: 'plot', curve: { fn: 'slowerField' }, markers: [{ x: 0.5, label: 'halfway' }] },
            caption: 'The field of the slower in units of its entry value, against the position in units of its length: it falls as a square root.',
          },
        },
        {
          text: 'Try it. The bench below draws the field and the resonant speed along the slower on two vertical axes. Slide ‘Entry speed v₀’ and ‘Design fraction η of the maximum deceleration’ to see how a faster beam or a gentler design lengthens the magnet and raises the field. The readouts give the length, the entry field, the stopping time and the chirp rate.',
          widget: { kind: 'optics-bench', props: { preset: 'zeeman-slower' }, caption: 'Field and resonant speed along a Zeeman slower for sodium.' },
        },
      ],
      corrections: [
        {
          where: 'Chapter 1, p. 11, the field profile',
          says: 'B(z) = B₀√(1 − z₀/z) and v_R = v₀√(1 − z₀/z), with z₀ ≡ m v₀/(η ħ k γ)',
          shouldSay: `B(z) = B₀√(1 − z/z₀) with z₀ = Mv₀²/(ηħkγ), a length: the printed ratio gives an imaginary field for z < z₀, and the printed z₀ is a time. For sodium with η of one half our z₀ is ${d(V.o1SlowerLenM, 3)} m and B₀ is ${n0(V.o1SlowerB0G)} G; the length in the first table (η = 1) is ${d(V.o1StopLenNa, 3)} m.`,
          check: () => near(V.o1SlowerLenM, 0.852, 0.0005) && near(V.o1SlowerLenM, 2 * V.o1StopLenNa, 0.0015) && Number.isNaN(Math.sqrt(1 - 2)),
        },
      ],
    },
    {
      id: 'o1-probe',
      label: '§1.2.2',
      title: 'Reading the speeds',
      pages: 'p. 13',
      summary: 'A weak chopped probe laser downstream turns the Doppler shift into a scale, so the fluorescence against frequency is the speed distribution.',
      body: [
        {
          text: 'How is the slowing seen? Part of the beam is chopped, and a weak probe laser crosses the beam 40 cm downstream (§1.2.2, p. 13). Atoms of the matching speed absorb the probe light and fluoresce. Scanning the probe frequency sweeps the Doppler shift across the speed distribution, so the fluorescence against frequency is the distribution itself. The speed resolution is set by the linewidth: one linewidth $\\gamma$ of probe detuning is a speed step $\\gamma/k$.',
        },
        {
          text: 'In the measured distribution the slowing laser pushes fast atoms down and piles them up near one final speed, so the broad thermal hump becomes a narrow peak at low speed. Those atoms were not merely slowed; they were squeezed into a narrow range of speeds. A speed distribution is an ensemble of atoms with different speeds, not one atom with a fuzzy speed (<<qc-q8-mixed|the ensemble unit>>).',
        },
      ],
    },
    {
      id: 'o1-cooling',
      label: '§1.3',
      title: 'Slowing is not yet cooling',
      pages: 'pp. 13–15',
      summary: 'The temperature of a beam is the width of its speed distribution, and recoil sets limits on how narrow and how straight a slowed beam can be.',
      body: [
        {
          text: `The temperature of a beam is the width of its speed distribution, not its mean speed, and slowing narrows the distribution only because atoms above the final speed keep slowing longest (§1.3, pp. 13–15). The width can be damped further. With a design fraction $\\eta$ of one half and saturation 2, the damping time $M/\\beta$ equals $2/\\gamma_R$, which is ${d(V.o1DampUs, 1)} µs for sodium. Here $\\beta$ is the damping coefficient and $\\gamma_R = \\hbar k^2/2M$ is the recoil rate.`.replace('\\hbar k^2/2M', '\\frac{\\hbar k^2}{2M}'),
          claims: [claim('o1DampUs', 'the damping time of the slowed beam is 12.7 µs for sodium', () => near(V.o1DampUs, 12.7, 0.05))],
        },
        {
          text: `Two limits remain. The beam angle grows as the atoms slow, because the sideways speed stays while the forward speed shrinks, so the angle scales as $1/v$. And every scattered photon kicks the atom sideways at random: over the whole slowing this random walk widens the beam by ${d(V.o1TransDiffMm, 2)} mm for sodium. A slowed beam is cooler along its length but wider across it (<<qc-q8-mixed|the ensemble unit>>).`,
          claims: [claim('o1TransDiffMm', 'recoil widens the sodium beam by 6.58 mm over the slowing', () => near(V.o1TransDiffMm, 6.58, 0.005))],
        },
      ],
    },
  ],
})
