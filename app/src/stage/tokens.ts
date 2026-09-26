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
  inset: '#1d2536', // inset views (mini Bloch, lab inset), L* 14.7
}

/** Lab back wall / bench plane (fog colour = stage bg). */
export const STAGE_BACKDROP = '#121824'

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

/** CSS custom properties for a stage box: `--stage-bg` plus every ink token as `--stage-<token>`. */
export function stageCssVars(kind: StageKind): Record<string, string> {
  const vars: Record<string, string> = { '--stage-bg': STAGE_BG[kind], '--stage-bg-inset': STAGE_BG.inset }
  for (const [k, v] of Object.entries(INK)) vars[`--stage-${k}`] = v
  vars['--stage-label-backing'] = LABEL_BACKING
  vars['--stage-label-backing-strong'] = LABEL_BACKING_STRONG
  return vars
}
