# Conventions: how to build a chapter end to end

For a Physics 709 chapter (`Q…`, `F…`) and a Papers chapter (`P…` paper lecture, `B…` background). Worked examples: **Q18**
(`app/src/content/qc709/Q18.*`, commit 84cf173 is the whole chapter) and **P1's placeholder** (`app/src/content/papers/P1.paper.ts`).
Run everything from `app/` unless a path starts with `pipeline/`. Do not edit `app/src/physics/**` or `app/src/stage/**` unless the
task says so; engine gaps the rulings assign to a chapter go in `physics/qec/` (or `qc/`) with a numpy twin. Subsystem cards live in `docs/context/cards/`
(qec-engine, qc-engine, stage-kinds, papers-platform, notes-platform, content-model, bridges-notation, tests-and-gate, pipeline): open one only when your task touches it.

## C1. The files

**709 chapter `Q21`** (all under `app/src/content/qc709/`, picked up by file name, no registry edit):

| file | holds |
|---|---|
| `Q21.ts` | `export const Q21: Lecture` (title, outcomes, prerequisites, `symbols`, `symbolsFormal`, units, `corrections`) |
| `Q21.story.ts` | beats per unit (`Q21_STORY: Record<unitId, Beat[]>`), stage shorthand, `Q21_UNIT_CLAIMS_BY_ID` |
| `Q21.values.ts` | `V` (every engine number, key `q21…`), `claim = keyedClaim<ValueKey>()`, re-export `close, d, pct, tf, uf` |
| `Q21.review.ts` | `Q21_REVIEW: Record<unitId, ReviewCard>` |
| `Q21.glossary.ts` | `export const GLOSSARY: GlossEntry[]` (ids `qc-…`) |
| `Q21.test.ts`, `Q21.tryits.test.tsx` | the chapter's own invariants (shape, Corrections at a revealing point) and Try-it lines against the real widgets |
| `pipeline/claims_qc709/q21.py` | numpy twin of EVERY `V` key -> `app/src/physics/__fixtures__/claims-qc709/q21.json` |

Shared files a chapter edits, append only: `qc709/bridges.ts` (bridges it uses), `qc709/concepts.ts` (stations), `qc709/fidelity.ts` or
`content/fidelity.svg.ts` (new fidelity ids), `qc709/meta.generated.ts` (regenerate, never hand-edit), and the e2e lists:
`e2e/course709.spec.ts` (`WRITTEN`, chapter counts, last heading), `e2e/security.spec.ts` (`ROUTES`), `e2e/story.spec.ts`
(`BUILT_709_SVG`, when a unit uses an SVG kind). Edit them; do not run e2e.

