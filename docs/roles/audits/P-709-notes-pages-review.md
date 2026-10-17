# P review: 709 Lecture notes pages N1-N11 (`app/src/content/qc709/notes/N*.ts`), 2026-10-18

Reviewer P, read-only, lean pass (no Playwright, no screenshots, no suites). Sources opened: `sources/qc709-n1` to `n11` (`text.md`, equation and page markers for every page). Plan §4.2/§6, rulings W1-W12/P10/P12 and the relay note read first.
Method: every number cited on N8-N11 (about 70 keys) and N1-N7 (12 keys) recomputed with my own numpy/scipy (`scratchpad/rvn/recompute.py`, no repo engine): 0 mismatches. Sentence lengths and paragraph windows checked by script (max sentence 40 words at `N9.ts:146`, none over; windows N8 ~1,115, N9 ~942, N10 ~1,421, N11 ~1,031 prose words; N1-N7 172-225). Source overlap measured as shared alphabetic-word runs after dropping TeX.

## Verdicts
| Page | Verdict | Why |
|---|---|---|
| N1 | PASS | nits only |
| N2, N3 | PASS | no findings |
| N4 | PASS | one nit |
| N5 | FIX-FIRST | B3 (one clause, `N5.ts:75`) |
| N6 | FIX-FIRST | B2 (false statement about GHZ products) |
| N7 | PASS with fixes | one equation cite (nit) |
| N8 | FIX-FIRST | B3 (3 sentences), S1, S2 |
| N9 | FIX-FIRST | B3 (3 places), S3; closest paraphrase of any page |
| N10 | FIX-FIRST | B1 (false "only"), B3 (1 sentence), S4-S8 |
| N11 | FIX-FIRST | B3 (5 places), S9-S12 |
Counts: Blocking 3 items (B1, B2, B3 with 12 locators), Should-fix 14, Nits 15. Physics and numbers are sound; the blockers are two wrong sentences and near-verbatim copying.

## Blocking
| ID | file:line | Problem | Exact fix |
|---|---|---|---|
| B1 | `N10.ts:307` | "Only the coherence figure and the entropy test are sufficient but not necessary" is false: CHSH is sufficient-only too, and the next paragraph proves it (entangled for 1/2 < α <= 0.7071, no CHSH violation). "Order of strength" reads as general, but F_coh is blind to Φ+ which PPT catches. | Replace both sentences with: "On this family the coherence figure, the partial transpose and the concurrence switch on at one half, CHSH at 1/√2 and the conditional entropy at 0.773. The coherence figure, CHSH and the conditional entropy are sufficient but not necessary tests; only the partial transpose and the concurrence are exact for two qubits." |
| B2 | `N6.ts:70` | "Measured in the x or y basis, every single outcome is random, but the product of the three is fixed" is false for an odd number of y (YYY, XXY): product random, all eight strings 0.125, contradicting `N6.ts:84`. The notes hedge ("for the combinations below", p. 31). | "...every single outcome is random; for XXX, and for the three settings with exactly two y's, the product of the three is fixed, while with one or three y's it is random too." |
| B3 | see below | Near-verbatim runs (7+ shared words, trivial inserts such as "complex", "although"): the verbatim guard (one 8-gram allowed, TeX ignored) passes them. Rewrite each sentence from its idea, not from the source order. | Locators (source words, <= 6): `N5.ts:75` "Probabilities must still sum to one"; `N8.ts:189` "Hermitian, positive and of unit trace"; `N8.ts:196` "acts on: the labels of"; `N8.ts:212` "pair is in a definite"; `N9.ts:100` "out of his work on"; `N9.ts:118` "pure state has rank"; `N10.ts:211` "conjugation is essential and easy"; `N11.ts:66` "Locality is built into"; `N11.ts:128` "let each side choose between"; `N11.ts:131` "one bracket vanishes and the other"; `N11.ts:164` "quantum correlations are stronger than"; `N11.ts:179` "non-local without being". |
Suggested B3 rewrites: N8:196 "U relabels the entries of the two lists; the qubit itself is untouched, although the matrix equals the Hadamard gate." N11:66 "In this notation A cannot see b and B cannot see a, which is exactly what locality means." N11:164 "Whatever a local hidden label can generate, the quantum correlations exceed it."

