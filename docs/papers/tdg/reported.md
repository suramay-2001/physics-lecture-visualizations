# Reported numbers — *Tour de gross* (paper-tdg)

Role P, 2026-10-14. Ruling R3: a **reported** claim carries the source id (`paper-tdg`), the exact location and the value
**as printed**, renders in the reported style, and the review re-reads it against the page image. This file lists every
paper result a lecture will show that our engine cannot compute, plus the printed numbers that recipes use as inputs
(class **C←R** in `recipes.md`). Locations are printed page numbers (= PDF pages). Notation: `10^-8.8±0.2` means ten to the
power −8.8 with a bootstrap error of ±0.2 in the exponent, exactly as the table prints it.

Columns: **Id** (cite this in content), **Value as printed**, **Where**, **Meaning**, **Conditions**, **Use** (R = shown as
reported; In = an input to a computed visual; Re = recomputed by our engine from other printed inputs, kept here so the
review can compare).

## A. Tables

### Table 1 — module component qubit counts (p. 6)

| Id | Value as printed | Meaning | Conditions | Use |
|---|---|---|---|---|
| T1-c | gross 288; two-gross 576 | code module qubits (data + check) | — | Re (c = 4ℓm) |
| T1-u | gross 90; two-gross 158 | LPU qubits | — | Re (census of Fig. 5, see N19) |
| T1-a | gross 22; two-gross 34 | code–code adapter qubits | — | Re (a = 2(d − 1)) |
| T1-f | gross 454 (p = 10⁻³), 810 (p = 10⁻⁴); two-gross 463 (10⁻³), 18,600 (10⁻⁴) | factory qubits | cultivation at 10⁻³, distillation at 10⁻⁴ | R, In |
| T1-a′ | gross 29 (10⁻³), 13 (10⁻⁴); two-gross 29 (10⁻³), 49 (10⁻⁴) | code–factory adapter qubits | — | Re (2d_factory − 1) |

### Table 2 — bicycle instruction properties (p. 7)

Conditions for all rows: circuit noise of strength p (§2.6), Relay-BP decoder, C = 10 (gross) or 18 (two-gross) cycles for
measurements, "preliminary data"; bracketed values are assumed without data; one timestep = one physical operation.

| Id | Instruction · module | τ (timesteps) | P at p = 10⁻³ | P at p = 10⁻⁴ | Use |
|---|---|---|---|---|---|
| T2-I-g | idle · gross | 8 | 10^-8.8±0.2 | 10^-14.8±0.4 | R; Re from Table 6 (N1) |
| T2-I-2g | idle · two-gross | 8 | 10^-20.1±0.5 | 10^-38.3±0.9 | R; Re (N1) |
| T2-U-g | shift automorphism · gross | 14 | 10^-6.4±0.2 | 10^-12.2±0.5 | R; Re (N1) |
| T2-U-2g | shift automorphism · two-gross | 14 | 10^-14.5±0.4 | 10^-37±1 | R; Re (N1) |
| T2-M-g | in-module meas. · gross | 120 | 10^-5.0±0.1 | 10^-9.0±0.2 | R; Re (N1, representative Ȳ₁) |
| T2-M-2g | in-module meas. · two-gross | 216 | [10^-11] | [10^-20] | R (assumed) |
| T2-C-g | inter-module meas. · gross | 120 | 10^-2.7±0.1 | 10^-7.3±0.3 | R; Re (N1, representative X̄₁⊗X̄₁) |
| T2-C-2g | inter-module meas. · two-gross | 216 | [10^-9] | [10^-18] | R (assumed) |
| T2-T-g3 | T injection · 10⁻³ gross factory | 351 + 120 | 10^-5.5 + P_C | – | R |
| T2-T-2g3 | T injection · 10⁻³ two-gross factory | 2167 + 216 | 10^-7.7 + P_C | – | R |
| T2-T-g4 | T injection · 10⁻⁴ gross factory | 73 + 120 | – | 10^-7.4 + P_C | R (N8) |
| T2-T-2g4 | T injection · 10⁻⁴ two-gross factory | 407 + 216 | – | 10^-24.4 + P_C | R |

