# P-Q22-story — Q22 "Stabilizers, CSS codes and Gottesman–Knill" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format and standing gates as `P-Q21-story.md` (≥ 2 derivation views per track; one notation
beat per new notation; phase `'books'`, `[B]` ramp, `[C]` clues, `[D]` last in its unit). **Numbering and split:** see P-Q21 Questions 1–2
(`outline.ts` numbers this chapter Q22; Bergou §9.2 lives here by map merge 3). Ids `q22-…`, keys `q22…`, "Unit 20.k" follow the brief.

**Sources read** (paraphrased; printed pages). Bergou (printed = PDF − 8): §9.2 pp. 170–175 (Eqs. 9.35–9.54), Ch. 10 pp. 179–186 (Eqs.
10.1–10.22, Theorems 1–2, the Gottesman–Knill statement p. 184), Problems p. 186–187 (P10.1–10.3 ⚑: cited only; the map bars the GHZ and
H–CNOT–H circuits as story examples). **Page images checked:** pp. 172, 173, 175, 182, 184, 186. N&C (printed = PDF − 28): §10.4 pp.
445–453 (classical linear codes, Hamming, CSS), §10.5 pp. 453–472 (stabilizer formalism p. 454, Props 10.3–10.5 pp. 457–458, Fig. 10.7 and
Thm 10.6 pp. 460–462, measurement p. 463, Thm 10.7 Gottesman–Knill p. 464, Thm 10.8 and distance pp. 465–467, examples incl. Fig. 10.12 the
five-qubit code p. 469, Eqs. 10.106–10.107 pp. 469–470). No sheet assigns a Ch. 9–10 problem.

**Ownership.** F7 owns GF(2), weight, distance between strings, the check matrix $M$, the syndrome $Me$ and the $[7, 4]$ Hamming code with F7's
$M_7$ (column $j$ = $j$ in binary, top row most significant); Q4 owns $H$, $S$, $T$, CNOT and their tables; Q6 owns Pauli strings and the
stabilizer of one state ($X_1X_2$, $Z_1Z_2$ for $\Phi^+$); Q21 owns syndromes, code words, the bit-flip/phase-flip/Shor codes, weight, the
Knill–Laflamme condition, degeneracy and $[[n, k]]$. **Q22 owns:** generator matrices, code distance, dual codes, the Pauli group, stabilizer
groups and codes, the binary check matrix, the symplectic product, $k = n - \mathrm{rank}$, logical operators, $[[n, k, d]]$, the five-qubit
code, CSS codes from $(H_X, H_Z)$ with $H_XH_Z^T = 0$, the Steane code, lookup decoding and logical error rates, Clifford gates, stabilizer
measurement, tableaux and the Gottesman–Knill theorem.

**Evidence.** `planQ19Q20-numpy.py` (shared with Q21; 189 checks, 0 failed): dense 7- and 9-qubit code words, all 2¹⁴ Steane $X$-patterns'
decodings enumerated twice (by pattern and by weight polynomial), exhaustive distances, dense vs symplectic commutation on all 256 two-qubit
pairs, dense Clifford conjugations and the 24-element closure.

**Conventions.** $G$ ($n\times k$, columns = basic words) and $M$ (checks; Bergou's $H$, N&C's $H$) for classical codes. **The Pauli group is
$\mathcal P_n$** (Bergou and N&C write $G_n$; renamed so $G$ stays the generator matrix; Rosetta at stabilizer:b1). CSS check matrices are
$H_X$, $H_Z$, always subscripted (the paper's notation); a bare $H$ is the Hadamard (Rosetta at css:b1). Bergou's phase gate $F$ is Q4's $S$.
Rows $r(g) = (x|z)$, $X \leftrightarrow (1|0)$, $Z \leftrightarrow (0|1)$, $Y \leftrightarrow (1|1)$. Qubits 1…n from the left; Steane checks are
F7's $M_7$ rows 0001111, 0110011, 1010101 (Bergou's Eq. 9.53 lists the same rows bottom-up). $\bar X$, $\bar Z$ logical operators (N&C).

**Stage shorthand** (as P-Q21, plus): `tbS(C,k[,o])` = matrix tableau `{stabilizerOf:{circuit:C, upTo:k, outcomes:o}}`, signed rows from the
engine's tableau simulator (**S1**) · `code(C,{view:'words', word})` = K1's words view (§9.2). **Circuits:** `C_ENC_PF` 3 wires, init 000: [CNOT
q0→q1], [CNOT q0→q2], [H q0, q1, q2]. `C_MX` 3 wires: [H q0], [measure q0], [H q0]. `C_BF0(e)` = P-Q21's `C_BF(e)` without the Ry column (ψ =
|0⟩, so every gate is Clifford): 9 columns, measure at 8, conditioned fix at 9.

## 0. Chapter map
**Driving question:** "Can a code be named by the checks it passes, and when is a quantum circuit secretly easy to simulate?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q22-linear-codes` | Classical codes from two matrices | How do a few basic words and a few checks define a code? | Bergou pp. 170–172, 174–175; N&C pp. 445–450 | `qc-f7-gf2` |
| 2 | `q22-stabilizer` | Naming states by the checks they pass | Which Pauli strings can define a code, and how big is it? | Bergou pp. 179–181, 184–186; N&C pp. 454–458 | Q6, Q21 |
| 3 | `q22-check-matrix` | Pauli strings as bits | How do bits decide commuting, independence and distance? | Bergou pp. 180–181, 184–185; N&C pp. 456–458, 465–469 | `qc-f7-gf2` |
| 4 | `q22-css` | Two classical codes that fit together | When do two classical codes make a quantum code? | Bergou pp. 172–175; N&C pp. 450–453, 469–470 | — |
| 5 | `q22-decode` | From syndrome to correction | How is a syndrome turned into a fix, and how often does it fail? | N&C pp. 466, 472–474; Bergou pp. 171, 173–174 | Q21 |
| 6 | `q22-clifford` | Gates that move Pauli labels around | Which gates can a check list follow? | Bergou pp. 181–183; N&C pp. 459–464 | `qc-q4-one-qubit-gates` |
| 7 | `q22-gottesman-knill` | When a quantum computer is easy to fake | Why are stabilizer circuits classically cheap? | Bergou pp. 183–184; N&C p. 464 | Q18 |

**Outcomes:** build a linear code from $G$ or $M$ and find its distance and dual · describe a code by a stabilizer group and count $k = n - r$ ·
use the check matrix for products, commutation and independence · find logical operators and $d$; read $[[n, k, d]]$ · build a CSS code from
$H_X$, $H_Z$ with $H_XH_Z^T = 0$, including Steane's · decode small codes with a table and compute a logical error rate · update generators
through $H$, $S$, CNOT and Pauli measurements · state Gottesman–Knill and why $T$ escapes it. **Prerequisites:** `qc-f7-gf2`, `qc-pauli-string`,
`qc-stabilizer` (Q6), `qc-syndrome`, `qc-codeword`, `qc-kl-condition`, `qc-code-nk` (Q21), `qc-hadamard`, `qc-phase-gate`, `qc-cnot` (Q4).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: linear bits · stabilizer matrix, code · check bits, code · css bits, code · decode code, plot · clifford matrix, circuit · gk plot, circuit, matrix, code.

### Unit `q22-linear-codes` — Classical codes from two matrices
**b1 [B] · notation beat, `introduces: ['qc-generator-matrix']`** · Bridge `qc-f7-gf2`
- G: "A linear code builds every word from a few basic words. The $[6, 2]$ code has two, 111000 and 000111. Their XOR sums give 4 code words, so 2 bits ride in 6: a rate of $0.333$."
- F: "An $[n, k]$ linear code is the column space of a [[qc-generator-matrix|generator matrix]] $G$ ($n\times k$, independent columns over GF(2), <<qc-f7-gf2|Unit F7.4>>); data $v$ is sent as $Gv$ (Bergou p. 170, Eqs. 9.35–9.36; N&C p. 445). $[6, 2]$: words 000000, 111000, 000111, 111111."
- Cap G "the two basic words and their XOR, 111111" · F "the columns of $G$ and their sum" · Stage `br(['111000','000111'],{combine:'xor'})` · Claims `q22G62Words` [000000, 000111, 111000, 111111], `q22Rate62` 0.333.

**b2 [B]** (the same code by checks)
- G: "The same code is also the set of words passing four checks. Bits 1, 2 agree; bits 1, 3 agree; likewise in the second half. Each basic word passes all four, and only the 4 code words do."
- F: "Equivalently $C = \ker M$ for an $(n-k)\times n$ check matrix $M$ with independent rows (Bergou's $H$, Eq. 9.37; F7's $M$), and $MG = 0$. For $[6, 2]$: rows 110000, 101000, 000110, 000101, whose null space is exactly the 4 words."
- Cap G/F "the four checks against 111000: all read 0" · Stage `br(['110000','101000','000110','000101'],{against:'111000'})` · Claims `q22MG62` 0, `q22Null62` 4.

