# Pattern: an SVG stage kind

Real example (trimmed), `app/src/stage/svg/circuit.ts` — the `circuit` kind:

```ts
import type { CircuitStageState } from '../../content/stage'
import type { Circuit, Op } from '../../physics/qc/circuit'
import type { CircuitGlyph, ResolvedCircuit } from '../types'
import { circuitCursor, stageCircuitProblems } from './amplitudes'

/** How one operation is drawn (resolver-only: content never picks a glyph itself). */
export function glyphOf(op: Op): CircuitGlyph { /* op.op -> {type, label, targets, controls, cond} */ }

export function resolveCircuitStage(st: CircuitStageState, s: number): ResolvedCircuit {
  const c: Circuit = st.circuit
  return {
    kind: 'circuit',
    n: c.qubits,
    columns: c.columns.map((col) => col.map(glyphOf)),
    cursor: circuitCursor(c, st.upTo, s), // the engine's run, not content's guess
    key: JSON.stringify(c),
    shot: st.shot,
  }
}

export function interpCircuitStage(a: ResolvedCircuit, b: ResolvedCircuit, t: number): ResolvedCircuit {
  if (t <= 0) return a
  if (t >= 1) return b
  if (a.key !== b.key) return t < 0.5 ? a : b // a different circuit: hard switch, nothing to morph
  return { ...(t < 0.5 ? a : b), cursor: a.cursor + (b.cursor - a.cursor) * t }
}

export function validateCircuitStage(st: CircuitStageState): string[] {
  if (!st.circuit || typeof st.circuit !== 'object') return ['circuit: a circuit (physics/qc/circuit.ts format)']
  return stageCircuitProblems(st.circuit, st.upTo, st.outcomes, 'circuit')
}
```

## The functions every SVG kind needs

1. **`resolveXxxStage(state, s)`** — turns content's declared *inputs* into a fully computed picture, using the
   engine (never content) for every derived number, mark or cursor position.
2. **`interpXxxStage(a, b, t)`** — interpolates for a smooth beat transition; hard-switches at `t < 0.5 ? a : b`
   when the two states aren't the same underlying object (e.g. a wholly different circuit — nothing to morph).
3. **`validateXxxStage(state)`** — a list of problem strings (empty = valid); reuses an existing engine-level
   validator plus the stage's own caps.
4. **`XxxLayoutProblems(states)`** (only if the kind can share a `split` layout with another kind, e.g.
   `circuit` + `amplitudes`) — cross-checks both halves read the same underlying data.

## Registration and rendering

- Register via `stage/svgKinds.ts` `registerSvgKind` (lazy — loaded only when a beat uses the kind).
- **One scene component**, `mode: 'stage' | 'print'` — the same component renders live
  (`stage/svg/SvgStage.tsx`) and as the print figure (`stage/figures/FigureFor.tsx`), so the print figure can
  never drift from the live picture.
- Add the kind to `content/stage.ts` `STAGE_KINDS_<course>` and `KIND_RENDER[kind] = 'svg'`; add a `PASSPORT`
  entry and fidelity ids (`docs/specs/stage-kinds.md`).

## Pitfall this pattern exists to prevent

A resolver that lets content pass an already-computed value (instead of raw inputs like `{circuit, upTo}`) means
the picture can silently disagree with the engine — the "every visual that makes a claim is drawn from the
engine" guarantee lives entirely in functions shaped exactly like `resolveCircuitStage` above.
