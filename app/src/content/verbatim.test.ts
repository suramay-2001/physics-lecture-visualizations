/**
 * Verbatim-overlap gate (S-L1 §4g, W-L1 §4.8, decision #12; owner S). The app paraphrases and cites; it must never
 * carry copied sentences from the course sources (instructor notes, textbooks), which stay in the git-ignored
 * `sources/` folder. This test compares word 8-grams / 12-grams of every authored prose literal against ALL of
 * `sources/**\/*.md` (lecture text, Townsend, Axler, Bergou, sets, and the 28 `susskind/chapterNNN.md` files).
 *
 * Literals: every string/template literal in `src/content/**\/*.ts`, `src/gate/content.ts`, and every string
 * literal + JSX text in `src/**\/*.tsx`, kept when ≥ 8 words after normalisation. Companion: the same check over
 * string literals in the built `dist/assets/*.js` (catches prose placed outside content/), when dist/ exists.
 *
 * Where sources live: `SPINLAB_SOURCES` if set; otherwise the nearest ancestor checkout of this repo that has a
 * `sources/` folder (so a worktree under .claude/worktrees/ finds the main checkout's copy). No path is hard-coded.
 * Absent (CI, a fresh clone) → the check SKIPS with a printed reason. Run it locally before committing content.
 *
 * Fails when (a) a literal shares ≥ 2 source 8-grams, (b) a literal shares any 12-gram (a copied run of ≥ 12
 * words), or (c) more than 0.5 % of all literal 8-grams occur in the sources. Output names file:line and at most
 * the shared 8 words — never longer source excerpts.
 */
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { APP_DIR, env, fs, path, walk } from '../security/node'

const N = 8
const LONG = 12
const MAX_SHARE = 0.005
/** Deliberate short quotes: sha-1 of the normalised 8-gram → reason + citation. Keep empty unless S signs off. */
const ALLOW: Record<string, string> = {}

// ---------- locate sources ----------
function findSources(): { dir: string | null; why: string } {
  const fromEnv = env.SPINLAB_SOURCES
  if (fromEnv !== undefined) return fs.existsSync(fromEnv) ? { dir: fromEnv, why: 'SPINLAB_SOURCES' } : { dir: null, why: `SPINLAB_SOURCES=${JSON.stringify(fromEnv)} does not exist` }
  let d = path.dirname(APP_DIR)
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'sources')) && fs.existsSync(path.join(d, 'pipeline', 'course.config.json'))) return { dir: path.join(d, 'sources'), why: 'nearest checkout with sources/' }
    const up = path.dirname(d)
    if (up === d) break
    d = up
  }
  return { dir: null, why: 'no sources/ folder in this checkout or any ancestor checkout' }
}

// ---------- normalisation (identical for both sides) ----------
export function words(text: string): string[] {
  const t = text
    .normalize('NFKC')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]*\$/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[*_]/g, ' ')
    .toLowerCase()
  return t.match(/[a-z]+(?:'[a-z]+)?/g) ?? []
}
/**
 * Word n-grams. A window made only of one-letter tokens is skipped on both sides: it is a run of algebra symbols
 * ("a b b a a b c a" from the vector-space axioms) or minified code ("c c c c …"), never copyable prose, and with
 * the full Axler and Bergou texts in sources/ (Physics 709) such runs collide by chance.
 */
export const grams = (w: string[], n: number) => {
  const out: string[] = []
  for (let i = 0; i + n <= w.length; i++) {
    const win = w.slice(i, i + n)
    if (win.every((t) => t.length === 1)) continue
    out.push(win.join(' '))
  }
  return out
}

// ---------- literal extraction ----------
interface Literal {
  where: string
  text: string
}
function literalsOf(file: string, code: string, kind: ts.ScriptKind, withJsx: boolean): Literal[] {
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, kind)
  const out: Literal[] = []
  const push = (n: ts.Node, text: string) => out.push({ where: `${file}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`, text })
  const visit = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) push(n, n.text)
    else if (ts.isTemplateExpression(n)) push(n, [n.head.text, ...n.templateSpans.map((s) => s.literal.text)].join(' '))
    else if (withJsx && ts.isJsxText(n) && n.text.trim()) push(n, n.text)
    ts.forEachChild(n, visit)
  }
  visit(sf)
  return out.filter((l) => words(l.text).length >= N)
}

