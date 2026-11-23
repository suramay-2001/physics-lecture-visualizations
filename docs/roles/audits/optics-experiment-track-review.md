# Independent truth review: Optics Lab experiment track O7 to O11

Reviewer: P (read-only), main at 5a0c599. Rulings read: `docs/roles/decisions/gandalf-batch.md` (G1, G3, G5), `optics-lab.md`.
Sources: `sources/ref-gdf-manetsch` (printed pages = PDF pages), `ref-gdf-cho23` (Chow), `ref-gdf-kwo17` (Kwon), `ref-gdf-mdo17`, the research notes.
Method: own numpy/scipy scripts (scratchpad `rev_o_track.py`, `rev2.py`, `rev3.py`), independent of `arrays.ts`, `imaging.ts` and `claims_optics/o_track.py`
(polarizability from the Steck reduced elements, EMCCD law by grid convolution plus a 4-million-draw Monte Carlo, binomial tails from scipy, Poisson tails from scipy).
No builds, servers or Playwright were run, so no contact sheets or vitest counts are part of this review.

## Verdict: FIX-FIRST

Every computed value printed on the five pages reproduces (see "Checked and right"), and every `o<k>Rep…` value matches its cited page. The blocks below are
physics or wording errors that the claim tests cannot see: a probability used with the wrong definition, a false statement about the run's settings, and three
sentences whose arithmetic or description is wrong.

## Blocking

**S1. The depumping chance is per collected photon but is applied per scattered photon (page, claims, preset).**
`O10.ts:141`, `O10.values.ts` (`o10DepumpN`, `o10Surv500`), `presetsTrack.ts:39` and `:206`.
Chow p. 3 defines R as the depump probability per collection event (rate of information loss over rate of information gain); p. 5 derives 3.7e-4 from the 0.11 %
bright error as 1 − (1 − ε)^(1/3) (I get 3.668e-4). Chow p. 3 itself shows the conversion: a per-scatter value of 6.6e-5 becomes a normalised 6.8e-3 "after accounting for"
the 0.96 % collection efficiency. The page writes "per collected event" and then raises (1 − p) to the power N of scattered photons, so the 1/e number
(2,702) and the 500-photon survival (0.831) are for collected counts. Per scattered photon the chance is 3.7e-4 × 0.0096 = 3.6e-6, the 1/e point is 2.8e5 scattered photons,
and 500 scattered photons keep 0.998. The preset (comment: "per scattered photon") plots the same wrong curve against scattered photons.
Fix: either (a) keep p = 3.7e-4 and say N counts collected photons (then 2,702 collected = 2.8e5 scattered at 0.96 %; 500 collected keep 0.831; plot the curve against
detected photons `m`), or (b) use 3.6e-6 per scattered photon. Update the claim texts, `DEPUMP` comment, and the preset's right-axis argument (`.detected` for (a)). Then the
recoil limit (908 photons, scattered) and the depump limit are no longer in the same unit by accident.

**S2. "A beam of that width stops an atom of up to 53.8 m/s" is false at the run's settings.** `O7.ts:83`, `O7.values.ts` (`o7CaptureV`).
53.8 m/s is √(2 a_max d) with a_max = ħkγ/2M, the fully saturated limit (I reproduce 53.81). At the settings just printed in the same paragraph (s = 10/6 per beam,
δ = −3.17γ) one beam delivers 3.9 % of a_max (s/(1+s+4δ²) = 0.0389), giving about 10.6 m/s by the same formula. Fix: say "at most 53.8 m/s even with a fully saturated force,
and about 10.6 m/s at the run's settings" and add a keyed claim for 10.6 (engine: scale `capture` by √(s/(1+s+4δ²))), or drop the sentence.

**S3. The refill Try-it contradicts the preset and the page's own number.** `O9.ts:116`.
It says the empty fraction climbs "from zero to its settled level". The chain and the preset start from an all-empty array (e0 = 1): the empty fraction falls 1 → 0.0473 (round 5) → 0.0196.
The same paragraph says a refill ten times the loss leaves "about a tenth" of the empty sites that refill = loss would. By ε/(q+ε): 1/11 against 1/2 is 0.18, about a fifth.
Fix: "watch the empty fraction fall from one to its settled level"; "about a fifth".

