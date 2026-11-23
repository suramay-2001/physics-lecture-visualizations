/**
 * Optics Lab page O11: counting atoms (the experiment track, plan P-optics-experiment-track §6, rulings G1, G3, G5). A run sheet for reading one site from its counts: two Poisson
 * histograms and a cutoff, the exposure, the camera's gain noise, the best exposure (a labelled toy). The error is the equal-prior average of the two misreads (judge's note:
 * the EMCCD error is 1.75e-4 under it, so the plan's 3.60e-4 is superseded). The example means (nine plus a background) and the EMCCD setting are SETUP values; the toy loss rate is
 * a labelled TOY input; numbers a paper prints are claims named `o11Rep…`, copied as printed (Chow, Little and Jau, arXiv:2206.00144, p. 3; Manetsch et al., arXiv:2403.12021v4,
 * pp. 4 and 21). Numbers: keyed claims of O11.values.ts (numpy twin claims_optics/o_track.py). Presets `count-histograms` and `exposure-optimum`. Paraphrased from the sources.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, near } from './O11.values'

export const O11: Lecture = notesLecture({
  collection: 'optics',
  number: 11,
  title: 'Counting atoms',
  book: 'Chow, Little and Jau, state detection of alkali atoms in tweezers, arXiv:2206.00144',
  topics: ['two count histograms and a cutoff', 'how the error falls with the exposure', 'the noise of an amplifying camera', 'the best exposure when light also loses atoms'],
  length: 'full',
  symbols: {
    'm_b': 'o11-hist:b1',
    'm_d': 'o11-hist:b1',
    'n_c': 'o11-hist:b1',
    '\\tau': 'o11-exposure:b1',
    'g': 'o11-camera:b1',
    'e': 'o11-loss:b1',
    '\\lambda_L': 'o11-loss:b1',
  },
  sections: [
    {
      id: 'o11-hist',
      label: '§1',
      title: 'Two Poisson histograms and a cutoff',
      pages: 'p. 3',
      summary: 'A site is read as occupied when its count reaches a cutoff, and the error is half the sum of the chances to misread a bright atom and a dark site.',
      body: [
        {
          text: `The camera of the last page gives, for one site, a count in a small region of the image. A bright shot has the atom and a dark shot has none. The bright count has a mean $m_b$, which is the signal plus the background, and the dark count has a mean $m_d$, the background alone. Both follow a Poisson law. A count of at least $n_c$ reads "atom". Set the cutoff; measure the two histograms (<<qc-o-q25-readout|the Q25 unit on reading an atom with light>>).`,
        },
        {
          text: `Take a bright mean of ${d(V.o11SetMb, 1)} (a signal of nine and a background of ${d(V.o11SetMd, 1)}) and a dark mean of ${d(V.o11SetMd, 1)}; these are setup values of this page. With the cutoff at three counts the bright atom is missed with a chance ${d(V.o11ExEb * 100, 3)} %, the dark site is misread with a chance ${d(V.o11ExEd * 100, 3)} %, and the error, half their sum, is ${d(V.o11ExErr * 100, 3)} %. The cutoff is the best one; moving it up or down makes the error larger. Try it. Slide the means and the cutoff.`,
          claims: [
            claim('o11SetMb', 'the example bright mean is 9.2', () => near(V.o11SetMb, 9.2, 1e-12)),
            claim('o11SetMd', 'the example dark mean is 0.2', () => near(V.o11SetMd, 0.2, 1e-12)),
            claim('o11ExEb', 'at a cutoff of three the bright atom is missed with chance 0.531 %', () => near(V.o11ExEb, 0.00531, 0.000005)),
            claim('o11ExEd', 'the dark site is misread with chance 0.115 %', () => near(V.o11ExEd, 0.00115, 0.000005)),
            claim('o11ExErr', 'the error is 0.323 %', () => near(V.o11ExErr, 0.00323, 0.000005)),
          ],
          widget: { kind: 'optics-bench', props: { preset: 'count-histograms' }, caption: 'The two count histograms of a bright atom and a dark site, with the cutoff.' },
        },
        {
          text: 'What goes wrong is that no cutoff is free. A low cutoff misreads the dark sites, which are the majority of sites in an array that is half empty. A high cutoff misses bright atoms. The best cutoff sits where the two tails are of about equal weight. This is the whole of the reading problem for a single site. The next section asks how the error falls when you light the atom for longer, and a later page replaces the cutoff by weights over many pixels at once.',
        },
      ],
    },
    {
      id: 'o11-exposure',
      label: '§2',
      title: 'More light, fewer errors',
      pages: 'p. 3',
      summary: 'Both means grow in proportion to the exposure, so the two histograms pull apart as the square root of it and the error falls faster than any power.',
      body: [
        {
          text: `Both means grow as the exposure $\\tau$. The spread of a Poisson count grows only as its square root, so the distance between the two histograms, in units of their widths, grows as $\\sqrt{\\tau}$. Four times the exposure doubles that distance: the ratio is ${d(V.o11DprimeRatio, 2)}. The error therefore falls much faster than the exposure grows, and an extra tenth of a millisecond can buy orders of magnitude (<<qc-q14-min-error|the unit on the measurement with the fewest mistakes>>).`,
          claims: [claim('o11DprimeRatio', 'four times the exposure doubles the distance of the histograms, a ratio of 2.00', () => near(V.o11DprimeRatio, 2, 0.005))],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'errVsExposure', params: { rb: 54.4, rg: 0.52 } }], yScale: 'log' },
            caption: 'The smallest error of a count cutoff against the exposure in microseconds, on a logarithmic axis, for a bright rate of 54.4 and a background of 0.52 thousand counts a second.',
          },
        },
        {
          text: `Chow et al. report a collected bright-atom rate of ${d(V.o11RepRateB, 1)} thousand counts a second and a background rate of ${d(V.o11RepRateD, 2)} thousand (p. 3). With those two rates as inputs, the best cutoff gives an error of ${d(V.o11Err50 * 100, 2)} % at 50 µs, ${d(V.o11Err100 * 100, 2)} % at 100 µs, ${d(V.o11Err150 * 100, 3)} % at 150 µs, ${d(V.o11Err260 * 100, 4)} % at 260 µs and ${d(V.o11Err350 * 100, 5)} % at 350 µs. Each is computed here, with the best whole cutoff at each exposure.`,
          claims: [
            claim('o11RepRateB', 'reported by Chow et al., p. 3: the bright atom collection rate is 54.4 thousand counts a second', () => near(V.o11RepRateB, 54.4, 1e-12)),
            claim('o11RepRateD', 'reported by Chow et al., p. 3: the background rate is 0.52 thousand counts a second', () => near(V.o11RepRateD, 0.52, 1e-12)),
            claim('o11Err50', 'the error at 50 µs is 4.49 %', () => near(V.o11Err50, 0.0449, 0.00005)),
            claim('o11Err100', 'the error at 100 µs is 1.40 %', () => near(V.o11Err100, 0.014, 0.00005)),
            claim('o11Err150', 'the error at 150 µs is 0.267 %', () => near(V.o11Err150, 0.00267, 0.000005)),
            claim('o11Err260', 'the error at 260 µs is 0.0196 %', () => near(V.o11Err260, 0.000196, 0.0000005)),
            claim('o11Err350', 'the error at 350 µs is 0.00166 %', () => near(V.o11Err350, 0.0000166, 0.000000005)),
          ],
        },
        {
          text: `The paper reports ideal errors, with no depumping, of ${d(V.o11RepEb * 100, 3)} % for the bright atom and ${d(V.o11RepEd * 100, 2)} % for the dark site at ${d(V.o11RepMs, 2)} ms (p. 3). Their mean is ${d(V.o11PaperMean * 100, 4)} %, next to our ${d(V.o11Err260 * 100, 4)} % at 260 µs. The two are of the same size, and we print them side by side with no verdict, because the rates are rounded as printed and the paper's own errors come from its own cutoff.`,
          claims: [
            claim('o11RepEb', 'reported by Chow et al., p. 3: the bright atom error is 0.005 %', () => near(V.o11RepEb, 0.00005, 1e-12)),
            claim('o11RepEd', 'reported by Chow et al., p. 3: the dark site error is 0.04 %', () => near(V.o11RepEd, 0.0004, 1e-12)),
            claim('o11RepMs', 'reported by Chow et al., p. 3: the probe time is 0.26 ms', () => near(V.o11RepMs, 0.26, 1e-12)),
            claim('o11PaperMean', 'the mean of the two reported errors is 0.0225 %', () => near(V.o11PaperMean, 0.000225, 0.0000000005)),
            claim('o11Err260', 'our error at 260 µs is 0.0196 %', () => near(V.o11Err260, 0.000196, 0.0000005)),
          ],
        },
      ],
    },
    {
      id: 'o11-camera',
      label: '§3',
      title: 'The camera’s own noise',
      pages: 'pp. 3–10',
      summary: 'A camera that amplifies each electron adds a random spread, and for a few photoelectrons that spread, not the photons, sets the error.',
      body: [
        {
          text: `An electron-multiplying camera turns each detected photon into a [[qc-op-photoelectron|photoelectron]] and multiplies it by a random [[qc-op-em-gain|gain]]. The multiplication of one electron follows an exponential law of mean $g$, so the sum for n electrons is an Erlang law, and a Gaussian read noise is added on top (Martinez-Dorantes et al., supplement). For a Poisson number of electrons the variance is exactly twice the mean times $g^2$, an excess noise factor of ${d(V.o11Enf, 2)} (<<qc-q9-distance|the unit on how well two states can be told apart>>).`,
          claims: [claim('o11Enf', 'the excess noise factor of the multiplication is 2.00', () => near(V.o11Enf, 2, 0.005))],
        },
        {
          text: `Take a bright atom of thirty photoelectrons against a dark site of three tenths, a gain of 300 counts and a read noise of 40 counts: these are setup values. The best cutoff then gives an error of ${d(V.o11EmccdErr * 100, 4)} %, by the same equal-prior average as the last section. Counting the same photoelectrons one by one would give only ${d(V.o11EmccdFloor, 1)}×10⁻⁶ %. The spread of the gain, and not the photons, sets the error. Cesium and its wavelength are standard values (Steck, alkali D-line data; NIST), stated here as inputs.`,
          claims: [
            claim('o11EmccdErr', 'the camera error is 0.0175 %', () => near(V.o11EmccdErr, 0.000175, 0.0000005)),
            claim('o11EmccdFloor', 'counting photon by photon would give 7.5 × 10⁻⁶ %', () => near(V.o11EmccdFloor, 7.5, 0.05)),
          ],
        },
        {
          text: 'What goes wrong is that more gain does not help once the read noise is small against one gain step. Past that point only the exponential spread of the gain remains, and it does not shrink with more amplification. The remedy is more photons, or a camera that counts electrons without a random gain. How you know your camera is in this regime is the shape of its dark histogram, whose long tail is the multiplication of a few stray electrons.',
        },
      ],
    },
    {
      id: 'o11-loss',
      label: '§4',
      title: 'The best exposure',
      pages: 'pp. 3–10',
      summary: 'A longer exposure reads better and loses more atoms, so the total error has a minimum, which a toy model of the loss makes visible.',
      body: [
        {
          text: `Light that reads the atom also heats it, and a long exposure loses atoms. A toy model, labelled so, adds a loss chance $1-e^{-\\lambda_L\\tau}$ to the misread error of the last sections, at a loss rate $\\lambda_L$ of 4 per second. That rate is invented for the toy, and it is not a measurement. The total is least at ${V.o11ToyTau} µs, where it is ${d(V.o11ToyTotal * 100, 3)} %, and of that the misread part is ${d(V.o11ToyMisread * 100, 4)} %. Try it. Slide the rates and the loss.`,
          claims: [
            claim('o11ToyTau', 'the total of the toy is least at 234 µs', () => V.o11ToyTau === 234),
            claim('o11ToyTotal', 'the total error there is 0.120 %', () => near(V.o11ToyTotal, 0.0012, 0.000005)),
            claim('o11ToyMisread', 'the misread part is 0.0264 %', () => near(V.o11ToyMisread, 0.000264, 0.0000005)),
          ],
          widget: { kind: 'optics-bench', props: { preset: 'exposure-optimum' }, caption: 'The misread error, the loss of the atom and their total against the exposure.' },
        },
        {
          text: `The quantity that the experiments plot is the fidelity times the survival. Manetsch et al. report a fidelity of ${d(V.o11RepF80 * 100, 5)} % and a survival of ${d(V.o11RepS80 * 100, 5)} % at 80 ms (p. 4), which multiply to ${d(V.o11FS80, 6)}. For 20 ms they report ${d(V.o11RepF20 * 100, 4)} % and ${d(V.o11RepS20 * 100, 3)} % (p. 21), which multiply to ${d(V.o11FS20, 6)}. The products are computed from the reported inputs, and they show that the shorter image gives up survival for time.`,
          claims: [
            claim('o11RepF80', 'reported by Manetsch et al., p. 4: the fidelity at 80 ms is 99.99374 %', () => near(V.o11RepF80, 0.9999374, 1e-12)),
            claim('o11RepS80', 'reported by Manetsch et al., p. 4: the survival at 80 ms is 99.98952 %', () => near(V.o11RepS80, 0.9998952, 1e-12)),
            claim('o11FS80', 'the product at 80 ms is 0.999833', () => near(V.o11FS80, 0.999833, 0.0000005)),
            claim('o11RepF20', 'reported by Manetsch et al., p. 21: the fidelity at 20 ms is 99.9571 %', () => near(V.o11RepF20, 0.999571, 1e-12)),
            claim('o11RepS20', 'reported by Manetsch et al., p. 21: the survival at 20 ms is 99.176 %', () => near(V.o11RepS20, 0.99176, 1e-12)),
            claim('o11FS20', 'the product at 20 ms is 0.991335', () => near(V.o11FS20, 0.991335, 0.0000005)),
          ],
        },
        {
          text: 'This is where the track hands over. The cutoff on counts of this page is the simplest reader, and the pages on whole frames replace it by weights over many pixels. The best exposure of this section is a trade that the later pages on readout in the error-correction cycle make quantitative, where the time spent reading is also the time the other atoms wait. A reading that may answer neither bright nor dark is the idea of the unit on unambiguous discrimination (<<qc-q14-usd|the unit on telling two states apart without ever being wrong>>).',
        },
      ],
    },
  ],
})
