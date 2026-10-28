# P-Q27-story — Q27 "Qubits in chips: transmons and quantum dots" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q19-story.md`'s sections (companion plan `P-Q26-story.md`, same conventions). Standing gates: ≥ 2 distinct derivation views per track; one notation beat per new notation. Map row: `P-709-map.md` §12, drafted there as "Q25"; the owner's brief numbers it **Q27**, the last chapter of Part XI. **Phase `'books'`**: no 709 notes cover Ch. 15; ramp `[B]`, clues `[C]`, Go-deeper `[D]` last in its unit (after every clue, never first, introduces nothing).

**Sources read** (paraphrased; printed pages; Bergou printed = PDF − 6, PDF pp. 275–304). §15.1–15.2 pp. 269–272 (Table 15.1), §15.3–15.4 pp. 273–277 (Eqs. 15.2–15.6), §15.5 pp. 277–280 (15.7), §15.6–15.7 pp. 280–285 (15.8–15.10, Mathieu), §15.8–15.10 pp. 285–289 (15.11), §15.11–15.16 pp. 289–297 (15.12–15.14), problems P15.1–P15.4 pp. 297–298 (⚑ cited only: P15.1's $R_{\max}$, P15.3's derivation of (15.9), P15.4 thermal fidelity are not worked). **Page images checked** (PDF pp. 287 for (15.9), 290 for the charge dispersion and the anharmonicity, 300 for (15.13)–(15.14); the figure pages PDF 276 and 296 are read from the text layer and their captions only). N&C: not needed. No 709 homework covers Ch. 15 (`homework-status.md`): full walkthroughs.

**Ownership.** Q4 SWAP, CZ, phase gates · **Q19 owns** the Heisenberg bond gate and $\boldsymbol\sigma_1\!\cdot\!\boldsymbol\sigma_2 = 2\,{\rm SWAP} - I$ (`q19-simulation:b2`; Q27 links back, derives nothing) · 448 L11 two-level systems and tunnelling (`l11-two-level`), L12 driven spin and the rotating-wave idea (`l12-driven`), L13 box levels (`l13-stationary`; `constants.ts boxEnergyEv`) · Q26 (parallel) owns the Jaynes–Cummings block and the dispersive expansion $\chi = \Omega_0^2/4\Delta$: Q27's cQED unit is a one-beat link-back with $\Omega_0 \to 2g$ (a `<<…>>` bridge only if Q26 has merged when Q27 builds, else words) · **Q24 will own** Rabi's formula, Lindblad $T_1$/$T_2$, Ramsey, the Bloch equations and the DiVincenzo criteria (named in words only; `Ω = μ_B B_x/ħ` is used here as a model input, `rabiFlipTime` of 448 `dynamics.ts` reused) · **Q25** (atoms, ions) named in words. **Q27 owns:** circuit quantization of an LC circuit, the Cooper-pair toy model, flux quantization, the Josephson relations, the charge qubit and transmon (Hamiltonian, two-level cut, Mathieu levels, charge dispersion, anharmonicity), qubit–resonator coupling numbers (cooperativity, dispersive shift, iSWAP), the spin qubit in a dot (Zeeman, exchange, $\sqrt{\rm SWAP}$, CZ of Eq. 15.14).

**Reported-numbers rule (checked, as in Q26).** `Beat.reported` and `trail` exist in `content/stage.ts` and render in the shared story, but their validator (`papers/validate.ts`), source ids and lints are Papers-only and no 709 chapter uses them. **So none is used:** every experiment-derived figure of Ch. 15 (qubit counts of chips, coherence times, gate and readout fidelities, device frequencies, isotope shares, "typical" $E_J/E_C$ ranges) is stated **in words, no digit**, and every displayed digit is computed from a stated model whose inputs are labelled "model (ours)" (e.g. $C = 0.3$ pF and $L = 3$ nH, the book's own illustration; $g/2\pi = 10$ MHz, $Q = 10^7$, $T_1 = 100$ µs, $\Delta/2\pi = 100$ MHz, $\Omega/2\pi = 10$ MHz as round model numbers).

**Evidence.** Scratchpad `planQ26Q27-numpy.py` (numpy, scipy, sympy; independent of the repo engine): charge-basis diagonalisation against `scipy.special.mathieu_a/b` ($10^{-8}$), the Cooper gap equation by quadrature against the closed form, truncated-oscillator operators for $[\Phi, Q]$, `expm` for the two-site tunnelling and exchange gates, a sign scan of Eq. 15.14. **68 asserted checks (both chapters), 0 failed.** Every value below is printed there.

**Conventions.** $\hbar = 1$ only in the engine; SI for circuits; $E_C = (2e)^2/2C_\Sigma$ counts **Cooper pairs** $n$ (Eq. 15.8) and is **4× the literature's $E_C = e^2/2C_\Sigma$** (engine: $4.000$): Rosetta once in `transmon:b1`; every number uses the book's. $|0\rangle = |{+z}\rangle$ is the geometric lock; in this chapter the book's $|0\rangle$ is the *upper* level for a spin (§15.11) and for (15.9), the *lower* one for the transmon (C13: stated, not changed). $n_g$ = gate charge. $E_J/E_C$ = "the ratio", $r$. Claim keys `q27…`; twins `pipeline/claims_qc709/q27.py`. Cross-references "Unit 27.4", "Chapter Q24".

**Stage shorthand.** As Q26: `circ`, `amp`, `tq`, `bl(θ°,φ°)`, `pp(...)` = `plot` **points mode** (≤ 24 points, ≤ 4 groups, x, y from `V`, `status:'computed'`), plus `mx` = `matrix {source:{lin:[…]}}` and `ck(u,l,t)` = `clocks {levels:{upper:u,lower:l}, start:'+x', timeDeg:t}` (levels are small exact numbers: a picture of a Larmor beat, not of GHz). Circuits (engine matrices): `C_X` 1 wire `0`: [Rx(π)] · `C_ISW(τ)` 2 wires `01`: [unitary exp(−iτ(σ⁺σ⁻ + h.c.)) 'iSW'] · `C_EX(φ)` 2 wires `01`: [unitary $e^{i\varphi\boldsymbol\sigma_1\cdot\boldsymbol\sigma_2/4}$ 'ex'], φ = ∫2K dt/ħ · `C_CZD` 2 wires `++`: [unitary $\sqrt{\rm SWAP}$ ≡ $e^{i\pi\sigma\cdot\sigma/8}$ 'ex'], [$Rz$ for $e^{i\pi Z_1/2}$], [ex], [$Rz$ for $e^{-i\pi Z_2/4}$ and $e^{i\pi Z_1/4}$] (the factor $e^{-3i\pi/4}$ is a global phase and is not drawn).

## 0. Chapter map
**Driving question:** "How can a chip with trillions of electrons, or one trapped electron's spin, behave as a single two-level system?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q27-lc` | A circuit that rings | Why is a plain LC circuit not a qubit, and why millikelvin? | Bergou pp. 269–272, Table 15.1 | `qc-l11-two-level`, F5 `qc-f5-probability` |
| 2 | `q27-superconductivity` | Pairs, a flux quantum, no resistance | What is special about a superconducting loop? | pp. 273–277 (15.2)–(15.6) | `qc-f1-phase`, 448 `l13-stationary` |
| 3 | `q27-josephson` | A junction is a phase-dependent inductor | How does a tunnel junction make an anharmonic circuit? | pp. 277–280 (15.7) | `qc-l11-two-level`, `qc-f1-phase` |
| 4 | `q27-transmon` | From charge qubit to transmon | How does a big $E_J/E_C$ buy coherence at the price of anharmonicity? | pp. 280–285 (15.8)–(15.9), Mathieu | `qc-f4-spectral`, `qc-l11-two-level` |
| 5 | `q27-cqed` | A qubit coupled to a resonator | How are qubits read and coupled through a microwave mode? | pp. 285–289 (15.11) | `qc-q4-circuits` (iSWAP), Chapter Q26 |
| 6 | `q27-dots` | One electron spin in a gated dot | How do exchange pulses give SWAP, √SWAP and CZ? | pp. 289–297 (15.12)–(15.14) | `qc-q19-simulation`, `qc-q4-circuits`, `qc-l1-quantized` |

**Outcomes:** compute an LC circuit's frequency, thermal occupation and why its rungs cannot serve as a qubit · state flux quantization and the Cooper toy model · use $I = I_0\sin\theta$, $L_J$ and the SQUID's $E_J$ scale · diagonalise $E_C(n - n_g)^2 - E_J\cos\theta$, read the two-level cut, the sweet spot, charge dispersion and anharmonicity against $E_J/E_C$ · compute cooperativity, dispersive shift and the iSWAP time · compute a spin qubit's Zeeman frequency and thermal polarization, the exchange energies, and verify SWAP, $\sqrt{\rm SWAP}$ and Eq. 15.14. **Prerequisites:** `qc-hermitian-matrix`, `qc-gate`, `qc-phase-gate`, `qc-swap-gate`, `qc-cnot`, `hamiltonian`, `two-level-system`, `qc-bloch-sphere`, `qc-heisenberg-chain` (Q19). **Openers:** none (Part XI's Blender cryostat opener sits before Chapter Q24).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)

### Unit `q27-lc` — A circuit that rings
**b1 [B]** (energy in a capacitor and an inductor, p. 271) · Bridge `qc-f5-probability` (later)
- G: "A capacitor stores energy $\tfrac12CV^2$, an inductor $\tfrac12LI^2$. Join them and the energy slides back and forth like a mass on a spring: $d^2I/dt^2 = -I/(LC)$."
- F: "$V = L\,dI/dt$ and $-dV/dt = I/C$ give $\ddot I = -I/LC$, $I = I_0\cos\omega t$, $\omega = 1/\sqrt{LC}$ (p. 271). The stored energy $H = Q^2/2C + \Phi^2/2L$ is quadratic in the pair (flux $\Phi = LI$, charge $Q$), as $p^2/2m + \kappa x^2/2$ is in $(x, p)$."
- Cap G/F "the current swings as a cosine; one period shown" · Stage `pp(I(t)/I₀ at ωt/2π = 0, ⅛, …, 1)` · Claims none (numbers follow).

**b2 [B]** (a model circuit, p. 271) · Terms `qc-lumped-element`
- G: "Take $C = 0.3$ pF and $L = 3$ nH, a small chip circuit. Then $\omega = 3.33\times10^{10}$ rad/s, which is $5.31$ GHz. Light of that frequency is $5.65$ cm long, at least 56 times the size of the circuit, so $L$ and $C$ are single lumps."
- F: "Model (ours, the book's illustration): $\omega = 1/\sqrt{LC} = 3.333\times10^{10}\,{\rm s}^{-1}$, $f = 5.305$ GHz, $\lambda = c/f = 5.65$ cm against elements below a millimetre (at least $56.5$ times smaller): a [[qc-lumped-element|lumped-element]] circuit (the page prints $5.3$ GHz and $5.7$ cm). Characteristic impedance $Z = \sqrt{L/C} = 100\,\Omega$."
- Cap G/F "frequency against the capacitance for L = 3 nH: 0.3 pF marked" · Stage `pp(C = 0.1, 0.2, 0.3, 0.5, 1.0 pF → f in GHz)` · Claims `q27LcOmega` 3.33e10, `q27LcFreqGHz` 5.305, `q27LcLambdaCm` 5.65, `q27LcLambdaOverChip` 56.5, `q27LcZ` 100.