**S4. The detection-efficiency sentence is wrong.** `O10.ts:111`.
"An atom that scatters a hundred times as many photons into a camera that sees a tenth as many still needs a hundred times the time in the bad case." Detected rate ∝ R·η, so a hundred times
more photons into a tenth as many gives ten times the detected rate (a tenth of the time). The numbers on the page support a different statement: at 0.96 % a mean count of five needs 521 scattered photons,
about 0.30 ms at the example rate, against 0.0578 ms at 5 %, a factor 5.2. Fix: "the same atom seen through a camera that collects a tenth as many photons needs ten times the exposure (0.30 ms
at 0.96 % against 0.0578 ms at 5 %)", with a keyed claim for 0.30 (521/1.7309e6 s = 0.301 ms).

## Should-fix

**N1. Rotating-wave scattering rate beside a depth that keeps the counter-rotating terms.** `O8.ts:153`, `arrays.ts` `tweezerScatter`.
The depth and α use both terms (checked: 1165 and 1152 au; the Steck-element route gives 1159 au, 0.5 % from rounded elements). The rate uses the rotating-wave sum, which at 1061 nm overstates the standard
two-term rate: with (ω/ω_j)³ and the counter-rotating bracket (the usual far-detuned form, with the line weights 2/3 and 1/3 of `tweezerScatter`) I get 0.966 s⁻¹ against the printed 1.45 s⁻¹; the scalar elastic
(Rayleigh) rate alone is 0.95 s⁻¹. Heating time then is 1,228 s (20.5 min), not 819 s (13.7 min). The page does name the "rotating-wave form", but the reader cannot see it costs 50 %, and the comparison
"same order as the 22.9 min" is only safe by luck. Fix: use the full form in `tweezerScatter`/twin (R = 0.97 s⁻¹, 1,228 s, 20.5 min, new tolerances), or keep 1.45 and state "a rotating-wave upper estimate, about 1.5 times the full-formula rate".
The preset readout follows the same function.

**N2. The 20 µK cloud temperature is an unlabeled input and is mis-attributed.** `O8.ts:127`, `presetsTrack.ts` `T_REF`.
"This is the scale of the model of page O7" is wrong: O7's scale is 0.7 to 0.9 µK; 20 µK appears nowhere in O7 or the paper (the paper's own figure is about 4.3 µK at 55 µK depth, Manetsch p. 5 and p. 24, which the page says it does not print).
Fix: "20 µK is a value we chose for this page, not a measurement".

**N3. Printed numbers of the run have no keyed `reported` claim (G3).**
Unkeyed in prose: ten million atoms in 100 ms, 40 ms and 40 ms, 80 ms imaging, 10 I₀ and 7 I₀, 20 G/cm (all Manetsch p. 21, verified correct) at `O7.ts:50`, `:83`, `:104`; 6,139 atoms (p. 2) at `O9.ts:~100` and `:128`;
137 ms and 522 ms (pp. 8 and 33, verified correct) at `O9.ts:91`; Kwon's 4.17 % (p. 8, correct) at `O10.ts:69`; the 20 G/cm gradient and 10/6 per beam feed `o7MotBetaK2`, `o7MotOmegaHz`, `o7MotZeemanMm`.
Fix: add `o7RepGradientGcm`, `o7RepLoadMs`, `o7RepPgcMs`, `o7RepDropMs`, `o7RepImageMs`, `o7RepMotI0`, `o7RepPgcI0`, `o9RepAtoms`, `o9RepSortParMs`, `o9RepSortSeqMs`, `o10RepKwonIsoCE` (as printed, page cited), or move them into words without digits.

**N4. Model inputs that are not labelled on the page.**
(a) `μ′ = μ_B` and A = 0.2 T/m in the MOT spring and Zeeman size (`O7.ts:83`; only in the values comment). Say "taking an effective moment of one Bohr magneton (our input)".
(b) The D1 line (894.593 nm, 4.561 MHz) and the (2J′+1) weights in the polarizability (`O8.ts:~92`): only D2 data are declared as Steck inputs. Add D1.
(c) τ = 100 ms and R = 10⁸ s⁻¹ in the `mot-load` preset and the figure caption (τ 100 ms and 200 ms): the paper prints a 100 ms load time and about 10⁷ atoms, not a loss time constant. Label as model inputs.

