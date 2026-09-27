# P-Q1-story — Q1 "Stern–Gerlach and the rules of the game" (role P, Physics 709 pilot chapter)

Proposal only. Nothing under `app/` is modified. Format: `P-L2-story.md`, extended for the two tracks of
`W-709-platform.md` §B and the bridges of §C. Map entry: `P-709-map.md` §2 Q1; rulings: `decisions/qc709-map.md`.
Q1 is the notes' own Lecture 1 (9/2), so it is also the chapter's print-ready Read mode.

**Sources read.**
- 709 notes Lecture 1, pp. 2–5: the text layer (`sources/qc709-n1/text.md`) and all four page images
  (`pages/p02–p05.png`), checked by eye. The images add Fig. 1 (furnace, knife-edge magnet, "classical prediction"
  band vs. two lines), Fig. 2 (the parallelogram) and Fig. 3 (the projection), and the notes' highlights: $E = -\mu\cdot B$,
  $F = -\nabla E$, $\widehat{SG}_{z\pm}|{\pm z}\rangle = |{\pm z}\rangle$, the superposition line, and "norm".
- Bergou 2e §1.1, p. 1 (Eq. 1.1). Ch. 1 printed = PDF − 15.
- Axler 4e: 1.19–1.20 p. 12 (vector space), 1.26–1.27 p. 14 (uniqueness of 0 and of inverses), 2.11–2.12 p. 31
  ($\mathcal P_m(\mathbb F)$, degree at most $m$), 6.2 p. 183 and 6.3 p. 184 (inner product, weighted example). Printed = PDF − 14.
- HW1 (`sources/qc709-hw1`), to keep Q1 clear of its answers (P2 sits on this physics).
- Ownership: 448 L1–L2 and F2 (`f2-space`, `f2-dot`: vectors from graph paper, the law of cosines, why the conjugate).
  Q1 follows the notes and bridges to both, so nothing is taught twice.

**Evidence.** Every number was computed twice: an independent numpy script (`pilot-plan-q1.py`; CODATA constants as in
`scipy.constants`) and the app's engine (`pilot-plan-engine.ts`, bundled with the repo's rolldown into the session
scratchpad; read-only imports of `physics/{sg,field,spin,linalg,complex,random}.ts` and `physics/qc/cmat.ts`). They
agree everywhere, including the seeded tallies `fireMany(…, rng(709))`.

**Conventions.**
- Beat ids, phases [L]/[B]/[C], the two tracks **G** (≤ 25 words per sentence) and **F** (≤ 40), captions and claims:
  as in `P-F1-story.md`. Here [L] means the notes say it.
- Stage shorthand: `lab{…}` = `{kind:'lab-r3', …}` with `main(src, devices)` = one bench `{id:'main', source:src,
  devices}`; `plane{…}` = `{kind:'hilbert-plane', shot:'H-FLAT', …}`; `ops{…}` = `{kind:'operator-space', shot:'O-STD',
  …}`; `amp{…}` = the planned `amplitudes` kind. `Z = {axis:'z'}`, `Zp = {axis:'z', keep:'+'}`, `X = {axis:'x'}`,
  `Xp = {axis:'x', keep:'+'}`.
- `P0 = {muZ: SILVER.muB, dBdz: 1000, m: SILVER.m, v: 550, L: 0.035, D: 0}`: 1000 T/m over 3.5 cm at 550 m/s, the
  gate's illustrative values (`physics/field.test.ts`); D = 0 reads the deflection at the magnet's exit.
