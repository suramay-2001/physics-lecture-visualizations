# P-448-townsend-G4: Townsend Chapters 4 and 6 for Lectures 11, 12, 13 (physics planner [P])

Sources: Townsend 2nd ed., Ch 4 "Time Evolution" (printed pp. 111-140) and Ch 6 "Wave Mechanics in One Dimension" (printed pp. 191-244); page = PDF page - 16.
Digest (git-ignored, equations and figures): `sources/townsend/digest-G4.md`. Numpy ledger: scratchpad `plan-G4-numpy.py` (numpy only, run twice, identical output; keys below are its keys).
Conventions carried: `448-L8L11.md` and `448-L12L13.md` (one voice, sentences <= 25 words, phases lecture -> books -> clue -> deeper, hbar = 1 in the engine and the UI appends it,
S = sigma/2, T(a) for the translation operator, U(t) for time evolution). New beats are `books` beats with a letter id after the unit's existing books beat (`l11-unitary:b4a`).
Paraphrase only. Homework: 448 HW1-HW6 are recorded submitted (`homework-status.md`), so practice questions carry full walkthroughs; they are NEW problems with fresh numbers.

## 0. Findings that shape the plan

1. L11 cites Townsend only for finite rotations (§2.2); its dynamics (U, H, equation, stationary state, two-level) is not matched to Ch 4 at all. L12 cites Ch 4 §4.1 and §4.3 only up to Eq. 4.25-4.28.
   L12-L13 cover Ch 6 §6.1-6.6 and Example 6.5. They lack: §4.2, the rest of §4.3 (Eqs. 4.29-4.33, Examples 4.1-4.2, muon, neutron), §4.4, §4.5, §4.6, §6.6 Example 6.2, the which-slit argument of §6.7, and all of §6.8-6.10 (stationary equation, box, well, current, step, tunnelling).
2. Ownership (one teaching home): Ch 4 §4.1 U/H/stationary state -> **L11** (the notes derive them there; L12-law:b7 becomes a one-line pointer plus Eq. 4.16 below). §4.2 (Eq. 4.16) -> L12-law (time-dependent H lives there). §4.3-4.4 (spin in a field, resonance) -> L12-motion and a new L12 unit.
   §4.5 ammonia (a two-level system with E+ = 3 eps, E- = eps already drawn by `clocks`) -> L11. §4.6 energy-time -> L13-time (the lecture already denies a time operator). §6.8-6.10 -> two new L13 units.
3. **Errata:** one slip with physics: Townsend p. 231 prints T = 0.68 for E = 5 eV, V0 = 10 eV, a = 0.53 angstrom; our calculation finds 0.706 (sec. 7).
4. Nothing here needs a new Townsend ingest. Equations and figures were read from the page images, except the OCR-only pages listed at the head of the digest (a reviewer re-reads those before quoting them).

---

# LECTURE 11 (Quantum dynamics; 6 units)

## 1. Map
| unit | Townsend match | already used | ownership |
|---|---|---|---|
| l11-wait | §4.1 intro p. 111 (U(t) translates the ket in time) | §2.2 pp. 36-37 (finite rotations from tiny ones, in `l11-generator:b5`) | L11 |
| l11-unitary | §4.1 pp. 111-112, Eqs. 4.1-4.3 | none | L11 owns U and unitarity |
| l11-generator | §4.1 pp. 112-113, Eqs. 4.4-4.10 | none | L11 |
| l11-schrodinger | Eqs. 4.7-4.8 (covered by the beat above) | none | L11; L12-law links back |
| l11-stationary | §4.1 pp. 113-114, Eqs. 4.11-4.15 | none | L11 |
| l11-two-level | §4.3 pp. 115-116 (Eqs. 4.17-4.21, H = omega_0 S_z), §4.5 pp. 128-134 (ammonia, Eqs. 4.46-4.61) | none | L11; the cos^2(omega t/2) algebra stays L12 |

## 2. Formalism: six new `books` beats (one voice, one citation each)
| id (after) | gist (<= 25 words per sentence in the build) | cite | Rosetta / derivation |
|---|---|---|---|
| `l11-unitary:b4a` | Townsend writes U(t)\|psi(0)> = \|psi(t)> and demands <psi\|psi> constant, so U^dagger U = 1. A side note: probability is not conserved when particles are created or destroyed (field theory). | §4.1, p. 111-112, Eqs. 4.1-4.3 | Rosetta: hats on operators (U-hat, H-hat); his \|psi(t)>> double bar is our \|psi(t)>. |
| `l11-generator:b5a` | Composing a tiny step with the finished evolution, U(t+dt) = U(dt)U(t), gives the operator equation and then the ket equation; the N-step limit gives the exponential. | §4.1, pp. 112-113, Eqs. 4.4-4.10 | **Derivation D11.1** "the equation from composition": steps U(dt) -> U(t+dt) = (1 - iH dt/hbar)U(t) -> subtract U(t) -> divide by dt -> i hbar dU/dt = HU (4.7) -> act on \|psi(0)> (4.8). Views: `bloch` (tiny R_z steps stacking up, rotate sweep) and `complex-plane` (the factor 1 - i eps dt as a short turn; `powers`/`chain` towards e^{-i eps t}). |
| `l11-stationary:b4a` | <H> stays fixed because H commutes with U; the exponential acting on an energy eigenstate only multiplies by a phase, shown by expanding the series (stationary state). Motion needs a superposition. | §4.1, pp. 113-114, Eqs. 4.11-4.15 | **Derivation D11.2** "the series makes E out of H": e^{-iHt/hbar}\|E> = sum of (-iEt/hbar)^k/k! \|E> = e^{-iEt/hbar}\|E> (4.14). Views: `complex-plane` (partial sums spiralling onto the unit circle) and `clocks` (one hand, `show: ['clocks']`). |
| `l11-two-level:b7a` | A spin in a field along z has H = omega_0 S_z, so U(t) is exactly the rotation operator R(phi k) with phi = omega_0 t: the field turns the state about z with period 2 pi/omega_0. Townsend warns not to read the arrow as a classical moment. | §4.3, p. 115, Eqs. 4.17-4.19 | Rosetta (Ground-up too): his omega_0 = g e B_0/(2 m c) is our omega = (E+ - E-)/hbar, and his azimuth phi is our phi(t). One-line, defines nothing new. |
| `l11-two-level:b7b` | **Ammonia as a two-level system.** Two states (nitrogen above / below the plane) share energy E0; tunnelling gives off-diagonal -A, so the eigenstates are the sum and difference at E0 -/+ A. Starting above, the nitrogen is below after half a period T/2 = pi hbar/(2A), frequency 2A/h. | §4.5, pp. 128-131, Eqs. 4.46-4.56 | **Derivation D11.3** "the flip": H matrix (4.48) -> eigenvalues from the determinant (4.51) -> \|I>,\|II> (4.52-4.53) -> \|1> = (\|I>+\|II>)/sqrt2 (4.54) -> phase factor e^{-2iAt/hbar} (4.55) -> t = T/2 gives \|2> (4.56). Views: `clocks` (E0 = 2 eps, A = eps: the gap of the hands reaches 180 degrees) and `bloch` (the x-y arrow flipping). Numbers: V11 claims below. Link-back note: the energy-time reading of the same state is Unit 13.7. |
| `l11-two-level:b7c` | An electric dipole couples to a field and shifts the diagonal entries to E0 +/- mu E; the levels become E0 +/- sqrt(A^2 + (mu E)^2), roughly E0 +/- (A + (mu E)^2/2A) for a weak field. A field gradient therefore sorts the two states into two beams, a Stern-Gerlach cousin; an oscillating field at 2A/hbar is the maser. | §4.5, pp. 131-134, Eqs. 4.57-4.62, Figs. 4.10-4.11 | Visual V11-2. Only the weak-field expansion is stated; no maser numbers (needs Ch 14). |

