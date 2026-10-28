# Card: which tests guard what, and the gate

Run from `app/`. 205 test files; a chapter agent runs only the targeted ones (see `conventions.md` C5); the judge runs the gate. Build before vitest in the gate: the security and chunk tests read `dist/`.

| test file(s) | guards |
|---|---|
| `content/content.test.tsx` | per chapter x track: beat/reveal shape (both tracks), phases (`phaseProblems`), beat id order (`checkBeatIds`), derivation lists (end on result, Ground >= Formal, >= 2 valid distinct views of kinds the unit's stage shows), notation beats (exactly one introducing beat per `introduces` gloss), fidelity ids, claims `holds()`, Corrections, Go-deeper (`deeperProblems`), class markers, one-track derivations. `DERIV_VIEW_LEGACY` is empty |
| `content/claims.test.ts` | every `V` value equals its numpy twin (1e-12); every number a learner reads (the number reader) is a claim's formatted value or a reported value of its beat; raw floats banned; Papers computed claims |
| `content/symbols.test.ts` | symbol before use, gloss at first use, sentence caps (Ground 25, Formal 40; summaries, insights, glosses, review points), <= 5 review points; per course x track |
| `content/verbatim.test.ts` | no 8-gram of authored prose appears in `sources/` (found automatically from a worktree; `SPINLAB_SOURCES` overrides) |
| `content/meta.test.ts` | the generated registries (`meta.generated.ts`, 448/709/Papers) equal the chapters on disk; files export what their name says. `UPDATE_META=1` rewrites them |
| `content/courses.test.ts`, `qc709/outline.test.ts` | id namespaces by course; the 709 outline's chapter ids and statuses |
| `qc709/bridges.test.ts`, `content/bridges448.test.tsx`, `papers/papersContent.test.ts` | bridge ids used/unused/resolving; Papers glossary and bridges |
| `content/concepts.test.ts`, `qc709/concepts` rows | concept-map stations link to real units |
| `content/notation*.test.ts` | notation dictionary, taught-in links, no typed digits on cards, per-chapter class pins (see card `bridges-notation`) |
| `qc709/<ID>.test.ts`, `<ID>.tryits.test.tsx` | the chapter's own shape and Corrections; Try-it lines vs the real widget code; `widgets/visualSpecs.test.tsx` is the props gate for every chapter's widget specs |
| `qc709/games.test.ts`, `arcade/games.test.ts` | Arcade levels (engine verdicts); each item `trains` a unit |
| `papers/*.test.ts` | spec AST gate (`specData`), `validatePaperSpec`, recipes (allow-list, params, outputs, pure), `BeatPaperNotes` |
| `physics/**/*.test.ts`, `physics/qec/fixtures.test.ts` | the engine against numpy fixtures (`__fixtures__/*.json`) and properties; `qec/purity.test.ts` bans impure code in `physics/qec` |
| `stage/**/*.test.*`, `stage/svg/*.test.*` | resolvers, validation, interpolation, passports, print figures per kind |
| `security/*.security.test.ts`, `ui/*.security.test.ts` | no `eval`/`Function`/dynamic import of data (AST gate over every source file, so a new file is checked), CDN rule, `ret` param hostility, TeX trust, parse limits |
| `qc709/notes/kit.test.ts`, `notes/notes.test.ts`, `content/unitNotes.test.ts`, `components/UnitNotesLink.test.tsx`, `pages/NotesPages.test.tsx` | the 709 lecture notes (card `notes-platform`): each `notesProblems` rule fails on a mutation; per lecture: valid spec, pages monotone, word window, W4 (every section links a built unit), W12 (claim keys are its own or a chapter's existing key), feeds and the reverse index equal the generated registry; the chip and the page render. Shared lints read notes as lectures: `content.test.tsx`, `symbols.test.ts`, `claims.test.ts` (per-lecture number floor: full >= 3, short >= 1), `bridges.test.ts`, `meta.test.ts` (fourth registry `NOTES_META`/`NOTES_BY_UNIT`, `UPDATE_META=1` twice) |
| `build/chunks.test.ts` | chunk contract (needs `dist/`): (r) the 709 lecture notes are lazy and one chunk each, no chunk beside another lecture's story, content or glossary module (a chapter's `*.values.ts` is allowed, W12), and the same for the Optics Lab pages (`opticsLeaks`; the bench and its presets are lazy chunks too); (a)-(g) Babylon/three isolation and lab budgets; (d) each lecture/chapter content in its own chunk, never in the entry; (h) no 709 content or `physics/qc` in the entry; (i) no chunk mixes 709 and 448 content; (k) no DEV fixture ships; (l) entry byte budget (496,026 raw / 168,838 gzip after the Townsend pass trim; budget 497,500 / 170,000; a helper only lectures read goes outside the modules the entry imports: `physics/townsend448.ts`, `content/readingOrder.ts`, `stage/sceneTokens.ts`); (m) SVG kinds lazy; (n) 448 data lazy; (o) notation lazy; (p) KaTeX, GSAP, widgets lazy; (q) Papers nothing in the entry, a spec per chunk |

**e2e conventions** (`app/e2e/*.spec.ts`, Playwright on the installed Chrome; never `playwright install`): projects `preview` (production build, `vite preview`, port `PW_PREVIEW_PORT` default 4178) and `dev` (Vite dev, `PW_DEV_PORT` default 5178), run
SEPARATELY (one web server per invocation), `workers: 1`, 60 s timeout. Use `collectErrors(page)` / `expectNoErrors(errors)` (`e2e/helpers.ts`) for 0 console errors. `security.spec.ts` `ROUTES` lists every route (0 CSP violations,
0 third-party requests); each new chapter route (and each `#/709/notes/N<k>`) goes there; `notes.spec.ts` holds the `BUILT` list of notes lectures. Specs tagged `@dev-only` skip in `preview`. A parallel agent can cause load-only failures (timeouts): rerun quiet before believing a failure; diagnose flakes by instrumenting `window`, then
`--repeat-each=12 --workers=6`. Screenshots go to `e2e/__screens__/` (git-ignored); a throwaway `_qa-*.spec.ts` is never committed. Print is tested with `page.pdf()` in memory only (no PDFs under `app/`).

**The gate** (`pipeline/gate.sh`, the judge's): `npm run build` (= `tsc -b && vite build`), then `npx vitest run`; logs in `$GATE_LOGS`; prints `gate: green` and counts. Then both Playwright projects, contact sheets, `python3 pipeline/audit_public.py --verbatim` (unpiped), `graphify update .`.
A chapter agent never edits `gate.sh`.

**Failure triage.** A displayed-number failure names `unit:beat` and the unlisted number -> add or fix a claim. A symbols failure lists the symbol and site -> add it to `Lecture.symbols` (or define it in the beat). A meta failure -> regenerate (twice).
A chunk failure after adding an import -> the new file landed in the entry closure; import it lazily. A `noEval` failure -> a forbidden construct in new code (also in specs: only literals).
