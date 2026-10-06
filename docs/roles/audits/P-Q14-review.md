# P review: 709 Q14 "Generalized measurements and telling states apart" (main 157556a, reviewed 2026-10-06)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (4 blocking, 6 should-fix, 6 nits, plus 1 builder's-language question).
- **Numbers are right:** every displayed decimal and all 16 challenge keys check out with an independent numpy route. The engine's `isPOVM`, `neumark`, `helstrom` and `usd` agree with it for the unsharp meter, the trine, N&C's never-err POVM and the |0⟩/|+⟩ pair.
- **Blocking:**
  - The Helstrom "optimal split" axis is drawn along the bisector, which is the useless measurement (item 1).
  - The USD detectors mix Bergou's and N&C's E₁/E₂ labels, so the drawn "E₁" breaks the chapter's own E₁|ψ₂⟩ = 0 (item 2).
  - All six Try-its are impossible on their widgets, and one is false: "90° apart" (item 3).
  - A false Ground sentence says the success curves "meet at both ends" (item 4).
- **Ruling-3 fallbacks are in place:** decimal POVM directions with the coefficient in the caption, and Σ Eᵢ = I drawn as I. The picture/caption mismatches are items 1, 7(a) and 7(b). The promised parameter *sweep* was never built (item 7(c)).

## Evidence summary
- **`revQ14F2-q14.py`** (scratchpad): 71 checks, 0 mismatches against the displayed values and `claims-qc709/q14.json`.
  My own route: Bloch-vector closed forms, brute-force optimisation over measurements, and an isometry built from
  rank-one roots √(2/3)|ψⱼ⟩⟨ψⱼ| (no `sqrtm`, no engine helpers).
  - **POVMs:** each one I checked passes `isPOVM` (Σ = I to 1e-12, min eigenvalue ≥ 0): the unsharp Z at η = ½, the trine and N&C's {E₀, E₁, E₂}. E₊ has eigenvalues 0.75 and 0.25.
  - **Trine:** Bloch directions (120°, 0°), (120°, 180°) and the north pole. Σⱼ|ψⱼ⟩⟨ψⱼ| = 1.5 I. Every pairwise |⟨ψᵢ|ψⱼ⟩|² = ¼. On ψ₀ the chances are ⅔ and ⅙; on |0⟩ they are (⅙, ⅙, ⅔).
  - **Neumark:** V†V = I to 1e-12, and the dilated chances on |0⟩ equal the POVM chances to 1e-12. Extending V "by the identity on the complement of |ψ_B⟩" is **not** unitary: max|U†U − I| = 0.816 (item 6).
  - **USD:** brute force over Bergou's family c₁|ψ₂^⊥⟩⟨ψ₂^⊥| + c₂|ψ₁^⊥⟩⟨ψ₁^⊥| gives 0.2929 = 1 − 1/√2. N&C's (2−√2) POVM reaches it. With N&C's labels (ψ₁ = |0⟩, ψ₂ = |+⟩), ‖E₁|ψ₂⟩‖ = 0.414, so E₁ fires on |ψ₂⟩ (item 2).
  - **Helstrom:** Γ has spectrum ±0.3536, ‖Γ‖₁ = √(1−c²) = 0.7071, success 0.8536 and error 0.1464. A brute-force axis search finds the optimum at (θ, φ) = (45°, **180°**), Γ's eigen-axis (−0.707, 0, 0.707). The chapter's axis (45°, 0°) gives success **0.5** (item 1).
  - **Comparison:** ½(1+√(1−c²)) ≥ 1−c and P_E ≤ ½Q hold on a 2001-point grid of c. P_E ≤ ½Q_opt (Eq. 5.61) also holds for 19 unequal priors, with the IDP/von Neumann branches. At c = 1 the curves end at ½ (min-error) and 0 (USD).
