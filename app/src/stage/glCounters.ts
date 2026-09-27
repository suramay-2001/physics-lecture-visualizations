/**
 * WebGL context counters for the measurement hooks (`window.__stage`, `window.__lab`). THREE-FREE and
 * Babylon-free, so the lab can count contexts even when the lecture host was never loaded (lab first).
 * One global record (`globalThis.__stageCounters`) and one prototype wrap, whoever installs first.
 * Only installed in DEV or with `?measure` (the callers decide).
 */
export interface GlCounters {
  contexts: number
  lost: number
  log: { type: string; at: number; w: number; h: number }[]
}
const G = globalThis as unknown as { __stageCounters?: GlCounters }
export const glCounters: GlCounters = G.__stageCounters ?? (G.__stageCounters = { contexts: 0, lost: 0, log: [] })

const WRAPPED = '__stageGetContextWrapped'
type Proto = HTMLCanvasElement & { [WRAPPED]?: boolean }

/** Count every WebGL context created on the page (ours or anyone's). Install before a canvas creates one. */
export function wrapGetContext(): void {
  if (typeof HTMLCanvasElement === 'undefined' || (HTMLCanvasElement.prototype as Proto)[WRAPPED]) return
  const orig = HTMLCanvasElement.prototype.getContext
  const seen = new WeakSet<object>()
  const wrapped = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    const ctx = (orig as (this: HTMLCanvasElement, t: string, ...r: unknown[]) => unknown).call(this, type, ...rest)
    if (ctx && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') && !seen.has(ctx as object)) {
      seen.add(ctx as object)
      glCounters.contexts++
      glCounters.log.push({ type, at: Math.round(performance.now()), w: this.width, h: this.height })
      this.addEventListener('webglcontextlost', () => glCounters.lost++, { once: true })
    }
    return ctx
  }
  HTMLCanvasElement.prototype.getContext = wrapped as typeof orig
  ;(HTMLCanvasElement.prototype as Proto)[WRAPPED] = true
}