## 3. Visualizations (engine data, never a copy of the figure)
- **V11-1 "The nitrogen flips" (no engine or stage change).** `l11-two-level:b7b`: `{kind:'clocks', levels:{upper:3, lower:1}, start:'+x', timeDeg:{from:0,to:90}, show:['levels','clocks','gap','top'], readouts:['gap','px'], shot:'K-STD'}`.
  With E0 = 2 eps and A = eps the lecture's own levels ARE the ammonia levels; start '+x' (equal weight on both energies) is "nitrogen above". Caption states the relabel: read "+x" as "nitrogen above" and the gap 180 degrees as "nitrogen below" (Rosetta line in the beat). Readout `px` = P(above) = cos^2(A t/hbar) (0.5 at the quarter period).
- **V11-2 "Levels in a field" (small addition).** New `plot` series fn `ammoniaLevel` (additive to `PlotSeriesState`): `series:[{fn:'ammoniaLevel',params:{branch:'upper'}},{...'lower'},{...'upper', approx:true},{...'lower', approx:true}], xRange:[0,3], samples:121, markers:[1]`;
  x = mu|E|/A, y = (E - E0)/A from `twoLevelEnergies(x)` (sec. 8), the dashed pair is E0 +/- (A + x^2 A/2) (Eq. 4.59). Marker table at x = 1: 1.4142 against 1.5; at x = 0.3: 1.0440 against 1.0450 (the approximation is good below about 0.3 and 6 percent high at 1). Fidelity: exact for the curve, `approx` is flagged schematic.

## 4. Formulas to add to the unit formula boards (`equations`)
- l11-unitary: `\hat U^\dagger(t)\hat U(t) = 1` (4.3); `\langle\psi(t)|\psi(t)\rangle = \langle\psi(0)|\hat U^\dagger\hat U|\psi(0)\rangle` (4.2)
- l11-generator: `\hat U(dt) = 1 - \tfrac{i}{\hbar}\hat H\,dt` (4.4); `\hat U(t+dt) = \hat U(dt)\hat U(t)` (4.5); `\hat U(t) = \lim_{N\to\infty}\left[1 - \tfrac{i}{\hbar}\hat H\tfrac{t}{N}\right]^N = e^{-i\hat Ht/\hbar}` (4.9)
- l11-schrodinger: `i\hbar\,\tfrac{d}{dt}\hat U = \hat H\hat U` (4.7)
- l11-stationary: `\langle\psi(t)|\hat H|\psi(t)\rangle = \langle\psi(0)|\hat H|\psi(0)\rangle` (4.11); `e^{-i\hat Ht/\hbar}|E\rangle = e^{-iEt/\hbar}|E\rangle` (4.14)
- l11-two-level: `\hat H = \omega_0 \hat S_z,\ \hat U(t) = e^{-i\omega_0\hat S_z t/\hbar} = \hat R(\phi\mathbf k),\ \phi = \omega_0 t` (4.19); `\hat H = \begin{pmatrix}E_0&-A\\-A&E_0\end{pmatrix}` (4.48); `E = E_0 \pm A` (4.51); `T = \pi\hbar/A,\ \nu = 2A/h` (4.55-4.56); `E = E_0 \pm\sqrt{A^2 + (\mu_e|\mathbf E|)^2}` (4.58b) — 13 in all.

## 5. Practice questions (5; tag `practice: 'homework'`; types from the HW6 / HW3 problem list, new numbers; the engine is `physics/dynamics.ts` and `physics/qc`)
| id | kind, tier | prompt (fresh numbers) | answer, claim key, numpy route | mirrors |
|---|---|---|---|---|
| `l11-pr-phase` | numeric, warm-up | A spin sits in H = (hbar Omega/2) sigma_z with Omega = 0.8 rad/ns. After 2.5 ns, by what angle (degrees) do the phases of the two diagonal entries of U differ? | 114.59 degrees, `l11HwPhase` (tol 0.05); numpy: `eigh` exponential, `angle(U00/U11)` | HW6 type 4a |
| `l11-pr-px` | numeric, core | The spin starts in \|+x>, Omega = 0.6 rad/us. What is P(+x) after 3.5 us? | 0.2476, `l11HwPx`; numpy: evolve, `abs(vdot(px, psi))**2` | HW6 type 4b/4c |
| `l11-pr-dir` | choice, core | Same spin from \|+x>. After three quarters of a period, which way does the Bloch arrow point? (+y, -y, -x, +z) | -y, `l11HwYComp` = -1 (and x-component 0); numpy: <sigma_y> of the evolved ket | HW6 type 4d |
| `l11-pr-xx` | numeric, core | Qubits A and B start in (\|00> + \|11>)/sqrt2; only A feels H = (hbar omega/2) Z. For omega t = 2.4 rad find <X_A X_B>. | -0.7374, `l11HwXX`; <Z_A Z_B> stays 1 (`l11HwZZ`); numpy: kron, `eigh` | HW6 type 5b/5d |
| `l11-pr-eig` | order, stretch | Order the steps showing every eigenvalue of a unitary has modulus 1. | no number; steps: U\|v> = lambda\|v> -> take the norm squared of both sides -> use U^dagger U = 1 -> divide by <v\|v> | HW3 type 4b |
Hints (three each): nudge, key idea, setup (e.g. `l11-pr-px`: "overlap with \|+x> is the amplitude" / "the two energy parts carry phases e^{-+i Omega t/2}" / "amplitude = cos(Omega t/2)"). Walkthrough outline: write U = diag(e^{-i Omega t/2}, e^{+i Omega t/2}), apply it, take the overlap, square; each ends with the engine number.