- **Units and signs (erratum N1).** SI throughout, as in the engine: $\mu_B = e\hbar/2m_e$. The two values $\pm\hbar/2$ belong
  to the spin $S_z$. The course's $|{+z}\rangle$ means $S_z = +\hbar/2$; for silver the moment points opposite to the spin,
  so "moment up" (the notes' wording) is $|{-z}\rangle$ here. The fidelity item `lab-moment-opposite` already says so.
- **Rosetta** (stated once, in `q1-sequences:b1` cap F): notes $\widehat{SG}_{z\pm}$ = the app's "z magnet, keep ±";
  notes "screen" = plate; Bergou $|0\rangle, |1\rangle$ = $|{+z}\rangle, |{-z}\rangle$ (ruling C1); the notes' zero vector $|0\rangle$ is
  written $0$ here (§8 N12), because $|0\rangle$ is the qubit state $|{+z}\rangle$.
- **HW1 P2 guard.** P2 asks for the $+z \to \hat n \to -z$ fraction as a function of the tilt, and its maximum. No Q1
  beat, caption, challenge, film or Arcade level tilts that middle magnet, plots a fraction against a tilt, or calls a
  value a maximum. The notes' z–x–z example is shown per magnet (½) and from the oven (⅛ per spot). See §12 Q1.

## 0. Chapter map

Q1 answers the map's question: **"Why does a beam of silver atoms split into exactly two spots, and what kind of maths
can describe that?"** The first two units are the experiment (notes pp. 2–3); the last three are the rules the maths
must obey (notes pp. 3–5).

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges offered | F bridges |
|---|---|---|---|---|---|---|
| 1 | `q1-two-spots` | Two spots from a lopsided magnet | Why does a lopsided field push atoms at all, and why into exactly two spots? | notes p. 2, Fig. 1 | `l1-quantized` | — |
| 2 | `q1-sequences` | A second magnet can erase the first | What happens when atoms sorted along $z$ meet a magnet turned 90°, then a $z$ magnet again? | notes pp. 2–3 | `l1-sequential`, `l4-projectors`, `l7-compatible` | — |
| 3 | `q1-superposition` | Adding states: the superposition principle | If an atom can be in $\vert{+z}\rangle$ or $\vert{-z}\rangle$, what does it mean to be in both? | notes p. 3 (§B, §1); notes p. 7 (preview); Bergou Eq. 1.1 p. 1 | `l1-vectors`, `l2-plus-y`, `l6-mixture` | `f1-plane`, `f1-phase` |
| 4 | `q1-vector-space` | The rules for adding and scaling kets | Which rules must kets obey so that adding and scaling always make sense? | notes pp. 3–4, Fig. 2; Axler 1.19–1.20 p. 12, 2.12 p. 31 | `l2-vector-space` | `f2-space` |
| 5 | `q1-inner-product` | Lengths and angles for complex vectors | How do we measure a ket's length, and the overlap of two kets, when the numbers are complex? | notes pp. 4–5, Fig. 3; Axler 6.2 p. 183, 6.3 p. 184 | `l2-inner-product` | `f2-dot`, `f1-plane` |

**Outcomes** (Ground wording):
- Explain how a lopsided field pushes a small magnet, and why the plate shows two spots, not a smear.
- Predict z, then x, then z magnet sequences, and say what "a measurement can erase an earlier one" means.
- Write a superposition of two states, rescale it, and find each outcome's chance.
- List the rules of a vector space, and test whether a set of objects obeys them.
- Compute an inner product and a length for complex vectors, and say why the bra's numbers are conjugated.

**Prerequisites** (concepts): F1 `qc-complex-plane`, `qc-complex-multiply`, `qc-phase`; F2's vector stations when
written. 448 twins: `quantized`, `prepares`, `vectors`, `vector-space`, `inner-product`.

**Openers and films.** The Part I Blender opener (§10.1) plays before `q1-two-spots`. Film `qc-q1-zxz` is the
`Unit.opener` of `q1-sequences`; the optional `qc-q1-energy-slope` is an insert at `q1-two-spots:b3`.

## 1. Story beats per unit

Stage kinds: `lab-r3` (units 1–3), `hilbert-plane` (units 3–5), `operator-space` (unit 5, b5), the planned
`amplitudes` (unit 3, b4; fallback `hilbert-plane` + caption). Not used: `bloch` (Q3 introduces the sphere), `hopf`.

### Unit `q1-two-spots` — Two spots from a lopsided magnet

**`q1-two-spots:b1` [L]** (the experiment)
- **G:** "In 1921–22, Stern and Gerlach heated silver in a furnace and let a thin beam of atoms fly between the poles of a magnet. One pole is sharp and the other is grooved, so the field is lopsided: strongest near the sharp pole. The atoms land on a glass plate."
- **F:** "A collimated beam of Ag atoms from an oven crosses an inhomogeneous field $\vec B(\vec r)$ with a large gradient $\partial B_z/\partial z$ near the knife-edge pole, then deposits on a plate (notes p. 2, Fig. 1). The deposit maps each atom's deflection."
- **Cap:** G "furnace → lopsided magnet → plate" · F "oven → SG$_z$ (inhomogeneous $\vec B$) → plate"
- **Stage:** `lab{ benches:[main('oven', [Z])], deposit:'clear', shot:'L-EST', beamTo:'gap' }`; anchors `knife-edge`, `streamlines`.
- **Claims:** none. "1921–22" is a date; W to confirm the number lint exempts years, as it exempts L2's rule counts.

**`q1-two-spots:b2` [L]** (a tiny magnet's energy)
- **G:** "Each silver atom behaves like a tiny bar magnet with a strength and a direction, its [[qc-magnetic-moment|magnetic moment]] $\vec\mu$. Call its up–down part $\mu_z$, and the field's up–down strength $B_z$. Then the atom's energy is $E = -\mu_z B_z$: lowest when the magnet lines up with the field."
- **F:** "A moment $\vec\mu$ in a field $\vec B$ has energy $E = -\vec\mu\cdot\vec B$ (notes p. 2); for $\vec B \parallel \hat z$, $E = -\mu_z B_z$. Of silver's 47 electrons only one contributes to the net angular momentum, so $\vec\mu$ is one electron's spin moment."
- **Cap:** G "one atom's moment, drawn as a small arrow" · F "$E = -\vec\mu\cdot\vec B$"
- **Stage:** `lab{ benches:[main('oven', [Z])], shot:'L-DETAIL' }`; anchor `atom-moment`.
- **Claims:** none (definitions; "47" is the notes' electron count, a count not a physics value).
- **Bridge (G):** "Spin Lab starts the same way: <<l1-quantized|Spin Lab 1.1 Two spots, not a smear>>."

**`q1-two-spots:b3` [L]** (force is the downhill slope of energy; D1)
- **G:** "A ball rolls toward lower energy, and the push equals the downhill slope of its energy. Suppose $B_z$ grows by $G$ tesla for every metre up. Then $E$ changes by $-\mu_z G$ per metre, so the push up is $F_z = \mu_z G$."
- **F:** "$\vec F = -\nabla E = \nabla(\vec\mu\cdot\vec B)$; for $\vec B \parallel \hat z$ this gives $F_z = -\partial E/\partial z = \mu_z\,\partial B_z/\partial z$ (notes p. 2). A uniform field exerts a torque but no net force."
- **Cap:** G "$\mu_z = \mu_B$ in 1000 T/m: a push of $9.27 \times 10^{-21}$ N" · F "$F_z = \mu_z\,\partial B_z/\partial z$; $a = F_z/m_{\text{Ag}} = 5.18 \times 10^4$ m/s²"
- **Stage:** `lab{ benches:[main('oven', [Z])], shot:'L-END' }`; anchors `gradient-arrow`, `streamlines`.
- **Derivation:** D1 (§2).
- **Claims:** `q1Force` — `SILVER.muB * 1000` → 9.274e−21 N (engine gap E2 `sgForce`) · `q1Accel` — `SILVER.muB * 1000 / SILVER.m` → 51 776 m/s² (E2 `sgAcceleration`).

**`q1-two-spots:b4` [L]** (the classical smear; D2)
- **G:** "Classically, each atom's magnet points in a random direction, so $\mu_z$ could be anything from $-\mu$ to $+\mu$, where $\mu$ is the moment's full strength. The push, and so the landing height, is proportional to $\mu_z$. The plate should show one continuous smear."
- **F:** "For isotropic classical moments $\mu_z = \mu\cos\theta_\mu$, with $\theta_\mu$ the moment's angle from $\hat z$, is spread continuously over $[-\mu, \mu]$. Since $\Delta z \propto \mu_z$, the plate would show a filled band (notes Fig. 1, 'classical prediction')."
- **Cap:** G "classical prediction: one smear from top to bottom" · F "$\Delta z = \frac{\mu_z}{2m}\frac{\partial B_z}{\partial z}\left(\frac Lv\right)^2 \propto \mu_z$"
- **Stage:** `lab{ benches:[main('oven', [Z])], model:'classical', ghostBand:true, deposit:'clear', shot:'L-OTS' }`; anchors `ghost-band`, `drop-line`.
- **Derivation:** D2 (§2).
- **Claims:** `q1DeflHalf` — halving $\mu_z$ halves $\Delta z$ — `sgDeflection({...P0, muZ: SILVER.muB/2}) / sgDeflection(P0)` → 0.5.

**`q1-two-spots:b5` [L]** (two spots: quantization)
- **G:** "The plate shows two narrow spots and nothing between them. So $\mu_z$ takes only two values, one up and one down, of equal size. A quantity that comes only in separate values is called [[qc-quantized|quantized]]."
- **F:** "The beam splits into two lines, so $\mu_z$ has two eigenvalues $\pm\mu$: the spin's $z$ component is quantized, $S_z = \pm\hbar/2$, with $\hbar = 1.0546 \times 10^{-34}$ J·s (notes p. 2). The oven feeds each spot half the atoms."
- **Cap:** G "half of the atoms in each spot" · F "$P(\pm) = \tfrac12$ from the oven; spots at $\pm 0.105$ mm (1000 T/m, 3.5 cm, 550 m/s)"
- **Stage:** `lab{ benches:[main('oven', [Z])], ghostBand:true, readouts:['fractions'], shot:'L-PLATE' }`; anchors `spot-plus`, `spot-minus`.
- **Claims:** `q1OvenZ` — `benchTheory({source:'oven', axes:['z'], keep:[]})` → plus 0.5, minus 0.5 · `q1Defl` — `sgDeflection(P0)` → 1.048e−4 m (0.105 mm) · `q1Hbar` — `HBAR` → 1.0546e−34 J·s (engine gap E1 `constants.ts`).

**`q1-two-spots:b6` [L]** (the size: the Bohr magneton)
- **G:** "Each value's size is set by a natural unit, the [[qc-bohr-magneton|Bohr magneton]] $\mu_B = 9.274 \times 10^{-24}$ joules per tesla. It is built from the electron's charge $e$ (not Euler's number), its mass $m_e$, and [[qc-hbar|$\hbar$]]: $\mu_B = e\hbar/2m_e$."
- **F:** "$\mu_z = -g\mu_B S_z/\hbar$ with $g = 2.0023$ and $\mu_B = e\hbar/2m_e = 9.274 \times 10^{-24}$ J/T (SI; the notes' $e\hbar/2m_ec$ is the Gaussian form). For $S_z = \pm\hbar/2$, $\mu_z = \mp 1.00116\,\mu_B$: the moment is antiparallel to the spin (N1)."
- **Cap:** G "$\mu_B = e\hbar/2m_e = 9.274 \times 10^{-24}$ J/T" · F "$g/2 = 1.00116$; which spot is 'up' depends on the sign of the gradient"
- **Stage:** `lab{ benches:[main('oven', [Z])], shot:'L-PLATE' }`; fidelity `lab-moment-opposite`.
- **Claims:** `q1MuB` — `E_CHARGE * HBAR / (2 * M_E)` → 9.2740e−24, equal to `SILVER.muB` to 1e−8 relative (E1) · `q1GHalf` — `G_E / 2` → 1.00116 (E1).

**`q1-two-spots:b7` [B]** (why only the $z$ push survives)
- **G:** "A real magnet cannot make a field that changes only along $z$; its field lines must also bend sideways. The sideways pushes average away, because each atom's magnet spins quickly about the strong field, like a tilted top."
- **F:** "Since $\nabla\cdot\vec B = 0$, $\partial B_x/\partial x + \partial B_y/\partial y = -\partial B_z/\partial z \ne 0$, so $\vec F$ has transverse parts too. The moment precesses about the large $B_z$ at $\omega_L = g\mu_B B/\hbar = 1.76 \times 10^{11}$ rad/s at 1 T, so $\langle\mu_x\rangle, \langle\mu_y\rangle$ average to zero over the flight."
- **Cap:** G "field lines bend sideways too; only the up–down push adds up" · F "about $1.8 \times 10^6$ precession turns during the 63.6 µs flight at 1 T"
- **Stage:** `lab{ benches:[main('oven', [Z])], shot:'L-END' }`; anchor `streamlines`; fidelity `lab-field-qualitative`.
- **beyondLecture:** true. The notes state $F_z = \mu_z\,\partial B_z/\partial z$ "if $\vec B \parallel \hat z$" and stop there.
- **Refs:** mit805 (Zwiebach, MIT 8.05 notes, "Spin one-half" §1: the force and why only $\mu_z\,\partial B_z/\partial z$ survives), as 448 L1 cites it.
- **Claims:** `q1Larmor` — `G_E * SILVER.muB * 1 / HBAR` → 1.761e11 rad/s (E1, E3) · `q1Turns` — `q1Larmor * (0.035/550) / (2π)` → 1.78e6 (E3) · `q1Flight` — `0.035/550` → 6.364e−5 s (E2 `sgTimeInMagnet`).

**`q1-two-spots:b8` [C]** (a stronger gradient)
- **Q G:** "Double the lopsidedness of the field. Do the spots move apart, and do more spots appear?"
- **Q F:** "Double $\partial B_z/\partial z$. What happens to the splitting, and to the number of lines?"
- **Reveal G:** "The spots move twice as far apart, because the push doubles. But there are still exactly two. The field sets how hard each value is pushed, not how many values $\mu_z$ can take."
- **Reveal F:** "$\Delta z$ is linear in $\partial B_z/\partial z$, so the splitting doubles (0.105 → 0.210 mm). The number of lines is the number of eigenvalues of $\mu_z$, a property of the atom, not of the magnet."
- **Reveal cap:** G/F "spot height: 0.105 mm → 0.210 mm; still two spots"
- **Stage:** question `lab{ benches:[main('oven', [Z])], readouts:['fractions'], shot:'L-PLATE' }`; reveal: the same with the proposed `gradientScale: 2` (§9.2 S4); fallback: unchanged picture, caption carries the numbers.
- **Claims:** `q1DeflG2` — `sgDeflection({...P0, dBdz: 2000})` → 2.097e−4 m · `q1DeflRatio` — `q1DeflG2 / q1Defl` → 2.

### Unit `q1-sequences` — A second magnet can erase the first

Opener: film `qc-q1-zxz` (§10.2).

**`q1-sequences:b1` [L]** (naming a state)
- **G:** "Block the beam that feeds the − spot of a $z$ magnet. Every atom that passes has spin up along $z$; call its state $|{+z}\rangle$, read 'ket plus z'. The blocked atoms would be $|{-z}\rangle$. The notes write this filter as $\widehat{SG}_{z+}$."
- **F:** "Selecting one output of SG$_z$ prepares $|{+z}\rangle$, meaning $S_z = +\hbar/2$ (the notes' 'moment up' is the opposite state for silver, N1). The filter is $\widehat{SG}_{z\pm}$ (notes p. 2)."
- **Cap:** G "the kept beam: every atom in $\vert{+z}\rangle$" · F "Rosetta: notes $\widehat{SG}_{z\pm}$ = z magnet keeping ±; notes 'screen' = plate; Bergou $\vert0\rangle = \vert{+z}\rangle$"
- **Stage:** `lab{ benches:[main('oven', [Zp, Z])], readouts:['blocked'], shot:'L-TRACK' }`; anchors `beam-stop`, `chip-1`.
- **Claims:** `q1OvenZZ` — `benchTheory({source:'oven', axes:['z','z'], keep:['+']})` → plus 0.5, minus 0, blocked [0.5].

**`q1-sequences:b2` [L]** (repeating a measurement)
- **G:** "Send the $|{+z}\rangle$ atoms through a second $z$ magnet. All of them land in the + spot again. Measuring the same thing twice gives the same answer."
- **F:** "Repeated measurement reproduces its result: $\widehat{SG}_{z\pm}|{\pm z}\rangle = |{\pm z}\rangle$ and $\widehat{SG}_{z+}|{-z}\rangle = 0$ (notes p. 2). The filter acts as the projector $|{+z}\rangle\langle{+z}|$, with $P^2 = P$ <<l4-projectors|Spin Lab 4.2 A projector asks a yes/no question>>."
- **Cap:** G "second plate: every atom in the + spot" · F "$P^2 = P$, $P|{-z}\rangle = 0$"
- **Stage:** `lab{ benches:[main('oven', [Zp, Z])], readouts:['fractions'], shot:'L-PLATE' }`.
- **Claims:** `q1Repeat` — `benchTheory({source:'+z', axes:['z'], keep:[]}).plus` → 1 · `q1ProjIdem` — `matEq(matmul(projector(KET['+z']), projector(KET['+z'])), projector(KET['+z']))` → true.

**`q1-sequences:b3` [L]** (turn the second magnet 90°)
- **G:** "Now turn the second magnet by 90°, so it sorts along $x$. The $|{+z}\rangle$ atoms split again, half each way. The two new beams are in the states $|{+x}\rangle$ and $|{-x}\rangle$."
- **F:** "SG$_{z+}$ → SG$_{x\pm}$ yields $|{\pm x}\rangle$, each with probability ½ (notes p. 3). Knowing $S_z$ exactly tells nothing about $S_x$."
- **Cap:** G/F "$\vert{+z}\rangle$ into an $x$ magnet: half and half"
- **Stage:** `lab{ benches:[{id:'main', source:'+z', devices:[X], showPrep:true}], readouts:['fractions'], shot:'L-3Q' }`.
- **Claims:** `q1ZthenX` — `benchTheory({source:'+z', axes:['x'], keep:[]})` → plus 0.5, minus 0.5.

**`q1-sequences:b4` [L]** (the two-label idea)
- **G:** "Maybe each atom now carries two labels, one for $z$ and one for $x$; the notes write $|{+z}; {\pm x}\rangle$. If so, a third magnet along $z$ should send every atom to the + spot, since all of them were $+z$."
- **F:** "Hypothesis (notes p. 3): after SG$_{z+}$ → SG$_{x+}$ the atoms carry joint definite values, $|{+z}; {+x}\rangle$. It predicts that a final SG$_z$ yields only $+z$."
- **Cap:** G "the two-label guess: every atom in the + spot at the end" · F "hidden-label model: $P(+z) = 1$"
- **Stage:** `lab{ benches:[main('oven', [Zp, Xp, Z])], model:'hidden-label', shot:'L-WIDE' }`.
- **Claims:** none (the model's prediction is stated in words; it is not the engine's physics).
- **Bridge (G):** "<<l1-quantized|Spin Lab 1.1>> tries the same hidden label."

**`q1-sequences:b5` [L]** (the experiment says no)
- **G:** "The third magnet finds both $z$ results again, half + and half −. Passing the $x$ magnet wiped out the $z$ answer the atoms had. Starting from the furnace, one atom in eight reaches each spot."
- **F:** "Observed: SG$_{z+}$ → SG$_{x+}$ → SG$_{z\pm}$ yields both $|{\pm z}\rangle$ with probability ½ each among the atoms that reach it (notes p. 3); from the oven, ⅛ per spot, with ½ and ¼ blocked. The label hypothesis fails <<l1-sequential|Spin Lab 1.2 A new axis erases the old answer>>."
- **Cap:** G "plate: ⅛ of the furnace's atoms in each spot" · F "blocked ½ and ¼; plate ⅛ and ⅛"
- **Stage:** `lab{ benches:[main('oven', [Zp, Xp, Z])], readouts:['fractions','blocked'], shot:'L-WIDE' }`.
- **Claims:** `q1Zxz` — `benchTheory({source:'oven', axes:['z','x','z'], keep:['+','+']})` → plus 0.125, minus 0.125, blocked [0.5, 0.25] · `q1XZ` — `benchTheory({source:'+x', axes:['z'], keep:[]})` → 0.5, 0.5.

**`q1-sequences:b6` [L]** (what the notes conclude)
- **G:** "The notes sum it up: a second measurement can destroy the state the first one prepared. Each magnet leaves the atom in its own outcome state, so the last magnet decides the state."
- **F:** "An $S_x$ measurement leaves $|{\pm x}\rangle$ whatever the earlier $S_z$ result. Since $[S_z, S_x] = iS_y \ne 0$ (ħ = 1), the two have no common eigenstates <<l7-compatible|Spin Lab 7.4 Compatible measurements share a basis and commute>>; Q3 makes this precise. The notes' 'only a single measurement' is reworded (N9)."
- **Cap:** G "each magnet resets the state it measures" · F "$[S_z, S_x] = iS_y$"
- **Stage:** `lab{ benches:[main('oven', [Zp, Xp, Z])], flow:'single', shot:'L-TRACK' }`; anchor `tracked-atom`.
- **Claims:** `q1Commutator` — `matEq(commutator(SZ, SX), mscale(SY, I))` → true.

**`q1-sequences:b7` [C]** (a middle magnet along $z$)
- **Q G:** "Replace the middle $x$ magnet by another $z$ magnet that keeps the + beam. What does the last $z$ magnet show now?"
- **Q F:** "Replace SG$_{x+}$ by SG$_{z+}$. What does the final SG$_z$ record, and why does the order of axes matter?"
- **Reveal G:** "Every atom lands in the + spot, as in b2. A magnet along the same axis only repeats the answer; only a new axis erases it. The order and the axes both matter."
- **Reveal F:** "SG$_{z+}$ → SG$_{z+}$ → SG$_z$ gives $P(+z) = 1$ at the plate (½ of the oven): repeated compatible measurements agree. Erasure needs a noncommuting observable in between <<l7-order|Spin Lab 7.3 Swapping the order of two measurements>>."
- **Reveal cap:** G/F "z, z, z: every plate atom in the + spot (½ of the furnace's atoms)"
- **Stage:** question `lab{ benches:[main('oven', [Zp, Zp, Z])], shot:'L-WIDE' }`; reveal the same with `readouts:['fractions']`.
- **Claims:** `q1Zzz` — `benchTheory({source:'oven', axes:['z','z','z'], keep:['+','+']})` → plus 0.5, minus 0, blocked [0.5, 0].

### Unit `q1-superposition` — Adding states: the superposition principle

**`q1-superposition:b1` [L]** (kets)
- **G:** "Quantum physics writes a system's state as a [[qc-ket|ket]], such as $|\psi\rangle$ ($\psi$ is the Greek letter psi). The name comes from 'bracket': a bra $\langle\ |$ and a ket $|\ \rangle$ will fit together in unit 5. A ket holds everything that can be predicted about the system."
- **F:** "The state is a vector $|\psi\rangle$ in [[qc-dirac-notation|Dirac notation]] (notes p. 3). The notes postulate that kets form a linear vector space with an inner product, a [[qc-hilbert-space|Hilbert space]]; the inner product defines length and angle."
- **Cap:** G "the kets $\vert{+z}\rangle$ and $\vert{-z}\rangle$ drawn as perpendicular arrows" · F "$\langle{+z}\vert{-z}\rangle = 0$"
- **Stage:** `plane{ others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], rightAngle:true }`.
- **Claims:** `q1ZOrth` — `inner(KET['+z'], KET['-z'])` → 0.

**`q1-superposition:b2` [L]** (the principle)
- **G:** "The [[qc-superposition|superposition principle]]: if a system can be in state $|\psi_1\rangle$ and can be in state $|\psi_2\rangle$, it can also be in $c_1|\psi_1\rangle + c_2|\psi_2\rangle$. Here $c_1$ and $c_2$ are numbers, and they may be complex (F1)."
- **F:** "For admissible states $|\psi_1\rangle, |\psi_2\rangle$ and $c_1, c_2 \in \mathbb C$ with a nonzero sum, $|\Psi\rangle = c_1|\psi_1\rangle + c_2|\psi_2\rangle$ is a state after normalisation (notes p. 3). Iterating, $d_1|\Psi\rangle + d_2|\psi_3\rangle$ is one too."
- **Cap:** G "turning the arrow mixes $\vert{+z}\rangle$ and $\vert{-z}\rangle$ in every proportion" · F "$\vert\psi(\vartheta)\rangle = \cos\vartheta\,\vert{+z}\rangle + \sin\vartheta\,\vert{-z}\rangle$, $0 \le \vartheta \le 90°$"
- **Stage:** `plane{ psi:{planeDeg:sweep(0,90)}, basis:'z', shadows:true }`.
- **Claims:** `q1ShadowsSum` — `prob(KET['+z'], ψ) + prob(KET['-z'], ψ)` → 1 for ψ = `ketFromBloch(θ, 0)`, θ sampled over 0…180°.
- **Bridges (G):** "<<f1-plane|F1.2 Numbers as points and arrows>> for complex numbers; <<l1-vectors|Spin Lab 1.5 States are vectors>>."
- **Note:** ϑ is the plane angle (half the Bloch angle; the plane passport says so). It appears only in this caption.

**`q1-superposition:b3` [B]** (why the third magnet splits: D3)
- **G:** "The $|{+x}\rangle$ atoms of unit 2 are an equal superposition: $|{+x}\rangle = (|{+z}\rangle + |{-z}\rangle)/\sqrt2$. Each outcome's chance is its number's size squared, the [[qc-born-rule|Born rule]]: $(1/\sqrt2)^2 = \tfrac12$. That is the half-and-half split the third magnet showed."
- **F:** "With $|{+x}\rangle = (|{+z}\rangle + |{-z}\rangle)/\sqrt2$ (notes p. 7, derived in Q2) and $P(\pm z) = |\langle{\pm z}|{+x}\rangle|^2 = \tfrac12$, the z–x–z statistics follow; path probabilities multiply along the bench."
- **Cap:** G "each shadow is $1/\sqrt2 = 0.707$; squared, ½" · F "$\vert\langle{\pm z}\vert{+x}\rangle\vert^2 = \tfrac12$"
- **Stage:** `plane{ psi:'+x', basis:'z', shadows:true, ticks:true }`.
- **Derivation:** D3 (§2).
- **Refs:** notes p. 7 (the $x$ states), previewed here with a pointer to Q2.
- **Claims:** `q1PX` — `prob(KET['+z'], KET['+x'])`, `prob(KET['-z'], KET['+x'])` → 0.5, 0.5 · `q1PMinusX` — the same for `KET['-x']` → 0.5, 0.5 · `q1SeqZ` — `sequenceOutcomes({source:'+z', axes:['x','z']})` → each of '++', '+−', '−+', '−−' 0.25.

**`q1-superposition:b4` [L]** (complex coefficients)
- **G:** "The numbers $c_1, c_2$ may be complex. For example $(|{+z}\rangle + i|{-z}\rangle)/\sqrt2$ is also a state: the one pointing along $+y$. Its chances along $z$ are still ½ and ½, because $|i/\sqrt2|^2 = \tfrac12$."
- **F:** "Complex coefficients are essential: $|{+y}\rangle = (|{+z}\rangle + i|{-z}\rangle)/\sqrt2$ has $|c_2|^2 = \tfrac12$ yet differs from $|{+x}\rangle$ by the relative phase $i = e^{i\pi/2}$ <<f1-phase|F1.5 Phases you can and cannot see>>, <<l2-plus-y|Spin Lab 2.4 Real numbers cannot make +y>>."
- **Cap:** G "$\vert{+y}\rangle$: amplitudes 0.707 and 0.707$i$" · F "$\vert{+y}\rangle \ne \vert{+x}\rangle$ as rays"
- **Stage:** `amp{ state:'+y', labels:'spin', dials:true }` · fallback `plane{ psi:'+x', basis:'z', shadows:true }` with fidelity `plane-real-slice` (the caption says $|{+y}\rangle$ cannot be drawn in this real slice).
- **Claims:** `q1PY` — `prob(KET['-z'], KET['+y'])` → 0.5 · `q1YnotX` — `samePhysicalState(KET['+y'], KET['+x'])` → false.

**`q1-superposition:b5` [B]** (Bergou's qubit)
- **G:** "Bergou writes the same idea for a qubit: $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ (Eq. 1.1), with complex amplitudes $\alpha$ and $\beta$. A bit is either 0 or 1; a qubit can be any such combination. This course sets $|0\rangle = |{+z}\rangle$ and $|1\rangle = |{-z}\rangle$."
- **F:** "Bergou §1.1 (Eq. 1.1, p. 1): a qubit is a two-level system in $\alpha|0\rangle + \beta|1\rangle$ with $|\alpha|^2 + |\beta|^2 = 1$. The course locks $|0\rangle \equiv |{+z}\rangle \equiv$ north (ruling C1), tied to `spin.ts` by `qc/bridge448.test.ts`."
- **Cap:** G "at 30° in this plane: $\alpha = 0.866$, $\beta = 0.5$, chances 0.75 and 0.25" · F "$\vert0\rangle \equiv \vert{+z}\rangle$"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'z', shadows:true }` (axis labels $|0\rangle, |1\rangle$ need the §9.2 S3 passport change).
- **Refs:** Bergou §1.1, p. 1.
- **Claims:** `q1Qubit30` — `prob(KET['+z'], ketFromBloch(Math.PI/3, 0))` → 0.75 · `q1ZeroIsUp` — `ket('0')` equals `KET['+z']` (`qc/state.ts`; test only).
- **Note:** α, β are amplitudes here. From unit 4 on, the notes' $|\alpha\rangle, |\beta\rangle$ name whole vectors; §7 flags the switch.

**`q1-superposition:b6` [C]** (superposition or mixture?)
- **Q G:** "Is $(|{+z}\rangle + |{-z}\rangle)/\sqrt2$ just a beam in which half the atoms are $|{+z}\rangle$ and half are $|{-z}\rangle$?"
- **Q F:** "Can the superposition $|{+x}\rangle$ be told apart from a 50/50 mixture of $|{+z}\rangle$ and $|{-z}\rangle$?"
- **Reveal G:** "Yes, they differ. Along $z$ both split half and half. Along $x$ the superposition goes up every time, while the half-and-half beam still splits 50/50, like the furnace's."
- **Reveal F:** "Along $z$ both give ½, ½; along $x$, $|{+x}\rangle$ gives $P(+x) = 1$ while the mixture gives ½. A superposition carries a definite relative phase that a mixture lacks <<l6-mixture|Spin Lab 6.5 Superposition or mixture?>>; Q6 turns this into the density matrix."
- **Reveal cap:** G "top: the superposition, all up; bottom: the half-and-half beam, split" · F "$P(+x)$: 1 vs 0.5"
- **Stage:** question `lab{ benches:[{id:'A', source:'+x', devices:[Z]}, {id:'B', source:'oven', devices:[Z]}], readouts:['fractions'], shot:'L-3Q' }`; reveal the same with both devices `X`. Fidelity `lab-prepared-offstage`.
- **Claims:** `q1SupZ` — `benchTheory({source:'+x', axes:['z'], keep:[]}).plus` → 0.5 and `benchTheory({source:'oven', axes:['z'], keep:[]}).plus` → 0.5 · `q1SupX` — `benchTheory({source:'+x', axes:['x'], keep:[]}).plus` → 1 vs `benchTheory({source:'oven', axes:['x'], keep:[]}).plus` → 0.5.
- **Note:** the oven's unpolarised beam equals any 50/50 mixture of opposite states.

**`q1-superposition:b7` [C]** (a sum that is not a state)
- **Q G:** "Take $c_1 = 1$, $c_2 = -1$ and $|\psi_1\rangle = |\psi_2\rangle = |{+z}\rangle$. Is $c_1|\psi_1\rangle + c_2|\psi_2\rangle$ a state?"
- **Q F:** "Does the superposition principle admit every linear combination, including $|{+z}\rangle - |{+z}\rangle$?"
- **Reveal G:** "No. It is the zero vector, with length 0, and nothing can rescale it to length 1. Other sums need rescaling too: $|{+z}\rangle + |{-z}\rangle$ has length $\sqrt2 = 1.414$, so we divide by $\sqrt2$."
- **Reveal F:** "The zero vector is not a state: states are nonzero vectors up to scale (rays, F1). The principle holds for combinations with nonzero sum, followed by normalisation; $|{+z}\rangle + |{-z}\rangle$ has length $\sqrt2$."
- **Reveal cap:** G/F "$\vert{+z}\rangle - \vert{+z}\rangle = 0$; $\vert{+z}\rangle + \vert{-z}\rangle$ has length 1.414"
- **Stage:** question `plane{ psi:'+z', others:[{ket:{neg:'+z'}, role:'ghost', badge:'−|+z⟩'}] }`; reveal `plane{ psi:'+x', others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], ticks:true }`.
- **Claims:** `q1ZeroSum` — `norm(vadd(KET['+z'], vscale(KET['+z'], -1)))` → 0 · `q1LenSqrt2` — `norm(vadd(KET['+z'], KET['-z']))` → 1.4142.

### Unit `q1-vector-space` — The rules for adding and scaling kets

Stage note: this unit's arrows are vectors, not all of them states; lengths other than 1 appear. New fidelity item
`plane-vectors-not-states` (§9.2 S6) is flagged on every beat.

**`q1-vector-space:b1` [L]** (what a vector space is)
- **G:** "A [[qc-vector-space|vector space]] is a set of objects, called vectors, that can be added and multiplied by numbers. The numbers are called [[qc-scalar|scalars]]; they are real (the set $\mathbb R$) or complex (the set $\mathbb C$). Arrows in a flat plane are the first example."
- **F:** "A vector space $V(F)$ over $F \in \{\mathbb R, \mathbb C\}$ is a set with vector addition and scalar multiplication obeying the axioms below (notes pp. 3–4; Axler 1.19–1.20, p. 12). The notes name vectors $|\alpha\rangle, |\beta\rangle, |\gamma\rangle$."
- **Cap:** G "two arrows and their sum: the notes' Fig. 2" · F "$\vert\alpha\rangle + \vert\beta\rangle$ is the diagonal of the parallelogram"
- **Stage:** `plane{ psi:{planeDeg:15}, others:[{ket:{planeDeg:60}, role:'second'}], sumOf:[{planeDeg:15}, {planeDeg:60}] }` (proposed `sumOf`, §9.2 S1) · fallback `plane{ psi:{planeDeg:15}, others:[{ket:{planeDeg:60}, role:'second'}], image:{matrix:[['1+sqrt(2)/2','-sqrt(2)/2'],['sqrt(2)/2','1+sqrt(2)/2']], label:'|α⟩ + |β⟩'} }` (that matrix is $I + R(45°)$, so it maps the 15° arrow to the sum of the 15° and 60° arrows).
- **Claims:** `q1Fig2Sum` — `vadd(ketFromBloch(Math.PI/6, 0), ketFromBloch(2*Math.PI/3, 0))` → (1.4659, 1.1248), length 1.8478 (= 2 cos 22.5°).
- **Bridges:** G "<<f2-space|F2.2 the vector-space rules, from the ground up>>"; F "<<l2-vector-space|Spin Lab 2.1 Kets add and scale like vectors>>".

**`q1-vector-space:b2` [L]** (the addition rules)
- **G:** "Adding two vectors gives another vector in the same set; that is [[qc-closure|closure]]. The order does not matter, $|\alpha\rangle + |\beta\rangle = |\beta\rangle + |\alpha\rangle$: both paths round the parallelogram reach the same corner. Grouping does not matter either."
- **F:** "Closure, $|\alpha\rangle + |\beta\rangle \in V$; commutativity; associativity, $(|\alpha\rangle + |\beta\rangle) + |\gamma\rangle = |\alpha\rangle + (|\beta\rangle + |\gamma\rangle)$ (notes pp. 3–4). Fig. 2's dashed sides are the translated summands."
- **Cap:** G "$\alpha$ then $\beta$, or $\beta$ then $\alpha$: the same corner" · F "commutativity is the parallelogram"
- **Stage:** as b1.
- **Claims:** `q1Commute` — `vadd(a, b)` equals `vadd(b, a)` for the b1 pair (test only).

**`q1-vector-space:b3` [L]** (zero and opposite)
- **G:** "There is a [[qc-zero-vector|zero vector]], written 0, that changes nothing when added. Every vector $|\alpha\rangle$ has an [[qc-additive-inverse|opposite]] $-|\alpha\rangle$, and the two add to 0. The notes write the zero vector as $|0\rangle$; here it is plain 0, because $|0\rangle$ is a qubit's up state."
- **F:** "Additive identity 0 and inverse $-|\alpha\rangle$ with $|\alpha\rangle + (-|\alpha\rangle) = 0$ (notes p. 4). Their uniqueness, which the notes assume, follows from the axioms (Axler 1.26–1.27, p. 14). Notation: the notes' $|0\rangle$ is written 0, since $|0\rangle \equiv |{+z}\rangle$ (N12)."
- **Cap:** G "an arrow and its opposite add to the zero vector" · F "the zero vector has length 0; the qubit state $\vert0\rangle = \vert{+z}\rangle$ has length 1"
- **Stage:** `plane{ psi:'+x', others:[{ket:{neg:'+x'}, role:'ghost', badge:'−|α⟩'}] }`.
- **Claims:** `q1Inverse` — `norm(vadd(KET['+x'], vscale(KET['+x'], -1)))` → 0 · `q1KetZeroNotZero` — `norm(ket('0'))` → 1.

**`q1-vector-space:b4` [L]** (the scaling rules)
- **G:** "Scaling spreads over sums: $(c_1 + c_2)(|\alpha\rangle + |\beta\rangle) = c_1|\alpha\rangle + c_1|\beta\rangle + c_2|\alpha\rangle + c_2|\beta\rangle$. Scaling twice, by $b$ then $a$, is scaling once by $ab$. One more rule is needed that the notes leave out: $1|\alpha\rangle = |\alpha\rangle$."
- **F:** "The notes' combined law packs Axler's two distributive properties, $a(u + v) = au + av$ and $(a + b)v = av + bv$, with $a(b|\gamma\rangle) = (ab)|\gamma\rangle$. The list omits $1|\alpha\rangle = |\alpha\rangle$ (Axler 1.20): without it, $c|\alpha\rangle = 0$ for every $c$ satisfies every listed rule (N10)."
- **Cap:** G "×2 then ×3 is the same as ×6" · F "the 'lazy' scaling $c\,\vert\alpha\rangle = 0$ passes all listed rules but fails $1\vert\alpha\rangle = \vert\alpha\rangle$"
- **Stage:** `plane{ psi:{planeDeg:30}, image:{matrix:[['6','0'],['0','6']], label:'6|α⟩'} }`.
- **Claims:** `q1ScaleTwice` — `vscale(vscale(a, 2), 3)` equals `vscale(a, 6)` (test only) · `q1Lazy` — the lazy scaling satisfies the notes' two scaling rules on 50 seeded samples, and `1·v = 0 ≠ v` (content check, §8 N10).

**`q1-vector-space:b5` [L]** (examples)
- **G:** "Lists of $n$ real numbers form a vector space, written $V^n(\mathbb R)$; lists of $n$ complex numbers form $V^n(\mathbb C)$. Polynomials of degree at most $n$ also qualify: add them term by term. A qubit's kets live in $V^2(\mathbb C)$."
- **F:** "Examples (notes p. 4): $V^n(\mathbb R) = \mathbb R^n$, $V^n(\mathbb C) = \mathbb C^n$, and the real polynomials of degree at most $n$, $\mathcal P_n(\mathbb R)$ (Axler 2.12, p. 31), a function space identified with $\mathbb R^{n+1}$ through its coefficients."
- **Cap:** G "$(1 + 2x) + (x - x^2) = 1 + 3x - x^2$" · F "coefficients $(1, 2, 0) + (0, 1, -1) = (1, 3, -1)$"
- **Stage:** `plane{ psi:{planeDeg:30}, shadows:true }` (a pair of real numbers is an arrow; polynomials are not drawn).
- **Claims:** `q1PolySum` — `vadd(vec(1,2,0), vec(0,1,-1))` → (1, 3, −1).
- **Note:** here $x$ is the polynomial's variable, not the $x$ axis; the caption keeps them apart by writing the coefficient list (F).

**`q1-vector-space:b6` [C]** (degree exactly 2)
- **Q G:** "Do the polynomials of degree exactly 2, such as $x^2 + 1$, form a vector space?"
- **Q F:** "Is $\{p \in \mathcal P(\mathbb R) : \deg p = 2\}$ a subspace?"
- **Reveal G:** "No. $x^2 + x$ and $-x^2 + 1$ both have degree 2, but their sum $x + 1$ has degree 1. So adding can leave the set, and the zero polynomial is missing too. 'Degree at most 2' fixes both problems."
- **Reveal F:** "No: it is not closed under addition, $(x^2 + x) + (-x^2 + 1) = x + 1$, and it lacks 0. Hence the notes' 'nth order polynomials' must mean degree at most $n$ (N11; Axler 2.12)."
- **Reveal cap:** G/F "coefficients $(0, 1, 1) + (1, 0, -1) = (1, 1, 0)$: the $x^2$ term cancels"
- **Stage:** question and reveal `plane{ psi:{planeDeg:30} }` (no picture of polynomials; the caption carries it).
- **Claims:** `q1Degree` — `vadd(vec(0,1,1), vec(1,0,-1))` → (1, 1, 0).

**`q1-vector-space:b7` [C]** (are the states a vector space?)
- **Q G:** "States have length 1. Do the states by themselves form a vector space?"
- **Q F:** "Is the set of unit vectors, the states, a subspace of $V^2(\mathbb C)$?"
- **Reveal G:** "No. $|{+z}\rangle + |{-z}\rangle$ has length 1.414, and 0 times a state is the zero vector, of length 0. The vector space holds all the vectors; the states are its length-1 members."
- **Reveal F:** "No: it is closed under neither addition ($|{+z}\rangle + |{-z}\rangle$ has length $\sqrt2$) nor scaling, and misses 0. The superposition principle works in the space $V$ and then normalises."
- **Reveal cap:** G/F "sum of two states: length 1.414, not 1"
- **Stage:** question `plane{ psi:'+x', others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}] }`; reveal adds `sumOf:['+z','-z']` (fallback: the question picture; the caption carries the length).
- **Claims:** reuses `q1LenSqrt2` → 1.4142.

### Unit `q1-inner-product` — Lengths and angles for complex vectors

**`q1-inner-product:b1` [L]** (bras)
- **G:** "Each ket $|\psi\rangle$ has a partner, the [[qc-bra|bra]] $\langle\psi|$. Written as lists, the ket is a column and its bra is a row of the conjugated numbers (F1). A bra and a ket side by side make one number, $\langle\chi|\psi\rangle$, where $|\chi\rangle$ (chi) is another state."
- **F:** "A [[qc-dual-space|dual]] correspondence $|\psi\rangle \leftrightarrow \langle\psi|$ (notes p. 4); it is antilinear, $c|\psi\rangle \leftrightarrow c^*\langle\psi|$. In $\mathbb C^n$, $\langle\beta| = \beta^\dagger$, the conjugate transpose, so $\langle\beta|\alpha\rangle = \beta^\dagger\alpha$."
- **Cap:** G "ket: a column; bra: a row of the mirrored numbers" · F "$\langle{+y}\vert = (1, -i)/\sqrt2$"
- **Stage:** `plane{ psi:'+x', others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}] }`.
- **Claims:** `q1BraY` — `inner(KET['+y'], KET['+y'])` → 1 (the conjugated row).
- **Bridge (G):** "<<l2-inner-product|Spin Lab 2.2 Overlap: the inner product gives coordinates>>."

**`q1-inner-product:b2` [L]** (the rules)
- **G:** "An [[qc-inner-product|inner product]] must obey four rules. $\langle\beta|\beta\rangle$ is real and never negative, and it is 0 only for the zero vector. Swapping sides gives the conjugate: $\langle\alpha|\beta\rangle = \langle\beta|\alpha\rangle^*$. And it is linear in the ket."
- **F:** "Axioms (notes p. 4): positivity, definiteness, [[qc-conjugate-symmetry|conjugate symmetry]], and linearity in the second slot, $\langle\alpha|c_1\beta + c_2\gamma\rangle = c_1\langle\alpha|\beta\rangle + c_2\langle\alpha|\gamma\rangle$. The notes' fifth rule follows (D4), and the product is [[qc-sesquilinear|sesquilinear]], not 'bilinear' (N2)."
- **Cap:** G "four rules for measuring overlap" · F "sesquilinear: linear in the ket, conjugate-linear in the bra"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'z', shadows:true }`.
- **Claims:** none beyond b3–b4 (rules only).

