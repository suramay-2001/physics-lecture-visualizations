# P-Q16-story — Q16 "One query, many answers: Deutsch–Jozsa and Bernstein–Vazirani" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q14-story.md`'s 13 sections, one line per field. Standing
gates: ≥ 2 distinct derivation views per track (W-709 #7); one notation beat per new notation (W-709 #8). Map row:
`P-709-map.md` §8 (drafted as "Q14"; `outline.ts` now numbers it Q16, first chapter of Part VII). **Phase `'books'`:**
ramp beats `[B]`, clues `[C]`; no 709 notes cover Ch. 7 yet.

**Sources read** (paraphrased). Bergou Ch. 7 (printed = PDF − 10): §7.1 Deutsch–Jozsa pp. 117–119 (Fig. 7.1, Eqs.
7.1–7.7); §7.2 Bernstein–Vazirani pp. 119–120 (Eqs. 7.8–7.12); P7.3 p. 143 (⚑, BV variant: cited only). Page renders
checked: pp. 117, 119. N&C (printed = PDF − 28): §1.4.4 pp. 34–36 (Eqs. 1.46–1.51, Fig. 1.20; deterministic cost
$2^n/2 + 1$, the probabilistic remark).

**Ownership.** Q5 owns the oracle, the query, the phase kickback, the phase oracle, constant/balanced for one bit, the
Walsh–Hadamard transform on $|0\cdots0\rangle$ and Deutsch's algorithm (`qc-walsh-hadamard`, `qc-phase-kickback`,
`qc-phase-oracle`, `qc-query` are reused, never redefined). Q4 owns XOR and CNOT. F7 (planned, not built) will own GF(2):
Q16 defines the bit dot product itself, in one notation beat. **Q16 owns:** the sign formula for $H^{\otimes n}|x\rangle$, the
Walsh sum, the $n$-bit promise problem, DJ's one-query answer, the classical query costs, BV's hidden string.

**Evidence.** `plan709q-q16.py` (scratchpad): route A dense $2^n$ matrices for both of Bergou's circuit forms (ancilla
and phase), brute-force enumeration (Walsh sums; random-query misses over all $k$-subsets) and an exact minimax over every
classical decision tree for $n = 1, 2, 3$; route B the closed forms. 15 paired checks, **0 mismatches**, plus exhaustive tables ($H^{\otimes n}$ entries for $n = 2, 3$; all 32 BV pairs; four DJ functions in both circuit forms).

**Conventions.** $n$ input bits, $N = 2^n$; q0 is the top wire and the most significant bit (circuit.ts). $x\cdot z =
\sum_j x_jz_j \bmod 2$. Running examples: $n = 3$; `F_BALN` = 1 on $\{1,2,3,4\}$ (balanced, not linear), table
`[0,1,1,1,1,0,0,0]`; `F_BAL` $= x\cdot101$, table `[0,1,0,1,1,0,1,0]`; `F_ONE` constant 1; BV: $n = 4$, $a = 1011$, $b = 1$.
Cross-references read "Unit 16.2", "Chapter Q5". Claim keys `q16…`; twins `pipeline/claims_qc709/q16.py`.

**Stage shorthand.** `circ(C,k)` = `{kind:'circuit', circuit:C, upTo:k}` · `amp(C,k,m)` = `{kind:'amplitudes',
state:{circuit:C, upTo:k}, mode:m}` · `split(a / b)`. In `'signed'` mode the kind draws the mean line: after the query it is
$2^{-n/2}$ times the all-zeros output amplitude, so "the signs cancel" is read straight off it (a `complex-plane` chain of
$\pm1$ arrows was considered and dropped: 0°/180° arrows overlap on one line).

**Circuits.** `C_H1` init `1`: [H]. `C_H2(x)` init x: [H, H]. `C_H3(x)`: [H×3]. `C_HH3(x)`: [H×3], [H×3]. `C_DJA(f)` (Bergou
Fig. 7.1) wires x₂, x₁, x₀, target; init `000-`: [H×3], [oracle xor, table f, inputs 0–2, target 3], [H×3]. `C_DJ(f)` (phase
form) init `000`: [H×3], [oracle phase, table f], [H×3]. `C_CLQ(x)` init `x0`: [oracle xor F_BALN] (one classical query).
`C_BV` init `0000`: [H×4], [oracle phase, table $a\cdot x \oplus b$], [H×4]. `C_BVQ(x)` 5 wires, init `x0`: [oracle xor BV].

