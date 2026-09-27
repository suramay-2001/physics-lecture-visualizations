/**
 * The SVG kinds (lazy chunk; stage/svgKinds.ts `loadSvgKinds`). Importing this module registers every SVG kind's
 * definition (resolver, interpolator, validator, readouts, the one scene component) with the registry in the main
 * chunk. Only this chunk may import physics/qc for a stage: build/chunks.test.ts keeps it out of the entry closure (h)
 * and out of every 448 lecture chunk (m).
 */
import { registerSvgKind, type SvgKindDef } from '../svgKinds'
import './svg.css'

/** Every SVG kind, in KIND_RENDER order. */
export const SVG_KIND_DEFS: readonly SvgKindDef[] = []

for (const def of SVG_KIND_DEFS) registerSvgKind(def)
