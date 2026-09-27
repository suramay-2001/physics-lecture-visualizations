# P-L3-story — Lecture 3 plan: Quantum Measurement (role P)

Proposal only. Nothing under `app/` is modified. Mirrors `P2-L1-story.md` (the L1 template) for Lecture 3.

**Conventions used below** (same as L1 unless stated).
- Beat id `<unit>:b<n>`. Phase tag **[L]** lecture says, **[B]** books add, **[C]** clue (click-to-reveal). Order in a unit is always L → B → C.
- Engine: ħ = 1, $S = \sigma/2$; the UI appends ħ. So "0.5" in a claim is $\tfrac{\hbar}{2}$ on screen.
- Notation: the notes write $|{\uparrow}\rangle, |{\downarrow}\rangle$; the app writes $|{+z}\rangle, |{-z}\rangle$ and states the Rosetta line once (`l3-operators:b2`). Susskind's $|u\rangle, |d\rangle, |r\rangle, |l\rangle, |i\rangle, |o\rangle$ = our $|{\pm z}\rangle, |{\pm x}\rangle, |{\pm y}\rangle$.
- **Hat rule** (from the notes' margin, p. 3): $\hat A$ is the operator; $A$ without a hat is its matrix in a chosen basis. Kept everywhere below.
- **Running example.** One state is reused in units 3–4 and 6 so numbers stay familiar: $|\psi_{60}\rangle = \tfrac12|{+z}\rangle + \tfrac{\sqrt3}{2}|{-z}\rangle$. In the `hilbert-plane` it is the arrow at 60° (`{ planeDeg: 60 }`, = `ketFromBloch(2π/3, 0)`); in the lab it is what a magnet tilted 120° from $z$ keeps. Its $z$ odds are ¼ / ¾, the same as Townsend's Example 1.2. (L4 uses the mirror state $\tfrac{\sqrt3}{2}, \tfrac12$; see §9 coordination.)
- In claims: `p60 = ketFromBloch(2*Math.PI/3, 0)`, `Pu = projector(KET['+z'])`, `Pd = projector(KET['-z'])`, `bT = benchTheory`. Every value below was computed by running a copy of the engine (Node 24, type stripping) and re-checked with numpy while drafting.

## 0. Lecture map

**Scope and time slot.** The L3 notes (20 pp.) run to the end of §7 (p. 17) plus two pages of board plan and sources. Lecture 4's notes (p. 1) say L3 **stopped at p. 13**; the spin example (§6) and expectation values (§7) were taught at the start of L4's slot. Per the brief, material that first appears in the L3 notes belongs to L3, so units 5–6 are L3 units with a small badge "taught at the start of Lecture 4". What first appears in L4's notes stays with L4 (Susskind's four principles as the lecture's frame, degeneracy and Gram–Schmidt, projectors as yes/no observables, building $S_x$, $S_y$ and the Pauli matrices, solving the $S_x$ eigenproblem, the $(\tfrac{\sqrt3}{2}, \tfrac12)$ example). Deferred by the notes themselves (p. 19) and not planned here: characteristic polynomials, proofs of the Hermitian theorems, $A' = UAU^\dagger$, unitary operators, density operators, POVMs, degeneracy, collapse interpretation, commutators.

| # | Unit id | Title (≤ 8 words) | Question | Notes pages | Books |
|---|---|---|---|---|---|
| 1 | `l3-operators` | Operators: machines that turn states into states | What is a linear operator, and how does a basis turn it into a matrix? | pp. 1–4 (§0, §1.1–1.2) | Susskind §3.1.1 (machines and matrices); Townsend §2.2 p. 34 (linear operator, fn. 2; R(π/2 ĵ)\|+z⟩ = \|+x⟩, pp. 34–35), §2.1 pp. 29–30 (kets as columns), §2.4 pp. 46–47 (A\|ψ⟩ = \|φ⟩ as matrix product) |
| 2 | `l3-eigen` | Directions an operator only stretches | Which states does an operator leave on their own line, and why must an observable be Hermitian? | pp. 4–8 (§1.3–1.4, transition p. 6, §2 pp. 7–8) | Susskind §3.1.2–3.1.5 (eigenvectors, Hermitian conjugation, real eigenvalues, "fundamental theorem"); Townsend §2.2 pp. 36–37 (Hermitian, eigenstates of rotations), §2.4 p. 50 (adjoint = transpose conjugate) |
| 3 | `l3-projectors` | Projectors keep one part of a state | How do we pull one outcome's piece out of a state, and how do outcomes build an observable? | pp. 8–10 (§3, §4) | Townsend §2.3 pp. 41–45 (identity and projection operators; SG device with a blocked path), §2.4 p. 48 (matrix of P₊, completeness in matrix form); Susskind §3.2 (an operator packages states with their eigenvalues) |
| 4 | `l3-postulates` | Three rules for every measurement | Given $\|\psi\rangle$ and $\hat A$, which results can appear, how likely is each, and what state is left? | pp. 11–13 (§5) | Susskind §3.5 (the common misconception), §4.7 (why $\hat A\|\psi\rangle$ is half of an average), §3.2 (four principles: pointer to L4); Townsend §1.6 pp. 22–24 (orthonormal, complete, probabilities sum to 1) |
| 5 | `l3-spin-example` | One spin, measured from start to finish | What do the three rules predict for $\|{+x}\rangle$ sent through $z$, $z$ again, or $x$ then $z$? | pp. 14–15 (§6) · *taught at the start of L4* | Townsend §1.2 pp. 7–9 (Experiments 3 and 4, the modified SG device), §1.4 pp. 14–15 |
| 6 | `l3-spread` | Averages and spreads of many readings | What is the average reading, and how widely do single readings scatter around it? | pp. 15–17 (§7); end board pp. 18–19 · *taught at the start of L4* | Townsend §1.4 pp. 15–17 (⟨S_z⟩, ΔS_z, "uncertainty" not "standard deviation", Example 1.2, √N), §1.6 p. 24 (eqs. 1.47–1.49), §2.6 p. 58 (⟨S_z⟩ = ⟨ψ\|Ĵ_z\|ψ⟩ in matrix form); Susskind §4.7 |

Printed pages for Townsend are PDF page − 16 (checked on the running heads: "2.3 … I 41" sits on PDF p. 57). Susskind is an epub without page numbers, so it is cited by §, as in L1. Where the L4 notes (p. 21) give printed pages, add them: §3.2 = pp. 69–74, §3.4 = pp. 75–80, §3.5 = pp. 80–82.

**Outcomes (learner's words)** for `L3.outcomes`:
1. I can say what a linear operator does and write its matrix in a basis, entry by entry, from $A_{ij} = \langle i|\hat A|j\rangle$.
2. I can check whether a vector is an eigenvector, read off its eigenvalue, and test whether a matrix is Hermitian.
3. I can build a projector, check $P^2 = P$ and completeness, and build an observable from its outcomes and their states.
4. Given a state and an observable, I can list the possible results, their probabilities, and the state left after each.
5. I can explain why measuring $A$ is not the same as applying $\hat A$.
6. I can compute $\langle A\rangle$ and $\Delta A$, and say why an eigenstate has zero spread.

**Prerequisites** (concept ids): `vectors` (L1), `inner-product`, `complex-amplitudes` (L2).

## 1. Story beats per unit

**Format.** Text is ≤ 3 sentences, each ≤ 25 words, TeX in `$…$`. Stage fields are the real `stage.ts` fields; helpers as in `L1.story.ts` (`main(source, devices, showPrep)`, `Z = {axis:'z'}`, `Zkeep = {axis:'z', keep:'+'}`, `sweep(from, to)`). Where a beat needs a field that does not exist yet it is marked **G1/G2/G3** (proposed additive stage fields, §8) and a **fallback** using today's fields is given. "Links" = term → anchor (`stageVocab.ts`); the one new anchor proposed is `image` on `hilbert-plane` (a D vocabulary addition, not an interface change).

Swap operator used in unit 1: $A = \begin{pmatrix}0&1\\1&0\end{pmatrix}$ = engine `SIGMA_X`. It is introduced by what it does ("the swap"); L4 names it $\hat\sigma_x$, so L3 does not.

### Unit `l3-operators` — Operators: machines that turn states into states

**`l3-operators:b1` [L]**
- Text: "A state like $|{+x}\rangle$ is a superposition of up and down, yet every atom gives one definite reading. The reading also changes the state. Our question: for a state $|\psi\rangle$, what does the theory say a measurement of some quantity $A$ will show?"
- Stage: `lab-r3` · `{ benches: [main('+x', [Z], true)], flow: 'single', deposit: 'build', shot: 'L-WIDE' }`
- Caption: "$|{+x}\rangle$ atoms into an SG$_z$ magnet: each lands in one spot; over many atoms, half in each"
- Claims: plate split — `bT({source:'+x', axes:['z'], keep:[]})` → plus 0.5, minus 0.5.
- Links: "one definite reading" → `tracked-atom`.

**`l3-operators:b2` [L]**
- Text: "Last lecture a state became a vector, $|\psi\rangle = c_+|{+z}\rangle + c_-|{-z}\rangle$, with amplitudes $c_\pm$ (the notes write $|{\uparrow}\rangle, |{\downarrow}\rangle$ and $c_\uparrow, c_\downarrow$). A [[linear-operator|linear operator]] $\hat A$ is a rule that turns every state vector into another: $\hat A|\psi\rangle = |\phi\rangle$. Linear means sums and multiples pass straight through, for any numbers $c_1, c_2$: $\hat A(c_1|\psi_1\rangle + c_2|\psi_2\rangle) = c_1\hat A|\psi_1\rangle + c_2\hat A|\psi_2\rangle$."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: sweep(10, 80) }, image: { matrix: [['0','1'],['1','0']] }, basis: 'z', shot: 'H-FLAT' }` (**G1** `image`). Fallback: `{ psi: { planeDeg: 20 }, others: [{ ket: { planeDeg: 70 }, role: 'second', badge: 'Â|ψ⟩' }] }`.
- Caption: "the swap operator: every arrow is reflected across the 45° line"
- Claims: `inner(apply(SIGMA_X, ketFromBloch(2t,0)), ketFromBloch(Math.PI-2t,0))` = 1 for t = 10°, 20°, 45°, 80° (the image of the arrow at t is the arrow at 90° − t).
- Links: $|\psi\rangle$ → `psi` · $|\phi\rangle$ → `image`.

**`l3-operators:b3` [L]**
- Text: "So an operator is fixed by what it does to the two basis states. If $\hat A|{+z}\rangle = |\phi_+\rangle$ and $\hat A|{-z}\rangle = |\phi_-\rangle$, then $\hat A|\psi\rangle = c_+|\phi_+\rangle + c_-|\phi_-\rangle$ for every state. The swap sends $|{+z}\rangle$ to $|{-z}\rangle$ and back, so it just trades $c_+$ and $c_-$."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: 25 }, image: { matrix: [['0','1'],['1','0']] }, basis: 'z', shadows: true }` (**G1**; the image's shadows are drawn too). Fallback: `{ psi: '+z', others: [{ ket: '-z', role: 'second', badge: 'Â|+z⟩' }], rightAngle: true }`.
- Caption: "the image's two shadows are $|\psi\rangle$'s shadows, swapped"
- Claims: `apply(SIGMA_X, KET['+z'])` = `KET['-z']` = (0, 1); `apply(SIGMA_X, KET['-z'])` = `KET['+z']`.
- Links: $|\phi_+\rangle$ → `image` · $c_+$ → `shadow-1` · $c_-$ → `shadow-2`.

**`l3-operators:b4` [L]**
- Text: "In the $z$ basis a state is a column $\begin{pmatrix}c_+\\c_-\end{pmatrix}$ and an operator is a 2×2 [[matrix-representation|matrix]] $A$, written without the hat. Then $\hat A|\psi\rangle$ is matrix times column, and each entry is a [[matrix-element|matrix element]] $A_{ij} = \langle i|\hat A|j\rangle$ for basis states $|i\rangle, |j\rangle$. Column $j$ lists the parts of $\hat A|j\rangle$: for the swap, column 1 is $\begin{pmatrix}0\\1\end{pmatrix}$."
- Stage: `hilbert-plane` · `{ psi: '+z', others: [{ ket: '-z', role: 'second', badge: 'column 1 = Â|+z⟩' }], basis: 'z', rightAngle: true }` (exact with today's fields).
- Caption: "$A = \begin{pmatrix}0&1\\1&0\end{pmatrix}$: column 1 is where $|{+z}\rangle$ lands"
- Claims: $A_{11}$ — `inner(KET['+z'], apply(SIGMA_X, KET['+z']))` = 0; $A_{21}$ — `inner(KET['-z'], apply(SIGMA_X, KET['+z']))` = 1.
- Links: $|i\rangle, |j\rangle$ → `basis-1`, `basis-2`.

**`l3-operators:b5` [B]**
- Text: "Susskind (§3.1.1) borrows Wheeler's picture: a machine with one slot in and one slot out, made linear by three rules. Townsend (§2.2, pp. 34–35) gives a machine with physical meaning: turning a spin 90° about $y$ sends $|{+z}\rangle$ to $|{+x}\rangle$. That turn is something done to the atom; it is not a measurement."
- Stage: `hilbert-plane` · `{ psi: '+x', others: [{ ket: '+z', role: 'ghost', badge: 'before the turn' }], arc: true }` (arc 45° = half of the 90° lab turn).
- Caption: "a 90° turn in the lab is a 45° turn in state space"
- Claims: `apply(rotation([0,1,0], Math.PI/2), KET['+z'])` = (0.7071, 0.7071) = `KET['+x']`.
- Refs: Susskind §3.1.1 — adds: "the machine picture and its three rules (one output for every input, multiples pass through, sums pass through)". Townsend §2.2, pp. 34–35 (Fig. 2.1) — adds: "a rotation operator as an example of an operator that changes the physical state; operators act on kets, not on the numbers in front of them".
- Fidelity: `plane-half-angles`.
- Links: "$|{+z}\rangle$" → `ghost` · "45°" → `angle-arc`.

**`l3-operators:b6` [C]**
- Question: "Is $|{+x}\rangle$ *the* column $\tfrac{1}{\sqrt2}\begin{pmatrix}1\\1\end{pmatrix}$?"
- Question stage: `hilbert-plane` · `{ psi: '+x', basis: 'z', shadows: true, ticks: true }`.
- Reveal text: "Only in the $z$ basis. Against the $x$ basis the same arrow has parts 1 and 0, so there its column is $\begin{pmatrix}1\\0\end{pmatrix}$. The state and the operator stay fixed; only their columns and matrices depend on the basis (Lecture 5 changes bases in full)."
- Reveal stage: `hilbert-plane` · `{ psi: '+x', basis: 'x', shadows: true }`.
- Reveal caption: "same arrow, new frame: shadows 1 and 0"
- Claims: `toBasis(KET['+x'], [KET['+x'], KET['-x']])` = (1, 0); `inner(KET['+z'], KET['+x'])` = `inner(KET['-z'], KET['+x'])` = 0.7071.

### Unit `l3-eigen` — Directions an operator only stretches

Example matrix: $M = \begin{pmatrix}2&1\\1&2\end{pmatrix}$ (`mat([[2,1],[1,2]])`, also an `OperatorAction` preset). Complex Hermitian example: $H = \begin{pmatrix}1&-2i\\2i&-1\end{pmatrix}$. Non-Hermitian example: $R = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$ = `rotation([0,1,0], Math.PI)`.

**`l3-eigen:b1` [L]**
- Text: "Most arrows come out of $\hat A$ pointing somewhere new. An [[eigenvector]] $|a\rangle$ stays on its own line, $\hat A|a\rangle = a|a\rangle$: it is only stretched, shrunk or flipped by the number $a$, its [[eigenvalue]]. For $M = \begin{pmatrix}2&1\\1&2\end{pmatrix}$, $|{+x}\rangle$ is tripled, $|{-x}\rangle$ is left as it is, and $|{+z}\rangle$ is turned."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: sweep(0, 180) }, image: { matrix: [['2','1'],['1','2']] } }` (**G1**). Fallback: `{ psi: '+x', others: [{ ket: '-x', role: 'second', badge: 'eigenvalue 1' }], rightAngle: true }`, with the `OperatorAction` widget (preset `'[[2,1],[1,2]]'`) in Try-it doing the sweep.
- Caption: "the image lines up with the arrow only at 45° (×3) and 135° (×1)"
- Claims: `apply(M, KET['+x'])` = (2.1213, 2.1213) = 3·`KET['+x']`; `apply(M, KET['-x'])` = `KET['-x']`; `apply(M, KET['+z'])` = (2, 1); `eigenHermitian2(M).values` = [3, 1].
- Links: $|a\rangle$ → `psi` · $a|a\rangle$ → `image`.

**`l3-eigen:b2` [L]**
- Text: "Spin along $z$ has the matrix $S_z = \tfrac{\hbar}{2}\begin{pmatrix}1&0\\0&-1\end{pmatrix}$. Multiplying out gives $\hat S_z|{+z}\rangle = +\tfrac{\hbar}{2}|{+z}\rangle$ and $\hat S_z|{-z}\rangle = -\tfrac{\hbar}{2}|{-z}\rangle$. So $|{\pm z}\rangle$ are its eigenvectors, with eigenvalues $\pm\tfrac{\hbar}{2}$."
- Stage: `operator-space` · `{ op: { named: 'Sz' }, eigen: true, gauge: true, shot: 'O-STD' }`
- Caption: "operator space: the arrow's length is half the gap between the eigenvalues, the gauge is their midpoint (here 0)"
- Claims: `eigenHermitian2(SZ).values` = [0.5, −0.5]; `apply(SZ, KET['+z'])` = (0.5, 0); `apply(SZ, KET['-z'])` = (0, −0.5); `decomposeHermitian(SZ)` = {a0: 0, a: [0, 0, 0.5]}.
- Links: $+\tfrac{\hbar}{2}$ → `eigen-plus` · $-\tfrac{\hbar}{2}$ → `eigen-minus`.

**`l3-eigen:b3` [L]**
- Text: "The [[hermitian-conjugate|Hermitian conjugate]] $A^\dagger$ is the matrix with every entry complex-conjugated, then rows and columns swapped. An operator with $\hat A^\dagger = \hat A$ is [[hermitian|Hermitian]]. Three facts, taken without proof: its eigenvalues are real, eigenvectors with different eigenvalues are orthogonal, and they can form a complete orthonormal basis."
- Stage: `operator-space` · `{ op: { matrix: [['1','-2i'],['2i','-1']] }, eigen: true, gauge: true }`
- Caption: "$H = \begin{pmatrix}1&-2i\\2i&-1\end{pmatrix}$ has complex entries, yet $H^\dagger = H$ and its eigenvalues are $\pm\sqrt5 \approx \pm2.236$"
- Claims: `isHermitian(H)` = true; `eigenHermitian2(H).values` = [2.2361, −2.2361]; `decomposeHermitian(H)` = {a0: 0, a: [0, 2, 1]}; `inner(v₁, v₂)` = 0 for the two eigenvectors of `eigenHermitian2(H)`.
- Links: "orthogonal" → `ghost-sphere` (the ± eigen-points are antipodal there; the fidelity note explains antipodal = orthogonal).

**`l3-eigen:b4` [L]**
- Text: "Back to the magnet. The two eigenvectors of $\hat S_z$ are the two beams leaving an SG$_z$ magnet, and its eigenvalues $\pm\tfrac{\hbar}{2}$ are the two readings. The algebra and the experiment line up exactly."
- Stage: split · top `lab-r3` `{ benches: [main('oven', [Z])], shot: 'L-PLATE' }` · bottom `operator-space` `{ op: { named: 'Sz' }, eigen: true }`
- Caption: "two spots ↔ two eigenvalues; two beams ↔ two eigenvectors"
- Claims: `bT({source:'oven', axes:['z'], keep:[]})` → 0.5 / 0.5; `eigenHermitian2(SZ).vectors` = [`KET['+z']`, `KET['-z']`].
- Links: $+\tfrac{\hbar}{2}$ → `spot-plus` (lab) and `eigen-plus` (operator) · $-\tfrac{\hbar}{2}$ → `spot-minus`, `eigen-minus`.

**`l3-eigen:b5` [L]**
- Text: "Send any state $|\psi\rangle = c_+|{+z}\rangle + c_-|{-z}\rangle$, with $|c_+|^2 + |c_-|^2 = 1$, into SG$_z$. A theory of measurement must say which results can appear, how likely each is, and what state is left. Experiment already tells us: $\pm\tfrac{\hbar}{2}$; $|c_+|^2$ and $|c_-|^2$; and $|{+z}\rangle$ or $|{-z}\rangle$."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: sweep(0, 90) }, basis: 'z', shadows: true }`
- Caption: "the three questions: outcomes · probabilities · the state afterward"
- Claims: `prob(KET['+z'], ψ) + prob(KET['-z'], ψ)` = 1 for ψ at 0°, 60°, 90°; at 60°: `prob(KET['+z'], p60)` = 0.25.
- Links: $|c_+|^2$ → `bar-1` · $|c_-|^2$ → `bar-2`.

