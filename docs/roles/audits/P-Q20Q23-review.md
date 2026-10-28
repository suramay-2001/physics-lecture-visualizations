# P review: 709 Q20 (machines) and Q23 (information measures), both tracks, independent (skill 06, lean, no Playwright)

Reviewer [P]. Bergou read as PAGE IMAGES (my own 170-400 dpi renders of the PDF; offsets from `P-709-map.md` (d)-E1: ch. 8 PDF = printed + 9, ch. 11 +7, ch. 3 +13, ch. 2 +14).
Numbers recomputed in my own numpy/scipy (scratchpad `own/q20.py`, `own/q23.py`, `own/acc.py`; never the repo engine or the planners' scripts). The repo was used only to
render the displayed strings (vitest dump, scratchpad `dump/`) for sentence-cap, citation and overlap scans. No repo file changed except this one.

**Verdicts: Q20 = FIX-FIRST** (one one-token blocker, B1) **. Q23 = PASS with fixes** (no blocker; one Correction to reword, one to demote).

Evidence: Q20 about 60 values recomputed (cloner by four explicit CNOT matrices, Choi spectra, sphere quadrature, retry and Toffoli processors, Bell programs, the 8x8
discriminator and a (c1,c2) grid): every displayed digit and every one of the 115 claim sentences (all read) is right, except the points under B1/S-items. Q23 about 75 values
(15^3 triangle grid, 132 infinite pairs, SSA on the W-mixture, BSC capacity grid, dephased circuit, Holevo chi and I_acc over 3601 axes, plus my own optimiser over rank-1 POVMs
with 2, 4, 6 outcomes: pair 0.39912, BB84 0.5000): all match to the printed digits. Citations: 22 (Q20) and 29 (Q23) page and equation references checked on images, plus the
N&C pages (400, 511, 514, 519-521, 528-531, from `nc-full/text.md`, PDF - 28): all N&C pages right. Sentence caps by script (550 and 532 sentences): none over in beats. Glossary:
no duplicate id or term in 440 `qc-` entries; all 27 entries within 25/40 words. Unit numbers in every `<<...|Unit x.y>>` link (14 targets) match the unit's position. Verbatim
scan against Bergou and N&C text: longest shared runs are 6 words, generic ("each of the four Bell states"); no paragraph tracks the book sentence by sentence.

## Corrections (Z3), each read on the page image and recomputed
| Box | Page (image) | What is printed | My recompute | Verdict |
|---|---|---|---|---|
| Q20 C1, p. 148 | PDF 157 | Measure-and-prepare cloning: 2/3 is called the fidelity to the ideal pair psi psi, "less than the 5/6" of the circuit (5/6 is the single-copy value, Eq. 8.5, p. 147) | single 0.66667, pair 0.50000 (sphere quadrature), circuit pair 0.66667, circuit single 0.83333 | **SHIP** as worded |
| Q20 C2, pp. 156-157 | PDF 165, 166 | Eq. 8.42 and the second line of 8.43 carry the constant 1-(2-c1-c2)+(3/4)c1c2 | block of Eq. 8.41 has trace 2-c1-c2, det 1-c1-c2+(3/4)c1c2; at 2/3: printed 0.6667 (discriminant -2.2222), true det 0 (eigs 0, 0.6667); 8x8 spectrum {0,0,2/3,2/3,1x4}; max c1+c2 = 4/3 | **SHIP** as worded; 8.44, 8.46, 8.47 follow from the true det |
| Q23 N1, p. 191 | PDF 198 | After Eq. 11.4 the classical H(p||q) is said to act as a distance between "two quantum states". The same sentence is repeated, correctly, after Eq. 11.9 on p. 192 | S(diag(.9,.1)||(I+.8X)/2) = 1.26797; classical H on the identical spectra = 0 | **REWORD** (S2): a copy-paste word slip, not a physics claim; the box's shouldSay reads as if Bergou meant the eigenvalue tables |
| Q23 N2, p. 195 | PDF 202 | Ancilla argument: S(rho_AB) = S(rho_B), S(rho_ABC) = S(rho_AB) | Bell pair: S(AB) = 0, S(B) = 1; with pure helper S(BC) = 1 = S(B), S(ABC) = S(AB) | **SHIP** as worded |
| Q23 N3, p. 48 | PDF 61, 400 dpi crop | s = (x-x1)/(x1-x2); denominator should be x2-x1 | x1=1, x2=4, x=1.5: printed s=-1/6 gives -0.3333 > -1 (fails); true +1/6 gives 0.3333 <= 0.5850 (log2) | printed slip confirmed, **CUT as a box** (S1): harmless sign slip, Eq. 3.45 is unaffected, so Z3 wants a Rosetta line |
| Candidate N4 (not in the plan), p. 50 | PDF 63 | Eq. 3.52 first line prints Tr(rho_AB log rho_AB) where Tr[rho_AB log(rho_A x rho_B)] is meant | Bell pair: printed lhs 0, rhs -2 | optional (N3 below); the content never reproduces 3.52 |

## Blocking
| # | File:line | Problem | Exact fix |
|---|---|---|---|
| B1 | `Q20.story.ts:573` (clue text G), `:577` (formal caption) | The measure-and-correct scheme is stated as "apply V" on reading 1. The processor emits U_k psi (reading 0) and V U_k psi (reading 1), so the fix-up is V^-1 (p. 151 says so); applying V gives V^2 U_k psi. A false step in the scheme the learner is asked about | Replace "apply a known gate $V$" by "apply $V^{-1}$" in text G, and "then $V$ if the reading is 1" by "then $V^{-1}$ if the reading is 1" in the caption; the formal text (575) already says only "measure-and-correct" |

## Should-fix
| # | File:line | Problem | Exact fix |
|---|---|---|---|
| S1 | `Q23.ts:551-557`, `Q23.story.ts:363` (last sentence), `Q23.test.ts:3, 72, 131`, header comment `Q23.ts:10` | N3 is a harmless sign slip (Z3 rule). Also the "three Corrections" count in the header and in any length test | Drop the third entry; replace the last sentence of quantum-compare:b4 formal by "Rosetta: the line before Eq. 3.45 prints s = (x-x1)/(x1-x2); the denominator is x2-x1, which changes nothing downstream." Update the count (test at :72 expects exactly three; :131 expects "Corrections box" in this beat, so keep that phrase or change the test) |
| S2 | `Q23.ts:538-543`, `Q23.story.ts:424` | N1 corrects a straw man: Bergou does not apply the classical H to eigenvalue tables; the same sentence is right on p. 192 | shouldSay: "The sentence is about two probability distributions; the identical sentence after Eq. 11.9 (p. 192) is the one about states. For states the quantity is $S(\rho\|\sigma)$, which sees eigenvectors: ..." (keep the 1.268 and 0 numbers and the check). Reveal formal: "This is the point of the Corrections box on p. 191" |
| S3 | `Q20.story.ts:497` (no-go:b3 G) and `Q20.review.ts` no-go card | Ground uses $\Pi_k$, $\Pi_k'$ (program before and after the processor) and the review card equation, never defined in Ground (b1, b2 G carry no symbols). Plan 7.1 promised a definition | In b1 G add: "Call the program state $\Pi$ before the run and $\Pi'$ after it." (or in b3: "Write $\Pi_k$ for program $k$ and $\Pi_k'$ for what comes out.") |
| S4 | `Q20.story.ts:932` (disc:b2 G), `:950` (b3 G) | Ground uses $c_1, c_2$, $\Pi_0, \Pi_1, \Pi_2$ with no definition (b2 G never states the two tests or their weights); register letters A, B, C appear in text before any G sentence defines them (only the b1 caption does) | b2 G: add "Test the pair B, C with weight $c_1$ and the pair A, C with weight $c_2$; call the two tests $\Pi_1$ and $\Pi_2$." b1 G: "three qubits, called A, B, C" |
| S5 | `Q20.story.ts:733` | Locator "p. 152" for the remark that the procedure can be repeated: it is on p. 153 (PDF 162, after Eq. 8.29) | "p. 153" |
| S6 | `Q20.story.ts:900` | "Bergou's value for this circuit (p. 153)": the one-in-three chance is stated at the foot of p. 152 (PDF 161) | "p. 152" |
| S7 | `Q20.story.ts:630` | Displays "engine gap $-0$" (negative zero) | `d(Math.abs(V.q20RotGap), 0)` or clamp in `Q20.values.ts` |
| S8 | `Q20.story.ts:803` (bell-programs:b3 G text), `:833` (derivation why) | "equal mix of the three Bell states" for a coherent superposition: "mixture" is a glossary term (a density matrix) in this course | "equal superposition" (Ground only) |
| S9 | `Q23.story.ts:990` (holevo:b3 G) | "No measurement reaches 0.601" is true (Levitin's closed form for two pure states, my POVM optimiser agrees at 0.39912) but the chapter proves it only for the 3601-axis grid and says so in the Formal track (our evidence, not a claim); Ground states it as fact | "No axis reaches 0.601, and a search over all measurements found none that does: ..." and add "(a known result for two pure states)" after the closed form in the Formal text |
| S10 | `Q23.story.ts:1073` (holevo:b5 F) | $p_{xx}$ (chance of naming $x$ when $x$ was sent, p. 198) and $N$ (number of states) are used before any definition in the Formal track | Add "with $p_{xx}$ the chance of naming $x$ correctly when $\psi_x$ is sent, and $N$ the number of states" |

## Nits
| # | File:line | Item |
|---|---|---|
| N1 | `Q23.story.ts:568` | Claim text "0.5366" against displayed 0.5365 (value 0.536547); use "0.5365" and tolerance 5e-5 |
| N2 | `Q20.values.ts:226,249,268`, claims `q20RotY`, `q20Prog60x/z`, `q20DiscPrinted` | Keys store magnitudes; claim sentences say "negative", "minus 2.2222" but the checks test only size (`q20Rho3Y` adds the sign test, these do not). My sims give -0.8660, -0.5, -0.8660 and a discriminator of -2.2222: prose is right; add the sign test or store signed values |
| N3 | `Q23.ts:161`, `:350`, `:476`, `:449` | Try-it/option lines over the Ground cap: 42, 29, 27 and 26 words. Split at the colon |
| N4 | `Q20.ts:517` | "ψ₂ at overlap 0.5 with |0⟩" quietly makes ψ1 = |0⟩, while the stage draws ψ1, ψ2 at ±60° rotations (s = 0.5 too). Say "take ψ1 = |0⟩" |
| N5 | `Q20.story.ts` bell-programs:b1 F | Eq. 8.23 as printed lists Ψ- on both of the last two lines (the fourth is Φ-); add to the Rosetta sentence |
| N6 | `Q20.story.ts` disc:b5 | "best chance 1 - s" needs "(equal priors)" in the Formal text |
| N7 | `Q20.values.ts:268` | `q20DiscPrinted` name is "printed discriminant" but stores +20/9 (the box adds the sign by hand); rename `...Abs` |
| N8 | `Q23.story.ts` entropy-props:b3 F | Candidate N4 above: add a Rosetta sentence (Eq. 3.52 lhs) or a fourth box (SHIP if the judge wants it) |
| N9 | `Q23.story.ts` quantum-compare:b2 | Restates Q9's fidelity definition; add `<<qc-q9-distance|Unit 9.6>>` to the formal sentence (Z4 link-back) |

## Checks passed (no action)
- Physics: Q20 cloner (c0, c1 at 15 and 30 degrees; F1, F2 0.9553/0.6667; 5/6; shrink 2/3; universality spread 1e-15; wire 3 y part -0.2887; turned fidelity 2/3, dot -1/3), Choi minimum 1/4-3p/4 (0.1 at 0.2, -0.125 at 0.5, 0 at 1/3), measure-and-prepare U-NOT 2/3, retry 1-2^-k (7 rounds for 0.99, 10 for 0.999), Toffoli 3/4 with failing-reading overlap 1/4, flip programs 1/3 at four directions (my U_phi coefficients -0.866, 0, -0.5 and +0.5 at 120 degrees), programmable USD 0.25 at s = 1/2, ratio 0.569.
- Q23 all six units' central results (Klein chain 1.268 >= 0.531 >= 0, r = (1/2,1/2); SSA gaps 0.5365 and 0.1866; capacity 0.5310 at f = 0.1, 0.5001 at 0.11, 0.1887 at 0.25; I_dephased 1.531; GHZ 1 and 2; chi 0.6009 = h((1+s)/2); z reading 0.3113; best 0.3991 = 1-h(0.1464); USD bound 0.1887/0.3991/0.7136; BB84 1/0.5/0.5/0.5; Bell chi 2).
- Framing: no hardware or reported digits (Z2); our own results labelled ("our calculation", "our choice", "beyond the book", the optimiser as evidence); Bergou's Problems cited, never worked (Q20 P1-P3, Q23 P1-P4, matched to the page); Z4 link-backs present for Q13, Q14, Q9, F5, Q12; Rosetta lines present for F_c = F^2, U(alpha) = R_z(-2 alpha), Bergou's Phi/Psi swap (verified on p. 152), U0 signs (verified on p. 147).
- Bridges: all 14 targets exist, unit numbers match; Try-its are true to the widgets as far as I recomputed them (Q20: +y 93.3% and 78.9%, +z 75/25%; Q23: projector 0.906 and 82.1%).
