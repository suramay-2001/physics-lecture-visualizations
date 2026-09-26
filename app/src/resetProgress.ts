/**
 * Clear saved progress from the route error fallback (S §4e). Uses the public `progress.reset()` (S owns
 * progress.ts) and then removes the stored key and its quarantined `.corrupt` copy, so even a store that
 * throws on load is cleared (round 3 #20: the key now comes from progress.ts, not a second copy).
 */
import { PROGRESS_KEY, progress } from './progress'

export { PROGRESS_KEY }

export function resetProgress(): void {
  try {
    progress.reset()
  } catch {
    /* the store itself may be the broken part */
  }
  for (const key of [PROGRESS_KEY, `${PROGRESS_KEY}.corrupt`]) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* storage unavailable */
    }
  }
}
