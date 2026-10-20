/**
 * Stage colour tokens: the ONLY copy of the dark-stage palette (owner: D after the l1-freeze tag).
 *
 * Values from D-L1-scenes §1.1–1.2 (decision #20) plus orchid for operators (decision #21). CSS keeps no
 * copy: the stage box sets `--stage-bg` inline from STAGE_BG, and overlay CSS reads `var(--stage-*)`
 * custom properties that `stageCssVars()` writes on the stage box. Three-free (plain strings).
 *
 * Reserved encodings (D §1.2 rules): amber/cobalt never on apparatus, chrome or decoration; atom colour =
 * outcome of the most recent magnet; "false"/"classical" are silver dashes, never a new hue; lab state
 * appears only as a DOM chip. Orchid is used ONLY for the operator arrow a⃗ and the a₀ gauge.
 */
import type { CourseId } from '../content/courses'
import type { StageKind } from '../content/stage'
// Overlay visuals (overlay.css) load from main.tsx next to story.css (interface change D2, done in round 3b).

/** Clear colour of each kind's view = the DOM backing behind it (so a dropped frame is invisible). */
export const STAGE_BG: { readonly [K in StageKind]: string } & { readonly inset: string } = {
  'lab-r3': '#1a1f28', // physical: neutral graphite, L* 11.6
  'hilbert-plane': '#161d2c', // state: blue-black, L* 10.8
  bloch: '#161d2c',
  'bloch-ball': '#161d2c',
  hopf: '#161d2c',
  'operator-space': '#1b1b28', // operator: violet-black, L* 10.3
  'complex-plane': '#161d2c', // a space of numbers, drawn as the state spaces are (709; SVG)
  amplitudes: '#161d2c', // a state as its list of amplitudes (709; SVG)
  circuit: '#161d2c', // a process on qubits, read left to right (709; SVG): the state ground, so a split with amplitudes reads as one
  matrix: '#161d2c', // a matrix (709; SVG): the same state ground as the other 709 kinds
  'two-qubit': '#161d2c', // two Bloch balls + a correlation grid (709; SVG): the same state ground as the other 709 kinds
  plot: '#161d2c', // a 2-D curve (709; SVG): the same state ground as the other 709 kinds
  bb84: '#161d2c', // the BB84 protocol ledger (448 L8; SVG): the state ground like the other SVG kinds
  clocks: '#161d2c', // the phase clocks of a two-level system (448 L11; SVG): the state ground
  'grover-plane': '#161d2c', // Grover's real plane (709 Q17; SVG): the state ground
  bits: '#161d2c', // classical bits: tables, maps, rows and row reduction (709 F7; SVG): the state ground
  code: '#161d2c', // an error-correcting code as qubits and checks (709 Q21/Q22 and the Papers chapters; SVG): the state ground
  spacetime: '#161d2c', // the detector history of the repetition code (Papers B1; SVG): the state ground
  'pauli-program': '#161d2c', // a program of Pauli operations on wires (Papers B3/B4; SVG): the state ground
  'surgery-graph': '#161d2c', // the gauging graph of a logical operator (Papers B3; SVG): the state ground
  wavefunction: '#161d2c', // a complex function along a line (448 L12; SVG): the state ground
  'spin-ladder': '#161d2c', // the m ladder of spin j (448 L7; SVG): the state ground
  'module-map': '#161d2c', // the bicycle machine as modules, adapters and a T factory (Papers P1; SVG): the state ground
  inset: '#1d2536', // inset views (mini Bloch, lab inset), L* 14.7
}

/** Lab back wall / bench plane (fog colour = stage bg). */
export const STAGE_BACKDROP = '#121824'

/**
 * The stage ground per course (W-709-platform §D). 448 is exactly the tables above. Physics 709's state-space kinds
 * sit on the Cryostat's stage navy #101830 (D-709-identity §2: amber 8.7, cobalt 6.4, orchid 7.5, silver 7.0 : 1 on
 * it); the physical lab and the operator space keep 448's grounds, so the kind of space still reads the same across a
 * bridge. The INK encodings are shared by both courses (|0⟩ ≡ |+z⟩ is amber everywhere). Gold and copper, the 709
 * chrome, never appear on a stage (styles/theme.test.ts).
 */
