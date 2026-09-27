# D — the Babylon `/lab`: experience design (proposal)

Read-only proposal; W confirms Babylon option names at install.

## 1. What the lab is for
A lecture stage obeys the scroll; the lab obeys the student. After a lecture, typically before a problem set, a student
comes to test a hunch ("which operator turns +x into +y?", "is this state on the bound?"). Benches give what scenes
cannot: free inputs, direct 3D manipulation, statistics at any N; the sandbox shows how the picture is built and which
parts the engine owns. The lab never teaches first.

| Bench | Trains | After |
|---|---|---|
| SG | l1-quantized, l1-sequential, l1-average, l1-logic, l2-plus-y, l3-postulates, l7-order, l7-compatible | L1 |
| Operator Lab | l3-operators, l3-eigen, l4-matrices, l4-eigen, l5-inverse, l5-invariance, l6-active, l6-generator, l7-full-turn, l7-compatible | L3 |
| Bloch ball | l1-average, l4-average, l6-bloch, l6-mixture, l7-spreads, l7-uncertainty | L6 |
| Grapher | l1-average, l6-equator, l7-two-angles, l7-uncertainty | any |

**In:** topbar "Lab"; "Take it to the lab" in each lecture fork; "Open in the lab" on each trained unit's Play step, with
an allowlisted preset id (`#/lab/sg?preset=l1-zxz`), never free state. **Back:** Trains chips (`TrainsLink`) per bench;
"from 1.2 · back to the chapter" per preset.

