/**
 * Drag handles for every bench (decisions/lab.md ruling 2): Babylon's PointerDragBehavior runs the gesture (which
 * pointer, which button, start/move/end), and this module turns the pointer into a point on the handle's
 * CONSTRAINT surface, reported in physics coordinates. Nothing here moves a mesh: the page turns the point into
 * parameters with the engine, the store changes, and the scene is redrawn from the new view (the store drives the
 * scene; the scene never computes physics). Every handle has a DOM twin on the page (keyboard, screen reader).
 *
 * Constraint surfaces (pure geometry of the pointer ray):
 *   'screen'  the plane through the handle facing the camera (a free point, e.g. the tip of an arrow);
 *   'sphere'  the front hit of the ray on a sphere, or the nearest point of its rim when the ray misses (a state);
 *   'plane'   the ray's hit on a plane (a bead on an orbit); when the plane is nearly edge-on, the plane facing the
 *             camera is used and its point is projected onto the plane.
 * While a handle is dragged the view's orbiting camera is detached, so the drag never also turns the picture.
 */
import { PointerDragBehavior } from '@babylonjs/core/Behaviors/Meshes/pointerDragBehavior'
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { Ray } from '@babylonjs/core/Culling/ray.core'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { Scene } from '@babylonjs/core/scene'
import { physToRender, renderToPhys, type V3 } from '../axes'

export type DragConstraint = { kind: 'screen' } | { kind: 'sphere'; center: V3; radius: number } | { kind: 'plane'; point: V3; normal: V3 }

export interface DragHandleOptions {
  id: string
  /** The pickable mesh (often a larger invisible proxy around the visible handle). */
  mesh: AbstractMesh
  /** The camera of the handle's view (picking rays and the camera-facing plane). */
  camera: Camera
  /** The camera that orbits on pointer drags: detached while this handle is dragged. */
  orbit: ArcRotateCamera
  /** The surface the handle moves on right now, or null when it cannot be dragged. */
  constraint(): DragConstraint | null
  /** A point of the surface (physics coordinates); null on 'end'. */
  onDrag(phase: 'start' | 'move' | 'end', p: V3 | null): void
  /** The pointer is over the handle (or no longer). */
  onHover?(on: boolean): void
}

export interface DragHandle {
  readonly id: string
  dragging(): boolean
  dispose(): void
}

const toVec = (p: V3) => {
  const [x, y, z] = physToRender(p)
  return new Vector3(x, y, z)
}
const toPhys = (v: Vector3): V3 => renderToPhys([v.x, v.y, v.z])

/** The ray's hit on the plane (point, normal), or null when it is (nearly) parallel or behind the origin. */
function rayPlane(ray: Ray, point: Vector3, normal: Vector3, minCos = 0.08): Vector3 | null {
  const n = normal.normalizeToNew()
  const den = Vector3.Dot(ray.direction, n)
  if (Math.abs(den) < minCos) return null
  const t = Vector3.Dot(point.subtract(ray.origin), n) / den
  if (t <= 0) return null
  return ray.origin.add(ray.direction.scale(t))
}

/** Front hit of the ray on the sphere, else the point of the sphere's rim (as seen from the ray origin) nearest the ray. */
function raySphere(ray: Ray, center: Vector3, r: number): Vector3 {
  const oc = ray.origin.subtract(center)
  const b = Vector3.Dot(oc, ray.direction)
  const c = Vector3.Dot(oc, oc) - r * r
  const disc = b * b - c
  if (disc >= 0) {
    const t = -b - Math.sqrt(disc)
    if (t > 0) return ray.origin.add(ray.direction.scale(t))
  }
  // miss: the closest point of the ray to the centre, pushed out to the sphere (lands on the silhouette side)
  const tc = Math.max(0, -b)
  const closest = ray.origin.add(ray.direction.scale(tc)).subtract(center)
  const len = closest.length() || 1
  return center.add(closest.scale(r / len))
}

export function attachDragHandle(scene: Scene, o: DragHandleOptions): DragHandle {
  const behavior = new PointerDragBehavior({})
  behavior.moveAttached = false
  behavior.detachCameraControls = false
  behavior.useObjectOrientationForDragging = false
  behavior.updateDragPlane = true
  behavior.dragButtons = [0]
  let active = false

  const ray = (): Ray => scene.createPickingRay(scene.pointerX, scene.pointerY, null, o.camera)
  const pointOn = (c: DragConstraint, planePoint: Vector3): V3 | null => {
    if (c.kind === 'screen') return toPhys(planePoint)
    const r = ray()
    if (c.kind === 'sphere') return toPhys(raySphere(r, toVec(c.center), c.radius))
    const p = toVec(c.point)
    const n = toVec(c.normal)
    const hit = rayPlane(r, p, n)
    if (hit) return toPhys(hit)
    // edge-on: project the camera-facing plane's point onto the constraint plane
    const nn = n.normalizeToNew()
    return toPhys(planePoint.subtract(nn.scale(Vector3.Dot(planePoint.subtract(p), nn))))
  }

  const start = behavior.onDragStartObservable.add((e) => {
    const c = o.constraint()
    if (!c) {
      behavior.releaseDrag()
      return
    }
    active = true
    scene.cameraToUseForPointers = o.camera
    o.orbit.detachControl()
    o.onDrag('start', pointOn(c, e.dragPlanePoint))
  })
  const move = behavior.onDragObservable.add((e) => {
    const c = o.constraint()
    if (!active || !c) return
    o.onDrag('move', pointOn(c, e.dragPlanePoint))
  })
  const end = behavior.onDragEndObservable.add(() => {
    if (!active) return
    active = false
    o.orbit.attachControl()
    o.onDrag('end', null)
  })
  o.mesh.isPickable = true
  o.mesh.enablePointerMoveEvents = true
  o.mesh.addBehavior(behavior)

  const hover = scene.onPointerObservable.add((pi) => {
    if (!o.onHover || pi.type !== PointerEventTypes.POINTERMOVE || active) return
    const hit = pi.pickInfo?.pickedMesh === o.mesh
    o.onHover(hit)
  })

  return {
    id: o.id,
    dragging: () => active,
    dispose() {
      behavior.onDragStartObservable.remove(start)
      behavior.onDragObservable.remove(move)
      behavior.onDragEndObservable.remove(end)
      scene.onPointerObservable.remove(hover)
      if (active) o.orbit.attachControl()
      o.mesh.removeBehavior(behavior)
    },
  }
}
