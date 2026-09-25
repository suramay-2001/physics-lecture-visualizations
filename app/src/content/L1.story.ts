/**
 * Lecture 1 scroll story (owner: P). Beats per P2-L1-story §1 with decision #24 (b5a/b5b split,
 * mixed-state teaser last in l1-vectors, "z-first / x-first" instead of A/B) and D-L1-scenes §4 shots.
 *
 * Rules kept here:
 * - Stage states carry physics inputs only (sources, axes, kets, degrees); the resolver computes every
 *   probability. Numbers in the prose come from L1.values.ts and are backed by keyed claims.
 * - Clue beats are click-to-reveal (decision #17): `text` is the question, `reveal` the reasoning.
 * - Core text: plain, ≤ 25 words per sentence, symbols defined before use (content/symbols.test.ts).
 * - "Both paths" lives only in the lab fidelity note `lab-both-paths` (decision #7).
 */
import type { Beat, HilbertPlaneState, LabBench, LabDevice, LabState, Ref, StageKind, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import { URL } from './refs'
import { V, claim, close, d, pct, tf, uf } from './L1.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const main = (source: LabBench['source'], devices: LabDevice[], showPrep = false): LabBench =>
  showPrep ? { id: 'main', source, devices, showPrep } : { id: 'main', source, devices }
const lab = (bench: LabBench, extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches: [bench], ...extra })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })

const Z: LabDevice = { axis: 'z' }
const X: LabDevice = { axis: 'x' }
const Zkeep: LabDevice = { axis: 'z', keep: '+' }
const Xkeep: LabDevice = { axis: 'x', keep: '+' }
const sweep = (from: number, to: number, ease?: 'smooth') => (ease ? { from, to, ease } : { from, to })

// l1-logic benches (D §4.4): top 'A' = z-first, bottom 'B' = x-first; both fed by a greyed +z module.
const zFirst: LabBench = { id: 'A', source: '+z', showPrep: true, devices: [Zkeep, X] }
const xFirst: LabBench = { id: 'B', source: '+z', showPrep: true, devices: [{ axis: 'x', keep: '-', openOther: true }, Z] }
const logic = (extra: Omit<LabState, 'kind' | 'benches'>): LabState => ({ kind: 'lab-r3', benches: [zFirst, xFirst], shot: 'L-3Q', ...extra })

// MIT 8.05 notes (ch. "Spin one-half…", §1, eqs. 1.14–1.15) give the force and the μ_z ∂B_z/∂z reduction; they
// never mention torque, precession or a uniform field (judge, Round-3 #2), so only the force is credited to them.
const mit3: Ref = {
  source: 'mit805',
  where: 'Lecture 3; notes “Spin one-half, bras, kets, and operators”, §1',
  adds: 'The force on a moment in a non-uniform field, $\\vec F = \\nabla(\\vec\\mu\\cdot\\vec B)$, and why it sorts atoms by $\\mu_z$.',
  url: URL.mit805(3),
}

/* ---------------------------------------------------------------------------------------------- */
/* l1-quantized — Two spots, not a smear                                                          */
/* ---------------------------------------------------------------------------------------------- */

