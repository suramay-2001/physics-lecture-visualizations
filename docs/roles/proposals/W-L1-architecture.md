# W — L1 architecture proposal (Web Developer)

Status: PROPOSAL. No application code changed. Interfaces below are what D, P and S build against.

## 1. Schema extension

**Rules.** (a) Every new field on `Unit` / `Lecture` is optional, so `L1.ts` type-checks unchanged. (b) Stage state
is *physics-level and serializable*: named kets, degrees, weights. No three.js, no colours, no functions. A test
round-trips every `Beat.stage` through `JSON.stringify`. (c) Content never writes observables (P(+), |r|,
eigenvalues). The resolver computes them with the engine (§2.6), so prose, stage and claims cannot drift.
(d) Passport text cannot be authored. It is derived from the kind, so it cannot be forgotten.

Files: new `app/src/content/stage.ts` (W, types + pure helpers). New `app/src/content/stageVocab.ts` (D: shot
and anchor names, as pure data). `schema.ts` (W) re-exports both and adds the `Unit` fields.

### 1.1 Stage kinds and shared value types (`content/stage.ts`)
```ts
import type { Axis, Sign } from '../physics/sg'
import type { NamedKet } from '../physics/spin'
import type { Claim, Ref } from './schema'
import type { LabShot, PlaneShot, BlochShot, BallShot, HopfShot, OperatorShot, Anchor } from './stageVocab'

export type StageKind = 'lab-r3' | 'hilbert-plane' | 'bloch' | 'bloch-ball' | 'hopf' | 'operator-space'
export const STAGE_KINDS = ['lab-r3', 'hilbert-plane', 'bloch', 'bloch-ball', 'hopf', 'operator-space'] as const

/** Authors think in degrees. The resolver converts to radians once. */
export type Deg = number
/** A value swept across the beat's hold window as the reader scrolls (s: 0 → 1, §2.5). */
export interface Sweep { from: number; to: number; ease?: 'linear' | 'smooth' }
export type Scrub = number | Sweep

/** A pure state / direction on S²: a named ket, or Bloch polar angles (θ from +z, φ from +x). */
export type Dir = NamedKet | { thetaDeg: Scrub; phiDeg: Scrub }
/** A measurement axis n̂: sg.ts Axis ('x'|'y'|'z'|tilt°), a scrubbed x–z tilt, or any direction. */
export type MeasureAxis = Axis | { tiltDeg: Scrub } | { thetaDeg: Scrub; phiDeg: Scrub }
```

### 1.2 Discriminated `StageState` per kind
```ts
/* ---- lab-r3: the Stern–Gerlach bench (physics coordinates: beam along +y, z up) ---- */
export interface LabDevice {
  axis: Axis | { tiltDeg: Scrub }      // tilt = degrees from +z toward +x (sg.ts tiltXZ)
  keep?: Sign                          // required on every device but the last (validated)
  openOther?: boolean                  // the non-kept output lands on its own plate instead of a stop (l1-logic bench B)
}
export interface LabBench {
  id: 'main' | 'A' | 'B'
  source: 'oven' | NamedKet            // 'oven' = unpolarized, no state chip
  devices: LabDevice[]                 // 1..4
  showPrep?: boolean                   // draw the upstream preparation greyed (source '+z' ⇒ SG_z with − blocked)
}
export interface LabState {
  kind: 'lab-r3'
  benches: [LabBench] | [LabBench, LabBench]
  field?: 'gradient' | 'uniform'       // default 'gradient'; 'uniform' ⇒ no split, precession glint (l1-quantized:b5)
  model?: 'quantum' | 'classical' | 'hidden-label' | 'black-box'   // labelled overlays; default 'quantum'
  flow?: 'off' | 'stream' | 'single'   // 'single' = one slow atom (l1-logic:b5)
  deposit?: 'build' | 'hold' | 'clear' // default 'build'
  ghostBand?: boolean                  // dashed classical-prediction band on the plate
  readouts?: ('fractions' | 'blocked' | 'centroid' | 'truth-table')[]
  variant?: 'sg' | 'optical'           // 'optical' = polarizer bench (L6 §6.3); changes passport + fidelity
  shot?: LabShot
}

/* ---- hilbert-plane: the real slice of ℂ² (decision L1 #5) ---- */
export type PlaneKet =
  | '+z' | '-z' | '+x' | '-x'          // real kets only; '+y' is a type error by construction
  | { planeDeg: Scrub }                // angle in the plane; 0° = |+z⟩ (horizontal), 90° = |−z⟩
  | { blochDeg: Scrub }                // |+n⟩ = ketFromBloch(θ, 0), drawn at θ/2: the half-angle is computed, never authored
  | { neg: PlaneKet }                  // −|ψ⟩: another arrow, the same physical state
export interface HilbertPlaneState {
  kind: 'hilbert-plane'
  psi?: PlaneKet
  others?: { ket: PlaneKet; role: 'basis' | 'second' | 'ghost'; badge?: string }[]
  basis?: 'z' | 'x'                    // measurement frame: amber axis on the first vector, cobalt on the second
  shadows?: boolean                    // projections + squared-shadow bars (probabilities from prob())
  rightAngle?: boolean
  shot?: PlaneShot
}

/* ---- bloch: pure states on S² ---- */
export interface BlochState {
  kind: 'bloch'
  state: Dir
  rotate?: { axis: 'x' | 'y' | 'z'; angleDeg: Scrub }   // apply R_n(φ) (spin.ts rotation); interpolated by angle
  globalPhaseDeg?: Scrub               // multiplies the ket by e^{iγ}; the point must not move (readout only)
  measure?: MeasureAxis
  path?: 'geodesic' | { about: 'x' | 'y' | 'z' }         // how to arrive from the previous beat (§2.6)
  trail?: boolean
  labels?: 'spin' | 'poincare'         // 'poincare' = light (L6 §6.3); changes passport + axis labels
  shot?: BlochShot
}

/* ---- bloch-ball: pure + mixed states ---- */
export type BallPoint =
  | Dir                                // pure: on the surface
  | 'oven'                             // maximally mixed: r = 0
  | { mix: { of: Dir; w: number }[] }  // Σw = 1 (validated); r = Σ w·r(of)
  | { r: [number, number, number] }    // explicit Bloch vector, |r| ≤ 1 (validated)
export interface BallState {
  kind: 'bloch-ball'
  point: BallPoint
  compare?: BallPoint                  // second marker (superposition vs mixture of the same ingredients)
  recipe?: boolean                     // draw the mix ingredients with their weights
  measure?: MeasureAxis
  update?: 'none' | 'selective' | 'non-selective'         // how the NEXT beat is reached (§2.6)
  purity?: boolean                     // DOM readout |r|, Tr ρ²
  shot?: BallShot
}

/* ---- hopf: S³ → S² ---- */
export interface HopfState {
  kind: 'hopf'
  fibers: 'none' | 'one' | 'ring' | 'all'
  count?: 64 | 128                     // default 64 (gate: p95 5.4 ms)
  marked?: { state: Dir; globalPhaseDeg?: Scrub; rotate?: { axis: 'z'; angleDeg: Scrub } }
  mini?: boolean                       // linked mini Bloch sphere (default true)
  shot?: HopfShot
}

/* ---- operator-space: A = a₀I + a⃗·σ⃗ ---- */
export type OperatorSpec =
  | { a0: Scrub; a: [Scrub, Scrub, Scrub] }
  | { named: 'I' | 'sx' | 'sy' | 'sz' | 'Sx' | 'Sy' | 'Sz'; scale?: Scrub }
  | { matrix: [[string, string], [string, string]] }      // authored entries, compiled by physics/expr.ts (no eval)
export interface OperatorState {
  kind: 'operator-space'
  op: OperatorSpec                     // must be Hermitian (validated via physics/operators.ts classify)
  add?: OperatorSpec                   // second arrow + sum
  eigen?: boolean                      // ±â axis through the ghost Bloch sphere
  gauge?: boolean                      // a₀ gauge; default true
  shot?: OperatorShot
}

export type StageState = LabState | HilbertPlaneState | BlochState | BallState | HopfState | OperatorState
export type StateOf<K extends StageKind> = Extract<StageState, { kind: K }>

/** One stage per unit; a beat shows one kind, two kinds side by side, or a small inset. Kinds must differ. */
export type StageLayout =
  | StageState
  | { layout: 'split'; left: StageState; right: StageState }
  | { layout: 'inset'; main: StageState; inset: StageState }
export function layoutStates(l: StageLayout): StageState[]   // pure helper
```
All six kinds are typed now. Only `lab-r3` and `hilbert-plane` need scenes for L1. The other four are typed
so P can author L6 without a schema change. Their scenes come later (the gate scenes are the starting point).

### 1.3 Beat, terms, fidelity, review, glossary, beyond-lecture
```ts
export type BeatPhase = 'lecture' | 'books' | 'clue'           // P2's [L] [B] [C]
export type TermId = string                                    // /^[a-z0-9-]+$/, rendered as class `term-${id}`
export interface TermTarget { kind: StageKind; anchor: Anchor } // anchor ∈ ANCHORS[kind] (stageVocab.ts, D)

export interface Beat {
  id: string                          // `${unitId}:b${n}`, n = 1..; unique per lecture
  phase: BeatPhase
  text: string                        // core text (rich: $tex$, [[gloss|…]], {{term|…}}, \htmlClass{term-…}{…})
  caption?: string                    // stage caption (DOM, rich inline)
  stage: StageLayout
  terms?: Record<TermId, TermTarget>  // every term used in text/caption must be listed (lint test)
  fidelity?: string[]                 // FidelityItem ids to surface on this beat (e.g. 'lab-both-paths')
  beyondLecture?: true                // badge "beyond the lecture" (decision L1 #6)
  refs?: Ref[]                        // books beats cite here
  claims?: Claim[]                    // every number in text/caption
}

export interface FidelityItem { id: string; text: string }     // id /^[a-z0-9-]+$/, globally unique
export interface Fidelity { exact: FidelityItem[]; schematic: FidelityItem[]; misleading: FidelityItem[] }
// content/fidelity.ts (P): FIDELITY: Record<StageKind, Fidelity>; FIDELITY_VARIANT: { optical: Fidelity; poincare: Fidelity }

export interface ReviewCard {
  points: string[]                    // ≤ 5 sentences, each ≤ 25 words (lint)
  equations: string                   // one display-TeX line
  trap: string                        // "The one trap"
  claims?: Claim[]
}

export interface BeyondLecture { why: string; source: Ref }

// content/glossary.ts (P) exports GLOSSARY: ReadonlyMap<string, GlossEntry>
export interface GlossEntry {
  id: string                          // /^[a-z0-9-]+$/
  term: string                        // rich inline, e.g. 'magnetic moment $\\vec\\mu$'
  gloss: string                       // one plain sentence (≤ 25 words, lint)
  first: string                       // unit id or beat id of first use
  uses?: string[]                     // gloss ids used inside this gloss (closure test: all exist)
  symbols?: string[]                  // TeX symbols this entry defines, for the symbol-before-use lint
}
```
Additions to `schema.ts` (all optional):
```ts
export interface Unit { /* …existing… */ story?: Beat[]; review?: ReviewCard; beyondLecture?: BeyondLecture }
export interface Lecture { /* …existing… */ symbols?: Record<string, string> } // TeX symbol → where defined (lint seed)
```

