/**
 * Content-Security-Policy for the built site (owner: S after the l1-freeze tag; W-L1 §4.6, S-L1 §4b).
 *
 * W0 lands this file as a STUB so `vite.config.ts` carries its final import line:
 *   - `CSP` / `cspString` already hold the S §4b directive list (data, no side effects);
 *   - `cspMeta()` is a no-op plugin. S turns it on (transformIndexHtml → first child of <head>) together
 *     with its tests, the `_headers` generator and the Playwright CSP check.
 * The runtime needs no CSP exceptions (no drei <Text>, no Draco/Meshopt, DOM labels). Any exception is an
 * interface change that needs S sign-off.
 */
import type { Plugin } from 'vite'

export const CSP: Readonly<Record<string, string>> = Object.freeze({
  'default-src': "'none'",
  'script-src': "'self'",
  'style-src': "'self' 'unsafe-inline'",
  'style-src-elem': "'self'",
  'style-src-attr': "'unsafe-inline'",
  'img-src': "'self' data: blob:",
  'font-src': "'self' data:",
  'connect-src': "'self'",
  'worker-src': "'self' blob:",
  'media-src': "'self'",
  'manifest-src': "'self'",
  'object-src': "'none'",
  'base-uri': "'none'",
  'form-action': "'none'",
})

/** Directive string. `headerOnly` adds what a <meta> tag cannot carry (frame-ancestors, upgrade-insecure-requests). */
export const cspString = (opts: { headerOnly?: boolean } = {}): string => {
  const parts = Object.entries(CSP).map(([k, v]) => `${k} ${v}`)
  if (opts.headerOnly) parts.push("frame-ancestors 'none'", 'upgrade-insecure-requests')
  return parts.join('; ')
}

/** Build-only CSP <meta> injector. STUB: no-op until S enables it. */
export function cspMeta(): Plugin {
  return { name: 'spin-lab:csp-meta', apply: 'build' }
}