const quantized: Beat[] = [
  {
    id: 'l1-quantized:b1',
    phase: 'lecture',
    text: 'Silver atoms leave a hot [[oven]] as a narrow [[beam]]. Each [[silver-atom|atom]] carries a tiny [[magnetic-moment|magnetic moment]] $\\htmlClass{term-mu}{\\vec\\mu}$ from its [[spin]], like a small bar magnet. Near the {{edge|sharp pole}} the field is stronger, so the magnet pushes on the atom.',
    caption: 'oven → [[sg-magnet|Stern–Gerlach magnet]] (SG$_z$) → glass plate',
    stage: lab(main('oven', [Z]), { deposit: 'clear', shot: 'L-EST' }),
    terms: { mu: t('lab-r3', 'atom-moment'), edge: t('lab-r3', 'knife-edge') },
    fidelity: ['lab-glow-not-light'],
  },
  {
    id: 'l1-quantized:b2',
    phase: 'lecture',
    text: '[[classical|Classically]], each moment points in a random direction. Its vertical part is $\\htmlClass{term-mucos}{\\mu_z = \\mu\\cos\\theta_\\mu}$, where $\\htmlClass{term-thmu}{\\theta_\\mu}$ is its angle from $z$. That can be anything from $\\htmlClass{term-band}{-\\mu}$ to $+\\mu$, so the [[plate]] would show one continuous band.',
    caption: 'classical prediction: one continuous band — not what happens',
    stage: lab(main('oven', [Z]), { model: 'classical', ghostBand: true, deposit: 'clear', shot: 'L-OTS' }),
    terms: { mucos: t('lab-r3', 'drop-line'), thmu: t('lab-r3', 'angle-arc'), band: t('lab-r3', 'ghost-band') },
    fidelity: ['lab-bar-magnets'],
  },
  {
    id: 'l1-quantized:b3',
    phase: 'lecture',
    text: 'The plate shows two spots and nothing between them. Every atom is [[deflection|deflected]] up or down by the same amount. The [[s-z|spin along z]] is only ever $\\htmlClass{term-sz}{S_z} = \\htmlClass{term-plus}{+\\tfrac{\\hbar}{2}}$ or $\\htmlClass{term-minus}{-\\tfrac{\\hbar}{2}}$, where [[hbar|ħ]] is a fixed constant of nature.',
    caption: `${uf(V.ovenZPlus)} of the atoms in each spot; the result is [[quantized]]`,
    stage: lab(main('oven', [Z]), { ghostBand: true, shot: 'L-PLATE' }),
    terms: { sz: t('lab-r3', 'gradient-arrow'), plus: t('lab-r3', 'spot-plus'), minus: t('lab-r3', 'spot-minus') },
    fidelity: ['lab-glow-not-light', 'lab-moment-opposite'],
    claims: [claim('ovenZPlus', 'oven → z: half of the atoms in each spot', () => close(V.ovenZPlus, 0.5) && close(V.ovenZMinus, 0.5))],
  },
  {
    id: 'l1-quantized:b4',
    phase: 'lecture',
    text: '{{stop|Block}} the down beam and send the up beam through a second $z$ magnet. Every atom goes up again. We name the [[state]] of these atoms $\\htmlClass{term-chip}{|{+z}\\rangle}$, a [[ket]]; the blocked down beam would be $|{-z}\\rangle$.',
    caption: `second plate: ${pct(V.repeatZPlate)} in the + spot`,
    stage: lab(main('oven', [Zkeep, Z]), { readouts: ['blocked'], shot: 'L-TRACK' }),
    terms: { stop: t('lab-r3', 'beam-stop'), chip: t('lab-r3', 'chip-1') },
    fidelity: ['lab-chips-captions'],
    claims: [claim('repeatZPlate', 'z then z (keep +): every plate atom is +', () => close(V.repeatZPlate, 1))],
  },
  {
    id: 'l1-quantized:b5a',
    phase: 'books',
    text: 'In a uniform [[magnetic-field|field]] $\\vec B$, a moment only [[precession|precesses]], and the beam goes straight. A push needs a field that changes across the gap, a [[gradient]] $\\nabla$. Zwiebach (MIT 8.05) writes that force as $\\htmlClass{term-force}{\\vec F = \\nabla(\\vec\\mu\\cdot\\vec B)}$. The sharp pole makes the gradient large.',
    caption: 'uniform field — no push, one spot',
    stage: lab(main('oven', [Z]), { field: 'uniform', shot: 'L-SIDE' }),
    terms: { force: t('lab-r3', 'streamlines') },
    fidelity: ['lab-field-qualitative'],
    refs: [
      mit3,
      { source: 'townsend', where: '§1.1, pp. 1–5; §2.2, p. 33', adds: 'The force on the moment is the gradient of $\\vec\\mu\\cdot\\vec B$; shaping one pole into a sharp edge makes that gradient large. In a uniform field a classical moment just precesses about the field (§2.2).' },
    ],
  },
  {
    id: 'l1-quantized:b5b',
    phase: 'books',
    text: 'Susskind swaps the magnet for an ideal {{box|box}} that reads $\\sigma = \\pm1$. Here $\\sigma = 2S_z/\\hbar$ is the [[sigma-reading|spin reading in units of ħ/2]]: the same answer without units.',
    caption: 'black box: windows σ = +1 and σ = −1',
    stage: lab(main('oven', [Z]), { model: 'black-box', shot: 'L-SIDE' }),
    terms: { box: t('lab-r3', 'box-readout') },
    refs: [{ source: 'susskind', where: '§1.2–1.3', adds: 'An idealized apparatus that only ever shows ±1; repeating a measurement repeats the answer.' }],
  },
  {
    id: 'l1-quantized:b6',
    phase: 'clue',
    text: 'A coin also has two outcomes. Could each atom simply carry a hidden up/down label that the magnet reads?',
    stage: lab(main('oven', [Zkeep, Z]), { shot: 'L-WIDE' }),
    reveal: {
      text: 'So far, yes. A [[hidden-label|hidden label]] explains both the two spots and the repeat result. Two outcomes alone are not quantum. The next unit turns the magnet and breaks the label.',
      caption: 'hypothesis: each atom carries a tag',
      stage: lab(main('oven', [Zkeep, Z]), { model: 'hidden-label', shot: 'L-WIDE' }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l1-sequential — A new axis erases the old answer                                               */
/* ---------------------------------------------------------------------------------------------- */

const zxz = main('oven', [Zkeep, Xkeep, Z])

const sequential: Beat[] = [
  {
    id: 'l1-sequential:b1',
    phase: 'lecture',
    text: "Keep the up beam, then turn the {{m2|second magnet}} 90° about the beam. Now it measures along $x$. A stored 'up' arrow has no $x$ part, so classically nothing should deflect.",
    caption: 'dashed ring: the classical expectation, no deflection',
    stage: lab(main('oven', [Zkeep, { axis: { tiltDeg: sweep(0, 90, 'smooth') } }]), { deposit: 'clear', shot: 'L-END' }),
    terms: { m2: t('lab-r3', 'magnet-2') },
  },
  {
    id: 'l1-sequential:b2',
    phase: 'lecture',
    text: `Instead every atom goes {{right|right}} (+x) or {{left|left}} (−x), half each, and none lands in the middle. The [[conditional-probability|chance]] of each side, for atoms prepared in $|{+z}\\rangle$, is $P(\\pm x\\mid{+z}) = ${tf(V.pXgivenZ)}$.`,
    caption: `right ${pct(V.pXgivenZ)} · left ${pct(1 - V.pXgivenZ)}`,
    stage: lab(main('oven', [Zkeep, X]), { shot: 'L-PLATE' }),
    terms: { right: t('lab-r3', 'spot-plus'), left: t('lab-r3', 'spot-minus') },
    claims: [claim('pXgivenZ', 'P(±x | +z) = 1/2', () => close(V.pXgivenZ, 0.5))],
  },
  {
    id: 'l1-sequential:b3',
    phase: 'lecture',
    text: 'Keep the right beam and measure $x$ again. Every atom goes right. These atoms now carry a definite $x$ answer, and we name their state $\\htmlClass{term-chip}{|{+x}\\rangle}$.',
    caption: `beam: 1 → ${uf(V.zxAlive1)} → ${uf(V.zxxAlive2)} of the oven; last plate ${pct(V.zxxPlate)} right`,
    stage: lab(main('oven', [Zkeep, Xkeep, X]), { readouts: ['fractions'], shot: 'L-TRACK' }),
    terms: { chip: t('lab-r3', 'chip-2') },
    claims: [
      claim('zxAlive1', 'half the oven passes the first z magnet', () => close(V.zxAlive1, 0.5)),
      claim('zxxAlive2', 'a quarter of the oven passes the first x magnet', () => close(V.zxxAlive2, 0.25)),
      claim('zxxPlate', 'x then x: every plate atom goes right', () => close(V.zxxPlate, 1)),
    ],
  },
  {
    id: 'l1-sequential:b4',
    phase: 'lecture',
    text: `Now turn the {{last|last magnet}} back to $z$. The result is 50/50 again: $P(\\pm z\\mid{+x}) = ${tf(V.pZgivenX)}$. The earlier 'up' is gone.`,
    caption: `fractions of the oven beam: 1 → ${uf(V.zxzAlive1)} → ${uf(V.zxzAlive2)} → ${uf(V.zxzPlus)} + ${uf(V.zxzMinus)}`,
    stage: lab(zxz, { readouts: ['fractions'], shot: 'L-WIDE' }),
    terms: { last: t('lab-r3', 'magnet-3') },
    claims: [
      claim('pZgivenX', 'P(±z | +x) = 1/2', () => close(V.pZgivenX, 0.5)),
      claim('zxzAlive1', 'half the oven passes the first z magnet', () => close(V.zxzAlive1, 0.5)),
      claim('zxzAlive2', 'a quarter passes the x magnet', () => close(V.zxzAlive2, 0.25)),
      claim('zxzPlus', 'an eighth ends in +', () => close(V.zxzPlus, 0.125)),
      claim('zxzMinus', 'an eighth ends in −', () => close(V.zxzMinus, 0.125)),
    ],
  },
  {
    id: 'l1-sequential:b5',
    phase: 'books',
    text: 'Susskind stresses that experiments are never gentle. A measurement along $x$ does not just read a value. It [[prepare|prepares]] {{atom|each kept atom}} in $\\htmlClass{term-chip}{|{+x}\\rangle}$, and that erases the $z$ answer.',
    caption: 'one tracked atom: its label changes at the magnet exit',
    stage: lab(zxz, { flow: 'single', shot: 'L-DETAIL' }),
    terms: { atom: t('lab-r3', 'tracked-atom'), chip: t('lab-r3', 'chip-2') },
    fidelity: ['lab-both-paths', 'lab-chips-captions'],
    refs: [
      { source: 'susskind', where: '§1.4 Experiments are never gentle', adds: 'Any measurement strong enough to tell you something also changes something else.' },
      { source: 'townsend', where: '§1.2 Exps. 2–3, pp. 5–8', adds: 'The same sequences as Experiments 2 and 3. His "modified" SG device with one path blocked (Fig. 1.5, p. 8) is this bench’s beam stop.' },
    ],
  },
  {
    id: 'l1-sequential:b6',
    phase: 'clue',
    text: 'Take the middle $x$ magnet out. What does the last $z$ magnet do now?',
    stage: lab(zxz, { readouts: ['fractions'], shot: 'L-WIDE' }),
    reveal: {
      text: `Every atom that reaches the plate lands in the + spot again (${pct(V.repeatZPlate)}). So the middle measurement erased the answer, not the time or the distance travelled.`,
      stage: lab(main('oven', [Zkeep, Z]), { readouts: ['fractions'], shot: 'L-WIDE' }),
      claims: [claim('repeatZPlate', 'z then z: every plate atom is +', () => close(V.repeatZPlate, 1))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l1-average — Single atoms are random, averages are classical                                   */
/* ---------------------------------------------------------------------------------------------- */

const tilted = (axis: LabDevice['axis']) => main('+z', [{ axis }], true)

const average: Beat[] = [
  {
    id: 'l1-average:b1',
    phase: 'lecture',
    text: 'Prepare atoms in $|{+z}\\rangle$. Tilt the magnet by an angle $\\htmlClass{term-theta}{\\theta}$ from $z$ toward $x$. Each atom still lands in just the + spot or the − spot.',
    caption: 'θ sweeps from 0° to 180°',
    stage: lab(tilted({ tiltDeg: sweep(0, 180) }), { shot: 'L-END' }),
    terms: { theta: t('lab-r3', 'tilt-arc') },
  },
  {
    id: 'l1-average:b2',
    phase: 'lecture',
    text: "Call each reading $\\sigma_n = \\pm1$: the spin along the magnet's [[unit-vector|axis]] $\\htmlClass{term-n}{\\hat n}$, in units of ħ/2. Let $\\htmlClass{term-m}{\\hat m}$ be the preparation axis, here $\\hat z$. The [[expectation|average reading]] is $\\htmlClass{term-avg}{\\langle\\sigma_n\\rangle} = \\htmlClass{term-dot}{\\hat n\\cdot\\hat m} = \\cos\\theta$. A classical arrow would give this [[dot-product|projection]] for every atom; quantum atoms give it only on average.",
    caption: 'tick: the average of the ±1 readings',
    stage: lab(tilted({ tiltDeg: sweep(180, 0) }), { readouts: ['centroid'], shot: 'L-PLATE' }),
    terms: { n: t('lab-r3', 'axis-n'), m: t('lab-r3', 'axis-m'), avg: t('lab-r3', 'centroid'), dot: t('lab-r3', 'drop-line') },
  },
  {
    id: 'l1-average:b3',
    phase: 'lecture',
    text: 'The readings are ±1, so their average is $2P(+) - 1$. Solving for the [[probability]] gives $\\htmlClass{term-p}{P(+)} = \\tfrac{1+\\cos\\theta}{2} = \\cos^2\\tfrac{\\theta}{2}$, by the [[half-angle|half-angle identity]].',
    caption: `θ = 45°: P(+) ≈ ${d(V.p45)} · average ≈ ${d(V.avg45)}`,
    stage: lab(tilted(45), { readouts: ['fill-bar', 'centroid'], shot: 'L-PLATE' }),
    terms: { p: t('lab-r3', 'fill-bar') },
    claims: [
      claim('p45', 'P(+) at 45° = cos²(22.5°)', () => close(V.p45, Math.cos(Math.PI / 8) ** 2)),
      claim('avg45', 'average at 45° = 1/√2', () => close(V.avg45, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l1-average:b4',
    phase: 'books',
    text: 'Each single reading is unpredictable, but the mean of many is not. For $N_{\\text{atoms}}$ readings, the [[scatter]] of their mean shrinks like $\\htmlClass{term-band}{1/\\sqrt{N_{\\text{atoms}}}}$.',
    caption: `10, 100, 1000 atoms: band ±${d(V.band10)}, ±${d(V.band100)}, ±${d(V.band1000)}`,
    stage: lab(tilted(45), { batches: [10, 100, 1000], readouts: ['sigma-band', 'centroid'], shot: 'L-PLATE-C' }),
    terms: { band: t('lab-r3', 'sigma-band') },
    refs: [{ source: 'townsend', where: '§1.4, pp. 15–16 (eqs. 1.20–1.22)', adds: 'Defines the expectation value and the uncertainty: the spread of single readings around their mean.' }],
    claims: [
      claim('band10', 'scatter of the mean of 10 readings at 45° = sin 45°/√10', () => close(V.band10, Math.SQRT1_2 / Math.sqrt(10))),
      claim('band100', 'scatter of the mean of 100 readings', () => close(V.band100, Math.SQRT1_2 / 10)),
      claim('band1000', 'scatter of the mean of 1000 readings', () => close(V.band1000, Math.SQRT1_2 / Math.sqrt(1000))),
    ],
  },
  {
    id: 'l1-average:b5',
    phase: 'clue',
    text: `The notes say ${uf(V.p60)} of the atoms go up-right at 45°. Does the rule agree?`,
    caption: 'errata: L1 p.4',
    stage: lab(tilted(45), { readouts: ['fill-bar'], shot: 'L-PLATE' }),
    claims: [claim('p60', 'a 3/4 split is P(+) at 60°', () => close(V.p60, 0.75))],
    reveal: {
      text: `No. The rule gives $P(+) = \\cos^2 22.5^\\circ \\approx ${d(V.p45)}$ at 45°. A 3 : 1 split needs $\\cos\\theta = ${tf(V.cos60)}$, which happens at $\\theta = ${d(V.theta34, 0)}^\\circ$ (see the [[errata]] note).`,
      stage: lab(tilted({ tiltDeg: sweep(45, 60) }), { readouts: ['fill-bar'], shot: 'L-PLATE' }),
      claims: [
        claim('p45', 'P(+) at 45° = cos²(22.5°)', () => close(V.p45, Math.cos(Math.PI / 8) ** 2)),
        claim('cos60', 'cos 60° = 1/2', () => close(V.cos60, 0.5)),
        claim('theta34', '3/4 split at 60°', () => close(V.theta34, 60, 1e-6)),
      ],
    },
  },
  {
    id: 'l1-average:b6',
    phase: 'clue',
    text: 'Why does a half angle appear in $P(+) = \\cos^2\\tfrac{\\theta}{2}$?',
    stage: lab(tilted({ tiltDeg: sweep(0, 180) }), { readouts: ['fill-bar'], shot: 'L-END' }),
    reveal: {
      text: 'Let $|{+n}\\rangle$ be the state that reads + along $\\hat n$ every time. In [[state-space|state space]] its angle to $|{+z}\\rangle$ is only $\\htmlClass{term-half}{\\theta/2}$. Its {{shadow|shadow}} on $|{+z}\\rangle$ has length $\\cos\\tfrac{\\theta}{2}$, and squaring gives $P(+)$.',
      caption: 'top: lab angle θ · bottom: state-space angle θ/2',
      stage: {
        layout: 'split',
        top: lab(tilted({ tiltDeg: sweep(0, 180) }), { shot: 'L-END' }),
        bottom: plane({ psi: { blochDeg: sweep(0, 180) }, basis: 'z', arc: true, shadows: true }),
      },
      terms: { half: t('hilbert-plane', 'angle-arc'), shadow: t('hilbert-plane', 'shadow-1') },
      fidelity: ['plane-half-angles'],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l1-logic — When "or" depends on the order                                                      */
/* ---------------------------------------------------------------------------------------------- */

const logicBeats: Beat[] = [
  {
    id: 'l1-logic:b1',
    phase: 'lecture',
    text: "Classical states form a [[set]]. A [[proposition]] like 'up OR right' is simply true or false. Checking it in either order gives the same answer.",
    caption: 'top: z-first · bottom: x-first · both fed with $|{+z}\\rangle$',
    stage: logic({ flow: 'off', readouts: ['truth-table'] }),
  },
  {
    id: 'l1-logic:b2',
    phase: 'lecture',
    text: 'z-first: the $z$ test comes first. Every atom prepared in $|{+z}\\rangle$ reads up, so the claim is {{ztrue|already true}}, whatever $x$ says next.',
    caption: `z-first: false ${pct(V.falseZFirst)}`,
    stage: logic({ flow: 'stream', readouts: ['truth-table'] }),
    terms: { ztrue: t('lab-r3', 'tally-true') },
    claims: [claim('falseZFirst', 'z-first: never false', () => close(V.falseZFirst, 0))],
  },
  {
    id: 'l1-logic:b3',
    phase: 'lecture',
    text: `x-first: half the atoms read left and become $\\htmlClass{term-chip}{|{-x}\\rangle}$. Half of those then read down. The claim is false for $\\htmlClass{term-false}{${tf(V.falseXFirst)}}$ of the atoms.`,
    caption: `x-first: true ${pct(V.trueXFirst)} · false ${pct(V.falseXFirst)}`,
    stage: logic({ flow: 'stream', readouts: ['truth-table'] }),
    terms: { chip: t('lab-r3', 'chip-1'), false: t('lab-r3', 'false-ring') },
    claims: [
      claim('falseXFirst', 'x-first: false for 1/4', () => close(V.falseXFirst, 0.25)),
      claim('trueXFirst', 'x-first: true for 3/4', () => close(V.trueXFirst, 0.75)),
    ],
  },
  {
    id: 'l1-logic:b4',
    phase: 'books',
    text: "For [[set|sets]], 'A or B' is the [[union]] $\\htmlClass{term-union}{A\\cup B}$, and looking at a set's members never changes them. So the testing order cannot matter. Susskind runs this test on spins and finds that it does.",
    caption: `false: z-first ${pct(V.falseZFirst)} · x-first ${pct(V.falseXFirst)}`,
    stage: logic({ flow: 'off', dim: true, readouts: ['tally-bars'] }),
    terms: { union: t('lab-r3', 'tally-bar-1') },
    refs: [
      { source: 'susskind', where: '§1.5–1.7', adds: 'The same "A or B" test with ±1 readings, and the lesson that quantum propositions need a different logic from sets.' },
      { source: 'sets', where: '§1.1.3 Set operations', adds: 'Union and intersection defined precisely; nothing in them refers to an order of testing.' },
    ],
    claims: [
      claim('falseZFirst', 'z-first: never false', () => close(V.falseZFirst, 0)),
      claim('falseXFirst', 'x-first: false for 1/4', () => close(V.falseXFirst, 0.25)),
    ],
  },
  {
    id: 'l1-logic:b5',
    phase: 'clue',
    text: 'Classically, looking does not disturb, so the order cannot matter. Which step of the x-first order breaks that?',
    stage: logic({ flow: 'off', shot: 'L-DETAIL' }),
    reveal: {
      text: "For the atoms that read left, the $x$ test changes the state from $|{+z}\\rangle$ to $\\htmlClass{term-chip}{|{-x}\\rangle}$ before $z$ is read. So the assumption that fails is that checking does not disturb. This alone does not rule out every hidden-answer model; Bell's theorem comes later.",
      stage: logic({ flow: 'single', shot: 'L-DETAIL' }),
      terms: { chip: t('lab-r3', 'chip-1') },
      fidelity: ['lab-chips-captions'],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l1-vectors — States are vectors                                                                */
/* ---------------------------------------------------------------------------------------------- */

const halfAngleTop = lab(tilted({ tiltDeg: sweep(0, 180) }), { shot: 'L-END' })

const vectors: Beat[] = [
  {
    id: 'l1-vectors:b1',
    phase: 'lecture',
    text: 'A $z$ magnet always tells up from down: they are [[distinguishable|perfectly distinguishable]]. So we draw $\\htmlClass{term-up}{|{+z}\\rangle}$ and $\\htmlClass{term-down}{|{-z}\\rangle}$ as [[orthogonal|perpendicular]] unit arrows in [[state-space|state space]].',
    caption: 'notation: the notes’ |up⟩, |down⟩, |right⟩, |left⟩ are $|{\\pm z}\\rangle$, $|{\\pm x}\\rangle$ here, and $|u\\rangle$, $|d\\rangle$, $|r\\rangle$, $|l\\rangle$ in Susskind',
    stage: { layout: 'inset', main: plane({ basis: 'z', rightAngle: true }), inset: lab(main('oven', [Z]), { shot: 'L-SIDE' }) },
    terms: { up: t('hilbert-plane', 'basis-1'), down: t('hilbert-plane', 'basis-2') },
    fidelity: ['plane-angles-true'],
  },
  {
    id: 'l1-vectors:b2',
    phase: 'lecture',
    text: 'Any state is a [[superposition]] $|\\psi\\rangle = \\htmlClass{term-alpha}{\\alpha}|{+z}\\rangle + \\htmlClass{term-beta}{\\beta}|{-z}\\rangle$, with [[amplitude|coefficients]] $\\alpha$ and $\\beta$. The outcome probabilities are $\\htmlClass{term-a2}{|\\alpha|^2}$ and $\\htmlClass{term-b2}{|\\beta|^2}$. They add to 1, so $|\\psi\\rangle$ is [[normalized]]: its length is 1. The [[inner-product|inner product]] reads off a coordinate: $\\langle{+z}|\\psi\\rangle = \\alpha$.',
    caption: 'shadows on the axes; bars show their squares',
    stage: plane({ psi: { planeDeg: sweep(0, 90) }, basis: 'z', shadows: true }),
    terms: { alpha: t('hilbert-plane', 'shadow-1'), beta: t('hilbert-plane', 'shadow-2'), a2: t('hilbert-plane', 'bar-1'), b2: t('hilbert-plane', 'bar-2') },
    fidelity: ['plane-shadow-born'],
  },
  {
    id: 'l1-vectors:b3',
    phase: 'lecture',
    text: 'Right gives up and down half the time each, so both coefficients have size $\\htmlClass{term-amp}{1/\\sqrt2}$. Equal odds fix only the sizes. Choosing both positive is a convention that names the $x$ direction: $|{+x}\\rangle = (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$.',
    caption: `bars: ${d(V.pUpRight, 2)} / ${d(1 - V.pUpRight, 2)}`,
    stage: plane({ psi: '+x', basis: 'z', shadows: true, ticks: true }),
    terms: { amp: t('hilbert-plane', 'shadow-1') },
    claims: [
      claim('pUpRight', '|⟨+z|+x⟩|² = 1/2', () => close(V.pUpRight, 0.5)),
      claim('ampUpRight', '⟨+z|+x⟩ = 1/√2', () => close(V.ampUpRight, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l1-vectors:b4',
    phase: 'lecture',
    text: 'Left must be perfectly distinguishable from right, so it is {{ra|orthogonal to it}}. That forces the minus sign: $|{-x}\\rangle = (|{+z}\\rangle - |{-z}\\rangle)/\\sqrt2$. Measured along $x$, the state $|{+x}\\rangle$ now gives + every time.',
    caption: `x-basis bars: ${d(V.pRightRight, 2)} / ${d(V.pRightLeft, 2)}`,
    stage: plane({ psi: '+x', basis: 'x', shadows: true, rightAngle: true, others: [{ ket: '-x', role: 'second' }] }),
    terms: { ra: t('hilbert-plane', 'right-angle') },
    claims: [
      claim('pRightRight', '+x measured along x: + every time', () => close(V.pRightRight, 1)),
      claim('pRightLeft', '+x ⟂ −x', () => close(V.pRightLeft, 0)),
    ],
  },
  {
    id: 'l1-vectors:b5',
    phase: 'books',
    text: "Axler's rules for a [[vector-space|vector space]] mention adding and scaling, never arrows in 3D. Susskind notes that $|\\psi\\rangle$ and $\\htmlClass{term-ghost}{-|\\psi\\rangle}$ are the same state: an [[global-phase|overall sign]] never matters. A [[relative-phase|relative sign]] between the two terms does matter: it separates $|{+x}\\rangle$ from $|{-x}\\rangle$.",
    caption: 'ghost arrow: the same physical state',
    stage: plane({ psi: '+x', basis: 'z', others: [{ ket: { neg: '+x' }, role: 'ghost', badge: 'same physical state' }] }),
    terms: { ghost: t('hilbert-plane', 'ghost') },
    fidelity: ['plane-sign-twice'],
    refs: [
      { source: 'axler', where: '§1B, Definition 1.20 (vector space)', adds: 'The vector-space axioms, stated precisely. Nothing in them mentions arrows or 3D.' },
      { source: 'susskind', where: '§1.9, §2.1–2.3', adds: 'Derives the right and left states from the same two facts, and points out the phase freedom behind our choice of signs.' },
      { source: 'townsend', where: '§1.3, pp. 10–13; §1.4, pp. 14–15', adds: 'Builds the basis from Experiment 1, then writes $|{+x}\\rangle$ with explicit phases before choosing real coefficients.' },
    ],
    claims: [claim('negSame', '−|+x⟩ is the same physical state as |+x⟩', () => V.negSame === 1)],
  },
  {
    id: 'l1-vectors:b6',
    phase: 'clue',
    text: 'In the lab, up and down point opposite ways, 180° apart. How far apart are $|{+z}\\rangle$ and $|{-z}\\rangle$ in state space?',
    stage: { layout: 'split', top: halfAngleTop, bottom: plane({ psi: '+z', basis: 'z' }) },
    reveal: {
      text: 'Only 90°: they are perpendicular. Every state-space angle is half the matching lab angle. That is where the $\\htmlClass{term-half}{\\tfrac{\\theta}{2}}$ in $P(+) = \\cos^2\\tfrac{\\theta}{2}$ comes from.',
      caption: 'top: lab angle θ · bottom: state-space angle θ/2',
      stage: { layout: 'split', top: halfAngleTop, bottom: plane({ psi: { blochDeg: sweep(0, 180) }, basis: 'z', arc: true }) },
      terms: { half: t('hilbert-plane', 'angle-arc') },
      fidelity: ['plane-half-angles'],
    },
  },
  {
    id: 'l1-vectors:b7',
    phase: 'clue',
    beyondLecture: true,
    text: 'Is $|{+x}\\rangle$ just a beam of half up atoms and half down atoms? Along $z$ you cannot tell: both beams split 50/50.',
    caption: 'top: a $|{+x}\\rangle$ beam · bottom: the oven beam · both into a $z$ magnet',
    stage: {
      kind: 'lab-r3',
      benches: [
        { id: 'A', source: '+x', devices: [Z] },
        { id: 'B', source: 'oven', devices: [Z] },
      ],
      shot: 'L-3Q',
    },
    claims: [
      claim('plusXAlongZ', '|+x⟩ into a z magnet: 50/50', () => close(V.plusXAlongZ, 0.5)),
      claim('ovenZPlus', 'oven into a z magnet: 50/50', () => close(V.ovenZPlus, 0.5)),
    ],
    reveal: {
      text: `No. Along $x$, $|{+x}\\rangle$ gives + every time (${pct(V.plusXAlongX)}), while a half-and-half [[mixture]] such as the [[unpolarized]] oven beam still splits 50/50. In the [[bloch-ball|Bloch ball]] of Lecture 6, $|{+x}\\rangle$ sits on the surface and the oven beam sits at the {{centre|centre}}.`,
      caption: 'beyond the lecture: pure state on the surface, mixture inside',
      stage: {
        layout: 'split',
        top: {
          kind: 'lab-r3',
          benches: [
            { id: 'A', source: '+x', devices: [X] },
            { id: 'B', source: 'oven', devices: [X] },
          ],
          shot: 'L-3Q',
        },
        bottom: { kind: 'bloch-ball', point: '+x', compare: 'oven', shot: 'B-STD' },
      },
      terms: { centre: t('bloch-ball', 'center') },
      fidelity: ['ball-surface-pure'],
      claims: [
        claim('plusXAlongX', '|+x⟩ into an x magnet: + every time', () => close(V.plusXAlongX, 1)),
        claim('ovenAlongX', 'oven into an x magnet: 50/50', () => close(V.ovenAlongX, 0.5)),
      ],
    },
  },
]

/** Story beats per unit id (wired into L1.ts). */
export const L1_STORY: Record<string, Beat[]> = {
  'l1-quantized': quantized,
  'l1-sequential': sequential,
  'l1-average': average,
  'l1-logic': logicBeats,
  'l1-vectors': vectors,
}
