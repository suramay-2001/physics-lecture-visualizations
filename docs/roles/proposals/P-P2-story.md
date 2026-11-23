# P-P2-story — P2 "GANDALF: reading atoms faster by cleaning the picture first" (role P, Papers)

Proposal only; nothing under `app/` is touched. Format: `P-P1-story.md` (skill 03). Kind `'paper'`, one data-only spec `content/papers/P2.paper.ts` + `P2.glossary.ts`; registry row via `UPDATE_META=1`.
Phases `[L]` "The paper says", `[B]` "A reference adds", `[C]` clue, `[D]` deeper. Gates: ≥ 2 derivation views per track; one notation beat per new notation; R3 (computed vs reported); R5 (trail).

**Paper card.** Short title **GANDALF** (never the full title: R7). Authors Mude, Phuttitarn, Maurya, Sinha, Saffman, Tannu (Univ. Wisconsin–Madison; Saffman also Infleqtion). arXiv:2510.25982 **v2**, 4 Dec 2025 (`date: '2025-12'`), 13 pp. + references (p. 13–15); source id `paper-gdf`. Licence line: "arXiv non-exclusive licence: paraphrased and cited; no figure republished; every picture is redrawn from engine data or is a printed number marked Reported."
**Sources read** (paraphrased; printed page = PDF page): `sources/paper-gdf/text.md` pp. 1–13; the research report and notes (`fluorescence_detection`, `platform_scale`, `classifiers_denoising`, `qec_timing`). **Page images checked** (2026-11-23): pp. 1, 9, 10, 11, 12, 13 (Table 1, Table 2 text, Tables 3–6, Eqs. 4–5, Figs. 9, 11–15). Figs. 1–8 are not redrawn; only caption/text numbers from them are used (marked "text"). No file saved.

**Ownership** (link, never re-teach): **Experiment track** (709 `optics`, after O1–O6): MOT, molasses, tweezer loading, scattering rate, collection efficiency, exposure, recoil/depump limits, Poisson histograms, EMCCD, fidelity vs exposure, survival per image. **B5**: ROIs, PSF/crosstalk, likelihood-ratio and matched-filter weights, FNN/CNN classifiers, pix2pix, hallucination risk, the live linear/Wiener stand-in. **B6**: cycle composition, Pauli-twirl idle error (Tomita–Svore Eqs. 9–10), measurement error in the circuit model, p_L ≈ A(p/p_th)^((d+1)/2), the U-curve, generic pipelining, loss as a third outcome, reset vs no reset. Also B1 (surface code), Q21/Q22, Q25 (neutral-atom hardware). **P2 owns**: the paper's bottleneck argument (Tables 1, 6), the dual-path dataset, the GANDALF design (Table 2, loss, training), its classifiers (Fig. 9), results (Figs. 12–15, Tables 3–5), Eqs. 4–5 and the "what to trust" ledger.
Bridge ids below are written as `B5:<topic>`, `B6:<topic>`, `EX:<topic>`; the build resolves each to the real unit id (§11) and fails on a miss.

**Evidence.** `scratchpad/plan-p2-numpy.py` (numpy only): **67 checks, 0 failed**. Classes: **C** computed; **C←R** computed from printed inputs (the recipe says `uses`); **R** reported. **Conventions.** ms for times; d rounds; keys `p2…`, twins `pipeline/claims_papers/p2.py`; reported ids lower-case (`t1-gate-na`, `f15-unp-1`…); units `p2-<slug>`.
**Stage shorthand.** `tl(mode,…)` = NEW kind `timeline` · `cf(…)` = `camera-frame` (shared with B5, §9.2) · `pl(recipe,…)` = `plot` (series / points / bands) · `rp` = `plot` points with `status: 'reported'` · `bits` = existing.

## 0. Chapter map
**Driving question:** "Can a learned denoiser make atom readout fast enough for error correction, and how much of the claim can we check?"

| # | id | Title | Question | Paper | Link-backs |
|---|---|---|---|---|---|
| 1 | `p2-bottleneck` | Readout is the slow step | Why does reading atoms set the speed of error correction? | §1 p. 1, Table 1; §2.3 p. 4, Eqs. 1–2; Table 6 p. 11 | B6:cycle, EX:imaging, Q25 |
| 2 | `p2-dataset` | Two cameras, one array | What data tests a denoiser, and what does "1.5 ms" mean here? | §3 pp. 5–6, Figs. 3–5; §6 p. 11 | EX:histograms, B5:roi |
| 3 | `p2-denoiser` | Denoise first, classify second | What does GANDALF learn, and how is it trained? | §4 pp. 6–8, Figs. 6–7, Table 2 | B5:pix2pix, B5:wiener |
| 4 | `p2-classifiers` | Small classifiers on clean pictures | Which classifier follows the denoiser, and at what cost? | §4.5 p. 9, Figs. 8–9 | B5:matched-filter, B5:cnn |
| 5 | `p2-results` | Accuracy and scaling | How much faster can readout be, and does it scale? | §5.1–5.2, §7.1 pp. 9–12, Figs. 10, 12–13, Tables 3–5 | EX:fidelity-exposure |
| 6 | `p2-pipeline` | Hiding the classical work | How do Eqs. 4–5 take denoising off the critical path? | §5.3 pp. 10–11, Fig. 11; §7.3 p. 13, Fig. 15 | B6:pipelining, B6:loss-reset |
| 7 | `p2-logical` | From readout error to logical error | Why does readout time enter the logical error rate twice? | §7.2 pp. 12–13, Fig. 14 | B6:ucurve, B6:twirl, B1 |
| 8 | `p2-trust` | What to trust | Which claims survive our arithmetic, and which stay open? | whole paper; report "Where the numbers do not reconcile" | all |