## 6. Claims (every new number: key, statement, numpy route in the ledger)
| key | value | statement / route |
|---|---|---|
| `l11TAmmFlipDeg` | 90 | eps t/hbar at which the nitrogen is below with certainty; scan of \|<2\|e^{-iHt}\|1>\|^2 |
| `l11TAmmPeriodDeg` | 180 | one full period T = pi hbar/A is eps t/hbar = 180 degrees |
| `l11TAmmPAboveQuarter` | 0.5 | P(above) at T/4 |
| `l11TAmmDeltaE` | 1 (units of A) | spread of H in \|1>: sqrt(<H^2> - <H>^2) |
| `l11TAmmDtRatio` | 0.31831 | (hbar/2A)/(T/2) = 1/pi, "about a third" (Unit 13.7 uses it) |
| `l11TAmmFreqGHz`, `l11TAmmEnergyEv`, `l11TAmmPeriodPs` | 23.983, 9.919e-5, 41.70 | c/lambda, h c/lambda, lambda/c for lambda = 1.25 cm (SI via `constants.ts`) |
| `l11TLevelAt1`, `l11TLevelApproxAt1` | 1.41421, 1.5 | eigenvalue of [[x,-1],[-1,-x]] at x = 1 and 1 + x^2/2 |
| `l11TLevelAtP3`, `l11TLevelApproxAtP3` | 1.04403, 1.045 | the same at x = 0.3 |
| `l11HwPhase`, `l11HwPx`, `l11HwYComp`, `l11HwXX`, `l11HwZZ` | 114.592, 0.247577, -1, -0.737394, 1 | practice answers |
17 claims.

## 7. Errata for L11: none (Ch 4 §4.1-4.5 re-derived and checked: 4.14, 4.25, 4.28, 4.55-4.56, 4.64 agree).

## 8. Engine gaps (L11)
- `physics/dynamics.ts`: `twoLevelEnergies(x): [lower, upper]` = eigenvalues of [[x, -1], [-1, -x]] (sqrt(1 + x^2)); `ammoniaPeriod(A) = pi hbar/A`. numpy twin: `np.linalg.eigvalsh`, scan of the exact evolution for the flip.
- `constants.ts` already has h, c, e: `photonEnergy(lambda) = h c/lambda`. Series fn `ammoniaLevel` in `stage.ts` (`PlotSeriesName`) and the resolver (see V11-2).

---

# LECTURE 12 (The wave equation and the position basis; 6 units + 1 new)

## 1. Map
| unit | Townsend match | already used | ownership |
|---|---|---|---|
| l12-law | §4.1 (pointer), §4.2 p. 114 Eq. 4.16 | §4.1 pp. 111-114 (`b7`) | L11 owns U and H; L12-law owns time-dependent H and "which observables are constants" |
| l12-motion | §4.3 pp. 115-123 | pp. 115-117 up to Eqs. 4.24-4.28 (`b5`) | L12 (cos^2(omega t/2) and <S_x> stay here) |
| **l12-driven (new)** | §4.3 muon and neutron pp. 119-123, §4.4 pp. 124-128 | none | L12 |
| l12-continuum, l12-wavefunction, l12-position-op, l12-translations | §6.1-6.4 | already cited on pp. 191-202 | complete; add nothing |

## 2. Formalism: seven new `books` beats
| id | gist | cite | Rosetta / derivation |
|---|---|---|---|
| `l12-law:b7a` | For any observable the rate of its average is (i/hbar) times the average of the commutator with H, plus an explicit-time term. With no explicit t, it is constant exactly when it commutes with H; energy is constant when H has no t. A field with cos(omega t) pumps energy in and out. | §4.2, p. 114 (and p. 115 top), Eq. 4.16 | **D12.1** "the rate of an average": d<A>/dt = (d<psi\|)A\|psi> + <psi\|A(d\|psi>) + <psi\|dA/dt\|psi> -> insert the equation and its adjoint -> (i/hbar)<[H,A]> + <dA/dt> (4.16). Views: `clocks` (energy parts fixed: <H> flat) and `bloch` (<S_x> moving, `readouts:['averages']`). Rosetta: sign is (i/hbar)[H, A], not [A, H]. Link-forward: Unit 13.6 uses it for x and p. |
| `l12-motion:b5a` | The same state gives P(+y) = (1 + sin omega_0 t)/2 and <S_y> = (hbar/2) sin omega_0 t, so the average turns counter-clockwise; Example 4.1 checks d<S_x>/dt = -omega_0 <S_y> against (4.16). A positive charge reverses the turn. | §4.3, pp. 117-119, Eqs. 4.29-4.31, Example 4.1 | **D12.2** "the average obeys the commutator law": [S_z, S_x] = i hbar S_y -> -omega_0 <S_y> -> differentiate (hbar/2)cos omega_0 t. Views: `bloch` (averages) and `complex-plane` (e^{-i omega t} arrow). Symmetry remark from p. 118 (H commutes with the generator of its own rotation) points to L12-law:b3. |
| `l12-motion:b5b` | **Strategy for any start state:** write it in the energy eigenstates, give each its phase, change back. Field along x from \|+z>: the ket is cos(omega_0 t/2)\|+z> - i sin(omega_0 t/2)\|-z>, and <S_z> = (hbar/2) cos omega_0 t, the old result with axes renamed. | §4.3, pp. 122-123, Example 4.2 | **D12.3** "same recipe, new axes": views `bloch` (rotate about x) and `clocks`. Defines nothing new. |
| `l12-driven:b1` | **Muon g factor.** A muon brought to rest with its spin along x precesses in a field; positrons from its decay come out preferably opposite to the spin, so the counting rate follows cos^2(omega_0 t/2). The frequency gives g. | §4.3, pp. 119-121, Figs. 4.2-4.3 | Numbers: from the figure's printed 807.5 kHz at 60 G, `l12TMuonG` = 1.988 (the book quotes Garwin g = 2.00 +/- 0.10 and mentions the precision g-2 route). Reported numbers (printed), not measured by us. |
| `l12-driven:b2` | **A spin turned twice.** A neutron beam is split, one arm sits in a field for a time T and picks up phase phi = omega_0 T; successive maxima in the count difference need a 4 pi turn, not 2 pi, which is what a sign-flipping spin-1/2 predicts. | §4.3, pp. 120-123, Eqs. 4.32-4.33, Fig. 4.4 | Visual V12-1. Printed: spacing 62 G; had 2 pi sufficed it would be 31 G (`l12TNeutronDB2pi`). |
| `l12-driven:b3` | **Magnetic resonance.** Add a weak oscillating field across the main one: H = omega_0 S_z + omega_1 cos(omega t) S_x. Writing the amplitudes with their fast phases pulled out, the terms at omega_0 + omega average away and at resonance c, d obey a simple pair of equations. | §4.4, pp. 124-126, Eqs. 4.34-4.43 | **D12.4** (rotating-wave step): (4.38) -> (4.40) -> (4.41) -> drop 2 omega_0 terms (4.42) -> second derivatives (4.43). Views: `clocks` (the two hands, slow beat) and `plot` (c, d against t). Caution beat: why omega_1 << omega_0 matters (RWA error `l12TRabiRwaErr` = 3.9e-5 at omega_1/omega_0 = 0.05, exact integration). |
| `l12-driven:b4` | At resonance P(-z) = sin^2(omega_1 t/4): full flip at t = 2 pi/omega_1, back at 4 pi/omega_1. Off resonance Rabi's formula gives a Lorentzian ceiling (omega_1^2/4)/((omega_0 - omega)^2 + omega_1^2/4); a weaker drive narrows the peak. | §4.4, pp. 126-128, Eqs. 4.44-4.45, Figs. 4.5-4.6 | Visual V12-2. Printed typo in Eq. 4.44b: see sec. 7. |
(The new unit `l12-driven` is "Driving a spin by hand"; a text-only fallback is open question 1. Its Try-it reuses the L6 `lab-r3`/Bloch bench with a note of what it does not show.)

