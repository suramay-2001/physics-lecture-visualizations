# Papers P2 (GANDALF) independent truth review (P, read-only), 2026-11-23

Scope: `app/src/content/papers/P2.paper.ts` and glossary, `physics/readout/gandalf.ts`, `papers/corrections.ts` (E2), `pipeline/claims_papers/p2.py`, recipes. Checked against rulings `gandalf-batch.md` (G1-G4), `papers.md`, `papers-P1.md`, the paper text and page images p1, p9-p13 (viewed), the saved references and the research report. No builds, servers or Playwright were run. Paper and references are paraphrased only.

## Verdict: FIX-FIRST

Two blocking items (a false statement about the paper, a false licence line), five should-fix items, nits. The arithmetic, E2, E1 and the printed values are sound. Every blocking item is a one-line text fix.

Evidence: about 90 recomputed numbers with an independent numpy/scipy script (scratchpad `rev_p2.py`: Eqs. 4-5, the Fig. 15 read-back, all ratios, parameter counts, Tables 3-5, the post-selection toy, the Pauli-twirl formula, the toy U-curve and ratio claims): all agree with the displayed values. 7-word overlap sweep against the paper and the research notes: no shared 7-word run of prose (hits were number lists and a title string). The spec holds one clue and no graded challenges, so there are no challenge tolerances to check; the `ch.*` fixture keys are engine checks and recompute correctly (enc3 = 294912, 4(1-0.621) = 1.516, 128000/12711.4 = 10.07, Eq. 5 = 301.5, saving 39.5, t_c = 0.5).

## Blocking

**B1. p2-logical:b4 says both printed gains are "at the shortest times"; the 5x is at 4 ms** (P2.paper.ts:4126-4127). Beat b3 of the same unit correctly says 5x is measured at 4 ms (§7.2, pp. 12-13) and up to 35.8x at 1.5 ms. Fix: "Both gains are against CNN(Site) at the shorter readout times (4 ms and 1.5 ms), where reading error rather than idling still matters." (The claim p2RatioGrows toy is unaffected.) Optionally add that the surface-code bars of Fig. 14 are, by our eye, much further apart at 1.5 ms than at 4 ms, so the abstract's 5x understates that; the research report reads the same (graphical, about 30 % uncertainty), so keep it out of the numbers.

**B2. The licence line is wrong** (P2.paper.ts:34). The arXiv abstract page for 2510.25982 shows CC BY 4.0, not the arXiv non-exclusive licence (checked on arxiv.org/abs/2510.25982; v1 29 Oct 2025, v2 4 Dec 2025, so `date: 2025-12` is right for v2). Fix: "CC BY 4.0 (as shown on the arXiv page). This lecture still paraphrases and cites by section, page, figure or table, and republishes no figure; attribution: Mude et al., arXiv:2510.25982v2." Other card fields are right: authors (six, in print order), arXiv 2510.25982 v2, institution with Saffman's Infleqtion affiliation (p. 1 image).

## Should-fix

**S1. E2 wording hedge** (P2.paper.ts:4591). "The ratio 0.19 / 0.152 = 1.25 is not the 1.77 of the same paragraph" reads as a contradiction, but the paragraph's 1.77 is against the pipelined baseline while the 0.19 s is "the baseline" (unspecified). Fix: "...is not the 1.77 of the same paragraph, though that is measured against the pipelined baseline, so the two need not agree." Also add: our model's pipelined baseline at 1.5 ms is 151.5 ms, which also rounds to 0.152 s, so the 0.152 s does not tell the readers which schedule it is. (Both numbers are already in beat p2-pipeline:b5.)

**S2. Reference rows bar25 and geh25 say "cited"** (P2.paper.ts:129, 139). The research notes read both from the saved PDFs (Baranes pp. 7-8; Gehér abstract, p. 5, Table I), the plan's §12 table says "read", and B6 lists both as read and taught in `b6-loss-reset`. Fix: status "read", reliedOn as above, `taughtIn` B6 `b6-loss-reset`. Likewise tom14 (line 96) gets `taughtIn` B6 `b6-twirl` (its `why` already says B6 teaches the twirl). ken25 (line 79) reliedOn "abstract and the filter equations" understates the notes (Eqs. 1-5, Tables I-II): "Eqs. 1-5 and Tables I-II".

**S3. gid25 is mis-located** (P2.paper.ts:670 trail, and the reference row). The trail says "the run-time example in the paper's introduction"; the paper cites [14] only for the T-gate bullet under Eq. 1 (§2.3, p. 4), and has no run-time example. Fix: "the T-gate bullet under Eq. 1, §2.3, p. 4".

