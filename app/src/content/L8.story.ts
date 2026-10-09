/**
 * Lecture 8 scroll story (owner: P). Beats per docs/roles/proposals/P-L8-story.md §1, with the judge's rulings
 * (docs/roles/decisions/448-L8L11.md, L8 section):
 * - R3 Rosetta: the notes' ϑ (the angle of a linear polarization from horizontal) is χ here, said in the caption of `l8-polarization:b2`
 *   where χ first appears, and the added physical turn is φ; the notes' message bit m is x, because m is the size of the test sample from `l8-test` on (`l8-key:b2`); the bases
 *   are H/V and D/A throughout, and one caption says the notes' Lecture 8 pages call them Z and X and the Lecture 9 pages H−V and A−D
 *   (`l8-bb84:b1`). H and V are the engine's +z and −z, D and A its +x and −x, C± its ±y.
 * - R4: the polarization sphere (`labels: 'poincare'`) names its poles H/V, D/A, C± on the ⟨σ⟩ axes, not Stokes S₁–S₃.
 * - R7: the `bb84` ledger kind, the `bb84-bench` widget and the `catch-eve` game run on ONE seeded engine (physics/bb84.ts) and one scene.
 * - P1: "Class 9 starts here" on `l8-attack:b1` (class 8 stopped before the attack; the notes' Lecture 9 imports §8.7 and §8.8).
 * - P2: the three Go-deeper beats use phase `'deeper'` and are optional: the notes' own line never relies on them.
 * - P3: the six derivations are one-track `{result, ground}` with two or more distinct views each.
 * - P4: chips into Physics 709 (`<<sl-…|…>>`, content/bridges448.ts) sit in clue reveals and Go-deeper beats, never in the notes' own line.
 *
 * Rules kept here (as in L1–L9.story.ts): stage states carry physics inputs only (the resolvers compute every probability, variance and
 * bit); every number in the prose comes from L8.values.ts and is backed by a keyed claim; clue beats are click-to-reveal; core text keeps
 * sentences ≤ 25 words and defines symbols before use; link-back beats name the unit they recall and define nothing.
 */