**b3 [B] · notation beat, `introduces: ['qc-code-distance']`** (D1)
- G: "The distance $d$ is the fewest places in which two code words differ. For $[6, 2]$, $d = 3$. Then each single flip leaves its own syndrome: six different patterns for six places."
- F: "The [[qc-code-distance|distance]] $d = \min\{\mathrm{wt}(x) : x \in C, x \ne 0\}$ equals the least distance between words, as $x + y \in C$ (Bergou p. 171). If $d \ge 2t + 1$, errors of weight $\le t$ have distinct syndromes. $[6, 2]$: $d = 3$; $M$'s columns 1100, 1000, 0100, 0011, 0010, 0001 differ."
- Cap G/F "the checks against a flip at place 4: they read 0011, column 4 of the check matrix" · Stage `br(M62,{against:'000100'})` · Claims `q22D62` 3, `q22Syn62` [1100, 1000, 0100, 0011, 0010, 0001] · Derivation D1.

**b4 [B] · notation beat, `introduces: ['qc-dual-code']`** (Correction box E2)
- G: "Swap roles: the checks of one code are the basic words of another, its dual. F7's Hamming code has 16 words; its dual keeps the 8 of even weight. Every nonzero one has weight 4, so the dual's distance is 4."
- F: "$MG = 0$ gives $G^TM^T = 0$: $M^T$ generates the [[qc-dual-code|dual code]] $C^\perp$, an $[n, n-k]$ code, and $\sum_{x\in C}(-1)^{x\cdot y} = 2^k$ for $y \in C^\perp$, else 0 (Eqs. 9.38–9.40). Hamming: $C^\perp \subset C$ is the even words, $d(C^\perp) = 4$, $d(C) = 3$ (Bergou p. 175 gives the dual 3: Correction box)."
- Cap G "F7's three Hamming checks: weight 4 each, sharing 2 places pairwise" · F "the rows of $M_7$, the generators of $C^\perp$" · Stage `br(M_7)` (weights readout) · Claims `q22HamWeights` [1, 7, 7, 1] (weights 0, 3, 4, 7), `q22DualD` 4, `q22HamD` 3.

**b5 [C]** (two flips fool the table)
- Q G: "The word 000000 suffers flips at places 2 and 3. What does the one-flip table do?" · Q F: "Decode $e = 011000$ with the $[6, 2]$ single-flip lookup table. Which word comes out?"
- Reveal G: "The checks read 1100, the pattern of place 1. The table flips place 1 and outputs 111000: a different, wrong code word. Distance 3 handles one flip, not two." · Reveal F: "$M\,011000 = 1100 = M\,100000$, so the decoder adds 100000 and returns 111000: a decoding error, since $\mathrm{wt}(e) = 2 > t = 1$."
- Cap G/F "the error 011000 and the table's fix 100000: together 111000, a code word" · Stage q `br(M62,{against:'011000'})`; reveal `br(['011000','100000'],{combine:'xor'})` · Claims `q22TwoFlip62` 1100, `q22Wrong62` 111000.

### Unit `q22-stabilizer` — Naming states by the checks they pass
**b1 [B] · notation beat, `introduces: ['qc-pauli-group']`** · Terms `qc-stabilizer` (Q6)
- G: "Chapter Q6 named $\Phi^+$ by two operators that leave it alone. Codes can be named the same way. The pieces are Pauli strings with a sign: one qubit has 16, $\pm1$ or $\pm i$ times $I$, $X$, $Y$, $Z$."
- F: "The [[qc-pauli-group|Pauli group]] $\mathcal P_1 = \{\pm1, \pm i\}\times\{I, X, Y, Z\}$ (16 elements; Bergou's $G_1$, Eq. 10.1) and $\mathcal P_n$, its $n$-fold products; any two elements commute or anticommute (Bergou p. 179). A [[qc-stabilizer|stabilizer]] of $|\psi\rangle$ has $g|\psi\rangle = |\psi\rangle$ (Chapter Q6). Rosetta: $\mathcal P_n$ is the books' $G_n$."
- Cap G/F "the product $XY$ as a Pauli row: $iZ$" · Stage `tb(['X','Y'],{product:true})` · Claims `q22G1` 16, `q22XYisZ` 0.

**b2 [B] · notation beat, `introduces: ['qc-stabilizer-group']`** (D2)
- G: "Collect every Pauli string that leaves all code states alone. For the bit-flip code there are four: $I$, $Z_1Z_2$, $Z_2Z_3$, $Z_1Z_3$. Two generate the rest. The states all four fix are exactly the combinations of $|000\rangle$ and $|111\rangle$."
- F: "A [[qc-stabilizer-group|stabilizer group]] $S \subset \mathcal P_n$ defines $V_S = \{|\psi\rangle : g|\psi\rangle = |\psi\rangle\ \forall g \in S\}$. For $S = \{I, Z_1Z_2, Z_1Z_3, Z_2Z_3\} = \langle Z_1Z_2, Z_2Z_3\rangle$, $V_S = \mathrm{span}\{|000\rangle, |111\rangle\}$, Chapter Q21's code space (Bergou pp. 179–180; N&C p. 455)."
- Cap G/F "the two generators and their product $Z_1Z_3$, each +1 on 0.6|000⟩ + 0.8|111⟩" · Stage `tb(['ZZI','IZZ'],{product:true, state:{circuit:C_ENC3}})` · Claims `q22SBitflip` 4, `q22VSdim` 2 · Derivation D2.

**b3 [B]** (two rules) · Bridge `qc-l7-compatible`
- G: "Two rules keep $V_S$ from being empty. $-I$ is not allowed, since $-|\psi\rangle = |\psi\rangle$ forces zero. And all members commute: if $gh = -hg$, the same argument gives zero again."
- F: "$V_S \ne \{0\}$ needs $-I \notin S$ and $S$ abelian (Bergou p. 180; commuting checks share eigenstates, <<qc-l7-compatible|Lecture 7>>): $g_1g_2 = -g_2g_1$ would give $|\psi\rangle = -|\psi\rangle$. Hence each $g \in S$ is Hermitian with $g^2 = I$, and $\pm iI \notin S$."
- Cap G/F "$X_1$ against $Z_1Z_2$: they anticommute, so no state passes both" · Stage `tb(['XII','ZZI'],{product:true})` · Claims `q22AntiX1` 1.

**b4 [B]** (each check halves the space; D3) · Terms `qc-stabilizer-code`
- G: "Each independent check keeps half of what passed the earlier ones. So $r$ checks on $n$ qubits leave $2^{n-r}$ dimensions: $k = n - r$ stored qubits. Bit-flip code: $3 - 2 = 1$. Shor: $9 - 8 = 1$."
- F: "Theorem 2 (Bergou p. 181, proof pp. 184–186): $n - k$ independent commuting generators with $-I \notin S$ give $\dim V_S = 2^k$. The projectors $P_x = 2^{-(n-k)}\prod_j(I + (-1)^{x_j}g_j)$ split the space into $2^{n-k}$ equal blocks, one per syndrome $x$ (Eqs. 10.16–10.22). $V_S$ is a [[qc-stabilizer-code|stabilizer code]]."
- Cap G/F "the Shor code's 8 checks: 9 qubits, 1 stored qubit" · Stage `code('shor9',{view:'checks'})` · Claims `q22KBitflip` 1, `q22KShor` 1, `q22TrP` 2 · Derivation D3.

**b5 [B]** (syndromes are commutation patterns)
- G: "Errors are Pauli strings too. An error that anticommutes with a check makes it read $-1$; one that commutes leaves $+1$. $X_2$ anticommutes with both checks: Table 9.1's $(-1, -1)$ again."
- F: "If $Eg = -gE$ then $g(E|\psi\rangle) = -E|\psi\rangle$: the syndrome bit of $g$ is its commutation sign with $E$ (N&C p. 466). Measuring the generators reads the syndrome without touching what $V_S$ stores."
- Cap G/F "the error $X_2$ on the bit-flip code: both checks light" · Stage `code('rep3',{error:'X2', show:['syndrome']})` · Claims `q22SynX2` [−1, −1].

**b6 [C]** (a third check?)
- Q G: "Add $Z_1Z_3$ as a third check of the bit-flip code. Does it now store no qubit, since $3 - 3 = 0$?" · Q F: "Is $\{Z_1Z_2, Z_2Z_3, Z_1Z_3\}$ independent? What is $\dim V_S$?"
- Reveal G: "No. $Z_1Z_3$ is the product of the other two, so it adds nothing. Only 2 checks are independent, and one qubit is still stored." · Reveal F: "$Z_1Z_3 = (Z_1Z_2)(Z_2Z_3)$, so the set is dependent (Eq. 10.2): $r = 2$ and $\dim V_S = 2$. Theorem 2 counts independent generators; Unit 20.3 tests independence by a rank."
- Cap G/F "three checks, but the third is the product of the first two" · Stage q `tb(['ZZI','IZZ','ZIZ'])`; reveal `tb(['ZZI','IZZ'],{product:true})` · Claims `q22RankDep` 2.