**Rich-string syntax** (parsed by `ui/Rich.tsx`, §4):
- `[[id]]` or `[[id|shown text]]` makes a gloss. It renders as a focusable button with a popover and `aria-describedby`.
- `{{id|shown text}}` makes a prose term link. `\htmlClass{term-id}{…}` makes a TeX term link. Only the trusted renderer allows it.

Hover or focus on a term sets `stage.focusTerm = id`. The scene then highlights `terms[id].anchor` (§2.4).

### 1.4 Passport derived from the kind
```ts
export type PassportVariant = 'sg' | 'optical' | 'spin' | 'poincare'
export interface Passport {
  title: string                       // rich inline, rendered by the trusted renderer
  axes: readonly string[]             // axis labels in that space's units
  fidelityKey: StageKind | 'optical' | 'poincare'
}
export const PASSPORT: { readonly [K in StageKind]: Passport } = {
  'lab-r3':         { title: 'PHYSICAL SPACE ℝ³ · metres (not to scale)', axes: ['x', 'y · beam', 'z · gradient'], fidelityKey: 'lab-r3' },
  'hilbert-plane':  { title: 'STATE SPACE · real slice of ℂ² · not a place', axes: ['|+z⟩ part', '|−z⟩ part'], fidelityKey: 'hilbert-plane' },
  bloch:            { title: 'STATE SPACE · Bloch sphere · not a place', axes: ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'], fidelityKey: 'bloch' },
  'bloch-ball':     { title: 'STATE SPACE · Bloch ball · surface = pure, inside = mixed', axes: ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'], fidelityKey: 'bloch-ball' },
  hopf:             { title: 'S³ via stereographic projection · not a place', axes: ['p₁', 'p₂', 'p₃'], fidelityKey: 'hopf' },
  'operator-space': { title: 'OPERATOR SPACE · $A = a_0 I + \\vec a\\cdot\\vec\\sigma$', axes: ['a_x', 'a_y', 'a_z', 'a₀ (gauge)'], fidelityKey: 'operator-space' },
}
/** Kind + variant → passport. The only way a stage gets its label. */
export function passportOf(s: StageState): Passport
//  lab-r3 + variant 'optical'  → 'PHYSICAL SPACE ℝ³ · optical bench · this glow is light', fidelityKey 'optical'
//  bloch  + labels 'poincare'  → 'STATE SPACE · Poincaré sphere (light) · not a place', fidelityKey 'poincare'
```
The titles are P2 §2's headings, copied exactly. P and D can reword them in one place. The per-kind fidelity
drawer (`FIDELITY[passport.fidelityKey]`) is always one click from the passport.

### 1.5 D's vocabulary file (`content/stageVocab.ts`, D-owned, seeded by W from P2 "Camera"/"Links" lines)
```ts
export type LabShot = 'establish' | 'gap' | 'over-magnet' | 'plate' | 'track-beam' | 'wide' | 'medium'
export type PlaneShot = 'plane'
export type BlochShot = 'three-quarter' | 'equator' | 'pole'
export type BallShot = 'three-quarter' | 'section'
export type HopfShot = 'wide' | 'fiber' | 'pair'
export type OperatorShot = 'three-quarter' | 'gauge'
export const ANCHORS = {
  'lab-r3': ['atom-moment', 'streamlines', 'knife-edge', 'spot-plus', 'spot-minus', 'ghost-band', 'beam-stop',
             'chip-1', 'chip-2', 'z-axis', 'magnet-1', 'magnet-2', 'tilt-arc', 'centroid', 'box-readout', 'drop-line'],
  'hilbert-plane': ['psi', 'basis-1', 'basis-2', 'shadow-1', 'shadow-2', 'bar-1', 'bar-2', 'right-angle', 'ghost'],
  bloch: ['point', 'axis-n', 'equator', 'x', 'y', 'z'],
  'bloch-ball': ['point', 'compare', 'center', 'axis-n', 'purity'],
  hopf: ['fiber', 'marker', 'mini-point', 'axis-fiber'],
  'operator-space': ['arrow-a', 'gauge-a0', 'eigen-plus', 'eigen-minus', 'ghost-sphere'],
} as const satisfies { readonly [K in import('./stage').StageKind]: readonly string[] }
export type Anchor = (typeof ANCHORS)[keyof typeof ANCHORS][number]
```
D can add names. Removing one is an interface change, because the lint test will catch every `terms` entry that
used it.

## 2. Stage runtime

### 2.1 Shape
```
App ─┬─ <main> … LecturePage ─ UnitView ─ StoryStage (DOM: beats column + sticky stage box + overlay)
     │                                        │ registers UnitTrack + ViewEntries (no three.js import)
     └─ <Suspense><StageHost/></Suspense>     ▼
          lazy chunk, mounted on first demand, then persists across routes (1 context per session)
          <Canvas> ─ Driver(−100) ─ scene portals(0) ─ ViewRenderer(1) ─ labels(500) ─ stats(1000)
```
- **One `<Canvas>` at App level**, a sibling of `<main>`. The gate mounted it per page, which created 4 contexts
  and lost 3 over 4 visits. At App level it is created once, after the first `requestStageHost()` from a lecture
  with a story, and never re-created on route change. When no unit is registered: `frameloop` becomes
  `'demand'` and the canvas gets `visibility: hidden`. `stage/demand.ts` imports nothing from three, so
  non-lecture routes do not download three.js.
- **A custom View replaces drei `<View>`** (§2.3). **The DOM overlay** (passport, axis labels, caption,
  readouts, fidelity drawer) lives inside each sticky stage box and is written without React in the frame loop.

### 2.2 Scroll store (`stage/store.ts`) and ScrollTrigger wiring (`stage/useStoryScroll.ts`)
```ts
export interface UnitTrack {
  readonly unitId: string
  readonly beatCount: number
  uRaw: number          // beat position ∈ [0, n] from scroll (piecewise: article k spans [k, k+1))
  u: number             // smoothed uRaw (gsap.quickTo 0.6 s, power3.out); = uRaw when !motion. Scenes read this.
  beat: number          // clamp(floor(uRaw), 0, n−1); React sees it only via useBeat
  near: boolean         // stage within one viewport (IntersectionObserver rootMargin '100% 0px'): scenes mounted
  onScreen: boolean     // written each frame by ViewRenderer: a pixel of this unit was drawn
}
export interface StageStore {
  units: Map<string, UnitTrack>
  motion: boolean                         // false under prefers-reduced-motion or ?motion=reduce (live)
  focusTerm: TermId | null                // hovered/focused term link; scenes poll it in useFrame
  contextLost: boolean
  dprCap: number                          // 2; the governor may lower it (§2.7)
  measure: boolean                        // ?measure at host mount: preserveDrawingBuffer + window.__stage
  dom: Map<string, HTMLElement>           // `${unitId}/${kind}:${key}` → overlay nodes written without React
}
export const stage: StageStore
export function trackUnit(unitId: string, beatCount: number): UnitTrack   // ref-counted, idempotent (StrictMode)
export function releaseUnit(unitId: string): void
export function setBeat(t: UnitTrack, beat: number): void                  // notifies only on change
export function useBeat(unitId: string): number                            // useSyncExternalStore
export function setFocusTerm(id: TermId | null): void
export function useStageFlag<K extends 'motion' | 'contextLost'>(k: K): StageStore[K]
export function requestStageHost(): void                                   // stage/demand.ts (three-free)

export function useStoryScroll(root: RefObject<HTMLElement | null>, track: UnitTrack, enabled: boolean): void
```
Wiring contract (`useGSAP`, scope = unit root, `dependencies: [enabled, motion]`, `revertOnUpdate: true`):
- One ScrollTrigger per unit, `id: 'story:' + unitId`. Trigger = the beats column, `start: 'top center'`,
  `end: 'bottom center'`. **No `pin`**: the stage is CSS `position: sticky`, as in the gate. No scrub tween.
- `onUpdate(self)`: `uRaw` is `k + (centre − top_k)/height_k`. Here `k` is the beat article under the viewport
  centre line, and the article offsets are cached on ScrollTrigger `refresh`. `onUpdate` reads no layout. A
  centre inside the gap after article k gives `k + 0.999`. Then `quickTo(uRaw)`, then `setBeat`. Beat
  changes are therefore tied to the text actually reaching the centre, whatever the article heights. The gate
  used `floor(p·n)`, which assumes equal heights.
- Refresh on root height change (ResizeObserver → rAF-debounced `ScrollTrigger.refresh()`) and on
  `document.fonts.ready`. KaTeX and fonts shift layout late (gate-proven).
- React re-renders only on beat change: caption, `aria-live` beat counter, active-article class.