const RAW = import.meta.glob<string>('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })
const isTest = (f: string) => /\.(test|spec)\.tsx?$/.test(f)
const AUTHORED: Literal[] = Object.entries(RAW)
  .filter(([f]) => !isTest(f) && (f.startsWith('/src/content/') || f === '/src/gate/content.ts' || f.endsWith('.tsx')))
  .flatMap(([f, code]) => literalsOf(f, code, f.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS, f.endsWith('.tsx')))

// ---------- the check ----------
interface Report {
  literals: number
  grams: number
  sharedGrams: number
  share: number
  offenders: { where: string; shared: string[]; long: boolean }[]
}
async function sha1(s: string) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
async function check(lits: Literal[], src8: Set<string>, src12: Set<string>): Promise<Report> {
  let total = 0
  let shared = 0
  const offenders: Report['offenders'] = []
  for (const l of lits) {
    const w = words(l.text)
    const g8 = grams(w, N)
    total += g8.length
    const hits: string[] = []
    for (const g of g8) if (src8.has(g) && !ALLOW[await sha1(g)]) hits.push(g)
    shared += hits.length
    const long = grams(w, LONG).some((g) => src12.has(g))
    if (hits.length >= 2 || long) offenders.push({ where: l.where, shared: [...new Set(hits)].slice(0, 3), long })
  }
  return { literals: lits.length, grams: total, sharedGrams: shared, share: total ? shared / total : 0, offenders }
}
const summary = (label: string, r: Report, srcWords: number, files: number) =>
  `verbatim[${label}]: ${r.literals} literals (≥${N} words), ${r.grams} ${N}-grams vs ${files} source files / ${srcWords} words → ` +
  `${r.sharedGrams} shared ${N}-grams (${(100 * r.share).toFixed(2)} %), ${r.offenders.length} offending literals`

// ---------- always-on repository hygiene ----------
describe('no source documents inside app/', () => {
  it('no *.pdf / *.epub / *.djvu files under app/ (outside node_modules)', () => {
    expect(walk(APP_DIR, (f) => /\.(pdf|epub|djvu|mobi)$/i.test(f)).map((f) => path.relative(APP_DIR, f))).toEqual([])
  })
  it('extracts the authored prose (sanity: L1 content is seen)', () => {
    expect(AUTHORED.length).toBeGreaterThan(100)
    expect(AUTHORED.some((l) => l.where.startsWith('/src/content/L1.ts:'))).toBe(true)
    expect(AUTHORED.some((l) => /\.tsx:\d+$/.test(l.where))).toBe(true)
  })
  it('normalisation drops TeX, commands and markdown emphasis', () => {
    expect(words('The **state** $|{+z}\\rangle$ is \\emph{not} a place; it’s $$x^2$$ _abstract_.')).toEqual(['the', 'state', 'is', 'not', 'a', 'place', "it's", 'abstract'])
  })
})

const { dir: SOURCES, why } = findSources()
const SOURCE_FILES = SOURCES ? walk(SOURCES, (f) => /\.(md|txt)$/i.test(f)) : []
if (!SOURCES || SOURCE_FILES.length === 0) console.log(`sources/ absent, verbatim check skipped (${why})`)

describe.skipIf(!SOURCES || SOURCE_FILES.length === 0)('verbatim overlap vs sources/**', () => {
  const src8 = new Set<string>()
  const src12 = new Set<string>()
  let srcWords = 0
  let susskind = 0
  for (const f of SOURCE_FILES) {
    const w = words(fs.readFileSync(f, 'utf8'))
    srcWords += w.length
    if (/[/\\]susskind[/\\]chapter\d+\.md$/.test(f)) susskind++
    for (const g of grams(w, N)) src8.add(g)
    for (const g of grams(w, LONG)) src12.add(g)
  }

  it('reads every source text, including the Susskind chapters', () => {
    expect(SOURCE_FILES.length).toBeGreaterThan(10)
    expect(susskind).toBeGreaterThan(0)
    expect(srcWords).toBeGreaterThan(50_000)
  })

  it('self-check: a copied source run IS caught (and only ≤ 8 words are reported)', async () => {
    // take a 14-word run from the middle of the largest source, plant it in a fake literal, expect a failure
    const w = words(fs.readFileSync(SOURCE_FILES.reduce((a, b) => (fs.statSync(a).size >= fs.statSync(b).size ? a : b)), 'utf8'))
    const run = w.slice(Math.floor(w.length / 2), Math.floor(w.length / 2) + 14).join(' ')
    const r = await check([{ where: 'planted:1', text: `Here we explain it in our own words ${run} and then we move on.` }], src8, src12)
    expect(r.offenders).toHaveLength(1)
    expect(r.offenders[0].long).toBe(true)
    for (const g of r.offenders[0].shared) expect(g.split(' ').length).toBe(N)
  })

  it('authored prose: 0 offending literals, corpus share ≤ 0.5 %', async () => {
    const r = await check(AUTHORED, src8, src12)
    console.log(summary('src', r, srcWords, SOURCE_FILES.length))
    expect(r.offenders.map((o) => `${o.where}${o.long ? ' (12-gram run)' : ''}: ${o.shared.map((g) => `"${g}"`).join(', ')}`)).toEqual([])
    expect(r.share).toBeLessThanOrEqual(MAX_SHARE)
  })

  const DIST_ASSETS = path.join(APP_DIR, 'dist', 'assets')
  // Library shader sources (Babylon's GLSL/WGSL chunks in the lab) are code, not prose: their single-letter swizzles
  // ("a b a b …" after normalisation) collide with the notes' algebra. A literal is shader code when it carries a
  // shader entry point or preprocessor/qualifier keyword; prose never does.
  const SHADER = /\b(gl_FragColor|gl_Position|void main\s*\(|(uniform|varying|attribute)\s+(highp\s+|mediump\s+|lowp\s+)?(vec[234]|mat[234]|float|int|bool|sampler2D)\b)|@(fragment|vertex|compute)\b|#(define|ifdef|ifndef|include)\b/
  it('symbol runs are not prose: all-one-letter windows are skipped, a window with any real word is kept', () => {
    expect(grams(words('a b b a a b c a b'), 8)).toEqual([])
    expect(grams(words('the vector a plus b equals b plus a'), 8)).toEqual(['the vector a plus b equals b plus', 'vector a plus b equals b plus a'])
  })
  it('shader-source filter: GLSL/WGSL literals are recognised, prose is not', () => {
    expect(SHADER.test('precision highp float; uniform vec4 vColor; void main(void){gl_FragColor=vColor;}')).toBe(true)
    expect(SHADER.test('#define CUSTOM_FRAGMENT_BEGIN\n@fragment fn main(input: FragmentInputs)')).toBe(true)
    expect(SHADER.test('The uniform field of a magnet splits the beam in two, and a varying field would not.')).toBe(false)
  })
  it.skipIf(!fs.existsSync(DIST_ASSETS))('built JS: 0 offending string literals (prose outside content/)', async () => {
    const lits = walk(DIST_ASSETS, (f) => f.endsWith('.js'))
      .flatMap((f) => literalsOf(path.relative(APP_DIR, f), fs.readFileSync(f, 'utf8'), ts.ScriptKind.JS, false))
      .filter((l) => !SHADER.test(l.text))
    const r = await check(lits, src8, src12)
    console.log(summary('dist', r, srcWords, SOURCE_FILES.length))
    expect(r.offenders.map((o) => `${o.where}: ${o.shared.map((g) => `"${g}"`).join(', ')}`)).toEqual([])
  })
})
