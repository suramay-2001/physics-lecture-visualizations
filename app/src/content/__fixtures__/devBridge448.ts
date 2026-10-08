/**
 * DEV fixture: a TEMPORARY chip on a real 448 lecture, until a real "Go further in 709" chip exists (W-448 #4).
 * `withDevChip` (applied by content/load.ts in DEV only, and only when `window.__devChip448` is set: e2e/bridge.spec.ts sets it
 * before the page loads) returns the real Lecture 5 with one bridge appended to the first
 * beat of unit 5.3, aimed at the DEV demo chapter Q0 of Physics 709, so e2e/bridge.spec.ts can walk the whole round trip
 * on a real lecture page: 448 beat → chip → 709 unit with the return bar → back to the same beat.
 * Delete this file, its call in content/load.ts and the `@dev-only` 448 → 709 tests' use of it when Lecture 8 lands a
 * real chip (the test can then use that one).
 *
 * NEVER SHIPS: under `__fixtures__/`, imported only behind `import.meta.env.DEV`; build/chunks.test.ts (k) fails if a
 * production chunk holds it. The real lecture modules, LECTURES and every content test are untouched.
 */
import { registerBridges, type BridgeTarget } from '../bridgeRegistry'
import type { Lecture } from '../schema'

export const DEV_CHIP_LECTURE = 'L5'
export const DEV_CHIP_BEAT = 'l5-coordinates:b1'
export const DEV_CHIP_ID = 'sl-dev-q0-sphere'

/** The fixture's one bridge: from Lecture 5 into the 709 demo chapter's first unit, at a beat of it. */
export const DEV_BRIDGES_448: Readonly<Record<string, BridgeTarget>> = {
  [DEV_CHIP_ID]: { course: 'qc709', lecture: 'Q0', unit: 'q0-demo-sphere', beat: 'q0-demo-sphere:b2', label: 'the demo chapter’s sphere' },
}

/** The real lecture with the chip appended to its first beat of unit 5.3 (any other lecture comes back unchanged). */
export function withDevChip(l: Lecture): Lecture {
  if (l.id !== DEV_CHIP_LECTURE) return l
  registerBridges(DEV_BRIDGES_448)
  return {
    ...l,
    units: l.units.map((u) => ({
      ...u,
      story: u.story?.map((b) => (b.id === DEV_CHIP_BEAT ? { ...b, text: `${b.text} <<${DEV_CHIP_ID}|Go further in the demo chapter>>` } : b)),
    })),
  }
}
