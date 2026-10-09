/**
 * Stage vocabulary: shot names and term-link anchors, as pure data (owner: D after the l1-freeze tag).
 *
 * Seeded by W from D-L1-scenes §4 (shot library) and the P2 §1 "Links" lines. D may ADD names at will;
 * removing or renaming one is an interface change, because the content test checks every beat's
 * `terms[id].anchor ∈ ANCHORS[kind]` and every `shot` against these unions.
 */
import type { StageKind } from './stage'

/** Lab shots (D §4.0 shot library; lens · position → target in physics coordinates). */
export const LAB_SHOTS = ['L-EST', 'L-OTS', 'L-SIDE', 'L-END', 'L-PLATE', 'L-PLATE-C', 'L-TRACK', 'L-DETAIL', 'L-WIDE', 'L-3Q'] as const
export type LabShot = (typeof LAB_SHOTS)[number]
/** hilbert-plane is orthographic, unlit and static (D §3.2). */
export const PLANE_SHOTS = ['H-FLAT'] as const
export type PlaneShot = (typeof PLANE_SHOTS)[number]
export const BLOCH_SHOTS = ['B-STD', 'B-EQUATOR', 'B-POLE'] as const
export type BlochShot = (typeof BLOCH_SHOTS)[number]
export const BALL_SHOTS = ['B-STD', 'B-SECTION'] as const
export type BallShot = (typeof BALL_SHOTS)[number]
export const HOPF_SHOTS = ['HF-WIDE', 'HF-FIBER', 'HF-PAIR'] as const
export type HopfShot = (typeof HOPF_SHOTS)[number]
export const OPERATOR_SHOTS = ['O-STD', 'O-GAUGE'] as const
export type OperatorShot = (typeof OPERATOR_SHOTS)[number]
/** complex-plane (SVG) is flat and square: one shot (P-F1-story §9.2 S4). */
export const COMPLEX_SHOTS = ['C-FLAT'] as const
export type ComplexShot = (typeof COMPLEX_SHOTS)[number]
/** amplitudes (SVG): bars along one axis. */
export const AMP_SHOTS = ['A-BARS'] as const
export type AmpShot = (typeof AMP_SHOTS)[number]
/** circuit (SVG): wires left to right. */
export const CIRCUIT_SHOTS = ['Q-WIRES'] as const
export type CircuitShot = (typeof CIRCUIT_SHOTS)[number]
/** matrix (SVG): a square grid of cells, row i top to bottom, column j left to right. */
export const MATRIX_SHOTS = ['M-GRID'] as const
export type MatrixShot = (typeof MATRIX_SHOTS)[number]
/** two-qubit (SVG): two Bloch balls, A left and B right, with an optional correlation grid beside them. */
export const TWO_QUBIT_SHOTS = ['TQ-PAIR'] as const
export type TwoQubitShot = (typeof TWO_QUBIT_SHOTS)[number]
/** plot (SVG): one 2-D curve, axes bottom-left (P-Q10-story §9.2). */
export const PLOT_SHOTS = ['P-CURVE'] as const
export type PlotShot = (typeof PLOT_SHOTS)[number]
/** bb84 (SVG): the protocol ledger, one row per photon (W-448 L8-B). */
export const BB84_SHOTS = ['K-LEDGER'] as const
export type Bb84Shot = (typeof BB84_SHOTS)[number]
/** clocks (SVG): the ladder, the two dials, the gap and the equator seen from above (W-448 L11). */
export const CLOCKS_SHOTS = ['K-STD'] as const
export type ClocksShot = (typeof CLOCKS_SHOTS)[number]

export const SHOTS: { readonly [K in StageKind]: readonly string[] } = {
  'lab-r3': LAB_SHOTS,
  'hilbert-plane': PLANE_SHOTS,
  bloch: BLOCH_SHOTS,
  'bloch-ball': BALL_SHOTS,
  hopf: HOPF_SHOTS,
  'operator-space': OPERATOR_SHOTS,
  'complex-plane': COMPLEX_SHOTS,
  amplitudes: AMP_SHOTS,
  circuit: CIRCUIT_SHOTS,
  matrix: MATRIX_SHOTS,
  'two-qubit': TWO_QUBIT_SHOTS,
  plot: PLOT_SHOTS,
  bb84: BB84_SHOTS,
  clocks: CLOCKS_SHOTS,
}

