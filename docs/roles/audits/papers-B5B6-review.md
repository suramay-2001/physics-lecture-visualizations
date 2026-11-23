# Independent truth review: Papers B5 "From pixels to bits" and B6 "Readout in the error-correction cycle"

Reviewer: role P, read-only (skill 06). Scope: `B5.paper.ts`, `B6.paper.ts`, both glossaries, `physics/readout/classify.ts`, `physics/qec/timing.ts`, the twins `pipeline/claims_papers/b5.py` and `b6.py`, the bridges. Rulings: `docs/roles/decisions/gandalf-batch.md` G1 to G3.
Method: my own scripts (scratchpad `rev-b5.py`, `rev-b6.py`, `rev-len.py`, `rev-ovl.py`), written from the physics and not from the twins; sources read as page images or as extracted text. No build, server or browser was run, so the rendered beats were not looked at; the stage findings below come from the recipe and scene code.

## Verdict: FIX-FIRST

Four blocking items (one false definition, two false try-it sentences, one clue that prints its own answer). Every computed number, key and tolerance matched my recompute; every `reported` value matched its page; the overlap sweep is clean.

## Blocking

**S1. Cross-fidelity is defined without its "1 minus".**
- `B5.glossary.ts` entry `pp-fidelity-cf` (formal line 71) and `B5.paper.ts:2572` (`b5-cnn:b6` formal) say F_CF "averages" P(D_k|B_l) + P(B_k|D_l) over site pairs.
- Source: Phuttitarn Eq. 2 and Kent Eq. 4 (p. 3) both write F_CF = 1 minus that average; with no crosstalk the average is 1 and F_CF is 0. That is why the reported 0.0138 to 0.0428 (`phu-xfid`, `B5.paper.ts:773`) are small numbers that grow with crosstalk.
- As written, a reader gets the opposite scale, and a value near 0 contradicts the definition.
- Fix: "F_CF = 1 − average of P(D_k|B_l) + P(B_k|D_l); it is 0 when the two sites are independent and grows with crosstalk" (Ground-up gloss: "Zero when two sites do not affect each other; larger when errors travel together").

**S2. `b5-cnn` try-it says the opposite of the physics about a large background.**
- `B5.paper.ts:1996`: "Make the background large: the likelihood-ratio weights and the flat box come together".
- My numbers (σ 0.9, N 20): weight ratio centre/corner is 1.68 at b = 0.4, 2.48 at b = 4, 2.96 at b = 40, against a spot ratio of 3.05. For a large background ln(1 + s/b) tends to s/b, so the weights follow the Gaussian spot and the flat box gets worse (errors at b = 40: likelihood ratio 0.3233, Gaussian shape 0.3233, flat box 0.3349). The flat box comes close only when the signal is strong, that is a small background.
- This also contradicts the chapter's own `b5-matched-filter:b3` and the trap at line 1200.
- Fix: "Make the background small: the logarithm flattens the weights and the likelihood-ratio weights and the flat box come together. Make it large: they follow the spot instead." Delete "which is why a fitted filter can look like a plain box".

**S3. `b5-matched-filter` try-it says the exact error falls faster than the d′ estimate; it falls slower.**
- `B5.paper.ts:1141`: "watch the flat-box error fall much faster than the estimate from d′ suggests".
- The normal estimate Q(d′/2) at τ = 0.5, 1, 2 is 5.0e-4, 1.64e-6, 2.4e-11; the exact flat-box error is 3.30e-2, 4.57e-3, 1.24e-4. The estimate falls by a factor of about 300 then 70 000; the exact error by 7 then 37. The exact error is far above the estimate and falls more slowly (fat Poisson tails).
- Fix: "watch the flat-box error fall much more slowly than the estimate from d′ suggests, and stay far above it".

