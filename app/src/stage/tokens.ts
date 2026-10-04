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

/**
 * The same ramp at any θ (radians): CIELAB (L* = 84 − 44·θ/π, a = −0.5, b = −5, D65) → sRGB hex. Reproduces
 * HOPF_RAMP within one step per channel (tokens.test.ts); used for rings between the tabled latitudes
 * (the Blender Hopf opener's θ = 30°, 55°, 80°, 105°, 130°).
 */
export function hopfRampHex(theta: number): string {
  const L = 84 - (44 * theta) / Math.PI
  const fy = (L + 16) / 116
  const fx = fy + -0.5 / 500
  const fz = fy - -5 / 200
  const inv = (f: number) => (f ** 3 > 0.008856 ? f ** 3 : (f - 16 / 116) / 7.787)
  const [X, Y, Z] = [0.95047 * inv(fx), inv(fy), 1.08883 * inv(fz)]
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z]
  const enc = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
  return '#' + lin.map((v) => Math.round(255 * Math.min(1, Math.max(0, enc(v)))).toString(16).padStart(2, '0')).join('')
}

/**
 * Apparatus & structure colours (D §3.1). NOT reserved encodings: never amber/cobalt/near-white/orchid
 * (no copper coils — copper reads as amber). Brushed steel carries the look; the beam carries the colour.
 */
export const LAB_MATERIAL = {
  pole: '#a3acb7', // brushed steel, metalness 0.95, roughness 0.26, anisotropy 0.6 along the beam
  yoke: '#39414f',
  oven: '#77818e',
  ovenMouth: '#0b0e14', // dark aperture: NO emissive disc (the gate's near-white disc used the state colour)
  slit: '#5f6875',
  glass: '#cfd9e3', // plate glass, opacity 0.16
  frame: '#8d97a4',
  rail: '#262d39',
  box: '#20262f', // Susskind's black box (matte)
  coil: '#1c222b', // coil packs in dark cloth tape (Blender hardware): never copper, which reads as amber
  prep: '#4a5462', // greyed preparation module = INK.silver3 (inactive apparatus)
  streamline: '#dfe7f5', // structure-light field lines, opacity ≤ 0.6
  shadow: '#05070b',
} as const

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
