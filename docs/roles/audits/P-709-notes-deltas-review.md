# P-709 notes deltas: independent truth review (role P, 2026-10-18, lean pass)

Scope: Q8 `q8-recipes:b4-b5`, Q9 `q9-purification:b3-b4`, Q10 `q10-bell` + openers, Q12 `q12-coherence`, `q12-family` + openers, and the 384-row citation migration (diff base `1ce5361`). Q11 has no content change (not reviewed). Read-only; no Playwright, no screenshots, so bridge `ret` restore points are **not** checked.

**Evidence.** Own numpy (`recompute.py`, scratchpad, never the repo engine): all 50 new claim sentences recomputed and agree (Q8 5, Q9 5, Q10 11, Q12 29), plus the 17 new challenge answers. Re-derived by hand and numerically: F_coh <= 1/2 (20 000 random products, max 0.4999999), psi~ = (-L11*, L10*, L01*, -L00*) and <psi|psi~> = -2(L00 L11 - L01 L10)* and C = 2|det L| against Wootters (500 random states, 0 mismatches), the family spectra/PT/C/S(A|B)/E_f/Horodecki values at alpha = 0.2, 1/3, 0.6, 0.75, 0.8, 1 (F, PT-negativity, C agree on the whole range). Scripted lints on the 19 new/edited beats and the unit-level strings: sentence caps (Ground <= 25, Formal <= 40) 0 over; `$` balance 3 odd (below); glossary `first` = earliest use 0 mismatches; 0 duplicate qc709 glossary ids/terms; unit-number references (Unit 12.x, 8.x, 9.x) all point at the right unit; derivation step counts Ground >= Formal, >= 2 views per track.

## Verdicts
| Chapter | Verdict | Blocking | Should-fix | Nits |
|---|---|---|---|---|
| Q8 | **PASS** | 0 | 0 | 2 |
| Q9 | **PASS** | 0 | 0 | 2 |
| Q10 | **PASS with fixes** | 0 | 8 | 4 |
| Q11 | n/a (unchanged) | 0 | 0 | 0 |
| Q12 | **FIX-FIRST** | 2 | 7 | 6 |
| Citation migration | **PASS** (1 nit) | 0 | 0 | 1 |

## Blocking (Q12; both are false statements)
| # | file:line | Problem | Exact fix |
|---|---|---|---|
| B1 | `Q12.story.ts:780` (q12-family:b3 Formal) | "$R = \sqrt\rho\,\tilde\rho\,\sqrt\rho = \rho$" is false: with $\tilde\rho = \rho$ that matrix is $\rho^2$. The notes' $R$ (Eq. 3.19) is the square root of it. It also contradicts the chapter's own definition (square roots of the eigenvalues of $\rho\tilde\rho$, `q12-concurrence:b6`). | Write "$R = \sqrt{\sqrt\rho\,\tilde\rho\,\sqrt\rho} = \sqrt{\rho^2} = \rho$". |
| B2 | `Q12.story.ts:841`; `Q12.ts:580`; `Q12.review.ts:33,36,44` | The unit ranks CHSH wrongly and overstates "sufficient only". CHSH starts at alpha = 0.7071, which is **below** the entropy test's 0.7729, so "Bell's test is weaker still" (after "entropy is the weakest") and "the CHSH test is weaker than all four" are false; CHSH beats the entropy test. "Each criterion is sufficient only" and the Formal trap "a failed test is silent" are false for the flipped matrix and the concurrence, which are exact for two qubits (the unit's own b5 says the three tests are equivalent here). | b6 text: "Bell's test is weaker than the first three, though it beats the entropy test." Pitfall/trap: "each of the coherence figure and the entropy test is sufficient only; on two qubits the flipped matrix and the concurrence are exact, and CHSH sits between (0.7071)." Review point 4: "CHSH needs more than 0.7071: weaker than the first three, stronger than the entropy test." Formal trap: "Treating a failed coherence or entropy test as proof of separability; only PPT and C are exact, and only for two qubits." |

