/**
 * CSP policy + delivery (S-L1 §4b, W-L1 §4.6, decision #11; owner S). The policy is data in build/csp.ts; this
 * test pins its security properties, proves the build-only <meta> and public/_headers carry exactly that policy
 * (no drift), and that the built index.html does too. That last check needs a CURRENT build: a missing or stale
 * dist fails ONE test saying "run `npm run build` first" instead of a misleading diff (../src/security/distState.ts).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { HtmlTagDescriptor, IndexHtmlTransformHook } from 'vite'
import { describe, expect, it } from 'vitest'
import { distState } from '../src/security/distState.ts'
import { CSP, cspMeta, cspString, headersFile, SECURITY_HEADERS } from './csp.ts'

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url))
const parse = (policy: string) => new Map(policy.split(';').map((d) => d.trim()).filter(Boolean).map((d) => { const [k, ...v] = d.split(/\s+/); return [k, v] as const }))

describe('policy', () => {
  const p = parse(cspString())

  it('denies by default and lists every fetch directive the app needs explicitly', () => {
    expect(p.get('default-src')).toEqual(["'none'"])
    for (const d of ['script-src', 'style-src', 'img-src', 'font-src', 'connect-src', 'worker-src', 'media-src', 'manifest-src', 'object-src', 'base-uri', 'form-action']) expect(p.has(d), d).toBe(true)
  })

  it('scripts: same-origin only — no inline, eval, wasm-eval, blob:, data: or hosts', () => {
    expect(p.get('script-src')).toEqual(["'self'"])
    expect(cspString()).not.toMatch(/'unsafe-eval'|'wasm-unsafe-eval'|'unsafe-hashes'|'strict-dynamic'/)
  })

  it('no host sources or wildcards anywhere (no runtime third party)', () => {
    for (const [d, v] of p) for (const s of v) expect(s, `${d} ${s}`).toMatch(/^('self'|'none'|'unsafe-inline'|data:|blob:)$/)
  })

  it("inline styles only as attributes (KaTeX style=\"…\"), never <style> elements", () => {
    expect(p.get('style-src-elem')).toEqual(["'self'"])
    expect(p.get('style-src-attr')).toEqual(["'unsafe-inline'"])
  })

  it('network, plugins, base and forms are locked', () => {
    expect(p.get('connect-src')).toEqual(["'self'"])
    expect(p.get('object-src')).toEqual(["'none'"])
    expect(p.get('base-uri')).toEqual(["'none'"])
    expect(p.get('form-action')).toEqual(["'none'"])
    expect(p.get('font-src')).toEqual(["'self'", 'data:'])
  })

  it('meta form omits what <meta> cannot carry; header form adds it', () => {
    expect(cspString()).not.toMatch(/frame-ancestors|upgrade-insecure-requests|report-uri|report-to|sandbox/)
    const h = parse(cspString({ headerOnly: true }))
    expect(h.get('frame-ancestors')).toEqual(["'none'"])
    expect(h.has('upgrade-insecure-requests')).toBe(true)
    expect(Object.isFrozen(CSP)).toBe(true)
  })
})

describe('delivery', () => {
  it('cspMeta(): build-only plugin that prepends the policy as the first <head> child', () => {
    const plugin = cspMeta()
    expect(plugin.apply).toBe('build')
    const hook = plugin.transformIndexHtml as { order: string; handler: IndexHtmlTransformHook }
    expect(hook.order).toBe('post')
    const tags = (hook.handler as unknown as () => HtmlTagDescriptor[])()
    expect(tags).toEqual([{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: cspString() }, injectTo: 'head-prepend' }])
  })

  it('source index.html carries no CSP (dev needs the React-refresh inline preamble) and no third-party URL', () => {
    const src = readFileSync(at('../index.html'), 'utf8')
    expect(src).not.toMatch(/Content-Security-Policy/)
    expect(src).not.toMatch(/https?:\/\//)
    expect(src).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/) // no inline scripts
    expect(src).not.toMatch(/<style\b|\sstyle="/)
  })

  it('public/_headers is exactly the generated file (run `node build/headers.ts` after changing csp.ts)', () => {
    expect(readFileSync(at('../public/_headers'), 'utf8')).toBe(headersFile())
  })

  it('_headers carries the full header set', () => {
    const f = headersFile()
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) expect(f).toContain(`  ${k}: ${v}\n`)
    expect(f).toMatch(/^\/\*$/m)
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff')
    expect(SECURITY_HEADERS['Permissions-Policy']).not.toMatch(/interest-cohort/) // unrecognised by Chrome: console noise
  })

  const DIST = at('../dist/index.html')
  const state = distState()
  it('app/dist is a current production build of this tree (else: run `npm run build` first)', () => {
    if (!state.ok) throw new Error(state.message)
  })
  it.skipIf(!state.ok)('built dist/index.html carries exactly this policy, first in <head>', () => {
    const html = readFileSync(DIST, 'utf8')
    const m = /<head>\s*<meta http-equiv="Content-Security-Policy" content="([^"]*)">/.exec(html)
    expect(m).not.toBeNull()
    const decoded = m![1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    expect(decoded).toBe(cspString())
    expect(readFileSync(at('../dist/_headers'), 'utf8')).toBe(headersFile())
  })
})