**S4. "(our fit to Fig. 15, labelled)" is attached to inputs that are not that fit** (P2.paper.ts:3051). The totals 341.0 and 301.5 ms come from t_r = 3 ms, t_den = 0.1, t_c = 0.4 (sum 0.5, not the G3 default 0.1), and match no bar. Fix: say "illustrative inputs of ours (t_g = 10 µs, t_r = 3 ms, t_den = 0.1 ms, t_c = 0.4 ms)"; keep "our fit to Fig. 15" only for t_g = 10 µs and t_den + t_c = 0.1 ms in the read-back beats (b3, b4, b5), where it is true: with them GANDALF's 1.5 ms row reproduces the printed 151.1 exactly.

**S5. Fig. 15 axis label.** The printed y-axis reads "QEC cycle time (ms)" while the caption describes a 100-round total (image p13). The spec states the total correctly but never notes the label. Add one neutral clause to p2-pipeline:b3 ("the axis is labelled cycle time; the caption and the values say 100-round totals").

## Nits

- f14-5x (P2.paper.ts:4100): the 5x sentence starts at the foot of p. 12 and ends on p. 13; give `page` 12 or "pp. 12-13" (35.8x is p. 13, correct).
- Paper says 1.77; 321.5/181.1 = 1.7753 rounds to 1.78, so the paper truncated. b4/trust show 1.775, which is right; one clause "(printed as 1.77)" avoids a reader's doubt.
- win23: the notes read the abstract (arXiv 2304.14360), so "read only as a citation" could say "abstract only"; add the arXiv id.
- Fig. 15's text view (recipe `fig15-readback`, view text) places the 0.19 s and 0.152 s points at tolerance 3; the 3 % placement is our inference (1.5 ms with t_den + t_c = 0.1 reproduces 151.1), and the caption says so; fine, but "the text's numbers are placed by us" would be cleaner.
- The p. 11 500 µs is the paper's multi-site CNN time for 3x3; b3's "consistency check that passes" assumes Fig. 15's baseline is that classifier; add "if".

## Corrections re-verified

