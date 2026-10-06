# P review: 709 Q10 "Entanglement, no signalling and Bell's inequality" (main 3e8be11, reviewed 2026-10-06)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (3 blocking, 6 should-fix, 5 nits).
- Every displayed value is right: 2√2, the classical 2, the Peres −½, the ½I of no-signalling and all 12 challenge keys.
- **Blocking:**
  - The Tsirelson identity has the wrong sign and is cited to the wrong equation (item 1).
  - A plot marker labels the entangled Φ⁺ as "product" (item 2).
  - The instruction-card derivation views carry captions that are false about the pictures they sit under (item 3).
- **Must-check outcomes:**
  - Every S value is engine-backed: `chsh`, `chshCurve`, `lhvChsh` (via `plot`) and `eigh(C)`.
  - `chshMaxHorodecki` is not used anywhere in Q10. That is not a defect; it is recomputed below.
  - The optimal phase δ = 45° and the N&C settings check out.
  - No-signalling via Q9's reduced state is right, but it is still written as though Q9 were unbuilt (item 5).

## Evidence summary
- **`revQ10Q11-q10.py`** (scratchpad): 57 checks, 0 mismatches against the displayed values and `claims-qc709/q10.json`. The route is my own: `np.kron`, `einsum` partial traces, explicit projectors, and an enumeration of all 16 cards.
  - The C² identity was tested on 200 random settings: the sign Q10 prints holds 0/200, the opposite sign 200/200.
  - Bergou Eq. 3.17's sum of squares was tested both as printed and as corrected (B7).
  - Horodecki M(ρ) = 2√2 for Φ⁺, χ(45°) and Ψ⁻, and 2 for the box and Eq. 3.3's mixture.
  - The PR box: S = 4, and every marginal is ½.
- **Vitest:** `npx vitest run src/content/qc709`: 68 passed (4 files).
- **Sources read:**
  - Bergou printed pp. 31–37 and 40–41 (PDF 44–50, 53–54), with the p. 32 render viewed (Eq. 3.4: Ψ± = |00⟩±|11⟩, so "Bergou: Ψ₊" is right).
  - N&C pp. 105, 113–116 and 118 (Problem 2.3, Eq. 2.233).
- **Not done (economy):** no screenshots and no Playwright. Plot markers were judged from `stage/svg/plot.ts:68` (y = curve(x)) and the axis drawing from `TwoQubitScene.tsx:75` (unlabelled dashed lines).

## Blocking
1. **The Tsirelson identity has the wrong sign and the wrong citation.**
   - Q10 writes C² = 4I **+** [a₁,a₂]⊗[b₁,b₂] for C = a₁b₁ + a₁b₂ + a₂b₁ − a₂b₂. With Q10's own C, the true identity is C² = 4I **−** [a₁,a₂]⊗[b₁,b₂].
     - Expand: the cross terms are −a₁a₂[b₁,b₂] + a₂a₁[b₁,b₂] = −[a₁,a₂]⊗[b₁,b₂].
     - numpy: the minus sign holds 200/200, the plus sign 0/200.
   - The beat contradicts itself. At the x, y settings the printed form gives 4I − 4ZZ = diag(0,8,8,0), but the beat's own view `mx(prod(C_SRC,C_SRC))` draws diag(8,0,0,8).
   - **Where the + comes from:** N&C Eq. 2.233 (Problem 2.3, p. 118) has the + for QS + RS + RT − QT. There a₁ = R and a₂ = Q, so [Q,R] = −[a₁,a₂]; the letters were copied across without the reorder.
   - **Wrong citation:** Bergou Eq. 3.17 (p. 36) is a different route, the sum of squares 2√2 − C = (1/√2)(a₁ − (b₁+b₂)/√2)² + (1/√2)(a₂ − (b₁−b₂)/√2)². Erratum B7 is real (checked).
   - **Sites:**
     - `Q10.story.ts:460` (formal) and `:462` (captionFormal);
     - `:469` (Ground D7 step 2) and `:474` (Formal step 1);
     - `Q10.review.ts:97`;
     - `Q10.glossary.ts` `qc-tsirelson.formal`.
     - The plan (`P-Q10-story.md:308, 433, 437, 523, 572, 622`) has the same error, including its "checked in numpy" claim.
   - *Fix:*
     - Write `C^2 = 4I - [a_1, a_2]\otimes[b_1, b_2]` at every site.
     - Cite it "(N&C Problem 2.3, Eq. 2.233, p. 118, N&C ⚑; N&C's [Q, R] is our −[a₁, a₂])". No sheet assigns it (HW1/HW2 grep), so a walkthrough is allowed.
     - Keep "Bergou Eq. 3.17, erratum B7" only for the sum-of-squares route. One Formal sentence is enough.
