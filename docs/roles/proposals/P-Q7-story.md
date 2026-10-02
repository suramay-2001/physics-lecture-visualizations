# P-Q7-story — Q7 "GHZ and Mermin: certainty without instructions" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q5-story.md` and `P-Q6-story.md` (two tracks; the 13
sections of `skills/03-chapter-plan`), with the two standing rules of 2026-10-02: every derivation list steps the stage
through ≥ 2 distinct views in both tracks, and every new notation gets exactly one notation beat. Map entry:
`P-709-remap-L1L7.md` §2 Q7, §4 rows Q7 D1–D7, §5, §6. Rulings: `qc709-remap.md` (#1, #12, #13), `qc709-Q4Q5.md`,
`homework-status.md`. Planned with Q6 (`P-Q6-story.md`), whose conventions, shorthand and claim scripts it shares; Q7
opens Part III.

**Sources read.**
- Notes L6 pp. 29–32 (text; the p. 31 table and p. 32 checked on the page renders) and L7 pp. 33–34.
- HW2 P5(b)–(c) and P7(a)–(d). P7(e) (Tr₃ of GHZ) is Q9's; Q8's GHZ box (notes p. 34 on) is Q8's.
- Bergou §3.9 pp. 57–58, Eqs. 3.81–3.82 (GHZ beside W; read), and ⚑ P10.1(a) p. 186 (GHZ stabilizer generators; read).
  Mermin's argument itself is in the notes only, as the re-map found.
- Ownership (re-map §2.2): Q7 owns GHZ and Mermin's argument; Q6 owns Pauli strings, parities and stabilizer notation
  (link-backs); Q3 owns dispersion and compatible observables; Q10 owns CHSH and LHV statistics; Q12 links back for GHZ.
- Homework: HW2 is submitted (`homework-status.md`): P5(b)–(c) and P7(a)–(d) are worked in full (ruling 12). Bergou ⚑
  P10.1(a) appears as a cited aside (ruling 13); no sheet assigns it.

**Evidence.** The same two scripts as Q6 (`q67plan-engine.ts`, the app's engine on main with E1 stood in for by
primitives; `q67plan-numpy.py`, independent routes). Q7's routes: GHZ outcome chances by the engine's rotate-then-read
(H, or H·S† for y, on each qubit) against numpy's explicit product bras ⟨ε₁b₁, ε₂b₂, ε₃b₃|; (1 + s)/4 checked for all 64
runs; zero counts by enumerating strings; the four eigenvalues as Pψ = ±ψ; Mermin's 64 cards by `itertools`. Over both
chapters: 729 numbers under 149 keys agree to 6 decimals (worst difference 0), plus the two numpy-only checks; the numpy
file runs byte-identically twice.

**Conventions** (Q6's, plus these).
- **Qubits.** Engine q0 = the notes' qubit 1 = the top wire. Circuits carry `wires:['1','2','3']`.
- **Runs.** A run's bases are named in capitals, left to right: YYX means $b_1 = b_2 = y$, $b_3 = x$. The `amplitudes`
  field takes them in lower case, `bases:['y','y','x']`.
- **Bits.** A reading $\varepsilon_k = +1$ is recorded as bit 0 and $-1$ as bit 1 (notes p. 31). Bars under `bases` are
  labelled by these bit strings, with the legend "0 = +1".
- **Symbols.** $\varepsilon_k$, $b_k$, $\zeta_k$, $n_y$, $\Pi$, $s$ as in the notes. $x_i$, $y_i$ are the hidden values of
  Unit 7.6, never coordinates. GHZ means $\mathrm{GHZ}_3$ unless N is written.
- **Text and numbers:** as Q6 (TeX inside `$…$`; no plan ids in learner text; every number from `d(V.key, n)`; amplitudes
  never as percentages). Units: 7.1 `q7-ghz`, 7.2 `q7-brackets`, 7.3 `q7-parity-table`, 7.4 `q7-bit-strings`,
  7.5 `q7-observables`, 7.6 `q7-mermin`. Claim keys `q7…`.

**Stage shorthand.** Q6's `amp`, `circ`, `mx`, `split`, `pa`, `prod`, plus:

| Shorthand | Expands to | Needs |
|---|---|---|
| `cp(f)` | `{kind:'complex-plane', ...f}` (built fields: `z`, `w`, `show`, `spokes`, `powers`) | — |
| `pa3('XXX')` | `{kron:[{pauli:'X'},{kron:[{pauli:'X'},{pauli:'X'}]}]}`, an 8 × 8 matrix drawn in colour only | v1 |
| `G3` | `{bell:'000+111'}` (the engine's `bell`, which takes any two-term content) | — |
| `ab(b, f)` | `amp(G3, {bases:b, mode:'probability', ...f})`, e.g. `ab(['y','y','x'], {parity:true})` | matrix-v2 (the §6.2 fields `bases`, `parity`, `stats`) |
| `tab(rows, f)` | `mx({tableau:rows, state:G3, ...f})`, with `product:true` or `values:{x:[…], y:[…]}` (`state` is proposed in §9.2) | matrix-v2 |

Numbers that a `cp` view draws come from the values file, never from literals: `V.q7ZetaDeg` (the four ζ angles),
`V.q7S[k]` (the s of six sample runs, as `{re, im}`). The power base −i in `powers:{of:{re:0, im:-1}, upTo:3}` is the
definition of $(-i)^{n_y}$, not a result.

**Circuits** (Q6's gate shorthand; `g(Y,k)`, `g(Sdg,k)` and `{op:'gate', gate:'SWAP', targets:[1,2]}` as in the format).

| Name | init | columns after `C_GHZ` | state after the last column |
|---|---|---|---|
| `C_GHZ` | `'000'` | `[g(H,0)] [cx(0,1)] [cx(0,2)]` (these are the first three columns of every row below) | k = 3: GHZ |
| `C_GHZM(q)` | `'000'`, clbits 1 | `[m(q,0)]` | k = 4 with `outcomes`: $\|000\rangle$ or $\|111\rangle$ |
| `C_GHZ_XXX` | `'000'` | `[g(X,0), g(X,1), g(X,2)]` | GHZ |
| `C_GHZ_YYX` | `'000'` | `[g(Y,0), g(Y,1), g(X,2)]` | −GHZ |
| `C_GHZ_SW` | `'000'` | `[SWAP 2–3]` | GHZ |
| `C_RUN(b)` | `'000'` | `[g(Sdg,k) for each k with b_k = y]` (omitted if none) then `[g(H,0), g(H,1), g(H,2)]` | the run's outcome amplitudes, bit 0 = +1 (the v1 fallback for `ab`) |

`C_RUN` is verified to give the same bars as `localBasisProbs` (`q7RunCircXXX`, `q7RunCircYYX`).

## 0. Chapter map

Q7 answers the map's question: **"Three qubits give random single readings but a certain product: could hidden
instructions explain that?"** It opens Part III, "Correlations and the density matrix".

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q7-ghz` | GHZ: three qubits, all or nothing | What does GHZ look like in the 0/1 basis, and how does it differ from three coins? | notes L6 p. 29; Bergou §3.9 pp. 57–58; HW2 P5(b)–(c) | — | Q6 Bell states; Q4 circuits |
| 2 | `q7-brackets` | Reading GHZ in the x and y bases | What does one qubit's bracket look like in the x or y basis? | notes L6 pp. 29–30, Eq. 2.9 | — | Q2/Q3 $\|{\pm y}\rangle$; F1 complex numbers |
| 3 | `q7-parity-table` | One formula for every run | Can one number predict the chance of every outcome of every run? | notes L6 pp. 30–31, Eq. 2.10, the table; HW2 P7(d) | — | F1 (powers of −i) |
| 4 | `q7-bit-strings` | Surviving strings carry the parity | Which bit strings survive each run, and what do they share? | notes L6 pp. 31–32 | — | Q6 parity |
| 5 | `q7-observables` | Four products with certain values | Which three-qubit quantities does GHZ fix, and how can all four be certain at once? | notes L7 p. 33, Eqs. 2.11–2.12; HW2 P7(a)–(b) | `l3-spread` | Q6 Pauli strings, compatible parities; Q3 dispersion |
| 6 | `q7-mermin` | No instruction set can do it | Could each qubit carry its answers fixed in advance? | notes L7 pp. 33–34, Eq. 2.13; HW2 P7(c); Bergou ⚑ P10.1(a) p. 186 (aside) | `l1-logic`, `l7-order` | Q1 hidden-label model; Q6 stabilizers |

**Outcomes** (Ground wording):
- Write the GHZ state and say what its 0/1 readings do; compare its count of zeros with three independent coins.
- Compute every single-qubit bracket in the x and y bases with one factor ζ.
- Predict the chance of any x/y run of GHZ from $s = (-i)^{n_y}\Pi$.
- Say which bit strings survive XXX, YYX and the odd-y runs, and why the product is a reading.
- Show that XXX, YYX, YXY and XYY commute and have GHZ as an eigenstate with zero spread.
- State Mermin's argument: no predetermined answers can match all four results, and quantum operators escape by order.

**Prerequisites** (concepts): Q6 `qc-bell-basis`, `qc-operator-tensor`, `qc-parities` (Pauli strings, stabilizers);
Q4 `qc-circuits`, `qc-one-qubit-gates` (H, S); Q3 `qc-observables`, `qc-uncertainty` (dispersion, compatible); Q2
`qc-x-states`; F1 `qc-complex-multiply`, `qc-euler`. Soft: F2 counts (not built; Q7 defines mean and variance inline,
§12 Q2). Reused glossary: `qc-pauli-string`, `qc-parity`, `qc-stabilizer`, `qc-compatible`, `qc-dispersion`,
`qc-eigenvalue`, `qc-hidden-label` (Q1).

**Openers and films.** The Part III opener is planned with Q8 (the density matrix), the Part's centre; Q7 gets one
deferred film (§10).

## 1. Story beats per unit

Kinds per unit (derivation views use only these): `q7-ghz` circuit, amplitudes · `q7-brackets` amplitudes,
complex-plane · `q7-parity-table` complex-plane, amplitudes · `q7-bit-strings` amplitudes · `q7-observables` matrix,
circuit, amplitudes · `q7-mermin` matrix, amplitudes. No `two-qubit` beat. Fidelity items: `qc-amp-engine`,
`qc-amp-hue-is-phase`, `qc-amp-bars-not-places`, `qc-circuit-engine-state`, the `complex-plane` items
(`qc-cplane-arithmetic`, `qc-cplane-not-space`) and the `matrix` kind's items.

### Unit `q7-ghz` — GHZ: three qubits, all or nothing

**`q7-ghz:b1` [L] · notation beat, `introduces: ['qc-ghz']`** (the state)
- **G:** "Three qubits can share a state the way the Bell pairs of Chapter Q6 do. The [[qc-ghz|GHZ state]] is $(|000\rangle + |111\rangle)/\sqrt2$: all three 0 or all three 1, in superposition. With N qubits it is $(|0\cdots0\rangle + |1\cdots1\rangle)/\sqrt2$. The name honours Greenberger, Horne and Zeilinger."
- **F:** "$|\mathrm{GHZ}_N\rangle = (|0\cdots0\rangle + |1\cdots1\rangle)/\sqrt2$, and $|\mathrm{GHZ}\rangle = (|000\rangle + |111\rangle)/\sqrt2$ for N = 3, the [[qc-ghz|GHZ state]] (notes p. 29; Bergou Eq. 3.81). An H and two CNOTs make it from $|000\rangle$. Bergou §3.9 sets it beside the W state as one of the two kinds of genuinely three-party entanglement."
- **Cap:** G "GHZ: two bars of 0.707, at 000 and 111" · F "$\mathrm{GHZ}_3$: 8 bars, 2 filled"
- **Stage:** `split( circ(C_GHZ, 3) / amp({circuit:C_GHZ, upTo:3}) )`.
- **Claims:** `q7Ghz3` → 0.707 at 000 and 111 · `q7GhzByCircuit` → the same · `q7GhzN` → (4, 2), (8, 2), (16, 2) bars, filled.

**`q7-ghz:b2` [L]** (all or nothing in the 0/1 basis)
- **G:** "Read all three qubits in the 0/1 basis. You get 000 or 111, each half the time, and nothing else. Read only qubit 1 and get 0: the other two are now certain to read 0 as well. One reading fixes the rest."
- **F:** "$P(000) = P(111) = |1/\sqrt2|^2 = \tfrac12$, and every other string has probability 0 (notes p. 29). Reading any one qubit fixes the others: after qubit 1 reads 0 the state is $|000\rangle$. The notes add that losing one qubit leaves the other two unentangled; Chapter Q9 computes this."
- **Cap:** G/F "qubit 1 read 0: one bar left, at 000"
- **Stage:** `split( circ(C_GHZM(0), 4, {outcomes:'0'}) / amp({circuit:C_GHZM(0), upTo:4, outcomes:'0'}) )`.
- **Claims:** `q7GhzP` → 0.5 at 000 and 111, 0 elsewhere · `q7After0` → p 0.5, post $|000\rangle$.

**`q7-ghz:b3` [B]** (count the zeros: HW2 P5(b)–(c); D1)
- **G:** "Count how many qubits read 0. For GHZ the count is 0 or 3, each half the time: average 1.5. Three independent $|+\rangle$ qubits also average 1.5, but counts of 1 and 2 are common. The spread differs: variance 2.25 for GHZ against 0.75."
- **F:** "Let n be the number of zeros. For GHZ, $n \in \{0, 3\}$ with probability ½ each: $\langle n\rangle = \tfrac32$, $\mathrm{Var}\,n = \langle n^2\rangle - \langle n\rangle^2 = \tfrac94$. For $|+\rangle^{\otimes3}$ the count is that of three fair coins: $\langle n\rangle = \tfrac32$, $\mathrm{Var}\,n = \tfrac34$ (HW2 P5(b)–(c)). The same mean, three times the variance."
- **Cap:** G/F "zeros: mean 1.5, variance 2.25 (GHZ) against 0.75 (three coins)"
- **Stage:** `amp(G3, {mode:'probability', stats:'zeros'})` — needs: matrix-v2 (fallback: the same bars, with the numbers in the caption).
- **Claims:** `q7Zeros` → 1.5, 2.25 · `q7ZerosPlus` → 1.5, 0.75 · `q7ZerosDist` → 0.5, 0, 0, 0.5 · `q7ZerosDistPlus` → 0.125, 0.375, 0.375, 0.125.

**`q7-ghz:b4` [C]** (read the middle qubit)
- **Q G:** "Read qubit 2 of GHZ and get 1. What will qubits 1 and 3 read?"
- **Q F:** "After qubit 2 of GHZ reads 1, what is the state of the three qubits?"
- **Reveal G:** "1 and 1, with certainty. Only the $|111\rangle$ term had a 1 in the middle, so it is all that is left."
- **Reveal F:** "$|111\rangle$, with probability 1 given the reading; the reading itself had probability ½."
- **Reveal cap:** G/F "one bar left, at 111"
- **Stage:** question `amp(G3, {mode:'probability'})`; reveal `amp({circuit:C_GHZM(1), upTo:4, outcomes:'1'})`.
- **Claims:** `q7AfterQ2` → p 0.5, post $|111\rangle$.

### Unit `q7-brackets` — Reading GHZ in the x and y bases

**`q7-brackets:b1` [L]** (the x and y bases)
- **G:** "Now read each qubit in the x basis or the y basis instead. These are the states $|{\pm x}\rangle$ and $|{\pm y}\rangle$ of Chapter Q3. In $|{+y}\rangle$ the $|1\rangle$ amplitude carries a factor i. On its own, each qubit's reading is a fair coin, +1 or −1. Their product is another matter."
- **F:** "Measure each qubit of GHZ in $\{|{\pm x}\rangle\}$ or $\{|{\pm y}\rangle\}$, $|{\pm y}\rangle = (|0\rangle \pm i|1\rangle)/\sqrt2$; H and the phase gates turn either basis into $|0\rangle, |1\rangle$ (notes p. 29; Unit 4.2). Each single outcome is ±1 with probability ½, while for some choices of bases the product of the three is certain."
- **Cap:** G/F "$|{+y}\rangle$: 0.707 and 0.707·i"
- **Stage:** `amp({dir:'+y'}, {dials:true})`.
- **Claims:** `q7PlusY` → (0.707, 0.707i) · `q7SingleX` → 0.5, 0.5.

**`q7-brackets:b2` [L] · notation beat, `introduces: ['qc-ghz-run']`** (what one run is)
- **G:** "One run of the experiment is fixed by two things for each qubit. $b_k$ is the basis chosen for qubit k, x or y. $\varepsilon_k$ is the reading it gave, +1 or −1. So qubit k ends in $|\varepsilon_kb_k\rangle$, one of $|{+x}\rangle$, $|{-x}\rangle$, $|{+y}\rangle$, $|{-y}\rangle$. We name a run's bases in capitals, like XYX."
- **F:** "A [[qc-ghz-run|run]] is $(b_k, \varepsilon_k)_{k=1}^3$ with $b_k \in \{x, y\}$ and $\varepsilon_k = \pm1$; qubit k is projected onto $|\varepsilon_kb_k\rangle$, so $|\varepsilon_2b_2\rangle = |{-y}\rangle$ means qubit 2 was read in y and gave −1 (notes p. 30). Bases are named in capitals: XYX is $b_1 = x$, $b_2 = y$, $b_3 = x$."
- **Cap:** G/F "an XYX run: 8 outcome strings, bit 0 = +1"
- **Stage:** `ab(['x','y','x'])` — needs: matrix-v2 (fallback `amp({circuit:C_RUN('xyx')}, {mode:'probability'})`).
- **Claims:** `q7Table_xyx` → 0.125 × 8.

**`q7-brackets:b3` [L] · notation beat, `introduces: ['qc-zeta']`** (eight brackets, one factor; D2)
- **G:** "Every bracket we need is one of eight. All four brackets with $|0\rangle$ equal $1/\sqrt2$. A bracket with $|1\rangle$ differs from $1/\sqrt2$ only by a factor $\zeta_k$ of size 1. In the x basis $\zeta_k = \varepsilon_k$; in the y basis $\zeta_k = -i\varepsilon_k$."
- **F:** "$\langle\varepsilon_kb_k|0\rangle = 1/\sqrt2$ and $\langle\varepsilon_kb_k|1\rangle = \zeta_k/\sqrt2$, with [[qc-zeta|$\zeta_k$]] $= \varepsilon_k$ for $b_k = x$ and $-i\varepsilon_k$ for $b_k = y$ (notes Eq. 2.9). The basis decides whether $\zeta_k$ is real or imaginary, the outcome its sign; $\zeta_k$ is a number, unrelated to the Pauli matrices."
- **Cap:** G/F "the four $\zeta$: 1, −1, −i, i"
- **Stage:** `cp({spokes:{phasesDeg:V.q7ZetaDeg}})`.
- **Claims:** `q7Bra` → the eight brackets · `q7Zeta` → 1, −1, −i, i · `q7ZetaDeg` → 0°, 180°, 270°, 90°.

**`q7-brackets:b4` [C]** (a y reading of −1)
- **Q G:** "A qubit is read in the y basis and gives −1. What is its $\zeta$?"
- **Q F:** "What is $\zeta_k$ for $b_k = y$, $\varepsilon_k = -1$, and which bracket does it come from?"
- **Reveal G:** "$+i$, since $\zeta = -i\varepsilon = -i\times(-1)$. It comes from $\langle{-y}|1\rangle = i/\sqrt2$: the bra conjugates the $-i$ inside $|{-y}\rangle$."
- **Reveal F:** "$\zeta = +i$, from $\langle{-y}|1\rangle = +i/\sqrt2$, the conjugate of the $|1\rangle$ amplitude $-i/\sqrt2$ of $|{-y}\rangle$."
- **Reveal cap:** G/F "$\zeta = i$: a quarter turn"
- **Stage:** question `cp({spokes:{phasesDeg:V.q7ZetaDeg}})`; reveal `cp({z:{r:1, phiDeg:V.q7ZetaDeg[3]}, show:['arg']})`.
- **Claims:** `q7Zeta` (y, −1) → i · `q7Bra` → ⟨−y|1⟩ = 0.707i.

### Unit `q7-parity-table` — One formula for every run

**`q7-parity-table:b1` [L]** (two terms; D3)
- **G:** "A GHZ bracket has just two terms, one from $|000\rangle$ and one from $|111\rangle$. The first is always $\tfrac1{2\sqrt2}$. The second is the same times $s = \zeta_1\zeta_2\zeta_3$. With GHZ's own $1/\sqrt2$ in front, the bracket is $(1 + s)/4$."
- **F:** "$\langle\varepsilon_1b_1, \varepsilon_2b_2, \varepsilon_3b_3|\mathrm{GHZ}\rangle = \tfrac1{\sqrt2}\big[\prod_k\langle\varepsilon_kb_k|0\rangle + \prod_k\langle\varepsilon_kb_k|1\rangle\big] = \tfrac{1 + s}4$ with $s = \zeta_1\zeta_2\zeta_3$ (notes p. 30). Every run differs from every other only through the single number s."
- **Cap:** G/F "s = 1: the two terms add, $(1 + 1)/4 = 0.5$"
- **Stage:** `cp({z:{re:1, im:0}, w:V.q7S[0], show:['sum']})`.
- **Claims:** `q7S` (XXX, 000) → 1 · `q7Bracket1s` → 0.5, 0, 0.25 ± 0.25i · `q7RunXXX` → 0.5.

**`q7-parity-table:b2` [L] · notation beat, `introduces: ['qc-ny-pi']`** (bases and outcomes, separated)
- **G:** "Split s into two parts. Each qubit read in y brings a factor $-i$, so the bases give $(-i)^{n_y}$, where $n_y$ counts the y's. The readings give $\Pi = \varepsilon_1\varepsilon_2\varepsilon_3$, which is +1 or −1. So $s = (-i)^{n_y}\Pi$."
- **F:** "$s = \zeta_1\zeta_2\zeta_3 = (-i)^{n_y}\Pi$, with [[qc-ny-pi|$n_y$]] the number of qubits read in y and $\Pi = \varepsilon_1\varepsilon_2\varepsilon_3$ (notes Eq. 2.10). The bases fix $(-i)^{n_y}$; the outcomes fix $\Pi = \pm1$. Runs with the same $n_y$ differ only in $\Pi$."
- **Cap:** G/F "$(-i)^{n_y}$ for $n_y$ = 0, 1, 2, 3: 1, −i, −1, i"
- **Stage:** `cp({powers:{of:{re:0, im:-1}, upTo:3}})`.
- **Claims:** `q7PowMinusI` → 1, −i, −1, i · `q7S` → the six sample runs.

**`q7-parity-table:b3` [L]** (the chances; D3)
- **G:** "The chance of an outcome is the bracket's size squared, $|1 + s|^2/16$. If s = 1 it is $\tfrac14$. If s = −1 the two terms cancel: chance 0. If s = i or −i the chance is $\tfrac18$."
- **F:** "$P = |1 + s|^2/16$: $\tfrac14$ for s = 1, 0 for s = −1 and $\tfrac18$ for $s = \pm i$ (notes p. 31). An even $n_y$ makes s real, so half the outcomes are forbidden; an odd $n_y$ makes every outcome equally likely."
- **Cap:** G/F "s = −i: $|1 - i| = 1.414$, chance 0.125"
- **Stage:** `cp({z:{re:1, im:0}, w:V.q7S[4], show:['sum','modulus']})`.
- **Claims:** `q7P1s` → 0.25, 0, 0.125, 0.125 · `q7AbsOnePlusS` → 2, 0, 1.414, 1.414.

**`q7-parity-table:b4` [L]** (the table)
- **G:** "The notes collect every case in one table, by $n_y$ and $\Pi$. With no y's, $\Pi = +1$ has chance $\tfrac14$ and $\Pi = -1$ never happens. Two y's swap that rule. One or three y's give $\tfrac18$ to every outcome."
- **F:** "The p. 31 table: $n_y = 0$ gives $s = \Pi$, so $\Pi = +1$ outcomes have $\tfrac14$ and $\Pi = -1$ ones are forbidden; $n_y = 2$ gives $s = -\Pi$, the reverse; $n_y = 1, 3$ give $s = \mp i\Pi, \pm i\Pi$ and $\tfrac18$ for all, with no correlation (notes p. 31)."
- **Cap:** G/F "XXX: four bars of 0.25, four empty"
- **Stage:** `ab(['x','x','x'])` — needs: matrix-v2 (fallback `amp({circuit:C_RUN('xxx')}, {mode:'probability'})`).
- **Claims:** `q7Table_xxx` · `q7Table_yyx` · `q7Table_xxy`.

**`q7-parity-table:b5` [B]** (two runs by hand: HW2 P7(d))
- **G:** "Check two outcomes by hand. All three read in x, all giving +1: the bracket is $\tfrac12$, so the chance is $\tfrac14$. Change the last reading to −1 and the bracket is 0: that outcome never happens."
- **F:** "$\langle{+x},{+x},{+x}|\mathrm{GHZ}\rangle = \tfrac12$ and $\langle{+x},{+x},{-x}|\mathrm{GHZ}\rangle = 0$, as $(1 + s)/4$ with $s = \Pi = \pm1$ predicts (HW2 P7(d)). In a YYX run the outcomes that survive are those with $\Pi = -1$."
- **Cap:** G/F "s = −1: the two terms cancel"
- **Stage:** `cp({z:{re:1, im:0}, w:V.q7S[1], show:['sum']})`.
- **Claims:** `q7RunXXX` → 0.5, 0 · `q7RunYYX` → 0, 0.5 · `q7S` (XXX, 001) → −1.

**`q7-parity-table:b6` [C]** (one y)
- **Q G:** "In an XXY run, which outcomes can occur, and how often?"
- **Q F:** "Give the outcome distribution of an XXY run on GHZ."
- **Reveal G:** "All eight, each $\tfrac18$ of the time. One y makes s equal to i or −i, and then $|1 + s|^2/16 = \tfrac18$ for every outcome."
- **Reveal F:** "Uniform: $n_y = 1$ gives $s = \mp i$, so $P = |1 \mp i|^2/16 = \tfrac18$ for all eight strings."
- **Reveal cap:** G/F "eight bars of 0.125"
- **Stage:** question `cp({powers:{of:{re:0, im:-1}, upTo:3}})`; reveal `ab(['x','x','y'])` — needs: matrix-v2.
- **Claims:** `q7Table_xxy` → 0.125 × 8.

### Unit `q7-bit-strings` — Surviving strings carry the parity

**`q7-bit-strings:b1` [L]** (bits and parity; D4)
- **G:** "Record each reading as a bit: +1 becomes 0 and −1 becomes 1. Then $\Pi = +1$ means an even number of 1s. In an XXX run only the even strings 000, 011, 101 and 110 occur, each a quarter of the time. The odd strings never appear."
- **F:** "Write $\varepsilon_k = +1 \to 0$ and $-1 \to 1$; then $\Pi = +1$ ⇔ the string has even [[qc-parity|parity]]. For XXX, $n_y = 0$ and $s = \Pi$: 000, 011, 101, 110 occur with $P = \tfrac14$ each, and 001, 010, 100, 111 never (notes p. 31)."
- **Cap:** G/F "XXX: even strings 0.25 each, odd strings empty"
- **Stage:** `ab(['x','x','x'], {parity:true})` — needs: matrix-v2.
- **Claims:** `q7Table_xxx` → 0.25 at 000, 011, 101, 110.

**`q7-bit-strings:b2` [L]** (two y's flip the parity)
- **G:** "For YYX, YXY and XYY the rule flips: only the odd strings 001, 010, 100 and 111 occur. Two factors of $-i$ make −1, and that turns even into odd. The sign of the correlation is the parity of the strings that survive."
- **F:** "For YYX, YXY and XYY, $n_y = 2$ and $s = -\Pi$: the odd strings survive with $\tfrac14$ each and the even ones are forbidden. The sign of the correlation is the parity of the surviving strings, flipped by the two factors of $-i$ (notes p. 31)."
- **Cap:** G/F "YYX: odd strings 0.25 each"
- **Stage:** `ab(['y','y','x'], {parity:true})` — needs: matrix-v2.
- **Claims:** `q7Table_yyx`, `q7Table_yxy`, `q7Table_xyy` → 0.25 at 001, 010, 100, 111.

**`q7-bit-strings:b3` [L]** (an odd number of y's selects nothing)
- **G:** "With one or three y's nothing is selected. All eight strings come up, each an eighth of the time. These runs show no correlation at all."
- **F:** "An odd $n_y$ gives $s = \pm i$ and $P = \tfrac18$ for every string: no parity is selected and no correlation is visible (notes p. 31)."
- **Cap:** G/F "XXY: all eight at 0.125"
- **Stage:** `ab(['x','x','y'], {parity:true})` — needs: matrix-v2.
- **Claims:** `q7Table_xxy`, `q7Table_yyy` → 0.125 × 8.

**`q7-bit-strings:b4` [L]** (the product is a reading)
- **G:** "In an XXX run each $\varepsilon_k$ is a reading of X on qubit k. So $\Pi$ is a reading of $X_1X_2X_3$. Writing down the string 011 already records $\Pi = +1$. The single readings scatter at random, yet the product comes out the same every time."
- **F:** "In an XXX run $\varepsilon_k$ is the measured value of $\sigma_{xk}$, so $\Pi$ is a measured value of $\sigma_{x1}\sigma_{x2}\sigma_{x3}$: recording 011 and recording $\Pi = +1$ are one act (notes pp. 31–32). A quantity the state fixes while its factors stay random is an observable with a definite value, the subject of Unit 7.5."
- **Cap:** G/F "XXX: each qubit 50/50; the product +1 every run"
- **Stage:** `ab(['x','x','x'], {stats:'product'})` — needs: matrix-v2.
- **Claims:** `q7SingleX` → 0.5, 0.5 · `q7Mean` (XXX) → 1 · `q7Var` (XXX) → 0.

**`q7-bit-strings:b5` [C]** (finish the string)
- **Q G:** "An XXX run reads 0 on qubit 1 and 1 on qubit 2. What must qubit 3 read?"
- **Q F:** "An XXX run gives $\varepsilon_1 = +1$, $\varepsilon_2 = -1$. What is $\varepsilon_3$?"
- **Reveal G:** "1, that is −1. Only even strings occur in XXX, so 01? must be 011."
- **Reveal F:** "$\varepsilon_3 = -1$: $\Pi = +1$ with certainty, so the string is 011; 010 has probability 0."
- **Reveal cap:** G/F "011: 0.25; 010: 0"
- **Stage:** question `amp(G3, {mode:'probability'})`; reveal `ab(['x','x','x'], {parity:true})` — needs: matrix-v2.
- **Claims:** `q7Table_xxx` → 0.25 at 011, 0 at 010.

### Unit `q7-observables` — Four products with certain values

**`q7-observables:b1` [L] · notation beat, `introduces: ['qc-mermin-observables']`** (four three-qubit observables)
- **G:** "The four products are observables in their own right: $X_1X_2X_3$, $Y_1Y_2X_3$, $Y_1X_2Y_3$ and $X_1Y_2Y_3$. As Pauli strings (Unit 6.2) they are XXX, YYX, YXY and XYY. Each squares to the identity, so its values are +1 and −1. Measuring one means reading the three qubits and multiplying."
- **F:** "The [[qc-mermin-observables|Mermin observables]] $\hat O_{XXX} = \sigma_{x1}\sigma_{x2}\sigma_{x3}$, $\hat O_{YYX} = \sigma_{y1}\sigma_{y2}\sigma_{x3}$, $\hat O_{YXY}$, $\hat O_{XYY}$ (notes Eq. 2.11) are Pauli strings with $\hat O^2 = I$ and eigenvalues ±1. Measuring one means measuring its three factors and multiplying: its value is the $\Pi$ of the runs just tabulated."
- **Cap:** G "XXX: 1s on the anti-diagonal" · F "$\hat O_{XXX}$, an $8\times8$ matrix"
- **Stage:** `mx(pa3('XXX'), {values:'none'})`.
- **Claims:** `q7Square` → 0 (largest entry of $\hat O^2 - I$ over the four).

**`q7-observables:b2` [L]** (they commute)
- **G:** "Any two of the four differ on exactly two qubits. On each of those qubits X and Y anticommute, which costs a minus sign. Two signs cancel. So all four commute, and all four can have sure values together."
- **F:** "Any two of the four differ in exactly two slots, where $\sigma_x$ and $\sigma_y$ anticommute; the two signs cancel, so all four commute and are [[qc-compatible|compatible]] (notes p. 33), as XX and ZZ were in Unit 6.6."
- **Cap:** G/F "each pair of rows differs in two columns"
- **Stage:** `tab(['XXX','YYX','YXY','XYY'])` — needs: matrix-v2.
- **Claims:** `q7Comm` → 0.

**`q7-observables:b3` [L]** (GHZ is their eigenstate: HW2 P7(a); D5)
- **G:** "Apply XXX to GHZ. It flips all three bits, so $|000\rangle$ and $|111\rangle$ trade places and GHZ comes back unchanged: eigenvalue +1. YYX also trades the two terms, but each Y adds a factor i or −i. The factors multiply to −1, so GHZ comes back as $-\mathrm{GHZ}$."
- **F:** "$\hat O_{XXX}|\mathrm{GHZ}\rangle = +|\mathrm{GHZ}\rangle$ and $\hat O_{YYX}|\mathrm{GHZ}\rangle = \hat O_{YXY}|\mathrm{GHZ}\rangle = \hat O_{XYY}|\mathrm{GHZ}\rangle = -|\mathrm{GHZ}\rangle$ (notes Eq. 2.12). With $\sigma_y|0\rangle = i|1\rangle$ and $\sigma_y|1\rangle = -i|0\rangle$: $YYX|000\rangle = i^2|111\rangle$ and $YYX|111\rangle = (-i)^2|000\rangle$ (HW2 P7(a))."
- **Cap:** G "after YYX: both bars below the axis. The −1 is the eigenvalue; as a state, −GHZ is GHZ." · F "$\hat O_{YYX}|\mathrm{GHZ}\rangle = -|\mathrm{GHZ}\rangle$; the sign is the eigenvalue, not a new state"
- **Stage:** `split( circ(C_GHZ_YYX, 4) / amp({circuit:C_GHZ_YYX, upTo:4}, {mode:'signed'}) )`.
- **Claims:** `q7Eig` → +1, −1, −1, −1 · `q7GhzXXX` → GHZ · `q7GhzYYX` → −GHZ · `q7YonKets` → $Y|0\rangle = i|1\rangle$, $Y|1\rangle = -i|0\rangle$.

**`q7-observables:b4` [B]** (one symmetry gives the other two: HW2 P7(b))
- **G:** "GHZ looks the same whichever way you number its qubits. YXY and XYY are just YYX with the qubits renumbered. So they share its eigenvalue, −1, with no new calculation."
- **F:** "$|\mathrm{GHZ}\rangle$ is invariant under every permutation of the three qubits, and YXY, XYY are permutations of YYX, so they share the eigenvalue −1 (HW2 P7(b)). A SWAP of qubits 2 and 3 leaves GHZ unchanged and turns YYX into YXY."
- **Cap:** G/F "after swapping qubits 2 and 3: the same GHZ"
- **Stage:** `split( circ(C_GHZ_SW, 4) / amp({circuit:C_GHZ_SW, upTo:4}) )`.
- **Claims:** `q7GhzSwap` → GHZ · `q7Eig` (YXY, XYY) → −1, −1.

**`q7-observables:b5` [L]** (certain values: no spread)
- **G:** "These are eigenvalue statements, which say more than averages. The average of XXX is +1 and its spread is 0: every single run gives +1. One qubit's X reading is the opposite: average 0 and spread 1, as random as a ±1 reading can be."
- **F:** "As eigenvalue equations, Eq. 2.12 gives $\langle\hat O\rangle = \pm1$ and $\langle(\Delta\hat O)^2\rangle = \langle\hat O^2\rangle - \langle\hat O\rangle^2 = 0$, while $\langle\sigma_{x1}\rangle = 0$ with $\langle(\Delta\sigma_{x1})^2\rangle = 1$, the largest a ±1 observable allows (notes p. 33; 448's <<qc-l3-spread|spread of single readings>>)."
- **Cap:** G/F "product: mean +1, spread 0; one qubit: mean 0, spread 1"
- **Stage:** `ab(['x','x','x'], {stats:'product'})` — needs: matrix-v2.
- **Claims:** `q7Mean` → 1, −1, −1, −1 · `q7Var` → 0, 0, 0, 0 · `q7X1` → 0, 1.

**`q7-observables:b6` [C]** (a thousand runs)
- **Q G:** "Measure XXX on GHZ a thousand times. How many runs give −1?"
- **Q F:** "In N runs of $\hat O_{XXX}$ on GHZ, how many give −1?"
- **Reveal G:** "None. The spread of XXX is 0, so every run gives +1, even though each qubit's own reading is a coin toss."
- **Reveal F:** "Zero: GHZ is an eigenstate with eigenvalue +1 and $\langle(\Delta\hat O_{XXX})^2\rangle = 0$."
- **Reveal cap:** G/F "product +1, every run"
- **Stage:** question `amp(G3)`; reveal `ab(['x','x','x'], {stats:'product'})` — needs: matrix-v2.
- **Claims:** `q7Mean` (XXX) → 1 · `q7Var` (XXX) → 0.

### Unit `q7-mermin` — No instruction set can do it

**`q7-mermin:b1` [L] · notation beat, `introduces: ['qc-hidden-values']`** (instruction cards)
- **G:** "Suppose each qubit carried a card with two answers fixed in advance. $x_i$ answers an X reading and $y_i$ a Y reading, each ±1. A reading would simply reveal the answer on the card. A run shows only one of the two, but the card would hold both. Chapter Q1's hidden-label model had the same idea."
- **F:** "[[qc-local-realism|Local realism]] assigns [[qc-hidden-values|predetermined values]] $x_i, y_i = \pm1$ to both measurements on each qubit at once; a run reveals $\varepsilon_k = x_k$ if $b_k = x$ and $\varepsilon_k = y_k$ if $b_k = y$ (notes p. 33; HW2 P7). The four quantum results to match: YYX, YXY, XYY give −1 and XXX gives +1."
- **Cap:** G/F "one card: it matches three results and fails YYX"
- **Stage:** `tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,1], y:[1,1,-1]}})` — needs: matrix-v2.
- **Claims:** `q7MerminCard` → +1, −1, −1, +1 against the quantum −1, −1, −1, +1.
- **Terms:** `qc-hidden-label` (Q1, link-back).

**`q7-mermin:b2` [L]** (the contradiction: HW2 P7(c); D6)
- **G:** "Multiply a card's answers for YYX, YXY and XYY. Each $y_i$ appears twice, and $y_i^2 = 1$, so what is left is $x_1x_2x_3$. The three quantum results force it to be $(-1)^3 = -1$. But the XXX result is +1. No card can do both."
- **F:** "$(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = x_1x_2x_3(y_1y_2y_3)^2 = x_1x_2x_3$, so the three results −1 force $x_1x_2x_3 = -1$, against +1 for XXX (notes p. 34): no predetermined values reproduce all four. This is [[qc-mermin-argument|Mermin's argument]]; one run of each setting suffices, with no statistics."
- **Cap:** G/F "another card: it matches the three y results and fails XXX"
- **Stage:** `tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,-1], y:[1,1,-1]}})` — needs: matrix-v2.
- **Claims:** `q7MerminCard3` → −1, −1, −1, −1 · `q7Forced` → −1 · `q7Eig` (XXX) → +1.

**`q7-mermin:b3` [L]** (the best card scores three)
- **G:** "Try every card: two choices for each of six answers, 64 cards. Half of them match three of the four results, and half match only one. None matches all four. The four products of a card always multiply to +1, while the quantum results multiply to −1."
- **F:** "Over all $2^6 = 64$ assignments, 32 satisfy three of the four relations and 32 satisfy one; none satisfies all four. The product of the four left-hand sides is $\prod_i x_i^2y_i^2 = +1$, while the quantum values multiply to $(-1)^3(+1) = -1$, so an odd number of relations must fail."
- **Cap:** G/F "64 cards: 32 score three, 32 score one, none scores four"
- **Stage:** `tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,-1], y:[1,1,-1]}})` — needs: matrix-v2.
- **Claims:** `q7Mermin` → total 64, scores (0, 32, 0, 32, 0) for 0–4 matches, best 3.

**`q7-mermin:b4` [L]** (how quantum mechanics escapes; D7)
- **G:** "Quantum mechanics has no such clash, and the reason is order. Multiply the three operators: qubit 2 receives Y, then X, then Y. Since X and Y anticommute, $Y\cdot X\cdot Y = -X$. For numbers $y\,x\,y = x$, with no sign. That lost minus sign is exactly the one the cards cannot supply."
- **F:** "As operators, $(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3$ (notes Eq. 2.13): qubits 1 and 3 receive $Y\cdot Y\cdot X = X$ and $X\cdot Y\cdot Y = X$, but qubit 2 receives $Y\cdot X\cdot Y = -X$. On GHZ both sides give −1, consistently. Replacing operators by numbers throws away the anticommutation that supplies the sign."
- **Cap:** G/F "column products X, −X, X: the product is −XXX"
- **Stage:** `tab(['YYX','YXY','XYY'], {product:true})` — needs: matrix-v2.
- **Claims:** `q7Prod3` → 0 (largest entry of the product + XXX) · `q7YXY` → 0 · `q7YYXq1` → 0 · `q7Prod` → YYX·YXY = +IZZ.

**`q7-mermin:b5` [B]** (aside: GHZ's stabilizers, Bergou ⚑ P10.1(a))
- **G:** "GHZ, like $\Phi^+$ in Unit 6.6, is pinned down by stabilizers. XXX is one. $Z_1Z_2$ and $Z_2Z_3$ are two more: they check that neighbouring bits agree. Bergou's Problem 10.1 asks for such a set."
- **F:** "Aside (Bergou ⚑ P10.1(a), p. 186): XXX, ZZI and IZZ each satisfy $g|\mathrm{GHZ}\rangle = +|\mathrm{GHZ}\rangle$ and together generate GHZ's stabilizer group, as XX and ZZ do for $\Phi^+$ (Unit 6.6). Part IX develops the formalism."
- **Cap:** G/F "three stabilizers of GHZ: XXX, ZZI, IZZ"
- **Stage:** `tab(['XXX','ZZI','IZZ'])` — needs: matrix-v2.
- **Claims:** `q7Stab` → +1, +1, +1 (ZZI, IZZ, ZIZ) · `q7Eig` (XXX) → +1.

**`q7-mermin:b6` [C]** (why one run each is enough: HW2 P7(c))
- **Q G:** "Most tests of hidden answers need many runs and averages. Why does this argument need only one run of each setting?"
- **Q F:** "Why is Mermin's GHZ argument a sharper refutation of local hidden variables than a violation of Bell's inequality (HW2 P7(c))?"
- **Reveal G:** "Each of the four quantum predictions is certain, with spread 0. So a single run of each setting shows the clash, and one YYX run giving +1 would refute quantum mechanics. Chapter Q10's CHSH test, in contrast, bounds averages of uncertain readings."
- **Reveal F:** "The four predictions are eigenvalues with zero dispersion, so the contradiction is between definite values in single runs, not between averages; Bell's inequality, Chapter Q10, needs statistics over many runs (notes p. 34)."
- **Reveal cap:** G/F "four products, each certain"
- **Stage:** question `tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,1], y:[1,1,-1]}})`; reveal `ab(['y','y','x'], {stats:'product'})` — needs: matrix-v2.
- **Claims:** `q7Var` → 0, 0, 0, 0 · `q7Mean` → 1, −1, −1, −1.

### 1.7 Claim ledger (engine call → value; numpy route)

| Key | Engine call (Q7.values.ts) | Value | numpy route |
|---|---|---|---|
| `q7Ghz3`, `q7GhzP`, `q7GhzN`, `q7GhzByCircuit` | `ghz(n)`, `probs`, `runCircuit(C_GHZ)` | 0.707, 0.5; (4,2), (8,2), (16,2) | explicit basis vectors |
| `q7After0`, `q7After1`, `q7AfterQ2` | `postMeasure(ghz(3), [q], bit)` | p 0.5; $\|000\rangle$, $\|111\rangle$ | projector then normalize |
| `q7Zeros`, `q7ZerosPlus`, `q7ZerosDist*` | E1 `weightStats(ψ, 0)` | (1.5, 2.25), (1.5, 0.75) | enumerate strings |
| `q7PlusY`, `q7Bra`, `q7Zeta`, `q7ZetaDeg` | `KET['+y']`; rows of the readout rotation (H, H·S†) | 0.707, ±0.707i; 1, −1, −i, i; 0°, 180°, 270°, 90° | explicit bras $\langle\varepsilon b\|$ |
| `q7S`, `q7Bracket1s`, `q7P1s`, `q7PowMinusI`, `q7AbsOnePlusS` | E1 `runBracket(ψ, bases, eps)` (then s = 4·bracket − 1); `complex.ts` | see beats | $(-i)^{n_y}\Pi$; $\|1+s\|^2/16$ |
| `q7RunXXX`, `q7RunYYX`, `q7RunXXY` | E1 `runBracket` | 0.5, 0; 0, 0.5; 0.25 − 0.25i | product bras |
| `q7Table_*`, `q7SingleX`, `q7RunCirc*` | E1 `localBasisProbs(ghz(3), bases)`; `runCircuit(C_RUN(b))` | 0.25/0, 0.125 | product bras; (1+s)/4 for all 64 runs |
| `q7Eig`, `q7Stab` | E1 `pauliEigenvalue(ghz(3), s)` | (1, −1, −1, −1); (1, 1, 1) | `np.allclose(Pψ, ±ψ)` |
| `q7Comm`, `q7Square`, `q7Mean`, `q7Var`, `q7X1` | E1 `paulisCommute`; `expectationN`, `varianceN` | 0; ±1; 0; (0, 1) | numpy products |
| `q7GhzXXX`, `q7GhzYYX`, `q7GhzSwap`, `q7YonKets` | `runCircuit(C_GHZ_*)`; `apply(Y, ·)` | GHZ, −GHZ, GHZ; $i\|1\rangle$, $-i\|0\rangle$ | `ps('YYX') @ G3` |
| `q7Prod`, `q7Prod3`, `q7YXY`, `q7XYX`, `q7YYXq1` | E1 `pauliMul`; `matmul` | +IZZ; 0 | trace inner products |
| `q7Mermin`, `q7MerminCard`, `q7MerminCard3`, `q7Forced` | E1 `merminInstructionSets()`; product of `q7Eig` | 64, (0,32,0,32,0), 3; cards; −1 | `itertools.product` |

## 2. Derivations

Format as Q6 §2: `tex` — `why` — **view** — *viewCaption*; a step without a view inherits the previous one in its list.

**D1 · `q7-ghz:b3` · result `\mathrm{Var}\,n = \tfrac94\ (\mathrm{GHZ})\ \text{against}\ \tfrac34\ (|+\rangle^{\otimes3})`** (HW2 P5(b)–(c))
- Ground (3 views):
  1. `n \in \{0, 3\},\quad P(0) = P(3) = \tfrac12` — GHZ reads 111 or 000, so the number of zeros is 0 or 3. **view** `amp(G3, {mode:'probability'})` · *GHZ: two bars of ½*
  2. `\langle n\rangle = \tfrac12\cdot0 + \tfrac12\cdot3 = \tfrac32` — An average weighs each value by its chance. **view** `amp(G3, {mode:'probability', stats:'zeros'})` · *zeros: mean 1.5*
  3. `\langle n^2\rangle = \tfrac12\cdot0 + \tfrac12\cdot9 = \tfrac92` — The same for the square of the count.
  4. `\mathrm{Var}\,n = \langle n^2\rangle - \langle n\rangle^2 = \tfrac92 - \tfrac94 = \tfrac94` — The variance is the average square minus the squared average, as for $\langle(\Delta A)^2\rangle$ in Chapter Q3.
  5. `|+\rangle^{\otimes3}:\ P(n) = \tfrac18, \tfrac38, \tfrac38, \tfrac18` — Three independent fair coins: one way to get 0 or 3 zeros, three ways to get 1 or 2. **view** `amp({ket:'+++'}, {mode:'probability', stats:'zeros'})` · *three coins: eight bars of ⅛*
  6. `\langle n\rangle = \tfrac32,\quad \mathrm{Var}\,n = 3\cdot\tfrac14 = \tfrac34` — For independent coins the variances add, ¼ each.
  7. `\mathrm{Var}\,n = \tfrac94\ (\mathrm{GHZ})\ \text{against}\ \tfrac34\ (|+\rangle^{\otimes3})` — The same mean, three times the spread: the zeros of GHZ come all together.
- Formal (2 views):
  1. `P_{\rm GHZ}(n) = \tfrac12(\delta_{n0} + \delta_{n3}) \Rightarrow \langle n\rangle = \tfrac32,\ \mathrm{Var}\,n = \tfrac94` — Only 000 and 111 occur. **view** `amp(G3, {mode:'probability', stats:'zeros'})`
  2. `\mathrm{Var}\,n = \tfrac94\ (\mathrm{GHZ})\ \text{against}\ \tfrac34\ (|+\rangle^{\otimes3})` — The product state's count is binomial with $N = 3$, $p = \tfrac12$: $Np(1 - p) = \tfrac34$ (HW2 P5(b)–(c)). **view** `amp({ket:'+++'}, {mode:'probability', stats:'zeros'})`
- Check: `q7Zeros`, `q7ZerosPlus`, `q7ZerosDist`, `q7ZerosDistPlus`. Needs: matrix-v2 (`stats`); without it the two probability views stay distinct.

**D2 · `q7-brackets:b3` · result `\langle\varepsilon_kb_k|1\rangle = \zeta_k/\sqrt2,\quad \zeta_k = \varepsilon_k\ (b_k = x),\ \ -i\varepsilon_k\ (b_k = y)`** (notes Eq. 2.9, p. 30)
- Ground (4 views):
  1. `|{\pm x}\rangle = \tfrac1{\sqrt2}(|0\rangle \pm |1\rangle),\quad |{\pm y}\rangle = \tfrac1{\sqrt2}(|0\rangle \pm i|1\rangle)` — The four states of the two bases (Chapter Q3). **view** `amp({dir:'+y'}, {dials:true})` · *$\|{+y}\rangle$: 0.707 and 0.707·i*
  2. `\langle{\pm x}|0\rangle = \langle{\pm y}|0\rangle = \tfrac1{\sqrt2}` — Every one of them has the real number $1/\sqrt2$ on $|0\rangle$.
  3. `\langle{+x}|1\rangle = \tfrac1{\sqrt2},\quad \langle{-x}|1\rangle = -\tfrac1{\sqrt2}` — In the x basis the $|1\rangle$ part is real, with the outcome's sign. **view** `amp({dir:'-x'}, {dials:true})` · *$\|{-x}\rangle$: the second dial points backwards*
  4. `\langle{+y}|1\rangle = \tfrac{-i}{\sqrt2},\quad \langle{-y}|1\rangle = \tfrac{i}{\sqrt2}` — A bra conjugates its ket's numbers, so the $+i$ in $|{+y}\rangle$ becomes $-i$ (Chapter Q1). **view** `cp({z:{r:1, phiDeg:90}, show:['conj']})` · *i and its mirror −i*
  5. `\langle\varepsilon_kb_k|1\rangle = \zeta_k/\sqrt2,\quad \zeta_k = \varepsilon_k\ (b_k = x),\ \ -i\varepsilon_k\ (b_k = y)` — Collect the four cases into one factor of size 1. **view** `cp({spokes:{phasesDeg:V.q7ZetaDeg}})` · *the four $\zeta$*
- Formal (2 views):
  1. `|\varepsilon x\rangle = \tfrac1{\sqrt2}(|0\rangle + \varepsilon|1\rangle),\quad |\varepsilon y\rangle = \tfrac1{\sqrt2}(|0\rangle + i\varepsilon|1\rangle)` — Both bases in one line. **view** `amp({dir:'+y'}, {dials:true})`
  2. `\langle\varepsilon_kb_k|1\rangle = \zeta_k/\sqrt2,\quad \zeta_k = \varepsilon_k\ (b_k = x),\ \ -i\varepsilon_k\ (b_k = y)` — Conjugate; $|\zeta_k| = 1$ (notes Eq. 2.9). **view** `cp({spokes:{phasesDeg:V.q7ZetaDeg}})`
- Check: `q7PlusY`, `q7Bra`, `q7Zeta`, `q7ZetaDeg`.

**D3 · `q7-parity-table:b3` · result `P = |1 + s|^2/16,\quad s = (-i)^{n_y}\Pi`** (notes Eq. 2.10, pp. 30–31)
- Ground (4 views):
  1. `\mathrm{GHZ} = \tfrac1{\sqrt2}\big(|000\rangle + |111\rangle\big)` — Two terms. **view** `amp(G3)` · *two bars*
  2. `\langle\varepsilon_1b_1, \varepsilon_2b_2, \varepsilon_3b_3|000\rangle = \big(\tfrac1{\sqrt2}\big)^3 = \tfrac1{2\sqrt2}` — The 000 term needs three brackets with $|0\rangle$, each $1/\sqrt2$.
  3. `\langle\varepsilon_1b_1, \varepsilon_2b_2, \varepsilon_3b_3|111\rangle = \tfrac{\zeta_1\zeta_2\zeta_3}{2\sqrt2} = \tfrac{s}{2\sqrt2}` — The 111 term needs three brackets with $|1\rangle$. **view** `cp({z:{re:1, im:0}, w:V.q7S[0], show:['sum']})` · *s = 1: the terms add*
  4. `\langle\ldots|\mathrm{GHZ}\rangle = \tfrac1{\sqrt2}\cdot\tfrac{1 + s}{2\sqrt2} = \tfrac{1 + s}4` — Add the two terms and keep GHZ's own $1/\sqrt2$.
  5. `s = (-i)^{n_y}\,\Pi` — Each y-basis qubit brings $-i$, and every qubit brings its sign $\varepsilon_k$. **view** `cp({powers:{of:{re:0, im:-1}, upTo:3}})` · *$(-i)^{n_y}$ for $n_y$ = 0–3*
  6. `P = |1 + s|^2/16,\quad s = (-i)^{n_y}\Pi` — The chance is the size squared: ¼, 0 or ⅛. **view** `cp({z:{re:1, im:0}, w:V.q7S[4], show:['sum','modulus']})` · *s = −i: $\|1 - i\| = 1.414$*
- Formal (2 views):
  1. `\langle\{\varepsilon_kb_k\}|\mathrm{GHZ}\rangle = \tfrac1{\sqrt2}\Big[\prod_k\tfrac1{\sqrt2} + \prod_k\tfrac{\zeta_k}{\sqrt2}\Big] = \tfrac{1 + s}4` — Eq. 2.9 in each factor. **view** `cp({z:{re:1, im:0}, w:V.q7S[0], show:['sum']})`
  2. `P = |1 + s|^2/16,\quad s = (-i)^{n_y}\Pi` — Eq. 2.10. **view** `cp({powers:{of:{re:0, im:-1}, upTo:3}})`
- Check: `q7S`, `q7Bracket1s`, `q7P1s`, `q7PowMinusI`, `q7AbsOnePlusS` (numpy: all 64 runs).

**D4 · `q7-bit-strings:b1` · result `P_{XXX}(\text{even}) = \tfrac14,\quad P_{YYX}(\text{odd}) = \tfrac14,\quad P_{n_y\ \text{odd}} = \tfrac18`** (notes p. 31)
- Ground (4 views):
  1. `\varepsilon = +1 \to 0,\quad \varepsilon = -1 \to 1` — Write each reading as a bit. **view** `ab(['x','x','x'])` · *XXX: eight outcome strings*
  2. `\Pi = +1 \iff \text{an even number of 1s}` — Each 1 is a factor −1 in $\Pi$.
  3. `n_y = 0:\ s = \Pi` — XXX has no y.
  4. `P_{XXX}(\text{even}) = \tfrac14,\quad P_{XXX}(\text{odd}) = 0` — Even strings have s = 1, odd ones s = −1. **view** `ab(['x','x','x'], {parity:true})` · *even bars 0.25, odd bars empty*
  5. `n_y = 2:\ s = -\Pi` — Two factors $-i$ multiply to −1. **view** `ab(['y','y','x'], {parity:true})` · *YYX: odd bars 0.25*
  6. `P_{XXX}(\text{even}) = \tfrac14,\quad P_{YYX}(\text{odd}) = \tfrac14,\quad P_{n_y\ \text{odd}} = \tfrac18` — An odd $n_y$ makes $s = \pm i$: an eighth for every string. **view** `ab(['x','x','y'], {parity:true})` · *XXY: all 0.125*
- Formal (2 views):
  1. `P(\varepsilon) = |1 + (-i)^{n_y}\Pi(\varepsilon)|^2/16` — Eq. 2.10 for each string. **view** `ab(['x','x','x'], {parity:true})`
  2. `P_{XXX}(\text{even}) = \tfrac14,\quad P_{YYX}(\text{odd}) = \tfrac14,\quad P_{n_y\ \text{odd}} = \tfrac18` — The sign of the correlation is the parity of the survivors (notes p. 31). **view** `ab(['y','y','x'], {parity:true})`
- Check: `q7Table_xxx`, `q7Table_yyx`, `q7Table_xxy`. Needs: matrix-v2. v1 fallback views: `amp({circuit:C_RUN(b)}, {mode:'probability'})` for the same three b (identical bars, no parity colouring).

**D5 · `q7-observables:b3` · result `\langle\hat O\rangle = \pm1,\quad \langle(\Delta\hat O)^2\rangle = 0`** (notes Eq. 2.12, p. 33; HW2 P7(a))
- Ground (4 views):
  1. `X|0\rangle = |1\rangle,\quad X|1\rangle = |0\rangle` — X flips a bit. **view** `mx(pa3('XXX'), {values:'none'})` · *XXX: 1s on the anti-diagonal*
  2. `XXX|000\rangle = |111\rangle,\quad XXX|111\rangle = |000\rangle` — Flipping all three bits swaps GHZ's two terms. **view** `amp({circuit:C_GHZ_XXX, upTo:4}, {mode:'signed'})` · *after XXX: the same two bars*
  3. `XXX|\mathrm{GHZ}\rangle = +|\mathrm{GHZ}\rangle` — Swapping the two terms of a sum leaves the sum unchanged.
  4. `Y|0\rangle = i|1\rangle,\quad Y|1\rangle = -i|0\rangle` — Y flips a bit too, but adds a factor i or −i.
  5. `YYX|000\rangle = i\cdot i\,|111\rangle = -|111\rangle,\quad YYX|111\rangle = (-i)(-i)\,|000\rangle = -|000\rangle` — Two Y's on each term multiply it by −1. **view** `amp({circuit:C_GHZ_YYX, upTo:4}, {mode:'signed'})` · *after YYX: both bars below the axis*
  6. `YYX|\mathrm{GHZ}\rangle = -|\mathrm{GHZ}\rangle` — So GHZ is an eigenstate of YYX with eigenvalue −1.
  7. `\langle\hat O\rangle = \pm1,\quad \langle(\Delta\hat O)^2\rangle = 0` — In an eigenstate every run gives the eigenvalue: average ±1, spread $1 - 1 = 0$. **view** `ab(['x','x','x'], {stats:'product'})` · *product: +1 every run*
- Formal (2 views):
  1. `\hat O_{XXX}|\mathrm{GHZ}\rangle = +|\mathrm{GHZ}\rangle,\quad \hat O_{YYX}|\mathrm{GHZ}\rangle = \hat O_{YXY}|\mathrm{GHZ}\rangle = \hat O_{XYY}|\mathrm{GHZ}\rangle = -|\mathrm{GHZ}\rangle` — By $\sigma_y|0\rangle = i|1\rangle$, $\sigma_y|1\rangle = -i|0\rangle$ and the permutation symmetry of GHZ. **view** `amp({circuit:C_GHZ_YYX, upTo:4}, {mode:'signed'})`
  2. `\langle\hat O\rangle = \pm1,\quad \langle(\Delta\hat O)^2\rangle = 0` — $\hat O^2 = I$; compare $\langle(\Delta\sigma_{x1})^2\rangle = 1$. **view** `ab(['x','x','x'], {stats:'product'})`
- Check: `q7Eig`, `q7GhzXXX`, `q7GhzYYX`, `q7YonKets`, `q7Mean`, `q7Var`, `q7X1`. Needs: matrix-v2 (the last view only).

**D6 · `q7-mermin:b2` · result `x_1x_2x_3 = -1\ \text{(forced)}\ \text{against}\ +1\ \text{(XXX)}`** (notes p. 34; HW2 P7(c))
- Ground (3 views):
  1. `y_1y_2x_3 = -1,\quad y_1x_2y_3 = -1,\quad x_1y_2y_3 = -1,\quad x_1x_2x_3 = +1` — The four quantum results, written for a card's answers. **view** `tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,1], y:[1,1,-1]}})` · *one card: it fails YYX*
  2. `(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = (-1)^3 = -1` — Multiply the first three results.
  3. `(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = x_1x_2x_3\,(y_1y_2y_3)^2` — Every y appears exactly twice; the order of numbers does not matter.
  4. `y_i^2 = 1 \Rightarrow x_1x_2x_3 = -1` — A ±1 squared is 1. **view** `tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,-1], y:[1,1,-1]}})` · *a card built to pass the three: it fails XXX*
  5. `x_1x_2x_3 = -1\ \text{(forced)}\ \text{against}\ +1\ \text{(XXX)}` — The fourth result says +1: no card passes all four. **view** `tab(['YYX','YXY','XYY','XXX'])` · *the quantum values: −1, −1, −1, +1*
- Formal (2 views):
  1. `(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = x_1x_2x_3(y_1y_2y_3)^2 = x_1x_2x_3` — For commuting numbers (notes p. 34). **view** `tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,1], y:[1,1,-1]}})`
  2. `x_1x_2x_3 = -1\ \text{(forced)}\ \text{against}\ +1\ \text{(XXX)}` — One run per setting suffices, since each prediction has zero dispersion. **view** `tab(['YYX','YXY','XYY','XXX'], {values:{x:[1,1,-1], y:[1,1,-1]}})`
- Check: `q7MerminCard`, `q7MerminCard3`, `q7Forced`, `q7Mermin`. Needs: matrix-v2.

**D7 · `q7-mermin:b4` · result `(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3`** (notes Eq. 2.13, p. 34)
- Ground (3 views):
  1. `X\cdot Y = -Y\cdot X` — On one qubit X and Y anticommute (Chapter Q3). **view** `tab(['YYX','YXY','XYY'])` · *qubit 2's column reads Y, X, Y*
  2. `\text{qubit 1: } Y\cdot Y\cdot X = X,\quad \text{qubit 3: } X\cdot Y\cdot Y = X` — Equal factors side by side multiply to I.
  3. `\text{qubit 2: } Y\cdot X\cdot Y = -X\cdot Y\cdot Y = -X` — Move X past one Y: one minus sign. **view** `mx(prod(pa('Y'), pa('X'), pa('Y')))` · *$Y\cdot X\cdot Y = -X$*
  4. `(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3` — Collect the three qubits. **view** `tab(['YYX','YXY','XYY'], {product:true})` · *column products X, −X, X: −XXX*
- Formal (2 views):
  1. `\sigma_y\sigma_x\sigma_y = -\sigma_x,\quad \sigma_x\sigma_y\sigma_x = -\sigma_y` — Anticommutation. **view** `mx(prod(pa('Y'), pa('X'), pa('Y')))`
  2. `(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3` — On GHZ both sides give −1; numbers, with $yxy = x$, lose the sign (notes Eq. 2.13). **view** `tab(['YYX','YXY','XYY'], {product:true})`
- Check: `q7YXY`, `q7XYX`, `q7YYXq1`, `q7Prod3`, `q7Prod`. Needs: matrix-v2.

**Count.** 7 derivations; Ground has 3–4 distinct views each and Formal 2 each. D2 and D3 build on the existing kinds
alone; D1 and D5 keep two distinct views without the v2 fields.

## 3. Try-it widget per unit

No widget runs three qubits (Q6 §9.3 W2 would not either; §9.3 W3 below, deferred). The one-qubit pictures:

| Unit | Widget spec | Why this one |
|---|---|---|
| `q7-ghz` | `{kind:'deposit-stats', props:{state:'+x', axis:'z', seed:709}}` | Each qubit of GHZ alone reads like a fair coin; the three together never disagree. |
| `q7-brackets` | `{kind:'bloch', props:{theta:90, phi:90, editable:false, measure:'y'}}` | $\|{+y}\rangle$ on the equator: a y reading is sure, a z reading is not. |
| `q7-parity-table` | `{kind:'phase-dial', props:{theta:270, rotations:true}}` | $-i$ is a quarter turn back; each extra y turns s by another quarter. |
| `q7-bit-strings` | `{kind:'deposit-stats', props:{state:'+z', axis:'x', seed:709}}` | One qubit's x readings are random, whatever the product does. |
| `q7-observables` | `{kind:'bloch', props:{theta:90, phi:0, editable:true, measure:'x'}}` | A state on the x axis gives a sure X reading (spread 0); move it to the pole and the spread grows to 1. |
| `q7-mermin` | `{kind:'bloch', props:{theta:90, phi:45, editable:true, measure:'y'}}` | No point gives sure answers to both X and Y: the hidden card would need both. |

**Try this:**
- `q7-ghz`: (1) Fire 20: about half each way. · `q7-brackets`: (1) Measure y: always +. (2) Switch to z: 50/50.
- `q7-parity-table`: (1) Turn once, twice, three times: −i, −1, i. · `q7-bit-strings`: (1) Fire 50: close to half each way.
- `q7-observables`: (1) At θ = 90°, φ = 0 the x reading never varies. (2) Drag to θ = 0: half and half.
- `q7-mermin`: (1) Find a point where both x and y readings are sure. (There is none.)

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. HW2 items (submitted; ruling 12) have full
walkthroughs and are marked (HW2). The Bergou ⚑ P10.1(a) aside has no challenge.

### `q7-ghz`
1. **warm-up · numeric · `q7-g-p000`** — "Read GHZ in the 0/1 basis. What is the chance of 000?"
   - Answer: **0.5** = `q7GhzP[0]`. Hints: (1) Two terms. (2) Amplitude $1/\sqrt2$. (3) Square it. Walkthrough: ½.
2. **core · numeric · `q7-g-mean` (HW2 P5(b))** — "What is the mean number of qubits that read 0 in GHZ?"
   - Answer: **1.5** = `q7Zeros[0]`. Hints: (1) Which counts occur? (2) 0 or 3, each ½. (3) Average them.
   - Walkthrough: GHZ reads 000 (three zeros) or 111 (none), each with ½, so $\langle n\rangle = \tfrac12\cdot3 = \tfrac32$.
3. **core · numeric · `q7-g-var` (HW2 P5(b))** — "What is the variance of that number?"
   - Answer: **2.25** = `q7Zeros[1]`. Hints: (1) $\langle n^2\rangle - \langle n\rangle^2$. (2) $\langle n^2\rangle = \tfrac12\cdot9$. (3) Subtract $\tfrac94$.
   - Walkthrough: $\tfrac92 - \tfrac94 = \tfrac94$.
4. **stretch · numeric · `q7-g-var-plus` (HW2 P5(c))** — "For three independent qubits in $|+\rangle$, what is the variance of the number of zeros?"
   - Answer: **0.75** = `q7ZerosPlus[1]`. Hints: (1) Three independent fair coins. (2) Each adds $\tfrac14$. (3) Three of them.
   - Walkthrough: $P(n) = \tfrac18, \tfrac38, \tfrac38, \tfrac18$, mean $\tfrac32$ and variance $3\cdot\tfrac14 = \tfrac34$. GHZ has the same mean and three times the variance: its zeros come all together.

### `q7-brackets`
1. **warm-up · numeric · `q7-b-zero`** — "What is $\langle{-y}|0\rangle$?"
   - Answer: **0.7071** = `q7Bra[1][1][0]`. Hints: (1) Every basis state has $1/\sqrt2$ on $|0\rangle$. (2) It is real. (3) The bra keeps it. Walkthrough: 0.707.
2. **core · choice · `q7-b-zeta`** — "What is $\zeta$ for a y-basis reading of +1?"
   - Options: **$-i$** ✓ · $i$ · 1 · −1. Check: `q7Zeta[1][0]`. Hints: (1) $\zeta = -i\varepsilon$ in y. (2) $\varepsilon = +1$. (3) $-i$. Walkthrough: $-i$, from $\langle{+y}|1\rangle = -i/\sqrt2$.
3. **core · numeric · `q7-b-one`** — "What is the imaginary part of $\langle{+y}|1\rangle$?"
   - Answer: **−0.7071** = `q7Bra[1][0][1]` (imaginary part). Hints: (1) $|{+y}\rangle$ has $i/\sqrt2$ on $|1\rangle$. (2) A bra conjugates. (3) $-i/\sqrt2$. Walkthrough: −0.707.
4. **stretch · choice · `q7-b-real`** — "For which readings is $\zeta_k$ a real number?"
   - Options: **x-basis readings** ✓ · y-basis readings · readings of +1 only · all readings. Check: `q7Zeta`. Hints: (1) Look at the two cases of Eq. 2.9. (2) The y case carries $-i$. (3) The x case is $\pm1$. Walkthrough: x-basis readings.

### `q7-parity-table`
1. **warm-up · numeric · `q7-t-s`** — "In a YYX run with $\Pi = -1$, what is s?"
   - Answer: **1** = `q7S[3]`. Hints: (1) $n_y = 2$. (2) $(-i)^2 = -1$. (3) $(-1)(-1)$. Walkthrough: s = 1, so that outcome has $\tfrac14$.
2. **core · numeric · `q7-t-p`** — "If s = i, what is the chance $|1 + s|^2/16$?"
   - Answer: **0.125** = `q7P1s[2]`. Hints: (1) $|1 + i|^2 = 2$. (2) Divide by 16. (3) ⅛. Walkthrough: 0.125.
3. **core · numeric · `q7-t-hw-xxx` (HW2 P7(d))** — "Evaluate $\langle{+x},{+x},{+x}|\mathrm{GHZ}\rangle$."
   - Answer: **0.5** = `q7RunXXX[0]`. Hints: (1) Two terms. (2) $\langle{+x}|0\rangle^3 = \langle{+x}|1\rangle^3 = 1/(2\sqrt2)$. (3) Add and multiply by $1/\sqrt2$.
   - Walkthrough: $\tfrac1{\sqrt2}\big(\tfrac1{2\sqrt2} + \tfrac1{2\sqrt2}\big) = \tfrac12$, chance ¼. With the last reading −1 the second term flips sign and the bracket is 0. Both agree with $(1 + s)/4$, s = Π = ±1: an XXX run gives the four even patterns, ¼ each.
4. **stretch · numeric · `q7-t-hw-yyx` (HW2 P7(d))** — "In a YYX run, what is the chance of the readings +1, +1, −1?"
   - Answer: **0.25** = `q7Table_yyx[1]`. Hints: (1) $n_y = 2$. (2) $\Pi = -1$. (3) $s = (-i)^2\Pi$.
   - Walkthrough: $s = (-1)(-1) = 1$, so $P = \tfrac14$. The surviving YYX patterns are exactly those with $\Pi = -1$, as $\langle YYX\rangle = -1$ requires.

### `q7-bit-strings`
1. **warm-up · choice · `q7-s-even`** — "Which string can an XXX run produce?"
   - Options: **011** ✓ · 001 · 111 · 010. Check: `q7Table_xxx[3]`. Hints: (1) Count the 1s. (2) XXX keeps even strings. (3) Two 1s. Walkthrough: 011.
2. **core · numeric · `q7-s-yxy`** — "In a YXY run, what is the chance of the string 000?"
   - Answer: **0** = `q7Table_yxy[0]`. Hints: (1) Two y's. (2) Odd strings survive. (3) 000 is even. Walkthrough: 0.
3. **core · numeric · `q7-s-xxy`** — "In an XXY run, what is the chance of the string 101?"
   - Answer: **0.125** = `q7Table_xxy[5]`. Hints: (1) One y. (2) s is imaginary. (3) All strings equal. Walkthrough: ⅛.
4. **stretch · numeric · `q7-s-single`** — "In an XXX run, what is the chance that qubit 1 alone reads +1?"
   - Answer: **0.5** = `q7SingleX[0]`. Hints: (1) Add the even strings that start with 0. (2) 000 and 011. (3) ¼ + ¼. Walkthrough: ½: the single reading is random, the product is not.

### `q7-observables`
1. **warm-up · numeric · `q7-o-eig` (HW2 P7(a))** — "What is the eigenvalue of $\sigma_{x1}\sigma_{x2}\sigma_{x3}$ on GHZ?"
   - Answer: **1** = `q7Eig[0]`. Hints: (1) X flips a bit. (2) 000 and 111 trade places. (3) The sum is unchanged. Walkthrough: +1.
2. **core · numeric · `q7-o-yyx` (HW2 P7(a))** — "What is the eigenvalue of $\sigma_{y1}\sigma_{y2}\sigma_{x3}$ on GHZ?"
   - Answer: **−1** = `q7Eig[1]`. Hints: (1) $\sigma_y|0\rangle = i|1\rangle$, $\sigma_y|1\rangle = -i|0\rangle$. (2) Apply to $|000\rangle$ and $|111\rangle$. (3) $i^2$ and $(-i)^2$.
   - Walkthrough: $YYX|000\rangle = i\cdot i\,|111\rangle = -|111\rangle$ and $YYX|111\rangle = (-i)(-i)|000\rangle = -|000\rangle$, so $YYX|\mathrm{GHZ}\rangle = -|\mathrm{GHZ}\rangle$.
3. **core · choice · `q7-o-sym` (HW2 P7(b))** — "Which symmetry of GHZ gives YXY and XYY the eigenvalue of YYX?"
   - Options: **GHZ is unchanged by any renumbering of its qubits** ✓ · GHZ is unchanged by flipping all three bits · GHZ has real amplitudes · XXX commutes with YYX. Check: `q7GhzSwap`, `q7Eig`. Hints: (1) Compare YXY with YYX. (2) Swap qubits 2 and 3. (3) What does that swap do to GHZ?
   - Walkthrough: renumbering the qubits maps YYX to YXY or XYY and leaves GHZ unchanged, so all three share the eigenvalue −1.
4. **stretch · numeric · `q7-o-var`** — "What is $\langle(\Delta\sigma_{x1})^2\rangle$ in GHZ?"
   - Answer: **1** = `q7X1[1]`. Hints: (1) $\langle\sigma_{x1}\rangle = 0$. (2) $\sigma_{x1}^2 = I$. (3) $1 - 0$. Walkthrough: 1, the largest a ±1 observable can have.

### `q7-mermin`
1. **warm-up · numeric · `q7-m-cards`** — "How many instruction cards ($x_1, x_2, x_3, y_1, y_2, y_3$, each ±1) are there?"
   - Answer: **64** = `q7Mermin.total`. Hints: (1) Six answers. (2) Two choices each. (3) $2^6$. Walkthrough: 64.
2. **core · numeric · `q7-m-forced` (HW2 P7(c))** — "Multiply the three relations that contain two y's. What value do they force on $x_1x_2x_3$?"
   - Answer: **−1** = `q7Forced`. Hints: (1) Each y appears twice. (2) $y_i^2 = 1$. (3) $(-1)^3$.
   - Walkthrough: $(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = x_1x_2x_3 = (-1)^3 = -1$, against $+1$ for XXX. No hidden values work. It is sharper than a Bell violation because each prediction is certain, so single runs decide, with no averages.
3. **core · numeric · `q7-m-best`** — "At most how many of the four results can one card match?"
   - Answer: **3** = `q7Mermin.best`. Hints: (1) Not all four. (2) A card's four products multiply to +1. (3) The quantum values multiply to −1. Walkthrough: 3; half the cards score 3, half score 1.
4. **stretch · choice · `q7-m-sign`** — "In the operator product (YYX)(YXY)(XYY), which qubit supplies the minus sign?"
   - Options: **qubit 2** ✓ · qubit 1 · qubit 3 · none of them. Check: `q7YXY`. Hints: (1) Read each qubit's three factors in order. (2) Qubit 2 gets Y, X, Y. (3) $Y\cdot X\cdot Y = -X$. Walkthrough: qubit 2.

## 5. Glossary terms new in Q7

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-ghz` | GHZ state | notation | The three-qubit state $(\|000\rangle + \|111\rangle)/\sqrt2$: all 0 or all 1, in superposition. | $\|\mathrm{GHZ}_N\rangle = (\|0\cdots0\rangle + \|1\cdots1\rangle)/\sqrt2$. | `q7-ghz:b1` | — |
| `qc-ghz-run` | run | notation | One trial: a basis, x or y, for each qubit and the ±1 each reading gave. | $(b_k, \varepsilon_k)_{k=1}^3$, $b_k \in \{x, y\}$; qubit k projected onto $\|\varepsilon_kb_k\rangle$. | `q7-brackets:b2` | — |
| `qc-zeta` | $\zeta_k$ | notation | The factor of size 1 by which a reading's bracket with $\|1\rangle$ differs from $1/\sqrt2$. | $\langle\varepsilon_kb_k\|1\rangle = \zeta_k/\sqrt2$; $\zeta_k = \varepsilon_k$ (x), $-i\varepsilon_k$ (y) (Eq. 2.9). | `q7-brackets:b3` | — |
| `qc-ny-pi` | $n_y$ and $\Pi$ | notation | $n_y$ counts the qubits read in y; $\Pi$ multiplies the three readings. | $s = (-i)^{n_y}\Pi$, $\Pi = \varepsilon_1\varepsilon_2\varepsilon_3$ (Eq. 2.10). | `q7-parity-table:b2` | — |
| `qc-mermin-observables` | Mermin observables | notation | The four products XXX, YYX, YXY and XYY of one Pauli reading per qubit. | $\hat O_{XXX} = \sigma_{x1}\sigma_{x2}\sigma_{x3}$, … (Eq. 2.11); $\hat O^2 = I$, commuting. | `q7-observables:b1` | — |
| `qc-local-realism` | local realism | — | The idea that each part carries its own answers in advance, whatever is done to the others. | Predetermined local values for every measurement on each part. | `q7-mermin:b1` | `qc-l1-logic` |
| `qc-hidden-values` | predetermined values | notation | The answers a qubit would carry in advance for both an X and a Y reading. | $x_i, y_i = \pm1$, with $\varepsilon_k = x_k$ or $y_k$ as the basis decides. | `q7-mermin:b1` | — |
| `qc-mermin-argument` | Mermin's argument | — | One run of each of four settings shows that no predetermined answers can explain GHZ. | $x_1x_2x_3 = -1$ forced, $+1$ measured (notes p. 34). | `q7-mermin:b2` | — |

(`\|` is a Markdown escape inside the table.) Reused: `qc-pauli-string`, `qc-parity`, `qc-stabilizer` (Q6);
`qc-compatible`, `qc-dispersion`, `qc-eigenvalue` (Q3); `qc-hidden-label` (Q1). `qc-l1-logic` is a new bridge entry
(§11.1).

**Notation beats (one each, both tracks, with a view):**

| Gloss id | Beat | View |
|---|---|---|
| `qc-ghz` | `q7-ghz:b1` | `circ(C_GHZ, 3)` over `amp({circuit:C_GHZ, upTo:3})` |
| `qc-ghz-run` | `q7-brackets:b2` | `ab(['x','y','x'])` (needs: matrix-v2; v1 fallback `C_RUN('xyx')`) |
| `qc-zeta` | `q7-brackets:b3` | `cp({spokes:{phasesDeg:V.q7ZetaDeg}})` |
| `qc-ny-pi` | `q7-parity-table:b2` | `cp({powers:{of:{re:0, im:-1}, upTo:3}})` |
| `qc-mermin-observables` | `q7-observables:b1` | `mx(pa3('XXX'), {values:'none'})` |
| `qc-hidden-values` | `q7-mermin:b1` | `tab([...], {values:{x:[1,1,1], y:[1,1,-1]}})` (needs: matrix-v2) |

## 6. Review card per unit (both tracks)

### `q7-ghz`
- **G points:** (1) GHZ is $(|000\rangle + |111\rangle)/\sqrt2$. (2) In the 0/1 basis: 000 or 111, half each. (3) One reading fixes the other two. (4) Its count of zeros has variance 2.25, against 0.75 for three coins.
- **F points:** (1) $\mathrm{GHZ}_N$; Bergou's GHZ and W classes. (2) $P(000) = P(111) = \tfrac12$. (3) HW2 P5(b)–(c).
- **Equations:** $|\mathrm{GHZ}\rangle = \tfrac1{\sqrt2}(|000\rangle + |111\rangle)$
- **Trap:** reading "all three agree" as "three copies of one coin": the variance shows the readings move together.

### `q7-brackets`
- **G points:** (1) A run picks x or y for each qubit and records ±1. (2) Every bracket with $|0\rangle$ is $1/\sqrt2$. (3) A bracket with $|1\rangle$ is $\zeta/\sqrt2$, with $\zeta = \varepsilon$ or $-i\varepsilon$.
- **F points:** (1) $|\varepsilon x\rangle$, $|\varepsilon y\rangle$. (2) Eq. 2.9. (3) $\zeta_k$ is a number, not a Pauli matrix.
- **Equations:** $\langle\varepsilon_kb_k|1\rangle = \zeta_k/\sqrt2$
- **Trap:** forgetting that a bra conjugates: $\langle{+y}|1\rangle = -i/\sqrt2$, not $+i/\sqrt2$.

### `q7-parity-table`
- **G points:** (1) Every GHZ bracket is $(1 + s)/4$. (2) $s = (-i)^{n_y}\Pi$: bases and outcomes separate. (3) Chances ¼, 0 or ⅛.
- **F points:** (1) Eq. 2.10. (2) The p. 31 table. (3) HW2 P7(d).
- **Equations:** $\langle\{\varepsilon_kb_k\}|\mathrm{GHZ}\rangle = \tfrac{1 + s}4,\quad s = (-i)^{n_y}\Pi$
- **Trap:** taking the chance to be $|1 + s|/4$ instead of $|1 + s|^2/16$.

### `q7-bit-strings`
- **G points:** (1) +1 is bit 0, −1 is bit 1. (2) XXX keeps the even strings; two y's keep the odd ones. (3) Odd $n_y$ keeps all eight. (4) The product of the readings is itself a reading.
- **F points:** (1) The sign of the correlation is the parity of the survivors. (2) $\Pi$ is a measured value of $\sigma_{x1}\sigma_{x2}\sigma_{x3}$.
- **Equations:** $P_{XXX}(\text{even}) = \tfrac14,\quad P_{YYX}(\text{odd}) = \tfrac14$
- **Trap:** thinking random single readings mean a random product.

### `q7-observables`
- **G points:** (1) XXX, YYX, YXY, XYY are observables with values ±1. (2) They all commute. (3) GHZ gives +1, −1, −1, −1, every run. (4) One qubit's X reading is as random as can be.
- **F points:** (1) Eqs. 2.11–2.12. (2) Zero dispersion. (3) HW2 P7(a)–(b): the permutation symmetry.
- **Equations:** $\hat O_{XXX}|\mathrm{GHZ}\rangle = +|\mathrm{GHZ}\rangle,\quad \hat O_{YYX}|\mathrm{GHZ}\rangle = -|\mathrm{GHZ}\rangle$
- **Trap:** reading $-|\mathrm{GHZ}\rangle$ as a new state: the −1 is the eigenvalue.

### `q7-mermin`
- **G points:** (1) Cards with answers $x_i$, $y_i$ fixed in advance. (2) The three y results force $x_1x_2x_3 = -1$; XXX gives +1. (3) The best card matches three of four. (4) Operators escape because $Y\cdot X\cdot Y = -X$.
- **F points:** (1) Local realism refuted by single runs. (2) Eq. 2.13. (3) GHZ's stabilizers XXX, ZZI, IZZ (Bergou ⚑ P10.1(a)).
- **Equations:** $(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3$
- **Trap:** treating operators as numbers, which drops the minus sign the anticommutation supplies.

## 7. Symbol-before-use tables

Abbreviations: gh, br, pt, bs, ob, me (the six units in order). Carried and recapped at `q7-ghz:b1`: $|0\rangle$,
$|1\rangle$, $|{\pm x}\rangle$, $|{\pm y}\rangle$ (Q2–Q3), X, Y, Z, H, S, CNOT, Pauli strings, parity and stabilizers
(Q6), $\langle A\rangle$ and $\langle(\Delta A)^2\rangle$ (Q3), i and complex conjugation (F1, Q1), eigenvalues.

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| GHZ, N | gh:b1 | gh:b1 | OK | — |
| n (count of zeros), variance | gh:b3 | gh:b3 | **FLAG** | F2 is not built; defined in place and tied to Q3's $\langle(\Delta A)^2\rangle$ (§12 Q2). |
| $b_k$, $\varepsilon_k$, $\|\varepsilon_kb_k\rangle$ | br:b2 | br:b2 | OK | — |
| XYX, XXX, YYX (run names) | br:b2 | br:b2 | OK | Capitals, left to right. |
| $\zeta_k$ | br:b3 | br:b3 | OK | — |
| s | pt:b1 | pt:b1 | OK | — |
| $n_y$, $\Pi$ | pt:b2 | pt:b2 | OK | — |
| $X_1X_2X_3$ | bs:b4 | Q6 te:b3 | OK | — |
| $-\mathrm{GHZ}$ | ob:b3 | ob:b3 | **FLAG** | The caption says the −1 is the eigenvalue, the state unchanged. |
| $x_i$, $y_i$ | me:b1 | me:b1 | **FLAG** | Answers on a card, never coordinates (conventions). |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\mathrm{GHZ}_N$ | gh:b1 | gh:b1 | OK | — |
| $\langle n\rangle$, $\mathrm{Var}\,n$, $\delta_{n0}$ | gh:b3, D1 | gh:b3; Q2 (δ) | OK | — |
| $(b_k, \varepsilon_k)_{k=1}^3$ | br:b2 | br:b2 | OK | — |
| $\zeta_k$, s, $n_y$, $\Pi$ | br:b3, pt:b1–b2 | in place | OK | — |
| $\hat O_{XXX}$, … | ob:b1 | ob:b1 | OK | — |
| $\sigma_{x1}$ | ob:b1 | Q6 te:b1 | OK | Rosetta there. |
| $x_i$, $y_i$, local realism | me:b1 | me:b1 | OK | — |
| ZZI, IZZ | me:b5 | Q6 te:b3 | OK | I is the identity on that qubit. |

**Counts:** Ground 3 FLAGs, Formal 0, all resolved in place.

## 8. Errata

None in the mathematics of notes L6 pp. 29–32 and L7 pp. 33–34, or of HW2 P5(b)–(c) and P7(a)–(d). Checked:
P(000) = P(111) = ½; the eight brackets and Eq. 2.9; $(1 + s)/4$ for all 64 runs; Eq. 2.10 and every row of the p. 31
table; the surviving strings; Eqs. 2.11–2.13; the zero dispersions; the Mermin product.

**Silent notes (no box).**
| Where | Point | Action |
|---|---|---|
| HW2 P5(c) | "Compare the result from c)" refers to itself; part (b) is meant | the challenge `q7-g-var-plus` compares with (b) |
| notes p. 29 | "These bases are defined by the Hadamard gate and phase gates" | taught as "H and the phase gates turn either basis into $\|0\rangle, \|1\rangle$" (H, and H·S† for y) |
| notes p. 33 | $x_i$, $y_i$ (hidden values) beside $\varepsilon_k$ (the reading); the notes flag the difference themselves | conventions line; `q7-mermin:b1` F |
| notes p. 30 | $\zeta_k$ is "unrelated to the Pauli matrices" | kept in `q7-brackets:b3` F |
| notes p. 34 | the paragraph on the density matrix opens Q8's unit | not used here |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
**No new functions beyond E1.** Q7 uses, from E1: `localBasisProbs`, `runBracket`, `weightStats`,
`merminInstructionSets`, `pauliMul`, `paulisCommute`, `pauliEigenvalue`. Existing and sufficient: `qc/state` (`ghz`,
`bell`), `qc/measure` (`postMeasure`, `probs`, `marginal`, `expectationN`, `varianceN`), `qc/gates` (`pauliString`, `Y`,
`Sdg`, `H`), `qc/circuit` (`runCircuit`), `complex.ts`.

**Notes for the E1 build (each is a test to pin).**
- `localBasisProbs(ψ, bases)`: index i is the bit string with bit 0 ↔ ε = +1 (notes p. 31), q0 leftmost. Pin
  `localBasisProbs(ghz(3), ['x','x','x'])` = (¼, 0, 0, ¼, 0, ¼, ¼, 0) and `['y','y','x']` = (0, ¼, ¼, 0, ¼, 0, 0, ¼).
- `runBracket(ψ, bases, eps)` returns the complex bracket with $|{\pm y}\rangle = (|0\rangle \pm i|1\rangle)/\sqrt2$, so that
  $\langle{+y}|1\rangle = -i/\sqrt2$ (Eq. 2.9). Pin $\langle{+x},{+x},{+y}|\mathrm{GHZ}\rangle = 0.25 - 0.25i$.
- `weightStats(ψ, bit)` counts the qubits reading `bit`; Q7 calls it with 0 (HW2 P5 counts zeros).
- `merminInstructionSets()` returns every card with its four products and its score, so the histogram (0, 32, 0, 32, 0)
  and the two example cards (x = (1,1,1), y = (1,1,−1); x = y = (1,1,−1)) are engine output.
- `pauliMul('YYX', 'YXY')` = (+1, IZZ), and with XYY the product is (−1, XXX).

The claim ledger is §1.7.

### 9.2 Stage contract
No `two-qubit` beat. **`amplitudes` §6.2 fields (needs: matrix-v2):**
| Field | Meaning | Validation |
|---|---|---|
| `bases: ('x'\|'y'\|'z')[]` | bars = `localBasisProbs(ψ, bases)`, labelled by bit strings, legend "0 = +1" | one entry per qubit |
| `parity: true` | even and odd strings in two colours, legend "even: Π = +1" | needs `bases` |
| `stats: 'zeros'` | readout: mean and variance of the number of qubits reading 0 (`weightStats(ψ, 0)`) | — |
| `stats: 'product'` | readout: mean and spread of the product of the readings, ⟨P⟩ and Var P for the string named by `bases` | needs `bases` |

**`matrix` v2 tableau (needs: matrix-v2):** `{tableau: string[], product?: true, values?: {x: (±1)[], y: (±1)[]}, state?: AmpSource}`.
Rows are Pauli strings with coloured letters. `product:true` adds each qubit's column product and the overall phase from
`pauliMul`. `values` adds each row's product of a card's answers ($x_i$ for X, $y_i$ for Y). **`state` is proposed here**
(additive, §12 Q4): a column with each row's eigenvalue on that state from `pauliEigenvalue` (±1, or "—" when the state is
no eigenstate), and with `values` a match or miss mark per row. In Q7 `tab(rows, f)` always passes `state: G3`.

**Built kinds, checks for the builder:** (a) `pa3` (side 8) with `values:'none'`; (b) `cp` with `w` taken from
`V.q7S[k]` as `{re, im}` and `spokes.phasesDeg` from `V.q7ZetaDeg`; (c) `amp({dir:'-x'}, {dials:true})`; (d) `C_GHZM(q)`
with `outcomes` in a split; (e) `mode:'signed'` on −GHZ (real amplitudes).

**needs: matrix-v2:** `q7-ghz:b3`; `q7-brackets:b2`; `q7-parity-table:b4`, `b6` (reveal); `q7-bit-strings:b1`–`b4`, `b5`
(reveal); `q7-observables:b2`, `b5`, `b6` (reveal); `q7-mermin:b1`–`b6`; derivations D1, D4, D5 (last view), D6, D7.
**v1 only (buildable now):** `q7-ghz:b1`, `b2`, `b4`; `q7-brackets:b1`, `b3`, `b4`; `q7-parity-table:b1`–`b3`, `b5`;
`q7-observables:b1`, `b3`, `b4`; derivations D2, D3.

**Fallbacks if the §6.2 batch slips:** `ab(b, …)` → `amp({circuit:C_RUN(b)}, {mode:'probability'})` (identical bars,
verified; no parity colouring; `stats` numbers move to the caption); `tab(rows)` → `mx(pa3(row))` for the row in focus,
with the values in the caption.

### 9.3 Widget gaps
W3 `mermin-cards` (deferred under the cap): the learner fills a card of six ±1 answers and sees which of the four
results it matches (engine `merminInstructionSets`). It doubles as an Arcade level later. The §3 fallbacks carry the units.

## 10. Media
- **Opener:** none here; the Part III opener is planned with Q8.
- **Film (deferred) `qc-q7-mermin`** "Four settings, one contradiction": the four runs' surviving strings, the certain
  products, then a card that matches three and fails one. Manifest: `q7Table_xxx`, `q7Table_yyx`, `q7Eig`, `q7Mermin`,
  `q7MerminCard3`.
- **Decor (Higgsfield, credits need the user):** three small glowing spheres in a triangle on a dark bench; no text, no
  numbers, no diagrams.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-ghz` | GHZ: all or nothing | Q7 · `q7-ghz` | `qc-bell-basis` | — |
| `qc-ghz-brackets` | Brackets in the x and y bases | Q7 · `q7-brackets` | `qc-ghz`, `qc-x-states`, `qc-complex-multiply` | — |
| `qc-ghz-table` | One formula for every run | Q7 · `q7-parity-table` | `qc-ghz-brackets` | — |
| `qc-ghz-parity` | Surviving strings carry the parity | Q7 · `q7-bit-strings` | `qc-ghz-table`, `qc-parities` | — |
| `qc-mermin-observables` | Four certain products | Q7 · `q7-observables` | `qc-ghz-parity`, `qc-uncertainty` | — |
| `qc-mermin` | Mermin: no instruction set | Q7 · `q7-mermin` | `qc-mermin-observables` | — |

Bridge ids: `qc-l3-spread`, `qc-l7-order` exist. **`qc-l1-logic` is new** (448 `L1` · `l1-logic`); the Q7 build adds it
to `content/qc709/bridges.ts` with a label checked against that unit (§12 Q6). Q6 stations (`qc-bell-basis`,
`qc-parities`) are built in parallel; the edges are added when both merge.

**Future bridges (TODO; targets not built):** Q8 the GHZ box (notes p. 34), Q9 Tr₃ of GHZ (HW2 P7(e)), Q10 CHSH, the
statistical version (`q7-mermin:b6`), Q12 (GHZ link-back), Part IX stabilizer codes (`q7-mermin:b5`).

### 11.2 Arcade (6 levels)
Label constant: `const Q7x = (unit, label) => ({ lecture: 'Q7', unit, label })`. All six are Spot the error.
1. **`q7-ghz` · `qc-ghz-coins`** — "Same mean, same spread?"
   - Steps: "GHZ reads 000 or 111, each half the time." · "So its number of zeros averages $\tfrac32$." · "Three independent $|+\rangle$ qubits also average $\tfrac32$ zeros." · "So the two counts have the same variance too."
   - `wrong: 3`. Why: $\tfrac94$ against $\tfrac34$ (`q7Zeros`, `q7ZerosPlus`).
2. **`q7-brackets` · `qc-bra-conj`** — "Bra or ket?"
   - Steps: "$|{+y}\rangle = (|0\rangle + i|1\rangle)/\sqrt2$." · "Its bracket with $|0\rangle$ is $1/\sqrt2$." · "Its bracket with $|1\rangle$ is $\langle{+y}|1\rangle = i/\sqrt2$." · "So $\zeta = i$ for a y reading of +1."
   - `wrong: 2`. Why: a bra conjugates, so $\langle{+y}|1\rangle = -i/\sqrt2$ and $\zeta = -i$ (`q7Bra`).
3. **`q7-parity-table` · `qc-odd-y`** — "One y"
   - Steps: "A run's bracket is $(1 + s)/4$." · "$s = (-i)^{n_y}\Pi$." · "With one y, $s = \pm i$." · "So half of the outcomes are forbidden."
   - `wrong: 3`. Why: $|1 \pm i|^2/16 = \tfrac18$ for every outcome (`q7Table_xxy`).
4. **`q7-bit-strings` · `qc-parity-flip`** — "Which strings survive?"
   - Steps: "Record +1 as 0 and −1 as 1." · "In XXX only the even strings occur." · "YYX has two y's, so $s = -\Pi$." · "So YYX also keeps the even strings."
   - `wrong: 3`. Why: $s = -\Pi$ keeps the odd strings (`q7Table_yyx`).
5. **`q7-observables` · `qc-random-product`** — "Random factors, random product?"
   - Steps: "Each qubit's X reading on GHZ is +1 or −1, half the time each." · "XXX's value is the product of the three readings." · "A product of three random signs is random." · "So XXX gives +1 only half the time."
   - `wrong: 2`. Why: the readings are correlated; GHZ is an eigenstate of XXX, with spread 0 (`q7Var`).
6. **`q7-mermin` · `qc-hidden-escape`** — "Numbers or operators?"
   - Steps: "Suppose cards with $y_1y_2x_3 = y_1x_2y_3 = x_1y_2y_3 = -1$." · "Then their product is $x_1x_2x_3(y_1y_2y_3)^2 = -1$." · "Since $y_i^2 = 1$, $x_1x_2x_3 = -1$." · "The operators obey the same rule, so quantum mechanics predicts $XXX = -1$ as well."
   - `wrong: 3`. Why: as operators qubit 2 gives $Y\cdot X\cdot Y = -X$, so the product is $-XXX$ and quantum mechanics predicts +1 (`q7Prod3`).

## 12. Questions for the judge

**Q1. Six units.** The re-map's six units follow the notes' subsections; `q7-brackets` and `q7-parity-table` could merge.
*Recommend:* keep six. Each carries one notation beat, and each has 4–6 beats.

**Q2. HW2 P5's variance without F2.** Counting zeros needs the variance of a count, which F2 would own; F2's fate is the
user's (ruling 3). *Recommend:* define $\mathrm{Var}\,n = \langle n^2\rangle - \langle n\rangle^2$ in place at
`q7-ghz:b3`, tied to Q3's $\langle(\Delta A)^2\rangle$; F2, if built, links back here.

**Q3. The Bergou ⚑ P10.1(a) aside gives part (a)'s answer.** `q7-mermin:b5` names XXX, ZZI, IZZ as GHZ's stabilizer
generators. *Recommend:* keep it as a [B] aside with no challenge (ruling 13), parts (b)–(c) unused; re-check when HW3 is
ingested.

**Q4. `tableau` needs a state.** The re-map's tableau field has no state, so it cannot show eigenvalues or mark a card's
matches. *Recommend:* the additive `state?: AmpSource` of §9.2, with the eigenvalue column from `pauliEigenvalue`; Q6's
`q6-parities:b4` may use it too.

**Q5. Build order.** 18 of Q7's 31 beats and 5 of its 7 derivations need the §6.2 batch; none needs `two-qubit`.
*Recommend:* build Q7 after the §6.2 batch, in parallel with Q6. If the batch slips, the `C_RUN` and `pa3` fallbacks
of §9.2 give the same numbers.

**Q6. The new bridge `qc-l1-logic`.** Local realism links to 448's `l1-logic` (hidden labels and their truth table),
which has no 709 bridge entry yet. *Recommend:* the Q7 build adds it, with a label it checks against the 448 unit.

**Q7. Showing −GHZ.** `q7-observables:b3` draws $\hat O_{YYX}|\mathrm{GHZ}\rangle$ in `signed` mode, bars below the axis.
As a state, −GHZ is GHZ. *Recommend:* keep the picture with the caption guard in both tracks ("the −1 is the
eigenvalue, not a new state"), and add the trap to the review card (done).

**Q8. Phase tag for the HW2 beats.** As Q6 §12 Q9: `q7-ghz:b3`, `q7-parity-table:b5`, `q7-observables:b4`. *Recommend:*
`phase:'books'` with refs "HW2 P5(b)" etc., unless the judge prefers `'lecture'` for course sheets.