### Table 3 — T factory properties (p. 14)

| Id | Factory | approach | d_factory | a′ | f | P_factory | τ̄_factory | Use |
|---|---|---|---|---|---|---|---|---|
| T3-g3 | 10⁻³ gross | cultivation | 15 | 29 | 454 | 3 × 10⁻⁶ | 351 | R, In |
| T3-2g3 | 10⁻³ two-gross | cultivation | 15 | 29 | 463 | 2 × 10⁻⁸ | 2167 | R, In (N9) |
| T3-g4 | 10⁻⁴ gross | distillation | 7 | 13 | 810 | 4 × 10⁻⁸ | 73 | R, In (N8) |
| T3-2g4 | 10⁻⁴ two-gross | distillation | 25 | 49 | 18 600 | 6 × 10⁻²⁵ | 407 | R, In |

Conditions: physical error rate in the name; cultivation from [GSJ24] (end-to-end, in-place), distillation from [Lit19b,
Table 1] with cycles × 6 timesteps; output in a distance-d_factory surface code.

### Table 4 — phenomenological and circuit distances (p. 17)

| Id | Value as printed | Meaning | Conditions | Use |
|---|---|---|---|---|
| T4-phenom | gross 12, 12, ≤ 11; two-gross 18, 18, ≤ 17 (idle/aut., in-mod., inter-mod.) | fewest phenomenological faults causing a logical error | exact values by integer programming; ≤ = upper bound | R |
| T4-circ | gross ≤ 10, ≤ 10, ≤ 10; two-gross ≤ 18, ≤ 18, ≤ 17 | circuit-distance upper bounds | found by decoder search (BP+OSD) | R |

### Table 5 — cultivation (p. 57)

| Id | Value as printed | Meaning | Conditions | Use |
|---|---|---|---|---|
| T5-d3 | d₁ = 3: P_cult 6 × 10⁻⁷, P′_cult 35 %, P_e2e 3 × 10⁻⁶, P′_e2e 80 %, P′_escape 69 %, f 454, τ̄_e2e 351 | errors and discard rates before/after escape; qubits; mean timesteps | p = 10⁻³; first six columns copied from [GSJ24, Fig. 2] (confirmed online); last three are the paper's estimates | R, In (N9) |
| T5-d5 | d₁ = 5: 6 × 10⁻¹⁰, 85 %, 2 × 10⁻⁹, 99 %, 93 %, 463, 2167 | same | same | R, In (N9) |
| T5-t | t₃,cult 39, t₃,escape 90, t₅,cult 89, t₅,escape 110 (Eqs. 75–78); coefficients 1.54, 3.23, 6.67, 14.3 (Eqs. 79–80) | stage durations (timesteps) and mean-time factors | from the published stim circuits [GJS24] (r = 13, r₁ = 3, r₂ = 5 and r = 20, r₁ = 5, r₂ = 5; d₂ = 15) | In |
| T5-q | 454 and 463 qubits end to end; 42 qubits for inject + cultivate at r₁ = 5 | qubit counts of the circuits | as above | R |

### Table 6 — failure-spectrum fit parameters (p. 61)

| Id | Series | f₀ | γ | w₀ | K | N | Use |
|---|---|---|---|---|---|---|---|
| T6-1 | gross idle | e^-31.02 | 8.66 | 5 | 24 | 210960 | In (R-P-11) |
| T6-2 | gross automorphism | e^-28.63 | 7.13 | 5 | 24 | 483840 | In |
| T6-3 | gross X (X̄₁) | e^-23.97 | 6.31 | 5 | 23 | 324526 | In |
| T6-4 | gross XX′ (X̄₁X̄₇) | e^-22.06 | 5.87 | 5 | 23 | 398717 | In |
| T6-5 | gross Y (Ȳ₁) | e^-19.49 | 4.65 | 5 | 23 | 400117 | In |
| T6-6 | gross X ⊗ X (X̄₁⊗X̄₁) | e^-18.32 | 5.19 | 5 | 23 | 743456 | In |
| T6-7 | two-gross idle | e^-95.83 | 25.78 | 9 | 24 | 762912 | In |
| T6-8 | two-gross automorphism | e^-108.53 | 28.22 | 9 | 24 | 1748736 | In |