## 2. Benches
**Shared grammar:** palette from `stage/tokens.ts`; `scene.useRightHandedSystem = true` (Babylon's left-handed default
would mirror the sphere and turn Rz backwards; test: Rz(+90°) takes |+x⟩ to the +y label); KHR PBR Neutral tone mapping
(= three's `NeutralToneMapping`); D-L1 §1.7 lights plus a procedural room environment (reflection probe, prefiltered
once; Babylon's CDN default-environment helpers are banned); no GlowLayer or pipelines; outcome dots unlit. **Babylon
GUI draws affordances only** (handles, rings, ticks, + − pads); every word and number is DOM.

### 2.1 SG bench
- **Passport:** PHYSICAL SPACE ℝ³ · metres / schematic · not to scale.
- **Scene:** oven → 1–4 magnets → plate; `lab.glb` hardware; procedural poles (`field.ts` `POLE`); streamlines toggle.
- **In-scene:** a protractor knob per magnet turns it about the beam (snaps to 15°; Shift 1°); − / + pads on stops pick
  the beam that continues; "+" at the rail end adds a magnet; "−" on a yoke removes one.
- **DOM:** source (oven, |±z⟩, |±x⟩, |±y⟩), tilts, keep ±, add/remove, Fire 100 / 1 000 / 10 000, Clear, field lines.
- **Engine:** `benchTheory`, `sequenceOutcomes`, `fireMany` (seeded `rng`, new seed per volley), `binomialStd`.
- **Readouts (examples):** "magnet 2 · 60° · passes 75.0 %"; "+ 247 · − 251 · stopped 502 / 1 000 · Born 25.0 %
  ± 1.4 %" (cumulative).
- **Fidelity:** ✓ Born fractions, honest samples · ≈ magnet, deflection, glow · ! magnets turn only about the beam, so
  there is no y magnet (a |±y⟩ source is a sealed "prepared elsewhere" box).
- **Try this:** "Build z → 60° → z keeping +. Predict the last + spot, fire 10 000, then swap the last two magnets. Why
  did it change?" (9/32 vs 12/32)

### 2.2 Operator Lab
- **Views (linked cameras):** left OPERATOR SPACE · A = a₀I + a⃗·σ⃗ / not a place · a⃗ in 3D · a₀ on the gauge; right
  STATE SPACE · Bloch sphere / not a place · opposite points = orthogonal states.
- **In-scene:** drag a⃗'s tip (|a⃗| ≤ 3; the eigen-axis ±â follows); drag the hollow ψ₀ to set the start; drag the
  near-white bead along its orbit about â to set τ (bead = U(τ)ψ₀, U = e^{−iτA}; an eigenstate's orbit is a point:
  "only the phase changes").
- **DOM:** a₀ gauge (vertical range), a_x, a_y, a_z; 2×2 complex cells (`parseMatrix2`, caret on errors); presets S_x,
  S_y, S_z, S_n(θ, φ), |+z⟩⟨+z|, (σx+σz)/√2, I; coordinates z | x | y (matrix changes, picture does not); ψ₀, τ,
  Apply, operator B.
- **Engine:** `decompose`, `classify`, `eigen2`, `expm2`, `rotateBloch`, `expectation`, `spread`, `operatorInBasis`,
  `commutator`; **new** `unitaryAction(A, τ)` → â, angle 2|a⃗|τ, phase −a₀τ (numpy fixture).
- **Readouts:** A, a₀, |a⃗|, â, λ± = a₀ ± |a⃗|, |λ±⟩, class; ⟨A⟩, P(λ+), ΔA; U(τ), angle, phase, ket before/after;
  with B, [A, B] as a dashed orchid a⃗×b⃗ labelled "[A,B]/2i" and "compatible ⇔ a⃗ ∥ b⃗". Non-Hermitian A: silver
  outline, "a⃗ has imaginary parts"; eigenvalues stay.
- **Fidelity:** ✓ arrow, eigen-axis, gauge, eigenvalues, angle · ≈ the views share an orientation, not a space · ! the
  sphere hides global phase (read the ket), and a unitary is never an arrow.
- **Try this:** "Choose S_z, start at |+x⟩, drag the bead once round. It looks home: read the ket. Go round again."

### 2.3 Bloch ball
- **Passport:** STATE SPACE · Bloch ball / not a place · surface = pure · inside = mixed.
- **In-scene:** drag the state over its shell (filled dot on the surface, ring inside); scroll over it for |r|; drag the
  amber +n̂ dot to aim the magnet; in recipe mode, two ingredient dots and a weight handle.
- **DOM:** r (θ, φ, |r|), n̂, Measure (keep + / keep − / record both), weight, purity shells.
- **Engine:** `rhoFromBloch`, `purityOfNorm`, `pPlus`, `measureSelective`, `measureNonSelective`, `blochOfMixture`,
  `spreadsFromBloch`; **new** `uncertaintyFromBloch(r)`, because `uncertaintyCheck` takes kets only.
- **Readouts:** r, |r|, Tr ρ², ρ, P(+ along n̂), ⟨S_n⟩, ΔSx ΔSy ΔSz, and ΔSxΔSy against (ħ/2)|⟨Sz⟩|.
- **Fidelity:** ✓ point, P(+), spreads · ≈ the chord is one recipe of infinitely many · ! an inside point is not
  "partly up".
- **Try this:** "Slide a pure state round the equator. The bound stays 0; the product does not. Where does it reach 0,
  and why is that allowed?"

### 2.4 Grapher
| Mode | Types | Vars | Sampling | Passport |
|---|---|---|---|---|
| Surface | f(x, y) and ranges | x, y, a | `sampleGrid` ≤ 128² | GRAPH SPACE ℝ³ · no units / not a place · x, y are your inputs |
| Curve | x(t), y(t), z(t) | t, a | `sampleCurve` ≤ 1 024 | same |
| Bloch path | θ(t), φ(t) | t, a | `sampleCurve` → `blochPoint` | STATE SPACE · Bloch sphere |

- **What the student may type:** `expr.ts` real mode (`LIMITS.grapher`: 200 characters, 128 tokens, depth 32):
  numbers, + − × ÷ ^, implicit multiplication (2pi), π, e, ħ = 1, sqrt sin cos tan exp ln abs; ranges take constants
  only.
- **Parameter and layers:** `a` (−5…5) re-samples live; two layers (solid and wire).
- **Encoding:** height = luminance ramp, never hue; gaps (non-finite, |f| > 10⁶) are holes, counted; the Bloch-path
  cursor is the state (near-white); axes carry the student's variable names.
- **Controls:** drag the cursor; DOM twins for mode, inputs (caret at `pos`, plain reason), ranges, resolution, `a`,
  layers.
- **Readouts:** cursor values, min/max, gaps; Bloch path adds θ, φ, r, P(+z), P(+x).
- **Fidelity:** ✓ vertices are exact samples · ≈ linear between them · ! each axis is fitted to a cube separately
  ("equal scale" toggle).
- **Try this:** "Solid: sqrt((1−(sin x cos y)^2)(1−(sin x sin y)^2))/4 (ΔSxΔSy; x = θ, y = φ). Wire: abs(cos x)/4.
  Where do they touch?" (the poles and four whole meridians; P tests the claim).

## 3. Sandbox (the Inspector)
A "Sandbox · look under the hood" toggle ends the paper column. On first open, a card says:

> This is Babylon's Inspector, a 3D builder's tool: hide, recolour, relight, wireframe, count triangles. ⚙ ENGINE
> objects are placed by the physics; move one and it snaps back. Numbers here describe the picture, never a result.

**Exposed:** Explorer, property grid, Debug, Statistics. "⚙ engine · …" nodes (bead, atoms, deposits, a⃗, surface) are
re-set from the store every frame (the sandbox renders continuously); decoration is editable.

**Hidden or disabled:** popup and close; the Tools tab (captures, export, replay, validator: downloads, CDN fetches);
every "open in … editor" button (CDN); texture loads from URL or file; external links; the default web font
(`skipDefaultFontLoading`). Options where they exist, scoped CSS otherwise; the `'self'` CSP fails closed anyway.
Dynamic import on first toggle.

**Getting back:** the passport carries a dashed chip, "SANDBOX · the picture, not the physics". "Back to the bench" (top
of the Inspector, or Esc) closes it, re-applies the bench state and returns focus to the toggle; "Reset picture" stays
open.

**For S:** S-L1 §4d planned a dev-only Inspector; it now ships to students, so re-audit it in production (CSP, `eval`,
network).

## 4. Layout, access, fallback
| | 1440 × 900 | 1024 × 768 |
|---|---|---|
| Paper column (left, scrolls) | 400 px: tabs, title, Trains, DOM controls, Try this, Sandbox | 320 px, readouts sticky on top |
| Stage | 1040 × 844: passport + ⓘ top-left, readouts top-right (≤ 260 px), caption bottom-left, camera bottom-right | 704 × 712, passport and caption |
| Operator split | left/right 516 × 844, each with passport and readouts | top/bottom 704 × 352 |
| Sandbox | Inspector (embed mode) replaces the paper column; stage never resizes | same |

**Keyboard and screen readers:** every in-scene control has its §2 DOM twin (canonical; Babylon mirrors one store).
Tab order: tabs → controls → Try this → Sandbox → canvas → camera. The focused canvas takes arrows (orbit), + / −
(zoom), 0 (reset). Readouts are `aria-live="polite"`, updated when a change ends, plus a "Describe the picture" line
from engine values. Targets ≥ 32 px.

**Reduced motion:** every §5 item cuts to its end; inertia 0.

**Below 900 px, no WebGL2, or a lost context:** no Babylon fetch; 2D stand-ins: SGLab · OperatorBuilder +
OperatorAction · a readout form · y = f(x) in SVG.

## 5. Motion: the closed list
1. SG Fire: one volley flies from oven to plate (≤ 1.8 s), then stops.
2. SG add/remove: the module slides along the rail (300 ms).
3. Operator Apply: the bead travels ψ₀ → U(τ)ψ₀ at 400 ms per 90° (≤ 1.6 s), drawing its arc.
4. Ball Measure: the point moves straight to ±n̂ or to (n̂·r)n̂ (400 ms).
5. Camera shot or reset: 400 ms; a cut beyond 90°.
6. Camera inertia settles within 300 ms.
7. Page entry: the existing 250 ms fade.

Nothing else moves (no auto-rotate, drift, pulsing, looping atoms). Render on demand; drags follow the input 1:1.

## 6. Budgets (Apple M5, Chrome, 1440 × 900 @2×)
- **Frames (p95):** ≤ 8 ms for orbit/drag on any bench, a SG volley (2 000 atoms + ≤ 20 000 deposit thin instances)
  and the two Operator viewports; grapher re-sample frame ≤ 16 ms; sandbox ≤ 16 ms; idle 0 frames. One live WebGL
  context; DPR ≤ 2.
- **Assets:** lab chunks (core, GUI, glTF loader, lab code) ≤ 700 KB gzip, `/lab` only; Inspector chunk on toggle
  only, target ≤ 1.2 MB gzip (revisit above 2 MB); `lab.glb` reused (136 KB); no new GLBs, textures, .env files or
  fonts.

## 7. Out of scope (v1)
Hopf bench · along-beam magnet · branching benches · precession · two spins · complex or implicit graphs, vector
fields, more than 2 layers · saved setups, share links, state in URLs · Inspector Tools and editors · post-processing ·
Havok (WebAssembly, CSP-blocked) · XR, touch, sound · new Blender or generated media · Arcade scoring.

## Questions for the user
1. **SG angles:** about the beam only, as real magnets allow (**recommended**; `sg.ts` unchanged), or any n̂ (engine
   change; an impossible magnet)?
2. **Operator results:** shown at once for any typed matrix (**recommended**; optional "Predict first", used by Try
   this), or always behind a prediction?
3. **Fourth bench:** Bloch ball (**recommended**), Hopf, or none?
4. **Engine objects in the sandbox:** snap back with a ⚙ tag (**recommended**), hidden, or the engine frozen?
5. **Entry points:** topbar, fork and unit preset links (**recommended**), or the topbar only?

## Acceptance
Screenshots of each bench at 1440×900 and 1024×768 (default preset, mid-drag), the SG sandbox, reduced-motion end states
after Fire and Apply, and the < 900 px page pass when: every view shows its §2 passport top-left with a working ⓘ on a
background of L* 6–18; amber/cobalt mark only outcomes, orchid only operators, near-white only the state; the canvas
holds no text; readouts equal a vitest table of engine values per preset; the Operator split is left/right at 1440,
top/bottom at 1024; the sandbox shows the chip, no Tools tab or editor/popup/close buttons, and an unchanged stage;
reduced motion shows end states only; < 900 px shows the 2D stand-ins; logs show 0 requests outside `'self'` (Inspector
included), 1 context, 0 idle frames and the §6 frame times.
