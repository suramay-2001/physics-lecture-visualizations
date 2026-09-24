# D — Lecture 1 scene design (3D Designer proposal)

Status: proposal only. No application code changed. Evidence: live gate inspected 2026-09-25 (DOM
label-overlap sampler at 1000 × 640 and 1440 × 900, canvas snapshots via `__gate.snapshot`); every colour,
contrast and lens figure computed, not estimated. Realises the beats of `P2-L1-story.md` and decisions L1 #5–#7.

## 1. Visual grammar (app-wide)

All numbers below were computed (sRGB → CIE L*, WCAG 2.x contrast) with a throwaway script; contrast figures
assume sRGB alpha compositing, as the browser does.

### 1.1 Stage palette (dark phosphor)
| Token | Hex | L* | Use |
|---|---|---|---|
| `--stage-bg-physical` | `#1a1f28` | 11.6 | `lab-r3` (neutral graphite: "a real room") |
| `--stage-bg-state` | `#161d2c` | 10.8 | `hilbert-plane`, `bloch`, `bloch-ball`, `hopf` (blue-black: "abstract") |
| `--stage-bg-operator` | `#1b1b28` | 10.3 | `operator-space` (violet-black) |
| `--stage-bg-inset` | `#1d2536` | 14.7 | inset views (mini Bloch, lab inset in split shots) |
| `--stage-backdrop` | `#121824` | 8.6 | lab back wall / bench plane (fog colour = stage bg) |
All within PLAN's 6–18 % luminance band (gate measured L* 12.8). The background tint is a *secondary*
space cue; the passport is the primary one.

### 1.2 Reserved encodings (stage variants; contrast vs `#161d2c`)
| Meaning | Token | Hex | L* | Contrast | Only used for |
|---|---|---|---|---|---|
| + outcome | `--stage-plus` | `#f0a93a` | 74.3 | 8.4 : 1 | + beams/deposits, + eigen-endpoints, + probability bars |
| − outcome | `--stage-minus` | `#7f95ff` | 64.3 | 6.1 : 1 | − beams/deposits, − eigen-endpoints, − bars |
| the state | `--stage-state` | `#f4f6fa` | 96.8 | 15.6 : 1 | state arrow, Bloch point, Hopf bead + its fiber, state-chip border |
| structure 1 | `--stage-silver` | `#9aa5b4` | 67.3 | 6.8 : 1 | axes, magnet-axis arrows, frames, hypothesis/classical overlays (dashed) |
| structure 2 | `--stage-silver-2` | `#6d7888` | 50.1 | 3.8 : 1 | great circles, grids, unit circle |
| structure 3 | `--stage-silver-3` | `#4a5462` | 35.4 | 2.2 : 1 | ground grid, inactive/greyed apparatus |
| operator (NEW, see Q1) | `--stage-op` | `#e58bd3` | 69.3 | 7.2 : 1 | the arrow a⃗ and the a₀ gauge only |
| unpolarized atoms | `--stage-unpol` | `#bfc5cf` | 79.3 | 9.7 : 1 | atoms before the first magnet (no ket; not "the state" colour) |

Hopf luminance ramp (neutral-cool, CIELAB a = −0.5, b = −5, **L\* = 84 − 44·θ/π**; never reaches the
state's L* 96.8, so the highlighted fiber always out-shines every other fiber by ΔL* ≥ 12.8):
| θ | 0° (+z) | 20° | 45° | 70° | 95° | 120° | 180° (−z) |
|---|---|---|---|---|---|---|---|
| hex | `#ccd2db` | `#bec5cd` | `#aeb4bc` | `#9da3ac` | `#8d939b` | `#7e838b` | `#595f66` |
Replaces the gate ramp (`#f5f7fa` → `#4a5462`), whose top end collided with the state colour.

Rules: (1) amber/cobalt never appear on apparatus, UI chrome or decoration; (2) atom colour = outcome of the
**most recent** magnet passed (a kept + beam stays amber until the next magnet); (3) "false"/"error"/
"classical" are silver outlines or dashes, never a new hue; (4) lab state appears only as a DOM chip — no
near-white geometry in `lab-r3`.

### 1.3 Glow / bloom policy
- **No post-processing pass** in L1 (a composer on the shared canvas bleeds across `<View>` scissor edges onto
  the paper, and halos make label contrast unpredictable). Glow is baked per object:
  emissive + one additive camera-facing sprite (64×64 radial gradient generated on a canvas at load, no file).
- Only reserved-encoding objects may glow: outcome atoms/deposits, the state (bead, Bloch point, arrow tip).
  Structure, apparatus and unpolarized atoms never glow.
| Object | Emissive intensity | Sprite radius (× core) | Sprite peak alpha |
|---|---|---|---|
| outcome atom | 0.55 | 2.5 | 0.30 |
| plate deposit (settled) | 0.35 | 1.8 | 0.18 |
| state bead / Bloch point | 1.1 | 3.0 | 0.35 |
| unpolarized atom | 0.15 | — | — |
- Tone mapping `NeutralToneMapping`, exposure 1.0, output sRGB (as gate). No light is attached to the beam
  (fidelity: "nothing on stage shines on them"); the gate's point light at the oven (`#e8eef8`, 2.5) is removed.

### 1.4 Line weights (CSS px at the default framing; world radius given for tubes)
| Element | Weight | Style |
|---|---|---|
| primary axes | 1.5 px (`Line2`, `linewidth` 1.5) | solid, `--stage-silver` |
| secondary circles/grid | 1 px, opacity 0.6 | solid, `--stage-silver-2` |
| hypothesis / classical overlay | 1.5 px | dashed 6 px on / 4 px off, `--stage-silver` |
| field streamlines | tube r 0.005 (≈ 1.4 px) | `#dfe7f5` at opacity ≤ 0.6 (structure-light) |
| state arrow | shaft Ø 7 px, head Ø 18 px × 26 px long | `--stage-state` |
| ghost/recipe arrows | shaft Ø 3 px, opacity 0.55 | `--stage-silver` |
| Hopf background fiber | conformal tube r 0.006–0.040 (≈ 1.5–10 px, §3.5) | ramp colour |
| Hopf highlighted fiber | tube r 0.030 (≈ 8 px) | `--stage-state`, emissive 0.25 |

### 1.5 Label & passport typography (all in the DOM, never in WebGL)
| Tier | Font | Size / weight | Tracking | Case | Backing |
|---|---|---|---|---|---|
| Passport title | Martian Mono | 12 px / 500 | 0.06 em | UPPERCASE space name | `rgba(9,12,19,0.80)`, 1 px `rgba(170,184,208,0.30)`, r 4 px |
| Passport note | Martian Mono | 11 px / 400 | 0.03 em | sentence | same panel |
| Object callout (oven, magnet, plate) | Barlow Condensed | 13 px / 600 | 0.08 em | UPPERCASE | `rgba(9,12,19,0.80)`, r 3 px |
| Axis label | Martian Mono | 11 px / 400 | 0.02 em | as written | `rgba(9,12,19,0.80)`, r 3 px |
| State chip | KaTeX (Literata context) | 15 px | — | — | `rgba(9,12,19,0.85)`, 1 px `--stage-state` border |
| Coloured text (amber/cobalt readouts) | Martian Mono | 11.5 px / 500 | 0.02 em | — | **`rgba(9,12,19,0.90)`** |
| Caption | Literata | 15 px / 400, lh 1.45 | 0 | sentence | `rgba(9,12,19,0.80)` |
- Floor: 11 px anywhere on stage. Ink `#eef2f8`.
- Contrast guarantee (worst case = pure white `#ffffff` under the panel): backing 0.80 → 9.7 : 1 for
  `#eef2f8`; amber text on 0.80 → 5.4 : 1; cobalt text needs **0.90** → 5.6 : 1 (0.80 gives only 4.0).
  Minimum safe backing for ink text is 0.60 (4.6 : 1); 0.80 leaves margin for 2× DPR antialiasing.
- Leader lines from callout to anchor: 1 px `--stage-silver`, opacity 0.7, max 48 px, so the label can sit
  off the geometry instead of on it (fixes the collisions in §6).

### 1.6 Camera language (portrait stage ≈ 658 × 820, aspect 0.80)
All fovs are **horizontal**; W converts with `vfov = 2·atan(tan(hfov/2)/aspect)` (replaces `fitCamera`'s
design-aspect trick). Lens = 36 mm-wide full-frame equivalent.
| Shot | Lens | hfov | vfov @ 0.80 | Use |
|---|---|---|---|---|
| Wide | 28 mm | 65.5° | 77.4° | whole multi-module bench |
| Establishing | 35 mm | 54.4° | 65.3° | three-quarter unit opener, two-bench panes |
| Medium | 40 mm | 48.5° | 58.6° | magnet + beams |
| Close | 65 mm | 31.0° | 38.1° | plate face-on, magnet exit |
| Detail | 85 mm | 23.9° | 29.6° | single-atom slow motion, chip swap |
| State space | 50 mm | 39.6° | 48.3° | bloch, bloch-ball, hopf, operator (spheres stay round) |
| Flat | orthographic | — | — | `hilbert-plane`; split-rig halves |
- Moves: dolly, truck, pedestal, orbit about the subject. **No roll, no handheld drift.** Focal length may
  change only inside a beat-change window, together with a dolly, and by at most **two adjacent rows**
  (28 → 35 → 40 → 50 → 65 → 85); a bigger jump is a **cut**.
- Scrub budget: ≤ 60° orbit and ≤ 2 lens rows per beat-change window (±0.35 beat, smoothstep 3t² − 2t³).
- Framing safe area (px from stage edge): top 72 (passport), bottom 132 (caption ≤ 3 lines), sides 24.
  Subject centroid on the vertical centre line; horizon/beam line on the lower third (y ≈ 547 px) in lab shots.
- Idle motion (full-motion mode only): none on the camera. The gate's `sin(t·0.2)·0.12` drift and
  `time·0.03` orbit are removed; life comes from atoms and the bead, not from the camera.

### 1.7 Lighting rig (beauty-first, zero network)
Environment = three's `RoomEnvironment` through `PMREMGenerator` (sigma 0.04), built once and shared (gate
pattern). No drei `<Environment preset>` (CDN fetch), no HDR files. Directions are relative to the camera's
default azimuth.
| Light | Colour | Intensity | Direction (az / el) | Stages |
|---|---|---|---|---|
| Env (Room) | — | 0.70 lab · 0.55 hopf · 0.80 bloch/ball/op | — | all 3D |
| Key (directional) | `#fff4e8` | 2.2 | +40° / 50° | all 3D |
| Fill (hemisphere) | sky `#d6def0`, ground `#1a2130` | 0.45 | — | all 3D |
| Rim (directional) | `#a9bcff` | 1.3 lab · 0.8 others | 200° / 20° | all 3D |
| Contact shadow (lab only) | black | opacity 0.45, blur 2.4, 512² | baked once (`frames={1}`) under magnet/oven/plate | `lab-r3` |
`hilbert-plane` is **unlit** (MeshBasic / line materials only): a flat abstract diagram gets no light, no
shadow, no perspective (§3.2). Shadows are otherwise off.

