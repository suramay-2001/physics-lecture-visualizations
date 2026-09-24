# P2 — L1 Story, Fidelity, Glossary, Review (Role P, part 2)

Proposal only. Nothing under `app/` is modified.

## 1. Story beats per L1 unit

**Conventions used below.**
- Beat id = `<unit>:b<n>`. Phase tag: **[L]** lecture says, **[B]** books add, **[C]** clues. Order within a unit is always L → B → C.
- Colors follow PLAN [D]: amber = + outcome, cobalt = − outcome, near-white = the state, silver = structure/hypotheses.
- "State chip" = a DOM label pinned to a beam segment that shows the ket of the atoms in that segment (e.g. `|+z⟩`). It swaps at a magnet exit.
- Lab geometry (matches `sg.ts`): the beam flies along **y**. Magnets can point anywhere in the **x–z plane**; a numeric axis is a tilt in degrees from +z toward +x (`tiltXZ`).
- Every number is an engine call. `bT(...)` below abbreviates `benchTheory(...)`.
- The oven beam has **no ket**. The stage shows it with no state chip ("unpolarized"). See §6.1.
- Core text: ≤ 25 words per sentence, one idea per sentence. Word counts were checked by hand.

### Unit `l1-quantized` — Two spots, not a smear

**`l1-quantized:b1` [L]**
- Core: "Silver atoms leave a hot oven as a narrow beam. Each atom carries a tiny magnetic moment $\vec\mu$. Near the sharp pole the field is stronger, so the magnet pushes on the atom."
- Stage: `lab-r3`.
- State: oven, unpolarized (`source:'oven'`), axes `['z']`, no beam blocked yet. No state chip.
- Animates: atoms stream from oven into the magnet gap. Field streamlines fade in, packed tightly near the knife-edge pole.
- Camera: wide three-quarter establishing shot, then a slow dolly to the gap.
- Links: `\vec\mu` → the small arrow glyph on one highlighted atom · "stronger near the pole" → streamline density at the knife edge.

**`l1-quantized:b2` [L]**
- Core: "Classically, each moment points in a random direction. Its vertical part is $\mu_z = \mu\cos\theta_\mu$, anywhere from $-\mu$ to $+\mu$. So the plate should show one continuous band."
- Stage: `lab-r3`, **classical-model overlay**. Atoms are drawn as bar magnets with random orientations. A silver badge reads "classical model — not what happens".
- State: no quantum state; the plate shows a dashed silver ghost band spanning −max to +max deflection.
- Animates: one bar magnet freezes; its angle arc and drop-line to the z axis draw on.
- Camera: over the shoulder of the magnet, looking at the plate.
- Links: `\theta_\mu` → angle arc between the atom's moment and +z · `\mu\cos\theta_\mu` → drop-line from the arrow tip to the z axis · `-\mu`, `+\mu` → the two ends of the ghost band.
- Note: the unit currently writes plain `\theta` here. §5 recommends `\theta_\mu`, because `l1-average` reuses `\theta` for a different angle.

**`l1-quantized:b3` [L]**
- Core: "The plate shows two spots and nothing between them. Every atom goes up or down by the same amount. The measured spin is only ever $S_z = +\tfrac{\hbar}{2}$ or $-\tfrac{\hbar}{2}$."
- Stage: `lab-r3`, quantum mode. Atoms become glow points, with no arrows.
- State: oven, axes `['z']`. The deposit builds at amber (+) and cobalt (−) spots, 50/50 (`bT({source:'oven',axes:['z'],keep:[]})` → plus 0.5, minus 0.5). The ghost band stays as a dashed outline for contrast.
- Camera: push in on the plate.
- Links: `+\tfrac{\hbar}{2}` → amber spot · `-\tfrac{\hbar}{2}` → cobalt spot · `S_z` → silver z-axis label on the magnet.

**`l1-quantized:b4` [L]**
- Core: "Block the down beam and send the up beam through a second $z$ magnet. Every atom goes up again. We name the state of these atoms $|{+z}\rangle$."
- Stage: `lab-r3`.
- State: `bT({source:'oven',axes:['z','z'],keep:['+']})` → blocked `[0.5]`, plus 0.5, minus 0. State chip `|+z⟩` = $\begin{pmatrix}1\\0\end{pmatrix}$ on the segment between the magnets. Plate 2 is 100 % amber.
- Animates: a beam stop slides onto the − output of magnet 1; magnet 2 slides into place.
- Camera: track along the kept beam.
- Links: `|{+z}\rangle` → state chip · "block" → beam stop.

**`l1-quantized:b5` [B]**
- Core: "Zwiebach (MIT 8.05) shows why the pole is sharp. A uniform field only twists a moment. A field that changes across the gap pushes atoms apart."
- Second core line: "Susskind swaps the magnet for an ideal box that reads $\sigma = \pm1$. Here $\sigma = 2S_z/\hbar$, the same answer without units."
- Stage: `lab-r3`.
- State: oven, axes `['z']`.
- Animates: (1) The field toggles to uniform. The beam goes straight: one spot, with atoms precessing in place (drawn as a spin-glint). (2) The field toggles back to a gradient and the beam splits. (3) The magnet morphs into a black box with a ±1 readout.
- Camera: fixed medium shot.
- Links: `\vec F = \nabla(\vec\mu\cdot\vec B)` → streamline density gradient · `\sigma = \pm1` → box readout · `2S_z/\hbar` → spot labels relabel from ±ħ/2 to ±1.

**`l1-quantized:b6` [C]**
- Core: "A coin also has two outcomes, so two spots alone are not quantum. A hidden up/down label still explains everything so far. The next unit breaks that label."
- Stage: `lab-r3`, hidden-label overlay. Each atom gets a silver "↑"/"↓" tag, badge "hypothesis".
- State: same bench as b4.
- Camera: pull back to wide.
- Links: none (no equation).

### Unit `l1-sequential` — A new axis erases the old answer

**`l1-sequential:b1` [L]**
- Core: "Keep the up beam, then turn the second magnet 90° about the beam. It now measures along $x$. A stored 'up' arrow has zero $x$ part."
- Stage: `lab-r3`.
- State: oven → SG$_z$ (keep +) → SG$_x$. The chip `|+z⟩` sits on the segment entering magnet 2.
- Animates: magnet 2 rotates 90° about the y (beam) axis. A dashed silver "classical expectation: no deflection" ring appears at the plate centre.
- Camera: end-on down the beam, so the rotation reads like a clock hand.
- Links: `x` → magnet 2's silver gradient-axis arrow.

**`l1-sequential:b2` [L]**
- Core: "Instead every atom goes left or right, half each. Nothing lands in the middle. $P(\pm x\mid{+z}) = \tfrac12$."
- Stage: `lab-r3`.
- State: plate 2 splits amber (right = +x) and cobalt (left = −x) 50/50 (`bT({source:'+z',axes:['x'],keep:[]})` → 0.5 / 0.5). The centre ring stays empty.
- Camera: plate face-on.
- Links: `P(+x\mid{+z})` → amber fill meter · `\tfrac12` → atom counter.

**`l1-sequential:b3` [L]**
- Core: "Keep the right beam and measure $x$ again. Every atom goes right. The atoms now carry a definite $x$ answer."
- Stage: `lab-r3`.
- State: `bT({source:'oven',axes:['z','x','x'],keep:['+','+']})` → blocked `[0.5, 0.25]`, plus 0.25, minus 0. The chip after magnet 2 swaps from `|+z⟩` to `|+x⟩` = $\tfrac{1}{\sqrt2}\begin{pmatrix}1\\1\end{pmatrix}$.
- Camera: track the kept right beam.
- Links: `|{+x}\rangle` → chip.

