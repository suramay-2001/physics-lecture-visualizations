/**
 * A strict, geometry-only GLB reader for the lab's Blender hardware (`public/models/lab.glb`, pipeline/blender/
 * lab_assets.py). Babylon's glTF loader is not installed and the chunk contract bans scene loaders (decisions/lab.md
 * ruling 8), and the file needs nothing they offer: 8 named meshes, POSITION + NORMAL (float VEC3), 16-bit indices,
 * triangles only, no materials, textures, extensions or node transforms.
 *
 * Everything outside that shape is REJECTED with a reason, never half-read: a wrong magic or version, a missing
 * chunk, an extension, a non-triangle mode, an accessor that runs past its buffer, an index past the vertex count.
 * Pure (no Babylon, no DOM): the scene builds meshes from what this returns. Coordinates are glTF's (+Y up,
 * right-handed), the same frame the lecture's three.js scene loads this file in.
 */

export interface GlbMesh {
  name: string
  positions: Float32Array
  normals: Float32Array
  indices: Uint16Array | Uint32Array
}
export type GlbResult = { ok: true; meshes: GlbMesh[] } | { ok: false; reason: string }

/** Caps well above the one file this reads (136 KB, 8 meshes, 4 754 triangles). */
export const GLB_LIMITS = Object.freeze({ bytes: 2_000_000, meshes: 32, vertices: 200_000 })

const JSON_CHUNK = 0x4e4f534a // 'JSON'
const BIN_CHUNK = 0x004e4942 // 'BIN\0'
const FLOAT = 5126
const USHORT = 5123
const UINT = 5125

interface Accessor {
  bufferView?: number
  byteOffset?: number
  componentType: number
  count: number
  type: string
}
interface BufferView {
  buffer: number
  byteOffset?: number
  byteLength: number
  byteStride?: number
}

export function parseGlb(buf: ArrayBuffer): GlbResult {
  const fail = (reason: string): GlbResult => ({ ok: false, reason })
  if (buf.byteLength < 20 || buf.byteLength > GLB_LIMITS.bytes) return fail('size')
  const dv = new DataView(buf)
  if (dv.getUint32(0, true) !== 0x46546c67) return fail('magic') // 'glTF'
  if (dv.getUint32(4, true) !== 2) return fail('version')
  if (dv.getUint32(8, true) !== buf.byteLength) return fail('length')
  const jsonLen = dv.getUint32(12, true)
  if (dv.getUint32(16, true) !== JSON_CHUNK || 20 + jsonLen > buf.byteLength) return fail('json chunk')
  let gltf: {
    extensionsRequired?: unknown
    extensionsUsed?: unknown
    meshes?: { name?: string; primitives: { attributes: Record<string, number>; indices?: number; mode?: number }[] }[]
    accessors?: Accessor[]
    bufferViews?: BufferView[]
  }
  try {
    gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen))) as typeof gltf
  } catch {
    return fail('json')
  }
  if (gltf.extensionsRequired || gltf.extensionsUsed) return fail('extensions')
  const binAt = 20 + jsonLen
  if (binAt + 8 > buf.byteLength) return fail('bin chunk')
  const binLen = dv.getUint32(binAt, true)
  if (dv.getUint32(binAt + 4, true) !== BIN_CHUNK || binAt + 8 + binLen > buf.byteLength) return fail('bin chunk')
  const binStart = binAt + 8
  const meshes = gltf.meshes ?? []
  const accessors = gltf.accessors ?? []
  const views = gltf.bufferViews ?? []
  if (meshes.length === 0 || meshes.length > GLB_LIMITS.meshes) return fail('mesh count')

  /** The bytes of one accessor, bounds-checked against its view and the BIN chunk; tightly packed only. */
  const read = (i: number | undefined, componentType: number, type: string): ArrayBuffer | null => {
    const a = i === undefined ? undefined : accessors[i]
    if (!a || a.componentType !== componentType || a.type !== type || a.bufferView === undefined) return null
    const v = views[a.bufferView]
    if (!v || v.buffer !== 0 || (v.byteStride !== undefined && v.byteStride !== (type === 'VEC3' ? 12 : componentType === USHORT ? 2 : 4))) return null
    const size = (componentType === USHORT ? 2 : 4) * (type === 'VEC3' ? 3 : 1)
    const start = (v.byteOffset ?? 0) + (a.byteOffset ?? 0)
    const bytes = a.count * size
    if (!Number.isInteger(a.count) || a.count <= 0 || start + bytes > (v.byteOffset ?? 0) + v.byteLength || start + bytes > binLen) return null
    return buf.slice(binStart + start, binStart + start + bytes) // a copy: aligned for the typed array
  }

  const out: GlbMesh[] = []
  let vertices = 0
  for (const m of meshes) {
    if (m.primitives.length !== 1) return fail('primitives')
    const p = m.primitives[0]
    if ((p.mode ?? 4) !== 4) return fail('mode')
    const pos = read(p.attributes.POSITION, FLOAT, 'VEC3')
    const nor = read(p.attributes.NORMAL, FLOAT, 'VEC3')
    if (!pos || !nor || pos.byteLength !== nor.byteLength) return fail('attributes')
    const idxType = p.indices === undefined ? undefined : accessors[p.indices]?.componentType
    const idx = idxType === USHORT || idxType === UINT ? read(p.indices, idxType, 'SCALAR') : null
    if (!idx) return fail('indices')
    const positions = new Float32Array(pos)
    const normals = new Float32Array(nor)
    const indices = idxType === USHORT ? new Uint16Array(idx) : new Uint32Array(idx)
    const n = positions.length / 3
    vertices += n
    if (vertices > GLB_LIMITS.vertices) return fail('vertex count')
    if (indices.length % 3 !== 0 || indices.some((k) => k >= n)) return fail('index range')
    if (!positions.every(Number.isFinite) || !normals.every(Number.isFinite)) return fail('non-finite')
    out.push({ name: typeof m.name === 'string' ? m.name : '', positions, normals, indices })
  }
  return { ok: true, meshes: out }
}