**b3 [B] · notation beat, `introduces: ['qc-flux-charge']`** (Table 15.1, p. 272)
- G: "Flux $\Phi$ plays position and charge $Q$ plays momentum (Table 15.1). They do not commute: $[\hat\Phi, \hat Q] = i\hbar$. Write them with the ladder operators $a$ and $a^\dagger$."
- F: "[[qc-flux-charge|$\hat\Phi = \sqrt{\hbar Z/2}\,(a + a^\dagger)$, $\hat Q = i\sqrt{\hbar/2Z}\,(a^\dagger - a)$]] with $Z = \sqrt{L/C}$; then $\hat H = \hat Q^2/2C + \hat\Phi^2/2L = \hbar\omega(a^\dagger a + \tfrac12)$ and $[\hat\Phi, \hat Q] = i\hbar$ (engine, truncated oscillator: gap $10^{-12}$ away from the cut-off level)."
- Cap G/F "the rungs of the LC oscillator: n + ½ in units of ħω" · Stage `pp(n = 0…4, E/ħω)` · Claims `q27CommGap` 0.

**b4 [B]** (equal rungs leak, p. 272)
- G: "The rungs are $\hbar\omega(n + \tfrac12)$: every step the same height. A pulse tuned to $0 \to 1$ also drives $1 \to 2$, and more strongly: the coupling grows as $\sqrt{n+1}$, so $1 \to 2$ is $1.414$ times stronger."
- F: "$E_{n+1} - E_n = \hbar\omega$ for all $n$; $|\langle n+1|\hat Q|n\rangle| \propto \sqrt{n+1}$, so $|Q_{12}|/|Q_{01}| = \sqrt2 = 1.414$ (engine, from the matrix of Table 15.1's $\hat Q$). The lowest two levels are not selectively addressable: no qubit (p. 272)."
- Cap G/F "equally spaced rungs: a pulse at the 0→1 frequency also fits 1→2" · Stage `pp(n = 0…4; group 'LC')` · Claims `q27LeakRatio` 1.414.

**b5 [B]** (why millikelvin, p. 271)
- G: "One rung is $hf/k_B = 0.255$ K of heat. At room temperature the circuit holds about 1178 photons on average. At 20 mK the chance that it sits in its ground state is $0.999997$."
- F: "$\bar n = 1/(e^{hf/k_BT} - 1)$ and $P(n = 0) = 1 - e^{-hf/k_BT}$ (thermal oscillator): at $300$ K $\bar n = 1178$, $P = 0.0008$; at $1$ K $P = 0.2248$; at $20$ mK $\bar n = 2.96\times10^{-6}$, $P = 0.999997$ (model temperatures, ours). The book's condition is $T \ll hf/k_B = 0.255$ K."
- Cap G/F "chance of the ground state against temperature, log axis" · Stage `pp(T = 0.01, 0.02, 0.05, 0.1, 0.25, 1, 4, 300 K; xScale log)` · Claims `q27HfOverK` 0.2546, `q27Nbar300` 1178, `q27P0_300` 0.0008, `q27P0_1K` 0.2248, `q27P0_20mK` 0.999997, `q27Nbar20mK` 2.96e-6.

**b6 [C]** (ground state with chance 0.99)
- Q G: "At what temperature is the circuit in its ground state with chance $0.99$?" · Q F: "Solve $1 - e^{-hf/k_BT} = 0.99$ for $T$ at $f = 5.305$ GHz."
- Reveal G: "$T = 55$ mK, about a fifth of $hf/k_B$. Dilution refrigerators reach below this." · Reveal F: "$T = (hf/k_B)/\ln100 = 55.3$ mK."
- Cap G/F "the 0.99 line crosses at 55 mK" · Stage q `pp(b5)`, reveal `pp(b5, yLines 0.99)` · Claims `q27T99mK` 55.3.

### Unit `q27-superconductivity` — Pairs, a flux quantum, no resistance
**b1 [B]** (the Cooper toy model, pp. 273–275) · Terms `qc-cooper-pair`
- G: "In a cold metal an electron pulls the ions a little, and the shifted ions pull a second electron: a weak attraction. Any such attraction, however weak, binds two electrons into a [[qc-cooper-pair|Cooper pair]] of charge $2e$. Pairs are bosons and can share one state."
- F: "Toy calculation: $(E - 2\epsilon_k)a_k = \sum_{k'}V_{kk'}a_{k'}$ with $V_{kk'} = -V$ in a shell of width $E_c$ above the Fermi level gives $1 = \tfrac{N_FV}{2}\ln\tfrac{2E_c + b}{b}$ for the binding $b = 2E_F - E$, so $b = 2E_c/(e^{2/N_FV} - 1) \simeq 2E_ce^{-2/N_FV}$. At $N_FV = 0.3$, $E_c = 1$: $2.549\times10^{-3}$ against $2.545\times10^{-3}$ (engine: the gap equation by quadrature agrees to $10^{-9}$). A bound state exists for every $V > 0$ and is not analytic in $V$."
- Cap G/F "binding energy against the attraction: a bound state for every strength, tiny when weak" · Stage `pp(N_FV = 0.15…0.6; groups 'exact', 'exponential form'; yScale log)` · Claims `q27CooperB` 2.549e-3, `q27CooperApprox` 2.545e-3, `q27CooperRatio` 1.0013.

**b2 [B]** (the field is pushed out, pp. 275–276) · Terms `qc-meissner-effect`
- G: "Pairs move so as to cancel any magnetic field inside the metal. The field dies away as $e^{-x/\lambda}$ over a distance $\lambda$ of tens of nanometres: the [[qc-meissner-effect|Meissner effect]]. For the book's pair density, $\lambda = 26.6$ nm."
- F: "$\mathbf J = (2en/m)(\hbar\nabla\theta - 2e\mathbf A/c)$ (15.5) with Maxwell's equations gives $\nabla^2\mathbf B = \mathbf B/\lambda^2$ (London); with $n = 10^{28}\,{\rm m}^{-3}$ (model, the book's) the SI form $\lambda^2 = m/\mu_0n(2e)^2$ gives $26.57$ nm (the page: about $25$ nm). The field falls to $1/e$ at $x = \lambda$."
- Cap G/F "the field inside against depth in units of λ" · Stage `pp(x/λ = 0, 0.5, …, 4; B/B₀ = e^{−x/λ})` · Claims `q27LondonNm` 26.57.

**b3 [B]** (flux quantization, D3, p. 277) · Terms `qc-flux-quantum`
- G: "The pair wave function must come back to itself after a loop, so its phase turns by a whole number of turns. With no current this makes the flux through the ring a whole number of flux quanta $\Phi_0 = h/2e$. Charge $2e$, not $e$, sets the size: $\Phi_0 = 2.068\times10^{-15}$ Wb."
- F: "No current gives $\nabla\theta = 2e\mathbf A/\hbar$ (SI); single-valuedness $\oint\nabla\theta\cdot d\mathbf l = 2\pi p$ and Stokes' theorem give $\Phi = p\,\Phi_0$, $\Phi_0 = h/2e$ ($hc/2e$ in cgs) $= 2.0678\times10^{-15}$ Wb (engine, from $h$ and $e$)."
- Cap G/F "allowed fluxes in the ring: 0, Φ₀, 2Φ₀, …" · Stage `pp(p = 0…4, pΦ₀ in 10⁻¹⁵ Wb)` · Claims `q27Phi0` 2.0678e-15 · Derivation D3.

**b4 [C]** (a loop in a small field)
- Q G: "A loop of 1 µm² sits in a field of 1 mT. How many flux quanta would that field alone push through it?" · Q F: "$BA/\Phi_0$ for $B = 1$ mT, $A = 1\,\mu{\rm m}^2$."
- Reveal G: "$0.484$: not a whole number. The ring responds with a current that makes the total flux a whole number, here 0." · Reveal F: "$BA/\Phi_0 = 0.4836$; the screening current makes $\Phi_{\rm total} = p\Phi_0$ (the lowest-energy $p$ is the one nearest the applied flux)."
- Cap G/F "applied flux 0.48 Φ₀ sits between the allowed values" · Stage q `pp(b3)`, reveal `pp(b3 plus a point at 0.4836)` · Claims `q27FluxLoop` 0.4836.

### Unit `q27-josephson` — A junction is a phase-dependent inductor
**b1 [B]** (tunnelling between two superconductors; D4, pp. 277–278) · Terms `qc-josephson-junction` · Bridge `qc-l11-two-level`
- G: "Two superconductors with a thin insulator between them: pairs tunnel with strength $K$. Each side has a pair density and a phase. The tunnelling equations give a current $I = I_0\sin\theta$ set by the phase difference $\theta$, and $\dot\theta = 2eV/\hbar$."
- F: "$i\hbar\dot\psi_1 = U_1\psi_1 + K\psi_2$, $i\hbar\dot\psi_2 = U_2\psi_2 + K\psi_1$ is a two-level system (<<qc-l11-two-level|Unit 11.6>>); $\psi_j = \sqrt{n_j}e^{i\theta_j}$ gives $\dot n_1 = (2K/\hbar)\sqrt{n_1n_2}\sin(\theta_2 - \theta_1)$ and, for $n_1 = n_2$, $\dot\theta = qV/\hbar$, $q = 2e$ (p. 278; engine: integrating the two-level equations reproduces the first to $10^{-5}$). The AC Josephson frequency $2eV/h = 483.6$ MHz per microvolt."
- Cap G/F "current against the phase difference: a sine" · Stage `pp(θ = −π…π, sin θ)` · Claims `q27JosephsonMHzPerUV` 483.6 · Derivation D4.

**b2 [B]** (a nonlinear inductor, p. 279) · Terms `qc-josephson-inductance`
- G: "From $V = (\Phi_0/2\pi)\dot\theta$ and $\dot I = I_0\cos\theta\,\dot\theta$ the junction acts like an inductor $L_J = \Phi_0/(2\pi I_0\cos\theta)$. It depends on the phase, and becomes infinite at $90°$."
- F: "$L_J(\theta) = \Phi_0/(2\pi I_0\cos\theta)$, $L_{J0} = \Phi_0/2\pi I_0$. Swap the $L = 3$ nH of Unit 27.1 for a junction with $I_0 = 109.7$ nA (so $L_{J0} = 3$ nH): at $\theta = 60°$, $L_J = 6$ nH and $f$ falls from $5.305$ to $3.751$ GHz, a factor $1/\sqrt2$. A swinging phase is a swinging frequency (model, ours)."
- Cap G/F "frequency against the phase: 5.31 GHz at 0°, 3.75 GHz at 60°" · Stage `pp(θ = 0…80°, f/f₀)` · Claims `q27I0nA` 109.7, `q27Lj60nH` 6, `q27F60GHz` 3.751.