## 0. Chapter map
**Driving question:** "How can one question to a black box reveal a pattern hidden across all of its inputs?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q16-hadamard-n` | Hadamards on every wire, signs everywhere | What does $H^{\otimes n}$ do to a string? | Bergou pp. 117–118 (7.1–7.2), 120 (7.10–7.11) | Q5 `qc-walsh-hadamard`, Q4 `qc-xor` |
| 2 | `q16-dj` | Constant or balanced in one query | Can one query settle an $n$-bit promise? | Bergou pp. 117–119 (Fig. 7.1, 7.3–7.7); N&C pp. 34–36 | Q5 `qc-phase-kickback`, `qc-balanced` |
| 3 | `q16-classical-cost` | What one quantum query beats | How many queries does a classical computer need? | Bergou p. 117; N&C p. 35 | Q5 `qc-query` |
| 4 | `q16-bv` | A hidden string in one query | Can one query read $n$ hidden bits? | Bergou pp. 119–120 (7.8–7.12) | Unit 16.1 |

**Outcomes:** write $H^{\otimes n}|x\rangle$ with its signs and use $\sum_x(-1)^{x\cdot z} = 2^n\delta_{z0}$ · run DJ and read
the all-zeros amplitude as the average of $(-1)^{f(x)}$ · state the classical costs: $2^{n-1}+1$ exact, a few queries with a
small error · run BV and explain why it returns $a$ but not $b$. **Prerequisites:** `qc-deutsch-algorithm`,
`qc-oracle-kickback`, `qc-quantum-parallelism`, `qc-registers`, `qc-cnot`. **Openers:** the Part VII Blender opener is a
Grover picture (map §8); it belongs before Unit 17.2, not here (R6).

## 1. Story beats per unit
Kinds: circuit and amplitudes in every unit. Every amplitude view is real, so `mode:'signed'` is valid throughout.

### Unit `q16-hadamard-n` — Hadamards on every wire, signs everywhere
**b1 [B]** (one wire) · Terms `qc-hadamard` (Q4), `qc-walsh-hadamard` (Q5)
- G: "One Hadamard sends $|0\rangle$ to $|+\rangle$ and $|1\rangle$ to $|-\rangle$. Both are even mixes; only the sign of $|1\rangle$ remembers the input. Chapter Q5 put an H on every wire of $|00\cdots0\rangle$."
- F: "$H|x\rangle = (|0\rangle + (-1)^x|1\rangle)/\sqrt2$ for $x \in \{0,1\}$. Chapter Q5's Walsh–Hadamard transform $H^{\otimes n}$ took $|0\rangle^{\otimes n}$ to the uniform state; here the input is any string."
- Cap: G/F "$H|1\rangle$: bars $+0.7071$ and $-0.7071$" · Stage `split(circ(C_H1,1) / amp(C_H1,1,'signed'))` · Claims `q16H1Minus` (−0.7071).

**b2 [B] · notation beat, `introduces: ['qc-bit-dot']`** (the sign rule; D1) · Terms `qc-bit-dot`
- G: "Write $x \cdot z$ for the [[qc-bit-dot|bit dot product]]: multiply matching bits, add, keep the last bit. Then each string $|z\rangle$ gets the sign $(-1)^{x\cdot z}$, with size $2^{-n/2}$."
- F: "With $x\cdot z = \sum_j x_jz_j \bmod 2$, $H^{\otimes n}|x\rangle = 2^{-n/2}\sum_z(-1)^{x\cdot z}|z\rangle$ (Eqs. 7.1–7.2). For $x = 11$: $\tfrac12(|00\rangle - |01\rangle - |10\rangle + |11\rangle)$."
- Cap: G/F "$H\otimes H|11\rangle$: $+0.5, -0.5, -0.5, +0.5$" · Stage `split(circ(C_H2('11'),1) / amp(C_H2('11'),1,'signed'))` · Claims `q16H2Neg` (−0.5), `q16H2Pos` (0.5) · Derivation D1.

**b3 [B]** (the transform undoes itself; D2)
- G: "Apply the Hadamards twice and you are back at $|x\rangle$. The signs cancel everywhere except at the start. Adding eight signs for $z \neq 000$ always gives 0."
- F: "$\sum_x(-1)^{x\cdot z} = 2^n\delta_{z,0}$ (Eqs. 7.10–7.11): pair the terms with $x_k = 0$ and $x_k = 1$ for any $k$ with $z_k = 1$. Hence $(H^{\otimes n})^2 = I$; $|101\rangle \to \pm0.3536$ bars $\to |101\rangle$."
- Cap: G/F "two Hadamard columns return $|101\rangle$ with chance 1" · Stage `split(circ(C_HH3('101'),2) / amp(C_HH3('101'),2,'probability'))` · Claims `q16H3Amp` (0.3536), `q16HHBack` (1), `q16WalshZ010` (0), `q16WalshZ000` (8) · Derivation D2.

