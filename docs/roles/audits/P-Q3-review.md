# P review: 709 Q3 "Measurement, the Bloch sphere and uncertainty" (merge 00fce9e; reviewed 2026-10-02)

**Verdict: FIX-FIRST.** Every engine value is right (63 keys recomputed independently). Three learner-visible statements
are false (an insight, a challenge `why`, a review trap), and every Formal unit insight renders as raw TeX. The revised
notes moved most of this chapter: from p. 12 on, ~30 page/equation citations are off, units 5–6 are now notes Lecture 4
(9/16, pp. 17–20), and the new p. 12 parametrization and p. 14 ⟨σ⟩ = n derivations have no [L] beat.

Evidence (scratchpad `revQ2Q3-*`): `revQ2Q3-recompute.py` (own numpy: explicit Pauli matrices, `eigvalsh`, direct
sandwiches) — 63 Q3 keys agree with `claims-qc709/q3.json` (one key differs by 4e-9, √ of a float zero); all 24 challenge
keys and hints re-derived; live check on the dev server `#/709/ch/Q3`: Formal track shows 44 raw TeX commands
(`\langle`, `\tfrac`, `\Leftrightarrow`…), Ground 0; fresh load + track switch + scroll: 0 console errors. Book citations
looked up in the text layers (`revQ2Q3-cites.py`, `-snip*.py`); notes against revised `qc709-n3` (pp. 11–16) and
`qc709-n4` (pp. 17–20). Not re-run (economy): full contact sheets, live bridge round-trips (16 ids/17 links resolve).

## Blocking

1. **"Equality for pure spin-½ states" is false** (`q3-uncertainty` insightFormal, `Q3.ts:508–509`). Robertson's gap is
   (n_x²n_y²/16)ħ⁴ — the chapter's own `q3-u-which` says so — and at the chapter's |+n⟩ it is 0.0088ħ⁴ (b4 Formal prints
   it; numpy: slack 0.008789 at θ = 60°, φ = 45°; 0.000732 at 30°/30°). *Fix:* "…; for spin-½ pure states, equality
   exactly when n_xn_y = 0 (e.g. |±z⟩)". (Every pure qubit saturates the Schrödinger form, which keeps the dropped
   anticommutator term — say that instead if the point is wanted.)
2. **`q3-o-sy`: "[[0, i], [i, 0]] … is Hermitian"** (`Q3.ts:312`). Its adjoint is [[0, −i], [−i, 0]]: it is iσ_x,
   anti-Hermitian, eigenvalues ±i (numpy `allclose(M, M†)` False). *Fix:* "Not Hermitian: the corners are not
   conjugates (it is iσ_x)."
3. **The spectral review trap states N21 backwards** (`Q3.review.ts:99`): "Û†ÂÛ is diagonal only when p. 9's Û has the
   eigenvectors as its ROWS". With rows = eigen-bras (p. 9's U_ij = ⟨α′_i|α_j⟩) it is ÛÂÛ† that is diagonal; Û†ÂÛ
   needs COLUMNS = eigenvectors — exactly what the errata box (`Q3.ts` correction) and the engine say (z→y: Uσ_yU† =
   diag(1, −1), U†σ_yU = σ_x). *Fix:* "…only when Û's COLUMNS are the eigenvectors; p. 9's Û has them as rows, so its
   own rule ÛÂÛ† is the diagonal one."

## Should-fix

4. **Raw TeX / unwrapped math.** (a) All six `insightFormal` strings (`Q3.ts:140, 211, 279, 353, 434, 508`) are TeX with
   no `$…$`; `Rich` typesets only `$…$`, so the Formal track prints `\langle\psi|P_M|\psi\rangle` etc. (live). (b) The
   `q3-s-minus` walkthrough prints `|{-n}\rangle` raw (`Q3.ts:246`). (c) 75 story strings put math as bare text
   (`P_{+x}`, `e^{iφ}`, `S_z`, `c_j^{(i)}`), shown with literal `_ { ^`; this also hides them from the symbol-before-use
   lint (Q3's `symbols` map has 26 entries vs Q2's ~150) — e.g. ε_ijk (item 9) slips through. *Fix:* wrap math in
   `$…$` as Q2 does, then rerun the symbol lint and fill the map.