**Outcomes:** state the bottleneck from Tables 1 and 6 · explain the dual-path dataset and why "1.5 ms" is an equivalent exposure · describe the GANDALF loss and architecture · compare FNN, MF+NN and CNN by η, size and time · apply Eqs. 4–5 and recover the classification time implied by Fig. 15 · explain the U-shaped logical-error curve and what Fig. 14 can and cannot support · list the numbers that do not reconcile. **Prerequisites:** B1, B5, B6, the experiment track, Q21/Q22/Q25. **Opener:** none (§10). Build order: after B5, B6 and the experiment track merge.

## 1. Story beats (G ≤ 25 words a sentence, F ≤ 40; every beat has both captions; gists below, full captions at build)
### Unit `p2-bottleneck` — Readout is the slow step
**b1 [L]** gates versus camera · Terms `pp-readout-bottleneck` · Trail `wint23` "Table 1 source" — neutral-atom column
- G: gates take microseconds or less; reading the atoms takes milliseconds. Every error-correction round needs a reading, so the slowest step sets the pace. · F: Table 1 (p. 1) sets a neutral-atom two-qubit gate and readout beside a superconducting machine; the readout-to-gate time ratio is about 2500 against about 15 (derived, claims `p2GapNA` `p2GapSC`). Stage `rp` two paired reported points per platform (log time axis). Reported `t1-gate-na`, `t1-ro-na`, `t1-gate-sc`, `t1-ro-sc`, `t1-frac-na`, `t1-frac-sc`. **N1.**
**b2 [L]** a run's time · Terms `pp-qec-cycle` · F: Eq. 1 multiplies T-gate count, d rounds and cycle time (p. 4); Eq. 2 splits a cycle into syndrome generation, readout and reset. A thousand-fold slower cycle makes a computation a thousand-fold longer: `p2RuntimeScale` 1000 (C, derived arithmetic; the RSA example is B6's). Stage `tl(cycle)` one bar of the three parts, widths from the learner's inputs. Bridges B6:cycle.
**b3 [L]** why the atoms are slow to read · Trail `fuh08`/EX · G: an atom scatters photons at a limited rate and the lens catches few. More light also heats it, so you wait longer instead. · F: the paper's argument (p. 1–3): photons collected = rate × collection × exposure; raising power is capped by heating and loss; so exposure rises. Quantities are taught in EX:imaging; here one claim `p2SnrSqrt` (SNR ∝ √τ, C) with the bright/dark Poisson picture from EX:histograms (`pl`).
**b4 [L]** beyond the cycle · F: fast readout also speeds atom loading and rearrangement, code start-up and the number of traps needed (p. 4). Reported as motivation, not tested. Table 6 (p. 11): one-time preparation, gates, imaging, classification as orders of magnitude (`t6-*`, strings as printed). **N2** Table 1 against Table 6.
**b5 [C]** clue: if a gate is 1000 times faster than a reading, what fraction of a cycle is reading? (`p2ReadFrac`: our calculation from Table 1: 0.9996; the paper prints about 0.75: **N1**).

### Unit `p2-dataset` — Two cameras, one array
**b1 [L]** the array · G: nine cesium atoms in a 3 by 3 square, two spacings, and a camera that sees fluorescence. · F: a 3×3 Cs array, 5 µm and 9 µm spacing → 28×28 and 32×32 px images (p. 11); data from the Phuttitarn et al. experiment [31]. Stage `cf(array, panels:1)` simulated (illustrative, labelled). Reported `ds-array`, `ds-px5`, `ds-px9`.
**b2 [L]** the trick of two paths · G: light from the same atoms goes to a bright path and a dim path. The bright image tells the truth; the dim one is the test. · F: primary path = full signal (long exposure, 15–100 ms, labels by thresholding); secondary path = signal reduced tenfold (equivalent 1.5–10 ms) (Fig. 3, p. 5; p. 11). `p2Atten` 15 → 1.5, 100 → 10 (C←R). Stage `cf(pair)` simulated at attenuation 10. Bridges EX:histograms.
**b3 [L]** counts and splits · F: 3000 readout images of 3×3 sites make 27000 single-site images (`p2Sites` = 3000 × 9, C←R; p. 5); the split is 65 / 15 / 20 % (`p2Split` sums to 100). **N3**: p. 11 says the 27000 holds "for each duration"; 14 durations × 27000 = 378000 would not match p. 5.
**b4 [L]** why the dim path is only "like" a short exposure · F (the honest beat): attenuating a long image keeps its photon statistics from the long exposure; an actually timed 1.5 ms exposure differs in atom motion and depumping (EX:depump). So the paper's "1.5 ms" stands for a tenfold-dimmed long exposure; nobody ran a 1.5 ms exposure (report: Sec. 3.1). Reported-with-note only. **N4.**
**b5 [L]** what a threshold sees · F: Figs. 4–5 (text): at short exposure the bright and dark histograms overlap; long exposure separates them. `pl` Poisson overlap vs exposure from EX (illustrative parameters, labelled not the dataset). Reported `f7-q-noden`=~15 %, `f7-q-den`=~4 % deferred to p2-denoiser.

