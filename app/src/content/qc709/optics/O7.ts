/**
 * Optics Lab page O7: from vapour to a cold cloud (the experiment track, plan P-optics-experiment-track §2, rulings G1, G3, G5). A run sheet for one cesium tweezer-array
 * run: the order of the steps, the six-beam MOT filling, the polarization-gradient step. Numbers: keyed claims of O7.values.ts (numpy twin claims_optics/o_track.py);
 * values a paper prints are claims named `o7Rep…`, copied as printed and stated as reported. Source: Manetsch et al., arXiv:2403.12021v4, Methods p. 21 (Ext. Data Fig. 1c, p. 12).
 * Presets `mot-load` and `pgc-window`. Paraphrased; no text is copied from the paper.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, near } from './O7.values'

export const O7: Lecture = notesLecture({
  collection: 'optics',
  number: 7,
  title: 'From vapour to a cold cloud',
  book: 'Manetsch et al., a tweezer array of 6100 qubits, arXiv:2403.12021, Methods',
  topics: ['the order of one shot of the run', 'a magneto-optical trap filling from a vapour', 'a polarization-gradient step below the Doppler limit', 'what the numbers of the paper check'],
  length: 'full',
  symbols: {
    'I_0': 'o7-sequence:b2',
    '\\gamma': 'o7-sequence:b2',
    '\\lambda': 'o7-sequence:b2',
    '\\pi': 'o7-sequence:b2',
    'h': 'o7-sequence:b2',
    'c': 'o7-sequence:b2',
    'N': 'o7-mot:b1',
    'R': 'o7-mot:b1',
    '\\tau': 'o7-mot:b1',
    'e': 'o7-mot:b1',
    '\\delta': 'o7-mot:b2',
    '\\hbar': 'o7-mot:b2',
    'k': 'o7-mot:b2',
    'U_1': 'o7-pgc:b1',
    'C': 'o7-pgc:b1',
    't': 'o7-mot:b1',
    '\\mu': 'o7-mot:b2',
    'A': 'o7-mot:b2',
  },
  sections: [
    {
      id: 'o7-sequence',
      label: '§1',
      title: 'The order of one shot',
      pages: 'pp. 12–21',
      summary: 'One shot of the run is a short list of steps, and most of its time goes to cooling, cleaning up and imaging rather than to gates.',
      body: [
        {
          text: 'The run starts in a glass cell. A dispenser heated by a current feeds a two-dimensional trap, which pushes a slow beam of cesium into the cell. A modern array uses it instead of the oven and the slower of page O1, which is why the beam arrives already cold. Six crossed laser beams and a field gradient then make the three-dimensional [[qc-op-mot|magneto-optical trap]], and the tweezers are already on. Set the beams and the field, wait, and measure the fluorescence of the cloud (Manetsch et al., Methods, p. 21, and Ext. Data Fig. 1c, p. 12; <<qc-o-q25-cooling|the Q25 cooling unit>>).',
        },
        {
          text: `The printed order is short. The trap collects about ten million atoms in 100 ms. A step of polarization-gradient cooling then lasts 40 ms, followed by a wait of 40 ms for the leftover vapour to drop away. Imaging takes 80 ms. What goes wrong is the clock: one shot is ruled by cooling, clean-up and imaging, not by gates. That is our reading of the printed steps; the paper says itself that its clean-up is not optimised. The beams are set in units of the saturation intensity $I_0$, which for the stretched-state transition is $\\pi h c\\gamma/3\\lambda^3$ for linewidth $\\gamma$ and wavelength $\\lambda$.`,
        },
        {
          text: `How you know the formula is right: the paper prints $I_0$ as about ${d(V.o7RepIsat, 1)} mW/cm², and the formula with the stated cesium data gives ${d(V.o7IsatCs, 2)} mW/cm². The two numbers are side by side, as the paper's is a reported value and ours is computed; it is the same formula, so they should agree and they do (<<qc-q25-o2-limit|the Doppler-limit unit of O2>>).`,
          claims: [
            claim('o7IsatCs', 'the saturation intensity of the stretched-state transition of cesium is 1.10 mW/cm²', () => near(V.o7IsatCs, 1.1, 0.005)),
            claim('o7RepIsat', 'reported by Manetsch et al., p. 21: the saturation intensity is about 1.1 mW/cm²', () => near(V.o7RepIsat, 1.1, 1e-12)),
          ],
        },
        {
          text: 'Read the sequence as a budget of time and of heat. Every step that is not a gate is overhead that the atoms wait through, so the first question of a new run is which step is longest and whether it can be shortened. The cooling and the wait are fixed by the physics of the next two sections. The imaging is fixed by the count statistics of the last two pages of this track. The loading and the rearrangement of the middle pages decide how many atoms are left to compute with.',
        },
      ],
    },
    {
      id: 'o7-mot',
      label: '§2',
      title: 'Filling the trap',
      pages: 'p. 21',
      summary: 'The cloud grows by a balance of capture and loss, and the force law of page O5 turns the settings of the run into a spring, a damping and a size.',
      body: [
        {
          text: `The number of atoms follows a rate balance. Atoms are captured at a rate $R$ and lost with a time constant $\\tau$, so the number is $N(t)=R\\tau(1-e^{-t/\\tau})$. It rises to a steady state $R\\tau$, reaches ${d(V.o7Load2Tau, 3)} of it after two time constants, and 95 per cent of it after ${d(V.o7Load95, 2)} time constants. Set the rate and the time constant, measure the atoms against time, and know the fill is done by the clock. The [[qc-op-mot-loading|filling of the trap]] is the same as the charging of any leaky vessel (<<qc-q24-bloch-eq|the unit on where a driven, decaying system settles>>).`,
          claims: [
            claim('o7Load2Tau', 'at two time constants the cloud holds 0.865 of its steady state', () => near(V.o7Load2Tau, 0.865, 0.0005)),
            claim('o7Load95', 'the cloud reaches 95 per cent of its steady state after 3.00 time constants', () => near(V.o7Load95, 3.0, 0.005)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'motLoadFill', params: { tau: 100 } }, { fn: 'motLoadFill', params: { tau: 200 } }] },
            caption: 'The cloud as a share of its steady state against the loading time in milliseconds, for a time constant of 100 ms and one of 200 ms.',
          },
        },
        {
          text: `The settings come from the paper. The field gradient is 20 G/cm, the detuning is $\\delta=-${d(V.o7RepMotDetuning, 2)}\\gamma$, and the total intensity is ten times $I_0$ over six beams of ${d(V.o7RepBeamCm, 1)} cm, which we read as ten sixths of $I_0$ per beam. The force of page O5 gives a damping of ${d(V.o7MotBetaK2, 4)} in units of $\\hbar k^2$ for the wave number $k$, a natural frequency of ${d(V.o7MotOmegaHz, 0)} Hz, and a Zeeman half-size $\\hbar|\\delta|/\\mu' A$ of ${d(V.o7MotZeemanMm, 2)} mm (<<qc-q25-o5-dipole|the trap unit of O5>>). Wavelength, linewidth and mass of cesium are standard values (Steck, alkali D-line data; NIST), stated here as inputs. A beam of that width stops an atom of up to ${d(V.o7CaptureV, 1)} m/s.`,
          claims: [
            claim('o7MotBetaK2', 'the damping of the run’s trap is 0.0230 in units of ħk²', () => near(V.o7MotBetaK2, 0.023, 0.00005)),
            claim('o7MotOmegaHz', 'the natural frequency of the run’s trap is 190 Hz', () => near(V.o7MotOmegaHz, 190, 0.5)),
            claim('o7MotZeemanMm', 'the Zeeman half-size is 5.93 mm', () => near(V.o7MotZeemanMm, 5.93, 0.005)),
            claim('o7CaptureV', 'a 2.5 cm beam captures speeds up to 53.8 m/s', () => near(V.o7CaptureV, 53.8, 0.05)),
            claim('o7RepMotDetuning', 'reported by Manetsch et al., p. 21: the detuning of the trap is −3.17 linewidths', () => near(V.o7RepMotDetuning, 3.17, 1e-12)),
            claim('o7RepBeamCm', 'reported by Manetsch et al., p. 21: each beam is 2.5 cm in diameter', () => near(V.o7RepBeamCm, 2.5, 1e-12)),
          ],
        },
        {
          text: `What goes wrong is that the picture is too simple. The paper prints a cloud of about ${d(V.o7RepCloudMm, 1)} mm in 1/e² diameter, which is far below our Zeeman size, because the linear picture ignores the light that atoms scatter and push each other with. We print the two numbers side by side, one reported and one computed, with no verdict, and keep the linear picture only for the spring, the damping and the speeds. Try it. The bench draws the cloud filling, and the readouts give the steady state and the time to 95 per cent.`,
          claims: [claim('o7RepCloudMm', 'reported by Manetsch et al., p. 21: the cloud is about 1.6 mm in 1/e² diameter', () => near(V.o7RepCloudMm, 1.6, 1e-12))],
          widget: { kind: 'optics-bench', props: { preset: 'mot-load' }, caption: 'The filling of a magneto-optical trap against time.' },
        },
        {
          text: 'How you know the fill is done is the shape of the curve and not a fixed wait. The last few per cent of the steady state cost about as much time as the first ninety, so a run that waits long after three time constants gains little and loses clock. The loading rate and the time constant are two separate dials: the first sets how many atoms the cloud ends with, the second sets how fast it gets there. A hotter vapour or a larger beam raises the rate; a worse vacuum shortens the time constant and lowers the end point.',
        },
      ],
    },
    {
      id: 'o7-pgc',
      label: '§3',
      title: 'Below the Doppler limit, on purpose',
      pages: 'p. 21',
      summary: 'Turning off the field, raising the detuning and lowering the intensity let the polarization gradients cool the cloud far under the plain Doppler limit.',
      body: [
        {
          text: `After the loading the run switches off the field, lowers the intensity to seven times $I_0$ and moves the detuning to $-${d(V.o7RepPgcDetuning, 1)}\\gamma$ for 40 ms. Set those three dials and the polarization-gradient cooling of page O3 takes over. That page's model gives a scale and not a prediction. The light shift is $|U_1|=$ ${d(V.o7U1Pgc, 2)} µK. The limits for the two beam arrangements are ${d(V.o7TlimLin, 3)} µK for lin⊥lin light and ${d(V.o7TlimSig, 3)} µK for σ⁺σ⁻ light, from the coefficients $C$ of that page (<<qc-q25-o3-gradient|the polarization-gradient unit of O3>>; <<qc-o-q25-cooling|the Q25 cooling unit>>).`,
          claims: [
            claim('o7RepPgcDetuning', 'reported by Manetsch et al., p. 21: the detuning of the step is −19.5 linewidths', () => near(V.o7RepPgcDetuning, 19.5, 1e-12)),
            claim('o7U1Pgc', 'the light shift at the polarization-gradient step is 7.51 µK', () => near(V.o7U1Pgc, 7.51, 0.005)),
            claim('o7TlimLin', 'the lin⊥lin limit is 0.939 µK', () => near(V.o7TlimLin, 0.939, 0.0005)),
            claim('o7TlimSig', 'the σ⁺σ⁻ limit is 0.728 µK', () => near(V.o7TlimSig, 0.728, 0.0005)),
          ],
        },
        {
          text: `Why do it on purpose? At this detuning the plain Doppler theory would leave the cloud at ${d(V.o7DopplerPgcmK, 2)} mK, and the Doppler limit of cesium is ${d(V.o7DopplerOverTlim, 0)} times the lin⊥lin figure. What goes wrong is that no experiment reaches the model: the tweezers must be loaded from the cloud, the atoms heat in the trap, and the paper's own cold figures are far above one microkelvin. Our scale is lower than every measured value, and we print it so, with the note that the measured values include heating in the trap. Try it. Slide the detuning and the intensity.`,
          claims: [
            claim('o7DopplerPgcmK', 'the plain Doppler theory at the detuning of the step gives 2.45 mK', () => near(V.o7DopplerPgcmK, 2.45, 0.005)),
            claim('o7DopplerOverTlim', 'the Doppler limit of cesium is 134 times the lin⊥lin limit', () => near(V.o7DopplerOverTlim, 134, 0.5)),
          ],
          widget: { kind: 'optics-bench', props: { preset: 'pgc-window' }, caption: 'The sub-Doppler limit and the plain Doppler theory on cesium against the detuning.' },
        },
        {
          text: 'How you know the step worked is the next page: the atom that comes out of it is held in a tweezer, and its temperature then shows in the width of the Raman sidebands and in the loss of atoms. Every number above is a computed scale or a setting of the run; only the printed settings and the saturation intensity are reported values, and they are marked as such.',
        },
      ],
    },
  ],
})
