/**
 * Parse a learner's numeric answer: "0.75", "3/4", "√3/2", "sqrt(3)/2", "1/sqrt2", "cos(pi/8)^2",
 * "2 pi", "ħ/4" (ħ reads as 1, matching the engine's units). Recursive descent; never uses eval.
 * Returns null for anything it cannot read, so the UI can say "couldn't read that".
 */
// Null-prototype tables + Object.hasOwn lookups (decision #10, W-L1 §4.4 interim fix): identifiers such as
// "constructor", "toString", "__proto__" or "valueOf" must not resolve to Object.prototype members.
// W1 replaces these internals with physics/expr.ts; the public behaviour stays the same.
const FUNCS: Readonly<Record<string, (x: number) => number>> = Object.freeze(
  Object.assign(Object.create(null) as Record<string, (x: number) => number>, {
    sqrt: Math.sqrt,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    exp: Math.exp,
    ln: Math.log,
    abs: Math.abs,
  }),
)
const CONSTS: Readonly<Record<string, number>> = Object.freeze(
  Object.assign(Object.create(null) as Record<string, number>, { pi: Math.PI, π: Math.PI, e: Math.E, ħ: 1, hbar: 1 }),
)

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string }

function tokenize(src: string): Tok[] | null {
  const s = src.replace(/\s+/g, '').replace(/×|·/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
  const toks: Tok[] = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (/[0-9.]/.test(ch)) {
      const m = /^[0-9]*\.?[0-9]+(e[+-]?[0-9]+)?|^[0-9]+\.?/.exec(s.slice(i))
      if (!m) return null
      toks.push({ t: 'num', v: parseFloat(m[0]) })
      i += m[0].length
    } else if (/[a-zπħ√]/i.test(ch)) {
      if (ch === '√') {
        toks.push({ t: 'id', v: 'sqrt' })
        i++
        continue
      }
      const m = /^([a-z]+|π|ħ)/i.exec(s.slice(i))!
      toks.push({ t: 'id', v: m[0].toLowerCase() })
      i += m[0].length
    } else if ('+-*/^()'.includes(ch)) {
      toks.push({ t: 'op', v: ch })
      i++
    } else return null
  }
  return toks
}

export function parseNumber(src: string): number | null {
  const tokens = tokenize(src)
  if (!tokens || tokens.length === 0) return null
  const toks: Tok[] = tokens
  let p = 0
  const peek = () => toks[p]
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v

  // expr := term (('+'|'-') term)*
  function expr(): number {
    let v = term()
    while (isOp('+') || isOp('-')) {
      const op = toks[p++].v
      const r = term()
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  // term := unary (('*'|'/') unary | implicit-multiply unary)*
  function term(): number {
    let v = unary()
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = toks[p++].v
        const r = unary()
        v = op === '*' ? v * r : v / r
      } else if (peek() && (peek()!.t !== 'op' || peek()!.v === '(')) {
        v *= unary() // "2pi", "3√2", "2(1+i)"
      } else return v
    }
  }
  function unary(): number {
    if (isOp('-')) {
      p++
      return -unary()
    }
    if (isOp('+')) {
      p++
      return unary()
    }
    return power()
  }
  // power := atom ('^' unary)?
  function power(): number {
    const base = atom()
    if (isOp('^')) {
      p++
      return Math.pow(base, unary())
    }
    return base
  }
  function atom(): number {
    const tok = toks[p++]
    if (!tok) throw new Error('end')
    if (tok.t === 'num') return tok.v
    if (tok.t === 'op' && tok.v === '(') {
      const v = expr()
      if (!isOp(')')) throw new Error(')')
      p++
      return v
    }
    if (tok.t === 'id') {
      if (Object.hasOwn(CONSTS, tok.v)) return CONSTS[tok.v]
      // Functions bind to the next atom, so cos(x)^2 = (cos x)² and √3/2 = (√3)/2.
      if (Object.hasOwn(FUNCS, tok.v)) return FUNCS[tok.v](atom())
    }
    throw new Error('unexpected')
  }

  try {
    const v = expr()
    if (p !== toks.length || !Number.isFinite(v)) return null
    return v
  } catch {
    return null
  }
}
