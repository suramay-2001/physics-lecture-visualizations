# P-Q14-story — Q14 "Generalized measurements and telling states apart" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q13-story.md` (two tracks; the 13 sections of
`skills/03-chapter-plan`), with the two standing gates: every derivation list, in both tracks, steps the stage through
≥ 2 distinct views (`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one
notation beat (`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Map entry: `P-709-remap-L1L7.md` §2 (Q14, line
183), §6 (derivations D1–D6, line 296; engine **E3** `povm`, line 368; notation `{Π_j}, A_j = U_j√Π_j` line 344). The
detailed old-map plan for this chapter is `P-709-map.md` §6 "Q12 · Generalized measurements…" (Bergou Ch. 5, pp. 77–104).
Rulings: `qc709-Q10Q13.md` (Q13 is the adjacent Part V chapter; same phase and engine conventions), `qc709-remap.md`
(no raw TeX; engine-backed answers), `qc709-nc.md` (N&C citing and names; open-circle `controls0` lands before Q14, #2).
Planned after `P-Q13-story.md`, which it links back to for the Stinespring dilation and detection/Kraus operators.

**Phase.** Q14 is a **`'books'`-phase** chapter (the notes stop at Lecture 7): every ramp beat is `[B]` (phase
`'books'`, rank 1) and every clue is `[C]` (phase `'clue'`). No `[L]` beat, no `'core'`/`'lecture'` phase. Sources are
books only (Bergou Ch. 5; N&C §2.2.4–2.2.8).

**Sources read** (printed pages; paraphrased, never quoted — copyrighted).
- Bergou Ch. 5 "Quantum Measurement Theory" (printed = PDF − 11, `P-709-map.md` (d)-E1): §5.1 outline p. 77; §5.2
  standard measurements pp. 78–80 (the von Neumann pointer model $H = H_0 + P^2/2m + \hbar gXP$ Eq. 5.3, $U = e^{-igtXP}$
  Eq. 5.4, the SQL Eqs. 5.1–5.2, 5.8, postulates 1–6 / 4a–6a); §5.3 POVMs pp. 81–84 (the decomposition of the identity
  $\sum_j\Pi_j = I$, $\Pi_j \ge 0$; detection operators $\Pi_j = A_j^\dagger A_j$, polar form $A_j = U_j\Pi_j^{1/2}$
  Eq. 5.11; postulates 1′–6′, $p_j = \mathrm{Tr}(\Pi_j\rho)$); §5.4 Neumark pp. 84–89 (the ancilla construction Eqs.
  5.15–5.23; the trine ensemble Eqs. 5.24–5.31); §5.5.1 USD pp. 89–93 (Eqs. 5.32–5.46, Fig. 5.1); §5.5.2 minimum error
  pp. 93–97 (the Helstrom operator $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$ Eq. 5.51, $P_E = \tfrac12(1 - \lVert\Gamma\rVert_1)$
  Eq. 5.58, the pure form Eq. 5.59, $P_E \le \tfrac12 Q_{\mathrm{opt}}$ Eq. 5.61). §5.6 Sequential (pp. 98–104) is **out
  of scope** (§12 Q1); P5.1–5.6 are all ⚑.
- N&C §2.2.4–2.2.8 "Distinguishing quantum states / Projective / POVM measurements" (printed = PDF − 28, `qc709-nc.md`):
  Postulate 3 — measurement operators $\{M_m\}$, $p(m) = \langle\psi|M_m^\dagger M_m|\psi\rangle$ Eq. 2.92, completeness
  $\sum_m M_m^\dagger M_m = I$ Eq. 2.94; §2.2.4 non-orthogonal states cannot be told apart reliably (Box 2.3); §2.2.6 the
  POVM $E_m \equiv M_m^\dagger M_m$ Eq. 2.117, Box 2.5, and the three-element never-err POVM Eqs. 2.118–2.120.
- Ownership (re-map §2; old-map bridges): **Q14 owns** generalized measurement, the POVM and its elements, detection
  operators, Neumark's theorem, the trine, unambiguous (USD) and minimum-error (Helstrom) discrimination, the
  inconclusive outcome, the prior. **Q13** owns the Stinespring dilation and Kraus operators — Q14 links back (detection
  operators are the measurement twin of Kraus operators; the ancilla extension is the dilation again). **Q9** owns the
  trace norm $\lVert\cdot\rVert_1$ and trace distance (the Bergou-only unit, `qc709-remap.md` #11) — Helstrom links back.
  **Q8** owns $\rho$, $\mathrm{Tr}$, the Bloch ball, positive operators. **Q3** owns the projective (von Neumann)
  measurement, observables and the spectral theorem — Q14 generalizes them. **F2** owns priors / classical chance.

**Evidence.** Every number was computed **twice**, by independent routes, before being written into a beat
(`q14plan-verify.py`, scratchpad): route A is the engine's own algorithm (`bornPovm` as $\mathrm{Tr}(E_i\rho)$;
`neumark`'s isometry $V = \sum_i\sqrt{E_i}\otimes|i\rangle$ with `sqrtPSD`; `helstrom` via the trace norm of
$\eta_2\rho_2 - \eta_1\rho_1$; `usd` as $1 - |\langle\psi_0|\psi_1\rangle|$), route B is the closed form (the trine's
$2/3,1/6$; the pure Helstrom form Eq. 5.59; $1-\cos\Theta$; Fig. 5.1's $1/11, 10/11$; the N&C constant $2-\sqrt2$). All
21 numbers under the keys below agree to 6 decimals, **no exceptions**. The merged engine (`physics/qc/povm.ts`:
`isPOVM`, `bornPovm`, `neumark`, `helstrom`, `usd`) is checked against `pipeline/make_qc_fixtures.py` block "povm" by an
independent scipy route (`scipy.linalg.sqrtm` Schur-based; the SVD trace norm); each learner value gets a property test.

**Conventions** (Q13/Q9/Q8/Q3's, plus these).
- **The POVM is $\{E_i\}$, its elements $E_i \ge 0$ with $\sum_i E_i = I$** (N&C's letter; Bergou writes $\Pi_j$). One
  Rosetta line in the notation beat: "Bergou writes $\Pi_j$". **Detection operators are $A_i$** with $E_i = A_i^\dagger A_i$
  and polar form $A_i = U_i\sqrt{E_i}$ (Bergou Eq. 5.11); N&C's $M_m$ noted once. These are the measurement twin of
  Chapter Q13's **Kraus operators** $A_m$ — the same letter, a deliberate link-back stated once.
- **Priors are $\eta_1, \eta_2$** ($\eta_1 + \eta_2 = 1$; Bergou's letter). **The overlap is $\cos\Theta = |\langle\psi_1|\psi_2\rangle|$**
  (Bergou §5.5.1). **The Helstrom operator is $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$** (Bergou Eq. 5.51).
- **The channel/entanglement $\mathcal E$, $E$ clash (Q13):** here $E_i$ (italic, subscripted) is a POVM element, never a
  channel or entanglement; stated once in §7. The ancilla/meter letter is $B$ (Bergou's $H_B$); the running two-state
  discrimination pair is $|0\rangle$ and $|+\rangle$ (overlap $0.7071$, the same pair as Chapter Q13's no-cloning aside
  and N&C Eqs. 2.118–2.120).
- **Units & text.** All inline math is TeX inside `$…$`; no TeX command outside `$…$` (`qc709-remap.md`). No plan ids in
  learner text; cross-references read "Unit 14.2", "Chapter Q13". Every number is rendered from its claim with
  `d(V.key, n)`; the plan prints the value for review only. No amplitude, matrix entry or operator eigenvalue is a
  percent; this chapter shows no percent. Units in order: 14.1 `q14-pointer`, 14.2 `q14-povm`, 14.3 `q14-neumark`,
  14.4 `q14-usd`, 14.5 `q14-min-error`, 14.6 `q14-compare`.
- **Claim keys** `q14…` in `Q14.values.ts`; claims JSON `claims-qc709/q14.json`.

**Stage shorthand.** Q13/Q12/Q8's forms carry over; new ones marked. A derivation `view` uses only a kind its unit's
beats already show.

| Shorthand | Expands to | Needs |
|---|---|---|
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'decimal', ...f}` | matrix-v2 |
| `bl(S, f)` | `{kind:'bloch', ...S, ...f}` (states + measurement directions on the sphere) | bloch |
| `ball(P, f)` | `{kind:'bloch-ball', point:P, shot:'B-STD', ...f}` | bloch-ball |
| `circ(C, k, f)` | `{kind:'circuit', circuit:C, upTo:k, ...f}` | circuit |
| `amp(S, f)` | `{kind:'amplitudes', state:S, ...f}` | amplitudes |
| `plot(fn, x, f)` | `{kind:'plot', curve:{fn, x}, ...f}` (SVG `plot`, W-709 #16) | plot |

| Matrix source | Expands to | Needs |
|---|---|---|
| `out(K)` | `{outer:[K]}` = \|K⟩⟨K\| | matrix |
| `rho(K)` | `{rho:{ket:K}}` | matrix |
| `pa('X')` | `{pauli:'X'}` | matrix-v2 |
| `lin([c, A], …)` | `{lin:[{c, src:A}, …]}`, `c` from the fixed exact set (±1, ±½, ±i, ±1/√2, trig) | matrix-v2 |
| `pv(key, which, f)` (new) | `{povm:{key, which, index?, param?}}` — a POVM's elements, their sum, or a Neumark block, resolved by E3 `povm` (§9.2); never hand-typed | matrix-povm-source |
| field `spectrum:'bars'` | the eigenvalue bars (negatives flagged) | matrix-v2 |

| Name | Source (review only) | Value |
|---|---|---|
| `TRINE` | `pv('trine', …)` — Bergou Eq. 5.24: $|\psi_0\rangle = -\tfrac12(|0\rangle+\sqrt3|1\rangle)$, $|\psi_1\rangle = -\tfrac12(|0\rangle-\sqrt3|1\rangle)$, $|\psi_2\rangle = |0\rangle$; $E_j = \tfrac23|\psi_j\rangle\langle\psi_j|$ | $\sum E_j = I$ |
| `NC_USD` | `pv('nc-usd', …)` — N&C Eqs. 2.118–2.120: $E_1 = (2-\sqrt2)|1\rangle\langle1|$, $E_2 = (2-\sqrt2)|{-}\rangle\langle{-}|$, $E_0 = I - E_1 - E_2$ | $\sum E = I$ |
| `UNSHARP(η)` | `pv('unsharpZ', …, {param:η})` — the soft $Z$ meter $E_\pm = \tfrac12(I \pm \eta Z)$ | $\sum E_\pm = I$ |
| `PSI0`, `PLUS` | `{ket:'0'}`, `{ket:'+'}` | the discrimination pair, overlap $0.7071$ |

**Circuits.** `C_METER` (wires S, M): the system qubit `|ψ⟩` on S, a meter qubit `|0⟩` on M, a `unitary` op `U_SM` (a
controlled rotation; matrix from `Q14.values.ts`), then a meter on M (a mid-circuit measurement with `outcomes`). Reading
M realises the two-outcome POVM on S alone (Bergou Eqs. 5.15–5.19; the forward half of Neumark). `wires` labelled
S (system), M (meter/ancilla). The trine needs a **qutrit** ancilla (Bergou Eqs. 5.26–5.31), which the qubit `circuit`
kind cannot draw, so Unit 14.3 shows the trine's dilation through the `matrix` block structure of $V$ and the ancilla
projectors, and uses `C_METER` only for the drawable qubit-meter case.

## 0. Chapter map
Q14 answers the map's question: **"When is a sharp yes-or-no measurement not enough, and how well can we ever tell two
look-alike states apart?"** It is the second chapter of Part V, "Dynamics and measurement", and the measurement twin of
Chapter Q13: Q13 took a unitary on a bigger space and traced the extra part out (a channel); Q14 takes a unitary on a
bigger space and *measures* the extra part (a generalized measurement).

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q14-pointer` | Reading a qubit through a meter | How do you actually measure a quantum system? | Bergou §5.2 pp. 78–80; N&C §2.2.4–2.2.5 pp. 86–90 | `l3-postulates` | Q3 `qc-projective-measurement`; Q13 `qc-stinespring` |
| 2 | `q14-povm` | More answers than dimensions | Can a measurement have more outcomes than the space has dimensions? | Bergou §5.3 pp. 81–84; N&C §2.2.6 pp. 90–92 | `l4-projectors` | Q13 `qc-kraus-operator`; Q8 `qc-positive-operator` |
| 3 | `q14-neumark` | Every POVM is projective upstairs | Is a POVM a real measurement, or just bookkeeping? | Bergou §5.4 pp. 84–89 | — | Q13 `qc-stinespring`; Q9 `qc-purify` |
| 4 | `q14-usd` | Never wrong, sometimes unsure | Can you identify a state and never be mistaken? | Bergou §5.5.1 pp. 89–93; N&C §2.2.6 pp. 91–92 | — | Q13 `q13-no-cloning` (overlap $0.7071$) |
| 5 | `q14-min-error` | The fewest mistakes: Helstrom | If you must always guess, how often must you be wrong? | Bergou §5.5.2 pp. 93–97 | — | Q9 `qc-trace-distance` (trace norm) |
| 6 | `q14-compare` | The price of certainty | Which is better — never wrong, or fewest wrong? | Bergou §5.5.1–5.5.2 pp. 92–97 (Eq. 5.61, Fig. 5.1) | — | Q14 `q14-usd`, `q14-min-error` |

**Outcomes** (Ground wording):
- Describe a measurement as coupling the system to a meter and reading the meter, and read the probability rule $p_i = \mathrm{Tr}(E_i\rho)$ off it.
- Say what a POVM is — positive elements $E_i \ge 0$ that add to the identity — and build one with more outcomes than the qubit has dimensions (the trine, three outcomes).
- State Neumark's theorem: every POVM is an ordinary projective measurement on the system plus an ancilla, and check the isometry's $V^\dagger V = I$.
- Explain why no measurement identifies two non-orthogonal states with certainty, and build the unambiguous scheme with its inconclusive outcome ($1 - |\langle\psi_0|\psi_1\rangle|$ success at equal priors).
- Compute the minimum-error (Helstrom) bound $\tfrac12(1 + \lVert\eta_2\rho_2 - \eta_1\rho_1\rVert_1)$ for two states.
- Compare the two strategies and state the trade-off $P_E \le \tfrac12 Q_{\mathrm{opt}}$: never-wrong costs you answered trials.

**Prerequisites** (concepts): Q3 `qc-projective-measurement`, `qc-observable`, `qc-spectral-decomposition`; Q8
`qc-density-matrix`, `qc-trace`, `qc-bloch-ball`, `qc-positive-operator`; Q9 `qc-partial-trace`, `qc-purify`,
`qc-trace-distance` (the trace norm $\lVert\cdot\rVert_1$); Q13 `qc-stinespring`, `qc-kraus-operator`,
`qc-quantum-channel`; Q2 `qc-unitary`, `qc-operator-matrix`; F2 priors / classical chance. 448 twins: `l3-postulates`,
`l4-projectors`.

**Openers and films.** One Motion Canvas film is planned and deferred under the cap (§10). No Blender opener is new to
Q14 (Part V's "ball shrinks" opener is Q13's).

## 1. Story beats per unit
Kinds per unit (a derivation `view` may use only kinds the unit's beats show): `q14-pointer` circuit, matrix,
amplitudes · `q14-povm` bloch, matrix · `q14-neumark` circuit, matrix · `q14-usd` bloch, matrix, plot · `q14-min-error`
bloch-ball, matrix, plot · `q14-compare` plot, bloch. Fidelity items: the `matrix` items (`qc-matrix-entries`,
`qc-matrix-trace-engine`, `qc-matrix-not-a-space`), the new `qc-matrix-povm-engine` (§9.2), `qc-circuit-engine-state`,
`qc-amp-engine`, the `bloch`/`bloch-ball` items, and the new `qc-plot-engine-curve` for the discrimination curves (§9.2).

**Phase note.** Every ramp beat is `[B]` (`'books'`); clues are `[C]`. No `[L]`.

### Unit `q14-pointer` — Reading a qubit through a meter

**`q14-pointer:b1` [B]** (how a real measurement works)
- **G:** "A measurement is never magic. You couple the system to a meter — a pointer, a needle, a screen — let them interact, then read the meter. The meter is big enough to read by eye."
- **F:** "Bergou's model (§5.2) couples the observable $X$ to a pointer's momentum $P$ through $H \supset \hbar gXP$, evolves by $U = e^{-igtXP}$, and the pointer shifts to a position $x_j = gt\lambda_j$ that reads off $X$'s eigenvalue $\lambda_j$ (Eqs. 5.3–5.7)."
- **Cap:** G "couple the system to a meter, then read the meter" · F "$H \supset \hbar gXP$, $U = e^{-igtXP}$: the pointer shifts by $gt\lambda_j$"
- **Stage:** `circ(C_METER, 0, {})` — the system and meter wires, before coupling. needs: circuit.
- **Terms:** `qc-generalized-measurement` (defined here), `qc-projective-measurement` (Q3, link-back).

**`q14-pointer:b2` [B]** (a meter can be soft)
- **G:** "Make the meter sharp and you get the usual measurement: $|0\rangle$ or $|1\rangle$, nothing between. Make it a little blurry and you get a softer reading — a lean toward up or down that is not quite certain."
- **F:** "A noisy $Z$ meter is described not by the projectors $|0\rangle\langle0|, |1\rangle\langle1|$ but by two operators $E_\pm = \tfrac12(I \pm \eta Z)$, with sharpness $0 \le \eta \le 1$. At $\eta = 1$ it is the sharp $Z$ measurement; below it the reading is unsharp but still positive."
- **Cap:** G "a sharp meter gives $|0\rangle$ or $|1\rangle$; a soft one only leans" · F "$E_\pm = \tfrac12(I \pm \eta Z)$: sharp at $\eta = 1$, unsharp below"
- **Stage:** `split( circ(C_METER, 1, {}) / mx(pv('unsharpZ', 'elements', {param:0.5}), {}) )` — the coupling, and the two soft operators $E_\pm$. needs: circuit, matrix-povm-source.
- **Claims:** `q14UnsharpElems` → $E_+ = \mathrm{diag}(0.75, 0.25)$, $E_- = \mathrm{diag}(0.25, 0.75)$ at $\eta = \tfrac12$.

**`q14-pointer:b3` [B]** (reading the soft meter)
- **G:** "Feed in $|0\rangle$ and the soft meter reads up with chance $0.75$, down with $0.25$ — usually right. Feed in $|+\rangle$ and it is a coin, $0.5$ each, because $|+\rangle$ leans neither way."
- **F:** "The outcome probabilities are $p_\pm = \mathrm{Tr}(E_\pm\rho)$ — the projective rule, with $E_\pm$ for the projectors. On $|0\rangle$: $(0.75, 0.25)$ at $\eta = \tfrac12$; on $|+\rangle$: $(0.5, 0.5)$. A blurry meter extracts less than a sharp one does."
- **Cap:** G "soft meter on $|0\rangle$: $0.75$ up, $0.25$ down; on $|+\rangle$: $0.5$ each" · F "$p_\pm = \mathrm{Tr}(E_\pm\rho)$: $(0.75, 0.25)$ on $|0\rangle$, $(0.5, 0.5)$ on $|+\rangle$"
- **Stage:** `split( amp({ket:'0'}, {mode:'probability'}) / mx(pv('unsharpZ', 'elements', {param:0.5}), {}) )` — the input $|0\rangle$, and $E_\pm$; the readings $0.75, 0.25$ in the caption. needs: amplitudes, matrix-povm-source.
- **Claims:** `q14UnsharpP0` → (0.75, 0.25); `q14UnsharpPplus` → (0.5, 0.5).

**`q14-pointer:b4` [C]** (is sharp the only kind?)
- **Q G:** "A sharp meter forces one of two answers. Is that the only kind of measurement a qubit allows?"
- **Q F:** "A projective qubit measurement gives at most two outcomes. Is every physical measurement of a qubit projective?"
- **Reveal G:** "No. A measurement is any coupling-and-read. Blur the meter and you get soft outcomes; use a bigger meter and you can get more than two. The next unit names this freedom."
- **Reveal F:** "No. Reading a meter realises $p_i = \mathrm{Tr}(E_i\rho)$ for operators $E_i$ that need not be orthogonal projectors — only positive and summing to $I$. That is strictly more general than the projective postulate (Chapter Q3)."
- **Reveal cap:** G/F "a measurement is any meter you can read; projective is the sharp special case"
- **Stage:** question `circ(C_METER, 1, {})`; reveal `mx(pv('unsharpZ', 'sum', {param:0.5}), {trace:true})` — $E_+ + E_- = I$. needs: circuit, matrix-povm-source.
- **Claims:** `q14UnsharpSum` → $I$.

### Unit `q14-povm` — More answers than dimensions

**`q14-povm:b1` [B]** (drop orthogonality)
- **G:** "A sharp measurement sorts states into boxes that do not overlap — at most one box per dimension. Drop that rule. Keep only what you cannot do without: each outcome a positive operator, and all adding to the identity."
- **F:** "Abandon Bergou's Postulate 2 (orthogonality, $P_iP_j = \delta_{ij}P_i$). Keep Postulate 1 as $\sum_i E_i = I$ with each $E_i \ge 0$. Orthogonality was the only thing capping the outcome count at the dimension (§5.3)."
- **Cap:** G "keep only this: each outcome positive, all adding to $I$" · F "drop orthogonality; keep $\sum_i E_i = I$, $E_i \ge 0$"
- **Stage:** `split( mx(out('0'), {}) / mx(out('1'), {}) )` — the two sharp projectors $|0\rangle\langle0|, |1\rangle\langle1|$ that add to $I$, the case we generalize. needs: matrix.
- **Terms:** `qc-projective-measurement` (Q3, link-back).

**`q14-povm:b2` [B] · notation beat, `introduces: ['qc-povm-element']`** (the POVM)
- **G:** "This is a [[qc-povm-element|POVM]]: a set of positive operators $E_i$ that add to the identity. Each is an outcome. The chance of outcome $i$ on a state $\rho$ is $\mathrm{Tr}(E_i\rho)$, the same rule as before with $E_i$ in place of the projector. (Bergou writes $\Pi_j$.)"
- **F:** "A POVM is a decomposition of the identity into positive operators, $\sum_i E_i = I$, $E_i \ge 0$ (Bergou §5.3; N&C Eq. 2.117). The [[qc-povm-element|elements]] $E_i$ give $p_i = \mathrm{Tr}(E_i\rho)$ (Postulate 5′): positivity keeps $p_i \ge 0$, completeness keeps $\sum_i p_i = 1$."
- **Cap:** G "a POVM: positive $E_i$ with $\sum_i E_i = I$; outcome $i$ has chance $\mathrm{Tr}(E_i\rho)$" · F "$\sum_i E_i = I$, $E_i \ge 0$; $p_i = \mathrm{Tr}(E_i\rho)$ (Bergou $\Pi_j$, N&C $E_m$)"
- **Stage:** `split( bl({states:'trine'}) / mx(pv('trine', 'sum', {}), {trace:true}) )` — the three trine directions on the sphere, and their elements summing to $I$. needs: bloch, matrix-povm-source.
- **Claims:** `q14TrineSum` → $I$.
- **Terms:** `qc-povm-element` (notation beat), `qc-povm` (defined here).

**`q14-povm:b3` [B]** (detection operators; the trine built)
- **G:** "Where do the elements come from? Each outcome has a detection operator $A_i$, with $E_i = A_i^\dagger A_i$ — positive by construction. The trine uses three, $A_j = \sqrt{2/3}\,|\psi_j\rangle\langle\psi_j|$, for three states $120°$ apart."
- **F:** "Each $E_i = A_i^\dagger A_i$ for a detection operator $A_i = U_i\sqrt{E_i}$ (Bergou Eq. 5.11, the polar form, $U_i$ an arbitrary unitary) — the measurement twin of Chapter Q13's Kraus operators. The trine ensemble (Eq. 5.24) takes $A_j = \sqrt{2/3}\,|\psi_j\rangle\langle\psi_j|$."
- **Cap:** G "detection operator $A_i$: $E_i = A_i^\dagger A_i$; trine $A_j = \sqrt{2/3}|\psi_j\rangle\langle\psi_j|$" · F "$E_i = A_i^\dagger A_i$, $A_i = U_i\sqrt{E_i}$ (polar); trine $A_j = \sqrt{2/3}|\psi_j\rangle\langle\psi_j|$"
- **Stage:** `mx(pv('trine', 'elements', {}), {})` — the three trine elements $E_0, E_1, E_2$. needs: matrix-povm-source.
- **Claims:** `q14TrineElems` → the three $\tfrac23|\psi_j\rangle\langle\psi_j|$ (each trace $\tfrac23$).
- **Terms:** `qc-detection-operator` (defined here), `qc-trine` (defined here), `qc-kraus-operator` (Q13, link-back).

**`q14-povm:b4` [C]** (how many outcomes can a qubit have?)
- **Q G:** "A sharp qubit measurement has two outcomes. The trine has three. Is there a ceiling on how many a POVM can have?"
- **Q F:** "Projective measurement caps outcomes at the dimension ($2$ for a qubit). What caps the number of POVM elements?"
- **Reveal G:** "No ceiling. Orthogonality was the only thing holding the count to the dimension, and a POVM drops it. A qubit POVM can have three, four or more — as many positive operators as you can make add to $I$."
- **Reveal F:** "Nothing caps it. Without the constraint $P_iP_j = \delta_{ij}P_i$, the number of terms in $\sum_i E_i = I$ is unbounded (Bergou §5.3). Only positivity and completeness remain; a qubit admits POVMs with arbitrarily many outcomes."
- **Reveal cap:** G/F "no ceiling: a qubit POVM can have any number of outcomes"
- **Stage:** question `mx(out('0'), {})` (one sharp projector); reveal `mx(pv('trine', 'sum', {}), {trace:true})` (three elements summing to $I$). needs: matrix, matrix-povm-source.
- **Claims:** `q14TrineSum` (reused).

### Unit `q14-neumark` — Every POVM is projective upstairs

**`q14-neumark:b1` [B] · notation beat, `introduces: ['qc-dilation-space']`** (the ancilla extension)
- **G:** "Is a POVM a real measurement, or just arithmetic? It is real. Add a second system — an [[qc-dilation-space|ancilla]] — couple the two with one unitary, then make an ordinary sharp measurement on the ancilla. The system feels a POVM."
- **F:** "Work in the enlarged space $H_A \otimes H_B$ — the system $A$ and an [[qc-dilation-space|ancilla]] $B$ in a fixed state $|\psi_B\rangle$ (Bergou §5.4). A joint unitary $U_{AB}$, then a projective measurement $I_A \otimes |m_B\rangle\langle m_B|$ on the ancilla, gives outcome $m$ with probability $\lVert(I_A\otimes|m_B\rangle\langle m_B|)U_{AB}|\psi_A\rangle|\psi_B\rangle\rVert^2$ (Eq. 5.15)."
- **Cap:** G "add an ancilla, couple, then measure the ancilla sharply" · F "in $H_A\otimes H_B$: a unitary $U_{AB}$, then a projective measurement on $B$"
- **Stage:** `circ(C_METER, 1, {})` — the system and ancilla, coupled by $U_{SM}$, the ancilla about to be read. needs: circuit.
- **Terms:** `qc-dilation-space` (notation beat, space), `qc-ancilla` (defined here), `qc-stinespring` (Q13, link-back).

**`q14-neumark:b2` [B]** (read the ancilla → a POVM)
- **G:** "Reading the ancilla in state $|m\rangle$ leaves the system acted on by $A_m$, where $A_m|\psi\rangle = \langle m|U_{AB}(|\psi\rangle|\psi_B\rangle)$. Because $U_{AB}$ is unitary, $\sum_m A_m^\dagger A_m = I$ — so $\{A_m^\dagger A_m\}$ is a POVM."
- **F:** "Define $A_m|\psi_A\rangle = \langle m_B|U_{AB}(|\psi_A\rangle\otimes|\psi_B\rangle)$ (Eq. 5.16). Then $p_m = \langle\psi_A|A_m^\dagger A_m|\psi_A\rangle$ (Eq. 5.17), and unitarity forces $\sum_m A_m^\dagger A_m = I_A$ (Eqs. 5.18–5.19). An ancilla measurement always realises the POVM $\{A_m^\dagger A_m\}$ — the first half of Neumark's theorem."
- **Cap:** G "$A_m|\psi\rangle = \langle m|U_{AB}(|\psi\rangle|\psi_B\rangle)$; $\sum_m A_m^\dagger A_m = I$" · F "$p_m = \langle\psi|A_m^\dagger A_m|\psi\rangle$, $\sum_m A_m^\dagger A_m = I_A$ (unitarity)"
- **Stage:** `split( circ(C_METER, 2, {}) / mx(pv('unsharpZ', 'sum', {param:0.5}), {trace:true}) )` — the ancilla read, and $\sum_m A_m^\dagger A_m = I$. needs: circuit, matrix-povm-source.
- **Claims:** `q14UnsharpSum` (reused) → $I$.
- **Terms:** `qc-neumark` (defined here).

**`q14-neumark:b3` [B]** (the converse; the isometry $V$)
- **G:** "The converse also holds. Given any POVM, build $V|\psi\rangle = \sum_m A_m|\psi\rangle\otimes|m\rangle$. Because $\sum_m A_m^\dagger A_m = I$, it keeps inner products: $V^\dagger V = I$. So it extends to a unitary — every POVM is a sharp measurement upstairs."
- **F:** "Given $\{A_m\}$ with $\sum_m A_m^\dagger A_m = I$, set $U_{AB}(|\psi_A\rangle|\psi_B\rangle) = \sum_m A_m|\psi_A\rangle\otimes|m_B\rangle$ (Eq. 5.22). This is inner-product preserving (Eq. 5.23: $V^\dagger V = \sum_m A_m^\dagger A_m = I$), so it is an isometry that extends to a unitary. Neumark: POVMs and ancilla measurements correspond one-to-one."
- **Cap:** G "$V = \sum_m A_m\otimes|m\rangle$, $V^\dagger V = I$: extends to a unitary" · F "$V^\dagger V = \sum_m A_m^\dagger A_m = I$: an isometry, extended to $U_{AB}$"
- **Stage:** `split( mx(pv('trine', 'dilationV', {}), {}) / mx(pv('trine', 'dilationVdagV', {}), {trace:true}) )` — the trine's $6\times2$ isometry $V$, and $V^\dagger V = I$. needs: matrix-povm-source.
- **Claims:** `q14NeumarkVdagV` → $I$ (= $V^\dagger V$).

**`q14-neumark:b4` [C]** (the trine's ancilla; the chances match)
- **Q G:** "The trine needs three outcomes. How big an ancilla does its sharp-measurement version need, and does it give the same chances?"
- **Q F:** "What ancilla dimension realises the trine POVM, and does the dilated projective measurement reproduce $\mathrm{Tr}(E_j\rho)$?"
- **Reveal G:** "A qutrit — a three-level ancilla, one level per outcome. The sharp measurement on the enlarged space gives exactly the trine chances: on $|0\rangle$, $(1/6, 1/6, 2/3)$, the same as $\mathrm{Tr}(E_j\rho)$. Nothing is lost in the lift."
- **Reveal F:** "A three-dimensional ancilla ($m = 3$; Bergou Eqs. 5.26–5.31). The dilated measurement $I_A\otimes|m\rangle\langle m|$ on $V\rho V^\dagger$ returns $\mathrm{Tr}(E_j\rho)$ exactly — on $|0\rangle$, $(1/6, 1/6, 2/3)$ — the defining property of the dilation."
- **Reveal cap:** G/F "a qutrit ancilla; the lift reproduces $\mathrm{Tr}(E_j\rho)$ exactly"
- **Stage:** question `mx(pv('trine', 'dilationV', {}), {})`; reveal `mx(pv('trine', 'dilationProj', {index:2}), {})`, the matched chances $(1/6, 1/6, 2/3)$ in the caption. needs: matrix-povm-source.
- **Claims:** `q14NeumarkMatch` → (0.1667, 0.1667, 0.6667); `q14TrineOn0` (reused).

### Unit `q14-usd` — Never wrong, sometimes unsure

**`q14-usd:b1` [B]** (perfect sorting is impossible; D4)
- **G:** "Alice hands Bob a state, either $|\psi_1\rangle$ or $|\psi_2\rangle$ — he knows both, not which. If they are not perpendicular, no measurement can name the state and never be wrong. Perfect sorting would force $\langle\psi_1|\psi_2\rangle = 0$."
- **F:** "Two non-orthogonal states $|\psi_1\rangle, |\psi_2\rangle$, priors $\eta_1, \eta_2$. Suppose detectors $E_1 + E_2 = I$ never err: $E_1|\psi_2\rangle = E_2|\psi_1\rangle = 0$ (Eqs. 5.32–5.33). Sandwiching $E_1 + E_2 = I$ between $\langle\psi_1|$ and $|\psi_2\rangle$ gives $\langle\psi_1|\psi_2\rangle = 0$ — only orthogonal states allow it (§5.5.1)."
- **Cap:** G "never-wrong sorting of non-perpendicular states would force $\langle\psi_1|\psi_2\rangle = 0$" · F "$E_1|\psi_2\rangle = E_2|\psi_1\rangle = 0$, $E_1+E_2 = I \Rightarrow \langle\psi_1|\psi_2\rangle = 0$"
- **Stage:** `bl({states:['0', '+']})` — the two states $|0\rangle, |+\rangle$ and the angle between them. needs: bloch.
- **Terms:** `qc-unambiguous-discrimination` (defined here), `qc-prior` (defined here).

**`q14-usd:b2` [B] · notation beat, `introduces: ['qc-inconclusive-outcome']`** (add a third answer)
- **G:** "The fix is to allow a third answer: [[qc-inconclusive-outcome|don't know]]. Keep two detectors that never lie — $E_1$ fires only on $|\psi_2\rangle$'s side, $E_2$ only on $|\psi_1\rangle$'s. Sweep the rest into $E_0$, the inconclusive one: $E_1 + E_2 + E_0 = I$."
- **F:** "Introduce a third POVM element $E_0 \ge 0$ with $E_1 + E_2 + E_0 = I$ (Eq. 5.34), keeping $E_1|\psi_2\rangle = E_2|\psi_1\rangle = 0$. The [[qc-inconclusive-outcome|inconclusive outcome]] $E_0$ can fire for either state; it is not an error, Bob simply declines. Then $p_1 + q_1 = p_2 + q_2 = 1$."
- **Cap:** G "add a third 'don't know' outcome $E_0$: $E_1 + E_2 + E_0 = I$" · F "$E_1 + E_2 + E_0 = I$; $E_0 \ge 0$ inconclusive, never an error"
- **Stage:** `mx(pv('nc-usd', 'elements', {}), {})` — the three elements $E_1, E_2, E_0$ (N&C Eqs. 2.118–2.120). needs: matrix-povm-source.
- **Claims:** `q14NcConst` → 0.5858 ($= 2 - \sqrt2$); `q14NcElemsSum` → $I$.
- **Terms:** `qc-inconclusive-outcome` (notation beat).

**`q14-usd:b3` [B]** (how often can Bob answer?)
- **G:** "How often can Bob answer? For $|0\rangle$ and $|+\rangle$ at even odds, he succeeds with chance $1 - 1/\sqrt2 = 0.2929$ and is unsure the rest, $0.7071$. The closer the two states, the more often he must say 'don't know'."
- **F:** "At equal priors the optimal success is $1 - |\langle\psi_1|\psi_2\rangle|$ (Bergou's $Q^{\mathrm{POVM}} = 2\sqrt{\eta_1\eta_2}\cos\Theta$, Eq. 5.42, at $\eta_i = \tfrac12$). For $|0\rangle, |+\rangle$: $0.2929$, inconclusive $0.7071$. The N&C scheme (Eqs. 2.118–2.120) achieves it — $E_1$ never fires for $|0\rangle$, so a click means $|+\rangle$."
- **Cap:** G "$|0\rangle$ vs $|+\rangle$: answer $0.2929$, unsure $0.7071$" · F "optimal success $1 - |\langle\psi_1|\psi_2\rangle| = 0.2929$ for $|0\rangle, |+\rangle$"
- **Stage:** `split( bl({states:['0', '+'], perp:true}) / mx(pv('nc-usd', 'elements', {index:1}), {}) )` — the orthogonal directions the detectors point along, and $E_1 \propto |1\rangle\langle1|$. needs: bloch, matrix-povm-source.
- **Claims:** `q14UsdSucc` → 0.2929; `q14UsdInconcl` → 0.7071; `q14Overlap0Plus` → 0.7071.

**`q14-usd:b4` [C]** (when does USD fail completely?)
- **Q G:** "Push the two states together until they coincide. What does unambiguous discrimination give then?"
- **Q F:** "As $|\langle\psi_1|\psi_2\rangle| \to 1$, what happens to the USD success probability, and why?"
- **Reveal G:** "Nothing. At overlap $1$ the states are the same, and the success chance $1 - |\langle\psi_1|\psi_2\rangle|$ drops to $0$: Bob always says 'don't know'. Only perpendicular states, overlap $0$, let him answer every time."
- **Reveal F:** "It vanishes: $1 - |\langle\psi_1|\psi_2\rangle| \to 0$ as the overlap $\to 1$; identical states carry no distinguishing information. At the other end, orthogonal states (overlap $0$) give success $1$ — USD reduces to a sharp projective measurement."
- **Reveal cap:** G/F "success $1 - |\langle\psi_1|\psi_2\rangle|$: $0$ at identical, $1$ at orthogonal"
- **Stage:** question `bl({states:['0', '+']})`; reveal `plot('usdSuccessVsOverlap', {min:0, max:1}, {markers:[0.7071]})` — the success curve vs overlap, marked at $0.7071$. needs: bloch, plot.
- **Claims:** `q14UsdSucc` (reused).

### Unit `q14-min-error` — The fewest mistakes: Helstrom

**`q14-min-error:b1` [B]** (always guess; errors are unavoidable)
- **G:** "Sometimes you must answer every time — no 'don't know' allowed. Then for non-perpendicular states you will sometimes be wrong. The goal shifts: not 'never wrong' but 'wrong as rarely as possible'."
- **F:** "Minimum-error discrimination forbids the inconclusive outcome: $E_1 + E_2 = I$, a two-outcome POVM, always conclusive (§5.5.2). Errors are then unavoidable for non-orthogonal states; the task is to minimise $P_{\mathrm{err}} = \eta_1\mathrm{Tr}(\rho_1 E_2) + \eta_2\mathrm{Tr}(\rho_2 E_1)$ (Eq. 5.49)."
- **Cap:** G "answer every time; minimise how often you are wrong" · F "$E_1 + E_2 = I$; minimise $P_{\mathrm{err}} = \eta_1\mathrm{Tr}(\rho_1E_2) + \eta_2\mathrm{Tr}(\rho_2E_1)$"
- **Stage:** `ball({points:['0', '+']})` — the two states as points in the Bloch ball. needs: bloch-ball.
- **Terms:** `qc-minimum-error-discrimination` (defined here).

**`q14-min-error:b2` [B] · notation beat, `introduces: ['qc-helstrom-bound']`** (the Helstrom operator)
- **G:** "The trick: form $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$ and look at its eigenvalues. Guess state $2$ where $\Gamma$ is positive, state $1$ where it is negative. The leftover error is the [[qc-helstrom-bound|Helstrom bound]], fixed by the size of $\Gamma$."
- **F:** "Form the Hermitian $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$ (Eq. 5.51). The optimal measurement projects onto its positive ($E_2$) and negative ($E_1$) eigenspaces, giving the [[qc-helstrom-bound|Helstrom bound]] $P_E = \tfrac12(1 - \lVert\Gamma\rVert_1)$ (Eq. 5.58), $\lVert\cdot\rVert_1$ the trace norm (Chapter Q9)."
- **Cap:** G "$\Gamma = \eta_2\rho_2 - \eta_1\rho_1$; the error is set by its size, the Helstrom bound" · F "$P_E = \tfrac12(1 - \lVert\eta_2\rho_2 - \eta_1\rho_1\rVert_1)$ (project on $\Gamma$'s $\pm$ eigenspaces)"
- **Stage:** `mx(lin([0.5, rho('+')], [-0.5, rho('0')]), {spectrum:'bars'})` — $\Gamma = \tfrac12(\rho_2 - \rho_1)$ at equal priors, eigenvalues $\pm0.3536$. needs: matrix-v2.
- **Claims:** `q14HelstromGammaSpec` → (−0.3536, 0.3536).
- **Terms:** `qc-helstrom-bound` (notation beat), `qc-trace-distance` (Q9, link-back).

**`q14-min-error:b3` [B]** (the bound evaluated)
- **G:** "For $|0\rangle$ and $|+\rangle$ at even odds, the best you can do is be right $0.8536$ of the time, wrong $0.1464$. That answers far more often than the unambiguous scheme — but it is sometimes wrong, which that never is."
- **F:** "For two equiprobable pure states, $P_E = \tfrac12(1 - \sqrt{1 - |\langle\psi_1|\psi_2\rangle|^2})$ (Eq. 5.59). For $|0\rangle, |+\rangle$: success $0.8536$, error $0.1464$. Here $\lVert\Gamma\rVert_1 = 2(0.3536) = 0.7071$, so $P_{\mathrm{succ}} = \tfrac12(1 + 0.7071)$."
- **Cap:** G "$|0\rangle$ vs $|+\rangle$: right $0.8536$, wrong $0.1464$" · F "$P_E = \tfrac12(1 - \sqrt{1 - |\langle\psi_1|\psi_2\rangle|^2}) = 0.1464$"
- **Stage:** `split( ball({points:['0', '+'], axis:'helstrom'}) / plot('helstromErrorVsOverlap', {min:0, max:1}, {markers:[0.7071]}) )` — the optimal split axis, and the error curve vs overlap. needs: bloch-ball, plot.
- **Claims:** `q14HelstromSucc` → 0.8536; `q14HelstromErr` → 0.1464.

**`q14-min-error:b4` [C]** (when is no measurement best?)
- **Q G:** "Suppose one state is far more likely than the other. Is a clever measurement always worth it?"
- **Q F:** "If $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$ has no negative eigenvalue, what is the minimum-error strategy?"
- **Reveal G:** "Not always. If one state is likely enough, the best move is to skip the measurement and always guess that state. A measurement helps only when both guesses are live — when $\Gamma$ has a positive and a negative eigenvalue."
- **Reveal F:** "If $\Gamma$ has no negative eigenvalue then $E_1 = 0$, $E_2 = I$: always guess $\rho_2$, no measurement, error $\eta_{\min}$ (Bergou p. 97). A measurement lowers the error only when $\Gamma$ straddles zero."
- **Reveal cap:** G/F "if $\Gamma$ has one sign, always guess the likelier state — no measurement"
- **Stage:** question `mx(lin([0.5, rho('+')], [-0.5, rho('0')]), {spectrum:'bars'})` (both signs present); reveal the same with the caption that a one-sign $\Gamma$ means guess-always. needs: matrix-v2.
- **Claims:** `q14HelstromGammaSpec` (reused).

### Unit `q14-compare` — The price of certainty

**`q14-compare:b1` [B]** (two strategies, side by side)
- **G:** "Two ways to tell $|\psi_1\rangle$ from $|\psi_2\rangle$. Unambiguous: never wrong, but often unsure. Minimum-error: always answers, but sometimes wrong. They are two faces of one limit — you cannot have both at once."
- **F:** "The two strategies are complementary (§5.5). Unambiguous discrimination (Unit 14.4) never errs but has an inconclusive rate; minimum-error (Unit 14.5) is always conclusive but has an error rate. Neither tells non-orthogonal states apart perfectly — the overlap $|\langle\psi_1|\psi_2\rangle|$ prices both."
- **Cap:** G "unambiguous: never wrong, often unsure; minimum-error: always answers, sometimes wrong" · F "complementary strategies; the overlap $|\langle\psi_1|\psi_2\rangle|$ prices both"
- **Stage:** `bl({states:['0', '+']})` — the two states whose overlap drives both. needs: bloch.
- **Terms:** `qc-unambiguous-discrimination`, `qc-minimum-error-discrimination` (link-backs).

**`q14-compare:b2` [B]** (the two curves; D6)
- **G:** "Plot both against the overlap. Minimum-error always succeeds more often — it spends its mistakes to answer every time. The curves meet only at the ends: both perfect when the states are perpendicular, both useless when they coincide."
- **F:** "Against the overlap $c = |\langle\psi_1|\psi_2\rangle|$ at equal priors: minimum-error success $\tfrac12(1 + \sqrt{1 - c^2})$, unambiguous success $1 - c$. The first dominates throughout $(0, 1)$; they coincide at $c = 0$ (both $1$), and at $c = 1$ the min-error curve ends at $\tfrac12$, the unambiguous at $0$."
- **Cap:** G "both curves vs overlap: min-error always above; equal only at the ends" · F "min-error $\tfrac12(1 + \sqrt{1 - c^2})$ vs unambiguous $1 - c$; equal at $c = 0$"
- **Stage:** `plot('discrimCompare', {min:0, max:1}, {markers:[0.7071]})` — the Helstrom and USD success curves together, marked at the $|0\rangle, |+\rangle$ overlap. needs: plot.
- **Claims:** `q14HelstromSucc` (reused) → 0.8536; `q14UsdSucc` (reused) → 0.2929; `q14CompareC0` → (1, 1).

**`q14-compare:b3` [B]** (the exact trade-off)
- **G:** "The exact rule: the fewest mistakes you can make is at most half the fraction you fail to answer. Pay with answered trials — $0.7071$ unsure — and you never err; pay with errors — $0.1464$ — and you answer every time."
- **F:** "The two optima satisfy $P_E \le \tfrac12 Q_{\mathrm{opt}}$ (Eq. 5.61): the minimum error is at most half the minimum inconclusive rate. For $|0\rangle, |+\rangle$: $P_E = 0.1464 \le \tfrac12(0.7071) = 0.3536$. Certainty costs answered trials; answers cost accuracy."
- **Cap:** G "$P_E \le \tfrac12 Q$: never-wrong costs answers; always-answer costs accuracy" · F "$P_E \le \tfrac12 Q_{\mathrm{opt}}$; $0.1464 \le 0.3536$ for $|0\rangle, |+\rangle$"
- **Stage:** `plot('discrimCompare', {min:0, max:1}, {markers:[0.7071], bands:['error', 'halfFail']})` — the error region under half the failure region. needs: plot.
- **Claims:** `q14HelstromErr` (reused) → 0.1464; `q14UsdInconcl` (reused) → 0.7071.

**`q14-compare:b4` [C]** (which does cryptography use?)
- **Q G:** "Quantum key distribution asks an eavesdropper to tell apart non-orthogonal states. Which strategy would she pick?"
- **Q F:** "In the B92 protocol an eavesdropper must distinguish $|0\rangle$ and $|+\rangle$. Does unambiguous or minimum-error discrimination bound her best attack?"
- **Reveal G:** "Both describe attacks. An unambiguous eavesdropper learns for sure but only sometimes; a minimum-error one always guesses but adds errors the receiver can catch. The $0.2929$ and $0.1464$ here are the exact numbers the next part's analysis uses."
- **Reveal F:** "Both: the B92 security argument (Bergou §6.3, next part) weighs an unambiguous Eve against a minimum-error Eve using exactly these bounds for $|0\rangle, |+\rangle$. The overlap $1/\sqrt2$ fixes her success and the error she imposes — this chapter's numbers return as a key rate."
- **Reveal cap:** G/F "both bound an eavesdropper; the next part's B92 protocol uses these exact numbers"
- **Stage:** question `bl({states:['0', '+']})`; reveal `plot('discrimCompare', {min:0, max:1}, {markers:[0.7071]})`. needs: bloch, plot.
- **Claims:** `q14UsdSucc` (reused), `q14HelstromErr` (reused).

### 1.7 Claim ledger (engine call → value; numpy route)
All values verified twice (`q14plan-verify.py`: route A the engine's algorithm, route B a closed form; agree to 6
decimals). The trine, N&C-USD and unsharp POVMs are **built in `Q14.values.ts` from primitives** (`ket`, `outer`,
`mscale`, `madd`) and **verified by `isPOVM`**; `neumark` supplies $V$ and the projectors. Twins in
`pipeline/make_qc_fixtures.py` block "povm" (seed 709) by the independent scipy route.

| Key | Engine call (`Q14.values.ts`) | Value | numpy route |
|---|---|---|---|
| `q14UnsharpElems` | `unsharpZ(0.5)` = $[\tfrac12(I+\tfrac12Z), \tfrac12(I-\tfrac12Z)]$ | $\mathrm{diag}(0.75,0.25)$, $\mathrm{diag}(0.25,0.75)$ | explicit $\tfrac12(I\pm\eta Z)$ |
| `q14UnsharpP0` | `bornPovm(unsharpZ(0.5), out(ket('0')))` | (0.75, 0.25) | $\tfrac12(1\pm\eta)$ |
| `q14UnsharpPplus` | `bornPovm(unsharpZ(0.5), out(ket('+')))` | (0.5, 0.5) | $\tfrac12$ each |
| `q14UnsharpSum` | `madd(E₊, E₋)` | $I$ | $I$ |
| `q14TrineSum` | sum of `trine()` elements | $I$ | $\sum\tfrac23|\psi_j\rangle\langle\psi_j|$ |
| `q14TrineElems` | `trine()` (built + `isPOVM`) | $E_j = \tfrac23|\psi_j\rangle\langle\psi_j|$ | explicit (Eq. 5.24–5.25) |
| `q14TrineCorrect` | `bornPovm(trine(), out(ψ_j))[j]` | 0.6667 | $\tfrac23$ |
| `q14TrineError` | `bornPovm(trine(), out(ψ_0))[1]` | 0.1667 | $\tfrac16$ |
| `q14TrineOn0` | `bornPovm(trine(), out(ket('0')))` | (0.1667, 0.1667, 0.6667) | $[\tfrac16,\tfrac16,\tfrac23]$ |
| `q14NeumarkVdagV` | `dagger(neumark(trine()).V) · V` | $I$ | $6\times2$ isometry |
| `q14NeumarkMatch` | `Tr(proj_i · VρV†)` vs `bornPovm`, ρ = |0⟩ | (0.1667, 0.1667, 0.6667) | $\mathrm{Tr}(P_i V\rho V^\dagger)$ |
| `q14NeumarkAncillaDim` | `neumark(trine()).projectors.length` | 3 | number of outcomes $m$ |
| `q14Overlap0Plus` | `abs(inner(ket('0'), ket('+')))` | 0.7071 | $1/\sqrt2$ |
| `q14UsdSucc` | `usd([ket('0'), ket('+')])` | 0.2929 | $1 - \cos45°$ |
| `q14UsdInconcl` | `1 - usd([ket('0'), ket('+')])` | 0.7071 | $1/\sqrt2$ |
| `q14NcConst` | `sqrt2 / (1 + sqrt2)` | 0.5858 | $2 - \sqrt2$ |
| `q14NcElemsSum` | sum of `ncUsd()` elements | $I$ | $E_1+E_2+E_0$ |
| `q14HelstromSucc` | `helstrom(out(ket('0')), out(ket('+')), 0.5)` | 0.8536 | $\tfrac12(1+\sqrt{1-c^2})$ |
| `q14HelstromErr` | `1 - helstrom(...)` | 0.1464 | $\tfrac12(1-\sqrt{1-c^2})$ |
| `q14HelstromGammaSpec` | `spectrum(½(ρ₊ − ρ₀))` | (−0.3536, 0.3536) | `eigvalsh` |
| `q14CompareC0` | `(helstrom, usd)` at overlap 0 | (1, 1) | both $1$ |
| `q14Fig51Lo`, `q14Fig51Hi` | $\cos^2\!\Theta/(1+\cos^2\!\Theta)$, $1/(1+\cos^2\!\Theta)$ at $\cos^2\!\Theta = 0.1$ | 0.0909, 0.9091 | $1/11$, $10/11$ |

## 2. Derivations
Each step is `tex` — `why` — **view** — *viewCaption*. A step without a view inherits the previous one in its own
list. Every list has ≥ 2 distinct views, every view uses a kind its unit's beats show, the last `tex` ends on the
result, and Ground steps ≥ Formal steps.

**D1 · `q14-pointer:b3` · result `p_\pm = \mathrm{Tr}(E_\pm\rho),\ p_+ = 0.75 \text{ on } |0\rangle`** (Bergou §5.3 Postulate 5′; N&C Eq. 2.92)
- Ground (3 views):
  1. `p_+ = \mathrm{Tr}(E_+\,|0\rangle\langle0|)` — The soft meter's up-chance is the Born rule with $E_+$ for the projector. **view** `circ(C_METER, 2, {})` · *read the meter on input $|0\rangle$*
  2. `E_+ = \tfrac12(I + \tfrac12 Z) = \mathrm{diag}(\tfrac34, \tfrac14)` — The up-element is a blurred $|0\rangle\langle0|$. **view** `mx(pv('unsharpZ','elements',{param:0.5, index:0}), {})` · *$E_+ = \mathrm{diag}(0.75, 0.25)$*
  3. `p_+ = \tfrac12(1 + \tfrac12) = 0.75` — Its top-left entry is the chance on $|0\rangle$. **view** `amp({ket:'0'}, {mode:'probability'})` · *input $|0\rangle$, up-chance $0.75$*
  4. `p_\pm = \mathrm{Tr}(E_\pm\rho),\quad p_+ = 0.75 \text{ on } |0\rangle` — The soft meter's rule, evaluated.
- Formal (2 views):
  1. `p_+ = \mathrm{Tr}(E_+\rho) = \tfrac12\mathrm{Tr}(\rho) + \tfrac{\eta}{2}\mathrm{Tr}(Z\rho)` — Linearity of the trace on $E_+ = \tfrac12(I + \eta Z)$. **view** `mx(pv('unsharpZ','elements',{param:0.5, index:0}), {})`
  2. `p_+ = \tfrac12(1 + \eta\langle Z\rangle) = 0.75` — $\langle Z\rangle = 1$ on $|0\rangle$, $\eta = \tfrac12$. **view** `amp({ket:'0'}, {mode:'probability'})`
- Check: `q14UnsharpP0`. Needs: circuit, matrix-povm-source, amplitudes.

**D2 · `q14-povm:b2` · result `\sum_{j=0}^{2}\tfrac23|\psi_j\rangle\langle\psi_j| = I`** (Bergou Eqs. 5.24–5.25)
- Ground (3 views):
  1. `|\psi_0\rangle, |\psi_1\rangle, |\psi_2\rangle \text{ at } 120°` — Three symmetric states on a great circle. **view** `bl({states:'trine'})` · *the trine, $120°$ apart*
  2. `E_j = \tfrac23|\psi_j\rangle\langle\psi_j| \ge 0` — Each element is a positive rank-one operator. **view** `mx(pv('trine','elements',{index:0}), {})` · *$E_0 = \tfrac23|\psi_0\rangle\langle\psi_0|$*
  3. `\sum_j E_j = \tfrac23\sum_j|\psi_j\rangle\langle\psi_j| = \tfrac23\cdot\tfrac32 I` — The three rank-ones sum to $\tfrac32 I$. **view** `mx(pv('trine','sum',{}), {trace:true})` · *$\sum_j E_j = I$*
  4. `\sum_{j=0}^{2}\tfrac23|\psi_j\rangle\langle\psi_j| = I` — A legitimate three-outcome POVM on a qubit.
- Formal (2 views):
  1. `\sum_j|\psi_j\rangle\langle\psi_j| = \tfrac32 I` — The symmetric trine resolves $\tfrac32 I$ by equal spacing. **view** `bl({states:'trine'})`
  2. `\sum_j\tfrac23|\psi_j\rangle\langle\psi_j| = I,\ E_j \ge 0` — Positivity and completeness: a POVM. **view** `mx(pv('trine','sum',{}), {trace:true})`
- Check: `q14TrineSum`. Needs: bloch, matrix-povm-source.

**D3 · `q14-neumark:b3` · result `V^\dagger V = I \Rightarrow V \text{ extends to a unitary } U_{AB}`** (Bergou Eqs. 5.21–5.23)
- Ground (3 views):
  1. `V|\psi\rangle = \sum_m A_m|\psi\rangle\otimes|m\rangle` — File each outcome's detection into a fresh ancilla slot. **view** `circ(C_METER, 1, {})` · *$V$: system into system + ancilla*
  2. `V^\dagger V = \sum_m A_m^\dagger A_m` — Its inner-product operator is the POVM's detection sum. **view** `mx(pv('trine','dilationV',{}), {})` · *the $6\times2$ isometry $V$*
  3. `V^\dagger V = I` — Completeness makes $V$ keep every inner product. **view** `mx(pv('trine','dilationVdagV',{}), {trace:true})` · *$V^\dagger V = I$*
  4. `V^\dagger V = I \Rightarrow V \text{ extends to a unitary } U_{AB}` — Every POVM is a sharp measurement upstairs.
- Formal (2 views):
  1. `V^\dagger V = \sum_m A_m^\dagger A_m = I` — $V$ is an isometry on $H_A$ (completeness, Unit 14.3). **view** `mx(pv('trine','dilationVdagV',{}), {trace:true})`
  2. `V^\dagger V = I \Rightarrow U_{AB} \text{ unitary}` — Extend $V$ by the identity on the complement of $|\psi_B\rangle$. **view** `circ(C_METER, 2, {})`
- Check: `q14NeumarkVdagV`. Needs: circuit, matrix-povm-source.

**D4 · `q14-usd:b1` · result `E_1 + E_2 = I,\ E_1|\psi_2\rangle = E_2|\psi_1\rangle = 0 \Rightarrow \langle\psi_1|\psi_2\rangle = 0`** (Bergou Eqs. 5.32–5.33)
- Ground (3 views):
  1. `E_1 + E_2 = I,\quad E_1|\psi_2\rangle = 0,\ E_2|\psi_1\rangle = 0` — Assume two detectors that never err. **view** `bl({states:['0','+']})` · *the two non-perpendicular states*
  2. `\langle\psi_1|(E_1 + E_2)|\psi_2\rangle = \langle\psi_1|\psi_2\rangle` — Sandwich the identity between the two states. **view** `mx(pv('nc-usd','elements',{index:0}), {})` · *$E_1$ kills $|\psi_2\rangle$'s side*
  3. `\langle\psi_1|E_1|\psi_2\rangle + \langle\psi_1|E_2|\psi_2\rangle = 0 + 0` — Both terms vanish by the never-err condition. **view** `bl({states:['0','+'], perp:true})` · *each detector aims at the other's perpendicular*
  4. `\langle\psi_1|\psi_2\rangle = 0` — Perfect sorting forces orthogonality (so $|0\rangle, |+\rangle$, overlap $0.7071$, cannot be perfectly sorted).
- Formal (2 views):
  1. `\langle\psi_1|(E_1 + E_2)|\psi_2\rangle = \langle\psi_1|E_1|\psi_2\rangle + \langle\psi_1|E_2|\psi_2\rangle = 0` — $E_1|\psi_2\rangle = 0$ and $\langle\psi_1|E_2 = 0$ (Hermitian). **view** `mx(pv('nc-usd','elements',{index:0}), {})`
  2. `\langle\psi_1|\psi_2\rangle = 0` — But the left side is $\langle\psi_1|I|\psi_2\rangle$; possible only if orthogonal. **view** `bl({states:['0','+']})`
- Check: `q14Overlap0Plus` (the contrapositive: overlap $0.7071 \ne 0$). Needs: bloch, matrix-povm-source.

**D5 · `q14-min-error:b3` · result `P_E = \tfrac12(1 - \sqrt{1 - |\langle\psi_1|\psi_2\rangle|^2}) = 0.1464`** (Bergou Eqs. 5.56–5.59)
- Ground (3 views):
  1. `\Gamma = \tfrac12(\rho_2 - \rho_1),\quad \lambda = \pm0.3536` — Form the Helstrom operator at equal priors; read its eigenvalues. **view** `mx(lin([0.5, rho('+')], [-0.5, rho('0')]), {spectrum:'bars'})` · *$\Gamma$'s spectrum $\pm0.3536$*
  2. `P_E = \tfrac12(1 - \lVert\Gamma\rVert_1) = \tfrac12(1 - 0.7071)` — Guess by the sign of $\Gamma$; the error is set by its trace norm. **view** `ball({points:['0','+'], axis:'helstrom'})` · *the optimal split between the two states*
  3. `P_E = 0.1464` — The fewest mistakes for this pair. **view** `plot('helstromErrorVsOverlap', {min:0, max:1}, {markers:[0.7071]})` · *the error curve, marked at overlap $0.7071$*
  4. `P_E = \tfrac12(1 - \sqrt{1 - |\langle\psi_1|\psi_2\rangle|^2}) = 0.1464` — The pure-state Helstrom bound.
- Formal (2 views):
  1. `P_E = \tfrac12(1 - \lVert\eta_2\rho_2 - \eta_1\rho_1\rVert_1)` — Project on $\Gamma$'s positive and negative eigenspaces (Eq. 5.58). **view** `mx(lin([0.5, rho('+')], [-0.5, rho('0')]), {spectrum:'bars'})`
  2. `= \tfrac12(1 - \sqrt{1 - 4\eta_1\eta_2|\langle\psi_1|\psi_2\rangle|^2}) = 0.1464` — The pure, equal-prior form (Eq. 5.59). **view** `plot('helstromErrorVsOverlap', {min:0, max:1}, {markers:[0.7071]})`
- Check: `q14HelstromErr`, `q14HelstromGammaSpec`. Needs: matrix-v2, bloch-ball, plot.

**D6 · `q14-compare:b2` · result `1 - c \le \tfrac12(1 + \sqrt{1 - c^2}),\ P_E \le \tfrac12 Q_{\mathrm{opt}}`** (Bergou Eq. 5.61)
- Ground (3 views):
  1. `P_{\mathrm{succ}}^{\text{min-err}} = \tfrac12(1 + \sqrt{1 - c^2}),\ P_{\mathrm{succ}}^{\text{usd}} = 1 - c` — The two success chances vs overlap $c$. **view** `plot('discrimCompare', {min:0, max:1}, {markers:[0.7071]})` · *both curves vs overlap*
  2. `c = 0.7071:\ 0.8536 \text{ vs } 0.2929` — Minimum-error answers far more often for $|0\rangle, |+\rangle$. **view** `bl({states:['0','+']})` · *the overlap $c = 0.7071$*
  3. `P_E = 0.1464 \le \tfrac12(0.7071) = 0.3536` — The error is at most half the inconclusive rate. **view** `plot('discrimCompare', {min:0, max:1}, {markers:[0.7071], bands:['error','halfFail']})` · *the error region under half the failure region*
  4. `1 - c \le \tfrac12(1 + \sqrt{1 - c^2}),\quad P_E \le \tfrac12 Q_{\mathrm{opt}}` — The exact price of certainty.
- Formal (2 views):
  1. `\tfrac12(1 + \sqrt{1 - c^2}) \ge 1 - c \text{ on } [0, 1)` — Min-error dominates USD, with equality only at $c = 0$. **view** `plot('discrimCompare', {min:0, max:1}, {markers:[0.7071]})`
  2. `P_E \le \tfrac12 Q_{\mathrm{opt}}` — The minimum error is at most half the optimal inconclusive rate (Eq. 5.61). **view** `bl({states:['0','+']})`
- Check: `q14HelstromSucc`, `q14UsdSucc`, `q14HelstromErr`, `q14UsdInconcl`. Needs: plot, bloch.

**View counts** (distinct views, Ground / Formal): D1 3/2 · D2 3/2 · D3 3/2 · D4 3/2 · D5 3/2 · D6 3/2. Ground steps ≥
Formal steps in every pair. Every view's kind is on its unit's stage. D1 needs `matrix` (POVM source), `circuit`,
`amplitudes`; D2/D3/D4 need `matrix` (POVM source) and `bloch`/`circuit`; D5 needs `matrix` v2 (`lin` + `spectrum`),
`bloch-ball`, `plot`; D6 needs `plot` and `bloch`. The new `plot` curves and the `matrix` POVM source are §9.2 gaps.

## 3. Try-it widget per unit
No widget draws a POVM yet (§9.3 W14, deferred under the cap). Each unit uses an existing 709 widget with a prop form
already used, plus the stage sweeps for the real exploration.

| Unit | Widget spec | Why this one |
|---|---|---|
| `q14-pointer` | `{kind:'operator-builder', props:{axis:'z'}}` | Build $E_\pm = \tfrac12(I \pm \eta Z)$ and read the eigenvalues $0.75, 0.25$ — a positive operator, not a projector. |
| `q14-povm` | `{kind:'bloch', props:{theta:90, phi:0, editable:true, landmarks:true}}` | Drag a probe state; three fixed trine landmarks show which outcome is most likely. |
| `q14-neumark` | `{kind:'operator-builder', props:{axis:'z'}}` | Build an isometry's $V^\dagger V$ and confirm it is $I$ — the condition that lets it extend to a unitary. |
| `q14-usd` | `{kind:'bloch', props:{theta:45, phi:0, editable:true, landmarks:true}}` | Drag the two states together; the inconclusive share grows as their overlap grows. |
| `q14-min-error` | `{kind:'bloch', props:{theta:45, phi:0, editable:true, landmarks:true}}` | The optimal split sits symmetrically between the two states; move them and watch it. |
| `q14-compare` | `{kind:'phase-dial', props:{theta:90, rotations:false}}` | Turn the dial to change the overlap; the two success numbers move apart and meet only at the poles. |

**Try this:**
- `q14-pointer`: (1) Build $\tfrac12(I + \tfrac12 Z)$; its eigenvalues are $0.75, 0.25$, both positive, so it is a POVM element.
- `q14-povm`: (1) Drag the probe onto $|\psi_0\rangle$: outcome $0$ wins with chance $2/3$, each other with $1/6$.
- `q14-neumark`: (1) Build any $V$ with $V^\dagger V = I$ and confirm it; a POVM always gives one.
- `q14-usd`: (1) Slide $|\psi_2\rangle$ toward $|\psi_1\rangle$: the "don't know" share climbs toward $1$.
- `q14-min-error`: (1) Place the two states $90°$ apart: the error drops to $0$, a sharp measurement.
- `q14-compare`: (1) Dial to orthogonal: both strategies reach success $1$ and agree.

## 4. Challenges per unit
Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** no sheet assigns any Q14 item;
Bergou's ⚑ problems P5.1–P5.6 are **not** ingested (HW3) — every challenge below is built on the chapter's running
examples (the unsharp $Z$ meter, the trine, the $|0\rangle$/$|+\rangle$ pair), so all carry full walkthroughs. Ask the
user before working any HW3 item by any method (§12 Q2).

### `q14-pointer`
1. **warm-up · choice · `q14-po-soft`** — "Feed $|0\rangle$ into the soft $Z$ meter at sharpness $\eta = \tfrac12$. What is the chance of reading 'up'?"
   - Options: **$0.75$** ✓ · $0.5$ · $1$ · $0.25$. Check: `q14UnsharpP0[0]` $= 0.75$. Hints: (1) The Born rule with $E_+$ for the projector. (2) $E_+ = \mathrm{diag}(0.75, 0.25)$. (3) Its top-left entry. Walkthrough: $p_+ = \mathrm{Tr}(E_+|0\rangle\langle0|) = \tfrac12(1 + \tfrac12) = 0.75$.
2. **core · choice · `q14-po-plus`** — "Feed $|+\rangle$ into the same soft meter. What is the chance of 'up'?"
   - Options: **$0.5$** ✓ · $0.75$ · $1$ · $0$. Check: `q14UnsharpPplus[0]` $= 0.5$. Hints: (1) $\langle Z\rangle = 0$ on $|+\rangle$. (2) $p_+ = \tfrac12(1 + \eta\langle Z\rangle)$. (3) The $Z$ term drops out. Walkthrough: $|+\rangle$ leans neither way, so the soft meter is a fair coin.

### `q14-povm`
1. **warm-up · numeric · `q14-pv-correct`** — "Feed the trine's $|\psi_0\rangle$ into the trine POVM. What is the chance of the correct outcome $0$?"
   - Answer: **$0.667$** $=$ `q14TrineCorrect`. Hints: (1) $p_0 = \langle\psi_0|E_0|\psi_0\rangle$. (2) $E_0 = \tfrac23|\psi_0\rangle\langle\psi_0|$. (3) $\tfrac23 \times 1$. Walkthrough: $p_0 = \tfrac23|\langle\psi_0|\psi_0\rangle|^2 = \tfrac23 = 0.667$.
2. **core · numeric · `q14-pv-error`** — "For that same input, what is the chance of a wrong outcome (say outcome $1$)?"
   - Answer: **$0.167$** $=$ `q14TrineError`. Hints: (1) $p_1 = \tfrac23|\langle\psi_1|\psi_0\rangle|^2$. (2) The trine overlaps square to $\tfrac14$. (3) $\tfrac23 \times \tfrac14$. Walkthrough: $|\langle\psi_1|\psi_0\rangle|^2 = \tfrac14$, so $p_{\text{error}} = \tfrac16 = 0.167$.
3. **core · choice · `q14-pv-count`** — "Can a single-qubit measurement have three distinct outcomes?"
   - Options: **Yes — a POVM can, like the trine** ✓ · No, never · Only for mixed states · Only on two qubits. Check: `q14TrineSum` $= I$ (a valid three-element POVM). Hints: (1) Drop orthogonality. (2) Three positive operators summing to $I$. (3) The trine. Walkthrough: projective caps outcomes at $2$, but the trine is a legitimate three-outcome POVM.

### `q14-neumark`
1. **warm-up · choice · `q14-nm-real`** — "Is a POVM a physically real measurement, or just bookkeeping?"
   - Options: **Real — a sharp measurement on an ancilla (Neumark)** ✓ · Just bookkeeping · Only projective POVMs · Only for qubits. Check: `q14NeumarkVdagV` $= I$. Hints: (1) Add an ancilla. (2) Couple with one unitary. (3) Measure the ancilla sharply. Walkthrough: $V^\dagger V = I$ extends to a unitary; reading the ancilla realises the POVM.
2. **core · numeric · `q14-nm-dim`** — "The trine POVM has three outcomes on a qubit. What ancilla dimension realises it as a sharp measurement?"
   - Answer: **$3$** $=$ `q14NeumarkAncillaDim` (`neumark(trine()).projectors.length`). Hints: (1) One ancilla level per outcome. (2) The trine has three outcomes. (3) A qutrit. Walkthrough: the ancilla dimension equals the number of POVM elements, here $3$.
3. **core · numeric · `q14-nm-match`** — "The dilated sharp measurement acts on $|0\rangle$. What is the chance of the third outcome?"
   - Answer: **$0.667$** $=$ `q14NeumarkMatch[2]`. Hints: (1) It must match $\mathrm{Tr}(E_2|0\rangle\langle0|)$. (2) $E_2 = \tfrac23|0\rangle\langle0|$. (3) $\tfrac23$. Walkthrough: the lift reproduces the POVM chances, so the third outcome has chance $0.667$.

### `q14-usd`
1. **warm-up · numeric · `q14-usd-succ`** — "Bob must unambiguously tell $|0\rangle$ from $|+\rangle$ at even odds. How often can he succeed?"
   - Answer: **$0.293$** $=$ `q14UsdSucc`. Hints: (1) Success $= 1 - |\langle\psi_1|\psi_2\rangle|$. (2) $\langle0|+\rangle = 1/\sqrt2$. (3) $1 - 0.707$. Walkthrough: $1 - 1/\sqrt2 = 0.2929$.
2. **core · numeric · `q14-usd-inc`** — "For that same task, how often must Bob answer 'don't know'?"
   - Answer: **$0.707$** $=$ `q14UsdInconcl`. Hints: (1) Success + inconclusive $= 1$. (2) $1 - 0.293$. (3) $1/\sqrt2$. Walkthrough: inconclusive $= 1 - 0.2929 = 0.7071$.
3. **core · choice · `q14-usd-perfect`** — "Can any measurement unambiguously sort two non-orthogonal states with no failures at all?"
   - Options: **No — that would force $\langle\psi_1|\psi_2\rangle = 0$** ✓ · Yes · Only pure states · Only at equal priors. Check: `q14Overlap0Plus` $= 0.7071 \ne 0$. Hints: (1) Assume two never-err detectors adding to $I$. (2) Sandwich $I$ between the states. (3) You get $\langle\psi_1|\psi_2\rangle = 0$. Walkthrough: perfect USD forces orthogonality, which $|0\rangle, |+\rangle$ (overlap $0.7071$) do not have.

### `q14-min-error`
1. **warm-up · numeric · `q14-me-succ`** — "Guessing every time between $|0\rangle$ and $|+\rangle$ at even odds, what is the best chance of being right?"
   - Answer: **$0.854$** $=$ `q14HelstromSucc`. Hints: (1) Helstrom: $\tfrac12(1 + \sqrt{1 - c^2})$. (2) $c = 1/\sqrt2$, so $c^2 = \tfrac12$. (3) $\tfrac12(1 + 0.707)$. Walkthrough: $\tfrac12(1 + \sqrt{1/2}) = 0.8536$.
2. **core · numeric · `q14-me-err`** — "What is the smallest error rate you can achieve?"
   - Answer: **$0.146$** $=$ `q14HelstromErr`. Hints: (1) Error $= 1 - $ success. (2) $\tfrac12(1 - \sqrt{1 - c^2})$. (3) $\tfrac12(1 - 0.707)$. Walkthrough: $P_E = 0.1464$.
3. **core · choice · `q14-me-nomeas`** — "If one of the two states is very likely, the best minimum-error strategy can be…"
   - Options: **To always guess that state, with no measurement** ✓ · To always measure · To use the trine · To decline to answer. Check: `q14HelstromGammaSpec` — when $\Gamma$ has one sign, the measurement adds nothing. Hints: (1) Look at $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$. (2) If it has no negative eigenvalue. (3) $E_1 = 0$. Walkthrough: no negative eigenvalue ⇒ $E_2 = I$, always guess $\rho_2$, error $\eta_{\min}$.

### `q14-compare`
1. **warm-up · choice · `q14-cp-which`** — "You may never be wrong, OR you must always answer. Which gives the higher chance of a correct answer per trial for $|0\rangle, |+\rangle$?"
   - Options: **Minimum-error (always answer)** ✓ · Unambiguous (never wrong) · They are equal · Depends only on the prior. Check: `q14HelstromSucc` $0.854 >$ `q14UsdSucc` $0.293$. Hints: (1) Compare $0.854$ and $0.293$. (2) Minimum-error spends mistakes to answer every time. (3) It dominates in $(0, 1)$. Walkthrough: $0.8536 > 0.2929$, so minimum-error gives more correct answers per trial.
2. **core · choice · `q14-cp-tradeoff`** — "Here the minimum error is $0.146$ and the inconclusive rate is $0.707$. Does $P_E \le \tfrac12 Q_{\mathrm{opt}}$ hold?"
   - Options: **Yes — $0.146 \le 0.354$** ✓ · No · Only at orthogonality · Only for mixed states. Check: `q14HelstromErr` $\le 0.5 \times$ `q14UsdInconcl`. Hints: (1) $\tfrac12 Q = \tfrac12(0.707)$. (2) $= 0.354$. (3) $0.146 \le 0.354$. Walkthrough: the Helstrom error is at most half the optimal USD failure (Bergou Eq. 5.61).

## 5. Glossary terms new in Q14
`introduces` marks the four notation beats (W-709 #8), matching re-map §6 (line 344). Inline math is TeX inside `$…$`.

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-generalized-measurement` | generalized measurement | — | Any way to read a system: couple it to a meter, let them interact, then read the meter. | Reading an ancilla after a joint unitary; gives $p_i = \mathrm{Tr}(E_i\rho)$ for positive $E_i$, not just projectors (Bergou §5.2–5.3). | `q14-pointer:b1` | `qc-projective-measurement` |
| `qc-povm` | POVM | — | A set of measurement outcomes as positive operators that add to the identity — a measurement without the orthogonality rule. | A decomposition of the identity $\sum_i E_i = I$ into positive operators $E_i \ge 0$ (Bergou §5.3; N&C §2.2.6). | `q14-povm:b2` | — |
| `qc-povm-element` | POVM element | notation | One of the positive operators $E_i$ in a POVM; outcome $i$ has chance $\mathrm{Tr}(E_i\rho)$. | $E_i \ge 0$ with $\sum_i E_i = I$; $p_i = \mathrm{Tr}(E_i\rho)$ (Bergou writes $\Pi_j$; N&C $E_m$). | `q14-povm:b2` | `qc-projective-measurement` |
| `qc-detection-operator` | detection operator | — | The operator $A_i$ behind an outcome; the element is $E_i = A_i^\dagger A_i$. | $A_i = U_i\sqrt{E_i}$ (polar form, Bergou Eq. 5.11); the measurement twin of a Kraus operator. | `q14-povm:b3` | `qc-kraus-operator` |
| `qc-trine` | trine | — | Three qubit states $120°$ apart, giving a three-outcome measurement a sharp one cannot. | $|\psi_j\rangle$ (Bergou Eq. 5.24), $E_j = \tfrac23|\psi_j\rangle\langle\psi_j|$; $p_{\text{correct}} = \tfrac23$, $p_{\text{error}} = \tfrac16$. | `q14-povm:b3` | — |
| `qc-neumark` | Neumark's theorem | — | Every POVM is an ordinary sharp measurement on the system plus an added ancilla. | A one-to-one correspondence between POVMs and projective measurements on $H_A\otimes H_B$ (Bergou §5.4, Eqs. 5.15–5.23). | `q14-neumark:b2` | `qc-stinespring` |
| `qc-dilation-space` | dilation space | space | The enlarged space — system plus ancilla — on which the POVM becomes a sharp measurement. | $H_A\otimes H_B$, ancilla $B$ in a fixed $|\psi_B\rangle$; the measurement analog of Chapter Q13's dilation. | `q14-neumark:b1` | `qc-stinespring` |
| `qc-ancilla` | ancilla | — | A helper system you couple in, measure, and discard — the meter made quantum. | The auxiliary factor $H_B$ whose sharp measurement realises the POVM on $H_A$ (Bergou §5.4). | `q14-neumark:b1` | `qc-purify` |
| `qc-unambiguous-discrimination` | unambiguous discrimination | — | Telling two states apart with a measurement that is never wrong but sometimes answers "don't know". | USD: $E_1|\psi_2\rangle = E_2|\psi_1\rangle = 0$, success $1 - |\langle\psi_1|\psi_2\rangle|$ at equal priors (Bergou §5.5.1). | `q14-usd:b1` | — |
| `qc-inconclusive-outcome` | inconclusive outcome | notation | The "don't know" result $E_0$ — not an error, just no conclusion. | $E_0 = I - E_1 - E_2 \ge 0$ (Bergou Eq. 5.34; N&C $E_3$, Eq. 2.120); fires for either state. | `q14-usd:b2` | — |
| `qc-prior` | prior | — | How likely each state was to be sent, before any measurement. | The a priori probability $\eta_i$, $\sum_i\eta_i = 1$ (Bergou §5.5.1). | `q14-usd:b1` | — |
| `qc-minimum-error-discrimination` | minimum-error discrimination | — | Always guessing, with the fewest possible mistakes, when "don't know" is not allowed. | A two-outcome POVM $E_1 + E_2 = I$ minimising $P_{\mathrm{err}}$ (Bergou §5.5.2). | `q14-min-error:b1` | — |
| `qc-helstrom-bound` | Helstrom bound | notation | The smallest error rate any measurement can reach when telling two states apart. | $P_E = \tfrac12(1 - \lVert\eta_2\rho_2 - \eta_1\rho_1\rVert_1)$ (Bergou Eq. 5.58); pure form $\tfrac12(1 - \sqrt{1 - 4\eta_1\eta_2|\langle\psi_1|\psi_2\rangle|^2})$. | `q14-min-error:b2` | `qc-trace-distance` |

(In the table `\|` is a Markdown escape; the strings carry a plain `|`.) Reused: `qc-stinespring`, `qc-kraus-operator`,
`qc-quantum-channel` (Q13); `qc-trace-distance`, `qc-partial-trace`, `qc-purify` (Q9); `qc-density-matrix`, `qc-trace`,
`qc-bloch-ball`, `qc-positive-operator` (Q8); `qc-projective-measurement`, `qc-observable`, `qc-spectral-decomposition`
(Q3); `qc-unitary`, `qc-operator-matrix` (Q2).

**Notation beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-povm-element` | notation | `q14-povm:b2` | `bl({states:'trine'})` over `mx(pv('trine','sum'), {trace:true})` |
| `qc-dilation-space` | space | `q14-neumark:b1` | `circ(C_METER, 1)` (system + ancilla) |
| `qc-inconclusive-outcome` | notation | `q14-usd:b2` | `mx(pv('nc-usd','elements'))` (the three elements, $E_0$ highlighted) |
| `qc-helstrom-bound` | notation | `q14-min-error:b2` | `mx(lin([0.5, rho('+')], [-0.5, rho('0')]), {spectrum:'bars'})` ($\Gamma$'s $\pm$ spectrum) |

Not here, by ownership: the projective measurement and the spectral theorem (Q3); the trace norm $\lVert\cdot\rVert_1$
(Q9, `q14-min-error:b2` links back); the Stinespring dilation and Kraus operators (Q13, `q14-neumark`/`q14-povm` link
back); $\rho$, $\mathrm{Tr}$, positive operators, the Bloch ball (Q8).

## 6. Review card per unit (both tracks)
### `q14-pointer`
- **G points:** (1) A measurement couples the system to a meter, then reads the meter. (2) A sharp meter gives the usual projective outcomes. (3) A blurry meter gives soft outcomes $E_\pm = \tfrac12(I \pm \eta Z)$. (4) The chance is $\mathrm{Tr}(E_\pm\rho)$, the Born rule made general.
- **F points:** (1) $H \supset \hbar gXP$, $U = e^{-igtXP}$: the pointer shifts by $gt\lambda_j$. (2) $E_\pm = \tfrac12(I \pm \eta Z)$, $p_\pm = \mathrm{Tr}(E_\pm\rho)$. (3) On $|0\rangle$ at $\eta = \tfrac12$: $(0.75, 0.25)$.
- **Equations:** $p_\pm = \mathrm{Tr}(E_\pm\rho),\quad E_\pm = \tfrac12(I \pm \eta Z)$
- **Trap:** thinking every measurement must be sharp — a meter can be blurred, giving positive outcomes that are not projectors.

### `q14-povm`
- **G points:** (1) Drop orthogonality; keep positive operators summing to $I$. (2) A POVM is $E_i \ge 0$ with $\sum_i E_i = I$. (3) Outcome $i$ has chance $\mathrm{Tr}(E_i\rho)$. (4) The trine gives three outcomes on a qubit.
- **F points:** (1) $\sum_i E_i = I$, $E_i = A_i^\dagger A_i$, $A_i = U_i\sqrt{E_i}$ (polar). (2) $p_i = \mathrm{Tr}(E_i\rho)$. (3) Trine $E_j = \tfrac23|\psi_j\rangle\langle\psi_j|$, $p_{\text{correct}} = \tfrac23$, $p_{\text{error}} = \tfrac16$.
- **Equations:** $\sum_i E_i = I,\quad E_i \ge 0,\quad p_i = \mathrm{Tr}(E_i\rho)$
- **Trap:** thinking a qubit allows at most two outcomes — that is projective; a POVM can have any number.

### `q14-neumark`
- **G points:** (1) A POVM is a real measurement, not just arithmetic. (2) Add an ancilla, couple, measure it sharply. (3) The isometry $V = \sum_m A_m\otimes|m\rangle$ has $V^\dagger V = I$. (4) So it extends to a unitary; the trine needs a qutrit ancilla.
- **F points:** (1) $A_m|\psi\rangle = \langle m|U_{AB}(|\psi\rangle|\psi_B\rangle)$, $\sum_m A_m^\dagger A_m = I$. (2) $V^\dagger V = I \Rightarrow$ extends to $U_{AB}$. (3) The dilated sharp measurement reproduces $\mathrm{Tr}(E_j\rho)$ exactly.
- **Equations:** $V^\dagger V = \sum_m A_m^\dagger A_m = I$
- **Trap:** thinking the POVM and its dilation give different chances — they agree by construction (that is the theorem).

### `q14-usd`
- **G points:** (1) Non-orthogonal states cannot be sorted with no mistakes. (2) Perfect sorting would force $\langle\psi_1|\psi_2\rangle = 0$. (3) Add a "don't know" outcome $E_0$. (4) Success $1 - |\langle\psi_1|\psi_2\rangle|$ at even odds.
- **F points:** (1) $E_1|\psi_2\rangle = E_2|\psi_1\rangle = 0$, $E_1 + E_2 + E_0 = I$. (2) Perfect USD ⇒ orthogonality. (3) Equal-prior success $1 - |\langle\psi_1|\psi_2\rangle| = 0.2929$ for $|0\rangle, |+\rangle$.
- **Equations:** $E_1 + E_2 + E_0 = I;\quad P_{\mathrm{succ}} = 1 - |\langle\psi_1|\psi_2\rangle|$
- **Trap:** thinking the inconclusive outcome is an error — it is a refusal to answer, never a wrong answer.

### `q14-min-error`
- **G points:** (1) You must answer every time, so errors are unavoidable. (2) Form $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$ and guess by its sign. (3) The least error is the Helstrom bound. (4) For $|0\rangle, |+\rangle$: wrong $0.1464$.
- **F points:** (1) $E_1 + E_2 = I$; minimise $P_{\mathrm{err}} = \eta_1\mathrm{Tr}(\rho_1E_2) + \eta_2\mathrm{Tr}(\rho_2E_1)$. (2) $P_E = \tfrac12(1 - \lVert\Gamma\rVert_1)$; pure form $\tfrac12(1 - \sqrt{1 - 4\eta_1\eta_2|\langle\psi_1|\psi_2\rangle|^2})$. (3) If $\Gamma$ has one sign, guess always.
- **Equations:** $P_E = \tfrac12(1 - \lVert\eta_2\rho_2 - \eta_1\rho_1\rVert_1)$
- **Trap:** thinking a measurement always helps — if $\Gamma$ has no negative eigenvalue, always guessing the likelier state is optimal.

### `q14-compare`
- **G points:** (1) Unambiguous never errs but often fails; minimum-error always answers but sometimes errs. (2) Minimum-error succeeds more often per trial. (3) The overlap prices both. (4) The error is at most half the inconclusive rate.
- **F points:** (1) Minimum-error success $\tfrac12(1 + \sqrt{1 - c^2}) \ge$ unambiguous success $1 - c$. (2) Equal only at $c = 0$ (orthogonal). (3) $P_E \le \tfrac12 Q_{\mathrm{opt}}$ (Eq. 5.61).
- **Equations:** $P_E \le \tfrac12 Q_{\mathrm{opt}}$
- **Trap:** thinking one strategy is simply "better" — they optimise different things (never-wrong vs fewest-wrong).

## 7. Symbol-before-use tables
Abbreviations: po, pv, nm, usd, me, cp (the six units in order). Carried from Q1–Q13 and recapped at
`q14-pointer:b1`: $\rho$, $\mathrm{Tr}$, the projective measurement and $P_j = |j\rangle\langle j|$, the observable and
spectral decomposition (Q3), the Bloch ball and positive operators (Q8), the Kraus operator $A_m$ and the Stinespring
dilation (Q13), the trace norm $\lVert\cdot\rVert_1$ (Q9), $|0\rangle, |1\rangle, |+\rangle, |-\rangle$ (Q1–Q2), the
Paulis $X, Y, Z$ (Q3), the tensor product $\otimes$ (Q4), and unitaries $U, U^\dagger$ (Q2).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| meter / pointer | po:b1 | po:b1 | OK | The system is read through a coupled meter. |
| $\eta$ (meter sharpness) | po:b2 | po:b2 | OK | $0 \le \eta \le 1$; $\eta = 1$ is sharp. |
| $E_\pm = \tfrac12(I \pm \eta Z)$ | po:b2 | po:b2 | OK | The soft-meter operators. |
| $E_i$ (POVM element) | pv:b2 | pv:b2 | **FLAG** | $E_i$ (italic, subscripted, a POVM element) vs $E$ (entanglement, Q12; channel $\mathcal E$, Q13); stated in place. Rosetta: "Bergou writes $\Pi_j$". |
| $A_i$ (detection operator) | pv:b3 | pv:b3 | OK | Same letter as Chapter Q13's Kraus operator, stated as the deliberate measurement twin. |
| $|\psi_j\rangle$ (trine) | pv:b3 | pv:b3 | OK | Bergou Eq. 5.24. |
| ancilla $B$, $H_A\otimes H_B$ | nm:b1 | nm:b1 | OK | Notation beat ("New space"). |
| $V$ (isometry) | nm:b3 | nm:b3 | OK | $V^\dagger V = I$. |
| $E_0$ (inconclusive) | usd:b2 | usd:b2 | OK | Notation beat; the "don't know" element. |
| $\eta_1, \eta_2$ (priors) | usd:b1 | usd:b1 | OK | $\eta_1 + \eta_2 = 1$. |
| $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$ | me:b2 | me:b2 | OK | The Helstrom operator. |
| $c = |\langle\psi_1|\psi_2\rangle|$ (overlap) | cp:b2 | usd:b3 | OK | Defined at usd:b3 as $\cos\Theta$; written $c$ in the compare curves. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $H \supset \hbar gXP$, $U = e^{-igtXP}$ | po:b1 | po:b1 | OK | The von Neumann pointer coupling; $x_j = gt\lambda_j$. |
| $M_m$ (N&C) | po:b4 (F) | — | OK | N&C's measurement operators; $E_m = M_m^\dagger M_m$. Noted once (Eq. 2.117). |
| $\Pi_j$ (Bergou) | pv:b2 | pv:b2 | OK | Bergou's POVM element; one Rosetta line, then $E_i$. |
| $A_i = U_i\sqrt{E_i}$ (polar) | pv:b3 | pv:b3 | OK | $E_i = A_i^\dagger A_i$. |
| $U_{AB}$, $|\psi_B\rangle$, $|m_B\rangle$ | nm:b1 | nm:b1 | OK | The dilating unitary and ancilla basis. |
| $\cos\Theta = |\langle\psi_1|\psi_2\rangle|$ | usd:b3 | usd:b3 | OK | The overlap; $Q^{\mathrm{POVM}} = 2\sqrt{\eta_1\eta_2}\cos\Theta$. |
| $\lVert\cdot\rVert_1$ (trace norm) | me:b2 | Q9 | OK | Trace norm from Chapter Q9's Bergou-only unit. |
| $Q_{\mathrm{opt}}$ (optimal failure) | cp:b3 | cp:b3 | OK | USD's minimum inconclusive rate. |

**Counts:** Ground 1 FLAG (the $E_i$ / $E$ / $\mathcal E$ clash), Formal 0 FLAGs, resolved in place.

## 8. Errata
Q14 draws no lecture notes (books-phase). Checked against Bergou Ch. 5 and N&C §2.2.4–2.2.8, recomputed twice
(`q14plan-verify.py`): the trine completeness $\sum_j\tfrac23|\psi_j\rangle\langle\psi_j| = I$ and its chances $2/3, 1/6$;
the Neumark isometry $V^\dagger V = I$ and the probability match $(1/6, 1/6, 2/3)$ on $|0\rangle$; the USD success
$1 - 1/\sqrt2 = 0.2929$ and the N&C constant $\sqrt2/(1+\sqrt2) = 2 - \sqrt2 = 0.5858$; the Helstrom success $0.8536$,
error $0.1464$ and $\Gamma$ spectrum $\pm0.3536$; the Fig. 5.1 boundaries $1/11$ and $10/11$.

**Carried from the map (Bergou errata, cited in place):**
- **B14**, p. 77: the §5.1 outline promises the B92 protocol "to close this chapter," but B92 is actually §6.3 (Chapter 6, the next part). Cited at `q14-compare:b4`, where Q14 forward-links to B92 as the *next part's* material, not this chapter's.

**Silent notes (no box).**
| Where | Point | Action |
|---|---|---|
| `q14-usd` / §9.2 | Bergou's Fig. 5.1 caption rounds the POVM-existence boundaries to $0.09$ and $0.9$ | the exact values are $1/11 = 0.0909$ and $10/11 = 0.9091$; the plan and engine use the exact values (`q14Fig51Lo/Hi`) |
| `q14-povm:b2` | Bergou writes the POVM element $\Pi_j$; N&C writes $E_m$ | the plan writes $E_i$ (N&C); one Rosetta line in the notation beat |
| `q14-povm:b2` vs Q12/Q13 | $E_i$ (POVM element) vs $E$ (entanglement, Q12) vs $\mathcal E$ (channel, Q13) | $E_i$ italic + subscripted for the element; stated once (§7) |
| `q14-povm:b3` | the detection operator $A_i$ reuses Chapter Q13's Kraus letter $A_m$ | deliberate — stated as the measurement twin; no clash since both are detection/Kraus operators |
| Bergou Eq. 5.46 | the printed $\Pi_2 = \frac{1-q_2^{\mathrm{opt}}}{\sin^2\Theta}|\psi_1^\perp\rangle\langle\psi_2^\perp|$ has mismatched bra/ket indices (should read $|\psi_1^\perp\rangle\langle\psi_1^\perp|$) | not displayed to the learner (the plan shows only $Q^{\mathrm{POVM}}$ and the N&C elements); flagged for the build agent, no learner-facing box |

## 9. Engine gaps and stage-contract gaps
### 9.1 Engine

**Merged E3 `povm` used (no new functions).** Every learner-visible number comes from one of these merged calls, each
checked in `pipeline/make_qc_fixtures.py` block "povm" by the independent scipy route.

| Function (merged, `physics/qc/povm.ts`) | Returns | Used by |
|---|---|---|
| `isPOVM(es)` | each $E_i \ge 0$ and $\sum_i E_i = I$? | pv, usd (verify the built POVMs) |
| `bornPovm(es, rho)` | $p_i = \mathrm{Tr}(E_i\rho)$ | po, pv, nm |
| `neumark(es)` | the isometry $V = \sum_i\sqrt{E_i}\otimes|i\rangle$ and the ancilla projectors | nm |
| `helstrom(rho0, rho1, p0)` | $\tfrac12(1 + \lVert p_0\rho_0 - p_1\rho_1\rVert_1)$ (min-error success) | me, cp |
| `usd(states)` | $1 - |\langle\psi_0|\psi_1\rangle|$ (equal-prior USD success) | usd, cp |

Also merged E1 used (no work): `inner`, `outer`/`densityOf`, `mscale`, `madd`, `msub`, `eigh`/`spectrum`, `traceNorm`,
the Paulis `I2/X/Z`, `ket`. The trine, N&C-USD and unsharp-$Z$ POVMs, and the Helstrom operator $\Gamma$, are **built in
`Q14.values.ts` from these primitives and verified by `isPOVM`** before use — no new engine code.

**Planned but NOT merged (and NOT relied on).** The map's E3 row (`P-709-map.md`, line 1119) planned `trine()`,
`tetrad()`, `detectionOps`, `neumarkUnitary`, `pointerShift`, `sqlResolution`, `sequentialUsd`, `programmableUsd`; only
the five above merged. Consequences, all handled:
- The trine / N&C / unsharp POVMs have no constructor — the values file builds them (verified by `isPOVM`), as above.
- `pointerShift`/`sqlResolution` are absent, so the von Neumann pointer-shift $x_j = gt\lambda_j$ (po:b1, Formal) is
  **cited physics only** — no displayed number depends on it. The pointer unit's numbers all come from `bornPovm`.
- `sequentialUsd` is absent, so Bergou §5.6 (sequential measurements) is **out of scope** (§12 Q1).
No genuine engine gap: if the judge wants engine-level `trine()`/`ncUsd()`/`unsharpZ()` constructors rather than
values-file builders, that is a convenience, and each already has a numpy twin.

### 9.2 Stage contract

**`matrix` POVM source (NEW; needs: matrix-povm-source).** The POVM elements carry coefficients outside the
`MatrixCoef` exact set (trine $\tfrac23$; N&C $2-\sqrt2$; the Neumark $\sqrt{2/3}$), so the merged `lin` route cannot
build them. Proposed additive source, resolved by E3 `povm`, never hand-typed:
```ts
// added to MatrixSource (W-709 #15 extension); resolved by povm.ts + the values-file POVM builders
| { povm: { key: 'trine' | 'nc-usd' | 'unsharpZ'; param?: number;
            which: 'elements' | 'sum' | 'dilationV' | 'dilationVdagV' | 'dilationProj'; index?: number } }
```
`which:'elements'` draws the element list (`index` picks one), `'sum'` draws $\sum_i E_i$ (resolving to $I$, with
`trace`), `'dilationV'` the $6\times2$ isometry $V$ (`neumark`), `'dilationVdagV'` $V^\dagger V$ ($= I$, with `trace`),
`'dilationProj'` an ancilla projector. Fidelity `qc-matrix-povm-engine` ("the drawn elements are the engine's POVM with
$\sum_i E_i = I$, not hand-typed"). Used by `pv(...)` throughout §1–§2. **If the judge declines it:** draw the rank-one
directions via `outer` with the coefficient in the caption, $\sum_i E_i = I$ via `mx(pa('I'), {trace:true})` captioned
"$= \sum_i E_i$", and the Neumark $V$/projectors as figures only; every derivation keeps ≥ 2 distinct views through
`bloch`/`circuit`/`plot`, so W-709 #7 still passes.
**Note:** the Helstrom $\Gamma$ at equal priors is `lin([0.5, rho('+')], [-0.5, rho('0')])`, already inside the exact
`MatrixCoef` set (±½), so `q14-min-error` needs **no** new source for its spectrum view.

**`plot` curves (NEW; needs: plot-discrim-curves).** The `plot` kind is merged (W-709 #16) but its `CURVE_FNS` registry
has only `chshVsPhase`, `chshClassicalBound`. Q14 adds three engine-sampled curves (equal priors, over the overlap $c$):
```ts
// added to PlotCurveName / CURVE_FNS, resolved by physics/qc/povm.ts
| 'usdSuccessVsOverlap'     // 1 - c            (via usd)
| 'helstromErrorVsOverlap'  // ½(1 - √(1 - c²)) (via helstrom)
| 'discrimCompare'          // both success curves ½(1 + √(1 - c²)) and 1 - c
```
Fidelity `qc-plot-engine-curve` ("the curve is the engine sampled, not a drawn shape"). Used by usd:b4, me:b3,
cp:b2–b4. **If declined:** a `bloch`/`matrix` sweep in the overlap with the value in the caption (keeps ≥ 2 non-plot
views), the Q12/Q13 plot fallback. Optional extra: `usdFailureVsPrior` ($Q^{\mathrm{POVM}}$ vs $\eta_1$, Fig. 5.1, with
the $1/11, 10/11$ boundaries) if the judge wants the prior-dependence picture — not required by any beat.

**`bloch` (needs: bloch).** Q14 uses `bl({states:…})` for the trine directions and the two discrimination states (with
`perp` for their orthogonals). The exact field names must be confirmed against the merged `bloch` state shape; if a
multi-state / directions field is missing, fall back to `bloch-ball` points or draw the directions through the `matrix`
of projectors. Flagged for the build agent (§12 Q3).

**`circuit`, `bloch-ball`, `amplitudes`, `matrix` v2 (merged).** `C_METER` uses a `unitary` op `U_SM` (matrix from the
values file) and a meter on the ancilla (a mid-circuit measurement with `outcomes`; open controls `controls0` merged per
`qc709-nc.md` #2). `ball({points:[…]})` draws the two states; `amp({ket}, {mode:'probability'})`, `mx(lin,
{spectrum:'bars'})`, `mx(out)`, `mx(rho)` are all merged.

### 9.3 Widget gaps
**W14 `povm-lab`** (deferred under the cap): pick a POVM (trine, unsharp $Z$, the USD pair) and an input state, and see
the elements, $\sum_i E_i = I$, the outcome chances and the Neumark dilation live. The §3 stand-ins (`operator-builder`,
`bloch`, `phase-dial`) and the stage sweeps carry the units until then.

## 10. Media
- **Opener:** none new to Q14. Part V's Blender opener ("the ball shrinks") belongs to Chapter Q13; Q14 opens straight
  into the pointer unit.
- **Film (deferred) `qc-q14-trine-lift`** "Lifting the trine into three dimensions": the qubit's three trine detection
  states $\sqrt{2/3}|\psi_j\rangle$ lifting to three orthonormal qutrit states $|\tilde\psi_j\rangle$ (Bergou Eq. 5.31) —
  the Neumark dilation as a picture, a 2-D fan opening into a 3-D orthogonal frame. Manifest keys `q14TrineSum`,
  `q14NeumarkVdagV`, `q14NeumarkMatch`; every drawn number re-checked against the engine (the manifest test). An
  alternative, also deferred: `qc-q14-two-detectors` "one detector never lies" (the USD vs min-error curves sweeping the
  overlap; keys `q14UsdSucc`, `q14HelstromErr`).
- **Decor (Higgsfield, credits need the user):** a bank of detectors glowing in the dark, one blinking; atmosphere only,
  no text, numbers or diagrams. Gated by a per-batch user credit approval (skill `14-decor-clip`).

## 11. Hooks
### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-generalized-measurement` | Reading a qubit through a meter | Q14 · `q14-pointer` | `qc-projective-measurement` | `l3-postulates` |
| `qc-povm` | More answers than dimensions | Q14 · `q14-povm` | `qc-generalized-measurement`, `qc-positive-operator` | — |
| `qc-neumark` | Every POVM is projective upstairs | Q14 · `q14-neumark` | `qc-povm`, `qc-stinespring` | — |
| `qc-usd` | Never wrong, sometimes unsure | Q14 · `q14-usd` | `qc-povm` | — |
| `qc-helstrom` | The fewest mistakes | Q14 · `q14-min-error` | `qc-povm`, `qc-trace-distance` | — |
| `qc-discrimination` | The price of certainty | Q14 · `q14-compare` | `qc-usd`, `qc-helstrom` | — |

Bridge ids used, all existing: `l3-postulates`, `l4-projectors`. `qc-generalized-measurement` shares the 448
`l3-postulates` twin (the measurement postulate is the same object, generalized here; the concept test allows the shared
`sameAs`).

**Future bridges (TODO; targets not built):** Part VI crypto (B92 as USD + min-error attacks; `q14-compare` →
`q15-b92`, using the $0.2929$/$0.1464$ bounds for $|0\rangle, |+\rangle$); Q13 (detection operators ↔ Kraus operators;
`q14-povm` → `q13-from-unitary`, already a link-back); a later chapter for sequential measurements (Bergou §5.6, §12 Q1).

### 11.2 Arcade (6 levels)
Label constant: `const Q14x = (unit, label) => ({ lecture: 'Q14', unit, label })`. All six are Spot the error.
1. **`q14-pointer` · `qc-meter-sharp`** — "Must a meter be sharp?"
   - Steps: "A projective measurement gives sharp $|0\rangle$/$|1\rangle$ outcomes." · "Real meters have finite resolution." · "A blurry meter still gives sharp projective outcomes." · "So every qubit measurement is projective."
   - `wrong: 3`. Why: a blurry meter is the POVM $E_\pm = \tfrac12(I \pm \eta Z)$, positive operators that are not projectors (`q14UnsharpElems`).
2. **`q14-povm` · `qc-two-outcomes`** — "Only two outcomes?"
   - Steps: "A qubit lives in two dimensions." · "A projective measurement has at most two outcomes." · "A POVM drops the orthogonality rule." · "So three outcomes on a qubit are still impossible."
   - `wrong: 4`. Why: the trine is a legitimate three-outcome POVM on a qubit, $\sum_j\tfrac23|\psi_j\rangle\langle\psi_j| = I$ (`q14TrineSum`).
3. **`q14-neumark` · `qc-povm-fake`** — "Just bookkeeping?"
   - Steps: "A POVM is positive operators summing to $I$." · "It is a convenient notation." · "No real apparatus realises a non-projective POVM." · "So POVMs are only mathematics."
   - `wrong: 3`. Why: Neumark's theorem — every POVM is a sharp measurement on the system plus an ancilla, $V^\dagger V = I$ (`q14NeumarkVdagV`).
4. **`q14-usd` · `qc-usd-error`** — "Is 'don't know' a mistake?"
   - Steps: "USD has three outcomes." · "Two identify the states, one is inconclusive." · "The inconclusive outcome is a misidentification." · "So USD is sometimes wrong."
   - `wrong: 3`. Why: the inconclusive outcome is a refusal to answer, never an error; USD is never wrong (`q14UsdInconcl` = `q14UsdSucc` complement).
5. **`q14-min-error` · `qc-measure-always`** — "Always measure?"
   - Steps: "Minimum-error discrimination minimises wrong guesses." · "Form $\Gamma = \eta_2\rho_2 - \eta_1\rho_1$." · "A measurement always beats guessing." · "So you should always measure."
   - `wrong: 3`. Why: if $\Gamma$ has no negative eigenvalue, always guessing the likelier state (no measurement) is optimal (`q14HelstromGammaSpec`).
6. **`q14-compare` · `qc-usd-beats`** — "Is never-wrong best?"
   - Steps: "USD never makes an error." · "Minimum-error sometimes errs." · "So USD gives more correct answers per trial." · "USD is the better strategy overall."
   - `wrong: 3`. Why: minimum-error success $0.8536$ beats USD $0.2929$ per trial; they optimise different things (`q14HelstromSucc`, `q14UsdSucc`).

## 12. Questions for the judge
**Q1. Scope — drop sequential, keep a conceptual pointer unit.** Bergou Ch. 5 has six sections; §5.6 (sequential
measurements) needs `sequentialUsd`/`pointerShift`, which did **not** merge. *Recommend:* Q14 = `q14-pointer`,
`q14-povm`, `q14-neumark`, `q14-usd`, `q14-min-error`, `q14-compare` (six units); retire the remap's `q14-sequential`
id and leave §5.6 to a later chapter. The pointer unit stays — but its von Neumann pointer-shift is **cited physics
only** (no engine number), and it carries an engine-backed unsharp-$Z$ POVM instead. Ask the user before scheduling
sequential discrimination.

**Q2. Bergou ⚑ problems P5.1–P5.6.** All are ⚑ and HW3 is **not** ingested. *Recommend:* grade **no** challenge from
them; every Q14 challenge is built on the running examples (unsharp $Z$, trine, $|0\rangle$/$|+\rangle$), so all carry
full walkthroughs (follows `qc709-Q10Q13.md`). Ask the user whether any HW3 item is assigned before working one by any
method (`homework-status.md`).

**Q3. A `matrix` POVM source (§9.2).** The trine ($\tfrac23$), N&C ($2-\sqrt2$) and Neumark ($\sqrt{2/3}$) coefficients
lie outside the `MatrixCoef` exact set, so `lin` cannot build the elements, $\sum_i E_i$ or the dilation $V$.
*Recommend:* add the additive `{povm:{key, param, which, index?}}` source (resolved by `povm.ts` + the values-file
builders, verified by `isPOVM`). If declined, the §9.2 fallback (rank-ones via `outer` + caption coefficients, $\sum_i E_i = I$
as `mx(pa('I'), {trace:true})`, $V$ as a figure) keeps every derivation's ≥ 2 views. Note the Helstrom $\Gamma$ needs
**no** new source (it is a `lin` with $c = \pm\tfrac12$).

**Q4. The `plot` discrimination curves (§9.2).** `CURVE_FNS` has only the two CHSH curves. *Recommend:* add
`usdSuccessVsOverlap`, `helstromErrorVsOverlap`, `discrimCompare` (engine-sampled from `usd`/`helstrom`) before the Q14
build; `q14-usd`/`q14-min-error`/`q14-compare` are their first users. If they slip, the Q12/Q13 plot fallback (a
`bloch`/`matrix` overlap sweep with the value in the caption) keeps ≥ 2 non-plot views. Note: the engine `helstrom`
returns the **success** probability $\tfrac12(1 + \lVert\cdots\rVert_1)$; the error $P_E$ (Bergou's Eq. 5.58 form) is
$1 - \text{helstrom}$, so the curves read `1 - helstrom` for the error.

**Q5. Keep `q14-pointer` as a sixth unit, or fold it into `q14-povm` (five units)?** *Recommend:* **keep it** (six
units, matching the remap's unit list), because the meter/ancilla picture motivates the whole chapter and sets up the
Neumark dilation; it is fully engine-backed through the unsharp-$Z$ POVM. If the judge prefers five units, fold the
unsharp-$Z$ example and the "measurement is coupling + reading" framing into `q14-povm:b1`, and move the
`qc-generalized-measurement` gloss term there.

**Q6. Unit order: USD before minimum-error.** Bergou treats USD (§5.5.1) before minimum error (§5.5.2), and the remap's
unit list (line 183) and derivation list (line 296) follow that order; the brief's title lists "minimum-error … and
USD" only as a pair, not an order. *Recommend:* **USD then minimum-error**, so `q14-compare` (which needs both) comes
last. If the judge prefers minimum-error first, the only change is the two units swap places and `q14-compare` still
follows both.

**Q7. The running discrimination pair $|0\rangle, |+\rangle$.** Overlap $0.7071$, shared with N&C Eqs. 2.118–2.120 and
Chapter Q13's no-cloning aside (`q13Overlap0Plus`). *Recommend:* keep it as the single running pair — it gives the clean
numbers ($0.2929$, $0.8536$, $0.1464$), matches N&C's own example exactly, and is the pair the next part's B92 analysis
uses, so the chapter's numbers carry forward.

**Q8. `bloch` state/direction fields (§9.2).** `q14-povm`/`q14-usd`/`q14-compare` need the sphere to show several states
and their perpendiculars. *Recommend:* confirm the merged `bloch` kind takes a `states` list (and a `perp`/directions
field); if not, use `bloch-ball` points or draw the directions as the `matrix` of projectors — either keeps the
derivation views valid.
