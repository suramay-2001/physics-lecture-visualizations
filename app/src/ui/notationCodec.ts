/**
 * The data a notation mark carries (notation explainers, decisions/notation-explainers.md). A mark is KaTeX's
 * `\htmlData{notation=<id>,lo=…,hi=…}{…}`, which renders as `<span class="enclosing" data-notation="<id>" data-lo="…">`.
 * KaTeX reads the `\htmlData` argument as a RAW string (comments, macros and spaces are not preserved; `%` starts a
 * comment), so the captured TeX of an expression (the limits of a sum, the pieces of a bra-ket) travels encoded: ASCII
 * letters and digits stay, every other byte becomes `.` plus two hex digits. The encoded alphabet is what the trusted
 * renderer accepts (ui/tex.ts `trustNotation`), so a mark can carry text but never markup.
 * Pure; shared by the pre-processor (ui/notationMark.ts) and the card (components/NotationCard.tsx), both lazy. The
 * vocabulary (keys, id and value shapes) is ui/notationKeys.ts, which the entry chunk needs for the trust check.
 */

export { NOTATION_ID, NOTATION_KEYS, NOTATION_VALUE, type NotationCtx, type NotationKey } from './notationKeys'
import type { NotationKey } from './notationKeys'

const hex2 = (n: number) => (n < 16 ? '0' : '') + n.toString(16)

export function encodePart(s: string): string {
  let out = ''
  for (const b of new TextEncoder().encode(s)) out += (b > 47 && b < 58) || (b > 64 && b < 91) || (b > 96 && b < 123) ? String.fromCharCode(b) : `.${hex2(b)}`
  return out
}

export function decodePart(s: string): string {
  const bytes: number[] = []
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '.') {
      bytes.push(Number.parseInt(s.slice(i + 1, i + 3), 16) || 63)
      i += 2
    } else bytes.push(s.charCodeAt(i))
  }
  return new TextDecoder().decode(new Uint8Array(bytes))
}

/** The context a rendered mark carries: its `data-*` values decoded (TeX source, as captured). */
export function readMark(el: { dataset: DOMStringMap }): { id: string; ctx: Record<NotationKey, string | undefined> } {
  const d = el.dataset
  const get = (k: NotationKey) => (d[k] === undefined ? undefined : decodePart(d[k]))
  return { id: d.notation ?? '', ctx: { lo: get('lo'), hi: get('hi'), of: get('of'), a: get('a'), m: get('m'), b: get('b') } }
}
