/**
 * A paper spec is DATA (rulings papers.md R4; docs/specs/papers-platform.md §1, §7): every file the offline pipeline or a
 * later smart tool emits for the Papers section (content/papers/*.paper.ts, *.glossary.ts and the bridges table) holds
 * nothing that runs. AST-based (TypeScript compiler API, like security/noEval.security.test.ts), so a comment or a string that
 * merely mentions code does not count, and no expression can hide in the syntax:
 *   - imports are `import type` only (they vanish at build time);
 *   - the one statement besides them is `export const NAME[: Type] = <literal>` (optionally `as const` / `satisfies T`);
 *   - a literal is an object (plain `key: value` properties, no computed key, no `__proto__`, no shorthand, spread, method or
 *     accessor), an array (no spread, no hole), a string, a template with no substitution, a number (or a negated one),
 *     true, false or null.
 * So a call, a function, an identifier, an import of code, a getter or a template substitution anywhere in a spec fails here,
 * before the site ever loads it; the recipe registry is the only way a spec reaches the engine.
 */
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const FILES = import.meta.glob<string>(['/src/content/papers/*.paper.ts', '/src/content/papers/*.glossary.ts', '/src/content/papers/bridges.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Every reason a source text is not a pure data module ([] = it is). */
export function dataProblems(file: string, text: string): string[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const bad: string[] = []
  const at = (n: ts.Node, why: string) => bad.push(`${file}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}: ${why}`)

  const literal = (e: ts.Expression): void => {
    if (ts.isParenthesizedExpression(e)) return literal(e.expression)
    if (ts.isAsExpression(e)) {
      if (!(ts.isTypeReferenceNode(e.type) && ts.isIdentifier(e.type.typeName) && e.type.typeName.text === 'const')) at(e, 'only `as const` may follow a literal')
      return literal(e.expression)
    }
    if (ts.isSatisfiesExpression(e)) return literal(e.expression)
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e) || ts.isNumericLiteral(e)) return
    if (e.kind === ts.SyntaxKind.TrueKeyword || e.kind === ts.SyntaxKind.FalseKeyword || e.kind === ts.SyntaxKind.NullKeyword) return
    if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand)) return
    if (ts.isArrayLiteralExpression(e)) {
      for (const x of e.elements) {
        if (ts.isSpreadElement(x)) at(x, 'a spread in an array')
        else if (ts.isOmittedExpression(x)) at(x, 'a hole in an array')
        else literal(x)
      }
      return
    }
    if (ts.isObjectLiteralExpression(e)) {
      for (const p of e.properties) {
        if (!ts.isPropertyAssignment(p)) {
          at(p, `${ts.SyntaxKind[p.kind]} in an object (only key: value)`)
          continue
        }
        if (ts.isComputedPropertyName(p.name)) at(p, 'a computed key')
        else if ((ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === '__proto__') at(p, 'a __proto__ key (it would set the prototype)')
        literal(p.initializer)
      }
      return
    }
    at(e, `${ts.SyntaxKind[e.kind]} (a spec holds literals only: no call, function, name, template substitution or operator)`)
  }

  let exports = 0
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const c = st.importClause
      const typeOnly = !!c && (c.isTypeOnly || (!c.name && !!c.namedBindings && ts.isNamedImports(c.namedBindings) && c.namedBindings.elements.every((s) => s.isTypeOnly)))
      if (!typeOnly) at(st, 'an import of code (only `import type` is allowed)')
      continue
    }
    if (ts.isVariableStatement(st)) {
      const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      const isConst = (st.declarationList.flags & ts.NodeFlags.Const) !== 0
      if (!exported || !isConst || st.declarationList.declarations.length !== 1) at(st, 'expected `export const NAME = <literal>` (one declaration)')
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) at(d, 'a destructuring declaration')
        if (!d.initializer) at(d, 'a declaration without a value')
        else literal(d.initializer)
      }
      exports++
      continue
    }
    at(st, `${ts.SyntaxKind[st.kind]} (a spec file holds type imports and one exported literal)`)
  }
  if (exports !== 1) bad.push(`${file}: expected exactly one \`export const\`, found ${exports}`)
  return bad
}

describe('the Papers section’s emitted files are data only', () => {
  it('the glob found the spec, its glossary and the bridges table (so the gate measured something)', () => {
    const names = Object.keys(FILES)
    expect(names).toContain('/src/content/papers/P1.paper.ts')
    expect(names).toContain('/src/content/papers/P1.glossary.ts')
    expect(names).toContain('/src/content/papers/bridges.ts')
  })
  it.each(Object.entries(FILES))('%s', (file, text) => {
    expect(dataProblems(file, text)).toEqual([])
  })
})

describe('the gate catches every way code could hide in a spec', () => {
  const head = "import type { PaperSpec } from '../../papers/spec'\n"
  it.each<[string, string, RegExp]>([
    ['a call', 'export const P9 = { title: String(1) }', /CallExpression/],
    ['an arrow function', 'export const P9 = { holds: () => true }', /ArrowFunction/],
    ['a function expression', 'export const P9 = { holds: function () { return 1 } }', /FunctionExpression/],
    ['a method', 'export const P9 = { holds() { return 1 } }', /MethodDeclaration in an object/],
    ['a getter', 'export const P9 = { get title() { return "x" } }', /GetAccessor in an object/],
    ['an identifier', 'export const P9 = { title: window }', /Identifier/],
    ['a property access', 'export const P9 = { title: globalThis.name }', /PropertyAccessExpression/],
    ['a template substitution', 'export const P9 = { title: `x${1}` }', /TemplateExpression/],
    ['a spread', 'export const P9 = { ...{ a: 1 } }', /SpreadAssignment in an object/],
    ['a shorthand property', 'const a = 1\nexport const P9 = { a }', /VariableStatement|ShorthandPropertyAssignment/],
    ['a computed key', 'export const P9 = { ["ti" + "tle"]: 1 }', /a computed key/],
    ['a __proto__ key', 'export const P9 = { __proto__: { polluted: 1 } }', /__proto__/],
    ['an import of code', "import { runRecipe } from '../../papers/recipes'\nexport const P9 = {}", /an import of code/],
    ['a dynamic import', 'export const P9 = { m: import("./x") }', /CallExpression/],
    ['a second statement', 'export const P9 = {}\nconsole.log(1)', /ExpressionStatement/],
    ['a let', 'export let P9 = {}', /expected `export const NAME = <literal>`/],
    ['a cast to something else', 'export const P9 = {} as unknown', /only `as const`/],
    ['a binary expression', 'export const P9 = { n: 1 + 1 }', /BinaryExpression/],
  ])('%s', (_, body, want) => {
    const bad = dataProblems('x.paper.ts', head + body)
    expect(bad.join('\n')).toMatch(want)
  })
  it('a typed literal with `satisfies`, `as const`, negative numbers, null and nested lists passes', () => {
    expect(dataProblems('x.paper.ts', `${head}export const P9 = { a: [1, -2, 'x', null, true, { b: \`plain\` }] } as const satisfies Record<string, unknown>`)).toEqual([])
  })
})