**b3 [B]** (a cosine well, p. 281)
- G: "The energy in the junction is $-E_J\cos\theta$ with $E_J = \Phi_0I_0/2\pi$: a cosine well, not a parabola. Near the bottom it looks like a parabola, but higher up the walls open out, so the rungs get closer together."
- F: "$U(\theta) = E_J(1 - \cos\theta)$, $E_J = \Phi_0I_0/2\pi$ ($E_J/h = 54.49$ GHz for the model $I_0$); $-E_J\cos\theta = -E_J + E_J\theta^2/2 - E_J\theta^4/24 + \cdots$: the quartic term lowers the upper levels, the origin of $\alpha < 0$ in Unit 27.4."
- Cap G/F "the cosine well against its parabola" · Stage `pp(θ = −π…π; groups '1 − cos θ', 'θ²/2')` · Claims `q27EJoverH` 54.49.

**b4 [B]** (the SQUID, p. 279, Eq. 15.7) · Terms `qc-squid`
- G: "Two junctions in a ring make a SQUID. Its effective $E_J$ is $2E_J|\cos(\pi\Phi/\Phi_0)|$, set by the flux through the ring. At half a flux quantum it vanishes and the qubit stops evolving."
- F: "(15.7) $J = 2J_0\sin\theta(0)\cos(\pi\Phi/\Phi_0)$: the junction pair carries the critical current $2I_0|\cos(\pi\Phi/\Phi_0)|$, so $E_J \to 2E_J|\cos(\pi\Phi/\Phi_0)|$. Engine: the scale is $0.7071$ at $\Phi_0/4$, $0.5$ at $\Phi_0/3$, $0$ at $\Phi_0/2$."
- Cap G/F "tunable E_J against the flux" · Stage `pp(Φ/Φ₀ = 0…1, |cos(πΦ/Φ₀)|)` · Claims `q27Squid025` 0.7071, `q27Squid13` 0.5.

**b5 [C]** (halving the frequency by flux)
- Q G: "A SQUID tunes a circuit whose frequency goes as $\sqrt{E_J}$. At what flux is the frequency half its maximum?" · Q F: "Solve $\sqrt{|\cos(\pi\Phi/\Phi_0)|} = 1/2$."
- Reveal G: "$|\cos| = 1/4$, so $\Phi = 0.4196\,\Phi_0$." · Reveal F: "$\Phi/\Phi_0 = \arccos(1/4)/\pi = 0.4196$."
- Cap G/F "half the frequency near the half flux quantum" · Stage q `pp(b4)`, reveal `pp(b4, yLines 0.25)` · Claims `q27SquidHalfFlux` 0.4196.

### Unit `q27-transmon` — From charge qubit to transmon
**b1 [B] · notation beat, `introduces: ['qc-charging-energy']`** (the Cooper-pair box, p. 280) · Terms `qc-charge-qubit`, `qc-charging-energy`
- G: "A tiny superconducting island holds a whole number $n$ of extra Cooper pairs. Its charging energy is $E_C(n - n_g)^2$, and a gate voltage sets $n_g$. A junction adds $-E_J\cos\theta$, which moves one pair at a time. Here $E_C$ counts pairs: four times the usual one."
- F: "[[qc-charging-energy|$E_C = (2e)^2/2C_\Sigma$]]; the [[qc-charge-qubit|charge qubit]] $\hat H = E_C(\hat n - n_g)^2 - E_J\cos\hat\theta$ (15.8), $\hat n = -i\partial_\theta$; in the charge basis $\cos\hat\theta = \tfrac12\sum_n(|n\rangle\langle n+1| + {\rm h.c.})$. Rosetta: the common charging energy is $e^2/2C_\Sigma$, a quarter of this one (engine ratio $4.000$): every number below uses the book's."
- Cap G/F "the energy of each charge state against the gate charge: parabolas crossing at the half-integers" · Stage `pp(n_g = 0, ¼, ½, ¾, 1; groups n = −1, 0, 1, 2)` · Claims `q27EcFactor` 4.

**b2 [B]** (the two-level cut, D5, p. 281) · Correction K1
- G: "Near $n_g = \tfrac12$ keep only $n = 1$ and $n = 0$. Their energies cross there and $E_J$ opens a gap. As a 2×2 table, $\sigma_z$ carries $-E_C(n_g - \tfrac12)$ and $\sigma_x$ carries $-E_J/2$. At $n_g = \tfrac12$ the gap is $E_J$."
- F: "In the basis $(|1\rangle,|0\rangle)$ of charge states $\hat H \simeq -E_C(n_g - \tfrac12)\sigma_z - \tfrac{E_J}2\sigma_x$ (+ const), energies $\pm U$, $U = \sqrt{E_C^2(n_g - \tfrac12)^2 + E_J^2/4}$. The page (15.9) prints $+E_C(n_g - \tfrac12)\sigma_z$ for that basis: our calculation finds the opposite sign (at $E_C = 1$, $E_J = 0.2$, $n_g = 0.3$ the coefficient is $+0.2$, the page's form gives $-0.2$; Correction K1). Engine: full charge-basis gap $0.4488$, cut $0.4472$; at $n_g = \tfrac12$ the gap is $0.1995$ against $E_J = 0.2$."
- Cap G/F "gap against the gate charge for E_J = 0.2 E_C: full diagonalisation and the two-level cut" · Stage `pp(n_g = 0, ⅛ … 1; groups 'charge basis', 'two-level cut')` · Claims `q27ZcoTrue` 0.2, `q27ZcoPrinted` −0.2, `q27UCut` 0.2236, `q27GapFull` 0.4488, `q27GapCut` 0.4472, `q27GapDegenerate` 0.1995 · Derivation D5.

**b3 [B]** (the sweet spot and the gates, p. 282)
- G: "At $n_g = \tfrac12$ the gap has zero slope, so small charge noise barely moves the qubit frequency. Away from it the slope is steep: $-1.80\,E_C$ per unit of $n_g$ at $n_g = 0.3$. An $X$ gate is a visit to $n_g = \tfrac12$ of length $\delta t$: a flip when $E_J\delta t/\hbar = \pi$."
- F: "$d({\rm gap})/dn_g = 0$ at $n_g = \tfrac12$ (engine $< 10^{-10}$) and $-1.80\,E_C$ at $0.3$ (first-order sweet spot, p. 281); the visit applies $U = e^{iE_J\delta t\,\sigma_x/2\hbar}$ (p. 282), a $\pi$ rotation when $E_J\delta t/\hbar = \pi$; $Z$ gates come from short steps in $n_g$ (same page)."
- Cap G/F "flat at ½, steep elsewhere" · Stage `pp(b2's full-diagonalisation points)` · Claims `q27SlopeSweet` 0, `q27SlopeOff` −1.80, `q27PiTimeInvEJ` 3.1416.

**b4 [B]** (a bigger $E_J/E_C$ flattens the band, p. 283) · Terms `qc-transmon`
- G: "Make $E_J$ much bigger than $E_C$. The band's two ends, $n_g = 0$ and $n_g = \tfrac12$, move together and the qubit frequency stops depending on $n_g$. At $E_J/E_C = 1$ it swings by $37.6\,\%$ over a period; at $20$, by two parts in a hundred million."
- F: "[[qc-transmon|Transmon]]: the Cooper-pair box with $E_J/E_C \gg 1$. $f_{01}(n_g)/f_{01}(\tfrac12)$ has maximum $1.3757$ at $E_J/E_C = 1$ and $1.00000002$ at $20$ (engine: charge-basis diagonalisation, cross-checked against Mathieu eigenvalues $a_\nu(q)$, $q = -2E_J/E_C$, to $10^{-8}$)."
- Cap G/F "qubit frequency over its value at ½: ratio 1 swings, ratio 20 is flat" · Stage `pp(n_g = 0, ⅛ … 1; groups 'ratio 1', 'ratio 20')` · Claims `q27F01spread1` 1.3757, `q27F01spread20` 1.00000002.

**b5 [B]** (the Mathieu equation, D6, p. 284)
- G: "In the phase picture $\hat n = -i\,d/d\theta$. Define $g(\phi) = e^{-2in_g\phi}\psi(2\phi)$ and the equation becomes the Mathieu equation, solved exactly. Our diagonalisation agrees with it to eight digits. At ratio 20 the first gap is $6.063\,E_C$; the harmonic guess $\sqrt{2E_JE_C}$ is $6.325\,E_C$."
- F: "$[E_C(-i\partial_\theta - n_g)^2 - E_J\cos\theta]\psi = E\psi$ with $g(\phi) = e^{-2in_g\phi}\psi(2\phi)$ becomes $g'' + [4E/E_C + (4E_J/E_C)\cos2\phi]g = 0$, Mathieu's $y'' + (a - 2q\cos2x)y = 0$ with $a = 4E/E_C$, $q = -2E_J/E_C$; at $n_g = 0$ and $\tfrac12$ the levels are $E_Ca_\nu(q)/4$ (engine against the `scipy` twin, $10^{-8}$). Harmonic limit $\sqrt{2E_JE_C}$ (ours)."
- Cap G/F "the lowest levels at ratio 20" · Stage `pp(n = 0…4, E_n − E_0 in units of E_01)` · Claims `q27E01_20` 6.063, `q27SqrtApprox20` 6.325 · Derivation D6.

**b6 [B]** (the ladder and the anharmonicity, p. 284) · Terms `qc-anharmonicity`
- G: "In the transmon the rungs are not even. At $E_J/E_C = 20$ the levels sit at $0, 1, 1.954, 2.859, 3.708$ in units of the first gap; an LC circuit has $0, 1, 2, 3, 4$. The second gap is $4.6\,\%$ short, so a pulse for $0 \to 1$ misses $1 \to 2$."
- F: "[[qc-anharmonicity|Relative anharmonicity]] $\alpha = (E_{21} - E_{10})/E_{10}$: exact $-0.0457$ at $E_J/E_C = 20$ ($-0.0696$ at $10$, $-0.0273$ at $50$) against the page's large-ratio form $-1/\sqrt{32E_J/E_C}$: $-0.0395$, $-0.0559$, $-0.025$ (the form improves with the ratio; our calculation finds no error). It shrinks only as a power law."
- Cap G/F "rungs of the LC circuit against the transmon at ratio 20" · Stage `pp(n = 0…4; groups 'LC', 'transmon')` · Claims `q27LadderTransmon20` (1, 1.954, 2.859, 3.708), `q27Anh20` −0.0457, `q27Anh10` −0.0696, `q27Anh50` −0.0273, `q27Anh20Formula` −0.0395.