**`l3-eigen:b6` [B]**
- Text: "Susskind proves that the eigenvalues are real in a few lines (§3.1.4), and calls the orthonormal eigenbasis the fundamental theorem (§3.1.5). Townsend (§2.4, p. 50) shows why the matrix test works: $(A^\dagger)_{ij} = A_{ji}^*$. So a Hermitian matrix has real diagonal entries and mirror-image, conjugated entries across the diagonal."
- Stage: `operator-space` · same as b3.
- Caption: "$H_{12} = -2i$ and $H_{21} = +2i$: mirror images, conjugated"
- Claims: `inner(KET['+z'], apply(H, KET['-z']))` = −2i; `inner(KET['-z'], apply(H, KET['+z']))` = 2i; `matEq(dagger(H), H)` = true.
- Refs: Susskind §3.1.3–3.1.5; Townsend §2.4 p. 50 (eq. 2.80) and §2.2 p. 36 (why a generator must be Hermitian).

**`l3-eigen:b7` [C]**
- Question: "Every operator has a matrix. Could $\hat R$, with $R = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$, stand for something we measure?"
- Question stage: `hilbert-plane` · `{ psi: { planeDeg: sweep(0, 180) }, image: { matrix: [['0','-1'],['1','0']] } }` (**G1**; every image is a quarter turn ahead). Fallback: `{ psi: { planeDeg: 20 }, others: [{ ket: { planeDeg: 110 }, role: 'second', badge: 'R̂ψ' }], rightAngle: true }`.
- Reveal text: "No. $\hat R$ turns every real arrow by a quarter turn, so no real direction stays on its line; its eigenvectors are $|{\pm y}\rangle$, with eigenvalues $\mp i$. Those are not real numbers, so they cannot be meter readings, and indeed $R^\dagger \neq R$. (Townsend §2.2: this $\hat R$ turns a spin 180° about $y$.)"
- Reveal stage: unchanged.
- Claims: `isHermitian(R)` = false; `matEq(R, rotation([0,1,0], Math.PI))` = true; `inner(KET['+y'], apply(R, KET['+y']))` = −i; `inner(KET['-y'], apply(R, KET['-y']))` = +i; `samePhysicalState(apply(R, KET['+y']), KET['+y'])` = true. **Do not** call `eigenHermitian2(R)`: it returns [1, −1] for this non-Hermitian matrix (§7 E4, §8).

### Unit `l3-projectors` — Projectors keep one part of a state

**`l3-projectors:b1` [L]**
- Text: "To isolate one piece of a state, define the [[projector]] $\hat P_{+z} = |{+z}\rangle\langle{+z}|$ (the notes' $P_\uparrow$). On any state it keeps the $|{+z}\rangle$ part and drops the rest: $\hat P_{+z}|\psi\rangle = |{+z}\rangle\langle{+z}|\psi\rangle = c_+|{+z}\rangle$. The kept amplitude is the overlap $c_+ = \langle{+z}|\psi\rangle$."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: 60 }, basis: 'z', shadows: true, project: 1 }` (**G2** `project`: draw $\hat P_1|\psi\rangle$ as a vector). Fallback: shadows only.
- Caption: "for $|\psi_{60}\rangle = \tfrac12|{+z}\rangle + \tfrac{\sqrt3}{2}|{-z}\rangle$: $\hat P_{+z}|\psi_{60}\rangle = \tfrac12|{+z}\rangle$, the shadow as a vector"
- Claims: `apply(Pu, p60)` = (0.5, 0); `inner(KET['+z'], p60)` = 0.5.
- Links: $\hat P_{+z}|\psi\rangle$ → `shadow-1` · $|\psi\rangle$ → `psi`.

**`l3-projectors:b2` [L]**
- Text: "Project a second time and nothing changes: the shadow of a shadow is itself. In symbols, $\hat P_{+z}^2 = \hat P_{+z}$. A projector is a filter, not a turn."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: 60 }, basis: 'z', project: 1 }` (**G2**; the projected vector is projected again and does not move).
- Caption: "$\hat P_{+z}\hat P_{+z}|\psi_{60}\rangle = \tfrac12|{+z}\rangle$ again"
- Claims: `matEq(matmul(Pu, Pu), Pu)` = true; `classify(Pu).projector` = true; `apply(Pu, apply(Pu, p60))` = (0.5, 0).

**`l3-projectors:b3` [L]**
- Text: "The two projectors rebuild any state: $(\hat P_{+z} + \hat P_{-z})|\psi\rangle = |\psi\rangle$, so $\hat P_{+z} + \hat P_{-z} = \hat 1$, the [[identity-operator|identity]]. This [[completeness]] holds in every complete orthonormal basis $\{|a_i\rangle\}$: $\sum_i |a_i\rangle\langle a_i| = \hat 1$. Inserting $\hat 1$ gives $|\psi\rangle = \sum_i c_i|a_i\rangle$ with $c_i = \langle a_i|\psi\rangle$."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: 60 }, basis: 'x', shadows: true }`
- Caption: "in the $x$ basis: $c_{+x} \approx 0.966$, $c_{-x} \approx -0.259$; the two shadows still add up to $|\psi_{60}\rangle$"
- Claims: `matEq(madd(Pu, Pd), identity(2))` = true; `matEq(madd(projector(KET['+x']), projector(KET['-x'])), identity(2))` = true; `inner(KET['+x'], p60)` = 0.9659; `inner(KET['-x'], p60)` = −0.2588.
- Links: $c_i$ → `shadow-1`, `shadow-2` · $\hat 1$ → `psi` (the rebuilt arrow).

**`l3-projectors:b4` [L]**
- Text: "Weight each projector by its reading: $\hat S_z = \tfrac{\hbar}{2}\hat P_{+z} - \tfrac{\hbar}{2}\hat P_{-z}$. In general $\hat A = \sum_i a_i|a_i\rangle\langle a_i|$, and $\hat A|a_j\rangle = a_j|a_j\rangle$ because $\langle a_i|a_j\rangle$ is 1 for $i = j$ and 0 otherwise. An [[observable]] bundles two lists: the states a device tells apart, and the number it reports for each."
- Stage: `operator-space` · `{ op: { a0: 0.25, a: [0, 0, 0.25] }, add: { a0: -0.25, a: [0, 0, 0.25] }, eigen: true, gauge: true, shot: 'O-GAUGE' }`
- Caption: "$\tfrac{\hbar}{2}\hat P_{+z}$ plus $-\tfrac{\hbar}{2}\hat P_{-z}$: the arrows add up to $\hat S_z$ and the gauges cancel to 0"
- Claims: `decomposeHermitian(mscale(Pu, 0.5))` = {a0: 0.25, a: [0, 0, 0.25]}; `decomposeHermitian(mscale(Pd, -0.5))` = {a0: −0.25, a: [0, 0, 0.25]}; `matEq(fromSpectrum([0.5, -0.5], [KET['+z'], KET['-z']]), SZ)` = true.
- Links: "the states" → `eigen-plus`, `eigen-minus` · "the number" → `gauge-a0` and `arrow-a`.

**`l3-projectors:b5` [B]**
- Text: "Townsend (§2.3, pp. 41–43) builds these in hardware. A magnet whose two beams are merged again, with nothing recorded, acts as $\hat 1$. Block one path and it acts as a projector: $|{+z}\rangle$ passes (eigenvalue 1) and $|{-z}\rangle$ is stopped (eigenvalue 0)."
- Stage: `lab-r3` · `{ benches: [main('+x', [Zkeep, Z], true)], readouts: ['blocked'], shot: 'L-TRACK' }`
- Caption: "block the − path: half of the $|{+x}\rangle$ atoms stop, every survivor reads + again (the merged-beam device is not drawn)"
- Claims: `bT({source:'+x', axes:['z','z'], keep:['+']})` → blocked [0.5], plus 0.5, minus 0; `eigenHermitian2(Pu).values` = [1, 0]; `apply(Pu, KET['-z'])` = (0, 0).
- Refs: Townsend §2.3 pp. 41–43 (Fig. 2.4), §2.4 p. 48 (matrix of P₊, completeness as a matrix identity).
- Fidelity: `lab-block-projects` (new, §10).
- Links: "Block" → `beam-stop`.

**`l3-projectors:b6` [C]**
- Question: "$\hat P_{+z}|\psi_{60}\rangle = \tfrac12|{+z}\rangle$. Is that a state an atom could be in?"
- Question stage: `hilbert-plane` · `{ psi: { planeDeg: 60 }, basis: 'z', project: 1 }` (**G2**).
- Reveal text: "Not yet: its length is $\tfrac12$, and a state must have length 1. Rescaled to length 1 it is $|{+z}\rangle$, which is what the surviving atoms carry. The squared length, $\tfrac14$, is the share that survives; the next unit turns this into the rules."
- Reveal stage: `hilbert-plane` · `{ psi: { planeDeg: 60 }, basis: 'z', project: 1, renormalize: true }` (**G2**). Fallback: `{ psi: '+z', others: [{ ket: { planeDeg: 60 }, role: 'ghost', badge: 'before' }] }`.
- Claims: `norm(apply(Pu, p60))` = 0.5; `normalize(apply(Pu, p60))` = `KET['+z']`; `expectation(Pu, p60)` = 0.25.

### Unit `l3-postulates` — Three rules for every measurement

**`l3-postulates:b1` [L]**
- Text: "Let $\hat A|a_i\rangle = a_i|a_i\rangle$, and expand the state in that eigenbasis: $|\psi\rangle = \sum_i c_i|a_i\rangle$ with $c_i = \langle a_i|\psi\rangle$. **Rule 1:** a measurement of $A$ returns one of the eigenvalues $a_i$. The state may be a superposition, but the record is always a single $a_i$."
- Stage: `lab-r3` · `{ benches: [main('+x', [Z], true)], flow: 'single', shot: 'L-PLATE' }`
- Caption: "one atom, one spot: $+\tfrac{\hbar}{2}$ or $-\tfrac{\hbar}{2}$, never in between"
- Claims: `eigenHermitian2(SZ).values` = [0.5, −0.5]; `bT({source:'+x', axes:['z'], keep:[]})` → 0.5 / 0.5.
- Links: $a_i$ → `spot-plus`, `spot-minus`.

**`l3-postulates:b2` [L]**
- Text: "**Rule 2**, the Born rule: $P(a_i) = |\langle a_i|\psi\rangle|^2 = |c_i|^2$. Since $|c_i|^2 = \langle\psi|a_i\rangle\langle a_i|\psi\rangle$, this is a projector sandwich, $P(a_i) = \langle\psi|\hat P_i|\psi\rangle$ with $\hat P_i = |a_i\rangle\langle a_i|$. For $|\psi_{60}\rangle$ along $z$: $P(+\tfrac{\hbar}{2}) = \tfrac14$ and $P(-\tfrac{\hbar}{2}) = \tfrac34$."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: 60 }, basis: 'z', shadows: true }`
- Caption: "shadow ½ → probability ¼; shadow $\tfrac{\sqrt3}{2}$ → probability ¾"
- Claims: `prob(KET['+z'], p60)` = 0.25; `expectation(Pu, p60)` = 0.25; `prob(KET['-z'], p60)` = 0.75.
- Links: $|c_i|^2$ → `bar-1`, `bar-2`.

