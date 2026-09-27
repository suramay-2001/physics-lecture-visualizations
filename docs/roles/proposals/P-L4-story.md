# P-L4 — Lecture 4 story plan (role P)

Proposal only. Nothing under `app/` is modified. Template: `P2-L1-story.md`; stage fields from `app/src/content/stage.ts`
and `stageVocab.ts` (shots, anchors) as of `a3c16b4`.

**Scope rule used (orchestrator ruling, 2026-09-27).** A concept is introduced once, in the first lecture whose notes teach
it. L3's plan keeps all of L3's notes, including pp. 14–17 (the $|{+x}\rangle$ example, $\langle A\rangle = \sum_i a_i P(a_i)$ with
$\langle\psi|\hat A|\psi\rangle$, and the spread), badged "taught at the start of Lecture 4". So L3 owns operators, Hermitian,
eigen-language, projectors, $\sum_i|a_i\rangle\langle a_i| = 1$, $\hat A = \sum a_i\hat P_i$, the Born rule, the update rule, the
expectation value and the variance. In L4:
- `l4-basis:b1` is the one recap beat (links to L3, defines nothing).
- `l4-projectors` and `l4-average` are **second passes**: their first beat links back to `l3-projectors` / `l3-spread` in one
  sentence; the other beats teach only what L4's notes add ($\hat P^2 = \hat P$ and $\hat P_+\hat P_- = 0$ as filter chains,
  completeness in operator form, the projector as a yes/no observable, L4's own $\tfrac{\sqrt3}{2}, \tfrac12$ example with the
  p. 10 erratum, the sandwich in matrix form, the $\sqrt N$ scatter if L3 has not used it).
- The $|{+x}\rangle$ example, the definition of $\langle A\rangle$, the derivation of $\langle A\rangle = \langle\psi|\hat A|\psi\rangle$ and the
  variance are **not** re-taught. Townsend §1.4 Example 1.2 (and its 75 %/25 % slip) belongs to L3; L4 does not re-work it.

**The same pattern at L4's other end.** L5 p. 2 says it picks up where the class left off, with the construction of
$\hat S_y$: in class, L4 stopped after $S_x$ (L4 p. 14). L5 then repeats L4 pp. 15–19 ($S_y$, the Pauli matrices,
Hermiticity, the $S_x$ eigenvalue problem). By the same rule all of that belongs to L4, so this plan teaches it
and **the L5 planner should treat it as a second pass** (one link-back beat). Two homework items touch this lecture and are guarded: the proof that
Hermitian eigenvalues are real (L3 p. 5, handwritten) and the $S_y$ eigenvalue problem (L5 p. 1).

**Conventions.**
- Beat id `<unit>:b<n>`; phase **[L]** lecture says, **[B]** books add, **[C]** clue (click-to-reveal). Order L → B → C.
- ħ = 1 in every engine call; the prose shows ħ. `psi` below always means the unit-3 state
  `vec(Math.sqrt(3)/2, 0.5)` = `ketFromBloch(Math.PI/3, 0)` = $\tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$.
- `bT(...)` abbreviates `benchTheory(...)` (`sg.ts`, axis numbers are degrees). `P(k)` abbreviates `projector(KET[k])`.
- `prep60` = the bench prefix `{ axis: { tiltDeg: 60 }, keep: '+' }` fed by `'oven'`: its kept atoms are exactly `psi`
  (`ketAlong(tiltXZ(Math.PI/3))` = (0.8660, 0.5000)). It is a stage device only; see §10 and Q1.
- Every number below was re-computed with an independent numpy script while drafting (values in §1 claims). Each claim
  names the engine function that must produce it; they become `Claim`s in `L4.values.ts` plus fixtures in
  `pipeline/make_fixtures.py`.

## 0. Lecture map

| # | Unit id | Title (≤ 8 words) | Question | Notes pages | Book refs |
|---|---|---|---|---|---|
| 1 | `l4-basis` | Four principles and a complete basis | What must an observable's eigenstates do so that every state can be measured? | pp. 1–5 | Susskind §3.1.5 (fundamental theorem), §3.1.6 (Gram–Schmidt), §3.2 (the four principles; printed pp. 69–74 per L4 p. 21) · Townsend §2.3 pp. 41–43 (completeness relation, eq. 2.48), §2.8 pp. 67–68 (real eigenvalues, orthogonal eigenstates, eq. 2.131–2.138) |
| 2 | `l4-projectors` (second pass of `l3-projectors`) | A projector asks a yes/no question | What does one projector measure, and how does it fit into the full measurement? | pp. 6–7, p. 21 | Townsend §2.3 pp. 42–44 (P± as a magnet with one path blocked, eigenvalues 1 and 0, $P^2 = P$, $P_+P_- = 0$, Fig. 2.5), §2.4 p. 48 (matrix of P+, eq. 2.67) · Susskind §3.2 Principle 4 |
| 3 | `l4-example` | One state, the whole prediction | For a state with unequal amplitudes, which results occur, how often, and what is left? | pp. 8–9 | Townsend §2.4 p. 48 (the matrix of $\hat P_+$ acting on columns, eq. 2.67–2.69) · Susskind §3.2 Principle 4 |
| 4 | `l4-average` (second pass of `l3-spread`) | The average that no atom reads | What is the mean $S_z$ reading for L4's state, and how does the sandwich give it in matrix form? | pp. 10–12 | Townsend §2.6 p. 58 ($\langle\psi|\hat S_z|\psi\rangle$ as row × matrix × column, eq. 2.105, in any basis), §1.4 pp. 16–17 (the $\sqrt N$ scatter only; Example 1.2 is L3's) · Susskind §3.5 (measuring is not applying $\hat A$; printed pp. 80–82 per L4 p. 21), §4.7 (what $\hat A|\psi\rangle$ is for) |
| 5 | `l4-matrices` | Spin matrices built from their outcomes | Given the definite states and their values, which matrix must each spin component be? | pp. 13–16 | Susskind §3.4 (printed pp. 75–80 per L4 p. 21) · Townsend §2.4 pp. 46–50 (matrix elements $A_{ij}$, $J_z$ matrix eq. 2.70, adjoint = transpose conjugate eq. 2.80), §2.5 Example 2.5 p. 57 + §2.6 Example 2.6 p. 59 ($\hat S_z$ written in the $x$ basis), §3.6 pp. 94–96 ($S_x, S_y$ via $S_\pm$; Pauli matrices) |
| 6 | `l4-eigen` | From a matrix back to outcomes | Given only the matrix, how do we recover the possible results and the definite states? | pp. 16–19, p. 20 | Susskind §3.7 (the eigenvalue problem for a tilted $\sigma_n$, Exercise 3.3; beyond the lecture) · Townsend §2.8 p. 67 (Hermitian ⇒ real eigenvalues), §3.6 p. 94 (the spin-½ eigenvalue problem; pp. 97+ not ingested) |

Susskind's epub has no page numbers; printed pages above are the ones L4 p. 21 itself gives. Townsend pages are printed
pages (PDF − 16).

Concept ids (`concepts.ts`, per the ruling): `projectors` → `l3-projectors` and `expectation` → `l3-spread` are L3's; L4
lists them in `needs`. L4 owns `spin-matrices` (`l4-matrices`) and, by the same first-appearance rule, `eigen-problem`
(`l4-eigen`; `concepts.ts` has it in L5 today). A new L4 concept for units 1–3 is proposed in §9.

## 1. Story beats per unit

Builders used below (same as `L1.story.ts`): `lab(bench, extra)`, `main(source, devices, showPrep?)`, `plane({...})`
(adds `kind: 'hilbert-plane', shot: 'H-FLAT'`), `Z = {axis:'z'}`, `X = {axis:'x'}`, `Zkeep = {axis:'z', keep:'+'}`,
`sweep(from, to)`. `showPrep` is used only with source `'+z'`: the prep module is drawn as an untilted $z$ magnet
(`scenes/lab/layout.ts`), so for `'+x'` or `'-z'` sources it would show the wrong preparation (§8, stage gap S1).
Numbers in claims are engine outputs (ħ = 1); 4-decimal values were matched against numpy.

### Unit `l4-basis` — Four principles and a complete basis

**`l4-basis:b1` [L] — the one recap beat (links to L3; defines nothing)**
- Text: "Lecture 3 answered three questions about measuring an observable $A$ with a [[hermitian|Hermitian]] operator $\hat A$. The results are its [[eigenvalue|eigenvalues]] $a_i$; result $a_i$ has probability $|\langle a_i|\psi\rangle|^2$ and leaves the state $|a_i\rangle$. This lecture turns those answers into principles and asks what the eigenstates must do."
- Stage: `lab-r3` — `lab(main('+x', [Z]), { readouts: ['fill-bar'], shot: 'L-PLATE' })`.
- Caption: "Lecture 3's example, as a reminder: $|{+x}\rangle$ into an $S_z$ magnet gives $\pm\tfrac{\hbar}{2}$, half each".
- Link: "Back to Lecture 3" chip → the L3 postulates unit (id from P-L3).
- Claims: `bT({source:'+x', axes:['z'], keep:[]})` → plus **0.5**, minus **0.5**.

**`l4-basis:b2` [L]**
- Text: "Susskind lists four principles: observables are operators (1), results are eigenvalues (2), [[distinguishable]] states are orthogonal (3), and the Born rule gives the odds (4). Lecture 3's update rule stays beside them. Susskind's own fifth principle is about time, not measurement."
- Stage: `lab-r3` — `lab(main('+z', [Z], true), { readouts: ['fill-bar'], shot: 'L-PLATE' })`.
- Caption: "Principle 2 in the lab: the eigenstate $|{+z}\rangle$ reads $+\tfrac{\hbar}{2}$ every time".
- Claims: `bT({source:'+z', axes:['z'], keep:[]}).plus` = **1**.
- Refs: Susskind §3.2 (printed pp. 69–74 per L4 p. 21). Susskind numbers the time principle in his Lecture 4 (the notes' "Chapter 4" is an erratum, §7 E2).

**`l4-basis:b3` [L]**
- Text: "Principle 3 in numbers: $\langle{+z}|{-z}\rangle = 0$, and an $S_z$ magnet never confuses these two states. But $\langle{+z}|{+x}\rangle = 1/\sqrt2$, so no single measurement can always tell $|{+z}\rangle$ from $|{+x}\rangle$. They are different states that overlap."
- Stage: `hilbert-plane` — `plane({ psi: '+x', others: [{ ket: '-z', role: 'second' }], basis: 'z', rightAngle: true, arc: true })`.
- Caption: "right angle: always told apart · 45° in state space: overlap $1/\sqrt2$".
- Terms: `\langle{+z}|{-z}\rangle = 0` → `right-angle` · `1/\sqrt2` → `angle-arc`.
- Claims: `inner(KET['+z'], KET['-z'])` = **0** · `inner(KET['+z'], KET['+x']).re` = **0.7071** · `prob(KET['+z'], KET['+x'])` = **0.5** (a + reading does not prove $|{+z}\rangle$).

**`l4-basis:b4` [L]**
- Text: "The eigenvectors of a Hermitian operator can always be chosen orthonormal, $\langle a_i|a_j\rangle = \delta_{ij}$, where $\delta_{ij}$ is 1 when $i = j$ and 0 otherwise. They are also complete: every state is a sum $|\psi\rangle = \sum_i c_i|a_i\rangle$ with numbers $c_i$. Orthonormal says the basis states do not overlap; complete says no state is left out."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: sweep(0, 90) }, basis: 'z', shadows: true, rightAngle: true })`.
- Caption: "every arrow splits into a $|{+z}\rangle$ part and a $|{-z}\rangle$ part; the two bars always total 1".
- Claims: for `planeDeg` ∈ {0, 30, 60, 90}, `prob(KET['+z'], v) + prob(KET['-z'], v)` = **1** with `v = vec(cos, sin)`.

**`l4-basis:b5` [L]**
- Text: "With Lecture 3's [[projector|projectors]] $\hat P_i$, completeness takes operator form: $\sum_i \hat P_i = I$, the identity. On any state the projectors hand back every component, $\sum_i |a_i\rangle\langle a_i|\psi\rangle = |\psi\rangle$. The same holds in any orthonormal basis, for example the $x$ basis."
- Stage: `hilbert-plane` — `plane({ psi: '+z', basis: 'x', shadows: true })`.
- Caption: "even $|{+z}\rangle$ splits into an $x$ part and a $-x$ part, and the two add back to it".
- Claims: `matEq(madd(P('+z'), P('-z')), identity(2))` · `matEq(madd(P('+x'), P('-x')), identity(2))` · `prob(KET['+x'], KET['+z'])` = `prob(KET['-x'], KET['+z'])` = **0.5**.

**`l4-basis:b6` [B]**
- Text: "Susskind calls this the fundamental theorem (§3.1.5): a Hermitian operator has an orthonormal basis of eigenvectors. Eigenvectors with different eigenvalues are orthogonal automatically, and both books prove it in a few lines (Townsend §2.8, p. 67). That the eigenvalues are real is a Lecture 3 homework proof, so here it is only stated."
- Homework guard: L3 p. 5 (handwritten note on the sheet) assigns the real-eigenvalue proof. The beat names the theorem and where it is proved but shows no step; the one-line identity both books use would give the homework away.
- Stage: `hilbert-plane` — `plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }], basis: 'x', rightAngle: true })`.
- Caption: "$\hat S_x$: eigenvalues $+\tfrac{\hbar}{2} \ne -\tfrac{\hbar}{2}$, so $|{+x}\rangle \perp |{-x}\rangle$".
- Claims: `eigenHermitian2(SX).values` = **[0.5, −0.5]** · `inner(KET['+x'], KET['-x'])` = **0**.
- Refs: Susskind §3.1.5; Townsend §2.8 p. 67 (eq. 2.131–2.133).

**`l4-basis:b7` [C]**
- Question: "An $S_z$ measurement has only two basis states, $|{+z}\rangle$ and $|{-z}\rangle$. Is $|{+x}\rangle$, which is neither, left out of that measurement?"
- Stage: `hilbert-plane` — `plane({ psi: '+x', basis: 'z' })`.
- Reveal text: "No: $|{+x}\rangle = \tfrac{1}{\sqrt2}|{+z}\rangle + \tfrac{1}{\sqrt2}|{-z}\rangle$ is a sum over that basis, so it lies fully inside it. Completeness only asks that every input can be written in the basis, not that it be a basis state. Here the squared coefficients ½ and ½ use up all the probability."
- Reveal stage: `plane({ psi: '+x', basis: 'z', shadows: true, ticks: true })`.
- Reveal claims: `inner(KET['+z'], KET['+x']).re` = `inner(KET['-z'], KET['+x']).re` = **0.7071** · sum of `prob` = **1**.

**`l4-basis:b8` [C]**
- Question: "The identity $I$ has the eigenvalue 1 twice. Both $|v_1\rangle = \binom10$ and $|v_2\rangle = \tfrac{1}{\sqrt2}\binom11$ satisfy $I|v\rangle = 1\,|v\rangle$. Do they form an orthonormal eigenbasis?"
- Stage: `hilbert-plane` — `plane({ psi: '+x', others: [{ ket: '+z', role: 'second', badge: '|v₁⟩' }], arc: true })` (ψ is $|v_2\rangle$).
- Reveal text: "No: $\langle v_1|v_2\rangle = 1/\sqrt2 \ne 0$. When an eigenvalue repeats, every mix of its eigenvectors is again an eigenvector, so we may choose. Gram–Schmidt chooses: keep $|e_1\rangle = |v_1\rangle$, subtract $|e_1\rangle\langle e_1|v_2\rangle$ from $|v_2\rangle$ to get $|w_2\rangle = \tfrac{1}{\sqrt2}\binom01$, then rescale it to $|e_2\rangle = \binom01$."
- Reveal stage: `plane({ psi: '+x', basis: 'z', shadows: true, others: [{ ket: '-z', role: 'second', badge: '|e₂⟩' }], rightAngle: true })`.
- Reveal claims: `inner(KET['+z'], KET['+x']).re` = **0.7071** · `gramSchmidt([KET['+z'], KET['+x']])`: `steps[1].residual` = **(0, 0.7071)**, `norm(steps[1].residual)` = **0.7071**, `basis[1]` = **(0, 1)** · `eigenHermitian2(identity(2))` = values **[1, 1]** (degenerate branch returns $|{\pm z}\rangle$, the Gram–Schmidt answer).
- Note: the notes promise a 3×3 Gram–Schmidt problem as homework (p. 5). It is not reproduced; see §3.

### Unit `l4-projectors` — A projector asks a yes/no question

**`l4-projectors:b1` [L] — second-pass link to `l3-projectors` (defines nothing)**
- Text: "Lecture 3 built the [[projector]] $\hat P_{+z}$, which keeps the up part of a state and deletes the rest. This unit asks what happens when we measure $\hat P_{+z}$ itself, and how one projector fits into a full measurement."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: 60 }, basis: 'z', shadows: true })`.
- Caption: "Lecture 3's picture: $\hat P_{+z}|\psi\rangle$ is the shadow on the $|{+z}\rangle$ axis".
- Link: "Back to Lecture 3" chip → `l3-projectors`.
- Terms: `\hat P_{+z}|\psi\rangle` → `shadow-1`.
- Claims: `apply(P('+z'), vec(0.5, 0.8660))` = **(0.5, 0)** (the drawn shadow).

