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
import { V as V8 } from './L8.values'
import { V as V9 } from './L9.values'
import { V as V10 } from './L10.values'
import { V as V11 } from './L11.values'
import { V as V12 } from './L12.values'
import { V as V13 } from './L13.values'
import { mergeValues } from './claimKit'
import { QC_VALUES } from './qc709/values'
// the 709 lecture notes' computed claims (qc709/notes/N*.values.ts, merged by file name); tests only, like this file
import { NOTES_VALUES } from './qc709/notes/values'
// the 709 Optics Lab's computed claims (qc709/optics/O*.values.ts, merged by file name); tests only, like this file
import { OPTICS_VALUES } from './qc709/optics/values'
// the Papers section's computed claims (compiled from the specs: content/papers/index.ts); tests only, like this file
import { PAPER_VALUES } from './papers/index'

export { mergeValues }

/** Physics 448's values (the claim ledger's 448 twins live in physics/__fixtures__/claims.json). */
export const VALUES_448 = mergeValues(V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, V11, V12, V13)

/** Every course: one key space, so no chapter can shadow another course's number. */
export const ALL_VALUES = mergeValues(VALUES_448, QC_VALUES, PAPER_VALUES, NOTES_VALUES, OPTICS_VALUES)
