/**
 * Optics Lab page O10: light from one atom (the experiment track, plan P-optics-experiment-track §5, rulings G1, G3, G5). A run sheet for the photon budget of one cesium atom:
 * the scattering rate, the share a lens collects, the photons a bright atom needs, the recoil and depumping limits. The imaging setting (saturation 2, detuning −2γ, five per cent
 * efficiency) is a SETUP value of this page, not a paper's; the depumping chance is a stated input; numbers a paper prints are claims named `o10Rep…`, copied as printed
 * (Chow, Little and Jau, arXiv:2206.00144, pp. 3 and 5; Kwon et al., arXiv:1706.09497, p. 2; Manetsch et al., arXiv:2403.12021v4, pp. 3 and 20). Gibbons' 720 nK per photon is
 * NOT shown (ruling G3). Numbers: keyed claims of O10.values.ts (numpy twin claims_optics/o_track.py). Preset `photon-budget`. Paraphrased; no text is copied from a source.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, n0, near } from './O10.values'

export const O10: Lecture = notesLecture({
  collection: 'optics',
  number: 10,
  title: 'Light from one atom',
  book: 'Chow, Little and Jau, state detection of alkali atoms in tweezers, arXiv:2206.00144',
  topics: ['how many photons one atom scatters', 'the share a lens collects', 'how many photons make a bright atom', 'the heating and the depumping that stop you'],
  length: 'full',
  symbols: {
    'R': 'o10-rate:b2',
    '\\gamma': 'o10-rate:b2',
    's': 'o10-rate:b2',
    '\\delta': 'o10-rate:b2',
    'a': 'o10-collect:b1',
    'm': 'o10-need:b1',
    '\\eta': 'o10-need:b1',
    '\\tau': 'o10-need:b1',
    'e': 'o10-need:b1',
    'E_R': 'o10-limit:b1',
    'k_B': 'o10-limit:b1',
    'p': 'o10-limit:b2',
    'N': 'o10-limit:b2',
  },
  sections: [
    {
      id: 'o10-rate',
      label: '§1',
      title: 'How many photons an atom gives',
      pages: 'p. 3',
      summary: 'An atom lit near its resonance scatters up to half a linewidth’s worth of photons a second, fewer when the light is weak or off resonance.',
      body: [
        {
          text: 'To see one atom you light it with a beam tuned near a cycling transition and count the photons it scatters. The apparatus is the imaging beam on the cycling line at a chosen detuning from resonance, a high-aperture objective and a camera. Set the intensity and the detuning, and measure the photons that reach the camera. The atom is cesium, with its wavelength, linewidth and mass taken as standard values (Steck, alkali D-line data; NIST), stated here as inputs (<<qc-l11-two-level|the two-level-atom unit>>).',
        },
        {
          text: `The scattering rate is $R=(\\gamma/2)\\,s/(1+s+4\\delta^2/\\gamma^2)$ for the linewidth $\\gamma$, the saturation $s$ and the detuning $\\delta$, the law of page O1 with its detuning term. At most an atom scatters $\\gamma/2$, which for cesium is ${d(V.o10RmaxCs, 2)}×10⁷ per second. At a saturation of one and zero detuning it scatters a quarter of $\\gamma$, which is ${d(V.o10RSat, 2)}×10⁶ per second.`,
          claims: [
            claim('o10RmaxCs', 'the largest scattering rate of cesium is 1.64 × 10⁷ per second', () => near(V.o10RmaxCs, 1.64, 0.005)),
            claim('o10RSat', 'at a saturation of one and zero detuning it is 8.22 × 10⁶ per second', () => near(V.o10RSat, 8.22, 0.005)),
          ],
        },
        {
          text: `The page works with one setting: a saturation of two and a detuning of −2$\\gamma$. These are setup values of this page, not a paper's. They give ${d(V.o10RExample, 2)}×10⁶ photons per second. What goes wrong when you push the intensity is that the rate saturates, so the extra light only heats the atom. Try it. The bench below ends this page with the whole budget, and its sliders are the four dials of this paragraph and the next three sections.`,
          claims: [claim('o10RExample', 'at a saturation of two and a detuning of −2γ the rate is 1.73 × 10⁶ per second', () => near(V.o10RExample, 1.73, 0.005))],
        },
        {
          text: 'How you know the rate is right is the shape of the curve. In weak light the count rate grows in proportion to the intensity. In strong light it bends over and flattens at its largest value. The intensity at which the bend is half done is the saturation intensity, so a plot of counts against power measures the number that the formula starts from. Against the detuning the rate is a line of Lorentzian shape whose width grows with the saturation, which is the power broadening of page O2.',
        },
      ],
    },
    {
      id: 'o10-collect',
      label: '§2',
      title: 'How many reach the camera',
      pages: 'pp. 3–20',
      summary: 'An ideal lens gathers a share of the isotropic light set by its numerical aperture, and the whole chain of a real camera collects a good deal less.',
      body: [
        {
          text: `An ideal lens of numerical aperture $a$ gathers the share $(1-\\sqrt{1-a^2})/2$ of light that goes out equally in every direction. For an aperture of ${d(V.o10RepNa40, 1)} it is ${d(V.o10CollNa40 * 100, 2)} %, for ${d(V.o10RepNa55, 2)} it is ${d(V.o10CollNa55 * 100, 2)} %, and for ${d(V.o10RepNa65, 2)} it is ${d(V.o10CollNa65 * 100, 1)} %. The first is the lens of Kwon et al. (rubidium), who print the same ${d(V.o10RepKwonIsoCE * 100, 2)} % for isotropic emission (p. 8). The other two are the numerical apertures of the objective of Manetsch et al. for the imaging light and the trapping light (p. 20).`,
          claims: [
            claim('o10RepNa40', 'reported by Kwon et al., p. 2: the lens has a numerical aperture of 0.4', () => near(V.o10RepNa40, 0.4, 1e-12)),
            claim('o10RepNa55', 'reported by Manetsch et al., p. 20: the numerical aperture at the imaging wavelength is 0.55', () => near(V.o10RepNa55, 0.55, 1e-12)),
            claim('o10RepNa65', 'reported by Manetsch et al., p. 20: the numerical aperture at the trapping wavelength is 0.65', () => near(V.o10RepNa65, 0.65, 1e-12)),
            claim('o10RepKwonIsoCE', 'reported by Kwon et al., p. 8: the lens collects 4.17 % of isotropic emission', () => near(V.o10RepKwonIsoCE, 0.0417, 1e-12)),
            claim('o10CollNa40', 'an ideal lens of numerical aperture 0.4 gathers 4.17 % of isotropic light', () => near(V.o10CollNa40, 0.0417, 0.00005)),
            claim('o10CollNa55', 'an ideal lens of numerical aperture 0.55 gathers 8.24 %', () => near(V.o10CollNa55, 0.0824, 0.00005)),
            claim('o10CollNa65', 'an ideal lens of numerical aperture 0.65 gathers 12.0 %', () => near(V.o10CollNa65, 0.12, 0.0005)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'collectionVsNA' }] },
            caption: 'The share of isotropic light an ideal lens collects against its numerical aperture.',
          },
        },
        {
          text: `The measured efficiencies are lower, and the gap is the lesson. Chow et al. report a collection efficiency of ${d(V.o10RepCE * 100, 2)} % for the whole chain, from the optics to the quantum efficiency of the detector (p. 3). Kwon et al. (rubidium) report a total detection efficiency of ${d(V.o10RepKwonLo * 100, 1)} % to ${d(V.o10RepKwonHi * 100, 1)} % (p. 2). The page prints them beside the ideal figures, one computed and the others reported, with no verdict.`,
          claims: [
            claim('o10RepCE', 'reported by Chow et al., p. 3: the collection efficiency is 0.96 %', () => near(V.o10RepCE, 0.0096, 1e-12)),
            claim('o10RepKwonLo', 'reported by Kwon et al., p. 2: the total detection efficiency is 1.6 %', () => near(V.o10RepKwonLo, 0.016, 1e-12)),
            claim('o10RepKwonHi', 'reported by Kwon et al., p. 2: up to 2.0 %', () => near(V.o10RepKwonHi, 0.02, 1e-12)),
          ],
        },
        {
          text: 'What multiplies the ideal figure is a list, not a mystery. Glass surfaces and filters transmit less than all the light. A detector turns only a part of the photons that reach it into electrons. Some of the light falls outside the small region of the image that is read for one atom. The dipole pattern of the light is not even isotropic, which changes the share a little in either direction (<<qc-q3-born|the unit on chances as squared overlaps>>). What the camera does with the counted photons, adding them over a box of pixels, is taken up in <<qc-o-b5-roi|a spot on a grid of pixels>>.',
        },
      ],
    },
    {
      id: 'o10-need',
      label: '§3',
      title: 'How many photons make a bright atom',
      pages: 'p. 3',
      summary: 'A bright atom shows no counts with a chance that falls as the exponential of its mean count, which fixes how many photons it must scatter.',
      body: [
        {
          text: `The mean number of counted photons is $m=R\\eta\\tau$ for the efficiency $\\eta$ and the exposure $\\tau$. The counts follow a Poisson law, so a bright atom shows zero counts, and is read as dark, with the chance $e^{-m}$. That chance is ${d(V.o10Floor5 * 100, 3)} % at a mean count of five and ${d(V.o10Floor7 * 100, 4)} % at seven. Set the exposure so the floor is below the error you can accept (<<qc-o-q25-readout|the Q25 unit on reading an atom with light>>).`,
          claims: [
            claim('o10Floor5', 'a mean count of five leaves a chance 0.674 % of zero counts', () => near(V.o10Floor5, 0.00674, 0.000005)),
            claim('o10Floor7', 'a mean count of seven leaves 0.0912 %', () => near(V.o10Floor7, 0.000912, 0.0000005)),
          ],
        },
        {
          text: `At the efficiency of Chow et al., ${d(V.o10RepCE * 100, 2)} %, a mean count of five needs ${n0(V.o10NScat5)} scattered photons and seven needs ${n0(V.o10NScat7)}. At the page's example rate and a total efficiency of five per cent, a mean count of five needs only ${d(V.o10TauM5, 4)} ms. The two cases show why the collection decides the exposure: the same atom seen through a camera that collects a tenth as many photons needs ten times the exposure. Here the two efficiencies differ by a factor ${d(V.o10CollRatio, 1)}, and the exposure is ${d(V.o10TauM5Chow, 2)} ms at ${d(V.o10RepCE * 100, 2)} % against ${d(V.o10TauM5, 4)} ms at five per cent.`,
          claims: [
            claim('o10RepCE', 'reported by Chow et al., p. 3: the collection efficiency is 0.96 %', () => near(V.o10RepCE, 0.0096, 1e-12)),
            claim('o10NScat5', 'a mean count of five needs 521 scattered photons at that efficiency', () => V.o10NScat5 === 521),
            claim('o10NScat7', 'a mean count of seven needs 729', () => V.o10NScat7 === 729),
            claim('o10TauM5Chow', 'at the example rate and 0.96 % a mean count of five needs 0.30 ms', () => near(V.o10TauM5Chow, 0.3, 0.005)),
            claim('o10CollRatio', 'the two efficiencies differ by a factor 5.2', () => near(V.o10CollRatio, 5.2, 0.05)),
            claim('o10TauM5', 'at the example rate and five per cent a mean count of five needs 0.0578 ms', () => near(V.o10TauM5, 0.0578, 0.00005)),
          ],
          widget: { kind: 'optics-bench', props: { preset: 'photon-budget' }, caption: 'The photon budget of one cesium atom against the exposure.' },
        },
        {
          text: 'The mean count is only half of the statistics, because a Poisson count has a spread equal to the square root of its mean. A bright atom at a mean count of nine shows a count from about six to twelve, and a dark site shows zero or one. The two ranges are far apart, which is the reason a single cutoff can tell them apart, and the next page shows where to put it. Try it. Slide the saturation, the detuning and the efficiency, and read off the time for a mean count of five. The aperture moves only the ideal-collection readout, and not the time, which follows the total efficiency.',
        },
      ],
    },
    {
      id: 'o10-limit',
      label: '§4',
      title: 'Why not scatter more',
      pages: 'pp. 3–5',
      summary: 'Each scattered photon heats the atom by two recoils and may drop it into the wrong hyperfine level, so the photons you can spend are limited.',
      body: [
        {
          text: `Each photon kicks the atom twice, once when it is absorbed and once when it is emitted, so the atom gains $2E_R$ of kinetic energy for the recoil energy $E_R$. For cesium at 852 nm that is ${d(V.o10GainK, 0)} nK per photon, written as a temperature $2E_R/k_B$. With no cooling at all, the trap depth of ${d(V.o10RepDepthmK, 2)} mK that Manetsch et al. report (p. 3) is used up after ${n0(V.o10PhotonsToDepth)} scattered photons (<<qc-q24-lindblad|the unit on rates and steady states>>). That is ${d(V.o10DepthOverNeedChow, 1)} times the ${V.o10NScat5} scattered photons a bright atom needs at the efficiency of Chow et al., and ${d(V.o10DepthOverNeedSetup, 0)} times the ${V.o10NScat5Setup} it needs at the five per cent of this page.`,
          claims: [
            claim('o10GainK', 'each photon adds 198 nK for cesium', () => near(V.o10GainK, 198, 0.5)),
            claim('o10PhotonsToDepth', 'the reported depth is used up after 908 photons', () => near(V.o10PhotonsToDepth, 908, 0.5)),
            claim('o10DepthOverNeedChow', 'that is 1.7 times the photons a bright atom needs at the efficiency of Chow et al.', () => near(V.o10DepthOverNeedChow, 1.7, 0.05)),
            claim('o10NScat5Setup', 'a mean count of five needs 100 scattered photons at five per cent', () => V.o10NScat5Setup === 100),
            claim('o10DepthOverNeedSetup', 'that is 9 times the photons needed at five per cent', () => near(V.o10DepthOverNeedSetup, 9, 0.5)),
            claim('o10RepDepthmK', 'reported by Manetsch et al., p. 3: the average depth is 0.18 mK', () => near(V.o10RepDepthmK, 0.18, 1e-12)),
          ],
        },
        {
          text: `The second limit is [[qc-op-depumping|depumping]]: each photon has a small chance of leaving the atom in the wrong hyperfine level, after which it stops looking bright. Chow et al. put the chance at ${d(V.o10RepDepump, 1)}×10⁻⁴ per collected photon (p. 5), and we take it as a stated input and not a measurement of ours. The chance of keeping the atom is $(1-p)^N$ after $N$ collected photons, and falls to one over e after ${n0(V.o10DepumpN)} collected photons. At a collection of ${d(V.o10RepCE * 100, 2)} %, that is about ${d(V.o10DepumpScat, 1)}×10⁵ scattered photons. After 500 collected photons the chance is ${d(V.o10Surv500, 3)}. The recoil limit above counts scattered photons, and this limit counts collected ones.`,
          claims: [
            claim('o10RepDepump', 'reported by Chow et al., p. 5: the depumping chance is 3.7 × 10⁻⁴', () => near(V.o10RepDepump, 3.7, 1e-12)),
            claim('o10RepCE', 'reported by Chow et al., p. 3: the collection efficiency is 0.96 %', () => near(V.o10RepCE, 0.0096, 1e-12)),
            claim('o10DepumpScat', 'which is about 2.8 × 10⁵ scattered photons', () => near(V.o10DepumpScat, 2.8, 0.05)),
            claim('o10DepumpN', 'the keeping chance falls to one over e after 2,702 collected photons', () => V.o10DepumpN === 2702),
            claim('o10Surv500', 'after 500 collected photons the keeping chance is 0.831', () => near(V.o10Surv500, 0.831, 0.0005)),
          ],
        },
        {
          text: 'What goes wrong if you ignore both limits is a detection that works and an atom that is gone. How you know where to stop is the exposure at which the detected count is high enough for the error you accept and the number of photons is still far below both numbers. The next page turns the mean count into an error, and then asks how much of the atom you can afford to lose to get it.',
        },
      ],
    },
  ],
})
