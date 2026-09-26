/**
 * Code-injection gate over every app/src/**\/*.{ts,tsx} file (S-L1 §4f.5, W-L1 §4.9; owner S). Round 3 adds
 * injected elements the production CSP blocks (<style>, <script>, frames; audit S-R3-01). AST-based (TypeScript
 * compiler API), so comments and strings that merely MENTION eval don't count and aliasing tricks in syntax do.
 * The oxlint rules in .oxlintrc.json are the editor-time twin of this test (no-eval, no-new-func, no-script-url,
 * react/no-danger); oxlint has no working no-implied-eval without type info, so string timers are caught here only.
 */
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path } from './node'

const SOURCES = import.meta.glob<string>('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })
/** The only files allowed to hand HTML strings to the DOM (KaTeX output; W-L1 §4.1). */
const HTML_SINK_OWNERS = new Set(['/src/ui/Rich.tsx'])
/**
 * Elements the production CSP blocks or that load code/frames outside the bundler: an injected <style> breaks
 * `style-src-elem 'self'` (a violation, and the rule silently never applies), <script>/<iframe>/<object>/<embed>
 * need script-src/frame-src/object-src exceptions. Style changes go through classes, data attributes or CSSOM
 * (`el.style.x = …`), which CSP does not govern.
 */
const BLOCKED_ELEMENTS = /^(style|script|iframe|object|embed|frame)$/i
/** Known exceptions, each with its audit finding; the list may only shrink (docs/roles/audits/L1-security-round3.md). */
const KNOWN_INJECTIONS: Record<string, string> = {
  // S-R3-01 closed in round 3b: D's devtools (the only <style> injection) was removed; window.__stage replaces it.
}
const isTest = (f: string) => /\.(test|spec)\.tsx?$/.test(f)

interface Hit {
  file: string
  line: number
  rule: string
}

function scan(file: string, text: string): Hit[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const hits: Hit[] = []
  const hit = (n: ts.Node, rule: string) => hits.push({ file, line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1, rule })
  const nameOf = (e: ts.Expression): string => {
    if (ts.isIdentifier(e)) return e.text
    if (ts.isPropertyAccessExpression(e)) return `${nameOf(e.expression)}.${e.name.text}`
    if (ts.isElementAccessExpression(e) && ts.isStringLiteralLike(e.argumentExpression)) return `${nameOf(e.expression)}.${e.argumentExpression.text}`
    if (ts.isParenthesizedExpression(e)) return nameOf(e.expression)
    return '?'
  }
  const last = (name: string) => name.split('.').pop()!
  const GLOBALS = /^(window|globalThis|self|top|parent|frames)$/
  const isStringish = (e: ts.Expression | undefined) => !!e && (ts.isStringLiteralLike(e) || ts.isTemplateExpression(e) || (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken))

  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const name = nameOf(n.expression)
      const base = name.split('.')
      const callee = last(name)
      const global = base.length === 1 || GLOBALS.test(base[0])
      if (callee === 'eval' && global) hit(n, 'eval()')
      if (callee === 'Function' && global) hit(n, ts.isNewExpression(n) ? 'new Function()' : 'Function()')
      if (/^(setTimeout|setInterval|setImmediate|execScript)$/.test(callee) && global && isStringish(n.arguments?.[0])) hit(n, `${callee}(string)`)
      if (callee === 'importScripts') hit(n, 'importScripts()')
      if (ts.isCallExpression(n) && /^(write|writeln)$/.test(callee) && base[0] === 'document') hit(n, 'document.write()')
      if (!isTest(file) && /^(insertAdjacentHTML|createContextualFragment|parseFromString)$/.test(callee)) hit(n, `${callee}()`)
      if (!isTest(file) && callee === 'createElement' && ts.isCallExpression(n) && ts.isStringLiteralLike(n.arguments[0]) && BLOCKED_ELEMENTS.test(n.arguments[0].text))
        hit(n, `createElement("${n.arguments[0].text.toLowerCase()}")`)
      if (ts.isNewExpression(n) && /^(Worker|SharedWorker)$/.test(callee)) {
        const a = n.arguments?.[0]
        const ok = !!a && ts.isNewExpression(a) && nameOf(a.expression) === 'URL' && !!a.arguments?.[0] && ts.isStringLiteralLike(a.arguments[0])
        if (!ok) hit(n, `new ${callee}(non-static URL)`)
      }
      // `.constructor('code')` reaches Function through any function value
      if (callee === 'constructor' && ts.isCallExpression(n) && isStringish(n.arguments[0])) hit(n, '.constructor(string)')
    }
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && !ts.isStringLiteralLike(n.arguments[0])) hit(n, 'import(non-literal)')
    if (ts.isWithStatement(n)) hit(n, 'with')
    if (!isTest(file) && ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const target = nameOf(n.left as ts.Expression)
      if (/(^|\.)(innerHTML|outerHTML|srcdoc)$/.test(target)) hit(n, `${last(target)} =`)
    }
    if (ts.isJsxAttribute(n) && ts.isIdentifier(n.name) && n.name.text === 'dangerouslySetInnerHTML' && !HTML_SINK_OWNERS.has(file)) hit(n, 'dangerouslySetInnerHTML outside ui/Rich.tsx')
    if (!isTest(file) && ts.isStringLiteralLike(n) && /^\s*javascript:/i.test(n.text)) hit(n, 'script-scheme URL')
    if (!isTest(file) && (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && ts.isIdentifier(n.tagName) && BLOCKED_ELEMENTS.test(n.tagName.text) && n.tagName.text === n.tagName.text.toLowerCase())
      hit(n, `<${n.tagName.text}> element`)
    ts.forEachChild(n, visit)
  }
  visit(sf)
  return hits
}

