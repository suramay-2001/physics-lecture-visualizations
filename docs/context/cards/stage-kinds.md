# Card: stage kinds

A beat's `stage` is data: a `StageState` (`{kind, ...fields}`), or `{layout: 'split', top, bottom}` / `{layout: 'inset', main, inset}` (a layout never repeats a kind).
Types: `app/src/content/stage.ts` (`StageState`, per-kind interfaces; unknown or misplaced fields are rejected by `stage/resolve.ts validateLayout`, with a message naming
the field). Spec (long): `docs/specs/stage-kinds.md`. Field lists for every kind: `docs/context/generated/ids.json` -> `stageKinds`. In Papers a stage may also be a
recipe ref (`{recipe, params}`, card `papers-platform`). Every SVG kind's scene also draws its print figure; `shot` picks a camera/frame preset (leave to the default or copy a neighbour).
`KIND_RENDER`: 448's six kinds are WebGL (`gl`), the rest SVG (`svg`, lazy chunk `stage/svg/kinds.ts`, no WebGL). Course-aware passport/fidelity: `PASSPORT`, `content/fidelity.svg.ts`.

| kind | draws | key fields |
|---|---|---|
| `complex-plane` | numbers as arrows: sums, products, conjugates, powers, Euler path, roots/spokes, clock | `z, w, show[], powers, euler, chain, spokes, clock, circle, line, trail` |
| `amplitudes` | one bar per basis string (<= 5 qubits on stage); length = size, hue = phase | `state: {ket\|bell\|terms\|dir\|circuit+upTo+outcomes}`, `mode: 'amplitude'\|'probability'\|'signed'`, `dft, keep (count or wire list), inBasis:'bell', dials, sum, labels, showColumn` |
| `circuit` | a `physics/qc` `Circuit` by columns with a scrub cursor | `circuit, upTo (number or Sweep), outcomes, observable` |
| `matrix` | grid view (a labelled complex matrix, pair view) or `tableau` view (Pauli rows) | grid: `source, labels, values, cells, factors, blocks, highlight*, trace, partialTrace, svd, spectrum, ptranspose, basis`; tableau: `tableau, state, targets, players, product` |
| `two-qubit` | two reduced Bloch balls + 3 x 3 correlation grid, CHSH, concurrence | `source, local, condition, arrows, grid, axes, readouts` |
| `plot` | a NAMED curve (never points) with markers/bands | `curve: {fn, x?, samples?}, markers, bands, yLines, yScale`; fn from `PlotCurveName` in stage.ts (chsh, nSquared, twoToN, peBest3, repFail3/5, identityP, qhbNeed1, steaneFailX, ...) |
| `bb84` | the BB84/B92 ledger, one row per photon | `protocol, rounds ({board}\|{seed,count}), eve, show, sift, test, readouts` |
| `clocks` | two phase clocks beside an energy ladder | `levels, start, timeDeg, show, readouts` |
| `grover-plane` | Grover's real plane | `search: {n, marked?}, k, half, mirrors, trail, arcs, proof, readouts` |
| `bits` | classical bits: a gate/function table or map, rows (xor/dot), GF(2) row reduction | exactly one of `fn: {source, view, versus, mark}`, `rows: {strings, combine}`, `reduce: {strings, upTo}` |
| `code` | one stabilizer code from the engine registry | see below |
| 448 GL kinds | `lab-r3`, `hilbert-plane`, `bloch`, `bloch-ball`, `hopf`, `operator-space` | see `stage.ts`; 709 chapters use `bloch` with `shot: 'B-STD'` etc. |

## `code` (the error-correction kind, shared by Q21, Q22 and the Papers chapters)

```ts
{ kind: 'code', code: 'steane7', view?: 'layout'|'checks'|'words', error?: 'X5' | 'IIIIXII', show?: ['syndrome','correction','residual','logical'],
  correction?: 'X5', errors?: [up to 8 Pauli strings] /* checks */, word?: 0|1|'plus' /* words */, focus?: number|'X12'|[a,b] /* bicycle */, shift?: [a,b] /* bicycle */ }
```
- `code` is a registry id (`rep3, rep3x, shor9, steane7, five5, surface3, surface5, gross, two-gross`; `physics/qec/registry.ts`), never coordinates. To draw a new code, register it first.
- Layout: numbered discs = data qubits, squares = checks (X and Z in the two letter hues), edges = what a check acts on. `error` writes letters on discs (a Pauli string of length n, or hit qubits counted
  from 1: `"X2"`, `"X1Z4"`). `syndrome`, `correction`, `residual` need an `error` (residual needs `correction`); `correction` defaults to the lookup decoder's, an authored one must have the error's syndrome.
  Bicycle codes (`gross`, `two-gross`) draw an l x m torus tile; only `focus`ed checks (at most 2) get edges (long-range edges are labelled stubs), `shift` draws x^a y^b. `checks` and `words` views: n <= 9.
- Limits: layout <= 25 qubits and <= 24 checks; words view one logical qubit and <= 16 strings. Distances: exact for n <= 25, the bicycle d is the paper's number, REPORTED.
- A lit check means "this check read -1", not "this qubit is broken" (fidelity `qc-code-lit`). Print figure 320 x 360. Passport "CODE · qubits and checks". Shot `CD-CODE`.
- Not built yet (planned by the Papers plans B1-B4, P1): torus/planar views of the toric and unrotated surface code, `spacetime`, `module-map`, `circuit.faults`, plot `series`; do not use them in a build unless a pack says they exist (check `ids.json` -> `stageKinds`).

## Related additions that exist

`amplitudes.keep` takes a wire list (`[3, 4]`, marginal over those wires, mode `probability` only); `plot` curves above; `circuit` labels wrap, classical conditions show `c0c1=10`;
`matrix` pair view (`source: {pair…}`, readouts `dims norm params marginals means det product`); `matrix` tableau view for <= 3 qubits (`tableau: …`). A fidelity note
(`exact` / `schematic` / `misleading`, keys like `qc-code-engine`) is registered in `content/fidelity.svg.ts` or `qc709/fidelity.ts`; a beat names it in `fidelity: ['qc-code-lit']`.
Gotchas: a split never repeats a kind; a derivation `view` must use a kind the unit's stage already shows; transitions between different pictures of one kind switch at the half-way point.
