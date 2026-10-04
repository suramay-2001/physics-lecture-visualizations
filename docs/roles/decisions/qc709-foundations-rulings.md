# Rulings: 709 Foundations F2–F6 plans, 2026-10-04

Judge rulings on `P-F2-story.md` … `P-F6-story.md` §12. The Foundations Part is built standalone per
`qc709-foundations.md` (the user's 2026-10-03 instruction). Every §12 recommendation is ACCEPTED as written, with these
standing conditions for all five chapters.

**Ownership and scope:**
- F2 (vectors, inner products, Gram–Schmidt), F3 (matrices, linear maps, adjoint, change of basis), F4 (eigen,
  Hermitian/unitary, spectral theorem), F5 (probability, expectation, variance), F6 (tensor/Kronecker products) are the
  canonical OWNERS of their math. Each sets `introduces` on the space/notation it owns.
- Prerequisite chain: F1 → F2 → F3 → F4; F5 and F6 depend on F2/F3. Bridge to prerequisites; never re-teach them.
- The already-built Q chapters keep their inline Ground-up teaching; a later wiring pass adds Q→F bridges. Do not touch
  the Q chapters in the F builds.

**Standing rules (all five):**
- Two tracks; Ground-up ≤25 words/sentence from 9th-grade math, Formal ≤40; symbols before use in both.
- W-709 #7: every derivation ≥2 distinct views per track. W-709 #8: a notation beat per new space/notation.
- No raw TeX outside `$…$`. Every displayed number from an engine call (`cmat`, `info`, `state`, `density`) with an
  independent numpy twin; claim keys `f2.*`…`f6.*`.
- No new engine functions expected (the plans confirmed this); if a build finds a gap, it stops and reports.

**Build order:** F2+F3 first (F4 depends on them), then F4, then F5 and F6 (independent of each other). Two builders in
parallel is fine; three-plus caused machine overload earlier, so cap at ~2–3 concurrent heavy agents and keep long test
runs backgrounded.

**Phase:** F chapters use `'core'` ("The foundation"), never `'lecture'` (they are not from the 709 lecture notes);
`'books'` for an Axler/N&C citation with § and printed page.