Conditions: χ² fits of Eq. 83 to Monte Carlo f(w) under circuit noise, q = p/15; points with w > 80 for Ȳ₁ excluded.
Table 7 (Relay-BP settings, p. 61) is not planned for display.

### Table 8 — distances of the in-module measurements (p. 62)

| Id | Value as printed | Meaning | Conditions | Use |
|---|---|---|---|---|
| T8 | d*_s = d*_t = 12 for all nine listed measurements (gross); 18 for all nine (two-gross) | space-like and time-like phenomenological distances | CPLEX; the other six cases follow by ZX-duality | R |

### Table 9 — TFIM instruction counts (p. 67)

| Id | Code | N_I | N_U | N_M | N_C | N_T | Use |
|---|---|---|---|---|---|---|---|
| T9-g | gross | 4.1634 × 10¹⁰ | 2.2704 × 10⁶ | 4.2152 × 10⁶ | 9.4680 × 10⁵ | 1.5542 × 10⁷ | R, In |
| T9-2g | two-gross | 4.1637 × 10¹⁰ | 2.2944 × 10⁶ | 4.2388 × 10⁶ | 9.4680 × 10⁵ | 1.5542 × 10⁷ | R, In |

Conditions: 10 × 10 TFIM, 184 000 rotations, synthesis error 5 × 10⁻⁹, compiled with §3 and worst-case timing.

### Table 10 — TFIM logical error rates and failure (p. 68)

| Id | Code · p | P_I | P_U | P_M | P_C | failure probability | Use |
|---|---|---|---|---|---|---|---|
| T10-g3 | gross · 1 × 10⁻³ | 1.6 × 10⁻⁹ | 4.0 × 10⁻⁷ | 1.1 × 10⁻⁵ | 2.0 × 10⁻³ | 3.33 × 10⁴ | Re (N1, N2) |
| T10-g4 | gross · 1 × 10⁻⁴ | 1.4 × 10⁻¹⁵ | 6.1 × 10⁻¹³ | 1.0 × 10⁻⁹ | 4.8 × 10⁻⁸ | 7.97 × 10⁻¹ | Re |
| T10-g5 | gross · 5 × 10⁻⁵ | 4.5 × 10⁻¹⁷ | 2.2 × 10⁻¹⁴ | 5.7 × 10⁻¹¹ | 2.8 × 10⁻⁹ | 4.62 × 10⁻² | Re |
| T10-g6 | gross · 3 × 10⁻⁵ | 3.5 × 10⁻¹⁸ | 1.9 × 10⁻¹⁵ | 5.9 × 10⁻¹² | 3.2 × 10⁻¹⁰ | 5.27 × 10⁻³ | Re |
| T10-g7 | gross · 1 × 10⁻⁵ | 1.5 × 10⁻²⁰ | 9.5 × 10⁻¹⁸ | 3.3 × 10⁻¹⁴ | 2.1 × 10⁻¹² | 3.48 × 10⁻⁵ | Re |
| T10-2g3 | two-gross · 1 × 10⁻³ | 8.2 × 10⁻²¹ | 3.3 × 10⁻¹⁵ | 1.0 × 10⁻¹¹ | 1.0 × 10⁻⁹ | 1.65 × 10⁻² | Re (P_M, P_C assumed) |
| T10-2g4 | two-gross · 1 × 10⁻⁴ | 5.4 × 10⁻³⁹ | 1.3 × 10⁻³⁷ | 1.0 × 10⁻²⁰ | 1.0 × 10⁻¹⁸ | 1.65 × 10⁻¹¹ | Re (P_M, P_C assumed) |

