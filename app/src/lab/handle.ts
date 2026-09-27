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

/** What the canvas draws: one view type per bench. */
export type LabView = FrameLabView | OperatorLabView
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
