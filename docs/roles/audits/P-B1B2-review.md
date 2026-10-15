# Independent P review: Papers B1 "The surface code: a memory you can keep" and B2 "Quantum LDPC codes and bivariate bicycle codes"

Reviewer role P, 2026-10-15, read-only on the repo (this file is the only write). Lean pass (no Playwright, no screenshots, no suites). Files: `app/src/content/papers/B1.paper.ts`
(L = line), `B2.paper.ts`, glossaries, `bridges.ts`, `papers/validate.ts`. Sources are paraphrased, never quoted.

## Verdicts

| Chapter | Verdict | Blocking | Should-fix | Nits |
|---|---|---|---|---|
| B1 (6 units, 32 beats, 109 claims, 6 reported) | **FIX-FIRST** | 1 | 10 | 4 |
| B2 (6 units, 29 beats, 96 claims, 10 reported) | **PASS with fixes** | 0 | 7 | 8 |

## Evidence

- Read every beat, reveal, derivation, challenge and claim sentence of both chapters (dump with fixture values), then recomputed with my own code (not the repo engine): toric L=3..6 (n, ranks, k, d=3,4),
  rotated d=3..9 (counts, weight-2/4 checks, lit-check counts 6/3 and 10/15, d=3,5), unrotated counts and ratios 1.47/1.89, all fits (3.16e-10, 9.49e-11, 3e-11, d needed 17/17/15, 577/449 qubits), vote
  curves and 13/37, clean-run values, 576/96/16 schedule pairs and the 8 flagged pairs, repetition spectra (15/105: 0, 9, 28; 45/990/14190: 0, 0, 50, 400), all seven Table 3 rows (n, k, ranks, 2 dim ker),
  gross overlaps 9 and 63, both polynomial forms (yA, xB), 864 edges, planarity of both layers (12 pieces of 24 nodes, 6 of 48, all planar, degree 3), toy [[24,4,4]] and toric 3x4 [[24,2,3]], Hamming 4/8/16/32 and k=51,
  shift action (orders 6 and 6, 36 distinct actions, trivial shifts exactly 1 and x^6, group order 36), printed A_x (17 ones, so 34), min-sum BP on the 3x3 torus (hard weights 0,4,6,0 repeating, totals -lambda).
- Page images opened: Bra+24 p. 8 (Table 3) and p. 13 (Table 5), Hor+12 p. 20, Bev+22 p. 21, paper pp. 17, 47, 65. Text only (no image): Den+02, Rof+20, Fow+12 (PDFs read with PyMuPDF), arXiv abstracts of BPT10 and Mul+25.
- Not recomputed: d_circ 3 and 2 with 1470/221/197 events, [[72,12,6]] distance, two-gross relabelling, Table 5 pair counts (0 and 432), OSD-0. Kit03 and Rof19 are not in `sources/`: their section numbers are unchecked.
- Claims: 109 + 96 sentences read; at least 60 (B1) and 45 (B2) re-derived. Sentence caps (my scan, no beat over 25/40), duplicate glossary terms (68 entries, none duplicated) and bridge targets (all six used bridges in B1/B2 land on the right unit): clean.

## Blocking

| # | Where | Problem | Exact fix |
|---|---|---|---|
| B1-1 | B1.paper.ts:2232-2233, 2654, 2663, 2746 | The fit's p* is called "a reference rate where curves meet, not the threshold; the threshold proper is Den+02's", and taking p* for the threshold is taught as a trap. Bev+22 (p. 20-21) calls p* the "threshold value"; Fow+12 Eq. 11 uses p_th = 0.57 % for circuit noise. Den+02's 0.1094 and 0.0114 are for simpler noise models, so thresholds depend on the model. | Say "p* is the threshold of the fitted circuit-noise model; Den+02's numbers belong to other noise models". Change the trap and pitfall to "treating p* as the threshold for every noise model". |

## Should-fix

