/**
 * Typed parameter checks for the recipe registry (docs/specs/papers-platform.md §3). A recipe's parameters are UNTRUSTED
 * data (a paper spec a tool wrote): each one is read by a small combinator that accepts exactly one shape and says what it
 * expected when it does not. Pure: no React, no engine. The combinators carry their TypeScript type, so a recipe's params
 * type (and a spec's `RecipeRef`) is derived from the same object that checks it at run time.
 */

export type Checked<T> = { ok: true; value: T } | { ok: false; problems: string[] }

export interface Param<T> {
  /** What a good value looks like, for errors and docs: "a whole number from 1 to 10". */
  readonly expects: string
  readonly optional?: false
  check(x: unknown, at: string): Checked<T>
}
export interface OptionalParam<T> {
  readonly expects: string
  readonly optional: true
  check(x: unknown, at: string): Checked<T | undefined>
}
type AnyParam = Param<unknown> | OptionalParam<unknown>

const ok = <T>(value: T): Checked<T> => ({ ok: true, value })
const fail = (problems: string[]): Checked<never> => ({ ok: false, problems })

/** A short, safe rendering of an untrusted value for an error message (never the whole of a huge input). */
export function shown(x: unknown): string {
  if (x === undefined) return 'nothing'
  if (typeof x === 'number' && !Number.isFinite(x)) return String(x)
  let s: string
  try {
    s = JSON.stringify(x) ?? String(x)
  } catch {
    s = Object.prototype.toString.call(x)
  }
  return s.length > 40 ? `${s.slice(0, 37)}…` : s
}

const expected = (at: string, expects: string, x: unknown): Checked<never> => fail([`${at}: expected ${expects}, got ${shown(x)}`])

/** A whole number in [min, max]. */
export function int(min: number, max: number): Param<number> {
  const expects = `a whole number from ${min} to ${max}`
  return { expects, check: (x, at) => (typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max ? ok(x) : expected(at, expects, x)) }
}

/** A finite number in [min, max]. */
export function num(min: number, max: number): Param<number> {
  const expects = `a number from ${min} to ${max}`
  return { expects, check: (x, at) => (typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max ? ok(x) : expected(at, expects, x)) }
}

/** One of a closed list of strings. */
export function oneOf<const T extends readonly string[]>(values: T): Param<T[number]> {
  const expects = `one of ${values.map((v) => `'${v}'`).join(', ')}`
  return { expects, check: (x, at) => (typeof x === 'string' && values.includes(x) ? ok(x as T[number]) : expected(at, expects, x)) }
}

export function bool(): Param<boolean> {
  return { expects: 'true or false', check: (x, at) => (typeof x === 'boolean' ? ok(x) : expected(at, 'true or false', x)) }
}

/** A string of 0s and 1s, minLen to maxLen characters. */
export function bits(minLen: number, maxLen: number): Param<string> {
  const expects = `a string of ${minLen}–${maxLen} bits (0 and 1)`
  return {
    expects,
    check: (x, at) => (typeof x === 'string' && x.length >= minLen && x.length <= maxLen && /^[01]+$/.test(x) ? ok(x) : expected(at, expects, x)),
  }
}

/** A paper-local id: lower-case letters, digits and hyphens (a reported-claim id), 1 to 40 characters. */
export function ident(): Param<string> {
  const expects = 'an id (lower-case letters, digits, hyphens)'
  return { expects, check: (x, at) => (typeof x === 'string' && /^[a-z0-9-]{1,40}$/.test(x) ? ok(x) : expected(at, expects, x)) }
}

/** Plain words of 1 to maxLen characters: no TeX, no markup delimiters, no control characters. */
export function plain(maxLen: number): Param<string> {
  const expects = `plain text of 1 to ${maxLen} characters (no $, backslash, <, >, braces or brackets)`
  const bad = /[$\\<>{}[\]\u0000-\u001f]/
  return { expects, check: (x, at) => (typeof x === 'string' && x.length >= 1 && x.length <= maxLen && !bad.test(x) ? ok(x) : expected(at, expects, x)) }
}

