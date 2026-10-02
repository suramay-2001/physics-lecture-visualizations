# P review: 709 Q4 "The qubit, gates and circuits" (merge 9d33d93, reviewed 2026-10-02)

**Verdict: FIX-FIRST.** The physics in the beats and all seven derivations is right. Two displayed results are wrong:
- one challenge's answer key;
- one Ground reveal that prints amplitudes as percentages.

The chapter also needs a notes pass: revised Lecture 5 (pp. 21–26) now covers most of Q4, and Q4 cites none of it.

Evidence (scratchpad `revQ4Q5-*`):
- `revQ4Q5-recompute.py`: my own state vectors and `np.kron`, with no repo code. It makes 74 Q4 checks (120 with Q5) against the displayed value and the repo fixture `claims-qc709/q4.json`. 72 agree; the 2 mismatches are items 1 and 2.
- `vitest src/content`: 2363 passed.
- Plan and build agree beat for beat: 34 beats, the same ids and phases as P-Q4-story §1.
- **N&C** (printed page = PDF − 28): every equation, figure and section citation checked against `sources/nc-full/text.md` page headers.
- **Bergou** pp. 1–12 (printed page = PDF − 15): checked in the text layer, and pp. 5–8 and 10 in fresh 110–130 dpi renders.
- **Notes:** L3–L5 (`qc709-n3…n5`) read in the text layer.
- **Not done (economy):** no screenshots or contact sheets were taken. The two captions at issue were read from source, since `d()`/`pct()` output is deterministic. Bridges were checked by `bridges.test.ts` (resolution and `ret`), not clicked through.

## Blocking

1. **`q4-k-hzh` answer key is 0; the answer is 1** (`Q4.ts:499-508`, `Q4.values.ts` `q4ChHZH`).
   - The prompt asks for the top-right entry of HZH. HZH = X, so the entry is 1.
   - The key is `hxh[0][1]`, which is HXH = Z, entry 0. The numpy twin (`q4.py:224`) copies the same slip, so `claims.test` passes.
   - The walkthrough renders "HZH = X, whose top-right entry is 0": it contradicts itself, and a correct learner is marked wrong.
   - The title "Sandwiching X between Hadamards" names the wrong matrix.
   - *Fix:* `q4ChHZH: matmul(matmul(H, Z), H)[0][1].re` (= 1), and the same in `q4.py`. Change the title to "Sandwiching Z between Hadamards".
2. **`q4-cnot:b6` Ground reveal (`Q4.story.ts:486`) prints amplitudes as chances.**
   - It says "Two copies of ψ would fill all four bars: 75 %, 43.3 %, 43.3 %, 25 %". These are the amplitudes of ψ⊗ψ, 0.75, 0.433, 0.433 and 0.25, and they "sum" to 186.6 %.
   - The chances are 56.25 %, 18.75 %, 18.75 % and 6.25 %. The bar stage is in amplitude mode.
   - *Fix:* "…would fill all four bars: 0.75, 0.433, 0.433, 0.25." Use `d(V.q4PsiPsi0, 2)`…, as the reveal caption already does.

## Should-fix

3. **Tensor products of operators are used but never introduced.**
   - `registers:b2` defines ⊗ for kets only.
   - From `cnot:b3` on, both tracks use H⊗I, I⊗H, |0⟩⟨0|⊗I, I⊗X and CNOT₀₁/CNOT₁₀ (`cnot:b3/b4`, `circuits:b2/b6`, glossary `qc-cnot` and `qc-controlled-gate`).
   - Notes L5 p. 23 (§II.A, eq. 2.1) teach exactly this: the block form of A⊗B, A₁ → A₁⊗Î₂, and a worked σ_x⊗σ_z.
   - *Fix:* a new [L] notation beat `q4-registers:b3a` (see the notation table below). Cite notes p. 23 and its σ_x⊗σ_z example, plus "an operator being a product is a separate question from a state being one".
4. **Notes alignment** (detail in the section below):
   - Q4 cites no 709 notes. Every `lecture.pages` field and every [L] beat cites only Bergou or N&C.
   - The headers of `Q4.ts:6-8` and `Q4.story.ts:4` still say no notes cover Part II.
   - Eight notes topics have no beat.
