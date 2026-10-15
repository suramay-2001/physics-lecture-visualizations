# Independent P truth review: Papers B3 and B4 (lean pass, read-only)

Scope: `app/src/content/papers/B3.paper.ts` (2836 lines, 69 claims, 2 reported) and `B4.paper.ts` (2208 lines, 79 claims, 8 reported), both glossaries,
bridges, plans and rulings `papers-B3B4.md`. No Playwright, no screenshots of the app; page images of the cited PDFs were rendered and read.

## Verdicts

| Chapter | Verdict | Blocking | Should-fix | Nits |
|---|---|---|---|---|
| B3 Measuring logical operators | **FIX-FIRST** (one answer-key defect, one-line fix; every number is right) | 1 | 6 | 5 |
| B4 Magic states and Pauli-based computation | **PASS with fixes** | 0 | 4 | 6 |

Evidence: every displayed number, answer key and "our calculation" statement was recomputed with my own python, independent of the engine and its twins
(scripts in the scratchpad, not committed): the three-measurement CNOT Kraus operators (8 outcome triples, M†M = I/8, fixes Z_c^[m2] X_t^[m1 m3]); P⊗Z_m then X_m
injection (7 Paulis on 1 to 3 wires, all four outcomes 1/4, leaves P^[t] P(−sπ/4)); executed-axis histories (ZXZX gives 8, ZZZ gives 1, X after odd Z becomes −Y);
H·T powers to 1000 (148.600°, 0.41278 turns, misses 0.2004 / 0.01586 / 0.001037 in the metric sqrt(2−|tr|)); 15-to-1 over all 2048 accepted patterns (A3 = 35,
A4 = 105, 0.8601, 3.609e-5, 1.003, 15.2, 3.51e-8, 1.51e-21, fixed point 0.14148); 7-bit gap table; staged time 60 and 70; vote table and its ratios; T-count
BFS to k = 11 (147 408 gates, sizes equal 24(3·2^k−2), slope 0.268, R_z(π/8) miss 0.196); gauged codes built from two d=3 rotated patches (n = 23, 24, 25,
k = 1, d_X = 1, 2, 3, d_Z = 7, loops 0, 1, 2, h = 1/3, 2/3, 1 by brute force, any choice of rungs) and the patch–Steane adapter (n′ = 23, k = 1, d_X = 3, all 6 orders give
h = 1); lattice-surgery merge counts for d = 3, 5, 7 (n = 21, 55, 105; d+1 new X checks; d−1 widened Z checks; product of new checks = X̄_A X̄_B times old checks; 4 random bits
on |0̄0̄⟩ so each pattern is 1/16, only 3 on |+̄+̄⟩); the 15-gate Toffoli (equals Toffoli, 7 T-type) and its seven axes (exact for the sign pattern +++−−−+).
Sentence caps by script (TeX counts one word): 5 sentences over cap, all nits or in a blocking item. Glossaries: no duplicate id or term across B1, B2, B3, B4, P1, none
against 448/709; every `first` matches the first use. Every bridge id exists and lands on the unit that teaches the idea (unit numbers quoted in the prose are right).

## B3 items