**709 lecture notes `N8`** (`app/src/content/qc709/notes/`, card `notes-platform`; found by file name, no registry edit): `N8.ts` (`export const N8: Lecture = notesLecture({…})`), `N8.values.ts` (only for numbers no chapter owns; a number a chapter owns is cited by the chapter's own key, W12), `pipeline/claims_notes/n8.py` -> `physics/__fixtures__/claims-notes/n8.json`; shared, append only: rows in `qc709/bridges.ts`, `meta.generated.ts` (regenerate, never by hand), `e2e/security.spec.ts` `ROUTES` (`'#/709/notes/N8'`) and the `BUILT` list in `e2e/notes.spec.ts`. Plan `P-N8-story.md` (sections are units).

**Papers chapter `B1`/`P1`** (`app/src/content/papers/`, data only, no functions or imports but `import type`): `B1.paper.ts`
(`export const B1: PaperSpec = {…}`), `B1.glossary.ts` (`GLOSSARY`, ids `pp-…`), rows in `papers/bridges.ts` (`pp-` + target unit id),
`pipeline/claims_papers/b1.py` -> `physics/__fixtures__/claims-papers/b1.json`, `meta.generated.ts` (regenerate). New recipes:
`app/src/papers/recipes.ts` (see card `papers-platform`). Claim keys `b1Name` (`^[pb]\d+[A-Z]…`).

## C2. Minimal forms (709)

**Unit** (`Q21.ts`; `clues: []` because clue beats live in the story):
```ts
{ id: 'q21-classical', story: Q21_STORY['q21-classical'], review: Q21_REVIEW['q21-classical'], claims: Q21_UNIT_CLAIMS_BY_ID['q21-classical'],
  title: 'Three copies and a majority vote', question: 'When does copying a bit three times help?',
  lecture: { pages: 'Bergou p. 161; N&C p. 426 (no lecture-notes source)', summary: '…' },
  books: [{ source: 'bergou', where: '§9.1, p. 161', adds: 'what the book adds, one sentence' }],
  visual: { kind: 'bit-table', props: { mode: 'reduce', rows: ['110', '110'] }, tryThis: ['Press Step: the readout says …'] }, // a widget kind + props
  clues: [], insight: '…', insightFormal: '…', pitfalls: ['…'], play: [ /* challenges */ ] }
```
**Beat, both tracks** (`Q21.story.ts`; ids `unit:b1, b2, …` in order, a letter suffix `b5a` is allowed):
```ts
{ id: 'q21-classical:b2', phase: 'books', // 'lecture' = the 709 notes, 'core' = F chapters only, 'books' = Bergou/N&C/Axler, 'clue', 'deeper' (last in its unit)
  text: `Ground-up, ≤ 25 words a sentence: chance $${d(V.q21Fail3, 3)}$ …`, formal: `Formal, ≤ 40 words: $P_{\\text{fail}} = …$`,
  caption: `…`, captionFormal: `…`, stage: split(circ(C, 4), amp(C, 4, 'probability')),     // ONE stage for both tracks; split/circ/amp are small local helpers at the top of the story file (see Q18.story.ts)
  introduces: ['qc-majority'],                                                          // notation beat: see rules
  claims: [claim('q21Fail3', 'three copies fail with chance 0.028', () => close(V.q21Fail3, 0.028, 1e-9))] }
```
A **clue** beat has `phase: 'clue'`, `text` = the question, and `reveal: { text, formal, caption, captionFormal, stage?, claims }`.
**Derivation** on a beat (Ground steps >= Formal steps; the last `tex` of each list ends on the result's right-hand side; each `why` one plain sentence;
>= 2 distinct `view`s per track, each a kind the unit's stage already uses; a step without `view` inherits the previous one of its own list):
```ts
derivation: { result: 'zz^* = |z|^2',
  ground: [{ tex: '(a+bi)(a-bi) = a^2 - b^2 i^2', why: 'Multiply each part by each part.', view: amp(C, 2, 'amplitude'), viewCaption: '…',
             claims: [claim('q21Dot', '110 · 111 = 0', () => V.q21Dot === 0)] }, /* … */ ],
  formal: [ /* shorter list, own views */ ] }
```
**Claim + numpy twin** (three files, one key): `V = { q21Fail3: repetitionFail(0.1, 3) }` in `.values.ts`; the `claim(...)` above;
`out['q21Fail3'] = float(...)` in `pipeline/claims_qc709/q21.py` computed by a DIFFERENT route (numpy matrices, `fractions`, enumeration), never the
literal. Print numbers with `d(x, digits)`, `pct`, `tf`, `uf`; never `${V.x}` raw. The script writes `{"about", "values"}`; run it twice, outputs must be byte-identical.
**Challenge** (hints are exactly 3; a numeric `answer` comes from `V`, never typed; assigned homework -> `walkthrough: []`):
```ts
{ id: 'q21-c-fail', kind: 'numeric', tier: 'core' /* warm-up|core|stretch */, title: '…', prompt: '…', answer: V.q21Fail3, tolerance: 0.005, // unit?: 'degrees' etc.
  hints: [{ text: 'nudge' }, { text: 'key idea' }, { text: 'setup' }], walkthrough: [{ text: `$… = ${d(V.q21Fail3, 3)}$.` }] }
// kind 'choice': options: [{ text, correct: true, why }, …]    kind 'order': steps: string[] (correct order)
```
**Review card** (`Q21.review.ts`): `{ points: [≤5 sentences], equations: 'TeX', trap: '…', claims: [...], formal: { points: [...], trap: '…' } }`.
**Glossary entry**: `{ id: 'qc-majority', term: 'majority vote', gloss: '≤ 25 words.', formal: '≤ 40 words.', first: 'q21-classical:b2', uses?: [ids], symbols?: ['TeX'], bridge?: 'qc-f5-probability', introduces?: 'notation' | 'space' }`.
Use it in prose as `[[qc-majority|shown words]]`; a Spin Lab term is `[[relative-phase]]`.
**Bridge** in prose: `<<qc-f7-gf2|Unit F7.3>>` (always a TABLE id: `qc-` + the target unit id in 709, `sl-…` from 448, `pp-…` in Papers; the target is a BUILT unit; unbuilt chapters are named in words). Every id used needs a row in the
matching table (`qc709/bridges.ts`, `papers/bridges.ts`: `{course, lecture, unit, label}`); a row never used fails (card `bridges-notation`).
**Notation beat**: a gloss entry with `introduces`; exactly ONE beat of the chapter lists it in `Beat.introduces`, at or before `first`, with captions in both tracks.
**Correction** (`Q21.ts` `corrections`; a book's slip, shown in an Errata box):
```ts
{ where: 'Bergou p. 126, Eq. 7.33', says: 'what the page prints', shouldSay: `Our calculation finds … ${d(V.q21Printed, 3)} …`,
  check: () => close(V.q21Printed, 0.25, 1e-9) && close(V.q21True, 1, 1e-9), source: 'book' }   // check = an engine computation at a revealing point
```
**Symbols** (`Q21.ts`): `symbols: { 'U_F': 'q21-qft:b1', … }` maps every TeX symbol to the unit/beat that defines it (first use in EITHER track);
`symbolsFormal` only for a different Formal site. Run the symbols test and add exactly what it lists. Phase and ownership: one owner per concept; a later chapter opens with a one-beat link-back that defines nothing.

## C3. Minimal forms (Papers, `B1.paper.ts`; every value is a literal)

```ts
export const B1: PaperSpec = { specVersion: 1, id: 'B1', kind: 'background', title: '…', outcomes: ['…'],
  references: [{ id: 'bra24', label: 'Bravyi et al. 2024', arxiv: { id: '2308.07915' }, depth: 1, status: 'cited' /* or 'read' + reliedOn */, why: 'one sentence', taughtIn: { course: 'qc709', chapter: 'Q22' } }],
  prerequisites: [{ id: 'stabilizer', label: '…', teach: { course: 'qc709', chapter: 'Q22', unit: 'q22-stabilizer' /* absent = planned */ }, needs: ['bell'], ref: 'bra24' }],
  symbols: { '|\\cdot\\rangle': 'b1-why:b2' }, symbolsFormal: {},
  units: [{ id: 'b1-why', title: '…', question: '…', source: { summary: '…', where: '§2.1, p. 9' },
    tryIt: { kind: 'bit-table', props: {}, tryThis: ['…'] }, insight: '…', insightFormal: '…',
    story: [{ id: 'b1-why:b1', phase: 'books', text: '…', formal: '…', caption: '…', captionFormal: '…',
      stage: { recipe: 'bell-amplitudes', params: { state: 'Phi+' } },        // a RECIPE REF, or a plain stage state, or {layout:'split', top, bottom}
      claims: [{ key: 'b1BellAmp', text: 'each nonzero amplitude has size 1/√2', from: { recipe: 'bell-amplitudes', params: { state: 'Phi+' } }, value: 'a00' }],  // computed
      reported: [{ id: 'gross-params', text: 'plain words', value: '[[144, 12, 12]]', source: 'paper-tdg', at: { kind: 'figure', label: '3b', page: 9 } }], // the paper's own number, as printed
      trail: [{ ref: 'bra24', at: '§2.1 (p. 9)', why: 'one sentence' }] }],   // the reference this step relies on
    play: [{ id: 'b1-c1', kind: 'numeric', tier: 'core', title: '…', prompt: '…', answerFrom: { from: { recipe: 'bell-amplitudes', params: { state: 'Phi+' } }, value: 'a00' }, tolerance: 0.005, hints: [h, h, h], walkthrough: [{ text: '…' }] }] }] }
```
Derivations in a spec are `{ result, ground: [{tex, why, view?: stage or recipe ref}], formal: […] }`. A recipe parameter that IS a reported value says `uses: ['gross-params']` on the ref.
`reported`/`trail` text is plain words (no `$`, `[[`, `<<`, backslash). A reported value never feeds a computed claim unless the ref says `uses`. **Corrections in Papers are data**
(`{ claim: '<key>', printed, location }`, check in the paper's claims module; ruling papers-P1 R4): the field is not in `PaperSpec` yet, so the P1 build adds it. Cite a paper by SHORT title
+ arXiv id (a 12+ word title trips the verbatim guard). Glossary (`pp-…`) and bridges (`pp-` + target unit) are shared by all papers.

## C4. House rules

1. **Two tracks, one stage.** Every beat/reveal has `text` + `formal` and both captions; every unit `insight` + `insightFormal`; every review card a `formal` block; every gloss `formal`.
   Ground-up starts at 9th grade and derives every step (<= 25 words per sentence); Formal uses full notation (<= 40). Symbols are defined before use and claims backed, in BOTH tracks.
2. **Numbers come from the engine.** Every learner-visible number is in `V` (computed by `physics/`), printed via `d/pct/tf/uf`, backed by a keyed claim with a numpy twin; every unit with a story shows >= 1 number.
   Keys are `q21…`, alphanumeric, unique across all courses (`mergeValues` throws on a duplicate). A Papers number is either *computed* (recipe output) or *reported* (the paper's, as printed, with source + location).
3. **No raw TeX outside `$…$`** (derivation `tex` excepted). Avoid `\leftrightarrow`, `\mathbb`; `{{key|shown}}` cannot wrap TeX containing `|` (use `\htmlClass{term-key}{…}` inside the TeX).
   The number reader takes digits around a point as a decimal: write a binary fraction `0{.}101_2` and powers as `2^{-m}`, not `1/2^m`; keep theorem numbers out of prose (cite by printed page).
4. **Paraphrase and cite** (book §, printed page; Bergou's offset varies per chapter: table in `docs/roles/proposals/P-709-map.md` (d)-E1; Axler PDF-14, Townsend PDF-16, N&C PDF-28). `verbatim.test.ts` compares 8-grams against the git-ignored `sources/`. `sources/` text never enters `app/`.
5. **Homework**: an assigned problem (either course) gets hints only (`walkthrough: []`); `⚑` problems are cited, never worked.
6. **Conventions**: |0> = |+z> (north); q0 is the leftmost factor, top wire, MSB; phi is an ANGLE (a fraction of a turn is tau); S = P(pi/2); hbar = 1 in the engine (the UI appends it); Bell names with a "(Bergou: …)" tag on first use.
7. **Corrections** are worded "our calculation finds …" with an engine `check()`; the independent review re-verifies each on the page image and cuts one it cannot confirm.
8. **Never** add a new chapter to `DERIV_VIEW_LEGACY`; never hand-edit `*.generated.ts`; never copy a picture the engine cannot draw (decor media states nothing).

## C5. Commands (from `app/`; quiet output)

```sh
npx tsc -p tsconfig.app.json --noEmit 2>&1 | tail -20          # types, 0 errors
npx tsc -b 2>&1 | tail -20                                     # the build's type check (app, node and e2e projects)
npx vitest run src/content/qc709/Q21.test.ts --reporter=dot 2>&1 | grep -E "FAIL|×|Tests |Test Files|Error" | head -30   # targeted
npx vitest run src/content --reporter=dot 2>&1 | grep -E "FAIL|×|Tests |Test Files" | head -30                         # all content lints, per course x track
npx vitest run src/papers src/content/papers --reporter=dot 2>&1 | grep -E "FAIL|×|Tests |Test Files" | head -30       # Papers chapters
UPDATE_META=1 npx vitest run src/content/meta.test.ts --reporter=dot 2>&1 | tail -5   # regenerate the shelf registries; run it TWICE (the second run must write nothing new)
python3 ../pipeline/claims_qc709/q21.py && python3 ../pipeline/claims_qc709/q21.py    # numpy twins (or claims_papers/b1.py, claims_notes/n8.py), twice; then `cmp` the JSON against a copy
```
Claim twins check engine values at 1e-12 (`claims.test.ts`); a failing displayed-number test names the beat. Fix the content, not the tolerance.
Challenge tolerances: 0.005 for decimals unless the plan states otherwise; **integer answers use tolerance 0** (house rule; the validator accepts 0).

## C6. Agent hygiene

- **Batch reads** (one call, many files), read only the cards your pack lists, and read a source file only to change it. Trust this bus; if a card is wrong, fix the card in your commit.
- **Write a whole unit per Write** (one file write per unit or per section), not line edits; `Edit` only for small registry rows. Commit after real progress, not only at the end.
- **Quiet output**: `--reporter=dot`, then `grep -E "FAIL|×|Tests |Test Files"`; `tail -20` any build log; never print a file you wrote or a test log you did not filter.
- **Do not run** the full vitest suite, `npm run build`, or Playwright (the judge's gate runs them: `pipeline/gate.sh`, preview then dev project). Run only your targeted tests plus `src/content` (or `src/papers`) once before the commit.
- **Visual check = ONE contact sheet per track**: a throwaway `e2e/_qa-<id>.spec.ts` (never committed) screenshots each beat/reveal into `e2e/__screens__/<id>/<track>/`, a PIL montage makes one image per track in the scratchpad, you look at it once and fix what you see. Delete the spec.
- **Never pipe the leak audit** (`python3 pipeline/audit_public.py --verbatim` runs unpiped, by the judge). The pre-commit hook (`git config core.hooksPath .githooks`) blocks credentials, personal paths, e-mails and PDFs; keep local paths and scratchpad paths out of every committed file.
- Add files by explicit path (`git add <paths>`), never `-A`; `app/node_modules` and `sources` links stay uncommitted. Do not push or merge; end the commit message with the Co-Authored-By line the task gives.
- **Finish with a relay note**: `docs/context/relay/YYYY-MM-DD-<task>.md`, <= 120 words (what changed, new APIs, gotchas, files); update any card whose API you changed in the same commit.