**b4 [C]** (how many minus signs)
- Q G: "Apply $H^{\otimes3}$ to $|101\rangle$. Of the eight strings, how many get a minus sign?" · Q F: "For $x = 101$, count the $z$ with $x\cdot z = 1$. What holds for every $x \neq 000$?"
- Reveal G: "Four: 001, 011, 100 and 110. Every nonzero $x$ splits the strings in half, so the signs average to zero." · Reveal F: "$x\cdot z = 1$ for exactly $2^{n-1}$ strings when $x \neq 0$, so the mean amplitude is 0; only $x = 0$ gives all plus."
- Cap: G/F "$H^{\otimes3}|101\rangle$: four bars up, four down, mean 0" · Stage q `circ(C_H3('101'),0)`; reveal `split(circ(C_H3('101'),1) / amp(C_H3('101'),1,'signed'))` · Claims `q16MinusCount` (4).

### Unit `q16-dj` — Constant or balanced in one query
**b1 [B]** (the promise) · Terms `qc-promise-problem`, `qc-deutsch-jozsa`, `qc-balanced` (Q5)
- G: "Now $f$ reads $n$ bits and returns one bit. We are promised it is constant or balanced, nothing in between. Which is it? Bergou's circuit asks once."
- F: "Deutsch–Jozsa: $f : \{0,1\}^n \to \{0,1\}$ is promised constant or balanced (Bergou §7.1). Fig. 7.1 puts $n$ wires in $|0\rangle$ and the target in $|{-}\rangle$, then $H^{\otimes n}$, one f-CNOT, $H^{\otimes n}$."
- Cap: G/F "Bergou's circuit: three input wires, one target in $|-\rangle$" · Stage `circ(C_DJA(F_BALN),0)`.

**b2 [B]** (the query becomes signs)
- G: "With the target in $|-\rangle$, the query writes $f$ as signs (Chapter Q5). After it, each of the eight strings has size $0.3536$ and sign $(-1)^{f(x)}$."
- F: "Kickback (Eq. 7.4) turns the f-CNOT into the phase oracle: $|\psi_2\rangle = 2^{-n/2}\sum_x(-1)^{f(x)}|x\rangle$ (Eq. 7.5). For this balanced $f$ four signs are minus and the mean amplitude is 0."
- Cap: G "after the query: four bars up, four down" · F "$|\psi_2\rangle$ for a balanced $f$: mean 0" · Stage `split(circ(C_DJ(F_BALN),2) / amp(C_DJ(F_BALN),2,'signed'))` · Claims `q16DjBar` (0.3536), `q16DjMean` (0).

**b3 [B]** (read the all-zeros amplitude; D3)
- G: "The last Hadamards make the $|000\rangle$ amplitude the average of the eight signs. Balanced: they cancel, 0. Constant: all agree, $\pm1$. One reading decides, for certain."
- F: "$\langle0|\psi_\text{out}\rangle = 2^{-n}\sum_x(-1)^{f(x)}$ (Eq. 7.7): 0 if balanced, $(-1)^{f(0)}$ if constant ($-1$ for $f \equiv 1$). All zeros means constant; anything else, balanced; one query."
- Cap: G/F "a balanced $f$: the chances sit on four strings, none on $000$" · Stage `split(circ(C_DJ(F_BALN),3) / amp(C_DJ(F_BALN),3,'probability'))` · Claims `q16DjBalnZero` (0), `q16DjBalnP` (0.25 each), `q16DjConstAmp` (−1) · Derivation D3.

**b4 [C]** (a linear balanced f)
- Q G: "Take $f(x) = x\cdot101$, also balanced. Where does the output land now?" · Q F: "For the linear balanced $f(x) = x\cdot101$, what is $|\psi_\text{out}\rangle$?"
- Reveal G: "On $|101\rangle$, with chance 1. The signs after the query are exactly $H^{\otimes3}|101\rangle$'s, and the last Hadamards undo them. Unit 16.4 turns this into a method." · Reveal F: "$(-1)^{x\cdot101}$ is the sign pattern of $H^{\otimes3}|101\rangle$, so $|\psi_\text{out}\rangle = |101\rangle$ (Unit 16.1). DJ reads a linear $f$'s coefficient string exactly: that is Bernstein–Vazirani."
- Cap: G/F "a linear balanced $f$: all the chance on $|101\rangle$" · Stage q `circ(C_DJ(F_BAL),3)`; reveal `split(circ(C_DJ(F_BAL),3) / amp(C_DJ(F_BAL),3,'probability'))` · Claims `q16DjBalLands` (1).

### Unit `q16-classical-cost` — What one quantum query beats
**b1 [B]** (exact classical cost; D4) · Terms `qc-query-cost`
- G: "A classical query feeds in one string and reads one bit; the query cost counts them. A balanced $f$ may answer the same to the first half of all inputs. One more settles it: $2^{n-1}+1 = 5$ for $n = 3$."
- F: "Deterministically, an adversary answers the first $2^{n-1}$ distinct queries alike, so $2^{n-1}+1$ are needed and enough (Bergou p. 117): 5 for $n = 3$ (an exact minimax over all strategies agrees), 513 for $n = 10$."
- Cap: G/F "one classical query: input 011 in, $f(011) = 1$ on the target" · Stage `split(circ(C_CLQ('011'),1) / amp(C_CLQ('011'),1,'probability'))` · Claims `q16ClqBit` (1), `q16DetWorst3` (5), `q16DetWorst10` (513) · Derivation D4.

