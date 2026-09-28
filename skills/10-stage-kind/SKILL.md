---
name: 10-stage-kind
description: Add a new stage kind (SVG or GL) — state type, resolve/interp, passport, fidelity contract, print mode and chunk placement. Trigger when a chapter plan's stage-contract section (03-chapter-plan §9.2) needs a picture no existing kind can draw.
---

# Stage kind — add an SVG or GL kind

Reference: `docs/specs/stage-kinds.md` (every existing kind's shape); worked commit sequence:
`docs/roles/interface-changes.md` rows W-709 #4–#8; brief: session scratchpad `brief-709-stagekinds1.md`.

## When to use
A chapter plan's §9.2 stage contract names a picture (e.g. "bars for basis-state amplitudes", "a circuit drawn by
columns") that no `StageKind` in `content/stage.ts` can produce. Build the kind **before** the chapter that needs
it (`00-course-pipeline` step 3), never inside the chapter's own worktree.

## Inputs
- The plan's exact state shape sketch (§9.2) from every chapter that will use the kind — read all of them before
  designing the fields, so the shape covers every beat's need in one pass.
- `content/stage.ts` `KIND_RENDER: {[K in StageKind]: 'gl' | 'svg'}` — decide GL (WebGL scene, shares the one
  canvas) or SVG (DOM in the stage box's slot, no WebGL needed, doubles as the print figure) up front.

## Steps
1. **State type**: add to `content/stage.ts` (`XxxState`), added to `STAGE_KINDS_448` or the course's own
   `STAGE_KINDS_<course>` array. Content writes *inputs only* — never a pre-computed derived value (an
   amplitude, a sum) — the resolver computes everything from the engine.
2. **Resolve / interp**: `stage/resolve.ts` (GL) or a new file under `stage/svg/` (SVG) — `resolveXxxStage`,
   `interpXxxStage`. SVG kinds register through `stage/svgKinds.ts` (`registerSvgKind`) and are loaded lazily
   (`useLiveStage`/`loadSvgKinds`), never imported eagerly from a shared component.
3. **Validate**: `validateXxxStage` (and `validateLayout` if the kind can appear in a `split` layout with
   another kind reading the same underlying data — e.g. `circuit` + `amplitudes` must agree on circuit, cursor
   and outcomes).
4. **Passport**: an entry in `PASSPORT` (or `PASSPORT_VARIANT` for a course- or mode-specific variant, read
   through `passportOf(state, course)`), naming the space precisely (e.g. "NUMBER PLANE ℂ").
5. **Fidelity**: new ids in the owning course's fidelity registry (`content/fidelity.ts` for 448,
   `content/qc709/fidelity.ts` for a 709-only kind — 709 ids carry the `qc-` prefix), one line per thing the
   picture gets right, simplifies, or could mislead about.
6. **Print mode**: for an SVG kind, the ONE scene component takes a `mode: 'stage' | 'print'` prop, so
   `FigureFor` renders the exact same component in print ink — no separate print-drawing code path. A GL kind
   that cannot yet draw in 2D emits a labelled placeholder figure and is listed as a gap in the report.
7. **Token/anchors**: `stageVocab.ts` shots and `ANCHORS[kind]` for term-link targets on the stage.
8. **Chunk placement**: confirm the new kind's module is lazy (`build/chunks.test.ts` rules) — nothing from a
   new stage kind or its course's content enters the entry closure.
9. Extend the DEV demo chapter with a unit that exercises every new field, in both tracks if two-track, so the
   platform's own tests cover the kind before any real chapter uses it.

## Gates
- Every 448 (or existing-course) lecture looks and reads exactly as before — prove it by re-running the existing
  stage/e2e suite unchanged, not by inspection.
- One test per new field; the demo chapter's story/print/figure tests cover every new kind and field.
- Validation limits stated and tested (e.g. n ≤ 5 qubits, ≤ 24 columns, a schematic scale capped so nothing draws
  off the passport's frame — `lab-r3.gradientScale` is capped at 1.25 for exactly this reason).
- Label-collision pass and a contrast check on the new kind's default shot.

## Outputs
- New/edited `content/stage.ts`, `stage/resolve.ts` or `stage/svg/<kind>.ts`, `content/fidelity*.ts`,
  `stageVocab.ts`, `stage/figures/FigureFor.tsx` case.
- An `interface-changes.md` row documenting the new kind, fields and any `KIND_RENDER`/`passportOf` change.

## Pitfalls
- A resolver that lets content pass a computed value (instead of raw inputs) breaks "every visual that makes a
  claim is drawn from the engine" — the whole trust model rests on resolvers, never content, doing the math.
- SVG scenes pulled into a 448 lecture chunk by an eager import silently grows every lecture's bundle — always
  route through the lazy SVG-kind registry.
- A new kind's default shot with unchecked contrast or unchecked label collisions only surfaces in `09-visual-qa`,
  not in unit tests — run that pass before calling the kind done.

## Next
`05-chapter-build` for the chapter(s) waiting on this kind; `09-visual-qa` on the demo chapter first.