### Unit `p2-denoiser` — Denoise first, classify second
**b1 [L]** the idea · G: first clean the picture, then decide bright or dark. The clean-up is learned from pairs of dim and bright pictures. · F: the paper splits signal recovery from classification (p. 2): a conditional GAN maps short exposure to the long-exposure image, after which a light classifier decides. Stage `cf(triptych)`: noisy, **linear** denoised (B5:wiener, live) and clean, all simulated; caption "stand-in: the paper's network is not run here". Bridges B5:pix2pix.
**b2 [L]** why plain smoothing fails · F: Gaussian, median and Wiener filtering blur at low photon counts (p. 6); we show it live with the B5 linear filter against the sharp truth. Claim `p2WienerGain` (C): a linear filter feeding a linear decision cannot beat the best linear decision on the raw pixels (B5 shows it). **N5** states that the paper never tests Wiener.
**b3 [L]** the two-part loss · Terms `pp-l1-gan-loss` · Notation beat `L_G = L_GAN + λ‖G(x)−y‖₁` · G: one term asks the picture to look real, the other asks every pixel to match the bright image; the second is weighted 200 times. · F: λ_L1 = 200 (p. 8), the pix2pix objective [19]; Adam β₁ = 0.5, β₂ = 0.999, rate 0.0002, batch 16, 30 epochs (reported `d-adam`, `d-lr`, `d-batch`, `d-epochs`, `d-lambda`). Stage `pl` 1-D toy: L1-only blurs a step, adding an adversarial term sharpens (toy network, labelled).
**b4 [L]** the network · F: Table 2 (p. 8): encoder 64→128→256, three residual blocks, decoder with skips; discriminator four stride-2 convolutions. Our calculation from the printed filter shapes: **4,695,744** weights if each block holds two 3×3 convolutions (the printed "4.7 M", p. 10), 2,926,272 if one; discriminator 1,549,376 (`p2GenParams2`, `p2GenParams1`, `p2DiscParams`, C←R). Stage `pl` points of per-layer weights (computed from the printed shapes). **N6.**
**b5 [L]** guarding against fakes · F: failure modes: hallucinated or erased sites, mode collapse (p. 8). Remedies: label smoothing to 0.9/0.1, fewer discriminator updates, discriminator dropout, cosine annealing, early stop on validation L1. Bridges B5:hallucination. Reported `d-smooth`.
**b6 [L]** what denoising bought, as printed · F: Fig. 7 (caption, p. 7): about 15 % of a site's images land in the wrong quadrant without denoising, about 4 % with it (`f7-mis-before`, `f7-mis-after`); text only, one site, one run. `p2MisRatio` = 15/4 = 3.75 (C←R, with "about" noted).

### Unit `p2-classifiers` — Small classifiers on clean pictures
**b1 [L]** three heads · F: FNN and MF+NN take a flattened patch around one site; the CNN takes the 2-D patch; one model per site (p. 9, Fig. 8). Stage `cf(site-patch)` with the flatten step, simulated.
**b2 [L]** what "η" measures · Notation beat `η = 1 − δ_method/δ_CNN(Site)` · G: η says what share of the baseline's errors disappears. · F: relative infidelity reduction against the CNN(Site) baseline (p. 9). Engine `p2EtaFactor(η) = 1/(1−η)`: 60.9 % → 2.56×, 62.1 % → 2.64×, 66.1 % → 2.95×; 64 % → 2.78×, 53 % → 2.13× (C). Reported `f9-eta-mf` 60.9, `f9-eta-cnn` 62.1, `f9-eta-fnn` 66.1 (Fig. 9, p. 9; bar labels, image checked). **N7** (2.5× vs 2.8×).
**b3 [L]** size and time · F: Fig. 9 parameters in units of 100 K: MF-NN 0.2, CNN 1.6, FNN 12.7; inference in µs: 11.2, 21.9, 16.2 (reported `f9-par-*`, `f9-inf-*`). Our calculation: against the baseline's 355 k (p. 6) the MF-NN is 17.75× smaller, the FNN 3.6× larger (`p2ParRatioMF`, `p2ParRatioFNN`); text says "up to 16.5×". The denoiser's 4.7 M is 13.2× the baseline (`p2DenoiserRatio`) and is not in Fig. 9. **N8.**
**b4 [L]** an honest comparison · F: a matched filter is itself a pixel-weighted total, so the strong classical alternative is not the CNN the paper compares with (report; B5:matched-filter, Kent et al. [20]). The paper itself notes MF+NN matches the FNN with fewer parameters. Live: B5's likelihood-ratio filter on simulated frames `cf` + `pl`. `[B]` Trail `ken25` "matched-filter results". **N9.**

