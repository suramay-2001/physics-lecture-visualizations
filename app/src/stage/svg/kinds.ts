/**
 * The SVG kinds (lazy chunk; stage/svgKinds.ts `loadSvgKinds`). Importing this module registers every SVG kind's
 * definition (resolver, interpolator, validator, readouts, the one scene component) with the registry in the main
 * chunk. The kinds are SHARED stage code, as physics/qc is shared engine code (W-448 #5, rulings 448-L8L11 P6): a 448
 * lecture may draw any of them, naming it by data in its story. This chunk is the only place a stage imports them and
 * physics/qc: build/chunks.test.ts keeps it out of the entry closure (h) and keeps every lecture chunk from importing
 * a stage/svg module statically (m), so the kinds stay one lazy chunk both courses load on demand.
 * The kinds' fidelity notes (content/fidelity.svg.ts) register with it, so their drawers are never empty in either course.
 */
import '../../content/fidelity.svg'
import { registerSvgKind, type SvgKindDef } from '../svgKinds'
import { AmplitudesScene } from './AmplitudesScene'
import { Bb84Scene } from './Bb84Scene'
import { bb84Readouts, interpBb84Stage, resolveBb84Stage, validateBb84Stage } from './bb84'
import { ampReadouts, interpAmplitudes, resolveAmplitudes, validateAmplitudes } from './amplitudes'
import { CircuitScene } from './CircuitScene'
import { ClocksScene } from './ClocksScene'
import { clocksReadouts, interpClocksStage, resolveClocksStage, validateClocksStage } from './clocks'
import { circuitLayoutProblems, circuitReadouts, interpCircuitStage, resolveCircuitStage, validateCircuitStage } from './circuit'
import { ComplexPlaneScene } from './ComplexPlaneScene'
import { complexReadouts, interpComplexPlane, resolveComplexPlane, validateComplexPlane } from './complexPlane'
import { MatrixScene } from './MatrixScene'
import { interpMatrixStage, matrixReadouts, resolveMatrixStage, validateMatrixStage } from './matrix'
import { PlotScene } from './PlotScene'
import { interpPlotStage, plotReadouts, resolvePlotStage, validatePlotStage } from './plot'
import { TwoQubitScene } from './TwoQubitScene'
import { interpTwoQubitStage, resolveTwoQubitStage, twoQubitReadouts, validateTwoQubitStage } from './twoQubit'
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

const twoQubit: SvgKindDef<'two-qubit'> = {
  kind: 'two-qubit',
  resolve: resolveTwoQubitStage,
  interpolate: interpTwoQubitStage,
  validate: validateTwoQubitStage,
  readouts: twoQubitReadouts,
  Scene: TwoQubitScene,
  print: { w: 320, h: 260 },
}

const plot: SvgKindDef<'plot'> = {
  kind: 'plot',
  resolve: resolvePlotStage,
  interpolate: interpPlotStage,
  validate: validatePlotStage,
  readouts: plotReadouts,
  Scene: PlotScene,
  print: { w: 320, h: 220 },
}

const bb84: SvgKindDef<'bb84'> = {
  kind: 'bb84',
  resolve: resolveBb84Stage,
  interpolate: interpBb84Stage,
  validate: validateBb84Stage,
  readouts: bb84Readouts,
  Scene: Bb84Scene,
  print: { w: 320, h: 340 },
}

const clocks: SvgKindDef<'clocks'> = {
  kind: 'clocks',
  resolve: resolveClocksStage,
  interpolate: interpClocksStage,
  validate: validateClocksStage,
  readouts: clocksReadouts,
  Scene: ClocksScene,
  print: { w: 320, h: 380 },
}

/** Every SVG kind, in KIND_RENDER order. */
export const SVG_KIND_DEFS: readonly SvgKindDef[] = [
  complexPlane as unknown as SvgKindDef,
  amplitudes as unknown as SvgKindDef,
  circuit as unknown as SvgKindDef,
  matrix as unknown as SvgKindDef,
  twoQubit as unknown as SvgKindDef,
  plot as unknown as SvgKindDef,
  bb84 as unknown as SvgKindDef,
  clocks as unknown as SvgKindDef,
]

for (const def of SVG_KIND_DEFS) registerSvgKind(def)
