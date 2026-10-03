# P-Q12-story — Q12 "Detecting and measuring entanglement" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q8-story.md` (two tracks; the 13 sections of
`skills/03-chapter-plan`), with the two standing gates: every derivation list, in both tracks, steps the stage through
≥ 2 distinct views (`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one
notation beat (`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Map entry: `P-709-remap-L1L7.md` §2 (Q12, lines
~181), §4 row Q12 (D1–D6), §5 (ρ^{T_B}, concurrence), §6 (engine E2 `entangle`). Rulings: `qc709-remap.md` (#11 trace
distance/fidelity owned by Q9; #12 HW; #13 ⚑ asides; the review rulings: no raw TeX, engine-backed answers),
`qc709-Q8Q9.md` (#5 ⚑ as cited derivation; #6 entropy sweep via `plot`; #7 E's notation beat is Q9's). Planned
together with `P-Q13-story.md`, which takes this chapter's partial transpose on into open-system maps.

**Phase.** Q12 is a **`'books'`-phase** chapter: the notes stop at Lecture 7, so every ramp beat is tagged `[B]`
(phase `'books'`, the chapter's core layer; `content.test.tsx` rank books = 1) and every clue is `[C]` (phase
`'clue'`). There is no `[L]` beat and no `'core'`/`'lecture'` phase (those are for F- and lecture-chapters). Sources are
books only.

**Sources read** (printed pages; paraphrased, never quoted — copyrighted).
- Bergou §3.5 pp. 40–42 (separability; the Peres PPT criterion; Eqs. 3.22–3.26, the running example); §3.5 pp. 42–44
  (entanglement witnesses, Eqs. 3.27–3.28; the CV criteria are **not** taught here, 2⊗2 only); §3.6 pp. 45–46 (LOCC;
  the Procrustean method, with the failure branch of erratum **B9**); §3.7 pp. 47–53 (E = S(ρ_A), additivity, local-
  unitary invariance, no increase under LOCC, E_F Eqs. 3.59–3.60 with erratum **B11**); §3.8 pp. 54–56 (concurrence
  Eqs. 3.65–3.76, negativity Eqs. 3.77–3.79); §3.9 pp. 57–58 (GHZ vs W, SLOCC, the CKW inequality Eq. 3.84, the W
  example Eqs. 3.85–3.86 with erratum **B12**); P3.4–P3.8 (all ⚑; used as cited derivations, not graded, §12 Q1).
- N&C §12.5.1 pp. 571–578 (majorization and LOCC: Theorem 12.15 λ_ψ ≺ λ_φ; stated, not proved) and §12.5.2 pp. 578–582
  (distillation and dilution; E(|ψ⟩) as the limiting ratio).
- Ownership (re-map §2.2): Q12 owns PPT/ρ^{T_B}, witnesses, LOCC/distillation/formation, concurrence, negativity,
  SLOCC, monogamy, bound entanglement. **Q9 owns** S(ρ), the partial trace, Schmidt, purification, trace distance and
  fidelity — Q12 links back for E = S(ρ_A) and adds only the *measure* properties. **Q10 owns** separable Σp ρ_A⊗ρ_B,
  CHSH and LHV — Q12 links back ("PPT catches what CHSH misses"). **Q7 owns** GHZ and W (`q7-ghz`); Q12 links back.
  **Q6** owns the Bell basis and the coefficient matrix. **Q8** owns ρ, purity, the Bloch ball.

**Evidence.** Every number was computed twice, for Q12 and Q13 at once.
- The app's merged engine on `main` (`q1213plan-engine.ts`, scratchpad, bundled with rolldown, run with node). E2 is not
  built yet, so each entanglement number is computed here from the **merged E1 primitives** (`ptranspose`, `eigh`,
  `svd`, `sqrtPSD`, `partialTrace`, `reducedDensity`, `vonNeumann`, `densityOf`, `mixtureN`, `pauliString`) by the same
  route the future E2 function will use — the plan's §9.1 names the E2 wrapper each value then calls.
- An independent numpy/scipy route (`q1213plan-numpy.py`): explicit state vectors; partial traces by `einsum` on the
  reshaped tensor; the partial transpose by an axis swap on the reshaped density tensor; Wootters concurrence by the
  eigenvalues of ρ·ρ̃; the Procrustean success chance from its closed form.
- Result (`q1213plan-compare.py`): 78 numbers under 33 keys (both chapters) agree to 6 decimals, **no exceptions**.

**Conventions** (Q8/Q9's, plus these).
- **Bell names (ruling 9).** First Bell name in the chapter is tagged once: "$\Psi^-$ (notes, N&C: $\beta_{11}$ up to a
  phase; Bergou: $\Phi_-$)". The running PPT state uses the singlet $\Psi^-$.
- **The reduced state is $\rho_A$** (Q9's letter), its Bloch vector $\mathbf r$ (Q8's letter, ruling 10).
- **The entanglement measure $E$** is Q9's $E = S(\rho_A)$ (Q9 ruling 7 gave it a notation beat); Q12 does not
  re-introduce it. $S$ is in **bits** ($\log_2$), as in Q9.
- **$p$ and $w$** are mixing weights of the running families (never a probability shown as a percent).
- **Units & text.** All inline math is TeX inside `$…$`; no TeX command outside `$…$`. No plan ids (D1, §5, b3) in
  learner text: cross-references read "Unit 12.1", "Chapter Q9". Every learner-visible number is rendered from its
  claim with `d(V.key, n)`; the plan prints the value for review only. No amplitude or matrix entry is shown as a
  percent; this chapter shows no percent at all. Units in order: 12.1 `q12-ppt`, 12.2 `q12-witness`, 12.3 `q12-locc`,
  12.4 `q12-entropy`, 12.5 `q12-concurrence`, 12.6 `q12-multipartite`.
- **Claim keys** `q12…` in `Q12.values.ts`, as `Q9.values.ts`.

**Stage shorthand.** Each form expands to exactly one `StageState` (a derivation `view` is always one state). Q8/Q9's
forms carry over; new ones are marked.

| Shorthand | Expands to | Needs |
|---|---|---|
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'decimal', ...f}` | matrix-v2 |
| `tq(S, f)` | `{kind:'two-qubit', source:{ket:S}, labels:'A-B', arrows:'reduced', grid:'none', ...f}` | two-qubit |
| `tqR(M, f)` | as `tq`, with `source:{rho:M}` | two-qubit |
| `tqReduce(K, keep, f)` | as `tq`, with `source:{reduce:{ket:K, keep}}` | two-qubit |
| `amp(S, f)` | `{kind:'amplitudes', state:S, ...f}` | — |
| `circ(C, k, f)` | `{kind:'circuit', circuit:C, upTo:k, ...f}` | — |
| `ball(P, f)` | `{kind:'bloch-ball', point:P, shot:'B-STD', ...f}` | — |
| `plot(fn, x, f)` (new) | `{kind:'plot', fn, x, ...f}` (SVG `plot`, §9.2) | plot |

| Matrix source | Expands to | Needs |
|---|---|---|
| `out(K)` | `{outer:[K]}` = \|K⟩⟨K\| | matrix |
| `rho(K)` | `{rho:{ket:K}}` | matrix |
| `mix([w, K], …)` | `{rho:{mixture:[{w, ket:K}, …]}}`; w an engine value or exact fraction, may sweep | matrix |
| `coef(K)` | `{coef:K}` (the two-qubit coefficient matrix A) | matrix |
| `pa('YY')` | `{pauli:'YY'}` | matrix-v2 |
| `prod(A, B, …)` | `{product:[A, B, …]}` | matrix-v2 |
| `lin([c, A], …)` | `{lin:[{c, src:A}, …]}`, c from the fixed exact set | matrix-v2 |
| field `ptranspose:'B'` | the partial transpose on the second qubit, moved cells dashed (`ptranspose`) | matrix-v2 |
| field `spectrum:'bars'\|'entropy'` | eigenvalue bars (negatives flagged) / with −λlog₂λ and an S readout | matrix-v2 |
| field `svd:true` | Schmidt-weight bars beside a `coef` matrix | matrix |

| Name | Source | Value (review only) |
|---|---|---|
| `PB(p)` | `mix([p, {bell:'01-10'}], [1−p, {ket:'00'}])` (Bergou Eq. 3.23) | $p\|\Psi^-\rangle\langle\Psi^-\| + (1-p)\|00\rangle\langle00\|$ |
| `W(w)` | `mix([w, {bell:'01-10'}], [(1−w)/4, {ket:'00'}], [(1−w)/4, {ket:'01'}], [(1−w)/4, {ket:'10'}], [(1−w)/4, {ket:'11'}])` | Werner $w\|\Psi^-\rangle\langle\Psi^-\| + \tfrac{1-w}4 I$ |
| `PSI(θ)` | `{family:'cos-sin', thetaDeg:θ}` (two-qubit) or `coef`/ket in matrix | $\cos\theta\|00\rangle + \sin\theta\|11\rangle$ |
| `GHZ`, `W3` | `{bell:'000+111'}`, `{ket}` via `wState(3)` | Q7's GHZ, W |

**Circuits.** `C_PROC` (Procrustean, wires A, A′, B): `|ψ⟩_{AB}` prepared on A,B, ancilla A′ = `|0⟩`, a `unitary` op
`U_A` on (A, A′), then `[m(A′, 0)]`, clbits 1 — the build uses a `circuit` `unitary` op for `U_A` (qc/circuit.ts
`UnitaryOp`; the matrix comes from `Q12.values.ts`, never hand-typed). Used at `upTo` 1 (before) and 2 (after U_A), with
`outcomes:'0'` (success) / `'1'` (failure).

## 0. Chapter map
Q12 answers the map's question: **"Given a messy two-particle state, how can we tell whether it is entangled, and by
how much?"** It is the third chapter of Part IV, "Entanglement".

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q12-ppt` | The partial transpose test | If a state is separable, what survives a one-sided transpose? | Bergou §3.5 pp. 40–42, Eqs. 3.22–3.26 | — | Q10 `q10-separable`, `q10-chsh`; Q8 ρ; Q6 `q6-bell-basis` |
| 2 | `q12-witness` | One observable that spots entanglement | Can a single measured quantity flag an entangled state? | Bergou §3.5 pp. 42–44, Eqs. 3.27–3.28 | `l4-projectors` | Q12 `q12-ppt`; Q3 observables |
| 3 | `q12-locc` | Local moves and a shared coin | What can two distant labs do to a shared pair, and at what cost? | Bergou §3.6 pp. 45–46; N&C §12.5.2 pp. 578–582 | — | Q11 teleportation; Q6 Bell basis |
| 4 | `q12-entropy` | Entanglement as a number | How much entanglement does a pure pair hold, and does it ever grow? | Bergou §3.7 pp. 47–53; N&C §12.5.1 p. 573 | — | Q9 `q9-entropy` (E = S(ρ_A)); F2 Shannon |
| 5 | `q12-concurrence` | Concurrence: one formula for two qubits | Is there a closed formula for a two-qubit pair's entanglement? | Bergou §3.8 pp. 54–56, Eqs. 3.65–3.79 | — | Q9 Schmidt, SVD; Q6 coefficient matrix |
| 6 | `q12-multipartite` | Three qubits: GHZ, W and monogamy | With three qubits, can every pair be strongly entangled at once? | Bergou §3.9 pp. 57–58, Eq. 3.84 | — | Q7 `q7-ghz` (GHZ, W); Q12 `q12-concurrence` |

**Outcomes** (Ground wording):
- Take the transpose of one half of a density matrix and read whether the result has a negative eigenvalue; say why a negative one proves entanglement.
- Build one observable, a witness, whose average is negative only for some entangled states.
- List what local operations and a classical phone call can and cannot do to a shared pair, and read the Procrustean success chance off the algebra.
- Quote the entanglement of a pure pair as $E = S(\rho_A)$, and say why local unitaries and a lost phone call leave it unchanged.
- Compute the concurrence of a two-qubit state and turn it into the entanglement.
- Contrast GHZ and W, and show why one qubit cannot be fully entangled with two others at once (monogamy).

**Prerequisites** (concepts): Q9 `qc-partial-trace`, `qc-entanglement-entropy` (E = S(ρ_A)), `qc-schmidt`,
`qc-trace-distance` (the trace norm); Q10 `qc-separable`, `qc-chsh`, `qc-no-signalling`; Q8 `qc-density-matrix`,
`qc-bloch-ball`, `qc-positive-operator`; Q7 `qc-ghz`; Q6 `qc-bell-basis`, `qc-coefficient-matrix`; Q2 `qc-unitary`;
F2 `qc-shannon-entropy`, `qc-binary-entropy`. 448 twins: `l4-projectors`.

**Openers and films.** Part IV's opener (planned in `P-Q10-story.md` §10) is re-used, not re-homed here; one Motion
Canvas film is planned and deferred (§10).

## 1. Story beats per unit
Kinds per unit (a derivation `view` may use only kinds the unit's beat stages show; checked per unit): `q12-ppt`
matrix, plot, two-qubit · `q12-witness` matrix · `q12-locc` amplitudes, circuit · `q12-entropy` matrix, two-qubit,
plot · `q12-concurrence` matrix, two-qubit, plot · `q12-multipartite` amplitudes, two-qubit. Fidelity items used: the
`matrix` items (`qc-matrix-entries`, `qc-matrix-not-a-space`, `qc-matrix-trace-engine`), the `two-qubit` items
(`qc-tq-grid-signed`, `qc-tq-local-arrows`, `qc-tq-not-two-places`), `qc-amp-engine`, `qc-circuit-engine-state`, and
the new `plot` item `qc-plot-engine-curve` (§9.2).

**Phase note.** Every ramp beat is `[B]` (`'books'`); clue beats are `[C]` (`'clue'`). No `[L]`.

### Unit `q12-ppt` — The partial transpose test

**`q12-ppt:b1` [B]** (the question: a test from the matrix alone)
- **G:** "Chapter Q10 called a pair [[qc-separable|separable]] when it is a chance-mixture of product states. But handed one density matrix, how do we tell? Chapter Q10's $S \le 2$ test misses some entangled states. We want a sharper one."
- **F:** "A bipartite state is [[qc-separable|separable]] if $\rho = \sum_k p_k\,\rho_{A,k}\otimes\rho_{B,k}$ (Chapter Q10). Deciding separability from a given $\rho$ is hard in general; the CHSH test of Chapter Q10 is only sufficient and misses entangled states that break no Bell inequality. We build a stronger, purely algebraic test."
- **Cap:** G "separable = a mixture of products; we want a test" · F "separability from $\rho$ alone: a sharper criterion than CHSH"
- **Stage:** `tqR(PB(0.5), {grid:'T'})` — the running state's reduced balls and correlations. needs: two-qubit.
- **Claims:** none (recall).
- **Terms:** `qc-separable` (Q10, link-back).

**`q12-ppt:b2` [B] · notation beat, `introduces: ['qc-partial-transpose']`** (transpose only Bob's index)
- **G:** "Here is the trick. Write $\rho$ in blocks, one per value of Bob's bit. The [[qc-partial-transpose|partial transpose]] $\rho^{T_B}$ transposes inside each block — it flips Bob's two indices but leaves Alice's alone. The matrix changes; its row-sums do not."
- **F:** "In a product basis $\rho_{m\mu,n\nu} = \langle m\mu|\rho|n\nu\rangle$. The [[qc-partial-transpose|partial transpose]] on $B$ is $(\rho^{T_B})_{m\mu,n\nu} = \rho_{m\nu,n\mu}$ (Bergou Eq. 3.22): it transposes the $B$ indices only. It depends on the basis, but its eigenvalues do not."
- **Cap:** G "$\rho^{T_B}$: transpose each block; four cells swap" · F "$(\rho^{T_B})_{m\mu,n\nu} = \rho_{m\nu,n\mu}$: the $B$ index transposed"
- **Stage:** `split( mx(PB(0.5), {blocks:2}) / mx(PB(0.5), {blocks:2, ptranspose:'B'}) )` — the moved cells dashed. needs: matrix-v2.
- **Claims:** `q12BergRho05` → the running matrix; `q12BergRhoPT05` → its partial transpose.
- **Fidelity:** `qc-matrix-entries`.

**`q12-ppt:b3` [B]** (the Peres test; D1)
- **G:** "Now take eigenvalues. A separable $\rho$ always gives a non-negative $\rho^{T_B}$: a sum of products stays a valid state under the flip. So **one negative eigenvalue proves entanglement.** Our running state has a negative one for every $p$ above 0."
- **F:** "If $\rho$ is separable then $\rho^{T_B} = \sum_k p_k\,\rho_{A,k}\otimes\rho_{B,k}^{T}\ge 0$, since a transposed state is still a state. So a **negative** eigenvalue of $\rho^{T_B}$ is sufficient for entanglement (Peres). For $\rho(p) = p|\Psi^-\rangle\langle\Psi^-| + (1-p)|00\rangle\langle00|$ the smallest eigenvalue is $\tfrac12\big[(1-p) - \sqrt{(1-p)^2 + p^2}\big] < 0$ for all $p > 0$ (Eq. 3.26)."
- **Cap:** G "one negative eigenvalue after the flip ⇒ entangled" · F "$\lambda_{\min}(\rho^{T_B}) < 0$ for all $p > 0$: entangled"
- **Stage:** `split( mx(PB({from:0, to:1}), {ptranspose:'B', spectrum:'bars'}) / plot('pptLambdaMin', {min:0, max:1}, {marker:0.5}) )` — bars with the negative one flagged, swept in $p$; the curve $\lambda_{\min}(p)$. needs: matrix-v2, plot.
- **Claims:** `q12BergPptSpec05` → (−0.1036, 0.25, 0.25, 0.6036); `q12BergLamMin` → the four sampled values.
- **Fidelity:** `qc-matrix-entries`, `qc-plot-engine-curve`.

**`q12-ppt:b4` [B]** (exact for two qubits; stronger than CHSH)
- **G:** "For two qubits (and qubit–qutrit) the test is perfect: a negative eigenvalue appears **exactly** when the state is entangled. And it is sharper than Chapter Q10's Bell test. Our state breaks no CHSH bound until $p$ passes $0.707$, yet it is entangled all the way down."
- **F:** "For $2\otimes2$ and $2\otimes3$ systems the Peres criterion is also necessary (Horodecki): $\rho^{T_B}\ge 0 \iff$ separable. The running state satisfies every Bell inequality for $p \le 1/\sqrt2 \approx 0.707$, yet its partial transpose is negative for all $p > 0$, so PPT detects entanglement that CHSH cannot."
- **Cap:** G "two qubits: negative ⇔ entangled; sharper than the Bell test" · F "$2\otimes2$: PPT is necessary and sufficient; strictly stronger than CHSH"
- **Stage:** `plot('pptLambdaMin', {min:0, max:1}, {marker:0.7071, shade:{from:0.7071, to:1}})` — the curve, the CHSH threshold marked, the CHSH-detectable region shaded. needs: plot.
- **Claims:** `q12ChshThresh` → 0.7071; `q12BergLamMin` (reused).
- **Fidelity:** `qc-plot-engine-curve`.

**`q12-ppt:b5` [C]** (the Werner state)
- **Q G:** "Take the Werner state: a singlet mixed with pure noise, $w|\Psi^-\rangle\langle\Psi^-| + (1-w)\tfrac14 I$. For which $w$ does the flip give a negative eigenvalue?"
- **Q F:** "Apply the Peres test to the Werner state $\rho(w) = w|\Psi^-\rangle\langle\Psi^-| + (1-w)\tfrac14 I$. For which $w$ is $\lambda_{\min}(\rho^{T_B}) < 0$?"
- **Reveal G:** "The smallest eigenvalue is $(1-3w)/4$: negative exactly when $w$ is above $\tfrac13$. So the Werner state is entangled precisely for $w > \tfrac13$."
- **Reveal F:** "$\lambda_{\min}(\rho^{T_B}) = (1-3w)/4$, negative for $w > \tfrac13$. Since PPT is exact for two qubits, the Werner state is entangled exactly for $w > \tfrac13$ — the same threshold the concurrence will give in Unit 12.5."
- **Reveal cap:** G/F "Werner: entangled for $w > \tfrac13$"
- **Stage:** question `tqR(W(0.5), {grid:'T'})` (the Werner balls, no spectrum given away); reveal `mx(W({from:0, to:1}), {ptranspose:'B', spectrum:'bars'})`. needs: matrix-v2, two-qubit.
- **Claims:** `q12WerPpt` → (0 at ⅓, −0.125 at ½, −0.5 at 1).

### Unit `q12-witness` — One observable that spots entanglement

**`q12-witness:b1` [B]** (the idea of a witness)
- **G:** "A [[qc-entanglement-witness|witness]] is one Hermitian observable $W$ whose average is **never negative** on a separable state, but **is** negative on at least one entangled state. Measure $\langle W\rangle$; a negative reading proves entanglement, with no tomography."
- **F:** "An [[qc-entanglement-witness|entanglement witness]] $W$ is a Hermitian operator with $\mathrm{Tr}(\rho_s W)\ge 0$ for every separable $\rho_s$, and $\mathrm{Tr}(\rho_e W) < 0$ for at least one entangled $\rho_e$. Because $W$ is Hermitian it is in principle an observable, so a single expectation value can certify entanglement."
- **Cap:** G "a witness $W$: $\langle W\rangle \ge 0$ for separable, $< 0$ for some entangled" · F "$\mathrm{Tr}(\rho_s W)\ge 0$ always; $\mathrm{Tr}(\rho_e W) < 0$ for some $\rho_e$"
- **Stage:** `mx(PB(0.5), {trace:true})` — the running state (its witness is built next). needs: matrix.
- **Terms:** `qc-entanglement-witness` (defined here, plain term).

**`q12-witness:b2` [B]** (build it from a negative eigenvalue; D2)
- **G:** "Here is how to build one. Take the eigenvector $|\eta\rangle$ for the negative eigenvalue of $\rho^{T_B}$. Then $W = (|\eta\rangle\langle\eta|)^{T_B}$ works: its average on our state equals that negative eigenvalue, $-0.104$."
- **F:** "Let $|\eta\rangle$ be the eigenvector of $\rho^{T_B}$ with eigenvalue $\lambda_- < 0$. Using $\mathrm{Tr}(X^{T_B}Y) = \mathrm{Tr}(X\,Y^{T_B})$, set $W = (|\eta\rangle\langle\eta|)^{T_B}$. Then $\mathrm{Tr}(\rho W) = \mathrm{Tr}(\rho^{T_B}|\eta\rangle\langle\eta|) = \lambda_- < 0$ (Eq. 3.27), while $\mathrm{Tr}(\rho_s W) = \mathrm{Tr}(\rho_s^{T_B}|\eta\rangle\langle\eta|)\ge 0$ for separable $\rho_s$ (Eq. 3.28)."
- **Cap:** G "$W = (|\eta\rangle\langle\eta|)^{T_B}$; $\langle W\rangle = -0.104$ here" · F "$\mathrm{Tr}(\rho W) = \lambda_- = -0.104$; $\ge 0$ on every separable state"
- **Stage:** `split( mx('witnessW', {}) / mx(prod('rhoPB', 'witnessW'), {trace:true}) )` — the witness $W$ (built in the values file from $|\eta\rangle$) and the trace $\mathrm{Tr}(\rho W)$. needs: matrix-v2.
- **Claims:** `q12WitnessLamMin` → −0.1036; `q12WitnessVal` → −0.1036 (the trace).
- **Fidelity:** `qc-matrix-trace-engine`.

**`q12-witness:b3` [C]** (what the non-negative side rests on)
- **Q G:** "Why is $\langle W\rangle$ never negative on a separable state?"
- **Q F:** "Which single fact forces $\mathrm{Tr}(\rho_s W)\ge 0$ for every separable $\rho_s$?"
- **Reveal G:** "Because a separable state stays positive under the one-sided flip: $\rho_s^{T_B}\ge 0$. Sandwiched between $|\eta\rangle$ and $\langle\eta|$, a positive operator can only give something $\ge 0$."
- **Reveal F:** "That $\rho_s^{T_B}\ge 0$ for separable $\rho_s$ (the same fact behind PPT). Then $\mathrm{Tr}(\rho_s W) = \langle\eta|\rho_s^{T_B}|\eta\rangle\ge 0$. The witness works only because separable states are PPT."
- **Reveal cap:** G/F "it rests on $\rho_s^{T_B}\ge 0$"
- **Stage:** question `mx('witnessW', {})`; reveal `mx('rhoSepPT', {spectrum:'bars'})` — a separable example's $\rho_s^{T_B}$, all bars $\ge 0$. needs: matrix-v2.
- **Claims:** `q12SepPtSpec` → (all ≥ 0).

### Unit `q12-locc` — Local moves and a shared coin

**`q12-locc:b1` [B]** (what LOCC is)
- **G:** "Two distant labs, Alice and Bob, share a pair. [[qc-locc|LOCC]] is everything they can do apart, plus a phone line. Each lab may add a fresh qubit, run a gate, measure, or throw a qubit away — and phone the results. They may **not** mail qubits."
- **F:** "[[qc-locc|Local operations and classical communication]] (LOCC): each party may append an ancilla, apply unitaries, make orthogonal measurements, and discard subsystems, coordinating by classical messages (Bergou §3.6.1). Exchanging quantum systems is excluded. LOCC cannot create entanglement from a product state."
- **Cap:** G "LOCC: local gates, local readings, a phone call — no mailing qubits" · F "LOCC: append, unitary, measure, discard, plus classical messages"
- **Stage:** `circ(C_PROC, 0, {})` — the two labs' wires, before anything runs. needs: circuit.
- **Terms:** `qc-locc` (defined here).

**`q12-locc:b2` [B]** (ebits, distillation, dilution)
- **G:** "One Bell pair is the unit of shared entanglement: one **ebit**. From many weakly entangled copies, LOCC can distill fewer near-perfect Bell pairs; and from Bell pairs it can build weaker states. The exchange rate, per copy, is the entanglement of the next unit."
- **F:** "A maximally entangled pair is one **ebit**. Entanglement distillation turns $n$ copies of $|\psi\rangle$ into $m$ near-perfect Bell pairs by LOCC; dilution runs the reverse. For pure states the limiting ratio $m/n$ in both directions is $E(|\psi\rangle) = S(\rho_A)$ (N&C §12.5.2), tying the measure of Unit 12.4 to a physical rate."
- **Cap:** G "one Bell pair = one ebit; weak copies distil to fewer strong ones" · F "ebit; distillation/dilution rate $\to S(\rho_A)$ (N&C)"
- **Stage:** `amp({bell:'00+11'}, {mode:'probability'})` — one ebit, the Bell pair's chances. needs: amplitudes.
- **Terms:** `qc-ebit` (defined here).

**`q12-locc:b3` [B]** (the Procrustean method; D3)
- **G:** "Here is a concrete LOCC move. Alice holds a tilted pair $\cos\theta|00\rangle + \sin\theta|11\rangle$. She adds a blank qubit, runs one gate, and reads it. On a $0$ — chance $0.5$ at $\theta = 30°$ — the pair is now a perfect Bell state. On a $1$, it collapses to $|1\rangle|00\rangle$ and she retries."
- **F:** "Procrustean distillation (Bergou §3.6.2): for $|\psi\rangle = \cos\theta|00\rangle + \sin\theta|11\rangle$ ($0\le\theta\le\tfrac\pi4$) Alice appends $|0\rangle_{A'}$, applies a unitary $U_A$, and measures $A'$. Outcome $0$ (probability $p_s = 2\sin^2\theta = 1 - \cos2\theta$) leaves $\Phi^+$; outcome $1$ leaves $|1\rangle_{A'}|00\rangle_{AB}$ (erratum **B9**). At $\theta = 30°$, $p_s = 0.5$."
- **Cap:** G "add a qubit, one gate, read it: a $0$ (chance $0.5$) gives a Bell pair" · F "$p_s = 2\sin^2\theta = 0.5$ at $\theta = 30°$; success → $\Phi^+$, failure → $|1\rangle_{A'}|00\rangle$"
- **Stage:** `split( circ(C_PROC, 2, {outcomes:'0'}) / amp({circuit:C_PROC, upTo:2, outcomes:'0'}, {mode:'probability'}) )` — the circuit at the measurement, and the success branch's amplitudes. needs: circuit, amplitudes.
- **Claims:** `q12ProcPs30` → 0.5; `q12ProcSuccess` → $\Phi^+$; `q12ProcFail` → $|1\rangle_{A'}|00\rangle$.
- **Fidelity:** `qc-circuit-engine-state`.

**`q12-locc:b4` [C]** (an already-maximal pair)
- **Q G:** "Run the Procrustean step on a pair that is already maximally entangled, $\theta = 45°$. What is the success chance?"
- **Q F:** "Evaluate the Procrustean success probability $p_s = 2\sin^2\theta$ at $\theta = 45°$."
- **Reveal G:** "It is $1$: the step always succeeds, because there is nothing left to distil. A Bell pair is the fixed point."
- **Reveal F:** "$p_s = 2\sin^2 45° = 1$. The protocol keeps the pair with certainty: a maximally entangled state is already distilled, so no copies are thrown away."
- **Reveal cap:** G/F "$\theta = 45°$: $p_s = 1$, always kept"
- **Stage:** question `circ(C_PROC, 1, {})`; reveal `amp({circuit:C_PROC, upTo:2, outcomes:'0'}, {mode:'probability'})` (at θ=45° in the values file). needs: circuit, amplitudes.
- **Claims:** `q12ProcPs45` → 1.

### Unit `q12-entropy` — Entanglement as a number

**`q12-entropy:b1` [B]** (E = S(ρ_A), from Q9)
- **G:** "Chapter Q9 measured a pure pair's entanglement by the [[qc-entanglement-entropy|entropy]] of one half, $E = S(\rho_A)$. For $\cos\theta|00\rangle + \sin\theta|11\rangle$ the reduced state is $\mathrm{diag}(\cos^2\theta, \sin^2\theta)$, so $E = h(\cos^2\theta)$. At $\theta = 30°$ that is $0.811$ bit."
- **F:** "For a pure bipartite state, the entanglement is $E(|\psi\rangle_{AB}) = S(\rho_A) = S(\rho_B)$ (Chapter Q9; Bergou Eq. 3.41). For $|\psi(\theta)\rangle = \cos\theta|00\rangle + \sin\theta|11\rangle$, $\rho_A = \mathrm{diag}(\cos^2\theta, \sin^2\theta)$ and $E = h(\cos^2\theta)$, the binary entropy; at $\theta = 30°$, $E = 0.811$ bit."
- **Cap:** G "$E = S(\rho_A) = 0.811$ bit at $\theta = 30°$" · F "$E = h(\cos^2\theta) = 0.811$ bit, $\theta = 30°$"
- **Stage:** `split( mx(coef(PSI(30)), {svd:true}) / mx('rhoA30', {spectrum:'entropy'}) )` — the coefficient matrix's Schmidt bars, and $\rho_A$'s eigenvalue/entropy readout. needs: matrix-v2.
- **Claims:** `q12SchmidtLam30` → (0.75, 0.25); `q12E30` → 0.811.
- **Terms:** `qc-entanglement-entropy` (Q9, link-back).

**`q12-entropy:b2` [B]** (what makes E a measure: LU invariance; D4)
- **G:** "What makes $E$ a fair measure? First, local turns leave it alone. Rotate Alice's qubit with any one-qubit gate: her reduced state's eigenvalues do not move, so $E$ is unchanged. Entanglement is not something one lab owns."
- **F:** "Good entanglement measures are invariant under local unitaries: for $|\psi'\rangle = (U_A\otimes U_B)|\psi\rangle$, $\rho_A' = U_A\rho_A U_A^\dagger$, so by the cyclic property of the trace $S(\rho_A') = S(\rho_A)$ (Bergou §3.7.1). A local change of basis cannot change how entangled the pair is."
- **Cap:** G "a local gate leaves $E$ unchanged: $0.811$ before and after" · F "$S(U_A\rho_A U_A^\dagger) = S(\rho_A)$: $E$ is local-unitary invariant"
- **Stage:** `split( tq(PSI(30), {readouts:['entropy']}) / tq(PSI(30), {local:[{qubit:0, gate:'H'}], readouts:['entropy']}) )` — the entropy readout before and after a Hadamard on A. needs: two-qubit.
- **Claims:** `q12E30` (reused); `q12E30Local` → 0.811 (after H).
- **Fidelity:** `qc-tq-local-arrows`.

**`q12-entropy:b3` [B]** (additive; can't grow under LOCC)
- **G:** "Two more properties. $E$ is additive: two independent pairs hold the sum. And the average $E$ can never grow under LOCC — local moves and a phone call cannot manufacture entanglement. That is why it is a true resource."
- **F:** "The entanglement is additive, $E(|\psi\rangle\otimes|\psi'\rangle) = E(|\psi\rangle) + E(|\psi'\rangle)$ (Bergou §3.7.1). Its average cannot increase under LOCC, $\sum_k p_k E(|\psi^{(k)}\rangle)\le E(|\psi\rangle)$ (Eq. 3.58); N&C state this as majorization, $|\psi\rangle\to|\varphi\rangle$ by LOCC iff $\lambda_\psi\prec\lambda_\varphi$ (Theorem 12.15, quoted)."
- **Cap:** G "additive; never grows under LOCC — a real resource" · F "additive; $\overline E$ non-increasing under LOCC (Eq. 3.58; N&C majorization)"
- **Stage:** `mx('rhoAprod', {spectrum:'entropy'})` — two independent pairs' reduced state $\rho_A\otimes\rho_{A'}$, its entropy the sum. needs: matrix-v2.
- **Claims:** `q12Eadd` → 1.622 (= 2 × 0.811).

**`q12-entropy:b4` [B]** (mixed states: entanglement of formation)
- **G:** "For a mixed pair, $E = S(\rho_A)$ fails: a classical mixture of products has a mixed $\rho_A$ but no entanglement. The fix is the **entanglement of formation**: the smallest average entanglement over all ways to write $\rho$ as a mixture of pure states."
- **F:** "For mixed $\rho_{AB}$, $S(\rho_A)$ is not a valid measure (a separable $\rho$ can have mixed marginals). The entanglement of formation takes the infimum over pure-state decompositions, $E_F(\rho) = \inf\sum_k p_k E(|\psi^{(k)}\rangle)$ (Bergou Eq. 3.60, erratum **B11** restores $p_k$). It is generally hard to compute — but for two qubits Unit 12.5 gives it in closed form."
- **Cap:** G "mixed pairs: the entanglement of formation, the cheapest recipe" · F "$E_F(\rho) = \inf\sum_k p_k E(|\psi^{(k)}\rangle)$ (Eq. 3.60)"
- **Stage:** `split( tqR(W(0.5), {readouts:['entropy']}) / mx('rhoWA', {spectrum:'entropy'}) )` — the Werner state's reduced state is maximally mixed yet it is entangled; $S(\rho_A)$ is not the answer. needs: matrix-v2, two-qubit.
- **Claims:** `q12WernerSA` → 1 (one bit, yet entangled — the trap).
- **Terms:** `qc-entanglement-of-formation` (defined here).

**`q12-entropy:b5` [C]** (two extremes)
- **Q G:** "What is $E$ for a product state, and for a Bell state?"
- **Q F:** "Evaluate $E = S(\rho_A)$ for a product state and for a Bell state."
- **Reveal G:** "A product state has $E = 0$: its half is pure. A Bell state has $E = 1$ bit: its half is the fully mixed coin. Those are the floor and the ceiling for a qubit pair."
- **Reveal F:** "Product: $\rho_A$ pure, $E = 0$. Bell: $\rho_A = \tfrac12 I$, $E = \log_2 2 = 1$ bit, the maximum for two qubits. Entanglement runs from $0$ to $\log_2 d$."
- **Reveal cap:** G/F "product $E = 0$; Bell $E = 1$ bit"
- **Stage:** question `mx(coef({ket:'00'}), {svd:true})`; reveal `plot('entropyOfTheta', {min:0, max:45}, {marker:45})` — $E(\theta)$ from product ($0°$) to Bell ($45°$). needs: matrix, plot.
- **Claims:** `q12Eprod` → 0; `q12Ebell` → 1.

### Unit `q12-concurrence` — Concurrence: one formula for two qubits

**`q12-concurrence:b1` [B] · notation beat, `introduces: ['qc-concurrence']`** (the tilde state)
- **G:** "For two qubits there is a shortcut. Flip the state: conjugate every amplitude, then apply $\sigma_y$ to each qubit, giving the [[qc-concurrence|tilde state]] $\tilde\psi$. The **concurrence** is how much the state overlaps its own flip, $C = |\langle\psi|\tilde\psi\rangle|$."
- **F:** "Define the spin-flipped state $|\tilde\psi\rangle = (\sigma_y\otimes\sigma_y)|\psi^*\rangle$, the complex conjugate taken in the standard basis (Bergou Eq. 3.65). The [[qc-concurrence|concurrence]] of a pure two-qubit state is $C(|\psi\rangle) = |\langle\psi|\tilde\psi\rangle|$ (Eq. 3.66). A single qubit is orthogonal to its own flip, which is why this measures a two-body property."
- **Cap:** G "flip the state with $\sigma_y\otimes\sigma_y$; $C = |\langle\psi|\tilde\psi\rangle|$" · F "$|\tilde\psi\rangle = (\sigma_y\otimes\sigma_y)|\psi^*\rangle$; $C = |\langle\psi|\tilde\psi\rangle|$"
- **Stage:** `split( mx(pa('YY'), {}) / mx(coef(PSI(30)), {svd:true}) )` — the flip operator $\sigma_y\otimes\sigma_y$, and the state's Schmidt weights (which set $C$). needs: matrix-v2.
- **Claims:** `q12ConcPure30` → 0.866.
- **Terms:** `qc-concurrence` (notation beat).

**`q12-concurrence:b2` [B]** (the pure-state formula; D5)
- **G:** "For a pure pair this comes out beautifully: $C = 2\sqrt{\lambda_1\lambda_2}$, twice the geometric mean of the Schmidt weights. For $\cos\theta|00\rangle + \sin\theta|11\rangle$ that is $\sin2\theta$ — $0.866$ at $\theta = 30°$. It is also $2|\det A|$, with $A$ the state's coefficient matrix."
- **F:** "With Schmidt weights $\lambda_1, \lambda_2$ ($\lambda_1 + \lambda_2 = 1$), $C = 2\sqrt{\lambda_1\lambda_2}$ (Bergou Eq. 3.68): $0$ for a product, $1$ when $\lambda_1 = \lambda_2 = \tfrac12$. For $|\psi(\theta)\rangle$ this is $\sin2\theta = 0.866$ at $\theta = 30°$. Equivalently $C = 2|\det A|$ with $A_{jk}$ the coefficient matrix (⚑ P3.6, cited)."
- **Cap:** G "$C = 2\sqrt{\lambda_1\lambda_2} = \sin2\theta = 0.866$ here" · F "$C = 2\sqrt{\lambda_1\lambda_2} = \sin2\theta = 2|\det A| = 0.866$"
- **Stage:** `split( mx(coef(PSI(30)), {svd:true}) / tq(PSI(30), {readouts:['concurrence']}) )` — the Schmidt bars and the concurrence readout. needs: matrix-v2, two-qubit (concurrence readout, E2).
- **Claims:** `q12SchmidtLam30` (reused); `q12ConcPure30` → 0.866; `q12TwoDetA` → 0.866.
- **Fidelity:** `qc-tq-grid-signed`.

**`q12-concurrence:b3` [B]** (turning C into E)
- **G:** "Concurrence and entropy carry the same information. A fixed, increasing function turns one into the other: $E = h\!\big((1 + \sqrt{1 - C^2})/2\big)$. At $C = 0.866$ it returns $0.811$ bit — exactly the entanglement entropy of Unit 12.1 of this unit's pair."
- **F:** "The entanglement is a monotone function of $C$: $E(C) = h\!\big(\tfrac{1 + \sqrt{1 - C^2}}2\big)$ with $h$ the binary entropy (Bergou Eqs. 3.69–3.71). At $C = 0.866$, $E(C) = 0.811$ bit, matching $S(\rho_A)$ from Unit 12.4 — concurrence and entropy are two faces of one quantity for pure states."
- **Cap:** G "$E(C) = 0.811$ bit at $C = 0.866$: same as the entropy" · F "$E(C) = h\!\big(\tfrac{1+\sqrt{1-C^2}}2\big) = 0.811$ bit"
- **Stage:** `plot('eofOfC', {min:0, max:1}, {marker:0.866})` — the curve $E(C)$ with the running state marked. needs: plot.
- **Claims:** `q12EofC30` → 0.811.
- **Fidelity:** `qc-plot-engine-curve`.

**`q12-concurrence:b4` [B]** (mixed states: Wootters and negativity)
- **G:** "For a mixed two-qubit state there is still a formula. Wootters: list the square-root eigenvalues of $\rho\tilde\rho$ in order, then $C = \max(0,\ \lambda_1 - \lambda_2 - \lambda_3 - \lambda_4)$. For the Werner state this gives $0.25$ at $w = \tfrac12$ — matching the PPT verdict."
- **F:** "For mixed $\rho$, let $\lambda_1\ge\dots\ge\lambda_4$ be the square roots of the eigenvalues of $\rho\tilde\rho$, $\tilde\rho = (\sigma_y\otimes\sigma_y)\rho^*(\sigma_y\otimes\sigma_y)$. Then $C(\rho) = \max(0, \lambda_1 - \lambda_2 - \lambda_3 - \lambda_4)$ (Eq. 3.76). The negativity $N(\rho) = \sum_j|\lambda_j^-|$ sums the negative eigenvalues of $\rho^{T_B}$ (Eqs. 3.77–3.79). For the Werner state $C = (3w-1)/2 = 0.25$ at $w = \tfrac12$."
- **Cap:** G "Wootters: $C = \max(0, \lambda_1 - \lambda_2 - \lambda_3 - \lambda_4) = 0.25$ for Werner" · F "$C(\rho) = \max(0,\lambda_1-\lambda_2-\lambda_3-\lambda_4) = 0.25$; negativity sums $|\lambda_j^-|$"
- **Stage:** `split( tqR(W(0.5), {readouts:['concurrence']}) / mx(W(0.5), {ptranspose:'B', spectrum:'bars'}) )` — concurrence readout beside the negativity (the negative PPT bar). needs: matrix-v2, two-qubit (concurrence, E2).
- **Claims:** `q12WerConc` → (0, 0.25, 1); `q12WerPpt` (reused, the negativity).
- **Fidelity:** `qc-tq-not-two-places`.

**`q12-concurrence:b5` [C]** (Werner at the boundary)
- **Q G:** "The Werner state is entangled for $w > \tfrac13$. What is its concurrence right at $w = \tfrac13$?"
- **Q F:** "Evaluate the Werner concurrence $C = \max(0, (3w-1)/2)$ at $w = \tfrac13$."
- **Reveal G:** "Zero. At $w = \tfrac13$ the state sits exactly on the edge between separable and entangled, so there is no entanglement to measure. Above it, $C$ climbs."
- **Reveal F:** "$C = \max(0, 0) = 0$: the concurrence vanishes at the separability threshold $w = \tfrac13$, the same point where $\lambda_{\min}(\rho^{T_B})$ changes sign. The two criteria agree exactly."
- **Reveal cap:** G/F "$w = \tfrac13$: $C = 0$, the boundary"
- **Stage:** question `tqR(W('1/3'), {grid:'T'})`; reveal `plot('wernerConcurrence', {min:0, max:1}, {marker:0.333})` — $C(w)$ with the threshold marked. needs: plot, two-qubit.
- **Claims:** `q12WerConc` (reused; 0 at ⅓).

### Unit `q12-multipartite` — Three qubits: GHZ, W and monogamy

**`q12-multipartite:b1` [B]** (three-qubit classes)
- **G:** "With three qubits, entanglement comes in kinds. A state can be a full product, or split as one qubit times an entangled pair, or **genuinely three-way**. Chapter Q7's $|\mathrm{GHZ}\rangle$ and the $|W\rangle = (|100\rangle + |010\rangle + |001\rangle)/\sqrt3$ are both genuinely three-way, but differ."
- **F:** "A pure three-qubit state is fully separable, biseparable (one qubit times a possibly-entangled pair across some cut), or genuinely tripartite entangled (Bergou §3.9). Two genuinely-tripartite examples are $|\mathrm{GHZ}\rangle = (|000\rangle + |111\rangle)/\sqrt2$ (Chapter Q7) and $|W\rangle = (|100\rangle + |010\rangle + |001\rangle)/\sqrt3$."
- **Cap:** G "three qubits: product, one-plus-pair, or genuinely three-way — GHZ and W" · F "fully separable / biseparable / genuinely tripartite; GHZ and W"
- **Stage:** `split( amp({bell:'000+111'}, {mode:'probability'}) / amp('wState3', {mode:'probability'}) )` — GHZ's two bars against W's three. needs: amplitudes.
- **Terms:** `qc-ghz` (Q7, link-back), `qc-w-state` (defined here).

**`q12-multipartite:b2` [B]** (what one lost qubit leaves)
- **G:** "Trace out the third qubit and look at the remaining pair. For GHZ the pair is a **separable** coin mixture — no entanglement, concurrence $0$. For W the pair keeps concurrence $\tfrac23$. GHZ's entanglement is all three-way; W's is shared pairwise."
- **F:** "The two-qubit reduced state tells them apart. $\mathrm{Tr}_C|\mathrm{GHZ}\rangle\langle\mathrm{GHZ}| = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$ is separable, concurrence $0$ (Chapter Q8's box). $\mathrm{Tr}_C|W\rangle\langle W| = \tfrac13[(|01\rangle + |10\rangle)(\langle01| + \langle10|) + |00\rangle\langle00|]$ has concurrence $C_{AB} = \tfrac23$ (Eq. 3.85)."
- **Cap:** G "lose qubit 3: GHZ pair $C = 0$, W pair $C = 0.667$" · F "GHZ reduced pair separable ($C = 0$); W reduced pair $C_{AB} = \tfrac23$"
- **Stage:** `split( tqReduce({bell:'000+111'}, [0,1], {grid:'T', readouts:['concurrence']}) / tqReduce('wState3', [0,1], {grid:'T', readouts:['concurrence']}) )`. needs: two-qubit (reduce + concurrence, E2).
- **Claims:** `q12GhzPairConc` → 0; `q12GhzPairSpec` → (0, 0, 0.5, 0.5); `q12WpairConc` → 0.667.
- **Fidelity:** `qc-tq-not-two-places`.

**`q12-multipartite:b3` [B]** (monogamy and CKW; D6)
- **G:** "Entanglement is **monogamous**: if $A$ is strongly entangled with $B$, it can be only weakly entangled with $C$. The Coffman–Kundu–Wootters bound makes it exact: $C_{A:B}^2 + C_{A:C}^2 \le C_{A:BC}^2$. The W state saturates it — both sides equal $\tfrac89$."
- **F:** "Monogamy is the CKW inequality $C_{A:B}^2 + C_{A:C}^2\le C_{A:BC}^2$ (Bergou Eq. 3.84), where $C_{A:BC}$ treats $BC$ as one effective qubit. For $|W\rangle$: $C_{A:B} = C_{A:C} = \tfrac23$ and $C_{A:BC} = \tfrac{2\sqrt2}3$, so both sides are $\tfrac89$ — the W state meets the bound with equality (erratum **B12** fixes $|v_1\rangle$)."
- **Cap:** G "monogamy: $C_{AB}^2 + C_{AC}^2 \le C_{A:BC}^2$; W gives $0.889 = 0.889$" · F "CKW: $\tfrac89 = \tfrac89$ for W ($C_{A:B} = C_{A:C} = \tfrac23$, $C_{A:BC} = \tfrac{2\sqrt2}3$)"
- **Stage:** `split( tqReduce('wState3', [0,1], {readouts:['concurrence']}) / tqReduce('wState3', [0,2], {readouts:['concurrence']}) )` — the two pairs $A{:}B$ and $A{:}C$, each $\tfrac23$. needs: two-qubit (reduce + concurrence, E2).
- **Claims:** `q12WpairConc` → 0.667; `q12WacConc` → 0.667; `q12CAbc` → 0.943; `q12CkwLeft` → 0.889; `q12CkwRight` → 0.889.
- **Fidelity:** `qc-tq-local-arrows`.

**`q12-multipartite:b4` [C]** (W into GHZ?)
- **Q G:** "Can local moves (with a shared coin, and allowed to fail) ever turn a W state into a GHZ state?"
- **Q F:** "Are $|W\rangle$ and $|\mathrm{GHZ}\rangle$ interconvertible by stochastic LOCC (SLOCC)?"
- **Reveal G:** "No. They are different families. No local operations, even allowed to succeed only sometimes, can convert one into the other. Their three-way entanglement has different shapes."
- **Reveal F:** "No: GHZ-class and W-class are the two inequivalent SLOCC classes of genuinely tripartite states (Bergou §3.9). $|\psi\rangle\to|\varphi\rangle$ by SLOCC iff $|\varphi\rangle = A\otimes B\otimes C|\psi\rangle$ with invertible local operators, which cannot map one class to the other."
- **Reveal cap:** G/F "no: GHZ-class and W-class are distinct under SLOCC"
- **Stage:** question `amp('wState3', {mode:'probability'})`; reveal `split( amp({bell:'000+111'}, {mode:'probability'}) / amp('wState3', {mode:'probability'}) )`. needs: amplitudes.
- **Terms:** `qc-sloc` (SLOCC; defined here).

### 1.7 Claim ledger (engine call → value; numpy route)
All values verified twice (engine route `q1213plan-engine.ts`, numpy twin `q1213plan-numpy.py`; agree to 6 decimals).
Entropies are in **bits**. "E2" marks a call that `Q12.values.ts` makes through the not-yet-built `entangle` module
(§9.1); its value is the one computed here from merged E1 primitives.

| Key | Engine call (`Q12.values.ts`) | Value | numpy route |
|---|---|---|---|
| `q12BergRho05`, `q12BergRhoPT05` | `mixtureN(PB(0.5))`; `ptranspose(·, [1])` | [[½,0,0,0],[0,¼,−¼,0],[0,−¼,¼,0],[0,0,0,0]]; its flip | explicit matrix; axis swap |
| `q12BergPptSpec05` | `spectrum(ptranspose(PB(0.5),[1]))` | (−0.1036, 0.25, 0.25, 0.6036) | `eigvalsh` of the reshaped flip |
| `q12BergLamMin` | `isPPT`/`negativity` route: min eig of `ptranspose(PB(p),[1])` at p∈{0.2,0.5,0.7071,1} | (−0.0123, −0.1036, −0.2362, −0.5) | formula $\tfrac12[(1-p)-\sqrt{(1-p)^2+p^2}]$ |
| `q12ChshThresh` | constant $1/\sqrt2$ | 0.7071 | `1/np.sqrt(2)` |
| `q12WerPpt` | min eig of `ptranspose(W(w),[1])` at w∈{⅓,½,1} | (0, −0.125, −0.5) | `eigvalsh`; $(1-3w)/4$ |
| `q12WitnessLamMin`, `q12WitnessVal` | `witnessFromPPT(PB(0.5))` → {W, λ₋}; `traceN(matmul(PB(0.5), W))` | −0.1036; −0.1036 | `eigh` eigenvector; `Tr(ρ (|η⟩⟨η|)^{T_B})` |
| `q12SepPtSpec` | `spectrum(ptranspose(ρ_sep, [1]))` | (all ≥ 0) | `eigvalsh` |
| `q12ProcPs30`, `q12ProcPs45` | `procrustean(30°)`/`(45°)` → {ps, success, fail} | 0.5; 1 | $2\sin^2\theta$ |
| `q12ProcSuccess`, `q12ProcFail` | `procrustean(30°)` branches | $\Phi^+$; $|1\rangle_{A'}|00\rangle$ | explicit vectors |
| `q12SchmidtLam30` | `schmidt(PSI(30),[0]).weights` | (0.75, 0.25) | SVD of the reshaped ket |
| `q12E30`, `q12E30Local` | `entanglementEntropy(PSI(30),[0])`; after `H` on A | 0.811; 0.811 | $h(\cos^2 30°)$; invariance |
| `q12Eadd` | `vonNeumann(kron(rhoA30, rhoA30))` | 1.622 | $2S(\rho_A)$ |
| `q12WernerSA` | `vonNeumann(reducedDensity route on W(0.5))` | 1 | `eigvalsh`; one bit |
| `q12Eprod`, `q12Ebell` | `entanglementEntropy` of product / Bell | 0; 1 | $S(\rho_A)$ |
| `q12ConcPure30`, `q12TwoDetA` | `concurrencePure(PSI(30))`; `2*abs(detN(coefMatrix))` (E2) | 0.866; 0.866 | Wootters; $2|\det A|$ |
| `q12EofC30` | `eofFromC(0.866)` (E2) | 0.811 | $h((1+\sqrt{1-C^2})/2)$ |
| `q12WerConc` | `concurrence(W(w))` (Wootters, E2) at w∈{⅓,½,1} | (0, 0.25, 1) | $\max(0,(3w-1)/2)$ |
| `q12GhzPairConc`, `q12GhzPairSpec` | `concurrence(reducedDensity(ghz(3),[0,1]))`; `spectrum` | 0; (0,0,0.5,0.5) | Wootters; `eigvalsh` |
| `q12WpairConc`, `q12WacConc` | `concurrence(reducedDensity(wState(3),[0,1]))`; `…,[0,2]` | 0.667; 0.667 | Wootters of the W reductions |
| `q12CAbc`, `q12CkwLeft`, `q12CkwRight` | `ckw(wState(3))` → {CAB, CAC, CAbc, lhs, rhs} (E2) | 0.943; 0.889; 0.889 | $2\sqrt{\lambda_1\lambda_2}$; $(\tfrac23)^2{+}(\tfrac23)^2$; $(\tfrac{2\sqrt2}3)^2$ |

## 2. Derivations
Each step is `tex` — `why` — **view** (the exact `StageState`, shorthand above) — *viewCaption*. A step without a view
inherits the previous one in its own list. Every list has ≥ 2 distinct views, every view uses a kind its unit's beats
show, and the last `tex` of each list ends on the result. Ground steps ≥ Formal steps in every pair.

**D1 · `q12-ppt:b3` · result `\lambda_{\min}(\rho^{T_B}) < 0 \text{ for all } p > 0 \Rightarrow \text{entangled}`** (Bergou Eqs. 3.22–3.26)
- Ground (4 views):
  1. `\rho(p) = p|\Psi^-\rangle\langle\Psi^-| + (1-p)|00\rangle\langle00|` — The running state, in blocks by Bob's bit. **view** `mx(PB(0.5), {blocks:2})` · *$\rho$ in $2\times2$ blocks*
  2. `(\rho^{T_B})_{m\mu,n\nu} = \rho_{m\nu,n\mu}` — Transpose inside each block; four off-diagonal cells swap. **view** `mx(PB(0.5), {blocks:2, ptranspose:'B'})` · *$\rho^{T_B}$: the moved cells dashed*
  3. `\lambda(\rho^{T_B}) = \big\{\tfrac p2, \tfrac p2, \tfrac12[(1-p)\pm\sqrt{(1-p)^2+p^2}]\big\}` — Its eigenvalues; the last one dips below zero. **view** `mx(PB({from:0, to:1}), {ptranspose:'B', spectrum:'bars'})` · *a bar turns negative as $p$ grows*
  4. `\lambda_{\min}(\rho^{T_B}) = \tfrac12[(1-p) - \sqrt{(1-p)^2+p^2}] < 0\ (p>0)` — Negative for every $p$ above $0$. **view** `plot('pptLambdaMin', {min:0, max:1})` · *$\lambda_{\min}(p)$: below the axis throughout*
  5. `\lambda_{\min}(\rho^{T_B}) < 0 \text{ for all } p > 0 \Rightarrow \text{entangled}` — A separable $\rho$ would stay $\ge 0$, so this state is entangled.
- Formal (2 views):
  1. `\rho \text{ separable} \Rightarrow \rho^{T_B} = \sum_k p_k\,\rho_{A,k}\otimes\rho_{B,k}^T \ge 0` — A transposed state is still a state (Bergou Eq. 3.22). **view** `mx(PB(0.5), {blocks:2, ptranspose:'B'})`
  2. `\lambda_{\min}(\rho^{T_B}) = \tfrac12[(1-p)-\sqrt{(1-p)^2+p^2}] < 0 \Rightarrow \text{entangled}` — Eq. 3.26; the Peres criterion. **view** `plot('pptLambdaMin', {min:0, max:1})`
- Check: `q12BergRho05`, `q12BergPptSpec05`, `q12BergLamMin`. Needs: matrix-v2, plot.

**D2 · `q12-witness:b2` · result `\mathrm{Tr}(\rho W) = \lambda_- < 0,\quad \mathrm{Tr}(\rho_s W) \ge 0`** (Bergou Eqs. 3.27–3.28)
- Ground (3 views):
  1. `\rho^{T_B}|\eta\rangle = \lambda_-|\eta\rangle,\quad \lambda_- < 0` — Take the eigenvector of the negative eigenvalue. **view** `mx(PB(0.5), {ptranspose:'B', spectrum:'bars', highlight:[[0,0]]})` · *the negative bar and its $|\eta\rangle$*
  2. `W = (|\eta\rangle\langle\eta|)^{T_B}` — Flip the projector onto $|\eta\rangle$: that is the witness. **view** `mx('witnessW', {})` · *the witness $W$*
  3. `\mathrm{Tr}(\rho W) = \mathrm{Tr}(\rho^{T_B}|\eta\rangle\langle\eta|) = \lambda_- < 0` — Its average on $\rho$ is the negative eigenvalue. **view** `mx(prod('rhoPB', 'witnessW'), {trace:true})` · *$\mathrm{Tr}(\rho W) = -0.104$*
  4. `\mathrm{Tr}(\rho W) = \lambda_- < 0,\quad \mathrm{Tr}(\rho_s W) \ge 0` — Negative here, non-negative on every separable state: a witness.
- Formal (2 views):
  1. `\mathrm{Tr}(X^{T_B}Y) = \mathrm{Tr}(X\,Y^{T_B}) \Rightarrow \mathrm{Tr}(\rho W) = \lambda_-` — The transpose-swap identity with $W = (|\eta\rangle\langle\eta|)^{T_B}$ (Eq. 3.27). **view** `mx('witnessW', {})`
  2. `\mathrm{Tr}(\rho_s W) = \langle\eta|\rho_s^{T_B}|\eta\rangle \ge 0` — Separable states are PPT (Eq. 3.28). **view** `mx(prod('rhoPB', 'witnessW'), {trace:true})`
- Check: `q12WitnessLamMin`, `q12WitnessVal`. Needs: matrix-v2.

**D3 · `q12-locc:b3` · result `p_s = 2\sin^2\theta,\ \text{success} \to \Phi^+,\ \text{failure} \to |1\rangle_{A'}|00\rangle`** (Bergou §3.6.2; erratum B9)
- Ground (4 views):
  1. `|\psi\rangle_{AB}\otimes|0\rangle_{A'} = \cos\theta|00\rangle|0\rangle + \sin\theta|11\rangle|0\rangle` — Alice adds a blank qubit. **view** `amp({circuit:C_PROC, upTo:1}, {mode:'probability'})` · *before $U_A$: two bars*
  2. `U_A|00\rangle_{AA'} = \tan\theta|00\rangle + \sqrt{1 - \tan^2\theta}\,|01\rangle,\quad U_A|10\rangle = |10\rangle` — One local gate, acting only when Alice's bit is $0$. **view** `circ(C_PROC, 2, {})` · *$U_A$ applied*
  3. `= \sqrt2\sin\theta\,|0\rangle_{A'}\,\Phi^+ + \sqrt{1-2\sin^2\theta}\,|1\rangle_{A'}|00\rangle_{AB}` — Regroup: the $A'$ bit now tags success from failure. **view** `amp({circuit:C_PROC, upTo:2}, {mode:'probability'})` · *two branches, tagged by $A'$*
  4. `p(0) = 2\sin^2\theta = 0.5,\quad \text{leaves } \Phi^+` — Read $A'$: a $0$ (chance $0.5$ at $\theta = 30°$) leaves a Bell pair. **view** `amp({circuit:C_PROC, upTo:2, outcomes:'0'}, {mode:'probability'})` · *the success branch: $\Phi^+$*
  5. `p_s = 2\sin^2\theta,\ \text{success} \to \Phi^+,\ \text{failure} \to |1\rangle_{A'}|00\rangle` — Succeed with chance $2\sin^2\theta$; otherwise retry.
- Formal (2 views):
  1. `(U_A\otimes I)(|\psi\rangle_{AB}|0\rangle_{A'}) = \sqrt2\sin\theta|0\rangle_{A'}\Phi^+ + \sqrt{1-2\sin^2\theta}|1\rangle_{A'}|00\rangle` — The protocol's single step. **view** `circ(C_PROC, 2, {})`
  2. `p_s = 2\sin^2\theta = 1 - \cos2\theta = 0.5\ (\theta = 30°)` — Outcome $0$ keeps $\Phi^+$; outcome $1$ leaves $|1\rangle_{A'}|00\rangle$ (erratum B9). **view** `amp({circuit:C_PROC, upTo:2, outcomes:'0'}, {mode:'probability'})`
- Check: `q12ProcPs30`, `q12ProcSuccess`, `q12ProcFail`. Needs: circuit, amplitudes.

**D4 · `q12-entropy:b2` · result `S(U_A\rho_A U_A^\dagger) = S(\rho_A)`** (Bergou §3.7.1)
- Ground (3 views):
  1. `E = S(\rho_A),\quad \rho_A = \mathrm{diag}(\cos^2\theta, \sin^2\theta)` — The entanglement is the entropy of one half. **view** `mx('rhoA30', {spectrum:'entropy'})` · *$\rho_A$: $S = 0.811$ bit*
  2. `|\psi'\rangle = (U_A\otimes I)|\psi\rangle \Rightarrow \rho_A' = U_A\rho_A U_A^\dagger` — Turn Alice's qubit with any one-qubit gate. **view** `tq(PSI(30), {local:[{qubit:0, gate:'H'}], readouts:['entropy']})` · *after $H$ on A: same $S$*
  3. `S(U_A\rho_A U_A^\dagger) = S(\rho_A)` — Conjugation leaves the eigenvalues, hence $S$, unchanged. **view** `mx('rhoA30', {spectrum:'entropy'})` · *same bars: $0.811$ bit*
- Formal (2 views):
  1. `\rho_A' = U_A\rho_A U_A^\dagger,\quad S(\rho) = -\mathrm{Tr}(\rho\log_2\rho)` — A local unitary conjugates the reduced state. **view** `tq(PSI(30), {local:[{qubit:0, gate:'H'}], readouts:['entropy']})`
  2. `S(\rho_A') = S(\rho_A)` — The spectrum is conjugation-invariant (cyclic trace); $E$ is a local-unitary invariant. **view** `mx('rhoA30', {spectrum:'entropy'})`
- Check: `q12E30`, `q12E30Local`. Needs: matrix-v2, two-qubit.

**D5 · `q12-concurrence:b2` · result `C = 2\sqrt{\lambda_1\lambda_2} = \sin2\theta = 2|\det A|`** (Bergou Eqs. 3.65–3.68; ⚑ P3.6)
- Ground (4 views):
  1. `|\tilde\psi\rangle = (\sigma_y\otimes\sigma_y)|\psi^*\rangle` — The spin-flipped state. **view** `mx(pa('YY'), {})` · *the flip operator $\sigma_y\otimes\sigma_y$*
  2. `C = |\langle\psi|\tilde\psi\rangle| = 2\sqrt{\lambda_1\lambda_2}` — The overlap with the flip is twice the geometric mean of the Schmidt weights. **view** `mx(coef(PSI(30)), {svd:true})` · *Schmidt bars $0.75,\ 0.25$*
  3. `= \sin2\theta = 0.866\ (\theta = 30°)` — For our tilted pair. **view** `tq(PSI(30), {readouts:['concurrence']})` · *concurrence $0.866$*
  4. `C = 2\sqrt{\lambda_1\lambda_2} = \sin2\theta = 2|\det A|` — And equals twice the determinant of the coefficient matrix. **view** `mx(coef(PSI(30)), {highlight:[[0,0],[1,1]]})` · *$2|\det A| = 0.866$*
- Formal (2 views):
  1. `C = |\langle\psi|\tilde\psi\rangle| = 2\sqrt{\lambda_1\lambda_2}` — From the Schmidt form (Eq. 3.68). **view** `mx(coef(PSI(30)), {svd:true})`
  2. `C = \sin2\theta = 2|\det A| = 0.866` — Equivalent to $2|\det A|$, $A_{jk}$ the coefficient matrix (⚑ P3.6, cited). **view** `tq(PSI(30), {readouts:['concurrence']})`
- Check: `q12SchmidtLam30`, `q12ConcPure30`, `q12TwoDetA`. Needs: matrix-v2, two-qubit (concurrence, E2).

**D6 · `q12-multipartite:b3` · result `C_{A:B}^2 + C_{A:C}^2 = C_{A:BC}^2 = \tfrac89` (W state)`** (Bergou Eqs. 3.84–3.86)
- Ground (4 views):
  1. `\rho_{AB} = \tfrac13[(|01\rangle + |10\rangle)(\langle01| + \langle10|) + |00\rangle\langle00|],\ C_{A:B} = \tfrac23` — Trace out $C$. **view** `tqReduce('wState3', [0,1], {readouts:['concurrence']})` · *$A{:}B$: $C = 0.667$*
  2. `C_{A:C} = \tfrac23` — By symmetry, tracing out $B$ gives the same. **view** `tqReduce('wState3', [0,2], {readouts:['concurrence']})` · *$A{:}C$: $C = 0.667$*
  3. `C_{A:BC} = 2\sqrt{\lambda_1\lambda_2} = \tfrac{2\sqrt2}3,\ \lambda = (\tfrac23, \tfrac13)` — Treat $BC$ as one qubit; use $A$'s Schmidt weights. **view** `amp('wState3', {mode:'probability'})` · *$|W\rangle$: $A$ against $BC$*
  4. `C_{A:B}^2 + C_{A:C}^2 = \tfrac89 = C_{A:BC}^2` — Both sides are $\tfrac89$: W meets the monogamy bound exactly.
- Formal (2 views):
  1. `C_{A:B} = C_{A:C} = \tfrac23,\quad C_{A:BC} = \tfrac{2\sqrt2}3` — The three pairwise and bipartite concurrences (Eqs. 3.85–3.86). **view** `tqReduce('wState3', [0,1], {readouts:['concurrence']})`
  2. `C_{A:B}^2 + C_{A:C}^2 = \tfrac89 = C_{A:BC}^2` — The CKW inequality (Eq. 3.84) is an equality for W. **view** `tqReduce('wState3', [0,2], {readouts:['concurrence']})`
- Check: `q12WpairConc`, `q12WacConc`, `q12CAbc`, `q12CkwLeft`, `q12CkwRight`. Needs: two-qubit (reduce + concurrence, E2), amplitudes.

**View counts** (distinct views, Ground / Formal): D1 4/2 · D2 3/2 · D3 4/2 · D4 3/2 · D5 4/2 · D6 4/2. Ground steps ≥
Formal steps in every pair. Every view's kind is on its unit's stage. All six need `matrix` v2 or `two-qubit` or
`plot`; `plot` is tagged throughout (§9.2) and the `concurrence`/`chsh` readouts need E2 (§9.1).

## 3. Try-it widget per unit
No widget draws entanglement yet (§9.3 W12, deferred). Each unit uses an existing 709 widget (Q3's `bloch` and
`operator-builder`, Q5's `phase-dial`) with a prop form already used, plus a stage sweep for the real exploration.

| Unit | Widget spec | Why this one |
|---|---|---|
| `q12-ppt` | `{kind:'operator-builder', props:{axis:'z'}}` | Building a $2\times2$ operator and reading its eigenvalues is the move behind $\lambda_{\min}(\rho^{T_B})$: a negative one is the flag. |
| `q12-witness` | `{kind:'operator-builder', props:{axis:'x'}}` | A witness is a built Hermitian observable; its average on a state is a trace, as the builder shows. |
| `q12-locc` | `{kind:'phase-dial', props:{theta:30, rotations:false}}` | The tilt $\theta$ of the pair sets the Procrustean success chance $2\sin^2\theta$. |
| `q12-entropy` | `{kind:'bloch', props:{theta:60, phi:0, editable:true, landmarks:true}}` | The reduced state's arrow: the shorter it is, the more mixed the half, the more entangled the pair. |
| `q12-concurrence` | `{kind:'phase-dial', props:{theta:30, rotations:false}}` | Turning $\theta$ sweeps $C = \sin2\theta$ from $0$ (product) to $1$ (Bell). |
| `q12-multipartite` | `{kind:'bloch', props:{theta:90, phi:0, editable:false, landmarks:true}}` | Each qubit of GHZ or W, alone, is the maximally mixed centre — the single-qubit view hides the three-way story. |

**Try this:**
- `q12-ppt`: (1) Build $\tfrac12 I + \tfrac1{\sqrt2}\sigma_x$: one eigenvalue is negative — not a state.
- `q12-witness`: (1) Build $\sigma_z$; its average on $|0\rangle$ is $+1$, on $|1\rangle$ is $-1$: a sign reads a property.
- `q12-locc`: (1) Set $\theta = 45°$: the pair is already maximal, nothing to distil.
- `q12-entropy`: (1) Drag the arrow to the centre: a Bell pair's half, one bit of entanglement.
- `q12-concurrence`: (1) Dial $\theta$ from $0°$ to $45°$: $C$ climbs from $0$ to $1$.
- `q12-multipartite`: (1) Note every single qubit sits at the centre for both GHZ and W.

## 4. Challenges per unit
Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** no sheet assigns any Q12 item; the
Bergou ⚑ problems P3.4–P3.8 are used only as cited derivations, not graded (§12 Q1). Every challenge below is built on
the chapter's running families, so all carry full walkthroughs.

### `q12-ppt`
1. **warm-up · numeric · `q12-pp-min`** — "For the running state at $p = 0.5$, what is the smallest eigenvalue of $\rho^{T_B}$?"
   - Answer: **−0.1036** = `q12BergLamMin[1]`. Hints: (1) Flip Bob's index, then take eigenvalues. (2) Three are positive. (3) $\tfrac12[(1-p) - \sqrt{(1-p)^2 + p^2}]$. Walkthrough: at $p = 0.5$, $\tfrac12[0.5 - \sqrt{0.5}] = -0.1036 < 0$, so the state is entangled.
2. **core · choice · `q12-pp-werner`** — "For which $w$ is the Werner state $w|\Psi^-\rangle\langle\Psi^-| + (1-w)\tfrac14 I$ entangled?"
   - Options: **$w > \tfrac13$** ✓ · $w > \tfrac12$ · $w > \tfrac1{\sqrt2}$ · all $w > 0$. Check: `q12WerPpt` is $0$ at $w = \tfrac13$, negative above. Hints: (1) Find $\lambda_{\min}(\rho^{T_B})$. (2) It is $(1 - 3w)/4$. (3) Negative when $w > \tfrac13$. Walkthrough: $(1-3w)/4 < 0 \iff w > \tfrac13$; PPT is exact for two qubits, so that is the entanglement threshold.
3. **core · choice · `q12-pp-vs-chsh`** — "At $p = 0.5$ the running state breaks no CHSH bound. Is it entangled?"
   - Options: **Yes — its partial transpose is negative** ✓ · No — CHSH is the final word · Only if $p > \tfrac1{\sqrt2}$ · Cannot tell. Check: `q12BergLamMin[1]` $< 0$; `q12ChshThresh` $= 0.707$. Hints: (1) CHSH is only sufficient. (2) PPT is sharper. (3) $\lambda_{\min} < 0$ already at $p = 0.5$. Walkthrough: PPT detects entanglement for all $p > 0$, well below the CHSH threshold $0.707$.
4. **stretch · numeric · `q12-pp-sum`** — "The eigenvalues of $\rho^{T_B}$ at $p = 0.5$ are $-0.1036, 0.25, 0.25, 0.6036$. What do they sum to?"
   - Answer: **1** (tolerance 0.01). Hints: (1) The partial transpose does not change the trace. (2) $\mathrm{Tr}\,\rho = 1$. (3) Add the four. Walkthrough: $-0.1036 + 0.25 + 0.25 + 0.6036 = 1$; the flip moves eigenvalues around but keeps the trace.

### `q12-witness`
1. **warm-up · numeric · `q12-wi-val`** — "For the witness built from $\rho^{T_B}$'s negative eigenvector, what is $\mathrm{Tr}(\rho W)$ at $p = 0.5$?"
   - Answer: **−0.1036** = `q12WitnessVal`. Hints: (1) It equals the negative eigenvalue. (2) $\mathrm{Tr}(\rho W) = \mathrm{Tr}(\rho^{T_B}|\eta\rangle\langle\eta|)$. (3) $= \lambda_-$. Walkthrough: by the transpose-swap identity $\mathrm{Tr}(\rho W) = \lambda_- = -0.1036$.
2. **core · choice · `q12-wi-why`** — "Why is $\mathrm{Tr}(\rho_s W) \ge 0$ for every separable $\rho_s$?"
   - Options: **Because $\rho_s^{T_B} \ge 0$** ✓ · Because $W \ge 0$ · Because $\rho_s$ is pure · Because $\mathrm{Tr}\,\rho_s = 1$. Check: `q12SepPtSpec` all $\ge 0$. Hints: (1) Move the flip onto $\rho_s$. (2) Separable states are PPT. (3) $\langle\eta|\rho_s^{T_B}|\eta\rangle \ge 0$. Walkthrough: $\mathrm{Tr}(\rho_s W) = \langle\eta|\rho_s^{T_B}|\eta\rangle \ge 0$ because $\rho_s^{T_B} \ge 0$; $W$ itself is not positive.

### `q12-locc`
1. **warm-up · numeric · `q12-lo-ps`** — "Procrustean distillation on $\cos30°|00\rangle + \sin30°|11\rangle$: what is the success chance?"
   - Answer: **0.5** = `q12ProcPs30`. Hints: (1) $p_s = 2\sin^2\theta$. (2) $\sin30° = \tfrac12$. (3) $2 \times \tfrac14$. Walkthrough: $2\sin^2 30° = 0.5$; a $0$ on the ancilla leaves a Bell pair.
2. **core · numeric · `q12-lo-max`** — "Run the same step on an already-maximal pair, $\theta = 45°$. What is the success chance?"
   - Answer: **1** = `q12ProcPs45`. Hints: (1) $p_s = 2\sin^2\theta$. (2) $\sin45° = 1/\sqrt2$. (3) $2 \times \tfrac12$. Walkthrough: $2\sin^2 45° = 1$; a maximal pair is already distilled, so nothing is discarded.
3. **core · choice · `q12-lo-moves`** — "Which of these is **not** an LOCC move?"
   - Options: **Mailing qubit $A$ to Bob** ✓ · Appending a fresh qubit · Measuring locally · Phoning the result. Check: LOCC excludes quantum exchange. Hints: (1) "Local" means each lab alone. (2) The phone carries classical bits only. (3) No qubits travel. Walkthrough: LOCC allows local gates, measurements, ancillas and classical messages, but never sending a qubit.

### `q12-entropy`
1. **warm-up · numeric · `q12-en-pure`** — "What is the entanglement $E = S(\rho_A)$ of $\cos30°|00\rangle + \sin30°|11\rangle$, in bits?"
   - Answer: **0.811** = `q12E30`. Hints: (1) $\rho_A = \mathrm{diag}(\cos^2 30°, \sin^2 30°)$. (2) $= \mathrm{diag}(0.75, 0.25)$. (3) $h(0.75)$. Walkthrough: $-0.75\log_2 0.75 - 0.25\log_2 0.25 = 0.811$ bit.
2. **core · numeric · `q12-en-bell`** — "What is $E$ for a Bell state?"
   - Answer: **1** = `q12Ebell`. Hints: (1) Its half is $\tfrac12 I$. (2) $S(\tfrac12 I)$. (3) $\log_2 2$. Walkthrough: the reduced state is maximally mixed, $E = 1$ bit, the maximum for two qubits.
3. **core · choice · `q12-en-local`** — "Does a Hadamard on Alice's qubit change the entanglement?"
   - Options: **No** ✓ · Yes, it doubles it · Yes, it zeroes it · Only if Bob also acts. Check: `q12E30` = `q12E30Local` = 0.811. Hints: (1) It conjugates $\rho_A$. (2) Eigenvalues are unchanged. (3) $S$ depends only on them. Walkthrough: $S(U\rho_A U^\dagger) = S(\rho_A)$; local unitaries leave $E$ alone.
4. **stretch · choice · `q12-en-mixed`** — "The Werner state at $w = 0.5$ has $S(\rho_A) = 1$ bit. Is that its entanglement?"
   - Options: **No — it is weakly entangled, not maximally** ✓ · Yes, it is maximally entangled · No, it is separable · Cannot tell. Check: `q12WernerSA` = 1 but `q12WerConc[1]` = 0.25. Hints: (1) $S(\rho_A)$ measures entanglement only for pure states. (2) The Werner state is mixed. (3) Use the entanglement of formation instead. Walkthrough: a mixed state's marginal can be fully mixed with little entanglement; its concurrence is only $0.25$.

### `q12-concurrence`
1. **warm-up · numeric · `q12-co-pure`** — "What is the concurrence of $\cos30°|00\rangle + \sin30°|11\rangle$?"
   - Answer: **0.866** = `q12ConcPure30`. Hints: (1) $C = \sin2\theta$. (2) $2\theta = 60°$. (3) $\sin60°$. Walkthrough: $C = 2\sqrt{\lambda_1\lambda_2} = 2\sqrt{0.75 \times 0.25} = \sin60° = 0.866$.
2. **core · numeric · `q12-co-werner`** — "What is the concurrence of the Werner state at $w = 0.5$?"
   - Answer: **0.25** = `q12WerConc[1]`. Hints: (1) Wootters: $\max(0, \lambda_1 - \lambda_2 - \lambda_3 - \lambda_4)$. (2) For Werner it reduces to $(3w - 1)/2$. (3) $(1.5 - 1)/2$. Walkthrough: $(3 \times 0.5 - 1)/2 = 0.25$, matching the PPT verdict that the state is weakly entangled.
3. **core · numeric · `q12-co-eofc`** — "For $C = 0.866$, what is the entanglement $E(C)$, in bits?"
   - Answer: **0.811** = `q12EofC30`. Hints: (1) $E(C) = h\!\big((1 + \sqrt{1 - C^2})/2\big)$. (2) $\sqrt{1 - 0.75} = 0.5$. (3) $h(0.75)$. Walkthrough: $(1 + 0.5)/2 = 0.75$, $h(0.75) = 0.811$ — the same number as the entropy.
4. **stretch · choice · `q12-co-product`** — "What is the concurrence of the product state $|01\rangle$?"
   - Options: **0** ✓ · 0.5 · 1 · $\tfrac1{\sqrt2}$. Check: a product state has one non-zero Schmidt weight. Hints: (1) $C = 2\sqrt{\lambda_1\lambda_2}$. (2) One weight is $0$. (3) The product is $0$. Walkthrough: $\lambda_2 = 0$, so $C = 0$: no entanglement.

### `q12-multipartite`
1. **warm-up · numeric · `q12-mu-wab`** — "Trace qubit $C$ out of the W state. What is the concurrence of the remaining pair?"
   - Answer: **0.667** = `q12WpairConc`. Hints: (1) $\rho_{AB} = \tfrac13[(|01\rangle + |10\rangle)(\langle01| + \langle10|) + |00\rangle\langle00|]$. (2) Wootters gives $\tfrac23$. (3) $0.667$. Walkthrough: the W state keeps pairwise entanglement, $C_{AB} = \tfrac23$.
2. **core · numeric · `q12-mu-ghz`** — "Do the same for the GHZ state. What is the reduced pair's concurrence?"
   - Answer: **0** = `q12GhzPairConc`. Hints: (1) The reduced pair is $\tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$. (2) That is a classical coin mixture. (3) It is separable. Walkthrough: GHZ entanglement is purely three-way; its reduced pair has $C = 0$.
3. **core · numeric · `q12-mu-ckw`** — "For the W state, evaluate $C_{A:B}^2 + C_{A:C}^2$."
   - Answer: **0.889** = `q12CkwLeft`. Hints: (1) Both concurrences are $\tfrac23$. (2) $2 \times (\tfrac23)^2$. (3) $2 \times \tfrac49$. Walkthrough: $\tfrac49 + \tfrac49 = \tfrac89 = 0.889$, equal to $C_{A:BC}^2 = (\tfrac{2\sqrt2}3)^2$: the monogamy bound is saturated.
4. **stretch · choice · `q12-mu-sloc`** — "Can stochastic LOCC turn a W state into a GHZ state?"
   - Options: **No — they are different SLOCC classes** ✓ · Yes, always · Yes, with probability $\tfrac89$ · Only for three qubits. Check: GHZ-class and W-class are inequivalent. Hints: (1) SLOCC needs invertible local operators. (2) There are exactly two tripartite classes. (3) No local map connects them. Walkthrough: GHZ and W are the two inequivalent genuinely-tripartite SLOCC classes; neither can be turned into the other.

## 5. Glossary terms new in Q12
`introduces` marks the two notation beats (W-709 #8), matching re-map §5. Inline math is TeX inside `$…$`.

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-partial-transpose` | partial transpose | notation | Transposing only one party's half of a density matrix; a separable state stays a valid state, an entangled one need not. | $(\rho^{T_B})_{m\mu,n\nu} = \rho_{m\nu,n\mu}$; its eigenvalues are basis-independent. | `q12-ppt:b2` | — |
| `qc-ppt-criterion` | PPT criterion | — | The test: a negative eigenvalue after the one-sided transpose proves entanglement; for two qubits it is exact. | $\rho^{T_B}\ge 0$ for separable $\rho$; for $2\otimes2$, $2\otimes3$ also sufficient (Peres–Horodecki). | `q12-ppt:b3` | — |
| `qc-entanglement-witness` | entanglement witness | — | One Hermitian observable whose average is never negative on a separable state, but is on some entangled one. | $W = W^\dagger$, $\mathrm{Tr}(\rho_s W)\ge 0$ for all separable $\rho_s$, $\mathrm{Tr}(\rho_e W) < 0$ for some $\rho_e$. | `q12-witness:b1` | `qc-l4-projectors` |
| `qc-locc` | LOCC | — | Local gates, local measurements and a classical phone line — everything two distant labs can do without mailing qubits. | Append / unitary / measure / discard locally, plus classical communication; cannot create entanglement. | `q12-locc:b1` | — |
| `qc-ebit` | ebit | — | One maximally entangled pair: the unit in which shared entanglement is counted. | One Bell pair; a pure $|\psi\rangle$ is worth $E(|\psi\rangle) = S(\rho_A)$ ebits per copy. | `q12-locc:b2` | — |
| `qc-entanglement-of-formation` | entanglement of formation | — | For a mixed pair, the smallest average entanglement over all ways to write it as a mixture of pure states. | $E_F(\rho) = \inf\sum_k p_k E(|\psi^{(k)}\rangle)$, over pure-state decompositions. | `q12-entropy:b4` | — |
| `qc-concurrence` | concurrence | notation | How much a two-qubit state overlaps its own spin-flip; a single number from $0$ (product) to $1$ (Bell). | $C(|\psi\rangle) = |\langle\psi|\tilde\psi\rangle|$, $|\tilde\psi\rangle = (\sigma_y\otimes\sigma_y)|\psi^*\rangle$; $C(\rho) = \max(0, \lambda_1 - \lambda_2 - \lambda_3 - \lambda_4)$. | `q12-concurrence:b1` | — |
| `qc-negativity` | negativity | — | The total size of the negative eigenvalues left by the partial transpose: another entanglement measure. | $N(\rho) = \sum_j|\lambda_j^-| = \tfrac12(\|\rho^{T_B}\|_1 - 1)$. | `q12-concurrence:b4` | `qc-l?-trace-norm` |
| `qc-w-state` | W state | — | The three-qubit state with exactly one excitation spread evenly; keeps pairwise entanglement when one qubit is lost. | $|W\rangle = (|100\rangle + |010\rangle + |001\rangle)/\sqrt3$. | `q12-multipartite:b1` | — |
| `qc-monogamy` | monogamy | — | Entanglement cannot be freely shared: a qubit strongly entangled with one partner is only weakly entangled with others. | CKW: $C_{A:B}^2 + C_{A:C}^2\le C_{A:BC}^2$. | `q12-multipartite:b3` | — |
| `qc-sloc` | SLOCC | — | Local operations and a phone call, allowed to succeed only sometimes; it sorts three-qubit states into GHZ- and W-classes. | $|\psi\rangle\to|\varphi\rangle$ by SLOCC iff $|\varphi\rangle = A\otimes B\otimes C|\psi\rangle$, local operators invertible. | `q12-multipartite:b4` | — |
| `qc-bound-entanglement` | bound entanglement | — | Entangled states from which no Bell pair can ever be distilled; they have a positive partial transpose. | PPT entangled states; distillable entanglement $0$, $E_F > 0$ (Bergou §3.7.7). | glossary only (Formal aside, `q12-multipartite:b4` F) | — |

(In the table `\|` is a Markdown escape; the strings carry a plain `|`.) Reused: `qc-separable`, `qc-chsh`,
`qc-no-signalling` (Q10), `qc-entanglement-entropy`, `qc-partial-trace`, `qc-schmidt`, `qc-trace-distance` (Q9),
`qc-density-matrix`, `qc-positive-operator`, `qc-bloch-ball` (Q8), `qc-ghz` (Q7), `qc-bell-basis`,
`qc-coefficient-matrix` (Q6), `qc-unitary` (Q2), `qc-shannon-entropy`, `qc-binary-entropy` (F2).

**Notation beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-partial-transpose` | notation | `q12-ppt:b2` | `mx(PB(0.5), {blocks:2})` over `mx(PB(0.5), {blocks:2, ptranspose:'B'})` |
| `qc-concurrence` | notation | `q12-concurrence:b1` | `mx(pa('YY'))` over `mx(coef(PSI(30)), {svd:true})` |

Not here, by ownership: the entanglement entropy $E = S(\rho_A)$ and its notation beat (Q9, ruling 7); the trace norm
$\|\cdot\|_1$ (Q9's `q9-distance`, which `qc-negativity` bridges back to); separable states (Q10); GHZ (Q7).

## 6. Review card per unit (both tracks)
### `q12-ppt`
- **G points:** (1) Separable means a mixture of product states. (2) The partial transpose flips one party's indices. (3) A negative eigenvalue after the flip proves entanglement. (4) For two qubits the test is exact, and sharper than CHSH.
- **F points:** (1) $\rho^{T_B}\ge 0$ for every separable state. (2) For $2\otimes2$ and $2\otimes3$ the converse holds (Peres–Horodecki). (3) The running state is entangled for all $p > 0$, below the CHSH threshold $1/\sqrt2$.
- **Equations:** $(\rho^{T_B})_{m\mu,n\nu} = \rho_{m\nu,n\mu};\quad \lambda_{\min} = \tfrac12[(1-p) - \sqrt{(1-p)^2 + p^2}] < 0$
- **Trap:** reading "no Bell violation" as "separable": CHSH misses entangled states that PPT catches.

### `q12-witness`
- **G points:** (1) A witness is one observable, $\langle W\rangle \ge 0$ on separable, $< 0$ on some entangled. (2) Build it from the negative eigenvector of $\rho^{T_B}$. (3) Its average on the running state is that eigenvalue. (4) No full tomography is needed.
- **F points:** (1) $W = (|\eta\rangle\langle\eta|)^{T_B}$. (2) $\mathrm{Tr}(\rho W) = \lambda_- < 0$ by the transpose-swap identity. (3) $\mathrm{Tr}(\rho_s W)\ge 0$ because separable states are PPT.
- **Equations:** $\mathrm{Tr}(\rho W) = \mathrm{Tr}(\rho^{T_B}|\eta\rangle\langle\eta|) = \lambda_-$
- **Trap:** thinking $W\ge 0$: the witness is not positive; only $\rho_s^{T_B}$ is.

### `q12-locc`
- **G points:** (1) LOCC is local gates, measurements and a classical call — no mailing qubits. (2) One Bell pair is one ebit. (3) Weak copies distil to fewer strong pairs; the rate is $E = S(\rho_A)$. (4) Procrustean distillation succeeds with chance $2\sin^2\theta$.
- **F points:** (1) LOCC cannot create entanglement from a product state. (2) Distillation and dilution both run at rate $S(\rho_A)$ (N&C). (3) Procrustean: success $\to \Phi^+$, failure $\to |1\rangle_{A'}|00\rangle$.
- **Equations:** $p_s = 2\sin^2\theta = 1 - \cos2\theta$
- **Trap:** "local operations can boost entanglement": they can only redistribute or spend it.

### `q12-entropy`
- **G points:** (1) A pure pair's entanglement is $E = S(\rho_A)$. (2) Local turns leave $E$ unchanged. (3) $E$ is additive and never grows under LOCC. (4) Mixed pairs use the entanglement of formation.
- **F points:** (1) $E(|\psi\rangle) = S(\rho_A) = S(\rho_B)$. (2) $S(U_A\rho_A U_A^\dagger) = S(\rho_A)$; additive; $\overline E$ non-increasing (Eq. 3.58; N&C majorization). (3) $E_F(\rho) = \inf\sum_k p_k E(|\psi^{(k)}\rangle)$.
- **Equations:** $E = S(\rho_A) = h(\cos^2\theta);\quad E_F(\rho) = \inf\sum_k p_k E(|\psi^{(k)}\rangle)$
- **Trap:** using $S(\rho_A)$ for a mixed pair: a separable mixed state can have a fully mixed marginal.

### `q12-concurrence`
- **G points:** (1) Flip the state with $\sigma_y\otimes\sigma_y$ and overlap it with the original: that is the concurrence. (2) Pure: $C = 2\sqrt{\lambda_1\lambda_2} = \sin2\theta = 2|\det A|$. (3) $E$ is a fixed increasing function of $C$. (4) Wootters gives $C$ for any mixed two-qubit state.
- **F points:** (1) $C = |\langle\psi|\tilde\psi\rangle|$, $|\tilde\psi\rangle = (\sigma_y\otimes\sigma_y)|\psi^*\rangle$. (2) $E(C) = h\!\big(\tfrac{1 + \sqrt{1 - C^2}}2\big)$. (3) $C(\rho) = \max(0, \lambda_1 - \lambda_2 - \lambda_3 - \lambda_4)$; negativity sums $|\lambda_j^-|$.
- **Equations:** $C = 2\sqrt{\lambda_1\lambda_2};\quad C(\rho) = \max(0, \lambda_1 - \lambda_2 - \lambda_3 - \lambda_4)$
- **Trap:** reading the Wootters $\lambda_i$ as Schmidt weights: they are square-root eigenvalues of $\rho\tilde\rho$, a different list.

### `q12-multipartite`
- **G points:** (1) Three qubits: product, one-plus-pair, or genuinely three-way. (2) GHZ's reduced pair is separable; W's keeps $C = \tfrac23$. (3) Monogamy: a qubit cannot be strongly entangled with two partners at once. (4) GHZ and W are different SLOCC families.
- **F points:** (1) GHZ reduced pair separable; $|W\rangle$ reduced pair $C_{AB} = \tfrac23$. (2) CKW: $C_{A:B}^2 + C_{A:C}^2\le C_{A:BC}^2$, equality for W ($\tfrac89$). (3) GHZ-class and W-class are inequivalent under SLOCC.
- **Equations:** $C_{A:B}^2 + C_{A:C}^2 \le C_{A:BC}^2;\quad \text{W: } \tfrac89 = \tfrac89$
- **Trap:** "more parties, more sharing": monogamy limits it; GHZ holds no pairwise entanglement at all.

## 7. Symbol-before-use tables
Abbreviations: pp, wi, lo, en, co, mu (the six units in order). Carried from Q6–Q11 and recapped at `q12-ppt:b1`:
$|00\rangle…$, kets and bras, $\Phi^\pm$, $\Psi^\pm$ and the Bell basis (Q6), the coefficient matrix $A$ and
$\det A$ (Q6), $\langle\sigma_i\otimes\sigma_j\rangle$ and the correlation grid (Q6), GHZ (Q7), $\rho$, $\mathrm{Tr}$,
the Bloch ball and $\mathbf r$ (Q8), the partial trace $\mathrm{Tr}_B$, $\rho_A$, $S(\rho)$, $E = S(\rho_A)$, the
Schmidt weights $\lambda_i$ and the trace norm $\|\cdot\|_1$ (Q9), separable $\sum p\,\rho_A\otimes\rho_B$, CHSH (Q10),
$\sigma_x, \sigma_y, \sigma_z$ (Q3), the binary entropy $h$ (F2).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| separable | pp:b1 | Q10 | OK | Link-back. |
| $\rho^{T_B}$ | pp:b2 | pp:b2 | OK | Notation beat. |
| eigenvalue of $\rho^{T_B}$ | pp:b3 | Q3 (eigenvalue) | OK | — |
| $\Psi^-$ (singlet) | pp:b1 | Q6 | OK | Rosetta in place (ruling 9). |
| $w$ (Werner weight) | pp:b5 | pp:b5 | OK | — |
| $W$ (witness) | wi:b1 | wi:b1 | **FLAG** | $W$ the witness vs $|W\rangle$ the W state (mu); the witness is a bare operator, the state always a ket (§8). |
| $|\eta\rangle$ | wi:b2 | wi:b2 | OK | The negative eigenvector. |
| LOCC | lo:b1 | lo:b1 | OK | — |
| ebit | lo:b2 | lo:b2 | OK | — |
| $\theta$ (tilt) | lo:b3 | lo:b3 | OK | $0\le\theta\le\tfrac\pi4$; not the Bloch polar angle (§8). |
| $A'$ (ancilla), $U_A$ | lo:b3 | lo:b3 | OK | — |
| $E = S(\rho_A)$ | en:b1 | Q9 | OK | Link-back; in bits. |
| $E_F$ | en:b4 | en:b4 | OK | — |
| $\tilde\psi$, $C$ | co:b1 | co:b1 | OK | Notation beat. |
| $\lambda_1, \lambda_2$ (Schmidt) | co:b2 | Q9 | OK | — |
| $\lambda_i$ (Wootters) | co:b4 | co:b4 | **FLAG** | different list from the Schmidt weights; stated in place. |
| negativity $N$ | co:b4 | co:b4 | OK | — |
| $|W\rangle$ (W state) | mu:b1 | mu:b1 | OK | Always a ket (see the $W$ FLAG). |
| $C_{A:B}$, $C_{A:BC}$ | mu:b3 | mu:b3 | OK | — |
| SLOCC | mu:b4 | mu:b4 | OK | — |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\rho_{m\mu,n\nu}$ | pp:b2 | pp:b2 | OK | Product-basis index. |
| $\rho_{A,k}\otimes\rho_{B,k}$ | pp:b3 | Q10 | OK | — |
| $\mathrm{Tr}(X^{T_B}Y) = \mathrm{Tr}(X Y^{T_B})$ | wi:b2 | wi:b2 | OK | Stated, not proved. |
| $\prec$ (majorization) | en:b3 | en:b3 | OK | N&C Theorem 12.15, quoted. |
| $|\psi^{(k)}\rangle$ | en:b4 | en:b4 | OK | A pure-state decomposition. |
| $\tilde\rho = (\sigma_y\otimes\sigma_y)\rho^*(\sigma_y\otimes\sigma_y)$ | co:b4 | co:b4 | OK | — |
| $\|\rho^{T_B}\|_1$ | co:b4 | Q9 (trace norm) | OK | Link-back. |
| biseparable, genuinely tripartite | mu:b1 | mu:b1 | OK | — |
| bound entanglement | mu:b4 (F) | glossary | OK | Formal aside; glossary-only term. |

**Counts:** Ground 2 FLAGs, Formal 0 FLAGs, all resolved in place.

## 8. Errata
Q12 draws no lecture notes (books-phase). Checked against Bergou §3.5–3.9 and recomputed twice: the PPT eigenvalues of
the running state and the Werner state, the witness value $\lambda_-$, the Procrustean success chance, $E = h(\cos^2\theta)$,
the pure and Wootters concurrences, $E(C)$, and the W-state CKW equality $\tfrac89 = \tfrac89$.

**Carried from the map (Bergou errata, cited in place):**
- **B9**, p. 46: the Procrustean failure branch is $|1\rangle_{A'}|00\rangle_{AB}$, not $|10\rangle_{AB}$; and Bergou writes $(|00\rangle + |11\rangle)/\sqrt2$ as "$\Psi_+$" there. Cited at `q12-locc:b3` and D3.
- **B11**, p. 52, Eqs. 3.59–3.60: the weight $p_k$ is missing; the entanglement of formation is $\inf\sum_k p_k E(|\psi^{(k)}\rangle)$. Cited at `q12-entropy:b4`.
- **B12**, p. 59, Eq. 3.86: the second $|v_0\rangle$ should read $|v_1\rangle$. Cited at `q12-multipartite:b3` (the W Schmidt form for $C_{A:BC}$).
- **B8**, p. 41: "all Bell inequalities hold for $p \le 1/\sqrt2$" is proved only for CHSH (the Horodecki bound); say "CHSH". Reflected in `q12-ppt:b4` ("breaks no CHSH bound").

**Silent notes (no box).**
| Where | Point | Action |
|---|---|---|
| `q12-witness` vs `q12-multipartite` | $W$ is the witness operator; $|W\rangle$ is the W state | The witness is always a bare $W$; the W state is always the ket $|W\rangle$. Stated at `q12-multipartite:b1` (§12 Q4) |
| `q12-locc:b3` | $\theta$ is the state's tilt, not the Bloch polar angle | "$0 \le \theta \le \tfrac\pi4$" said in place |
| `q12-concurrence:b4` | Wootters $\lambda_i$ are square roots of eigenvalues of $\rho\tilde\rho$, not Schmidt weights | One clause in `q12-concurrence:b4` F |
| Bergou §3.5 | Bergou writes the singlet as $|-\rangle$ | The plan writes $\Psi^-$ throughout (ruling 9) |

## 9. Engine gaps and stage-contract gaps
### 9.1 Engine

**Merged E1 used (no work):** `ptranspose`, `spectrum`, `eigh`, `svd`, `sqrtPSD`, `partialTrace`, `reducedDensity`,
`densityOf`, `mixtureN`, `vonNeumann`, `entanglementEntropy`, `pauliString`, `coefMatrix`, `schmidt`, `binaryEntropy`.

**E2 `entangle` (NOT built; this plan is its first user for these names).** Each learner-visible number is computed in
`Q12.values.ts` through one of these, and `q1213plan-engine.ts` has already computed it from the primitives above (the
same route). Twins go in `pipeline/make_qc_fixtures.py` (seed 709, numpy/scipy only); every value gets a property test.

| Function (signature) | Returns | Used by | numpy-twin route |
|---|---|---|---|
| `isPPT(rho: Mat): boolean` | $\rho^{T_B}\ge 0$? | pp:b3–b5 | `eigvalsh` of the reshaped flip, min ≥ −1e−9 |
| `pptSpectrum(rho: Mat): number[]` | eigenvalues of $\rho^{T_B}$ (ascending) | pp:b3, b5; wi | `eigvalsh(ptransB(rho))` |
| `negativity(rho: Mat): number` | $\sum_j\|\lambda_j^-\|$ | co:b4 | sum of negative `eigvalsh(ptransB(rho))` |
| `witnessFromPPT(rho: Mat): {W: Mat; lambda: number; eta: Vec}` | the witness, its $\lambda_-$ and $\|\eta\rangle$ | wi:b2 | `eigh` eigenvector of min eigenvalue; $W = (\|\eta\rangle\langle\eta\|)^{T_B}$ |
| `concurrencePure(psi: Vec): number` | $2\sqrt{\lambda_1\lambda_2}$ | co:b2 | $2\|\det A\|$ of the reshaped-ket coefficient matrix |
| `concurrence(rho: Mat): number` | Wootters $\max(0, \lambda_1-\lambda_2-\lambda_3-\lambda_4)$ | co:b4, mu:b2–b3 | `sqrt` eig of $\rho\tilde\rho$, sorted, Wootters formula |
| `eofFromC(C: number): number` | $h\!\big(\tfrac{1+\sqrt{1-C^2}}2\big)$ | co:b3 | closed form |
| `procrustean(thetaDeg: number): {ps: number; success: Vec; fail: Vec}` | the success chance and both branches | lo:b3–b4 | $2\sin^2\theta$; explicit branch vectors |
| `ckw(psi3: Vec): {cAB: number; cAC: number; cAbc: number; lhs: number; rhs: number}` | the three concurrences and the CKW two sides | mu:b3 | Wootters of the two reductions; $2\sqrt{\lambda_1\lambda_2}$ of $\rho_A$ for $C_{A:BC}$ |

`eigenEnsemble`-style sign fixing is not needed here (all values are eigenvalues or magnitudes, phase-free). E2 must
merge **before** the Q12 build (re-map batch 3 → Q12 batch 5; §12 Q7).

### 9.2 Stage contract

**`matrix` v2 (needs: matrix-v2)** — merged (W-709 #13/#15); no new fields. Uses: `coef`, `svd`, `ptranspose:'B'`,
`spectrum:'bars'|'entropy'`, `pauli:'YY'`, `product`, `trace`, `blocks:2`, `highlight`. Sweeps: a `mixture` whose weight
sweeps ($p$, $w$) with the complement sweeping to keep $\mathrm{Tr} = 1$ (pp:b3, pp:b5).

**`two-qubit` (needs: two-qubit)** — merged (W-709 #14); the `concurrence` readout is **E2-gated** (the validator
rejects it until `concurrence` lands). Uses: `source:{ket}`, `{rho}`, `{reduce:{ket, keep}}`; `grid:'T'`;
`readouts:['entropy'|'concurrence']`; `local`; `highlight`; `labels`.

**`plot` (NEW SVG kind; needs: plot; judge Q2).** An engine-sampled curve plus markers and an optional shaded region.
Exact shape proposed:
```ts
type PlotCurveKey =
  | 'pptLambdaMin'       // lambda_min(rho^{T_B}) for PB(p), p in [0,1]  (Q12 pp)
  | 'eofOfC'             // E(C) = h((1+sqrt(1-C^2))/2), C in [0,1]      (Q12 co)
  | 'entropyOfTheta'     // S(rho_A) for cos θ|00> + sin θ|11>, θ in [0,45°] (Q12 en)
  | 'wernerConcurrence'  // C(w) = max(0,(3w-1)/2), w in [0,1]           (Q12 co)
  | 'depolRadius'        // |1 - 4p/3|, p in [0,1]                        (Q13)
interface PlotState {
  kind: 'plot'
  fn: PlotCurveKey                        // engine samples the curve (make_qc_fixtures twin per key)
  x: { min: number; max: number; label?: string }
  marker?: number | number[]             // vertical marker(s) at these x, with the (x, y) read out
  shade?: { from: number; to: number }   // a shaded x-band (e.g. the CHSH-detectable region)
  yZero?: boolean                        // draw the y = 0 axis (negative values dip below)
  shot?: PlotShot
}
```
| Aspect | Rule |
|---|---|
| Resolve | engine only: each `fn` samples its named engine function on a grid (≥ 64 points); no literal curve data in content |
| Validation | `x.min < x.max`; every `marker` and `shade` endpoint within `[x.min, x.max]`; `fn` in the key set |
| Passport / fidelity | "CURVE · one engine function", key `qc-plot-engine-curve` (the curve is sampled, not drawn by hand; a marker reads an exact engine value) |
| Print | the SVG is its own figure (W-709 #7 strips work) |

Q12 uses `pptLambdaMin` (pp:b3–b4), `eofOfC` (co:b3), `entropyOfTheta` (en:b5), `wernerConcurrence` (co:b5).

### 9.3 Widget gaps
**W12 `entanglement-explorer`** (deferred under the cap): a two-qubit state whose coefficient matrix the learner edits,
showing the reduced balls, the correlation grid, the concurrence and the PPT spectrum live. The §3 stand-ins and the
stage sweeps carry the units until then.

## 10. Media
- **Opener (Part IV, re-used):** Part IV's opener is planned in `P-Q10-story.md` §10; Q12 does not add one.
- **Film (deferred) `qc-q12-negative-tower`** "The negative tower: PPT spots what CHSH misses": the running state's
  $\rho^{T_B}$ spectrum as $p$ grows, one bar sinking below zero while the CHSH value stays under its bound until
  $p = 1/\sqrt2$. Data from the engine (`pptSpectrum`, the CHSH value from Q10's `chsh`); manifest keys `q12BergLamMin`,
  `q12ChshThresh`. Drawn numbers re-checked against the engine (the manifest test).
- **Decor (Higgsfield, credits need the user):** a slowly folding paper shape that turns inside-out once (the one-sided
  flip); no text, no numbers, no diagrams.

## 11. Hooks
### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-ppt` | The partial transpose test | Q12 · `q12-ppt` | `qc-separable`, `qc-density-matrix` | — |
| `qc-witness` | One observable that flags entanglement | Q12 · `q12-witness` | `qc-ppt`, `qc-observables` | — |
| `qc-locc` | Local moves and a shared coin | Q12 · `q12-locc` | `qc-bell-basis` | — |
| `qc-entanglement-measure` | Entanglement as a number | Q12 · `q12-entropy` | `qc-entanglement-entropy`, `qc-shannon-entropy` | — |
| `qc-concurrence` | Concurrence and negativity | Q12 · `q12-concurrence` | `qc-entanglement-measure`, `qc-schmidt` | — |
| `qc-multipartite` | GHZ, W and monogamy | Q12 · `q12-multipartite` | `qc-concurrence`, `qc-ghz` | — |

Bridge ids used, all existing: `qc-l4-projectors`. The `qc-entanglement-entropy` station is Q9's; Q12's
`qc-entanglement-measure` `needs` it. No `sameAs` 448 twin (448 has no entanglement-detection content).

**Future bridges (TODO; targets not built):** Q13 (the partial transpose returns as "transpose is not completely
positive"; `q12-ppt` → `q13-properties`), Part IX codes (witnesses and stabilizers), Part X (entropy proofs: Klein,
subadditivity, cited here from Bergou §3.7).

### 11.2 Arcade (6 levels)
Label constant: `const Q12x = (unit, label) => ({ lecture: 'Q12', unit, label })`. All six are Spot the error.
1. **`q12-ppt` · `qc-chsh-final`** — "No Bell violation, so separable?"
   - Steps: "The running state at $p = 0.5$ breaks no CHSH bound." · "CHSH is a test for entanglement." · "So a state that passes CHSH is separable." · "Therefore this state is separable."
   - `wrong: 3`. Why: CHSH is only sufficient; the partial transpose is negative here, so the state is entangled (`q12BergLamMin`).
2. **`q12-witness` · `qc-witness-positive`** — "Is the witness positive?"
   - Steps: "$W = (|\eta\rangle\langle\eta|)^{T_B}$ is built from a projector." · "A projector is a positive operator." · "The partial transpose preserves positivity." · "So $W \ge 0$."
   - `wrong: 3`. Why: the partial transpose does **not** preserve positivity — that is the whole point; $W$ has a negative eigenvalue (`q12WitnessVal` $< 0$).
3. **`q12-locc` · `qc-locc-create`** — "Make entanglement by phone?"
   - Steps: "Alice and Bob share a product state." · "They run local gates and phone each other." · "The Procrustean step can succeed." · "So LOCC made the pair entangled."
   - `wrong: 4`. Why: Procrustean distillation needs an already-entangled input; LOCC cannot create entanglement from a product state (`q12ProcPs30` concerns a tilted, already-entangled pair).
4. **`q12-entropy` · `qc-sa-mixed`** — "Entropy as the measure?"
   - Steps: "The Werner state at $w = 0.5$ has $S(\rho_A) = 1$ bit." · "A Bell state also has $S(\rho_A) = 1$ bit." · "Equal marginal entropy means equal entanglement." · "So the Werner state is maximally entangled."
   - `wrong: 3`. Why: $S(\rho_A)$ measures entanglement only for pure states; the Werner state's concurrence is $0.25$, far below maximal (`q12WerConc`).
5. **`q12-concurrence` · `qc-c-product`** — "Concurrence of a product?"
   - Steps: "$|01\rangle$ is a two-qubit state." · "Its coefficient matrix is $\mathrm{diag}(0, 1)$ up to order." · "$C = 2|\det A|$." · "So $C = 2$."
   - `wrong: 4`. Why: $\det A = 0$ for a product state, so $C = 0$, not $2$ (and $C$ never exceeds $1$).
6. **`q12-multipartite` · `qc-ghz-pairs`** — "GHZ's pairs?"
   - Steps: "$|\mathrm{GHZ}\rangle$ is strongly three-way entangled." · "So each pair inside it is strongly entangled too." · "Trace out one qubit; the pair stays entangled." · "So $C_{AB} > 0$ for GHZ."
   - `wrong: 2`. Why: GHZ's entanglement is purely three-way; its reduced pair is separable, $C_{AB} = 0$ (`q12GhzPairConc`).

## 12. Questions for the judge
**Q1. Bergou ⚑ problems P3.4–P3.8.** All are ⚑ (no sheet assigns them), and HW3 is not ingested. *Recommend:* use
their *results* only as cited derivations/asides (P3.6 $C = 2|\det A|$ in `q12-concurrence:b2`; the Werner and
$\rho = p|\Psi^-\rangle + (1-p)|00\rangle$ families are standard, not tied to one problem), and grade **no** challenge
from them — every Q12 challenge is built on a running family. This follows `qc709-Q8Q9.md` #5 (⚑ as cited derivation).
Ask the user before using any HW3 item.

**Q2. The `plot` kind (§9.2).** `plot` is planned (re-map ruling 7, batch 3/4) but not built. *Recommend:* build it to
the §9.2 shape before the Q12 build; four of Q12's curves and one of Q13's name it. If it slips, pp:b3/b4, co:b3/b5 and
en:b5 fall back to a `matrix{spectrum}`/`two-qubit{readouts}` sweep with the value in the caption (each derivation
keeps ≥ 2 distinct non-plot views, so the W-709 #7 lint still passes).

**Q3. Bound entanglement and UPB.** The re-map's `q12-multipartite` lists UPB/bound entanglement as Formal. *Recommend:*
keep it a one-line Formal aside and a glossary-only term (`qc-bound-entanglement`), **not** a beat — the two-qutrit UPB
construction (Bergou Eqs. 3.63–3.64) needs qutrits, which no stage draws, and would blow the unit's scope.

**Q4. The $W$ clash.** $W$ is the witness operator (`q12-witness`) and $|W\rangle$ is the W state
(`q12-multipartite`). *Recommend:* the witness is always a bare $W$, the W state always the ket $|W\rangle$; stated
once at `q12-multipartite:b1`. (§7, §8.)

**Q5. The CV separability criteria** (Bergou §3.5 pp. 42–44: Duan; Hillery–Zubairy). *Recommend:* **exclude** them —
Q12 is two-qubit, and the continuous-variable conditions need field modes this course has not built. PPT + witness
cover the finite-dimensional story.

**Q6. N&C majorization (Theorem 12.15, $\lambda_\psi \prec \lambda_\varphi$).** *Recommend:* **state, do not prove** —
it names the exact LOCC-convertibility condition in `q12-entropy:b3` without the majorization machinery (a Part X topic).

**Q7. E2 before Q12.** Every concurrence/CKW/witness number needs `entangle` (E2). *Recommend:* confirm the build order
E2 (batch 3) → Q12 (batch 5); the plan's numbers are all verified today from E1 primitives, so E2 only needs to match
them (the fixtures twin is written).
