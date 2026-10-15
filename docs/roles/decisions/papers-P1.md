# Rulings: Papers P1 — the *Tour de gross* lecture (judge, 2026-10-14)

Plan: `docs/roles/proposals/P-P1-story.md` (nine units, 48 beats; 111 computed claim keys incl. 18 computed from
printed inputs, 38 reported ids; numpy `planP1-numpy.py`, 158 checks, 0 failed). Scope: `papers-tdg-scope.md` S3–S6.

- R1 **Units and length** approved as planned (418 lines accepted). P1 is built AFTER B1–B4 merge, so every bridge to a
  background unit resolves; the build verifies each target id.
- R2 **Corrections E1–E5** (logical shift block Aᵀ; 6 × 18.1 = 108.6 vs 73; 245 vs 510 rotations; 4801 vs 4817 qubits;
  the surface thresholds' T count) go in as Correction boxes in place, worded "our calculation finds …", each with an
  engine `check()`; the independent review re-verifies every one against the page image and cuts any it cannot confirm.
  **E6** (the d = 5 row of Fig. 10a needs n = 50) is treated the same way. Tone: a preprint's slips, stated plainly and
  respectfully; the References-used page lists every check we made ("What we checked"), held and cut alike.
- R3 **O4** (Table 2's rates not divided by C) is a units note in `tdg-benchmark`, NOT a Correction — unless the paper's
  own text states the per-cycle normalization and the table contradicts it; the build quotes neither, it paraphrases
  which reading the numbers support.
- R4 **Corrections in data form.** A spec stays data only: a correction is `{ claim: '<key>', printed, location }`; the
  check itself lives in the paper's claims module (code) and is referenced by key. The validator rejects a correction
  whose key has no check.
- R5 **Reported values from a reference** (e.g. Lit19b's Table 1) are `reported` claims whose source is that reference's
  key and location, never the paper's.
- R6 **Fig. 9's 4¹¹ search stays offline**: a deterministic pipeline script with a fixture; the app shows its results as
  "computed offline (script cited)", and a vitest re-checks the fixture on a cheap invariant and a seeded sample. The
  same rule covers any computation too large to run at page load.
- R7 **`module-map`** kind as specified (built inside the P1 build). The `machine-dial` Try-it widget is approved if it
  draws only engine numbers and reported badges, is lazy, and passes the props gate.
- R8 Recipes: the 14 new `tdg-*` recipes are registered in the P1 build with typed params and tests; the 8 recipes from
  B1/B2/B4 come from those builds.
- R9 **E7 ratified (judge, 2026-10-15).** The two-gross cultivation factory error is printed as 2×10⁻⁸ in Table 3 and on p. 30 (10^−7.7 in Table 2) while Table 5 — whose caption says Table 3 takes its value from it — lists 2×10⁻⁹, as does the source (GSJ24 Fig. 2). It goes in as a table comparison, not a calculation, worded as a possible inconsistency that leaves the TFIM estimate unchanged (it omits factory error). Verified against pp. 7, 14, 30, 57 by the independent check (`audits/P-P1-corrections-review.md`).