### 2.3 Custom View: visibility decided in the frame loop (fixes the gate's entry flash)
```ts
// stage/views.ts
export interface ViewEntry {
  key: string                                  // `${unitId}/${kind}` or `island:${id}`
  unitId: string
  kind: StageKind | 'island'
  track: HTMLElement                           // sticky stage box (or widget div for islands)
  scene: THREE.Scene                           // portal root, created once per entry
  camera: THREE.Camera | null                  // set by useStageCamera
  rect: [x: number, y: number, w: number, h: number]  // normalized sub-rect of track, this frame
  weight: number                               // 0..1 presence (layout fade); 0 ⇒ not rendered, callbacks skipped
  clear: THREE.Color                           // STAGE_BG[kind], the same token as the DOM backing
}
export function registerView(e: Omit<ViewEntry, 'scene' | 'camera' | 'rect' | 'weight'>): () => void
export function useViews(): readonly ViewEntry[]   // StagePort only; changes on register/unregister (off-screen)
```
Frame order on the one canvas (r3f `useFrame` priorities; any positive priority disables r3f's own render,
which is intended):

| prio | step | owner |
|---|---|---|
| −1000 | `frameStart`; clear the whole canvas to alpha 0 | W |
| −100 | **Driver**: for each `near` unit: one `getBoundingClientRect()` of the track, then `sampleBeats(u)`, then `resolve` + `interpolate` per kind (memoized per frame). Sets each view's `rect` and `weight` from the layout (§2.5). | W |
| 0 | scene `useStageFrame` callbacks apply the state to objects | D |
| 1 | **ViewRenderer**: for each view with `weight > 0` whose pixel rect meets the viewport: `setViewport`, `setScissor`, scissor test on, clear to `clear` (opaque), `gl.render(scene, camera)`, `track.onScreen = true` | W |
| 500 | DOM label projection (transforms only, after render, so no forced layout) | W hook, D anchors |
| 1000 | `frameEnd` stats | W |

Why the flash is gone: visibility comes from a fresh rect in the same frame that renders, with no React state
in between. Scenes mount one viewport early (`near`), and `gl.compile(scene, camera)` runs once after mount.
The first on-screen frame therefore neither misses nor stalls. The DOM backing has the same colour as the clear,
so even a dropped frame is invisible; the gate relied on that alone. Scene portals use r3f v9
`createPortal(children, entry.scene, { camera })` with `events: { enabled: false }`. L1 stages are not
pointer-interactive; controls are DOM.

**Layout → view rects** (normalized `[x, y, w, h]` within the stage box; lerped across a transition with `t`):
full `[0,0,1,1]` · split-left `[0,0,.5,1]` · split-right `[.5,0,.5,1]` · inset `[.64,.62,.33,.33]`, with the
main view full · absent ⇒ weight 0. A kind keeps **one view per unit**. Going from full to split-left resizes the
same scene: no remount, no rebuild.

### 2.4 Scene contract (D builds against this; W owns `stage/types.ts`, `stage/hooks.ts`)
```ts
export interface StageFrame<K extends StageKind> {
  readonly unitId: string
  readonly kind: K
  readonly state: Resolved<K>            // interpolated AND physics-consistent (observables recomputed)
  readonly from: Resolved<K> | null      // beat being left (null while holding)
  readonly to: Resolved<K>
  readonly t: number                     // transition 0..1 (0 while holding; cut under reduced motion)
  readonly beat: number                  // the beat whose text is at the centre line
  readonly u: number
  readonly clock: number                 // seconds; constant when !motion
  readonly delta: number
  readonly motion: boolean
  readonly focus: Anchor | null          // beat.terms[stage.focusTerm].anchor when it targets this kind
  readonly weight: number
  readonly size: { w: number; h: number } // this view's CSS px
}
export interface SceneProps<K extends StageKind> {
  unitId: string
  kind: K
  keyframes: readonly (StateOf<K> | null)[]   // per beat; null where the kind is absent (build geometry once)
}
export type SceneComponent<K extends StageKind> = ComponentType<SceneProps<K>>
// D: stage/scenes/index.ts
export const SCENES: { [K in StageKind]?: LazyExoticComponent<SceneComponent<K>> }

// Hooks for scenes (W):
export function useStageFrame<K extends StageKind>(cb: (f: StageFrame<K>) => void): void // prio 0; skipped when weight = 0 or not near
export function useStageCamera(cam: THREE.Camera | null): void
export function useDomLabels(anchors: Readonly<Record<string, THREE.Vector3>>, root?: RefObject<THREE.Object3D | null>): void
export function writeReadout(key: string, text: string): void
export function useKindResources<T>(kind: StageKind, key: string, build: () => T, dispose: (v: T) => void): T // ref-counted, 30 s grace
export function useSharedEnv(intensity?: number): void          // one PMREM RoomEnvironment for the canvas (gate)
export const PHYSICS_TO_THREE: [number, number, number]         // z-up physics → y-up three (gate `T`, det +1)
```
Rule for D: **scenes never call engine functions to decide what is true.** They read `f.state`. They may call
pure geometry helpers, such as `physics/hopf.ts` for fiber polylines and `physics/field.ts` for streamlines.

### 2.5 Beat sampling (`stage/sample.ts`, pure, vitest)
```ts
export const TRANSITION_HALF_WIDTH = 0.35     // gate-proven
export interface BeatSample { a: number; b: number; t: number; sA: number; sB: number }
export function sampleBeats(u: number, n: number, motion: boolean): BeatSample
```
- Hold window of beat k is `[k + w, k + 1 − w]`. Beat 0 starts at 0 and beat n−1 ends at n. While holding:
  `a = b = k`, `t = 0`, and `s` = hold progress, which resolves the `Sweep` values.
- Around each interior boundary k, over `[k − w, k + w]`: `a = k − 1`, `b = k`, `t = smoothstep`, `sA = 1`,
  `sB = 0`. A sweep therefore ends at `to` and the next beat starts from its `from`.
- `!motion`: `w = 0` (cut) and `s` is quantized to {0, ½, 1}.

### 2.6 Resolution and interpolation (`stage/resolve.ts`, `stage/interp.ts`, pure, vitest)
**Principle: interpolate inputs, recompute outputs.** Content → `resolve(state, s)` → `Resolved<K>` (radians,
unit vectors, engine observables) → `interpolate(a, b, t)`. Interpolation acts on the inputs, then calls the
same engine functions again. An in-between frame therefore never shows a probability that is false for the
geometry on screen.
```ts
export type V3 = [number, number, number]
export interface ResolvedLab   { kind: 'lab-r3'; benches: { id: LabBench['id']; source: LabBench['source']; tilts: number[]; axes: V3[];
                                 keep: Sign[]; openOther: boolean[]; theory: BenchTheory; chips: (NamedKet | 'oven' | { axis: V3; sign: Sign })[] }[];
                                 gradient: number; ghostBand: number; model: …; flow: …; deposit: …; readouts: …; variant: …; shot?: LabShot }
export interface ResolvedPlane { kind: 'hilbert-plane'; psi: number | null; others: { angle: number; role: …; badge?: string; alpha: number }[];
                                 basis: number; probs: [number, number] | null; shadows: number; rightAngle: number; shot?: PlaneShot }
export interface ResolvedBloch { kind: 'bloch'; r: V3; ket: Vec; globalPhase: number; axis: V3 | null; pPlus: number | null; trail: boolean; labels: …; shot?: BlochShot }
export interface ResolvedBall  { kind: 'bloch-ball'; r: V3; rNorm: number; purity: number; compare: V3 | null; recipe: { w: number; r: V3 }[] | null;
                                 axis: V3 | null; pPlus: number | null; shot?: BallShot }
export interface ResolvedHopf  { kind: 'hopf'; reveal: number; count: 64 | 128; marked: { theta: number; phi: number; chi: number } | null; mini: boolean; shot?: HopfShot }
export interface ResolvedOperator { kind: 'operator-space'; a0: number; a: V3; eig: [number, number]; ahat: V3 | null; cls: OpClass;
                                 sum: { a0: number; a: V3 } | null; eigen: number; gauge: number; shot?: OperatorShot }
export type Resolved<K extends StageKind> = Extract<ResolvedLab | ResolvedPlane | ResolvedBloch | ResolvedBall | ResolvedHopf | ResolvedOperator, { kind: K }>
export function resolve<K extends StageKind>(s: StateOf<K>, sweep: number): Resolved<K>
export function interpolate<K extends StageKind>(a: Resolved<K>, b: Resolved<K>, t: number, via?: StateOf<K>): Resolved<K>
export function validateStage(s: StageState): string[]   // [] = valid; used by tests and in DEV at mount
```
| kind | continuous inputs | rule | discrete (switch at t = ½; D choreographs with `from/to/t`) | recomputed |
|---|---|---|---|---|
| lab-r3 | device tilts; gradient 0↔1; ghost band | lerp degrees **as authored** (0°→180° passes 90°) | bench topology, source, model, flow | `benchTheory` at the lerped tilts; chips |
| hilbert-plane | ψ, other arrows, basis frame | lerp angle as authored, with no shortest-arc wrap; `neg` = +180° | roles, badges (alpha) | `prob()` shadows |
| bloch | r on S² | **geodesic slerp** (a physical rotation about r_a × r_b). `path.about` rotates about that axis. `rotate` lerps its angle (so R_z(2π) is a full lap, not a no-op). Antipodal endpoints with no `path` are a validation error. **Never through the interior.** | labels | ket, P(+) = (1 + n̂·r)/2 |
| bloch-ball | r in the ball | pure → pure: slerp on the surface. If either end is mixed, or the leaving beat has `update: 'non-selective'`: a straight chord (convex mixing and dephasing are what the physics does). `'selective'`: no path; a cut at t = ½ (a recorded outcome is a jump). | recipe | \|r\|, Tr ρ² = (1 + \|r\|²)/2, P(+) |
| hopf | base point; χ; reveal | slerp the base point on S²; χ linear with no wrap (0 → 720° are distinct); reveal lerp | count (avoid authoring a change) | fiber arcs from `physics/hopf.ts` |
| operator-space | (a₀, a⃗) ∈ ℝ⁴ | linear: operator space is a real vector space, so straight lines are honest | eigen/gauge (alpha) | a₀ ± \|a⃗\|, â, `classify` |

### 2.7 Canvas, stacking, dpr, context loss
```tsx
<Canvas className="stage-canvas" eventSource={rootEl} eventPrefix="client"
  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: stage.measure }}
  dpr={[1, stage.dprCap]} frameloop={anyNear ? 'always' : 'demand'}
  onCreated={({ gl }) => { gl.toneMapping = THREE.NeutralToneMapping; attachContextHandlers(gl.domElement) }} aria-hidden />
```
**Stacking contract.** Explicit z-indexes replace the gate's reliance on tree order:

| layer | element | rule |
|---|---|---|
| block phase | `.story-stage-col` dark backing | **non-positioned**, `background: var(--stage-bg)`; paints under every positioned z ≥ 0 |
| z 1 | `canvas.stage-canvas` | `position: fixed; inset: 0; pointer-events: none`; transparent clear outside views |
| z 2 | `.story-stage` (sticky box) | own stacking context: passport, labels, caption, readouts, fidelity drawer; transparent background |
| z 10 | `.topbar` | — |
| z 20 | gloss popovers, fidelity drawer (portalled to `body`) | — |

`main`, `.lecture`, `.unit`, `.story` and every ancestor of `.story-stage` must not use: `transform`,
`filter`, `opacity < 1`, `isolation`, `contain: paint|layout|strict`, `will-change`, or `overflow` other
than `visible`. The first six would trap the stage in a lower stacking context. The last breaks sticky.
Checked by a CSS grep test and a Playwright `elementsFromPoint` probe (§6). The stage colours live only in
`stage/tokens.ts` (`STAGE_BG`). StoryStage sets `--stage-bg` inline to the colour of the current beat's main
kind; this is a React write on beat change. There is no CSS copy to drift.

**dpr.** `[1, 2]` (gate: p95 ≤ 5.4 ms at dpr 2 on an M5). A governor watches the rolling p95 over 120
on-screen frames. Above 10 ms for two windows, `dprCap` drops by 0.5, to a floor of 1. It restores after five
windows under 5 ms. `preserveDrawingBuffer` is on only with `?measure`, which is needed for the
`snapshot()`/`drawImage` readback. `contrast()` reads pixels in a priority-2 `useFrame` right after
rendering, so it works without the flag. Playwright page screenshots do not need it.

**Context loss** (`stage/contextLoss.ts`): on `webglcontextlost`, call `preventDefault()`, set
`stage.contextLost = true`, and every StoryStage swaps to `StaticStory` (§2.9) at the current beat. On
`webglcontextrestored`, try one remount of the Canvas (`hostEpoch++`). A second loss within 60 s keeps the
static version for the session. WebGL creation failure goes through the same path, via `StageErrorBoundary`
around `<StageHost/>`. Test hook: `__stage.loseContext()` (`WEBGL_lose_context`).

### 2.8 StrictMode and route teardown
| resource | created | cleaned | StrictMode |
|---|---|---|---|
| ScrollTrigger `story:<unit>` | `useGSAP` in StoryStage | context revert | `revertOnUpdate`; count returns to baseline (gate 3→0→3) |
| `UnitTrack` | `trackUnit` in a layout effect | `releaseUnit` | refcount 1→0→1, same object |
| `ViewEntry` | React 19 ref-callback | its returned cleanup | idempotent by key |
| geometry/materials | scene portals + `useKindResources` | r3f dispose + refcount (30 s grace) | the grace period absorbs the remount |
| overlay nodes (`stage.dom`) | ref callbacks | delete only if the same node | idempotent |
| Canvas + context | StageHost (App) | never on a route change | n/a |

Route change: LecturePage unmounts, every unit releases, views empty, and StagePort renders nothing. Then
`frameloop` becomes `'demand'` and the canvas is hidden. A DEV assertion runs one tick after navigation:
`ScrollTrigger.getAll().filter(t => String(t.vars.id).startsWith('story:')).length === 0`.

### 2.9 Reduced motion and the static fallback
- **Reduced motion** (`stage.motion = false`, live). Scroll still picks the beat, because the picture must match
  the text being read. But there is no smoothing, transitions are cuts, sweeps snap to 3 stops, `clock` freezes,
  camera shots cut, and CSS label fades are off. This replaces the gate's "final beat only", because a frozen
  final picture contradicts the earlier beats.
- **`StaticStory`** is used for < 900 px, no WebGL, or a lost context. It never requests the host, so there are 0
  contexts. Beats become a reading column: phase eyebrow, text, caption, passport line, and the fidelity drawer
  as text. After the first beat that uses a kind, one existing 2D widget per (unit, kind) is initialised to that
  beat's state:
```ts
export const STATIC_WIDGET: { [K in StageKind]: (s: StateOf<K>) => WidgetSpec | null } = {
  'lab-r3': (s) => s.benches.length === 2
    ? { kind: 'logic-order' }                                            // two parallel benches (l1-logic)
    : { kind: 'sg-lab', props: { source, axes /* resolved at s = 1 */, keep, editable: false, showTheory: true } },
  'hilbert-plane': (s) => ({ kind: 'projector', props: { state /* ψ in degrees */, basis: s.basis === 'x' ? 45 : 0, editableBasis: false } }),
  bloch: () => null, 'bloch-ball': () => null, hopf: () => null, 'operator-space': () => null, // text-only until L6
}
```
  Crossing 900 px swaps versions live. The swap keeps the reading position by re-anchoring on the current beat id.
- **Second-context leak in today's app:** the `bloch` widget (`l1-average` clue) has its own `<Canvas>`. While the
  host is active it renders as a `WidgetIsland` instead: a `ViewEntry` tracking the widget's div, with
  `OrbitControls domElement={div}`, and drei `<Html>` replaced by overlay labels. It keeps its own Canvas where
  no host exists (Arcade, narrow).

### 2.10 Instrumentation
`window.__stage` is installed only in DEV or with `?measure`, as a port of `window.__gate`: `contexts`,
`contextsLost`, `triggers()` (the `story:*` count), `beats()`, `scrollToBeat(beatId, { wait })`, `settle()`,
`bench()`, `stats()`, `contrast()`, `contrastAll()`, `stageBg()`, `views()`, `renders()`, `loseContext()`.
Playwright drives everything through it.

## 3. Module plan

All new maths is pure TS in `app/src/physics/`. It uses no DOM, React, or three.js, and it builds on
`complex.ts`, `linalg.ts` and `spin.ts`. Every function with a number a learner can see gets a numpy fixture in
`pipeline/make_fixtures.py`, computed by a **different algorithm**. Its header already states that rule. The
fixtures go into the existing `physics/__fixtures__/numpy.json` under the new keys `hopf`, `density`,
`operators`, `field`, `expr_values`.

### 3.1 Moves from the gate
| from | to | notes |
|---|---|---|
| `gate/hopf.ts` + `hopf.test.ts` | `physics/hopf.ts` + `physics/hopf.test.ts` | API unchanged (`fiberPoint`, `hopfMap`, `stereo`, `inverseStereo`, `fiberSpan`, `basePoints`, `linkingNumber`, `RING_THETAS`, `FIRST_RING`). Add `fiberPolyline(theta, phi, rClamp, n, pole?): V3[]` (currently inline in `HopfScene`). |
| `gate/ball.ts` `purity`, `recipeWeights` | `physics/density.ts` | `rOfBeat` is gate choreography and stays in the gate. |
| `gate/scenes/common.tsx` `T`, `PHYSICS_TO_THREE`, `stageT`, `useDomLabels`, `useSharedEnv`, `fitCamera`, `writeText` | `stage/hooks.ts`, `stage/sample.ts` | Generalized to per-view keys (§2.4). |

`gate/hopf.ts` and `gate/ball.ts` become one-line re-exports, so `/gate` keeps building until it is deleted
(proposed: delete `/gate` once the L1 slice passes judging).

### 3.2 `physics/operators.ts`
```ts
export interface Decomp { a0: C; a: [C, C, C] }              // M = a₀I + a⃗·σ⃗, complex coefficients (any 2×2)
export function decompose(M: Mat): Decomp                     // a₀ = tr M / 2, a_k = tr(M σ_k) / 2
export function compose(d: Decomp): Mat
export interface HermDecomp { a0: number; a: Vec3 }
export function decomposeHermitian(M: Mat, eps?: number): HermDecomp | null   // null ⇔ not Hermitian
export interface OpClass { hermitian: boolean; antiHermitian: boolean; unitary: boolean; normal: boolean;
                           projector: boolean; involution: boolean; scalar: boolean; rank: 0 | 1 | 2 }
export function classify(M: Mat, eps?: number): OpClass
/** e^M for any 2×2 M. s = tr M / 2, N = M − sI (traceless, so N² = q² I), q² = −det N.
 *  e^M = e^s (cosh q · I + (sinh q / q) · N). Both factors are even in q, so the branch of √(q²) is irrelevant.
 *  q → 0: sinh q / q = 1 + q²/6 + q⁴/120 and cosh q = 1 + q²/2 + q⁴/24 when |q| < 1e-4 (covers nilpotent N). */
export function expm2(M: Mat): Mat
export const evolve = (H: Mat, t: number): Mat => expm2(mscale(H, c(0, -t)))  // e^{−iHt}, ħ = 1
```
Tests: `expm2(−i(φ/2) n̂·σ⃗)` equals `rotation(n̂, φ)` (spin.ts) over 50 random (n̂, φ). `expm2(0) = I`.
Nilpotent `[[0,1],[0,0]]` gives `[[1,1],[0,1]]`. `det e^M = e^{tr M}`. `evolve(H, t)` is unitary for a random
Hermitian H. At q = 1e-9 and 1e-5 (either side of the series switch) the result matches the numpy fixture to
1e-12. `decompose∘compose = id`. `classify(σ_x)` is Hermitian, unitary and an involution, not a projector.
`classify(|+x⟩⟨+x|)` is a rank-1 projector. `decomposeHermitian` agrees with `eigenHermitian2`
(a₀ ± |a⃗|). **Fixture** (`operators`): random general, Hermitian, unitary (QR), projector, nilpotent, scalar
and near-degenerate matrices. Coefficients come from traces; classification from `np.allclose`; `expm` by a
**Taylor series with scaling and squaring** in plain numpy. It is not the closed form.