**b7 [B]** (charge dispersion dies exponentially; Correction K2, p. 284) · Terms `qc-charge-dispersion`
- G: "How fast does the charge dependence die with $E_J/E_C$? Exponentially. The lowest level moves by $9.8\times10^{-7}E_C$ over one $n_g$ period at ratio 10, and by a thousand times less, $1.0\times10^{-9}E_C$, at ratio 20. The anharmonicity falls only from $0.070$ to $0.046$."
- F: "Exact [[qc-charge-dispersion|charge dispersion]] $\epsilon_0 = E_0(\tfrac12) - E_0(0)$: $9.759\times10^{-7}E_C$ at $r = 10$, $1.009\times10^{-9}E_C$ at $20$ (ratio $967$). The page's $\epsilon_k \simeq (-1)^kE_C\frac{2^{4k+3}}{k!}\sqrt{\tfrac2\pi}(2E_J/E_C)^{k/2+3/4}e^{-\sqrt{2E_J/E_C}}$ gives $0.690\,E_C$ at $r = 10$; our calculation finds the exponent must be $\sqrt{32E_J/E_C}$ (prefactor as printed): $1.028\times10^{-6}E_C$ and $1.046\times10^{-9}E_C$, within $5\,\%$ and $4\,\%$ of the exact values (Correction K2)."
- Cap G/F "charge dispersion against the ratio, log axis: exact, corrected formula, printed formula" · Stage `pp(r = 5, 10, 15, 20, 25, 30; groups 'exact', 'exponent √(32r)', 'printed'; yScale log)` · Claims `q27Disp10` 9.759e-7, `q27Disp20` 1.009e-9, `q27DispRatio_10_20` 967, `q27Disp10Printed` 0.690, `q27Disp10Koch` 1.028e-6, `q27Disp20Koch` 1.046e-9.

**b8 [C]** (doubling the ratio)
- Q G: "$E_J/E_C$ doubles from 10 to 20. By what factor does the charge dependence fall, and by what factor the anharmonicity?" · Q F: "Ratios $\epsilon_0(10)/\epsilon_0(20)$ and $|\alpha(10)/\alpha(20)|$."
- Reveal G: "By $967$ for the charge dependence, by only $1.52$ for the anharmonicity: coherence is bought at a small price." · Reveal F: "$\epsilon_0$: $966.9$; $|\alpha|$: $0.06956/0.04575 = 1.520$ (exact values)."
- Cap G/F "a thousandfold gain for a third of the anharmonicity" · Stage q `pp(b7 exact)`, reveal `pp(b7, with the b6 values)` · Claims `q27DispRatio_10_20` 967, `q27AnhRatio_10_20` 1.52.

**b9 [D]** (other designs; words, pp. 282–283, 287–288)
- G: "Other designs trade differently. A flux qubit sits in a double well like the ammonia molecule of 448 Lecture 11. A phase qubit sits in a tilted cosine well. A 0–π qubit protects itself by its design. We describe these in words."
- F: "Flux qubit ($E_J > E_C$): two wells, a splitting exponentially sensitive to the barrier. Phase qubit: a current-biased junction in a washboard potential with tunnelling readout. The $0$–$\pi$ circuit has two nearly degenerate states at phase $0$ and $\pi$, split by an amount exponentially small in $\sqrt{L/C}$ (pp. 282–283, 287–288). No number of those pages is reproduced or computed here."
- Cap G/F "a double well and a tilted well" · Stage `pp(b4)` · Claims none.

### Unit `q27-cqed` — A qubit coupled to a resonator
**b1 [B]** (the Jaynes–Cummings block returns, p. 285) · Terms `qc-circuit-qed` · Bridge `qc-l12-driven`, Chapter Q26 (words)
- G: "Couple the transmon to a microwave resonator: a two-level system and one mode, as in Chapter Q26's atom and light. Keep only terms that conserve energy, the rotating-wave idea of Lecture 12. At resonance the dressed levels split by $2g\sqrt{n+1}$: $20.0$, $28.3$, $34.6$ MHz for $g/2\pi = 10$ MHz (model)."
- F: "Quantum Rabi: $\hat H = \tfrac12E\sigma_z + \hbar\omega_r(a^\dagger a + \tfrac12) + \hbar g\sigma_x(a + a^\dagger)$; dropping the counter-rotating terms leaves $\hat H_{JC} = \tfrac12E\sigma_z + \hbar\omega_ra^\dagger a + \hbar g(\sigma_+a + \sigma_-a^\dagger)$ (p. 285), Chapter Q26's block with $\Omega_0 = 2g$; at resonance the splitting is $2g\sqrt{n+1}$: $20.0$, $28.28$, $34.64$, $40.0$, $44.72$ MHz for $n = 0\ldots4$ (model, ours)."
- Cap G/F "splitting at resonance grows as √(n+1)" · Stage `pp(n = 0…4, splitting in MHz)` · Claims `q27VacRabiMHz` 20.

**b2 [B]** (strong coupling and the cooperativity, p. 286) · Terms `qc-cooperativity`
- G: "Coherent exchange needs $g$ to beat both losses: the resonator's decay rate $\kappa$ and the qubit's $\gamma = 1/T_1$. The ratio $C = g^2/\kappa\gamma$ is the cooperativity. Model: $g/2\pi = 10$ MHz, $Q = 10^7$ at 10 GHz, $T_1 = 100$ µs. Then $\kappa/2\pi = 1.0$ kHz, $\gamma/2\pi = 1.59$ kHz, $C = 6.3\times10^7$."
- F: "Strong coupling $\gamma, \kappa \ll g \ll E, \omega_r$; $C = g^2/\kappa\gamma$ (p. 286). Model inputs (ours: round numbers in the spirit of the page's example, not measurements): $\kappa = \omega_r/Q$, $\gamma = 1/T_1$; $C = 6.283\times10^7$. What atoms in cavities have reached is far smaller (words)."
- Cap G/F "the coupling dwarfs the two loss rates (log scale)" · Stage `pp(g 10000, κ 1.0, γ 1.59 kHz; yScale log)` · Claims `q27Kappa_kHz` 1.0, `q27Gamma_kHz` 1.59, `q27Coop` 6.283e7.

**b3 [B]** (dispersive readout, D7, p. 286) · Terms `qc-dispersive-readout`
- G: "Detune the qubit far from the resonator, $|\Delta| \gg g$. The qubit's energy shifts by $g^2/\Delta$ and the resonator's frequency by $\pm g^2/\Delta$, the sign set by the qubit state. Read the resonator's phase and you read the qubit without destroying it. At $\Delta/2\pi = 100$ MHz the shifts are $\pm1$ MHz: the two lines sit 2 MHz apart, 2000 times the line width."
- F: "$\hat H \simeq \tfrac12(E + \hbar g^2/\Delta)\sigma_z + (\hbar\omega_r + \hbar g^2\sigma_z/\Delta)a^\dagger a$ (p. 286): the expansion of Chapter Q26 with $\Omega_0 = 2g$. $\chi = g^2/\Delta = 1.000$ MHz$/2\pi$ (model); the two qubit states put the line at $\pm\chi$, separated by $2\chi = 2$ MHz against $\kappa/2\pi = 1$ kHz: ratio $2000$. Non-destructive: no energy is exchanged."
- Cap G/F "the shift g²/Δ against the detuning" · Stage `pp(Δ/2π = 20, 50, 100, 200, 400 MHz → g²/Δ)` · Claims `q27DispShiftMHz` 1.000, `q27ReadoutRatio` 2000 · Derivation D7.

**b4 [B]** (qubits coupled through the resonator; iSWAP, p. 287) · Terms `qc-iswap` · Bridge `qc-q4-circuits`
- G: "Two qubits on one resonator swap excitations through virtual photons at rate $g^2/\Delta$. Left on for $g^2t/\Delta = \pi/2$ they swap, up to a factor $i$: iSWAP. For the model numbers $t = 250$ ns. Half that time gives chance $0.5$ for $|01\rangle \to |10\rangle$."
- F: "(15.11) exchange term $\hbar(g^2/\Delta)(\sigma_{+,1}\sigma_{-,2} + {\rm h.c.})$: $|01\rangle \to \cos\tau|01\rangle - i\sin\tau|10\rangle$, $\tau = g^2t/\Delta$ (engine: matrix exponential); $\tau = \pi/2$ is the iSWAP type, $\tau = \pi/4$ gives swap chance $0.5$; $t = (\pi/2)\Delta/g^2 = 250.0$ ns for $g/2\pi = 10$ MHz and $\Delta/2\pi = 100$ MHz. Two iSWAPs with one-qubit gates make a CNOT (the page; cited, not re-derived)."
- Cap G/F "|01⟩ swaps into |10⟩: all of the weight crosses at τ = π/2" · Stage `split(circ(C_ISW(π/2),1) / amp(C_ISW(π/2),1,'probability'))` · Claims `q27IswapNs` 250, `q27ISwapQuarterP` 0.5.

**b5 [C]** (a larger detuning)
- Q G: "Same model, but $\Delta/2\pi = 200$ MHz. How long is the iSWAP, and how big is the dispersive shift?" · Q F: "Evaluate $t = (\pi/2)\Delta/g^2$ and $\chi = g^2/\Delta$ at $\Delta/2\pi = 200$ MHz."
- Reveal G: "$500$ ns and $0.5$ MHz: a larger detuning slows the gate and weakens the readout. Detuning trades one against the other." · Reveal F: "$t = 500$ ns, $\chi/2\pi = 0.5$ MHz; both scale with $\Delta$ and $1/\Delta$."
- Cap G/F "doubling Δ halves χ and doubles t" · Stage q `pp(b3)`, reveal `pp(b3, marker Δ = 200 MHz)` · Claims `q27Iswap200Ns` 500, `q27DispShift200` 0.5.

### Unit `q27-dots` — One electron spin in a gated dot
**b1 [B]** (a spin in a field, pp. 289–290) · Terms `qc-quantum-dot` · Bridge `qc-l1-quantized`
- G: "An electron's spin in a field $B$ has two energies, $\pm\mu_BB$, split by $2\mu_BB$. At $0.1$ T the splitting is $2.80$ GHz, close to the circuits' $5$ GHz. In temperature that is $134$ mK. At $1.4$ T it is $39.2$ GHz."
- F: "[[qc-quantum-dot|Quantum-dot]] spin qubit: $|0\rangle = |{\uparrow}\rangle$, $|1\rangle = |{\downarrow}\rangle$, $U_{0/1} = \pm\mu_BB$ (p. 289). Here $|0\rangle$ is the upper level; the course's geometric lock is unchanged (C13). $f = 2\mu_BB/h = 2.7992$ GHz at $0.1$ T, $39.19$ GHz at $1.4$ T; $hf/k_B = 134.3$ mK at $0.1$ T (the page rounds to $135$)."
- Cap G/F "the two clocks of a spin in a field: the arrow precesses at the Zeeman frequency" · Stage `ck(2,1,90)` · Claims `q27Zeeman01GHz` 2.799, `q27ZeemanT_mK` 134.3, `q27Zeeman14GHz` 39.19.

