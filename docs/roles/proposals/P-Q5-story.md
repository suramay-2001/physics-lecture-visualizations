# P-Q5-story — Q5 "Deutsch's trick and interference" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q3-story.md` (two tracks, bridges, the same 13 sections).
Map entry: `P-709-map.md` §3 Q5 and erratum (d)-B1; rulings: `decisions/qc709-Q2Q3.md`, `qc709-nc.md`,
`homework-status.md`. It follows `P-Q4-story.md` and inherits all of its conventions. No instructor notes cover Q5 yet.

**Sources read.**
- Bergou 2e (printed = PDF − 15): §1.4–1.7, pp. 5–10 (PDF 20–25), Eqs. 1.10–1.21, Figs. 1.5–1.7 (Fig. 1.7 and p. 10 checked
  on the page renders); Problems 3 and 5, pp. 11–12.
- N&C (printed = PDF − 28): §1.4.1–1.4.3, pp. 29–34, Eqs. 1.37–1.45, Figs. 1.14–1.19. §1.4.4 (Deutsch–Jozsa) and later
  are Q14's.
- Overlaps: Q4 (CNOT, CZ, XOR, H, phase gates, reading in other bases), Q3 (eigenvalues, for the gap), Q2 (the photon unit),
  F1 (phasors and interference, `qc-interference`). 448: `l1-sequential`, `l3-postulates`, `l6-generator`.
- Homework (`homework-status.md`): only 709 HW1 exists, and it is submitted. Bergou ⚑ P1.3 is worked below; P1.5 (the
  SWAP test) is not used.

**Evidence.** Every number was computed twice, by the engine (`q45plan-engine.ts`) and by numpy (`q45plan-numpy.py`), as in
`P-Q4-story.md`: 515 numbers, 202 keys over both chapters, agree to 2 × 10⁻⁶. The numpy twin builds the interferometer
from Bergou's mode rules (Eq. 1.17), the arm swap and Fig. 1.7's output labels, independently of the circuit form. Every
one-qubit circuit here depends on the engine fix E1 (`P-Q4-story.md` §9.1).

