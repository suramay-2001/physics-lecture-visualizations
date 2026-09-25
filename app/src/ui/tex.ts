/**
 * The two KaTeX renderers (S-L1 §4a, landed verbatim by W at freeze; owner: S afterwards; decision #9).
 *
 *  - `renderAuthoredTex`: authored content ONLY. `trust` allows exactly \htmlClass{term-[a-z0-9-]+}.
 *  - `renderUserTex`: anything a student typed. trust off, size/expand caps, length and brace-depth caps,
 *    no shared macros, and a 40em cap on every length in the produced markup (KaTeX does not clamp negative
 *    sizes). It is the ONLY renderer that may receive <input>-derived strings (`<UserTex>`).
 *  - `renderAuthoredTexStrict` (content gate only): throws on ParseErrors AND on any untrusted command.
 * Both never throw (nesting ≥ 800 throws RangeError inside KaTeX, which throwOnError does not catch).
 * `innerHTML`-style sinks exist only here and in ui/Rich.tsx.
 */
import katex, { type KatexOptions, type TrustContext } from 'katex' // katex ships its own types (types/katex.d.ts)

export const USER_TEX_MAX_LEN = 300 // chars; at 3 chars per level, nesting stays ≤ 100 (RangeError starts ≥ 800)
export const USER_TEX_MAX_BRACE_DEPTH = 24
const USER_OPTS: KatexOptions = {
  trust: false, // explicit even though it is the default; blocks \href \url \includegraphics \html*
  strict: 'ignore', // no console spam from student typos
  throwOnError: false, // ParseError → red inline error, not an exception
  maxSize: 10, // em cap for \rule, \kern, \raisebox… (default is Infinity)
  maxExpand: 50, // user input needs no macros (default is 1000)
  output: 'htmlAndMathml',
  // NEVER pass a shared `macros` object: KaTeX mutates it on \gdef (verified: a shared {} gains key '\\yy'
  // after '\gdef\yy{1}'). Without one, \gdef does not persist between calls (verified).
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const fail = (msg: string) => `<span class="tex-user-error">${esc(msg)}</span>`

// KaTeX 0.18.7 clamps sizes with Math.min(size, maxSize), so NEGATIVE sizes are not clamped at all:
// \kern{-500em}, \hspace{-500em}, \mkern-9000mu, \rule[-500em]…, \raisebox{-900em}{x} (also via macros such as
// \def\n{-900em}\kern\n) reach the markup unchanged and can drag typeset content across the page (verified,
// S build round). So the rendered markup itself is checked: any length beyond USER_TEX_MAX_EM refuses the input.
// The TeX echo in <annotation> and KaTeX's own fixed-size <svg> attributes (width="400em" on \sqrt) are skipped.
const USER_TEX_MAX_EM = 40 // a 33-row matrix is ≈ 40em tall; nothing a student types into a preview needs more
const EM = /(-?\d*\.?\d+)em\b/g
function maxEmIn(html: string): number {
  const markup = html.replace(/<annotation[\s\S]*?<\/annotation>/g, '').replace(/<svg\b[^>]*>/g, '<svg>')
  let max = 0
  for (const m of markup.matchAll(EM)) max = Math.max(max, Math.abs(Number(m[1])))
  return max
}

export function renderUserTex(src: string, displayMode = false): string {
  if (typeof src !== 'string') return fail('not text')
  if (src.length > USER_TEX_MAX_LEN) return fail(`too long (max ${USER_TEX_MAX_LEN} characters)`)
  let d = 0,
    max = 0
  for (const ch of src) {
    if (ch === '{') max = Math.max(max, ++d)
    else if (ch === '}') d--
  }
  if (max > USER_TEX_MAX_BRACE_DEPTH) return fail('nested too deeply')
  try {
    const html = katex.renderToString(src, { ...USER_OPTS, displayMode })
    return maxEmIn(html) > USER_TEX_MAX_EM ? fail('too large to typeset') : html
  } catch {
    return fail("couldn't typeset that")
  } // RangeError / anything non-ParseError
}

// Trusted renderer for authored content only: allows exactly \htmlClass{term-…}{…}
const TERM_CLASS = /^term-[a-z0-9-]+$/
const trustTerms = (ctx: TrustContext) => ctx.command === '\\htmlClass' && TERM_CLASS.test(ctx.class)
// plain strict:'warn' logs "HTML extension is disabled on strict mode [htmlExtension]" on every \htmlClass (observed)
const authoredStrict = (code: string) => (code === 'htmlExtension' ? 'ignore' : 'warn')

export function renderAuthoredTex(src: string, displayMode = false): string {
  try {
    return katex.renderToString(src, { displayMode, trust: trustTerms, strict: authoredStrict, throwOnError: false, maxSize: 20, maxExpand: 1000 })
  } catch {
    return fail('typeset error')
  } // surfaced by a content test (renderAuthoredTexStrict)
}

// An untrusted command (\href, \htmlClass{evil}, \htmlClass{term-X}, \includegraphics…) does NOT throw in KaTeX,
// even with throwOnError: true — it renders as red text (formatUnsupportedCmd). The strict renderer therefore
// throws from the trust callback, so the content gate fails on a mistyped term id instead of shipping red text.
const trustTermsOrThrow = (ctx: TrustContext) => {
  if (trustTerms(ctx)) return true
  throw new katex.ParseError(`untrusted command ${ctx.command} in authored TeX (only \\htmlClass{term-[a-z0-9-]+} is allowed)`)
}

/** Test-only: authored render with throwOnError: true, used by the content test to fail on any ParseError. */
export function renderAuthoredTexStrict(src: string, displayMode = false): string {
  return katex.renderToString(src, { displayMode, trust: trustTermsOrThrow, strict: authoredStrict, throwOnError: true, maxSize: 20, maxExpand: 1000 })
}
