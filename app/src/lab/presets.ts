/**
 * Preset deep links, `#/lab/:bench?preset=<id>` (decisions/lab.md ruling 7; D-lab §1): the URL carries ONE
 * allowlisted id per bench, never free state. Every bench declares its presets as a frozen, null-prototype table
 * (`presetTable`); `presetFrom` accepts only a short lowercase id that is an OWN key of that table, so an unknown id,
 * a prototype name (`constructor`, `__proto__`), a second parameter or an encoded payload is ignored: nothing from
 * the query is ever parsed as state. Pure; tested in presets.test.ts.
 */

/** Shape of an id: lowercase letters, digits and hyphens, 1–32 characters. */
export const PRESET_ID = /^[a-z0-9-]{1,32}$/

/** A bench's preset table: frozen, with a null prototype (no inherited keys can match). */
export function presetTable<T>(entries: Record<string, T>): Readonly<Record<string, T>> {
  const t = Object.create(null) as Record<string, T>
  for (const [k, v] of Object.entries(entries)) {
    if (!PRESET_ID.test(k)) throw new Error(`preset id "${k}" is not ${PRESET_ID}`)
    t[k] = Object.freeze(v)
  }
  return Object.freeze(t)
}

/** The allowlisted id named by `raw` (the `preset` query value), or null. */
export function presetFrom<T>(table: Readonly<Record<string, T>>, raw: string | null | undefined): string | null {
  if (typeof raw !== 'string' || !PRESET_ID.test(raw)) return null
  return Object.hasOwn(table, raw) ? raw : null
}

/** The `preset` value of a hash-route query string ("?preset=sz-lap&x=1" → "sz-lap"); only the first one counts. */
export function presetParam(search: string): string | null {
  return new URLSearchParams(search).get('preset')
}
