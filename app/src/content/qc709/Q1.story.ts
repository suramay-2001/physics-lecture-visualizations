/**
 * Chapter Q1 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q1-story.md §1, in both tracks,
 * with the judge's rulings (docs/roles/decisions/qc709-pilots.md, qc709-nc.md) and the Nielsen & Chuang addendum
 * (P-709-NC.md §4):
 *   - phase 'lecture' is what the 709 notes say (Lecture 1, 9/2, printed pp. 2–5; p. 7 previewed);
 *   - `q1-two-spots:b7` stays a beat, badged beyond the notes (ruling 8); the hydrogen beat follows it as b8;
 *   - the zero vector is written 0, with one notation note where it first appears (ruling 7, `q1-vector-space:b3`);
 *   - Q1 keeps the notes' axioms and conditions; Chapter F2 builds them (ruling 4, named in words: F2 is not written);
 *   - HW1 P2 guard (ruling 3): no beat tilts the middle magnet, plots a fraction against a tilt, or names a maximum;
 *   - N&C placement (§4.4): `q1-superposition` runs b1, b2, b4, b3, b5, b6, b7 and `q1-inner-product` b1–b5, b7, b6, b8
 *     of the plan, renumbered in their new order (ruling 4 of qc709-nc.md). Old → new: two-spots b8 → b9 (b8 is the new
 *     hydrogen beat); superposition b3 ↔ b4; inner-product b6 ↔ b7.
 *
 * Rules kept here (as in 448's story files):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come from
 *   Q1.values.ts, printed with d / tf / uf, and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Ground-up sentences ≤ 25 words, Formal ≤ 40; symbols defined before use in both tracks (content/symbols.test.ts).
 * - Bridges go only to built Spin Lab units; a 709 chapter that is not written (F1 is built in parallel, F2, Q2, Q3,
 *   Q6) is named in words.
 */