**`l1-sequential:b4` [L]**
- Core: "Now turn the last magnet back to $z$. The result is 50/50 again. The earlier 'up' is gone: $P(\pm z\mid{+x}) = \tfrac12$."
- Stage: `lab-r3`.
- State: `bT({source:'oven',axes:['z','x','z'],keep:['+','+']})` → blocked `[0.5, 0.25]`, plus 0.125, minus 0.125.
- Animates: magnet 3 rotates back to z.
- Camera: wide shot of the whole bench. DOM labels give the beam fraction per segment: 1 → ½ → ¼ → ⅛ + ⅛.
- Links: `P(\pm z\mid{+x})` → final plate · "1/8" → fraction label on the final + spot.

**`l1-sequential:b5` [B]**
- Core: "Susskind: experiments are never gentle. A measurement along $x$ does not just read a value. It prepares $|{+x}\rangle$, and that erases the $z$ answer."
- Stage: `lab-r3`, same bench.
- Animates: slow-motion on one atom. At magnet 2's exit, its chip swaps from `|+z⟩` to `|+x⟩`, with a short flash.
- Camera: close on magnet 2's exit.
- Links: "prepares" → chip swap · `|{+x}\rangle` → new chip.

**`l1-sequential:b6` [C]**
- Core: "Remove the middle magnet. The last $z$ magnet now sends every atom up. The middle measurement erased the answer, not time or distance."
- Stage: `lab-r3`.
- State: magnet 2 slides out, leaving `bT({source:'oven',axes:['z','z'],keep:['+']})` → plus 0.5, minus 0. The final plate becomes all amber.
- Camera: wide.
- Links: none.

### Unit `l1-average` — Single atoms are random, averages are classical

**`l1-average:b1` [L]**
- Core: "Prepare atoms in $|{+z}\rangle$. Tilt the magnet by $\theta$ from $z$ toward $x$. Each atom still lands in just the + or − spot."
- Stage: `lab-r3`.
- State: source `'+z'` (an upstream SG$_z$ drawn greyed, with its − output blocked). Axes `[θ]`. Scroll scrubs θ from 0° to 180°. The two spots sit along the tilted axis $\hat n$ and rotate with the magnet. Deposit fractions follow `probUpAlong(tiltXZ(θ),[0,0,1])`.
- Camera: end-on down the beam.
- Links: `\theta` → arc between the z axis and the magnet axis $\hat n$.

**`l1-average:b2` [L]**
- Core: "Call each reading $\sigma_n = \pm1$. Over many atoms the average is $\langle\sigma_n\rangle = \hat n\cdot\hat m = \cos\theta$. A classical arrow gives this for each atom; quantum atoms give it only on average."
- Stage: `lab-r3`.
- State: $\hat m = \hat z$ (preparation axis), $\hat n$ = magnet axis, with θ still scrubbing. A silver centroid tick between the spots slides to $\cos\theta$. Each atom still lands only on a spot.
- Camera: plate face-on, with the two axis arrows overlaid.
- Links: `\hat n` → magnet-axis arrow · `\hat m` → preparation-axis arrow · `\hat n\cdot\hat m`, `\cos\theta` → drop-line projecting $\hat m$ onto $\hat n$ · `\langle\sigma_n\rangle` → centroid tick.

**`l1-average:b3` [L]**
- Core: "The outcomes are ±1, so the average is $2P(+) - 1$. Solving gives $P(+) = \tfrac{1+\cos\theta}{2} = \cos^2\tfrac{\theta}{2}$."
- Stage: `lab-r3`, with θ stopping at 45°.
- State: $P(+)$ = `probUpAlong(tiltXZ(Math.PI/4),[0,0,1])` = **0.8536**; average = `averageDeflection(45,'z')` = **0.7071**.
- Links: `P(+)` → amber fill fraction bar · `2P(+)-1` → centroid tick · `\cos^2\tfrac{\theta}{2}` → the same bar (no half-angle arc yet; see b6).

**`l1-average:b4` [B]**
- Core: "Reif: one trial is unpredictable, but the mean of many is not. The mean's scatter shrinks like $1/\sqrt{N_{\text{atoms}}}$."
- Stage: `lab-r3`, θ = 45°.
- Animates: fire batches of 10, 100 and 1000 atoms. A ±1σ band around the centroid tick narrows. Its half-width is $\sin\theta/\sqrt{N_{\text{atoms}}}$, i.e. `Math.sqrt(variance(nDotSigma(tiltXZ(θ)), KET['+z'])/N)`.
- Camera: plate close-up.
- Links: `1/\sqrt{N_{\text{atoms}}}` → band width.

**`l1-average:b5` [C]**
- Core: "The notes say 3/4 go up-right at 45°. The rule gives $\cos^2 22.5^\circ \approx 0.854$. A 3 : 1 split needs $\theta = 60^\circ$."
- Stage: `lab-r3`.
- State: θ scrubs 45° → 60°. The fill bar reads 0.854 → 0.750. An errata chip links to the `L1 p.4` Correction.
- Links: `60^\circ` → tilt arc · `0.854` → bar readout.

**`l1-average:b6` [C]**
- Core: "Why a half angle? Let $|{+n}\rangle$ be the state that reads + along $\hat n$ every time. In state space its angle to $|{+z}\rangle$ is $\theta/2$. Squaring the overlap $\cos\tfrac{\theta}{2}$ gives $P(+)$."
- Stage: split. Left: `lab-r3` (magnet at θ). Right: `hilbert-plane` (proposed, §7 Q1), showing a state arrow at θ/2.
- State: $|{+n}\rangle$ = `ketFromBloch(θ,0)` = $\begin{pmatrix}\cos\frac\theta2\\ \sin\frac\theta2\end{pmatrix}$. θ scrubs 0° → 180°, so the right-hand arrow runs 0° → 90°.
- Camera: both flat, side by side.
- Links: `\theta` → lab arc · `\theta/2` → Hilbert-plane arc · `\cos\tfrac{\theta}{2}` → shadow of the state arrow on the $|{+z}\rangle$ axis.

### Unit `l1-logic` — When "or" depends on the order

**`l1-logic:b1` [L]**
- Core: "Classical states form a set. A claim like 'up OR right' is simply true or false. Checking it in either order gives the same answer."
- Stage: `lab-r3`, two parallel benches. A: SG$_z$ then SG$_x$. B: SG$_x$ then SG$_z$. Both are fed by `source:'+z'`.
- State: idle, with a DOM truth table (A / B × true / false).
- Camera: top-down, both benches in frame.

**`l1-logic:b2` [L]**
- Core: "Order A checks $z$ first. Every atom prepared up reads up. So the claim is true for every atom, whatever $x$ says next."
- Stage: `lab-r3`, bench A fires.
- State: z sends 100 % to + (`bT({source:'+z',axes:['z','x'],keep:['+']})` → blocked `[0]`, plus 0.5, minus 0.5). All plate hits count as "true".
- Links: "true" → A-true counter.