Conditions: P_T set equal to P_C; failure = Σ N_i P_i (Eq. 26). A "failure probability" above 1 (3.33 × 10⁴) is the
first-order sum, not a probability — the lecture must say so.

## B. Figures

| Id | Value as printed | Where | Meaning | Conditions | Use |
|---|---|---|---|---|---|
| F1b | machine labels 5k, 50k, 500k qubits × p 10⁻³, 10⁻⁴; points taken from Fig. 10a | Fig. 1b, p. 3 | logical qubits vs logical T count per design | regions from [Sch+24] (not redrawn) | R (via R-P-1) |
| F5-census | degree tables; gross u = 90, two-gross u = 158 | Fig. 5b/c, p. 12 | LPU qubits per set and degree | v_Bell counted as 2 check qubits | In (N19) |
| F7-dcirc | d*_circ = 10 (gross), 18 (two-gross) | Fig. 7 caption, p. 16 | circuit distance used in the fits | upper bounds of Table 4 | R, In |
| F9 | β ∈ {1, 7, 13, 19, 25}; means 18.55 (gross) and 18.67 (two-gross) for a fixed Q; 18.48 and 18.58 after choosing Q | Fig. 9, p. 25 | bicycle measurements needed per in-module Pauli measurement | all Paulis on 12 (left) / 11 (right) qubits | R |
| F10a | the twelve rows in the table below | Fig. 10a, p. 29 | capability of each design | random π/4 rotations, failure ≤ 1/3, 8 trials, ≤ 10⁵ rotations then linear extrapolation (Fig. 17); one T factory | bicycle N_T and timesteps **R**; n and SC rows Re (N7) |
| F10b | q = 4817 (gross), 8138 (two-gross); surface 10610 (d = 7), 17010 (d = 9), 25010 (d = 11), 58 263 (d = 17), 72 663 (d = 19) | Fig. 10b, p. 29 | qubits of each TFIM design | gross and d ≤ 11 with the 10⁻⁴ gross factory (f = 810); two-gross and d > 11 with the 10⁻³ two-gross factory (f = 463); target 10⁻³ | Re (N4, N6) |
| F12 | shift-unique logical counts 3, 12, 30, 274 (curves); totals 1884 weight-12 and 19 728 weight-14 X logicals (gross), 336 weight-18 and 1728 weight-20 (two-gross); same for Z | Fig. 12 and caption, p. 46 | low-weight logical operators found | BP+OSD with random priors; gross weight-12 count agrees with [OHB25]; under 25 min on a laptop | R (N16) |
| F15 | about 22 700 core hours | Fig. 15 caption, p. 60 | simulation cost | — | R (optional) |

F10a as printed (SC = the surface-code comparison design of the same row; "BB" = bicycle architecture):

| Id | p | q | Design | n | N_T | timesteps per T |
|---|---|---|---|---|---|---|
| F10a-1 | 10⁻³ | 5k | BB gross | 121 | 1.4 × 10¹ | 3367 |
| F10a-2 | 10⁻³ | 5k | SC, d = 5 | 45 | 7.0 | 381 |
| F10a-3 | 10⁻³ | 50k | BB two-gross | 704 | 3.5 × 10⁶ | 7057 |
| F10a-4 | 10⁻³ | 50k | SC, d = 17 | 42 | 2.5 × 10⁶ | 2269 |
| F10a-5 | 10⁻⁴ | 5k | BB gross | 110 | 2.2 × 10⁵ | 3091 |
| F10a-6 | 10⁻⁴ | 5k | SC, d = 7 | 21 | 3.8 × 10⁵ | 115 |
| F10a-7 | 10⁻⁴ | 50k | BB gross | 1342 | 3.7 × 10⁴ | 3135 |
| F10a-8 | 10⁻⁴ | 50k | SC, d = 7 | 250 | 3.2 × 10⁴ | 115 |
| F10a-9 | 10⁻⁴ | 50k | BB two-gross | 440 | 7.0 × 10¹⁵ | 5436 |
| F10a-10 | 10⁻⁴ | 50k | SC, d = 17 | 27 | 1.2 × 10¹⁵ | 509 |
| F10a-11 | 10⁻⁴ | 500k | BB two-gross | 6886 | 4.5 × 10¹⁴ | 5437 |
| F10a-12 | 10⁻⁴ | 500k | SC, d = 17 | 416 | 7.9 × 10¹³ | 509 |

