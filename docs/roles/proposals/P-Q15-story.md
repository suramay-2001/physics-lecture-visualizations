# P-Q15-story — Q15 "Secret keys from quantum rules" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q14-story.md` (the 13 sections of `skills/03-chapter-plan`),
compacted to one line per field. Standing gates: every derivation list steps the stage through ≥ 2 distinct views in
both tracks (W-709 #7); every new notation gets exactly one notation beat (W-709 #8). Map row: `P-709-map.md` §7 (drafted
there as "Q13"; `outline.ts` now numbers it Q15, Part VI). **Phase `'books'`:** no 709 notes cover Ch. 6, so ramp beats
are `[B]`, clues `[C]`; re-align when notes arrive.

**Sources read** (paraphrased, never quoted). Bergou Ch. 6 (printed = PDF − 11): §6.1 outline p. 105; §6.2 one-time pad
p. 106; §6.3 B92 pp. 107–108; §6.4 BB84 and the entangling attack pp. 108–110 (Eqs. 6.1–6.5); §6.5 E91 and device
independence pp. 110–111 (Eqs. 6.6–6.7); §6.6 secret sharing pp. 112–113 (Eqs. 6.8–6.9); §6.7 P6.1–P6.4 pp. 113–114 (all
⚑). Page renders checked for pp. 111 (Eq. 6.6). N&C (printed = PDF − 28): §12.6.1 Vernam cipher pp. 582–583; BB84 p. 587;
B92 (Eq. 12.188) p. 589; the EPR protocol p. 591.

**Ownership.** 448 L8 owns the one-time pad on bits (`l8-key`), BB84 with photons (`l8-bb84`), intercept–resend Q = ¼
(`l8-attack`) and the test sample (`l8-test`): Q15 links back with the new bridges `qc-l8-key/-bb84/-attack/-test` and never
re-derives ¼. Q14 owns USD and Helstrom for |0⟩, |+⟩ (Q15 reuses its numbers as attacks). Q13 owns no-cloning, Q10 CHSH
and 2√2, Q6 the singlet, Q4 XOR/CNOT. **Q15 owns:** the Caesar-to-pad framing and key distribution, B92 with its two Eve
attacks, the entangling attack "no error ⇒ no information", E91 and device independence, secret sharing.

**Evidence.** `plan709q-q15.py` + `plan709q-extra.py` (scratchpad): every value below twice — route A dense matrices and
exact branch sums over every POVM outcome (no sampling), route B the closed forms. 43 paired checks, **0 mismatches**, plus structural ones (decoding on all four sharing branches; 200 random no-error probes leave no $x$-error).