| # | Class | Where | Finding and exact fix |
|---|---|---|---|
| B3-1 | Blocking | `B3.paper.ts:628` (`b3-m-pair`), option at `:645` | "IZZI and a single-qubit Z" is marked wrong, but any single-qubit Z commutes with IZZI, so the pair can be read together; the `why` concedes this ("commutes") and runs 29 words. Two defensible answers. Fix: replace the option text by "IZZI and IXII" (they clash on one qubit, so they anticommute) with `why` "They clash on one qubit, so reading one erases the other." |
| B3-2 | Should-fix | `:2721`, `:2728`, `:2712` | Locations: 103 qubits (54 data, 49 check) is printed in the opening of Cro24 §4, p. 29, and Fig. 7, p. 30 (the §4.1 heading starts at the foot of p. 30); "eight measurements" is the Fig. 7 caption, p. 30, and the p. 31 list; "36 automorphisms" is in §4.3, p. 35. Both entries say §4.1 and carry no page. Fix: `cro24-gross-system` at `{kind:'section', label:'4', page:29}`; split the second into `cro24-measurements` (8; `{kind:'figure', label:'7', page:30}`) and `cro24-automorphisms` (36; `{kind:'section', label:'4.3', page:35}`). |
| B3-3 | Should-fix | `:2712` | "The sum and product are ours" is false for the product: Cro24 prints "288 logical measurements" itself (p. 35 into p. 36). Fix: "The sum 54 + 49 is ours; the 8 × 36 = 288 is printed on pp. 35 to 36." |
| B3-4 | Should-fix | `:2623` | Trail cites SJY24 "Def. 8 and Theorem 11". Theorem 11 is about products of sparsely overlapping logicals; the adapter statement is Lemma 9 (adapters keep relative expansion ≥ 1, p. 11). Fix: "Def. 8 and Lemma 9", and add the condition "when both graphs have relative expansion ≥ 1"; the why now claims an unconditional "keeps the distance". |
| B3-5 | Should-fix (ruling R3) | `:2571` ground and formal, `:2623` | The patch–Steane adapter (n′ = 23, k 2 → 1, h = 1, d = 3) is our example (I reproduced it) but is not labelled so, and the trail attributes it to SJY24. Fix: Ground "In our example, ..." and Formal "Our example (not from SJY24): ..."; trail line "Def. 8 and Lemma 9: the adapter itself; the 23-qubit example is ours." |
| B3-6 | Should-fix (R3) | `:909`, `:1019` | The exact three-measurement CNOT (Kraus form, 1/8 per triple, fix formula; all true) is credited to "Hor12 §4.1". Hor12 §4.1 builds the CNOT from four surgery steps (smooth merge, split, rough merge, split) with an intermediate patch. Fix: formal "Our three-measurement version of Hor12 §4.1's CNOT: ..."; trail why "merge, split, merge, split" in the paper; ours: the Kraus form and the 1/8. |
| B3-7 | Should-fix | claim `b3VoteRatio` `:2152` | Text "two more rounds multiply the failure chance by about 0.28" is the limit 4p(1−p) = 0.2786 (recipe `ratio`), true for large R only. The displayed table gives 0.215, 0.235, 0.246, 0.252, 0.256. Fix: "for many rounds, two more rounds multiply the failure chance by about 0.28 (the limit 4p(1−p))"; or add a claim for 0.256 (R = 9 to 11). |
| B3-8 | Should-fix | `:1763` (`b3-distance:b2` Ground) | Ground defines the Cheeger constant without the size limit, so S = all dots gives 0 for every graph. Fix: "For a set of at most half the dots, count the links leaving it and divide by the set's size." (24 words). |
| B3-9 | Nit | `:335` | Try-it row 1 is 26 words. Split after "halves". |
| B3-10 | Nit | `:1481`, `:1684` | Ground of the clue `b3-gauging:b5` and `b3-distance:b1` say "distance" and "deformed code" before they are glossed (Unit 3 vs Unit 4). One clause: "(the deformed code is the code with the new qubits and checks)" in `b3-gauging:b3` Ground. |
| B3-11 | Nit | `:1684`, `:1760`, `:2629` | The deformed-distance family and the "h = w/3" table are our teaching family (true, scoped "on this family") but unlabelled; add "our family" once in `b3-distance:b1` Formal. |
| B3-12 | Nit | `:1574` (review trap, gauging) | "Assuming the graph can be any tree: a thin graph can weaken the code" sits beside `b3-gauging:b5` where the 4-vertex seam path (a tree) keeps (3, 7). Say "a thin tree such as one rung". |
| B3-13 | Nit | `:1019` | Trail "a merge, a split and a merge" omits the paper's final split (see B3-6). |

## B4 items

| # | Class | Where | Finding and exact fix |
|---|---|---|---|
| B4-1 | Should-fix (R3) | `:758`, trail of `b4-pbc:b3` (`:763` on) | Trails credit "lit19a §1 Figs. 4 to 6: The Toffoli as a list of rotations" and "the seven rotations commute". Lit19a contains no Toffoli (text search of the whole paper). The 15-gate Toffoli and its 7 axes are our example (I verified them). Fix: trail why "The sliding rule used here; the Toffoli worked example is ours." and say "our example" in the Ground of `b4-pbc:b2`. |
| B4-2 | Should-fix | `:1628` to `:1629` (`b4-cultivate:b3`) | Keep chances 1/2 and 2/5 (60 vs 70) are labelled only as "multiply to one in five"; the next beat reports Fig. 2's 35% discard before growth, i.e. first-stage keep 0.65, which contradicts "the first stage keeps one half". The plan used 0.65 and 0.3077 (63 vs 70; I get 62.99999). Fix: either revert to the plan, or add "our made-up split; the paper's first stage keeps 0.65 (next beat)" to Ground and Formal. |
| B4-3 | Should-fix | `:1666`, claims `:1768` | "Keeping 20% needs 5 tries ... 20 times as many tries" follows from the rounded Fig. 2 percentages, but GSJ24 p. 14 (§3.3) states 4 attempts per kept shot for d1 = 3 and 100 for d1 = 5 at p = 10^-3 (25 times). Fix: "From the rounded 80% this is 5 tries (the paper's text says 4); the larger code needs 100, so 20 to 25 times as many", and label `b4AttemptRatio` "about 20 from the printed table". |
| B4-4 | Nit | `:2015` to `:2016`, claim `:2022` | Slope 0.268 reproduced exactly (27 rotations, k = 4 to 11). It depends on the window: 0.244 (k = 3 to 11), 0.292 (5 to 11), 0.304 (6 to 11); the single angle R_z(1), k = 5, 7, 9, 11 gives 0.376 (the plan's 0.347 was this one-angle fit, noisy; the build's 27-rotation mean is the better choice). Formal says "for k ≤ 11" but the fit is k = 4 to 11. Fix: "k = 4 to 11"; add "(window-dependent, 0.24 to 0.30)"; record the change from 0.347 in `P-B4-story.md` or the relay note. |
| B4-5 | Nit | `:1227` | "just inside the octahedron edge 0.146": the fixed point 0.1415 is below the edge value; states with ε below 0.1464 are outside the octahedron. Say "just short of". |
| B4-6 | Nit | `:1080` and unit source | "Lit19a Fig. 7 and §3.3 Fig. 17": the any-Pauli statement (P⊗Z, X, Clifford fix commuted forward) is §1.1 and Fig. 8, p. 7; Fig. 17 is the distillation layout. Cite "§1.1, Figs. 7 and 8". |
| B4-7 | Nit | `:652`, `:1951` | Try-it rows of 28 and 30 words. |
| B4-8 | Nit | `:1046`, `:1066`, `:1612` | "200 random states", "11 Paulis", "2000 terms": engine tests cover them (`b4.fixtures.test.ts:190`) but no claim key exists; add keys or keep as is. |
| B4-9 | Nit | Ground of `b4-beyond-clifford:b1` (`:410` area) | "octahedron" is first used in the caption and in `b2` Ground; one clause "the solid with the six states as corners" in `b1` Ground. |
| B4-10 | Nit (ruling text) | `b4-beyond-clifford:b2` (`:410`), traps `:565`, `:573` | Known item confirmed: the BK05 "T-type / H-type" Rosetta line sits in unit 1, not `b4-injection` (R2 says injection). Correct and better placed (the 12 vs 8 orbits are taught there; `b4-injection:b3` points back). Fix is to the ruling text, not the content. |