2. **The "product" marker sits on Φ⁺ at S = 2** (`Q10.story.ts:440, 447, 452`).
   - `markers: [{ x: 0, label: 'product' }]` on `chshVsPhase` is drawn at (δ = 0, S(χ(0))) = (0, 2).
   - χ(0) = Φ⁺, the maximally entangled pair (numpy: `chi(0) == Phi+`).
   - So the picture calls Φ⁺ "product" and shows 2 at the band edge, while the ground viewCaption says "|+x⟩|+x⟩ scores 1, inside the band".
   - The `plot` kind cannot draw a product state.
   - *Fix:* in all three views use `plot({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -2, yTo: 2, label: 'classical' }] })` with no marker. Caption it "every product state's S stays in this band (|+x⟩|+x⟩: 1)".
3. **The D3 instruction-card views map card cases onto density-matrix entries that mean nothing of the kind** (`Q10.story.ts:319–326`).
   - Ground step 2 highlights the box's ⟨00|ρ|00⟩ as "a card with b₁ = b₂: one entry survives". Step 3 highlights ⟨11|ρ|11⟩ as "a card with b₁ = −b₂: the other entry".
   - Those entries are the chances of the box's |00⟩ and |11⟩ members. |11⟩ is a card with b₁ = b₂ = −1, not b₁ = −b₂.
   - Read with every setting along z, the box is honestly two cards, all +1 or all −1, and **both** have X = +2. The highlight therefore teaches a false correspondence.
   - *Fix:*
     - Step 2: `mx({rho: BOX_MIX}, {highlight: [[0,0],[3,3]]})`, captioned "the box with every setting along z: two cards, all +1 or all −1, each X = +2".
     - Step 3 (b₁ = −b₂): no view. The track keeps two distinct views (`tqR` and `mx`), as W-709 #7 requires.
   - The other loose LHV captions are item 7.

## Should-fix
4. **Three V keys are typed literals, so their claims test nothing** (`Q10.values.ts`).
   - The keys are `q10Half: 0.5`, `q10Third: 1/3` and `q10R2: Math.SQRT1_2`, each checked by `close(V.k, same literal)`. The remap ruling's "engine-backed answers" rule forbids this.
   - The ±0.707 in `q10-violation:b1` (text, caption, both viewCaptions) is also typed by hand, as are the plot `yLines` at `y: 2.828` (`:429, :494, :500`).
   - *Fix:*
     - `q10Half: -PHI_PT_EIGS[0]`, `q10Third: -reducedBloch(SEP33, 0)[2]`, `q10R2: correlator(chi(45), X, X)`.
     - Print `${d(V.q10R2, 3)}` and use `y: V.q10Tsirelson`.
5. **Q9 is merged, but Q10 still writes as if it were not built.**
   - The ruling says "No-signalling is shown via Q9's reduced-state machinery (bridge back to Q9)". Instead, `q10-no-signal:b2/b3` name "Chapter Q9" in words only, `concepts.ts:152` `qc-no-signalling.needs` is only `['qc-bell-basis-station']`, and the comments in `Q10.story.ts:14–17`, `Q10.glossary.ts:12–16` and `concepts.ts:148–150` are stale.
   - *Fix:*
     - In b2's formal text, link `[[qc-reduced-density-matrix|reduced density matrix]]` and `[[qc-partial-trace|$\mathrm{Tr}_A$]]`, and add the same pair to Ground b2's text.
     - Add `'qc-partial-trace-station'` to `qc-no-signalling.needs`, add the Q9 ids to `Q10.ts` `prerequisites`, and delete the stale comments.
6. **The overloaded letters have no Rosetta where they first appear** (ruling Q10/Q11 bullet 3).
   - X (the card score against the Pauli X already used as `X_1X_2`) gets no Rosetta line at `q10-hidden:b2`.
   - `q10-violation:b5` formal uses S for N&C's setting and for the CHSH value in one sentence.
   - *Fix:* add "Here $X$ is the card's score, not the Pauli $X$" to b2 in both tracks. In b5 write "N&C call Bob's two settings $S$ and $T$ (a setting, not the score); the score is again $2.828$."
7. **The other LHV and CHSH grid captions describe things the grid does not show.**
   - `q10-hidden:b1` "a card: four answers, fixed in advance" sits over the box's two centred balls and grid.
   - `q10-hidden:b2` "one bracket is 0, the other ±2" sits over ρ_box.
   - `q10-chsh:b2` D4 step 1 "the four correlators, read off a working card" sits over ρ_box, which shows no correlators.
   - D4 step 2 says "one card: the box", but the box is two cards.
   - *Verdict on the brief's question:* the text teaches the hidden-variable argument correctly, but these pictures do not illustrate it. They are decoration with captions that claim more than the picture shows.
   - *Fix (an honest reading):*
     - b1: "the box: a coin hands out one of two cards".
     - b2: "the box's two cards (every setting z): both X = +2".
     - D4 step 1: "the box, all settings z: S = 1 + 1 + 1 − 1 = 2, exactly the ceiling".
     - D4 step 2: "two cards, each X = +2, chance ½".