**S4. The `b6-pipelining:b5` clue stage prints both clue answers.**
- `B6.paper.ts:3168` to 3190: stage `pipeline-schedule`, d 7, g 0.02, r 0.5, c 0.2, no `view`. `recipes.b6.ts:~380` defaults to `view: 'both'` and `readouts: ['total','saving']`; `timelineReadouts` (`stage/svg/timeline.ts:127`) writes "one after another: 5.04 ms", "overlapped: 3.84 ms" and the saving 1.20 ms above the picture. The clue asks for exactly 5.04 and 3.84.
- Nothing in the player hides readouts in `clue` beats (grep of `Workbench.tsx`, `validate.ts`).
- Fix: give the clue stage `"view": "pipelined"` plus an empty readout, or the `vsC` plot (a scatter prints only a point count), and keep the two-row picture in the reveal.

## Should-fix

**N1. Isola strides are attributed to the paper; the paper prints stride 2 everywhere.**
- `B5.paper.ts:3405` (formal) and the claim at 3462: "five 4×4 layers (strides 2, 2, 2, 1, 1) see 70 pixels … as in Isola et al."
- Isola appendix 6.1 says every convolution uses stride 2 and downsamples by 2; the 70×70 size is printed (§4.4, Table 3) but all-stride-2 gives 94, and 70 needs the last two layers at stride 1 (their released code, not the paper).
- Fix: "the paper prints a 70 by 70 patch; that size follows if the last two layers use stride 1, as in the authors' released code, which is where the strides come from (the appendix text says stride 2)".
- Also `B5.paper.ts:3285`: the λ = 100 location says §4.1; it is in §4.2 ("Analysis of the objective function"). Fix: `"label": "4.2"`.
- `iso-patch` cites "Table 3": that table lists scores per patch size; the statement that the main experiments use 70×70 is §4.4 text. Cite §4.4.

**N2. Walkthrough numbers in three B5 challenges are wrong (the keys are right).**
- `b5-r-centre`, `B5.paper.ts:1014` and 1020: one-axis share at σ = 0.6 is 0.5953, not 0.5943; its square is 0.3544 (the key), not 0.3532.
- `b5-r-roi5`, line 1063: offsets 0, 1, 2 give 0.323, 0.233, 0.087, not "about 0.3, 0.24 and 0.06" (those add to 0.90, not the stated 0.963).
- `b5-r-dim`, lines 1111 to 1115: offset shares are 0.4215, 0.2415, 0.0451 (text: 0.43, 0.23, 0.05); the both-offset-2 pixel holds 0.0020, not "0.003". The count (4) is right.

**N3. "Crosstalk" window is one-dimensional but called the window around the atom beside a 3×3 ROI.**
- `B5.paper.ts:695` to 700 (and the `b5CrossFrac2/4` claims): 0.2892 and 0.0027 are the shares inside a strip three pixels wide (`windowShare`, other axis taken as fully inside).
- Against the 3×3 box used everywhere else the shares are 0.2616 and 0.0025. A learner comparing with "a 3 by 3 box holds 82 %" will get a different number.
- Fix: say "a strip three pixels wide across the neighbour", or switch the claim to the 2-D box value.

**N4. A trail attributes our own derivation to Kent.**
- `B5.paper.ts:1712` to 1713 (`ken25`, "the matched-filter discussion"): "The square-root growth of the separation with exposure is the reason longer readouts help". Kent says only that longer readout gives higher fidelity (§II.B); the square-root law is ours.
- The other Kent trails (lines 1239, 1700 to 1720) cite "the matched-filter section" and similar, with no section or equation. Per G3 give §, or cut.
- Fix: replace by "Kent §II.B: longer readout times give higher fidelity" and label the √τ law "our derivation"; give §III or Eq. 4 and 5 for the others.