### 3.3 `physics/density.ts`
```ts
export function rhoFromBloch(r: Vec3): Mat                    // (I + r⃗·σ⃗)/2
export function blochFromRho(rho: Mat): Vec3                  // r_k = tr(ρ σ_k)
export function rhoFromMixture(parts: readonly { w: number; psi: Vec }[]): Mat   // Σ w |ψ⟩⟨ψ|
export function blochOfMixture(parts: readonly { w: number; r: Vec3 }[]): Vec3   // Σ w r⃗
export const purityOfNorm = (rmag: number): number => (1 + rmag * rmag) / 2      // was gate purity()
export function purity(rho: Mat): number                      // tr ρ²
export const pPlus = (r: Vec3, n: Vec3): number => (1 + dot(unit(n), r)) / 2       // valid inside the ball
export function maxPPlus(r: Vec3): number                     // (1 + |r|)/2 (the "can a mixture be certain?" answer)
export function measureNonSelective(r: Vec3, n: Vec3): Vec3   // (r⃗·n̂) n̂
export function measureSelective(r: Vec3, n: Vec3, s: Sign): { p: number; r: Vec3 }   // p = (1 ± n̂·r⃗)/2, r⃗' = ±n̂
export const recipeWeights = (rmag: number): [number, number] => [(1 + rmag) / 2, (1 - rmag) / 2]
export function isPhysicalBloch(r: Vec3, eps?: number): boolean   // |r| ≤ 1 + eps
```
Tests: `blochFromRho(rhoFromBloch(r)) = r`. `purity(rhoFromBloch(r)) = purityOfNorm(|r|)`. A pure mixture
(one part) gives |r| = 1. Oven (½ +z, ½ −z) gives r = 0. **Decision #6:** ½|+z⟩ + ½|+x⟩ gives
|r| = 1/√2 and `maxPPlus` = (1 + 1/√2)/2 ≈ 0.8536, versus 1 for the matching superposition. **Fixture**
(`density`): random mixtures of 2–4 kets with Dirichlet weights. ρ is built as a matrix sum; r comes from traces;
purity from `trace(ρ@ρ)`; P(+) from `eigh` projectors; non-selective update as `Σ Π ρ Π`. The mixture maximum
is found by a **grid scan** over x–z tilts at 0.01° steps.

### 3.4 `physics/field.ts` (qualitative field + the deflection formula shown in the gate)
```ts
export type V3 = [number, number, number]
/** Schematic knife-edge-over-groove field lines in an x–z slice at beam position y (gate fieldLines, deterministic).
 *  Qualitative only: ∇·B = 0 is not enforced (fidelity note). */
export function streamlines(y: number, opts?: { count?: number; samples?: number }): V3[][]
/** Relative gradient strength across the beam width (x ∈ [−1, 1]): 1 − 0.55 x², which produces the "lip". */
export const gradientFalloff = (x: number): number => 1 - 0.55 * x * x
export interface SGParams { muZ: number; dBdz: number; m: number; v: number; L: number; D: number }  // SI
/** Δz = (μ_z / 2m)(∂B_z/∂z)(L/v)²(1 + 2D/L), the gate's displayed formula. */
export function sgDeflection(p: SGParams): number
/** z(y) along the beam: parabola inside the magnet, straight line after (the gate shader's model, in SI). */
export function sgTrajectoryZ(p: SGParams, yFromMagnetEntry: number): number
export const SILVER = { m: 107.8682 * 1.66053906660e-27, muB: 9.2740100783e-24 } as const  // kg, J/T
```
Tests: Δz is linear in μ_z and in ∂B/∂z, scales as 1/v², and is continuous at the magnet exit in both value and
slope. The lab scene's normalized `K` constant equals `sgDeflection / plateHalfSpan` for the parameters D
documents. **Fixture** (`field`): **RK4 integration** of z'' = μ_z ∂B_z/∂z / m through the magnet, then a
drift. P chooses the parameter sets that appear on screen; each becomes a `Claim`.

### 3.5 `physics/expr.ts` (complex-matrix + grapher compiler; replaces the parseNumber internals)
```ts
export type Mode = 'real' | 'complex'
export interface Limits { maxLen: number; maxTokens: number; maxDepth: number }
export const LIMITS: { readonly answer: Limits; readonly grapher: Limits; readonly cell: Limits }
//  answer {200, 64, 32} · grapher {200, 128, 32} · cell {64, 32, 16}   (S §4f)
export type Node =
  | { t: 'num'; v: number } | { t: 'i' } | { t: 'const'; name: 'pi' | 'e' | 'hbar' }
  | { t: 'var'; name: string } | { t: 'neg'; a: Node }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { t: 'call'; fn: FnName; a: Node }
export type FnName = 'sqrt' | 'sin' | 'cos' | 'tan' | 'exp' | 'ln' | 'abs' | 'conj' | 're' | 'im' | 'arg'
export type ParseError = 'empty' | 'too-long' | 'bad-char' | 'unknown-identifier' | 'too-many-tokens' | 'too-deep' | 'syntax' | 'unexpected-end'
export type Parsed = { ok: true; ast: Node; vars: string[] } | { ok: false; pos: number; reason: ParseError }
export function parse(src: string, opts: { mode: Mode; vars?: readonly string[]; limits?: Limits }): Parsed
export function evalReal(ast: Node, env?: ReadonlyMap<string, number>): number     // NaN when any node is non-finite
export function evalComplex(ast: Node, env?: ReadonlyMap<string, C>): C | null      // null when non-finite
export function sampleCurve(ast: Node, v: string, range: [number, number], n: number): Float64Array  // n ≤ 1024; gaps = NaN; |y| > 1e6 → NaN
export function sampleGrid(ast: Node, vs: [string, string], rx: [number, number], ry: [number, number], nx: number, ny: number): Float32Array // ≤ 128×128
export type MatrixParse = { ok: true; M: Mat } | { ok: false; cell: [0 | 1, 0 | 1]; pos: number; reason: ParseError | 'non-finite' | 'too-large' }
export function parseMatrix2(cells: readonly [readonly [string, string], readonly [string, string]]): MatrixParse  // |z| ≤ 1e6
```
- Recursive descent over a tokenizer allowlist: digits, `.`, `e±`, `+-*/^()`, whitespace, `π ħ √ × · ÷ −`,
  and ASCII letters. It keeps today's grammar exactly: implicit multiplication, functions bind to the next
  atom, and `^` is right-associative, so `-2^2 = −4` and `2^3^2 = 512`.
- Depth is counted in `atom` `(`, in chained `unary`, and in `power` chains. Overflow returns `too-deep`, never a
  `RangeError`.
- Lookups use `Object.freeze(Object.assign(Object.create(null), …))` tables with `Object.hasOwn`. `i` exists only
  in complex mode. Variables must appear in `opts.vars`.
- No `eval`, `Function`, or string timers. Evaluation is a pure `switch` over `Node`. Errors are returned
  values; the parser never throws into React.
- `ui/parseNumber.ts` becomes a thin wrapper: `parse(src, { mode: 'real', limits: LIMITS.answer })`, then
  `evalReal`, with `null` for anything that is not ok or not finite. Its existing tests must pass unchanged.

Tests: the whole S §4f table. Also `parseMatrix2([['1','0'],['0','-1']])` gives σ_z, and
`parseMatrix2([['0','-i'],['i','0']])` gives σ_y. A property fuzz runs 5 000 random strings over the allowed
alphabet: it never throws, finishes each parse in under 1 ms, and returns `ok` or a reason. **Fixture**
(`expr_values`): the numpy script evaluates hand-written **Python expressions equivalent** to each test
string, such as `math.cos(math.pi/8)**2`. The expected values are therefore never produced by a parser.

### 3.6 Fixture script additions (`pipeline/make_fixtures.py`, W)
One function per key: `hopf_cases()` (r from `trace(ρσ)`, fiber invariance over χ, stereographic
projection by **line–hyperplane intersection**, inverse by solving the quadratic on the line from the pole),
`density_cases()`, `operator_cases()`, `field_cases()`, `expr_value_cases()`. All use `default_rng(448)` and
are written into the same JSON. The file is deterministic: re-running the script and checking
`git diff --exit-code` on `numpy.json` is part of the phase checklist.

## 4. Security integration

The code-level design comes from S §4, which W adopts without change. This section fixes **where each control
lives, its signature, who owns the file, and how the stage runtime depends on it.** Ownership pattern: S never
edits a W file. S adds `*.security.test.ts` files and owns the modules listed here as S's. W adds one import line
at freeze wherever an S module has to be wired in.

### 4.1 Math rendering: `app/src/ui/tex.ts` (W lands S §4a verbatim at freeze; S owns it afterwards)
```ts
export const USER_TEX_MAX_LEN = 300
export const USER_TEX_MAX_BRACE_DEPTH = 24
/** Authored content only. trust allows exactly \htmlClass{term-[a-z0-9-]+}; maxSize 20, maxExpand 1000. Never throws. */
export function renderAuthoredTex(src: string, displayMode?: boolean): string
/** Anything a student typed. trust off, maxSize 10, maxExpand 50, length and brace-depth caps, no shared macros. Never throws. */
export function renderUserTex(src: string, displayMode?: boolean): string
/** Test-only: authored render with throwOnError: true, used by the content test to fail on any ParseError. */
export function renderAuthoredTexStrict(src: string, displayMode?: boolean): string
```
- `ui/Rich.tsx` (W): `Tex` calls `renderAuthoredTex`. A new `<UserTex src>` calls `renderUserTex`, and it is the
  **only** component allowed to receive `<input>`-derived strings. The echo line of numeric challenges and every
  later Operator Lab or grapher preview uses it.
- Rich-string extensions (§1.3): `[[gloss]]`, `{{term|…}}`. Ids are checked against `/^[a-z0-9-]+$/` before they
  become a `className`. An id that fails renders as plain text, and the content test fails. Popovers are React
  elements; `innerHTML` is never used outside the two KaTeX render functions.
- Term focus uses event delegation on the Rich container (`pointerover`, `focusin` → `setFocusTerm`).
  `tabIndex = 0` is added in a layout effect to `.enclosing[class*=" term-"]` and `.term`. No inline handlers
  are injected into KaTeX HTML.
- Passport titles (TeX in `operator-space`) go through `renderAuthoredTex`.