| # | Where | Problem | Exact fix |
|---|---|---|---|
| B1-2 | B1:2297 | "Three papers use three formulas" is two documents (the paper gives §2.6 and A.10; Bev+22 one); Ground never names "the last two". | "Two papers give three formulas. The paper's A.10 form and Bev+22's differ by 3.16 at d = 17." |
| B1-3 | B1:2298, 2356, `fow12` ref | "Fow+12 could not be read online" is stale: `sources/ref-fow12` has the PDF (no text.md). Eqs. 10-11 print P = 0.03 (p/p_th)^(d_e), d_e = (d+1)/2 for odd d, p_th = 0.57 %. So Bev+22 repeats Fowler's exponent and the paper's d/2 is its own approximation. | Say so, set status read, add a reported entry for Eq. 11, re-run the claim ledger if a number moves. |
| B1-4 | B1:2453 (and 2498) | Budget p_L is per step, P(d) is per round, but "a billion steps need d = 17" never says each step is one round; Lit19a's d rounds per Pauli measurement make real estimates larger. Reads as a resource estimate. | Add "taking each step as one round, a simplification of ours" to Ground. |
| B1-5 | B1:1376 `hor12-13` | Location "figure 14" is wrong: the 9-data, 8-syndrome and 25-to-13 text is prose on PDF p. 20 under Fig. 15; Fig. 14 only draws the two lattices. | `at: {kind: 'section', label: '7.1'}`. |
| B1-6 | B1:1533-1534 | "Clash" means two things: same-step use of a qubit (96 pairs clash-free) and wrong order (parity rule, 16 valid). The 8 flagged example pairs are clash-free. | Define "clash = a qubit asked twice in one step"; call the parity failure "wrong order". |
| B1-7 | B1:1882 | "A flipped readout looks like a flipped qubit for one round" contradicts the trap at 2111 (one check lit in two rounds, not two checks in one). | "A flipped readout makes one check look wrong for one round." |
| B1-8 | B1:1160 | Ground `d` is the number of copies (b1-why:b3) and is used as the distance here with no definition. | "For any odd distance $d$ ...". |
| B1-9 | B1:1016, 1035, 1441, 1460, 1479, 1793, 1812, 2134, 2156, 2733; 2707 | 10 integer challenges use tolerance 0.5 (house rule: 0); `b1-h-lambda` has answer 5 with 0.005. | `tolerance: 0` on all eleven. |
| B1-10 | B1:516, 720 -> `pp-q22-css`; 871, 1161 -> `pp-q22-check-matrix`; 2066 -> `pp-q22-clifford`; 969 (Chapter B2) | Q22 and Papers chapters named in words where bridge rows exist (or can: `pp-b2-ldpc` has no row yet; L1947 lookup decoder has none). | Use `<<pp-…|Chapter Q22>>`; add `pp-b2-ldpc` to `bridges.ts` and link L969. |
| B1-11 | B1:2498 | Derivation ground step 2 says "2 x 17^2 - 1 = 577" but its view is the bev22 preset (d = 15). | Use the tdg-A10 preset for the Ground step. |
| B2-1 | B2:2404, trail at 2395 | "36 distinct logical actions, x^6 acts as identity" is cited to Bra+24 §9.2, which says every non-identity shift is a nontrivial gate. The 36 is the paper's A.2 (p. 47: shifts by <x^6, y^6> are logical identity, 35 nontrivial) and my recomputation. | Cite paper A.2 p. 47 in the text and add "Bra+24 §9.2 says otherwise; the paper and our computation find x^6 trivial". |
| B2-2 | B2:2342 and caption | Paper p. 47 prints M = A (x) A, one A twice; the engine's lower block is A transposed (P1 Correction E1, confirmed there). The picture is "in the paper's basis" and will differ from Eq. 37 in the lower block. 34 ones is right either way. | Add "the paper prints the same block twice; our table has its transpose below (see the Tour de gross lecture)". |
| B2-3 | B2:423 | "The paper cites Panteleev and Kalachev only as outlook" is false for PK21 (paper pp. 3, 8, 43: a source of BB codes); only PK22 (good codes) is outlook (p. 32). | "cites Panteleev and Kalachev's asymptotically good codes only as outlook". |
| B2-4 | B2:2007, 2063 | Ground "one cycle measures every check in 8 rounds" beside claim "one cycle takes 9 steps". The +1 is the Z-check initialisation at step 0 (paper p. 10). | Claim text: "a lone cycle takes 9 steps (8C+1 at C = 1)"; add one sentence on the +1. |
| B2-5 | B2:423, 1223, 1692 (hint), 1789, 1790 | "Chapter B1" in words (toric code -> b1-toric has no bridge row; patch rate -> `pp-b1-planar` exists). | Add `pp-b1-toric`, link all five. |
| B2-6 | B2:1117; derivation 1252-1293 | Ground track uses ℓ and m (`ℓm`) without defining them ("12-by-6" only). | In b2-polynomials:b1 Ground: "an ℓ-by-m torus; here ℓ = 12 and m = 6". |
| B2-7 | B2:654, 1058, 1082, 1690, 1714, 2194, 2218, 2589, 2616, 2643, 3185; 1034 | 11 integer challenges use tolerance 0.5; `b2-b-surface` (answer 1) uses 0.005. | `tolerance: 0`. |