### Unit `p2-results` — Accuracy and scaling
**b1 [L]** inaccuracy against exposure · F: Fig. 12 (p. 12) gives curves, not numbers. We redraw only the printed crossings: below 1 % error up to 2.9 ms (5 µm) and 3.2 ms (9 µm) where the baseline reaches that level at 3.6 ms and 4 ms (`f12-x-*`). Stage `rp` four reported points on a ms axis, no curve. `p2CrossRatio5` 3.6/2.9 = 1.24, `p2CrossRatio9` 4/3.2 = 1.25 (C←R). **E1.**
**b2 [L]** the headline factors · F: 2.8× lower error at 1.5 ms (pp. 2, 12), "up to 2.5×" (abstract, p. 9), η ≈ 64 % (5 µm) and ≈ 53 % (9 µm) averaged. Printed as reported; the η factors (2.78×, 2.13×) are engine values. **N7.**
**b3 [L]** a data cleaner than the data · F: confidence-based post-selection with a two-component Gaussian mixture keeps below 1 % even at 1.5 ms (Fig. 13, p. 12), by discarding uncertain images. Stage: mixture of two Gaussians on a decision score, a slider for the cut-off; the kept fraction is computed (toy scores, labelled). `p2KeepFrac(cut)` C. The paper prints no kept fraction: **N10.**
**b4 [L]** scaling by sharing weights · F: a fully convolutional denoiser accepts any size. Table 3 (p. 10): PSNR 25.17 → 24.86 dB, SSIM ~0.33 → ~0.32, latency 0.201 → 33.490 ms from 4×4 to 64×64 (`t3-*`). Our calculation: pixels ×256, latency ×166.6, i.e. 12.6 → 8.2 µs a site (`p2Sublinear`, C←R). Stage `pl` points (reported/computed in two marks, log–log).
**b5 [L]** latency per image or per batch · F: Table 4 (p. 10) "latency" is the reciprocal of throughput (`p2LatTP`, C←R: 1000/TP reproduces all five entries); so a 3×3 image alone takes 2.174 ms, longer than a 1.5 ms exposure, while a full batch of 128 takes 10.07 ms. Table 5: 80–90 µs with parallel models. Table 3's 0.201 ms (4×4) and Table 4's 2.174 ms (3×3, batch 1) are not reconciled (ratio 10.8; **N11**). Stage `pl` series (computed from the printed pairs).
**b6 [D]** deeper: the best possible, from physics · F: a Bayes bound from EX's Poisson model sets what any classifier can reach at a given exposure (EX:fidelity-exposure; B5 likelihood ratio); the paper does not show how close it gets.

### Unit `p2-pipeline` — Hiding the classical work
**b1 [L]** three schedules · G: draw gates, acquisition, classification and denoising on a time line. Done in a row they add up; overlapped, only the last pays. · F: Fig. 11 (p. 11): (a) baseline, (b) unpipelined with GANDALF, (c) pipelined. Stage `tl(modes a,b,c)` drawn by the engine from the times the learner sets (defaults: our fitted values, **labelled derived**, b2).
**b2 [L]** Eqs. 4 and 5 · Notation beat `T_unp = d(t_g + t_r + t_c)`, `T_pip = d(t_r + t_g) + (t_den + t_c)` · F: see derivation D1 (§2). Claims `p2TUnp`, `p2TPip`, `p2Saving = (d−1)t_c − t_den` (C, with learner inputs). Bridges B6:pipelining.
**b3 [L]** reading the bars back · F: Fig. 15a (p. 13): 451.0 / 371.0 / 271.0 ms unpipelined, 401.5 / 321.5 / 221.5 pipelined at 1/2/3 % tolerance (`f15-unp-1…3`, `f15-pip-1…3`; image checked). Saving 49.5 ms at each (`p2Save` C←R), **10.98 % of 451.0** ("over 10 %", p. 13). Setting t_den = 0 for the baseline gives **t_c = 0.5 ms** (`p2TclImplied`, C←R), the "500 µs for a 3×3 array" of p. 11 (a consistency check that passes). Then t_r + t_g = 4.01, 3.21, 2.21 ms (`p2TroImplied`).
**b4 [L]** GANDALF's bars · F: Fig. 15b: 291.1 / 181.1 / 151.1 ms (`f15-gan-1…3`). If t_den + t_c = 0.1 ms (assumed: **derived**, not printed) these give t_r + t_g = 2.91, 1.81, 1.51 ms, so 1 % ↔ 2.9 ms (printed, p. 12) and 3 % ↔ 1.5 ms. The ratios of pipelined bars are 1.38, 1.775, 1.47 (`p2Ratio1…3`; **1.77× is the 2 % bar**, the best of three). **N12.**
**b5 [L]** what pipelining does not buy · F: at one fixed readout of 1.5 ms, a pipelined baseline (151.5 ms, t_c = 0.5) and GANDALF (151.1 ms) differ by 0.4 ms (`p2EqualTro`, C, derived model): the large gain comes from reaching the accuracy at a shorter readout, not from the schedule. And the text's 0.19 s → 0.152 s (p. 13) matches no bar: **E2.**
**b6 [L]** deferring reset and reload · Trail `geh25`, `bar25` · F: classification can overlap the next acquisition if atom reload waits one round, because loss is rare and uncorrelated (p. 11, citing [2], [11]); neither loss nor reload is simulated (report; B6:loss-reset). Reported motivation only. **N13.**