5. **Claims that test the wrong thing.** `q3-bloch:b3` claim `q3NVecXY` is labelled "|−n⟩'s |−z⟩ amplitude has size
   0.612" (`Q3.story.ts:204`); that size is cos 30° = 0.866 (numpy), and the check tests n_x. `cHalf`/`cQuarter`
   (`Q3.story.ts:54–55`) check the literals `q3Half: 0.5`, `q3Quarter: 0.25` (`Q3.values.ts:228–229`) — tautologies.
   *Fix:* key `q3MinusNBetaAbs`; replace the literals by a numeric check of ΔAΔB = ½[ΔA,ΔB] + ½{ΔA,ΔB} at |+n⟩.
6. **Two different J's.** `q3-o-sy` calls [[0, 1], [−1, 0]] "the real quarter turn J" (`Q3.ts:313`); everywhere else J
   = [[0, −1], [1, 0]] (`Q3.values.ts:69`, `observables:b6`, `q3-m-hermitian`), and the pitfall's ⟨+y|J|+y⟩ = −i holds
   only for that one (the other gives +i). `q3-o-sy` (Unit 3.3) also uses J before `observables:b6` (Unit 3.4) defines
   it. *Fix:* "[[0, 1], [−1, 0]]: a real quarter turn (−J), not Hermitian."
7. **The floor's units.** "the floor ½|⟨S_z⟩| = 0.125ħ²" (`Q3.story.ts:627`), "0.25ħ² = ½|⟨S_z⟩|" (`:674`), b7 reveal
   caption (`:711`), `q3-u-which` prompt (`Q3.ts:541`): ½|⟨S_z⟩| carries one ħ; the floor is (ħ/2)|⟨S_z⟩|. Fix all four.
8. **Book citations.** Axler **7.31, p. 246** is the complex spectral theorem, not "eigenvectors of distinct eigenvalues
   are orthogonal" (`spectral:b3` refs `:498`, `Q3.ts` spectral books) — that is **7.22, p. 238**; keep 7.31 for "hence
   an ON eigenbasis". Axler **5.76, p. 176** is "two diagonalizable operators: simultaneously diagonalizable ⟺
   commute", not "commuting self-adjoint … orthonormal eigenbasis" (`:602`, `Q3.ts:498`). Axler **5.5, p. 134** defines
   eigenvalue only — no characteristic polynomial (`:447`, `Q3.ts` spectral books).
9. **ε_ijk is never defined** (`uncertainty:b1` Formal `:577`, review equations `Q3.review.ts:115`). Add a gloss
   (Levi-Civita) or write the three cyclic commutators.
10. **Internal erratum ids in learner text** (the errata box shows none): N6 `:247`, N7 `:406`, N8 `:495`, N21 `:506`,
    `Q3.ts:436`, `Q3.review.ts:96, 99`. *Fix:* "(see the errata box)" or plain words.
11. **Review typo in a formula:** "D2: aⁿ⟨a|a⟩ chains to a*⟨a|a⟩" (`Q3.review.ts:98`) — should be a⟨a|a⟩.
12. **Notes alignment** — every item in the next section (wrong pages, equation numbers, missing [L] beats).

## Nits

13. `spin-operators:b1` prints ψ's first entry from `V.q3NAlpha` (|+n⟩'s cos 30°, equal by coincidence; `:232`) — use a
    ψ key. 14. Script 𝒮_z, 𝒫_{±z} (`:261, 271`) appear nowhere else and are undefined; use S, P. 15. "P̂ itself is
    basis-dependent" (`Q3.ts:279`) → "P̂'s table". 16. `observables:b6` reveal's "−i" and `q3-s-minus`'s "−0.866" are
    hand-typed, no key. 17. `uncertainty:b2` Formal omits the notes' degenerate-case remark (p. 19). 18. `bloch:b2` has
    no `captionFormal` (the notation-beat lint will need one).

## Notes alignment (revised: Lecture 3 = pp. 11–16, Lecture 4 = pp. 17–20)

