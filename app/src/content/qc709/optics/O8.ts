/**
 * Optics Lab page O8: one atom in a beam of light (the experiment track, plan P-optics-experiment-track §3, rulings G1, G3, G5). A run sheet for one cesium tweezer of
 * the array of Manetsch et al. (arXiv:2403.12021v4): the size of the focus, the depth from a two-line polarizability (a stated model), the motion in the well, the
 * heating by the trap light. Numbers: keyed claims of O8.values.ts (numpy twin claims_optics/o_track.py); values the paper prints are claims named `o8Rep…`, copied as
 * printed (pages p. 3, p. 4, p. 18, p. 25). The waist 1.24 µm is OUR inference from the two printed frequencies; the paper prints its own, 1.17(6) µm (p. 25).
 * Preset `tweezer-well`. Paraphrased; no text is copied from the paper.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, near } from './O8.values'

export const O8: Lecture = notesLecture({
  collection: 'optics',
  number: 8,
  title: 'One atom in a beam of light',
  book: 'Manetsch et al., a tweezer array of 6100 qubits, arXiv:2403.12021, Methods',
  topics: ['the focus of a tweezer and its size', 'the depth from the atom’s polarizability', 'how far the atom moves in the well', 'what the trap light itself does to the atom'],
  length: 'full',
  symbols: {
    'w_0': 'o8-beam:b2',
    'z_R': 'o8-beam:b2',
    '\\lambda': 'o8-beam:b2',
    '\\omega_r': 'o8-beam:b2',
    '\\omega_z': 'o8-beam:b2',
    '\\pi': 'o8-beam:b2',
    'f_r': 'o8-beam:b2',
    'f_z': 'o8-beam:b2',
    'U': 'o8-depth:b1',
    '\\alpha': 'o8-depth:b1',
    'I_0': 'o8-depth:b1',
    'P': 'o8-depth:b1',
    '\\epsilon_0': 'o8-depth:b1',
    'c': 'o8-depth:b1',
    'M': 'o8-depth:b2',
    '\\sigma': 'o8-motion:b1',
    'k_B': 'o8-motion:b1',
    'T': 'o8-motion:b1',
    '\\eta': 'o8-motion:b2',
    'k': 'o8-motion:b2',
    '\\hbar': 'o8-motion:b2',
    'E_R': 'o8-heat:b1',
    'R': 'o8-heat:b1',
  },
  sections: [
    {
      id: 'o8-beam',
      label: '§1',
      title: 'The size of the focus',
      pages: 'pp. 3–25',
      summary: 'A laser focused by an objective makes a bright spot a little over a micrometre wide, and the two measured trap frequencies are enough to size it.',
      body: [
        {
          text: `The trap is a [[qc-op-tweezer|tweezer]]: a laser of wavelength 1061 nm, focused by an objective of numerical aperture ${d(V.o8RepNa, 2)} into one bright spot for each site, with the spots about ${d(V.o8RepSpacingUm, 1)} µm apart. The paper reports about ${d(V.o8RepPowerMW, 1)} mW per tweezer at the atoms (Manetsch et al., pp. 2–3 and 20). Set the wavelength, the aperture and the power; measure the vibration frequencies of an atom in the spot; and ask what spot size they imply.`,
          claims: [
            claim('o8RepNa', 'reported by Manetsch et al., p. 2: the objective has a numerical aperture of 0.65', () => near(V.o8RepNa, 0.65, 1e-12)),
            claim('o8RepSpacingUm', 'reported by Manetsch et al., p. 3: the sites are about 7.2 µm apart', () => near(V.o8RepSpacingUm, 7.2, 1e-12)),
            claim('o8RepPowerMW', 'reported by Manetsch et al., p. 3: about 1.4 mW reaches each atom', () => near(V.o8RepPowerMW, 1.4, 1e-12)),
          ],
        },
        {
          text: `A Gaussian focus has a waist $w_0$ and a Rayleigh length $z_R=\\pi w_0^2/\\lambda$ for wavelength $\\lambda$. An atom in the well oscillates sideways at $\\omega_r$ and along the beam at $\\omega_z$, and the ratio is $\\omega_r/\\omega_z=\\sqrt2\\,\\pi w_0/\\lambda$, so the two frequencies fix the waist. The paper reports a sideways frequency $f_r$ of ${d(V.o8RepFrKHz, 2)} kHz and an axial $f_z$ of ${d(V.o8RepFzKHz, 2)} kHz from Raman sidebands (Manetsch et al., Ext. Data Fig. 9, pp. 18 and 25).`,
          claims: [
            claim('o8RepFrKHz', 'reported by Manetsch et al., p. 18: the radial trap frequency is 29.30 kHz', () => near(V.o8RepFrKHz, 29.3, 1e-12)),
            claim('o8RepFzKHz', 'reported by Manetsch et al., p. 18: the axial trap frequency is 5.64 kHz', () => near(V.o8RepFzKHz, 5.64, 1e-12)),
          ],
        },
        {
          text: `From those two numbers we infer a waist of ${d(V.o8WaistUm, 2)} µm and a Rayleigh length of ${d(V.o8RayleighUm, 2)} µm. This is our inference, and we label it so. The paper infers its own waist, which it reports as ${d(V.o8RepWaistUm, 2)} µm (p. 25); we print the two side by side with no verdict. The sites are ${d(V.o8SpacingOverWaist, 2)} waists apart, so neighbouring spots do not overlap. The diffraction scale of the objective, the Airy radius, is ${d(V.o8AiryUm, 3)} µm, a little smaller than the waist (<<qc-l13-plane-wave|the plane-wave unit>>). Wavelength, linewidth and mass of cesium are standard values (Steck, alkali D-line data; NIST), stated here as inputs.`,
          claims: [
            claim('o8WaistUm', 'the waist that the two printed frequencies imply is 1.24 µm', () => near(V.o8WaistUm, 1.24, 0.005)),
            claim('o8RayleighUm', 'the Rayleigh length is 4.56 µm', () => near(V.o8RayleighUm, 4.56, 0.005)),
            claim('o8SpacingOverWaist', 'the sites are 5.80 waists apart', () => near(V.o8SpacingOverWaist, 5.8, 0.005)),
            claim('o8AiryUm', 'the Airy radius of the objective is 0.996 µm', () => near(V.o8AiryUm, 0.996, 0.0005)),
            claim('o8RepWaistUm', 'reported by Manetsch et al., p. 25: the paper infers a waist of 1.17 µm', () => near(V.o8RepWaistUm, 1.17, 1e-12)),
          ],
        },
        {
          text: 'What goes wrong is the focus itself. A real objective has aberrations, and a large array makes the spots at the edge of the field worse than those at the centre, so the waist is not one number for the whole array. A tighter focus gives a deeper well for the same power, but it also gives a shorter Rayleigh length, which makes the trap soft along the beam and sensitive to where the focal plane sits. The frequencies measured on the array are therefore averages, and the waist inferred from them is too.',
        },
      ],
    },
    {
      id: 'o8-depth',
      label: '§2',
      title: 'How deep the well is',
      pages: 'pp. 3–25',
      summary: 'Far below both cesium lines the depth is the polarizability times the intensity, and a two-line model gives a depth near the reported average.',
      body: [
        {
          text: `Far from resonance the well has the depth $U=\\frac{\\alpha I_0}{2\\epsilon_0 c}$ for polarizability $\\alpha$, peak intensity $I_0=2P/\\pi w_0^2$ and power $P$. For cesium at 1061 nm both fine-structure lines count, with the weights of their strengths and with the counter-rotating terms. The two-level formula of page O5 is not used here, because it ignores the second line. This two-line sum is a stated model, not data. It gives $\\alpha=$ ${d(V.o8AlphaAu, 0)} atomic units, and ${d(V.o8AlphaAu1064, 0)} at 1064 nm, the common value for the nearby laser (<<qc-l12-driven|the driven-atom unit>>).`,
          claims: [
            claim('o8AlphaAu', 'the polarizability of cesium at 1061 nm is 1165 atomic units', () => near(V.o8AlphaAu, 1165, 0.5)),
            claim('o8AlphaAu1064', 'the polarizability at 1064 nm is 1152 atomic units', () => near(V.o8AlphaAu1064, 1152, 0.5)),
          ],
        },
        {
          text: `With 1.4 mW and our waist the depth is ${d(V.o8Depth14, 3)} mK in temperature units, and the sideways and axial frequencies are ${d(V.o8FrAt14, 1)} and ${d(V.o8FzAt14, 2)} kHz. With the waist the paper infers the depth would be ${d(V.o8DepthPaperWaist, 3)} mK. The radial frequency that the paper measures implies ${d(V.o8DepthFromFreq, 3)} mK at our waist, which needs ${d(V.o8PowerForFreq, 2)} mW. The paper reports an average depth of ${d(V.o8RepDepthmK, 2)} mK at full power.`,
          claims: [
            claim('o8Depth14', 'the model depth at 1.4 mW and our waist is 0.152 mK', () => near(V.o8Depth14, 0.152, 0.0005)),
            claim('o8FrAt14', 'the sideways frequency at 1.4 mW is 25.0 kHz', () => near(V.o8FrAt14, 25.0, 0.05)),
            claim('o8FzAt14', 'the axial frequency at 1.4 mW is 4.81 kHz', () => near(V.o8FzAt14, 4.81, 0.005)),
            claim('o8DepthPaperWaist', 'the model depth at 1.4 mW and the paper’s waist is 0.171 mK', () => near(V.o8DepthPaperWaist, 0.171, 0.0005)),
            claim('o8DepthFromFreq', 'the radial frequency the paper measures implies a depth of 0.208 mK', () => near(V.o8DepthFromFreq, 0.208, 0.0005)),
            claim('o8PowerForFreq', 'that depth needs 1.92 mW', () => near(V.o8PowerForFreq, 1.92, 0.005)),
            claim('o8RepDepthmK', 'reported by Manetsch et al., p. 3: the average depth is 0.18 mK', () => near(V.o8RepDepthmK, 0.18, 1e-12)),
            claim('o8RepPowerMW', 'reported by Manetsch et al., p. 3: about 1.4 mW reaches each atom', () => near(V.o8RepPowerMW, 1.4, 1e-12)),
          ],
        },
        {
          text: 'Every number here has the same caveat. Our depth uses one power and a waist inferred from two frequencies, while the paper’s mean depth is an average over about twelve thousand sites that differ from one another. The reported value sits between the model numbers, and we draw no verdict from that. How you know the depth is right is the agreement of three independent routes, the power, the waist and the frequencies, to about the same number. Try it. Slide the power, the waist and the wavelength.',
          widget: { kind: 'optics-bench', props: { preset: 'tweezer-well' }, caption: 'The well of one tweezer on cesium, exact and harmonic.' },
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'tweezerU', params: { mode: 'exact' } }, { fn: 'tweezerU', params: { mode: 'harmonic' } }] },
            caption: 'The potential of the tweezer in millikelvin against the sideways position in micrometres, with its parabolic approximation.',
          },
        },
      ],
    },
    {
      id: 'o8-motion',
      label: '§3',
      title: 'Cold enough to stay in the well',
      pages: 'pp. 3–25',
      summary: 'A cloud at twenty microkelvin sits in the middle of the well, and a photon of the imaging light shakes it only a little.',
      body: [
        {
          text: `How far does the atom wander? The thermal size is $\\sigma=\\sqrt{k_BT/M\\omega_r^2}$ for temperature $T$ and mass $M$, which is ${d(V.o8Sigma20, 0)} nm at 20 µK, much less than the waist. The depth over the temperature is ${d(V.o8DepthOverT20, 2)} at 20 µK, so the atom stays far from the rim. This is the scale of the model of page O7, not a measurement; the paper reports an atomic temperature of its own, at a reduced trap depth and for another purpose, which we do not print.`,
          claims: [
            claim('o8Sigma20', 'the thermal size at 20 µK is 192 nm', () => near(V.o8Sigma20, 192, 0.5)),
            claim('o8DepthOverT20', 'the depth is 7.59 times the thermal energy at 20 µK', () => near(V.o8DepthOverT20, 7.59, 0.005)),
          ],
        },
        {
          text: 'What goes wrong is the ratio. If the depth is only a few times the thermal energy, the hottest atoms spill over the rim in a Boltzmann tail, and the lifetime of the trap falls well below the vacuum limit. If the cloud is cold, the same trap holds the atom for as long as the vacuum allows. So the cooling step of the previous page and the depth of this one have to be chosen together, and that is the reason this page asks for the ratio and not for the depth alone.',
        },
        {
          text: `Does a photon shake it out? The [[qc-op-lamb-dicke|Lamb–Dicke parameter]] $\\eta=k\\sqrt{\\hbar/2M\\omega_r}$ for the 852 nm light of the imaging is ${d(V.o8Eta, 3)}, and its square, which is the recoil energy over the vibration quantum, is ${d(V.o8EtaSq, 4)}. A small number means that one photon moves the atom by a small fraction of the well. The vibration levels of the well show up as Raman sidebands of the atomic line, as in the lattice of page O5 (<<qc-o-q25-atom-gates|the Q25 unit on Raman light and gates>>; <<qc-l20-box|the stationary-wave unit>>).`,
          claims: [
            claim('o8Eta', 'the Lamb–Dicke parameter for the imaging light is 0.266', () => near(V.o8Eta, 0.266, 0.0005)),
            claim('o8EtaSq', 'its square is 0.0705', () => near(V.o8EtaSq, 0.0705, 0.00005)),
          ],
        },
      ],
    },
    {
      id: 'o8-heat',
      label: '§4',
      title: 'What the trap light itself does',
      pages: 'pp. 3–25',
      summary: 'The trap light scatters a few photons a second and each one heats the atom, which sets a floor under every lifetime that the vacuum has not already set.',
      body: [
        {
          text: `Scattered trap light heats the atom by one recoil pair for each photon. The scattering rate of the two lines, with the rotating-wave form, is $R=$ ${d(V.o8Rsc, 2)} per second at 1.4 mW. Each trap photon at 1061 nm adds ${d(V.o8RecoilGainK, 0)} nK of energy, written $2E_R/k_B$ for the recoil energy $E_R$. Heating alone then needs ${d(V.o8HeatTime, 0)} s, or ${d(V.o8HeatMin, 1)} minutes, to take the atom to the rim (<<qc-q24-lindblad|the unit on why a driven atom forgets>>).`,
          claims: [
            claim('o8Rsc', 'the trap light scatters 1.45 photons a second', () => near(V.o8Rsc, 1.45, 0.005)),
            claim('o8RecoilGainK', 'each trap photon adds 128 nK', () => near(V.o8RecoilGainK, 128, 0.5)),
            claim('o8HeatTime', 'heating by the trap light alone takes 819 s', () => near(V.o8HeatTime, 819, 0.5)),
            claim('o8HeatMin', 'that is 13.7 minutes', () => near(V.o8HeatMin, 13.7, 0.05)),
            claim('o8RepPowerMW', 'reported by Manetsch et al., p. 3: about 1.4 mW reaches each atom', () => near(V.o8RepPowerMW, 1.4, 1e-12)),
          ],
        },
        {
          text: `How you know it matters is the lifetime. The paper reports a trap lifetime of ${d(V.o8RepLifeMin, 1)} minutes, which it traces to the vacuum (Manetsch et al., p. 4). Our heating time is of the same order and comes from a different mechanism. We print the two side by side, one computed and one reported, with no verdict: both are far above the second that one run of the cycle takes.`,
          claims: [claim('o8RepLifeMin', 'reported by Manetsch et al., p. 4: the vacuum-limited lifetime is 22.9 minutes', () => near(V.o8RepLifeMin, 22.9, 1e-12))],
        },
        {
          text: 'What goes wrong if you push the dials is a trade. Brighter trap light makes a deeper well, which holds hotter atoms and gives higher frequencies, but it scatters more photons in proportion to the power and heats faster. Light further from the lines scatters less for the same depth, because the depth falls as one over the detuning and the scattering as its square, which is the reason a tweezer uses a wavelength far into the infrared.',
        },
      ],
    },
  ],
})
