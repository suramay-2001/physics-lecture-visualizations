/**
 * What a bench's Babylon scene gives `mountLab` (the engine, the on-demand frame loop, context loss and the probe
 * stay in mountLab; each bench builds its picture, cameras and handles here). Types only.
 */
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Scene } from '@babylonjs/core/scene'
import type { LabGuiAction, LabGuiMode, LabView } from '../handle'

export interface BenchSceneContext {
  scene: Scene
  /** The orbiting camera (pointer and keyboard input attached); a bench may link more cameras to it. */
  camera: ArcRotateCamera
  canvas: HTMLCanvasElement
  /** Ask for a frame (the loop is on demand). */
  requestRender(): void
  /** A gesture on an affordance → the page's store action (through LabHandle.onGui). */
  emit(a: LabGuiAction): void
}

/** A point of the scene (render coordinates) and the view whose camera draws it. */
export interface ScenePoint {
  world: Vector3
  view?: string
}

export interface BenchScene {
  update(view: LabView): void
  /** The camera that draws view `id` (the orbiting camera when omitted or single-view). */
  cameraOf(id?: string): Camera
  /** A named anchor for DOM labels whose place only the scene knows (null: hidden). */
  anchor(name: string): ScenePoint | null
  /** A drag handle (or the bead) as drawn (null: absent or hidden). */
  handle(id: string): ScenePoint | null
  /** Before each frame: linked cameras, billboards. */
  beforeFrame(): void
  /** A drag or hover is in progress: keep drawing. */
  active(): boolean
  /** The canvas was resized: refit viewports and cameras. */
  resize(): void
  setGuiMode(mode: LabGuiMode): void
  /**
   * The meshes view `id`'s camera would draw now (enabled, visible, on its layer, inside its frustum, near and far planes
   * included), by name: what a test checks a view shows. Optional; a single-view bench may leave it out.
   */
  seen?(id: string): string[]
  dispose(): void
}