### Unit `p2-logical` — From readout error to logical error
**b1 [L]** the trade · G: a longer look is more accurate but leaves every data atom idle longer. Both effects change the final error. · F: derivation D2. Idle noise is modelled by the Pauli twirl with T₁, T₂ (p. 12, Tomita–Svore [38]); the paper does not print T₁, T₂, gate errors or how classifier errors became flips (report): `open-params` listed as open. Stage `pl` series (B6 recipe `readout-ucurve`): idle rising, measurement falling, their sum (illustrative parameters, labelled "ours").
**b2 [L]** the U-curve · F: toy `p_L(t) = A(p_eff/p_th)^((d+1)/2)` has an interior minimum (`p2UMin`, C, 'strictly inside the range', illustrative parameters). The paper's best is "about 4 ms" at 9 µm (`f14-best`); our toy parameters are not fitted to it, so the match of positions proves nothing. Bridges B6:ucurve.
**b3 [L]** Fig. 14 as reported · F: bars at 1.5, 4, 10 ms for surface d = 11 and BB d = 12 (graphical; **no values read from the bars**). Printed ratios: 5× (surface, 4 ms), up to 35.8× (BB, 1.5 ms); at 10 ms the methods are equal because idling dominates (`f14-5x`, `f14-35.8x`, `f14-10ms`). Stage: `rp` empty axes with the printed factors only. **N14.**
**b4 [L]** why 35.8× is large · F: both gains are against CNN(Site) at 1.5 ms, where readout error, not idling, dominates the baseline (report). Live: toy shows a ratio grows as the baseline's measurement error grows (`p2RatioGrows`, C).

### Unit `p2-trust` — What to trust
**b1 [L]** a ledger of numbers · F: a table of paper claim, where, our recomputation, verdict: reproduces, derived consistent, unreconciled, open. Items: 1.6× (**E1**), 2.5× / 2.8×, 1.77× / 1.25×, 0.19 → 0.152 s (**E2**), 5× / 35× / 35.8×, 16.5×, Table 1 / Table 6, dataset counts, duplicate refs [28]=[29] (report). Stage `rp`.
**b2 [L]** what is not modelled · F: loss, reload, crosstalk-induced correlated errors, T₁/T₂ details, real-time decoding latency. A "dark" classifier maps a lost atom to 0 (derived gap, EX/B6).
**b3 [B]** where the limit really lies · F: photons, heating and depumping set the floor (EX); the claim tested is one denoiser vs one baseline on one 3×3 Cs set, one group. GANDALF is shown to recover information a fixed mask discards; the bound is not shown (report conclusion, paraphrased).
**b4 [D]** a research assistant's checklist · F: what a lab would measure next: real short exposures, a Bayes bound, a Wiener baseline, 8×8 arrays, loss as a third outcome. Bridges EX, B5, B6.

