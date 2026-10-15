# P1 corrections review — independent verifier (P), 2026-10-15

Scope: the seven Correction boxes of the *Tour de gross* paper lecture (`app/src/content/papers/P1.paper.ts`, `corrections`;
checks in `app/src/papers/corrections.ts`), plus a spot check of reported values. Each box was compared with the page image
(`sources/paper-tdg/pages/pNN.png`). Its "our calculation finds" value was then recomputed with independent Python. That code
rebuilds the BB codes from Eqs. 27 and 32–36, applies the shifts and enumerates the native sets, and it does not use the repo's
engine. The paper is paraphrased here, never quoted.

## Verdicts

| Box | Claim key | Page check | Independent recomputation | Verdict |
|---|---|---|---|---|
| E1 | `p1AxLowerDiff` | p. 47 states M = A ⊗ A above Eq. 37. The Fig. 2 caption and the p. 5 text say each shift acts as U ⊗ U on qubits 1–6 and 7–12. | The upper block is A (it matches Eqs. 37/38 entry for entry) and the lower block is Aᵀ, with zero off-diagonal blocks. This holds for x and y on both codes. Gross A_x vs A_xᵀ: 16 entries differ (A_y: 18; two-gross A_x: 6, A_y: 14). The native sets themselves differ (only 208/540 shared on gross), but their sizes 540/245/510, the "every X_i, Z_i is native" result and the Fig. 9 β distribution from a BFS over 4¹¹ Paulis are identical under A ⊕ A and A ⊕ Aᵀ. | **CONFIRMED** |
| E2 | `p1Dist4g` | Table 3 (p. 14) prints τ̄ = 73 for the 10⁻⁴ gross factory, with d = 7, a′ = 13, f = 810 and P = 4 × 10⁻⁸. The text on p. 14 gives the rule (cycles × 6), names lines 1 and 5 of Lit19b's Table 1, and assigns two rounds to the former. | Lit19b Table 1 line 1, (15-to-1)₇,₃,₃, has 810 qubits, 18.1 cycles and 4.4 × 10⁻⁸, so 6 × 18.1 = 108.6. Line 5 is a two-round protocol with 18,600 qubits, 67.8 cycles and 6.3 × 10⁻²⁵, so 6 × 67.8 = 406.8, which rounds to the printed 407. Only line 5 is two-round. | **CONFIRMED-WITH-WORDING-FIX** |
| E3 | `p1NatRot` | §3.2, p. 24: 540 native measurements and 510 native rotations. Eq. 15 requires Q ⊗ R with Q ∈ {X, Y, Z}. Eq. 16 uses the pivot. | \|N\| = 540. 256 measurements carry X/Y/Z on the pivot and give 245 distinct non-identity R. 284 carry I on the pivot. Taking R over all 540 gives 510 (245 + 284 − 19 overlap). Both codes give the same numbers. | **CONFIRMED** |
| E4 | `p1Q4801` | Eq. 25 is on p. 28 and n = 11M. Table 1 (p. 6) gives gross c = 288, u = 90, a = 22, f = 810 and a′ = 13 at 10⁻⁴. Fig. 10b (p. 29) and p. 30 both print q = 4817. | 10·400 − 22 + 13 + 810 = 4801. With a′ = 29 the same sum is 4817. No integer M fits 4817 with a′ = 13. The two-gross figure, 10·768 − 34 + 29 + 463 = 8138, matches the print. | **CONFIRMED** |
| E5 | `p1ThT17` | A.10 (p. 68) prints 1.33 × 10⁻⁵ (d = 7), 5.48 × 10⁻⁵ (d = 9), 5.89 × 10⁻⁴ (d = 17) and 7.85 × 10⁻⁴ (d = 19). p. 30 states N_T = 1.9 × 10⁷, while Table 9 (p. 67) lists 1.5542 × 10⁷. Eq. 96 is on p. 67 and P₁ is on p. 65. | Eq. 96 with n = 100 and N_R = 184 000 reproduces the printed four exactly when N_T = 1.9 × 10⁷. With N_T = 1.5542 × 10⁷ it gives 1.35 × 10⁻⁵, 5.56 × 10⁻⁵, 5.94 × 10⁻⁴ and 7.90 × 10⁻⁴. | **CONFIRMED-WITH-WORDING-FIX** |
| E6 | `p1RowD5Nt` | Fig. 10a (p. 29), row (10⁻³, 5k, surface d = 5): n = 45, N_T = 7.0, 381 timesteps. Eq. 89 is on p. 66. | n = ⌊(5000 − 454)/100⌋ = 45 gives N_T = 7.81. n = ⌊5000/100⌋ = 50 gives 7.03. The other five surface rows reproduce from q − f (42, 21, 250, 27 and 416, with matching N_T), so this row alone is inconsistent. | **CONFIRMED** |
| E7 | `p1FactRatio` | Table 3 (p. 14) prints 2 × 10⁻⁸ for the 10⁻³ two-gross factory, and p. 30 repeats it. Table 2 (p. 7) prints 10⁻⁷·⁷ + P_C. Table 5 (p. 57), row d₁ = 5 (f = 463, τ̄ = 2167), lists P_e2e = 2 × 10⁻⁹, and its caption says Table 3 takes P_factory = P_e2e from it. | The ratio is 10. The source agrees with Table 5: GSJ24's Fig. 2 table lists 2 × 10⁻⁹ for d₁ = 5 at p = 10⁻³. Table 10 (p. 68) sets P_T = P_C, so the TFIM estimate does not use this value. | **CONFIRMED-WITH-WORDING-FIX** |

