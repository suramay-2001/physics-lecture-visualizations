# P-Q9-story — Q9 "Parts of a whole: reduced states, entropy, Schmidt" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q6-story.md` (two tracks; the 13 sections of
`skills/03-chapter-plan`), with the two standing gates: every derivation list, in both tracks, steps the stage through
≥ 2 distinct views (W-709 #7), and every new space or notation gets exactly one notation beat (W-709 #8). Map entry:
`P-709-remap-L1L7.md` §1.1 (L7 §I.2–§I.4), §1.3 (HW2 P2(d), P7(e)), §2 Q9, §4 rows Q9 D1–D12, §5, §6. Rulings:
`qc709-remap.md` (#9, #10, **#11 trace distance and fidelity are a Bergou-only unit here**, #12 HW2 FULL, and the review
rulings), `qc709-Q6Q7.md` (#2, #7, build order). Planned together with `P-Q8-story.md`, whose ρ, Tr, Bloch ball, recipes
and running mixture this chapter uses.

**Sources read.**
- Notes L7 pp. 38–40 (text; the render of p. 40 checked by eye against the text).
- HW2 P2(d) and P7(e), worked in full here (ruling 12).
- Bergou, as the re-map cites it (printed pages; read): §2.1 pp. 16–17, Eqs. 2.3–2.10 (Eq. 2.9's Tr is $\mathrm{Tr}_B$,
  erratum B2); §2.5 pp. 24–25, Eqs. 2.47–2.52; §2.6 pp. 25–26, Eqs. 2.53–2.56 (Eq. 2.56's $U_B|u_k\rangle$ is $U_B|v_k\rangle$,
  erratum B5); §2.7 pp. 26–28, Eqs. 2.57–2.62 (p. 26's trace-norm recipe, erratum B4); §3.7.1 p. 47, Eq. 3.41; Problem 2.5
  (⚑, p. 29).
- N&C (cited, equations checked): §2.4.3 pp. 105–107; §2.5 pp. 109–111, Theorem 2.7 p. 109; §9.2.1 p. 404, Eq. 9.20;
  §9.2.2 p. 409, Eq. 9.53; p. 415, Eqs. 9.97–9.99; §11.3 p. 510. Axler 7E p. 270 (the SVD; a Formal citation, not re-read).
- Ownership (re-map §2.2): Q9 owns the partial trace, $\rho_A$, S(ρ) (its definition moves here from old Q10; proofs stay
  in Part X), E named, the Schmidt form and rank, purification, the SVD (Formal), trace distance and fidelity. Q8 owns ρ,
  Tr, the ball and the recipes; Q6 the Bell basis, β_xy, the grid and the product test; Q7 GHZ; Q4 ⊗ on operators.
  Q12 develops E as a measure; Q14 uses the trace norm; Q10 defines separable mixtures.

**Evidence.** Computed twice, with Q8 (`q89plan-engine.ts` on main c4f6fb7; `q89plan-numpy.py`, independent: partial
traces by `einsum` on reshaped tensors, Schmidt by numpy's SVD of the reshaped ket, entropy from `eigvalsh` and the binary
formula, fidelity by `scipy.linalg.sqrtm`, trace distance from eigenvalues, readings of B by explicit projectors, the
purification by Bergou Eq. 2.55 written out). Result (`q89plan-compare.py`): **500 numbers under 188 keys** for both
chapters agree to 6 decimals, except Q8's `q8TrineUUnitary` (an engine bug, `P-Q8-story.md` §9.1). No Q9 key differs.
The numpy file runs byte-identically twice.

**Conventions** (Q6's and Q8's, plus these).
- **A and B.** Engine q0 = qubit 1 = A (the left factor); q1 = B. The notes write ρ(1) and $\mathrm{Tr}_2$ (p. 38) and switch
  to A, B on p. 40; we write $\rho_A$, $\mathrm{Tr}_B$ from the first beat, with one Rosetta line. The three-qubit GHZ beat
  keeps the notes' qubit numbers ($\rho_{12} = \mathrm{Tr}_3$). Two-qubit stages carry `labels:'A-B'`, except that beat.
- **Bell names (ruling 9).** First Bell name in the chapter: "$\Psi^-$ (notes, N&C: $\beta_{11}$; Bergou: $\Phi_-$)", in
  `q9-partial-trace:b3`. The HW2 P2(d) beat and its derivation use $\beta_{xy}$, as ruling 9 allows for HW2 P2 material.
- **Running example.** The pair $P = (|00\rangle + |{+}\rangle|1\rangle)/\sqrt2$ (circuit `C_PUR`). Its $\rho_A$ is Unit 8.4's
  mixture $\tfrac12(|0\rangle\langle0| + |{+}\rangle\langle{+}|)$, its Schmidt basis on A is Unit 8.6's $|u_\pm\rangle$, its
  Schmidt basis on B is $|{\pm}\rangle$, and it is the purification of that mixture. Q8 and Q9 share one set of numbers.
- **Entropy units.** $\log_2$, bits; $0\log_20 = 0$. **Fidelity** is the root fidelity (Bergou, N&C, engine `fidelity`).
- **Numbers, text, phases, claim keys** as Q8 (`q9…` in `Q9.values.ts`; d(V.key, n) everywhere; no percent; TeX only inside
  `$…$`; no plan ids in learner text). Units: 9.1 `q9-partial-trace`, 9.2 `q9-same-part`, 9.3 `q9-entropy`, 9.4
  `q9-schmidt`, 9.5 `q9-purification`, 9.6 `q9-distance`. **Unit 9.6 is all [B]** (ruling 11).

**Stage shorthand.** Q8's forms (`amp`, `mx`, `tq`, `tqR`, `ball`, `split`, `out`, `mix`, `pa`, `prod`, `lin`) carry over.
New here:

| Shorthand | Expands to | Needs |
|---|---|---|
| `tqX(K, keep, f)` | `{kind:'two-qubit', source:{reduce:{ket:K, keep}}, arrows:'reduced', grid:'T', ...f}` | two-qubit |
| `tqF(deg, f)` | `{kind:'two-qubit', source:{family:'cos-sin', thetaDeg:deg}, arrows:'reduced', grid:'T', labels:'A-B', ...f}` | two-qubit |
| `hp(f)` | `{kind:'hilbert-plane', shot:'H-FLAT', ...f}` | — |
| field `partialTrace:'A' \| 'B'` | v1 (B traced out → $\rho_A$; A traced out → $\rho_B$) | v1 |
| field `partialTrace:{keep:[0,1]}` | trace out the other qubits of a 3-qubit ρ | matrix-v2 |
| field `spectrum:'bars' \| 'entropy'` | eigenvalue bars; 'entropy' adds $-\lambda\log_2\lambda$ and an S readout | matrix-v2 |

In Q9, `tq(S, f)` means Q8's `tq` with `labels:'A-B'` unless the beat says otherwise.

| Name | Source | Value |
|---|---|---|
| `PROD` | `{circuit:C_PROD, upTo:1}` (Q4, Q6) | $\psi_1\otimes\|{+}\rangle$, $\psi_1 = 0.866\|0\rangle + 0.5\|1\rangle$ |
| `PSI2` | `{circuit:C_COPY, upTo:2}` (Q4, Q6; HW2's $\Psi_2$) | $(\sqrt3\|00\rangle + \|11\rangle)/2$ |
| `PP` | `{circuit:C_PUR, upTo:2}` (new) | $P = 0.707\|00\rangle + 0.5\|01\rangle + 0.5\|11\rangle$ |
| `SING` | `{bell:'Psi-'}` | $\Psi^-$ |
| `GHZ` | `{bell:'000+111'}` | Q7's GHZ |
| `COIN` | `mix([1/2, {ket:'01'}], [1/2, {ket:'10'}])` (notes p. 39) | $\rho_c$ |
| `ZX`, `N`, `bZX`, `bU` | as Q8 | — |
| `HALF4` | `mix([1/4, {ket:'00'}], [1/4, {ket:'01'}], [1/4, {ket:'10'}], [1/4, {ket:'11'}])` | $\tfrac14I_4$ |
| `RHALF(w)` | `mix([w, {ket:'0'}], [1−w, {ket:'1'}])`; the sweep is `w:{from:1/2, to:1}` with `1−w` as `{from:1/2, to:0}` | $\|\mathbf r\| = 2w - 1$ |

**Circuits** (gate shorthand as Q5). All carry `wires:['A','B']` except the GHZ ones (Q7's, `['1','2','3']`).

| Name | qubits · init | columns | state after column k |
|---|---|---|---|
| `C_PROD` (Q4) | 2 · `'00'` | `[g(Ry,0,π/3), g(H,1)]` | k = 1: $\psi_1\otimes\|{+}\rangle$ |
| `C_COPY` (Q4) | 2 · `'00'` | `[g(Ry,0,π/3)] [cx(0,1)]` | k = 2: $\Psi_2$ |
| `C_PUR` (new) | 2 · `'00'` | `[g(H,1)] [g(H,0) with controls:[1]]` (a controlled H) | k = 2: $(\|00\rangle + \|{+}\rangle\|1\rangle)/\sqrt2$ |

## 0. Chapter map

Q9 answers the map's question: **"If two particles share one pure state, what does each look like alone, and how much is
hidden in the link?"** It closes Part III.

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q9-partial-trace` | Looking at one part: the partial trace | What state does one qubit of a pair have on its own? | notes L7 pp. 38–39; Bergou §2.1 pp. 16–17, Eqs. 2.3–2.10; N&C §2.4.3 pp. 105–107; HW2 P2(d), P7(e) | — | Q8 ρ, Tr, the box; Q6 Bell states, grid; Q4 $A\otimes I$ |
| 2 | `q9-same-part` | Same part, different whole | Can two different pairs look identical from either side? | notes L7 p. 39, Eq. 2.22 | `l6-mixture` | Q6 grid |
| 3 | `q9-entropy` | Entropy: how mixed is a state? | How many bits are unknown in a mixed state, and in one half of a pure pair? | notes L7 p. 39, Eq. 2.23; Bergou §3.7.1 p. 47, Eq. 3.41; N&C §11.3 p. 510 | — | Q8 purity, the ball |
| 4 | `q9-schmidt` | The Schmidt form of a pair | Is there a best way to write a pure pair, one term per shared chance? | notes L7 p. 40, Eqs. 2.24–2.28; Bergou §2.5 pp. 24–25; N&C Thm 2.7 p. 109; Axler 7E p. 270 | — | Q6 product test, singular values; Q8 $\|u_\pm\rangle$ |
| 5 | `q9-purification` | Every mixture is part of something pure | Can every mixed state be one half of a pure pair? | notes L7 p. 40; Bergou §2.6 pp. 25–26, Eqs. 2.53–2.56; N&C §2.5 p. 110 | — | Q8 recipes, unitary freedom |
| 6 | `q9-distance` [B] | How far apart are two states? | How well can one reading tell two states apart, and how do we measure their overlap? | Bergou §2.7 pp. 26–28, Eqs. 2.57–2.62, ⚑ P2.5; N&C §9.2 pp. 403–416 | — | Q8 ball; Q1 overlaps |

**No moves against the map.** One choice of example (§12 Q1): the running pair P is Unit 8.4's mixture purified, so the
chapter's Schmidt, entropy and purification numbers are Q8's numbers.

**Outcomes** (Ground wording):
- Compute a reduced density matrix by tracing out a partner, block by block.
- Show that every Bell state leaves each qubit in $\tfrac12I$, and that GHZ with one qubit traced out is the box of Unit 8.1.
- Explain why the singlet and a coin-made anti-aligned pair look the same from each side but differ in their grids.
- Compute the entropy of a state from its eigenvalues: 0 for pure, 1 bit for a fair coin, $\log_2d$ at most.
- Write a pure pair in Schmidt form, read off its rank and weights, and see that both halves share their eigenvalues.
- Build a purification of a mixture, and relate two purifications by a gate on the partner.
- Compute the trace distance and the fidelity of two qubit states, and link them for pure states.

**Prerequisites** (concepts): Q8 `qc-density-matrix`, `qc-trace-rule`, `qc-mixed-states`, `qc-bloch-ball`, `qc-recipes`;
Q7 `qc-ghz`; Q6 `qc-bell-basis`, `qc-entanglement`, `qc-operator-tensor`; Q3 `qc-spectral`; Q1 `qc-inner-product`. Reused
glossary: `qc-density-matrix`, `qc-trace`, `qc-coherence`, `qc-purity`, `qc-mixed-state`, `qc-pure-state`, `qc-ensemble`,
`qc-bloch-ball`, `qc-maximally-mixed`, `qc-unitary-freedom` (Q8); `qc-ghz` (Q7); `qc-bell-basis`, `qc-beta-xy`,
`qc-singlet`, `qc-correlation-grid`, `qc-product-state`, `qc-entangled`, `qc-factoring-test` (Q6); `qc-tensor-operator`
(Q4); `qc-eigenvalue`, `qc-spectral-representation` (Q3). 448 twin: `l6-mixture`.

**Openers and films.** The Part III opener is Q8's. One Motion Canvas film is planned and deferred (§10).

## 1. Story beats per unit

Kinds per unit (derivation views use only these): `q9-partial-trace` matrix, two-qubit, amplitudes · `q9-same-part`
matrix, two-qubit · `q9-entropy` matrix, two-qubit, bloch-ball · `q9-schmidt` amplitudes, matrix, two-qubit ·
`q9-purification` matrix, bloch-ball, amplitudes · `q9-distance` bloch-ball, matrix, hilbert-plane. Fidelity items used:
the `matrix` items (`qc-matrix-reduced-arrows` above all), the `two-qubit` items, `qc-amp-engine`, 448's
`ball-born-inside`, `ball-many-recipes`, `plane-shadow-born`, `plane-real-slice`.

### Unit `q9-partial-trace` — Looking at one part: the partial trace

**`q9-partial-trace:b1` [L] · notation beat, `introduces: ['qc-reduced-density-matrix', 'qc-partial-trace']`** (one qubit's own ρ; D1)
- **G:** "Two qubits, A and B, share a state $\rho$. We want the averages of readings on A alone: an operator O on A, with nothing done to B. Adding up over B's two basis states leaves a 2 × 2 matrix, $\rho_A = \mathrm{Tr}_B\,\rho$. This sum is the [[qc-partial-trace|partial trace]], and $\rho_A$ is A's [[qc-reduced-density-matrix|reduced density matrix]]."
- **F:** "For an operator O on A alone, $\langle O\otimes I\rangle = \mathrm{Tr}\big(\rho\,(O\otimes I)\big) = \sum_a\langle a|\big(\sum_b\langle b|_B\,\rho\,|b\rangle_B\big)O|a\rangle$ (notes p. 38; Bergou Eqs. 2.3–2.5). So $\langle O\otimes I\rangle = \mathrm{Tr}(\rho_AO)$, with the [[qc-reduced-density-matrix|reduced density matrix]] $\rho_A = \mathrm{Tr}_B\,\rho$, the [[qc-partial-trace|partial trace]] over B. Rosetta: the notes write $\rho(1) = \mathrm{Tr}_2\,\rho$."
- **Cap:** G "a product pair: A alone is still $\psi_1$" · F "$\rho_A = |\psi_1\rangle\langle\psi_1|$ for $\psi_1\otimes|{+}\rangle$"
- **Stage:** `split( mx(out(PROD), {blocks:2, partialTrace:'B'}) / tq(PROD) )` — needs: two-qubit.
- **Claims:** `q9ProdRA` → [[0.75, 0.433], [0.433, 0.25]] · `q9ProdRAGap` → 0 · `q9ProdExpZ1` → 0.5.
- **Terms:** `qc-tensor-operator` (Q4), `qc-density-matrix` (Q8).
- **Fidelity:** `qc-matrix-reduced-arrows`.

**`q9-partial-trace:b2` [L]** (block by block)
- **G:** "Picture $\rho$ as a 2 × 2 grid of blocks, one block for each pair of A's labels. Each entry of $\rho_A$ is the trace of one block. Try $(\sqrt3|00\rangle + |11\rangle)/2$ from Chapter Q6. Its corners of 0.433 sit off their blocks' diagonals and drop out, so $\rho_A = \mathrm{diag}(0.75, 0.25)$."
- **F:** "$(\rho_A)_{aa'} = \sum_b\rho_{ab,a'b}$: each entry is the trace of the $(a, a')$ block (notes p. 38; Bergou Eq. 2.4). For $\Psi_2 = (\sqrt3|00\rangle + |11\rangle)/2$ the coherence $\rho_{00,11} = 0.433$ lies off its block's diagonal, so $\rho_A = \mathrm{diag}(0.75, 0.25)$: mixed, though $\Psi_2$ is pure."
- **Cap:** G "block traces 0.75 and 0.25; the 0.433 corners drop out" · F "$\rho_A = \mathrm{diag}(0.75, 0.25)$"
- **Stage:** `mx(out(PSI2), {blocks:2, partialTrace:'B', highlight:[[0,3],[3,0]]})`.
- **Claims:** `q9Psi2Rho` → corners 0.433 · `q9Psi2RA` → diag(0.75, 0.25).

**`q9-partial-trace:b3` [L]** (the singlet's part is a fair coin; D2)
- **G:** "Now the singlet, $\Psi^- = (|01\rangle - |10\rangle)/\sqrt2$, which the notes call $\beta_{11}$. Its $\rho$ has ½ in two diagonal places and −½ in two corners. The diagonal blocks each have trace ½, and the corners drop out. So $\rho_A = \tfrac12I$: qubit A alone is a fair coin along every axis, though the pair is pure."
- **F:** "For $\Psi^-$ (notes, N&C: $\beta_{11}$; Bergou: $\Phi_-$), $\rho$ has ½ at (01, 01) and (10, 10) and −½ at (01, 10) and (10, 01) (notes p. 38). Tracing out B gives $\rho_A = \tfrac12I$ (notes p. 39): particle A is unpolarized, $\mathbf r_A = 0$, though the pair is in a definite pure state."
- **Cap:** G "the singlet: both arrows zero; grid −1, −1, −1" · F "$\rho_A = \tfrac12I$, $T = -I_3$"
- **Stage:** `split( mx(out(SING), {blocks:2, partialTrace:'B'}) / tq(SING) )` — needs: two-qubit.
- **Claims:** `q9SingRho` · `q9SingRA` → ½I · `q9SingArrows` → 0, 0 · `q9SingGrid` → diag(−1, −1, −1).
- **Terms:** `qc-singlet` (Q6). **Fidelity:** `qc-tq-local-arrows`.

**`q9-partial-trace:b4` [B]** (all four Bell states: HW2 P2(d); D5)
- **G:** "Homework 2, Problem 2(d) asks for $\rho_A$ of each Bell state $\beta_{xy}$. All four give $\tfrac12I$. So no reading of qubit A alone can tell them apart. Yet Unit 6.5's circuit tells them apart perfectly. There is no conflict: that circuit acts on both qubits, and the four states differ only in their grids."
- **F:** "HW2 P2(d): $\mathrm{Tr}_2|\beta_{xy}\rangle\langle\beta_{xy}| = \tfrac12I$ for all four, so every one-qubit statistic $\mathrm{Tr}(\rho_AO)$ is the same. The Bell measurement is a joint measurement; the states differ only in $T = \mathrm{diag}\big((-1)^x, -(-1)^{x+y}, (-1)^y\big)$, which no local reading sees."
- **Cap:** G "four Bell states: the same zero arrows, four different grids" · F "$\rho_A = \tfrac12I$ for every $\beta_{xy}$"
- **Stage:** `tq({bell:'Phi-'})` — needs: two-qubit.
- **Claims:** `q9BellRA` → ½I four times · `q9BellRAGap` → 0, 0, 0, 0 · `q9BellGridDiag` → (1, −1, 1), (1, 1, −1), (−1, 1, 1), (−1, −1, −1) for $\beta_{00}, \beta_{01}, \beta_{10}, \beta_{11}$.
- **Terms:** `qc-beta-xy` (Q6).

**`q9-partial-trace:b5` [B]** (GHZ minus one qubit: HW2 P7(e); D4)
- **G:** "Homework 2, Problem 7(e) traces qubit 3 out of GHZ. Only the terms that agree on qubit 3 survive. The result is $\tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$: the box of Unit 8.1, now obtained without any reading. It is a mixture of two products, so qubits 1 and 2 share no entanglement."
- **F:** "HW2 P7(e): $\rho_{12} = \mathrm{Tr}_3|\mathrm{GHZ}\rangle\langle\mathrm{GHZ}| = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$, the box of Unit 8.1 (notes p. 35). It is a convex mixture of products, so the remaining pair is not entangled (Chapter Q10 names such states): GHZ entanglement does not survive the loss of one qubit."
- **Cap:** G "trace out qubit 3: the GHZ box again" · F "$T_{zz} = 1$, $T_{xx} = T_{yy} = 0$"
- **Stage:** `split( mx(out(GHZ), {blocks:4, partialTrace:{keep:[0,1]}}) / tqX(GHZ, [0,1], {labels:'q1-q2'}) )` — needs: matrix-v2, two-qubit.
- **Claims:** `q9GhzR12` → diag(0.5, 0, 0, 0.5) · `q9GhzR12Grid` → $T_{zz}$ = 1, others 0 · `q9GhzR12Arrows` → 0, 0.
- **Terms:** `qc-ghz` (Q7).

**`q9-partial-trace:b6` [C]** (the same average, different parts)
- **Q G:** "The product $\psi_1\otimes|+\rangle$ and the pair $(\sqrt3|00\rangle + |11\rangle)/2$ both give $\langle Z_A\rangle = 0.5$. Do they leave qubit A in the same state?"
- **Q F:** "Compare $\rho_A$ for $\psi_1\otimes|{+}\rangle$ and for $\Psi_2 = (\sqrt3|00\rangle + |11\rangle)/2$."
- **Reveal G:** "No. The product leaves A pure, with corners of 0.433. The entangled pair leaves A mixed, with no corners. An x reading on A tells them apart: 0.866 against 0."
- **Reveal F:** "$\rho_A = |\psi_1\rangle\langle\psi_1|$ (purity 1) against $\mathrm{diag}(0.75, 0.25)$ (purity 0.625): equal diagonals, different coherences, so $\langle X_A\rangle$ is 0.866 against 0."
- **Reveal cap:** G/F "A's corners: 0.433 against 0"
- **Stage:** question `amp(PSI2, {mode:'probability'})` (chances only; the coherences are not shown); reveal `mx(out(PSI2), {blocks:2, partialTrace:'B'})`.
- **Claims:** `q9ProdExpZ1` → 0.5 · `q9Psi2ExpZ1` → 0.5 · `q9ProdExpX1` → 0.866 · `q9Psi2ExpX1` → 0 · `q9ProdRAPur` → 1 · `q9Psi2Pur` → 0.625.

### Unit `q9-same-part` — Same part, different whole

**`q9-same-part:b1` [L]** (a coin-made copy of the singlet; D3)
- **G:** "Here is a classical copy of the singlet: a coin chooses $|01\rangle$ or $|10\rangle$, half each. The two spins always point opposite ways along z. Trace out B and you get $\rho_A = \tfrac12I$, exactly as for the singlet. Qubit A alone cannot tell the two pairs apart, and neither can B."
- **F:** "The mixture $\rho_c = \tfrac12(|01\rangle\langle01| + |10\rangle\langle10|)$ (notes p. 39) has $\mathrm{Tr}_B\,\rho_c = \tfrac12I$, the singlet's $\rho_A$, and likewise for B. Looking at one particle can never distinguish the entangled pure state from this classical mixture."
- **Cap:** G "the coin pair: $\rho_A = \tfrac12I$ again" · F "$\mathrm{Tr}_B\,\rho_c = \mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-| = \tfrac12I$"
- **Stage:** `split( mx(COIN, {blocks:2, partialTrace:'B'}) / tqR(COIN, {labels:'A-B'}) )` — needs: two-qubit.
- **Claims:** `q9CoinRAGap` → 0 · `q9SingRA` → ½I.
- **Bridge:** `qc-l6-mixture`.

**`q9-same-part:b2` [L]** (the difference is in the grid)
- **G:** "The difference lives in the grid. The coin pair fills one cell: $zz = -1$. The singlet has −1 in all three diagonal cells, so its x and y readings disagree too. Only readings on both qubits can see this. Chapter Q10's Bell inequality is built on exactly that."
- **F:** "$T_c = \mathrm{diag}(0, 0, -1)$ against $T_{\Psi^-} = \mathrm{diag}(-1, -1, -1)$: the parts agree and the wholes differ. The difference lies entirely in the correlations, which only joint measurements reveal (notes p. 39). For example $\langle X_AX_B\rangle$ is 0 for $\rho_c$ and −1 for $\Psi^-$."
- **Cap:** G "$xx$: 0 for the coin pair, −1 for the singlet" · F "$T_c = \mathrm{diag}(0, 0, -1)$, $T_{\Psi^-} = -I_3$"
- **Stage:** `tq(SING, {highlight:['xx','yy']})` — needs: two-qubit.
- **Claims:** `q9CoinGrid` → diag(0, 0, −1) · `q9SingGrid` → diag(−1, −1, −1) · `q9CoinXX` → 0 · `q9SingXX` → −1.
- **Fidelity:** `qc-tq-grid-signed`.

**`q9-same-part:b3` [L]** (the rule for any two-qubit ρ)
- **G:** "A two-qubit $\rho$ has 16 entries, one for each row label $ab$ and column label $a'b'$. Write them $\rho_{ab,a'b'}$. The partial trace keeps the entries whose B labels agree, $b = b'$, and adds over b. The rule works for any $\rho$, pure or mixed."
- **F:** "In general $\rho = \sum p_{i_1i_2,j_1j_2}|i_1\rangle\langle j_1|\otimes|i_2\rangle\langle j_2|$ (notes Eq. 2.22), and $\mathrm{Tr}_2\,\rho = \sum p_{i_1k,j_1k}|i_1\rangle\langle j_1|$ since $\mathrm{Tr}|i_2\rangle\langle j_2| = \delta_{i_2j_2}$. Bergou's example (Eqs. 2.8–2.10, with Eq. 2.9's Tr read as $\mathrm{Tr}_B$) is $\Psi^+ \mapsto \tfrac12I$."
- **Cap:** G "keep $b = b'$, add over b" · F "$\mathrm{Tr}_2\big(|i_1\rangle\langle j_1|\otimes|i_2\rangle\langle j_2|\big) = \delta_{i_2j_2}|i_1\rangle\langle j_1|$"
- **Stage:** `mx(out({bell:'Psi+'}), {blocks:2, partialTrace:'B'})`.
- **Claims:** `q9BellRA` (Ψ⁺) → ½I.

**`q9-same-part:b4` [C]** (one joint reading)
- **Q G:** "You may read both qubits along x and multiply the results. Can this tell the singlet from the coin pair?"
- **Q F:** "Does $\langle X_AX_B\rangle$ distinguish $\Psi^-$ from $\rho_c$?"
- **Reveal G:** "Yes. The singlet gives −1 every time; the coin pair averages 0. One joint reading does what no reading of a single qubit can."
- **Reveal F:** "$\langle XX\rangle_{\Psi^-} = -1$ and $\mathrm{Tr}(\rho_c\,XX) = 0$: a joint observable separates two states whose reduced states coincide."
- **Reveal cap:** G/F "$xx$: −1 against 0"
- **Stage:** question `tqR(COIN, {labels:'A-B', grid:'none'})` (arrows only, both zero: nothing given away); reveal `tq(SING, {highlight:['xx']})` — needs: two-qubit.
- **Claims:** `q9SingXX` → −1 · `q9CoinXX` → 0.

### Unit `q9-entropy` — Entropy: how mixed is a state?

**`q9-entropy:b1` [L] · notation beat, `introduces: ['qc-von-neumann-entropy']`** (S from the eigenvalues; D6)
- **G:** "How much is unknown about a state? Take $\rho$'s eigenvalues $\lambda$, which act as chances. The [[qc-von-neumann-entropy|entropy]] is $S(\rho) = -\sum\lambda\log_2\lambda$, counted in bits. Here $\log_2x$ is the power of 2 that gives x, so $\log_2\tfrac12 = -1$, and a zero eigenvalue adds nothing. Unit 8.4's mixture has $S = 0.601$ bit."
- **F:** "The [[qc-von-neumann-entropy|von Neumann entropy]] is $S(\rho) = -\mathrm{Tr}(\rho\log_2\rho) = -\sum_i\lambda_i\log_2\lambda_i$, with $0\log_20 = 0$ (notes Eq. 2.23; N&C §11.3 p. 510): the Shannon entropy of $\rho$'s spectrum, basis-independent and ≥ 0. Unit 8.4's mixture, with eigenvalues 0.854 and 0.146, has $S = 0.601$ bit."
- **Cap:** G "Unit 8.4's mixture: 0.601 bit" · F "$S = -\sum\lambda\log_2\lambda = 0.601$"
- **Stage:** `mx(ZX, {spectrum:'entropy'})` — needs: matrix-v2.
- **Claims:** `q9SZX` → 0.601 · `q8ZXEig` → 0.854, 0.146 (Q8's key).

**`q9-entropy:b2` [L]** (0 for pure, 1 bit for a coin, $\log_2d$ at most; D6)
- **G:** "A pure state has eigenvalues 1 and 0, so $S = 0$: nothing is unknown. The fair coin $\tfrac12I$ has two eigenvalues of ½, so $S = 1$ bit. Two qubits in $\tfrac14I$ give 2 bits. In d dimensions the most is $\log_2d$, reached only by $I/d$."
- **F:** "Pure states have $\lambda \in \{0, 1\}$ and $S = 0$. $\tfrac12I$ has $S = -2\cdot\tfrac12\log_2\tfrac12 = 1$ bit, and $I/d$ has $S = \log_2d$, the maximum (notes p. 39). For two qubits $\tfrac14I_4$ has $S = 2$."
- **Cap:** G "S: 0, 1 and 2 bits" · F "$0 \le S \le \log_2d$"
- **Stage:** `mx(HALF4, {spectrum:'entropy'})` — needs: matrix-v2.
- **Claims:** `q9SPure` → 0 · `q9SHalf` → 1 · `q9SQuarter4` → 2.

**`q9-entropy:b3` [L]** (for a qubit, S depends only on the arrow's length; D7)
- **G:** "For one qubit the eigenvalues are $(1 + |\mathbf r|)/2$ and $(1 - |\mathbf r|)/2$. So S depends only on the arrow's length. It is 1 bit at the centre and 0 on the surface. At length 0.5 it is 0.811 bit, and Unit 8.4's mixture, at length 0.707, has 0.601."
- **F:** "$\lambda_\pm = \tfrac12(1 \pm |\mathbf r|)$, so $S = h\big(\tfrac12(1 + |\mathbf r|)\big)$ with $h(p) = -p\log_2p - (1 - p)\log_2(1 - p)$. It falls from 1 at the centre to 0 on the surface: 0.811 at $|\mathbf r| = 0.5$, 0.601 at 0.707."
- **Cap:** G "length 0.5: S = 0.811 bit" · F "$S = h\big(\tfrac12(1 + |\mathbf r|)\big)$"
- **Stage:** `split( ball({r:[0, 0, V.q9RIn[1]]}) / mx(mix([3/4, {ket:'0'}], [1/4, {ket:'1'}]), {spectrum:'entropy'}) )` — needs: matrix-v2.
- **Claims:** `q9RIn` → 0, 0.5, 0.707, 1 (inputs) · `q9SofR` → 1, 0.811, 0.601, 0.

**`q9-entropy:b4` [L] · notation beat, `introduces: ['qc-entanglement-entropy']`** (one half of a pure pair)
- **G:** "For a pure pair, the entropy of one half measures how entangled the pair is. It is the [[qc-entanglement-entropy|entanglement entropy]], $E = S(\rho_A)$. A product gives 0 and each Bell state 1 bit. $(\sqrt3|00\rangle + |11\rangle)/2$ gives 0.811 bit: entangled, but less than a Bell pair."
- **F:** "For a pure $|\psi\rangle_{AB}$ the [[qc-entanglement-entropy|entanglement entropy]] is $E = S(\rho_A) = S(\rho_B)$ (Bergou §3.7.1 p. 47, Eq. 3.41; Unit 9.4 proves the equality). Products give 0, Bell states 1 bit, $\Psi_2$ 0.811. Chapter Q12 develops E as a measure of entanglement."
- **Cap:** G "E: 0, 0.811 and 1 bit" · F "$E(\Psi_2) = h(0.75) = 0.811$"
- **Stage:** `tq(PSI2, {readouts:['entropy', 'rLength']})` — needs: two-qubit.
- **Claims:** `q9EProd` → 0 · `q9EBell` → 1 · `q9EPsi2` → 0.811.

**`q9-entropy:b5` [C]** (which box hides more?)
- **Q G:** "Which has more entropy: the GHZ box of Unit 8.1, or Unit 8.4's one-qubit mixture?"
- **Q F:** "Compare $S(\rho_{12})$ for the GHZ box with S of $\tfrac12(|0\rangle\langle0| + |{+}\rangle\langle{+}|)$."
- **Reveal G:** "The box: 1 bit, against 0.601. The box is a fair coin between two orthogonal states. The mixture's two members overlap, so less is unknown."
- **Reveal F:** "$S(\rho_{12}) = 1$ (eigenvalues ½, ½, 0, 0) against 0.601: mixing non-orthogonal states gives less entropy than the Shannon entropy of the weights."
- **Reveal cap:** G/F "1 bit against 0.601"
- **Stage:** question `mx(BOX)` (no spectrum, so no readout gives the answer); reveal `mx(BOX, {spectrum:'entropy'})` — needs: matrix-v2.
- **Claims:** `q9SBox` → 1 · `q9SZX` → 0.601.

### Unit `q9-schmidt` — The Schmidt form of a pair

**`q9-schmidt:b1` [L]** (group the terms by A; Eq. 2.24)
- **G:** "Take the pair $P = (|00\rangle + |{+}\rangle|1\rangle)/\sqrt2$. Group its terms by A's state. After $|0\rangle$ comes $\tilde v_0 = 0.707|0\rangle + 0.5|1\rangle$, and after $|1\rangle$ comes $\tilde v_1 = 0.5|1\rangle$. Every pair can be grouped this way. But here the partners overlap: $\langle\tilde v_0|\tilde v_1\rangle = 0.25$."
- **F:** "Any $|\psi\rangle_{AB} = \sum_{i_1i_2}c_{i_1i_2}|u_{i_1}\rangle|v_{i_2}\rangle = \sum_{i_1}|u_{i_1}\rangle|\tilde v_{i_1}\rangle$ with $|\tilde v_{i_1}\rangle = \sum_{i_2}c_{i_1i_2}|v_{i_2}\rangle$ (notes Eq. 2.24; Bergou Eqs. 2.47–2.48). The $|\tilde v\rangle$ are the rows of C and are not orthogonal in general: for P, $\langle\tilde v_0|\tilde v_1\rangle = 0.25$."
- **Cap:** G "the grid's rows: $\tilde v_0$ and $\tilde v_1$, overlap 0.25" · F "$\tilde v_{i_1}$ = row $i_1$ of C"
- **Stage:** `split( amp(PP) / mx({coef:PP}, {highlightRow:0}) )`.
- **Claims:** `q9P` → (0.707, 0.5, 0, 0.5) · `q9PVt` → (0.707, 0.5), (0, 0.5) · `q9PVtOverlap` → 0.25.

**`q9-schmidt:b2` [L] · notation beat, `introduces: ['qc-schmidt-decomposition']`** (group by ρ_A's eigenvectors; D8)
- **G:** "Group by a better basis for A: the eigenvectors of $\rho_A$. Here $\rho_A$ is Unit 8.4's mixture, so they are Unit 8.6's $|u_\pm\rangle$. Now the partners come out orthogonal, with squared lengths 0.854 and 0.146. Scaled to length 1, they are $|{+}\rangle$ and $|{-}\rangle$: $P = 0.924|u_+\rangle|{+}\rangle + 0.383|u_-\rangle|{-}\rangle$. This is the [[qc-schmidt-decomposition|Schmidt form]]."
- **F:** "Choose $\{|u_{i_1}\rangle\}$ to diagonalize $\rho_A = \sum\lambda_{i_1}|u_{i_1}\rangle\langle u_{i_1}|$. Comparing with $\rho_A = \sum\langle\tilde v_{i_1'}|\tilde v_{i_1}\rangle|u_{i_1}\rangle\langle u_{i_1'}|$ forces $\langle\tilde v_{i_1'}|\tilde v_{i_1}\rangle = \delta_{i_1i_1'}\lambda_{i_1}$ (notes Eqs. 2.25–2.26). With $|w_{i_1}\rangle = |\tilde v_{i_1}\rangle/\sqrt{\lambda_{i_1}}$ this is the [[qc-schmidt-decomposition|Schmidt decomposition]] $|\psi\rangle = \sum_{i_1}\sqrt{\lambda_{i_1}}|u_{i_1}\rangle|w_{i_1}\rangle$ (Eq. 2.27); for P, $|w_\pm\rangle = |{\pm}\rangle$."
- **Cap:** G "Schmidt weights 0.924 and 0.383" · F "$P = \sqrt{\lambda_+}|u_+\rangle|{+}\rangle + \sqrt{\lambda_-}|u_-\rangle|{-}\rangle$"
- **Stage:** `split( mx({coef:PP}, {svd:true}) / tq(PP) )` — needs: two-qubit.
- **Claims:** `q9PVtEig` → (0.653, 0.653), (0.271, −0.271) · `q9PVtEigOverlap` → 0 · `q9PVtEigNorm2` → 0.854, 0.146 · `q9PSchmidt` → 0.924, 0.383 · `q9PW` → $|{+}\rangle$, $|{-}\rangle$.

**`q9-schmidt:b3` [L]** (the Schmidt rank)
- **G:** "The number of terms is the [[qc-schmidt-rank|Schmidt rank]]. For two qubits it is 1 or 2. Rank 1 means a single term $|u\rangle|w\rangle$: a product. So a pure pair is entangled exactly when its rank is 2. That is Unit 6.3's product test again."
- **F:** "The [[qc-schmidt-rank|Schmidt rank]] $N \le \min(\dim\mathcal H_A, \dim\mathcal H_B)$ counts the nonzero $\lambda$ (notes p. 40); $N = 1$ iff $|\psi\rangle$ is a product. It is the rank of the coefficient matrix C, which is what Unit 6.3's test $\det C = 0$ detects for two qubits."
- **Cap:** G "the product: one bar; P and $\Phi^+$: two" · F "N = rank C"
- **Stage:** `mx({coef:PROD}, {svd:true})`.
- **Claims:** `q9RankProd` → 1 · `q9PRank` → 2 · `q9RankBell` → 2.
- **Terms:** `qc-factoring-test` (Q6).

**`q9-schmidt:b4` [L]** (both halves share their eigenvalues; D9)
- **G:** "B gets the same treatment: $\rho_B = 0.854|{+}\rangle\langle{+}| + 0.146|{-}\rangle\langle{-}|$. Its eigenvalues are A's, though its eigenvectors differ. On the two-qubit picture, both arrows have the same length, 0.707, pointing different ways."
- **F:** "Tracing A out of the Schmidt form gives $\rho_B = \sum\lambda_{i_1}|w_{i_1}\rangle\langle w_{i_1}|$ (notes Eq. 2.28; Bergou Eq. 2.52): $\rho_A$ and $\rho_B$ share their nonzero eigenvalues, so $S(\rho_A) = S(\rho_B)$ and, for qubits, $|\mathbf r_A| = |\mathbf r_B|$. For P, $\mathbf r_A = (0.5, 0, 0.5)$ and $\mathbf r_B = (0.707, 0, 0)$."
- **Cap:** G "two arrows of the same length, 0.707" · F "$\mathrm{spec}\,\rho_A = \mathrm{spec}\,\rho_B = \{0.854, 0.146\}$"
- **Stage:** `split( mx(out(PP), {blocks:2, partialTrace:'A', spectrum:'bars'}) / tq(PP, {readouts:['rLength']}) )` — needs: matrix-v2, two-qubit.
- **Claims:** `q9PSpecA` → 0.854, 0.146 · `q9PSpecB` → 0.854, 0.146 · `q9PRA` → (0.5, 0, 0.5) · `q9PRB_r` → (0.707, 0, 0) · `q9PRLen` → 0.707, 0.707 · `q9PRB` → [[0.5, 0.354], [0.354, 0.5]].

**`q9-schmidt:b5` [B]** (the shortcut: singular values)
- **G:** "There is a shortcut. Put the four amplitudes in Unit 6.3's 2 × 2 grid. Its singular values are the Schmidt weights, 0.924 and 0.383. They are the bars Chapter Q6 drew beside the grid."
- **F:** "With the singular value decomposition $C = U\,\mathrm{diag}(s_1, s_2)\,V^\dagger$ (Axler 7E p. 270), $|\psi\rangle = \sum_ks_k|u_k\rangle|w_k\rangle$, with $|u_k\rangle$ the columns of U, $|w_k\rangle$ the conjugated columns of V, and $s_k = \sqrt{\lambda_k}$ (N&C Theorem 2.7 p. 109)."
- **Cap:** G "the grid's singular values: the Schmidt weights" · F "$C = U\,\mathrm{diag}(s)\,V^\dagger$"
- **Stage:** `mx({coef:PP}, {svd:true})`.
- **Claims:** `q9PSvd` → 0.924, 0.383.
- **Terms:** `qc-singular-values` (new, no notation beat; §5).

**`q9-schmidt:b6` [C]** (same weights, same entanglement)
- **Q G:** "Compare P with $\cos22.5^\circ|00\rangle + \sin22.5^\circ|11\rangle$. Which pair is more entangled?"
- **Q F:** "Compare the Schmidt coefficients and E of P and of $\cos\alpha|00\rangle + \sin\alpha|11\rangle$ at α = 22.5°."
- **Reveal G:** "Neither. The second is already in Schmidt form, with weights 0.924 and 0.383, the same as P's. So both have $E = 0.601$ bit. A turn of each qubit on its own carries one into the other."
- **Reveal F:** "Both have Schmidt coefficients (0.924, 0.383) and $E = 0.601$. Equal coefficients mean the states differ by a local unitary $U_A\otimes U_B$: here $|u_\pm\rangle \mapsto |0\rangle, |1\rangle$ on A and $|{\pm}\rangle \mapsto |0\rangle, |1\rangle$ on B."
- **Reveal cap:** G/F "the same weights, 0.924 and 0.383"
- **Stage:** question `tq(PP, {readouts:['rLength']})`; reveal `tqF(22.5, {readouts:['rLength', 'entropy']})` — needs: two-qubit.
- **Claims:** `q9CS225In` → 22.5 (input) · `q9CS225Schmidt` → 0.924, 0.383 · `q9CS225E` → 0.601 · `q9EP` → 0.601.

### Unit `q9-purification` — Every mixture is part of something pure

**`q9-purification:b1` [L] · notation beat, `introduces: ['qc-purification']`** (a pure pair for every mixture; D10)
- **G:** "Turn the question around. Given a mixed $\rho$, is there a pure pair whose part is $\rho$? Always. For Unit 8.4's mixture, tag each member with its own orthogonal state of a partner B: $\tfrac1{\sqrt2}\big(|0\rangle|0\rangle + |{+}\rangle|1\rangle\big)$. Trace out B and the mixture comes back. This pure pair, our P, is a [[qc-purification|purification]]."
- **F:** "Every $\rho_A = \sum_ip_i|\psi_i\rangle\langle\psi_i|$ is the reduced state of the pure $|\Psi\rangle_{AB} = \sum_i\sqrt{p_i}|\psi_i\rangle_A|i\rangle_B$, a [[qc-purification|purification]] (notes p. 40; Bergou Eqs. 2.53–2.55); $\mathrm{Tr}_B|\Psi\rangle\langle\Psi| = \rho_A$ because the $|i\rangle_B$ are orthonormal. For Unit 8.4's mixture this is P."
- **Cap:** G "trace out B: Unit 8.4's mixture returns" · F "$\mathrm{Tr}_B|P\rangle\langle P| = \tfrac12(|0\rangle\langle0| + |{+}\rangle\langle{+}|)$"
- **Stage:** `split( mx(out(PP), {blocks:2, partialTrace:'B'}) / ball(bZX, {recipe:true}) )`.
- **Claims:** `q9PurGap` → 0 · `q9PurifyGap` → 0 (the engine's `purify`).

**`q9-purification:b2` [L]** (two purifications differ by a gate on B; D11)
- **G:** "Unit 8.6's eigen-recipe gives another purification: $0.924|u_+\rangle|0\rangle + 0.383|u_-\rangle|1\rangle$. It looks different, but an H gate on B alone turns it into P. All purifications of one $\rho$ with the same partner differ only by a gate on the partner. Here that gate is Unit 8.6's recipe table, H."
- **F:** "Purifications in one $\mathcal H_A\otimes\mathcal H_B$ differ by a unitary on B: $|\Psi'\rangle = (I_A\otimes U_B)|\Psi\rangle$ (Bergou Eq. 2.56, reading $U_B|v_k\rangle$ for the printed $U_B|u_k\rangle$). Here $(I\otimes H)\big(\sqrt{\lambda_+}|u_+\rangle|0\rangle + \sqrt{\lambda_-}|u_-\rangle|1\rangle\big) = P$: $U_B$ is the recipe unitary of Unit 8.6."
- **Cap:** G "H on B turns one purification into the other" · F "$(I\otimes H)|\Psi_{\rm eig}\rangle = |P\rangle$"
- **Stage:** `split( amp(PP) / mx({gate:{name:'H'}}) )`.
- **Claims:** `q9PurU` → H · `q9PurUGap` → 0 · `q9PurHGap` → 0.
- **Terms:** `qc-unitary-freedom` (Q8).

**`q9-purification:b3` [C]** (reading B picks A's recipe)
- **Q G:** "Read qubit B of P along x. What is the chance of +, and what state is A left in?"
- **Q F:** "Measure B of P in the $|{\pm}\rangle$ basis. Give the chance $p_+$ of + and A's state afterwards."
- **Reveal G:** "Chance 0.854, leaving A in $|u_+\rangle$; a − leaves $|u_-\rangle$, with chance 0.146. Reading B along z instead leaves $|0\rangle$ or $|+\rangle$, half each. The reading on B picks which recipe of A you get, but A's $\rho$ is the same."
- **Reveal F:** "$p_+ = \lambda_+ = 0.854$, leaving $|u_+\rangle$; $p_- = 0.146$, leaving $|u_-\rangle$. A z reading of B yields the recipe $\{|0\rangle, |{+}\rangle\}$ with ½ each. Different readings of B realize different ensembles of one $\rho_A$."
- **Reveal cap:** G/F "x on B: 0.854 → $|u_+\rangle$; z on B: 0.5 → $|0\rangle$"
- **Stage:** question `amp(PP)`; reveal `ball(bU, {recipe:true})`.
- **Claims:** `q9SteerX` → 0.854, 0.146 · `q9SteerXF` → 1, 1 · `q9SteerZ` → 0.5, 0.5 · `q9SteerZF` → 1, 1.

### Unit `q9-distance` [B] — How far apart are two states?

**`q9-distance:b1` [B] · notation beat, `introduces: ['qc-trace-norm', 'qc-trace-distance']`** (D from the difference's eigenvalues)
- **G:** "How different are two states? Subtract their density matrices and find the eigenvalues of the difference. Half the sum of their sizes is the [[qc-trace-distance|trace distance]] D. For $|0\rangle$ and $|+\rangle$ they are ±0.707, so $D = 0.707$. D is the largest gap any single yes-or-no reading can open between the two states' chances."
- **F:** "With the [[qc-trace-norm|trace norm]] $\|A\|_1 = \mathrm{Tr}\sqrt{A^\dagger A}$, the sum of A's singular values, the [[qc-trace-distance|trace distance]] is $D(\rho_1, \rho_2) = \tfrac12\|\rho_1 - \rho_2\|_1 = \max_\Pi\mathrm{Tr}\big(\Pi(\rho_1 - \rho_2)\big)$ over projectors Π (Bergou Eqs. 2.57–2.60). For $|0\rangle$ and $|+\rangle$ the difference has eigenvalues ±0.707, so D = 0.707."
- **Cap:** G "$\rho_0 - \rho_+$: eigenvalues ±0.707; D = 0.707" · F "$D = \tfrac12\|\rho_1 - \rho_2\|_1$"
- **Stage:** `split( ball('+z', {compare:'+x', purity:false}) / mx(lin([1, out({ket:'0'})], [-1, out({ket:'+'})]), {spectrum:'bars'}) )` — needs: matrix-v2.
- **Claims:** `q9D0P` → 0.707 · `q9D0PEig` → 0.707, −0.707.

**`q9-distance:b2` [B]** (in the ball, half the straight distance; D12)
- **G:** "For one qubit there is a picture. D is half the straight distance between the two points in the ball. $|0\rangle$ and $|+\rangle$ sit a quarter circle apart, so D = 0.707. Unit 8.4's mixture sits 0.707 from the centre, so its distance from $\tfrac12I$ is 0.354."
- **F:** "For qubits $\rho_1 - \rho_2 = \tfrac12(\mathbf r_1 - \mathbf r_2)\cdot\boldsymbol\sigma$ has eigenvalues $\pm\tfrac12|\mathbf r_1 - \mathbf r_2|$, so $D = \tfrac12|\mathbf r_1 - \mathbf r_2|$ (N&C Eq. 9.20 p. 404): half the Euclidean distance in the ball. Unit 8.4's mixture is D = 0.354 from $\tfrac12I$."
- **Cap:** G "half the straight distance: 0.707 and 0.354" · F "$D = \tfrac12|\mathbf r_1 - \mathbf r_2|$"
- **Stage:** `ball(bZX, {compare:'oven'})`.
- **Claims:** `q9D0PBall` → 0.707 · `q9DZXHalf` → 0.354 · `q9DZXBall` → 0.354.

**`q9-distance:b3` [B] · notation beat, `introduces: ['qc-fidelity']`** (overlap as a measure)
- **G:** "A second measure asks how much two states overlap. For two pure states the [[qc-fidelity|fidelity]] is the size of their overlap, $F = |\langle\psi_1|\psi_2\rangle|$. For $|0\rangle$ and $|+\rangle$ it is 0.707: the shadow of one on the other, as in Chapter Q1. Identical states have $F = 1$ and orthogonal ones $F = 0$."
- **F:** "The [[qc-fidelity|fidelity]] is $F(\rho_1, \rho_2) = \mathrm{Tr}\sqrt{\rho_1^{1/2}\rho_2\,\rho_1^{1/2}}$, with $\rho^{1/2}$ the positive square root (same eigenvectors, square-rooted eigenvalues) (Bergou Eq. 2.61; N&C Eq. 9.53 p. 409). It is symmetric and lies in [0, 1]. For a pure $\rho_1$ it is $\sqrt{\langle\psi_1|\rho_2|\psi_1\rangle}$, and for two pure states $|\langle\psi_1|\psi_2\rangle|$, here 0.707. Some texts call $F^2$ the fidelity; we keep the root."
- **Cap:** G "the shadow of $|+\rangle$ on $|0\rangle$: F = 0.707" · F "$F = |\langle\psi_1|\psi_2\rangle| = 0.707$"
- **Stage:** `hp({psi:'+x', basis:'z', shadows:true})`.
- **Claims:** `q9F0P` → 0.707 · `q9F0Half` → 0.707 (|0⟩ against ½I, in the challenge).
- **Fidelity:** `plane-shadow-born`, `plane-real-slice`.

**`q9-distance:b4` [B]** (for pure states, one determines the other; D13)
- **G:** "For pure states the two measures are tied: $D = \sqrt{1 - F^2}$. For $|0\rangle$ and $|+\rangle$ that gives 0.707, matching D. For mixed states only bounds remain: $1 - F \le D \le \sqrt{1 - F^2}$. Unit 8.4's mixture against $\tfrac12I$ has $F = 0.924$ and $D = 0.354$, between 0.076 and 0.383."
- **F:** "Writing $|\psi_2\rangle = \cos\alpha|\psi_1\rangle + \sin\alpha|\psi_1^\perp\rangle$ gives $D = |\sin\alpha|$ and $F = |\cos\alpha|$, so $D = \sqrt{1 - F^2}$ (N&C Eqs. 9.97–9.99 p. 415; Bergou Problem 2.5 asks for it). In general $1 - F \le D \le \sqrt{1 - F^2}$ (Bergou Eq. 2.62): for Unit 8.4's mixture against $\tfrac12I$, $0.076 \le 0.354 \le 0.383$."
- **Cap:** G "pure: $D = \sqrt{1 - F^2} = 0.707$" · F "$1 - F \le D \le \sqrt{1 - F^2}$"
- **Stage:** `split( hp({psi:'+x', basis:'z', shadows:true}) / ball('+z', {compare:'+x', purity:false}) )`.
- **Claims:** `q9Sq0P` → 0.707 · `q9D0P` → 0.707 · `q9FZXHalf` → 0.924 · `q9DZXHalf` → 0.354 · `q9FvdgZX` → 0.076, 0.383.

**`q9-distance:b5` [C]** (an overlap of 0.6)
- **Q G:** "Two pure states overlap with size 0.6. What is the trace distance between them?"
- **Q F:** "For pure states with $|\langle\psi_1|\psi_2\rangle| = 0.6$, find D."
- **Reveal G:** "0.8, since $\sqrt{1 - 0.36} = 0.8$. One well-chosen yes-or-no reading opens a gap of 0.8 between their chances."
- **Reveal F:** "$D = \sqrt{1 - F^2} = 0.8$, attained by the projector onto the positive eigenvector of $\rho_1 - \rho_2$."
- **Reveal cap:** G/F "F = 0.6 → D = 0.8"
- **Stage:** question `hp({psi:{planeDeg:V.q9Ang06}, basis:'z', shadows:true})`; reveal `ball('+z', {compare:{thetaDeg:V.q9Theta06, phiDeg:0}, purity:false})`.
- **Claims:** `q9F06` → 0.6 · `q9F06Sq` → 0.36 · `q9D06` → 0.8 · `q9Ang06` → 53.13 · `q9Theta06` → 106.26.

### 1.7 Claim ledger (engine call → value; numpy route)

| Key | Engine call (`Q9.values.ts`) | Value | numpy route |
|---|---|---|---|
| `q9ProdRA`, `q9ProdRAPur`, `q9ProdRAGap`, `q9ProdExpZ1`, `q9ProdExpX1` | `reducedDensity(runCircuit(C_PROD).states[1], [0])`; `purityN`; traces | see beats | `einsum` partial trace; ⟨ψ\|Z⊗I\|ψ⟩ |
| `q9Psi2Rho`, `q9Psi2RA`, `q9Psi2Pur`, `q9Psi2ExpZ1`, `q9Psi2ExpX1`, `q9Psi2S`, `q9Psi2Schmidt` | `densityOf`, `reducedDensity`, `vonNeumann`, `schmidt` | 0.433; diag(0.75, 0.25); 0.625; 0.5; 0; 0.811; (0.866, 0.5) | binary entropy formula; SVD of the reshaped ket |
| `q9SingRho`, `q9SingRA`, `q9SingArrows`, `q9SingGrid`, `q9SingXX`, `q9SingPur` | `densityOf(bell('Psi-'))`, `partialTrace(·, [1])`, `reducedBloch`, Pauli-string traces | see beats | explicit ket (\|01⟩ − \|10⟩)/√2 |
| `q9BellRA`, `q9BellRAGap`, `q9BellGridDiag` | `partialTrace(densityOf(bell(b)), [1])`; traces | ½I ×4; diag signs | kets from Eq. 2.4 |
| `q9GhzR12`, `q9GhzR12Grid`, `q9GhzR12Arrows`, `q9GhzR12Pur`, `q9GhzR12S` | `partialTrace(densityOf(ghz(3)), [2])` | diag(½, 0, 0, ½); $T_{zz}$ = 1; 0; 0.5; 1 | `einsum` over qubit 3 |
| `q9CoinRAGap`, `q9CoinGrid`, `q9CoinXX`, `q9CoinPur` | `mixtureN`; `partialTrace`; traces | 0; diag(0, 0, −1); 0; 0.5 | explicit matrix |
| `q9SZX`, `q9SPure`, `q9SHalf`, `q9SQuarter4`, `q9SofR`, `q9SBox`, `q9SThermal` | `vonNeumann` | 0.601; 0; 1; 2; (1, 0.811, 0.601, 0); 1; 0.527 | `eigvalsh`; h(p); log₂d |
| `q9EBell`, `q9EProd`, `q9EPsi2`, `q9EP` | `entanglementEntropy(ψ, 1)` | 1; 0; 0.811; 0.601 | S of the einsum reduction |
| `q9P`, `q9PCoef`, `q9PVt`, `q9PVtOverlap`, `q9PVtNorm2` | `runCircuit(C_PUR).states[2]`; `coefMatrix`; `inner` | see beats | the ket written out; reshape |
| `q9PVtEig`, `q9PVtEigOverlap`, `q9PVtEigNorm2`, `q9PW` | ⟨u±\|_A ψ with Q8's sign-fixed `eigenEnsemble` kets | (0.653, 0.653), (0.271, −0.271); 0; 0.854, 0.146; \|±⟩ | Eq. 2.19's u± from the formula |
| `q9PRB`, `q9PSpecA`, `q9PSpecB`, `q9PRA`, `q9PRB_r`, `q9PRLen`, `q9PGrid` | `reducedDensity`, `spectrum`, `reducedBloch` | see beats | `eigvalsh`, traces |
| `q9PSchmidt`, `q9PRank`, `q9PSvd`, `q9RankProd`, `q9RankBell` | `schmidt(ψ, [0])`; `svd(coefMatrix(ψ)).s`; `schmidtRank` | (0.924, 0.383); 2; 1; 2 | numpy SVD |
| `q9CS225In`, `q9CS225Schmidt`, `q9CS225E` | `schmidt`, `entanglementEntropy` of cos 22.5°\|00⟩ + sin 22.5°\|11⟩ | (0.924, 0.383); 0.601 | SVD; h(cos² 22.5°) |
| `q9PurGap`, `q9PurifyGap` | `partialTrace(densityOf(P), [1])`; `purify(ZX)` | 0; 0 | Bergou Eq. 2.55 written out |
| `q9PurU`, `q9PurUGap`, `q9PurHGap` | `ensembleUnitary(eigen, {½,½; \|0⟩,\|+⟩})`; `kronM(I, U)` applied | H; 0; 0 | `lstsq` + completion |
| `q9SteerX`, `q9SteerXF`, `q9SteerZ`, `q9SteerZF` | `measureInBasis(P, 1, 'x' \| 'z')`; `fidelity` | (0.854, 0.146); 1, 1; (0.5, 0.5); 1, 1 | explicit projectors on B |
| `q9D0P`, `q9D0PEig`, `q9F0P`, `q9Sq0P`, `q9D0PBall`, `q9F0Half` | `traceDistance`, `eigh`, `fidelity`, `reducedBloch` | 0.707 ×4; ±0.707; 0.707 | eigenvalues; \|⟨0\|+⟩\|; Bloch vectors |
| `q9DZXHalf`, `q9FZXHalf`, `q9FvdgZX`, `q9DZXBall` | `fvdg(ZX, ½I)` | 0.354; 0.924; 0.076, 0.383; 0.354 | `sqrtm`; eigenvalues |
| `q9F06`, `q9F06Sq`, `q9D06`, `q9Ang06`, `q9Theta06`, `q9Ang0P` | `fidelity`, `traceDistance` of \|0⟩ and (0.6, 0.8); angles from them | 0.6; 0.36; 0.8; 53.13; 106.26; 45 | arctan2; eigenvalues |
| `q9DSingCoin`, `q9DSingCoinA` | `traceDistance` | 0.5; 0 | eigenvalues of the difference |
| `q9RIn` | inputs: 0, 0.5, $1/\sqrt2$, 1 | — | — |

## 2. Derivations

Format as Q8 (`tex` — `why` — **view** — *viewCaption*; a step without a view inherits the last one in its own list).

**D1 · `q9-partial-trace:b1` · result `\langle O\otimes I\rangle = \mathrm{Tr}(\rho_AO),\quad \rho_A = \mathrm{Tr}_B\,\rho`** (notes p. 38)
- Ground (3 views):
  1. `\langle O\otimes I\rangle = \mathrm{Tr}\big(\rho\,(O\otimes I)\big)` — Unit 8.3's trace rule, for an operator O on A alone. **view** `mx(out(PROD), {blocks:2})` · *$\rho$ of the product pair, in blocks*
  2. `= \sum_{a,b}\langle a|\langle b|\,\rho\,(O\otimes I)\,|a\rangle|b\rangle` — Write the trace in the basis $|a\rangle|b\rangle$.
  3. `= \sum_a\langle a|\Big(\sum_b\langle b|\rho|b\rangle\Big)O|a\rangle` — I leaves B alone, so the sum over b acts on $\rho$ only.
  4. `\rho_A = \sum_b\langle b|_B\,\rho\,|b\rangle_B = \mathrm{Tr}_B\,\rho` — The inner sum is a 2 × 2 matrix: the partial trace. **view** `mx(out(PROD), {blocks:2, partialTrace:'B'})` · *block traces give $\rho_A$*
  5. `\langle Z_A\rangle = \mathrm{Tr}(\rho_AZ) = 0.5` — For the product pair, A's average is $\psi_1$'s, as it must be. **view** `tq(PROD)` · *arrow A: z part 0.5*
  6. `\langle O\otimes I\rangle = \mathrm{Tr}(\rho_AO),\quad \rho_A = \mathrm{Tr}_B\,\rho` — Every reading on A alone needs only $\rho_A$.
- Formal (2 views):
  1. `\mathrm{Tr}\big(\rho\,(O\otimes I)\big) = \sum_a\langle a|\Big(\sum_b\langle b|_B\,\rho\,|b\rangle_B\Big)O|a\rangle` — notes p. 38; Bergou Eq. 2.3. **view** `mx(out(PROD), {blocks:2})`
  2. `\langle O\otimes I\rangle = \mathrm{Tr}(\rho_AO),\quad \rho_A = \mathrm{Tr}_B\,\rho` — Bergou Eqs. 2.4–2.5. **view** `mx(out(PROD), {blocks:2, partialTrace:'B'})`
- Check: `q9ProdRA`, `q9ProdExpZ1`, `q9ProdRAGap`. Needs: two-qubit.

**D2 · `q9-partial-trace:b3` · result `\mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-| = \tfrac12I`** (notes pp. 38–39)
- Ground (4 views):
  1. `\Psi^- = \tfrac1{\sqrt2}(|01\rangle - |10\rangle)` — The singlet: the two qubits always differ. **view** `mx({coef:SING})` · *amplitude grid: 0.707 and −0.707*
  2. `\rho = \tfrac12\big(|01\rangle\langle01| - |01\rangle\langle10| - |10\rangle\langle01| + |10\rangle\langle10|\big)` — Four terms: two on the diagonal, two corners of −½. **view** `mx(out(SING), {blocks:2})` · *$\rho$ in blocks*
  3. `(\rho_A)_{00} = \rho_{00,00} + \rho_{01,01} = \tfrac12` — The trace of the top-left block.
  4. `(\rho_A)_{01} = \rho_{00,10} + \rho_{01,11} = 0` — The off-diagonal block has zeros on its own diagonal; the −½ sits off it.
  5. `(\rho_A)_{11} = \rho_{10,10} + \rho_{11,11} = \tfrac12` — The bottom-right block. **view** `mx(out(SING), {blocks:2, partialTrace:'B'})` · *$\rho_A = \tfrac12I$*
  6. `\mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-| = \tfrac12I` — A alone is a fair coin: its arrow has length 0. **view** `tq(SING)` · *both arrows zero*
- Formal (2 views):
  1. `|\Psi^-\rangle\langle\Psi^-| = \tfrac12\begin{pmatrix}0&0&0&0\\0&1&-1&0\\0&-1&1&0\\0&0&0&0\end{pmatrix}` — notes p. 38. **view** `mx(out(SING), {blocks:2})`
  2. `\mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-| = \tfrac12I` — notes p. 39; $\mathbf r_A = 0$. **view** `mx(out(SING), {blocks:2, partialTrace:'B'})`
- Check: `q9SingRho`, `q9SingRA`, `q9SingArrows`. Needs: two-qubit.

**D3 · `q9-same-part:b1` · result `\mathrm{Tr}_B\,\rho_c = \mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-| = \tfrac12I,\quad \rho_c \ne |\Psi^-\rangle\langle\Psi^-|`** (notes p. 39)
- Ground (4 views):
  1. `\rho_c = \tfrac12|01\rangle\langle01| + \tfrac12|10\rangle\langle10|` — A coin picks 01 or 10. **view** `mx(COIN, {blocks:2})` · *two diagonal entries, no corners*
  2. `\mathrm{Tr}_B\,\rho_c = \tfrac12|0\rangle\langle0| + \tfrac12|1\rangle\langle1| = \tfrac12I` — Each term leaves its own A state. **view** `mx(COIN, {blocks:2, partialTrace:'B'})` · *$\rho_A = \tfrac12I$*
  3. `\mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-| = \tfrac12I` — The singlet gave the same, in Unit 9.1.
  4. `\rho_c \ne |\Psi^-\rangle\langle\Psi^-|` — The singlet has corners of −½; the coin pair has none. **view** `mx(out(SING), {blocks:2})` · *the singlet's corners*
  5. `T_c = \mathrm{diag}(0, 0, -1),\quad T_{\Psi^-} = \mathrm{diag}(-1, -1, -1)` — The grids differ in the x and y cells. **view** `tqR(COIN, {labels:'A-B'})` · *the coin pair: only $zz$*
  6. `\mathrm{Tr}_B\,\rho_c = \mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-| = \tfrac12I,\quad \rho_c \ne |\Psi^-\rangle\langle\Psi^-|` — Same part, different whole.
- Formal (2 views):
  1. `\mathrm{Tr}_B\,\rho_c = \tfrac12I = \mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-|` — notes p. 39. **view** `mx(COIN, {blocks:2, partialTrace:'B'})`
  2. `\mathrm{Tr}_B\,\rho_c = \mathrm{Tr}_B|\Psi^-\rangle\langle\Psi^-| = \tfrac12I,\quad \rho_c \ne |\Psi^-\rangle\langle\Psi^-|` — They differ only in the correlations, $T_c \ne T_{\Psi^-}$. **view** `tqR(COIN, {labels:'A-B'})`
- Check: `q9CoinRAGap`, `q9SingRA`, `q9CoinGrid`, `q9SingGrid`. Needs: two-qubit.

**D4 · `q9-partial-trace:b5` · result `\mathrm{Tr}_3|\mathrm{GHZ}\rangle\langle\mathrm{GHZ}| = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)`** (HW2 P7(e))
- Ground (4 views):
  1. `|\mathrm{GHZ}\rangle\langle\mathrm{GHZ}| = \tfrac12\big(|000\rangle\langle000| + |000\rangle\langle111| + |111\rangle\langle000| + |111\rangle\langle111|\big)` — Four terms: two on the diagonal, two in the far corners. **view** `mx(out(GHZ), {blocks:4})` · *8 × 8, four filled cells*
  2. `\mathrm{Tr}_3\,|x\,c\rangle\langle x'\,c'| = \delta_{cc'}\,|x\rangle\langle x'|` — Here x, x' label qubits 1 and 2, and c, c' label qubit 3. A term survives only if its qubit-3 labels agree.
  3. `|000\rangle\langle111| \mapsto 0,\quad |111\rangle\langle000| \mapsto 0` — The corner terms have c = 0 and c' = 1: they vanish.
  4. `\tfrac12|000\rangle\langle000| + \tfrac12|111\rangle\langle111| \mapsto \tfrac12|00\rangle\langle00| + \tfrac12|11\rangle\langle11|` — The diagonal terms survive. **view** `mx(out(GHZ), {blocks:4, partialTrace:{keep:[0,1]}})` · *keep qubits 1 and 2*
  5. `T_{zz} = 1,\quad T_{xx} = T_{yy} = 0` — The grid of Unit 8.1's box. **view** `tqX(GHZ, [0,1], {labels:'q1-q2'})` · *the GHZ box*
  6. `\mathrm{Tr}_3|\mathrm{GHZ}\rangle\langle\mathrm{GHZ}| = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)` — A mixture of two products.
- Formal (2 views):
  1. `\mathrm{Tr}_3\,|x c\rangle\langle x'c'| = \delta_{cc'}|x\rangle\langle x'|` — HW2 P7(e). **view** `mx(out(GHZ), {blocks:4})`
  2. `\mathrm{Tr}_3|\mathrm{GHZ}\rangle\langle\mathrm{GHZ}| = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)` — Not entangled; Unit 8.1's box. **view** `tqX(GHZ, [0,1], {labels:'q1-q2'})`
- Check: `q9GhzR12`, `q9GhzR12Grid`, `q8BoxTr3Gap`. Needs: matrix-v2, two-qubit.

**D5 · `q9-partial-trace:b4` · result `\mathrm{Tr}_2|\beta_{xy}\rangle\langle\beta_{xy}| = \tfrac12I\ \text{for all}\ x, y`** (HW2 P2(d))
- Ground (4 views):
  1. `|\beta_{xy}\rangle = \tfrac1{\sqrt2}\big(|0, y\rangle + (-1)^x|1, 1\oplus y\rangle\big)` — Unit 6.4's two-bit names. **view** `tq({bell:'Phi+'})` · *$\beta_{00} = \Phi^+$*
  2. `\mathrm{Tr}_2|\beta_{xy}\rangle\langle\beta_{xy}| = \tfrac12|0\rangle\langle0| + \tfrac12|1\rangle\langle1|` — The two terms carry different labels on qubit 2, y and $1\oplus y$, so their cross terms drop out, and the sign $(-1)^x$ goes with them. **view** `mx(out({bell:'Phi+'}), {blocks:2, partialTrace:'B'})` · *$\Phi^+$: $\tfrac12I$*
  3. `= \tfrac12I` — The same for every x and y. **view** `tq({bell:'Psi-'})` · *$\beta_{11} = \Psi^-$: zero arrows, a different grid*
  4. `T_{\beta_{xy}} = \mathrm{diag}\big((-1)^x, -(-1)^{x+y}, (-1)^y\big)` — What differs is the grid, which only joint readings see. **view** `tq({bell:'Phi-'})` · *$\beta_{10} = \Phi^-$*
  5. `\mathrm{Tr}_2|\beta_{xy}\rangle\langle\beta_{xy}| = \tfrac12I\ \text{for all}\ x, y` — No reading of qubit 1 alone tells the four apart.
- Formal (2 views):
  1. `\mathrm{Tr}_2|\beta_{xy}\rangle\langle\beta_{xy}| = \tfrac12\big(|0\rangle\langle0| + |1\rangle\langle1|\big)` — $\langle y|1\oplus y\rangle = 0$ removes the cross terms. **view** `mx(out({bell:'Phi+'}), {blocks:2, partialTrace:'B'})`
  2. `\mathrm{Tr}_2|\beta_{xy}\rangle\langle\beta_{xy}| = \tfrac12I\ \text{for all}\ x, y` — The Bell measurement is joint, so there is no contradiction (HW2 P2(d)). **view** `tq({bell:'Psi-'})`
- Check: `q9BellRA`, `q9BellRAGap`, `q9BellGridDiag`. Needs: two-qubit.

**D6 · `q9-entropy:b2` · result `S = 0\ \text{(pure)},\quad S(\tfrac12I) = 1,\quad S(I/d) = \log_2d`** (notes Eq. 2.23, p. 39)
- Ground (4 views):
  1. `S(\rho) = -\sum_i\lambda_i\log_2\lambda_i` — Entropy from the eigenvalues. **view** `mx(ZX, {spectrum:'entropy'})` · *Unit 8.4's mixture: 0.601 bit*
  2. `\lambda \in \{1, 0\} \Rightarrow S = -1\cdot\log_21 - 0 = 0` — Pure: $\log_21 = 0$, and the zero eigenvalue adds nothing. **view** `mx(out(N), {spectrum:'entropy'})` · *a pure state: S = 0*
  3. `\lambda = \tfrac12, \tfrac12 \Rightarrow S = -2\cdot\tfrac12\log_2\tfrac12 = 1` — The fair coin: one bit. **view** `mx(mix([1/2, {ket:'0'}], [1/2, {ket:'1'}]), {spectrum:'entropy'})` · *$\tfrac12I$: 1 bit*
  4. `\lambda_i = \tfrac1d \Rightarrow S = d\cdot\tfrac1d\log_2d = \log_2d` — d equal eigenvalues. **view** `mx(HALF4, {spectrum:'entropy'})` · *$\tfrac14I_4$: 2 bits*
  5. `S = 0\ \text{(pure)},\quad S(\tfrac12I) = 1,\quad S(I/d) = \log_2d` — No state in d dimensions has more.
- Formal (2 views):
  1. `S(\rho) = -\mathrm{Tr}(\rho\log_2\rho) = -\sum_i\lambda_i\log_2\lambda_i` — notes Eq. 2.23. **view** `mx(ZX, {spectrum:'entropy'})`
  2. `S = 0\ \text{(pure)},\quad S(\tfrac12I) = 1,\quad S(I/d) = \log_2d` — The Shannon bound for d outcomes (N&C §11.3). **view** `mx(HALF4, {spectrum:'entropy'})`
- Check: `q9SZX`, `q9SPure`, `q9SHalf`, `q9SQuarter4`. Needs: matrix-v2.

**D7 · `q9-entropy:b3` · result `S = h\big(\tfrac12(1 + |\mathbf r|)\big)`** (notes p. 39 with Q8's Eq. 2.14; the re-map's `plot` view replaced, §12 Q5)
- Ground (3 views):
  1. `\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)` — Unit 8.5's form. **view** `ball('oven')` · *length 0: the centre*
  2. `\lambda_\pm = \tfrac12(1 \pm |\mathbf r|)` — The eigenvalues add to 1 and multiply to $\det\rho = \tfrac14(1 - |\mathbf r|^2)$.
  3. `S = -\lambda_+\log_2\lambda_+ - \lambda_-\log_2\lambda_-` — Only the arrow's length enters. **view** `mx(RHALF(sweep), {spectrum:'entropy'})` · *length swept from 0 to 1: S falls from 1 to 0*
  4. `S(0) = 1,\ S(0.5) = 0.811,\ S(0.707) = 0.601,\ S(1) = 0` — Four lengths. **view** `ball({r:[0, 0, V.q9RIn[1]]})` · *length 0.5: S = 0.811*
  5. `S = h\big(\tfrac12(1 + |\mathbf r|)\big)` — with $h(p) = -p\log_2p - (1 - p)\log_2(1 - p)$.
- Formal (2 views):
  1. `\lambda_\pm = \tfrac12(1 \pm |\mathbf r|)` — From the trace and the determinant. **view** `ball({r:[0, 0, V.q9RIn[1]]})`
  2. `S = h\big(\tfrac12(1 + |\mathbf r|)\big)` — Monotone in $|\mathbf r|$, from 1 to 0. **view** `mx(RHALF(sweep), {spectrum:'entropy'})`
- Check: `q9SofR`. Needs: matrix-v2.

**D8 · `q9-schmidt:b2` · result `|\psi\rangle_{AB} = \sum_{i_1}\sqrt{\lambda_{i_1}}|u_{i_1}\rangle_A|w_{i_1}\rangle_B`** (notes Eqs. 2.24–2.27)
- Ground (4 views):
  1. `|\psi\rangle = \sum_{i_1}|u_{i_1}\rangle|\tilde v_{i_1}\rangle` — Group the terms by A's basis states. **view** `mx({coef:PP}, {highlightRow:0})` · *row 0 of the grid: $\tilde v_0$*
  2. `\rho_A = \sum_{i_1, i_1'}\langle\tilde v_{i_1'}|\tilde v_{i_1}\rangle\,|u_{i_1}\rangle\langle u_{i_1'}|` — Trace out B: the partners' overlaps become the entries. **view** `mx(out(PP), {blocks:2, partialTrace:'B'})` · *$\rho_A$: Unit 8.4's mixture*
  3. `\rho_A = \sum_{i_1}\lambda_{i_1}|u_{i_1}\rangle\langle u_{i_1}|` — Now let A's basis be the eigenvectors of $\rho_A$.
  4. `\langle\tilde v_{i_1'}|\tilde v_{i_1}\rangle = \delta_{i_1i_1'}\lambda_{i_1}` — Matching the two forms: the partners are orthogonal, with squared lengths $\lambda$. **view** `mx({coef:PP}, {svd:true})` · *the weights 0.924 and 0.383*
  5. `|w_{i_1}\rangle = |\tilde v_{i_1}\rangle/\sqrt{\lambda_{i_1}}` — Scale each partner to length 1.
  6. `|\psi\rangle_{AB} = \sum_{i_1}\sqrt{\lambda_{i_1}}|u_{i_1}\rangle_A|w_{i_1}\rangle_B` — One term per eigenvalue. **view** `tq(PP)` · *P: two arrows, each 0.707 long*
- Formal (2 views):
  1. `\langle\tilde v_{i_1'}|\tilde v_{i_1}\rangle = \delta_{i_1i_1'}\lambda_{i_1}` — Compare notes Eqs. 2.25 and 2.26. **view** `mx(out(PP), {blocks:2, partialTrace:'B'})`
  2. `|\psi\rangle_{AB} = \sum_{i_1}\sqrt{\lambda_{i_1}}|u_{i_1}\rangle_A|w_{i_1}\rangle_B` — For P: $0.924|u_+\rangle|{+}\rangle + 0.383|u_-\rangle|{-}\rangle$. **view** `mx({coef:PP}, {svd:true})`
- Check: `q9PVt`, `q9PVtOverlap`, `q9PVtEigOverlap`, `q9PVtEigNorm2`, `q9PSchmidt`, `q9PW`. Needs: two-qubit.

**D9 · `q9-schmidt:b4` · result `\rho_B = \sum_{i_1}\lambda_{i_1}|w_{i_1}\rangle\langle w_{i_1}|,\quad \mathrm{spec}\,\rho_A = \mathrm{spec}\,\rho_B`** (notes Eq. 2.28)
- Ground (4 views):
  1. `|\psi\rangle = \sum_{i_1}\sqrt{\lambda_{i_1}}|u_{i_1}\rangle|w_{i_1}\rangle` — Start from the Schmidt form. **view** `mx({coef:PP}, {svd:true})` · *weights 0.924 and 0.383*
  2. `\rho_B = \mathrm{Tr}_A|\psi\rangle\langle\psi| = \sum_{i_1}\lambda_{i_1}|w_{i_1}\rangle\langle w_{i_1}|` — The $|u\rangle$ are orthonormal, so only matching terms survive. **view** `mx(out(PP), {blocks:2, partialTrace:'A', spectrum:'bars'})` · *$\rho_B$: eigenvalues 0.854 and 0.146*
  3. `\rho_A = \sum_{i_1}\lambda_{i_1}|u_{i_1}\rangle\langle u_{i_1}|` — The same weights, with A's states. **view** `mx(out(PP), {blocks:2, partialTrace:'B', spectrum:'bars'})` · *$\rho_A$: the same eigenvalues*
  4. `|\mathbf r_A| = |\mathbf r_B|` — For qubits, equal eigenvalues mean arrows of equal length. **view** `tq(PP, {readouts:['rLength']})` · *both arrows 0.707 long*
  5. `\rho_B = \sum_{i_1}\lambda_{i_1}|w_{i_1}\rangle\langle w_{i_1}|,\quad \mathrm{spec}\,\rho_A = \mathrm{spec}\,\rho_B` — The two halves share their chances.
- Formal (2 views):
  1. `\rho_B = \sum_{i_1}\lambda_{i_1}|w_{i_1}\rangle\langle w_{i_1}|` — notes Eq. 2.28; Bergou Eq. 2.52. **view** `mx(out(PP), {blocks:2, partialTrace:'A', spectrum:'bars'})`
  2. `\rho_B = \sum_{i_1}\lambda_{i_1}|w_{i_1}\rangle\langle w_{i_1}|,\quad \mathrm{spec}\,\rho_A = \mathrm{spec}\,\rho_B` — Hence $S(\rho_A) = S(\rho_B)$. **view** `tq(PP, {readouts:['rLength']})`
- Check: `q9PSpecA`, `q9PSpecB`, `q9PRLen`. Needs: matrix-v2, two-qubit.

**D10 · `q9-purification:b1` · result `\mathrm{Tr}_B|\Psi\rangle\langle\Psi| = \rho_A,\quad |\Psi\rangle = \sum_i\sqrt{p_i}|\psi_i\rangle_A|i\rangle_B`** (notes p. 40; Bergou Eq. 2.55)
- Ground (3 views):
  1. `\rho_A = \tfrac12|0\rangle\langle0| + \tfrac12|{+}\rangle\langle{+}|` — Unit 8.4's mixture. **view** `ball(bZX, {recipe:true})` · *the mixture*
  2. `|\Psi\rangle = \sqrt{\tfrac12}|0\rangle|0\rangle_B + \sqrt{\tfrac12}|{+}\rangle|1\rangle_B` — Tag each member with its own orthogonal state of B, weighted by the square root of its chance. **view** `amp(PP)` · *P: bars at 00, 01 and 11*
  3. `\mathrm{Tr}_B\big(|\psi_i\rangle\langle\psi_j|\otimes|i\rangle\langle j|\big) = \delta_{ij}|\psi_i\rangle\langle\psi_i|` — Different tags are orthogonal, so the cross terms vanish.
  4. `\mathrm{Tr}_B|\Psi\rangle\langle\Psi| = \sum_ip_i|\psi_i\rangle\langle\psi_i| = \rho_A` — Only the matching terms survive. **view** `mx(out(PP), {blocks:2, partialTrace:'B'})` · *$\rho_A$ returns*
  5. `\mathrm{Tr}_B|\Psi\rangle\langle\Psi| = \rho_A,\quad |\Psi\rangle = \sum_i\sqrt{p_i}|\psi_i\rangle_A|i\rangle_B` — Every mixture has a purification.
- Formal (2 views):
  1. `|\Psi\rangle_{AB} = \sum_i\sqrt{p_i}|\psi_i\rangle_A|i\rangle_B` — Bergou Eq. 2.55, with $\dim\mathcal H_B$ at least the number of members. **view** `amp(PP)`
  2. `\mathrm{Tr}_B|\Psi\rangle\langle\Psi| = \rho_A,\quad |\Psi\rangle = \sum_i\sqrt{p_i}|\psi_i\rangle_A|i\rangle_B` — $\langle i|j\rangle = \delta_{ij}$. **view** `mx(out(PP), {blocks:2, partialTrace:'B'})`
- Check: `q9PurGap`, `q9PurifyGap`, `q9P`.

**D11 · `q9-purification:b2` · result `|\Psi'\rangle = (I_A\otimes U_B)|\Psi\rangle`** (Bergou Eq. 2.56, corrected)
- Ground (4 views):
  1. `|\Psi_{\rm eig}\rangle = \sqrt{\lambda_+}|u_+\rangle|0\rangle + \sqrt{\lambda_-}|u_-\rangle|1\rangle` — The purification built from the eigen-recipe. **view** `ball(bU, {recipe:true})` · *the eigen-recipe*
  2. `|P\rangle = \sqrt{\tfrac12}|0\rangle|0\rangle + \sqrt{\tfrac12}|{+}\rangle|1\rangle` — The one built from the $|0\rangle$, $|+\rangle$ recipe. **view** `ball(bZX, {recipe:true})` · *the $|0\rangle$, $|+\rangle$ recipe*
  3. `|P\rangle = \sqrt{\lambda_+}|u_+\rangle|{+}\rangle + \sqrt{\lambda_-}|u_-\rangle|{-}\rangle` — Unit 8.6's table: each weighted $|0\rangle$, $|+\rangle$ is a sum or difference of the weighted $|u_\pm\rangle$. **view** `mx({gate:{name:'H'}})` · *the table: H*
  4. `|{+}\rangle = H|0\rangle,\quad |{-}\rangle = H|1\rangle` — On B, the two forms differ by an H.
  5. `|P\rangle = (I\otimes H)|\Psi_{\rm eig}\rangle` — One gate on B alone. **view** `amp(PP)` · *P*
  6. `|\Psi'\rangle = (I_A\otimes U_B)|\Psi\rangle` — In general, two purifications with the same partner differ by a gate on the partner.
- Formal (2 views):
  1. `|\Psi\rangle = \sum_k\sqrt{\lambda_k}|u_k\rangle|v_k\rangle,\ |\Psi'\rangle = \sum_k\sqrt{\lambda_k}|u_k\rangle|w_k\rangle \Rightarrow U_B|v_k\rangle = |w_k\rangle` — Both Schmidt forms share $\rho_A$'s eigenvalues and eigenvectors (Bergou Eq. 2.56, with $U_B|v_k\rangle$ for the printed $U_B|u_k\rangle$). **view** `mx({gate:{name:'H'}})`
  2. `|\Psi'\rangle = (I_A\otimes U_B)|\Psi\rangle` — Here $U_B = H$. **view** `amp(PP)`
- Check: `q9PurU`, `q9PurUGap`, `q9PurHGap`.

**D12 · `q9-distance:b2` · result `D(\rho_1, \rho_2) = \tfrac12|\mathbf r_1 - \mathbf r_2|`** (N&C Eq. 9.20, p. 404)
- Ground (3 views):
  1. `\rho_1 - \rho_2 = \tfrac12(\mathbf r_1 - \mathbf r_2)\cdot\boldsymbol\sigma` — The identity parts cancel. **view** `ball('+z', {compare:'+x', purity:false})` · *$|0\rangle$ and $|+\rangle$*
  2. `(\mathbf a\cdot\boldsymbol\sigma)\ \text{has eigenvalues}\ \pm|\mathbf a|` — Unit 3.3: a Pauli arrow's eigenvalues are plus and minus its length.
  3. `\text{eigenvalues of}\ \rho_1 - \rho_2 = \pm\tfrac12|\mathbf r_1 - \mathbf r_2|` — Here ±0.707. **view** `mx(lin([1, out({ket:'0'})], [-1, out({ket:'+'})]), {spectrum:'bars'})` · *±0.707*
  4. `D = \tfrac12\Big(\tfrac12|\mathbf r_1 - \mathbf r_2| + \tfrac12|\mathbf r_1 - \mathbf r_2|\Big)` — Half the sum of their sizes.
  5. `D(\rho_1, \rho_2) = \tfrac12|\mathbf r_1 - \mathbf r_2|` — Half the straight distance in the ball. **view** `ball(bZX, {compare:'oven'})` · *the mixture and the centre: D = 0.354*
- Formal (2 views):
  1. `\rho_1 - \rho_2 = \tfrac12(\mathbf r_1 - \mathbf r_2)\cdot\boldsymbol\sigma,\ \text{eigenvalues}\ \pm\tfrac12|\mathbf r_1 - \mathbf r_2|` — N&C p. 404. **view** `mx(lin([1, out({ket:'0'})], [-1, out({ket:'+'})]), {spectrum:'bars'})`
  2. `D(\rho_1, \rho_2) = \tfrac12|\mathbf r_1 - \mathbf r_2|` — N&C Eq. 9.20. **view** `ball(bZX, {compare:'oven'})`
- Check: `q9D0P`, `q9D0PEig`, `q9D0PBall`, `q9DZXHalf`, `q9DZXBall`. Needs: matrix-v2.

**D13 · `q9-distance:b4` · result `D = \sqrt{1 - F^2}\ \text{for pure states}`** (N&C Eqs. 9.97–9.99, p. 415; ⚑ Bergou P2.5)
- Ground (3 views):
  1. `|\psi_2\rangle = \cos\alpha|\psi_1\rangle + \sin\alpha|\psi_1^\perp\rangle` — Write the second state against the first, at an angle α; $|\psi_1^\perp\rangle$ is orthogonal to $|\psi_1\rangle$, and a phase can be dropped. **view** `hp({psi:'+x', basis:'z', shadows:true})` · *$|+\rangle$ against $|0\rangle$: α = 45°*
  2. `F = |\langle\psi_1|\psi_2\rangle| = |\cos\alpha|` — The fidelity is the shadow.
  3. `\rho_1 - \rho_2 = \begin{pmatrix}\sin^2\alpha & -\sin\alpha\cos\alpha\\ -\sin\alpha\cos\alpha & -\sin^2\alpha\end{pmatrix}` — In the basis $|\psi_1\rangle, |\psi_1^\perp\rangle$. **view** `mx(lin([1, out({ket:'0'})], [-1, out({ket:'+'})]))` · *the difference*
  4. `\text{eigenvalues}\ \pm|\sin\alpha| \Rightarrow D = |\sin\alpha|` — The trace is 0 and the determinant is $-\sin^2\alpha$.
  5. `D = \sqrt{1 - \cos^2\alpha} = \sqrt{1 - F^2}` — Put the two together. **view** `ball('+z', {compare:'+x', purity:false})` · *on the ball: a quarter circle apart, D = 0.707*
  6. `D = \sqrt{1 - F^2}\ \text{for pure states}` — For mixed states only the bounds of Unit 9.6 remain.
- Formal (2 views):
  1. `D = |\sin\alpha|,\quad F = |\cos\alpha|` — N&C Eqs. 9.97–9.98. **view** `hp({psi:'+x', basis:'z', shadows:true})`
  2. `D = \sqrt{1 - F^2}\ \text{for pure states}` — N&C Eq. 9.99; for mixed states $1 - F \le D \le \sqrt{1 - F^2}$ (Bergou Eq. 2.62). **view** `ball('+z', {compare:'+x', purity:false})`
- Check: `q9F0P`, `q9D0P`, `q9Sq0P`, `q9Ang0P` (α = 45°). Needs: matrix-v2 (one Ground view).

**View counts** (distinct views, Ground / Formal): D1 3/2 · D2 4/2 · D3 4/2 · D4 3/2 · D5 4/2 · D6 4/2 · D7 3/2 · D8 4/2 ·
D9 4/2 · D10 3/2 · D11 4/2 · D12 3/2 · D13 3/2. Ground steps ≥ Formal steps in every pair; every view's kind is on its
unit's stage. Needs: `two-qubit` D1–D5, D8, D9; `matrix` v2 D4, D6, D7, D9, D12, D13; v1 only: D10, D11.

## 3. Try-it widget per unit

No widget handles two qubits or mixed states yet (Q6's W2 and Q8's W3, deferred). Each unit uses an existing widget with
prop forms already used in 709.

| Unit | Widget spec | Why this one |
|---|---|---|
| `q9-partial-trace` | `{kind:'sg-lab', props:{source:'oven', axes:['x'], editable:true, predict:true, seed:709}}` | One qubit of a Bell pair, read alone, behaves exactly like this unpolarized beam. |
| `q9-same-part` | `{kind:'deposit-stats', props:{state:'+x', axis:'z', seed:709}}` | One side's record is a fair coin for the singlet and for the coin pair alike. |
| `q9-entropy` | `{kind:'sg-lab', props:{source:'oven', axes:['z'], editable:false, predict:true, seed:709}}` | Each atom's reading is a full bit of surprise: S = 1 for $\tfrac12I$. |
| `q9-schmidt` | `{kind:'bloch', props:{theta:45, phi:0, editable:true, measure:'x'}}` | θ = 45° is $\|u_+\rangle$, A's Schmidt state in P. |
| `q9-purification` | `{kind:'bloch', props:{theta:45, phi:0, editable:false, measure:'z'}}` | After B reads +, A is left in $\|u_+\rangle$. |
| `q9-distance` | `{kind:'projector', props:{state:45, basis:0, editableBasis:true}}` | The shadow of $\|+\rangle$ on $\|0\rangle$ is the fidelity, 0.707. |

**Try this:**
- `q9-partial-trace`: (1) Fire 100 along x, then along z: always close to 50/50.
- `q9-same-part`: (1) Fire 100: about half each way, whichever pair the qubit came from.
- `q9-entropy`: (1) Predict, then fire 20: no strategy beats a guess.
- `q9-schmidt`: (1) Read x at θ = 45°: the average is 0.707, A's arrow direction in P.
- `q9-purification`: (1) Read z: 0.854 of the readings give 0.
- `q9-distance`: (1) Read the shadow at 45°: 0.707. (2) Turn the basis to 90°: the shadow is 0, and F = 0.

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** HW2 is submitted, so HW2 P2(d) and
P7(e) have full walkthroughs (ruling 12), marked (HW2). Bergou's ⚑ Problems 2.4–2.5 are not used as challenges (§12 Q4).

### `q9-partial-trace`
1. **warm-up · numeric · `q9-p-singlet`** — "For the singlet, what is $(\rho_A)_{00}$?"
   - Answer: **0.5** = `q9SingRA[0][0]`. Hints: (1) Trace the top-left block. (2) Its diagonal is $\rho_{00,00}$ and $\rho_{01,01}$. (3) 0 and ½. Walkthrough: 0.5.
2. **core · numeric · `q9-p-psi2`** — "For $(\sqrt3|00\rangle + |11\rangle)/2$, what is $(\rho_A)_{01}$?"
   - Answer: **0** = `q9Psi2RA[0][1]`. Hints: (1) Trace the top-right block. (2) Its diagonal entries are $\rho_{00,10}$ and $\rho_{01,11}$. (3) Both are 0; the 0.433 lies off that diagonal. Walkthrough: 0, so A has no coherence.
3. **core · numeric · `q9-p-p2d` (HW2 P2(d))** — "What is $(\rho_A)_{00}$ for $\beta_{10}$?"
   - Answer: **0.5** = `q9BellRA[2][0][0]`. Hints: (1) $\beta_{10} = (|00\rangle - |11\rangle)/\sqrt2$. (2) Trace out qubit 2. (3) Only $|00\rangle\langle00|$ feeds $(\rho_A)_{00}$.
   - Walkthrough: $|\beta_{xy}\rangle\langle\beta_{xy}| = \tfrac12\big(|0y\rangle\langle0y| + |1\bar y\rangle\langle1\bar y| + (-1)^x(|0y\rangle\langle1\bar y| + |1\bar y\rangle\langle0y|)\big)$ with $\bar y = 1\oplus y$. Tracing qubit 2 keeps the first two terms and kills the cross terms, since $\langle\bar y|y\rangle = 0$. So $\rho_1 = \tfrac12I$ for all four: no measurement on qubit 1 alone can tell them apart. The Bell measurement can, because it acts on both qubits and reads the parities $XX$ and $ZZ$, which are correlations.
4. **core · numeric · `q9-p-p7e` (HW2 P7(e))** — "For $\rho_{12} = \mathrm{Tr}_3|\mathrm{GHZ}\rangle\langle\mathrm{GHZ}|$, what is the entry in row 00, column 11?"
   - Answer: **0** = `q9GhzR12[0][3]`. Hints: (1) Which terms of $|\mathrm{GHZ}\rangle\langle\mathrm{GHZ}|$ could feed it? (2) $|000\rangle\langle111|$. (3) Its qubit-3 labels differ.
   - Walkthrough: $\rho_{12} = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$: the corner terms die because qubit 3's labels differ. The remaining pair is a mixture of the products $|00\rangle$ and $|11\rangle$, so it is not entangled: losing one qubit destroys all of GHZ's entanglement, which makes GHZ fragile.
5. **stretch · numeric · `q9-p-purity`** — "What is the purity of $\rho_A$ for $(\sqrt3|00\rangle + |11\rangle)/2$?"
   - Answer: **0.625** = `q9Psi2Pur`. Hints: (1) $\rho_A = \mathrm{diag}(0.75, 0.25)$. (2) Square the entries. (3) Add. Walkthrough: $0.5625 + 0.0625 = 0.625$.

### `q9-same-part`
1. **warm-up · numeric · `q9-s-zz`** — "For the coin pair, what is $\langle Z_AZ_B\rangle$?"
   - Answer: **−1** = `q9CoinGrid[2][2]`. Hints: (1) The members are $|01\rangle$ and $|10\rangle$. (2) The bits always differ. (3) Parity −1. Walkthrough: −1 every time.
2. **core · numeric · `q9-s-xx`** — "For the singlet, what is $\langle X_AX_B\rangle$?"
   - Answer: **−1** = `q9SingXX`. Hints: (1) The singlet's grid. (2) All three diagonal cells. (3) −1. Walkthrough: −1; the singlet is anti-aligned along every axis.
3. **core · choice · `q9-s-which`** — "Which reading tells the singlet from the coin pair?"
   - Options: **Y on both qubits, multiplied** ✓ · Z on both qubits, multiplied · Z on A alone · X on B alone. Check: `q9SingGrid[1][1]` = −1 against `q9CoinGrid[1][1]` = 0; both $zz$ cells are −1; both reduced states are $\tfrac12I$. Hints: (1) Single qubits look alike. (2) $zz$ agrees. (3) Try $yy$. Walkthrough: $yy$ is −1 against 0.
4. **stretch · numeric · `q9-s-purity`** — "What is the purity of the coin pair's whole $\rho$?"
   - Answer: **0.5** = `q9CoinPur`. Hints: (1) $\rho$ is diagonal. (2) Two entries of ½. (3) $\tfrac14 + \tfrac14$. Walkthrough: 0.5, while the singlet's whole state has purity 1.

### `q9-entropy`
1. **warm-up · numeric · `q9-e-half`** — "What is $S(\tfrac12I)$, in bits?"
   - Answer: **1** = `q9SHalf`. Hints: (1) Two eigenvalues of ½. (2) $-\tfrac12\log_2\tfrac12 = \tfrac12$. (3) Twice. Walkthrough: 1 bit.
2. **core · numeric · `q9-e-r05`** — "A qubit's arrow has length 0.5. What is S?"
   - Answer: **0.8113** = `q9SofR[1]`. Hints: (1) Eigenvalues $(1 \pm |\mathbf r|)/2$. (2) 0.75 and 0.25. (3) $-0.75\log_20.75 - 0.25\log_20.25$. Walkthrough: 0.811 bit.
3. **core · numeric · `q9-e-psi2`** — "What is the entanglement entropy of $(\sqrt3|00\rangle + |11\rangle)/2$?"
   - Answer: **0.8113** = `q9EPsi2`. Hints: (1) Find $\rho_A$. (2) $\mathrm{diag}(0.75, 0.25)$. (3) Its entropy. Walkthrough: 0.811, the same number as the previous challenge: A's arrow has length 0.5.
4. **stretch · numeric · `q9-e-thermal`** — "Unit 8.4's thermal box, with $E_Z = 2k_BT$: what is S?"
   - Answer: **0.5271** = `q9SThermal`. Hints: (1) $\rho$ is diagonal. (2) The chances are 0.881 and 0.119. (3) Use h. Walkthrough: 0.527 bit.

### `q9-schmidt`
1. **warm-up · numeric · `q9-sc-rank`** — "What is the Schmidt rank of $\psi_1\otimes|+\rangle$?"
   - Answer: **1** = `q9RankProd`. Hints: (1) It is a product. (2) One term. (3) Rank 1. Walkthrough: 1.
2. **core · numeric · `q9-sc-weight`** — "What is P's larger Schmidt weight?"
   - Answer: **0.9239** = `q9PSchmidt[0]`. Hints: (1) $\rho_A$ is Unit 8.4's mixture. (2) Its larger eigenvalue is 0.854. (3) Take the square root. Walkthrough: $\sqrt{0.854} = 0.924$.
3. **core · numeric · `q9-sc-overlap`** — "Group P by A's 0/1 basis. What is $\langle\tilde v_0|\tilde v_1\rangle$?"
   - Answer: **0.25** = `q9PVtOverlap`. Hints: (1) $\tilde v_0 = 0.707|0\rangle + 0.5|1\rangle$. (2) $\tilde v_1 = 0.5|1\rangle$. (3) Only the $|1\rangle$ parts meet. Walkthrough: $0.5\times0.5 = 0.25$: the 0/1 basis is not A's Schmidt basis.
4. **stretch · numeric · `q9-sc-rb`** — "How long is B's arrow in P?"
   - Answer: **0.7071** = `q9PRLen[1]`. Hints: (1) $\rho_B$ has A's eigenvalues. (2) $\lambda_+ - \lambda_- = |\mathbf r|$. (3) $0.854 - 0.146$. Walkthrough: 0.707, the same as A's.

### `q9-purification`
1. **warm-up · choice · `q9-pu-which`** — "Which pure state purifies $\tfrac12I$?"
   - Options: **$\Phi^+$** ✓ · $|00\rangle$ · $|0\rangle|+\rangle$ · $(\sqrt3|00\rangle + |11\rangle)/2$. Check: `q9BellRAGap[0]` → 0; the products leave A pure; `q9Psi2RA` → diag(0.75, 0.25). Hints: (1) Trace out B for each. (2) Products leave A pure. (3) A Bell state leaves $\tfrac12I$. Walkthrough: $\Phi^+$.
2. **core · numeric · `q9-pu-x`** — "Read qubit B of P along x. What is the chance of +?"
   - Answer: **0.8536** = `q9SteerX[0]`. Hints: (1) P's Schmidt form. (2) B's Schmidt states are $|{\pm}\rangle$. (3) The chance is $\lambda_+$. Walkthrough: 0.854, and A is left in $|u_+\rangle$.
3. **core · numeric · `q9-pu-z`** — "Read qubit B of P along z. What is the chance of 0?"
   - Answer: **0.5** = `q9SteerZ[0]`. Hints: (1) Write P with B's 0/1 states. (2) $\tfrac1{\sqrt2}(|0\rangle|0\rangle + |{+}\rangle|1\rangle)$. (3) $|1/\sqrt2|^2$. Walkthrough: 0.5, leaving A in $|0\rangle$.
4. **stretch · numeric · `q9-pu-ent`** — "Every purification of Unit 8.4's mixture is entangled. What is its entanglement entropy?"
   - Answer: **0.6009** = `q9EP`. Hints: (1) $E = S(\rho_A)$. (2) $\rho_A$ is the mixture. (3) Unit 9.3. Walkthrough: 0.601 bit, for any purification, since all have the same $\rho_A$.

### `q9-distance`
1. **warm-up · numeric · `q9-d-0p`** — "What is D between $|0\rangle$ and $|+\rangle$?"
   - Answer: **0.7071** = `q9D0P`. Hints: (1) Half the straight distance in the ball. (2) The points are $(0, 0, 1)$ and $(1, 0, 0)$. (3) $\sqrt2/2$. Walkthrough: 0.707.
2. **core · numeric · `q9-d-mix`** — "What is D between Unit 8.4's mixture and $\tfrac12I$?"
   - Answer: **0.3536** = `q9DZXHalf`. Hints: (1) $\tfrac12I$ is the centre. (2) The mixture's arrow has length 0.707. (3) Halve it. Walkthrough: 0.354.
3. **core · numeric · `q9-d-fid`** — "What is F between $|0\rangle$ and $\tfrac12I$?"
   - Answer: **0.7071** = `q9F0Half`. Hints: (1) One state is pure. (2) $F = \sqrt{\langle0|\rho|0\rangle}$. (3) $\sqrt{1/2}$. Walkthrough: 0.707.
4. **stretch · numeric · `q9-d-singcoin`** — "What is D between the singlet and the coin pair of Unit 9.2?"
   - Answer: **0.5** = `q9DSingCoin`. Hints: (1) Subtract: only the corners of −½ remain. (2) Their eigenvalues are ±½. (3) Half the sum of sizes. Walkthrough: D = 0.5 for the wholes, while their reduced states are 0 apart (`q9DSingCoinA`): the difference is all correlation.

## 5. Glossary terms new in Q9

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-reduced-density-matrix` | reduced density matrix | notation | The state of one part of a pair, found by adding over the other part. | $\rho_A = \mathrm{Tr}_B\,\rho$; $\langle O\otimes I\rangle = \mathrm{Tr}(\rho_AO)$ (the notes write ρ(1)). | `q9-partial-trace:b1` | — |
| `qc-partial-trace` | partial trace | notation | Adding over one part's basis states to leave a matrix for the other part. | $\mathrm{Tr}_B\,\rho = \sum_b\langle b\|_B\rho\|b\rangle_B$; $\mathrm{Tr}_B(X\otimes Y) = X\,\mathrm{Tr}\,Y$. | `q9-partial-trace:b1` | — |
| `qc-von-neumann-entropy` | von Neumann entropy | notation | The bits left unknown in a state: 0 if pure, 1 for a fair coin. | $S(\rho) = -\mathrm{Tr}(\rho\log_2\rho) = -\sum\lambda_i\log_2\lambda_i$, $0 \le S \le \log_2d$. | `q9-entropy:b1` | — |
| `qc-entanglement-entropy` | entanglement entropy | notation | How entangled a pure pair is: the entropy of either half. | $E(\psi_{AB}) = S(\rho_A) = S(\rho_B)$ (Bergou Eq. 3.41). | `q9-entropy:b4` | — |
| `qc-schmidt-decomposition` | Schmidt form | notation | A pure pair written with one term per shared chance, each term a product of orthonormal partners. | $\|\psi\rangle = \sum_k\sqrt{\lambda_k}\|u_k\rangle_A\|w_k\rangle_B$, $\lambda_k$ the nonzero eigenvalues of $\rho_A$ and $\rho_B$. | `q9-schmidt:b2` | — |
| `qc-schmidt-rank` | Schmidt rank | — | The number of terms in the Schmidt form: 1 exactly for a product. | $N = \mathrm{rank}\,C \le \min(\dim\mathcal H_A, \dim\mathcal H_B)$. | `q9-schmidt:b3` | — |
| `qc-singular-values` | singular values | — | The stretch factors of a matrix; for a pair's amplitude grid, the Schmidt weights. | $C = U\,\mathrm{diag}(s_k)\,V^\dagger$, $s_k \ge 0$, $s_k^2$ the eigenvalues of $CC^\dagger$. | `q9-schmidt:b5` | — |
| `qc-purification` | purification | notation | A pure pair whose part is a given mixed state. | $\|\Psi\rangle_{AB}$ with $\mathrm{Tr}_B\|\Psi\rangle\langle\Psi\| = \rho_A$, e.g. $\sum_i\sqrt{p_i}\|\psi_i\rangle\|i\rangle$; unique up to $I\otimes U_B$. | `q9-purification:b1` | — |
| `qc-trace-norm` | trace norm | notation | The sum of a matrix's singular values; for a Hermitian matrix, of its eigenvalues' sizes. | $\|A\|_1 = \mathrm{Tr}\sqrt{A^\dagger A}$. | `q9-distance:b1` | — |
| `qc-trace-distance` | trace distance | notation | How far apart two states are: the largest gap one yes-or-no reading can open between their chances. | $D(\rho, \sigma) = \tfrac12\|\rho - \sigma\|_1 = \max_\Pi\mathrm{Tr}\,\Pi(\rho - \sigma)$; qubits $\tfrac12\|\mathbf r - \mathbf s\|$. | `q9-distance:b1` | — |
| `qc-fidelity` | fidelity | notation | How much two states overlap: 1 if equal, 0 if orthogonal. | $F(\rho, \sigma) = \mathrm{Tr}\sqrt{\rho^{1/2}\sigma\rho^{1/2}}$; pure: $\|\langle\psi\|\varphi\rangle\|$ (root fidelity). | `q9-distance:b3` | — |

(In the table `\|` is a Markdown escape.) Reused: Q8's `qc-density-matrix`, `qc-trace`, `qc-coherence`, `qc-purity`,
`qc-pure-state`, `qc-mixed-state`, `qc-ensemble`, `qc-bloch-ball`, `qc-maximally-mixed`, `qc-unitary-freedom`; Q7's
`qc-ghz`; Q6's `qc-singlet`, `qc-beta-xy`, `qc-correlation-grid`, `qc-entangled`, `qc-factoring-test`; Q4's
`qc-tensor-operator`; Q1's `qc-hilbert-space`.

**Notation beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-reduced-density-matrix`, `qc-partial-trace` | notation | `q9-partial-trace:b1` | `mx(out(PROD), {blocks:2, partialTrace:'B'})` over `tq(PROD)` (needs: two-qubit) |
| `qc-von-neumann-entropy` | notation | `q9-entropy:b1` | `mx(ZX, {spectrum:'entropy'})` (needs: matrix-v2) |
| `qc-entanglement-entropy` | notation | `q9-entropy:b4` | `tq(PSI2, {readouts:['entropy', 'rLength']})` (needs: two-qubit) |
| `qc-schmidt-decomposition` | notation | `q9-schmidt:b2` | `mx({coef:PP}, {svd:true})` over `tq(PP)` (needs: two-qubit) |
| `qc-purification` | notation | `q9-purification:b1` | `mx(out(PP), {blocks:2, partialTrace:'B'})` over `ball(bZX, {recipe:true})` |
| `qc-trace-norm`, `qc-trace-distance` | notation | `q9-distance:b1` | `ball('+z', {compare:'+x'})` over `mx(lin(…), {spectrum:'bars'})` (needs: matrix-v2) |
| `qc-fidelity` | notation | `q9-distance:b3` | `hp({psi:'+x', basis:'z', shadows:true})` |

## 6. Review card per unit (both tracks)

### `q9-partial-trace`
- **G points:** (1) $\rho_A = \mathrm{Tr}_B\,\rho$ gives every average of a reading on A alone. (2) Each entry is a block's trace. (3) Every Bell state leaves $\tfrac12I$. (4) GHZ minus one qubit is Unit 8.1's box.
- **F points:** (1) $\langle O\otimes I\rangle = \mathrm{Tr}(\rho_AO)$. (2) HW2 P2(d): local readings cannot tell Bell states apart. (3) HW2 P7(e): $\mathrm{Tr}_3$ of GHZ is a mixture of products.
- **Equations:** $\rho_A = \mathrm{Tr}_B\,\rho = \sum_b\langle b|\rho|b\rangle,\quad (\rho_A)_{aa'} = \sum_b\rho_{ab,a'b}$
- **Trap:** keeping the corner coherences: entries with different B labels never reach $\rho_A$.

### `q9-same-part`
- **G points:** (1) The singlet and the coin pair give the same $\rho_A$ and $\rho_B$. (2) Their grids differ: −1, −1, −1 against 0, 0, −1. (3) Only joint readings see the difference.
- **F points:** (1) Reduced states do not determine the whole. (2) Notes Eq. 2.22 and the general partial trace. (3) Bergou's Eq. 2.9 is $\mathrm{Tr}_B$.
- **Equations:** $\mathrm{Tr}_2\big(|i_1\rangle\langle j_1|\otimes|i_2\rangle\langle j_2|\big) = \delta_{i_2j_2}|i_1\rangle\langle j_1|$
- **Trap:** "same parts, same whole": the correlations live only in the whole.

### `q9-entropy`
- **G points:** (1) $S = -\sum\lambda\log_2\lambda$ from $\rho$'s eigenvalues. (2) Pure 0, fair coin 1 bit, at most $\log_2d$. (3) For a qubit S depends only on the arrow's length. (4) $E = S(\rho_A)$ measures a pure pair's entanglement.
- **F points:** (1) Notes Eq. 2.23. (2) $S = h\big(\tfrac12(1 + |\mathbf r|)\big)$. (3) Bergou Eq. 3.41.
- **Equations:** $S(\rho) = -\mathrm{Tr}(\rho\log_2\rho)$
- **Trap:** computing S from a recipe's weights: Unit 8.4's mixture has weights ½, ½ but S = 0.601, not 1.

### `q9-schmidt`
- **G points:** (1) Grouping by A's eigenvectors makes the partners orthogonal. (2) The weights are $\sqrt\lambda$. (3) Rank 1 means a product. (4) Both halves share their eigenvalues.
- **F points:** (1) Notes Eqs. 2.24–2.28. (2) Schmidt = SVD of C (N&C Theorem 2.7). (3) $S(\rho_A) = S(\rho_B)$.
- **Equations:** $|\psi\rangle = \sum_k\sqrt{\lambda_k}|u_k\rangle|w_k\rangle$
- **Trap:** taking the 0/1 rows of the grid as the Schmidt terms: they overlap unless the basis is $\rho_A$'s eigenbasis.

### `q9-purification`
- **G points:** (1) Every mixture is one half of a pure pair. (2) Tag each member with an orthogonal partner state. (3) Two purifications differ by a gate on the partner. (4) A reading on the partner picks a recipe for A.
- **F points:** (1) Bergou Eqs. 2.53–2.55. (2) Eq. 2.56, corrected: $U_B|v_k\rangle = |w_k\rangle$. (3) The partner's unitary is the recipe unitary of Unit 8.6.
- **Equations:** $|\Psi\rangle = \sum_i\sqrt{p_i}|\psi_i\rangle|i\rangle$
- **Trap:** forgetting the square root: $\sum_ip_i|\psi_i\rangle|i\rangle$ is not normalized and traces to the wrong $\rho$.

### `q9-distance`
- **G points:** (1) D is half the sum of the eigenvalue sizes of $\rho_1 - \rho_2$. (2) For qubits, half the straight distance in the ball. (3) For pure states F is the overlap's size. (4) Pure: $D = \sqrt{1 - F^2}$.
- **F points:** (1) $D = \max_\Pi\mathrm{Tr}\,\Pi(\rho_1 - \rho_2)$ (Bergou Eq. 2.58). (2) N&C Eq. 9.20. (3) $1 - F \le D \le \sqrt{1 - F^2}$ (Bergou Eq. 2.62).
- **Equations:** $D = \tfrac12\|\rho_1 - \rho_2\|_1,\quad F = \mathrm{Tr}\sqrt{\rho_1^{1/2}\rho_2\rho_1^{1/2}}$
- **Trap:** mixing the two fidelity conventions: Bergou and N&C use the root; some texts square it.

## 7. Symbol-before-use tables

Abbreviations: pt, sp, en, sc, pu, di (the six units in order). Carried from Q1–Q8 and recapped at `q9-partial-trace:b1`:
ρ, Tr, coherences, purity, ensembles, the Bloch ball and $\mathbf r$, $\tfrac12I$, the recipes and $|u_\pm\rangle$ (Q8);
GHZ (Q7); $\Phi^\pm$, $\Psi^\pm$, $\beta_{xy}$, the grid T and $\mathbf r_A$, $\mathbf r_B$, the coefficient grid C and its
singular-value bars (Q6); $A\otimes I$ (Q4); eigenvalues, projectors, the Pauli algebra (Q3); $\delta_{ij}$, unitaries,
H (Q2); overlaps $\langle\varphi|\psi\rangle$ and the Hilbert space (Q1).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| A, B (qubits) | pt:b1 | pt:b1 | OK | — |
| O | pt:b1 (D1) | D1 step 1 | OK | An operator on A alone; O, not A, so the qubit's letter stays free (§12 Q2). |
| $\rho_A$, $\mathrm{Tr}_B$ | pt:b1 | pt:b1 | OK | — |
| $Z_A$, $X_A$ | pt:b6 | pt:b1 | OK | Subscript = qubit, as Q6's $Z_1$. |
| $\Psi^-$, $\beta_{11}$ | pt:b3 | Q6 | OK | Rosetta in place (ruling 9). |
| $\beta_{xy}$ | pt:b4 | Q6 | OK | — |
| $\rho_{ab,a'b'}$ | sp:b3 | sp:b3 | OK | — |
| S, $\log_2$, λ | en:b1 | en:b1 | OK | — |
| d | en:b2 | en:b2 | OK | — |
| E | en:b4 | en:b4 | OK | — |
| P (the pair), $\tilde v_0$, $\tilde v_1$ | sc:b1 | sc:b1 | **FLAG** | P is a ket's name ($\|P\rangle$); projectors in Unit 9.6 are written Π (§12 Q2). |
| $\rho_B$, $\mathbf r_A$, $\mathbf r_B$ | sc:b4 | sc:b4; Q6 | OK | — |
| D | di:b1 | di:b1 | OK | — |
| F | di:b3 | di:b3 | OK | — |
| α, $\|\psi_1^\perp\rangle$ | D13 | D13 step 1 | OK | α is an angle in the plane, not the Bloch θ. |
| h | D7 | D7 step 5 | OK | — |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\rho(1)$, $\mathrm{Tr}_2$ | pt:b1 | pt:b1 | OK | The notes' names, given as a Rosetta. |
| $\rho_{12}$, $\mathrm{Tr}_3$ | pt:b5 | pt:b5 | OK | Qubit numbers for the three-qubit case. |
| $\Psi_2$ | pt:b2 | Q6 (HW2's name) | OK | Written out in place. |
| $\Phi_-$ (Bergou) | pt:b3 | pt:b3 | OK | Rosetta. |
| $\rho_c$ | sp:b1 | sp:b1 | OK | — |
| $p_{i_1i_2,j_1j_2}$ | sp:b3 | sp:b3 | OK | The notes' Eq. 2.22. |
| $h(p)$ | en:b3 | en:b3 | OK | — |
| $i_1$, $i_2$, $c_{i_1i_2}$, $u_{i_1}$, $v_{i_2}$, $w_{i_1}$ | sc:b1, b2 | sc:b1, b2; Q6 ($c_{i_1i_2}$) | OK | The notes' indices. |
| $\mathcal H_A$, N | sc:b3 | Q1; sc:b3 | OK | — |
| U, V, $\mathrm{diag}(s_k)$ | sc:b5 | sc:b5 | OK | — |
| $\|\Psi\rangle$, $\|\Psi'\rangle$, $I_A$, $U_B$ | pu:b1, b2 | pu:b1, b2 | OK | — |
| $p_+$ | pu:b3 | pu:b3 | OK | A chance, lower-case. |
| $\|A\|_1$ | di:b1 | di:b1 | **FLAG** (minor) | A is a generic matrix here; no qubit A appears in Unit 9.6. |
| Π (projector) | di:b1 | Q6, Q3 | OK | — |
| $\rho^{1/2}$ | di:b3 | di:b3 | OK | The positive square root, defined in place. |

**Counts:** Ground 1 FLAG, Formal 1 FLAG, both resolved in place.

## 8. Errata

None in the mathematics of notes L7 pp. 38–40. Checked: ⟨S₁z⟩ = Tr(ρS₁z) ⇒ ρ(1) = Tr₂ρ; the singlet's 4 × 4 matrix and
ρ(1) = ½·1; the coin mixture's matrix and its reduction; Eq. 2.22; Eq. 2.23 with pure 0, ½I one bit, log₂d; Eqs.
2.24–2.28, including the index bookkeeping of Eq. 2.26 (render of p. 40 checked).

**Carried from the map (Bergou):**
| Id | Where | Correction | Used in |
|---|---|---|---|
| B2 | p. 17, Eq. 2.9 | "Tr" is $\mathrm{Tr}_B$ | `q9-same-part:b3` F |
| B4 | p. 26 | $\|A\|_1 = \sum_j\sqrt{\lambda_j}$ with $\lambda_j$ the eigenvalues of $A^\dagger A$ (the singular values), not $\sum_j\|\lambda_j\|$ | `q9-distance:b1` F states the right form |
| B5 | p. 26, Eq. 2.56 | $U_B\|u_k\rangle$ → $U_B\|v_k\rangle$ | `q9-purification:b2` F, D11 |

**Silent notes (no box).**
| Where | Point | Action |
|---|---|---|
| notes p. 38 against p. 40 | ρ(1), $\mathrm{Tr}_2$ (particles 1, 2) become $\rho_A$, $\mathrm{Tr}_B$ | $\rho_A$, $\mathrm{Tr}_B$ throughout, Rosetta in `q9-partial-trace:b1` F |
| notes p. 40 | Opens with "any mixed state is a reduced pure state", then derives Schmidt | Schmidt (Unit 9.4) before purification (Unit 9.5), as Bergou §2.5–2.6 |
| notes p. 39 | "$\log_2d$, the largest value" is stated, not proved | Stated; the proof stays in Part X (re-map §2.2) |
| Bergou p. 27 | Fidelity is the root $\mathrm{Tr}\sqrt{\cdot}$; some texts use its square | One sentence in `q9-distance:b3` F |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
**No new functions.** Q9 uses `density` (`partialTrace`, `reducedDensity`, `reducedBloch`, `purityN`, `vonNeumann`,
`entanglementEntropy`, `spectrum`, `schmidt`, `purify`, `eigenEnsemble`, `ensembleUnitary` (2 × 2 only, so Q8's padding
bug does not touch it), `traceDistance`, `fidelity`, `fvdg`, `mixtureN`, `densityOf`), `state` (`bell`, `ghz`,
`coefMatrix`, `schmidtRank`), `cmat` (`svd`, `eigh`, `kronM`), `measure` (`measureInBasis`, `expectationN`) and
`circuit.runCircuit` (C_PUR's controlled H runs correctly: (0.707, 0.5, 0, 0.5)).

**Notes for `Q9.values.ts`.**
- `purify(ρ)` pairs ρ's eigenvalues with the reference states in `eigh`'s ascending order ($|u_-\rangle|0\rangle$ first),
  while the plan's $|\Psi_{\rm eig}\rangle$ pairs the larger eigenvalue with $|0\rangle$, as `eigenEnsemble` orders them.
  The two differ by an X on B; both are purifications. The values file builds $|\Psi_{\rm eig}\rangle$ from Q8's sign-fixed
  kets and uses `purify` only for `q9PurifyGap`.
- `q9PurU` comes from `ensembleUnitary(eigen-recipe, {|0⟩, |+⟩})`; with the sign-fixed kets it is exactly H, and
  `q9PurUGap` checks $(I\otimes U)|\Psi_{\rm eig}\rangle = |P\rangle$ entry by entry.
- A's state after a reading of B: `reducedDensity(measureInBasis(P, 1, basis).post[k], [0])`, compared with `fidelity`.

The claim ledger is §1.7.

### 9.2 Stage contract
**`two-qubit` (needs: two-qubit).** Fields used, all from re-map §6.1: `source:{ket}` (Bell states, `PROD`, `PSI2`, `PP`),
`source:{rho}` (`COIN`), `source:{reduce:{ket:GHZ, keep:[0,1]}}`, `source:{family:'cos-sin', thetaDeg:22.5}` (a
non-integer angle), `arrows:'reduced'`, `grid:'T' | 'none'`, `highlight` (`'xx'`, `'yy'`), `readouts` (`'rLength'`,
`'entropy'`), `labels:'A-B' | 'q1-q2'`. **One semantic to fix in the build:** for a pure `ket` source, the `'entropy'`
readout is $E = S(\rho_A) = S(\rho_B)$ and is labelled so; for a `rho` source it is the whole state's S (§12 Q8). Beats:
pt:b1, b3, b4, b5, b6 (reveal not), sp:b1, b2, b4; en:b4; sc:b2, b4, b6; derivations D1–D5, D8, D9.

**`matrix` v2 (needs: matrix-v2).**
| Field | Used as | Beats and derivations |
|---|---|---|
| `partialTrace:{keep:[0,1]}` with `blocks:4` on an 8 × 8 ρ | $\mathrm{Tr}_3$ of GHZ | pt:b5; D4 |
| `spectrum:'entropy'` | S of ZX, $\tfrac14I_4$, the box, a swept $\mathrm{diag}(w, 1 - w)$ | en:b1, b2, b3, b5; D6, D7 |
| `spectrum:'bars'` **together with `partialTrace`** | the reduced matrix's eigenvalues, not the full ρ's | sc:b4; D9 |
| `{lin:[[1, out(K₁)], [-1, out(K₂)]]}` with `spectrum:'bars'` | $\rho_1 - \rho_2$ and its ±0.707 | di:b1; D12, D13 |
| `partialTrace:'A'` with exact arrows | $\rho_B$ of P | sc:b4; D9 |

Two requests for the `matrix` v2 build (§12 Q3): (a) with `partialTrace` set, `spectrum` describes the reduced matrix; (b)
the negative-eigenvalue flag should read "negative" for a `lin` difference, and "not a state" only when the source claims
to be a density matrix (Q8's `q8-ball:b6` uses that second reading).

**v1 checks for the builder.** (a) `out(PSI2)` with `blocks:2`, `partialTrace:'B'` and `highlight` on the dropped corners;
(b) `{coef:PP}` with `highlightRow` and with `svd`; (c) `mix` of four kets at ¼ (`HALF4`); (d) `C_PUR` passes the circuit
validator with a controlled H; (e) `bloch-ball` with `compare:'oven'` and `purity:false`; (f) `hilbert-plane` with
`psi:{planeDeg:V.q9Ang06}`.

**Fallbacks if a kind slips past the Q9 build** (derivations keep ≥ 2 distinct views with what remains):
| Beat | Fallback |
|---|---|
| two-qubit beats | the same beat's `mx` view alone, with the grid or arrow values in the caption |
| pt:b5 (`keep`) | `mx(out(GHZ), {blocks:4})` and `mx(BOX)` (Q8) in sequence |
| entropy beats | `mx(…)` without `spectrum`, S in the caption |
| sc:b4 | `mx(out(PP), {blocks:2, partialTrace:'A'})` and the eigenvalues in the caption |
| di:b1 | `ball('+z', {compare:'+x'})` alone |

### 9.3 Widget gaps
None new; Q6's W2 (`two-qubit-lab`) and Q8's W3 (`ball-mixer`) would serve Units 9.1–9.5 when built.

## 10. Media
- **Opener:** none; the Part III opener is Q8's.
- **Film (deferred) `qc-q9-schmidt`** "Grouping a pair": the grid's rows $\tilde v_0$, $\tilde v_1$ (overlap 0.25) turn as A's
  basis turns to $|u_\pm\rangle$, until they are orthogonal with squared lengths 0.854 and 0.146. Manifest: `q9PVt`,
  `q9PVtOverlap`, `q9PVtEig`, `q9PVtEigNorm2`, `q9PSchmidt`.
- **Decor (Higgsfield, credits need the user):** two glass spheres on a dark bench, one clear and one frosted, joined by a
  faint thread of light; no text, no numbers, no diagrams.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-partial-trace` | Looking at one part: the partial trace | Q9 · `q9-partial-trace` | `qc-density-matrix`, `qc-bell-basis`, `qc-ghz` | — |
| `qc-same-part` | Same part, different whole | Q9 · `q9-same-part` | `qc-partial-trace`, `qc-lost-record` | `mixtures` |
| `qc-entropy` | The entropy of a state | Q9 · `q9-entropy` | `qc-bloch-ball`, `qc-partial-trace` | — |
| `qc-schmidt` | The Schmidt form of a pair | Q9 · `q9-schmidt` | `qc-entropy`, `qc-entanglement` | — |
| `qc-purification` | Every mixture is part of something pure | Q9 · `q9-purification` | `qc-schmidt`, `qc-recipes` | — |
| `qc-state-distance` | Trace distance and fidelity | Q9 · `q9-distance` | `qc-bloch-ball`, `qc-inner-product` | — |

Bridge id used: `qc-l6-mixture` (exists). Q8's stations (`qc-density-matrix`, `qc-lost-record`, `qc-bloch-ball`,
`qc-recipes`) and Q6's (`qc-bell-basis`, `qc-entanglement`) are built first or in parallel; edges land when both merge.

**Future bridges (TODO; targets not built):** Q10 (separable mixtures: the box and the coin pair; no-signalling from
$\rho_B$), Q12 (E as a measure; concurrence), Q13 (purification and Stinespring), Q14 (the trace norm and Helstrom), Part X
(the proofs behind S).

### 11.2 Arcade (6 levels)
Label constant: `const Q9x = (unit, label) => ({ lecture: 'Q9', unit, label })`. All six are Spot the error.
1. **`q9-partial-trace` · `qc-local-bell`** — "Tell them apart locally?"
   - Steps: "$\Phi^+$ and $\Phi^-$ are orthogonal." · "So some measurement tells them apart perfectly." · "Tracing out qubit B leaves $\tfrac12I$ for both." · "So a reading of qubit A alone tells them apart."
   - `wrong: 3`. Why: both leave $\rho_A = \tfrac12I$; only a joint reading separates them (`q9BellRAGap`).
2. **`q9-same-part` · `qc-same-whole`** — "Same parts, same pair?"
   - Steps: "The singlet leaves $\rho_A = \tfrac12I$." · "The coin pair leaves $\rho_A = \tfrac12I$." · "Their $\rho_B$ agree as well." · "So the singlet and the coin pair are the same state."
   - `wrong: 3`. Why: their $xx$ cells are −1 and 0 (`q9SingXX`, `q9CoinXX`).
3. **`q9-entropy` · `qc-entropy-weights`** — "Weights or eigenvalues?"
   - Steps: "Unit 8.4's mixture is $|0\rangle$ and $|+\rangle$, half each." · "S is computed from the eigenvalues of $\rho$." · "The eigenvalues are the recipe's chances, ½ and ½." · "So S = 1 bit."
   - `wrong: 2`. Why: the eigenvalues are 0.854 and 0.146, so S = 0.601 (`q8ZXEig`, `q9SZX`).
4. **`q9-schmidt` · `qc-schmidt-rows`** — "Any basis will do?"
   - Steps: "Group P by A's 0/1 basis: $\tilde v_0 = 0.707|0\rangle + 0.5|1\rangle$, $\tilde v_1 = 0.5|1\rangle$." · "Their squared lengths are 0.75 and 0.25." · "Every pure pair can be grouped this way." · "So P's Schmidt weights are $\sqrt{0.75}$ and $\sqrt{0.25}$."
   - `wrong: 3`. Why: these partners overlap (0.25); the weights come from $\rho_A$'s eigenbasis: 0.924 and 0.383 (`q9PVtOverlap`, `q9PSchmidt`).
5. **`q9-purification` · `qc-purification-unique`** — "One purification only?"
   - Steps: "P purifies Unit 8.4's mixture." · "The eigen-recipe gives another purification." · "Both leave the same $\rho_A$." · "So they must be the same two-qubit state."
   - `wrong: 3`. Why: they differ by an H on B (`q9PurHGap`).
6. **`q9-distance` · `qc-fidelity-gap`** — "Which formula?"
   - Steps: "$|0\rangle$ and $|+\rangle$ overlap with size 0.707." · "So F = 0.707." · "For pure states $D = \sqrt{1 - F^2}$." · "So D = 1 − 0.707 = 0.293."
   - `wrong: 3`. Why: $D = \sqrt{1 - 0.5} = 0.707$; $1 - F$ is only the lower bound (`q9D0P`, `q9F0P`).

## 12. Questions for the judge

**Q1. The running pair P.** P = (|00⟩ + |+⟩|1⟩)/√2 needs a new circuit with a controlled H (`C_PUR`). It makes Q9's
Schmidt weights, entropy and purification the numbers of Q8's mixture, eigen-recipe and recipe unitary. *Recommend:*
accept; the engine already runs it, and the builder checks the circuit stage draws a controlled H.

**Q2. Letters.** Three clashes are avoided by renaming: the operator on A is O (not A), the projectors of Unit 9.6 are Π
(not P, which names the pair), and the chance after reading B is $p_+$. *Recommend:* accept; none of these appears in the
notes with a conflicting meaning.

**Q3. Two `matrix` v2 semantics** (§9.2): `spectrum` with `partialTrace` means the reduced matrix's spectrum, and the
negative flag on a `lin` difference reads "negative", not "not a state". *Recommend:* add both to the v2 brief now (the
build is running), with one test each.

**Q4. ⚑ Bergou P2.5.** Its result ($D = \sqrt{1 - F^2}$ for pure states) is derived in D13 from N&C's Eqs. 9.97–9.99 and
cited as "Bergou Problem 2.5 asks for it"; it is not a challenge. *Recommend:* accept, and re-check when HW3 is ingested,
as ruling 13 did for P10.1(a). If HW3 assigns P2.5, D13 stays (the notes-independent N&C route) and the cite is dropped.

**Q5. The `plot` view.** The re-map's D7 uses `plot{S against |r|}`; `plot` is not in build (ruling 7, batch 3–4).
*Recommend:* a swept `diag(w, 1 − w)` with `spectrum:'entropy'` now; retrofit a `plot` view when the kind lands.

**Q6. E in Q9.** The re-map names E in `q9-entropy` and leaves its properties to Q12. *Recommend:* a notation beat here
(E = S(ρ_A), Bergou Eq. 3.41), and Q12 links back.

**Q7. Unit 9.6 has no [L] beat.** Ruling 11 makes it a Bergou-only unit, so every beat is [B]. *Recommend:* the content
lint allows a unit whose first phase is `'books'` when the chapter header marks it Bergou-only; if the lint insists on
`'lecture'` first, the judge rules which.

**Q8. The two-qubit `'entropy'` readout.** Re-map §6.1 lists it without saying which entropy. *Recommend:* for a pure
`ket` source, $E = S(\rho_A)$, labelled "E"; for a `rho` source, the whole state's S. The two-qubit build (running) takes
this into its validator message and its tests.
