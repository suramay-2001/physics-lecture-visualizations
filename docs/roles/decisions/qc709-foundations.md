# Ruling: build the Foundations chapters standalone (2026-10-03, reverses the fold)

The user: "build the fundamentals along with the rest of the chapters." This SUPERSEDES ruling 3 of
`qc709-remap.md` (the fold of F2/F3/F4/F6). With a fresh weekly window, the Foundations Part is built as standalone
chapters, as the original semester map intended.

**The Foundations sequence (math backbone; each ground-up, two tracks, reached by bridges):**
- **F1** Numbers that turn — complex numbers, e^{iφ}. **Built.**
- **F2** Vectors and inner products — the complex vector space ℂⁿ, ⟨·|·⟩, norm, orthonormality, Gram–Schmidt. (Axler 1, 3, 6)
- **F3** Matrices and linear maps — a linear map as a matrix, products, the adjoint, change of basis. (Axler 3, 5)
- **F4** Eigenvalues, Hermitian and unitary operators, the spectral theorem. (Axler 5–7)
- **F5** Probability, expectation and variance — the trimmed probability chapter.
- **F6** Tensor (Kronecker) products — the joint space, ⊗ on vectors and operators. (Axler 9D)

**Numbering:** F1–F6 in reading order. This supersedes the remap's renumber-to-F2/F3/F4 (ruling 4), which assumed the
fold. Old F7 (bits/Boolean) and F8 (Fourier) serve Parts VII+ (algorithms), beyond Part V, so they are DEFERRED.

**Ownership and the already-built Q chapters:**
- The Q chapters (Q2–Q9) keep the inline Ground-up teaching they already have; 709 chapters stand alone by design.
- Each F chapter is the canonical owner of its math. The Q chapters gain a one-line BRIDGE back to the owning F unit
  (`<<f{n}-…|…>>`), added by a small wiring pass after the F chapters merge — they are NOT re-cut.
- A notation/space introduced by an F chapter sets `introduces` there; a Q chapter that also shows it keeps its beat but
  is not the owner. The `introduces`-exactly-once lint is per chapter, so this is fine.

**Standing rules apply:** W-709 #7 (every derivation ≥ 2 views), #8 (notation beats), no raw TeX, engine-backed numbers
with numpy twins. No chapter is on a legacy allowlist.

**Build order:** plan F2+F3 and F4+F5 and F6 (Opus) → rule → build (Sonnet) → merge → review → fix, interleaved with the
remaining Q chapters, paced under the weekly cap (aim 82%, stop by 85%).
