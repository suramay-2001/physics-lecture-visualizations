# P-Q19 review: 709 Q19 "Walks, simulation and hybrid algorithms" (independent P truth review, lean)

Reviewer role P, 2026-10-26, read-only. No Playwright, no screenshots, no vitest run. Own numpy/scipy/sympy scripts only (scratchpad `rev/rq1-4.py`); the repo engine and the planner's script were not used.

## Verdict
**PASS with fixes** (0 blocking, 10 should-fix, 9 nits). Every number a learner sees was recomputed and is right. The slips are wording: three sentences state a result more widely than it is true (S1, S2, S3), one framing gap (S4, S5), and the Try-it lines break the sentence cap. S1 to S3 are false-as-worded by a hair and should go first.

## 1. Recomputation (R12), my own code
| Item | My result | Chapter says | OK |
|---|---|---|---|
| r, t from unitarity (sympy solve of 7.46, 7.47) | r = (n-2)/n, t = 2/n only | same; n = 8: 0.75, 0.25 | yes |
| Full 16x16 star walk (N = 8) built vertex by vertex, orthogonal | gap 0; 4x4 table matches full U on the 4 states to 3e-16 | table 7.53, 0.6614 | yes |
| 4-dim table charpoly, eigenangles | x^4 - 1.5x^2 + 1; angles ±20.705, ±159.295 deg; Bergou value arcsin(Delta) 20.257 | same | yes |
| Star, leaving start, N = 8 | P(0..13) = .125 .125 .781 .781 .945 .945 .330 .330 .012 .012 .548 .548 .9998 .9998; amps ±0.9723 (n = 4, 5) | same | yes |
| Star, arriving start, N = 8 | one step behind: P(4) = 0.781, peak 0.9453 at step 5 | step 5, 0.9453, 0.781 | yes |
| Walk = Grover(floor(n/2)) | max gap 1.5e-15 for N = 4, 8, 16 and also N = 3, 5, 6, 7, 12, 32, 64, 100 (n <= 60) | "exactly", N = 4, 8, 16, n <= 30 | CONFIRMED (the stated range is conservative) |
| First star peak N = 16, 64, 1024 | 6 (0.9613), 12, 50 (0.99946); classical (N+1)/2 = 512.5 | 6, 12, 50, 512.5 | yes |
| Extra edge: 18/130/2050 states, orthogonal; 5x5 table vs full U; quintic and quartic | gaps ~1e-15; roots -0.9895 ± 0.1445i (N = 64), Delta = 2/sqrt(3N) = 0.1443 | same | yes |
| Extra edge, minus start | N = 64: 0.7002 at 11, edge 0.2928; N = 8: 0.625 at 3; N = 1024: highest of first swing 44 (0.678); pi/2Delta = 10.88, 43.53; weights (7.79) 1/3, 1/3, 1/3 | same | yes (see S2 on "first") |
| Extra edge, plus start, N = 64 | max 0.0829 (n <= 40), 0.0587 edge; 0.0835 for n <= 3000 | 0.0829, 0.0587 | yes (see S1) |
| Trotter, 3 spins, J = 1, t = 2 (scipy expm, spectral norm) | ‖[H1,H2]‖ = 0.43301; errors M = 1, 4, 8, 14, 15: 0.7327, 0.1825, 0.0911, 0.0521, 0.0486; ratio M = 4 to 8 **2.0024**, M = 1 to 2 2.0000; bound at 8 = 0.1083; either ordering gives the same errors | same ("2.00") | yes |
| Second order | M = 3, 4: 0.02460, 0.01383; ratio 4 to 8 = 4.0036; least M < 0.05 is 3 | same | yes |
| Magnon on 3 spins | exact (0.38963, 0.44222, 0.16815); spin 3 for M = 1, 4, 8: 0.50137, 0.23945, 0.20274 | same | yes |
| Bond gate | e^{-iJt/4}[cos(Jt/2) I + i sin(Jt/2) SWAP] vs expm gap 1e-16; Jt = pi swaps with chance 1 | same | yes |
| QAOA, 4-cycle | cut histogram [2,0,12,0,2], mean 2; F = 2 + sin4b sin2g at 3 random points to 1e-15; grid best 3.0 at (45, 22.5) deg; P(4) = 17/32, each of 0101/1010 0.265625, P(2) = 0.4375, P(0) = 1/32 | same | yes |
| Classical loop | pattern search (+g, -g, +b, -b; first best wins; halve; stop < 0.01): 7 moves, 49 evaluations (initial counted), F 2.4050 to 2.9998 at (0.7875, 0.3875) | same | yes |
| Runs for confidence 0.9 | ceil(ln0.1/ln(1-p)): 4 (p = 17/32), 18 (p = 1/8); challenge walkthrough 0.1030 (m = 3), 0.0483 (m = 4) | same | yes |
| Coin walk (Hadamard, (|0>+i|1>)/sqrt2) | sigma(3, 10, 100) = 1.732, 5.4729, 54.124; sigma/n = 0.5412 limit sqrt(1-1/sqrt2); 3-step chances 1/8, 3/8, 3/8, 1/8 | same | yes (ballistic, not sqrt t) |
| Path hitting N = 10 (linear solve) | 81 | 81 | yes |
| 2^50, 18.0 PB at 16 B; 252/1024; 2N^3 = 2000; 2^-5 | 1.1259e15, 18.014, 0.24609, 2000, 0.03125 | same | yes |