## 3. Visualizations
- **V12-1 "Port counts against the turn" (small addition).** New `plot` series fn `spinFringe` (`params:{port:'+x'|'-x'}`, `xRange:[0,12]` in units of pi for phi = omega_0 T): y = (1 +/- cos(phi/2))/2, markers at phi = 0, 2 pi, 4 pi (1, 0, 1). The point of Fig. 4.4b with engine data: the period is 4 pi, not 2 pi. Engine: `interferometerPort(phi)` = |(I +/- R_z(phi))\|+x>/2|^2.
- **V12-2 "Rabi's flip" (small addition).** `plot` series `rabiTime` (`params:{detuning: 0|0.5|1}` in units of omega_1; `xRange:[0,3]` for omega_1 t/2 pi) and `rabiPeak` (Lorentzian, x = (omega_0 - omega)/omega_1 in [-3,3]); engine `rabiProbability({delta,t})` uses the closed form (4.45); the numpy twin integrates (4.38) with cos(omega t) by RK4 (ratio omega_1/omega_0 = 0.05) and the claim `l12TRabiExactAtFlip` = 0.999961 is the error bar (fidelity: RWA, exact within 4e-5 here).

## 4. Formulas
- l12-law: `\tfrac{d}{dt}\langle A\rangle = \tfrac{i}{\hbar}\langle[\hat H,\hat A]\rangle + \langle\partial\hat A/\partial t\rangle` (4.16)
- l12-motion: `\hat H = -\hat{\boldsymbol\mu}\cdot\mathbf B = \omega_0\hat S_z,\ \omega_0 = \tfrac{geB_0}{2mc}` (4.17); `|\langle{+}\mathbf x|\psi(t)\rangle|^2 = \cos^2\tfrac{\omega_0t}{2}` (4.25); `\langle S_x\rangle = \tfrac\hbar2\cos\omega_0t,\ \langle S_y\rangle = \tfrac\hbar2\sin\omega_0t` (4.28, 4.30); `|\langle{+}\mathbf y|\psi\rangle|^2 = \tfrac{1+\sin\omega_0t}{2}` (4.29a)
- l12-driven: `\phi = \omega_0 T = \tfrac{geB_0}{2Mc}T;\ \tfrac{ge\Delta B}{2Mc}T = 4\pi` (4.32-4.33); `\hat H = \omega_0\hat S_z + \omega_1\cos\omega t\,\hat S_x` (4.35); `|\langle{-}\mathbf z|\psi\rangle|^2 = \sin^2\tfrac{\omega_1t}{4}` (4.44a); `\tfrac{\omega_1^2/4}{(\omega_0-\omega)^2+\omega_1^2/4}\sin^2\left[\tfrac12\sqrt{(\omega_0-\omega)^2+\omega_1^2/4}\,t\right]` (4.45). 9 entries.

## 5. Practice questions (4; no homework topic exists, so they come from Townsend's problem types; tag `practice: 'textbook'`, `refs` cite the problem)
| id | kind, tier | prompt (fresh numbers) | answer, key, route | mirrors |
|---|---|---|---|---|
| `l12-pr-field-angle` | numeric, core | A spin starts in \|+z>, feels H = omega_0 (sin(60 deg) S_x + cos(60 deg) S_z) for omega_0 T = 100 degrees, then a y magnet. P(S_y = +hbar/2)? Check theta = 0 first. | 0.0736, `l12PrPy`; closed form (1 - sin theta sin phi)/2; numpy: rotation of \|+z> about n | Townsend Problem 4.5, p. 139 |
| `l12-pr-sg-field` | numeric, core | Beam through Sz-plus, then a field along x for a length l_0 at speed 800 m/s with omega_0 = 2 pi x 1.5 MHz, then Sz-minus. Smallest l_0 (mm) that passes 40 percent? | 0.1162 mm, `l12PrLenMm` (check `l12PrLenCheck` = 0.4); sin^2(omega_0 t/2) = 0.4 | Problem 4.4, p. 139 |
| `l12-pr-muon` | numeric, core | A muon (mass 1.8835e-28 kg) precesses at 1.010 MHz in 7.5 mT. Find g. | 1.989, `l12PrG` (tol 0.005); g = 4 pi m f/(e B) | Problem 4.7, p. 139 |
| `l12-pr-rabi` | numeric, stretch | A drive with omega_1 = 2 pi x 30 kHz sits 20 kHz (as 2 pi x) off resonance. What is the largest transition chance? | 0.36, `l12PrRabiPeak`; (4.45) ceiling | Problem 4.9, p. 139 |
Hints/walkthrough: standard three (setup, key idea, nudge); walkthrough ends in the engine value; `l12-pr-muon` also states the g-2 route is beyond scope.