**`l4-projectors:b2` [L]**
- Text: "$\hat P_{+z}$ is Hermitian, so it too has a complete eigenbasis once we count the state it sends to zero: $\hat P_{+z}|{+z}\rangle = 1\,|{+z}\rangle$ and $\hat P_{+z}|{-z}\rangle = 0\,|{-z}\rangle$. Everything it outputs lies on the up line; that line is its range. Its eigenbasis still spans both directions, which is a different statement."
- Stage: `hilbert-plane` — `plane({ psi: '-z', others: [{ ket: '+z', role: 'basis' }], basis: 'z', shadows: true })`.
- Caption: "eigenvalue 1: $|{+z}\rangle$ · eigenvalue 0: $|{-z}\rangle$, whose shadow on the up axis is zero".
- Claims: `eigenHermitian2(P('+z'))` → values **[1, 0]**, vectors **[|+z⟩, |−z⟩]** · `norm(apply(P('+z'), KET['-z']))` = **0**.

**`l4-projectors:b3` [L]**
- Text: "Measuring $\hat P_{+z}$ asks one question: is the spin up along $z$? 'Yes' has the value 1 and the projector $\hat P_{+z}$; 'no' has the value 0 and the projector $\hat P_{-z} = I - \hat P_{+z}$. A 'no' leaves the atom in $|{-z}\rangle$, a real state, never in the zero vector."
- Stage: `lab-r3` — `lab(main('+x', [{ axis: 'z', keep: '+', openOther: true }, Z]), { readouts: ['fractions'], shot: 'L-WIDE' })`.
- Caption: "yes (1): half go on in $|{+z}\rangle$ · no (0): half land on their own plate in $|{-z}\rangle$".
- Claims: `expectation(P('+z'), KET['+x'])` = **0.5** (= P(yes)) · `bT({source:'+x', axes:['z','z'], keep:['+']}).blocked[0]` = **0.5** · `matEq(msub(identity(2), P('+z')), P('-z'))`.

**`l4-projectors:b4` [L]**
- Text: "Keep three objects apart. One selected projector $\hat P_i$ isolates one outcome, and $\langle\psi|\hat P_i|\psi\rangle$ is that outcome's share of the probability. The complete family sums to $I$, which is why the shares add to 1, and the observable $\hat A = \sum_i a_i\hat P_i$ attaches a result $a_i$ to each outcome."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: sweep(0, 90) }, basis: 'z', shadows: true })`.
- Caption: "one bar = one branch's share · both bars = 1 · the labels $\pm\tfrac{\hbar}{2}$ = the observable".
- Claims: at 60°: `expectation(P('+z'), v)` = **0.25**, `expectation(P('-z'), v)` = **0.75**, sum **1** · `matEq(fromSpectrum([0.5, -0.5], [KET['+z'], KET['-z']]), SZ)`.

**`l4-projectors:b5` [B]**
- Text: "Townsend builds $\hat P_+$, his name for $\hat P_{+z}$, in the lab: a $z$ magnet with its down path blocked (§2.3, pp. 42–43). Every $|{+z}\rangle$ atom passes, which is eigenvalue 1, and no $|{-z}\rangle$ atom does, which is eigenvalue 0. A second identical filter stops nothing more, $\hat P_+^2 = \hat P_+$, while an opposite one stops everything, $\hat P_+\hat P_- = 0$ (p. 44)."
- Stage: `lab-r3` — `lab(main('+x', [Zkeep, Zkeep, Z]), { readouts: ['fractions', 'blocked'], shot: 'L-WIDE' })`.
- Caption: "filter, then the same filter again: the second stop catches no atoms".
- Claims: `bT({source:'+x', axes:['z','z','z'], keep:['+','+']})` → blocked **[0.5, 0]**, plus **0.5**, minus **0** · `matEq(matmul(P('+z'), P('+z')), P('+z'))` · `matmul(P('+z'), P('-z'))` = **0**.
- Refs: Townsend §2.3 pp. 42–44 (Fig. 2.4b–c, Fig. 2.5, eq. 2.49–2.52).

**`l4-projectors:b6` [C]** (our example; the rule is from L4 pp. 6 and 21)
- Question: "The matrix $Q = \begin{pmatrix}1&1\\0&0\end{pmatrix}$ also satisfies $Q^2 = Q$. Could $Q$ stand for a yes/no measurement?"
- Stage: `hilbert-plane` — `plane({ psi: '+z', basis: 'z' })`.
- Reveal text: "No. $Q$ is not Hermitian, and its 'yes' state $\binom10$ and its 'no' state $\tfrac{1}{\sqrt2}\binom{1}{-1}$ overlap by $1/\sqrt2$. Outcomes of one measurement must be perfectly distinguishable, hence orthogonal (Principle 3), so a measurement projector needs both $\hat P^2 = \hat P$ and $\hat P^\dagger = \hat P$."
- Reveal stage: `plane({ psi: '-x', others: [{ ket: '+z', role: 'second', badge: 'Q keeps this' }], arc: true })` (the arc reads 45°, not 90°).
- Reveal claims: `matEq(matmul(Q, Q), Q)` · `isHermitian(Q)` = **false** · `classify(Q).projector` = **false** while `classify(P('+z')).projector` = **true** · `apply(Q, KET['+z'])` = (1, 0) · `norm(apply(Q, KET['-x']))` = **0** · `inner(KET['+z'], KET['-x']).re` = **0.7071**.

**`l4-projectors:b7` [C]**
- Question: "An atom in $|{-z}\rangle$ is asked 'up along $z$?'. The update rule $\hat P_{+z}|\psi\rangle/\sqrt{p}$, with $p$ the probability of 'yes', would give $0/0$. Which state is it in afterwards?"
- Stage: `lab-r3` — `lab(main('-z', [{ axis: 'z', keep: '+', openOther: true }, Z]), { readouts: ['fractions'], shot: 'L-WIDE' })`.
- Reveal text: "The rule is only for outcomes with $p > 0$. Here 'yes' has probability $|\langle{+z}|{-z}\rangle|^2 = 0$, so it never happens: the answer is 'no' every time and the atom stays in $|{-z}\rangle$. The zero vector $\hat P_{+z}|{-z}\rangle = 0$ is not a state at all, since it has no length to rescale."
- Reveal stage: unchanged (caption: "every atom takes the 'no' plate").
- Reveal claims: `prob(KET['+z'], KET['-z'])` = **0** · `bT({source:'-z', axes:['z','z'], keep:['+']}).blocked[0]` = **1** · `norm(apply(P('+z'), KET['-z']))` = **0**.

### Unit `l4-example` — One state, the whole prediction

**`l4-example:b1` [L]**
- Text: "Prepare $|\psi\rangle = \tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$ and measure $S_z$. It is normalized: $\langle\psi|\psi\rangle = \tfrac34 + \tfrac14 = 1$. The possible results are the eigenvalues of $\hat S_z$, $+\tfrac{\hbar}{2}$ and $-\tfrac{\hbar}{2}$, and nothing else."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: 30 }, basis: 'z' })`.
- Caption: "$|\psi\rangle$ sits 30° from $|{+z}\rangle$ in state space".
- Claims: `norm(psi)` = **1** · `vec(Math.cos(Math.PI/6), Math.sin(Math.PI/6))` equals `psi` (the drawn arrow is the state) · `eigenHermitian2(SZ).values` = **[0.5, −0.5]**.

**`l4-example:b2` [L]**
- Text: "Orthogonality reads off each amplitude: $\langle{+z}|\psi\rangle = \tfrac{\sqrt3}{2}$, since the $|{-z}\rangle$ term has no overlap with $|{+z}\rangle$, and likewise $\langle{-z}|\psi\rangle = \tfrac12$. Squaring gives $P(+\tfrac{\hbar}{2}) = \tfrac34$ and $P(-\tfrac{\hbar}{2}) = \tfrac14$. They add to 1 because $\hat P_{+z} + \hat P_{-z} = I$."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: 30 }, basis: 'z', shadows: true })`.
- Caption: "shadows $\tfrac{\sqrt3}{2}$ and $\tfrac12$ · bars 0.75 and 0.25".
- Claims: `inner(KET['+z'], psi).re` = **0.8660** · `inner(KET['-z'], psi).re` = **0.5** · `prob(KET['+z'], psi)` = **0.75** · `prob(KET['-z'], psi)` = **0.25**.

**`l4-example:b3` [L]**
- Text: "Suppose $+\tfrac{\hbar}{2}$ is found. The state becomes $\hat P_{+z}|\psi\rangle/\sqrt{3/4} = \big(\tfrac{\sqrt3}{2}|{+z}\rangle\big)/\tfrac{\sqrt3}{2} = |{+z}\rangle$. After $-\tfrac{\hbar}{2}$ it becomes $|{-z}\rangle$ in the same way."
- Stage: `hilbert-plane` — `plane({ psi: '+z', others: [{ ket: { planeDeg: 30 }, role: 'ghost', badge: 'before' }], basis: 'z' })`.
- Caption: "after $+\tfrac{\hbar}{2}$ the arrow is $|{+z}\rangle$; the ghost is the state before".
- Claims: `normalize(apply(P('+z'), psi))` equals `KET['+z']` · `normalize(apply(P('-z'), psi))` equals `KET['-z']`.

**`l4-example:b4` [L]**
- Text: "Measure $S_z$ again at once: $+\tfrac{\hbar}{2}$ now has probability 1, because the input is $|{+z}\rangle$. Keep four things apart: the amplitude $\tfrac{\sqrt3}{2}$, the probability $\tfrac34$, the result $+\tfrac{\hbar}{2}$, and the state afterwards, $|{+z}\rangle$."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: 30 }, basis: 'z', shadows: true })`.
- Caption: "amplitude = shadow · probability = bar · result = label · state after = axis arrow".
- Terms: amplitude → `shadow-1` · probability → `bar-1` · state → `basis-1`.
- Claims: `prob(KET['+z'], KET['+z'])` = **1** · the amplitude **0.8660** ≠ the probability **0.75**.

**`l4-example:b5` [B]**
- Text: "Townsend writes projectors as matrices (§2.4, p. 48): in the $z$ basis $\hat P_+$ is $\begin{pmatrix}1&0\\0&0\end{pmatrix}$. The update is then one matrix product, $\begin{pmatrix}1&0\\0&0\end{pmatrix}\binom{\sqrt3/2}{1/2} = \binom{\sqrt3/2}{0}$, followed by dividing by $\sqrt{3/4}$. What is left is the column $\binom10$, which is $|{+z}\rangle$."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: 30 }, basis: 'z', shadows: true })`.
- Caption: "the matrix keeps the first entry and zeroes the second: the shadow on $|{+z}\rangle$".
- Terms: `\binom{\sqrt3/2}{0}` → `shadow-1`.
- Claims: `P('+z')` = **[[1,0],[0,0]]** · `apply(P('+z'), psi)` = **(0.8660, 0)** · `vscale(apply(P('+z'), psi), 1/Math.sqrt(0.75))` = **(1, 0)**.
- Refs: Townsend §2.4 p. 48 (eq. 2.67, 2.69). (Townsend's Examples 1.1–1.2 use a mirror of this state; they are L3's, not re-worked here.)

**`l4-example:b6` [C]** — `beyondLecture` (tilted magnets are deferred by L4 p. 1; this is a Lecture 1 callback)
- Question: "The notes never say how a lab would make this $|\psi\rangle$. Can a Stern–Gerlach magnet do it?"
- Stage: `lab-r3` — `lab(main('oven', [Z]), { deposit: 'clear', shot: 'L-EST' })`.
- Reveal text: "Yes: keep the + beam of a magnet tilted 60° from $z$ toward $x$. Lecture 1 found that magnet's + state, $\cos 30^\circ|{+z}\rangle + \sin 30^\circ|{-z}\rangle$, which is exactly $|\psi\rangle$. A $z$ magnet after it splits the kept atoms 3 : 1, the split that Lecture 1's notes had wrongly put at 45°."
- Reveal stage: `lab(main('oven', [{ axis: { tiltDeg: 60 }, keep: '+' }, Z]), { readouts: ['fractions', 'fill-bar'], shot: 'L-WIDE' })`.
- Reveal claims: `ketAlong(tiltXZ(Math.PI/3))` = **(0.8660, 0.5)** equals `psi` · `bT({source:'oven', axes:[60,'z'], keep:['+']})` → blocked **[0.5]**, plus **0.375**, minus **0.125** · fill bar (plus / landed) = **0.75**.

**`l4-example:b7` [C]** — `beyondLecture` (mixtures: L1 teaser, full treatment L6)
- Question: "Is $|\psi\rangle$ just a beam in which three quarters of the atoms are $|{+z}\rangle$ and one quarter are $|{-z}\rangle$? Along $z$, both give 3 : 1."
- Stage: `bloch-ball` — `{ kind: 'bloch-ball', point: { thetaDeg: 60, phiDeg: 0 }, compare: { mix: [{ of: '+z', w: 0.75 }, { of: '-z', w: 0.25 }] }, measure: 'z', shot: 'B-STD' }`.
- Reveal text: "No: measured along $x$, $|\psi\rangle$ gives $+\tfrac{\hbar}{2}$ about 93 % of the time, while the three-to-one beam gives 50 %. In $|\psi\rangle$ the two parts add as amplitudes; the mixed beam only adds probabilities. Unit 6 computes the 93 %."
- Reveal stage: same with `measure: 'x', recipe: true`.
- Reveal claims: `prob(KET['+x'], psi)` = **0.9330** · `0.75*prob(KET['+x'], KET['+z']) + 0.25*prob(KET['+x'], KET['-z'])` = **0.5** · `blochVector(psi)` = **(0.8660, 0, 0.5)** · `blochOfMixture([{w:0.75, r:[0,0,1]}, {w:0.25, r:[0,0,-1]}])` = **(0, 0, 0.5)** · `pPlus(r, [0,0,1])` = **0.75** for both.

### Unit `l4-average` — The average that no atom reads (second pass of `l3-spread`)

`prep60` benches below: `main('oven', [{ axis: { tiltDeg: 60 }, keep: '+' }, …])`, introduced in `l4-example:b6`.
Not re-taught here (L3 owns them): the definition $\langle A\rangle = \sum_i a_i P(a_i)$, the derivation of
$\langle A\rangle = \langle\psi|\hat A|\psi\rangle$, the $|{+x}\rangle$ example, and the variance.

**`l4-average:b1` [L] — second-pass link to `l3-spread` (defines nothing)**
- Text: "Lecture 3 defined the [[expectation|expectation value]] $\langle A\rangle$, the mean reading over many freshly prepared atoms. Here we apply it to this lecture's state, prepared and measured many times."
- Stage: `lab-r3` — `lab(main('oven', [prep60, Z]), { readouts: ['fractions'], shot: 'L-PLATE' })`.
- Caption: "atoms leaving the 60° magnet are in $|\psi\rangle$; the plate fills 3 : 1".
- Link: "Back to Lecture 3" chip → `l3-spread`.
- Claims: `bT({source:'oven', axes:[60,'z'], keep:['+']})` → plus **0.375**, minus **0.125** (ratio **3**).

**`l4-average:b2` [L]**
- Text: "For our state, $\langle S_z\rangle = (+\tfrac{\hbar}{2})\tfrac34 + (-\tfrac{\hbar}{2})\tfrac14 = \tfrac{\hbar}{4}$. No atom ever reads $\tfrac{\hbar}{4}$: each reads $+\tfrac{\hbar}{2}$ or $-\tfrac{\hbar}{2}$. The mean leans positive only because + is three times as likely."
- Stage: `lab-r3` — `lab(main('oven', [prep60, Z]), { readouts: ['centroid'], shot: 'L-PLATE-C' })`.
- Caption: "the tick sits at $\langle\sigma_z\rangle = \tfrac12$, that is $\langle S_z\rangle = \tfrac{\hbar}{4}$; no atom lands on it".
- Terms: `\tfrac{\hbar}{4}` → `centroid`.
- Claims: `expectation(SZ, psi)` = **0.25** · `0.5*prob(KET['+z'], psi) - 0.5*prob(KET['-z'], psi)` = **0.25** · `labStats(...).centroid` = **0.5**.

**`l4-average:b3` [L]**
- Text: "'Repeat' can mean two experiments. Fresh preparations, one $S_z$ reading each, give a 3 : 1 mix whose mean is $\tfrac{\hbar}{4}$. Measuring the same atom again and again gives its first answer every time, as long as nothing acts on it in between."
- Stage: `lab-r3` — `lab(main('oven', [prep60, Zkeep, Z]), { readouts: ['fractions'], shot: 'L-WIDE' })`.
- Caption: "keep $+\tfrac{\hbar}{2}$ and measure again: every atom repeats $+\tfrac{\hbar}{2}$".
- Claims: `bT({source:'oven', axes:[60,'z','z'], keep:['+','+']})` → blocked **[0.5, 0.125]**, plus **0.375**, minus **0**.

**`l4-average:b4` [L]**
- Text: "Check with Lecture 3's sandwich $\langle\psi|\hat S_z|\psi\rangle$. First $\hat S_z|\psi\rangle = \tfrac{\hbar}{2}\big(\tfrac{\sqrt3}{2}|{+z}\rangle - \tfrac12|{-z}\rangle\big)$; its inner product with $|\psi\rangle$ is $\tfrac{\hbar}{2}\big(\tfrac34 - \tfrac14\big) = \tfrac{\hbar}{4}$. The cross terms drop out because $\langle{+z}|{-z}\rangle = 0$."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: 30 }, others: [{ ket: { planeDeg: -30 }, role: 'second', badge: 'direction of Ŝz|ψ⟩' }], basis: 'z' })`.
- Caption: "$\hat S_z$ flips the sign of the down part: the result points to −30° and has length ½ (ħ = 1)".
- Claims: `apply(SZ, psi)` = **(0.4330, −0.25)** · `inner(psi, apply(SZ, psi)).re` = **0.25** · `norm(apply(SZ, psi))` = **0.5**.