**`q1-inner-product:b3` [L]** (where the bra's conjugate comes from; D4)
- **G:** "Why is the bra side conjugated? Swap the two sides, pull the number out of the ket side, then swap back. Each swap adds a star, and the number keeps one: $\langle c\beta|\alpha\rangle = c^*\langle\beta|\alpha\rangle$."
- **F:** "$\langle c\beta|\alpha\rangle = \langle\alpha|c\beta\rangle^* = (c\langle\alpha|\beta\rangle)^* = c^*\langle\alpha|\beta\rangle^* = c^*\langle\beta|\alpha\rangle$, by conjugate symmetry twice and $(zw)^* = z^*w^*$ <<f1-plane|F1.2 Numbers as points and arrows>>."
- **Cap:** G/F "$c = 2 + i$: $\langle c\beta\vert\alpha\rangle = (2 - i)\langle\beta\vert\alpha\rangle = 1.414 - 0.707i$"
- **Stage:** `plane{ psi:'+z', others:[{ket:'-z', role:'basis'}] }` (the complex example is in the caption).
- **Derivation:** D4 (§2).
- **Claims:** `q1ConjLin` — `inner(vscale(KET['+y'], c(2,1)), KET['+z'])` → (1.4142, −0.7071), equal to `mul(conj(c(2,1)), inner(KET['+y'], KET['+z']))`.

**`q1-inner-product:b4` [L]** (examples and the norm)
- **G:** "For lists of real numbers the inner product is the dot product: multiply matching entries and add. For complex lists, conjugate the bra's entries first: with entries $a_1, a_2$ of $\alpha$ and $b_1, b_2$ of $\beta$, $\langle\beta|\alpha\rangle = b_1^*a_1 + b_2^*a_2$. The length, or [[qc-norm|norm]], is $|\alpha| = \sqrt{\langle\alpha|\alpha\rangle}$; for $(3, 4i)$ it is 5."
- **F:** "In $V^n(\mathbb R)$, $\langle\beta|\alpha\rangle = \beta^T\alpha = \sum_i b_ia_i$; in $V^n(\mathbb C)$, $\langle\beta|\alpha\rangle = \beta^\dagger\alpha = \sum_i b_i^*a_i$, with $a_i, b_i$ the components (notes p. 5). Without the conjugate, $(3, 4i)$ would give $9 - 16 = -7$."
- **Cap:** G "$(3, 4i)$: $9 + 16 = 25$, length 5; without the conjugate, $-7$" · F "`inner` → 25; `bilinear` → −7"
- **Stage:** `plane{ psi:{planeDeg:53.13}, others:[{ket:'+z', role:'basis'}, {ket:'-z', role:'basis'}], shadows:true }` (the real vector (0.6, 0.8), i.e. (3, 4)/5; the complex example stays in the caption; fidelity `plane-real-slice`).
- **Claims:** `q1Dot` — `inner(vec(1,2), vec(3,-1))` → 1 · `q1Norm34i` — `inner(vec(3, c(0,4)), vec(3, c(0,4)))` → 25, `norm` → 5 · `q1Bilinear34i` — `bilinear(vec(3, c(0,4)), vec(3, c(0,4)))` → −7.
- **Bridge (G):** "<<f2-dot|F2.4 why the conjugate>> builds this from the law of cosines."

**`q1-inner-product:b5` [L]** (weighted inner products)
- **G:** "The dot product is not the only choice. Put a square table of numbers $M$ between the row and the column: $\langle\beta|\alpha\rangle_M = \beta^\dagger M\alpha$. It is a fair inner product only if $\langle\alpha|\alpha\rangle_M > 0$ for every nonzero $\alpha$."
- **F:** "$\langle\beta|\alpha\rangle_M = \beta^\dagger M\alpha$ is an inner product iff $M$ is Hermitian, $M_{ij} = M_{ji}^*$, with positive eigenvalues (notes p. 5; Axler 6.3(b), p. 184, for diagonal $M$). Example: $M = \begin{pmatrix}2 & i\\ -i & 2\end{pmatrix} = 2I - \sigma_y$ has eigenvalues 1 and 3."
- **Cap:** G "$\alpha = (1, -i)$: $\langle\alpha\vert\alpha\rangle_M = 6$" · F "eigenvalues of $M$: 1, 3; $\langle\alpha\vert\alpha\rangle_M$ = 2, 2, 6 for $(1, 0), (1, i), (1, -i)$"
- **Stage:** `ops{ op:{matrix:[['2','i'],['-i','2']]}, eigen:true, labels:'plain' }` (arrow = half the eigenvalue gap = 1, gauge = midpoint = 2).
- **Claims:** `q1MHerm` — `isHermitian(M)` → true · `q1MEig` — `eigh(M).values` → [1, 3] · `q1MNorms` — `weightedInner(M, v, v)` → 2, 2, 6 for v = (1, 0), (1, i), (1, −i).
- **Note:** $\sigma_y$ appears only in the F text as a name for the matrix; the Ground track never uses it (§7).

**`q1-inner-product:b6` [B]** (Axler's convention)
- **G:** "Axler's textbook writes $\langle u, v\rangle$ and makes it linear in the first slot instead. So his $\langle u, v\rangle$ is our $\langle v|u\rangle$: same size, opposite phase. Physics conjugates the bra."
- **F:** "Rosetta C9: $\langle u, v\rangle_{\text{Axler}} = \langle v|u\rangle$ and $T^*_{\text{Axler}} = T^\dagger$ (Axler 6.2, p. 183, and its margin note, p. 184)."
- **Cap:** G/F "physics: $\langle i{+z}\vert{+z}\rangle = -i$; Axler's first-slot rule: $+i$"
- **Stage:** `plane{ psi:'+z', others:[{ket:'-z', role:'basis'}] }`.
- **Refs:** Axler §6A, 6.2 p. 183 and margin p. 184.
- **Claims:** `q1Axler` — `inner(vscale(KET['+z'], I), KET['+z'])` → (0, −1); Axler's value `mul(I, inner(KET['+z'], KET['+z']))` → (0, 1).

**`q1-inner-product:b7` [L]** (the shadow picture, Fig. 3)
- **G:** "For real arrows the inner product has a picture. Drop a perpendicular from the tip of $|\beta\rangle$ onto the line of $|\alpha\rangle$. The shadow has length $\langle\alpha|\beta\rangle/|\alpha| = |\beta|\cos\theta$, where $\theta$ is the angle between the arrows. It is zero exactly when they are at right angles."
- **F:** "For real vectors $\langle\alpha|\beta\rangle = |\alpha||\beta|\cos\theta$, so $\langle\alpha|\beta\rangle/|\alpha|$ is the signed length of the orthogonal [[qc-projection|projection]] of $\beta$ on $\alpha$ (notes p. 5, Fig. 3). For complex vectors it holds only with $\operatorname{Re}\langle\alpha|\beta\rangle$ (N8)."
- **Cap:** G "shadow of $\vert{+x}\rangle$ on $\vert{+z}\rangle$: $\cos 45° = 0.707$" · F "$\langle{+z}\vert{+x}\rangle = 0.7071$; angle between the arrows 45°"
- **Stage:** `plane{ psi:'+x', basis:'z', shadows:true }` (the plane's `arc` would label θ/2; §9.2 S2 proposes `arcLabel`).
- **Claims:** `q1Shadow` — `inner(KET['+z'], KET['+x'])` → 0.7071 · `q1Angle` — `angleBetween(KET['+z'], KET['+x'])` → 45° · `q1Fig3` — for α = (2, 0), β = (1, 1): `inner(vec(2,0), vec(1,1)).re / norm(vec(2,0))` → 1 = `norm(vec(1,1)) * cos 45°`.
- **Bridge (G):** "<<f2-dot|F2.4>> proves the picture with the law of cosines."

**`q1-inner-product:b8` [C]** (a table that fails)
- **Q G:** "Try $M = \begin{pmatrix}1 & 0\\ 0 & -1\end{pmatrix}$. Is $\langle\beta|\alpha\rangle_M = \beta^\dagger M\alpha$ an inner product?"
- **Q F:** "With $\sigma_z = \operatorname{diag}(1, -1)$, is $\beta^\dagger\sigma_z\alpha$ an inner product on $\mathbb C^2$?"
- **Reveal G:** "No. For $\alpha = (1, 1)$, $\langle\alpha|\alpha\rangle_M = 1 - 1 = 0$, although $\alpha$ is not the zero vector. For $(0, 1)$ it is even $-1$, a negative length squared."
- **Reveal F:** "No: $\sigma_z$ is Hermitian but has eigenvalue $-1$, so positivity ($-1$ for $(0, 1)$) and definiteness ($\langle\alpha|\alpha\rangle_M = 0$ for $\alpha = (1, 1)$) both fail. Positive eigenvalues are exactly what the notes' condition asks."
- **Reveal cap:** G/F "$(1, 1)$: 0; $(0, 1)$: −1"
- **Stage:** question `ops{ op:{named:'sz'}, eigen:true, labels:'plain' }`; reveal unchanged.
- **Claims:** `q1BadM` — `weightedInner(SIGMA_Z, vec(1,1), vec(1,1))` → 0 and `weightedInner(SIGMA_Z, vec(0,1), vec(0,1))` → −1.

**Beat count:** 8 + 7 + 7 + 7 + 8 = **37 beats**, 7 of them clues with reveals. Phase mix: 27 [L] · 3 [B] · 7 [C].

## 2. Derivations

**D1 · `q1-two-spots:b3` · result $F_z = \mu_z\,\partial B_z/\partial z$**
- Ground:
  1. `B_z(z) = B_0 + Gz` — The field grows by $G$ tesla for each metre up; $B_0$ is its value at height 0.
  2. `E(z) = -\mu_z B_z(z) = -\mu_z B_0 - \mu_z G z` — The energy at height $z$, from b2.
  3. `\text{slope of } E = -\mu_z G` — Each metre up changes the energy by the number in front of $z$.
  4. `F_z = -(\text{slope of } E)` — A push always points downhill in energy, as a ball rolls downhill ($E = mgh$ gives $F = -mg$).
  5. `F_z = \mu_z G` — Two minus signs cancel.
  6. `\mu_z > 0:\ \text{toward stronger field};\ \ \mu_z < 0:\ \text{toward weaker}` — The sign of $\mu_z$ decides the direction of the push.
  7. `9.274 \times 10^{-24}\,\text{J/T} \times 1000\,\text{T/m} = 9.27 \times 10^{-21}\,\text{N}` — Numbers for $\mu_z = \mu_B$ and $G = 1000$ T/m (`q1Force`).
- Formal:
  1. `\vec F = -\nabla E = \nabla(\vec\mu\cdot\vec B)` — Conservative force from $E = -\vec\mu\cdot\vec B$, with $\vec\mu$ fixed.
  2. `F_z = \mu_z\,\partial B_z/\partial z` — For $\vec B \approx B_z(z)\hat z$; transverse terms average out (b7).

**D2 · `q1-two-spots:b4` · result $\Delta z = \frac{\mu_z G}{2m}\left(\frac Lv\right)^2 \propto \mu_z$, so two values make two spots**
- Ground:
  1. `a = F_z/m = \mu_z G/m` — Newton's second law; $m$ is the atom's mass.
  2. `t = L/v` — Time inside a magnet of length $L$ at speed $v$.
  3. `\Delta z = \tfrac12 a t^2` — A steady push from rest, sideways to the flight.
  4. `\Delta z = \tfrac12\,\frac{\mu_z G}{m}\left(\frac Lv\right)^2` — Substitute steps 1 and 2.
  5. `\Delta z \propto \mu_z` — Every other quantity is the same for all atoms.
  6. `\mu_z \in [-\mu, \mu] \Rightarrow \Delta z \in [-\Delta, \Delta]` — A continuous spread of $\mu_z$ fills a band.
  7. `\mu_z = \pm\mu_B \Rightarrow \Delta z = \pm\Delta` — Two values make exactly two spots.
  8. `\Delta = 1.05 \times 10^{-4}\,\text{m} = 0.105\ \text{mm}` — With $G = 1000$ T/m, $L = 3.5$ cm, $v = 550$ m/s (`q1Defl`).
- Formal:
  1. `\Delta z = \frac{\mu_z}{2m}\frac{\partial B_z}{\partial z}\left(\frac Lv\right)^2\left(1 + \frac{2D}{L}\right)` — Parabola in the magnet, straight drift $D$ after it (`sgDeflection`).
  2. `\operatorname{spec}\mu_z = \{\pm\mu\} \Rightarrow \text{two lines}` — The plate maps $\mu_z$ linearly, so the lines count the eigenvalues.

**D3 · `q1-superposition:b3` · result $P(\pm z \mid {+x}) = \tfrac12$; from the oven, ⅛ per spot**
- Ground:
  1. `|{+x}\rangle = \tfrac{1}{\sqrt2}|{+z}\rangle + \tfrac{1}{\sqrt2}|{-z}\rangle` — The $x$-up state as an equal mix of $z$-up and $z$-down (notes p. 7).
  2. `P(\text{outcome}) = |\text{its number}|^2` — The Born rule: a chance is a size squared <<l1-vectors|Spin Lab 1.5>>.
  3. `P(+z) = (1/\sqrt2)^2 = \tfrac12` — The number in front of $|{+z}\rangle$.
  4. `P(-z) = (1/\sqrt2)^2 = \tfrac12` — The number in front of $|{-z}\rangle$.
  5. `\tfrac12 \times \tfrac12 \times \tfrac12 = \tfrac18` — From the furnace: half pass the first magnet, half of those pass the $x$ magnet, half of those land in each spot.
- Formal:
  1. `P(\pm z \mid {+x}) = |\langle{\pm z}|{+x}\rangle|^2 = \tfrac12` — Born rule with the $x$ states of notes p. 7.
  2. `P(+, +, \pm) = \tfrac12\cdot\tfrac12\cdot\tfrac12` — Probabilities multiply along a path of state updates (`sequenceOutcomes`).

**D4 · `q1-inner-product:b3` · result $\langle c_1\beta + c_2\gamma|\alpha\rangle = c_1^*\langle\beta|\alpha\rangle + c_2^*\langle\gamma|\alpha\rangle$**
- Ground:
  1. `\langle c\beta|\alpha\rangle = \langle\alpha|c\beta\rangle^*` — The swap rule: exchanging sides conjugates.
  2. `\langle\alpha|c\beta\rangle = c\langle\alpha|\beta\rangle` — Linear in the ket: numbers come out of the ket side unchanged.
  3. `\langle c\beta|\alpha\rangle = (c\langle\alpha|\beta\rangle)^*` — Put step 2 into step 1.
  4. `(zw)^* = z^*w^*` — Mirroring a product mirrors each factor (F1, `f1-plane:b4`).
  5. `\langle c\beta|\alpha\rangle = c^*\langle\alpha|\beta\rangle^*` — Apply step 4 to step 3.
  6. `\langle\alpha|\beta\rangle^* = \langle\beta|\alpha\rangle` — The swap rule again.
  7. `\langle c\beta|\alpha\rangle = c^*\langle\beta|\alpha\rangle` — Put step 6 into step 5.
  8. `\langle c_1\beta + c_2\gamma|\alpha\rangle = c_1^*\langle\beta|\alpha\rangle + c_2^*\langle\gamma|\alpha\rangle` — The same steps with a sum, using linearity for sums.
- Formal:
  1. `\langle c_1\beta + c_2\gamma|\alpha\rangle = \langle\alpha|c_1\beta + c_2\gamma\rangle^* = (c_1\langle\alpha|\beta\rangle + c_2\langle\alpha|\gamma\rangle)^*` — Conjugate symmetry, then linearity in the second slot.
  2. `= c_1^*\langle\beta|\alpha\rangle + c_2^*\langle\gamma|\alpha\rangle` — $(z + w)^* = z^* + w^*$, $(zw)^* = z^*w^*$, conjugate symmetry.
- Check: `q1ConjLin` (c = 2 + i, β = $|{+y}\rangle$, α = $|{+z}\rangle$) → $1.414 - 0.707i$ both ways.

## 3. Try-it widget per unit

| Unit | Widget spec | Why this one |
|---|---|---|
| `q1-two-spots` | `{kind:'sg-lab', props:{source:'oven', axes:['z'], editable:false, predict:true, seed:709}}` | Predict the plate first (smear or spots), then fire. |
| `q1-sequences` | `{kind:'sg-lab', props:{source:'oven', axes:['z','x','z'], keep:['+','+'], editable:true, maxDevices:3, predict:true, seed:709}}` | The notes' z–x–z, then free play. HW1 P2 guard: the preset has no tilt, and the Try-this list never asks for one (§12 Q1). |
| `q1-superposition` | `{kind:'amplitude-bars', props:{state:'+x', basis:'z', editable:true}}` | Switch the basis to $x$: the bars jump from ½, ½ to 1, 0 (clue b6). |
| `q1-vector-space` | `{kind:'phase-dial', props:{theta:0, rotations:false}}` | Scaling a ket by a number of size 1 is scalar multiplication; the dial shows it leaves the state (448 used it for `l2-vector-space`). |
| `q1-inner-product` | `{kind:'projector', props:{state:45, basis:0, editableBasis:true}}` | The notes' Fig. 3: the shadow of one arrow on another; real vectors only, as N8 says. |

**Try this:**
- `q1-two-spots`: (1) Predict: a smear or two spots? (2) Fire 200 atoms and compare the halves.
- `q1-sequences`: (1) Run z, x, z: what reaches the plate? (2) Make the middle magnet $z$. (3) Keep the − beam at the $x$ magnet instead.
- `q1-superposition`: (1) Read the $z$ bars of $|{+x}\rangle$. (2) Switch to the $x$ basis. (3) Pick $|{+y}\rangle$: why are its $z$ and $x$ bars ½, ½?
- `q1-vector-space`: (1) Multiply both amplitudes by $e^{i\varphi}$: the point stays. (2) Change one only: it moves.
- `q1-inner-product`: (1) State at 45°, basis at 0: read the shadows. (2) Turn the basis until one shadow vanishes. (3) Why do the squared shadows add to 1?

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** no Q1 item is assigned; none
reproduces HW1 P2 (guard above). F walkthroughs are given where they differ.

### `q1-two-spots`
1. **warm-up · numeric · `q1-t-spots`** — "An oven beam passes one $z$ magnet. How many spots form on the plate?"
   - Answer: **2** = `Object.keys(sequenceOutcomes({source:'oven', axes:['z']})).length`.
   - Hints: (1) Classically you would expect a smear. (2) What did Stern and Gerlach see? (3) $\mu_z$ takes two values.
   - Walkthrough: two spots, one per value of $\mu_z$ (b5).
2. **core · numeric · `q1-t-force`** — "A silver atom with $\mu_z = \mu_B = 9.274 \times 10^{-24}$ J/T sits in a gradient of 1000 T/m. What is the force, in units of $10^{-21}$ N?"
   - Answer: **9.274** = `SILVER.muB * 1000 / 1e-21`.
   - Hints: (1) Force is the downhill slope of energy. (2) $F_z = \mu_z G$. (3) Multiply and shift the power of ten.
   - Walkthrough: $9.274 \times 10^{-24} \times 10^3 = 9.274 \times 10^{-21}$ N.
3. **core · numeric · `q1-t-deflection`** — "Same atom, magnet 3.5 cm long, speed 550 m/s. How far has it moved sideways at the magnet's end, in mm?"
   - Answer: **0.1048** = `sgDeflection(P0) * 1000`.
   - Hints: (1) Find the acceleration $a = F/m$ with $m = 1.791 \times 10^{-25}$ kg. (2) Time in the magnet $t = L/v$. (3) $\Delta z = \tfrac12 at^2$.
   - Walkthrough: $a = 51\,776$ m/s², $t = 63.6$ µs, $\Delta z = \tfrac12 \times 51\,776 \times (6.364 \times 10^{-5})^2 = 1.048 \times 10^{-4}$ m.
4. **core · choice · `q1-t-gradient`** — "Double the field gradient. What happens on the plate?"
   - Options: **the spots move twice as far apart** ✓ · four spots appear · the spots merge into a band · nothing changes.
   - Check: `sgDeflection({...P0, dBdz: 2000}) / sgDeflection(P0)` → 2.
   - Hints: (1) Which quantity sets the push? (2) $F_z = \mu_z G$. (3) Does $G$ change the values $\mu_z$ can take?
   - Walkthrough: the push doubles, so $\Delta z$ doubles; the number of spots is set by the atom (b8).
5. **stretch · choice · `q1-t-sign`** — "The gradient points up ($\partial B_z/\partial z > 0$). Which spot do atoms with $S_z = +\hbar/2$ reach?"
   - Options: the upper spot · **the lower spot, because silver's moment points opposite to its spin** ✓ · both · neither.
   - Check: `sgDeflection({...P0, muZ: -SILVER.muB})` → −1.048e−4 (a downward deflection).
   - Hints: (1) The push depends on $\mu_z$, not on $S_z$ directly. (2) $\mu_z = -g\mu_B S_z/\hbar$. (3) So $S_z > 0$ gives $\mu_z < 0$.
   - Walkthrough: $\mu_z = -1.001\,\mu_B$, so $F_z < 0$: the lower spot. Which spot is drawn as "+" is a labelling choice (`lab-moment-opposite`). **F:** N1.

### `q1-sequences`
1. **warm-up · numeric · `q1-s-repeat`** — "$|{+z}\rangle$ atoms meet a second $z$ magnet. What fraction lands in the + spot?"
   - Answer: **1** = `benchTheory({source:'+z', axes:['z'], keep:[]}).plus`.
   - Hints: (1) The atoms were just sorted along $z$. (2) Measuring the same thing again repeats the answer. (3) None can go down.
   - Walkthrough: all of them (b2). **F:** $P|{+z}\rangle = |{+z}\rangle$ for $P = |{+z}\rangle\langle{+z}|$.
2. **core · numeric · `q1-s-zxz`** — "Furnace → $z$ magnet (keep +) → $x$ magnet (keep +) → $z$ magnet. What fraction of the furnace's atoms lands in the + spot?"
   - Answer: **0.125** = `benchTheory({source:'oven', axes:['z','x','z'], keep:['+','+']}).plus`.
   - Hints: (1) Each magnet along a new axis passes half. (2) Three halvings. (3) ½ × ½ × ½.
   - Walkthrough: ⅛; the other spot also gets ⅛, and ½ and ¼ are blocked (b5).
3. **core · choice · `q1-s-middle-z`** — "Replace the middle $x$ magnet by a $z$ magnet (keep +). What does the last magnet show?"
   - Options: **every atom in the + spot** ✓ · half in each spot · every atom in the − spot · no atom arrives.
   - Check: `benchTheory({source:'oven', axes:['z','z','z'], keep:['+','+']})` → plus 0.5, minus 0.
   - Hints: (1) No axis changes. (2) Repeated measurements agree. (3) Compare with b2.
   - Walkthrough: all plate atoms up; half the furnace's atoms reach the plate (clue b7).
4. **stretch · numeric · `q1-s-four`** — "Furnace → $z$(+) → $x$(+) → $z$(+) → $x$. What fraction of the furnace's atoms lands in the + spot?"
   - Answer: **0.0625** = `benchTheory({source:'oven', axes:['z','x','z','x'], keep:['+','+','+']}).plus`.
   - Hints: (1) Count the changes of axis. (2) Every magnet halves the beam. (3) Four halvings.
   - Walkthrough: $(\tfrac12)^4 = \tfrac1{16}$: each new axis erases the previous answer, so every magnet is a fresh coin toss.
5. **stretch · order · `q1-s-refute`** — "Put the argument against hidden labels in order."
   - Steps: "Keep the + beam of a $z$ magnet." · "Keep the + beam of an $x$ magnet." · "If the $z$ label survived, a last $z$ magnet would send every atom to the + spot." · "The plate shows both spots, half each." · "So the $x$ magnet erased the $z$ label."
   - Hints: (1) Start with the preparation. (2) State the prediction before the result. (3) The conclusion comes last.
   - Walkthrough: notes p. 3; b4–b5.

### `q1-superposition`
1. **warm-up · numeric · `q1-p-half`** — "What is $P(+z)$ for $(|{+z}\rangle + |{-z}\rangle)/\sqrt2$?"
   - Answer: **0.5** = `prob(KET['+z'], KET['+x'])`.
   - Hints: (1) Find the number in front of $|{+z}\rangle$. (2) It is $1/\sqrt2$. (3) Square its size.
   - Walkthrough: $(1/\sqrt2)^2 = \tfrac12$.
2. **core · numeric · `q1-p-34i`** — "$|\psi\rangle = \tfrac35|{+z}\rangle + \tfrac45 i|{-z}\rangle$. What is $P(-z)$?"
   - Answer: **0.64** = `prob(KET['-z'], vec(0.6, c(0,0.8)))`.
   - Hints: (1) The number in front of $|{-z}\rangle$ is $\tfrac45 i$. (2) Size squared means number times its conjugate. (3) $(-\tfrac45 i)(\tfrac45 i)$.
   - Walkthrough: $\tfrac{16}{25} = 0.64$; with $\tfrac{9}{25} = 0.36$ the two add to 1. Trap: $(\tfrac45 i)^2 = -0.64$ is not a probability.
3. **core · numeric · `q1-p-normalize`** — "Rescale $|{+z}\rangle + 2|{-z}\rangle$ to length 1. What is $P(+z)$?"
   - Answer: **0.2** = `prob(KET['+z'], normalize(vec(1, 2)))`.
   - Hints: (1) The length is $\sqrt{1 + 4}$. (2) Divide both numbers by $\sqrt5$. (3) Square the first.
   - Walkthrough: $(1/\sqrt5)^2 = \tfrac15$.
4. **core · choice · `q1-p-mixture`** — "A beam of $|{+x}\rangle$ atoms and a 50/50 mixture of $|{+z}\rangle$ and $|{-z}\rangle$ atoms both meet an $x$ magnet. What happens?"
   - Options: both split 50/50 · **the $\vert{+x}\rangle$ beam goes all up, the mixture splits 50/50** ✓ · both go all up · the mixture goes all up.
   - Check: `q1SupX` → 1 vs 0.5.
   - Hints: (1) Along $z$ they look the same. (2) What does an $x$ magnet do to $|{+x}\rangle$? (3) Each atom of the mixture is a $z$ state.
   - Walkthrough: clue b6. **F:** coherence (a definite relative phase) is what the mixture lacks.
5. **stretch · numeric · `q1-p-difference`** — "Rescale $|{+z}\rangle - |{+x}\rangle$ to length 1. What is $P(+z)$?"
   - Answer: **0.1464** = `prob(KET['+z'], normalize(vadd(KET['+z'], vscale(KET['+x'], -1))))`.
   - Hints: (1) Write both as columns. (2) The difference is $(1 - 0.707, -0.707)$. (3) Its squared length is 0.586.
   - Walkthrough: $0.0858/0.5858 = 0.146 = \sin^2 22.5°$.

### `q1-vector-space`
1. **warm-up · choice · `q1-v-zero`** — "In $V^2(\mathbb C)$, which of these is the zero vector?"
   - Options: $|0\rangle$, the qubit state · **the column $(0, 0)$** ✓ · $(1, 1)$ · $(0, 1)$.
   - Check: `norm(vec(0,0))` → 0; `norm(ket('0'))` → 1.
   - Hints: (1) The zero vector changes nothing when added. (2) Its length is 0. (3) A state has length 1.
   - Walkthrough: $(0, 0)$. The notes write it $|0\rangle$, which here means $|{+z}\rangle$ (N12).
2. **core · numeric · `q1-v-poly`** — "In $(1 + 2x) + 3(x - x^2)$, what is the coefficient of $x$?"
   - Answer: **5** = `vadd(vec(1,2,0), vscale(vec(0,1,-1), 3))[1].re`.
   - Hints: (1) Scale first, then add. (2) $3(x - x^2) = 3x - 3x^2$. (3) Add the $x$ terms.
   - Walkthrough: $2 + 3 = 5$; the sum is $1 + 5x - 3x^2$.
3. **core · choice · `q1-v-degree`** — "Why are the polynomials of degree exactly 2 not a vector space?"
   - Options: **$x^2 + x$ plus $-x^2 + 1$ gives $x + 1$, of degree 1** ✓ · they cannot be scaled · they have no opposites · their sums have degree 4.
   - Check: `q1Degree` → (1, 1, 0).
   - Hints: (1) Test closure. (2) Can a sum lose its $x^2$ term? (3) Try two leading terms that cancel.
   - Walkthrough: clue b6; also the zero polynomial is missing.
4. **core · choice · `q1-v-real-scalars`** — "Pairs of real numbers, with complex scalars allowed: a vector space?"
   - Options: yes · **no: $i\cdot(1, 0) = (i, 0)$ is not a pair of real numbers** ✓ · no: sums can be complex · yes, if the pairs have length 1.
   - Check: `vscale(vec(1,0), I)` → ((0, 1), 0).
   - Hints: (1) Closure must hold for every allowed scalar. (2) Try the scalar $i$. (3) Is the result still real?
   - Walkthrough: the scalars are part of the definition: $V(\mathbb R)$ and $V(\mathbb C)$ differ.
5. **stretch · choice · `q1-v-lazy`** — "Define scaling as $c|\alpha\rangle = 0$ for every $c$. Which rule fails?"
   - Options: $(c_1 + c_2)(|\alpha\rangle + |\beta\rangle) = \ldots$ · $a(b|\gamma\rangle) = (ab)|\gamma\rangle$ · **$1|\alpha\rangle = |\alpha\rangle$** ✓ · none; it is a vector space.
   - Check: `q1Lazy`.
   - Hints: (1) Both sides of the distributive law are 0. (2) So is each side of the associative law. (3) What should scaling by 1 do?
   - Walkthrough: $1|\alpha\rangle = 0 \ne |\alpha\rangle$ for $|\alpha\rangle \ne 0$. This is why Axler lists the multiplicative identity (N10).

### `q1-inner-product`
1. **warm-up · numeric · `q1-i-dot`** — "$\beta = (1, 2)$ and $\alpha = (3, -1)$. What is $\langle\beta|\alpha\rangle$?"
   - Answer: **1** = `inner(vec(1,2), vec(3,-1)).re`.
   - Hints: (1) Multiply matching entries. (2) Real entries need no conjugating. (3) $3 - 2$.
   - Walkthrough: $1 \cdot 3 + 2 \cdot (-1) = 1$.
2. **core · numeric · `q1-i-norm`** — "What is the length of $(3, 4i)$?"
   - Answer: **5** = `norm(vec(3, c(0,4)))`.
   - Hints: (1) Conjugate the bra's entries. (2) $3 \cdot 3 + (-4i)(4i)$. (3) $9 + 16$.
   - Walkthrough: $\sqrt{25} = 5$. Without the conjugate you would get $9 - 16 = -7$ (N2).
3. **core · numeric · `q1-i-orth`** — "$\beta = (1, i)$ and $\alpha = (i, 1)$. What is $|\langle\beta|\alpha\rangle|$?"
   - Answer: **0** = `abs(inner(vec(1, I), vec(I, 1)))`.
   - Hints: (1) The bra is $(1, -i)$. (2) $1 \cdot i + (-i)\cdot 1$. (3) Simplify.
   - Walkthrough: $i - i = 0$: the two vectors are orthogonal. **F:** they are $\sqrt2|{+y}\rangle$ and $i\sqrt2|{-y}\rangle$.
4. **core · numeric · `q1-i-conj-lin`** — "$c = 2 + i$, $\beta = (1, 0)$, $\alpha = (0.6, 0.8)$. What is the imaginary part of $\langle c\beta|\alpha\rangle$?"
   - Answer: **−0.6** = `inner(vscale(vec(1,0), c(2,1)), vec(0.6,0.8)).im`.
   - Hints: (1) A number on the bra side comes out conjugated. (2) $\langle c\beta|\alpha\rangle = c^*\langle\beta|\alpha\rangle$. (3) $\langle\beta|\alpha\rangle = 0.6$.
   - Walkthrough: $(2 - i)(0.6) = 1.2 - 0.6i$ (D4).
5. **stretch · numeric · `q1-i-weighted`** — "$M = \begin{pmatrix}2 & i\\ -i & 2\end{pmatrix}$ and $\alpha = (1, -i)$. What is $\langle\alpha|\alpha\rangle_M$?"
   - Answer: **6** = `weightedInner(M, vec(1, c(0,-1)), vec(1, c(0,-1))).re`.
   - Hints: (1) First compute $M\alpha$. (2) $M\alpha = (3, -3i)$. (3) Then take the bra $(1, i)$ times it.
   - Walkthrough: $1 \cdot 3 + i\cdot(-3i) = 6$. **F:** α is the eigenvector for eigenvalue 3, and $\Vert\alpha\Vert^2 = 2$.

## 5. Glossary terms new in Q1

| id | Term | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|
| `qc-stern-gerlach` | Stern–Gerlach experiment | Silver atoms fly through a lopsided magnet and land on a plate in two spots, showing that spin comes in two values. | Deflection of an Ag beam in an inhomogeneous $\vec B$, resolving the spectrum of $\mu_z$ (1921–22). | `q1-two-spots:b1` | `l1-quantized` |
| `qc-magnetic-moment` | magnetic moment $\vec\mu$ | How strong a tiny magnet is and which way it points. | The vector $\vec\mu$ with energy $E = -\vec\mu\cdot\vec B$ in a field $\vec B$. | `q1-two-spots:b2` | `l1-quantized` |
| `qc-field-gradient` | field gradient | How fast a magnetic field's strength changes from one place to the next. | $\partial B_z/\partial z$, a component of $\nabla\vec B$; nonzero gradients exert forces on moments. | `q1-two-spots:b3` | `l1-quantized` |
| `qc-quantized` | quantized | Coming only in separate values, like steps, never anything in between. | Having a discrete spectrum; here $\mu_z \in \{\pm\mu\}$, $S_z \in \{\pm\hbar/2\}$. | `q1-two-spots:b5` | `l1-quantized` |
| `qc-hbar` | reduced Planck constant $\hbar$ | A tiny fixed number of nature, $1.0546 \times 10^{-34}$ joule-seconds, that sets the size of spin. | $\hbar = h/2\pi$; the engine sets $\hbar = 1$ and the UI appends ħ. | `q1-two-spots:b5` | `l1-quantized` |
| `qc-spin` | spin | A built-in turning property of particles such as the electron; its up–down part is $\pm\hbar/2$. | Intrinsic angular momentum $\vec S$; for spin ½, $S_z$ has eigenvalues $\pm\hbar/2$ and $\vec S = \hbar\vec\sigma/2$. | `q1-two-spots:b5` | `l1-quantized` |
| `qc-bohr-magneton` | Bohr magneton $\mu_B$ | The natural unit of an electron's magnetic strength, $9.274 \times 10^{-24}$ joules per tesla. | $\mu_B = e\hbar/2m_e$ (SI); Gaussian $e\hbar/2m_ec$. | `q1-two-spots:b6` | — |
| `qc-g-factor` | g-factor | The number, about 2 for an electron, that turns spin into magnetic strength. | $g$ in $\vec\mu = -g\mu_B\vec S/\hbar$; $g_e = 2.0023$. | `q1-two-spots:b6` | — |
| `qc-precession` | precession | The slow circling of a spinning magnet's axis around a field, like a tilted top. | Rotation of $\vec\mu$ about $\vec B$ at $\omega_L = g\mu_B B/\hbar$. | `q1-two-spots:b7` | `l1-quantized` |
| `qc-sequential-measurement` | sequential measurement | Sending the atoms that one magnet kept into another magnet. | A chain of filters; each leaves its outcome's eigenstate and probabilities multiply along a path. | `q1-sequences:b1` | `l1-sequential` |
| `qc-hidden-label` | hidden label | The guess that each atom secretly carries fixed answers that magnets merely read. | A local hidden-variable model with joint definite values, e.g. $\vert{+z}; {+x}\rangle$ (notes p. 3). | `q1-sequences:b4` | `l1-quantized` |
| `qc-ket` | ket $\vert\psi\rangle$ | The symbol for a quantum state; it holds everything that can be predicted. | A vector of the Hilbert space in Dirac notation. | `q1-superposition:b1` | `l1-vectors` |
| `qc-dirac-notation` | Dirac notation | Writing states as kets $\vert\ \rangle$ and their partners as bras $\langle\ \vert$. | Bra–ket notation for vectors, dual vectors and inner products. | `q1-superposition:b1` | `l2-vector-space` |
| `qc-hilbert-space` | Hilbert space | The space where kets live: kets can be added, scaled, and measured for length and angle. | A complete inner-product space; finite-dimensional ones are complete automatically. | `q1-superposition:b1` | `l2-vector-space` |
| `qc-superposition` | superposition principle | If a system can be in each of two states, it can be in any mix of them. | $c_1\vert\psi_1\rangle + c_2\vert\psi_2\rangle$ ($\ne 0$, normalised) is a state for $c_i \in \mathbb C$. | `q1-superposition:b2` | `l1-vectors` |
| `qc-born-rule` | Born rule | An outcome's chance is the size squared of its number in the state. | $P(k) = \vert\langle k\vert\psi\rangle\vert^2$ for a normalised $\vert\psi\rangle$. | `q1-superposition:b3` | `l3-postulates` |
| `qc-mixture` | mixture | A beam made of different states in fixed shares, with no definite phase between them. | An ensemble $\{p_k, \vert\psi_k\rangle\}$; its density matrix is $\sum_k p_k\vert\psi_k\rangle\langle\psi_k\vert$ (Q6). | `q1-superposition:b6` | `l6-mixture` |
| `qc-normalize` | normalise | Divide a vector by its length so that its new length is 1. | $\vert\psi\rangle \mapsto \vert\psi\rangle/\Vert\psi\Vert$ for $\vert\psi\rangle \ne 0$. | `q1-superposition:b7` | `l1-vectors` |
| `qc-vector-space` | vector space | A set of objects that can be added and scaled by numbers, following a fixed list of rules. | A set with addition and scalar multiplication over a field satisfying Axler 1.20. | `q1-vector-space:b1` | `l2-vector-space` |
| `qc-scalar` | scalar | A plain number, real or complex, used to scale a vector. | An element of the field $F$. | `q1-vector-space:b1` | `l2-vector-space` |
| `qc-closure` | closure | A set is closed when combining its members always gives another member. | $V$ closed under an operation if its result stays in $V$. | `q1-vector-space:b2` | `l2-complex` |
| `qc-zero-vector` | zero vector 0 | The vector that changes nothing when added; its length is 0, so it is never a state. | The additive identity of $V$ (the notes' $\vert0\rangle$; written 0 here). | `q1-vector-space:b3` | `l2-vector-space` |
| `qc-additive-inverse` | opposite vector $-\vert\alpha\rangle$ | The vector that cancels $\vert\alpha\rangle$ when added, leaving the zero vector. | The unique $w$ with $\vert\alpha\rangle + w = 0$ (Axler 1.27). | `q1-vector-space:b3` | `l2-vector-space` |
| `qc-polynomial-space` | polynomial space | All polynomials up to a chosen degree; they add and scale like lists of their coefficients. | $\mathcal P_n(\mathbb R)$, degree $\le n$, identified with $\mathbb R^{n+1}$ (Axler 2.12). | `q1-vector-space:b5` | — |
| `qc-bra` | bra $\langle\psi\vert$ | The partner of a ket: a row of the ket's numbers, each conjugated. | The dual vector $\langle\psi\vert = (\vert\psi\rangle)^\dagger$. | `q1-inner-product:b1` | `l2-inner-product` |
| `qc-dual-space` | dual space | The set of all bras, one partner for every ket. | $V^*$, the linear functionals on $V$; the Riesz map $\vert\psi\rangle \mapsto \langle\psi\vert$ is antilinear. | `q1-inner-product:b1` | `l2-vector-space` |
| `qc-inner-product` | inner product $\langle\beta\vert\alpha\rangle$ | A way to multiply a bra and a ket into one number that measures overlap, length and angle. | A positive-definite, conjugate-symmetric map, linear in the second slot. | `q1-inner-product:b2` | `l2-inner-product` |
| `qc-conjugate-symmetry` | conjugate symmetry | Swapping the two sides of an inner product gives its complex conjugate. | $\langle\alpha\vert\beta\rangle = \langle\beta\vert\alpha\rangle^*$. | `q1-inner-product:b2` | `l2-inner-product` |
| `qc-sesquilinear` | sesquilinear | Linear on the ket side, with numbers conjugated on the bra side. | Linear in one slot, conjugate-linear in the other (physics: the first). | `q1-inner-product:b2` | — |
| `qc-norm` | norm $\vert\alpha\vert$ | The length of a vector: the square root of its inner product with itself. | $\vert\alpha\vert = \sqrt{\langle\alpha\vert\alpha\rangle}$ (the notes' notation; also written $\Vert\alpha\Vert$). | `q1-inner-product:b4` | `l2-inner-product` |
| `qc-hermitian-matrix` | Hermitian matrix | A square table equal to its own mirror across the diagonal with every entry conjugated. | $M = M^\dagger$, i.e. $M_{ij} = M_{ji}^*$. | `q1-inner-product:b5` | `l3-eigen` |
| `qc-weighted-inner-product` | weighted inner product | An inner product with a table $M$ placed between the bra and the ket. | $\langle\beta\vert\alpha\rangle_M = \beta^\dagger M\alpha$, $M = M^\dagger > 0$. | `q1-inner-product:b5` | — |
| `qc-projection` | projection (shadow) | The shadow one arrow casts on another's line when light falls straight onto it. | $\frac{\langle\alpha\vert\beta\rangle}{\langle\alpha\vert\alpha\rangle}\vert\alpha\rangle$, the orthogonal projection onto span$\{\alpha\}$. | `q1-inner-product:b7` | `l3-projectors` |

Closure: "eigenvalue" (Formal text only) is F4's term, bridged to `l3-eigen`.

## 6. Review card per unit (both tracks)

### `q1-two-spots`
- **G points:** (1) A tiny magnet in a lopsided field is pushed along the slope of its energy: $F_z = \mu_z G$. (2) The landing height is proportional to $\mu_z$. (3) Classical magnets would smear; the plate shows two spots. (4) So $\mu_z$, and the spin $S_z = \pm\hbar/2$, is quantized.
- **F points:** (1) $F_z = \mu_z\,\partial B_z/\partial z$ from $E = -\vec\mu\cdot\vec B$. (2) $\Delta z \propto \mu_z$; two lines ↔ two eigenvalues. (3) $\mu_z = -g\mu_B S_z/\hbar$, $\mu_B = e\hbar/2m_e = 9.274 \times 10^{-24}$ J/T.
- **Equations:** $E = -\vec\mu\cdot\vec B,\quad F_z = \mu_z\frac{\partial B_z}{\partial z},\quad \Delta z = \frac{\mu_z}{2m}\frac{\partial B_z}{\partial z}\left(\frac Lv\right)^2$
- **Trap:** thinking a stronger gradient makes more spots. It only moves the two spots apart (0.105 → 0.210 mm).

### `q1-sequences`
- **G points:** (1) A kept beam is in a definite state, such as $|{+z}\rangle$. (2) Repeating the same measurement repeats the answer. (3) A magnet along a new axis splits it half and half. (4) After an $x$ magnet the $z$ answer is gone: ⅛ of the furnace's atoms in each final spot.
- **F points:** (1) $\widehat{SG}_{z\pm}$ acts as a projector, $P^2 = P$. (2) Each measurement leaves its outcome's eigenstate. (3) $[S_z, S_x] \ne 0$: no joint labels.
- **Equations:** $\widehat{SG}_{z\pm}|{\pm z}\rangle = |{\pm z}\rangle,\quad P(\pm x \mid {+z}) = \tfrac12,\quad P(+, +, \pm) = \tfrac18$
- **Trap:** "the atoms remember they were $+z$". The plate shows both spots after the $x$ magnet.

### `q1-superposition`
- **G points:** (1) A state is a ket $|\psi\rangle$. (2) Any mix $c_1|\psi_1\rangle + c_2|\psi_2\rangle$ of states is a state, once rescaled. (3) A chance is a number's size squared. (4) A superposition is not a half-and-half beam: along $x$, $|{+x}\rangle$ goes all up.
- **F points:** (1) Kets form a Hilbert space. (2) Coefficients are complex; relative phase matters. (3) $|0\rangle \equiv |{+z}\rangle$.
- **Equations:** $|\Psi\rangle = c_1|\psi_1\rangle + c_2|\psi_2\rangle,\quad |{+x}\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle + |{-z}\rangle),\quad P = |c|^2$
- **Trap:** forgetting to rescale: $|{+z}\rangle + |{-z}\rangle$ has length 1.414, so its chances are not 1 and 1.

### `q1-vector-space`
- **G points:** (1) Vectors can be added and scaled, and the results stay in the set. (2) Order and grouping of sums do not matter. (3) There is a zero vector and an opposite for each vector. (4) Scaling spreads over sums, and $1|\alpha\rangle = |\alpha\rangle$.
- **F points:** (1) $V(F)$, $F = \mathbb R$ or $\mathbb C$, per Axler 1.20. (2) Examples: $\mathbb R^n$, $\mathbb C^n$, $\mathcal P_n(\mathbb R)$ (degree ≤ n). (3) States are the unit vectors, not a subspace.
- **Equations:** $|\alpha\rangle + |\beta\rangle = |\beta\rangle + |\alpha\rangle,\quad |\alpha\rangle + 0 = |\alpha\rangle,\quad (c_1 + c_2)|\alpha\rangle = c_1|\alpha\rangle + c_2|\alpha\rangle,\quad 1|\alpha\rangle = |\alpha\rangle$
- **Trap:** confusing the zero vector 0 with the qubit state $|0\rangle$. The first has length 0; the second is $|{+z}\rangle$, length 1.

### `q1-inner-product`
- **G points:** (1) A bra is the ket's row with conjugated numbers. (2) $\langle\beta|\alpha\rangle = b_1^*a_1 + b_2^*a_2$. (3) Length is $\sqrt{\langle\alpha|\alpha\rangle}$; $(3, 4i)$ has length 5. (4) A table $M$ gives another inner product only if it passes the positivity test.
- **F points:** (1) Sesquilinear, conjugate-symmetric, positive definite. (2) $\langle c\beta|\alpha\rangle = c^*\langle\beta|\alpha\rangle$ follows. (3) $\beta^\dagger M\alpha$ with $M = M^\dagger > 0$. (4) Axler's $\langle u, v\rangle = \langle v|u\rangle$.
- **Equations:** $\langle\beta|\alpha\rangle = \beta^\dagger\alpha,\quad \langle\alpha|\beta\rangle = \langle\beta|\alpha\rangle^*,\quad |\alpha| = \sqrt{\langle\alpha|\alpha\rangle}$
- **Trap:** leaving the bra unconjugated: $(3, 4i)$ would get "length squared" $-7$.

## 7. Symbol-before-use tables

Abbreviations: ts, sq, sp, vs, ip. Status OK · **FLAG** · gloss.

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\vec\mu$, $\mu_z$, $B_z$, $E$ | ts:b2 | ts:b2 | OK | — |
| $z$ | ts:b2 ("up–down") | ts:b2 | OK | Only the vertical axis/height in Q1. |
| $G$, $B_0$ | ts:b3; D1 | ts:b3; D1 step 1 | OK | — |
| $F_z$ | ts:b3 | ts:b3 | OK | — |
| $\mu$ | ts:b4 | ts:b4 ("full strength") | OK | — |
| $m$, $a$, $t$, $L$, $v$, $\Delta z$ | D2 | D2 steps 1–3 | **FLAG** (minor) | $a$ is an acceleration only in D2; vs:b4 uses $a, b$ as scalars (the notes' letters). |
| $\hbar$ | ts:b5 | ts:b5 | OK | Tag `qc-hbar`. |
| $S_z$ | ts:b5 cap | ts:b5 (F) / `qc-spin` gloss | gloss | Ground text says "spin" and uses $S_z$ only in the review card. |
| $\mu_B$, $e$, $m_e$ | ts:b6 | ts:b6 | **FLAG** (resolved) | $e$ is the electron's charge, "not Euler's number" (F1's $e$). |
| $\vert{\pm z}\rangle$, $\vert{\pm x}\rangle$ | sq:b1, sq:b3 | sq:b1, sq:b3 | OK | — |
| $\widehat{SG}_{z+}$ | sq:b1 | sq:b1 | OK | The notes' symbol; the app says "z magnet, keep +". |
| $\vert\psi\rangle$, $\psi$ | sp:b1 | sp:b1 | OK | — |
| $c_1, c_2$, $\vert\psi_1\rangle, \vert\psi_2\rangle$ | sp:b2 | sp:b2 | OK | The notes' letters. |
| $i$ | sp:b4 | F1 (`qc-imaginary-unit`) | gloss | Bridged to F1. |
| $\alpha, \beta$ (amplitudes) | sp:b5 | sp:b5 | **FLAG** | From vs:b1 on, $\vert\alpha\rangle, \vert\beta\rangle, \vert\gamma\rangle$ are whole vectors (the notes' letters). sp:b5 has a note; the switch is said in vs:b1 F. |
| $\vert0\rangle, \vert1\rangle$ | sp:b5 | sp:b5 | OK | Qubit states $= \vert{\pm z}\rangle$. |
| $0$ (zero vector) | sp:b7 reveal ("zero vector") | vs:b3 | **FLAG** (forward) | sp:b7 says "zero vector" in words and shows length 0; the symbol 0 is defined in vs:b3. |
| $\mathbb R$, $\mathbb C$ | vs:b1 | vs:b1 (G) / F1 (F) | OK | — |
| $V^n(\mathbb R)$, $V^n(\mathbb C)$, $n$ | vs:b5 | vs:b5 | OK | — |
| $x$ (polynomial variable) | vs:b5 | vs:b5 | **FLAG** (minor) | Clashes with the $x$ axis; the F caption writes coefficient lists. |
| $\langle\psi\vert$, $\langle\phi\vert\psi\rangle$ | ip:b1 | ip:b1 | OK | — |
| $b_i^*, a_i$ | ip:b4 | ip:b4 | OK | — |
| $\vert\alpha\vert$ (norm) | ip:b4 | ip:b4 | OK | Same bars as F1's modulus: a length either way. |
| $M$ | ip:b5 | ip:b5 | OK | — |
| $\theta$ | ip:b7 | ip:b7 | OK | Angle between arrows. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\vec B(\vec r)$, $\partial B_z/\partial z$ | ts:b1 | ts:b1 | OK | — |
| $\nabla$ | ts:b3 | ts:b3 | OK | — |
| $\theta_\mu$ | ts:b4 | ts:b4 | **FLAG** (minor) | ip:b7 reuses θ for the angle between vectors; the subscript keeps them apart. |
| $g$, $g_e$ | ts:b6 | ts:b6 | OK | Never gravity in Q1 (the acceleration is compared in m/s² only). |
| $\omega_L$ | ts:b7 | ts:b7 | OK | — |
| $P$ (projector), $P^2 = P$ | sq:b2 | sq:b2 | **FLAG** | $P$ also means probability ($P(\pm x)$). Standard; the projector is always "the projector $P$". |
| $[S_z, S_x]$, $S_y$ | sq:b6 | sq:b6; bridge `l7-compatible` | gloss | Previewed; Q3 owns it. |
| $\vert\Psi\rangle$, $d_1, d_2$, $\vert\psi_3\rangle$ | sp:b2 | sp:b2 | OK | The notes' symbols. |
| $\vartheta$ | sp:b2 cap | sp:b2 cap | OK | Plane angle; only in that caption. |
| $V(F)$, $F$ | vs:b1 | vs:b1 | OK | $F$ is the field, never a force in units 4–5. |
| $\mathcal P_n(\mathbb R)$ | vs:b5 | vs:b5 | OK | — |
| $\dagger$, $\beta^T$ | ip:b1, ip:b4 | ip:b1, ip:b4 | OK | — |
| $\sigma_y$, $\sigma_z$ | ip:b5, ip:b8 | named as matrices there | **FLAG** | Pauli matrices are Q2/Q3 material; here they are only names for explicit matrices. |
| $\langle u, v\rangle_{\text{Axler}}$, $T^*$ | ip:b6 | ip:b6 | OK | — |

**Counts:** Ground 5 FLAGs (all resolved by notes or scoping), Formal 4 FLAGs.

## 8. Errata

The notes' physics is right; below are slips, omissions and clashes, checked on the page images (img) or in the maths
(math). Each `Correction` is paraphrased, source `'notes'`.

### 8.1 Corrections (errata box, with `check()`)
| # | Where | The notes say (paraphrased) | It should say | `check` |
|---|---|---|---|---|
| N1 (map) | p. 2 (img) | The moment is $g\mu_B L_z/\hbar$ with $\mu_B = e\hbar/2m_ec$ and $L_z = \pm\hbar/2$. | The $\pm\hbar/2$ values belong to the spin $S_z$, and for an electron $\mu_z = -g\mu_B S_z/\hbar$ ($g \approx 2$), so the moment is antiparallel to the spin. In SI, $\mu_B = e\hbar/2m_e = 9.274 \times 10^{-24}$ J/T; $e\hbar/2m_ec$ is the Gaussian form. | `Math.abs(E_CHARGE*HBAR/(2*M_E) - SILVER.muB)/SILVER.muB < 1e-8 && sgDeflection({...P0, muZ: -SILVER.muB}) < 0` |
| N2 (map) | p. 4 (img) | The inner product is a "bilinear" map. | Over ℂ it is sesquilinear: conjugate-linear in the bra, as the notes' own fifth rule shows. A bilinear form gives $(3, 4i)$ the "length squared" $-7$. | `bilinear(vec(3,c(0,4)), vec(3,c(0,4))).re === -7 && inner(vec(3,c(0,4)), vec(3,c(0,4))).re === 25` |
| N8a (map) | p. 5, Fig. 3 (img) | $\langle\alpha|\beta\rangle/|\alpha| = |\beta|\cos\theta$, as a general statement. | For real vectors. For complex ones $\langle\alpha|\beta\rangle$ can be complex; use $\operatorname{Re}\langle\alpha|\beta\rangle$. | `inner(vec(1,0), vec(I,0)).im === 1` (the "shadow" would be $i$) |
| N9 (new) | p. 3 (img) | Only a single measurement can be performed on a quantum system. | Successive measurements are possible and repeatable (z then z agrees); a measurement along a new axis replaces the state the earlier one prepared. | `benchTheory({source:'oven',axes:['z','z'],keep:['+']}).minus === 0 && close(benchTheory({source:'oven',axes:['z','x','z'],keep:['+','+']}).minus, 0.125)` |
| N10 (new) | p. 4 (img + math) | Seven properties define a vector space. | They omit $1|\alpha\rangle = |\alpha\rangle$ (Axler 1.20, p. 12). Without it the scaling $c|\alpha\rangle = 0$ satisfies every listed property. | the `q1Lazy` content check (50 seeded samples) |
| N11 (new) | p. 4 (img) | The $n$th-order real polynomials form a vector space. | The polynomials of degree at most $n$ do (Axler 2.12, p. 31). Degree exactly $n$ is not closed: $(x^2 + x) + (-x^2 + 1) = x + 1$. | `vadd(vec(0,1,1), vec(1,0,-1))[2].re === 0` |

### 8.2 Silent fixes and notes (no box)
| # | Where | Point | Action |
|---|---|---|---|
| N12 | p. 4 | The zero vector is written $\vert0\rangle$; in 709, $\vert0\rangle \equiv \vert{+z}\rangle$ (ruling C1). | Write 0; Rosetta in `q1-sequences:b1`; beat `q1-vector-space:b3`; challenge `q1-v-zero`. |
| N13 | p. 2 | Atoms land on a "screen". | "Plate" (the 1922 deposit was on glass), as 448 does. |
| N14 | p. 2 | "Quantized in units of ħ/2." | The two values are $\pm\hbar/2$, one ħ apart; Ground says "two values". |
| N15 | p. 2 | ħ is called "the Planck's constant". | The reduced Planck constant, $\hbar = h/2\pi$ (gloss). |
| N16 | p. 3 | "Any linear combination" is a state. | Any nonzero combination, then normalised (clue `q1-superposition:b7`). |
| N17 | p. 2 | $F_z = \mu_z\,\partial B_z/\partial z$ "if $\vec B \parallel \hat z$". | An idealisation: $\nabla\cdot\vec B = 0$ forces transverse gradients, averaged out by precession (`q1-two-spots:b7`, beyond the notes). |
| N18 | p. 4 | "∃ a unique $\vert0\rangle$", "a unique inverse". | Uniqueness follows from the axioms (Axler 1.26–1.27, p. 14); harmless. F text of `q1-vector-space:b3`. |

**Checked and correct:** the energy and force (p. 2); $\hbar = 1.0546 \times 10^{-34}$ J·s (CODATA 1.054571817e−34); the single
contributing electron; the repeat rule; z–x–z; the superposition line; the five inner-product properties (the fifth
follows, D4); the example inner products and their conditions; the norm; Fig. 2.

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
Existing and sufficient: `sg.ts` (`benchTheory`, `sequenceOutcomes`, `fireMany`), `field.ts` (`sgDeflection`,
`SILVER`), `random.ts` (`rng`), `spin.ts` (`KET`, `prob`, `projector`, `samePhysicalState`, `ketFromBloch`, `SX, SY, SZ`,
`SIGMA_Z`), `linalg.ts` (`inner`, `bilinear`, `norm`, `normalize`, `vadd`, `vscale`, `matmul`, `matEq`, `commutator`,
`mscale`, `isHermitian`), `qc/cmat.ts` (`eigh`, `weightedInner`, `angleBetween`), `qc/state.ts` (`ket`).

| # | Function | Formula | Used by | numpy twin |
|---|---|---|---|---|
| E1 | `physics/constants.ts`: `E_CHARGE, HBAR, M_E, G_E, AMU` (CODATA 2018) and `muBohr()` | $\mu_B = e\hbar/2m_e$ | ts:b5–b7, N1, `q1-t-sign` | `scipy.constants` (e, hbar, m_e, physical_constants['electron g factor']); `muBohr` = 9.274010e−24 vs `SILVER.muB` 9.2740100783e−24 (rel. 6e−10) |
| E2 | `field.ts`: `sgForce(muZ, dBdz)`, `sgAcceleration(p)`, `sgTimeInMagnet(p)` | $\mu_zG$; $\mu_zG/m$; $L/v$ | ts:b3, b7, `q1-t-force`, `q1-t-deflection` walkthrough | 9.274e−21 N; 51 775.6 m/s²; 6.3636e−5 s |
| E3 | `field.ts`: `larmorOmega(g, B)` | $g\mu_B B/\hbar$ | ts:b7 (F caption) | 1.7609e11 rad/s at 1 T; 1.78e6 turns in 63.6 µs |

The lazy-scaling check (N10) is a content helper in `Q1.values.ts`, not engine physics.

### 9.2 Stage contract
| # | Gap | Proposal | Fallback |
|---|---|---|---|
| S1 | `hilbert-plane` cannot draw an unnormalised sum with its parallelogram (notes Fig. 2). | Additive field `sumOf?: [PlaneKet, PlaneKet]`: both arrows, the sum at true length (zoom as `image` does), dashed translated sides. | `image` with the matrix $I + R(\Delta)$ (vs:b1). |
| S2 | The plane's `arc` is labelled θ/2 (the Bloch half-angle); Fig. 3's θ is the angle between arrows. | `arcLabel?: string` on `HilbertPlaneState`. | No arc; the caption names the angle. |
| S3 | Passport axis labels are $\vert{\uparrow}\rangle = \vert{+z}\rangle$; 709 wants $\vert0\rangle = \vert{+z}\rangle$ (C1). | `passportOf(s, course)` with a 709 variant for `hilbert-plane` (and later `bloch`). | Keep 448's labels; sp:b5 caption states the lock. |
| S4 | `lab-r3` cannot scale the gradient (ts:b8 reveal). | `gradientScale?: number` (schematic: multiplies the drawn spot split; readouts unchanged). | Unchanged picture; the caption carries 0.105 → 0.210 mm. |
| S5 | `amplitudes` (planned) for sp:b4. | Fields as in `P-F1-story.md` §9.2 S2 (`dials`, `labels:'spin'`). | `hilbert-plane` + caption + `plane-real-slice`. |
| S6 | Unit 4 draws vectors that are not states. | New fidelity item `plane-vectors-not-states` (misleading): "In this unit the arrows are vectors of a vector space. Only arrows of length 1 are states; the others are sums and multiples." | — |

## 10. Media

### 10.1 Blender opener, Part I (300 K top flange, shared with Part F)
The silver beam leaves the furnace, crosses the knife-edge magnet from `lab.glb`, and splits into two lines on the
plate; a ghost band marks the classical prediction. Trajectories come from `sgTrajectoryZ(P0, y)` for $\mu_z = \pm\mu_B$,
scaled for visibility (the scale factor is stated in the render log, never on screen). **Change from the map:** the map
put Part I at the 50 K shield; the approved identity (D-709-identity §6, outline.ts `PLATES`) puts Parts F and I on the
300 K plate, so the opener continues the Part F plate instead of descending.

### 10.2 Motion Canvas films
**`qc-q1-zxz` "z–x–z erases the memory"** (opener of `q1-sequences`, ~25 s)
1. 1000 atoms (`rng(709)`) leave the furnace through z(keep +) → x(keep +) → z. Running tallies from
   `fireMany({source:'oven', axes:['z','x','z'], keep:['+','+']}, 1000, rng(709))`: blocked 496 at the first stop,
   246 at the second; plate 126 (+) and 132 (−).
2. The theory bars fade in beside the tallies: ½, ¼, ⅛, ⅛ (`benchTheory`).
3. The hidden-label overlay predicts "all +" and fades against the two spots.
4. Swap the middle magnet to $z$: the plate shows + only (`benchTheory` zzz: plus 0.5, minus 0).
Manifest: the four `fireMany` counts (seed 709, N = 1000), `q1Zxz`, `q1Zzz`.

**`qc-q1-energy-slope` (optional) "Force is the downhill slope of energy"** (insert at `q1-two-spots:b3`, ~15 s)
1. Two lines $E(z) = \mp\mu_B(B_0 + Gz)$ for $\mu_z = \pm\mu_B$; arrows of force $\pm 9.27 \times 10^{-21}$ N (`q1Force`).
2. The two parabolic paths inside the magnet reach $\pm 0.105$ mm (`sgTrajectoryZ(P0, L)` = `sgDeflection(P0)`).
3. The classical fan of paths fills the band between them.
Manifest: `q1Force`, `q1Defl`, `sgTrajectoryZ` samples.

### 10.3 Higgsfield decor (atmosphere only; user approves credits)
- Part I: furnace glow, silver vapour, frost starting on a vacuum flange (the map's shot).
- Q1 moment: an oven mouth glowing orange in a dark lab, a faint haze drifting out. No magnet, no plate, no spots: any
  picture of two spots would state a result.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | cross-course (448) |
|---|---|---|---|---|
| `qc-sg-quantization` | Two spots: $\mu_z$ takes two values | Q1 · `q1-two-spots` | — | twin `quantized` |
| `qc-measurement-prepares` | A new axis erases the old answer | Q1 · `q1-sequences` | `qc-sg-quantization` | twin `prepares`; link `order` |
| `qc-superposition` | Superposition of states | Q1 · `q1-superposition` | `qc-measurement-prepares`, `qc-phase` (F1) | twin `vectors`; link `mixtures` |
| `qc-vector-space` | The vector-space rules | Q1 · `q1-vector-space` | `qc-superposition`, `qc-complex-plane` (F1) | twin `vector-space` |
| `qc-inner-product` | Inner products, bras and norms | Q1 · `q1-inner-product` | `qc-vector-space`, `qc-complex-multiply` (F1) | twin `inner-product` |

Once F2 is planned, `qc-vector-space` and `qc-inner-product` also need F2's stations (F2 → Q1).

### 11.2 Arcade: one level per unit
Label constant: `const Q1x = (unit, label) => ({ lecture: 'Q1', unit, label })`.
1. **`q1-two-spots` · Spot the error · `qc-smear`** — "Where does the smear go?"
   - Steps: "Each atom is pushed with $F_z = \mu_z\,\partial B_z/\partial z$." · "Its landing height is proportional to $\mu_z$." · "Classical magnets point every way, so $\mu_z$ takes every value from $-\mu$ to $+\mu$." · "So classically the plate shows two spots, at $\pm\Delta$."
   - `wrong: 3`. Why: every value of $\mu_z$ gives its own height, so classically the plate shows a band; two spots mean two values (`q1DeflHalf` → 0.5: half the moment, half the height).
2. **`q1-sequences` · Route the beam · `qc-sixteenth`** — "One sixteenth"
   - Level: `source:'oven'`, `target:{spot:'plus', fraction:1/16, label:'1⁄16'}`, `maxDevices:4`, `start:{axes:['z'], keep:[]}` (gives ½, not the target).
   - Hint: "Every change of axis halves what is left."
   - Why: four magnets on alternating axes, four halvings.
   - `solution:{axes:['z','x','z','x'], keep:['+','+','+']}` → `benchTheory` plus 0.0625. (Tilted solutions exist too; the game accepts any.)
3. **`q1-superposition` · Spot the error · `qc-superposition-is-mixture`** — "Half up, half down?"
   - Steps: "$|{+x}\rangle = (|{+z}\rangle + |{-z}\rangle)/\sqrt2$." · "Along $z$ it gives ½ and ½." · "So a $|{+x}\rangle$ beam is really half $|{+z}\rangle$ atoms and half $|{-z}\rangle$ atoms." · "Then an $x$ magnet splits it 50/50."
   - `wrong: 2`. Why: an $x$ magnet sends every $|{+x}\rangle$ atom up (`benchTheory({source:'+x', axes:['x'], keep:[]}).plus` → 1); only a mixture splits.
4. **`q1-vector-space` · Spot the error · `qc-degree-exactly-two`** — "Quadratics as vectors"
   - Steps: "Take the polynomials of degree exactly 2." · "Scaling $x^2 + 1$ by 3 gives $3x^2 + 3$, still degree 2." · "Adding two of them always gives degree 2." · "So they form a vector space."
   - `wrong: 2`. Why: $(x^2 + x) + (-x^2 + 1) = x + 1$ (`q1Degree` → (1, 1, 0)).
5. **`q1-inner-product` · Spot the error · `qc-no-conjugate-3-4i`** — "The length of (3, 4i)"
   - Steps: "Take $\alpha = (3, 4i)$." · "Its bra is the row $(3, 4i)$." · "So $\langle\alpha|\alpha\rangle = 9 + 16i^2 = -7$." · "So its length is $\sqrt{-7}$, a complex number."
   - `wrong: 1`. Why: the bra conjugates, $(3, -4i)$, so $\langle\alpha|\alpha\rangle = 25$ and the length is 5 (`q1Norm34i` → 25; `q1Bilinear34i` → −7).

## 12. Questions for the judge

**Q1. The z–x–z numbers and HW1 P2.** The notes' own example (p. 3) is the $\theta = 90°$ case of HW1 P2, whose answer
includes the maximum over θ. This plan shows the example per magnet (½ at each) and from the furnace (⅛ per spot),
never relative to the first filter's output, never as a function of a tilt, and never as a maximum. The Try-it
`sg-lab` is editable, so a learner can tilt the middle magnet and read the fraction. *Ask:* is that acceptable (it is
448's existing tool; HW1 was due 2026-09-16), or should the Q1 preset lock tilts (`editable:false` plus a two-axis
menu)?

**Q2. Q1 vs F2 ownership.** Q1 follows the notes' vector-space and inner-product pages, and F2 will build the same
objects from graph paper. This plan keeps Q1 to what the notes state (rules, examples, conditions, D4) and bridges to
`f2-space`/`f2-dot` for constructions (law of cosines, why the conjugate). *Ask:* confirm, so the F2 plan does not
repeat the notes' axioms list.

**Q3. `q1-two-spots:b7`** (∇·B = 0 and precession) goes beyond the notes and cites MIT 8.05 as 448 L1 does. *Ask:* keep
it as a badged [B] beat, or move it into the fidelity drawer?

**Q4. Zero-vector notation.** The notes write the zero vector $|0\rangle$, which clashes with the locked qubit state
$|0\rangle \equiv |{+z}\rangle$. This plan writes 0 and adds a Rosetta line and a challenge. *Ask:* accept, as a silent
change with the Rosetta note (N12)?