## C. Numbers in the text

| Id | Value as printed | Where | Meaning | Conditions | Use |
|---|---|---|---|---|---|
| X-p3 | 8138 ≈ 8k physical qubits; p ≈ 7 × 10⁻⁴ | §1, p. 3 | TFIM headline | two-gross, 10⁻³ factory | R |
| X-p4a | modules under 1000 qubits; longest in-module couplers tens of lattice sites | §1, p. 4 | hardware scale | with a suitable 2-D placement [Poo+24] | R |
| X-p4b | state transfer fidelity 98.8 % over 0.6 m | §1, p. 4 | demonstrated long coupler | transmons [Hey+25] | R |
| X-p13 | 6 (gross) and 9 (two-gross) faults | §2.4, p. 13 | fewest phenomenological faults that fool an optimal decoder, in- and inter-module | bridge of size d − 1 | Re (⌈(d − 1)/2⌉ = d/2 for even d) |
| X-p13b | 2d − 1 Bell couplers | §2.4, p. 13 | code–factory adapter to a surface-code factory | — | Re |
| X-p17a | about 10⁻²⁰ (two-gross idle) vs about 10⁻¹⁰ (rotated d = 17 surface code) | §2.6, p. 17 | per-cycle logical error at p = 0.001 | surface formula 0.1·(p/0.01)^(d/2) | Re (N12, R-P-22) |
| X-p17b | 336 weight-18 X logicals (two-gross) vs 875 178 in the d = 18 rotated toric code | §2.6, p. 17 | entropy argument | toric count from [Bev+19] | R |
| X-p24 | 540 native measurements; 510 native rotations | §3.2, p. 24 | sizes of N and of the native rotation set | both codes | Re (540 agrees; 510 see O2) |
| X-p27 | about 5.4× fewer T states on average; precision about 10⁻¹⁷ | §3.4, p. 27 | probabilistic synthesis [Kli+23]; brute-force optimal T counts [KMM13] | — | R (optional) |
| X-p30a | 1.8 × 10⁵ rotations | §4, p. 30 | TFIM circuit size | 10 × 10, parameters of A.10 | Re (184 000) |
| X-p30b | q = 4817; p ≤ 2.1 × 10⁻⁵ ≈ 10^-4.68 (gross); d = 9 surface: 17 010 qubits, p ≤ 5.4 × 10⁻⁵ ≈ 10^-4.26 | §4, p. 30 | TFIM requirements | target 10⁻³ | Re (N4, N6) |
| X-p30c | q = 8138; p ≤ 7.3 × 10⁻⁴ ≈ 10^-3.14 (two-gross); surface d = 17: p ≤ 5.8 × 10⁻⁴ (58 263 qubits); d = 19: 7.8 × 10⁻⁴ (72 663) | §4, p. 30 | TFIM requirements | 10⁻³ two-gross factory | Re (N6) |
| X-p30d | N_T = 1.9 × 10⁷ T injections; factory error 2 × 10⁻⁸ might reach 10⁻¹⁰ | §4, p. 30 | why the 10⁻³ two-gross factory | — | R (N5) |
| X-p31 | junction yield 99.98 %; 1–2 junctions per qubit, 2–3 per coupler; gross module ≈ 2 in 5; two-gross ≈ 1 in 5; 5000-qubit surface chip ≈ 1 in 3000; d = 17, 12-logical surface module 1 in 66 000 | §5, p. 31 | fabrication yield | larger junction counts assumed | R; surface values Re under our coupler assumption (N18) |
| X-p32 | ℓ = 6(r + b), m = 6r, n = 72r(r + b), k = 12, conjectured d = 6(2r + b − 1); kd²/n → 24; 12 (gross), 13.5 (two-gross); 1 (surface) | §5, p. 32 | larger BB family | same A, B | n, k Re; d R (conjecture) |
| X-p56 | 12 C_mem timesteps | A.5, p. 56 | colouring schedule of the deformed code | — | R (N11) |
| X-p57 | 9C + b with b = 1 or 2; solve times about 1 s and 1 min | A.5, p. 57 | ILP schedule of the deformed gross code | maximum degree 7 | R |
| X-p63 | several thousand decodings (in-module); more than 700 (X̄₁⊗X̄₁) | A.8, p. 63 | effort behind the Table 4 bounds | BP+OSD | R (optional) |
| X-p67 | n_L = 100, t = 20, Δ = 0.25 (80 steps), J = g = 1; N_R = 184 000; synthesis error 5 × 10⁻⁹ | A.10, p. 67 | TFIM parameters | footnote 18: 20 vs 80 steps in [Bev+20] vs [Mic22] | In; N_R Re |
| X-p67b | p ≤ 2.09 × 10⁻⁵ (gross); p ≤ 7.32 × 10⁻⁴ (two-gross) | A.10, p. 67 | TFIM thresholds | power law through two points | Re (N3) |
| X-p68 | surface d = 7: p ≤ 1.33 × 10⁻⁵; d = 9: 5.48 × 10⁻⁵; d = 17: 5.89 × 10⁻⁴; d = 19: 7.85 × 10⁻⁴ | A.10, p. 68 | surface TFIM thresholds | Eq. 96 | Re (N6) |
| X-A10 | P₁ = 0.03 (p/0.01)^(d/2); 2d² qubits per patch; half the patches for routing; τ̄_factory + 6d per rotation; 75 qubits / 75 T classical limit | A.10, pp. 65–66 | surface-code baseline model | after [Bev+22] | In (N12) |

