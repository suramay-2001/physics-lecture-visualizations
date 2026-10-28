# Rulings: the 709 Optics Lab (Metcalf and van der Straten, Cooling and Trapping of Neutral Atoms) (judge, 2026-10-29)

Owner (2026-10-29): build the textbook's chapters and visualizations as optical experiments, prioritized within hours,
with Sonnet/Haiku workers (Opus for decisions only), in ≤ 10 weekly points (5–6 if possible) without losing quality.
Source `sources/mvs` (git-ignored, copyrighted; paraphrase, cite chapter/§ and page). Plan:
`docs/roles/proposals/P-optics-lab.md` (6 pages O1–O6, 32 sections, ~96 claims after cuts, 12 `optics-bench` presets,
`physics/optics/cooling.ts` + `collisions.ts`, 18 plot additions, 11 errata).

- O1 **Format**: the notes machinery generalized to a second collection `optics` (`O1`…`O6`, `#/709/optics/O3`), one voice,
  sentences ≤ 40 words, every displayed number a keyed claim with a numpy twin; each page reads as an experiment
  (apparatus, measurement, physics, numbers, try it) and embeds 1–2 `optics-bench` presets.
- O2 **Numbers** (plan Q1, Q2): standard atomic data (Steck / NIST: λ, γ, M) are stated model inputs shown with their
  citation; the book's design numbers are inputs shown with their page; experimental RESULTS appear in words only,
  except ratios the engine computes from stated inputs.
- O3 **Models** (Q3, Q4, Q9): Sisyphus potentials and T_lim at C = 1 in units of |U₁|, stated; the Gordon–Ashkin depth is
  ours with its stated model, no Correction; Table 6.1's T_S and T′_Q columns are not shown.
- O4 **Links** (Q5, Q8): the 8 new `qc-` bridge rows; Q24/Q25 (planned) named in words only, never linked until built.
- O5 **Bench** (Q6): a right-hand axis (`y2`, curve `axis`) — sent to the platform builder.
- O6 **Cuts** (Q7): drop the 17 optional claims except `o2LinErr*`.
- O7 **Corrections**: the builder writes C1–C11 as proposed ("our calculation finds …", engine check); each ships only
  if the independent review re-reads it on the page IMAGE (`sources/mvs/pages/`) and recomputes it; C6 (two T_R
  definitions) is worded as an inconsistency between pages, not as a single wrong value.
- O8 **Budget shape**: one platform builder (running), one content builder (engine + presets + pages), one review, one
  fix pass; reviews and fixes on Sonnet.