**N5. The preset `pgc-window` does not open on the page's numbers.** `presetsTrack.ts:81`.
Default s = 1.2 gives |U₁| = 7.72 µK, limits 0.965 and 0.749 µK, ratio 130; the page prints 7.51, 0.939, 0.728 and 134 (s = 7/6). Fix: default `7/6` (a default need not lie on the slider grid) or step 1/6.
Minor same family: `tweezer-well` opens at w₀ = 1.24 µm, so f_z reads 4.82 kHz against the printed 4.81 (waist 1.2406): set default 1.2406 or round on the page to 4.8.

**N6. The `photon-budget` Try-it promises an effect the preset lacks.** `O10.ts:121`, `presetsTrack.ts:198`.
"Slide the aperture and the efficiency and read off the time for a mean count of five": the aperture slider changes only the "Ideal lens collection" readout, never the time (the time uses η). Fix: tie η to NA by an explicit transmission slider, or reword ("the aperture moves only the ideal collection readout").

**N7. The loss paragraph double counts and hides the vacuum share.** `O9.ts:125` and `:128`.
Manetsch p. 4 says the 99.98952 % per-image survival is mostly vacuum-limited. The 22.9 min lifetime alone loses 0.357 of the 0.643 atoms in an 80 ms image (55 %), so "4.47 a second and 0.643 per image" are not two separate channels.
Fix: add "of the 0.643 per image about 0.36 is the vacuum acting during the 80 ms" (keyed claim 0.357) and reword the summary to "mostly the same loss".

**N8. The cloud size explanation is unsupported.** `O7.ts:94`.
The Zeeman half-size is the radius where the beams' Zeeman detuning cancels the laser detuning, not the cloud size; a cloud smaller than it is set by temperature through the spring (σ = √(k_BT/Mω²)). "Because the linear picture ignores the light atoms scatter and push each other with" asserts a cause no source gives.
Fix: "the cloud is smaller than the Zeeman size because its extent is set by its temperature in the spring; we print both numbers without a verdict".

**N9. "Agreement of three independent routes" overstates (0.152, 0.171, 0.208 mK).** `O8.ts:110`.
The three differ by 37 %. Fix: "How you know the depth is right is how far the routes spread, here about 37 %".

**N10. The 20 ms point is at a different detuning.** `O11.ts:134`.
Manetsch p. 21 gives −9.5γ for the 20 ms image against −15.5γ at 80 ms (p. 21). "The shorter image gives up survival for time" omits that the setting also changed. Fix: name the second detuning.

**N11. Saved reference for the EMCCD law is main text only.** `O11.ts:102`.
"Martinez-Dorantes et al., supplement": `ref-gdf-mdo17` holds the 5-page main paper, which has no camera-noise model; the notes put it at Suppl. p. 5 to 7. Cite that page or the research notes row, or drop the citation (the Erlang law is textbook).

## Nits

1. Over 40 words: `O10.ts:69` (44 words with the placeholders), `O10.ts:133` (41).
2. "A few times the number that a bright atom needs" (`O10.ts:133`): 908 photons against 521 and 729 is 1.2 to 1.7 times; against the 5 % setup (100 photons) 9 times. Name the case.
3. `O11.ts:51`: "dark sites are the majority of sites in an array that is half empty": equal priors are used, and at 51.2 % loaded the empty sites are the minority. Delete the clause. Also "tails of about equal weight" while the example tails are 0.53 % and 0.115 %.
4. `O8.ts:134` ("the atom stays far from the rim" at U/kT = 7.6): say "at 7.6 thermal energies from the rim".
5. `O8.ts` §1: 1.4 mW is cited "pp. 2–3 and 20"; the figure is printed on pp. 3 and 20 (p. 2 prints only the NA). Kwon is a rubidium experiment on a cesium page: add "(rubidium)" at `O10.ts:69`.
6. Page ranges `pp. 3–25`, `pp. 3–33`, `pp. 3–10` on O8 to O11 sections are blanket ranges, not the cited pages.
7. The "ten-sixths" reading of the beam intensity is declared; keep it. The `mot-load` marker label "95 %" and `toyOptimum` use a 2 µs grid: page says "least at 234 µs" without "(on a 2 µs grid)".

## Checked and right

