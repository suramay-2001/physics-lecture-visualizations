/**
 * Clear saved progress from the route error fallback (S §4e). Uses the public `progress.reset()` (S owns
 * progress.ts) and then removes the stored key, so even a store that throws on load is cleared.
 */
import { progress } from './progress'

export const PROGRESS_KEY = 'spinlab.progress.v1'

export function resetProgress(): void {
  try {
    progress.reset()
  } catch {
    /* the store itself may be the broken part */
  }
  try {
    localStorage.removeItem(PROGRESS_KEY)
  } catch {
    /* storage unavailable */
  }
}