**b2 [B]** (loading, initialising, reading, pp. 290–291)
- G: "Wait with the field on and the spin relaxes to its lower level. The chance of the lower level at temperature $T$ is $1/(1 + e^{-hf/k_BT})$: $0.793$ at 100 mK, $0.9988$ at 20 mK. To read the spin, let one spin state tunnel out of the dot and sense the charge change next to it. The reading destroys the state."
- F: "Two-level thermal chance $P_\downarrow = 1/(1 + e^{-hf/k_BT})$: $0.7931$ at $100$ mK, $0.99879$ at $20$ mK for $f = 2.7992$ GHz (model temperatures, ours); spin-dependent tunnelling plus a quantum point contact turn spin into charge, destructively (pp. 290–291). Readout fidelities and the non-destructive variants are described there and not repeated as numbers."
- Cap G/F "chance of the lower level against temperature, log axis" · Stage `pp(T = 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1 K; xScale log)` · Claims `q27ZeemanPDown_100mK` 0.7931, `q27ZeemanPDown_20mK` 0.99879.

**b3 [B]** (a one-qubit gate, p. 291) · Bridge `qc-l12-driven`
- G: "A microwave field at the Zeeman frequency turns the spin: Rabi flopping, as in Lecture 12. The rate is $\Omega = \mu_BB_x/\hbar$. For $\Omega/2\pi = 10$ MHz you need $B_x = 0.714$ mT, and a flip takes $50$ ns."
- F: "$\mathbf B = B_0\hat z + B_x\cos(\omega_qt)\hat x$, $\omega_q = 2\mu_BB_0/\hbar$; in the rotating-wave approximation $\Omega = \mu_BB_x/\hbar$ (p. 291; <<qc-l12-driven|Unit 12.7>>). Rabi's formula, $T_1$, $T_2$ and Ramsey belong to Chapter Q24; only $t_\pi = \pi/\Omega$ is used here. Model $\Omega/2\pi = 10$ MHz: $B_x = 0.7145$ mT, $t_\pi = 50.0$ ns."
- Cap G/F "a π pulse flips |0⟩ to |1⟩" · Stage `split(circ(C_X,1) / amp(C_X,1,'probability'))` · Claims `q27RabiBx_mT` 0.7145, `q27PiTimeNs` 50.

**b4 [B]** (exchange between neighbours, pp. 292–293) · Terms `qc-exchange-interaction`
- G: "Two electrons in neighbouring dots feel the Coulomb force and the Pauli rule. The spin-singlet and spin-triplet states get different energies, $D + K$ and $D - K$. As spin operators that is $-2K\,\mathbf s_1\cdot\mathbf s_2$: a Heisenberg coupling, $J = -2K$."
- F: "With symmetric and antisymmetric orbitals the Coulomb term is diagonal, $H_{11} = D + K$, $H_{22} = D - K$ (direct and exchange integrals, p. 293): $S = \psi_s\chi_{as}$ at $D + K$, $T = \psi_{as}\chi_s$ at $D - K$; with $\langle\mathbf s_1\cdot\mathbf s_2\rangle = -\tfrac34, \tfrac14$ the energies are $D - K/2 - 2K\langle\mathbf s_1\cdot\mathbf s_2\rangle$ (engine: eigenvalues of $\mathbf s_1\cdot\mathbf s_2$ are $-0.75, 0.25, 0.25, 0.25$; $E_S - E_T = 2K$). $\hat H_{ex} = -2K\,\mathbf s_1\cdot\mathbf s_2$ (15.12)."
- Cap G/F "the table of σ₁·σ₂: −3 on the singlet, +1 on the three triplets; s₁·s₂ is a quarter of it" · Stage `mx({lin:[{c:'+1',src:{pauli:'XX'}},{c:'+1',src:{pauli:'YY'}},{c:'+1',src:{pauli:'ZZ'}}]})` (`MatrixCoef` has no ¼: the caption divides) · Claims `q27S1S2Eigen` −0.75, 0.25, `q27ES` 1.1, `q27ET` 0.9 (model $D = 1$, $K = 0.1$).

**b5 [B]** (swap and half a swap, p. 294) · Terms `qc-sqrt-swap` · Bridge `qc-q19-simulation`
- G: "This is Chapter Q19's bond gate: keep the coupling on for the right time and the spins swap (<<qc-q19-simulation|Unit 19.5>>: $\sigma_1\cdot\sigma_2 = 2\,{\rm SWAP} - I$). Half the time gives $\sqrt{\rm SWAP}$: afterwards $|01\rangle$ is found as $|10\rangle$ with chance $0.5$."
- F: "A pulse with $\int2K\,dt/\hbar = \pi$ gives $U = e^{i\pi\sigma_1\cdot\sigma_2/4} = e^{i\pi/4}\,{\rm SWAP}$ (15.13; engine gap $0$); with $\pi/2$, $U = e^{i\pi\sigma_1\cdot\sigma_2/8}$, the book's [[qc-sqrt-swap|$\sqrt{\rm SWAP}$]] with its phase $e^{i\pi/8}$, and $U^2 = e^{i\pi/4}\,{\rm SWAP}$; chance $|01\rangle \to |10\rangle$ is $\sin^2(\pi/4) = 0.5$. (The evolution is $e^{-iHt/\hbar}$; the page's first expression has the opposite sign convention, a slip without effect on (15.13).)"
- Cap G/F "full exchange pulse: |01⟩ → |10⟩; half pulse: half and half" · Stage `split(circ(C_EX(π),1) / amp(C_EX(π),1,'probability'))`, then `C_EX(π/2)` · Claims `q27SwapPhaseGap` 0, `q27HalfSwapP` 0.5.

**b6 [B]** (CZ from half swaps, D8, Eq. 15.14, p. 294)
- G: "Half a swap is entangling. Put two half swaps around a one-qubit turn, add one-qubit turns on each side, and the result is exactly CZ. We checked Eq. 15.14 with matrices, global phase included."
- F: "$CZ = e^{-3i\pi/4}e^{i\pi Z_1/4}e^{-i\pi Z_2/4}\sqrt{\rm SWAP}\,e^{i\pi Z_1/2}\sqrt{\rm SWAP}$ (15.14, image checked) with $\sqrt{\rm SWAP} \equiv e^{i\pi\sigma_1\cdot\sigma_2/8}$, phase included: the product equals ${\rm diag}(1,1,1,-1)$ to $2.5\times10^{-16}$ (engine). On $|{+}{+}\rangle$ the concurrence is $1$."
- Cap G/F "the two half swaps and the turns; the result entangles |++⟩ fully" · Stage `split(circ(C_CZD,5) / tq(C_CZD,5))` · Claims `q27Cz1514Gap` 0, `q27CzDotConc` 1 · Derivation D8.

**b7 [C]** (the field for 5.3 GHz)
- Q G: "At what field does a spin qubit's frequency equal the LC circuit's $5.305$ GHz?" · Q F: "Solve $2\mu_BB/h = 5.305$ GHz for $B$."
- Reveal G: "$B = 0.1895$ T, about twice the $0.1$ T of the first beat." · Reveal F: "$B = hf/2\mu_B = 0.18952$ T."
- Cap G/F "the same two clocks, tuned" · Stage q `ck(2,1,90)`, reveal `ck(3,1,90)` · Claims `q27ZeemanB5GHz` 0.1895.

**b8 [D]** (a dot as a box, p. 292)
- G: "Why is a dot one electron in a box? Take a box 100 nm wide and an effective mass of $0.067$ electron masses (model, ours). The levels are $0.561$ and $2.245$ meV: a gap of $1.684$ meV, which is $19.5$ K. At 100 mK, $k_BT$ is $8.6\,\mu$eV, so higher orbitals stay empty."
- F: "448 Lecture 13's box $E_n = n^2h^2/8m^*L^2$: $E_1 = 0.5612$ meV, $E_2 - E_1 = 3E_1 = 1.684$ meV $= 19.54$ K at $L = 100$ nm, $m^* = 0.067\,m_e$ (model; engine: `boxEnergyEv`); $k_BT = 8.617\,\mu$eV at $100$ mK: the book's condition $\delta U \gg k_BT$ (p. 292). Coherence times, isotope effects and donor qubits (pp. 295–297) are in the book in words and not repeated."
- Cap G/F "the two lowest box states" · Stage `wf(box L = 4, n = [1, 2])` with `readouts: ['energy']` (448 units, ħ = m = 1) · Claims `q27DotE1_meV` 0.5612, `q27DotGap_meV` 1.684, `q27DotGapK` 19.54, `q27DotKT100mK_ueV` 8.617.

### 1.7 Claim ledger (key — engine call — value; numpy in `planQ26Q27-numpy.py`; every `…Gap` key is an engine max-abs difference, value 0; model inputs are V constants too)
- lc: `q27LcOmega/FreqGHz/LambdaCm/LambdaOverChip/Z` 3.333e10, 5.305, 5.65, 56.5, 100 · `q27CommGap` 0 · `q27LeakRatio` 1.4142 · `q27HfOverK` 0.2546 · `q27Nbar300` 1178 · `q27P0_300/1K/20mK` 0.0008, 0.2248, 0.999997 · `q27Nbar20mK` 2.96e-6 · `q27T99mK` 55.3.
- superconductivity: `q27CooperB/Approx/Ratio` 2.549e-3, 2.545e-3, 1.0013 · `q27LondonNm` 26.57 · `q27Phi0` 2.0678e-15 · `q27FluxLoop` 0.4836.
- josephson: `q27JosephsonMHzPerUV` 483.6 · `q27I0nA` 109.7 · `q27Lj60nH` 6 · `q27F60GHz` 3.751 · `q27EJoverH` 54.49 · `q27Squid025/13` 0.7071, 0.5 · `q27SquidHalfFlux` 0.4196.
- transmon: `q27EcFactor` 4 · `q27ZcoTrue/Printed` 0.2, −0.2 · `q27UCut` 0.2236 · `q27GapFull/Cut/Degenerate` 0.4488, 0.4472, 0.1995 · `q27SlopeSweet/Off` 0, −1.80 · `q27F01spread1/20` 1.3757, 1.00000002 · `q27E01_20` 6.063 · `q27SqrtApprox20` 6.325 · `q27LadderTransmon20` (1, 1.954, 2.859, 3.708) · `q27Anh10/20/50` −0.0696, −0.0457, −0.0273 · `q27Anh20Formula` −0.0395 · `q27Disp10/20` 9.759e-7, 1.009e-9 · `q27DispRatio_10_20` 967 · `q27AnhRatio_10_20` 1.52 · `q27Disp10Printed` 0.690 · `q27Disp10Koch/Disp20Koch` 1.028e-6, 1.046e-9.
- cqed: `q27VacRabiMHz` (20, 28.28, 34.64, 40, 44.72) · `q27Kappa_kHz/Gamma_kHz/Coop` 1.0, 1.59, 6.283e7 · `q27DispShiftMHz` 1.000 · `q27ReadoutRatio` 2000 · `q27IswapNs` 250 · `q27ISwapQuarterP` 0.5 · `q27Iswap200Ns/DispShift200` 500, 0.5.
- dots: `q27Zeeman01GHz/T_mK/14GHz` 2.799, 134.3, 39.19 · `q27ZeemanPDown_100mK/20mK` 0.7931, 0.99879 · `q27RabiBx_mT` 0.7145 · `q27PiTimeNs` 50 · `q27S1S2Eigen` (−0.75, 0.25) · `q27ES/ET` 1.1, 0.9 · `q27SwapPhaseGap`, `q27Cz1514Gap` 0 · `q27HalfSwapP` 0.5 · `q27CzDotConc` 1 · `q27ZeemanB5GHz` 0.1895 · `q27DotE1_meV/Gap_meV/GapK/KT100mK_ueV` 0.5612, 1.684, 19.54, 8.617.