## Known items from the brief

- Rosetta line unit 1 (R2): confirmed, B4-10. T-count slope 0.268 vs 0.347: confirmed and independently reproduced, B4-4. HT powers cap 1000 (plan: 10^4, metric 0.564 / 0.0449 ...): the build uses the same metric as the T-count (sqrt(2−|tr|)), values correct to the printed digits (0.01586 is 0.015865). Cultivation s1 = 1/2: confirmed, B4-2. "Our example" framing (R3): four toys checked: adapter B3-5 (missing), CNOT B3-6 (missing), deformed-distance family B3-11 (scoped but unlabelled), Toffoli B4-1 (wrongly attributed).

## Corrections and reported values (page images rendered; Corrections themselves live only in P1)

| Id | Printed in source (as I read the page image) | Chapter says | Verdict |
|---|---|---|---|
| `cro24-gross-system` | p. 29 (§4 opening) and Fig. 7, p. 30: "103 physical qubits, 54 data and 49 check" | 103 (54, 49), "§4.1", no page | Value right; location wrong, B3-2 |
| `cro24-measurements` | 8: Fig. 7 caption p. 30 and p. 31 list; 36: p. 35 (§4.3), group of automorphisms modulo stabilizer has order 36 | 8 and 36, "§4.1" | Values right; location wrong, B3-2, B3-3 |
| `bk05-threshold` | Eq. (37), p. 13: ε0 ≈ 0.141 | ≈ 0.141, Eq. 37 | Right; add page 13. Ours 0.14148 (stated "0.1415"), right |
| `lit19b-row1` | Table 1, p. 2: (15-to-1)7,3,3, 10^-4, 4.4×10^-8, 810, 18.1 | same | Right; add page 2 |
| `lit19b-row2` | Table 1, p. 2: (15-to-1)^4_9,3,3 × (15-to-1)25,9,9, 10^-4, 6.3×10^-25, 18 600, 67.8 | same | Right; add page 2 |
| `gsj24-d3-cult`, `-d3-e2e` | Fig. 2 (a table), p. 2, noise 10^-3, fault distance 3: 6×10^-7 / 35%; 3×10^-6 / 80% | same | Right; add page 2 |
| `gsj24-d5-cult`, `-d5-e2e` | same table, fault distance 5: 6×10^-10 / 85%; 2×10^-9 / 99% | same | Right; see B4-3 for the derived tries |
| `rs16-law` | arXiv abstract (not local): typical T-count 3 log2(1/ε) + O(log log(1/ε)), factoring oracle | same | Right |

"We re-derived it ourselves" (`b4-pbc:b5`): the identity e^{iπQ/4} Π_P^s = √2 Π_W^+ Π_P^s with W = isQP is exact (algebra and 240+ random cases); Tour de gross p. 23 Eq. (10) cites
[KBP23, Prop. 2.2], so no Correction is needed: confirmed. Other checked and right: all WY24 pointers (Alg. 1, Thm 1, Fig. 1b is the ladder, Lemma 2 d* ≥ min(h,1)d, Thm 2, Thm 4);
Cro24 Lemmas 15 and 16 (|B|−1 checks, k−1), Thm 24, Def. 3 and Thm 6; BK05 Def. 1 (p. 3), Thm 1 (p. 2), Eqs. 37 and 38; Lit19a P_φ = exp(−iPφ) (p. 5), C(P1,P2) signs; "the Tour de gross paper
keeps only some" cycle checks (App. A.3, p. 51: 37 cycles for 81 − 39 + 1 = 43); the Litinski and BK Rosetta lines.