**`l1-logic:b3` [L]**
- Core: "Order B checks $x$ first. Half the atoms read left and become $|{-x}\rangle$. Half of those then read down. The claim is false for $\tfrac14$ of the atoms."
- Stage: `lab-r3`, bench B fires. The right branch (+x) ends as "true". The left branch feeds a z magnet.
- State: false fraction = `bT({source:'+z',axes:['x','z'],keep:['-']}).minus` = **0.25**. The (left, down) spot gets a silver "false" outline (no new hue).
- Links: `P(-x\mid{+z})` → left beam · `P(-z\mid{-x})` → down spot on the left branch · `\tfrac14` → B-false counter.

**`l1-logic:b4` [B]**
- Core: "For sets, 'or' is symmetric: $A\cup B = B\cup A$. Susskind runs this same test and finds the symmetry broken. Quantum claims do not obey set logic."
- Stage: `lab-r3`, final tallies side by side: A false 0 %, B false 25 %.
- Links: `A\cup B` → A tally · `B\cup A` → B tally.
- Note: $A$, $B$ here are sets, not orders A/B. §5 flags the clash and suggests labelling the orders "z-first / x-first" in the UI.

**`l1-logic:b5` [C]**
- Core: "Classically, looking does not disturb, so order cannot matter. Here the $x$ check changes the state before $z$ is read. That is the assumption that fails."
- Stage: `lab-r3`, slow motion on one atom in bench B. Its chip swaps from `|+z⟩` to `|−x⟩` at the x-magnet exit.
- Links: `|{-x}\rangle` → chip.

### Unit `l1-vectors` — States are vectors

Stage note: the L1 states (up, down, right, left) all have real coefficients. The real 2D slice of ℂ² is therefore **exact** for this unit, and it shows orthogonality honestly. The Bloch sphere would draw orthogonal states as opposite points (§2). So this unit uses the proposed `hilbert-plane` stage, with the existing `projector` widget as fallback. Passport: "STATE SPACE · real slice of ℂ² · not a place".

**`l1-vectors:b1` [L]**
- Core: "A $z$ magnet always tells up from down. We draw them as perpendicular unit arrows, $|{\uparrow}\rangle$ and $|{\downarrow}\rangle$. $|{\uparrow}\rangle$ is our $|{+z}\rangle$."
- Stage: `hilbert-plane`. |↑⟩ is an amber arrow along the horizontal axis; |↓⟩ is a cobalt arrow along the vertical axis. A right-angle mark sits between them. A small `lab-r3` inset shows the up and down beams leaving the magnet in opposite directions.
- Camera: flat, orthographic, face-on.
- Links: `|{\uparrow}\rangle` → amber arrow · `|{\downarrow}\rangle` → cobalt arrow · `\langle{\uparrow}|{\downarrow}\rangle = 0` → right-angle mark.

**`l1-vectors:b2` [L]**
- Core: "Any state is $|\psi\rangle = \alpha|{\uparrow}\rangle + \beta|{\downarrow}\rangle$. The outcome probabilities are $|\alpha|^2$ and $|\beta|^2$. They add to 1, so $|\psi\rangle$ has length 1."
- Second core line: "The inner product reads off a coordinate: $\langle{\uparrow}|\psi\rangle = \alpha$."
- Stage: `hilbert-plane`. A near-white ψ arrow sits on the unit circle. Its shadows on both axes are drawn, with squared-shadow bars beside the plane.
- State: the ψ angle is free, driven by scroll from 0° to 90°.
- Links: `\alpha` → shadow on the |↑⟩ axis · `\beta` → shadow on the |↓⟩ axis · `|\alpha|^2` → amber bar · `|\beta|^2` → cobalt bar · `|\alpha|^2+|\beta|^2=1` → unit circle.

**`l1-vectors:b3` [L]**
- Core: "Right is 50/50 along $z$, so both coefficients have size $1/\sqrt2$. Choosing both positive gives $|{\to}\rangle = (|{\uparrow}\rangle + |{\downarrow}\rangle)/\sqrt2$."
- Stage: `hilbert-plane`. ψ settles at 45°: $\tfrac{1}{\sqrt2}\begin{pmatrix}1\\1\end{pmatrix}$ = `KET['+x']`. The bars read 0.5 / 0.5 (`prob(KET['+z'],KET['+x'])`).
- Links: `\tfrac{1}{\sqrt2}` → the two equal shadows.

**`l1-vectors:b4` [L]**
- Core: "Left must be perfectly distinguishable from right, so it is orthogonal to right. That forces the minus sign in $|{\leftarrow}\rangle = (|{\uparrow}\rangle - |{\downarrow}\rangle)/\sqrt2$."
- Second core line: "Measured along $x$, the state $|{\to}\rangle$ now gives + every time."
- Stage: `hilbert-plane`. A second arrow appears at −45° (`KET['-x']`), with a right-angle mark between |→⟩ and |←⟩. The measurement frame then rotates to the {|→⟩, |←⟩} basis: the amber axis lies on |→⟩ and the cobalt axis on |←⟩. ψ = |→⟩ casts a full-length shadow on the amber axis and none on the cobalt axis (`prob(KET['+x'],KET['+x'])` = 1, `prob(KET['+x'],KET['-x'])` = 0).
- Links: the `-` sign → the |↓⟩-shadow flipping below the axis · `\langle{\to}|{\leftarrow}\rangle = 0` → right-angle mark.

**`l1-vectors:b5` [B]**
- Core: "Axler's vector-space rules mention adding and scaling, never arrows in 3D. Susskind notes that $|\psi\rangle$ and $-|\psi\rangle$ describe the same state. We were free to choose positive coefficients."
- Stage: `hilbert-plane`. A ghost arrow appears at $-|{\to}\rangle$ (225°), badge "same physical state".
- State: `samePhysicalState(KET['+x'], vec(-Math.SQRT1_2, -Math.SQRT1_2))` = true.
- Links: `-|\psi\rangle` → ghost arrow.

**`l1-vectors:b6` [C]**
- Core: "In the lab, up and down point opposite ways, 180° apart. In state space they are 90° apart. State-space angles are half of lab angles."
- Stage: split. Left: `lab-r3`, with an arrow for the magnet axis $\hat n$ at θ. Right: `hilbert-plane`, with an arrow for `ketFromBloch(θ,0)` at θ/2.
- State: θ scrubs 0° → 180°.
- Camera: both flat, side by side. This is the same rig as `l1-average:b6`; reuse it.
- Links: `\theta` → lab arc · `\theta/2` → state-space arc · "180°" / "90°" → the end-state arcs.

## 2. Fidelity contracts per stage kind

Format: `fidelity: { exact[], schematic[], misleading[] }` (PLAN [P]). Every item is a student-facing sentence, ready to paste. "Misleading on purpose" means we draw it that way knowingly, and the note says so.

### `lab-r3` — passport "PHYSICAL SPACE ℝ³ · metres (not to scale)"
**Exact**
- The fraction of atoms reaching each spot, and each blocked fraction, is the exact quantum prediction (`benchTheory`). The counts come from genuinely random draws (`fireMany`), so small runs scatter the way real ones do.
- A magnet's tilt is the real angle used in the calculation. For spin ½, the axis you point the magnet along is the same direction the state points on the Bloch sphere.
- The beam flies along y, so real magnets can point anywhere in the x–z plane. Measuring along y would mean turning the whole beam.

**Schematic**
- The field lines are qualitative. A real field that varies along z must also vary sideways ($\nabla\cdot\vec B = 0$), and we leave that out.
- Distances, speeds and spot sizes are not to scale. Real atoms fly at hundreds of m/s, and real plates show two lip-shaped marks, not round dots.
- For silver, the magnetic moment points opposite to the spin. Which spot counts as "up" is therefore a labelling choice. We always paint the + outcome amber.

