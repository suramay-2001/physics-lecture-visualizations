# P-F8-story — F8 "Hidden rhythms" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q16-story.md`'s compact sections with the Foundations two-track
rules of `P-F6-story.md`; companion plan `P-F7-story.md` (same evidence script). Standing gates: ≥ 2 distinct derivation views
per track (W-709 #7); one notation beat per new notation (W-709 #8). Map row: `P-709-map.md` §1 F8, plus `qc709-nc.md` ruling 5
(continued fractions and the classical number theory of Shor live in F8; Q18 bridges to them). Rulings:
`decisions/qc709-foundations.md`, `qc709-foundations-rulings.md`.

**Sources read** (copyrighted; paraphrased, cited by printed page). N&C (printed = PDF − 28): App. 4 pp. 625–638 — remainders
$x = kn + r$ and mod-$n$ notation (Eq. A4.2, p. 626), the gcd as the least positive $ax + by$ (Thm A4.2, p. 626), inverses
exist iff coprime (Cor. A4.4, p. 627), $\gcd(a, b) = \gcd(b, r)$ and Euclid's algorithm (Thm A4.5, p. 628), Fermat and Euler's
count of units (pp. 630–631, Thm A4.9), the order and the reduction of factoring to order-finding (A4.3, pp. 633–635, Thm
A4.11), continued fractions and convergents (A4.4, pp. 635–638, Thms A4.14–A4.16); §5.1 p. 217 (the DFT, Eq. 5.1, sign $+$;
Ex. 5.1 ⚑ unitarity, Ex. 5.2), p. 218 (binary fractions $0.j_l\ldots j_m$, the product form Eq. 5.4); §5.3.1 pp. 226–229
($t = 2L + 1 + \ldots$ bits, continued fractions on the estimate). Bergou (Ch. 7 printed = PDF − 10): §7.5 p. 127 (binary
expansion, Eqs. 7.34–7.35), p. 128 (Eqs. 7.38–7.41: the geometric sum, $|1 - e^{i\theta}| = 2\sin(\theta/2)$, Jordan's bounds),
p. 129 (Eq. 7.42; $P \ge 4/\pi^2 \approx 0.4$); P3.3 p. 60 (⚑, mod-$N$ Bell states, cited only). Axler (printed = PDF − 14): 4.8
p. 123 (a degree-$m$ polynomial has at most $m$ zeros), p. 125 (de Moivre; every number has $k$th roots). No 709 notes or homework touch F8.

**Ownership.** F8 is the canonical owner of: residues and congruence mod $N$, periods, gcd/Euclid, inverses, the order, the
roots of unity and their sums, the DFT as a matrix ($F^\dagger F = I$, combs → spikes, shift → phase), geometric sums and the
$2/\pi$ peak bound, binary fractions and continued fractions. **Not here:** the QFT circuit, its product form (N&C Eq. 5.4)
and phase estimation (Q18 owns them and bridges here); $e^{i\varphi}$, phasors and interference (F1, bridged); the bit dot
product and the Walsh sum as a bit fact (F7, bridged; F8 shows it is the $N = 2$ case). F1's clue "the roots sum to 0"
(`rootsOfUnity`, F1 phase unit) gets one link-back beat (roots:b2), not a second full treatment.

**Evidence.** `scratchpad/planF78-numpy.py` (numpy + plain Python, independent of the app): DFT matrices checked against
`np.fft.ifft(…, norm='ortho')` (N&C's sign), combs transformed exactly, Dirichlet sums sampled on a 2001-point window, Euclid
and continued fractions by integer arithmetic, orders by enumeration. 199 values across F7/F8, 0 failed asserts.

**Conventions.** $\omega = \omega_N = e^{2\pi i/N}$ (Rosetta at roots:b1 F: Chapter Q8's $\hbar\omega$ is an energy; Chapter
Q11 writes $j \oplus m$ for $j + m \bmod N$, which is XOR only at $N = 2$). DFT sign $+$: $(F_N)_{kj} = \omega^{jk}/\sqrt N$ =
N&C Eq. 5.1 = Bergou Eq. 7.34's $U_F$ = numpy's `ifft` times $\sqrt N$ (numpy's `fft` has $-$). List in $c_j$, out $\hat c_k$;
geometric index $t$, ratio $u$; binary digits $d_l$. Running examples: $N = 21$, $x = 2$ (order 6; $21 = 3 \times 7$); the
32-input comb `COMB32` = terms `'00000+00110+01100+10010+11000+11110'` (where $2^x \equiv 1$); $N = 8$ combs `ket('++0')`
(step 2), `ket('+00')` (step 4), `ket('++1')` (shifted), terms `'000+011+110'` (step 3). Claim keys `f8…`; twins
`pipeline/claims_qc709/f8.py`. Phase tags [L] `'core'`, [B] `'books'`, [C] clue. Cross-references "Unit F8.3", "Chapter Q18".

**Stage shorthand.** `cp(f)` = `{kind:'complex-plane', ...f}` with `CLOCK(N)` = `powers:{of:{r:1, phiDeg:360/N}, upTo:N−1}`,
`SPK(vals, N)` = `spokes:{phasesDeg: vals.map(v ⇒ 360v/N)}` (vals from `modPow`), `CHAIN(N, j, M = N)` = `chain:{phasesDeg:
[360jt/N mod 360, t < M]}` · `amp(S, f)` (S2 adds `dft: true`) · `mx({dft:N}, f)` (S2) · `plot('dirichlet8', f)` (S3) · `split(a / b)`.

## 0. Chapter map
**Driving question:** "How can a sum of spinning arrows reveal a hidden rhythm?"

| # | id | Title (≤ 8 words) | Question | Sources | Bridges out |
|---|---|---|---|---|---|
| 1 | `f8-clock` | Clock arithmetic and repeating patterns | What does it mean for a list to repeat? | N&C pp. 626, 633 | `qc-f7-xor` |
| 2 | `f8-euclid` | Common factors, inverses and the order | When can a clock divide, and how long is a cycle? | N&C pp. 626–635 | — |
| 3 | `f8-roots` | Roots of unity: arrows that cancel | Why do evenly spread arrows add to nothing? | Axler pp. 123, 125; N&C p. 217 | `qc-f1-euler`, `qc-f1-phase` |
| 4 | `f8-dft` | The Fourier transform finds the rhythm | How does one transform turn a repeat into spikes? | N&C p. 217 | `qc-f4-unitary`, `qc-f2-inner-product` |
| 5 | `f8-geometric` | Near misses: geometric sums and peaks | How much of a peak survives when the rhythm does not fit? | Bergou pp. 128–129 | — |
| 6 | `f8-fractions` | From a peak back to the period | How do we read the period off a peak's position? | N&C pp. 218, 226–229, 635–638 | `qc-f1-multiply` |

**Outcomes:** compute mod $N$ and spot a period; run Euclid, find an inverse and an order, and see why the order factors
21; draw the $N$th roots and prove they sum to 0; build $F_N$, show it is unitary, and predict a comb's spikes and phases;
bound a near-miss peak by $2/\pi$; expand a binary fraction and recover a period with continued fractions. **Prerequisites:**
F1 `qc-euler`, `qc-phase`, `qc-complex-multiply`; F4 `qc-f4-unitary`; F7 `qc-f7-xor`. Ground ramp: clocks, polygon angles
$360°/N$, F1's arrows, the $S - uS$ trick. **Openers:** the Part F Blender opener ("the ring and the helix", `rootsOfUnity`) is
media-deferred; if made, it opens `f8-roots`.

## 1. Story beats (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds per unit: clock `complex-plane`, `amplitudes` · euclid `complex-plane` · roots `complex-plane` · dft
`matrix`, `amplitudes` · geometric `complex-plane`, `plot` · fractions `complex-plane`, `amplitudes`.

### Unit `f8-clock` — Clock arithmetic and repeating patterns
**b1 [L] · notation, `introduces: ['qc-congruence']`**
- G: "On a 12-hour clock, 9 o'clock plus 5 hours is 2 o'clock. That is arithmetic mod 12: keep the remainder after dividing by 12. We write $14 \equiv 2 \pmod{12}$, a [[qc-congruence|congruence]]."
- F: "$a \equiv b \pmod N$ iff $N$ divides $a - b$; $a \bmod N$ is the remainder of $a$, in $\{0, \ldots, N-1\}$ (N&C Eq. A4.2, p. 626). Sums and products pass to remainders, so $\mathbb Z_N = \{0, \ldots, N-1\}$ is a clock; XOR is the case $N = 2$ (<<qc-f7-xor|Unit F7.3>>)."
- Cap G "12 marks; $9 + 5$ lands on 2" · F "$\mathbb Z_{12}$ as 12 marks; 2 at $60°$" · Stage `cp({...CLOCK(12), z:{r:1, phiDeg:60}})` · Claims `f8Clock9p5` 2 (`mod(9 + 5, 12)`).

**b2 [L] · notation, `introduces: ['qc-period']`**
- G: "A list $f(x)$ has [[qc-period|period]] $r$ if every value comes back $r$ steps later: $f(x + r) = f(x)$. The powers of 2, kept mod 21, run 1, 2, 4, 8, 16, 11, then 1 again: period 6."
- F: "$f$ has period $r$ if $f(x + r) = f(x)$ for every whole $x$, with $r > 0$ least. $f(x) = 2^x \bmod 21$ runs $1, 2, 4, 8, 16, 11, 1, \ldots$: $r = 6$ (the order of 2 mod 21; N&C A4.3, p. 633)."
- Cap G "$2^x \bmod 21$: six marks of 21, then it repeats" · F "$f(x) = 2^x \bmod 21$, $r = 6$" · Stage `cp({...SPK([1,2,4,8,16,11], 21)})` · Claims `f8Pow2mod21` [1,2,4,8,16,11,1], `f8Order2mod21` 6 (`modPow`, `multOrder`).

**b3 [L]** (a hidden spacing)
- G: "Mark the inputs from 0 to 31 where $2^x \bmod 21 = 1$: 0, 6, 12, 18, 24 and 30. They are evenly spaced, 6 apart. This chapter turns such a spacing into a reading."
- F: "The level set $\{x < 32 : 2^x \equiv 1\}$ is the comb $\{0, 6, \ldots, 30\}$, step $r$. Chapter Q18 prepares exactly such a comb of amplitudes; Units F8.4 to F8.6 read $r$ off it."
- Cap G/F "32 inputs, six marked, 6 apart; chance $1/6$ each" · Stage `amp({terms:COMB32}, {mode:'probability'})` · Claims `f8Comb32` [0,6,12,18,24,30], `f8CombChance` 0.1667.

**b4 [C]** (a period skips whole cycles)
- Q G: "What is $2^{100} \bmod 21$? Must you multiply 100 times?" · Q F: "Use the period to evaluate $2^{100} \bmod 21$."
- Reveal G: "No. The pattern repeats every 6, and $100 = 16 \times 6 + 4$, so $2^{100}$ matches $2^4 = 16$. A period lets you skip whole cycles." · Reveal F: "$2^{100} = (2^6)^{16}\,2^4 \equiv 2^4 = 16$, since $2^6 \equiv 1$; the exponent only matters mod $r$."
- Cap G/F "the mark of $2^{100}$: the same as $2^4 = 16$" · Stage q `cp({...SPK([1,2,4,8,16,11], 21)})`; reveal `cp({...SPK([16], 21)})` · Claims `f8Pow2_100` 16, `f8Hundred_mod6` 4.

### Unit `f8-euclid` — Common factors, inverses and the order
**b1 [L] · notation, `introduces: ['qc-gcd']`** (D1)
- G: "The [[qc-gcd|greatest common divisor]] $\gcd(a, b)$ is the largest number dividing both. Euclid's shortcut swaps the pair for the smaller number and the remainder: $\gcd(84, 36) = \gcd(36, 12) = 12$."
- F: "$\gcd(a, b) = \gcd(b, a \bmod b)$ (N&C Thm A4.5, p. 628); iterate until the remainder is 0 (Euclid's algorithm). $84 = 2 \cdot 36 + 12$, $36 = 3 \cdot 12$: $\gcd = 12 = 1 \cdot 84 - 2 \cdot 36$, the least positive $ax + by$ (Thm A4.2, p. 626)."
- Cap G "84 on a 36-mark clock lands on 12" · F "$\gcd(84, 36) = \gcd(36, 12) = 12$" · Stage `cp({...CLOCK(36), z:{r:1, phiDeg:120}})` · Claims `f8Gcd84_36` 12, `f8Euclid84_36` steps, `f8Bezout84_36` (1, −2), `f8Clock36Of84` 12 (`gcd`, `euclidSteps`, `egcd`) · D1.

**b2 [L] · notation, `introduces: ['qc-modular-inverse']`**
- G: "Dividing on a clock means finding an [[qc-modular-inverse|inverse]]: a $b$ with $ab \equiv 1$. Mod 21, $2 \times 11 = 22 \equiv 1$, so 11 undoes doubling. But 3 has no inverse, because 3 divides 21."
- F: "$a^{-1} \bmod N$ exists iff $\gcd(a, N) = 1$ (N&C Cor. A4.4, p. 627); Euclid run backwards finds it. $2^{-1} \equiv 11$ and $4^{-1} \equiv 16 \pmod{21}$; $\gcd(3, 21) = 3$, so 3 has none."
- Cap G/F "21 marks: 2, 11 and $2 \times 11 \equiv 1$" · Stage `cp({...SPK([2, 11, 1], 21)})` · Claims `f8Inv2mod21` 11, `f8Inv4mod21` 16, `f8Gcd3_21` 3 (`modInverse`).

**b3 [L] · notation, `introduces: ['qc-multiplicative-order']`**
- G: "On a clock of $N$ marks, multiply by $x$ again and again until you reach 1. The number of steps is the [[qc-multiplicative-order|order]] of $x$. Doubling mod 21 needs 6 steps: the period of Unit F8.1."
- F: "For $\gcd(x, N) = 1$ the order $r$ is the least $r > 0$ with $x^r \equiv 1 \pmod N$ (N&C A4.3, p. 633), the period of $a \mapsto x^a \bmod N$. $r$ divides the number of residues coprime to $N$, 12 for $N = 21$ (Thm A4.9, p. 631; Ex. A4.16 ⚑): $\mathrm{ord}(2) = \mathrm{ord}(5) = 6$."
- Cap G/F "the order of 2 mod 21 is 6" · Stage `cp({...SPK([1,2,4,8,16,11], 21)})` · Claims `f8Order2mod21` 6, `f8Order5mod21` 6, `f8Units21` 12, `f8OrderDividesUnits` true.

**b4 [B]** (the order cracks 21)
- G: "Knowing the order splits 21. The order 6 is even, so take $2^3 = 8$. Then $8^2 - 1 = 63 = 7 \times 9$ is a multiple of 21, and $\gcd(7, 21) = 7$, $\gcd(9, 21) = 3$ are its factors."
- F: "If $r$ is even and $x^{r/2} \not\equiv -1$, then $N$ divides $(x^{r/2} - 1)(x^{r/2} + 1)$ but neither factor, so $\gcd(x^{r/2} \pm 1, N)$ are proper factors (N&C Thm A4.11, p. 633; pp. 634–635). $2^3 = 8$: $21 = 7 \times 3$. Finding $r$ fast is Chapter Q18's step."
- Cap G/F "the six powers of 2 mod 21; the arrow marks $2^3 = 8$" · Stage `cp({...SPK([1,2,4,8,16,11], 21), z:{r:1, phiDeg:360*8/21}})` · Claims `f8HalfPow` 8, `f8EightSqMinus1` 63, `f8FacA` 7, `f8FacB` 3.

**b5 [C]** (not every number has an order)
- Q G: "Keep multiplying 3 by itself mod 21. Do you ever get back to 1?" · Q F: "Does 3 have an order mod 21?"
- Reveal G: "Never. The powers run 3, 9, 6, 18, 12, 15, then 3 again, without 1. Each is a multiple of 3, and 1 is not. Only numbers sharing no factor with 21 have an order." · Reveal F: "No: $\gcd(3, 21) = 3$, so $3^k \equiv 1$ would make 3 divide 1. The powers repeat with period 6 but never reach 1; orders exist exactly on the residues coprime to $N$ (N&C p. 633)."
- Cap G/F "powers of 3 mod 21: six marks, none at 1" · Stage q `cp({...CLOCK(21)})`; reveal `cp({...SPK([3,9,6,18,12,15], 21)})` · Claims `f8Pow3mod21` [3,9,6,18,12,15,3], `f8Order3mod21` null (`multOrder`).

### Unit `f8-roots` — Roots of unity: arrows that cancel
**b1 [L] · notation, `introduces: ['qc-root-of-unity']`** (D2)
- G: "Which arrows of length 1 come back to 1 after $N$ equal turns? Turn by $360°/N$ each time (<<qc-f1-euler|Unit F1.4>>). The $N$ stops are the $N$th [[qc-root-of-unity|roots of unity]], corners of a regular $N$-gon."
- F: "$\omega = e^{2\pi i/N}$ has $\omega^N = 1$, and $\omega^k$, $k = 0, \ldots, N-1$, are all $N$ roots of $z^N = 1$, a regular $N$-gon (de Moivre, Axler p. 125; at most $N$ roots, Axler 4.8, p. 123; D2). $N = 5$: $\omega = 0.309 + 0.951i$, $72°$ apart. Rosetta: Q8's $\hbar\omega$ is an energy."
- Cap G "$N = 5$: five arrows $72°$ apart" · F "$\omega_5 = e^{2\pi i/5} = 0.309 + 0.951i$" · Stage `cp({powers:{of:{r:1, phiDeg:72}, upTo:4}})` · Claims `f8Omega5` (0.309, 0.9511), `f8Omega5pow5` 1, `f8Angle5` 72 (`rootsOfUnity`) · D2.

**b2 [L]** (they add to nothing; D3)
- G: "Chapter F1 added two opposite arrows and got 0 (<<qc-f1-phase|Unit F1.5>>). The same works for any $N$: laid tip to tail, the $N$ roots close into the $N$-gon. Turning the whole set by $\omega$ only relabels it."
- F: "$S = \sum_{k=0}^{N-1}\omega^k = 0$ for $N \ge 2$: multiplying by $\omega$ permutes the roots, so $\omega S = S$, and $\omega \ne 1$ (D3). $N = 2$ is $1 + (-1) = 0$, F1's cancelling pair."
- Cap G/F "$N = 5$: tip to tail they close; sum 0" · Stage `cp({...CHAIN(5, 1)})` · Claims `f8RootSum5` 0, `f8RootSum2` 0 (`phasorSum`) · D3.

**b3 [L]** (stepping $j$ corners at a time; D4)
- G: "Now step $j$ corners at a time and add $\omega^{jk}$ for $k = 0$ to $N - 1$. If $j$ is a multiple of $N$, every arrow points at 1 and the sum is $N$. Otherwise they still cancel."
- F: "$\sum_{k=0}^{N-1}\omega^{jk} = N$ if $N \mid j$, else 0 (D4: $z = \omega^j$ obeys $zS = S$). $N = 8$: $j = 2, 3$ give 0; $j = 8$ gives 8. Unit F7.3's $\sum_x(-1)^{a\cdot x}$ is this sum at $N = 2$, one bit at a time."
- Cap G "$N = 8$, $j = 3$: an eight-point star that closes" · F "$\sum_k\omega^{3k} = 0$ for $N = 8$" · Stage `cp({...CHAIN(8, 3)})` · Claims `f8PowSum8_j3` 0, `f8PowSum8_j2` 0, `f8PowSum8_j8` 8 · D4.

**b4 [C]** (skipping evenly keeps the balance)
- Q G: "Add the twelve 12th roots. Now add only every third one, $1, \omega^3, \omega^6, \omega^9$. And the first three alone. Which sums are 0?" · Q F: "For $N = 12$, evaluate $\sum_{k<12}\omega^k$, $\sum_{k<4}\omega^{3k}$ and $|1 + \omega + \omega^2|$."
- Reveal G: "The first two. Every third 12th root is a 4th root, $1, i, -1, -i$, and those cancel too. Three neighbours do not: their sum has length $2.732$. Only an even spread cancels." · Reveal F: "$\sum_{k<12}\omega^k = 0$; $\omega^3 = i$, so $\sum_{k<4}i^k = 0$; $|1 + \omega + \omega^2| = 2.7321$. Cancellation needs a full period of a root of unity."
- Cap G/F "every third 12th root: 1, $i$, −1, $-i$; sum 0" · Stage q `cp({...CHAIN(12, 1)})`; reveal `cp({...CHAIN(12, 3, 4)})` · Claims `f8RootSum12` 0, `f8Every3rd12` 0, `f8First3of12` 2.7321.

### Unit `f8-dft` — The Fourier transform finds the rhythm
**b1 [L] · notation, `introduces: ['qc-dft']`**
- G: "The [[qc-dft|discrete Fourier transform]] turns a list $c_0, \ldots, c_{N-1}$ into a new list $\hat c_0, \ldots, \hat c_{N-1}$. Entry $k$ adds every $c_j$ times the arrow $\omega^{jk}$, then divides by $\sqrt N$. It asks: does the list repeat in step with $\omega^k$?"
- F: "$\hat c_k = \frac1{\sqrt N}\sum_{j=0}^{N-1}c_j\,\omega^{jk}$, i.e. $(F_N)_{kj} = \omega^{jk}/\sqrt N$ (N&C Eq. 5.1, p. 217; Bergou's $U_F$, Eq. 7.34). Sign $+$, as for the QFT; numpy's `fft` uses $-$. $(F_8)_{11} = 0.25 + 0.25i$, $(F_8)_{00} = 0.3536$."
- Cap G "$F_8$ as an $8 \times 8$ grid; entry $(k, j)$'s colour is the turn $45jk°$" · F "$(F_N)_{kj} = \omega^{jk}/\sqrt N$" · Stage `mx({dft:8}, {values:'none', labels:'indices'})` · Claims `f8DftEntry11` (0.25, 0.25), `f8DftEntry00` 0.3536 (`dftMatrix`).

**b2 [L]** (nothing is lost; D5)
- G: "Can the transform be undone? Yes. The overlap of two different columns (<<qc-f2-inner-product|Unit F2.2>>) is a Unit F8.3 arrow sum, which cancels. So the columns are perpendicular unit vectors, and $F$ is unitary (<<qc-f4-unitary|Unit F4.4>>)."
- F: "$(F^\dagger F)_{jl} = \frac1N\sum_k\omega^{k(l - j)} = \delta_{jl}$ by D4, so $F_N$ is unitary (D5; N&C Ex. 5.1 ⚑, p. 217) and $F^{-1} = F^\dagger$ has $\omega^{-jk}$."
- Cap G/F "$F_8^\dagger F_8 = I$" · Stage `split(mx({dft:8}, {values:'none'}) / mx({product:[{adjoint:{dft:8}}, {dft:8}]}, {values:'exact'}))` · Claims `f8DftUnitary` 0 (max entry gap < 1e-12) · D5.

**b3 [L]** (a comb becomes spikes; D6)
- G: "Feed in a comb: equal values at every second place of eight, 0, 2, 4 and 6. Out come two spikes, at 0 and 4, each $0.7071$. Spacing $r$ in gives spikes $N/r$ apart out."
- F: "For $c_j = \sqrt{r/N}$ on $j \equiv 0 \pmod r$, $r \mid N$: $\hat c_k = 1/\sqrt r$ when $N/r$ divides $k$, else 0 (D6, from D4). $N = 8$: $r = 2$ gives $0.7071$ at $k = 0, 4$; $r = 4$ gives $0.5$ at $k = 0, 2, 4, 6$."
- Cap G/F "step 2 in 8: spikes at 0 and 4" · Stage `split(amp({ket:'++0'}) / amp({ket:'++0'}, {dft:true}))` · Claims `f8Comb2Peaks` {0: 0.7071, 4: 0.7071}, `f8Comb4Peaks` 0.5 × 4 (`dft`, `comb`) · D6.

**b4 [L]** (a shift becomes a phase)
- G: "Slide the comb one place, to 1, 3, 5 and 7. The spikes stay at 0 and 4, the same size. Only their arrows turn: the spike at 4 now points the other way, $-0.7071$."
- F: "Shifting $c_j \to c_{j-s}$ multiplies $\hat c_k$ by $\omega^{sk}$: sizes unchanged. Comb $\{1, 3, 5, 7\}$: $\hat c_0 = 0.7071$, $\hat c_4 = \omega^4 \cdot 0.7071 = -0.7071$. Reading $|\hat c_k|^2$ ignores where the comb starts."
- Cap G/F "shifted comb: same spikes; the one at 4 flips sign" · Stage `amp({ket:'++1'}, {dft:true})` · Claims `f8Comb2ShiftPeaks` {0: 0.7071, 4: −0.7071}, `f8ShiftSameSizes` true.

**b5 [C]** (a spacing that does not fit)
- Q G: "Now a comb with step 3 in a list of 8: places 0, 3 and 6. Three does not divide 8. Do clean spikes still appear?" · Q F: "What does $F_8$ do to a comb of step $r = 3 \nmid 8$?"
- Reveal G: "Not clean ones. The tallest bars sit at 0, 3 and 5, near the multiples 0, 2.67 and 5.33 of $8/3$, with chances $0.375$, $0.243$, $0.243$. The rest leaks into small bars." · Reveal F: "$|\hat c_k|^2$ peaks near $k \approx 8m/3$: $0.375$ at 0, $0.2429$ at 3 and 5, the rest leaks. When $r \nmid N$ peaks blur; Unit F8.5 bounds what survives."
- Cap G/F "step 3 in 8: peaks at 0, 3, 5 and small leaks" · Stage q `amp({terms:'000+011+110'})`; reveal `amp({terms:'000+011+110'}, {dft:true, mode:'probability'})` · Claims `f8Comb3Probs` [0.375, 0.0071, 0.0417, 0.2429, 0.0417, 0.2429, 0.0417, 0.0071], `f8NoverR8_3` [2.67, 5.33] ($8m/3$).

### Unit `f8-geometric` — Near misses: geometric sums and peaks
**b1 [L] · introduces nothing** · Terms `qc-geometric-series`
- G: "A [[qc-geometric-series|geometric sum]] adds $1 + u + u^2 + \cdots + u^{M-1}$, each term $u$ times the last. Multiply by $u$ and subtract: nearly everything cancels, leaving $(1 - u^M)/(1 - u)$. With $u = \tfrac12$, $M = 4$: $1.875$."
- F: "$\sum_{t=0}^{M-1}u^t = \frac{1 - u^M}{1 - u}$ for $u \ne 1$ (the $S - uS$ trick). With $u = e^{i\theta}$ it is Unit F8.3's chain turned by $\theta$ per step (Bergou Eq. 7.39, p. 128)."
- Cap G/F "$1 + \tfrac12 + \tfrac14 + \tfrac18 = 1.875$" · Stage `cp({chain:{phasesDeg:[0,0,0,0], sizes:[1,0.5,0.25,0.125]}})` · Claims `f8Geom_half_4` 1.875, `f8GeomClosed` 1.875 (`geometricSum`).

**b2 [L]** (the chord)
- G: "The gap from 1 to the arrow $e^{i\theta}$ is a chord of the circle, of length $2\sin(\theta/2)$. It is 1 at $60°$, where the triangle is equilateral, and $1.414$ at $90°$."
- F: "$|1 - e^{i\theta}| = 2|\sin(\theta/2)|$ (Bergou Eq. 7.40, p. 128). With $\tfrac2\pi\beta \le \sin\beta \le \beta$ on $[0, \tfrac\pi2]$: $\tfrac{2|\theta|}{\pi} \le |1 - e^{i\theta}| \le |\theta|$ for $|\theta| \le \pi$ (Eq. 7.41); at $\theta = 1$: $0.6366 \le 0.9589 \le 1$."
- Cap G/F "$1 + e^{i240°} = 1 - e^{i60°}$: length 1" · Stage `cp({chain:{phasesDeg:[0,240]}})` · Claims `f8Chain240` 1, `f8Chord60` 1, `f8Chord90` 1.4142, `f8Chord1rad` 0.9589, `f8TwoOverPi` 0.6366.

**b3 [L]** (a near miss keeps $2/\pi$; D7)
- G: "Add $M = 8$ arrows, each turned $\delta$ of a full turn more than the last. At $\delta = 1/8$ the chain closes. If $\delta$ is at most half that, $1/16$, it curls but keeps at least $2/\pi \approx 0.637$ of its straight length."
- F: "$\big|\frac1M\sum_{t<M}e^{2\pi i\delta t}\big| = \frac{|\sin\pi M\delta|}{M|\sin\pi\delta|} \ge \frac2\pi$ for $|\delta| \le \frac1{2M}$ (D7; Bergou Eqs. 7.39–7.42, pp. 128–129). $M = 8$, $\delta = \tfrac1{16}$: $0.6407$, squared $0.4105 \ge 4/\pi^2 = 0.4053$."
- Cap G/F "8 arrows, $22.5°$ apart: $0.6407$ of the straight length" · Stage `cp({chain:{phasesDeg:[0,22.5,45,67.5,90,112.5,135,157.5]}})` · Claims `f8Dir8_1_16` 0.6407, `f8WorstChance8` 0.4105, `f8FourOverPi2` 0.4053, `f8MinOnWindow8` 0.6407 · D7.

**b4 [B]** (the shape of a peak)
- G: "Plot that length against $\delta$. It is 1 at 0, $0.64$ at half a step, and 0 at a full step, $\delta = 1/8$, where the chain closes. Fourier peaks have this shape."
- F: "$D_M(\delta) = |\sin\pi M\delta|/(M|\sin\pi\delta|)$: 1 at 0, $0.6407$ at $\tfrac1{2M}$, 0 at $\pm\tfrac1M$. A comb of $A$ teeth has $|\hat c_k| = \sqrt{A/N}\,D_A(rk/N)$, which is why Unit F8.4's step-3 bars blur."
- Cap G/F "the peak shape for 8 arrows: 1, then 0.64, then 0" · Stage `plot('dirichlet8', {x:{from:-0.25,to:0.25}, markers:[{x:0},{x:0.0625},{x:0.125}], yLines:[{y:0.6366, label:'2/π'}]})` · Claims `f8Dir8_0` 1, `f8Dir8_0.0625` 0.6407, `f8Dir8_0.125` 0, `f8CombAsDirichlet` true.

**b5 [C]** (do more arrows help?)
- Q G: "With 64 arrows instead of 8, is the worst case at half a step better or worse?" · Q F: "How does $D_M(\tfrac1{2M})$ behave as $M$ grows?"
- Reveal G: "Almost the same: $0.6367$, just above $2/\pi$. More arrows make the peak narrower, since it reaches 0 at $\delta = 1/M$. The worst case settles at $2/\pi$." · Reveal F: "$D_{64}(\tfrac1{128}) = 0.63668 \to 2/\pi = 0.63662$ from above: the bound is sharp as $M \to \infty$, while the peak's width shrinks as $1/M$."
- Cap G/F "8 arrows: $0.6407$ at half a step, just above the $2/\pi$ line that 64 arrows nearly reach" · Stage q `cp({chain: 8 × 22.5°})`; reveal `plot('dirichlet8', {x:{from:-0.125,to:0.125}, markers:[{x:0.0625}], yLines:[{y:0.6366, label:'2/π'}]})` · Claims `f8Dir64half` 0.6367, `f8TwoOverPi5` 0.63662, `f8Dir8_0.0625` 0.6407.

### Unit `f8-fractions` — From a peak back to the period
**b1 [L] · notation, `introduces: ['qc-binary-fraction']`**
- G: "A [[qc-binary-fraction|binary fraction]] writes a number below 1 in halves, quarters and eighths: $0.101$ means $\tfrac12 + 0 + \tfrac18 = 0.625$. As a turn, $0.625$ of a circle is $225°$."
- F: "$0.d_1d_2\ldots d_m = \sum_{l=1}^m d_l2^{-l}$ (N&C p. 218; Bergou p. 127 writes an $m$-bit integer over $2^m$). $0.101 = 0.625$, and $e^{2\pi i \cdot 0.101}$ points at $225°$."
- Cap G/F "$0.101 = 0.625$: a turn of $225°$" · Stage `cp({z:{r:1, phiDeg:225}, show:['arg']})` · Claims `f8Bin101` 0.625, `f8Angle101` 225 (`binaryFraction`).

**b2 [L]** (doubling shifts the digits; D8)
- G: "Doubling shifts the digits left: $2 \times 0.101 = 1.01$. A whole turn changes nothing, so the arrow lands at $0.01$ of a turn, $90°$. Squaring the arrow doubles its angle (<<qc-f1-multiply|Unit F1.3>>)."
- F: "$e^{2\pi i\,2^j(0.d_1d_2\ldots)} = e^{2\pi i\,0.d_{j+1}d_{j+2}\ldots}$: $2^j$ moves $j$ digits into the integer part, a whole number of turns (D8). Chapter Q18's phase estimation uses this digit by digit. $z = e^{2\pi i\cdot0.101}$: $z^2$ at $90°$."
- Cap G/F "$z \cdot z$: $225° + 225° = 450° \equiv 90°$" · Stage `cp({z:{r:1,phiDeg:225}, w:{r:1,phiDeg:225}, show:['product','arc']})` · Claims `f8Bin101x2frac` 0.25, `f8Angle101x2` 90 · D8.

**b3 [L] · notation, `introduces: ['qc-continued-fraction']`** · Terms `qc-convergent`
- G: "A [[qc-continued-fraction|continued fraction]] rewrites a fraction using whole numbers only: $5/32 = 1/(6 + 1/(2 + 1/2))$. Stopping early gives simpler fractions, its [[qc-convergent|convergents]]: $1/6$, then $2/13$, then $5/32$."
- F: "$p/q = [a_0; a_1, \ldots, a_n]$, the $a_l$ being Euclid's quotients for $(p, q)$ (N&C A4.4, pp. 635–636); convergents obey $p_l = a_lp_{l-1} + p_{l-2}$, $q_l = a_lq_{l-1} + q_{l-2}$ (Thm A4.15, p. 637). $5/32 = [0; 6, 2, 2]$: $1/6, 2/13, 5/32$."
- Cap G "the step-6 comb's transform: tall bars at 0, 5, 11, 16, 21, 27" · F "$\hat c$ of `COMB32`; $5/32 = [0; 6, 2, 2]$" · Stage `amp({terms:COMB32}, {dft:true, mode:'probability'})` · Claims `f8Cf5_32` ([0,6,2,2], 1/6, 2/13, 5/32), `f8Comb6Top` [0,5,11,16,21,27] (`continuedFraction`, `convergents`).

**b4 [L]** (the period recovered)
- G: "The transform of Unit F8.1's comb (step 6, 32 inputs) has a tall bar at 5. Read it as $5/32$. Its first convergent is $1/6$, and $2^6 \equiv 1 \pmod{21}$ checks out: the hidden period is 6."
- F: "If an index $y$ of a $2^m$-point transform has $|y/2^m - k/r| \le 1/(2r^2)$ for a whole $k$, then $k/r$ is a convergent of $y/2^m$ (N&C Thm A4.16, p. 637): $|5/32 - 1/6| = 0.0104 \le 1/72 = 0.0139$. Test each denominator $q < 21$: $q = 6$ passes ($2^6 \equiv 1$), $q = 13$ fails ($2^{13} \equiv 2$)."
- Cap G/F "bar 5 → $5/32$ → $1/6$ → period 6" · Stage `split(amp({terms:COMB32}) / amp({terms:COMB32}, {dft:true, mode:'probability'}))` · Claims `f8Gap5` 0.0104, `f8HalfQsq6` 0.0139, `f8Pow2_13mod21` 2, `f8Pick` (5 → 6).

**b5 [C]** (unlucky bars)
- Q G: "The bar at 11 is as tall as the bar at 5. What period does $11/32$ suggest?" · Q F: "Which bars of the step-6 comb's transform return $r = 6$ through the convergent test?"
- Reveal G: "Only 3: $11/32$ sits near $1/3$, which is $2/6$ in lowest terms. The 2 and the 6 shared a factor, so a divisor came out. Bars 5 and 27 give 6, with total chance $0.234$; repeat the run." · Reveal F: "$11/32 \to 1/3$ ($k = 2$ shares a factor with $r$); $16 \to 1/2$; $21 \to 2/3$; only $y \in \{5, 27\}$ ($k = 1, 5$) give $r = 6$, total $0.2336$. With $2^m \ge N^2$ and a few repeats the method is reliable (N&C pp. 227–229)."
- Cap G/F "only bars 5 and 27 give 6: chance $0.2336$" · Stage q `amp({terms:COMB32}, {dft:true, mode:'probability'})`; reveal the same (caption names the bars) · Claims `f8Cf11_32` ([0,2,1,10], 1/3), `f8Cf16_32` (1/2), `f8Cf21_32` (2/3), `f8SuccessSet` [5, 27], `f8SuccessP` 0.2336.

**Count:** 4 + 5 + 4 + 5 + 5 + 5 = **28 beats**, 6 clues. Order within each unit L → B → C.

## 2. Derivations (step `tex` — why — **view**; a step without a view keeps the last one; Ground ≥ Formal; ≥ 2 views each)
**D1 · euclid:b1 · $\gcd(84, 36) = 12$** — G (3): (1) any common divisor of 84 and 36 also divides $84 - 2 \cdot 36 = 12$ · **`cp({...CLOCK(36), z:{r:1,phiDeg:120}})`** · *84 on 36 marks: 12* (2) and the reverse, so $\gcd(84, 36) = \gcd(36, 12)$ (3) $36 = 3 \cdot 12$ exactly: $\gcd = 12$ · **`cp({...CLOCK(12), z:{r:1,phiDeg:0}})`** · *36 on 12 marks: 0*. F (2): (1) Thm A4.5 · **36-mark view** (2) halts at remainder 0; back-substitute: $12 = 84 - 2\cdot36$ · **12-mark view**. Check `f8Gcd84_36`.
**D2 · roots:b1 · $\omega^N = 1$; the $\omega^k$ are all the roots** — G (3): (1) $\omega$ turns $360°/N$ · **`cp({powers:{of:{r:1,phiDeg:72},upTo:1}})`** (2) $N$ turns make $360°$: $\omega^N = 1$ (3) the $N$ stops are different, and no other arrow works · **`cp({powers:{…72…},upTo:4}})`**. F (2): (1) $(\omega^k)^N = (\omega^N)^k = 1$ · **upTo 4, $N = 5$** (2) $z^N - 1$ has at most $N$ roots (Axler 4.8), all found · **`cp({powers:{of:{r:1,phiDeg:45},upTo:7}})`**. Check `f8Omega5pow5`.
**D3 · roots:b2 · $\sum_k\omega^k = 0$** — G (4): (1) $S$ = the chain · **`cp({...CHAIN(5,1)})`** (2) times $\omega$: each arrow moves one corner on · **`cp({spokes:{phasesDeg:[72,144,216,288,0]}})`** · *the same five arrows* (3) so $\omega S = S$ (4) $(\omega - 1)S = 0$ and $\omega \ne 1$: $S = 0$ · **chain**. F (2): (1) $\omega S = S$ · **spokes** (2) $\omega \ne 1 \Rightarrow S = 0$ · **chain**. Check `f8RootSum5`.
**D4 · roots:b3 · $\sum_k\omega^{jk} = N[N \mid j]$** — G (3): (1) put $z = \omega^j$ · **`cp({...CHAIN(8,3)})`** (2) $N \mid j$: $z = 1$, eight arrows in a row, sum 8 · **`cp({...CHAIN(8,8)})`** (3) else $z \ne 1$, $z^N = 1$: D3's argument gives 0 · **star**. F (2): (1) $S = (z^N - 1)/(z - 1) = 0$ for $z \ne 1$ · **star** (2) $z = 1 \Leftrightarrow N \mid j$: $S = N$ · **line of 8**. Check `f8PowSum8_*`.
**D5 · dft:b2 · $F_N^\dagger F_N = I$** (N&C Ex. 5.1 ⚑) — G (3): (1) entry $(j, l)$ compares columns $j$ and $l$ · **`mx({dft:8},{values:'none'})`** (2) it is $\frac1N\sum_k\omega^{k(l-j)}$ (3) D4: 1 if $j = l$, else 0 · **`mx({product:[{adjoint:{dft:8}},{dft:8}]},{values:'exact'})`**. F (2): (1) the sum · **$F_8$** (2) $= \delta_{jl}$ · **$F^\dagger F$**. Check `f8DftUnitary`.
**D6 · dft:b3 · comb of step $r \mid N$ → spikes $1/\sqrt r$ every $N/r$** — G (3): (1) the comb · **`amp({ket:'++0'})`** (2) $\hat c_k$ adds four arrows $\omega^{2tk}$: 4th roots raised to $k$ (3) they cancel unless 4 divides $k$: spikes at 0, 4 · **`amp({ket:'++0'},{dft:true})`**. F (2): (1) $\hat c_k = \frac{\sqrt r}{N}\sum_{t<N/r}(\omega^{rk})^t$ · **comb** (2) D4 with $N/r$ · **transform**. Check `f8Comb2Peaks`.
**D7 · geometric:b3 · $D_M(\delta) \ge 2/\pi$ for $|\delta| \le \frac1{2M}$** — G (4): (1) $M$ arrows, each $\delta$ further · **`cp({chain: 8 × 22.5°})`** (2) the sum's length is $|\sin\pi M\delta| / |\sin\pi\delta|$ (b1 and b2 combined) (3) top $\ge 2M\delta$, bottom $\le \pi\delta$ (the chord bounds) · **`plot('dirichlet8',{markers:[{x:0.0625}]})`** (4) ratio $\ge 2M/\pi$; divide by $M$. F (2): (1) closed form via Eqs. 7.39–7.40 · **chain** (2) Jordan's inequality at $\pi M|\delta| \le \pi/2$ · **plot**. Check `f8MinOnWindow8`.
**D8 · fractions:b2 · doubling drops the leading digit** — G (3): (1) $0.101 = \tfrac12 + \tfrac18$ · **`cp({z:{r:1,phiDeg:225}, show:['arg']})`** (2) $\times 2$: $1 + \tfrac14 = 1.01$ (3) a whole turn is $e^{2\pi i} = 1$: $0.01$ of a turn, $90°$ · **`cp({z, w:{r:1,phiDeg:225}, show:['product','arc']})`**. F (2): (1) $2^j \cdot 0.d_1d_2\ldots = d_1\ldots d_j.d_{j+1}\ldots$ · **z** (2) $e^{2\pi i n} = 1$ for whole $n$ · **product**. Check `f8Angle101x2`.

## 3. Try-it widgets (props read from `widgets/ComplexPlane.tsx` and `ComplexPlaneQc.tsx`)
| Unit | Spec | Try this |
|---|---|---|
| clock | `complex-plane {mode:'powers-of-i'}` | Press "Multiply by i" seven times: the readout shows $i^7 = -i$, the same as $i^3$, since $7 \equiv 3 \pmod 4$. One more press: $i^8 = 1$. Period 4. |
| euclid | `complex-plane {mode:'powers-of-i'}` | Count presses until the readout is 1 again: 4. The order of $i$ is 4, as the order of 2 mod 21 is 6. |
| roots | `complex-plane {mode:'phasor', phases:[0,120,240]}` | The three cube roots close a triangle: size 0. Set arrow 3 to $0°$: size $1.732$. Set all three to $0°$: size 3. |
| dft | `complex-plane {mode:'phasor', phases:[0,120,240]}` | These are $\omega_3^{k}$: entry 1 of the transform of $(1, 1, 1)$, times $\sqrt3$; size 0. Set $0°, 240°, 120°$ (entry 2): 0 again. Set all to $0°$ (entry 0): 3. |
| geometric | `complex-plane {mode:'phasor', phases:[0,20,40]}` | Each arrow $20°$ further: size $2.879$ of 3. Set $0°, 60°, 120°$: size 2. Set $0°, 120°, 240°$: the chain closes, size 0. |
| fractions | `complex-plane {mode:'multiply', z:[-0.7071,-0.7071], w:[-0.7071,-0.7071]}` | $z = w$ at $φ = -135°$, which is $225°$, a $0.101$ turn. The product reads $φ = 90°$: doubling $0.101$ gives $1.01$, and the whole turn drops. |
Phasor sliders step $5°$, so every angle above is reachable; readouts show the chain's size (`complexReadouts`). W2 (§9.3) would replace the two `powers-of-i` stand-ins.

## 4. Challenges (tol 0.005 unless stated; integers tol 0; no sheet assigns F8; ⚑ items cited only)
- **clock** 1 warm-up numeric `f8-c-mod` $17 \bmod 12$ → **5**. 2 core numeric `f8-c-period` period of $2^x \bmod 21$ → **6**. 3 stretch numeric `f8-c-big` $2^{100} \bmod 21$ → **16**.
- **euclid** 1 warm-up numeric `f8-e-gcd` $\gcd(84, 36)$ → **12**. 2 core numeric `f8-e-inv` $4^{-1} \bmod 21$ → **16**. 3 core numeric `f8-e-factor` $\gcd(2^3 + 1, 21)$ → **3**.
- **roots** 1 warm-up numeric `f8-r-angle` degrees between neighbouring 12th roots → **30**. 2 core numeric `f8-r-star` $|\sum_{k<8}\omega_8^{3k}|$ → **0**. 3 core numeric `f8-r-full` $\sum_{k<8}\omega_8^{8k}$ → **8**.
- **dft** 1 warm-up numeric `f8-d-entry` $(F_8)_{00}$ → **0.354**. 2 core numeric `f8-d-spike` size of each spike for step 4 in 8 → **0.5**. 3 stretch numeric `f8-d-shift` $\hat c_4$ of the comb $\{1, 3, 5, 7\}$ → **−0.707**.
- **geometric** 1 warm-up numeric `f8-g-sum` $1 + \tfrac12 + \tfrac14 + \tfrac18$ → **1.875**. 2 core numeric `f8-g-chord` $|1 - e^{i\pi/2}|$ → **1.414**. 3 core numeric `f8-g-worst` $D_8(\tfrac1{16})$ → **0.641**.
- **fractions** 1 warm-up numeric `f8-f-bin` $0.101$ in decimal → **0.625**. 2 core numeric `f8-f-cf` denominator of the first nonzero convergent of $5/32$ → **6**. 3 stretch numeric `f8-f-11` denominator suggested by $11/32$ → **3**.

## 5. Glossary (all new; checked against every F1–F7, Q1–Q17 glossary and Q15/Q16 in their worktrees)
| id | term | introduces | Ground | Formal | first |
|---|---|---|---|---|---|
| `qc-congruence` | congruence mod $N$ | notation | Two whole numbers with the same remainder after dividing by $N$. | $a \equiv b \pmod N \Leftrightarrow N \mid a - b$. | clock:b1 |
| `qc-period` | period | notation | The step after which a list repeats itself exactly. | Least $r > 0$ with $f(x + r) = f(x)$. | clock:b2 |
| `qc-gcd` | greatest common divisor | notation | The largest whole number dividing both of two numbers. | $\gcd(a, b)$; least positive $ax + by$. | euclid:b1 |
| `qc-modular-inverse` | inverse mod $N$ | notation | The number that undoes multiplying by $a$ on an $N$-mark clock. | $aa^{-1} \equiv 1$; exists iff $\gcd(a, N) = 1$. | euclid:b2 |
| `qc-multiplicative-order` | order mod $N$ | notation | How many times you multiply by $x$, mod $N$, to get back to 1. | Least $r > 0$ with $x^r \equiv 1 \pmod N$. | euclid:b3 |
| `qc-root-of-unity` | root of unity | notation | An arrow of length 1 that returns to 1 after $N$ equal turns. | $\omega^k$, $\omega = e^{2\pi i/N}$, roots of $z^N = 1$. | roots:b1 |
| `qc-dft` | discrete Fourier transform | notation | A table of arrows that turns a list into its rhythms. | $(F_N)_{kj} = \omega^{jk}/\sqrt N$, unitary. | dft:b1 |
| `qc-geometric-series` | geometric sum | — | A sum where each term is a fixed multiple of the one before. | $\sum_{t<M}u^t = (1 - u^M)/(1 - u)$. | geometric:b1 |
| `qc-binary-fraction` | binary fraction | notation | A number below 1 written in halves, quarters, eighths. | $0.d_1d_2\ldots = \sum_l d_l2^{-l}$. | fractions:b1 |
| `qc-continued-fraction` | continued fraction | notation | A fraction rewritten as whole numbers nested in one-over steps. | $[a_0; a_1, \ldots, a_n]$ (N&C A4.4). | fractions:b3 |
| `qc-convergent` | convergent | — | The simpler fraction you get by stopping a continued fraction early. | $p_l/q_l = [a_0; \ldots, a_l]$. | fractions:b3 |
F1's ideas ($e^{i\varphi}$, phasors, interference) and F4's unitarity are reached by bridges (§11.3), not relinked as terms.

## 6. Review cards
- **clock** G: mod $N$ keeps remainders; a period repeats; exponents only matter mod the period. F: $\mathbb Z_N$, $f(x + r) = f(x)$. Eq $a \equiv b \pmod N$. Trap: $-3 \bmod 12 = -3$ (it is 9).
- **euclid** G: Euclid swaps for remainders; inverses need no shared factor; the order is the cycle length and can split $N$. F: Thms A4.2, A4.5, A4.11. Eq $\gcd(a, b) = \gcd(b, a \bmod b)$. Trap: expecting every $x$ to have an order.
- **roots** G: $N$ equal turns; evenly spread arrows cancel. F: $\sum_k\omega^{jk} = N[N \mid j]$. Eq $\omega^N = 1$. Trap: thinking any $N$ unit arrows cancel.
- **dft** G: the transform sums arrows; a comb gives spikes $N/r$ apart; a shift only turns them. F: $F_N$ unitary, shift → phase. Eq $(F_N)_{kj} = \omega^{jk}/\sqrt N$. Trap: numpy's `fft` sign.
- **geometric** G: $S - uS$; the chord; a near miss keeps $2/\pi$. F: $D_M(\delta) \ge 2/\pi$. Eq $|1 - e^{i\theta}| = 2|\sin\tfrac\theta2|$. Trap: expecting more arrows to raise the worst case.
- **fractions** G: binary digits; doubling drops a digit; convergents recover the period. F: Thm A4.16. Eq $|y/2^m - k/r| \le 1/(2r^2)$. Trap: trusting a convergent without checking $x^q \equiv 1$.

## 7. Symbol-before-use
**7.1 Ground:** $\equiv$, mod clock:b1 · $f(x)$, $r$ clock:b2 · $\gcd$, $a, b$ euclid:b1 · $x$, $N$ (order) euclid:b3 · $\omega$, $N$ roots:b1 · $j, k$ roots:b3 · $c_j, \hat c_k, \sqrt N$ dft:b1 · $u, M$ geometric:b1 · $\theta$ geometric:b2 · $\delta$ geometric:b3 · $0.d_1d_2$ fractions:b1 · convergents fractions:b3. **7.2 Formal:** adds $\mathbb Z_N$ clock:b1 · $a^{-1}$ euclid:b2 · $\mathrm{ord}$ euclid:b3 · $F_N$ dft:b1 · $F^\dagger$, $\delta_{jl}$ dft:b2 · $s$ (shift) dft:b4 · $D_M$ geometric:b4 · $[a_0; \ldots]$, $p_l/q_l$ fractions:b3 · $y, m, k$ in Thm A4.16 fractions:b4. Counts: 0 used before definition in either track.

## 8. Errata
**For Q18 (found here; page image of Bergou p. 127 checked):** Eqs. 7.34–7.35 print the prefactor $1/2^m$; unitarity needs
$2^{-m/2}$ (Eq. 7.36 has it). The same page expands $a = 2^{m-1}a_1 + 2^{m-1}a_2 + \ldots$; the second power should be $2^{m-2}$.
F8 shows neither equation; its own binary-fraction beat uses the correct expansion. Q18 rules on a Correction box. Note: N&C's
"ϕ(n)" (Euler's count) is spelled out in words at euclid:b3 to keep $\varphi$ for phases.

## 9. Engine, stage and widget needs
**9.1 Engine** (new `physics/qc/numtheory.ts` + `physics/qc/fourier.ts`; numpy block "f8"): `mod(a, N)` (non-negative) · `gcd`
· `euclidSteps(a, b)` · `egcd(a, b)` → $\{g, x, y\}$ · `modInverse(a, N)` → number | null · `modPow(x, e, N)` · `multOrder(x, N)`
→ number | null · `factorFromOrder(x, r, N)` · `unitsCount(N)` · `dftMatrix(N)` (sign $+$) · `dft(vec)` · `comb(N, r, s)` ·
`geometricSum(u, M)` (complex $u$) · `dirichlet(M, δ)` · `binaryFraction(bits)` · `continuedFraction(p, q)` · `convergents(cf)`
· `orderFromPeak(y, m, x, N)` (the convergent test). Reused: `rootsOfUnity`, `phasorSum`, `phasorPath`, `superpose`, `expi`.
**9.2 Stage.** **S2 (additive):** `AmplitudesState.dft?: true` — draw the state's DFT ($F_N$ applied by the resolver, any
source, ≤ 5 qubits; not with `inBasis` or `sum`; `'signed'` only if the result is real), readout "Fourier view"; and
`MatrixSource` `{dft: N}` ($N \le 16$; usable inside `product`/`adjoint`). Serves Q18's QFT pictures. **S3 `plot` names:**
`'dirichlet8'` ($D_8(\delta)$, default x $[-0.5, 0.5]$). `complex-plane`: every field used exists (`powers`, `spokes`, `chain`,
`z`, `w`, marks); first use of `powers` + `z` together and of a 12-arrow star needs a screenshot check (BUILD-LOG rule).
**9.3 Widget W2 (optional):** `complex-plane` mode `'roots'` `{N: 2–12, j}` in `ComplexPlaneQc` (draws `CHAIN(N, j)`), to
replace the euclid/clock stand-ins and give dft a true $N$-point picture. Stand-ins above are true today.

## 10. Media (deferred, per BUILD-LOG)
Film `qc-f8-cancel` "Spinning arrows cancel except on the rhythm" (map): a comb's arrows for each $k$ of $F_8$, closing
except at $k = 0, 4$ (manifest `f8Comb2Peaks`, `f8PowSum8_j*`). Part F Blender opener "the ring and the helix" placed
before `f8-roots` if made. Decor: none new.

## 11. Hooks
**11.1 Concept stations:** `qc-f8-clock` "Clock arithmetic and periods" (needs `qc-f7-xor`) · `qc-f8-euclid` "gcd, inverses
and the order" (needs `qc-f8-clock`) · `qc-f8-roots` "Roots of unity and their sums" (needs `qc-euler`, `qc-phase`; links
448 `complex-numbers`) · `qc-f8-dft` "The discrete Fourier transform" (needs `qc-f8-roots`, `qc-f4-unitary`) · `qc-f8-geometric`
"Geometric sums and peak shapes" (needs `qc-f8-roots`) · `qc-f8-fractions` "Binary and continued fractions" (needs
`qc-f8-euclid`, `qc-f8-dft`).
**11.2 Arcade (Spot the error; `F8x` labels):** `qc-negative-mod` ("$-3 \bmod 12 = -3$"; why 9) · `qc-every-order` ("3 has an
order mod 21"; why `f8Order3mod21` null) · `qc-any-arrows-cancel` ("any three unit arrows add to 0"; why `f8Phasor0_120_0`
1.7321) · `qc-numpy-sign` ("$F_N$ is numpy's `fft` divided by $\sqrt N$"; why the sign) · `qc-more-arrows` ("64 arrows keep
more than 8 at half a step"; why 0.6367 vs 0.6407) · `qc-first-convergent` ("$11/32$'s convergent $1/3$ gives $r = 3$"; why
$2^3 \equiv 8$).
**11.3 Bridges.** Out (F8 → target): NEW `qc-f7-xor` → F7 `f7-xor` (clock:b1 F; roots:b3 in words "Unit F7.3" until F7 merges) ·
NEW `qc-f1-euler` → F1 `f1-euler` (roots:b1 G) · `qc-f1-phase` (exists) roots:b2 G · NEW `qc-f4-unitary` → F4 `f4-unitary` (dft:b2 G; shared with F7) · `qc-f2-inner-product` (exists) dft:b2 G · NEW `qc-f1-multiply` → F1 `f1-multiply`
(fractions:b2 G). In (NEW ids, wiring pass): `qc-f8-clock` ← q11-qudit:b1 (F, "$j \oplus m$" is $j + m \bmod N$), Q18 period
finding · `qc-f8-roots` ← q11-qudit:b1 (F, the orthonormal $e^{2\pi ijn/N}$ states), q16-hadamard-n:b3 (F) · `qc-f8-euclid`,
`qc-f8-dft`, `qc-f8-geometric`, `qc-f8-fractions` ← Q18 (order, QFT, the $4/\pi^2$ bound, convergents; when planned). Q8 and
Q12 have no $e^{2\pi i/N}$ phases (searched); Q11 is the existing site.

## Rulings requested
- R1 Six units (the map's five plus `f8-euclid`, carrying App. 4's gcd, inverses and order per the brief and `qc709-nc.md` R5) — confirm.
- R2 Approve S2 (`amplitudes.dft`, `MatrixSource {dft}`) and S3 (`'dirichlet8'`) inside the F8 build; both also serve Q18.
- R3 The running Shor-style example $N = 21$, $x = 2$, $r = 6$ with a 32-input comb (drawable), stating in F that real runs use $2^m \ge N^2$ — accept the small-$m$ honesty note?
- R4 Euler's count of units appears once, in words (no $\varphi(N)$, which collides with phase $\varphi$); Fermat's theorem is not taught.
- R5 The QFT product form (N&C Eq. 5.4) and phase estimation stay in Q18; F8 stops at "doubling drops a digit".
- R6 Bergou Eq. 7.34–7.35 prefactor and p. 127's expansion: hand to the Q18 plan as Correction candidates (F8 shows neither).
- R7 W2 `complex-plane` mode `'roots'`: build now, or keep the true `powers-of-i` / phasor stand-ins?
- R8 N&C Ex. 5.1 (DFT unitarity) is derived in full (no sheet assigns it), marked "N&C ⚑"; Bergou P3.3 cited only.