### Unit `q22-check-matrix` — Pauli strings as bits
**b1 [B] · notation beat, `introduces: ['qc-check-matrix']`**
- G: "Write each check as bits, an $X$ half and a $Z$ half: $X$ is 1|0, $Z$ is 0|1, $Y$ is 1|1. $Z_1Z_2$ becomes 000|110. Multiplying two checks XORs their rows; the sign is kept aside."
- F: "The [[qc-check-matrix|check matrix]] has one row $r(g) = (x|z) \in \mathrm{GF}(2)^{2n}$ per generator (Bergou p. 180, Eq. 10.4; N&C p. 456), and $r(gg') = r(g) + r(g')$ up to phase (Eq. 10.3): $XY = iZ$ is $(1|0) + (1|1) = (0|1)$. Bit-flip code: 000|110, 000|011."
- Cap G/F "the rows of $Z_1Z_2$ and $Z_2Z_3$ XOR to the row of $Z_1Z_3$, 000101" · Stage `br(['000110','000011'],{combine:'xor'})` · Claims `q22RowSum` 000101.

**b2 [B] · notation beat, `introduces: ['qc-symplectic-product']`** (D4)
- G: "Do two checks commute? Compare them qubit by qubit: two different letters, neither $I$, clash. An even number of clashes means they commute. In bits: dot one row with the other's halves swapped."
- F: "$g, g'$ commute iff the [[qc-symplectic-product|symplectic product]] $r(g)\Lambda r(g')^T = x\cdot z' + z\cdot x'$ is 0, $\Lambda = \begin{pmatrix}0&I\\I&0\end{pmatrix}$ (Eq. 10.15; Bergou pp. 184–185). $X_1$ against $Z_1Z_2$: $100\cdot110 + 000\cdot000 = 1$, anticommute."
- Cap G/F "000110 dotted with 000100, the row of $X_1$ swapped: 1, they anticommute" · Stage `br(['000110','000100'],{combine:'dot'})` · Claims `q22SympX1` 1, `q22SympAll` 0 (all 256 two-qubit pairs vs dense) · Derivation D4.

**b3 [B]** (independence is a rank) · Bridge `qc-f7-gf2`
- G: "Checks are independent exactly when their rows are, over bits. So $k = n - \text{rank}$, found by row moves (<<qc-f7-gf2|Unit F7.4>>). Shor's 8 rows have rank 8; the rows of $Z_1Z_2$, $Z_2Z_3$, $Z_1Z_3$ only rank 2."
- F: "Theorem 1 (Bergou p. 180, proof p. 181; N&C Prop. 10.3): commuting generators with $-I \notin S$ are independent iff their rows are linearly independent over GF(2), so $k = n - \mathrm{rank}$ (<<qc-f7-gf2|Unit F7.4>>). Shor: rank 8, $k = 1$; $\{Z_1Z_2, Z_2Z_3, Z_1Z_3\}$: rank 2."
- Cap G/F "the rows 000110, 000011, 000101 reduced: rank 2" · Stage `bx(['000110','000011','000101'], done)` · Claims `q22Rank3` 2, `q22RankShor` 8.

**b4 [B] · notation beat, `introduces: ['qc-logical-operator']`**
- G: "Some Pauli strings pass every check yet are not checks. They change the stored qubit and leave no trace: [[qc-logical-operator|logical operators]]. In the bit-flip code $Z_1$ is one; it flips the stored sign, as Unit 19.3 found."
- F: "[[qc-logical-operator|Logical operators]] $\bar X$, $\bar Z$ lie in $N(S) \setminus S$: they commute with every generator but are not in $S$ (N&C p. 465; $N(S)$ is the centralizer when $-I \notin S$). Bit-flip code: $\bar Z = Z_1$, $\bar X = X_1X_2X_3$. Shor (Bergou's signs): $\bar Z = X_1X_2X_3$, $\bar X = Z_1Z_4Z_7$."
- Cap G/F "$Z_1$ on the bit-flip code: no check lights, yet the stored sign flips" · Stage `code('rep3',{error:'Z1', show:['syndrome','logical']})` · Claims `q22LogZ1` 0, `q22ShorZbar` 0, `q22ShorXbar` 0.

**b5 [B] · notation beat, `introduces: ['qc-code-nkd']`** · Terms `qc-five-qubit-code`
- G: "The distance $d$ is the fewest qubits a logical operator touches. A code with $d = 2t + 1$ fixes any $t$ errors. We write $[[n, k, d]]$: bit-flip $[[3, 1, 1]]$, Shor $[[9, 1, 3]]$, and a code on five qubits, $[[5, 1, 3]]$."
- F: "The distance is the least weight in $N(S) \setminus S$ (N&C p. 467); an [[qc-code-nkd|$[[n, k, d]]$ code]] with $d \ge 2t + 1$ corrects any $t$-qubit error (N&C Thm 10.8). The [[qc-five-qubit-code|five-qubit code]]: generators $XZZXI$ and its cyclic shifts, $\bar X = X^{\otimes5}$, $\bar Z = Z^{\otimes5}$ (N&C Fig. 10.12), rank 4, $d = 3$."
- Cap G/F "the five-qubit code round a ring, with $Y$ on qubit 3 lighting three of its four checks" · Stage `code('five5',{error:'Y3', show:['syndrome']})` · Claims `q22DBitflip` 1, `q22DShor` 3, `q22RankFive` 4, `q22FiveD` 3.

**b6 [C]** (no wasted pattern)
- Q G: "The five-qubit code has 4 checks, so 16 possible syndromes. It must tell apart 15 one-qubit errors and “no error”. Is there room?" · Q F: "Are the 15 weight-1 errors' syndromes distinct and nonzero for the five-qubit code? Compare with the quantum Hamming bound."
- Reveal G: "Exactly: the 15 errors give 15 different patterns, and “no error” takes the 16th. No pattern is wasted, the room count of Unit 19.6 met with equality." · Reveal F: "All 15 syndromes are distinct and nonzero, so $1 + 15 = 2^4$: the code is perfect, saturating $2(1 + 3n) \le 2^n$ at $n = 5$ (N&C Ex. 10.50, cited)."
- Cap G/F "the five-qubit code's checks against its 15 one-qubit errors" · Stage q `code('five5',{view:'checks'})`; reveal `code('five5',{view:'checks', errors:['XIIII','YIIII','ZIIII','IXIII','IIIIZ']})` · Claims `q22FiveSyn` 15.

### Unit `q22-css` — Two classical codes that fit together
**b1 [B] · notation beat, `introduces: ['qc-css-code']`** (D5)
- G: "Use two kinds of check: strings of only $X$s and strings of only $Z$s, listed as bit matrices $H_X$ and $H_Z$. An $X$-check and a $Z$-check commute when they share an even number of qubits. So all checks commute exactly when $H_XH_Z^T = 0$."
- F: "A [[qc-css-code|CSS code]] has $X$-type checks (rows of $H_X$) and $Z$-type checks (rows of $H_Z$), check matrix $\begin{pmatrix}H_X&0\\0&H_Z\end{pmatrix}$ (N&C Eq. 10.106). The symplectic products are the entries of $H_XH_Z^T$, so the checks commute iff $H_XH_Z^T = 0$. Rosetta: a subscripted $H$ is a check matrix, a bare $H$ the Hadamard."
- Cap G/F "a Steane X-check (0001111) dotted with a Z-check (0110011): two shared places, so they commute" · Stage `br(['0001111','0110011'],{combine:'dot'})` · Claims `q22SteaneHXHZ` 0, `q22Overlap` 2 · Derivation D5.

**b2 [B]** (k from two ranks; Steane) · Terms `qc-steane-code`
- G: "Let both matrices be F7's Hamming checks. Each row has weight 4 and any two share 2 places, so all checks commute. Seven qubits minus 3 $X$-checks minus 3 $Z$-checks leave 1 stored qubit: the Steane code."
- F: "$k = n - \mathrm{rank}\,H_X - \mathrm{rank}\,H_Z$. With $H_X = H_Z = M_7$, $M_7M_7^T = 0$ and $k = 7 - 3 - 3 = 1$: the [[qc-steane-code|Steane code]] (Bergou pp. 174–175; N&C Fig. 10.6). Shor's code is CSS too, ranks 2 and 6, $k = 1$."
- Cap G/F "the Steane code: seven qubits, three X checks and three Z checks on the same three circles" · Stage `code('steane7',{view:'layout'})` · Claims `q22KSteane` 1, `q22ShorCssRanks` [2, 6].

