# Design spec: stage kinds

Source of truth: `app/src/content/stage.ts` (`StageKind`, `KIND_RENDER`, `PASSPORT`, `PASSPORT_VARIANT`) and
`docs/roles/interface-changes.md` (rows W-709 #4–#8 for how the 709 kinds and their fields were added). To add a
new kind, follow `skills/10-stage-kind/SKILL.md`.

## Render path

`KIND_RENDER: {[K in StageKind]: 'gl' | 'svg'}`. **gl** = one scene on the shared WebGL canvas
(`stage/StageHost.tsx`, lazy three chunk). **svg** = DOM in the stage box's slot (`stage/svg/SvgStage.tsx`,
lazy), driven by the same resolve → interp → store pipeline as GL, so scrubs/transitions/reveals/passports/
readouts/captions behave identically and no WebGL is required. An SVG kind's one scene component also draws its
own print figure (`stage/figures/FigureFor.tsx`, `mode: 'print'`) — the print figure *is* the stage picture, in
print ink.

| Kind | Path | Course |
|---|---|---|
| `lab-r3` | gl | 448 |
| `hilbert-plane` | gl | 448 (709 variant `plane709`) |
| `bloch` | gl | 448 (709 variant `bloch709`) |
| `bloch-ball` | gl | 448 |
| `hopf` | gl | 448 |
| `operator-space` | gl | 448 (variant `labels: 'plain'` from L3) |
| `complex-plane` | svg | 709 |
| `amplitudes` | svg | 709 |
| `circuit` | svg | 709 |

## Per-kind reference

### `lab-r3` — physical space
- **State shape summary:** `LabState` — magnet tilts, a beam path, benches (each with `fires?: boolean`,
  default true), `beamTo?: 'gap' | 'plate'`, readouts (`sigmaBand?`, `tallies?`, `centroid?`), `gradientScale?`
  (709; schematic split-distance multiplier, capped).
- **Passport:** "PHYSICAL SPACE ℝ³ · metres"; note "schematic · not to scale"; axes x, y·beam, z·field gradient.
- **Fidelity key:** `lab-r3` (448) — exact: Born fractions, real tilt angle, beam along y; schematic: deflection
  size exaggerated (D §4.0), spread-vs-band distinction.
- **Validation:** `gradientScale ∈ (0, 1.25]` (709; the plate is ±1.15 u, spots sit at ±0.9 u — ×2 would put spots
  off the plate).

### `hilbert-plane` — real slice of ℂ²
- **State shape summary:** `HilbertPlaneState` — one or two `PlaneKet`s, `image` (Â|ψ⟩ at true length, real
  matrices only), `project`/`renormalize`, `sumOf: [PlaneKet, PlaneKet]` (709: tip-to-tail sum, dashed sides,
  true-length resultant), `arcLabel` (709: names an arc, needs `arc`).
- **Passport:** "STATE SPACE · real slice of ℂ²"; note "not a place · angles are half of lab angles"; axes
  `\|↑⟩ = \|+z⟩`, `\|↓⟩ = \|−z⟩`. 709 variant `plane709` via `passportOf(state, 'qc709')` labels the computational
  basis on the same axes.
- **Fidelity key:** `hilbert-plane` (448) + `qc-plane-vectors-not-states` (709, additive).
- **Validation:** `image` only for real matrices (true length); `project`/`renormalize` implement Rule 3 as a
  picture, resolver-computed only.

### `bloch` — pure states
- **State shape summary:** `BlochState` — `thetaDeg`/`phiDeg` (or `{thetaDeg, phiDeg}` axis), `rotate.axis`,
  `dropLines`, `readouts: ('averages'|'spreads'|'bound')[]` (`'bound'` needs `'spreads'`), shots B-STD/B-EQUATOR/
  B-POLE, variant `labels: 'poincare'` (optics).
- **Passport:** "STATE SPACE · Bloch sphere"; note "not a place · opposite points = orthogonal states"; axes
  ⟨σx⟩, ⟨σy⟩, ⟨σz⟩. 709 variant `bloch709` labels the poles `\|0⟩ = \|+z⟩` / `\|1⟩ = \|−z⟩`.
- **Fidelity key:** `bloch` (448) + `bloch-equator-unit-circle` (B-POLE shot, exact only for unit-size numbers).
- **Validation:** transitions must never jump between antipodal points (a standing content pitfall, not a
  runtime check — plan and review both watch for it).

### `bloch-ball` — pure + mixed states
- **State shape summary:** `BlochBallState` — draws `measure` (dashed axis, amber/cobalt ±n̂ dots, "P(+) along
  n̂"), `recipe` (ingredient dots + dashed chord, incl. `compareRecipe`), a pure comparison (filled silver dot,
  "pure state"), shot B-SECTION (x–z plane face on).
- **Passport:** "STATE SPACE · Bloch ball"; note "not a place · surface = pure · inside = mixed"; axes ⟨σx⟩,
  ⟨σy⟩, ⟨σz⟩.
