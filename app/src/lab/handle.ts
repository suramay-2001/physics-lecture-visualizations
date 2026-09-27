/**
 * The contract between the lab page (DOM, store, engine values) and the Babylon side (`babylon/mountLab.ts`),
 * W-lab §2. Types only: the page never imports Babylon, and the Babylon side never imports physics values or
 * formats a number (lab/rules.test.ts). The page computes the view from the engine and hands it over; the
 * Babylon side draws it, projects DOM label anchors after each frame and reports gestures as actions.
 */
import type { V3 } from './axes'

/** The frame check's picture, in PHYSICS coordinates (the Babylon side maps them to render axes). */
export interface FrameLabView {
  bench: 'frame'
  /** The state bead: the engine's Bloch vector. */
  bead: V3
  /** The slider affordance's position, in degrees [0, 720) (a control value, mirrored from the store). */
  phi: number
}

/** A turn's orbit on the Bloch sphere: centre (â·r₀)â, axis â, radius √(1 − (â·r₀)²). */
export interface Orbit {
  center: V3
  axis: V3
  radius: number
}
/** The Operator Lab's handles (each has a DOM twin on the page). */
export type OperatorHandle = 'tip' | 'psi0' | 'bead'
/** The Operator Lab's two views: operator space and state space (one engine, linked cameras). */
export type OperatorViewId = 'op' | 'state'

/** The Operator Lab's picture (D-lab §2.2): engine values in physics coordinates (benches/operator/model.ts). */
export interface OperatorLabView {
  bench: 'operator'
  /** Left/right on a wide stage, top/bottom on a squarer one (the page measures the stage box). */
  split: 'lr' | 'tb'
  /** Draw scale of the operator-space arrows (1, ½, or 1.5/|longest|): the page applies it back to drags. */
  scale: number
  /** a⃗ (its real part); a silver outline when A is not Hermitian. */
  a: V3
  outline: boolean
  showArrow: boolean
  /** â (eigen-axis in operator space = turn axis in state space); null when there is none or it is hidden. */
  axis: V3 | null
  /** The gauge: a₀ and the two real eigenvalues (null = hidden). */
  gauge: { a0: number | null; plus: number | null; minus: number | null }
  /** Operator B's arrow and a⃗ × b⃗ (the arrow of [A, B]/2i) in commutator mode. */
  b: V3 | null
  cross: V3 | null
  /** ψ₀'s Bloch vector (the hollow ring) and the bead U(τ)ψ₀. */
  psi0: V3
  bead: V3
  showBead: boolean
  orbit: Orbit | null
  /** The arc the bead travelled from ψ₀ (≤ one lap). */
  arc: V3[]
  /** The handle whose DOM twin has focus (highlighted in the scene). */
  focus: OperatorHandle | null
  draggable: Record<OperatorHandle, boolean>
}

/**
 * The Grapher's geometry (D-lab §2.4), built on the page from the engine's samples (benches/grapher/model.ts): box
 * coordinates, physics axes (z up), every number finite (gap samples are holes: no triangle or line uses them).
 * A new object whenever a re-sample, a layer or the scale changed it: the scene re-uploads only then.
 */
export interface GrapherGeometry {
  /** 'graph' = graph space (a surface or a curve in the fitted box); 'bloch' = the Bloch sphere. */
  space: 'graph' | 'bloch'
  /** The fitted box's corners (graph space), null on the Bloch sphere. */
  box: { min: V3; max: V3 } | null
  /** The solid layer: xyz per sample, sRGB rgba per sample (the luminance ramp), triangles between drawn samples. */
  surface: { positions: Float32Array; colors: Float32Array; indices: Uint32Array } | null
  /** The wire layer's polylines (xyz), one tone. */
  wire: Float32Array[]
  /** A curve or a Bloch path: pieces between gaps, xyz and rgba per point (shade = t). */
  path: { points: Float32Array; colors: Float32Array }[]
}
/** A handle's constraint surface (babylon/drag.ts), in the view's physics coordinates. */
export type GrapherDrag = { kind: 'plane'; point: V3; normal: V3 } | { kind: 'screen' } | { kind: 'sphere'; center: V3; radius: number }