- **Vitest:** `npx vitest run src/content/qc709`: 68 passed (4 files). The numpy twin `q14.py` mirrors the engine key-for-key. It has no matching slips, but its `q14Half`/`q14ThreeHalves` are constants (item 5).
- **Sources read:**
  - Bergou printed pp. 78–80 (§5.2, Eqs. 5.1–5.7), 81–83 (§5.3, Eq. 5.11, Postulate 5′), 85–87 (§5.4, Eqs. 5.15–5.27), 89–93 (§5.5.1, Eqs. 5.32–5.44), 94–98 (§5.5.2, Eqs. 5.47–5.61) and 107 (§6.3, B92).
  - N&C pp. 85 (Eq. 2.92), 90 (Eq. 2.117) and 92 (Eqs. 2.118–2.120). Offsets are those of `P-709-map.md` (d)-E1 and N&C = PDF − 28.
- **Widgets and stages:** read from source, with no screenshots and no Playwright (per the brief).
  - `widgets/BlochSphere.tsx` is one editable point with ⟨S⟩ and |α|² readouts.
  - `OperatorBuilder.tsx` builds S_n from an axis's projectors only.
  - `PhaseDial.tsx` sets the relative phase of one equator state.
  - `BlochBallScene.tsx` draws `measure` as a dashed axis with outcome dots at ±n̂ and reads out P(+n̂) for `point`.

## Blocking
1. **The drawn "optimal split" for Helstrom is the one measurement that tells |0⟩ and |+⟩ apart not at all.**
   - **The axis:** `HELSTROM_AXIS = {thetaDeg: 45, phiDeg: 0}` (`Q14.story.ts:71`, commented "bisector of |0⟩ and |+⟩") is the *bisector* of the two Bloch vectors.
   - **Why it fails:** both states project equally on that axis. P(+n̂) = 0.854 on |0⟩ **and** on |+⟩, so guessing by the outcome succeeds ½.
   - **Misleading readout:** the scene's axis readout shows P(+n̂) = 0.854 for the point |0⟩, which looks like the Helstrom success.
   - **The true optimum:** the axis along the *difference* of the Bloch vectors, Γ's eigen-axis (−1, 0, 1)/√2, i.e. θ = 45°, φ = 180°. Bergou p. 97 also says the detectors sit "symmetrically around" the states.
   - **Sites:** `q14-min-error:b3` (stage, Ground step 2 view "the optimal split between the two states", Formal step 2 view) and `q14-compare:b3` stage.
   - *Fix:* `const HELSTROM_AXIS = { thetaDeg: 45, phiDeg: 180 } // Γ's eigen-axis: + ↔ guess |0⟩, − ↔ guess |+⟩`. The readout then shows P(+n̂ | 0) = 0.854 = P_succ, an honest picture.
2. **The USD detectors carry two opposite labelling conventions at once.**
   - **Bergou** (Eq. 5.33, p. 90): Π₁|ψ₂⟩ = 0, so a click of Π₁ means ψ₁. The chapter states this in `q14-usd:b1/b2` Formal, `insightFormal`, the review card and the `qc-unambiguous-discrimination` gloss.
   - **N&C** (p. 92): ψ₁ = |0⟩, ψ₂ = |+⟩, and E₁ ∝ |1⟩⟨1| is chosen so that ⟨ψ₁|E₁|ψ₁⟩ = 0, so E₁ means ψ₂.
   - **The clash:** the chapter draws and names N&C's operator as "E₁ = (2−√2)|1⟩⟨1|" (`q14-usd:b2` caption; `q14-compare:b2` Ground step 3 viewCaption "the USD detector $E_1$"). With the N&C pair this E₁ has ‖E₁|ψ₂⟩‖ = 0.414 ≠ 0, which breaks the chapter's own defining condition.
   - **The Ground text sides with N&C:** `q14-usd:b2` Ground says "$E_1$ fires only on $|\psi_2\rangle$'s side, $E_2$ only on $|\psi_1\rangle$'s". This is the opposite of its own Formal track one line over.
   - **The pair is never assigned:** the chapter never says which of |0⟩, |+⟩ is ψ₁.
   - *Fix:*
     - State ψ₁ = |0⟩, ψ₂ = |+⟩ once in `q14-usd:b1` (both tracks). This matches `ball(D0, {compare: DPLUS})`.
     - Keep Bergou's convention.
     - Rename the drawn operator to "$E_2 = (2-\sqrt2)|1\rangle\langle1|$ (N&C label the outcomes the other way round and call it $E_1$)" in the b2 caption and the compare:b2 viewCaption.
     - In b3 Formal write "$E_2$ never fires for $|0\rangle$, so its click means $|+\rangle$".
     - Ground b2: "$E_1$ never fires on $|\psi_2\rangle$, so its click means $|\psi_1\rangle$; $E_2$ never fires on $|\psi_1\rangle$."