**b2 [B]** (random queries, small error) · Terms `qc-bounded-error`
- G: "Query random inputs instead. If three different inputs agree, a balanced $f$ did that only $0.1429$ of the time for $n = 3$. Ten agreeing queries for $n = 10$: $0.0019$."
- F: "Allowing a bounded error: with $k$ distinct random queries, a balanced $f$ looks constant with probability $2\binom{N/2}{k}/\binom{N}{k}$, about $2^{1-k}$: $0.1429$ ($N = 8$, $k = 3$), $0.0019$ ($N = 1024$, $k = 10$), independent of $n$ in the limit."
- Cap: G/F "another query: input 110, $f(110) = 0$" · Stage `split(circ(C_CLQ('110'),1) / amp(C_CLQ('110'),1,'probability'))` · Claims `q16Miss8k3` (0.1429), `q16Miss1024k10` (0.0019), `q16ClqBit110` (0).

**b3 [C]** (how big is the advantage)
- Q G: "One quantum query against 513 classical ones for $n = 10$. Is that an exponential speed-up in practice?" · Q F: "Against which classical model is DJ's advantage exponential, and against which is it constant?"
- Reveal G: "Only against a classical computer that must never err. Allow a tiny error and about ten random queries do, for any $n$. DJ's real gift is certainty." · Reveal F: "Exact (zero-error) query cost: 1 versus $2^{n-1}+1$. Bounded-error cost: $O(1)$ classically too. The separation is for exact algorithms in the query model."
- Cap: G/F "one quantum query, a certain answer" · Stage q `circ(C_DJA(F_BALN),3)`; reveal `split(circ(C_DJ(F_BALN),3) / amp(C_DJ(F_BALN),3,'probability'))` · Claims `q16DetWorst10`, `q16Miss1024k10` (reused).

### Unit `q16-bv` — A hidden string in one query
**b1 [B]** (the problem) · Terms `qc-bernstein-vazirani`, `qc-hidden-string`
- G: "Now $f(x) = a\cdot x \oplus b$, with a hidden string $a$ and a hidden bit $b$. Classically, query $0000$ for $b$, then each single-1 string for one bit of $a$: five queries for $n = 4$."
- F: "Bernstein–Vazirani: $f(x) = a\cdot x + b \pmod 2$, $a \in \{0,1\}^n$, $b \in \{0,1\}$ (Eq. 7.8). Each classical query yields one bit, so at least $n$; Bergou's method uses $n + 1 = 5$."
- Cap: G/F "a classical query of 1000: $f = 1 \oplus 1 = 0$" · Stage `split(circ(C_BVQ('1000'),1) / amp(C_BVQ('1000'),1,'probability'))` · Claims `q16BvClassical` (5), `q16BvQ1000` (0).

**b2 [B]** (one query; D5)
- G: "Run the same circuit as Unit 16.2. The output is the string $a$ itself: $|1011\rangle$, with amplitude $-1$. All four bits in one query."
- F: "The DJ circuit gives $|\text{out}\rangle = 2^{-n}\sum_{x,y}(-1)^b(-1)^{x\cdot(a\oplus y)}|y\rangle = (-1)^b|a\rangle$ (Eqs. 7.9, 7.12), since the Walsh sum keeps only $y = a$."
- Cap: G/F "one bar: amplitude $-1$ on $|1011\rangle$" · Stage `split(circ(C_BV,3) / amp(C_BV,3,'signed'))` · Claims `q16BvAmp` (−1), `q16BvP` (1) · Derivation D5.

**b3 [B]** (why it works, and what is lost)
- G: "After the query the sixteen signs are $H^{\otimes4}|1011\rangle$'s, times one overall sign $(-1)^b$. The last Hadamards undo the first. The overall sign changes no chance, so $b$ stays hidden."
- F: "$|\psi_2\rangle = (-1)^b H^{\otimes4}|a\rangle$: sixteen bars of size $0.25$, mean 0. $(H^{\otimes n})^2 = I$ returns $(-1)^b|a\rangle$; a global phase is unobservable, so BV learns $a$ and nothing about $b$."
- Cap: G/F "before the last Hadamards: sixteen bars of size $0.25$" · Stage `split(circ(C_BV,2) / amp(C_BV,2,'signed'))` · Claims `q16BvPreAmp` (0.25).

