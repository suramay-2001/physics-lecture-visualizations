/**
 * Scene registry (owner: D). One lazy component per stage kind; StagePort mounts it inside the kind's view
 * portal: lab-r3, hilbert-plane, bloch (pure states, L2 and L5–L7), bloch-ball (mixed states). hopf and
 * operator-space get their scenes with the lectures that use them. A kind without an entry renders as its
 * clear colour only.
 */
import { lazy } from 'react'
import type { SceneRegistry } from '../types'

export const SCENES: SceneRegistry = {
  'lab-r3': lazy(() => import('./LabR3Scene')),
  'hilbert-plane': lazy(() => import('./HilbertPlaneScene')),
  bloch: lazy(() => import('./BlochScene')),
  'bloch-ball': lazy(() => import('./BlochBallScene')),
  'operator-space': lazy(() => import('./OperatorSpaceScene')),
}