**Recomputed (match to the printed digits):** O7: I_sat 1.105 → 1.10, N(2τ) 0.865, t95 = 3.00 τ, damping 0.0230 ħk², ω 190.0 Hz, Zeeman 5.93 mm, T_D(−19.5γ) 2.45 mK,
|U₁| 7.51 µK, limits 0.939 and 0.728, ratio 134 (the book's Eq. 3.1 form is inherited from O3 and taken as a scale there; a single-beam light shift would be a quarter of it, noted, not a defect of O7).
O8: waist 1.2406 µm, z_R 4.557, spacing 5.80 w₀, Airy 0.996, α 1165 and 1152 au, depth 0.152 mK, f_r 25.0, f_z 4.81, depth at the paper's waist 0.171, depth from 29.3 kHz 0.208 mK and 1.92 mW, σ 192 nm, U/kT 7.59, η 0.266 and 0.0705,
recoil gain 198 nK (852 nm) and 128 nK (1061 nm), 908 photons to 0.18 mK, trap heating 819 s under the rotating-wave rate. O9: parity 0.4323, 0.5677, 0.3679, 0.4908, 0.49998; 229, 235, 122 sites; 0.659 and 0.962;
6,144; empty 0.0473, 0.0196; 0.138; 4.47 per s; 0.643 per image. O10: 1.64e7, 8.22e6, 1.73e6 s⁻¹; 4.17, 8.24, 12.0 %; floors 0.674 % and 0.0912 %; 521 and 729; 0.0578 ms; 3.7e-4 → 2,702 and 0.831 (as arithmetic).
O11: example eb 0.531 %, ed 0.115 %, error 0.323 % (cutoff 3 is the best whole cutoff, the next best is 9.2e-3 at 2 or 4); d′ ratio 2.00; errors 4.49, 1.40, 0.267, 0.0196 (cutoff 4), 0.00166 %;
EMCCD error 1.752e-4 by the equal-prior average (grid and Monte Carlo agree, cutoff near 2,492 counts; the plan's 3.60e-4 is superseded as G5 says), photon-by-photon 7.5e-8, ENF 2; toy optimum 234 µs, 0.120 %, misread 0.0264 %; products 0.999833 and 0.991335; Chow mean 0.0225 %.

**Reported values, as printed at the cited page (all 34 `o<k>Rep…` keys checked):** Manetsch: 1.1 mW/cm², 1.6 mm, −3.17, 2.5 cm, −19.5 (p. 21); NA 0.65 (p. 2, p. 20), 0.55 (p. 20); 7.2 µm, 1.4 mW, 0.18 mK, 51.2 %, 3.4 % (p. 3); 29.30 and 5.64 kHz (p. 18, p. 25); 1.17 µm (p. 25); 22.9 min and the two per-image values 99.98952 and 99.99374 % (p. 4);
99.9571 and 99.176 % at 20 ms (p. 21). Chow: 0.96 % (p. 3), 5.44e4 and 5.2e2 s⁻¹, 0.005 %, 0.04 %, 0.26 ms (p. 3), 3.7e-4 (p. 5, but see S1). Kwon: NA 0.4 and 1.6 to 2.0 % (p. 2); 4.17 % (p. 8). Nothing unverifiable slipped in apart from N11's citation (G3).
G3 items: no 720 nK and no Cs Raman N_Γ appears; the 362 nK in the ruling is the rubidium 2E_R/k_B and is not shown; the factor of 2 is right on this page set (2E_R/k_B per photon, equal to the printed recoil temperature of Steck; Chow p. 7 uses twice that per event, which the pages do not repeat).
**Labels:** toy loss rate, "our inference" for the waist, the parity model and the refill chances are labelled as G3 requires; 51.2 % above the one-half ceiling carries a neutral note (G5); sub-1 % comparisons are printed side by side with no verdict.
**Bridges:** all 19 `<<…>>` ids and 11 `[[qc-op-…]]` glossary ids resolve in `bridges.ts` / `glossary.ts`; targets exist (Q25 `q25-cooling`, `q25-readout`, `q25-atom-gates`; B5 `b5-roi`, `b5-matched-filter`; O2 `o2-limit`, O3 `o3-gradient`, O5 `o5-dipole`);
the reverse `pp-o10-*`, `pp-o11-*` rows point at existing O10/O11 units. Return-beat `ret` behaviour was not exercised (no browser run).
**7-word overlap:** none against `sources/mvs/text.md` or any `sources/ref-gdf-*` PDF (longest shared runs are 5 words and generic). **Voice:** one voice, first person plural, only the two sentences in nit 1 exceed 40 words.
**Challenges:** the five pages carry no challenge blocks, so there are no keys or tolerances to check.

## Fix pass

Files: `app/src/content/qc709/optics/O7.ts` to `O11.ts` (and the `.values.ts` tables), `app/src/physics/optics/arrays.ts`, `app/src/widgets/opticsBench/presetsTrack.ts`,
`pipeline/claims_optics/o_track.py` (fixtures regenerated, byte-identical on a second run), `meta.generated.ts` (`UPDATE_META=1` twice). Judge rulings applied.

- **S1** done (option a). `O10.ts:147-158` (per collected photon; 2,702 collected = about 2.8e5 scattered, keyed `o10DepumpScat`; the recoil limit says "scattered"), `O10.values.ts`, `presetsTrack.ts:39` and the right-axis curve now uses `.detected`.
- **S2** done. `O7.ts:99-103`, new keyed `o7CaptureVRun` (10.6 m/s, engine scaling by the saturation factor); 53.8 kept as the saturated upper bound.
- **S3** done. `O9.ts:121-122`: "fall from one", "about a fifth", keyed `o9RefillTenRatio` (0.18).
- **S4** done. `O10.ts:112-118`: ten times for a tenth as many; the two efficiencies here differ by 5.2 (keyed `o10CollRatio`), 0.30 ms against 0.0578 ms (keyed `o10TauM5Chow`). The judge's "ten times" is kept as the general statement, with the 5.2 for this pair stated beside it, because 0.96 % against 5 % is not a factor of ten.
- **N1** done. `arrays.ts` `tweezerScatter` is the full two-term form (weights (2J′+1)/6), twin by the radiated-power route; 0.97 s⁻¹, 1,228 s, 20.5 min; `O8.ts:147-158`, preset readout follows.
- **N2** done. `O8.ts:123` ("a value we chose for this page").
- **N3** done. New reported keys `o7RepGradientGcm, o7RepLoadMs, o7RepPgcMs, o7RepDropMs, o7RepImageMs, o7RepMotI0, o7RepPgcI0, o9RepAtoms, o9RepSortParMs, o9RepSortSeqMs, o10RepKwonIsoCE` (plus `o11RepDet20/80`), each checked by text extraction on its cited page of the saved reference (Manetsch pp. 2, 8, 21, 33; Kwon p. 8).
- **N4** done. (a) `O7.ts:~90` Bohr magneton and SI gradient named as our inputs; (b) D1 line and the 2J′+1 weights declared at `O8.ts:~96`; (c) `mot-load` slider labels and the `O7.ts` figure caption say "model input".
- **N5** done. `presetsTrack.ts` `pgc-window` default s = 7/6 (grid step 1/6), `tweezer-well` default w₀ = 1.2406 µm.
- **N6** done (reworded). `O10.ts:124` and the aperture slider label.
- **N7** done. `O9.ts:134-141`, keyed `o9VacPerImage` (0.357); "mostly the same loss".
- **N8** done. `O7.ts:106`.
- **N9** done. `O8.ts:110-111`, keyed `o8DepthSpreadPct` (37 per cent).
- **N10** done. `O11.ts:134`, keyed `o11RepDet20`, `o11RepDet80` (p. 21).
- **N11** done. `O11.ts:102`: the citation is dropped (textbook law).
- **Nit 1** done (both sentences split). **Nit 2** done (`O10.ts:136`, 1.7 times at 0.96 %, 9 times at 5 %, keyed). **Nit 3** done (`O11.ts:51-52`). **Nit 4** done (`O8.ts:~126`). **Nit 5** done ("pp. 3 and 20", "(rubidium)" at `O10.ts:69` and the Kwon efficiency sentence). **Nit 6** done where the order rule allows: section ranges narrowed on O8 to O11 (the rule that a section may not start before the one above it keeps some wide). **Nit 7** done ("on a grid of 2 µs", `O11.ts:134`; the ten-sixths reading kept).
- Checks: `npx tsc -b` 0; `npx vitest run src/content src/physics src/stage src/widgets` and `build/` green; 7-word overlap sweep on the changed prose: 0 hits.