import { URL } from '../refs'
import type { AmplitudesState, Beat, HilbertPlaneState, LabBench, LabDevice, LabState, OperatorState, Ref, StageKind, TermTarget } from '../schema'
import type { Anchor } from '../stageVocab'
import { V, claim, close, d, tf, uf } from './Q1.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const lab = (benches: LabState['benches'], extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches, ...extra })
const main = (source: LabBench['source'], devices: LabDevice[], extra: Omit<LabBench, 'id' | 'source' | 'devices'> = {}): LabBench => ({ id: 'main', source, devices, ...extra })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
const ops = (s: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', shot: 'O-STD', ...s })
const amp = (s: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', shot: 'A-BARS', ...s })
const sweep = (from: number, to: number) => ({ from, to })

const Z: LabDevice = { axis: 'z' }
const Zp: LabDevice = { axis: 'z', keep: '+' }
const X: LabDevice = { axis: 'x' }
const Xp: LabDevice = { axis: 'x', keep: '+' }
const zBasis = [
  { ket: '+z' as const, role: 'basis' as const },
  { ket: '-z' as const, role: 'basis' as const },
]
const oven = (extra: Omit<LabState, 'kind' | 'benches'> = {}) => lab([main('oven', [Z])], extra)

const notes = (where: string, adds: string): Ref => ({ source: 'lecture', where, adds })
const nc = (where: string, adds: string): Ref => ({ source: 'nc', where, adds })
const bergou = (where: string, adds: string): Ref => ({ source: 'bergou', where, adds })
const axler = (where: string, adds: string): Ref => ({ source: 'axler', where, adds })

/* claims shared by more than one beat */
const cMuB = claim('q1MuB', 'μ_B = 9.274 × 10⁻²⁴ J/T (the engine’s SILVER.muB)', () => close(V.q1MuB, 9.2740100783, 1e-9))
const cDefl = claim('q1Defl', 'Δz at the magnet’s exit = 0.105 mm (1000 T/m, 3.5 cm, 550 m/s)', () => close(V.q1Defl, 0.5 * V.q1Accel * 1e4 * (V.q1Flight * 1e-6) ** 2 * 1000, 1e-12))
const cDeflG2 = claim('q1DeflG2', 'doubling the gradient: Δz = 0.210 mm', () => close(V.q1DeflG2, 2 * V.q1Defl, 1e-12))
const cZxz = claim('q1Zxz', 'oven → z(+) → x(+) → z: ⅛ of the oven in each spot, ½ and ¼ blocked', () => close(V.q1Zxz, 1 / 8) && close(V.q1ZxzBlocked1, 1 / 2) && close(V.q1ZxzBlocked2, 1 / 4))
const cLenSqrt2 = claim('q1LenSqrt2', '|+z⟩ + |−z⟩ has length √2 = 1.414', () => close(V.q1LenSqrt2, Math.SQRT2))
const cPX = claim('q1PX', 'P(+z) = P(−z) = ½ for |+x⟩', () => close(V.q1PX, 0.5))

/* ---------------------------------------------------------------------------------------------- */
/* q1-two-spots — Two spots from a lopsided magnet                                                */
/* ---------------------------------------------------------------------------------------------- */

const twoSpots: Beat[] = [
  {
    id: 'q1-two-spots:b1',
    phase: 'lecture',
    text: 'In the [[qc-stern-gerlach|Stern–Gerlach experiment]] of 1921–22, a furnace heated silver, and a thin beam of its atoms flew through a magnet. One pole is {{knife|sharp}} and the other grooved, so the field is lopsided: strongest near the sharp pole. The atoms land on a glass plate.',
    formal:
      'A collimated beam of Ag atoms from an oven crosses an inhomogeneous [[magnetic-field|field]] $\\vec B(\\vec r)$, where $\\vec r$ is the position, with a large gradient $\\partial B_z/\\partial z$ of its $z$ component $B_z$ near the {{knife|knife-edge pole}} (notes p. 2, Fig. 1). The atoms deposit on a plate, which records each deflection.',
    caption: 'furnace → lopsided magnet → plate',
    captionFormal: 'oven → SG$_z$ (inhomogeneous $\\vec B$) → plate',
    stage: oven({ deposit: 'clear', shot: 'L-EST', beamTo: 'gap' }),
    terms: { knife: t('lab-r3', 'knife-edge') },
  },
  {
    id: 'q1-two-spots:b2',
    phase: 'lecture',
    text: 'Each silver atom acts like a tiny bar magnet with a strength and a direction: its [[qc-magnetic-moment|magnetic moment]] $\\vec\\mu$. Call its up–down part $\\mu_z$, and the field’s up–down strength $B_z$. Then the atom’s energy is $E = -\\mu_z B_z$, lowest when the magnet lines up with the field. Spin Lab starts the same way: <<qc-l1-quantized|two spots, not a smear>>.',
    formal:
      'A [[qc-magnetic-moment|magnetic moment]] $\\vec\\mu$ in a field $\\vec B$ has energy $E = -\\vec\\mu\\cdot\\vec B$ (notes p. 2); for a field along $z$, $E = -\\mu_z B_z$. Silver has 47 electrons, yet its net angular momentum comes from a single one, so $\\vec\\mu$ is that electron’s spin moment.',
    caption: 'one atom’s {{moment|moment}}, drawn as a small arrow',
    captionFormal: '$E = -\\vec\\mu\\cdot\\vec B$',
    stage: oven({ shot: 'L-DETAIL' }),
    terms: { moment: t('lab-r3', 'atom-moment') },
  },
  {
    id: 'q1-two-spots:b3',
    phase: 'lecture',
    text: 'A ball rolls toward lower energy, and the push equals the downhill slope of its energy. Suppose $B_z$ grows by $G$ tesla for every metre up; that rate is the [[qc-field-gradient|field gradient]]. Then $E$ changes by $-\\mu_z G$ per metre, so the push up is $F_z = \\mu_z G$.',
    formal:
      'The force is $\\vec F = -\\nabla E = \\nabla(\\vec\\mu\\cdot\\vec B)$. For a field along $z$ that varies with height, this gives $F_z = -\\partial E/\\partial z = \\mu_z\\,\\partial B_z/\\partial z$ (notes p. 2). A uniform field exerts a torque but no net force.',
    caption: `a moment of $${d(V.q1MuB)} \\times 10^{-24}$ J/T in a gradient of 1000 T/m: a push of $${d(V.q1Force, 2)} \\times 10^{-21}$ N`,
    captionFormal: `$F_z = \\mu_z\\,\\partial B_z/\\partial z$: for a silver atom in 1000 T/m, $${d(V.q1Force, 2)} \\times 10^{-21}$ N gives $${d(V.q1Accel, 2)} \\times 10^{4}$ m/s²`,
    derivation: {
      result: 'F_z = \\mu_z G',
      ground: [
        { tex: 'B_z(z) = B_0 + G z', why: 'The field grows by $G$ tesla for each metre up; $B_0$ is its value at height 0.' },
        { tex: 'E(z) = -\\mu_z B_z(z) = -\\mu_z B_0 - \\mu_z G z', why: 'The energy at height $z$, from $E = -\\mu_z B_z$.' },
        { tex: '\\text{slope of } E = -\\mu_z G', why: 'Each metre up changes the energy by the number in front of $z$.' },
        { tex: 'F_z = -(\\text{slope of } E)', why: 'Test it on gravity: energy mgh rises by mg per metre, and gravity pulls down with mg, so a push is minus the slope.' },
        {
          tex: 'F_z = -(-\\mu_z G) = \\mu_z G',
          why: 'Two minus signs cancel. A positive $\\mu_z$ is pushed toward the stronger field, a negative one toward the weaker.',
        },
      ],
      formal: [
        { tex: '\\vec F = -\\nabla E = \\nabla(\\vec\\mu\\cdot\\vec B)', why: 'The force is conservative, from $E = -\\vec\\mu\\cdot\\vec B$ with $\\vec\\mu$ held fixed.' },
        {
          tex: 'F_z = -\\frac{\\partial E}{\\partial z} = \\mu_z\\frac{\\partial B_z}{\\partial z} \\equiv \\mu_z G',
          why: 'For a field along $z$ that depends on height, the transverse terms average out (explained below); $G$ names the gradient.',
        },
      ],
    },
    stage: oven({ shot: 'L-END' }),
    claims: [
      cMuB,
      claim('q1Force', 'F_z = μ_B × 1000 T/m = 9.27 × 10⁻²¹ N', () => close(V.q1Force, V.q1MuB, 1e-12)),
      claim('q1Accel', 'a = F_z/m_Ag = 5.18 × 10⁴ m/s²', () => close(V.q1Accel * 1e4 * V.q1Mass * 1e-25, V.q1Force * 1e-21, 1e-30)),
    ],
  },
  {
    id: 'q1-two-spots:b4',
    phase: 'lecture',
    text: 'Classically, each atom’s magnet points in a random direction, so $\\mu_z$ could be anything from $-\\mu$ to $+\\mu$, where $\\mu$ is the moment’s full strength. The push, and so the landing height $\\Delta z$, is proportional to $\\mu_z$. The plate should show one continuous smear, from $-\\Delta$ to $+\\Delta$, where $\\Delta$ is the height for $\\mu_z = \\mu$.',
    formal:
      'For isotropic classical moments, $\\mu_z = \\mu\\cos\\theta_\\mu$, with $\\theta_\\mu$ the moment’s angle from the $z$ axis, spreads continuously over $[-\\mu, \\mu]$. Since the deflection $\\Delta z$ is proportional to $\\mu_z$, the plate would show a filled band from $-\\Delta$ to $\\Delta$, with $\\Delta$ the deflection for $\\mu_z = \\mu$ (notes Fig. 1, the classical prediction).',
    caption: 'classical prediction: one smear from top to bottom',
    captionFormal: '$\\Delta z = \\frac{\\mu_z}{2m}\\frac{\\partial B_z}{\\partial z}\\left(\\frac{L}{v}\\right)^2 \\propto \\mu_z$',
    derivation: {
      result: '\\mu_z = \\pm\\mu \\;\\Rightarrow\\; \\Delta z = \\pm\\Delta',
      ground: [
        { tex: 'a = \\frac{F_z}{m} = \\frac{\\mu_z G}{m}', why: 'Newton’s second law: $m$ is the atom’s mass and $a$ its acceleration.' },
        { tex: 't = \\frac{L}{v}', why: 'The time $t$ inside a magnet of length $L$, at speed $v$.' },
        { tex: '\\Delta z = \\tfrac12 a t^2', why: 'A steady sideways push, starting from rest, moves the atom this far in time $t$.' },
        { tex: '\\Delta z = \\tfrac12\\,\\frac{\\mu_z G}{m}\\left(\\frac{L}{v}\\right)^2', why: 'Put steps 1 and 2 into step 3.' },
        { tex: '\\Delta z \\propto \\mu_z', why: 'Every other quantity is the same for every atom in the beam.' },
        {
          tex: '-\\mu \\le \\mu_z \\le \\mu \\;\\Rightarrow\\; -\\Delta \\le \\Delta z \\le \\Delta',
          why: 'A continuous spread of $\\mu_z$ fills a continuous band of heights; $\\Delta$ is the largest one.',
        },
        { tex: '\\mu_z = \\pm\\mu \\;\\Rightarrow\\; \\Delta z = \\pm\\Delta', why: 'Two values of $\\mu_z$ make exactly two spots.' },
      ],
      formal: [
        {
          tex: '\\Delta z = \\frac{\\mu_z}{2m}\\frac{\\partial B_z}{\\partial z}\\left(\\frac{L}{v}\\right)^2\\left(1 + \\frac{2D}{L}\\right)',
          why: 'A parabola inside a magnet of length $L$, crossed at speed $v$ by an atom of mass $m$, then a straight drift $D$ to the plate ($D = 0$ here).',
        },
        {
          tex: '\\operatorname{spec}\\mu_z = \\{\\pm\\mu\\} \\;\\Rightarrow\\; \\Delta z = \\pm\\Delta',
          why: 'The plate maps $\\mu_z$ linearly, so its lines count the eigenvalues; $\\Delta$ is the deflection for $\\mu_z = \\mu$.',
        },
      ],
    },
    stage: oven({ model: 'classical', ghostBand: true, deposit: 'clear', shot: 'L-OTS' }),
    claims: [claim('q1DeflHalf', 'halving μ_z halves Δz (the ½ in ½at²; Δz ∝ μ_z)', () => close(V.q1DeflHalf, 0.5))],
  },
  {
    id: 'q1-two-spots:b5',
    phase: 'lecture',
    text: 'The plate shows two narrow spots and nothing between them. So $\\mu_z$ takes only two values, equal in size and opposite in sign, one per spot: the {{up|upper}} and the {{down|lower}}. A quantity that comes only in separate values is [[qc-quantized|quantized]].',
    formal:
      'The beam splits into two lines, so $\\mu_z$ has two eigenvalues $\\pm\\mu$: the [[qc-spin|spin]]’s $z$ component is [[qc-quantized|quantized]], $S_z = \\pm\\hbar/2$, where [[qc-hbar|$\\hbar$]] is the reduced Planck constant (notes p. 2). The oven feeds each line {{up|half}} of the atoms.',
    caption: 'half of the atoms in each spot',
    captionFormal: `each spot gets [[probability|probability]] $P(\\pm) = ${tf(V.q1OvenZ)}$ from the oven; spots at $\\pm ${d(V.q1Defl)}$ mm (1000 T/m, 35 mm, 550 m/s)`,
    stage: oven({ ghostBand: true, readouts: ['fractions'], shot: 'L-PLATE' }),
    terms: { up: t('lab-r3', 'spot-plus'), down: t('lab-r3', 'spot-minus') },
    // the ghost band puts its +μ end over the + spot; for silver the moment points against the spin (review item 1)
    fidelity: ['lab-moment-opposite'],
    claims: [claim('q1OvenZ', 'the oven feeds each spot of one z magnet ½', () => close(V.q1OvenZ, 0.5)), cDefl],
  },
  {
    id: 'q1-two-spots:b6',
    phase: 'lecture',
    text: `Each value’s size is set by a natural unit, the [[qc-bohr-magneton|Bohr magneton]] $\\mu_B = ${d(V.q1MuB)} \\times 10^{-24}$ joules per tesla. It is built from the electron’s charge $e$ (not Euler’s number), its mass $m_e$, and the constant [[qc-hbar|h-bar]] $\\hbar$: $\\mu_B = e\\hbar/2m_e$. For silver the tiny magnet points against the [[qc-spin|spin]], so which spot holds spin $+\\hbar/2$ depends on which way the field grows. The bench paints the + spot on top.`,
    formal: `The moment is $\\mu_z = -g\\mu_B S_z/\\hbar$, with the [[qc-g-factor|g-factor]] $g \\approx 2$ and the [[qc-bohr-magneton|Bohr magneton]] $\\mu_B = e\\hbar/2m_e = ${d(V.q1MuB)} \\times 10^{-24}$ J/T, for electron charge $e$ and mass $m_e$. That is the SI form; the notes’ extra speed-of-light factor belongs to Gaussian units. For $S_z = \\pm\\hbar/2$, $\\mu_z \\approx \\mp\\mu_B$: the moment points against the spin (see the errata).`,
    caption: `$\\mu_B = e\\hbar/2m_e = ${d(V.q1MuB)} \\times 10^{-24}$ J/T`,
    captionFormal: 'which spot is “up” depends on the sign of the gradient',
    stage: oven({ shot: 'L-PLATE' }),
    fidelity: ['lab-moment-opposite'],
    claims: [cMuB],
  },
  {
    id: 'q1-two-spots:b7',
    phase: 'books',
    text: 'A real magnet cannot make a field that changes only along $z$: its field lines must also bend sideways. The sideways pushes average away, because each atom’s magnet [[qc-precession|precesses]] quickly about the strong field, like a tilted top.',
    formal:
      'Since $\\nabla\\cdot\\vec B = 0$, $\\partial B_x/\\partial x + \\partial B_y/\\partial y = -\\partial B_z/\\partial z \\ne 0$, where $B_x, B_y$ are the transverse components, so $\\vec F$ has transverse parts too. The moment [[qc-precession|precesses]] about the large $B_z$ at the Larmor rate $\\omega_L = g\\mu_B B/\\hbar$ in a field of size $B$, many turns per flight, so the averages $\\langle\\mu_x\\rangle$ and $\\langle\\mu_y\\rangle$ of its transverse parts vanish.',
    caption: 'field lines bend sideways too; only the up–down push adds up',
    captionFormal: `the flight through the magnet lasts ${d(V.q1Flight, 1)} µs, many precession turns`,
    stage: oven({ shot: 'L-END' }),
    fidelity: ['lab-field-qualitative'],
    beyondLecture: true,
    refs: [
      {
        source: 'mit805',
        where: 'Lecture 3; notes “Spin one-half, bras, kets, and operators”, §1',
        adds: 'Why only the up–down force survives: the sideways field gradients are real, but the moment’s fast precession averages their pushes to zero.',
        url: URL.mit805(3),
      },
    ],
    claims: [claim('q1Flight', 'the flight through a 3.5 cm magnet at 550 m/s lasts 63.6 µs', () => close(V.q1Flight, (0.035 / 550) * 1e6))],
  },
  {
    id: 'q1-two-spots:b8',
    phase: 'books',
    text: 'Nielsen and Chuang tell the story with hydrogen, measured in 1927. In its lowest state, the electron’s motion about the nucleus makes no magnet at all, so without spin the beam would pass straight through. It still splits into two spots. So the electron itself carries a tiny magnet: its spin. The bench here still draws silver.',
    formal:
      'Ground-state hydrogen has zero orbital angular momentum, yet its beam splits in two (N&C §1.5.1). The doubling is the electron’s spin, $S_z = \\pm\\hbar/2$, as for silver’s single outer (5s) electron. When N&C call the upper beam $|{+Z}\\rangle$ they name a beam, not the sign of $S_z$. The bench still draws silver.',
    caption: 'hydrogen or silver: two spots either way',
    captionFormal: 'two lines: $S_z = \\pm\\hbar/2$',
    // no ghost band: this beat's text never predicts a smear (review item 4)
    stage: oven({ readouts: ['fractions'], shot: 'L-PLATE' }),
    fidelity: ['qc-lab-silver-not-hydrogen', 'lab-moment-opposite'],
    refs: [nc('§1.5.1, pp. 43–44', 'The 1927 hydrogen version: an atom with no orbital magnetism still makes two spots, so the two values belong to the electron’s spin.')],
  },
  {
    id: 'q1-two-spots:b9',
    phase: 'clue',
    text: 'Make the field twice as lopsided. Do the spots move apart, and do more spots appear?',
    formal: 'Double $\\partial B_z/\\partial z$. What happens to the splitting, and to the number of lines?',
    caption: 'the same bench, drawn with half the split so that a doubling fits (not to scale)',
    captionFormal: 'the same SG$_z$, drawn at half the split so that a doubled one fits on the plate (schematic)',
    stage: oven({ readouts: ['fractions'], gradientScale: 0.5, shot: 'L-PLATE' }),
    reveal: {
      text: 'The spots move twice as far apart, because the push doubles. But there are still exactly two. The field sets how hard each value is pushed, not how many values $\\mu_z$ can take.',
      formal: `$\\Delta z$ is linear in $\\partial B_z/\\partial z$, so the splitting doubles (${d(V.q1Defl)} → ${d(V.q1DeflG2)} mm). The number of lines is the number of eigenvalues of $\\mu_z$, a property of the atom, not of the magnet.`,
      caption: `spot height: ${d(V.q1Defl)} mm → ${d(V.q1DeflG2)} mm; still two spots`,
      stage: oven({ readouts: ['fractions'], gradientScale: 1, shot: 'L-PLATE' }),
      claims: [cDefl, cDeflG2, claim('q1DeflRatio', 'Δz is linear in the gradient: doubling it doubles Δz', () => close(V.q1DeflRatio, 2))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q1-sequences — A second magnet can erase the first                                             */
/* ---------------------------------------------------------------------------------------------- */

const sequences: Beat[] = [
  {
    id: 'q1-sequences:b1',
    phase: 'lecture',
    text: 'Put magnets in a row: a [[qc-sequential-measurement|sequential measurement]]. {{stop|Block}} the beam that feeds the − spot of the first $z$ magnet. Every atom that passes has spin up along $z$; call its state $|{+z}\\rangle$, read “ket plus z”. The blocked atoms would be $|{-z}\\rangle$. The notes write this filter as $\\widehat{\\mathrm{SG}}_{z+}$.',
    formal:
      'In a [[qc-sequential-measurement|sequential measurement]], selecting one output of SG$_z$ prepares the state $|{+z}\\rangle$, meaning $S_z = +\\hbar/2$; for silver the notes’ “moment up” is the opposite state (see the errata). The notes call this filter $\\widehat{\\mathrm{SG}}_{z\\pm}$ (p. 2) and the blocked state $|{-z}\\rangle$.',
    caption: 'the kept beam: every atom in $|{+z}\\rangle$',
    captionFormal:
      'Rosetta: notes $\\widehat{\\mathrm{SG}}_{z\\pm}$ = z magnet keeping ±; notes “screen” = plate; Bergou $|0\\rangle = |{+z}\\rangle$; the notes’ zero vector $|0\\rangle$ is written 0 here',
    stage: lab([main('oven', [Zp, Z])], { readouts: ['blocked'], shot: 'L-TRACK' }),
    terms: { stop: t('lab-r3', 'beam-stop') },
    claims: [
      claim('q1OvenZZ', 'oven → z(+) → z: ½ reach the plate, all in the + spot; ½ blocked', () => close(V.q1OvenZZ, 0.5)),
    ],
  },
  {
    id: 'q1-sequences:b2',
    phase: 'lecture',
    text: 'Send the $|{+z}\\rangle$ atoms through a second $z$ magnet. All of them land in the + spot again. Measuring the same thing twice gives the same answer.',
    formal:
      'Repeated measurement reproduces its result, $\\widehat{\\mathrm{SG}}_{z\\pm}|{\\pm z}\\rangle = |{\\pm z}\\rangle$ (notes p. 2), and the filter removes the other state: $\\widehat{\\mathrm{SG}}_{z+}|{-z}\\rangle = 0$, the [[qc-zero-vector|zero vector]] of Unit 1.4. The filter acts as the projector $P = |{+z}\\rangle\\langle{+z}|$, with $P^2 = P$: <<qc-l4-projectors|a projector asks a yes/no question>>.',
    caption: 'second plate: every atom in the + spot',
    captionFormal: '$P^2 = P$, $P|{-z}\\rangle = 0$',
    stage: lab([main('oven', [Zp, Z])], { readouts: ['fractions'], shot: 'L-PLATE' }),
    claims: [
      claim('q1Repeat', '|+z⟩ into a z magnet: every atom in the + spot', () => close(V.q1Repeat, 1)),
      claim('q1ProjIdem', 'the projector |+z⟩⟨+z| squares to itself', () => V.q1ProjIdem === 1),
    ],
  },
  {
    id: 'q1-sequences:b3',
    phase: 'lecture',
    text: 'Now turn the second magnet by 90°, so it sorts along $x$. Classically, a magnet pointing straight up has no sideways part, so the $x$ magnet should not push it: one spot in the middle. Instead the $|{+z}\\rangle$ atoms split again, half each way, into the states $|{+x}\\rangle$ and $|{-x}\\rangle$.',
    formal: `SG$_{z+}$ → SG$_{x\\pm}$ yields $|{\\pm x}\\rangle$, each with probability ${uf(V.q1ZthenX)} (notes p. 3). A classical moment along $+z$ has $\\mu_x = 0$ and would cross SG$_x$ undeflected (N&C, p. 44); two equal lines appear instead. Knowing $S_z$ exactly tells nothing about $S_x$, the spin along $x$.`,
    caption: '$|{+z}\\rangle$ into an $x$ magnet: half and half (classically, one spot in the middle)',
    captionFormal: '$|{+z}\\rangle$ into SG$_x$: half and half, where a classical moment would give one undeflected line',
    stage: lab([main('+z', [X], { showPrep: true })], { readouts: ['fractions'], shot: 'L-3Q' }),
    refs: [nc('p. 44; Fig. 1.23, p. 45', 'The classical expectation for this bench: a moment pointing along $+z$ has no $x$ part, so an $x$ magnet should leave one central spot.')],
    claims: [claim('q1ZthenX', '|+z⟩ into an x magnet: ½ each way', () => close(V.q1ZthenX, 0.5))],
  },
  {
    id: 'q1-sequences:b4',
    phase: 'lecture',
    text: 'Maybe each atom now carries two [[qc-hidden-label|hidden labels]], one for $z$ and one for $x$; the notes write $|{+z}; {\\pm x}\\rangle$. If so, a third magnet along $z$ should send every atom to the + spot, since all of them were $+z$. Spin Lab tests the same guess in <<qc-l1-quantized|its first unit>>.',
    formal:
      'Hypothesis (notes p. 3): after SG$_{z+}$ → SG$_{x+}$ the atoms carry joint definite values, $|{+z}; {+x}\\rangle$, a [[qc-hidden-label|hidden-label]] model. It predicts that a final SG$_z$ yields only $+z$.',
    caption: 'the two-label guess: every atom in the + spot at the end',
    captionFormal: 'hidden-label model: $P(+z) = 1$',
    // the guess, not the run: no deposit, so no sampled tally or Born % beside "P(+z) = 1" (review item 3)
    stage: lab([main('oven', [Zp, Xp, Z])], { model: 'hidden-label', deposit: 'clear', shot: 'L-WIDE' }),
  },
  {
    id: 'q1-sequences:b5',
    phase: 'lecture',
    text: 'The third magnet finds both $z$ results again, half + and half −. Passing the $x$ magnet wiped out the $z$ answer the atoms had. Starting from the furnace, one atom in eight reaches each spot.',
    formal: `Observed: SG$_{z+}$ → SG$_{x+}$ → SG$_{z\\pm}$ yields both $|{\\pm z}\\rangle$ with probability ${uf(V.q1XZ)} each among the atoms that reach it (notes p. 3); from the oven, ${uf(V.q1Zxz)} per spot, with ${uf(V.q1ZxzBlocked1)} and ${uf(V.q1ZxzBlocked2)} blocked. The label hypothesis fails: <<qc-l1-sequential|a new axis erases the old answer>>.`,
    caption: `plate: ${uf(V.q1Zxz)} of the furnace’s atoms in each spot`,
    captionFormal: `blocked ${uf(V.q1ZxzBlocked1)} and ${uf(V.q1ZxzBlocked2)}; plate ${uf(V.q1Zxz)} and ${uf(V.q1Zxz)}`,
    stage: lab([main('oven', [Zp, Xp, Z])], { readouts: ['fractions', 'blocked'], shot: 'L-WIDE' }),
    claims: [
      cZxz,
      claim('q1XZ', '|+x⟩ into a z magnet: ½ each way', () => close(V.q1XZ, 0.5)),
      claim('q1ZxzBlocked1', 'the first magnet blocks ½ of the oven', () => close(V.q1ZxzBlocked1, 0.5)),
      claim('q1ZxzBlocked2', 'the x magnet blocks ¼ of the oven', () => close(V.q1ZxzBlocked2, 0.25)),
    ],
  },
  {
    id: 'q1-sequences:b6',
    phase: 'lecture',
    text: 'The notes sum it up: a second measurement can destroy the state the first one prepared. Each magnet leaves the atom in its own outcome’s state, so the last magnet decides the state. The [[qc-superposition|superposition principle]] of Unit 1.3 explains the half-and-half splits.',
    formal:
      'An $S_x$ measurement leaves $|{\\pm x}\\rangle$ whatever the earlier $S_z$ result. Here $[S_z, S_x] = iS_y$, with $i$ the [[imaginary-unit|imaginary unit]] and $S_y$ the spin along $y$ (ħ = 1). A common eigenstate would be an eigenstate of $iS_y$ with eigenvalue zero, and $iS_y$ has none, so there is no common eigenstate: <<qc-l7-compatible|compatible measurements share a basis and commute>>. Chapter Q3 makes this precise. The notes’ “only a single measurement” is reworded (see the errata); the [[qc-superposition|superposition principle]] of Unit 1.3 accounts for the statistics.',
    caption: 'each magnet resets the state it measures',
    captionFormal: '$[S_z, S_x] = iS_y$',
    stage: lab([main('oven', [Zp, Xp, Z])], { flow: 'single', shot: 'L-TRACK' }),
    claims: [
      claim('q1Commutator', '[S_z, S_x] = i S_y (ħ = 1)', () => V.q1Commutator === 1),
      claim('q1SyNoZero', 'S_y has no zero eigenvalue (±½), so neither has i S_y', () => V.q1SyNoZero === 1),
    ],
  },
  {
    id: 'q1-sequences:b7',
    phase: 'clue',
    text: 'Replace the middle $x$ magnet by another $z$ magnet that keeps the + beam. What does the last $z$ magnet show now?',
    formal: 'Replace SG$_{x+}$ by SG$_{z+}$. What does the final SG$_z$ record, and why does the order of axes matter?',
    // the question shows no plate result before "Show me" (review item 3)
    stage: lab([main('oven', [Zp, Zp, Z])], { deposit: 'clear', beamTo: 'gap', shot: 'L-WIDE' }),
    reveal: {
      text: 'Every atom lands in the + spot, as with the second magnet earlier. A magnet along the same axis only repeats the answer; only a new axis erases it. The order and the axes both matter.',
      formal: `SG$_{z+}$ → SG$_{z+}$ → SG$_z$ gives $P(+z) = 1$ at the plate (${uf(V.q1Zzz)} of the oven): repeated compatible measurements agree. Erasure needs a noncommuting observable in between: <<qc-l7-order|swapping the order of two measurements>>.`,
      caption: `z, z, z: every plate atom in the + spot (${uf(V.q1Zzz)} of the furnace’s atoms)`,
      stage: lab([main('oven', [Zp, Zp, Z])], { readouts: ['fractions'], shot: 'L-WIDE' }),
      claims: [claim('q1Zzz', 'oven → z(+) → z(+) → z: ½ of the oven, all in the + spot', () => close(V.q1Zzz, 0.5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q1-superposition — Adding states: the superposition principle                                  */
/* ---------------------------------------------------------------------------------------------- */

const superposition: Beat[] = [
  {
    id: 'q1-superposition:b1',
    phase: 'lecture',
    text: 'Quantum physics writes a system’s state as a [[qc-ket|ket]], such as $|\\psi\\rangle$ ($\\psi$ is the Greek letter psi). The name comes from “bracket”: a bra and a ket will fit together in Unit 1.5. A ket holds everything that can be predicted about the system. The picture also gives $|{+z}\\rangle$ and $|{-z}\\rangle$ their quantum-computing names, $|0\\rangle$ and $|1\\rangle$.',
    formal:
      'The state is a vector $|\\psi\\rangle$ in [[qc-dirac-notation|Dirac notation]] (notes p. 3). The notes postulate that kets form a linear [[qc-vector-space|vector space]] with an [[qc-inner-product|inner product]], which sets lengths and angles: a [[qc-hilbert-space|Hilbert space]]. The plane labels its axes $|0\\rangle \\equiv |{+z}\\rangle$ and $|1\\rangle \\equiv |{-z}\\rangle$.',
    caption: 'the kets $|{+z}\\rangle$ and $|{-z}\\rangle$, drawn as perpendicular arrows',
    captionFormal: '$\\langle{+z}|{-z}\\rangle = 0$',
    stage: plane({ others: zBasis, rightAngle: true }),
    claims: [claim('q1ZOrth', '⟨+z|−z⟩ = 0', () => close(V.q1ZOrth, 0))],
  },
  {
    id: 'q1-superposition:b2',
    phase: 'lecture',
    text: 'The [[qc-superposition|superposition principle]]: whenever $|\\psi_1\\rangle$ and $|\\psi_2\\rangle$ are possible states of a system, so is $c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle$. Here $c_1$ and $c_2$ are numbers, and they may be complex (Chapter F1). Spin Lab draws <<qc-l1-vectors|states as arrows>> the same way.',
    formal:
      'For states $|\\psi_1\\rangle, |\\psi_2\\rangle$ and complex $c_1, c_2$ with a nonzero sum, $|\\Psi\\rangle = c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle$ is again a state once [[qc-normalized|normalized]] (notes p. 3). Iterating, $d_1|\\Psi\\rangle + d_2|\\psi_3\\rangle$ is a state too, for a third state $|\\psi_3\\rangle$ and complex $d_1, d_2$.',
    caption: 'turning the arrow mixes $|{+z}\\rangle$ and $|{-z}\\rangle$ in every proportion',
    captionFormal: '$|\\psi(\\vartheta)\\rangle = \\cos\\vartheta\\,|{+z}\\rangle + \\sin\\vartheta\\,|{-z}\\rangle$ for plane angles $0 \\le \\vartheta \\le 90^\\circ$',
    stage: plane({ psi: { planeDeg: sweep(0, 90) }, basis: 'z', shadows: true }),
    claims: [claim('q1ShadowsSum', 'the two squared shadows add to 1 at every angle', () => close(V.q1ShadowsSum, 1))],
  },
  {
    // plan b4 (N&C §4.4: the complex coefficients come before the books beat on the third magnet; the Born rule is tagged here)
    id: 'q1-superposition:b3',
    phase: 'lecture',
    text: `The numbers $c_1, c_2$ may be complex. For example, $|{+y}\\rangle = (|{+z}\\rangle + i|{-z}\\rangle)/\\sqrt2$ is also a state, the one along $+y$; $i$ is the [[imaginary-unit|imaginary unit]]. An outcome’s chance is its number’s size, squared: the [[qc-born-rule|Born rule]]. Here $|i/\\sqrt2|^2 = ${tf(V.q1PY)}$, so the chances along $z$ are ${uf(V.q1PY)} and ${uf(V.q1PY)}.`,
    formal: `Complex coefficients are essential: $|{+y}\\rangle = (|{+z}\\rangle + i|{-z}\\rangle)/\\sqrt2$ has $|c_2|^2 = ${tf(V.q1PY)}$ by the [[qc-born-rule|Born rule]], yet it is not $|{+x}\\rangle$: the two differ by the [[relative-phase|relative phase]] $i$, a quarter turn (Chapter F1). See <<qc-l2-plus-y|real numbers cannot make +y>>.`,
    caption: `$|{+y}\\rangle$: amplitudes ${d(V.q1AmpY)} and ${d(V.q1AmpY)}$i$`,
    captionFormal: '$|{+y}\\rangle \\ne |{+x}\\rangle$ as rays',
    stage: amp({ state: { dir: '+y' }, labels: 'spin', dials: true }),
    claims: [
      claim('q1PY', 'P(−z) = ½ for |+y⟩', () => close(V.q1PY, 0.5)),
      claim('q1AmpY', 'the |−z⟩ amplitude of |+y⟩ is 0.707 i', () => close(V.q1AmpY, Math.SQRT1_2)),
      claim('q1YnotX', '|+y⟩ and |+x⟩ are different states', () => V.q1YnotX === 0),
    ],
  },
  {
    // plan b3 (books: the notes' p. 7 x states, previewed here)
    id: 'q1-superposition:b4',
    phase: 'books',
    text: `The $|{+x}\\rangle$ atoms of Unit 1.2 are an equal superposition: $|{+x}\\rangle = (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$. By the Born rule, each outcome along $z$ has chance $P = (1/\\sqrt2)^2 = ${tf(V.q1PX)}$. That is the half-and-half split the third magnet showed. Write $P(+, +, \\pm)$ for the chance that a furnace atom passes both + filters and lands in the ± spot.`,
    formal: `With $|{+x}\\rangle = (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$ (notes p. 7, derived in Chapter Q2) and $P(\\pm z) = |\\langle{\\pm z}|{+x}\\rangle|^2 = ${tf(V.q1PX)}$, the z–x–z statistics follow: probabilities multiply along a path through the bench, written $P(+, +, \\pm)$ for the outcomes +, + and then ±.`,
    caption: `each shadow is $1/\\sqrt2 = ${d(V.q1AmpX)}$; squared, ${uf(V.q1PX)}`,
    captionFormal: `$|\\langle{\\pm z}|{+x}\\rangle|^2 = ${tf(V.q1PX)}$`,
    derivation: {
      result: `P(+, +, \\pm) = ${tf(V.q1Zxz)}`,
      ground: [
        { tex: '|{+x}\\rangle = \\tfrac{1}{\\sqrt2}|{+z}\\rangle + \\tfrac{1}{\\sqrt2}|{-z}\\rangle', why: 'The $x$-up state as an equal mix of $z$-up and $z$-down (notes p. 7).' },
        { tex: 'P = |\\text{its number}|^2', why: 'The Born rule: a chance $P$ is a number’s size, squared.' },
        { tex: `P(+z) = \\left(\\tfrac{1}{\\sqrt2}\\right)^2 = ${tf(V.q1PX)}`, why: 'The number in front of $|{+z}\\rangle$, squared.' },
        { tex: `P(-z) = \\left(\\tfrac{1}{\\sqrt2}\\right)^2 = ${tf(V.q1PMinusX)}`, why: 'The number in front of $|{-z}\\rangle$, squared.' },
        {
          tex: `P(+, +, \\pm) = ${tf(V.q1OvenZ)} \\times ${tf(V.q1ZthenX)} \\times ${tf(V.q1PX)} = ${tf(V.q1Zxz)}`,
          why: 'From the furnace: half pass the first magnet, half of those pass the $x$ magnet, and half of those land in each spot.',
        },
      ],
      formal: [
        { tex: `P(\\pm z \\mid {+x}) = |\\langle{\\pm z}|{+x}\\rangle|^2 = ${tf(V.q1PX)}`, why: 'The Born rule, with the $x$ states of notes p. 7.' },
        {
          tex: `P(+, +, \\pm) = ${tf(V.q1OvenZ)}\\cdot${tf(V.q1ZthenX)}\\cdot${tf(V.q1PX)} = ${tf(V.q1Zxz)}`,
          why: 'Probabilities multiply along a path of state updates.',
        },
      ],
    },
    stage: plane({ psi: '+x', basis: 'z', shadows: true, ticks: true }),
    refs: [
      notes('p. 7', 'The $x$ states as sums of the $z$ states, previewed here; Chapter Q2 derives them.'),
      nc('p. 45', 'The same cascade, with the $z$ magnet reading one pair of states and the $x$ magnet the other, so each split gives ½.'),
      nc('Ex. 2.57, p. 86', 'Two measurements in a row act as one combined measurement: the chained probabilities used here.'),
    ],
    claims: [
      cPX,
      claim('q1PMinusX', 'P(+z) = P(−z) = ½ for |−x⟩ too', () => close(V.q1PMinusX, 0.5)),
      claim('q1AmpX', 'each amplitude of |+x⟩ along z has size 1/√2 = 0.707', () => close(V.q1AmpX, Math.SQRT1_2)),
      claim('q1SeqZ', '|+z⟩ through x then z: each of the four sign paths has probability ¼', () => close(V.q1SeqZ, 0.25)),
      cZxz,
    ],
  },
  {
    id: 'q1-superposition:b5',
    phase: 'books',
    text: `Bergou writes the same idea for a [[qubit|qubit]]: $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$, with complex amplitudes $\\alpha$ and $\\beta$ (§1.1, pp. 1–2). A bit is either 0 or 1; a qubit can be any such combination. This course sets $|0\\rangle = |{+z}\\rangle$ and $|1\\rangle = |{-z}\\rangle$.`,
    formal:
      'Bergou §1.1, eqs. 1.1–1.2, pp. 1–2: a [[qubit|qubit]] is a two-level system in the state $\\alpha|0\\rangle + \\beta|1\\rangle$, with complex $\\alpha, \\beta$ and $|\\alpha|^2 + |\\beta|^2 = 1$. The course locks $|0\\rangle \\equiv |{+z}\\rangle$, the north pole. N&C assign the same labels when they model the cascade: $|{+Z}\\rangle \\leftarrow |0\\rangle$ and $|{-Z}\\rangle \\leftarrow |1\\rangle$ (p. 45).',
    caption: `at 30° in this plane: $\\alpha = ${d(V.q1Alpha30)}$, $\\beta = ${d(V.q1Beta30, 1)}$, chances ${d(V.q1Qubit30, 2)} and ${d(V.q1Qubit30Minus, 2)}`,
    captionFormal: '$|0\\rangle \\equiv |{+z}\\rangle$, $|1\\rangle \\equiv |{-z}\\rangle$',
    stage: plane({ psi: { planeDeg: 30 }, basis: 'z', shadows: true }),
    refs: [
      bergou('§1.1, eq. (1.1), p. 1; eq. (1.2), p. 2', 'A qubit is any two-level quantum system (p. 1); its state is a complex combination of the two basis states, of length 1 (p. 2).'),
      nc('pp. 45, xxix', 'The same assignment of labels: the $z$ beams become the qubit’s basis states, and the notation table makes $|0\\rangle$ the up state along $z$.'),
    ],
    claims: [
      claim('q1Qubit30', 'at 30° in the plane, P(0) = 0.75', () => close(V.q1Qubit30, 0.75)),
      claim('q1Qubit30Minus', 'at 30° in the plane, P(1) = 0.25', () => close(V.q1Qubit30Minus, 0.25)),
      claim('q1Alpha30', 'at 30°, α = cos 30° = 0.866', () => close(V.q1Alpha30, Math.cos(Math.PI / 6))),
      claim('q1Beta30', 'at 30°, β = sin 30° = 0.5', () => close(V.q1Beta30, 0.5)),
      claim('q1ZeroIsUp', 'the engine’s qubit |0⟩ is 448’s |+z⟩', () => V.q1ZeroIsUp === 1),
    ],
  },
  {
    id: 'q1-superposition:b6',
    phase: 'clue',
    text: 'Is $(|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$ just a beam in which half the atoms are $|{+z}\\rangle$ and half are $|{-z}\\rangle$?',
    formal: 'Can the superposition $|{+x}\\rangle$ be told apart from a 50/50 [[qc-mixture|mixture]] of $|{+z}\\rangle$ and $|{-z}\\rangle$?',
    stage: lab(
      [
        { id: 'A', source: '+x', devices: [Z] },
        { id: 'B', source: 'oven', devices: [Z] },
      ],
      { readouts: ['fractions'], shot: 'L-3Q' },
    ),
    fidelity: ['lab-prepared-offstage'],
    claims: [
      claim('q1SupZ', '|+x⟩ into a z magnet: ½ up', () => close(V.q1SupZ, 0.5)),
      claim('q1MixZ', 'the oven (a 50/50 mixture) into a z magnet: ½ up', () => close(V.q1MixZ, 0.5)),
    ],
    reveal: {
      text: 'No: they differ. Along $z$ both split half and half. Along $x$ the superposition goes up every time, while the half-and-half beam still splits 50/50, like the furnace’s [[qc-mixture|mixture]].',
      formal: `Along $z$ both give ${uf(V.q1SupZ)}, ${uf(V.q1MixZ)}; along $x$, $|{+x}\\rangle$ gives $P(+x) = 1$ while the mixture gives ${uf(V.q1MixX)}. A superposition carries a definite [[relative-phase|relative phase]] that a mixture lacks: <<qc-l6-mixture|superposition or mixture?>>. Chapter Q6 turns this into the density matrix.`,
      caption: 'top: the superposition, all up; bottom: the half-and-half beam, split',
      captionFormal: `$P(+x)$: 1 vs ${d(V.q1MixX, 1)}`,
      stage: lab(
        [
          { id: 'A', source: '+x', devices: [X] },
          { id: 'B', source: 'oven', devices: [X] },
        ],
        { readouts: ['fractions'], shot: 'L-3Q' },
      ),
      fidelity: ['lab-prepared-offstage'],
      claims: [
        claim('q1SupX', '|+x⟩ into an x magnet: every atom up', () => close(V.q1SupX, 1)),
        claim('q1MixX', 'the oven into an x magnet: ½ up', () => close(V.q1MixX, 0.5)),
      ],
    },
  },
  {
    id: 'q1-superposition:b7',
    phase: 'clue',
    text: 'Take $c_1 = 1$, $c_2 = -1$ and $|\\psi_1\\rangle = |\\psi_2\\rangle = |{+z}\\rangle$. Is $c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle$ a state?',
    formal: 'Does the superposition principle admit every linear combination, including $|{+z}\\rangle - |{+z}\\rangle$?',
    stage: plane({ psi: '+z', others: [{ ket: { neg: '+z' }, role: 'ghost', badge: '−|+z⟩' }] }),
    reveal: {
      text: `No. It is the zero vector, with length 0, and nothing can rescale it to length 1. Other sums need rescaling too: $|{+z}\\rangle + |{-z}\\rangle$ has length $\\sqrt2 = ${d(V.q1LenSqrt2)}$, so we divide by $\\sqrt2$.`,
      formal:
        'The zero vector is not a state: states are nonzero vectors up to scale (rays, Chapter F1). The principle holds for combinations with a nonzero sum, followed by normalization; $|{+z}\\rangle + |{-z}\\rangle$ has length $\\sqrt2$.',
      caption: `$|{+z}\\rangle - |{+z}\\rangle = 0$ (the zero vector, Unit 1.4); $|{+z}\\rangle + |{-z}\\rangle$ has length ${d(V.q1LenSqrt2)}`,
      stage: plane({ psi: '+x', others: zBasis, ticks: true }),
      claims: [claim('q1ZeroSum', '|+z⟩ − |+z⟩ has length 0', () => close(V.q1ZeroSum, 0)), cLenSqrt2],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q1-vector-space — The rules for adding and scaling kets                                        */
/* ---------------------------------------------------------------------------------------------- */

const NOT_STATES = ['qc-plane-vectors-not-states']

const vectorSpace: Beat[] = [
  {
    id: 'q1-vector-space:b1',
    phase: 'lecture',
    text: 'A [[qc-vector-space|vector space]] is a collection of objects, called vectors, that can be added and multiplied by numbers. The numbers are called [[qc-scalar|scalars]]; they are real (the set ℝ) or complex (the set ℂ). Arrows in a flat plane are the first example. Chapter F2 builds these rules from the ground up.',
    formal:
      'A vector space $V(F)$ over a field $F$, ℝ or ℂ, is a set with an addition of vectors and a multiplication by [[qc-scalar|scalars]], obeying the rules below (notes pp. 3–4; Axler, p. 12). The notes name vectors $|\\alpha\\rangle, |\\beta\\rangle, |\\gamma\\rangle$; from here on those letters label vectors, not amplitudes. Spin Lab: <<qc-l2-vector-space|kets add and scale like vectors>>.',
    caption: `two arrows and their sum, the notes’ Fig. 2: the sum is ${d(V.q1Fig2Sum)} long`,
    captionFormal: `$|\\alpha\\rangle + |\\beta\\rangle$ is the diagonal of the parallelogram, of length ${d(V.q1Fig2Sum)}`,
    stage: plane({ sumOf: [{ planeDeg: 15 }, { planeDeg: 60 }] }),
    fidelity: NOT_STATES,
    claims: [claim('q1Fig2Sum', 'the unit arrows at 15° and 60° add to length 1.848 = 2 cos 22.5°', () => close(V.q1Fig2Sum, 2 * Math.cos(Math.PI / 8)))],
  },
  {
    id: 'q1-vector-space:b2',
    phase: 'lecture',
    text: 'Call two vectors $|\\alpha\\rangle$ and $|\\beta\\rangle$. Adding them gives another vector in the same set; that is [[qc-closure|closure]]. The order does not matter, $|\\alpha\\rangle + |\\beta\\rangle = |\\beta\\rangle + |\\alpha\\rangle$: both paths round the parallelogram reach the same corner. Grouping a third vector $|\\gamma\\rangle$ in does not matter either.',
    formal:
      '[[qc-closure|Closure]], $|\\alpha\\rangle + |\\beta\\rangle \\in V$; commutativity; associativity, $(|\\alpha\\rangle + |\\beta\\rangle) + |\\gamma\\rangle = |\\alpha\\rangle + (|\\beta\\rangle + |\\gamma\\rangle)$ (notes pp. 3–4). The dashed sides of Fig. 2 are the two summands, translated.',
    caption: '$|\\alpha\\rangle$ then $|\\beta\\rangle$, or the other way round: the same corner',
    captionFormal: 'commutativity is the parallelogram',
    stage: plane({ sumOf: [{ planeDeg: 15 }, { planeDeg: 60 }] }),
    fidelity: NOT_STATES,
    claims: [claim('q1Commute', 'the two arrows add to the same vector in either order', () => V.q1Commute === 1)],
  },
  {
    id: 'q1-vector-space:b3',
    phase: 'lecture',
    text: 'There is a [[qc-zero-vector|zero vector]], written 0, that changes nothing when added. Every vector $|\\alpha\\rangle$ has an [[qc-additive-inverse|opposite]] $-|\\alpha\\rangle$, and the two add to 0. The notes write the zero vector as $|0\\rangle$; here it is 0, because $|0\\rangle$ is the qubit state $|{+z}\\rangle$.',
    formal:
      'There is an additive identity, the [[qc-zero-vector|zero vector]] 0, and an [[qc-additive-inverse|inverse]] $-|\\alpha\\rangle$ with $|\\alpha\\rangle + (-|\\alpha\\rangle) = 0$ (notes p. 4). Their uniqueness, which the notes assume, follows from the rules (Axler, pp. 14–15). Notation: the notes’ $|0\\rangle$ is written 0 here, since $|0\\rangle \\equiv |{+z}\\rangle$; N&C make the same exception (p. 62).',
    caption: 'an arrow and its opposite add to the zero vector',
    captionFormal: 'the zero vector has length 0; the qubit state $|0\\rangle = |{+z}\\rangle$ has length 1',
    stage: plane({ others: [{ ket: '+x', role: 'second', badge: '|α⟩' }, { ket: { neg: '+x' }, role: 'ghost', badge: '−|α⟩' }] }),
    fidelity: NOT_STATES,
    claims: [
      claim('q1Inverse', 'a vector plus its opposite has length 0', () => close(V.q1Inverse, 0)),
      claim('q1KetZeroNotZero', 'the qubit state |0⟩ has length 1', () => close(V.q1KetZeroNotZero, 1)),
    ],
  },
  {
    id: 'q1-vector-space:b4',
    phase: 'lecture',
    text: 'Scaling spreads over sums: $(c_1 + c_2)(|\\alpha\\rangle + |\\beta\\rangle) = c_1|\\alpha\\rangle + c_1|\\beta\\rangle + c_2|\\alpha\\rangle + c_2|\\beta\\rangle$. Scaling by a number $b$ and then by a number $a$ is scaling once by $ab$. One more rule is needed that the notes leave out: $1|\\alpha\\rangle = |\\alpha\\rangle$.',
    formal:
      'The notes list a combined distributive law and $a(b|\\gamma\\rangle) = (ab)|\\gamma\\rangle$, but not $1|\\alpha\\rangle = |\\alpha\\rangle$ (Axler, p. 12). Only with that rule does the combined law give the two distributive laws, $a(|\\alpha\\rangle + |\\beta\\rangle) = a|\\alpha\\rangle + a|\\beta\\rangle$ and $(a + b)|\\alpha\\rangle = a|\\alpha\\rangle + b|\\alpha\\rangle$. Without it, the scaling $c|\\alpha\\rangle = 0$ for every scalar $c$ obeys every listed rule (see the errata).',
    caption: '×2 then ×3 is the same as ×6',
    captionFormal: 'the “lazy” scaling $c|\\alpha\\rangle = 0$ passes every listed rule but fails $1|\\alpha\\rangle = |\\alpha\\rangle$',
    // no image readout: it covered the passport, and "eigenvector" is not a Q1 word (review item 10)
    stage: plane({ psi: { planeDeg: 30 }, image: { matrix: [['6', '0'], ['0', '6']], label: '$6|\\psi\\rangle$', readout: false } }),
    fidelity: NOT_STATES,
    claims: [
      claim('q1ScaleTwice', 'scaling by 2 then 3 equals scaling by 6', () => V.q1ScaleTwice === 1),
      claim('q1Lazy', 'the lazy scaling obeys the notes’ two scaling rules and fails 1·v = v', () => V.q1Lazy === 1),
    ],
  },
  {
    id: 'q1-vector-space:b5',
    phase: 'lecture',
    text: 'Lists of $n$ real numbers form a vector space, written $V^n(\\text{ℝ})$; lists of $n$ complex numbers form $V^n(\\text{ℂ})$. [[qc-polynomial-space|Polynomials]] of degree at most $n$ also qualify: add them term by term. A qubit’s kets live in $V^2(\\text{ℂ})$.',
    formal:
      'Examples (notes p. 4): $V^n(\\text{ℝ}) = \\text{ℝ}^n$ and $V^n(\\text{ℂ}) = \\text{ℂ}^n$ for a whole number $n$, and the [[qc-polynomial-space|real polynomials]] of degree at most $n$, written $\\mathcal P_n(\\text{ℝ})$ (Axler, p. 31). That is a function space, identified with $\\text{ℝ}^{n+1}$ through its coefficients.',
    caption: `$(1 + 2x) + (x - x^2) = 1 + ${d(V.q1PolySum, 0)}x - x^2$`,
    captionFormal: `coefficients $(1, 2, 0) + (0, 1, -1) = (1, ${d(V.q1PolySum, 0)}, -1)$`,
    stage: plane({ psi: { planeDeg: 30 } }),
    fidelity: NOT_STATES,
    claims: [claim('q1PolySum', '(1 + 2x) + (x − x²) = 1 + 3x − x²', () => close(V.q1PolySum, 3))],
  },
  {
    id: 'q1-vector-space:b6',
    phase: 'clue',
    text: 'Do the polynomials of degree exactly 2, such as $x^2 + 1$, form a vector space?',
    formal: 'Do the real polynomials of degree exactly 2 form a subspace of the polynomials?',
    stage: plane({ psi: { planeDeg: 30 } }),
    reveal: {
      text: 'No. $x^2 + x$ and $-x^2 + 1$ both have degree 2, but their sum $x + 1$ has degree 1. So adding can leave the set, and the zero polynomial is missing too. “Degree at most 2” fixes both problems.',
      formal: 'No: the set is not closed under addition, $(x^2 + x) + (-x^2 + 1) = x + 1$, and it lacks 0. So the notes’ “nth order polynomials” must mean degree at most $n$ (see the errata; Axler, p. 31).',
      caption: `coefficients $(0, 1, 1) + (1, 0, -1) = (1, 1, ${d(V.q1Degree, 0)})$: the $x^2$ term cancels`,
      claims: [claim('q1Degree', '(x² + x) + (−x² + 1) has no x² term', () => close(V.q1Degree, 0))],
    },
  },
  {
    id: 'q1-vector-space:b7',
    phase: 'clue',
    text: 'States have length 1. Do the states by themselves form a vector space?',
    formal: 'Is the set of unit vectors, the states, a subspace of $V^2(\\text{ℂ})$?',
    stage: plane({ psi: '+x', others: zBasis }),
    reveal: {
      text: `No. $|{+z}\\rangle + |{-z}\\rangle$ has length ${d(V.q1LenSqrt2)}, and 0 times a state is the zero vector, of length 0. The vector space holds all the vectors; the states are its length-1 members.`,
      formal: 'No: it is closed under neither addition ($|{+z}\\rangle + |{-z}\\rangle$ has length $\\sqrt2$) nor scaling, and it misses 0. The superposition principle works in the space $V$ and then normalizes.',
      caption: `sum of two states: length ${d(V.q1LenSqrt2)}, not 1`,
      stage: plane({ psi: '+x', sumOf: ['+z', '-z'] }),
      fidelity: NOT_STATES,
      claims: [cLenSqrt2],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q1-inner-product — Lengths and angles for complex vectors                                      */
/* ---------------------------------------------------------------------------------------------- */

const innerProduct: Beat[] = [
  {
    id: 'q1-inner-product:b1',
    phase: 'lecture',
    text: 'Each ket $|\\psi\\rangle$ has a partner, the [[qc-bra|bra]] $\\langle\\psi|$. Written as lists, the ket is a column and its bra is a row of the [[complex-conjugate|conjugated]] numbers (Chapter F1). A bra and a ket side by side make one number, $\\langle\\chi|\\psi\\rangle$, where $|\\chi\\rangle$ (chi) is another state. Spin Lab starts the same way: <<qc-l2-inner-product|overlap gives coordinates>>.',
    formal:
      'A [[qc-dual-space|dual]] correspondence sends each ket $|\\psi\\rangle$ to a [[qc-bra|bra]] $\\langle\\psi|$ (notes p. 4); it is antilinear, so $c|\\psi\\rangle$ goes to $c^*\\langle\\psi|$. In $\\text{ℂ}^n$, $\\langle\\beta| = \\beta^\\dagger$, the conjugate transpose, so $\\langle\\beta|\\alpha\\rangle = \\beta^\\dagger\\alpha$.',
    caption: 'ket: a column; bra: a row of the mirrored numbers',
    captionFormal: '$\\langle{+y}| = (1, -i)/\\sqrt2$',
    stage: plane({ psi: '+x', others: zBasis }),
    claims: [claim('q1BraY', '⟨+y|+y⟩ = 1 with the conjugated row', () => close(V.q1BraY, 1))],
  },
  {
    id: 'q1-inner-product:b2',
    phase: 'lecture',
    text: 'An [[qc-inner-product|inner product]] must obey four rules. $\\langle\\beta|\\beta\\rangle$ is real and never negative, and it is 0 only for the zero vector. Swapping sides gives the conjugate: $\\langle\\alpha|\\beta\\rangle = \\langle\\beta|\\alpha\\rangle^*$. And it is linear in the ket.',
    formal:
      'The rules (notes p. 4): positivity, definiteness, [[qc-conjugate-symmetry|conjugate symmetry]], and linearity in the second slot, $\\langle\\alpha|c_1\\beta + c_2\\gamma\\rangle = c_1\\langle\\alpha|\\beta\\rangle + c_2\\langle\\alpha|\\gamma\\rangle$. The notes’ fifth rule follows (next step), and the product is [[qc-sesquilinear|sesquilinear]], not bilinear (see the errata). N&C pack the same content into three axioms (p. 65).',
    caption: 'four rules for measuring overlap',
    captionFormal: 'sesquilinear: linear in the ket, conjugate-linear in the bra',
    stage: plane({ psi: { planeDeg: 30 }, basis: 'z', shadows: true }),
  },
  {
    id: 'q1-inner-product:b3',
    phase: 'lecture',
    text: 'Why is the bra side conjugated? Scale $|\\beta\\rangle$ by a number $c$. Swap the two sides, pull $c$ out of the ket side, then swap back. Each swap adds a star, and $c$ keeps one: $\\langle c\\beta|\\alpha\\rangle = c^*\\langle\\beta|\\alpha\\rangle$.',
    formal:
      '$\\langle c\\beta|\\alpha\\rangle = \\langle\\alpha|c\\beta\\rangle^* = (c\\langle\\alpha|\\beta\\rangle)^* = c^*\\langle\\alpha|\\beta\\rangle^* = c^*\\langle\\beta|\\alpha\\rangle$, by conjugate symmetry twice and $(zw)^* = z^*w^*$ for complex $z, w$ (Chapter F1). This is N&C ⚑ Exercise 2.6.',
    caption: `$c = 2 + i$, $|\\beta\\rangle = |{+y}\\rangle$, $|\\alpha\\rangle = |{+z}\\rangle$: $\\langle c\\beta|\\alpha\\rangle = (2 - i)\\langle\\beta|\\alpha\\rangle = ${d(V.q1ConjLinRe)} - ${d(V.q1ConjLinMinusIm)}i$`,
    derivation: {
      result: '\\langle c_1\\beta + c_2\\gamma|\\alpha\\rangle = c_1^*\\langle\\beta|\\alpha\\rangle + c_2^*\\langle\\gamma|\\alpha\\rangle',
      ground: [
        { tex: '\\langle c\\beta|\\alpha\\rangle = \\langle\\alpha|c\\beta\\rangle^*', why: 'The swap rule: exchanging the two sides conjugates the result.' },
        { tex: '\\langle\\alpha|c\\beta\\rangle = c\\,\\langle\\alpha|\\beta\\rangle', why: 'Linear in the ket: a number comes out of the ket side unchanged.' },
        { tex: '\\langle c\\beta|\\alpha\\rangle = (c\\,\\langle\\alpha|\\beta\\rangle)^*', why: 'Put step 2 into step 1.' },
        { tex: '(zw)^* = z^*w^*', why: 'For any two complex numbers $z$ and $w$, mirroring a product mirrors each factor (Chapter F1).' },
        { tex: '\\langle c\\beta|\\alpha\\rangle = c^*\\,\\langle\\alpha|\\beta\\rangle^*', why: 'Apply step 4 to step 3.' },
        { tex: '\\langle\\alpha|\\beta\\rangle^* = \\langle\\beta|\\alpha\\rangle', why: 'The swap rule again.' },
        { tex: '\\langle c\\beta|\\alpha\\rangle = c^*\\,\\langle\\beta|\\alpha\\rangle', why: 'Put step 6 into step 5.' },
        {
          tex: '\\langle c_1\\beta + c_2\\gamma|\\alpha\\rangle = c_1^*\\langle\\beta|\\alpha\\rangle + c_2^*\\langle\\gamma|\\alpha\\rangle',
          why: 'The same steps work for a sum: the ket side is linear in sums too, and mirroring a sum mirrors each term, $(z + w)^* = z^* + w^*$.',
        },
      ],
      formal: [
        { tex: '\\langle c_1\\beta + c_2\\gamma|\\alpha\\rangle = \\langle\\alpha|c_1\\beta + c_2\\gamma\\rangle^*', why: 'Conjugate symmetry.' },
        { tex: '= (c_1\\langle\\alpha|\\beta\\rangle + c_2\\langle\\alpha|\\gamma\\rangle)^*', why: 'Linearity in the second slot.' },
        { tex: '= c_1^*\\langle\\beta|\\alpha\\rangle + c_2^*\\langle\\gamma|\\alpha\\rangle', why: 'Conjugation is additive and multiplicative; then conjugate symmetry once more.' },
      ],
    },
    stage: plane({ psi: '+z', others: [{ ket: '-z', role: 'basis' }] }),
    claims: [
      claim('q1ConjLinRe', 'Re⟨(2 + i)(+y)|+z⟩ = 1.414', () => close(V.q1ConjLinRe, Math.SQRT2)),
      claim('q1ConjLinMinusIm', 'Im⟨(2 + i)(+y)|+z⟩ = −0.707, the same as (2 − i)⟨+y|+z⟩', () => close(V.q1ConjLinMinusIm, Math.SQRT1_2)),
    ],
  },
  {
    id: 'q1-inner-product:b4',
    phase: 'lecture',
    text: `For lists of real numbers the inner product is the dot product: multiply matching entries and add. For complex lists, conjugate the bra’s entries first: with entries $a_1, a_2$ of $\\alpha$ and $b_1, b_2$ of $\\beta$, $\\langle\\beta|\\alpha\\rangle = b_1^*a_1 + b_2^*a_2$. The length, or [[qc-norm|norm]], is $|\\alpha| = \\sqrt{\\langle\\alpha|\\alpha\\rangle}$; for $(3, 4i)$ it is ${d(V.q1Len34i, 0)}. Chapter F2 builds this from the law of cosines.`,
    formal: `In $V^n(\\text{ℝ})$, $\\langle\\beta|\\alpha\\rangle = \\beta^T\\alpha = \\sum_i b_ia_i$, with $\\beta^T$ the transposed row; in $V^n(\\text{ℂ})$, $\\langle\\beta|\\alpha\\rangle = \\beta^\\dagger\\alpha = \\sum_i b_i^*a_i$, with $a_i, b_i$ the components (notes p. 5). The [[qc-norm|norm]] is $|\\alpha| = \\sqrt{\\langle\\alpha|\\alpha\\rangle}$. Without the conjugate, $(3, 4i)$ would give $9 - 16 = ${d(V.q1Bilinear34i, 0)}$.`,
    caption: `$(3, 4i)$: $9 + 16 = ${d(V.q1Norm34i, 0)}$, length ${d(V.q1Len34i, 0)}; without the conjugate, $${d(V.q1Bilinear34i, 0)}$`,
    captionFormal: `the inner product gives ${d(V.q1Norm34i, 0)}; the bilinear form gives $${d(V.q1Bilinear34i, 0)}$`,
    stage: plane({ psi: { planeDeg: 53.13 }, others: zBasis, shadows: true }),
    fidelity: ['plane-real-slice'],
    claims: [
      claim('q1Dot', '(1, 2)·(3, −1) = 1', () => close(V.q1Dot, 1)),
      claim('q1Norm34i', '⟨(3, 4i)|(3, 4i)⟩ = 25', () => close(V.q1Norm34i, 25)),
      claim('q1Len34i', '(3, 4i) has length 5', () => close(V.q1Len34i, 5)),
      claim('q1Bilinear34i', 'without the conjugate, (3, 4i) gives −7', () => close(V.q1Bilinear34i, -7)),
    ],
  },
  {
    id: 'q1-inner-product:b5',
    phase: 'lecture',
    text: `The dot product is not the only choice. Put a square table of numbers $M$ between the row and the column: $\\langle\\beta|\\alpha\\rangle_M = \\beta^\\dagger M\\alpha$, where $\\beta^\\dagger$ is the conjugated row. This is a [[qc-weighted-inner-product|weighted inner product]]. It is fair only if $\\langle\\alpha|\\alpha\\rangle_M > 0$ for every nonzero $\\alpha$. The picture sums $M$ up as a number $a_0$ on the gauge and an arrow $\\vec a$. It also lists the two [[eigenvalue|stretch factors]] $\\lambda$ of $M$, here ${d(V.q1MEigHigh, 0)} and ${d(V.q1MEigLow, 0)}.`,
    formal:
      'The form $\\langle\\beta|\\alpha\\rangle_M = \\beta^\\dagger M\\alpha$ is an inner product exactly when $M$ is [[qc-hermitian-matrix|Hermitian]], $M_{ij} = M_{ji}^*$, with positive eigenvalues (notes p. 5; Axler, p. 184, for diagonal $M$). Example: $M = \\begin{pmatrix}2 & i\\\\ -i & 2\\end{pmatrix} = 2I - \\sigma_y$, with $I$ the identity and $\\sigma_y$ that Pauli matrix, has eigenvalues 1 and 3.',
    caption: `$\\alpha = (1, -i)$: $\\langle\\alpha|\\alpha\\rangle_M = ${d(V.q1MNorm1mi, 0)}$`,
    captionFormal: `eigenvalues of $M$: ${d(V.q1MEigLow, 0)}, ${d(V.q1MEigHigh, 0)}; $\\langle\\alpha|\\alpha\\rangle_M$ = ${d(V.q1MNorm10, 0)}, ${d(V.q1MNorm1i, 0)}, ${d(V.q1MNorm1mi, 0)} for $(1, 0), (1, i), (1, -i)$`,
    stage: ops({ op: { matrix: [['2', 'i'], ['-i', '2']] }, eigen: true, labels: 'plain' }),
    claims: [
      claim('q1MHerm', 'M = 2I − σ_y is Hermitian', () => V.q1MHerm === 1),
      claim('q1MEigLow', 'the smaller eigenvalue of M is 1', () => close(V.q1MEigLow, 1)),
      claim('q1MEigHigh', 'the larger eigenvalue of M is 3', () => close(V.q1MEigHigh, 3)),
      claim('q1MNorm10', '⟨(1, 0)|(1, 0)⟩_M = 2', () => close(V.q1MNorm10, 2)),
      claim('q1MNorm1i', '⟨(1, i)|(1, i)⟩_M = 2', () => close(V.q1MNorm1i, 2)),
      claim('q1MNorm1mi', '⟨(1, −i)|(1, −i)⟩_M = 6', () => close(V.q1MNorm1mi, 6)),
    ],
  },
  {
    // plan b7 (N&C §4.4: the notes' Fig. 3 before the books beat on Axler)
    id: 'q1-inner-product:b6',
    phase: 'lecture',
    text: 'For real arrows the inner product has a picture. From the tip of $|\\beta\\rangle$, drop a line at right angles onto the line of $|\\alpha\\rangle$. The [[qc-projection|shadow]] it marks has length $\\langle\\alpha|\\beta\\rangle/|\\alpha| = |\\beta|\\cos\\theta$, with $\\theta$ the angle between the arrows. It is zero exactly when they are at right angles. Chapter F2 proves this picture.',
    formal:
      'For real vectors $\\langle\\alpha|\\beta\\rangle = |\\alpha||\\beta|\\cos\\theta$, with $\\theta$ the angle between them, so $\\langle\\alpha|\\beta\\rangle/|\\alpha|$ is the signed length of the [[orthogonal|orthogonal]] [[qc-projection|projection]] of $\\beta$ onto $\\alpha$ (notes p. 5, Fig. 3). For complex vectors it holds only with $\\operatorname{Re}\\langle\\alpha|\\beta\\rangle$ (see the errata).',
    caption: `shadow of $|{+x}\\rangle$ on $|{+z}\\rangle$: $\\cos 45^\\circ = ${d(V.q1Shadow)}$`,
    captionFormal: `$\\langle{+z}|{+x}\\rangle = ${d(V.q1Shadow, 4)}$; the angle between the arrows is ${d(V.q1Angle, 0)}°`,
    stage: plane({ psi: '+x', basis: 'z', shadows: true, arc: true, arcLabel: '$\\theta$' }),
    claims: [
      claim('q1Shadow', '⟨+z|+x⟩ = 0.7071', () => close(V.q1Shadow, Math.SQRT1_2)),
      claim('q1Angle', 'the arrows |+z⟩ and |+x⟩ are 45° apart', () => close(V.q1Angle, 45)),
      claim('q1Fig3', 'Fig. 3 with α = (2, 0), β = (1, 1): ⟨α|β⟩/|α| = 1 = |β| cos 45°', () => close(V.q1Fig3, Math.SQRT2 * Math.cos(Math.PI / 4))),
    ],
  },
  {
    // plan b6 (books)
    id: 'q1-inner-product:b7',
    phase: 'books',
    text: 'Axler’s textbook writes the inner product as $\\langle\\alpha, \\beta\\rangle$ and makes it linear in the first slot instead. So his $\\langle\\alpha, \\beta\\rangle$ equals our $\\langle\\beta|\\alpha\\rangle$. Our $\\langle\\alpha|\\beta\\rangle$, with the letters in his order, is its conjugate: same size, opposite phase. Physics conjugates the bra.',
    formal:
      'Rosetta: Axler’s $\\langle\\alpha, \\beta\\rangle$ is our $\\langle\\beta|\\alpha\\rangle$ (Axler, Definition 6.2, p. 183), and Axler’s adjoint of an operator is our dagger (Axler, Definition 7.1, p. 228). N&C side with physics (p. 65); Axler is the odd one out.',
    caption: 'physics: $\\langle i{+z}|{+z}\\rangle = -i$; Axler’s first-slot rule: $+i$',
    stage: plane({ psi: '+z', others: [{ ket: '-z', role: 'basis' }] }),
    refs: [
      axler('§6A, 6.2, p. 183; margin note, p. 184', 'The mathematician’s inner product, linear in the first slot, and the note that physicists use the other convention.'),
      nc('eq. (2.13), p. 65', 'The physicists’ convention, conjugate-linear in the first slot, as in this course.'),
    ],
    claims: [
      claim('q1Axler', '⟨i(+z)|+z⟩ = −i: the bra conjugates', () => close(V.q1Axler, -1)),
      claim('q1AxlerIm', 'Axler’s first-slot rule gives +i', () => close(V.q1AxlerIm, 1)),
    ],
  },
  {
    id: 'q1-inner-product:b8',
    phase: 'clue',
    text: 'Try $M = \\begin{pmatrix}1 & 0\\\\ 0 & -1\\end{pmatrix}$. The picture also calls it [[unitary|unitary]], a property that does not matter here. Is $\\langle\\beta|\\alpha\\rangle_M = \\beta^\\dagger M\\alpha$ an inner product?',
    formal: 'With $\\sigma_z = \\operatorname{diag}(1, -1)$, is $\\beta^\\dagger\\sigma_z\\alpha$ an inner product on $\\text{ℂ}^2$?',
    stage: ops({ op: { named: 'sz' }, eigen: true, labels: 'plain' }),
    reveal: {
      text: `No. For $\\alpha = (1, 1)$, $\\langle\\alpha|\\alpha\\rangle_M = 1 - 1 = ${d(V.q1BadM11, 0)}$, although $\\alpha$ is not the zero vector. For $(0, 1)$ it is even $${d(V.q1BadM01, 0)}$, a negative length squared.`,
      formal: `No: $\\sigma_z$ is Hermitian but has the eigenvalue $-1$, so positivity ($${d(V.q1BadM01, 0)}$ for $(0, 1)$) and definiteness ($\\langle\\alpha|\\alpha\\rangle_M = ${d(V.q1BadM11, 0)}$ for $\\alpha = (1, 1)$) both fail. Positive eigenvalues are exactly what the notes’ condition asks.`,
      caption: `$(1, 1)$: ${d(V.q1BadM11, 0)}; $(0, 1)$: $${d(V.q1BadM01, 0)}$`,
      claims: [
        claim('q1BadM11', 'with σ_z, (1, 1) gives 0', () => close(V.q1BadM11, 0)),
        claim('q1BadM01', 'with σ_z, (0, 1) gives −1', () => close(V.q1BadM01, -1)),
      ],
    },
  },
]

export const Q1_STORY: Record<string, Beat[]> = {
  'q1-two-spots': twoSpots,
  'q1-sequences': sequences,
  'q1-superposition': superposition,
  'q1-vector-space': vectorSpace,
  'q1-inner-product': innerProduct,
}
