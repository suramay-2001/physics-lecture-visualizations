/**
 * Chapter Q25 glossary (Physics 709; P-Q25-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one
 * (`formal`, ≤ 40), paraphrased from Bergou Ch. 13. Ids start `qc-`. `introduces` marks the one notation entry: the Lamb-Dicke number (q25-phonons:b2), introduced by exactly one beat.
 *
 * Reused without a new entry here: hyperfine and rotating-wave (Spin Lab), qc-t1, qc-t2, qc-rabi-frequency, qc-ramsey-interferometry (Chapter Q24), qc-w-state (Chapter Q12), qubit, and the Optics Lab's qc-op-recoil, qc-op-optical-molasses and qc-op-doppler-limit (linked, not redefined).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-clock-state',
    term: 'clock state',
    gloss: 'A level whose energy hardly moves when the magnetic field wobbles.',
    formal: 'An $m = 0$ hyperfine level, which has no linear Zeeman shift (Bergou p. 227).',
    first: 'q25-cooling:b1',
  },
  {
    id: 'qc-optical-tweezer',
    term: 'optical tweezer',
    gloss: 'A tightly focused laser beam that holds one atom at its brightest spot.',
    formal: 'A red-detuned focused beam whose trap depth scales as $1/\\Delta$ and scattering as $1/\\Delta^2$ (Bergou p. 226).',
    first: 'q25-cooling:b6',
  },
  {
    id: 'qc-rearrangement',
    term: 'rearrangement',
    gloss: 'Photographing a half-full array and moving atoms to fill a block.',
    formal: 'Imaging the occupied sites and moving atoms or traps until a chosen region is fully occupied (Bergou p. 227).',
    first: 'q25-cooling:b6',
  },
  {
    id: 'qc-fluorescence-readout',
    term: 'fluorescence readout',
    gloss: 'Shining light that only one qubit state scatters, and counting the photons.',
    formal: 'Photon counting on a cycling transition with a threshold $n_c$ between the dark and bright histograms (Bergou p. 229).',
    first: 'q25-readout:b1',
    bridge: 'qc-f5-probability',
  },
  {
    id: 'qc-raman-transition',
    term: 'Raman transition',
    gloss: 'Two light beams that together move an atom between two levels through a third one.',
    formal: 'A two-photon transition of Rabi frequency $\\Omega_1^*\\Omega_2/2\\Delta$ through an intermediate level detuned by $\\Delta$ (Bergou p. 233).',
    first: 'q25-atom-gates:b2',
    bridge: 'qc-q24-lindblad',
  },
  {
    id: 'qc-rydberg-blockade',
    term: 'Rydberg blockade',
    gloss: 'One atom in a very high level stops its neighbour from joining it.',
    formal: 'At the radius $R_B$ where the interaction equals $\\hbar\\Omega$, only one of two atoms can be excited (Bergou p. 234).',
    first: 'q25-atom-gates:b3',
  },
  {
    id: 'qc-paul-trap',
    term: 'Paul trap',
    gloss: 'An ion trap that flips an electric saddle back and forth fast enough to hold the ion.',
    formal: 'A trap with potential $V_0\\cos\\omega_{\\rm rf}t$ whose motion is stable for $0 \\le \\tilde q \\le 0.908$ (Bergou p. 238).',
    first: 'q25-ion-trap:b2',
  },
  {
    id: 'qc-micromotion',
    term: 'micromotion',
    gloss: 'The fast small jiggle an ion makes at the trap’s drive frequency.',
    formal: 'The motion $\\zeta \\propto \\tilde q\\cos(\\omega_{\\rm rf}t)Z$ that rides on the slow macromotion $Z$ (Bergou p. 238).',
    first: 'q25-ion-trap:b3',
  },
  {
    id: 'qc-phonon',
    term: 'phonon',
    gloss: 'One quantum of an ion’s vibration.',
    formal: 'An excitation of a normal mode of the trapped ions, created by $\\hat a^\\dagger$, with energy $\\hbar\\omega_z$.',
    first: 'q25-phonons:b1',
  },
  {
    id: 'qc-sideband',
    term: 'sideband',
    gloss: 'A drive slightly above or below the qubit frequency that also changes the vibration.',
    formal: 'A drive at $\\omega_q \\mp \\omega_z$ that flips the spin and removes (red) or adds (blue) a phonon (Bergou p. 240).',
    first: 'q25-phonons:b1',
  },
  {
    id: 'qc-lamb-dicke',
    term: 'Lamb–Dicke number $\\eta$',
    gloss: 'How big the ion’s wobble is compared with the light’s wavelength.',
    formal: 'The number $\\eta_0 = kz_0 = \\sqrt{E_R/\\hbar\\omega_z}$ (Bergou p. 243).',
    first: 'q25-phonons:b2',
    introduces: 'notation',
    symbols: ['\\eta_0'],
  },
  {
    id: 'qc-sideband-cooling',
    term: 'sideband cooling',
    gloss: 'Removing vibration quanta one at a time with red-sideband pulses and decay.',
    formal: 'A red $\\pi$ pulse followed by spontaneous decay takes $|g,n\\rangle$ to $|g,n-1\\rangle$, down to $|g,0\\rangle$ (Bergou p. 243).',
    first: 'q25-phonons:b4',
  },
  {
    id: 'qc-cirac-zoller-gate',
    term: 'Cirac–Zoller gate',
    gloss: 'An ion gate that uses one shared vibration as a messenger and needs the ground state.',
    formal: 'A gate of sideband pulses through a phonon bus, which requires the motion to start in $n = 0$ (Bergou p. 244).',
    first: 'q25-ion-gates:b1',
    bridge: 'qc-q6-entangled',
  },
  {
    id: 'qc-molmer-sorensen-gate',
    term: 'Mølmer–Sørensen gate',
    gloss: 'An ion gate with two light colours whose strength does not depend on the vibration.',
    formal: 'A bichromatic drive with effective rate $\\tilde\\Omega = -(\\eta\\Omega)^2/(\\omega_z - \\delta)$, independent of $n$ (Bergou p. 245).',
    first: 'q25-ion-gates:b2',
  },
]
