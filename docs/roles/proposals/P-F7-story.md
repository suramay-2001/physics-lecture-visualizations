# P-F7-story — F7 "Bits and logic that can run backwards" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q16-story.md`'s compact sections (one line per field) with the
Foundations two-track rules of `P-F6-story.md`. Standing gates: ≥ 2 distinct derivation views per track (W-709 #7); one
notation beat per new notation or space (W-709 #8). Map row: `P-709-map.md` §1 F7. Rulings: `decisions/qc709-foundations.md`
(F chapters own their math, phase `'core'`, reached by bridges), `qc709-foundations-rulings.md`, `qc709-nc.md`.

**Sources read** (copyrighted; paraphrased, cited by printed page). N&C (printed = PDF − 28): §3.1.2 pp. 129–133 (logic gates
as maps $\{0,1\}^k \to \{0,1\}^l$, NOT $= 1 \oplus a$, AND/OR/XOR/NAND, FANOUT, ancillas; the half-adder, Fig. 3.5 p. 132;
universality p. 133, Ex. 3.8 ⚑ p. 134); §3.2.1 pp. 136–137 ($O$, $\Omega$, $\Theta$); §3.2.2 p. 138 (the pairwise sort's
$n(n-1)/2$; polynomial = efficient, pp. 138–139); §3.2.5 pp. 153–160 (Landauer p. 153; Fredkin pp. 156–157; garbage and
uncomputation, Eqs. 3.7–3.8 p. 158; Toffoli Fig. 3.17 p. 159; NAND and FANOUT from Toffoli, Figs. 3.18–3.19 p. 160; BPP/BQP
by name p. 153). Bergou (printed = PDF − 15 in Ch. 1, − 10 in Ch. 7, − 8 in Ch. 9; checked on each page's own number): §1.2
p. 3 (AND merges 00, 01, 10, so no quantum version); §1.4 p. 5 (f-CNOT); P1.3–P1.4 p. 12 (⚑: cited only); §7.1 p. 118
(Eqs. 7.1–7.2, $x \cdot z$), p. 120 (Eqs. 7.10–7.11); §7.4 p. 126 (bitwise $\oplus$); §9.2 pp. 170–171 (check matrix, weight,
syndrome, distance). No 709 notes or homework touch F7 (HW1/HW2 submitted, no HW3).

**Ownership.** F7 is the canonical owner of classical bits: Boolean functions as truth tables, reversibility as a bijection,
permutation matrices, Landauer, uncomputation, XOR as addition mod 2, $\mathbb F_2^n$ and its linear algebra, and cost
counting ($O$, polynomial versus exponential). The Q chapters keep their inline teaching (not re-cut) and gain Q→F bridges
(§11.3). REUSED gloss ids (`[[id|…]]`, never redefined): Q4 `qc-xor`, `qc-cnot`, `qc-swap-gate`; Q5 `qc-constant`,
`qc-balanced`, `qc-toffoli`, `qc-query`; Q6 `qc-parity`; Q16 `qc-bit-dot`, `qc-query-cost` (Q16 is building now; F7 builds
after it merges, R7). As F6 did, F7's notation beats set `Beat.introduces` on reused ids it owns the math of (`qc-xor`,
`qc-bit-dot`); the introduces-once lint is per chapter. F7 does NOT re-derive: SWAP = 3 CNOTs (q4-circuits:b3), the four
one-bit functions (q5-problem), kickback (q5-oracle), the Walsh sum as $H^{\otimes n}$ (q16-hadamard-n:b3), the exact DJ
cost (q16-classical-cost:b1), Grover's $\sqrt N$ (Q17). It states their numbers by engine call and bridges.

**Evidence.** `scratchpad/planF78-numpy.py` (numpy + plain Python, independent of the app; output `planF78-numpy.out`):
brute-force truth tables and map counts, a 5-wire state-vector simulator for the circuits, GF(2) RREF and null spaces by
enumeration, the Grover count from $\arcsin$. 199 values across F7/F8, 0 failed asserts. Every number below is from it.

**Conventions.** Bit strings print q0 first = most significant (engine C2; F6). $x \cdot z = \sum_j x_jz_j \bmod 2$. Running
examples: two-bit gates; the 3-bit balanced, non-linear `T_BAL3` = `[1,0,0,1,1,1,0,0]`; $a = 110$; Simon-style `T_SIM` =
`[0,1,2,3,2,3,0,1]` ($n = 3$, 2 output bits, $f(x) = f(x \oplus 110)$); the strings 1011, 0110. The parity-check matrix is
written $M$ (Bergou: $H$, which this course keeps for Hadamard; stated once at f7-gf2:b3 F). Cross-references read "Unit F7.2",
"Chapter Q5". Claim keys `f7…`; twins `pipeline/claims_qc709/f7.py`. Phase tags: [L] `'core'`, [B] `'books'`, [C] clue.

**Stage shorthand.** `bm(src, v)` = `{kind:'bits', fn:{source:src, view:v}}` (S1; `src` = `{gate:'AND'}` · `{table, n, m}`) ·
`br(strs, comb?, against?)` = `{kind:'bits', rows:{strings, combine, against}}` (S1) · `bx(strs, k)` = `{kind:'bits',
reduce:{strings, upTo:k}}` (S1) · `circ(C,k)`, `amp(S,k?,mode?)`, `mx(src,f)`, `plot(fn,f)` (S3 names), `split(a / b)`.
**Circuits:** `C_TOF(s)` 3 wires, init s: [X, controls 0,1, target 2] · `C_TOF2(s)`: two such columns · `C_AND3(s)` wires
$x_0x_1x_2\,w\,y$, init s: [Tof 0,1→3], [Tof 3,2→4], [Tof 0,1→3] · `C_GARB` wires $x_0x_1w$, init 000: [H,H], [Tof 0,1→2],
[H,H] · `C_CLEAN`: the same with a second [Tof 0,1→2] before the last [H,H].

## 0. Chapter map
**Driving question:** "Why can't a quantum computer just use ordinary AND gates, and what does 'fast' even mean?"

| # | id | Title (≤ 8 words) | Question | Sources | Bridges out |
|---|---|---|---|---|---|
| 1 | `f7-boolean` | Functions of bits as truth tables | What is a function of bits, and how many are there? | N&C pp. 129–134 | `qc-f6-pairs`, `qc-l1-logic` |
| 2 | `f7-reversible` | Gates that can run backwards | Why must a quantum gate never merge two inputs? | Bergou p. 3; N&C pp. 153–160 | `qc-f4-unitary`, `qc-f3-matrix-of-map` |
| 3 | `f7-xor` | XOR: adding bits without carrying | What arithmetic do bits obey, and what do signs add? | Bergou pp. 118, 126 | — |
| 4 | `f7-gf2` | Linear algebra with only 0 and 1 | How do we solve equations whose numbers are bits? | Bergou pp. 170–171 | `qc-f2-vectors` |
| 5 | `f7-cost` | Counting the cost of a method | When is a method fast, and what do quantum speed-ups buy? | N&C pp. 136–139, 153 | — |

**Outcomes:** read and count truth tables; tell a reversible gate (a bijection) from AND; make any $f$ reversible with
$y \oplus f(x)$ and clean up with uncomputation; compute with $\oplus$, $(-1)^a$ and $a \cdot x$; row-reduce mod 2 to find a
hidden string; compare $n^2$ with $2^n$ and read a speed-up in $O(\cdot)$. **Prerequisites:** F6 `qc-joint-space-station`
(strings label basis states), F3 `qc-matrix-of-map`, F4 (unitary). Ground ramp: binary counting, truth-table puzzles, light
switches, counting steps. **Openers:** none new (media deferred, §10).

## 1. Story beats (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds per unit: boolean `bits` · reversible `bits`, `matrix`, `circuit`, `amplitudes` · xor `bits`, `amplitudes` · gf2 `bits` · cost `plot`.

### Unit `f7-boolean` — Functions of bits as truth tables
**b1 [L] · notation, `introduces: ['qc-boolean-function', 'qc-truth-table']`**
- G: "A bit is 0 or 1, and a string of $n$ bits labels one of $2^n$ cases (<<qc-f6-pairs|Unit F6.1>>). A [[qc-boolean-function|Boolean function]] $f$ reads a string and returns one bit. Its [[qc-truth-table|truth table]] lists every input with its output. AND returns 1 only on 11."
- F: "A Boolean function is $f : \{0,1\}^n \to \{0,1\}$, fixed by its truth table of $2^n$ rows (N&C §3.1.2, p. 129). For $n = 2$, AND, OR, XOR and NAND have the output columns 0001, 0111, 0110, 1110 (N&C pp. 130–131)."
- Cap G "AND: output 1 only on input 11" · F "$f : \{0,1\}^n \to \{0,1\}$: a table of $2^n$ rows" · Stage `bm({gate:'AND'}, 'table')` · Claims `f7And` [0,0,0,1], `f7Or`, `f7Xor`, `f7Nand` (`gateTable`).

**b2 [L]** (how many functions; D1)
- G: "With $n$ input bits the table has $2^n$ rows, and every row's output is a free choice. So there are $2^{2^n}$ functions: 4 for one bit, 16 for two, 256 for three."
- F: "There are $2^{2^n}$ Boolean functions of $n$ bits, one free output per row (D1): 4, 16, 256 for $n = 1, 2, 3$. Chapter Q5's four one-bit functions are the case $n = 1$."
- Cap G/F "two input bits: 4 rows, $2^4 = 16$ functions" · Stage `bm({gate:'OR'}, 'table')` · Claims `f7Funcs1` 4, `f7Funcs2` 16, `f7Funcs3` 256 (`booleanCount`) · D1.

**b3 [L]** (constant and balanced, counted)
- G: "Chapter Q5 sorted functions into [[qc-constant|constant]] and [[qc-balanced|balanced]]. For three bits, 2 are constant, 70 are balanced, and the other 184 are neither. A promise to be one or the other is a strong promise."
- F: "Constant: 2 functions; balanced: $\binom{2^n}{2^{n-1}}$, 70 for $n = 3$; the remaining 184 of the 256 are neither. Deutsch–Jozsa's promise (Chapter Q16) excludes most functions."
- Cap G/F "a balanced 3-bit table: four 1s, four 0s" · Stage `bm({table:T_BAL3, n:3, m:1}, 'table')` · Claims `f7Const` 2, `f7Balanced3` 70, `f7Neither3` 184, `f7Funcs3` 256, `f7BalIs` (`isBalanced(T_BAL3)` true).

**b4 [B] · notation, `introduces: ['qc-xor']`** (NAND builds everything; the half-adder)
- G: "NAND is AND followed by NOT. Wire NANDs together and you get NOT, AND and OR, so every table can be built. To add two bits $a$ and $b$, the sum bit is [[qc-xor|XOR]], written $a \oplus b$, and the carry is AND."
- F: "NAND is universal: NOT $a$ = NAND$(a, a)$, AND = NOT NAND, OR$(a, b)$ = NAND(NOT $a$, NOT $b$) (N&C p. 133; Ex. 3.8 ⚑). The half-adder outputs $a \oplus b$ and the carry $ab$; $1 + 1$ gives sum 0, carry 1 (Fig. 3.5, p. 132)."
- Cap G/F "half-adder: $1 + 1$ → sum $1 \oplus 1 = 0$, carry 1" · Stage `bm({gate:'XOR'}, 'table')` · Claims `f7NandUniversal` true (all three identities, every input), `f7HalfSum11` 0, `f7HalfCarry11` 1.

**b5 [C]** (how many two-bit functions break the promise?)
- Q G: "Of the 16 two-bit functions, how many are balanced, and how many are neither?" · Q F: "Count the balanced and the neither-constant-nor-balanced functions for $n = 2$."
- Reveal G: "Six are balanced: choose which 2 of the 4 rows say 1. Two are constant, so 8 are neither, half of them all. AND is one: a single 1." · Reveal F: "$\binom42 = 6$ balanced, 2 constant, $16 - 8 = 8$ neither (AND, OR, NAND among them). Bits obey fixed tables; for atoms, 'up OR right' depended on the order of the tests (<<qc-l1-logic|Spin Lab 1.4>>)."
- Cap G/F "AND: one 1 in four rows, neither constant nor balanced" · Stage q `bm({gate:'XOR'}, 'table')`; reveal `bm({gate:'AND'}, 'table')` · Claims `f7Balanced2` 6, `f7Neither2` 8.

### Unit `f7-reversible` — Gates that can run backwards
**b1 [L] · notation, `introduces: ['qc-reversible-gate']`** (AND merges; D2)
- G: "Can you run AND backwards? If it says 0, the input was 00, 01 or 10: three inputs, one answer. A [[qc-reversible-gate|reversible gate]] never merges, so each output comes from exactly one input. [[qc-cnot|CNOT]], which flips the second bit exactly when the first is 1, is reversible."
- F: "A gate is reversible when its output fixes its input: a bijection of bit strings (N&C §3.2.5, p. 153). AND sends 00, 01, 10 to 0, so it erases information; quantum gates are unitary, hence invertible, so AND has no quantum version (Bergou §1.2, p. 3; D2)."
- Cap G "AND's arrows: three meet at 0" · F "reversible ⇔ a bijection of strings" · Stage `split(bm({gate:'AND'}, 'map') / bm({gate:'CNOT'}, 'map'))` · Claims `f7AndZeroPre` 3 (`preimageCount`), `f7CnotBij` true (`isBijection`) · D2.

**b2 [L] · notation, `introduces: ['qc-permutation-matrix']`**
- G: "A reversible gate on $n$ bits shuffles the $2^n$ strings. Written as a table of 0s and 1s, with one 1 in each row and column, it is a [[qc-permutation-matrix|permutation matrix]]. Only 24 of the 256 two-bit maps are reversible."
- F: "A reversible gate permutes $\{0,1\}^n$; its matrix $P$ has one 1 per row and column, so $P^{\top}P = I$: a real unitary (<<qc-f4-unitary|Unit F4.4>>, <<qc-f3-matrix-of-map|Unit F3.2>>). Of the $4^4 = 256$ maps from two bits to two bits, $4! = 24$ are permutations."
- Cap G/F "Toffoli as a table: one 1 in every row and column" · Stage `mx({gate:{name:'Toffoli'}}, {values:'none'})` · Claims `f7Maps22` 256, `f7Perms22` 24, `f7TofUnitary` 0 (`maxDiff(PᵀP, I)`).

**b3 [L]** (the reversible trick; D3)
- G: "Any function can be made reversible: keep $x$ and add $f(x)$ to a spare bit $y$ with XOR. Doing it twice adds $f(x)$ twice, which cancels. [[qc-toffoli|Toffoli]] does this for AND: it keeps $a, b$ and adds $ab$, their AND, to a third bit."
- F: "$(x, y) \mapsto (x, y \oplus f(x))$ is its own inverse, hence a permutation (D3; N&C Eq. 3.8, p. 158); Chapter Q5's f-CNOT is its quantum form. Toffoli $(a, b, c) \mapsto (a, b, c \oplus ab)$ (Fig. 3.17, p. 159) gives AND at $c = 0$, NAND at $c = 1$ (Fig. 3.18, p. 160)."
- Cap G/F "Toffoli: $|110\rangle \to |111\rangle$" · Stage `split(circ(C_TOF('110'),1) / amp({circuit:C_TOF('110'), upTo:1}))` · Claims `f7Tof110` '111' (`runCircuit`), `f7TofAnd` [0,0,0,1], `f7TofNand` [1,1,1,0], `f7OracleSelfInv16` true (`reversibleOracle` twice, all 16 two-bit $f$) · D3.

**b4 [B] · introduces nothing** (Landauer) · Terms `qc-landauer`
- G: "Erasing a bit has a price. [[qc-landauer|Landauer's principle]]: wiping one bit releases at least $k_BT\ln 2$ of heat, with $k_B$ Boltzmann's constant and $T$ the temperature. At room temperature that is $2.87 \times 10^{-21}$ joules."
- F: "Landauer: erasing one bit dissipates at least $k_BT\ln 2$ (N&C §3.2.5, p. 153): $2.87 \times 10^{-21}$ J $= 0.0179$ eV at $T = 300$ K. Reversible logic erases nothing, so no such floor applies to it (N&C p. 155)."
- Cap G/F "erasing one bit at 300 K: at least $2.87 \times 10^{-21}$ J" · Stage `bm({gate:'AND'}, 'map')` · Claims `f7Landauer300J` 2.87e-21, `f7Landauer300eV` 0.0179 (`landauerJ(300)`).

**b5 [B]** (garbage and uncomputation) · Terms `qc-uncompute`
- G: "Bigger reversible circuits leave scraps on work bits. Take the AND of three bits $x_0, x_1, x_2$. Store $x_0x_1$ on a work wire $w$, write the answer on $y$, then undo the first step. $w$ ends at 0 again."
- F: "A reversible circuit gives $(x, 0, 0) \to (x, f(x), g(x))$ with garbage $g$; adding $f$ into $y$ and running the circuit backwards gives $(x, 0, 0, y) \to (x, 0, 0, y \oplus f(x))$ ([[qc-uncompute|uncomputation]], N&C Eqs. 3.7–3.8, p. 158). Here $|111\,0\,0\rangle \to |111\,0\,1\rangle$."
- Cap G "three-bit AND: the work wire ends at 0" · F "$|11100\rangle \to |11101\rangle$; $w$ returns to 0" · Stage `split(circ(C_AND3('11100'),3) / amp({circuit:C_AND3('11100'), upTo:3}))` · Claims `f7And3_11100` '11101', `f7And3Work` (after column 1: '11110'), `f7And3CleanAll` true, `f7And3Correct` true (all 8 inputs).

**b6 [C]** (why clean up?)
- Q G: "Quantum algorithms (Chapter Q5) send every input through at once, then let them interfere. If a work wire keeps a scrap of the input, can they still interfere perfectly?" · Q F: "With $H^{\otimes2}$ before and after, does leaving $x_0x_1$ on the work wire change the chance of reading 00?"
- Reveal G: "No. In a test that should return 00 every time, a leftover AND bit drops the chance to $0.625$. Undo it first and the chance is 1 again. Garbage tells which input went in." · Reveal F: "Clean: $P(00) = 1$. With garbage, $P(00) = (3/4)^2 + (1/4)^2 = 0.625$: the work wire is entangled with the inputs, whose purity falls to $0.625$ (Chapter Q8's purity)."
- Cap G/F "garbage left: the inputs read 00 with chance $0.5625 + 0.0625 = 0.625$" · Stage q `circ(C_CLEAN,4)`; reveal `split(circ(C_GARB,3) / amp({circuit:C_GARB, upTo:3}, 'probability'))` · Claims `f7GarbageP00` 0.625, `f7GarbageP000` 0.5625, `f7GarbageP001` 0.0625, `f7CleanP00` 1, `f7GarbagePurity` 0.625 (`runCircuit` + `purity`).

### Unit `f7-xor` — XOR: adding bits without carrying
**b1 [L]** (XOR is addition mod 2)
- G: "XOR is adding without carrying: $1 \oplus 1 = 0$. That is arithmetic mod 2: keep only the remainder after dividing by 2. So $a \oplus a = 0$, and adding the same bit twice changes nothing."
- F: "$a \oplus b = a + b \bmod 2$, with $a \oplus 0 = a$ and $a \oplus a = 0$: every bit is its own inverse. Hence $y \oplus f \oplus f = y$ (Unit F7.2), and a one-time pad decodes (Chapter Q15)."
- Cap G/F "$1 \oplus 1 = 0$: add, then drop the carry" · Stage `bm({gate:'XOR'}, 'table')` · Claims `f7Xor` [0,1,1,0].

**b2 [L]** (strings, place by place)
- G: "XOR two strings place by place: $1011 \oplus 0110 = 1101$. Each place is its own little sum. XOR with $0110$ again and $1011$ comes back."
- F: "On $\{0,1\}^n$, $x \oplus z$ is bitwise addition mod 2 (Bergou §7.4, p. 126): $1011 \oplus 0110 = 1101$ and $(x \oplus k) \oplus k = x$. Simon's promise $f(x) = f(x \oplus s)$ (Chapter Q18) is written in it."
- Cap G/F "$1011 \oplus 0110 = 1101$" · Stage `br(['1011','0110'], 'xor')` · Claims `f7Xor1011_0110` '1101', `f7OtpBack` '1011' (`xor`).

**b3 [L]** (bits as signs; D4)
- G: "Turn bits into signs: 0 becomes $+1$ and 1 becomes $-1$, written $(-1)^a$. Then XOR becomes multiplying: $(-1)^{a \oplus b} = (-1)^a(-1)^b$. Two minus signs make a plus, just as $1 \oplus 1 = 0$."
- F: "$a \mapsto (-1)^a$ turns $(\{0,1\}, \oplus)$ into $(\{\pm1\}, \times)$: $(-1)^{a \oplus b} = (-1)^a(-1)^b$ (D4, all four cases). Chapter Q16's Hadamard signs and Chapter Q7's $\pm1$ products rest on it."
- Cap G/F "signs of $a \oplus b$ for 00, 01, 10, 11: $+, -, -, +$" · Stage `amp({terms:'00-01-10+11'}, 'signed')` · Claims `f7SignsMultiply` true · D4.

**b4 [L] · notation, `introduces: ['qc-bit-dot']`**
- G: "The [[qc-bit-dot|bit dot product]] $a \cdot x$ multiplies matching bits, adds them, and keeps the remainder mod 2. For $a = 110$ it is the [[qc-parity|parity]] of $x$'s first two bits: $110 \cdot 011 = 1$, $110 \cdot 111 = 0$."
- F: "$a \cdot x = \sum_j a_jx_j \bmod 2$ (Bergou Eqs. 7.1–7.2, p. 118), linear in $x$: $a \cdot (x \oplus z) = a \cdot x \oplus a \cdot z$. For $a = 110$, $a \cdot x = x_0 \oplus x_1$."
- Cap G/F "$110 \cdot 011 = 1$" · Stage `br(['110','011'], 'dot')` · Claims `f7Dot110_011` 1, `f7Dot110_111` 0 (`dotMod2`).

**b5 [L]** (a nonzero $a$ splits the strings in half; D5)
- G: "Take $f(x) = 110 \cdot x$. Flip the first bit of $x$ and $f$ flips too. The eight inputs pair up, one 0 and one 1 per pair: four of each. So the eight signs add to 0."
- F: "For $a \ne 0$ pick $k$ with $a_k = 1$, and let $e_k$ be the string with a single 1 at $k$. $x \mapsto x \oplus e_k$ pairs the strings and flips $a \cdot x$, so $\sum_x(-1)^{a\cdot x} = 0$ (D5). Thus $a \cdot x \oplus b$ is balanced iff $a \ne 0$ (all 16 cases, $n = 3$)."
- Cap G "signs of $110 \cdot x$: four up, four down, mean 0" · F "$\sum_x(-1)^{110\cdot x} = 0$" · Stage `amp({terms:'000+001-010-011-100-101+110+111'}, 'signed')` · Claims `f7Count110` 4, `f7SignSum110` 0, `f7LinBalancedIff` true · D5.

**b6 [C]** (the one string that does not cancel)
- Q G: "For $a = 000$, do the eight signs $(-1)^{a \cdot x}$ also cancel?" · Q F: "Evaluate $\sum_x(-1)^{a\cdot x}$ at $a = 0$."
- Reveal G: "No. Every $000 \cdot x$ is 0, so all eight signs are $+1$ and they add to 8. Only $a = 000$ survives: Chapter Q16 builds Deutsch–Jozsa on this." · Reveal F: "$\sum_x(-1)^{a\cdot x} = 2^n\delta_{a,0}$: 8 at $a = 0$, else 0. This is Chapter Q16's Walsh sum, and the case $N = 2$ of Unit F8.3's roots-of-unity sum."
- Cap G/F "$a = 000$: eight plus signs, sum 8" · Stage q `amp({terms:'000+001-010-011-100-101+110+111'}, 'signed')`; reveal `amp({terms:'000+001+010+011+100+101+110+111'}, 'signed')` · Claims `f7SignSum000` 8.

### Unit `f7-gf2` — Linear algebra with only 0 and 1
**b1 [L] · space, `introduces: ['qc-gf2']`**
- G: "Bit strings form a space of their own. Add them with XOR, and scale only by 0 or 1. This is [[qc-gf2|GF(2)]] arithmetic. Every string is its own negative, since $x \oplus x = 0$: $101 \oplus 011 = 110$."
- F: "$\mathbb F_2 = \{0, 1\}$ with $+ = \oplus$ and $\times$ = AND is a field; $\mathbb F_2^n$ is an $n$-dimensional space with $2^n$ vectors and $-x = x$ (<<qc-f2-vectors|Unit F2.1>> with new scalars; Bergou §9.2, p. 170, works mod 2)."
- Cap G "add with XOR, scale by 0 or 1" · F "$\mathbb F_2^3$: 8 vectors; $101 \oplus 011 = 110$" · Stage `br(['101','011'], 'xor')` · Claims `f7Xor101_011` '110'.

**b2 [L] · notation, `introduces: ['qc-hamming-weight']`** · Terms `qc-hamming-distance`
- G: "The [[qc-hamming-weight|Hamming weight]] of a string counts its 1s. The [[qc-hamming-distance|Hamming distance]] of two strings counts the places where they differ: the weight of their XOR. $1011$ and $0110$ differ in 3 places."
- F: "$\mathrm{wt}(x) = |\{j : x_j = 1\}|$ and $d(x, z) = \mathrm{wt}(x \oplus z)$ (Bergou §9.2, p. 171). $d(1011, 0110) = \mathrm{wt}(1101) = 3$."
- Cap G/F "$d(1011, 0110) = 3$" · Stage `br(['1011','0110'], 'xor')` (readouts weights, distance) · Claims `f7Wt1101` 3, `f7Dist1011_0110` 3.

**b3 [B] · notation, `introduces: ['qc-parity-check']`**
- G: "A [[qc-parity-check|parity check]] is a rule like 'these bits must XOR to 0'. Three checks on seven bits can find any single flip: their three answers spell the flipped place in binary."
- F: "A check matrix $M$ (Bergou's $H$, not the Hadamard) accepts $c$ iff $Mc = 0$ over $\mathbb F_2$; an error $e$ shows as the syndrome $Me$ (Bergou pp. 170–171). With column $j$ equal to $j$ in binary (the $[7,4]$ Hamming code, Chapter Q22), a flip at 6 reads 110."
- Cap G/F "flip bit 6 of 1110000: the checks read 110, that is 6" · Stage `br(M_7, 'dot', '1110010')` (`M_7` = rows of `hammingParity(3)`) · Claims `f7HammingCodeword` [0,0,0], `f7Syndrome6` '110' (`gf2MatVec`), `f7Hamming74` [7, 4] (columns of `hammingParity(3)`, minus its rank 3).

**b4 [L]** (row reduction finds a hidden string; D6)
- G: "Some machines hide a string $s$ by giving the same output for $x$ and $x \oplus s$. Measurements then yield strings $y$ with $y \cdot s = 0$. From $001$ and $111$, XOR-ing rows leaves one nonzero answer: $s = 110$."
- F: "Gaussian elimination works over $\mathbb F_2$ with row swaps and row XORs. $\begin{pmatrix}0&0&1\\1&1&1\end{pmatrix}$ reduces to $\begin{pmatrix}1&1&0\\0&0&1\end{pmatrix}$: rank 2, null space $\{000, 110\}$ (D6). Simon's algorithm (Chapter Q18) ends this way."
- Cap G "a function that pairs $x$ with $x \oplus 110$; two checks reveal 110" · F "$\mathrm{rank}\,M = 2$, $\ker M = \{000, 110\}$" · Stage `split(bm({table:T_SIM, n:3, m:2}, 'map') / bx(['001','111'], 2))` · Claims `f7SimonPeriod110` true, `f7RankY` 2, `f7NullY` ['000','110'] (`gf2Nullspace`), `f7PerpOf110` ['000','001','110','111'] · D6.

**b5 [C]** (independence depends on the numbers you use)
- Q G: "Are $110$, $011$ and $101$ independent: can none be built from the others?" · Q F: "What is the rank of the rows 110, 011, 101 over $\mathbb F_2$, and over $\mathbb R$?"
- Reveal G: "Not over bits: $110 \oplus 011 = 101$. With ordinary numbers the same three rows are independent. In GF(2), $1 + 1 = 0$ creates new ties." · Reveal F: "$\mathrm{rank}_{\mathbb F_2} = 2$; over $\mathbb R$ the determinant is 2, so the rank is 3. An even determinant vanishes mod 2: rank depends on the field."
- Cap G/F "over bits the third row is the XOR of the first two" · Stage q `br(['110','011','101'])`; reveal `bx(['110','011','101'], 2)` · Claims `f7RankGF2_dep` 2 (`gf2Rank`), `f7DetReal_dep` 2 (`detN`).

### Unit `f7-cost` — Counting the cost of a method
**b1 [L]** · Terms `qc-query`, `qc-query-cost` (reused)
- G: "How long does a method take? Count its basic steps as the input grows. Sorting $n$ names by comparing every pair takes $n(n - 1)/2$ comparisons: 45 for 10 names, about half of $10^2$."
- F: "Cost counts basic operations as a function of the input size $n$ (N&C §3.2.1, p. 136); the pairwise compare-and-swap sort uses $n(n-1)/2$, 45 at $n = 10$ (p. 138). For a black box the cost is its number of [[qc-query|queries]] ([[qc-query-cost|query cost]])."
- Cap G/F "the curve $n^2$: doubling $n$ multiplies it by 4" · Stage `plot('nSquared', {x:{from:1,to:50}, markers:[{x:10}]})` · Claims `f7Sort10` 45, `f7Sq10` 100.

**b2 [L] · notation, `introduces: ['qc-big-o']`** (D7)
- G: "For large $n$, constants and small terms stop mattering. [[qc-big-o|Big-O]] keeps only the growth: $3n^2 + 5n + 7$ is $O(n^2)$, because it stays below $4n^2$ from $n = 7$ on."
- F: "$f = O(g)$ if $f(n) \le c\,g(n)$ for all $n > n_0$ (N&C p. 136); $\Omega$ and $\Theta$ are the lower and two-sided versions (p. 137). $3n^2 + 5n + 7 \le 4n^2$ for $n \ge 7$ (D7)."
- Cap G/F "$(3n^2 + 5n + 7)/n^2$ drops below 4 at $n = 7$" · Stage `plot('bigORatio', {x:{from:1,to:20}, yLines:[{y:4}], markers:[{x:6},{x:7}]})` · Claims `f7BigOn0` 7 · D7.

**b3 [L] · introduces nothing** · Terms `qc-exponential-cost`
- G: "Compare $n^2$ with $2^n$. At $n = 10$: 100 against 1024. At $n = 50$: 2500 against about $1.1 \times 10^{15}$. Each extra bit doubles $2^n$ but adds only $2n + 1$ to $n^2$."
- F: "Polynomial cost $O(n^k)$ is called efficient, [[qc-exponential-cost|exponential]] cost is not (N&C pp. 138–139). $n \to n + 1$ doubles $2^n$ but adds $2n + 1$ to $n^2$; at $n = 30$: 900 against $1.07 \times 10^9$."
- Cap G/F "$n = 50$: $n^2 = 2500$, $2^n \approx 1.1 \times 10^{15}$" · Stage `split(plot('nSquared', LOG50) / plot('twoToN', LOG50))` (`LOG50` = x 1–50, `yScale:'log'`, markers 10, 30, 50) · Claims `f7Sq30` 900, `f7Exp30` 1073741824, `f7Sq50` 2500, `f7Exp50` 1.1259e15, `f7Exp21over20` 2, `f7Sq21minus20` 41.

**b4 [B]** (this course's speed-ups, in queries)
- G: "Quantum algorithms are judged by this yardstick. Deutsch–Jozsa answers in 1 query where a certain classical answer may need 513, at $n = 10$. Grover searches $2^{20}$ items in 804 steps, not about a million."
- F: "Query counts: DJ, 1 against $2^{n-1} + 1$ exact classical queries, 513 at $n = 10$ (Chapter Q16); search over $N = 2^{20}$: Grover's $k^* = 804$ against $N - 1 = 1\,048\,575$ classical queries in the worst case (Chapter Q17)."
- Cap G/F "$n = 20$: $2^n = 1\,048\,576$, $2^{n/2} = 1024$" · Stage `split(plot('twoToN', LOG20) / plot('sqrtTwoToN', LOG20))` (marker $n = 20$) · Claims `f7Dj10` 513 (`djDeterministicWorst`, Q16's oracles.ts), `f7Grover2e20` 804 (`groverOptimalK(2**20)`), `f7Classical2e20` 1048575, `f7Sqrt2e20` 1024.

**b5 [C]** (is Grover an exponential speed-up?)
- Q G: "For $N = 2^n$ items, Grover needs about $\sqrt N$ queries instead of $N$. Is that an exponential speed-up?" · Q F: "Is $O(\sqrt N)$ search exponentially faster in $n = \log_2N$?"
- Reveal G: "No. $\sqrt{2^n} = 2^{n/2}$ still doubles with every two extra bits: it is still exponential. Grover's gain is a square root. Deutsch–Jozsa's gap is exponential only against a method that must never err." · Reveal F: "$\sqrt N = 2^{n/2}$ is exponential in $n$: a quadratic speed-up, optimal (Chapter Q17's BBBV bound). Exponential gaps need structure (Q16 exact, Q18 Simon); the classes P, BPP, BQP are named in N&C p. 153."
- Cap G/F "$2^{n/2}$ doubles every two bits" · Stage q `plot('twoToN', LOG20)`; reveal `plot('sqrtTwoToN', LOG20)` · Claims `f7SqrtDoubles` 2.

**Count:** 5 + 6 + 6 + 5 + 5 = **27 beats**, 5 clues. Order within each unit L → B → C.

## 2. Derivations (step `tex` — why — **view**; a step without a view keeps the last one; Ground ≥ Formal; ≥ 2 views each)
**D1 · boolean:b2 · `2^{2^n}` functions** — G (4): (1) one bit: 2 rows · **`bm({gate:'NOT'},'table')`** · *NOT: two rows* (2) each row's output is 0 or 1 (3) $n$ bits: $2^n$ rows · **`bm({table:T_BAL3,n:3,m:1},'table')`** · *eight rows* (4) $2 \times 2 \times \cdots = 2^{2^n}$. F (2): (1) $f$ is fixed by its column, a string in $\{0,1\}^{2^n}$ · **`bm({gate:'AND'},'table')`** (2) $|\{0,1\}^{2^n}| = 2^{2^n}$ · **`bm({table:T_BAL3,…},'table')`**. Check `f7Funcs*`.
**D2 · reversible:b1 · AND has no reversible (unitary) version** — G (4): (1) list AND's outputs · **`bm({gate:'AND'},'map')`** · *three arrows meet at 0* (2) three inputs share 0 (3) an undo would send 0 back to three places at once (4) a reversible gate has one arrow into each output · **`bm({gate:'CNOT'},'map')`**. F (2): (1) $|f^{-1}(0)| = 3$: not injective · **AND map** (2) unitary ⇒ invertible ($U^{-1} = U^\dagger$), so no unitary computes AND in place · **CNOT map**. Check `f7AndZeroPre`.
**D3 · reversible:b3 · $(x, y) \mapsto (x, y \oplus f(x))$ is a permutation** — G (4): (1) Toffoli once · **`circ(C_TOF2('110'),1)`** (2) again: $c \oplus ab \oplus ab$ (3) $ab \oplus ab = 0$: back to 110 · **`amp({circuit:C_TOF2('110'),upTo:2})`** · *the bar returns to 110* (4) an undo exists, so the 8 strings are shuffled · **`mx({gate:{name:'Toffoli'}},{values:'none'})`**. F (2): (1) the map composed with itself is the identity · **`circ(C_TOF2('110'),2)`** (2) an involution is a bijection; its matrix is a permutation, so unitary · **`mx(Toffoli)`**. Check `f7OracleSelfInv16`.
**D4 · xor:b3 · $(-1)^{a\oplus b} = (-1)^a(-1)^b$** — G (3): (1) the four rows of XOR · **`bm({gate:'XOR'},'table')`** (2) $+\cdot+ = +$, $+\cdot- = -$ (3) $-\cdot- = +$, matching $1 \oplus 1 = 0$ · **`amp({terms:'00-01-10+11'},'signed')`**. F (2): (1) $\phi(a) = (-1)^a$ · **XOR table** (2) $\phi(a \oplus b) = \phi(a)\phi(b)$ on all four cases · **signed bars**. Check `f7SignsMultiply`.
**D5 · xor:b5 · $\sum_x(-1)^{a\cdot x} = 0$ for $a \ne 0$** — G (4): (1) $a = 110$ has a 1 in place 0 · **`br(['110','011'],'dot')`** (2) pair $x$ with $x \oplus 100$ · **`br(['011','100'],'xor')`** · *011 pairs with 111* (3) $a \cdot (x \oplus 100) = a \cdot x \oplus 1$: one 0, one 1 per pair (4) four pairs: the signs sum to 0 · **`amp({terms:'000+001-010-011-100-101+110+111'},'signed')`**. F (2): (1) $a \cdot (x \oplus e_k) = a \cdot x \oplus a_k$ · **pairing rows** (2) a fixed-point-free involution flipping the sign: sum 0 · **signed bars**. Check `f7SignSum110`.
**D6 · gf2:b4 · $\ker\begin{pmatrix}0&0&1\\1&1&1\end{pmatrix} = \{000, 110\}$** — G (4): (1) the two checks as rows · **`bx(['001','111'],0)`** (2) swap so a leading 1 is on top · **`bx(…,1)`** (3) XOR row 2 into row 1: 110, 001 · **`bx(…,2)`** (4) read off: last bit 0, first two equal: $s = 110$ · **`bm({table:T_SIM,n:3,m:2},'map')`** · *x and x ⊕ 110 share an output*. F (3): (1) RREF over $\mathbb F_2$ · **`bx(…,0)`** (2) pivots in columns 0, 2; rank 2 · **`bx(…,2)`** (3) free column 1 gives $s = 110$ · **Simon map**. Check `f7NullY`.
**D7 · cost:b2 · $3n^2 + 5n + 7 \le 4n^2$ for $n \ge 7$** — G (3): (1) need $n^2 \ge 5n + 7$ · **`plot('bigORatio',{markers:[6,7]})`** (2) $n = 6$: $36 < 37$; $n = 7$: $49 \ge 42$ (3) beyond 7, $n^2$ grows faster than $5n + 7$ · **`plot('nSquared',{x:1–20})`**. F (2): (1) $c = 4$, $n_0 = 6$ · **ratio plot** (2) hence $O(n^2)$ · **$n^2$ plot**. Check `f7BigOn0`.

## 3. Try-it widgets (all need W1 `bit-table`, §9.3; props as specified there; stand-in noted)
| Unit | Spec | Try this |
|---|---|---|
| boolean | `bit-table {mode:'gate', gate:'AND'}` | Click the four inputs: only 11 lights 1. Switch to XOR: two 1s, balanced. NAND: three 1s, neither. |
| reversible | `bit-table {mode:'gate', gate:'AND', view:'map'}` | Three arrows meet at 0: "not reversible". Pick CNOT: one arrow per output. Pick Toffoli: only 110 and 111 swap. |
| xor | `bit-table {mode:'strings', a:'1011', b:'0110'}` | Read $a \oplus b = 1101$ and $a \cdot b = 1$. Set $b$ to 1011: the XOR is 0000. Stand-in if W1 is deferred: `ghz-game {mode:'table', proof:true}` (each ±1 answer is a sign $(-1)^a$; flipping one toggle flips two rows, so the four-row product never changes). |
| gf2 | `bit-table {mode:'reduce', rows:['001','111']}` | Step: swap, then XOR; rank 2, null space 000 and 110. Toggle the second row to 011: the null space becomes 000 and 100. |
| cost | `bit-table {mode:'cost', n:10}` | Slide $n$: at 10, $n^2 = 100$, $2^n = 1024$. At 20: $2^n = 1\,048\,576$ and $2^{n/2} = 1024$. |

Checked in `planF78-numpy.py`: rows 001, 011 have null space {000, 100}; $1011 \cdot 0110 = 1$.

## 4. Challenges (tol 0.005 unless stated; integers tol 0; no sheet assigns F7: full walkthroughs; ⚑ items cited only)
- **boolean** 1 warm-up numeric `f7-b-and` rows of AND with output 1 → **1**. 2 core numeric `f7-b-count` Boolean functions of 3 bits → **256** (`f7Funcs3`). 3 stretch numeric `f7-b-bal` balanced 3-bit functions → **70** (`f7Balanced3`; hint: choose the 4 rows that say 1).
- **reversible** 1 warm-up numeric `f7-r-and0` inputs AND sends to 0 → **3**. 2 core choice `f7-r-tof` Toffoli on 110 → **111** ✓ · 110 · 011 · 100. 3 core numeric `f7-r-perm` reversible maps of two bits among 256 → **24**. 4 stretch numeric `f7-r-garbage` chance of 00 with garbage left → **0.625** (`f7GarbageP00`).
- **xor** 1 warm-up choice `f7-x-xor` $1011 \oplus 0110$ → **1101** ✓ · 1111 · 0010 · 1001. 2 core numeric `f7-x-dot` $110 \cdot 011$ → **1**. 3 core numeric `f7-x-sum` $\sum_x(-1)^{110\cdot x}$, 3 bits → **0**.
- **gf2** 1 warm-up numeric `f7-g-dist` $d(1011, 0110)$ → **3**. 2 core numeric `f7-g-syn` position read from syndrome 110 → **6**. 3 stretch choice `f7-g-null` nonzero $s$ with $001\cdot s = 111\cdot s = 0$ → **110** ✓ · 001 · 111 · 101.
- **cost** 1 warm-up numeric `f7-c-sort` pairwise comparisons for 10 names → **45**. 2 core numeric `f7-c-n0` least $n$ with $3n^2 + 5n + 7 \le 4n^2$ → **7**. 3 core numeric `f7-c-grover` Grover steps for $2^{20}$ items → **804**.

## 5. Glossary (new in 709 unless marked; checked against every F1–F6, Q1–Q17 glossary and Q15/Q16 in their worktrees)
| id | term | introduces | Ground | Formal | first |
|---|---|---|---|---|---|
| `qc-boolean-function` | Boolean function | notation | A rule that reads some bits and returns one bit. | $f : \{0,1\}^n \to \{0,1\}$. | boolean:b1 |
| `qc-truth-table` | truth table | — | A list of every input of a bit rule with its output. | The $2^n$ pairs $(x, f(x))$. | boolean:b1 |
| `qc-reversible-gate` | reversible gate | — | A gate whose output always tells you its input. | A bijection of $\{0,1\}^n$ (N&C p. 153). | reversible:b1 |
| `qc-permutation-matrix` | permutation matrix | notation | A 0/1 table with one 1 in each row and column. | $P_{\pi(j)j} = 1$; $P^{\top}P = I$. | reversible:b2 |
| `qc-landauer` | Landauer's principle | — | Erasing one bit releases at least a tiny, fixed amount of heat. | Erasure costs $\ge k_BT\ln2$ (N&C p. 153). | reversible:b4 |
| `qc-uncompute` | uncomputation | — | Running a circuit backwards to wipe its scrap bits. | $(x,0,0,y) \to (x,0,0,y \oplus f(x))$ (N&C p. 158). | reversible:b5 |
| `qc-gf2` | GF(2), bit-string space | space | Strings added with XOR and scaled by 0 or 1. | $\mathbb F_2^n$ over the field $\mathbb F_2$. | gf2:b1 |
| `qc-hamming-weight` | Hamming weight | notation | The number of 1s in a string. | $\mathrm{wt}(x) = \#\{j : x_j = 1\}$. | gf2:b2 |
| `qc-hamming-distance` | Hamming distance | — | How many places two strings differ in. | $d(x,z) = \mathrm{wt}(x \oplus z)$. | gf2:b2 |
| `qc-parity-check` | parity check | notation | A rule saying some bits must XOR to 0. | A row of $M$; $c$ passes iff $Mc = 0$. | gf2:b3 |
| `qc-big-o` | big-O | notation | A way to say how fast a cost grows, ignoring constants. | $f = O(g)$: $f \le cg$ for $n > n_0$. | cost:b2 |
| `qc-exponential-cost` | exponential cost | — | A cost that doubles when the input gains a fixed number of bits. | $2^{\Theta(n)}$, against polynomial $O(n^k)$. | cost:b3 |
Reused, with F7 notation beats: `qc-xor` (boolean:b4), `qc-bit-dot` (xor:b4). Reused as terms only: `qc-constant`, `qc-balanced`, `qc-toffoli`, `qc-parity`, `qc-query`, `qc-query-cost`.

## 6. Review cards
- **boolean** G: a function of bits is a table; $2^{2^n}$ of them; constant/balanced are rare; NAND builds all. F: $f:\{0,1\}^n\to\{0,1\}$; $\binom{2^n}{2^{n-1}}$ balanced. Eq $2^{2^n}$. Trap: thinking most functions are constant or balanced.
- **reversible** G: reversible = no two inputs share an output; $y \oplus f(x)$ makes any $f$ reversible; clean up garbage. F: bijection ⇒ permutation matrix ⇒ unitary; Landauer; Eqs. 3.7–3.8. Eq $(x, y) \mapsto (x, y \oplus f(x))$. Trap: "AND is fine if we keep the output".
- **xor** G: XOR is adding mod 2; signs multiply; a nonzero $a$ splits strings in half. F: $(-1)^{a\oplus b} = (-1)^a(-1)^b$; $a\cdot x$ linear. Eq $\sum_x(-1)^{a\cdot x} = 2^n\delta_{a,0}$. Trap: reading $a \cdot x$ as "count matching bits".
- **gf2** G: strings form a space; weight, distance, checks; XOR rows to solve. F: $\mathbb F_2^n$, RREF, $\ker$, syndrome $Me$. Eq $d(x,z) = \mathrm{wt}(x \oplus z)$. Trap: real-number independence carried over to bits.
- **cost** G: count steps as $n$ grows; $n^2$ is tame, $2^n$ is not; Grover's root is still exponential. F: $O, \Omega, \Theta$; polynomial = efficient. Eq $f = O(g)$. Trap: calling $\sqrt N$ an exponential speed-up.

## 7. Symbol-before-use
**7.1 Ground:** $n$, $f$, $2^n$ boolean:b1 · $\oplus$, $a, b$ boolean:b4 · $x, y$ reversible:b3 · $k_B, T, \ln$ reversible:b4 · $x_0, x_1, w$ reversible:b5 · $(-1)^a$ xor:b3 · $a\cdot x$ xor:b4 · $s$, $y\cdot s$ gf2:b4 · $O(\cdot)$ cost:b2 · $N$, $\sqrt N$ cost:b5 (in words first). **7.2 Formal:** adds $\{0,1\}^n$ boolean:b1 · $\binom{\cdot}{\cdot}$ boolean:b3 · $P$, $P^{\top}$ reversible:b2 · $U^\dagger$ (F4, bridged) reversible:b1 · $e_k$ xor:b5 · $\mathbb F_2$, $\mathbb F_2^n$ gf2:b1 · $\mathrm{wt}, d$ gf2:b2 · $M$ gf2:b3 · $\ker$, rank gf2:b4 · $\Omega, \Theta$ cost:b2 · $k^*$ cost:b4. Counts: 0 symbols used before definition in either track.

## 8. Errata
None in F7's pages. Silent notes: N&C's AND/OR/XOR gate names are images in the text layer (pp. 130–131), read from the
page; Bergou's p. 171 writes code-word sums as $x + y$ (mod 2), which F7 writes $x \oplus y$.

## 9. Engine, stage and widget needs
**9.1 Engine** (`physics/qc/bits.ts` additions; numpy block "f7"): `gateTable(name)` → `{n, m, out}` for NOT, AND, OR, XOR,
NAND, CNOT, SWAP, Toffoli, Fredkin · `isBijection(out, m)` · `preimageCount(out, v)` · `booleanCount(n)` ($n \le 4$) ·
`balancedCount(n)` · `landauerJ(T)` with `K_B` and `EV` constants · `gf2RowReduceSteps(M)` (snapshots after each swap/XOR,
same RREF as `gf2RowReduce`) · `bigORatio(n)`. Reused: `xor`, `dotMod2`, `hammingWeight`, `hammingDistance`, `isBalanced`,
`reversibleOracle`, `permutationMatrix`, `gf2Rank`, `gf2Nullspace`, `gf2MatVec`, `hammingParity`, `runCircuit`, `detN`,
`groverOptimalK`, Q16's `djDeterministicWorst`.
**9.2 Stage.** **S1 `bits` (new SVG kind, skill 10)** — `{kind:'bits'; fn?: {source: {gate: BitsGate} | {table: number[]; n:
number; m: number}; view: 'table' | 'map'; mark?: string[]}; rows?: {strings: string[]; combine?: 'xor' | 'dot'; against?:
string}; reduce?: {strings: string[]; upTo: Scrub}; shot?}`, exactly one of `fn`/`rows`/`reduce`; n ≤ 3 in, m ≤ 3 out,
strings ≤ 8 bits, ≤ 4 rows. `map` draws inputs left, outputs right, one arrow each; readout "reversible" or "k inputs → one
output". `rows`: cells filled for 1; `combine` adds a computed last row (`dot` = AND then parity); `against` gives each row's
dot with that word (a syndrome column); readouts weight, distance. `reduce`: RREF after `upTo` steps, pivots outlined,
readouts rank and null space. Print mode = the same SVG. Signature picture (brief): AND's merging arrows beside CNOT's
bijection. **S3 `plot` names** (additive): `'nSquared'`, `'twoToN'`, `'sqrtTwoToN'`, `'bigORatio'`. Existing kinds as used.
**9.3 Widget W1 `bit-table`** (S1 drawn from controls, the `ComplexPlaneQc` pattern): `{mode: 'gate' | 'strings' | 'reduce'
| 'cost'; gate?: BitsGate; view?: 'table' | 'map'; a?: string; b?: string; rows?: string[]; n?: number}`. Serves Q15 (pad),
Q16 (dot product), Q18 (Simon), Q21–Q22 (checks).

## 10. Media (deferred, per BUILD-LOG)
Film `qc-f7-merge` "Arrows that merge cannot run backwards": AND's map, then CNOT's, then Toffoli's 8 → 8 (manifest keys
`f7AndZeroPre`, `f7Perms22`, `f7Tof110`). Decor: none new.

## 11. Hooks
**11.1 Concept stations:** `qc-f7-boolean` "Functions of bits as truth tables" (needs `qc-joint-space-station`; sameAs —, links
448 `order`) · `qc-f7-reversible` "Reversible gates and uncomputation" (needs `qc-f7-boolean`, `qc-matrix-of-map`, `qc-f4-unitary`) ·
`qc-f7-xor` "XOR, signs and the bit dot product" (needs `qc-f7-boolean`) · `qc-f7-gf2` "Linear algebra over bits" (needs
`qc-f7-xor`) · `qc-f7-cost` "Counting cost: polynomial versus exponential" (needs `qc-f7-boolean`).
**11.2 Arcade (Spot the error; `F7x` labels):** `qc-and-undo` (boolean→reversible: "AND's output 0 tells you the input was 00";
why `f7AndZeroPre` = 3) · `qc-balanced-common` ("most 3-bit functions are balanced"; why 70 of 256) · `qc-xor-carry` ("$1 \oplus 1
= 10$"; why the carry is dropped) · `qc-gf2-independent` ("110, 011, 101 are independent, so the rank is 3"; why `f7RankGF2_dep`)
· `qc-root-exponential` ("$\sqrt N$ search is an exponential speed-up"; why $2^{n/2}$).
**11.3 Bridges.** Out (F7 → target): `qc-f6-pairs` (exists) boolean:b1 G · `qc-l1-logic` (exists) boolean:b5 reveal F, "Spin
Lab 1.4: for atoms, 'up OR right' depends on order; bits do not" · NEW `qc-f4-unitary` → F4 `f4-unitary` (reversible:b2 F) ·
`qc-f3-matrix-of-map` (exists) reversible:b2 F · `qc-f2-vectors` (exists) gf2:b1 F. In (NEW ids, added by the wiring pass):
`qc-f7-boolean` ← q5-problem:b1 (G/F), q16-dj:b1 (F) · `qc-f7-reversible` ← q5-oracle:b1 (G), q5-oracle:b5 (G/F) ·
`qc-f7-xor` ← q4-cnot:b2 (G), q15-otp:b2 (G/F), q16-hadamard-n:b2 (F), q16-hadamard-n:b3 (F, the pairing) · `qc-f7-gf2` ←
Q18's Simon unit, Q21/Q22 check matrices (when planned) · `qc-f7-cost` ← q16-classical-cost:b1 (G/F), q17-oracle:b1 (F).

## Rulings requested
- R1 Build S1 `bits` (SVG kind) and W1 `bit-table` inside the F7 build (as Q17 built `grover-plane`)? F7 has no honest widget without W1.
- R2 Five units (the map's `f7-binary` folded into boolean:b1 with a bridge to F6, which owns $2^n$ strings and the index) — confirm.
- R3 Unit order boolean → reversible → xor → gf2 → cost, with $\oplus$ introduced at boolean:b4 (half-adder) so reversible:b3 can use it.
- R4 F7 sets `introduces` on Q4's `qc-xor` and Q16's `qc-bit-dot` (the F6 precedent) rather than minting duplicate ids.
- R5 The check matrix is written $M$, not Bergou's $H$ (Hadamard keeps $H$); one Rosetta line at gf2:b3.
- R6 reversible:b6's clue shows $H$ gates on a 3-wire circuit (Q4 notation, before Q4 in reading order); captions name them "mixing gates (Chapter Q4)". Accept, or make the clue Formal-only?
- R7 Build after Q16 merges (`qc-bit-dot`, `qc-query-cost`, `djDeterministicWorst`); F7 and F8 may build in parallel with F8 citing "Unit F7.3" in words until the wiring pass.
- R8 N&C Ex. 3.8 (NAND universality) and Bergou P1.3–P1.4 stay ⚑ cited-only; boolean:b4 states the identities (engine-checked), no exercise walkthrough.
