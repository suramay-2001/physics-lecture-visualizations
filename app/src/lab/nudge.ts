/**
 * Keyboard twins of the drag handles (decisions/lab.md ruling 2): every in-scene handle has a DOM twin that takes
 * arrow keys. Pure mapping from a key to (axis, direction); the bench turns it into a step of its own parameter
 * (Shift = the fine step). Tested in nudge.test.ts.
 *   1 axis:  ← ↓ = −1, → ↑ = +1
 *   2 axes:  ← → = axis 0, ↓ ↑ = axis 1
 *   3 axes:  as 2, plus Page Down / Page Up = axis 2
 */
export type Dims = 1 | 2 | 3
export interface Nudge {
  axis: 0 | 1 | 2
  dir: 1 | -1
  fine: boolean
}

export function nudgeOf(key: string, dims: Dims, shift = false): Nudge | null {
  const n = (axis: 0 | 1 | 2, dir: 1 | -1): Nudge => ({ axis, dir, fine: shift })
  if (dims === 1) {
    if (key === 'ArrowLeft' || key === 'ArrowDown') return n(0, -1)
    if (key === 'ArrowRight' || key === 'ArrowUp') return n(0, 1)
    return null
  }
  if (key === 'ArrowLeft') return n(0, -1)
  if (key === 'ArrowRight') return n(0, 1)
  if (key === 'ArrowDown') return n(1, -1)
  if (key === 'ArrowUp') return n(1, 1)
  if (dims === 3 && key === 'PageDown') return n(2, -1)
  if (dims === 3 && key === 'PageUp') return n(2, 1)
  return null
}

/** Key help for a twin's description. */
export const NUDGE_HELP: Record<Dims, string> = {
  1: 'Arrow keys move it; hold Shift for fine steps.',
  2: 'Left and right arrows move it along the first direction, up and down along the second; hold Shift for fine steps.',
  3: 'Left/right, up/down and Page Up/Page Down move it along three directions; hold Shift for fine steps.',
}
