# Rulings: the 709 "Lecture notes" section and the new notes edition (judge, 2026-10-17)

Owner's decisions (2026-10-17): a new in-site 709 "Lecture notes" section, one prose page per class lecture (L1–L7 short,
L8–L11 full), engine-backed numbers, links into the chapter units; HW3 submitted (`homework-status.md`); budget 20 weekly
points for the whole batch. Platform design: `docs/roles/proposals/W-709-notes.md` (adopted as written except where a
ruling below says otherwise). Content and chapter deltas: `docs/roles/proposals/P-709-remap-L8L11.md` (rulings P1–Pn below,
added when that plan is judged).

## Platform (W-709-notes §10)
- W1 **Ids and URLs.** Notes lectures are `N1`…`N11` (forced: `L<k>` is 448). Canonical `#/709/notes/N8`;
  `#/709/notes/L8` redirects. The title reads "Lecture 8 notes" so the owner's numbering stays visible.
- W2 **No fourth CourseId.** `N<k>` belongs to `qc709` by id, with the one-voice lint profile (`tracksOfChapter`,
  `sentenceCapOf` = 40).
- W3 **Number guard.** For notes the "at least one displayed number" guard is per lecture: a full lecture shows ≥ 3
  engine-backed numbers, a short one ≥ 1. The displayed-number ledger itself is unchanged (every decimal is a claim).
- W4 **Feeds** are derived from the prose bridges (one source of truth). Add the lint: every section of EVERY notes
  lecture links at least one built unit (short lectures too; they are companions to the chapters).
- W5 **Seed.** The platform builder writes `N1` as a minimal real seed (two sections, one figure, one claim, one bridge);
  the content builder replaces its prose.
- W6 **Chapter → notes link** is per unit ("From the lecture notes" chips). Per-beat links are out of scope.
- W7 **No notes glossary, Arcade, Map, Formulas or Help presence.** New concepts get their glossary entries in the chapter
  that owns them.
- W8 **Register.** One voice in the Formal register of the notes, sentences ≤ 40 words, every symbol defined at first use
  on the page, cohesive full-sentence paragraphs (no bullet chunks).
- W9 **Print.** No new print button. The page must print correctly through the browser (figures via `FigureFor`, running
  head as chapters do); one in-memory `page.pdf()` check in `notes.spec.ts`.
- W10 **Weekly additions.** The lecture checklist in the `notes-platform` card lists every shared edit (three files, one
  twin, `UPDATE_META=1` twice, one `ROUTES` line, one e2e count).
- W11 **Scope guard.** The platform builder edits no chapter content, no `physics/` and no `stage/` file except the two
  one-line items W-709-notes names (`StaticStory` export, `readingPosition` selector).
