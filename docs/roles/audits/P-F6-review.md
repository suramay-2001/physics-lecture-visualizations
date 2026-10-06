# P review: 709 F6 "Many at once" (main af4663e, reviewed 2026-10-07)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (3 blocking, 8 should-fix, 7 nits).
- **Numbers are right:** all 39 `V` keys and the 15 challenge keys check out by an independent route, and the Kronecker convention is right. There are no matching slips in `f6.py`.
- **Blocking:**
  - None of the 15 Try-it lines can be done (item 1).
  - The Ground text says every two-qubit A ⊗ B has "4 of its 16 entries nonzero" (item 2).
  - The review card prints dim(V⊗W) = dim V · dim **V** (item 3).
- **Must-check outcomes:**
  - **Index order:** q0 is leftmost and the most significant bit, as `state.ts` C2 / qc709-map #8 lock it. The index is Σ b_k 2^{n−1−k}, |10⟩ ↦ 2 and |110⟩ ↦ 6. `kronM` puts A's index outermost, so the hand-built X ⊗ I matches.
  - **Algebra:** (A⊗B)(u⊗v) = Au⊗Bv holds on random complex A, B, u, v, and dimensions multiply.
  - **Product versus entangled:** the 2×2 test is right. det C(|++⟩) = 0, det C(Φ⁺) = ½ and det C(Ψ⁺) = −½. Rank is invariant under C → UCVᵀ, which matches (U⊗V)ψ.
  - **`kron` stage source:** the block pictures are right, and the highlight (3, 1) is the |01⟩ → |11⟩ entry.
  - **Q6 conventions:** consistent (qubit 1 = rows of C, qubit 2 = columns; |0⟩ = |+z⟩).
  - **Bridge `qc-f6-pairs`:** used in `q6-many:b1`, it lands on `f6-pairs`.
  - **Glossary:** no Q6 or Q9 glossary id is redefined, but F6's two new ids overlap Q4's `qc-tensor-operator` (item 6).
  - **Citations:** several Axler, N&C and Bergou citations point at the wrong result (item 4). The revised L5 notes, which carry this exact material, are not cited (item 5).

## Evidence summary
- **`revF5F6-f6.py`** (scratchpad): 39/39 keys of `claims-qc709/f6.json` agree to 1e-9, with 0 mismatches. My route:
  - Kronecker products from explicit index loops (`M[i·n+k, j·n+l] = A_ij B_kl`; no `np.kron`).
  - 2×2 determinants by formula and ranks by SVD.
  - Bit indices by shifts.
- **Extra checks:**
  - |+−⟩ = (0.5, −0.5, 0.5, −0.5), |+0⟩ = (0.707, 0, 0.707, 0) and |0+⟩ = (0.707, 0.707, 0, 0).
  - H ⊗ H has 16 nonzero entries (item 2).
  - X⊗I and I⊗X commute.
  - The inner product factors on random complex vectors.
  - The cos θ|00⟩ + sin θ|11⟩ family gives det = 0 and ½ at θ = 0° and 45°.
  - 2³⁰·16 B is 16 GiB = 17.18 GB, and 2⁵⁰·16 B is 16 PiB = 18.0 PB (item 8).
  - 20/2046 = 0.98 %.
- **Vitest:** shared run with F5 (`-t "F5|F6|f5|f6"` over claims, content, visualSpecs and qc709): 140 passed, 0 failed.
- **Sources read** (offsets confirmed on the page heads: Axler = PDF − 14, N&C = PDF − 28, Bergou per `P-709-map.md` (d)-E1):
  - Axler 4e: 9.71–9.76 (pp. 372–374), 9.80–9.83 (pp. 376–377), 9.84–9.90 (pp. 378–379) and §9D Ex. 9 (p. 381).
  - N&C: §2.1.7 (pp. 71–74, Eqs. 2.42–2.50), §2.2.8 (pp. 95–96, Eq. 2.132, Ex. 2.68) and §2.5 (pp. 109–110).
  - Bergou: Eqs. 1.3–1.4 (p. 2), §2.1 (p. 16) and §3.1 (p. 31, Eq. 3.1).
  - Revised notes n5 (Lecture 5) pp. 22–23.
  - HW: no F6 item matches HW1/HW2, and there is no HW3 lookalike.
- **Widgets and stages:** read from source; no screenshots, no Playwright (per the brief).
  - `AmplitudeBars` (props `state`, `basis`, `editable`; one qubit, θ/φ sliders).
  - `OperatorAction` (a real symmetric 2×2 `[[a,b],[b,d]]` on a 2-D arrow; props `a`, `b`, `d`, `preset`).
  - `OperatorBuilder` (S_n from projectors; prop `axis`).
  - `stage/svg/matrix.ts` (`kron` → `kronM`, `coef` → `coefMatrix`, `basis` → B†MB, `svd` → "Schmidt coefficients").
  - `stage/svg/twoQubit.ts`.

