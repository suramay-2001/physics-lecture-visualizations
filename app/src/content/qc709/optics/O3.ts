/**
 * Optics Lab page O3: below the Doppler limit (Metcalf and van der Straten, Chapter 3, pp. 27–42). Experiment page: lin⊥lin and σ⁺σ⁻ beam pairs on
 * rubidium and cesium, a weak or strong magnetic field; physics, numbers (keyed claims of O3.values.ts, numpy twin claims_optics/o.py; models per
 * rulings O2 and O3) and the presets `sisyphus-hills` and `vsr-force`. Corrections C4, C5, C6. Paraphrased from the book.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, n0, near, tf } from './O3.values'

export const O3: Lecture = notesLecture({
  collection: 'optics',
  number: 3,
  title: 'Below the Doppler limit',
  book: 'Metcalf and van der Straten, Cooling and Trapping of Neutral Atoms, chapter 3',
  topics: ['polarization-gradient cooling and its hills', 'a weak magnetic field and the MILC model', 'σ⁺σ⁻ light without hills', 'velocity-selective resonance in a strong field', 'the sub-Doppler limit in three dimensions'],
  length: 'full',
  symbols: {
    'U': 'o3-gradient:b2',
    '\\hbar': 'o3-gradient:b2',
    '\\delta': 'o3-gradient:b2',
    's': 'o3-gradient:b2',
    'C': 'o3-gradient:b2',
    '\\gamma': 'o3-gradient:b2',
    'U_1': 'o3-gradient:b4',
    'k': 'o3-gradient:b4',
    '\\omega_Z': 'o3-milc:b1',
    'v': 'o3-milc:b1',
    '\\gamma_p': 'o3-milc:b1',
    'v_D': 'o3-milc:b2',
    'M': 'o3-milc:b2',
    'g_F': 'o3-vsr:b1',
    '\\mu_B': 'o3-vsr:b1',
    'B': 'o3-vsr:b1',
    '\\pi': 'o3-vsr:b1',
    'v_r': 'o3-vsr:b2',
    'F': 'o3-vsr:b2',
    '\\beta': 'o3-vsr:b2',
    'v_c': 'o3-vsr:b2',
    'k_B': 'o3-3d:b1',
    'T': 'o3-3d:b1',
    'c': 'o3-3d:b1',
    'T_D': 'o3-3d:b2',
    'T_R': 'o3-3d:b2',
  },
  sections: [
    {
      id: 'o3-gradient',
      label: '§3.1–3.2.2',
      title: 'Hills in a polarization gradient',
      pages: 'pp. 27–30',
      summary: 'Where the light polarization changes in space, ground sublevels have shifted energies, and an atom that climbs a hill and is pumped at its top loses the height.',
      body: [
        {
          text: 'The apparatus is a pair of counter-propagating beams with perpendicular linear polarizations, or one σ⁺ and one σ⁻ beam, crossing a cloud of rubidium or cesium atoms. Coils make a weak or strong uniform field, and a hot wire or a time-of-flight signal reads the velocity. Doppler cooling stops at the limit of the last page. These atoms get colder by a mechanism that needs several ground sublevels (§3.1–3.2.2, pp. 27–30).',
        },
        {
          text: `Take a ground level of angular momentum one half that is excited to three halves. In the lin⊥lin pair the polarization runs through σ⁺, linear, σ⁻ and linear again within half a wavelength. The [[qc-op-light-shift|light shift]] of a sublevel, $U = 2\\hbar\\delta sC^2/(1 + 4\\delta^2/\\gamma^2)$ (Eq. 3.1), depends on the squared Clebsch–Gordan weight $C^2$ for detuning $\\delta$, saturation $s$ and linewidth $\\gamma$. In σ⁺ light the upper sublevel has the weight ${n0(V.o3CGUp)} and the lower one $${tf(V.o3CGDown)}$ (<<qc-l4-eigen|the eigenvector unit>>).`,
          claims: [
            claim('o3CGUp', 'in σ⁺ light the upper ground sublevel has the weight 1', () => V.o3CGUp === 1),
            claim('o3CGDown', 'in σ⁺ light the lower ground sublevel has the weight 1/3', () => near(V.o3CGDown, 1 / 3, 1e-12)),
          ],
        },
        {
          text: 'Now follow an atom. It sits in the deep sublevel at the bottom of a hill, moves, and climbs toward a quarter wavelength where the light has changed polarization. There [[qc-op-optical-pumping|optical pumping]] moves it to the other sublevel, which is now low, and the potential energy it gained leaves with the scattered photon. This repeated climbing and pumping is [[qc-op-sisyphus-cooling|Sisyphus cooling]], and the changing polarization that makes it work is a [[qc-op-polarization-gradient|polarization gradient]].',
        },
        {
          text: `For rubidium at $\\delta = -4\\gamma$ and saturation one half per beam, the light shift is $U_1 = -${d(V.o3U1, 1)}$ µK, and the hills are two thirds of it high: ${d(V.o3HillDepth, 1)} µK. The friction is about $\\hbar k^2|\\delta|/\\gamma$ for wave number $k$, larger than the largest Doppler friction by $2|\\delta|/\\gamma$, a factor ${n0(V.o3FrictionRatio)} here (<<qc-q8-pure-rho|the pure-state unit>>).`,
          claims: [
            claim('o3U1', 'the light shift of rubidium at δ = −4γ and s = ½ is −17.9 µK', () => near(V.o3U1, 17.9, 0.05)),
            claim('o3HillDepth', 'the hills are 11.9 µK high', () => near(V.o3HillDepth, 11.9, 0.05)),
            claim('o3FrictionRatio', 'the friction is 8 times the Doppler maximum', () => V.o3FrictionRatio === 8),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'sisyphusPotential', params: { mg: 0.5 } }, { fn: 'sisyphusPotential', params: { mg: -0.5 } }] },
            caption: 'The two ground-sublevel energies in units of the light shift against the position in wavelengths: each is high where the other is low.',
          },
        },
        {
          text: 'Try it. The bench below draws the two sublevel energies for rubidium. Slide ‘Detuning δ/γ’ to see the shift fall off as the light moves away from resonance, and ‘Saturation s per beam’ to scale it. The readouts give the light shift, the hill height, the friction gain and the limits for both polarizations.',
          widget: { kind: 'optics-bench', props: { preset: 'sisyphus-hills' }, caption: 'The two ground-sublevel energies of rubidium in lin⊥lin light.' },
        },
      ],
    },
    {
      id: 'o3-milc',
      label: '§3.3',
      title: 'A weak field: magnetically induced cooling',
      pages: 'pp. 30–31',
      summary: 'A standing wave of fixed circular polarization plus a weak transverse field cools by turning the atom at the nodes and pumping it at the antinodes.',
      body: [
        {
          text: 'A pair of beams can cool without a polarization gradient: a standing wave of fixed σ⁺ light plus a weak transverse magnetic field, called MILC (§3.3, pp. 30–31). At the nodes of the wave the atomic orientation turns in the field and is redistributed. At the antinodes pumping restores it. The method works when the Larmor rate $\\omega_Z$ is below the Doppler shift $kv$ of an atom at speed $v$, and that shift is below the pumping rate $\\gamma_p$ (<<qc-l11-two-level|the two-level unit>>).',
        },
        {
          text: `For rubidium-85 in a field of a tenth of a gauss, the lower edge $\\omega_Z/k$ of the working range is ${d(V.o3MilcLow, 2)} cm/s. The one-dimensional Doppler speed that sets the scale of the model is $v_D = \\sqrt{7\\hbar\\gamma/20M}$ for atomic mass $M$, ${d(V.o3VDRb, 2)} cm/s for rubidium-87, the 10 cm/s the book states.`,
          claims: [
            claim('o3MilcLow', 'the lower edge of the MILC range at a tenth of a gauss is 3.64 cm/s', () => near(V.o3MilcLow, 3.64, 0.005)),
            claim('o3VDRb', 'the Doppler speed of rubidium-87 is 9.87 cm/s', () => near(V.o3VDRb, 9.87, 0.005)),
          ],
        },
      ],
      corrections: [
        {
          where: 'Chapter 3, p. 31, the Doppler speed',
          says: 'v_D = √(7γ/20k_B)',
          shouldSay: `the printed expression is not a speed. Our calculation finds v_D = √(7ħγ/20M), which is ${d(V.o3VDRb, 2)} cm/s for rubidium-87, the 10 cm/s the book states.`,
          check: () => near(V.o3VDRb, 9.87, 0.005),
        },
      ],
    },
    {
      id: 'o3-sigma',
      label: '§3.4',
      title: 'σ⁺σ⁻ light: lag without hills',
      pages: 'pp. 31–33',
      summary: 'In σ⁺σ⁻ light the polarization is linear with an axis that turns, so there are no hills and the cooling comes from the lag of the atomic orientation.',
      body: [
        {
          text: 'In σ⁺σ⁻ light the two beams make linear light whose axis turns once per wavelength. There are no hills: the potential is flat, and the cooling comes from a lag of the atomic orientation behind the turning axis (§3.4, pp. 31–33). The lag leaves the populations of the sublevels unbalanced, the unbalance scatters more light from the beam that opposes the motion, and the atom is damped without the climbing mechanism.',
        },
        {
          text: `A ground level of angular momentum one that is excited to two shows the size of the effect. The sublevel with the largest projection absorbs σ⁺ light with the weight ${n0(V.o3CGOne)}, but σ⁻ light weaker by a factor ${n0(V.o3CGSix)}. Friction and diffusion are both smaller than for lin⊥lin by about the same amount, so the temperatures are comparable (<<qc-q8-mixed|the ensemble unit>>).`,
          claims: [
            claim('o3CGOne', 'σ⁺ light on the largest projection has the weight 1', () => V.o3CGOne === 1),
            claim('o3CGSix', 'σ⁻ light is weaker by a factor 6', () => near(V.o3CGSix, 6, 1e-9)),
          ],
        },
      ],
    },
    {
      id: 'o3-vsr',
      label: '§3.5–3.6',
      title: 'A strong field: velocity-selective resonance',
      pages: 'pp. 33–35',
      summary: 'In a strong field a two-photon transition between ground sublevels is resonant at one speed, and the atoms are cooled to that speed instead of to zero.',
      body: [
        {
          text: `In a strong field the sublevels are split by $\\hbar\\omega_Z$ with $\\omega_Z = g_F\\mu_B B/\\hbar$ for Landé factor $g_F$, Bohr magneton $\\mu_B$ and field $B$ (§3.5–3.6, pp. 33–35). For rubidium-85 in its level with total spin 3, $g_F$ is one third, so $\\omega_Z/2\\pi$ is ${d(V.o3ZeemanMHzG, 3)} MHz per gauss. A two-photon transition between the sublevels is resonant when the Doppler shifts of the two beams match the splitting: [[qc-op-velocity-selective-resonance|velocity-selective resonance]] (<<qc-l12-driven|the driven-atom unit>>).`,
          claims: [claim('o3ZeemanMHzG', 'the Larmor frequency of rubidium-85 is 0.467 MHz per gauss', () => near(V.o3ZeemanMHzG, 0.467, 0.0005))],
        },
        {
          text: `Atoms are then cooled to a resonance speed $v_r$ that depends only on the field. We find $v_r = \\omega_Z/2k$ for lin⊥lin and MILC light, ${d(V.o3VsrLin, 1)} cm/s at one gauss, and twice that, ${d(V.o3VsrSigma, 1)} cm/s, for σ⁺σ⁻ light, whose two-photon step spans two sublevels. The force is a dispersion curve centred on $v_r$, $F = -\\beta(v - v_r)/(1 + ((v - v_r)/v_c)^2)$ (Eq. 3.3), for friction $\\beta$ and capture velocity $v_c$. Resonances at $\\pm v_r$ split the central velocity peak in two.`,
          claims: [
            claim('o3VsrLin', 'the resonance speed for lin⊥lin at one gauss is 18.2 cm/s', () => near(V.o3VsrLin, 18.2, 0.05)),
            claim('o3VsrSigma', 'the resonance speed for σ⁺σ⁻ at one gauss is 36.4 cm/s', () => near(V.o3VsrSigma, 36.4, 0.05)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'vsrForce', params: { B: 0.5, kind: 'sigma' } }, { fn: 'vsrForce', params: { B: 0.5, kind: 'lin' } }] },
            caption: 'The force of the two Raman resonances in units of the friction times the capture velocity against the atom speed, for σ⁺σ⁻ and lin⊥lin light in a field of the same strength.',
          },
        },
        {
          text: 'Try it. The bench below draws the force for σ⁺σ⁻ and lin⊥lin light. Raise ‘Magnetic field B’ and the central peak splits into two that move apart; ‘Capture velocity v_c’ widens each. The readouts give the Larmor frequency, both resonance speeds, the separation of the peaks and the lower edge of the MILC range.',
          widget: { kind: 'optics-bench', props: { preset: 'vsr-force' }, caption: 'The two-resonance force of velocity-selective cooling in a magnetic field.' },
        },
      ],
      corrections: [
        {
          where: 'Chapter 3, pp. 33 and 35, the resonance speed',
          says: 'v_r = ω_Z/2k (twice), and then that the peaks lie at ω_Z/k',
          shouldSay: `the text gives ω_Z/2k twice and then says the peaks satisfy ω_Z/k. Our calculation finds ω_Z/2k = ${d(V.o3VsrLin, 1)} cm/s at one gauss for rubidium-85 in lin⊥lin light, and twice that, ${d(V.o3VsrSigma, 1)} cm/s, for σ⁺σ⁻.`,
          check: () => near(V.o3VsrLin, 18.2, 0.05) && near(V.o3VsrSigma, 2 * V.o3VsrLin, 0.1),
        },
      ],
    },
    {
      id: 'o3-theory',
      label: '§3.7–3.8',
      title: 'One idea behind four cases',
      pages: 'pp. 35–40',
      summary: 'The full theory splits the force into four parts, and Sisyphus cooling is one dissipative, irreversible idea that appears in four different cases.',
      body: [
        {
          text: 'The full theory writes the force as the trace of the ground-state density matrix with a force operator (<<qc-q8-trace-rule|the trace-rule unit>>). It splits into four parts: radiation pressure, the dipole force and two polarization-gradient forces (§3.7–3.8, pp. 35–40). All four carry the prefactor of the Doppler force, so the sub-Doppler friction is steeper near zero speed rather than stronger overall.',
        },
        {
          text: 'Sisyphus cooling is one idea behind four cases: Rydberg atoms, dressed states, lin⊥lin light and MILC. In each the energy leaves through spontaneous emission, which makes the cooling dissipative, and the phase of the emitted photon is lost, which makes it irreversible (<<qc-q8-mixed|the ensemble unit>>).',
        },
      ],
    },
    {
      id: 'o3-3d',
      label: '§3.9',
      title: 'Three dimensions: a floor set by the light shift',
      pages: 'pp. 40–42',
      summary: 'In three dimensions the temperature scales with the light shift and stops at a floor of a few recoil temperatures.',
      body: [
        {
          text: `In three dimensions the temperature follows the light shift, $k_B T = c\\,|U_1|$ (Eq. 3.13), where $c$ is ${d(V.o3CLin, 3)} for lin⊥lin cooling and ${d(V.o3CSigma, 3)} for σ⁺σ⁻ cooling (p. 41). For rubidium at the detuning and saturation above this gives ${d(V.o3TlimLin, 2)} µK and ${d(V.o3TlimSigma, 2)} µK, with a floor at the recoil temperature (§3.9, pp. 40–42; <<qc-l1-quantized|the Stern–Gerlach unit>> shows why a moment's energy is a field times a moment).`,
          claims: [
            claim('o3CLin', 'the book’s coefficient for lin⊥lin light is 0.125', () => near(V.o3CLin, 0.125, 1e-12)),
            claim('o3CSigma', 'the book’s coefficient for σ⁺σ⁻ light is 0.097', () => near(V.o3CSigma, 0.097, 1e-12)),
            claim('o3TlimLin', 'the lin⊥lin limit of rubidium is 2.24 µK', () => near(V.o3TlimLin, 2.24, 0.005)),
            claim('o3TlimSigma', 'the σ⁺σ⁻ limit of rubidium is 1.74 µK', () => near(V.o3TlimSigma, 1.74, 0.005)),
          ],
        },
        {
          text: `The cesium data in the book fall on one line against the light shift, which we report in words only. For cesium the Doppler limit $T_D$ is ${d(V.o3CsTD, 1)} µK and the recoil temperature $T_R$ is ${n0(V.o3CsTR)} nK, so the Doppler limit holds ${n0(V.o3CsTDoverTR)} recoil temperatures. We take $T_R = \\hbar^2k^2/Mk_B$, the definition behind the book's table of Chapter 6 and its factor of 15 on p. 41.`,
          claims: [
            claim('o3CsTD', 'the Doppler limit of cesium is 125.6 µK', () => near(V.o3CsTD, 125.6, 0.05)),
            claim('o3CsTR', 'the recoil temperature of cesium is 198 nK', () => near(V.o3CsTR, 198, 0.5)),
            claim('o3CsTDoverTR', 'the Doppler limit of cesium is 633 recoil temperatures', () => near(V.o3CsTDoverTR, 633, 0.5)),
          ],
        },
      ],
      corrections: [
        {
          where: 'Chapter 3, p. 41, against Chapter 2, pp. 20 and 52, and the table of Chapter 6',
          says: 'T_R ≡ ħγ_R/k_B on pp. 20 and 52, but 2.4 µK for sodium and a factor of 15 on p. 41',
          shouldSay: `the pages use two definitions that differ by a factor of two, so they are inconsistent with each other. With T_R = ħ²k²/(Mk_B) our calculation finds ${d(V.o3NaTRMicroK, 2)} µK for sodium, matching the table, and ${n0(V.o3CsTR)} nK for cesium.`,
          check: () => near(V.o3NaTRMicroK, 2.4, 0.005) && near(V.o3CsTR, 198, 0.5),
        },
      ],
    },
  ],
})
