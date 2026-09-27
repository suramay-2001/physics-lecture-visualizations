/**
 * The contract between the lab page (DOM, store, engine values) and the Babylon side (`babylon/mountLab.ts`),
 * W-lab §2. Types only: the page never imports Babylon, and the Babylon side never imports physics values or
 * formats a number (lab/rules.test.ts). The page computes the view from the engine and hands it over; the
 * Babylon side draws it, projects DOM label anchors after each frame and reports GUI gestures as actions.
 */
import type { V3 } from './axes'

/** What the canvas draws, all in PHYSICS coordinates (the Babylon side maps them to render axes). */
export interface LabView {
  /** The state bead: the engine's Bloch vector. */
  bead: V3
  /** The slider affordance's position, in degrees [0, 720) (a control value, mirrored from the store). */
  phi: number
}

/** A gesture on a GUI affordance: the page turns it into the same store action as its DOM twin. */
export type LabGuiAction = { type: 'step'; dir: 1 | -1 } | { type: 'phi'; deg: number }

/** CSS px, relative to the canvas's top-left, of a physics point through the current camera (null: behind it). */
export type Projector = (p: V3) => [number, number] | null

export interface LabMountOptions {
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
  /** Called after every frame with a projector for DOM labels; returns the unsubscribe. */
  onRender(cb: (project: Projector) => void): () => void
  onGui(cb: (a: LabGuiAction) => void): () => void
  dispose(): void
}

/** Result of `__lab.bench()`: frame times of continuous orbiting, each frame fenced by a 1-pixel readPixels. */
export interface LabBench {
  frames: number
  gui: boolean
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
  /** Viewport (page) CSS px of a physics point. */
  project(p: V3): [number, number] | null
  /** Put the camera at a physics azimuth / elevation (degrees) and distance, vertical fov (degrees); renders. */
  shot(azDeg: number, elDeg: number, d: number, fovDeg: number): void
  bench(opts?: { frames?: number; gui?: boolean }): Promise<LabBench>
  /** Screen (viewport px) of the bead mesh as drawn (its world position, projected). */
  beadScreen(): [number, number] | null
  /** Simulate a GPU reset (WEBGL_lose_context). */
  loseContext(): boolean
}