### 4.2 Error boundaries around every math and 3D island (`app/src/ui/ErrorBoundary.tsx`, W)
```ts
export interface IslandBoundaryProps {
  name: 'rich' | 'widget' | 'scene' | 'stage-host' | 'route'
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  resetKeys?: readonly unknown[]           // reset when these change (e.g. beat id, route)
  onError?: (error: Error) => void         // DEV: console.error once; prod: silent
  children: ReactNode
}
export class IslandBoundary extends Component<IslandBoundaryProps, { error: Error | null }> {}
```
| island | fallback |
|---|---|
| every `Rich` / display `Tex` block | the source text, escaped, as plain text with a small "couldn't typeset" note |
| every `Widget` (registry) | "This widget failed to load", plus the widget's caption |
| each scene portal (inside the Canvas) | the view's weight is forced to 0 and the overlay shows "this stage failed"; that unit uses `StaticStory` |
| `<StageHost/>` | `stage.contextLost = true` → every unit uses `StaticStory` (§2.7) |
| route (`App` `<Routes>`) | "Something broke on this page" + **Reset progress** button (S §4e) + link home |

### 4.3 `progress.ts` validation (S owns the file in the build round)
S §4e as specified: `sanitize(x: unknown): State`, `MAX_RAW = 64 KiB`, `MAX_ENTRIES = 500`,
`ID = /^[A-Za-z0-9._:-]{1,64}$/`, null-prototype `challenges`/`games`, a `v: 1` field, and the
`.corrupt` side-copy. The public API (`useProgress`, `progress.*`, `ChallengeRecord`) is **frozen**, so
nothing that imports it changes. Tests go in `progress.security.test.ts` (the S §4e input list, each must
still render `Home`).

### 4.4 `parseNumber` fix
W replaces the internals with `physics/expr.ts` (§3.5). That fixes `in CONSTS` and `FUNCS[…]` through
null-prototype tables and `Object.hasOwn`. **Interim, if expr.ts slips:** W also lands the two-line
`Object.hasOwn` fix in `parseNumber.ts` at freeze, so S's P1 item does not wait on the compiler. S adds
`ui/parseNumber.security.test.ts` (`constructor`, `toString`, `__proto__`, `hasOwnProperty(1)`,
`valueOf` → null).

### 4.5 Self-hosted fonts (S)
- New `app/src/styles/fonts.ts` (S) imports the @fontsource CSS files (S §4c) and `./fonts.css`. The latter
  overrides only the three tokens: `:root { --font-body: 'Literata Variable', Georgia, serif; … }`.
  `index.css` (W) is untouched. W adds `import './styles/fonts'` to `main.tsx` at freeze.
- S removes the Google Fonts `<link>`s from `index.html` and ships the OFL `LICENSE` files under
  `public/licenses/fonts/`.
- Glyph check (Playwright): ψ θ φ ħ ℂ ℝ ⟨ ⟩ ₀ ₁ ₂ ₃ render in the body face or fall back without tofu. The test
  compares widths of each glyph against U+FFFD.

### 4.6 CSP meta (build-only) + `_headers` (S)
```ts
// app/build/csp.ts (S)
export const CSP: Readonly<Record<string, string>>            // directive → value (S §4b list)
export const cspString: (opts?: { headerOnly?: boolean }) => string   // headerOnly adds frame-ancestors, upgrade-insecure-requests
export function cspMeta(): import('vite').Plugin                // apply: 'build'; transformIndexHtml → first child of <head>
```
- `vite.config.ts` (W) adds `plugins: [react(), cspMeta()]` at freeze. `app/public/_headers` (S) is generated
  from `cspString({ headerOnly: true })` by `npm run headers` and checked by a test, so the two policies
  cannot drift.
- The runtime needs **no** CSP exceptions. No drei `<Text>` (so no `blob:` in `script-src`), no
  Draco/Meshopt (so no `'wasm-unsafe-eval'`), and stage labels are DOM. Any later exception is an interface
  change that needs S sign-off.

### 4.7 Keeping drei/Draco/Inspector (and anything else) off CDNs
| risk | rule | enforced by |
|---|---|---|
| drei `<Environment preset>` (githack) | forbidden; `useSharedEnv()` (RoomEnvironment, no network) or `files="./hdri/…"` | vitest grep `preset=` in `src/**` |
| `useGLTF` Draco/Meshopt defaults (gstatic) | `useGLTF(url, false, false)` + `KHR_mesh_quantization`; if Draco is ever needed, a self-hosted decoder in `public/draco/` | grep for `useGLTF(` without `, false, false` |
| drei `<Text>` troika fallback (jsdelivr) | not used; labels are DOM | grep `<Text` from drei |
| Babylon Inspector / loaders (cdn.babylonjs.com) | Phase 3: dev-only dynamic import (S §4d) | chunk test + Playwright network log |
| any runtime fetch | `connect-src 'self'` | Playwright: 0 non-self requests |

A `dist/` grep for `fonts.googleapis|gstatic|githack|jsdelivr|unpkg|cdn.babylonjs` fails if a hit is in HTML
or CSS. Hits in JS are advisory only, because drei ships dead default URL strings; the Playwright network log
is the real gate.

### 4.8 Verbatim-overlap test (S)
`app/src/content/verbatim.test.ts` implements S §4g exactly. It globs `sources/**/*.md` (all of them, including
`susskind/chapterNNN.md`), uses `describe.skip` with a printed reason when `sources/` is absent, extracts
literals with the TypeScript compiler API from `app/src/content/**/*.ts`, **and also from
`app/src/gate/content.ts` and any `*.tsx` string literal ≥ 8 words**, and applies the 8-gram / 12-gram / 0.5 %
thresholds. The companion `dist/` check runs in the same file when `dist/` exists.

### 4.9 Lint gate (S)
`.oxlintrc.json` gains `no-eval`, `no-new-func`, `no-implied-eval`. `src/security/noEval.security.test.ts`
greps `src/**/*.{ts,tsx}` for `eval(`, `new Function`, `setTimeout('`, `dangerouslySetInnerHTML`. The last
is allowed only in `ui/Rich.tsx` and `ui/tex.ts`.

## 5. Component/file plan

**Ownership rule:** one owner per file for the whole build round. Files marked *(W→X)* are landed by W in the
contracts PR (§7), and ownership passes to X at freeze. W lands all `package.json` / lockfile changes at freeze
(`@fontsource/barlow-condensed`, `@fontsource-variable/literata`, `@fontsource/martian-mono`,
`@playwright/test`), so no other worktree touches them.

### 5.1 W: contracts, runtime, integration
| file | new/changed | purpose |
|---|---|---|
| `content/stage.ts` | new | StageKind, StageState union, Beat, Fidelity, ReviewCard, GlossEntry, PASSPORT, `passportOf`, `layoutStates` |
| `content/schema.ts` | changed | optional `Unit.story/review/beyondLecture`, `Lecture.symbols`; re-export stage types |
| `content/content.test.tsx` | new | schema validity of all content, beat-state validity, terms/anchors lint, strict KaTeX render, claims (§6) |
| `stage/demand.ts` | new | `requestStageHost`, host flag (three-free, in the main chunk) |
| `stage/store.ts` | new | `UnitTrack`, `stage`, `trackUnit`, `useBeat`, `setFocusTerm`, flags |
| `stage/sample.ts` (+test) | new | `sampleBeats` |
| `stage/resolve.ts`, `stage/interp.ts` (+tests) | new | `resolve`, `interpolate`, `validateStage`: content → engine numbers |
| `stage/types.ts` | new | `StageFrame`, `SceneProps`, `SceneComponent`, `Resolved*` |
| `stage/views.ts` | new | `ViewEntry` registry |
| `stage/hooks.ts` | new | `useStageFrame`, `useStageCamera`, `useDomLabels`, `writeReadout`, `useKindResources`, `useSharedEnv`, `PHYSICS_TO_THREE` |
| `stage/StageHost.tsx` | new | lazy chunk: the one Canvas, Driver (−100), ViewRenderer (1), dpr governor, context loss |
| `stage/StagePort.tsx` | new | one `createPortal` per view, each inside `IslandBoundary name="scene"` |
| `stage/StaticStory.tsx`, `stage/staticWidgets.ts` | new | < 900 px / no-WebGL / lost-context reading version (`STATIC_WIDGET`) |
| `stage/WidgetIsland.tsx` | new | 3D widgets drawn on the shared canvas when the host is active |
| `stage/instrument.ts` | new | `window.__stage` (DEV or `?measure`) |
| `stage/story.css` | new | story layout, sticky box, stacking contract (no colours except `var()`) |
| `components/StoryStage.tsx` | new | per unit: beats column + sticky stage box + overlay slots; `useStoryScroll`; near-IO; registers views |
| `components/StageOverlay.tsx` | new | passport (from `passportOf`), axis-label slots, caption, readouts, fidelity button |
| `components/FidelityDrawer.tsx` | new | accessible dialog listing `FIDELITY[key]`; highlights `beat.fidelity` ids |
| `components/Gloss.tsx` | new | `[[gloss]]` button + popover (`aria-describedby`, Esc closes, focus returns) |
| `components/ReviewCard.tsx`, `components/BeyondBadge.tsx` | new | exam layer; "beyond the lecture" badge |
| `components/UnitView.tsx` | changed | with `story`: head → StoryStage → "Try it" (`visual`) → clues → insight → pitfalls → review → play. Without `story`: unchanged. |
| `pages/LecturePage.tsx` | changed | `requestStageHost()` when wide and any unit has a story |
| `App.tsx`, `main.tsx` | changed | `<StageHost/>` lazy at App level; route `IslandBoundary`; `import './styles/fonts'` |
| `ui/Rich.tsx` | changed | `renderAuthoredTex`; `[[gloss]]`, `{{term}}`; term focus delegation; `<UserTex>`; boundary |
| `ui/ErrorBoundary.tsx` | new | `IslandBoundary` |
| `ui/parseNumber.ts` | changed | wrapper over `physics/expr.ts` (interim `Object.hasOwn` fix) |
| `widgets/registry.tsx`, `widgets/BlochSphere.tsx` | changed | boundary per widget; BlochSphere island mode |
| `physics/{hopf,density,operators,field,expr}.ts` (+tests) | new/moved | §3 |
| `gate/hopf.ts`, `gate/ball.ts` | changed | re-export shims |
| `pipeline/make_fixtures.py` | changed | `hopf/density/operators/field/expr_values` cases |
| `vite.config.ts` | changed | `cspMeta()` plugin line; vitest `include` for `e2e/` exclusion |
| `playwright.config.ts`, `e2e/story.spec.ts`, `e2e/helpers.ts` | new | §6.2 |
| `ui/tex.ts` *(W→S)* | new | S §4a verbatim |
| `content/stageVocab.ts` *(W→D)* | new | shots + anchors seeded from P2 |
| `stage/tokens.ts` *(W→D)* | new | `STAGE_BG`, `INK` (moved from the gate); the stage box sets `--stage-bg` inline from it, so CSS keeps no copy |
| `stage/scenes/index.ts` *(W→D)* | new | `SCENES` with a placeholder scene per L1 kind |
| `content/fidelity.ts`, `content/glossary.ts` *(W→P)* | new | typed skeletons: P2 §2 and §3 pasted as data |