**Misleading on purpose**
- **The beam glow is not light.** Silver atoms are neutral and invisible in flight. The glow only marks where atoms are, and nothing on stage shines on them.
- We show each atom picking a beam inside the magnet. Strictly, until something blocks or records it, the atom travels down both beams at once.
- State chips like `|+z⟩` float beside a beam as captions. The state is not located in the lab; it lives in state space.
- Bar-magnet arrows appear only in the labelled "classical model" overlay. Real atoms have no arrow you could draw.

### `hilbert-plane` (proposed, see §7 Q1) — passport "STATE SPACE · real slice of ℂ² · not a place"
**Exact**
- For states with real coefficients, the angle between arrows is the true angle between state vectors. At right angles means perfectly distinguishable.
- The squared length of a state's shadow on a basis arrow is exactly that outcome's probability.

**Schematic**
- This is a flat slice of a space with four real dimensions. States with complex coefficients, like $|{+y}\rangle$, cannot appear here.

**Misleading on purpose**
- $|\psi\rangle$ and $-|\psi\rangle$ show up as two different arrows, but they are one physical state. Every state appears twice on the circle.
- The arrows are not directions in the lab. "Right" sits at 45° here but at 90° in the lab: state-space angles are **half** of lab angles.

### `bloch` — passport "STATE SPACE · Bloch sphere · not a place"
**Exact**
- Every pure state is exactly one point on the sphere, and every point is a state. The point's coordinates are the averages $(\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle)$ (`blochVector`).
- For a state at $\vec r$ and a magnet along $\hat n$, $P(+) = \tfrac{1+\hat n\cdot\vec r}{2}$ holds exactly (`probUpAlong`).

**Schematic**
- The axes are labelled $\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle$. They run from −1 to +1 and have no units.

**Misleading on purpose**
- **Bloch angles are twice Hilbert-space angles.** Orthogonal states, like up and down, sit at opposite poles, 180° apart. As vectors they are only 90° apart.
- Global phase is invisible here by design: $|\psi\rangle$ and $e^{i\gamma}|\psi\rangle$ land on the same point. The `hopf` stage shows where that phase went.
- For spin ½, the sphere's directions happen to match lab directions. For photon polarization they do not (§6.3), so the sphere is not physical space in general.

### `bloch-ball` — passport "STATE SPACE · Bloch ball · surface = pure, inside = mixed"
**Exact**
- Points on the surface are pure states. Points inside are mixtures, and the centre is the completely unpolarized beam from the oven.
- The distance $|\vec r|$ from the centre measures how pure the state is. $P(+) = \tfrac{1+\hat n\cdot\vec r}{2}$ still holds exactly inside the ball.

**Schematic**
- An inside point can be made from many different recipes, for example half up plus half down, or half right plus half left. The ball shows only the point, because no measurement can tell those recipes apart.

**Misleading on purpose**
- **Inside does not mean "partly up".** A point halfway to the north pole is a beam, for example ¾ up and ¼ down. Every single atom still reads exactly ±ħ/2.
- The direction of an inside point is not a direction any atom points. It is the average over the beam.

### `hopf` — passport "S³ via stereographic projection · not a place"
**Exact**
- Each circle (fiber) is one physical state together with all its global phases $e^{i\gamma}$. Different states give different circles that never touch, and any two circles link exactly once.
- The small linked Bloch sphere is exact: each fiber sits over exactly one Bloch point.

**Schematic**
- The true space $S^3$ is three-dimensional but curves through four dimensions. We flatten it into ordinary space by stereographic projection.
- **That projection keeps circles as circles but distorts distances.** Fibers near the projection point look huge, and one fiber becomes a straight line. That fiber is not special: the choice of projection point is arbitrary.

**Misleading on purpose**
- Brightness along the fibers only helps you tell them apart. Sliding along a fiber changes the global phase, and **no measurement can detect that change**.

### `operator-space` — passport "OPERATOR SPACE · $A = a_0 I + \vec a\cdot\vec\sigma$ · axes $a_x, a_y, a_z$"
**Exact**
- Every 2×2 Hermitian matrix is exactly one choice of $(a_0, \vec a)$. Its eigenvalues are $a_0 \pm |\vec a|$, and its eigenstates are the spin states along $\pm\hat a$ (`eigenHermitian2`).
- Adding two operators adds their arrows and adds their $a_0$ values.

**Schematic**
- **The space has four dimensions.** We draw $\vec a$ as a 3D arrow and show $a_0$ separately as a gauge, which is the fourth dimension.
- The ghost Bloch sphere around the arrow belongs to state space. It is overlaid only so you can see the eigenstates.

**Misleading on purpose**
- The arrow's length $|\vec a|$ is half the gap between the eigenvalues, not a physical size. For a spin component $S_n = \tfrac{\hbar}{2}\hat n\cdot\vec\sigma$, the arrow does point along the lab axis $\hat n$. For a general operator it is not a lab direction.
- Changing $a_0$ shifts both eigenvalues together and leaves the eigenstates alone. That is why it gets a gauge rather than a direction.

## 3. Glossary (cold layer)

Each gloss is one plain sentence. Any technical word used inside a gloss has its own entry in this table, or is ordinary high-school maths (cosine, square root). "First" is the first L1 unit (or §1 beat) that uses the term. The ids are ready for `glossary.ts`.

