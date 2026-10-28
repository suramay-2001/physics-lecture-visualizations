/**
 * Optics Lab page O2: optical molasses (Metcalf and van der Straten, Chapter 2, pp. 17–24). Experiment page: two opposed red-detuned beams, a rubidium
 * beam crossing a transverse pair, sodium dropped from the molasses; physics, numbers (keyed claims of O2.values.ts, numpy twin claims_optics/o.py) and the
 * bench presets `molasses-force` and `doppler-limit`. Paraphrased; the book's wording is never copied. Correction C3 (p. 20).
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, n0, near, pct } from './O2.values'

export const O2: Lecture = notesLecture({
  collection: 'optics',
  number: 2,
  title: 'Optical molasses',
  book: 'Metcalf and van der Straten, Cooling and Trapping of Neutral Atoms, chapter 2',
  topics: ['two opposed beams below resonance', 'the friction and the capture velocity', 'heating against friction: the Doppler limit', 'a beam made narrower by transverse molasses', 'strong light and the dressed pair'],
  length: 'full',
  symbols: {
    '\\delta': 'o2-friction:b1',
    'k': 'o2-friction:b1',
    'v': 'o2-friction:b1',
    'F': 'o2-friction:b2',
    '\\beta': 'o2-friction:b2',
    '\\hbar': 'o2-friction:b2',
    '\\gamma': 'o2-friction:b2',
    's': 'o2-friction:b2',
    'v_c': 'o2-friction:b2',
    'D_0': 'o2-limit:b1',
    '\\Gamma': 'o2-limit:b1',
    'k_B': 'o2-limit:b1',
    'T': 'o2-limit:b1',
    'M': 'o2-collimation:b1',
    '\\gamma_R': 'o2-collimation:b2',
    'a_\\max': 'o2-collimation:b2',
    '\\Omega': 'o2-dressed:b1',
    '\\phi': 'o2-dressed:b1',
  },
  sections: [
    {
      id: 'o2-friction',
      label: '§2.1–2.2',
      title: 'A force that is a friction',
      pages: 'pp. 17–19',
      summary: 'Two opposed beams tuned below resonance push an atom against its own motion with a force proportional to its speed.',
      body: [
        {
          text: `The apparatus is a pair of opposed laser beams, one of them retro-reflected, with sodium atoms between them; three perpendicular pairs make [[qc-op-optical-molasses|optical molasses]] in three dimensions. Both beams are tuned below the atomic resonance, so the detuning $\\delta$ is negative. An atom moving toward one beam sees that beam's frequency raised by the Doppler shift $kv$ for wave number $k$ and speed $v$. The beam is then nearer to resonance, the atom scatters more of its light, and it is pushed back (§2.1, pp. 17–18). The sum of the two forces opposes the motion at any speed (<<qc-l12-driven|the driven-atom unit>>).`,
        },
        {
          text: `Near zero speed the sum is linear, $F = -\\beta v$, with friction $\\beta = -8\\hbar k^2(\\delta/\\gamma)s/(1 + s + (2\\delta/\\gamma)^2)^2$ for saturation $s$ per beam and linewidth $\\gamma$ (Eq. 2.2). At $\\delta = -\\gamma/2$ and $s = 1$ it is ${d(V.o2BetaK2, 3)} $\\hbar k^2$. The linear law holds only while the Doppler shift stays below about half a linewidth, which defines the [[qc-op-capture-velocity|capture velocity]] $v_c = \\gamma/2k$. For sodium it is ${d(V.o2VcNa, 2)} m/s. The wavelengths, linewidths and masses of sodium and rubidium are standard values (Steck, alkali D-line data; NIST), stated here as inputs.`,
          claims: [
            claim('o2BetaK2', 'the friction at δ = −γ/2 and s = 1 is 0.444 ħk²', () => near(V.o2BetaK2, 0.444, 0.0005)),
            claim('o2VcNa', 'the capture velocity of sodium is 2.89 m/s', () => near(V.o2VcNa, 2.89, 0.005)),
          ],
        },
        {
          text: `How good is the linear law? The exact two-beam force is largest at ${d(V.o2PeakVel, 3)} $\\gamma/k$, found by a numerical search, and the closed formula in the book gives the same speed. At $v_c$ the force falls ${pct(V.o2LinErrVc)} short of the linear law, and at half of $v_c$ it falls ${d(V.o2LinErrHalf * 100, 1)} % short. The friction is therefore trustworthy only for slow atoms.`,
          claims: [
            claim('o2PeakVel', 'the two-beam force is largest at 0.598 γ/k', () => near(V.o2PeakVel, 0.598, 0.0005)),
            claim('o2LinErrVc', 'the force falls 25 % short of the linear law at v_c', () => near(V.o2LinErrVc, 0.25, 0.005)),
            claim('o2LinErrHalf', 'the force falls 5.9 % short at half of v_c', () => near(V.o2LinErrHalf, 0.059, 0.0005)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'molassesForceVsV', params: { s: 1, delta: -0.5, beam: 'plus' } }, { fn: 'molassesForceVsV', params: { s: 1, delta: -0.5, beam: 'minus' } }, { fn: 'molassesForceVsV', params: { s: 1, delta: -0.5, beam: 'sum' } }] },
            caption: 'The force of each beam and their sum, in units of the largest one-beam force, against the atom speed in units of the linewidth over the wave number.',
          },
        },
        {
          text: 'Try it. The bench below draws the two beam forces, their sum and the linear law. Move ‘Detuning δ/γ’ toward zero and the friction weakens; move it far from resonance and the force peak runs out to high speed. ‘Saturation s per beam’ changes the height. The readouts give the friction, the capture velocity, the peak and the shortfall of the linear law.',
          widget: { kind: 'optics-bench', props: { preset: 'molasses-force' }, caption: 'The force of two opposed beams on a sodium atom.' },
        },
      ],
    },
    {
      id: 'o2-limit',
      label: '§2.2',
      title: 'Heating against friction',
      pages: 'pp. 18–19',
      summary: 'Recoil heating balances the friction at a temperature that is lowest at a detuning of half a linewidth and does not depend on wavelength or mass.',
      body: [
        {
          text: 'Cooling cannot go on forever, because the photons that damp the motion also heat it. Every scattering event kicks the atom by a recoil in a random direction, a random walk in momentum with diffusion coefficient $D_0 = (\\hbar k)^2\\,2\\Gamma$ for the scattering rate $\\Gamma$ of one beam (§2.2, pp. 18–19). The atoms settle where heating balances friction, at $k_B T = D_0/\\beta$ for Boltzmann constant $k_B$ (<<qc-q8-mixed|the ensemble unit>>).',
        },
        {
          text: 'A simple picture of the balance: friction removes energy in proportion to the kinetic energy, heating adds it at a fixed rate, and the two meet where the kinetic energy of each direction equals half of $k_B T$. In weak light both the friction and the heating grow with the intensity, so the intensity cancels from the ratio, which is why the limit does not depend on the laser power. A colder sample therefore needs a mechanism other than this one, and the next page supplies it.',
        },
        {
          text: `The minimum lies at $\\delta = -\\gamma/2$ and equals $\\hbar\\gamma/2k_B$, the [[qc-op-doppler-limit|Doppler limit]]. It does not depend on the wavelength, the mass or, for weak light, the intensity. For sodium it is ${n0(V.o2TDNa)} µK. At $\\delta = -\\gamma$ the temperature is ${d(V.o2TAtGamma, 2)} times higher. Our diffusion over friction, evaluated for very weak light, comes within a factor ${d(V.o2DiffTemp, 3)} of the limit.`,
          claims: [
            claim('o2TDNa', 'the Doppler limit of sodium is 235 µK', () => near(V.o2TDNa, 235, 0.5)),
            claim('o2TAtGamma', 'at δ = −γ the temperature is 1.25 times the limit', () => near(V.o2TAtGamma, 1.25, 0.005)),
            claim('o2DiffTemp', 'diffusion over friction in weak light is within 1.005 of the limit', () => near(V.o2DiffTemp, 1.005, 0.0005)),
          ],
          figure: {
            stage: { kind: 'plot', curve: { fn: 'dopplerTVsDetuning' } },
            caption: 'The steady-state temperature in units of the Doppler limit against the size of the detuning in units of the linewidth.',
          },
        },
        {
          text: 'Try it. The second bench plots the temperature against the detuning for the saturation you choose and for the weak-light limit. Slide ‘Saturation s per beam’ upward and the curve lifts away from the limit; slide ‘Detuning δ/γ’ and watch the marker find the minimum. The readouts give the sodium temperature, the best detuning, the damping time and the rms speed.',
          widget: { kind: 'optics-bench', props: { preset: 'doppler-limit' }, caption: 'The temperature of sodium molasses against detuning.' },
        },
      ],
    },
    {
      id: 'o2-collimation',
      label: '§2.3–2.3.2',
      title: 'A narrower beam',
      pages: 'pp. 19–21',
      summary: 'Molasses along the two transverse axes of an atomic beam shrinks its sideways spread far below the capture range.',
      body: [
        {
          text: `The same idea works sideways on a beam. A rubidium-87 beam crosses a transverse pair of molasses beams and lands on a hot wire grid, which images it (§2.3–2.3.2, pp. 19–21). Atoms with a transverse speed below the capture velocity are damped toward the rms speed $\\sqrt{\\hbar\\gamma/2M}$ for atomic mass $M$. For rubidium the capture velocity is ${d(V.o2RbVc, 2)} m/s and the final width ${d(V.o2RbDvCms, 1)} cm/s, the spread of an ensemble of atoms (<<qc-q8-mixed|the ensemble unit>>).`,
          claims: [
            claim('o2RbVc', 'the capture velocity of rubidium is 2.37 m/s', () => near(V.o2RbVc, 2.37, 0.005)),
            claim('o2RbDvCms', 'the final transverse width of rubidium is 11.8 cm/s', () => near(V.o2RbDvCms, 11.8, 0.05)),
          ],
        },
        {
          text: `Each axis compresses the momentum width by $\\sqrt{\\gamma/\\gamma_R}$, which is ${d(V.o2RbCompress, 1)} for rubidium, because $\\gamma/\\gamma_R$ is ${n0(V.o2RbGOverGR)} for the recoil rate $\\gamma_R = \\frac{\\hbar k^2}{2M}$. The smallest transverse expansion of the beam while it crosses the light is $\\frac{(2v_c)^2}{2a_{\\max}}$ for the largest deceleration $a_{\\max}$, which is ${d(V.o2RbDxUm, 1)} µm: no force can stop the sideways motion sooner. In phase space each pair of directions shrinks the occupied volume by the factor $\\gamma/\\gamma_R$.`,
          claims: [
            claim('o2RbCompress', 'the momentum width of rubidium shrinks by 40.1 per axis', () => near(V.o2RbCompress, 40.1, 0.05)),
            claim('o2RbGOverGR', 'γ over the recoil rate of rubidium is 1,609', () => near(V.o2RbGOverGR, 1609, 0.5)),
            claim('o2RbDxUm', 'the smallest transverse expansion of the rubidium beam is 99.9 µm', () => near(V.o2RbDxUm, 99.9, 0.05)),
            claim('o2RbTimeUs', 'the printed ratio 2v_c/a_max is a time of 42 µs for rubidium', () => near(V.o2RbTimeUs, 42, 0.5)),
          ],
        },
      ],
      corrections: [
        {
          where: 'Chapter 2, p. 20, the minimal transverse expansion',
          says: 'Δx = 2 v_c / a_max',
          shouldSay: `the printed ratio is a time (${n0(V.o2RbTimeUs)} µs for rubidium), not a length. The length is (2v_c)²/(2a_max) = γ/(2kγ_R), which our calculation finds to be ${d(V.o2RbDxUm, 1)} µm, the printed right-hand side.`,
          check: () => near(V.o2RbDxUm, 99.9, 0.05) && near(V.o2RbTimeUs, 42, 0.5),
        },
      ],
    },
    {
      id: 'o2-dressed',
      label: '§2.3.3',
      title: 'Strong light and the dressed pair',
      pages: 'pp. 21–23',
      summary: 'In strong light the atom and the field form a pair of dressed states, and blue detuning can cool because the force is not capped by the weak-light limit.',
      body: [
        {
          text: `In strong light the atom and the field together form a [[qc-op-dressed-state|dressed state]] pair, split by $\\hbar\\Omega$ with $\\Omega = \\sqrt{\\gamma^2 s/2 + \\delta^2}$ (§2.3.3, pp. 21–23). The light shifts each level by $\\hbar(\\Omega - |\\delta|)/2$, and the mixing of the two bare states follows from $\\cos 2\\phi = -\\delta/\\Omega$. At saturation 2 and detuning $+\\gamma$ the splitting is ${d(V.o2DressedOmega, 3)} linewidths (<<qc-l4-eigen|the eigenvector unit>>, <<qc-l11-stationary|the stationary-state unit>>).`,
          claims: [claim('o2DressedOmega', 'at s = 2 and δ = +γ the dressed splitting is 1.414 γ', () => near(V.o2DressedOmega, 1.414, 0.0005))],
          figure: {
            stage: { kind: 'plot', curve: { fn: 'dressedOmega' }, markers: [{ x: 1, label: 'δ = γ' }] },
            caption: 'The splitting of the dressed pair in units of the linewidth against the detuning in units of the linewidth, at fixed saturation.',
          },
        },
        {
          text: 'Above resonance the dressed levels shift so that an atom climbs more potential hills than it descends, and it loses energy in the end: blue-detuned light can cool. This is possible because the force in strong light is not capped by the one-photon limit of the weak-light picture, and the cooling works over a wide range of speeds.',
        },
      ],
    },
    {
      id: 'o2-3d',
      label: '§2.4',
      title: 'Three dimensions: a viscous region, not a trap',
      pages: 'pp. 23–24',
      summary: 'Three perpendicular pairs make a region of friction without a restoring force, so atoms random-walk out of it slowly.',
      body: [
        {
          text: `Three perpendicular pairs of beams make a viscous region, not a trap: the atoms feel friction but no restoring force, so they random-walk out (§2.4, pp. 23–24). With a step of ${d(V.o2WalkStepNa, 2)} µm for sodium, diffusing 1 cm takes ${d(V.o2WalkStepsNa, 1)} million steps, which is ${n0(V.o2WalkTimeNa)} s. The book counts about half a minute; our time is about three times longer (<<qc-q8-mixed|the ensemble unit>>).`,
          claims: [
            claim('o2WalkStepNa', 'the random-walk step of sodium is 2.62 µm', () => near(V.o2WalkStepNa, 2.62, 0.005)),
            claim('o2WalkStepsNa', 'diffusing 1 cm takes 14.5 million steps', () => near(V.o2WalkStepsNa, 14.5, 0.05)),
            claim('o2WalkTimeNa', 'diffusing 1 cm takes 92 s', () => near(V.o2WalkTimeNa, 92, 0.5)),
          ],
        },
        {
          text: 'Measured temperatures in three-dimensional molasses came out far below the Doppler limit, which the two-level model cannot explain; the next page gives the reason. Unbalanced beams still hold the atoms: a net force at rest would move them, so they drift at a steady speed instead of leaving.',
        },
        {
          text: 'In practice the beams are never perfectly balanced, and the intensity differs across the overlap region. An atom then feels a net push along the imbalance until the friction cancels it at a steady drift speed. The cloud therefore drifts the way the brighter beam travels while staying dense, which is why a molasses cloud visibly moves when one beam is blocked.',
        },
      ],
    },
  ],
})
