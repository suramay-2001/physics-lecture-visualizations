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

export const SHOTS: { readonly [K in StageKind]: readonly string[] } = {
  'lab-r3': LAB_SHOTS,
  'hilbert-plane': PLANE_SHOTS,
  bloch: BLOCH_SHOTS,
  'bloch-ball': BALL_SHOTS,
  hopf: HOPF_SHOTS,
  'operator-space': OPERATOR_SHOTS,
  'complex-plane': COMPLEX_SHOTS,
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
} as const satisfies { readonly [K in StageKind]: readonly string[] }

export type AnchorOf<K extends StageKind> = (typeof ANCHORS)[K][number]
export type Anchor = (typeof ANCHORS)[keyof typeof ANCHORS][number]
