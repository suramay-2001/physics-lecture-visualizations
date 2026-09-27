import { describe, expect, it } from 'vitest'
import { physToThree } from '../stage/hooks'
import { physToRender, renderToPhys, shotPosition, type V3 } from './axes'

const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const close = (a: readonly number[], b: readonly number[], eps = 1e-12) => a.every((x, i) => Math.abs(x - b[i]) < eps)

describe('physics → Babylon render axes (ruling #1)', () => {
  it('is the lecture scenes’ map (physToThree) component by component', () => {
    const pts: V3[] = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0.3, -0.7, 0.2],
      [-2, 5, -1.5],
    ]
    for (const p of pts) {
      const t = physToThree(p[0], p[1], p[2])
      expect(close(physToRender(p), [t.x, t.y, t.z]), String(p)).toBe(true)
      expect(close(renderToPhys(physToRender(p)), p)).toBe(true)
    }
  })

  it('is a proper rotation (det +1): x̂ × ŷ = ẑ survives the map, so R_z(+φ) keeps its sense in a right-handed scene', () => {
    const X = physToRender([1, 0, 0])
    const Y = physToRender([0, 1, 0])
    const Z = physToRender([0, 0, 1])
    expect(close(cross(X, Y), Z)).toBe(true)
    // physics z is render up (+y), as the ArcRotateCamera's default up vector expects
    expect(Z).toEqual([0, 1, -0])
  })

  it('shot positions follow the lecture Bloch scene (B-STD: az 30°, el 22°, d 4.2)', () => {
    const d = 4.2
    const az = (30 * Math.PI) / 180
    const el = (22 * Math.PI) / 180
    const t = physToThree(d * Math.cos(el) * Math.cos(az), d * Math.cos(el) * Math.sin(az), d * Math.sin(el))
    expect(close(shotPosition(30, 22, d), [t.x, t.y, t.z])).toBe(true)
  })
})
