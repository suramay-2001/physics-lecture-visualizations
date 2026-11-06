/**
 * Film `qc-q19-walker` (P-Q19-story §9): "A walker finds the marked spoke". The chance on each spoke of a star graph after 0, 2, 4 and 6 steps.
 * The shared scene (kitScene.tsx) lays out `qc-q19-walker.data.ts` (the engine's numbers); the film states no result, and the only lettering
 * is the stage's name (words, no number).
 */
import { filmScene } from '../kitScene'
import { SPEC } from './qc-q19-walker.data'

export default filmScene(SPEC)