import type { BallState, Bb84State, Beat, BlochState, HilbertPlaneState, OperatorState, PlotState, Ref, Scrub, StageKind, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import { V, claim, close, d, uf } from './L8.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const bloch = (s: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', shot: 'B-STD', ...s })
/** The polarization sphere: H/V on z, D/A on x, C± on y (rulings L8 R4). */
const pol = (s: Omit<BlochState, 'kind' | 'labels'>): BlochState => bloch({ labels: 'poincare', ...s })
const ball = (s: Omit<BallState, 'kind'>): BallState => ({ kind: 'bloch-ball', shot: 'B-STD', ...s })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
/** The real slice of linear polarizations: the arrow's angle is the polarizer's angle (no halving). */
const hv = (s: Omit<HilbertPlaneState, 'kind' | 'labels'>): HilbertPlaneState => plane({ labels: 'polarization', ...s })
const op = (s: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', shot: 'O-STD', gauge: false, ...s })
/** The BB84 protocol ledger (one row per photon). */
const led = (s: Omit<Bb84State, 'kind'>): Bb84State => ({ kind: 'bb84', shot: 'K-LEDGER', ...s })
/** The chance that a test of m sifted bits shows nothing, (¾)^m; `x` is the range drawn (default 0 to 40). */
const miss = ({ x, ...s }: Omit<PlotState, 'kind' | 'curve'> & { x?: { from: number; to: number } }): PlotState => ({ kind: 'plot', shot: 'P-CURVE', curve: x ? { fn: 'bb84Miss', x } : { fn: 'bb84Miss' }, ...s })

const sweep = (from: number, to: number): Scrub => ({ from, to })
/** The generic state of Unit 8.1: θ = 60°, φ = 45° (the same STAR as Units 7.5–7.6). */
const STAR = { thetaDeg: 60, phiDeg: 45 }
/** The state where all three Pauli variances are equal: θ = arccos(1/√3) = 54.7356°, φ = 45°. */
const MAGIC = { thetaDeg: 54.7356, phiDeg: 45 }
/** The notes' eight-photon board (p. 8). */
const BOARD = { board: 'notes-p8' as const }
/** The seeded run the story uses for its figures. */
const RUN9 = 9
const RUN20 = 20
const RUN84 = 84

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const lecture = (where: string, adds: string): Ref => ({ source: 'lecture', where, adds })
const shorPreskill: Ref = { source: 'lecture', where: 'L8 p. 11 (instructor references)', adds: 'The notes list the Shor–Preskill security proof as an instructor reference, beyond this lecture.' }

/* ---------------------------------------------------------------------------------------------- */
/* l8-variance-sum — Three variances that always add to two                                        */
/* ---------------------------------------------------------------------------------------------- */

const varianceSum: Beat[] = [
  {
    id: 'l8-variance-sum:b1',
    phase: 'lecture',
    text: 'Unit 7.5 read each spread off the arrow on the [[bloch-sphere|Bloch sphere]]. Now count in Pauli units. Each of $\\sigma_x$, $\\sigma_y$ and $\\sigma_z$ reads $+1$ or $-1$, and $r_i = \\langle\\sigma_i\\rangle$ is its average. For a [[pure-state|pure state]] the three averages obey $r^2 = r_x^2 + r_y^2 + r_z^2 = 1$.',
    caption: `the arrow’s coordinates are the $r_i$: (${d(V.l8rStarX)}, ${d(V.l8rStarY)}, ${d(V.l8rStarZ)}) for θ = 60° and φ = 45°`,
    stage: bloch({ state: STAR, readouts: ['budget'] }),
    claims: [
      claim('l8rStarX', 'r_x = sin 60° cos 45° = 0.612', () => close(V.l8rStarX, Math.sin(Math.PI / 3) * Math.cos(Math.PI / 4))),
      claim('l8rStarY', 'r_y = sin 60° sin 45° = 0.612', () => close(V.l8rStarY, Math.sin(Math.PI / 3) * Math.sin(Math.PI / 4))),
      claim('l8rStarZ', 'r_z = cos 60° = 0.500', () => close(V.l8rStarZ, 0.5)),
      claim('l8rSq', 'r² = 1 for a pure state', () => close(V.l8rSq, 1)),
    ],
  },
  {
    id: 'l8-variance-sum:b2',
    phase: 'lecture',
    text: 'Every reading squared is 1, so $\\sigma_i^2 = I$ and $\\langle\\sigma_i^2\\rangle = 1$. That leaves the [[variance|variance]] $(\\Delta\\sigma_i)^2 = \\langle\\sigma_i^2\\rangle - \\langle\\sigma_i\\rangle^2 = 1 - r_i^2$. An average of $\\pm 1$ means certainty. An average of 0 is a fair coin, with variance 1.',
    caption: `the three bars are $(\\Delta\\sigma_i)^2$: ${d(V.l8VarStarX, 2)}, ${d(V.l8VarStarY, 2)}, ${d(V.l8VarStarZ, 2)}`,
    stage: bloch({ state: STAR, measure: 'z', readouts: ['budget'] }),
    fidelity: ['bloch-budget'],
    claims: [
      claim('l8VarStarX', '(Δσ_x)² = 1 − 0.375 = 0.625', () => close(V.l8VarStarX, 1 - V.l8rStarX ** 2)),
      claim('l8VarStarY', '(Δσ_y)² = 0.625', () => close(V.l8VarStarY, 1 - V.l8rStarY ** 2)),
      claim('l8VarStarZ', '(Δσ_z)² = 1 − 0.25 = 0.750', () => close(V.l8VarStarZ, 1 - V.l8rStarZ ** 2)),
      claim('l8SigmaSqI', 'σ_i² = I for all three Pauli matrices', () => V.l8SigmaSqI === 1),
    ],
  },
  {
    id: 'l8-variance-sum:b3',
    phase: 'lecture',
    text: 'Add the three. The averaged squares give 3, and the squared averages give $r^2 = 1$. So the variances always total $3 - r^2 = 2$ for every pure state: the [[variance-sum|variance budget]].',
    caption: `the bars trade places as the state moves; the total stays ${d(V.l8VarSumWorst, 2)}`,
    stage: bloch({ state: { thetaDeg: sweep(0, 90), phiDeg: 45 }, readouts: ['budget'] }),
    fidelity: ['bloch-budget'],
    derivation: {
      result: '\\sum_i(\\Delta\\sigma_i)^2 = 3 - r^2 = 2',
      ground: [
        {
          tex: '(\\Delta\\sigma_i)^2 = \\langle\\sigma_i^2\\rangle - \\langle\\sigma_i\\rangle^2',
          why: 'The variance is the average of the square minus the square of the average.',
          view: bloch({ state: STAR, readouts: ['budget'] }),
          viewCaption: 'one pure state: three bars',
        },
        { tex: '(\\Delta\\sigma_i)^2 = 1 - r_i^2', why: 'Every Pauli reading squares to 1, so the average of the square is 1.' },
        { tex: '\\sum_i(\\Delta\\sigma_i)^2 = 3 - (r_x^2 + r_y^2 + r_z^2)', why: 'Add the three: three ones, minus the three squared averages.' },
        { tex: '= 3 - r^2', why: 'The three squared averages make up $r^2$.' },
        {
          tex: '\\sum_i(\\Delta\\sigma_i)^2 = 3 - r^2 = 2',
          why: 'A pure state has $r^2 = 1$, so the total is $3 - 1 = 2$ whatever the state.',
          view: bloch({ state: '+z', readouts: ['budget'] }),
          viewCaption: 'another pure state: the bars differ, the total does not',
        },
      ],
    },
    claims: [claim('l8VarSumWorst', 'the three variances total 2 for every state on a 13 × 12 grid', () => close(V.l8VarSumWorst, 2))],
  },
  {
    id: 'l8-variance-sum:b4',
    phase: 'lecture',
    text: 'So a pure state can move uncertainty between components, never remove it. Make one component certain and the other two become fair coins. For $|{+z}\\rangle$ the three variances are 1, 1 and 0.',
    caption: 'one dashed segment shows both distances, to the x axis and to the y axis: each is the full radius, so $(\\Delta\\sigma_x)^2 = (\\Delta\\sigma_y)^2 = 1$',
    stage: bloch({ state: '+z', readouts: ['budget'], dropLines: ['x', 'y'] }),
    claims: [claim('l8VarsPlusZ', 'for |+z⟩ the variances are (1, 1, 0)', () => V.l8VarsPlusZ === 1)],
  },
  {
    id: 'l8-variance-sum:b5',
    phase: 'clue',
    text: 'Could some pure state make all three variances equal and small, say $\\tfrac13$ each?',
    stage: bloch({ state: STAR, readouts: ['budget'] }),
    reveal: {
      text: 'Equal, yes; small, no. Equal variances need $r_x^2 = r_y^2 = r_z^2 = \\tfrac13$, so each variance is $\\tfrac23$ and the total is still 2.',
      caption: 'at θ = 54.7° and φ = 45° all three bars are ⅔',
      stage: bloch({ state: MAGIC, readouts: ['budget'] }),
      fidelity: ['bloch-budget'],
      claims: [
        claim('l8RiSqEqual', 'each squared average is ⅓ at θ = arccos(1/√3)', () => close(V.l8RiSqEqual, 1 / 3, 1e-6)),
        claim('l8VarsEqual', 'each of the three variances is ⅔ there', () => close(V.l8VarsEqual, 2 / 3, 1e-6)),
        claim('l8MagicTheta', 'the angle is arccos(1/√3) = 54.7356°', () => close(V.l8MagicTheta, 54.7356, 1e-4)),
      ],
    },
  },
  {
    id: 'l8-variance-sum:b6',
    phase: 'deeper',
    text: 'Beyond the notes: inside the [[bloch-ball|Bloch ball]], a [[mixture]] still has $\\langle\\sigma_i^2\\rangle = 1$, so $(\\Delta\\sigma_i)^2 = 1 - r_i^2$ survives. The total becomes $3 - r^2$: 2 on the surface and 3 at the centre.',
    caption: `at $r = ${d(V.l8MixR, 1)}$ the total is ${d(V.l8MixSum06, 2)}; at the centre it is ${d(V.l8MixSum0, 2)}`,
    stage: ball({ point: { r: [0, 0, sweep(1, 0)] }, readouts: ['budget'], purity: true }),
    fidelity: ['ball-budget'],
    refs: [lecture('Unit 6.5', 'The Bloch ball: points inside the sphere are not pure states, and the distance from the centre measures how pure they are.')],
    claims: [
      claim('l8MixR', 'the example mixture has |r| = 0.6', () => close(V.l8MixR, 0.6)),
      claim('l8MixSum06', 'its three variances total 3 − 0.36 = 2.64', () => close(V.l8MixSum06, 3 - 0.36)),
      claim('l8MixSum0', 'at the centre the total is 3.00', () => close(V.l8MixSum0, 3)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l8-polarization — A second qubit: the polarization of light                                     */
/* ---------------------------------------------------------------------------------------------- */

const polarization: Beat[] = [
  {
    id: 'l8-polarization:b1',
    phase: 'lecture',
    introduces: ['hv-basis'],
    text: 'Unit 1.3 set a polarizer beside a magnet. Now [[polarization]] is a [[qubit|qubit]] of its own. Light along a fixed line has its field swinging horizontally or vertically: two perpendicular states of one [[photon|photon]], [[hv-basis|$|H\\rangle$ and $|V\\rangle$]].',
    caption: 'ordered basis: |H⟩ ↔ (1, 0) and |V⟩ ↔ (0, 1) · the arrow’s angle is the polarizer’s angle',
    stage: hv({ psi: { planeDeg: 0 }, others: [{ ket: { planeDeg: 90 }, role: 'basis' }], rightAngle: true }),
    claims: [claim('l8HV', '⟨H|V⟩ = 0', () => close(V.l8HV, 0))],
  },
  {
    id: 'l8-polarization:b2',
    phase: 'lecture',
    text: 'Any polarization is $|\\psi\\rangle = \\alpha|H\\rangle + \\beta|V\\rangle$ with $|\\alpha|^2 + |\\beta|^2 = 1$. For light polarized at angle $\\chi$ from horizontal, $\\alpha = \\cos\\chi$ and $\\beta = \\sin\\chi$. A [[polarizing-beam-splitter|polarizing beam splitter]] sends $H$ and $V$ to two detectors. Each photon makes one click, and $H$ clicks with chance $P(H) = |\\alpha|^2$. An absorbing polarizer with one detector watches only the passing outcome.',
    caption: `χ, the angle from horizontal, is the notes’ ϑ · at χ = 30°: P(H) = ${d(V.l8PH30, 3)} and P(V) = ${d(V.l8PV30, 3)}`,
    stage: hv({ psi: { planeDeg: 30 }, basis: 'z', shadows: true }),
    claims: [
      claim('l8PH30', 'P(H) = cos² 30° = 0.750', () => close(V.l8PH30, Math.cos(Math.PI / 6) ** 2)),
      claim('l8PV30', 'P(V) = sin² 30° = 0.250', () => close(V.l8PV30, Math.sin(Math.PI / 6) ** 2)),
    ],
  },
  {
    id: 'l8-polarization:b3',
    phase: 'lecture',
    text: 'Turn the [[analyzer|analyzer]] by 45°. Its outputs are the [[da-basis|diagonal and antidiagonal states]], $|D\\rangle = (|H\\rangle + |V\\rangle)/\\sqrt2$ and $|A\\rangle = (|H\\rangle - |V\\rangle)/\\sqrt2$, again [[orthogonal]]. A horizontal photon leaves by either port with chance ½.',
    caption: `|⟨D|H⟩| = |⟨A|H⟩| = ${d(V.l8DH, 3)}, so each port has chance ${uf(V.l8PDH)}`,
    stage: hv({ psi: { planeDeg: 0 }, basis: 'x', shadows: true }),
    claims: [
      claim('l8DH', '|⟨D|H⟩| = 1/√2 = 0.707', () => close(V.l8DH, Math.SQRT1_2)),
      claim('l8AH', '|⟨A|H⟩| = 1/√2 = 0.707', () => close(V.l8AH, Math.SQRT1_2)),
      claim('l8PDH', 'P(D | H) = P(A | H) = ½', () => close(V.l8PDH, 0.5)),
      claim('l8DA', '⟨D|A⟩ = 0', () => close(V.l8DA, 0)),
    ],
  },
  {
    id: 'l8-polarization:b4',
    phase: 'lecture',
    text: 'Each state of one pair gives 50/50 in the other pair, so H/V and D/A are [[mutually-unbiased|mutually unbiased]], like $|{\\pm z}\\rangle$ and $|{\\pm x}\\rangle$ in Unit 2.5. Inside its own basis a state answers with certainty.',
    caption: `a D photon in the H/V frame: its shadows on H and V are equal, so each port has chance ${uf(V.l8PDH)}`,
    stage: hv({ psi: { planeDeg: 45 }, basis: 'z', shadows: true }),
    claims: [
      claim('l8MubPol', '{H, V} and {D, A} are mutually unbiased', () => V.l8MubPol === 1),
      claim('l8PDH', 'every cross chance is 50/50', () => close(V.l8PDH, 0.5)),
    ],
  },
  {
    id: 'l8-polarization:b5',
    phase: 'books',
    text: 'Townsend takes the amplitudes from classical optics: a tilted field splits into a cosine part and a sine part. Quantum mechanics adds the clicks: whole photons, with the squared cosine as a chance. At 60°, one photon in four passes an H analyzer.',
    caption: `a photon at χ = 60° passes the H port with chance ${uf(V.l8Pal60)}`,
    stage: hv({ psi: { planeDeg: 60 }, basis: 'z', shadows: true }),
    refs: [townsend('§2.7, pp. 59–62, eqs. (2.109)–(2.110)', 'The amplitudes of a tilted linear polarization from classical optics, then the photon as a quantum state with chances given by their squares.')],
    claims: [claim('l8Pal60', 'at 60° the H port passes cos² 60° = ¼', () => close(V.l8Pal60, 0.25))],
  },
  {
    id: 'l8-polarization:b6',
    phase: 'clue',
    text: 'Prepare $|D\\rangle$. What does a D/A analyzer report? What does an H/V analyzer report? Nothing happened to the photon in between.',
    stage: hv({ psi: { planeDeg: 45 }, basis: 'x', shadows: true }),
    reveal: {
      text: 'The D/A analyzer reads D every time. The H/V analyzer gives a fair coin. The state is the same; the question the analyzer asks changed.',
      caption: 'same arrow, other frame',
      stage: hv({ psi: { planeDeg: 45 }, basis: 'z', shadows: true }),
      claims: [
        claim('l8PDD', 'a D photon in a D/A analyzer reads D with chance 1', () => close(V.l8PDD, 1)),
        claim('l8PHD', 'the same photon in an H/V analyzer reads H with chance ½', () => close(V.l8PHD, 0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l8-turning — Turning a polarization: the rotation matrix                                        */
/* ---------------------------------------------------------------------------------------------- */

const turning: Beat[] = [
  {
    id: 'l8-turning:b1',
    phase: 'lecture',
    text: 'Here physics enters, not just algebra: polarization amplitudes turn like the transverse electric field. The [[rotation-pol|rotation matrix]] $R_{\\mathrm{pol}}(\\varphi)$ turns a polarization by $\\varphi$ about the beam, and a positive $\\varphi$ carries $H$ toward $V$.',
    caption: `beam out of the page, φ measured from horizontal · turning H by 30° gives it a V part of +${d(V.l8RHv30, 1)}`,
    stage: hv({ psi: { planeDeg: sweep(0, 30) }, others: [{ ket: { planeDeg: 0 }, role: 'ghost' }] }),
    claims: [claim('l8RHv30', '⟨V|R_pol(30°)|H⟩ = +0.5', () => close(V.l8RHv30, 0.5))],
  },
  {
    id: 'l8-turning:b2',
    phase: 'lecture',
    text: 'Follow each basis state. $H$ ends at angle $\\varphi$, and $V$ ends at $90^\\circ + \\varphi$. Their coordinates are the columns of $R_{\\mathrm{pol}}(\\varphi)$.',
    caption: 'H turns to the cos–sin pair; V, a quarter turn ahead, turns to the minus-sin–cos pair',
    stage: hv({ psi: { planeDeg: 30 }, others: [{ ket: { planeDeg: 120 }, role: 'second' }], rightAngle: true }),
    derivation: {
      result: 'R_{\\mathrm{pol}}(\\varphi) = \\begin{pmatrix}\\cos\\varphi & -\\sin\\varphi\\\\ \\sin\\varphi & \\cos\\varphi\\end{pmatrix}',
      ground: [
        {
          tex: 'R_{\\mathrm{pol}}(\\varphi)|H\\rangle = \\cos\\varphi\\,|H\\rangle + \\sin\\varphi\\,|V\\rangle',
          why: 'Horizontal starts at angle 0. After the turn it sits at $\\varphi$, with parts $\\cos\\varphi$ and $\\sin\\varphi$ along $H$ and $V$.',
          view: hv({ psi: { planeDeg: 30 }, others: [{ ket: { planeDeg: 0 }, role: 'ghost' }] }),
          viewCaption: 'H turned by φ',
        },
        {
          tex: 'R_{\\mathrm{pol}}(\\varphi)|V\\rangle = -\\sin\\varphi\\,|H\\rangle + \\cos\\varphi\\,|V\\rangle',
          why: 'Vertical starts at $90^\\circ$ and ends at $90^\\circ + \\varphi$. Use $\\cos(90^\\circ + \\varphi) = -\\sin\\varphi$ and $\\sin(90^\\circ + \\varphi) = \\cos\\varphi$.',
          view: hv({ psi: { planeDeg: 120 }, others: [{ ket: { planeDeg: 90 }, role: 'ghost' }] }),
          viewCaption: 'V turned by φ',
        },
        {
          tex: 'R_{\\mathrm{pol}}(\\varphi) = \\begin{pmatrix}\\cos\\varphi & -\\sin\\varphi\\\\ \\sin\\varphi & \\cos\\varphi\\end{pmatrix}',
          why: 'The columns of a matrix are the coordinates of what it does to the basis states, so place the two images side by side.',
        },
      ],
    },
    claims: [
      claim('l8RpolCols', 'the images of H and V are the columns (cos φ, sin φ) and (−sin φ, cos φ)', () => V.l8RpolCols === 1),
      claim('l8RpolUnitary', 'R_pol(φ) is unitary: a turn never changes the length of a state', () => V.l8RpolUnitary === 1),
    ],
  },
  {
    id: 'l8-turning:b3',
    phase: 'lecture',
    introduces: ['linear-polarization'],
    text: 'Write a [[linear-polarization|linear polarization]] at angle $\\chi$ from $H$ as $|p(\\chi)\\rangle = \\cos\\chi\\,|H\\rangle + \\sin\\chi\\,|V\\rangle$. An analyzer set at $\\chi_a$ passes it with amplitude $\\langle p(\\chi_a)|p(\\chi)\\rangle$.',
    caption: 'the arrow is the photon at χ = 60° · an analyzer at 0° splits it into its H and V parts',
    stage: hv({ psi: { planeDeg: 60 }, basis: 'z', shadows: true }),
  },
  {
    id: 'l8-turning:b4',
    phase: 'lecture',
    text: 'The overlap of two real columns is a dot product, and the cosine-difference identity turns it into $\\cos(\\chi - \\chi_a)$. Call the angle between arrow and analyzer $\\Delta\\chi = \\chi - \\chi_a$. Squaring gives the chance: the aligned port gets $\\cos^2\\Delta\\chi$ and the other port $\\sin^2\\Delta\\chi$.',
    caption: `at Δχ = 15°: ${d(V.l8Pal15, 3)} and ${d(V.l8PalOther15, 3)}`,
    stage: hv({ psi: { planeDeg: 60 }, basis: 'x', shadows: true }),
    derivation: {
      result: 'P(\\text{aligned}) = \\cos^2\\Delta\\chi,\\quad P(\\text{other}) = \\sin^2\\Delta\\chi',
      ground: [
        {
          tex: '\\langle p(\\chi_a)|p(\\chi)\\rangle = \\cos\\chi_a\\cos\\chi + \\sin\\chi_a\\sin\\chi',
          why: 'Real coordinates make the overlap an ordinary dot product of two columns.',
          view: hv({ psi: { planeDeg: 60 }, basis: 'z', shadows: true }),
          viewCaption: 'Δχ = 60°: the arrow is far from the analyzer',
        },
        { tex: '= \\cos(\\chi - \\chi_a) = \\cos\\Delta\\chi', why: 'This is the cosine-difference identity, with $\\Delta\\chi = \\chi - \\chi_a$.' },
        { tex: 'P(\\text{aligned}) = \\cos^2\\Delta\\chi', why: 'Square the amplitude to get the chance of the aligned port.' },
        {
          tex: 'P(\\text{other}) = 1 - \\cos^2\\Delta\\chi = \\sin^2\\Delta\\chi',
          why: 'The two ports share the whole chance, so the other port gets the rest.',
          view: hv({ psi: { planeDeg: 60 }, basis: 'x', shadows: true }),
          viewCaption: 'Δχ = 15°: the arrow is close to the analyzer',
        },
      ],
    },
    claims: [
      claim('l8OverlapCos', 'the overlap equals cos(χ − χ_a) for every sampled pair of angles', () => close(V.l8OverlapCos, 0)),
      claim('l8Pal15', 'at Δχ = 15° the aligned port has cos² 15° = 0.933', () => close(V.l8Pal15, Math.cos(Math.PI / 12) ** 2)),
      claim('l8PalOther15', 'and the other port sin² 15° = 0.067', () => close(V.l8PalOther15, Math.sin(Math.PI / 12) ** 2)),
    ],
  },
  {
    id: 'l8-turning:b5',
    phase: 'clue',
    text: 'A magnet must turn 180° before the + spot stays empty. How far must an analyzer turn to stop a photon completely?',
    stage: hv({ psi: { planeDeg: 0 }, basis: 'z', shadows: true }),
    reveal: {
      text: 'Only 90°, because $\\cos^2 90^\\circ = 0$. At 45° it is a fair coin. Light uses the whole angle where spin uses half of it.',
      caption: 'crossed at 90°: the aligned port is empty',
      stage: hv({ psi: { planeDeg: 90 }, basis: 'z', shadows: true }),
      fidelity: ['plane-pol-angle'],
      claims: [
        claim('l8Pal90', 'cos² 90° = 0', () => close(V.l8Pal90, 0)),
        claim('l8Pal45', 'cos² 45° = ½', () => close(V.l8Pal45, 0.5)),
        claim('l8Spin180', 'a spin magnet turned 180° empties the + spot', () => close(V.l8Spin180, 0)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l8-photon-spin — A photon turns the sphere twice as fast                                        */
/* ---------------------------------------------------------------------------------------------- */

const photonSpin: Beat[] = [
  {
    id: 'l8-photon-spin:b1',
    phase: 'lecture',
    text: 'Which operator generates the turn? For a small $\\varphi$, $\\cos\\varphi \\approx 1$ and $\\sin\\varphi \\approx \\varphi$, so $R_{\\mathrm{pol}}(\\varphi) \\approx I - i\\varphi G$. Matching terms gives $G = \\sigma_y$, and in fact $R_{\\mathrm{pol}}(\\varphi) = \\cos\\varphi\\, I - i\\sin\\varphi\\,\\sigma_y$.',
    caption: 'a turn by a small angle: the linear term in φ names the generator',
    stage: hv({ psi: { planeDeg: sweep(0, 5) } }),
    derivation: {
      result: 'G = \\sigma_y',
      ground: [
        {
          tex: 'R_{\\mathrm{pol}}(\\varphi) \\approx I + \\varphi\\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix}',
          why: 'For a small angle, $\\cos\\varphi \\approx 1$ and $\\sin\\varphi \\approx \\varphi$ in the matrix of the turn.',
          view: hv({ psi: { planeDeg: sweep(0, 5) } }),
          viewCaption: 'a small turn',
        },
        { tex: 'R_{\\mathrm{pol}}(\\varphi) \\approx I - i\\varphi G', why: 'A generator $G$ is defined by this form of a small turn.' },
        {
          tex: '-iG = \\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix}',
          why: 'Match the two linear terms.',
        },
        {
          tex: 'G = i\\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix} = \\begin{pmatrix}0 & -i\\\\ i & 0\\end{pmatrix} = \\sigma_y',
          why: 'Multiply by $i$ and read off the matrix: it is the Pauli matrix $\\sigma_y$.',
          view: op({ op: { named: 'sy' }, eigen: true }),
          viewCaption: 'the generator $\\sigma_y$: an arrow along y',
        },
      ],
    },
    claims: [
      claim('l8GenSy', 'i times the derivative of R_pol at φ = 0 is σ_y', () => V.l8GenSy === 1),
      claim('l8RpolForm', 'R_pol(φ) = cos φ I − i sin φ σ_y for every sampled angle', () => V.l8RpolForm === 1),
    ],
  },
  {
    id: 'l8-photon-spin:b2',
    phase: 'lecture',
    introduces: ['circular-states'],
    text: 'Physically $G$ is $J_z/\\hbar$, the angular momentum about the beam, written in the H/V basis: $y$ names the matrix, not the axis. Its eigenstates are the [[circular-states|circular ones]], $|C_\\pm\\rangle = (|H\\rangle \\pm i|V\\rangle)/\\sqrt2$, with $J_z/\\hbar = \\pm 1$, the [[helicity|helicities]]. So the photon has [[photon-spin|spin 1]].',
    caption: '$\\sigma_y$ has the two circular states as eigenvectors, with eigenvalues $\\pm 1$',
    stage: op({ op: { named: 'sy' }, eigen: true }),
    claims: [
      claim('l8EigSy', 'the eigenvalues of σ_y are +1 and −1', () => V.l8EigSy === 1),
      claim('l8CpEigen', 'its eigenvectors are |C₊⟩ and |C₋⟩', () => V.l8CpEigen === 1),
    ],
  },
  {
    id: 'l8-photon-spin:b3',
    phase: 'lecture',
    text: 'A turn only gives the circular states phases: $R_{\\mathrm{pol}}(\\varphi)|C_\\pm\\rangle = e^{\\mp i\\varphi}|C_\\pm\\rangle$. A free photon has no helicity-0 state, so two dimensions still suffice.',
    caption: 'top: the lab turn, shown on a linear polarization ($|C_+\\rangle$ is not in this plane) · bottom: $|C_+\\rangle$ sits on the turning axis and only gains the phase $e^{-i\\varphi}$',
    stage: { layout: 'split', top: hv({ psi: { planeDeg: sweep(0, 90) } }), bottom: pol({ state: '+y', photonTurnDeg: sweep(0, 90) }) },
    claims: [
      claim('l8PhaseCp40', 'a turn of 40° gives |C₊⟩ the phase −40°', () => close(V.l8PhaseCp40, -40, 1e-9)),
      claim('l8PhaseCm40', 'and |C₋⟩ the phase +40°', () => close(V.l8PhaseCm40, 40, 1e-9)),
    ],
  },
  {
    id: 'l8-photon-spin:b4',
    phase: 'lecture',
    text: 'Put $H$ and $V$ at the poles. Then $|p(\\chi)\\rangle$ sits at the Bloch vector $\\vec r = (\\sin 2\\chi, 0, \\cos 2\\chi)$, so a physical turn $\\varphi$ moves the point by $2\\varphi$. $H$ to $V$ is 90° in the lab and 180° on the sphere.',
    caption: 'lab 45° → sphere 90° (D) · lab 90° → sphere 180° (V) · the {{pt|point}} turns twice as far as the light',
    stage: { layout: 'split', top: hv({ psi: { planeDeg: sweep(0, 90) } }), bottom: pol({ state: '+z', photonTurnDeg: sweep(0, 90), trail: true }) },
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l8rP30X', 'a photon at χ = 30° sits at r_x = sin 60° = 0.866', () => close(V.l8rP30X, Math.sin(Math.PI / 3))),
      claim('l8rP30Z', 'and r_z = cos 60° = 0.500', () => close(V.l8rP30Z, 0.5)),
      claim('l8Turn45', 'a 45° turn of light moves the point 90°', () => close(V.l8Turn45, 90)),
      claim('l8Turn90', 'a 90° turn moves it 180°', () => close(V.l8Turn90, 180)),
    ],
    fidelity: ['poincare-double-angle'],
  },
  {
    id: 'l8-photon-spin:b5',
    phase: 'lecture',
    text: `Compare an electron. Its turn generator has eigenvalues $\\pm\\tfrac12$, so its phases are $e^{\\mp i\\varphi/2}$. Turning it 180° takes $|{+z}\\rangle$ to $|{-z}\\rangle$: 180° in the lab and 180° on the sphere. For any pair of states, the angle between their rays is half their sphere separation: ${d(V.l8RayHV, 0)}° for H and V.`,
    caption: 'electron: lab 180° → sphere 180° · photon: lab 90° → sphere 180°',
    stage: bloch({ state: '+z', rotate: { axis: 'y', angleDeg: sweep(0, 180) }, trail: true }),
    claims: [
      claim('l8EigSyHalf', 'the electron’s generator has eigenvalues ±½', () => close(V.l8EigSyHalf, 0.5)),
      claim('l8ETurn45', 'an electron turned 45° moves its point 45°', () => close(V.l8ETurn45, 45)),
      claim('l8ETurn180', 'turned 180° it moves 180°', () => close(V.l8ETurn180, 180)),
      claim('l8RayHV', 'the angle between the rays of H and V is 90°, half their sphere separation', () => close(V.l8RayHV, 90)),
    ],
  },
  {
    id: 'l8-photon-spin:b6',
    phase: 'clue',
    text: 'The beam flies along $z$, yet on the sphere the photon turns about $y$. Is the sphere wrong?',
    stage: pol({ state: '+z', photonTurnDeg: 45 }),
    reveal: {
      text: 'No. The sphere’s axes are measurement averages, not lab directions. With H and V at the poles, a turn about the beam becomes a turn about $y$. With $C_\\pm$ at the poles it would be about $z$; either way it is twice the lab turn. <<sl-q2-photon|Go further in 709: photon frames>>',
      caption: 'lab 45° → sphere 90°: twice the lab turn',
      stage: pol({ state: '+z', photonTurnDeg: 45 }),
      fidelity: ['poincare-axes'],
      claims: [claim('l8JzCirc', 'in the circular basis the same operator is σ_z', () => V.l8JzCirc === 1)],
    },
  },
  {
    id: 'l8-photon-spin:b7',
    phase: 'deeper',
    text: 'Beyond the notes: since $R_{\\mathrm{pol}}(180^\\circ) = -I$, half a turn returns the same polarization with a sign, and $R_{\\mathrm{pol}}(360^\\circ) = +I$ exactly. An electron needs 360° for the same ray and 720° for the same ket (Unit 7.2).',
    caption: 'lab 180°: the point has gone once round the sphere, the arrow has flipped',
    stage: { layout: 'split', top: hv({ psi: { planeDeg: sweep(0, 180) } }), bottom: pol({ state: '+z', photonTurnDeg: sweep(0, 180), trail: true }) },
    refs: [lecture('Unit 7.2', 'The belt trick: a spin ½ needs a 720° turn to return the same ket; a 360° turn returns the same ray with a minus sign.')],
    claims: [
      claim('l8R180', 'R_pol(180°) = −I', () => V.l8R180 === 1),
      claim('l8R360', 'R_pol(360°) = I', () => V.l8R360 === 1),
      claim('l8Ry360', 'the spin rotation by 360° is −I', () => V.l8Ry360 === 1),
      claim('l8Ry720', 'and by 720° it is I', () => V.l8Ry720 === 1),
      claim('l8Ray180', 'the turned polarization is the same physical state', () => V.l8Ray180 === 1),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l8-key — Why share a secret key                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const key: Beat[] = [
  {
    id: 'l8-key:b1',
    phase: 'lecture',
    text: 'Seven lectures of one qubit at a time are enough to understand Bennett and Brassard’s protocol, [[bb84|BB84]]. It gives Alice and Bob shared random bits and a test that can reveal whether [[eavesdropper|Eve]] listened. Measuring disturbs a photon; testing the disturbance, then shortening the key, bounds what she can know. This is [[qkd|quantum key distribution]].',
    caption: 'a ledger: one row per photon · the notes’ eight-photon example from p. 8',
    stage: led({ rounds: BOARD, show: ['alice', 'bob'] }),
    refs: [lecture('L8 p. 11 (reading list)', 'Bennett and Brassard proposed the protocol in 1984; the notes cite their conference paper.')],
  },
  {
    id: 'l8-key:b2',
    phase: 'lecture',
    text: 'The key is used later. With a [[one-time-pad|one-time pad]], Alice sends each message bit $x$ as $c = x \\oplus k$, where [[xor|$\\oplus$]] adds bits and drops the carry. Bob recovers $x = c \\oplus k$.',
    caption: 'the pad: x = 1011 and k = 0110 give c = 1101, and Bob recovers x = 1011 · the ledger waits for the next unit · the notes’ message bit m is x here, as m is the test size later',
    stage: led({ rounds: BOARD, show: ['alice', 'bob'] }),
    claims: [claim('l8Otp', '1011 ⊕ 0110 = 1101, and 1101 ⊕ 0110 = 1011', () => V.l8Otp === 1)],
  },
  {
    id: 'l8-key:b3',
    phase: 'lecture',
    text: 'A random key that matches the message in length and is used once makes $c$ worthless to Eve. Delivering that key unseen is the problem. BB84 sends key material, never the message itself.',
    stage: led({ rounds: BOARD, show: ['alice', 'bob'] }),
  },
  {
    id: 'l8-key:b4',
    phase: 'lecture',
    text: 'Anyone can read and copy a classical bit unnoticed. An H/V analyzer reads $H$ or $V$ perfectly. A $D$ or an $A$ photon gets a coin toss there, and a D/A analyzer does the reverse. No single reading identifies all four states.',
    caption: `a |D⟩ photon in an H/V analyzer: ${uf(V.l8PHD)} each`,
    stage: pol({ state: '+x', measure: 'z' }),
    claims: [
      claim('l8PHD', 'a D photon gives H or V with chance ½ each', () => close(V.l8PHD, 0.5)),
      claim('l8HV', 'H and V are orthogonal', () => close(V.l8HV, 0)),
      claim('l8DA', 'D and A are orthogonal', () => close(V.l8DA, 0)),
    ],
  },
  {
    id: 'l8-key:b5',
    phase: 'lecture',
    text: 'There are two links: a quantum channel of single photons that Eve may intercept, and a public [[classical-channel|classical channel]] that Eve hears but cannot forge. That [[authentication|authentication]] must already exist. Our model is ideal: no losses and no noise.',
    caption: 'Alice sends, Eve may intercept, Bob measures',
    stage: led({ rounds: { seed: RUN9, count: 12 }, eve: 'all', show: ['alice', 'eve', 'bob'] }),
  },
  {
    id: 'l8-key:b6',
    phase: 'clue',
    text: 'Why not send only $H$ and $V$, which Bob can read perfectly?',
    stage: pol({ state: '+z', measure: 'z' }),
    reveal: {
      text: 'Then Eve could read them perfectly too and resend exact copies. Two mutually unbiased bases force her to guess. <<sl-q13-no-cloning|Go further in 709: why no machine copies an unknown photon>>',
      caption: 'an H photon: certain in H/V, a coin in D/A',
      stage: pol({ state: '+z', measure: 'x' }),
      claims: [claim('l8PHH', 'an H photon in an H/V analyzer reads H with chance 1', () => close(V.l8PHH, 1))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l8-bb84 — BB84: prepare, measure, then compare bases                                            */
/* ---------------------------------------------------------------------------------------------- */

const bb84: Beat[] = [
  {
    id: 'l8-bb84:b1',
    phase: 'lecture',
    introduces: ['bb84-code'],
    text: 'Agree on a [[bb84-code|code]] first. In the H/V basis, $H$ means 0 and $V$ means 1. In the D/A basis, $D$ means 0 and $A$ means 1.',
    caption: 'the notes’ Lecture 8 pages call these bases Z and X, the Lecture 9 pages H−V and A−D · here H/V and D/A',
    stage: led({ rounds: BOARD, show: ['alice'] }),
  },
  {
    id: 'l8-bb84:b2',
    phase: 'lecture',
    text: 'Each round Alice picks a random bit $a$ and, separately, a random basis $B_A$, and sends that photon. Bob picks his own basis $B_B$ at random, measures, and records a bit $b$.',
    caption: 'a basis chip and a bit for each party, one row per photon',
    stage: led({ rounds: BOARD, show: ['alice', 'bob'] }),
  },
  {
    id: 'l8-bb84:b3',
    phase: 'lecture',
    text: 'Afterwards they announce bases, not bits, and keep the rounds with $B_A = B_B$: the [[sifted-key|sifted key]]. Then they publish a random [[test-sample|sample]] of it, count how often they disagree, and throw those public bits away.',
    caption: 'the mark column: a check for every kept round',
    stage: led({ rounds: BOARD, show: ['alice', 'bob'], sift: true }),
  },
  {
    id: 'l8-bb84:b4',
    phase: 'lecture',
    text: `With no Eve, the bases match half the time, matched rounds always agree, and mismatched rounds agree only half the time. So the share of kept bits that disagree, the [[qber|error rate]] $Q$, is ${d(V.l8ErrNoEve, 0)}.`,
    caption: `P(bases match) = ${uf(V.l8PMatch)} · error rate of the kept rounds: Q = ${d(V.l8ErrNoEve, 0)}, and the “kept bits wrong” share stays at ${d(V.l8ErrNoEve, 0)} as the run grows`,
    stage: led({ rounds: { seed: RUN84, count: sweep(8, 400) }, sift: true, readouts: ['kept', 'qber'] }),
    claims: [
      claim('l8PMatch', 'P(B_A = B_B) = ½', () => close(V.l8PMatch, 0.5)),
      claim('l8ErrNoEve', 'matched rounds never disagree without Eve', () => close(V.l8ErrNoEve, 0)),
      claim('l8MismatchRandom', 'mismatched rounds agree with chance ½', () => close(V.l8MismatchRandom, 0.5)),
    ],
  },
  {
    id: 'l8-bb84:b5',
    phase: 'lecture',
    text: 'On the notes’ board, one eight-photon run with no Eve: rounds 1, 4, 5 and 6 used matching bases, so both sifted strings read 0010. Rounds 2 and 8 agree only by luck, and are dropped too.',
    caption: 'rounds 2 and 8 are outlined: their bits agree although their bases differ',
    stage: led({ rounds: BOARD, show: ['alice', 'bob'], sift: true, highlight: [2, 8] }),
    claims: [
      claim('l8BoardKept', 'the kept rounds are 1, 4, 5 and 6', () => V.l8BoardKept === 1),
      claim('l8BoardSift', 'both sifted strings read 0010', () => V.l8BoardSift === 1),
      claim('l8BoardLuck', 'rounds 2 and 8 agree by luck', () => V.l8BoardLuck === 1),
      claim('l8BoardOk', 'every row of the board is physically possible', () => V.l8BoardOk === 1),
    ],
  },
  {
    id: 'l8-bb84:b6',
    phase: 'lecture',
    text: 'Say the sample is rounds 1 and 5. Both agree: 0 errors out of 2, so the observed error rate $\\hat Q$ is 0. Those bits are now public and leave the key, so rounds 4 and 6 remain, reading 00. Eve heard every basis and every tested value. This only shows the bookkeeping: two bits prove nothing about the rest, or about Eve.',
    caption: 'the dashed boxes are the public test bits',
    stage: led({ rounds: BOARD, show: ['alice', 'bob'], sift: true, test: { rounds: [1, 5] } }),
    claims: [
      claim('l8BoardTest', 'the sample shows 0 errors out of 2', () => close(V.l8BoardTest, 0)),
      claim('l8BoardLeft', 'rounds 4 and 6 hold 00', () => V.l8BoardLeft === 1),
    ],
  },
  {
    id: 'l8-bb84:b7',
    phase: 'clue',
    text: 'Bob measures before he knows Alice’s basis. Why not announce it first and waste no rounds?',
    stage: led({ rounds: BOARD, show: ['alice', 'bob'], sift: true }),
    reveal: {
      text: 'Eve still holds the photon then. Knowing the basis, she measures in it and resends a perfect copy, leaving no trace. Announced afterwards, a basis reveals no bit, though Eve may still hold partial information, which testing and shortening the key address.',
      caption: 'bases are announced after Bob has measured',
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l8-attack — An eavesdropper who measures and resends                                            */
/* ---------------------------------------------------------------------------------------------- */

const attack: Beat[] = [
  {
    id: 'l8-attack:b1',
    phase: 'lecture',
    classMark: { class: 9 },
    text: 'Now Eve intercepts every photon. She measures in a basis $B_E$ of her own random choice, then sends Bob a fresh photon in the state she found. This is the [[intercept-resend|intercept–resend]] attack.',
    caption: 'a middle column: Eve’s basis, her reading and the photon she resends',
    stage: led({ rounds: { seed: RUN9, count: 12 }, eve: 'all', show: ['alice', 'eve', 'bob'] }),
  },
  {
    id: 'l8-attack:b2',
    phase: 'lecture',
    text: 'Follow a kept round. Alice sends $|H\\rangle$ and Bob uses H/V. If Eve picks D/A she finds $D$ or $A$, half each, and resends it. Bob then reads $V$ with chance ½ in both cases.',
    caption: 'two separate histories, so their chances add · Bob receives D or A, never a blend',
    stage: pol({ state: '+z', measure: 'x' }),
    claims: [claim('l8ErrEveWrong', 'with Eve in the wrong basis Bob errs with chance ½', () => close(V.l8ErrEveWrong, 0.5))],
  },
  {
    id: 'l8-attack:b3',
    phase: 'lecture',
    text: 'If Eve picks H/V she reads $H$ for sure and resends it, so there is no error. Averaging over her two choices gives the error rate of the sifted key: $Q = \\tfrac12\\cdot 0 + \\tfrac12\\cdot\\tfrac12 = \\tfrac14$.',
    caption: `the same ¼ from a D/A round · in a long run the “kept bits wrong” share lands close to the exact Q = ${uf(V.l8Q)}`,
    stage: led({ rounds: { seed: RUN9, count: sweep(12, 2000) }, eve: 'all', sift: true, readouts: ['qber'] }),
    derivation: {
      result: 'Q = \\tfrac14',
      ground: [
        {
          tex: 'P(\\text{error} \\mid B_E \\ne B_A) = \\tfrac12\\cdot\\tfrac12 + \\tfrac12\\cdot\\tfrac12 = \\tfrac12',
          why: 'A wrong basis gives $D$ or $A$ at random, and each makes Bob wrong half the time: the two histories add.',
          view: pol({ state: '+z', measure: 'x' }),
          viewCaption: 'Eve in the wrong basis: a coin',
        },
        { tex: 'P(\\text{error} \\mid B_E = B_A) = 0', why: 'The right basis returns the true state with certainty, so she resends it exactly.' },
        { tex: 'Q = \\tfrac12\\cdot 0 + \\tfrac12\\cdot\\tfrac12', why: 'Eve picks each basis half the time, so average the two cases.' },
        {
          tex: 'Q = \\tfrac14',
          why: 'Add: nothing from the right basis, and a quarter from the wrong one.',
          view: led({ rounds: { seed: RUN9, count: 2000 }, eve: 'all', sift: true, readouts: ['qber'] }),
          viewCaption: 'a long run: the “kept bits wrong” share lands near the exact Q',
        },
      ],
    },
    claims: [
      claim('l8ErrEveRight', 'with Eve in the right basis there is no error', () => close(V.l8ErrEveRight, 0)),
      claim('l8ErrEveWrong', 'with Eve in the wrong basis Bob errs with chance ½', () => close(V.l8ErrEveWrong, 0.5)),
      claim('l8Q', 'Q = ½ · 0 + ½ · ½ = ¼', () => close(V.l8Q, 0.5 * 0 + 0.5 * 0.5)),
      claim('l8QfromDA', 'a D/A round gives the same ¼', () => close(V.l8QfromDA, 0.25)),
    ],
  },
  {
    id: 'l8-attack:b4',
    phase: 'lecture',
    text: `Q already counts only matched rounds. The sifting factor ½ belongs to the rate of kept-and-wrong rounds per photon sent, which is ${uf(V.l8PerPhoton)}, not to Q.`,
    caption: `per photon sent: ${uf(V.l8PMatch)} are kept, ${uf(V.l8Q)} of those are wrong, so ${uf(V.l8PerPhoton)}`,
    stage: led({ rounds: { seed: RUN9, count: 2000 }, eve: 'all', sift: true, readouts: ['kept', 'qber'] }),
    claims: [
      claim('l8PMatch', 'half the photons are kept', () => close(V.l8PMatch, 0.5)),
      claim('l8Q', 'a quarter of the kept ones are wrong', () => close(V.l8Q, 0.25)),
      claim('l8PerPhoton', 'so ⅛ of the photons sent end up kept and wrong', () => close(V.l8PerPhoton, V.l8PMatch * V.l8Q)),
    ],
  },
  {
    id: 'l8-attack:b5',
    phase: 'lecture',
    text: 'Once bases are public, Eve sorts her notes. In half the kept rounds she used Alice’s basis and knows the bit. In the rest her result came from an unbiased basis and says nothing. This holds for this attack only.',
    caption: `Eve knows ${uf(V.l8EveKnows)} of the kept bits`,
    stage: led({ rounds: { seed: RUN9, count: 2000 }, eve: 'all', sift: true, readouts: ['eve-knows'] }),
    claims: [claim('l8EveKnows', 'Eve knows half of the sifted bits', () => close(V.l8EveKnows, 0.5))],
  },
  {
    id: 'l8-attack:b6',
    phase: 'clue',
    text: 'Alice sends $|D\\rangle$, Bob uses D/A, and Eve uses H/V. Is the round kept? How likely is Bob’s bit to be wrong?',
    stage: pol({ state: '+x', measure: 'z' }),
    reveal: {
      text: 'It is kept, because Alice and Bob both used D/A. Eve resends $H$ or $V$, and each gives $D$ or $A$ at random, so Bob errs half the time. Only the average over Eve’s choice is ¼; had she used D/A, the error would be 0.',
      caption: 'Eve’s H photon in a D/A analyzer: a coin',
      stage: pol({ state: '+z', measure: 'x' }),
      claims: [
        claim('l8Exit', 'Bob’s error with Eve in H/V is ½', () => close(V.l8Exit, 0.5)),
        claim('l8ExitDA', 'with Eve in D/A it is 0', () => close(V.l8ExitDA, 0)),
        claim('l8Q', 'averaged over her choice it is ¼', () => close(V.l8Q, 0.25)),
      ],
    },
  },
  {
    id: 'l8-attack:b7',
    phase: 'deeper',
    text: 'Beyond the notes: if Eve intercepts only a fraction $f$ of the photons, both effects scale. Then $Q = f/4$, and she knows $f/2$ of the sifted bits. Snooping half the time gives $Q = \\tfrac18$ and leaves her knowing ¼ of the key. <<sl-q14-min-error|Go further in 709: the best guess between two non-orthogonal states>>',
    caption: 'as Eve’s fraction grows from 0 to 1, the “kept bits wrong” share and her knowledge grow together',
    stage: led({ rounds: { seed: RUN9, count: 2000 }, eve: { fraction: sweep(0, 1) }, sift: true, readouts: ['qber', 'eve-knows'] }),
    refs: [lecture('L9 p. 3 (§9.2)', 'The Lecture 9 notes say that an eavesdropper who intercepts less learns less.')],
    claims: [
      claim('l8Qf05', 'for f = ½ the error rate is ⅛', () => close(V.l8Qf05, 0.125)),
      claim('l8KnowF05', 'and she knows ¼ of the sifted bits', () => close(V.l8KnowF05, 0.25)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l8-test — Catching the eavesdropper with a test sample                                          */
/* ---------------------------------------------------------------------------------------------- */

const test: Beat[] = [
  {
    id: 'l8-test:b1',
    phase: 'lecture',
    text: 'Reveal $m$ sifted bits and count the disagreements, $n_{\\mathrm{err}}$. The observed rate is $\\hat Q = n_{\\mathrm{err}}/m$. Here each tested bit agrees with chance ¾, independently, so all $m$ agree with chance $(\\tfrac34)^m$.',
    caption: 'the chance that a test of m sifted bits shows nothing, against m',
    stage: miss({ markers: [{ x: 20 }] }),
    derivation: {
      result: 'P(\\text{no error in } m) = \\left(\\tfrac34\\right)^m',
      ground: [
        {
          tex: 'P(\\text{one bit agrees}) = 1 - Q = \\tfrac34',
          why: 'With $Q = \\tfrac14$ a tested bit is wrong a quarter of the time, so it agrees with chance three quarters.',
          view: miss({ markers: [{ x: 1 }] }),
          viewCaption: 'one tested bit: ¾',
        },
        {
          tex: 'P(\\text{no error in } m) = \\tfrac34\\cdot\\tfrac34\\cdots\\tfrac34',
          why: 'The bits are independent, so multiply the chances that each one agrees.',
        },
        {
          tex: 'P(\\text{no error in } m) = \\left(\\tfrac34\\right)^m',
          why: `Write the $m$ equal factors as a power: for $m = 20$ it is ${d(V.l8Miss20, 4)}.`,
          view: miss({ markers: [{ x: 20 }] }),
          viewCaption: `m = 20: ${d(V.l8Miss20, 4)}`,
        },
      ],
    },
    claims: [
      claim('l8Agree', 'a tested bit agrees with chance ¾', () => close(V.l8Agree, 0.75)),
      claim('l8Miss20', '(¾)^20 = 0.0032', () => close(V.l8Miss20, 0.75 ** 20)),
    ],
  },
  {
    id: 'l8-test:b2',
    phase: 'lecture',
    text: `Twenty tested bits leave Eve a ${d(V.l8Miss20 * 100, 2)}% chance of going unnoticed. A hundred leave about $${d(V.l8Miss100Mant, 1)} \\times 10^{-13}$.`,
    caption: 'the same curve on a log axis, out to m = 100',
    stage: miss({ x: { from: 0, to: 100 }, yScale: 'log', markers: [{ x: 20 }, { x: 100 }] }),
    claims: [
      claim('l8Miss20', '(¾)^20 = 0.32 %', () => close(V.l8Miss20, 0.0032, 5e-5)),
      claim('l8Miss100Mant', '(¾)^100 = 3.2 × 10⁻¹³', () => close(V.l8Miss100Mant, 3.2, 0.05)),
      claim('l8Miss100', 'and it is below one in a trillion', () => V.l8Miss100 < 1e-12),
    ],
  },
  {
    id: 'l8-test:b3',
    phase: 'lecture',
    text: 'One interception may cause no error at all, and a short test may miss her. An error does not prove Eve either: noise and imperfect devices also flip bits.',
    caption: 'a short test can show Q̂ = 0 even with Eve listening',
    stage: led({ rounds: { seed: RUN20, count: sweep(10, 400) }, eve: 'all', sift: true, test: { fraction: 0.2 }, readouts: ['qber'] }),
  },
  {
    id: 'l8-test:b4',
    phase: 'lecture',
    text: 'Three classical steps remain. [[parameter-estimation|Estimate the error rate]] and abort if it is too high. [[error-correction|Reconcile]] the strings and check that they agree. Then [[privacy-amplification|hash them into a shorter key]] that Eve knows almost nothing about.',
    caption: 'estimate, correct, shorten · all done on the public channel',
    stage: led({ rounds: { seed: RUN20, count: 400 }, eve: 'all', sift: true, test: { fraction: 0.2 }, readouts: ['qber'] }),
  },
  {
    id: 'l8-test:b5',
    phase: 'lecture',
    text: 'The ¼ belongs to this one attack. It is not the error rate of every attack, and not an acceptable error level. A full security proof goes far beyond today.',
    caption: 'a threshold for real devices needs a security proof',
    stage: led({ rounds: { seed: RUN20, count: 400 }, eve: 'all', sift: true, readouts: ['qber'] }),
    fidelity: ['bb84-q-this-attack'],
    refs: [shorPreskill],
    claims: [claim('l8Q', 'the error rate of the full attack is ¼', () => close(V.l8Q, 0.25))],
  },
  {
    id: 'l8-test:b6',
    phase: 'clue',
    text: 'How many sifted bits must they test to catch this Eve with at least 99% certainty?',
    stage: miss({ markers: [{ x: 20 }] }),
    reveal: {
      text: `Solve $(\\tfrac34)^m \\le 0.01$. Sixteen bits still leave ${d(V.l8Miss16 * 100, 3)}%, so seventeen are needed: $(\\tfrac34)^{17} \\approx ${d(V.l8Miss17, 4)}$.`,
      caption: 'm = 16 is just above the 1% line; m = 17 is below it',
      stage: miss({ markers: [{ x: 16 }, { x: 17 }], yLines: [{ y: 0.01, label: '1%' }] }),
      claims: [
        claim('l8Confidence', 'catching Eve with 99 % certainty', () => close(V.l8Confidence, 0.99)),
        claim('l8Risk', 'allows a miss chance of 0.01', () => close(V.l8Risk, 0.01)),
        claim('l8Miss16', '(¾)^16 = 1.002 %', () => close(V.l8Miss16, 0.01002, 5e-6)),
        claim('l8Miss17', '(¾)^17 = 0.0075', () => close(V.l8Miss17, 0.0075, 5e-5)),
        claim('l8M99', 'the smallest m is 17', () => V.l8M99 === 17),
      ],
    },
  },
]

/** The story of each unit, by unit id. */
export const L8_STORY: Record<string, Beat[]> = {
  'l8-variance-sum': varianceSum,
  'l8-polarization': polarization,
  'l8-turning': turning,
  'l8-photon-spin': photonSpin,
  'l8-key': key,
  'l8-bb84': bb84,
  'l8-attack': attack,
  'l8-test': test,
}