**b3 [B]** (Bergou's code words; D6)
- G: "Bergou writes the code words out. $|\bar0\rangle$ is an even mix of the 8 even-weight Hamming words; $|\bar1\rangle$ of the 8 odd ones, each with amplitude $0.3536$. Hadamards on all seven qubits spread $|\bar0\rangle$ over all 16 words, $0.25$ each."
- F: "For $C_2 \subset C_1$, $|x + C_2\rangle = |C_2|^{-1/2}\sum_{y\in C_2}|x + y\rangle$ (Eq. 9.41) gives $[[n, k_1 - k_2]]$, and $H^{\otimes n}|x + C_2\rangle = 2^{-(n-k_2)/2}\sum_{u\in C_2^\perp}(-1)^{x\cdot u}|u\rangle$ (Eq. 9.43). Steane: $C_1 = $ Hamming, $C_2 = C_1^\perp$; amplitudes $8^{-1/2} = 0.3536$, then $0.25$."
- Cap G/F "|0̄⟩ of the Steane code: the 8 even Hamming words, 0.3536 each" · Stage `code('steane7',{view:'words', word:0})` · Claims `q22SteaneAmp` 0.3536, `q22SteaneWords` 8, `q22SteaneH` 0.25 · Derivation D6.

**b4 [B]** (both kinds fixed; distance; Correction box E1)
- G: "Bit flips are read by the $Z$-checks, sign flips by the $X$-checks, each with the Hamming table. $X$ on qubits 1, 2, 3 passes every check but swaps $|\bar0\rangle$ and $|\bar1\rangle$. So $d = 3$: the Steane code is $[[7, 1, 3]]$."
- F: "Bit flips are read through $H_Z$ ($= H_1$), phase flips after $H^{\otimes n}$ through $H_X$ ($= G_2^T$) (Eqs. 9.44–9.52). $\bar X = X^{\otimes7}$, $\bar Z = Z^{\otimes7}$ (N&C Eq. 10.107), with weight-3 forms $X_1X_2X_3$, $Z_1Z_2Z_3$: $[[7, 1, 3]]$, correcting all 21 one-qubit errors. Bergou p. 173 writes $d_1 > 2t_f + 1$ (Correction box)."
- Cap G/F "$X_1X_2X_3$ on the Steane code: no check lights, and it is a logical X" · Stage `code('steane7',{error:'X1X2X3', show:['syndrome','logical']})` · Claims `q22DSteane` 3, `q22SteaneAll1` 21, `q22SteaneXbar3` 0.

**b5 [C]** (any two codes?)
- Q G: "Could the $[6, 2]$ code's four checks serve as both $H_X$ and $H_Z$?" · Q F: "Is $M_{62}M_{62}^T = 0$? What fails if not?"
- Reveal G: "No. Checks 110000 and 101000 share one place, so the $X$ version of one and the $Z$ version of the other anticommute. No state passes both, so there is no code." · Reveal F: "$M_{62}M_{62}^T \ne 0$: rows 1 and 2 overlap once, so $X_1X_2$ and $Z_1Z_3$ anticommute and $S$ is not abelian (Unit 20.2). Bergou's $C_2 \subset C_1$ is exactly $H_1G_2 = 0$, i.e. $H_ZH_X^T = 0$."
- Cap G/F "110000 dotted with 101000: one shared place, an odd count" · Stage q `code('steane7',{view:'checks'})`; reveal `br(['110000','101000'],{combine:'dot'})` · Claims `q22Css62Fails` 1.

### Unit `q22-decode` — From syndrome to correction
**b1 [B] · notation beat, `introduces: ['qc-decoder']`**
- G: "Decoding turns a syndrome into a fix. For small codes a table does it: for each syndrome, store the lightest error that makes it. Steane's $Z$-checks read 101 for a bit flip on qubit 5, so the table says: flip qubit 5."
- F: "A [[qc-decoder|lookup decoder]] stores, for each of the $2^{n-k}$ syndromes, a minimum-weight Pauli with that syndrome, and applies it (N&C p. 466). Steane: $H_Ze$ is the binary of the flipped place, $X_5 \mapsto 101$; 64 syndromes = 8 for the $X$ part × 8 for the $Z$ part."
- Cap G/F "a bit flip on qubit 5: the Z checks read 101, and the table's fix is X on qubit 5" · Stage `code('steane7',{error:'X5', show:['syndrome','correction']})` · Claims `q22SynX5` 101, `q22Syn64` 64.

**b2 [B]** (two tables, one per kind)
- G: "A CSS code decodes bit flips and sign flips separately, each with its own small table. A $Y$ on qubit 3 reads 011 in both. Every one-qubit error is fixed, and so is any bit flip paired with any sign flip."
- F: "With $H_X = H_Z = M_7$ the $X$ and $Z$ parts of $E$ decode independently (Bergou pp. 173–174): $Y_3 \mapsto (011, 011)$. The 21 weight-1 errors and all 49 products $X_iZ_j$ are corrected; with the identity, 7 + 7 + 49 + 1 = 64 patterns fill the 64 syndromes."
- Cap G/F "a Y on qubit 3: both sets of checks read 011" · Stage `code('steane7',{error:'Y3', show:['syndrome','correction']})` · Claims `q22SynY3` [011, 011], `q22SteaneXZ` 49.

**b3 [B]** (two flips: a logical error) · Terms `qc-logical-error`
- G: "Bit flips on qubits 1 and 2 read 011, the pattern of qubit 3. The table flips qubit 3, completing $X_1X_2X_3$. That is a logical $X$: the stored qubit is now wrong, and no check says so."
- F: "$H_Z(e_1 + e_2) = 001 + 010 = 011 = H_Ze_3$, so lookup applies $X_3$ and leaves $X_1X_2X_3 \in N(S)\setminus S$, a [[qc-logical-error|logical error]]. A correction succeeds exactly when error × fix lies in $S$ (Chapter Q21's degeneracy)."
- Cap G/F "bit flips on qubits 1 and 2, fixed on qubit 3: what is left is a logical X" · Stage `code('steane7',{error:'X1X2', correction:'X3', show:['syndrome','correction','residual']})` · Claims `q22TwoFlipSyn` 011, `q22Residual` 1110000.

**b4 [B]** (how often it fails; D7)
- G: "Let each qubit flip with chance $p$, and count every pattern the table gets wrong. At $p = 0.01$ the stored qubit fails with chance $0.0020$, five times less than a bare qubit. Above $p = 0.0646$ the code makes things worse."
- F: "With independent $X$ flips and lookup decoding, $P_L(p) = \sum_e p^{|e|}(1-p)^{7-|e|}[e\cdot c(e) \notin S]$; failures by weight $0, 0, 21, 7, 28, 0, 7, 1$ give $P_L \approx 21p^2$: $0.0020$ at $0.01$, $0.1306$ at $0.1$. $P_L < p$ below $p^* = 0.0646$ (our calculation, exact enumeration)."
- Cap G/F "Steane's logical failure (curve) against a bare qubit's $p$ (line): they cross at 0.0646" · Stage `pl('steaneFailX',{vs:'identityP', x:{from:0,to:0.2}, markers:[{x:0.01},{x:0.0646}]})` · Claims `q22PL001` 0.0020, `q22PL01` 0.1306, `q22PStar` 0.0646, `q22FailsByW` [0,0,21,7,28,0,7,1] · Derivation D7.

**b5 [C]** (three flips that do no harm)
- Q G: "Three bit flips exceed what the Steane code promises. Can the table still save some of them?" · Q F: "Of the 35 weight-3 $X$ errors, how many does lookup decoding correct, and why?"
- Reveal G: "Yes, 28 of the 35. The fix lands on a fourth qubit, and the four flips together form an $X$-check, which changes nothing. The other 7 are logical operators themselves." · Reveal F: "28 of 35: the residual $e + c$ is an even Hamming word, a product of $X$-checks, so it lies in $S$. The 7 failures are the weight-3 code words: syndrome 000, nothing applied, $e \in N(S)\setminus S$."
- Cap G/F "flips on 1, 2, 4, fixed on 7: the four together are an X check" · Stage q `code('steane7',{error:'X1X2X4', show:['syndrome']})`; reveal `code('steane7',{error:'X1X2X4', correction:'X7', show:['syndrome','correction','residual']})` · Claims `q22W3Fixed` 28.

### Unit `q22-clifford` — Gates that move Pauli labels around
**b1 [B] · notation beat, `introduces: ['qc-clifford']`**
- G: "If $g$ fixes $|\psi\rangle$, then after a gate $U$ the new state is fixed by $UgU^\dagger$. For some gates that is again a Pauli string. Then a circuit can be followed by relabelling checks, never touching amplitudes."
- F: "$U|\psi\rangle = UgU^\dagger U|\psi\rangle$, so $UV_S$ is stabilized by $USU^\dagger$ (Eq. 10.8). Unitaries with $U\mathcal P_nU^\dagger = \mathcal P_n$ form the normalizer of $\mathcal P_n$, the [[qc-clifford|Clifford group]] (Bergou p. 182), generated by $H$, $S$ and CNOT (N&C Thm 10.6)."
- Cap G/F "H, then X, then H: the product is the table of Z" · Stage `mx({product:[{gate:'H'},{pauli:'X'},{gate:'H'}]},{values:'exact'})` · Claims `q22HXH` 0.

**b2 [B]** (three tables; Correction box E3) · Bridge `qc-q4-one-qubit-gates`
- G: "Three tables do most of the work. $H$ swaps $X$ and $Z$. $S$ turns $X$ into $Y$ and leaves $Z$ alone. CNOT copies an $X$ forward from control to target, and a $Z$ backward."
- F: "$H$: $X \to Z$, $Y \to -Y$, $Z \to X$; $S$ (Bergou's $F$, <<qc-q4-one-qubit-gates|Unit 4.2>>): $X \to Y$, $Y \to -X$, $Z \to Z$ (Eq. 10.9's last line prints $FYF^\dagger = Z$: Correction box); CNOT: $X_1 \to X_1X_2$, $Z_2 \to Z_1Z_2$, $Z_1$, $X_2$ fixed (Eq. 10.11). Up to phase there are 24 one-qubit Cliffords."
- Cap G/F "CNOT around $X$ on the control: $X$ on both" · Stage `mx({product:[{gate:'CNOT'},{pauli:'XI'},{gate:'CNOT'}]})` · Claims `q22SXS` 0, `q22SZS` 0, `q22CnotX1` 0, `q22Cliff24` 24.

**b3 [B]** (follow an encoder by its checks; D8)
- G: "Follow the phase-flip encoder by its checks alone. Start from $Z_1$, $Z_2$, $Z_3$. Two CNOTs give $Z_1$, $Z_1Z_2$, $Z_1Z_3$. Three Hadamards give $X_1$, $X_1X_2$, $X_1X_3$: the checks of $|{+}{+}{+}\rangle$, that code's $|\bar0\rangle$."
- F: "$|000\rangle$ has $\langle Z_1, Z_2, Z_3\rangle$; CNOT$_{1\to2}$, CNOT$_{1\to3}$ give $\langle Z_1, Z_1Z_2, Z_1Z_3\rangle$; $H^{\otimes3}$ gives $\langle X_1, X_1X_2, X_1X_3\rangle$, the stabilizer of $|{+}{+}{+}\rangle$ (Chapter Q21). Bergou's P10.1 and P10.3 circuits are cited, not worked."
- Cap G/F "the encoder and its three checks, column by column" · Stage `split(circ(C_ENC_PF,3) / tbS(C_ENC_PF,3))` · Claims `q22TrackEnd` [XII, XXI, XIX] · Derivation D8.

**b4 [B]** (measuring)
- G: "Measuring a check the state already passes changes nothing: the answer is certain. Measuring $X_1$ on $|000\rangle$ differs. $X_1$ clashes with the check $Z_1$, so the answer is $\pm1$ with chance $0.5$ each, and $\pm X_1$ replaces $Z_1$."
- F: "If $g$ commutes with all generators the outcome is fixed and $S$ is unchanged. Otherwise rewrite so only $g_1$ anticommutes ($g_j \to g_1g_j$, Eq. 10.12); outcomes $\pm1$ have probability $\tfrac12$ and $g_1 \to \pm g$ (Eq. 10.13). Syndrome checks commute with $S$, so reading them never disturbs the code."
- Cap G/F "measuring X on qubit 1 of |000⟩: outcome 0 (that is +1) with chance 0.5; the first check becomes $X_1$" · Stage `split(circ(C_MX,3,'0') / tbS(C_MX,3,'0'))` · Claims `q22MeasX` 0.5.

**b5 [C]** (is T a Clifford?)
- Q G: "Is the gate $T$ a Clifford gate? What does it do to $X$?" · Q F: "Compute $TXT^\dagger$. Is it in $\mathcal P_1$?"
- Reveal G: "No. $TXT^\dagger = (X + Y)/\sqrt2$: half-way between two Pauli tables, $0.7071$ of each. No relabelling can follow it; Unit 20.7 shows why that matters." · Reveal F: "$TXT^\dagger = (X + Y)/\sqrt2 \notin \mathcal P_1$, so $T$ lies outside the normalizer (N&C p. 462; the Toffoli likewise, Bergou P10.2 ⚑, cited). Adding $T$ to $H$, $S$, CNOT gives a universal set (N&C §4.5)."
- Cap G/F "T, then X, then T†: 0.7071 times (X + Y)" · Stage q `mx({gate:'T'},{values:'exact'})`; reveal `mx({product:[{gate:'T'},{pauli:'X'},{gate:'Tdg'}]},{values:'decimal'})` · Claims `q22TXT` 0.7071.

### Unit `q22-gottesman-knill` — When a quantum computer is easy to fake
**b1 [B]** (the tableau; Correction box E4) · Terms `qc-tableau`
- G: "A stabilizer state of $n$ qubits needs only $n$ checks of $2n$ bits, plus signs. For 50 qubits that is 5050 bits. Its list of amplitudes would hold $1.13 \times 10^{15}$ numbers."
- F: "A [[qc-tableau|stabilizer tableau]] stores $n$ generators as an $n\times2n$ binary matrix plus $n$ signs, $n(2n + 1)$ bits: 5050 at $n = 50$, 20100 at $n = 100$, against $2^{50} = 1.13\times10^{15}$ and $2^{100} = 1.27\times10^{30}$ amplitudes. Bergou's sample row in Eq. 10.14 has a factor $-iY$ (Correction box)."
- Cap G/F "tableau bits, about $2n^2$ (dashed), against $2^n$ amplitudes, on a log scale" · Stage `pl('twoToN',{vs:'nSquared', yScale:'log', markers:[{x:50}]})` · Claims `q22Tab50` 5050, `q22Tab100` 20100, `q22Amp50` 1.13e15, `q22Amp100` 1.27e30.

**b2 [B]** (a whole code cycle in the tableau)
- G: "Run the bit-flip code's cycle on $|0\rangle$ in the tableau: encode, flip qubit 2, read both checks, fix. The tableau says the helpers read 11 for certain, exactly what the full simulation gives."
- F: "With $|\psi\rangle = |0\rangle$ every gate of $C_{BF0}$ is Clifford. $H$ and $S$ update one column pair, CNOT two, $O(n)$ bits per gate (Aaronson–Gottesman, cited by Bergou); the helper outcomes 11 are deterministic, matching `runCircuit` (engine property test on random Clifford circuits, $n \le 5$)."
- Cap G/F "the cycle with a flip on qubit 2: helper rows end as −Z, both read 1 for certain" · Stage `split(circ(C_BF0('X2'),8,'11') / tbS(C_BF0('X2'),8,'11'))` · Claims `q22TabSyn` 1.

**b3 [B]** (the theorem) · Terms `qc-gottesman-knill`
- G: "The Gottesman–Knill theorem: circuits of $H$, $S$, CNOT, Pauli gates and Pauli measurements, started in 0s and 1s, are easy for an ordinary computer. Entanglement alone does not make a quantum computer powerful."
- F: "[[qc-gottesman-knill|Gottesman–Knill]] (Bergou p. 184; N&C Thm 10.7, p. 464): computational-basis preparation, $H$, $S$, Paulis, CNOT, Pauli measurements and classical control simulate classically in $O(mn^2)$ steps for $m$ operations. Steane's $|\bar0\rangle$ is entangled, yet its 7 generators (6 checks and $\bar Z$) describe it."
- Cap G/F "the Steane code's checks: 6 generators, and $\bar Z$ makes 7" · Stage `code('steane7',{view:'checks'})` · Claims `q22SteaneGens` 7.

**b4 [C]** (could Clifford circuits factor 21?)
- Q G: "Could a machine with only $H$, $S$, CNOT and Pauli measurements run Chapter Q18's order finding for 21 faster than a laptop?" · Q F: "Is order finding (Chapter Q18) possible with stabilizer operations alone?"
- Reveal G: "No: a laptop copies any such machine cheaply. Order finding needs turns like $T$, which are not Clifford. Supplying them safely is a topic for the Papers section." · Reveal F: "By Gottesman–Knill a speed-up needs non-Clifford resources; the QFT's $R_3 = T$ (Unit 18.2) lies outside the normalizer (Unit 20.6). Fault-tolerant non-Clifford gates, via magic states, belong to the Papers background chapters."
- Cap G/F "T, then X, then T†: not a Pauli table" · Stage q `code('steane7',{view:'checks'})`; reveal `mx({product:[{gate:'T'},{pauli:'X'},{gate:'Tdg'}]},{values:'decimal'})` · Claims `q22TXT` (reused).

**b5 [D]** (forward hook)
- G: "This chapter named codes by their checks and decoded them with tables. The Papers section builds on it: codes on a grid, operations between code blocks, and the codes of IBM's *Tour de gross*."
- F: "Stabilizer codes, CSS pairs $(H_X, H_Z)$, logical operators, distance and decoding are the vocabulary of the Papers section's background chapters (surface codes, lattice surgery, magic states, Pauli-based computation, bivariate bicycle codes) and of *Tour de gross* (arXiv:2506.03094)."
- Cap G/F "the Steane code by its checks" · Stage `code('steane7',{view:'checks'})` · Claims none.

**Count:** 5 + 6 + 6 + 5 + 5 + 5 + 5 = **37 beats**, 7 clues, 1 Go-deeper.

### 1.7 Claim ledger (key — engine call — value)
- linear: `q22G62Words` `linearCode(G62).words` · `q22Rate62` 0.333 · `q22MG62` `gf2Mul(M62,G62)` 0 · `q22Null62` 4 · `q22D62` `codeDistance` 3 · `q22Syn62` columns · `q22HamWeights` `weightEnumerator(hamming)` [1,7,7,1] · `q22DualD` 4 · `q22HamD` 3 · `q22TwoFlip62` 1100 · `q22Wrong62` 111000.
- stabilizer: `q22G1` 16 · `q22XYisZ` `pauliMul('X','Y')` = iZ, gap 0 · `q22SBitflip` 4 · `q22VSdim` tr(P) 2 (route A dense projector) · `q22AntiX1` 1 · `q22KBitflip/KShor` `codeK` 1, 1 · `q22TrP` 2 · `q22SynX2` · `q22RankDep` 2.
- check: `q22RowSum` 000101 · `q22SympX1` 1 · `q22SympAll` 0 (symplectic vs dense commutator, 256 pairs) · `q22Rank3` 2 · `q22RankShor` 8 · `q22LogZ1`, `q22ShorZbar`, `q22ShorXbar` dense gaps 0 · `q22DBitflip` 1, `q22DShor` 3, `q22FiveD` 3 `codeDistance` (exhaustive; witnesses ZII, XXXIIIIII, XYXII) · `q22RankFive` 4 · `q22FiveSyn` 15.
- css: `q22SteaneHXHZ` 0 · `q22Overlap` 2 · `q22KSteane` 1 · `q22ShorCssRanks` [2, 6] · `q22SteaneAmp` 0.3536 · `q22SteaneWords` 8 · `q22SteaneH` 0.25 (dense $H^{\otimes7}$) · `q22DSteane` 3 · `q22SteaneAll1` 21 · `q22SteaneXbar3` 0 · `q22Css62Fails` 1.
- decode: `q22SynX5` 101 · `q22Syn64` 64 · `q22SynY3` · `q22SteaneXZ` 49 · `q22TwoFlipSyn` 011 · `q22Residual` 1110000 · `q22PL001/PL01` `logicalFailure(steane7,p,'X')` 0.002004, 0.1306 (route B weight polynomial) · `q22PStar` bisection 0.0646 · `q22FailsByW` · `q22W3Fixed` 28.
- clifford: `q22HXH`, `q22SXS`, `q22SZS`, `q22CnotX1` `cliffordConjugate` gaps 0 · `q22Cliff24` closure 24 · `q22TrackEnd` `tableauTrace(C_ENC_PF)` · `q22MeasX` 0.5 · `q22TXT` 0.7071.
- gk: `q22Tab50/100` 5050, 20100 · `q22Amp50/100` · `q22TabSyn` tableau vs `runCircuit` P(11) 1 · `q22SteaneGens` 7.

## 2. Derivations (step — why — **view**; Ground ≥ Formal; ≥ 2 views each)
**D1 · linear:b3 · $d \ge 2t + 1 \Rightarrow$ distinct syndromes** — G (3): (1) two errors with one syndrome: their sum passes every check · **br(M62, against 011000)** · (2) so the sum is a code word of weight ≤ 2t · **br(['011000','100000'],xor)** · (3) nonzero words weigh ≥ 2t + 1: impossible · **br(M62, against 000100)**. F (2): (1) $Me_1 = Me_2 \Rightarrow e_1 + e_2 \in C$ · **br against 011000** · (2) weight bound · **br xor**.
**D2 · stabilizer:b2 · $V_S = \mathrm{span}\{|000\rangle, |111\rangle\}$** — G (3): (1) $Z_1Z_2 = +1$ keeps $|00x\rangle$, $|11x\rangle$ · **tb(['ZZI'])** · (2) $Z_2Z_3 = +1$ fixes $x$ · **tb(['ZZI','IZZ'],{product, state})** · (3) the code space · **code(rep3, layout)**. F (2): (1) eigenspaces (p. 180) · **tb ZZI** · (2) intersection · **tb pair**.
**D3 · stabilizer:b4 · $\dim V_S = 2^{n-r}$** — G (4): (1) each check's $(I + g)/2$ keeps half · **tb(['ZZI'])** · (2) the $2^r$ sign patterns cut the space into blocks · **code(rep3, checks, errors I, X1, X2, X3)** · (3) an error flipping one sign maps one block onto another, so blocks are equal · **code(rep3, X1, syndrome)** · (4) $2^n/2^r$ · **code(shor9, checks)**. F (3): (1) $P_x$, Eq. 10.16 · **code checks** · (2) $\sum_xP_x = I$, Eqs. 10.17–10.19 · (3) $gP_0g^\dagger = P_x$ with $G\Lambda y = x$, Eqs. 10.21–10.22 · **code X1**.
**D4 · check:b2 · commute $\iff x\cdot z' + z\cdot x' = 0$** — G (3): (1) on one qubit, two different non-$I$ letters anticommute · **br(['10','10'],{combine:'dot'})** (X's row against Z's, swapped) · (2) count clashes: $X_1$ vs $Z_1Z_2$ has 1 · **br(['000110','000100'],dot)** · (3) $Z_1Z_2$ vs $Z_2Z_3$ has 2: commute · **br(['000110','011000'],dot)**. F (2): (1) per-site form · **br X1** · (2) sum mod 2 = Eq. 10.15 · **br Z2Z3**.
**D5 · css:b1 · commute $\iff H_XH_Z^T = 0$** — G (3): (1) an $X$-row and a $Z$-row clash where both have 1 · **br(['0001111','0110011'],dot)** · (2) even overlap: commute · (3) every pair at once is the product $H_XH_Z^T$ · **code(steane7, checks)**. F (2): (1) $r = (a|0)$, $r' = (0|b)$: product $a\cdot b$ · **br** · (2) all pairs · **code checks**.
**D6 · css:b3 · Eq. 9.43** — G (3): (1) $|\bar0\rangle$ = even words · **code(steane7, words, 0)** · (2) the signs $(-1)^{y\cdot u}$ cancel unless $u$ passes every even word (Eq. 9.38) · **br(['0001111','1110000'],dot)** · (3) 16 words of 0.25 · **code(steane7, words, 'plus')**. F (3): Eq. 9.42 · **words 0** · Eq. 9.38 · **br** · Eq. 9.43 · **words plus**.
**D7 · decode:b4 · $P_L(p)$** — G (4): (1) weight-1: always fixed · **code(steane7, X5, syndrome, correction)** · (2) weight 2: always a logical error (21) · **code(steane7, X1X2, residual)** · (3) count by weight: 21, 7, 28, 0, 7, 1 · (4) add up, $\approx 21p^2$, crossing $0.0646$ · **pl(steaneFailX)**. F (3): (1) residual test $e\cdot c(e) \in S$ · **code X1X2** · (2) failure polynomial · (3) bisection · **pl**.
**D8 · clifford:b3 · the encoder's generators** — G (4): (1) $\langle Z_1, Z_2, Z_3\rangle$ · **tbS(C_ENC_PF,0)** · (2) CNOT$_{1\to2}$: $Z_2 \to Z_1Z_2$ · **tbS(…,1)** · (3) CNOT$_{1\to3}$: $Z_3 \to Z_1Z_3$ · **tbS(…,2)** · (4) $H^{\otimes3}$ swaps $X$, $Z$ · **tbS(…,3)**. F (2): Eq. 10.11 · **tbS 2** · Eq. 10.9 · **tbS 3**.
**viewCaptions:** D1 "two errors, one syndrome" / "their sum is a word" / "place 4's column" · D2 "Z₁Z₂ alone" / "both checks" / "the code space" · D3 "half kept" /
"four blocks" / "an error swaps blocks" / "Shor's 8 checks" · D4 "one clash" / "two clashes" · D5 "overlap 2" / "all checks" · D6 "|0̄⟩'s words" / "a sign test" /
"16 words" · D7 "one flip fixed" / "two flips fail" / "failure vs p" · D8 "start" / "after CNOT 1→2" / "after CNOT 1→3" / "after the Hadamards".

## 3. Try-it widgets (props read from `BitTable.tsx`, `AmplitudeBars.tsx`)
| Unit | Spec | Try this |
|---|---|---|
| linear | `bit-table {mode:'reduce', rows:['110000','101000','000110','000101']}` | Step to the end: “rank 4” and “null space: 000000, 000111, 111000, 111111”, the four words. Flip place 1 of row 2 (001000): rank 4 still, but the null space changes; the checks define the code. |
| stabilizer | `bit-table {mode:'reduce', rows:['000110','000011','000101']}` | The rows of $Z_1Z_2$, $Z_2Z_3$, $Z_1Z_3$. Step: “rank 2”: the third check is the product of the others, so $k = 3 - 2 = 1$. Remove row 3: rank 2 again. |
| check | `bit-table {mode:'strings', a:'000110', b:'000100', combine:'dot'}` | a is $Z_1Z_2$; b is $X_1$ with its halves swapped. “a·b = 1”: they anticommute. Set b to 011000 ($Z_2Z_3$ swapped): “a·b = 0”, they commute. |
| css | `bit-table {mode:'strings', a:'0001111', b:'0110011', combine:'dot'}` | Two Steane checks: “a·b = 0”, the overlap is even. Try b = 0001111: 0 (weight 4). Now a = 1100000, b = 1010000, as for the $[6,2]$ checks: “a·b = 1”, no CSS code. |
| decode | `bit-table {mode:'strings', a:'1100000', b:'0010000', combine:'xor'}` | a is the error $X_1X_2$, b the table's fix $X_3$: the XOR row reads 1110000, a Hamming word of odd weight, so a logical $X$. Set a to 1101000 and b to 0000001: 1101001, even weight, an $X$ check: harmless. |
| clifford | `amplitude-bars {state:[90, 0], basis:'y'}` | $|+x\rangle$ in the $y$ basis: 50/50. Set φ to 90°, which applies $S$: now +y reads 100%. $S$ turned the $X$ eigenstate into the $Y$ one, as $SXS^\dagger = Y$ says. |
| gk | `bit-table {mode:'cost', n:50}` | The marker line compares $2^n$ with $n^2$ at n = 50: the tableau grows like $2n^2$, the amplitude list like $2^n$. Slide to 10 and 20 to watch the gap open. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0; full walkthroughs)
- **linear** 1 warm-up numeric `q22-l-words` words of a $[n, 3]$ code → **8**. 2 core numeric `q22-l-d62` distance of $[6, 2]$ → **3**. 3 core numeric `q22-l-dual` distance of the $[7, 3]$ dual → **4**.
- **stabilizer** 1 warm-up numeric `q22-s-p1` $|\mathcal P_1|$ → **16**. 2 core numeric `q22-s-dim` $\dim V_S$, $n = 7$, 6 independent generators → **2**. 3 core choice `q22-s-minus` "Why is $-I \notin S$?" → **it would force $|\psi\rangle = 0$** ✓.
- **check** 1 warm-up choice `q22-c-row` row of $Y_1Z_2$ → **10|11** ✓. 2 core numeric `q22-c-symp` symplectic product of $XZZXI$, $IXZZX$ → **0**. 3 stretch numeric `q22-c-d5` distance of the five-qubit code → **3**.
- **css** 1 warm-up numeric `q22-x-k` $k$ of Steane → **1**. 2 core numeric `q22-x-amp` amplitude of each word of Steane's $|\bar0\rangle$ → **0.354**. 3 core choice `q22-x-62` "Can $M_{62}$ be both $H_X$ and $H_Z$?" → **no** ✓.
- **decode** 1 warm-up choice `q22-d-syn` Steane syndrome of $X_6$ → **110** ✓. 2 core numeric `q22-d-pl` $P_L$ at $p = 0.05$ → **0.0415** (tol 0.001). 3 core numeric `q22-d-w3` weight-3 $X$ errors corrected → **28**.
- **clifford** 1 warm-up choice `q22-f-hy` $HYH^\dagger$ → **$-Y$** ✓. 2 core choice `q22-f-cnot` CNOT$(I\otimes Z)$CNOT → **$Z\otimes Z$** ✓. 3 core numeric `q22-f-count` one-qubit Cliffords up to phase → **24**.
- **gk** 1 warm-up numeric `q22-g-bits` tableau bits at $n = 10$ → **210**. 2 core numeric `q22-g-amp` amplitudes at $n = 20$ → **1048576**. 3 core choice `q22-g-t` "Which of $H$, $S$, CNOT, $T$ breaks the theorem?" → **$T$** ✓.