export const STAGE_THEME: { readonly [C in CourseId]: { readonly bg: typeof STAGE_BG; readonly inset: string; readonly backdrop: string } } = {
  sl448: { bg: STAGE_BG, inset: STAGE_BG.inset, backdrop: STAGE_BACKDROP },
  // the Papers section reads on Spin Lab's glass plate (courses.ts theme 'glass'): its stages keep 448's grounds
  papers: { bg: STAGE_BG, inset: STAGE_BG.inset, backdrop: STAGE_BACKDROP },
  qc709: {
    bg: {
      'lab-r3': STAGE_BG['lab-r3'],
      'hilbert-plane': '#101830',
      bloch: '#101830',
      'bloch-ball': '#101830',
      hopf: '#101830',
      'operator-space': STAGE_BG['operator-space'],
      'complex-plane': '#101830',
      amplitudes: '#101830',
      circuit: '#101830',
      matrix: '#101830',
      'two-qubit': '#101830',
      plot: '#101830',
      bb84: '#101830',
      clocks: '#101830',
      'grover-plane': '#101830',
      bits: '#101830',
      code: '#101830',
      spacetime: '#101830',
      'pauli-program': '#101830',
      'surgery-graph': '#101830',
      wavefunction: '#101830',
      'spin-ladder': '#101830',
      'module-map': '#101830',
      inset: '#18223d',
    },
    inset: '#18223d', // the 300 K plate tint: an inset view reads as one step warmer than the stage
    backdrop: STAGE_BACKDROP,
  },
}

export const INK = {
  plus: '#f0a93a', // amber = + outcome (reserved)
  minus: '#7f95ff', // cobalt = − outcome (reserved)
  state: '#f4f6fa', // near-white = the state (reserved)
  op: '#e58bd3', // orchid = operators: a⃗ and the a₀ gauge only (reserved, decision #21)
  silver: '#9aa5b4', // structure 1: axes, frames, hypothesis/classical overlays (dashed)
  silver2: '#6d7888', // structure 2: great circles, grids, unit circle
  silver3: '#4a5462', // structure 3: ground grid, inactive/greyed apparatus
  unpol: '#bfc5cf', // unpolarized atoms (no ket; not the state colour)
  text: '#eef2f8', // DOM ink on the stage
} as const
export type InkToken = keyof typeof INK

/** Hopf fiber luminance ramp (D §1.2): L* = 84 − 44·θ/π, never reaching the state's L* 96.8. */
export const HOPF_RAMP: readonly { thetaDeg: number; hex: string }[] = [
  { thetaDeg: 0, hex: '#ccd2db' },
  { thetaDeg: 20, hex: '#bec5cd' },
  { thetaDeg: 45, hex: '#aeb4bc' },
  { thetaDeg: 70, hex: '#9da3ac' },
  { thetaDeg: 95, hex: '#8d939b' },
  { thetaDeg: 120, hex: '#7e838b' },
  { thetaDeg: 180, hex: '#595f66' },
]

/** Lighting rig (D §1.7). Directions: azimuth from +x toward +y, elevation above the x–y plane (physics). */
export const LIGHT_RIG = {
  env: { lab: 0.7, hopf: 0.55, state: 0.8 },
  key: { color: '#fff4e8', intensity: 2.2, az: 3, el: 50 },
  fill: { sky: '#d6def0', ground: '#1a2130', intensity: 0.45 },
  rim: { color: '#a9bcff', intensity: { lab: 1.3, other: 0.8 }, az: 163, el: 20 },
} as const

/** Glow policy (D §1.3): only reserved-encoding objects glow; baked sprite, no post-processing. */
export const GLOW = {
  atom: { radius: 0.019, halo: 2.5, alpha: 0.3 },
  deposit: { radius: 0.02, halo: 1.8, alpha: 0.18 },
  state: { halo: 3.0, alpha: 0.35 },
} as const

/** DOM label backings (D §1.5): 0.80 for ink text, 0.90 under coloured (amber/cobalt) text. */
export const LABEL_BACKING = 'rgba(9, 12, 19, 0.80)'
export const LABEL_BACKING_STRONG = 'rgba(9, 12, 19, 0.90)'

/** CSS custom properties for a stage box: `--stage-bg` plus every ink token as `--stage-<token>` (448's ground by default). */
export function stageCssVars(kind: StageKind, course: CourseId = 'sl448'): Record<string, string> {
  const theme = STAGE_THEME[course]
  const vars: Record<string, string> = { '--stage-bg': theme.bg[kind], '--stage-bg-inset': theme.inset }
  for (const [k, v] of Object.entries(INK)) vars[`--stage-${k}`] = v
  vars['--stage-label-backing'] = LABEL_BACKING
  vars['--stage-label-backing-strong'] = LABEL_BACKING_STRONG
  return vars
}