**`l4-average:b5` [B]** — the sandwich in matrix form
- Text: "Townsend writes the same product with matrices (§2.6, p. 58): a row, times the matrix of $\hat S_z$ from Lecture 3, times a column. Here that is $\big(\tfrac{\sqrt3}{2}\;\;\tfrac12\big)\,\tfrac{\hbar}{2}\begin{pmatrix}1&0\\0&-1\end{pmatrix}\binom{\sqrt3/2}{1/2} = \tfrac{\hbar}{4}$. He adds that any basis gives the same number, as long as the row, matrix and column all use it."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: 30 }, basis: 'z', shadows: true })`.
- Caption: "row × matrix × column: $\tfrac{\hbar}{2}\big(\tfrac34 - \tfrac14\big)$".
- Claims: `expectation(SZ, psi)` = **0.25** · in the $x$ basis: `inner(toBasis(psi, xb), apply(operatorInBasis(SZ, xb), toBasis(psi, xb))).re` = **0.25** with `xb = [KET['+x'], KET['-x']]`.
- Refs: Townsend §2.6 p. 58 (eq. 2.105–2.107).

**`l4-average:b6` [B]**
- Text: "Susskind warns that measuring $A$ is not the same as applying $\hat A$ to the state (§3.5). Here $\hat S_z|\psi\rangle$ is neither $|{+z}\rangle$ nor $|{-z}\rangle$, yet a real $S_z$ measurement always leaves one of those two. His next lecture says what $\hat A|\psi\rangle$ is for: it is the right half of the sandwich (§4.7)."
- Stage: as `l4-average:b4`.
- Claims: `samePhysicalState(apply(SZ, psi), KET['+z'])` = **false** · with `KET['-z']` = **false** · a different state, not a relabelled one: `prob(KET['+x'], normalize(apply(SZ, psi)))` = **0.0670** vs `prob(KET['+x'], psi)` = **0.9330**.
- Refs: Susskind §3.5 (printed pp. 80–82 per L4 p. 21), §4.7 (expectation values; the product rule derived from Principle 4).

**`l4-average:b7` [B]** — **conditional: drop if L3 already uses Townsend's $\sqrt N$ remark**
- Text: "Townsend warns that $N$ atoms never split exactly: the up-minus-down count scatters by about $\sqrt N$ (§1.4, pp. 16–17). So 100 atoms can easily give 55 : 45 when 50 : 50 is predicted. Our 3 : 1 state behaves the same way."
- Stage: `lab-r3` — `lab(main('oven', [prep60, Z]), { batches: [10, 100, 1000], readouts: ['centroid', 'sigma-band'], shot: 'L-PLATE-C' })`.
- Caption: "batches of 10, 100 and 1000 atoms: the ±1σ band around the mean reading shrinks".
- Claims: `2*binomialStd(100, 0.5)` = **10** · `labStats` sigma band at p = 0.75 for N = 10, 100, 1000 = **0.2739, 0.0866, 0.0274** (σ units).
- Refs: Townsend §1.4 pp. 16–17 (the $\sqrt N$ paragraph only; Example 1.2 on p. 17 is L3's).

**`l4-average:b8` [C]** — links to the lecture's `corrections` entry `L4 p.10`
- Question: "The notes say that for repeated preparations of this $|\psi\rangle$ 'the theoretical mean is zero'. Is that right?"
- Stage: `lab-r3` — `lab(main('oven', [prep60, Z]), { batches: [1000], readouts: ['centroid'], shot: 'L-PLATE-C' })`.
- Reveal text: "No: for this $|\psi\rangle$ the mean is $\tfrac{\hbar}{4}$, found above in two ways. Zero is the mean for $|{+x}\rangle$, the state of Lecture 3's example, and the sentence was carried over from there. Its 'equal counts' should likewise read 'counts near 3 : 1'."
- Reveal stage: unchanged.
- Reveal claims: `expectation(SZ, psi)` = **0.25** · `expectation(SZ, KET['+x'])` = **0**.

### Unit `l4-matrices` — Spin matrices built from their outcomes

**`l4-matrices:b1` [L]**
- Note: L3 p. 5 wrote this matrix down without deriving it; deriving it from the eigen-conditions is L4's addition (p. 13).
- Text: "From here on $\hat S_z$ is the operator and $S_z$ its matrix in the $z$ basis: $|{+z}\rangle \leftrightarrow \binom10$, $|{-z}\rangle \leftrightarrow \binom01$ (read $\leftrightarrow$ as 'is written as'). Leave the four entries $m_{ij}$ (row $i$, column $j$) unknown. The principles fix them: $|{\pm z}\rangle$ must be eigenvectors with the measured values $\pm\tfrac{\hbar}{2}$."
- Stage: `lab-r3` — `lab(main('+z', [Z], true), { readouts: ['fill-bar'], shot: 'L-PLATE' })`.
- Caption: "the data: $|{+z}\rangle$ always reads $+\tfrac{\hbar}{2}$".
- Claims: `bT({source:'+z', axes:['z'], keep:[]}).plus` = **1** · `bT({source:'-z', axes:['z'], keep:[]}).minus` = **1**.

**`l4-matrices:b2` [L]**
- Text: "Column 1 of a matrix is where it sends $\binom10$, and column 2 is where it sends $\binom01$. So $\hat S_z|{+z}\rangle = \tfrac{\hbar}{2}|{+z}\rangle$ gives $m_{11} = \tfrac{\hbar}{2}$, $m_{21} = 0$, and $\hat S_z|{-z}\rangle = -\tfrac{\hbar}{2}|{-z}\rangle$ gives $m_{12} = 0$, $m_{22} = -\tfrac{\hbar}{2}$. Hence $S_z = \tfrac{\hbar}{2}\begin{pmatrix}1&0\\0&-1\end{pmatrix}$."
- Stage: `lab-r3` — `lab(main('-z', [Z]), { readouts: ['fill-bar'], shot: 'L-PLATE' })`.
- Caption: "the other fact: atoms prepared in $|{-z}\rangle$ always read $-\tfrac{\hbar}{2}$".
- Claims: `apply(SZ, KET['+z'])` = **(0.5, 0)** · `apply(SZ, KET['-z'])` = **(0, −0.5)** · `SZ` = **[[0.5, 0], [0, −0.5]]**.

**`l4-matrices:b3` [L]**
- Text: "For $x$ the definite states are $|{\pm x}\rangle \leftrightarrow \tfrac{1}{\sqrt2}\binom{1}{\pm1}$. Weight each outcome projector by its value: $\hat S_x = \tfrac{\hbar}{2}\big(|{+x}\rangle\langle{+x}| - |{-x}\rangle\langle{-x}|\big)$. With $P_{\pm x} = \tfrac12\begin{pmatrix}1&\pm1\\\pm1&1\end{pmatrix}$ this gives $S_x = \tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$."
- Stage: `hilbert-plane` — `plane({ psi: '+z', basis: 'x', shadows: true })`.
- Caption: "$\hat P_{\pm x}$ split any state into its $\pm x$ parts; $\hat S_x$ weights them $\pm\tfrac{\hbar}{2}$".
- Claims: `P('+x')` = **½[[1,1],[1,1]]** · `P('-x')` = **½[[1,−1],[−1,1]]** · `matEq(fromSpectrum([0.5, -0.5], [KET['+x'], KET['-x']]), SX)` · `matEq(madd(P('+x'), P('-x')), identity(2))`.

**`l4-matrices:b4` [L]** — first use of `operator-space` (see `b5` and Q2)
- Text: "For $y$ the kets are complex, $|{+y}\rangle \leftrightarrow \tfrac{1}{\sqrt2}\binom{1}{i}$, so its bra is the conjugated row $\langle{+y}| \leftrightarrow \tfrac{1}{\sqrt2}(1\;\;-i)$. That gives $P_{+y} = \tfrac12\begin{pmatrix}1&-i\\i&1\end{pmatrix}$ and $P_{-y} = \tfrac12\begin{pmatrix}1&i\\-i&1\end{pmatrix}$. Weighting by $\pm\tfrac{\hbar}{2}$ gives $S_y = \tfrac{\hbar}{2}\begin{pmatrix}0&-i\\i&0\end{pmatrix}$."
- Stage: `operator-space` — `{ kind: 'operator-space', op: { named: 'Sy' }, eigen: true, gauge: false, shot: 'O-STD' }`.
- Caption: "a new picture: $S_y$ as an arrow along $y$, the two ends of its axis marking $|{\pm y}\rangle$ (explained in the next step)".
- Terms: $|{\pm y}\rangle$ → `eigen-plus` / `eigen-minus`.
- Claims: `P('+y')` = **½[[1, −i], [i, 1]]** · `P('+y')[1][1]` = **0.5** · `P('-y')` = **½[[1, i], [−i, 1]]** · `matEq(fromSpectrum([0.5, -0.5], [KET['+y'], KET['-y']]), SY)`.

**`l4-matrices:b5` [L]**
- Text: "Remove the units: $\sigma_i = \tfrac{2}{\hbar}\hat S_i$ gives the Pauli matrices $\sigma_x = \begin{pmatrix}0&1\\1&0\end{pmatrix}$, $\sigma_y = \begin{pmatrix}0&-i\\i&0\end{pmatrix}$, $\sigma_z = \begin{pmatrix}1&0\\0&-1\end{pmatrix}$, so $S_i = \tfrac{\hbar}{2}\sigma_i$. Susskind works with $\sigma_i$, whose readings are $\pm1$ instead of $\pm\tfrac{\hbar}{2}$. The eigenstates are the same."
- Stage: `operator-space` — `{ kind: 'operator-space', op: { named: 'Sz' }, eigen: true, gauge: true, shot: 'O-STD' }`.
- Caption: "how to read this space: a matrix $a_0 I + a_x\sigma_x + a_y\sigma_y + a_z\sigma_z$ is the arrow $(a_x, a_y, a_z)$ plus the gauge $a_0$; $\hat S_z = \tfrac12\sigma_z$ is the arrow of length ½ along $z$ (ħ = 1)".
- Terms: arrow → `arrow-a` · $a_0$ → `gauge-a0`.
- Claims: `matEq(mscale(SIGMA_X, 0.5), SX)` (and y, z) · `decomposeHermitian(SZ)` = **{a0: 0, a: [0, 0, 0.5]}** · `decomposeHermitian(SX).a` = **[0.5, 0, 0]** · `decomposeHermitian(SY).a` = **[0, 0.5, 0]**.

**`l4-matrices:b6` [L]**
- Text: "$S_x$ and $S_z$ are real and symmetric, so they are Hermitian. For $S_y$, transpose and conjugate: $\begin{pmatrix}0&-i\\i&0\end{pmatrix}^\dagger$ is the same matrix again. An $i$ is allowed: what matters is $A_{ij} = A_{ji}^*$, with $A_{ij}$ the entry in row $i$, column $j$, and $^*$ the complex conjugate."
- Stage: `operator-space` — `{ kind: 'operator-space', op: { named: 'Sy' }, eigen: true, gauge: true }`.
- Claims: `isHermitian(SX)`, `isHermitian(SY)`, `isHermitian(SZ)` = **true** · `matEq(dagger(SIGMA_Y), SIGMA_Y)`.

**`l4-matrices:b7` [B]**
- Text: "Susskind gets the same three matrices by writing each pair of eigen-equations as four equations for the four entries (§3.4). Townsend reaches them by a different route that L4 does not need (§3.6, pp. 95–96). Different routes, same matrices: the definite states and their values pin the operator down."
- Stage: `operator-space` — `{ kind: 'operator-space', op: { named: 'Sx' }, eigen: true }`.
- Claims: `eigenHermitian2(SX)` → values **[0.5, −0.5]**, vectors equal `KET['+x']`, `KET['-x']`.
- Refs: Susskind §3.4 (printed pp. 75–80 per L4 p. 21); Townsend §3.6 pp. 94–96 (eq. 3.88–3.89).

**`l4-matrices:b8` [C]**
- Question: "Townsend writes the matrix $\tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$ and calls it $S_z$ (§2.6, Example 2.6, p. 59). Our $S_x$ has exactly these entries. Is one of us wrong?"
- Stage: `operator-space` — `{ kind: 'operator-space', op: { named: 'Sx' }, eigen: true }`.
- Reveal text: "Neither. Townsend writes $\hat S_z$ in the $x$ basis $\{|{+x}\rangle, |{-x}\rangle\}$, where it swaps the two basis states; we write $\hat S_x$ in the $z$ basis. The subscript names the quantity measured, and the basis only names the coordinates; every matrix in this lecture uses the $z$ basis."
- Reveal stage: `{ kind: 'operator-space', op: { named: 'Sz' }, eigen: true }`, caption "the operator $\hat S_z$ has not moved: still the arrow along $z$. Only its table of entries depends on the basis".
- Reveal claims: `matEq(operatorInBasis(SZ, [KET['+x'], KET['-x']]), SX)` · `matEq(operatorInBasis(SX, [KET['+x'], KET['-x']]), SZ)`.
- Refs: Townsend §2.5 Example 2.5 p. 57, §2.6 Example 2.6 p. 59.

### Unit `l4-eigen` — From a matrix back to outcomes

**`l4-eigen:b1` [L]**
- Text: "Now reverse the question: only the matrix $S_x = \tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$ is given. We look for a number $\lambda$ and a nonzero column $\binom{c_1}{c_2}$ with $S_x\binom{c_1}{c_2} = \lambda\binom{c_1}{c_2}$. Moving everything to one side gives $(S_x - \lambda I)\binom{c_1}{c_2} = \binom00$."
- Stage: `operator-space` — `{ kind: 'operator-space', op: { named: 'Sx' }, eigen: false, gauge: true }`.
- Caption: "the eigen-axis stays hidden until we solve for it".
- Claims: none (no number in text or caption beyond the given matrix, which is `SX`).

**`l4-eigen:b2` [L]**
- Text: "If $S_x - \lambda I$ had an inverse, applying it would force the column to be zero, so a nonzero solution needs $\det(S_x - \lambda I) = 0$. For a 2×2 matrix, $\det$ multiplies the two diagonal entries and subtracts the product of the two off-diagonal ones: $\lambda^2 - \tfrac{\hbar^2}{4} = 0$. Its roots $\lambda_\pm = \pm\tfrac{\hbar}{2}$ are the only possible results."
- Stage: as `b1`.
- Claims: `det2(msub(SX, mscale(identity(2), 0.5)))` = **0** · same at −0.5 = **0** · at λ = 0: **−0.25** (≠ 0, so 0 is not a result).

**`l4-eigen:b3` [L]**
- Text: "Put $\lambda = +\tfrac{\hbar}{2}$ back in: both rows say $c_2 = c_1$. Normalizing, $|c_1|^2 + |c_2|^2 = 2|c_1|^2 = 1$, and choosing $c_1$ real and positive gives $|{+x}\rangle \leftrightarrow \tfrac{1}{\sqrt2}\binom11$. With $\lambda = -\tfrac{\hbar}{2}$ the same steps give $c_2 = -c_1$ and $|{-x}\rangle \leftrightarrow \tfrac{1}{\sqrt2}\binom{1}{-1}$."
- Stage: `operator-space` — `{ kind: 'operator-space', op: { named: 'Sx' }, eigen: true, gauge: true }` (the axis ±x̂ appears).
- Terms: $|{+x}\rangle$ → `eigen-plus` · $|{-x}\rangle$ → `eigen-minus`.
- Claims: `eigenHermitian2(SX)` → values **[0.5, −0.5]**, vectors **(0.7071, 0.7071)** and **(0.7071, −0.7071)**.

**`l4-eigen:b4` [L]**
- Text: "Check: $\langle{+x}|{-x}\rangle = \tfrac12(1 - 1) = 0$. Two orthonormal vectors in a two-dimensional space already form a complete basis, which is the same statement as $\hat P_{+x} + \hat P_{-x} = I$. The method has recovered both results and both definite states."
- Stage: `hilbert-plane` — `plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }], basis: 'x', rightAngle: true })`.
- Claims: `inner(KET['+x'], KET['-x'])` = **0** · `matEq(madd(P('+x'), P('-x')), identity(2))`.

**`l4-eigen:b5` [L]**
- Text: "For any input $|\psi\rangle = \alpha|{+z}\rangle + \beta|{-z}\rangle$ with $|\alpha|^2 + |\beta|^2 = 1$, the eigenvectors give the amplitudes $\langle{\pm x}|\psi\rangle = (\alpha \pm \beta)/\sqrt2$. So $P(\pm\tfrac{\hbar}{2}) = \tfrac12|\alpha \pm \beta|^2$, which add up to $|\alpha|^2 + |\beta|^2 = 1$. The atom is then left in $|{\pm x}\rangle$."
- Stage: `hilbert-plane` — `plane({ psi: { planeDeg: 30 }, basis: 'x', shadows: true })`.
- Caption: "our unit-3 state measured along $x$: bars 0.933 and 0.067".
- Claims: `prob(KET['+x'], psi)` = **0.9330** · `prob(KET['-x'], psi)` = **0.0670** · the formula `abs2(add(α, β))/2` matches `prob` for `psi`, for `vec(0.6, 0.8)` (**0.98 / 0.02**) and for `KET['+y']` (**0.5 / 0.5**).

**`l4-eigen:b6` [L]**
- Text: "The mean follows from the same list: $\langle S_x\rangle = \tfrac{\hbar}{2}P(+\tfrac{\hbar}{2}) - \tfrac{\hbar}{2}P(-\tfrac{\hbar}{2}) = \langle\psi|\hat S_x|\psi\rangle$. For our state that is $\tfrac{\sqrt3}{4}\hbar \approx 0.433\hbar$. Given only a matrix, we can now predict every feature of its measurement."
- Stage: `lab-r3` — `lab(main('oven', [prep60, X]), { readouts: ['centroid'], shot: 'L-PLATE-C' })`.
- Caption: "an $x$ magnet after the 60° preparation: tick at $\langle\sigma_x\rangle = 0.866$, that is $\langle S_x\rangle = 0.433\hbar$".
- Claims: `expectation(SX, psi)` = **0.4330** · `0.5*(prob(KET['+x'], psi) - prob(KET['-x'], psi))` = **0.4330** · `bT({source:'oven', axes:[60,'x'], keep:['+']})` → plus **0.4665**, minus **0.0335**, centroid **0.8660**.

**`l4-eigen:b7` [B]** — `beyondLecture` (tilted axes are deferred by L4 p. 1)
- Text: "Susskind solves the same eigenvalue problem for a magnet tilted by an angle $\theta$ from $z$ toward $x$ (§3.7). The results are again $\pm1$ in his units, with orthogonal eigenvectors. At $\theta = 60^\circ$ the + eigenvector is exactly our $|\psi\rangle$, which is why the 60° magnet prepares it."
- Stage: `operator-space` — `{ kind: 'operator-space', op: { matrix: [['1/4', 'sqrt(3)/4'], ['sqrt(3)/4', '-1/4']] }, eigen: true }` (= $\hat S_n$ at 60°; if `expr.ts` has no `sqrt`, use `{ a0: 0, a: [0.4330127, 0, 0.25] }`).
- Claims: `eigenHermitian2(spinAlong(tiltXZ(Math.PI/3)))` → values **[0.5, −0.5]**, `vectors[0]` = **(0.8660, 0.5)** = `psi` · `expectation(nDotSigma(tiltXZ(Math.PI/3)), KET['+z'])` = **0.5** = cos 60° (Lecture 1's $\langle\sigma_n\rangle = \cos\theta$).
- Refs: Susskind §3.7 (eq. 3.23–3.26, Exercise 3.3).

**`l4-eigen:b8` [C]**
- Question: "The + eigenvector could just as well be written $-\tfrac{1}{\sqrt2}\binom11$ or $\tfrac{i}{\sqrt2}\binom11$. Did choosing $\tfrac{1}{\sqrt2}\binom11$ lose anything?"
- Stage: `hilbert-plane` — `plane({ psi: '+x', basis: 'x' })`.
- Reveal text: "Nothing. A common factor of size 1 changes no probability, so all three are the same physical state (Lecture 1's global phase). The rule 'first component real and positive' only makes everyone's answers match, and the app's engine uses the same rule."
- Reveal stage: `plane({ psi: '+x', others: [{ ket: { neg: '+x' }, role: 'ghost', badge: 'same state' }], basis: 'x' })`, caption "the $-1$ version is drawn; the $i$ version cannot be drawn on a real plane".
- Reveal claims: `samePhysicalState(KET['+x'], vscale(KET['+x'], -1))` = **true** · `samePhysicalState(KET['+x'], vscale(KET['+x'], c(0, 1)))` = **true** · `canonicalPhase(vscale(KET['+x'], c(0, 1)))` equals `KET['+x']`.

**Beat count:** 46 beats (8 + 7 + 7 + 8 + 8 + 8), 45 if `l4-average:b7` is dropped because L3 already uses the $\sqrt N$
remark; 9 are clues with reveals. Two are second-pass link beats (`l4-projectors:b1`, `l4-average:b1`) and one is the
L3 recap (`l4-basis:b1`). Three beats carry `beyondLecture`
(`l4-example:b6`, `l4-example:b7`, `l4-eigen:b7`). The 60° preparation magnet is reused as a stage device in
`l4-average` and `l4-eigen:b6`; it is flagged in the fidelity drawer (`lab-prep-tilted`, §10) rather than badged (Q1).

## 2. Try-it widgets per unit

All widgets exist in `app/src/widgets/registry.tsx`; props are their real interfaces. Numbers in prompts are engine values.

| Unit | Widget (`visual`) | Props | "Try this" prompts |
|---|---|---|---|
| `l4-basis` | `projector` | `{ state: 30, basis: 0, editableBasis: true }` | 1. Drag the state anywhere. Do the two squares ever add to more, or less, than 1? · 2. Turn the basis to 45° (the $x$ basis). The shares change, but they still add to 1: every orthonormal basis is complete. · 3. Put the state at 45° with the $z$ basis. Which state is it, and why is it not left out of the $z$ measurement? |
| `l4-projectors` | `sg-lab` | `{ source: '+x', axes: ['z','z','z'], keep: ['+','+'], editable: true, predict: true, maxDevices: 4 }` | 1. Predict the + fraction, then check: the second $z$ filter stops no atoms ($\hat P^2 = \hat P$). · 2. Keep − at the second filter: nothing reaches the plate ($\hat P_{+z}\hat P_{-z} = 0$). · 3. Turn the middle filter to $x$: now atoms are lost at every filter. What changed? |
| `l4-example` | `amplitude-bars` | `{ state: [60, 0], basis: 'z', editable: true }` | 1. Read the two amplitudes and square them: 0.75 and 0.25. · 2. Set φ = 90° (a complex relative phase): the $z$ bars do not move. Which basis notices the change? · 3. Back at φ = 0°, switch the basis to $x$: 0.933 and 0.067, the numbers unit 6 derives. |
| `l4-average` | `deposit-stats` | `{ state: [60, 0], axis: 'z', seed: 448 }` | 1. Fire 10 atoms, then 1000. How far is the + count from ¾ of the atoms each time, compared with the ±σ band (13.7 atoms at 1000)? · 2. Change the state to $|{+x}\rangle$ (Lecture 3's example): the mean is 0, the value the notes wrongly gave for $|\psi\rangle$. · 3. Find a state whose mean along $z$ is $-\tfrac{\hbar}{4}$ (hint: θ = 120°). |
| `l4-matrices` | `operator-builder` | `{ axis: 'y' }` | 1. Step through $y$. At the projector step, check that $P_{+y}$ has +½ in its lower-right corner, not −½. · 2. Switch to $x$ and to $z$. Which step makes the diagonal of $S_x$ vanish? · 3. Second widget for `b8`: `basis-translator` `{ mode: 'operator', operator: 'Sz', target: 'x' }`. $\hat S_z$ written in the $x$ basis has the entries of our $S_x$. |
| `l4-eigen` | `operator-action` | `{ preset: 'σx' }` | 1. Turn the test vector until the matrix only stretches or flips it. Those are the eigen-directions; what factors do you find? · 2. Preset `I`: every direction works. This is the repeated-eigenvalue case from unit 1. · 3. Preset `P+z`: the factors are 1 and 0, the yes/no question from unit 2. |

`operator-action` is real-symmetric only (its own note says so), so $S_y$ is not offered there. The $S_y$ eigenvalue
problem is L5 homework (L5 p. 1) and appears only as the hints-only item `l4-g-sy`.

## 3. Challenges per unit

Format: **id · tier · kind** — prompt · answer (engine) · hints (nudge → key idea → setup) · walkthrough. Numeric answers are
in units of ħ where marked; tolerance 0.001 unless stated. `psi` = $\tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$.

**Assigned homework.** The notes name one homework item: a 3×3 Gram–Schmidt problem (p. 5). The notes do not contain its
data, so nothing is authored. If the user supplies the problem, it becomes a numeric challenge with
`assigned: 'L4 p.5'`, hints only (nudge: "work inside one repeated eigenvalue at a time"; key idea: "subtract the parts along
every earlier $|e_j\rangle$, not just the last"; setup: "normalize $|v_1\rangle$, then $|w_2\rangle = |v_2\rangle - |e_1\rangle\langle e_1|v_2\rangle$,
then $|w_3\rangle = |v_3\rangle - \sum_{j\le2}|e_j\rangle\langle e_j|v_3\rangle$"). The p. 19 "practice exercise" is in-class practice, not
homework; it is `l4-g-sx-prob` below. Two further homework items from neighbouring notes touch L4 content: the proof that
Hermitian eigenvalues are real (L3 p. 5) is never worked anywhere in L4, and the $S_y$ eigenvalue problem (L5 p. 1) is the
hints-only item `l4-g-sy`.

### `l4-basis`
- **l4-b-distinct · warm-up · choice** — "Which pair of states can one measurement always tell apart?"
  Options: $|{+z}\rangle, |{-z}\rangle$ ✔ (`inner` = 0) · $|{+z}\rangle, |{+x}\rangle$ ✘ (overlap 0.7071) · $|{+x}\rangle, |{+y}\rangle$ ✘ (`abs(inner)` = 0.7071) · $|{+y}\rangle, -|{+y}\rangle$ ✘ (one state; `abs(inner)` = 1).
  Hints: (1) Principle 3 turns "always tell apart" into a statement about overlaps. (2) Perfectly distinguishable means orthogonal: the inner product is 0. (3) Compute $\langle a|b\rangle$ for each pair; conjugate the bra when it has an $i$.
  Walkthrough: write each pair as columns → take the inner products (conjugating the first) → only $|{\pm z}\rangle$ gives 0 → note that $-|{+y}\rangle$ is not even a different state.
- **l4-b-gs-length · core · numeric** — "Gram–Schmidt on $|v_1\rangle = \binom10$, $|v_2\rangle = \tfrac{1}{\sqrt2}\binom11$: how long is $|w_2\rangle$ before it is rescaled?"
  Answer **0.7071** = `norm(gramSchmidt([KET['+z'], KET['+x']]).steps[1].residual)`.
  Hints: (1) Remove from $|v_2\rangle$ its part along $|e_1\rangle$. (2) That part is $|e_1\rangle\langle e_1|v_2\rangle$, with $\langle e_1|v_2\rangle = 1/\sqrt2$. (3) $|w_2\rangle = \tfrac{1}{\sqrt2}\binom11 - \tfrac{1}{\sqrt2}\binom10$; find its length.
  Walkthrough: $|e_1\rangle = |v_1\rangle$ (already length 1) → $\langle e_1|v_2\rangle = 1/\sqrt2$ → $|w_2\rangle = \tfrac{1}{\sqrt2}\binom01$ → length $1/\sqrt2 \approx 0.7071$ → rescaled, $|e_2\rangle = \binom01$.
- **l4-b-gs-order · stretch · numeric** — "Run Gram–Schmidt in the other order: first $\tfrac{1}{\sqrt2}\binom11$, then $\binom10$. What is the second component of $|e_2\rangle$?"
  Answer **−0.7071** = `gramSchmidt([KET['+x'], KET['+z']]).basis[1][1].re`.
  Hints: (1) The first vector you keep now is $|{+x}\rangle$. (2) Subtract from $\binom10$ its part along $|{+x}\rangle$, which is $\tfrac{1}{\sqrt2}|{+x}\rangle$. (3) The remainder is $\binom{1/2}{-1/2}$; rescale it.
  Walkthrough: $|e_1\rangle = |{+x}\rangle$ → $\langle e_1|v_2\rangle = 1/\sqrt2$ → $|w_2\rangle = \binom10 - \tfrac12\binom11 = \tfrac12\binom{1}{-1}$ → $|e_2\rangle = |{-x}\rangle$, second component $-1/\sqrt2$ → a different order gives a different, equally good orthonormal basis (the $x$ basis).

### `l4-projectors`
- **l4-p-results · warm-up · choice** — "Which results can a measurement of $\hat P_{+z}$ give?"
  Options: 1 and 0 ✔ (`eigenHermitian2(P('+z')).values` = [1, 0]) · $+\tfrac{\hbar}{2}$ and $-\tfrac{\hbar}{2}$ ✘ (those belong to $\hat S_z$) · only 1 ✘ (forgets the state it sends to zero) · 1 and −1 ✘ (that is $\sigma_z$).
  Hints: (1) The results are the eigenvalues. (2) Find what $\hat P_{+z}$ does to $|{+z}\rangle$ and to $|{-z}\rangle$. (3) $\hat P_{+z}|{+z}\rangle = 1\,|{+z}\rangle$, $\hat P_{+z}|{-z}\rangle = 0\,|{-z}\rangle$.
  Walkthrough: apply $\hat P_{+z}$ to both basis states → read off 1 and 0 → a 0 result means "no", with the atom in $|{-z}\rangle$.
- **l4-p-yes · core · numeric** — "For $|\psi\rangle = 0.6|{+z}\rangle + 0.8|{-z}\rangle$, what is the probability that 'up along $z$?' is answered 'yes'?"
  Answer **0.36** = `expectation(P('+z'), vec(0.6, 0.8))`.
  Hints: (1) The probability of an outcome is $\langle\psi|\hat P|\psi\rangle$. (2) $\hat P_{+z}|\psi\rangle = 0.6|{+z}\rangle$. (3) Take the inner product of that with $|\psi\rangle$.
  Walkthrough: $\hat P_{+z}|\psi\rangle = 0.6|{+z}\rangle$ → $\langle\psi|0.6|{+z}\rangle = 0.6 \times 0.6$ → 0.36 → check: "no" gets 0.64, total 1.
- **l4-p-idempotent · core · choice** — "$Q = \begin{pmatrix}1&1\\0&0\end{pmatrix}$ satisfies $Q^2 = Q$. Can it represent a yes/no measurement?"
  Options: yes, $Q^2 = Q$ is all a projector needs ✘ · no: it is not Hermitian, and its 'yes' and 'no' states overlap ✔ (`isHermitian(Q)` = false; overlap 0.7071) · no, because $Q^2 \ne Q$ ✘ (`matEq(matmul(Q,Q), Q)` is true) · no, because its eigenvalues are not 1 and 0 ✘ (they are).
  Hints: (1) Principle 3 says the outcomes must be told apart for sure. (2) Find $Q$'s eigenvectors for 1 and for 0. (3) They are $\binom10$ and $\tfrac{1}{\sqrt2}\binom{1}{-1}$; compute their overlap.
  Walkthrough: check $Q^2 = Q$ → find eigenvectors → overlap $1/\sqrt2 \ne 0$ → not distinguishable → measurement projectors must also satisfy $\hat P^\dagger = \hat P$.
- **l4-p-two-filters · stretch · numeric** — "Atoms in $|{+z}\rangle$ pass an 'up along $x$?' filter and then an 'up along $z$?' filter. What fraction survives both?"
  Answer **0.25** = `bT({source:'+z', axes:['x','z'], keep:['+']}).plus` = `norm2(apply(P('+z'), apply(P('+x'), KET['+z'])))`.
  Hints: (1) Filters in a row are projectors applied in turn. (2) The surviving fraction is the squared length of what is left. (3) $\hat P_{+x}|{+z}\rangle = \tfrac12\binom11$.
  Walkthrough: $\hat P_{+x}|{+z}\rangle = \tfrac12\binom11$ → $\hat P_{+z}$ of that $= \tfrac12\binom10$ → squared length ¼ → same as ½ × ½ from the lab rule.

### `l4-example`
- **l4-e-minus · warm-up · numeric** — "$|\psi\rangle = 0.6|{+z}\rangle + 0.8|{-z}\rangle$. What is $P(-\tfrac{\hbar}{2})$ for $S_z$?"
  Answer **0.64** = `prob(KET['-z'], vec(0.6, 0.8))`.
  Hints: (1) Check the state is normalized. (2) The amplitude for $-\tfrac{\hbar}{2}$ is $\langle{-z}|\psi\rangle$. (3) Square its size.
  Walkthrough: $0.36 + 0.64 = 1$ → $\langle{-z}|\psi\rangle = 0.8$ → $0.8^2 = 0.64$.
- **l4-e-four · core · choice** — "In the lecture's example, what is the number $\tfrac{\sqrt3}{2}$?"
  Options: the amplitude $\langle{+z}|\psi\rangle$ ✔ · the probability of $+\tfrac{\hbar}{2}$ ✘ (that is ¾) · the measured value ✘ (that is $+\tfrac{\hbar}{2}$) · the state afterwards ✘ (that is $|{+z}\rangle$).
  Hints: (1) Four different things appear in one prediction. (2) Probabilities are squares of amplitudes. (3) $(\tfrac{\sqrt3}{2})^2 = \tfrac34$.
  Walkthrough: list amplitude, probability, result, state → match $\tfrac{\sqrt3}{2}$ to the amplitude → its square is the probability.
- **l4-e-normalize · core · numeric** — "A state is given as the column $\binom21$, not yet normalized. What is $P(+\tfrac{\hbar}{2})$ for $S_z$?"
  Answer **0.8** = `prob(KET['+z'], normalize(vec(2, 1)))`.
  Hints: (1) Probabilities need a state of length 1. (2) Divide by the length $\sqrt{2^2 + 1^2} = \sqrt5$. (3) Then square the first component.
  Walkthrough: length $\sqrt5$ → state $\tfrac{1}{\sqrt5}\binom21$ → $P = 4/5 = 0.8$ → trap: 2/3 or 4 come from skipping the normalization.
- **l4-e-then-x · stretch · numeric** — "An atom in $|\psi\rangle = \tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$ gives $+\tfrac{\hbar}{2}$ for $S_z$. Right after, $S_x$ is measured. What is the probability of $+\tfrac{\hbar}{2}$?"
  Answer **0.5** = `prob(KET['+x'], normalize(apply(P('+z'), psi)))`.
  Hints: (1) Which state goes into the second magnet? (2) After $+\tfrac{\hbar}{2}$ the state is $|{+z}\rangle$, not $|\psi\rangle$. (3) Find $|\langle{+x}|{+z}\rangle|^2$.
  Walkthrough: update $|\psi\rangle \to |{+z}\rangle$ → $\langle{+x}|{+z}\rangle = 1/\sqrt2$ → probability ½ → trap: 0.933 is what $|\psi\rangle$ itself would give (`prob(KET['+x'], psi)`); the first measurement erased that.

### `l4-average`
- **l4-a-mean · warm-up · numeric (unit ħ)** — "$\langle S_z\rangle$ for $0.6|{+z}\rangle + 0.8|{-z}\rangle$?"
  Answer **−0.14** = `expectation(SZ, vec(0.6, 0.8))`.
  Hints: (1) Weight each result by its probability. (2) $P(+) = 0.36$, $P(-) = 0.64$. (3) $\tfrac12(0.36) - \tfrac12(0.64)$.
  Walkthrough: probabilities → weighted sum $0.18 - 0.32 = -0.14$ → negative because − is more likely → no atom reads −0.14ħ.
- **l4-a-erratum · core · choice** — "Over many fresh preparations of $|\psi\rangle = \tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$, the mean $S_z$ reading is:"
  Options: 0 ✘ (the mean for $|{+x}\rangle$; the notes' p. 10 slip) · $\tfrac{\hbar}{4}$ ✔ (`expectation(SZ, psi)` = 0.25) · $\tfrac{\hbar}{2}$ ✘ (the most likely single reading) · $\tfrac{\sqrt3}{4}\hbar$ ✘ (that is $\langle S_x\rangle$).
  Hints: (1) The mean depends on the probabilities, ¾ and ¼. (2) $\sum a_i P(a_i)$. (3) $\tfrac{\hbar}{2}\cdot\tfrac34 - \tfrac{\hbar}{2}\cdot\tfrac14$.
  Walkthrough: weighted sum → $\tfrac{\hbar}{4}$ → cross-check with $\langle\psi|\hat S_z|\psi\rangle$ → zero would need equal probabilities.
- **l4-a-yesno-mean · core · numeric** — "What is the mean of the yes/no observable $\hat P_{+z}$ in the state $|\psi\rangle$ above?"
  Answer **0.75** = `expectation(P('+z'), psi)`.
  Hints: (1) Its results are 1 and 0. (2) The mean is $1\cdot P(\text{yes}) + 0\cdot P(\text{no})$. (3) So the mean of a projector is a probability.
  Walkthrough: $P(\text{yes}) = \tfrac34$ → mean $= \tfrac34$ → the same as $\langle\psi|\hat P_{+z}|\psi\rangle$ → the Born rule is a special case of the mean formula.
- **l4-a-scatter · stretch · numeric (tolerance 0.05)** — conditional, like `l4-average:b7`; this is the finite-sample scatter of a count, not the quantum spread $\Delta S_z$ (L3's) — "1000 fresh atoms in $|\psi\rangle$ go through an $S_z$ magnet. By how much does the number of $+\tfrac{\hbar}{2}$ readings typically scatter (one standard deviation)?"
  Answer **13.69** = `binomialStd(1000, 0.75)`.
  Hints: (1) Each atom is an independent yes/no trial with $p = \tfrac34$. (2) Counts of such trials scatter by $\sqrt{Np(1-p)}$. (3) $\sqrt{1000 \cdot 0.75 \cdot 0.25}$.
  Walkthrough: expected count 750 → spread $\sqrt{187.5} \approx 13.7$ → a run of 740 is normal, a run of 700 is not → the prediction is the distribution, not the exact count.

### `l4-matrices`
- **l4-m-m22 · warm-up · numeric (unit ħ)** — "What is the entry $m_{22}$ of $S_z$?"
  Answer **−0.5** = `SZ[1][1].re`.
  Hints: (1) Column 2 is where $\hat S_z$ sends $\binom01$. (2) $\hat S_z|{-z}\rangle = -\tfrac{\hbar}{2}|{-z}\rangle$. (3) Read the second component of that column.
  Walkthrough: column 2 $= -\tfrac{\hbar}{2}\binom01$ → $m_{12} = 0$, $m_{22} = -\tfrac{\hbar}{2}$.
- **l4-m-py · core · numeric** — "Find $P_{+y} = |{+y}\rangle\langle{+y}|$. What number sits in its lower-right corner?"
  Answer **0.5** = `projector(KET['+y'])[1][1].re`.
  Hints: (1) The bra is the conjugated row. (2) $\langle{+y}| \leftrightarrow \tfrac{1}{\sqrt2}(1\;\;-i)$. (3) The entry is $\tfrac{i}{\sqrt2}\cdot\tfrac{-i}{\sqrt2}$.
  Walkthrough: row 2 of the ket is $i/\sqrt2$ → column 2 of the bra is $-i/\sqrt2$ → product $= -i^2/2 = \tfrac12$ → trap: −½ from forgetting to conjugate.
- **l4-m-noconj · core · choice (spot the error)** — "A student writes $P_{+y} = \tfrac12\binom1i(1\;\;i) = \tfrac12\begin{pmatrix}1&i\\i&-1\end{pmatrix}$. What went wrong, and how can you tell?"
  Options: the bra was not conjugated; the result is not Hermitian and squares to zero instead of to itself ✔ (`isHermitian` false; `matmul(M, M)` = 0) · nothing, it is correct ✘ · the $\tfrac12$ should be $\tfrac{1}{\sqrt2}$ ✘ · the ket should be $\binom{i}{1}$ ✘.
  Hints: (1) A projector must equal its own square and be Hermitian. (2) Check the lower-right entry and $M^2$. (3) Redo it with $\langle{+y}| \leftrightarrow \tfrac{1}{\sqrt2}(1\;\;-i)$.
  Walkthrough: $M^2 = 0$, not $M$ → off-diagonal entries $i$ and $i$ are not conjugates → conjugate the bra → $\tfrac12\begin{pmatrix}1&-i\\i&1\end{pmatrix}$.
- **l4-m-basis · stretch · numeric (unit ħ)** — "Write $\hat S_z$ in the $x$ basis $\{|{+x}\rangle, |{-x}\rangle\}$. What is its top-right entry $\langle{+x}|\hat S_z|{-x}\rangle$?"
  Answer **0.5** = `operatorInBasis(SZ, [KET['+x'], KET['-x']])[0][1].re`.
  Hints: (1) Entry $(i, j)$ is $\langle i|\hat S_z|j\rangle$ in the new basis. (2) $\hat S_z|{-x}\rangle = \tfrac{\hbar}{2}\cdot\tfrac{1}{\sqrt2}\binom{1}{1}$. (3) Take the inner product with $|{+x}\rangle$.
  Walkthrough: $\hat S_z$ flips the sign of the down part, so $\hat S_z|{-x}\rangle = \tfrac{\hbar}{2}|{+x}\rangle$ → entry $= \tfrac{\hbar}{2}$ → the whole matrix is $\tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$, the entries of our $S_x$ (Townsend p. 59).

### `l4-eigen`
- **l4-g-zero · warm-up · numeric (unit ħ²)** — "Evaluate $\det(S_x - \lambda I)$ at $\lambda = 0$. Can 0 be a result of measuring $S_x$?"
  Answer **−0.25** = `det2(msub(SX, mscale(identity(2), 0)))` (nonzero, so 0 is not a result).
  Hints: (1) At $\lambda = 0$ the matrix is just $S_x$. (2) Diagonal product minus off-diagonal product. (3) $0\cdot0 - \tfrac{\hbar}{2}\cdot\tfrac{\hbar}{2}$.
  Walkthrough: $\det S_x = -\tfrac{\hbar^2}{4} \ne 0$ → $S_x$ has an inverse → only the zero column solves $S_x v = 0$ → 0 is not an eigenvalue, so no atom reads 0.
- **l4-g-order · core · order** — "Put the steps for finding an observable's results and definite states in order."
  Steps: write $(A - \lambda I)v = 0$ for an unknown nonzero column $v$ · require $\det(A - \lambda I) = 0$ · solve for the eigenvalues $\lambda$ · put each $\lambda$ back to get the ratio of the components · normalize so that $v^\dagger v = 1$ · fix the phase: first component real and positive.
  Hints: (1) You cannot find $v$ before you know $\lambda$. (2) The determinant condition gives $\lambda$ alone. (3) The phase is chosen last, after the length is fixed.
  Walkthrough: the order above, with $S_x$ as the example (`l4-eigen:b1`–`b3`).
- **l4-g-sx-prob · core · numeric** — "$|\psi\rangle = 0.6|{+z}\rangle + 0.8|{-z}\rangle$ goes into an $S_x$ magnet. What is $P(+\tfrac{\hbar}{2})$?"
  Answer **0.98** = `prob(KET['+x'], vec(0.6, 0.8))`.
  Hints: (1) Use the eigenvector $|{+x}\rangle$. (2) $\langle{+x}|\psi\rangle = (\alpha + \beta)/\sqrt2$. (3) Square $1.4/\sqrt2$.
  Walkthrough: amplitude $1.4/\sqrt2$ → probability $1.96/2 = 0.98$ → $P(-) = 0.2^2/2 = 0.02$ → total 1.
- **l4-g-shift · stretch · numeric** — "Solve the eigenvalue problem for $A = \begin{pmatrix}2&1\\1&2\end{pmatrix}$. What is its smaller eigenvalue, and why are its eigenvectors those of $S_x$?"
  Answer **1** = `eigenHermitian2(mat([[2, 1], [1, 2]])).values[1]` (the larger is **3**; vectors equal `KET['+x']`, `KET['-x']`).
  Hints: (1) Same four steps as for $S_x$. (2) $\det(A - \lambda I) = (2-\lambda)^2 - 1$. (3) Notice $A = 2I + \sigma_x$.
  Walkthrough: $(2-\lambda)^2 = 1$ → $\lambda = 3$ or $1$ → rows give $c_2 = \pm c_1$, the $|{\pm x}\rangle$ columns → adding $2I$ shifts both eigenvalues by 2 and moves no eigenvector (in operator space: the gauge $a_0$ changes, the arrow does not; `decomposeHermitian` → $a_0 = 2$, $\vec a = (1, 0, 0)$).
- **l4-g-sy · assigned (L5 p. 1) · numeric** — "Find the eigenvalues and normalized eigenvectors of $S_y$ (phase rule: first component real and positive). Enter the imaginary part of the second component of the $+\tfrac{\hbar}{2}$ eigenvector."
  `assigned: 'L5 p.1'` — hints only; the walkthrough is withheld. Answer kept for the checker: **0.7071** = `eigenHermitian2(SY).vectors[0][1].im`.
  Hints: (1) Follow the same four steps as for $S_x$. (2) The determinant has the same shape; the off-diagonal product now involves $i$ and $-i$. (3) When you put $\lambda$ back, keep the $i$: the ratio $c_2/c_1$ is not a real number.

## 4. Glossary terms new in L4

One plain sentence each (≤ 25 words). Per the orchestrator ruling, a term belongs to the first lecture whose notes define it.
Terms L3 (or L2) owns are **not added** by L4; they are listed at the end as link-only tags. Ids already in L1's
`glossary.ts` are reused, never duplicated.

| id | Term | Gloss | First (L4) |
|---|---|---|---|
| `qm-principles` | the four principles | Susskind's four basic rules: observables are operators, results are eigenvalues, distinguishable states are orthogonal, and the Born rule gives the odds. | `l4-basis:b2` |
| `kronecker-delta` | $\delta_{ij}$ | A shorthand that equals 1 when its two labels match and 0 when they differ. | `l4-basis:b4` |
| `eigenbasis` | eigenbasis | A basis made entirely of eigenvectors of one operator. | `l4-basis:b4` |
| `degenerate` | degenerate eigenvalue | An eigenvalue shared by two or more independent eigenvectors, like the eigenvalue 1 of the identity. | `l4-basis:b8` |
| `linearly-independent` | linearly independent | Vectors none of which can be built from the others by rescaling and adding. | `l4-basis:b8` |
| `span` | span | All the vectors you can build from a given set by rescaling and adding. | `l4-basis:b8` |
| `gram-schmidt` | Gram–Schmidt procedure | A recipe that makes independent vectors orthonormal: normalize the first, subtract earlier parts from each next one, then normalize it. | `l4-basis:b8` |
| `range` | range | Every output an operator can produce; for $\hat P_{+z}$ it is the single line through $|{+z}\rangle$. | `l4-projectors:b2` |
| `yes-no-observable` | yes/no observable | A measurement with only the results 1 (yes) and 0 (no); a projector represents it. | `l4-projectors:b3` |
| `zero-vector` | zero vector | The vector whose components are all 0; it has no length, so it describes no state. | `l4-projectors:b3` |
| `complete-family` | complete family of projectors | All the outcome projectors of one measurement; they are mutually orthogonal and add up to the identity. | `l4-projectors:b4` |
| `orthogonal-projector` | orthogonal projector | A projector that is also Hermitian, $\hat P^2 = \hat P$ and $\hat P^\dagger = \hat P$; only these describe measurement outcomes. | `l4-projectors:b6` |
| `repeated-preparations` | repeated preparations | Making a fresh atom in the same state for every reading, as opposed to measuring one atom again and again. | `l4-average:b3` |
| `z-basis` | $z$ basis | The basis $\{|{+z}\rangle, |{-z}\rangle\}$; every matrix in Lecture 4 is written in it. | `l4-matrices:b1` |
| `spin-matrices` | spin matrices $S_x, S_y, S_z$ | The three 2×2 matrices that represent spin along $x$, $y$ and $z$, written in the $z$ basis. | `l4-matrices:b3` |
| `operator-space` | operator space | The app's picture of a 2×2 Hermitian matrix $a_0 I + \vec a\cdot\vec\sigma$ as an arrow $\vec a$ plus a gauge showing $a_0$. | `l4-matrices:b4` (app convention) |
| `pauli-matrices` | Pauli matrices $\sigma_x, \sigma_y, \sigma_z$ | The spin matrices without the factor $\hbar/2$, $\sigma_i = \tfrac{2}{\hbar}S_i$; each has eigenvalues $+1$ and $-1$. | `l4-matrices:b5` |
| `eigenvalue-problem` | eigenvalue problem | Given a matrix $A$, finding every number $\lambda$ and nonzero vector $v$ with $Av = \lambda v$. | `l4-eigen:b1` |
| `inverse` | inverse | The matrix that undoes $A$: multiplying $A$ by its inverse gives the identity. | `l4-eigen:b2` |
| `determinant` | determinant $\det$ | For a 2×2 matrix, the diagonal product minus the other product; it is zero exactly when the matrix has no inverse. | `l4-eigen:b2` |
| `characteristic-equation` | characteristic equation | The equation $\det(A - \lambda I) = 0$, whose solutions are the eigenvalues of $A$. | `l4-eigen:b2` |
| `phase-convention` | phase convention | The agreed rule, here "first component real and positive", that picks one vector among versions differing by an overall phase. | `l4-eigen:b3` |

**Owned by L3 — tagged in L4, not added** (L4 first use in brackets): `hermitian`, `adjoint`, `eigenvalue`, `eigenvector`
(`l4-basis:b1`) · `complete-basis` (completeness) and `completeness-relation` (`l4-basis:b4`–`b5`) · `projector`,
`identity-operator` (`l4-basis:b5`) · `idempotent` (`l4-projectors:b5`) · `conditional-state` (`l4-example:b3`) ·
`expectation` (the L1 id; L3 widens it to $\langle A\rangle$; `l4-average:b1`) · `variance` (not used in L4) ·
`matrix-element` (`l4-matrices:b1`). **Owned by L2:** `complex-conjugate` (`l4-matrices:b4`). If P-L3 lands without one
of these, the orchestrator decides where it goes.

Reused from L1 without change: `born-rule`, `orthogonal`, `distinguishable`, `orthonormal-basis`, `normalized`, `amplitude`,
`superposition`, `mixture`, `global-phase`, `sigma-reading`, `S-z`, `hbar`, `inner-product`, `ket`, `bra`, `state`.

## 5. Review cards per unit

Every number is a claim from §1 or the engine call given in brackets.

### `l4-basis` — Four principles and a complete basis
- An observable is a Hermitian operator; its eigenvalues are the only results, and each eigenstate gives its result for certain.
- Its eigenvectors can be chosen **orthonormal** (no overlap) and they are **complete** (every state is a sum of them). These are two separate facts.
- Perfectly distinguishable states are orthogonal: $\langle{+z}|{-z}\rangle = 0$, but $\langle{+z}|{+x}\rangle = 1/\sqrt2$.
- A repeated eigenvalue allows non-orthogonal eigenvectors; Gram–Schmidt replaces them by orthonormal ones [`gramSchmidt`].

$$\hat A^\dagger = \hat A,\quad \hat A|a_i\rangle = a_i|a_i\rangle,\quad \langle a_i|a_j\rangle = \delta_{ij},\quad \sum_i \hat P_i = I$$

**The one trap:** thinking a superposition such as $|{+x}\rangle$ falls outside an $S_z$ measurement. Complete means every state is a sum over the basis, not that every state is a basis state.

### `l4-projectors` — A projector asks a yes/no question
- Measured itself, $\hat P_{+z}$ is a yes/no question: results 1 (yes, state $|{+z}\rangle$) and 0 (no, state $|{-z}\rangle$) [`eigenHermitian2(P('+z')).values` = [1, 0]].
- Its range is the up line, but its eigenbasis spans both directions.
- One projector gives one outcome's share; the complete family sums to $I$; $\hat A = \sum_i a_i\hat P_i$ (Lecture 3) adds the result labels.
- As filters: the same filter twice loses nothing ($\hat P^2 = \hat P$); opposite filters pass nothing ($\hat P_+\hat P_- = 0$). Measurement projectors also need $\hat P^\dagger = \hat P$.

$$\hat P_{+z} = \begin{pmatrix}1&0\\0&0\end{pmatrix},\quad \hat P_{-z} = I - \hat P_{+z},\quad \hat P_{+z}^2 = \hat P_{+z},\quad \hat P_{+z}\hat P_{-z} = 0$$

**The one trap:** writing the state after a "no" as $\hat P_{+z}|\psi\rangle = 0$. A "no" leaves $|{-z}\rangle$; the zero vector is not a state.

### `l4-example` — One state, the whole prediction
- $|\psi\rangle = \tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$ is normalized: $\tfrac34 + \tfrac14 = 1$.
- Measuring $S_z$: $+\tfrac{\hbar}{2}$ with probability $\tfrac34$ (then $|{+z}\rangle$), $-\tfrac{\hbar}{2}$ with probability $\tfrac14$ (then $|{-z}\rangle$).
- Repeating the measurement at once repeats the result with probability 1.
- Amplitude $\tfrac{\sqrt3}{2}$, probability $\tfrac34$, result $+\tfrac{\hbar}{2}$ and state $|{+z}\rangle$ are four different things.

$$P(\pm\tfrac{\hbar}{2}) = |\langle{\pm z}|\psi\rangle|^2 = \tfrac34,\ \tfrac14,\qquad |\psi\rangle \to \frac{\hat P_{+z}|\psi\rangle}{\sqrt{3/4}} = |{+z}\rangle$$

**The one trap:** reporting the amplitude $\tfrac{\sqrt3}{2} \approx 0.866$ as the probability. The probability is its square, 0.75.

### `l4-average` — The average that no atom reads
- For the unit-3 state, $\langle S_z\rangle = \tfrac{\hbar}{4}$ (Lecture 3's weighted sum), yet every single reading is $\pm\tfrac{\hbar}{2}$.
- "Repeat" has two meanings: fresh preparations give the 3 : 1 mix; re-measuring one atom repeats its first answer.
- The sandwich gives the same $\tfrac{\hbar}{4}$, in ket form or as row × matrix × column, in any basis.
- $\hat A|\psi\rangle$ is **not** the state after a measurement; it is only a step inside the sandwich.

$$\langle A\rangle = \sum_i a_i P(a_i) = \langle\psi|\hat A|\psi\rangle,\qquad \langle S_z\rangle_\psi = \tfrac{\hbar}{2}\cdot\tfrac34 - \tfrac{\hbar}{2}\cdot\tfrac14 = \tfrac{\hbar}{4}$$

**The one trap:** the notes' own slip, "the mean is zero" for this state. Zero is the mean for $|{+x}\rangle$; here it is $\tfrac{\hbar}{4}$ [`expectation(SZ, psi)` = 0.25].

### `l4-matrices` — Spin matrices built from their outcomes
- Column $j$ of a matrix is where the operator sends basis vector $j$; the eigen-conditions fix $S_z$ at once.
- $S_x$ and $S_y$ come from weighting the outcome projectors by $\pm\tfrac{\hbar}{2}$.
- For $|{+y}\rangle$, the bra conjugates the $i$; otherwise $P_{+y}$ comes out wrong (it would square to zero).
- All three are Hermitian; the subscript names what is measured, the basis names the coordinates (here always $z$).

$$S_x = \tfrac{\hbar}{2}\begin{pmatrix}0&1\\1&0\end{pmatrix},\quad S_y = \tfrac{\hbar}{2}\begin{pmatrix}0&-i\\i&0\end{pmatrix},\quad S_z = \tfrac{\hbar}{2}\begin{pmatrix}1&0\\0&-1\end{pmatrix},\quad S_i = \tfrac{\hbar}{2}\sigma_i$$

**The one trap:** believing a matrix with an $i$ cannot be Hermitian. Hermitian means $A_{ij} = A_{ji}^*$, and $S_y$ satisfies it.

### `l4-eigen` — From a matrix back to outcomes
- Nonzero solutions of $(A - \lambda I)v = 0$ need $\det(A - \lambda I) = 0$; its roots are the possible results.
- Put each root back, solve for the component ratio, normalize, and fix the phase (first component real and positive).
- For $S_x$: $\pm\tfrac{\hbar}{2}$ with $|{\pm x}\rangle = \tfrac{1}{\sqrt2}\binom{1}{\pm1}$, orthogonal and complete.
- For any $\alpha|{+z}\rangle + \beta|{-z}\rangle$: $P(\pm\tfrac{\hbar}{2}) = \tfrac12|\alpha\pm\beta|^2$; for the unit-3 state, 0.933 and 0.067.

$$\det(S_x - \lambda I) = \lambda^2 - \tfrac{\hbar^2}{4} = 0,\qquad \langle{\pm x}|\psi\rangle = \frac{\alpha\pm\beta}{\sqrt2},\qquad \langle S_x\rangle = \langle\psi|\hat S_x|\psi\rangle$$

**The one trap:** normalizing $\binom11$ to $\tfrac12\binom11$. The squared components must add to 1, so each is $1/\sqrt2$.

## 6. Symbol-before-use table

**Reading order assumed:** units in order; within a unit, beat text → caption → reveal, then Try it, review, challenges.
Symbols defined in L1 (ħ, $S_z$, $\sigma$ as a ±1 reading, $|\psi\rangle$, kets, bras, $\langle a|\psi\rangle$, $P(\cdot)$, $\alpha, \beta$,
$i$, $\theta$ as a tilt) are taken as known. Status: OK = defined at or before first use · gloss = a glossary tag suffices ·
**FLAG** = needs the fix shown (fixes marked "done" are already in §1–§3).

| Symbol | First use | Defined where | Status | Fix / note |
|---|---|---|---|---|
| $A$, $\hat A$ | `l4-basis:b1` | same sentence ("an observable $A$ with … operator $\hat A$") | OK | — |
| $\dagger$, Hermitian | `l4-basis:b1` | L3 (link) | gloss | The recap no longer defines them; tags `hermitian`, `adjoint` point to L3's glossary. |
| $a_i$, $|a_i\rangle$ | `l4-basis:b1` | L3 (link) | gloss | Used as L3's eigenvalues/eigenvectors; tag `eigenvalue`. |
| $\delta_{ij}$ | `l4-basis:b4` | same sentence | OK | Tag `kronecker-delta`. |
| $c_i$ | `l4-basis:b4` | same sentence | OK | Reused with the same meaning as $c_1, c_2$ (`l4-eigen:b1`): components in a basis. |
| $\hat P_i$ | `l4-basis:b5` | L3 ("Lecture 3's projectors") | gloss | Tag `projector` (L3-owned). |
| $I$ | `l4-basis:b5` | same sentence ("the identity") | OK | The L4 sheets typeset $\mathbb I$ (pp. 6–8; the text layer flattens it to "I"), L3 writes $1$ (as does Townsend, eq. 2.53). **FLAG (notes)**: the app uses $I$ only. |
| $\lambda_1, \lambda_2$, $|\lambda\rangle$ | `l4-basis:b6` | same sentence | OK | Susskind labels eigenvectors by eigenvalue; said inline. |
| $|v_1\rangle, |v_2\rangle, |e_k\rangle, |w_2\rangle$ | `l4-basis:b8` | question / reveal | OK | — |
| $\hat P_+$, $\hat P_-$ | `l4-projectors:b5` | same sentence | OK (done) | Townsend's names; "his name for $\hat P_{+z}$" added. |
| $Q$ | `l4-projectors:b6` | question | OK | — |
| $p$ in $\hat P|\psi\rangle/\sqrt p$ | `l4-projectors:b7` | same sentence | OK (done) | Was undefined; "with $p$ the probability of 'yes'" added. The notes write $p_i$ (p. 7) and L1 writes $P$: both mean probability. |
| $\langle A\rangle$ | `l4-average:b1` | L3 (link beat names it, defines nothing) | gloss | Tag `expectation` (L1 id, widened by L3). |
| $\langle\sigma_z\rangle$ (caption) | `l4-average:b2` | L1 `sigma-reading` | gloss | Here σ is still L1's ±1 reading; the Pauli matrix $\sigma_z$ arrives in `l4-matrices:b5` with the same eigenvalues, so no clash. |
| $N$ | `l4-average:b7` | same sentence | OK | — |
| $s_i$ | notes p. 12 ($\sum_i s_i P(s_i)$) | never in the notes | **FLAG (notes)** | The app writes $a_i$ throughout and never shows $s_i$. |
| $\hat S_z$ vs $S_z$ | notes p. 13 (convention stated) | `l4-matrices:b1` | **FLAG** | Before unit 5, "$S_z$" means the measured quantity (L1 use). From unit 5 on, write "the matrix $S_z$" whenever the matrix is meant; "measure $S_z$" keeps meaning the quantity. Manual check: the symbol lint cannot tell the two apart. |
| $\leftrightarrow$ | `l4-matrices:b1` | same sentence | OK (done) | "read ↔ as 'is written as'" added; the notes never define it. |
| $m_{ij}$ | `l4-matrices:b1` | same sentence | OK | — |
| $P_{\pm x}, P_{\pm y}$ (matrices) | `l4-matrices:b3`, `b4` | same sentence | OK | Unhatted = matrix, per the `b1` convention. The notes' p. 6 writes $P_{+z}$ unhatted for a matrix too; consistent. |
| $\vec a\cdot\vec\sigma$ (passport) | `l4-matrices:b4` (operator-space passport) | `l4-matrices:b5` | **FLAG** | The passport is derived from the kind, so it shows $\vec\sigma$ one beat early. Options in Q2: debut operator-space at `b5`, or accept with the `b4` caption's pointer. |
| $\sigma_i$ (Pauli) | `l4-matrices:b5` | same sentence | OK | — |
| $a_0$, $\vec a$ | `l4-matrices:b5` caption | same caption | OK | Tag `operator-space`. |
| $A_{ij}$, ${}^*$ | `l4-matrices:b6` | same sentence | OK | Tag `complex-conjugate`. |
| $\lambda$, $c_1, c_2$ | `l4-eigen:b1` | same sentence | OK | **FLAG (notes)**: the notes call the unknown components $a, b$ (p. 17), clashing with the eigenvalues $a_i$ and with $\alpha, \beta$; the app renames them $c_1, c_2$. |
| $\det$ | `l4-eigen:b2` | same sentence (the 2×2 rule) | gloss | Tag `determinant`. |
| $\lambda_\pm$ | `l4-eigen:b2` | same sentence | OK | — |
| $v$, $v^\dagger v$ | challenge `l4-g-order` | same step | OK (done) | "for an unknown nonzero column $v$" added. |
| $\theta$ | `l4-eigen:b7` | same sentence | OK | Same meaning as L1's tilt θ (polar angle from $z$ toward $x$), unlike L7's θ (§ BUILD-LOG L7 note). |

**Counts:** 0 unresolved use-before-definition flags in the §1–§3 text after the four "done" fixes. Open: 2 app flags
($\hat S_z$ vs $S_z$ discipline; the operator-space passport one beat early) and 3 notes-only flags ($I$ vs $\mathbb 1$,
$s_i$, $a, b$), which the app sidesteps.

## 7. Errata

Evidence = engine call (ħ = 1) + an independent numpy check run while drafting, or a direct source comparison.
"Learner-facing" says whether the app shows a `corrections` entry.

| # | Where | What the source says (paraphrased) | Correct statement | Evidence | Learner-facing |
|---|---|---|---|---|---|
| **E1** (known, re-verified and widened) | L4 p. 10, "Specify the ensemble" | Over repeated preparations of the example state the theoretical mean is zero, and a finite sample need not show exactly equal counts. | The mean is $\tfrac{\hbar}{4}$, and a finite sample need not show exactly 3 : 1 counts. **Both halves** of the sentence are leftovers; BUILD-LOG records only the first. | `expectation(SZ, psi)` = 0.25 (numpy 0.25); `prob(KET['+z'], psi)` = 0.75, so "equal counts" is not even the expectation. The same page computes $\tfrac{\hbar}{4}$ two paragraphs earlier. Origin: L3 p. 16 writes $\langle S_z\rangle = 0$ for $|{+x}\rangle$ (`expectation(SZ, KET['+x'])` = 0), the example L3 had not reached when class ended (L3's plan teaches it, badged "taught at the start of Lecture 4"). | Yes: `corrections` entry "L4 p.10" + clue `l4-average:b8` + challenge `l4-a-erratum` + Arcade round (§9). |
| **E2** (known, re-verified) | L4 p. 2 | The four principles are introduced in Chapter 4 of Susskind and Friedman. | Susskind's **Lecture 3**, §3.2 "The Principles". | `sources/susskind/chapter003.md` §3.2 lists Principles 1–4 and says a fifth, about time, is added in Lecture 4; `chapter004.md` states Principle 5 as the time-evolution rule. L4's own p. 21 cites printed pp. 69–74, which is Lecture 3, and p. 7 correctly says the textbook's Principle 5 is time evolution. | Yes: the Ref on `l4-basis:b2` cites §3.2; `corrections` entry "L4 p.2". |
| **E3** (new) | L4 p. 2, "Why Hermitian operators fit" | Orthonormal means every input state can be expanded in the measurement's states. | That sentence defines **complete**, not orthonormal. Orthonormal = unit length and zero mutual overlap; complete = every state is a sum of them. | L4's own p. 3 insists these are two separate properties that must both be stated. A counterexample to "orthonormal ⇒ spans": the single vector $|{+z}\rangle$ is orthonormal but cannot build $|{-z}\rangle$ (`inner(KET['+z'], KET['-z'])` = 0). | Yes: `corrections` entry "L4 p.2 (wording)"; `l4-basis:b4` and the unit's review trap teach the distinction. |
| **E4** (new, typo) | L4 p. 6, section heading | "Projects represent yes/no measurements". | "Projectors represent…". | Visual check of `sheets/p05.png` pair; text layer identical. | No (unit titles are ours). |
| **E5** (new, instructor-facing) | L4 p. 8 vs p. 1 | Part 2 is "5 minutes total" on p. 8 but 10 min in the p. 1 timing table (which sums to 75). | One of the two timings is stale (p. 21 says the longer completeness discussion ate into the margin). | p. 1 table: 15 + 10 + 12 + 18 + 15 + 5 = 75. | No (the app shows no timings). Report to the user only. |
| **E6** (Townsend; L3's) | Townsend §1.4, Example 1.2, p. 17 (closing remark) | For $\tfrac12|{+z}\rangle + \tfrac{\sqrt3}{2}i|{-z}\rangle$ there is a 75 % chance of obtaining $+\tfrac{\hbar}{2}$. | The 75 % belongs to $-\tfrac{\hbar}{2}$; $P(+\tfrac{\hbar}{2}) = \tfrac14$. | Townsend's own Example 1.1 (p. 14) gives 25 % for $+\tfrac{\hbar}{2}$, and the same Example 1.2 computes $\langle S_z\rangle = -\tfrac{\hbar}{4}$. `prob(KET['+z'], vec(0.5, c(0, Math.sqrt(3)/2)))` = 0.25 (numpy 0.25); `expectation(SZ, …)` = −0.25. Checked on a rendering of PDF page 33, not only the OCR. | **L3 owns it** (orchestrator ruling: L3 carries this book-erratum note). L4 cites §1.4 only for the $\sqrt N$ paragraph and shows nothing about Example 1.2; the row stays here as a cross-check for the L3 truth review. |
| **E7** (new, notation) | L4 p. 12 | The final line writes the mean as $\sum_i s_i P(s_i)$. | $s_i$ is never defined; it means the $S_z$ outcomes $\pm\tfrac{\hbar}{2}$ (elsewhere $a_i$). | Symbol audit, §6. | No: the app writes $a_i$. |
| **E8** (new, notation) | L4 p. 17 | The unknown eigenvector is written $\binom ab$. | Not wrong, but $a$ clashes with the eigenvalues $a_i$ used all lecture and with $\alpha, \beta$ on p. 19. | Symbol audit, §6. | No: the app uses $\binom{c_1}{c_2}$. |

**Checked and correct** (no erratum; each is a §1 claim): p. 3 overlaps $0$ and $1/\sqrt2$ · p. 4–5 Gram–Schmidt,
$|w_2\rangle = \tfrac{1}{\sqrt2}\binom01$ · p. 6 eigenvalues 1, 0 of $\hat P_{+z}$ · p. 7 $\sum p_i = 1$ · p. 8 probabilities ¾, ¼ and
the update to $|{+z}\rangle$ · p. 10–12 $\langle S_z\rangle = \tfrac{\hbar}{4}$ both ways · p. 13 $S_z$ · p. 14 $P_{\pm x}$, $S_x$ · p. 15
$P_{\pm y}$, $S_y$ and the checkpoint (lower-right entry ½; without the conjugate it is −½, and that matrix is not
Hermitian and squares to zero: `matmul(M, M)` = 0) · p. 16 Hermiticity · p. 17 $\det(S_x - \lambda I) = \lambda^2 - \hbar^2/4$ ·
p. 18 eigenvectors and orthogonality · p. 19 $\tfrac12(|\alpha+\beta|^2 + |\alpha-\beta|^2) = |\alpha|^2 + |\beta|^2$, which also
holds for complex $\alpha, \beta$ (parallelogram law; checked with $\alpha = \tfrac{1}{\sqrt2}$, $\beta = \tfrac{i}{\sqrt2}$).

**Notes ↔ books ↔ engine conventions (no disagreement, Rosetta only):** the notes' phase rule "first component real and
positive" (p. 18) = `canonicalPhase`, and `eigenHermitian2` lists $\lambda_+$ first, as p. 17 does · $|{+y}\rangle = \tfrac{1}{\sqrt2}\binom1i$
(p. 15) = `KET['+y']` = Susskind's $|i\rangle$; $|{-y}\rangle$ = his $|o\rangle$ · Susskind's $\sigma_i$ = the app's `SIGMA_*`,
readings ±1 · Townsend's $\hat J_z$ (Ch. 2) is $\hat S_z$, renamed in §3.6 p. 94 · Townsend writes $\hat P_\pm$ for $\hat P_{\pm z}$.

## 8. Engine gaps

**Physics engine: no required gap.** Every number in §1–§5 is produced by existing functions: `prob`, `inner`, `norm`,
`norm2`, `normalize`, `apply`, `expectation`, `projector`, `fromSpectrum`, `eigenHermitian2`, `gramSchmidt`, `det2`,
`msub`/`mscale`/`identity`, `matmul`, `matEq`, `isHermitian`, `classify`, `decomposeHermitian`, `operatorInBasis`,
`samePhysicalState`, `canonicalPhase`, `ketAlong`/`tiltXZ`/`spinAlong`/`nDotSigma`, `blochVector`, `blochOfMixture`,
`pPlus`, `benchTheory`, `labStats` (resolver), `binomialStd`. The non-Hermitian $Q$ clue needs no general eigen-solver:
its claims state the two vectors and check `apply(Q, v)` = λv.

**Optional helpers** (would let walkthrough steps, not just end points, be engine-backed):

| Name | Signature | Formula | numpy check |
|---|---|---|---|
| `charPoly2` (`linalg.ts`) | `(M: Mat) => { trace: C; det: C }` | $\det(M - \lambda I) = \lambda^2 - (\operatorname{tr}M)\lambda + \det M$; `trace = M00 + M11`, `det = det2(M)` | `np.poly(M)` returns `[1, -tr, det]`; compare for `SX`, `SY`, `SZ`, `P('+z')`, `[[2,1],[1,2]]`. Lets `l4-eigen:b2` claim the polynomial itself ($\lambda^2 - \tfrac14$). |
| `nullVector2` (`linalg.ts`) | `(M: Mat, lambda: number, eps = 1e-12) => Vec` | take the first row $(r_1, r_2)$ of $M - \lambda I$ with $|r| > \varepsilon$ (else the second row); $v = (r_2, -r_1)$; return `canonicalPhase(normalize(v))` | residual `‖(M − λI)v‖ < 1e-12` and `abs(vdot(v, v_eigh)) = 1` against `np.linalg.eigh`, for `SX` (±½), `SY` (±½), `[[2,1],[1,2]]` (3, 1). Backs the "rows say $c_2 = c_1$" step as the ratio `v[1]/v[0]`. |

**Stage gaps (for D/W, not engine):**

| # | Gap | Where it bites | Proposed fix |
|---|---|---|---|
| S1 | `showPrep` draws an untilted $z$ prep module whatever the source (`scenes/lab/layout.ts`: "never tilted"). | Any bench with source `'+x'` or `'-z'`. | This plan never sets `showPrep` for those sources (captions say "atoms prepared in …"). Optional: derive the prep module's axis and kept sign from the source (`'±x'` → SG$_x$, `'-z'` → SG$_z$ keep −). |
| S2 | `fill-bar` on a two-device bench: confirm it reads plus / landed (as `labStats` does for the centroid), not the raw `plus`. | `l4-example:b6` reveal (must read 0.75, not 0.375), `l4-matrices:b1–b2`. | W to confirm in `resolve.ts`; if raw, add the same `landed` normalization. |
| S3 | `hilbert-plane` `others` arrows are unit length. | `l4-average:b4`, `b6` ($\hat S_z|\psi\rangle$ has length ½). | Caption says "direction of"; optional additive `scale?: number` on an `others` entry. |
| S4 | `operator-space` `{ matrix }` cells: is `sqrt` in `expr.ts`? | `l4-eigen:b7`. | If not, use `{ a0: 0, a: [0.4330127, 0, 0.25] }`. |
| S5 | No "recombining" (modified SG) device for Townsend's identity operator (§2.3, Fig. 2.4a). | Not used in L4 (the Townsend beat uses blocking filters). | None now; relevant for L6 interference. |

**Fixtures to add to `pipeline/make_fixtures.py`** (numpy, independent of the engine): `psi` probabilities (0.75, 0.25),
$\langle S_z\rangle$ = 0.25, $\hat S_z|\psi\rangle$ = (0.4330, −0.25), $P(\pm x|\psi)$ = (0.9330, 0.0670), $\langle S_x\rangle$ = 0.4330;
$P_{\pm x}$, $P_{\pm y}$ and the three spin matrices from `fromSpectrum`; the unconjugated "$P_{+y}$" squaring to 0; $\hat S_z$ in the
$x$ basis; the $x$-basis sandwich (0.25); $P(+x)$ after the $+z$ update (0.5); the Gram–Schmidt residual (0, 0.7071) and the
reversed-order basis; `det2` at λ = ±½, 0; $Q^2 = Q$ with `isHermitian(Q)` false; bench fractions for `[60,'z']`, `[60,'z','z']`, `[60,'x']`;
`binomialStd(1000, 0.75)` = 13.693; the 60° $\hat S_n$ eigenvector = `psi`; `[[2,1],[1,2]]` eigenvalues (3, 1).

## 9. Hooks

### Concept map (`concepts.ts`) — per the orchestrator ruling
| Concept id | Lecture | `unit` | Covered in L4 by | Change |
|---|---|---|---|---|
| `projectors` | **L3** | `l3-projectors` | second pass `l4-projectors`; used in `l4-basis`, `l4-example` | Move from L4 to L3 (ruling). L4 concepts list it in `needs`. |
| `expectation` | **L3** | `l3-spread` | second pass `l4-average`; used in `l4-eigen:b6` | Move from L4 to L3 (ruling). |
| `principles` (new, proposed) | L4 | `l4-basis` | `l4-basis` (four principles, orthonormal vs complete, degeneracy and Gram–Schmidt) | Add: `{ id: 'principles', label: 'Four principles and complete eigenbases', lecture: 'L4', unit: 'l4-basis', needs: ['projectors', 'born-rule'] }`. Without it, L4's first chapters have no node of their own. |
| `spin-matrices` | L4 | `l4-matrices` | `l4-matrices` | Keep; set `unit`. `needs: ['observables', 'complex-amplitudes']` stays. |
| `eigen-problem` | L5 → **L4** | `l4-eigen` | `l4-eigen` | Move by the same first-appearance rule (L4 pp. 17–19; L5 repeats it). `needs: ['spin-matrices']` stays; L5's `basis-change` still needs it. |

`concepts.test.ts` requires that nothing builds on a later lecture: moving `projectors`/`expectation` to L3 and
`eigen-problem` to L4 keeps every edge pointing backwards (`commutators` in L7 needs `projectors`; `bloch-sphere` in L6
needs `expectation`).

### Arcade (one level per unit; every verdict from the engine; `trains: { lecture: 'L4', unit, label }`)
| Unit | Game | Level | Engine check |
|---|---|---|---|
| `l4-basis` | Spot the error | **"An eigenbasis for free"**. Steps: (0) Every vector obeys $I|v\rangle = |v\rangle$, so $\binom10$ and $\tfrac{1}{\sqrt2}\binom11$ are eigenvectors of $I$. (1) Both have length 1. (2) Eigenvectors of a Hermitian operator are always orthogonal, so these two form an orthonormal eigenbasis. (3) So any state can be expanded in them with $c_i = \langle v_i|\psi\rangle$. `wrong: 2`. Why: only eigenvectors with *different* eigenvalues must be orthogonal; here the eigenvalue repeats and $\langle v_1|v_2\rangle = 1/\sqrt2$. Gram–Schmidt repairs it. | `inner(KET['+z'], KET['+x']).re` = 0.7071 ≠ 0 |
| `l4-projectors` | Route the beam | **"The second filter is free"**. `source: '+x'`, target `{ spot: 'plus', fraction: 1/2, label: '½' }`, `maxDevices: 3`, `start: { axes: ['z','x','z'], keep: ['+','+'] }` (reaches ⅛), `solution: { axes: ['z','z','z'], keep: ['+','+'] }`. Hint: a projector applied twice is the same projector. Why: $\hat P_{+z}^2 = \hat P_{+z}$, so once an atom passes the + filter, the same filter passes it again. | `bT(solution)`.plus = 0.5; `bT(start)`.plus = 0.125 |
| `l4-example` | Route the beam | **"One eighth down"**. `source: 'oven'`, target `{ spot: 'minus', fraction: 1/8, label: '⅛' }`, `maxDevices: 2`, `start: { axes: ['z'], keep: [] }` (reaches ½), `solution: { axes: [60, 'z'], keep: ['+'] }`. Hint: first make the state whose $z$ odds are 3 : 1. Why: the 60° magnet's + beam is $\tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$; half the oven passes it, and ¼ of those read −. | `bT(solution)`.minus = 0.125; `bT(start)`.minus = 0.5 |
| `l4-average` | Spot the error | **"The mean is zero"** (erratum E1). Steps: (0) $\tfrac{\sqrt3}{2}|{+z}\rangle + \tfrac12|{-z}\rangle$ gives $+\tfrac{\hbar}{2}$ with probability ¾ and $-\tfrac{\hbar}{2}$ with ¼. (1) The expectation value is $\sum_i a_i P(a_i)$. (2) The two readings sit symmetrically about zero, so the mean is 0. (3) A finite run scatters around this mean. `wrong: 2`. Why: symmetric values are not enough; the weights differ, giving $\tfrac{\hbar}{2}\cdot\tfrac34 - \tfrac{\hbar}{2}\cdot\tfrac14 = \tfrac{\hbar}{4}$. | `expectation(SZ, psi)` = 0.25 |
| `l4-matrices` | Spot the error | **"The forgotten conjugate"**. Steps: (0) $|{+y}\rangle \leftrightarrow \tfrac{1}{\sqrt2}\binom1i$. (1) So $\langle{+y}| \leftrightarrow \tfrac{1}{\sqrt2}(1\;\;i)$. (2) Then $P_{+y} = \tfrac12\begin{pmatrix}1&i\\i&-1\end{pmatrix}$. (3) Finally $S_y = \tfrac{\hbar}{2}(P_{+y} - P_{-y})$. `wrong: 1`. Why: the bra conjugates, $\langle{+y}| \leftrightarrow \tfrac{1}{\sqrt2}(1\;\;-i)$; without it "$P_{+y}$" is not Hermitian and squares to zero. | `classify(M).projector` = false; `matmul(M, M)` = 0 |
| `l4-eigen` | Spot the error | **"Half is not normal"**. Steps: (0) $\det(S_x - \lambda I) = \lambda^2 - \tfrac{\hbar^2}{4}$, so $\lambda = \pm\tfrac{\hbar}{2}$. (1) For $+\tfrac{\hbar}{2}$ the rows give $c_2 = c_1$. (2) Normalizing, $c_1 = c_2 = \tfrac12$. (3) So $|{+x}\rangle \leftrightarrow \tfrac12\binom11$. `wrong: 2`. Why: $|c_1|^2 + |c_2|^2 = 1$ needs $c_1 = 1/\sqrt2$; ½ and ½ give total probability ½. | `norm2(vec(0.5, 0.5))` = 0.5 ≠ 1 |

Bloch golf: no L4 level. L4 has no rotations (L6–L7).

### Other hooks
- **Corrections box** (`Lecture.corrections`): E1 (p. 10), E2 (p. 2), E3 (p. 2 wording).
- **Rosetta line** (once, `l4-basis:b2` caption or the lecture page): lecture $|{\pm z}\rangle$ = L3 $|{\uparrow}\rangle, |{\downarrow}\rangle$ = Susskind $|u\rangle, |d\rangle$; $|{\pm x}\rangle$ = $|r\rangle, |l\rangle$; $|{\pm y}\rangle$ = $|i\rangle, |o\rangle$; Susskind $\sigma_i$ = $\tfrac{2}{\hbar}S_i$; Townsend $\hat J_z$ = $\hat S_z$, $\hat P_\pm$ = $\hat P_{\pm z}$.
- **Forward links:** `l4-example:b7` → L6 Bloch ball (mixtures) · `l4-eigen:b7` → L5–L6 tilted axes · `l4-average` → L7 spreads $(\Delta S_i)^2$ (variance deliberately absent here).
- **Backward links:** `l4-example:b6` → L1 `l1-average:b5` (the 60° erratum) and `l1-average:b6` ($|{+n}\rangle$) · `l4-eigen:b8` → L1 `l1-vectors:b5` (global phase).

## 10. Fidelity notes per stage kind

L4 uses four kinds, counted by each beat's own stage: `lab-r3` 14 beats, `hilbert-plane` 22, `operator-space` 9,
`bloch-ball` 1 (= 46).
`bloch` and `hopf` are not used: the notes rule out Bloch-sphere construction here (p. 21), and L4 has no phases to
lift. The L1 fidelity items (`P2-L1-story.md` §2) still apply; below are only the items L4 adds or leans on. New ids are
proposed for `content/fidelity.ts`.

### `lab-r3`
- **Gets right (exact):** every deposit fraction, blocked fraction and centroid is `benchTheory`/`labStats`. The centroid
  is $\langle\sigma_n\rangle = 2\langle S_n\rangle/\hbar$ exactly, so the tick at ½ in `l4-average:b2` *is* $\langle S_z\rangle = \tfrac{\hbar}{4}$ (new item
  `lab-centroid-is-mean`). A blocked or diverted beam is exactly the "no" branch of a projector (`lab-filter-is-projector`).
- **Distorts (misleading on purpose):**
  - `lab-prep-tilted` (new): the 60° magnet is *our* way to make $|\psi\rangle$. The notes never say how the state is prepared,
    and tilted measurements are taught later (L4 p. 1). It is a preparation device here, not a lesson in tilted axes.
  - `lab-no-plate` (new): with `openOther`, the "no" atoms land on their own plate. That shows where they went; a yes/no
    measurement does not have to destroy them, and they are in $|{-z}\rangle$ until they hit the plate.
  - L1's `lab-both-paths` matters in `l4-projectors:b3`: the atom is not "on the no path" until something records it.

### `hilbert-plane`
- **Gets right (exact):** for real states, the shadow on a basis arrow is $\hat P_i|\psi\rangle$, and the bar is
  $\langle\psi|\hat P_i|\psi\rangle$. Right angle = orthogonal = perfectly distinguishable. The Gram–Schmidt residual is
  literally the part of $|v_2\rangle$ left after its shadow on $|v_1\rangle$ is removed.
- **Distorts:**
  - `plane-unit-arrows` (new, schematic): every arrow is drawn with length 1. $\hat S_z|\psi\rangle$ in `l4-average:b4` has
    length ½ (`norm` = 0.5) and is shown only as a direction.
  - Never draw a complex state by the magnitudes of its amplitudes as a "stand-in": that keeps the $z$ odds but breaks the
    others (for $\tfrac12|{+z}\rangle + \tfrac{\sqrt3}{2}i|{-z}\rangle$, $P(+y)$ = **0.9330** vs **0.5** for the real stand-in,
    `prob(KET['+y'], …)`). An earlier draft of `l4-example:b5` did this; it was removed.
  - L1's `plane-half-angle` still holds: $|\psi\rangle$ sits at 30° here but belongs to a 60° magnet.
  - Complex states ($|{\pm y}\rangle$, the $i$ version of an eigenvector in `l4-eigen:b8`) cannot appear; the unit uses
    `operator-space` or words for them.

### `operator-space` (first used in L4)
- **Gets right (exact):** for a Hermitian 2×2 matrix written in the $z$ basis, the arrow is $\vec a$ with
  $a_k = \tfrac12\operatorname{tr}(M\sigma_k)$ and the gauge is $a_0 = \tfrac12\operatorname{tr}M$ (`decomposeHermitian`). The eigenvalues are
  $a_0 \pm |\vec a|$ and the ends of the eigen-axis are the two definite states (`eigenHermitian2`). For $\hat S_x, \hat S_y, \hat S_z$ the
  arrow points along the lab axis of the component, length ½ (ħ = 1).
- **Distorts:**
  - L1's `operator-4d` (schematic): four dimensions drawn as a 3D arrow plus a gauge.
  - `operator-basis-free` (new, misleading if misread): the picture shows the *operator*, not a table of entries. In
    `l4-matrices:b8` the arrow for $\hat S_z$ stays along $z$ even though its entries in the $x$ basis match our $S_x$.
    Feeding that $x$-basis table to `decompose` as if it were a $z$-basis matrix would wrongly draw an arrow along $x$; the
    resolver must only ever receive $z$-basis matrices.
  - `operator-arrow-not-state` (new): the arrow along $y$ is the operator $\hat S_y$, not the state $|{+y}\rangle$; states sit only at
    the ends of the eigen-axis on the ghost sphere.
  - Passport timing: its title shows $\vec a\cdot\vec\sigma$ one beat before $\vec\sigma$ is defined (§6, Q2).

### `bloch-ball` (one clue, `l4-example:b7`)
- **Gets right (exact):** $|\psi\rangle$ sits on the surface at $\vec r = (0.866, 0, 0.5)$ (`blochVector`) and the ¾ : ¼ mixture
  inside at $(0, 0, 0.5)$ (`blochOfMixture`); $P(+) = \tfrac{1+\hat n\cdot\vec r}{2}$ gives 0.75 for both along $z$ and 0.933 vs 0.5 along $x$.
- **Distorts:** L1's `ball-inside-not-partly-up` and the half-angle doubling (the point is at 60°, the plane arrow at 30°).
  Badged `beyondLecture`: mixtures are L6 material.

## 11. Questions for the user

**Changes applied from the orchestrator's ruling (2026-09-27; no user question needed):**
- L3's plan keeps L3 pp. 14–17. `l4-projectors` and `l4-average` are now second passes: each opens with a one-sentence
  link to `l3-projectors` / `l3-spread` and defines nothing; the rest teaches only L4's additions (§0 scope rule).
- Removed from L4: the derivation of $\langle A\rangle = \langle\psi|\hat A|\psi\rangle$ (old `l4-average:b4`), the definitions of
  the projector and of $\langle A\rangle$ (old `l4-projectors:b1`, `l4-average:b1`), the re-worked Townsend Examples 1.1–1.2
  (old `l4-example:b5`, `l4-average:b7`, challenge `l4-e-townsend`) and the `plane-real-stand-in` fidelity item. Added: the
  sandwich in matrix form (`l4-average:b5`, Townsend §2.6), the projector-as-matrix update (`l4-example:b5`, Townsend §2.4)
  and challenge `l4-e-then-x`. `l4-average:b7` ($\sqrt N$) and `l4-a-scatter` are kept only if L3 does not use that remark.
- Concept map: `projectors` → L3 `l3-projectors`, `expectation` → L3 `l3-spread`; L4 keeps `spin-matrices`, takes
  `eigen-problem` from L5 by the same rule, and proposes a new `principles` node for `l4-basis` (§9).
- Glossary: L3-owned terms (projector, completeness, idempotent, expectation value, variance, Hermitian, adjoint,
  eigenvalue/eigenvector, matrix entry, state after measurement) are tagged, not added (§4).
- Erratum E6 (Townsend p. 17) is L3's; L4 keeps it only as a cross-check row (§7).
- For the L5 planner: L4 pp. 15–19 ($S_y$, Pauli, Hermiticity, the $S_x$ eigenvalue problem) are L4's; L5, which restarts
  there (L5 p. 2), should make them a second pass.

**Q1. Is a 60° preparation magnet acceptable on the L4 stage?** It is the only honest way to fire atoms in $|\psi\rangle$ at a
real plate (deposits, centroid, finite-sample band), and it links back to L1's 60° erratum. But L4 p. 1 defers tilted
axes. *Recommendation:* keep it, with `lab-prep-tilted` in the fidelity drawer and the first appearance (`l4-example:b6`)
badged "beyond the lecture". The fallback is `hilbert-plane` only for `l4-average:b1–b3`, `b7–b8` and `l4-eigen:b6`, which
loses the lab statistics.

**Q2. Should `operator-space` first appear in L4, or earlier in L3 (operators)?** L4 is the first lecture with the Pauli
matrices that its passport ($\vec a\cdot\vec\sigma$) needs. Using it at `l4-matrices:b4` shows that passport one beat before
`b5` defines $\vec\sigma$. *Recommendation:* first use in L4, but let `b4` keep `b3`'s `hilbert-plane` stage (caption:
"the real plane cannot draw $|{\pm y}\rangle$; their amplitudes are complex"), so the first operator-space frame is `b5`,
where the caption explains it. If P-L3 uses operator-space first, `b4` can stay as written.

**Q3. The 3×3 Gram–Schmidt homework (L4 p. 5):** can you share the problem? Without it, no challenge is authored (§3).
