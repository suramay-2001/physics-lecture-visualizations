/**
 * The SVG kinds (lazy chunk; stage/svgKinds.ts `loadSvgKinds`). Importing this module registers every SVG kind's
 * definition (resolver, interpolator, validator, readouts, the one scene component) with the registry in the main
 * chunk. Only this chunk may import physics/qc for a stage: build/chunks.test.ts keeps it out of the entry closure (h)
 * and out of every 448 lecture chunk (m).
 */
import { registerSvgKind, type SvgKindDef } from '../svgKinds'
import { AmplitudesScene } from './AmplitudesScene'
import { ampReadouts, interpAmplitudes, resolveAmplitudes, validateAmplitudes } from './amplitudes'
import { CircuitScene } from './CircuitScene'
import { circuitLayoutProblems, circuitReadouts, interpCircuitStage, resolveCircuitStage, validateCircuitStage } from './circuit'
import { ComplexPlaneScene } from './ComplexPlaneScene'
import { complexReadouts, interpComplexPlane, resolveComplexPlane, validateComplexPlane } from './complexPlane'
import { MatrixScene } from './MatrixScene'
import { interpMatrixStage, matrixReadouts, resolveMatrixStage, validateMatrixStage } from './matrix'
import './svg.css'

const complexPlane: SvgKindDef<'complex-plane'> = {
  kind: 'complex-plane',
  resolve: resolveComplexPlane,
  interpolate: interpComplexPlane,
  validate: validateComplexPlane,
  readouts: complexReadouts,
  Scene: ComplexPlaneScene,
  print: { w: 320, h: 260 },
}

const amplitudes: SvgKindDef<'amplitudes'> = {
  kind: 'amplitudes',
  resolve: resolveAmplitudes,
  interpolate: interpAmplitudes,
  validate: validateAmplitudes,
  readouts: ampReadouts,
  Scene: AmplitudesScene,
  print: { w: 320, h: 240 },
}

const circuit: SvgKindDef<'circuit'> = {
  kind: 'circuit',
  resolve: resolveCircuitStage,
  interpolate: interpCircuitStage,
  validate: validateCircuitStage,
  validateLayout: circuitLayoutProblems,
  readouts: circuitReadouts,
  Scene: CircuitScene,
  print: { w: 320, h: 200 },
}

const matrix: SvgKindDef<'matrix'> = {
  kind: 'matrix',
  resolve: resolveMatrixStage,
  interpolate: interpMatrixStage,
  validate: validateMatrixStage,
  readouts: matrixReadouts,
  Scene: MatrixScene,
  print: { w: 320, h: 260 },
}

/** Every SVG kind, in KIND_RENDER order. */
export const SVG_KIND_DEFS: readonly SvgKindDef[] = [
  complexPlane as unknown as SvgKindDef,
  amplitudes as unknown as SvgKindDef,
  circuit as unknown as SvgKindDef,
  matrix as unknown as SvgKindDef,
]

for (const def of SVG_KIND_DEFS) registerSvgKind(def)
