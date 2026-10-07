/**
 * Physics 709's course pack (glossary, concepts, bridges), loaded once per session (content/load.ts caches the
 * promise). A 709 page whose prose may use a 709 term waits for it: the chapter page, and the Help page that lists
 * every challenge. Returns the state and a retry for the "did not load" message.
 */
import { useEffect, useState } from 'react'
import { loadQcPack } from '../content/load'

export type Load = 'loading' | 'ready' | 'failed'

export function useQcPack(wanted: boolean): [Load, () => void] {
  const [state, setState] = useState<Load>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!wanted) return
    let alive = true
    loadQcPack().then(
      () => alive && setState('ready'),
      () => alive && setState('failed'),
    )
    return () => {
      alive = false
    }
  }, [wanted, attempt])
  return [state, () => (setState('loading'), setAttempt((n) => n + 1))]
}