## 5. Glossary (new; no clash with the 325 709 ids or with P-Q21's 11)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-generator-matrix` | generator matrix $G$ | notation | The basic words whose XOR sums make a code. | $n\times k$, $C = \{Gv\}$. | linear:b1 | `qc-f7-gf2` |
| `qc-code-distance` | distance $d$ | notation | Fewest places in which two code words differ. | $\min\mathrm{wt}(x)$, $x \in C\setminus0$; quantum: min weight in $N(S)\setminus S$. | linear:b3 | `qc-f7-gf2` |
| `qc-dual-code` | dual code $C^\perp$ | notation | The code made of another code's checks. | $\{y : y\cdot x = 0\ \forall x \in C\}$, generated by $M^T$. | linear:b4 | — |
| `qc-pauli-group` | Pauli group $\mathcal P_n$ | notation | Pauli strings with a sign $\pm1$ or $\pm i$. | $\{\pm1,\pm i\}\times\{I,X,Y,Z\}^{\otimes n}$ (books: $G_n$). | stabilizer:b1 | — |
| `qc-stabilizer-group` | stabilizer group $S$, $V_S$ | notation | All the Pauli checks a code passes, and the states passing them. | Abelian $S \subset \mathcal P_n$, $-I \notin S$; $V_S$ its $+1$ space. | stabilizer:b2 | — |
| `qc-stabilizer-code` | stabilizer code | — | A code defined by its list of checks. | $V_S$ with $k = n - \mathrm{rank}$ (Theorem 2). | stabilizer:b4 | — |
| `qc-check-matrix` | check matrix $r(g) = (x|z)$ | notation | Each check written as bits: an X half and a Z half. | Rows in $\mathrm{GF}(2)^{2n}$; products add rows (Eq. 10.3). | check:b1 | `qc-f7-gf2` |
| `qc-symplectic-product` | symplectic product | notation | Counts clashes; even means the checks commute. | $x\cdot z' + z\cdot x' = r\Lambda r'^T$ (Eq. 10.15). | check:b2 | — |
| `qc-logical-operator` | logical operators $\bar X, \bar Z$ | notation | Errors that pass every check but change the stored qubit. | $N(S)\setminus S$. | check:b4 | — |
| `qc-code-nkd` | $[[n, k, d]]$ | notation | $k$ qubits in $n$, logical operators of weight at least $d$. | Corrects $t$ errors when $d \ge 2t + 1$. | check:b5 | — |
| `qc-five-qubit-code` | five-qubit code | — | The smallest code that fixes any one error. | $[[5, 1, 3]]$, generators $XZZXI$ shifted. | check:b5 | — |
| `qc-css-code` | CSS code, $H_X$, $H_Z$ | notation | A code with only-$X$ checks and only-$Z$ checks. | $H_XH_Z^T = 0$, $k = n - \mathrm{rk}H_X - \mathrm{rk}H_Z$. | css:b1 | — |
| `qc-steane-code` | Steane code | — | Seven qubits, both check sets from the Hamming code. | $[[7, 1, 3]]$, $H_X = H_Z = M_7$. | css:b2 | `qc-f7-gf2` |
| `qc-decoder` | lookup decoder | notation | A table from each syndrome to its lightest error. | $2^{n-k}$ entries, minimum weight. | decode:b1 | — |
| `qc-logical-error` | logical error | — | A correction that leaves the stored qubit wrong. | error × fix $\in N(S)\setminus S$. | decode:b3 | — |
| `qc-clifford` | Clifford gate | notation | A gate that turns Pauli strings into Pauli strings. | $U\mathcal P_nU^\dagger = \mathcal P_n$; generated by $H, S$, CNOT. | clifford:b1 | `qc-q4-one-qubit-gates` |
| `qc-tableau` | stabilizer tableau | — | The bit table a classical computer keeps instead of amplitudes. | $n\times2n$ bits plus $n$ signs. | gk:b1 | — |
| `qc-gottesman-knill` | Gottesman–Knill theorem | — | Clifford circuits with Pauli measurements are easy to simulate. | $O(mn^2)$ classical steps (N&C Thm 10.7). | gk:b3 | — |