## D. Recompute notes (scratch numpy, 2026-10-14)

Agreements (each becomes an engine claim with a numpy twin):
- **N1.** Eq. 82 with Table 6 and q = p/15 reproduces every measured P in Table 2 (idle, shift, in-module via Ȳ₁,
  inter-module via X̄₁⊗X̄₁; both p; both codes) and every P_I, P_U, P_M, P_C of Table 10, to the printed digits. The
  two-gross rows need `expm1` (f₀ ≈ e⁻⁹⁶ underflows `1 − exp`).
- **N2.** Eq. 26 with Table 9 × Table 10 gives 3.31 × 10⁴, 7.96 × 10⁻¹, 4.64 × 10⁻², 5.30 × 10⁻³, 3.48 × 10⁻⁵ (gross) and
  1.65 × 10⁻², 1.65 × 10⁻¹¹ (two-gross): the printed values within the rounding of the printed P_i.
- **N3.** The two-point power law reproduces 2.09 × 10⁻⁵ (exponent 4.57) and 7.32 × 10⁻⁴ (exponent 9.00).
- **N19.** Fig. 5 census totals are 88 + 2 (v_Bell) = 90 and 156 + 2 = 158, matching Table 1. The graph sizes behind
  them reproduce from the code: G_l has 12 vertices and 18 edges (gross), 20 and 30 + 2 (two-gross).

