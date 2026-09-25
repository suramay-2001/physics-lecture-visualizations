/**
 * Scene registry (owner: D after the l1-freeze tag). One lazy component per stage kind; StagePort mounts
 * it inside the kind's view portal. W0 registers wireframe PLACEHOLDERS for the L1 kinds (lab-r3,
 * hilbert-plane) and the bloch-ball teaser; D replaces each entry with the real scene
 * (`LabR3Scene`, `HilbertPlaneScene`, …). A kind without an entry renders as its clear colour only.
 */
import { lazy } from 'react'
import type { SceneComponent, SceneRegistry } from '../types'

const placeholders = () => import('./placeholders')

export const SCENES: SceneRegistry = {
  'lab-r3': lazy(() => placeholders().then((m) => ({ default: m.PlaceholderLab }))),
  'hilbert-plane': lazy(() => placeholders().then((m) => ({ default: m.PlaceholderPlane }))),
  bloch: lazy(() => placeholders().then((m) => ({ default: m.PlaceholderSphere as SceneComponent<'bloch'> }))),
  'bloch-ball': lazy(() => placeholders().then((m) => ({ default: m.PlaceholderSphere as SceneComponent<'bloch-ball'> }))),
}
