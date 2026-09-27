/**
 * Physics → render axes for the Babylon lab (decisions/lab.md #1). PURE and Babylon-free.
 *
 * Physics: right-handed, z up (the lectures' Bloch sphere: +x toward the viewer's right-front, +z up).
 * Render: Babylon with `scene.useRightHandedSystem = true`, y up. The map is the lecture scenes' own
 * `physToThree` (stage/hooks.ts): (x, y, z) → (x, z, −y), a proper rotation (det +1), so R_z(+φ) stays
 * counter-clockwise seen from +z, and |+y⟩ sits where the r3f Bloch scene puts it. Babylon's left-handed
 * default would mirror the sphere (swapping +i and −i and turning R_z backwards).
 */
export type V3 = [number, number, number]

/** physics (x, y, z), z up → render (x, z, −y), y up (right-handed). */
export const physToRender = (p: readonly [number, number, number]): V3 => [p[0], p[2], -p[1]]

/** Inverse of physToRender. */
export const renderToPhys = (r: readonly [number, number, number]): V3 => [r[0], -r[2], r[1]]

/** Camera position for a physics azimuth / elevation (degrees) at distance d: the lecture scenes' shot convention. */
export function shotPosition(azDeg: number, elDeg: number, d: number): V3 {
  const az = (azDeg * Math.PI) / 180
  const el = (elDeg * Math.PI) / 180
  return physToRender([d * Math.cos(el) * Math.cos(az), d * Math.cos(el) * Math.sin(az), d * Math.sin(el)])
}