Discrepancies and points for the review (none changes the paper's conclusions; each must be worded carefully):
- **N4.** TFIM gross design: Eq. 25 with Table 1 (a′ = 13 for the 10⁻⁴ gross factory, f = 810, M = 10) gives q = 4801;
  the printed 4817 matches a′ = 29 (the cultivation adapter) with f = 810. The two-gross 8138 reproduces exactly.
- **N5.** The text's N_T = 1.9 × 10⁷ (p. 30) differs from Table 9's N_T = 1.5542 × 10⁷.
- **N6.** Eq. 96 reproduces A.10's surface thresholds (1.33 × 10⁻⁵, 5.48 × 10⁻⁵, 5.89 × 10⁻⁴, 7.85 × 10⁻⁴) only with
  N_T = 1.9 × 10⁷; with Table 9's 1.5542 × 10⁷ it gives 1.35 × 10⁻⁵, 5.56 × 10⁻⁵, 5.94 × 10⁻⁴, 7.90 × 10⁻⁴. The surface TFIM
  qubit counts are 2d²·100 + f (one patch per spin, no routing patches), unlike Eq. 89's 4d² per logical qubit. p. 30
  rounds 5.89 and 7.85 down to 5.8 and 7.8.
- **N7.** Fig. 10a surface rows: Eq. 89 reproduces five rows (2.46 × 10⁶, 3.78 × 10⁵, 3.17 × 10⁴, 1.21 × 10¹⁵,
  7.86 × 10¹³) but gives 7.8, not 7.0, for (10⁻³, 5k, d = 5, n = 45); 7.0 corresponds to n = 50 = ⌊5000/(4·25)⌋, i.e. q
  not reduced by f. Times per rotation τ̄ + 6d reproduce (381, 2269, 115, 509). The bicycle n column reproduces from
  Eq. 25 (121, 704, 110, 1342, 440, 6886).
- **N8.** The 10⁻⁴ gross factory: [Lit19b] Table 1 lists (15-to-1)_{7,3,3} at 18.1 code cycles; × 6 timesteps is about
  109, not the printed τ̄ = 73 (73 ≈ 4 × 18.1). The two-gross factory (67.8 × 6 ≈ 407) agrees. §2.5 also says the
  "former" protocol uses two rounds, but in [Lit19b] it is the line-5 protocol ((15-to-1)⁴ × (15-to-1)) that has two.
- **N9.** A.6: 351 and 2167 follow from the printed rounded coefficients (1.54, 3.23; 6.67, 14.3). From unrounded
  inputs, P′_escape = 0.692 and 0.933 give 352.5 and 2243; the d₁ = 5 value is sensitive to rounding 93 %.
- **N10.** §2.5 gives τ_T = τ̄_factory + τ_C + 1; Table 2 prints τ̄_factory + τ_C (no + 1).
- **N11.** Table 2's τ_M = 120 / 216 equals 12C (the colouring schedule of A.5), not the ILP's 9C + b, and not "C deformed
  cycles plus one original cycle" as §2.3 phrases the cost.
- **N12.** Surface-code formulas differ by place: §2.6 uses 0.1·(p/0.01)^(d/2), A.10 uses 0.03·(p/0.01)^(d/2), [Bev+22]
  uses 0.03·(p/0.01)^((d+1)/2). A visual must name its preset (R-B1-6).
- **N16.** Fig. 12's 30 shift-unique weight-12 logicals times 72 shifts is not 1884, so the orbits have unequal sizes; a
  lecture must not explain 1884 as "30 × 72".
- **N18.** The yield figures for monolithic surface chips reproduce under our assumption of about two couplers per qubit
  (2 junctions per qubit + 3 per coupler): 1 in 2983 for 5000 qubits and 1 in 66 086 for 12 × 2·17² qubits. The BB-module
  figures cannot be checked without the LPU coupler count.

Open items for the engine and the review:
- **O1.** Eqs. 37–38 reproduce for qubits 1–6 (as the transpose of the X-operator decomposition matrix). In the basis of
  Eqs. 34–36, our check finds that the same shift acts on qubits 7–12 by the transposed matrix, so "A ⊗ A" holds only up to
  that convention. The engine's claim must state the convention it proves.
- **O2.** "510 native rotations": counting distinct non-trivial R over all native measurements (pivot letter I allowed)
  gives 510 for both codes; Eq. 15 as written (pivot letter X, Y or Z) gives 245. The lecture should report 510 as printed
  and the engine should prove whichever reading the content uses.
- **O3.** [Bev+25] is cited without an arXiv id; we identified it as arXiv:2511.15177 (different title, one different
  author). Treat the identification as probable on the "References used" page.