5. **Builder flag: citation regex.**
   - `claims.test.ts:70` eats `eq.`, `Problem`, `Fig.` and `§`. It misses `Box`, a capital `Eq.`, `Section` and `Chap.`. Builders therefore wrote "N&C’s summary box" (`gates:b6`, `circuits:b4`) and lower-case "eq.".
   - *Fix:* add `\bBox\s`, `\b[Ee]qs?\.\s?`, `\bSection\s` and `\bCh(?:ap)?\.\s?` to the reference-eating regex. Then restore "N&C Box 1.1, eq. 1.17, p. 20" in both beats.
   - The decomposition U = e^{iα}R_z(β)R_y(γ)R_z(δ) itself is right (eq. 1.17).
6. **Claims that check nothing about their own label:**
   - `q4Bits6: Number('110')` (`Q4.values.ts`) is a literal, so "bar 6 is |110⟩" is never computed by the engine. *Fix:* `bitsOfIndex(6, 3)`.
   - `gates:b4` backs the ½ in H² = ½(I + I) with `q4PsiBeta` ("ψ’s |1⟩ amplitude"). *Fix:* give the ½ its own key, computed from the H² expansion. `\tfrac12` is still a shown number that needs a claim.
7. **Ground prose shows Python-style matrices and raw carets outside TeX:**
   - `gates:b1` "X = [[0, 1], [1, 0]]";
   - `gates:b3` "[[1, 0], [0, −1]]";
   - `gates:b6` "[[e^{−iχ/2}, 0], [0, e^{iχ/2}]]" and "[[1, 0], [0, e^{iχ}]]";
   - the caption "e^{iγ}ψ" (`qubit:b3`) and "T = e^{iπ/8}R_z(π/4)" (`gates:b6`);
   - glossary `qc-gate` "ℂ^{2ⁿ}".
   - `Rich` renders TeX only inside `$…$`, so a Ground reader sees literal `^{…}` and nested brackets.
   - *Fix:* use `$\begin{pmatrix}…\end{pmatrix}$` and `$e^{-i\chi/2}$` in text. Use Unicode in captions (e^(iγ), or "ℂ to the 2ⁿ").

## Nits

8. **Page nits:**
   - N&C Fig. 1.8 is on p. 24, not p. 23 (`cnot:b4`).
   - Fig. 1.12 and eq. 1.27 are on p. 26, not p. 25 (`circuits:b2`).
   - The `cnot:b5` N&C ref `p. 21` also credits the Toffoli gate, which is on p. 29 (§1.4.1). Make it "pp. 21, 29".
9. **Hard-typed numbers outside `d()`/`pct()`.** All are claim-backed and recomputed right, but the file header promises `d`/`pct`:
   - `gates:b5` (0.966, 0.259; 0.5, 0, 0.866; 93.3 %, 6.7 %);
   - `gates:b3` F (−0.866, 0, 0.5);
   - `registers:b2` (0.5 × 0.707 = 0.354; 0.612…; 37.5 %…);
   - `measure:b1/b2/b5`.
10. **Builder flag: unit 1 title.** Ruling: exempt unit `title` and `question` from the gloss-at-first-use lint, since a title cannot carry a gloss tag and the unit's b1 defines the word. Restore the plan's "From a bit to a qubit".
11. **Weak bridge.** In `registers:b2`, <<qc-l2-vector-space|kets add and scale like vectors>> is about sums, not ⊗. Move it to `registers:b1`, or drop it.
12. **Builder flag: Unicode versus TeX.** Q4 itself is consistent: TeX in Formal, plain text in Ground, apart from item 7.

## Notes alignment (revised notes L3–L5)

Lecture 5 (9/21, pp. 21–26, §II "Multiparticle systems") overlaps Q4 almost entirely. L3 (pp. 12–14) owns the Bloch parametrization that `qubit:b3` uses through Unit 3.2. No Q4 page citation is *wrong*, because Q4 cites no notes at all. Each [L] beat should gain a notes citation:

| Beat(s) | Add | Notes content |
|---|---|---|
| `qubit:b1` | L5 p. 21 | single qubit vs many; a qubit is a point on the Bloch sphere |
| `qubit:b3` | L3 pp. 12–13 | Bloch parametrization (via Unit 3.2) |
| `gates:b1, b3, b4, b6` | L5 p. 24 | X = σ_x (NOT), Z, H = (σ_x+σ_z)/√2 with H\|0⟩=\|+x⟩, S = diag(1, i), T = diag(1, e^{iπ/4}) |
| `gates:b2` | L5 p. 24, eq. 2.2 | U†U = UU† = 1 *derived* from norm preservation; reversible, unlike AND |
| `gates:b3` | L5 pp. 24–25 | U_n(θ) = exp(−iθ n·σ/2) = cos(θ/2) − i sin(θ/2) n·σ, from (n·σ)² = 1 |
| `registers:b1–b3` | L5 p. 21, p. 23 | d₁d₂ not d₁+d₂; N-index strings; 2^N amplitudes; \|i₁,i₂⟩ = \|i₁⟩⊗\|i₂⟩ |
| `registers:b5` (clue) | L5 p. 22 | the notes' own proof that \|Φ⟩ = (\|00⟩+\|11⟩)/√2 does not factor (ad = bc = 0 vs ac = bd ≠ 0) |
| `cnot:b1–b3` | L5 p. 24 | CNOT = \|0⟩⟨0\|⊗1 + \|1⟩⟨1\|⊗σ_x, its matrix, \|a,b⟩→\|a,a⊕b⟩, Hermitian and unitary so self-inverse |
| `cnot:b4` | L5 p. 25 | CZ = diag(1,1,1,−1); the notes write CNOT = (1⊗H)CZ(1⊗H), the same identity turned round |
| `cnot:b5` | L5 p. 24 | AND discards information |
| `circuits:b2`, `measure:b3` | L5 p. 25, eqs. 2.3–2.4 | Bell basis β_xy and its one-line formula; for β₀₀, 00 and 11 each w.p. ½ |

Rosetta line needed in `circuits:b2`: the notes' |Φ⟩ (p. 22) and |β₀₀⟩ (p. 25), N&C's β₀₀ and Bergou's |Ψ₊⟩ (Bergou eq. 3.4, verified) are all our Φ⁺.

**Missing [L] beats for new notes content** (HW2 is submitted, so full walkthroughs are allowed):
1. **Composition is multiplicative; product states are rare** (L5 pp. 21–22).
   - A product state has 4 real parameters against 6 for a general two-qubit state.
   - For N qubits the ratio is 2N/(2^{N+1}−2), about 1 % at N = 10 (recomputed: 20/2046 = 0.98 %).
   - Add as `registers:b3b`, with the number engine-computed.
2. **⟨Ψ|A⊗B|Ψ⟩ = ⟨A⟩⟨B⟩ for a product state** (p. 22).
   - Worked case: ⟨Z⊗X⟩ on ψ⊗|+⟩ = 0.5 × 1 = 0.5.
   - Add to `registers:b2` Formal, or as a new [L] beat.
3. **Operator tensor product, eq. 2.1** (p. 23): item 3, `registers:b3a`.
4. **Unitarity from norm preservation** (p. 24, eq. 2.2): a 2-line derivation on `gates:b2`.
5. **The rotation formula from (n·σ)² = 1** (pp. 24–25): a derivation on `gates:b3`.
6. **CNOT is not a product A⊗B, which is why it can entangle** (p. 24): one sentence in `circuits:b2`.
7. **The Bell basis** (pp. 25–26).
   - Four states, orthonormal, none a product; β₀₁ and β₁₁ are the triplet |1,0⟩ and the singlet.
   - Add as `circuits:b2a`.
8. **The Bell-measurement circuit** (p. 26, Fig. 7).
   - CNOT then H⊗I sends β_xy → |xy⟩, with the notes' derivation.
   - Add as `measure:b3a`, unless the re-map gives it to the L6 Bell chapter. HW2 P2 is submitted.

## Derivation view plans (standing rule: ≥ 2 distinct views per track)

The shorthand states are written exactly as the stage would get them.
- `amp{…}` and `circ{…}`, with C_* circuits from `Q4.values.ts`, as in the story.
- `matrix{gate|kron|outer|coef, blocks?, hl?, labels:'ket'}` is the new kind.
- `bloch`, `op` (operator-space) and `cplane` (complex-plane) are the existing kinds.