| id | Term | Gloss | First |
|---|---|---|---|
| `silver-atom` | silver atom | A silver atom has one unpaired outer electron, and that electron gives the whole atom its spin and its magnetism. | quantized |
| `oven` | oven | A heated box with a small hole, so atoms stream out in a thin beam with no preferred spin direction. | quantized |
| `beam` | beam | A stream of atoms all travelling the same way, one after another. | quantized |
| `magnetic-moment` | magnetic moment $\vec\mu$ | How strongly, and in which direction, something acts like a tiny bar magnet. | quantized |
| `magnetic-field` | magnetic field $\vec B$ | The influence a magnet spreads through the space around it, with a strength and a direction at every point. | quantized (books) |
| `gradient` | gradient $\nabla$ | How fast something, here the field strength, changes as you move from place to place. | quantized (books) |
| `sg-magnet` | Stern–Gerlach magnet, SG$_z$ | A magnet whose field is much stronger near one pole, so it sorts atoms by their spin along one axis (the subscript names the axis). | quantized |
| `deflection` | deflection | How far an atom is pushed sideways from the straight path it would otherwise take. | quantized |
| `plate` | plate | A glass screen at the end of the beam where arriving atoms leave a visible deposit. | quantized |
| `spin` | spin | A built-in property of an atom that makes it act like a tiny magnet, and that always measures as $+\hbar/2$ or $-\hbar/2$ along any axis. | quantized |
| `spin-half` | spin ½ | A spin that gives exactly two possible readings along any axis. | quantized |
| `hbar` | $\hbar$ ("h-bar") | A fixed constant of nature, about $1.05\times10^{-34}$ J·s, that sets the size of quantum effects; spin readings come in units of it. | quantized |
| `S-z` | $S_z$ | The spin measured along the z axis, which only ever reads $+\hbar/2$ or $-\hbar/2$. | quantized |
| `sigma-reading` | $\sigma$, $\sigma_n$ | The spin reading along an axis rescaled to +1 or −1, so $\sigma = 2S/\hbar$. | quantized (books) / average |
| `quantized` | quantized (discrete) | Allowed only certain separate values, like the steps of a staircase rather than a ramp. | quantized |
| `classical` | classical | Following the physics of everyday objects, where quantities can take any value and looking does not disturb anything. | quantized |
| `precession` | precession | The slow wobble of a spinning magnet's axis around the field direction, like a tilted spinning top. | §1 `l1-quantized:b5` |
| `qubit` | qubit | Any quantum system whose measurements have exactly two possible results, like a spin-½ atom. | quantized (books) |
| `hidden-label` | hidden label (hidden variable) | The idea that each atom secretly carries its answers in advance, and a measurement merely reads them off. | quantized |
| `measurement` | measurement | Sending an atom through a device that forces one definite result and records it. | quantized |
| `outcome` | outcome | The single result one measurement gives, here + or −. | quantized |
| `state` | state | Everything that can be known about how a system was prepared, which is enough to predict the odds of every measurement. | quantized |
| `prepare` | prepare | Put a system into a known state, for example by keeping only atoms that came out + along z. | sequential |
| `unpolarized` | unpolarized | Describes a beam with no preferred spin direction, so a magnet along any axis splits it 50/50. | sequential |
| `probability` | probability $P$ | The fraction of many identical trials that give a particular result, a number from 0 to 1. | sequential |
| `conditional-probability` | conditional probability $P(A\mid B)$ | The probability of result A when B is already known; $P(+x\mid{+z})$ reads "chance of + along x, for an atom prepared + along z". | sequential |
| `expectation` | average (expectation value) $\langle\sigma_n\rangle$ | The mean of many readings; with readings of ±1 it equals $P(+) - P(-)$. | average |
| `unit-vector` | unit vector $\hat n$ | An arrow of length 1 that only marks a direction; the hat on the letter signals this. | average |
| `dot-product` | dot product $\hat n\cdot\hat m$ | A number saying how much two directions agree (1 if the same, 0 if perpendicular, −1 if opposite); for unit vectors it is the cosine of the angle between them. | average |
| `half-angle` | half-angle identity | The trigonometry fact that $\tfrac{1+\cos\theta}{2} = \cos^2\tfrac{\theta}{2}$. | average |
| `scatter` | scatter (standard deviation) | How far individual results typically land from their average. | average (books) |
| `proposition` | proposition | A yes-or-no statement about a system, such as "the spin is up". | logic |
| `set` | set | A collection of distinct things, such as the list of all possible classical states. | logic |
| `union` | union $A\cup B$ | Everything that is in A, in B, or in both; it is the set version of "or". | logic (books) |
| `commutative` | commutative | Order does not matter, as in $2+3 = 3+2$ or $A\cup B = B\cup A$. | logic (books) |
| `boolean-logic` | Boolean logic | The everyday rules for combining yes/no statements with and, or, not, in which the order of checking never matters. | logic |
| `vector` | vector | Something you can add to others of its kind and rescale by numbers; arrows are one example but not the only one. | vectors |
| `vector-space` | vector space | A collection of vectors in which every sum and every rescaling is again in the collection. | vectors |
| `inner-product` | inner product $\langle a\vert\psi\rangle$ | A number measuring how much of $\vert\psi\rangle$ lies along $\vert a\rangle$; zero means no overlap at all. | vectors |
| `hilbert-space` | Hilbert space | A vector space that also has an inner product, so lengths and angles make sense; quantum states live in one. | average (clue) / vectors |
| `state-space` | state space | The abstract space whose points are the possible states of a system; it is not a place in the lab. | §1 `l1-vectors` |
| `ket` | ket $\vert\psi\rangle$ | Dirac's notation for a state written as a vector; the label inside the bracket is just a name. | quantized (hints) / vectors |
| `bra` | bra $\langle a\vert$ | The partner of the ket $\vert a\rangle$, used to take inner products: $\langle a\vert$ followed by $\vert\psi\rangle$ gives the number $\langle a\vert\psi\rangle$. | quantized (hints) / vectors |
| `orthogonal` | orthogonal | At right angles; for states it means their inner product is zero. | vectors |
| `distinguishable` | perfectly distinguishable | Describes two states that one well-chosen measurement always tells apart without error. | vectors |
| `basis` | basis | A set of vectors from which every vector in the space can be built, in exactly one way, by rescaling and adding. | vectors |
| `orthonormal-basis` | orthonormal basis | A basis whose vectors all have length 1 and are all at right angles to each other. | vectors |
| `amplitude` | coefficient (amplitude) $\alpha, \beta$ | The numbers that say how much of each basis vector goes into a state. | vectors |
| `normalized` | normalized | Having length 1; for a state this means $\vert\alpha\vert^2 + \vert\beta\vert^2 = 1$, so the probabilities add to 1. | vectors |
| `born-rule` | Born rule | The probability of an outcome is the squared size of the inner product between the outcome's state and the system's state: $P = \vert\langle\text{outcome}\vert\psi\rangle\vert^2$. | vectors |
| `superposition` | superposition | A single state written as a sum of other states, such as $\vert{\to}\rangle = (\vert{\uparrow}\rangle + \vert{\downarrow}\rangle)/\sqrt2$; it is one definite state, not a mixture. | vectors |
| `mixture` | mixture | A beam in which different atoms are in different states, like the oven beam, so it records our uncertainty about which atom is which. | §6.1 |
| `complex-number` | complex number | A number $a + bi$ built from two ordinary numbers $a$ and $b$ and the special number $i$, which satisfies $i^2 = -1$. | vectors (challenge) |
| `magnitude` | size $\vert c\vert$ of a number | How far the number $c$ sits from zero, ignoring its sign or direction; for $c = a + bi$ it is $\sqrt{a^2+b^2}$. | vectors |
| `global-phase` | global phase | A common factor of size 1 (such as −1) that multiplies a whole state; it changes no prediction, so $\vert\psi\rangle$ and $-\vert\psi\rangle$ are the same state. | §1 `l1-vectors:b5` |
| `bloch-sphere` | Bloch sphere | A picture in which every state of a qubit is a point on a ball's surface (full treatment in Lecture 6). | average (clue widget) |
| `polarizer` | polarizer | A filter that passes light vibrating along one direction and blocks light vibrating at right angles to it. | average (books) |
| `errata` | errata | Corrections to mistakes in published notes. | average |

## 4. Review cards (exam layer)

Every number on these cards is already an L1 `Claim` or an engine call. The call is given in brackets wherever it is not.

### `l1-quantized` — Two spots, not a smear
- An SG$_z$ magnet splits an oven beam into **two** spots, 50/50. It never makes a continuous band.
- Classical random moments would give a band, because $\mu_z = \mu\cos\theta_\mu$ takes every value in $[-\mu, \mu]$.
- Keep the + beam and repeat SG$_z$: **100 %** land in +. Repeating a measurement repeats its result.
- The magnet needs a field **gradient**. A uniform field only makes the moment precess; it does not separate the beams.

$$S_z \in \{+\tfrac{\hbar}{2},\,-\tfrac{\hbar}{2}\},\qquad \sigma = \tfrac{2S_z}{\hbar} = \pm1,\qquad P(+z\mid{+z}) = 1$$

**The one trap:** believing two outcomes alone prove something quantum. A coin also has two outcomes. The quantum surprise is in the next unit.