## Should-fix
| ID | file:line | Problem | Fix |
|---|---|---|---|
| S1 | `N8.ts:117` | "where the arrows were used before" is false for the new edition (no arrows in pp. 38-43; |0>,|1> since p. 23). k_B, T undefined; ħ and H undefined at `N8.ts:102`. | "The notes write |0> for |+z> since p. 23"; add "temperature T, Boltzmann constant k_B"; "Hamiltonian H". |
| S2 | `N8.ts:189,196` | Omits what the notes teach on p. 40-41: the |u±> ensemble IS the canonical one (eigenvectors of ρ), and they are the Hadamard eigenvectors, "not a coincidence" why U = H. | One sentence each. |
| S3 | `N9.ts:146` | "both are fixed by the eigenvalues and eigenvectors of ρ_A" overclaims for a repeated eigenvalue (ρ_A = I/2); P7 caveat missing. | Add "choosing the same eigenbasis if an eigenvalue repeats". |
| S4 | `N10.ts:147` | "each criterion below decides whether a state falls inside or outside" overclaims (F_coh, S(A\|B) answer only "outside"; the notes say "asking which side"). | "asks which side; the sufficient tests can answer only 'outside'". |
| S5 | `N10.ts:165,255-268` | F_coh = 0.32 "for an unequal superposition" and 0.8113 bit for "a pure pair" name no state (0.6/0.8 and weights 1/4, 3/4); "F_coh <= 1/2 proves nothing" never stated. | Name the states (keys exist: q12ProdAAmp0); add the sentence. |
| S6 | `N10.ts:211` | P10/§5: C = 2\|det Λ\| must be derived in full; page stops at "Expanding in components gives". | Add <ψ\|ψ~> = -2(Λ00Λ11 - Λ01Λ10)* (I re-derived it; σy⊗σy maps 00→-11, 01→10, 10→01, 11→-00). |
| S7 | `N10.ts:285` | One 82-word paragraph carries 12 numbers; P12 asked for an α-family table. The kit has no table and the amendment is not in the rulings. | Record the amendment; split into "tests at 0.6" and "entropy at 0.75, 0.8, singlet". |
| S8 | `N10.ts:307` | CHSH tensor diag(-α,-α,1-2α), "best score 2√2α" and 1/√2 are not in the notes (section is labelled p. 55) and T is undefined. | Say "beyond the notes (Horodecki criterion, Unit 12.7)"; define T as the matrix of <σi⊗σj>. |
| S9 | `N11.ts:63,75,115,125` | "hidden-label theory" without "local" in two summaries and the conclusion "cannot reproduce" (the notes: "Every local hidden-variable theory", p. 57). | Insert "local" at each; add that non-local hidden variables are not excluded. |
| S10 | `N11.ts:86` | The step ∫p[1-A(b)A(c)] = 1 + P(b,c) is never shown; "the bracket equals twice the chance" is about its average. | Add the identity via Eq. 3.39; "its average equals twice...". |
| S11 | `N11.ts:179` | Non sequitur: same ρ_B for singlet and coin pair is not the reason nothing can be sent. | "ρ_B = I/2 whatever A measures, because tracing out A removes A's choice." |
| S12 | `N11.ts:99` | "standard test because every correlation is easy to evaluate": unsupported. | "chosen because a ⊥ b with c between them gives the largest gap". |
| S13 | paragraphs | Sentence-by-sentence tracking with light rewording (locator = shared run): N8:99,102,114,193,209,224; N9:84,100,112,115,118,146; N10:128,140,147,268; N11:63,78,86,99,134,160. | Re-order and restate (e.g. start from the consequence, not the notes' sequence). |
| S14 | N2-N7 | No figure on N2-N7; plan §6.1 lists 2-3 each; omission not recorded. | Record in BUILD-LOG or add one static figure per page. |

## Nits
- `N10.ts:241` "determinant has size 0.0045": it is -0.0045 (negative), say so. `N10.ts:211` "Chapter Q12 calls it the coefficient matrix" is circular. `N10.ts:255` label §III.C also covers C.1.
- `N8.ts:99` "as soon as we measure in another basis": "a suitable basis". `N8.ts:224` caption compares with a singlet not drawn there.
- `N7.ts:61` Eq. 2.13 is the triple product = -O_XXX, not σyσxσy = -σx. `N5.ts:87` "perfectly correlated" is anti-correlated for y = 1 (the notes' wording): "each result fixes the other". `N5.ts:51` "the fraction" = ratio of parameter counts.
- `N4.ts:82` name the pair (S_x, S_y). `N1.ts:92` "positive matrix": "Hermitian matrix with positive eigenvalues" (p. 7). `N1.values.ts` n1UpAfterX duplicates q1SupZ (documented exception, W12).
- `N11.ts:99-100` figure caption names no a, b, c. `N11.ts:164` "no influence slower than light": "none at or below light speed". `N11.ts:10` add Rosetta |S> = (|+-> - |-+>)/√2 (p. 56 notation). `N10.ts:211` Wootters cited with volume and page (fine, the notes do).

## Checked and right
All cited numbers; every typed minus sentence (N10: -0.1, -0.3, -0.8113, -0.0781, -1, -1 bit; N11: -1, -2√2 ≈ -2.83) is correct and unambiguous (`d()` prints signed values; sizes carry a typed "-"). Physics: Eq. 3.7 identity, F_coh <= 1/2 for products and mixtures, C = max{0, 2α-1}, PPT spectrum α/2, α/2, 1/2, 1/2-α, det α²(1-2α)/16, S(A|B) zero at 0.7729, CHSH threshold 1/√2, E_f(0.8) = 0.469, R = √(√ρ ρ~ √ρ), Bell 8 triples (max excess 0), S = -2√2 at 0, π/2, π/4, -π/4, CHSH operator spectrum ±2√2, ratio 2.414. Links: all 92 notes-to-chapter links carry the right typed "Unit k.j" (checked against chapter unit order) and land on the teaching unit. Rosetta lines present: n/r, A/B, |0>/|1>, P as correlation, p vs ρ, S, σ, Λ, F_coh, α twice, |S>. Aspect and Weihs cited by name, journal, year only. Nothing taught in L8-L11 is missing except S2.

## Citation sample (36 checked against `text.md` page markers; printed page = PDF page)
N8: §II.H p. 38; ρ_ij and trace rule p. 38; vN eq. p. 38; tanh p. 39; |0>,|+x> example p. 39; Eq. 2.14, 2.15, 2.16 p. 39; 2.17-2.18, 2.19-2.20, 2.21 p. 40; 2.22 and U = H p. 41; §II.I.2 p. 42; Eq. 2.23 p. 43.
N9: Eq. 2.24-2.26 p. 44; 2.27-2.28 p. 45; 2.29-2.30 p. 45; 2.31-2.33 p. 46; Gram-Schmidt aside pp. 44-45.
N10: Eq. 3.1-3.3 p. 47; extremal points p. 48; 3.4-3.6 p. 48; 3.7-3.11 p. 49; 3.12 p. 49, 3.13-3.15 p. 50; 3.16-3.17 pp. 50-51; 3.18-3.21 p. 51; 3.22-3.27 p. 52; det σ p. 53; 3.28-3.30 p. 53; 3.31-3.34 p. 54; 3.35-3.36 p. 55.
N11: Eq. 3.37-3.39 p. 56; 3.40-3.42 p. 57; 3.43-3.44 p. 57; 3.45-3.46 p. 57; 3.47 p. 58.
N1-N7: Eq. 1.1-1.2 p. 9, 1.3 p. 11, 1.4-1.5 p. 14, 1.6 p. 15, 1.7-1.8 p. 16, 1.9 p. 20, 1.10 p. 21, 2.1 p. 25, 2.2 p. 26, 2.3-2.4 p. 27, 2.5-2.6 p. 29, 2.7-2.8 p. 30, 2.9-2.10 p. 32, 2.11-2.12 p. 35, 2.13 p. 36: all correct. Section page ranges on all 11 pages match.