**Wrong pages / equation numbers (old → revised).** Units: `q3-spin-operators` "pp. 12–13, Eqs. 1.6–1.7" → pp. 12–14,
Eqs. 1.6–1.8 · `q3-observables` "pp. 13–14" → pp. 14–16 · `q3-spectral` "pp. 15–16" → **L4** pp. 17–18 ·
`q3-uncertainty` "pp. 16–17, Eqs. 1.8–1.9" → **L4** pp. 18–20, Eqs. 1.9–1.10 · correction "notes p. 15" → p. 17 ·
header "Lecture 3 (9/14, pp. 11–17)". Beats: `spin-operators` b1 p. 12 → pp. 12–13; b2, b3 p. 12 → p. 13; b5 eq. 1.7
"p. 13" → p. 14 · `observables` b1 pp. 13–14 → pp. 14–15; b2, b4 p. 14 → p. 15; b5 p. 14 → p. 16 · `spectral` b1–b4
p. 15 → p. 17; b5 pp. 15–16 → p. 18 and "eq. 1.8 with i = j" → eq. 1.9 · `uncertainty` b1 p. 16 → p. 18, "eq. 1.8" →
eq. 1.9; b2 "p. 16 … (p. 17" → pp. 18–19 … p. 19; b3 p. 17 ×2 → p. 19; b4 "eq. 1.9 … p. 17" → eq. 1.10, p. 19; b5
p. 17 → pp. 19–20 · `q3-u-steps` title/prompt "Eq. 1.9" → 1.10 · review Formal points "eq. 1.8"/"eq. 1.9" → 1.9/1.10.
`born` (p. 11) and `bloch` (p. 12, Eqs. 1.4–1.5) are right.

**Missing [L] beats for new notes content.**
- **p. 12 parametrization** (new): four real parameters → the global phase (unobservable in every probability *and*
  every ⟨M⟩) makes a real ≥ 0 → normalization → two angles; the half-angle is chosen so θ, φ come out as n's polar and
  azimuthal angles ("verified below"). `bloch:b1` compresses this to one sentence with no count and no half-angle reason.
  *Add* derivation D0 at `bloch:b1` (views below), and a forward pointer at `bloch:b2` ("checked in Unit 3.3, Eq. 1.8").
- **p. 14 §F.4, Eq. 1.8** (new): ⟨σ⟩ = n by three sandwiches (σ_z diagonal → c² − s²; σ_x exchanges → 2cs cos φ; σ_y
  via σ_y|+n⟩ = (−ie^{iφ}s, ic)ᵀ → 2cs sin φ), ⟨S⟩ = (ħ/2)n, "this justifies calling n the Bloch vector", and
  ⟨σ_n⟩ = 1 (zero dispersion along n; perpendicular averages vanish). Q3 has it as D3 at `observables:b3` (Unit 3.4, a
  compact α*β route, cited only to Bergou). *Move* D3 to the end of `q3-spin-operators` as an [L] beat citing p. 14,
  Eq. 1.8, the notes' three-sandwich route in Ground (keep α*β as Formal F1); `observables:b3` links back.
- **Lecture 4 (9/16)** now holds units 5–6. Content is complete except the degenerate-case remark (item 17). The re-map
  (batch 1a) must rule whether Q3 keeps L4 (retitle/date it "Lectures 3–4") or units 5–6 move.

## Derivation views (standing rule: ≥ 2 distinct views per derivation, both tracks)