**b4 [C]** (BV inside DJ)
- Q G: "Every $f = a\cdot x \oplus b$ with $a \neq 0$ is balanced. What does Deutsch–Jozsa's 'not all zeros' tell you about it?" · Q F: "For BV functions, relate DJ's verdict to the output string."
- Reveal G: "The output is $a$, so all zeros means $a = 0$: then $f$ is the constant $b$. Otherwise $f$ is balanced. DJ only asks whether the hidden string is zero." · Reveal F: "On BV functions DJ's output is $|a\rangle$: constant ⇔ $a = 0$ (checked for all $n = 4$ cases). DJ reads one bit of the information BV reads in full."
- Cap: G/F "the earlier linear $f$: all the chance on its string $101$" · Stage q `amp(C_BV,3,'probability')`; reveal `split(circ(C_DJ(F_BAL),3) / amp(C_DJ(F_BAL),3,'probability'))` · Claims `q16BalIffA` (true for all 32 pairs).

### 1.5 Claim ledger (key — engine call — value; numpy routes A/B in `plan709q-q16.py`)
- hadamard-n: `q16H1Minus` `run(C_H1)` amp of |1⟩ −0.7071 · `q16H2Neg`, `q16H2Pos` `run(C_H2('11'))` −0.5, 0.5 · `q16H3Amp` `run(C_H3('101'))` |amp| 0.3536 · `q16HHBack` `probs(run(C_HH3('101')))[5]` 1 · `q16WalshZ010`, `q16WalshZ000` `walshSum` 0, 8 · `q16MinusCount` #{z : `dotMod2(101, z)` = 1} 4.
- dj: `q16DjBar`, `q16DjMean` `run(C_DJ(F_BALN))` column 2: 0.3536, `meanAmplitude` 0 · `q16DjBalnZero`, `q16DjBalnP` column 3: amp(000) 0, P = 0.25 on 100–111 · `q16DjConstAmp` `run(C_DJ(F_ONE))` amp(000) −1 · `q16DjBalLands` `probs(run(C_DJ(F_BAL)))[5]` 1.
- classical-cost: `q16ClqBit`, `q16ClqBit110` `run(C_CLQ(·))` target 1, 0 · `q16DetWorst3` `djDeterministicWorst(3)` 5 · `q16DetWorst10` $2^9 + 1$ (formula; minimax-checked $n \le 3$) 513 · `q16Miss8k3`, `q16Miss1024k10` `djRandomMiss` 0.1429, 0.0019.
- bv: `q16BvClassical` queries used by the $n+1$ method run on `bvTable` 5 · `q16BvQ1000` 0 · `q16BvAmp`, `q16BvP` `run(C_BV)` amp(1011) −1, P 1 · `q16BvPreAmp` column 2 |amp| 0.25 · `q16BalIffA` `isBalanced(bvTable(a,b,4))` ⇔ $a \neq 0$ for all 32 pairs.

## 2. Derivations (step `tex` — why — **view**; Ground ≥ Formal; ≥ 2 views each)
A step with no bold view keeps the previous step's view (W-709 #11 inheritance), so every step has a picture.
**D1 · hadamard-n:b2 · result `H^{\otimes n}|x\rangle = 2^{-n/2}\sum_z(-1)^{x\cdot z}|z\rangle`** — Ground (4): (1) `H|x_j\rangle = (|0\rangle + (-1)^{x_j}|1\rangle)/\sqrt2` — one wire at a time · **amp(C_H1,1,'signed')** · (2) `\bigotimes_j(|0\rangle + (-1)^{x_j}|1\rangle)/\sqrt2` — the wires act separately · **circ(C_H2('11'),1)** · (3) the term $|z\rangle$ collects $(-1)^{x_j}$ for each $j$ with $z_j = 1$ · **amp(C_H2('11'),1,'signed')** · (4) `\prod_j(-1)^{x_jz_j} = (-1)^{x\cdot z}` — only parity matters. Formal (3): (1) tensor product of one-wire rules · **circ(C_H2('11'),1)** · (2) `\prod_j(-1)^{x_jz_j} = (-1)^{\sum x_jz_j \bmod 2}` · **amp(C_H2('11'),1,'signed')** · (3) result · **amp(C_H3('101'),1,'signed')**.

**D2 · hadamard-n:b3 · result `\sum_x(-1)^{x\cdot z} = 2^n\delta_{z,0}`** (Eqs. 7.10–7.11) — Ground (4): (1) the sum is a product over bits · **amp(C_H3('010'),1,'signed')** · *the eight signs of $H^{\otimes3}|010\rangle$; mean 0* · (2) a bit with $z_k = 1$ contributes $1 + (-1) = 0$ (same view) · (3) $z = 000$: eight plus signs, total 8 · **amp(C_H3('000'),1,'signed')** · *all plus; mean 0.3536* · (4) so two Hadamard columns return $|x\rangle$ · **amp(C_HH3('101'),2,'probability')**. Formal (3): (1) Eq. 7.10 · **amp(C_H3('010'),1,'signed')** · (2) Eq. 7.11; $z = 0$ gives $2^n$ · **amp(C_H3('000'),1,'signed')** · (3) `\langle y|H^{\otimes n}H^{\otimes n}|x\rangle = 2^{-n}\sum_z(-1)^{(x\oplus y)\cdot z} = \delta_{xy}` · **amp(C_HH3('101'),2)**.

