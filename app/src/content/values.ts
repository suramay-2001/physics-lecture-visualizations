/**
 * Every lecture's engine values, merged: the claim ledger (content/claims.test.ts) checks each key against its
 * numpy twin in physics/__fixtures__/claims.json (pipeline/make_claim_fixtures.py). Keys must be unique across
 * the course — `mergeValues` throws on a duplicate, so a lecture can never silently shadow another's number.
 */
import { V as V1 } from './L1.values'
import { V as V2 } from './L2.values'

export function mergeValues(...tables: Readonly<Record<string, number>>[]): Readonly<Record<string, number>> {
  const out: Record<string, number> = {}
  for (const t of tables)
    for (const [k, v] of Object.entries(t)) {
      if (k in out) throw new Error(`values: duplicate claim key ${k}`)
      out[k] = v
    }
  return out
}

export const ALL_VALUES = mergeValues(V1, V2)
