/**
 * `?ret=` (ui/returnParam.ts) is untrusted: anyone can craft a link to a 448 page with it. It must hold ids only,
 * parsed field by field and checked against the chapter registry, so the return bar can only ever lead to an in-app
 * 709 chapter. Hostile, oversized, malformed and unknown values parse to null; the way back is built by paths.ts.
 */
import { describe, expect, it } from 'vitest'
import { lecturePath } from '../paths'
import { formatReturn, parseReturn, parseReturnSyntax, retOf, RET_MAX, stepOf, withRet, type KnownChapter } from './returnParam'

/** A registry that knows one chapter (the DEV demo's shape). */
const known: KnownChapter = (id) =>
  id === 'Q0'
    ? {
        id: 'Q0',
        title: 'Demo',
        units: [
          { id: 'q0-demo-sphere', title: 'A state on the sphere' },
          { id: 'q0-demo-plain', title: 'A plain unit' },
        ],
      }
    : undefined

const GOOD = 'qc709~Q0~q0-demo-sphere:b3~0.42~formal'

describe('ret: the good case and its round trip', () => {
  it('parses field by field and formats back to the same string', () => {
    const p = parseReturn(GOOD, known)
    expect(p).toEqual({ course: 'qc709', chapter: 'Q0', unit: 'q0-demo-sphere', beat: 'q0-demo-sphere:b3', frac: 0.42, track: 'formal' })
    expect(formatReturn(p!)).toBe(GOOD)
    expect(stepOf(p!.beat)).toBe('step 3')
  })
  it('a unit instead of a beat, and the edges of frac', () => {
    expect(parseReturn('qc709~Q0~q0-demo-plain~0~ground', known)).toMatchObject({ unit: 'q0-demo-plain', beat: null, frac: 0 })
    expect(parseReturn('qc709~Q0~q0-demo-sphere:b12a~1.000~ground', known)).toMatchObject({ beat: 'q0-demo-sphere:b12a', frac: 1 })
    expect(stepOf('q0-demo-sphere:b12a')).toBe('step 12a')
  })
  it('the way back is always an in-app chapter path built from the ids', () => {
    const p = parseReturn(GOOD, known)!
    expect(lecturePath(p.chapter)).toBe('/709/ch/Q0')
  })
})

describe('ret: hostile values parse to null', () => {
  it.each([
    ['empty', ''],
    ['a URL', 'https://evil.example/~Q0~q0-demo-sphere:b3~0.4~ground'],
    ['a protocol-relative URL in the chapter', 'qc709~//evil.example~q0-demo-sphere:b3~0.4~ground'],
    ['javascript: in the place', 'qc709~Q0~javascript:alert(1)~0.4~ground'],
    ['a path in the place', 'qc709~Q0~../../lecture/L1~0.4~ground'],
    ['a hash in the place', 'qc709~Q0~q0-demo-sphere#x~0.4~ground'],
    ['448 as the course', 'sl448~L1~l1-quantized:b1~0.4~ground'],
    ['unknown course', 'evil~Q0~q0-demo-sphere:b3~0.4~ground'],
    ['448 chapter under 709', 'qc709~L1~l1-quantized:b1~0.4~ground'],
    ['lower-case chapter', 'qc709~q0~q0-demo-sphere:b3~0.4~ground'],
    ['unit of another chapter', 'qc709~Q0~q3-bell:b4~0.4~ground'],
    ['unit prefix only', 'qc709~Q0~q0-~0.4~ground'],
    ['beat with upper case', 'qc709~Q0~q0-demo-sphere:B3~0.4~ground'],
    ['beat zero', 'qc709~Q0~q0-demo-sphere:b0~0.4~ground'],
    ['frac above 1', 'qc709~Q0~q0-demo-sphere:b3~1.5~ground'],
    ['negative frac', 'qc709~Q0~q0-demo-sphere:b3~-0.1~ground'],
    ['frac in exponent form', 'qc709~Q0~q0-demo-sphere:b3~1e-1~ground'],
    ['frac too precise', 'qc709~Q0~q0-demo-sphere:b3~0.12345~ground'],
    ['NaN frac', 'qc709~Q0~q0-demo-sphere:b3~NaN~ground'],
    ['unknown track', 'qc709~Q0~q0-demo-sphere:b3~0.4~advanced'],
    ['prototype track', 'qc709~Q0~q0-demo-sphere:b3~0.4~__proto__'],
    ['missing field', 'qc709~Q0~q0-demo-sphere:b3~0.4'],
    ['extra field', `${GOOD}~x`],
    ['NUL byte', 'qc709~Q0~q0-demo-sphere:b3\u0000~0.4~ground'],
    ['padded', ` ${GOOD}`],
    ['oversized', `qc709~Q0~q0-${'a'.repeat(RET_MAX)}:b3~0.4~ground`],
  ])('%s', (_, raw) => {
    expect(parseReturn(raw, known)).toBeNull()
  })
  it('non-strings parse to null', () => {
    for (const x of [null, undefined, 42, {}, ['qc709'], { toString: () => GOOD }]) expect(parseReturnSyntax(x)).toBeNull()
  })
  it('well-formed but unknown to the registry: an unknown chapter, an unknown unit', () => {
    expect(parseReturnSyntax('qc709~Q7~q7-bell:b4~0.4~ground')).not.toBeNull()
    expect(parseReturn('qc709~Q7~q7-bell:b4~0.4~ground', known)).toBeNull()
    expect(parseReturn('qc709~Q0~q0-nowhere:b1~0.4~ground', known)).toBeNull()
  })
  it('an adversarial 100 000-character value is rejected at once', () => {
    const t0 = performance.now()
    expect(parseReturn('~'.repeat(100_000), known)).toBeNull()
    expect(parseReturn(`qc709~Q0~${'q0-'.repeat(33_000)}~0.4~ground`, known)).toBeNull()
    expect(performance.now() - t0).toBeLessThan(50)
  })
})

describe('ret in a search string', () => {
  it('reads and writes only the ret parameter', () => {
    expect(retOf(`?ret=${GOOD}`)).toBe(GOOD)
    expect(retOf('?at=q0-demo-sphere:b3&f=0.4')).toBeNull()
    expect(retOf('')).toBeNull()
    expect(withRet('?track=formal', GOOD)).toBe(`?track=formal&ret=${GOOD}`)
    expect(retOf(withRet('?track=formal', GOOD))).toBe(GOOD)
    expect(withRet(`?ret=${GOOD}&x=1`, null)).toBe('?x=1')
    expect(withRet(`?ret=${GOOD}`, null)).toBe('')
  })
  it('a percent-encoded hostile ret is still only a string of ids to the parser', () => {
    const raw = retOf('?ret=qc709~Q0~%2F%2Fevil.example~0.4~ground')
    expect(raw).toBe('qc709~Q0~//evil.example~0.4~ground')
    expect(parseReturn(raw, known)).toBeNull()
  })
})