**Conventions** (Q4's, plus these).
- Two-qubit oracle circuits carry `wires:['x','y']`: x is the top wire (qubit 0, Bergou's qubit 1, N&C's data register),
  y the target. Interferometer circuits carry `wires:['photon']`; the measurement-based step carries `wires:['1','2']`
  (Bergou's numbering, top = 1).
- The four functions: Ground "always 0", "always 1", "copy" (f(x) = x), "flip" (f(x) = 1 − x); Formal f ≡ 0, f ≡ 1,
  id, x̄; tables `[0,0]`, `[1,1]`, `[0,1]`, `[1,0]`; value keys `zero`, `one`, `id`, `not`.
- One photon in the interferometer is a qubit: |0⟩ = "in arm a" = output 1, |1⟩ = "in arm b" = output 2. Bergou's φ₀,
  φ₁ are phase shifts, not azimuths (§7 FLAG). ℋ is a Hamiltonian (Bergou's H₀, H₁), never the Hadamard H.
- Claim keys `q5…`, as `Q3.values.ts`.
- Circuit shorthand (Q4's, plus): `uf(t)` = `{op:'oracle', mode:'xor', table:t, inputs:[0], target:1, label:'U_f'}`;
  `ph(t)` = `{op:'oracle', mode:'phase', table:t, inputs:[0], label:'O_f'}`; `ccx` = X on wire 2 with `controls:[0,1]`;
  `czg` = Z on wire 1 with `controls:[0]`.

| Name | qubits · init | columns |
|---|---|---|
| `C_Q(t, x)` | 2 · x + `'0'` | `[uf(t)]`; in `q5-problem` the box is labelled `'f'` |
| `C_KICK`, `C_KICK2` | 2 · `'1-'`, `'+-'` | `[uf(id)]` |
| `C_TOF` | 3 · `'110'` | `[ccx]` |
| `C_PAR(t)`, `C_PARM` | 2 · `'00'` | `[g(H,0)] [uf(t)]`; `C_PARM` (t = id) adds `[m(0,0), m(1,1)]` |
| `C_H2` | 2 · `'00'` | `[g(H,0), g(H,1)]` |
| `C_D(t)`, `C_DM(t)` | 2 · `'0-'` | `[g(H,0)] [uf(t)] [g(H,0)]`; `C_DM` adds `[m(0,0)]` |
| `C_DNC(t)` | 2 · `'01'` | `[g(H,0), g(H,1)] [uf(t)] [g(H,0)]` |
| `C_MZ(χ)`, `C_MZF(t)` | 1 · `'0'` | `[g(Ry,0,π/2)] [g(P,0,χ)] [g(Ry,0,−π/2)]`; `C_MZF` has `[ph(t)]` in the middle |
| `C_MZW` | 1 · `'0'` | `[g(Ry,0,π/2)] [m(0,0)] [g(Ry,0,−π/2)]` |
| `C_HOH(t)` | 1 · `'0'` | `[g(H,0)] [ph(t)] [g(H,0)]` |
| `C_MB` | 2 · `'0+'` | `[g(Ry,0,π/3)] [czg] [g(P,0,π/4)] [g(H,0)] [m(0,0)]` |

- **Rosetta lines:** `q5-oracle:b1` cap F (Bergou's |y + f(x)⟩ is mod 2); `q5-deutsch:b1` F (Bergou's qubit 1 is our x);
  `q5-interferometer:b1` cap F (Bergou's |0⟩ in §1.5 is the vacuum, written |vac⟩); `q5-other-models:b1` F (ℋ).

## 0. Chapter map

Q5 answers the map's question: **"Can a machine answer a question about a function by looking at it only once?"**

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q5-problem` | Constant or balanced: Deutsch's question | What does Deutsch's problem ask, and why does a classical computer look twice? | Bergou §1.4 p. 5, ⚑ P1.3(a); N&C §1.4.3 p. 33 | — | Unit 4.4 (XOR) |
| 2 | `q5-oracle` | The f-CNOT and the phase kickback | How does a quantum computer ask about f, and where does the answer land? | Bergou pp. 5–6, Eq. 1.13, ⚑ P1.3(b)–(c); N&C §1.4.1 pp. 29–30, Fig. 1.14; §1.4.2 p. 31 | — | Units 4.2 (Z), 4.4 (CNOT) |
| 3 | `q5-one-value` | Both values in, only one out | If one query computes f(0) and f(1) together, what can a reading return? | Bergou Eq. 1.16 p. 6; N&C §1.4.2 pp. 30–32, Eqs. 1.37–1.40, Figs. 1.17–1.18 | `l3-postulates` | Units 4.3, 4.6 |
| 4 | `q5-deutsch` | Deutsch's circuit: one query, a global answer | How does one use of U_f decide constant or balanced? | Bergou §1.4 pp. 5–6, Eqs. 1.10–1.15, Fig. 1.5; N&C §1.4.3 pp. 32–34, Eqs. 1.41–1.45, Fig. 1.19 | — | Units 5.2, 4.2 (H) |
| 5 | `q5-interferometer` | Two paths, one photon: Deutsch in glass | Why does one photon through two splitters tell equal phases from unequal ones? | Bergou §1.5 pp. 7–8, Eqs. 1.17–1.18, Figs. 1.6–1.7 | `l1-sequential` | Units 5.2, 5.4; F1 (phasors) |
| 6 | `q5-other-models` | Two other ways to compute | Can a computation run on slowly changed energies, or on measurements alone? | Bergou §1.6–1.7 pp. 9–10, Eqs. 1.19–1.21 | `l6-generator` | Units 3.5 (eigenvalues), 4.4 (CZ), 4.6 |

The map orders the units problem, oracle, deutsch, interferometer, one-value, other-models. This plan moves
`q5-one-value` before `q5-deutsch`, N&C's order: parallelism and its limit first, then the interference that beats it
(§12 Q1).

**Outcomes** (Ground wording):
- Say what Deutsch's problem asks, and why a classical computer must look at f twice.
- Build U_f from a truth table, and show that a |−⟩ target kicks (−1)^{f(x)} back onto x.
- Explain why a superposed query still yields only one value of f.
- Follow Deutsch's circuit state by state, and read f(0) ⊕ f(1) from the top qubit.
- Compute an interferometer's two outputs, and match them to Deutsch's circuit.
- Describe adiabatic and measurement-based computing, with a gap and a byproduct.

**Prerequisites** (concepts): Q4 `qc-qubit`, `qc-one-qubit-gates`, `qc-registers`, `qc-cnot`, `qc-circuits`,
`qc-readout`; Q3 `qc-spectral`; Q2 `qc-photon-frames`; F1 `qc-phase`, `qc-euler`. 448 twins: none. Taught inline because
F7 is not built: f : {0,1} → {0,1}, constant and balanced (`q5-problem:b1`).

**Openers and films.** The Part II opener is Q4's (§10 there). Two films are planned in §10; both are deferred.

## 1. Story beats per unit

Stage kinds: `circuit` and `amplitudes` (all units), `bloch` and `operator-space` (unit 6). No new kinds or fields. The
map's `optics-bench` and `energy-ladder` are replaced by the circuit form and by `operator-space` (§9.2). Fidelity items
used: `qc-circuit-engine-state`, `qc-circuit-wires-are-time`, `qc-amp-hue-is-phase`, `qc-amp-engine`; 448's
`bloch-not-lab-space` (unit 6).

### Unit `q5-problem` — Constant or balanced: Deutsch's question

**`q5-problem:b1` [L]** (four functions)
- **G:** "Take a function f that turns one bit into one bit. There are only four: always 0, always 1, copy (f(x) = x) and flip (f(x) = 1 − x). The first two are [[qc-constant|constant]]. The last two give 0 once and 1 once: they are [[qc-balanced|balanced]]."
- **F:** "f : {0,1} → {0,1} is constant if f(0) = f(1) and balanced if f(0) ≠ f(1) (Bergou p. 5). The four, f ≡ 0, f ≡ 1, id and x̄ = 1 − x, are tabulated in Bergou ⚑ P1.3(a). The box computes f; Unit 5.2 opens it."
- **Cap:** G "copy, asked about 1: the bottom wire reads 1" · F "copy: f(0) = 0, f(1) = 1: balanced"
- **Stage:** `split( circ{ circuit:C_Q(id, '1'), upTo:{from:0, to:1} } / amp{same} )`.
- **Claims:** `q5Const` → constant for zero, one; balanced for id, not · `q5QueryId1` → |11⟩.

**`q5-problem:b2` [L]** (a classical computer looks twice)
- **G:** "[[qc-deutsch-problem|Deutsch's problem]]: f is hidden in a box; is it constant or balanced? One look cannot tell. If f(0) = 1, f could be always 1, which is constant, or flip, which is balanced. A classical computer must look twice."
- **F:** "Given f as a black box, decide constant versus balanced (Bergou p. 5). Each classical query returns one value, and each value of f(0) fits one constant and one balanced f, so two queries are necessary and sufficient."
- **Cap:** G/F "flip, asked about 0: f(0) = 1"
- **Stage:** `split( circ{ circuit:C_Q(not, '0') } / amp{same} )`.
- **Claims:** `q5Query0` → |01⟩ · `q5ChQueries` → 2.

**`q5-problem:b3` [L]** (the question is one bit)
- **G:** "Constant means f(0) and f(1) agree. So the whole question is one bit, f(0) ⊕ f(1) with Unit 4.4's XOR: 0 for constant f, 1 for balanced f."
- **F:** "f is constant ⇔ f(0) ⊕ f(1) = 0 (N&C p. 33). Deutsch's problem asks for one bit of global information about f, not for its values."
- **Cap:** G/F "f(0) ⊕ f(1): 0, 0, 1, 1 for always 0, always 1, copy, flip"
- **Stage:** as b2.
- **Claims:** `q5XorF` → 0, 0, 1, 1.

**`q5-problem:b4` [C]** (one look, again)
- **Q G:** "You looked once and found f(1) = 1. Can you now say whether f is balanced?"
- **Q F:** "Does f(1) = 1 decide Deutsch's problem?"
- **Reveal G:** "No. Always 1 and copy both give f(1) = 1, and one is constant while the other is balanced. You still need f(0)."
- **Reveal F:** "No: f(1) = 1 leaves f ∈ {f ≡ 1, id}, one constant and one balanced; classically f(0) ⊕ f(1) needs both values."
- **Reveal cap:** G/F "always 1 and copy: both read 1 at x = 1"
- **Stage:** question `split( circ{ circuit:C_Q(one, '1') } / amp{same} )`; reveal `split( circ{ circuit:C_Q(id, '1') } / amp{same} )`.
- **Claims:** `q5QueryOne1`, `q5QueryId1` → |11⟩, |11⟩.

### Unit `q5-oracle` — The f-CNOT and the phase kickback

**`q5-oracle:b1` [L]** (the f-CNOT)
- **G:** "On a quantum computer f comes as a two-qubit gate U_f, the f-CNOT. It keeps the top qubit x and adds f(x) to the bottom qubit y with XOR: |x⟩|y⟩ becomes |x⟩|y ⊕ f(x)⟩. With y = 0 the bottom qubit ends holding f(x)."
- **F:** "U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩ (Bergou p. 5; N&C p. 31, 'data' and 'target' registers). We may use U_f but not look inside it: an [[qc-oracle|oracle]], and each use is one [[qc-query|query]]."
- **Cap:** G "flip: |0⟩|0⟩ → |0⟩|1⟩" · F "Rosetta: Bergou's |y + f(x)⟩ is the sum mod 2"
- **Stage:** `split( circ{ circuit:C_Q(not, '0'), upTo:{from:0, to:1} } / amp{same} )`.
- **Claims:** `q5Query0` → |01⟩ · `q5Query1` → |10⟩.

**`q5-oracle:b2` [L]** (reversible and unitary)
- **G:** "Apply U_f twice: y ⊕ f(x) ⊕ f(x) = y, so U_f undoes itself. It only reshuffles the four basis states, so it is unitary, a legal gate. For copy U_f is exactly CNOT; for always 1 it is X on the bottom wire."
- **F:** "U_f² = I, and U_f is a permutation matrix, hence unitary (Bergou ⚑ P1.3(b)–(c)): U_id = CNOT, U_{f≡1} = I ⊗ X, U_{f≡0} = I, U_x̄ = (I ⊗ X)CNOT."
- **Cap:** G/F "all four U_f are unitary and square to I"
- **Stage:** as b1.
- **Claims:** `q5UfUnitary`, `q5UfSquare` → all true · `q5UfId`, `q5UfOne`, `q5UfZero`, `q5UfNot` → true ×4.

**`q5-oracle:b3` [L]** (phase kickback; D1)
- **G:** "Now set the bottom qubit to |−⟩ = (|0⟩ − |1⟩)/√2. If f(x) = 0 nothing changes. If f(x) = 1 its two parts swap, and |1⟩ − |0⟩ = −(|0⟩ − |1⟩). Either way the bottom stays |−⟩, and a sign (−1)^{f(x)} comes out in front."
- **F:** "|0 ⊕ f(x)⟩ − |1 ⊕ f(x)⟩ = (−1)^{f(x)}(|0⟩ − |1⟩) (Bergou Eq. 1.13, p. 6; D1), so U_f|x⟩|−⟩ = (−1)^{f(x)}|x⟩|−⟩: [[qc-phase-kickback|phase kickback]]."
- **Cap:** G "copy on |1⟩|−⟩: both bars change sign" · F "(0, 0, 0.707, −0.707) → (0, 0, −0.707, 0.707)"
- **Stage:** `split( circ{ circuit:C_KICK, upTo:{from:0, to:1} } / amp{same} )`; flag `qc-amp-hue-is-phase`.
- **Derivation:** D1 (§2).
- **Claims:** `q5KickIn`, `q5KickOut`.

**`q5-oracle:b4` [L]** (the phase oracle)
- **G:** "So with |−⟩ below, U_f leaves the bottom qubit alone and multiplies |x⟩ by (−1)^{f(x)}. On the top qubit alone, f now acts as a sign: a [[qc-phase-oracle|phase oracle]]. For copy that sign gate is Z."
- **F:** "U_f(|x⟩ ⊗ |−⟩) = (O_f|x⟩) ⊗ |−⟩ with O_f = diag((−1)^{f(0)}, (−1)^{f(1)}) (N&C p. 33): O_id = Z, O_x̄ = −Z, O_{f≡0} = I, O_{f≡1} = −I. On |+⟩|−⟩, copy gives |−⟩|−⟩."
- **Cap:** G/F "copy on |+⟩|−⟩: the top turns to |−⟩, the bottom stays |−⟩"
- **Stage:** `split( circ{ circuit:C_KICK2, upTo:{from:0, to:1} } / amp{same} )`.
- **Claims:** `q5KickAll`, `q5KickTarget`, `q5ChPhase` → true ×3.

**`q5-oracle:b5` [B]** (where U_f comes from: Toffoli)
- **G:** "Where does U_f come from? Nielsen and Chuang show that any classical circuit can be rebuilt from [[qc-toffoli|Toffoli gates]]. A Toffoli flips its third bit only when the first two are both 1, and doing it twice undoes it."
- **F:** "Toffoli: (a, b, c) ↦ (a, b, c ⊕ ab), its own inverse (N&C Fig. 1.14, p. 29); with ancillas it simulates NAND and FANOUT, so every classical f has a reversible U_f of comparable size (N&C pp. 29–31)."
- **Cap:** G/F "Toffoli: |110⟩ → |111⟩"
- **Stage:** `split( circ{ circuit:C_TOF } / amp{same} )`.
- **Claims:** `q5Toffoli110` → 111 · `q5Toffoli2` → true.

**`q5-oracle:b6` [C]** (does the target change?)
- **Q G:** "U_f writes f(x) into the bottom qubit. With the bottom qubit in |−⟩, does the bottom qubit change?"
- **Q F:** "Under U_f with target |−⟩, is the target's state changed?"
- **Reveal G:** "No. It stays |−⟩ every time. The only change is a sign on the top qubit's part: the answer is kicked back to the control."
- **Reveal F:** "No: X|−⟩ = −|−⟩, so |−⟩ is an eigenvector of every U_f's action on the target; the f-dependence appears only as (−1)^{f(x)} on |x⟩."
- **Reveal cap:** G/F "bottom qubit before and after: |−⟩"
- **Stage:** question `split( circ{ circuit:C_KICK2, upTo:0 } / amp{same} )`; reveal the same with `upTo:1`.
- **Claims:** `q5XMinus`, `q5KickTarget` → true, true.

### Unit `q5-one-value` — Both values in, only one out

**`q5-one-value:b1` [L]** (quantum parallelism)
- **G:** "Feed U_f a top qubit in |+⟩ and a bottom qubit in |0⟩. By linearity it works out both cases at once: (|0⟩|f(0)⟩ + |1⟩|f(1)⟩)/√2. Both values of f sit in one state: [[qc-quantum-parallelism|quantum parallelism]]."
- **F:** "U_f[(|0⟩ + |1⟩)/√2 ⊗ |0⟩] = (|0, f(0)⟩ + |1, f(1)⟩)/√2 (Bergou Eq. 1.16, p. 6; N&C Eq. 1.37, Fig. 1.17, p. 31)."
- **Cap:** G "copy: bars at |00⟩ and |11⟩" · F "U_id: (0.707, 0, 0, 0.707)"
- **Stage:** `split( circ{ circuit:C_PAR(id), upTo:{from:0, to:2} } / amp{same} )`.
- **Claims:** `q5Par` → the four states.

**`q5-one-value:b2` [L]** (one reading, one value; D5)
- **G:** "Now read both qubits. You get |0, f(0)⟩ or |1, f(1)⟩, each half the time. That is one value of f at a random x, and the other value is gone."
- **F:** "A computational-basis reading yields (x, f(x)) with x uniform, and the post-state is |x, f(x)⟩ (Bergou p. 6; N&C p. 32): one query still yields one value (D5) <<qc-l3-postulates|the Born rule and the state after a measurement>>."
- **Cap:** G/F "copy read: 00 or 11, chance 0.5 each"
- **Stage:** `split( circ{ circuit:C_PARM } / amp{same, mode:'probability'} )`.
- **Derivation:** D5 (§2).
- **Claims:** `q5ParP` → 0.5, 0, 0, 0.5 · `q5ParBranches` → 00, 11 at 0.5 · `q5ChValues` → 1, 1.

**`q5-one-value:b3` [B]** (n input qubits)
- **G:** "With n top qubits, an H on each turns |0…0⟩ into an even mix of all 2ⁿ strings. Two qubits give four bars of 0.5. U_f then holds f(x) for every x at once, yet a reading still returns one."
- **F:** "H^{⊗n}|0⟩^{⊗n} = 2^{−n/2}Σ_x|x⟩, the [[qc-walsh-hadamard|Walsh–Hadamard transform]] (N&C Eqs. 1.38–1.39, p. 32), and U_f gives 2^{−n/2}Σ_x|x, f(x)⟩ (Eq. 1.40). A later chapter (Deutsch–Jozsa) builds on this."
- **Cap:** G/F "H ⊗ H on |00⟩: four bars of 0.5"
- **Stage:** `split( circ{ circuit:C_H2 } / amp{same} )`.
- **Claims:** `q5WH2` → 0.5 ×4.

**`q5-one-value:b4` [C]** (just a coin toss?)
- **Q G:** "A classical computer could pick x at random and report f(x), with the same chances. Is quantum parallelism just that coin toss?"
- **Q F:** "Is (|0, f(0)⟩ + |1, f(1)⟩)/√2 equivalent to a classical random choice of x?"
- **Reveal G:** "No. A coin's two outcomes exclude each other. The two parts of the quantum state can still be combined again: one more H makes them interfere, which is Deutsch's trick in Unit 5.4."
- **Reveal F:** "No: the reading statistics agree, but the branches stay coherent; a further unitary can make them interfere and expose f(0) ⊕ f(1) (N&C pp. 33–34)."
- **Reveal cap:** G/F "copy after Deutsch's last H: the top qubit is |1⟩"
- **Stage:** question as b2; reveal `split( circ{ circuit:C_D(id) } / amp{same} )`.
- **Claims:** `q5ParP` · `q5D3` (id) → (0, 0, 0.707, −0.707).

### Unit `q5-deutsch` — Deutsch's circuit: one query, a global answer

**`q5-deutsch:b1` [L]** (the circuit and its first step)
- **G:** "Deutsch's circuit: |0⟩ on top and |−⟩ below; H on the top, then U_f, then H on the top again; then read the top qubit. After the first H the state is ½(|0⟩ + |1⟩)(|0⟩ − |1⟩): four bars of 0.5, signs +, −, +, −."
- **F:** "Bergou Fig. 1.5 (p. 5): |ψ₀⟩ = |0⟩₁|−⟩₂ (Eq. 1.10) and |ψ₁⟩ = ½(|0⟩₁ + |1⟩₁)(|0⟩₂ − |1⟩₂) (Eq. 1.11). Bergou's qubit 1 is our top wire x."
- **Cap:** G/F "|ψ₁⟩ = (0.5, −0.5, 0.5, −0.5)"
- **Stage:** `split( circ{ circuit:C_D(id), upTo:{from:0, to:1} } / amp{same} )`.
- **Claims:** `q5D1` → (0.5, −0.5, 0.5, −0.5).

**`q5-deutsch:b2` [L]** (after U_f; D2)
- **G:** "U_f kicks (−1)^{f(x)} onto each top part, as in Unit 5.2: ½[(−1)^{f(0)}|0⟩ + (−1)^{f(1)}|1⟩](|0⟩ − |1⟩). For copy the |1⟩ part changes sign; the bottom stays |−⟩."
- **F:** "|ψ₂⟩ = ½[|0⟩(|0 ⊕ f(0)⟩ − |1 ⊕ f(0)⟩) + |1⟩(|0 ⊕ f(1)⟩ − |1 ⊕ f(1)⟩)] (Eq. 1.12) = ½[(−1)^{f(0)}|0⟩ + (−1)^{f(1)}|1⟩](|0⟩ − |1⟩) (Eq. 1.14), by Eq. 1.13 (D2)."
- **Cap:** G "copy: (0.5, −0.5, −0.5, 0.5)" · F "always 1: (−0.5, 0.5, −0.5, 0.5)"
- **Stage:** as b1, `upTo:{from:1, to:2}`.
- **Derivation:** D2 (§2).
- **Claims:** `q5D2` → the four states.

**`q5-deutsch:b3` [L]** (the last H; D3)
- **G:** "The last H turns (|0⟩ + |1⟩)/√2 into |0⟩ and (|0⟩ − |1⟩)/√2 into |1⟩. If f is constant the two signs agree, and the top qubit ends in |0⟩. If f is balanced they differ, and it ends in |1⟩. One reading answers the question, and f was used once."
- **F:** "|ψ₃⟩ = (1/2√2){|0⟩[(−1)^{f(0)} + (−1)^{f(1)}] + |1⟩[(−1)^{f(0)} − (−1)^{f(1)}]}(|0⟩ − |1⟩) (Eq. 1.15; D3), so P(top reads 1) = 0, 0, 1, 1 for f ≡ 0, f ≡ 1, id, x̄."
- **Cap:** G/F "the top qubit reads 1: never for constant f, always for balanced f"
- **Stage:** `split( circ{ circuit:C_DM(id), upTo:{from:2, to:4} } / amp{same, mode:'probability'} )`.
- **Derivation:** D3 (§2).
- **Claims:** `q5D3` · `q5DTop1` → 0, 0, 1, 1 · `q5DTopIsXor` → true.

**`q5-deutsch:b4` [B]** (N&C's version)
- **G:** "Nielsen and Chuang start from |0⟩|1⟩ and put H on both wires first, which makes the same |+⟩|−⟩. They write the result as ±|f(0) ⊕ f(1)⟩|−⟩: the top qubit holds Unit 5.1's one-bit answer."
- **F:** "N&C Fig. 1.19 and Eqs. 1.41–1.45 (pp. 32–33): |ψ₃⟩ = ±|f(0) ⊕ f(1)⟩|−⟩, the ± a global phase. The circuit combines parallelism with [[qc-interference|interference]]: H recombines the two kicked-back branches (p. 34)."
- **Cap:** G/F "always 1: −|0⟩|−⟩ = (−0.707, 0.707, 0, 0)"
- **Stage:** `split( circ{ circuit:C_DNC(one) } / amp{same} )`.
- **Claims:** `q5NC1` → (0.5, −0.5, 0.5, −0.5) · `q5NCsame` → true · `q5D3` (one).

**`q5-deutsch:b5` [C]** (did it learn f(0)?)
- **Q G:** "Deutsch's circuit told you whether f is constant. Did it also tell you f(0)?"
- **Q F:** "Does the circuit's output determine f(0)?"
- **Reveal G:** "No. Always 0 and always 1 end in the same state up to a sign, so both read 0. The circuit learns the one bit f(0) ⊕ f(1) and nothing more."
- **Reveal F:** "No: |ψ₃⟩ for f ≡ 0 and f ≡ 1 differ by the global phase −1, and so do id and x̄; only f(0) ⊕ f(1) is measurable (N&C Eq. 1.45)."
- **Reveal cap:** G/F "always 0 and always 1: the same state, opposite sign"
- **Stage:** question `split( circ{ circuit:C_D(one) } / amp{same} )`; reveal `split( circ{ circuit:C_D(zero) } / amp{same} )`.
- **Claims:** `q5ConstSame`, `q5ConstEqual`, `q5BalSame` → true, false, true.

### Unit `q5-interferometer` — Two paths, one photon: Deutsch in glass

**`q5-interferometer:b1` [L]** (the beam splitter)
- **G:** "A [[qc-beam-splitter|beam splitter]] sends a photon on in two directions at once. Call the paths a and b, and treat 'in a' and 'in b' as |0⟩ and |1⟩. A photon entering along a leaves as (|a⟩ + |b⟩)/√2: amplitudes 0.707 and 0.707."
- **F:** "Bergou Eq. 1.17 (p. 7): a† ↦ (a† + b†)/√2, b† ↦ (b† − a†)/√2 for a 50–50 splitter. On one-photon states, a†|vac⟩ ≡ |0⟩ and b†|vac⟩ ≡ |1⟩, this is R_y(90°) = (1/√2)(1 −1; 1 1)."
- **Cap:** G "after the first splitter: 0.707 in each arm" · F "Rosetta: Bergou's |0⟩ in §1.5 is the vacuum, |vac⟩ here"
- **Stage:** `split( circ{ circuit:C_MZ(0), upTo:{from:0, to:1} } / amp{same, dials:true} )`.
- **Claims:** `q5BS` → (1/√2)(1 −1; 1 1) · `q5BSmatches117` → true.

**`q5-interferometer:b2` [L]** (the whole interferometer; D4)
- **G:** "Mirrors steer both arms into a second splitter, with a [[qc-phase-shifter|phase shifter]] on each arm: a [[qc-mach-zehnder|Mach–Zehnder interferometer]]. The photon leaves output 1 with amplitude ½(e^{iφ₀} + e^{iφ₁}) and output 2 with ½(e^{iφ₁} − e^{iφ₀}). With φ₀ = 0 and φ₁ = 90°, each output gets chance 0.5."
- **F:** "U_{BS2}U_{φ₁}U_{φ₀}U_{BS1}a†|vac⟩ = ½(e^{iφ₀} + e^{iφ₁})a†|vac⟩ + ½(e^{iφ₁} − e^{iφ₀})b†|vac⟩ (Eq. 1.18, Fig. 1.7, p. 8). With Fig. 1.7's mirrors this is R_y(−90°)·diag(e^{iφ₀}, e^{iφ₁})·R_y(90°) (D4; erratum B1)."
- **Cap:** G "φ₁ = 90°: output 1 gets ½(1 + i), chance 0.5" · F "P(output 1) = cos²((φ₁ − φ₀)/2): 1, 0.854, 0.5, 0.146, 0 at 0°, 45°, 90°, 135°, 180°"
- **Stage:** `split( circ{ circuit:C_MZ(π/2), upTo:{from:0, to:3} } / amp{same, dials:true} )`.
- **Derivation:** D4 (§2).
- **Claims:** `q5MzHalf` → (0.5 + 0.5i, −0.5 + 0.5i) · `q5MzHalfP` → 0.5, 0.5 · `q5MzSweep` · `q5Mz118`, `q5MzCos2`, `q5MirrorBS` → true ×3.

**`q5-interferometer:b3` [L]** (phases of 0 or 180° are f)
- **G:** "Now allow only phase shifts of 0 or 180°, standing for f(0) and f(1). Equal phases send the photon out of output 1 every time; unequal phases send it out of output 2. One photon tells whether f is constant, and interference does it."
- **F:** "With φ_x = πf(x), diag(e^{iφ₀}, e^{iφ₁}) = O_f, Unit 5.2's phase oracle (Bergou p. 8). P(output 2) = 0, 0, 1, 1 for f ≡ 0, f ≡ 1, id, x̄: constructive at one port, destructive at the other."
- **Cap:** G/F "copy (0° and 180°): output 2, amplitude −1"
- **Stage:** `split( circ{ circuit:C_MZF(id) } / amp{same} )`.
- **Claims:** `q5MzF` → 0, 0, 1, 1 · `q5MzId` → (0, −1).

**`q5-interferometer:b4` [L]** (the same as Deutsch)
- **G:** "Compare Unit 5.4. After the kickback, Deutsch's top qubit meets H, a sign gate, then H. The interferometer is splitter, phases, splitter. Both send one qubit two ways and recombine it, so interference is the resource."
- **F:** "Deutsch's top qubit is HO_fH|0⟩ with the target |−⟩ a spectator, and R_y(−90°)ΦR_y(90°) = Z(HΦH)Z, so both circuits give the same port chances for every Φ (Bergou p. 8)."
- **Cap:** G/F "Deutsch's top wire alone: H, O_f, H; copy ends in |1⟩"
- **Stage:** `split( circ{ circuit:C_HOH(id) } / amp{same} )`.
- **Claims:** `q5HOH` → (0, 1) · `q5DeutschTop`, `q5HPhiH`, `q5HPhiHprobs` → true ×3.

**`q5-interferometer:b5` [C]** (which path?)
- **Q G:** "Put a detector between the splitters that reads which arm the photon took. With equal phases, does the photon still always leave by output 1?"
- **Q F:** "With a which-path measurement between the splitters and φ₀ = φ₁, is P(output 1) still 1?"
- **Reveal G:** "No. It leaves each output half the time, whatever the phases. With the arm known, each output gets one amplitude and nothing interferes, as 448's middle magnet erased the first answer."
- **Reveal F:** "No: the reading collapses the photon to |0⟩ or |1⟩, and BS2 then gives ½, ½ for every phase; interference needs both amplitudes to reach one output <<qc-l1-sequential|a new axis erases the old answer>>."
- **Reveal cap:** G/F "arm read: output 1 half the time; arm unread: every time"
- **Stage:** question `split( circ{ circuit:C_MZ(0) } / amp{same} )`; reveal `split( circ{ circuit:C_MZW, outcomes:'0' } / amp{same, mode:'probability'} )`.
- **Claims:** `q5NoWhichPathOut1` → 1 · `q5WhichPathOut1` → 0.5 · `q5WhichPath` → 0.25 ×4 · `q5MzW0P` → 0.5, 0.5.

### Unit `q5-other-models` — Two other ways to compute

**`q5-other-models:b1` [L]** (adiabatic computing)
- **G:** "Bergou names two other models. In [[qc-adiabatic-computing|adiabatic computing]] you start in the lowest-energy state of a simple energy operator ℋ₀ and change it slowly into ℋ₁, whose lowest state holds the answer. Go slowly enough and the system stays in the lowest state."
- **F:** "ℋ(s) = (1 − s)ℋ₀ + sℋ₁ with s = t/t_f, under iħ d|ψ⟩/dt = ℋ(t)|ψ⟩ (Bergou Eq. 1.19, p. 9) <<qc-l6-generator|S_z generates the turn>>. The adiabatic theorem keeps the ground state; the minimum [[qc-spectral-gap|gap]] over s sets how slowly to go. Rosetta: Bergou's H₀, H₁ are ℋ₀, ℋ₁."
- **Cap:** G "halfway, s = ½: the arrow is half the gap, 0.707" · F "ℋ(½) = (−0.5 −0.5; −0.5 0.5): gap 1.414"
- **Stage:** `ops{ op:{matrix:[['-1/2','-1/2'],['-1/2','1/2']]}, eigen:true, labels:'plain' }`.
- **Claims:** `q5HHalf` → as cap · `q5Gap[2]` → 1.414 · `q5Arrow` — `decomposeHermitian(ℋ(½))` → a₀ = 0, \|a⃗\| = 0.707.

**`q5-other-models:b2` [L]** (a two-level example)
- **G:** "A small example of our own: ℋ₀ = −X, whose lowest state is |+⟩, and ℋ₁ = −Z, whose lowest state is |0⟩. The gap between the two levels is 2 at both ends and dips to 1.414 halfway. Meanwhile the lowest state climbs from |+⟩ to |0⟩."
- **F:** "ℋ(s) = −(1 − s)X − sZ has eigenvalues ±√((1 − s)² + s²), so Δ(s) = 2√((1 − s)² + s²), smallest at s = ½ where Δ = √2 (our example; Bergou gives none). Its ground state has Bloch vector ∝ (1 − s, 0, s)."
- **Cap:** G "the lowest state at s = ½: 45° from the north pole" · F "ground states (1, 0, 0) → (0.707, 0, 0.707) → (0, 0, 1)"
- **Stage:** `bloch{ state:{thetaDeg:{from:90, to:0}, phiDeg:0} }`.
- **Claims:** `q5Gap` → 2, 1.581, 1.414, 1.581, 2 · `q5GapMin` → 1.414 at s = 0.5 · `q5Ground`.

**`q5-other-models:b3` [L]** (measurement-based computing; D6)
- **G:** "In [[qc-measurement-based|measurement-based]] computing, measurements do the gates. To apply W(θ) = H·P(θ) to ψ, add a qubit in |+⟩, apply CZ, and read the first qubit in the basis |±θ⟩ = (|0⟩ ± e^{−iθ}|1⟩)/√2. The second qubit is then W(θ)ψ or XW(θ)ψ, each half the time."
- **F:** "W(θ)|0⟩ = |+⟩, W(θ)|1⟩ = e^{iθ}|−⟩ (Eq. 1.20), so W(θ) = HP(θ). CZ|ψ⟩|+⟩ = (|+θ⟩₁W(θ)|ψ⟩₂ + |−θ⟩₁XW(θ)|ψ⟩₂)/√2 (Eq. 1.21; CPHASE = CZ, Unit 4.4), a two-qubit [[qc-cluster-state|cluster state]]; reading in |±θ⟩ is P(θ), H, then a reading (D6)."
- **Cap:** G "θ = 45°: each reading has chance 0.5" · F "after '+θ': qubit 2 = W(θ)ψ = (0.862 + 0.25i, 0.362 − 0.25i)"
- **Stage:** `split( circ{ circuit:C_MB, outcomes:'0' } / amp{same} )`.
- **Derivation:** D6 (§2).
- **Claims:** `q5W0`, `q5W1` → true, true · `q5MbCZState` · `q5MbBasisP` → 0.5, 0.5 · `q5MbBranches` · `q5MbBranch0` → true · `q5WPsi`.

**`q5-other-models:b4` [L]** (the byproduct X)
- **G:** "If the reading gives −θ, the second qubit carries an extra X. At the end that only swaps the final 0 and 1, so relabel the results. For ψ and θ = 45°, W(θ)ψ reads 0 with chance 0.806, and XW(θ)ψ reads 1 with the same chance."
- **F:** "The [[qc-byproduct|byproduct]] X is known from the outcome, and a final reading of XW(θ)ψ is that of W(θ)ψ with 0 ↔ 1 (Bergou p. 10). To chain steps, W(θ)X = e^{iθ}ZW(−θ): Bergou's W(θ)σ_x = σ_zW(−θ) holds up to this global phase (§8.1)."
- **Cap:** G/F "W(θ)ψ: 0.806, 0.194; XW(θ)ψ: 0.194, 0.806"
- **Stage:** `split( circ{ circuit:C_MB, outcomes:'1' } / amp{same} )`.
- **Claims:** `q5WPsiP`, `q5XWPsiP` · `q5MbBranch1` → true · `q5WIdentPhase`, `q5WIdentBare` → true, false.

**`q5-other-models:b5` [L]** (Bergou's three lessons)
- **G:** "Bergou closes Chapter 1 with three lessons from Deutsch's problem. Quantum states can beat classical ones. Finding such gains is hard. And every algorithm ends by reading out its final state."
- **F:** "§1.7 (p. 10): gains exist, they are hard to find, and the final step is a measurement; any circuit computation can also be run measurement-based (p. 10)."
- **Cap:** G/F "one query instead of two: the top qubit reads f(0) ⊕ f(1)"
- **Stage:** `split( circ{ circuit:C_DM(not) } / amp{same, mode:'probability'} )`.
- **Claims:** `q5DTop1` (not) → 1.

**`q5-other-models:b6` [C]** (does the randomness spoil it?)
- **Q G:** "In the measurement-based step, the first reading is random. Does that randomness spoil the computation?"
- **Q F:** "Does the random outcome of the |±θ⟩ reading destroy the intended W(θ)ψ?"
- **Reveal G:** "No. Each reading leaves W(θ)ψ or XW(θ)ψ, and you know which. The known X can be undone, or simply swapped out of the final results."
- **Reveal F:** "No: both branches have probability ½ and differ by a known Pauli byproduct, corrected by relabelling or absorbed into later measurement bases (Bergou p. 10)."
- **Reveal cap:** G/F "both readings: chance 0.5, each a known version of W(θ)ψ"
- **Stage:** question as b3; reveal as b4.
- **Claims:** `q5MbBranches` → 0.5, 0.5 · `q5MbBranch0`, `q5MbBranch1` → true, true.

**Beat count:** 4 + 6 + 4 + 5 + 5 + 6 = **30 beats**, 6 of them clues with reveals. Phase mix: 21 [L] · 3 [B] · 6 [C];
within every unit the order is L → B → C.

## 2. Derivations

**D1 · `q5-oracle:b3` · result U_f|x⟩|−⟩ = (−1)^{f(x)}|x⟩|−⟩** (Bergou Eq. 1.13)
- Ground:
  1. `U_f|x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle` — The f-CNOT's rule.
  2. `U_f|x\rangle(|0\rangle - |1\rangle) = |x\rangle(|0 \oplus f(x)\rangle - |1 \oplus f(x)\rangle)` — A gate is linear: apply the rule to each part of |−⟩, leaving out the common 1/√2.
  3. `f(x) = 0:\ |0\rangle - |1\rangle` — XOR with 0 changes nothing.
  4. `f(x) = 1:\ |1\rangle - |0\rangle = -(|0\rangle - |1\rangle)` — XOR with 1 flips each bit, so the two parts trade places.
  5. `|0 \oplus f(x)\rangle - |1 \oplus f(x)\rangle = (-1)^{f(x)}(|0\rangle - |1\rangle)` — Both cases in one line, since (−1)⁰ = 1 and (−1)¹ = −1.
  6. `U_f|x\rangle|-\rangle = (-1)^{f(x)}|x\rangle|-\rangle` — Put the 1/√2 back; a number multiplies the whole term, so write it in front of |x⟩.
- Formal:
  1. `U_f|x\rangle|-\rangle = |x\rangle \otimes X^{f(x)}|-\rangle` — y ↦ y ⊕ f(x) is X^{f(x)} on the target.
  2. `X|-\rangle = -|-\rangle \Rightarrow U_f|x\rangle|-\rangle = (-1)^{f(x)}|x\rangle|-\rangle` — |−⟩ is an eigenvector of X.
- Check: `q5KickOut`, `q5KickAll`.

**D2 · `q5-deutsch:b2` · result |ψ₂⟩ = ½[(−1)^{f(0)}|0⟩ + (−1)^{f(1)}|1⟩](|0⟩ − |1⟩)** (Bergou Eqs. 1.10–1.14)
- Ground:
  1. `|\psi_0\rangle = |0\rangle\,\tfrac1{\sqrt2}(|0\rangle - |1\rangle)` — The input: |0⟩ on top, |−⟩ below.
  2. `|\psi_1\rangle = \tfrac12(|0\rangle + |1\rangle)(|0\rangle - |1\rangle)` — H on the top qubit gives |+⟩, and the two factors 1/√2 make ½.
  3. `|\psi_1\rangle = \tfrac12\big[|0\rangle(|0\rangle - |1\rangle) + |1\rangle(|0\rangle - |1\rangle)\big]` — Multiply out the top qubit.
  4. `U_f|x\rangle(|0\rangle - |1\rangle) = (-1)^{f(x)}|x\rangle(|0\rangle - |1\rangle)` — D1, once with x = 0 and once with x = 1.
  5. `|\psi_2\rangle = \tfrac12\big[(-1)^{f(0)}|0\rangle + (-1)^{f(1)}|1\rangle\big](|0\rangle - |1\rangle)` — Apply step 4 to each term, then take out the common bottom factor.
- Formal:
  1. `|\psi_1\rangle = |+\rangle|-\rangle = \tfrac1{\sqrt2}\textstyle\sum_x |x\rangle|-\rangle` — Eqs. 1.10–1.11.
  2. `|\psi_2\rangle = \tfrac1{\sqrt2}\textstyle\sum_x (-1)^{f(x)}|x\rangle|-\rangle` — D1 term by term (Eqs. 1.12–1.14).
- Check: `q5D1`, `q5D2`.

**D3 · `q5-deutsch:b3` · result the top qubit ends in ±|f(0) ⊕ f(1)⟩** (Bergou Eq. 1.15; N&C Eq. 1.45)
- Ground:
  1. `H|0\rangle = \tfrac1{\sqrt2}(|0\rangle + |1\rangle),\quad H|1\rangle = \tfrac1{\sqrt2}(|0\rangle - |1\rangle)` — Unit 4.2.
  2. `H\big[(-1)^{f(0)}|0\rangle + (-1)^{f(1)}|1\rangle\big] = \tfrac1{\sqrt2}\big\{[(-1)^{f(0)} + (-1)^{f(1)}]|0\rangle + [(-1)^{f(0)} - (-1)^{f(1)}]|1\rangle\big\}` — Apply H to each term and collect |0⟩ and |1⟩.
  3. `f(0) = f(1):\ \text{the } |1\rangle \text{ bracket is } 0,\ \text{the } |0\rangle \text{ bracket } \pm2` — Equal signs add at |0⟩ and cancel at |1⟩.
  4. `f(0) \ne f(1):\ \text{the } |0\rangle \text{ bracket is } 0,\ \text{the } |1\rangle \text{ bracket } \pm2` — Opposite signs cancel at |0⟩ and add at |1⟩.
  5. `\text{top qubit} = \pm|f(0) \oplus f(1)\rangle` — Constant f leaves |0⟩ and balanced f leaves |1⟩; the ± is a global phase.
- Formal:
  1. `|\psi_3\rangle = \tfrac1{2\sqrt2}\textstyle\sum_y \big[(-1)^{f(0)} + (-1)^{f(1) + y}\big]|y\rangle(|0\rangle - |1\rangle)` — Eq. 1.15, from H|x⟩ = Σ_y(−1)^{xy}|y⟩/√2.
  2. `|\psi_3\rangle = \pm|f(0) \oplus f(1)\rangle|-\rangle` — N&C Eq. 1.45.
- Check: `q5D3`, `q5DTopIsXor`.

**D4 · `q5-interferometer:b2` · result Eq. 1.18 and P(output 1) = cos²((φ₁ − φ₀)/2)**
- Ground:
  1. `|0\rangle \to \tfrac1{\sqrt2}(|0\rangle + |1\rangle)` — The first splitter, for a photon entering along arm a (Eq. 1.17).
  2. `\to \tfrac1{\sqrt2}(e^{i\varphi_0}|0\rangle + e^{i\varphi_1}|1\rangle)` — Each shifter multiplies its own arm's amplitude by its phase.
  3. `|0\rangle \to \tfrac1{\sqrt2}(|0\rangle - |1\rangle),\quad |1\rangle \to \tfrac1{\sqrt2}(|0\rangle + |1\rangle)` — Fig. 1.7's mirrors bring each arm into the second splitter through the other port, and the figure names the outputs; together the second splitter acts as the first one run backwards (erratum B1).
  4. `\tfrac12e^{i\varphi_0}(|0\rangle - |1\rangle) + \tfrac12e^{i\varphi_1}(|0\rangle + |1\rangle)` — Apply step 3 to each term of step 2.
  5. `\tfrac12(e^{i\varphi_0} + e^{i\varphi_1})|0\rangle + \tfrac12(e^{i\varphi_1} - e^{i\varphi_0})|1\rangle` — Collect output 1 (|0⟩) and output 2 (|1⟩): Eq. 1.18.
  6. `P_1 = \tfrac14|e^{i\varphi_0} + e^{i\varphi_1}|^2 = \cos^2\tfrac{\varphi_1 - \varphi_0}2` — The size squared of two unit arrows added (Chapter F1).
- Formal:
  1. `U_{BS} \doteq R_y(\tfrac\pi2),\quad XU_{BS}X = R_y(-\tfrac\pi2)` — Eq. 1.17 on one-photon states; the arm swap and Fig. 1.7's labels conjugate BS2 by X.
  2. `U_{MZ}|0\rangle = R_y(-\tfrac\pi2)\,\mathrm{diag}(e^{i\varphi_0}, e^{i\varphi_1})\,R_y(\tfrac\pi2)|0\rangle` — This is Eq. 1.18; U_BS applied twice would send equal phases to output 2 (B1).
- Check: `q5Mz118`, `q5MirrorBS`, `q5MzNaive` → 0, 1, `q5MzCos2`.

**D5 · `q5-one-value:b2` · result one query, read out, gives one value of f** (Bergou p. 6; N&C p. 32)
- Ground:
  1. `\tfrac1{\sqrt2}\big(|0, f(0)\rangle + |1, f(1)\rangle\big)` — The state after one query (Eq. 1.16).
  2. `P\big(0, f(0)\big) = P\big(1, f(1)\big) = \tfrac12` — Each term has amplitude 1/√2, so chance ½ (Unit 4.6).
  3. `\text{read } (x, f(x)) \Rightarrow |x, f(x)\rangle` — After the reading only the matching term is left.
  4. `\text{one reading} \to \text{one pair } (x, f(x))` — The other value has left no trace in the state.
- Formal:
  1. `2^{-n/2}\textstyle\sum_x |x, f(x)\rangle \to |x, f(x)\rangle,\ \Pr[x] = 2^{-n}` — N&C Eq. 1.40, read in the computational basis.
  2. `\text{one query yields one } f(x)` — The post-state holds a single value.
- Check: `q5ParP`, `q5ParBranches`, `q5ChValues`.

**D6 · `q5-other-models:b3` · result Eq. 1.21: CZ|ψ⟩|+⟩ = (|+θ⟩W(θ)|ψ⟩ + |−θ⟩XW(θ)|ψ⟩)/√2**
- Ground:
  1. `|\psi\rangle|+\rangle = \alpha|0\rangle|+\rangle + \beta|1\rangle|+\rangle` — ψ = α|0⟩ + β|1⟩ beside |+⟩.
  2. `\mathrm{CZ}: \ \alpha|0\rangle|+\rangle + \beta|1\rangle|-\rangle` — CZ flips the sign of |11⟩, which turns the second qubit's |+⟩ into |−⟩ when the first is 1.
  3. `\langle{+\theta}| = \tfrac1{\sqrt2}(\langle0| + e^{i\theta}\langle1|)` — The bra of |+θ⟩: conjugate its amplitudes (Unit 1.5).
  4. `\langle{+\theta}|_1(\ldots) = \tfrac1{\sqrt2}(\alpha|+\rangle + e^{i\theta}\beta|-\rangle)` — Keep what matches |+θ⟩ on the first qubit.
  5. `W(\theta)|\psi\rangle = \alpha|+\rangle + e^{i\theta}\beta|-\rangle` — By Eq. 1.20, W(θ) sends |0⟩ to |+⟩ and |1⟩ to e^{iθ}|−⟩: step 4 is W(θ)ψ/√2.
  6. `\langle{-\theta}|_1(\ldots) = \tfrac1{\sqrt2}(\alpha|+\rangle - e^{i\theta}\beta|-\rangle) = \tfrac1{\sqrt2}XW(\theta)|\psi\rangle` — X keeps |+⟩ and flips the sign of |−⟩.
  7. `\tfrac1{\sqrt2}\big(|{+\theta}\rangle W(\theta)|\psi\rangle + |{-\theta}\rangle XW(\theta)|\psi\rangle\big)` — Put the two parts together: Eq. 1.21, each reading with chance ½.
- Formal:
  1. `\mathrm{CZ}|\psi\rangle|+\rangle = \alpha|0, +\rangle + \beta|1, -\rangle` — CZ = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ Z.
  2. `= \tfrac1{\sqrt2}\big(|{+\theta}\rangle \otimes W(\theta)|\psi\rangle + |{-\theta}\rangle \otimes XW(\theta)|\psi\rangle\big)` — Expand |0⟩, |1⟩ in the |±θ⟩ basis; Eq. 1.21.
- Check: `q5MbBranches`, `q5MbBranch0`, `q5MbBranch1`, `q5MbBasisP`.

## 3. Try-it widget per unit

No existing widget runs a circuit (`P-Q4-story.md` §9.3 W1). The one-qubit picture of each unit is used instead.

| Unit | Widget spec | Why this one |
|---|---|---|
| `q5-problem` | `{kind:'deposit-stats', props:{state:'+z', axis:'z', seed:709}}` | A classical look is a sure reading: every shot gives the same answer, so one look tells one value (weak fit). |
| `q5-oracle` | `{kind:'bloch', props:{theta:90, phi:0, editable:false, measure:'x', rotations:true, rotationAngles:[180]}}` | The kicked-back sign is Z: a half turn about z takes \|+⟩ to \|−⟩ and flips the x reading. |
| `q5-one-value` | `{kind:'deposit-stats', props:{state:'+x', axis:'z', seed:709}}` | Each run of (1.16) returns one x; the counts settle at ½, ½. |
| `q5-deutsch` | `{kind:'phase-dial', props:{theta:90, rotations:true}}` | The kickback is a relative phase of 0° or 180° between the top qubit's two parts. |
| `q5-interferometer` | `{kind:'bloch', props:{theta:90, phi:0, editable:false, measure:'x', rotations:true, rotationAngles:[45, 90, 135, 180]}}` | After the first splitter the photon sits on the equator; a phase difference turns it; the x reading is output 1: cos²(χ/2). |
| `q5-other-models` | `{kind:'bloch', props:{theta:45, phi:0, editable:true, landmarks:true, measure:'z'}}` | The lowest state of ℋ(½) sits at θ = 45°; drag θ from 90° to 0° to follow the slow change. |

**Try this:**
- `q5-problem`: (1) Fire 10 atoms: do any differ? · `q5-oracle`: (1) Press 180° once, then twice: when does the x reading flip back?
- `q5-one-value`: (1) Fire 10, then 100: how close to ½? · `q5-deutsch`: (1) Set 0° and 180°: which one is balanced?
- `q5-interferometer`: (1) Press 45°, 90°, 135°: read 0.854, 0.5, 0.146. (2) 180°: output 2 always. · `q5-other-models`: (1) θ = 90°, 45°, 0°: s = 0, ½, 1.

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** no sheet assigns any item below
(`homework-status.md`); ⚑ items follow `qc709-nc.md`.

### `q5-problem`
1. **warm-up · numeric · `q5-p-count`** — "How many functions from one bit to one bit are balanced?"
   - Answer: **2** = `q5ChCount`. Hints: (1) There are four functions. (2) Balanced: one 0, one 1. (3) Copy and flip. Walkthrough: 2.
2. **core · choice · `q5-p-which`** — "Which truth table is balanced?"
   - Options: **f(0) = 1, f(1) = 0** ✓ · f(0) = 1, f(1) = 1 · f(0) = 0, f(1) = 0 · none of these.
   - Check: `q5ChWhich` → 1, 0, 0 (Bergou ⚑ P1.3(a)). Hints: (1) Compare f(0) and f(1). (2) Balanced means they differ. (3) Only one pair differs. Walkthrough: flip.
3. **core · numeric · `q5-p-xor`** — "f(0) = 1 and f(1) = 1. What is f(0) ⊕ f(1)?"
   - Answer: **0** = `q5ChXor`. Hints: (1) ⊕ adds without carrying. (2) 1 + 1 = 2. (3) Drop the carry. Walkthrough: 0: constant.
4. **stretch · numeric · `q5-p-queries`** — "In the worst case, how many classical evaluations of f decide whether it is constant?"
   - Answer: **2** = `q5ChQueries`. Hints: (1) What does f(0) alone rule out? (2) Nothing: a constant and a balanced f fit. (3) Ask f(1). Walkthrough: 2; Deutsch's circuit needs 1 query.

### `q5-oracle`
1. **warm-up · choice · `q5-o-cnot`** — "For which f is U_f the CNOT?"
   - Options: **copy, f(x) = x** ✓ · always 0 · always 1 · flip. Check: `q5ChCnot` → id. Hints: (1) CNOT adds x to y. (2) U_f adds f(x). (3) So f(x) = x. Walkthrough: copy.
2. **core · choice · `q5-o-out`** — "U_f for always 1 acts on |0⟩|1⟩. What comes out?"
   - Options: **\|0⟩\|0⟩** ✓ · \|0⟩\|1⟩ · \|1⟩\|1⟩ · \|1⟩\|0⟩. Check: `q5ChOut` → 00. Hints: (1) y ⊕ f(x). (2) 1 ⊕ 1. (3) x is untouched. Walkthrough: \|0⟩\|0⟩.
3. **core · numeric · `q5-o-kick`** — "U_f for flip acts on |0⟩|−⟩. What is the |00⟩ amplitude afterwards?"
   - Answer: **−0.7071** = `q5ChKick[0]`. Hints: (1) f(0) = 1. (2) The sign (−1)¹ lands in front. (3) \|0⟩\|−⟩ has \|00⟩ amplitude 1/√2. Walkthrough: −\|0⟩\|−⟩ = (−0.707, 0.707, 0, 0).
4. **stretch · choice · `q5-o-phase`** — "With the target in |−⟩, which one-qubit gate does U_f act as on x, for f(x) = x?"
   - Options: **Z** ✓ · X · H · I. Check: `q5ChPhase` → true. Hints: (1) \|0⟩ keeps its sign. (2) \|1⟩ gains (−1)¹. (3) diag(1, −1). Walkthrough: O_id = Z.

### `q5-one-value`
1. **warm-up · numeric · `q5-v-prob`** — "After Eq. 1.16 with f(x) = x, what is the chance of reading 11?"
   - Answer: **0.5** = `q5ParP[3]`. Hints: (1) The state is (\|00⟩ + \|11⟩)/√2. (2) Amplitude 1/√2. (3) Square it. Walkthrough: ½.
2. **core · numeric · `q5-v-wh`** — "H on each of three qubits in |000⟩: what is each amplitude?"
   - Answer: **0.3536** = `q5ChWh`. Hints: (1) 2³ = 8 equal amplitudes. (2) Their squares add to 1. (3) 1/√8. Walkthrough: 0.354.
3. **core · numeric · `q5-v-values`** — "How many values of f does one reading of (|0, f(0)⟩ + |1, f(1)⟩)/√2 reveal?"
   - Answer: **1** = `q5ChValues[0]`. Hints: (1) What is left after the reading? (2) One term. (3) It holds one f(x). Walkthrough: 1 (D5).
4. **stretch · choice · `q5-v-state`** — "For always 1, what does U_f make of (|0⟩ + |1⟩)|0⟩/√2?"
   - Options: **(\|01⟩ + \|11⟩)/√2** ✓ · (\|00⟩ + \|11⟩)/√2 · (\|01⟩ + \|10⟩)/√2 · (\|00⟩ + \|10⟩)/√2. Check: `q5Par` (one) → (0, 0.707, 0, 0.707). Hints: (1) f(0) = f(1) = 1. (2) Each y becomes 0 ⊕ 1. (3) Both terms end in 1. Walkthrough: (\|01⟩ + \|11⟩)/√2.

### `q5-deutsch`
1. **warm-up · numeric · `q5-d-read`** — "In Deutsch's circuit with flip, what is the chance that the top qubit reads 1?"
   - Answer: **1** = `q5DTop1` (not). Hints: (1) Is flip constant? (2) Balanced ends in \|1⟩. (3) Up to sign. Walkthrough: 1.
2. **core · numeric · `q5-d-psi2`** — "For always 1, what is the |00⟩ amplitude of |ψ₂⟩ = ½[(−1)^{f(0)}|0⟩ + (−1)^{f(1)}|1⟩](|0⟩ − |1⟩)?"
   - Answer: **−0.5** = `q5D2` (one)[0]. Hints: (1) f(0) = 1. (2) (−1)¹ = −1. (3) Times ½ × 1. Walkthrough: −0.5.
3. **core · order · `q5-d-steps`** — "Put Deutsch's circuit in order."
   - Steps: "Prepare \|0⟩ on top and \|−⟩ below." · "H on the top qubit." · "Apply U_f once." · "H on the top qubit." · "Read the top qubit." Hints: (1) Prepare first. (2) H surrounds U_f. (3) Read last. Walkthrough: Fig. 1.5.
4. **stretch · numeric · `q5-d-sign`** — "For always 1, what is the |01⟩ amplitude of the final state?"
   - Answer: **0.7071** = `q5D3` (one)[1]. Hints: (1) Constant: the top ends in \|0⟩. (2) With the sign −1. (3) −\|0⟩\|−⟩. Walkthrough: −\|0⟩\|−⟩ = (−0.707, 0.707, 0, 0).

### `q5-interferometer`
1. **warm-up · numeric · `q5-i-bs`** — "A photon enters the splitter along arm a. What is its chance of taking arm b?"
   - Answer: **0.5** = `q5MzW0P[1]`. Hints: (1) Amplitude 1/√2. (2) Square it. (3) ½. Walkthrough: ½.
2. **core · numeric · `q5-i-p90`** — "φ₀ = 0 and φ₁ = 90°. What is the chance of output 1?"
   - Answer: **0.5** = `q5MzHalfP[0]`. Hints: (1) ½(1 + e^{iφ₁}). (2) \|1 + i\|² = 2. (3) Divide by 4. Walkthrough: ½.
3. **core · numeric · `q5-i-p45`** — "φ₀ = 0 and φ₁ = 45°. What is the chance of output 1?"
   - Answer: **0.8536** = `q5MzSweep[1]`. Hints: (1) cos²((φ₁ − φ₀)/2). (2) Half of 45°. (3) Square its cosine. Walkthrough: 0.854.
4. **stretch · numeric · `q5-i-which`** — "A detector between the splitters reads the arm, and φ₀ = φ₁. What is the chance of output 2?"
   - Answer: **0.5** = `q5WhichPathOut2`. Hints: (1) The reading leaves one arm. (2) One arm into a splitter. (3) Half and half. Walkthrough: ½, whatever the phases.

### `q5-other-models`
1. **warm-up · numeric · `q5-m-gap0`** — "For ℋ(s) = −(1 − s)X − sZ, what is the gap at s = 0?"
   - Answer: **2** = `q5Gap[0]`. Hints: (1) ℋ(0) = −X. (2) Its eigenvalues are ±1. (3) Their difference. Walkthrough: 2.
2. **core · numeric · `q5-m-gapmin`** — "What is the smallest gap over all s?"
   - Answer: **1.4142** = `q5GapMin[0]`. Hints: (1) Δ(s) = 2√((1 − s)² + s²). (2) Smallest at s = ½. (3) 2√(½). Walkthrough: √2.
3. **core · numeric · `q5-m-w`** — "For ψ = 0.866|0⟩ + 0.5|1⟩ and θ = 45°, what is the chance that W(θ)ψ reads 0?"
   - Answer: **0.8062** = `q5WPsiP[0]`. Hints: (1) W(θ) = H·P(θ). (2) The \|0⟩ amplitude is (α + e^{iθ}β)/√2. (3) \|α + e^{iθ}β\|²/2 with α = 0.866, β = 0.5. Walkthrough: 0.806.
4. **stretch · numeric · `q5-m-byproduct`** — "Same ψ and θ, but the first reading gave −θ. What is the chance that the second qubit reads 1?"
   - Answer: **0.8062** = `q5XWPsiP[1]`. Hints: (1) The second qubit holds XW(θ)ψ. (2) X swaps the two chances. (3) So read 1 where W(θ)ψ read 0. Walkthrough: 0.806.

## 5. Glossary terms

## 5. Glossary terms new in Q5

| id | Term | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|
| `qc-constant` | constant function | A one-bit function that gives the same answer for 0 and for 1. | f(0) = f(1). | `q5-problem:b1` | — |
| `qc-balanced` | balanced function | A function that gives 0 for half its inputs and 1 for the other half. | \|f⁻¹(0)\| = \|f⁻¹(1)\|. | `q5-problem:b1` | — |
| `qc-deutsch-problem` | Deutsch's problem | Decide whether a hidden one-bit function is constant or balanced. | Compute f(0) ⊕ f(1) with oracle access to f. | `q5-problem:b2` | — |
| `qc-oracle` | oracle | A gate we may use but not look inside; here the f-CNOT U_f. | U_f\|x⟩\|y⟩ = \|x⟩\|y ⊕ f(x)⟩. | `q5-oracle:b1` | — |
| `qc-query` | query | One use of an oracle. | One application of U_f. | `q5-oracle:b1` | — |
| `qc-phase-kickback` | phase kickback | With the target in \|−⟩, the oracle's answer comes out as a sign on the control. | U_f\|x⟩\|−⟩ = (−1)^{f(x)}\|x⟩\|−⟩. | `q5-oracle:b3` | — |
| `qc-phase-oracle` | phase oracle | The sign gate that f becomes on the input qubit alone. | O_f = Σ_x(−1)^{f(x)}\|x⟩⟨x\|. | `q5-oracle:b4` | — |
| `qc-toffoli` | Toffoli gate | A three-bit gate that flips the third bit when the first two are both 1. | (a, b, c) ↦ (a, b, c ⊕ ab). | `q5-oracle:b5` | — |
| `qc-quantum-parallelism` | quantum parallelism | One query on a superposed input puts every value of f into one state. | U_f Σ_x\|x⟩\|0⟩ = Σ_x\|x, f(x)⟩. | `q5-one-value:b1` | — |
| `qc-walsh-hadamard` | Walsh–Hadamard transform | An H on every qubit. | H^{⊗n}; H^{⊗n}\|0⟩^{⊗n} = 2^{−n/2}Σ_x\|x⟩. | `q5-one-value:b3` | — |
| `qc-beam-splitter` | beam splitter | A half-silvered mirror that sends a photon on in two directions at once. | a† ↦ (a† + b†)/√2, b† ↦ (b† − a†)/√2. | `q5-interferometer:b1` | — |
| `qc-phase-shifter` | phase shifter | A piece of glass on one arm that adds a phase to that arm's amplitude. | U_φa†U_φ† = e^{iφ}a†. | `q5-interferometer:b2` | `l2-complex` |
| `qc-mach-zehnder` | Mach–Zehnder interferometer | Two splitters, two mirrors and phase shifters: one photon, two paths, recombined. | U_BS2U_φ₁U_φ₀U_BS1 (Eq. 1.18). | `q5-interferometer:b2` | — |
| `qc-adiabatic-computing` | adiabatic computing | Computing by changing an energy operator so slowly that the system stays in its lowest state. | ℋ(s) = (1 − s)ℋ₀ + sℋ₁, s = t/t_f. | `q5-other-models:b1` | `l6-generator` |
| `qc-spectral-gap` | gap | The distance between the two lowest energy levels. | Δ(s) = E₁(s) − E₀(s). | `q5-other-models:b1` | — |
| `qc-measurement-based` | measurement-based computing | Computing by measuring qubits of a prepared entangled state, one after another. | One-way computing on a cluster state. | `q5-other-models:b3` | — |
| `qc-cluster-state` | cluster state | A many-qubit state made by CZ gates on qubits in \|+⟩. | Π CZ_{ij}\|+⟩^{⊗n}. | `q5-other-models:b3` | — |
| `qc-byproduct` | byproduct | A known extra Pauli gate left by a random measurement result. | X or Z fixed by the outcome, removed by relabelling. | `q5-other-models:b4` | — |

Reused: `qc-interference`, `qc-phase` (F1); `qc-hadamard` (Q2); `qc-cnot`, `qc-xor`, `qc-controlled-gate`,
`qc-phase-gate`, `qc-global-phase` (Q4).

## 6. Review card per unit (both tracks)

### `q5-problem`
- **G points:** (1) Four one-bit functions: two constant, two balanced. (2) The question is one bit, f(0) ⊕ f(1). (3) A classical computer must look twice.
- **F points:** (1) Deutsch's problem as oracle access. (2) Bergou ⚑ P1.3(a). (3) f(0) fits one constant and one balanced f.
- **Equations:** $f\ \text{constant} \iff f(0) \oplus f(1) = 0$
- **Trap:** deciding from one value: always 1 and copy share f(1) = 1.

### `q5-oracle`
- **G points:** (1) U_f adds f(x) to y with XOR. (2) It undoes itself, so it is unitary. (3) With y = \|−⟩ the answer comes back as a sign on x. (4) Any classical f can be made reversible with Toffoli gates.
- **F points:** (1) U_f is a permutation matrix. (2) Eq. 1.13 and O_f. (3) N&C §1.4.1.
- **Equations:** $U_f|x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle,\quad U_f|x\rangle|-\rangle = (-1)^{f(x)}|x\rangle|-\rangle$
- **Trap:** thinking the target changes: \|−⟩ stays \|−⟩.

### `q5-one-value`
- **G points:** (1) A superposed query holds f(0) and f(1) at once. (2) A reading returns one pair (x, f(x)). (3) H on each of n qubits makes all 2ⁿ inputs.
- **F points:** (1) Eq. 1.16 = N&C Eq. 1.37. (2) N&C Eqs. 1.38–1.40. (3) Coherent branches differ from a coin.
- **Equations:** $U_f\,\tfrac1{\sqrt2}(|0\rangle + |1\rangle)|0\rangle = \tfrac1{\sqrt2}\big(|0, f(0)\rangle + |1, f(1)\rangle\big)$
- **Trap:** "parallelism reads out every value": one reading gives one.

### `q5-deutsch`
- **G points:** (1) Start from \|0⟩\|−⟩; H, U_f, H on the top. (2) The kickback writes (−1)^{f(x)} on each branch. (3) The last H makes the branches interfere. (4) Constant reads 0, balanced reads 1, with one query.
- **F points:** (1) Eqs. 1.10–1.15. (2) N&C Eq. 1.45, ± a global phase. (3) Only f(0) ⊕ f(1) is learned.
- **Equations:** $|\psi_3\rangle = \pm|f(0) \oplus f(1)\rangle|-\rangle$
- **Trap:** reading the ± as information about f(0).

### `q5-interferometer`
- **G points:** (1) A splitter puts one photon in two arms. (2) Output chances depend only on the phase difference. (3) Phases 0 or 180° act as f: equal goes out port 1. (4) Reading the arm destroys the effect.
- **F points:** (1) Eqs. 1.17–1.18 with Fig. 1.7's mirrors. (2) R_y(−90°)ΦR_y(90°) = Z(HΦH)Z. (3) P₁ = cos²(Δφ/2).
- **Equations:** $|\psi_{out}\rangle = \tfrac12(e^{i\varphi_0} + e^{i\varphi_1})|1_{out}\rangle + \tfrac12(e^{i\varphi_1} - e^{i\varphi_0})|2_{out}\rangle$
- **Trap:** applying the splitter rule twice with the same labels: it sends equal phases to the wrong port.

### `q5-other-models`
- **G points:** (1) Adiabatic: change the energy operator slowly and stay in the lowest state. (2) The smallest gap sets the speed. (3) Measurement-based: CZ plus a reading in \|±θ⟩ applies W(θ). (4) A random result leaves a known X, fixed by relabelling.
- **F points:** (1) Eq. 1.19. (2) Eqs. 1.20–1.21. (3) W(θ)X = e^{iθ}ZW(−θ).
- **Equations:** $\mathcal H(s) = (1 - s)\mathcal H_0 + s\mathcal H_1,\quad W(\theta) = HP(\theta)$
- **Trap:** thinking a random measurement result spoils the computation.

## 7. Symbol-before-use tables

Abbreviations: pr, or, ov, de, in, om. Carried from Q4 and mapped to `q5-problem` as a recap: \|0⟩, \|1⟩, \|±⟩, X, Z, H,
P(χ), CNOT, CZ, ⊕, ⊗, qubit 0 = top wire, \|ψ⟩, e^{iφ}, i, eigenvalue, ħ (Formal).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $f$, $f(0)$, $f(1)$, $x$ | pr:b1 | pr:b1 | OK | x is a bit here, the top wire's value. |
| box `f` / $U_f$ | pr:b1 stage, or:b1 | or:b1 | **FLAG** | Unit 1 labels the box `'f'`; the name U_f starts at or:b1. |
| $y$ | or:b1 | or:b1 | OK | The bottom wire. |
| $(-1)^{f(x)}$ | or:b3 | or:b3 | OK | — |
| Toffoli | or:b5 | or:b5 | OK | — |
| $2^n$, $n$ | ov:b3 | Q4 re:b3 | OK | — |
| $a$, $b$ (arms) | in:b1 | in:b1 | **FLAG** | Arm names, not kets of a basis; \|a⟩, \|b⟩ appear once. |
| $\varphi_0$, $\varphi_1$ | in:b2 | in:b2 | **FLAG** | Bergou's phase shifts; not the azimuth φ (stated in place). |
| $\mathcal H_0$, $\mathcal H_1$, $\mathcal H(s)$, $s$ | om:b1 | om:b1 | OK | ℋ, never the Hadamard H. |
| gap, 1.414 | om:b1–b2 | om:b1 | OK | — |
| $W(\theta)$, $\theta$, $\vert\pm\theta\rangle$ | om:b3 | om:b3 | **FLAG** | θ is a gate angle here, not the polar angle. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| f ≡ 0, f ≡ 1, id, x̄ | pr:b1 | pr:b1 | OK | x̄ = 1 − x. |
| $O_f$ | or:b4 | or:b4 | OK | — |
| $\vert\psi_k\rangle$, $\vert\cdot\rangle_1$, $\vert\cdot\rangle_2$ | de:b1 | de:b1 | OK | Bergou's labels; subscripts are his qubit numbers. |
| $H^{\otimes n}$ | ov:b3 | ov:b3 | OK | — |
| $a^\dagger$, $b^\dagger$, $\vert\mathrm{vac}\rangle$ | in:b1 | in:b1 | OK | Mode operators named, not developed (Q24). |
| $U_{BS}$, $U_\varphi$ | in:b2 | in:b2 | OK | — |
| $t_f$, $i\hbar\,d/dt$ | om:b1 | om:b1 | **FLAG** (minor) | Schrödinger's equation is quoted, not derived; bridged to `l6-generator`. |

**Counts:** Ground 4 FLAGs, Formal 1 FLAG, all resolved in place.

## 8. Errata

Bergou's physics is right; two equations need their conditions stated. Items were checked in the maths and on the page
renders of pp. 8 and 10 (img); every `Correction` is paraphrased, source `'bergou'`.

### 8.1 Corrections (errata box, with `check()`)
| # | Where | Bergou says (paraphrased) | It should say | `check` |
|---|---|---|---|---|
| B1 (map) | p. 8, Eq. 1.18 (img + math) | The output state follows from the two splitters of Eq. 1.17 with the phase shifters between. | Applying Eq. 1.17 at both splitters with the same a, b labels sends equal phases to b (output 2). Eq. 1.18 holds with Fig. 1.7's geometry: the mirrors bring each arm into BS2 through the other port, and a†, b† then name outputs 1 and 2. | `V.q5Mz118 === 1 && V.q5MzNaive[1] === 1` |
| B-new-1 | p. 10 (img + math) | W(θ)σ_x = σ_zW(−θ). | W(θ)σ_x = e^{iθ}σ_zW(−θ): equal up to a global phase, which changes no reading, so the argument stands. | `V.q5WIdentPhase === 1 && V.q5WIdentBare === 0` |

### 8.2 Silent fixes and notes (no box)
| # | Where | Point | Action |
|---|---|---|---|
| B-new-2 | p. 10 (img) | After the outcome \|+θ⟩ the text writes the total state as \|−θ⟩₁\|W(θ)ψ⟩₂\|+x⟩₃. | Should be \|+θ⟩₁; qubit 1 is already read, so nothing downstream changes (§12 Q4). |
| — | p. 10 | For the −θ′* outcome Bergou writes σ_zσ_xW(θ′)W(θ)ψ. | The chain gives σ_xσ_z…, which is −σ_zσ_x…: a global phase (`q5ZXvsXZ`). |
| — | p. 5 | \|y + f(x)⟩ | The sum is mod 2, as Bergou says; Rosetta in `q5-oracle:b1`. |
| — | p. 7 | \|0⟩ in Eq. 1.17 | The vacuum; written \|vac⟩ here (Rosetta, `q5-interferometer:b1`). |
| — | p. 9 | The gap condition is qualitative. | The two-level example of `q5-other-models:b2` is labelled ours. |
| — | N&C p. 32 | Fig. 1.19 starts from \|01⟩, Bergou from \|0⟩\|−⟩. | The same state after N&C's first Hadamards (`q5NCsame`); `q5-deutsch:b4`. |

**Checked and correct:** Bergou Eqs. 1.10–1.16 (all four f, amplitude by amplitude), Eq. 1.17 (a unitary 50–50 splitter),
Eq. 1.19, Eq. 1.20, Eq. 1.21 (term by term), the \|±θ⟩ and \|±θ′*⟩ branch rules and the relabelling argument (p. 10); P1.3.
N&C Eqs. 1.37–1.45, the Toffoli table (Fig. 1.14) and H^{⊗n} (Eqs. 1.38–1.39).

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
**None new; E1 is a prerequisite.** Every interferometer circuit and `C_HOH` is a one-qubit circuit, so Q5 builds after
the E1 fix (`P-Q4-story.md` §9.1). The map's `bsMatrix`/`machZehnder`, `adiabaticGap` and `mbqcStep` are not needed:
- The interferometer is the circuit R_y(90°), P(χ) or O_f, R_y(−90°), which reproduces Eq. 1.18 exactly (`q5Mz118`).
- The gap is `eigh(ℋ(s))` (`qc/cmat.ts`), and the arrow is `decomposeHermitian` (`operators.ts`).
- The measurement-based step is `branches(C_MB)` (`qc/circuit.ts`).
- *Optional*, only if the judge wants the mode picture: one small function `machZehnder(φ₀, φ₁, {mirrorSwap})` in a new
  `qc/optics.ts`. Its numpy twin is the mode construction in `q45plan-numpy.py` (X·BS·X·Φ·BS), with a test that the
  naive form sends equal phases to output 2. Fallback: the circuit form used here.

Existing and sufficient: `qc/gates.ts` (`oracleXor`, `oraclePhase`, `toffoli`, `walshHadamard`, `Ry`, `P`, `H`, `X`,
`Z`), `qc/circuit.ts` (`runCircuit`, `branches`), `qc/measure.ts` (`marginal`, `measureQubit`, `measureInBasis`,
`probs`), `qc/bits.ts` (`isConstant`, `isBalanced`, `xor`), `qc/cmat.ts` (`eigh`, `kronM`), `operators.ts`, `spin.ts`.

### 9.2 Stage contract
No new kinds or fields. The map's `optics-bench` becomes `circuit` + `amplitudes` with `wires:['photon']` (captions name
the arms and outputs), and its `energy-ladder` becomes `operator-space` (arrow = half the gap, `labels:'plain'`) plus a
`bloch` sweep. Checks for the builder: (a) oracle boxes show their `label` (`'f'`, `'U_f'`, `'O_f'`); a phase-mode
oracle is a one-wire box; (b) custom `wires` labels draw; (c) `C_MZW`'s mid-circuit measurement with `outcomes:'0'`
passes `validateLayout` in a split; (d) `ops` takes the authored entries `'-1/2'`, `'1/2'` with `eigen:true`; (e)
`C_MB` with `outcomes:'0'` and `'1'`; (f) `amp{dials:true}` shows the complex amplitudes of in:b1–b2; (g) a Toffoli
draws two control dots.

### 9.3 Widget gaps
W1 `circuit-lab` as in `P-Q4-story.md` §9.3; the §3 fallbacks use `bloch`, `phase-dial` and `deposit-stats`.

## 10. Media
- **Opener:** the Part II opener is planned in Q4 §10 from this chapter's `C_D` data.
- **Film (deferred) `qc-q5-two-paths`** "Two paths, one photon": φ₁ swept from 0° to 180°; manifest `q5MzSweep`,
  `q5MzHalf`, `q5MzF`.
- **Film (deferred) `qc-q5-deutsch`** "Deutsch: the answer lands on the top qubit": manifest `q5D1`, `q5D2`, `q5D3`,
  `q5DTop1`.
- **Decor (Higgsfield, credits need the user):** a dark optical table with two cube beam splitters, two mirrors and a
  faint beam; no text, no numbers, no diagrams.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-deutsch-problem` | Deutsch's problem: constant or balanced | Q5 · `q5-problem` | `qc-cnot` | — |
| `qc-oracle-kickback` | Oracles and phase kickback | Q5 · `q5-oracle` | `qc-deutsch-problem`, `qc-circuits` | — |
| `qc-quantum-parallelism` | Quantum parallelism and its limit | Q5 · `q5-one-value` | `qc-oracle-kickback`, `qc-readout` | — |
| `qc-deutsch-algorithm` | Deutsch's algorithm | Q5 · `q5-deutsch` | `qc-quantum-parallelism` | — |
| `qc-mach-zehnder` | The interferometer version | Q5 · `q5-interferometer` | `qc-deutsch-algorithm`, `qc-photon-frames`, `qc-phase` | — |
| `qc-other-models` | Adiabatic and measurement-based computing | Q5 · `q5-other-models` | `qc-deutsch-algorithm`, `qc-spectral` | — |

All bridge ids used here exist (`qc-l1-sequential`, `qc-l3-postulates`, `qc-l6-generator`).

**Future bridges (TODO; targets not built):** F7 Boolean functions (`q5-problem:b1`), Q14 Deutsch–Jozsa (`q5-one-value:b3`),
Q15 adiabatic search (`q5-other-models:b1`), Q22 Hamiltonian dynamics (`q5-other-models:b1`), Q24 optical qubits
(`q5-interferometer:b1`), Q8 entanglement (cluster states, `q5-other-models:b3`).

### 11.2 Arcade (5 levels)
Label constant: `const Q5x = (unit, label) => ({ lecture: 'Q5', unit, label })`. All five are Spot the error.
1. **`q5-problem` · `qc-one-look`** — "One look is enough?"
   - Steps: "$f$ maps $\{0,1\}$ to $\{0,1\}$." · "There are four such functions: two constant, two balanced." · "We evaluate $f(0)$ and find $0$." · "So $f$ is constant."
   - `wrong: 3`. Why: copy also has f(0) = 0 and is balanced (`q5Const`).
2. **`q5-oracle` · `qc-kickback-target`** — "Where did the sign go?"
   - Steps: "$U_f|x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle$." · "Take $y$ in $|-\rangle = (|0\rangle - |1\rangle)/\sqrt2$." · "If $f(x) = 1$ the target becomes $(|1\rangle - |0\rangle)/\sqrt2$." · "So the target qubit has changed state."
   - `wrong: 3`. Why: (\|1⟩ − \|0⟩)/√2 = −\|−⟩, the same state; the sign multiplies the whole term and lands on \|x⟩ (`q5XMinus`).
3. **`q5-deutsch` · `qc-deutsch-sign`** — "One query, one bit"
   - Steps: "Deutsch's circuit ends in $\pm|f(0) \oplus f(1)\rangle|-\rangle$." · "Reading the top qubit gives $f(0) \oplus f(1)$." · "For $f \equiv 1$ the state is $-|0\rangle|-\rangle$." · "The minus sign tells us that $f(0) = 1$."
   - `wrong: 3`. Why: a global sign is invisible to every reading (`q5ConstSame`).
4. **`q5-interferometer` · `qc-which-path`** — "Knowing the arm"
   - Steps: "After the first splitter the photon is in $(|a\rangle + |b\rangle)/\sqrt2$." · "With equal phases it always leaves by output 1." · "A detector on arm $b$ clicks half the time." · "So with the detector in place it still always leaves by output 1."
   - `wrong: 3`. Why: reading the arm collapses the photon to one arm; output 1 then happens half the time (`q5WhichPathOut1`).
5. **`q5-other-models` · `qc-byproduct-phase`** — "Moving the byproduct"
   - Steps: "$W(\theta) = H\,P(\theta)$." · "So $W(\theta)X = H\,P(\theta)\,X$." · "$P(\theta)X = e^{i\theta}X\,P(-\theta)$, and $HX = ZH$." · "So $W(\theta)X = Z\,W(-\theta)$ exactly, with no phase."
   - `wrong: 3`. Why: the steps give W(θ)X = e^{iθ}ZW(−θ) (`q5WIdentPhase`); Bergou's identity holds up to this global phase.

## 12. Questions for the judge

**Q1. Unit order.** The map puts `q5-one-value` after the interferometer; this plan puts it before `q5-deutsch`
(N&C §1.4.2 then §1.4.3), so the learner meets parallelism and its limit before the interference that beats it.
*Recommend:* N&C's order. Bergou's Eq. 1.16, which follows his Deutsch derivation, is cited in `q5-one-value:b1`.

**Q2. The interferometer without an optics module.** The circuit R_y(90°), Φ, R_y(−90°) reproduces Eq. 1.18 exactly,
and `q5-interferometer:b4` shows it equals Deutsch's H, O_f, H up to Z on the ports. *Recommend:* the circuit form now;
`machZehnder` and the `optics-bench` kind wait for Q24, which needs them anyway.

**Q3. The adiabatic example is ours.** Bergou gives no example of ℋ(s); `q5-other-models:b2` uses ℋ₀ = −X, ℋ₁ = −Z
(gap √2 at s = ½), shown on `operator-space` and `bloch`. *Recommend:* keep it, labelled "our example", in units where
ħ = 1 and energies are pure numbers; Q22 owns Hamiltonian dynamics.

**Q4. How to box Bergou's p. 8 and p. 10 items.** B1 (the mirror geometry of Eq. 1.18) and B-new-1 (W(θ)σ_x =
σ_zW(−θ) only up to e^{iθ}) state equations that fail as written. B-new-2 (\|−θ⟩₁ for \|+θ⟩₁) is a typo with no
consequence. *Recommend:* box B1 and B-new-1 in Bergou's voice, as in §8.1; keep B-new-2 silent.

**Q5. Bergou's problems.** Q5 works ⚑ P1.3 in full (`q5-problem:b1`, `q5-oracle:b2`, `q5-p-which`); P1.5 (the SWAP
test) is not used. No sheet assigns them. *Recommend:* as in `P-Q4-story.md` §12 Q4: keep the walkthroughs, and ask the user when a new 709
sheet is ingested.

**Q6. Scope of §1.6 in the Ground track.** Adiabatic and measurement-based computing are brief in Bergou and far from
the chapter's driving question. *Recommend:* keep both tracks, as planned (four [L] beats and a clue); the alternative
is Formal-only beats, which would make `q5-other-models` the only unit with an empty Ground track.

**Q7. E1 first.** Q5's interferometer depends on the engine fix. *Recommend:* build Q5 after the Q4 merge that carries
E1 (see `P-Q4-story.md` §12 Q2).