## Nits

| # | Where | Note |
|---|---|---|
| B1-12 | B1:426 | "Not a figure of any paper": the paper's A.10 (p. 65) uses the same failure chance of one third. Say "the same target as the paper's A.10". |
| B1-13 | B1:1500 | Fig. 4a is on p. 10 (§2.2), noise is §2.6 p. 15. Write "paper §2.2 p. 10 Fig. 4a; §2.6 p. 15". |
| B1-14 | B1:2395-2396 | 0.1094 and 0.0114 are marked on repetition-code vote curves; caption should say they belong to the surface code. |
| B1-15 | B1:29, 39; `validate.ts` ARXIV | Kit03 and Den+02 cite DOIs because ARXIV accepts only new-style ids. Widen the regex to old style and add `quant-ph/9707021`, `quant-ph/0110143`. |
| B2-8 | B2:915 | "Confirmed offline by a planarity routine": true (I re-ran it) but the routine is only in the plan's scratch. Add it to `pipeline/`. |
| B2-9 | B2:30 | `bra24` "defines the BB codes": paper §2.1 credits KP13, PK21 and Bra+24. |
| B2-10 | B2:30, 1864 | `reliedOn` omits Definition 1 and Lemma 4 that b2-gross:b1 cites. |
| B2-11 | B2:739 and tryIt | "BB codes" used before its tagged first use (b2-bpt:b2). |
| B2-12 | B2:2679, 65 | Rof+20 App. C is readable (Alg. 1; scaling alpha = 1 - 2^(-iter), Eq. C5). Keep "no scaling" but drop "could not be read". |
| B2-13 | B2:3007, 3030 | Mul+25 abstract says "comparable to" matching and "enables" FPGA/ASIC. Use "comparable"; drop "a chip can host it". |
| B2-14 | B2:2997 | "search size" is "search depth lambda = 60". |
| B2-15 | B2:1504 | Toy code is labelled ours only in Formal; add to Ground. Plan `P-B2-story.md` says 32 ones: correct to 34. |

## Reported values (the 16)

