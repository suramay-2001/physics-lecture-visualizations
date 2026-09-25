/**
 * Error boundaries around every math and 3D island (W-L1 §4.2, decision #9; frozen at `l1-freeze`).
 *
 * | island        | fallback (by the caller)                                                        |
 * |---------------|---------------------------------------------------------------------------------|
 * | 'rich'        | the source text, escaped, plus a small "couldn't typeset" note                  |
 * | 'widget'      | "This widget failed to load" plus the widget's caption                          |
 * | 'scene'       | null inside the Canvas; the view's weight is forced to 0 (stage/StagePort.tsx)  |
 * | 'stage-host'  | stage.contextLost = true → every unit uses StaticStory                          |
 * | 'route'       | "Something broke on this page" + Reset progress + link home                     |
 * Works in any React renderer (DOM and the r3f reconciler). Never rethrows.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface IslandBoundaryProps {
  name: 'rich' | 'widget' | 'scene' | 'stage-host' | 'route'
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  /** Reset when any of these change (e.g. beat id, route). */
  resetKeys?: readonly unknown[]
  /** DEV: console.error once per boundary; prod: silent unless given. */
  onError?: (error: Error) => void
  children: ReactNode
}

interface State {
  error: Error | null
  keys: readonly unknown[] | undefined
}

const changed = (a: readonly unknown[] | undefined, b: readonly unknown[] | undefined) =>
  !!a && !!b && (a.length !== b.length || a.some((x, i) => !Object.is(x, b[i])))

export class IslandBoundary extends Component<IslandBoundaryProps, State> {
  state: State = { error: null, keys: this.props.resetKeys }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  static getDerivedStateFromProps(props: IslandBoundaryProps, state: State): Partial<State> | null {
    if (state.error && changed(state.keys, props.resetKeys)) return { error: null, keys: props.resetKeys }
    if (props.resetKeys !== state.keys) return { keys: props.resetKeys }
    return null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error)
    if (import.meta.env.DEV) console.error(`[IslandBoundary:${this.props.name}]`, error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const f = this.props.fallback
    return typeof f === 'function' ? f(error, this.reset) : f
  }
}