N = |+n⟩ at θ = 60°, φ = 45° (`N_STATE`); `matrix` fields provisional (W's API in build).
- **D0 (new, `bloch:b1`, p. 12)** G1 a, b ∈ ℂ: `amplitudes {state:{dir:N}, dials:true, labels:'spin', globalPhaseDeg:70}` ·
  G2 remove e^{−i arg a}: same, `globalPhaseDeg: sweep(70, 0)` · G3 normalize: `amplitudes {mode:'probability'}` ·
  G4 a = cos θ/2, |b| = sin θ/2: `hilbert-plane {psi:{blochDeg:60}, basis:'z', shadows:true}` · G5 relative phase:
  `complex-plane {z:{re:.354,im:.354}, show:['arg','modulus']}` · G6 `bloch {state:N}`. Formal: F1 → G2, F2 → G6.
- **D1 (`born:b2`)** G1 `hilbert-plane {psi:{planeDeg:30}, basis:'x', shadows:true}` · G2–4 (|z|² = z*z, conjugate
  symmetry) `complex-plane {z:{re:.424,im:.566}, show:['conj','product','modulus']}` (z = ⟨+x|(0.6, 0.8i)⟩, z·z̄ = 0.5) ·
  G5 `matrix {outer:['+x','+x']}` · G6 current `project:1` plane. Formal: F1 → complex-plane, F2 → matrix.
- **D2 (`spectral:b2`)** G1 current operator-space M · G2–3 `matrix {gate:M, highlight:[[0,1],[1,0]]}` (2 − i / 2 + i:
  M = M†) · G4–6 `complex-plane {z:{re:0,im:1}, show:['conj']}` (J's i ≠ its mirror) · G7–8 `complex-plane {z:2,
  show:['conj']}` (a = a*). Formal: F1 → matrix, F2 → z = 2.
- **D3 (→ `spin-operators`, Eq. 1.8)** G1 `amplitudes {state:{dir:N}, dials:true}` · G2–4 `matrix {gate:'sz'}` then
  `bloch {state:N, dropLines:['z']}` · G5 `matrix {gate:'sx', highlight:[[0,1],[1,0]]}`, `matrix {gate:'sy'}` ·
  G6–7 `complex-plane {z:{re:.612,im:.612}, show:['parts','arg']}` (⟨σ_x⟩ + i⟨σ_y⟩ = sin θ e^{iφ}) · G8 `bloch {state:N,
  readouts:['averages'], dropLines:['x','y','z']}`. Formal: F1 → complex-plane, F2 → bloch.
- **D4 (`spectral:b5`)** G1 `amplitudes {state:{dir:N}, mode:'probability'}` (±½ at 0.75/0.25) · G2–3 `operator-space
  {op:{matrix:[['1/4','0'],['0','1/4']]}, gauge:true}` (S_i² = ¼I, no arrow) · G4 `bloch {state:N, dropLines:['z']}` ·
  G5–6 current spreads view. Formal: F1 → operator-space, F2 → bloch.
- **D5 (`uncertainty:b4`)** G1–2 `bloch {state:N, dropLines:['x','y'], readouts:['spreads']}` · G3 `complex-plane
  {z:{re:-.094,im:.125}, circle:true, show:['modulus']}` (z = ⟨ΔS_xΔS_y⟩; needs a `circle` radius = 0.156ħ², a stage
  gap) · G4–6 same with `show:['parts']` (Re = ½⟨{ΔA,ΔB}⟩ = −0.094, Im = ½⟨[A,B]⟩/i = 0.125) · G7–8 `['parts','modulus']`
  (|z|² ≥ (Im z)²) · G9 current `['spreads','bound']`. Formal F1/F2/F3 → G1, G4, G9. New keys: Re/Im ⟨ΔS_xΔS_y⟩
  (−3/32, 1/8; numpy).
- **Notes' proofs not yet marked as derivations** (rule applies): ⟨+n|−n⟩ = 0 (`bloch:b3`: `amplitudes` of both →
  `bloch {measure:N}`); M = M† theorem (p. 16, `observables:b5`: bloch averages → `complex-plane {z:{re:.306,im:.306}}`
  for (0 1; 0 0) off the real axis); orthogonal eigenvectors (p. 17, `spectral:b3`: operator-space → `matrix {coef}` of
  M's eigenvectors); compatible theorem (p. 19, `uncertainty:b2`: operator-space S_x ∥ P_{+x} → `matrix` P_{+x} in x =
  diag(1, 0)); Schwarz lemma (p. 19, `uncertainty:b3`: `hilbert-plane {project:1}` real slice → complex-plane).

## Notation beats (standing rule)

| New space / notation | Introducing beat | Visual |
|---|---|---|
| Projector P_M, Λ_i; the sandwich ⟨ψ\|P\|ψ⟩ | `born:b2` | `matrix {outer:['+x','+x']}` + current plane |
| Bloch sphere S² (space); \|θ, φ⟩, \|±n⟩, n̂ | `bloch:b1`–`b2` | `bloch` (exists); add b2 `captionFormal` |
| Pauli matrices σ_i, σ⃗, n̂·σ⃗; S_i, S_n | `spin-operators:b5` | `matrix {gate:'sy'}` (phase colour on ±i), then sx, sz — today a bloch view only |
| Observable M = ΣM_α\|α⟩⟨α\|, ℳ_α, ⟨M⟩ | `observables:b2` | `matrix` as a weighted sum of two `outer` tables + current amplitudes |
| Adjoint A† (operator) | `observables:b4` | current plane image + `matrix` mirror-and-conjugate (Q2 owns † on matrices) |
| det, characteristic equation | `spectral:b1` | `matrix {gate:M}` + current operator-space |
| Spectral form Σa_i\|a_i⟩⟨a_i\|, f(A) | `spectral:b4` | `matrix {outer: eigvecs}` weighted by a_i (two views) |
| (ΔA)², ΔA = A − ⟨A⟩I | `spectral:b5` | bloch spreads (exists) |
| [A, B], {A, B}, ε_ijk | `uncertainty:b1` | operator-space (exists) + gloss ε_ijk (item 9) |
| \|a, b⟩ simultaneous eigenvector | `uncertainty:b2` | `matrix` P_{+x} in the x basis, diag(1, 0) |

## Builder's language questions
- None recorded in BUILD-LOG or the Q3 commit messages (c3dbf89, 00fce9e).

## Checked and right
- **Numbers (63 keys, own numpy):** 0.5, 0.933/0.067, 0.966; |+n⟩ = (0.866, 0.354 + 0.354i), n̂ = (0.612, 0.612, 0.5),
  |−n⟩ first amplitude 0.5, ⟨+n|−n⟩ = 0; σ_n corner 0.612 − 0.612i; ⟨S⟩ = (0.306, 0.306, 0.25)ħ; (0 1; 0 0) average
  0.306 + 0.306i; A† stretch 1.414; M: a² + 2a − 8, eigenvalues 2, −4, gauge −1, arrow 3, eigenvectors ⊥;
  ⟨S_z²⟩ 0.25, (ΔS)² = (0.156, 0.156, 0.1875), spreads (0.395, 0.395, 0.433); S² = 0.75; Schwarz 5 ≤ 10, best-λ norm 1;
  product² 0.0244 = bound² 0.0156 + dropped 0.0088; |+z⟩ 0.0625 = 0.0625; |+x⟩ 0 and 0.25; ensembles ½/½ and 1.
- **Challenges:** all 24 keys right (60°, 0.5, 0.5, 0.25; 0.6, 0.5, σ_y, 0.5; 0.4, 0.306, B†A†, the Hermitian table;
  2, 0.1875, 0.25, 0.15625; 0.5, 1/64, n_xn_y = 0 with gap n_x²n_y²/16, 5 ≤ 10, D5 order) — apart from item 2's `why`
  and item 6's label.
- **Derivations:** D1–D5 true and in order in both tracks, each ending on its result; D5 matches the notes' Schwarz
  route (ruling Q3-3).
- **Erratum N21** is real and still in the revised notes (p. 17); `check()` tests it. Rulings Q3-1 (worked problems; all
  homework submitted), Q3-2, Q3-3, Q3-4 (one link-back, then P² = P and the sandwich) met.
- **Citations:** N&C Eqs. 2.103–2.104 p. 88, Eq. 2.22 p. 67, Eq. 1.4 p. 15, Ex. 2.17 p. 70 ("one direction"), Box 2.2
  p. 72, Thm 2.2 p. 77, Box 2.4 p. 89, Ex. 2.59/2.60 p. 90; Bergou Eq. 1.2 p. 2, Eq. 2.20 p. 19, §5.2 p. 80 (postulates
  read out there); Axler 7.1 p. 228, 7.5 p. 230, 7.12 p. 233, 7.13–7.14 p. 234, 6.14 p. 189.
- **Bridges:** 16 ids resolve to built 448 units. **Arcade:** quarter-minus (60° tilt, sin²30° = ¼), golf antipode (two
  z quarter turns), golf +y (R_x(−90°): z → +y), diagonal-everywhere, floor-not-compatible — keys and `why`s right.
- **Widgets:** projector (30°, basis 45°) reads 0.933/0.067 as `tryThis` says; the bloch `tryThis` answers hold.
