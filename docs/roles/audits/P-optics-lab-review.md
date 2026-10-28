# P-optics-lab-review: independent truth review of the 709 Optics Lab, pages O1–O6 (role P, lean)

Scope: `qc709/optics/O1–O6.ts` + `.values.ts`, `physics/optics/cooling.ts` + `collisions.ts`, `widgets/opticsBench/presets.ts`, `stage/svg/plotOptics.ts`. Rulings O1–O8, plan §0/§8 read first.
Evidence: ~75 displayed values (every claim sentence of every page) recomputed with my own scipy/sympy script (never the repo engine or the planner's file), all agree to the printed digits;
the two models I rebuilt independently (ODE slower profile, numerical barrier top / root-found ℓ_c) agree to 1e-9. 17 book page images read (pp. 10, 11, 20, 28, 29, 31, 33, 34, 35, 41, 52, 57, 61, 69, 70, 71, 72).
Scripts: sentences ≤ 40 words (longest 39, by script); paragraphs ≤ 101 words; page prose 932–1,074 words; 5-word n-gram sweep against `sources/mvs/text.md` (longest shared run 6 words, a quote locator); Q24 named once in words (O6.ts:218), Q25 not; all 14 `<<qc-…>>` ids exist in `bridges.ts`.

## Verdict per page
| page | verdict | why |
|---|---|---|
| O1 Slowing a sodium beam | PASS with fixes | S1, S7; C1 check nit; C1, C2 ship |
| O2 Optical molasses | PASS with fixes | S1, S9, S10; C3 ships |
| O3 Below the Doppler limit | FIX-FIRST | B4 (σ⁺σ⁻ force drawn with two resonances); S1, S2, S11; C4, C5, C6 ship |
| O4 A magnetic bowl for atoms | FIX-FIRST | B1 (false statement on angular momentum); S1, S6 |
| O5 Traps made of light | FIX-FIRST | B2 (doubling claim false at the page's own v_c); S1, S3, S5; C7 reword |
| O6 What cold atoms are for | FIX-FIRST | B3 (C8 is not an error); S1, S4, S8; C9, C10, C11 ship |

## Corrections C1–C11 (ruling O7: each re-read on the page image and recomputed)
| C | page | verdict | evidence and exact fix |
|---|---|---|---|
| C1 | p. 11 | SHIP | Image prints B₀√(1 − z₀/z), v_R likewise, z₀ ≡ mv₀/ηħkγ (a time). My ODE of uniform deceleration gives v₀√(1 − z/z₀), z₀ = Mv₀²/(ηħkγ) = 0.852 m, B₀ = 1,066 G (rel. error 1e-9). Nit: the `check` at O1.ts:149 ends in `Number.isNaN(Math.sqrt(1 - 2))`, a tautology; test `1 - z₀/(z₀/2) < 0` from the printed form instead. |
| C2 | p. 10 | SHIP | Table 1.1 prints 12.2 nm and γ/k = 128 m/s beside ħk/M = 325 cm/s and τ = 1.6 ns. Mine: ħk/M = 325 cm/s needs 121.83 nm; Lyman-α is 121.57 nm; γ/k = 12.12 m/s (not 128). Wording right. |
| C3 | p. 20 | SHIP | Printed Δx = 2v_c/a_max = γ/2kγ_R ≃ 100 µm. Mine: 2v_c/a_max = 42.2 µs; (2v_c)²/2a_max = γ/2kγ_R = 99.89 µm. |
| C4 | p. 31 | SHIP | Printed v_D = √(7γ/20k_B), "10 cm/s for Rb". √(7ħγ/20M) = 9.874 cm/s (the 7/20 is the dipole-pattern factor on ħγ/2). Not a speed as printed. |
| C5 | pp. 33, 35 | SHIP | p. 33 and p. 35 give v_r = ω_Z/2k (2k·v_r = ±ω_Z; "ΔM_g = ±1, v_r = ±ω_Z/2k"), then p. 35 says each peak satisfies ±ω_Z/k. Mine: 18.20 cm/s at 1 G for ⁸⁵Rb. Add p. 34 to `where`: it gives σ⁺σ⁻ as "twice the MILC value", ω_Z/k = 36.40 cm/s, which supports the page. |
| C6 | pp. 20, 52 vs 41, 71 | SHIP | T_R ≡ ħγ_R/k_B (p. 20) and k_BT_R ≅ ħγ_R (p. 52) vs Table 6.1 (p. 71: Na 2.4 µK, Cs 0.2 µK) and "factor 15" (p. 41: 3 µK / 198 nK). Mine: ħ²k²/Mk_B = 2.400 µK (Na), 198.3 nK (Cs); twice the p. 20 value. It reads as an inconsistency between pages, as O7 requires. Nit: cite p. 71 (not "the table of Chapter 6") in `where`. |
| C7 | p. 61 | REWORD | Page prints "scales as v_c" (not "linearly"). Share below v_c ∝ v_c³ at small v_c (mine: erf quadrature). Set `says` to 'the share of the vapour below v_c scales as v_c', and keep "7.99" only for 5 → 10 m/s (see B2). |
| C8 | p. 69 | CUT | The book pairs a 1.5 mHz precision with a fractional stability of 10⁻¹² divided by the square root of the averaging time τ in seconds. 1.5 mHz/9.19 GHz = 1.63×10⁻¹³ is exactly 10⁻¹²/√τ at τ = 37.6 s. No error; the page's "9.2 mHz" ignores τ. |
| C9 | p. 70 | SHIP | Eq. 6.3 prints (ħ²ℓ(ℓ+1)/2m)^{n/(n−2)} C_n^{+2/(n−2)}: dimensionally not an energy (J^{(n+2)/(n−2)} m^{4n/(n−2)}). Mine: ((n−2)/2)(ħ²ℓ(ℓ+1)/nm)^{n/(n−2)} C_n^{−2/(n−2)} over the numerical top of V(R) = 1.0000000000000002. |
| C10 | p. 70 | SHIP | "σ is proportional to b_c ∝ E^{−2/n}" beside Eq. 6.4, b_c ∝ E^{−1/n}. Mine (root-found ℓ_c, n = 6): log-slopes σ −0.3333, b_c −0.1667. |
| C11 | p. 72 | SHIP | "fine-structure changing collisions that release 9.2 GHz (440 mK)… about 5 m/s". Mine: hν/k_B = 441.2 mK, √(ΔE/M) = 5.25 m/s; 9.19 GHz is the Cs ground hyperfine splitting. Reword "which matches" to "matching the 440 mK and about 5 m/s the book gives". |

## Blocking (a false statement or a displayed-number error)
| id | file:line | finding | exact fix |
|---|---|---|---|
| B1 | O4.ts:63 | "the angular momentum of an atom about the axis is not conserved" is false: U = μA√(ρ² + 4z²) is axially symmetric, so L_z is conserved. The book (p. 47) says only "angular momentum is not conserved" (about the centre). | "…so the angular momentum about the centre is not conserved (its component along the axis is, because the potential has axial symmetry)". |
| B2 | O5.ts:133, :147–148 | "Doubling v_c multiplies it by 7.99" follows the capture speed 59.0 m/s of the same section; at 59 → 118 m/s the ratio is 6.80 (50 → 100: 7.11). 7.99 holds only for v_c ≲ 10 m/s (key computes 5 → 10). | "Doubling a small v_c, from 5 to 10 m/s, multiplies it by 7.99"; same in C7 `shouldSay`, and in the claim sentence. |
| B3 | O6.ts:90–92; O6.values.ts:30–31 | C8 asserts a book error that is not one (see table). | Remove the correction, `o6PrecRatio`, `o6PrecTenMinus12mHz`, their twin entries and "C8" in the header comment; ship C9–C11. |
| B4 | presets.ts:335; plotOptics.ts:170; O3.ts:142 | σ⁺σ⁻ force is drawn with `vsrForcePair` (±v_r). Book p. 34: with the field along the σ⁻ beam "no cooling toward the opposite resonance velocity", cooling only toward +ω_Z/k. Only lin⊥lin has two (unsymmetrical, p. 35) peaks. | σ⁺σ⁻ curve: `vsrForce(v, 1, v_r, v_c)` (cooling.ts:259); keep the pair for lin⊥lin. O3.ts:142: "In lin⊥lin light resonances at ±v_r split the central peak; σ⁺σ⁻ light, with the field along one beam, cools toward +v_r only (p. 34)". Fix both captions. |

## Should-fix
| id | file:line | finding | exact fix |
|---|---|---|---|
| S1 | O1.ts:57, O2.ts:46, O3.ts:57, O4.ts:85, O5.ts:46, O6.ts:104 | Ruling O2 / brief 3: the atomic data (λ, γ, M) and C₆ are cited nowhere a learner can see (only in code comments). | Ruling O2 requires it; land it in the fix pass. One sentence per page where the atom first appears: "Wavelength, linewidth and mass are standard values (Steck, alkali D-line data; NIST), stated here as inputs"; O6.ts:104: "C₆ from Derevianko et al., Phys. Rev. Lett. 82, 3589 (1999)". |
| S2 | O3.ts:57, :67, :69–70 | U₁ = −17.9 µK is the book's Eq. 3.1 at C² = 1, but p. 29 prints C_ge (not squared) and the page does not say rubidium is the Jg = ½ → 3/2 model. My two-level evaluation (orthogonal beams of s each give 2s of σ⁺ at the σ⁺ point; stretched C² = 1) is ħδs/(1 + 4δ²/γ²) = −9.0 µK, half of Eq. 3.1. `o3U1`, `o3HillDepth`, `o3TlimLin/Sigma`, `o5LatticeVib*` and the bench inherit it. | Say "by the book's Eq. 3.1 with C² = 1, rubidium treated as the Jg = ½ → 3/2 model atom" in O3.ts:67 and the claim sentences; judge to decide whether to keep the book's factor 2 (ruling O3 stands as written). |
| S3 | O5.ts:100; presets.ts:434 | "the atoms oscillate at 540 Hz" next to "overdamped": ζ = 1.55, so nothing oscillates. | "The undamped frequency √(κ/M)/2π would be 540 Hz; the motion is overdamped"; readout "Natural frequency √(κ/M)/2π". Also O5.ts:100 describes a cesium cell, then gives rubidium numbers: use one atom. |
| S4 | O6.ts:115 | Book's Table 6.1 T_Q (1 mK, 34 µK) equals V_c/k_B (1,016 µK, 34.8 µK), i.e. without the 3/2 of its own Eq. 6.5; "the same order" hides a factor 1.5, and the digits are typed (policy O2). | "The book's table gives the barrier height itself in kelvin, one and a half times ours, because it leaves out the factor 3/2 of its Eq. 6.5." |
| S5 | O5.ts:46 | "which is why the book quotes a larger depth" is unsupported: p. 57 gives ≈ 20 mK (Gordon and Ashkin) with no reason; an antinode would give ×4 (47 mK), not ×1.7. | "The book quotes about twenty millikelvin from Gordon and Ashkin's analysis; our one-beam model does not reproduce it." |
| S6 | O4.ts:111, :114–118; presets.ts airy-levels | The 1D V-well levels are compared with the 3D circular-orbit rule: exact/rule = 0.54 (n = 1), 0.90 (n = 8), tending to 0.937 (1.405 vs 1.5), so "the rule is right only for large n" overstates. | Summary and text: "same n^{2/3} growth, prefactor about 6 % lower, and a different problem (circular orbits in 3D, not the 1D well)". |
| S7 | O1.ts:180–181 | 6.58 mm is the book's estimate (p. 15: integral of the rms speed, "several mm"). A 1D random walk of isotropic emissions gives (ħk/3M)√(Γt³) = 3.29 mm (full recoil per photon: 5.70 mm). Three digits overstate. | "About 6.6 mm by the book's estimate, an upper figure"; claim sentence "the book's estimate gives 6.58 mm". |
| S8 | O6.ts:64 | "atoms cross the microwave cavity in about 6 ms, a beam of 3 m at 500 m/s": T is the time between two interaction zones; 3 m and 500 m/s are our illustration (book p. 67: "a few ms… a few meters"). | "an atom needs about 6 ms to cover a 3 m apparatus at 500 m/s (our example; the book says a few metres), so T = 6 ms between the pulses". |
| S9 | O2.ts:49 | "Doppler shift stays below about one linewidth, which defines v_c = γ/2k": kv_c = γ/2, half a linewidth (the glossary says so). | "about half a linewidth". |
| S10 | O2.ts:176 | "drifts toward the brighter beam": an atom is pushed along the direction the brighter beam travels; the paragraph is not in the book. | "drifts the way the brighter beam travels". |
| S11 | O3.ts:198, :95–106 | "factor of 15 on p. 41" is an experimental ratio typed as digits (O2); "10 cm/s" in prose. | Words ("its comparison of the coldest cesium sample with the recoil temperature"); the quotes inside `says` stay. |

## Nits
- O6.ts:196 `yLines: 294.579` is typed; use `NA_D2.lambdaM / 2` (rule: results from `physics/`). O6.ts:190 "rules the lattice": "matters for the lattice".
- Link fit: O3.ts:189 (`qc-l1-quantized` in a light-shift paragraph), O4.ts:63 (`qc-l4-average` on angular momentum), O6.ts:71 (`qc-q5-interferometer` after the Doppler sentence), O2.ts:112 (`qc-l13-plane-wave` after a speed width).
- O2.ts:119: "smallest spread in position that the beam can reach" is the book's "minimal transverse expansion" while crossing the light. O1 try-it: a gentler η lengthens the magnet but does not raise B₀. O6 try-it: the fringe narrows as 1/√h, not √h.
- Presets: `ramsey-fountain` ±5 Hz shows the thermal-beam fringe as a flat line (widths only from readouts); `doppler-limit` "Best detuning" is the weak-light value; `slower-force` stopping length is for the 879 m/s oven atom; `matter-wave-onset` half-wavelength is Na's for any mass.
- Close paraphrase, runs ≤ 6 words, recast one sentence each: O3.ts:138 ("a two-photon transition… Doppler shifts of the two beams", p. 33), O3-milc b1 (nodes, antinodes, ω_Z < kv < γ_p in the book's order, p. 31), O5.ts:53 ("do not saturate with intensity", p. 57).

## Checked and right
Presets (the 12 optics ones; `lorentzian` is the platform's): every curve, marker and readout calls the engine; units and axis sides correct (`zeeman-slower` B left/v_R right; `dipole-well` depth left/rate right; `matter-wave-onset` λ_dB left/ℓ_c right); each question answerable from its plot except as noted. Models: scattering force, a_max, Doppler limit ħγ/2k_B (and D₀/β = 1.005), recoil T_R = ħ²k²/Mk_B as defined on O3, β (Eq. 2.2) and v_c, slower profile/length (ODE), damping M/β = 2/γ_R, dressed Ω, Clebsch weights 1, 1/3, 6 (sympy), friction ratio 2|δ|/γ, quadrupole/orbit/adiabatic limits, Airy levels (scipy zeros: 3.571, 8.195, 11.385 kHz), dipole depth (11.75 mK, two forms), MOT κ/β, ω, size, capture (59.0 m/s, 27.8 K), Langevin barrier (5.263 nm, 1,015.8 µK), T_Q, Ramsey widths, fountain T, hyperfine kick, Doppler widths. Numbers policy: no experimental result typed except S4/S11; design numbers are inputs with pages.
