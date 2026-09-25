import { useSyncExternalStore } from 'react'

/**
 * Per-browser progress. Each classmate keeps their own; nothing leaves the device.
 * Storage can be missing or throw (private windows, blocked site data), so every access
 * is guarded and the app works without it.
 *
 * Security (S-L1 §4e, decision #10; owner S): localStorage is semi-trusted — old schemas, extensions or the
 * user can put anything there. `load()` caps the raw size, parses inside try/catch and rebuilds the state
 * field by field (`sanitize`), so a corrupted, oversized or prototype-polluting value can never crash a
 * render; it falls back to an empty state and keeps a 1 KiB side-copy under `<key>.corrupt`.
 * The maps are null-prototype objects, so `challenges['constructor']` is `undefined`, never `Object`.
 */
export interface ChallengeRecord {
  solved: boolean
  attempts: number
  hintsUsed: number
  /** Opened the walkthrough before solving — still counts as learning, shown differently. */
  peeked: boolean
}

interface State {
  /** Schema version; a future v2 migrates explicitly (S-L1 §4e). */
  v: 1
  challenges: Record<string, ChallengeRecord>
  games: Record<string, number> // game id → highest level cleared
}

const KEY = 'spinlab.progress.v1'

/** Limits for the stored value (S-L1 §4e). */
export const PROGRESS_LIMITS = Object.freeze({
  /** Raw JSON larger than this is treated as corrupt (UTF-16 code units, i.e. `string.length`). */
  maxRaw: 64 * 1024,
  /** At most this many challenge records and this many game records are read back. */
  maxEntries: 500,
  maxAttempts: 1e6,
  maxHints: 10,
  maxLevel: 1000,
  /** Side-copy of a rejected value (for debugging), truncated to this many chars. */
  corruptCopy: 1024,
})
/** Ids that may be read back. Rejects `__proto__`-style keys by construction (no leading underscore). */
export const PROGRESS_ID = /^[A-Za-z0-9.:-][A-Za-z0-9._:-]{0,63}$/

const dict = <T,>(): Record<string, T> => Object.create(null) as Record<string, T>
const empty = (): State => ({ v: 1, challenges: dict(), games: dict() })
const isInt = (v: unknown, hi: number): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= hi
const isPlainObject = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)

/** Rebuild a State from untrusted JSON: unknown fields are dropped, bad values fall back to defaults. Never throws. */
export function sanitize(x: unknown): State {
  const out = empty()
  if (!isPlainObject(x)) return out
  const { challenges, games } = x
  if (isPlainObject(challenges)) {
    let n = 0
    for (const id of Object.keys(challenges)) {
      if (n >= PROGRESS_LIMITS.maxEntries) break
      if (!PROGRESS_ID.test(id)) continue
      const r = challenges[id]
      if (!isPlainObject(r)) continue
      out.challenges[id] = {
        solved: r.solved === true,
        peeked: r.peeked === true,
        attempts: isInt(r.attempts, PROGRESS_LIMITS.maxAttempts) ? r.attempts : 0,
        hintsUsed: isInt(r.hintsUsed, PROGRESS_LIMITS.maxHints) ? r.hintsUsed : 0,
      }
      n++
    }
  }
  if (isPlainObject(games)) {
    let n = 0
    for (const id of Object.keys(games)) {
      if (n >= PROGRESS_LIMITS.maxEntries) break
      const lvl = games[id]
      if (!PROGRESS_ID.test(id) || !isInt(lvl, PROGRESS_LIMITS.maxLevel)) continue
      out.games[id] = lvl
      n++
    }
  }
  return out
}

function keepCorrupt(raw: string) {
  try {
    localStorage.setItem(KEY + '.corrupt', raw.slice(0, PROGRESS_LIMITS.corruptCopy))
  } catch {
    /* storage full or unavailable: nothing to keep */
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (typeof raw !== 'string' || raw === '') return empty()
    if (raw.length > PROGRESS_LIMITS.maxRaw) {
      keepCorrupt(raw)
      return empty()
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      keepCorrupt(raw)
      return empty()
    }
    return sanitize(parsed)
  } catch {
    return empty()
  }
}

let state = load()
const listeners = new Set<() => void>()

function commit(next: State) {
  state = next
  try {
    const raw = JSON.stringify(state)
    // Never write a value that load() would reject; the in-memory state still works for this tab.
    if (raw.length <= PROGRESS_LIMITS.maxRaw) localStorage.setItem(KEY, raw)
  } catch {
    /* storage unavailable: progress lives for this tab only */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useProgress = () => useSyncExternalStore(subscribe, () => state, () => state) // 3rd arg: server snapshot (SSR content test)

const rec = (id: string): ChallengeRecord =>
  (Object.hasOwn(state.challenges, id) ? state.challenges[id] : undefined) ?? { solved: false, attempts: 0, hintsUsed: 0, peeked: false }

function patch(id: string, p: Partial<ChallengeRecord>) {
  const challenges = Object.assign(dict<ChallengeRecord>(), state.challenges)
  challenges[id] = { ...rec(id), ...p }
  commit({ ...state, challenges })
}

export const progress = {
  attempt(id: string, correct: boolean) {
    const r = rec(id)
    patch(id, { attempts: Math.min(r.attempts + 1, PROGRESS_LIMITS.maxAttempts), solved: r.solved || correct })
  },
  hint(id: string, level: number) {
    if (level > rec(id).hintsUsed) patch(id, { hintsUsed: level })
  },
  peek(id: string) {
    if (!rec(id).solved) patch(id, { peeked: true })
  },
  gameLevel(id: string, level: number) {
    const best = Object.hasOwn(state.games, id) ? state.games[id] : 0
    if (level > best) {
      const games = Object.assign(dict<number>(), state.games)
      games[id] = level
      commit({ ...state, games })
    }
  },
  reset() {
    commit(empty())
  },
}
