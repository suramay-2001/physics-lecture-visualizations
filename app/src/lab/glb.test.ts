/**
 * The lab's GLB reader against the real Blender file, and against broken files (each must be rejected with a reason).
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path } from '../security/node'
import { parseGlb } from './glb'

const file = fs.readFileSync(path.join(APP_DIR, 'public/models/lab.glb'))
const real = (): ArrayBuffer => file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer

describe('parseGlb on public/models/lab.glb', () => {
  const r = parseGlb(real())
  it('reads the 8 named hardware meshes and all 4 754 triangles (BUILD-LOG: 4 754 tris)', () => {
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.meshes.map((m) => m.name)).toEqual(['sg_yoke', 'sg_coils', 'sg_axis_mount', 'oven', 'slit', 'plate_frame', 'beam_stop', 'bench_rail'])
    expect(r.meshes.reduce((n, m) => n + m.indices.length / 3, 0)).toBe(4754)
  })
  it('every index points at a vertex, and the normals are unit length', () => {
    if (!r.ok) throw new Error(r.reason)
    for (const m of r.meshes) {
      const n = m.positions.length / 3
      expect(m.normals.length).toBe(m.positions.length)
      expect(Math.max(...m.indices)).toBeLessThan(n)
      for (let k = 0; k < n; k++) expect(Math.abs(Math.hypot(m.normals[3 * k], m.normals[3 * k + 1], m.normals[3 * k + 2]) - 1)).toBeLessThan(1e-3)
    }
  })
})

describe('parseGlb rejects what it does not understand', () => {
  const edit = (f: (dv: DataView, u8: Uint8Array) => void): ArrayBuffer => {
    const b = real()
    f(new DataView(b), new Uint8Array(b))
    return b
  }
  const reason = (b: ArrayBuffer) => {
    const r = parseGlb(b)
    return r.ok ? 'ok' : r.reason
  }
  /** The real file's JSON, edited, re-assembled with its original BIN chunk (chunk lengths padded to 4 bytes). */
  const rebuilt = (change: (j: Record<string, any>) => void): ArrayBuffer => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const b = real()
    const dv = new DataView(b)
    const len = dv.getUint32(12, true)
    const j = JSON.parse(new TextDecoder().decode(new Uint8Array(b, 20, len))) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    change(j)
    let text = JSON.stringify(j)
    while (text.length % 4) text += ' '
    const json = new TextEncoder().encode(text)
    const bin = new Uint8Array(b, 20 + len) // the BIN chunk header + data, unchanged
    const out = new Uint8Array(20 + json.length + bin.length)
    const o = new DataView(out.buffer)
    o.setUint32(0, 0x46546c67, true)
    o.setUint32(4, 2, true)
    o.setUint32(8, out.length, true)
    o.setUint32(12, json.length, true)
    o.setUint32(16, 0x4e4f534a, true)
    out.set(json, 20)
    out.set(bin, 20 + json.length)
    return out.buffer
  }
  it('the re-assembler itself round-trips (so the cases below test the reader, not the helper)', () => {
    expect(reason(rebuilt(() => {}))).toBe('ok')
  })
  it('bad magic, version, length and truncation', () => {
    expect(reason(edit((dv) => dv.setUint32(0, 0, true)))).toBe('magic')
    expect(reason(edit((dv) => dv.setUint32(4, 1, true)))).toBe('version')
    expect(reason(edit((dv) => dv.setUint32(8, 10, true)))).toBe('length')
    expect(reason(real().slice(0, 16))).toBe('size')
    expect(reason(new ArrayBuffer(3_000_000))).toBe('size')
  })
  it('a JSON chunk that is not JSON, or that asks for extensions', () => {
    expect(reason(edit((_, u8) => (u8[20] = 0x7c)))).toBe('json') // '{' → '|'
    expect(reason(rebuilt((j) => (j.extensionsRequired = ['KHR_draco_mesh_compression'])))).toBe('extensions')
    expect(reason(rebuilt((j) => (j.extensionsUsed = ['KHR_materials_unlit'])))).toBe('extensions')
  })
  it('non-triangle modes, missing normals, an index past the vertex count, an accessor past its view', () => {
    expect(reason(rebuilt((j) => (j.meshes[0].primitives[0].mode = 1)))).toBe('mode')
    expect(reason(rebuilt((j) => delete j.meshes[0].primitives[0].attributes.NORMAL))).toBe('attributes')
    expect(
      reason(
        rebuilt((j) => {
          // three vertices only (positions and normals alike): the mesh's indices then point past the end
          const p = j.meshes[0].primitives[0]
          j.accessors[p.attributes.POSITION].count = 3
          j.accessors[p.attributes.NORMAL].count = 3
        }),
      ),
    ).toBe('index range')
    expect(reason(rebuilt((j) => (j.accessors[j.meshes[0].primitives[0].attributes.POSITION].count = 10_000_000)))).toBe('attributes')
  })
})