**N5. Glossary and beat disagree on what a matched filter is.**
- `B5.glossary.ts` `pp-matched-filter` (formal): weights proportional to "template divided by the noise level" (s/b). The chapter calls the weights ln(1 + s/b) "a matched filter" (`b5-matched-filter:b2`, line ~1240), and its own numbers show s-proportional weights are worse than ln(1 + s/b) (0.487 % against 0.416 %).
- Fix: "weights that follow the template; for independent Poisson pixels exactly ln(1 + s/b), close to s/b only when the signal is weak".

**N6. Ground-up uses terms it never defines.**
- `b5-pix2pix:b6` (line 3790) Ground-up clue: "−ln D" and "log-likelihood ratio" (the Ground-up track never names the LLR; `pp-llr-weights` says "how much each pixel's count should count").
- `b5-matched-filter:b6` (line 1799): "Bayes error" and "Poisson" with no gloss (`pp-dprime`'s Ground-up line avoids them, this beat does not).
- Fix: give each a one-sentence Ground-up gloss at first use ("ln D: the natural logarithm; a score of 0.25 costs ln 4"; "the Bayes error: the fewest mistakes any rule could make on these pixels").

**N7. Near-copies of source sentences (6-word runs, under the 7-word limit but the same sentence).**
- `B6.paper.ts:3521` trail why: "information from delayed loss detection to correct loss errors even when the" against the Baranes abstract; the formal at 3506 repeats the same clause.
- `B6.paper.ts:1289` trail why: "the realistic threshold may be higher" against the Tomita abstract.
- Fix: reword, for example "Baranes et al. build a decoder that uses a late signal that an atom left, even if when it left is unknown", and "Tomita and Svore conclude that real devices may tolerate more noise than the twirled estimate".

**N8. The `b5-roi:b5` clue frame prints the ROI photon total.**
- Stage `pixel-frame`, σ 0.6, roi 3, readouts `['atoms','roi']`: `cameraFrame.ts:248` prints "ROI 3×3: 23.1 photons expected" (19.5 signal + 3.6 background). Subtracting the background gives 97.5 %, hence the clue's 0.0247 (the key's tolerance is wide enough to accept it).
- Fix: drop the `roi` readout in this beat's stage (the reveal can show it).
- Likewise `b6-cycle:b5` (line 641) prints the round total 2.11 ms, the clue's denominator; consider `readouts: []`.

## Nits

- **n1.** `b5-cnn:b2` (line 2065): "The total evidence per pixel, summed, is 33.9". 33.89 is q = Σ s²/(b + ps), a squared separation, not evidence; say "the squared separation q".
- **n2.** Two "d²" conventions appear: d′² = Σ s²/b = 86.6 (variance b, 3×3 box) in `b5-matched-filter` and d² = Σ s²/(b + ps) = 33.9 (mixture variance, 7-pixel strip) in `b5-wiener`. Both are computed correctly; name the variance in the second ("with the variance at an even prior").
- **n3.** `b5SigE` claim text (line 515) says 2.036; the value is 2.03550 and the Formal says 2.035. Use 2.035.
- **n4.** `phu-xfid` (line 773) omits that Tables III and IV are at 40 ms readout; add it.
- **n5.** `b5-cnn:b4` Ground-up writes 355202 with no separator, the Formal 355,202; the sentence-length checker counts "7.8 %" as two words, so `b5-matched-filter:b3` (26 tokens) and `b6-ucurve:b3` (27) are 22 and 23 numeral-words; no change needed unless the owner counts the symbols.
- **n6.** `b6-l-min`: "How many losses make the vote fail?" Seven known losses make it a coin flip, not a certain failure; add "make it fail half the time".
- **n7.** `b5-roi:b3` trail (line 685) says Kent's abstract covers "a Gaussian or square mask"; the abstract names only the Gaussian threshold (square mask is §II.B).
- **n8.** `b5-wiener:b4` formal: "By data processing" for composition of linear maps; call it "by composition".

## Checked and right

