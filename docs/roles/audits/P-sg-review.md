# P truth review — the Stern–Gerlach bench (2026-09-28)

Independent, read-only review of the merged SG bench (merge 862cc24). **Verdict: FIX-FIRST.** The physics and every
number are right; the fixes are contrast, labels and a few pictures. Evidence: the scratchpad `sgreview-shots/` and
the `sgreview-*` scripts.

**What is right:**
- **Readouts.** A numpy projector twin matches every one: pass fractions, Born %, stops, ±, counted %, and totals that
  sum to N. It covers the builder's four states and these:
  - |+x⟩→135°(−)→z;
  - |−y⟩→30°(+)→200°;
  - oven→45°(−)→105°(+)→270° with 10 000 atoms;
  - both Try-this orders;
  - |+z⟩ at 60°, 150° and 300°.
- **Seeds.**
  - All 9 page volleys are reproduced exactly from their shown seeds; their χ² p-values run from 0.26 to 0.94.
  - 120 volleys of 10 000 atoms on 3 setups give uniform p-values (KS p = 0.42, 0.96, 0.59).
  - The u < p mapping shows no bias over 2×10⁷ draws, and the volley streams are ≥ 1.8 M draws apart.
- **Counts** accumulate only while the setup is unchanged. Any change, including a change back, starts fresh.
- **Tilt direction.** "From z toward x" means the same in the engine, the knob, the dial and L1. The inset puts +
  along +n̂ at every tilt tested.
- **The oven** is a mixture: ½ at any first magnet, labelled "unpolarized".
- **DOM twins:**
  - the knobs are sliders (±15°, Shift ±1°) with valuetext;
  - the keep radios and Remove buttons are labelled;
  - the one polite live region is muted during flight.
- **Homework: no line crossed.**
  - The Try-this implies one point of the HW1 P2 curve (¾·¼ at 60°), and L1 already gives p60 = 0.75.
  - No text, preset or readout gives the function, a plot or the maximum.
  - The 448 assigned items (L2 p.7, L3 p.5, L5 p.1) are untouched, and the sealed box never prints a ket.

Paths are under `app/src/lab/` unless stated.

## Blocking
1. **The + paper readouts fail text contrast (`lab.css:361–363`).** They use `--up` (#c9820c) on #e4eaee, measured at
   2.59:1 for 11.5 px text; WCAG asks 4.5:1. At 1024×768 and below 900 px these rows are the only + readout.
   **Fix:** use `var(--up-text)` (#804f00; `index.css:18`). Cobalt measures 5.29:1 and passes.

## Should-fix
2. **The ± sits on the wrong line (`benches/sg/model.ts:183–189`).** "Born 12.5 % ± 1.0 %" reads as uncertainty in the
   prediction. The Born value is exact. The ± is the 1σ scatter of the counted fraction, √(p(1−p)/N) in percentage
   points, and only the ⓘ note says so. At small p it prints "± 0.0 %".
   **Fix:** put it on the counted line ("expect ± 1.0 pt at N = 1 000"), with 2 decimals below 0.1.
3. **A bench part appears inside the plate inset (`babylon/sgScene.ts:602–604`).** The inset camera draws everything
   from 0.01 to 1.8 in front of it, and only the atoms are on layer a. When the chain runs low, the rail's end-on
   profile shows inside the plate face.
   **Fix:** set `minZ = INSET.back − 0.1`, or put the hardware on LAYER.a.
4. **The narrow-screen plate picture contradicts its caption (`benches/sg/SgBench.tsx:401`, below 900 px).**
   - The SVG always draws + above −, but the default preset ends on an x magnet, and the caption says "z up, x right".
   - Its "48.4 % +" divides by the atoms that reached the plate; the readouts divide by all atoms fired (23.8 %).

   **Fix:** rotate the spots to the last tilt, or caption the picture "counts only". Label the % or drop it.
5. **Scene contrast on the stage #1a1f28.**
   - The magnet faces measure 1.00–1.15:1, the lit pole face 1.6:1, and the yoke token 1.61:1.
   - The protractor ring measures 2.5–2.8:1 (`sgScene.ts:233`, silver2 at α 0.7), below 3:1 for a control track.
   - Passing: the knob 14.5:1, the pads 6.0:1, the labels ≥ 7:1.

   **Fix:** ring α 1 (3.7:1), and a lighter yoke or a silver2 edge outline.
6. **`benches/sg/fidelity.ts:35`** says atoms are "grey before the first magnet", but a sealed box sends them out
   amber or cobalt (`plate.ts:61`). Reword.
7. **A |±y⟩ box is indistinguishable from the oven on this bench (`model.ts:228`).**
   - Every n̂ lies in the x–z plane, so the first magnet passes ½, and after it the state is the kept outcome either
     way.
   - numpy: |−y⟩→30°(+)→200° and oven→30°(+)→200° both give + 0.380 % and − 49.620 %.
   - The amber atoms suggest a difference that no count shows.

   **Fix:** say so in the note. It is L6's mixture point: a mixture and a pure state that no x–z measurement tells
   apart.
8. **The Try-this (`model.ts:236, 246`).**
   - Verified: 9/32 = 28.125 % and 12/32 = 37.5 %. The ¾ (= cos²30°) is right at both steps.
   - "Order matters" is sound: commuting projectors would give equal P(+,+,+).
   - "Why did the + spot change?" is ambiguous, because the spot also moves: ask about the number of atoms in it.
   - One answer sentence runs 31 words and uses |+60°⟩ without defining it.
9. **The homework guard is stated as the wrong rule (`model.ts:12–14, 219`; `model.test.ts:251`).** Ruling 3 says "no
   preset at the optimum". For HW1 P2 the optimum is θ = 90°, and the `l1-zxz` preset sits there: its − spot is ¼ of
   the atoms that pass magnet 1, the maximum. The code restates the ruling as "tilts are multiples of 90°", which is a
   different rule.

   This is not a leak: L1 teaches z→x→z with these values, and nothing names a maximum.
   **Fix:** correct the comment and the test title; the judge rules on `l1-zxz` (below).

## Nits
10. Sentences over 25 words:
    - `fidelity.ts:13` has 26 words;
    - `fidelity.ts:17` has 27, and its p in √(p(1−p)/N) is never defined;
    - the canvas label at `useLabEngine.ts:26` has 29.
11. The passport says "ℝ³ · metres" on a bench that is not to scale (`SgBench.tsx:71`).
12. The same glyph does two jobs: "−" removes a magnet and also keeps the − beam; "+" adds a magnet and also keeps +.
    Use × to remove. The pads are 15–22 px against D-lab's 32 px target; the DOM twins still satisfy WCAG 2.5.8.
13. The SG fidelity note lacks the lecture's `lab-moment-opposite` line. Nothing contradicts the sign convention:
    + goes along +n̂, and no N/S labels or field arrow are drawn.
14. The tally line breaks inside a number (`tryA.png`).

## Judge's ruling (Claude, 2026-09-28)
- **Item 9: `l1-zxz` stays.** It is Lecture 1's own worked example (the notes' z–x–z), not a solution to HW1 P2. P2
  asks for the fraction as a function of the tilt and its maximum, and no text, preset, readout or plot on the bench
  gives either.
- The rule the code and its test must state is: **no preset, Try-this or readout gives the HW1 P2 function, a plot
  against the tilt, or its maximum. The only preset at 90° is the lectures' own z→x→z example.**
- A new preset may sit at a tilt other than a multiple of 90° only with a judge's ruling.
