# 2026-10-14 plans and rulings for Q21, Q22, B1-B4, P1

Plans `docs/roles/proposals/P-<ID>-story.md` and rulings in `docs/roles/decisions/` (`qc709-Q21Q22.md`, `papers-B1B2.md`, `papers-B3B4.md`, `papers-P1.md`, `papers.md`, `papers-tdg-scope.md`) are ready. Build order: Q21, Q22, B1, B2, then B3 and B4, then P1 (its bridges need the others). The B and P plans name recipes, stage kinds and fields that do not exist yet; `node pipeline/context/build_context.mjs <ids>` lists them (exit 1), and each is a platform task before the chapter build unless a ruling says the chapter's own build creates it.
Gotchas: Q21/Q22 ids follow `outline.ts` (the first draft said Q19/Q20); Bergou slips become Correction boxes worded "our calculation finds ...".
