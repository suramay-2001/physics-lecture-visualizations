# P-Q26-story — Q26 "Qubits made of light: photons and linear optics" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q19-story.md`'s sections. Standing gates: ≥ 2 distinct derivation views per track; one notation beat per new notation. Map row: `P-709-map.md` §12, drafted there as "Q24"; the owner's brief numbers it **Q26** (Part XI, after Q24 control and Q25 atoms/ions, before Q27 chips). **Phase `'books'`:** no 709 notes cover Ch. 14, so ramp `[B]`, clues `[C]`, Go-deeper `[D]` last in its unit (never first, introduces nothing).

**Sources read** (paraphrased; printed pages). Bergou Ch. 14, printed pp. 253–267 (PDF = printed + 6; text layer plus page images PDF pp. 259–273; images re-read for the pages the ingest flagged, PDF pp. 263, 264, 265, 267, 268): Eqs. 14.1–14.3 and the unnumbered formulas (pp. 255–260), Figs. 14.2–14.9, problems P14.1–P14.3 (p. 266–267, ⚑ cited only: **P14.1(a)'s per-state NS table, P14.2's phase condition and P14.3's truth table are not worked**). §1.5 pp. 7–8 (PDF = printed + 15): **Q5 already owns it** (`q5-interferometer` cites Eqs. 1.17–1.18, Figs. 1.6–1.7), so Q26 only links back to it and adds its general splitter. N&C: not needed. No 709 homework covers Ch. 14 (`homework-status.md`): full walkthroughs.

**Ownership.** F4 unitary; Q2 `qc-q2-photon` polarization states and the doubled angle; Q4 CNOT, CZ, phase gates, SWAP; **Q5 owns** the balanced beam splitter, `qc-photon-modes`, the Mach–Zehnder (`qc-beam-splitter`, `qc-mach-zehnder`); Q6 Bell basis and Bell measurement; Q9 entropy; Q11 teleportation (`qc-teleportation`, `qc-teleport-correction`); Q12 concurrence; 448 L8 polarization, wave plates and BB84 (`qc-l8-bb84`; `physics/polarization.ts` photonTurn, `townsend448.ts` plate helpers); 448 L11 two-level systems; Q15 BB84 (named in words); **Q24 will own** Lindblad T₁/T₂, Rabi, Ramsey, the Bloch equations and the DiVincenzo criteria (named in words: "Chapter Q24"; never tagged); **Q25** (atoms, ions) is named in words only. **Q26 owns:** the general lossless splitter (Stokes relations) and Fock notation, Hong–Ou–Mandel, the nonlinear-sign gate and the photonic CZ, gate teleportation of CNOT and the KLM counts, the Jaynes–Cummings dispersive shift as a photon nonlinearity, coherent and cat states (words plus overlaps).

**Reported-numbers rule (checked).** `Beat.reported`/`trail` exist in `content/stage.ts` and render in the shared story, but their source ids, locations and lints (`papers/validate.ts`) belong to Papers; no 709 chapter uses them (cards `content-model`, `papers-platform`). **So none is used here:** every experiment-derived figure of Ch. 14 (photon numbers prepared, rates, detector efficiencies, satellite distances) appears **in words with no digit**, and every displayed digit is computed from a stated model whose inputs are labelled "model (ours)" (e.g. a 70:30 splitter, $F = 0.99$, ten qubits: the book's own toy numbers, which are targets, not measurements).

**Evidence.** Scratchpad `planQ26Q27-numpy.py` (numpy, scipy, sympy; own code, independent of the repo engine): route A permanents of the mode matrix, route B `expm` of the mode generator on a truncated Fock space, route C sympy polynomials; the NS gate is built twice (symbolic, and element by element as mode matrices); the gate-teleport circuit is checked on random inputs for all 16 Bell outcomes. **68 asserted checks (both chapters), 0 failed**; every value below is printed by that script.

**Conventions.** Ports 0, 1 in, 2, 3 out; one-photon amplitudes transform with $S = \begin{pmatrix}t' & r\\ r' & t\end{pmatrix}$ (column = input port); Fock state $|ij\rangle_{23}$ = $i$ photons in mode 2, $j$ in mode 3 (a name in Fock labels, **not** a two-qubit register: Rosetta in `q26-beamsplitter:b4`). Three splitter conventions appear and all are checked: **real** $S = \begin{pmatrix}t&r\\-r&t\end{pmatrix}$ (Bergou p. 255's common choice), **sym** $\tfrac1{\sqrt2}\begin{pmatrix}1&i\\i&1\end{pmatrix}$ (Fig. 14.5), **Q5** $\tfrac1{\sqrt2}\begin{pmatrix}1&-1\\1&1\end{pmatrix}$. $|0\rangle = |H\rangle = |{+z}\rangle$; the Bloch polar angle of $\cos\theta|0\rangle + \sin\theta e^{i\phi}|1\rangle$ is $2\theta$ (C12). $R$ = reflectivity $|r|^2$. Claim keys `q26…`; twins `pipeline/claims_qc709/q26.py`. Cross-references "Unit 26.2", "Chapter Q24".

**Stage shorthand.** `circ(C,k)` = `{kind:'circuit', circuit:C, upTo:k}` · `amp(C,k,mode)` or `amp({terms:'00+01-10'},mode)` · `tq(C,k)` = `two-qubit {source:{ket:{circuit:C,upTo:k}}, readouts:['concurrence','entropy']}` · `cp(z,w)` = `complex-plane {z,w,show:['sum']}` · `bl(θ°,φ°)` = `bloch {state:{thetaDeg,phiDeg}, labels:'poincare'}` (builder confirms `Dir`'s spelling) · `pp(...)` = `plot` **points mode** `{points:[{x,y,label?,group?,status:'computed'}] (≤ 24, ≤ 4 groups), xLabel, yLabel, xScale?, yScale?, yLines?}` with every x, y a `V` key from the engine · `split(a / b)`. Circuits (matrices from the engine, never typed; `unitary` ops ≤ 4 wires): `C_U` 1 wire init `0`: [U(30°, 40°) 'U'] · `C_DR` 1 wire: [BS(30°) 'BS'], [P(40°)]; bar 0 = path 0 · `C_BS(R)` 1 wire init `0`: [S_real(R) 'S']; bar 0 = exit 2, bar 1 = exit 3 · `C_BS2` init `0`: [S_sym], [S_sym] · `C_ENT(R)` 2 wires init `10`: [one-photon block of S_real(R), identity on |00⟩, |11⟩ 'BS'] (two modes as two occupation wires) · `C_HOM(R)` 2 wires init `01`: [two-photon block of S_real(R) on {|20⟩,|11⟩,|02⟩} ↔ {00,01,10}, 1 on 11 'BS']; bars 00 = |20⟩, 01 = |11⟩, 10 = |02⟩ · `C_CZ(lin|ns)` 2 wires init `++`: [U_lin = diag(i,1,−1,i) or U_CZ = diag(i,1,1,i) from the Fock simulation, 'U'] · `C_GT` 6 wires `+00000` (c, t, r0…r3): H r0, H r2; CNOT r0→r1, r2→r3, r0→r3 (prepares |r⟩); CNOT c→r0, H c; CNOT t→r2, H t; measure c, r0, t, r2 (bits 0–3); outcomes `'0000'` · `C_KERR(φ)` 2 wires `++`: P(φ) on wire 1 controlled by wire 0.

## 0. Chapter map
**Driving question:** "Photons are the best messengers and never collide: how can light perform a two-qubit gate?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q26-encodings` | Three ways to write a photon qubit | Which angle matters when light holds a qubit? | Bergou pp. 253–254, 257–258 (Fig. 14.3); §1.5 pp. 7–8 | `qc-q2-photon`, `qc-l7-two-angles`, `qc-l8-bb84` |
| 2 | `q26-beamsplitter` | One splitter, four numbers | What must t, r, t′, r′ obey, and what does one photon do? | pp. 254–256 (14.1)–(14.2), Fig. 14.2 | `qc-q5-interferometer`, `qc-f4-unitary`, `qc-q9-entropy` |
| 3 | `q26-hom` | Two photons that leave together | Why do two photons exit one splitter by the same port? | pp. 256–257 | `q26-beamsplitter`, `qc-f1-phase` |
| 4 | `q26-ns-cz` | A sign flip from a heralded photon | Can light do CZ, and with what chance? | pp. 257–260 (Figs. 14.4–14.5) | `qc-q4-cnot`, `qc-q12-concurrence` |
| 5 | `q26-teleport-gate` | Teleport the gate, then count photons | How do KLM's counts rescue a probabilistic gate? | pp. 260–263 (Figs. 14.6–14.8), P14.3 ⚑ | `qc-q11-teleport-circuit`, `qc-q6-bell-circuit` |
| 6 | `q26-nonlinear` | Photons that talk through matter | Can matter give π between photons? And big-photon qubits? | pp. 263–266 (14.3) | `qc-l11-two-level`, Chapter Q27 (in words) |

**Outcomes:** relate polarization, path and Bloch angles of a photon qubit · state the Stokes relations and use them to find the output of one and two photons on a splitter · derive Hong–Ou–Mandel bunching and the dip $(1-2R)^2$ · derive the nonlinear-sign amplitudes of Fig. 14.4 and the 0.2265 success · build CZ from two NS gates and read its 5 % cost · teleport a CNOT with the resource $|r\rangle$ and use KLM's $(n/(n+1))^2$ · compute a dispersive Kerr shift and the overlap of coherent states. **Prerequisites:** `qc-f4-unitary`, `qc-q4-cnot`, `qc-phase-gate`, `qc-beam-splitter`, `qc-photon-modes`, `qc-teleportation`, `qc-bell-measurement`, `qc-polarization`. **Openers:** none (Part XI's Blender cryostat opener sits before Chapter Q24).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)

### Unit `q26-encodings` — Three ways to write a photon qubit
**b1 [B]** (the scorecard, pp. 253–254) · Terms `qc-linear-optics` · Bridges `qc-q2-photon`, `qc-l8-bb84`
- G: "A photon can hold a qubit: horizontal polarization is $|0\rangle$, vertical is $|1\rangle$ (<<qc-q2-photon|Unit 2.6>>). Light keeps its polarization as it travels, and wave plates turn it easily, so one-qubit gates are cheap."
- F: "Polarization encoding $|0\rangle = |H\rangle$, $|1\rangle = |V\rangle$ (Bergou p. 253): in isotropic media neither polarization nor propagation phase changes, so $T_1$ and $T_2$ can both be long, and photons are the only practical long-distance carrier (BB84 of <<qc-l8-bb84|Unit 8.6>> uses this encoding). The costs are the chapter's subject: no reliable single-photon source, hard storage, detectors below full efficiency, and no photon–photon interaction (all stated in words; no number is reported here)."
- Cap G "a horizontal photon: north pole of the sphere" · F "$|H\rangle = |{+z}\rangle$ on the Poincaré sphere" · Stage `bl(0,0)` · Claims none (numbers follow in b2).

**b2 [B]** (the wave-plate table, p. 257) · Correction K1 here
- G: "Wave plates give the table $\begin{pmatrix}\cos\theta & i e^{-i\varphi}\sin\theta\\ i e^{i\varphi}\sin\theta & \cos\theta\end{pmatrix}$. Start in $|0\rangle$: the chance of $|1\rangle$ is $\sin^2\theta$, so $0.25$ for $\theta = 30°$."
- F: "$U(\theta,\varphi) = \cos\theta\,I + i\sin\theta(\cos\varphi\,\sigma_x + \sin\varphi\,\sigma_y)$ is unitary (Bergou p. 257, <<qc-f4-unitary|Unit F4.4>>) and $U|0\rangle = \cos\theta|0\rangle + ie^{i\varphi}\sin\theta|1\rangle$; the page prints the relative phase as $\varphi$: our calculation finds $\varphi + 90°$, $130°$ for $\theta = 30°$, $\varphi = 40°$ (Correction K1, engine). Chances $0.75$, $0.25$ either way."
- Cap G "after the plates: bars 0.866 and 0.5; the second bar's hue is the phase" · F "$|U|0\rangle|$: $\cos30°$, $\sin30°$; phase $130°$" · Stage `split(circ(C_U,1) / amp(C_U,1,'amplitude'))` · Claims `q26WaveP0` 0.75, `q26WaveP1` 0.25, `q26TruePhase` 130, `q26PrintedPhase` 40.

**b3 [B]** (the angle doubles, C12) · Bridge `qc-l7-two-angles`
- G: "On the Bloch sphere this state sits at polar angle $2\theta$, not $\theta$: $60°$ for $\theta = 30°$. A plate that turns the light by $\theta$ moves its sphere point by twice as much, as in 448 Lecture 8."
- F: "$\cos\theta|0\rangle + \sin\theta e^{i\phi}|1\rangle$ has Bloch polar angle $2\theta$ and azimuth $\phi$ (Rosetta: Bergou calls $\theta$ 'polar', p. 257; ours is $2\theta$). $U(\theta,\varphi) = e^{i\theta\,\hat n\cdot\boldsymbol\sigma}$ with $\hat n = (\cos\varphi, \sin\varphi, 0)$ is a sphere rotation by $2\theta$ about the equatorial axis $\hat n$ (<<qc-l7-two-angles|Unit 7.1>>; engine: polar $60.0°$, azimuth $130°$)."
- Cap G/F "the point at polar angle 60°, twice the plate angle 30°" · Stage `bl(60,130)` with `photonTurnDeg: 30` · Claims `q26BlochPolar` 60.

**b4 [B]** (dual rail, Fig. 14.3, p. 258) · Terms `qc-dual-rail` · Bridges `qc-beam-splitter`, `qc-photon-modes` (Q5)
- G: "In a [[qc-dual-rail|dual-rail]] qubit the photon's path is the qubit: path 0 is $|0\rangle$, path 1 is $|1\rangle$. A splitter and a phase shifter turn one photon into $\cos\theta|0\rangle + \sin\theta e^{i\varphi}|1\rangle$: path 1 gets $0.25$ for $\theta = 30°$."
- F: "$|0\rangle_{dr}$, $|1\rangle_{dr}$: one photon in path 0 or 1 (Q5's one-photon mode space). Fig. 14.3: a splitter with transmission $\cos\theta$ and reflection $\sin\theta$, then a phase $\varphi$ on path 1, prepares the state from a polarized photon; run backwards it converts dual rail to polarization. Chances $0.75$, $0.25$."
- Cap G/F "after the splitter and the phase: path 1 holds 0.25" · Stage `split(circ(C_DR,2) / amp(C_DR,2,'probability'))` · Claims `q26DualRailP0` 0.75, `q26DualRailP1` 0.25.

**b5 [C]** (a waveplate angle of 22.5°)
- Q G: "A plate pair has $\theta = 22.5°$. Where does $|0\rangle$ go on the Bloch sphere, and with what chance do we find $|1\rangle$?" · Q F: "Polar angle and $P(1)$ for $U(22.5°, \varphi)|0\rangle$."
- Reveal G: "To polar angle $45°$, twice 22.5°, an eighth of a turn from the pole. The chance of $|1\rangle$ is $0.1464$." · Reveal F: "Polar $2\theta = 45°$; $P(1) = \sin^222.5° = (1 - \cos45°)/2 = 0.1464$."
- Cap G/F "polar angle 45°" · Stage q `bl(0,0)`, reveal `bl(45,112.5)` (φ = 22.5° + 90°; the azimuth is not asked) · Claims `q26Polar225` 45, `q26Sin2_225` 0.1464.

### Unit `q26-beamsplitter` — One splitter, four numbers
**b1 [B] · notation beat, `introduces: ['qc-scattering-matrix']`** (Fig. 14.2, p. 255) · Terms `qc-scattering-matrix` · Bridges `qc-q5-interferometer`, `qc-f4-unitary`
- G: "Chapter Q5's splitter treated both inputs alike. A real splitter has four numbers: $t'$ and $r'$ for light entering port 0, $r$ and $t$ for port 1. They sit in a table $S$ that must be unitary (<<qc-q5-interferometer|Unit 5.5>>)."
- F: "[[qc-scattering-matrix|$S = \begin{pmatrix}t' & r\\ r' & t\end{pmatrix}$]] maps the input amplitudes of ports 0, 1 to the output amplitudes of ports 2, 3 for one photon (Bergou Fig. 14.2, p. 255); a lossless device has $SS^\dagger = S^\dagger S = I$ (<<qc-f4-unitary|Unit F4.4>>). Q5's balanced splitter is $S = \tfrac1{\sqrt2}\begin{pmatrix}1&-1\\1&1\end{pmatrix}$ (Rosetta)."
- Cap G "a splitter that reflects 30 %: one photon in, two exits" · F "$S$ for $R = 0.3$ (real convention)" · Stage `circ(C_BS(0.3),1)` · Claims `q26T2_70` 0.7, `q26R_70` 0.3.

**b2 [B]** (the Stokes relations; D1) · Terms `qc-stokes-relations`
- G: "No light is lost: $|r|^2 + |t|^2 = 1$, and the same for the other pairings. Two different inputs must stay different: $rt'^* + r'^*t = 0$. Together these are the [[qc-stokes-relations|Stokes relations]]."
- F: "(14.1a) $|r|^2 + |t|^2 = |r'|^2 + |t'|^2 = |r|^2 + |t'|^2 = |r'|^2 + |t|^2 = 1$ and (14.1b) $rt'^* + r'^*t = 0$, $rt^* + r'^*t' = 0$ follow from $SS^\dagger = S^\dagger S = I$; so $|r| = |r'|$, $|t| = |t'|$ and $\varphi_r + \varphi_{r'} - \varphi_t - \varphi_{t'} = (2m+1)\pi$ (p. 255). Engine: all six relations hold to $10^{-14}$ for three conventions and 200 random lossless $S$."
- Cap G/F "one photon in port 0: chances 0.7 and 0.3 at the two exits" · Stage `split(circ(C_BS(0.3),1) / amp(C_BS(0.3),1,'probability'))` · Claims `q26StokesGap` 0 · Derivation D1.

**b3 [B]** (three conventions, one set of relations)
- G: "Phases are a choice. Take $t = t' > 0$ and $r' = -r$: a table of cosines and sines. Figure 14.5 uses $t = 1/\sqrt2$ and $r = i/\sqrt2$. Both obey the same relations."
- F: "(p. 255) $\varphi_t = \varphi_{t'} = 0$, $\varphi_r = 0$ gives $S = \begin{pmatrix}t&r\\-r&t\end{pmatrix}$, a rotation; Fig. 14.5's $S = \tfrac1{\sqrt2}\begin{pmatrix}1&i\\i&1\end{pmatrix}$ has $\varphi_r + \varphi_{r'} = \pi$ too; Q5's has $r = -r'$ with $r' > 0$. Engine: all three pass the six relations and $SS^\dagger = I$ (gap $0$); which one is used matters only for a phase."
- Cap G/F "the 50:50 splitter, real and symmetric tables" · Stage `circ(C_BS(0.5),1)` · Claims `q26ConvGap` 0.

**b4 [B] · notation beat, `introduces: ['qc-fock-state']`** (one photon in: entangled exits, p. 256) · Terms `qc-fock-state` · Bridges `qc-q9-entropy`, `qc-q12-concurrence`
- G: "Send one photon into port 0. The output is $t'$ for 'photon at exit 2' plus $r'$ for 'photon at exit 3'. Neither exit has a state of its own: they are entangled. At 70:30 the entropy is $0.881$ bits."
- F: "Inverting (14.2), $a_0^\dagger = t'a_2^\dagger + r'a_3^\dagger$, so $|\psi\rangle_{out} = t'|10\rangle_{23} + r'|01\rangle_{23}$; [[qc-fock-state|$|ij\rangle_{23}$]] means $i$ photons in mode 2 and $j$ in mode 3 (Rosetta: a Fock label, not two qubits, though two occupation wires draw it). At $R = 0.3$: concurrence $2|t'r'| = 0.9165$ and entropy $H(|t'|^2) = 0.8813$ bits (<<qc-q9-entropy|Unit 9.3>>); $1$ bit at 50:50."
- Cap G "two exit-occupation wires: |10⟩ + |01⟩ with unequal weights" · F "$C = 0.9165$, $S = 0.8813$" · Stage `tq(C_ENT(0.3),1)` · Claims `q26Conc70` 0.9165, `q26Entropy70` 0.8813, `q26Entropy50` 1.

**b5 [C]** (two balanced splitters in a row)
- Q G: "Two balanced splitters of Figure 14.5's table, one after the other. A photon enters port 0. Where does it leave, and with what chance?" · Q F: "Compute $S^2$ for $S = \tfrac1{\sqrt2}\begin{pmatrix}1&i\\i&1\end{pmatrix}$ and the chance for a photon from port 0."
- Reveal G: "It always leaves the other port, with a phase $i$ (a quarter turn). Two splitters make a perfect swap of ports." · Reveal F: "$S^2 = i\begin{pmatrix}0&1\\1&0\end{pmatrix}$: $|S^2_{30}|^2 = 1$, phase $90°$. Fig. 14.5's crossing between the two splitters turns this into $i\,I$ for the inner rails (unit 26.4)."
- Cap G/F "after two splitters: all in exit 3" · Stage q `circ(C_BS2,0)`, reveal `amp(C_BS2,2,'probability')` · Claims `q26TwoBsChance` 1, `q26TwoBsPhase` 90.

### Unit `q26-hom` — Two photons that leave together
**b1 [B]** (one photon in each port, p. 256) · Terms `qc-hong-ou-mandel`
- G: "Put one photon in each port. Both can pass, both can bounce, or one of each. The output has parts $|20\rangle$, $|11\rangle$ and $|02\rangle$. At 75:25 the parts $|20\rangle$ and $|02\rangle$ are $0.375$ each, $|11\rangle$ is $0.25$."
- F: "$a_0^\dagger a_1^\dagger|vac\rangle \to (t'a_2^\dagger + r'a_3^\dagger)(ra_2^\dagger + ta_3^\dagger)|vac\rangle = \sqrt2\,t'r|20\rangle + (t't + r'r)|11\rangle + \sqrt2\,r't|02\rangle$ (p. 256), using $(a^\dagger)^2|vac\rangle = \sqrt2|2\rangle$. Engine, $R = 0.25$ real convention: $0.375$, $0.25$, $0.375$; the permanent route and a matrix exponential of the mode generator agree to $10^{-9}$."
- Cap G/F "after the splitter: three bars, |20⟩, |11⟩, |02⟩ (bits 00, 01, 10)" · Stage `split(circ(C_HOM(0.25),1) / amp(C_HOM(0.25),1,'probability'))` · Claims `q26HomP20_R25` 0.375, `q26HomP11_R25` 0.25, `q26HomP02_R25` 0.375 · Derivation D2.

**b2 [B]** (the middle term cancels at 50:50, p. 257)
- G: "The middle part is two arrows: 'both pass' ($t't$) and 'both bounce' ($r'r$). For any 50:50 splitter they have equal length and opposite direction, so they cancel. The photons never leave one by each exit."
- F: "For a lossless 50:50 splitter $t't + r'r = 0$ follows from (14.1) (the page states it); engine: $|t't + r'r| < 10^{-14}$ over 200 random 50:50 lossless splitters, in the real convention $t^2 - r^2 = \cos2\theta = 0$ at $\theta = 45°$. The two ways add as amplitudes before they are squared (<<qc-f1-phase|Unit F1.5>>)."
- Cap G/F "the two arrows, equal and opposite: sum 0" · Stage `cp(t't, r'r)` (z = 0.5, w = −0.5, with `show: ['sum']`) · Claims `q26HomCancel` 0.

**b3 [B]** (the Hong–Ou–Mandel result, p. 257)
- G: "So both photons leave together: $|20\rangle$ or $|02\rangle$, one half each. The sign between them depends on the splitter: minus for the cosine-and-sine table, plus for Figure 14.5's."
- F: "$|\psi\rangle_{out} = (|20\rangle + e^{i\phi}|02\rangle)/\sqrt2$, the [[qc-hong-ou-mandel|Hong–Ou–Mandel effect]] (p. 257); engine: $\phi = 180°$ for the real and Q5 conventions, $0°$ for the symmetric one, $P(|11\rangle) = 0$ for all three. This pair of exits is the resource of the photonic gates of unit 26.4."
- Cap G "50:50: the middle bar vanishes; the two outer bars are equal" · F "$|20\rangle - |02\rangle$ for the real table: phases differ by 180°" · Stage `amp(C_HOM(0.5),1,'amplitude')` with `dials: true` · Claims `q26HomP20_R50` 0.5, `q26HomP11_R50` 0, `q26HomPhaseReal` 180, `q26HomPhaseSym` 0.

**b4 [B]** (the dip; photons that could be told apart)
- G: "Move the splitter off 50:50 and the middle chance returns: $(1 - 2R)^2$ for reflectivity $R$. Photons you could tell apart would exit one by each side with chance $0.5$ at 50:50. The dip comes from adding amplitudes."
- F: "$P(|11\rangle) = (t^2 - r^2)^2 = (1-2R)^2$, zero only at $R = \tfrac12$ (engine, 11 values of $R$, exact); distinguishable photons add chances, $|t'|^2|t|^2 + |r'|^2|r|^2 = (1-R)^2 + R^2$, equal to $\tfrac12$ at 50:50. Total chance of the three outcomes stays $1$."
- Cap G/F "chance of one photon in each exit against reflectivity: the dip to 0 at 0.5 (dots), and the 0.5 floor for photons that could be told apart" · Stage `pp(R = 0…1 step 0.1; groups 'identical photons', 'distinguishable')`, `yLines [{y:0.5}]` · Claims `q26HomR20` 0.36, `q26DistinguishableR50` 0.5.

**b5 [C]** (a fifth reflected)
- Q G: "A splitter reflects a fifth of the light, $R = 0.2$. Two identical photons enter, one per port. How often does one leave by each exit?" · Q F: "Evaluate $P(|11\rangle)$, $P(|20\rangle)$, $P(|02\rangle)$ at $R = 0.2$."
- Reveal G: "$(1 - 0.4)^2 = 0.36$ of the time. Both leave together the other $0.64$, $0.32$ at each exit." · Reveal F: "$P(|11\rangle) = 0.36$; $P(|20\rangle) = 2|t'|^2|r|^2 = 0.32 = P(|02\rangle)$; sum $1$."
- Cap G/F "R = 0.2: the dip is not complete" · Stage q `amp(C_HOM(0.2),0,'probability')`, reveal `amp(C_HOM(0.2),1,'probability')` · Claims `q26HomR20`, `q26HomP20_R20` 0.32.

### Unit `q26-ns-cz` — A sign flip from a heralded photon
**b1 [B]** (a sign that depends on photon number, p. 258) · Terms `qc-nonlinear-sign-gate`, `qc-heralded-gate`, `qc-linear-optics`
- G: "Linear optics treats every photon alike, so photons never feel each other. A gate that flips the sign of the two-photon part would couple them: the [[qc-nonlinear-sign-gate|nonlinear sign gate]]. It cannot be linear, so it is built with an extra photon and detectors."
- F: "$U_{NS}(c_0|0\rangle + c_1|1\rangle + c_2|2\rangle) = c_0|0\rangle + c_1|1\rangle - c_2|2\rangle$ (p. 258); a mode transformation maps $a^\dagger \to$ a combination of creation operators, so it cannot make a phase that depends on the photon number. [[qc-heralded-gate|Heralded]]: the gate is accepted only when detectors register an agreed pattern. Rosetta: bars 00, 01, 10 stand for $0, 1, 2$ photons in one mode."
- Cap G "equal weights on 0, 1, 2 photons, then the 2-photon bar turned over" · F "$c_2 \to -c_2$: phase 180° on |2⟩" · Stage `split(amp({terms:'00+01+10'},'amplitude') / amp({terms:'00+01-10'},'amplitude'))` · Claims `q26NsBar` 0.5774.

**b2 [B]** (the circuit of Fig. 14.4; D3)
- G: "Turn the signal polarization by $\theta$, add one V-polarized ancilla photon at a polarizing splitter, turn by $\varphi$, split again. Keep only runs where detector 0 sees nothing and detector 1 sees one photon."
- F: "Rotator $\theta$; PBS$_1$ (transmits H, reflects V) joining the signal and the ancilla $|1\rangle_V$; rotator $\varphi$; PBS$_2$ with vacuum; detector '0' must read $0$ and '1' must read $1$ (p. 258). Our calculation finds the amplitude of $|n\rangle$ for $n$ signal photons: $A_n = \cos^n\theta\cos^{n-1}\varphi\,(\cos^2\varphi - n\sin^2\varphi)$ (two routes: a symbolic expansion, and a mode-by-mode permanent, agree to $10^{-9}$)."
- Cap G "the three amplitudes after the circuit, before we choose θ and φ" · F "$A_0 = \cos\varphi$, $A_1 = \cos\theta\cos2\varphi$, $A_2 = \cos^2\theta\cos\varphi(1 - 3\sin^2\varphi)$" · Stage `pp(n = 0…3, A_n/A_0 at the solution)`, `yLines [{y:1},{y:-1}]` · Claims `q26NsA1overA0` 1, `q26NsA2overA0` −1 · Derivation D3.

**b3 [B]** (solving for θ and φ; success 0.2265, p. 259)
- G: "We need amplitudes $1, 1, -1$ for 0, 1, 2 photons. Two conditions give $\cos^2\varphi = (3-\sqrt2)/7$, so $\varphi = 61.58°$ and $\theta = 150.49°$. Each success then has chance $\cos^2\varphi = 0.2265$."
- F: "The printed conditions $\cos\theta\cos2\varphi/\cos\varphi = 1$ and $\cos^2\theta(1 - 3\sin^2\varphi) = -1$ reduce, with $x = \cos^2\varphi$, to $7x^2 - 6x + 1 = 0$, $x = (3 \mp \sqrt2)/7$; only $x = 0.2265$ keeps $|\cos\theta| \le 1$ (the other root gives $\cos\theta = 3.04$). So $P_{NS} = A_0^2 = 0.2265$, the same for every input of at most two photons (the book: 'at most $22.7\,\%$'); three photons are not corrected ($A_3/A_0 = 0.657$)."
- Cap G/F "the amplitude ratios 1, 1, −1 and the failing 0.657 for three photons" · Stage `pp(n = 0…3 ratios)` with `yLines` · Claims `q26NsTheta` 150.49, `q26NsPhi` 61.58, `q26NsSuccess` 0.2265, `q26NsOtherRootCosTheta` 3.040, `q26NsRatio3` 0.657.

**b4 [B]** (CZ from two NS gates, Fig. 14.5, pp. 259–260)
- G: "Two dual-rail qubits share a pair of inner paths. Two balanced splitters with a crossing give the table $i, 1, -1, i$: no entanglement. Put an NS gate on each inner path between them: only the input $|10\rangle$, with two photons inside, changes sign."
- F: "Interior rails (qubit 1's $|1\rangle$, qubit 2's $|0\rangle$) meet on $S = \tfrac1{\sqrt2}\begin{pmatrix}1&i\\i&1\end{pmatrix}$ twice with a crossing, which gives $iI$ on single photons: $U_{\rm lin} = {\rm diag}(i,1,-1,i)$; with the NS gates between, $U_{CZ} = {\rm diag}(i,1,1,i) = i(S^\dagger\otimes S^\dagger)\,CZ$ (engine: Fock simulation of four modes, gap $0$). On $|{+}{+}\rangle$ the concurrence is $0$ without the NS gates and $1$ with them (<<qc-q12-concurrence|Unit 12.6>>)."
- Cap G "left: the table that cannot entangle; right: with the NS gates" · F "$\mathrm{diag}(i,1,-1,i)$ and $\mathrm{diag}(i,1,1,i)$ on $|{+}{+}\rangle$" · Stage `split(circ(C_CZ(lin),2) / tq(C_CZ(ns),2))` · Claims `q26ConcLinear` 0, `q26ConcCz` 1.

**b5 [B]** (the cost: about 5 % and a general limit, p. 260)
- G: "Both NS gates must fire: $0.2265^2 = 0.0513$, one try in 19.5. The book quotes a limit for any linear-optics CNOT with extra photons: $2/27 = 0.074$."
- F: "$P_{CZ} = P_{NS}^2 = 0.0513$ for every input (the book: 'about $5\,\%$ on average'; our calculation finds the same value for each input because $P_{NS}$ does not depend on the state); mean attempts $19.49$. Uskov et al. bound $2/27 = 0.0741$ is cited, not derived (Bergou p. 260); $0.0741/0.0513 = 1.44$."
- Cap G/F "this gate against the 2/27 ceiling" · Stage `pp(one dot 0.0513 labelled 'this gate', one 0.0741 'limit')` · Claims `q26CzSuccess` 0.0513, `q26CzAttempts` 19.49, `q26NsBound` 0.0741.

**b6 [C]** (three gates in a row)
- Q G: "A program needs 3 CZ gates in a row, each with chance $0.0513$ and no way to repair a failure. What is the chance all three succeed?" · Q F: "$P_{CZ}^3$; how many attempts of the whole program per success?"
- Reveal G: "$0.00014$, about 1 attempt in 7400. Each extra gate multiplies by $0.0513$. That is why Bergou turns to gate teleportation." · Reveal F: "$P^3 = 1.35\times10^{-4}$, $1/P^3 = 7398$: exponentially small in the gate count (p. 260)."
- Cap G/F "success chance of a chain of CZ gates" · Stage q `pp(1 dot at 0.0513)`, reveal `pp(chain of 1…4 gates, log y)` · Claims `q26Cz3Chain` 0.000135, `q26CzAttempts3` 7398.

### Unit `q26-teleport-gate` — Teleport the gate, then count photons
**b1 [B]** (why gates must not compound, p. 260) · Terms `qc-gate-teleportation` · Bridge `qc-teleportation`
- G: "A gate with success chance $P$ fails a long program: $N$ gates all work with chance $P^N$. [[qc-gate-teleportation|Gate teleportation]] moves the risk off line: keep making a special entangled state until it works, then use it."
- F: "$P^N$ is exponentially small, so probabilistic gates alone give no advantage (p. 260). Knill, Laflamme and Milburn (2001): teleport the gate with a resource state prepared by repeat-until-success, as Chapter Q11 teleports a state (<<qc-q11-teleport-circuit|Unit 11.4>>). Waiting for one NS success takes $1/0.2265 = 4.41$ tries on average."
- Cap G/F "preparing the resource may fail; using it never does" · Stage `circ(C_GT,5)` (the preparation columns) · Claims `q26NsInverse` 4.414.

**b2 [B]** (teleporting two qubits, Fig. 14.7, p. 261)
- G: "Teleport each input with its own entangled pair: a Bell measurement, then an X and a Z fix-up. Two inputs, two pairs, four measured bits. Each of the 16 outcomes has chance $1/16$."
- F: "Each of $|c\rangle$ and $|t\rangle$ is Bell-measured against half of a Bell pair; outcomes $m_1\ldots m_4$ control X and Z on the other halves (<<qc-q11-teleport-circuit|Unit 11.4>>). Engine: all $16$ outcomes of the circuit of Fig. 14.7 have chance $0.0625$ for random inputs."
- Cap G/F "two Bell measurements, four bits" · Stage `circ(C_GT,end)` with `outcomes: '0000'` · Claims `q26GateTeleportOutcome` 0.0625.

**b3 [B]** (the resource $|r\rangle$, p. 261)
- G: "Slip a CNOT into the entangled pairs before measuring. It acts on the pair halves, ahead of the fix-ups. The prepared state $|r\rangle$ needs two Hadamards and three CNOTs and is made once, then kept."
- F: "$|r\rangle = (|0000\rangle + |0011\rangle + |1110\rangle + |1101\rangle)/2$ (p. 261, checked on the page image) $= (I\otimes{\rm CNOT}_{1\to3})(|\Phi^+\rangle|\Phi^+\rangle)$, built by H on wires 0 and 2 and CNOTs $0{\to}1$, $2{\to}3$, $0{\to}3$ (engine: equals the printed state, gap $0$). Teleporting through the CNOT turns each Pauli fix-up into one carried across it."
- Cap G/F "the five preparation columns and the state |r⟩" · Stage `split(circ(C_GT,5) / amp(C_GT,5,'probability'))` with `keep` the four resource wires · Claims `q26ResourceGap` 0.

**b4 [B]** (it works for all 16 outcomes; P14.3 ⚑ cited)
- G: "Measure. For each of the 16 outcomes there is an X–Z fix-up on the two output wires that leaves exactly CNOT$|c,t\rangle$. We checked all 16 for random inputs."
- F: "For random $|c\rangle$, $|t\rangle$ and each of the 16 Bell outcomes one Pauli $P_1\otimes P_2$ on the outputs returns ${\rm CNOT}|c,t\rangle$ (max gap $10^{-12}$). The truth table $m \to m'$ is Bergou's P14.3 (⚑): cited, not worked. Input $|{+}\rangle|0\rangle$ with outcome $0000$ needs no fix-up and leaves the Bell pair $\Phi^+$: chances $0.5$, $0.5$."
- Cap G/F "after outcome 0000: the output wires hold a Bell pair" · Stage `split(circ(C_GT,end) / amp(C_GT,end,'probability'))` with `keep: [3,5]`, `outcomes: '0000'` · Claims `q26GtGap` 0, `q26GtOut00` 0.5, `q26GtOut11` 0.5.

**b5 [B]** (the catch and KLM's cure; D4, pp. 262)
- G: "A Bell measurement needs a CNOT, which linear optics lacks. It can tell only two of the four Bell states apart: success at most $1/2$ per measurement, $1/4$ per gate. KLM's trick raises a teleportation to $n/(n+1)$ and a gate to $(n/(n+1))^2$."
- F: "Calsamiglia–Lütkenhaus: linear optics identifies a Bell state with chance at most $\tfrac12$ (cited); KLM: $P_n = (n/(n+1))^2$, so $P_1 = 0.25$, $P_3 = 0.5625$, $P_9 = 0.81$, $P_{19} = 0.9025$, $P_{199} = 0.990$. For $F = P_n \ge 0.99$: $n \ge \sqrt F/(1-\sqrt F) = 198.5$, so $n = 199$ (p. 262)."
- Cap G/F "gate teleportation success against the photon number n, log axis" · Stage `pp(n = 1, 2, 3, 5, 9, 19, 49, 99, 199; xScale log)`, `yLines [{y:0.99}]` · Claims `q26Klm1` 0.25, `q26Klm3` 0.5625, `q26Klm9` 0.81, `q26Klm19` 0.9025, `q26KlmExact99` 198.5, `q26KlmN99` 199 · Derivation D4.

**b6 [C]** (how many photons for 0.9?)
- Q G: "We want gate success at least $0.9$. What is the least $n$?" · Q F: "Least integer $n$ with $(n/(n+1))^2 \ge 0.9$; also the photons for ten gates at $F = 0.99$ if each uses $n + 1 = 200$."
- Reveal G: "$n = 19$ gives $0.9025$; $n = 18$ gives $0.8975$. For ten gates at $F = 0.99$ the book counts $10 \times 200 = 2000$ photons at once." · Reveal F: "$n = 19$ ($P_{18} = 0.8975$); the toy device of ten gates needs $2000$ simultaneous photons (p. 262), far beyond what experiments combine (stated in words)."
- Cap G/F "the 0.9 line crosses between n = 18 and 19" · Stage q `pp(KLM)`, reveal `pp(KLM, yLines 0.9)` · Claims `q26KlmN90` 19, `q26Klm18` 0.8975, `q26KlmPhotons10` 2000.

**b7 [D]** (why 1/2 — beyond the book: not derived in Bergou)
- G: "Hong–Ou–Mandel explains the 1/2. Mix two photons' polarization on a splitter. Of the four Bell states, two give patterns no other state gives. The other two give the same patterns."
- F: "Beyond the book. On a 50:50 splitter ($4$ modes: path × polarization) the singlet $\Psi^-$ exits one per port and $\Psi^+$ bunches with opposite polarizations. $\Phi^+$ and $\Phi^-$ both bunch with equal polarization and identical statistics, so only two states are identified with certainty: success $0.5$ (engine: permanent route, all four states)."
- Cap G/F "Φ⁺ and Φ⁻ look the same" · Stage `amp(C_HOM(0.5),1,'probability')` (for scale) · Claims `q26BellAnalyserSuccess` 0.5.

### Unit `q26-nonlinear` — Photons that talk through matter
**b1 [B]** (a cross-Kerr phase gate, p. 263) · Terms `qc-cross-kerr`
- G: "If the $|1\rangle$ paths of two dual-rail qubits pass through a medium that adds a phase per pair of photons, the gate table is $\mathrm{diag}(1,1,1,e^{i\varphi})$. At $\varphi = \pi$ it is CZ, with no failed runs."
- F: "$U_{Kerr} = e^{i\hat H_{Kerr}t/\hbar}$, $\hat H_{Kerr} = \varphi\hat n_1\hat n_2$ (14.3): $|11\rangle \to e^{i\varphi}|11\rangle$, the other three unchanged; $\varphi = \pi$ is CZ (<<qc-q4-cnot|Unit 4.4>>), and on $|{+}{+}\rangle$ it gives concurrence $1$. The challenge is a full $\pi$ without loss: reported work reaches large phases only with large absorption (words)."
- Cap G/F "CZ on |++⟩ makes a Bell pair" · Stage `tq(C_KERR(π),1)` · Claims `q26KerrConc` 1.

**b2 [B]** (atom plus one mode, p. 264)
- G: "Model the medium as one two-level atom and one light mode. The states $|e,n\rangle$ and $|g,n+1\rangle$ mix, and the two energies are $\sqrt{\Delta^2 + \Omega_n^2}$ apart. For detuning $\Delta = 10\Omega_0$ the mixing angle is only $5.7°$."
- F: "[[qc-jaynes-cummings|Jaynes–Cummings]] block on $\{|e,n\rangle,|g,n+1\rangle\}$: $E_\pm(n) = (n+\tfrac12)\hbar\omega \pm \tfrac\hbar2\sqrt{\Delta^2 + \Omega_n^2}$, $\Omega_n = \Omega_0\sqrt{n+1}$, $\varphi_n = \tan^{-1}(\Omega_n/\Delta)$ (p. 264); engine: the eigenvalues of the $2\times2$ block equal this for $n = 0, 1, 2$ at $\Delta = 10\Omega_0$ (gap $10^{-12}$); $\varphi_0 = 5.711°$."
- Cap G/F "energy shift of the lower level for 0 to 5 photons" · Stage `pp(n = 0…5; groups 'exact', 'dispersive −χn')` · Claims `q26MixAngle0` 5.711.

**b3 [B]** (the dispersive limit, D5, p. 265)
- G: "For large detuning expand the square root: $\sqrt{\Delta^2 + \Omega_n^2} \approx \Delta + \Omega_n^2/2\Delta$. Each extra photon then shifts the energy by $\hbar\chi$, with $\chi = \Omega_0^2/4\Delta$: $0.025\,\Omega_0$ for $\Delta = 10\Omega_0$."
- F: "$E_-(n) - E_-(0) \simeq -\hbar\chi n$ with $\chi = \Omega_0^2/4\Delta$; the atom in $|g\rangle$ gives $U_{Kerr} = e^{i\chi\hat a^\dagger\hat a t}$ (p. 265); exact first step $0.0248\,\Omega_0$ against $0.025$; $\chi t = \pi$ at $t = 125.7/\Omega_0$." Rosetta: Bergou's $\Delta$ is signed, our $\chi$ uses its size.
- Cap G/F "the exact shifts hug the straight line −χn" · Stage `pp(as b2)` zoomed (`yLines`) · Claims `q26Chi` 0.025, `q26ChiExact01` 0.0248, `q26ChiPhaseTime` 125.7 · Derivation D5.

**b4 [B]** (cross-Kerr needs more than one mode, words)
- G: "A product $\hat n_1\hat n_2$ needs two modes, each tuned to a different atomic transition. Experiments have shown such phases with cold atoms, Rydberg atoms and superconducting circuits. We state this in words."
- F: "Bergou p. 265: multi-level media with each mode resonant with its own transition (polarization selection rules) give the cross-Kerr form analogously; the microwave regime is circuit QED, taken up in Chapter Q27 (in words)."
- Cap G/F "two modes, two transitions" · Stage `circ(C_KERR(π),1)` · Claims none.

**b5 [B]** (many-photon qubits, pp. 265–266) · Terms `qc-coherent-state`, `qc-cat-state`
- G: "A laser beam is a coherent state $|\alpha\rangle$. Two of opposite sign overlap by $e^{-4\alpha^2}$ in chance: $0.018$ for $\alpha = 1$, $10^{-7}$ for $\alpha = 2$. The sum and difference, [[qc-cat-state|cat states]], are exactly orthogonal: one has only even photon numbers, one only odd."
- F: "$|\alpha\rangle = e^{-|\alpha|^2/2}\sum_n\alpha^n|n\rangle/\sqrt{n!}$, $\langle\beta|\alpha\rangle = e^{\alpha\beta^* - (|\alpha|^2+|\beta|^2)/2}$; $|\langle-\alpha|\alpha\rangle|^2 = e^{-4\alpha^2}$ ($0.0183$ at $\alpha = 1$, $1.1\times10^{-7}$ at $2$, engine); $|\alpha\rangle \pm |-\alpha\rangle$ are even and odd in $n$, hence orthogonal, with norm $1/\sqrt{2(1 \pm e^{-2\alpha^2})}$ ($0.70699$ at $\alpha = 2$, even)."
- Cap G/F "photon-number chances of |α = 2⟩ and of its even cat (only even n)" · Stage `pp(n = 0…11; groups 'coherent', 'even cat')` · Claims `q26Overlap1` 0.0183, `q26Overlap2` 1.1e-7, `q26CatEvenNorm` 0.7070.

**b6 [C]** (what a cat never has)
- Q G: "The even cat with $\alpha = 2$: what is the chance of an odd number of photons? And of no photon?" · Q F: "$P(\text{odd})$ and $P(0)$ for $(|2\rangle + |{-2}\rangle)$, normalised."
- Reveal G: "Exactly 0 for odd. Of no photon: $0.0366$, twice the coherent state's $0.0183$." · Reveal F: "$P(\text{odd}) = 0$; $P(0) = 2e^{-4}/(1 + e^{-8}) = 0.0366$; both states have mean photon number $\approx 4$ ($3.997$ for the cat, exactly $4$ for $|2\rangle$)."
- Cap G/F "the even cat's odd bars are empty" · Stage q `pp(coherent)`, reveal `pp(coherent, cat)` · Claims `q26CatOddP` 0, `q26CatP0` 0.0366.

**b7 [D]** (the balance sheet, p. 266)
- G: "Probabilistic gates need many photons and detectors. Deterministic ones need strong nonlinearity. Cat-state codes make Bell measurements deterministic. None has yet passed beyond small demonstrations."
- F: "Bergou p. 263 and p. 266: one-way (cluster) computing and a $25\,\%$ CNOT with two ancillas are named, not derived; continuous-variable gate teleportation and Bell measurement are deterministic, at the price of a large optical nonlinearity. Nothing here exceeds what the preceding units compute."
- Cap G/F "linear: probabilistic; nonlinear: deterministic but demanding" · Stage `tq(C_KERR(π),1)` · Claims none.

### 1.7 Claim ledger (key — engine call — value; numpy in `planQ26Q27-numpy.py`; every `…Gap` key is an engine max-abs difference, value 0; inputs "model (ours)" are V constants too)
- encodings: `q26WaveP0/P1` 0.75, 0.25 · `q26TruePhase` `arg` of the $|1\rangle$/$|0\rangle$ amplitude of $U(30°,40°)|0\rangle$ 130 and `q26PrintedPhase` 40 (the page's) · `q26BlochPolar` 60 · `q26DualRailP0/P1` 0.75, 0.25 · `q26Polar225` 45 · `q26Sin2_225` 0.1464.
- beamsplitter: `q26T2_70/R_70` 0.7, 0.3 · `q26StokesGap`, `q26ConvGap` 0 · `q26Conc70` 0.9165 · `q26Entropy70` 0.8813 · `q26Entropy50` 1 · `q26TwoBsChance/Phase` 1, 90.
- hom: `q26HomP20_R25/P11_R25/P02_R25` 0.375, 0.25, 0.375 · `q26HomCancel` 0 · `q26HomP20_R50/P11_R50` 0.5, 0 · `q26HomPhaseReal/Sym` 180, 0 · `q26HomR20` 0.36 · `q26HomP20_R20` 0.32 · `q26DistinguishableR50` 0.5 · the dip's 11 points $(1-2R)^2$.
- ns-cz: `q26NsBar` 0.5774 · `q26NsA1overA0/A2overA0` 1, −1 · `q26NsTheta/Phi` 150.49°, 61.58° · `q26NsSuccess` 0.2265 (= (3−√2)/7 = 0.226541) · `q26NsOtherRootCosTheta` 3.040 · `q26NsRatio3` 0.657 · `q26ConcLinear/Cz` 0, 1 · `q26CzSuccess` 0.0513 · `q26CzAttempts` 19.49 · `q26NsBound` 0.0741 · `q26Cz3Chain` 1.35e-4 · `q26CzAttempts3` 7398.
- teleport-gate: `q26NsInverse` 4.414 · `q26GateTeleportOutcome` 0.0625 · `q26ResourceGap`, `q26GtGap` 0 · `q26GtOut00/Out11` 0.5 · `q26Klm1/3/9/19/18` 0.25, 0.5625, 0.81, 0.9025, 0.8975 · `q26KlmExact99` 198.5 · `q26KlmN99` 199 · `q26KlmN90` 19 · `q26KlmPhotons10` 2000 · `q26BellAnalyserSuccess` 0.5.
- nonlinear: `q26KerrConc` 1 · `q26MixAngle0` 5.711° · `q26Chi` 0.025 · `q26ChiExact01` 0.0248 · `q26ChiPhaseTime` 125.7 · `q26Overlap1/2` 0.0183, 1.1e-7 · `q26CatEvenNorm` 0.7070 · `q26CatOddP` 0 · `q26CatP0` 0.0366 · the plotted $P(n)$ lists (`q26CoherentP`, `q26CatEvenP`, `q26JcShift`).

## 2. Derivations (step `tex` — why — **view**; a step without a view keeps the last; Ground ≥ Formal; ≥ 2 views each, each a kind the unit's stage already shows)
**D1 · beamsplitter:b2 · `|r|^2 + |t|^2 = 1,\ rt'^* + r'^*t = 0`** — G (3): (1) column 0 of $S$ is $(t', r')$, its squared sizes must add to 1: $|t'|^2 + |r'|^2 = 1$ · **circ(C_BS)** · (2) column 1: $|r|^2 + |t|^2 = 1$; the rows give the other two · (3) the two columns must be orthogonal: $r t'^* + r'^* t = 0$ · **amp(C_BS)**. F (2): (1) $S^\dagger S = I$ entry by entry · **circ** · (2) result with $SS^\dagger = I$ · **amp**.
**D2 · hom:b1 · `a_0^\dagger a_1^\dagger \to \sqrt2t'r|20\rangle + (t't + r'r)|11\rangle + \sqrt2r't|02\rangle`** — G (4): (1) each creation operator becomes a sum over the two exits · **circ(C_HOM)** · (2) multiply out: four terms · (3) $a_2^\dagger a_2^\dagger$ makes $|20\rangle$ with factor $\sqrt2$ (same for $|02\rangle$) · (4) $a_2^\dagger a_3^\dagger$ and $a_3^\dagger a_2^\dagger$ both make $|11\rangle$ and add · **amp(C_HOM,1,'probability')**. F (3): (1) substitute $a_j^\dagger = \sum_kS_{kj}a_k^\dagger$ · **circ** · (2) expand with $(a^\dagger)^2|vac\rangle = \sqrt2|2\rangle$ · (3) result · **amp**.
**D3 · ns-cz:b2 · `A_n = \cos^n\theta\cos^{n-1}\varphi\,(\cos^2\varphi - n\sin^2\varphi)`** — G (4): (1) rotator $\theta$ sends each signal photon to the detector-0 path with weight $\sin\theta$ (not allowed) or on with $\cos\theta$: keep $\cos^n\theta$ · **amp({terms:'00+01+10'})** · (2) the ancilla meets the signal photons in one mode; rotator $\varphi$ sends H to out with $\cos\varphi$, to detector 1 with $\sin\varphi$, and V to out with $-\sin\varphi$, to detector 1 with $\cos\varphi$ · (3) exactly one photon at detector 1: the ancilla goes there ($\cos\varphi\cos^n\varphi$) or one of $n$ signal photons does and the ancilla stays ($-n\sin^2\varphi\cos^{n-1}\varphi$) · **pp(A_n/A_0)** · (4) add: $A_n$. F (3): (1) operator substitution · **amp** · (2) coefficient of $d_1\,\mathrm{out}^n$ · (3) result · **pp**.
**D4 · teleport-gate:b5 · `n = \sqrt F/(1 - \sqrt F)`** — G (3): (1) $F = (n/(n+1))^2$ · **pp(KLM)** · (2) take the square root: $\sqrt F = n/(n+1)$ · (3) solve: $n = \sqrt F/(1 - \sqrt F)$; for $F = 0.99$ this is $198.5$, so $199$ · **pp(KLM, yLines 0.99)**. F (2): (1) $\sqrt F = n/(n+1)$ · **pp** · (2) result, $n \ge 198.5$ · **pp(+yLines)**.
**D5 · nonlinear:b3 · `\chi = \Omega_0^2/4\Delta`** — G (3): (1) $\sqrt{\Delta^2 + x} \approx \Delta + x/2\Delta$ for small $x$ · **pp(JC shifts)** · (2) put $x = \Omega_0^2(n+1)$: the lower level moves by $-\Omega_0^2(n+1)/4\Delta$ · (3) the part that grows with $n$ is $-n\,\Omega_0^2/4\Delta = -\chi n$ · **pp(zoom)**. F (2): (1) expansion of $E_-(n)$ · **pp** · (2) result · **pp(zoom)**.
**viewCaptions:** D1 "one photon's two exits" / "the chances at the exits" · D2 "the splitter box on the three Fock states" / "the three exit chances" · D3 "equal weights on 0, 1, 2 photons" / "amplitude ratios after the circuit" · D4 "gate success against n" / "the 0.99 line" · D5 "exact shifts of the lower level" / "the same shifts, zoomed against −χn".

## 3. Try-it widgets (props read from `PolarizationDial.tsx`, `AmplitudeBars.tsx`, `PhaseDial.tsx`, `TwoClocks.tsx`, `BlochSphere.tsx`; every readout wording re-read by the builder in `Q26.tryits.test.tsx`; lines marked ✓ are the tested ones from L8, L11 and Q5)
| Unit | Spec | Try this |
|---|---|---|
| encodings | `polarization-dial {chi:0, analyzer:0, carrier:'photon'}` | ✓ Press Turn 45°. The lab turn is 45° and the readout says the sphere turn is 90°. Switch to electron: only 45° (the photon's doubling). |
| beamsplitter | `bloch {theta:90, phi:0, editable:false, measure:'x', rotations:true, rotationAngles:[45,90,135,180]}` | ✓ (Q5's lines) Press 45°, 90°, 135°: read 0.854, 0.5, 0.146. 180°: output 2 every time: two splitters with a phase between them. |
| hom | `amplitude-bars {state:[90,180], basis:'z', editable:true}` | Read the two bars: equal, the second phasor opposite (the real splitter's $|20\rangle - |02\rangle$). Set the phase to 0°: the symmetric splitter's pair. |
| ns-cz | `phase-dial {theta:0, rotations:true}` | Press the $R_z$ buttons up to 180°: the relative sign flips and the point goes to the other end of the equator: the sign the NS gate puts on $|2\rangle$. |
| teleport-gate | `bloch {theta:60, phi:0, editable:true, rotations:true, rotationAngles:[180]}` | Press 180° about two different axes in either order: the arrow lands at the same point (the kets differ by a sign): why X and Z fix-ups commute up to a global phase. |
| nonlinear | `two-clocks {upper:3, lower:1, start:'+x'}` | ✓ Drag time to 45°: gap = 90°, the arrow on $+y$. A Kerr phase $\chi t$ is such a gap: $\chi t = \pi$ flips the arrow. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0; full walkthroughs: no sheet assigns any of these; P14.1–P14.3 are not used)
- **encodings** 1 warm-up numeric `q26-e-p1` chance of $|1\rangle$ for $\theta = 30°$ → **0.25**. 2 core numeric `q26-e-polar` Bloch polar angle for $\theta = 22.5°$, degrees → **45** (int). 3 core numeric `q26-e-phase` relative phase in degrees of $U(30°, 40°)|0\rangle$ → **130** (int; the Correction).
- **beamsplitter** 1 warm-up numeric `q26-b-r` chance of reflection when $|t|^2 = 0.7$ → **0.3**. 2 core numeric `q26-b-entropy` entropy of the exits at 70:30, bits → **0.881**. 3 core choice `q26-b-two` "two balanced splitters in a row" → **the photon leaves the other port with certainty** ✓ (`q26TwoBsChance`).
- **hom** 1 warm-up numeric `q26-h-p11` $P(|11\rangle)$ at $R = 0.25$ → **0.25**. 2 core numeric `q26-h-r20` $P(|11\rangle)$ at $R = 0.2$ → **0.36**. 3 core choice `q26-h-why` "why no one-per-exit at 50:50" → **the two ways have equal and opposite amplitudes and cancel** ✓ (`q26HomCancel`).
- **ns-cz** 1 warm-up numeric `q26-n-success` $\cos^2\varphi$ for $\varphi = 61.58°$ → **0.2265**. 2 core numeric `q26-n-attempts` mean attempts per CZ success → **19.49**. 3 stretch numeric `q26-n-100` expected successes in 100 attempts → **5.13**.
- **teleport-gate** 1 warm-up numeric `q26-t-klm3` $P_3$ → **0.5625**. 2 core numeric `q26-t-n90` least $n$ with $P_n \ge 0.9$ → **19** (int). 3 core numeric `q26-t-outcome` chance of one Bell-outcome quadruple → **0.0625**.
- **nonlinear** 1 warm-up numeric `q26-k-overlap` $|\langle-\alpha|\alpha\rangle|^2$ at $\alpha = 1$ → **0.0183**. 2 core numeric `q26-k-chi` $\chi/\Omega_0$ at $\Delta = 10\Omega_0$ → **0.025**. 3 core choice `q26-k-cat` "photon numbers of the even cat" → **only even ones** ✓ (`q26CatOddP`).

## 5. Glossary (new in 709; checked against `ids.json`: all 15 ids free; reused, not redefined: `qc-beam-splitter`, `qc-photon-modes`, `qc-mach-zehnder`, `qc-phase-shifter`, `qc-polarization`, `qc-photon-space`, `qc-teleportation`, `qc-cnot`, `qc-phase-gate`, `qc-swap-gate`, `qc-bell-measurement`, 448's `polarizing-beam-splitter`, `wave-plate`)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-linear-optics` | linear optics | — | Mirrors, splitters, wave plates and phase shifters: parts that treat every photon alike. | Devices whose action on the modes is a unitary matrix on the creation operators (Bergou Ch. 14). | encodings:b1 | — |
| `qc-dual-rail` | dual-rail qubit | — | A qubit stored in which of two paths one photon takes. | $|0\rangle_{dr}$, $|1\rangle_{dr}$: one photon in path 0 or in path 1 (Bergou p. 257). | encodings:b4 | `qc-q5-interferometer` |
| `qc-scattering-matrix` | scattering matrix $S$ | notation | The table that turns the amplitudes entering a splitter into those leaving it. | $S = \begin{pmatrix}t' & r\\ r' & t\end{pmatrix}$, unitary for a lossless splitter (Fig. 14.2). | beamsplitter:b1 | `qc-f4-unitary` |
| `qc-stokes-relations` | Stokes relations | — | The rules that $t$, $r$, $t'$, $r'$ obey when no light is lost. | $|r| = |r'|$, $|t| = |t'|$, $rt'^* + r'^*t = 0$ (14.1). | beamsplitter:b2 | — |
| `qc-fock-state` | Fock state $|ij\rangle_{23}$ | notation | A state with an exact number of photons in each mode. | $|ij\rangle_{23}$: $i$ photons in mode 2, $j$ in mode 3. | beamsplitter:b4 | — |
| `qc-hong-ou-mandel` | Hong–Ou–Mandel effect | — | Two identical photons meeting on a 50:50 splitter leave together. | $a_0^\dagger a_1^\dagger \to (|20\rangle + e^{i\phi}|02\rangle)/\sqrt2$ because $t't + r'r = 0$. | hom:b1 | — |
| `qc-nonlinear-sign-gate` | nonlinear sign gate | — | A gate that flips the sign of the two-photon part of a state. | $c_0|0\rangle + c_1|1\rangle + c_2|2\rangle \to c_0|0\rangle + c_1|1\rangle - c_2|2\rangle$. | ns-cz:b1 | — |
| `qc-heralded-gate` | heralded gate | — | A gate that works only when detectors show an agreed signal; then we know it worked. | A gate accepted on a detection pattern; a rejected run is discarded. | ns-cz:b1 | — |
| `qc-gate-teleportation` | gate teleportation | — | Doing a gate on a qubit by teleporting it through a prepared entangled state. | Applying a unitary by Bell measurements on a resource state and Pauli fix-ups (KLM). | teleport-gate:b1 | `qc-q11-teleport-circuit` |
| `qc-klm` | KLM scheme | — | The plan that makes linear-optics gates succeed with chance close to 1 by using many photons. | Gate teleportation with $P_n = (n/(n+1))^2$ (Knill, Laflamme, Milburn 2001). | teleport-gate:b5 | — |
| `qc-cross-kerr` | cross-Kerr phase | — | A phase that depends on the photon numbers in two modes. | $e^{i\varphi\hat n_1\hat n_2}$ (14.3). | nonlinear:b1 | — |
| `qc-jaynes-cummings` | Jaynes–Cummings model | — | One two-level atom exchanging energy with one light mode. | $\hat H = \hbar\omega_a\sigma_z/2 + \hbar\omega\hat a^\dagger\hat a + (\hbar\Omega_0/2)(\hat a\sigma_+ + \hat a^\dagger\sigma_-)$. | nonlinear:b2 | `qc-l11-two-level` |
| `qc-dispersive-shift` | dispersive shift $\chi$ | — | The small energy change each photon causes when atom and light are far from resonance. | $\chi = \Omega_0^2/4\Delta$, $|\Delta| \gg \Omega_n$. | nonlinear:b3 | — |
| `qc-coherent-state` | coherent state | — | The state of laser light: a Poisson-spread photon number. | $|\alpha\rangle = e^{-|\alpha|^2/2}\sum\alpha^n|n\rangle/\sqrt{n!}$, $\hat a|\alpha\rangle = \alpha|\alpha\rangle$. | nonlinear:b5 | — |
| `qc-cat-state` | cat state | — | A sum or difference of two opposite coherent states. | $|\alpha\rangle \pm |-\alpha\rangle$: even / odd photon number, orthogonal. | nonlinear:b5 | — |

## 6. Review cards
- **encodings** G: a photon qubit is polarization or path; the Bloch angle is twice the plate angle. F: $U(\theta,\varphi)$, $2\theta$. Eq $\cos\theta|0\rangle + \sin\theta e^{i\phi}|1\rangle$. Trap: "$U|0\rangle$ has phase $\varphi$" (it is $\varphi + 90°$).
- **beamsplitter** G: four numbers, two rules, one photon makes entangled exits. F: Stokes, (14.1)–(14.2). Eq $rt'^* + r'^*t = 0$. Trap: "$r = 1 - t$".
- **hom** G: identical photons leave together at 50:50; the dip is $(1-2R)^2$. F: p. 256–257. Eq $t't + r'r = 0$. Trap: "photons just add chances".
- **ns-cz** G: a heralded ancilla gives a sign flip; two make CZ; about 5 %. F: $A_n$, $(3-\sqrt2)/7$. Eq $P_{CZ} = P_{NS}^2$. Trap: "0.227 is an average over inputs".
- **teleport-gate** G: make $|r\rangle$ off line; KLM counts $(n/(n+1))^2$. F: Figs. 14.6–14.8. Eq $P_n = (n/(n+1))^2$. Trap: "a probabilistic gate can be repeated inside the program until it works".
- **nonlinear** G: Kerr phase from a detuned atom; cats are orthogonal. F: $\chi = \Omega_0^2/4\Delta$, $e^{-4\alpha^2}$. Eq $U_{Kerr} = e^{i\chi\hat a^\dagger\hat a t}$. Trap: "any two coherent states are orthogonal".

## 7. Symbol-before-use
**7.1 Ground:** $\theta$, $\varphi$, $U$ encodings:b2 · $S$, $t, r, t', r'$ beamsplitter:b1 · $|ij\rangle$ b4 · $R$ b1 · $A_n$ ns-cz:b2 · $P$, $n$ teleport-gate:b1/b5 · $\Delta$, $\Omega_0$, $\chi$, $\alpha$ nonlinear:b2–b5. **FLAGS:** $\theta$ is half the polar angle; $\varphi$ in $U(\theta,\varphi)$ is the axis azimuth, in a state $\cos\theta|0\rangle + \ldots e^{i\phi}$ the state's azimuth; unprimed $r$, $t$ belong to port 1. **7.2 Formal:** adds $\sigma_{x,y}$, $a_j^\dagger$, $|vac\rangle$ beamsplitter:b4 · $\hat n_j$ nonlinear:b1 · $\hat a$ b5. Counts: 0 used before definition in either track (to confirm by the symbols test).

## 8. Errata (Correction boxes; the review re-verifies each on the page image)
- **K1 — Bergou p. 257 (PDF 263), the state $U|0\rangle$** *(image checked)*. says: $U|0\rangle = \cos\theta|0\rangle + \sin\theta e^{i\varphi}|1\rangle$. shouldSay: "Our calculation finds $\cos\theta|0\rangle + ie^{i\varphi}\sin\theta|1\rangle$: the relative phase is $\varphi + 90°$ ($130°$ for $\theta = 30°$, $\varphi = 40°$, not $40°$)." `check: close(V.q26TruePhase, 130, 1e-9) && close(V.q26PrintedPhase, 40, 1e-9)` (engine: `arg(U₁₀/U₀₀)`). The box also notes that $\theta$ is half the polar angle (B33; a convention, not an error).
- **Checked, no box** (engine or numpy): (14.1) and (14.2), the one- and two-photon expansions, $t't + r'r = 0$ for random lossless 50:50 splitters, the NS conditions (our derivation reproduces both printed equations and the angles $150.49°$, $61.58°$), "22.7 %" (rounds $0.2265$), $U_{\rm lin}$ and $U_{CZ}$, $2/27$, $n = 199$, the resource state (page image, PDF 267), the dressed energies and $\chi$.
- **Refinements ("our calculation finds", not boxes):** $P_{NS}$ is independent of the input for states of up to two photons (the book: "depends on the input state, at most 22.7 %"); $P_{CZ} = 0.0513$ for every basis input (the book: "about 5 % on average"); the signs of $\Delta$ in §14.4.1 assume $|e,n\rangle$ is the upper level (our $\chi$ uses $|\Delta|$).
- Map errata B33 is the same fact as K1's second sentence; `P-709-map.md` lists no other Ch. 14 item.

## 9. Engine gaps and stage contracts
**9.1 Engine** (new `physics/qc/optics.ts`, lazy chunk (rule h), imported by `Q26.values.ts` only; numpy `pipeline/make_optics_fixtures.py` → `__fixtures__/qc-optics.json`, twins `pipeline/claims_qc709/q26.py`; tests beside): `waveUnitary(θ,φ)`, `waveKet`, `dualRailKet(θ,φ)` · `bsReal(R)`, `bsSym()`, `bsQ5()`, `stokesGap(S)` · `fockAmp(S,nin,nout)` (permanent), `fockBlock(S,n)` (the $n$-photon unitary on two modes), `twoPhoton(S)` {a20, a11, a02}, `homDip(R)`, `distinguishable(R)` · `nsAmplitudes(θ,φ,nMax)`, `nsSolve()` {θ, φ, success, otherRootCos}, `czDualRail(withNs)` (4-mode Fock simulation; gap 0 to the printed matrices) · `gtCircuit()` (the `C_GT` circuit), `cnotTeleport(c,t,outcome)` → {chance, fixed} (searches the 16 Paulis; **no table is exposed**, P14.3), `klmSuccess(n)`, `klmNeeded(F)`, `bellAnalyzerSuccess()` (4 modes) · `kerrGate(φ)`, `jcBlock(n,Δ,Ω₀)`, `jcShift(n,Δ,Ω₀)`, `jcChi`, `coherentFock(α,N)`, `catFock(α,parity,N)`, `coherentOverlap`. Reused: `runCircuit`, `circuitUnitary`, `concurrence`, `vonNeumann`, `eigh`, `P`, `cnot`, `controlled`.
**Numpy routes (independent, in `planQ26Q27-numpy.py`):** permanents versus `expm` of $\sum a_i^\dagger[\log S]_{ij}a_j$ on a truncated Fock space versus sympy polynomials; the NS gate as a symbolic operator substitution and as a product of mode matrices; $7x^2 - 6x + 1$ by `fsolve`; $|r\rangle$ by 2 H + 3 CNOT; the 16 outcomes by explicit Bell projectors and a Pauli search; coherent states by $\sqrt{n!}$ series. Cross-checks: `czDualRail(true)` equals ${\rm diag}(i,1,1,i)$; `fockBlock(S,2)` equals `twoPhoton(S)`; `nsAmplitudes` equals the mode-matrix product; `circuitUnitary(C_HOM)` equals `fockBlock` embedded.
**9.2 Stage: none new.** Every picture uses an existing kind: `circuit` (`unitary` boxes ≤ 4 wires), `amplitudes` (`terms`, `keep`), `two-qubit`, `complex-plane`, `bloch`, and `plot` **points mode** (≤ 24 points, ≤ 4 groups, y from `V`, as 448 L10 does). Honest limits: dots instead of lines for the HOM dip and the KLM curve; Fock labels on an `amplitudes` bar are bit strings, so captions name them (Rosetta in `beamsplitter:b4`). **Smallest additions if the judge wants lines (not requested):** two additive `plot` curves, `homDip` (x = $R$ in 0…1; y = $(1-2R)^2$) and `klmSuccess` (x = $n$ 1…200, log axis; y = $(n/(n+1))^2$), one registry row each. No new SVG kind, no widget.
**9.3 Widgets:** none required; every Try-it is true on today's code (lines re-read by the builder).

## 10. Media (deferred, per BUILD-LOG)
Film: "Two photons, one exit" (manifest keys `q26HomP20_R50`, `q26HomPhaseReal`, `q26HomDip`, re-checked against the engine). Blender: none (the Part XI cryostat opener belongs to Chapter Q24). Decor: waveguides glowing on a photonic chip (atmosphere only, no numbers).

## 11. Hooks
**11.1 Concept stations** (`concepts.ts`; ids checked by `concepts.test.ts`): `qc-photon-encodings-station` (encodings; needs the Q2 photon station) · `qc-splitter-station` (beamsplitter; needs the encodings station, `qc-f4-unitary`) · `qc-hom-station` (hom; needs the splitter station) · `qc-ns-cz-station` (ns-cz; needs the HOM station, `qc-cnot`) · `qc-gate-teleport-station` (teleport-gate; needs the NS-CZ station and Q11's teleportation) · `qc-kerr-station` (nonlinear; needs the HOM station). **11.2 Arcade (Spot the error; `Q26x`):** `qc-hom-add-chances` ("photons at a splitter just add chances"; why `q26HomP11_R50`) · `qc-ns-average` ("0.227 is an average over inputs"; why `q26NsSuccess`) · `qc-klm-repeat` ("repeat a failed gate inside the program until it works"; why `q26Cz3Chain`) · `qc-cat-orthogonal` ("any two coherent states are orthogonal"; why `q26Overlap1`). **11.3 Bridges.** Existing rows used: `qc-q2-photon`, `qc-f4-unitary`, `qc-l7-two-angles`, `qc-l8-bb84`, `qc-q9-entropy`, `qc-f1-phase`, `qc-q4-cnot`, `qc-q6-bell-circuit`. **NEW rows (targets built):** `qc-q5-interferometer` → `q5-interferometer`; `qc-q11-teleport-circuit` → `q11-teleport-circuit`; `qc-q12-concurrence` → `q12-concurrence`; `qc-l11-two-level` → 448 `l11-two-level` (also proposed by Q24 and Q27: add once; labels a few words). Wiring pass: Q5's closing beat may name "Chapter Q26"; Chapters Q24, Q25, Q27 are named in words.

## Totals
6 units · 35 beats (6 clues, 2 `deeper`) · 5 derivations (≥ 2 views per track each) · about 90 claim keys (every displayed number; the plotted lists are `V` arrays) · 18 challenges (15 numeric, 3 choice; no assigned homework, all with walkthroughs) · 15 new glossary entries (2 notation beats: `qc-scattering-matrix`, `qc-fock-state`) · 1 Correction (K1) · 4 new bridge rows · **0 new stage kinds, 0 new curves, 0 new widgets** · 1 new engine module (`physics/qc/optics.ts`, about 35 functions) with a numpy twin.

## Rulings requested
- R1 **Numbering**: the map's "Q24" is this chapter, the owner's brief numbers it Q26 (Q24 control, Q25 atoms and ions, Q27 chips). **Recommend** Q26 and update the map's header in the wiring pass.
- R2 **Reported numbers**: no 709 channel is validated, so experimental figures are words and every digit is a model computation. **Recommend keep** (no platform work); the alternative is `Beat.reported` plus a 709 validator.
- R3 **Stage**: no new kind or curve; `plot` points mode for the dip and KLM. **Recommend approve**; fallback two curves (§9.2).
- R4 **Correction K1** (the missing $i$) with an engine check. **Recommend approve**; B33's angle doubling stays a Rosetta line, not a box.
- R5 **§1.5**: Q5 already uses pp. 7–8, so Q26 adds only a link-back (`beamsplitter:b1`). **Recommend keep.**
- R6 **Problems**: P14.1(a) (per-state NS table), P14.2 (phase condition) and P14.3 (truth table) are cited only; `cnotTeleport` exposes existence, never a table; CZ's $0.0513$ appears only as the book's own sentence refined. **Recommend approve.**
- R7 **Beyond the book**: one `deeper` beat (`teleport-gate:b7`, why Bell analysis tops out at $1/2$) computed by the HOM machinery. **Recommend keep** (labelled).
- R8 **Fock labels as bit strings** on `amplitudes` and `unitary` boxes (captions name the bars). **Recommend approve.**
- R9 **Gloss collisions** with the parallel Q24/Q25 plans (`qc-rabi…`, `qc-t1`, `qc-zeeman`): Q26 tags none of them. **Recommend** the judge re-checks `ids.json` at merge time.

**Cost estimate (builder steps, one builder):** engine + numpy twin + tests ≈ 50 · content (6 units: story, values, review, glossary, challenges, tests, bridges, concepts) ≈ 80 · lints, e2e lists, visual QA and fixes ≈ 30: **about 160 steps**; dropping `teleport-gate:b7` and `nonlinear:b7` saves ≈ 8.