## 2. Derivations (step `tex` — why — **view**; a step without a view keeps the last; Ground ≥ Formal; ≥ 2 views each, each a kind the unit's stage already shows)
**D3 · superconductivity:b3 · `\Phi = p\,\Phi_0,\ \Phi_0 = h/2e`** — G (3): (1) with no current the pair phase changes along the ring by $\nabla\theta = 2e\mathbf A/\hbar$ · **pp(allowed fluxes)** · (2) after one loop the wave function must return to itself: the phase has turned a whole number $p$ of times, $2\pi p$ · (3) the loop sum of $\mathbf A$ is the flux $\Phi$: $2e\Phi/\hbar = 2\pi p$, so $\Phi = p\,h/2e$ · **pp(+ the 1 µm² example)**. F (2): (1) zero current and Stokes' theorem · **pp** · (2) single-valuedness gives the result · **pp(+ example)**.
**D4 · josephson:b1 · `I = I_0\sin\theta,\ \dot\theta = 2eV/\hbar`** — G (4): (1) write each side as density times phase factor, $\psi_j = \sqrt{n_j}\,e^{i\theta_j}$ · **pp(sin θ)** · (2) put into the tunnelling equations; the imaginary part is $\dot n_1 = (2K/\hbar)\sqrt{n_1n_2}\sin(\theta_2 - \theta_1)$ · (3) the real part, for $n_1 = n_2$, leaves $\dot\theta_2 - \dot\theta_1 = qV/\hbar$ · **pp(θ against t at fixed V)** · (4) pairs moved times their charge: $I = I_0\sin\theta$. F (3): (1) substitution · **pp(sin)** · (2) the two parts · (3) result · **pp(θ(t))**.
**D5 · transmon:b2 · `\hat H \simeq -E_C(n_g - \tfrac12)\sigma_z - \tfrac{E_J}2\sigma_x`** — G (3): (1) keep $n = 1, 0$: diagonal entries $E_C(1 - n_g)^2$ and $E_Cn_g^2$ · **pp(parabolas)** · (2) subtract their mean: $\sigma_z$ weight $= \tfrac12(E_C(1-n_g)^2 - E_Cn_g^2) = -E_C(n_g - \tfrac12)$ · (3) $\cos\hat\theta$ moves one pair: off-diagonal $-E_J/2$ · **pp(gap, cut)**. F (2): (1) 2×2 block and its mean · **pp(parabolas)** · (2) result and $\pm U$ · **pp(gap, cut)**.
**D6 · transmon:b5 · `g'' + [4E/E_C + (4E_J/E_C)\cos2\phi]\,g = 0`** — G (3): (1) $\hat n = -i\,d/d\theta$ turns (15.8) into $-E_C\psi'' + \ldots$ after the shift $e^{in_g\theta}$ · **pp(levels)** · (2) put $\theta = 2\phi$: derivatives gain a factor $\tfrac14$ · (3) divide by $E_C/4$: Mathieu's equation, $a = 4E/E_C$, $q = -2E_J/E_C$ · **pp(levels, exact vs harmonic)**. F (2): (1) $g(\phi) = e^{-2in_g\phi}\psi(2\phi)$ · **pp** · (2) result · **pp**.
**D7 · cqed:b3 · `\chi = g^2/\Delta`** — G (3): (1) block energies $\pm\tfrac12\sqrt{\Delta^2 + 4g^2(n+1)}$ · **pp(shift against Δ)** · (2) expand for $|\Delta| \gg g$: $\tfrac\Delta2 + g^2(n+1)/\Delta$ · (3) qubit and resonator shifts $\pm g^2/\Delta$ · **pp(marker Δ = 100 MHz)**. F (2): (1) expansion, Q26's with $\Omega_0 = 2g$ · **pp** · (2) result · **pp(marker)**.
**D8 · dots:b6 · `CZ = e^{-3i\pi/4}e^{i\pi Z_1/4}e^{-i\pi Z_2/4}\sqrt{\rm SWAP}\,e^{i\pi Z_1/2}\sqrt{\rm SWAP}`** — G (3): (1) a half swap leaves $|00\rangle$ and $|11\rangle$ alone and mixes $|01\rangle$ with $|10\rangle$ · **circ(C_CZD,2)** · (2) between two half swaps the turn $e^{i\pi Z_1/2} = iZ_1$ gives $|01\rangle$ and $|10\rangle$ opposite signs, which turns the double mixing into pure phases: the product is a diagonal table · (3) one-qubit $Z$ turns before and after fix all phases but the sign of $|11\rangle$: CZ · **tq(C_CZD,5)**. F (2): (1) in the $\{|01\rangle,|10\rangle\}$ block the half swap is $(1 + i\sigma_x)/\sqrt2$ and $(1+i\sigma_x)\sigma_z(1+i\sigma_x)/2 = \sigma_z$ · **circ** · (2) result, gap $2.5\times10^{-16}$ · **tq**.
**viewCaptions:** D3 "the allowed fluxes" / "an applied flux between them" · D4 "current against phase" / "the phase grows linearly at fixed V" · D5 "charge-state parabolas" / "gap, full and cut" · D6 "the lowest levels" / "exact against harmonic" · D7 "shift against detuning" / "the 100 MHz point" · D8 "after the first half swap" / "the finished gate on |++⟩".

## 3. Try-it widgets (props read from `TwoClocks.tsx`, `PhaseDial.tsx`, `BlochSphere.tsx`, `PairGrid.tsx`, `ComplexPlaneQc.tsx`; every readout wording re-read by the builder in `Q27.tryits.test.tsx`; ✓ = tested wording from L11 or Q19)
| Unit | Spec | Try this |
|---|---|---|
| lc | `two-clocks {upper:3, lower:1, start:'+x'}` | ✓ Raise the mean energy Ē from 2ε to 4ε: both hands run faster, but the gap, $P(+x)$ and the arrow do not change: only the spacing between the two chosen rungs matters. |
| superconductivity | `complex-plane {mode:'roots', N:6, j:1}` | ✓ Six arrows 60° apart close the loop after one turn: a phase must come back to itself, only whole turns are allowed; "sum = 0". |
| josephson | `phase-dial {theta:90, rotations:true}` | The two-site wave function $(\sqrt{n_1}, \sqrt{n_2}e^{i\theta})$ is a point on the equator: set $\theta = 90°$ ($+y$, current $I_0$) and $180°$ ($-x$, current 0). |
| transmon | `bloch {theta:90, phi:0, editable:true, measure:'z', rotations:true}` | At the sweet spot the eigenstates are equal superpositions of $|0\rangle$ and $|1\rangle$ (the equator): the $z$ reading is $0.5$, $0.5$. |
| cqed | `pair-grid` (ud–du family) | Slide $t$ to 45°: equal weights on $|ud\rangle$ and $|du\rangle$, the half-way state of the exchange (up to a factor $i$, as the widget's family is real). |
| dots | `two-clocks {upper:2, lower:1, start:'+x'}` | ✓ Drag the time slider: the arrow on the equator turns at the gap of the two clocks: the Zeeman frequency. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0; full walkthroughs: no sheet assigns any of these; P15.1–P15.4 are not used)
- **lc** 1 warm-up numeric `q27-l-f` $f$ for $C = 0.3$ pF, $L = 3$ nH, GHz → **5.305**. 2 core numeric `q27-l-p0` chance of the ground state at 1 K → **0.2248**. 3 core numeric `q27-l-t99` temperature in mK for chance $0.99$ → **55** (int).
- **superconductivity** 1 warm-up numeric `q27-s-phi0` $\Phi_0$ in units of $10^{-15}$ Wb → **2.068**. 2 core numeric `q27-s-loop` flux quanta from 1 mT through 1 µm² → **0.484**. 3 core choice `q27-s-charge` "$\Phi_0 = h/2e$, not $h/e$, because" → **the carriers are pairs of charge $2e$** ✓.
- **josephson** 1 warm-up numeric `q27-j-freq` AC Josephson frequency per µV in MHz, nearest whole → **484** (int). 2 core numeric `q27-j-f60` $f(60°)/f(0°)$ → **0.707**. 3 core numeric `q27-j-squid` $\Phi/\Phi_0$ at half the frequency → **0.420**.
- **transmon** 1 warm-up numeric `q27-t-spread` maximum over minimum of $f_{01}$ at ratio 1 → **1.376**. 2 core numeric `q27-t-anh` exact $\alpha$ at ratio 10 → **−0.0696** (answer $-0.07 \pm 0.005$). 3 core choice `q27-t-ratio` "ratio 10 → 20" → **the charge dependence falls about a thousandfold, the anharmonicity by about a third** ✓. 4 stretch numeric `q27-t-fac` factor of fall of the charge dispersion, nearest whole → **967** (int).
- **cqed** 1 warm-up numeric `q27-c-coop` $C$ in units of $10^7$ → **6.283**. 2 core numeric `q27-c-iswap` iSWAP time in ns → **250** (int). 3 core numeric `q27-c-ratio` shift separation over line width → **2000** (int).
- **dots** 1 warm-up numeric `q27-d-f` qubit frequency at $0.1$ T in GHz → **2.799**. 2 core numeric `q27-d-pi` π-pulse time in ns at $\Omega/2\pi = 10$ MHz → **50** (int). 3 core numeric `q27-d-half` chance $|01\rangle \to |10\rangle$ after half an exchange pulse → **0.5**. 4 stretch numeric `q27-d-b5` field in T for $5.305$ GHz → **0.1895**.