## 6. Review cards
- **linear** G: basic words make a code; checks test it; $d$ fixes $t = (d-1)/2$ flips; the dual swaps roles. F: Eqs. 9.35–9.40. Eq $MG = 0$. Trap: Bergou's "dual distance 3".
- **stabilizer** G: a code is the $+1$ space of commuting checks; each independent check halves it. F: Theorem 2. Eq $\dim V_S = 2^{n-r}$. Trap: counting dependent checks.
- **check** G: checks as bits; XOR = product; even clashes = commute; $d$ = lightest logical. F: Eqs. 10.3, 10.15, Thm 10.8. Eq $x\cdot z' + z\cdot x'$. Trap: "$Z_1Z_2$ is a logical operator of Shor's code" (it is a check).
- **css** G: $X$-checks and $Z$-checks from two classical codes that share evenly; Steane = Hamming twice. F: Eqs. 9.41–9.52, 10.106. Eq $H_XH_Z^T = 0$. Trap: "any two codes fit".
- **decode** G: syndrome → lightest error; X and Z separately; two flips can become a logical error. F: $P_L \approx 21p^2$. Eq $P_L(p)$. Trap: "a code always helps" (only below $p^*$).
- **clifford** G: $H$, $S$, CNOT move Pauli labels; measuring a clashing Pauli replaces one check. F: Eqs. 10.8–10.13. Eq $USU^\dagger$. Trap: Bergou's $FYF^\dagger = Z$.
- **gk** G: tableaux grow like $n^2$, amplitudes like $2^n$; Clifford circuits are cheap; $T$ is not Clifford. F: Thm 10.7. Eq $n(2n+1)$ bits. Trap: "entanglement means hard to simulate".

