# P-Q24-story — Q24 "Controlling a real qubit: Lindblad, Bloch equations, Rabi and Ramsey" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q19-story.md`. Map row `P-709-map.md` §12 (drafted as "Q22"; `outline.ts` numbers it Q24, first chapter of Part XI, Hardware). Standing gates: ≥ 2 distinct
derivation views per track; one notation beat per new notation. **Phase `'books'`**: no 709 notes cover Ch. 12, so the "lecture" phase is Bergou alone; ramp `[B]`, clues `[C]`, Go-deeper `[D]` last in its unit.

**Sources read** (paraphrased; printed pages). Bergou Ch. 12 (PDF = printed + 7; map E1: chapters 11–13), §12.1 pp. 201–202, §12.2 pp. 202–203 (12.1 and the Lindblad form), §12.3 pp. 204–206 (12.2–12.5), §12.4 pp. 206–208
(12.6–12.8, Figs. 12.2–12.3), §12.4.1 p. 209, §12.4.2 p. 210, §12.5 pp. 210–215 (12.9–12.12, Figs. 12.4–12.5), §12.5.1 pp. 215–216, problems P12.1–P12.7 pp. 217–218 (⚑ cited only). No N&C. **Page images checked**
(PDF pp. 213 and 216 rendered at 2.6×, the equations of Eqs. 12.4–12.5 and the matrices of §12.4.1 read off the image; the text layer garbles Ω and Δ). No 709 homework covers Ch. 12 (`homework-status.md`), so every walkthrough is full;
no problem is worked: P12.5 (composite-pulse error operators) is the book's, so beat rabi:b5 only *verifies the text's own claim* with engine numbers and never writes the leading-order operator or the angle $\varphi$.

**Ownership.** 448 L11–L12 own the generator $e^{-iHt}$, the two-level system, rotating-wave `[[rotating-wave]]`, the resonant flip and Larmor precession (`l11-two-level`, `l12-driven`: link-backs, no re-derivation); Q8 the density matrix
and Bloch ball; Q13 Kraus maps, `qc-amplitude-damping`, dephasing; Q21 collective dephasing and the noise vocabulary; Q4 gates and `R_n`. **Q24 owns:** the Lindblad equation and its qubit form, T₁/T₂, the optical Bloch equations and
steady state, Rabi pulses as gates (with the sign erratum), composite pulses, Ramsey, noise-induced T₂*, echo and decoupling. Q25 reuses all of it.

**Reported-numbers rule (which applies).** `Beat.reported` exists in the type, in the claims lint (`claims.test.ts unbacked`) and in the shared story renderer (`BeatPaperNotes`), but its only validator and ruling are Papers-only (`papers/validate.ts`,
papers.md R3) and no 709 chapter uses it. **Applied here: words without digits for hardware** (no experimental coherence time, fidelity or frequency is quoted), and **every displayed digit is computed from a stated model**
(γ = 1, T₁ = 2.5 and T₂ = 5 of Fig. 12.3, a one-microsecond gate against a one-millisecond T₂, noise of rms size 1). Model inputs are `V` keys with a twin literal. Judge may rule otherwise (open question 1).

**Evidence.** `planQ24Q25-numpy.py` (scratchpad; numpy + scipy only, independent of the repo engine; **run twice, byte-identical**). Routes: Lindbladian as a 4×4 superoperator and `expm` against Kraus steps and a hand-written RHS; Eqs. 12.4 by `solve_ivp`
(rtol 1e-11) against the closed steady state; **Eq. 12.7 against the ODE 12.6** (gap 7e-14, real and complex Ω); a *full time-dependent Lindblad without RWA* (ω_q = 40, Ω = 1) for the steady state; Ramsey and composite pulses by matrix products;
dM/dt = B × M against density-matrix evolution (gap 1e-13); the OU phase variance by double quadrature against the closed form (gap 4e-16); echo variance likewise (2e-15). **106 printed `q24…` keys; the script's checks (Eq. 12.7 against the ODE, the no-RWA Lindblad, both quadratures) all agree to the stated gaps.** Every number below is from that script.

**Conventions.** $\hbar = 1$; $|g\rangle = |0\rangle = |{+z}\rangle$ (north), $|e\rangle = |1\rangle$; $\mathbf r$ = Bloch vector, $r_z = \rho_{gg} - \rho_{ee} = -w$; $R_n(\theta) = e^{-i\theta\,n\cdot\sigma/2}$. **Rosetta** (rabi:b1): Bergou's $\Omega = d\mathcal E/\hbar$ is the flip rate, $P_e = \sin^2(\Omega t/2)$;
Townsend's $\omega_1 = 2\Omega$ (448's `rabiFlip` x = $\omega_1 t/2\pi$ = $\Omega t/\pi$, so the π pulse is at x = 1). Times in units of $T_1$ where γ = 1. Claim keys `q24…`; twins `pipeline/claims_qc709/q24.py`. Cross-references "Unit 24.2", "Chapter Q13".

**Stage shorthand.** `bl(S, rot)` = `bloch` (state S, `rotate`) · `bb(k)` = `bloch-ball` `{point:{r:[V.q24xK, V.q24yK, V.q24zK]}, purity:true}` (explicit Bloch vector from the engine) · `PL(f)` = `plot` curve f (`vs` for a second) ·
`circ(C)` = `circuit` · `mat(…)` = `matrix` `{source:{product:[gate …]}}` · `split(a / b)`. `C_LIFE` 1 wire init `0`: [X], [measure]. Existing curves reused: `rabiFlip`, `rabiFlipOff`, `rabiPeak` (448 G4a).

## 0. Chapter map
**Driving question:** "How do physicists flip a qubit with a pulse, and why does it slowly forget?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q24-divincenzo` | Seven things a qubit must do | What must any real qubit be able to do? | Bergou §12.1 pp. 201–202 | Q4 |
| 2 | `q24-lindblad` | Why a qubit slowly forgets | What equation replaces Schrödinger's for an open qubit? | §12.2–12.3 pp. 202–205 (12.1–12.2) | Q13, Q8, 448 L11 |
| 3 | `q24-bloch-eq` | Driving a qubit that decays | Where does a driven, decaying qubit settle? | §12.3 pp. 205–206, §12.4 p. 208 (12.3–12.5, Fig. 12.3) | 448 L12 |
| 4 | `q24-rabi` | Pulses that flip, and gates from them | How long and how phased a pulse makes X, Y, Z? | §12.4–12.4.2 pp. 206–210 (12.6–12.8, Figs. 12.2) | 448 L12, L7 |
| 5 | `q24-ramsey` | Two half-pulses and a wait | How does a qubit's phase get measured, and lost? | §12.5 pp. 210–215 (12.9–12.12, Figs. 12.4–12.5) | Q3, Q4 |
| 6 | `q24-decoupling` | Undoing slow noise with flips | Can pulses cancel noise instead of waiting it out? | §12.5.1 pp. 215–216 | Q21 |