## 5. Glossary (new in 709; checked against `ids.json`: all 20 ids free; reused: `hamiltonian`, `two-level-system`, `tunnelling`, `rotating-wave`, `qc-swap-gate`, `qc-phase-gate`, `qc-heisenberg-chain`, `qc-bloch-sphere`)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-lumped-element` | lumped-element circuit | — | A circuit much smaller than the wavelength of its own oscillation, treated as single lumps. | Elements of size $\ll \lambda = c/f$, described by $L$ and $C$ alone (p. 271). | lc:b2 | — |
| `qc-flux-charge` | flux and charge $\hat\Phi, \hat Q$ | notation | The circuit's position-like and momentum-like variables. | $[\hat\Phi, \hat Q] = i\hbar$, $\hat H = \hat Q^2/2C + \hat\Phi^2/2L$. | lc:b3 | `qc-l11-two-level` |
| `qc-cooper-pair` | Cooper pair | — | Two electrons bound by a weak attraction, carrying charge $2e$ and acting as a boson. | A bound pair of conduction electrons of charge $2e$, binding $\simeq 2E_ce^{-2/N_FV}$ (p. 275). | superconductivity:b1 | — |
| `qc-meissner-effect` | Meissner effect | — | A superconductor pushes a magnetic field out, except for a thin skin. | $\nabla^2\mathbf B = \mathbf B/\lambda^2$, field $\propto e^{-x/\lambda}$ (p. 276). | superconductivity:b2 | — |
| `qc-flux-quantum` | flux quantum $\Phi_0$ | — | The smallest unit of magnetic flux a superconducting ring can hold: $h/2e$. | $\Phi = p\,\Phi_0$, $\Phi_0 = h/2e$ (p. 277). | superconductivity:b3 | — |
| `qc-josephson-junction` | Josephson junction | — | Two superconductors separated by a thin insulator through which pairs tunnel. | A tunnel junction with $I = I_0\sin\theta$, $\dot\theta = 2eV/\hbar$ (p. 278). | josephson:b1 | `qc-l11-two-level` |
| `qc-josephson-inductance` | Josephson inductance | — | The inductance of a junction, which depends on its phase. | $L_J = \Phi_0/(2\pi I_0\cos\theta)$ (p. 279). | josephson:b2 | — |
| `qc-squid` | SQUID | — | A ring with two junctions whose tunnelling strength the flux through the ring tunes. | $E_J \to 2E_J|\cos(\pi\Phi/\Phi_0)|$ (15.7). | josephson:b4 | — |
| `qc-charge-qubit` | charge qubit | — | A small island of Cooper pairs whose two lowest charge states form the qubit. | $\hat H = E_C(\hat n - n_g)^2 - E_J\cos\hat\theta$ on $n = 0, 1$ (15.8–15.9). | transmon:b1 | `qc-l11-two-level` |
| `qc-charging-energy` | charging energy $E_C$ | notation | The energy cost of one extra Cooper pair on the island. | $E_C = (2e)^2/2C_\Sigma$; four times $e^2/2C_\Sigma$. | transmon:b1 | — |
| `qc-transmon` | transmon | — | A charge qubit run with a large ratio $E_J/E_C$, so charge noise barely matters. | The Cooper-pair box at $E_J/E_C \gg 1$ (p. 283). | transmon:b4 | — |
| `qc-anharmonicity` | anharmonicity | — | The amount by which the rungs of a ladder are unevenly spaced. | $\alpha = (E_{21} - E_{10})/E_{10}$. | transmon:b6 | — |
| `qc-charge-dispersion` | charge dispersion | — | How much a level's energy changes as the gate charge goes through one period. | $\epsilon_k = E_k(n_g = \tfrac12) - E_k(n_g = 0)$. | transmon:b7 | — |
| `qc-circuit-qed` | circuit QED | — | A qubit on a chip coupled to a microwave resonator. | A superconducting qubit coupled to a resonator mode, the quantum Rabi or JC model (p. 285). | cqed:b1 | — |
| `qc-cooperativity` | cooperativity $C$ | — | How far the qubit–resonator coupling beats the two loss rates. | $C = g^2/\kappa\gamma$ (p. 286). | cqed:b2 | — |
| `qc-dispersive-readout` | dispersive readout | — | Reading a qubit from the small, state-dependent shift of a resonator's frequency. | $\omega_r \to \omega_r \pm g^2/\Delta$ for $|\Delta| \gg g$ (p. 286). | cqed:b3 | — |
| `qc-iswap` | iSWAP gate | — | A swap of two qubits that also puts a factor $i$ on the swapped part. | ${\rm iSWAP}$: $|01\rangle \to -i|10\rangle$, $|10\rangle \to -i|01\rangle$, $|00\rangle, |11\rangle$ fixed (this sign convention). | cqed:b4 | `qc-q4-circuits` |
| `qc-quantum-dot` | quantum dot | — | A tiny region that holds a few electrons, like an artificial atom. | A gate-defined potential well with discrete orbitals (p. 290). | dots:b1 | — |
| `qc-exchange-interaction` | exchange interaction | — | The energy difference between spin singlet and triplet caused by Coulomb repulsion and the Pauli rule. | $\hat H_{ex} = J\,\mathbf s_1\cdot\mathbf s_2$, $J = -2K$ (15.12). | dots:b4 | `qc-q19-simulation` |
| `qc-sqrt-swap` | √SWAP | — | The gate that is half a swap and entangles two spins. | $e^{i\pi\boldsymbol\sigma_1\cdot\boldsymbol\sigma_2/8}$, whose square is SWAP up to a phase (15.13). | dots:b5 | `qc-q4-circuits` |

## 6. Review cards
- **lc** G: an LC circuit is an oscillator with equal rungs; cold enough, it is quantum. F: Table 15.1. Eq $\omega = 1/\sqrt{LC}$. Trap: "equal rungs make a good qubit".
- **superconductivity** G: pairs, no resistance, flux in whole quanta. F: (15.2)–(15.6). Eq $\Phi = p\,h/2e$. Trap: "$\Phi_0 = h/e$".
- **josephson** G: a junction is an inductor that depends on the phase; a SQUID tunes it. F: $I = I_0\sin\theta$, $L_J$. Eq $L_J = \Phi_0/2\pi I_0\cos\theta$. Trap: "the current depends on the voltage".
- **transmon** G: large $E_J/E_C$ kills charge noise and keeps some anharmonicity. F: (15.8), Mathieu, $\epsilon_k$, $\alpha$. Eq $\alpha \simeq -1/\sqrt{32E_J/E_C}$. Trap: "anharmonicity must be large".
- **cqed** G: readout by a small frequency shift; coupling by virtual photons. F: (15.11). Eq $\chi = g^2/\Delta$. Trap: "readout needs the qubit to emit".
- **dots** G: spin in a field, exchange pulses give SWAP, half a SWAP, then CZ. F: (15.12)–(15.14). Eq $U = e^{i\pi\sigma_1\cdot\sigma_2/4} = e^{i\pi/4}{\rm SWAP}$. Trap: "the spins interact by their magnetic fields".

## 7. Symbol-before-use
**7.1 Ground:** $L$, $C$, $\omega$, $f$, $I$ lc:b1–b2 · $\Phi$, $Q$, $Z$ b3 · $\bar n$ b5 · $N_FV$, $E_c$, $b$ superconductivity:b1 · $\lambda$ b2 · $\Phi_0$, $p$ b3 · $K$, $\theta$, $I_0$, $L_J$, $E_J$ josephson:b1–b3 · $E_C$, $n$, $n_g$ transmon:b1 · $U$ b2 · $r = E_J/E_C$ b4 · $\alpha$, $\epsilon$ b6–b7 · $g$, $\kappa$, $\gamma$, $C$, $\Delta$, $\chi$ cqed:b1–b3 · $\mu_B$, $B$, $\Omega$ dots:b1–b3 · $D$, $K$, $\mathbf s_1\cdot\mathbf s_2$ b4. **FLAGS:** $C$ is capacitance (lc), cooperativity (cqed) and concurrence (cited from Q12): the Formal track writes $C_{\rm coop}$ for the cooperativity, as `P-709-map.md` C-list proposes; $E_C$ is the book's (4× the common one); $K$ is tunnelling strength (josephson) and exchange integral (dots); $\Delta$ = detuning (cqed). **7.2 Formal:** adds $\hat\Phi$, $\hat Q$, $a$, $a^\dagger$ lc:b3 · $\sigma_{x,z}$, $\epsilon_k$ transmon:b2, b7 · $\sigma_\pm$ cqed:b1. Counts: 0 used before definition in either track (to confirm by the symbols test).

## 8. Errata (Correction boxes; the review re-verifies each on the page image)
- **K1 — Bergou p. 281 (PDF 287), Eq. 15.9** *(image checked; the map's B34, first bullet)*. says: $H = E_C(n_g - 1/2)\sigma_z - (E_J/2)\sigma_x$ in the basis $|+\rangle, |-\rangle$ of $n = 1, 0$. shouldSay: "Our calculation finds $-E_C(n_g - \tfrac12)\sigma_z$ for that basis: at $E_C = 1$, $E_J = 0.2$, $n_g = 0.3$ the $\sigma_z$ weight is $+0.2$, not $-0.2$ (the state $n = 1$ lies above $n = 0$ for $n_g < \tfrac12$). With the printed sign $|0\rangle$ is the upper state, $+U$." `check: close(V.q27ZcoTrue, 0.2, 1e-12) && close(V.q27ZcoPrinted, -0.2, 1e-12)` (engine: the $2\times2$ block of Eq. 15.8).
- **K2 — Bergou p. 284 (PDF 290), the charge dispersion** *(image checked)*. says: $\epsilon_k \simeq (-1)^kE_C\frac{2^{4k+3}}{k!}\sqrt{\tfrac2\pi}(\tfrac{2E_J}{E_C})^{k/2+3/4}e^{-\sqrt{2E_J/E_C}}$. shouldSay: "Our calculation finds the exponent must be $-\sqrt{32E_J/E_C}$ (the prefactor and power are right for the page's $E_C$): at $E_J/E_C = 10$ the exact dispersion is $9.76\times10^{-7}E_C$, the printed form gives $0.69E_C$ and the corrected one $1.03\times10^{-6}E_C$." `check: V.q27Disp10Printed / V.q27Disp10 > 1e5 && close(V.q27Disp10Koch / V.q27Disp10, 1.053, 0.01)`.
- **Rosetta (not boxed):** the page's "typically $10$–$50$" and "$10$–$100$" for the ratio read as the common $E_C$ ($e^2/2C_\Sigma$), a quarter of the page's own (map B34, second bullet, *unsure*): we state the factor $4$ (a computed fact) and give the quoted ranges as words only.
- **Checked, no box** (engine or numpy): (15.1)–(15.5), the London length for the page's density and its formula (the $n$ of "charge density" is the book's), (15.6)–(15.7), the Josephson relations (two-site integration), $L_J$, the Mathieu mapping $q = -2E_J/E_C$, $\alpha \simeq -1/\sqrt{32E_J/E_C}$ (a leading form), $C > 10^7$ for the page's example, $g^2t/\Delta = \pi/2$ giving a swap up to $i$, $2.8$ GHz at $0.1$ T ($134.3$ mK; the page's $135$ is a rounding), the exchange energies $D \pm K$, (15.13), (15.14) **exactly, global phase included, for $\sqrt{\rm SWAP} \equiv e^{i\pi\sigma\cdot\sigma/8}$**; "$E_J/E_C \ll 10^4$ for $t = 10$ ns" is consistent in order of magnitude only (it needs an unstated transition frequency: with $5$ GHz our bound is $E_J/E_C \ll 3\times10^3$). The sign in $U(t) = e^{i\int\hat H_{ex}/\hbar}$ (p. 294) is the convention $e^{+iHt}$; every result after it is right, so no box.
- **Refinements ("our calculation finds"):** the dispersive formula (p. 286) assumes the sign of $\Delta$ that makes the first dressed state mostly $|e,n\rangle$ (our $\chi$ uses $|\Delta|$).