**Recomputed independently (every number the specs print, all agree with the spec to its printed digits and with the twins to 1e-9 or better):**
- PSF shares 0.17765 / 0.10177 / 0.05831; photons 3.553, 2.035, 1.166; ROI 3×3 0.81797 and 5×5 0.98908; 1 − box at σ 0.6, 1.2 = 0.02468, 0.37795; centre share at 0.6 = 0.35443; 5×5 at 1.2 = 0.92694; dim count 4.
- Weights ln(1 + s/b) = 2.2908, 1.8064, 1.3649; cut Σ s = 16.359; errors by brute-force joint enumeration: centre 0.078318, flat 0.0045694 (equals the Poisson-sum route), Gaussian 0.0048665, likelihood ratio 0.0041594 = Bayes 0.0041594; τ = 0.5 and 2: 0.031084, 9.459e-5 (flat 1.245e-4); d′² 86.590, normal 1.638e-6, ratio 2.00; one-pixel LLR 2.9589; clue 1.3863, 17, 3.
- Population filter (Cov(n)⁻¹Cov(n,a)) with and without a neighbour, signs and size match the spec to 3 digits; an independent 800 000-shot regression agrees (0.625, 1, 0.960, 0.412, −0.131, −0.229, −0.154); q 33.886, shrink 0.8944 (and Ws/s = 0.8944 at every pixel); d² raw = Wiener 33.886, blur-centre 29.192 (0.8615), crop-3 31.970, centre 15.398; kernel centre 0.5; clue 0.4286.
- CNN counts 355 202; receptive fields 7, 9, 70, 31; 4 640; generator 4 695 744 (and 2 926 272 with one convolution per block), from the paper's Table 2 layer list; λL1 7.24; −ln 0.5, −ln 0.2, −ln 0.25; 0.32508; posteriors 0.26894, 0.76803, flip 0.73106, ln 9, clue 0.35121.
- B6: twirl by two routes (closed form and Kraus to chi diagonal): p_X = p_Y 9.998e-5, p_Z 1.8960e-3, total 2.0960e-3, ratio 18.96, small-t ratio 0.99809, shrink 0.9996 and 0.99601; clues 2.19 % and 0.4975 %; challenges 4.509 % and 1.961 %. T₂ ≤ 2T₁ is exactly the range where p_Z ≥ 0 (the engine refuses larger T₂).
- U-curve (rb 6, rg 0.3, p_g 0.002, T₁ 10, T₂ 1): p_m 2.7144 %, 0.28249 %, 4.224e-5; p_eff 2.9669 %, 0.5874 %, 0.4138 %, 0.7225 % at 1, 2, 4, 10 ms; grid minimum 0.39060 % at 2.95 ms (continuous minimum 2.972 ms, 0.39050 %, so "on a grid of 50 µs" is honest); factor-of-two penalties 1.698 and 4.896; p_L 1.0654e-4 and 4.2671e-3; p_eff/p_th 2.967. All labelled "model, not data"; the 2.95 ms is never matched to the paper's 4 ms (G3 satisfied). A = 0.03, p_th = 0.01, exponent (d + 1)/2 are Beverland et al. appendix B, table 5 (p. 21).
- Vote: 2.998e-6, 9.985e-9, 3.49e-11, 4.600e-16, 1.707e-18, ratios 0.99933 … 0.99476 (brute-force sum); unequal rates e₆ 2.3003e-13, Maclaurin 4.7940e-13 (0.4798), exact 2.2780e-13; clue 0.104, 8, 16.
- Cycle: 0.99840, 0.83222, 0.78616, 0.90689, 0.94967, 0.90854, 0.45422; ratios 2500, 14.706, 2000, 1500.
- Pipelining: totals 27.72 / 22.72 (equal to the event simulation), 9.02 / 5.82, clue 5.04 / 3.84 / 7.52, challenge 12.69 / 9.49 / 14.51; break-even g + r. Eq. 5 is the generic total at c ≤ g + r.
- Loss: 241 atoms, 0.025257 per round, 0.27782 per 11 rounds, no-loss 0.75742, 39.59 rounds; clue 0.49, 0.97, erasure 6.4 (×10⁻⁶), 5.0 (×10⁻⁶), e^d/2 = 5.0e-11; 1 ms reload share 0.45422. Survival 99.98952 % is Manetsch p. 4 (also reviewed on the optics track).
- Challenge tolerances: 0.005 for decimals, 0 for integers, in every `play` item; every answer key equals my value.