3. **None of the six Try-its can be done on its widget, and one is physically false.** Q11 precedent: a false or impossible tryThis is Blocking. The instructions are copied from the plan's §3 stand-in table, which itself flags the POVM widget as missing (§9.3 W14).
   - **(a) `q14-pointer` (`Q14.ts:157`), operator-builder:** "Build ½(I + ½Z)". The widget only builds S_n = ½(P₊ − P₋) for an axis; it has no η and no identity term.
     - *Fix:* "Pick z: $P_+$ and $P_-$ are the sharp meter. The soft meter at $\eta=\tfrac12$ blends them, $E_+ = \tfrac34P_+ + \tfrac14P_-$."
   - **(b) `q14-povm` (`:207`), bloch:** "outcome 0 wins with chance ⅔, each other with ⅙". The widget shows no POVM outcomes.
     - *Fix:* "Set θ = 120°, φ = 0°: that is $|\psi_0\rangle$. Read $|\alpha|^2 = 0.25 = |\langle\psi_2|\psi_0\rangle|^2$, the trine overlap that gives the ⅙ error."
   - **(c) `q14-neumark` (`:261`), operator-builder:** "Build any isometry's V†V". The widget has no isometry.
     - *Fix:* "Check the readout $P_+ + P_- = I$: completeness is what makes $V^\dagger V = I$."
   - **(d) `q14-usd` (`:318`), bloch:** "Drag the two states together". The widget has one state.
     - *Fix:* "Lower θ from 90° toward 0°: the state's overlap with $|0\rangle$, $|\alpha|$, grows. That overlap is the inconclusive rate."
   - **(e) `q14-min-error` (`:372`), bloch:** "Place the two states 90° apart: the error drops to 0". This is **false**: orthogonal states are 180° apart on the Bloch sphere. 90° apart is exactly the |0⟩/|+⟩ pair, with P_E = 0.146. The widget also has one state.
     - *Fix:* "Set θ = 180°: $|1\rangle$ is opposite $|0\rangle$, overlap $0$, and the Helstrom error drops to $0$."
   - **(f) `q14-compare` (`:426`), phase-dial:** "Dial to orthogonal: both strategies reach success 1". The dial shows no strategies.
     - *Fix:* "Set the dial to 0° ($|+\rangle$), then 180° ($|-\rangle$): the two states are orthogonal, so both strategies succeed with certainty." The widget starts at 90°, which is $|{+i}\rangle$.
4. **The Ground track of `q14-compare:b2` says something false** (`Q14.story.ts:491`): "The two numbers meet only at the ends: both perfect when … perpendicular, both useless when they coincide".
   - At c = 1 the two numbers are ½ (min-error) and 0 (USD). The chapter's own Formal track (`:493`) and the review trap ("meeting USD only at the endpoint $c=0$") say so.
   - *Fix:* "They meet only for perpendicular states, both $1$. When the states coincide, minimum-error is a coin toss, $\tfrac12$, and unambiguous never answers, $0$."