## Blocking
1. **None of the 15 Try-it lines can be done on the widgets that ship.** The Q11–Q13, F2 and F5 precedent makes this Blocking.
   - **Why:** plan §3 specified stage kinds as widgets (`amplitudes` register/kron/growth modes, `matrix` kron, `two-qubit` family). The build substituted `WidgetKind`s that silently ignore those props.
   - **What ships instead:**
     - `f6-pairs` `{mode:'register', qubits:2}`, `f6-kron` `{mode:'kron', a:'+', b:'0'}` and `f6-growth` `{mode:'growth', qubits:1}` all render the default one-qubit `AmplitudeBars` (θ = 60°, φ = 45°, two bars). There are no 4/8 bars, no index-2 bar, no (0.707, 0, 0.707, 0) and no n = 10/30 counter.
     - `f6-operator` `operator-action {opA:'X', opB:'I'}` renders σ_x acting on a 2-D arrow. There is no ⊗, no |01⟩ and no Z⊗Z.
     - `f6-product-or-not` `operator-builder {mode:'coef-test'}` renders the S_x projector builder. There is no θ, no reduced arrows and no det C.
   - **Fix** (`F6.ts` lines 139–143, 197–201, 259–263, 318–322, 377–381): either build a small register/kron widget on `state.ts` (`ket`, `kron`, `coefMatrix`), as plan §3 intended, or rewrite against what exists:
     - **kron:** `amplitude-bars {state:'+x', basis:'z'}`. Try: "Read $|{+}\rangle$'s two amplitudes ($0.71, 0.71$). Times $|0\rangle$'s $(1, 0)$, every pair gives $(0.707, 0, 0.707, 0)$."
     - **operator:** `operator-action {preset:'σx'}`. Try: "$X$ swaps the arrow's two parts, so $X|0\rangle = |1\rangle$, the first factor of $(X\otimes I)|01\rangle = |11\rangle$."
     - **product-or-not:** `deposit-stats {state:'+x', axis:'z', seed:709}` (the Q6/Q12 wording). Try: "Fire 100: half each way, which is what either qubit of the Bell state shows alone along $z$."
     - **pairs and growth:** need the new widget. Otherwise make the Try-its one-qubit and true, e.g. "One qubit: 2 amplitudes; each added qubit pairs with all of them, so the count doubles", with a θ = 90° reading.
2. **`f6-operator:b1` Ground (`F6.story.ts:260`): "For two qubits $A \otimes B$ is $4 \times 4$, with 4 of its 16 entries nonzero ($25\%$)."** This is a general claim that is false. H ⊗ H has all 16 entries nonzero, and Z ⊗ Z has 4 on the diagonal. Only X ⊗ I on the stage has the claimed pattern. The Formal track correctly says "$X \otimes I$ is …".
   - *Fix:* "For two qubits $A \otimes B$ is $4 \times 4$; $X \otimes I$ on the stage has 4 of its 16 entries nonzero ($25\%$)."
3. **Review card `f6-growth`, formal point 2 (`F6.review.ts`), prints "$\dim(V \otimes W) = \dim V \cdot \dim V$".** *Fix:* "$\cdot \dim W$".