**D3 · dj:b3 · result `\langle0|\psi_\text{out}\rangle = 2^{-n}\sum_x(-1)^{f(x)}`** (Eqs. 7.3–7.7) — Ground (4): (1) uniform start, Eq. 7.3 · **amp(C_DJ(F_BALN),1,'signed')** · (2) the query adds signs, Eq. 7.5 · **amp(C_DJ(F_BALN),2,'signed')** · (3) the $|000\rangle$ term of $H^{\otimes3}$ is $+2^{-3/2}$ for every $x$, so it sums the signs: the mean line, scaled (same view, mean 0) · (4) constant: $\pm1$ · **amp(C_DJ(F_ONE),2,'signed')** · *all minus; mean $-0.3536$*. Formal (3): (1) Eq. 7.5 · **amp(…,2,'signed')** · (2) `\langle0|H^{\otimes n} = 2^{-n/2}\sum_x\langle x|` · **amp(C_DJ(F_ONE),2,'signed')** · (3) result; balanced 0, constant $(-1)^{f(0)}$ · **amp(C_DJ(F_BALN),3,'probability')**.

**D4 · classical-cost:b1 · result `2^{n-1}+1 = 5\ (n = 3)`** — Ground (3): (1) one query reads one value · **circ(C_CLQ('011'),1)** · (2) a balanced $f$ can answer the first $N/2 = 4$ alike · **amp(C_CLQ('011'),1,'probability')** · (3) a fifth query must differ if balanced · **amp(C_CLQ('110'),1,'probability')**. Formal (2): (1) adversary: answer 0 until $N/2$ inputs are used · **circ(C_CLQ('011'),1)** · (2) result; exact minimax for $n \le 3$ agrees · **amp(C_CLQ('110'),1)**.

**D5 · bv:b2 · result `|\text{out}\rangle = (-1)^b|a\rangle`** (Eqs. 7.8–7.12) — Ground (4): (1) `(-1)^{a\cdot x\oplus b} = (-1)^b(-1)^{a\cdot x}` · **amp(C_BV,2,'signed')** · (2) these are $H^{\otimes4}|a\rangle$'s signs times $(-1)^b$ · **circ(C_BV,2)** · (3) two Hadamard columns cancel (Unit 16.1) · **amp(C_BV,3,'signed')** · (4) result. Formal (3): (1) Eq. 7.9 · **amp(C_BV,2,'signed')** · (2) Walsh sum keeps $y = a$ (7.12) · **amp(C_BV,3,'signed')** · (3) result · **circ(C_BV,3)**.

## 3. Try-it widgets (props read from source)
| Unit | Spec | Try this |
|---|---|---|
| hadamard-n | `amplitude-bars` `{state:'-z', basis:'x', editable:true}` | The state is $|1\rangle$; its x-basis amplitudes read $+0.71$ and $-0.71$: the signs of $H|1\rangle$. Drag θ to 0° ($|0\rangle$): both read $+0.71$. |
| dj | `complex-plane` `{mode:'phasor', phases:[0,180]}` | Two arrows at 0° and 180° add to nothing: a balanced one-bit $f$. Turn arrow 2 to 0°: they add to 2, a constant $f$. |
| classical-cost | `complex-plane` `{mode:'phasor', phases:[0,0,0]}` | Three agreeing answers add to 3. Turn one to 180°: they disagree, so $f$ cannot be constant. Agreement alone proves nothing. |
| bv | `amplitude-bars` `{state:'-x', basis:'x', editable:true}` | The pattern $(+,-)$ is $|{-x}\rangle$: one bar, amplitude 1. H sends it to $|1\rangle$, so $a = 1$. Set θ = 90°, φ = 0° ($a = 0$): the bar moves to $|{+x}\rangle$. |

