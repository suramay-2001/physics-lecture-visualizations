/**
 * Stage timing shared by the WebGL Driver (stage/StageHost.tsx) and the SVG route (stage/svg/SvgStage.tsx), and the
 * one step both run per unit per frame: clue reveal mixes (decision #17) and the reader-driven clock (decision #22).
 * Pure and three-free.
 */
import type { UnitTrack } from './store'

/** Seconds for a clue reveal to move the stage from question to answer (full motion). */
export const REVEAL_SECONDS = 0.6
/** Decision #22: the reader-driven clock keeps running this long after the last scroll/click. */
export const SETTLE_SECONDS = 1.2

/**
 * Advance one unit's reveal mixes toward `revealed` (a cut without motion) and its reader-driven clock by `delta`
 * seconds (standing still unless the reader acted within SETTLE_SECONDS or a reveal is moving). Exactly the WebGL
 * Driver's step; a unit is advanced by ONE owner per frame (the Driver when the unit has a WebGL kind, else the SVG
 * route), so a mixed unit never runs twice as fast.
 */
export function advanceUnit(track: UnitTrack, delta: number, now: number, motion: boolean): void {
  let revealing = false
  for (let i = 0; i < track.beatCount; i++) {
    const target = track.revealed.has(i) ? 1 : 0
    let m = track.revealMix[i] ?? 0
    if (!motion) m = target
    else if (m !== target) {
      m = Math.min(1, Math.max(0, m + (Math.sign(target - m) * delta) / REVEAL_SECONDS))
      revealing = true
    }
    track.revealMix[i] = m
  }
  const active = revealing || now - track.lastInput < SETTLE_SECONDS * 1000
  track.delta = motion && active ? delta : 0
  track.clock += track.delta
}
