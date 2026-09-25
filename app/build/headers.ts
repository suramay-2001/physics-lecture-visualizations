/**
 * Writes app/public/_headers from build/csp.ts (owner: S). Run from app/: `node build/headers.ts`
 * (Node ≥ 23.6 strips the types natively). build/csp.security.test.ts fails if the file drifts.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { headersFile } from './csp.ts'

const out = fileURLToPath(new URL('../public/_headers', import.meta.url))
writeFileSync(out, headersFile())
console.log(`wrote ${out.split('/').slice(-2).join('/')}`)
