# 2026-10-18: fix pass for the 709 Lecture notes pages (N1 to N11)

Applied every item of `docs/roles/audits/P-709-notes-pages-review.md` under rulings R1-R4 (table "R fixes" in that file). Content, one new test and regenerated meta only.

- Copyright (R2): all B3 locators and the S13 paragraphs were restated from the idea. New `app/src/content/qc709/notes/notes.overlap.test.ts` fails on any 7-word run shared with `sources/qc709-n*/text.md` after dropping TeX and markup; it skips when `sources/` is absent and prints each page's longest run (now 4 to 6 words). A future notes page must pass it: write the paragraph from the idea, not beside the source page.
- Physics (R1): CHSH is sufficient-only too (N10); the GHZ product is fixed only for XXX and two-y settings (N6).
- N10 gained two beats: the C = 2|det| derivation (concurrence:b3) and the split family comparison (compare:b1 to b4); `meta.generated.ts` regenerated twice. `e2e/notes.spec.ts` is unchanged (section ids and figure counts are the same).
- Disagreed with S12: "largest gap" for the right-angle triple is false (60 degrees gives more); the text only says the notes pick that triple.
- Gotcha: a symbol such as `\Lambda_{00}`, `\sigma_i` or `\langle\cdot\rangle` first used in a new beat needs its entry in the page's `symbols` map at that beat; an unglossed technical term such as "orthogonal" fails the gloss lint when it is first used in a rewritten paragraph.
