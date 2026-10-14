# Rulings: scope of the *Tour de gross* lecture and its background chapters (judge, 2026-10-14)

Inputs: the crawl in `docs/papers/tdg/` (digest, references, prerequisite graph, chapters, recipes, reported numbers,
downloads); `decisions/papers.md`; `decisions/qc709-Q21Q22.md`.

- S1 **709 prerequisites are Q21 and Q22** (the crawl's "Q19/Q20" requirement lists apply to them; CSS sits in Q22 per
  `qc709-Q21Q22.md` R2). Both are built before B1.
- S2 **Background chapters B1–B4 approved as scoped** in `chapters.md` (b): B1 the surface code as a memory, B2 quantum
  LDPC and bivariate bicycle codes, B3 measuring logical operators from lattice surgery to gauging, B4 magic states and
  Pauli-based computation; unit ids as proposed. They live in the Papers section and are written in the **same data-only
  paper-spec format** as the paper lecture (a `background` chapter kind), so a later smart tool can generate both.
- S3 **Paper lecture `P1`**: the nine units of `chapters.md` (c), each beat with R5 trail entries.
- S4 **Stage kinds.** The crawl's `code-lattice` IS the shared `code` kind now being built (torus, rotated surface and
  Tanner views); its extra overlays (`pattern`, `schedule`) are added to `code` when B1/B2 need them, not as a new kind.
  New kinds approved: `spacetime` (B1, B3), `surgery-graph` (B3, P1), `pauli-program` (B4, P1) — built together by one
  stage-kind agent before B1 is built — and `module-map` (P1 only), built inside the P1 build.
- S5 **Engine additions** are built inside the chapter that first needs them, with numpy twins: B1 a seeded space-time
  simulator for repetition and small surface codes with an exact small matching decoder, circuit fault counting; B2 the
  paper's parametrization and a presentation-isomorphism check, min-sum BP + OSD-0 on small codes; B3 merge/split on two
  distance-3 patches on the tableau simulator, a gauging builder and graph tools (cycle basis, Cheeger constant by brute
  force for V ≤ 16); B4 the Clifford orbit of T|+⟩, a symplectic Pauli-based-computation compiler, exact 15-to-1 output
  error by enumeration, the A.6 attempt arithmetic.
- S6 **Corrections candidates** from the recompute — 4817 vs 4801 qubits, the two T counts, the 73-timestep factory, the
  "510 native rotations" — and the QEC engine's finding that one block of the printed logical shift action is the
  transpose of what the engine computes: each becomes a Correction box in P1 ONLY after the P1 planner re-derives it
  against the page image, with an engine `check()` and "our calculation finds …" wording; the independent review
  re-verifies each; one that cannot be confirmed is cut.
- S7 **Downloads**: the 12 recommended and 6 optional PDFs in `downloads.md` go to the user for approval as one listed
  batch. Until approved, planners, builders and reviewers read references online only.
- S8 **Order and budget** (user cap 85 % before the Friday reset): now — the `code` kind (running), the B1+B2, B3+B4 and
  P1 plans; then Q21 ∥ Q22 builds once `code` merges; then the three shared kinds; then B1 → B2 → B3 → B4 → P1 builds,
  one review per pair, fixes. Builds and the B plans on Sonnet; the P1 plan and the reviews on Opus.