## 4. Challenges (tol 0.005 unless stated; full walkthroughs: no sheet assigns Ch. 7; P7.3 is not used)
- **hadamard-n** 1 warm-up numeric `q16-hn-amp` amplitude of $|01\rangle$ in $H\otimes H|11\rangle$ → **−0.5** (`q16H2Neg`). 2 core numeric `q16-hn-dot` $x\cdot z$ for $1011$, $1101$ → **0** (`dotMod2`). 3 core numeric `q16-hn-sum` $\sum_x(-1)^{x\cdot010}$, $n = 3$ → **0** (`q16WalshZ010`).
- **dj** 1 warm-up numeric `q16-dj-p0` chance of all zeros, balanced $f$ → **0** (`q16DjBalnZero`). 2 core numeric `q16-dj-const` $\langle000|\psi_\text{out}\rangle$ for $f \equiv 1$ → **−1** (`q16DjConstAmp`). 3 core choice `q16-dj-lin` output for $f = x\cdot101$ → **$|101\rangle$** ✓ · $|000\rangle$ · four strings · random (`q16DjBalLands`).
- **classical-cost** 1 warm-up numeric `q16-cc-n3` exact classical queries, $n = 3$ → **5** (tol 0; `q16DetWorst3`). 2 core numeric `q16-cc-n10` same for $n = 10$ → **513** (tol 0). 3 stretch numeric `q16-cc-rand` three distinct random queries on a balanced $f$, $N = 8$, all agree → **0.143** (`q16Miss8k3`).
- **bv** 1 warm-up choice `q16-bv-out` reading for $a = 1011$, $b = 1$ → **1011** ✓ (`q16BvAmp`). 2 core numeric `q16-bv-classical` Bergou's classical queries, $n = 4$ → **5** (tol 0). 3 core choice `q16-bv-b` "Does the output reveal $b$?" → **no: it is a global sign** ✓.

## 5. Glossary (new in 709; no duplicate `qc-` id)
| id | term | introduces | Ground | Formal | first |
|---|---|---|---|---|---|
| `qc-bit-dot` | bit dot product $x\cdot z$ | notation | Multiply matching bits of two strings, add them, and keep only whether the total is odd. | $x\cdot z = \sum_j x_jz_j \bmod 2$. | hadamard-n:b2 |
| `qc-promise-problem` | promise problem | — | A question whose input is guaranteed to be one of a few kinds. | A decision problem defined only on inputs satisfying a promise (constant or balanced). | dj:b1 |
| `qc-deutsch-jozsa` | Deutsch–Jozsa algorithm | — | One query, framed by Hadamards, tells a constant $n$-bit $f$ from a balanced one. | $H^{\otimes n}$, $U_f$, $H^{\otimes n}$; all-zeros iff constant (Eq. 7.7). | dj:b1 |
| `qc-query-cost` | query cost | — | How many times an algorithm must ask the black box, in the worst case. | The number of oracle calls needed, exactly or with bounded error. | classical-cost:b1 |
| `qc-bounded-error` | bounded error | — | An algorithm allowed to be wrong with a small, fixed chance. | Success probability at least $1 - \varepsilon$ on every input, $\varepsilon < \tfrac12$ fixed. | classical-cost:b2 |
| `qc-bernstein-vazirani` | Bernstein–Vazirani algorithm | — | The same circuit reads a hidden string $a$ from $f(x) = a\cdot x \oplus b$ in one query. | Output $(-1)^b|a\rangle$ (Eq. 7.12). | bv:b1 |
| `qc-hidden-string` | hidden string | — | The unknown bits $a$ that a linear function $a\cdot x \oplus b$ hides. | $a \in \{0,1\}^n$ in $f(x) = a\cdot x + b \pmod 2$. | bv:b1 |

## 6. Review cards
- **hadamard-n** G: one wire gives a sign only on $|1\rangle$; $n$ wires give $(-1)^{x\cdot z}$; twice is nothing; nonzero $x$ splits the signs in half. F: Eqs. 7.1–7.2, 7.10–7.11; $(H^{\otimes n})^2 = I$. Eq $H^{\otimes n}|x\rangle = 2^{-n/2}\sum_z(-1)^{x\cdot z}|z\rangle$. Trap: reading $x\cdot z$ as "count matching bits".
- **dj** G: the target in $|-\rangle$ turns $f$ into signs; $|000\rangle$'s amplitude averages them; one query, certain. F: Eq. 7.7; constant ⇒ $(-1)^{f(0)}|0\rangle$. Eq $\langle0|\psi_\text{out}\rangle = 2^{-n}\sum_x(-1)^{f(x)}$. Trap: expecting a balanced $f$ always to land on one string (only linear ones do).
- **classical-cost** G: exact classical needs $2^{n-1}+1$; random queries with a tiny error need a handful. F: exact vs bounded-error query cost. Eq $2^{n-1}+1$. Trap: calling DJ a practical exponential speed-up.
- **bv** G: $f = a\cdot x\oplus b$; one query gives $a$; $b$ is a sign you cannot see. F: Eqs. 7.8–7.12; $n+1$ classical queries. Eq $|\text{out}\rangle = (-1)^b|a\rangle$. Trap: thinking BV also learns $b$.