### 5.2 D: scenes and look (worktree `d-l1`)
| file | purpose |
|---|---|
| `stage/scenes/LabR3Scene.tsx` + `stage/scenes/lab/*` | lab-r3: benches, magnets, field lines (`physics/field.ts`), instanced atoms, deposit, overlays, shots |
| `stage/scenes/HilbertPlaneScene.tsx` | hilbert-plane: arrows, unit circle, shadows, bars, right-angle mark |
| `stage/scenes/index.ts` | registers the above (lazy) |
| `stage/scenes/{Bloch,BlochBall,Hopf,OperatorSpace}Scene.tsx` | ported from the gate on the new hooks (not needed for L1; may land later) |
| `content/stageVocab.ts`, `stage/tokens.ts` | shot/anchor names; reserved colours |
| `stage/overlay.css` | passport, labels, caption, readouts, drawer visuals (contrast ≥ 4.5 : 1 with backing) |
| `docs/roles/scene-specs/L1.md` | beat-by-beat spec (shot + one change, closed motion list) |

### 5.3 P: content (worktree `p-l1`)
| file | purpose |
|---|---|
| `content/L1.ts`, new `content/L1.story.ts`, `content/L1.review.ts` | beats (P2 §1), review cards (§4), P1 fixes, claims |
| `content/glossary.ts`, `content/fidelity.ts` | glosses, fidelity contracts |
| `content/symbols.test.ts` | symbol-before-use lint (the 14 FLAG rows are the first fixtures), ≤ 25-word sentences |
| `pipeline/make_claim_fixtures.py` → `physics/__fixtures__/claims.json`, `content/claims.test.ts` | claim-specific numpy values (separate from W's script) |

### 5.4 S: hardening (worktree `s-l1`)
| file | purpose |
|---|---|
| `ui/tex.ts` (after freeze), `ui/tex.security.test.ts` | renderer tests (S §4a list) |
| `progress.ts`, `progress.security.test.ts` | S §4e |
| `ui/parseNumber.security.test.ts`, `physics/expr.security.test.ts` | S §4f table and fuzz (tests only; W owns the code) |
| `styles/fonts.ts`, `styles/fonts.css`, `index.html`, `public/licenses/fonts/*` | self-hosted fonts |
| `build/csp.ts`, `public/_headers`, `build/csp.security.test.ts` | CSP |
| `content/verbatim.test.ts`, `.oxlintrc.json`, `security/noEval.security.test.ts`, `security/cdn.security.test.ts` | overlap, lint, grep gates |
| `e2e/security.spec.ts` | CSP violations, non-self requests, glyph check |

**Collision check:** P never edits `stage/**` or `components/**`. D never edits `content/*` except
`stageVocab.ts`. S never edits W's files, and adds tests beside them. The only shared seam is the
**type** layer (`content/stage.ts`, `stage/types.ts`), which is frozen (§7).

## 6. Test plan

### 6.1 Vitest (node environment, no new test dependencies)
**Content walker** (`content/walk.ts`, W). It is the shared hook that P's and S's lints build on:
```ts
export interface TextSite { where: string; field: string; text: string }   // where: 'l1-average:b2' | 'l1-average.clues[1].ask'
/** Every authored string in reading order: corrections → per unit: story beats (text, caption) → lecture → books →
 *  visual → clues → insight → pitfalls → review → play (prompt, options, hints, walkthrough). Matches P2 §5. */
export function readingOrder(l: Lecture): TextSite[]
export function texSpans(text: string): { tex: string; display: boolean }[]
export function texSymbols(tex: string): string[]      // '\\hbar', '\\vec\\mu', 'S_z', '|{+z}\\rangle', '\\langle\\cdot\\rangle' …
export function glossRefs(text: string): string[]      // [[id]] / [[id|…]]
export function termRefs(text: string): string[]       // {{id|…}} and \htmlClass{term-id}
```
| file | owner | asserts |
|---|---|---|
| `content/content.test.tsx` | W | **Schema validity:** unit ids, challenge ids and beat ids are unique; beat ids match `^<unit>:b<n>$`, numbered from 1; phases run L → B → C within a unit; exactly 3 hints each. **Beat-state validity:** `validateStage(s)` is `[]` for every state; layouts never repeat a kind; `JSON.parse(JSON.stringify(stage))` equals `stage`. `resolve` at s ∈ {0, ¼, ½, ¾, 1} gives only finite numbers, P ∈ [0, 1], `plus + minus + Σ blocked = 1`, pure Bloch \|r\| = 1 ± 1e-9, ball \|r\| ≤ 1, Hermitian operators, and plane kets that are real. `interpolate` between consecutive beats at t = 0, 0.1, …, 1 keeps every invariant, e.g. \|r\| = 1 throughout a Bloch slerp. **Terms:** every `termRefs` id is in `beat.terms`, every `terms` key is used, the anchor ∈ `ANCHORS[kind]`, and that kind is in the beat's layout. **Glosses:** every `glossRefs` id is in `GLOSSARY`; `uses` is closed; `first` exists. **Fidelity:** each kind used has ≥ 1 item in each list; ids are unique; `beat.fidelity` ids exist for that beat's kinds. **KaTeX:** every `texSpans` of every `readingOrder` site plus passports, glossary, fidelity and review goes through `renderAuthoredTexStrict` with 0 ParseErrors. **Claims:** every `holds()` and `Correction.check()` is true. **Static render:** `renderToString(<UnitView/>)` of every unit (SSR ⇒ StaticStory path) throws nothing and contains 0 `katex-error`. |
| `content/symbols.test.ts` | P | symbol-before-use over `readingOrder` + `texSymbols`. A symbol is defined if `Lecture.symbols`, a gloss's `symbols`, or a prerequisite lecture has it before first use. The 14 P2 §5 FLAG rows are fixtures. Also ≤ 25-word sentences in core text and review. |
| `content/claims.test.ts` | P | every decimal, fraction or % in beat text, caption or review appears in a `Claim` of that beat or unit, and matches `claims.json` (numpy) |
| `stage/sample.test.ts` | W | hold/transition boundaries at k ± w, n = 1, u = 0 and u = n, reduced motion gives cuts and 3 sweep stops |
| `stage/interp.test.ts` | W | the §2.6 rules: slerp never leaves S²; a pure→mixed chord is linear in r; `selective` is a cut; operator lerp is linear in ℝ⁴; the lab tilt lerp recomputes `benchTheory` (checked against a direct call) |
| `stage/store.test.ts` | W | `trackUnit`→`releaseUnit`→`trackUnit` returns the same object (StrictMode); `setBeat` notifies once per change |
| `stage/stacking.test.ts` | W | CSS grep: `main`, `.lecture`, `.unit`, `.story`, `.story-stage-col` use none of the forbidden properties (§2.7) |
| `physics/*.test.ts` | W | §3 (moved hopf; new density, operators, field, expr + fuzz), against `numpy.json` |
| `build/chunks.test.ts` | W | runs if `dist/chunk-modules.json` exists: no module id containing `/@babylonjs/` in the entry chunk or any chunk reachable from `LecturePage` or `StageHost`; `three` is not in the entry chunk |
| `*.security.test.ts`, `content/verbatim.test.ts` | S | §4 |

`dist/chunk-modules.json` is written by a small Rollup plugin, `build/chunkReport.ts` (W), in
`generateBundle`: chunk file → `moduleIds`, `imports`, `dynamicImports`. The Vite manifest does not list the
node_modules inside a chunk, so it cannot answer the Babylon question.

### 6.2 Playwright (`@playwright/test` as a devDependency; browser download needs the user's OK)
- **Browser:** `channel: 'chrome'` uses the Google Chrome already installed on the user's Mac, so **no
  download**. Bundled Chromium (`npx playwright install chromium`, about 150–170 MB into
  `~/Library/Caches/ms-playwright`) only with the user's go-ahead, or later in CI.
- **Two projects:** `preview` (`vite build && vite preview --port 4178 --strictPort`: production build with the
  CSP meta) and `dev` (`vite --port 5178`: StrictMode double effects). Viewports: 1440×900 (gates),
  1000×640 (screenshots, per BUILD-LOG), 800×900 (static).
- `e2e/helpers.ts` wraps `window.__stage`. All scrolling goes through `__stage.scrollToBeat(beatId, { wait: false })`,
  which is deterministic under rAF throttling.

| spec | checks (fail condition) |
|---|---|
| `story.spec.ts` › every beat | For every unit and every beat: scroll to it, then assert `beats()[unit].beat` is the index, the caption equals the beat caption, the passport equals `passportOf`, and `views()` shows exactly the layout's kinds drawn with weight > 0. Screenshot the stage box to `e2e/__screens__/<lecture>/<beatId>.png` (git-ignored; input to D's visual QA). |
| › console | any `console.error` or `pageerror` during the whole run |
| › CSP + network | any `securitypolicyviolation` (collected by `addInitScript`); any request whose origin ≠ the base URL |
| › one context | after L1: `contexts − contextsLost === 1`; after `/` → L1 → `/formulas` → L1: `contexts === 1` (App-level canvas); at 800 px: `contexts === 0` |
| › trigger hygiene (`dev`) | `triggers()` = number of story units on L1; 0 after navigating to `/`; the same count again after returning; no duplicates under StrictMode |
| › stacking | at every label, passport and caption centre: `elementsFromPoint` puts the label first and the canvas before `.story-stage-col` |
| › contrast | `contrastAll()` worst ratio ≥ 4.5 : 1 (gate method) |
| › reduced motion | `emulateMedia({ reducedMotion: 'reduce' })`: beats still sync; two frames 500 ms apart render the same readouts (clock frozen) |
| › context loss | `loseContext()` → every unit shows `StaticStory` within 1 s; no `console.error` |
| › static | at 800 px: no `<canvas>`; `sg-lab` and `projector` widgets and every beat text are present |
| › perf `@perf` (local only) | `bench()` p95 ≤ 8 ms per stage on the user's laptop |
| `security.spec.ts` (S) | CSP on every route including widgets; fonts; glyph fallback |

