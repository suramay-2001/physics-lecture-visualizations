# Rulings: the 448 Townsend pass over L1–L13 (judge, 2026-10-20)

Owner (2026-10-20): update all thirteen 448 lectures with Townsend (2nd ed.) Ch 1–6 formalism, visualizations and
formulas, and add sample questions based on the released homeworks; 448 HW1–HW6 submitted; the owner's solution scans are
read locally for problem TYPES only; budget 25 weekly points. Plans: `docs/roles/proposals/P-448-townsend-G1.md` (L1–L4),
`-G2.md` (L5–L8), `-G3.md` (L9–L10), `-G4.md` (L11–L13). Private digests (equations, figures, examples):
`sources/townsend/digest-G{1..4}.md` (git-ignored). Every plan's open questions are answered with its recommendation
unless a ruling below says otherwise.

## Shared
- T1 **Practice questions** use the new optional `Challenge.practice: 'homework' | 'townsend'` (schema.ts; a dashed chip on
  the card and the Help page; landed by the judge). 3–5 per lecture; walkthroughs in full (all homeworks submitted).
  'homework' = modeled on a released homework problem TYPE with new numbers; 'townsend' = modeled on an end-of-chapter
  problem type (cite the problem number in `refs`). Homework labels such as "H1-1.3a" never enter `app/`, `docs/context`
  or commit messages (G1 Q8); the student's work is never reproduced.
- T2 **Visuals** are engine-drawn states of existing kinds, never copies of Townsend's figures. New stage pieces approved:
  `LabDevice.merge` (G1), `matrix.labels: 'spin'` (G1 S2), `amplitudes.inBasis: {local}` and `plot.points` in 448 with
  `V`-key values (G3 Q4, Q5), plot curves `polChain` (G2) and `bellBisectGap` (G3), the `wavefunction` box source and
  the step/tunnelling plots (G4), and ONE new SVG kind `spin-ladder` (G2, via skill 10). Nothing else new in `stage/`.
- T3 **Books-only content** is allowed: new units made only of `books` beats open with a one-line lede saying the lecture
  notes do not cover this (G4 Q1); they sit after the lecture units, so a reader following only the notes loses nothing.
  Townsend §4.4 and §6.8–6.10 are in scope on that basis (G4 Q2).
- T4 **Reported experimental numbers** (Aspect, hyperfine frequency, muon/neutron values read off a figure): 448 has no
  reported channel, so they are stated in words without digits, citing Townsend's page (G3 Q1); G4 Q7 is overruled the
  same way (no `l12TMuonG`). Every digit on screen is computed.
- T5 **Corrections**: only the p. 231 transmission (printed 0.68; our calculation finds 0.706 for E = 5 eV, V₀ = 10 eV,
  a = 0.53 Å; the judge re-derived κa = 0.607, T = 1/(1 + sinh²κa) = 0.706) becomes a Correction box, after the G4
  builder re-reads p. 231 (PDF 247) on the image and the review re-checks it. Eq. 4.44b's label typo, Ex. 5.1's sign
  slip, Eq. 2.90's overall sign and Townsend's circular-polarization naming are Rosetta lines at most, no boxes.
- T6 **OCR-only pages** (G4 digest header: PDF 153–156, 240, 244, 248–260): the G4 builders re-read any of these on the
  page image before citing an equation or number from them.
- T7 **Ownership**: L11 owns Townsend §4.1 (G4 Q3; `l12-law:b7` becomes a pointer); L5 owns the S_n eigenproblem in the
  x–y plane, L6 the polar angle (G2 Q2); L6 owns Eqs. 2.29–2.43 (G2 Q3; the adjoint argument 2.25–2.28 stays with G1's
  lecture); L10 owns the hyperfine matrix (G3 Q2); teleportation and no-cloning get one link-out beat to 709 (G3 Q3).
- T8 **New unit** `l7-ladder` approved (G2 Q1), built after `spin-ladder`; if the kind slips, hold the unit and move its
  practice question to `l7-uncertainty` (G2 Q9).
- T9 **Build split** (two heavy agents at once; serial merges, `UPDATE_META=1` twice after each): G1 (L1–L4, `merge`,
  constants, `pathLedger`, `binomialSigma`, `matrix.labels`), G2a (L5–L6), G2b (L7–L8, `angmom.ts`, `spin-ladder`,
  `polChain`), G3 (L9–L10), G4a (L11–L12), G4b (L13, `scatter.ts`). Order: G1 ∥ G3, then G2a ∥ G4a, then G2b ∥ G4b.
- T10 **Reviews**: two independent reviews (L1–L8; L9–L13), each recomputing with its own numpy and re-reading the cited
  Townsend pages on the images; then one fix pass each.
- T11 **Copyright**: paraphrase only; the 8-gram verbatim guard plus a 7-word overlap sweep against `sources/townsend`
  for every new beat (the notes-page lesson of 2026-10-18).