## 7. Symbol-before-use
**7.1 Ground:** $H$, $|\pm\rangle$ (Q4) · $H^{\otimes n}$ (Q5, recap hadamard-n:b1) · $x, z$, $x\cdot z$ hadamard-n:b2 · $n$ (Q5 recap) · $f$, "balanced" (Q5) dj:b1 · $\binom{N}{k}$ — **not used in Ground** (numbers only) · $a, b$ bv:b1 · $\oplus$ (Q4).
**7.2 Formal:** adds $\delta_{z,0}$ hadamard-n:b3, $|\psi_2\rangle, |\psi_\text{out}\rangle$ dj:b2–b3, $\binom{N}{k}$ classical-cost:b2, $|\text{out}\rangle$ bv:b2. **FLAG** (both): Bergou's $(a + y)$ "bitwise addition" in Eq. 7.9 is written $a \oplus y$ here; stated at bv:b2. Counts: Ground 0, Formal 1.

## 8. Errata
No Correction box is needed; silent notes for the build agent:
- p. 119, Eq. 7.4: the middle expression drops the $1/\sqrt2$ of the target state (page image checked); the plan writes the normalized form.
- p. 120: the condition on the Walsh sum is garbled in print; it means "unless $z = 0$", and the plan writes it so.
- p. 120: Bergou gives a lower bound of $n$ classical evaluations and a method that uses $n+1$: both true; both stated.
- N&C writes the exact cost $2^n/2 + 1$ = Bergou's $2^{n-1}+1$.

## 9. Engine gaps and stage contracts
**9.1 Engine** (new `physics/qc/oracles.ts`; numpy block "oracles"): `walshSum(z, n)` (enumeration) · `djDeterministicWorst(n)`
(exact minimax over decision trees, $n \le 3$; the closed form above) · `djRandomMiss(N, k)` (hypergeometric) · `bvTable(a, b, n)`
· `djCircuit(table, form:'ancilla'|'phase')`, `bvCircuit(a, b, n)` builders. Reused: `walshHadamard`, `oracleXor`,
`oraclePhase`, `runCircuit`, `dotMod2`, `isBalanced`, `truthTable`.
**9.2 Stage:** no new kind. `amplitudes` `'signed'` (real amplitudes, readout "mean"), `circuit` oracle ops (xor with target;
phase). Circuit + amplitudes in one `split` always share
circuit and cursor (validated). $n = 4$ BV with the ancilla query circuit is 5 wires (the stage maximum).
**9.3 Widgets:** **W16 `oracle-bench`** (proposed, shared with Q17 and Q18): pick $n \le 4$ and $f$ (constant, balanced,
linear $a\cdot x \oplus b$, one marked item), run DJ / BV / Grover, and see the `circuit` and `amplitudes` kinds live (the
`bb84-bench` pattern). The stand-ins above are true but one-qubit.

## 10. Media
Film (deferred) `qc-q16-cancel`: "Balanced functions cancel the all-zeros bar" — eight signed bars and their mean line as $f$
changes, then the last Hadamards (manifest keys `q16DjBalnZero`, `q16DjConstAmp`, `q16DjMean`). Decor: none new.

## 11. Hooks
**11.1 Concept stations:** `qc-hadamard-signs` (hadamard-n; needs `qc-deutsch-algorithm`) · `qc-deutsch-jozsa` (dj; needs
`qc-hadamard-signs`, `qc-oracle-kickback`) · `qc-query-cost` (classical-cost; needs `qc-deutsch-jozsa`) ·
`qc-bernstein-vazirani` (bv; needs `qc-deutsch-jozsa`). No 448 twin (`sameAs` none).
**11.2 Arcade (Spot the error; `Q16x` labels):** `qc-dot-count` ("$x\cdot z$ counts the matching bits"; why: parity of the
positions where both are 1) · `qc-dj-half` ("a balanced $f$ leaves $|000\rangle$ amplitude ½"; why `q16DjBalnZero`) ·
`qc-two-agree` ("two agreeing classical answers prove $f$ constant"; why `q16DetWorst3`) · `qc-bv-b` ("the output's sign
tells us $b$"; why: a global phase).

## Rulings requested
- R1 Running examples: DJ $n = 3$ with `F_BALN` (non-linear) and `F_BAL` $= x\cdot101$; BV $n = 4$, $a = 1011$, $b = 1$ — confirm.
- R2 Bergou's ancilla circuit shown only in dj:b1 and the classical queries; every amplitude view uses the phase form (Q5 kickback).
- R3 The randomized classical cost (dj's "small error", N&C p. 35; beyond Bergou's one line): keep classical-cost:b2?
- R4 New `oracles.ts` helpers, including the exact minimax check of $2^{n-1}+1$ — approve as one engine task.
- R5 W16 `oracle-bench` (shared Q16–Q18): build before Q16, or ship the one-qubit stand-ins?
- R6 Part VII's Blender opener (a Grover picture): place it before Unit 17.2, not at Q16's start?
- R7 P7.3 (⚑): cited only, no challenge, as ruled for Q14.