/** A Pauli string over I, X, Y, Z, minLen to maxLen letters ('XI', 'IZ'). */
export function pauliText(minLen: number, maxLen: number): Param<string> {
  const expects = `a Pauli string of ${minLen}–${maxLen} letters (I, X, Y, Z)`
  return { expects, check: (x, at) => (typeof x === 'string' && x.length >= minLen && x.length <= maxLen && /^[IXYZ]+$/.test(x) ? ok(x) : expected(at, expects, x)) }
}

/** Either of two shapes (the first that accepts the value wins). */
export function either<A, B>(a: Param<A>, b: Param<B>): Param<A | B> {
  const expects = `${a.expects}, or ${b.expects}`
  return {
    expects,
    check: (x, at) => {
      const ra = a.check(x, at)
      if (ra.ok) return ra
      const rb = b.check(x, at)
      return rb.ok ? rb : expected(at, expects, x)
    },
  }
}

/** A list of min to max items, each checked by `item` (every bad item is reported, by index). */
export function list<T>(item: Param<T>, min: number, max: number): Param<T[]> {
  const expects = `a list of ${min} to ${max} items, each ${item.expects}`
  return {
    expects,
    check: (x, at) => {
      if (!Array.isArray(x)) return expected(at, expects, x)
      if (x.length < min || x.length > max) return fail([`${at}: expected ${min} to ${max} items, got ${x.length}`])
      const out: T[] = []
      const problems: string[] = []
      x.forEach((v, i) => {
        const r = item.check(v, `${at}[${i}]`)
        if (r.ok) out.push(r.value)
        else problems.push(...r.problems)
      })
      return problems.length ? fail(problems) : ok(out)
    },
  }
}

/** The same parameter, which may be left out (undefined); the recipe applies its own default. */
export function optional<T>(p: Param<T>): OptionalParam<T> {
  return { expects: `${p.expects} (optional)`, optional: true, check: (x, at) => (x === undefined ? ok(undefined) : p.check(x, at)) }
}

type Inner<P> = P extends Param<infer T> ? T : P extends OptionalParam<infer T> ? T : never
type RequiredKeys<S> = { [K in keyof S]: S[K] extends OptionalParam<unknown> ? never : K }[keyof S]
type OptionalKeys<S> = { [K in keyof S]: S[K] extends OptionalParam<unknown> ? K : never }[keyof S]
type Flatten<T> = { [K in keyof T]: T[K] }
/** The object type a `shape` accepts: required fields, then the optional ones. */
export type ShapeOf<S extends Record<string, AnyParam>> = Flatten<{ [K in RequiredKeys<S>]: Inner<S[K]> } & { [K in OptionalKeys<S>]?: Inner<S[K]> }>

/** A plain object (not an array, not a class instance) with own properties only. */
export const isPlainObject = (x: unknown): x is Record<string, unknown> => {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false
  const proto = Object.getPrototypeOf(x)
  return proto === Object.prototype || proto === null
}

/**
 * An object with exactly these fields: a missing required field, an unknown field (`__proto__` included: keys are read
 * with Object.keys and looked up with Object.hasOwn) and every bad value are reported together.
 */
export function shape<S extends Record<string, AnyParam>>(fields: S): Param<ShapeOf<S>> {
  const names = Object.keys(fields)
  const expects = `an object with ${names.join(', ')}`
  return {
    expects,
    check: (x, at) => {
      if (!isPlainObject(x)) return expected(at, expects, x)
      const problems: string[] = []
      const out: Record<string, unknown> = {}
      for (const k of Object.keys(x)) if (!Object.hasOwn(fields, k)) problems.push(`${at}.${k}: unknown parameter (allowed: ${names.join(', ')})`)
      for (const k of names) {
        const p = fields[k]
        const v = Object.hasOwn(x, k) ? x[k] : undefined
        if (v === undefined && !p.optional) {
          problems.push(`${at}.${k}: missing (expected ${p.expects})`)
          continue
        }
        const r = p.check(v, `${at}.${k}`)
        if (r.ok) {
          if (r.value !== undefined) out[k] = r.value
        } else problems.push(...r.problems)
      }
      return problems.length ? fail(problems) : ok(out as ShapeOf<S>)
    },
  }
}
