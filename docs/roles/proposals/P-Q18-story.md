# P-Q18-story — Q18 "Hidden periods: Simon, the QFT and phase estimation" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q17-story.md`'s sections, one line per field. Standing gates: ≥ 2
distinct derivation views per track (W-709 #11); one notation beat per new notation (W-709 #12). Map row: `P-709-map.md` §8
(drafted as "Q16"; `outline.ts` numbers it Q18, Part VII). **Phase `'books'`:** ramp `[B]`, clues `[C]`, Go-deeper `[D]` last in its
unit (`deeperProblems` lint: a unit never opens with one, and a deeper beat introduces nothing).

**Sources read** (paraphrased; printed pages). Bergou Ch. 7 (printed = PDF − 10): p. 126 Simon (Eqs. 7.30–7.33); p. 127 the QFT
(7.34–7.35), Fig. 7.6; p. 128 (7.36–7.41); p. 129 (7.42–7.44); p. 130 counting; P7.2 p. 142 (⚑, controlled-U with eigenvalues ±1:
cited only). **Page images checked:** pp. 126, 127, 129, 130. N&C (printed = PDF − 28): §5.1 pp. 217–221 (Eqs. 5.1–5.11, product form
5.4, Fig. 5.1, Box 5.1, Exs. 5.2, 5.5); §5.2 pp. 221–225 (Figs. 5.2–5.3, Eqs. 5.20–5.35, Ex. 5.8 ⚑); §5.3.1 pp. 226–230 (Eqs. 5.36–5.44,
Box 5.2); §5.4.3 pp. 240–242 (Fig. 5.5, Eq. 5.77); chapter notes p. 246 (Simon → Shor); §6.3 pp. 261–263 (counting, Eq. 6.33). No 709
notes cover Ch. 7; HW1/HW2 submitted, no HW3; no sheet assigns any problem used here, so every walkthrough is full.

**Ownership.** F7 owns ⊕, the bit dot product and GF(2) elimination (`qc-f7-xor`, `qc-f7-gf2`; F7 gf2:b4 already solves $s = 110$ from
001, 111). F8 owns roots of unity, the DFT matrix, geometric sums and the $2/\pi$ bound, binary and continued fractions, gcd and the
order (rulings F7F8 R5: the product form and phase estimation are Q18's). Q4 owns $P(\chi)$, $S$, $T$, SWAP; Q5 the ±1 kickback; Q16
the signs of $H^{\otimes n}$; Q17 $Q$, $\alpha$, $|w_0\rangle$ and the Grover plane. **Q18 owns:** Simon's algorithm, $U_F$, its product
form and circuit, kickback with any eigenphase, phase estimation and its bounds, quantum counting, order finding, hidden subgroups.

**Evidence.** Scratchpad `planQ18-numpy.py` (numpy only): route A dense state vectors built gate by gate (q0 = top wire = most
significant bit: the Simon, QFT, phase-estimation and counting circuits below), route B closed forms (Eqs. 7.33, 7.38, N&C 5.4, 5.39),
plus a 200 000-run Monte Carlo of Simon's run count; **79 asserted checks, 0 failed**. `planQ18-extra.py`: order-finding distributions,
N&C's precision example. Every number below comes from these scripts.

**Conventions.** Simon: $n = 3$, $s = 110$ (F7's string; Bergou writes $\xi$), $f(x) = \min(x, x \oplus s)$, two output wires (f takes
four values). QFT: $m$ wires, input $|a\rangle$, output $|y\rangle$, $U_F|a\rangle = 2^{-m/2}\sum_y e^{2\pi iay/2^m}|y\rangle$ (sign $+$, =
F8's $F_N$). Eigenphase **$\varphi$ is a fraction of a turn** (both books), angle $2\pi\varphi$; Rosetta at kickback:b1 (Ruling 1).
Running phases $\varphi = 0.101_2 = 5/8$ (F8's $225°$), $1/3$, $0.1011_2 = 11/16$. Counting: $N = 4$ ($n = 2$ search wires), $m = 3$.
Order finding: $N = 21$, $x = 2$, $r = 6$ (F8). Cross-references "Unit 18.2", "Chapter Q17". Claim keys `q18…`; twins
`pipeline/claims_qc709/q18.py`.

**Stage shorthand.** `circ(C,k[,o])` = `{kind:'circuit', circuit:C, upTo:k, outcomes:o}` · `amp(C,k[,o],mode,f)` (state `{circuit:C,
upTo:k, outcomes:o}`) · `ampK(C,k,j)` = `amp(…,'probability',{keep:j})` (**S2**) · `qamp(a,f)` = `{kind:'amplitudes', state:{ket:a},
dft:true, ...f}` · `mx(src)` (`labels:'none'`) · `cp(f)` · `bm(T,view,mark)` = bits `fn` with `{table:T, n:3, m:2}` · `br(rows,f)` = bits
`rows` · `bx(rows,k)` = bits `reduce` · `gp(n,k,f)` = `{kind:'grover-plane', search:{n}, k, ...f}` · `PEB3` = `{kind:'plot', curve:{fn:
'peBest3'}, markers:[{x:0.625},{x:0.6875},{x:1/3}], yLines:[{y:4/π², label:'4/π²'}]}` (**S1**) · `COMB32` = F8's terms
`'00000+00110+01100+10010+11000+11110'` · `EIG6` = `{spokes:{phasesDeg:[0,60,…,300]}, clock:6}` · `split(a / b)`. Every angle, table and
matrix is computed in code from the engine (§9.1), never typed.

**Circuits.** `C_S` 5 wires (q0–q2 input, q3–q4 answer), init `00000`: [H×3], [oracle xor, inputs q0–q2, table `F_HI` = [0,0,1,1,1,1,0,0], target 3,
label $U_f$], [oracle xor, `F_LO` = [0,1,0,1,0,1,0,1], target 4, $U_f$], [measure q3, q4], [H×3]; outcomes `'01'`. `C_QFT3(a)` init $a$:
[H q0], [S ctrl q1 → q0, $R_2$], [T ctrl q2 → q0, $R_3$], [H q1], [S ctrl q2 → q1, $R_2$], [H q2], [SWAP q0 q2] (7 columns; inverse =
reversed, S†, T†). `C_K` init `01`: [H q0], [P(2πφ) ctrl q0 → q1, $U$]. `C_PE(φ,m,t='1')` $m+1$ wires, init `0…0t`: [H×m], then $U$
from $q_{m-1}$, $U^2$ from $q_{m-2}$, …, $U^{2^{m-1}}$ from $q_0$ (Fig. 7.6; P gates, angles in code), then $U_F^{-1}$: 11 columns for
$m = 3$, 16 for $m = 4$; kick done at $k = m + 1$. `C_CNT(marked)` 5 wires (q0–q2 count, q3–q4 search), init `00000`: [H×5], [unitary
$Q$ ctrl q2], [$Q^2$ ctrl q1], [$Q^4$ ctrl q0] (4×4 matrices from `groverQMatrix(2, marked)`), $U_F^{-1}$ on q0–q2: 11 columns.

## 0. Chapter map
**Driving question:** "How can a quantum computer find the rhythm hidden inside a function, or inside a gate?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q18-simon` | A hidden string from a few runs | How can a box's hidden XOR shift be found? | Bergou p. 126 (7.30–7.33); N&C pp. 241, 246 | `qc-f7-xor`, `qc-f7-gf2`, Q16 |
| 2 | `q18-qft` | A Fourier transform built from small gates | How is a register Fourier-transformed in $m^2$ gates? | Bergou p. 127 (7.34–7.35); N&C pp. 217–221 | `qc-f8-dft`, `qc-f8-fractions`, Q4 |
| 3 | `q18-kickback` | Controlled powers write a phase on controls | Where does a controlled gate's eigenvalue go? | Bergou pp. 127–128 (Fig. 7.6, 7.36–7.37); N&C pp. 221–222 | Q5 `qc-phase-kickback`, `qc-f4-unitary` |
| 4 | `q18-phase-est` | Reading a phase digit by digit | How sure is the answer when the phase does not fit? | Bergou pp. 128–129 (7.38–7.43); N&C pp. 222–225 | `qc-f8-geometric` |
| 5 | `q18-counting` | Counting marked items by Grover's turn | How does a turn angle count marked items? | Bergou pp. 129–130 (7.44); N&C pp. 261–263 | Q17 |
| 6 | `q18-order` | Order finding: the quantum step of factoring | How does phase estimation find the order that cracks 21? | N&C pp. 226–230, 240–242 | `qc-f8-euclid`, `qc-f8-roots`, `qc-f8-fractions` |

**Outcomes:** run Simon's circuit, explain why only $y \in s^\perp$ survive and solve for $s$ from $n - 1$ checks · write $U_F$, its
product form and its $\Theta(m^2)$ circuit · show that controlled-$U^{2^j}$ writes $2^j\varphi$ on the controls · run phase estimation,
exactly for $\varphi = a/2^m$ and with $P \ge 4/\pi^2$ otherwise · count marked items from $Q$'s eigenphases · state order finding and
how it factors 21. **Prerequisites:** `qc-f7-gf2`, `qc-f8-dft`, `qc-f8-fractions`, `qc-f8-geometric`, `qc-phase-kickback`,
`qc-hadamard-signs` (Q16), `qc-grover-iterate` (Q17), `qc-phase-gate` (Q4). **Openers:** none (Part VII's sits before Unit 17.2).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: simon bits, circuit, amplitudes · qft matrix, amplitudes, complex-plane, circuit · kickback complex-plane, circuit, amplitudes ·
phase-est circuit, amplitudes, complex-plane, plot · counting grover-plane, matrix, circuit, amplitudes · order complex-plane, amplitudes, bits.

### Unit `q18-simon` — A hidden string from a few runs
**b1 [B]** (the promise) · Terms `qc-simon-problem`, `qc-promise-problem` (Q16) · Bridge `qc-f7-xor`
- G: "A black box takes three bits $x$ and answers $f(x)$. Its promise: two inputs share an answer exactly when they differ by a secret string $s$, so $f(x) = f(x \oplus s)$ (<<qc-f7-xor|Unit F7.3>>). Here $s = 110$, and the eight inputs form four pairs."
- F: "[[qc-simon-problem|Simon's problem]] (Bergou §7.4, Eq. 7.30, p. 126): $f$ on $\{0,1\}^n$ is 2-to-1 with $f(x) = f(y) \Leftrightarrow y = x \oplus s$, $s \ne 0$; find $s$ with poly($n$) queries. Bergou writes $\xi$ for $s$. For $n = 3$, $s = 110$: pairs $\{000,110\}$, $\{001,111\}$, $\{010,100\}$, $\{011,101\}$."
- Cap G "the box as arrows: 001 and 111 both go to the answer 01" · F "$f(x) = f(x \oplus 110)$: four answers, two inputs each; 001, 111 outlined" · Stage `bm(F_S,'map',['001','111'])` · Claims `q18SimonPairs` (4 answers × 2 inputs), `q18SimonF001` (f(001) = f(111) = 1).

**b2 [B]** (one query, then read the answer wires)
- G: "Mix the three input wires with Hadamards and ask the box once: eight bars of $0.3536$, one per input with its answer. Now read only the two answer wires. Each answer has chance $0.25$; say it reads 01. Only 001 and 111 fit, so two bars of $0.7071$ remain."
- F: "$H^{\otimes3}$ then $U_f|x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle$ give $2^{-3/2}\sum_x|x\rangle|f(x)\rangle$ (Eqs. 7.31–7.32; two answer wires suffice, as $f$ takes four values). Reading them yields $f(z)$ for a uniform $z$, chance $0.25$ each, and leaves $(|z\rangle + |z \oplus s\rangle)/\sqrt2$ (Bergou's $x_0$ is our $z$): here $(|001\rangle + |111\rangle)/\sqrt2$."
- Cap G/F "after the answer wires read 01: two bars of 0.7071, at 00101 and 11101 (first three bits the input)" · Stage `split(circ(C_S,4,'01') / amp(C_S,4,'01','amplitude'))` · Claims `q18SimonQueryBar` 0.3536, `q18SimonOutChance` 0.25, `q18SimonPairBar` 0.7071.

**b3 [B] · notation beat, `introduces: ['qc-s-perp']`** (the Hadamards again; D1) · Terms `qc-s-perp`, `qc-bit-dot` (F7)
- G: "Put Hadamards on the input wires again. Each string $y$ gets one sign from 001 and one from 111, and they cancel when $y \cdot s = 1$. Four bars survive, each $\pm0.5$: the set $s^\perp$ of strings with $y \cdot s = 0$, here 000, 001, 110 and 111."
- F: "By Chapter Q16's sign rule, $H^{\otimes n}(|z\rangle + |z\oplus s\rangle)/\sqrt2 = 2^{-(n+1)/2}\sum_y(-1)^{z\cdot y}(1 + (-1)^{s\cdot y})|y\rangle = 2^{-(n-1)/2}\sum_{y\in s^\perp}(-1)^{z\cdot y}|y\rangle$, where [[qc-s-perp|$s^\perp = \{y : y\cdot s = 0\}$]] (Eq. 7.33; the printed last line keeps $2^{-(n+1)/2}$: Correction box). Each of its $2^{n-1} = 4$ strings is read with chance $0.25$."
- Cap G/F "after the second Hadamards: four bars ±0.5 at y = 000, 001, 110, 111 (answer wires still 01)" · Stage `split(circ(C_S,5,'01') / amp(C_S,5,'01','signed'))` · Claims `q18SimonYBar` 0.5, `q18SimonPerpCount` 4, `q18SimonBadY` 0, `q18SimonPrintedNorm2` 0.25 · Derivation D1.

**b4 [B]** (solve over GF(2)) · Bridge `qc-f7-gf2`
- G: "Each run gives one check, $y \cdot s = 0$. Two independent checks pin $s$ down. From 111 and 110, row moves leave 110 and 001, so $s = 110$ (<<qc-f7-gf2|Unit F7.4>>). Three independent checks would allow only $s = 000$."
- F: "Repeat until $n - 1 = 2$ independent $y$'s, then solve $Ys = 0$ over $\mathrm{GF}(2)$ (<<qc-f7-gf2|Unit F7.4>>): rows 111, 110 reduce to 110, 001, null space $\{000, 110\}$. All of $s^\perp$ has rank $n - 1 = 2$; Bergou's '$n$ independent equations' would force $s = 0$ (Correction box)."
- Cap G/F "the checks 111 and 110 after two moves: rank 2, null space 000 and 110" · Stage `bx(['111','110'],2)` · Claims `q18SimonRank` 2, `q18SimonNull` [000, 110], `q18PerpRank` 2, `q18ThreeForceZero` [000].

**b5 [C]** (wasted runs)
- Q G: "One run reads 000, and another repeats an earlier $y$. Do they help? On average, how many runs does $s = 110$ take?" · Q F: "Each run returns $y$ uniform on $s^\perp$. What is the chance that $n - 1 = 2$ runs suffice, and the expected number of runs?"
- Reveal G: "Neither helps: 000 passes every check, and a repeat adds nothing new. Two runs are enough with chance $0.375$. On average it takes $3.33$ runs, a handful." · Reveal F: "$y = 000$ and repeats add no rank: $P(\text{rank 2 after two runs}) = \tfrac34\cdot\tfrac24 = 0.375$, and the expected count is $\tfrac43 + 2 = 3.33$. It grows like $n$ ($10.60$ at $n = 10$): Bergou's $O(n)$ runs."
- Cap G/F "four readings, chance 0.25 each; the checks 110 and 110 reduce to rank 1" · Stage q `ampK(C_S,5,3)` (outcomes '01'); reveal `split(bx(['110','110'],1) / ampK(C_S,5,3))` · Claims `q18SimonTwoRuns` 0.375, `q18SimonExpRuns` 3.33, `q18SimonExpRuns10` 10.60.

**b6 [D]** (what a classical search needs)
- G: "Without quantum help, $s$ shows up only when two queries collide: same answer, different inputs. Then $s$ is their XOR. Three random queries collide with chance $0.4286$ here; for $n$ bits it takes about $2^{n/2}$ queries."
- F: "Classically $s = x \oplus x'$ needs a collision $f(x) = f(x')$; $k$ distinct queries hold one with probability at most $k(k-1)/(2(2^n - 1))$ (union bound, our calculation), exactly $3/7 = 0.4286$ at $n = 3$, $k = 3$. So $\Omega(2^{n/2})$ queries, against $O(n)$ runs (Simon's 1994 paper, cited in N&C p. 246)."
- Cap G/F "a collision: 010 ⊕ 100 = 110, the secret string" · Stage `br(['010','100'],{combine:'xor'})` · Claims `q18SimonCollide3` 0.4286, `q18CollisionXor` 110.

### Unit `q18-qft` — A Fourier transform built from small gates
**b1 [B] · notation beat, `introduces: ['qc-qft']`** · Bridge `qc-f8-dft`
- G: "Simon used Hadamards. Shor swapped them for the [[qc-qft|quantum Fourier transform]] $U_F$: the transform of <<qc-f8-dft|Unit F8.4>>, applied to a register's amplitudes. On $m$ wires it sends the number $a$ to an even spread over all strings $y$, turned by $e^{2\pi iay/2^m}$. For $m = 3$ its table is $F_8$."
- F: "$U_F|a\rangle = 2^{-m/2}\sum_{y=0}^{2^m-1}e^{2\pi iay/2^m}|y\rangle$ (Bergou Eq. 7.34, prefactor corrected; N&C Eq. 5.2, p. 217), with $ay$ an ordinary product of integers, not §7.1's bit dot. On amplitudes it is $F_{2^m}$ (<<qc-f8-dft|Unit F8.4>>). Shor's step put it where Simon had $H^{\otimes n}$ (N&C p. 246)."
- Cap G "U_F on three wires: an 8 × 8 table, entry (y, a) coloured by the turn 45°·ay" · F "$U_F = F_8$, $(F_8)_{ya} = e^{2\pi iay/8}/\sqrt8$" · Stage `mx({dft:8})` (`values:'none'`, `labels:'indices'`) · Claims `q18F8Entry00` 0.3536, `q18QftIsF8` (gap 0).

**b2 [B]** (one column, and the prefactor)
- G: "Feed in $|101\rangle$, the number 5. Out comes an even spread over all eight strings, each of size $0.3536$, turning $225°$ from one string to the next. Read now, every string has chance $0.125$: the turns are hidden from a single reading."
- F: "$|\langle y|U_F|101\rangle| = 2^{-3/2} = 0.3536$ with phase $225°\cdot y$; one reading gives each $y$ with probability $0.125$, so the amplitudes cannot be read out (N&C p. 220). Bergou's printed $1/2^m$ would make the squared sizes add to $2^{-m} = 0.125$ (Correction box); his Eqs. 7.36 and 7.38 carry $2^{-m/2}$ and $2^{-m}$."
- Cap G/F "the transform of 101: eight bars of 0.3536, dials turning 225° per string" · Stage `qamp('101',{dials:true})` · Claims `q18Qft101Bar` 0.3536, `q18Qft101Step` 225, `q18Qft101Chance` 0.125, `q18QftPrintedNorm2` 0.125.

**b3 [B]** (the product form; D2) · Terms `qc-qft-product-form` · Bridge `qc-f8-fractions`
- G: "The spread is a product: each output wire gets its own turn. For 101 the top wire turns $180°$, the middle $90°$ and the bottom $225°$. Those are the binary fractions $0.1$, $0.01$ and $0.101$ of a turn (<<qc-f8-fractions|Unit F8.6>>)."
- F: "With $a = 2^{m-1}a_1 + 2^{m-2}a_2 + \cdots + a_m$ (Bergou p. 127 prints $2^{m-1}$ twice: Correction box), $U_F|a\rangle = \bigotimes_{l=1}^m(|0\rangle + e^{2\pi i\,0.a_{m-l+1}\cdots a_m}|1\rangle)/\sqrt2$, wire $l$ counted from the top (N&C Eq. 5.4, p. 218). For 101: $180°$, $90°$, $225°$."
- Cap G/F "the transform of 101 beside its three wire turns, 180°, 90°, 225° (top to bottom)" · Stage `split(qamp('101',{dials:true}) / cp({spokes:{phasesDeg:[180,90,225]}}))` · Claims `q18Prod101` [180, 90, 225], `q18ProdIsQft` (gap 0, all 8 inputs), `q18ExpandPrinted110` 8 · Derivation D2.

**b4 [B] · notation beat, `introduces: ['qc-controlled-rk']`** (the circuit and its cost)
- G: "Build it from small gates. On each wire a Hadamard writes that wire's digit, then the controlled turns [[qc-controlled-rk|$R_2 = S$ and $R_3 = T$]] add the digits below it. A swap puts the wires in order. Three wires need 6 gates and a swap; ten wires need 55 and 5 swaps."
- F: "$R_k = \mathrm{diag}(1, e^{2\pi i/2^k}) = P(2\pi/2^k)$ (N&C Eq. 5.11), so $R_2 = S$, $R_3 = T$ (Chapter Q4). H, $cR_2$, $cR_3$ on wire 1, H, $cR_2$ on wire 2, H on wire 3, then SWAP(1, 3), equals $F_8$ (N&C Fig. 5.1, Box 5.1). That is $m(m+1)/2$ gates plus $\lfloor m/2\rfloor$ swaps, $\Theta(m^2)$, against $\Theta(m2^m)$ for the FFT: $55$ vs $10240$ at $m = 10$ (pp. 219–220)."
- Cap G/F "the QFT circuit on 101, seven columns, and its output: the same eight bars" · Stage `split(circ(C_QFT3('101'),7) / amp(C_QFT3('101'),7,'amplitude',{dials:true}))` · Claims `q18QftCircuitIsF8` 0, `q18QftGates3` 6, `q18QftGates10` 55, `q18QftSwaps10` 5, `q18Fft10` 10240.

**b5 [C]** (only Hadamards?)
- Q G: "What does the QFT do to $|000\rangle$? Is it just a Hadamard on every wire?" · Q F: "Compute $U_F|000\rangle$ (N&C Ex. 5.2) and compare $U_F|001\rangle$ with $H^{\otimes3}|001\rangle$."
- Reveal G: "On $|000\rangle$ it gives the even mix, exactly as three Hadamards do. But on $|001\rangle$ its arrows turn $45°$ per string, while Hadamards give only plus and minus. The controlled turns make the difference." · Reveal F: "$U_F|0\rangle = H^{\otimes m}|0\rangle$ (every digit 0, every factor $|+\rangle$), but $U_F|001\rangle$ has phases $45°\cdot y$ while $H^{\otimes3}|001\rangle = \pm2^{-3/2}$: their largest entry gap is $0.7071$. Without the $R_k$ each wire would keep one digit only."
- Cap G/F "question: the transform of 000, eight equal bars; reveal: the transform of 001, dials turning 45° per string (top), and the QFT circuit on 001 (bottom)" · Stage q `qamp('000')`; reveal `split(qamp('001',{dials:true}) / circ(C_QFT3('001'),7))` · Claims `q18Qft000IsH` 0, `q18Qft001VsH` 0.7071.

### Unit `q18-kickback` — Controlled powers write a phase on controls
**b1 [B] · notation beat, `introduces: ['qc-eigenphase']`** · Bridge `qc-f4-unitary`
- G: "Some state $|u\rangle$ is only turned by a gate $U$, never moved: $U|u\rangle = e^{2\pi i\varphi}|u\rangle$. The [[qc-eigenphase|eigenphase]] $\varphi$ counts turns, from 0 up to 1. Here $\varphi = 0.101_2 = 0.625$ of a turn, which is $225°$."
- F: "A unitary's eigenvalues have size 1 (<<qc-f4-unitary|Unit F4.4>>), so $U|u\rangle = e^{2\pi i\varphi}|u\rangle$ with $0 \le \varphi < 1$ (Bergou p. 127, who writes $|\psi\rangle$; N&C p. 221). Rosetta: as in both books, $\varphi$ is a fraction of a turn and the angle is $2\pi\varphi$. Running: $U = P(2\pi\varphi)$ (Chapter Q4), $|u\rangle = |1\rangle$, $\varphi = 0.625$."
- Cap G/F "the eigenvalue $e^{2\pi i\varphi}$ for $\varphi = 0.625$: an arrow at 225°" · Stage `cp({z:{r:1, phiDeg:225}, show:['arg']})` · Claims `q18Phi` 0.625, `q18PhiDeg` 225.

**b2 [B]** (kickback; D3) · Terms `qc-phase-kickback` (Q5)
- G: "Put a control wire in $|+\rangle$ and run controlled-$U$ on $|u\rangle$. The target stays $|u\rangle$. The turn lands on the control, which becomes $(|0\rangle + e^{2\pi i\varphi}|1\rangle)/\sqrt2$. This is Chapter Q5's [[qc-phase-kickback|phase kickback]], with any angle instead of a sign."
- F: "$(|0\rangle + |1\rangle)|u\rangle/\sqrt2 \mapsto (|0\rangle|u\rangle + |1\rangle U|u\rangle)/\sqrt2 = (|0\rangle + e^{2\pi i\varphi}|1\rangle)|u\rangle/\sqrt2$: the eigenvalue becomes the control's relative phase, $225°$ here, and the target is untouched. Chapter Q5's oracle was the case $e^{2\pi i\varphi} = -1$."
- Cap G/F "controlled-U on |+⟩|1⟩: the |11⟩ bar's dial turned 225°; the target still reads 1" · Stage `split(circ(C_K,2) / amp(C_K,2,'amplitude',{dials:true}))` · Claims `q18KickTarget` 1, `q18KickPhase` 225 · Derivation D3.

**b3 [B]** (powers double the turn; the controls hold a QFT) · Bridge `qc-f8-fractions`
- G: "Give three controls the powers $U^4$, $U^2$ and $U$. Doubling a turn shifts its binary digits left, and whole turns drop out (<<qc-f8-fractions|Unit F8.6>>). The controls turn $180°$, $90°$ and $225°$: exactly the wire turns of $U_F|101\rangle$ in Unit 18.2."
- F: "Controlled-$U^{2^j}$ writes $e^{2\pi i2^j\varphi}$, and $2^j\cdot0.\varphi_1\varphi_2\ldots$ keeps the digits after the $j$th: $0.1$, $0.01$, $0.101$ on wires 1–3 (Fig. 7.6). Multiplied out, $2^{-m/2}\bigotimes_j(|0\rangle + e^{2\pi i2^j\varphi}|1\rangle) = 2^{-m/2}\sum_y e^{2\pi i\varphi y}|y\rangle$ (Eq. 7.37), which is $U_F|a\rangle$ when $\varphi = a/2^m$."
- Cap G/F "after the three controlled powers: the eight live bars' dials match the transform of 101 (last bit the target, 1)" · Stage `split(circ(C_PE(5/8,3),4) / amp(C_PE(5/8,3),4,'amplitude',{dials:true}))` · Claims `q18Kick3` [180, 90, 225], `q18KickIsQft` 0.

**b4 [C]** (a target that is not an eigenstate)
- Q G: "Run the three controls with the target in $|+\rangle$, which $U$ does more than turn. Then undo the QFT and read. What comes out?" · Q F: "With target $|+\rangle = (|0\rangle + |1\rangle)/\sqrt2$, apply the controlled powers and $U_F^{-1}$. What is the reading's distribution?"
- Reveal G: "$|+\rangle$ is half $|0\rangle$, which $U$ leaves alone, and half $|1\rangle$, which $U$ turns by $225°$. The controls carry both patterns. The reading is 000 or 101, each with chance $0.5$." · Reveal F: "$|+\rangle$ mixes the eigenphases 0 and 0.625 with weights $\tfrac12$, so the output is $(|000\rangle|0\rangle + |101\rangle|1\rangle)/\sqrt2$: 000 or 101 with probability $|c_u|^2 = 0.5$ each (N&C pp. 224–225; Ex. 5.8 ⚑ cited). Unit 18.5 uses exactly this."
- Cap G/F "target |+⟩: the reading is 000 or 101, chance 0.5 each" · Stage q `circ(C_PE(5/8,3,'+'),4)`; reveal `split(circ(C_PE(5/8,3,'+'),11) / ampK(C_PE(5/8,3,'+'),11,3))` · Claims `q18PlusHalf` 0.5.

### Unit `q18-phase-est` — Reading a phase digit by digit
**b1 [B]** (the exact case; D4) · Terms `qc-phase-estimation`
- G: "[[qc-phase-estimation|Phase estimation]] finishes the job: run the QFT backwards on the controls. For $\varphi = 0.101_2$ they hold $U_F|101\rangle$, so undoing it leaves 101 for certain. Three digits of $\varphi$ are read straight off the wires."
- F: "Apply $U_F^{-1}$ (the QFT circuit reversed, $S \to S^\dagger$, $T \to T^\dagger$; N&C Ex. 5.5) to Eq. 7.37. For $\varphi = a/2^m$ it returns $|a\rangle$ (Bergou p. 128; N&C Eqs. 5.21–5.22): the reading is 101 with probability 1, so $\varphi = 0.101_2$ exactly."
- Cap G/F "the whole circuit for φ = 0.625: the first three wires read 101 with chance 1" · Stage `split(circ(C_PE(5/8,3),11) / ampK(C_PE(5/8,3),11,3))` · Claims `q18PeExact` 1 · Derivation D4.

**b2 [B]** (a phase that does not fit)
- G: "Most phases never end in binary. One third is $0.0101\ldots_2$, which three wires cannot hold, so the reading spreads. The nearest answer, 011 (that is $0.375$), still has chance $0.6878$; the next, 010, has $0.1749$."
- F: "Write $\varphi = a/2^m + \delta$ with $a$ the nearest $m$-bit integer and $0 < |\delta| \le 2^{-(m+1)}$ (Bergou p. 128). After $U_F^{-1}$, $|x\rangle$ has amplitude $2^{-m}\sum_y e^{2\pi i(\varphi - x/2^m)y}$ (Eq. 7.38). For $\varphi = \tfrac13$, $m = 3$: $a = 3$, $\delta = -0.0417$, $P(011) = 0.6878$, $P(010) = 0.1749$."
- Cap G/F "φ = 1/3 on three wires: the tallest bar 011 at 0.6878, then 010 at 0.1749" · Stage `split(circ(C_PE(1/3,3),11) / ampK(C_PE(1/3,3),11,3))` · Claims `q18Pe13Best` 0.6878, `q18Pe13Next` 0.1749, `q18Pe13a` 3, `q18Pe13Delta` −0.0417.

**b3 [B]** (never below 4/π²; D5) · Bridge `qc-f8-geometric`
- G: "How bad can it get? The best answer's amplitude is a chain of eight arrows, each turned a little more than the last (<<qc-f8-geometric|Unit F8.5>>). The worst case is halfway between two answers. Even there the chance is at least $4/\pi^2$, about $0.4053$."
- F: "The coefficient of $|a\rangle$ is $2^{-m}(1 - e^{2\pi i\delta2^m})/(1 - e^{2\pi i\delta})$ (Eq. 7.39). With $2|\theta|/\pi \le |1 - e^{i\theta}| \le |\theta|$ (Eqs. 7.40–7.42) and $|2\pi\delta2^m| \le \pi$, $P(a) \ge 4/\pi^2 = 0.4053$ (Eq. 7.43; Bergou rounds it to 0.4). The worst case $\varphi = 0.1011_2$ ties 101 and 110 at $0.4105$ each."
- Cap G/F "the worst case as eight arrows 22.5° apart; below, the best 3-bit answer's chance for every φ: 1 at each eighth, 0.4105 midway, above the 4/π² line" · Stage `split(cp({chain:{phasesDeg:[0,22.5,…,157.5]}}) / PEB3)` · Claims `q18FourOverPi2` 0.4053, `q18PeWorst3` 0.4105 · Derivation D5.

**b4 [B]** (more wires)
- G: "A fourth wire halves the step between answers. Now $\varphi = 0.1011_2$ fits, and four wires read 1011 for certain. Extra wires sharpen where the answer lands; the worst case still sits just above $4/\pi^2$."
- F: "Each wire halves $2^{-m}$; the worst-case best-answer chance is $0.4105$, $0.4066$, $0.4056$ for $m = 3, 4, 5$, falling to $4/\pi^2$. For $n$ correct bits with failure at most $\varepsilon$, use $t = n + \lceil\log_2(2 + 1/(2\varepsilon))\rceil$ wires and accept answers within $2^{t-n} - 1$ steps (N&C Eq. 5.35, p. 224). $n = 3$, $\varepsilon = 0.1$ gives $t = 6$; $\varphi = \tfrac13$ then lands within $\tfrac18$ with chance $0.982$."
- Cap G/F "φ = 0.6875 on four wires: the first four wires read 1011 with chance 1" · Stage `split(circ(C_PE(11/16,4),16) / ampK(C_PE(11/16,4),16,4))` · Claims `q18Pe4Exact` 1, `q18PeWorst4` 0.4066, `q18PeWorst5` 0.4056, `q18NcT` 6, `q18NcWithin` 0.982.

**b5 [C]** (can more wires make 1/3 certain?)
- Q G: "Keep adding wires for $\varphi = \tfrac13$. Does the best answer ever become certain?" · Q F: "How do $P(\text{best})$ and $P(\text{within one step})$ behave for $\varphi = \tfrac13$ as $m$ grows?"
- Reveal G: "No. One third is $0.010101\ldots$ in binary with no end, so a small miss always remains. The best answer stays near chance $0.68$: $0.6878$, then $0.6849$ with four wires. With three wires, landing within one step has chance $0.8628$." · Reveal F: "$\delta \ne 0$ for every $m$, so $P(\text{best})$ runs $0.6878, 0.6849, 0.6842$ for $m = 3, 4, 5$ toward $0.6839$; $P(|x - 2^m\varphi| \le 1) = 0.8628$ at $m = 3$. Worst-case tails at $m = 8$, $P(\text{off by more than } k)$, are $0.189, 0.099, 0.067$ for $k = 1, 2, 3$: under Bergou's $1/(2k-1)$ (p. 129)."
- Cap G/F "φ = 1/3 on four wires: the tallest bar 0101 at 0.6849, then 0110 at 0.172" · Stage q `PEB3`; reveal `split(circ(C_PE(1/3,4),16) / ampK(C_PE(1/3,4),16,4))` · Claims `q18Pe13m4` 0.6849, `q18Pe13m4Next` 0.172, `q18Pe13m5` 0.6842, `q18Pe13Limit` 0.6839, `q18Pe13Near` 0.8628, `q18Tail8` [0.189, 0.099, 0.067].

### Unit `q18-counting` — Counting marked items by Grover's turn
**b1 [B]** (the two turns of $Q$) · Terms `qc-grover-iterate`, `qc-grover-plane` (Q17)
- G: "In Chapter Q17 one [[qc-grover-iterate|Grover step]] $Q$ turns the [[qc-grover-plane|Grover plane]] by $2\alpha$. A turn has two special complex states that it only multiplies, by $e^{\pm2i\alpha}$. For $N = 4$ with one marked item, $\alpha = 30°$, so the turns are $\pm60°$."
- F: "In the plane's basis $|w_0\rangle$, $|w_0^\perp\rangle$ ($|w_0^\perp\rangle$ at right angles to $|w_0\rangle$, on the side of $|x_0\rangle$), $Q = \begin{pmatrix}\cos2\alpha&-\sin2\alpha\\\sin2\alpha&\cos2\alpha\end{pmatrix}$ (Bergou Eq. 7.44, p. 129). Its eigenvalues are $e^{\pm2i\alpha}$, eigenvectors $|\alpha_\pm\rangle = (|w_0\rangle \mp i|w_0^\perp\rangle)/\sqrt2$. $N = 4$, $M = 1$: eigenphases $\varphi_\pm = 1/6, 5/6$."
- Cap G "four strings, one marked: one step turns the arrow 60°; the step's table, rows |w₀⟩, |w₀⊥⟩" · F "$Q$ on the plane for $N = 4$: a $60°$ turn, eigenvalues $e^{\pm i60°}$" · Stage `split(gp(2,1,{arcs:['alpha','step']}) / mx({gate:{name:'Ry', params:[4α]}}))` · Claims `q18CntAlpha` 30, `q18CntTurn` 60, `q18CntPhi` 0.1667, `q18CntEig` 0.

**b2 [B]** (is anything marked?)
- G: "Bergou asks a sharper question: does the box mark anything at all? If nothing is marked, $Q$ leaves the start $|w_0\rangle$ alone. Phase estimation of $Q$ on $|w_0\rangle$ then reads 000 every time."
- F: "If $f \equiv 0$ then $U_f = I$ and $Q = -U_{w_0}$ has $Q|w_0\rangle = |w_0\rangle$, eigenphase 0 (Bergou p. 129). Controlled-$Q^{2^j}$ on the target $|w_0\rangle$ (two search wires, $N = 4$) with three controls reads 000 with probability 1."
- Cap G/F "nothing marked: the three counting wires read 000 with chance 1" · Stage `split(circ(C_CNT([]),11) / ampK(C_CNT([]),11,3))` · Claims `q18Cnt0` 1.

**b3 [B]** (two marked of four; D6) · Terms `qc-quantum-counting`
- G: "With marked items, $|w_0\rangle$ is an even mix of the two special states. So the reading lands near $8\varphi$ for one of the two turns. Two marked of four gives $\alpha = 45°$, turns of a quarter: it reads 010 or 110, chance $0.5$ each."
- F: "$|w_0\rangle = (|\alpha_+\rangle + |\alpha_-\rangle)/\sqrt2$, so [[qc-quantum-counting|quantum counting]] outputs $(|a_+\rangle|\alpha_+\rangle + |a_-\rangle|\alpha_-\rangle)/\sqrt2$ with $a_+/2^m \approx \alpha/\pi$, $a_-/2^m \approx 1 - \alpha/\pi$ (Bergou p. 130 prints $\alpha/2\pi$: Correction box; N&C p. 262 writes $\theta = 2\alpha$). $M = 2$ is exact: 010 and 110, $0.5$ each."
- Cap G/F "two of four marked: the readings 010 and 110, chance 0.5 each" · Stage `split(circ(C_CNT([1,2]),11) / ampK(C_CNT([1,2]),11,3))` · Claims `q18Cnt2` 0.5, `q18CntPrinted` 0 · Derivation D6.

**b4 [B]** (from the reading to the count)
- G: "The reading $a$ gives the angle back, $\alpha = 180°\cdot a/8$, and then $M = N\sin^2\alpha$. For one marked of four, the likeliest readings, 001 and 111, have chance $0.3532$ each. Both give $M \approx 0.586$: rounded, one item."
- F: "$M = N\sin^2(\pi a/2^m)$: $a = 2$ gives $2$; $a = 1$ or $7$ gives $0.5858$, since $\varphi_\pm = 1/6, 5/6$ fall between grid points ($P(001) = P(111) = 0.3532$). The error falls like $2^{-m}$: $|\Delta M| < (\sqrt{2MN} + N/2^{m+1})2^{-m}$ (N&C Eq. 6.33, p. 263, on a doubled search space)."
- Cap G/F "one of four marked: the tallest readings, 001 and 111, at 0.3532 each" · Stage `split(circ(C_CNT([3]),11) / ampK(C_CNT([3]),11,3))` · Claims `q18CntEst1` 0.5858, `q18CntEst2` 2, `q18Cnt1Peak` 0.3532.

**b5 [C]** (a false "empty")
- Q G: "One item of four is marked, and the reading is 000. Would you call the box empty? How often does that happen?" · Q F: "For $N = 4$, $M = 1$, $m = 3$, what is $P(000)$, the chance of the wrong verdict 'empty'?"
- Reveal G: "You would, wrongly, with chance $0.0469$: the turns $1/6$ and $5/6$ leak a little onto 000. An empty box never reads anything else, so any other reading proves a mark. Repeating the run shrinks the risk." · Reveal F: "$P(000 \mid M = 1) = 0.0469$; with $M = 0$ the reading is 000 surely, so 'non-zero ⇒ marked' never errs and 'zero ⇒ empty' errs with $0.0469$ per run. Bergou takes $m > n/2$, since $\alpha = O(2^{-n/2})$ (p. 129)."
- Cap G/F "one of four marked: 000 still has chance 0.0469" · Stage q `circ(C_CNT([3]),11)`; reveal `ampK(C_CNT([3]),11,3)` · Claims `q18CntFalseEmpty` 0.0469.

### Unit `q18-order` — Order finding: the quantum step of factoring
**b1 [B] · notation beat, `introduces: ['qc-order-finding']`** (D7) · Bridges `qc-f8-euclid`, `qc-f8-roots`
- G: "Chapter F8 cracked 21 once it knew that 2 has order 6 mod 21 (<<qc-f8-euclid|Unit F8.2>>). Finding the order is the hard step. The gate $U_2$ multiplies by 2 mod 21. Its eigenphases are $s/6$ for $s = 0$ to 5: sixth roots of unity (<<qc-f8-roots|Unit F8.3>>)."
- F: "[[qc-order-finding|Order finding]] (N&C §5.3.1, pp. 226–227; Bergou p. 127 leaves Shor to other texts): for $\gcd(x, N) = 1$, $U_x|y\rangle = |xy \bmod N\rangle$ is unitary (Eq. 5.36), and $|u_s\rangle = r^{-1/2}\sum_k e^{-2\pi isk/r}|x^k \bmod N\rangle$ has $U_x|u_s\rangle = e^{2\pi is/r}|u_s\rangle$ (Eqs. 5.37–5.39). $N = 21$, $x = 2$: $r = 6$."
- Cap G "six turns 60° apart: the eigenvalues of multiplying by 2 mod 21" · F "eigenvalues $e^{2\pi is/6}$ of $U_2$ on a 6-mark clock" · Stage `cp(EIG6)` · Claims `q18Ord` 6, `q18OrdEig` 0 (all six).

**b2 [B]** (start from $|1\rangle$)
- G: "To use one eigenstate we would have to know $r$ already. But the plain number $|1\rangle$ is an even mix of all six. So phase estimation reads some $s/6$ at random. With five wires the readings pile up at 0, 5, 11, 16, 21 and 27 of 32."
- F: "$r^{-1/2}\sum_s|u_s\rangle = |1\rangle$ (N&C Eq. 5.44, p. 227), so phase estimation on $|1\rangle$ estimates $s/r$ for a uniform $s$, with $t = 2L + 1 + \lceil\log_2(2 + 1/(2\varepsilon))\rceil$ wires, $L = 5$ for $N = 21$. At $t = 5$ the six peaks are the multiples of $32/6$ rounded: 0, 5, 11, 16, 21, 27."
- Cap G/F "the six eigenphases (top); the transform of the comb 0, 6, …, 30, the first register once the second reads 1: peaks at 0, 5, 11, 16, 21, 27 (bottom)" · Stage `split(cp(EIG6) / amp({terms:COMB32},{dft:true, mode:'probability', labels:'index'}))` · Claims `q18OrdPeaks` [0, 5, 11, 16, 21, 27], `q18OneIsSum` 0.

**b3 [B]** (from a reading to the factors) · Bridge `qc-f8-fractions`
- G: "A reading of 5 means $\varphi \approx 5/32$. Its continued fraction gives $1/6$, so $r = 6$ (<<qc-f8-fractions|Unit F8.6>>). Then $\gcd(2^3 \pm 1, 21)$ gives the factors 7 and 3. Only the readings 5 and 27 work, so repeat a few times."
- F: "The convergent test (N&C pp. 229–230) returns $r = 6$ from $y \in \{5, 27\}$; per run that succeeds with probability $0.2295$ at $t = 5$ and $0.3320$ at $t = 2L + 1 = 11$. Then $\gcd(x^{r/2} \pm 1, N) = 7, 3$ (N&C Thm A4.11; <<qc-f8-euclid|Unit F8.2>>)."
- Cap G/F "the reading 5 of 32 as a turn of 56.25°, beside the true sixth of a turn, 60° (top); the comb's transform, peaks at 5 and 27 among the six (bottom)" · Stage `split(cp({spokes:{phasesDeg:[56.25, 60]}}) / amp({terms:COMB32},{dft:true, mode:'probability', labels:'index'}))` · Claims `q18OrdRead5` 56.25, `q18OrdTrue` 60, `q18OrdSuccess5` 0.2295, `q18OrdSuccess11` 0.3320, `q18OrdFactors` [7, 3].

**b4 [B]** (one family: hidden subgroups) · Terms `qc-hidden-subgroup`
- G: "Simon's string, the period of $2^x$ mod 21 and the order are one kind of puzzle: find the shifts that leave a function unchanged. Each yields to a Fourier transform plus a little classical algebra."
- F: "All are [[qc-hidden-subgroup|hidden subgroup problems]] (N&C §5.4.3, Fig. 5.5, pp. 240–241): Simon has $G = \{0,1\}^n$ with $K = \{0, s\}$; period and order finding have $K = r\mathbb Z$. The Fourier transform over $G$ samples labels $\ell$ with $\sum_{h\in K}e^{-2\pi i\ell h/|G|} = |K|$ (Eq. 5.77), and classical algebra recovers $K$."
- Cap G/F "Simon's check 110 · 111 = 0 (top) beside the order-finding peaks (bottom)" · Stage `split(br(['110','111'],{combine:'dot'}) / amp({terms:COMB32},{dft:true, mode:'probability', labels:'index'}))` · Claims `q18Dot110_111` 0, `q18OrdPeaks` (reused).

**b5 [C]** (powers of $U$)
- Q G: "$U_2$ twice multiplies by 4. How many different turns does it have, and what is the order of 4 mod 21?" · Q F: "What are the eigenphases of $U_x^2 = U_{x^2}$, and how do they match $\mathrm{ord}(4) \bmod 21$?"
- Reveal G: "Three. Doubling each of the six turns lands on only three, and 4 has order 3 mod 21: 4, 16, 1. Phase estimation needs exactly these powers, built by repeated squaring." · Reveal F: "$U_x^2|u_s\rangle = e^{2\pi i\,2s/6}|u_s\rangle$ takes three distinct values, matching $\mathrm{ord}(4) = 3$. The controlled-$U^{2^j}$ come from repeated squaring mod $N$ (modular exponentiation, N&C Box 5.2, p. 228), $O(L^3)$ gates in all."
- Cap G/F "the turns of U₂ twice on a 6-mark clock: only 0°, 120°, 240°" · Stage q `cp(EIG6)`; reveal `cp({spokes:{phasesDeg:[0,120,240]}, clock:6})` · Claims `q18Ord4` 3, `q18U2Distinct` 3.

**Count:** 6 + 5 + 4 + 5 + 5 + 5 = **30 beats**, 6 clues, 1 Go-deeper; order per unit B → C (→ D).

### 1.7 Claim ledger (key — engine call — value; numpy in `planQ18-numpy.py`)
- simon: `q18SimonPairs`, `q18SimonF001` `periodicTable(6,3)` [0,1,2,3,2,3,0,1] · `q18SimonQueryBar` `run(C_S)` col 3 0.3536 · `q18SimonOutChance` 0.25 · `q18SimonPairBar` 0.7071 · `q18SimonYBar` ±0.5 · `q18SimonPerpCount` 4 · `q18SimonBadY` 0 · `q18SimonPrintedNorm2` `simonPrintedNorm2(3)` 0.25 · `q18SimonRank`, `q18SimonNull` `gf2RowReduceSteps`/`gf2Nullspace` 2, [0, 6] · `q18PerpRank` `gf2Rank(s⊥)` 2 · `q18ThreeForceZero` [0] · `q18SimonTwoRuns` `simonRunsSuffice(3)` 0.375 · `q18SimonExpRuns` `simonExpectedRuns(3)` 3.333 (MC 3.332), `(10)` 10.60 · `q18SimonCollide3` `classicalCollision(6,3,3)` 3/7 = union bound · `q18CollisionXor` 6.
- qft: `q18F8Entry00` 0.3536 · `q18QftIsF8`, `q18QftCircuitIsF8` `circuitUnitary(qftCircuit(3))` vs `dftMatrix(8)` 0 · `q18Qft101Bar` 0.3536, `q18Qft101Step` 225, `q18Qft101Chance` 0.125 · `q18QftPrintedNorm2` `qftPrintedNorm2(3)` 0.125 · `q18Prod101` `qftProductAngles(5,3)` [180,90,225] · `q18ProdIsQft` 0 (8 inputs) · `q18ExpandPrinted110` `expandPrinted('110')` 8 (correct 6; 4 of 8 strings wrong) · `q18QftGates3/10`, `q18QftSwaps10`, `q18Fft10` 6, 55, 5, 10240 · `q18Qft000IsH` 0 · `q18Qft001VsH` 0.7071.
- kickback: `q18Phi`, `q18PhiDeg` 0.625, 225 · `q18KickTarget` `probs(run(C_K))` target 1 · `q18KickPhase` 225 · `q18Kick3` [180, 90, 225] · `q18KickIsQft` controls of `run(C_PE(5/8,3))` col 4 vs `dft(ket 101)` 0 · `q18PlusHalf` 0.5 (000, 101).
- phase-est: `q18PeExact` 1 · `q18Pe13Best/Next` `peDistribution(1/3,3)` 0.6878, 0.1749 · `q18Pe13a` 3, `q18Pe13Delta` −0.0417 · `q18FourOverPi2` 0.4053 · `q18PeWorst3/4/5` `peWorstBest(m)` 0.4105, 0.4066, 0.4056 · `q18Pe4Exact` 1 · `q18NcT` `ncWires(3,0.1)` 6 · `q18NcWithin` `peWithin(1/3,6,1/8)` 0.982 · `q18Pe13m4/m4Next/m5/Limit` 0.6849, 0.172, 0.6842, 0.6839 · `q18Pe13Near` 0.8628 · `q18Tail8` `peTailWorst(8,k)` 0.189, 0.099, 0.067.
- counting: `q18CntAlpha`, `q18CntTurn` `groverAngle(4)` 30, 60 · `q18CntPhi` 1/6 · `q18CntEig` ‖Q|α₊⟩ − e^{i60°}|α₊⟩‖ 0 · `q18Cnt0` 1 · `q18Cnt2` 0.5 · `q18CntPrinted` `countingPrintedReading(2,[1,2],3)` P(001) = 0 · `q18CntEst1/2` `countEstimate(a,3,4)` 0.5858, 2 · `q18Cnt1Peak` 0.3532 · `q18CntFalseEmpty` 0.0469. Route A = `runCircuit(countingCircuit)` marginals; route B = ½(pe(α/π) + pe(1 − α/π)).
- order: `q18Ord` `multOrder(2,21)` 6 · `q18OrdEig` 0 · `q18OrdPeaks` top six of `dft(COMB32)` and of `orderFindingDistribution(2,21,5)` · `q18OneIsSum` 0 · `q18OrdRead5`, `q18OrdTrue` 56.25, 60 · `q18OrdSuccess5/11` `orderSuccess(2,21,t)` 0.2295, 0.3320 · `q18OrdFactors` `factorFromOrder(2,6,21)` [7, 3] · `q18Dot110_111` 0 · `q18Ord4` `multOrder(4,21)` 3 · `q18U2Distinct` 3.

## 2. Derivations (step `tex` — why — **view**; a step without a view keeps the last; Ground ≥ Formal; ≥ 2 views each)
**D1 · simon:b3 · `H^{\otimes n}\tfrac{|z\rangle + |z\oplus s\rangle}{\sqrt2} = 2^{-(n-1)/2}\sum_{y\in s^\perp}(-1)^{z\cdot y}|y\rangle`** — G (4): (1) one input string spreads with signs $(-1)^{z\cdot y}$ (Q16) · **amp(C_S,4,'01','signed')** · (2) the partner's sign is $(-1)^{z\cdot y}(-1)^{s\cdot y}$ · **br(['110','111'],{combine:'dot'})** (110 · 111 = 0: the signs agree) · (3) $1 + (-1)^{s\cdot y}$ is 2 or 0 · **br(['110','010'],{combine:'dot'})** (110 · 010 = 1: they cancel) · (4) result, four bars ±0.5 · **amp(C_S,5,'01','signed')**. F (3): (1) expand both terms · **amp(C_S,4,'01','signed')** · (2) factor $(-1)^{z\cdot y}(1 + (-1)^{s\cdot y})$ · **br dot 110·111** · (3) $2\cdot2^{-(n+1)/2} = 2^{-(n-1)/2}$ · **amp(C_S,5,'01','signed')**.
**D2 · qft:b3 · product form** — G (4): (1) $U_F|a\rangle = 2^{-m/2}\sum_y e^{2\pi iay/2^m}|y\rangle$ · **qamp('101',{dials})** · (2) write $y = 4y_1 + 2y_2 + y_3$: the turn splits into three factors, one per wire · (3) wire $l$ gets $e^{2\pi ia2^{-l}}$; whole turns drop, leaving $0.a_3$, $0.a_2a_3$, $0.a_1a_2a_3$ · **cp spokes [180,90,225]** · (4) result · **mx({dft:8})**. F (3): (1) N&C 5.5–5.6 · **qamp('101')** · (2) 5.7–5.9, the sum factorizes · **cp spokes** · (3) 5.10 = result · **qamp('101',{dials})**.
**D3 · kickback:b2 · $(|0\rangle + e^{2\pi i\varphi}|1\rangle)|u\rangle/\sqrt2$** — G (3): (1) $|+\rangle|u\rangle$ is two branches · **circ(C_K,1)** · (2) $U$ acts on the $|1\rangle$ branch only: $e^{2\pi i\varphi}|1\rangle|u\rangle$ · **amp(C_K,2,{dials})** · (3) factor out $|u\rangle$ · **cp z 225°**. F (2): (1) linearity of controlled-$U$ · **circ(C_K,2)** · (2) result · **amp(C_K,2,{dials})**.
**D4 · phase-est:b1 · $U_F^{-1}2^{-m/2}\sum_y e^{2\pi iay/2^m}|y\rangle = |a\rangle$** — G (3): (1) the controls hold $2^{-3/2}\sum_y e^{2\pi i\varphi y}|y\rangle$ · **amp(C_PE(5/8,3),4,{dials})** · (2) for $\varphi = 5/8$ that is $U_F|101\rangle$ · **circ(C_PE(5/8,3),4)** · (3) $U_F^{-1}U_F = I$: the reading is 101 · **ampK(C_PE(5/8,3),11,3)**. F (2): (1) Eq. 7.37 = $U_F|a\rangle$ · **circ(…,4)** · (2) result · **ampK(…,11,3)**.
**D5 · phase-est:b3 · $P(a) \ge 4/\pi^2$** — G (4): (1) amplitude of $a$ = $\tfrac18 \times$ eight arrows each $360°\delta$ further · **cp chain 8 × 22.5°** · (2) closed form $(1 - e^{2\pi i\delta8})/(1 - e^{2\pi i\delta})$ (Unit F8.5) · (3) top chord $\ge \tfrac2\pi$ of its arc, bottom chord $\le$ its arc · (4) ratio $\ge 2/\pi$, squared $\ge 4/\pi^2$ · **PEB3**. F (3): (1) Eq. 7.39 · **cp chain** · (2) Eqs. 7.40–7.42 at $|2\pi\delta2^m| \le \pi$ · (3) Eq. 7.43 · **PEB3**.
**D6 · counting:b3 · $a_\pm/2^m \approx \alpha/\pi,\ 1 - \alpha/\pi$** — G (4): (1) $Q$ turns the plane by $2\alpha = 90°$ ($M = 2$) · **gp(2,1,{marked:2, arcs:['step']})** · (2) its two special states get $e^{\pm2i\alpha}$; $|w_0\rangle$ is half of each · **mx(Ry(4α)), α = 45°** · (3) phase estimation reads each turn as a fraction $2\alpha/360°$ · **circ(C_CNT([1,2]),11)** · (4) $\alpha = 45°$: 010 and 110 · **ampK(C_CNT([1,2]),11,3)**. F (3): (1) Eq. 7.44 eigen-pairs · **mx(Ry)** · (2) $|w_0\rangle = (|\alpha_+\rangle + |\alpha_-\rangle)/\sqrt2$ · **gp(2,1,{marked:2})** · (3) N&C §5.2 linearity · **ampK(…)**.
**viewCaptions** (Read-mode strip; each a phrase of what is drawn): D1 "the pair before the Hadamards" / "110 · 111 = 0: the signs agree" /
"110 · 010 = 1: they cancel" / "four bars ±0.5" · D2 "the transform of 101" / "three wire turns" / "the table F₈" · D3 "two branches" /
"the |11⟩ dial at 225°" / "the eigenvalue arrow" · D4 "controls after the kicks" / "the circuit at the kicks" / "the reading 101" · D5 "eight
arrows 22.5° apart" / "the best answer's chance for every φ" · D6 "two of four marked: a 90° turn" / "the step's table" / "the counting circuit" / "readings
010 and 110" · D7 "multiplying by 2 on a 21-mark clock" / "six eigenvalues".
**D7 · order:b1 · $U_x|u_s\rangle = e^{2\pi is/r}|u_s\rangle$** — G (3): (1) $U_2$ walks the cycle 1, 2, 4, 8, 16, 11 · **cp({spokes: 360·[1,2,4,8,16,11]/21, clock:21})** · (2) a state weighting step $k$ by $e^{-2\pi isk/6}$ is only relabelled by one step, so it gains $e^{2\pi is/6}$ · (3) six eigenvalues · **cp(EIG6)**. F (2): (1) Eq. 5.38, $k \to k + 1$ · **21-clock** · (2) Eq. 5.39 · **cp(EIG6)**.

## 3. Try-it widgets (props read from `BitTable.tsx`, `ComplexPlaneQc.tsx`, `Projector.tsx`, `stage/svg/bits.ts`, `complexPlane.ts`)
| Unit | Spec | Try this |
|---|---|---|
| simon | `bit-table {mode:'reduce', rows:['110','110']}` | Two runs both read 110. Press Step: the readout says “add row 1 to row 2”, then “rank 1” and “null space: 000, 001, 110, 111”, four candidates. Press place 3 of row 2 to make it 111, then Step: “rank 2” and “null space: 000, 110”, so $s = 110$. |
| qft | `complex-plane {mode:'roots', N:8, j:1}` | The eight arrows are √8 times the amplitudes of $U_F|001\rangle$; the step slider reads “1 (45° each)”. They close, and the readout says “sum = 0”: $U_F|001\rangle$ is orthogonal to $U_F|000\rangle$. Step 0: “sum = 8”, the even mix. Step 4 (input 100): “corners used: 2 of 8, each 4 times”, only signs: $|+\rangle|+\rangle|-\rangle$. |
| kickback | `complex-plane {mode:'roots', N:8, j:5}` | Arrow $k$ is the turn $U^k$ kicks back when $\varphi = 5/8$: corner $5k \bmod 8$, and the line reads “corners used: 8 of 8, each 1 time”. The controls receive $k = 1, 2, 4$: corners 5, 2, 4, that is 225°, 90°, 180°. Set the step to 4 ($\varphi = 0.100_2$): “2 of 8, each 4 times”; $U^2$, $U^4$ give whole turns, so only the $U$ control turns, by 180°. |
| phase-est | `complex-plane {mode:'phasor', phases:[0, 300]}` | One wire: the amplitude of reading $x$ is half the sum of arrows at 0° and $360°(\varphi - x/2)$. For $\varphi = 1/3$, reading 1 gives 0° and 300°: the readout says “size 1.732”, so $P = 1.732^2/4 = 0.75$. Set arrow 2 to 120° (reading 0): “size 1”, $P = 0.25$. Set it to 0° ($\varphi = 1/2$, reading 1): “size 2”, certain. |
| counting | `projector {state:30, basis:0, editableBasis:false}` | Read |+z⟩ (right) as $|x_0^\perp\rangle$ and |−z⟩ (up) as $|x_0\rangle$: at 30° the arrow is $|w_0\rangle$ for $N = 4$, $M = 1$, and the ⟨−z\|ψ⟩ row reads P = 25.0%, which is $M/N$. Drag to about 45°, the angle the reading 010 gives back: about 50%, so $M = 2$ of 4. |
| order | `complex-plane {mode:'roots', N:6, j:1}` | Six arrows 60° apart, the eigenvalues of multiplying by 2 mod 21: “corners used: 6 of 6, each 1 time” and “sum = 0”. Step 2 (multiplying by 4): “3 of 6, each 2 times”, since 4 has order 3. Step 3 (by 8): “2 of 6, each 3 times”, since $8^2 = 64 \equiv 1$. |
(No Try-it prints a φ in degrees: the Bloch and phase-dial widgets were rejected for that reason, Ruling 1.)

## 4. Challenges (tol 0.005 unless stated; integers tol 0; full walkthroughs: no sheet assigns any of these)
- **simon** 1 warm-up numeric `q18-s-perp` strings a run can return, $n = 3$, $s = 110$ → **4**. 2 core numeric `q18-s-two` chance two runs suffice → **0.375**. 3 core choice `q18-s-neq` "How many independent checks fix $s$ for $n$ bits?" → **$n - 1$; $n$ would force $s = 0$** ✓ (`q18PerpRank`).
- **qft** 1 warm-up numeric `q18-q-bar` size of each amplitude of $U_F|101\rangle$ → **0.354**. 2 core numeric `q18-q-wire` bottom wire's turn for $U_F|110\rangle$, degrees → **270** (`qftProductAngles(6,3)` = [0, 180, 270]). 3 core numeric `q18-q-gates` H plus controlled turns for $m = 5$ → **15**.
- **kickback** 1 warm-up numeric `q18-k-deg` $\varphi = 0.625$ in degrees → **225**. 2 core numeric `q18-k-u2` turn on the $U^2$ control for $\varphi = 0.011_2$, degrees → **270**. 3 core choice `q18-k-which` "After controlled-$U$ on $|+\rangle|u\rangle$, what changed?" → **the control's relative phase only** ✓.
- **phase-est** 1 warm-up numeric `q18-p-bound` $4/\pi^2$ → **0.405**. 2 core numeric `q18-p-third` $P(011)$, $\varphi = 1/3$, $m = 3$ → **0.688**. 3 stretch numeric `q18-p-wires` N&C's $t$ for $n = 3$, $\varepsilon = 0.1$ → **6**.
- **counting** 1 warm-up numeric `q18-c-alpha` $\alpha$ for $N = 4$, $M = 1$, degrees → **30**. 2 core numeric `q18-c-est` $M$ from $a = 3$, $N = 4$, $m = 3$ → **3.414** (tol 0.01). 3 core numeric `q18-c-empty` $P(000)$ for $M = 1$ → **0.047**.
- **order** 1 warm-up numeric `q18-o-eig` distinct eigenvalues of $U_2$ mod 21 → **6**. 2 core numeric `q18-o-27` denominator from the reading 27 of 32 ($[0;1,5,2,2]$, convergent $5/6$) → **6**. 3 core numeric `q18-o-factor` $\gcd(2^3 - 1, 21)$ → **7**.

## 5. Glossary (new in 709; checked against every F1–F8, Q1–Q17 glossary: no duplicate id or term)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-simon-problem` | Simon's problem | — | A box answers alike exactly for pairs $x$, $x \oplus s$; find the secret $s$. | $f$ 2-to-1 on $\{0,1\}^n$, $f(x) = f(y) \Leftrightarrow y \in \{x, x\oplus s\}$ (Eq. 7.30). | simon:b1 | `qc-f7-xor` |
| `qc-s-perp` | the strings $s^\perp$ | notation | The strings whose dot product with $s$ is 0. | $s^\perp = \{y : y\cdot s = 0\}$, dimension $n - 1$ over GF(2). | simon:b3 | `qc-f7-gf2` |
| `qc-qft` | quantum Fourier transform $U_F$ | notation | The gate that Fourier-transforms a register's amplitudes. | $U_F|a\rangle = 2^{-m/2}\sum_y e^{2\pi iay/2^m}|y\rangle$ (N&C Eq. 5.2). | qft:b1 | `qc-f8-dft` |
| `qc-qft-product-form` | product form of the QFT | — | Each output wire gets its own turn, one binary fraction each. | $\bigotimes_l(|0\rangle + e^{2\pi i\,0.a_{m-l+1}\cdots a_m}|1\rangle)/\sqrt2$ (N&C Eq. 5.4). | qft:b3 | `qc-f8-fractions` |
| `qc-controlled-rk` | controlled phase $R_k$ | notation | A turn by $1/2^k$ of a circle on $|1\rangle$, done when the control is 1. | $R_k = \mathrm{diag}(1, e^{2\pi i/2^k})$; $R_2 = S$, $R_3 = T$ (N&C Eq. 5.11). | qft:b4 | — |
| `qc-eigenphase` | eigenphase $\varphi$ | notation | The fraction of a turn by which a gate multiplies one of its special states. | $U|u\rangle = e^{2\pi i\varphi}|u\rangle$, $0 \le \varphi < 1$; angle $2\pi\varphi$. | kickback:b1 | `qc-f4-unitary` |
| `qc-phase-estimation` | phase estimation | — | Reading an eigenphase's binary digits with controlled powers and a backwards QFT. | $H^{\otimes m}$, controlled-$U^{2^j}$, $U_F^{-1}$; $P(\text{nearest}) \ge 4/\pi^2$ (Eq. 7.43). | phase-est:b1 | `qc-f8-geometric` |
| `qc-quantum-counting` | quantum counting | — | Counting marked items from the turn of one Grover step. | Phase estimation of $Q$ on $|w_0\rangle$: $a/2^m \approx \alpha/\pi$, $M = N\sin^2(\pi a/2^m)$. | counting:b3 | — |
| `qc-order-finding` | order finding, $U_x$ | notation | Finding the order of $x$ mod $N$ with the gate that multiplies by $x$. | $U_x|y\rangle = |xy \bmod N\rangle$, eigenphases $s/r$ (N&C Eqs. 5.36–5.39). | order:b1 | `qc-f8-euclid` |
| `qc-hidden-subgroup` | hidden subgroup problem | — | Finding the shifts that leave a function unchanged. | $f$ constant and distinct on cosets of $K \subseteq G$; find $K$ (N&C Fig. 5.5). | order:b4 | — |

## 6. Review cards
- **simon** G: the answer wires collapse the inputs to a pair; Hadamards keep only $y$ with $y\cdot s = 0$; $n - 1$ checks solve for $s$. F: Eqs. 7.30–7.33 (corrected), GF(2) null space. Eq $2^{-(n-1)/2}\sum_{y\in s^\perp}(-1)^{z\cdot y}|y\rangle$. Trap: "$n$ independent checks".
- **qft** G: $U_F$ is the DFT on amplitudes; each wire gets a binary-fraction turn; $H$ and controlled $R_k$ build it in about $m^2/2$ gates. F: Eqs. 5.2, 5.4, 5.11, Fig. 5.1. Eq $U_F|a\rangle = 2^{-m/2}\sum_y e^{2\pi iay/2^m}|y\rangle$. Trap: Bergou's printed $1/2^m$.
- **kickback** G: controlled-$U$ on an eigenstate turns the control, not the target; $U^{2^j}$ shifts the digits; the controls then hold $U_F|a\rangle$. F: Eq. 7.37. Eq $(|0\rangle + e^{2\pi i2^j\varphi}|1\rangle)/\sqrt2$. Trap: thinking the target records the phase.
- **phase-est** G: undo the QFT and read; exact when $\varphi$ has $m$ digits; otherwise the nearest answer still has $\ge 4/\pi^2$. F: Eqs. 7.38–7.43, N&C Eq. 5.35. Eq $P(a) \ge 4/\pi^2$. Trap: "more wires make the best answer certain".
- **counting** G: $Q$'s turns are $\pm2\alpha$; $|w_0\rangle$ mixes both; the reading gives $\alpha$ and $M$. F: Eq. 7.44; $a_\pm/2^m \approx \alpha/\pi, 1 - \alpha/\pi$. Eq $M = N\sin^2(\pi a/2^m)$. Trap: reading $\alpha/2\pi$.
- **order** G: $U_x$ multiplies mod $N$; $|1\rangle$ mixes all eigenstates; a peak and a continued fraction give $r$; gcd gives factors. F: Eqs. 5.36–5.44, Fig. 5.5. Eq $U_x|u_s\rangle = e^{2\pi is/r}|u_s\rangle$. Trap: "first prepare $|u_s\rangle$".

## 7. Symbol-before-use
**7.1 Ground:** $x$, $f(x)$, $s$, $\oplus$ (F7) simon:b1 · $y\cdot s$ (F7), $s^\perp$ simon:b3 · $m$, $a$, $y$, $U_F$ qft:b1 · $R_2 = S$, $R_3 = T$ (Q4) qft:b4 · $U$, $|u\rangle$, $\varphi$ kickback:b1 · $|+\rangle$ (Q4) kickback:b2 · $\pi$ (F1) phase-est:b3 · $Q$, $\alpha$, $|w_0\rangle$, $N$, $M$ (Q17) counting:b1 · $U_2$, $s$ (eigen-index), $r$ (F8) order:b1. **FLAGS:** $\varphi$ = turns here vs F1's angle (Rosetta at kickback:b1 F, Ruling 1); $s$ is Simon's string in 18.1 and the eigen-index in 18.6 (different units; 18.6's Ground defines it in place); $x$ is an input string in 18.1, never the base in Ground (18.6 says "multiplies by 2").
**7.2 Formal:** adds $n$, $\xi$ (Rosetta) simon:b1 · $z$ (Bergou's $x_0$, renamed: $x_0$ is Q17's marked item) simon:b2 · $Y$, $\mathrm{GF}(2)$ simon:b4 · $a_l$, $0.a_l\cdots a_m$ qft:b3 · $P(\cdot)$ (Q4) qft:b4 · $|\psi\rangle$ (Bergou) kickback:b1 · $\varphi_j$ digits kickback:b3 · $\delta$, $x$ (reading) phase-est:b2 · $t$, $\varepsilon$, $e$ phase-est:b4 · $|w_0^\perp\rangle$, $|\alpha_\pm\rangle$, $\varphi_\pm$ counting:b1 · $a_\pm$, $\theta$ (N&C) counting:b3 · $U_x$, $|u_s\rangle$, $k$ order:b1 · $L$ order:b2 · $G$, $K$, $\ell$ order:b4. Counts: 0 used before definition in either track.

## 8. Errata (Correction boxes, `source: 'book'`; every `check` an engine computation worded "our calculation finds …"; all five confirmed on the page images by this planner, 2026-10-11)
- **E1 (map B21)** p. 126, last paragraph: "$n$ independent equations $y_j\cdot\xi = 0$" — the $y$'s span $s^\perp$, rank $n - 1$; $n$ independent ones would leave only $\xi = 0$. Check `q18PerpRank` 2, `q18ThreeForceZero`.
- **E2 (new)** p. 126, Eq. 7.33 last line: prefactor $2^{-(n+1)/2}$ should be $2^{-(n-1)/2}$ (the factor $1 + (-1)^{\xi\cdot y} = 2$ was dropped); as printed the state's squared norm is 0.25 at $n = 3$. Check `q18SimonPrintedNorm2`.
- **E3 (F7F8 R6, map B22)** p. 127, Eqs. 7.34–7.35: $1/2^m$ should be $2^{-m/2}$; as printed the squared norm is $2^{-m}$ (0.125 at $m = 3$), and Eqs. 7.36, 7.38 already use the right factor. Check `q18QftPrintedNorm2`.
- **E4 (F7F8 R6, map B22)** p. 127: $a = 2^{m-1}a_1 + 2^{m-1}a_2 + \ldots$ should have $2^{m-2}a_2$; as printed 110 maps to 8 (not a 3-bit number) and 4 of the 8 strings are misread. Check `q18ExpandPrinted110`.
- **E5 (map B23)** p. 130: $a_+/2^m$ estimates $\alpha/\pi$ and $a_-/2^m$ estimates $1 - \alpha/\pi$ ($Q$'s eigenphases $\pm2\alpha$, p. 129), not $\alpha/2\pi$ and $(2\pi - \alpha)/2\pi$; at $N = 4$, $M = 2$ the printed reading 001 has chance 0 while 010 has 0.5. Check `q18CntPrinted`, `q18Cnt2`.
- **Checked, no box:** p. 129 "(4/π²) = 0.4" is a lower bound, 0.4053 (texts say "at least"); p. 129's tail $1/(2k-1)$ holds (worst cases 0.189, 0.099, 0.067 at $m = 8$; map B23's "unsure" resolved), as does N&C's $1/(2(e-1))$ from $b = \lfloor2^t\varphi\rfloor$; p. 127's $a\cdot y$ is an integer product (stated at qft:b1).

## 9. Engine gaps and stage contracts
**9.1 Engine** (new `physics/qc/qft.ts`, Simon helpers in `physics/qc/oracles.ts`; numpy block "q18" in `make_fixtures.py`, twins in
`pipeline/claims_qc709/q18.py`): `qftCircuit(m, {inverse?, init?})` (H, controlled S/T/P(2π/2^k), SWAPs; $m \le 5$) · `qftProductAngles(a, m)` ·
`qftPrintedNorm2(m)`, `expandPrinted(bits)` (E3, E4) · `phaseEstimationCircuit(φ, m, target)` · `peDistribution(φ, m)` (Eq. 7.38) ·
`peBest(φ, m)`, `peWorstBest(m)` ($D_{2^m}(2^{-m-1})^2$), `peTailWorst(m, k)`, `peWithin(φ, t, w)`, `ncWires(n, ε)` · `groverQMatrix(n, marked[])`
(any marked set) · `countingCircuit(n, marked, m)` (unitary ops $Q^{2^j}$) · `countEstimate(a, m, N)`, `countingPrintedReading` (E5) ·
`orderEigenphases(x, N)`, `orderFindingDistribution(x, N, t)` (mean of `peDistribution(s/r, t)`), `orderSuccess(x, N, t)` (via F8's
`orderFromPeak`) · `simonCircuit(s, n)` (one xor oracle column per answer bit), `simonYDistribution`, `simonPrintedNorm2(n)` (E2),
`simonExpectedRuns(n)` ($\sum_{k<n-1}1/(1 - 2^{k-n+1})$), `simonRunsSuffice(n)`, `classicalCollision(s, n, k)`, `collisionUnionBound(n, k)`.
Reused: `dftMatrix`, `dft`, `dirichlet`, `continuedFraction`, `convergents`, `orderFromPeak`, `multOrder`, `factorFromOrder`, `gcd`,
`periodicTable`, `gf2RowReduceSteps`, `gf2Nullspace`, `gf2Rank`, `dotMod2`, `groverAngle`, `groverEigenphase`, `circuitUnitary`, `runCircuit`.
Cross-checks: `circuitUnitary(qftCircuit(m))` = `dftMatrix(2^m)`, $m \le 5$; circuit marginals = `peDistribution` for $\varphi \in \{5/8, 1/3,
11/16, 0.3\}$, $m = 3, 4$; `countingCircuit` marginals = ½(pe(α/π) + pe(1 − α/π)) for $M = 1, 2, 3$; the comb mixture = the $|1\rangle$-start
distribution (checked in numpy).
**9.2 Stage.** **S1 (`plot`, additive):** `PlotCurveName` gains `'peBest3'`: $y = \max_x P(x)$ for $m = 3$ over $\varphi \in [0, 1]$
(`peBest(φ, 3)`), default x $[0, 1]$, samples ≥ 257 (sharp kinks at the midpoints); markers and the $4/\pi^2$ line as in `PEB3`.
**S2 (`amplitudes`, additive):** `keep?: number` — mode `'probability'` only: draw $P$ of the first `keep` wires (q0 …), summed over the
rest, $2^{keep}$ bars labelled by those bits, readout "first k wires"; not with `dft`, `inBasis`, `sum`, `dials`, `'signed'`. Serves 14
views (Simon, phase estimation, counting). **S3 (no field):** first uses needing a screenshot check (BUILD-LOG rule): controlled `unitary`
ops labelled $Q$, $Q^2$, $Q^4$; controlled S/T/P with labels $R_2$, $R_3$, $U$, $U^{2^j}$; 5 wires × 16 columns; a `bits` map with a 2-bit
answer table. **Fallbacks:** S1 declined → `plot('dirichlet8')` with caption "$D_8(\delta)$, whose square is the best answer's chance" and
the $2/\pi$ line; S2 declined → whole-register bars (16 or 32), every caption naming the target bits and the group sums.
**9.3 Widgets:** none required; every Try-it above is true on today's code. W16 `oracle-bench` stays deferred (a Simon mode needs 5 wires;
no other Q18 use). Optional W17 `phase-bench` (slider $\varphi$, $m = 1$–6, the reading's bars and `peBest`, drawn by the `amplitudes` and
`plot` kinds): deferred.

## 10. Media (deferred, per BUILD-LOG)
Films: `qc-q18-peak` "A peak sharpens as the precision grows" ($\varphi = 1/3$, $m = 2$…8; manifest keys `q18Pe13Best`, `q18Pe13m4`,
`q18Pe13m5`, `q18Pe13Limit`, `q18FourOverPi2`) · `qc-q18-digits` "The QFT circuit writes the digits one by one" (101 → 180°, 90°, 225°; keys
`q18Prod101`, `q18Kick3`). Blender: none (Part VII's opener sits before Unit 17.2). Decor: one lighthouse beam sweeping fog at a steady
period; atmosphere only.

## 11. Hooks
**11.1 Concept stations** (no 448 twin): `qc-simon-station` "A hidden XOR string from a few runs" (simon; needs `qc-hadamard-signs`,
`qc-f7-gf2`) · `qc-qft-station` "The quantum Fourier transform" (qft; needs `qc-f8-dft`, `qc-hadamard-signs`) · `qc-kickback-powers`
"Controlled powers write a phase" (kickback; needs `qc-oracle-kickback`, `qc-f8-fractions`) · `qc-phase-estimation-station` "Phase
estimation" (phase-est; needs `qc-qft-station`, `qc-kickback-powers`, `qc-f8-geometric`) · `qc-counting-station` "Quantum counting"
(counting; needs `qc-phase-estimation-station`, `qc-grover-iterate`) · `qc-order-finding-station` "Order finding" (order; needs
`qc-phase-estimation-station`, `qc-f8-euclid`, `qc-f8-fractions`).
**11.2 Arcade (Spot the error; `Q18x` labels):** `qc-simon-n-eqs` ("$n$ independent checks fix $s$"; why `q18PerpRank`) · `qc-qft-prefactor`
("$U_F|a\rangle = 2^{-m}\sum_y\ldots$"; why `q18QftPrintedNorm2`) · `qc-kick-target` ("controlled-$U$ turns the target"; why `q18KickTarget`) ·
`qc-pe-sure` ("three wires read 011 for $\varphi = 1/3$ for sure"; why `q18Pe13Best`) · `qc-count-half-alpha` ("$a_+/2^m$ estimates
$\alpha/2\pi$"; why `q18CntPrinted`) · `qc-order-eigenstate` ("first prepare $|u_s\rangle$"; why `q18OneIsSum`).
**11.3 Bridges.** Out: `qc-f7-xor` (simon:b1 G), `qc-f7-gf2` (simon:b4), `qc-f4-unitary` (kickback:b1 F), `qc-f8-roots` (order:b1 G), and
NEW `qc-f8-dft` → F8 `f8-dft` (qft:b1), `qc-f8-fractions` → `f8-fractions` (qft:b3, kickback:b3, order:b3), `qc-f8-geometric` →
`f8-geometric` (phase-est:b3), `qc-f8-euclid` → `f8-euclid` (order:b1, b3), labels as F8 §11.1. Q-chapters are named in words (Q4, Q5,
Q16, Q17). In (wiring pass after merge): F8 clock:b3, euclid:b4, fractions:b2 and F7 gf2:b4 name "Chapter Q18" in words today.

## Rulings requested
- R1 Keep $\varphi$ as a fraction of a turn (both books; Rosetta at kickback:b1), against the 709 lock "φ = angle"; no Try-it prints φ in degrees.
- R2 Five Correction boxes E1–E5, including the new E2 (Eq. 7.33's prefactor); the tail bound and "= 0.4" ship as no-correction notes.
- R3 Six units; `q18-order` is a `'books'` unit (N&C §5.3.1) in both tracks, since the platform forbids a unit that opens with a Go-deeper beat.
- R4 Approve S1 (`plot` 'peBest3') and S2 (`amplitudes.keep`), built inside the Q18 build, with the fallbacks of §9.2.
- R5 Simon at $n = 3$, $s = 110$ (F7's) on a 5-wire circuit with two answer wires; the classical-collision beat stays `'deeper'`.
- R6 Counting at $N = 4$, $m = 3$ (5 wires) with controlled-$Q^{2^j}$ as `unitary` ops; examples $M = 0, 1, 2$.
- R7 `oracle-bench` stays deferred; Try-its on `bit-table`, `complex-plane` (roots, phasor) and `projector` as read from the code.
- R8 N&C Exs. 5.2, 5.5 worked in beats; Ex. 5.8 and Bergou P7.2 ⚑ cited only, no graded challenge.