## Should-fix
4. **Wrong results and pages in the book citations.**
   - **Axler:**
     - 9.72 (p. 372) is **dim(V⊗W) = dim V · dim W**. 9.73 (p. 372) is **bilinearity**. 9.74(b) (p. 373) is the basis e_j ⊗ f_k. 9.76 (p. 374) is coordinates = v_j w_k.
     - F6 cites "9.73, p. 374" for basis and dimension (`F6.ts` pairs `lecture`/`books`, pairs:b1 F and refs, growth:b2 F, review). It cites "9.72, p. 372" for coordinates as products (`F6.ts` kron `books`, kron:b1 F, the derivation `why`, review). These are swapped. *Fix:* use 9.72 for dim, 9.74(b) for the basis and 9.76 for coordinates.
     - (A⊗B)(u⊗v) = Au⊗Bv is **§9D Ex. 9, p. 381**, not "9D, p. 378". p. 378 is the multi-factor definition. Affects `F6.ts` operator `lecture`, operator:b2 F and its derivation, and the review.
     - ∏ dim V_i is **9.89, p. 379** (pairs:b4 reveal F).
   - **N&C:**
     - The Kronecker block matrix is **Eq. 2.50, p. 74**, not p. 73 (`qc-kronecker-product.formal`, operator:b1 F/refs, `F6.ts` operator `books`).
     - (A⊗B)(|v⟩⊗|w⟩) = A|v⟩⊗B|w⟩ is Eq. 2.45, p. 73. That is the right N&C cite for operator:b2.
     - **§2.1.7 contains no product-versus-entangled or coefficient-matrix test.** Entangled is defined at §2.2.8, pp. 95–96 (Eq. 2.132, Ex. 2.68). The Schmidt number and its invariance under local unitaries are §2.5, pp. 109–110. Affects `F6.ts` product-or-not `lecture`/`books`, product-or-not:b1 F and derivation, b3 refs and b4 reveal F.
   - **Bergou:**
     - Eq. 1.3 (p. 2) is the N-qubit basis |0…00⟩…|1…11⟩ labelled by an N-digit binary x. It is not "a two-qubit state as the tensor product of two single-qubit states". It suits pairs:b2's big-endian labels.
     - Eq. 1.4 (Σ_{x=0}^{2^N−1} c_x|x⟩) is the cite for the register size.
     - **§3.1 p. 31 is the definition of entanglement** (Eq. 3.1, product form). It is cited instead for "a register as a unit vector with four amplitudes" (pairs:b3) and "the exponential growth" (growth:b3), neither of which it states. Move §3.1 to product-or-not:b1 and cite Eq. 1.4 at pairs:b3 and growth:b3.
