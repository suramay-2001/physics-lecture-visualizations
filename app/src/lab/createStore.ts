/**
 * A tiny external store for the lab (Babylon-free, three-free): each bench keeps its parameters in one of these, the
 * DOM controls, the drag handles (through `LabHandle.onGui`) and `window.__lab` all write through the bench's
 * actions, and the page derives the view from the engine. A patch that changes nothing notifies nobody.
 */
import { useSyncExternalStore } from 'react'

export interface Store<S extends object> {
  get(): S
  set(patch: Partial<S> | ((s: S) => Partial<S>)): void
  subscribe(fn: () => void): () => void
  use(): S
  /** Tests only: back to the initial state. */
  reset(): void
}

export function createStore<S extends object>(initial: S): Store<S> {
  let state = initial
  const subs = new Set<() => void>()
  const get = () => state
  const subscribe = (fn: () => void) => {
    subs.add(fn)
    return () => {
      subs.delete(fn)
    }
  }
  return {
    get,
    subscribe,
    set(p) {
      const patch = typeof p === 'function' ? p(state) : p
      const keys = Object.keys(patch) as (keyof S)[]
      if (keys.every((k) => Object.is(patch[k], state[k]))) return
      state = { ...state, ...patch }
      subs.forEach((fn) => fn())
    },
    use: () => useSyncExternalStore(subscribe, get, () => initial),
    reset() {
      state = initial
      subs.forEach((fn) => fn())
    },
  }
}