## Should-fix
| # | file:line | Problem | Exact fix |
|---|---|---|---|
| S1 | `Q10.story.ts:418` (b2 Formal), `:428` (b3 Formal), `Q10.review.ts:81` | The premise that makes the integral `-int p A(a)A(b)` is left out of the Formal: perfect anticorrelation B(a,l) = -A(a,l) (notes Eq. 3.38, p. 56). b3 then says "for every local hidden-variable model", which is false without it (CHSH exists to drop it; notes p. 57). The review trap says "needs only locality and the fixed answers", contradicting challenge `q10-bl-which` (which lists anticorrelation). | b2 Formal add "...and, because the singlet is perfectly anticorrelated at equal settings, $B(\mathbf a,\lambda) = -A(\mathbf a,\lambda)$ (Eq. 3.38)". b3 Formal: "For every local hidden-variable model with that anticorrelation...". b4 Formal add: "Chapter's next unit (CHSH) drops the anticorrelation and the third direction." Trap: "...it needs locality, the fixed $\pm1$ answers and the anticorrelation." |
| S2 | `Q10.story.ts:407` (b1 Ground), `:417` (b2 Ground) | Ground uses $\mathbf a,\mathbf b$ and, in the b3 derivation, $p(\lambda)$ and $\int d\lambda$ without defining them (the b2 Ground text never names $p(\lambda)$). | b1: "...each point an analyser: $\mathbf a$ for Alice, $\mathbf b$ for Bob." b2 add: "Each label $\lambda$ has a chance $p(\lambda)$; averages over labels are written $\int p(\lambda)\cdots d\lambda$ (a sum over the 8 rows here)." |
| S3 | `Q10.story.ts:429-466` (b3 derivation) | Views do not show their steps: Ground step 3 ("bracket is 0 or 2") and Formal step 2 ("bracket >= 0") show the two-qubit singlet; only `bits{rows}` can show rows and it has no bracket column. | Use `bits{rows}` for step 3 / Formal step 2 with `viewCaption` "a row where the bracket is 0 / 2: rows 000-111", or drop those two `view`s (two distinct views per track remain). |
| S4 | `Q10.story.ts:455,460,463` | Equation cites shifted by one: insertion of $A(b)^2=1$ gives Eq. 3.41 (3.40 is the plain difference); the bracket bound is 3.41-3.42. | Step 1 "(Eq. 3.40-3.41)", step 2 "(Eqs. 3.41-3.42)", step 3 "(Eq. 3.42)". |
| S5 | `Q10.story.ts:144` (separable:b1 Formal), `Q10.values.ts` `q10SepConvexGap` | Convexity is argued from "the partial transpose is linear": a non sequitur (convexity follows from the definition: weights $\theta p_n$, $(1-\theta)p'_m$ add to 1), and the partial transpose is not taught until Q12 here. The claim then checks only linearity of T, nothing about separability. | Replace with "Mixing two mixtures of products, with weights $\theta p_n$ and $(1-\theta)p'_m$, is again a mixture of products, so the set is convex (Eq. 3.3)". Change the claim to a separability fact (e.g. the mixture of $\lvert00\rangle$ and $\lvert{+}{+}\rangle$ has $\rho^{T_B}\ge0$) or drop `cSepConvexGap`. Also name the pair $\alpha=0.6,\beta=0.8$ in b1 (the "0.48" is otherwise unattached). |
| S6 | `Q10.story.ts:615` (violation:b5 Formal), `Q10.ts:19-25` | "Rosetta: the singlet's score is $-2\sqrt2$" contradicts the same beat's N&C singlet at $+2\sqrt2$ (settings decide the sign). The chapter outcomes still read "the Bell inequality that bounds any classical story" (CHSH) while `qc-bell-inequality` now names the three-direction form (3.42). | Rosetta: "at the notes' settings the singlet scores $-2\sqrt2$; at N&C's, $+2\sqrt2$". Outcome 4: "...the CHSH inequality that bounds any classical story"; add an outcome "Derive Bell's three-direction inequality and show the singlet breaks it". |
| S7 | `Q10.ts:304` (q10-bell Try-it) | Widget starts at theta = 90 so "Tilt the arrow to the equator" is a no-op, and a one-qubit Bloch arrow is not the singlet. | "Drag the arrow off the equator and measure z: the chance of 0 leaves one half. The singlet's correlation is 0 at right angles because..." or point the widget at a two-qubit `sg-lab`. |
| S8 | `Q10.story.ts:407` | Claim `cBellLhs` is attached to b1, which prints no Bell left side (only 0.707 at 45 degrees). | Remove from b1 `claims`. |
| S9 | `Q12.story.ts:149` (coherence:b2 Ground step 2 `why`) | "the other four terms add to at most 2": there are two other terms ($2|a_0||b_1|$, $2|a_1||b_0|$). | "...so the other two terms add to at most 2." |
| S10 | `Q12.story.ts:137` (caption ends "...scores 0.32$"), `:763` (family:b2 Formal ends "...smallest is $-0.3."), `Q12.ts:579` (family `insightFormal` ends "0.7729$.") | Unbalanced `$`: a raw dollar sign shows in the page. | Delete the stray `$` at :137 and Q12.ts:579; add the closing `$` before the final "." at :763. |
| S11 | `Q12.story.ts:620-658` (concurrence:b2) | The derivation (Ground steps 4-5, Formal step 3) uses $\tilde\rho$, $\sqrt\rho$ and $\lambda_1$ (the Wootters matrix), defined only later in b6 (books). With the pure-state C defined as $|\langle\psi|\tilde\psi\rangle|$ in b1, steps 1-3 already prove the result. It is also cited "(notes Eq. 3.18)", but the notes leave this calculation to Homework 3. | Add one sentence to b2 Ground/Formal: "Wootters' general recipe (Unit 12.6) gives the same number: for a pure state ... " defining $R$ and $\lambda_1$ first, or move steps 4-5 to b6; cite "Eq. 3.18 states the result; the calculation is ours (the notes assign it to Homework 3)". |
| S12 | `Q12.story.ts:133`, `:504`, `:620` | States not named where the number is printed: "a tilted product scores 0.32" (b2), "our tilted pair $-0.811$" (entropy:b1), "the pair on stage ... 0.96" (concurrence:b2). | Name them: $|0\rangle\otimes(0.6|0\rangle+0.8|1\rangle)$; $\cos30^\circ|00\rangle+\sin30^\circ|11\rangle$; $\Lambda=\mathrm{diag}(0.6,0.8)$. |
| S13 | `Q12.story.ts:186-200`, `:824-856` | Our own examples are not marked as ours: the $\Phi^+$ blind spot, the $E_F$ reveal, the CHSH-window (family:b6, `deeper`). Notes say only "necessary, not sufficient". | Add "(our example; the notes do not work it)" in the reveal/b6 Formal. |
| S14 | `Q12.ts:195`, `:576` (Try-its of coherence and family) | Both reuse the concurrence unit's one-qubit "maximal pair, C = 1" line; the widget has no F_coh, alpha or C. | Replace with a line that uses the widget: "Set the polar angle to 90 degrees: equal bars. A two-qubit pair with equal Schmidt weights is where $C=1$." |
| S15 | `Q12.ts:20-27` (outcomes) | Not updated: nothing on the coherence figure, the conditional entropy or the family although the first unit is new. | Add: "Compute $F_{\text{coh}}$ and say why $F_{\text{coh}}>\tfrac12$ proves entanglement but $\le\tfrac12$ proves nothing." and "Compare four tests on the alpha-family." |

## Nits
| # | file:line | Note |
|---|---|---|
| N1 | `Q8.story.ts:~860` (b5 Formal) | "Pure states are thus exactly the extreme points": the derivation proves only pure => extremal; add "a mixed state is a mixture of its eigenstates, so it is not extremal". |
| N2 | `Q8.story.ts:~858` (b5 Ground) | "A point with only one recipe is an extremal point" blurs recipes (pure members) and mixtures of states; fine, but say "no chord passes through it". |
| N3 | `Q9.story.ts:~748` (b4 Formal) | Caveat is correct and labelled "in our words". Add "on the same $\mathcal H_B$" and "the unitary relation holds even then; only the Schmidt form needs one A-basis". |
| N4 | `Q9.story.ts:~700` (b3) | "Unit 8.4's mixture" claim sentence is fine; Ground and Formal both say "tags/partner": use one word. |
| N5 | `Q10.story.ts:407-408` | "each point an analyser" -> "each pointing an analyser"; Formal "led EPR to a label": the hidden-label proposal followed EPR (notes p. 56). |
| N6 | `Q10.story.ts:~616` (b5 Ground) | "Their four correlators add up to S": the fourth is subtracted. |
| N7 | `Q10.story.ts:143` | Cite "(Eq. 3.3)" for the separable set's convexity; the sentence itself is on p. 48 (no number). |
| N8 | `Q10.glossary.ts` (qc-epr-paradox) | "(notes eq. 3.37)": the EPR argument is the p. 56 prose; 3.37 is the A, B functions. |
| N9 | `Q12.story.ts:779` (family:b3) | "The two largest tie at 1/3": three eigenvalues tie (view caption says three); claim sentence `q12FamLamTie` is true but weaker. |
| N10 | `Q12.story.ts:842` (family:b6 Formal) | "The Horodecki maximum is $2\sqrt2\alpha$" holds for alpha >= 1/3 only (for alpha = 0.2 it is 1.265); the threshold 1/sqrt2 is unaffected. Add "for $\alpha \ge \tfrac13$". |
| N11 | `Q12.story.ts:151`, `:140` | "A number that is at most 1 has a square at most 1" needs "non-negative"; step 1 `viewCaption` "two bars from A, two from B" is wrong (the bars are four basis states, two non-zero). |
| N12 | `Q12.story.ts:762` | "product of the four is 0.0045 in size": say "negative, of size 0.0045" (sign is in the Formal formula). Also `:603-607`: b1 and b3 define the tilde state twice. |
| N13 | `Q12.story.ts:608` (concurrence:b1 Formal) | "notes Eq. 3.16" is the Wootters max-formula; the pure-state overlap formula is on p. 50 text before it. |
| N14 | `Q1.ts:176` | The seven vector-space properties run over pp. 5-6 (two on p. 5, five on p. 6); cite "pp. 5-6". |
| N15 | challenges | Numeric new challenges re-ask the unit's printed worked example (0.32, 0.96, 0.2, 0.7729, 0.707, 0.293, -2.828); same as older Q12 units, so house style, not a defect. |

## The brief's specific questions
- **Negative sizes** (`q12FamSigMin06/08`, `q12FamDet06`, `q12FamSAB08`, `q10NotesS`): every sentence prints the minus by hand and says "size" where it prints only the magnitude; correct at 0.6 (lambda_min -0.1, det -0.0045), 0.8 (lambda_min -0.3, S(A|B) -0.0781), notes S = -2.8284. Only defects: the unclosed `$` (S10) and the unsaid sign of the determinant (N12).
- **`q12CondPure30` = -0.8113** is right for cos30|00> + sin30|11> (S(B) = h(0.25) = 0.8113, my numpy). The plan's -0.8813 = -h(0.3) belongs to a pair with cos^2 = 0.3 (about 33.2 degrees): a plan slip. The unit's beats call it "our tilted pair" (theta = 30 named in `q12-locc` and `q12-entropy:b2`), and Q9's "Psi_2 0.811" agrees; name theta in entropy:b1 (S12).
- **Framing**: F_coh necessary-not-sufficient, S(A|B) one-way, PPT exact only for 2x2 and 2x3, Bell vs CHSH assumptions (S1), no-signalling (`q10-no-signal:b1`), degenerate-basis caveat labelled "in our words": all correct except B2/S1/S13.
- **Derivations**: F_coh <= 1/2 (step 2 wording S9), Bell's inequality (steps true; views S3, cites S4), purification three checks (true, complete), pure-state C = 2|det L| (true and complete in all steps; Wootters symbols out of order S11), alpha-family C (true; B1 in Formal text), canonical/extremal proof (true).
- **Teaching order, bridges, glossary**: bridges `qc-q8-recipes`, `qc-l10-instructions`, `qc-q9-entropy`, `qc-q10-violation`, `qc-q8-ball`, `qc-q12-entropy` land on units that teach the idea; no duplicate glossary ids or terms in qc709; plan items all built (Q12 29 claims, 8 challenges; Q10 11/5; Q9 5/2; Q8 3/2).

## Citation sample (about 75 cites checked against `sources/qc709-n*/text.md`, 35 of them from old pp. 33-40; all correct except N14)
| New page | Cites checked (file:line) and what the page holds |
|---|---|
| p. 4-7 | Q1.story:5 (Lecture 1, 9/2, pp. 4-7); Q1.ts:176 (vector space: **pp. 5-6**, N14) |
| p. 8, 11 | Q2.story:62 (LI/LD definition); F3.story:552 (change of basis) |
| pp. 13-22 | Q3.ts:6 (Lectures 3-4, p. 13 "Lecture 3 on 9/14"); Q3.story:239 p. 14 (Bloch sphere), :301 p. 15 (projectors), :447 p. 17 (measurement), :494 p. 18 (Hermitian theorem), :604 p. 19 (eigenproblem), :732 pp. 20-21 ([A,B] proof); F4.story:297 p. 19 (real eigenvalues) |
| pp. 24-30 | Q6.story:221, :242 p. 24 (independent preparations); Q4.story:247 pp. 26-27 (rotations); Q6.story:597 p. 29 (Bell circuit backwards), :733 p. 30 (XX, ZZ commute) |
| p. 35 | Q7.story:535 (four observables commute, Eq. 2.11-2.12); Q7.ts:6, outline.ts:113 (L7 pp. 35-36) |
| p. 36 | Q7.story:678 (Mermin product), :795 (no statistics, unlike Bell); Q8.story:123 pp. 36-37 (GHZ, measure one qubit) |
| p. 37 | Q8.story:148, :168 (<XX> 0 vs +1), :181 (Tr rho^2 = 1/2), :220 (rho = projector), :259 (Tr rho = 1); Q8.values:41; Q9.story:244 |
| p. 38 | Q8.story:231 (rho_ij), :293 (coherences), :328 (Tr A rho), :357 (von Neumann), :448 (ensemble rho) |
| p. 39 | Q8.story:461 pp. 37, 39 (purity), :474 (Bloch ball, 2.14-2.16), :491 (3/4 1/4, Tr rho^2 = 3/4), :516, :532 (tanh), :548, :667 (|n| = 1 pure); Q8.values:73 |
| p. 40-41 | `q8-recipes:b4` Eq. 2.21 canonical form (p. 40), `:b5` p. 41 pure state has one recipe; Q8.ts:549 Eq. 2.22 |
| p. 42-43 | Q9.story:124, :172 p. 42 (rho_A, singlet); :324 p. 43 (classical copy, correlations); Q9.ts unit pages L8 pp. 42-43, Eq. 2.23 |
| pp. 44-46 | Q9.story:492 (2.24), :509 (2.25-2.26), :559 (2.28); :638 and `q9-purification:b3` (2.29-2.30, p. 45-46); `:b4` (2.31-2.33, p. 46) |
| p. 47 | Q8.story (convexity Eq. 3.3); `q10-separable:b1` Eqs. 3.1-3.3 |
| pp. 48-50 | `q12-coherence` b1-b3 Eqs. 3.4-3.11 (pp. 48-49); family b1 Eqs. 3.12-3.14, b2 Eq. 3.15 (p. 50); concurrence:b1 conjugation remark (p. 50) |
| pp. 51-53 | concurrence:b2 Eq. 3.18 (calculation is ours, S11); family:b3 Eqs. 3.19-3.21 (p. 51); ppt:b1 Eqs. 3.23-3.26 (p. 52); family:b2 Eq. 3.27 and det sigma (pp. 52-53); Q9.story:372 Eq. 3.28 (p. 53) |
| pp. 54-55 | entropy:b1 Eqs. 3.33-3.34 (p. 54); family:b4 Eq. 3.35 (p. 55) |
| pp. 55-58 | `q10-bell` pages "L10 p. 55; L11 pp. 56-57", b1 Eq. 3.36 (p. 55), b2 Eqs. 3.37-3.39 (p. 56), b3 Eqs. 3.40-3.42 (p. 57, S4), b4 Eqs. 3.43-3.44 (p. 57); no-signal:b1 p. 58; violation:b5 p. 58 (3.47 angles) |