| Derivation | Track: lines → view |
|---|---|
| `gates:b1` X | **G** 1: `circ{C_X,upTo 0→1}`/`amp{same}` · 2: `amp{dir PSI_DIR}` → `amp{circuit:{…Ry(π/3), X}}` (0.866, 0.5 → 0.5, 0.866) · 3: `matrix{coef: ψ as 2×1, labels:'ket'}` · 4: `matrix{gate:'X', hl: col \|0⟩ then col \|1⟩}` · 5: `matrix{gate:'X'}`. **F** 1: `matrix{gate:'X', hl:[(0,1),(1,0)]}` · 2: `bloch{state:'+z', rotate:{axis:'x', angleDeg 0→180}}` |
| `gates:b4` H, H² = I | **G** 1–2: `circ{C_H}`/`amp` → `matrix{gate:'H', hl: cols}` · 3–4: `op{op: σ_x, add: σ_z, labels:'sigma'}` (the sum lies along (x̂+ẑ)/√2) · 5–6: `matrix{gate:'XZ'}` beside `matrix{gate:'ZX'}` (opposite signs) · 7: `bloch{state:'+z', rotate:{axis:{θ45,φ0}, angleDeg 0→360}}`. **F** 1: `op{op:(σ_x+σ_z)/√2}` · 2: the same `bloch` 360° turn |
| `gates:b6` P(χ) = e^{iχ/2}R_z(χ) | **G** 1: `bloch{state:PSI_DIR}` · 2: `cplane{z:{r:0.5,φ:0}, w:{r:1,φ:χ}, show:['product']}` (angles add) · 3: `bloch{state:PSI_DIR, rotate:{axis:'z', angleDeg 0→90}}` · 4–5: `matrix{gate:'Rz(π/2)'}` beside `matrix{gate:'P(π/2)'}` (phase colour shows the common hue) · 6: `amp{dir PSI_DIR, globalPhaseDeg 0→45}` (bar heights fixed). **F** 1: the `bloch` z-turn · 2: the `matrix` pair |
| `cnot:b3` U_CN² = I | **G** 1: `matrix{gate:'I4', labels:'ket'}` (columns \|00⟩…\|11⟩) · 2–3: `circ{C_CX10,upTo 0→1}`/`amp` · 4: `matrix{gate:'CNOT', blocks:2, hl: lower-right block}` · 5: `matrix{gate:'CNOT', hl: symmetric pair}` · 6–7: `circ{[CNOT,CNOT] on '10', upTo 0→2}`/`amp` (the bar returns). **F** 1: `matrix{gate:'CNOT', blocks:2}` labelled \|0⟩⟨0\|⊗I and \|1⟩⟨1\|⊗X · 2: the two-CNOT `circ`/`amp` |
| `circuits:b1` U = U₂U₁ | **G** 1–3: `circ{C_HZ, upTo 0→1, then 1→2}`/`amp` · 4: `bloch{state:'+z'}` turned by H then a z half-turn (\|0⟩→\|+⟩→\|−⟩) · 5: `matrix{gate:'ZH'}`. **F** 1: `matrix{gate:'ZH'}` beside `matrix{gate:'HZ'}` · 2: `circ{C_HZ}`/`amp` |
| `circuits:b2` Bell | **G** 1: `amp{ket:'00'}` + `matrix{coef}` · 2–3: `circ{C_BELL,upTo 0→1}`/`amp`; `matrix{coef}` rank 1, det 0 · 4: `matrix{gate:'CNOT', hl: cols \|00⟩,\|10⟩}` · 5: `amp{bell:'00+11'}` + `matrix{coef}` diagonal, det ½. **F** 1: `matrix{gate:'CNOT·(H⊗I)', labels:'ket'}` (its columns are β₀₀…β₁₁) · 2: `amp{bell:'00+11'}` |
| `circuits:b3` SWAP | **G** 1–4: `circ{C_SWAP3, upTo 0→1, 1→2, 2→3}`/`amp`, one column per line · 5–6: `matrix{gate:'SWAP', labels:'ket'}`. **F** 1: `circ{C_SWAP3}` · 2: `matrix{gate:'SWAP'}` |
| *new* `gates:b2` unitarity (notes eq. 2.2) | **G/F** 1: `amp{circuit C_X on ψ, sum:[…]}` (the bars' squares add to 1 before and after) · 2: `matrix{gate:'X†X'}` = I |
| *new* `gates:b3` U_n(θ) | **G/F** 1: `op{op: n·σ}` ((n·σ)² = 1) · 2: `matrix{gate:'Rn(θ)'}` with phase colour · 3: `bloch{rotate:{axis:n, angleDeg 0→θ}}` |
| *new* product test (`registers:b5` reveal, notes p. 22) | 1: `matrix{coef:'ψ⊗\|+⟩'}` (ac, ad / bc, bd: an outer product) · 2: `matrix{coef:'Φ⁺'}` (ad = bc = 0 cannot hold) |
| *new* Bell measurement (notes p. 26) | 1–2: `circ{CNOT then H⊗I on β_xy, upTo 0→1}`/`amp` · 3–4: `circ{…upTo 1→2}`/`amp` (one bar \|xy⟩) · 5: `matrix{gate:'(H⊗I)CNOT', labels:'ket'}` |

## Notation beats (standing rule: each new space or notation is introduced by exactly one beat, with a view)

| Space or notation | Introducing beat | Visual |
|---|---|---|
| ℂ² as a qubit; \|0⟩ ≡ \|+z⟩, \|1⟩ ≡ \|−z⟩ (computational basis) | `qubit:b1` (exists) | `amp{labels:'spin', dials}` + `matrix{coef: ψ column, labels:'ket'}` |
| A gate as a matrix on (α, β)ᵀ; X, Z, H, S, T, P(χ) | `gates:b1` (exists) | `matrix{gate:'X', labels:'ket'}` (missing today) |
| R_n(χ) = e^{−iχ n̂·σ/2} | `gates:b3` (exists) | `bloch{rotate}` + `op{op:n·σ}` |
| ℂ²⊗ℂ² = ℂ⁴ and ℂ^{2ⁿ}; \|00⟩…\|11⟩; binary labels | `registers:b1` (exists) | `amp{ket:'01', labels:'bits'}` + `matrix{coef}` 2×2 grid |
| ⊗ on kets (Kronecker) | `registers:b2` (exists) | `matrix{kron:['ψ','\|+⟩']}` + `amp` |
| **⊗ on operators**, A₁ → A₁⊗I₂ | **new `registers:b3a`** (notes p. 23) | `matrix{kron:['X','Z'], blocks:true}`, then the full 4×4 |
| Coefficient matrix and det test | `registers:b5` (exists) | `matrix{coef}` |
| ⊕ (XOR) | `cnot:b2` (exists) | `circ{C_CX10}` + a truth table |
| U_CN, CNOT₀₁/₁₀, C-U, CZ, control dot and ⊕ target | `cnot:b1`/`b4` (exist) | `circ` + `matrix{gate:'CNOT', blocks:2}` |
| \|a⟩⟨b\| outer product inside gates | link back to Q2 (`q2-operators`) | — |
| Circuit diagram: wires, boxes, meter, double wire | `circuits:b1`, `measure:b1` (exist) | `circ` |
| Bell states Φ⁺ = β₀₀ (Rosetta to notes, N&C, Bergou) | `circuits:b2` (exists); new `b2a` for the full basis | `amp{bell}` + `matrix{gate:'CNOT·(H⊗I)'}` |
| P(q₀ = x), partial reading | `measure:b2` (exists) | `circ{…outcomes}`/`amp` |

## Checked and right

- **Every number re-derived:** all displayed decimals, percentages and captions in 34 beats, and all 24 challenge answers except item 1. This covers ψ = (0.866, 0.5) and its Bloch vector, Xψ, Zψ, Hψ (0.966, 0.259; 93.3 %), ψ⊗|+⟩ (0.612, 0.354; 37.5 %, 12.5 %), 1/√8, the 151 digits of 2⁵⁰⁰, both determinants, CZ|++⟩, the copy amplitudes, ZH vs HZ, Φ⁺, the partial-measurement post-states |0⟩|+⟩ and |1⟩|−⟩ with 75 %/25 %, and P(+) = |α+β|²/2.
- **Operator identities**, all verified: X = iR_x(π), Z = iR_z(π), H = iR_x(π)R_y(π/2) = iR_n(π), P(χ) = e^{iχ/2}R_z(χ) (checked on 29 values of χ), T = e^{iπ/8}R_z(π/4), R_z(2π) = −I, R_x(π/2)² = −iX, CZ = (I⊗H)CNOT(I⊗H), three CNOTs = SWAP, (H⊗H)CNOT₀₁(H⊗H) = CNOT₁₀, and N&C's eq. 1.27 on all four inputs.
- **Derivations:** every step is true, and both tracks end on the stated result.
- **Citations:** the N&C equations 1.1–1.27 and the Bergou equations 1.1–1.9, the Bergou Problems 1.1(b)–(c), 1.4(a) and 1.4(b), and the Bell notation Ψ₊ all match the sources.
- **Cross-references:** Units 1.3, 1.5, 2.4–2.6, 3.1–3.3, 3.6, 4.3, 4.4, 4.6 and 5.2 land on the right chapters.
- **Plan:** the build follows P-Q4-story and ruling qc709-Q4Q5 #1–#6, including the named-only entanglement previews.