**`l3-postulates:b3` [L]**
- Text: "Add the probabilities of every outcome: $\sum_i\langle\psi|\hat P_i|\psi\rangle = \langle\psi|\hat 1|\psi\rangle = 1$. Completeness is what makes the odds of mutually exclusive results add to exactly one."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: sweep(0, 180) }, basis: 'x', shadows: true }`
- Caption: "turn the state any way: the two bars always fill exactly 1"
- Claims: `expectation(projector(KET['+x']), ψ) + expectation(projector(KET['-x']), ψ)` = 1 for ψ at 0°, 60°, 135°; at 60°: 0.9330 + 0.0670.

**`l3-postulates:b4` [L]**
- Text: "**Rule 3:** if $a_i$ is found, the state becomes the normalized projection $\hat P_i|\psi\rangle/\sqrt{\langle\psi|\hat P_i|\psi\rangle}$. For a [[nondegenerate]] eigenvalue that is just $|a_i\rangle$, up to an overall phase that changes no prediction. Example: $|{+y}\rangle$ giving $-\tfrac{\hbar}{2}$ becomes $i|{-z}\rangle$, the same state as $|{-z}\rangle$."
- Stage: `hilbert-plane` · `{ psi: { planeDeg: 60 }, basis: 'z', project: 2, renormalize: true }` (**G2**; result −: the $|{-z}\rangle$ shadow grows to length 1). Fallback: `{ psi: '-z', others: [{ ket: { planeDeg: 60 }, role: 'ghost', badge: 'before' }] }`.
- Caption: "result $-\tfrac{\hbar}{2}$: the $|{-z}\rangle$ shadow, $\tfrac{\sqrt3}{2}$ long, is rescaled to length 1"
- Claims: `normalize(apply(Pd, p60))` = `KET['-z']`; `normalize(apply(Pd, KET['+y']))` = (0, i); `samePhysicalState(normalize(apply(Pd, KET['+y'])), KET['-z'])` = true.
- Links: $\hat P_i|\psi\rangle$ → `shadow-2` · $|a_i\rangle$ → `basis-2`.

**`l3-postulates:b5` [L]**
- Text: "Measuring $A$ is **not** the map $|\psi\rangle \to \hat A|\psi\rangle$: applying $\hat A$ to $c_1|a_1\rangle + c_2|a_2\rangle$ gives $a_1c_1|a_1\rangle + a_2c_2|a_2\rangle$, still a superposition. A measurement instead ends in $|a_1\rangle$ with probability $|c_1|^2$, or in $|a_2\rangle$ with probability $|c_2|^2$. It hands back two things: a recorded number, and a new state that matches it."
- Stage: split · top `lab-r3` `{ benches: [main('+x', [Z], true)], flow: 'single', shot: 'L-PLATE' }` · bottom `hilbert-plane` `{ psi: '+x', image: { named: 'Sz' }, basis: 'z', shadows: true }` (**G1**; the image is drawn at half length, ħ = 1). Fallback bottom: `{ psi: '+x', others: [{ ket: '-x', role: 'second', badge: 'direction of Ŝz|+x⟩' }], basis: 'z', shadows: true }`.
- Caption: "$\hat S_z|{+x}\rangle = \tfrac{\hbar}{2}|{-x}\rangle$; the magnet leaves $|{+z}\rangle$ or $|{-z}\rangle$, never $|{-x}\rangle$"
- Claims: `apply(SZ, KET['+x'])` = (0.3536, −0.3536) = 0.5·`KET['-x']`; `norm(apply(SZ, KET['+x']))` = 0.5; `samePhysicalState(KET['-x'], KET['+z'])` = false and `samePhysicalState(KET['-x'], KET['-z'])` = false; `measure(SZ, KET['+x'], 0.3).post` = `KET['+z']`, `measure(SZ, KET['+x'], 0.7).post` = `KET['-z']` (probs [0.5, 0.5]).
- Fidelity: `lab-both-paths`.
- Links: $\hat A|\psi\rangle$ → `image` · "one branch" → `tracked-atom`.

**`l3-postulates:b6` [B]**
- Text: "Susskind (§3.5) calls this the most common misconception, and his example is ours: $\hat\sigma_z = 2\hat S_z/\hbar$ turns $|r\rangle = |{+x}\rangle$ into $|l\rangle = |{-x}\rangle$. Yet no $\sigma_z$ reading ever leaves $|l\rangle$. In §4.7 he shows what $\hat A|\psi\rangle$ is for: it is one half of the average $\langle\psi|\hat A|\psi\rangle$."
- Stage: `hilbert-plane` · `{ psi: '+x', others: [{ ket: '-x', role: 'second', badge: 'σ̂z|+x⟩' }], rightAngle: true }` (exact today: the image has length 1).
- Caption: "$\langle{+x}|\hat\sigma_z|{+x}\rangle = \langle{+x}|{-x}\rangle = 0$: a right angle, so the average is 0"
- Claims: `apply(SIGMA_Z, KET['+x'])` = `KET['-x']` = (0.7071, −0.7071); `inner(KET['+x'], KET['-x'])` = 0; `expectation(SIGMA_Z, KET['+x'])` = 0.
- Refs: Susskind §3.5 and §4.7; Susskind §3.2 — adds: "the same rules stated as four principles; Lecture 4 is built on them."
- Links: $|l\rangle$ → `psi`'s partner arrow (anchor `image` if G1 lands; today none) · "0" → `right-angle`.

**`l3-postulates:b7` [C]**
- Question: "For $|{-z}\rangle$, applying $\hat S_z$ gives $-\tfrac{\hbar}{2}|{-z}\rangle$, and measuring $S_z$ leaves $|{-z}\rangle$. So do the two agree after all?"
- Question stage: `hilbert-plane` · `{ psi: '-z', basis: 'z', shadows: true }`
- Reveal text: "Only for eigenstates. $-\tfrac{\hbar}{2}|{-z}\rangle$ is $|{-z}\rangle$ times a number, so it is the same physical state, and the reading is certain. For $|{+x}\rangle$ the image points along $|{-x}\rangle$, a state an SG$_z$ magnet never leaves behind."
- Reveal stage: `hilbert-plane` · `{ psi: '+x', others: [{ ket: '-x', role: 'second', badge: 'Ŝz|+x⟩ (direction)' }], basis: 'z', shadows: true }`
- Claims: `samePhysicalState(apply(SZ, KET['-z']), KET['-z'])` = true; `prob(KET['-z'], KET['-z'])` = 1; `samePhysicalState(apply(SZ, KET['+x']), KET['-x'])` = true; `prob(KET['-x'], KET['+z'])` = 0.5 (so $|{-x}\rangle$ is neither output).

### Unit `l3-spin-example` — One spin, measured from start to finish

Badge: "taught at the start of Lecture 4" (L4 notes p. 1).

**`l3-spin-example:b1` [L]**
- Text: "Prepare $|{+x}\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle + |{-z}\rangle)$ and measure $S_z$. Rule 1: the results are $\pm\tfrac{\hbar}{2}$. Rule 2: $P(+\tfrac{\hbar}{2}) = |\langle{+z}|{+x}\rangle|^2 = \tfrac12$, and $P(-\tfrac{\hbar}{2}) = \tfrac12$ too."
- Stage: split · top `lab-r3` `{ benches: [main('+x', [Z], true)], shot: 'L-PLATE' }` · bottom `hilbert-plane` `{ psi: '+x', basis: 'z', shadows: true, ticks: true }`
- Caption: "two equal spots; two equal squared shadows"
- Claims: `bT({source:'+x', axes:['z'], keep:[]})` → 0.5 / 0.5; `prob(KET['+z'], KET['+x'])` = 0.5.
- Links: $\tfrac12$ → `spot-plus` and `bar-1`.

**`l3-spin-example:b2` [L]**
- Text: "Suppose the result is $+\tfrac{\hbar}{2}$. Rule 3 sets the state to $|{+z}\rangle$, so a second $S_z$ right away gives $+\tfrac{\hbar}{2}$ with probability $|\langle{+z}|{+z}\rangle|^2 = 1$. Measure the same thing twice in a row and the answer repeats."
- Stage: `lab-r3` · `{ benches: [main('+x', [Zkeep, Z], true)], readouts: ['blocked'], shot: 'L-TRACK' }`
- Caption: "half the atoms stop at the block; every survivor lands + again"
- Claims: `bT({source:'+x', axes:['z','z'], keep:['+']})` → blocked [0.5], plus 0.5, minus 0; `prob(KET['+z'], KET['+z'])` = 1.
- Links: $|{+z}\rangle$ → `chip-1`.

**`l3-spin-example:b3` [L]**
- Text: "Now put an $S_x$ magnet in between. Since $|{+z}\rangle = \tfrac{1}{\sqrt2}(|{+x}\rangle + |{-x}\rangle)$, it reads $\pm\tfrac{\hbar}{2}$ with probability $\tfrac12$ each. After a + result the state is $|{+x}\rangle$, and a final $S_z$ is 50/50 again."
- Stage: `lab-r3` · `{ benches: [main('+x', [Zkeep, Xkeep, Z], true)], readouts: ['fractions'], shot: 'L-WIDE' }`
- Caption: "share of the source atoms: 1 → ½ → ¼ → ⅛ + ⅛"
- Claims: `bT({source:'+x', axes:['z','x','z'], keep:['+','+']})` → blocked [0.5, 0.25], plus 0.125, minus 0.125; `prob(KET['+x'], KET['+z'])` = 0.5.
- Links: $|{+x}\rangle$ → `chip-2`.

**`l3-spin-example:b4` [L]**
- Text: "This is Lecture 1's sequential experiment, now derived from the rules. Measuring leaves the atom in one of that measurement's own eigenstates. Measuring along another axis usually disturbs it, so the first answer need not come back."
- Stage: split · top `lab-r3` (the b3 bench) · bottom `hilbert-plane` `{ psi: '+z', basis: 'x', shadows: true }`
- Caption: "$|{+z}\rangle$ seen from the $x$ basis: two equal shadows"
- Claims: `prob(KET['+x'], KET['+z'])` = `prob(KET['-x'], KET['+z'])` = 0.5.

**`l3-spin-example:b5` [B]**
- Text: "Townsend (§1.2, pp. 8–9) reruns this bench with one change: the $x$ device's two beams are merged again, and nothing records the path. Then the last $z$ magnet sends every atom up. What disturbs the state is obtaining an $x$ result, not the $x$ magnet's field alone."
- Stage: `lab-r3` · `{ benches: [main('+x', [Zkeep, Z], true)], shot: 'L-WIDE' }` (the bench his result is equivalent to).
- Caption: "merged and unrecorded, the $x$ stage changes nothing: all atoms land + (our lab does not draw the merged device)"
- Claims: `bT({source:'+x', axes:['z','z'], keep:['+']}).minus` = 0.
- Refs: Townsend §1.2 pp. 8–9 (Experiment 4, Fig. 1.6); §1.4 pp. 14–15 (amplitudes of $|{+x}\rangle$).
- Fidelity: `lab-both-paths`.

**`l3-spin-example:b6` [C]**
- Question: "The repeat $S_z$ left $|{+z}\rangle$ alone. Why doesn't the $S_x$ magnet leave it alone too?"
- Question stage: `lab-r3` · `{ benches: [main('+x', [Zkeep, Xkeep, Z], true)], flow: 'single', shot: 'L-TRACK' }`
- Reveal text: "A measurement leaves a state untouched only when the state is one of its eigenvectors. $|{+z}\rangle$ is an eigenvector of $\hat S_z$ but not of $\hat S_x$. It has two nonzero $x$ amplitudes, so the $x$ magnet must pick one."
- Reveal stage: `hilbert-plane` · `{ psi: '+z', basis: 'x', shadows: true }`
- Claims: `inner(KET['+x'], KET['+z'])` = `inner(KET['-x'], KET['+z'])` = 0.7071; `samePhysicalState(apply(SX, KET['+z']), KET['+z'])` = false; `samePhysicalState(apply(SZ, KET['+z']), KET['+z'])` = true.

### Unit `l3-spread` — Averages and spreads of many readings

Badge: "taught at the start of Lecture 4". Lab readout **G3** `spread` = a ±Δσ bracket around the `centroid` tick, where Δσ = √(1 − ⟨σₙ⟩²) is the spread of *single* readings. It is not L1's `sigma-band` (the spread of the *mean*, 2√(p(1−p)/N)); the two must never share a caption.

**`l3-spread:b1` [L]**
- Text: "Only now, with the whole list of odds, define the average. For outcomes $a_i$ with probabilities $P(a_i)$, the [[expectation|expectation value]] is $\langle A\rangle = \sum_i a_i P(a_i)$. The Born rule and $\hat A = \sum_i a_i|a_i\rangle\langle a_i|$ fold this into one sandwich: $\langle A\rangle = \langle\psi|\hat A|\psi\rangle$."
- Stage: `lab-r3` · `{ benches: [main('+x', [Z], true)], readouts: ['centroid'], shot: 'L-PLATE' }`
- Caption: "$|{+x}\rangle$ along $z$: the average tick sits at 0"
- Claims: `expectation(SZ, KET['+x'])` = 0; `0.5*prob(KET['+z'],KET['+x']) - 0.5*prob(KET['-z'],KET['+x'])` = 0; for the running state `expectation(SZ, p60)` = −0.25 = `0.5*0.25 - 0.5*0.75`.
- Refs: Townsend §2.6 p. 58 (the same average as a row × matrix × column product, eq. 2.105–2.106).
- Links: $\langle A\rangle$ → `centroid`.

**`l3-spread:b2` [L]**
- Text: "So for $|{+x}\rangle$, $\langle S_z\rangle = (+\tfrac{\hbar}{2})\tfrac12 + (-\tfrac{\hbar}{2})\tfrac12 = 0$. Yet no atom ever reads 0. An average describes many atoms prepared and measured the same way, not any one of them."
- Stage: `lab-r3` · `{ benches: [main('+x', [Z], true)], readouts: ['centroid'], deposit: 'build', shot: 'L-PLATE-C' }`
- Caption: "the tick sits in the empty middle: nothing lands there"
- Claims: `bT({source:'+x', axes:['z'], keep:[]})` → 0.5 / 0.5; `expectation(SZ, KET['+x'])` = 0.
- Links: "0" → `centroid` · "no atom" → `spot-plus`, `spot-minus`.

**`l3-spread:b3` [L]**
- Text: "The scatter is measured by the [[variance]] $(\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2$ and its square root, the [[uncertainty|spread]] $\Delta A$. For spin ½, $\hat S_z^2 = \tfrac{\hbar^2}{4}\hat 1$, so $\langle S_z^2\rangle = \tfrac{\hbar^2}{4}$ in every state. For $|{+x}\rangle$ this gives $\Delta S_z = \tfrac{\hbar}{2}$."
- Stage: `lab-r3` · `{ benches: [main('+x', [Z], true)], readouts: ['centroid', 'spread'], shot: 'L-PLATE' }` (**G3**). Fallback: `readouts: ['centroid']` with the number in the caption.
- Caption: "the bracket: $\Delta S_z = \tfrac{\hbar}{2}$; each reading sits one spread from the average"
- Claims: `matEq(matmul(SZ, SZ), mscale(identity(2), 0.25))` = true; `expectation(matmul(SZ, SZ), p60)` = 0.25; `Math.sqrt(variance(SZ, KET['+x']))` = 0.5.
- Links: $\Delta A$ → `spread` (new lab anchor with G3; fallback `centroid`).

**`l3-spread:b4` [L]**
- Text: "Compare $|{+z}\rangle$: $\langle S_z\rangle = \tfrac{\hbar}{2}$ and $\langle S_z^2\rangle = \tfrac{\hbar^2}{4}$, so $\Delta S_z = 0$. In an eigenstate every repeat gives the same value, so the spread vanishes. A superposition of different eigenstates spreads its readings out."
- Stage: `lab-r3` · `{ benches: [main('+z', [Z], true)], readouts: ['centroid', 'spread'], shot: 'L-PLATE' }` (**G3**)
- Caption: "every atom in the + spot: average $+\tfrac{\hbar}{2}$, spread 0"
- Claims: `expectation(SZ, KET['+z'])` = 0.5; `variance(SZ, KET['+z'])` = 0; `bT({source:'+z', axes:['z'], keep:[]}).plus` = 1.

**`l3-spread:b5` [B]**
- Text: "Townsend (§1.4, pp. 16–17) calls $\Delta S_z$ an uncertainty, not a standard deviation, because one atom in $|{+x}\rangle$ has no definite $S_z$. His Example 1.2 has $z$ odds ¼ and ¾, so $\langle S_z\rangle = -\tfrac{\hbar}{4}$ and $\Delta S_z = \tfrac{\sqrt3}{4}\hbar \approx 0.43\hbar$. His closing sentence puts the 75 % on $+\tfrac{\hbar}{2}$; it belongs to $-\tfrac{\hbar}{2}$ (Errata)."
- Stage: `lab-r3` · `{ benches: [main('+z', [{ axis: { tiltDeg: 120 } }], true)], readouts: ['centroid', 'spread'], shot: 'L-PLATE' }` (**G3**)
- Caption: "the same odds on our bench: ¼ in +, ¾ in −, magnet tilted 120°; average $-\tfrac{\hbar}{4}$, spread $0.43\hbar$"
- Claims: `bT({source:'+z', axes:[120], keep:[]})` → plus 0.25, minus 0.75; with `psiT = vec(0.5, c(0, Math.sqrt(3)/2))`: `prob(KET['+z'], psiT)` = 0.25, `expectation(SZ, psiT)` = −0.25, `Math.sqrt(variance(SZ, psiT))` = 0.4330; the same three numbers for `p60`.
- Refs: Townsend §1.4 pp. 15–17 (eqs. 1.20–1.22, Example 1.2, fluctuations ~√N); §1.6 p. 24 (eqs. 1.47–1.49); Susskind §4.7 — adds: "the average defined two ways, as a probability-weighted sum and as the mean of many trials; they agree when the trials are many."
- Errata chip: E1 (§7).

**`l3-spread:b6` [C]**
- Question: "$|{+z}\rangle$ has zero spread in $S_z$. Does it also have zero spread in $S_x$?"
- Question stage: `lab-r3` · `{ benches: [main('+z', [Z], true)], readouts: ['centroid'], shot: 'L-PLATE' }`
- Reveal text: "No. Along $x$ it splits 50/50, so $\langle S_x\rangle = 0$ and $\Delta S_x = \tfrac{\hbar}{2}$, the largest spread a spin ½ can have. Can any state be sharp in two quantities at once? That is where the notes point next: compatible observables and commutators (Lecture 7)."
- Reveal stage: `lab-r3` · `{ benches: [main('+z', [X], true)], readouts: ['centroid', 'spread'], shot: 'L-PLATE' }` (**G3**)
- Claims: `expectation(SX, KET['+z'])` = 0; `Math.sqrt(variance(SX, KET['+z']))` = 0.5; `bT({source:'+z', axes:['x'], keep:[]})` → 0.5 / 0.5; bound: `variance(spinAlong(n), ψ) ≤ 0.25` for every sampled n, ψ (because $\langle S_n^2\rangle = \tfrac{\hbar^2}{4}$).

**Beat count:** 6 + 7 + 6 + 7 + 6 + 6 = **38 beats**, of which **6 clue beats** with reveals. L → B → C order holds in every unit.

## 2. Try-it widget per unit

Props are the real ones from `app/src/widgets/*.tsx`. Every readout these widgets show is already computed by the engine inside the widget.

| Unit | Widget (`kind`) and props | Why this one | "Try this" prompts |
|---|---|---|---|
| `l3-operators` | `operator-action` `{ preset: 'σx' }` | Drag a real unit arrow and see $A$ times it. The swap is the preset `'σx'` (the widget labels it σx; the caption says "the swap, named $\hat\sigma_x$ in Lecture 4"). | 1. Drag the arrow slowly: its image is its mirror across the 45° line. 2. Put the arrow on $\lvert{+z}\rangle$ (pointing right). Compare the image with the first column of $A$. 3. Set $a = 1$, $b = 0$, $d = -1$. Which arrows are flipped, and which stay put? |
| `l3-eigen` | `operator-action` `{ preset: '[[2,1],[1,2]]' }` | The readout says "it's an eigenvector" when $A$ only stretches the arrow, and shows the eigenvalues on request. It is the 2-D "stretch, not turn" picture that the `operator-space` stage cannot show. | 1. Drag until the readout turns green: there are exactly two such directions, at right angles. 2. Read the stretch factors (3 and 1), then press "show eigenvalues" to check. 3. Change $d$ to 3. Do the eigen-directions move? Are they still at right angles? (They are: the matrix is still symmetric, so Hermitian.) |
| `l3-projectors` | `operator-builder` `{ axis: 'z' }` | Builds $\hat S = \tfrac{\hbar}{2}\hat P_+ - \tfrac{\hbar}{2}\hat P_-$ step by step, with live checks for completeness, Hermiticity and the eigen equation. | 1. Step through the $z$ build. Check $\hat P_+ + \hat P_- = \hat 1$ in the readout. 2. Switch to "tilt" at 60°. The projectors are no longer diagonal, yet all three checks stay ✓. 3. At any tilt, say what the two projectors' diagonals are. (They are the $z$ probabilities of the two outcome states.) Lecture 4 does the $x$ and $y$ builds by hand, so the prompts stay on $z$ and tilt. |
| `l3-postulates` | `projector` `{ state: 60, basis: 0, editableBasis: true }` | Shadow → amplitude → squared shadow → probability, with the sum shown. It is exact for real states. | 1. With $\psi$ at 60°, read $\tfrac14$ and $\tfrac34$: that is the Born rule for $\lvert\psi_{60}\rangle$. 2. Switch the basis to 45° (the $x$ basis): 93.3 % and 6.7 %. The sum is still 100 % (completeness). 3. Find the one state that gives 100 % in the $x$ basis. It is an eigenvector of that measurement, so the measurement would leave it unchanged. |
| `l3-spin-example` | `sg-lab` `{ source: '+x', axes: ['z','z'], keep: ['+'], editable: true, maxDevices: 3, predict: true }` | The §6 bench, with prediction before reveal and exact theory from `benchTheory`. | 1. Predict, then fire: after a kept $+z$, a second $z$ gives + every time. 2. Insert an $x$ magnet in the middle (keep +). Predict the final split: ½ of the atoms that reach it, ⅛ of the source. 3. Turn the middle magnet back to $z$. Does the final result become certain again? |
| `l3-spread` | `deposit-stats` `{ state: '+x', axis: 'z', seed: 448 }` | Finite batches against the Born prediction. The average reading is $(2k - N)/N$ in units of $\tfrac{\hbar}{2}$, where $k$ is the up count out of $N$ atoms. | 1. Fire 10 atoms a few times. The up count wanders, and so does the average reading, around 0. Yet every atom reads $\pm\tfrac{\hbar}{2}$. 2. Fire 10 000: the count settles near 5000 ± 50. The average settles; single readings do not. 3. Every reading is exactly $\tfrac{\hbar}{2}$ away from the average 0. Explain from that why $\Delta S_z = \tfrac{\hbar}{2}$ here. |

Caption warning for `deposit-stats` in this unit: its $\sigma_k = \sqrt{N p(1-p)}$ is the scatter of the **count** over a batch. It is not $\Delta S_z$. The link is $\Delta\sigma = 2\sqrt{p(1-p)}$ for one reading, so the scatter of the mean is $\Delta\sigma/\sqrt N$ (§10).

## 3. Challenges per unit

Format: id · tier · kind. Numeric answers are in units of ħ where marked (the UI appends ħ), with tolerance 0.005 unless stated. Hints go nudge → key idea → setup. A walkthrough is a list of steps. The only homework the notes assign is the margin note on p. 5 ("you will prove this in homework": Hermitian eigenvalues are real). That item carries `assigned: 'L3 p.5'`: hints only, no walkthrough.

### `l3-operators`
**l3-op-swap** · warm-up · numeric
- Prompt: "The swap operator $A = \begin{pmatrix}0&1\\1&0\end{pmatrix}$ acts on $|\psi\rangle = 0.6|{+z}\rangle + 0.8|{-z}\rangle$. What is the $|{+z}\rangle$ amplitude of $\hat A|\psi\rangle$?"
- Answer: **0.8** — `inner(KET['+z'], apply(SIGMA_X, vec(0.6, 0.8)))`.
- Hints: (1) Where does the swap send each basis state? (2) By linearity, $\hat A|\psi\rangle = 0.6\,\hat A|{+z}\rangle + 0.8\,\hat A|{-z}\rangle$. (3) Substitute $\hat A|{+z}\rangle = |{-z}\rangle$ and $\hat A|{-z}\rangle = |{+z}\rangle$, then read the $|{+z}\rangle$ coefficient.
- Walkthrough: $\hat A|\psi\rangle = 0.6|{-z}\rangle + 0.8|{+z}\rangle$ → the $|{+z}\rangle$ amplitude is 0.8 → as columns, $\begin{pmatrix}0&1\\1&0\end{pmatrix}\begin{pmatrix}0.6\\0.8\end{pmatrix} = \begin{pmatrix}0.8\\0.6\end{pmatrix}$, the same answer.

**l3-op-columns** · core · choice
- Prompt: "An operator $\hat B$ does $\hat B|{+z}\rangle = |{+z}\rangle + 2|{-z}\rangle$ and $\hat B|{-z}\rangle = 3|{-z}\rangle$. Which matrix represents it in the $z$ basis?"
- Options: $\begin{pmatrix}1&0\\2&3\end{pmatrix}$ ✓ (column $j$ is the image of basis state $j$) · $\begin{pmatrix}1&2\\0&3\end{pmatrix}$ ✗ (the images written as rows: the transpose) · $\begin{pmatrix}1&0\\0&3\end{pmatrix}$ ✗ (drops the $2|{-z}\rangle$ part) · $\begin{pmatrix}3&0\\2&1\end{pmatrix}$ ✗ (basis order swapped).
- Engine: `B = fromColumns([vec(1,2), vec(0,3)])`; `inner(KET['-z'], apply(B, KET['+z']))` = 2 = $B_{21}$.
- Hints: (1) $B_{ij} = \langle i|\hat B|j\rangle$. Which index says which input you used? (2) Column $j$ holds the components of $\hat B|j\rangle$. (3) Write $\hat B|{+z}\rangle$ as a column and put it first.
- Walkthrough: $\hat B|{+z}\rangle \leftrightarrow \begin{pmatrix}1\\2\end{pmatrix}$ is column 1 → $\hat B|{-z}\rangle \leftrightarrow \begin{pmatrix}0\\3\end{pmatrix}$ is column 2 → $B = \begin{pmatrix}1&0\\2&3\end{pmatrix}$ → check: $B_{21} = \langle{-z}|\hat B|{+z}\rangle = 2$.

**l3-op-linear** · stretch · numeric
- Prompt: "Use the same $\hat B$. What is the $|{-z}\rangle$ component of $\hat B|{+x}\rangle$?"
- Answer: **3.5355** ($= 5/\sqrt2$) — `inner(KET['-z'], apply(B, KET['+x']))`.
- Hints: (1) You do not need a new rule for $|{+x}\rangle$. (2) Write $|{+x}\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle + |{-z}\rangle)$ and use linearity. (3) The answer is $\tfrac{1}{\sqrt2}(2 + 3)$.
- Walkthrough: linearity → $\hat B|{+x}\rangle = \tfrac{1}{\sqrt2}(\hat B|{+z}\rangle + \hat B|{-z}\rangle) = \tfrac{1}{\sqrt2}(|{+z}\rangle + 5|{-z}\rangle)$ → the component is $5/\sqrt2 \approx 3.536$ → note this is not a probability: $\hat B$ is not a measurement, and its output is not normalized.

### `l3-eigen`
**l3-eig-sz** · warm-up · numeric (units ħ)
- Prompt: "$\hat S_z|{-z}\rangle = \lambda|{-z}\rangle$. What is $\lambda$?"
- Answer: **−0.5** — `inner(KET['-z'], apply(SZ, KET['-z']))`.
- Hints: (1) Multiply the matrix by the column $\begin{pmatrix}0\\1\end{pmatrix}$. (2) $S_z = \tfrac{\hbar}{2}\begin{pmatrix}1&0\\0&-1\end{pmatrix}$. (3) The result is a multiple of $\begin{pmatrix}0\\1\end{pmatrix}$. Which multiple?
- Walkthrough: $S_z\begin{pmatrix}0\\1\end{pmatrix} = \tfrac{\hbar}{2}\begin{pmatrix}0\\-1\end{pmatrix} = -\tfrac{\hbar}{2}\begin{pmatrix}0\\1\end{pmatrix}$ → $\lambda = -\tfrac{\hbar}{2}$, the down reading of an SG$_z$ magnet.

**l3-eig-which** · core · choice
- Prompt: "Which state is an eigenvector of $M = \begin{pmatrix}2&1\\1&2\end{pmatrix}$?"
- Options: $|{-x}\rangle$ ✓ ($M|{-x}\rangle = |{-x}\rangle$, eigenvalue 1) · $|{+z}\rangle$ ✗ ($M|{+z}\rangle = (2, 1)$ is not on the line of $(1, 0)$) · $|{+y}\rangle$ ✗ ($M|{+y}\rangle \propto (2+i,\ 1+2i)$, not a multiple of $(1, i)$) · $\tfrac{1}{\sqrt5}(1, 2)$ ✗.
- Engine: `samePhysicalState(apply(M, s), s)` is true only for `KET['+x']` and `KET['-x']` among the six named kets, and false for `normalize(vec(1,2))`.
- Hints: (1) Apply $M$ and ask: is the output on the same line as the input? (2) A symmetric real 2×2 with equal diagonal entries treats $|{\pm x}\rangle$ specially. (3) Compute $M\begin{pmatrix}1\\-1\end{pmatrix}$.
- Walkthrough: $M(1,-1)^{\mathsf T} = (1,-1)^{\mathsf T}$ → so $|{-x}\rangle$ is an eigenvector with eigenvalue 1 → the other eigenvector is $|{+x}\rangle$, with eigenvalue 3 → they are orthogonal, as the Hermitian facts promise.

**l3-eig-hermitian** · core · choice
- Prompt: "Which matrix is Hermitian?"
- Options: $\begin{pmatrix}1&2i\\-2i&1\end{pmatrix}$ ✓ · $\begin{pmatrix}1&2i\\2i&1\end{pmatrix}$ ✗ (the lower entry must be the conjugate, $-2i$) · $\begin{pmatrix}i&0\\0&1\end{pmatrix}$ ✗ (a diagonal entry must be real) · $\begin{pmatrix}0&-1\\1&0\end{pmatrix}$ ✗ (real but antisymmetric).
- Engine: `isHermitian` → true, false, false, false.
- Hints: (1) Conjugate every entry, then swap rows and columns. Is the result the same matrix? (2) Diagonal entries must equal their own conjugates. (3) Each off-diagonal pair must be conjugates: $A_{21} = A_{12}^*$.
- Walkthrough: apply the test to each option → only the first passes → note that the last one is the $\hat R$ of the clue, whose eigenvalues are $\pm i$.

**l3-eig-real** · stretch · numeric · `assigned: 'L3 p.5'` (hints only)
- Prompt: "Homework (notes p. 5): show that a Hermitian operator has real eigenvalues. First, a numerical check. For $H = \begin{pmatrix}1&-2i\\2i&-1\end{pmatrix}$, what is the imaginary part of $\langle{+y}|\hat H|{+y}\rangle$?"
- Answer: **0** — `inner(KET['+y'], apply(H, KET['+y']))` = 2 + 0i (tolerance 1e-6).
- Hints: (1) Start from $\hat A|a\rangle = a|a\rangle$ and take the inner product with $\langle a|$. (2) Compare the number $\langle a|\hat A|a\rangle$ with its complex conjugate, using $\hat A^\dagger = \hat A$. (3) Setup: write $\langle a|\hat A|a\rangle$ twice, once letting $\hat A$ act to the right and once to the left, then compare.
- Walkthrough: withheld (assigned).

### `l3-projectors`
**l3-proj-length** · warm-up · numeric
- Prompt: "How long is $\hat P_{-z}|\psi_{60}\rangle$, for $|\psi_{60}\rangle = \tfrac12|{+z}\rangle + \tfrac{\sqrt3}{2}|{-z}\rangle$?"
- Answer: **0.8660** — `norm(apply(Pd, p60))`.
- Hints: (1) A projector keeps one component. (2) $\hat P_{-z}|\psi\rangle = \langle{-z}|\psi\rangle\,|{-z}\rangle$. (3) The length is $|\langle{-z}|\psi_{60}\rangle|$.
- Walkthrough: $\hat P_{-z}|\psi_{60}\rangle = \tfrac{\sqrt3}{2}|{-z}\rangle$ → the length is $\tfrac{\sqrt3}{2} \approx 0.866$ → its square, $\tfrac34$, will be the probability (next unit).

**l3-proj-matrix** · core · choice
- Prompt: "Which matrix is $\hat P_\psi = |\psi_{60}\rangle\langle\psi_{60}|$ in the $z$ basis?"
- Options: $\begin{pmatrix}\tfrac14&\tfrac{\sqrt3}{4}\\\tfrac{\sqrt3}{4}&\tfrac34\end{pmatrix}$ ✓ · $\begin{pmatrix}\tfrac14&0\\0&\tfrac34\end{pmatrix}$ ✗ (dropping the off-diagonal parts keeps the odds but loses the state) · $\begin{pmatrix}\tfrac12&0\\0&\tfrac{\sqrt3}{2}\end{pmatrix}$ ✗ (amplitudes on the diagonal) · $\begin{pmatrix}\tfrac34&\tfrac{\sqrt3}{4}\\\tfrac{\sqrt3}{4}&\tfrac14\end{pmatrix}$ ✗ (components swapped).
- Engine: `projector(p60)` = [[0.25, 0.4330], [0.4330, 0.75]]; `classify(projector(p60)).projector` = true.
- Hints: (1) $|\psi\rangle\langle\psi|$ is a column times a row. (2) Entry $(i, j)$ is $c_i c_j^*$. (3) The column is $(\tfrac12, \tfrac{\sqrt3}{2})$; multiply it by the same row.
- Walkthrough: column × row → $\tfrac12\cdot\tfrac12 = \tfrac14$, $\tfrac12\cdot\tfrac{\sqrt3}{2} = \tfrac{\sqrt3}{4}$, $\tfrac{\sqrt3}{2}\cdot\tfrac{\sqrt3}{2} = \tfrac34$ → check $P^2 = P$: the trace is 1 and the determinant is 0.

**l3-proj-build** · core · numeric
- Prompt: "Build $\hat A = 3|{+x}\rangle\langle{+x}| + 1\,|{-x}\rangle\langle{-x}|$. What is $A_{12} = \langle{+z}|\hat A|{-z}\rangle$?"
- Answer: **1** — `fromSpectrum([3, 1], [KET['+x'], KET['-x']])` = [[2, 1], [1, 2]].
- Hints: (1) Write each projector as a 2×2 matrix first. (2) $|{\pm x}\rangle\langle{\pm x}| = \tfrac12\begin{pmatrix}1&\pm1\\\pm1&1\end{pmatrix}$. (3) Add $3\times$ the first and $1\times$ the second.
- Walkthrough: $\tfrac32\begin{pmatrix}1&1\\1&1\end{pmatrix} + \tfrac12\begin{pmatrix}1&-1\\-1&1\end{pmatrix} = \begin{pmatrix}2&1\\1&2\end{pmatrix}$ → $A_{12} = 1$ → this is the $M$ from `l3-eigen`. Its eigen-data were built in, so of course $|{\pm x}\rangle$ are its eigenvectors, with eigenvalues 3 and 1.

**l3-proj-notcomplete** · stretch · choice
- Prompt: "Is $\hat P_{+z} + \hat P_{+x}$ a projector?"
- Options: "No: its square is not itself, because $|{+z}\rangle$ and $|{+x}\rangle$ are not orthogonal" ✓ · "Yes: a sum of projectors is always a projector" ✗ · "Yes: it equals $\hat 1$ by completeness" ✗ (completeness needs an orthonormal basis) · "No, because the matrix has a zero entry" ✗.
- Engine: `classify(madd(Pu, projector(KET['+x']))).projector` = false; the matrix is [[1.5, 0.5], [0.5, 0.5]].
- Hints: (1) Test $P^2 = P$ directly. (2) The cross terms $\hat P_{+z}\hat P_{+x} + \hat P_{+x}\hat P_{+z}$ must vanish for the sum to be a projector. (3) Those cross terms contain $\langle{+z}|{+x}\rangle = \tfrac{1}{\sqrt2} \neq 0$.
- Walkthrough: $(\hat P_{+z} + \hat P_{+x})^2 = \hat P_{+z} + \hat P_{+x} + (\text{cross terms})$ → the cross terms are not zero because the two states overlap → so it is not a projector, and not $\hat 1$ either. The diagonal already shows it: $1.5 \neq 1$.

### `l3-postulates`
**l3-post-born** · warm-up · numeric
- Prompt: "Measure $S_z$ on $|\psi_{60}\rangle$. What is the probability of $-\tfrac{\hbar}{2}$?"
- Answer: **0.75** — `prob(KET['-z'], p60)`.
- Hints: (1) Which eigenvector goes with $-\tfrac{\hbar}{2}$? (2) $P = |\langle{-z}|\psi_{60}\rangle|^2$. (3) $\langle{-z}|\psi_{60}\rangle = \tfrac{\sqrt3}{2}$.
- Walkthrough: outcome state $|{-z}\rangle$ → amplitude $\tfrac{\sqrt3}{2}$ → probability $\tfrac34$ → check: $\tfrac14 + \tfrac34 = 1$.

**l3-post-x** · core · numeric
- Prompt: "Now measure $S_x$ on $|\psi_{60}\rangle$. What is the probability of $+\tfrac{\hbar}{2}$?"
- Answer: **0.9330** — `prob(KET['+x'], p60)`.
- Hints: (1) The eigenvectors of $\hat S_x$ are the states an SG$_x$ magnet leaves: $|{\pm x}\rangle$. (2) $\langle{+x}|\psi_{60}\rangle = \tfrac{1}{\sqrt2}(\tfrac12 + \tfrac{\sqrt3}{2})$. (3) Square it.
- Walkthrough: amplitude ≈ 0.966 → probability ≈ 0.933 → if the result is +, the state becomes $|{+x}\rangle$ (Rule 3) → the − outcome has ≈ 0.067, and the two sum to 1.

**l3-post-after** · core · choice
- Prompt: "An atom in $|{+y}\rangle$ is measured along $z$ and gives $-\tfrac{\hbar}{2}$. Which state describes it afterward?"
- Options: $|{-z}\rangle$ ✓ (the normalized projection is $i|{-z}\rangle$: the same state) · $\hat S_z|{+y}\rangle$ ✗ (that is proportional to $|{-y}\rangle$: applying $\hat S_z$ is not measuring) · $\tfrac{1}{\sqrt2}|{-z}\rangle$ ✗ (projected but not rescaled) · $|{+y}\rangle$ unchanged ✗.
- Engine: `samePhysicalState(normalize(apply(Pd, KET['+y'])), KET['-z'])` = true; `samePhysicalState(apply(SZ, KET['+y']), KET['-y'])` = true; `norm(apply(Pd, KET['+y']))` = 0.7071.
- Hints: (1) Rule 3: project, then rescale. (2) $\hat P_{-z}|{+y}\rangle = \tfrac{i}{\sqrt2}|{-z}\rangle$. (3) An overall factor of $i$ changes no prediction.
- Walkthrough: project → rescale by $1/\sqrt{\tfrac12}$ → $i|{-z}\rangle$ → same physical state as $|{-z}\rangle$ → the tempting $\hat S_z|{+y}\rangle$ points along $|{-y}\rangle$, a state this magnet never leaves.

**l3-post-steps** · stretch · order
- Prompt: "Put the steps of a measurement prediction in order."
- Steps (correct order): "Find the eigenvalues $a_i$ and eigenvectors $|a_i\rangle$ of $\hat A$" → "Compute the amplitudes $c_i = \langle a_i|\psi\rangle$" → "Square them: $P(a_i) = |c_i|^2$" → "Check that the probabilities add to 1" → "For the result $a_i$ actually seen, replace the state by $|a_i\rangle$".
- Engine check for the example in the walkthrough: `measure(SZ, p60, u)` gives probs [0.25, 0.75] and post `KET['+z']` (u < 0.25) or `KET['-z']`.
- Hints: (1) You cannot square an amplitude you have not computed. (2) The eigenvectors decide which amplitudes to compute. (3) The update comes last, because it depends on which result actually occurred.
- Walkthrough: run the five steps on $|\psi_{60}\rangle$ and $S_z$ → $\pm\tfrac{\hbar}{2}$ → $c = \tfrac12, \tfrac{\sqrt3}{2}$ → $\tfrac14, \tfrac34$ → sum 1 → the state becomes $|{+z}\rangle$ or $|{-z}\rangle$.

### `l3-spin-example`
**l3-ex-repeat** · warm-up · numeric
- Prompt: "$|{+x}\rangle$ atoms pass SG$_z$ (keep +), then a second SG$_z$. What fraction of the source atoms lands in the final − spot?"
- Answer: **0** — `bT({source:'+x', axes:['z','z'], keep:['+']}).minus`.
- Hints: (1) What state leaves the first magnet's + beam? (2) Is that state an eigenvector of the second magnet's $\hat S_z$? (3) $P(-\tfrac{\hbar}{2}) = |\langle{-z}|{+z}\rangle|^2$.
- Walkthrough: the kept atoms are in $|{+z}\rangle$ → $\langle{-z}|{+z}\rangle = 0$ → so 0; half the source was stopped at the block.

**l3-ex-insert** · core · numeric
- Prompt: "Same source, bench $z$ (keep +) → $x$ (keep +) → $z$. What fraction of the **source** atoms lands in the final + spot?"
- Answer: **0.125** — `bT({source:'+x', axes:['z','x','z'], keep:['+','+']}).plus`. Trap: 0.5, which is the share of the atoms that *reach* the last magnet.
- Hints: (1) Follow one atom's chances magnet by magnet. (2) Each magnet whose axis differs from the previous state's axis by 90° splits 50/50. (3) Multiply the three halves.
- Walkthrough: $\tfrac12$ pass $z$ → $\tfrac12$ of those pass $x$ → $\tfrac12$ of those land + → $\tfrac18$ of the source; ½ of the atoms reaching the last magnet.

**l3-ex-tilt** · stretch · numeric
- Prompt: "Same source, bench $z$ (keep +) → a magnet tilted 60° from $z$ toward $x$ (keep +) → $z$. What fraction of the source lands in the final + spot?"
- Answer: **0.28125** — `bT({source:'+x', axes:['z', 60, 'z'], keep:['+','+']}).plus`.
- Hints: (1) Lecture 1: $P(+) = \cos^2\tfrac{\theta}{2}$ between two axes at angle $\theta$. (2) The kept states are $|{+z}\rangle$, then $|{+n}\rangle$ with $\hat n$ at 60°. (3) $\tfrac12\times\cos^2 30^\circ\times\cos^2 30^\circ$.
- Walkthrough: $\tfrac12$ → $\times\tfrac34$ → $\times\tfrac34$ → $\tfrac{9}{32} = 0.28125$. The tilted magnet disturbs less than a 90° one, so more atoms return +.

### `l3-spread`
**l3-sp-mean** · warm-up · numeric (units ħ)
- Prompt: "What is $\langle S_z\rangle$ for $|\psi_{60}\rangle$?"
- Answer: **−0.25** — `expectation(SZ, p60)`.
- Hints: (1) $\langle A\rangle = \sum_i a_i P(a_i)$. (2) The odds are ¼ for $+\tfrac{\hbar}{2}$ and ¾ for $-\tfrac{\hbar}{2}$. (3) $\tfrac{\hbar}{2}\cdot\tfrac14 - \tfrac{\hbar}{2}\cdot\tfrac34$.
- Walkthrough: $\tfrac{\hbar}{8} - \tfrac{3\hbar}{8} = -\tfrac{\hbar}{4}$ → as a sandwich, $\langle\psi_{60}|\hat S_z|\psi_{60}\rangle$ gives the same.

**l3-sp-spread** · core · numeric (units ħ)
- Prompt: "What is $\Delta S_z$ for $|\psi_{60}\rangle$?"
- Answer: **0.4330** — `Math.sqrt(variance(SZ, p60))`.
- Hints: (1) $(\Delta S_z)^2 = \langle S_z^2\rangle - \langle S_z\rangle^2$. (2) For spin ½, $\langle S_z^2\rangle = \tfrac{\hbar^2}{4}$ in every state. (3) $\tfrac{\hbar^2}{4} - \tfrac{\hbar^2}{16}$.
- Walkthrough: $\tfrac{3\hbar^2}{16}$ → $\Delta S_z = \tfrac{\sqrt3}{4}\hbar \approx 0.433\hbar$ → the same as Townsend's Example 1.2, which has the same odds.

**l3-sp-zero** · core · choice
- Prompt: "For $|{+x}\rangle$, $\langle S_z\rangle = 0$. Which statement is right?"
- Options: "Every atom reads $\pm\tfrac{\hbar}{2}$, and the mean of many readings is 0" ✓ · "Some atoms read $S_z = 0$" ✗ · "Each atom's spin points along $x$, so its $S_z$ is exactly 0" ✗ (no atom ever reads 0) · "$\Delta S_z = 0$, because the average is zero" ✗ ($\Delta S_z = \tfrac{\hbar}{2}$, the largest possible).
- Engine: `bT({source:'+x', axes:['z'], keep:[]})` → 0.5 / 0.5; `expectation(SZ, KET['+x'])` = 0; `Math.sqrt(variance(SZ, KET['+x']))` = 0.5.
- Hints: (1) Rule 1: which values can one reading take? (2) An expectation value is a statement about many runs. (3) Compute $\Delta S_z$ before you pick.
- Walkthrough: readings are only $\pm\tfrac{\hbar}{2}$ → half and half, so the mean is 0 → the spread is $\tfrac{\hbar}{2}$, as large as it can be.

**l3-sp-complex** · stretch · numeric (units ħ)
- Prompt: "$|\psi\rangle = \tfrac{1}{\sqrt3}|{+z}\rangle + i\sqrt{\tfrac23}\,|{-z}\rangle$. What is $\Delta S_z$?"
- Answer: **0.4714** ($= \tfrac{\sqrt2}{3}$) — `Math.sqrt(variance(SZ, vec(1/Math.sqrt(3), c(0, Math.sqrt(2/3)))))`.
- Hints: (1) The $i$ does not change the $z$ odds. (2) $P(+) = \tfrac13$, $P(-) = \tfrac23$, so $\langle S_z\rangle = -\tfrac{\hbar}{6}$. (3) $(\Delta S_z)^2 = \tfrac{\hbar^2}{4} - \tfrac{\hbar^2}{36}$.
- Walkthrough: $\tfrac{8\hbar^2}{36} = \tfrac{2\hbar^2}{9}$ → $\Delta S_z = \tfrac{\sqrt2}{3}\hbar \approx 0.471\hbar$ → phases never enter $z$ statistics; they do matter for $x$ and $y$ (Lectures 5–6).

## 4. Glossary terms new in L3

Same rules as `glossary.ts`: one plain sentence of ≤ 25 words. Any technical word inside a gloss has its own entry (here or in L1/L2). "First" is the unit or beat of first use. Existing L1 entries reused without change: `state`, `measurement`, `outcome`, `probability`, `inner-product`, `ket`, `bra`, `orthogonal`, `basis`, `orthonormal-basis`, `amplitude`, `normalized`, `born-rule`, `superposition`, `global-phase`, `expectation`, `scatter`, `hbar`, `s-z`, `sigma-reading`, `complex-number`, `magnitude`.

| id | Term | Gloss | First | uses |
|---|---|---|---|---|
| `linear-operator` | linear operator $\hat A$ | A rule that turns every state vector into another one, and respects sums and multiples; the hat marks it as an operator. | `l3-operators:b2` | `state`, `vector` |
| `linearity` | linear | Acting on a sum gives the sum of the separate results, and acting on a multiple gives the same multiple of the result. | `l3-operators:b2` | — |
| `matrix-representation` | matrix $A$ (of an operator) | The grid of numbers that stands for an operator once a basis is chosen; the same operator has a different matrix in each basis. | `l3-operators:b4` | `linear-operator`, `basis` |
| `matrix-element` | matrix element $A_{ij} = \langle i\vert\hat A\vert j\rangle$ | One entry of an operator's matrix: apply the operator to basis state $j$, then take the inner product with basis state $i$. | `l3-operators:b4` | `inner-product`, `basis` |
| `eigenvector` | eigenvector (eigenstate) $\vert a\rangle$ | A state that an operator only rescales, $\hat A\vert a\rangle = a\vert a\rangle$, so it stays on its own line. | `l3-eigen:b1` | `linear-operator` |
| `eigenvalue` | eigenvalue $a$ | The number by which an operator rescales one of its eigenvectors. | `l3-eigen:b1` | `eigenvector` |
| `complex-conjugate` | complex conjugate $z^*$ | The number $z$ with the sign of its $i$ part flipped, so $(a+bi)^* = a - bi$. *(Skip if L2 already defines it.)* | `l3-eigen:b3` | `complex-number` |
| `transpose` | transpose | The matrix with its rows turned into columns, so the entry in row $i$, column $j$ moves to row $j$, column $i$. | `l3-eigen:b3` | `matrix-representation` |
| `hermitian-conjugate` | Hermitian conjugate $A^\dagger$ ("A dagger") | The matrix you get by taking the complex conjugate of every entry and then the transpose. | `l3-eigen:b3` | `complex-conjugate`, `transpose` |
| `hermitian` | Hermitian | Equal to its own Hermitian conjugate, $\hat A^\dagger = \hat A$; such operators have real eigenvalues and an orthonormal basis of eigenvectors. | `l3-eigen:b3` | `hermitian-conjugate`, `eigenvalue`, `eigenvector`, `orthonormal-basis` |
| `observable` | observable | A measurable quantity, represented by a Hermitian operator whose eigenvalues are the possible results and whose eigenvectors are the matching states. | `l3-projectors:b4` | `hermitian`, `eigenvalue`, `eigenvector` |
| `projector` | projector $\hat P_a = \vert a\rangle\langle a\vert$ | An operator that keeps only the part of a state along $\vert a\rangle$ and removes everything else. | `l3-projectors:b1` | `ket`, `bra` |
| `idempotent` | idempotent ($P^2 = P$) | Doing it twice has the same effect as doing it once, as for a projector. | `l3-projectors:b2` | `projector` |
| `identity-operator` | identity $\hat 1$ | The operator that leaves every state exactly as it is. | `l3-projectors:b3` | `linear-operator` |
| `completeness` | completeness $\sum_i\vert a_i\rangle\langle a_i\vert = \hat 1$ | The projectors onto a full orthonormal basis add up to the identity, so every state is rebuilt from its pieces. | `l3-projectors:b3` | `projector`, `identity-operator`, `orthonormal-basis` |
| `spectral-decomposition` | spectral decomposition $\hat A = \sum_i a_i\vert a_i\rangle\langle a_i\vert$ | Writing an observable as its eigenvalues times the projectors onto its eigenvectors, added up. | `l3-projectors:b4` | `eigenvalue`, `projector` |
| `projective-measurement` | ideal (projective) measurement | The textbook kind of measurement whose results and after-states follow the three rules of `l3-postulates`, with projectors doing the work. | `l3-postulates` | `projector`, `measurement` |
| `state-update` | state update ("collapse") | The rule that, after result $a_i$, the state is replaced by the rescaled projection onto $\vert a_i\rangle$. | `l3-postulates:b4` | `projector`, `normalized` |
| `nondegenerate` | nondegenerate eigenvalue | An eigenvalue that belongs to just one eigenvector direction, so the after-state is fixed by the result. | `l3-postulates:b4` | `eigenvalue`, `eigenvector` |
| `sandwich` | sandwich $\langle\psi\vert\hat A\vert\psi\rangle$ | Apply the operator to the state, then take the inner product with the same state. It gives a single number. | `l3-postulates:b2` | `inner-product`, `linear-operator` |
| `variance` | variance $(\Delta A)^2$ | The average squared distance of the readings from their mean: $\langle A^2\rangle - \langle A\rangle^2$. | `l3-spread:b3` | `expectation` |
| `uncertainty` | spread (uncertainty) $\Delta A$ | The square root of the variance: how far single readings typically land from the average; zero exactly in an eigenstate. | `l3-spread:b3` | `variance`, `eigenvector` |

Note on `expectation`: the L1 gloss is about ±1 readings. Suggest widening it once in L3's `glossary.ts` edit to: "The mean of many readings of the same quantity on identically prepared systems; for an observable, $\langle A\rangle = \langle\psi|\hat A|\psi\rangle$." That is 24 words. `first` stays L1.

## 5. Review card per unit

Each number is already a beat claim; the engine call is repeated in brackets where it helps.

### `l3-operators` — Operators: machines that turn states into states
- A linear operator turns states into states and respects sums and multiples.
- Its action on the two basis states fixes its action on all states.
- In a basis, the operator is a matrix: $A_{ij} = \langle i|\hat A|j\rangle$, and column $j$ is the image of $|j\rangle$.
- A column is a state's coordinates in one basis, not the state itself: $|{+x}\rangle$ is $(1,1)/\sqrt2$ in $z$ and $(1, 0)$ in $x$ [`toBasis`].

$$\hat A|\psi\rangle = |\phi\rangle,\qquad \hat A(c_1|\psi_1\rangle + c_2|\psi_2\rangle) = c_1\hat A|\psi_1\rangle + c_2\hat A|\psi_2\rangle,\qquad A_{ij} = \langle i|\hat A|j\rangle$$

**The one trap:** writing the images of the basis states as the matrix's *rows*. They are its columns; rows give the transpose.

### `l3-eigen` — Directions an operator only stretches
- An eigenvector stays on its own line: $\hat A|a\rangle = a|a\rangle$.
- $\hat S_z$ has eigenvectors $|{\pm z}\rangle$ and eigenvalues $\pm\tfrac{\hbar}{2}$: the two beams and the two readings of SG$_z$.
- Hermitian means $\hat A^\dagger = \hat A$ (conjugate, then transpose). Then the eigenvalues are real and the eigenvectors can form an orthonormal basis.
- A measurement theory must answer three questions: which results, with what odds, and which state afterward.

$$\hat A|a\rangle = a|a\rangle,\qquad \hat S_z|{\pm z}\rangle = \pm\tfrac{\hbar}{2}|{\pm z}\rangle,\qquad (A^\dagger)_{ij} = A_{ji}^*,\qquad \hat A^\dagger = \hat A$$

**The one trap:** thinking every operator could be an observable. $R = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$ has eigenvalues $\pm i$, which no meter can show.

### `l3-projectors` — Projectors keep one part of a state
- $\hat P_a = |a\rangle\langle a|$ keeps the $|a\rangle$ part: $\hat P_{+z}|\psi\rangle = c_+|{+z}\rangle$ with $c_+ = \langle{+z}|\psi\rangle$.
- Projecting twice changes nothing: $\hat P^2 = \hat P$.
- For a complete orthonormal basis the projectors add to $\hat 1$. That is why $|\psi\rangle = \sum_i c_i|a_i\rangle$ with $c_i = \langle a_i|\psi\rangle$.
- An observable is its outcomes times its projectors: $\hat S_z = \tfrac{\hbar}{2}\hat P_{+z} - \tfrac{\hbar}{2}\hat P_{-z}$ [`fromSpectrum`].

$$\hat P_a = |a\rangle\langle a|,\quad \hat P_a^2 = \hat P_a,\quad \sum_i|a_i\rangle\langle a_i| = \hat 1,\quad \hat A = \sum_i a_i|a_i\rangle\langle a_i|$$

**The one trap:** treating $\hat P|\psi\rangle$ as a state. It has length $|c_i| \le 1$ and must be rescaled; for $|\psi_{60}\rangle$, $\hat P_{+z}|\psi_{60}\rangle$ has length ½.

### `l3-postulates` — Three rules for every measurement
- Rule 1: the result is one eigenvalue $a_i$, even when the state is a superposition.
- Rule 2 (Born): $P(a_i) = |\langle a_i|\psi\rangle|^2 = \langle\psi|\hat P_i|\psi\rangle$, and completeness makes the odds sum to 1.
- Rule 3: the state becomes $\hat P_i|\psi\rangle/\sqrt{\langle\psi|\hat P_i|\psi\rangle}$, which is $|a_i\rangle$ up to an overall phase.
- Values: for $|\psi_{60}\rangle$ along $z$, ¼ and ¾; along $x$, 0.933 and 0.067 [`prob(KET['+x'], p60)`].

$$P(a_i) = |\langle a_i|\psi\rangle|^2 = \langle\psi|\hat P_i|\psi\rangle,\qquad |\psi\rangle \to \frac{\hat P_i|\psi\rangle}{\sqrt{\langle\psi|\hat P_i|\psi\rangle}}$$

**The one trap:** measuring $A$ is not applying $\hat A$. $\hat S_z|{+x}\rangle = \tfrac{\hbar}{2}|{-x}\rangle$, but an $S_z$ measurement leaves $|{+z}\rangle$ or $|{-z}\rangle$.

### `l3-spin-example` — One spin, measured from start to finish
- $|{+x}\rangle$ along $z$: $\pm\tfrac{\hbar}{2}$ with ½ each.
- After a + result the state is $|{+z}\rangle$, so a repeat $S_z$ gives + with certainty.
- An $S_x$ in between leaves $|{\pm x}\rangle$, and a final $S_z$ is 50/50 again. That is ⅛ of the source in the final + spot [`benchTheory`].
- A measurement leaves a state alone only if the state is one of its eigenvectors.

$$P(\pm\tfrac{\hbar}{2}) = |\langle{\pm z}|{+x}\rangle|^2 = \tfrac12,\qquad |{+z}\rangle = \tfrac{1}{\sqrt2}(|{+x}\rangle + |{-x}\rangle)$$

**The one trap:** dividing by the wrong total. ⅛ is the share of the source; ½ is the share of the atoms that reach the last magnet.

### `l3-spread` — Averages and spreads of many readings
- $\langle A\rangle = \sum_i a_i P(a_i) = \langle\psi|\hat A|\psi\rangle$: a mean over many identical runs.
- $|{+x}\rangle$ has $\langle S_z\rangle = 0$, yet no atom reads 0.
- $(\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2$. For spin ½, $\langle S_z^2\rangle = \tfrac{\hbar^2}{4}$ always, so $\Delta S_z = \tfrac{\hbar}{2}$ for $|{+x}\rangle$ and 0 for $|{+z}\rangle$.
- For $|\psi_{60}\rangle$: $\langle S_z\rangle = -\tfrac{\hbar}{4}$ and $\Delta S_z \approx 0.433\hbar$ [`expectation`, `variance`].

$$\langle A\rangle = \langle\psi|\hat A|\psi\rangle,\qquad (\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2,\qquad \Delta A = 0 \iff |\psi\rangle \text{ is an eigenvector of } \hat A$$

**The one trap:** reading $\langle S_z\rangle = 0$ as "the spin has no $z$ part". Each atom reads $\pm\tfrac{\hbar}{2}$; zero is only the mean, and the spread is maximal.

(The last equation's "⇔" holds for any observable with $\langle\psi|\psi\rangle = 1$: $(\Delta A)^2 = \|(\hat A - \langle A\rangle)\psi\|^2$. The claim test checks it on the six named kets and random states: `variance(A, ψ) < 1e-12` exactly when `samePhysicalState(apply(A, ψ), ψ)`, for A = SZ, SX, M/4.)

## 6. Symbol-before-use table

Reading order: units in order; inside a unit, beats (text → caption → reveal), then Try-it, review and challenges. Status: OK = defined at or before first use · gloss = a glossary tag is enough · **FLAG** = used before it is defined, or clashes with another meaning. `L3.symbols` should seed the lint with the "First definition" column.

| Symbol | First use | First definition | Status | Fix / note |
|---|---|---|---|---|
| $\vert{\pm z}\rangle$, $\vert{\pm x}\rangle$ | `l3-operators:b1` | L1 `l1-vectors` | OK | Rosetta line in `l3-operators:b2`: the notes write $\vert{\uparrow}\rangle, \vert{\downarrow}\rangle$. |
| $\vert{\pm y}\rangle$ | `l3-eigen:b7` | L2 | OK | Prerequisite `complex-amplitudes`. |
| $c_\pm$ ($c_\uparrow, c_\downarrow$) | `l3-operators:b2` | same beat | OK | — |
| $\hat A$ (hat) vs $A$ (no hat) | `l3-operators:b2` / `:b4` | same beats | OK | The notes' margin rule (p. 3). Keep the hat on every operator in text; no hat only for a matrix in a named basis. |
| $\vert\phi\rangle$, $c_1, c_2$, $\vert\psi_{1,2}\rangle$ | `l3-operators:b2` | same beat | OK | Fixed while drafting ("for any numbers $c_1, c_2$"). |
| $A_{ij}$, $\vert i\rangle, \vert j\rangle$ | `l3-operators:b4` | same beat | OK | gloss `matrix-element`. |
| $\hat S_z$ as an operator | `l3-eigen:b2` | same beat (the matrix) | OK | L1 used $S_z$ for the reading. One clause suffices: "the operator for the $z$ reading". |
| $\vert a\rangle$, $a$ | `l3-eigen:b1` | same beat | OK | gloss `eigenvector`, `eigenvalue`. |
| $A^\dagger$ | `l3-eigen:b3` | same beat (in words) | OK | gloss `hermitian-conjugate`. |
| $z^*$ (star for complex conjugate) | `l3-eigen:b6` ($A_{ji}^*$) | not in L3 text; L2 probably | **FLAG** (minor) | Tag `complex-conjugate` with `symbols: ['^*']`, or add "($^*$ = complex conjugate)" in b6. |
| operator-space axes $a_0$, $\vec a$ and the passport's $\vec\sigma$ | `l3-eigen:b2` (first `operator-space` in the course) | $\vec\sigma$ only in Lecture 4 (Pauli matrices) | **FLAG** (forward reference) | The passport is derived per kind and cannot be edited per beat. Its $A = a_0I + \vec a\cdot\vec\sigma$ therefore reaches L3 readers before $\vec\sigma$ exists. Fix: the b2 caption already reads the arrow as "half the eigenvalue gap" and the gauge as "the midpoint". Also add a passport gloss link "$\vec\sigma$: the Pauli matrices, Lecture 4". |
| $M$, $H$, $R$ | `l3-eigen:b1`, `:b3`, `:b7` | same beats | OK | Single letters are local to their unit; say so in the unit intro line. |
| $\hat P_{+z}$, $\hat P_{-z}$ ($P_\uparrow, P_\downarrow$) | `l3-projectors:b1` | same beat | OK | Rosetta added in b1. |
| $\vert\psi_{60}\rangle$ | `l3-projectors:b1` (caption) | same caption | OK | Repeat the definition on the first `l3-postulates` and `l3-spread` beat that uses it (units can be entered from the map). |
| $\hat 1$ vs the notes' $\mathbf 1$ vs L4's $I$ | `l3-projectors:b3` | same beat | **FLAG** (notation clash across lectures) | Pick one app-wide symbol. Recommend $\hat 1$ in prose and $I$ in matrices, with the gloss `identity-operator` listing all three spellings (`symbols: ['\\hat 1', 'I', '\\mathbf 1']`). |
| $\{\vert a_i\rangle\}$, $c_i$, $a_i$ | `l3-projectors:b3` / `:b4` | same beats | OK | — |
| $P(a_i)$ (probability) vs $\hat P_i$ (projector) | `l3-postulates:b2` | same beat | **FLAG** (clash, inherited from the notes) | The notes use both $P(a_i)$ and $P_i$ in one line (p. 11). Rule for the app: a projector always wears a hat, and a probability always has parentheses. Add one gloss line: "a hat means an operator". |
| $\hat\sigma_z$, $\vert r\rangle$, $\vert l\rangle$ | `l3-postulates:b6` | same beat ($\hat\sigma_z = 2\hat S_z/\hbar$; $\vert r\rangle = \vert{+x}\rangle$) | OK | L1 defined $\sigma$ as a reading; the operator version is one clause. |
| $\langle A\rangle$ vs $\langle\psi\vert\hat A\vert\psi\rangle$ | `l3-spread:b1` | same beat | OK | L1's note already covers it: "angle brackets around one symbol mean an average; with bars they are an inner product". Here the two are *equal*, which is the point of the beat. |
| $\langle A^2\rangle$, $\hat S_z^2$ | `l3-spread:b3` | gloss `variance` | gloss | $\hat S_z^2$ means $\hat S_z$ applied twice; say it in the caption or tag `variance`. |
| $\Delta A$, $(\Delta A)^2$ | `l3-spread:b3` | same beat | OK | gloss `uncertainty`. L1's `scatter` (standard deviation of a *mean*) stays separate. |
| $\theta$, $\hat n$ in `l3-ex-tilt` hints | challenge | L1 `l1-average` | OK | Defined again inline ("two axes at angle $\theta$"). |
| $N$, $k$ in the `deposit-stats` prompt | Try-it, `l3-spread` | same prompt | OK | L1 renamed $N \to N_{\text{atoms}}$ to avoid $\hat N$. There is no $\hat N$ in L3, but keep $N_{\text{atoms}}$ for consistency. |

**Counts:** 4 FLAG rows: $^*$, the operator-space $\vec\sigma$ forward reference, $\hat 1 / \mathbf 1 / I$, and $P(a_i)$ vs $\hat P_i$. Two issues (the unnamed $c_1, c_2$ and the notes' $P_\uparrow$ spelling) were fixed in §1 while drafting.

## 7. Errata

Every numeric item was computed twice, once with a copy of the engine and once with numpy. The book items were checked against the rendered PDF page, not only the OCR.

### Corrections (become `Correction`s or book errata chips)

**E1. Townsend §1.4, Example 1.2, p. 17 (PDF p. 33): the 75 % sits on the wrong outcome.** The example's state is $|\psi\rangle = \tfrac12|{+z}\rangle + \tfrac{i\sqrt3}{2}|{-z}\rangle$. It correctly finds $\langle S_z\rangle = -\tfrac{\hbar}{4}$ and $\Delta S_z = \tfrac{\sqrt3}{4}\hbar \approx 0.43\hbar$. The closing sentence then gives a 75 % probability of obtaining $+\tfrac{\hbar}{2}$. It is 25 %; the 75 % belongs to $-\tfrac{\hbar}{2}$. The book's own line $\langle S_z\rangle = \tfrac14(\tfrac{\hbar}{2}) + \tfrac34(-\tfrac{\hbar}{2})$ already puts the ¾ on $-\tfrac{\hbar}{2}$.
- Evidence: with `psiT = vec(0.5, c(0, Math.sqrt(3)/2))`, `prob(KET['+z'], psiT)` = 0.25 and `prob(KET['-z'], psiT)` = 0.75; `expectation(SZ, psiT)` = −0.25; `Math.sqrt(variance(SZ, psiT))` = 0.4330. numpy gives the same. The printed page was rendered and read (it is not an OCR sign loss).
- Where it shows: `l3-spread:b5` (errata chip). It is also a ready "Spot the error" round (§9).
- Its comparison still stands once fixed: the spread is smaller than $|{+x}\rangle$'s $0.5\hbar$ because one outcome now has ¾ of the weight.

**E2. Notes p. 3, margin: beside $\hat A|\psi\rangle = |\phi\rangle$, the handwritten note says to sketch the operator as a measurement device, a box with an input and an output.** This is a teaching conflict, not an algebra error. Nine pages later, the notes' own boxed warning (p. 12) says measuring $A$ is *not* $|\psi\rangle \to \hat A|\psi\rangle$. Susskind's box (§3.1.1) is Wheeler's *machine*, and his §3.5 warns against exactly this reading.
- Evidence: `apply(SZ, KET['+x'])` = 0.5·`KET['-x']`, a state that `measure(SZ, KET['+x'], u).post` never returns (it returns `KET['+z']` for u < 0.5 and `KET['-z']` otherwise).
- App rule: call $\hat A$ a "machine" or "rule" and never a "measurement device". The lab stage never labels a magnet $\hat A$.

**E3. Notes p. 17, margin, "Principle 4": the letter $a$ does double duty.** The margin names the state $|A\rangle$ but writes the probability as $\langle a|l_1\rangle\langle l_1|a\rangle$, in lower case. On pp. 10–12 of the same notes, $|a_i\rangle$ are the *eigenvectors*, so a reader can take $|a\rangle$ for an eigenvector. Susskind (§3.2) writes the state as $|A\rangle$ throughout.
- Should say: $P(l_1) = \langle A|l_1\rangle\langle l_1|A\rangle = |\langle l_1|A\rangle|^2$.
- Ownership: the four principles are Lecture 4's frame. L3 only cites them (`l3-postulates:b6` refs), so this erratum is handed to the L4 planner.

### Disagreements that are not errors (fidelity or wording notes)

**E4. Hermiticity: postulate or theorem?** The notes' margin Principle 1 (p. 17) builds "Hermitian" into the principle. Susskind's Principle 1 (§3.2) says only "linear operators" and *derives* Hermiticity from the other principles. The rules come out the same either way. The app follows the notes (Hermitian as part of the rule) and adds a one-line books note in `l3-eigen:b6`.

**E5. Townsend §1.4, p. 17: fluctuations "about $\sqrt N$".** For $N = 10^6$ atoms with $p = \tfrac12$, the standard deviation of the up count is $\sqrt{Np(1-p)} = 500$. $\sqrt N = 1000$ is the standard deviation of (up − down). Townsend says "on the order of", so this is loose, not wrong. It matters in the app: `deposit-stats` shows $\sigma_k = \sqrt{Np(1-p)}$, so a caption must not quote "$\sqrt N$" beside it. Evidence: `Math.sqrt(1e6*0.25)` = 500 vs `Math.sqrt(1e6)` = 1000.

**E6. Notes p. 15: $P(+x) = P(-x) = \tfrac12$, then "if the $S_x$ result is $+\tfrac{\hbar}{2}$".** The outcome label switches from a state name to an eigenvalue within a paragraph. The app writes $P(S_x = +\tfrac{\hbar}{2})$ once and then $P(+\tfrac{\hbar}{2})$ with the axis named in the sentence.

**E7. Notes p. 3, margin axiom "commutes with scalars (Mz|A> = z|B>".** This is shorthand for Susskind's eq. 3.2: if $\hat M|A\rangle = |B\rangle$ then $\hat M(z|A\rangle) = z|B\rangle$. As written, "$Mz|A\rangle$" could be read as an operator named $Mz$. The app states the full sentence (`l3-operators:b2`).

**E8. Lecture schedule.** L3's plan puts §7 (variance) in L3. L4's notes say L3 stopped at p. 13. L4's scope line (p. 1) and instructor page (p. 21) move "variance and quantum fluctuations" to the later commutator and uncertainty discussion, which is L7 §7.7. So the L3 variance pages were probably never taught as written. See §11 Q1.

**E9. The concept map vs the notes.** `concepts.ts` puts `projectors` ("Complete eigenbases and projectors") and `expectation` under **L4**. Projectors, completeness (L3 §3) and $\langle A\rangle = \langle\psi|\hat A|\psi\rangle$ (L3 §7) first appear in the **L3** notes; L4 revisits them. See §9 (hooks) and §11 Q2.

### Checked and in agreement (no action)
- Townsend §2.2 pp. 34–35: $R(\tfrac{\pi}{2}\hat{\jmath})|{+z}\rangle = |{+x}\rangle$. Engine: `apply(rotation([0,1,0], Math.PI/2), KET['+z'])` = (0.7071, 0.7071) = `KET['+x']`, with no extra phase.
- Townsend §2.2 pp. 36–37: the eigenvalue of a $z$ rotation on $|{+z}\rangle$ is $e^{-i\phi/2}$. Engine: `inner(KET['+z'], apply(Rz(Math.PI/2), KET['+z']))` = 0.7071 − 0.7071i = $e^{-i\pi/4}$.
- Notes p. 12 update rule = L4 p. 8 = engine `measure` (post-states `KET['±z']` with the phase convention "first component real ≥ 0").
- Notes p. 17 $\Delta S_z = \tfrac{\hbar}{2}$ for $|{+x}\rangle$ and 0 for $|{\uparrow}\rangle$; Townsend p. 16 agrees. Engine: 0.5 and 0.

### Engine hazards found while checking (details in §8)
**E10. `eigenHermitian2` accepts a non-Hermitian matrix and returns wrong eigenvalues.** For $R = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$ it returns [1, −1]; the true eigenvalues are $\pm i$ (numpy `eigvals` → ±1j). It reads only $M_{10}$ and the diagonal, so it assumes $M_{01} = M_{10}^*$. `measure()` calls it, so `measure(R, …)` would report outcomes ±1. L3 is the first lecture that shows a non-Hermitian matrix on purpose (`l3-eigen:b7`), so this guard matters now.

**E11. `expectation` drops the imaginary part.** For $N = \begin{pmatrix}0&1\\0&0\end{pmatrix}$, $\langle{+y}|\hat N|{+y}\rangle = \tfrac{i}{2}$ (numpy agrees), but `expectation(N, KET['+y'])` = 0. For Hermitian operators the value is real and the function is right. It must not be used to show a non-Hermitian sandwich. That is also a good "why Hermitian?" point: only a Hermitian operator guarantees a real average.

## 8. Engine gaps

### 8.1 Physics engine (`app/src/physics/`)

| # | Name and signature | Formula | Needed by | numpy check (`pipeline/make_fixtures.py`) |
|---|---|---|---|---|
| P1 | **Guard in `eigenHermitian2(M)`** (and so in `measure`) | If `!isHermitian(M, 1e-9)`, throw `Error('eigenHermitian2: not Hermitian')`. Today it silently treats any matrix as Hermitian (E10). | Safety for `l3-eigen:b7` and for any authored matrix. | Mutation test: `eigenHermitian2(mat([[0,-1],[1,0]]))` throws. Fixture: random Hermitian matrices still match `np.linalg.eigh` (values descending, vectors up to phase). |
| P2 | `eigen2(M: Mat): { values: C[]; vectors: Vec[] }` in `operators.ts` | $\lambda_\pm = \tfrac{t}{2} \pm \sqrt{\tfrac{t^2}{4} - \det M}$, with $t = \operatorname{tr} M$ and the complex square root (the private `csqrt` already exists there). Eigenvector: $(M_{01},\ \lambda - M_{00})$ if $M_{01} \neq 0$; else $(\lambda - M_{11},\ M_{10})$ if $M_{10} \neq 0$; else the basis vectors. Then `normalize` and `canonicalPhase`. For a defective matrix return one vector and flag it `defective: true`. | `l3-eigen:b7` claims (the eigenvalues of $R$ are $\pm i$); a future non-Hermitian `operator-action` mode. | `np.linalg.eig` on fixtures including $R$ (→ ±1j), $\begin{pmatrix}0&1\\0&0\end{pmatrix}$ (defective, λ = 0 twice), $M$ (3, 1), `Rz(π/2)`. Sort by (re, im); compare vectors by $\lvert\langle u\vert v\rangle\rvert = 1$. |
| P3 | `sandwich(A: Mat, psi: Vec): C` in `spin.ts` | $\langle\psi\vert\hat A\vert\psi\rangle$ = `inner(psi, apply(A, psi))`, complex. Document `expectation` as "Hermitian A only", or make it assert Hermiticity (E11). | `l3-eigen` "why Hermitian" point; the `l3-eig-real` check (imag part 0). | `psi.conj() @ A @ psi` for Hermitian and non-Hermitian fixtures; Hermitian cases have `abs(imag) < 1e-12`. |
| P4 | `collapse(P: Mat, psi: Vec): { p: number; post: Vec \| null }` in `spin.ts` | $p = \langle\psi\vert\hat P\vert\psi\rangle$; `post` = $\hat P\vert\psi\rangle/\sqrt p$ **without** re-phasing (so $\vert{+y}\rangle$ → $i\vert{-z}\rangle$ stays visible); `null` if $p < 10^{-12}$. `measure` can call it. | `l3-projectors:b6`, `l3-postulates:b4`, G2 below; challenge `l3-post-after`. | `(P @ psi) / sqrt(psi.conj() @ P @ psi)`; fixtures: (`Pd`, `KET['+y']`) → (0, 1j), p = 0.5; (`Pu`, p60) → (1, 0), p = 0.25; (`Pu`, `KET['-z']`) → null. |
| P5 | `spreadAlong(n: Axis, m: Axis): number` in `sg.ts`, next to `averageDeflection` | $\Delta\sigma = \sqrt{1 - (\hat n\cdot\hat m)^2}$: the spread of single ±1 readings along $\hat n$ for atoms prepared along $\hat m$. Equals `2*Math.sqrt(variance(spinAlong(n), ketAlong(m)))`. | G3 `spread` readout (`l3-spread:b3–b6`). | Compare with `2*sqrt(var)` from numpy for 50 random (n, m); spot values: (z, +x) → 1, (z, +z) → 0, (120°, +z) → 0.8660. |
| P6 (optional) | `stdDev(A, psi) = Math.sqrt(variance(A, psi))` | — | Claims read cleaner; not required. | Covered by the `variance` fixtures. |

No gap for: matrix elements (`inner(i, apply(A, j))`), completeness (`madd` + `matEq` + `identity`), idempotence (`classify(P).projector`), building an observable (`fromSpectrum`), basis coordinates (`toBasis`), rotations (`rotation`, `Rz`), benches (`benchTheory`).

### 8.2 Stage contracts (`content/stage.ts`, additive, W applies via `interface-changes.md`)

| # | Field | Meaning | Validation / resolver | Fallback today |
|---|---|---|---|---|
| G1 | `HilbertPlaneState.image?: PlaneOp`, where `PlaneOp = { named: 'I' \| 'sx' \| 'sz' \| 'Sz' } \| { matrix: [[string,string],[string,string]] }` | Draw $\hat A\vert\psi\rangle$ as a second arrow with its **true length**; it need not be Hermitian, because $R$ must be allowed. Anchor `image`. | Real entries only (a complex cell is a validation error: the image would leave the plane). The resolver calls `apply`. The plane rescales its extent to max(1, max image length); $M\vert{+x}\rangle$ has length 3. | `others: [{ ket: { planeDeg }, role: 'second', badge }]`, with a claim checking the authored angle. Exact only for unit-length images ($\hat\sigma_x$, $\hat\sigma_z$, $R$). |
| G2 | `HilbertPlaneState.project?: 1 \| 2` and `renormalize?: boolean` | `project` draws $\hat P_i\vert\psi\rangle$ (basis arrow $i$ of the current frame) as a vector of length $\vert c_i\vert$. `renormalize` grows it to length 1: the update rule. Reduced motion: a cut. | The resolver uses P4 `collapse`. `renormalize` requires `project`. | `shadows: true`, then the next beat's `psi` jumps to the basis ket, with a `ghost` of the old state. |
| G3 | `LabReadout 'spread'` | A ±Δσ bracket around the `centroid` tick; Δσ from P5. Anchor `spread`. | Only with `centroid`. It must look different from `sigma-band` (a different glyph and label) because it means something different (§10). | `centroid` only, with the number in the caption. |

To confirm with W (no change expected): `showPrep: true` with `source: '+x'` (L1 only used `'+z'`), and the `centroid` readout for a source that is not `'+z'` (`l3-spread:b1`, m̂ = x̂).

## 9. Hooks

### 9.1 Concept map (`concepts.ts`)
| Concept id | Label today | L3 unit(s) that teach it | Proposed `unit` |
|---|---|---|---|
| `operators` | Linear operators and eigenvectors | `l3-operators`, `l3-eigen` | `l3-operators` |
| `observables` | Hermitian observables | `l3-eigen` (Hermitian), `l3-projectors` (observable = Σ outcome × projector) | `l3-eigen` |
| `born-rule` | Born rule and the state update | `l3-postulates`, `l3-spin-example` | `l3-postulates` |
| `projectors` *(listed under L4)* | Complete eigenbases and projectors | `l3-projectors` teaches projectors and completeness first (L3 §3) | see §11 Q2 |
| `expectation` *(listed under L4)* | Expectation values | `l3-spread` teaches $\langle A\rangle = \langle\psi\vert\hat A\vert\psi\rangle$ and $\Delta A$ first (L3 §7) | see §11 Q2 |

Graph check for the Q2 option "move both to L3": `projectors.needs = ['observables']` (L3) and `expectation.needs = ['born-rule']` (L3). Neither would build on a later lecture, and the L4, L6 and L7 concepts that need them still come later. So `concepts.test.ts` stays green either way.

### 9.2 Arcade: one level per unit (every verdict from the engine; checked while drafting)

| Unit | Game | Level |
|---|---|---|
| `l3-operators` | Spot the error | **"Rows or columns?"** Steps: (1) $\hat B\vert{+z}\rangle = \vert{+z}\rangle + 2\vert{-z}\rangle$. (2) $\hat B\vert{-z}\rangle = 3\vert{-z}\rangle$. (3) *So the first **row** of $B$ is $(1, 2)$.* (4) So $B_{12} = 2$. `wrong: 2`. Why: the images are columns, so column 1 is $(1, 2)$ and $B_{12} = \langle{+z}\vert\hat B\vert{-z}\rangle = 0$, while $B_{21} = 2$. Engine: `inner(KET['+z'], apply(B, KET['-z']))` = 0, `inner(KET['-z'], apply(B, KET['+z']))` = 2. |
| `l3-eigen` | Bloch golf | **"Turning about y does nothing here."** start `'+y'`, target `'-y'`, par 2. Solution `[{axis:'z', sign:1}, {axis:'z', sign:1}]`. Hint: "Try a quarter turn about $y$ first. Why does nothing move?" Why: "$\vert{\pm y}\rangle$ are eigenvectors of every turn about $y$: the turn only multiplies them by a phase. You must turn about another axis." Engine: `samePhysicalState(apply(rotation([0,1,0], ±π/2), KET['+y']), KET['+y'])` = true; no single quarter turn reaches `'-y'`; z, z does. `trains: { lecture: 'L3', unit: 'l3-eigen' }`. (Golf is labelled "ahead of the course" as today; this level needs only "eigenvector = stays put".) |
| `l3-projectors` | Spot the error | **"Completeness with any two states."** Steps: (1) $\hat P_{+z}$ keeps the up part. (2) $\hat P_{+x}$ keeps the $+x$ part. (3) *Together they cover every state, so $\hat P_{+z} + \hat P_{+x} = \hat 1$.* (4) So $P(+z) + P(+x) = 1$ for every state. `wrong: 2`. Why: completeness needs an orthonormal basis; for $\vert{+z}\rangle$ the "sum" is $1 + \tfrac12 = 1.5$. Engine: `prob(KET['+z'],KET['+z']) + prob(KET['+x'],KET['+z'])` = 1.5; `classify(madd(Pu, projector(KET['+x']))).projector` = false. |
| `l3-postulates` | Spot the error | **"The magnet applies $\hat S_z$."** Steps: (1) $\vert{+x}\rangle$ enters an SG$_z$ magnet; keep the + beam. (2) *The magnet measures $S_z$, so the atom leaves in $\hat S_z\vert{+x}\rangle$.* (3) $\hat S_z\vert{+x}\rangle \propto \vert{-x}\rangle$. (4) So a following SG$_x$ sends every atom to −. `wrong: 1`. Why: a measurement leaves $\vert{+z}\rangle$ (here, kept); the next $x$ magnet splits 50/50. Engine: `bT({source:'+x', axes:['z','x'], keep:['+']})` → plus 0.25, minus 0.25. |
| `l3-spin-example` | Route the beam | **"Make the repeat fail."** source `'+x'`; target `{ spot: 'minus', fraction: 1/8, label: '⅛' }`; maxDevices 3; start `{ axes: ['z','z'], keep: ['+'] }` (gives 0); solution `{ axes: ['z','x','z'], keep: ['+','+'] }`. Hint: "Two $z$ magnets in a row always agree. What could go between them?" Why: "An $x$ magnet leaves $\vert{\pm x}\rangle$, which splits 50/50 on the last $z$: ½ × ½ × ½ = ⅛." Engine: start `.minus` = 0; solution `.minus` = 0.125 (keep `['+','-']` also gives 0.125). |
| `l3-spread` | Spot the error | **"Three quarters of what?"** (adapted from a textbook example, credited in `why`). Steps: (1) $\vert\psi\rangle = \tfrac12\vert{+z}\rangle + \tfrac{i\sqrt3}{2}\vert{-z}\rangle$. (2) $\langle S_z\rangle = \tfrac14\cdot\tfrac{\hbar}{2} + \tfrac34\cdot(-\tfrac{\hbar}{2}) = -\tfrac{\hbar}{4}$. (3) $\Delta S_z = \tfrac{\sqrt3}{4}\hbar \approx 0.43\hbar$. (4) *So $+\tfrac{\hbar}{2}$ comes up 75 % of the time.* `wrong: 3`. Why: $\vert\tfrac12\vert^2 = \tfrac14$ for $+\tfrac{\hbar}{2}$; the 75 % is for $-\tfrac{\hbar}{2}$ (Townsend §1.4 p. 17 has this slip, E1). Engine: `prob(KET['+z'], psiT)` = 0.25. |

### 9.3 Coordination with the other lecture planners
- **L2 (in progress, `P-L2-story.md`):** L3 assumes L2 has taught $\vert{\pm y}\rangle = (1, \pm i)/\sqrt2$, the complex conjugate and $\langle a\vert b\rangle = \sum_k a_k^* b_k$. If L2 defines `complex-conjugate`, L3 drops its entry (§4).
- **Overlap with the L4 plan as drafted (`P-L4-story.md`).** That plan reads L3 pp. 14–17 as "never reached in class". It re-teaches the example and the mean in `l4-example` and `l4-average` (with Townsend's Example 1.2 and √N), keeps variance out ("it lives in L7"), and maps `projectors` and `expectation` to L4 units. This plan follows the brief's ownership rule instead: first appearance in the L3 notes means L3. The two plans now **double-cover** $\langle A\rangle = \langle\psi|\hat A|\psi\rangle$, the $|{+x}\rangle$ example and Townsend Ex. 1.2 (with its erratum E1). Resolution options: (a) L3 keeps `l3-spin-example` and `l3-spread`, and L4 links back and teaches only what is new in its notes (its unequal-amplitude state, the matrix-form mean); or (b) L3 ends at `l3-postulates` (p. 13), L4 owns §6–§7, and the variance beats move to L7 §7.7. Either way, Townsend Ex. 1.2 and E1 appear in **one** lecture only. This is §11 Q1–Q2.
- **L4:** owns the four-principles frame, degeneracy and Gram–Schmidt, projectors as yes/no observables, the $S_x$/$S_y$/Pauli construction, the $S_x$ eigenproblem, and the $(\tfrac{\sqrt3}{2}, \tfrac12)$ example. L3 deliberately does not build $\hat S_x$; it uses $\vert{\pm x}\rangle$ as "the states an SG$_x$ magnet leaves" (L1), exactly as the L3 notes do on p. 15. L4's §3 re-derives $\langle A\rangle$, so it should link to `l3-spread` rather than repeat the variance (which L4's own scope defers). Hand-over: erratum E3. L3's running state $\vert\psi_{60}\rangle$ is the mirror of L4's example; L4 may want to point that out.
- **L5:** owns $A' = B^\dagger A B$. L3 shows only that a state's *column* depends on the basis (`l3-operators:b6`).
- **L6:** owns the Bloch sphere; L3 uses no `bloch` stage. **L7:** owns commutators and uncertainty; `l3-spread:b6` only asks the question.

## 10. Fidelity notes

L3 uses three stage kinds: `lab-r3`, `hilbert-plane` and `operator-space`. It is the **first lecture to show `operator-space`**. It uses no `bloch`, `bloch-ball` or `hopf`. The existing items in `fidelity.ts` still apply. Below, each kind lists which existing items L3 leans on and the new items L3 needs (student-facing sentences, ready to paste; ids are new and unique).

### `lab-r3` — "PHYSICAL SPACE ℝ³ · metres"
**Gets right.** The fractions at every stop and spot are exact Born-rule values (`lab-born-fractions`), and the state chips follow Rule 3 at each magnet. That is exactly the L3 spin example, so the lab is the honest home of units 4–6.
**Existing items L3 flags:** `lab-both-paths` on `l3-postulates:b5` and `l3-spin-example:b5`. This is the P2-L1 Q3 promise ("return to it in L3, where measurement is formalized"). `lab-chips-captions` also applies wherever chips change.
**New items:**
- `lab-block-projects` (schematic): "A beam stop acts like a projector followed by rescaling. The atoms it stops carry the lost probability, $1 - \langle\psi|\hat P|\psi\rangle$. Townsend's cleaner version merges both beams again and is not drawn here."
- `lab-merge-not-drawn` (misleading on purpose): "Our magnets always end in separated beams. A device that recombines the two beams without recording the path would not disturb the state at all (Townsend §1.2); the bench cannot show that case."
- `lab-spread-vs-band` (exact, with G3): "The ± bracket is the spread of **single** readings, $\Delta\sigma = \sqrt{1-\langle\sigma\rangle^2}$. The shaded band of Lecture 1 is the spread of the **average** of $N$ readings, $\Delta\sigma/\sqrt N$. Different questions, different widths."
**Distorts.** Still the L1 list: not to scale, glow is not light, and each atom is drawn picking a beam inside the magnet. That last one is exactly what Rule 3 formalizes, so in L3 the `lab-both-paths` note is shown, not merely available.

### `hilbert-plane` — "STATE SPACE · real slice of ℂ²"
**Gets right.** Angles between real states, and squared shadows as probabilities (`plane-angles-true`, `plane-shadow-born`). Projectors are *literally* shadows here, so completeness (two shadows add back to ψ) and idempotence (a shadow's shadow is itself) are exact pictures. For real matrices, the image arrow $\hat A|\psi\rangle$ (G1) is exact too, including its length.
**Existing items:** `plane-real-slice` (L3 uses $|{\pm y}\rangle$ only in words and claims, never on this stage), `plane-sign-twice`, `plane-half-angles` (`l3-operators:b5`).
**New items:**
- `plane-image-not-state` (misleading on purpose, with G1): "The image arrow $\hat A|\psi\rangle$ is a vector, not a state: it can be longer or shorter than 1. Applying an operator is not a measurement; a measurement ends on a basis arrow."
- `plane-update-bookkeeping` (schematic, with G2): "The projected arrow growing back to length 1 is Rule 3's rescaling. It is a step in our description, not a motion the atom makes in time."
- `plane-no-complex-operators` (schematic): "Only operators with real entries can be drawn here. $\hat S_y$ or a complex Hermitian matrix such as $H$ would move real arrows out of the plane, so those live in operator space instead."
**Distorts.** Global sign: $|\psi\rangle$ and $-|\psi\rangle$ are two arrows but one state (`plane-sign-twice`). This matters for $R$ in `l3-eigen:b7`. It turns the plane by 90°, so after two turns $|\psi\rangle$ becomes $-|\psi\rangle$: a new arrow, but the same state.

### `operator-space` — "OPERATOR SPACE · A = a₀I + a⃗·σ⃗"
**Gets right.** Every 2×2 Hermitian matrix is one arrow $\vec a$ plus one number $a_0$ (`op-one-point`). The eigenvalues are exactly $a_0 \pm |\vec a|$ and the eigenvectors are the states along $\pm\hat a$ (`eigenHermitian2`). Adding operators adds arrows and gauges (`op-sum`). That is the $\hat S_z = \tfrac{\hbar}{2}\hat P_{+z} - \tfrac{\hbar}{2}\hat P_{-z}$ picture in `l3-projectors:b4`, where the gauges cancel.
**Existing items:** `op-four-dimensions`, `op-ghost-sphere`, `op-length-not-size`, `op-a0-gauge`.
**New items:**
- `op-hermitian-only` (exact): "Only Hermitian operators have a place in this space. That is why $R$ in the clue, whose eigenvalues are $\pm i$, is shown on the state plane instead."
- `op-projector-point` (exact): "A projector $|a\rangle\langle a|$ is the point with $a_0 = \tfrac12$ and an arrow of length $\tfrac12$ along $a$'s direction. Its eigenvalues are $\tfrac12 \pm \tfrac12$, that is 1 and 0."
- `op-sigma-later` (schematic, for L3 visits): "The label uses $\vec\sigma$, the Pauli matrices, which are built in Lecture 4. Until then, read the arrow's length as half the gap between the two eigenvalues, and the gauge as their midpoint."
**Distorts.** The ghost Bloch sphere around the arrow is borrowed from *state* space. Its two eigen-points look opposite (180° apart), but as states they are orthogonal (90° apart). This is the same half-angle trap as L1 (`op-ghost-sphere`); `l3-eigen:b3` says "orthogonal" and points at it, so the note must be shown there.

Engine evidence for the new exact items: `decomposeHermitian(Pu)` = {a0: 0.5, a: [0, 0, 0.5]} and `eigenHermitian2(Pu).values` = [1, 0] (`op-projector-point`); `decomposeHermitian(R)` = null (`op-hermitian-only`).

## 11. Questions for the user

**Q1. Who owns L3 pp. 14–17 (the $|{+x}\rangle$ example, expectation values, variance)?** The L3 notes contain them. But L4's notes say L3 stopped at p. 13, L4 re-teaches the example and the mean, and L4 p. 21 moves variance to the commutator and uncertainty discussion (L7 §7.7). The L4 planner has already planned that material into L4 (§9.3).
*Options:* (a) as planned here, L3 keeps `l3-spin-example` and `l3-spread` with a "taught at the start of Lecture 4" badge, and L4 links back; or (b) L3 stops at `l3-postulates`, L4 owns the example and the mean, and the variance beats move to L7.
*Recommendation:* (a). It follows the ownership rule this plan was briefed with (first appearance in a lecture's notes decides), so each lecture page matches its own notes. Then L4 drops its re-teaching of the mean, links to `l3-spread`, and keeps its own unequal-amplitude example, and L7 §7.7 links back to `l3-spread` for $\Delta A$. Choose (b) if you would rather each page match what was said in the room. `l3-spin-example` and `l3-spread` then move almost unchanged. Either way, one lecture must drop its copy.

**Q2. Concept map ownership of `projectors` and `expectation`.** Both are listed under L4 in `concepts.ts`, but they first appear in the L3 notes (§3 and §7). L4 revisits them, adding degeneracy, projectors as yes/no questions and the Pauli-matrix examples.
*Recommendation:* move both concepts to L3, with units `l3-projectors` and `l3-spread`, and let L4's units link back. The graph test stays green (§9.1).

**Q3. `operator-space` in L3 before the Pauli matrices exist.** Its fixed passport reads $A = a_0I + \vec a\cdot\vec\sigma$, and $\vec\sigma$ is built only in L4. L3 needs this stage for the complex Hermitian example $H$ and for $\hat S_z = \tfrac{\hbar}{2}\hat P_{+z} - \tfrac{\hbar}{2}\hat P_{-z}$ (arrows add, gauges cancel).
*Recommendation:* keep it in L3 with the `op-sigma-later` note (§10) and the captions that read the arrow as "half the eigenvalue gap". The alternative is to drop those beats to the `hilbert-plane`, which cannot show complex matrices.

**Q4. Approve the stage additions G1–G3 (§8.2)?** G1 draws $\hat A|\psi\rangle$ on the plane, G2 draws projection and rescaling, and G3 adds a single-reading spread bracket in the lab.
*Recommendation:* G1 and G2 are worth it. They carry the lecture's central warning (applying ≠ measuring) and Rule 3 as pictures, and every fallback is weaker. G3 is optional, since the caption can carry the number.

**Q5. Naming a textbook's slip in the app.** E1 (Townsend Example 1.2) is a real error in a published book. L1's errata box so far only corrected the course notes.
*Recommendation:* show it as a small, respectful "book erratum" chip on `l3-spread:b5` and use it as a Spot-the-error round, credited to the book. Say if you would rather keep book errata out of the app and only avoid repeating them.
