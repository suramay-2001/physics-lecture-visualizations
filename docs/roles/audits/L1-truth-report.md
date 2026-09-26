# L1 truth report: picture ↔ text ↔ numbers (P, Round 3)

**Status:** template. P filled columns 1–4 from `app/src/content/L1.story.ts` (this branch), D's
`docs/roles/scene-specs/L1.md`, and the readout code in `stage/scenes/LabR3Scene.tsx` /
`HilbertPlaneScene.tsx` (main @ 6faffe2). Column 5 is **pending visual**. It gets filled once D's final
scenes land (Round-3 #11), from screenshots of every beat.

## How to fill the status column

1. Shoot every beat at its hold centre at 1000 × 640 and 1440 × 900. For clue beats, shoot the question
   and the reveal.
2. **Picture:** everything in column 3 is visible, and nothing on screen asserts more than the text says.
   A classical beat shows no quantum result. A question picture does not show the reveal.
3. **Numbers:** every engine number on screen (Born %, `P(+)`, `⟨σₙ⟩`, `|α|²`, fractions, band) equals the
   claim value in column 4 to its shown precision. A sample count may differ from its Born value by at
   most 3·√(p(1−p)/N). At N = 1400 and p = ½ that is ±4.0 points; at p ∈ {0, 1} it is exactly 0.
4. **Deposit** agrees with the current beat's readouts (Round-3 #8). An earlier run is cleared, or dimmed
   and labelled "previous run".
5. Write `ok`, `MISMATCH → owner: what`, or `not built → owner`.

## Beats (31)

Terms are given as `term → anchor`. "Runtime" lists what the scene draws on its own; those numbers are
engine-computed, not authored.

| beat | what the text claims | what the picture must show | numbers shown (claim keys) | status |
|---|---|---|---|---|
| l1-quantized:b1 | Atoms leave the oven as a beam. Each carries a moment μ⃗, like a small bar magnet. Near the sharp pole the field is stronger, so the magnet pushes. | L-EST: oven → SG_z → plate. The beam stops at the magnet exit, because b2 asks the classical question first. W adds `beamTo`, the integrator sets `'gap'`. The plate stays empty. Dense field lines at the knife edge (`edge → knife-edge`). A μ⃗ arrow on one atom (`mu → atom-moment`). | Text: none. Runtime: no ± readout (no atom reaches the plate). | pending visual |
| l1-quantized:b2 | **Classical prediction.** Random moments give μ_z = μ cos θ_μ anywhere from −μ to +μ, so the plate would show one continuous band. Caption: "classical prediction: one continuous band — not what happens". | L-OTS: atoms drawn as bar-magnet capsules, deflected continuously. A frozen specimen with the θ_μ arc (`thmu → angle-arc`) and the dashed μ cos θ_μ drop-line (`mucos → drop-line`). A dashed ghost band from −μ to +μ (`band → ghost-band`). No spots, no deposit. | Text: none. Runtime must show **no** `+ n · − m`, **no** `…% + · Born …%`, **no** ±ħ/2 spot labels (#5). | pending visual. At 066b3de the judge saw "+ 50.0% · − 50.0%". |
| l1-quantized:b3 | Two spots and nothing between them. Every atom is deflected up or down by the same amount. S_z is only ±ħ/2. Caption: ½ in each spot; quantized. | L-PLATE: the quantum split. The deposit grows 0 → 1400 at 50/50. Spot labels +ħ/2 and −ħ/2 (`plus`, `minus`). The gradient arrow (`sz → gradient-arrow`). The ghost band stays, but it must read as a dashed *prediction*: it spans the gap the text calls empty. | ½ and ½ (`ovenZPlus`, `ovenZMinus`). Runtime: `+ n · − m`, `Born 50.0%`. | pending visual |
| l1-quantized:b4 | Block the down beam and send the up beam through a second z magnet. Every atom goes up again. The state is named \|+z⟩, a ket; the blocked beam would be \|−z⟩. Caption: second plate 100 % in +. | L-TRACK: the stop on magnet 1's − exit (`stop → beam-stop`). Magnet 2 slides in. The new plate has one amber + spot. b3's two-spot deposit is cleared, or dimmed and labelled (#8). Chip \|+z⟩ (`chip → chip-1`). Stop tag `block · ½`. | 100 % (`repeatZPlate`). `block · ½` (unit claim `ovenZMinus`). Runtime: `+ n · − 0`, `Born 100.0%`. | pending visual. #8 is open: the judge saw b3's cobalt deposit here. |
| l1-quantized:b5a | Our voice: in a uniform field B⃗ a moment only precesses, and the beam goes straight. A push needs a gradient ∇. Zwiebach (MIT 8.05) writes the force as F⃗ = ∇(μ⃗·B⃗). The sharp pole makes the gradient large. | Cut to L-SIDE. Flat, parallel poles and parallel field lines (`force → streamlines`). **One** central spot. Precession glints. | Text: none. Runtime: no ± readout (uniform field). | pending visual |
| l1-quantized:b5b | Susskind's ideal box reads σ = ±1, where σ = 2S_z/ħ. Caption: windows σ = +1 and σ = −1. | L-SIDE: the magnet becomes a matte box (`box → box-readout`). Windows σ = +1 / −1. Spots labelled +1 / −1, not ±ħ/2. | The ±1 are definitions, not results. Runtime: `Born 50.0%` (`ovenZPlus`). | pending visual |
| l1-quantized:b6 | Q: a coin also has two outcomes; could each atom carry a hidden up/down label? R: so far, yes. A hidden label explains the two spots and the repeat. Two outcomes alone are not quantum. | Q: cut to L-WIDE, the z(+) → z bench, plate all +. R: same bench, `hidden-label` model. ↑ and ↓ tags on sampled atoms, where the tag is the atom's outcome at magnet 1. ↓ atoms end at the stop; ↑ atoms reach the + spot. | Text: none. Runtime: `+ n · − 0`, `Born 100.0%` (`repeatZPlate`). | pending visual |
| l1-sequential:b1 | Keep the up beam and turn magnet 2 by 90° about the beam, so it measures x. A stored "up" arrow has no x part, so classically nothing deflects. Caption: the dashed ring is the classical expectation. | L-END on magnet 2 as it turns 0 → 90° (`m2 → magnet-2`). Protractor, `θ = …°`, chip \|+z⟩, arrow name z → n̂ → x. A dashed ring at the undeflected point, labelled as the classical expectation. The ring is **not built** (D §7). The real ±x split must not be asserted before b2 (see below). | θ is an input. Runtime: θ only. No ± readout, since the cleared deposit gives count 0. | pending visual (ring not built) |
| l1-sequential:b2 | Instead every atom goes right (+x) or left (−x), half each, none in the middle. P(±x \| +z) = ½. Caption: right 50 % · left 50 %. | L-PLATE: the deposit grows at 50/50. The spots sit **left and right** (split along x, not z): + (amber) on the right, − (cobalt) on the left (`right → spot-plus`, `left → spot-minus`). Nothing between them. | ½ and 50 % × 2 (`pXgivenZ`). Runtime: `Born 50.0%`. | pending visual |
| l1-sequential:b3 | Keep the right beam and measure x again: every atom goes right. The state is named \|+x⟩. Caption: beam 1 → ½ → ¼ of the oven; last plate 100 % right. | L-TRACK: the stop on magnet 2's left exit. Magnet 3 slides in. One amber spot on the right. Chips \|+z⟩, \|+x⟩ (`chip → chip-2`). Segment fractions 1 · ½ · ¼. | ½ (`zxAlive1`), ¼ (`zxxAlive2`), 100 % (`zxxPlate`). Runtime: spot labels `+ ¼` / `− 0` are fractions of the **oven**; the caption's 100 % is of the **plate**. Also `Born 100.0%`. | pending visual (two denominators) |
| l1-sequential:b4 | Turn the last magnet back to z. It is 50/50 again: P(±z \| +x) = ½. The earlier "up" is gone. Caption: 1 → ½ → ¼ → ⅛ + ⅛ of the oven. | L-WIDE: the last magnet turns from x back to z (`last → magnet-3`). Two spots at ⅛ / ⅛. Fractions on segments and spots. The previous one-spot deposit is cleared or labelled (#8). | 50/50 and ½ (`pZgivenX`). ½, ¼, ⅛, ⅛ (`zxzAlive1`, `zxzAlive2`, `zxzPlus`, `zxzMinus`). Runtime: `+ ⅛`, `− ⅛`, `Born 50.0%`. | pending visual |
| l1-sequential:b5 | Susskind: experiments are never gentle. An x measurement prepares each kept atom in \|+x⟩, and that erases the z answer. Caption: one tracked atom; its label changes at the magnet exit. | Cut to L-DETAIL at magnet 1's exit. One tracked atom at full brightness, the rest at 25 % (`atom → tracked-atom`). Its chip swaps \|+z⟩ → \|+x⟩ at the x magnet's exit (`chip → chip-2`). The swap is **not built** (D §7). The tracked atom must be **kept** at both stops, because a blocked atom shows no swap. | Text: none. | pending visual (swap not built) |
| l1-sequential:b6 | Q: take the middle x magnet out; what does the last z magnet do? R: every plate atom lands in + (100 %). The middle measurement erased the answer, not the time or the distance travelled. | Q: the zxz bench with fractions (b4's picture). R: the x magnet slides out, and the plate shows one amber spot. For "not the distance" to be visible, the last magnet and the plate should stay put, leaving an empty slot. Today they re-seat (`lab/layout.ts`). | R: 100 % (`repeatZPlate`). Runtime: `+ ½` / `− 0` (oven fractions), `Born 100.0%`. | pending visual (check the re-seat) |
| l1-average:b1 | Atoms are prepared in \|+z⟩. Tilt the magnet by θ from z toward x. Each atom still lands in just the + spot or the − spot. Caption: θ sweeps 0° → 180°. | L-END: the greyed +z prep. The magnet, the split and the rolling deposit turn together. Always exactly two spots, never a smear. Protractor (`theta → tilt-arc`), `θ = …°`. | θ is an input. Runtime: `+ n · − m` and `Born …%` = cos²(θ/2), live. | pending visual |
| l1-average:b2 | σ_n = ±1 along n̂, in units of ħ/2. m̂ is the preparation axis, here ẑ. ⟨σ_n⟩ = n̂·m̂ = cos θ. A classical arrow would give cos θ for every atom; quantum atoms give it only on average. | L-PLATE: θ sweeps 180 → 0. Silver n̂ and m̂ arrows at the plate centre (`n → axis-n`, `m → axis-m`, swapped in #12). A dashed drop-line from m̂ to n̂ (`dot → drop-line`). A centroid tick at cos θ along n̂ (`avg → centroid`). Atoms still land **only** at the two spots. | Text: none. Runtime: `⟨σₙ⟩ = …` (= cos θ) and θ. | pending visual |
| l1-average:b3 | The readings are ±1, so their average is 2P(+) − 1. Hence P(+) = (1 + cos θ)/2 = cos²(θ/2). Caption: at 45°, P(+) ≈ 0.854 and the average ≈ 0.707. | L-PLATE: θ settles at 45°. A persistent deposit. The fill bar at 0.854 (`p → fill-bar`) and the centroid. | 0.854 (`p45`), 0.707 (`avg45`). Runtime: `P(+) = 0.854 · 2P(+) − 1 = 0.707`, `Born 85.4%`. | pending visual |
| l1-average:b4 | A single reading is unpredictable, but the mean of many is not. The scatter of the mean of N readings shrinks like 1/√N. Caption: 10, 100, 1000 atoms give bands ±0.224, ±0.071, ±0.022. | L-PLATE-C: N = 10, then 100, then 1000, one per third of the hold. A ±σ/√N band around the centroid that shrinks with N (`band → sigma-band`). The band is **not built**: it needs W's `sigmaBand?` (D §7, #10–#11). | 0.224, 0.071, 0.022 (`band10`, `band100`, `band1000`). Runtime: counts per batch, `Born 85.4%`. The band half-width must equal the caption. | pending visual (band not built) |
| l1-average:b5 | Q: the notes say ¾ go up-right at 45°; does the rule agree? R: no. The rule gives cos² 22.5° ≈ 0.854 at 45°. A 3 : 1 split needs cos θ = ½, which is θ = 60°. | Q: θ = 45° with the fill bar at 0.854. This is shown on purpose, so the reader can compare it with ¾. R: θ sweeps 45° → 60° and the fill bar goes 0.854 → 0.750. | Q: ¾ (`p60`). R: 0.854 (`p45`), ½ (`cos60`), 60° (`theta34`). Runtime: `P(+) = 0.854 → 0.750`. | pending visual |
| l1-average:b6 | Q: why a half angle? R: \|+n⟩ reads + along n̂. In state space its angle to \|+z⟩ is θ/2, its shadow on \|+z⟩ is cos(θ/2), and the square is P(+). | Q: L-END, sweep 0 → 180°, fill bar. R: a split view. Top: the lab θ sweep. Bottom: ψ at exactly half the top's θ, the θ/2 arc (`half → angle-arc`), the shadow on \|+z⟩ with length cos(θ/2) (`shadow → shadow-1`), and a bar equal to P(+). | Runtime: θ at the top; plane bars at the bottom. The plane labels them `\|α\|²`, `\|β\|²`, but α and β are only defined later, in l1-vectors:b2 (see open item 5). | pending visual |
| l1-logic:b1 | Classical states form a set. "Up OR right" is true or false, and either order of checking gives the same answer. | L-3Q: two benches, z-first above and x-first below, each with a greyed +z prep. No atoms (flow off). Callouts z-first / x-first. | none | pending visual |
| l1-logic:b2 | z-first: every \|+z⟩ atom reads up, so the claim is already true, whatever x says. Caption: z-first false 0 %. | Only the z-first bench should fire; `fires: false` on bench B is not set yet (open item 3). A truth tally of true 100 % / false 0 % (`ztrue → tally-true`). The tally is **not built**: it needs `tallies?`. | 0 % (`falseZFirst`). Runtime today: `z-first · + n · − m` and `Born 50.0%`. That is the x split, not the truth value, so it reads as a contradiction of "false 0 %". | pending visual |
| l1-logic:b3 | x-first: half the atoms read left and become \|−x⟩. Half of those then read down. The claim is false for ¼. Caption: true 75 % · false 25 %. | Only the x-first bench fires. The left branch splits again at z, and the right output lands on its own small plate. Chip \|−x⟩ (`chip → chip-1`). A dashed false ring on (left, down) (`false → false-ring`, **not built**). Tallies of 75 / 25. | ¼ and 25 % (`falseXFirst`), 75 % (`trueXFirst`). Runtime today: `x-first · …`, `Born 50.0%` (the z split of the left branch). That conflicts with 75/25. | pending visual |
| l1-logic:b4 | For sets, "A or B" is A ∪ B, and looking never changes the members, so the order cannot matter. Susskind finds that for spins it does. Caption: false z-first 0 % · x-first 25 %. | L-3Q: flow off, benches dimmed to 50 %. Two tally bars at 0 % and 25 % (`union → tally-bar-1`, **not built**). | 0 % (`falseZFirst`), 25 % (`falseXFirst`). | pending visual (bars not built) |
| l1-logic:b5 | Q: classically, looking does not disturb. Which step of x-first breaks that? R (tightened this round): for the atoms that read left, the x test turns \|+z⟩ into \|−x⟩ before z is read. The failing assumption is that checking does not disturb. This does not rule out every hidden-answer model; Bell comes later. | Q: cut to L-DETAIL, flow off. R: one tracked atom on the x-first bench that reads **left**, so its chip shows \|−x⟩ (`chip → chip-1`). The chip swap at the x magnet's exit is **not built**. | none | pending visual |
| l1-vectors:b1 | A z magnet always tells up from down, so the two are perfectly distinguishable. \|+z⟩ and \|−z⟩ are drawn as perpendicular unit arrows in state space. Caption: the notation map. | Inset layout. Main: the plane, with amber \|+z⟩ and cobalt \|−z⟩ at 90° and a right-angle mark (`up → basis-1`, `down → basis-2`). Inset: the lab, oven → SG_z, two spots. The axis labels read "\|↑⟩ = \|+z⟩", which adds a notation the caption does not map (open item 4). | none | pending visual |
| l1-vectors:b2 | \|ψ⟩ = α\|+z⟩ + β\|−z⟩. \|α\|² and \|β\|² are the outcome probabilities and add to 1, so the length is 1. ⟨+z\|ψ⟩ = α. | ψ sweeps 0 → 90° on the unit circle. Signed shadows α (amber) and β (cobalt) (`alpha → shadow-1`, `beta → shadow-2`). Bars \|α\|² and \|β\|² that always add to 1 (`a2 → bar-1`, `b2 → bar-2`). | Runtime: `\|α\|² = …`, `\|β\|² = …` | pending visual |
| l1-vectors:b3 | \|+x⟩ gives up and down half the time, so both coefficients have size 1/√2. Choosing both positive is a convention: \|+x⟩ = (\|+z⟩ + \|−z⟩)/√2. Caption: bars 0.50 / 0.50. | ψ at 45°. 1/√2 ticks on both axes (`amp → shadow-1`). Equal bars. The ψ label should read \|+x⟩; today it reads `\|→⟩`. | 0.50 × 2 (`pUpRight`). 1/√2 is symbolic (`ampUpRight`). Runtime: `\|α\|² = 0.500`, `\|β\|² = 0.500`. | pending visual |
| l1-vectors:b4 | \|−x⟩ must be orthogonal to \|+x⟩. That forces the minus sign: \|−x⟩ = (\|+z⟩ − \|−z⟩)/√2. Measured along x, \|+x⟩ gives + every time. Caption: x-basis bars 1.00 / 0.00. | The frame turns to the x basis, 45°. ψ = \|+x⟩ lies along the first x axis. \|−x⟩ sits at −45° with a right-angle mark (`ra → right-angle`). Bars 1 / 0. The labels should read \|±x⟩; today they read `\|→⟩`, `\|←⟩`. | 1.00 (`pRightRight`), 0.00 (`pRightLeft`). Runtime: `\|α\|² = 1.000`, `\|β\|² = 0.000`. **Conflict:** by b2, α is the \|+z⟩ coefficient, so \|α\|² = 0.5 here (open item 5). | pending visual |
| l1-vectors:b5 | Axler's vector-space rules mention adding and scaling, not arrows in 3D. Susskind: \|ψ⟩ and −\|ψ⟩ are the same state. A relative sign is what separates \|+x⟩ from \|−x⟩. | ψ = \|+x⟩ at 45°. A dashed ghost −\|+x⟩ at 225° (`ghost → ghost`) with the badge "same physical state". The ghost label should read −\|+x⟩; today it reads `−\|→⟩`. | none (`negSame` is a true/false claim) | pending visual |
| l1-vectors:b6 | Q: in the lab, up and down are 180° apart; how far apart are \|±z⟩ in state space? R: 90°. Every state-space angle is half the lab angle, which is where the θ/2 in cos²(θ/2) comes from. | Q: split view. Top: the lab θ sweeps 0 → 180°. Bottom: ψ = \|+z⟩, static. R: the bottom ψ sweeps at θ/2 with an arc (`half → angle-arc`). At lab 180° it reaches \|−z⟩, at 90° in the plane. | θ and θ/2 are angles. | pending visual |
| l1-vectors:b7 | Q (beyond the lecture): is \|+x⟩ just half up and half down? Along z you cannot tell: both split 50/50. R: along x, \|+x⟩ gives + every time (100 %), while the oven mixture still splits 50/50. In the Bloch ball, \|+x⟩ sits on the surface and the oven beam at the centre. | Q: L-3Q with two benches (A: +x → z; B: oven → z), both plates at 50/50. R: split view. Top: both benches go into x; A gives one + spot, B two spots. Bottom: the Bloch ball with the point on the surface and the oven at the centre (`centre → center`). Today the ball is a W0 placeholder. | Q: 50/50 (`plusXAlongZ`, `ovenZPlus`). R: 100 % (`plusXAlongX`), 50/50 (`ovenAlongX`). Runtime (Q): LabR3Scene prefixes the readouts "z-first · / x-first ·" on **any** two-bench stage, which is wrong here (open item 1). | pending visual |

## Classical-model beats (#5)

Beats whose lab stage cannot show a split: `model: 'classical'` or `field: 'uniform'`. The content side is
now gated by `app/src/content/models.test.ts`. On these stages the text or caption says "classical"; it never
claims a split (two spots, ±ħ/2, ±1, halves, 50/50, %, fractions, "quantized", "only ever"); and there are
no claims and no `readouts`. The file includes mutation and non-vacuity guards.

| beat | stage | text/caption say so? | on-screen numbers that would contradict the text | content |
|---|---|---|---|---|
| l1-quantized:b2 | `model: 'classical'` | Yes. "Classically, … would show one continuous band"; caption "classical prediction: one continuous band — not what happens" (reworded this round). | Any `+ n · − m`, any `…% + · Born …%`, any ±ħ/2 spot label. The judge saw "+ 50.0% · − 50.0%" at 066b3de. LabR3Scene now gates the tally on `wClassical < 0.5`. Check the b1 → b2 and b2 → b3 windows, and the spot labels. | ok (lint) |
| l1-quantized:b5a | `field: 'uniform'` | Caption: "uniform field — no push, one spot". | Any ± tally, or two spots. LabR3Scene gates on `gradient > 0.5`. | ok (lint) |

Beats with a quantum stage whose text states a classical expectation:

| beat | classical sentence | risk | recommendation |
|---|---|---|---|
| l1-sequential:b1 | "classically nothing should deflect" | Real atoms stream through the turning magnet, so the ±x split beams show b2's answer early. No numbers are shown (the deposit is cleared). | Treat it like l1-quantized:b1: `beamTo: 'gap'` (integrator, once W's field lands). Or make the dashed ring, labelled "classical expectation", the only plate content. |
| l1-average:b2 | "A classical arrow would give this projection for every atom" | None. ⟨σₙ⟩ = cos θ is what the text says quantum atoms give on average. | — |
| l1-logic:b1, l1-logic:b5 (Q) | set logic; "looking does not disturb" | None. Flow is off, so no numbers are shown. | — |

## Known open mismatches (content side, before visuals)

1. **W/D, LabR3Scene bench readout prefix.** `z-first · / x-first ·` is hard-coded whenever
   `benchCount === 2`, so l1-vectors:b7 (Q) mislabels the +x beam and the oven beam. The prefix should come
   from the stage: l1-logic → z-first / x-first; l1-vectors:b7 → "+x beam" / "oven".
2. **W/D, l1-logic b2–b4 per-bench `Born %`.** It reports the last magnet's split, 50 %. The captions give
   truth values: 0 %, then 75 / 25 %. Replace it with the engine `tallies?` (D4, #10–#11), or suppress it
   on truth-table beats.
3. **P + D, `fires` on l1-logic:b2 / b3.** The interface-#9 plan is `fires: false` on bench B in b2 and on
   bench A in b3. The resolver supports it, but it is not set. P held back this round, so that a
   half-firing pair cannot leave a deposit that disagrees with its readout (the #8 pattern). Set it together
   with D's final logic scene.
4. **D, plane ket labels.** `HilbertPlaneScene` `ketAt` writes \|↑⟩, \|↓⟩, \|→⟩, \|←⟩, −\|→⟩, and the passport
   axes read "\|↑⟩ = \|+z⟩". The text uses \|±z⟩ and \|±x⟩ throughout (the P1 notation fix), and the
   l1-vectors:b1 caption maps the notes' and Susskind's names onto them, not arrows. Use \|+z⟩, \|−z⟩,
   \|+x⟩, \|−x⟩, −\|+x⟩.
5. **D, plane readouts `|α|²`, `|β|²`.** (a) In basis `'x'` (l1-vectors:b4) the readout is the
   x-basis weight, but α is defined as the \|+z⟩ coefficient (l1-vectors:b2). The screen would say
   "\|α\|² = 1.000", while α = 1/√2 by the text. (b) In l1-average:b6 the labels appear a unit before α and β
   are defined. Suggested labels: `P(+z) / P(−z)` in basis z before l1-vectors:b2, `\|α\|² / \|β\|²` from b2
   on, and `P(+x) / P(−x)` in basis x.
6. **D, l1-sequential:b6 reveal.** The text says the erasure is "not the time or the distance travelled",
   but the survivors re-seat and the flight gets shorter. Keep the last magnet and the plate in place.
7. **D, tracked atoms.** In l1-sequential:b5 the seeded atom must be kept at both stops. In the l1-logic:b5
   reveal it must read left, so its chip is \|−x⟩ as the text says.
8. **D, l1-quantized:b3 ghost band.** The text says "nothing between them". The band must read as a dashed
   prediction, not as deposit.
9. **Integrator:** `beamTo: 'gap'` on l1-quantized:b1 (#12; P did not set it, as instructed). Consider it for
   l1-sequential:b1 too.
10. **Not built yet (D #11):** σ band (l1-average:b4), truth tallies / bars / false ring (l1-logic b2–b4),
    dashed ring (l1-sequential:b1), chip swap (l1-sequential:b5, l1-logic:b5), Bloch ball (l1-vectors:b7).

## References checked this round (#2, #3)

Source: the MIT 8.05 (Fall 2013) notes, ch. "Spin one-half, bras, kets, and operators", §1, pp. 3–6. They
give eqs. 1.14–1.15 and state that a dipole in a *non-uniform* field feels a force. They never mention
torque, precession or a uniform field.

| where | before | after |
|---|---|---|
| `L1.ts` `l1-quantized.books` (mit805) | "…a uniform field only twists the moment, and it takes a gradient to separate the beams." | Credits the notes only for F⃗ = ∇(μ⃗·B⃗) on a moment in a non-uniform field, and for the force along z being proportional to μ_z. `where` now names the notes chapter and §1. |
| `L1.story.ts` `mit3` (on l1-quantized:b5a) | "Why the field gradient, not the field itself, deflects a magnetic moment." | "The force on a moment in a non-uniform field, F⃗ = ∇(μ⃗·B⃗), and why it sorts atoms by μ_z." |
| `L1.story.ts` l1-quantized:b5a text | "Zwiebach (MIT 8.05) shows why the pole is sharp. In a uniform field…" | The uniform-field and precession sentence is now in our own voice, and Zwiebach is credited only for "writes that force as F⃗ = ∇(μ⃗·B⃗)". Neither the sharp pole nor precession is attributed to him. |
| `L1.story.ts` l1-quantized:b5a Townsend ref | §1.1, pp. 1–5 | §1.1, pp. 1–5; §2.2, p. 33. Townsend states that a classical moment in a uniform field precesses (§2.2, p. 33), so our precession sentence now has a real source. |
| `glossary.ts` `precession` | — | Adds "the field's twist (torque) drives it", in our own voice. |
| `L1.ts` `watch[0]` (mit805) | "why the field gradient deflects a magnetic moment, and what the two spots mean" | Unchanged. The notes support both: the force in a non-uniform field, and two peaks = S_z = ±ħ/2. |
| `L1.ts` `l1-sequential.books` (mit805) | "runs the same three-magnet sequence … measurement changes the state" | Unchanged (#3 closed). Minor: the notes' third configuration keeps the S_x = −ħ/2 beam, where ours keeps +x. The lesson ("no memory of the first filter") is the same. |

## Judge visual QA (2026-09-26, integrator)
Method: a throwaway Playwright spec on installed Chrome, 1440×900, `?measure#/lecture/L1`: every beat scrolled to
mid-hold, settled, stage box screenshotted; clue beats clicked "Show me" and captured again (31 closed + 7 revealed =
38 frames). Visible captions, readouts, labels and passports dumped to JSON and checked against the text/claims;
frames reviewed visually for the key beats.

| Result | Beats |
|---|---|
| Numbers on screen agree with the text and claims | all 31 closed + 7 revealed (e.g. q:b4 100 %, seq:b6 reveal 100 % with three magnets, avg:b3 P(+) 0.854 / ⟨σ⟩ 0.707, avg:b4 100-atom batch 85 % vs Born 85.4 %, avg:b6 reveal lab P(+) 0.874 = state-space \|⟨+z\|ψ⟩\|² 0.874, logic b1–b4 false 0 % / 25 %, vec:b4 x-basis 1.000 / 0.000, vec:b7 reveal pure dot on surface + oven ring at centre) |
| Values that looked off but are correct | avg:b5 reveal θ = 52° and vec:b2 0.498 (scroll-bound sweeps captured mid-beat; readouts recomputed for the drawn angle) |
| Fixed during QA | logic:b5 both benches read "\|+z⟩ beam" → now "z → x" / "x → z"; ⟨σₙ⟩ used an ASCII hyphen → real minus, no −0.000 |
| Verified fixes from Round 3b | #8 "previous run" label on q:b4; #14 bench roles on vec:b7; #15 logic tallies; #16 \|±z⟩ labels; #17 basis-named bars; #18 fair control; classical note on q:b2 |
| Remaining (cosmetic, not truth) | end-on lab shots (avg:b6 top pane, seq tilted shots) are busy with ghosted magnet slabs; split-pane lab readouts show only during transitions |

Status: **L1 truth sign-off — PASS** (judge). No picture ↔ text ↔ number mismatch remains on screen.
