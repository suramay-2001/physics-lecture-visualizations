# P-Q21-story — Q21 "Protecting qubits from noise" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q18-story.md`'s sections. Standing gates: ≥ 2 distinct derivation views per
track (W-709 #11); one notation beat per new notation (W-709 #12). Phase `'books'`: ramp `[B]`, clues `[C]`, Go-deeper `[D]` last in its unit.

**Numbering (Question 1).** The brief and `papers.md` R2 call this chapter Q21 and its partner Q22 (the map's pre-remap numbers). `outline.ts`
(remap ruling 2) numbers them **Q21** "Protecting qubits from noise" and **Q22** "Stabilizers, CSS codes and Gottesman–Knill"; Q21/Q22 there
are Walks and Machines, and F7 gf2:b3 already names the Hamming code's home "Chapter Q22". This plan uses the brief's ids (`q21-…`, claim
keys `q21…`, "Unit 19.k"); a judge ruling for Q21 is a mechanical rename (ids, keys, unit numbers, file names).
**Split (Question 2).** The brief lists CSS under Q21; `qc709-map.md` ruled Bergou §9.2 (linear codes, CSS, Steane) into the stabilizer
chapter (map merge 3), and `outline.ts` agrees. This plan follows the ruling: Q21 = §9.1 + §9.3; codes by checks, CSS, decoding = Q22.

**Sources read** (paraphrased; printed pages). Bergou Ch. 9 (printed = PDF − 8): §9.1 pp. 161–169 (Eqs. 9.1–9.34, Table 9.1), §9.3
pp. 175–177 (Eqs. 9.55–9.59), Problems p. 177 (P9.1–9.4 ⚑: cited only). **Page images checked** (150 dpi renders): pp. 163, 164, 169, 172,
173, 175, 176. N&C (printed = PDF − 28): §10.1 pp. 426–431 (Figs. 10.1–10.3), §10.2 pp. 432–434, §10.3 pp. 435–445 (Thm 10.1 p. 436, §10.3.1
discretization pp. 438–441, §10.3.3–10.3.4 pp. 444–445). No 709 sheet assigns a Ch. 9 problem; ⚑ problems are never a graded challenge.

**Ownership.** F5 owns independent chances (`f5-probability`); F7 owns GF(2), weight, Hamming distance, parity checks, the check matrix $M$,
the syndrome $Me$ and the $[7,4]$ code (`f7-gf2`); Q4 owns $X$, $Z$, $H$, CNOT, $HZH = X$ (`q4-k-hzh`), $P(\varphi)$; Q6 owns parities $Z\otimes Z$
and the stabilizer of one state (`qc-stabilizer`, q6-parities:b4 "the codes of Part IX are built on this idea"); Q8 owns $\rho$ and its
off-diagonal coherences; Q13 owns Kraus operators from a system–environment unitary (`q13-from-unitary`) and no-cloning; 448 L7 owns
compatible observables. **Q21 owns:** the repetition code and majority vote, syndromes of a quantum code, the bit-flip, phase-flip and Shor
codes, digitization of errors, error weight, the Knill–Laflamme condition, degenerate codes, $[[n, k]]$, the quantum Hamming bound,
collective dephasing and decoherence-free subspaces. Q22 owns stabilizer groups, check matrices, logical operators, distance, CSS, decoding.

**Evidence.** Scratchpad `planQ19Q20-numpy.py` (numpy only): route A dense state vectors and matrices (5-qubit syndrome circuits, the
9-qubit Shor code, seeded $U_{AE}$), route B GF(2)/symplectic algebra, binomial closed forms and exhaustive counts; **189 asserted checks, 0
failed** (shared with Q22). Every number below is printed by that script.

**Conventions.** Code qubits are numbered 1…n from the left (Bergou, N&C, F7 gf2:b3); qubit $j$ is wire $q_{j-1}$ (Rosetta at bit-flip:b1 F).
Running state $|\psi\rangle = 0.6|0\rangle + 0.8|1\rangle$ (chances 0.36, 0.64), prepared by $R_y(\theta_a)$, $\theta_a = 2\arccos0.6$ (in code).
A check reads $\pm1$; its helper (ancilla) bit reads 0 for $+1$, 1 for $-1$; a syndrome is written in helper bits ("11" = both $-1$). $\varphi$ is
an angle (709 lock). Claim keys `q21…`; twins `pipeline/claims_qc709/q21.py`. Q-chapters are named in words ("Chapter Q13", "Unit 19.3").

**Stage shorthand.** `circ(C,k[,o])`, `amp(C,k[,o],mode,f)` as in Q18 · `ampW(C,k,o,w)` = amplitudes `'probability'` with `keep: w` (a wire
list, **S2**) · `pl(fn,f)` = `{kind:'plot', curve:{fn, vs?, x?}, markers}` (**S3** names) · `br(rows,f)`, `bx(rows,k)` = bits rows / reduce ·
`tb(rows,f)` = matrix tableau (≤ 3 qubits, today's limits) · `mx(src,f)` = matrix grid · `mxr(mix)` = `mx({rho:{mixture}},{values:'decimal'})` ·
`code(C,f)` = **K1** `{kind:'code', code:C, view?, error?, correction?, show?}` (§9.2) · `split(a / b)`.

**Circuits** (angles in code). `C_BF(e)` 5 wires (q0–q2 code qubits 1–3, q3–q4 helpers), init `00000`: [Ry(θ_a) q0], [CNOT q0→q1], [CNOT
q0→q2], [error e: `none`, `X2`, `X1X2`, `Z1`, `rx60` = Rx(60°) on q1], [CNOT q0→q3], [CNOT q1→q3], [CNOT q1→q4], [CNOT q2→q4], [measure q3,
q4], [X on q0 / q1 / q2 conditioned on 10 / 11 / 01]: 10 columns. `C_PF(e)` 5 wires: the same encoder, [H q0–q2], [error], [H q0–q2], the four
parity CNOTs, [measure q3, q4]: 11 columns. `C_ENC3` = the first three columns on 3 wires. `C_1(φ)` 1 wire: [Ry(θ_a)], [P(φ)]. `C_DFS(φ)` 2 wires:
[Ry(θ_a) q0], [CNOT q0→q1], [X q1], [P(φ) q0, P(φ) q1] (gives $0.6|01\rangle + 0.8|10\rangle$, then the turn). `C_IND(φ₁,φ₂)`: last column P(φ₁) q0, P(φ₂) q1.

## 0. Chapter map
**Driving question:** "How can we fix an error in a qubit if looking at the qubit destroys it?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q21-classical` | Three copies and a majority vote | When does copying a bit three times help? | Bergou p. 161; N&C p. 426 | `qc-f5-probability`, `qc-f7-gf2` |
| 2 | `q21-bit-flip` | Checking parities without looking | How can a flip be found without reading the qubit? | Bergou pp. 162–163, Table 9.1, Eqs. 9.1–9.2; N&C pp. 427–430 | Q4, Q6, Q13, `qc-l7-compatible` |
| 3 | `q21-phase-flip` | Phase flips are bit flips seen sideways | How do we catch a sign flip? | Bergou p. 163; N&C pp. 430–431 | Q4 (`HZH = X`) |
| 4 | `q21-shor` | Nine qubits catch any single error | Can one code fix both kinds of flip? | Bergou pp. 163–164, Eq. 9.3; N&C pp. 432–434 | — |
| 5 | `q21-digitize` | Any error is a mix of four | Why do two kinds of flip cover every error? | Bergou pp. 164–165, Eqs. 9.4–9.9; N&C pp. 438–441 | Q13 |
| 6 | `q21-kl` | The test every code must pass | Exactly when can a set of errors be undone? | Bergou pp. 165–169, Eqs. 9.8–9.34; N&C pp. 436, 444–445 | — |
| 7 | `q21-dfs` | Hiding where the noise cannot reach | Can shared noise be dodged without any checks? | Bergou pp. 175–177, Eqs. 9.55–9.59 | Q8, `qc-l6-mixture` |

**Outcomes:** compute when a repetition code helps · encode $a|0\rangle + b|1\rangle$, read two parities with helpers and correct one flip
without learning $a$, $b$ · explain why a measured syndrome turns small errors into whole flips · build the phase-flip and Shor codes and read
their syndromes · expand any error in $I, X, Y, Z$ · test a code against the Knill–Laflamme condition, spot degeneracy, apply the quantum
Hamming bound · protect a qubit from collective dephasing. **Prerequisites:** `qc-f5-probability`, `qc-f7-gf2`, `qc-cnot`, `qc-pauli-string`,
`qc-stabilizer` (Q6), `qc-kraus-operator` (Q13), `qc-mixed-states` (Q8). **Openers:** Part IX's Blender opener sits before Unit 19.1 (§10).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: classical bits, plot, amplitudes · bit-flip circuit, amplitudes, matrix (tableau) · phase-flip circuit, amplitudes · shor code ·
digitize matrix, circuit, amplitudes, code · kl code, amplitudes, plot · dfs matrix, amplitudes, code.

### Unit `q21-classical` — Three copies and a majority vote
**b1 [B]** (copies and a vote) · Terms `qc-repetition-code` · Bridge `qc-f5-probability`
- G: "To guard one bit, send three copies: 0 becomes 000 and 1 becomes 111. The receiver takes a majority vote. Each copy flips with chance $p$, on its own (<<qc-f5-probability|Unit F5.1>>). At $p = 0.1$, zero to three flips have chances $0.729$, $0.243$, $0.027$ and $0.001$."
- F: "The [[qc-repetition-code|repetition code]] $0 \to 000$, $1 \to 111$ with majority decoding (Bergou §9.1, p. 161; N&C p. 426). With independent flips of probability $p$, $w$ flips occur with probability $\binom3w p^w(1-p)^{3-w}$ (<<qc-f5-probability|Unit F5.1>>): $0.729$, $0.243$, $0.027$, $0.001$ at $p = 0.1$."
- Cap G "000 sent, 010 received: one flip, and the vote still says 0" · F "$000 \oplus 010 = 010$: weight 1, majority 0" · Stage `br(['000','010'],{combine:'xor'})` · Claims `q21RepCounts` [0.729, 0.243, 0.027, 0.001].

**b2 [B]** (when the vote fails; D1)
- G: "The vote fails only when two or three copies flip. That has chance $p^2(3 - 2p)$, which is $0.028$ at $p = 0.1$. Three copies beat one exactly when $p < 0.5$."
- F: "Failure needs weight $\ge 2$: $3p^2(1-p) + p^3 = p^2(3 - 2p)$ (Bergou p. 161), $0.028$ at $p = 0.1$ and $0.000298$ at $p = 0.01$. Since $p^2(3-2p) - p = -p(1-p)(1-2p)$, encoding helps exactly when $p < 0.5$."
- Cap G "the vote's failure chance (curve) against a lone bit's $p$ (line): they cross at 0.5" · F "$p^2(3-2p)$ against $p$ on $[0, 1]$; markers at 0.1 and 0.5" · Stage `pl('repFail3',{vs:'identityP', markers:[{x:0.1},{x:0.5}]})` · Claims `q21RepFail01` 0.028, `q21RepFail001` 0.000298, `q21BreakEven` 0.5 · Derivation D1.

**b3 [B] · notation beat, `introduces: ['qc-syndrome']`** (checks find the flip, not the bit) · Bridge `qc-f7-gf2`
- G: "Two parity checks ask: do bits 1 and 2 agree, and do bits 2 and 3 agree? Their answers, the [[qc-syndrome|syndrome]], name the flipped bit without saying whether it is 0 or 1. A table turns each syndrome into a fix: that is decoding."
- F: "The checks are the rows 110, 011 of a check matrix $M$ (<<qc-f7-gf2|Unit F7.4>>). The [[qc-syndrome|syndrome]] $Me$ depends only on the error $e$: 10, 11, 01 for a flip at place 1, 2, 3. A decoder maps each syndrome to its likeliest error; the code words 000, 111 are the null space of $M$."
- Cap G "the checks 110 and 011 against the received 010: both read 1, so bit 2 flipped" · F "$M = (110;\,011)$, $M\,010 = 11$" · Stage `br(['110','011'],{against:'010'})` · Claims `q21RepSyn` [10, 11, 01], `q21RepNull` [000, 111].

**b4 [C]** (five copies)
- Q G: "Five copies and a majority vote: at $p = 0.1$, how much safer than three?" · Q F: "With five copies and majority decoding, what is the failure probability at $p = 0.1$, against $0.028$ for three?"
- Reveal G: "Five copies fail only when three or more flip: chance $0.00856$, about $3.27$ times safer. For any $p < 0.5$, more copies make failure rarer." · Reveal F: "Failure needs weight $\ge 3$: $10p^3(1-p)^2 + 5p^4(1-p) + p^5 = 0.00856$ at $p = 0.1$, a factor $3.27$ below three copies. Below $p = 0.5$ the binomial tail shrinks as copies are added."
- Cap G/F "three copies (curve) and five copies (dashed): five lie lower everywhere below 0.5" · Stage q `pl('repFail3',{markers:[{x:0.1}]})`; reveal `pl('repFail5',{vs:'repFail3', markers:[{x:0.1}]})` · Claims `q21RepFail5` 0.00856, `q21RepRatio` 3.27.

**b5 [B]** (three obstacles for qubits) · Bridge `qc-l3-postulates`
- G: "Qubits are harder. An unknown state cannot be copied (Chapter Q13). Looking at it changes it. And errors come in every size, including sign flips that turn $a|0\rangle + b|1\rangle$ into $a|0\rangle - b|1\rangle$."
- F: "Three obstacles (Bergou p. 162; N&C p. 427): no-cloning forbids $|\psi\rangle \to |\psi\rangle^{\otimes3}$ (Chapter Q13); measuring in the computational basis destroys superpositions (<<qc-l3-postulates|Lecture 3>>); and errors form a continuum, the phase flip $Z$ and small changes $a + O(\epsilon)$, $b + O(\epsilon)$ among them."
- Cap G "the qubit to protect, 0.6|0⟩ + 0.8|1⟩: chances 0.36 and 0.64" · F "$|\psi\rangle = 0.6|0\rangle + 0.8|1\rangle$" · Stage `amp(C_1(0),2,'probability')` · Claims `q21PsiChances` [0.36, 0.64].

### Unit `q21-bit-flip` — Checking parities without looking
**b1 [B] · notation beat, `introduces: ['qc-codeword']`** (encode, do not copy) · Terms `qc-cnot` (Q4)
- G: "Encode $0.6|0\rangle + 0.8|1\rangle$ with two CNOTs from qubit 1. The result is $0.6|000\rangle + 0.8|111\rangle$, carried by the two [[qc-codeword|code words]] $|\bar0\rangle = |000\rangle$ and $|\bar1\rangle = |111\rangle$. It is not three copies, which would overlap it only $0.5392$."
- F: "CNOTs from qubit 1 onto 2 and 3 map $a|0\rangle + b|1\rangle$ to $a|\bar0\rangle + b|\bar1\rangle$, with [[qc-codeword|code words]] $|\bar0\rangle = |000\rangle$, $|\bar1\rangle = |111\rangle$ spanning the code space (Bergou p. 162; N&C Fig. 10.2). It differs from $|\psi\rangle^{\otimes3}$: the overlap is $a^4 + b^4 = 0.5392$. Rosetta: code qubit $j$ is wire $q_{j-1}$."
- Cap G "two CNOTs spread qubit 1 over qubits 2 and 3: bars 0.6 and 0.8" · F "$0.6|000\rangle + 0.8|111\rangle$, helpers still 00" · Stage `split(circ(C_BF('none'),3) / amp(C_BF('none'),3,'amplitude'))` · Claims `q21EncBars` [0.6, 0.8], `q21NotCopy` 0.5392.

**b2 [B]** (two parities; Table 9.1) · Terms `qc-parity` (Q6) · Bridge `qc-l7-compatible`
- G: "Ask the two parity questions with two helper qubits. Each helper collects the [[qc-parity|parity]] of a pair: $Z_1Z_2$ or $Z_2Z_3$. Both code words give $+1$ twice. A flip of qubit 1, 2 or 3 gives its own pair of signs."
- F: "Measure $Z_1Z_2$ and $Z_2Z_3$ through helpers (two CNOTs each). They commute and are constant on the code (<<qc-l7-compatible|Lecture 7>>), so reading them leaves $a$, $b$ alone. Table 9.1: no flip $(+1, +1)$; $X_1$: $(-1, +1)$; $X_2$: $(-1, -1)$; $X_3$: $(+1, -1)$."
- Cap G "the two checks and their product $Z_1Z_3$: each reads +1 on the code state" · F "$Z_1Z_2$, $Z_2Z_3$, product $Z_1Z_3$; eigenvalue $+1$ on $0.6|000\rangle + 0.8|111\rangle$" · Stage `tb(['ZZI','IZZ'],{product:true, state:{circuit:C_ENC3}})` · Claims `q21Table91` [[1,1],[−1,1],[−1,−1],[1,−1]].

**b3 [B]** (one flip found and fixed; Correction box E1)
- G: "Flip qubit 2 by mistake. The helpers read 1 and 1: both checks gave $-1$, which points to qubit 2. Flip it back. The bars return to $0.6$ and $0.8$, and nobody learned them."
- F: "After $X_2$ the state $a|010\rangle + b|101\rangle$ is an eigenstate of both checks, so the helpers read 11 with probability 1, and the conditioned $X_2$ restores $a|\bar0\rangle + b|\bar1\rangle$ without revealing $a, b$ (Bergou p. 163 conditions this step on two $+1$ readings; both read $-1$: Correction box)."
- Cap G/F "qubit 2 flipped: helpers read 11, the conditioned X fires; bars 0.6 at 00011 and 0.8 at 11111" · Stage `split(circ(C_BF('X2'),10,'11') / amp(C_BF('X2'),10,'11','amplitude'))` · Claims `q21BfSynX2` 1, `q21BfRestored` [0.36, 0.64].

**b4 [B]** (small errors become whole flips; D2)
- G: "Now qubit 2 is only nudged by $R_x(60°)$: part “nothing”, part “flip”. The helpers still read 00 or 11, nothing between. With chance $0.75$ nothing happened; with chance $0.25$ a whole flip did, and we fix it."
- F: "$R_x(60°) = \cos30°\,I - i\sin30°\,X$ on qubit 2 is Eq. 9.1 with $\epsilon = 0.5$ (up to the phase $-i$). Measuring $Z_1Z_2$ projects onto the unflipped branch with probability $1 - \epsilon^2 = 0.75$ or the flipped one with $\epsilon^2 = 0.25$ (Eq. 9.2); either branch ends exactly corrected."
- Cap G/F "a 60° nudge on qubit 2: the helpers read 00 with chance 0.75, 11 with chance 0.25" · Stage `split(circ(C_BF('rx60'),9) / ampW(C_BF('rx60'),9,[3,4]))` · Claims `q21SmallP00` 0.75, `q21SmallP11` 0.25, `q21SmallEps` 0.5 · Derivation D2.

**b5 [C]** (two flips)
- Q G: "Qubits 1 and 2 both flip. What do the helpers read, and what does the fix do?" · Q F: "After $X_1X_2$, what syndrome appears, which correction is applied, and what is the final state?"
- Reveal G: "The helpers read 01, the pattern of qubit 3. Flipping qubit 3 completes $XXX$, which swaps the code words: $0.8|000\rangle + 0.6|111\rangle$. The code fails whenever two or more qubits flip: chance $0.028$ at $p = 0.1$, as for bits." · Reveal F: "$X_1X_2$ has syndrome 01, decoded as $X_3$; the net $X_1X_2X_3$ is a logical flip, $0.8|\bar0\rangle + 0.6|\bar1\rangle$. Under independent flips the code fails with probability $p^2(3 - 2p)$, the classical rate of Unit 19.1."
- Cap G/F "qubits 1 and 2 flipped: helpers read 01, the fix lands on qubit 3; bars 0.8 at 00001, 0.6 at 11101" · Stage q `circ(C_BF('X1X2'),9,'01')`; reveal `split(circ(C_BF('X1X2'),10,'01') / amp(C_BF('X1X2'),10,'01','amplitude'))` · Claims `q21TwoFlipSyn` 01, `q21TwoFlipSwap` [0.8, 0.6], `q21RepFail01` (reused).

### Unit `q21-phase-flip` — Phase flips are bit flips seen sideways
**b1 [B]** (a sign flip slips through)
- G: "Flip the sign instead: $Z_1$ turns the code state into $0.6|000\rangle - 0.8|111\rangle$. Both checks still read $+1$, so nothing gets fixed. The damaged state overlaps the original only $-0.28$."
- F: "$Z_1$ commutes with $Z_1Z_2$ and $Z_2Z_3$, so the syndrome is 00 while $a|\bar0\rangle + b|\bar1\rangle \to a|\bar0\rangle - b|\bar1\rangle$: $Z_1$ acts as a logical $Z$. The overlap is $a^2 - b^2 = -0.28$, the fidelity $0.0784$."
- Cap G/F "a sign flip on qubit 1: helpers read 00, and the 111 bar turns to −0.8" · Stage `split(circ(C_BF('Z1'),9,'00') / amp(C_BF('Z1'),9,'00','signed'))` · Claims `q21Z1Syn` 00, `q21Z1Overlap` −0.28, `q21Z1Fid` 0.0784.

**b2 [B]** (turn sideways)
- G: "A Hadamard turns a sign flip into a bit flip: $HZH = X$ (Chapter Q4). So encode sideways: $|0\rangle \to |{+}{+}{+}\rangle$ and $|1\rangle \to |{-}{-}{-}\rangle$. Now all eight strings carry some amplitude; $|000\rangle$ has $0.495$."
- F: "The phase-flip code $|\bar0\rangle = |{+}{+}{+}\rangle$, $|\bar1\rangle = |{-}{-}{-}\rangle$ (Bergou p. 163; N&C Fig. 10.3) is the bit-flip code turned by $H^{\otimes3}$. Since $HZH = X$ (Chapter Q4), $Z$ errors here act like $X$ errors there. The amplitude of $|000\rangle$ is $(a + b)/2^{3/2} = 0.495$."
- Cap G/F "the encoder with three Hadamards: eight real bars, 0.495 at 000" · Stage `split(circ(C_PF('none'),4) / amp(C_PF('none'),4,'signed'))` · Claims `q21PfBar000` 0.495.

**b3 [B]** (checks $X_1X_2$, $X_2X_3$)
- G: "The checks become $X_1X_2$ and $X_2X_3$. A sign flip on qubit 2 makes both read $-1$, and $Z_2$ undoes it. In the circuit, Hadamards turn the code back first, so the same helpers can ask."
- F: "Measure $X_1X_2$ and $X_2X_3$ as $H^{\otimes3}$, the $Z$-parity helpers, then $H^{\otimes3}$: $Z_1$ gives $(-1, +1)$, $Z_2$ gives $(-1, -1)$, $Z_3$ gives $(+1, -1)$, Table 9.1's pattern; correct with $Z_j$ (Bergou p. 163; N&C p. 431)."
- Cap G/F "a sign flip on qubit 2: after the Hadamards the helpers read 11" · Stage `split(circ(C_PF('Z2'),11,'11') / ampW(C_PF('Z2'),11,'11',[3,4]))` · Claims `q21PfSyn` [[−1,1],[−1,−1],[1,−1]].

**b4 [C]** (the blind spot)
- Q G: "The new code catches sign flips. What if qubit 1 suffers a bit flip instead?" · Q F: "Which single-qubit Pauli errors does the phase-flip code miss, and what do they do to $a|\bar0\rangle + b|\bar1\rangle$?"
- Reveal G: "It is missed: both checks still read $+1$. Worse, the stored qubit's sign flips; the 000 bar drops to $-0.0707$. Each three-qubit code fixes one kind of error and is blind to the other." · Reveal F: "$X_j$ commutes with $X_1X_2$, $X_2X_3$, and $X_1|{\pm}{\pm}{\pm}\rangle = \pm|{\pm}{\pm}{\pm}\rangle$ gives $a|\bar0\rangle - b|\bar1\rangle$: $X_1$ is this code's logical $Z$. Each code has a weight-1 logical operator; Unit 19.4 removes both."
- Cap G/F "a bit flip on qubit 1: the 000 bar falls from 0.495 to −0.0707" · Stage q `circ(C_PF('X1'),11,'00')`; reveal `split(circ(C_PF('X1'),5) / amp(C_PF('X1'),5,'signed'))` · Claims `q21PfX1Bar000` −0.0707.

### Unit `q21-shor` — Nine qubits catch any single error
**b1 [B]** (nest the two codes) · Terms `qc-shor-code`
- G: "Shor's idea: encode with the phase-flip code, then guard each of its three qubits with the bit-flip code. That takes nine qubits in three groups of three. $|\bar0\rangle$ is a sum of 8 strings, each with amplitude $0.3536$."
- F: "The [[qc-shor-code|Shor code]] concatenates the phase-flip code with the bit-flip code (Bergou Eq. 9.3; N&C p. 432): $|\bar0\rangle, |\bar1\rangle = 2^{-3/2}(|000\rangle \pm |111\rangle)^{\otimes3}$. Each is a sum of $2^3 = 8$ strings of amplitude $2^{-3/2} = 0.3536$."
- Cap G "nine qubits in three groups, with their eight checks" · F "the Shor code: six $ZZ$ checks inside groups, two six-qubit $X$ checks across them" · Stage `code('shor9',{view:'layout'})` · Claims `q21ShorBar` 0.3536, `q21ShorTerms` 8, `q21ShorChecks` 8.

**b2 [B]** (bit flips inside a group)
- G: "Inside each group, two $ZZ$ checks find a bit flip as before. A flip of qubit 5 lights $Z_4Z_5$ and $Z_5Z_6$, and nothing else."
- F: "The six checks $Z_1Z_2, Z_2Z_3, Z_4Z_5, Z_5Z_6, Z_7Z_8, Z_8Z_9$ locate any single $X_j$ in its group (Bergou p. 163): $X_5$ anticommutes with exactly $Z_4Z_5$ and $Z_5Z_6$, and $X_5$ undoes it."
- Cap G/F "a bit flip on qubit 5 lights the two Z checks beside it" · Stage `code('shor9',{error:'X5', show:['syndrome']})` · Claims `q21ShorX5` [Z4Z5, Z5Z6].

**b3 [B]** (sign flips between groups; Correction box E2)
- G: "A sign flip on any qubit flips its group's sign. Two big checks compare groups: $X_1\cdots X_6$ and $X_4\cdots X_9$. Group 1 gives $(-1, +1)$, group 2 gives $(-1, -1)$, group 3 gives $(+1, -1)$."
- F: "$Z_j$ maps its group's $|000\rangle + |111\rangle$ to $|000\rangle - |111\rangle$; $X_1\cdots X_6$ and $X_4\cdots X_9$ read the group as $(-1, +1)$, $(-1, -1)$, $(+1, -1)$ for groups 1, 2, 3, and any $Z$ in that group repairs it. Bergou p. 164 prints group 1 as $(+1, -1)$, group 3's pattern (Correction box)."
- Cap G/F "a sign flip on qubit 2: the first big check reads −1, the second +1" · Stage `code('shor9',{error:'Z2', show:['syndrome']})` · Claims `q21ShorZg` [[−1,1],[−1,−1],[1,−1]].

**b4 [B]** (Y, and two errors with one fix) · Terms `qc-degenerate-code`
- G: "$Y = iXZ$ is a bit flip and a sign flip at once, so it lights both kinds of check. Sign flips on qubit 1 or qubit 2 light the same checks. Fixing either works, because $Z_1Z_2$ does nothing to a code word."
- F: "$Y_j = iX_jZ_j$ lights one $ZZ$ pattern and one $X$ pattern. The 28 errors of weight $\le 1$ give only 22 distinct syndromes: $Z_1, Z_2, Z_3$ share one, yet $Z_2$ after $Z_1$ leaves $Z_1Z_2$, which fixes every code word. Such a code is [[qc-degenerate-code|degenerate]] (Bergou p. 165)."
- Cap G/F "a sign flip on qubit 1, repaired on qubit 2: what is left, $Z_1Z_2$, is one of the checks" · Stage `code('shor9',{error:'Z1', correction:'Z2', show:['syndrome','correction','residual']})` · Claims `q21ShorWt1` 28, `q21ShorDistinct` 22, `q21Z1Z2Trivial` 0.

**b5 [C]** (two bit flips)
- Q G: "Two qubits suffer bit flips. When does the Shor code still recover?" · Q F: "For a weight-2 $X$ error, when does minimum-weight decoding succeed? How many of the 36 pairs?"
- Reveal G: "When the flips sit in different groups, each group repairs its own: 27 of the 36 pairs. Two flips in one group fool its vote, and the fix completes a logical error." · Reveal F: "$X_iX_j$ in different groups decodes group by group: 27 of $\binom92 = 36$. In one group, $X_1X_2$ is decoded as $X_3$, leaving $X_1X_2X_3$, which passes every check yet acts as a logical $Z$."
- Cap G/F "two bit flips in group 1: the fix lands on qubit 3 and $X_1X_2X_3$ is left" · Stage q `code('shor9',{error:'X1X4', show:['syndrome']})`; reveal `code('shor9',{error:'X1X2', correction:'X3', show:['syndrome','correction','residual']})` · Claims `q21ShorW2Fixed` 27, `q21ShorW2` 36.

### Unit `q21-digitize` — Any error is a mix of four
**b1 [B]** (four building blocks; D3) · Terms `qc-pauli-matrices`
- G: "Any $2\times2$ table is a mix of $I$, $X$, $Y$ and $Z$. Each weight comes from a trace, halved. The nudge $R_x(60°)$ is $0.866\,I$ plus $-0.5i\,X$: part nothing, part flip."
- F: "Since $\mathrm{Tr}(PQ) = 2\delta_{PQ}$ on $\{I, X, Y, Z\}$, every $2\times2$ matrix is $A = \sum_Pc_PP$ with $c_P = \mathrm{Tr}(PA)/2$ (Bergou p. 164). For $R_x(60°)$: $c_I = \cos30° = 0.866$, $c_X = -i\sin30° = -0.5i$, $c_Y = c_Z = 0$."
- Cap G/F "the nudge $R_x(60°)$ as a table: 0.866 on the diagonal, −0.5i off it" · Stage `mx({gate:{name:'Rx',params:[60]}},{values:'decimal'})` · Claims `q21RxCI` 0.866, `q21RxCX` −0.5 · Derivation D3.

**b2 [B]** (the environment keeps notes)
- G: "Real noise couples a qubit to its surroundings (Chapter Q13). The joint state splits into four parts. In each the qubit got $I$, $X$, $Y$ or $Z$, and the surroundings keep a note."
- F: "$U_{AE}(|\psi\rangle|0\rangle_E) = \sum_PP|\psi\rangle|e_P\rangle_E$ with $|e_{I,Z}\rangle = \tfrac12(|e_{00}\rangle \pm |e_{11}\rangle)$, $|e_X\rangle = \tfrac12(|e_{01}\rangle + |e_{10}\rangle)$, $|e_Y\rangle = \tfrac i2(|e_{10}\rangle - |e_{01}\rangle)$ (Eqs. 9.4–9.6). This is Chapter Q13's Kraus form (Eqs. 9.10–9.12); on $n$ qubits the sum runs over $4^n$ strings (Eq. 9.7)."
- Cap G/F "the four Pauli tables: one of them happened, and the environment knows which" · Stage `tb(['I','X','Y','Z'])` · Claims `q21EnvSplit` 0 (seeded $U_{AE}$, gap 0).

**b3 [B]** (measuring picks one part) · Terms `qc-error-weight`
- G: "Measuring the checks keeps one part of the mix. So a code that fixes $X$, $Y$ and $Z$ on any one qubit fixes every one-qubit error. On $n$ qubits that is $1 + 3n$ cases: 10 for three qubits, 28 for nine."
- F: "Measuring the syndrome projects $\sum_aE_a|\bar\psi\rangle|e_a\rangle$ onto one $E_a$ (Eq. 9.9), so correcting a basis set $\mathcal E$ corrects its span. Usually $\mathcal E$ is every Pauli string of [[qc-error-weight|weight]] $\le t$: $\sum_{j\le t}\binom nj3^j$ strings, $10$ for $n = 3$ and $28$ for $n = 9$ ($t = 1$)."
- Cap G/F "the 60° nudge again: helpers read 00 (0.75) or 11 (0.25), never between" · Stage `split(circ(C_BF('rx60'),9) / ampW(C_BF('rx60'),9,[3,4]))` · Claims `q21Wt1n3` 10, `q21Wt1n9` 28.

**b4 [C]** (a decay on the bit-flip code)
- Q G: "Qubit 1 of the bit-flip code decays: the error is $\sqrt\gamma\,|0\rangle\langle1|$. Does the bit-flip code repair it?" · Q F: "Expand $K = \sqrt\gamma|0\rangle\langle1|$ in the Pauli basis. Does the three-qubit bit-flip code correct $K$ on qubit 1?"
- Reveal G: "$K$ is half $X$ plus half $iY$, each with weight $0.3$ when $\gamma = 0.36$. The checks read both as “qubit 1 flipped” and flip it back. The $Y$ part leaves a sign flip behind, which this code cannot see." · Reveal F: "$K = \tfrac{\sqrt\gamma}2(X + iY)$, coefficients $0.3$ at $\gamma = 0.36$. $X_1$ and $Y_1$ share the syndrome $(-1, +1)$; after the fix $X_1$ the $Y_1$ branch carries $X_1Y_1 = iZ_1$, a logical $Z$. The Shor code separates the two."
- Cap G/F "a $Y$ on qubit 1, repaired by $X$ on qubit 1: $Z_1$ is left" · Stage q `code('rep3',{error:'Y1', show:['syndrome']})`; reveal `code('rep3',{error:'Y1', correction:'X1', show:['syndrome','correction','residual']})` · Claims `q21DampCoef` 0.3.

### Unit `q21-kl` — The test every code must pass
**b1 [B]** (separate rooms)
- G: "Picture each error moving the code into its own room, at right angles to the others. One measurement tells which room; undoing that error finishes the job. For the bit-flip code, $I, X_1, X_2, X_3$ give four separate rooms."
- F: "If $\langle\bar j|E_b^\dagger E_a|\bar k\rangle = \delta_{ab}\delta_{jk}$ (Eq. 9.8), the spaces $E_a\mathcal H_C$ are orthogonal, measuring $\sum_a\lambda_aP_a$ reveals $a$, and $E_a^\dagger$ recovers (Bergou p. 165). For the bit-flip code with $\{I, X_1, X_2, X_3\}$ this Gram table is the $4\times4$ identity."
- Cap G "four errors, four different check patterns: four rooms" · F "the checks $Z_1Z_2$, $Z_2Z_3$ against $I, X_1, X_2, X_3$: four distinct syndromes" · Stage `code('rep3',{view:'checks', errors:['III','XII','IXI','IIX']})` · Claims `q21KlBitflipI` 0.

**b2 [B] · notation beat, `introduces: ['qc-kl-condition']`**
- G: "The exact rule allows more. An error may shrink or tilt the code, as long as it treats $|\bar0\rangle$ and $|\bar1\rangle$ alike. If it treats them differently, it has read the stored qubit. $Z_1$ does: $+1$ on $|000\rangle$, $-1$ on $|111\rangle$."
- F: "The [[qc-kl-condition|Knill–Laflamme condition]] $\langle\bar j|E_b^\dagger E_a|\bar k\rangle = C_{ba}\delta_{jk}$, with $C$ Hermitian and the same for every $j$, is necessary and sufficient (Bergou Eqs. 9.16, 9.34; N&C Thm 10.1, p. 436). Bit-flip code: $\langle\bar0|Z_1|\bar0\rangle = 1 \ne \langle\bar1|Z_1|\bar1\rangle = -1$, so $\{I, Z_1\}$ fails."
- Cap G/F "$Z_1$ on 0.6|000⟩ + 0.8|111⟩: the 000 bar stays +0.6, the 111 bar turns −0.8" · Stage `amp(C_BF('Z1'),4,'signed')` · Claims `q21KlZ1` [1, −1].

**b3 [B]** (degenerate codes pass; D4)
- G: "In the Shor code, $Z_1$ and $Z_2$ act identically on every code word. The rule still holds, with a table $C$ that is not the identity. Mix them: $Z_1 - Z_2$ gives zero on the code, and $Z_1 + Z_2$ is one clean error."
- F: "For $\{I, Z_1, Z_2\}$ on the Shor code, $C = \begin{pmatrix}1&0&0\\0&1&1\\0&1&1\end{pmatrix}$, eigenvalues $0, 1, 2$. A unitary remix of the Kraus operators diagonalizes $C$ (Eqs. 9.23–9.25) into $(Z_1 \pm Z_2)/\sqrt2$; the minus one annihilates the code, and $R_\nu$ (Eq. 9.26) undoes the other."
- Cap G/F "sign flips on qubit 1 and on qubit 2 light the same checks" · Stage `code('shor9',{error:'Z1', show:['syndrome']})` · Claims `q21KlShorC` 0 (gap to the printed table), `q21KlShorEig` [0, 1, 2] · Derivation D4.

**b4 [B] · notation beat, `introduces: ['qc-code-nk']`** (rooms must fit) · Terms `qc-quantum-hamming-bound`
- G: "Count rooms. An [[qc-code-nk|$[[n, k]]$ code]] stores $k$ qubits in $n$. Separate rooms for $1 + 3n$ errors need $2^k(1 + 3n) \le 2^n$. For one stored qubit, five is the least: $2 \times 16 = 32 = 2^5$."
- F: "A nondegenerate [[qc-code-nk|$[[n, k]]$ code]] correcting $t$ errors needs $2^k\sum_{j\le t}\binom nj3^j \le 2^n$, the [[qc-quantum-hamming-bound|quantum Hamming bound]] (N&C §10.3.4, pp. 444–445; Bergou P9.2 ⚑, cited). For $k = t = 1$: $n \ge 5$, equality at $n = 5$; Shor uses $56 \le 512$."
- Cap G/F "rooms needed, $2(1 + 3n)$, against dimensions available, $2^n$: they meet at $n = 5$" · Stage `pl('qhbNeed1',{vs:'twoToN', x:{from:1,to:10}, markers:[{x:5}]})` · Claims `q21QhbMinN` 5, `q21Qhb5` 32, `q21QhbShor` [56, 512].

**b5 [C]** (four qubits?)
- Q G: "Could four qubits protect one qubit from any single error, with separate rooms?" · Q F: "Does the quantum Hamming bound allow a nondegenerate $[[4, 1]]$ code with $t = 1$?"
- Reveal G: "No: four qubits offer 16 dimensions, but separate rooms need $2 \times 13 = 26$. Unit 20.3 builds the five-qubit code, which fills its 32 exactly." · Reveal F: "$2(1 + 12) = 26 > 16$: no nondegenerate $[[4, 1]]$ code corrects one error. The counting covers nondegenerate codes only (N&C p. 445); the five-qubit code of Unit 20.3 meets the bound with equality."
- Cap G/F "at $n = 4$: 26 needed, 16 available" · Stage q `pl('qhbNeed1',{vs:'twoToN', x:{from:1,to:10}})`; reveal `pl('qhbNeed1',{vs:'twoToN', x:{from:1,to:10}, markers:[{x:4},{x:5}]})` · Claims `q21Qhb4` [26, 16].

### Unit `q21-dfs` — Hiding where the noise cannot reach
**b1 [B]** (random phases fade coherence; Correction box E3) · Bridge `qc-l6-mixture`
- G: "Suppose $|1\rangle$ picks up a random phase, $+60°$ or $-60°$ with equal chance. On average, the off-diagonal entry of $\rho$ shrinks by half: from $0.48$ to $0.24$. A phase spread evenly round the circle wipes it out."
- F: "$R(\varphi) = e^{i\varphi(I - Z)/2}$ (Chapter Q4's $P(\varphi)$) with random $\varphi$ gives $\rho_{10} = a^*b\,z$, $z = \int p(\varphi)e^{i\varphi}d\varphi$ (Eqs. 9.55–9.57; the printed last term should be $|0\rangle\langle1|$: Correction box). Here $z = 0.5$, so $0.48 \to 0.24$; uniform $\varphi$ gives $0$, a Gaussian of width 1 rad $0.6065$."
- Cap G/F "ρ after a ±60° random phase: 0.36 and 0.64 on the diagonal, 0.24 off it" · Stage `mxr([{w:0.5, ket:circ(C_1(60))},{w:0.5, ket:circ(C_1(−60))}])` · Claims `q21Z60` 0.5, `q21Off0` 0.48, `q21Off1` 0.24, `q21ZUniform` 0, `q21ZGauss` 0.6065.

**b2 [B]** (one phase for both qubits) · Terms `qc-collective-dephasing`
- G: "Now two qubits feel the same random phase. $|01\rangle$ and $|10\rangle$ each hold one 1, so both turn by the same angle. $|00\rangle$ does not turn, and $|11\rangle$ turns twice as far."
- F: "[[qc-collective-dephasing|Collective dephasing]] $R(\varphi)\otimes R(\varphi)$ (Eq. 9.58) multiplies $|x_1x_2\rangle$ by $e^{i\varphi(x_1 + x_2)}$: phases $0$, $\varphi$, $\varphi$, $2\varphi$, here $0°, 60°, 60°, 120°$. On $a|01\rangle + b|10\rangle$ it is a global phase (Eq. 9.59)."
- Cap G/F "0.6|01⟩ + 0.8|10⟩ after a 60° shared turn: both dials at 60°" · Stage `amp(C_DFS(60),4,'amplitude',{dials:true})` · Claims `q21DfsPhases` [0, 60, 60, 120].

**b3 [B]** (store the qubit in the quiet pair; D5) · Terms `qc-dfs`
- G: "So store the qubit as $|0\rangle \to |01\rangle$ and $|1\rangle \to |10\rangle$. The shared phase now turns the whole state only, which changes nothing. Its $\rho$ keeps the $0.48$ that a lone qubit lost half of."
- F: "On the [[qc-dfs|decoherence-free subspace]] $\mathrm{span}\{|01\rangle, |10\rangle\}$, averaging Eq. 9.58 over any $p(\varphi)$ leaves $\rho$ unchanged (Bergou pp. 176–177): the coherence stays $0.48$, against $0.24$ for the bare qubit under the same noise."
- Cap G/F "ρ of 0.6|01⟩ + 0.8|10⟩ after the same ±60° noise: still 0.48 off the diagonal" · Stage `mxr([{w:0.5, ket:circ(C_DFS(60))},{w:0.5, ket:circ(C_DFS(−60))}])` · Claims `q21DfsOff` 0.48 · Derivation D5.

**b4 [C]** (noise that is not shared)
- Q G: "What if each qubit gets its own random $\pm60°$, chosen separately?" · Q F: "With independent $\varphi_1, \varphi_2 = \pm60°$, what becomes of the coherence between $|01\rangle$ and $|10\rangle$?"
- Reveal G: "Then the pair is not quiet. The coherence falls from $0.48$ to $0.12$, worse than a lone qubit's $0.24$. The trick needs noise that hits both qubits alike." · Reveal F: "The relative phase $\varphi_1 - \varphi_2$ survives: the entry becomes $ab\,|z|^2 = 0.48 \times 0.25 = 0.12$. The subspace is decoherence-free only for collective noise (Bergou p. 176); otherwise a code is needed."
- Cap G/F "independent ±60° phases: the off-diagonal drops to 0.12" · Stage q `amp(C_IND(60,−60),4,'amplitude',{dials:true})`; reveal `mxr(four equal kets C_IND(±60, ±60))` · Claims `q21IndOff` 0.12.

**b5 [D]** (forward hook)
- G: "Each code here was fixed by a short list of commuting checks. Chapter Q22 makes the list the definition of a code. The Papers section then builds larger codes the same way."
- F: "Every code above is the joint $+1$ space of commuting Pauli checks: $Z_1Z_2, Z_2Z_3$; $X_1X_2, X_2X_3$; Shor's eight. Chapter Q22 takes the checks as the definition (stabilizer codes); the Papers section's background chapters carry this to surface and LDPC codes (*Tour de gross*, arXiv:2506.03094)."
- Cap G/F "the Shor code named by its eight checks" · Stage `code('shor9',{view:'checks'})` · Claims `q21ShorChecks` (reused).

**Count:** 5 + 5 + 4 + 5 + 4 + 5 + 5 = **33 beats**, 7 clues, 1 Go-deeper.

### 1.7 Claim ledger (key — engine call — value; numpy in `planQ19Q20-numpy.py`)
- classical: `q21RepCounts` `binomialPmf(3, 0.1)` [0.729, 0.243, 0.027, 0.001] · `q21RepFail01/001` `repetitionFail(p, 3)` 0.028, 0.000298 (route A: enumerate 8 patterns) · `q21BreakEven` root of `repetitionFail(p,3) − p` 0.5 · `q21RepSyn` `syndromeOf(M_rep, e)` · `q21RepNull` `gf2Nullspace` · `q21RepFail5` 0.00856 · `q21RepRatio` 3.27 · `q21PsiChances` `runCircuit(C_1(0))` [0.36, 0.64].
- bit-flip: `q21EncBars` `runCircuit(C_BF('none'))` col 3 · `q21NotCopy` 0.5392 · `q21Table91` `codeSyndrome(rep3, X_j)` (route A ⟨Z₁Z₂⟩, ⟨Z₂Z₃⟩ dense) · `q21BfSynX2` P(11) 1 · `q21BfRestored` · `q21SmallP00/P11/Eps` `marginal(runCircuit(C_BF('rx60')), [3,4])` 0.75, 0.25; sin 30° 0.5 · `q21TwoFlipSyn` 01 · `q21TwoFlipSwap` [0.8, 0.6].
- phase-flip: `q21Z1Syn` 00 · `q21Z1Overlap` −0.28 · `q21Z1Fid` 0.0784 · `q21PfBar000` 0.495 · `q21PfSyn` · `q21PfX1Bar000` −0.0707.
- shor: `q21ShorBar` 0.3536, `q21ShorTerms` 8 (`codewords(shor9)` dense) · `q21ShorChecks` 8 · `q21ShorX5` · `q21ShorZg` `codeSyndrome(shor9, Z_j)` (route A ⟨g⟩ on the 512-vector) · `q21ShorWt1` 28 · `q21ShorDistinct` 22 · `q21Z1Z2Trivial` ‖Z₁Z₂|ψ̄⟩ − |ψ̄⟩‖ 0 · `q21ShorW2Fixed/W2` `lookupDecoder(shor9)` over weight-2 X 27, 36.
- digitize: `q21RxCI/CX` `pauliCoefficients(Rx(60°))` 0.866, −0.5i · `q21EnvSplit` `envPauliExpansion(U_AE)` gap 0 (seed 709) · `q21Wt1n3/n9` `paulisOfWeight(n, ≤1)` 10, 28 · `q21DampCoef` 0.3.
- kl: `q21KlBitflipI` `klMatrix(rep3, [I,X1,X2,X3])` vs I₄ 0 · `q21KlZ1` [1, −1] · `q21KlShorC` `klMatrix(shor9,[I,Z1,Z2])` gap 0 · `q21KlShorEig` [0, 1, 2] · `q21QhbMinN` `qhbMinN(1,1)` 5 · `q21Qhb5` 32 · `q21QhbShor` [56, 512] · `q21Qhb4` [26, 16].
- dfs: `q21Z60` 0.5 · `q21Off0/Off1` `mixtureN` entries 0.48, 0.24 · `q21ZUniform` 0 · `q21ZGauss` e^{−1/2} 0.6065 · `q21DfsPhases` · `q21DfsOff` 0.48 · `q21IndOff` 0.12.

## 2. Derivations (step `tex` — why — **view**; Ground ≥ Formal; ≥ 2 views each)
**D1 · classical:b2 · $p^2(3 - 2p) < p \iff p < \tfrac12$** — G (4): (1) two flips: 3 placements, each $p^2(1-p)$ · **br(['000','110'],{combine:'xor'})** · (2) three flips: $p^3$ · **br(['000','111'],{combine:'xor'})** · (3) add: $p^2(3 - 2p)$ · **pl repFail3, marker 0.1** · (4) subtract $p$: $-p(1-p)(1-2p)$, negative below ½ · **pl repFail3 vs identityP, marker 0.5**. F (3): (1) binomial tail · **br 110** · (2) closed form · **pl 0.1** · (3) factor · **pl 0.5**.
**D2 · bit-flip:b4 · $P(11) = \epsilon^2$, both branches repaired** — G (3): (1) the nudge is two branches, $\cos30°$ and $-i\sin30°$ · **circ(C_BF('rx60'),4)** · (2) the checks read $+1$ on one branch, $-1$ on the other · **tb(['ZZI','IZZ'],{product:true})** · (3) reading keeps a branch with chance amplitude² · **ampW(…,9,[3,4])**. F (2): (1) Eq. 9.2 · **circ** · (2) projectors $(I \pm Z_1Z_2)/2$ · **ampW**.
**D3 · digitize:b1 · $c_P = \mathrm{Tr}(PA)/2$** — G (4): (1) the four tables · **tb(['I','X','Y','Z'])** · (2) a product of two different ones has trace 0, of one with itself 2 · (3) so the trace picks one weight · (4) $R_x(60°)$: 0.866, −0.5i · **mx(Rx 60°)**. F (3): (1) orthogonality · **tb** · (2) expand $A$ · (3) result · **mx**.
**D4 · kl:b3 · recovery for a degenerate code** — G (3): (1) $Z_1$ lights one pattern · **code(shor9, Z1)** · (2) $Z_2$ lights the same · **code(shor9, Z2)** · (3) $Z_1 - Z_2$ vanishes on the code; undo $Z_1 + Z_2$ · **code(shor9, Z1, correction Z2, residual)**. F (3): (1) Eq. 9.24, $u$ diagonalizes $C$ · **code Z1** · (2) Eq. 9.26 $R_\nu$ · **code Z2** · (3) Eqs. 9.27–9.30, $\sum R_\nu^\dagger R_\nu$ completed by $P^\perp$ · **code residual**.
**D5 · dfs:b3 · $\rho$ unchanged on $\mathrm{span}\{|01\rangle, |10\rangle\}$** — G (3): (1) 01 and 10 hold one 1 each · **amp(C_DFS(60),4,{dials})** · (2) a common phase cancels in $|\psi\rangle\langle\psi|$ · (3) the average of equal matrices is that matrix · **mxr(C_DFS ±60)**. F (2): (1) Eq. 9.59 · **amp** · (2) Eq. 9.58 averaged · **mxr**.
**viewCaptions:** D1 "two flips outvote" / "three flips" / "failure at 0.1" / "the crossing at ½" · D2 "two branches" / "the checks' signs" / "00 or 11" ·
D3 "four Pauli tables" / "the nudge's table" · D4 "Z on qubit 1" / "Z on qubit 2" / "what is left is a check" · D5 "both dials turn alike" / "ρ unchanged".

## 3. Try-it widgets (props read from `BitTable.tsx`, `AmplitudeBars.tsx`, `ComplexPlaneQc.tsx`)
| Unit | Spec | Try this |
|---|---|---|
| classical | `bit-table {mode:'reduce', rows:['110','011']}` | Press Step to the end: “rank 2” and “null space: 000, 111”, exactly the two code words. Add a row 101: still “rank 2”, since 101 = 110 ⊕ 011 adds no new check, and the null space is unchanged. |
| bit-flip | `bit-table {mode:'strings', a:'110', b:'010', combine:'dot'}` | Row a is check 1 (qubits 1, 2), row b the error on qubit 2: “a·b = 1”, the check reads −1. Set a to 011: still 1. Set b to 001: check 1 gives 0, check 2 gives 1, the syndrome 01. |
| phase-flip | `amplitude-bars {state:[90, 0], basis:'x'}` | $|+x\rangle$ reads + for certain. Set φ to 180°, which is $Z$: now − takes 100%. A sign flip is a bit flip in the $x$ basis; switch to the $z$ basis: 50/50 either way, nothing to see. |
| shor | `bit-table {mode:'strings', a:'110', b:'100', combine:'dot'}` | Read places as groups: a is the first big check (groups 1, 2), b a sign flip in group 1: “a·b = 1”. Set a to 011 (second check): 0. So group 1 reads $(-1, +1)$, the corrected line of Unit 19.4. |
| digitize | `amplitude-bars {state:[20, 0], basis:'z'}` | A 20° tilt from $|0\rangle$, a small error. The bars read about 97.0% and 3.0%: a reading finds “no flip” or “a whole flip”, never a small one. |
| kl | `bit-table {mode:'cost', n:5}` | The marker line reads 2ⁿ = 32 at n = 5: exactly the $2 \times 16$ rooms a one-error code on five qubits needs. Slide to 4: 2ⁿ = 16, fewer than the 26 needed. |
| dfs | `complex-plane {mode:'phasor', phases:[60, 300]}` | Two equally likely phases, +60° and −60°: the resultant reads “size 1”, so their average $z$ is 0.5, the factor on the coherence. Turn the second arrow to 240°, opposite the first: “size 0”, so $z = 0$ and the coherence is wiped out. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0; full walkthroughs: no sheet assigns Ch. 9)
- **classical** 1 warm-up numeric `q21-c-fail` $p^2(3-2p)$ at $p = 0.2$ → **0.104**. 2 core numeric `q21-c-even` break-even $p$ → **0.5**. 3 core numeric `q21-c-five` five copies at $p = 0.2$ → **0.0579** (tol 0.001).
- **bit-flip** 1 warm-up choice `q21-b-syn` syndrome of $X_3$ → **01** ✓. 2 core numeric `q21-b-small` P(11) after $R_x(90°)$ on qubit 2 → **0.5**. 3 core choice `q21-b-copy` "Why is $a|000\rangle + b|111\rangle$ allowed despite no-cloning?" → **it is not three copies of $|\psi\rangle$** ✓.
- **phase-flip** 1 warm-up numeric `q21-p-overlap` overlap after $Z_1$ for $a = 0.8$, $b = 0.6$ → **0.28**. 2 core choice `q21-p-syn` X-check syndrome of $Z_3$ → **(+1, −1)** ✓. 3 core choice `q21-p-blind` errors the phase-flip code misses → **$X_j$** ✓.
- **shor** 1 warm-up numeric `q21-s-terms` strings in $|\bar0\rangle$ → **8**. 2 core choice `q21-s-group1` big-check signs for $Z_1$ → **(−1, +1)** ✓. 3 stretch numeric `q21-s-pairs` weight-2 $X$ errors corrected → **27**.
- **digitize** 1 warm-up numeric `q21-d-ci` $c_I$ of $R_x(90°)$ → **0.707**. 2 core numeric `q21-d-count` weight ≤ 1 Paulis on 5 qubits → **16**. 3 core numeric `q21-d-w2` weight-2 Paulis on 5 qubits → **90**.
- **kl** 1 warm-up numeric `q21-k-min` least $n$ for $k = t = 1$ → **5**. 2 core choice `q21-k-z1` "Does $\{I, Z_1\}$ pass on the bit-flip code?" → **no** ✓. 3 core numeric `q21-k-eig` largest eigenvalue of Shor's $C$ → **2**.
- **dfs** 1 warm-up numeric `q21-f-z` $z$ for ±90° → **0**. 2 core numeric `q21-f-off` coherence of $0.6|0\rangle + 0.8|1\rangle$ under ±30° → **0.416** (= 0.48 cos 30°). 3 core numeric `q21-f-ind` pair coherence under independent ±30° → **0.36**.

## 5. Glossary (new in 709; checked against all 325 709 ids: no duplicate)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-repetition-code` | repetition code | — | Send each bit several times and take a vote. | $0 \to 0^n$, $1 \to 1^n$, majority decoding. | classical:b1 | `qc-f5-probability` |
| `qc-syndrome` | syndrome | notation | The check answers, which name the error, not the data. | $Me$ (classical); the $\pm1$ outcomes of the checks (quantum). | classical:b3 | `qc-f7-gf2` |
| `qc-codeword` | code words $|\bar0\rangle, |\bar1\rangle$ | notation | The two states that stand for 0 and 1 inside a code. | Basis $|\bar j\rangle$ of the code space $\mathcal H_C$. | bit-flip:b1 | — |
| `qc-shor-code` | Shor code | — | Nine qubits: three groups that each fix bit flips, compared for sign flips. | $2^{-3/2}(|000\rangle \pm |111\rangle)^{\otimes3}$ (Eq. 9.3). | shor:b1 | — |
| `qc-degenerate-code` | degenerate code | — | A code where different errors may share one fix. | Fails Eq. 9.8 yet satisfies Eq. 9.16. | shor:b4 | — |
| `qc-error-weight` | weight of an error | — | How many qubits a Pauli error touches. | Number of non-$I$ factors of $E \in \{I,X,Y,Z\}^{\otimes n}$. | digitize:b3 | `qc-f7-gf2` |
| `qc-kl-condition` | Knill–Laflamme condition | notation | Errors must treat both code words alike and keep them apart. | $\langle\bar j|E_b^\dagger E_a|\bar k\rangle = C_{ba}\delta_{jk}$ (Eq. 9.16). | kl:b2 | — |
| `qc-code-nk` | $[[n, k]]$ code | notation | A code storing $k$ qubits in $n$. | A $2^k$-dimensional code space in $(\mathbb C^2)^{\otimes n}$. | kl:b4 | — |
| `qc-quantum-hamming-bound` | quantum Hamming bound | — | Every fixable error needs its own room, and the rooms must fit. | $2^k\sum_{j\le t}\binom nj3^j \le 2^n$ (nondegenerate). | kl:b4 | — |
| `qc-collective-dephasing` | collective dephasing | — | One random phase shared by all qubits. | $R(\varphi)^{\otimes n}$ averaged over $p(\varphi)$ (Eq. 9.58). | dfs:b2 | `qc-l6-mixture` |
| `qc-dfs` | decoherence-free subspace | — | States the shared noise only turns as a whole. | $\mathrm{span}\{|01\rangle, |10\rangle\}$ under Eq. 9.58. | dfs:b3 | — |

## 6. Review cards
- **classical** G: three copies and a vote fail with $p^2(3-2p)$, better than $p$ below ½; checks name the flip. F: binomial tail, $Me$, lookup decoding. Eq $p^2(3-2p)$. Trap: "more copies always help" (only for $p < ½$).
- **bit-flip** G: encode with CNOTs; helpers read $Z_1Z_2$, $Z_2Z_3$; a small error becomes none or a whole flip. F: Table 9.1, Eqs. 9.1–9.2. Eq $a|000\rangle + b|111\rangle$. Trap: "the helpers measure the qubits".
- **phase-flip** G: $HZH = X$; encode in $|\pm\rangle$; checks $X_1X_2$, $X_2X_3$. F: conjugation by $H^{\otimes3}$. Eq $|{+}{+}{+}\rangle, |{-}{-}{-}\rangle$. Trap: "the bit-flip code sees sign flips".
- **shor** G: nest the codes; 6 $ZZ$ and 2 $X$ checks; $Y$ lights both; $Z_1$, $Z_2$ share a fix. F: Eq. 9.3, degeneracy. Eq $2^{-3/2}(|000\rangle \pm |111\rangle)^{\otimes3}$. Trap: Bergou's group-1 line.
- **digitize** G: every error is a mix of $I, X, Y, Z$; measuring the checks keeps one. F: Eqs. 9.5–9.9. Eq $c_P = \mathrm{Tr}(PA)/2$. Trap: "small errors need small corrections".
- **kl** G: errors must keep code words apart and treat them alike; rooms must fit. F: Eq. 9.16, Hamming bound. Eq $\langle\bar j|E_b^\dagger E_a|\bar k\rangle = C_{ba}\delta_{jk}$. Trap: "$C$ must be the identity".
- **dfs** G: shared random phases spare $|01\rangle$, $|10\rangle$. F: Eqs. 9.55–9.59. Eq $R\otimes R(a|01\rangle + b|10\rangle) = e^{i\varphi}(\cdot)$. Trap: "it also works for independent noise".

## 7. Symbol-before-use
**7.1 Ground:** $p$ classical:b1 · $M$ (F7) classical:b3 · $a, b$, $|\psi\rangle$ classical:b5 · $|\bar0\rangle, |\bar1\rangle$, CNOT (Q4) bit-flip:b1 · $Z_j$, $Z_1Z_2$ (Q6) bit-flip:b2 · $X_j$ bit-flip:b3 · $R_x$ (Q4) bit-flip:b4 · $H$ (Q4), $|\pm\rangle$ phase-flip:b2 · $Y$ shor:b4 · $\mathrm{Tr}$ (F3) digitize:b1 · $\gamma$ digitize:b4 · $n, k$, $[[n,k]]$ kl:b4 · $\rho$ (Q8), $z$ dfs:b1. **FLAG:** $k$ (stored qubits) is introduced at kl:b4, never before.
**7.2 Formal:** adds $w$, $\binom3w$ classical:b1 · $e$, $Me$ classical:b3 · $q_{j-1}$ (Rosetta) bit-flip:b1 · $\epsilon$ bit-flip:b4 · $U_{AE}$, $|e_P\rangle$, $E_a$, $\mathcal E$, $t$ digitize:b2–b3 · $C_{ba}$, $\delta$, $R_\nu$, $P_a$, $\lambda_a$ kl:b1–b3 · $R(\varphi)$, $p(\varphi)$ dfs:b1. Counts: 0 used before definition in either track.

## 8. Errata (Correction boxes, `source: 'book'`; each `check` an engine computation worded "our calculation finds …"; page images checked by this planner, 2026-10-14)
- **E1 (new)** p. 163, last lines before the phase flip: the sentence that applies $X_2$ conditions it on both checks reading $+1$, right after both were found to read $-1$; it should say $-1$ for both. Check `q21Table91` ($X_2 \to (-1, -1)$), `q21BfSynX2`.
- **E2 (map, "first-cluster case")** p. 164: the error in the first cluster is printed as "first gives 1 and the second −1", the same as the third cluster; our calculation finds $(-1, +1)$. Check `q21ShorZg`.
- **E3 (new)** p. 176, Eq. 9.56: the last term $ab^*z^*|0\rangle\langle0|$ should be $|0\rangle\langle1|$; as printed the matrix has trace $1 + ab^*z^*$ (1.24 at our numbers). Check `q21Off1`, trace 1.
- **Checked, no box:** Eq. 9.5's "$|e_Z\rangle_Z$" and p. 169's "$0 \le p_a \le$ and" (typesetting; Eq. 9.6 verified, `q21EnvSplit`); Eq. 9.43's first line lacks $|u\rangle$ (Q22's D6 writes it); $Y = iXZ$ ✓; Table 9.1 ✓; the classical failure and break-even ✓.

## 9. Engine gaps and stage contracts
**9.1 Engine** (the parallel `physics/qec/` covers GF(2), Pauli/symplectic, stabilizer checks, codes `rep3`/`shor9`/`steane7`/`five5`,
syndromes, distance, lookup decoders, a tableau simulator). **Beyond it, Q21 needs** (numpy block "q21" in `make_fixtures.py`, twins in
`pipeline/claims_qc709/q21.py`): `repetitionFail(p, n)` and `binomialPmf(n, p)` · `codewords(code)` dense $|\bar0\rangle, |\bar1\rangle$ for $n \le 9$ ·
`codeSyndrome(code, pauli)` as ±1 per check, plus the dense cross-check $\langle\bar\psi|E^\dagger gE|\bar\psi\rangle$ · `klMatrix(code, errors)` (C, its
eigenvalues, the $j$-independence gap) · `pauliCoefficients(A)` (2×2) · `envPauliExpansion(U_AE)` (Eqs. 9.5–9.6) · `paulisOfWeight(n, t)` ·
`qhbMinN(k, t)`, `qhbNeed(n, k, t)` · `dephasingFactor(phases, weights)` · the code `rep3x` (phase-flip). Reused: `runCircuit`, `marginal`,
`mixtureN`, `densityOf`, `gf2Nullspace`, `syndromeOf`, `pauliString`, `pauliMul`.
**9.2 Stage.** **K1 (new SVG kind `code`, shared with Q22 and the Papers chapters).** It draws one small stabilizer code from the engine:
`code` names a registered code (`rep3`, `rep3x`, `shor9`, `steane7`, `five5`; Papers may register more), never authored coordinates. View
`'layout'`: data qubits as numbered discs at engine coordinates (a row; a 3 × 3 grid for Shor with groups as rows; Steane's three overlapping
circles; a pentagon), each check as a square ($X$-type and $Z$-type in two fixed hues) joined by edges to its support (a Tanner graph);
`error` (a Pauli string, one letter per qubit) writes letters on the hit discs; `show` adds `'syndrome'` (checks that anticommute with the
error light up, with the $\pm1$ pattern read out), `'correction'` (the lookup decoder's Pauli, or an authored `correction` validated to have the
same syndrome, drawn as outlined letters), `'residual'` (error × correction, read out as "a check", "logical X/Z/Y" or "identity" by the
engine) and `'logical'` (a minimum-weight logical operator's support, from `logicalOps`). View `'checks'`: the generators as a Pauli table
(rows, qubit columns, same per-letter colours as the matrix tableau) with the rank, $n$, $k$; `errors` lists up to 8 Pauli strings with their
syndromes in a side column. View `'words'` (Q22): $|\bar0\rangle$ or $|\bar1\rangle$ as its basis strings and amplitude sizes (≤ 16 strings).
Passport "CODE · qubits and checks"; note "not a place · discs are qubits, squares are checks; positions are a drawing choice". Fidelity: engine
syndromes (exact), layout (schematic), "a lit check is a −1 outcome, not a broken qubit" (misleading). Limits: n ≤ 25 drawn, ≤ 24 checks;
`'checks'` and `'words'` n ≤ 9. Print figure 320 × 300. **S2 (`amplitudes.keep`, additive):** accepts a wire list as well as a count
(marginal over the listed wires, labels by their bits), so helper wires below the data can be read (6 views). **S3 (`plot`, additive):** curves
`repFail3`, `repFail5`, `identityP` (y = p on [0, 1]), `qhbNeed1` (2(1 + 3n), n ∈ [1, 10]). **S4 (no field):** screenshot checks for classically
conditioned X columns, the Rx error label, 5 wires × 11 columns, a tableau with a 3-qubit circuit `state`. **Fallbacks:** K1 declined → `bits`
rows for the check patterns plus prose (Shor beats lose their picture: not recommended); S2 declined → whole-register bars with captions naming
the helper bits.
**9.3 Widgets:** none required; all seven Try-its are true on today's widgets (props read from code; the KL Try-it reads the cost mode's marker line).

## 10. Media (deferred, per BUILD-LOG)
Blender: Part IX opener (map): a 3 × 3 tile of Shor's nine qubits; check lamps light from `codeSyndrome(shor9, ·)` as single errors walk across;
engine JSON only. Film: `qc-q21-syndrome` "Finding the flipped qubit without looking" (manifest keys `q21Table91`, `q21SmallP11`, `q21BfRestored`).
Decor: ice crystals growing into a lattice; atmosphere only.

## 11. Hooks
**11.1 Concept stations:** `qc-repetition-station` (classical; needs `qc-f5-probability`, `qc-f7-gf2`) · `qc-bitflip-code-station` (needs `qc-cnot`,
`qc-ghz-parity`) · `qc-phaseflip-code-station` (needs `qc-bitflip-code-station`) · `qc-shor-code-station` · `qc-digitize-station` (needs
`qc-channel`) · `qc-kl-station` · `qc-dfs-station` (needs `qc-mixed-states`).
**11.2 Arcade (Spot the error, `Q21x`):** `qc-vote-always` ("more copies always help"; why `q21BreakEven`) · `qc-bf-both-one` (Bergou's "1 for both";
`q21Table91`) · `qc-bf-sees-z` ("the bit-flip code catches $Z_1$"; `q21Z1Syn`) · `qc-shor-group1` (`q21ShorZg`) · `qc-small-fix` ("a small error needs a
small correction"; `q21SmallP11`) · `qc-kl-identity` ("$C$ must be the identity"; `q21KlShorEig`) · `qc-dfs-independent` (`q21IndOff`).
**11.3 Bridges.** Out: `qc-f7-gf2` (classical:b3), `qc-l7-compatible` (bit-flip:b2), `qc-l3-postulates` (classical:b5), `qc-l6-mixture` (dfs:b1), and
NEW `qc-f5-probability` → F5 `f5-probability` ("chances over a list of outcomes"). Q4, Q6, Q8, Q13, Q22 named in words. In: Q6 q6-parities:b4 says
"Part IX" (fine); F7's "Chapter Q22" depends on Question 1.

## 12. Questions for the judge
1. Ids Q21/Q22 (brief) or Q21/Q22 (`outline.ts`, remap ruling 2, F7's text)? Recommend the outline's numbers; the rename is mechanical.
2. Keep Bergou §9.2 in the stabilizer chapter (map merge 3), against the brief's wording? Recommended: yes (CSS needs $H_XH_Z^T = 0$ in check language).
3. Approve K1 `code` (shared with Q22 and Papers), S2 (`keep` as a wire list) and S3 curves, built before the chapter.
4. Three Correction boxes E1–E3 (E1 and E3 new; all checked on the page images).
5. The quantum Hamming bound is taught from N&C's text, with P9.2 ⚑ only cited; P9.1, P9.3, P9.4 cited, never examples (the Z₁ test avoids P9.1's $Y$ set).
6. Running state 0.6|0⟩ + 0.8|1⟩ (real, distinct amplitudes) across the chapter; $R_x(60°)$ as the small error (ε = 0.5).