**Conventions.** Bit 0 ↔ |ψ₀⟩ = |0⟩, bit 1 ↔ |ψ₁⟩ = |+⟩ (Bergou §6.3). Bob's USD elements `E₀` (fires only on |0⟩, ∝ |−⟩⟨−|)
and `E₁` (only on |+⟩, ∝ |1⟩⟨1|), so a click of Eᵢ means bit i (Q14's Bergou convention, review item 2). Q is the raw/sifted
key error rate (448's symbol). Secret-sharing running angle θ = 22.5° (cos 2θ = 1/√2: Eve faces B92's overlap). All math in
`$…$`; cross-references read "Unit 15.2", "Chapter Q14", never ids. Claim keys `q15…`; twins `pipeline/claims_qc709/q15.py`.

**Stage shorthand.** `circ(C,k)` = `{kind:'circuit', circuit:C, upTo:k}` · `amp(C,k,m)` = `{kind:'amplitudes',
state:{circuit:C, upTo:k}, mode:m}` (`amp({bell:'Psi-'})` takes any `AmpSource`) · `ball(P,f)` = `{kind:'bloch-ball', point:P, shot:'B-STD', ...f}` · `mx(src)` =
`{kind:'matrix', source:src, values:'decimal'}` · `tq(src,f)` = `{kind:'two-qubit', source:{ket:src}, labels:'A-B',
arrows:'reduced', grid:'T', ...f}` · `led(f)` = `{kind:'bb84', ...f}` · `split(a / b)`. Helstrom axis `HAX = {thetaDeg:45,
phiDeg:180}` (Γ's eigen-axis; Q14 review item 1). Q10's CHSH settings `NC_A = ['+x','+z']`, `NC_B = [{135,180},{45,180}]`.

**Circuits** (all gates named; angles computed in code). `C_PAD` wires key k, message m, init `11`: CNOT k→m, CNOT k→m.
`C_REUSE` wires k, m₁, m₂, init `110`: CNOT k→m₁, CNOT k→m₂, CNOT m₁→m₂ (wire 3 ends as c₁ ⊕ c₂). `C_COPY` init `+0`:
CNOT. `C_B92(a)` wires "Alice's bit", "qubit sent", init `a0`: H on wire 2 controlled by wire 1. `C_PROBE(φ)` wires
"Alice's qubit", "Eve's probe", init `+0`: Ry(φ) on wire 2 controlled by wire 1 (φ ∈ {0°, 90°, 180°}). `C_SX` init `00`:
columns [H₁], [CNOT], [X₂, Z₁] (the singlet), [H₁, H₂] (four columns). `C_SHARE(a)` wires Bob, Charlie, init `00`: Ry(45°)₁, CNOT, then Z₁ if a = 1.
`C_SPLIT` wires k, r, s, init `110`: CNOT k→s, CNOT r→s, CNOT r→s.

## 0. Chapter map
**Driving question:** "How can two people share a secret key and know for certain that nobody listened?"

| # | id | Title (≤ 8 words) | Question | Sources | Bridges / link-backs |
|---|---|---|---|---|---|
| 1 | `q15-otp` | A key used once hides anything | Why is the key the whole problem? | Bergou §6.1–6.2 pp. 105–106; N&C pp. 582–583 | `qc-l8-key`; Q4 XOR, Q13 no-cloning |
| 2 | `q15-b92` | Two look-alike states carry a key | Can two non-orthogonal states share a key? | Bergou §6.3 pp. 107–108; N&C p. 589 | Q14 USD, Helstrom |
| 3 | `q15-bb84` | BB84: no error means no information | What can a cleverer Eve learn unseen? | Bergou §6.4 pp. 108–110; N&C p. 587 | `qc-l8-bb84`, `qc-l8-attack`, `qc-l8-test` |
| 4 | `q15-e91` | Entanglement as the key's source | Can a Bell test certify the key? | Bergou §6.5 pp. 110–111; N&C p. 591 | Q6 singlet, Q10 CHSH |
| 5 | `q15-sharing` | Splitting a secret between two people | Can a key need two people to open? | Bergou §6.6 pp. 112–113 | Q14 USD, `qc-xor` |

**Outcomes:** encrypt and decrypt with a one-time pad and say why reuse fails · run B92 and compute Bob's kept share
1 − 1/√2 · compare an unambiguous and a minimum-error eavesdropper (Q = 0.3536 vs 0.1464) · show that an entangling Eve who
causes no error learns nothing · explain why E91's Bell test guards the key and what device independence means · split a
bit with XOR and with the cos θ|00⟩ ± sin θ|11⟩ code. **Prerequisites:** `qc-usd`, `qc-helstrom`, `qc-chsh-station`,
`qc-bell-violation`, `qc-no-cloning-station`, `qc-cnot`, `qc-entanglement`; 448 `key-distribution`, `bb84`, `intercept-resend`.
**Openers:** the Part VI Blender opener (map §7, photons from a seeded BB84 run) opens Unit 15.1; deferred (§10).

## 1. Story beats per unit
Kinds per unit: otp circuit, amplitudes · b92 circuit, amplitudes, bloch-ball, matrix · bb84 bb84, circuit, two-qubit ·
e91 two-qubit, amplitudes · sharing circuit, amplitudes, two-qubit, bloch-ball.

### Unit `q15-otp` — A key used once hides anything
**b1 [B]** (Caesar and the key) · Terms `qc-cipher`, `qc-secret-key`
- G: "A cipher swaps letters for other letters. Caesar moved each letter three places on, so Caesar became Fdhvdu. The shift is the key."
- F: "A substitution cipher maps letters to letters (Bergou §6.2). Caesar's shift by three sends 'Caesar' to 'Fdhvdu'; the shift is the key, and one fixed shift falls to anyone who tries them all."
- Cap: G/F "the key wire and the message wire, before they meet" · Stage `circ(C_PAD, 0)` · Claims `q15Caesar` (`caesar('Caesar',3)` = 'Fdhvdu'; the shift 3 is the input).

**b2 [B]** (the one-time pad; D1) · Terms `qc-one-time-pad` (bridge `qc-l8-key`)
- G: "Use a fresh random shift for every letter, never again. For bits, add the key bit with XOR: $c = m \oplus k$. Adding $k$ again returns $m$. This is the one-time pad (<<qc-l8-key|Spin Lab 8.5>>)."
- F: "With a random key as long as the message, used once, the cipher is unbreakable: the one-time pad. On bits $c = m \oplus k$ and $c \oplus k = m$ (<<qc-l8-key|Spin Lab 8.5>>). The algorithm is public; only the key is secret."
- Cap: G "a CNOT from the key adds $k$ to $m$; a second CNOT takes it off" · F "CNOT = XOR on basis states: $|k, m\rangle \to |k, m \oplus k\rangle$" · Stage `split(circ(C_PAD,1) / amp(C_PAD,1,'probability'))` · Claims `q15PadCipher` (basis state after column 1 = |10⟩, c = 0), `q15PadBack` (|11⟩ after column 2) · Derivation D1.

**b3 [B]** (distributing the key) · Terms `qc-key-distribution`, `qc-no-cloning` (Q13)
- G: "The pad moves the problem to key distribution. Couriers can be robbed, and a classical key copied unseen. A CNOT copies 0 or 1 perfectly, but not $|+\rangle$."
- F: "Key distribution is the hard part. A classical bit is cloned silently; a quantum state is not (Chapter Q13). CNOT copies $|0\rangle, |1\rangle$ but sends $|{+}\rangle|0\rangle$ to a Bell state, overlap $0.5$ with $|{+}{+}\rangle$."
- Cap: G "copying $|+\rangle$ gives an entangled pair, not two copies" · F "CNOT$|{+}0\rangle = |\Phi^+\rangle$, $|\langle{+}{+}|\Phi^+\rangle|^2 = 0.5$" · Stage `split(circ(C_COPY,1) / amp(C_COPY,1,'amplitude'))` · Claims `q15CopyOverlap` (0.5).

**b4 [C]** (why "one-time")
- Q G: "Alice pads two messages with the same key. What can Eve learn from the two ciphertexts alone?" · Q F: "Two messages share one pad: $c_1 = m_1 \oplus k$, $c_2 = m_2 \oplus k$. What does $c_1 \oplus c_2$ reveal?"
- Reveal G: "The key cancels: $c_1 \oplus c_2 = m_1 \oplus m_2$. Eve learns how the messages differ, with no key at all." · Reveal F: "$c_1 \oplus c_2 = m_1 \oplus m_2$, because $k \oplus k = 0$; the pad's secrecy needs every key bit used once."
- Cap: G/F "the third wire ends as $c_1 \oplus c_2 = m_1 \oplus m_2$" · Stage q `circ(C_REUSE,0)`; reveal `split(circ(C_REUSE,3) / amp(C_REUSE,3,'probability'))` · Claims `q15ReuseLeak` (wire 3 = 1 = m₁ ⊕ m₂).

### Unit `q15-b92` — Two look-alike states carry a key
**b1 [B]** (the encoding) · Terms `qc-qkd`, `qc-b92`
- G: "Bennett's B92 scheme sends bit 0 as $|0\rangle$ and bit 1 as $|+\rangle$. The two states overlap: $|\langle0|+\rangle| = 0.7071$. No reading tells them apart every time."
- F: "B92 (Bergou §6.3) encodes bit $a$ as $|\psi_0\rangle = |0\rangle$ or $|\psi_1\rangle = |+\rangle$, overlap $0.7071$. Non-orthogonal states admit no perfect discrimination (Chapter Q14), which is the protocol's protection."
- Cap: G "Alice's bit picks the state: 1 gives $|+\rangle$" · F "controlled-H: $|a\rangle|0\rangle \to |a\rangle|\psi_a\rangle$" · Stage `split(circ(C_B92(1),1) / amp(C_B92(1),1,'amplitude'))` · Claims `q15Overlap` (0.7071).

**b2 [B] · notation beat, `introduces: ['qc-qber']`** (Bob's never-wrong reading; the raw key) · Terms `qc-raw-key`, `qc-qber` (bridge `qc-l8-attack`)
- G: "Bob reads each qubit with Unit 14.4's never-wrong measurement. He gets an answer $0.2929$ of the time. He announces which rounds worked, not the answers. Those bits are the raw key; its error rate is $Q$."
- F: "Bob applies optimal USD: success $1 - |\langle\psi_0|\psi_1\rangle| = 0.2929$, inconclusive $0.7071$. Kept conclusive rounds form the raw key. $Q$ is the fraction of raw-key bits on which Alice and Bob disagree; here $Q = 0$."
- Cap: G "the detector only $|0\rangle$ can fire points along $|-\rangle$, at right angles to $|+\rangle$" · F "$E_0 \propto |{-}\rangle\langle{-}|$, so $E_0|\psi_1\rangle = 0$" · Stage `split(ball('+z',{compare:'+x'}) / mx({outer:[{ket:'-'}]}))` · Claims `q15B92Kept` (0.2929), `q15B92Inconcl` (0.7071), `q15B92Q0` (0).

**b3 [B]** (Eve copies Bob's method; D2)
- G: "Eve reads with the same never-wrong method. She fails $0.7071$ of the time and must guess what to resend. Half those guesses are wrong, so Bob's raw key has $Q = 0.3536$."
- F: "An unambiguous Eve fails with probability $|\langle\psi_0|\psi_1\rangle| = 0.7071$ and resends a random state. Bob's conclusive results identify what he received, so $Q = \tfrac12 \cdot 0.7071 = 0.3536$ (Bergou prints 35.3%; errata box)."
- Cap: G/F "Eve's failures become Bob's errors: $Q = 0.3536$" · Stage `ball('+z',{compare:'+x'})` · Claims `q15EveUsdFail` (0.7071), `q15QUsdEve` (0.3536) · Derivation D2.

**b4 [B]** (the minimum-error Eve; D3)
- G: "A smarter Eve always guesses, with Helstrom's best split. She is wrong only $0.1464$ of the time, and right $0.8536$. Bob's error rate drops to $Q = 0.1464$."
- F: "A minimum-error Eve measures along $\Gamma$'s eigen-axis (Unit 14.5): error $\tfrac12(1 - 1/\sqrt2) = 0.1464$. Each wrong resend becomes a wrong raw-key bit, so $Q = 0.1464$, and Eve holds $0.8536$ of the kept bits."
- Cap: G/F "Eve's best split: right $0.8536$ for either state" · Stage `ball('+z',{compare:'+x', measure:HAX})` · Claims `q15QMinEve` (0.1464), `q15EveMinRight` (0.8536) · Derivation D3.

**b5 [C]** (which Eve to fear)
- Q G: "One Eve causes $Q = 0.3536$, the other $0.1464$. Which should Alice and Bob design their test against?" · Q F: "Rank the two attacks by the error rate they leave and the key fraction they reveal."
- Reveal G: "The quieter one. The minimum-error Eve makes fewer errors and knows more. Their test must flag an error rate near $0.1464$, against real channel noise." · Reveal F: "The minimum-error attack dominates: lower $Q$ (0.1464) and more information (0.8536). The check must resolve $Q$ near $0.1464$ above the channel's own noise (Bergou p. 108)."
- Cap: G/F "both of Eve's options; the quieter one sets the bar" · Stage q `ball('+z',{compare:'+x'})`; reveal `split(ball('+z',{compare:'+x', measure:HAX}) / mx({lin:[{c:'+1/2',src:{rho:{ket:{ket:'+'}}}},{c:'-1/2',src:{rho:{ket:{ket:'0'}}}}]}, spectrum:'bars'))` · Claims `q15QMinEve`, `q15QUsdEve` (reused).

### Unit `q15-bb84` — BB84: no error means no information
**b1 [B]** (BB84 in qubit letters) · Terms `qc-bb84` (bridge `qc-l8-bb84`)
- G: "BB84 uses two bases: $z$ with $|0\rangle, |1\rangle$ and $x$ with $|\pm x\rangle$. <<qc-l8-bb84|Spin Lab sent them as photons>>: H/V and D/A. Matching bases are kept."
- F: "Alice sends a random bit in a random basis, $z$ or $x$; Bob measures in a random basis; they keep matching-basis rounds (Bergou §6.4; <<qc-l8-bb84|Spin Lab 8.6>>). The ledger writes $z$ as H/V and $x$ as D/A."
- Cap: G/F "a seeded run; matching-basis rounds kept, the rest dimmed" · Stage `led({rounds:{seed:84,count:16}, sift:true, readouts:['kept']})` · Claims none (the kept count is the kind's own engine readout).

**b2 [B]** (intercept–resend, linked not re-derived) · Terms `qc-intercept-resend` (bridge `qc-l8-attack`)
- G: "If Eve measures every photon in a random basis and resends it, the sifted key has $Q = 0.25$. <<qc-l8-attack|Spin Lab works this out step by step>>."
- F: "Intercept–resend gives $Q = \tfrac12 \cdot \tfrac12 = 0.25$ on the sifted key (<<qc-l8-attack|Spin Lab 8.7>>); a test sample of $m$ bits misses her with chance $(3/4)^m$ (<<qc-l8-test|Spin Lab 8.8>>)."
- Cap: G "a seeded run, Eve on every photon: $\hat Q$ against the exact 0.25" · F "$\hat Q$ ± 1σ of a seeded run vs exact $Q$" · Stage `led({rounds:{seed:84,count:1000}, eve:'all', sift:true, readouts:['qber','eve-knows']})` · Claims `q15BridgeQ` (`bb84Q()` = 0.25), `q15SeedNearQ` (|Q̂ − Q| ≤ 3σ).

**b3 [B]** (an entangling Eve) · Terms `qc-ancilla` (Q14)
- G: "A subtler Eve touches each qubit with a small probe, an ancilla of her own. Their joint state is $|0\rangle|\varphi_{00}\rangle + |1\rangle|\varphi_{01}\rangle$ for input $|0\rangle$."
- F: "Eve appends an ancilla $|0\rangle_e$ and applies $U$: $U|0\rangle|0\rangle = |0\rangle|\varphi_{00}\rangle + |1\rangle|\varphi_{01}\rangle$, $U|1\rangle|0\rangle = |0\rangle|\varphi_{10}\rangle + |1\rangle|\varphi_{11}\rangle$ (Eq. 6.1); unitarity imposes Eq. 6.2."
- Cap: G/F "Eve's probe: a rotation of her ancilla, controlled by Alice's qubit" · Stage `circ(C_PROBE(90°),1)`.

**b4 [B]** (no error ⇒ no information; D4) · Terms `qc-information-disturbance`
- G: "Ask for no errors in either basis. Then $|\varphi_{01}\rangle = |\varphi_{10}\rangle = 0$ and $|\varphi_{00}\rangle = |\varphi_{11}\rangle$. Eve's probe ends the same whatever Alice sent."
- F: "No $z$ errors force $|\varphi_{01}\rangle = |\varphi_{10}\rangle = 0$; no $x$ errors force Eqs. 6.4–6.5, hence $|\varphi_{00}\rangle = |\varphi_{11}\rangle$. Then $U|a\rangle|0\rangle = |a\rangle|\varphi_{00}\rangle$: a product, so Eve gains nothing."
- Cap: G/F "a probe that causes no error leaves a product state: both arrows full length" · Stage `tq({circuit:C_PROBE(0°),upTo:1}, {readouts:['rLength']})` · Claims `q15ProbeX0` (0), `q15ProbeGuess0` (0.5) · Derivation D4.

**b5 [C]** (a little information for a little noise)
- Q G: "Can Eve turn her probe only part of the way, learn a little, and cause only a few errors?" · Q F: "For the controlled-$R_y(\varphi)$ probe, how do Bob's $x$-basis error and Eve's best guess of $z$ bits trade off?"
- Reveal G: "Yes, and it costs her. At a quarter turn Bob's $x$ results err $0.1464$ of the time; Eve guesses $z$ bits right $0.8536$. At a half turn she knows every $z$ bit, but $Q = 0.25$." · Reveal F: "At $\varphi = 90°$: $x$-error $\tfrac12(1 - \cos45°) = 0.1464$, Eve's Helstrom guess $0.8536$, Bob's arrow shrinks to $0.7071$. At $\varphi = 180°$ (a CNOT) she learns all $z$ bits and $Q = 0.25$."
- Cap: G/F "a quarter-turn probe: both arrows shortened to $0.7071$" · Stage q `tq({circuit:C_PROBE(0°),upTo:1})`; reveal `tq({circuit:C_PROBE(90°),upTo:1}, {readouts:['rLength']})` · Claims `q15ProbeX90` (0.1464), `q15ProbeGuess90` (0.8536), `q15ProbeR90` (0.7071), `q15ProbeQ180` (0.25).

### Unit `q15-e91` — Entanglement as the key's source
**b1 [B]** (the singlet as a shared coin; D5) · Terms `qc-e91`, `qc-singlet` (Q6)
- G: "A source sends each of Alice and Bob one half of a singlet. Each measures $x$ or $y$ at random. When they chose the same basis, their results are always opposite."
- F: "Ekert's scheme (simplified, Bergou §6.5): a singlet, each party picks $x$ or $y$; same-basis results are perfectly anticorrelated, so Bob flips his bit. Different-basis rounds agree half the time and are dropped."
- Cap: G "the singlet's grid ($-1$ for $xx$, $yy$, $zz$), and its bars after an $x$ reading on both sides" · F "$\langle\sigma_n\otimes\sigma_n\rangle = -1$; after $H\otimes H$ only $|01\rangle, |10\rangle$ remain" · Stage `split(tq({bell:'Psi-'}, {highlight:['xx','yy']}) / amp(C_SX,4,'amplitude'))` · Claims `q15SameX` (0), `q15SameY` (0), `q15DiffXY` (0.5) · Derivation D5.

**b2 [B]** (the Bell test guards the source)
- G: "Ekert also uses the mismatched rounds. With suitable settings they score $2.8284$ on Chapter Q10's CHSH test. No preset answers can pass $2$."
- F: "Ekert's full scheme uses three axes per side; mismatched-axis rounds estimate CHSH. The singlet reaches $2\sqrt2 = 2.8284$ at Q10's settings (Unit 10.5); every local model obeys $|S| \le 2$."
- Cap: G/F "the singlet at Q10's settings: $S = 2.8284$" · Stage `tq({bell:'Psi-'}, {axes:{a:NC_A, b:NC_B}, readouts:['chsh']})` · Claims `q15ChshSinglet` (2.8284).

**b3 [B] · notation beat, `introduces: ['qc-device-independent']`** (Eve owns the source) · Terms `qc-device-independent`, `qc-lhv-model` (Q10)
- G: "Suppose Eve builds the source and sends fixed states, $|+x\rangle$ to Alice and $|-x\rangle$ to Bob. The score stays at $1.4142$, never above $2$. The test catches her."
- F: "Treat the devices as boxes, $P(a,b|x,y)$. If $P = \sum_\lambda D(a|x,\lambda)D(b|y,\lambda)\mu(\lambda)$ (Eq. 6.7, a local model), Eve knowing $\lambda$ knows $a, b$. A violation rules this out: device-independent QKD. Eve's product $|{+x}\rangle|{-x}\rangle$ scores $1.4142$, max $2$."
- Cap: G/F "Eve's fixed product: $S = 1.4142$ here, $2$ at best" · Stage `tq({ket:'+-'}, {axes:{a:NC_A, b:NC_B}, readouts:['chsh']})` · Claims `q15ChshProduct` (1.4142), `q15ChshProductMax` (2).

**b4 [C]** (Bergou's example table, Eq. 6.6)
- Q G: "Alice and Bob share $|\Phi^+\rangle$ and use only $z$ and $x$. Same setting: equal results. Different: random. Does that beat the classical limit?" · Q F: "For $|\Phi^+\rangle$ with $x, y \in \{z, x\}$, $P(a,b|x,y) = \tfrac12\delta_{ab}$ or $\tfrac14$ (Eq. 6.6, corrected). Do these correlations violate CHSH?"
- Reveal G: "No. Two hidden coins, one per setting, copy the table exactly, so the best score is $2$. The key settings alone prove nothing; Ekert adds test settings." · Reveal F: "No: $\lambda = (\lambda_z, \lambda_x)$ uniform, $a = \lambda_x$, $b = \lambda_y$ reproduces Eq. 6.6, so $S \le 2$ (here $2$ exactly). The key-generating settings need extra, non-aligned test settings."
- Cap: G/F "only $z$ and $x$ on each side: $S = 2$, the classical ceiling" · Stage q `tq({bell:'Phi+'})`; reveal `tq({bell:'Phi+'}, {axes:{a:['+z','+x'], b:['+x','+z']}, readouts:['chsh']})` · Claims `q15Eq66Chsh` (2), `q15Eq66LocalGap` (0).

### Unit `q15-sharing` — Splitting a secret between two people
**b1 [B]** (classical splitting) · Terms `qc-secret-sharing`, `qc-xor` (Q4)
- G: "Alice adds a random string $r$ to her key $k$. Bob gets $k \oplus r$, Charlie gets $r$. Alone, each holds pure noise. Together, $k \oplus r \oplus r = k$."
- F: "Secret sharing splits a secret so all parties must cooperate (Bergou §6.6). Bob holds $s = k \oplus r$, Charlie $r$; each share alone is uniformly random. With QKD, Alice's key is the XOR of her BB84 keys with each."
- Cap: G/F "after two columns the share wire holds $k \oplus r$; the third column adds $r$ back" · Stage `split(circ(C_SPLIT,2) / amp(C_SPLIT,2,'probability'))` · Claims `q15SplitShare` (s = 0 after column 2), `q15SplitBack` (s = 1 = k after column 3).

**b2 [B] · notation beat, `introduces: ['qc-logical-bit']`** (the entangled code) · Terms `qc-logical-bit`
- G: "Alice sends one entangled pair per bit: $|\bar 0\rangle = \cos\theta|00\rangle + \sin\theta|11\rangle$ or $|\bar 1\rangle$ with a minus sign. Bob gets one qubit, Charlie the other. Here $\theta = 22.5°$."
- F: "Logical states $|\bar0\rangle = \cos\theta|00\rangle + \sin\theta|11\rangle$, $|\bar1\rangle = \cos\theta|00\rangle - \sin\theta|11\rangle$ (Eq. 6.8; Bergou writes them bold). Each local Bloch arrow has length $\cos2\theta = 0.7071$ at $\theta = 22.5°$."
- Cap: G/F "$|\bar0\rangle$ at $\theta = 22.5°$: both arrows shortened to $0.7071$" · Stage `tq({circuit:C_SHARE(0),upTo:2}, {readouts:['rLength']})` · Claims `q15ShareR` (0.7071).

**b3 [B]** (Bob's reading steers Charlie)
- G: "Bob measures $x$. If he gets $+x$, Charlie holds $|\psi_+\rangle = \cos\theta|0\rangle + \sin\theta|1\rangle$; if $-x$, $|\psi_-\rangle$. For $|\bar1\rangle$ the roles swap."
- F: "Writing Bob's qubit in the $x$ basis gives $|\bar0\rangle = \tfrac1{\sqrt2}(|{+x}\rangle|\psi_+\rangle + |{-x}\rangle|\psi_-\rangle)$ (Eq. 6.9), each with chance $0.5$; $|\bar1\rangle$ swaps $\psi_\pm$."
- Cap: G/F "Bob read $+x$: Charlie's arrow is $|\psi_+\rangle$, at $x = 0.7071$" · Stage `tq({circuit:C_SHARE(0),upTo:2}, {condition:{qubit:0, basis:'x', outcome:0}})` · Claims `q15ShareBobPlus` (0.5), `q15ShareCharlieX` (0.7071).

**b4 [B]** (Charlie's never-wrong reading; D6)
- G: "Charlie tells $|\psi_+\rangle$ from $|\psi_-\rangle$ with Unit 14.4's never-wrong method: success $0.2929$. The bit is Bob's sign XOR Charlie's sign. Neither alone knows it."
- F: "$|\langle\psi_+|\psi_-\rangle| = \cos2\theta$, so Charlie's USD succeeds with $1 - |\cos2\theta| = 0.2929$. Kept rounds decode as $a = b \oplus c$ ($b, c = 0$ for $+x$, $\psi_+$). Eve faces overlap $\cos2\theta = 0.7071$, B92's own."
- Cap: G/F "Charlie's two states, $90°$ apart on the sphere" · Stage `ball({thetaDeg:45,phiDeg:0}, {compare:{thetaDeg:45,phiDeg:180}})` · Claims `q15ShareUsd` (0.2929), `q15ShareOverlap` (0.7071) · Derivation D6.

**b5 [C]** (a dishonest Charlie) · Correction box E3 (pending ruling R1)
- Q G: "Charlie grabs Bob's qubit on its way, measures it in $x$, and sends it on. What does he learn, and does anyone notice?" · Q F: "If Charlie measures Bob's qubit in $x$ before Bob does, what does he learn, and does Bergou's random $\sigma_z$ switch by Bob expose him?"
- Reveal G: "He learns the bit and causes no error. Bergou adds a random flip by Bob. An engine check finds the public record unchanged by it; see the errata box." · Reveal F: "He knows $b$ and $c$, so $a$, with no error. A $\sigma_z$ by Bob only relabels his $x$ result: the public record matches an honest run exactly (gap $0$). Catching him needs a second basis (P6.4)."
- Cap: G/F "Charlie reads Bob's qubit first: the record looks honest" · Stage q `tq({circuit:C_SHARE(0),upTo:2})`; reveal `tq({circuit:C_SHARE(0),upTo:2}, {condition:{qubit:0, basis:'x', outcome:0}})` · Claims `q15CheatGap` (0), `q15CheatKnows` (1).

### 1.6 Claim ledger (key — engine call — value; numpy routes A/B in `plan709q-q15.py`)
- otp: `q15Caesar` `caesar('Caesar',3)` 'Fdhvdu' · `q15PadCipher`, `q15PadBack` `runCircuit(C_PAD)` basis |10⟩, |11⟩ · `q15CopyOverlap` `overlapProb(ket('++'), run(C_COPY))` 0.5 · `q15ReuseLeak` `run(C_REUSE)` wire 3 = 1 · `q15OtpEx` `xor` 10110 ⊕ 01101 = 11011.
- b92: `q15Overlap` `abs(inner(ket('0'),ket('+')))` 0.7071 · `q15B92Kept`, `q15B92Inconcl`, `q15B92Q0` `b92Rates('none')` 0.2929, 0.7071, 0 · `q15EveUsdFail` `bornPovm(usdPovm(|0⟩,|+⟩), ρ₀)[2]` (inconclusive) 0.7071 · `q15QUsdEve` `b92Rates('usd').qber` 0.3536 · `q15QMinEve`, `q15EveMinRight` `b92Rates('minerr')` 0.1464, 0.8536.
- bb84: `q15BridgeQ` `bb84Q()` 0.25 · `q15SeedNearQ` `bb84Tally(bb84Rounds(1000,84,1))` |Q̂ − Q| ≤ 3σ · `q15ProbeX0`, `q15ProbeGuess0` `probeAttack(0)` 0, 0.5 · `q15ProbeX90`, `q15ProbeGuess90`, `q15ProbeR90` `probeAttack(π/2)` 0.1464, 0.8536, 0.7071 · `q15ProbeQ180` ½(z-error + x-error) of `probeAttack(π)` 0.25.
- e91: `q15SameX`, `q15SameY`, `q15DiffXY` `localBasisProbs(bell('Psi-'), …)` 0, 0, 0.5 · `q15ChshSinglet` `chshFromAxes(Ψ⁻, NC_A, NC_B)` 2.8284 · `q15ChshProduct`, `q15ChshProductMax` `chshFromAxes(ket('+-'),…)`, `chshMaxHorodecki` 1.4142, 2 · `q15Eq66Chsh` `chshFromAxes(Φ⁺, [z,x], [x,z])` 2 · `q15Eq66LocalGap` `copyModel66()` 0.
- sharing: `q15SplitShare`, `q15SplitBack` `run(C_SPLIT)` share wire 0, 1 · `q15ShareR` `reducedBloch` length 0.7071 · `q15ShareBobPlus`, `q15ShareCharlieX`, `q15ShareOverlap`, `q15ShareUsd` `shareSplit(π/8)` 0.5, 0.7071, 0.7071, 0.2929 · `q15ShareTheta50` bisection on `shareSplit(θ).usd = 0.5` 30° · `q15SharePx` P(+x) on $\psi_\pm$ 0.8536, 0.1464 and `q15ShareAlpha2` $|\alpha|^2$ 0.8536 (the Try-it's readings) · `q15CheatGap`, `q15CheatKnows` `sharingCheat('cheat-first')` 0, 1.

## 2. Derivations (step `tex` — why — **view** · *viewCaption*; Ground ≥ Formal; ≥ 2 views each)
A step with no bold view keeps the previous step's view (W-709 #11 inheritance), so every step has a picture.
**D1 · otp:b2 · result `c \oplus k = m`** (Bergou p. 106) — Ground (3): (1) `c = m \oplus k` — XOR adds the key bit · **circ(C_PAD,1)** · *the key added* · (2) `c \oplus k = m \oplus k \oplus k` — Bob adds the same key · **amp(C_PAD,1,'probability')** · *the ciphertext state* · (3) `k \oplus k = 0 \Rightarrow c \oplus k = m` — a bit added to itself is 0 · **amp(C_PAD,2,'probability')** · *the message is back*. Formal (2): (1) `|k,m\rangle \to |k, m\oplus k\rangle` · **circ(C_PAD,1)** · (2) `c\oplus k = m\oplus(k\oplus k) = m` — associativity · **amp(C_PAD,2,'probability')**.

**D2 · b92:b3 · result `Q = \tfrac12|\langle\psi_0|\psi_1\rangle| = 0.3536`** (Bergou p. 107; Q14 Eq. 5.42) — Ground (3): (1) `P_\text{fail} = 0.7071` — Eve's never-wrong reading fails as often as Bob's · **ball('+z',{compare:'+x'})** · (2) `P_\text{wrong resend} = \tfrac12 \times 0.7071` — she guesses, half wrong · **amp(C_B92(1),1,'amplitude')** · *a wrong guess resends the other state* · (3) `Q = 0.3536` — Bob's answers name the state he received · **mx({outer:[{ket:'-'}]})** · *Bob's $E_0$ direction*. Formal (2): (1) `P_\text{fail}^E = |\langle\psi_0|\psi_1\rangle|` · **ball** · (2) `Q = P(\text{wrong resend}\mid\text{kept}) = \tfrac12|\langle\psi_0|\psi_1\rangle|` — Bob's conclusive rate is $0.2929$ for either state, independent of the error · **mx**.

**D3 · b92:b4 · result `Q = \tfrac12(1 - 1/\sqrt2) = 0.1464`** — Ground (3): (1) `P_E = \tfrac12(1-\sqrt{1-c^2})` — Helstrom (Unit 14.5) · **ball('+z',{compare:'+x',measure:HAX})** · (2) `c^2 = \tfrac12` · **mx(lin Γ, spectrum)** · *Γ's eigenvalues ±0.3536* · (3) `Q = P_E = 0.1464` — each wrong resend is a wrong kept bit · **ball**. Formal (2): (1) `P_E = \tfrac12(1-\lVert\Gamma\rVert_1)`, `\lVert\Gamma\rVert_1 = 0.7071` · **mx** · (2) `Q = P_E = 0.1464`, Eve right `0.8536` · **ball(…, measure:HAX)**.

**D4 · bb84:b4 · result `U|a\rangle|0\rangle = |a\rangle|\varphi_{00}\rangle`** (Eqs. 6.1–6.5) — Ground (4): (1) Eq. 6.1 · **circ(C_PROBE(90°),1)** · (2) `|\varphi_{01}\rangle = |\varphi_{10}\rangle = 0` — no $z$ errors · **tq(C_PROBE(90°))** · *a probe that does act shortens both arrows* · (3) `|\varphi_{00}\rangle + |\varphi_{10}\rangle = |\varphi_{01}\rangle + |\varphi_{11}\rangle \Rightarrow |\varphi_{00}\rangle = |\varphi_{11}\rangle` — no $x$ errors (Eqs. 6.4–6.5) · **tq(C_PROBE(0°))** · (4) the product result — nothing entangled, nothing learned · **tq(C_PROBE(0°), rLength)**. Formal (3): (1) Eqs. 6.1–6.2 · **circ** · (2) $z$: $\varphi_{01} = \varphi_{10} = 0$; $x$: Eqs. 6.4–6.5 · **tq(90°)** · (3) result · **tq(0°)**.

**D5 · e91:b1 · result `P(a = b \mid \text{same basis}) = 0`** — Ground (3): (1) `|\Psi^-\rangle = (|01\rangle - |10\rangle)/\sqrt2` — opposite in $z$ · **amp({bell:'Psi-'})** · (2) after $H \otimes H$ the bars sit on $|01\rangle, |10\rangle$ again · **amp(C_SX,4,'amplitude')** · (3) `\langle\sigma_n\otimes\sigma_n\rangle = -1 \Rightarrow P = \tfrac12(1 + E) = 0` · **tq({bell:'Psi-'})**. Formal (2): (1) `(U\otimes U)|\Psi^-\rangle = \det U\,|\Psi^-\rangle` · **amp(C_SX,4)** · (2) `E_{nn} = -1`, `P(a=b) = 0` · **tq**.

**D6 · sharing:b4 · result `P_\text{Charlie} = 1 - |\cos2\theta| = 0.2929`, `a = b \oplus c`** — Ground (4): (1) Eq. 6.9 · **tq(C_SHARE(0))** · (2) `+x \Rightarrow |\psi_+\rangle` · **tq(C_SHARE(0), condition)** · (3) `|\langle\psi_+|\psi_-\rangle| = \cos2\theta = 0.7071` · **ball(ψ±)** · (4) success `0.2929`; decode `a = b \oplus c` · **ball**. Formal (3): (1) Eq. 6.9 · **tq** · (2) overlap · **ball** · (3) result · **ball**.

## 3. Try-it widgets (read from widget source; props exist; every line checked)
| Unit | Spec | Try this |
|---|---|---|
| otp | `bb84-bench` `{eve:'off', seed:84}` | Send 100, tick "compare bases": the kept count is how many message bits this key can pad, once. Press New run: a fresh key. |
| b92 | `bloch` `{theta:90, phi:0, editable:true, measure:'z', landmarks:true}` | At θ = 90° the state is $|+\rangle$: the +z bar reads one half, so $|\langle0|+\rangle| = 0.71$ and Bob's success is $0.29$. Lower θ: the bar grows, the overlap grows, fewer rounds would be kept. |
| bb84 | `bb84-bench` `{eve:'all', seed:84}` | Send 1000, compare bases: $\hat Q$ sits near 25%. Switch to "no Eve": $\hat Q$ drops to 0. |
| e91 | `pair-grid` `{preset:'family', t:45}` | At t = 45° this is the singlet: only $|ud\rangle$, $|du\rangle$ hold weight, so z results always differ. Move t: still always opposite, no longer half and half. |
| sharing | `bloch` `{theta:45, phi:0, editable:true, measure:'x', landmarks:true}` | θ = 45°, φ = 0° is Charlie's $|\psi_+\rangle$: +x reads 85%. Set φ = 180° ($|\psi_-\rangle$): 15%. $|\alpha|^2$ stays 0.85, so z cannot tell them apart. |

## 4. Challenges (tol 0.005; hints nudge → idea → setup; full walkthroughs — none is P6.1–P6.4, no HW3 exists)
- **otp** 1 warm-up choice `q15-ot-caesar` "Shift 'qubit' by three" → **txelw** ✓ · tyuhx · rtcju · qubit (`caesar`). 2 core choice `q15-ot-xor` "$m = 10110$, $k = 01101$: $c$?" → **11011** ✓ (`q15OtpEx`). 3 core choice `q15-ot-reuse` "One pad, two messages: what leaks?" → **$m_1 \oplus m_2$** ✓ · $k$ · nothing · $m_1$ (`q15ReuseLeak`).
- **b92** 1 warm-up numeric `q15-b9-kept` kept share → **0.293** (`q15B92Kept`). 2 core numeric `q15-b9-usd` Q under an unambiguous Eve → **0.354** (`q15QUsdEve`). 3 core numeric `q15-b9-min` Q under a minimum-error Eve → **0.146** (`q15QMinEve`). 4 core choice `q15-b9-worse` "Which attack is harder to detect?" → **minimum-error** ✓ (`q15QMinEve < q15QUsdEve`).
- **bb84** 1 warm-up choice `q15-bb-q` intercept–resend Q → **¼** ✓ (`q15BridgeQ`). 2 core numeric `q15-bb-probe` x-error of the quarter-turn probe → **0.146** (`q15ProbeX90`). 3 core choice `q15-bb-free` "No errors in $z$ or $x$: what has Eve's ancilla learned?" → **nothing; $U|a\rangle|0\rangle = |a\rangle|\varphi\rangle$** ✓ (`q15ProbeGuess0` = 0.5).
- **e91** 1 warm-up numeric `q15-e9-same` chance of equal results, same basis → **0** (`q15SameX`). 2 core numeric `q15-e9-diff` Alice $x$, Bob $y$: chance equal → **0.5** (`q15DiffXY`). 3 core choice `q15-e9-fixed` "Eve sends fixed states: what does the CHSH score do?" → **stays ≤ 2: caught** ✓ (`q15ChshProductMax`).
- **sharing** 1 warm-up numeric `q15-sh-usd` Charlie's success at θ = 22.5° → **0.293** (`q15ShareUsd`). 2 core choice `q15-sh-decode` "Bob $-x$, Charlie $\psi_+$: Alice's bit?" → **1** ✓ ($b \oplus c$). 3 stretch numeric `q15-sh-theta` θ (degrees, ≤ 45°) giving Charlie success 0.5 → **30** (tol 0.5; `q15ShareTheta50`).

## 5. Glossary (new in 709; none duplicates an existing `qc-` id)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-cipher` | cipher | — | A rule that swaps each letter or bit for another, using a key. | A keyed substitution or transposition on symbols (Bergou §6.2). | otp:b1 | — |
| `qc-secret-key` | secret key | — | The shared secret a cipher needs; the rule itself can be public. | The parameter of a public encryption algorithm known only to sender and receiver. | otp:b1 | — |
| `qc-one-time-pad` | one-time pad | — | A random key as long as the message, added once and never reused. | $c = m \oplus k$, $k$ uniform and used once: perfectly secret (Vernam). | otp:b2 | `qc-l8-key` |
| `qc-key-distribution` | key distribution | — | Getting the same secret key to two people without anyone else seeing it. | Establishing a shared uniformly random key over channels an adversary may access. | otp:b3 | — |
| `qc-qkd` | quantum key distribution | — | Sharing a key by sending quantum states, so that spying leaves errors. | Key distribution whose security rests on no-cloning and disturbance. | b92:b1 | — |
| `qc-b92` | B92 | — | Bennett's key scheme with two overlapping states. | QKD with $\{|0\rangle, |+\rangle\}$ and USD at the receiver (Bergou §6.3). | b92:b1 | — |
| `qc-raw-key` | raw key | — | The bits Alice and Bob keep after discarding failed rounds. | The conclusive (or basis-matched) rounds before error checking. | b92:b2 | — |
| `qc-qber` | key error rate $Q$ | notation | The share of kept key bits on which Alice and Bob disagree. | QBER $Q$ = fraction of raw/sifted bits that differ. | b92:b2 | `qc-l8-attack` |
| `qc-bb84` | BB84 | — | The four-state key scheme: two bases, chosen at random, then compared. | QKD with $z$ and $x$ bases and basis sifting (Bergou §6.4). | bb84:b1 | `qc-l8-bb84` |
| `qc-intercept-resend` | intercept–resend | — | Eve measures each qubit and sends on a fresh one in what she found. | The measure-and-prepare attack; $Q = \tfrac14$ in BB84. | bb84:b2 | `qc-l8-attack` |
| `qc-information-disturbance` | information–disturbance | — | Any attack that learns something about the key must cause some errors. | Zero error in two unbiased bases forces Eve's ancilla to decouple (Eqs. 6.1–6.5). | bb84:b4 | — |
| `qc-e91` | E91 | — | Ekert's key scheme: a shared singlet, random bases, a Bell test. | Entanglement-based QKD with CHSH as the security check (Bergou §6.5). | e91:b1 | — |
| `qc-device-independent` | device-independent | notation | Trusting no box: only the Bell score of the outputs certifies the key. | Security from $P(a,b|x,y)$ alone; requires violating every local model (Eq. 6.7). | e91:b3 | — |
| `qc-secret-sharing` | secret sharing | — | Splitting a secret so it opens only when the holders work together. | A scheme whose shares are individually uninformative (Bergou §6.6). | sharing:b1 | — |
| `qc-logical-bit` | logical states $|\bar0\rangle, |\bar1\rangle$ | notation | Two entangled pair states that stand for one bit. | $\cos\theta|00\rangle \pm \sin\theta|11\rangle$ (Eq. 6.8). | sharing:b2 | — |

## 6. Review cards (both tracks)
- **otp** G: a key used once hides anything; XOR on, XOR off; the key, not the rule, is the secret; copying a qubit fails. F: $c = m\oplus k$, perfect secrecy needs a uniform once-used key; key distribution is the problem. Eq $c \oplus k = m$. Trap: reusing a pad leaks $m_1 \oplus m_2$.
- **b92** G: two overlapping states; Bob keeps $0.2929$; Eve's never-wrong copy gives $Q = 0.3536$, her best guess $0.1464$. F: USD success $1 - |\langle\psi_0|\psi_1\rangle|$; $Q_\text{USD} = \tfrac12|\langle\psi_0|\psi_1\rangle|$; $Q_\text{ME} = P_E$. Eq $Q_\text{ME} = \tfrac12(1 - 1/\sqrt2)$. Trap: guarding only against the noisy attack.
- **bb84** G: two bases; intercept–resend gives $\tfrac14$ (Spin Lab 8.7); zero error ⇒ zero information. F: Eqs. 6.1–6.5 force $\varphi_{01} = \varphi_{10} = 0$, $\varphi_{00} = \varphi_{11}$. Eq $U|a\rangle|0\rangle = |a\rangle|\varphi_{00}\rangle$. Trap: thinking ¼ is the error of every attack.
- **e91** G: singlet halves agree (flipped) in matching bases; the Bell score $2.8284$ proves no preset answers. F: $P(a,b|x,y)$ violating CHSH rules out Eq. 6.7, hence Eve's $\lambda$. Eq $|S| \le 2$ vs $2\sqrt2$. Trap: thinking the key settings alone certify security.
- **sharing** G: XOR splits a key; entangled codes split a bit; Charlie succeeds $0.2929$; $a = b\oplus c$. F: Eq. 6.9 steering; USD $1 - |\cos2\theta|$; cheating needs a second basis to catch. Eq $a = b \oplus c$. Trap: trusting Bergou's σ_z switch (errata box).

## 7. Symbol-before-use
**7.1 Ground:** ⊕ (Q4, recap otp:b2) · $c, m, k$ otp:b2 · $|\psi_0\rangle, |\psi_1\rangle$ b92:b1 · $Q$ b92:b2 (notation beat) · $\Gamma$ (Q14; text says "best split", symbol only in F) · $|\varphi_{jk}\rangle$ bb84:b3 · $\varphi$ (probe angle) bb84:b5 — **FLAG**: $\varphi$ vs $|\varphi_{jk}\rangle$; Ground says "a quarter turn" and writes no $\varphi$ · singlet (Q6) · $S$ (Q10) e91:b2 · $r$, $s$ sharing:b1 · $\theta$, $|\bar0\rangle, |\bar1\rangle$ sharing:b2 · $|\psi_\pm\rangle$ sharing:b3 — **FLAG**: $|\psi_\pm\rangle$ (Charlie) vs $|\psi_{0,1}\rangle$ (B92): different units, stated in place.
**7.2 Formal:** adds $P_\text{fail}^E$ b92:b3, $\lVert\Gamma\rVert_1$ (Q9/Q14) b92:b4, $U$, $|0\rangle_e$ bb84:b3, $R_y(\varphi)$ bb84:b5, $\sigma_n$ e91:b1, $P(a,b|x,y)$, $\lambda$, $D(a|x,\lambda)$, $\mu$ e91:b3, $\delta_{ab}$ e91:b4. Counts: Ground 2 FLAGs, Formal 1 ($\lambda$ vs Q10's hidden values: same idea, stated).

## 8. Errata (Correction boxes, `source: 'book'`, each with an engine `check`)
- **E1 (map B16)** p. 107: USD-Eve error printed "≈ 35.3%"; $1/(2\sqrt2) = 0.35355$, i.e. 35.4%. Check `q15QUsdEve`.
- **E2 (map B17, now confirmed on the page image)** p. 111, Eq. 6.6: the $x = y$ line lacks $\delta_{ab}$; correct $P = \tfrac12\delta_{ab}$ ($x = y$), $\tfrac14$ ($x \ne y$). Check: engine table of $|\Phi^+\rangle$.
- **E3 (new, math; ruling R1)** p. 113: Bergou says Bob's random $\sigma_z$ exposes, through errors, a Charlie who measured Bob's qubit. It cannot: $\sigma_z$ maps $|{\pm x}\rangle$ to $|{\mp x}\rangle$, so it only relabels Bob's $x$ result; honest and cheated public records are identical (max gap 0; `q15CheatGap`), and a Charlie who reads first still learns every kept bit (`q15CheatKnows` = 1). A $\sigma_z$ applied before Charlie can touch the qubit does hide the bit from him (his guess 0.5), but still makes no error.
- Silent: Eq. 6.1's $|0\rangle_a$ vs Eq. 6.6's $\Phi^+$ — different examples, no box; Bergou's 85% figure for what the minimum-error Eve learns (p. 108) is her success probability 0.8536, stated as such; P6.1 names the singlet $\phi^-$ (map B6), not used.

## 9. Engine gaps and stage contracts
**9.1 Engine** (new `physics/qc/crypto.ts` + two `povm.ts` helpers; numpy block "crypto" in `make_qc_fixtures.py`):
`caesar(text, shift)` · `usdPovm(ψ0, ψ1)` → $[E_0, E_1, E_?]$ (equal priors; Q14 hand-built these) · `helstromPovm(ρ0, ρ1, η)` →
Γ's ± projectors · `b92Rates(eve: 'none'|'usd'|'minerr')` → `{kept, qber, eveRight}` by exact branch sums over both POVMs ·
`probeAttack(φ)` → `{xError, zError, eveGuess, rA}` (via `runCircuit`, `helstrom`, `reducedBloch`) · `shareSplit(θ)` →
`{bobPlus, charlieBloch, overlap, usd}` · `sharingCheat(order)` → `{recordGap, charlieGuess}` · `copyModel66()` (the
λ-model gap). Reused: `bb84Q`, `bb84Rounds`, `bb84Tally` (bb84.ts), `chshFromAxes`, `chshMaxHorodecki`, `correlationTensor`,
`runCircuit`, `bits.xor`. Optional (R4): `b92Rounds(count, seed, eve)` for a seeded B92 ledger.
**9.2 Stage:** no new kind. Confirmed fields: `bb84` (`rounds.seed/count`, `eve:'all'`, `sift`, readouts `kept/qber/eve-knows`) is
a shared SVG kind, first 709 use; `two-qubit` `condition` needs a `ket` source (a circuit `AmpSource` qualifies),
`axes` + `readouts:['chsh'|'rLength']`; `bloch-ball` `compare` + `measure` (readout P(+n̂) on `point`, honest at HAX);
`matrix` `{outer}` and the exact-set `lin` for Γ. Optional R4: a `bb84` `protocol:'b92'` ledger (rows: Alice's state, Bob's
conclusive/blank result, Eve's attack) on the B92 engine.
**9.3 Widgets:** none required; the stand-ins above are exact. Optional W15 `b92-bench` (same shell as `bb84-bench`).

## 10. Media
Opener (Blender, deferred): Part VI's photon stream (map §7), engine JSON, no counts on screen. Film (deferred)
`qc-q15-two-eves`: Q under the two B92 attacks as the overlap sweeps (manifest keys `q15QUsdEve`, `q15QMinEve`,
`q15B92Kept`). Decor (Higgsfield, user credits): a vault door, a fibre coil in the dark; no text or numbers.

## 11. Hooks
**11.1 Concept stations:** `qc-one-time-pad` (otp; needs `qc-cnot`; sameAs `key-distribution`) · `qc-b92` (b92; needs
`qc-usd`, `qc-helstrom`) · `qc-entangling-eve` (bb84; needs `qc-b92`, `qc-entanglement`; sameAs `intercept-resend`) · `qc-e91`
(e91; needs `qc-chsh-station`, `qc-bell-violation`) · `qc-secret-sharing` (sharing; needs `qc-one-time-pad`, `qc-usd`).
New bridges in `qc709/bridges.ts`: `qc-l8-key`, `qc-l8-bb84`, `qc-l8-attack`, `qc-l8-test` (448 L8 units). Follow-up on the
448 side after merge: `sl-q15-b92` from `l8-attack:b7`.
**11.2 Arcade (Spot the error; `Q15x` labels):** `qc-pad-twice` (otp: "reusing the pad is safe because the key is random",
why `q15ReuseLeak`) · `qc-b92-35` (b92: "Eve's USD attack leaves Q = 0.1464", why `q15QUsdEve`) · `qc-quiet-probe` (bb84:
"a probe causing no error still learns a little", why `q15ProbeGuess0`) · `qc-e91-zx` (e91: "z and x settings alone show a
violation", why `q15Eq66Chsh`) · `qc-share-alone` (sharing: "Bob's sign alone gives the bit", why decode table). 448's Catch
Eve already drills BB84.

## Rulings requested
- R1 Secret-sharing σ_z defence (E3): accept the correction box and the b5 reveal as written, or show the cheat only?
- R2 Unit order: Bergou's (otp → b92 → bb84 → e91 → sharing), so B92 follows Q14 directly — confirm.
- R3 Five units / 23 beats: keep B92's two attacks in one unit (b3–b5) rather than a sixth unit?
- R4 Seeded B92 ledger (`b92Rounds` + `bb84` `protocol:'b92'`): build now, or keep exact-rate pictures only?
- R5 Running θ = 22.5° for sharing (Eve's overlap = B92's 0.7071): accept, or Bergou-neutral θ = 30°?
- R6 The probe attack (bb84:b5, beyond Bergou's algebra): keep as a `[C]` clue, or move to a `'deeper'` beat?
- R7 P6.1–P6.4 (⚑): cited only, no graded challenge, as ruled for Q14 — confirm.
- R8 New `crypto.ts` + `usdPovm`/`helstromPovm` in `povm.ts` (§9.1): approve as one engine task before the build.