## 9. Engine gaps and stage contracts
**9.1 Engine** (new `physics/qc/solid.ts`, lazy chunk (rule h), imported by `Q27.values.ts` only; constants from `constants.ts` exports that exist (`H_PLANCK`, `E_CHARGE`, `C_LIGHT`, `K_BOLTZMANN`, `bohrMagneton`, `boxEnergyEv`), `MU_0` local; numpy `pipeline/make_solid_fixtures.py` → `__fixtures__/qc-solid.json`, twins `pipeline/claims_qc709/q27.py`; tests beside): `lcOmega`, `lcFreq`, `lcWavelength`, `lcImpedance`, `thermalN(f,T)`, `thermalGround(f,T)`, `groundTemperature(f,p)`, `oscillatorOps(D)`, `commutatorGap`, `leakRatio()` · `cooperBinding(NV,Ec)`, `fluxQuantum()`, `loopFlux(B,A)`, `londonLength(n)` · `josephsonFreq(V)`, `josephsonI0(LJ0)`, `josephsonL(I0,θ)`, `josephsonEJ(I0)`, `squidScale(Φ/Φ₀)`, `squidFluxFor(s)`, `twoSiteStep(K,qV,ψ0,t)` · `chargeH(EC,EJ,ng,nMax)`, `transmonLevels(EC,EJ,ng,k)` (via `eigh`), `twoLevelCut(EC,EJ,ng)` {zco, xco, U}, `f01Band(r,ng)`, `chargeDispersion(r,k)`, `dispersionPrinted`, `dispersionKoch`, `anharmonicity(r)`, `anharmonicityFormula(r)`, `transmonLadder(r)` · `cooperativity(g,κ,γ)`, `dispersiveShift(g,Δ)`, `iswapTime(g,Δ)`, `exchangeEvolution(τ)`, `vacuumRabi(g,n)` · `zeemanFreq(B)`, `zeemanTemp(f)`, `spinDownChance(f,T)`, `rabiField(Ω)`, `exchangeEnergies(D,K)`, `heisenbergEvolution(φ)`, `sqrtSwapCzGap()`, `dotBox(L,m*)`. Reused: `eigh`, `expmHermitian`, `runCircuit`, `circuitUnitary`, `concurrence`, `rabiFlipTime` (448 `dynamics.ts`).
**Numpy routes (independent, in `planQ26Q27-numpy.py`):** charge-basis diagonalisation (`eigvalsh`) against `scipy.special.mathieu_a/b`; the Cooper gap equation by `quad` + `brentq` against the closed form; truncated-oscillator matrices; `expm` for the two-site, exchange and iSWAP evolutions; a sign scan of Eq. 15.14; two-level thermal chances in closed form. Cross-checks: `transmonLevels` against the Mathieu table at $n_g = 0, \tfrac12$; `sqrtSwapCzGap` below $10^{-12}$; `chargeDispersion` stops at ratio 30 (below $10^{-12}$ the diagonalisation hits double-precision noise).
**9.2 Stage: none new.** Every picture uses an existing kind: `plot` **points mode** (≤ 24 points, ≤ 4 groups, y from `V`, linear or log axes), `circuit` (`unitary` ≤ 4 wires), `amplitudes`, `two-qubit`, `matrix` (`lin` of Pauli strings), `clocks`, `wavefunction` (`box`), `bloch`. Honest limits: dots, not lines, for every curve; `clocks` takes small exact level numbers, so it pictures a Larmor beat, not GHz (the captions say so); `matrix` `lin` takes only the exact coefficients `'+1'`, `'+1/2'`, … (no ¼), so the grid shows $\boldsymbol\sigma_1\cdot\boldsymbol\sigma_2$ and the caption divides by 4; fallback `circ` with one `unitary`. **No curve and no kind is requested**; if the judge wants lines, the smallest additions are one `plot` series `transmonF01` (params `ratio`, x = $n_g$ 0…1) and one curve `transmonDispersion` (x = ratio 2…30, log y), one registry row each.
**9.3 Widgets:** none required; every Try-it is true on today's code (wording re-read by the builder).

## 10. Media (deferred, per BUILD-LOG)
Film: "From evenly spaced rungs to a usable qubit" (manifest keys `q27LadderTransmon20`, `q27Anh20`, `q27F01spread1`, `q27Disp10`; re-checked against the engine). Blender: none (the Part XI cryostat opener belongs to Chapter Q24; Q27 may reuse its opener frame). Decor: a qubit chip on the cold finger (atmosphere only, no numbers).

## 11. Hooks
**11.1 Concept stations** (`concepts.ts`): `qc-lc-station` (lc; needs `qc-f5-probability`, `hamiltonian`) · `qc-flux-quantum-station` (superconductivity; needs the LC station) · `qc-josephson-station` (josephson; needs the previous, `two-level-system`) · `qc-transmon-station` (transmon; needs the Josephson station, `qc-hermitian-matrix`) · `qc-cqed-station` (cqed; needs the transmon station and Q26's Kerr station if built) · `qc-spin-dot-station` (dots; needs the transmon station, `qc-swap-gate`). **11.2 Arcade (Spot the error; `Q27x`):** `qc-lc-qubit` ("an LC circuit's two lowest levels make a good qubit"; why `q27LeakRatio`) · `qc-flux-h-over-e` ("$\Phi_0 = h/e$"; why `q27Phi0`) · `qc-transmon-anharm` ("a transmon needs large anharmonicity"; why `q27AnhRatio_10_20`) · `qc-dot-dipole` ("two spins couple by their magnetic dipoles"; why `q27ES`). **11.3 Bridges.** Existing rows used: `qc-f5-probability`, `qc-f1-phase`, `qc-f4-spectral`, `qc-l1-quantized`, `qc-q4-cnot`, `qc-l11-generator`. **NEW rows (targets built):** `qc-l11-two-level` (shared with the Q24 and Q26 plans: add once) → `l11-two-level`; `qc-l12-driven` → `l12-driven` (also proposed by Q24: add once); `qc-l13-stationary` → `l13-stationary`; `qc-q4-circuits` → `q4-circuits`; `qc-q19-simulation` → `q19-simulation`; optionally `qc-q26-nonlinear` → `q26-nonlinear` if Q26 has merged. Chapters Q24, Q25 are named in words.

## Totals
6 units · 37 beats (6 clues, 2 `deeper`) · 6 derivations (≥ 2 views per track each) · about 110 claim keys (every displayed number; the plotted lists are `V` arrays) · 20 challenges (17 numeric, 3 choice; no assigned homework, all with walkthroughs) · 20 new glossary entries (2 notation beats: `qc-flux-charge`, `qc-charging-energy`) · 2 Corrections (K1, K2) · 5–6 new bridge rows (one shared with Q26) · **0 new stage kinds, 0 new curves, 0 new widgets** · 1 new engine module (`physics/qc/solid.ts`, about 55 functions) with a numpy twin.

## Rulings requested
- R1 **Numbering**: the map's "Q25" is this chapter; the owner's brief numbers it Q27. **Recommend** Q27 and fix the map header in the wiring pass.
- R2 **Reported numbers** (as Q26): words only for experiments, model inputs labelled "ours". **Recommend keep.** Judge: confirm that the cQED model ($g$, $Q$, $T_1$, $\Delta$) and the dot model ($\Omega$, $m^*$, $L$) read as stated models and not as device claims.
- R3 **Stage**: no new curve, kind or widget; `plot` points mode throughout, dots not lines. **Recommend approve**; fallback one series + one curve (§9.2).
- R4 **Corrections K1 and K2** (K1 is the map's B34; K2, the dispersion exponent, is new and re-verified on the page image with an engine check). **Recommend approve both.** The "typical $E_J/E_C$" ranges stay a Rosetta line (B34 *unsure*).
- R5 **Eq. 15.14 has no box**: it holds exactly with the book's own $\sqrt{\rm SWAP}$ phase. **Recommend** no box; the Formal step says so.
- R6 **Overlap with Q26**: the JC block and $\chi$ are Q26's; Q27 links back with $\Omega_0 = 2g$ (bridge row only if Q26 has merged first). **Recommend approve**; the judge orders the two builds (Q26 first).
- R7 **Problems**: P15.1 ($R_{\max}$), P15.3 (derive 15.9) and P15.4 (thermal fidelity) cited only; the K1 check is an engine computation of the $2\times2$ block, not a worked P15.3 (the problem asks for a derivation from $\hat\phi$). **Recommend approve.**
- R8 **Beyond the book**: the LC leakage ratio $\sqrt2$, the harmonic estimate $\sqrt{2E_JE_C}$ and the two-level thermal chance are our own algebra, labelled where used. **Recommend keep.**
- R9 **Collisions** with the parallel Q24/Q25 plans (`qc-rabi…`, `qc-t1`, `qc-zeeman`): Q27 tags none; `qc-iswap`/`qc-sqrt-swap`/`qc-cooperativity` are claimed here (Q25 may need `qc-cooperativity` for atoms: judge decides the owner).

**Cost estimate (builder steps, one builder):** engine + numpy twin + tests ≈ 55 · content (6 units: story, values, review, glossary, challenges, tests, bridges, concepts) ≈ 85 · lints, e2e lists, visual QA and fixes ≈ 30: **about 170 steps**; dropping `transmon:b9`, `dots:b8` and the SQUID beat saves ≈ 12.