All 18 challenge answers and hints recomputed (0.375, 10, 432, 0.4, -0.6, r = 0 t = 1, 14.478 deg, 0.945, 12, 0.144, 0.667, sign fails, 1048576, pi, divide by 4, 2, 0.531, 4): all right. Derivations D1 to D5: every step true, every `why` fair, last step ends on the result (D4's bound is a standard rigorous one: M·(t/M)^2/2·‖[A,B]‖, holds numerically).

## 2. Findings
### Blocking: none.
### Should-fix
| # | Where | Problem | Exact fix |
|---|---|---|---|
| S1 | `Q19.story.ts:558` (text), `:563` (caption G), `:564` (captionFormal); `Q19.ts:383` (why) | "never on spokes 1 and 2 with more than 0.083" and caption "plus (flat, below 0.08)": the 0.0829 maximum is **above** 0.08, and the longer-time maximum is 0.0835 (n <= 3000); the bound holds only for n <= 40 | text: "In the first 40 steps at N = 64 the walker is never ... more than 0.083"; caption G: "plus (flat, at most 0.083)"; captionFormal "stays below" to "stays at most"; `why`: "within 40 steps ... never exceeds" |
| S2 | `:582` formal, `:587` claim, `:584`, `:586` captions, review card `Q19.review.ts:97` | "first peak is at step 44" (N = 1024) is the **highest peak of the first swing** (engine `extraWalkPeak` = argmax for n <= ceil(pi/Delta)); the first local maximum is n = 36 (N = 1024) and n = 9 (N = 64) | say "the highest peak of the first swing (n <= pi/Delta)"; claim sentence likewise |
| S3 | `:390` caption G/F, `:386-388` | caption says "peak 0.945 at 4 and 5" but the plotted curve (x 0 to 14, `starWalkMarked8`) reaches 0.9998 at n = 12, 13 | "first peak 0.945 at 4 and 5; the curve returns to 0.9998 at 12 and 13", or shorten the plot to x 0 to 10 |
| S4 | `:450` (reveal G), `:453` (F), `:580` | "the walk gives a square-root speed-up" next to a proof that the walk **is** Grover (b4): no gain over Grover; "50 steps" holds 25 oracle sign flips against "512.5 checks" | add (<= 25 words): "The same speed-up as Grover's search, not a further one." Extra-edge b5: "steps against list entries, as in Bergou p. 139" |
| S5 | `Q19.story.ts:962-965` (qaoa:b6 G and F) | "4 runs ... against 18 for a random guess" omits the 49 tuning evaluations (each many runs) the reader just met in b5; reads as an advantage on a 16-string toy | G: "This ignores the tuning, which costs far more runs, so there is no saving here." F: same in one clause; keep "open" sentence |
| S6 | `Q19.ts:161, 222, 285, 345, 411, 474` (Try-it lines) | six sentences of 26, 29, 29, 35, 29, 28 words; every other 709 chapter's Try-its stay <= 25 (Q16 to Q18 max 25); no test covers `tryThis` | split each at the colon or "and"; `Q19.tryits.test.tsx` quoted strings must change with them |
| S7 | `Q19.ts:162` (+10000 line), `Q19.tryits.test.tsx:118` | after "+100" then "+10000" the learner has 100 times the atoms, yet the line leans on the widget's generic "ten times more atoms ... three times tighter" | use "+1000" (1100 atoms is 11x more; sqrt 11 = 3.3) |
| S8 | `:655` ("Eq. 7.81; N&C p. 207"), `:710`, `Q19.review.ts:120`, `Q19.ts:417`, `Q19.glossary.ts:76` | N&C's O(dt^2) form is Eq. 4.103 on **p. 208**; p. 207 holds only the limit Thm 4.3 (4.98). The explicit bound t^2‖[H1,H2]‖/2M is in neither book: "gives the bound of Eq. 7.82" over-credits Bergou (7.82 is O(dt^2)) | cite "N&C Eq. 4.103, p. 208 (limit form Thm 4.3, p. 207)"; label the bound "our derivation (D4); Eq. 7.82 states O(dt^2)" |
| S9 | `:193` (scatter:b3 G), `:98` (random-walk:b3 G) | Ground uses `n` (edges at a vertex) in b3 with no definition (b2 G has none); b3 G uses `N` in "2N^3" two sentences before "N = 10 dots" | scatter:b2 G: "At a vertex with $n$ edges, ..."; random-walk:b3 G: "for $2N^3$ steps, $N$ the number of dots" |
| S10 | claim sentences `:401`, `:567-568`, `:772`, `:147`, `:662-663` | do not say what the key computes: `q19WalkIsGrover` "at every step pair" (add N = 4, 8, 16 and n <= 30); `q19ExtraPlus64`, `q19ExtraPlusEdge64` (no N = 64, no n <= 40); `q19Trot2Ratio` (add "from 4 to 8"); `q19Coin3Binomial` (symmetric start); `q19TrotErr1/8` (three-spin chain, J = 1, operator norm); `q19StarPeak8`, `q19StarN1024` (leaving start) | reword each sentence as listed |

### Nits
1. `:474` "the remark before the extra-edge search": the p. 137 remark follows Eq. 7.67, inside the extra-edge analysis. Say "(Bergou p. 137, after Eq. 7.67)".
2. `:453` "(N+1)/2 ... (Bergou p. 135)": the book says O(N); (N+1)/2 is the chapter's arithmetic: "(Bergou p. 135 gives O(N))".
3. `Q19.glossary.ts:105` hybrid algorithm cites p. 142; the idea opens §7.8 on p. 141: "pp. 141 to 142".
4. Q16 and Q18 are never named (plan Ownership: Q18 at simulation:b1 for controlled powers of U = e^{-iHt}; Q16's uniform state in scatter:b4); one clause each would land the bridges.
5. `:921-925` qaoa:b5: Ground omits the first step 0.2 and the stop rule, and "49 evaluations" counts the starting point; add "(counting the start)".
6. `:598`, `Q19.ts` `Problem 7.1`: the page shows "1." in §7.9 (p. 142): "Problem 1 of §7.9 (P7.1)".
7. `qc-walk-graph-width` (misleading-reading note) sits on star-search b4, b6 and extra-edge:b3 only; star-search:b5 reveal (N = 16, step 6) and the D3 views also draw widths.
8. `scatter:b2` formal "The walk step U is the combined action of all the U_v" sits close to Bergou's p. 132 sentence (3 shared 4-grams); reword.
9. simulation:b2 G uses J, t and S with their definitions only in the glossary tooltip: say "coupling J" in b1 G.

## 3. Claim sentences, framing, teaching order
- **Claims:** read all 128 keyed claim sentences in `Q19.story.ts` (star-search 27 and qaoa 36 one by one against section 1), and the review-card claims. Only S10's are loose; the rest name the right N, step and start.
- **Framing:** coin walk is labelled "beyond the book" in both tracks (R1); N&C used for Trotter only (R8); VQE named once, Formal only (R7); "walk = Grover" and "exact alpha" are labelled "our calculation finds" and I **confirm both** (section 1); QAOA "open question / noisy ~100 qubits" matches p. 141 to 142; plus-start failure is Bergou's, with our numbers beside it. `walk-graph` draws only `starSpokeChances`, `cutValue`, `maxCut` (no typed number); layout (spoke 1 at top, clockwise) matches Fig. 7.7 on p. 132; fidelity exact/schematic/misleading rows are honest (see nit 7).
- **Order and caps:** my script over 420 story sentences (TeX = 1 word): 0 over cap (longest Ground 25, Formal 38, `Q19.story.ts:924`). Bridges land correctly: F5.1 probability, F4.4 unitary, 11.3 generator, 11.4 Schrödinger (checked against `bridges.ts`, `L11.ts`, `F4.ts`). All 13 glossary ids unique, no clashing term. Copyright: 0 shared 6-grams with Bergou §7.6 to 7.8 or N&C pp. 206 to 208 (5 shared 5-grams); no paragraph tracks Bergou sentence by sentence.
- **Try-it widgets:** props match the plan; readings quoted in `Q19.tryits.test.tsx` are the widgets' strings; the XOR 1111 and 0101 lines are right (b = left-rotation of a, so the ones are the cut sides).

## 4. Citation sample (28; PDF = printed + 10, page images viewed for p. 132, 135, 137, 142; the rest by header-checked text layer and equation labels)
| Cited | Page found | OK |
|---|---|---|
| §7.6 random walk, p(x;n), n = 2 values (p. 130) | printed 130 | yes |
| graph, 2N^3 test, 2^-m, edge states, 7.45 (p. 131) | 131 | yes |
| 7.46 to 7.49, star graph, Fig. 7.7 (p. 132) | 132 (image) | yes |
| 7.50 to 7.54, "you might suspect it will mimic Grover" (p. 133) | 133 | yes |
| 7.55 to 7.61 (p. 134); 7.62, 7.63, quadratic speed-up, Fig. 7.8 (p. 135, image) | 134, 135 | yes |
| 7.64 to 7.66 (p. 136); 7.67 to 7.73 and the plus-sign remark (p. 137, image) | 136, 137 | yes |
| 7.74 to 7.78 (p. 138); 7.79, 2/3 and 1/3, adjacency list O(N), mazes, element distinctness (p. 139) | 138, 139 | yes |
| §7.7, 7.80 to 7.82 (p. 140); §7.8 NISQ, MaxCut, 7.83, 7.84 (p. 141) | 140, 141 | yes |
| 7.85, 7.86, "quantum advantage ... active investigation", Problem 1 (p. 142, image) | 142 | yes |
| N&C Thm 4.3 / 4.98 | printed 207 | yes (S8: 4.103 is on 208) |
| N&C Eqs. 4.103, 4.104 | printed 208 | yes |
Bergou "p. 131" (2N^3), "p. 137" (remark), "p. 139" (adjacency list), "p. 140", "p. 141" (NISQ), "p. 142" (advantage), "p. 135" (O(N) classical) all match; the unit `pages` strings and `books[].where` match the table (pp. 130 to 142; N&C 206 to 208).

## 5. Checked and right
Five-dim subspace and starting-sign point (7.67 vs plus); exact angle and walk = Grover; 1/M Trotter law (ratio 2.00 from M = 4 to 8) and 1/M^2 (4.00); QAOA landscape and loop; coin walk linear spread; every `...Gap` is about 1e-15 and shown through `d(x, 0)`; N = spokes, hbar = 1, S = sigma/2 throughout; Rosetta line for N twice (scatter:b1, qaoa:b1).

## 6. For the judge
- Builder's language: "first peak" in the extra edge (S2) and "never" (S1) read as results for all time; the engine defines both over a window.
- S4/S5 are framing, not physics: say so in one line each; they are the only places a reader could take away "quantum beats classical or Grover".

## R fixes (fix agent, 2026-10-26)

Commits e37df92 (S1 to S5), a46905a (S6, S7), 4e616c0 (S8, nits 3 and 6), f66ed24 (S9, S10, nits 1, 2, 4, 5, 7, 8, 9). All 19 items fixed, none refused. No claim key added, removed or renamed; ten claim sentences reworded (keys and checks unchanged), so `claims_qc709/q19.py` and `q19.json` are untouched and byte-identical over two runs, and `UPDATE_META=1` changes nothing (no title moved). Tests are in `Q19.test.ts` (new "review fixes" blocks) and `Q19.tryits.test.tsx`; each asserts the new wording or window and fails on the old.

| Item | What changed | Proof |
|---|---|---|
| S1 | extra-edge:b4 text "Within 40 steps at N = 64 ... never ... more than 0.083" (24 words; the review's "In the first 40 steps" wording would be 26); caption G "flat, at most 0.083"; captionFormal "stays at most 0.0829 for n <= 40"; challenge `why` "Within 40 steps ..."; walkthrough "over 40 steps"; review card "in 40 steps". The bound is the computed maximum `q19ExtraPlus64` (0.0829); no new number | Q19.test.ts S1 |
| S2 | "highest peak of the first swing" (n <= pi/Delta) in extra-edge:b5 formal, reveal text, reveal formal, captions, the `q19ExtraPeak1024` claim sentence, and the review card | S2 |
| S3 | the review's second option: the star plot now ends at step 10 (PW8, x 0 to 10), so 0.945 is the highest value drawn; captions say "first peak" and "to step 10". No 0.9998 claim is needed | S3 (series maximum over 0..10 is q19StarP4, larger after 10) |
| S4 | star-search:b5 reveal G and F: "the same speed-up as Grover's search, not a further one"; extra-edge:b5 G and F: steps against list entries (Bergou p. 139) | S4 |
| S5 | qaoa:b6 G "This leaves out the tuning, which costs far more runs, so there is no saving here"; F "These counts leave out the 49 tuning evaluations, each many runs, so they show no saving"; the "open" sentence kept | S5 |
| S6 | the six over-long Try-it sentences split (colon, "and" or "so"); new lint: every Try-it sentence is at most 25 words | tryits "keep the sentence cap" |
| S7 | "Then press +1000, for 1100 atoms in all, about ten times more" (11 times, sqrt 11 = 3.3) | tryits S7 |
| S8 | N&C cited as "Eq. 4.103, p. 208, with the limit form on p. 207" (story, glossary; "Thm 4.3" avoided because the number reader takes it for the decimal 4.3); the bound t^2 ‖[H1,H2]‖ / 2M is "our derivation" (story formal, D4 step 3 why, review card, insightFormal); Eq. 7.82 is cited for the one-piece order O((dt)^2) only. Checked against the source text: 7.81 and 7.82 are both O((dt)^2) forms | S8 |
| S9 | scatter:b2 G "At a vertex with n edges"; random-walk:b3 G "N being the number of dots" | S9 |
| S10 | sentences of `q19WalkIsGrover` (N = 4, 8, 16, n <= 30), `q19ExtraPlus64` (N = 64, n <= 40; story and review), `q19ExtraPlusEdge64`, `q19Trot2Ratio` (4 to 8), `q19Coin3Binomial` (symmetric start), `q19TrotErr1` and `q19TrotErr8` (three-spin chain, J = 1, operator norm; also the review-card copy), `q19StarPeak8`, `q19StarN1024` (leaving start) | S10 |
| nit 1 | "(Bergou p. 137, in the remark after Eq. 7.67)" | nit 1 and 2 |
| nit 2 | "(our arithmetic; Bergou p. 135 gives O(N))" | nit 1 and 2 |
| nit 3 | glossary hybrid algorithm: "Bergou pp. 141 to 142" | nit 3 |
| nit 4 | scatter:b4 G "keeping Chapter Q16's uniform state fixed", F "uniform state of Chapter Q16"; simulation:b1 G and F name Chapter Q18's phase estimation | nit 4 |
| nit 5 | qaoa:b5 G adds the first step 0.2 and the stop rule; reveal G and F and the review point say the 49 evaluations count the start | nit 5 |
| nit 6 | "Problem 1 of §7.9" in the story, `pages` and `books[].where`; the parenthetical "(P7.1)" is dropped because the number reader takes P7.1 for the decimal 7.1 | nit 6 |
| nit 7 | `qc-walk-graph-width` added to star-search:b5 (picture and reveal). The "D3 views" sit inside star-search:b4, which already carries the note at beat level, so nothing more was needed there | nit 7 |
| nit 8 | scatter:b2 F: "One walk step U applies every U_v at once" | (wording) |
| nit 9 | simulation:b1 G: "with coupling J between neighbours" | nit 9 |

Gates: `npx tsc -b` 0 errors; `npx vitest run src/content src/physics --reporter=dot`: 128 files, 10167 passed, 1 skipped (as before), verbatim test running (0 offending literals); Q19.test.ts and Q19.tryits.test.tsx together 59 passed (was 42). Not run, by the brief: Playwright, the full suite, `graphify update .` (left to the merge gate).
