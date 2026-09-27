/**
 * Remote-code tripwire for the Babylon side (decisions/lab.md #8–9, S-lab LAB-03). Two layers, both installed once,
 * before the first engine exists:
 *   1. Babylon's CDN bases point at a dead local path, so a default that builds a CDN URL (decoders, debug tools,
 *      environment textures) asks our own origin for a file that is not there and fails loudly (a 404 in the
 *      console, which the lab e2e counts), instead of reaching Babylon's CDN.
 *   2. Tools.LoadScript / LoadScriptAsync / LoadFile / LoadFileAsync refuse any cross-origin URL with a clean error
 *      and report it (`__lab.tripwire()`); the CSP (`script-src 'self'`, `connect-src 'self'`) blocks it anyway.
 * The lab never calls these loaders itself (lab/rules.test.ts); this file is the only one allowed to name them.
 */
import { Tools } from '@babylonjs/core/Misc/tools'

/** Where Babylon's CDN defaults now point: same origin, never served. */
export const DEAD_BASE = './babylon-off/'

let installed = false
let report: (url: string) => void = () => {}

const crossOrigin = (url: string): boolean => {
  try {
    return new URL(url, location.href).origin !== location.origin
  } catch {
    return true
  }
}

function refuse(url: string): Error {
  report(url)
  return new Error(`Spin Lab refused a cross-origin load: ${url.slice(0, 120)}`)
}

/** Install once (idempotent); `onTrip` receives every refused URL (the latest caller's hook wins). */
export function installTripwire(onTrip: (url: string) => void): void {
  report = onTrip
  if (installed) return
  installed = true
  Tools.CDNBaseUrl = DEAD_BASE
  Tools.ScriptBaseUrl = DEAD_BASE
  Tools.AssetBaseUrl = DEAD_BASE

  const loadScript = Tools.LoadScript
  Tools.LoadScript = (url, onSuccess, onError, scriptId, useModule) => {
    if (crossOrigin(url)) {
      const e = refuse(url)
      onError?.(e.message, e)
      return
    }
    loadScript(url, onSuccess, onError, scriptId, useModule)
  }
  const loadScriptAsync = Tools.LoadScriptAsync.bind(Tools)
  Tools.LoadScriptAsync = (url, scriptId) => (crossOrigin(url) ? Promise.reject(refuse(url)) : loadScriptAsync(url, scriptId))

  const loadFile = Tools.LoadFile.bind(Tools)
  Tools.LoadFile = (url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError) => {
    if (crossOrigin(url)) throw refuse(url)
    return loadFile(url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError)
  }
  const loadFileAsync = Tools.LoadFileAsync.bind(Tools) as (url: string, useArrayBuffer?: boolean) => Promise<ArrayBuffer | string>
  ;(Tools as unknown as { LoadFileAsync: typeof loadFileAsync }).LoadFileAsync = (url, useArrayBuffer) =>
    crossOrigin(url) ? Promise.reject(refuse(url)) : loadFileAsync(url, useArrayBuffer)
}
