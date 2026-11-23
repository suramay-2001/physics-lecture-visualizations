# Rulings: the GANDALF batch (judge, 2026-11-23)

**Scope.** This batch covers four things:
- the Optics Lab experiment track O7–O11;
- Papers B5 ("From pixels to bits");
- Papers B6 ("Readout in the error-correction cycle");
- Papers P2 (GANDALF, arXiv:2510.25982v2).

**Plans:**
- `docs/roles/proposals/P-optics-experiment-track.md`
- `P-B5-story.md`
- `P-B6-story.md`
- `P-P2-story.md`

**Research:** deep research over the paper's 40 references, kept in the git-ignored `sources/research/` (report and notes). The reference PDFs the owner approved are in `sources/ref-gdf-*`.

These rulings override the plans where they differ. Standing rulings still apply: `papers.md` R1–R6, `papers-P1.md` (Corrections), and `optics-lab.md` O1–O8.

**What the judge checked on the page images** (p12, p13):
- Fig. 15 bars:
  - unpipelined: 451.0, 371.0, 271.0;
  - pipelined baseline: 401.5, 321.5, 221.5;
  - GANDALF: 291.1, 181.1, 151.1 ms.
- The 1.77× factor is 321.5/181.1 = 1.775, which is the 2 % tolerance pair.
- The sub-1 % limits in §7.1 are 2.9 against 3.6 ms and 3.2 against 4 ms, which gives 1.24× and 1.25×.

## G1 Ownership (as planned)

- **Experiment track O7–O11** owns the apparatus and the single-site physics:
  - MOT and polarization-gradient cooling (PGC);
  - tweezer depth;
  - loading and sorting;
  - the photon budget;
  - recoil and depumping limits;
  - count statistics with a cutoff.
- **B5** owns whole frames and classification:
  - ROI, PSF and crosstalk;
  - likelihood-ratio and matched-filter weights;
  - CNNs;
  - a live Wiener denoiser;
  - the ideas of pix2pix.
- **B6** owns cycle timing, the Pauli twirl, the U-curve, generic pipelining, and loss and reset.
- **P2** owns the paper's own argument and every one of its numbers. It links to the other three and never re-teaches them.

No topic is taught twice. P2's placeholder bridge ids map one-to-one onto the B5 and B6 unit ids (`b5-roi` … `b6-loss-reset`).

## G2 Shared platform pieces: one platform agent, built before every builder (skill 10)

**Stage and plot additions:**
- **`camera-frame`** (new SVG kind): a grey-level pixel frame with ROIs. It includes B5's additive fields (raw, filtered and weight panels; Wiener on/off), seeded for determinism, and has print mode and fidelity ids.
- **`timeline`** (new SVG kind): ordered boxes on a time axis for rounds and pipelining. It carries P2's fields plus B6's `move` and `reset`.
- **`OpticsCurve.step`** and a matching `step` field on `plot`, for histograms and probability mass functions.

**Engine cores the kinds need:**
- `physics/optics/imaging.ts`: photon budget, Poisson and EMCCD sampling with a seeded PRNG, frame synthesis.
- `physics/qec/timing.ts`: round time, readout fraction, pipelined and unpipelined totals.

Each has numpy fixtures. The builders add their remaining functions to the same modules or to the ones the plans name (`physics/optics/arrays.ts`, `physics/readout/classify.ts`).

**`timing.ts` is owned by B6.** P2's `gandalf.ts` wraps it and does not copy the formula.

**Not built:** the `layer-stack` kind (B5 open question 2). P2 and B5 describe the network architectures in words, with parameter-count claims.

**Chunk rule (l):** every new kind and module is lazy, and the entry budget is not raised.

## G3 Numbers

Every number a learner sees is one of three things:
- an engine claim with a numpy twin;
- a `reported` value, exactly as printed, with its location, checked on the page image (or marked "text layer" when it comes from a reference read only as text);
- a labelled **model input** that we chose ourselves.

**Labelled model inputs.** The following are allowed with a visible "model, not data" label (T4 style):
- the toy loss rate λ_L in `o11-loss`;
- B6's toy T₁ and T₂ rates;
- the tweezer two-line polarizability model;
- the waist of 1.24 µm, shown as "our inference from the two reported trap frequencies";
- P2's fitted defaults t_den + t_c = 0.1 ms and t_g = 10 µs, shown as "our fit to Fig. 15".

B6's U-curve optimum (about 2.95 ms with toy inputs) is never presented as a match to the paper's 4 ms.

**Reported rows from the notes.** Reported rows that rest only on a research note are verified at build against the saved reference text in `sources/ref-gdf-*` or the page image. If they cannot be verified, they are cut. This covers the KEN, [1] and [2] rows that the B5/B6 plan flagged.

**Not shown in v1:**
- Gibbons' 720 nK per photon. Our 362 nK appears only with its definition, and the reviewer checks the factor of 2 on the page.
- The Raman cycling number N_Γ for Cs. The depumping chance is a stated input, and its page is confirmed at build or the value is labelled an assumption.

## G4 Corrections and notes for P2

**E1 (1.6× against our 1.24× and 1.25×) is a neutral note, not a Correction.** It reads: "From the sub-1 % durations printed in §7.1 we find 1.24× and 1.25×; the paper does not print the comparison behind 1.6×." The two ratios are engine-checked. The paper may have another comparison that we cannot see.

**E2 is a Correction**, worded as a mismatch between the text and the figure, in the same table-comparison style as P1 E7: "The text's 0.19 s → 0.152 s matches no bar of Fig. 15; the plotted 2 % pair gives 321.5/181.1 = 1.775." It needs an engine check and must be re-verified on the image by the independent reviewer.

**N1–N14 stay neutral "as reported" notes.** This includes the duplicated references [28] and [29], noted in the References-used list.

**Fig. 12 curves are not digitized.** Only the printed crossing values are used.

## G5 Optics track rulings (its open questions 1–11)

All 11 recommendations are accepted:
- Scope ends at a cutoff on counts.
- `camera-frame` is built once, under G2.
- The 720 nK figure is not shown.
- 51.2 % above the ½ ceiling is shown with a neutral note.
- The two-line polarizability is a stated model.
- The waist is labelled as an inference.
- `emccdBestError` is kept, with a tolerance of 1e-4.
- The MOT is shown with the Zeeman half-size and words only.
- Depumping is a stated input.
- The toy loss model is kept, labelled.
- The track uses Cs only.

## G6 Order and lanes (at most two heavy agents at once)

1. The platform agent (G2) builds the shared pieces, then merge and gate.
2. The experiment-track builder (O7–O11, with `arrays.ts`, the rest of `imaging.ts` and the presets) runs in parallel with the B5 builder (`classify.ts`, the B5 spec).
3. A merge agent combines them.
4. The B6 builder (`timing.ts` additions, the B6 spec) runs in parallel with the P2 builder (`gandalf.ts`, the P2 spec, Corrections). Both read the merged B5 and O11 work.
5. A merge agent combines them.
6. Two independent reviews: one for the optics track, one for B5, B6 and P2 together. Reported values and E2 are re-verified on the images. Then one fix pass.
7. Gate, the full preview e2e and the unpiped audit, then push.
8. Demo videos and the LinkedIn post.

**Shared rules for every agent:**
- Two-track papers chapters: Ground-up sentences of at most 25 words, Formal at most 40, one shared stage per beat, derivations with at least two views.
- Challenge tolerances: 0.005 for decimals, 0 for integers.
- The 7-word overlap sweep against the paper and the saved references.
- No usage figures or assignment status in tracked files.