## Should-fix
5. **Five claims check nothing about their own text** (the `P-Q1-review.md` item 5 class).
   - **`q14ThreeHalves`** (`povm:b2`): the text says "the three trine directions … sum to one and a half times the identity", but the check is `close(1.5, 1.5)`, and the twin is the same constant.
   - **`q14Half`** (`usd:b1`, `min-error:b1`, `compare:b1`): a constant 0.5 standing in for "a prior, coefficient or success share".
   - **Matching slips that are only numerically true:**
     - `min-error:b3` backs "Γ's trace norm is 2×0.354 = 0.707, the running pair's overlap" with `q14Overlap0Plus`. In fact ‖Γ‖₁ = √(1−c²), which equals c only because c² = ½ here, and the sentence presents that as general.
     - `compare:b3` backs "half the inconclusive rate is 0.354" with `q14HelstromGammaHi` (Γ's eigenvalue √(1−c²)/2), not with Q/2.
   - *Fix:* add engine keys with numpy twins and point each claim at the right one:
     - `q14TrineProjDiag` = Σⱼ|ψⱼ⟩⟨ψⱼ|[0][0] (the 1.5);
     - `q14GammaTraceNorm` = traceNorm(Γ);
     - `q14UsdHalfInconcl` = (1 − usd)/2.
   - Reword the min-error:b3 claim to "$\lVert\Gamma\rVert_1 = \sqrt{1-c^2} = 0.707$ (equal to $c$ only for this pair)".
   - Drop `q14Half` wherever no ½ is displayed.
6. **The Neumark extension step is false as written** (`neumark:b3` Formal step 2 `why`): "Extend $V$ by the identity on the complement of $|\psi_B\rangle$".
   - V's range overlaps H_A⊗|ψ_B⟩^⊥, so the result is not unitary. For the trine, max|U†U − I| = 0.816.
   - This is a slip in Bergou p. 86 ("e.g."), copied into the chapter.
   - *Fix:* "Complete $V$'s orthonormal columns to an orthonormal basis of $H_A\otimes H_B$ (Gram–Schmidt): every isometry extends to a unitary." Optionally add a Bergou erratum to the chapter's errata.
7. **Captions that don't quite match their pictures, and the ruling-3 sweep was never built.**
   - **(a) `neumark:b4` reveal:** the caption "a qutrit ancilla" sits over `circ(2)`, a two-wire *qubit* meter.
     - *Fix:* "the trine needs a qutrit ancilla (drawn: the generic qubit meter); the lift reproduces $\mathrm{Tr}(E_j\rho)$ exactly".
   - **(b) `min-error:b4` reveal:** the stage draws ρ₊'s spectrum {0, 1} under "if Γ has one sign".
     - *Fix:* append "(drawn: $\Gamma$ at $\eta_1 = 0$, which is $\rho_2$ itself — eigenvalues $0$ and $1$)".
   - **(c) Comparisons are static:** ruling 3 replaced the three plot curves with "a `matrix{spectrum}`/`amplitudes` **parameter sweep**, value in the caption". No beat sweeps anything.
     - `compare:b2`'s "the two numbers meet only …" and `usd:b4`'s "push the two states together" sit over a fixed |0⟩/|+⟩ Γ spectrum.
     - *Fix:* in `compare:b2` (and `usd:b4`), make the ball's `compare` a scrubbed `Dir` (`thetaDeg` sweeping 0°→180°, `phiDeg` 0). The caption then states the two end values from `V`.
   - Every other caption matches its picture, judged from the stage source (see *Checked and right*).
8. **Symbols used before they are defined:**
   - **c:** used in the `q14-me-succ`/`q14-me-err` hints (unit 5) and `insightFormal` before `compare:b2` defines it. The symbol table maps `c` to `q14-usd:b3`, which never writes c.
   - **Θ:** appears in `usd:b3` Formal with no definition.
   - **Ground track:**
     - η and E± appear in the `pointer:b2` caption, but the Ground text never introduces them.
     - η₁, η₂, ρ₁ and ρ₂ appear in the `min-error:b2` Ground text; the priors are introduced only in Formal `usd:b1`.
     - Q appears in the `compare:b3` Ground caption.
   - *Fix:*
     - In `usd:b3`, both tracks: "Call the overlap $c = |\langle\psi_1|\psi_2\rangle| = 0.707$". In Formal, add "with $\cos\Theta = c$".
     - Ground pointer:b2: "Call the sharpness $\eta$ (0 to 1); the soft outcomes are $E_\pm$."
     - Ground min-error:b2: "($\eta_1, \eta_2$: how likely each state is; $\rho_1, \rho_2$: the two states)".
     - Ground compare:b3 caption: write "the unsure rate" in place of $Q$.
9. **`usd:b3` Formal swaps success and failure:** "the optimal success is $1 - |\langle\psi_1|\psi_2\rangle|$ (Bergou's $Q^{\mathrm{POVM}} = 2\sqrt{\eta_1\eta_2}\cos\Theta$, Eq. 5.42 …)".
   - Q^POVM is Bergou's optimal **failure** probability (p. 92).
   - *Fix:* "the optimal failure is Bergou's $Q^{\mathrm{POVM}} = 2\sqrt{\eta_1\eta_2}\cos\Theta$ (Eq. 5.42), $= c$ at $\eta_i = \tfrac12$, so success is $1 - c$".
10. **Citations, checked against the rendered pages:**
    - **(a) Eq. 5.61 page range:** Eq. 5.61 is on printed **p. 98**, and §5.5.2 runs pp. 94–98. Fix `q14-min-error` `books` "pp. 93–97" → "pp. 94–98" and `q14-compare` "pp. 92–97" → "pp. 92–98".
    - **(b) The trine lives in §5.4:** Eqs. 5.24–5.25 are §5.4, pp. 86–87, not "§5.3, pp. 81–84". Eqs. 5.9–5.10 are §5.2's moments, not POVM material.
      - Fix the `q14-povm` books entry to "§5.3, pp. 81–84, Eq. 5.11; §5.4, pp. 86–87, Eqs. 5.24–5.25".
      - Change `qc-trine.formal` "(Bergou §5.3)" → "(§5.4, Eqs. 5.24–5.25)".
      - Change `povm:b3` Formal "(Eq. 5.24) takes $A_j$" → "(Eqs. 5.24–5.25) … one choice of $A_j$ ($U_j = I$)".
    - **(c) N&C Eq. 2.92 is in §2.2.3:** the measurement operators and Eq. 2.92 are Postulate 3, §2.2.3, p. 85, not "§2.2.4–2.2.5, pp. 86–90". Fix the `q14-pointer` N&C entry.

## Nits
11. **Dead `V` keys:** `q14Fig51Lo/Hi`, `q14NcElemsSumGap`, `q14TrineOnZero0–2`, `q14NeumarkMatch1` and `q14UnsharpPPlusMinus` are computed and twinned but never displayed or claimed.
    - The Neumark reveal's "the same as $\mathrm{Tr}(E_j\rho)$" is checked against the hand constants ⅙ and ⅔, not against the POVM's own chances.
    - *Fix:* `close(V.q14NeumarkMatch0, V.q14TrineOnZero0)` (and the same for index 2). Drop the Fig. 5.1 keys.
12. **`neumark:b1` is the notation beat for `qc-dilation-space`, yet neither track names the term.** *Fix:* Formal "…the enlarged space $H_A\otimes H_B$, the [[qc-dilation-space|dilation space]]".
13. **`povm:b1` draws a sharp projector |1⟩⟨1| under "keep only this: each outcome positive, all adding to $I$".** *Fix:* add "(drawn: a sharp element, the case being generalised)".
14. **`min-error:b4`'s reveal claim is off-topic:** `q14CompareC0Helstrom` (orthogonal states) has nothing to do with the skewed-prior point it sits under.
15. **`qc-trine` gloss** "Three qubit states 120° apart": add "on the Bloch sphere". The state vectors themselves are 60° apart.
16. **`E_i` arrives early:** it is used in the `pointer:b4` reveal (Formal) before its notation beat `povm:b2`. This is harmless, since that reveal previews the next unit.

## Builder's-language questions
- **Two review-card Formal traps describe the app, not physics:**
  - `q14-povm`: "Drawing a POVM element as if its coefficient were exact … the scale is a stated number, not a drawn one".
  - `q14-pointer`: "Expecting a displayed number from the pointer-shift formula itself: every number here comes from …".
  - *Suggested:*
    - povm: "Thinking POVM elements are projectors: $E_j = \tfrac23|\psi_j\rangle\langle\psi_j|$ has $E_j^2 = \tfrac23E_j \ne E_j$."
    - pointer: "Reading $x_j = gt\lambda_j$ as a probability: it is where the pointer lands, not how often."

## Checked and right
- **Numbers:** every displayed number is right (0.75/0.25, 0.5, 0.667/0.167, ancilla dimension 3, (0.167, 0.167, 0.667), 0.707, 0.293, 2−√2 = 0.586, ±0.354, 0.854/0.146, 0.354), and so are all 16 challenge keys and their hints.
  - The Formal pure-state form ½(1 − √(1 − 4η₁η₂c²)) matches Bergou Eq. 5.59.
  - The "no negative eigenvalue ⇒ E₁ = 0, E₂ = I, error η_min" case matches Bergou pp. 96–97.
  - P_E ≤ ½Q_opt holds (Eq. 5.61, p. 98).
- **Equations:** the pointer model (H ⊃ ħgXP, U = e^{−igtXP}, x_j = gtλ_j; Eqs. 5.3–5.7), Postulate 5′, the polar form A_i = U_i√E_i (Eq. 5.11) and Neumark Eqs. 5.15–5.23 are all faithful to the book.
- **Trine:** the states are Bergou Eq. 5.24 exactly (θ = 120°/φ = 0°, 180°, and the north pole).
- **B92:** the forward reference is right. Bergou §6.3 uses |0⟩, |+⟩, Bob's USD (Eq. 5.42) and Eve's min-error error (Eq. 5.59).
- **Ruling 3 fallbacks:**
  - POVM elements are drawn as decimal rank-one directions, with ⅔ and 2−√2 in the caption.
  - Σ Eᵢ = I is drawn as `I`.
  - The exact nested-`lin` E₊ = diag(0.75, 0.25) and Γ = ½(ρ₊ − ρ₀) (spectrum ±0.354) are drawn correctly.
  - Apart from items 1, 2 and 7, every stage matches its caption: the pointer circuit, the trine direction ψ₀/ψ₁ grids, the |0⟩/|+⟩ and |0⟩/|1⟩ ball pairs, and the Γ spectrum.
- **Derivations:** all six derivations have at least 2 distinct views per track (circuit/matrix/bloch/ball). Every step is true except item 6, and both tracks end on the stated result.
- **Notation beats:** `qc-povm-element`, `qc-inconclusive-outcome` and `qc-helstrom-bound` each truly introduce their term (for the fourth, see nit 12).
- **Glossary and text lint:**
  - The 13 new glossary ids are all new and duplicate no id in any other `qc709/*.glossary.ts`; the reused ids are named in the header.
  - No raw TeX outside `$…$` (scratchpad `revQ14F2-lint.py`), no percentages and no plan ids.
  - The phase is `'books'`/`'clue'` throughout, per ruling 6.
  - The sequential unit is dropped (ruling 1). USD comes before min-error, and the |0⟩, |+⟩ pair is kept (rulings 4–5).