## Wording fixes

- **E2** (scope): add one sentence on what the box touches. Suggested: "Table 2's 73 + 120 and the 115-timestep surface
  d = 7 rows of Fig. 10a (73 + 6·7) carry the same 73."
- **E5** (units, and keeping `says` to what is printed): add the powers of ten to both lists of thresholds. The bare
  "1.33, 5.48, 5.89 and 7.85" and "1.35, 5.56, 5.94 and 7.90" read as plain numbers. Write them as 1.33 × 10⁻⁵, 5.48 × 10⁻⁵,
  5.89 × 10⁻⁴ and 7.85 × 10⁻⁴, and likewise for the second list. Reword `says` so it states only the print, because which count fed
  Eq. 96 is our inference. Suggested: "A.10 prints surface-code thresholds … from Eq. 96. The T count is given as 1.9 × 10⁷ in the
  text (p. 30) and as 1.5542 × 10⁷ in Table 9 (p. 67)."
- **E7** (four points):
  - Change "Our calculation finds" to "Comparing the tables, we find". No calculation is involved.
  - It is Table 5's caption that names Table 3 as reading from it, so write "Table 5 (p. 57), whose caption says Table 3
    takes its values from it, lists …".
  - Table 2 prints 10⁻⁷·⁷ (≈ 2 × 10⁻⁸), not "2 × 10⁻⁸".
  - Add: "Gidney et al.'s Fig. 2, the source of Table 5, also gives 2 × 10⁻⁹. The TFIM estimate does not use it (Table 10 sets
    P_T = P_C)."
- Optional, no verdict impact:
  - E1 could note that the transpose also holds for y and for the two-gross code.
  - E3 could note that Fig. 9's β = 1 bar (~245) shows the figure uses the 245.
  - E6 could add "only this row's T count moves".

## Process note

E7 has no ruling. `docs/roles/decisions/papers-P1.md` R2 covers E1–E5 and E6 only, so the judge should ratify E7 (with the
fixes above) before publication.

## Reported-value spot check (10 of 68)

Every value and every location is correct:

| Value | Location |
|---|---|
| `t3-g4` | Table 3, p. 14 |
| `t5-d5` | Table 5, p. 57 |
| `t2-t-2g3` | Table 2, p. 7 |
| `f10a-2` | Fig. 10a, p. 29 |
| `f9` (18.48 / 18.58) | Fig. 9, p. 25 |
| `f12` (1884, 19728, 336, 1728) | Fig. 12, p. 46 |
| `x-p17b` (336 vs 875 178) | §2.6, p. 17 |
| `t6-6` (743456) | Table 6, p. 61 |
| `t4-circ` (upper bounds 10, 10, 10; 18, 18, 17) | Table 4, p. 17 |
| `x-p32` (n = 72r(r+b), d = 6(2r+b−1)) | §5, p. 32 |

`t1-u`, `t1-f`, `x-p24`, `x-p30b`, `x-p30d`, `x-p68a/b`, `t9-g` and `t10-g4` were also seen on their pages while checking the
boxes, and all are correct.

Side observation, not a box: our BFS gives Fig. 9 right-panel means of 18.53 (gross) and 18.48 (two-gross). The paper prints
18.48 and 18.58, which is close but not equal. The lecture reports the printed values, which is correct.
