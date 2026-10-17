# Card: bridges, glossary, notation

## Bridges (a link into another course's unit, with a way back)

- Prose: `<<id|shown words>>` (`walk.ts` `INLINE_RE`). Registry: `BridgeTarget {course: 'sl448'|'qc709'|'papers', lecture, unit, beat?, label (1-80 chars, a few words)}` (`content/bridgeRegistry.ts`).
- Three tables, ids are namespaced by prefix (`courseOfId`): `qc709/bridges.ts` `BRIDGES` (`qc-…`, 709 chapters -> 448 units or other 709 chapters), `content/bridges448.ts` `BRIDGES_448` (`sl-` + target unit id, 448 -> a WRITTEN 709 unit;
  the lecture file does `import './bridges448'`), `content/papers/bridges.ts` `PAPER_BRIDGES` (`pp-` + target unit id, Papers -> 448/709, or an earlier Papers chapter: `course: 'papers'`). 84 ids today: `docs/context/generated/ids.json` -> `bridges`.
- In prose every `<<id|…>>` is a TABLE id (`qc-f7-gf2`, `pp-q6-bell-basis`, `sl-q14-min-error`); the same ids go in a gloss entry's `bridge:`. By convention the id is the prefix + the target unit id; the row says where it lands.
- A bridge only ever targets a BUILT unit (and a built beat when `beat` is set). An unbuilt chapter is named in words ("Chapter Q22"), never `<<…>>`. A link-back beat names its target and defines nothing new.
- **Lecture notes** (card `notes-platform`): a notes section links the chapters with ordinary `qc-` rows (`<<qc-q1-sequences|Unit 1.2>>`; notes prose counts as use). The reverse direction is generated, not authored: `qc709/registry.ts` registers a bridge `qc-<section id>` (`qc-n8-bell-basis`: `{course:'qc709', lecture:'N8', unit:'n8-bell-basis', label:'Lecture 8 notes, §C, pp. 25–26'}`) for every section that feeds a chapter unit, and the chapter's `ChapterCard` shows them as "From the lecture notes" chips (`UnitNotesLink`). `bridgePlace` names a notes target "Lecture 8 notes" (not "Chapter N8"); `ret=qc709~N8~n8-bell:b2~0.4~formal` is valid (`chapterId` accepts `N<k>`; the unit must start `n8-`), and `lecturePath('N8')` is `/709/notes/N8`.
- Tests: `qc709/bridges.test.ts`, `content/bridges448.test.tsx`, `papers/papersContent.test.ts` fail on an id used but missing, a target that does not resolve, a table row never used, a bad label.
- Return trip (all ids, never a URL): `?ret=<course>~<chapter>~<unit:beat>~<frac>~<track>#<anchor>`, parsed field by field against the live registries (`ui/returnParam.ts`, `returnParam.security.test.ts`); `ReturnBar` shows
  "Return to 709 · Chapter Q8 · …, step 4" and restores the reading position and focus. Nothing to author beyond the table row.

## Glossary

- Entry (`GlossEntry`): `id` (`[a-z0-9-]+`; 709 `qc-…`, Papers `pp-…`, 448 unprefixed), `term` (rich inline), `gloss` (ONE sentence <= 25 words), `formal` (one sentence <= 40, required in 709/Papers), `first` (unit or beat id of first
  use), `uses?` (gloss ids it leans on; all must exist), `symbols?` (TeX symbols a tag defines for the symbol lint), `bridge?`, `introduces?: 'space'|'notation'`. Files: `qc709/<ID>.glossary.ts`, `papers/<ID>.glossary.ts` (merged by file name into the lazy pack).
- Use `[[id|shown words]]`; the first technical term in a unit's prose carries its tag (gloss-at-first-use lint, per track). A 709 or Papers chapter may tag Spin Lab's glossary (`[[relative-phase]]`) and earlier chapters' `qc-` ids; reuse before inventing (`ids.json` -> `glossary`: id, course, first).
- `{{key|shown}}` is a stage TERM (the beat's `terms: {key: {kind, anchor}}`, anchors in `content/stageVocab.ts`), not a gloss; it cannot wrap TeX containing `|`.

## Notation beats (W-709 #12) and the notation cards

- A **notation beat**: a gloss entry with `introduces: 'notation'` (or `'space'`); exactly ONE beat of the owning chapter has `introduces: ['<gloss id>']`, at or before the entry's `first`, with `caption` and `captionFormal`. The beat shows a "New notation"
  eyebrow in both tracks and Read mode. `DERIV_VIEW_LEGACY` (content.test.tsx) is empty: new chapters are never added.
- **Notation cards** (click any notation in rendered maths -> a plain card; `docs/specs/notation-explainers.md`) are automatic from the TeX (`ui/notationMark.ts` recognises marks; dictionary `content/notation.entries.ts`, ids in `MARK_IDS`).
  A chapter writes nothing for them, but several whole-course tests pin which chapters use which notation: `notation.classes.test.ts` (e.g. only F7, Q16, Q18 use the bit dot product `·` and link `qc-bit-dot`; the set-size bars in Q18),
  `notation.taught.test.ts` (every "learn it" unit writes the symbol), `notation.numbers.test.ts` (no typed digit on a card), `notation.context.test.ts`. If your chapter uses a mark in a new way and one of these fails, extend the test's chapter
  list or add a dictionary entry (steps in the spec); do not weaken a check. New marks and cards are lazy chunks (rule (o)).
- **Rosetta lines**: when the book's symbol clashes with the course's (the books' eigenphase phi vs the course's angle phi), define the course symbol in the beat and add ONE short Formal-track line naming the book's (Q18 `q18-kickback:b1`). Name book variants on first use
  in the Ground-up track too ("Phi+ (N&C: beta00)", "T (N&C: pi/8 gate)").
- Symbol lint: `Lecture.symbols` maps each TeX symbol to the first unit/beat that defines it (either track), `symbolsFormal` overrides for Formal only; kets need the ket notation AND a named ket; avoid `\leftrightarrow` and `\mathbb`.