| id | Chapter | Chapter says | Source page check | Verdict |
|---|---|---|---|---|
| hor12-13 | B1 | 9 data, 8 syndrome; 13 with reuse; Fig. 14 | Hor+12 p. 20 prose: "9 data qubits and 8 syndromes", central four reused, "25 to 13" | value ok, location wrong (B1-5) |
| tdg-fit-a10 | B1 | 0.03 (p/0.01)^(d/2), A.10 p. 65 | p. 65 image: P1 = 0.03 (p/0.01)^(d/2), 2d^2 qubits | ok |
| tdg-fit-26 | B1 | 0.1 (p/0.01)^(d/2), §2.6 p. 17 | p. 17 image: same formula, "about 10^-10" at d = 17; our 3.16e-10 is the formula's value | ok |
| bev22-fit | B1 | 0.03 (p/0.01)^((d+1)/2), Table 5 | p. 21 image TABLE V, n = 2d^2 | ok |
| den02-pc | B1 | 0.1094 +- 0.0002, §IV.6 | Eq. 41, "Sec. IV F" (the sixth letter), numerics for the random-bond Ising model | ok |
| den02-bound | B1 | p, q below 0.0114, Eq. 64 | Eq. 64 in §V, "p, q < .0114" | ok |
| bra24-d144, d90, d108, d288 | B2 | 12, 10, 10, 18; Table 3 | p. 8 image rows [[144,12,12]], [[90,8,10]], [[108,8,10]], [[288,12,18]] | ok x4 |
| bra24-d360, d756 | B2 | at most 24, at most 34 | p. 8 image: [[360,12,<=24]], [[756,16,<=34]] | ok x2 |
| bra24-lemma2 | B2 | thickness at most 2, §4 | Lemma 2 in §4: thickness <= 2, each layer degree 3; layers re-checked planar | ok |
| bpt10-bound | B2 | kd^2 = O(n), abstract | abstract prints kd^2 = O(n) for 2D (D-dimensional form is BE21, as B2 says) | ok |
| rof20-osdcs | B2 | 60, §V | "combination sweep search depth parameter lambda = 60", §V | ok (B2-14) |
| mul25-relay | B2 | beats BP+OSD-CS on BB codes, matches matching, abstract | abstract: outperforms BP+OSD+CS-10, "comparable to" matching, FPGA/ASIC | ok (B2-13) |

