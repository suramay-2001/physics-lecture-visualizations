/**
 * Scene registry (owner: D). One lazy component per stage kind; StagePort mounts it inside the kind's view
 * portal. L1 kinds are the real scenes (D-L1-scenes §3.1–3.2); the others keep W0's wireframe placeholders
 * (bloch, bloch-ball: the L1 teaser) until their scenes are ported from the gate. A kind without an entry
 * renders as its clear colour only.
 */
import { lazy } from 'react'
import type { SceneComponent, SceneRegistry } from '../types'

const placeholders = () => import('./placeholders')

export const SCENES: SceneRegistry = {
  'lab-r3': lazy(() => import('./LabR3Scene')),
  'hilbert-plane': lazy(() => import('./HilbertPlaneScene')),
  bloch: lazy(() => placeholders().then((m) => ({ default: m.PlaceholderSphere as SceneComponent<'bloch'> }))),
  'bloch-ball': lazy(() => import('./BlochBallScene')),
}