## 6. Claims (21; keys in the ledger)
`l12TPPlusY40` 0.821394, `l12TSy40` 0.321394, `l12TSx40` 0.383022 (omega_0 t = 40 degrees; the derivative check `l12TDerivRatio` = 1), `l12TEx42Sz40` 0.383022, `l12TMuonG` 1.98822, `l12TPort0` 1, `l12TPort2pi` 0, `l12TPort3pi` 0.5, `l12TPort4pi` 1,
`l12TNeutronDB2pi` 31, `l12TRabiFlipUs` 25 (omega_1 = 2 pi x 40 kHz), `l12TRabiPeakRes` 1, `l12TRabiPeakHalf` 0.5, `l12TRabiPeakOne` 0.2, `l12TRabiExactAtFlip` 0.999961, `l12TRabiRwaErr` 3.9e-5, practice: `l12PrPy` 0.0735657, `l12PrLenMm` 0.116242 (+ `l12PrLenCheck` 0.4), `l12PrG` 1.98945, `l12PrRabiPeak` 0.36.

## 7. Errata (L12)
- **Eq. 4.44b, p. 126** prints the state label |<-z|psi(t)>|^2 on both lines; the second should be +z (the text above it says |+z>). A label typo with no physics change: no Correction box (R8 of `448-L12L13.md`).
- Checked and agreeing: 4.20-4.30 (numpy: P(+y) 0.8214, <S_y> 0.3214 at 40 degrees), Example 4.1 (derivative ratio 1.0000), Example 4.2, Rabi (4.45) within 4e-5 of exact integration, 4.33 (the 62 G -> 31 G arithmetic is the book's own).

## 8. Engine gaps (L12)
- `physics/dynamics.ts`: `interferometerPort(phi, sign)`; `rabiProbability({w0,w1,w,t})` (closed form 4.45) and `rabiPeak(delta)`; numpy twin = RK4 of (4.38) and a linear-algebra overlap.
- `constants.ts`: `M_MUON` = 1.883531627e-28 kg, `larmorG(f, B, m)` = 4 pi m f/(e B) (SI), numpy twin the same formula by independent arithmetic; `plot` series fns `spinFringe`, `rabiTime`, `rabiPeak` in `stage.ts`.

---

# LECTURE 13 (Momentum, Schrödinger's equation, time; 7 units + 2 new)

## 1. Map
| unit | Townsend match | already used | ownership |
|---|---|---|---|
| l13-delta | §6.1 pp. 193-194, Eq. 6.64 | `b5` | complete |
| l13-generator | §6.3 pp. 197-200 | `b4` | complete |
| l13-plane-wave | §6.5 pp. 202-204; §6.7 pp. 210-213 | Eqs. 6.46-6.56 and Example 6.5 | add the which-slit argument of §6.7 |
| l13-momentum-space | §6.5 p. 204, §6.6 pp. 204-210 | Eq. 6.57, packet, Delta x Delta p = hbar/2 (`b5`) | add Example 6.2 (a minimum-uncertainty state is Gaussian) |
| l13-two-bases | §6.3-6.4 | `b6` | complete |
| l13-schrodinger | §6.6 pp. 208-210, §6.8 p. 213 Eqs. 6.78-6.81 | spreading, 6.73-6.77 | the stationary equation moves to the new unit below |
| l13-time | §6.3 pp. 199-200; **§4.6 pp. 134-136** | Ehrenfest 6.33-6.36 | add §4.6 and Example 4.3 here (the unit that denies a time operator) |
| **l13-stationary (new)** | §6.8-6.9 pp. 213-224, Eqs. 6.82-6.110, Example 6.6 | none | L13 |
| **l13-flow (new)** | §6.10 pp. 224-234, Eqs. 6.111-6.149, Example 6.7 | none | L13 |

## 2. Formalism: 11 `books` beats, 2 clue beats, 1 deeper beat (14)
| id | gist | cite | Rosetta / derivation |
|---|---|---|---|
| `l13-plane-wave:b5a` | **Why you cannot also see the slit.** Locating the slit needs Delta x below d/2, hence a momentum kick above about 2h/d and an angular spread above 2 lambda/d, the size of the fringe spacing lambda/d: the pattern washes out. | §6.7, pp. 210-212 (and footnote 11, 12) | Numbers (helium, 2200 m/s, d = 8 um): lambda = 45.3 pm, fringe angle 5.66e-6 rad, which-way kick 1.13e-5 rad. Rosetta: the relation is an order-of-magnitude use with h on the right (his own caveat); the exact bound is hbar/2. |
| `l13-momentum-space:b5a` | **Why the Gaussian is the floor.** Equality in the uncertainty argument needs c x\|psi> = p\|psi> and a zero symmetrized average; the first gives psi = e^{i c x^2/2hbar}, the second forces c = i\|c\|, a Gaussian. | §6.6, pp. 207-208, Example 6.2 | **D13.1:** projection of c x\|psi> = p\|psi> -> (hbar/i)psi' = c x psi -> psi = e^{icx^2/2hbar} -> real part of c would make a pure chirp (phase hue varying as x^2) and breaks the second condition. Views: `wavefunction` packet at time 0 (`show:['density','phase']`, readout `product` = 0.5) and the same packet after `time` 4 (hue now varies with x, `product` above 0.5). |
| `l13-stationary:b1` | Project the energy eigen-equation on <x\|: the time factor e^{-iEt/hbar} splits off and the rest is an ordinary equation in x, with V acting by multiplication and p^2 by -hbar^2 d^2/dx^2. | §6.8, p. 213-214, Eqs. 6.78-6.86 | Rosetta: <x\|E> = psi_E(x), the subscript dropped. Link-back (no new definition): the time-dependent form is Unit 13.6. |
| `l13-stationary:b2` | **Bend toward or away.** Where E > V the curvature opposes psi (oscillation, faster for larger E - V); where E < V it points away (exponential). Normalisable solutions need psi and its slope continuous, except where V is infinite, and only special energies join: nodes grow with energy (n - 1 nodes for level n). | §6.8, pp. 214-218, Eqs. 6.87-6.98, Figs. 6.8-6.9 | Finite-well algebra is not repeated (the book defers the quantisation condition to §10.3); only the qualitative rule and Eq. 6.96. `claim l13TBoxNodes4` = 3 for the infinite well. |
| `l13-stationary:b3` | **The box.** Infinite walls force psi = 0 there; A sin kx + B cos kx with two conditions has a nontrivial solution only if the determinant vanishes: sin ka = 0, k a = n pi, so E_n = hbar^2 pi^2 n^2/(2 m a^2). Normalised: sqrt(2/a). | §6.9, pp. 219-221, Eqs. 6.99-6.110, Fig. 6.10 | **D13.2:** (6.100) -> (6.101a,b) -> matrix (6.102) -> determinant (6.103-6.104) -> k_n a = n pi (6.105) -> normalisation (6.107-6.108) -> energies (6.110). Views: `wavefunction` `box` n = 1 (re, density) and n = 3 (momentum panel on). **Rosetta (Ground-up too):** Townsend centres the box and so alternates cos and sin; we put one wall at 0 (his Problem 6.13 choice) and write sqrt(2/L) sin(n pi x/L); the energies are identical. |
| `l13-stationary:b4` | **A wall that moves away.** After the energy E_1 is found, the walls are pulled out so fast the state cannot change; it is no longer stationary. The chance of the new ground state is the squared overlap: 64/(9 pi^2) = 0.72; odd levels of the bigger box share the rest (0.26 for the third, even ones get none by parity). | §6.9, pp. 221-224, Example 6.6, Fig. 6.11 | Reuses `b3`'s stage (no new picture, no derivation). Numbers: `l13TBoxP1`, `l13TBoxP3`, `l13TBoxP2` = 0, `l13TBoxSumOdd`. |
| `l13-stationary:b5` (clue) | "Squeeze the box to half its width. What happens to E_1?" Reveal: it quadruples (E ~ 1/L^2), and the confined state's momentum spread doubles. | §6.9, Eq. 6.110 | Reveal stage: `box` L = 2 against L = 4 (`pspread`). |
| `l13-flow:b1` | **A conserved flow.** Differentiating psi*psi with the equation and its conjugate cancels V and leaves the density's rate equal to minus the x-derivative of j = (hbar/2mi)(psi* psi' - psi psi*'): probability in [a,b] changes only by the current through the ends. A plane wave has j = hbar k\|A\|^2/m. | §6.10, pp. 225-227, Eqs. 6.111-6.116, Fig. 6.13 | **D13.3:** (6.111-6.112) -> (6.113) -> (6.114-6.115) -> integrate (6.116). Views: `wavefunction` packet at rest (j = 0 on average) and with p0 = 1.5 (`boost`: density slides right). Engine check: continuity residual 4.4e-14 on the spectral grid, mean current 1.5 = <p>/m (`l13TContResidual`, `l13TCurrentMean`). |
| `l13-flow:b2` | **A step, energy above it.** Continuity of psi and psi' at the step fixes the reflected and transmitted amplitudes; reflection and transmission chances are ratios of currents (not of squared amplitudes) and add to 1: R = ((k - k_0)/(k + k_0))^2, T = 4 k k_0/(k + k_0)^2. | §6.10, pp. 226-229, Eqs. 6.117-6.136, Fig. 6.14 | **D13.4:** A + B = C, k(A - B) = k_0 C -> C, B (6.134) -> R, T (6.135) -> R + T = 1 (6.136). Views: `plot` `stepRT` and `wavefunction` `twoWaves`. Numbers: E = 2 V_0 gives R = 0.0294, T = 0.9706; E = 3 V_0: R = 0.0102, T = 0.9898. |
| `l13-flow:b3` | **Energy below the step.** The same algebra with k_0 -> i q gives total reflection, yet the wave still enters the step as e^{-qx}; no current flows because the exponent is real. | §6.10, pp. 229-230, Eqs. 6.137-6.140 | Caution Rosetta: the substitution works for R (6.139) but not for T (T is a current ratio, not 6.132). View: `twoWaves` (p1 = k, p2 = -k) density of the standing pattern; claims `l13TStepRbelow` = 1, `l13TStepTbelow` = 0. |
| `l13-flow:b4` | **Tunnelling.** For a barrier of height V_0 and width a with E < V_0, the four matching conditions give T = 1/[1 + ((k^2 + q^2)/2kq)^2 sinh^2 qa]; for thick barriers T ~ (4kq/(k^2 + q^2))^2 e^{-2qa}. At E = V_0 exactly, T = 1/(1 + k^2 a^2/4). | §6.10, pp. 230-233, Eqs. 6.141-6.146, Example 6.7, Figs. 6.15-6.16 | Visual V13-2; the printed 0.68 (**Correction**, sec. 7). Check: the linear system (6.143) and the closed form agree to 1e-12. |
| `l13-flow:b5` (clue) | "Widening a barrier by one decay length 1/q: by what factor does T fall?" Reveal: by e^{-2}, about 0.135 (thick-barrier form). | §6.10, Eq. 6.146 | No stage change. |
| `l13-flow:b6` (deeper) | A smooth barrier is a stack of thin ones, so T ~ exp(-2 integral sqrt(2m(V - E))/hbar dx) over the forbidden stretch; it fails near turning points. | §6.10, pp. 233-234, Eqs. 6.147-6.149, Fig. 6.17 | Optional (Problem 6.25 uses it); no number beyond the ratio claim `l13TThickRatio` = 0.9979. |
| `l13-time:b6a` | **Evolution time.** Only the energy spread is a true uncertainty; time is a parameter. For any observable without explicit t, Delta E (Delta A/\|d<A>/dt\|) >= hbar/2, and Delta t = Delta A/\|d<A>/dt\| is how long the average needs to move by its own spread. A precessing spin saturates it at every instant; ammonia's flip takes three times it. | §4.6, pp. 134-136, Eqs. 4.63-4.65, Example 4.3 | **D13.5:** Delta A Delta E >= (1/2)\|<[A,H]>\| and (4.16) -> Delta A Delta E >= (hbar/2)\|d<A>/dt\| -> divide. Views: `bloch` (`readouts:['spreads']`) and `clocks` (`px`). Rosetta: Delta t is not an uncertainty of a time observable (agrees with `l13-time:b3`). Numbers: `l13TTimeBound` = 0.5 at omega t = 70 degrees; `l11TAmmDtRatio` 0.3183 (link-back to Unit 11.6). |

## 3. Visualizations
- **V13-1 "Standing waves" (additive source on `wavefunction`).** `WavefunctionSource` gains `{ box: { L: number; n: number | [number, number] } }` (2 <= L <= 16 in ell; 1 <= n <= 8). Walls at x = 0 and x = L drawn as vertical rules, psi = 0 outside, default window [-1, L+1]. psi_n = sqrt(2/L) sin(n pi x/L), E_n = n^2 pi^2/(2 L^2) (hbar = m = 1). A pair is the equal superposition and its density sloshes with period 2 pi/(E_2 - E_1).
  `time` applies e^{-iE_n t} per component (a resolver branch: free spreading would be wrong in a box); `boost`, `shift` and `cells` on a box are refused with a message naming `box`; panels `['position','momentum']` use the existing `toMomentum` FFT (the ground state's momentum density has two lobes near +-pi/L); a new readout `energy` (E_n, or <E> for the pair); `xspread`, `pspread`, `product` work. Fidelity: reuse `wavefunction-not-a-wave`; new `wavefunction-box-walls` (exact; the slope jump at a wall is Eq. 6.96's case of infinite V). Used in `l13-stationary` b2-b5.
- **V13-2 "Reflection and tunnelling curves" (additive `plot` series fns).** `stepRT` (`params:{branch:'R'|'T'}`, x = E/V_0 in [0.2, 4]; R = 1, T = 0 below 1) and `barrierT` (`params:{eOverV0: 0.5}`, x = q a in [0, 4], y = T from (6.144) written in x and E/V_0: ((k^2+q^2)/2kq)^2 = 1/(4 (E/V_0)(1 - E/V_0)); second series `thick` = 16 (E/V_0)(1 - E/V_0) e^{-2x}). Markers: x = 0.607 on the E/V_0 = 0.5 curve (T = 0.706, the book's own inputs). Used in `l13-flow` b2, b4.

## 4. Formulas (17)
- l13-plane-wave: `d\sin\theta = n\lambda,\ \lambda = h/p` (6.56 and p. 210)
- l13-momentum-space: `\Delta x\,\Delta p_x = \hbar/2\ \text{for}\ \psi\propto e^{-x^2/2a^2}` (6.67, 6.72)
- l13-time: `\Delta E\,\Delta t \ge \hbar/2` (4.63); `\Delta t = \Delta A/|d\langle A\rangle/dt|` (Example 4.3)
- l13-stationary: `\psi_E(x,t) = \langle x|E\rangle e^{-iEt/\hbar}` (6.83); `\left[-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2} + V(x)\right]\psi = E\psi` (6.86); `\psi'' = -k^2(x)\psi\ (E>V),\ \psi'' = q^2(x)\psi\ (E<V)` (6.97-6.98); `\Delta\psi' = \int\tfrac{2m}{\hbar^2}(V-E)\psi\,dx` (6.96); `k_na = n\pi` (6.105); `E_n = \tfrac{\hbar^2\pi^2n^2}{2ma^2}` (6.110); `\psi_n = \sqrt{2/L}\sin(n\pi x/L)` (6.108, wall at 0)
- l13-flow: `\partial_t(\psi^*\psi) = -\partial_xj_x` (6.114); `j_x = \tfrac{\hbar}{2mi}\left(\psi^*\psi' - \psi\psi^{*\prime}\right)` (6.115); `R = \tfrac{j_{ref}}{j_{inc}},\ T = \tfrac{j_{trans}}{j_{inc}}` (6.125-6.126); `R = \tfrac{(k-k_0)^2}{(k+k_0)^2},\ T = \tfrac{4kk_0}{(k+k_0)^2}` (6.135); `T = \left[1 + \left(\tfrac{k^2+q^2}{2kq}\right)^2\sinh^2qa\right]^{-1}` (6.144); `T \to \left(\tfrac{4kq}{k^2+q^2}\right)^2e^{-2qa}` (6.146)

## 5. Practice questions (4; Townsend problem types, tag `practice: 'textbook'`, answers from `physics/constants.ts`, `wave.ts`, `scatter.ts`)
| id | kind, tier | prompt (fresh numbers) | answer, key, route | mirrors |
|---|---|---|---|---|
| `l13-pr-box-energy` | numeric, warm-up | An electron sits in an infinite well 0.55 nm wide. Ground-state energy in eV? | 1.243 eV, `l13PrE1Ev` (tol 0.005); hbar^2 pi^2/(2 m L^2) | Problem 6.18, p. 258 |
| `l13-pr-wall` | numeric, core | A particle is in the ground state of a box 0 < x < L. The right wall jumps to 3L. Chance of the new ground state? | 0.1282, `l13PrWall3`; overlap integral (check the book's 2L case `l13TWall2P1` = 0.3603 = 32/(9 pi^2)) | Problem 6.16, p. 258 (Example 6.6 method) |
| `l13-pr-step` | numeric, core | Particles with E = 3 V_0 meet a step. What fraction is transmitted? | 0.9898, `l13TStepT3` (reused); (6.135) | Problem 6.22 (R and T), p. 259 |
| `l13-pr-tunnel` | numeric, stretch | An electron with 5 eV meets a 8 eV barrier 0.30 nm wide. Transmission in percent? | 1.812 percent, `l13TPrT` x 100 (tol 0.02; the plan states it because 0.005 would be 27 percent of the answer); (6.144) | Problem 6.23, p. 259 |
Hints: setup / key idea / nudge. Walkthroughs are the book's own methods (overlap integral; matching conditions) ending in the engine value.

## 6. Claims (26; ledger keys)
box: `l13TBoxE1Ev` 2.35019 (0.4 nm), `l13TBoxNodes4` 3, `l13TBoxOverlap` 0.848826, `l13TBoxP1` 0.720506, `l13TBoxP2` 0, `l13TBoxP3` 0.259382, `l13TBoxSumOdd` 1.0 (to 1e-5), `l13TWall2P1` 0.360253 · step/tunnel: `l13TStepR2` 0.0294373, `l13TStepT2` 0.970563, `l13TStepR3` 0.0102051, `l13TStepT3` 0.989795, `l13TStepRbelow` 1, `l13TStepTbelow` 0, `l13TBookAT` 0.706105 (E 5, V_0 10, a 0.53 angstrom), `l13TBookBohrT` 0.706826 (a = 0.529177 angstrom), `l13TThickRatio` 0.997933, `l13TEV0T` 0.5 (k a = 2) · flow: `l13TContResidual` 4.4e-14, `l13TCurrentMean` 1.5 · plane-wave: `l13THeFringeAngle` 5.66437e-6, `l13TWhichWayAngle` 1.13287e-5 · time: `l13TTimeBound` 0.5 · practice: `l13PrE1Ev` 1.24307, `l13PrWall3` 0.128235, `l13TPrT` 0.0181169 (+ `l13TStepT3`).
Existing L13 keys for the helium and spreading numbers are reused, not re-added (`l13THe*` above is only the angle pair).

## 7. Errata (L13)
- **Correction box (physics): p. 231, below Eq. 6.144.** The page prints T = 0.68 for a 5 eV electron at a 10 eV barrier 0.53 angstrom wide (read on the page image, PDF p. 247). Our calculation finds T = 0.706 (0.707 with the Bohr radius 0.529 angstrom), two routes in the ledger: the 4 x 4 linear system (6.143) and the closed form (6.144) agree to 1e-12; q a = 0.607. A printed 0.68 would need a = 0.56 angstrom. Proposed `corrections` row: `{ where: 'Townsend p. 231, after Eq. 6.144', says: 'T = 0.68 for E = 5 eV, V0 = 10 eV, a = 0.53 angstrom', shouldSay: Our calculation finds 0.71 (0.706), check: close(V.l13TBookAT, 0.7061, 1e-3) && Math.abs(V.l13TBookAT - 0.68) > 0.02, source: 'book' }`.
- No other slips with physics: Examples 6.4 (9.5e24 s, 8.6e-17 s), 6.5, 6.6 (0.7205), Problem 6.11 (0.2594), Eq. 6.135 R + T = 1, Eq. 6.67/6.72 all reproduce. Typos only: none that change a number.

## 8. Engine gaps (L13)
- `physics/wave.ts`: `boxState(g, L, n)`, `boxEnergy(L, n)`, `boxPairEnergy`, `boxOverlap(a, b)` where a = {lo, hi, n} (box eigenstate on [lo, hi]); numpy twin: `np.trapezoid` of products of analytic eigenfunctions on a fine grid (script: 4e5 points) and `np.linalg.eigh` of a finite-difference Hamiltonian for E_n.
- new `physics/scatter.ts`: `stepRT(E, V0)` and `barrierT(E, V0, a)` (plus `barrierThick`), `probabilityCurrent(psi, g)`; numpy twin: solve the matching conditions (6.133), (6.143) as linear systems with `np.linalg.solve` (never the closed form), and the spectral continuity check.
- `constants.ts`: `boxEnergyEv(L, m)` (SI). `plot` series fns `stepRT`, `barrierT` (V13-2).

---

# Cross-cutting

## A. One schema addition: label practice questions
`ChallengeBase.practice?: 'homework' | 'textbook'` in `content/schema.ts`; the Challenge card shows a small tag "Practice · homework style" or "Practice · from the textbook" (plus the `refs` Townsend problem line for the latter). Rules, tested in `content.test.tsx`: a `practice` challenge has a non-empty walkthrough and no `assigned`; `homework`-tagged ones never name a student problem number (types are mapped in this plan only). No other UI change; the Formulas page reads `equations` as it does now.

## B. Engine and stage surface (cut list if the budget is tight)
Must have (they decide the lecture's new beats): `twoLevelEnergies`, `interferometerPort`, `rabiProbability`, `M_MUON`/`larmorG`, `boxState/boxEnergy/boxOverlap`, `stepRT/barrierT`. Everything has a numpy twin in the ledger. Can cut with the least loss: V11-2 (levels in a field), V12-2's detuning series, V13-2's thick-barrier series, the `deeper` beat `l13-flow:b6`.

## C. Build order
(1) schema `practice` + engine functions with twins; (2) L11 beats (no stage change except `ammoniaLevel`); (3) L12; (4) L13 (the new `box` source first, then `scatter.ts`); each followed by the usual gate, visual QA and an independent P truth review that re-reads the digest's OCR-only pages (listed at its head).

## D. Totals
| lecture | new beats | derivations | visuals | formulas | practice | claims |
|---|---|---|---|---|---|---|
| L11 | 6 | 3 | 2 (1 existing scene, 1 plot series) | 13 | 5 | 17 |
| L12 | 7 | 4 | 2 (plot series) | 9 | 4 | 21 |
| L13 | 14 (11 books, 2 clue, 1 deeper) | 5 | 2 (`box` source, plot series) | 17 | 4 | 26 |
| total | 27 | 12 | 6 | 39 | 13 | 64 |
New units: `l12-driven`, `l13-stationary`, `l13-flow`. Engine functions: 16 (3 in L11, 4 in L12, 9 in L13; each has a numpy twin or is the same formula by independent arithmetic). Corrections: 1.

## E. Open questions for the judge (each with a recommended answer)
1. **May a unit consist only of `books` beats?** The phase lint only forbids a unit that starts with `deeper`, but 448 units so far open with a notes beat. Recommend yes for the three new units, each opening with a one-line "not in the lecture notes" lede (like the Go-deeper styling, but ordinary phase `books`); fallback: append the beats to `l12-motion` and `l13-schrodinger` and drop the unit-level questions.
2. **Is Townsend §6.8-6.10 and §4.4 in scope for 448 (beyond the notes)?** The owner asked for his formalism in every lecture; recommend yes, as optional units after the lecture units, so a student following only the notes sees nothing change.
3. **Who owns Ch 4 §4.1:** L11 (recommended, the notes derive U and H there), with `l12-law:b7` cut to a pointer; otherwise keep both and drop `l11-unitary:b4a`.
4. **Correction box for p. 231 (0.68 vs 0.706)?** Recommend yes; verified on the page image and by two independent numpy routes; it is the only slip with physics in G4.
5. **Is the `practice` field acceptable** (A above), or should practice questions just be ordinary challenges? Recommend the field: it costs one enum and one tag, and the owner asked for the label.
6. **Box origin:** wall at 0 (his Problem 6.13) instead of his centred box, with a Rosetta line, because it gives one formula for every n. Recommend yes.
7. **Muon and neutron numbers are read off the book's figure.** Recommend marking them "as printed" (reported claims) with no Correction; only `l12TMuonG` is derived from them and is shown as "about 2".
8. **Tolerance for `l13-pr-tunnel`:** percent with 0.02. Recommend yes.