## 7. Symbol-before-use
**7.1 Ground:** $[n, k]$, $G$ linear:b1 · $M$ (F7) linear:b2 · $d$, $t$ linear:b3 · $\mathcal P_n$, $\pm i$ stabilizer:b1 · $S$, $V_S$, $|000\rangle$ stabilizer:b2 · $r$, $k$ (Q21) stabilizer:b4 · bits $x|z$ check:b1 · $\bar X, \bar Z$ check:b4 · $[[n,k,d]]$ check:b5 · $H_X, H_Z$ css:b1 · $p$, $P_L$ decode:b4 · $U$, $U^\dagger$ clifford:b1 · $T$ (Q4) clifford:b5. **FLAG:** $S$ is the stabilizer group (stabilizer:b2) and the phase gate (clifford:b2); the clifford unit says "the gate $S$" every time and the group is $S$ only in Units 20.2–20.5.
**7.2 Formal:** adds $v$, $Gv$ linear:b1 · $\ker$, $C^\perp$, $\sum(-1)^{x\cdot y}$ linear:b2–b4 · $\Lambda$, $r(g)$ check:b1–b2 · $N(S)$ check:b4 · $C_1, C_2, k_1, k_2, |x + C_2\rangle$ css:b3 · $e_1, e_2, G_2$ css:b4 · $c(e)$, $p^*$ decode:b4 · $m$ gk:b3. Counts: 0 used before definition in either track.

