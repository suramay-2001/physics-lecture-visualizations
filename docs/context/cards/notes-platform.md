# Card: the 709 lecture notes platform

Design `docs/roles/proposals/W-709-notes.md`; rulings `docs/roles/decisions/qc709-notes.md` (W1 to W12). Routes: `#/709/notes` (index), `#/709/notes/N8` (page; `/709/notes/L8` redirects, `L<k>` is 448's). Topbar "Notes" on 709, a hero link on the 709 home. Code: `content/qc709/notes/` (`kit.ts`, `N<k>.ts`, `N<k>.values.ts`, `index.ts`, `values.ts`, generated `meta.generated.ts`), `content/unitNotes.ts`, `pages/NotesPages.tsx`, `components/UnitNotesLink.tsx`, `styles/notes709.css`.

**Model.** A notes lecture is a typed `NotesSpec` turned into an ordinary `Lecture` at module load by `notesLecture(spec)` (pure, no compiler chunk; throws `NotesSpecError` listing every `notesProblems`):
```ts
export const N8: Lecture = notesLecture({ number: 8, title, date: '2026-10-02', topics: [3 to 8 phrases], length: 'short' | 'full',
  symbols: { '\\psi': 'n8-bell:b1' },   // TeX symbol -> section id or generated beat id (1-based)
  sections: [{ id: 'n8-bell', label: '§C' /* no space */, title, pages: 'pp. 25–26' /* p. N | pp. N–M, first page never decreases */,
    summary: 'ONE plain sentence <= 40 words (no TeX, no tags)', body: [{ text, figure?: { stage, caption }, claims?: [claim(…)] }] }] })
```
Section = `Unit` (id `n8-slug`, title `§C Name`, `visual` = the Papers placeholder), paragraph = `Beat` (`phase: 'lecture'`, `text` only, id `n8-bell:b2`; a `caption` exactly when it has a figure). `N8` belongs to `qc709` by id (`courseOfId`, `isNotesId`, `chapterName` = "Lecture 8 notes") but is NOT in `QC_CHAPTERS` or the outline: lists never see it; `tracksOfChapter` = `['ground']`, `sentenceCapOf` = 40 (one voice, Formal register, symbols defined at first use). Window: short 150 to 300 words of prose outside `$…$`, full 900 to 1,500; a paragraph <= 120 words, 1 to 3 (short) or 2 to 12 (full) per section.

**Numbers (W3, W12).** Every decimal is a claim. A number a 709 CHAPTER owns is cited by the chapter's own key (`q8ThermR`: `import { V } from '../Q8.values'`, `claim = keyedClaim<…>()`, no copy, no second twin; the key must exist in the merged 709 values, `notes.test.ts`). Only a number no chapter owns gets an `n8…` key in `N8.values.ts` plus a numpy twin `pipeline/claims_notes/n8.py` -> `physics/__fixtures__/claims-notes/n8.json` (run twice, `cmp`). Per lecture, not per section: full >= 3 numbers shown, short >= 1 (`claims.test.ts`).

**Links.** Notes -> chapter: ordinary `<<qc-q6-bell-basis|Unit 6.2>>` (a row in `qc709/bridges.ts`; a row never used fails). W4: every section of every lecture links >= 1 built unit (`notes.test.ts`). Feeds are DERIVED from those bridges (`meta.test.ts` -> `NOTES_META[].units[].feeds`, reverse index `NOTES_BY_UNIT`); `qc709/registry.ts` registers the notes meta, the index and the generated bridges `qc-<section id>`, so each chapter unit shows "From the lecture notes" chips (`UnitNotesLink` in `ChapterCard`) with the usual return bar. `ret=qc709~N8~n8-bell:b2~0.4~formal` is valid once N8 is registered; the page restores the paragraph and its focus (`.notes-beat[data-beat]` in `BEAT_SELECTOR`).

**Figures.** One static state per figure (end of its hold, s = 1): `SvgStill` on screen for the SVG kinds, `FigureFor` for print and for the flat GL kinds (`bloch bloch-ball hilbert-plane operator-space lab-r3`); `hopf` is refused. No stage host, no canvas. Numbered `N8.1, N8.2`; the page's `data-figures` counts them. No new print button (W9).

**Chunks (rule r).** Nothing of `content/qc709/notes/` or `NotesPages.tsx` in the entry; each `N<k>.ts` + its values in one chunk; no chunk holds two notes lectures or another lecture's story, content or glossary module (a chapter's `*.values.ts` is allowed, W12); the listing rides in the 709 registry chunk; the page imports no lecture statically.

**Weekly checklist for a new lecture (W10; no other shared file changes).** (1) `qc709/notes/N<k>.ts` (+ `N<k>.values.ts` only for numbers no chapter owns); (2) its twin `pipeline/claims_notes/n<k>.py` (if any own key); (3) rows for new bridges in `qc709/bridges.ts`; (4) `UPDATE_META=1 npx vitest run src/content/meta.test.ts` TWICE (second run writes nothing); (5) `'#/709/notes/N<k>'` in `e2e/security.spec.ts` `ROUTES`; (6) one `BUILT` entry in `e2e/notes.spec.ts`. Plan `docs/roles/proposals/P-N<k>-story.md` (sections as units); `node pipeline/context/build_context.mjs N<k>`.

**Tests.** `notes/kit.test.ts` (each rule fails on a mutation), `notes/notes.test.ts` (per lecture), `unitNotes.test.ts`, `components/UnitNotesLink.test.tsx`, `pages/NotesPages.test.tsx`, `e2e/notes.spec.ts`; shared lints read notes as ordinary lectures (`content.test.tsx`, `symbols.test.ts`, `claims.test.ts`, `bridges.test.ts`, `verbatim.test.ts`).
