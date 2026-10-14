# Design spec: the Papers section, the paper spec and the recipe registry

Rulings: `docs/roles/decisions/papers.md` (R1 format, R3 two kinds of number, R4 a paper lecture is data, R5 the
reference trail). Source of truth once built: `app/src/papers/spec.ts` (the format), `app/src/papers/recipes.ts`
(the registry), `app/src/papers/validate.ts` (the checks), `app/src/papers/compile.ts` (spec → `Lecture`). This spec
adds a THIRD course to the app; read `content-model-two-track.md` and `stage-kinds.md` first: a paper lecture is a
two-track 709-style chapter, and every visual it draws is one of the existing stage kinds.

## 1. What a paper lecture is

A **paper spec** is plain data: one object literal, no functions, no computed values, no imports but types. The
offline pipeline writes it today; a later smart tool writes the same thing. The site validates it, compiles it into
an ordinary `Lecture` (so `LecturePage`, the story stage, Read mode, print, the notation key and every content lint
treat it like any other chapter) and renders it. Nothing in a spec is ever evaluated as code: a picture is either a
stage state (data the kind's own resolver and validator already accept) or a **recipe reference** that names an entry
of an allow-listed registry with typed parameters.

```
smart tool / offline pipeline ──emits──▶ content/papers/P1.paper.ts   (data only: JSON + one export line)
                                          content/papers/P1.glossary.ts (data only)
                                          content/papers/bridges.ts     (data only)
          the site:  tsc (types) ─▶ data-only AST gate ─▶ validatePaperSpec ─▶ compilePaper ─▶ Lecture ─▶ LecturePage
                                                                   │
                                                 recipe registry (papers/recipes.ts): id → param checks → engine → stage state
```

### Ids (course `papers`)

| What | Shape | Example |
|---|---|---|
| course id / URL prefix | `papers` | `#/papers`, `#/papers/ch/P1` |
| a paper lecture | `P<n>` | `P1` (Tour de gross) |
| a background chapter (R2) | `B<n>` | `B1` (the surface code, planned) |
| unit | `<chapter lower-case>-<slug>` | `p1-why-codes` |
| beat | `<unit>:b<k>` | `p1-why-codes:b2` |
| computed claim key | `<chapter lower-case><Name>` | `p1BellAmp` |
| shared ids (glossary, bridges) | `pp-…` | `pp-gross-code`, `pp-q6-bell-basis` |
| reference (paper-local) | `[a-z0-9-]+` | `bra24` (anchor `#ref-bra24` on the References page) |
| reported claim (paper-local) | `[a-z0-9-]+` | `gross-params` |
| prerequisite node (paper-local) | `[a-z0-9-]+` | `stabilizer-code` |

`courseOfId` sends `P…`/`B…`/`p…-`/`b…-`/`pp-…` to `papers`; `content/courses.test.ts` checks that no id of another
course falls in that space.

## 2. The paper spec format (`papers/spec.ts`)

```ts
interface PaperSpec {
  specVersion: 1
  id: 'P1' | 'B1' | …            // the chapter id; P = a paper lecture, B = a background chapter
  kind: 'paper' | 'background'
  title: string                  // the lecture's title (paraphrase; never the paper's full title)
  paper?: PaperMeta              // required for kind 'paper', absent for 'background'
  outcomes: string[]
  references: ReferenceSpec[]    // the references used (R5)
  prerequisites: PrereqNode[]    // the prerequisite graph (R2)
  symbols?: Record<string, string>; symbolsFormal?: Record<string, string>
  units: UnitSpec[]
}

interface PaperMeta {
  shortTitle: string             // 'Tour de gross' (a 12+ word title trips the verbatim guard: R7)
  authors: string[]              // family names, in the paper's order
  arxiv: { id: string; version: number }   // '2506.03094', 1  →  arXiv:2506.03094v1
  date: string                   // 'YYYY-MM' (the version's date)
  institution?: string
  source: string                 // the ingest source id: 'paper-tdg' (pipeline/course.papers.json)
  licence: string                // the licence note shown under the paper card
}
```

### References (R5)

```ts
interface ReferenceSpec {
  id: string                     // paper-local
  label: string                  // short: 'Bravyi et al. 2024' (author + year, never a 12+ word title)
  arxiv?: { id: string; version?: number }; doi?: string
  depth: 1 | 2                   // 1: the paper cites it; 2: a depth-1 reference cites it
  via?: string                   // depth 2 only: the depth-1 reference it was reached through
  status: 'read' | 'cited'       // read: the part relied on was read (online, R6); cited: only cited
  reliedOn?: string              // read only: the section / page relied on ('§3, pp. 4–6')
  why: string                    // one sentence: what the paper needs from it
  taughtIn?: TeachRef            // where the idea is taught (448, 709, a background chapter or this lecture)
}
type TeachRef = { course: 'sl448' | 'qc709' | 'papers'; chapter: string; unit?: string }   // unit absent = planned chapter
```

### The prerequisite graph (R2)

```ts
interface PrereqNode { id: string; label: string; teach: TeachRef; needs: string[]; ref?: string }
```

Every node links to exactly one teaching unit (`teach`): a written unit of 448, 709, a background chapter or the paper
lecture itself; or, while it is not written yet, a planned chapter (`unit` absent; drawn "in preparation", like the 448
concept map's planned stations). `needs` are other node ids (a DAG); `ref` names the reference the idea comes from.

### Units and beats (R1: the two-track 709 model)

`UnitSpec` and `BeatSpec` are the data subset of `Unit` and `Beat` (`content/schema.ts`, `content/stage.ts`), with
three changes:

1. Wherever a stage state may appear (a beat's `stage`, either half of a `split`/`inset` layout, a reveal's stage, a
   derivation step's `view`) the spec may write a **recipe reference** instead: `{ recipe: 'grover-plane', v?: 1,
   params: { n: 4 }, uses?: ['reported-id'] }`.
2. Claims are data. A **computed** claim names its engine value through a recipe:
   `{ key: 'p1BellAmp', text: '…', from: { recipe, params }, value: 'a00' }` (the value is the recipe's named
   output). The ledger checks every key against its numpy twin (`pipeline/claims_papers/<id>.py` →
   `physics/__fixtures__/claims-papers/<id>.json`), exactly as for 448 and 709. A numeric challenge's answer is
   `answerFrom: { recipe, params, value }`, never a literal.
3. Two new beat fields (both also on the shared `Beat`, additive):
   - `trail: { ref, at, why }[]` — the reference this step relies on, the section/page relied on, and why. Drawn as a
     compact line "This step relies on Bravyi et al. 2024, §2 — why" whose link opens that reference's entry on the
     References page.
   - `reported: { id, text, value, source, at }[]` — the paper's own number (R3): `value` exactly as printed
     (`[[144, 12, 12]]`, `1 × 10⁻⁷`), `source` the ingest source id, `at` the exact location
     (`{ kind: 'table' | 'figure' | 'section' | 'equation' | 'text', label, page }` → "Figure 3b, p. 9"). Drawn in its own
     block with a "Reported" badge in a style no engine number uses, and screen-reader text "reported by the paper,
     Figure 3b, page 9". It never joins `claims` (the engine's list); the claim ledger accepts a number in a beat's
     prose only if an engine claim of the beat backs it or it equals the printed value of one of the beat's reported
     claims. A recipe parameter that IS a reported value says so with `uses: [reportedId]` (R3: "unless that
     computation says it uses the paper's number"); the validator checks the id exists.

Phases: `'lecture'` reads "The paper says" in the Papers course (what the paper itself states, with its `§`/page in
the unit's `source.where`), `'books'` reads "A reference adds", `'clue'` and `'deeper'` as elsewhere. A unit's Try-it is
a widget spec (`kind` + data props), checked by the same props gate as every chapter.

## 3. The recipe registry (`papers/recipes.ts`)

A recipe is an engine computation with typed, validated parameters that returns props for an EXISTING stage kind.

```ts
interface RecipeDef<P> {
  id: string                     // 'bell-amplitudes'
  version: number                // bumped when a parameter or output changes meaning; a ref may pin `v`
  title: string                  // what it draws, for docs and errors
  kinds: StageKind[]             // the kinds it may return
  params: ParamShape<P>          // closed vocabulary: int, num, oneOf, bool, bits, list, shape, optional
  run(p: P): { stage: StageLayout; values: Record<string, number> }   // pure: engine calls only
}
const RECIPES = { 'bell-amplitudes': …, 'grover-plane': …, 'circuit-gates': … } as const
type RecipeRef = { [K in keyof typeof RECIPES]: { recipe: K; v?: number; params: ParamsOf<K>; uses?: string[] } }[keyof typeof RECIPES]
runRecipe(ref: unknown): { ok: true; stage; values } | { ok: false; problems: string[] }
```

Contract:
- **Allow-listed.** `RECIPES` is a literal object in source; `runRecipe` looks the id up with `Object.hasOwn` (so
  `__proto__`, `constructor` and the like are unknown ids). Nothing is ever imported, required or evaluated from
  data: no `eval`, no `Function`, no `import(variable)` (the existing `security/noEval.security.test.ts` AST gate
  covers `papers/` like every other file, and stays green).
- **Typed, validated parameters.** Each parameter is checked by a small combinator (`papers/params.ts`); unknown
  keys, wrong types, non-integers, out-of-range values and cross-field rules (a target wire inside the register, at
  most `2ⁿ − 1` marked strings) are rejected with a message that names the path:
  `P1 p1-why-codes:b2 stage: grover-plane params.n: expected a whole number from 1 to 10, got 12`.
- **Pure.** `run` calls only `physics/` functions and returns plain data; the same params always give the same
  stage and values. The returned stage is then checked by the kind's own validator (`stage/resolve.ts
  validateLayout`) in the tests, so a recipe can never return a picture the kind would refuse.
- **Versioned.** `RECIPE_REGISTRY_VERSION` and each recipe's `version`; a spec ref with `v` that does not match is
  rejected ("re-emit the spec"), so an old spec never silently draws a changed picture.
- **Named outputs.** `values` are the numbers a claim may cite (`value: 'a00'`), always from the engine.

Demo recipes on today's engine (the QEC recipes, e.g. "a bivariate bicycle code from polynomials A, B on an l × m
torus", are registered later by the QEC engine work):

| id | params | kind | engine | outputs |
|---|---|---|---|---|
| `bell-amplitudes` | `state: 'Phi+' \| 'Phi-' \| 'Psi+' \| 'Psi-'`, `show?: 'amplitude' \| 'probability'`, `basis?: 'computational' \| 'bell'` | `amplitudes` | `physics/qc/state.ts bell` | `a00 a01 a10 a11` (sizes), `p00 … p11` |
| `grover-plane` | `n: 1–10`, `marked?: 1 … 2ⁿ−1`, `steps?: 0–64 \| 'best'`, `mirrors?`, `arcs?`, `readouts?` | `grover-plane` | `physics/qc/grover.ts groverAngle, groverOptimalK, groverSuccess` | `N`, `alphaDeg`, `kBest`, `steps`, `pSuccess` |
| `circuit-gates` | `qubits: 1–5`, `gates: {gate, target, control?, other?}[]` (1–24), `upTo?`, `show?: 'circuit' \| 'amplitudes' \| 'both'` | `circuit`, `amplitudes` | `physics/qc/circuit.ts validateCircuit, runCircuit` | `p<bits>` for every basis string at the cursor |

## 4. Validation: build time, test time, load time

| When | What | Where |
|---|---|---|
| build (`tsc -b`, part of `npm run build`) | the spec is a `PaperSpec`: a recipe id outside the registry or a parameter of the wrong type fails the build at the exact line | `papers/spec.ts` types; `RecipeRef` is derived from `RECIPES` |
| test (`npx vitest run`, the gate's second half) | the spec files are data only (AST: object/array/string/number/boolean/null literals; `import type`; one `export const`); `validatePaperSpec` on every spec (ranges, cross-field rules, id shapes and order, two-track text, references, trail and reported ids, prerequisite DAG); every recipe output passes the kind's validator; teaching links, bridges and glossary ids resolve against the real registries; claim keys have numpy twins; every shared content lint (sentence caps, symbols, gloss, verbatim, claims) | `papers/*.test.ts`, `content/*.test.ts` |
| load (the chapter page) | `validatePaperSpec` again before `compilePaper`; an invalid spec shows its problems as a list instead of a page (defence in depth: a spec that reached the site without the gate) | `pages/PapersPages.tsx` |

Errors are plain sentences that start with where (`P1 p1-why-codes:b2 trail[0].ref`), say what was expected and what
was found, and are all reported at once (not the first only).

## 5. How a later smart tool plugs in

It emits files, nothing else:
1. `content/papers/<ID>.paper.ts` — `import type { PaperSpec } from '../../papers/spec'` and `export const <ID>:
   PaperSpec = <JSON>` (JSON is a valid TS literal); `<ID>.glossary.ts` (`export const GLOSSARY: GlossEntry[] =
   <JSON>`); rows in `content/papers/bridges.ts`.
2. `pipeline/claims_papers/<id>.py` — the numpy twin of every computed claim key.
3. Then `UPDATE_META=1 npx vitest run src/content/meta.test.ts` (the shelf's light registry) and the gate.

It needs no code change to get working, interactive pictures as long as the recipes it names exist. A new kind of
computation (the QEC engine's codes, decoders) is added by a developer as a registry entry with its numpy-twinned
engine function and tests; the smart tool can then name it. Files are picked up by name (`import.meta.glob`), so a new
paper touches no shared file but the bridges table and the generated registry.

## 6. Routes, pages and chunks

| Route | Page |
|---|---|
| `#/papers` | the shelf: one card per paper (short title, authors, arXiv id + version, date, licence note, links to the lecture, its References used and its prerequisite map) and the background chapters |
| `#/papers/ch/<id>` | the lecture (the shared `LecturePage`, two tracks, Read mode, print, notation key) with the paper card on top |
| `#/papers/refs/<id>` | References used (R5): each reference with its depth (1 or 2, and via which), read vs cited, the part relied on, why, where its idea is taught, and every step that relies on it (links back into the lecture) |
| `#/papers/prereq/<id>` | the prerequisite map: the concept-map component (`components/ConceptLines.tsx`, shared with 448's map), one line per teaching chapter, one station per node, each linking to its teaching unit; "builds on" edges on hover/focus and in words |

Bridges (`<<pp-…|words>>`, `content/papers/bridges.ts`) lead into 448 and 709 units with the return bar back to the
exact beat (`?ret=papers~P1~p1-…:b2~0.5~ground`). The course switcher lists Papers third.

Chunks: nothing of `papers/`, `content/papers/` or the papers pages is in the entry closure; each spec is its own
chunk; the papers pack holds every paper's glossary and no spec; no chunk holds papers content together with 448 lecture
or 709 content (`build/chunks.test.ts` rule (q)). What the entry gains is the course's row in `COURSES`, its routes'
lazy imports, and the two small beat lines (trail, reported) that the shared story renders.

## 7. The security argument

- **No generated code runs.** A spec is data, proven by an AST gate on every spec file; the recipe registry is the
  only door from data into the engine, and it is a literal allow-list looked up with `Object.hasOwn`.
- **No new sink.** Spec text goes through the same `Rich` renderer (KaTeX trusted only for authored TeX, the
  `renderAuthoredTexStrict` gate in the content test) as every chapter; links are built from ids with `paths.ts`
  (`ret` stays ids-only); no `innerHTML`, no URL from data (arXiv links are built from a validated `NNNN.NNNNN` id).
- **CSP unchanged** (`build/csp.ts`): no inline script, no `unsafe-eval`, no remote origin; papers pages fetch only
  their own chunks. `security/noEval.security.test.ts` and `e2e/security.spec.ts` (with the papers routes) stay green.
