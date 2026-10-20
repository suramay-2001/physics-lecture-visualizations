/**
 * Stage colours only the lazy 3D scenes, the Blender opener data and the lab read: the Hopf ramp at any latitude and the apparatus
 * materials. They sit apart from ./tokens.ts (INK, STAGE_BG, STAGE_THEME, the first paint's palette) so the entry chunk does not carry
 * them (build/chunks.test.ts rule (l)). No imports: node loads this file too (openers/openerData.ts, run by pipeline/blender/gen_opener_data.ts).
 */

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