/** The Grapher's picture: the geometry and the one handle (the cursor; its DOM twin is on the page). */
export interface GrapherLabView {
  bench: 'grapher'
  geometry: GrapherGeometry
  /** The cursor (null = not drawn: a gap there); `floor` = the foot of its drop line; `state` = a near-white state bead. */
  cursor: { at: V3 | null; floor: V3 | null; state: boolean }
  drag: GrapherDrag | null
  /** The cursor's DOM twin has focus (the scene highlights the handle). */
  focus: boolean
}

/** A rigid frame in physics coordinates: origin and rotation (row-major 3×3, columns = the local axes). */
export interface SgFrame {
  o: V3
  R: number[]
}
/** One magnet of the SG bench (benches/sg/layout.ts): base = the untilted entrance frame, tilted = base · R_y(τ). */
export interface SgModuleView {
  base: SgFrame
  tilted: SgFrame
  /** Greyed preparation magnet (a |±z⟩ or |±x⟩ source): drawn, never editable. */
  prep: boolean
}
/** The bench's hardware places (physics), built on the page; a new object only when the setup changes. */
export interface SgLayoutView {
  modules: SgModuleView[]
  prep: SgModuleView | null
  /** Stop k blocks magnet k's other beam (every magnet but the last); its two pads choose the kept beam. */
  stops: { frame: SgFrame; pads: { plus: V3; minus: V3; kept: '+' | '-' } }[]
  /** The preparation magnet's stop (no pads: a source is not edited on the bench). */
  prepStop: SgFrame | null
  /** Protractor ring (centre, beam axis) and knob per counted magnet. */
  rings: { center: V3; axis: V3; knob: V3 }[]
  removePads: (V3 | null)[]
  addPad: V3 | null
  plate: SgFrame
  source: { kind: 'oven' | 'sealed'; frame: SgFrame }
  slit: SgFrame | null
  rail: { from: V3; to: V3 }
  mid: V3
  length: number
  /** The protractor ring's radius. */
  ring: { radius: number }
  /** The floor's height (physics z). */
  floorZ: number
}
/** Geometry-only hardware meshes from `lab.glb` (lab/glb.ts), physics-local coordinates of their part. */
export interface SgHardwareMesh {
  name: string
  positions: Float32Array
  normals: Float32Array
  indices: Uint16Array | Uint32Array
}
/** A volley in flight (benches/sg/plate.ts): paths, tones, start and flight time per drawn atom. */
export interface SgFlightView {
  id: number
  n: number
  points: Float32Array
  tones: Uint8Array
  t0: Float32Array
  dur: Float32Array
  end: number
}
/** Handles of the SG bench: knob-k (drag), keep-k-plus / keep-k-minus, remove-k, add (taps). */
export type SgHandle = string
/** The SG bench's picture (D-lab §2.1): hardware places, the pole profile, field lines, the plate's marks, a volley. */
export interface SgLabView {
  bench: 'sg'
  layout: SgLayoutView
  /** The pole profile (physics/field.ts POLE), schematic units. */
  pole: { tipZ: number; tipR: number; shoulderZ: number; grooveHalf: number; grooveDepth: number; halfWidth: number }
  /** Field lines in a magnet's tilted frame (physics/field.ts `streamlines`), null = hidden. */
  field: V3[][] | null
  /** Blender hardware; null until lab.glb is read (procedural stand-ins meanwhile) or when it cannot be. */
  hardware: SgHardwareMesh[] | null
  /** The sealed box's or the source's tone for its label and beam: 0 unpolarized, 1 +, 2 −. */
  sourceTone: 0 | 1 | 2
  /** The plate's marks (plate-local, arrival order), how many are shown before the volley, and the volley's arrivals. */
  marks: { key: string; pos: Float32Array; sign: Uint8Array; count: number; start: number; arrive: Float32Array | null }
  /** The volley in flight (null: none, or reduced motion) and the clock to draw it at (null: the wall clock). */
  flight: SgFlightView | null
  clock: number | null
  /** The plate inset (fractions of the canvas, top-left origin): the plate seen face-on along the beam. */
  inset: { x: number; y: number; w: number; h: number } | null
  /** The knob whose DOM twin has focus. */
  focus: number | null
  /** Motion on: adding or removing a magnet slides the parts (300 ms); off: a cut. */
  motion: boolean
  /** CSS px of the stage's right strip that DOM readouts cover (0 when they sit in the paper column): the camera frames the bench left of it. */
  rightStrip: number
}