## 2. Derivations (step `tex` — why — **view**; Ground ≥ Formal; ≥ 2 views each)
**D1 Eqs. 4–5 (pipelining).** G: (1) one round with no overlap: do gates, look, classify: `t_g + t_r + t_c` — add the three times — *timeline a* · (2) d rounds: repeat d times — multiplication — *timeline b* · (3) overlap: the next look can start while the last picture is processed, so a round costs `t_r + t_g` — the work hides behind the look — *timeline c* · (4) only the last round has no look to hide behind: add `t_den + t_c` once — the tail — *timeline c with the tail marked* · (5) difference `T_unp − T_pip = (d−1)t_c − t_den` — what hiding saves — *plot of saving against d*. F adds the condition `t_den + t_c ≤ t_r` (else the stages stall; the paper does not state it: Table 4's 2.174 ms at batch 1 vs a 1.5 ms exposure) and reads t_c back from Fig. 15. Views: timeline · formula · plot.
**D2 Why readout time enters the logical rate twice.** (1) cycle error per data atom `p_eff = p_g + p_idle(t_r) + p_m(t_r)` — gates, waiting, wrong reading — *stacked bars* · (2) waiting grows with t_r: Tomita twirl `p_X = p_Y = (1−e^{−t/T₁})/4`, `p_Z = (1−e^{−t/T₂})/2 − p_X` (B6) — idle probability — *plot idle* · (3) reading error falls with t_r (more photons, Poisson overlap, EX) — *plot measurement* · (4) suppression `p_L ∝ (p_eff/p_th)^((d+1)/2)` — the exponent amplifies both — *plot p_L, log y* · (5) the minimum where the two slopes balance — *marker at argmin*. Views: stacked bars · log plot. (Details of 2 and 4 are B6's; here they are used.)

## 3. Try-it widgets (props from `plot`, `timeline`; no new widget kind)
**W1 Timeline lab** (`timeline` + paragraph widget): sliders `t_g, t_r, t_den, t_c, d` (ranges 0.001–10 ms, d 1–100); readouts `T_unp, T_pip, saving, speed-up` all engine; presets "paper-fitted (derived)" and "your own". **W2 Eta calculator**: input η → factor and "errors left". **W3 Fig. 15 back-reader**: pick tolerance → implied t_c, t_r + t_g (C←R; flags the assumed t_den + t_c). **W4 U-curve toy** is B6's widget, embedded by recipe.

## 4. Challenges (tol 0.005 for decimals; integers tol 0; full walkthroughs)
1. `p2-ch-eq5` numeric: d = 100, t_r = 3 ms, t_g = 0.01, t_den = 0.1, t_c = 0.4 → T_pip = 301.5 ms (`answerFrom` recipe; walkthrough via D1). 2. `p2-ch-saving`: same inputs, unpipelined 341.0 ms minus pipelined 301.5 ms → saving 39.5 ms (= 99 × 0.4 − 0.1). 3. `p2-ch-eta`: baseline error 4.0 %, η = 62.1 % → new error 1.5 % (`4×(1−0.621)`=1.516 → 1.52). 4. `p2-ch-tc`: from Fig. 15 bars find t_c (0.5 ms). 5. `p2-ch-params` (integer): weights of Enc3 = 294912. 6. `p2-ch-spot`: choose which printed ratios disagree (1.6× vs 1.24×) — multiple choice, key from `p2CrossRatio5`. 7. `p2-ch-batch`: batch time for 128 images at TP 12711.4 → 10.07 ms. 8. (deeper) argue whether idle error or measurement error dominates at 10 ms (open-answer, key from the toy).

## 5. Glossary (new `pp-` ids; G ≤ 25, F ≤ 40 each)
`pp-readout-bottleneck`, `pp-qec-cycle`, `pp-exposure-equivalent` (attenuated path), `pp-dual-path`, `pp-denoiser`, `pp-cgan`, `pp-l1-gan-loss`, `pp-residual-block`, `pp-mode-collapse`, `pp-fnn`, `pp-mf-nn`, `pp-eta` (relative infidelity reduction), `pp-psnr`, `pp-ssim`, `pp-throughput-latency`, `pp-pipelined-readout`, `pp-idle-error`, `pp-post-selection`, `pp-equivalent-exposure`. Reused: `pp-check`, B5/B6 ids for threshold, ROI, twirl, U-curve (resolved at build).

## 6. Review cards
Ten cards, one per claim family: Eq. 4/5, t_c from bars, η factor, Table 2 count, batch vs per-image time, 1.77 bar identity, E1, E2, equivalent exposure, "what pipelining does not buy".

## 7. Symbol-before-use
Introduce `τ, t_g, t_r, t_c, t_den, d, T_unp, T_pip, η, λ_L1, δ` each in a notation beat before use; `symbols` map in the spec; `t_r` is "readout time (acquisition)" everywhere (the paper writes `t_readout`).

## 8. Reported ledger (R; value as printed; location; image checked unless "text")
| id | value | where |
|---|---|---|
| `t1-gate-na`/`t1-ro-na`/`t1-frac-na` | 400 ns · 1 ms · ~0.75 | Table 1, p. 1 (image) |
| `t1-gate-sc`/`t1-ro-sc`/`t1-frac-sc` | 34 ns · 500 ns · ~0.5 | Table 1, p. 1 (image) |
| `t6-prep`/`t6-gate`/`t6-img`/`t6-class` | ~100 ms · few µs · few ms · few 100 µs | Table 6, p. 11 (image) |
| `ds-array`, `ds-px5`, `ds-px9` | 3×3 · 28×28 · 32×32 px | p. 11 (image) |
| `ds-attn`, `ds-range` | 10× · 1.5–10 ms (15–100 ms) | Fig. 3 caption p. 5; p. 11 (text, image of p. 11) |
| `d-lambda` … `d-epochs` | λ_L1 = 200 · β 0.5/0.999 · 0.0002 · 16 · 30 | §4.2, p. 8 (text) |
| `d-params` | 4.7 million | p. 10 (image) |
| `f7-mis-before`/`-after` | ~15 % · ~4 % | Fig. 7 caption, p. 7 (text) |
| `f9-eta-mf/-cnn/-fnn` | 60.9 · 62.1 · 66.1 % | Fig. 9, p. 9 (image) |
| `f9-inf-mf/-cnn/-fnn` | 11.2 · 21.9 · 16.2 (1 µs) | Fig. 9, p. 9 (image) |
| `f9-par-mf/-cnn/-fnn` | 0.2 · 1.6 · 12.7 (100 K) | Fig. 9, p. 9 (image) |
| `p6-cnn-site`, `p6-cnn-array` | 355 k · 74 M parameters | p. 6 (text) |
| `f12-x-5g`, `f12-x-5b`, `f12-x-9g`, `f12-x-9b` | 2.9 · 3.6 · 3.2 · 4 ms | §7.1, p. 12 (image) |
| `r-factor-1p5`, `r-factor-abs`, `r-eta5`, `r-eta9`, `r-short` | 2.8× · up to 2.5× · ~64 % · ~53 % · up to 1.6× | pp. 2, 12; p. 9; abstract p. 1 |
| `t3-psnr`, `t3-ssim`, `t3-l1`, `t3-lat` | 25.17 25.06 24.79 24.86 · 0.3337 0.3368 0.3134 0.3187 · 0.0362 0.0365 0.03701 0.0367 · 0.201 0.514 9.091 33.490 | Table 3, p. 10 (image; columns 4×4, 8×8, 32×32, 64×64) |
| `t4-tp`, `t4-lat` | 460.0 3330.3 9225.0 11721.4 12711.4 · 2.174 0.300 0.108 0.085 0.079 | Table 4, p. 10 (image; batch 1, 8, 32, 64, 128) |
| `t5-tp`, `t5-lat` | 10615.5 11204.0 11786.8 12083.5 · 0.094 0.089 0.085 0.083 | Table 5, p. 10 (image; 4, 8, 16, 32 models) |
| `f14-best`, `f14-5x`, `f14-35.8x`, `f14-10ms` | ~4 ms · 5× · up to 35.8× · equal at 10 ms | §7.2, pp. 12–13 (text; graphical bars not read) |
| `f15-unp-1…3`, `f15-pip-1…3`, `f15-gan-1…3` | 451.0 371.0 271.0 · 401.5 321.5 221.5 · 291.1 181.1 151.1 ms | Fig. 15, p. 13 (image) |
| `f15-text` | 0.19 s → 0.152 s; up to 1.77×; over 10 % (50 ms) | §7.3, p. 13 (text/image) |
Ids written `…1/2/3` are tolerance 1, 2, 3 %.

## 9. Engine gaps, claims, recipes and stage contracts
**9.1 Engine** `physics/readout/gandalf.ts` (pure; numpy twin `pipeline/claims_papers/p2.py`, 67 route checks in `plan-p2-numpy.py`): `cycleUnpipelined(d,tg,tr,tc)`, `cyclePipelined(d,tg,tr,tden,tc)`, `pipelineSaving(d,tc,tden)`, `impliedClassTime(unp,pip,d)`, `impliedReadGate(unp,d,tc)`, `readoutFraction(...)`, `timelineSegments(mode,...)` (ordered boxes for the kind), `etaFactor(eta)`, `convParams(layers,perBlock)`, `latencyFromThroughput(tp)`, `batchTime(b,tp)`, `ratio(a,b)`, `keepFraction(cut,…)` for the toy mixture. Uses (by link) B6's `idleTwirl`, `pLogical`, `ucurve` and EX's `poissonError`; no duplicate. Keys: `p2GapNA, p2GapSC, p2RuntimeScale, p2ReadFrac, p2Atten, p2Sites, p2Split, p2MisRatio, p2GenParams1, p2GenParams2, p2DiscParams, p2ParRatioMF, p2ParRatioFNN, p2DenoiserRatio, p2CrossRatio5, p2CrossRatio9, p2EtaFactor…, p2Sublinear, p2LatTP, p2TUnp, p2TPip, p2Save, p2TclImplied, p2TroImplied, p2Ratio1…3, p2EqualTro, p2UMin, p2RatioGrows`. Computed-from-printed ones carry `uses:` for their reported ids.
**9.2 Stage kinds.** NEW `timeline` (SVG, ~90 lines): props `{ rows: { label; segments: { kind: 'gate'|'acquire'|'classify'|'denoise'; from; to }[] }[], unit: 'ms', marks? }`, boxes from `timelineSegments`; no new axes code beyond one linear scale; passport row, print mode, fidelity contract; canvas: none (SVG). `camera-frame` is B5's (grey-level frame with optional ROIs, seeded simulated photons; panels 1–3); P2 adds only a `caption`-level label "simulated" requirement. Plot additions: none new except a log–log `points` use (exists) and reported marks (exist). **No GL.**
**9.3 Recipes** (typed params; each returns existing/new kinds): `readout-timeline` {mode, d, tg, tr, tden, tc} → `timeline`; `fig15-readback` {tolerance 1|2|3, tden_plus_tc?} → `plot` points, uses reported ids; `eta-factor` {eta} → readout values; `conv-params` {perBlock 1|2} → `plot` points; `latency-tp` {…}; `dataset-pair` {attenuation, seed} → `camera-frame` (B5 recipe reused with a `pair` panel); B6 `readout-ucurve` reused. Eight recipes total (6 new here).
**9.4 e2e/canvas.** No WebGL; two SVG kinds; the P2 e2e list: tracks × all 39 beats rendered, Fig. 15 readback numbers, W1 slider round trip, Read mode, print, Corrections boxes; zero page errors.

## 10. Media
No Blender or film. Optional Higgsfield decor (atmosphere only, no numbers): none planned; credit approval would be needed (skill 14).

## 11. Hooks, bridges, prerequisite links
Prerequisite map (each node one teaching unit): `fluorescence-photon-budget`→EX:imaging · `poisson-histogram`→EX:histograms · `site-classification`→B5:roi/matched-filter · `pix2pix-loss`→B5:pix2pix · `qec-cycle-timing`→B6:cycle · `pauli-twirl-idle`→B6:twirl · `ucurve`→B6:ucurve · `surface-code-logical`→B1 · `neutral-atom-platform`→Q25 · `qec-basics`→Q21/Q22 · `bridge-gandalf-loss`→B6:loss-reset · `readout-bottleneck`, `dual-path-dataset`, `gandalf-network`, `eta`, `pipelining-eqs`, `reading-fig15`, `trust-ledger` → this lecture. Each `B…` / `EX:` target is verified at build. Arcade: none (no level planned; 13-arcade-level not invoked).
Back-links: B5 and B6 each end with a bridge "see it in the paper" to `p2-denoiser`, `p2-pipeline`, `p2-logical`.

## 12. References used (R5; depth, read vs cited, where taught)
| ref | depth | status | relied on | taught |
|---|---|---|---|---|
| [31] Phuttitarn 2024 (dataset, CNN baselines) | 1 | read (notes) | Sec. IV, App. A.1; dataset counts | here p2-dataset; B5 |
| [19] Isola 2017 (pix2pix) | 1 | read (notes) | objective Eqs. 1–4 | B5 |
| [20] Kent 2025 (matched filters) | 1 | read (notes) | Eqs. 1–5, Tables I–II | B5 |
| [38] Tomita–Svore 2014 | 1 | read | Eqs. 9–10, p. 6 | B6 |
| [1] Google 2024 | 1 | cited + SI check | Table 1 source (report: not found in text) | B6 |
| [39] Wintersperger 2023 | 1 | cited only (login wall) | Table 1 neutral column | EX/Q25 |
| [2] Baranes 2025, [11] Gehér 2025 | 1 | read | loss and reset | B6 |
| [13] Stim; [16],[29] Gyger/Norcia reloading | 1 | cited | motivation | B6; Q25 |
| [28]=[29] duplicate entry | — | noted | bibliography slip (report) | here p2-trust |
| Saffman 2025 (timing), Gidney 2025 (RSA) | 2 via report | read (notes) | "a few ms", 1 µs vs ms runtime | B6 |
Page "What we checked" lists held and cut items (§8 corrections log).

## 13. Corrections and neutral notes (page images checked 2026-11-23)
**Correction candidates** (arithmetic on the paper's own printed numbers; engine `check()` in `papers/corrections.ts`; the independent review re-verifies and may cut):
- **E1** abstract, p. 2/3 text: "up to 1.6× shorter readout" vs Sec. 7.1, p. 12: sub-1 % limits 2.9 vs 3.6 ms and 3.2 vs 4 ms. **Our calculation finds 1.24× (5 µm) and 1.25× (9 µm)**; the paper does not say which comparison gives 1.6× (4/2.5 would; no 2.5 ms is printed). Key `p2CrossRatio5/9`; worded as a possible mismatch, not an error claim (cf. papers-P1 R9).
- **E2** p. 13 text: "from 0.19 s … to 0.152 s" at 1.5 ms vs Fig. 15 (image): the bars are 451.0, 371.0, 271.0 (unpipelined), 401.5, 321.5, 221.5 (pipelined), 291.1, 181.1, 151.1 ms; **no bar equals 0.19 s**, 0.19/0.152 = 1.25 (not the 1.77 of the same paragraph), and 0.152 ≈ the 3 % GANDALF bar. Key `p2TextFig15` (printed values compared). Table comparison, like P1 E7.
**Neutral "as reported" notes** (no Correction): **N1** Table 1 readout fractions (~0.5, ~0.75) vs gate + readout alone (0.936, 0.9996) — the cycle holds other steps, composition not printed. **N2** Table 1 (400 ns, 1 ms) vs Table 6 (few µs, few ms). **N3** "27000 for each duration" vs 3000 × 9 = 27000 total (p. 5). **N4** secondary path labelled equivalent exposure (report). **N5** no Wiener/matched-filter baseline in the paper. **N6** Table 2 prints one convolution per residual block; 4.7 M needs two. **N7** 2.5× (pp. 1, 3, 9) vs 2.8× (pp. 3, 12): different conditions (shortest durations vs 1.5 ms), unconfirmed. **N8** "16.5×" smaller: 17.75× from printed 0.2 (rounded) and 355 k; the denoiser's 4.7 M is not counted. **N9** the CNN is not the best simple rival to compare with (report). **N10** the post-selected fraction is not printed. **N11** Table 3 vs Table 4 latencies. **N12** 1.77× = best of three bars (1.775), 1.38 and 1.47 at 1 % and 3 %. **N13** loss and reload not modelled. **N14** Fig. 14 values are graphical; 5× and 35.8× printed; the abstract says 35×. **Held, not raised:** the text "end-to-end 4× faster than CNN(Array)" (p. 9; we get ~5.5× from 0.079 + 0.011 ms vs 0.5 ms, assumptions unprinted); PSNR "less than 0.5 dB" (0.38 dB ✓); "over 10 %" (10.98 % ✓); Table 4/5 timing columns ✓ (reproduced by 1000/TP).

## 14. Open questions for the judge
1. Is a Correction right for E1 (an unexplained headline factor), or should it be a neutral note until a reviewer finds the comparison? 2. The build fits t_den + t_c = 0.1 ms and t_g = 10 µs to Fig. 15 as "derived" defaults: acceptable, with the assumption shown in the widget? 3. `timeline` as a new kind (≈ 90 lines) vs reusing `plot` bands: recommend the kind (D1 needs ordered boxes). 4. Share `camera-frame` with B5 only (this plan adds no new field)? 5. Skip Fig. 12 curves entirely (printed crossings only) — agreed? 6. All numeric challenge answers come from `answerFrom` recipes, recomputed at build. 7. Order: P2 after B5, B6 and the experiment track merge; a stub ordering if the tracks lag?

## 15. Builder estimate
Spec + glossary + 39 beats in two tracks: 52 steps · engine module + numpy twin + tests: 22 · `timeline` kind (state, resolver, SVG, passport, print, fidelity): 24 · 6 recipes + validator tests: 18 · claims ledger + corrections checks + review cards: 16 · widgets W1–W3 and props gate: 12 · e2e (both tracks, corrections, print) and the gate: 14 · fixes after review: 10. **Total ≈ 168 steps** (≤ 170); the experiment-track and B5/B6 resources are reused, not rebuilt.
