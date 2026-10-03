# P-Q10-story — Q10 "Entanglement, no signalling and Bell's inequality" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q8-story.md` (two tracks; the 13 sections of
`skills/03-chapter-plan`), with the two standing gates: every derivation list, in both tracks, steps the stage through
≥ 2 distinct views (`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one
notation beat (`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Map entry: `P-709-remap-L1L7.md` §2 Q10 (lines
~179), §2.1 (Q6, Q7, Q9 → Q10; F2 → Q10 soft), §2.2 (CHSH and LHV statistics stay in Q10), §4 row Q10 D1–D6, §5
(separable; correlator, CHSH S), §6 (engine E2 `entangle`). Rulings: `qc709-remap.md` (review rulings: no raw TeX,
engine-backed answers; #12 HW, ask before HW3), `qc709-Q8Q9.md` (build after the E2/`matrix` patch; W-709 #7/#8 and
no-raw-TeX with no legacy allowlist), `qc709-Q6Q7.md` (#7 `plot`; #8 define a concept in place when its owner is not
built). Planned together with `P-Q11-story.md`, which uses this chapter's Bell tools and the no-signalling bound.

**Sources read.**
- Bergou, as the re-map cites it (printed pages; read): §3.1 pp. 31–32, Eqs. 3.1–3.4 (separable Eq. 3.2, the
  example Eq. 3.3, the Bell states Eq. 3.4; Bergou's Φ/Ψ are swapped, erratum B6); §3.2 pp. 32–33, Eqs. 3.5–3.7 (the
  faster-than-light scheme and $\rho_b = \tfrac12 I$); §3.3 pp. 33–36, Eqs. 3.8–3.19 (instruction sets, the CHSH
  inequality, the $2\sqrt2$ violation, the product-state bound, Tsirelson Eq. 3.17 — the second square must read
  $(b_1-b_2)/\sqrt2$, erratum B7 — the marginal problem, the PR box); §3.5 pp. 40–41 (a Bell inequality as a
  separability test, used in one aside). Problems P3.1 (Wigner) and P3.2 (Hardy) are ⚑ (no sheet assigns them).
- N&C (cited, equations checked): §2.6 pp. 111–117, Box 2.7 (the singlet's anti-correlations, Eqs. 2.213–2.218),
  Eqs. 2.219–2.230 (the CHSH derivation with $Q, R, S, T$ and the $2\sqrt2$ violation of the singlet), pp. 115–117
  (the two assumptions, local realism). N&C §2.4.3 pp. 105–107 (no-signalling for the reduced state; cited, from Q9).
- The notes stop at Lecture 7; Q10 is a `'books'`-phase chapter. No notes page applies (the re-map's §1.1 ends at
  Q9). Copyrighted: every source is paraphrased and cited by section and printed page.
- Ownership (re-map §2.2): Q10 owns separable mixtures ($\rho = \sum_k p_k\rho_A^k\otimes\rho_B^k$), no-signalling,
  local hidden-variable statistics, the correlator $\langle ab\rangle$ as it is used here, the CHSH value S, the
  Tsirelson bound and the PR box. Q7 owns GHZ and Mermin (Q10 links back for the single-run argument and contrasts the
  statistical test). Q6 owns the Bell basis, the correlation grid and the product test. Q9 owns the reduced state and
  the partial trace (no-signalling uses $\rho_B = \mathrm{Tr}_A$). F2 owns the classical correlator and joint
  distribution; since F2 is a **soft** dependency (re-map §2.1, either build order), Q10 defines the correlator in
  place and links back to F2 in words (ruling `qc709-Q6Q7.md` #8's pattern for the variance).

**Evidence.** Every number was computed twice, for Q10 and Q11 at once.
- An independent numpy/scipy route (`q1011plan-numpy.py`, this brief's scratchpad): Bell and product states from their
  formulas; correlators as $\langle\psi|\sigma_i\otimes\sigma_j|\psi\rangle$ and for mixtures as
  $\mathrm{Tr}(\rho\,\sigma_i\otimes\sigma_j)$; the reduced state by `einsum` partial traces; the instruction-set bound
  by `itertools` over the 16 rows; the CHSH value by the explicit operator sum; the Tsirelson bound by `eigvalsh` of
  $C$ and $C^2$; separability witnessed by the partial transpose's eigenvalues (negativity). The file runs
  byte-identically twice.
- The second route is the engine the build will use once **E2 `entangle`** has landed (`correlator`, `chsh`,
  `correlationTensor`, `isPPT`, `negativity`, `lhvChsh`, `prBox`; §9.1). E2 is **not built yet**: this plan lists each
  function with its signature in §9.1, so that list becomes the E2 brief, and the build runs after E2 merges (re-map
  §7 batch 5). Where a readout needs an unbuilt function the stage validator already rejects it (re-map §6.1), so no
  beat can ship before its engine twin exists.
- Result: 240 numbers under 71 keys for both chapters agree to 6 decimals; no Q10 key differs between the two routes
  once E2 lands (the plan prints the numpy value for review).

**Conventions** (Q6's, Q8's and Q9's, plus these).
- **A and B.** Engine q0 = qubit 1 = Alice (the left factor); q1 = Bob. Two-qubit stages carry `labels:'A-B'`. For the
  CHSH experiment Alice measures $a_1, a_2$ and Bob $b_1, b_2$, each a $\pm1$ observable.
- **Bell names (ruling 9).** First Bell name in the chapter: "$\Phi^+$ (notes, N&C: $\beta_{00}$; Bergou: $\Psi_+$)",
  in `q10-separable:b2`. $\Psi^-$ is named "$\Psi^-$ (N&C: $\beta_{11}$; Bergou: $\Phi_-$)" at its first use.
- **The CHSH state.** Bergou's violating state is $|\chi\rangle = (|00\rangle + e^{i\pi/4}|11\rangle)/\sqrt2$
  (Eq. 3.12), measured with $a_1 = \sigma_x$, $a_2 = \sigma_y$, $b_1 = \sigma_x$, $b_2 = \sigma_y$. The CHSH dial
  sweeps the phase $\delta$: $S(\delta) = 2\cos\delta + 2\sin\delta$, $2$ at $\delta = 0°$ and $90°$, $2\sqrt2$ at
  $45°$. N&C's singlet version (the $Q, R, S, T$ settings) is a [B] beat and gives the same $2\sqrt2$.
- **Correlator and S.** $\langle ab\rangle = \sum ab\,P(a, b)$ (classical) or $\langle a\otimes b\rangle =
  \mathrm{Tr}(\rho\,a\otimes b)$ (quantum); $S = \langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle -
  \langle a_2b_2\rangle$. Both tracks write S for the CHSH value (not the entropy, which is Q9's $S(\rho)$; the two
  never share a beat, and a Rosetta line at `q10-chsh:b1` says so).
- **Units.** ħ = 1 in the engine, S = σ/2; a $\pm1$ of $\sigma$ is $\pm\tfrac\hbar2$ of spin (N&C rule). The chapter's
  observables $a_i, b_j$ are $\pm1$ Pauli operators, so no ħ is displayed.
- **Phases.** [B] a book source (Bergou or N&C, cited "Bergou §3.3" or "N&C §2.6"); [C] clue. There is no [L] beat:
  Q10 has no lecture-notes source (ruling for a `'books'` chapter; cf. `qc709-Q8Q9.md` #8 exempting `q9-distance`).
- **Numbers.** Every number in a G, F or caption string is rendered from its listed claim with `d(V.key, n)`; the plan
  prints the value for review only. Every answer key is `V.key`, never a literal. Correlators and S print as decimals
  or exact surds (e.g. $2\sqrt2$ shown as 2.828); an amplitude is never a percentage; this chapter shows no percent.
- **Text.** All inline math is TeX inside `$…$`; no TeX command outside `$…$`. No plan ids (D1, §5, b3) in learner
  text: cross-references read "Unit 10.4", "Chapter Q7". Units: 10.1 `q10-separable`, 10.2 `q10-no-signal`, 10.3
  `q10-hidden`, 10.4 `q10-chsh`, 10.5 `q10-violation`.
- **Claim keys** `q10…` in `Q10.values.ts`, as `Q8.values.ts`.

**Stage shorthand.** Each form expands to exactly one `StageState` (a derivation `view` is always one state; `split` is
for beat stages only). Q8's and Q9's forms carry over; the new ones are marked new.

| Shorthand | Expands to | Needs |
|---|---|---|
| `amp(S, f)` | `{kind:'amplitudes', state:S, ...f}` | — |
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'exact', ...f}` | v1 / v2 per src |
| `tq(S, f)` | `{kind:'two-qubit', source:{ket:S}, labels:'A-B', arrows:'reduced', grid:'T', ...f}` | two-qubit |
| `tqR(M, f)` | as `tq`, with `source:{rho:M}` (M a `matrix` ρ source) | two-qubit |
| `tqAx(S, a, b, f)` (new) | `tq(S, {axes:{a, b}, readouts:['chsh'], ...f})`; a, b are ≤ 2 `Dir` each | two-qubit + E2 (`chsh`) |
| `ball(P, f)` | `{kind:'bloch-ball', point:P, shot:'B-STD', ...f}` | — |
| `plot(spec)` (new) | `{kind:'plot', ...spec}` (an engine-sampled curve; §9.2) | plot + E2 |
| `tab(rows, f)` | `{kind:'matrix', tableau:rows, ...f}` (Pauli-string / instruction table) | matrix-v2 |
| `split(A / B)` | `{layout:'split', top:A, bottom:B}` (GL over SVG allowed) | — |

| Matrix source | Expands to | Needs |
|---|---|---|
| `out(K)` | `{outer:[K]}` = \|K⟩⟨K\| | v1 |
| `mix([w, K], …)` | `{rho:{mixture:[{w, ket:K}, …]}}`; w is an engine value or an exact fraction in code | v1 |
| `pa('XX')` | `{pauli:'XX'}` (a 1–3-letter Pauli string) | v1 (multi-letter: v2) |
| `prod(A, B, …)` | `{product:[A, B, …]}` = A·B·… | matrix-v2 |
| `lin([c, A], …)` | `{lin:[{c, src:A}, …]}`, c ∈ {±1, ±½, ±i, ±1/√2} | matrix-v2 |
| field `partialTrace:'A'\|'B'` | the reduced matrix overlay (Q9) | v1 |
| field `ptranspose:'B'` | the partial transpose $\rho^{T_B}$, moved cells flagged | matrix-v2 |
| field `spectrum:'bars'` | eigenvalue bars (negatives flagged) | matrix-v2 |

| Name | Source | Value |
|---|---|---|
| `BOX` | `mix([1/2, {ket:'00'}], [1/2, {ket:'11'}])` (Q8's coin box) | ½(\|00⟩⟨00\| + \|11⟩⟨11\|) |
| `SEP33` | `mix([1/3, {ket:'00'}], [2/3, {ket:'11'}])` (Bergou Eq. 3.3) | ⅓\|00⟩⟨00\| + ⅔\|11⟩⟨11\| |
| `PHI` | `{bell:'Phi+'}` | Φ⁺ |
| `PSIM` | `{bell:'Psi-'}` | Ψ⁻ (the singlet) |
| `PRODX` | `{ket:'++'}` | \|+x⟩⊗\|+x⟩ |
| `CHI(d)` | `{circuit:C_CHI, upTo:3}` with the phase `d` swept | $(\|00\rangle + e^{id}\|11\rangle)/\sqrt2$ |
| `AX`, `BX` | `['+x', '+y']` (Dir list): the directions $\hat x$ ($\sigma_x$) and $\hat y$ ($\sigma_y$) | — |
| `C` (matrix) | `lin([+1, pa('XX')], [+1, pa('XY')], [+1, pa('YX')], [-1, pa('YY')])` | the CHSH operator |

**Circuits** (gate shorthand as Q6: `g(H,0)`, `cx(0,1)`, `g(P,1,d)` = phase gate P(δ) on wire 1).

| Name | qubits · init | columns | state after column k |
|---|---|---|---|
| `C_CHI` | 2 · `'00'` | `[g(H,0)] [cx(0,1)] [g(P,1,d)]` | k = 3: $(\|00\rangle + e^{id}\|11\rangle)/\sqrt2$ |

All circuits carry `wires:['A','B']`.


## 0. Chapter map

Q10 answers the map's question: **"If two particles are linked, can they send a message faster than light, and can
hidden instructions explain the link?"** It opens Part IV, "Entanglement".

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q10-separable` | Mixtures of products: separable states | When is a mixed pair's correlation only classical? | Bergou §3.1 pp. 31–32, Eqs. 3.1–3.4 | `l6-mixture` | Q6 product test, grid, Bell basis; Q8 mixtures; Q9 reduced ½I |
| 2 | `q10-no-signal` | No signalling: the partner learns nothing | Can Alice's choice of measurement change what Bob sees? | Bergou §3.2 pp. 32–33, Eqs. 3.5–3.7; N&C §2.4.3 pp. 105–107 | — | Q9 reduced state; Q8 non-selective reading |
| 3 | `q10-hidden` | Instruction sets: a classical story | Could each particle carry answers fixed in advance? | Bergou §3.3 pp. 33–34, Eqs. 3.8–3.9; N&C §2.6 pp. 115–116 | `l1-logic` | Q7 Mermin, predetermined values |
| 4 | `q10-chsh` | The CHSH inequality: a classical ceiling | How high can a classical correlation score climb? | Bergou §3.3 p. 34, Eq. 3.10; N&C §2.6 pp. 113–114 | — | Q7 single-run argument (contrast) |
| 5 | `q10-violation` | Breaking the ceiling: $2\sqrt2$ | By how much can an entangled pair beat the classical score? | Bergou §3.3 pp. 34–36, Eqs. 3.11–3.19; N&C §2.6 pp. 116–117 | — | Q6 Bell state; Q3 Pauli algebra |

**No notes source.** Q10 is `'books'`-phase throughout: Bergou §3.1–3.3 and N&C §2.6 (ruling, this is where the course
leaves the lecture notes). Every beat is tagged [B] or [C]; none is [L].

**One move against Bergou's order** (§12 Q1): the no-signalling scheme (Bergou §3.2) is told with $\Phi^+$ and the
reduced state $\rho_B = \mathrm{Tr}_A$ of Chapter Q9, rather than Bergou's phase-gate interference argument, so that it
rests on tools the learner already has. Bergou's interference version is a [B] clue.

**Outcomes** (Ground wording):
- Say what a separable state is — a classical mixture of product states — and why its correlations are only classical.
- Show that one half of an entangled pair cannot carry a message: the partner's state is the same whatever Alice does.
- Write an instruction set, and show that the CHSH score of any instruction set is at most 2.
- Define the correlator and the CHSH value S, and state the Bell inequality $|S| \le 2$ for any classical story.
- Compute $S = 2\sqrt2$ for an entangled pair, show a product state never beats 2, and state the Tsirelson bound.

**Prerequisites** (concepts): Q9 `qc-reduced-density-matrix`, `qc-partial-trace`; Q8 `qc-density-matrix`,
`qc-mixed-states`, `qc-ensemble`, `qc-maximally-mixed`; Q7 `qc-local-realism`, `qc-hidden-values`, `qc-mermin-argument`;
Q6 `qc-bell-basis`, `qc-correlation-grid`, `qc-product-state`, `qc-entangled`, `qc-factoring-test`; Q3
`qc-pauli-matrices`, `qc-commutator`, `qc-expectation`. Reused glossary: `qc-mixture` (Q1), `qc-pauli-string`,
`qc-correlation-grid`, `qc-entangled`, `qc-product-state` (Q6), `qc-ghz`, `qc-local-realism`, `qc-hidden-values` (Q7),
`qc-density-matrix`, `qc-ensemble`, `qc-maximally-mixed` (Q8), `qc-partial-trace`, `qc-reduced-density-matrix` (Q9). 448
twins: `l6-mixture`, `l1-logic`. F2 (soft): the correlator and joint distribution, named in words until F2 is built.

**Openers and films.** Part IV's opener (a Blender still, planned here) and one Motion Canvas film are planned and
deferred (§10).

## 1. Story beats per unit

Kinds per unit (a derivation `view` may use only kinds that the unit's beat stages show; checked per unit below):
`q10-separable` two-qubit, matrix · `q10-no-signal` two-qubit, matrix, bloch-ball · `q10-hidden` matrix (tableau),
two-qubit · `q10-chsh` matrix (tableau), two-qubit, plot · `q10-violation` two-qubit, plot, matrix. Fidelity items used:
the `two-qubit` items (`qc-tq-local-arrows`, `qc-tq-grid-signed`, `qc-tq-not-two-places`), the `matrix` items
(`qc-matrix-entries`, `qc-matrix-not-a-space`, the spectrum flag), and a new `plot` item `qc-plot-engine-curve` (the
curve and its markers are engine-sampled, not drawn by hand; §9.2).

### Unit `q10-separable` — Mixtures of products: separable states

**`q10-separable:b1` [B] · notation beat, `introduces: ['qc-separable-state']`** (the classical mixture of products)
- **G:** "Alice and Bob each prepare a qubit in their own lab and mix their choices by a shared coin. The result is a [[qc-separable-state|separable state]]: a chance-weighted sum of products, $\rho = \sum_kp_k\,\rho_A^k\otimes\rho_B^k$. No quantum link is built this way, only shared instructions."
- **F:** "A density matrix is [[qc-separable-state|separable]] if it is a mixture of products, $\rho_{AB} = \sum_kp_k\,\rho_A^k\otimes\rho_B^k$ with $p_k \ge 0$, $\sum_kp_k = 1$ (Bergou Eq. 3.2). Local operations and classical communication (LOCC) can make any separable state but never an entangled one; building entanglement needs a shared quantum system."
- **Cap:** G "a coin picks which product to prepare" · F "$\rho = \sum_kp_k\,\rho_A^k\otimes\rho_B^k$: LOCC only"
- **Stage:** `split( tqR(SEP33) / mx(SEP33, {blocks:2}) )` — needs: two-qubit.
- **Claims:** `q10Sep33Grid` → $T_{zz}$ = 1, all other T = 0 · `q10Sep33R` → $r_A = r_B = (0, 0, -\tfrac13)$.
- **Terms:** `qc-mixture` (Q1), `qc-tensor-operator` (Q4). **Bridge:** `qc-l6-mixture`.
- **Fidelity:** `qc-tq-not-two-places`.

**`q10-separable:b2` [B]** (the coin box is separable; D1)
- **G:** "Chapter Q8's box, $\tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$, is separable too: both members are products. Its $z$ readings always agree, like $\Phi^+$ (notes, N&C: $\beta_{00}$; Bergou: $\Psi_+$). But its $x$ readings do not: $\langle X_1X_2\rangle = 0$ for the box, and $+1$ for $\Phi^+$."
- **F:** "The coin box $\tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$ is separable; $\Phi^+$ is entangled. They share the $z$ grid ($\langle Z_1Z_2\rangle = 1$) and the reduced state ($\rho_A = \tfrac12I$ for both), yet $\langle X_1X_2\rangle_{\rm box} = 0$ against $\langle X_1X_2\rangle_{\Phi^+} = 1$: the box carries only classical correlation."
- **Cap:** G "box: only the $zz$ cell; $\Phi^+$: $xx$, $yy$, $zz$" · F "box grid $\mathrm{diag}(0,0,1)$; $\Phi^+$ grid $\mathrm{diag}(1,-1,1)$"
- **Stage:** `split( tqR(BOX) / tq({bell:'Phi+'}) )` — needs: two-qubit.
- **Claims:** `q10BoxGrid` → diag(0, 0, 1) · `q10PhiGrid` → diag(1, −1, 1) · `q10BoxXX` → 0 · `q10PhiXX` → 1.
- **Fidelity:** `qc-tq-grid-signed`.

**`q10-separable:b3` [B]** (separable states are PPT; the Peres test; D1)
- **G:** "There is a quick test. Flip the direction of Bob's part only — the partial transpose — and look at the chances. A separable state stays a proper state: no negative chance. The box passes. $\Phi^+$ fails, with a chance of $-\tfrac12$: it is entangled."
- **F:** "The partial transpose $\rho^{T_B}$ of a separable state is still positive (Peres): separable $\Rightarrow$ PPT (Bergou §3.5 p. 41). The box's $\rho^{T_B}$ has eigenvalues $(\tfrac12, \tfrac12, 0, 0) \ge 0$; $\Phi^+$'s has $(\tfrac12, \tfrac12, \tfrac12, -\tfrac12)$, a negative eigenvalue, so $\Phi^+$ is entangled. For two qubits the test is exact (Chapter Q12)."
- **Cap:** G "flip Bob: box stays a state; $\Phi^+$ gets a $-\tfrac12$" · F "$\rho^{T_B}$: box $\ge 0$; $\Phi^+$ has $-\tfrac12$"
- **Stage:** `split( mx(BOX, {ptranspose:'B', spectrum:'bars'}) / mx({rho:{ket:{bell:'Phi+'}}}, {ptranspose:'B', spectrum:'bars'}) )` — needs: matrix-v2.
- **Claims:** `q10BoxPTeig` → (0.5, 0.5, 0, 0) · `q10PhiPTeig` → (0.5, 0.5, 0.5, −0.5) · `q10PhiNeg` → 0.5.
- **Fidelity:** `qc-matrix-not-a-space` (a matrix with a negative eigenvalue is no state).

**`q10-separable:b4` [C]** (which is entangled?)
- **Q G:** "Here is a pair with $\langle Z_1Z_2\rangle = 1$ and $\langle X_1X_2\rangle = 0$. Is it entangled?"
- **Q F:** "A two-qubit state has $\langle Z_1Z_2\rangle = 1$, $\langle X_1X_2\rangle = \langle Y_1Y_2\rangle = 0$. Entangled or separable?"
- **Reveal G:** "Separable. Those numbers are the coin box, a mixture of $|00\rangle$ and $|11\rangle$. Its partial transpose has no negative chance. Only the $x$ and $y$ correlations of $\Phi^+$ reveal entanglement."
- **Reveal F:** "Separable: it is the box, $\mathrm{diag}(1,0,0,1)/2$ in $zz$ only, and $\rho^{T_B} \ge 0$. Equal $z$ correlation with $\Phi^+$ is not enough; the missing $xx$, $yy$ cells are the tell."
- **Reveal cap:** G/F "box: PPT, so separable"
- **Stage:** question `tqR(BOX)`; reveal `mx(BOX, {ptranspose:'B', spectrum:'bars'})` — needs: two-qubit, matrix-v2.
- **Claims:** `q10BoxPTeig` → (0.5, 0.5, 0, 0).

### Unit `q10-no-signal` — No signalling: the partner learns nothing

**`q10-no-signal:b1` [B]** (the tempting idea)
- **G:** "Alice and Bob share $\Phi^+$ far apart. When Alice reads her qubit as 0, Bob's jumps to $|0\rangle$ at once. It looks as if Alice has sent a signal faster than light. Let us see why she has not."
- **F:** "Alice and Bob share $\Phi^+ = (|00\rangle + |11\rangle)/\sqrt2$. If Alice measures $z$ and gets 0, Bob's qubit collapses to $|0\rangle$ instantly, however far away (Bergou §3.2). The apparent faster-than-light influence is the puzzle this unit resolves."
- **Cap:** G "Alice reads 0, Bob jumps to $|0\rangle$" · F "$\Phi^+$: a $z$ reading on A fixes B"
- **Stage:** `tq({bell:'Phi+'}, {condition:{qubit:0, basis:'z', outcome:0}})` — needs: two-qubit.
- **Claims:** `q10CondZ0` → B's arrow $(0, 0, 1)$ (Bob is $|0\rangle$ given Alice's 0).
- **Terms:** `qc-bell-basis` (Q6), `qc-selective-measurement` (Q3).

**`q10-no-signal:b2` [B] · notation beat, `introduces: ['qc-no-signalling']`** (Bob's state does not move; D2)
- **G:** "But Bob cannot see the jump without Alice's call. Over many runs her outcome is 0 or 1 by chance, so Bob's qubit is half $|0\rangle$ and half $|1\rangle$: the centre of the ball, $\tfrac12I$. That is exactly what Bob has with no measurement at all. [[qc-no-signalling|No signal]] gets through."
- **F:** "Bob's state is his [[qc-reduced-density-matrix|reduced density matrix]] $\rho_B = \mathrm{Tr}_A\rho$. For $\Phi^+$, $\rho_B = \tfrac12I$ whether or not Alice measures, and in whatever basis: averaging her outcomes gives back $\tfrac12I$ (Bergou Eqs. 3.5–3.7). This is the [[qc-no-signalling|no-signalling principle]]: a local operation cannot change the partner's reduced state, so no message passes."
- **Cap:** G "averaged over Alice's outcomes: Bob is $\tfrac12I$" · F "$\rho_B = \tfrac12I$, measured or not"
- **Stage:** `split( ball('oven') / tq({bell:'Phi+'}, {condition:{qubit:0, basis:'z', outcome:0}}) )`. The ball shows Bob's unconditioned $\tfrac12I$; the pair shows one conditioned branch. — needs: two-qubit.
- **Claims:** `q10BobNoMeas` → $r_B = (0, 0, 0)$ · `q10BobAfterZ` → $r_B = (0, 0, 0)$ (averaged) · `q10BobAfterX` → $(0,0,0)$.
- **Terms:** `qc-reduced-density-matrix` (Q9).
- **Fidelity:** `qc-tq-local-arrows`.

**`q10-no-signal:b3` [B]** (any basis, same answer)
- **G:** "It makes no difference which way Alice turns her analyser. Read along $x$, or $y$, or any tilt: averaged over her two outcomes, Bob's arrow is still the centre. So Bob can run no experiment that tells him whether — or how — Alice measured."
- **F:** "For any measurement basis Alice chooses, $\sum_j p_j\,\rho_B^{(j)} = \mathrm{Tr}_A\rho = \tfrac12I$ (the outcomes $j$ are a resolution of the identity on A). Bob's statistics are independent of Alice's setting, so no protocol lets him detect her choice: faster-than-light signalling is impossible with shared entanglement alone."
- **Cap:** G "$x$, $y$ or $z$ on A: Bob stays at the centre" · F "every basis: $\rho_B = \tfrac12I$"
- **Stage:** `split( tq({bell:'Phi+'}, {condition:{qubit:0, basis:'x', outcome:0}}) / tq({bell:'Phi+'}, {condition:{qubit:0, basis:'x', outcome:1}}) )`. Both branches, so the average is visibly the centre. — needs: two-qubit.
- **Claims:** `q10CondX0` → B arrow $(1, 0, 0)$ · `q10CondX1` → B arrow $(-1, 0, 0)$ · `q10BobAfterX` → average $(0,0,0)$.

**`q10-no-signal:b4` [C]** (Bergou's interference scheme)
- **Q G:** "Bergou tries harder: Bob sends his qubit through a phase gate and a Hadamard, hoping Alice's choice changes his interference pattern. Does it?"
- **Q F:** "In Bergou's scheme Bob applies a phase gate then H and measures; can Alice's decision to measure (or not) change Bob's fringe visibility (Bergou Eqs. 3.5–3.7)?"
- **Reveal G:** "No. With or without Alice's measurement Bob's reduced state is $\tfrac12I$, so his two outcomes stay 50/50. The interference he hoped for is washed out exactly because Alice cannot choose her result."
- **Reveal F:** "No. Both with and without Alice's measurement $\rho_B = \tfrac12I$, so $p_0 = p_1 = \tfrac12$ after any gates: the fringe vanishes. Bergou notes such schemes are 'rediscovered and submitted to journals'; the fix is always that Alice cannot control her outcome."
- **Reveal cap:** G/F "phase gate and H: still 50/50"
- **Stage:** question `tqR({rho:{ket:{bell:'Phi+'}}})`; reveal `ball('oven')`.
- **Claims:** `q10BobFringe` → 0.5, 0.5.

### Unit `q10-hidden` — Instruction sets: a classical story

**`q10-hidden:b1` [B] · notation beat, `introduces: ['qc-lhv-model']`** (the instruction-set picture)
- **G:** "Suppose each particle carries a card fixing, in advance, the answer to every reading Alice or Bob might choose. Alice can read $a_1$ or $a_2$, Bob $b_1$ or $b_2$, each giving $\pm1$. A [[qc-lhv-model|local hidden-variable model]] says the source hands out such cards with fixed chances."
- **F:** "A [[qc-lhv-model|local hidden-variable model]] assigns definite values $a_1, a_2, b_1, b_2 = \pm1$ to every measurement, drawn from a joint distribution $P(a_1, a_2, b_1, b_2)$ (Bergou Eqs. 3.8; N&C §2.6). 'Local' means Alice's card does not depend on Bob's choice. This is Chapter Q7's predetermined-values idea, now for correlations over many runs."
- **Cap:** G "a card: four answers, fixed in advance" · F "$P(a_1, a_2, b_1, b_2)$, each value $\pm1$"
- **Stage:** `tab(['a1','a2','b1','b2'], {values:{x:[1,-1,-1,-1]}})` — one instruction card. — needs: matrix-v2.
- **Claims:** `q10Card` → (1, −1, −1, −1) (one example card).
- **Terms:** `qc-hidden-values` (Q7, link-back), `qc-local-realism` (Q7). **Bridge:** `qc-l1-logic`.

**`q10-hidden:b2` [B]** (the combination is always ±2; D3)
- **G:** "Form the combination $X = a_1(b_1 + b_2) + a_2(b_1 - b_2)$. Since $b_1$ and $b_2$ are each $\pm1$, one bracket is $\pm2$ and the other is 0. So $X$ is $+2$ or $-2$ for every card, whatever the answers."
- **F:** "Define $X = a_1(b_1 + b_2) + a_2(b_1 - b_2)$. If $b_1 = b_2$ then $b_1 - b_2 = 0$ and $X = a_1(b_1 + b_2) = \pm2$; if $b_1 = -b_2$ then $X = a_2(b_1 - b_2) = \pm2$ (Bergou Eq. 3.9). Every one of the 16 cards gives $|X| = 2$."
- **Cap:** G "one bracket is 0, the other $\pm2$" · F "$X = \pm2$ for all 16 cards"
- **Stage:** `split( tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,1,1,1]}}) / tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,-1,1,-1]}}) )`. Two cards, each summing (with the −) to $\pm2$. — needs: matrix-v2.
- **Claims:** `q10XRange` → {−2, +2} (the only values over 16 cards) · `q10XCount` → 16 of 16 have $|X| = 2$.

**`q10-hidden:b3` [B]** (link to Mermin)
- **G:** "This is Chapter Q7's idea again, but softer. Mermin's cards failed a single run of each of four settings. Here the cards never fail one run — they fail only on average, over many runs. That is why this test needs statistics."
- **F:** "Chapter Q7's Mermin argument refuted local realism with one run of each of four GHZ settings, because each prediction was certain. Here no single run is impossible for a card; the clash appears only in the averaged score S (next unit). The CHSH test is statistical, the GHZ test is not."
- **Cap:** G/F "Mermin: one run; CHSH: many runs"
- **Stage:** `split( tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,-1], y:[1,1,-1]}}) / tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,1,1,-1]}}) )`. Q7's Mermin card beside a CHSH card. — needs: matrix-v2.
- **Claims:** `q10XRange` → {−2, +2}.
- **Terms:** `qc-mermin-argument` (Q7, link-back).

### Unit `q10-chsh` — The CHSH inequality: a classical ceiling

**`q10-chsh:b1` [B] · notation beat, `introduces: ['qc-correlator']`** (the correlator)
- **G:** "To score the link, run the experiment many times and average the product of the two readings. This average is the [[qc-correlator|correlator]] $\langle a\,b\rangle$: $+1$ if the two readings always agree, $-1$ if they always disagree, 0 if they are unrelated. (This is Foundations' correlator.)"
- **F:** "The [[qc-correlator|correlator]] of two $\pm1$ readings is $\langle ab\rangle = \sum_{a,b}ab\,P(a, b)$, the average of their product (Bergou Eq. 3.8; the classical correlator of Chapter F2). Quantum-mechanically $\langle a\otimes b\rangle = \mathrm{Tr}(\rho\,a\otimes b)$, the correlation-grid entries of Chapter Q6. Here S is the CHSH value, not Chapter Q9's entropy $S(\rho)$."
- **Cap:** G "$\langle ab\rangle$: $+1$ agree, $-1$ disagree, 0 unrelated" · F "$\langle ab\rangle = \sum ab\,P(a, b)$"
- **Stage:** `split( tq({bell:'Phi+'}, {highlight:['zz']}) / mx(BOX, {highlight:[[0,0],[3,3]]}) )` — needs: two-qubit.
- **Claims:** `q10PhiZZ` → 1 · `q10BoxXX` → 0.
- **Terms:** `qc-correlation-grid` (Q6). **Rosetta:** "S is the CHSH value here; Chapter Q9's $S(\rho)$ is the entropy."

**`q10-chsh:b2` [B] · notation beat, `introduces: ['qc-chsh']`** (the CHSH value and its ceiling; D4)
- **G:** "Add four correlators in the special pattern $S = \langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle - \langle a_2b_2\rangle$: the [[qc-chsh|CHSH value]]. Averaging the last unit's $X = \pm2$ over the cards, $S$ can never pass 2. This ceiling, $|S| \le 2$, is a Bell inequality."
- **F:** "The [[qc-chsh|CHSH value]] is $S = \langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle - \langle a_2b_2\rangle$. Since each card has $X = \pm2$, $|S| = |\sum P(\cdots)X| \le \sum P(\cdots)\cdot2 = 2$ (Bergou Eq. 3.10): the CHSH (Clauser–Horne–Shimony–Holt) inequality $|S| \le 2$ holds for every local hidden-variable model."
- **Cap:** G "average of $\pm2$: $|S| \le 2$" · F "$|S| \le 2$ for any classical story"
- **Stage:** `plot({curve:{fn:'chshClassicalBound'}, bands:[{yFrom:-2, yTo:2, label:'classical'}], yLines:[{y:2}, {y:-2}]})` — needs: plot.
- **Claims:** `q10ClassicalMax` → 2.

### Unit `q10-violation` — Breaking the ceiling: $2\sqrt2$

**`q10-violation:b1` [B]** (the quantum score; D5)
- **G:** "Quantum mechanics breaks the ceiling. Take the pair $(|00\rangle + e^{i45°}|11\rangle)/\sqrt2$ and let Alice read $\sigma_x$ or $\sigma_y$, Bob the same. Three correlators are $+0.707$ and one is $-0.707$, so $S = 2.828 = 2\sqrt2$. No card can do this."
- **F:** "For $|\chi\rangle = (|00\rangle + e^{i\pi/4}|11\rangle)/\sqrt2$ with $a_1 = \sigma_x$, $a_2 = \sigma_y$, $b_1 = \sigma_x$, $b_2 = \sigma_y$: $\langle a_1b_1\rangle = \langle a_1b_2\rangle = \langle a_2b_1\rangle = \tfrac{\sqrt2}2$ and $\langle a_2b_2\rangle = -\tfrac{\sqrt2}2$ (Bergou Eqs. 3.11–3.13), so $S = 2\sqrt2 \approx 2.828 > 2$: the Bell inequality is violated."
- **Cap:** G "three $+0.707$, one $-0.707$: $S = 2.828$" · F "$S = 2\sqrt2$, above the classical 2"
- **Stage:** `tqAx(CHI(45), AX, BX, {grid:'T'})` — needs: two-qubit + E2.
- **Claims:** `q10ChiCorr` → (0.707, 0.707, 0.707, −0.707) · `q10ChiS` → 2.828.
- **Terms:** `qc-bell-basis` (Q6), `qc-pauli-matrices` (Q3).
- **Fidelity:** `qc-tq-grid-signed`.

**`q10-violation:b2` [B]** (the CHSH dial; D5)
- **G:** "Turn the phase of the pair from 0° up to 90°. The score rises from 2, swells to $2\sqrt2$ at 45°, and falls back to 2. The whole bulge above 2 is forbidden to any classical story: $S(\delta) = 2\cos\delta + 2\sin\delta$."
- **F:** "Sweeping the phase $\delta$ of $|\chi(\delta)\rangle$ with the fixed $x, y$ settings gives $S(\delta) = 2\cos\delta + 2\sin\delta$: $S = 2$ at $\delta = 0°$ and $90°$, peaking at $2\sqrt2$ when $\delta = 45°$. Every point of the curve above the line $S = 2$ is a region no local hidden-variable model can reach."
- **Cap:** G "the dial: $S$ swells to $2\sqrt2$ at 45°" · F "$S(\delta) = 2\cos\delta + 2\sin\delta$"
- **Stage:** `plot({curve:{fn:'chshVsPhase', x:{from:0, to:90}}, bands:[{yFrom:-2, yTo:2, label:'classical'}], markers:[{x:45, label:'2√2'}], yLines:[{y:2}, {y:2.828, label:'Tsirelson'}]})` — needs: plot + E2.
- **Claims:** `q10DialAt0` → 2 · `q10DialAt45` → 2.828 · `q10DialAt90` → 2.
- **Fidelity:** `qc-plot-engine-curve`.

**`q10-violation:b3` [B]** (a product state never beats 2; D6)
- **G:** "A product state cannot win. If each qubit answers on its own, the correlators factor, and the same algebra as the cards gives $S \le 2$. Try $|+x\rangle|+x\rangle$: its score is only 1. So beating 2 proves the pair is entangled."
- **F:** "For a product state $\langle a_ib_j\rangle = \langle a_i\rangle\langle b_j\rangle$, so with $x_i = \langle a_i\rangle$, $y_j = \langle b_j\rangle \in [-1, 1]$, $S = x_1(y_1 + y_2) + x_2(y_1 - y_2) \le 2$ (Bergou Eqs. 3.14–3.16); this extends to separable states by convexity. $|+x\rangle|+x\rangle$ gives $S = 1$. A violation therefore certifies entanglement."
- **Cap:** G "$|+x\rangle|+x\rangle$: $S = 1$, below 2" · F "product (and separable): $S \le 2$"
- **Stage:** `split( tqAx(PRODX, AX, BX, {grid:'T'}) / plot({curve:{fn:'chshVsPhase', x:{from:0, to:90}}, bands:[{yFrom:-2, yTo:2}], markers:[{x:0, label:'product'}]}) )` — needs: two-qubit + E2 + plot.
- **Claims:** `q10ProdS` → 1.
- **Fidelity:** `qc-tq-local-arrows`.

**`q10-violation:b4` [B]** (the Tsirelson bound; D7)
- **G:** "How high can quantum mechanics go? Build the operator $C = a_1b_1 + a_1b_2 + a_2b_1 - a_2b_2$ and square it. The square is $4$ plus a correction that can reach $4$ more, so $C^2$ is at most $8$, and $S$ at most $\sqrt8 = 2\sqrt2$. Quantum mechanics stops exactly there."
- **F:** "With $a_j^2 = b_j^2 = I$, $C^2 = 4I + [a_1, a_2]\otimes[b_1, b_2]$; since $\|[a_1, a_2]\| \le 2$, $C^2 \le 8I$, so $\|C\| \le 2\sqrt2$ (Bergou Eq. 3.17, the second square $(b_1 - b_2)/\sqrt2$ corrected, erratum B7). This is the Tsirelson bound: quantum mechanics violates CHSH but only up to $2\sqrt2$."
- **Cap:** G "$C^2 \le 8$, so $S \le 2\sqrt2$" · F "$C^2 = 4I + [a_1, a_2]\otimes[b_1, b_2] \le 8I$"
- **Stage:** `mx(prod(C, C), {spectrum:'bars'})` — needs: matrix-v2.
- **Claims:** `q10Ceig` → (−2.828, 0, 0, 2.828) · `q10C2eig` → (0, 0, 8, 8) · `q10Tsirelson` → 2.828.
- **Fidelity:** the spectrum flag (eigenvalues read off the engine).

**`q10-violation:b5` [B]** (N&C's singlet version)
- **G:** "There is more than one way to break the ceiling. Nielsen and Chuang use the singlet $\Psi^- = (|01\rangle - |10\rangle)/\sqrt2$ and tilted readings on Bob: $b_1 = -(Z + X)/\sqrt2$, $b_2 = (Z - X)/\sqrt2$. The four correlators again give $S = 2\sqrt2$. Same ceiling, different pair and settings."
- **F:** "N&C take $|\Psi^-\rangle$ with $Q = Z_1$, $R = X_1$, $S = -(Z_2 + X_2)/\sqrt2$, $T = (Z_2 - X_2)/\sqrt2$: $\langle QS\rangle = \langle RS\rangle = \langle RT\rangle = \tfrac1{\sqrt2}$ and $\langle QT\rangle = -\tfrac1{\sqrt2}$, so $S = 2\sqrt2$ (N&C Eqs. 2.227–2.230). The violation does not depend on Bergou's particular $\chi$ or its $x, y$ settings."
- **Cap:** G "the singlet, tilted readings: $S = 2.828$ again" · F "N&C singlet: $S = 2\sqrt2$"
- **Stage:** `tqAx({bell:'Psi-'}, ['+z','+x'], [{thetaDeg:135, phiDeg:180}, {thetaDeg:45, phiDeg:180}], {grid:'T'})` (Bob's axes are $-(Z+X)/\sqrt2$ and $(Z-X)/\sqrt2$) — needs: two-qubit + E2.
- **Claims:** `q10NCcorr` → (0.707, 0.707, 0.707, −0.707) · `q10NCS` → 2.828.
- **Terms:** `qc-singlet` (Q6, link-back).

**`q10-violation:b6` [C]** (the PR box)
- **Q G:** "Could a stronger-than-quantum link exist, scoring the maximum $S = 4$, while still sending no signal?"
- **Q F:** "Is there a no-signalling correlation that violates CHSH more strongly than quantum mechanics — up to the algebraic maximum $S = 4$ (Bergou pp. 36)?"
- **Reveal G:** "Yes, on paper: the Popescu–Rohrlich box scores $S = 4$ and still lets no message through. But nature has never shown one; real correlations stop at the quantum $2\sqrt2$."
- **Reveal F:** "Yes mathematically: Popescu and Rohrlich found no-signalling distributions with $S = 4$, the algebraic maximum (Bergou p. 36). Such PR boxes respect relativity yet exceed Tsirelson's $2\sqrt2$; they do not occur in nature, so quantum mechanics sits strictly between the classical 2 and the no-signalling 4."
- **Reveal cap:** G/F "PR box: $S = 4$, still no signal"
- **Stage:** question `plot({curve:{fn:'chshVsPhase', x:{from:0, to:90}}, yLines:[{y:2, label:'classical'}, {y:2.828, label:'Tsirelson'}, {y:4, label:'PR box'}]})`; reveal the same with the $S = 4$ line marked. — needs: plot.
- **Claims:** `q10PRbox` → 4.
- **Terms:** `qc-no-signalling` (Unit 10.2, link-back).

### 1.7 Claim ledger (engine call → value; numpy route)

Every key is computed in `Q10.values.ts` from the E2 calls below; the numpy twin (`q1011plan-numpy.py`) follows the
last column. Engine functions marked **(E2)** are not built yet (§9.1). The plan prints the value for review only.

| Key | Engine call (`Q10.values.ts`) | Value | numpy route |
|---|---|---|---|
| `q10Sep33Grid`, `q10Sep33R` | `correlationTensor(SEP33)` **(E2)**; `reducedBloch` | $T_{zz}$=1 else 0; $r = (0,0,-\tfrac13)$ | $\mathrm{Tr}(\rho\,\sigma_i\sigma_j)$; `einsum` partial trace |
| `q10BoxGrid`, `q10BoxXX`, `q10PhiGrid`, `q10PhiXX` | `correlationTensor` **(E2)**; `correlator(ρ, X, X)` **(E2)** | box diag(0,0,1), $\langle XX\rangle$=0; Φ⁺ diag(1,−1,1), $\langle XX\rangle$=1 | explicit traces |
| `q10BoxPTeig`, `q10PhiPTeig`, `q10PhiNeg` | `eigh(ptranspose(ρ, [1]))`; `negativity` **(E2)** | (½,½,0,0); (½,½,½,−½); 0.5 | `eigvalsh` of $\rho^{T_B}$ |
| `q10CondZ0`, `q10CondX0`, `q10CondX1` | `reducedBloch(postMeasure(Φ⁺, …))` | (0,0,1); (1,0,0); (−1,0,0) | projector on A, reduced Bloch |
| `q10BobNoMeas`, `q10BobAfterZ`, `q10BobAfterX`, `q10BobFringe` | `reducedBloch(partialTrace(ρ, [0]))`; averaged post-states | (0,0,0) each; 0.5, 0.5 | $\mathrm{Tr}_A$; weighted sum of branches |
| `q10Card`, `q10XRange`, `q10XCount` | `lhvChsh()` **(E2)** (the 16 instruction sets and their X) | (1,−1,−1,−1); {−2,+2}; 16/16 | `itertools.product` over $\pm1^4$ |
| `q10PhiZZ`, `q10ClassicalMax` | `correlator(Φ⁺, Z, Z)` **(E2)**; `lhvChsh().max` **(E2)** | 1; 2 | trace; max over cards |
| `q10ChiCorr`, `q10ChiS` | `correlator(χ, σ_i, σ_j)` **(E2)**; `chsh(χ, X, Y, X, Y)` **(E2)** | (0.707, 0.707, 0.707, −0.707); 2.828 | $\langle\chi|\sigma_i\sigma_j|\chi\rangle$; the operator sum |
| `q10DialAt0`, `q10DialAt45`, `q10DialAt90` | `chsh(CHI(δ), X, Y, X, Y)` **(E2)** at δ = 0, 45, 90 | 2; 2.828; 2 | $2\cos\delta + 2\sin\delta$ |
| `q10ProdS` | `chsh(\|+x⟩\|+x⟩, X, Y, X, Y)` **(E2)** | 1 | product correlators factor |
| `q10Ceig`, `q10C2eig`, `q10Tsirelson` | `eigh(C)`; `eigh(matmul(C, C))`; `chshMaxHorodecki` **(E2)** | (−2.828, 0, 0, 2.828); (0, 0, 8, 8); 2.828 | `eigvalsh` of $C$, $C^2$ |
| `q10NCcorr`, `q10NCS` | `correlator(Ψ⁻, …)`; `chsh(Ψ⁻, Z, X, b₁, b₂)` **(E2)** | (0.707, 0.707, 0.707, −0.707); 2.828 | N&C's $Q, R, S, T$ settings |
| `q10PRbox` | `prBox().S` **(E2)** | 4 | the PR distribution, $S = 4$ |

The two routes agree to 6 decimals once E2 lands (`q1011plan-numpy.py`). Where a value is an exact surd ($2\sqrt2$) the
values file stores it from the engine and renders "2.828"; the matrix TeX carries the exact $2\sqrt2$.

## 2. Derivations

Each step is `tex` — `why` — **view** (the exact `StageState`, in the shorthand above) — *viewCaption*. A step without a
view inherits the previous one in its list. Every list has ≥ 2 distinct views, and every view uses a kind its unit's
beats show. The last `tex` of each list ends on the result.

**D1 · `q10-separable:b3` · result `\rho^{T_B} \ge 0 \text{ (box)},\quad \lambda_{\min} = -\tfrac12\ (\Phi^+)`** (Bergou §3.1, §3.5)
- Ground (4 views):
  1. `\rho_{\rm box} = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)` — A coin picks $|00\rangle$ or $|11\rangle$: a mixture of products. **view** `tqR(BOX)` · *the box: only the $zz$ cell*
  2. `\langle X_1X_2\rangle_{\rm box} = 0,\quad \langle X_1X_2\rangle_{\Phi^+} = 1` — The box has no $x$ correlation; $\Phi^+$ does. **view** `tq({bell:'Phi+'})` · *$\Phi^+$: $xx$, $yy$, $zz$ all set*
  3. `\rho_{\rm box}^{T_B} = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)` — Transposing Bob's index moves nothing here: still a state. **view** `mx(BOX, {ptranspose:'B', spectrum:'bars'})` · *box $\rho^{T_B}$: eigenvalues $(\tfrac12, \tfrac12, 0, 0)$*
  4. `\rho_{\Phi^+}^{T_B}\text{ has eigenvalues }(\tfrac12, \tfrac12, \tfrac12, -\tfrac12)` — The same flip on $\Phi^+$ swaps the $|01\rangle\langle10|$ corner in, giving a negative eigenvalue. **view** `mx({rho:{ket:{bell:'Phi+'}}}, {ptranspose:'B', spectrum:'bars'})` · *$\Phi^+$ $\rho^{T_B}$: a $-\tfrac12$*
  5. `\rho^{T_B} \ge 0 \text{ (box)},\quad \lambda_{\min} = -\tfrac12\ (\Phi^+)` — A negative chance after the flip means entangled; the box passes, $\Phi^+$ fails.
- Formal (2 views):
  1. `\rho^{T_B}_{\rm box} \ge 0` — Separable $\Rightarrow$ PPT (Bergou §3.5): the box's partial transpose is positive. **view** `mx(BOX, {ptranspose:'B', spectrum:'bars'})`
  2. `\rho^{T_B} \ge 0 \text{ (box)},\quad \lambda_{\min} = -\tfrac12\ (\Phi^+)` — $\Phi^+$'s is not positive, so $\Phi^+$ is entangled (the test is exact for two qubits). **view** `mx({rho:{ket:{bell:'Phi+'}}}, {ptranspose:'B', spectrum:'bars'})`
- Check: `q10BoxGrid`, `q10PhiXX`, `q10BoxPTeig`, `q10PhiPTeig`, `q10PhiNeg`. Needs: two-qubit, matrix-v2.

**D2 · `q10-no-signal:b2` · result `\rho_B = \mathrm{Tr}_A\rho = \tfrac12 I,\text{ measured or not}`** (Bergou §3.2; N&C §2.4.3)
- Ground (3 views):
  1. `\Phi^+ = \tfrac1{\sqrt2}(|00\rangle + |11\rangle)` — The shared pair, before anyone measures. **view** `tq({bell:'Phi+'})` · *the pair $\Phi^+$*
  2. `\text{Alice reads }0 \Rightarrow \text{Bob }|0\rangle;\ \text{reads }1 \Rightarrow \text{Bob }|1\rangle` — Each outcome fixes Bob's qubit. **view** `tq({bell:'Phi+'}, {condition:{qubit:0, basis:'z', outcome:0}})` · *given Alice's 0: Bob at the north pole*
  3. `\rho_B = \tfrac12|0\rangle\langle0| + \tfrac12|1\rangle\langle1| = \tfrac12 I` — Averaged over her 50/50 outcomes, Bob is the centre of the ball. **view** `ball('oven')` · *Bob: $\tfrac12 I$, the centre*
  4. `\rho_B = \tfrac12 I,\text{ measured or not}` — With no measurement Bob is also $\tfrac12 I$: no signal.
- Formal (2 views):
  1. `\rho_B = \mathrm{Tr}_A|\Phi^+\rangle\langle\Phi^+| = \tfrac12 I` — The reduced state of $\Phi^+$ (Chapter Q9). **view** `ball('oven')`
  2. `\rho_B = \tfrac12 I,\text{ measured or not}` — $\sum_j p_j\rho_B^{(j)} = \mathrm{Tr}_A\rho$ for any basis, so Alice's choice is invisible to Bob. **view** `tq({bell:'Phi+'}, {condition:{qubit:0, basis:'x', outcome:0}})`
- Check: `q10BobNoMeas`, `q10CondZ0`, `q10BobAfterX`. Needs: two-qubit.

**D3 · `q10-hidden:b2` · result `X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \pm2`** (Bergou Eq. 3.9)
- Ground (3 views):
  1. `a_1, a_2, b_1, b_2 = \pm1` — Each card fixes four $\pm1$ answers. **view** `tab(['a1','a2','b1','b2'], {values:{x:[1,-1,-1,-1]}})` · *one card*
  2. `b_1 = b_2:\ X = a_1(b_1 + b_2) = \pm2,\ a_2\text{ term }0` — When Bob's two answers agree, the second bracket vanishes. **view** `tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,1,1,1]}})` · *card with $b_1 = b_2$: $X = +2$*
  3. `b_1 = -b_2:\ X = a_2(b_1 - b_2) = \pm2,\ a_1\text{ term }0` — When they differ, the first bracket vanishes instead. **view** `tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,-1,1,-1]}})` · *card with $b_1 = -b_2$: $X = -2$*
  4. `X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \pm2` — Either way $|X| = 2$, for all 16 cards.
- Formal (2 views):
  1. `X = a_1(b_1 + b_2) + a_2(b_1 - b_2)` — One of $b_1 \pm b_2$ is 0 and the other $\pm2$ (Bergou Eq. 3.9). **view** `tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,1,1,1]}})`
  2. `X = \pm2` — So $|X| = 2$ for every one of the 16 cards. **view** `tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,-1,1,-1]}})`
- Check: `q10XRange`, `q10XCount`. Needs: matrix-v2.

**D4 · `q10-chsh:b2` · result `|S| = |\langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle - \langle a_2b_2\rangle| \le 2`** (Bergou Eq. 3.10)
- Ground (3 views):
  1. `S = \langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle - \langle a_2b_2\rangle` — The CHSH score: four averaged products. **view** `tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,1,1,-1]}})` · *the four correlators*
  2. `S = \sum P(a_1, a_2, b_1, b_2)\,X` — Each card contributes its $X$, weighted by its chance. **view** `tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,1,1,1]}})` · *one card's $X = +2$*
  3. `|S| \le \sum P\cdot2 = 2` — Since every $X = \pm2$ and the chances sum to 1. **view** `plot({curve:{fn:'chshClassicalBound'}, bands:[{yFrom:-2, yTo:2, label:'classical'}]})` · *the allowed band $|S| \le 2$*
  4. `|S| \le 2` — The CHSH inequality, for every local hidden-variable model.
- Formal (2 views):
  1. `S = \sum P(a_1, a_2, b_1, b_2)\,X,\quad X = \pm2` — The averaged CHSH quantity (Bergou Eq. 3.10). **view** `tab(['a1·b1','a1·b2','a2·b1','a2·b2'], {values:{x:[1,1,1,1]}})`
  2. `|S| \le 2` — A convex average of $\pm2$ cannot leave $[-2, 2]$. **view** `plot({curve:{fn:'chshClassicalBound'}, bands:[{yFrom:-2, yTo:2}]})`
- Check: `q10ClassicalMax`. Needs: matrix-v2, plot.

**D5 · `q10-violation:b1` · result `S_{\chi} = 2\sqrt2 > 2`** (Bergou Eqs. 3.11–3.13)
- Ground (3 views):
  1. `|\chi\rangle = \tfrac1{\sqrt2}(|00\rangle + e^{i\pi/4}|11\rangle)` — An entangled pair with a quarter-turn phase. **view** `tqAx(CHI(45), AX, BX, {grid:'T'})` · *$\chi$ with $x, y$ axes on each ball*
  2. `\langle\sigma_x\sigma_x\rangle = \langle\sigma_x\sigma_y\rangle = \langle\sigma_y\sigma_x\rangle = \tfrac{\sqrt2}2` — Three of the four correlators are $+0.707$. **view** `tqAx(CHI(45), AX, BX, {grid:'T', highlight:['xx','xy','yx']})` · *three cells at $+0.707$*
  3. `\langle\sigma_y\sigma_y\rangle = -\tfrac{\sqrt2}2` — The fourth, entering with a minus, is $-0.707$. **view** `tqAx(CHI(45), AX, BX, {grid:'T', highlight:['yy']})` · *the $yy$ cell at $-0.707$*
  4. `S_{\chi} = 3\cdot\tfrac{\sqrt2}2 - (-\tfrac{\sqrt2}2) = 2\sqrt2` — Four correlators give $2\sqrt2 \approx 2.828$.
  5. `S_{\chi} = 2\sqrt2 > 2` — Above the classical ceiling: the Bell inequality is violated. **view** `plot({curve:{fn:'chshVsPhase', x:{from:0, to:90}}, markers:[{x:45}], yLines:[{y:2}]})` · *the dial at 45°, above the line*
- Formal (2 views):
  1. `\langle a_ib_j\rangle:\ \tfrac{\sqrt2}2, \tfrac{\sqrt2}2, \tfrac{\sqrt2}2, -\tfrac{\sqrt2}2` — The four correlators of $\chi$ with $x, y$ settings (Bergou Eq. 3.13). **view** `tqAx(CHI(45), AX, BX, {grid:'T'})`
  2. `S_{\chi} = 2\sqrt2 > 2` — The CHSH value exceeds 2. **view** `plot({curve:{fn:'chshVsPhase', x:{from:0, to:90}}, markers:[{x:45}], yLines:[{y:2}]})`
- Check: `q10ChiCorr`, `q10ChiS`. Needs: two-qubit + E2, plot.

**D6 · `q10-violation:b3` · result `S_{\rm product} \le 2`** (Bergou Eqs. 3.14–3.16)
- Ground (3 views):
  1. `\langle a_ib_j\rangle = \langle a_i\rangle\langle b_j\rangle = x_iy_j` — On a product state the averages factor. **view** `tqAx(PRODX, AX, BX, {grid:'T'})` · *$|+x\rangle|+x\rangle$: the grid is an outer product of arrows*
  2. `S = x_1(y_1 + y_2) + x_2(y_1 - y_2)` — The same algebra as the instruction cards. **view** `tqAx(PRODX, AX, BX, {grid:'T', highlight:['xx']})` · *only $\langle XX\rangle = 1$ is nonzero here*
  3. `|S| \le |x_1||y_1 + y_2| + |x_2||y_1 - y_2| \le 2` — With $|x_i|, |y_j| \le 1$, the bound is 2. **view** `plot({curve:{fn:'chshVsPhase', x:{from:0, to:90}}, markers:[{x:0, label:'product'}], bands:[{yFrom:-2, yTo:2}]})` · *$|+x\rangle|+x\rangle$ scores 1, inside the band*
  4. `S_{\rm product} \le 2` — A product (and, by convexity, any separable) state never beats 2.
- Formal (2 views):
  1. `S = x_1(y_1 + y_2) + x_2(y_1 - y_2),\quad |x_i|, |y_j| \le 1` — Product correlators factor (Bergou Eq. 3.14). **view** `tqAx(PRODX, AX, BX, {grid:'T'})`
  2. `S_{\rm product} \le 2` — So a CHSH violation certifies entanglement. **view** `plot({curve:{fn:'chshVsPhase', x:{from:0, to:90}}, markers:[{x:0}], bands:[{yFrom:-2, yTo:2}]})`
- Check: `q10ProdS`. Needs: two-qubit + E2, plot.

**D7 · `q10-violation:b4` · result `\|C\| \le 2\sqrt2`** (Bergou Eq. 3.17, erratum B7)
- Ground (3 views):
  1. `C = a_1b_1 + a_1b_2 + a_2b_1 - a_2b_2` — The CHSH operator, a sum of Pauli strings. **view** `mx(C)` · *$C = XX + XY + YX - YY$*
  2. `C^2 = 4I + [a_1, a_2]\otimes[b_1, b_2]` — Squaring: the $a_j^2 = b_j^2 = I$ terms give $4I$, the cross terms a commutator product. **view** `mx(prod(C, C))` · *$C^2$: $4I$ plus a correction*
  3. `\|[a_1, a_2]\| \le 2 \Rightarrow C^2 \le 8I` — A commutator of $\pm1$ observables is at most 2 in size, so $C^2$ peaks at 8. **view** `mx(prod(C, C), {spectrum:'bars'})` · *$C^2$ eigenvalues $(0, 0, 8, 8)$*
  4. `\|C\| \le \sqrt8 = 2\sqrt2` — The quantum score cannot pass $2\sqrt2$: Tsirelson's bound.
- Formal (2 views):
  1. `C^2 = 4I + [a_1, a_2]\otimes[b_1, b_2] \le 8I` — With $a_j^2 = b_j^2 = I$ and $\|[a_1, a_2]\| \le 2$ (Bergou Eq. 3.17). **view** `mx(prod(C, C), {spectrum:'bars'})`
  2. `\|C\| \le 2\sqrt2` — So $|S| = |\langle C\rangle| \le 2\sqrt2$, the Tsirelson bound. **view** `mx(C, {spectrum:'bars'})`
- Check: `q10Ceig`, `q10C2eig`, `q10Tsirelson`. Needs: matrix-v2.

**View counts** (distinct views, Ground / Formal): D1 4/2 · D2 3/2 · D3 3/2 · D4 3/2 · D5 4/2 · D6 3/2 · D7 3/2. Ground
steps ≥ Formal steps in every pair. Every view's kind is on its unit's stage (lists above). D1, D7 need `matrix` v2;
D1, D2 need `two-qubit`; D3, D4 need the `tableau`; D4, D5, D6 need `plot`; D5, D6 need E2's `chsh` readout.

## 3. Try-it widget per unit

No widget scores a CHSH experiment yet (§9.3 W4, deferred). Each unit uses an existing widget with prop forms already
used in 709 (Q3's `bloch`, Q1's `sg-lab`, Q5's `phase-dial`), chosen to rehearse that unit's idea.

| Unit | Widget spec | Why this one |
|---|---|---|
| `q10-separable` | `{kind:'bloch', props:{theta:90, phi:0, editable:true, landmarks:true}}` | Each product member sits on the surface; a separable state mixes such points, so its parts are ordinary pure states. |
| `q10-no-signal` | `{kind:'bloch', props:{theta:60, phi:45, editable:true, measure:'z'}}` | Reading one qubit of a pure state is a 50/50 coin from the partner's side: the centre, whatever the setting. |
| `q10-hidden` | `{kind:'sg-lab', props:{source:'oven', axes:['x','z'], editable:true, predict:true, seed:710}}` | Random single readings with fixed statistics: the classical "instruction" picture a card would give. |
| `q10-chsh` | `{kind:'phase-dial', props:{theta:90, rotations:true}}` | Turning a relative phase is what the CHSH dial does to the pair; here on one qubit, as a warm-up. |
| `q10-violation` | `{kind:'phase-dial', props:{theta:90, rotations:true}}` | The quarter-turn phase of $\chi$ is exactly this dial; at 45° the score is highest. |

**Try this:**
- `q10-separable`: (1) Drag the point to the surface: every product member is pure. (2) The mixture of two sits inside.
- `q10-no-signal`: (1) Measure $z$ at θ = 60°: 0 and 1 come up, but the long-run split is fixed by the arrow, not by you.
- `q10-hidden`: (1) Fire 100 along $x$, then $z$: each axis has fixed statistics, like a card's answers.
- `q10-chsh`: (1) Turn the dial a full lap: a relative phase, the knob the CHSH experiment turns.
- `q10-violation`: (1) Set the dial to 45°: the phase that gives $\chi$ its maximal violation.

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** no sheet assigns anything in Q10;
Bergou's §3 problems P3.1 (Wigner) and P3.2 (Hardy) are ⚑ and are **not** used as challenges (§12 Q4). Every challenge
here is authored from the book material and carries a full walkthrough.

### `q10-separable`
1. **warm-up · numeric · `q10-s-xx`** — "What is $\langle X_1X_2\rangle$ for the coin box $\tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$?"
   - Answer: **0** = `q10BoxXX`. Hints: (1) Average over the two members. (2) Each is a product with $\langle X\rangle = 0$. (3) $\tfrac12\cdot0 + \tfrac12\cdot0$. Walkthrough: both $|00\rangle$ and $|11\rangle$ give $\langle X_1X_2\rangle = 0$, so the box does too.
2. **core · numeric · `q10-s-neg`** — "The partial transpose of $\Phi^+$ has four eigenvalues. What is the smallest?"
   - Answer: **−0.5** = `q10PhiNeg` (as $-$`q10PhiPTeig` min). Hints: (1) Transpose Bob's index. (2) The $|01\rangle\langle10|$ corner moves in. (3) Eigenvalues $(\tfrac12, \tfrac12, \tfrac12, -\tfrac12)$. Walkthrough: $\rho_{\Phi^+}^{T_B}$ has a $-\tfrac12$, so $\Phi^+$ is entangled; the box's are all $\ge 0$.
3. **core · choice · `q10-s-which`** — "Which of these is entangled?"
   - Options: **$\Phi^+$** ✓ · $\tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$ · $\tfrac13|00\rangle\langle00| + \tfrac23|11\rangle\langle11|$ · $|0\rangle\langle0|\otimes\tfrac12I$. Check: `q10PhiNeg` 0.5 against `q10BoxPTeig`/`q10Sep33` PPT. Hints: (1) Try the partial transpose. (2) A mixture of products is separable. (3) Only $\Phi^+$ has a negative eigenvalue. Walkthrough: the three mixtures are separable (PPT); only $\Phi^+$ fails the Peres test.

### `q10-no-signal`
1. **warm-up · numeric · `q10-n-rb`** — "Alice and Bob share $\Phi^+$. What is $\langle Z\rangle$ for Bob's qubit, with no message from Alice?"
   - Answer: **0** = `q10BobNoMeas[2]`. Hints: (1) Bob's state is $\mathrm{Tr}_A\rho$. (2) For $\Phi^+$ it is $\tfrac12I$. (3) The centre has $\langle Z\rangle = 0$. Walkthrough: $\rho_B = \tfrac12I$, so every $\langle\sigma\rangle = 0$.
2. **core · numeric · `q10-n-after`** — "Alice measures $x$ and tells no one. Averaged over her outcomes, what is Bob's $\langle X\rangle$?"
   - Answer: **0** = `q10BobAfterX[0]`. Hints: (1) Average the two conditioned states. (2) $+x$ and $-x$ with equal weight. (3) They cancel. Walkthrough: $\tfrac12(+\hat x) + \tfrac12(-\hat x) = 0$: Bob stays at the centre, so no signal.
3. **core · choice · `q10-n-signal`** — "Can Alice send Bob a bit faster than light by choosing her measurement axis?"
   - Options: **No — Bob's reduced state is $\tfrac12I$ for every choice** ✓ · Yes, by measuring $x$ instead of $z$ · Yes, if they share $\Phi^+$ · Only with a third qubit. Check: `q10BobAfterZ`, `q10BobAfterX` both $(0,0,0)$. Hints: (1) What can Bob measure? (2) His statistics come from $\rho_B$. (3) $\rho_B = \tfrac12I$ always. Walkthrough: no local choice of Alice changes $\rho_B$, so Bob's statistics never depend on it.

### `q10-hidden`
1. **warm-up · numeric · `q10-h-x`** — "A card reads $a_1 = 1, a_2 = 1, b_1 = 1, b_2 = -1$. What is $X = a_1(b_1 + b_2) + a_2(b_1 - b_2)$?"
   - Answer: **2** = `q10XexA`. Hints: (1) $b_1 + b_2 = 0$. (2) $b_1 - b_2 = 2$. (3) $a_2\cdot2$. Walkthrough: $1\cdot0 + 1\cdot2 = 2$.
2. **core · numeric · `q10-h-max`** — "Over all 16 cards, what is the largest value of $|X|$?"
   - Answer: **2** = `q10XCount`-derived (`q10ClassicalMax`). Hints: (1) One bracket is always 0. (2) The other is $\pm2$. (3) So $|X|$ is fixed. Walkthrough: every card gives $|X| = 2$; the maximum is 2.

### `q10-chsh`
1. **warm-up · numeric · `q10-c-ceil`** — "What is the largest CHSH value $S$ any instruction-set model can reach?"
   - Answer: **2** = `q10ClassicalMax`. Hints: (1) $S$ averages $X = \pm2$. (2) A weighted average of $\pm2$. (3) Cannot leave $[-2, 2]$. Walkthrough: $|S| = |\sum P\,X| \le 2$, the CHSH inequality.
2. **core · numeric · `q10-c-corr`** — "Two readings always agree. What is their correlator $\langle ab\rangle$?"
   - Answer: **1** = `q10PhiZZ`. Hints: (1) $\langle ab\rangle = \sum ab\,P$. (2) Always agree means $ab = +1$. (3) Average of $+1$. Walkthrough: if $a = b$ every run, $\langle ab\rangle = +1$; always disagree gives $-1$.

### `q10-violation`
1. **core · numeric · `q10-v-s`** — "For $|\chi\rangle = (|00\rangle + e^{i45°}|11\rangle)/\sqrt2$ with $x, y$ settings, what is the CHSH value $S$?"
   - Answer: **2.8284** = `q10ChiS` (tolerance 0.01). Hints: (1) Three correlators $+\tfrac{\sqrt2}2$, one $-\tfrac{\sqrt2}2$. (2) $S = 3\cdot\tfrac{\sqrt2}2 + \tfrac{\sqrt2}2$. (3) $2\sqrt2$. Walkthrough: $\langle XX\rangle = \langle XY\rangle = \langle YX\rangle = \tfrac{\sqrt2}2$, $\langle YY\rangle = -\tfrac{\sqrt2}2$, so $S = 2\sqrt2 = 2.828$.
2. **core · numeric · `q10-v-prod`** — "What is the CHSH value of the product state $|+x\rangle|+x\rangle$ with the same $x, y$ settings?"
   - Answer: **1** = `q10ProdS`. Hints: (1) Correlators factor. (2) $\langle\sigma_x\rangle = 1$, $\langle\sigma_y\rangle = 0$ for $|+x\rangle$. (3) Only $\langle XX\rangle = 1$ survives. Walkthrough: $S = x_1(y_1 + y_2) + x_2(y_1 - y_2) = 1\cdot(1 + 0) + 0 = 1 \le 2$.
3. **stretch · numeric · `q10-v-tsirelson`** — "The CHSH operator $C$ satisfies $C^2 \le 8I$. What is the largest $|S|$ quantum mechanics allows?"
   - Answer: **2.8284** = `q10Tsirelson` (tolerance 0.01). Hints: (1) $|S| = |\langle C\rangle| \le \|C\|$. (2) $\|C\| = \sqrt{\|C^2\|}$. (3) $\sqrt8$. Walkthrough: $C^2$ has top eigenvalue 8, so $\|C\| = 2\sqrt2$; the Tsirelson bound is $2\sqrt2 \approx 2.828$.
4. **stretch · choice · `q10-v-pr`** — "A correlation scores $S = 4$ and sends no signal. Is it allowed by quantum mechanics?"
   - Options: **No — quantum mechanics stops at $2\sqrt2$** ✓ · Yes, it is the PR box · Yes, if the state is entangled enough · Only for three qubits. Check: `q10Tsirelson` 2.828 against `q10PRbox` 4. Hints: (1) What is Tsirelson's bound? (2) $2\sqrt2 < 4$. (3) The PR box is only a mathematical object. Walkthrough: the Popescu–Rohrlich box scores 4 with no signalling, but exceeds $2\sqrt2$, so nature (quantum mechanics) does not allow it.

## 5. Glossary terms new in Q10

`introduces` marks the notation beats (W-709 #8). Inline math in the strings is TeX inside `$…$`. (In the table `\|` is
a Markdown escape; the strings carry a plain `|`.)

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-separable-state` | separable state | notation | A state a coin could make by mixing products the two parties prepare alone. | $\rho_{AB} = \sum_kp_k\,\rho_A^k\otimes\rho_B^k$, $p_k \ge 0$, $\sum p_k = 1$ (Bergou Eq. 3.2); made by LOCC. | `q10-separable:b1` | `qc-l6-mixture` |
| `qc-maximally-entangled` | maximally entangled | — | An entangled pair whose each half, alone, is the most mixed it can be. | Entangled with $\rho_A = \rho_B = \tfrac12I$ (Bergou p. 32); the Bell states. | `q10-separable:b2` | — |
| `qc-ppt` | PPT criterion | — | A quick test: flip one side's index; a negative chance means entangled. | $\rho^{T_B} \ge 0$ for separable states (Peres); for $2\otimes2$ it is also sufficient (Bergou §3.5). | `q10-separable:b3` | — |
| `qc-no-signalling` | no-signalling | notation | A local measurement cannot change what the distant partner sees. | $\rho_B = \mathrm{Tr}_A\rho$ is unchanged by any operation on A; no faster-than-light message. | `q10-no-signal:b2` | — |
| `qc-lhv-model` | local hidden-variable model | notation | The idea that each particle carries answers fixed in advance, drawn with set chances. | Definite $a_1, a_2, b_1, b_2 = \pm1$ from a joint distribution $P(a_1, a_2, b_1, b_2)$; local (Bergou §3.3). | `q10-hidden:b1` | `qc-l1-logic` |
| `qc-correlator` | correlator | notation | The average of the product of two $\pm1$ readings: $+1$ agree, $-1$ disagree. | $\langle ab\rangle = \sum_{a,b}ab\,P(a, b)$; quantum $\langle a\otimes b\rangle = \mathrm{Tr}(\rho\,a\otimes b)$ (Chapter F2). | `q10-chsh:b1` | — |
| `qc-chsh` | CHSH value | notation | A score built from four correlators; a classical story caps it at 2. | $S = \langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle - \langle a_2b_2\rangle$; Bell inequality $\|S\| \le 2$. | `q10-chsh:b2` | — |
| `qc-tsirelson` | Tsirelson bound | — | The ceiling quantum mechanics itself obeys: $2\sqrt2$, not the full 4. | $\|C\| \le 2\sqrt2$ from $C^2 = 4I + [a_1, a_2]\otimes[b_1, b_2] \le 8I$ (Bergou Eq. 3.17). | `q10-violation:b4` | — |
| `qc-pr-box` | PR box | — | A made-up link that scores the full 4 and still sends no signal — but nature has none. | A no-signalling distribution with $S = 4$ (Popescu–Rohrlich); exceeds Tsirelson, not found in nature. | `q10-violation:b6` | — |

Reused: `qc-mixture` (Q1); `qc-pauli-string`, `qc-correlation-grid`, `qc-entangled`, `qc-product-state`,
`qc-factoring-test` (Q6); `qc-ghz`, `qc-local-realism`, `qc-hidden-values`, `qc-mermin-argument` (Q7);
`qc-density-matrix`, `qc-ensemble`, `qc-maximally-mixed`, `qc-selective-measurement` (Q8/Q3); `qc-partial-trace`,
`qc-reduced-density-matrix` (Q9); `qc-bell-basis`, `qc-singlet` (Q6).

**Notation beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-separable-state` | notation | `q10-separable:b1` | `tqR(SEP33)` over `mx(SEP33, {blocks:2})` (needs: two-qubit) |
| `qc-no-signalling` | notation | `q10-no-signal:b2` | `ball('oven')` over `tq({bell:'Phi+'}, {condition:…})` (needs: two-qubit) |
| `qc-lhv-model` | notation | `q10-hidden:b1` | `tab(['a1','a2','b1','b2'], {values:{x:[1,-1,-1,-1]}})` (needs: matrix-v2) |
| `qc-correlator` | notation | `q10-chsh:b1` | `tq({bell:'Phi+'}, {highlight:['zz']})` over `mx(BOX, {highlight:[[0,0],[3,3]]})` (needs: two-qubit) |
| `qc-chsh` | notation | `q10-chsh:b2` | `plot({curve:{fn:'chshClassicalBound'}, bands:[{yFrom:-2, yTo:2}]})` (needs: plot) |

Not here, by ownership: GHZ and Mermin's single-run argument (Q7, link-backs); the Bell basis (Q6); the reduced state
and partial trace (Q9); the classical joint distribution and correlator proper (F2, named in words).

## 6. Review card per unit (both tracks)

### `q10-separable`
- **G points:** (1) A separable state is a coin mixture of products. (2) Its correlations are only classical. (3) The coin box and $\Phi^+$ share $z$ statistics but differ in $x$. (4) Flip Bob's index: a negative chance means entangled.
- **F points:** (1) $\rho = \sum_kp_k\,\rho_A^k\otimes\rho_B^k$; LOCC makes these, never entanglement. (2) Separable $\Rightarrow$ PPT; for two qubits PPT $\Rightarrow$ separable. (3) $\rho_{\Phi^+}^{T_B}$ has an eigenvalue $-\tfrac12$.
- **Equations:** $\rho_{AB} = \sum_kp_k\,\rho_A^k\otimes\rho_B^k,\quad \rho^{T_B} \ge 0 \text{ (separable)}$
- **Trap:** "same $z$ correlation means the same state": the box and $\Phi^+$ agree in $z$ but differ in $x$ and $y$.

### `q10-no-signal`
- **G points:** (1) Measuring one half of $\Phi^+$ jumps the other, but Bob cannot see it. (2) Averaged over Alice's outcomes, Bob is $\tfrac12I$. (3) This holds for any axis Alice picks. (4) So entanglement sends no message.
- **F points:** (1) $\rho_B = \mathrm{Tr}_A\rho = \tfrac12I$, with or without Alice's measurement. (2) $\sum_jp_j\rho_B^{(j)} = \mathrm{Tr}_A\rho$ for every basis. (3) Bergou's interference scheme fails for the same reason.
- **Equations:** $\rho_B = \mathrm{Tr}_A\rho = \tfrac12I$
- **Trap:** "collapse is a signal": the jump is real but invisible until the classical call arrives.

### `q10-hidden`
- **G points:** (1) A local hidden-variable model gives each particle a card of fixed answers. (2) It is Chapter Q7's idea, now for averages. (3) The combination $X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \pm2$. (4) So every card scores $|X| = 2$.
- **F points:** (1) $P(a_1, a_2, b_1, b_2)$ with values $\pm1$; local. (2) One of $b_1 \pm b_2$ is 0, so $X = \pm2$. (3) Unlike Mermin's single-run clash, this is statistical.
- **Equations:** $X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \pm2$
- **Trap:** "one run refutes it": no single CHSH run is impossible for a card; only the average betrays it.

### `q10-chsh`
- **G points:** (1) The correlator averages the product of two readings. (2) $S$ adds four correlators in a set pattern. (3) A classical story caps $S$ at 2. (4) This ceiling $|S| \le 2$ is a Bell inequality.
- **F points:** (1) $\langle ab\rangle = \sum ab\,P(a, b)$. (2) $S = \langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle - \langle a_2b_2\rangle$. (3) $|S| = |\sum P\,X| \le 2$.
- **Equations:** $S = \langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle - \langle a_2b_2\rangle,\ |S| \le 2$
- **Trap:** confusing this $S$ with Chapter Q9's entropy $S(\rho)$: different quantity, same letter.

### `q10-violation`
- **G points:** (1) The entangled $\chi$ scores $2\sqrt2$, above the classical 2. (2) A product state never beats 2, so a violation proves entanglement. (3) Quantum mechanics itself stops at $2\sqrt2$ (Tsirelson). (4) A stronger "PR box" would still send no signal, but nature has none.
- **F points:** (1) $S_\chi = 2\sqrt2$ with $x, y$ settings. (2) Product (and separable) states obey $S \le 2$. (3) $C^2 = 4I + [a_1, a_2]\otimes[b_1, b_2] \le 8I$, so $\|C\| \le 2\sqrt2$.
- **Equations:** $S_\chi = 2\sqrt2,\quad \|C\| \le 2\sqrt2$
- **Trap:** "quantum mechanics can reach $S = 4$": only the (unphysical) PR box does; nature stops at $2\sqrt2$.

## 7. Symbol-before-use tables

Abbreviations: se, ns, hi, ch, vi (the five units in order). Carried from Q1–Q9 and recapped at `q10-separable:b1`:
$|0\rangle$, $|1\rangle$, $|\pm\rangle$, $|{\pm x}\rangle$, kets and bras, $|ab\rangle$, X, Y, Z, I, the Pauli matrices
$\sigma_j$ and $\langle\sigma\rangle$, Pauli strings $X_1X_2$ and the grid $T_{ij}$ (Q6), $\Phi^+$, $\Psi^-$ (Q6), GHZ
and the Mermin cards (Q7), $\rho$, $\mathrm{Tr}$, $\otimes$ on operators, $\tfrac12I$ (Q8, Q4), $\mathrm{Tr}_A$, the
reduced state $\rho_A$ (Q9), commutators $[A, B]$ (Q3), and the Bloch ball (Q8).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| separable, $\rho_A^k\otimes\rho_B^k$ | se:b1 | se:b1 | OK | — |
| LOCC | se:b1 | se:b1 | OK | "local operations, classical talk", spelled out. |
| maximally entangled | se:b2 | se:b2 | OK | reduced $\tfrac12I$, from Q9. |
| $\rho^{T_B}$ | se:b3 | se:b3 | OK | "flip Bob's index"; the partial transpose. |
| Alice, Bob | se:b2 | se:b2 | OK | A = qubit 1, B = qubit 2. |
| no signalling | ns:b2 | ns:b2 | OK | — |
| $a_1, a_2, b_1, b_2$ | hi:b1 | hi:b1 | OK | each a $\pm1$ reading. |
| a card, $P(\cdots)$ | hi:b1 | hi:b1 | OK | "a card of answers with set chances". |
| $X$ (combination) | hi:b2 | hi:b2 | **FLAG** | $X$ the combination against $X$ the Pauli gate; stated in place (§12 Q2). |
| $\langle ab\rangle$ | ch:b1 | ch:b1 | OK | the correlator. |
| $S$ (CHSH) | ch:b2 | ch:b2 | **FLAG** | $S$ the CHSH value against Q9's entropy $S(\rho)$ and spin $S$; Rosetta at ch:b1 (§12 Q3). |
| $\chi$, $\delta$ | vi:b1 | vi:b1 | OK | the violating pair and its phase. |
| $2\sqrt2$, Tsirelson | vi:b4 | vi:b4 | OK | named in place. |
| $C$ (CHSH operator) | vi:b4 | vi:b4 | OK | "the CHSH operator". |
| PR box | vi:b5 | vi:b5 | OK | defined in the question. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\sum_kp_k\,\rho_A^k\otimes\rho_B^k$ | se:b1 | se:b1 | OK | — |
| $\rho^{T_B}$, PPT | se:b3 | se:b3 | OK | Peres criterion. |
| $\mathrm{Tr}_A\rho$, $\rho_B$ | ns:b2 | Q9 | OK | reduced state, link-back. |
| $P(a_1, a_2, b_1, b_2)$ | hi:b1 | hi:b1 | OK | joint distribution; F2 link in words. |
| $X = a_1(b_1 + b_2) + a_2(b_1 - b_2)$ | hi:b2 | hi:b2 | **FLAG** | $X$ overloaded; stated "the CHSH combination, not the Pauli $X$". |
| $\langle a\otimes b\rangle = \mathrm{Tr}(\rho\,a\otimes b)$ | ch:b1 | ch:b1 | OK | quantum correlator. |
| $S$ | ch:b2 | ch:b2 | **FLAG** | S overloaded (CHSH, entropy, spin); Rosetta at ch:b1. |
| $[a_1, a_2]\otimes[b_1, b_2]$ | vi:b4 | Q3 (commutator) | OK | — |
| $\|C\|$ (operator norm) | vi:b4 | vi:b4 | OK | "the largest eigenvalue size". |

**Counts:** Ground 2 FLAGs, Formal 2 FLAGs (the same two overloads, $X$ and $S$), all resolved in place.

## 8. Errata

**Carried from the map (`P-709-map.md` §B):**
- **Bergou B6**, pp. 32, 38–39: Bergou's Bell names are swapped relative to the standard ($\Phi^\pm = |01\rangle \pm |10\rangle$, $\Psi^\pm = |00\rangle \pm |11\rangle$). The chapter uses the standard names, tagged "(Bergou: $\Psi_+$)" on first use (ruling 9); cited in `q10-separable:b2`.
- **Bergou B7**, p. 36, Eq. 3.17: the Tsirelson identity's second square must read $(b_1 - b_2)/\sqrt2$; as printed it is false. Cited in `q10-violation:b4` and D7 as "erratum corrected". Checked in numpy: with the correction, $C^2 = 4I + [a_1, a_2]\otimes[b_1, b_2]$ and the identity $2\sqrt2 - C = \tfrac1{\sqrt2}(a_1 - \tfrac{b_1 + b_2}{\sqrt2})^2 + \tfrac1{\sqrt2}(a_2 - \tfrac{b_1 - b_2}{\sqrt2})^2 \ge 0$ holds.
- **Bergou B8**, p. 41: "all Bell inequalities hold for $p \le 1/\sqrt2$" is proved only for CHSH. Not used in Q10 (that statement is Chapter Q12's PPT material); noted here so the build does not import it.

**None found in the mathematics of Bergou §3.1–3.3 or N&C §2.6** beyond B6–B8. Checked in numpy: the separable example
Eq. 3.3 and its correlations; $\rho_b = \tfrac12I$ (Eqs. 3.5–3.7); $X = \pm2$ (Eq. 3.9); $|S| \le 2$ (Eq. 3.10); the
four correlators $\tfrac{\sqrt2}2, \tfrac{\sqrt2}2, \tfrac{\sqrt2}2, -\tfrac{\sqrt2}2$ and $S = 2\sqrt2$ (Eqs. 3.11–3.13);
the product-state bound (Eqs. 3.14–3.16); the PR box $S = 4$; and N&C's singlet CHSH ($\langle QS\rangle = \langle RS\rangle
= \langle RT\rangle = \tfrac1{\sqrt2}$, $\langle QT\rangle = -\tfrac1{\sqrt2}$, $S = 2\sqrt2$, Eqs. 2.227–2.230).

**Silent notes (no box).**
| Where | Point | Action |
|---|---|---|
| Bergou §3.2 | the faster-than-light scheme uses a phase gate + H on Bob's qubit | The plan tells it with Q9's reduced state instead; Bergou's version is the `q10-no-signal:b4` clue (§12 Q1) |
| Bergou p. 34 | the state is written $(|00\rangle + e^{i\pi/4}|11\rangle)/\sqrt2$ with $a_i, b_j$ as $\sigma_x, \sigma_y$ | kept exactly; the dial sweeps the phase $\delta$ |
| N&C §2.6 | uses the singlet with $Q, R, S, T$ settings and letters $Q = Z_1$, etc. | the [B] beat `q10-violation:b5` cites it; the main line follows Bergou's $\chi$ |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine

**E2 `entangle` (new module, not built yet).** Q10 uses these functions; each is listed with its exact signature and
its numpy twin (`q1011plan-numpy.py`). This list is the E2 brief for the `entangle` half (re-map §6; skill
`11-engine-module`). Types: `Mat`/`Vec` as in `physics/qc`; a `Dir` is a `[x, y, z]` unit vector or the engine's
direction form; a Pauli observable is a `Mat`.

| Function | Signature | Returns | numpy twin |
|---|---|---|---|
| `correlator` | `correlator(rho: Mat \| Vec, A: Mat, B: Mat): number` | $\langle A\otimes B\rangle = \mathrm{Tr}(\rho\,A\otimes B)$ (accepts a ket) | $\langle\psi|A\otimes B|\psi\rangle$ or $\mathrm{Tr}(\rho\,A\otimes B)$ |
| `correlationTensor` | `correlationTensor(rho: Mat \| Vec): number[][]` | the $3\times3$ grid $T_{ij} = \langle\sigma_i\otimes\sigma_j\rangle$ | explicit traces over the nine $\sigma_i\otimes\sigma_j$ |
| `chsh` | `chsh(rho: Mat \| Vec, a1: Mat, a2: Mat, b1: Mat, b2: Mat): number` | $S = \langle a_1b_1\rangle + \langle a_1b_2\rangle + \langle a_2b_1\rangle - \langle a_2b_2\rangle$ | the four correlators summed |
| `chshFromAxes` | `chshFromAxes(rho, a: [Dir, Dir], b: [Dir, Dir]): number` | S with each setting a direction $\hat n\cdot\boldsymbol\sigma$ (the stage's `axes`) | build $\hat n\cdot\sigma$, call `chsh` |
| `chshCurve` | `chshCurve(stateOf: (deltaDeg: number) => Vec, a, b, deltaDeg: number): number` | S at one phase, for the dial plot | loop the formula; returns $2\cos\delta + 2\sin\delta$ for $\chi$ |
| `chshMaxHorodecki` | `chshMaxHorodecki(rho: Mat \| Vec): number` | the Tsirelson-capped maximal S over all settings (= $2\sqrt{m_1 + m_2}$, Horodecki) | eigenvalues of $T^{\mathsf T}T$, top two summed, $\times2\sqrt{\cdot}$ |
| `lhvChsh` | `lhvChsh(): { assignments: number[][]; maxS: number; xValues: number[] }` | the 16 $\pm1$ instruction sets, each $X = \pm2$, and $\max S = 2$ | `itertools.product` over $\pm1^4$ |
| `isPPT` | `isPPT(rho: Mat): boolean` | whether $\rho^{T_B} \ge 0$ (Peres) | `eigvalsh(ptranspose(rho))` all $\ge -\varepsilon$ |
| `negativity` | `negativity(rho: Mat): number` | $\sum_{\lambda < 0}|\lambda|$ of $\rho^{T_B}$ | sum of negative eigenvalues of $\rho^{T_B}$ |
| `prBox` | `prBox(): { S: number; table: number[][] }` | the PR distribution and $S = 4$ | the four no-signalling distributions, $S = 4$ |

**Already in the engine (no work).** `ptranspose(rho, qubits)` (density.ts); `eigh` (cmat); `reducedBloch`,
`partialTrace`, `postMeasureRho`, `densityOf`, `mixtureN` (density); `pauliString` (gates); `measureInBasis` (measure).
The `matrix` v2 `ptranspose:'B'` and `spectrum:'bars'` fields are merged (W-709 #13/#15).

**Notes for `Q10.values.ts`.**
- The CHSH operator `C` is built in the values file as $XX + XY + YX - YY$ via `pauliString`; the stage's `lin` draws the
  same combination. `C²` is `matmul(C, C)`; its spectrum is `eigh`.
- `chsh` fixes the sign pattern (the minus on the last term); the values file never types a sign into a caption.
- The dial curve is sampled by `chshCurve` at the plot's x-steps; the marker at 45° reads `q10DialAt45`.

### 9.2 Stage contract

**`plot` (new SVG kind; re-map §6.2, judge Q7 YES; tag "needs: plot").** Q10 is the kind's first heavy user. Exact
shape the judge should spec from this section:
```ts
interface PlotState {
  kind: 'plot'
  curve: {
    fn: 'chshVsPhase' | 'chshClassicalBound'   // an engine curve key (physics/qc/entangle.ts `chshCurve`)
    x?: { from: number; to: number }            // the swept parameter's range (degrees), default the fn's own
    samples?: number                            // default 64
  }
  markers?: { x: number; label?: string }[]     // points on the curve (e.g. 45° → 2√2)
  bands?: { yFrom: number; yTo: number; label?: string }[]  // a shaded region (the classical |S| ≤ 2 band)
  yLines?: { y: number; label?: string }[]      // horizontal reference lines (2, 2√2, 4)
  shot?: PlotShot
}
```
| Aspect | Rule |
|---|---|
| Resolve | engine only: the curve's y-values come from `chshCurve`/the named `fn`; content never writes a y-value. The validator rejects an `fn` whose engine function has not landed (so the beat cannot ship before E2). |
| Validation | `x.from < x.to`; markers and `yLines` within the drawn y-range; at most 8 markers, 4 bands, 4 yLines. |
| Passport / fidelity | "CURVE · engine-sampled", note "the curve and its markers are computed, not drawn"; key `qc-plot-engine-curve`. |
| Print | the SVG is its own figure (W-709 #7 figure strips work). |

**`two-qubit` (needs: two-qubit + E2 for `chsh`).** Q10 uses the merged fields (W-709 #14): `source:{ket}`
(`{bell:…}`, `{circuit:C_CHI, upTo}`), `source:{rho}` (a mixture, `BOX`/`SEP33`), `condition` (Alice's reading, used
in no-signalling), `arrows:'reduced'`, `grid:'T'`, `highlight` (grid cells), `labels:'A-B'`. New use of merged-but-idle
fields: `axes:{a, b}` (≤ 2 `Dir` each, the CHSH settings) with `readouts:['chsh']` — the validator already rejects
`chsh` until E2 lands (re-map §6.1), so these beats build only after E2 merges. No new `two-qubit` field is needed.

**`matrix` v2 (needs: matrix-v2, merged).**
| Field | Used as | Beats and derivations |
|---|---|---|
| `ptranspose:'B'` | $\rho^{T_B}$ for the Peres test | se:b3, se:b4; D1 |
| `spectrum:'bars'` (negatives flagged) | eigenvalues of $\rho^{T_B}$ and of $C$, $C^2$ | se:b3, se:b4, vi:b4; D1, D7 |
| `{lin:[…]}`, `{product:[…]}`, multi-letter `pauli` | the CHSH operator $C = XX + XY + YX - YY$ and $C^2$ | vi:b4; D7 |
| `tableau` (+ `values`) | instruction cards; the four correlators as a table | hi:b1, hi:b2, ch:b1, ch:b2; D3, D4 |

The `tableau` here holds short labels (`a1`, `a1·b1`) rather than Pauli strings; the kind already renders an arbitrary
`values` card keyed by the row string (W-709 #13, used for Mermin in Q7). The judge should confirm a tableau row label
may be a plain token (not only a Pauli string); if not, §12 Q5 proposes the fallback.

### 9.3 Widget gaps
W4 `chsh-dial` (deferred under the cap): two balls with two draggable measurement axes each, a live $S$ readout and a
small $S$-vs-angle trace; shows the violation interactively. The §3 fallbacks (`bloch`, `phase-dial`, `sg-lab`) carry
the units until then.

## 10. Media
- **Opener (Part IV, Blender still; planned here):** "The ceiling and the bulge". A flat classical ceiling at $S = 2$
  with a quantum curve bulging through it to a peak at $2\sqrt2$, and a faint unreachable line at 4 (the PR box). Data
  from the engine (`chshCurve`), exported by `pipeline/blender/gen_opener_data.ts`; Blender draws only.
- **Film (deferred) `qc-q10-chsh-dial`** "The CHSH dial": the phase $\delta$ turns, the four correlators move on two
  Bloch balls, and the score $S(\delta)$ traces the curve, crossing the classical line near $\delta = 20°$ and peaking
  at 45°. Manifest: `q10ChiCorr`, `q10ChiS`, `q10DialAt0`, `q10DialAt45`, `q10DialAt90`, `q10Tsirelson`.
- **Decor (Higgsfield, credits need the user):** two distant observatories under a night sky, a faint beam between them;
  no text, no numbers, no diagrams.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-separable` | Separable states: classical mixtures of products | Q10 · `q10-separable` | `qc-density-matrix`, `qc-entangled`, `qc-tensor-operator` | `mixtures` |
| `qc-no-signalling` | No signalling | Q10 · `q10-no-signal` | `qc-reduced-density-matrix`, `qc-bell-basis` | — |
| `qc-lhv` | Instruction sets: a classical story | Q10 · `q10-hidden` | `qc-mermin-argument`, `qc-separable` | — |
| `qc-chsh` | The CHSH inequality | Q10 · `q10-chsh` | `qc-lhv`, `qc-correlation-grid` | — |
| `qc-bell-violation` | Breaking the ceiling: $2\sqrt2$ | Q10 · `q10-violation` | `qc-chsh`, `qc-bell-basis` | — |

Bridge ids used, all existing: `qc-l6-mixture` (separable states), `qc-l1-logic` (instruction sets as a logic table).
The `sameAs` target `mixtures` is a 448 concept id (`content/concepts.ts`); `q10-separable` shares it with Q8's
stations, which the concept test allows.

**Future bridges (TODO; targets not built):** Q11 (the no-signalling bound limits teleportation and dense coding), Q12
(PPT, negativity and the witness — `q10-separable` is their root; concurrence as a second measure of the same
entanglement CHSH detects), Part X (Bell inequalities and non-locality proofs).

### 11.2 Arcade (5 levels)
Label constant: `const Q10x = (unit, label) => ({ lecture: 'Q10', unit, label })`. All five are Spot the error.
1. **`q10-separable` · `qc-same-z-same-state`** — "Same $z$, same state?"
   - Steps: "The box and $\Phi^+$ both read 00 or 11 in $z$." · "So $\langle Z_1Z_2\rangle = 1$ for both." · "Their $x$ readings also agree." · "So the box is the state $\Phi^+$."
   - `wrong: 3`. Why: $\langle X_1X_2\rangle_{\rm box} = 0$ against $1$ for $\Phi^+$ (`q10BoxXX`, `q10PhiXX`).
2. **`q10-no-signal` · `qc-collapse-signal`** — "A faster-than-light bit?"
   - Steps: "Alice reads her half of $\Phi^+$ and Bob's jumps at once." · "Bob measures and sees his qubit fixed." · "So Bob learns Alice measured." · "So they signal faster than light."
   - `wrong: 3`. Why: averaged over Alice's outcomes Bob's state is $\tfrac12I$, the same with or without her measurement (`q10BobAfterZ`).
3. **`q10-hidden` · `qc-card-fails-once`** — "One run refutes it?"
   - Steps: "A card fixes $a_1, a_2, b_1, b_2 = \pm1$." · "$X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \pm2$." · "So one CHSH run disagrees with a card." · "So a single run rules the card out."
   - `wrong: 3`. Why: every card gives a valid $\pm2$ for any single run; only the average $S$ betrays it (`q10XRange`).
4. **`q10-chsh` · `qc-classical-4`** — "How high can a card score?"
   - Steps: "$S$ adds four correlators." · "Each correlator is between $-1$ and $1$." · "So $S$ can reach 4." · "A classical story can score $S = 4$."
   - `wrong: 3`. Why: the combination $X = \pm2$ forces $|S| \le 2$ for any card (`q10ClassicalMax`).
5. **`q10-violation` · `qc-quantum-4`** — "How high can quantum go?"
   - Steps: "An entangled pair beats the classical 2." · "$\chi$ scores $2\sqrt2 \approx 2.83$." · "A more entangled pair scores more." · "Quantum mechanics can reach $S = 4$."
   - `wrong: 3`. Why: the Tsirelson bound caps every quantum state at $2\sqrt2$ (`q10Tsirelson`); only the unphysical PR box reaches 4.

## 12. Questions for the judge

**Q1. No-signalling told with the reduced state, not Bergou's interference.** Bergou §3.2 argues no-signalling through a
phase gate and Hadamard on Bob's qubit; the plan uses Chapter Q9's $\rho_B = \mathrm{Tr}_A = \tfrac12I$ instead, with
Bergou's version as the `q10-no-signal:b4` clue. *Recommend:* the reduced-state route (it rests on tools the learner
has); keep Bergou's scheme as the clue.

**Q2. The overloaded $X$.** The CHSH combination $X = a_1(b_1 + b_2) + a_2(b_1 - b_2)$ collides with the Pauli $X$.
*Recommend:* keep $X$ (Bergou's letter), stated in place at `q10-hidden:b2` ("the CHSH combination, not the Pauli gate");
it never appears in the same beat as a Pauli $X$.

**Q3. The overloaded $S$.** $S$ is the CHSH value here, the entropy $S(\rho)$ in Chapter Q9, and spin elsewhere.
*Recommend:* keep $S$ for CHSH (universal in the literature), with a Rosetta line at `q10-chsh:b1`; $S(\rho)$ never
appears in Q10.

**Q4. Bergou's ⚑ P3.1 (Wigner) and P3.2 (Hardy).** No sheet assigns them. *Recommend:* neither is used as a challenge
or a derivation; re-check when HW3 is ingested (ruling 12). The chapter's challenges are authored from the §3.3 text.

**Q5. A plain-token `tableau` row label.** The CHSH/instruction tables want row labels like `a1·b1`, not Pauli strings.
The `matrix` tableau renders any `values` card keyed by the row string (W-709 #13, used for Mermin). *Recommend:* confirm
a tableau row label may be a plain token; if the renderer requires Pauli letters, the fallback is a two-column `matrix`
grid of the four correlators with the labels in the caption (no new field).

**Q6. The `plot` kind and E2 land before the Q10 build.** Four beats and three derivations need `plot`, and five beats
need E2's `chsh`/`correlator`/`negativity`. Per the re-map's §7, `plot` is batch 4 and E2 is batch 3, both before the
Q10 build (batch 5). *Recommend:* confirm the order; if `plot` slips, D4/D5/D6's plot views fall back to the two-qubit
grid views (still ≥ 2 distinct views per track), and the `qc-chsh` notation beat moves its view to the `tableau`.

**Q7. The CHSH state as a circuit source.** The violating state $\chi(\delta)$ is drawn by `two-qubit{ket:{circuit:
C_CHI, upTo:3}}` with the phase gate $P(\delta)$ swept. *Recommend:* confirm `two-qubit` accepts a swept circuit source
(it reuses `amplitudes`' `AmpSource`, which takes `{circuit, upTo}`); the sweep is on the gate angle, already a `Scrub`.

**Q8. F2 is a soft dependency.** Q10 uses the correlator and joint distribution, owned by F2 (re-map §2.2), but F2 is a
soft prerequisite (§2.1, either build order). *Recommend:* define the correlator in place in `q10-chsh:b1` (as Q7 defined
variance, ruling `qc709-Q6Q7.md` #8), marked `introduces:'notation'`, and link back to F2 in words once it is built.