/** Term-link targets per kind (hover/focus on a term → the scene highlights this anchor, D §4.0). */
export const ANCHORS = {
  'lab-r3': [
    'atom-moment', // \vec\mu → small arrow on one highlighted atom (l1-quantized:b1)
    'streamlines', // field-line density at the knife edge (b1, b5a)
    'knife-edge',
    'angle-arc', // \theta_\mu (b2)
    'drop-line', // \mu\cos\theta_\mu (b2)
    'ghost-band', // −μ … +μ (b2)
    'spot-plus', // +ħ/2 (b3)
    'spot-minus', // −ħ/2 (b3)
    'gradient-arrow', // S_z / n̂ on the magnet (b3)
    'beam-stop', // "block" (b4)
    'chip-1', // state chip after device 1 (b4)
    'chip-2',
    'box-readout', // σ = ±1 windows (b5b)
    'z-axis',
    'magnet-1',
    'magnet-2',
    'magnet-3',
    'tilt-arc', // θ protractor (l1-average)
    'centroid', // ⟨σₙ⟩ tick (l1-average:b2)
    'fill-bar', // P(+) (l1-average:b3)
    'sigma-band', // ±1σ (l1-average:b4)
    'tally-true', // truth tallies (l1-logic)
    'tally-false',
    'false-ring', // dashed ring on (left, down) (l1-logic:b3)
    'tally-bar-1', // A∪B / B∪A bars (l1-logic:b4)
    'tally-bar-2',
    'tracked-atom', // single-atom flight (l1-sequential:b5)
    'axis-n', // the magnet's measurement axis n̂ at the plate centre (l1-average:b2)
    'axis-m', // the preparation axis m̂ (= ẑ) at the plate centre (l1-average:b2)
    'spread', // ±Δσ bracket of single readings (l3-spread)
  ],
  'hilbert-plane': ['psi', 'basis-1', 'basis-2', 'shadow-1', 'shadow-2', 'bar-1', 'bar-2', 'right-angle', 'ghost', 'angle-arc', 'image', 'projection'],
  bloch: ['point', 'axis-n', 'equator', 'x', 'y', 'z'],
  'bloch-ball': ['point', 'compare', 'center', 'axis-n', 'purity'],
  hopf: ['fiber', 'marker', 'mini-point', 'axis-fiber'],
  'operator-space': ['arrow-a', 'gauge-a0', 'eigen-plus', 'eigen-minus', 'ghost-sphere'],
  // P-F1-story §9.2 S4
  'complex-plane': ['z', 'w', 'sum', 'product', 'conj', 'modulus', 'arg-z', 'arg-w', 'arg-product', 'unit-circle', 'real-axis', 'imag-axis', 'chain', 'resultant', 'polygon', 'velocity'],
  amplitudes: ['bars', 'bar-0', 'bar-1', 'dials', 'sum', 'resultant', 'mean', 'axis'],
  // 'observable': matrix v2 (W-709 #15), the measured Pauli-string bracket
  circuit: ['wires', 'gates', 'controls', 'targets', 'measure', 'swap', 'cursor', 'time-axis', 'observable'],
  // 'moved'/'spectrum-bar'/'tableau-row'/'tableau-product': matrix v2 (W-709 #15); 'factor-a'/'factor-b': matrix v3 (W-448 L9-A)
  matrix: ['cell', 'row', 'col', 'diagonal', 'block', 'reduced', 'svd-bar', 'legend', 'moved', 'spectrum-bar', 'tableau-row', 'tableau-product', 'factor-a', 'factor-b'],
  'two-qubit': ['ball-a', 'ball-b', 'axis-a', 'axis-b', 'cell'],
  plot: ['curve', 'marker', 'band', 'y-line'],
  // W-448 L8-B: rows, the three parties' columns, the sifting marks, the test sample, the Q̂ gauge, the tally line
  bb84: ['row', 'alice', 'eve', 'bob', 'sift', 'test', 'qber', 'tally'],
  // W-448 L11: the two levels and the mean on the ladder, the ħω arrow, one dial per level, the gap dial and the equator's arrow
  clocks: ['level-upper', 'level-lower', 'mean', 'gap-arrow', 'clock-upper', 'clock-lower', 'gap-dial', 'top-arrow'],
} as const satisfies { readonly [K in StageKind]: readonly string[] }

export type AnchorOf<K extends StageKind> = (typeof ANCHORS)[K][number]
export type Anchor = (typeof ANCHORS)[keyof typeof ANCHORS][number]
