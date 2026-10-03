# P-Q13-story — Q13 "Open-system maps: Kraus operators and impossible machines" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q8-story.md` (two tracks; the 13 sections of
`skills/03-chapter-plan`), with the two standing gates: every derivation list, in both tracks, steps the stage through
≥ 2 distinct views (`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one
notation beat (`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Map entry: `P-709-remap-L1L7.md` §2 (Q13, line
~182), §4 row Q13 (D1–D6), §5 (𝓔(ρ), Choi matrix), §6 (engine E3 `channels`; `bloch-ball` `ellipsoid` field). Rulings:
`qc709-remap.md` (the review rulings: no raw TeX, engine-backed answers), `qc709-Q8Q9.md` (#5 ⚑ as cited derivation;
#4 `ptranspose`/`spectrum` on `matrix`). Planned together with `P-Q12-story.md`, whose partial transpose returns here
as "the transpose is positive but not completely positive".

**Phase.** Q13 is a **`'books'`-phase** chapter (notes stop at Lecture 7): every ramp beat is `[B]` (phase `'books'`,
rank 1) and every clue is `[C]` (phase `'clue'`). No `[L]` beat, no `'core'`/`'lecture'` phase. Sources are books only.

**Sources read** (printed pages; paraphrased, never quoted — copyrighted).
- Bergou Ch. 4: §4.1.1 pp. 65–66 (the Kraus / operator-sum representation, Eqs. 4.1–4.5); §4.1.2 pp. 66–68 (the three
  properties; complete positivity; the transpose as a positive-but-not-CP map); §4.1.3 pp. 68–69 (the Stinespring
  dilation Eqs. 4.6–4.8, the Kraus freedom $D_\nu = \sum_\mu U_{\nu\mu}A_\mu$ Eq. 4.28, at most $N^2$ operators);
  §4.2 pp. 70–71 (the depolarizing channel Eqs. 4.29–4.34, $\mathbf r' = (1 - 4p/3)\mathbf r$); §4.3 pp. 72–73 (the
  no-cloning theorem Eqs. 4.35–4.37 and Herbert's FTL scheme §4.3.2); P4.1–P4.5 (all ⚑; P4.5 amplitude damping cited).
- N&C Ch. 8: §8.2.3 pp. 360–361 (operator-sum, completeness $\sum_k E_k^\dagger E_k = I$, Eqs. 8.9–8.14); Box 8.2
  p. 368 (complete positivity vs positivity, the transpose on half of $(|00\rangle + |11\rangle)/\sqrt2$); §8.3.2
  pp. 374–375 (the affine Bloch map $\mathbf r\to M\mathbf r + \mathbf c$, Eqs. 8.87–8.90); §8.3.4 pp. 378–379
  (depolarizing, Eqs. 8.100–8.103); and Box 12.1 p. 532 (the no-cloning proof $\langle\psi|\varphi\rangle = \langle\psi|\varphi\rangle^2$).
- Ownership (re-map §2.2): Q13 owns quantum channels, Kraus operators, the Choi matrix, Stinespring dilation, the
  depolarizing/flip/damping channels, no-cloning, Herbert. **Q8** owns ρ, $\mathrm{Tr}$, the Bloch ball, the von
  Neumann equation (`q8-trace-rule`, the bridge target). **Q12** owns the partial transpose — Q13 links back for
  "transpose is not CP". **Q10** owns no-signalling — Q13 links back for Herbert. **Q9** owns the partial trace.

**Evidence.** Every number was computed twice, for Q12 and Q13 at once.
- The app's merged engine on `main` (`q1213plan-engine.ts`, scratchpad, rolldown + node). E3 is not built yet, so each
  channel number is computed here from the merged primitives (`matmul`, `dagger`, `madd`, `mscale`, `ptranspose`,
  `eigh`, `reducedBloch`, `densityOf`, `inner`, the Pauli gates) by the same route the future E3 function will use.
- An independent numpy/scipy route (`q1213plan-numpy.py`): explicit Kraus sums $\sum_k K_k\rho K_k^\dagger$; the affine
  factor read off by applying the map to $|+\rangle$ and measuring $r_x$; the partial transpose by an axis swap; the
  no-cloning overlap by `vdot`.
- Result (`q1213plan-compare.py`): 78 numbers under 33 keys (both chapters) agree to 6 decimals, **no exceptions**.

**Conventions** (Q8/Q9/Q12's, plus these).
- **The channel letter is $\mathcal E$** (N&C's; Bergou writes $T$). A one-line Rosetta in the notation beat:
  "the book also writes $T(\rho)$". **Kraus operators are $A_m$** (Bergou) — N&C's $E_k$ is noted once.
- **The Bloch vector is $\mathbf r$** (Q8, ruling 10). N&C writes $\vec r$, Bergou writes $\mathbf n$ in Eq. 4.31 — a
  Rosetta line, once, at `q13-depolarizing:b2`.
- **$\hat H$** for any Hamiltonian (Q8 ruling 4), though Q13 uses it only in a link-back to `q8-trace-rule`.
- **The depolarizing weight is $p$**; the factor is $1 - \tfrac{4p}3$ (Bergou's parametrization, Eq. 4.33). N&C's
  $(1 - p)$ parametrization (Eq. 8.102) is noted once as a Rosetta.
- **Units & text.** All inline math is TeX inside `$…$`; no TeX command outside `$…$`. No plan ids in learner text;
  cross-references read "Unit 13.2", "Chapter Q12". Every number is rendered from its claim with `d(V.key, n)`; the
  plan prints the value for review only. No amplitude or matrix entry is a percent; this chapter shows no percent.
  Units in order: 13.1 `q13-from-unitary`, 13.2 `q13-properties`, 13.3 `q13-stinespring`, 13.4 `q13-depolarizing`,
  13.5 `q13-no-cloning`, 13.6 `q13-herbert`.
- **Claim keys** `q13…` in `Q13.values.ts`.

**Stage shorthand.** Q8/Q9/Q12's forms carry over; new ones marked.

| Shorthand | Expands to | Needs |
|---|---|---|
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'decimal', ...f}` | matrix-v2 |
| `circ(C, k, f)` | `{kind:'circuit', circuit:C, upTo:k, ...f}` | — |
| `amp(S, f)` | `{kind:'amplitudes', state:S, ...f}` | — |
| `ball(P, f)` | `{kind:'bloch-ball', point:P, shot:'B-STD', ...f}` | — |
| `ballE(ch, f)` (new) | `{kind:'bloch-ball', point:'oven', ellipsoid:ch, ...f}` — the image of the ball under channel `ch` (§9.2) | ball-ellipsoid |
| `tq(S, f)` | `{kind:'two-qubit', source:{ket:S}, labels:'A-B', ...f}` | two-qubit |
| `tqR(M, f)` | as `tq`, with `source:{rho:M}` | two-qubit |
| `plot(fn, x, f)` | `{kind:'plot', fn, x, ...f}` (SVG `plot`, Q12 §9.2) | plot |

| Matrix source | Expands to | Needs |
|---|---|---|
| `out(K)` | `{outer:[K]}` = \|K⟩⟨K\| | matrix |
| `rho(K)` | `{rho:{ket:K}}` | matrix |
| `pa('X')` | `{pauli:'X'}` | matrix-v2 |
| `prod(A, B, …)` | `{product:[A, B, …]}` | matrix-v2 |
| `lin([c, A], …)` | `{lin:[{c, src:A}, …]}`, c from the fixed exact set | matrix-v2 |
| `kraus(ch)` (new) | a `lin` of `product`s realizing $\sum_m A_m^\dagger A_m$ or $\sum_m A_m\rho A_m^\dagger$ from `ch`'s Kraus list (built in the values file; the stage draws the resulting matrix) | matrix-v2 |
| field `ptranspose:'B'`, `spectrum:'bars'` | the partial transpose / eigenvalue bars (negatives flagged) | matrix-v2 |

| Name | Source | Value (review only) |
|---|---|---|
| `DEPOL(p)` | depolarizing Kraus $\{\sqrt{1-p}\,I, \sqrt{p/3}\,X, \sqrt{p/3}\,Y, \sqrt{p/3}\,Z\}$ | Bergou Eq. 4.30 |
| `PHI` | `{bell:'00+11'}` | $\Phi^+$ |
| `PLUS`, `ZERO` | `{ket:'+'}`, `{ket:'0'}` | the no-cloning pair |
| `MZ`, `MX` | `mix([1/2, {ket:'00'}], [1/2, {ket:'11'}])`; `mix([1/2, {ket:'++'}], [1/2, {ket:'--'}])` | Alice's $z$- / $x$-basis non-selective measurement of $\Phi^+$ (Bob reduced $= \tfrac12 I$ either way) |

**Circuits.** `C_DEPOL` (wires S, E₁, E₂): system `|ψ⟩` on S, environment `|00⟩` on E₁E₂, a `unitary` op `U_SE` (the
dilation of Bergou Eq. 4.29; matrix from `Q13.values.ts`), then the environment traced out (drawn by the stage's
`partialTrace`, not a measurement). `C_CLONE` (wires data, blank): a single CNOT, data the control — the "cloner" that
copies basis states but entangles superpositions. Both carry `wires` labels.

## 0. Chapter map
Q13 answers the map's question: **"What happens to a qubit that leaks information into its surroundings, and which
machines are forbidden outright?"** It is the first chapter of Part V, "Dynamics and measurement".

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q13-from-unitary` | Where channels come from | How does a qubit evolve when it is coupled to something we ignore? | Bergou §4.1.1 pp. 65–66; N&C §8.2.3 pp. 360–361 | — | Q8 `q8-trace-rule`; Q9 partial trace |
| 2 | `q13-properties` | What a channel preserves — and the catch | Which maps on density matrices are physically allowed? | Bergou §4.1.2 pp. 66–68; N&C Box 8.2 p. 368 | — | Q12 `q12-ppt` (partial transpose) |
| 3 | `q13-stinespring` | Every channel is a unitary in disguise | Can any channel be realised by a unitary on a larger system? | Bergou §4.1.3 pp. 68–69 | — | Q13 `q13-from-unitary` |
| 4 | `q13-depolarizing` | The shrinking Bloch ball | What does noise do to the Bloch ball? | Bergou §4.2 pp. 70–71; N&C §8.3.2–8.3.4 pp. 374–379 | `l6-bloch` | Q8 `q8-ball` |
| 5 | `q13-no-cloning` | Why you cannot copy a qubit | Can one build a machine that duplicates an unknown state? | Bergou §4.3.1 pp. 72–73; N&C Box 12.1 p. 532 | — | Q4 `q4-cnot`; Q2 linearity |
| 6 | `q13-herbert` | Cloning would break relativity | What would a perfect copier let you do? | Bergou §4.3.2 p. 73 | — | Q10 `q10-no-signal`; Q13 `q13-no-cloning` |

**Outcomes** (Ground wording):
- Write a qubit's open evolution as $\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger$, and read the trace-preserving condition $\sum_m A_m^\dagger A_m = I$ off the coupling unitary.
- List what a channel preserves, and show by one example that positivity alone is not enough: complete positivity is.
- Say why every channel is a unitary on a bigger system, and that a qubit channel needs at most four Kraus operators.
- Turn the depolarizing channel into a shrinking of the whole Bloch ball by $1 - \tfrac{4p}3$.
- Prove in three lines that no unitary can clone an unknown qubit.
- Explain why a perfect copier would permit faster-than-light signalling.

**Prerequisites** (concepts): Q8 `qc-density-matrix`, `qc-trace`, `qc-bloch-ball`, `qc-von-neumann-equation`,
`qc-positive-operator`; Q9 `qc-partial-trace`, `qc-purify`; Q12 `qc-partial-transpose`; Q10 `qc-no-signalling`;
Q6 `qc-bell-basis`; Q4 `qc-cnot`, `qc-tensor-operator`; Q2 `qc-unitary`, `qc-operator-matrix`. 448 twins: `l6-bloch`.

**Openers and films.** Part V's opener (the Blender "the ball shrinks", old map §6) is re-homed here (§10); one Motion
Canvas film is planned and deferred (§10).

## 1. Story beats per unit
Kinds per unit (a derivation `view` may use only kinds the unit's beat stages show): `q13-from-unitary` circuit,
matrix · `q13-properties` matrix · `q13-stinespring` circuit, matrix · `q13-depolarizing` bloch-ball, plot, matrix ·
`q13-no-cloning` amplitudes, circuit · `q13-herbert` bloch-ball, two-qubit. Fidelity items: the `matrix` items
(`qc-matrix-entries`, `qc-matrix-trace-engine`, `qc-matrix-not-a-space`), `qc-circuit-engine-state`, `qc-amp-engine`,
the `bloch-ball` items (`ball-inside-not-partly-up`, `ball-born-inside`), the `two-qubit` items (`qc-tq-local-arrows`,
`qc-tq-not-two-places`), the new `qc-ball-ellipsoid-engine` (§9.2) and `qc-plot-engine-curve` (Q12 §9.2).

**Phase note.** Every ramp beat is `[B]` (`'books'`); clues are `[C]`. No `[L]`.

### Unit `q13-from-unitary` — Where channels come from

**`q13-from-unitary:b1` [B]** (closed vs open evolution)
- **G:** "Chapter Q8 moved $\rho$ by a unitary, $\rho\to U\rho U^\dagger$ — the whole story for a closed system. But a real qubit touches its surroundings. Couple it to an environment, let the pair evolve by one unitary, then ignore the environment. What is left is no longer unitary."
- **F:** "Closed evolution is $\rho\to U\rho U^\dagger$ with $U = e^{-i\hat H t}$ (Chapter Q8). The general case couples the system to an environment $E$, applies a joint unitary $U_{SE}$, and traces $E$ out (Chapter Q9's partial trace). The resulting map on the system alone is non-unitary, and is called a quantum channel."
- **Cap:** G "closed: $\rho \to U\rho U^\dagger$; open: couple, evolve, forget the environment" · F "$\rho \to \mathrm{Tr}_E[U_{SE}(\rho\otimes\rho_E)U_{SE}^\dagger]$: non-unitary in general"
- **Stage:** `circ(C_DEPOL, 0, {})` — the system and environment wires, before coupling. needs: circuit.
- **Terms:** `qc-von-neumann-equation` (Q8, link-back), `qc-partial-trace` (Q9, link-back).

**`q13-from-unitary:b2` [B] · notation beat, `introduces: ['qc-quantum-channel']`** (the operator sum)
- **G:** "Collapse that recipe into operators on the qubit alone. The result is the [[qc-quantum-channel|channel]] $\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger$, a weighted spread of the state. Each $A_m = \langle m|U_{SE}|0\rangle_E$ reads off one environment outcome. (The book also writes $T(\rho)$.)"
- **F:** "Inserting the environment's completeness $\sum_m|m\rangle\langle m| = I_E$ gives the operator-sum (Kraus) form $\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger$ with $A_m = \langle m|U_{SE}|0\rangle_E$ (Bergou Eqs. 4.1–4.5; N&C Eq. 8.10). The $A_m$ are the [[qc-kraus-operator|Kraus operators]]; the representation is central to everything that follows."
- **Cap:** G "$\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger$: the channel, one term per outcome" · F "$\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger,\ A_m = \langle m|U_{SE}|0\rangle_E$"
- **Stage:** `split( circ(C_DEPOL, 1, {}) / mx('krausList', {}) )` — the coupling, and its Kraus operators read off. needs: circuit, matrix.
- **Claims:** `q13DepolKraus` → the four depolarizing Kraus matrices.
- **Terms:** `qc-quantum-channel` (notation beat), `qc-kraus-operator` (defined here).

**`q13-from-unitary:b3` [B]** (the completeness condition; D1)
- **G:** "One rule ties the operators together: $\sum_m A_m^\dagger A_m = I$. It follows straight from the coupling being unitary, and it is exactly what keeps the chances adding to one — the trace of $\mathcal E(\rho)$ stays $1$."
- **F:** "Unitarity of $U_{SE}$ forces the completeness relation $\sum_m A_m^\dagger A_m = I$ (Bergou Eq. 4.4; N&C Eq. 8.14), equivalently that $\mathcal E$ is trace-preserving: $\mathrm{Tr}\,\mathcal E(\rho) = \mathrm{Tr}\big(\sum_m A_m^\dagger A_m\,\rho\big) = \mathrm{Tr}\,\rho = 1$ for all $\rho$."
- **Cap:** G "$\sum_m A_m^\dagger A_m = I$: chances still add to one" · F "$\sum_m A_m^\dagger A_m = I \iff$ trace-preserving"
- **Stage:** `mx('krausSumAA', {trace:true})` — the sum $\sum_m A_m^\dagger A_m$ resolving to $I$. needs: matrix-v2.
- **Claims:** `q13DepolSumAdagA05` → $I$.
- **Fidelity:** `qc-matrix-trace-engine`.

**`q13-from-unitary:b4` [C]** (is every channel trace-preserving?)
- **Q G:** "We built $\mathcal E$ from a unitary and found $\sum_m A_m^\dagger A_m = I$. Does $\mathrm{Tr}\,\mathcal E(\rho) = \mathrm{Tr}\,\rho$ hold for every input $\rho$?"
- **Q F:** "Given $\sum_m A_m^\dagger A_m = I$, is $\mathcal E$ trace-preserving for every $\rho$, or only for some?"
- **Reveal G:** "Every one. The completeness relation holds as an operator identity, so it works no matter what goes in. A trace-preserving channel never loses or gains probability."
- **Reveal F:** "For all $\rho$: $\mathrm{Tr}\,\mathcal E(\rho) = \mathrm{Tr}(\sum_m A_m^\dagger A_m\,\rho) = \mathrm{Tr}\,\rho$, since $\sum_m A_m^\dagger A_m = I$ is an operator identity. Maps with $\sum_m A_m^\dagger A_m \le I$ instead describe measurement outcomes with a loss of probability (Chapter Q14)."
- **Reveal cap:** G/F "trace-preserving for every $\rho$"
- **Stage:** question `mx('krausSumAA', {})`; reveal `mx('krausSumAA', {trace:true})`. needs: matrix-v2.
- **Claims:** `q13DepolSumAdagA05` (reused).

### Unit `q13-properties` — What a channel preserves — and the catch

**`q13-properties:b1` [B]** (three properties)
- **G:** "A channel is tame in three ways. It keeps a Hermitian matrix Hermitian, it keeps the trace at one, and it maps states to states — no negative chances come out. All three follow from the operator-sum form."
- **F:** "From $\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger$: $\mathcal E$ maps Hermitian operators to Hermitian operators, is trace-preserving (Unit 13.1), and is positive — it maps positive operators to positive operators (Bergou §4.1.2). A density matrix in gives a density matrix out."
- **Cap:** G "a channel keeps Hermitian, keeps $\mathrm{Tr} = 1$, keeps positivity" · F "Hermiticity-, trace- and positivity-preserving"
- **Stage:** `mx(rho('+'), {trace:true})` — a state in; `split` with its image kept positive. needs: matrix-v2.
- **Terms:** `qc-positive-operator` (Q8, link-back).

**`q13-properties:b2` [B]** (positivity is not enough)
- **G:** "But positivity alone is too weak. The real rule is stronger. The channel must stay positive even when it acts on **half** of a larger entangled pair, with the other half untouched. That is called complete positivity."
- **F:** "Positivity must be strengthened to **complete positivity**: $\mathcal E\otimes I_B$ must be positive for an ancilla $B$ of any size (Bergou §4.1.2; N&C Box 8.2). Physically, if $\mathcal E$ acts on $A$ while $B$ sits idle, $\rho_{AB}\to(\mathcal E\otimes I_B)(\rho_{AB})$ must still be a valid state."
- **Cap:** G "the stronger rule: positive even acting on half an entangled pair" · F "complete positivity: $\mathcal E\otimes I_B \ge 0$ for any ancilla $B$"
- **Stage:** `tq({bell:'00+11'}, {})` — the entangled pair one half of which the map will act on. needs: two-qubit.
- **Terms:** `qc-complete-positivity` (defined here).

**`q13-properties:b3` [B] · notation beat, `introduces: ['qc-choi-matrix']`** (the transpose fails the test; D2)
- **G:** "Here is a map that is positive but **not** completely positive: the plain transpose. Apply it to one half of $\Phi^+$. The result — the [[qc-choi-matrix|Choi matrix]] — has eigenvalues $\tfrac12, \tfrac12, \tfrac12, -\tfrac12$. A negative one means it is not a channel."
- **F:** "The transpose is positive (it keeps eigenvalues). But $(T\otimes I)|\Phi^+\rangle\langle\Phi^+|$ — the [[qc-choi-matrix|Choi matrix]] of $T$ — has spectrum $\{\tfrac12, \tfrac12, \tfrac12, -\tfrac12\}$ (N&C Box 8.2). A negative eigenvalue of the Choi matrix means the map is not completely positive, so the transpose is **not** a physical channel. This is the partial transpose of Chapter Q12, now read as a non-channel."
- **Cap:** G "transpose one half of $\Phi^+$: an eigenvalue $-\tfrac12$ appears" · F "Choi matrix of $T$: spectrum $\{\tfrac12,\tfrac12,\tfrac12,-\tfrac12\}$ ⇒ not CP"
- **Stage:** `split( mx(out({bell:'00+11'}), {blocks:2}) / mx(out({bell:'00+11'}), {ptranspose:'B', spectrum:'bars'}) )` — $\Phi^+$'s density matrix and its one-sided transpose, the negative bar flagged. needs: matrix-v2.
- **Claims:** `q13TransposeSpec` → (−0.5, 0.5, 0.5, 0.5).
- **Terms:** `qc-choi-matrix` (notation beat).

**`q13-properties:b4` [C]** (why Chapter Q12 reappears)
- **Q G:** "Chapter Q12 used exactly this one-sided transpose to spot entanglement. Why does the same operation now decide whether a map is a channel?"
- **Q F:** "The partial transpose detected entanglement in Chapter Q12; here it decides complete positivity. What single fact connects the two uses?"
- **Reveal G:** "Because they are the same object. A map is a channel exactly when its Choi matrix is a valid state. The transpose's Choi matrix fails because it turns an entangled state negative — just the PPT test again."
- **Reveal F:** "The Choi–Jamiołkowski correspondence: $\mathcal E$ is completely positive iff its Choi matrix $(\mathcal E\otimes I)|\Phi^+\rangle\langle\Phi^+| \ge 0$. The transpose fails precisely because $(T\otimes I)$ is the partial transpose, which turns $\Phi^+$ negative — the same negativity Chapter Q12 used as an entanglement flag."
- **Reveal cap:** G/F "same operation: a channel's Choi matrix must be positive, as a state's partial transpose must be"
- **Stage:** question `mx(out({bell:'00+11'}), {blocks:2})`; reveal `mx(out({bell:'00+11'}), {ptranspose:'B', spectrum:'bars'})`. needs: matrix-v2.
- **Claims:** `q13TransposeSpec` (reused).

### Unit `q13-stinespring` — Every channel is a unitary in disguise

**`q13-stinespring:b1` [B]** (the converse)
- **G:** "Unit 13.1 built a channel by starting from a unitary. The converse is also true. Any channel, however noisy, can be realised as a single unitary on the qubit plus a fresh environment, with the environment then traced away. Noise is just entanglement with something we ignore."
- **F:** "The Stinespring dilation: given any Kraus set $\{A_m\}$, there is an environment $E$ (in state $|0\rangle_E$) and a unitary $U_{SE}$ with $A_m|\psi\rangle = \langle m|U_{SE}(|\psi\rangle\otimes|0\rangle_E)$ (Bergou Eqs. 4.6–4.8). Every channel is a unitary on a larger space — openness is entanglement with an ignored environment."
- **Cap:** G "any channel = one unitary on qubit + environment, environment forgotten" · F "Stinespring: $A_m|\psi\rangle = \langle m|U_{SE}(|\psi\rangle|0\rangle_E)$, $U_{SE}$ unitary"
- **Stage:** `circ(C_DEPOL, 1, {})` — the dilating unitary on system + environment. needs: circuit.
- **Terms:** `qc-stinespring` (defined here).

**`q13-stinespring:b2` [B]** (the isometry is an inner-product map; D3)
- **G:** "Why does the unitary exist? Define $V|\psi\rangle = \sum_m A_m|\psi\rangle\otimes|m\rangle_E$. Because $\sum_m A_m^\dagger A_m = I$, this $V$ keeps every inner product: $V^\dagger V = I$. A map that preserves inner products on a subspace always extends to a full unitary."
- **F:** "Define the isometry $V|\psi\rangle = \sum_m A_m|\psi\rangle\otimes|m\rangle_E$. Then $V^\dagger V = \sum_m A_m^\dagger A_m = I$, so $V$ preserves inner products on the system subspace and extends to a unitary $U_{SE}$ on $H_S\otimes H_E$ (identity on the orthogonal complement; Bergou Eq. 4.8)."
- **Cap:** G "$V = \sum_m A_m\otimes|m\rangle$ keeps inner products: $V^\dagger V = I$, so it extends to a unitary" · F "$V^\dagger V = \sum_m A_m^\dagger A_m = I$: an isometry, extended to $U_{SE}$"
- **Stage:** `split( circ(C_DEPOL, 1, {}) / mx('isometryVdagV', {trace:true}) )` — the dilation, and $V^\dagger V = I$. needs: circuit, matrix-v2.
- **Claims:** `q13DepolSumAdagA05` → $I$ (= $V^\dagger V$).
- **Fidelity:** `qc-matrix-trace-engine`.

**`q13-stinespring:b3` [B]** (freedom and the count)
- **G:** "The environment is not unique: two Kraus sets describe the same channel exactly when a unitary relates them, $D_\nu = \sum_\mu U_{\nu\mu}A_\mu$. And a qubit channel never needs more than four Kraus operators — $N^2$ for an $N$-dimensional system."
- **F:** "Two Kraus sets give the same channel iff $D_\nu = \sum_\mu U_{\nu\mu}A_\mu$ for a unitary $U$ (Bergou Eq. 4.28) — the same unitary-freedom theorem as for density-matrix ensembles (Chapter Q8). At most $N^2$ operators are ever needed ($4$ for a qubit), since the channel's Choi matrix has rank $\le N^2$."
- **Cap:** G "same channel ⇔ $D_\nu = \sum_\mu U_{\nu\mu}A_\mu$; a qubit needs at most $4$ operators" · F "Kraus freedom $D_\nu = \sum_\mu U_{\nu\mu}A_\mu$; $\le N^2 = 4$ operators for a qubit"
- **Stage:** `mx('krausList', {})` — the depolarizing channel's four Kraus operators. needs: matrix-v2.
- **Claims:** `q13MaxKraus2` → 4.

**`q13-stinespring:b4` [C]** (the minimum count)
- **Q G:** "What is the largest number of Kraus operators a one-qubit channel could ever need?"
- **Q F:** "For a single-qubit channel ($N = 2$), what is the maximum number of Kraus operators required?"
- **Reveal G:** "Four. For an $N$-level system it is $N^2$, and a qubit has $N = 2$. The depolarizing channel uses exactly four; many channels use fewer."
- **Reveal F:** "$N^2 = 4$. The bound is the rank of the Choi matrix, at most $N^2$; the depolarizing channel saturates it with $\{\sqrt{1-p}\,I, \sqrt{p/3}\,X, \sqrt{p/3}\,Y, \sqrt{p/3}\,Z\}$, while amplitude damping needs only two."
- **Reveal cap:** G/F "at most $4$ for a qubit ($N^2$)"
- **Stage:** question `circ(C_DEPOL, 1, {})`; reveal `mx('krausList', {})`. needs: circuit, matrix-v2.
- **Claims:** `q13MaxKraus2` → 4.

### Unit `q13-depolarizing` — The shrinking Bloch ball

**`q13-depolarizing:b1` [B]** (the channel)
- **G:** "The depolarizing channel is the plainest noise. With chance $p$ the qubit is scrambled to the fully mixed centre, and with chance $1-p$ it is left alone. Its four Kraus operators are $\sqrt{1-p}\,I$ and $\sqrt{p/3}$ times each Pauli."
- **F:** "The depolarizing channel replaces the qubit with the maximally mixed state $\tfrac12 I$ with probability $p$ and leaves it alone otherwise, $\mathcal E(\rho) = (1-p)\rho + \tfrac p3(X\rho X + Y\rho Y + Z\rho Z)$ (Bergou Eq. 4.30). Its Kraus operators are $\{\sqrt{1-p}\,I, \sqrt{p/3}\,X, \sqrt{p/3}\,Y, \sqrt{p/3}\,Z\}$."
- **Cap:** G "depolarizing: scramble with chance $p$; Kraus $\sqrt{1-p}\,I$ and $\sqrt{p/3}$ Paulis" · F "$\mathcal E(\rho) = (1-p)\rho + \tfrac p3(X\rho X + Y\rho Y + Z\rho Z)$"
- **Stage:** `mx('krausList', {})` — the four Kraus operators. needs: matrix-v2.
- **Terms:** `qc-depolarizing` (defined here).

**`q13-depolarizing:b2` [B] · Rosetta ($\mathbf r$)** (the ball shrinks; D4)
- **G:** "Watch the Bloch ball. Each Pauli flips the arrow a different way, and together they shrink it: $\mathbf r \to (1 - \tfrac{4p}3)\mathbf r$. Every point moves straight toward the centre by the same factor. At $p = 0.5$ the ball is a third of its size. (The books write the arrow $\mathbf n$.)"
- **F:** "Using $\sigma_j\sigma_k\sigma_j = -\sigma_k$ for $j\ne k$, the map sends $\mathbf r\to(1 - \tfrac{4p}3)\mathbf r$ (Bergou Eqs. 4.31–4.34): the whole Bloch ball contracts uniformly toward the centre by $|1 - \tfrac{4p}3|$. At $p = 0.5$ the factor is $\tfrac13$. (N&C's $(1-p)$ parametrization gives $1 - p$ instead; $\mathbf r = \vec r = \mathbf n$.)"
- **Cap:** G "the whole ball shrinks: $\mathbf r \to (1 - \tfrac{4p}3)\mathbf r$, a third at $p = 0.5$" · F "$\mathbf r \to (1 - \tfrac{4p}3)\mathbf r$; factor $\tfrac13$ at $p = 0.5$"
- **Stage:** `split( ballE('depolarizing', {at:0.5}) / plot('depolRadius', {min:0, max:1}, {marker:0.5}) )` — the contracted ball, and the shrink factor vs $p$. needs: ball-ellipsoid, plot.
- **Claims:** `q13DepolFactor` → (1, 0.333, 0, −0.333) at $p = 0, 0.5, 0.75, 1$.
- **Fidelity:** `qc-ball-ellipsoid-engine`, `qc-plot-engine-curve`.

**`q13-depolarizing:b3` [B]** (the collapse; other channels as ellipsoids)
- **G:** "At $p = \tfrac34$ the factor hits zero: every state is scrambled to the centre, the fully mixed coin. Other channels squash the ball into an **egg** instead of a smaller ball — the bit-flip, phase-flip and amplitude-damping channels are all such ellipsoids."
- **F:** "At $p = \tfrac34$ the factor is $0$: the channel maps every state to $\tfrac12 I$. A general trace-preserving qubit channel is an affine map $\mathbf r\to M\mathbf r + \mathbf c$ (N&C Eq. 8.89), an ellipsoid inside the ball; the depolarizing channel is the isotropic case ($M = (1-\tfrac{4p}3)I$, $\mathbf c = 0$). Bit-flip, phase-flip and amplitude damping give anisotropic, offset ellipsoids (amplitude damping: ⚑ P4.5, cited)."
- **Cap:** G "at $p = \tfrac34$ the ball is a point; other channels make eggs" · F "$\mathbf r\to M\mathbf r + \mathbf c$: an ellipsoid; depolarizing is the isotropic case"
- **Stage:** `split( ballE('depolarizing', {at:0.75}) / ballE('amplitudeDamping', {at:0.5}) )` — the collapse to a point, beside amplitude damping's offset egg. needs: ball-ellipsoid.
- **Claims:** `q13DepolFactor` (reused; 0 at $p = 0.75$); `q13AmpDampC`, `q13AmpDampMxx`, `q13AmpDampMzz` → the ellipsoid of amplitude damping at $\gamma = 0.5$ (centre $(0,0,0.5)$, axes $0.7071, 0.7071, 0.5$) — drawn, not stated as prose.
- **Fidelity:** `qc-ball-ellipsoid-engine`.

**`q13-depolarizing:b4` [C]** (the ball at $p = 1$)
- **Q G:** "Push the depolarizing channel all the way to $p = 1$. What is the shrink factor, and what does the ball look like?"
- **Q F:** "Evaluate the depolarizing factor $1 - \tfrac{4p}3$ at $p = 1$, and interpret its sign."
- **Reveal G:** "The factor is $-\tfrac13$: the ball is turned inside-out and shrunk to a third. Full depolarizing is **not** at $p = 1$ but at $p = \tfrac34$, where the factor is zero."
- **Reveal F:** "$1 - \tfrac43 = -\tfrac13$: the map is a point reflection through the centre composed with a shrink by $\tfrac13$ (every $\mathbf r$ flips sign and shrinks). The fully mixing point is $p = \tfrac34$, not $p = 1$ — a common surprise."
- **Reveal cap:** G/F "$p = 1$: factor $-\tfrac13$, the ball inverted and shrunk"
- **Stage:** question `plot('depolRadius', {min:0, max:1})`; reveal `ballE('depolarizing', {at:1})`. needs: plot, ball-ellipsoid.
- **Claims:** `q13DepolFactor` (reused; −0.333 at $p = 1$).

### Unit `q13-no-cloning` — Why you cannot copy a qubit

**`q13-no-cloning:b1` [B]** (the machine we'd want)
- **G:** "Suppose we wanted a copier: feed in an unknown $|\psi\rangle$ and a blank, get two copies out, $|\psi\rangle|\psi\rangle$. A CNOT looks promising — it copies $|0\rangle$ to $|00\rangle$ and $|1\rangle$ to $|11\rangle$ perfectly."
- **F:** "A cloning unitary would act as $U(|\psi\rangle\otimes|0\rangle) = |\psi\rangle\otimes|\psi\rangle$ for every $|\psi\rangle$ (Bergou Eq. 4.35). A CNOT (control = data) does this on the basis: $U|00\rangle = |00\rangle$, $U|10\rangle = |11\rangle$ (Chapter Q4). The question is whether it works for a superposition."
- **Cap:** G "a copier: $|\psi\rangle|0\rangle \to |\psi\rangle|\psi\rangle$; CNOT copies $|0\rangle$ and $|1\rangle$" · F "$U(|\psi\rangle|0\rangle) = |\psi\rangle|\psi\rangle$; CNOT: $|00\rangle\to|00\rangle$, $|10\rangle\to|11\rangle$"
- **Stage:** `split( circ(C_CLONE, 2, {}) / amp({circuit:C_CLONE, upTo:2}, {mode:'probability'}) )` — a CNOT copying $|1\rangle|0\rangle$ to $|11\rangle$. needs: circuit, amplitudes.
- **Claims:** `q13CloneBasis` → $|00\rangle$ from $|00\rangle$, $|11\rangle$ from $|10\rangle$.
- **Terms:** `qc-cnot` (Q4, link-back).

**`q13-no-cloning:b2` [B]** (linearity kills it; D5)
- **G:** "Now feed the CNOT a superposition $|+\rangle|0\rangle$. Linearity forces the output to be the Bell state $(|00\rangle + |11\rangle)/\sqrt2$ — an entangled pair, **not** the two copies $|+\rangle|+\rangle$. No unitary can clone an unknown qubit."
- **F:** "By linearity $U(|+\rangle|0\rangle) = \tfrac1{\sqrt2}(U|00\rangle + U|10\rangle) = \tfrac1{\sqrt2}(|00\rangle + |11\rangle) = \Phi^+$, which is **not** $|+\rangle|+\rangle = \tfrac12(|00\rangle + |01\rangle + |10\rangle + |11\rangle)$ (Bergou Eqs. 4.36–4.37). Equivalently (N&C Box 12.1) cloning two states forces $\langle\psi|\varphi\rangle = \langle\psi|\varphi\rangle^2$, so they must be equal or orthogonal: no unitary clones an unknown state."
- **Cap:** G "$|+\rangle|0\rangle \to \Phi^+$, not $|+\rangle|+\rangle$: cloning fails" · F "linearity ⇒ $U|+\rangle|0\rangle = \Phi^+ \ne |+\rangle|+\rangle$; $\langle\psi|\varphi\rangle = \langle\psi|\varphi\rangle^2$"
- **Stage:** `split( amp({bell:'00+11'}, {mode:'probability'}) / amp({ket:'++'}, {mode:'probability'}) )` — the actual CNOT output on $|+\rangle|0\rangle$, namely $\Phi^+$, against the wanted $|+\rangle|+\rangle$. needs: amplitudes.
- **Claims:** `q13CloneOut` → $\Phi^+$ probabilities $(0.5, 0, 0, 0.5)$; `q13PlusPlus` → $(0.25, 0.25, 0.25, 0.25)$; `q13Overlap0Plus` → 0.7071; `q13OverlapSq` → 0.5.
- **Fidelity:** `qc-amp-engine`.

**`q13-no-cloning:b3` [C]** (what *can* be cloned)
- **Q G:** "The CNOT copied $|0\rangle$ and $|1\rangle$ fine. So what class of states *can* a machine clone?"
- **Q F:** "The no-cloning proof allows $\langle\psi|\varphi\rangle = 0$ or $1$. Which states can therefore be cloned?"
- **Reveal G:** "Only states that are mutually orthogonal — like $|0\rangle$ and $|1\rangle$, the classical bits. A device can copy a known alphabet, which is why ordinary data copies fine; it cannot copy an unknown quantum state."
- **Reveal F:** "Mutually orthogonal states ($\langle\psi|\varphi\rangle = 0$): a fixed orthonormal set can be cloned, which is exactly classical information. Non-orthogonal states ($0 < |\langle\psi|\varphi\rangle| < 1$) cannot, so an unknown qubit drawn from a continuum is uncopyable."
- **Reveal cap:** G/F "only mutually orthogonal states — i.e. classical bits"
- **Stage:** question `amp({circuit:C_CLONE, upTo:2}, {mode:'probability'})`; reveal `amp({bell:'00+11'}, {mode:'probability'})` (the CNOT output on $|+\rangle|0\rangle$). needs: amplitudes, circuit.
- **Claims:** `q13Overlap0Plus` → 0.7071 (the non-orthogonal pair that fails).

### Unit `q13-herbert` — Cloning would break relativity

**`q13-herbert:b1` [B]** (the stakes)
- **G:** "No-cloning is not a mere technical limit — it guards relativity. Nick Herbert once proposed a faster-than-light telephone that relied on copying. If a perfect copier existed, his scheme would work, so something had to forbid the copier."
- **F:** "The no-cloning theorem was in fact discovered by chasing a flaw in Nick Herbert's proposed superluminal signalling scheme (Bergou §4.3.2). If a perfect cloner existed, Herbert's scheme would transmit information faster than light; since relativity forbids that, the cloner cannot exist."
- **Cap:** G "cloning would allow a faster-than-light telephone — so it is forbidden" · F "Herbert's FTL scheme works iff a perfect cloner exists; relativity forbids both"
- **Stage:** `tq({bell:'00+11'}, {})` — the shared ebit Alice and Bob start from. needs: two-qubit.
- **Terms:** `qc-no-signalling` (Q10, link-back).

**`q13-herbert:b2` [B]** (the argument; D6)
- **G:** "Here is the scheme. Alice and Bob share a Bell pair. Alice measures hers in the $z$ or the $x$ basis — her choice is the message. But Bob's qubit alone is the fully mixed centre either way. So he learns nothing from it, unless he could clone it many times and spot the pattern."
- **F:** "Alice and Bob share $\Phi^+$. Alice measures in the $z$ or $x$ basis; her basis is the bit she wants to send. Bob's reduced state is $\tfrac12 I$ regardless (no-signalling, Chapter Q10), so one copy tells him nothing. A cloner would let him make many copies of his single qubit and read Alice's basis — faster than light. No-signalling forbids the cloner."
- **Cap:** G "Bob's qubit is the centre whatever Alice does — one copy tells him nothing" · F "$\rho_B = \tfrac12 I$ for either Alice basis; a cloner would reveal it ⇒ signalling"
- **Stage:** `split( tqR(MZ, {arrows:'reduced'}) / tqR(MX, {arrows:'reduced'}) )` — Bob's reduced arrow after Alice's $z$- vs $x$-basis non-selective reading: the same centre, length $0$, in both. needs: two-qubit.
- **Claims:** `q13HerbertRbZ` → (0, 0, 0); `q13HerbertRbX` → (0, 0, 0) — Bob's reduced $\mathbf r$ the same (the centre) for both Alice bases.
- **Fidelity:** `qc-tq-local-arrows`.

**`q13-herbert:b3` [C]** (what really blocks the signal)
- **Q G:** "In Herbert's scheme, which law does the signal run into first — no-cloning, or no-signalling?"
- **Q F:** "Is Herbert's scheme blocked by the no-cloning theorem or by the no-signalling principle?"
- **Reveal G:** "They are two faces of one wall. Bob cannot signal because his qubit is the same mixed state whatever Alice does — that is no-signalling. A cloner would give him the one tool to break that, so no-cloning keeps no-signalling intact."
- **Reveal F:** "Both: no-signalling says Bob's $\rho_B = \tfrac12 I$ carries no information about Alice's basis; a perfect cloner is precisely the device that would extract it, so no-cloning is the dynamical guarantee of no-signalling. Allowing cloning would make the two principles inconsistent."
- **Reveal cap:** G/F "two faces of one wall: no-cloning protects no-signalling"
- **Stage:** question `tqR(MZ, {arrows:'reduced'})`; reveal `ball('oven')` — Bob's unconditioned state, the centre, whatever Alice chooses. needs: two-qubit, bloch-ball.
- **Claims:** `q13HerbertRbZ`, `q13HerbertRbX` (reused; both the centre).

### 1.7 Claim ledger (engine call → value; numpy route)
All values verified twice (engine route `q1213plan-engine.ts`, numpy twin `q1213plan-numpy.py`; agree to 6 decimals).
"E3" marks a call `Q13.values.ts` makes through the not-yet-built `channels` module (§9.1); its value is the one
computed here from merged primitives.

| Key | Engine call (`Q13.values.ts`) | Value | numpy route |
|---|---|---|---|
| `q13DepolKraus` | `depolarizing(p).kraus` (E3) | $\{\sqrt{1-p}\,I, \sqrt{p/3}\,X, \sqrt{p/3}\,Y, \sqrt{p/3}\,Z\}$ | explicit Kraus list |
| `q13DepolSumAdagA05` | `sum of A†A` from `depolarizing(0.5)` (E3) | $I$ | $\sum_k K_k^\dagger K_k$ |
| `q13DepolFactor` | `blochAffine(depolarizing(p)).M` diagonal at $p\in\{0,0.5,0.75,1\}$ (E3) | (1, 0.333, 0, −0.333) | apply map to $\rho(+)$, read $r_x$; $1 - 4p/3$ |
| `q13AmpDampC`, `q13AmpDampMxx`, `q13AmpDampMzz` | `blochAffine(amplitudeDamping(0.5))` → $\{M, \mathbf c\}$ (E3) | $\mathbf c = (0,0,0.5)$; $M_{xx} = 0.7071$; $M_{zz} = 0.5$ | apply Kraus $\{[[1,0],[0,\sqrt{1-\gamma}]], [[0,\sqrt\gamma],[0,0]]\}$ to $\tfrac12 I, |+\rangle, |0\rangle$ |
| `q13TransposeSpec` | `spectrum(ptranspose(densityOf(bell('00+11')), [1]))` | (−0.5, 0.5, 0.5, 0.5) | `eigvalsh` of the axis-swapped $\Phi^+$ |
| `q13MaxKraus2` | constant $N^2$ with $N = 2$ | 4 | $2^2$ |
| `q13CloneBasis` | `runCircuit(C_CLONE)` on $|00\rangle$, $|10\rangle$ | $|00\rangle$, $|11\rangle$ | CNOT on basis kets |
| `q13CloneOut` | `probs(bell('00+11'))` (CNOT on $|+0\rangle$) | (0.5, 0, 0, 0.5) | $|\Phi^+|^2$ |
| `q13PlusPlus` | `probs(ket('++'))` | (0.25, 0.25, 0.25, 0.25) | $|{+}{+}\rangle$ |
| `q13Overlap0Plus`, `q13OverlapSq` | `abs(inner(ket('0'), ket('+')))`; squared | 0.7071; 0.5 | `vdot`; its square |
| `q13HerbertRbPhi` | `reducedBloch(densityOf(bell('00+11')), 1)` | (0,0,0) | Bob reduced of $\Phi^+$ |
| `q13HerbertRbZ`, `q13HerbertRbX` | `reducedBloch(mixtureN(MZ), 1)`; `…(MX), 1` | (0,0,0); (0,0,0) | Bob reduced of Alice's $z$-/$x$-non-selective $\Phi^+$ |

## 2. Derivations
Each step is `tex` — `why` — **view** — *viewCaption*. A step without a view inherits the previous one in its own
list. Every list has ≥ 2 distinct views, every view uses a kind its unit's beats show, the last `tex` ends on the
result, and Ground steps ≥ Formal steps.

**D1 · `q13-from-unitary:b3` · result `\sum_m A_m^\dagger A_m = I \iff \text{trace-preserving}`** (Bergou Eqs. 4.1–4.5; N&C Eq. 8.14)
- Ground (3 views):
  1. `\mathcal E(\rho) = \mathrm{Tr}_E[U_{SE}(\rho\otimes|0\rangle\langle0|_E)U_{SE}^\dagger] = \sum_m A_m\rho A_m^\dagger` — Couple, evolve, trace the environment. **view** `circ(C_DEPOL, 1, {})` · *the coupling $U_{SE}$*
  2. `\sum_m A_m^\dagger A_m = \langle0|U_{SE}^\dagger\Big(\sum_m|m\rangle\langle m|\Big)U_{SE}|0\rangle = \langle0|U_{SE}^\dagger U_{SE}|0\rangle` — Collect the operators; the environment's completeness appears. **view** `mx('krausSumAA', {})` · *$\sum_m A_m^\dagger A_m$ assembled*
  3. `= \langle0|0\rangle\,I = I \Rightarrow \mathrm{Tr}\,\mathcal E(\rho) = \mathrm{Tr}\,\rho` — Unitarity gives $I$; chances stay normalized. **view** `mx('krausSumAA', {trace:true})` · *$\sum_m A_m^\dagger A_m = I$*
  4. `\sum_m A_m^\dagger A_m = I \iff \text{trace-preserving}` — The completeness relation is exactly trace preservation.
- Formal (2 views):
  1. `\sum_m A_m^\dagger A_m = \langle0|U_{SE}^\dagger U_{SE}|0\rangle = I` — From $U_{SE}^\dagger U_{SE} = I$ and $\langle0|0\rangle = 1$ (Bergou Eq. 4.4). **view** `circ(C_DEPOL, 1, {})`
  2. `\sum_m A_m^\dagger A_m = I \iff \text{trace-preserving}` — $\mathrm{Tr}\,\mathcal E(\rho) = \mathrm{Tr}(\sum_m A_m^\dagger A_m\,\rho)$. **view** `mx('krausSumAA', {trace:true})`
- Check: `q13DepolSumAdagA05`. Needs: circuit, matrix-v2.

**D2 · `q13-properties:b3` · result `\text{spec}\big((T\otimes I)|\Phi^+\rangle\langle\Phi^+|\big) = \{\tfrac12,\tfrac12,\tfrac12,-\tfrac12\} \Rightarrow T \text{ not CP}`** (N&C Box 8.2)
- Ground (3 views):
  1. `\rho_{\Phi^+} = \tfrac12(|00\rangle + |11\rangle)(\langle00| + \langle11|)` — The maximally entangled test state, in blocks. **view** `mx(out({bell:'00+11'}), {blocks:2})` · *$\rho_{\Phi^+}$: four corners*
  2. `(T\otimes I)\rho_{\Phi^+}` — Transpose Alice's half only; the off-diagonal block cells swap (this matrix is the Choi matrix of $T$). **view** `mx(out({bell:'00+11'}), {ptranspose:'B'})` · *the Choi matrix of $T$*
  3. `\lambda = \{\tfrac12, \tfrac12, \tfrac12, -\tfrac12\}` — Its eigenvalues: one is negative. **view** `mx(out({bell:'00+11'}), {ptranspose:'B', spectrum:'bars'})` · *a bar at $-\tfrac12$*
  4. `\text{one negative eigenvalue} \Rightarrow T \text{ not completely positive}` — A negative Choi eigenvalue means $T$ is not a channel.
- Formal (2 views):
  1. `(T\otimes I)|\Phi^+\rangle\langle\Phi^+| = \tfrac12\,\mathrm{SWAP}` — The Choi matrix of the transpose is half the swap operator. **view** `mx(out({bell:'00+11'}), {ptranspose:'B'})`
  2. `\text{spec} = \{\tfrac12,\tfrac12,\tfrac12,-\tfrac12\} \Rightarrow T \text{ not CP}` — The swap's $-1$ eigenspace survives (Choi–Jamiołkowski). **view** `mx(out({bell:'00+11'}), {ptranspose:'B', spectrum:'bars'})`
- Check: `q13TransposeSpec`. Needs: matrix-v2.

**D3 · `q13-stinespring:b2` · result `V^\dagger V = I \Rightarrow V \text{ extends to a unitary } U_{SE}`** (Bergou Eqs. 4.6–4.8)
- Ground (3 views):
  1. `V|\psi\rangle = \sum_m A_m|\psi\rangle\otimes|m\rangle_E` — Build an operator that files each Kraus outcome into a fresh environment slot. **view** `circ(C_DEPOL, 1, {})` · *$V$: system into system + environment*
  2. `V^\dagger V = \sum_{m} A_m^\dagger A_m` — Its inner-product matrix is the Kraus sum. **view** `mx('isometryVdagV', {})` · *$V^\dagger V = \sum_m A_m^\dagger A_m$*
  3. `V^\dagger V = I` — So $V$ preserves every inner product: an isometry, which extends to a unitary. **view** `mx('isometryVdagV', {trace:true})` · *$V^\dagger V = I$*
  4. `V^\dagger V = I \Rightarrow V \text{ extends to a unitary } U_{SE}` — Every channel is a unitary on a bigger space.
- Formal (2 views):
  1. `V^\dagger V = \sum_m A_m^\dagger A_m = I` — $V$ is an isometry on $H_S$ (completeness, Unit 13.1). **view** `mx('isometryVdagV', {trace:true})`
  2. `V^\dagger V = I \Rightarrow U_{SE} \text{ unitary}` — Extend $V$ by the identity on the orthogonal complement (Eq. 4.8). **view** `circ(C_DEPOL, 1, {})`
- Check: `q13DepolSumAdagA05` (= $V^\dagger V$). Needs: circuit, matrix-v2.

**D4 · `q13-depolarizing:b2` · result `\mathbf r \to (1 - \tfrac{4p}3)\mathbf r`** (Bergou Eqs. 4.31–4.34)
- Ground (4 views):
  1. `\mathcal E(\rho) = (1-p)\rho + \tfrac p3(X\rho X + Y\rho Y + Z\rho Z)` — The channel as its Kraus action. **view** `mx('krausList', {})` · *the four Kraus operators*
  2. `\sigma_j\sigma_k\sigma_j = -\sigma_k\ (j\ne k)` — Each Pauli flips the other two components; e.g. $XZX = -Z$. **view** `mx(prod(pa('X'), pa('Z'), pa('X')), {})` · *$XZX = -Z$*
  3. `T(\sigma_k) = \big[(1-p) + \tfrac p3 - \tfrac{2p}3\big]\sigma_k = (1 - \tfrac{4p}3)\sigma_k` — So every Pauli component scales by the same factor; the ball contracts. **view** `ballE('depolarizing', {at:0.5})` · *the ball, a third of its size at $p = 0.5$*
  4. `\mathbf r \to (1 - \tfrac{4p}3)\mathbf r` — Every arrow shrinks toward the centre by one factor. **view** `plot('depolRadius', {min:0, max:1}, {marker:0.5})` · *the shrink factor vs $p$*
- Formal (2 views):
  1. `T(\sigma_k) = (1 - \tfrac{4p}3)\sigma_k` — From $\sigma_j\sigma_k\sigma_j = -\sigma_k$ summed over the three Paulis (Eq. 4.33). **view** `ballE('depolarizing', {at:0.5})`
  2. `\mathbf r \to (1 - \tfrac{4p}3)\mathbf r` — An isotropic contraction; factor $\tfrac13$ at $p = 0.5$. **view** `plot('depolRadius', {min:0, max:1}, {marker:0.5})`
- Check: `q13DepolFactor`. Needs: matrix-v2, ball-ellipsoid, plot.

**D5 · `q13-no-cloning:b2` · result `U|+\rangle|0\rangle = \Phi^+ \ne |+\rangle|+\rangle`** (Bergou Eqs. 4.35–4.37; N&C Box 12.1)
- Ground (4 views):
  1. `U|0\rangle|0\rangle = |00\rangle,\quad U|1\rangle|0\rangle = |11\rangle` — The CNOT copies the two basis states. **view** `amp({circuit:C_CLONE, upTo:2}, {mode:'probability'})` · *$|10\rangle \to |11\rangle$*
  2. `U|+\rangle|0\rangle = \tfrac1{\sqrt2}(U|00\rangle + U|10\rangle) = \tfrac1{\sqrt2}(|00\rangle + |11\rangle) = \Phi^+` — Linearity fixes the superposition's image. **view** `amp({bell:'00+11'}, {mode:'probability'})` · *the output: $\Phi^+$*
  3. `|+\rangle|+\rangle = \tfrac12(|00\rangle + |01\rangle + |10\rangle + |11\rangle)` — But a true copy would be this. **view** `amp({ket:'++'}, {mode:'probability'})` · *the wanted $|+\rangle|+\rangle$*
  4. `U|+\rangle|0\rangle = \Phi^+ \ne |+\rangle|+\rangle` — The entangled output is not two copies: no unitary clones an unknown qubit.
- Formal (2 views):
  1. `U|+\rangle|0\rangle = \tfrac1{\sqrt2}(|00\rangle + |11\rangle) = \Phi^+` — By linearity on the basis images (Eqs. 4.36–4.37). **view** `amp({bell:'00+11'}, {mode:'probability'})`
  2. `\langle\psi|\varphi\rangle = \langle\psi|\varphi\rangle^2 \Rightarrow \langle\psi|\varphi\rangle \in \{0, 1\}` — Cloning two states forces this; $|0\rangle, |+\rangle$ overlap $0.707 \ne 0.5$, so they cannot both be cloned (N&C Box 12.1). **view** `amp({ket:'++'}, {mode:'probability'})`
- Check: `q13CloneOut`, `q13PlusPlus`, `q13Overlap0Plus`, `q13OverlapSq`. Needs: amplitudes, circuit.

**D6 · `q13-herbert:b2` · result `\rho_B = \tfrac12 I \text{ for either Alice basis} \Rightarrow \text{no signal}`** (Bergou §4.3.2; Chapter Q10)
- Ground (3 views):
  1. `\text{Alice measures } z: \rho = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)` — Her non-selective $z$ reading of $\Phi^+$. **view** `tqR(MZ, {arrows:'reduced'})` · *Bob's arrow: the centre*
  2. `\text{Alice measures } x: \rho = \tfrac12(|{+}{+}\rangle\langle{+}{+}| + |{-}{-}\rangle\langle{-}{-}|),\ \rho_B = \tfrac12 I` — Her $x$ reading leaves Bob the same centre. **view** `tqR(MX, {arrows:'reduced'})` · *Bob's arrow: the centre again*
  3. `\rho_B = \tfrac12 I \text{ both ways} \Rightarrow \text{one copy carries nothing}` — A cloner would let Bob read Alice's basis, signalling; so the cloner is forbidden.
- Formal (2 views):
  1. `\rho_B = \mathrm{Tr}_A(\rho) = \tfrac12 I` for Alice's $z$- and $x$-basis non-selective measurements alike. **view** `tqR(MZ, {arrows:'reduced'})`
  2. `\rho_B \text{ independent of Alice's basis} \Rightarrow \text{no signal}` — No-signalling (Chapter Q10); a cloner would break it, so no-cloning must hold. **view** `tqR(MX, {arrows:'reduced'})`
- Check: `q13HerbertRbZ`, `q13HerbertRbX`. Needs: two-qubit.

**View counts** (distinct views, Ground / Formal): D1 3/2 · D2 3/2 · D3 3/2 · D4 4/2 · D5 4/2 · D6 2/2. Ground steps ≥
Formal steps in every pair. Every view's kind is on its unit's stage. D4 needs the `bloch-ball` `ellipsoid` field and
`plot` (both tagged, §9.2); D2/D3/D1 need `matrix` v2; D6 needs `two-qubit`.

## 3. Try-it widget per unit
No widget draws a channel yet (§9.3 W13, deferred). Each unit uses an existing 709 widget (Q3's `bloch` and
`operator-builder`, Q5's `phase-dial`) with a prop form already used, plus a stage sweep for the real exploration.

| Unit | Widget spec | Why this one |
|---|---|---|
| `q13-from-unitary` | `{kind:'operator-builder', props:{axis:'z'}}` | The Kraus operators are built operators; $\sum_m A_m^\dagger A_m$ is read like any matrix. |
| `q13-properties` | `{kind:'operator-builder', props:{axis:'x'}}` | Build an operator and read its eigenvalues: a negative one is what fails complete positivity. |
| `q13-stinespring` | `{kind:'operator-builder', props:{axis:'z'}}` | An isometry is an operator with $V^\dagger V = I$; the builder shows the product. |
| `q13-depolarizing` | `{kind:'bloch', props:{theta:60, phi:30, editable:true, landmarks:true}}` | Drag a pure state; the depolarizing map pulls it toward the centre — the shrinking ball. |
| `q13-no-cloning` | `{kind:'phase-dial', props:{theta:90, rotations:false}}` | Set the input to $|+\rangle$; the CNOT entangles it into $\Phi^+$ instead of copying it. |
| `q13-herbert` | `{kind:'bloch', props:{theta:90, phi:0, editable:false, landmarks:true}}` | Bob's qubit sits at the centre whatever Alice measures — nothing to read. |

**Try this:**
- `q13-from-unitary`: (1) Build $\sqrt{0.5}\,X$; square-sum four such Kraus operators to get $I$.
- `q13-properties`: (1) Build $\tfrac12 I + \sigma_x$: an eigenvalue goes negative — not a state.
- `q13-stinespring`: (1) Build any isometry's $V^\dagger V$ and confirm it is $I$.
- `q13-depolarizing`: (1) Drag a surface state inward: a mixed state is what noise leaves.
- `q13-no-cloning`: (1) Dial to $|+\rangle$: the CNOT output is a Bell pair, not two copies.
- `q13-herbert`: (1) Note Bob's arrow never leaves the centre.

## 4. Challenges per unit
Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** no sheet assigns any Q13 item; the
Bergou ⚑ problems P4.1–P4.5 are used only as cited derivations (P4.5 amplitude damping), not graded (§12 Q1). Every
challenge below is built on the chapter's running channels, so all carry full walkthroughs.

### `q13-from-unitary`
1. **warm-up · choice · `q13-fu-sum`** — "For the depolarizing channel's Kraus operators, what is $\sum_m A_m^\dagger A_m$?"
   - Options: **The identity $I$** ✓ · $\tfrac12 I$ · $(1-p)I$ · $0$. Check: `q13DepolSumAdagA05` $= I$. Hints: (1) It follows from unitarity. (2) $(1-p) + 3 \cdot \tfrac p3$. (3) $= 1$ times $I$. Walkthrough: $(1-p)I + \tfrac p3(X^2 + Y^2 + Z^2) = (1-p)I + pI = I$.
2. **core · choice · `q13-fu-tp`** — "A channel has $\sum_m A_m^\dagger A_m = I$. Is it trace-preserving?"
   - Options: **Yes, for every input** ✓ · Only for pure inputs · Only for the maximally mixed state · No. Check: $\mathrm{Tr}\,\mathcal E(\rho) = \mathrm{Tr}(\sum_m A_m^\dagger A_m\,\rho) = \mathrm{Tr}\,\rho$. Hints: (1) Use the cyclic trace. (2) Pull the operators together. (3) $\sum_m A_m^\dagger A_m = I$. Walkthrough: completeness is an operator identity, so the trace is preserved for all $\rho$.

### `q13-properties`
1. **warm-up · numeric · `q13-pr-min`** — "Transpose one half of $\Phi^+$. What is the smallest eigenvalue of the result?"
   - Answer: **−0.5** = `q13TransposeSpec[0]`. Hints: (1) The result is $\tfrac12$ the swap operator. (2) The swap has eigenvalues $\pm1$. (3) Scale by $\tfrac12$. Walkthrough: the spectrum is $\{\tfrac12, \tfrac12, \tfrac12, -\tfrac12\}$; the $-\tfrac12$ is the negative one.
2. **core · choice · `q13-pr-cp`** — "Is the transpose a valid quantum channel?"
   - Options: **No — it is positive but not completely positive** ✓ · Yes · Only on pure states · Only in one dimension. Check: `q13TransposeSpec[0]` $< 0$. Hints: (1) Act on half of an entangled pair. (2) Its Choi matrix has a negative eigenvalue. (3) A channel's Choi matrix must be $\ge 0$. Walkthrough: $(T\otimes I)\Phi^+$ has eigenvalue $-\tfrac12$, so $T$ is not CP and not a channel.

### `q13-stinespring`
1. **warm-up · numeric · `q13-st-max`** — "At most how many Kraus operators does a one-qubit channel need?"
   - Answer: **4** = `q13MaxKraus2`. Hints: (1) It is $N^2$. (2) A qubit has $N = 2$. (3) $2^2$. Walkthrough: the Choi matrix has rank at most $N^2 = 4$, so four operators always suffice.
2. **core · choice · `q13-st-dilate`** — "Can every quantum channel be realised as a unitary on a larger system?"
   - Options: **Yes — the Stinespring dilation** ✓ · Only unitary channels · Only for qubits · No. Check: $V^\dagger V = I$ extends to $U_{SE}$. Hints: (1) Add an environment. (2) Build the isometry $V = \sum_m A_m\otimes|m\rangle$. (3) $V^\dagger V = I$. Walkthrough: $V$ preserves inner products, so it extends to a unitary; noise is entanglement with an ignored environment.

### `q13-depolarizing`
1. **warm-up · numeric · `q13-de-half`** — "For the depolarizing channel at $p = 0.5$, by what factor does the Bloch ball shrink?"
   - Answer: **0.333** = `q13DepolFactor[1]`. Hints: (1) The factor is $1 - \tfrac{4p}3$. (2) $1 - \tfrac23$. (3) $\tfrac13$. Walkthrough: $1 - \tfrac{4 \times 0.5}3 = \tfrac13$; every arrow is a third as long.
2. **core · numeric · `q13-de-collapse`** — "At what $p$ does the ball collapse to the single central point?"
   - Answer: **0.75** = (the zero of `q13DepolFactor`). Hints: (1) Set the factor to $0$. (2) $1 - \tfrac{4p}3 = 0$. (3) $p = \tfrac34$. Walkthrough: $\tfrac{4p}3 = 1$ at $p = \tfrac34$; every state becomes $\tfrac12 I$.
3. **core · numeric · `q13-de-one`** — "What is the shrink factor at $p = 1$?"
   - Answer: **−0.333** = `q13DepolFactor[3]`. Hints: (1) $1 - \tfrac43$. (2) $-\tfrac13$. (3) The sign flips. Walkthrough: $1 - \tfrac43 = -\tfrac13$: the ball is inverted and shrunk to a third, not a point.
4. **stretch · choice · `q13-de-full`** — "Is the qubit fully depolarized at $p = 1$?"
   - Options: **No — that happens at $p = \tfrac34$; at $p = 1$ the ball is inverted** ✓ · Yes · Only for $|+\rangle$ · Never. Check: `q13DepolFactor` is $0$ at $p = 0.75$, $-0.333$ at $p = 1$. Hints: (1) Full mixing means factor $0$. (2) The factor is $0$ at $p = \tfrac34$. (3) At $p = 1$ it is $-\tfrac13 \ne 0$. Walkthrough: the factor vanishes at $p = \tfrac34$; beyond that it goes negative, inverting the ball.

### `q13-no-cloning`
1. **warm-up · choice · `q13-nc-out`** — "A CNOT (control = data) acts on $|+\rangle|0\rangle$. What comes out?"
   - Options: **The Bell state $\Phi^+$** ✓ · $|+\rangle|+\rangle$ · $|00\rangle$ · $|{+}0\rangle$. Check: `q13CloneOut` $= (0.5, 0, 0, 0.5)$. Hints: (1) Use linearity on $|0\rangle, |1\rangle$. (2) $\tfrac1{\sqrt2}(|00\rangle + |11\rangle)$. (3) That is $\Phi^+$. Walkthrough: the output is entangled, not two copies — the state is cloned only on the basis.
2. **core · numeric · `q13-nc-overlap`** — "The no-cloning proof needs $\langle\psi|\varphi\rangle \in \{0, 1\}$. What is $\langle0|+\rangle$?"
   - Answer: **0.7071** = `q13Overlap0Plus`. Hints: (1) $|+\rangle = (|0\rangle + |1\rangle)/\sqrt2$. (2) $\langle0|+\rangle = 1/\sqrt2$. (3) $0.707$. Walkthrough: $0.707$ is neither $0$ nor $1$, so $|0\rangle$ and $|+\rangle$ cannot both be cloned.
3. **core · choice · `q13-nc-ortho`** — "Which states *can* a machine copy?"
   - Options: **Mutually orthogonal ones** ✓ · Any pure states · Only mixed states · None. Check: $\langle\psi|\varphi\rangle = 0$ is allowed. Hints: (1) The proof allows overlap $0$ or $1$. (2) Overlap $0$ means orthogonal. (3) Like $|0\rangle, |1\rangle$. Walkthrough: orthogonal states — classical bits — are clonable; unknown superpositions are not.

### `q13-herbert`
1. **warm-up · choice · `q13-he-bob`** — "Alice measures her half of $\Phi^+$ in the $z$ basis but does not call Bob. What is Bob's state?"
   - Options: **The maximally mixed $\tfrac12 I$** ✓ · $|0\rangle$ · $|+\rangle$ · $\Phi^+$. Check: `q13HerbertRbZ` $= (0,0,0)$. Hints: (1) Bob does not know the outcome. (2) Average over Alice's two results. (3) $\tfrac12(|0\rangle\langle0| + |1\rangle\langle1|)$. Walkthrough: without the outcome, Bob's state is $\tfrac12 I$, the centre — unchanged by Alice's measurement.
2. **core · choice · `q13-he-signal`** — "What would a perfect cloner let Bob do?"
   - Options: **Signal faster than light** ✓ · Measure more precisely · Cool his qubit · Nothing new. Check: cloning + no-signalling are inconsistent. Hints: (1) Bob could make many copies of his one qubit. (2) He could then read Alice's basis. (3) That is a message with no delay. Walkthrough: copies would reveal Alice's basis instantly; no-signalling forbids this, so the cloner cannot exist.

## 5. Glossary terms new in Q13
`introduces` marks the two notation beats (W-709 #8), matching re-map §5. Inline math is TeX inside `$…$`.

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-quantum-channel` | quantum channel | notation | The most general evolution of an open qubit: a weighted spread $\sum_m A_m\rho A_m^\dagger$ of the state. | $\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger$ (the book also writes $T(\rho)$); completely positive, trace-preserving. | `q13-from-unitary:b2` | `qc-l6-mixture` |
| `qc-kraus-operator` | Kraus operator | — | One of the operators $A_m$ in a channel's sum; each reads off one environment outcome. | $A_m = \langle m|U_{SE}|0\rangle_E$, with $\sum_m A_m^\dagger A_m = I$. | `q13-from-unitary:b2` | — |
| `qc-complete-positivity` | complete positivity | — | The real test for a channel: it must stay positive even acting on half of a larger entangled pair. | $\mathcal E\otimes I_B \ge 0$ for an ancilla $B$ of any size. | `q13-properties:b2` | — |
| `qc-choi-matrix` | Choi matrix | notation | The state you get by running a map on half of a maximally entangled pair; it tells you if the map is a channel. | $(\mathcal E\otimes I)|\Phi^+\rangle\langle\Phi^+|$; $\mathcal E$ is CP iff this is $\ge 0$ (Choi–Jamiołkowski). | `q13-properties:b3` | `qc-partial-transpose` |
| `qc-stinespring` | Stinespring dilation | — | The fact that every channel is one unitary on the qubit plus a fresh environment, the environment then forgotten. | $A_m|\psi\rangle = \langle m|U_{SE}(|\psi\rangle\otimes|0\rangle_E)$, $U_{SE}$ unitary; at most $N^2$ operators. | `q13-stinespring:b1` | — |
| `qc-depolarizing` | depolarizing channel | — | The plainest noise: with chance $p$ the qubit is scrambled to the centre, shrinking the whole Bloch ball. | $\mathcal E(\rho) = (1-p)\rho + \tfrac p3(X\rho X + Y\rho Y + Z\rho Z)$; $\mathbf r \to (1 - \tfrac{4p}3)\mathbf r$. | `q13-depolarizing:b1` | `qc-l6-bloch` |
| `qc-amplitude-damping` | amplitude damping | — | The decay channel: an excited qubit can drop to the ground state, squashing the ball into an offset egg. | Kraus $\{[[1,0],[0,\sqrt{1-\gamma}]], [[0,\sqrt\gamma],[0,0]]\}$ (⚑ P4.5). | `q13-depolarizing:b3` | — |
| `qc-no-cloning` | no-cloning theorem | — | No machine can copy an unknown quantum state; a copier would have to be non-linear. | No unitary gives $U(|\psi\rangle|0\rangle) = |\psi\rangle|\psi\rangle$ for all $|\psi\rangle$; only orthogonal states are clonable. | `q13-no-cloning:b2` | — |

(In the table `\|` is a Markdown escape; the strings carry a plain `|`.) Reused: `qc-von-neumann-equation`,
`qc-density-matrix`, `qc-trace`, `qc-bloch-ball`, `qc-positive-operator` (Q8), `qc-partial-trace`, `qc-purify` (Q9),
`qc-partial-transpose` (Q12), `qc-no-signalling` (Q10), `qc-bell-basis` (Q6), `qc-cnot`, `qc-tensor-operator` (Q4),
`qc-unitary`, `qc-operator-matrix` (Q2).

**Notation beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-quantum-channel` | notation | `q13-from-unitary:b2` | `circ(C_DEPOL, 1)` over `mx('krausList')` |
| `qc-choi-matrix` | notation | `q13-properties:b3` | `mx(out({bell:'00+11'}), {blocks:2})` over `mx(out({bell:'00+11'}), {ptranspose:'B', spectrum:'bars'})` |

Not here, by ownership: the partial transpose $\rho^{T_B}$ and its notation beat (Q12); no-signalling (Q10); the Bloch
ball and $\mathbf r$ (Q8); the von Neumann equation (Q8, `q13-from-unitary:b1` links back).

## 6. Review card per unit (both tracks)
### `q13-from-unitary`
- **G points:** (1) Open evolution = couple to an environment, evolve, forget it. (2) $\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger$. (3) Each $A_m$ reads one environment outcome. (4) $\sum_m A_m^\dagger A_m = I$ keeps the chances adding to one.
- **F points:** (1) $\mathcal E(\rho) = \mathrm{Tr}_E[U_{SE}(\rho\otimes|0\rangle\langle0|)U_{SE}^\dagger] = \sum_m A_m\rho A_m^\dagger$. (2) $A_m = \langle m|U_{SE}|0\rangle_E$. (3) $\sum_m A_m^\dagger A_m = I \iff$ trace-preserving.
- **Equations:** $\mathcal E(\rho) = \sum_m A_m\rho A_m^\dagger,\quad \sum_m A_m^\dagger A_m = I$
- **Trap:** thinking open evolution must be unitary: tracing out an entangled environment makes it non-unitary.

### `q13-properties`
- **G points:** (1) A channel keeps Hermitian, keeps $\mathrm{Tr} = 1$, keeps positivity. (2) Positivity alone is too weak. (3) Complete positivity: positive even on half an entangled pair. (4) The transpose fails it.
- **F points:** (1) $\mathcal E$ is Hermiticity-, trace- and positivity-preserving. (2) Complete positivity: $\mathcal E\otimes I_B \ge 0$. (3) $(T\otimes I)\Phi^+$ has eigenvalue $-\tfrac12$, so $T$ is not CP.
- **Equations:** $\text{spec}\big((T\otimes I)|\Phi^+\rangle\langle\Phi^+|\big) = \{\tfrac12,\tfrac12,\tfrac12,-\tfrac12\}$
- **Trap:** "positive is enough": the transpose is positive yet not a channel.

### `q13-stinespring`
- **G points:** (1) Every channel is a unitary on qubit + environment, environment forgotten. (2) The isometry $V = \sum_m A_m\otimes|m\rangle$ has $V^\dagger V = I$. (3) So it extends to a unitary. (4) A qubit channel needs at most four Kraus operators.
- **F points:** (1) $A_m|\psi\rangle = \langle m|U_{SE}(|\psi\rangle|0\rangle)$. (2) Kraus freedom $D_\nu = \sum_\mu U_{\nu\mu}A_\mu$. (3) At most $N^2 = 4$ operators for a qubit.
- **Equations:** $V^\dagger V = \sum_m A_m^\dagger A_m = I;\quad D_\nu = \sum_\mu U_{\nu\mu}A_\mu$
- **Trap:** thinking the environment is unique: any unitary-related Kraus set is the same channel.

### `q13-depolarizing`
- **G points:** (1) With chance $p$ the qubit is scrambled to the centre. (2) The whole ball shrinks by $1 - \tfrac{4p}3$. (3) At $p = \tfrac34$ the ball is a point. (4) Other channels make offset eggs.
- **F points:** (1) $\mathcal E(\rho) = (1-p)\rho + \tfrac p3(X\rho X + Y\rho Y + Z\rho Z)$. (2) $\mathbf r \to (1 - \tfrac{4p}3)\mathbf r$. (3) A general channel is an affine map $\mathbf r \to M\mathbf r + \mathbf c$.
- **Equations:** $\mathbf r \to (1 - \tfrac{4p}3)\mathbf r$
- **Trap:** reading $p = 1$ as fully mixed: the factor is $-\tfrac13$ there; full mixing is at $p = \tfrac34$.

### `q13-no-cloning`
- **G points:** (1) A copier would map $|\psi\rangle|0\rangle$ to $|\psi\rangle|\psi\rangle$. (2) A CNOT copies the basis but entangles a superposition. (3) $U|+\rangle|0\rangle = \Phi^+ \ne |+\rangle|+\rangle$. (4) Only orthogonal states are clonable.
- **F points:** (1) By linearity $U|+\rangle|0\rangle = \Phi^+$. (2) Cloning forces $\langle\psi|\varphi\rangle = \langle\psi|\varphi\rangle^2$. (3) So states must be equal or orthogonal; an unknown qubit is uncopyable.
- **Equations:** $U|+\rangle|0\rangle = \Phi^+ \ne |+\rangle|+\rangle;\quad \langle\psi|\varphi\rangle = \langle\psi|\varphi\rangle^2$
- **Trap:** "the CNOT is a copier": it copies only computational-basis states.

### `q13-herbert`
- **G points:** (1) Cloning would allow faster-than-light signalling. (2) Alice's basis choice is her message. (3) Bob's qubit is the centre whatever she does. (4) A cloner would let him read it — so it is forbidden.
- **F points:** (1) $\rho_B = \tfrac12 I$ for either Alice basis (no-signalling). (2) A cloner would extract Alice's basis from many copies. (3) No-cloning is the dynamical guarantee of no-signalling.
- **Equations:** $\rho_B = \mathrm{Tr}_A(\rho) = \tfrac12 I$ (both bases)
- **Trap:** separating no-cloning from no-signalling: they are two faces of one wall.

## 7. Symbol-before-use tables
Abbreviations: fu, pr, st, de, nc, he (the six units in order). Carried from Q6–Q12 and recapped at
`q13-from-unitary:b1`: $\rho$, $\mathrm{Tr}$, the Bloch ball and $\mathbf r$, the von Neumann equation (Q8), the
partial trace $\mathrm{Tr}_E$ (Q9), the partial transpose $\rho^{T_B}$ (Q12), no-signalling (Q10), $\Phi^+$ and the
Bell basis (Q6), CNOT and $A\otimes B$ (Q4), $\sigma_x, \sigma_y, \sigma_z$ (Q3), unitaries and $U^\dagger$ (Q2).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $U_{SE}$ (coupling) | fu:b1 | fu:b1 | OK | — |
| $\mathcal E(\rho)$ | fu:b2 | fu:b2 | **FLAG** | $\mathcal E$ (calligraphic, the channel) vs $E$ (italic, entanglement, Q9/Q12); stated in place. Rosetta: "the book writes $T(\rho)$". |
| $A_m$ (Kraus) | fu:b2 | fu:b2 | OK | N&C's $E_k$ noted once. |
| $\sum_m A_m^\dagger A_m$ | fu:b3 | fu:b3 | OK | — |
| complete positivity | pr:b2 | pr:b2 | OK | — |
| Choi matrix | pr:b3 | pr:b3 | OK | Notation beat. |
| $T$ (transpose) | pr:b3 | pr:b3 | OK | The map, not Bergou's channel letter (which the Rosetta notes). |
| $V$ (isometry) | st:b2 | st:b2 | OK | — |
| $D_\nu$, $U_{\nu\mu}$ | st:b3 | st:b3 | OK | Kraus freedom. |
| $N^2$ | st:b3 | st:b3 | OK | $N = 2$ for a qubit. |
| $p$ (depol weight) | de:b1 | de:b1 | OK | Bergou's parametrization; N&C's noted. |
| $\mathbf r \to (1 - \tfrac{4p}3)\mathbf r$ | de:b2 | de:b2 | OK | Rosetta ($\mathbf n$, $\vec r$) in place. |
| affine $M\mathbf r + \mathbf c$ | de:b3 | de:b3 | OK | — |
| $\gamma$ (damping) | de:b3 | de:b3 | OK | Amplitude damping (⚑ P4.5). |
| $U(|\psi\rangle|0\rangle)$ | nc:b1 | nc:b1 | OK | The cloner. |
| $\rho_B$ | he:b2 | Q9 (reduced state) | OK | Bob's reduced state. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\mathrm{Tr}_E$ | fu:b1 | Q9 | OK | Partial trace over the environment. |
| $\langle m|U_{SE}|0\rangle_E$ | fu:b2 | fu:b2 | OK | — |
| $\mathcal E\otimes I_B$ | pr:b2 | pr:b2 | OK | — |
| $(T\otimes I)|\Phi^+\rangle\langle\Phi^+|$ | pr:b3 | pr:b3 | OK | The Choi matrix. |
| SWAP | pr:b3 (F) | pr:b3 | OK | Named in place. |
| $\langle\psi|\varphi\rangle = \langle\psi|\varphi\rangle^2$ | nc:b2 | nc:b2 | OK | N&C Box 12.1. |
| Choi–Jamiołkowski | pr:b4 (F) | pr:b4 | OK | Named, not proved. |

**Counts:** Ground 1 FLAG, Formal 0 FLAGs, resolved in place.

## 8. Errata
Q13 draws no lecture notes (books-phase). Checked against Bergou Ch. 4 and N&C Ch. 8, recomputed twice: the depolarizing
completeness $\sum_m A_m^\dagger A_m = I$, the shrink factor $1 - \tfrac{4p}3$ at $p = 0, 0.5, 0.75, 1$, the Choi
spectrum $\{\tfrac12,\tfrac12,\tfrac12,-\tfrac12\}$ of the transpose, the amplitude-damping ellipsoid, the no-cloning
overlap $\langle0|+\rangle = 0.7071$, and Bob's reduced state $\tfrac12 I$ for both Alice bases.

**Carried from the map (Bergou errata, cited in place):**
- **B13**, p. 69, Eq. 4.21: the left side should read $T(|j_A\rangle\langle k_A|)$; and p. 72, $\beta|0\rangle$ should read $\beta|1\rangle$ (the no-cloning superposition). The second is cited at `q13-no-cloning:b1`.

**Silent notes (no box).**
| Where | Point | Action |
|---|---|---|
| `q13-from-unitary:b2` | Bergou writes the channel $T(\rho)$; N&C writes operation elements $E_k$ | The plan writes $\mathcal E(\rho)$ and $A_m$; one Rosetta line in the notation beat |
| `q13-depolarizing:b2` | Bergou writes the Bloch vector $\mathbf n$ (Eq. 4.31); N&C $\vec r$ | $\mathbf r$ (ruling 10), one Rosetta line |
| `q13-depolarizing:b2` | N&C's $(1-p)$ parametrization (Eq. 8.102) gives factor $1-p$, not $1 - \tfrac{4p}3$ | Bergou's $1 - \tfrac{4p}3$ is primary; N&C's noted once (§12 Q5) |
| `q13-depolarizing:b4` | full depolarizing is at $p = \tfrac34$, not $p = 1$ (a common error) | The clue makes the point explicitly |
| `q13-from-unitary:b2` vs Q9/Q12 | $\mathcal E$ (channel) vs $E$ (entanglement) | calligraphic $\mathcal E$ for the channel, italic $E$ for entanglement; stated (§7) |

## 9. Engine gaps and stage-contract gaps
### 9.1 Engine

**Merged E1 used (no work):** `ptranspose`, `spectrum`, `eigh`, `densityOf`, `mixtureN`, `reducedBloch`, `partialTrace`,
`matmul`, `dagger`, `madd`, `mscale`, `inner`, `traceN`, the Pauli gates `I2/X/Y/Z`, `bell`, `ket`, `runCircuit`. The
transpose-not-CP derivation (D2) and Herbert's reduced states (D6) are **fully E1** — no new engine code.

**E3 `channels` (NOT built; this plan is a first user).** Each channel number is computed in `Q13.values.ts` through
one of these, and `q1213plan-engine.ts` has computed it from the primitives above. Twins in
`pipeline/make_qc_fixtures.py` (seed 709); every value gets a property test.

| Function (signature) | Returns | Used by | numpy-twin route |
|---|---|---|---|
| `depolarizing(p: number): Mat[]` | the four Kraus operators | fu, de, st | explicit $\{\sqrt{1-p}\,I, \sqrt{p/3}\,X, \sqrt{p/3}\,Y, \sqrt{p/3}\,Z\}$ |
| `amplitudeDamping(gamma: number): Mat[]` | the two Kraus operators | de:b3 | explicit $\{[[1,0],[0,\sqrt{1-\gamma}]], [[0,\sqrt\gamma],[0,0]]\}$ |
| `bitFlip(p)`, `phaseFlip(p): Mat[]` | the Kraus operators (previews) | de:b3 | explicit |
| `applyKraus(kraus: Mat[], rho: Mat): Mat` | $\sum_m A_m\rho A_m^\dagger$ | fu, de | $\sum_m K_m\rho K_m^\dagger$ |
| `isCPTP(kraus: Mat[]): boolean` | $\sum_m A_m^\dagger A_m = I$ and CP? | fu:b3 | sum ≈ I; Choi ≥ 0 |
| `choi(kraus: Mat[]): Mat` | the Choi matrix $(\mathcal E\otimes I)\Phi^+$ | pr (cross-check) | `(E⊗I)` on $\Phi^+$ |
| `blochAffine(kraus: Mat[]): {M: number[][]; c: number[]}` | the affine Bloch map | de:b2–b4 | apply to $\tfrac12 I, \sigma_j$, read $M, \mathbf c$ |
| `krausFromUnitary(U: Mat, envDim: number): Mat[]` | the Kraus set of a dilation | st | $A_m = \langle m|U|0\rangle_E$ |
| `stinespring(kraus: Mat[]): {U: Mat; envDim: number}` | a dilating unitary | st (cross-check) | isometry $V$, extended to $U$ |

E3 must merge **before** the Q13 build (re-map batch 5 → Q13 batch 6; §12 Q6). The transpose Choi spectrum (D2) uses
only `ptranspose`/`spectrum`, so it is verifiable today and already is (`q13TransposeSpec`).

### 9.2 Stage contract

**`matrix` v2 (needs: matrix-v2 + matrix-channel-source).** Most uses are merged: `outer`, `rho`, `pauli`, `product`,
`lin`, `blocks:2`, `trace`, `ptranspose:'B'`, `spectrum:'bars'`. **One new source needed (§12 Q2):** a channel's Kraus
operators and their $\sum_m A_m^\dagger A_m$ carry coefficients ($\sqrt{1-p}$, $\sqrt{p/3}$) outside the `MatrixCoef`
exact set, so the `lin` route cannot build them. Proposed additive source:
```ts
// added to MatrixSource (W-709 #15 extension); resolved by E3, never hand-typed
| { channel: { key: 'depolarizing' | 'amplitudeDamping' | 'bitFlip' | 'phaseFlip'; param: number;
              which: 'kraus' | 'sumAA' | 'choi'; index?: number } }
```
`which:'kraus'` draws the operator list (a row of small matrices; `index` picks one), `'sumAA'` draws
$\sum_m A_m^\dagger A_m$ (resolving to $I$, with `trace`), `'choi'` the Choi matrix. Used by `krausList`,
`krausSumAA`, `isometryVdagV` in the beats. If the judge declines it, fu:b3/st:b2 fall back to `mx(pa('I'), {trace:true})`
with "$= \sum_m A_m^\dagger A_m$" in the caption, and the Kraus list is shown as a figure only.

**`bloch-ball` `ellipsoid` field (NEW; needs: ball-ellipsoid; re-map §6.2, judge Q3).** The image of the Bloch ball
under a channel. Proposed additive field:
```ts
// added to BallState
ellipsoid?: { channel: 'depolarizing' | 'amplitudeDamping' | 'bitFlip' | 'phaseFlip'; param: Scrub }
```
The resolver calls E3's `blochAffine` to get $(M, \mathbf c)$ and draws the translucent image ellipsoid
$\{M\mathbf r + \mathbf c : |\mathbf r| \le 1\}$ inside the unit ball, `param` sweepable. A negative isotropic factor
(depolarizing $p > \tfrac34$) draws an inside-out shrunk shell. Fidelity `qc-ball-ellipsoid-engine` ("the egg is the
engine's affine map, not a redrawn sphere"). Used by de:b2–b4.

**`plot` (Q12 §9.2; needs: plot).** Q13 adds the curve key `depolRadius` ($|1 - \tfrac{4p}3|$ over $p$); used de:b2,b4.

**`two-qubit` (needs: two-qubit)** — merged; Herbert uses `source:{rho}` (the `MZ`/`MX` mixtures) with
`arrows:'reduced'`; no E2-gated readout. **`circuit`** — merged; `C_DEPOL` uses a `unitary` op (the dilation; matrix
from the values file), `C_CLONE` is a single CNOT.

### 9.3 Widget gaps
**W13 `channel-lab`** (deferred under the cap): pick a channel and a strength, see the Kraus operators, the shrinking/
offset Bloch ball, and $\sum_m A_m^\dagger A_m = I$ live. The §3 stand-ins and the stage sweeps carry the units until then.

## 10. Media
- **Opener (Part V, Blender still; re-homed here, old map §6):** "the ball shrinks". A Bloch-ball mesh is deformed by
  `blochAffine` into the depolarizing, phase-flip and amplitude-damping ellipsoids. Data from the engine
  (`blochAffine`, `depolarizing`, `phaseFlip`, `amplitudeDamping`), exported by `pipeline/blender/gen_opener_data.ts`;
  Blender draws geometry only, never computes physics. Manifest keys `q13DepolFactor`, `q13AmpDampC`, `q13AmpDampMxx`,
  `q13AmpDampMzz`.
- **Film (deferred) `qc-q13-shrinking-ball`** "Depolarizing: the whole sphere contracts by $1 - 4p/3$": the Bloch ball
  shrinking to a point at $p = \tfrac34$, then turning inside-out past it. Manifest keys `q13DepolFactor`. Drawn numbers
  re-checked against the engine.
- **Decor (Higgsfield, credits need the user):** condensation beads forming on a cold plate in slow motion (old map
  §6); no text, no numbers, no diagrams.

## 11. Hooks
### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-channel` | Where channels come from | Q13 · `q13-from-unitary` | `qc-von-neumann-equation`, `qc-partial-trace` | — |
| `qc-cptp` | What a channel preserves | Q13 · `q13-properties` | `qc-channel`, `qc-partial-transpose` | — |
| `qc-stinespring` | Every channel is a unitary | Q13 · `q13-stinespring` | `qc-channel` | — |
| `qc-depolarizing` | The shrinking Bloch ball | Q13 · `q13-depolarizing` | `qc-cptp`, `qc-bloch-ball` | `bloch-sphere` |
| `qc-no-cloning` | Why you cannot copy a qubit | Q13 · `q13-no-cloning` | `qc-cnot` | — |
| `qc-herbert` | Cloning would break relativity | Q13 · `q13-herbert` | `qc-no-cloning`, `qc-no-signalling` | — |

Bridge ids used, all existing: `qc-l6-mixture`, `qc-l6-bloch`. `qc-depolarizing` shares the 448 `bloch-sphere` twin
(the Bloch ball is the same object; the concept test allows a shared `sameAs`).

**Future bridges (TODO; targets not built):** Q14 (channels as generalized measurements; `q13-from-unitary` →
`q14-povm`, non-trace-preserving maps $\sum A^\dagger A \le I$), Part XI (Lindblad decay as a continuous channel;
`q13-depolarizing` → the master equation), Part IX codes (channels as errors; `q13-properties` → error correction).

### 11.2 Arcade (6 levels)
Label constant: `const Q13x = (unit, label) => ({ lecture: 'Q13', unit, label })`. All six are Spot the error.
1. **`q13-from-unitary` · `qc-open-unitary`** — "Must it be unitary?"
   - Steps: "A closed qubit evolves by $\rho \to U\rho U^\dagger$." · "A real qubit touches its environment." · "Tracing out the environment is still a unitary on the qubit." · "So open evolution is unitary too."
   - `wrong: 3`. Why: tracing out an entangled environment gives a non-unitary channel $\sum_m A_m\rho A_m^\dagger$; that is the whole point of the chapter.
2. **`q13-properties` · `qc-positive-enough`** — "Is positive enough?"
   - Steps: "The transpose keeps eigenvalues, so it is positive." · "A positive map sends states to states." · "So the transpose is a valid channel." · "Therefore transposing a density matrix is a physical operation."
   - `wrong: 3`. Why: the transpose is positive but not completely positive; $(T\otimes I)\Phi^+$ has eigenvalue $-\tfrac12$ (`q13TransposeSpec`).
3. **`q13-stinespring` · `qc-unique-env`** — "One environment?"
   - Steps: "A channel comes from a unitary on qubit + environment." · "So each channel has its own unique environment." · "Two Kraus sets with different sizes are different channels." · "You can read the environment off the channel."
   - `wrong: 2`. Why: the dilation is not unique; Kraus sets related by $D_\nu = \sum_\mu U_{\nu\mu}A_\mu$ are the same channel.
4. **`q13-depolarizing` · `qc-full-at-one`** — "Fully mixed at $p = 1$?"
   - Steps: "The depolarizing factor is $1 - \tfrac{4p}3$." · "At $p = 1$ it is $-\tfrac13$." · "A non-zero factor means the ball is not a point." · "So the qubit is fully depolarized at $p = 1$."
   - `wrong: 4`. Why: full depolarizing (factor $0$) is at $p = \tfrac34$; at $p = 1$ the factor is $-\tfrac13$, an inverted ball (`q13DepolFactor`).
5. **`q13-no-cloning` · `qc-cnot-cloner`** — "CNOT as a copier"
   - Steps: "A CNOT maps $|0\rangle|0\rangle \to |00\rangle$ and $|1\rangle|0\rangle \to |11\rangle$." · "So it copies the control onto the target." · "By linearity it copies any state." · "So a CNOT clones $|+\rangle$ to $|+\rangle|+\rangle$."
   - `wrong: 3`. Why: linearity gives $U|+\rangle|0\rangle = \Phi^+$, an entangled pair, not $|+\rangle|+\rangle$ (`q13CloneOut`).
6. **`q13-herbert` · `qc-clone-signal`** — "A harmless copier?"
   - Steps: "Alice and Bob share a Bell pair." · "Bob's qubit is the maximally mixed state." · "A perfect cloner just makes copies of his own qubit." · "Copies are harmless, so a cloner would be allowed."
   - `wrong: 4`. Why: copies would reveal Alice's measurement basis instantly, signalling faster than light; no-signalling forbids the cloner (`q13HerbertRbZ` = `q13HerbertRbX`).

## 12. Questions for the judge
**Q1. Bergou ⚑ problems P4.1–P4.5.** All are ⚑; HW3 is not ingested. *Recommend:* use P4.5 (amplitude damping) only as a
cited preview in `q13-depolarizing:b3`, and grade **no** challenge from them — every Q13 challenge is built on the
depolarizing/CNOT running examples (follows `qc709-Q8Q9.md` #5). Ask the user before using any HW3 item.

**Q2. A `matrix` channel source (§9.2).** The depolarizing Kraus operators carry $\sqrt{1-p}$, $\sqrt{p/3}$ coefficients
outside the `MatrixCoef` exact set, so `lin` cannot build the Kraus list or $\sum_m A_m^\dagger A_m$. *Recommend:* add the
additive `{channel: {key, param, which, index?}}` source (resolved by E3) to the `matrix` kind. If declined, fu:b3/st:b2
fall back to `mx(pa('I'), {trace:true})` captioned "$= \sum_m A_m^\dagger A_m$", and the Kraus list prints as a figure.

**Q3. The `bloch-ball` `ellipsoid` field (§9.2; re-map §6.2).** Not built. *Recommend:* build it to the §9.2 shape
(E3's `blochAffine`) before the Q13 build; `q13-depolarizing` is its first user. If it slips, de:b2–b4 fall back to
`ball({r:[...]})` points swept in $p$ plus the `plot('depolRadius')` curve (each derivation keeps ≥ 2 distinct non-ellipsoid
views via `plot` and `matrix`, so W-709 #7 still passes).

**Q4. The channel letter.** $\mathcal E$ (N&C) vs Bergou's $T$ vs the entanglement $E$ (Q9/Q12). *Recommend:* $\mathcal E$
for the channel (calligraphic), $A_m$ for Kraus operators, with a one-line Rosetta noting Bergou's $T(\rho)$ and N&C's
$E_k$. Keeps $E$ free for entanglement. (§7, §8.)

**Q5. The depolarizing parametrization.** Bergou's $\mathcal E(\rho) = (1-p)\rho + \tfrac p3(\dots)$ gives factor
$1 - \tfrac{4p}3$; N&C's $(1-p)$-form (Eq. 8.102) gives $1-p$. *Recommend:* **Bergou's** is primary (the course's main
text for Ch. 4), with N&C's noted once as a Rosetta; the "collapse at $p = \tfrac34$" fact depends on this choice.

**Q6. E3 before Q13.** Every channel number needs `channels` (E3). *Recommend:* confirm the order E3 (batch 5) → Q13
(batch 6); the plan's numbers are verified today from E1 primitives, so E3 only needs to match them (the twin is written).
Note: the transpose-not-CP and Herbert results are pure E1 and pass now.

**Q7. Scope of "impossible machines".** The re-map's title promises Herbert; the old map also listed a later approximate
cloner. *Recommend:* keep Q13 to the **no-cloning theorem and Herbert's FTL argument** only; the approximate (Bužek–
Hillery) cloner and the universal-NOT belong to a later chapter (old map Q18), not here.
