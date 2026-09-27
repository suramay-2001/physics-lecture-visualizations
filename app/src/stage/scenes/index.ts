/**
 * Scene registry (owner: D). One lazy component per stage kind; StagePort mounts it inside the kind's view
 * portal: lab-r3, hilbert-plane, bloch (pure states), bloch-ball (mixed states), operator-space (A = a₀I + a·σ)
 * and hopf (S³, stereographic). A kind without an entry renders as its clear colour only.
 */
import { lazy } from 'react'
import type { SceneRegistry } from '../types'

export const SCENES: SceneRegistry = {
  'lab-r3': lazy(() => import('./LabR3Scene')),
  'hilbert-plane': lazy(() => import('./HilbertPlaneScene')),
  bloch: lazy(() => import('./BlochScene')),
  'bloch-ball': lazy(() => import('./BlochBallScene')),
  'operator-space': lazy(() => import('./OperatorSpaceScene')),
  hopf: lazy(() => import('./HopfScene')),
}