5. **The revised L5 notes are not cited, though they carry this chapter's content.** n5 has:
   - The product state with factorized ⟨A⊗B⟩, the parameter count 2·2^N − 2 versus 2N (about 1 % at N = 10, exactly F6's growth:b4), and the |Φ⟩ non-factoring argument (p. 22).
   - |i₁,i₂⟩ = |i₁⟩⊗|i₂⟩, A₁ → A₁ ⊗ I₂ and the Kronecker block matrix (p. 23).
   - *Fix:* add `{source:'lecture', where:'notes p. 22'}` refs at product-or-not:b1 and growth:b3/b4, and `'notes p. 23'` at operator:b1/b3.
6. **The glossary reuse claimed in the headers is not done, and the new ids overlap Q4's.**
   - Q4's `qc-tensor-operator` is "operator tensor product A ⊗ B". Its formal is (A⊗B)(|a⟩⊗|b⟩) = A|a⟩⊗B|b⟩, and it says "a gate on one wire is U ⊗ I".
   - F6 adds `qc-local-operator` (A ⊗ I acting on one part), which is the same concept as `qc-tensor-operator`. It never links `qc-tensor-operator`, `qc-coefficient-matrix` (Q4) or `qc-factoring-test` (Q6), although product-or-not:b1 teaches exactly "the table C" and "the test".
   - The F6.glossary header claims F6 "reuses every one of these EIGHT existing entries". Precedent: P-F2 item 5 (`qc-shadow`).
   - *Fix:*
     - Link `[[qc-tensor-operator|…]]` at operator:b2 and b3.
     - Link `[[qc-coefficient-matrix|table $C$]]` and `[[qc-factoring-test|test]]` at product-or-not:b1.
     - Drop `qc-local-operator` (or give it `bridge` to Q4).
     - Keep `qc-kronecker-product` (the index/block form is new).
7. **Notation beats for F6's own spaces are missing.** `qc709-foundations.md` says each F chapter "sets `introduces` on the space/notation it owns", and F5 does so for Q3's `qc-expectation`. F6 owns the joint space and ⊗ on vectors, but marks only `qc-kronecker-product`.
   - *Fix:* add `introduces: ['qc-composite-space']` to `f6-pairs:b1` and `introduces: ['qc-tensor-product']` to `f6-kron:b1` (W-709 #8).
8. **"Gigabytes" is used where the number is GiB.** `f6-g-mem` asks "How many **gigabytes** … ?" and keys 16 with tolerance 0. 2³⁴ B = 17.18 GB, so a learner who uses 10⁹ is marked wrong. growth:b3 Ground also says "16 gigabytes … 16 petabytes".
   - *Fix:* prompt "How many GiB ($2^{30}$ bytes)…", and Ground "16 GiB (about 17 billion bytes) … 16 PiB".
9. **growth:b1 derivation runs backwards.**
   - Ground step 2 sets ‖a⊗b‖² = ⟨a|a⟩⟨b|b⟩ using the factorization that step 3 only then states.
   - Formal step 1 likewise states ‖a⊗b‖ = ‖a‖‖b‖ first.
   - *Fix:* swap the steps so the double sum factors first and the norm is the corollary, or show Σ|a_j|²|b_k|² = (Σ|a_j|²)(Σ|b_k|²) directly.
10. **Ground-track symbols are used before they are defined, and the bridge at product-or-not:b1 lands on an unrelated unit.**
    - V, W and dim first appear in Ground at growth:b2. Ground pairs:b1 used m, n and ℂ^m ⊗ ℂ^n only.
    - u and v are undefined in operator:b2 Ground.
    - Ground product-or-not:b1 never says which amplitude sits in which cell of C (c_ab = amplitude of |ab⟩, row a, column b).
    - The `symbols` table maps all 90 symbols to outcome sentences that define none of them.
    - The bridge `<<qc-l7-order|swapping the order of two measurements>>` at product-or-not:b1 (both tracks) lands on L7's measurement-order unit, which is unrelated to the factoring test. Remove it.
    - *Fix:* add the definitions inline and point the table at those beats.
11. **Captions over 5-qubit pictures.** pairs:b4 reveal ("ten qubits: 1024") and growth:b3 ("30 qubits: 16 GiB; 50 qubits: 16 PiB") draw a 5-qubit, 32-bar register. *Fix:* add "(five qubits shown: 32 bars)".

## Nits
12. kron:b4 reveal F: "the SWAP gate … (Chapter Q6)". SWAP is Q4's (`qc-swap-gate`), so link it there.
13. pairs:b3 Ground: "Even before anything is entangled, you need all four numbers" is shown over Φ⁺, which is entangled. Show `amp(K('++'))`, or say "this pair happens to be entangled".
14. `f6-o-dim` "How big is $A \otimes B$?" keys 4, which reads as 16 entries too. Ask "How many rows …?".
15. `f6-operator` Ground trap: "Thinking $A \otimes B$ equals $B \otimes A$ … even though local operators commute". A⊗B and B⊗A need not commute (e.g. A = H, B = X). Keep the X⊗I versus I⊗X wording of the Formal trap.
16. `f6LocalCommute` checks X⊗I against **I⊗Z**, but the operator:b4 reveal asserts that X⊗I and I⊗X commute. That is true by numpy but unchecked. Add a claim on that pair.
17. Index letters clash:
    - `qc-kronecker-product` uses (aa′) as the row pair (a for A, a′ for B).
    - `qc-local-operator` and operator:b3 use ⟨ab|…|a′b′⟩ (a for A, b for B).
    - kron:b1 "writing ψ = a, φ = b" reuses a and b as vectors.
    - Pick one convention.
18. Stale headers:
    - The `F6.story.ts` header says "F4 and F5 are not built".
    - growth:b2 shows |00⟩⟨00| for "4 basis states"; `amp(K('00'))` would show the four labels.
    - growth:b3 "more than any computer holds" → "more than any computer's memory".

## Checked and right
- **Pairs:** dimension 4 = 2×2; |10⟩ ↦ 2, |11⟩ ↦ 3, |110⟩ ↦ 6, |01⟩ ↦ 1; 2³ = 8 strings; 2¹⁰ = 1024 versus 20.
- **Kron:** |+0⟩ is first amplitude 0.707 with the b = 1 slots zero, and |+−⟩ = ±0.5 with the minus on b = 1. Every `f6-k-which` distractor's `why` is true (the a = 1 flip is |−+⟩).
- **Operators:** X⊗I equals the hand-built table, is 4×4 with 4/16 nonzero, and sends |01⟩ to |11⟩ (index 3). I⊗X sends |01⟩ to |00⟩. X⊗I ≠ I⊗X, yet they commute. A⊗B = (A⊗I)(I⊗B). ⟨ab|A⊗I|a′b′⟩ = A_{aa′}δ_{bb′}.
- **Product versus entangled:** det C is 0 for |++⟩ (rank 1, entries 0.5), ½ for Φ⁺ (rank 2, reduced ½I, |r| = 0) and −½ for Ψ⁺. Φ⁺ in the ± basis is again I/√2 (rank 2). The converse step "det 0 ⇒ rows proportional ⇒ product" is valid for C ≠ 0.
- **Growth:** the inner product factors, ‖|+⟩⊗|−⟩‖ = 1, 16 GiB / 16 PiB, and 2·2¹⁰ − 2 = 2046 versus 20 (≈ 1 %, matching notes p. 22).
- **Derivations:** each has ≥ 2 distinct views per track and ends on the stated result. The notation beat operator:b1 really introduces the Kronecker form.
- **Bridges** `qc-f2-vectors`, `qc-f3-matrix-of-map`, `qc-l4-matrices` and `qc-f6-pairs` resolve.
- **Housekeeping:** no raw TeX outside $…$ and no plan ids in learner text. Amplitudes are shown in amplitude mode as decimals, never as percentages.