Scripts (`package.json`, W): `"test": "vitest run"`, `"e2e": "npm run build && playwright test --project=preview"`,
`"e2e:dev": "playwright test --project=dev"`, `"fixtures": "python3 ../pipeline/make_fixtures.py"`.

### 6.3 CI later (do not create now; S §4i outline)
In GitHub Actions: `npm ci --ignore-scripts && npm rebuild`, then `oxlint`, `tsc -b`, `vitest run` (the
verbatim test self-skips), `vite build` with the chunk test and the `dist/` CDN grep, then Playwright
`preview` with `npx playwright install --with-deps chromium` (cached) and `--use-angle=swiftshader` for
software WebGL, `--grep-invert @perf`, with screenshots uploaded as artifacts. Visual diffs do not gate; D
reviews them. The frame-time gate stays local on the user's laptop, as in Phase 0.

## 7. Build order + interface freeze

### 7.1 W0: contracts PR (W alone, on `main`, before anyone else starts building)
1. **Types and data shapes:** `content/stage.ts`, the `schema.ts` additions, and `content/walk.ts`. Also the
   typed skeletons `stageVocab.ts` (D), `fidelity.ts` + `glossary.ts` (P, with P2 §2–3 pasted as data), and
   `stage/tokens.ts` (D, gate colours).
2. **Pure runtime:** `stage/types.ts`, `stage/sample.ts`, `stage/resolve.ts` + `validateStage` +
   `stage/interp.ts`. These are complete for `lab-r3` and `hilbert-plane`. The other four kinds have resolvers
   too, since the maths exists, but they are not on screen in L1.
3. **Scene hooks + minimal renderer:** `stage/hooks.ts`, `stage/views.ts`, `stage/StageHost.tsx` (Canvas,
   Driver, ViewRenderer; no governor or context-loss polish yet), and `stage/scenes/index.ts` with a
   placeholder scene per L1 kind (wireframe + passport). Plus **`stage/Workbench.tsx`**: a DEV-only route
   `#/dev/stage/:lecture/:unit` that mounts one unit's stage with a beat slider (u), a motion toggle and a
   term picker. **D can then build scenes the day after freeze without waiting for scroll wiring.**
4. **Moves:** `physics/hopf.ts` (and its test), `physics/field.ts` (D's lab scene needs `streamlines`).
5. **Security seams:** `ui/tex.ts` (S §4a verbatim), `Rich.tsx` on `renderAuthoredTex` with the
   `[[gloss]]`/`{{term}}` syntax, the interim `Object.hasOwn` fix in `parseNumber.ts`, and the stubs
   `build/csp.ts` (no-op `cspMeta`) and `styles/fonts.ts` (empty), so that `vite.config.ts` and `main.tsx`
   carry their final import lines.
6. **Dependencies:** all `package.json` changes (fontsource ×3, `@playwright/test`), the vitest `exclude: ['e2e/**']`,
   `playwright.config.ts` with the `channel: 'chrome'` project.
7. **Gates:** `content/content.test.tsx` running on today's L1 (no story yet) plus a DEV fixture
   `content/__fixtures__/demoStory.ts` (3 beats: lab → split lab | plane → plane) that goes through resolve,
   interp, Workbench and StaticStory.

**Freeze criterion** (measured, recorded in BUILD-LOG): `tsc -b`, `vitest run` and `vite build` are green;
`L1.ts` is byte-identical and type-checks; the demo story renders in the Workbench with
`__stage.contexts === 1`. Tag `l1-freeze`.

**Frozen at the tag:** everything exported from `content/stage.ts`, `content/schema.ts`, `content/walk.ts`,
`stage/types.ts`, `stage/hooks.ts`, `stage/store.ts`, `ui/tex.ts`, and the `physics/*` signatures in §3.
Additive, optional changes go through W. Anything else is an **interface change**: the requesting role writes
a note in `docs/roles/interface-changes.md`, Claude judges, W applies it on `main`, and the others rebase.
D's `stageVocab.ts` may grow at will; removing a name is a change.

### 7.2 After freeze, in parallel (≤ 4 worktrees)
| role | worktree | builds | self-check before handing back |
|---|---|---|---|
| **W1** | `w-l1` | scroll wiring (`useStoryScroll`, `StoryStage`, overlay, drawer, gloss, review), context loss, dpr governor, `StaticStory`, `WidgetIsland`, instrumentation, `UnitView`/`LecturePage` integration, `physics/{operators,density,expr}.ts` + fixtures, chunk report, Playwright `story.spec.ts` | vitest + build green; Playwright on the demo story: 1 context, trigger hygiene, 0 console errors |
| **D** | `d-l1` | `LabR3Scene`, `HilbertPlaneScene`, `overlay.css`, vocab, tokens, `docs/roles/scene-specs/L1.md` | Workbench screenshot per P2 beat; contrast ≥ 4.5 : 1; `bench()` p95 ≤ 8 ms |
| **P** | `p-l1` | `L1.story.ts`, `L1.review.ts`, P1 fixes in `L1.ts`, `glossary.ts`, `fidelity.ts`, `symbols.test.ts`, `claims.test.ts`, `make_claim_fixtures.py` | `content.test.tsx` + P's lints green; StaticStory reads correctly |
| **S** | `s-l1` | §4 (tex tests, progress, fonts, CSP, `_headers`, verbatim, lint gates, `security.spec.ts`) | its tests green; `vite build` output passes the CDN grep |

### 7.3 Merge order (Claude integrates; full suite after each merge)
1. **W0**, tagged `l1-freeze`.
2. **S**. Its files are disjoint from everyone's, and merging it early means every later merge runs under the
   real CSP and fonts. A CSP violation then shows up as the fault of whoever introduced it.
3. **W1**, the runtime. Needed before real beats can be scroll-tested.
4. **P**, the content. It is validated by the content tests alone and needs no scene.
5. **D**, the scenes, rebased onto real beats so the per-beat screenshots are the final ones.

Then ROUND 3 verification (PLAN): the full Playwright run (the §6.2 table) feeds P's truth report, S's diff
audit and D's visual QA. Failures go back to the owning role as targeted fix tasks.

## 8. Risks and questions

### 8.1 Risks
| # | risk | likelihood / impact | mitigation |
|---|---|---|---|
| R1 | The custom View gets a detail wrong that drei handles: per-portal `size`/aspect, DPR changes, resize, camera `fitCamera` | medium / high | Port drei's `View` portal code (MIT) and remove only the React visibility state. The portal state is injected with the view's `size`. Playwright `views()` and per-beat screenshots catch wrong rects. Fallback: drei `<View>` plus the matching backing colour, which is the gate's proven state. |
| R2 | A persistent App-level canvas keeps GPU memory alive on non-lecture routes, and Safari may reclaim the context in the background | low / medium | `frameloop: 'demand'`, hidden canvas, `useKindResources` disposes after 30 s idle; context loss → `StaticStory` (§2.7), tested with `loseContext()` |
| R3 | Stacking and sticky layout break when someone adds a `transform`/`overflow` on an ancestor, the gate's "layering fragility" | medium / high (labels vanish under the scene) | explicit z-indexes, the forbidden-property list, a CSS grep test, the `elementsFromPoint` Playwright probe |
| R4 | The piecewise beat mapping drifts after late layout (KaTeX, fonts, `[[gloss]]` popovers) | medium / medium | popovers are portalled (no reflow); ResizeObserver + `fonts.ready` refresh (gate-proven); the Playwright per-beat check asserts beat ↔ caption |
| R5 | D's scene spec (in progress in parallel) needs state fields this schema lacks | medium / low | D reviews §1–2 before `l1-freeze`, and additive optional fields are cheap. After freeze, the interface-change note process applies. Vocabulary is D-owned. |
| R6 | A wrong in-between frame: an interpolation shows a number that is false for the picture | low / high (physics truth beats beauty) | "interpolate inputs, recompute outputs" (§2.6); `interp.test.ts` invariants at 11 t-steps between every pair of consecutive beats |
| R7 | Static-fallback mismatch: `sg-lab` cannot show two parallel benches; bloch/ball/hopf/operator have no 2D widget | certain for L6, none for L1 | `logic-order` for two benches; text + fidelity only for the others until L6 adds SVG diagrams |
| R8 | `hilbert-plane` in WebGL has softer text and arrows than SVG | low / low | labels are DOM anyway. It stays in WebGL so a split lab \| plane beat moves in one frame with one transition. D may switch it to an SVG overlay driven by the same `StageFrame` if screenshots disagree (the runtime allows a DOM-rendered kind). |
| R9 | Bundle weight: three + r3f + drei in the host chunk | low / low | the host is lazy (three-free `demand.ts`); the chunk test asserts three is not in the entry chunk |

### 8.2 Questions for the user (each with a recommendation)
**Q1. When a unit has a scroll story, what happens to the old per-unit blocks?** The beats already carry "the
lecture says" and "the books add" (with page refs), so showing both would duplicate them.
*Recommendation:* with a story, the unit reads: story (L → B → C beats) → **Try it** (the existing
interactive widget) → **Follow the clues** (click-to-reveal questions) → intuition → pitfalls → review card →
challenges. The separate "lecture says" and "books add" blocks disappear; their content and page refs live in
the beats. Units without a story are unchanged.

**Q2. Reduced motion: what should the stage do?** The gate froze every stage on its final picture. The stage
then contradicts the earlier beats a reader is looking at.
*Recommendation:* scroll still chooses the beat, so the picture always matches the text. Every change is a
cut, sweeps jump in three steps, and nothing moves on its own: no atom flow, no drift, no camera moves.

**Q3. Browser for the automated page tests (Playwright).** They can drive the Google Chrome already on your
Mac, with nothing to download. Or Playwright can download its own Chromium, about 150–170 MB into
`~/Library/Caches/ms-playwright`. Nothing is downloaded without your OK.
*Recommendation:* use your installed Chrome now. Download Chromium only later, inside CI, if we set CI up.