**Outcomes:** list the seven criteria and say which five a computer needs · derive the Lindblad form from a short Kraus step and read T₁ = 1/γ, T₂ = 2T₁ off the qubit equation · explain why T₂ ≤ 2T₁ (positivity) ·
write the optical Bloch equations, the rotating-wave step and the steady state, and say why steady driving never inverts · give P(e) for a detuned drive and build X, Y and Z from pulses (Correction: the printed sign of R_x) ·
say what a composite pulse buys · run a Ramsey sequence and read cos²(φ/2) · turn a noise correlation into a T₂* and see why faster noise hurts less · show an echo cancels static and slow noise but not fast.
**Prerequisites:** `qc-quantum-channel`, `qc-kraus-operator`, `qc-amplitude-damping` (Q13), `qc-bloch-ball`, `qc-von-neumann-equation` (Q8), `qc-rotation-operator` (Q4), `schrodinger-equation`, `rotating-wave` (448). **Openers:** none (Part XI's Blender opener, the cryostat descent, sits before Unit 24.1 and ends on an engine Rabi path; deferred).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: divincenzo bloch, circuit, bloch-ball · lindblad bloch-ball, plot · bloch-eq bloch-ball, plot · rabi plot, bloch, matrix · ramsey bloch, bloch-ball, plot · decoupling plot, bloch.

### Unit `q24-divincenzo` — Seven things a qubit must do
**b1 [B]** (§12.1, p. 201) · Terms `qc-divincenzo-criteria`
- G: "A computer needs five things from its qubits. They must be many and well defined. They must start in a known state, be readable one at a time, and stay quantum long enough. And they need a universal set of gates."
- F: "The [[qc-divincenzo-criteria|DiVincenzo criteria]] (Bergou p. 201): scalability with well-characterised qubits; initialisation to a fiducial state; a qubit-specific measurement; decoherence times long against gate times; a universal gate set. Two more, interconverting stationary and flying qubits and transmitting the flying ones, serve networks: $5 + 2 = 7$."
- Cap G "the fiducial state: the north pole, $|0\rangle$" · F "initialisation to $|0\rangle = |{+z}\rangle$" · Stage `bl('+z')` · Claims `q24Criteria` 7, `q24CritCompute` 5, `q24CritNet` 2.

**b2 [B]** (the platform map, pp. 201–202)
- G: "Atoms and ions come first, then photons, then chips. Each family meets the criteria differently. Spins in diamond and electrons on helium are named but not treated here."
- F: "Bergou treats five families: neutral atoms and trapped ions (Chap. 13, our Q25), photons (Chap. 14) and superconducting circuits and quantum dots (Chap. 15). This chapter supplies the shared tools: the Lindblad equation, $T_1$ and $T_2$, Rabi oscillation and Ramsey interference."
- Cap G/F "prepare, gate, read: the three steps every platform must supply" · Stage `circ(C_LIFE)` (X then measure) · Claims `q24Platforms` 5.

**b3 [C]** (the budget, model numbers)
- Q G: "One gate takes a microsecond. The qubit keeps its phase for a millisecond. How many gates fit before the phase is down to 1/e?" · Q F: "Take $t_{\rm gate} = 1\,\mu s$ and $T_2 = 1\,ms$ (model values, not a platform's). Find $N = T_2/t_{\rm gate}$ and the coherence factor per gate and after $N$."
- Reveal G: "A thousand gates. Each gate costs a thousandth: the phase signal is multiplied by 0.9990. After the thousand it is 0.3679, which is 1/e." · Reveal F: "$N = 1000$; per gate $e^{-t_{\rm gate}/T_2} = 0.9990$, after $N$ gates $e^{-1} = 0.3679$ ($T_2$ is defined in Unit 24.2). The ratio $T_2/t_{\rm gate}$ is the figure of merit behind criterion four."
- Cap G/F "the equator state after 1000 gates: the arrow has shrunk to 0.368 of its length" · Stage `bb('Life')` r = (0.3679, 0, 0) · Claims `q24GatesPerT2` 1000, `q24SurviveGate` 0.9990, `q24SurviveAll` 0.3679.

### Unit `q24-lindblad` — Why a qubit slowly forgets
**b1 [B] · notation beat, `introduces: ['qc-lindblad-operator']`** (§12.2 pp. 202–203, Eq. 12.1) · Bridge `qc-q13-from-unitary`
- G: "A qubit never sits alone. Ignore its surroundings and each short time step acts like a set of Kraus operators (<<qc-q13-from-unitary|Unit Q13.1>>). One is nearly the identity. The others are small jumps."
- F: "Trace out the environment (Fig. 12.1): $\rho_S(t) = \sum_j A_j\rho_S(t_0)A_j^\dagger$. For a step $\delta t$ take $A_0 = I + L_0\delta t$ and $A_j = L_j\sqrt{\delta t}$ ($j \ge 1$), the [[qc-lindblad-operator|Lindblad operators $L_j$]] (12.1). To first order $\delta\rho = (L_0\rho + \rho L_0^\dagger + \sum_{j\ge1}L_j\rho L_j^\dagger)\,\delta t$."
- Cap G/F "the start: the equator state $|{+x}\rangle$, arrow of full length" · Stage `bb('0')` r = (1, 0, 0) · Claims `q24KrausGapRatio` 4 (the Kraus step and the Euler step of the equation differ by $O(\delta t^2)$: halving $\delta t$ divides the gap by 4).

**b2 [B]** (the Lindblad form, p. 203; D1)
- G: "Total chance must stay 1. That fixes the nearly-identity operator: its correction is minus half of every $L^\dagger L$. Then each jump moves some weight and the rest is the old commutator."
- F: "Write $L_0 = -iH/\hbar + L_0'$; $\operatorname{Tr}\dot\rho = 0$ forces $L_0' = -\tfrac12\sum_{j\ge1}L_j^\dagger L_j$, so $\dot\rho = -\tfrac i\hbar[H,\rho] + \sum_j\bigl(L_j\rho L_j^\dagger - \tfrac12L_j^\dagger L_j\rho - \tfrac12\rho L_j^\dagger L_j\bigr)$, the Lindblad equation. The engine's right-hand side has trace $0$."
- Cap G/F "one short step: the arrow shortens a little and tilts toward the north pole" · Stage `bb('dt')` · Claims `q24TraceRate` 0 · Derivation D1.

**b3 [B]** (the qubit that decays, p. 204, Eq. 12.2; Bridge `qc-q13-depolarizing` for `qc-amplitude-damping`)
- G: "Let the excited state $|e\rangle$ decay at rate $\gamma$ into $|g\rangle$. The jump operator is $\sqrt\gamma\,|g\rangle\langle e|$. Population leaves $e$ at rate $\gamma$ and the off-diagonal entry shrinks at half that."
- F: "$L = \sqrt\gamma\,|g\rangle\langle e|$ gives (12.2) $\dot\rho = -\tfrac i\hbar[H,\rho] + \gamma\begin{pmatrix}\rho_{ee} & -\rho_{ge}/2\\ -\rho_{ge}^*/2 & -\rho_{ee}\end{pmatrix}$: the [[qc-amplitude-damping|amplitude-damping]] channel of Chapter Q13 in continuous time. Starting from $|{+x}\rangle$ with $\gamma = 1$ at $t = 1/\gamma$: $\rho_{ee} = 0.1839$, $|\rho_{ge}| = 0.3033$."
- Cap G/F "after one lifetime: arrow $(0.607, 0, 0.632)$, length 0.876, purity 0.884" · Stage `bb('T1')` · Claims `q24ExcT1` 0.1839, `q24CohT1` 0.3033, `q24RT1x` 0.6065, `q24RT1z` 0.6321, `q24PurT1` 0.8837.

**b4 [B]** (T₁ and T₂, pp. 204–205; D2)
- G: "The population falls as $e^{-t/T_1}$ and the phase signal as $e^{-t/T_2}$. Here $T_1 = 1/\gamma$ and $T_2 = 2/\gamma$: the phase lasts twice as long as the population."
- F: "$\rho_{ee}(t) = \rho_{ee}(0)e^{-\gamma t}$ and $\rho_{ge}(t) = \rho_{ge}(0)e^{-\gamma t/2}$ (since $c_e \propto e^{-\gamma t/2}$), so [[qc-t1|$T_1$]] $= 1/\gamma$ and [[qc-t2|$T_2$]] $= 2/\gamma = 2T_1$ (p. 205); extra dephasing only shortens it: $T_2 \le 2T_1$."
- Cap G/F "population left (solid) and phase signal left (dashed) against time in units of $T_1$: at 1 the values 0.368 and 0.607, at 2 the phase is 0.368" · Stage `PL(popDecay vs cohDecay)`, markers 1, 2 · Claims `q24PopFactorT1` 0.3679, `q24CohFactorT1` 0.6065, `q24CohFactor2T1` 0.3679, `q24T2OverT1` 2.

**b5 [C]** (why not $T_2 = 3T_1$?)
- Q G: "Could a qubit keep its phase three times longer than its population? Try $T_2 = 3T_1$ from $|{+x}\rangle$ and look at the smaller eigenvalue of the state." · Q F: "Take $\rho(t)$ with $\rho_{ee} = \tfrac12e^{-t/T_1}$ and $|\rho_{ge}| = \tfrac12e^{-t/T_2}$. Find the minimum over $t$ of the smaller eigenvalue for $T_2 = 2T_1$ and $3T_1$."
- Reveal G: "With $2T_1$ it never goes below 0. With $3T_1$ it reaches $-0.0096$ near $3.2\,T_1$: a negative chance. So $T_2$ cannot exceed $2T_1$." · Reveal F: "$T_2 = 2T_1$: $\lambda_{\min} \ge 0$ for all $t$ (equal to $0$ only at $t = 0$). $T_2 = 3T_1$: $\lambda_{\min} = -0.0096$ at $t = 3.17\,T_1$, so $\rho$ stops being positive: positivity gives $T_2 \le 2T_1$ (our calculation; the book states the bound)."
- Cap G/F "the lower eigenvalue against time for the two choices" · Stage `PL(popDecay vs cohDecay)` (reuse) · Claims `q24MinEig2` 0, `q24MinEig3` −0.0096, `q24MinEigAt` 3.17.

**b6 [B]** (extra dephasing; p. 205 and the convention printed in P12.2 on p. 217 — the Kraus set of P12.2 is not built)
- G: "Noise can also scramble phase without moving population. Then $1/T_2 = 1/2T_1 + 1/T_\varphi$. With $T_1 = T_\varphi = 1$ the phase lives $0.6667$, down from $2$."
- F: "A second jump operator $\sqrt{\gamma_\varphi/2}\,Z$, $\gamma_\varphi = 1/T_\varphi$, shrinks $\rho_{ge}$ at $\gamma_\varphi$ and leaves populations alone, so $1/T_2 = 1/(2T_1) + 1/T_\varphi$. At $T_1 = T_\varphi = 1$ the engine's decay rate is $1.5$, $T_2 = 0.6667$. The solved Lindblad equation equals the Chapter Q13 dephasing channel with $p = (1 - e^{-t/T_\varphi})/2$ (gap $0$)."
- Cap G/F "the equator arrow after $t = 0.5$: shortened by phase scrambling alone" · Stage `bb('Tphi')` · Claims `q24T2Tphi` 0.6667, `q24CohRate` 1.5, `q24DephKrausGap` 0.

### Unit `q24-bloch-eq` — Driving a qubit that decays
**b1 [B]** (the drive, p. 205, Eq. 12.3)
- G: "Now shine light on the qubit. The light pushes on the off-diagonal entry, and that entry pushes the populations. Decay pulls both back. Three coupled equations tell the whole story."
- F: "With $H = H_q + H_1$, $H_1 = -\mathcal E\begin{pmatrix}0 & d^*\\ d & 0\end{pmatrix}$ (electric-dipole coupling, no Stark shift) and (12.2), the Bloch equations (12.3a–c) give $\dot\rho_{gg}$, $\dot\rho_{ee}$ and $\dot\rho_{eg}$ with $T_1$, $T_2$ and the level gap $\omega_q$. Their sum $\dot\rho_{gg} + \dot\rho_{ee}$ is $0$."
- Cap G/F "the qubit under a drive: arrow, field and decay" · Stage `bb('Dr0')` · Claims `q24Bloch3Trace` 0.

**b2 [B] · notation beat, `introduces: ['qc-rabi-frequency', 'qc-detuning', 'qc-population-inversion']`** (RWA, pp. 205–206, Eq. 12.4; Bridge `qc-l12-driven`)
- G: "Near resonance, drop the terms that wiggle fast. Name the strength $\Omega$, the mismatch $\Delta = \omega - \omega_q$ and the inversion $w = \rho_{ee} - \rho_{gg}$. Spin Lab's <<qc-l12-driven|Unit L12.7>> did the lossless case."
- F: "The [[rotating-wave]] approximation keeps terms at $\omega - \omega_q$: with [[qc-rabi-frequency|$\Omega = d\mathcal E/\hbar$]], [[qc-detuning|$\Delta$]], [[qc-population-inversion|$w$]] and $\tilde\rho_{eg} = \rho_{eg}e^{i\omega t}$: $\dot w = -(1+w)/T_1 + i(\Omega\tilde\rho_{eg}^* - \Omega^*\tilde\rho_{eg})$ (12.4a), $\dot{\tilde\rho}_{eg} = (i\Delta - 1/T_2)\tilde\rho_{eg} - i\tfrac\Omega2w$ (12.4b). With $\omega_q = 40\,\Omega$ the RWA steady inversion is off by $0.87\%$ (full time-dependent Lindblad, no RWA)."
- Cap G/F "ground-state arrow, $w = -1$, drive switched on" · Stage `bb('Dr0')` · Claims `q24RwaRelErr` 0.0087.

**b3 [B]** (the steady state, p. 206, Eq. 12.5; Correction on 12.5b)
- G: "Wait long enough and drive and decay balance. On resonance the excited share is $s/(2(1+s))$, with $s = T_1T_2\Omega^2$. It never passes one half: steady light cannot invert a qubit."
- F: "$w = -\dfrac{1 + \Delta^2T_2^2}{1 + \Delta^2T_2^2 + T_1T_2|\Omega|^2}$ (12.5a), so $\rho_{ee} = \tfrac12(1+w)$. On resonance $\rho_{ee} = \tfrac12\,s/(1+s)$: $0.25$ at $s = 1$, $0.495$ at $s = 100$, always below $\tfrac12$. The coherence (12.5b) needs a sign fix: see Errata."
- Cap G/F "steady excited share against detuning for weak (low) and strong (high) drive" · Stage `PL(steadyLow vs steadyHigh)` · Claims `q24ReeRes1` 0.25, `q24ReeRes100` 0.495, `q24WssFig` −0.9950, `q24RtSSgap` 0.

**b4 [B]** (Fig. 12.3, p. 208: far from resonance)
- G: "Far off resonance the lossless solution rocks between 0 and about $\Omega^2/\Delta^2$, averaging $\Omega^2/2\Delta^2 = 0.0050$. With decay the settled value is half of that, $0.0025$. For a while the two agree."
- F: "Fig. 12.3 ($\Omega = 2\pi$, $\Delta = 20\pi$, $T_1 = 2.5$, $T_2 = 5$): the Schrödinger average is $\langle P_e\rangle = \tfrac12\Omega^2/(\Omega^2+\Delta^2) = 0.00495$; the Bloch steady value is $\rho_{ee} = 0.002488 \approx \Omega^2/4\Delta^2$, so the ratio is $1.990 \approx 2$. Averaged over $0 \le t \le 0.5$, $\rho_{ee} = 0.00470$; averaged over $30 \le t \le 40$, $0.002488$."
- Cap G/F "the steady point: a short arrow almost at the north pole" · Stage `bb('Fig123')` r = (≈ 0, ≈ 0, 0.995) · Claims `q24SchrAvg` 0.00495, `q24ReeSS` 0.002488, `q24SchrOverBloch` 1.990, `q24ReeAvgEarly` 0.00470, `q24ReeAvgLate` 0.002488.

**b5 [C]** (power broadening)
- Q G: "For weak drive the resonance curve is $2/T_2$ wide. If the drive is raised so that $s = 3$, how wide is it?" · Q F: "From (12.5a) find the full width at half height of $\rho_{ee}(\Delta)$ in units of $1/T_2$ for $s = 0$ and $s = 3$."
- Reveal G: "Twice as wide: $4/T_2$. Half height is at $\Delta T_2 = \sqrt{1+s}$, so a stronger drive blurs the resonance." · Reveal F: "Half height at $\Delta^2T_2^2 = 1 + s$: full width $2\sqrt{1+s}/T_2$, which is $2$ at $s = 0$ and $4$ at $s = 3$ (our calculation from 12.5a; the book does not state it)."
- Cap G/F "the two steady curves: the strong-drive one is twice as wide" · Stage `PL(steadyLow vs steadyHigh)` · Claims `q24FWHM0` 2, `q24FWHM3` 4.

### Unit `q24-rabi` — Pulses that flip, and gates from them
**b1 [B]** (no decay: two amplitudes, pp. 206–207, Eqs. 12.6–12.7, Fig. 12.2; D3; Bridges `qc-l12-driven`, `qc-l11-two-level`)
- G: "With no decay, two amplitudes tell the story. The drive turns one into the other. Spin Lab met this as magnetic resonance. Here the drive strength is $\Omega$, and Townsend's $\omega_1$ is $2\Omega$."
- F: "With $|\psi\rangle = c_g e^{-i\omega_gt}|g\rangle + c_ee^{-i\omega_et}|e\rangle$ and the RWA: $\dot c_g = \tfrac i2\Omega^*c_ee^{i\Delta t}$, $\dot c_e = \tfrac i2\Omega c_ge^{-i\Delta t}$ (12.6), solved by $\mathbf c(t) = U(t)\mathbf c(0)$ with $\Omega' = \sqrt{|\Omega|^2 + \Delta^2}$ (12.7). Engine $U$ against the ODE: gap $0$ (real and complex $\Omega$); Townsend's closed form (Eq. 4.45 of 448) agrees with $\omega_1 = 2\Omega$, gap $0$."
- Cap G/F "chance of $|e\rangle$ against $\Omega t/\pi$: on resonance it reaches 1 at 1, the π pulse" · Stage `PL(rabiFlip)` · Claims `q24U127Gap` 0, `q24TownsendGap` 0 · Derivation D3.

**b2 [B]** (the chances, p. 207, Eq. 12.8)
- G: "Start in $|g\rangle$. The chance of $|e\rangle$ is a sine squared, with a ceiling $\Omega^2/(\Omega^2+\Delta^2)$. For $\Omega = 2\pi$ the π pulse takes $0.5$. At $\Delta = 2\Omega$ the ceiling drops to $0.2$."
- F: "$P_e = \dfrac{|\Omega|^2}{\Omega'^2}\sin^2\dfrac{\Omega't}2$, $P_g = 1 - P_e$ (12.8). On resonance $t_\pi = \pi/\Omega = 0.5$ ($\Omega = 2\pi$); for $\Delta = 4\pi = 2\Omega$: ceiling $0.2$, $\Omega' = 14.05$ (Fig. 12.2's red curve); $P_e(0.25) = 0.5$ on resonance."
- Cap G/F "the same curve with a detuned drive: ceiling 0.2" · Stage `split(PL(rabiFlip) / PL(rabiFlipOff))` · Claims `q24Tpi` 0.5, `q24PeOff` 0.2, `q24OmPrimeOff` 14.05, `q24PeQuarter` 0.5.

**b3 [B]** (the 2π pulse, p. 207; Bridge `qc-l7-full-turn`)
- G: "A full $2\pi$ pulse brings the arrow home, but the state is $-|\psi\rangle$. A spin-½ turned through a full circle does the same (<<qc-l7-full-turn|Unit L7.2>>). Only $4\pi$ restores the sign."
- F: "On resonance $U(t = 2\pi/\Omega) = -I$ (engine gap $0$), $|\psi\rangle \to e^{i\pi}|\psi\rangle$, as $e^{-iJ_z\theta/\hbar}$ at $\theta = 2\pi$; $U(4\pi/\Omega) = +I$ (gap $0$). The phase is invisible alone and decisive in controlled gates."
- Cap G/F "a full turn about $x$: the arrow is back; the state's sign is $-1$ (stated, not drawn)" · Stage `bl('+z', rotate x 0→360)` · Claims `q24U2piGap` 0, `q24U4piGap` 0.

**b4 [B]** (X and Y gates, p. 209; **Correction C1**; Bridge `qc-q4-one-qubit-gates`)
- G: "At $\Delta = 0$ the drive's phase picks the axis. Real $\Omega$ turns about $x$, imaginary $\Omega$ about $y$. Our calculation finds the book's sign for $x$ is reversed: real positive $\Omega$ turns the arrow the other way."
- F: "At $\Delta = 0$: $U = \begin{pmatrix}\cos\tfrac\theta2 & i\tfrac{\Omega^*}{|\Omega|}\sin\tfrac\theta2\\ i\tfrac\Omega{|\Omega|}\sin\tfrac\theta2 & \cos\tfrac\theta2\end{pmatrix}$, $\theta = |\Omega|t$. Real $\Omega > 0$ gives $R_x(-\theta)$; $R_x(\theta)$ needs $\Omega < 0$. For imaginary $\Omega$ with $i\Omega > 0$ (as printed) the result is $R_y(\theta)$ (gap $0$). At $\theta = \pi/2$ the printed $R_x$ is $1.414$ from the engine's $U$."
- Cap G "a real positive drive: the arrow goes to $+y$, not $-y$" · F "$U(\Omega>0)$ equals $R_x(-90°)$: $|0\rangle \to |{+y}\rangle$" · Stage `bl('+z', rotate x 0→−90)` · Claims `q24SignRxPlus` 1.4142 (distance from $R_x(+\theta)$), `q24SignRxMinus` 0, `q24RyGap` 0, `q24RxNegGap` 0.

**b5 [B]** (composite pulses, p. 210; D4; P12.5 is cited, not worked)
- G: "A pulse that is a little too long or short rotates by $\pi(1+\epsilon)$. Four pulses in a row, $R_z(-\pi)R_x(\tfrac\pi2)R_y(\pi)R_x(\tfrac\pi2)$, equal a plain π pulse about $x$. With the same fractional error in each, the error is squared."
- F: "The sequence of p. 210 equals $R_x(\pi)$ exactly (engine gap $0$). With every angle scaled by $1+\epsilon$ the operator-norm error is $0.0157$ for the plain pulse and $0.000247$ for the composite at $\epsilon = 0.01$ (ratio $63.7$), $0.157$ against $0.0245$ at $\epsilon = 0.1$: $O(\epsilon)$ against $O(\epsilon^2)$ (the text's claim, p. 210); Problem 5 of §12.6 asks for the leading terms and is not worked here."
- Cap G/F "error against $\epsilon$ for the plain pulse and the four-pulse sequence, both axes logarithmic" · Stage `PL(pulseErr1 vs pulseErr2)` and `mat(product Rx(90), Ry(180), Rx(90))` · Claims `q24CompExact` 0, `q24ErrPlain01` 0.0157, `q24ErrComp01` 0.000247, `q24RatioEps01` 63.7, `q24ErrPlain10` 0.157, `q24ErrComp10` 0.0245.

**b6 [C]** (Z gates, p. 209)
- Q G: "Rabi pulses make $x$ and $y$ turns. How can you make a Z gate from them? How long does it take at $\Omega = 2\pi$?" · Q F: "Show $Z = iYX$ and give the time of two π pulses for $\Omega = 2\pi$."
- Reveal G: "Do $X$, then $Y$ (up to phase): $iYX = Z$. Two π pulses take $2 \times 0.5 = 1$. A far-detuned drive can also shift one level's phase without moving populations." · Reveal F: "$iYX = Z$ (engine gap $0$); each π pulse takes $t_\pi = \pi/\Omega = 0.5$, so $t = 1$. The book's other route is a strongly off-resonant shift that adds a relative phase."
- Cap G/F "two π pulses about $x$ then $y$: the product matrix" · Stage `mat(product Y, X)` · Claims `q24ZfromYX` 0, `q24ZTime` 1.

### Unit `q24-ramsey` — Two half-pulses and a wait
**b1 [B]** (the sequence, pp. 210–211, Fig. 12.4; D5; Bridge `qc-q3-bloch`)
- G: "Turn the qubit to the equator with a half pulse. Wait, so the arrow turns by an angle $\varphi$. Give another half pulse and read. The chance of $|1\rangle$ is $\cos^2(\varphi/2)$: 1, 0.75, 0.5, 0 at $0°$, $60°$, $90°$, $180°$."
- F: "$R_y(\tfrac\pi2)\,\mathrm{diag}(1, e^{i\varphi})\,R_y(\tfrac\pi2)|0\rangle = e^{i\varphi/2}(-i\sin\tfrac\varphi2,\ \cos\tfrac\varphi2)^T$, so $P(1) = \cos^2(\varphi/2)$; the engine agrees with $\cos^2(\varphi/2)$ over $0 \le \varphi \le 7$ (gap $0$). Ramsey interference is the heart of atomic clocks (p. 211)."
- Cap G/F "three snapshots: after the first half pulse, after the wait by 60°, after the second half pulse" · Stage `bl('+z', rotate y 0→90)` / `bl({90°, 60°})` / `bl({90°, 60°}, rotate y 0→90)` · Claims `q24RamseyP1_0` 1, `q24RamseyP1_60` 0.75, `q24RamseyP1_90` 0.5, `q24RamseyP1_180` 0, `q24RamseyGap` 0 · Derivation D5.

**b2 [B]** (a qubit as a spinning magnet, pp. 211–213, Eqs. 12.9–12.10; Bridge `qc-q8-ball`)
- G: "With a drive $\Omega$ and a small shift $\delta$ the qubit sits in a field $B = (\Omega, 0, \delta)$. The arrow $M$ turns about $B$ like a compass needle: $dM/dt = B \times M$. For $\Omega = 1$, $\delta = 0.8$ the axis tilts $38.7°$ from $x$."
- F: "$H = \tfrac\hbar2(\Omega\sigma_x + \delta\sigma_z)$, eigenvalues $\pm\hbar\Omega'/2$ with $\Omega' = \sqrt{\Omega^2+\delta^2}$ (12.9). For $\rho = (I + \mathbf M\cdot\sigma)/2$, $\dot\rho = \tfrac i\hbar[\rho, H]$ gives $\dot{\mathbf M} = \mathbf B\times\mathbf M$ (12.10); engine gap to the density-matrix evolution $0$. Tilt $\xi = \tan^{-1}(\delta/\Omega) = 38.66°$, $|\mathbf B| = 1.281$."
- Cap G/F "the arrow turning about the tilted axis" · Stage `bl('+z', rotate about {θ=51.3°, φ=0} 0→360)` · Claims `q24TiltDeg` 38.66, `q24OmPrimeNoise` 1.281, `q24PrecessGap` 0.

**b3 [B]** (noise along the axis, pp. 213–214, Eq. 12.11; D6)
- G: "If the noise only changes the field's strength, the arrow's height stays and its sideways part turns by a random angle. Averaged, the sideways part shrinks by $e^{-\sigma^2/2}$: $0.607$ at $\sigma = 1$, $0.135$ at $\sigma = 2$."
- F: "For $\mathbf b\parallel\mathbf B_0$: $M_\parallel$ is constant and $M_+ = M_x + iM_y$ obeys $\dot M_+ = iBM_+$, $M_+(t) = e^{i\varphi}M_+(0)$ with $\varphi = B_0t + \chi$ (12.11). For Gaussian $\chi$ of rms $\sigma$, $\langle e^{i\chi}\rangle = e^{-\sigma^2/2}$ (quadrature and closed form agree); it equals $e^{-1}$ at $\sigma = \sqrt2$ ($0.3679$)."
- Cap G/F "the equator arrow shrinking: lengths 1, 0.607, 0.135" · Stage `bb('Gauss')` r = (0.6065, 0, 0) · Claims `q24Gauss1` 0.6065, `q24Gauss2` 0.1353, `q24GaussE` 0.3679 · Derivation D6.

**b4 [B]** (T₂*, p. 215, Eq. 12.12; our OU model)
- G: "The phase variance grows by (correlation area) $\times\, t$ when the noise forgets itself quickly, and as $t^2$ when it hardly changes. Fast noise gives an exponential, $T_2^* = 1/(\sigma^2\tau_c)$; slow noise a bell curve, $T_2^* = \sqrt2/\sigma$."
- F: "Take noise of rms $\sigma$ and correlation time $\tau_c$: $\langle\chi^2\rangle = 2\sigma^2\tau_c^2(t/\tau_c - 1 + e^{-t/\tau_c})$ (quadrature and closed form agree: gap $0$). For $t \gg \tau_c$ this is $t\times$ the area $2\sigma^2\tau_c$, the form behind $T_2^* = 1/\pi|\tilde b(0)|^2$ (12.12: Bergou's $2\pi|\tilde b(0)|^2$ is that area); for $t \ll \tau_c$ it is $\sigma^2t^2$. At $\sigma = 1$: $T_2^* = 10.1$ ($\tau_c = 0.1$), $1.448$ ($\tau_c = 10$), limits $10$ and $\sqrt2 = 1.414$."
- Cap G/F "slow noise (fast fall, bell-shaped) against fast noise (slow fall, exponential)" · Stage `PL(ouSlow vs ouFast)` · Claims `q24T2starFast` 10.1, `q24T2starSlow` 1.448, `q24T2starStatic` 1.414, `q24T2starWhite` 10, `q24OuVarGap` 0.

**b5 [C]** (when is the exponential wrong?)
- Q G: "Noise of size 1 with correlation time 1. Is $T_2^*$ closer to the fast-noise value 1 or the slow-noise value $\sqrt2$?" · Q F: "Find the $1/e$ time of the noise-averaged coherence for $\sigma = \tau_c = 1$ and compare with $1/(\sigma^2\tau_c)$ and $\sqrt2/\sigma$."
- Reveal G: "It is $1.841$, longer than both. The shortcut $1/(\sigma^2\tau_c) = 1$ holds only if the noise forgets much faster than the qubit decays." · Reveal F: "$T_2^* = 1.841$ (root of $\sigma^2\tau_c^2(t/\tau_c - 1 + e^{-t/\tau_c}) = 1$), against $1$ and $1.414$: (12.12) is the short-correlation limit and fails for $\tau_c \sim T_2^*$, which is why the book calls the $1/f$ case ambiguous (p. 215)."
- Cap G/F "a middle case between the two curves" · Stage `PL(ouSlow vs ouFast)` (marker at 1.84) · Claims `q24T2starMid` 1.841.

### Unit `q24-decoupling` — Undoing slow noise with flips
**b1 [B]** (the echo, p. 216; D7; Bridge `qc-q21-dfs`)
- G: "Wait $\tau$, flip with a π pulse, wait $\tau$, flip back. A fixed frequency error adds a phase in the first wait and the opposite phase in the second. They cancel exactly for every error size."
- F: "$\varphi(2\tau) = \int_\tau^{2\tau}\Delta(t')dt' - \int_0^\tau\Delta(t')dt'$ (p. 216): zero for static $\Delta$. The engine's $X\,e^{-i\delta\tau Z/2}\,X\,e^{-i\delta\tau Z/2}$ equals $-I$ (the two flips' sign) for $0 \le \delta \le 10$ (gap $0$). It is a temporal analogue of the decoherence-free subspace of Unit 21.7."
- Cap G/F "the arrow after the wait, the flip and the second wait: back at the start" · Stage `bl({90°, 60°}, rotate x 0→180)` · Claims `q24EchoGap` 0 · Derivation D7.

**b2 [B]** (how slow must the noise be? pp. 215–216)
- G: "Over the same total time 2, noise of size 1 and correlation 10 leaves 0.154 of the Ramsey signal but 0.940 with the echo. For noise with correlation 0.1 neither helps: 0.827 and 0.844."
- F: "With the OU variance, the echo phase variance is $\sigma^2[4\tau_c^2(\tau/\tau_c - 1 + e^{-\tau/\tau_c}) - 2\tau_c^2(1 - e^{-\tau/\tau_c})^2]$ (quadrature and closed form agree: gap $0$). At $\tau = 1$: $\tau_c = 10$: $0.940$ against Ramsey $0.154$; $\tau_c = 0.1$: $0.844$ against $0.827$. The echo helps when the noise is stationary on the scale $\tau$ (p. 216)."
- Cap G/F "Ramsey signal (falling fast) and echo signal (staying high) against total time, slow noise" · Stage `PL(ouSlow vs echoOuSlow)` · Claims `q24EchoCoh10` 0.940, `q24RamseyCoh10` 0.154, `q24EchoCoh01` 0.844, `q24RamseyCoh01` 0.827, `q24EchoVarGap` 0.

**b3 [B]** (imperfect pulses, p. 216)
- G: "Real π pulses are a little off, say by 1 %. Twenty flips in the same direction add up to a $36°$ error; the chance of $|0\rangle$ falls to 0.9045. Flipping $+X$, $-X$ alternately cancels it: 1.0000."
- F: "$X$ pulses of area $\pi(1+\epsilon)$, $\epsilon = 0.01$: $2N = 20$ in the same sense give $R_x(20\pi\epsilon + 20\pi)$, an error of $0.2\pi = 36°$ and $P(0) = \cos^2(18°) = 0.9045$. The sequence $X, -X, X, -X, \ldots$ multiplies pairs $R_x(\theta)R_x(-\theta) = I$ and returns $P(0) = 1$ (p. 216). Problem 7's refocusing of an Ising coupling is cited, not worked."
- Cap G/F "the same-direction error, 36° from the north pole" · Stage `bl('+z', rotate x 0→36)` · Claims `q24AccumDeg` 36, `q24PlainPulses` 0.9045, `q24AltPulses` 1.

### 1.7 Claim ledger (key — engine call — value; numpy in `planQ24Q25-numpy.py`; every `…Gap` key is an engine max-abs difference, value 0)
- divincenzo: `q24Criteria/CritCompute/CritNet/Platforms` 7, 5, 2, 5 · `q24GatesPerT2` 1000 · `q24SurviveGate/All` 0.9990, 0.3679.
- lindblad: `q24KrausGapRatio` 4 · `q24TraceRate` 0 · `lindbladSolve` at $t = 1$: `q24ExcT1` 0.1839, `q24CohT1` 0.3033, `q24RT1x/z` 0.6065, 0.6321, `q24PurT1` 0.8837 · `q24PopFactorT1` 0.3679, `q24CohFactorT1` 0.6065, `q24CohFactor2T1` 0.3679, `q24T2OverT1` 2 · `q24MinEig2/3/At` 0, −0.0096, 3.17 · `q24T2Tphi` 0.6667, `q24CohRate` 1.5, `q24DephKrausGap` 0.
- bloch-eq: `q24Bloch3Trace` 0 · `q24RwaRelErr` 0.0087 · `q24ReeRes1/100` 0.25, 0.495 · `q24WssFig` −0.9950 · `q24RtSSgap` 0 · `q24RtRe` −0.348, `q24FullGapDerived` 0.0005, `q24FullGapPrinted` 0.696 · `q24SchrAvg` 0.00495 · `q24ReeSS` 0.002488 · `q24SchrOverBloch` 1.990 · `q24ReeAvgEarly/Late` 0.00470, 0.002488 · `q24FWHM0/3` 2, 4.
- rabi: `q24U127Gap`, `q24TownsendGap` 0 · `q24Tpi` 0.5, `q24PeOff` 0.2, `q24OmPrimeOff` 14.05, `q24PeQuarter` 0.5 · `q24U2piGap/U4piGap` 0 · `q24SignRxPlus` 1.4142, `q24SignRxMinus` 0, `q24RyGap`, `q24RxNegGap` 0 · `q24CompExact` 0, `q24ErrPlain01/Comp01` 0.0157, 0.000247, `q24RatioEps01` 63.7, `q24ErrPlain10/Comp10` 0.157, 0.0245 · `q24ZfromYX` 0, `q24ZTime` 1.
- ramsey: `q24RamseyP1_0/60/90/180` 1, 0.75, 0.5, 0 · `q24RamseyGap` 0 · `q24TiltDeg` 38.66, `q24OmPrimeNoise` 1.281, `q24PrecessGap` 0 · `q24Gauss1/2/E` 0.6065, 0.1353, 0.3679 · `q24T2starFast/Slow/Static/White` 10.1, 1.448, 1.414, 10 · `q24OuVarGap` 0 · `q24T2starMid` 1.841.
- decoupling: `q24EchoGap` 0 · `q24EchoCoh10/RamseyCoh10` 0.940, 0.154 · `q24EchoCoh01/RamseyCoh01` 0.844, 0.827 · `q24EchoVarGap` 0 · `q24AccumDeg` 36, `q24PlainPulses` 0.9045, `q24AltPulses` 1.

## 2. Derivations (step `tex` — why — **view**; a step without a view keeps the last; Ground ≥ Formal; ≥ 2 views each)
**D1 · lindblad:b2 · `\dot\rho = -\tfrac i\hbar[H,\rho] + \sum_j\bigl(L_j\rho L_j^\dagger - \tfrac12L_j^\dagger L_j\rho - \tfrac12\rho L_j^\dagger L_j\bigr)`** — G (4): (1) $\rho + \delta\rho = A_0\rho A_0^\dagger + \sum_jA_j\rho A_j^\dagger$, $A_0 = I + L_0\delta t$ · **bb(0)** · (2) first order: $\dot\rho = L_0\rho + \rho L_0^\dagger + \sum_jL_j\rho L_j^\dagger$ · (3) $\operatorname{Tr}\dot\rho = 0$ needs $L_0 + L_0^\dagger = -\sum_jL_j^\dagger L_j$ · **bb(dt)** · (4) take $L_0 = -iH/\hbar - \tfrac12\sum_jL_j^\dagger L_j$ and insert. F (3): (1) the step and its first order · **bb(0)** · (2) trace condition and $L_0$ · **bb(dt)** · (3) result.
**D2 · lindblad:b4 · `T_1 = 1/\gamma,\ T_2 = 2/\gamma`** — G (3): (1) $\dot\rho_{ee} = -\gamma\rho_{ee}$, so $\rho_{ee} \propto e^{-\gamma t}$ · **PL(popDecay)** · (2) $c_e \propto e^{-\gamma t/2}$, so $\rho_{ge} = c_gc_e^* \propto e^{-\gamma t/2}$ · **PL(popDecay vs cohDecay)** · (3) the $1/e$ times are $T_1 = 1/\gamma$ and $T_2 = 2/\gamma$. F (2): (1) (12.2) entries · **PL(pop)** · (2) result · **PL(pop vs coh)**.
**D3 · rabi:b1 · `P_e = \tfrac{|\Omega|^2}{\Omega'^2}\sin^2\tfrac{\Omega't}2`** — G (4): (1) a frame turning at $\Delta/2$ makes the equations constant · **PL(rabiFlip)** · (2) they are a spin in the field $(\Omega, 0, \Delta)$: tilt $\xi$, $\sin\xi = |\Omega|/\Omega'$ · **bl(rotate about the tilted axis)** · (3) the arrow turns by $\Omega't$ about it; from the north pole its height gives $\sin^2\xi\sin^2(\Omega't/2)$ · **PL(rabiFlipOff)** · (4) $\sin^2\xi = |\Omega|^2/\Omega'^2$. F (3): (1) frame and field $\mathbf B = (\Omega, 0, \Delta)$ · **bl** · (2) rotation by $\Omega't$ · (3) result · **PL(rabiFlipOff)**.
**D4 · rabi:b5 · `R_z(-\pi)R_x(\tfrac\pi2)R_y(\pi)R_x(\tfrac\pi2) = R_x(\pi)`** — G (4): (1) $R_y(\pi) = -iY$ · **mat(Y)** · (2) $(I - iX)Y(I - iX)/2 = Y$ since $XY + YX = 0$ and $XYX = -Y$ · (3) so the three middle pulses give $-iY$ · **mat(product Rx90, Ry180, Rx90)** · (4) $R_z(-\pi) = iZ$ and $iZ(-iY) = ZY = -iX = R_x(\pi)$. F (3): (1) sandwich identity · **mat(Rx90 Ry180 Rx90)** · (2) $R_z(-\pi) = iZ$ · (3) $ZY = -iX$ · **mat(all four)**.
**D5 · ramsey:b1 · `P(1) = \cos^2(\varphi/2)`** — G (3): (1) half pulse: $(|0\rangle + |1\rangle)/\sqrt2$ · **bl(rotate y)** · (2) wait: $(|0\rangle + e^{i\varphi}|1\rangle)/\sqrt2$ · **bl(60°)** · (3) second half pulse: amplitude of $|1\rangle$ is $(1 + e^{i\varphi})/2$, size $\cos(\varphi/2)$ · **bl(rotate y)**. F (2): (1) the two states · **bl(60°)** · (2) $R_y(\tfrac\pi2)$ result · **bl(final)**.
**D6 · ramsey:b3 · `\langle e^{i\chi}\rangle = e^{-\sigma^2/2}`** — G (3): (1) the sine part averages to 0, leaving $\langle\cos\chi\rangle$ · **bb(Gauss)** · (2) complete the square: $-\tfrac{\chi^2}{2\sigma^2} + i\chi = -\tfrac{(\chi - i\sigma^2)^2}{2\sigma^2} - \tfrac{\sigma^2}2$ · **PL(ouSlow)** · (3) the leftover Gaussian integrates to 1. F (2): (1) the exponent · **PL** · (2) result · **bb**.
**D7 · decoupling:b1 · `\varphi(2\tau) = \int_\tau^{2\tau}\Delta\,dt' - \int_0^\tau\Delta\,dt' = 0`** — G (3): (1) first wait: $|1\rangle$ gains $e^{-i\Phi_1}$ · **bl(60°)** · (2) the flip swaps the parts; the second wait puts $e^{-i\Phi_2}$ on the other one · (3) the second flip restores them: net phase $\Phi_2 - \Phi_1 = 0$ for a fixed $\Delta$ · **PL(ouSlow vs echoOuSlow)**. F (2): (1) states after $\tau$ and $2\tau$ (p. 216) · **bl** · (2) result · **PL**.
**viewCaptions:** D1 "one short step: shorter, tilted arrow" / "the same, after the trace condition" · D2 "population left" / "population and phase left" · D3 "chance of $|e\rangle$ on resonance" / "the field's tilt and the turning arrow" / "off resonance: ceiling 0.2" · D4 "$Y$ and the three middle pulses" / "the four pulses: $R_x(\pi)$" · D5 "equator after the half pulse" / "after the wait" / "after the second half pulse" · D6 "the shrinking arrow" / "slow noise: Gaussian curve" · D7 "after the first wait" / "Ramsey and echo against time".

## 3. Try-it widgets (props read from `BlochSphere.tsx`, `AmplitudeBars.tsx`, `PhaseDial.tsx`; the builder re-reads every readout wording in `Q24.tryits.test.tsx`)
| Unit | Spec | Try this |
|---|---|---|
| divincenzo | `bloch {theta:0, phi:0, measure:'z'}` | The table reads ⟨Sz⟩ = 0.5 ħ and the bar "+z 100 %": the fiducial state $|0\rangle$ of criterion two. Drag θ to 180°: ⟨Sz⟩ = −0.5 ħ, the other pole. |
| lindblad | `bloch {theta:90, phi:0, measure:'x'}` | ⟨Sx⟩ = 0.5 ħ: the equator state has the largest possible coherence. Decay shortens this arrow (here it cannot: the widget draws pure states only). |
| bloch-eq | `amplitude-bars {state:'+x', basis:'z'}` | The z bars are equal (0.5 and 0.5); change φ and they do not move: detuning turns the phase, not the populations. |
| rabi | `bloch {theta:0, phi:0}` | Drag θ to 90°: $|\alpha|^2, |\beta|^2$ read 0.5, 0.5 (half a π pulse); to 180°: 0, 1 (a π pulse). |
| ramsey | `bloch {theta:90, phi:0, measure:'x', rotations:true, rotationAngles:[60,90,180]}` | Press $R_z(60°)$: the x bar reads 75 %; from φ = 0 again $R_z(90°)$: 50 %; $R_z(180°)$: 0 %. This is $\cos^2(\varphi/2)$ after the second half pulse. |
| decoupling | `phase-dial {theta:0, rotations:true}` | Press $R_z(90°)$ then $R_z(-90°)$: the azimuth is back at 0°, which is what the second half of an echo does to the first. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0; full walkthroughs: no sheet assigns any of these; hints = nudge / key idea / setup)
- **divincenzo** 1 warm-up numeric `q24-d-n` gates per $T_2$ for $t_{\rm gate} = 2\,\mu s$, $T_2 = 1\,ms$ → **500** (int). 2 core numeric `q24-d-keep` coherence left after 100 gates of $1\,\mu s$ with $T_2 = 1\,ms$ → **0.9048**. 3 core choice `q24-d-fly` "which criteria serve a network" → **interconverting and transmitting flying qubits** ✓.
- **lindblad** 1 warm-up numeric `q24-l-t2` $T_2$ for $T_1 = 5$ and no extra dephasing → **10** (int). 2 core numeric `q24-l-ee` excited share at $t = 2T_1$ from $|{+x}\rangle$ → **0.0677**. 3 core numeric `q24-l-tphi` $T_2$ for $T_1 = 2$, $T_\varphi = 3$ → **1.714**.
- **bloch-eq** 1 warm-up numeric `q24-b-res` on-resonance steady $\rho_{ee}$ at $s = 3$ → **0.375**. 2 core numeric `q24-b-width` full width in units of $1/T_2$ at $s = 8$ → **6** (int). 3 core choice `q24-b-inv` "keep driving a decaying qubit" → **it settles below half excited** ✓ (`q24ReeRes100`).
- **rabi** 1 warm-up numeric `q24-r-tpi` π-pulse time for $\Omega = 4$ → **0.785**. 2 core numeric `q24-r-ceil` ceiling of $P_e$ at $\Delta = \Omega$ → **0.5**. 3 core choice `q24-r-sign` "real positive $\Omega$, $\Delta = 0$, $\theta = 90°$ gives" → **$R_x(-90°)$** ✓ (`q24SignRxMinus`).
- **ramsey** 1 warm-up numeric `q24-m-p1` $P(1)$ at $\varphi = 120°$ → **0.25**. 2 core numeric `q24-m-tilt` field tilt for $\Omega = 2$, $\delta = 1.5$, degrees → **36.87**. 3 core numeric `q24-m-gauss` $\langle e^{i\chi}\rangle$ for $\sigma = 1.5$ → **0.3247**.
- **decoupling** 1 warm-up numeric `q24-e-err` error angle after 30 same-direction π pulses each 0.5 % too large, degrees → **27** (int). 2 core choice `q24-e-alt` "which pulse train cancels the area error" → **alternate $+X$ and $-X$** ✓ (`q24AltPulses`). 3 stretch numeric `q24-e-coh` echo coherence for $\sigma = 1$, $\tau_c = 10$, $\tau = 2$ → **0.6311** (Ramsey over the same 4: 0.0009).

## 5. Glossary (new in 709; checked against `ids.json`: no duplicate id or term; `rotating-wave`, `schrodinger-equation`, `qc-amplitude-damping`, `qc-kraus-operator`, `qc-bloch-ball`, `qc-von-neumann-equation`, `qc-rotation-operator`, `qc-precession`, `qc-collective-dephasing` are reused, not redefined)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-divincenzo-criteria` | DiVincenzo criteria | — | The seven things a physical system must do to serve as a quantum computer or network. | Scalable well-characterised qubits; initialisation; qubit-specific measurement; long coherence; universal gates; and, for networks, flying-qubit interconversion and transmission (Bergou p. 201). | divincenzo:b1 | — |
| `qc-lindblad-operator` | Lindblad operator $L_j$ | notation | A small jump the environment makes the qubit take. | $L_j$ in $A_j = L_j\sqrt{\delta t}$ and in the master equation (12.1). | lindblad:b1 | `qc-q13-from-unitary` |
| `qc-lindblad-equation` | Lindblad equation | — | The equation for how an open qubit's state changes: the usual turning plus the jumps. | $\dot\rho = -\tfrac i\hbar[H,\rho] + \sum_j(L_j\rho L_j^\dagger - \tfrac12\{L_j^\dagger L_j,\rho\})$ (p. 203). | lindblad:b2 | `qc-l11-schrodinger` |
| `qc-t1` | $T_1$ | — | The time for the excited share to fall to 1/e. | Longitudinal relaxation time; $1/\gamma$ for decay at rate $\gamma$ (p. 205). | lindblad:b4 | — |
| `qc-t2` | $T_2$ | — | The time for the phase signal to fall to 1/e. | Transverse relaxation time; $T_2 = 2T_1$ for pure decay, $T_2 \le 2T_1$ always (p. 205). | lindblad:b4 | — |
| `qc-dephasing` | dephasing | — | Loss of phase without loss of population. | $\rho_{ge} \to e^{-t/T_\varphi}\rho_{ge}$ with populations fixed; $1/T_2 = 1/2T_1 + 1/T_\varphi$. | lindblad:b6 | `qc-q13-depolarizing` |
| `qc-rabi-frequency` | Rabi frequency $\Omega$ | notation | How fast the drive turns the qubit between the two states. | $\Omega = d\mathcal E/\hbar$, complex; $\Omega' = \sqrt{|\Omega|^2 + \Delta^2}$ (12.7). | bloch-eq:b2 | `qc-l12-driven` |
| `qc-detuning` | detuning $\Delta$ | notation | How far the drive's frequency is from the qubit's. | $\Delta = \omega - \omega_q$. | bloch-eq:b2 | — |
| `qc-population-inversion` | inversion $w$ | notation | Excited share minus ground share. | $w = \rho_{ee} - \rho_{gg}$; $w = -r_z$ (12.4). | bloch-eq:b2 | — |
| `qc-rabi-oscillation` | Rabi oscillation | — | The excited share rising and falling under a steady drive. | $P_e = \tfrac{|\Omega|^2}{\Omega'^2}\sin^2\tfrac{\Omega't}2$ (12.8). | rabi:b1 | `qc-l12-driven` |
| `qc-pi-pulse` | π pulse | — | A drive just long enough to flip the qubit. | $t_\pi = \pi/|\Omega|$; $U = -iX$ on resonance (p. 207). | rabi:b2 | — |
| `qc-composite-pulse` | composite pulse | — | Several pulses that together cancel a size error. | A sequence whose error is $O(\epsilon^2)$ where the single pulse's is $O(\epsilon)$ (p. 210). | rabi:b5 | — |
| `qc-ramsey-interferometry` | Ramsey interferometry | — | Two half pulses with a wait: a way to read a qubit's phase. | $R_y(\tfrac\pi2)\,e^{-i\varphi Z/2}R_y(\tfrac\pi2)$; $P(1) = \cos^2(\varphi/2)$ (Fig. 12.4). | ramsey:b1 | `qc-q3-bloch` |
| `qc-t2-star` | $T_2^*$ | — | The phase lifetime when the noise is not undone. | The $1/e$ time of the noise-averaged coherence (inhomogeneous); $T_2 \ge T_2^*$ (p. 211). | ramsey:b4 | — |
| `qc-spin-echo` | spin echo | — | A flip halfway through the wait that makes slow phase errors cancel. | $\tau\,X\,\tau\,X$: the phases of the two halves subtract (p. 216). | decoupling:b1 | `qc-q21-dfs` |

## 6. Review cards
- **divincenzo** G: five criteria for a computer, two more for a network; the key ratio is coherence time over gate time. F: the seven criteria; $T_2/t_{\rm gate}$. Eq $N = T_2/t_{\rm gate}$. Trap: "coherence time alone is the measure".
- **lindblad** G: jumps shorten the arrow; $T_2 = 2T_1$ without extra noise. F: Eq. 12.1 to Lindblad form; (12.2). Eq $T_1 = 1/\gamma,\ T_2 = 2T_1$. Trap: "$T_2$ can exceed $2T_1$".
- **bloch-eq** G: drive and decay balance; steady light never inverts. F: (12.4), (12.5a), RWA. Eq $\rho_{ee} = \tfrac12 s/(1+s)$ on resonance. Trap: "a strong enough drive fully excites the qubit".
- **rabi** G: $\sin^2$ with ceiling $\Omega^2/\Omega'^2$; phase of $\Omega$ picks the axis. F: (12.7)–(12.8), Correction C1. Eq $t_\pi = \pi/\Omega$. Trap: a real positive drive is $R_x(+\theta)$ (it is $R_x(-\theta)$).
- **ramsey** G: half pulse, wait, half pulse; noise shrinks the arrow. F: (12.9)–(12.12). Eq $P(1) = \cos^2(\varphi/2)$. Trap: "faster noise always decays the qubit faster".
- **decoupling** G: a flip makes slow noise cancel; alternate the flips. F: p. 216 phase integral. Eq $\varphi(2\tau) = 0$. Trap: "the echo cancels any noise".

## 7. Symbol-before-use
**7.1 Ground:** $\rho$, $\gamma$, $L_j$ lindblad:b1–b3 · $T_1$, $T_2$ b4 · $T_\varphi$ b6 · $\Omega$, $\Delta$, $w$ bloch-eq:b2 · $s$ b3 · $\Omega'$, $P_e$ rabi:b1–b2 · $\theta$, $\epsilon$ rabi:b4–b5 · $\varphi$ ramsey:b1 · $B$, $M$ b2 · $\chi$, $\sigma$ b3 · $\tau_c$ b4 · $\tau$ decoupling:b1. **FLAGS:** $\Omega$ is Bergou's (Townsend's $\omega_1 = 2\Omega$); $\sigma$ is a noise rms, not a Pauli matrix: Pauli letters are written $X, Y, Z$ in the Ground track.
**7.2 Formal:** adds $\tilde\rho_{eg}$, $A_j$, $\hbar$ lindblad:b1, bloch-eq:b2 · $\xi$, $\Omega'$ ramsey:b2 · $\sigma_x, \sigma_z$ ramsey:b2 · $\langle\cdot\rangle$ b3 · $\operatorname{Tr}$, $[\cdot,\cdot]$ lindblad:b2. Counts: 0 used before definition in either track (to confirm by the symbols test).

## 8. Errata (Correction boxes: two, both with an engine check; every equation 12.1–12.12 re-derived or re-run; page images PDF pp. 213 and 216 read)
- **C1 · Bergou p. 209, §12.4.1** (map B31, now confirmed on the page image). `where` "Bergou p. 209, the $R_x$ line" · `says` "With $\Omega$ real and positive and $t = \theta/|\Omega|$ the evolution is $R_x(\theta)$, with $-i\sin(\theta/2)$ off the diagonal." · `shouldSay` "Our calculation finds that Eq. (12.7) at $\Delta = 0$ with $\Omega$ real and positive has $+i\sin(\theta/2)$ off the diagonal, which is $R_x(-\theta)$ (at $\theta = \pi/2$ it is $1.414$ from $R_x(\theta)$); $R_x(\theta)$ needs $\Omega$ real and negative. The $R_y$ case, $i\Omega > 0$, is right." · `check` `rabiU(1, 0, π/2)` equals `Rx(−π/2)` to 1e-12 and not `Rx(π/2)` (`q24SignRxMinus` 0, `q24SignRxPlus` 1.4142).
- **C2 · Bergou p. 206, Eq. (12.5b), NEW (not in the map's B-list).** `says` "$\tilde\rho_{eg} = -iw\,\dfrac{\Omega T_2}{2}\,\dfrac{1 - i\Delta T_2}{1 + \Delta^2T_2^2}$." · `shouldSay` "Our calculation finds the sign of the imaginary part reversed: setting the derivatives of (12.4) to zero gives $\tilde\rho_{eg} = -iw\,\dfrac{\Omega T_2}2\,\dfrac{1 + i\Delta T_2}{1 + \Delta^2T_2^2}$. At $\Omega = 1$, $\Delta = 0.7$, $T_1 = 4$, $T_2 = 8$ the real part is $-0.348$, not $+0.348$; a full time-dependent Lindblad integration without the RWA (qubit frequency 40) differs from ours by $0.0005$ and from the printed form by $0.696$." · `check` `blochSteady(1, 0.7, 4, 8)` real part $= -0.348$ and not $+0.348$, and the no-RWA `lindbladRk4` steady $\tilde\rho_{eg}$ is closer to the corrected form (`q24RtRe` −0.348, `q24FullGapDerived` 0.0005, `q24FullGapPrinted` 0.696). (12.4b) and (12.5a) are right; the page image (PDF p. 213) shows the printed $1 - i\Delta T_2$.
- **Checked, no box:** (12.1)–(12.2) and the Lindblad form · (12.3) trace · (12.4a, b) and (12.5a) · (12.6)–(12.8), Fig. 12.2's two curves (ceilings 1 and 0.2) · $R_y$ in §12.4.1 · the composite identity and its $O(\epsilon^2)$ claim (p. 210; holds for every angle scaled by $1+\epsilon$, and for an equal area error $\epsilon$ on each pulse, whose $R_z(-\pi)$ is then area $\pi + \epsilon$) · Ramsey result · (12.9)–(12.11) · $\langle e^{i\chi}\rangle = e^{-\sigma^2/2}$ · the echo phase integral · the "twice smaller" steady value on p. 208 (ratio 1.990).
- **Carried, not boxed:** map B32 (p. 214, $\sigma^2 = \langle\chi^2\rangle$ wording) is a prose slip with no engine check: dropped. (12.12): Bergou's $\tilde b(0)$ convention is not defined on the page; the plan writes the area $2\sigma^2\tau_c$ and says only that Bergou's $2\pi|\tilde b(0)|^2$ is that area (builder confirms on the PDF p. 222 image).

## 9. Engine gaps and stage contracts
**9.1 Engine** (new `physics/qc/blocheq.ts`, `physics/qc/pulses.ts`; numpy block "q24" in `make_qc_fixtures.py`, twins `pipeline/claims_qc709/q24.py`; tests beside each; **neither is imported by the first-paint closure** (rule (l), 0.8 KB headroom): only `Q24.values.ts`, tests and the lazy `plot` chunk read them):
`blocheq.ts` — `expmGeneral(A)` (complex, ≤ 4×4, scaling and squaring) · `lindbladRhs(rho, H, Ls)`, `lindbladSolve(rho0, H, Ls, t)` (exponential of the 4×4 superoperator), `krausStep(rho, L0, Ls, dt)`, `blochOf(rho)`, `rhoOfBloch(r)`, `positiveGap(T1, T2, r0)` → {minEig(t) over a grid} · `blochRhs`, `integrateBloch(state, {Ω, Δ, T1, T2}, t)` (RK4, Eqs. 12.4), `blochSteady(Ω, Δ, T1, T2)` → {w, rhoTilde} (the linear solve of 12.4), `steadyExcited(x, s)`, `qubitJump(gamma)`, `lindbladRk4(rho0, Ht, Ls, t, steps)` (time-dependent $H$, RK4: the no-RWA reference for `q24RwaRelErr` and C2; ≈ 60 000 steps).
`pulses.ts` — `rabiU(Ω, Δ, t)` (Eq. 12.7 as printed, complex Ω), `rabiPe(Ω, Δ, t)`, `compositeU(eps, mode)`, `pulseError(eps)` (operator 2-norm via `svd`), `ramseyP1(phi)`, `precessM(B, M0, t)` and `crossIntegrate(B, M0, t)` · `gaussianCoherence(sigma)` (quadrature), `ouVariance(t, σ, τc)`, `ouCoherence`, `t2star(σ, τc)` (bisection on the 1/e point), `echoVariance(τ, σ, τc)`, `echoCoherence`, `echoSequence(δ, τ)`, `pulseTrainP0(eps, N, alternate)` · `divincenzo()` (the seven, flag compute/network).
Reused: `rabiProbability`, `rabiFlipTime`, `amplitudeDamping`, `dephasing`, `applyKraus`, `evolveRho`, `svd`, `Rx`, `Ry`, `Rz`, `X`, `Y`, `Z`.
Cross-checks: `lindbladRk4` steady state against `blochSteady` (differ by the RWA error only) · `rabiU` against RK4 of 12.6 (real and complex $\Omega$) · `rabiPe` against `rabiProbability(…, ω₁ = 2Ω)` · `lindbladSolve` against `krausStep` iterates and against `dephasing` + `amplitudeDamping` composed · `integrateBloch` to long time against `blochSteady` · `precessM` against `crossIntegrate` · `ouVariance` against double quadrature · `echoVariance` against quadrature · `compositeU(0)` against `Rx(π)`.
**9.2 Stage.** **No new kind.** Existing kinds carry every picture: `bloch` (rotate about an axis incl. tilted, two states per derivation), `bloch-ball` (`point: {r: [x, y, z]}` from engine values), `matrix` (`product` of `Rx/Ry/Rz` gates with angles in degrees), `circuit`, and the 448 curves `rabiFlip`, `rabiFlipOff`, `rabiPeak`. **S2 — nine additive `plot` curves** (names in `PlotCurveName`; one registry row each in `stage/svg/plot.ts`, scene unchanged; values from `blocheq.ts`/`pulses.ts`): `popDecay` ($e^{-x}$, x = $t/T_1$ 0–5) and `cohDecay` ($e^{-x/2}$, same axes) · `steadyLow`, `steadyHigh` (ρ_ee,ss(x) = $\tfrac12 s/(1 + x^2 + s)$ for $s = 0.2$ and $5$, x = $\Delta T_2$ −5…5) · `ouSlow`, `ouFast` (noise-averaged Ramsey coherence for $\sigma = 1$, $\tau_c = 10$ and $0.1$, x = $\sigma t$ 0–5) and `echoOuSlow` (echo coherence, $\tau_c = 10$, x = total time $2\tau$ 0–5) · `pulseErr1`, `pulseErr2` (plain and composite operator-norm error against $\epsilon$ 0.001–0.3, log-log). Chances axes bounded to [0, 1]; curves sampled smooth (default 64). **Smallest cut: drop `steadyHigh`/`steadyLow` (caption numbers `q24ReeRes1`, `q24ReeRes100`, `q24FWHM0/3`), `ouFast` (caption number) and `pulseErr1/2` (numbers in b5): leaves four: `popDecay`, `cohDecay`, `ouSlow`, `echoOuSlow`.** **S3 (no field):** first uses needing a screenshot check: `bloch-ball` with a sweep-free explicit $r$ and the purity readout; `bloch.rotate` about `{thetaDeg: 51.3, phiDeg: 0}`; a full 360° `rotate` about $x$ (rabi:b3: the arrow returns, the sign is in the caption).
**Fallbacks:** S2 declined → one table in each caption per curve (numbers still engine-made) and `plot(rabiFlip)` for the Rabi picture.
**9.3 Widgets:** none required; every Try-it is true on today's code.

## 10. Media (deferred, per BUILD-LOG)
Film `qc-q24-ramsey` "Ramsey fringes blur under noise" (keys `q24RamseyCoh10`, `q24EchoCoh10`, `q24T2starSlow`) and `qc-q24-rabi-ball` "Rabi flopping, and the decay, inside the ball" (keys `q24RT1x`, `q24RT1z`, `q24Tpi`). Blender: the Part XI opener, the cryostat descent, deferred (ends on an engine Rabi path). Decor: a pendulum pushed in rhythm, a spinning top slowing (atmosphere only).

## 11. Hooks
**11.1 Concept stations** (`concepts.ts` rows; the builder reads the exact needs ids from the file; `sameAs` where 448 has a twin): `qc-divincenzo-station` (divincenzo) · `qc-lindblad-station` (needs the Q13 channel station and 448's Schrödinger concept) · `qc-bloch-eq-station` (needs lindblad) · `qc-rabi-station` (needs bloch-eq; `sameAs` 448's driven-spin concept if one exists) · `qc-ramsey-station` (needs rabi) · `qc-decoupling-station` (needs ramsey).
**11.2 Arcade (Spot the error):** `qc-t2-longer` ("$T_2$ can be three times $T_1$"; why `q24MinEig3`) · `qc-steady-invert` ("keep driving and the qubit ends fully excited"; why `q24ReeRes100`) · `qc-rabi-sign` ("a real positive drive is $R_x(\theta)$"; why `q24SignRxPlus`) · `qc-composite-zero` ("a composite pulse removes the error"; why `q24ErrComp01`) · `qc-fast-noise` ("faster noise always decays faster"; why `q24T2starFast`) · `qc-echo-any` ("the echo cancels any noise"; why `q24RamseyCoh01`).
**11.3 Bridges.** Existing rows used: `qc-l7-full-turn`, `qc-q4-one-qubit-gates`, `qc-q3-bloch`, `qc-q8-ball`, `qc-l11-schrodinger`. **NEW rows:** `qc-q13-from-unitary`, `qc-q13-depolarizing`, `qc-l12-driven`, `qc-l11-two-level`, `qc-q21-dfs` (labels as the unit titles). Q25 later bridges back to `qc-q24-lindblad`, `qc-q24-rabi`, `qc-q24-ramsey` (wiring pass after merge).

## Totals
**6 units · 28 beats** (divincenzo 3, lindblad 6, bloch-eq 5, rabi 6, ramsey 5, decoupling 3; 5 clues, 0 Go-deeper) · **7 derivations** (each ≥ 2 views in both tracks) · **≈ 90 claim keys** (numpy twin of every key; ≈ 30 are `…Gap` or exact values) · **18 challenges** (3 per unit; 4 integers at tolerance 0; 4 choice) ·
**15 new glossary entries** (4 `introduces: 'notation'`: `qc-lindblad-operator`, `qc-rabi-frequency`, `qc-detuning`, `qc-population-inversion`) · **6 review cards** · **2 Corrections** (C1, p. 209 sign; C2, Eq. 12.5b) · **2 new engine modules** (`blocheq.ts`, `pulses.ts`; ≈ 40 functions, none in the first-paint closure) · **0 new stage kinds**, **9 additive plot curves** (cut: 4) · 0 new widgets · 5 new bridge rows · 6 Try-its on existing widgets · 2 films and the cryostat opener deferred.

## Rulings requested
- R1 **Reported numbers.** `Beat.reported` exists at type, lint and render level but its validation and ruling are Papers-only. Plan: words without digits for hardware, every digit from a stated model (above). **Recommend keep**; a "709 may use `reported`" ruling would be a platform task (validator + review rule) and Q24 needs none.
- R2 Six units, 28 beats (3 + 6 + 5 + 6 + 5 + 3). Approve. Units follow Bergou's sections; §12.5.1 is its own short unit.
- R3 Approve **S2** (nine curves); **recommend the four-curve cut** if the platform queue is long (every picture has the caption-table fallback).
- R4 **Two Correction boxes** (C1 confirmed on the page image, also in the map as B31; C2 new). **Recommend approve both;** the independent review re-verifies each on PDF pp. 213 and 216 (equations are small in the text layer).
- R5 P12.5 (composite pulse) is *cited*: b5 verifies the text's claim numerically and does not write the error operators or ask for $\varphi$. Confirm that is the right reading of "problems cited only" (the sequence and its $O(\epsilon^2)$ claim are printed in the text on p. 210). **Recommend approve.** P12.1–P12.4, P12.6, P12.7 cited in words at lindblad:b6, rabi:b1, ramsey:b3 and decoupling:b3; none worked.
- R6 Model inputs (1 µs gate, 1 ms $T_2$; $T_1 = 2.5$, $T_2 = 5$ of Fig. 12.3; noise rms 1) are `V` keys with literal twins. Approve.
- R7 The OU noise model (a correlation time, not Bergou's spectral density) is our addition, flagged "our calculation" in beats; it gives Gaussian and exponential limits and explains (12.12). **Recommend keep** (it is the only way to show echo and decay-shape numbers from a stated model); cutting it removes ramsey:b4–b5, decoupling:b2 and 3 curves.
- R8 Rosetta line $\omega_1 = 2\Omega$ (Townsend vs Bergou) at rabi:b1 and in the symbols flag. Approve.

**Cost estimate (builder steps, one builder):** engine `blocheq.ts` + `pulses.ts` + numpy twin + tests ≈ 55 · plot curves (S2) ≈ 10 · content (6 units: story, values, review, glossary, challenges, corrections, tests) ≈ 75 · lints, e2e lists, bridges, visual QA, fixes ≈ 25: **about 165 steps** (≈ 150 with the four-curve cut and no Correction C2 detour).