**Reported values, each located on the page or in the extracted text:**

| Value | Location checked |
|---|---|
| Table 1: 400 ns and 1 ms; 34 ns and 500 ns; shares about 0.75 and 0.5 | paper p. 1 |
| Eq. 2 (cycle time sum) | paper p. 4 (text layer) |
| Table 6 typical durations | paper p. 11 |
| Eqs. 4 and 5 (both terms) | paper p. 11 |
| about 4 ms best readout at 9 µm | paper p. 12 (text layer) |
| λL1 = 200; label smoothing 0.9 and 0.1; Table 2 layer list | paper p. 8 (image) |
| 4.7 million parameters | paper p. 10 |
| mean L1 0.0362 at 4×4 | paper p. 10, Table 3 (image) |
| 355,202 and 74,782,034 | Phuttitarn Tables I and II |
| 0.0138 and 0.0428 | Phuttitarn §IV text and Tables III and IV |
| 3.5 % increase, two orders fewer parameters | Kent abstract |
| λ = 100 | Isola §4.2 (spec says §4.1, see N1) |
| 70×70 | Isola §4.4 and Table 3 |
| Eqs. 9 and 10 | Tomita and Svore p. 6 |
| about 100 ns, about 10^−2.5 ≈ 0.003 | Gehér abstract, p. 1 |

All else printed in the paper that the prose states is correct: no T₁, T₂ values, gate errors or classifier-to-circuit rule are printed (checked in text and in the §7.2 text); the paper's Eq. 4 has no t_denoise term while Fig. 11(b) includes denoising (B6 uses the generic c, which is fine); Tomita and Svore's "pessimistic" claim and Baranes' delayed-erasure decoder are as stated; Gehér's model is superconducting-inspired. The discriminator in Table 2 has four stride-2 layers (output shapes halve), so the 31-pixel figure is right, and "the table does not say whether the output is patchwise" is accurate (the final 1×1 layer gives one value).

**Other gates:**
- Overlap sweep against the paper and the saved references (7-word runs on spec and glossaries, TeX removed): 0 hits; 6-word runs: 8, listed in N7 (one is the reported crosstalk sentence).
- Sentence length: Ground-up ≤ 25 and Formal ≤ 40 words everywhere, apart from the numeral-counting artefacts in n5.
- Both tracks agree on every number and claim in each beat (compared pairwise); each derivation has Ground-up and Formal versions with a stage view per step, and the last step of each ends on the stated result (matched filter, learned filter, twirl, vote exponent, pipeline). The twirl derivation uses the Bloch transfer factors λ_x = 1 − 2(p_Y + p_Z) etc., which are correct. The "ln" in the matched-filter Ground-up derivation is introduced through the stage and the `pp-llr-weights` gloss; see N6 for the remaining terms.
- Bridges: every `<<…>>` id used by B5 and B6 are in `bridges.ts` and resolve to existing units (O9, O10, O11 ×4, Q13, Q21, Q25, F3, F5, B1 ×4, P2 ×3); each lands on the unit that teaches the named idea (checked by title).
- G1: B5 owns frames, weights, CNN, Wiener, pix2pix; B6 owns timing, twirl, U-curve, pipelining, loss and reset; the single-site histogram, the exposure trade and the loss rate are bridged to O10, O11 and O9, not re-taught; B6's `timing.ts` is the one place `pauliTwirl` lives.
- G3: no usage figures or assignment status in the specs; Gibbons' 720 nK and N_Γ do not appear.
