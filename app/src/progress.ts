import { useSyncExternalStore } from 'react'

/**
 * Per-browser progress. Each classmate keeps their own; nothing leaves the device.
 * Storage can be missing or throw (private windows, blocked site data), so every access
 * is guarded and the app works without it.
 */
export interface ChallengeRecord {
  solved: boolean
  attempts: number
  hintsUsed: number
  /** Opened the walkthrough before solving — still counts as learning, shown differently. */
  peeked: boolean
}

interface State {
  challenges: Record<string, ChallengeRecord>
  games: Record<string, number> // game id → highest level cleared
}

const KEY = 'spinlab.progress.v1'
const empty = (): State => ({ challenges: {}, games: {} })

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty()
  } catch {
    return empty()
  }
}

let state = load()
const listeners = new Set<() => void>()

function commit(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
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
  state.challenges[id] ?? { solved: false, attempts: 0, hintsUsed: 0, peeked: false }

function patch(id: string, p: Partial<ChallengeRecord>) {
  commit({ ...state, challenges: { ...state.challenges, [id]: { ...rec(id), ...p } } })
}

export const progress = {
  attempt(id: string, correct: boolean) {
    const r = rec(id)
    patch(id, { attempts: r.attempts + 1, solved: r.solved || correct })
  },
  hint(id: string, level: number) {
    if (level > rec(id).hintsUsed) patch(id, { hintsUsed: level })
  },
  peek(id: string) {
    if (!rec(id).solved) patch(id, { peeked: true })
  },
  gameLevel(id: string, level: number) {
    if (level > (state.games[id] ?? 0)) commit({ ...state, games: { ...state.games, [id]: level } })
  },
  reset() {
    commit(empty())
  },
}