8. **Two Ground-up statements are wrong as written.**
   - (a) `q10-separable:b3` D1 step 2's tex is `\langle X_1X_2\rangle = 0,\ \langle X_1X_2\rangle = 1`, which reads as a contradiction.
     - *Fix:* `\langle X_1X_2\rangle_{\text{box}} = 0,\ \langle X_1X_2\rangle_{\Phi^+} = 1`.
   - (b) `q10-chsh:b1` says "0 if they are unrelated … right ½ the time". Q10's own `|+x⟩|+x⟩` is an unrelated (product) pair with ⟨XX⟩ = 1, and "right" is undefined.
     - *Fix:* "0 if they agree exactly as often as they disagree", and in Formal "a correlator of 0 means the readings agree ½ the time".
9. **Five citations are off by one page.**
   - Peres/PPT is on Bergou **p. 40**, not 41 (`Q10.story.ts:138`, `qc-ppt.formal`).
   - The PR box is on **p. 37**, Eq. 3.19, not p. 36 (`:493, :497`, `qc-pr-box.formal`).
   - The `q10-chsh` lecture's "p. 34, Eq. 3.10" should be **p. 35**.
   - The `q10-violation` lecture should read **pp. 35–37** (Eq. 3.11 is on p. 35, Eq. 3.19 on p. 37).
   - The `q10-chsh` N&C book should read **pp. 114–115** (p. 113 is Box 2.7, EPR; Eq. 2.225 is on p. 115).

## Nits
10. `NC_A = ['+z','+x']` is (Q, R), while `q10NCS` uses a₁ = R = X, a₂ = Q = Z. This is invisible on screen because the axes are unlabelled lines, but swap it to `['+x','+z']` so the stage data and the claim agree.
11. The `q10-chsh` visual's tryThis says "the same phase knob the CHSH experiment turns". The experiment turns settings, not the state's phase. *Fix:* "the phase δ of Bergou's χ".
12. `q10-separable` visual (`bloch`): "The mixture of two sits inside". The sphere kind draws pure points only. Drop that line.
13. `q10-no-signal:b2` Formal D2 step 2 shows one x branch (Bob at +x) beside "ρ_B = ½I". Add a viewCaption: "one of Alice's x branches; its partner at −x averages it away".
14. `Q10.values.ts` comment "Bergou's violating pair at its worst phase" should say "at its best (maximal) phase".

## Builder's-language questions
- Ground-up calls ρ^{T_B}'s eigenvalues "chances" (b3 and its reveal). This is acceptable as a metaphor, but "a negative chance" is the whole PPT test, so a gloss line ("an eigenvalue that would be a chance") would help.
- `q10-hidden` visual (sg-lab): "each axis has fixed statistics, like a card's answers". A card fixes answers, not statistics.

## Checked and right
- **Separable unit.**
  - Bergou Eq. 3.3's reduced r = (0,0,−⅓) on both sides.
  - Box grid diag(0,0,1); Φ⁺ grid diag(1,−1,1); both reduced states ½I.
  - Box ρ^{T_B} eigenvalues (0,0,½,½); Φ⁺'s (−½,½,½,½).
  - |0⟩⟨0|⊗½I is PPT. All three distractors in `q10-s-which` are separable.
- **No-signalling.**
  - Alice in z, x or a 30° tilt: p = (½,½) and Bob's average is ½I.
  - Bergou's phase-gate-and-H scheme gives p₀ᵦ = ½ with and without Alice's x reading, at three φ.
  - The Bergou §3.2 paraphrase is faithful ("rediscovered" is on p. 33).
- **Cards.**
  - All 16 have |X| = 2, and 8 of them +2.
  - The warm-up card gives X = 2; Bergou's example card (1,−1,−1,−1) gives X = −2.
  - LHV.maxS = 2, from `lhvChsh`.
- **Violation.**
  - χ(45°) correlators are (.707, .707, .707, −.707), so S = 2.828.
  - S(δ) = 2cos δ + 2sin δ: S(0) = S(90°) = 2 with the maximum at 45°, so δ = 45° is optimal. The dial marker comes from `chshCurve`.
  - The product state gives S = 1. C has eigenvalues (±2√2, 0, 0) and C² has (0,0,8,8).
  - N&C's four correlators and 2√2 match Eqs. 2.229–2.230, and the NC_B axes (135°,180°) and (45°,180°) equal −(x+z)/√2 and (z−x)/√2.
  - The PR box gives S = 4 with every marginal ½.
- **Tracks and glossary.**
  - Each derivation has at least 2 distinct views per track. Every notation beat introduces its term.
  - No raw TeX outside `$…$`, no plan ids in learner text, and no amplitude percentages.
  - Bridges `qc-l6-mixture` and `qc-l1-logic` resolve to the L6 and L1 units.
  - No glossary id is duplicated across `qc709/*.glossary.ts`. `qc-ppt` (Q10 gloss) and the Q12 concept `qc-ppt` are in different namespaces.