/** What the canvas draws: one view type per bench. */
export type LabView = FrameLabView | OperatorLabView | GrapherLabView | SgLabView
export type LabBenchId = LabView['bench']

/**
 * A gesture on an affordance: the page turns it into the same store action as its DOM twin. A drag reports the
 * pointer's point on the handle's constraint surface in PHYSICS coordinates (a plane facing the camera, the sphere,
 * or the orbit's plane); the page turns that point into parameters with the engine. `p` is null on 'end'.
 */
export type LabGuiAction =
  | { type: 'step'; dir: 1 | -1 }
  | { type: 'phi'; deg: number }
  | { type: 'drag'; handle: string; phase: 'start' | 'move' | 'end'; p: V3 | null }
  /** A tap on a pad (the SG bench's ± pads, "+" add, "−" remove): the same action as its DOM twin. */
  | { type: 'pick'; handle: string }

/**
 * CSS px, relative to the canvas's top-left, of a physics point through the camera of `view` (the bench's first view
 * when omitted); null when it is behind the camera.
 */
export type Projector = (p: V3, view?: string) => [number, number] | null
/** CSS px of a named scene anchor whose place only the scene knows (e.g. the a₀ gauge marker); null if hidden. */
export type AnchorProjector = (name: string) => [number, number] | null

export interface LabMountOptions {
  /** Which bench's scene to build (one engine per mounted bench stage). */
  bench: LabBenchId
  motion: boolean
  onContextLost: () => void
  onContextRestored: () => void
  /** Measurement and safety hooks (lab/instrument.ts), injected so babylon/** imports nothing from the page. */
  hooks: {
    frame(): void
    mounted(probe: LabProbe, engines: () => number): () => void
    trip(url: string): void
  }
}

export interface LabHandle {
  update(view: LabView): void
  /** false: every animation is a cut (camera inertia 0). */
  setMotion(on: boolean): void
  /** Called after every frame with projectors for DOM labels; returns the unsubscribe. */
  onRender(cb: (project: Projector, anchor: AnchorProjector) => void): () => void
  onGui(cb: (a: LabGuiAction) => void): () => void
  dispose(): void
}

/**
 * GUI layer during a bench: 'on' = every affordance (the ring is linked to the bead, so it moves on every orbit frame
 * and the GUI texture is redrawn and re-uploaded each frame); 'static' = the ring hidden (slider and pad never move
 * while orbiting, so the texture is only composited); 'off' = no GUI update or composite at all. Benches without a
 * GUI layer ignore it.
 */
export type LabGuiMode = 'on' | 'static' | 'off'

/** Result of `__lab.bench()`: frame times of continuous orbiting, each frame fenced by a 1-pixel readPixels. */
export interface LabBench {
  frames: number
  gui: LabGuiMode
  p50: number
  p95: number
  max: number
  canvas: [number, number]
  viewport: [number, number]
  hardwareScaling: number
  activeMeshes: number
  /** The procedural room is prefiltered and lights the PBR materials (benches that use babylon/look.ts). */
  environment: boolean
}

/** What the mounted Babylon side exposes to `window.__lab` (DEV or ?measure only). */
export interface LabProbe {
  /** Viewport (page) CSS px of a physics point (through the camera of `view`). */
  project(p: V3, view?: string): [number, number] | null
  /** Put the camera at a physics azimuth / elevation (degrees) and distance, vertical fov (degrees); renders. */
  shot(azDeg: number, elDeg: number, d: number, fovDeg: number): void
  /**
   * Orbit the camera for `frames` frames, each fenced by a 1-pixel readPixels. `step(i)` (page side) runs before frame
   * i and is timed with it: the drag bench moves a handle through the page's store → engine model → handle.update path,
   * so the time includes the model, the scene update and the draw.
   */
  bench(opts?: { frames?: number; gui?: LabGuiMode; step?: (i: number) => void }): Promise<LabBench>
  /** Screen (viewport px) of the bead mesh as drawn (its world position, projected). */
  beadScreen(): [number, number] | null
  /** Screen (viewport px) of a drag handle as drawn (null when absent, hidden or behind the camera). */
  handleScreen(id: string): [number, number] | null
  /** Simulate a GPU reset (WEBGL_lose_context). */
  loseContext(): boolean
}