### `l1-sequential` — A new axis erases the old answer
- Measure x on $|{+z}\rangle$ atoms and get ±x at 50/50. There is no "zero" outcome.
- A measurement **prepares** the state that matches its result. After a +x result the atom is in $|{+x}\rangle$.
- z(+) → x(+) → z: **⅛ of oven atoms** end in +, which is ½ of the atoms that reach the plate. Check which denominator the question asks for.
- Remove the middle x magnet and the final z is 100 % + again. The x measurement did the erasing.

$$P(\pm x\mid{+z}) = P(\pm z\mid{+x}) = \tfrac12,\qquad \text{fraction} = \prod_k P(\text{pass}_k) = \tfrac12\cdot\tfrac12\cdot\tfrac12 = \tfrac18$$

**The one trap:** thinking the x magnet "reads" an x value the atom already had. The final z result shows the x magnet rewrote the state.

### `l1-average` — Single atoms are random, averages are classical
- Each atom still reads only ±1. The tilt changes only the **split** between the spots.
- The average of the readings equals the classical projection $\hat n\cdot\hat m$, but only for the average, never for one atom.
- Values: at 45°, $P(+) \approx 0.854$ and $\langle\sigma\rangle \approx 0.707$; at 60°, $P(+) = \tfrac34$; at 90°, $P(+) = \tfrac12$ [`probUpAlong(tiltXZ(Math.PI/2),[0,0,1])` = 0.5].
- The scatter of the mean shrinks like $1/\sqrt{N_{\text{atoms}}}$.
- Errata: the notes put the ¾ split at 45°, but it happens at 60°.

$$\langle\sigma_n\rangle = \hat n\cdot\hat m = \cos\theta,\qquad \langle\sigma_n\rangle = 2P(+)-1,\qquad P(+) = \tfrac{1+\cos\theta}{2} = \cos^2\tfrac{\theta}{2}$$

**The one trap:** mixing up the average with the probability. At 45°, $\cos\theta = 0.707$ is the **average**, and $P(+) = 0.854$ is the **probability**.

### `l1-logic` — When "or" depends on the order
- Test "up OR right" on atoms prepared $|{+z}\rangle$.
- Checking z first: the claim is **never** false. Checking x first: it is false for **¼** of atoms (left, then down).
- Order matters because the first check changes the state before the second one.
- So quantum propositions do not follow set (Boolean) logic.

$$P(\text{false}\mid x\text{ first}) = P(-x\mid{+z})\,P(-z\mid{-x}) = \tfrac12\cdot\tfrac12 = \tfrac14,\qquad P(\text{false}\mid z\text{ first}) = 0$$

**The one trap:** blaming the logic of "or" itself. The assumption that fails is that checking does not disturb.

### `l1-vectors` — States are vectors
- A state is a **unit vector**, and $|{\uparrow}\rangle, |{\downarrow}\rangle$ form an orthonormal basis.
- Probabilities are squared coefficients (the Born rule). Normalized means they add to 1.
- $|{\to}\rangle$ and $|{\leftarrow}\rangle$ differ by a relative sign, and are orthogonal. Orthogonal means perfectly distinguishable.
- An overall sign (global phase) changes nothing, but a relative sign between terms does.
- Angles in state space are **half** of lab angles: up and down are 180° apart in the lab and 90° apart as vectors.

$$|\psi\rangle = \alpha|{\uparrow}\rangle + \beta|{\downarrow}\rangle,\quad |\alpha|^2+|\beta|^2 = 1,\qquad |{\to}\rangle, |{\leftarrow}\rangle = \tfrac{1}{\sqrt2}(|{\uparrow}\rangle \pm |{\downarrow}\rangle),\qquad P = |\langle\text{outcome}|\psi\rangle|^2$$

**The one trap:** writing $|{\downarrow}\rangle = -|{\uparrow}\rangle$ because "down is the opposite of up". In fact $-|{\uparrow}\rangle$ is the **same** state as $|{\uparrow}\rangle$, and $|{\downarrow}\rangle$ is orthogonal to it.

## 5. Symbol-before-use table

**Reading order assumed:** units in array order. Within a unit the order is lecture → books → visual → clues → insight → pitfalls → play (prompt, options, hints, walkthrough). The lecture-level `corrections` box is assumed to render at the top of the page. Line numbers refer to `app/src/content/L1.ts` as of `a3afa5e`.

**Status key:** OK = defined at or before first use · **FLAG** = used before it is defined, or clashes with another meaning · gloss = a glossary tag (§3) is enough.

