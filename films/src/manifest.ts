/**
 * The manifest: every number a film draws, recorded by the scene from the DRAWN nodes (positions and points read
 * back from Motion Canvas and converted to engine units), not copied from the data module. The render driver sends
 * it to the dev server, which writes `output/<film>/manifest.json`; `pipeline/films/check_manifest.ts` recomputes
 * each entry with the engine and fails on a mismatch.
 */
const entries = new Map<string, unknown>()

/** Record a drawn value under a stable key (re-running the scene overwrites, so the latest draw wins). */
export function record<T>(key: string, value: T): T {
  entries.set(key, value)
  return value
}

export function manifestEntries(): Record<string, unknown> {
  return Object.fromEntries(entries)
}
