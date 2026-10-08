/**
 * The chunk graph of a build, read from the chunk report (build/chunkReport.ts). PURE and node-free, so both
 * build/chunks.test.ts (node) and src/security/cdn.security.test.ts (app program, no @types/node) can use it.
 *
 * Scopes the tests need (decisions/lab.md #8):
 *   entry closure  the entry chunks plus everything they import statically (the first paint);
 *   lecture chunks every chunk holding a lecture's content (L{N}.ts / .story / .review / .values);
 *   lab chunks     chunks reachable from the entries ONLY through a dynamic import of the lab gate
 *                  (`src/lab/babylon/mountLab.ts`): Babylon and everything it pulls in. Cutting the dynamic
 *                  edges into the gate chunk makes every lab chunk unreachable.
 */
export interface ChunkInfo {
  isEntry: boolean
  isDynamicEntry: boolean
  name: string
  moduleIds: string[]
  imports: string[]
  dynamicImports: string[]
  /** Raw bytes of the emitted chunk and its gzip size (level 9). Absent in reports written before the lab. */
  bytes?: number
  gzip?: number
}
export type ChunkReport = Record<string, ChunkInfo>

/** The one module the lab's `import()` loads; everything Babylon hangs off it. */
export const LAB_GATE_MODULE = '/src/lab/babylon/mountLab.ts'
/** The lab route's page (lazy route chunk; must hold no Babylon). */
export const LAB_PAGE_MODULE = '/src/lab/LabPage.tsx'

export const isBabylon = (id: string): boolean => id.includes('/@babylonjs/')
export const isThree = (id: string): boolean => id.includes('/node_modules/three/')
export const isR3F = (id: string): boolean => id.includes('/@react-three/')
/**
 * The chapter a module belongs to, in either course: /src/content/L3.ts, L3.story.ts, L3.review.ts, L3.values.ts
 * → 'L3'; /src/content/qc709/Q4.ts, Q4.story.ts, … Q4.glossary.ts → 'Q4' (and F1…F8).
 */
export const lectureOf = (id: string): string | undefined => /\/src\/content\/(?:qc709\/)?([LQF]\d+)(?:\.(?:story|review|values|glossary))?\.ts$/.exec(id)?.[1]

/**
 * Physics 709's CONTENT (rulings 448-L8L11 P6): chapters, outline, registry, course pack, bridges, glossaries, concepts,
 * games, its fidelity additions (everything under content/qc709/). Course-separated: never in the entry closure, never in
 * a chunk that holds a 448 lecture's content.
 */
export const is709Content = (id: string): boolean => id.startsWith('/src/content/qc709/')
/**
 * The SHARED multi-qubit engine (src/physics/qc/): built for 709, usable by 448 lectures (P6), so a chunk may hold it
 * with either course's content. Large and needed only by the SVG kinds and by lectures' claims, so it stays out of the
 * entry closure (the first paint of any page).
 */
export const isSharedQc = (id: string): boolean => id.startsWith('/src/physics/qc/')
/** A Physics 448 lecture's content (L{N}.ts and its story / review / values). */
export const is448Lecture = (id: string): boolean => /^L\d+$/.test(lectureOf(id) ?? '')
/** Motion Canvas or the films pipeline: offline tooling that renders frames, never shipped code. */
export const isFilmTooling = (id: string): boolean => id.includes('/@motion-canvas/') || /(^|\/)films\//.test(id)
/**
 * The SVG stage kinds and their scenes (src/stage/svg/: a lazy chunk; content/stage.ts KIND_RENDER 'svg'). SHARED stage
 * code (P6): lectures of both courses name a kind by data; no lecture chunk imports one statically.
 */
export const isSvgKindModule = (id: string): boolean => id.startsWith('/src/stage/svg/')
/** DEV-only content fixtures (the 448 demo story, the 709 demo chapter). */
export const isContentFixture = (id: string): boolean => /^\/src\/content\/(?:qc709\/)?__fixtures__\//.test(id)

/** The entry chunks plus everything they import statically, transitively. */
export function entryStaticClosure(r: ChunkReport): Set<string> {
  return walk(r, Object.keys(r).filter((f) => r[f].isEntry), false)
}

/** `from` plus every chunk reachable through static imports (and dynamic ones when `dynamic`), skipping `cut` targets. */
export function walk(r: ChunkReport, from: readonly string[], dynamic: boolean, cut: (f: string) => boolean = () => false): Set<string> {
  const seen = new Set<string>()
  const stack = [...from]
  while (stack.length) {
    const f = stack.pop()!
    if (seen.has(f) || !r[f]) continue
    seen.add(f)
    for (const dep of r[f].imports) if (!cut(dep)) stack.push(dep)
    if (dynamic) for (const dep of r[f].dynamicImports) if (!cut(dep)) stack.push(dep)
  }
  return seen
}

/** Chunks that contain module `id`. */
export const chunksWith = (r: ChunkReport, id: string): string[] => Object.keys(r).filter((f) => r[f].moduleIds.includes(id))

/** Chunks that hold BOTH 709 content (content/qc709/) and a 448 lecture's content: rule (i) says there are none. */
export const mixedCourseChunks = (r: ChunkReport): string[] =>
  Object.keys(r).filter((f) => r[f].moduleIds.some(is709Content) && r[f].moduleIds.some(is448Lecture))

/** Chunks holding lecture content (any of L1…Ln). */
export const lectureChunks = (r: ChunkReport): string[] => Object.keys(r).filter((f) => r[f].moduleIds.some((id) => lectureOf(id)))

export interface LabScopes {
  /** Chunk(s) holding the lab gate module (the dynamic entry `useLabEngine` imports). */
  gate: string[]
  /** Everything reachable from the entries (static + dynamic edges). */
  all: Set<string>
  /** Reachable with the dynamic edges into the gate cut. */
  withoutLab: Set<string>
  /** all − withoutLab: the chunks only the lab gate can load. */
  lab: Set<string>
  /** The gate plus its static closure (downloaded before the first Babylon frame), minus the entry closure. */
  firstDraw: Set<string>
}

export function labScopes(r: ChunkReport): LabScopes {
  const gate = chunksWith(r, LAB_GATE_MODULE)
  const entries = Object.keys(r).filter((f) => r[f].isEntry)
  const all = walk(r, entries, true)
  const isGate = (f: string) => gate.includes(f)
  const withoutLab = walk(r, entries, true, isGate)
  const lab = new Set([...all].filter((f) => !withoutLab.has(f)))
  const entry = entryStaticClosure(r)
  const firstDraw = new Set([...walk(r, gate, false)].filter((f) => !entry.has(f)))
  return { gate, all, withoutLab, lab, firstDraw }
}

/** Sum of raw and gzip bytes over a set of chunk files. */
export function bytesOf(r: ChunkReport, files: Iterable<string>): { raw: number; gzip: number; files: number } {
  let raw = 0
  let gzip = 0
  let n = 0
  for (const f of files) {
    raw += r[f]?.bytes ?? 0
    gzip += r[f]?.gzip ?? 0
    n++
  }
  return { raw, gzip, files: n }
}