| Symbol | First use | First definition | Status | Proposed fix |
|---|---|---|---|---|
| $\hbar$ | quantized · lecture.equations (l.49) | none in L1 | gloss | Tag `hbar`. |
| $S_z$ | quantized · lecture.equations (l.49) | none; the summary says only "two deflections" | gloss | Add "$S_z$, the spin along z" to the summary. Tag `S-z`. |
| $\sigma$ (= ±1) | quantized · books/susskind (l.52) | inline, as the ±1 readout | **FLAG** (minor) | State $\sigma = 2S_z/\hbar$ (see `l1-quantized:b5`). |
| $\mu$, $B$, $\nabla$ in $F = \nabla(\mu\cdot B)$ | quantized · books/mit805 (l.54) | $\mu$ only implicitly, in the clue at l.67 | **FLAG** | Write $\vec F = \nabla(\vec\mu\cdot\vec B)$ with arrows. Define $\vec\mu$ in the summary (`l1-quantized:b1`). Tag `magnetic-field`, `gradient`. |
| $\theta$ (moment's angle) | quantized · clue 1 (l.67) | inline | **FLAG** (clash) | Rename to $\theta_\mu$. In `l1-average`, $\theta$ means the angle between $\hat n$ and $\hat m$. |
| SG$_z$, SG$_x$ | quantized · play prompt (l.88) | never | gloss | Tag `sg-magnet`. Add "an SG$_z$ magnet (pointing along z)" to the summary. |
| $\vert{+z}\rangle$ (ket) | quantized · play hint (l.117) | vectors · summary (l.459–461), which uses the $\vert{\uparrow}\rangle$ spelling | **FLAG — use before definition** | Name the ket at first use, as in `l1-quantized:b4`. State the Rosetta line $\vert{\uparrow}\rangle \equiv \vert{+z}\rangle$, $\vert{\to}\rangle \equiv \vert{+x}\rangle$, $\vert{\leftarrow}\rangle \equiv \vert{-x}\rangle$ once, in `l1-vectors:b1`. |
| $\langle{+z}\vert{+z}\rangle$ (bra, inner product) | quantized · play hint (l.118) | vectors · summary (l.459) | **FLAG — use before definition** | In l1-q-repeat, replace the hint with words ("the same question again"), or tag `inner-product` with a forward link. |
| $P(+)$ | quantized · play walkthrough (l.122) | not needed | OK | — |
| $P(\pm x\mid{+z})$ | sequential · lecture.equations (l.139) | never | gloss | Tag `conditional-probability`. |
| $\vert\langle{+x}\vert{+z}\rangle\vert^2$ | sequential · play walkthrough (l.191) | vectors (l.463) | **FLAG — use before definition** | Keep the formula, but add "(the Born rule, unit 5)" and tag `born-rule`. |
| $\vert{\pm x}\rangle$, $\vert{-x}\rangle$ | sequential · play (l.222) / logic clue (l.396) | vectors (l.462, as $\vert{\to}\rangle, \vert{\leftarrow}\rangle$) | **FLAG** | Covered by the Rosetta line above. |
| N·M, $\hat N\cdot\hat M$ | corrections box (l.36) and average · play errata (l.331) | $\hat n, \hat m$ at average summary (l.250) | **FLAG** (clash) | Add "(the notes write N, M for our $\hat n, \hat m$)" at both places. |
| $\hat n$, $\hat m$ | average · summary (l.250) | inline ("prepared along $\hat m$, measured along $\hat n$") | OK | Tag `unit-vector`. |
| $\sigma_n$, $\langle\sigma_n\rangle$ | average · lecture.equations (l.251) | never named ("average deflection") | **FLAG** | Define $\sigma_n$ as the ±1 reading along $\hat n$ (see `l1-average:b2`). Tag `expectation`. |
| $\theta$ (angle between axes) | average · lecture.equations (l.251) | implicit | **FLAG** (clash) | Say "θ, the angle between $\hat n$ and $\hat m$" in the summary. |
| $\langle\cdot\rangle$ (average) vs $\langle a\vert$ (bra) | average (l.251) vs quantized (l.118) | — | **FLAG** (notation clash) | One gloss sentence: "Angle brackets around one symbol mean an average. $\langle a\vert\psi\rangle$ with a bar is an inner product." |
| $N$ in $1/\sqrt N$ | average · books/reif (l.255) | never | **FLAG** (clash with $\hat N$) | Write $1/\sqrt{N_{\text{atoms}}}$. |
| Hilbert space | average · clue 2 (l.274) | vectors · summary (l.459) | **FLAG** (forward reference) | Tag `hilbert-space`. The "(Lecture 6)" pointer can stay. |
| $A$, $B$ (sets) vs order A / order B | logic · books/sets (l.383) vs clues (l.391, l.395) | inline | **FLAG** (clash) | Rename the orders to "z-first" and "x-first" in the clues and in the `logic-order` widget. |
| $A\cup B$ | logic · books/sets (l.383) | inline ("union") | OK | Tag `union`. |
| $\vert\psi\rangle$, $\alpha$, $\beta$ | vectors · summary / equations (l.459–461) | same place | OK | — |
| $\vert{\uparrow}\rangle, \vert{\downarrow}\rangle, \vert{\to}\rangle, \vert{\leftarrow}\rangle$ | vectors · equations (l.461–462) | same place | OK | Add the Rosetta line. |
| $c$, $\vert c\vert = 1$ | vectors · play walkthrough (l.532) | inline | OK | Tag `magnitude`. |
| $i$ in "0.8i" | vectors · play walkthrough (l.549) | L2 | gloss | Tag `complex-number`. It is a forward reference by design. |
| **New in §1** $\theta_\mu$, $\sigma = 2S_z/\hbar$, $N_{\text{atoms}}$, $-\vert\psi\rangle$ | §1 beats | defined in the same beat | OK | — |
| **New in §1** $\vert{+n}\rangle$ | `l1-average:b6` | defined in the same beat (fixed while drafting) | OK | — |

**Counts:** 14 FLAG rows in current L1.ts:
- 5 used before they are defined: the ket, the bra/inner product, the Born-rule form, the $\vert{\pm x}\rangle$ kets, and Hilbert space.
- 6 notation clashes: $\theta$ twice, N·M, $\langle\cdot\rangle$, $N$, and A/B.
- 3 undefined at first use: $\sigma$, $\vec\mu/\vec B/\nabla$, and $\sigma_n$.

The beats in §1 introduce no new flags.

## 6. New concept content enabled by the new spaces

All numeric answers below were cross-checked with an independent numpy one-liner while drafting. `apply` and `vec` come from `linalg.ts`; every other function named here is from `spin.ts` or `sg.ts`. They should become `Claim`s together with numpy fixtures in `pipeline/make_fixtures.py`.

### 6.1 Superposition vs mixture: $|{+x}\rangle$ vs the oven beam
**Home: L6** (`bloch-ball`, next to Townsend §5.7). **Teaser in L1:** one clue beat in `l1-vectors`, using the lab only and no new maths. The teaser matters because "$|{\to}\rangle$ is half up, half down" is the misconception L1 itself invites.

**L1 teaser clue** (`l1-vectors`, after b4): "Is $|{\to}\rangle$ just a beam that is half up atoms and half down atoms? Along $z$ you cannot tell. Along $x$, $|{\to}\rangle$ gives + every time, but the half-and-half beam splits 50/50." Stage: `lab-r3`, beats 1–2 below.

**L6 beats**
1. `lab-r3`, two sources side by side: the oven, and an SG$_x$-prepared $|{+x}\rangle$ beam. Both go into SG$_z$. Result: 50/50 for both (`benchTheory({source:'oven',axes:['z'],keep:[]})` and `benchTheory({source:'+x',axes:['z'],keep:[]})` → 0.5/0.5). Core: "Along $z$ the two beams look identical."
2. Same rig, both magnets rotate to x. Oven → 0.5/0.5; $|{+x}\rangle$ → 1/0. Core: "Along $x$ they differ completely. One is a single definite state; the other is a mix of different states."
3. `bloch-ball`. $|{+x}\rangle$ sits on the surface at $(1,0,0)$ (`blochVector(KET['+x'])`). The oven sits at the centre. A measurement axis $\hat n$ sweeps the x–z great circle. Readout: $P(+) = \tfrac{1+\hat n\cdot\vec r}{2}$. It traces $\cos^2$ for $|{+x}\rangle$ and stays flat at ½ for the oven.
4. `bloch-ball`, "recipes". Half up + half down lands at the centre. Half right + half left also lands at the centre. Core: "Different recipes, same point. No experiment can tell them apart, so the ball does not try."
5. `bloch-ball`, mixture vs superposition of the **same two ingredients**. The mixture ½ $|{+z}\rangle$ + ½ $|{+x}\rangle$ sits inside, at $(0.5, 0, 0.5)$ with $|\vec r| \approx 0.707$. The superposition $\propto |{+z}\rangle + |{+x}\rangle$ sits on the surface at 45°. Core: "Adding amplitudes makes a new pure state. Mixing beams only averages the probabilities."

**Draft challenges**
- *Core — "One magnet, two beams."* You get either an all-$|{+x}\rangle$ beam or the oven beam. You may use one SG magnet in the x–z plane. Along x, what fraction goes + for each beam? **Answer:** 1 and 0.5, from `benchTheory({source:'+x',axes:['x'],keep:[]}).plus` = 1 and `benchTheory({source:'oven',axes:['x'],keep:[]}).plus` = 0.5. As a numeric item, ask for the difference: **0.5**.
- *Stretch — "Can a mixture ever be certain?"* A beam is half $|{+z}\rangle$ atoms and half $|{+x}\rangle$ atoms. What is the largest $P(+)$ any magnet in the x–z plane can give? **Answer: 0.8536**, at a 45° tilt: `0.5*probUpAlong(tiltXZ(Math.PI/4),[0,0,1]) + 0.5*probUpAlong(tiltXZ(Math.PI/4),[1,0,0])`. Equivalently, $(1+|\vec r|)/2$ with $|\vec r| = 1/\sqrt2$. The trap option is 1. That value belongs to the *superposition*, whose `blochVector` is $(0.707, 0, 0.707)$ with length 1.

### 6.2 Global phase as a Hopf fiber
**Home: L6.** That is where the Bloch sphere and $R_z(\phi) = \mathrm{diag}(e^{-i\phi/2}, e^{i\phi/2})$ appear (`spin.ts` header). **Hooks:** L1 `l1-vectors:b5` already shows the real-number shadow of this idea ($\psi$ vs $-\psi$). L2's phase-dial should call the global/relative split by name and link forward.

**Beats**
1. `bloch`. The state $|{+x}\rangle$. Scroll multiplies it by $e^{i\gamma}$ as γ runs from 0 to 2π. The Bloch point does not move (`blochVector` = $(1,0,0)$ for every γ). Core: "An overall phase changes the vector, but not one prediction."
2. `hopf`. Lift to $S^3$, the unit vectors of ℂ². The set $\{e^{i\gamma}|{+x}\rangle\}$ is a circle (a fiber). A marker slides along it while the linked mini-Bloch point stays fixed. Core: "Each physical state is a whole circle of vectors."
3. `hopf`. Now change the *relative* phase φ in `ketFromBloch(Math.PI/2, φ)`. The Bloch point runs round the equator from $|{+x}\rangle$ to $|{+y}\rangle$. The highlighted fiber moves to a different circle, and neighbouring fibers visibly link. Core: "Relative phase moves you to a new circle. That is a new state."
4. `hopf`. Rotate with `Rz(φ)` as φ runs from 0 to 2π. The Bloch point makes one full lap. The marker comes back to the *same fiber* but the *opposite side*: $R_z(2\pi)|{+x}\rangle = -|{+x}\rangle$. It needs 4π to close. Core: "A full turn in space is only half a turn around the fiber." This sets up the 720° belt-trick opener from PLAN [D].
5. `hopf` + DOM readout. `prob(a, e^{iγ}ψ)` stays constant for every outcome $a$ as the marker slides. Core: "No measurement can see where on the fiber you are."

**Draft challenges**
- *Core — "Did the state change?"* Compute $\langle{+x}|R_z(2\pi)|{+x}\rangle$. **Answer: −1**, from `expectation(Rz(2*Math.PI), KET['+x'])`. That function returns the real part, and here the value is exactly −1 because $R_z(2\pi) = -I$. Follow-up: what is $P(+x)$ afterwards? **1**, from `prob(KET['+x'], apply(Rz(2*Math.PI), KET['+x']))`. The trap is to conclude that −1 means a different state.
- *Stretch — "How far to truly return?"* Find the smallest rotation angle (degrees) with $R_z(\phi)|\psi\rangle = |\psi\rangle$ exactly, sign included. **Answer: 720**, from `expectation(Rz(4*Math.PI), KET['+x'])` = +1 while `Rz(2*Math.PI)` gives −1.
- *Warm-up — "Ignore the costume."* For $|\psi\rangle = e^{i\pi/3}\tfrac{1}{\sqrt2}(1, i)^{\mathsf T}$, find $\langle\sigma_y\rangle$. **Answer: 1**, from `blochVector(psi)[1]`: it is $|{+y}\rangle$ wearing a global phase.

### 6.3 Photon polarization: the counterexample to "Bloch sphere = physical space"
**Home: L6** (the Bloch-sphere introduction). **Required fix in L1 now:** two L1 blurbs call light and spin "the same cos² rule": `watch[2]` at l.30 and `l1-average` books/3b1b at l.256. For light, the rule uses the *full* polarizer angle. For spin, it uses *half* the magnet angle. Left as is, those blurbs plant exactly the misconception this section exists to remove. Suggested rewording for l.256: "Photons through tilted polarizers obey $\cos^2$ of the **full** polarizer angle; spin obeys $\cos^2$ of **half** the magnet angle. Both are $\cos^2$ of the angle between state vectors."

**Beats**
1. `lab-r3` (an optical-bench variant: two polarizers, where the glow *is* light here, and the passport says so). Vertical polarizer, then one at angle χ. Transmission is $\cos^2\chi$, and it is 0 at χ = 90°. Core: "Crossed polarizers block everything at 90°."
2. `lab-r3` split with the SG bench: $|{+z}\rangle$ into a magnet at θ; the + fraction is $\cos^2(\theta/2)$. At θ = 90° it is ½; it reaches 0 only at 180°. Core: "Spin needs 180° to be fully opposite. Light needs only 90°."
3. `hilbert-plane`, two panels. Photon: |H⟩ and |V⟩ are 90° apart, and so are the polarizer axes in the lab. Spin: |↑⟩ and |↓⟩ are 90° apart, but the magnets are 180° apart. Core: "In state space both pairs are perpendicular. Only the lab angles differ."
4. `bloch`, labelled as the Poincaré sphere for light. H and V sit at opposite poles. The diagonal polarizations D/A sit on the equator along ±x, and the circular polarizations R/L sit on the equator along ±y ($|R\rangle \propto |H\rangle + i|V\rangle$ plays the role of $|{+y}\rangle$). A physical polarizer angle χ appears as a sphere angle 2χ. Core: "For light, the sphere doubles lab angles. So the sphere maps states, not space."
5. `bloch`, callback. Core: "For spin ½, sphere directions happen to match lab directions. That is a special fact about spin, not a rule about the sphere."

**Draft challenges**
- *Core — "Same tilt, different physics."* Vertical light meets a polarizer at 30°. What fraction passes? **Answer: 0.75** = `probUpAlong(tiltXZ(2*Math.PI/6),[0,0,1])`, i.e. photon angle χ sits at Bloch angle 2χ. Companion question: $|{+z}\rangle$ atoms meet an SG magnet at 30°; what fraction goes +? **Answer: 0.9330** = `probUpAlong(tiltXZ(Math.PI/6),[0,0,1])`.
- *Stretch — "Fully blocked."* At what lab angle (degrees) is light from a vertical polarizer completely blocked? **90**. At what SG tilt do $|{+z}\rangle$ atoms never land in +? **180**. Both come from `probUpAlong(tiltXZ(Math.PI),[0,0,1])` = 0, with χ = 90° mapping to a Bloch angle of 180°. Numeric item: the ratio of the two angles, **2**.

## 7. Conceptual questions for the user

**Q1. Should there be a sixth stage kind, `hilbert-plane` (a real 2D slice of ℂ²)?**
None of the five locked stage kinds can show that "perfectly distinguishable = orthogonal". `bloch` draws up and down as *opposite* points, which contradicts what `l1-vectors` is teaching. The half-angle bridge beats (`l1-average:b6`, `l1-vectors:b6`) also need a space where angles are Hilbert angles.
*Recommendation:* add `hilbert-plane` as a light 2D stage. It is exact for every L1 state, since all L1 coefficients are real, and it can reuse the `projector` widget's maths. It gets the fidelity note from §2. Fallback: mount the existing `projector` widget in the stage slot for `l1-vectors`.

**Q2. How far beyond the lecture should the Bloch ball and mixtures go?**
The lecture notes never define mixed states. That material comes from Townsend §5.7. Teaching it risks students thinking it is examinable lecture content.
*Recommendation:* put a lab-only teaser clue in L1 (§6.1), with no new maths and not using the word "density". Give the full `bloch-ball` treatment in L6, with every beat tagged **[B] books add** and marked "beyond the lecture".

**Q3. How honest should the lab picture be about "which beam"?**
Strictly, after the magnet an atom travels down both beams at once until something blocks or detects it. The lab stage (and every textbook figure) shows it picking one beam inside the magnet.
*Recommendation:* keep the simple picture in the L1 core text. State the truth only in the `lab-r3` fidelity note (§2, "misleading on purpose"). Return to it in L3, where measurement and state update are formalized. Saying it in L1's core text would muddy the unit's main lesson that measurement prepares a state.
