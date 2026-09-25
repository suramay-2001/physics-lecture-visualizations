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