"Our calculation finds" boxes: none in B1 or B2 (Corrections are P1's). Related own-calculation values (kd^2/n, 14.08, 4.05e-10, 577/449) all reproduced.

## Known items

- B1 integer challenges at tolerance 0.5: confirmed, 10 (+1 at 0.005); B2: 11 (+1). The rule is not written in `conventions.md` (709 content uses 0 in 81 places, 0.5 in 45). B1-9, B2-7.
- Papers chapters named in words: confirmed, 1 in B1, 5 in B2; two target units lack rows. B1-10, B2-5.
- `b2MxOnes` = 34 is right: printed A_x has 17 ones (p. 47 image), two blocks give 34, and the engine agrees. The plan's 32 is wrong; B2 needs no change beyond B2-2.
- Kit03 and Den+02 DOIs: confirmed, caused by the new-style-only ARXIV regex. B1-15.

## Checked and right

Own teaching examples are labelled ours (target gamma, toy code in Formal, plain min-sum, the swapped-read cycle); the 96/16 schedule counts and hook weights 4,3,2,1 and 0,1,2,1 are correct; B1 beats' bridges land on the right units; the Table 5 round order in b2-gross:b4 matches the printed table entry for entry; both polynomial forms match paper p. 43 and p. 45; ratios 14.08 and 6 to 13.5 are correct.

## R fixes (2026-10-15)

Every item is fixed in one of two commits: B1 items in `a47caa4`, B2 items in `8e34ed7`. Checks: papers, content, claims and symbols vitest green, `tsc -b` clean, `meta.test.ts` writes nothing, `story.spec.ts -g "B1|B2"` (4) and `papers.spec.ts` (10) green on the preview build. No engine value moved, so no twin or fixture changed.

| Item | Commit | How it was fixed |
|---|---|---|
| B1-1 | a47caa4 | p* is "the threshold of the fitted circuit noise" in the beat, glossary entry, review trap and pitfall; the traps now read "treating p* as the threshold for every noise model"; b3 says Den+02's numbers are for simpler noise models; vote-curve captions say the marks are the surface code's. |
| B1-2 | a47caa4 | "Two papers give three formulas"; Ground names the A.10 form and Bev+22's (3.16 apart at d = 17); claim and review point reworded. |
| B1-3 | a47caa4 | `fow12` is now `read` (Section VII, Eqs. 10 and 11, Fig. 4); new reported `fow12-eq11` (0.03 (p/p_th)^((d+1)/2), p_th = 0.57 %); Formal says Bev+22 repeats the exponent and the paper's d/2 is its own approximation. Eq. 10 prints d/2 only for even d. |
| B1-4 | a47caa4 | "We take each step as one round, a simplification of ours" in Ground and Formal of b5 and in the derivation's first step; Lit19a's d rounds per Pauli measurement noted. |
| B1-5 | a47caa4 | `hor12-13` location is `section 7.1`. |
| B1-6 | a47caa4 | Clash defined as a qubit asked twice in one step; the parity failure is "the wrong order"; caption and claim text follow. |
| B1-7 | a47caa4 | "A flipped readout makes one check look wrong for one round." |
| B1-8 | a47caa4 | "For any odd distance d". |
| B1-9 | a47caa4 | Ten `0.5` and `b1-h-lambda` (`0.005`) are tolerance 0; the validator accepts 0 (negative still refused), with a test. |
| B1-10 | a47caa4 | Q22 mentions link `pp-q22-css`, `pp-q22-check-matrix`, `pp-q22-clifford`; Chapter B2 links the new row `pp-b2-ldpc`. The Q21 mentions and the lookup decoder stay in words (no rows). |
| B1-11 | a47caa4 | The Ground derivation's third step uses the `tdg-A10` preset. |
| B1-12 to B1-14 | a47caa4 | "the same target as the paper's A.10"; `where` names §2.2 p. 10 Fig. 4a and §2.6 p. 15; captions say the marks are the surface code's. |
| B1-15 | a47caa4 | `ARXIV` in `validate.ts` and `links.ts` accepts old-style ids; `kit03` and `den02` gain `quant-ph/9707021` and `quant-ph/0110143` (DOIs kept), with a test. |
| B2-1 | 8e34ed7 | Cites the paper's A.2 (p. 47) in Ground and Formal; Formal and the beat's trail say Bra+24 §9.2 calls every non-identity shift nontrivial, and the paper and our computation find x^6 trivial (§9.2 confirmed on its p. 25). |
| B2-2 | 8e34ed7 | Both tracks and the Formal caption say the paper prints the same block twice and our table has its transpose below, linked to `pp-p1-idle-shift` (new row). |
| B2-3 | 8e34ed7 | "Panteleev and Kalachev's asymptotically good codes only as outlook". |
| B2-4 | 8e34ed7 | Claim "a lone cycle takes 9 steps, which is 8C+1 at C = 1"; Ground and Formal explain the +1 (Z check initialisation at step 0, paper p. 10). |
| B2-5 | 8e34ed7 | Five mentions of Chapter B1 link the new row `pp-b1-toric`. |
| B2-6 | 8e34ed7 | b2-polynomials:b1 Ground defines the l-by-m torus (l = 12, m = 6); `symbols` for l and m now point to b1. |
| B2-7 | 8e34ed7 | Eleven `0.5` and `b2-b-surface` (`0.005`) are tolerance 0. |
| B2-8 | 8e34ed7 | New `pipeline/check_bb_planarity.py` (networkx; 12 pieces of 24 nodes and 6 of 48, all planar, degree 3, 432 edges per layer); the beat points to it. |
| B2-9, B2-10 | 8e34ed7 | `bra24` why credits the paper's section 2.1 attribution; `reliedOn` adds Definition 1 and Lemma 4. |
| B2-11 | 8e34ed7 | Try-it text and insights of b2-bpt no longer use "BB codes" before its tagged first use. |
| B2-12 | 8e34ed7 | Rof+20 Appendix C, Algorithm 1 named: "plain min-sum with no scaling" kept, "could not be read" dropped (also in `rof20` why and `reliedOn`). |
| B2-13 | 8e34ed7 | "comparable to" matching; "a chip can host it" replaced by the abstract's "lightweight" and FPGA or ASIC mention. |
| B2-14 | 8e34ed7 | "search depth set to 60". |
| B2-15 | 8e34ed7 | Ground labels the toy code as our own example; `P-B2-story.md` now says 34 ones. |

Left alone: the Q21 mentions in B1 (no bridge rows for Q21 units), and the rule "integer challenges take tolerance 0" is still not written in `conventions.md`.