## 8. Errata (Correction boxes, `source: 'book'`; "our calculation finds …"; page images checked, 2026-10-14)
- **E1 (new)** p. 173: "$d_1 > 2t_f + 1$", "$d_2^\perp > 2t_p + 1$" and "weight less than $t_f$" should read $\ge$ and "at most"; as printed the Steane code ($d = 3$) would not qualify for $t = 1$, yet p. 175 says it corrects one error. Check `q22SteaneAll1` 21, `q22DSteane` 3.
- **E2 (new)** p. 175: after describing the $[7, 3]$ dual, the text says "this code also has a distance of 3"; our calculation finds every nonzero word of the dual has weight 4, so its distance is 4 ($C$ itself has 3). Check `q22DualD`, `q22HamWeights`.
- **E3 (new)** p. 182, Eq. 10.9, last line: "$FYF^\dagger = Z$" should be $FZF^\dagger = Z$ (the line above gives $FYF^\dagger = -X$). Check `q22SZS`, `q22SXS`.
- **E4 (new)** p. 184, Eq. 10.14: the sample generator $I \otimes (-iY) \otimes Z \cdots$ squares to $-I$, so it cannot lie in a stabilizer (p. 180's rule; its first factor is also labelled $I_2$). Check `pauliMul` gives $(-iY)^2 = -I$.
- **Checked, no box:** p. 186's Eq. 10.21 reads $G\Lambda y = x$ on the page (the text layer drops $\Lambda$; correct as printed); Eq. 9.43's first line lacks $|u\rangle$ (D6 writes it); $O(mn^2)$ is an upper bound (gates cost $O(n)$); Eq. 9.53 lists F7's rows in reverse order (same code); Eqs. 9.37, 9.54, 10.11 ✓.

## 9. Engine gaps and stage contracts
**9.1 Engine** beyond the parallel `physics/qec/` (block "q22" in `make_fixtures.py`, twins `pipeline/claims_qc709/q22.py`): `linearCode(G)`
(words, weight enumerator, distance) and `dualCode` · `cosetState(C1, C2, x)` dense (Eq. 9.41) and the $H^{\otimes n}$ image · `logicalFailure(code,
p, 'X' | 'Z' | 'depolarizing')`, `failuresByWeight`, `pseudoThreshold` (exact enumeration, n ≤ 9) · `cliffordConjugate(U, pauli)` (signed Pauli or
`null` with Pauli coefficients) and `cliffordClosure(1)` (24) · `tableauTrace(circuit, outcomes)` (signed generators after every column; the
tableau simulator with forced outcomes) · `codeK`, `logicalOps`, `codeDistance` with witnesses (listed engine; confirm the API names) · the
code `five5` coordinates (pentagon) and Steane's three-circle layout · Q21's `codewords`, `codeSyndrome`. Cross-checks: tableau vs `runCircuit`
on seeded random Clifford circuits (n ≤ 5, depth 40); `logicalFailure` polynomial vs pattern sum.
**9.2 Stage.** **K1 `code`** as specified in P-Q21 §9.2 (views `'layout'`, `'checks'`, `'words'` with `word: 0 | 1 | 'plus'`; codes `rep3`,
`shor9`, `steane7`, `five5`). **S1 (`matrix` tableau, additive):** `stabilizerOf: {circuit, upTo, outcomes?}` draws the engine's signed
generators (± prefix; up to 5 qubits, the circuit cap) after column `upTo`; a split with `circuit` must read the same circuit, cursor and
outcomes; a cursor change re-reads the trace (hard switch per column, as tableaux do). Authored `tableau` rows keep their 1–3-letter limit.
**S2 (`plot`):** `steaneFailX` ($P_L(p)$, x ∈ [0, 0.2]) beside Q21's `identityP`; `twoToN`/`nSquared` with `yScale:'log'` exist (F7).
**S3 (no field):** screenshot checks for the matrix `{gate:'CNOT'}` product grid and the tableau split. **Fallbacks:** S1 declined → authored
`tableau` rows per column (3 qubits) with the engine trace asserted in tests; K1 declined → see P-Q21.
**9.3 Widgets:** none required; every Try-it above is true on today's widgets.

## 10. Media (deferred)
Film `qc-q22-conjugate` "Gates push Pauli labels around" (manifest keys `q22HXH`, `q22SXS`, `q22CnotX1`, `q22TrackEnd`). Blender: Part IX's
opener (P-Q21). Decor: shared Part IX plate.

## 11. Hooks
**11.1 Concept stations:** `qc-linear-code-station` (needs `qc-f7-gf2`) · `qc-stabilizer-code-station` (needs Q21's `qc-bitflip-code-station`) ·
`qc-check-matrix-station` · `qc-css-station` (needs `qc-linear-code-station`, `qc-check-matrix-station`) · `qc-decoder-station` · `qc-clifford-station`
(needs `qc-cnot`) · `qc-gottesman-knill-station` (needs `qc-clifford-station`, `qc-qft-station`).
**11.2 Arcade (Spot the error, `Q22x`):** `qc-dual-distance` (`q22DualD`) · `qc-stab-dependent` ("three checks leave $k = 0$"; `q22RankDep`) ·
`qc-shor-z1z2-logical` ("$Z_1Z_2$ is logical"; `q22DShor`) · `qc-css-any-two` (`q22Css62Fails`) · `qc-decode-two` ("Steane fixes any two flips";
`q22TwoFlipSyn`) · `qc-s-table` (Bergou's $FYF^\dagger = Z$; `q22SZS`) · `qc-gk-entangled` ("entangled means hard to simulate"; `q22SteaneGens`).
**11.3 Bridges.** Out: `qc-f7-gf2` (linear:b1, check:b3), `qc-l7-compatible` (stabilizer:b3), `qc-q4-one-qubit-gates` (clifford:b2, "Unit 4.2"). No new bridge ids. In: Q21's dfs:b5 and Q18 (none needed).

## 12. Questions for the judge
1. Numbering and the §9.2 split: as P-Q21 Questions 1–2.
2. $\mathcal P_n$ for the Pauli group (books: $G_n$) to keep $G$ for generator matrices; $H_X$, $H_Z$ (the paper's names) with a Rosetta against the Hadamard; $M$ stays F7's classical check matrix.
3. Approve S1 (`matrix` tableau `stabilizerOf`) and the `steaneFailX` curve; K1 as in P-Q21.
4. Four Correction boxes E1–E4, all new and page-checked; E2 rests on reading "this code" as the dual (the nearest antecedent): box or footnote?
5. The logical error rate (decode:b4) is our own exact calculation, not Bergou's; it is the bridge to the paper's notion of a pseudo-threshold. Keep it as `[B]` or mark it Go-deeper?
6. P10.1–P10.3 are cited only; the story's Clifford example is the phase-flip encoder (not GHZ, not H–CNOT–H), as the map asks.
