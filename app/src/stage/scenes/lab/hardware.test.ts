/**
 * The Blender hardware GLB (public/models/lab.glb) — D's fit checks and S's audit in one place (P3 #1–#3):
 * every part present, each part inside the envelope the procedural stand-in occupied (so labels, shots and
 * the atom paths still fit), budgets, and nothing in the file that could reach out or leak.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path } from '../../../security/node'
import { HARDWARE_PARTS, extractHardware, type Hardware } from './hardware'

const bytes = fs.readFileSync(path.join(APP_DIR, 'public', 'models', 'lab.glb'))
const ascii = (a: number, b: number) => new TextDecoder('latin1').decode(bytes.subarray(a, b))

/** The GLB's JSON chunk (header 12 bytes, then chunk length + type + data). */
function glbJson(): Record<string, unknown> {
  expect(ascii(0, 4)).toBe('glTF')
  const len = new DataView(bytes.buffer, bytes.byteOffset).getUint32(12, true)
  expect(ascii(16, 20)).toBe('JSON')
  return JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + len)))
}

async function parse(): Promise<Hardware> {
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const gltf = await new GLTFLoader().parseAsync(ab, '')
  const hw = extractHardware(gltf.scene)
  expect(hw, 'every named part present').not.toBeNull()
  return hw!
}

const box = (g: THREE.BufferGeometry) => {
  g.computeBoundingBox()
  return g.boundingBox!
}
/** bounding box within [min, max] per axis, to 1e-3 */
const inside = (b: THREE.Box3, min: [number, number, number], max: [number, number, number]) => {
  ;(['x', 'y', 'z'] as const).forEach((k, i) => {
    expect(b.min[k], `min ${k}`).toBeGreaterThanOrEqual(min[i] - 1e-3)
    expect(b.max[k], `max ${k}`).toBeLessThanOrEqual(max[i] + 1e-3)
  })
}

describe('lab.glb (Blender hardware)', () => {
  it('is small and plain: ≤ 600 KB, no extensions, no external buffers or images, no materials', () => {
    expect(bytes.byteLength).toBeLessThanOrEqual(600 * 1024)
    const json = glbJson() as { extensionsUsed?: string[]; buffers: { uri?: string }[]; images?: unknown[]; materials?: unknown[] }
    expect(json.extensionsUsed ?? []).toEqual([]) // ruling #1: no meshopt/Draco (wasm is blocked by the CSP anyway)
    expect(json.buffers.every((b) => b.uri === undefined)).toBe(true)
    expect(json.images ?? []).toEqual([])
    expect(json.materials ?? []).toEqual([]) // the app owns every colour
  })
  it('carries no local paths, URLs or user names (S: PII)', () => {
    const text = JSON.stringify(glbJson())
    expect(text).not.toMatch(/\/Users\/|\/home\/|[A-Z]:\\\\|https?:\/\/|file:/)
  })
  it('has every part, within the triangle budget (≤ 12 k for one of each)', async () => {
    const hw = await parse()
    let tris = 0
    for (const p of HARDWARE_PARTS) tris += (hw[p].index ? hw[p].index!.count : hw[p].getAttribute('position').count) / 3
    expect(tris).toBeLessThanOrEqual(12_000)
  })
  it('keeps each part in the envelope of its procedural stand-in (physics axes, module-local frames)', async () => {
    const hw = await parse()
    const L = 3.2
    // yoke + coils + mount: the −x side of the module, never reaching the pole faces (x ≥ −0.95 is the poles)
    inside(box(hw.sg_yoke), [-1.6, 0, -2.03], [0.78, L, 2.03])
    inside(box(hw.sg_coils), [-1.66, -0.12, -1.47], [-1.0, L + 0.12, 1.47])
    inside(box(hw.sg_axis_mount), [-1.62, L / 2 - 0.1, -0.36], [-1.52, L / 2 + 0.1, 0.18])
    // the coil packs leave the arrow's band (|z| ≤ 0.45) free
    expect(box(hw.sg_coils).min.x).toBeLessThan(-1.6)
    // oven: mouth at y = 0, body behind it, stand down to the rail top (−1.99)
    inside(box(hw.oven), [-0.48, -1.04, -1.99], [0.48, 0, 0.48])
    // slit, plate frame, stop, rail
    inside(box(hw.slit), [-0.72, -0.16, -1.99], [0.72, 0.16, 0.63]) // bracket posts rise to 0.62, outboard of the jaws
    inside(box(hw.plate_frame), [-1.24, -0.19, -1.99], [1.24, 0.19, 1.24])
    inside(box(hw.beam_stop), [-0.16, -0.07, -1.16], [0.16, 0.07, 0.16])
    inside(box(hw.bench_rail), [-0.26, -0.5, -0.08], [0.26, 0.5, 0.08])
  })
  it('keeps the beam path clear: nothing between the slit jaws or on the axis downstream of the oven mouth', async () => {
    const hw = await parse()
    const pos = hw.slit.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const [x, y, z] = [pos.getX(i), pos.getY(i), pos.getZ(i)]
      if (Math.abs(x) < 0.6 && Math.abs(y) < 0.05) expect(Math.abs(z), 'slit gap ±0.08').toBeGreaterThanOrEqual(0.08 - 1e-6)
    }
    expect(box(hw.oven).max.y).toBeLessThanOrEqual(1e-6)
  })
})