describe('no eval-like code or stray HTML sinks in app/src', () => {
  const files = Object.keys(SOURCES)

  it('scans the whole source tree', () => {
    expect(files.length).toBeGreaterThan(50)
    expect(files).toContain('/src/ui/Rich.tsx')
  })

  it('0 hits (outside the listed known exceptions)', () => {
    const hits = files.flatMap((f) => scan(f, SOURCES[f])).filter((h) => !KNOWN_INJECTIONS[`${h.file} ${h.rule}`])
    expect(hits.map((h) => `${h.file}:${h.line} ${h.rule}`)).toEqual([])
  })

  it('the scanner catches each rule (self-check on a bad sample)', () => {
    const BAD = [
      'eval(s)',
      'window.eval(s)',
      'globalThis["eval"](s)',
      'new Function("a", "return a")',
      'Function("return 1")()',
      'setTimeout("alert(1)", 1)',
      'window.setInterval(`x${1}`, 1)',
      'document.write(s)',
      'el.innerHTML = s',
      'el.insertAdjacentHTML("beforeend", s)',
      'import(s)',
      'new Worker(url)',
      '(() => 1).constructor("return 1")',
      'location.href = "javascript:alert(1)"',
      'importScripts(u)',
      'document.createElement("style")',
      "document.createElement('SCRIPT')",
      'document.createElement("iframe")',
    ]
    for (const line of BAD) expect(scan('/src/x.ts', `export const f = (s: string, el: HTMLElement, url: string, u: string) => { ${line} }`).length, line).toBeGreaterThan(0)
    expect(scan('/src/x.tsx', 'export const A = (h: string) => <div dangerouslySetInnerHTML={{ __html: h }} />')).toHaveLength(1)
    expect(scan('/src/ui/Rich.tsx', 'export const A = (h: string) => <div dangerouslySetInnerHTML={{ __html: h }} />')).toHaveLength(0)
    expect(scan('/src/x.tsx', 'export const A = () => <style>{".a{}"}</style>')).toHaveLength(1)
    expect(scan('/src/x.tsx', 'export const A = () => <iframe src="x" />')).toHaveLength(1)
    expect(scan('/src/x.tsx', 'export const A = () => <div style={{ color: "red" }} />')).toHaveLength(0)
    // mentions in comments/strings and safe look-alikes are not hits
    const OK = ['// never uses eval(x)', 'const s = "eval(x)"', 'setTimeout(() => 1, 5)', 'new Worker(new URL("./w.ts", import.meta.url))', 'import("./x")', 'obj.evaluate(x)', 'model.eval()', 'document.createElement("div")', 'x.style.transition = "none"']
    for (const line of OK) expect(scan('/src/x.ts', `export const f = (obj: any, model: any, x: any) => { ${line} }`), line).toEqual([])
  })

  it('.oxlintrc.json keeps the editor-time twins of these rules switched on', () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(APP_DIR, '.oxlintrc.json'), 'utf8')) as { rules: Record<string, unknown> }
    for (const r of ['no-eval', 'no-new-func', 'no-script-url', 'react/jsx-no-script-url', 'react/no-danger']) expect(cfg.rules[r], r).toBe('error')
  })
})
