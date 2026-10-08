/**
 * Every lecture's engine values, merged: the claim ledger (content/claims.test.ts) checks each key against its
 * numpy twin in physics/__fixtures__/claims.json (pipeline/make_claim_fixtures.py). Keys must be unique across
 * the course — `mergeValues` throws on a duplicate, so a lecture can never silently shadow another's number.
 * Since the second course, 709's tables (content/qc709/values.ts, merged by file name) join the same key space.
 */
import { V as V1 } from './L1.values'
import { V as V2 } from './L2.values'
import { V as V3 } from './L3.values'
import { V as V4 } from './L4.values'
import { V as V5 } from './L5.values'
import { V as V6 } from './L6.values'
import { V as V7 } from './L7.values'
import { V as V9 } from './L9.values'
import { mergeValues } from './claimKit'
import { QC_VALUES } from './qc709/values'

export { mergeValues }

/** Physics 448's values (the claim ledger's 448 twins live in physics/__fixtures__/claims.json). */
export const VALUES_448 = mergeValues(V1, V2, V3, V4, V5, V6, V7, V9)

/** Both courses: one key space, so a 709 chapter can never shadow a 448 number (or the reverse). */
export const ALL_VALUES = mergeValues(VALUES_448, QC_VALUES)