### 1.8 Reduced motion (`prefers-reduced-motion: reduce` or the app toggle)
1. Beat changes are **cuts**: `stageT` returns `floor(u)`; no ±0.35 window, no easing.
2. Camera cuts to the next keyframe; no dolly/orbit.
3. Atom flow frozen at a fixed clock (gate's `stageClock = 4.0`); deposits shown at their final count.
4. Scroll-scrubbed parameters (θ sweeps) snap to **5 stops** (0°, 45°, 90°, 135°, 180° or the beat's own
   stops) plus a DOM `<input type=range>` under the caption for free exploration.
5. No flashes. (Full motion: a chip-swap flash is ≤ 150 ms, peak opacity 0.6, ≤ 1 per second.)

## 2. Space passports

### 2.1 Text (title line / note line), derived from `StageKind`
| Kind | Title (Martian Mono 12/500, caps for the space class) | Note (11/400) |
|---|---|---|
| `lab-r3` | `PHYSICAL SPACE ℝ³ · metres` | `schematic · not to scale` |
| `hilbert-plane` | `STATE SPACE · real slice of ℂ²` | `not a place · angles are half of lab angles` |
| `bloch` | `STATE SPACE · Bloch sphere` | `not a place · opposite points = orthogonal states` |
| `bloch-ball` | `STATE SPACE · Bloch ball` | `not a place · surface = pure · inside = mixed` |
| `hopf` | `STATE SPACE S³ · stereographic view` | `not a place · circles kept · distances distorted` |
| `operator-space` | `OPERATOR SPACE · A = a₀I + a⃗·σ⃗` | `not a place · a⃗ in 3D · a₀ on the gauge (4th axis)` |
| inset, any kind | title only, 9.5 px → **raised to 11 px** | — |
Every note starts with the space's honesty claim ("schematic" or "not a place"), so the words are in the same
spot on every stage. Title ≤ 36 characters, note ≤ 50 characters (fits 380 px at 12/11 px mono).

### 2.2 Placement
| Item | Position (from stage edge) | Size |
|---|---|---|
| Passport | top-left, 14 px / 14 px | auto width, max 380 px; 2 lines, 44 px tall |
| Fidelity trigger | inside the passport, right end of the title line: `ⓘ` 16 × 16 px in a 32 × 32 px hit area | — |
| Readouts (P(+), fractions, purity) | top-right, 14 px / 14 px | max 180 px |
| Inset passport | top-left of the inset, 8 px / 8 px | title only |
| Caption | bottom-left, 14 px / 14 px | max 46 ch, ≤ 3 lines |
Reserved zones (no callout or label may be placed inside, enforced by the label layout, §6.1):
passport box + 8 px margin; readout box + 8 px; caption box + 8 px; inset box + 8 px.

### 2.3 Axis label conventions
| Kind | Axis labels (text exactly) | Where | Ticks |
|---|---|---|---|
| `lab-r3` | `x` · `y · beam` · `z · field gradient` | tips of a 0.8-unit corner gizmo, bottom-left of the bench | none (not to scale) |
| `hilbert-plane` | $\lvert{\uparrow}\rangle = \lvert{+z}\rangle$ (horizontal) · $\lvert{\downarrow}\rangle = \lvert{-z}\rangle$ (vertical) | 12 px beyond each arrow tip | unit circle marked `1`; `1/√2` ticks only in beats that use them |
| `bloch`, `bloch-ball` | `⟨σx⟩` · `⟨σy⟩` · `⟨σz⟩` | 1.14 × radius beyond each + end | `+1` / `−1` on ⟨σz⟩ only; pole kets `\|+z⟩`, `\|−z⟩` in silver 11 px |
| `hopf` | `p₁` · `p₂` · `p₃` (dimensionless projected coords) | ends of 3.4-unit axis lines | none |
| `operator-space` | `a_x` · `a_y` · `a_z`, gauge `a₀` | axis ends at 1.6 units; gauge label above the gauge | eigenvalue ticks `a₀ + \|a⃗\|`, `a₀ − \|a⃗\|` on the gauge |
Rule: an axis is never labelled x/y/z outside `lab-r3`; lab axes never carry ⟨σ⟩ or a_·.

### 2.4 Where the fidelity note opens
- Trigger: the whole passport becomes a `<button aria-expanded>` (it is `pointer-events:none` in the gate);
  Enter/Space/click opens, Esc or a second click closes, focus returns to the button.
- Panel: drops from the passport, same left edge, width `min(380px, stage − 28px)`, max height 60 % of the
  stage (scrolls inside), backing `rgba(9,12,19,0.92)`. Three groups, glyphs in silver (no hue):
  `✓ Exact` · `≈ Schematic` · `! Misleading on purpose`, text from P2 §2 verbatim.
- Stays open across beat changes within the unit; closes when the unit's pin releases.
- A beat may flag one item as "relevant now" (e.g. `lab-r3` "beam glow is not light" on `l1-quantized:b3`;
  "both paths" on `l1-sequential:b5`): the `ⓘ` gets a 6 px `--stage-silver` dot and that item is outlined
  when opened. No auto-open.
- The same notes appear in each unit's review card, so reduced-motion / < 900 px readers get them too.

## 3. Per-stage-kind design

World units `u` below are three.js units (schematic; the passport says "not to scale"). Physics coords
(z up, beam along +y) are mapped by `T(x,y,z) = (x, z, −y)`.

### 3.1 `lab-r3` — Stern–Gerlach bench
**Geometry (one SG module; physics coords)**
| Part | Spec |
|---|---|
| Module | length 3.2 u along y, pole width 1.9 u in x; modules spaced **5.8 u** centre-to-centre; oven mouth 2.1 u before the first module; plate 2.6 u after the last |
| Knife-edge pole (top) | tip at z = +0.61, tip radius 0.07; flanks at **35° from horizontal** (included angle 110°; gate's 21° reads as a roof, not a knife) reaching z = 1.27 at x = ±0.95; top at 1.55 |
| Groove pole (bottom) | shoulders at z = −0.46; groove half-width 0.38, depth 0.34 (circular arc); base −1.55 |
| Ratios (gap g = 1.07) | groove width 0.71 g · groove depth 0.32 g · tip radius 0.065 g · pole width 1.78 g |
| Yoke | C-frame on −x side (gate), `#39414f`, metalness 0.7, roughness 0.42 |
| Gradient-axis arrow | silver arrow on the yoke's outer face, 0.9 u, pointing along the module's +n̂; DOM label `n̂` (or `z`/`x` when aligned) |
| Protractor (tilt beats only) | silver-2 ring r 1.35 u around the beam at the module entrance, ticks every 15°, silver arc z → n̂, DOM `θ` |
| Oven | cylinder r 0.40, length 0.95, `#77818e`; mouth = dark aperture `#0b0e14` with silver rim. **No emissive disc** (the gate's near-white disc used the state colour) |
| Beam stop | block 0.30 × 0.12 × 0.30 u, `--stage-silver-3`, hatched face (normal-map-free: 6 dark stripes in a 32² canvas texture); atoms reaching it fade in 120 ms, no splash |
| Plate | glass 2.3 × 0.04 × 2.3 u, `#cfd9e3` opacity 0.16, steel frame 0.08 u (gate) |
| Pole material | `MeshPhysicalMaterial` `#a3acb7`, metalness 0.95, roughness 0.26, **anisotropy 0.6 along y** (brushed steel, one extra uniform) |
| Bench / wall | `#262d39` rail; back wall `--stage-backdrop`; baked contact shadow (§1.7) |

**Beam and atoms**
- 2000 instanced atoms, icosahedron detail 1, r 0.019 u (gate shader model kept: parabola inside, straight after).
- Colour rule §1.2: `--stage-unpol` before the first magnet; outcome colour of the last magnet after it (the gate's
  near-white pre-magnet atoms are replaced).
- **Screen-size clamp:** vertex shader limits projected atom diameter to ≤ 6 px and fades atoms closer than
  3.0 u → 1.2 u (gate: 2.4 → 0.9) — removes the 20–30 px foreground blobs seen in the gate's plate close-up.
- Trails (full motion only): each outcome atom draws a 0.12 u streak behind it (the same shader evaluated at
  s − 0.02), alpha 0.5 → 0; unpolarized atoms get none.
- Tilted magnets: the whole module rotates about y by `tiltXZ(θ)`; the split plane, deposit lips and the
  gradient arrow rotate with it.

**Field streamlines** (only in beats whose text mentions the field: `l1-quantized:b1`, `b5`)
9 lines per slice, 2 slices (entrance, exit), tube r 0.005, `#dfe7f5`, opacity ≤ 0.6; spacing packed at the
knife (angles ±8°, ±17°, ±27°, ±38°, 0°). Uniform-field variant: 9 parallel lines 0.2 u apart.

**Plate deposit — continuity with the 2D `Plate` (`ui/primitives.tsx`)**
1. One point generator `depositPoints(seed, nPlus, nMinus, axis)` shared by the 3D deposit and the 2D
   `Plate`. The 2D widget switches from Gaussian ellipses to the same lip shape (W's call; tiny change).
2. Same geometry ratio: spots centred at 30 % and 70 % of plate height (2D) = ±0.9 u on a 2.3 u plate (3D).
3. Same caption format in the stage readout: `plus / minus · 51.2% + · Born: 50.0%` (Martian Mono, coloured
   numbers on 0.90 backing).
4. Persistence: a plate keeps its deposit for the whole unit. A bench change slides the old plate 1.2 u
   along +x and fades it to 35 % (still readable) rather than clearing it; the new plate starts empty.
5. Deposit discs unlit (`MeshBasicMaterial`) so amber/cobalt stay exact; settled glow per §1.3.

**Overlays**
| Overlay | Look |
|---|---|
| Classical model (`l1-quantized:b2`) | atoms → bar-magnet capsules 0.09 × 0.024 u, N half `#9aa5b4`, S half `#4a5462` (no red/blue); one frozen magnet with silver angle arc + dashed drop-line; ghost band = dashed silver rectangle on the plate; DOM badge `classical model — not what happens`, 1 px dashed silver border |
| Hidden label (`l1-quantized:b6`) | silver DOM tags `↑`/`↓` on 12 sampled atoms (not all 2000); badge `hypothesis` |
| Uniform field (`b5`) | pole faces morph to flat (knife tip and groove interpolate to planes at ±0.53); 24 atoms get a precession glint: silver ring r 0.05 u spinning at 1 rev/s about z (full motion) |
| Black box (`b5`) | module cross-fades to a matte box `#20262f` (roughness 0.9); two DOM windows `σ = +1` / `σ = −1`; spot labels relabel `±ħ/2` → `±1` |
| State chip | DOM KaTeX chip at the segment midpoint, 1 px near-white border, 1 px silver leader to the beam; swap = 150 ms cross-fade (+ flash per §1.8) |
| Fraction labels | DOM mono `1`, `½`, `¼`, `⅛` on segments; blocked fraction at each stop |
| False outline (`l1-logic:b3`) | 2 px silver dashed ring around the (left, down) spot |

### 3.2 `hilbert-plane` — a flat state-space diagram inside the canvas
- **Grammar of "not physical":** orthographic camera, unlit materials only, no shadows, no camera motion, a
  flat dot grid (`--stage-silver-3`, opacity 0.25, 0.25 u pitch). Physical space is lit and has depth;
  this space is drawn like an engineering diagram, so it cannot be mistaken for an object.
- Frame: ortho half-height 1.55 u; unit circle (r 1) centred 40 px above the stage centre (clears caption).
| Element | Spec |
|---|---|
| Unit circle | 1 px `--stage-silver-2`, DOM label `1` at 30° |
| Axis lines | full lines −1.25…+1.25 u, 1 px silver-2 |
| Basis arrows | $\lvert\uparrow\rangle$ amber along +horizontal, $\lvert\downarrow\rangle$ cobalt along +vertical, length 1 u, shaft 5 px |
| ψ | near-white arrow, shaft 7 px, tip bead 10 px |
| Shadows | dashed silver drop-lines (6/4 px) from ψ tip; shadow segments on the axes 5 px, amber/cobalt at 60 % |
| Probability bars | two DOM bars at the stage's right edge, 18 × 160 px = probability 1, amber (\|α\|²) and cobalt (\|β\|²), numeric readout above each |
| Right-angle mark | 14 px silver square, 1.5 px |
| Angle arc | silver arc r 0.28 u, DOM label `θ/2` |
| Ghost −ψ | near-white at 35 %, dashed shaft; DOM badge `same physical state` |
- Entrance: grid, circle and axes **draw on** (stroke-dash 0 → 1 over the beat window); nothing flies in.
- Basis change (`l1-vectors:b4`): the two axis lines rotate rigidly 45° CCW; at the end the cobalt arrowhead
  cross-fades from the 135° end to the −45° end, so it points at $\lvert\leftarrow\rangle = (1,-1)/\sqrt2$.
- **Split rig** (`l1-average:b6`, `l1-vectors:b6`): the portrait stage splits **top/bottom** (two
  658 × 396 px panes, 12 px gap), not left/right (two 323 px columns are too narrow). Top: `lab-r3` end-on
  (85 mm, magnet axis n̂ at θ, silver arc `θ`). Bottom: `hilbert-plane` (arrow at θ/2, silver arc `θ/2`).
  Each pane has its own passport (inset style). One DOM rule links them: `θ ↔ θ/2`.

### 3.3 `bloch` — pure-state sphere
| Element | Spec |
|---|---|
| Shell | r 1, `#a7b6cf` opacity 0.09, no depth write (gate) + fresnel rim **`#c8d0dc`** (neutral; gate's `#b9c8ff` drifts toward cobalt), strength 0.55 |
| Circles | equator 1 px silver-2 opacity 0.9; x–z and y–z meridians opacity 0.5 |
| Axes | ±1.3 u, 1.5 px silver; labels per §2.3 |
| Outcome dots | amber at **+n̂**, cobalt at **−n̂** of the *current measurement axis* (r 0.045, emissive 0.4) — they move when the axis moves; they are not fixed to ±z |
| Measurement axis | dashed silver line −n̂ → +n̂ |
| State | near-white arrow + bead r 0.06, emissive 0.9, glow sprite |
| Projection | dashed silver drop-line from the state tip to n̂; DOM bar `P(+) = (1 + n̂·r)/2` |
| Camera | 50 mm, distance 4.2 u, azimuth 30° (from +x toward +y), elevation 22°; looks at the origin |

### 3.4 `bloch-ball` — pure and mixed
Everything in 3.3, plus:
- **Pure vs mixed glyph:** the state bead is filled when |r| = 1 and becomes a ring (1.5 px near-white outline)
  whose interior fill alpha = |r| inside the ball. The arrow stays; its length is |r|.
- Iso-purity shells (only in beats about purity): r = 1/3 and 2/3, 0.5 px silver-3 wire, opacity 0.18,
  DOM tags `Tr ρ² = 0.56` and `0.72` (purity = (1 + r²)/2).
- Purity readout (top-right, mono 11.5 px): `|r| = 0.00 · Tr ρ² = 0.50`.
- Recipes: silver ghost arrows, 3 px shaft, opacity 0.25 + 0.6·weight (gate).
- Oven beam: ring glyph at the centre, DOM tag `oven beam · unpolarized`.
- Measurement animations: **selective** (keep one beam) → the point travels straight to +n̂ on the surface and a
  cobalt ghost at −n̂ fades out; **non-selective** (record, keep both) → the point travels straight to its
  projection (n̂·r)n̂ on the axis. Both are straight lines, linear in the beat window (no overshoot).

### 3.5 `hopf` — S³ via stereographic projection
| Element | Spec |
|---|---|
| Fibers | exact curves (gate `FiberCurve`), 160 tubular × 6 radial segments |
| Tube radius | **conformal:** r(p) = clamp(0.010 · (1 + \|p\|²)/2, 0.006, 0.040) — a tube of constant thickness in S³, projected. Thin near the centre (where the gate's clump is), thicker outside. Needs a variable-radius tube generator (≈ 40 lines) |
| Colour | luminance ramp §1.2 by θ; roughness 0.42, metalness 0.1 |
| Highlighted fiber | near-white, constant r 0.030, emissive 0.25 |
| Focus dimming | while a fiber is highlighted, all other fibers × 0.6 luminance (ramp order kept) |
| Depth cue | **halo, not fog** (fog would alter the luminance ramp): inverted-hull pass in the stage bg colour, radius + 0.008 u, drawn first, so crossings show a gap |
| Clamp | \|p\| ≤ 6 (gate); the \|−z⟩ line is `--stage-silver-3`-ended, not capped |
| Bead | near-white r 0.09, emissive 1.1, glow sprite; slides along its fiber = global phase |
| Camera | 50 mm, distance 9.5 u, elevation 28°; unit circle at stage centre, ≈ 22 % of stage width |
**Fiber count per beat** (ring θ: count; replaces gate rings 20°–120°):
| Beat role | Fibers |
|---|---|
| two fibers (+z circle, −z line) | 2 |
| one state + bead | 3 (+ highlighted) |
| one latitude torus | 14 (θ 80°) |
| nested tori | 30 (θ 55°: 10 + 80°: 14 + highlighted pair) |
| overview | 64 = θ 30°: 6 · 55°: 10 · 80°: 14 · 105°: 16 · 130°: 18 (fewer inside where fibers are small, more outside where they spread) |
| linking pair | 64 dimmed + 2 highlighted |
128 fibers only in the Blender chapter opener (§5), never live.

### 3.6 `operator-space` — A = a₀I + a⃗·σ⃗
| Element | Spec |
|---|---|
| Axes | `a_x`, `a_y`, `a_z`, ±1.6 u, 1.5 px silver |
| Arrow a⃗ | `--stage-op` orchid, shaft 7 px, head 18 px; 1 u = 1 a-unit; if \|a⃗\| > 1.5 the scene rescales ×0.5 with DOM note `scale ½` |
| Eigen-axis ±â | 1.5 px dashed orchid line through the origin to the ghost sphere; amber dot at +â (eigenvalue a₀ + \|a⃗\|), cobalt dot at −â (a₀ − \|a⃗\|) |
| Ghost Bloch sphere | wireframe only (equator + 2 meridians), silver-3, opacity 0.25; DOM tag `ghost Bloch sphere · state space` so two spaces are never silently mixed |
| a₀ gauge | **DOM/SVG, not 3D** (it is the 4th dimension, drawn apart): vertical bar at stage right − 56 px, 60 % stage height, range −2…+2, orchid pointer at a₀; amber tick at a₀ + \|a⃗\|, cobalt tick at a₀ − \|a⃗\|; bracket `2\|a⃗\|` between them |
| Operator sum | second arrow tip-to-tail at 50 % opacity, resultant solid; gauge shows a₀ + b₀ |
| Changing a₀ | only the gauge moves; the 3D scene is frozen — makes "a₀ leaves eigenstates alone" visible |
| Camera | 50 mm, distance 5.0 u, azimuth 30°, elevation 22° (same view direction as `bloch`, so eigen-axes line up across stages) |

## 4. Scene specs for Lecture 1

### 4.0 Conventions
- **Bench layout (physics coords):** module k centred at y = 5.8·k; oven mouth at y = −3.75; plate at
  y_p = y_last + 4.2. A kept beam feeds the next module, which sits *on* that beam: translated by the beam's
  offset at its entrance and rotated by its deflection angle (≈ 6°; multi-module benches use K/2 so the
  zig-zag stays small). Fidelity "schematic" gains: *"deflections are exaggerated; real magnets are aligned
  to the beam"*.
- **Face-on plate shots always look downstream (+y)**, so screen-right = +x (a view from behind the glass
  would mirror left/right and break "right = +x").
- **Scrub timing** (beat = 88 vh of scroll): a beat's one change happens in the window ±0.35 beat around its
  entry boundary (≈ 62 vh), ease `power1.inOut` (= smoothstep 3t² − 2t³). Scroll-driven sweeps and counts run
  over the beat's hold, 0.15 → 0.85 of the beat (≈ 62 vh), ease `none` (scroll ∝ angle/count). The camera
  moves in the same window as the change, same ease.
- **Cuts:** a bench reconfiguration that is *not* the beat's change happens under a camera cut on the
  boundary (never animated). A cut restores the saved deposit of the configuration it cuts to.
- **Deposit while sweeping θ:** rolling (last 300 atoms only) so the spots visibly move with the magnet;
  persistent (up to 1400) whenever θ holds.
- Term links (hover/focus on an equation term) highlight their target with a 2 px silver outline or +40 %
  emissive for 1 s after focus; they are not beat changes and never move the camera.

**Shot library** (lens · position → target, physics coords; tune ±10 % in build with screenshots)
| Shot | Lens | Position | Target | Notes |
|---|---|---|---|---|
| L-EST | 35 mm | (8.6, −7.0, 4.8) | (0, −0.6, −0.3) | three-quarter from the oven side (≈ gate beat 1, which read well) |
| L-OTS | 50 mm | (1.6, −2.6, 2.3) | (0, y_p, −0.1) | over the magnet's shoulder at the plate |
| L-SIDE | 40 mm | (8.2, y_m + 0.8, 0.6) | (0, y_m + 0.9, 0) | side-on at module m: beam left → right, z split vertical |
| L-END | 40 mm | (0, y_m − 3.6, 1.7) | (0, y_m, 0) | down the beam at module m, 25° above the axis: tilt reads as a clock hand |
| L-PLATE | 50 mm | (2.2, y_p − 3.6, 1.1) | (0, y_p, 0) | near face-on (≈ 30° off-normal) from upstream, beside the open +x side of the magnet |
| L-PLATE-C | 65 mm | (1.6, y_p − 2.6, 0.8) | (0, y_p, 0) | plate close-up |
| L-TRACK | 40 mm | (4.2, y, 1.4) → y runs a segment | (0, y, 0) | trucks along +y with the kept beam |
| L-DETAIL | 85 mm | (2.4, y_exit − 0.4, 0.7) | (0, y_exit + 0.2, 0) | a magnet exit, single-atom slow motion |
| L-WIDE | 28 mm | (11, y_c − 6, 7.5) | (0, y_c, 0) | whole multi-module bench; y_c = bench centre |
| L-3Q | 35 mm | (6.5, y_c − 7, 5) | (0, y_c, 0) | shows z and x splits at once (logic unit panes) |
| H-FLAT | ortho | — | — | `hilbert-plane` (§3.2) |
| B-STD | 50 mm | azimuth 30°, elevation 22°, r 4.2 | origin | `bloch-ball` |

### 4.1 `l1-quantized` — bench: oven → SG_z (module 0) → plate (module 1 added in b4)
| Beat | Stage | Shot | The ONE change | DOM overlays | Scrub |
|---|---|---|---|---|---|
| b1 [L] | lab-r3 | L-EST | beam draws from the oven into the gap (`--stage-unpol` atoms; streamlines already on at 0.6 from unit entry) | callouts OVEN · MAGNET; gizmo x / y · beam / z · field gradient; term `\vec\mu` → silver 0.12 u arrow on one atom | unit entry u 0 → 0.8, `power1.inOut` |
| b2 [L] | lab-r3 | L-OTS | classical overlay on: capsules + one frozen magnet with arc and drop-line + dashed ghost band on the plate | badge `classical model — not what happens`; ghost-band end labels `−μ` `+μ` | boundary ±0.35, `power1.inOut` |
| b3 [L] | lab-r3 | L-PLATE | quantum mode: capsules → points, split on, deposit grows 0 → 1400, 50/50 (ghost band stays dashed) | readout `plus / minus · % + · Born: 50.0%`; spot labels `+ħ/2` (amber), `−ħ/2` (cobalt); `S_z` on the gradient arrow; fidelity dot on "glow is not light" | change ±0.35 `power1.inOut`; count over hold, `none` |
| b4 [L] | lab-r3 | L-TRACK y 1.6 → 7.4 | beam stop slides onto module 0's − exit and module 1 (z) slides in; new plate fills 100 % amber (old plate slides +x 1.2 u, fades to 35 %) | chip `\|+z⟩ = (1, 0)ᵀ` between modules; label `block` on the stop | ±0.35 `power1.inOut` |
| b5a [B] | lab-r3 | **cut** → L-SIDE (m = 0), one-module bench | field → uniform: poles morph flat, streamlines parallel, beam straight to one central spot, 24 precession glints | badge `uniform field — no push`; term `\vec F = \nabla(\vec\mu\cdot\vec B)` → streamline density | ±0.35 `power1.inOut` |
| b5b [B] | lab-r3 | L-SIDE (held) | magnet → black box with a split (gradient restored inside the box) | windows `σ = +1` / `σ = −1`; spot labels `±ħ/2` → `±1` | ±0.35 `power1.inOut` |
| b6 [C] | lab-r3 | **cut** → L-WIDE, b4 bench | silver `↑`/`↓` tags on 12 sampled atoms | badge `hypothesis` | ±0.35 `power1.inOut` |
P2's b5 carries three toggles; split into **b5a (Zwiebach)** and **b5b (Susskind)** so each beat has one change
(P/W: two beat ids, same core text split at the sentence boundary).

**Closed motion list — l1-quantized. The only motions are:**
1. Atom flow along the bench (full motion: clock-driven; reduced: frozen).
2. Beam reveal oven → gap (b1).
3. Atom ↔ capsule morph and the frozen capsule's arc/drop-line draw-on (b2, b3).
4. Split strength 0 → 1 (b3).
5. Deposit count growth (b3, b4).
6. Beam stop slide and module 1 slide-in; old plate slide-aside/fade (b4).
7. Pole-face morph gradient ↔ uniform and streamline re-spacing; precession glints (b5a).
8. Magnet ↔ black-box cross-fade (b5b).
9. Tag fade-in (b6).
10. Camera: L-EST → L-OTS → L-PLATE → L-TRACK dollies; cuts into b5a and b6.

### 4.2 `l1-sequential` — bench: oven → SG_z (keep +) → SG_x → [SG_x] → plate
| Beat | Stage | Shot | The ONE change | DOM overlays | Scrub |
|---|---|---|---|---|---|
| b1 [L] | lab-r3 | L-END (m = 1) | module 1 rotates 90° about y (z → x) | chip `\|+z⟩` entering module 1; dashed silver ring `classical expectation: no deflection` at plate centre; gradient arrow label `x` | rotation over ±0.35, `power1.inOut` |
| b2 [L] | lab-r3 | L-PLATE (plate after module 1) | module 1's beams split left/right; deposit grows 50/50 (amber right = +x, cobalt left) | readout `P(+x\|+z) = 0.50`; atom counter; centre ring stays empty | count over hold, `none` |
| b3 [L] | lab-r3 | L-TRACK y 7.4 → 13.2 | stop on module 1's left exit and module 2 (x) slides in on the right beam; final plate 100 % amber | chip after module 1 now `\|+x⟩ = (1, 1)ᵀ/√2`; fractions `½` `¼` | ±0.35 `power1.inOut` |
| b4 [L] | lab-r3 | L-WIDE (3 modules) | module 2 rotates back x → z; final plate ⅛ / ⅛ (amber / cobalt) | fraction labels `1 → ½ → ¼ → ⅛ + ⅛`; readout `P(±z\|+x) = 0.50` | ±0.35 `power1.inOut` |
| b5 [B] | lab-r3 | **cut** → L-DETAIL at module 1 exit | one tracked atom (silver ring marker 0.06 u; others fade to 25 %) crosses the exit and its chip swaps `\|+z⟩` → `\|+x⟩` (150 ms cross-fade + flash) | fidelity dot on "both paths" | atom position ∝ scroll over hold, `none`; swap at exit |
| b6 [C] | lab-r3 | **cut** → L-WIDE | module 1 slides out along −x by 3 u; module 2 re-seats on module 0's kept beam (≤ 0.5 u); new final plate 100 % amber (⅛ / ⅛ plate slides aside, 35 %) | fractions `1 → ½ → ½` | ±0.35 `power1.inOut` |

**Closed motion list — l1-sequential. The only motions are:**
1. Atom flow (full motion only).
2. Module 1 rotation z → x (b1).
3. Deposit growth on the active plate (b2, b3, b4, b6).
4. Stop slide + module 2 slide-in (b3).
5. Module 2 rotation x → z (b4).
6. Tracked atom's scroll-bound flight + chip cross-fade/flash; other atoms' fade to 25 % and back (b5).
7. Module 1 slide-out, module 2 re-seat, plate slide-aside/fade (b6).
8. Camera: L-END → L-PLATE → L-TRACK → L-WIDE dollies; cuts into b5 (L-DETAIL) and b6 (L-WIDE) — 28 ↔ 85 mm exceeds the two-row rule.

### 4.3 `l1-average` — bench: greyed upstream SG_z (− blocked) → module 0 tilted θ → plate
| Beat | Stage | Shot | The ONE change | DOM overlays | Scrub |
|---|---|---|---|---|---|
| b1 [L] | lab-r3 | L-END (m = 0) | θ sweeps 0° → 180°: module, split plane and spots rotate together; rolling deposit follows `probUpAlong` | protractor + arc `θ`; readout `θ = 0°…180°` | sweep over hold, `none` |
| b2 [L] | lab-r3 | L-PLATE | overlay on: silver m̂ (= ẑ) and n̂ arrows at the plate centre, drop-line m̂ → n̂, centroid tick; θ sweeps back 180° → 0° | readout `⟨σₙ⟩ = cos θ = …` | overlay ±0.35; sweep over hold, `none` |
| b3 [L] | lab-r3 | L-PLATE | θ settles 0° → 45° and holds; persistent deposit resumes; amber fill bar appears | bar `P(+) = 0.854`, centroid `2P(+) − 1 = 0.707` | ±0.35 `power1.inOut` |
| b4 [B] | lab-r3 | L-PLATE-C | batches fire N = 10 → 100 → 1000 (deposit resets per batch); ±1σ silver band around the tick narrows | readout `N = 10 · band ± 0.224` → `± 0.071` → `± 0.022` (= sin 45°/√N) | steps at 0.30 / 0.55 / 0.80 of the beat |
| b5 [C] | lab-r3 | L-PLATE | θ sweeps 45° → 60° | bar `0.854 → 0.750`; errata chip `L1 p.4` | sweep over hold, `none` |
| b6 [C] | split: lab-r3 (top) / hilbert-plane (bottom) | top L-END 85 mm; bottom H-FLAT | stage splits; bottom pane draws on; θ sweeps 0° → 180° with the state arrow at θ/2 (0° → 90°) | arcs `θ` (top) and `θ/2` (bottom); rule `θ ↔ θ/2`; term `\cos\tfrac{\theta}{2}` → shadow on the \|+z⟩ axis | split ±0.35 `power1.inOut`; sweep over hold, `none` |

**Closed motion list — l1-average. The only motions are:**
1. Atom flow (full motion only).
2. Module 0 tilt θ (b1 sweep, b2 sweep back, b3 settle, b5 sweep, b6 sweep).
3. Deposit: rolling during sweeps, persistent growth when held, batch resets (b4).
4. Overlay draw-on: axis arrows, drop-line, centroid tick (b2); fill bar (b3); σ band width (b4).
5. Stage split and hilbert-plane draw-on; state arrow rotation θ/2 (b6).
6. Camera: L-END → L-PLATE → L-PLATE-C → L-PLATE, dollies; b6 top pane is a new 85 mm shot inside the split.

### 4.4 `l1-logic` — two benches in stacked panes: top `z-first` (SG_z → SG_x), bottom `x-first` (SG_x → SG_z on the left branch); both fed by a greyed `+z` preparation module
| Beat | Stage | Shot | The ONE change | DOM overlays | Scrub |
|---|---|---|---|---|---|
| b1 [L] | lab-r3 × 2 (split) | L-3Q in both panes, identical | panes open with both benches idle (no atoms) | pane callouts `z-first` / `x-first` (not A/B: P2 §5 clash with set names); truth-tally chips `true · false` per pane | ±0.35 `power1.inOut` |
| b2 [L] | same | same | top bench fires: z sends 100 % up, then x splits 50/50 | top tally `true 100 % · false 0 %` counting up | count over hold, `none` |
| b3 [L] | same | same | bottom bench fires: x splits; left branch's z magnet splits again; 2 px dashed silver ring on (left, down) | bottom tally `true 75 % · false 25 %`; term `\tfrac14` → false counter | count over hold, `none` |
| b4 [B] | same | same | both tallies grow into two DOM bars side by side (`0 %` vs `25 %`); 3D panes dim to 50 % | terms `A\cup B` / `B\cup A` → the two bars | ±0.35 `power1.inOut` |
| b5 [C] | lab-r3 (full stage) | **cut** → L-DETAIL at the bottom bench's x-magnet exit | tracked atom's chip swaps `\|+z⟩` → `\|−x⟩` | as `l1-sequential:b5` | as `l1-sequential:b5` |

**Closed motion list — l1-logic. The only motions are:**
1. Atom flow in whichever bench is firing (full motion only).
2. Pane open (b1) and pane dim (b4).
3. Deposit growth + tally counters (b2, b3); tally → bar transform (b4).
4. False-ring draw-on (b3).
5. Tracked atom flight + chip swap (b5).
6. Camera: static L-3Q in both panes; one cut to L-DETAIL (b5).

### 4.5 `l1-vectors` — `hilbert-plane` (exact for every L1 state: real coefficients)
| Beat | Stage | Shot | The ONE change | DOM overlays | Scrub |
|---|---|---|---|---|---|
| b1 [L] | hilbert-plane + lab inset (220 × 248 px, §6.3 layout) | H-FLAT; inset L-SIDE 40 mm | grid, circle, then amber \|↑⟩ and cobalt \|↓⟩ arrows and right-angle mark draw on | axis labels per §2.3; term `\langle\uparrow\|\downarrow\rangle = 0` → right-angle mark | draw-on over ±0.35, `power1.inOut` |
| b2 [L] | hilbert-plane | H-FLAT | ψ appears and sweeps 0° → 90° with shadows | bars `\|α\|²` `\|β\|²` with readouts; terms α, β → shadows | appear ±0.35; sweep over hold, `none` |
| b3 [L] | hilbert-plane | H-FLAT | ψ settles at 45° | bars `0.50 / 0.50`; `1/√2` ticks on both axes | ±0.35 `power1.inOut` |
| b4 [L] | hilbert-plane | H-FLAT | measurement frame rotates 45° CCW; cobalt arrowhead lands on \|←⟩ at −45° (§3.2); ψ = \|→⟩ now casts a full amber shadow, none on cobalt | bars `1.00 / 0.00`; right-angle mark `\langle\to\|\leftarrow\rangle = 0` | ±0.35 `power1.inOut` |
| b5 [B] | hilbert-plane | H-FLAT | ghost −\|→⟩ appears at 225° | badge `same physical state` | ±0.35 `power1.inOut` |
| b6 [C] | split: lab-r3 / hilbert-plane | as `l1-average:b6` (reused rig) | θ sweeps 0° → 180°; state arrow 0° → 90° | end-state arcs labelled `180°` / `90°` | sweep over hold, `none` |
| b7 [C] teaser | bloch-ball (only appearance in L1) | B-STD | two points appear: \|→⟩ filled on the surface at (1, 0, 0); oven beam as a ring at the centre | one-sentence caption; badge `beyond the lecture · L6`; passport per §2.1 | ±0.35 `power1.inOut` |
The teaser is placed **last** (it is a [C] clue; P2's "after b4" would break the L → B → C order). It follows
decision L1 #6 (oven beam at the ball's centre, one sentence). If the judge prefers no new stage kind in L1,
fall back to P2 §6.1's lab-only version (two sources into SG_x) with the same single change.

**Closed motion list — l1-vectors. The only motions are:**
1. Stroke draw-on of grid, circle, axes, arrows, right-angle marks (b1, b4, b5).
2. ψ rotation (b2 sweep, b3 settle).
3. Measurement-frame rotation + arrowhead cross-fade (b4).
4. Ghost fade-in (b5).
5. Split open; θ / θ/2 sweeps (b6).
6. Point fade-in on the ball (b7).
7. Camera: none (orthographic, static); inset and b7 use fixed shots; one cut into b7.

## 5. Blender deliverables (post-gate phase)

### 5.1 Conventions for every GLB
| Item | Rule |
|---|---|
| Units | metres. Nominal schematic scale **1 u = 1 cm** (magnet length 3.2 u ↔ 0.032 m); the loader applies one `scale = 100` at the GLB root |
| Axes | Blender scene axes = physics axes (X = x, Y = beam, Z = gradient/up). Export glTF with **+Y Up on** (default): Blender's conversion (X, Y, Z) → (X, Z, −Y) is exactly T(x, y, z) = (x, z, −y). In three.js add the GLB **outside** the `PHYSICS_TO_THREE` group (it is already converted) — never both |
| Origins | SG module: beam axis at mid-length (y = 0, z = 0; knife tip at +0.61 u, groove shoulders at −0.46 u). Oven: centre of the mouth aperture. Plate: glass centre on the beam axis. Stop: centre of its hatched face. Tilt = rotation about the origin's beam axis |
| Names | `sg_pole_knife`, `sg_pole_groove`, `sg_yoke`, `sg_coil_a`, `sg_coil_b`, `sg_axis_mount`, `oven`, `slit`, `plate_glass`, `plate_frame`, `beam_stop`, `bench_rail`, `black_box` |
| Materials | named slots only (`steel_pole`, `steel_yoke`, `steel_oven`, `glass`, `tape_dark`, `rail`); the app **replaces materials by name** at load, so no reserved colour can arrive inside a GLB |
| Compression | `EXT_meshopt_compression` + `KHR_mesh_quantization`; decoder from `three/examples/jsm/libs/meshopt_decoder.module.js`, bundled (no Draco, no wasm, no CDN) |
| Textures | one baked AO map per asset, 512², WebP, UV1; nothing else (colour comes from app materials) |
| Budget | whole lab GLB ≤ 600 KB on disk; ≤ 60 k triangles for a 3-module bench (atoms are extra and procedural) |

### 5.2 Asset list
| Asset | Spec | Triangles |
|---|---|---|
| Knife-edge pole | profile per §3.1 in gap units g = 1.07 u: tip radius 0.065 g, flanks 35° from horizontal, pole width 1.78 g, length 3.0 g; 0.02 g chamfer on every hard edge (catches the key light) | 2 500 |
| Groove pole | groove width 0.71 g, depth 0.32 g (circular arc, 24 segments), shoulders flat, same chamfer | 2 500 |
| Yoke | C-frame closing the circuit on −x, plate thickness 0.39 g; 4 bolt heads per face (hex, 6 segments) | 3 000 |
| Coils | two packs around the yoke limbs, wrapped in dark cloth tape (`tape_dark`); **no copper** (copper reads as amber, which is reserved) | 4 000 |
| Axis mount | bracket on the yoke's outer face that holds the procedural gradient arrow | 500 |
| Oven | crucible housing r 0.40 u, length 0.95 u, two heat-shield rings, rear flange with 6 bolts, mouth aperture r 0.10 u with a lip | 6 000 |
| Slit | two jaws 1.24 × 0.04 × 0.50 u on a U-bracket | 800 |
| Plate | glass 2.3 × 0.04 × 2.3 u (separate mesh, app material) + frame 0.08 u + foot | 1 800 |
| Beam stop | 0.30 × 0.12 × 0.30 u block + stem + clamp | 500 |
| Bench rail | 12 u rail + one carriage per module (instanced) | 2 000 |
| Black box | 1.9 × 3.2 × 2.2 u matte box with two recessed readout windows | 600 |
| **Total, 3 modules** | 3 × 12 500 (module instanced) + 11 700 | **≈ 49 000** |

### 5.3 Chapter-opener image sequences (scrubbed on a 2D canvas; the one WebGL context stays free)
Common spec:
| Item | Value |
|---|---|
| Frames | **120** per opener, pinned over 3 beats (264 vh) → 2.2 vh per frame |
| Resolution | **1080 × 1350** (4 : 5 portrait — it fills the stage slot like any other stage, 1.64 device px per CSS px at 658 × 820) |
| Format | WebP q80, method 6; 0.5 % dither added in the compositor first (prevents banding on the dark background) |
| Size | ≤ 70 KB per frame average → ≤ 8.4 MB per opener |
| Background | exactly `--stage-bg-state` `#161d2c`; Blender view transform **Standard** (AgX/Filmic would shift the hex and the ramp) |
| Renderer | Cycles, 128 samples + OpenImageDenoise, motion blur off (it is scrubbed), film filter 1.5 px |
| Lights | same rig as §1.7: key area 2 m² `#fff4e8`, fill, rim `#a9bcff`; world = flat bg colour (no HDRI) |
| Output path | `app/public/openers/<name>/0000.webp … 0119.webp` + `poster.webp` (frame 60) |
| Reproducibility | `.blend` + `render.py` under `pipeline/blender/`; the script sets every value above |
**Memory budget for scrubbing** (a decoded 1080 × 1350 RGBA frame = 5.83 MB; all 120 decoded = 700 MB,
so they are never all decoded):
1. Keep every frame as a compressed `Blob` (≤ 8.4 MB total).
2. Decode with `createImageBitmap` into a **ring of 9 bitmaps (52.5 MB)**: current ± 4, biased 6 ahead / 2
   behind in the scroll direction; `bitmap.close()` on eviction.
3. If the needed frame is not decoded yet, draw the nearest decoded one (never a blank).
4. Load coarse-to-fine: every 8th frame first (15 frames, ≈ 1 MB), then fill in; start after the page is idle.
5. Reduced motion and < 900 px: `poster.webp` only, no scrubbing.

**Opener A — Hopf fibration** (L6 material; placement by the judge)
| Frames | Content | Camera (50 mm, looks at the origin) |
|---|---|---|
| 0–29 | the \|+z⟩ circle alone; a near-white bead laps it once | r 9 u, elevation 30°, azimuth 0° → 20° |
| 30–59 | the θ = 80° torus assembles, fibers fading in by φ | r 9 → 7 u, azimuth 20° → 60° |
| 60–89 | 5 latitude rings, **128 fibers**, luminance ramp §1.2, conformal tube radius §3.5; DOF f/2.8 focused at the origin | azimuth 60° → 120°, elevation 30° → 45° |
| 90–119 | pull back and rise to look down p₃: nested tori read as concentric rings; the \|−z⟩ line becomes a point | r 7 → 14 u, elevation 45° → 80° |
Path: one 4-point Bézier camera path + Track-To the origin, evaluated by arc length so scroll speed is even.

**Opener B — 720° belt trick** (L6 material)
| Frames | Content | Camera |
|---|---|---|
| 0–39 | a steel block (0.6 u cube, chamfered) on a belt anchored to a wall rotates 0° → 360° about the vertical; the belt gains one full twist | 50 mm, three-quarter, r 6 u, elevation 20° |
| 40–79 | block rotates 360° → 720°; belt carries two twists | orbit +10° |
| 80–119 | block held still; the belt's middle loops over the block and the belt ends flat | orbit +10°, elevation 20° → 30° |
- Belt: ribbon 0.12 × 0.004 u, 64 segments, frames baked from an explicit SU(2) homotopy of the 720° loop to
  the constant loop (P to verify the formula and that frame 119 is untwisted); faces distinguished by
  luminance only: front `#9aa5b4`, back `#4a5462` (no hue).
- No sign glyph on the block: the "−1 after 360°" story is carried by the caption in the DOM.

## 6. Defect fixes (gate)

Evidence gathered 2026-09-25 on the live gate (`/#/gate`, Vite :5180): DOM label rects sampled at 3 scroll
positions per beat after `__gate.settle()`, and canvas snapshots via `__gate.snapshot()`.
| Viewport (stage) | Overlaps found (stage px) |
|---|---|
| 1000 × 640 (489 × 560) | lab b1: passport [14,14,282,69] × `x` · lab b3 (4/5): passport × **`magnet` [16,49,74,69]** (the reported defect: it sits on the note line) · lab b4: passport × `plate` · lab b0: `z · gradient` × `oven` · hopf b2–b3: passport [14,14,443,69] × `p₃` |
| 1440 × 900 (658 × 820) | lab b0: `z · gradient` × `oven` only |
Root cause: `useDomLabels` only culls labels outside NDC ±0.94/±0.92; it knows nothing about the passport,
caption, readout, inset or other labels.

### 6.1 Lab passport × "magnet" label (and every label collision)
1. **Label layout pass** in `useDomLabels` (still priority 500, still no layout reads per frame):
   - label sizes measured once on mount and on stage resize (ResizeObserver), cached;
   - reserved rects from §2.2 (passport, readout, caption, inset, each + 8 px) cached the same way;
   - per frame, for each label in priority order (object callouts before axis labels), try the anchor
     position, then offsets up / right / down / left at 20 px and 36 px; take the first candidate that
     avoids all reserved rects and already-placed labels and lies inside the safe area (top 72, bottom 132,
     sides 24 px); draw a 1 px silver leader (opacity 0.7) when offset;
   - if no candidate fits, fade the label out over 150 ms (`transition: opacity 150ms` on `.gate-axis`).
   Cost: ≤ 12 labels × 9 candidates × ≤ 16 rect tests per frame.
2. **Replace the in-scene lab axis gizmo** (physics (−1.9, −4.6, −1.05), which drifts under the passport in
   down-the-beam shots) with a **screen-fixed orientation gizmo**: 72 × 72 px SVG at the stage's bottom-right
   (14 px inset), axes projected from the camera's rotation each frame, labels `x`, `y · beam`,
   `z · field gradient` in 11 px mono. It is lab-only (state-space axes stay on the geometry).
3. Passport note shortened per §2.1 so the panel is ≤ 380 px wide (the Hopf one was 429 px on a 489 px stage).
4. Acceptance: the overlap sampler above reports **0 overlaps** at 1000 × 640 and 1440 × 900, all beats,
   3 positions each; contrast of every label still ≥ 4.5 : 1 via `__gate.contrastAll()`.

### 6.2 Hopf stage dense at the centre
Measured on the gate's beat 4/5 snapshot (1440 × 900): in the central box (30–70 % width, 35–65 % height)
**53 %** of pixels are fiber (L* > 40) and **17 %** are near-white (L* > 80).
1. Rings/counts → θ 30°: 6 · 55°: 10 · 80°: 14 · 105°: 16 · 130°: 18 (was 20°: 8 · 45°: 12 · 70°: 14 ·
   95°: 15 · 120°: 15). The gate's 20° ring hugs the unit circle and made most of the bright clump.
2. Conformal tube radius r(p) = clamp(0.010·(1 + |p|²)/2, 0.006, 0.040) (was a constant 0.02): centre fibers
   drop to 0.006 (≈ 1.5 px), outer ones grow.
3. Ramp top L* 84 (`#ccd2db`) instead of `#f5f7fa` (L* 97).
4. Halo inverted-hull pass (+0.008 u, stage bg colour) so crossings separate.
5. Overview camera r 11 u (gate 8.4–11), elevation 36°, 50 mm; no auto-orbit.
6. Acceptance on the same box: fiber coverage **≤ 35 %**, near-white (L* > 88, i.e. brighter than any ramp
   fiber) **≤ 2 %** outside the highlighted fiber and bead.

### 6.3 Mini Bloch sphere label over its dots
In the gate the inset passport (9.5 px) is drawn *on* the 200 × 200 view and covers the north cap, where the
θ = 20° dots sit; `⟨σz⟩` is culled because its anchor (1.42 above the centre) leaves the view.
1. Inset becomes **220 × 248 px**: a 28 px title strip on top (`STATE SPACE · Bloch sphere`, 11 px mono,
   backing 0.80) and a 220 × 220 view below. **Nothing is overlaid on the WebGL view.**
2. Camera 50 mm at r 3.97 u → the sphere's diameter is 70 % of the view (154 px), leaving 33 px margins.
3. `⟨σz⟩` anchored at (0.18, 0, 1.12) — right of the north pole, inside the view — 11 px mono.
4. Dots r 0.045 → **0.032**; dots on the far hemisphere (facing away from the camera) × 0.5 luminance; bead
   r 0.07 near-white with a 1.5 px ring so it stays distinct from ramp-coloured dots.
5. Caption width on the Hopf stage = stage − 28 − 234 px (inset + gap), replacing `.gate-caption-hopf`'s 220.
6. Acceptance: no DOM element intersects the inset's view rect; the snapshot of the view shows every
   rendered dot un-occluded.

## 7. Questions for the user

**Q1. Should operators get a colour of their own?**
The locked encodings cover outcomes (amber/cobalt), the state (near-white) and structure (silver). An operator
arrow a⃗ is none of these. If it is near-white it looks like a state; if it is silver it looks like scaffolding.
From L3 on, operators and states share stages (the eigen-axis through the ghost Bloch sphere).
*Recommendation:* add one reserved hue, orchid `#e58bd3` (L* 69, 7.2 : 1 on the stage), used only for a⃗ and
the a₀ gauge. Its hue (312°) is ≥ 58° from amber (37°), cobalt (230°) and the UI's coral (10°) and green (148°). Alternative: no new
hue; draw operators as a silver double-line arrow (shape instead of colour). Nothing in L1 depends on this.

**Q2. How cinematic should the Blender chapter openers be?**
Cycles can add depth of field, haze and a film-style tone curve (AgX). That looks richer, but the opener then
hands over to a live stage with a visibly different palette and background.
*Recommendation:* match the live stages exactly (Standard view transform, background `#161d2c`, the same
luminance ramp and light rig); allow only depth of field. The opener should feel like the live stage at
higher quality, not a trailer.

**Q3. Should the camera ever move on its own?**
The gate has a slow idle drift in the lab and an auto-orbit on the Hopf and Bloch stages. It feels alive, but
it moves labels while students read, and it is motion the reduced-motion path must remove anyway.
*Recommendation:* no idle camera motion anywhere. The camera moves only with scroll; atoms, the Hopf bead and
trails supply the life. If you prefer some drift, cap it at ±2° of orbit over 20 s, and only on the Hopf stage.