- **Fidelity key:** `bloch-ball`.
- **Validation:** camera backs off on narrow stages (FIT 1.55); split-stage readout columns are per-slot
  (`data-slot`), never shared — a shared column makes the lower view's state look like the upper view's.

### `hopf` — S³ by stereographic projection
- **State shape summary:** `HopfState` — reveal levels 1–5, mini Bloch sphere inset.
- **Passport:** "STATE SPACE S³ · stereographic view"; note "not a place · circles kept · distances distorted";
  axes p₁, p₂, p₃.
- **Fidelity key:** `hopf`.
- **Validation:** print mode still ships only a labelled placeholder figure (open item — `hopf` has no real 2D
  print figure yet).

### `operator-space` — A = a₀I + a·σ
- **State shape summary:** `OperatorSpaceState` — `labels: 'plain'` variant (no σ, "OPERATOR SPACE · 2×2
  Hermitian", arrow read as half the eigenvalue gap, gauge as the midpoint) for L3 before L4 introduces the σ
  passport.
- **Passport:** "OPERATOR SPACE · A = a₀I + a·σ"; note "not a place · a in 3D · a₀ on the gauge (4th axis)"; axes
  a_x, a_y, a_z, a_0.
- **Fidelity key:** `operator-space`.

### `complex-plane` — 709 only
- **State shape summary:** `ComplexPlaneState` (`CNum`, `ComplexMark`) — `z`, `w`, marks (`sum`, `product`,
  `conj`, `parts`, `modulus`, `arg`, `arc`, `velocity`), `powers`, `euler`, `chain`, `spokes`, `circle`, `line`,
  `trail`; content writes inputs only, the resolver computes every mark with `physics/complex.ts` +
  `physics/qc/complexExtra.ts`.
- **Passport:** "NUMBER PLANE ℂ"; note "not a place · a picture of numbers"; axes Re, Im; **legend: phase** (hue
  wheel, `stage/phaseHue.ts`).
- **Fidelity keys:** `qc-cplane-arithmetic`, `qc-cplane-not-space`, `qc-cplane-hue-is-angle`,
  `qc-cplane-arrows-not-forces`.
- **Validation limits:** n whole 1–1000; ≤ 12 arrows; `powers` ≤ 64; the number line is real values only.

### `amplitudes` — 709 only
- **State shape summary:** `AmplitudesState` (`AmpSource`) — one bar per basis state (1 to 2ⁿ bars, n ≤ 5 on
  stage); bar length = |amplitude|, hue = phase (same wheel/legend); modes `'amplitude'` / `'probability'`
  (chances; one qubit keeps amber/cobalt) / `'signed'` (real, above/below axis, for Grover); source is exactly
  one of `{dir}` (a 448 direction incl. sweeps), `{ket}`, `{bell}`, `{circuit, upTo, outcomes?}` — content never
  writes a computed amplitude; F1 fields `dials`, `sum: [i, j]` (engine resultant), `labels: 'bits' | 'spin'`
  (`'spin'`: `\|0⟩ = \|+z⟩`, `\|1⟩ = \|−z⟩`, one qubit only).
- **Passport:** "STATE · amplitudes"; note "not a place · length = size"; axes "basis states"; **legend: phase**.
  Variants `PASSPORT_VARIANT.ampProbability` / `.ampSigned` relabel what the length means.
- **Fidelity keys:** `qc-amp-engine`, `qc-amp-hue-is-phase`, `qc-amp-zero-is-up`, `qc-amp-bars-not-places`.
- **Validation limits:** n ≤ 5; `dials` ≤ 8 bars; `labels: 'spin'` only for one qubit; `signed` mode only for
  real amplitudes; circuit sources validated via `validateCircuit` + stage caps.

### `circuit` — 709 only
- **State shape summary:** `CircuitStageState` — a `physics/qc/circuit.ts` `Circuit` (q0 top wire; gate boxes,
  control dots, ⊕, SWAP, meters, classical conditions) drawn by columns, with a scrubbable cursor `upTo`; the
  columns after the cursor are dimmed.
- **Passport:** "CIRCUIT · time runs →"; note "not a place · a wire is a qubit"; axes "time →".
- **Fidelity keys:** `qc-circuit-engine-state`, `qc-circuit-layout`, `qc-circuit-wires-are-time`.
- **Validation limits:** ≤ 5 qubits, ≤ 24 columns, a whole-number cursor, a run `runCircuit` can actually produce
  (a mid-circuit measurement needs `outcomes`). In a `split` layout with `amplitudes`, `validateLayout` requires
  both halves to read the identical circuit, cursor and outcomes.

## Passport and fidelity are course-aware, not kind-aware

`passportOf(state, course = 'sl448')` and `fidelityOf(key, course = 'sl448')` both take a course: 448's labels
and drawers never change, and a second course's fidelity registers through the lazy course pack
(`registerCourseFidelity`), never edits 448's `content/fidelity.ts` directly.