**E2 (CONFIRMED, with S1).** Page 13 image: Fig. 15(a) bars 451.0/401.5, 371.0/321.5, 271.0/221.5; (b) 401.5/291.1, 321.5/181.1, 221.5/151.1; §7.3 text gives 0.19 s with the baseline and 0.152 s with GANDALF and pipelining, "at the shortest readout time of 1.5 ms". No bar is 190 ms; nearest is 181.1, 8.9 ms away (221.5 is 31.5, 151.1 is 38.9). 0.19/0.152 = 1.25 exactly. The plotted 2 % pair gives 321.5/181.1 = 1.7753 and is the largest of the three pair ratios (1.379, 1.775, 1.466), so the "up to 1.77" is explained. Engine check `p2TextGap190` tests gap 8.9, ratio 1.25 and pair ratio 1.775 from the printed bars through `fig15-readback`; it fails if a printed input changes. Wording is a text-versus-figure mismatch, in the P1 E7 table style ("Comparing the tables, we find", which is right here since no calculation is hidden; G4's "our calculation finds" also fits the ratio line). Tone is neutral; the trust unit adds "a different comparison we cannot see may explain it". Nothing overstates beyond S1. Location 7.3, p. 13 is correct; `says` is a faithful paraphrase.

**E1 (CONFIRMED neutral note, not a Correction).** §7.1 on the p12 image prints GANDALF 2.9 ms (5 µm) and 3.2 ms (9 µm) against 3.6 and 4 ms; 3.6/2.9 = 1.2414 and 4/3.2 = 1.25; the abstract's "up to 1.6x" is on p. 1. The spec words it as "the paper does not print the comparison behind 1.6" with engine claims p2CrossRatio5/9; it is not in `corrections` (only E2 is). G4 satisfied.

## Checked and right

1. Reported values, on the image: Table 1 (p. 1), Table 6 and Eqs. 4-5 (p. 11), Table 3, Table 4, Table 5 and Fig. 9 (p. 10, p. 9; the bar-to-label order MF-NN/CNN/FNN is right in all three panels), Fig. 15 (p. 13), the §7.1 numbers and Fig. 12/14 captions (p. 12). Text-only values (Fig. 7 caption on p. 7, Table 2 on p. 8, §3.1/§6 counts, §4.2 training settings, §4.5 16.5x and 2.5x, abstract 1.6/35/1.77) match the text layer and the cited pages; the p. 7 and p. 8 images were not re-viewed (text layer; both labelled by section, which is what the spec does).
2. N1-N14 are neutral "as reported" notes, each accurate against the paper: N1 0.75 and 0.5 against 0.9996 and 0.936; N2 Table 1 against Table 6; N3 27000 "for each duration" (p. 11) against 27000 in all (p. 5); N4 equivalent exposure; N5 no Wiener baseline; N6 Table 2 prints one convolution per block (4,695,744 needs two); N7 2.5x against 2.8x; N8 16.5x against 17.75; N9 CNN-only baselines; N10 no kept fraction; N11 Table 3 0.201 ms against Table 4 2.174 ms (10.8x); N12 1.77 is the best of three; N13 no loss or reload simulated; N14 35 against 35.8. The duplicated [28]/[29] (one PRX Quantum 5, 030316 paper, pp. 14-15) is noted in the trust unit and the nor24 row, not corrected.
3. Computed numbers all recomputed: 2500 and 14.7; 1000x; sqrt(10); 3000x9; 4,695,744 / 2,926,272 / 1,549,376; 17.75, 3.58, 13.2; eta factors 2.56/2.64/2.95/2.78/2.13; 7.24 and ln 2; post-selection 0.8427 kept, 0.0016 kept error, 0.0228 plain; latency 166.6x, 12.56 and 8.18 µs per site, 1000/TP gap 0.0004, 10.07 ms; Eq. 4 341.0, Eq. 5 301.5, saving (d-1)t_c - t_den = 39.5; t_c = 0.5; t_r + t_g 4.01/3.21/2.21; GANDALF 2.91/1.81/1.51; ratios 1.38/1.775/1.47; equal-t_r 151.5 and 151.1. The toy U-curve has an interior minimum (about 3.2 ms for its inputs, labelled a toy, never presented as the paper's 4 ms), and the toy penalty ratio falls with t_r (298, 1.49, 1.00002). The Pauli-twirl formulas match a linear solve of the Bloch factors. Wiener 0.86 is B5's twin and was not re-derived here.
4. Both tracks agree throughout; every derivation has two views (the ground-up and formal lists use different views); Ground-up lengths are within the G6 limits in a spot check.
5. Bridges land on the right units: b6-cycle at b2, b6-pipelining at pipeline b2, b6-loss-reset at pipeline b6, b6-twirl and b6-ucurve at logical b1, b5-wiener at denoiser b2, b5-pix2pix at denoiser b1/b5, b5-matched-filter at classifiers b1/b4, o10-collect at bottleneck b3, o11-hist and q25-readout at results b6, b1-threshold at logical b2, q21/q25 prerequisites exist. Nothing re-teaches B5, B6 or O material; P2 links and states its own argument (G1).
6. The paper is described fairly: its contribution and its own limitations (imperfect dataset, one site and one run, no hallucination rate) are stated, and mismatches are described as statements about printed numbers.

## Fix pass

Paths: `app/src/content/papers/P2.paper.ts` unless stated.

- **B1** done: `p2-logical:b4` (both tracks) says the 5x is the surface code at 4 ms and the 35.8x the BB code at 1.5 ms (written 1500 µs so the number ledger needs no new claim); b3 already said so.
- **B2** done: card `licence` (line 34) and `paper-gdf` `license` in `pipeline/course.papers.json` now read CC BY 4.0 (as shown on the arXiv page), paraphrase and cite, no figure republished, attribution Mude et al., arXiv:2510.25982v2. No figure copied.
- **S1** done: E2 `shouldSay` (about line 4600) adds the hedge (1.77 is against the pipelined baseline, so the two need not agree) and that our pipelined baseline at 1.5 ms, 151.5 ms, also rounds to 0.152 s. E2 stays a Correction, E1 a neutral note.
- **S2** done: reference rows `bar25`, `geh25` now status read with `reliedOn` and `taughtIn` B6 `b6-loss-reset`; `tom14` `taughtIn` B6 `b6-twirl`; `ken25` reliedOn "Eqs. 1-5 and Tables I-II".
- **S3** done: `gid25` trail at "the T-gate bullet under Eq. 1, §2.3, p. 4".
- **S4** done: `p2-pipeline:b2` formal calls its totals illustrative inputs of ours (t_g 10 µs, t_r 3 ms, t_den 100 µs, t_c 400 µs); "our fit to Fig. 15" remains only in the read-back beats.
- **S5** done: `p2-pipeline:b3` (both tracks) notes the axis is labelled cycle time while the caption and values are 100-round totals.
- **Nits** done: `f14-5x` page 12; "(printed as 1.77)" in `p2-pipeline:b4` Ground-up; `win23` "abstract only (arXiv 2304.14360)"; the text-view caption says the text's numbers are placed by us; the 500 µs consistency check now carries "if Fig. 15's baseline is that classifier".
- **Challenges**: no change needed. The review found none, but the unit `play` lists hold the plan's eight (`p2-ch-params`, `-eta`, `-batch`, `-spot`, `-eq5`, `-saving`, `-tc`, `-idle`), engine-backed with `answerFrom` and the tolerances of the plan; nothing was added.
- Meta regenerated (`UPDATE_META=1`, twice, second run clean). Twin `pipeline/claims_papers/p2.py` rerun: fixtures byte-identical.
