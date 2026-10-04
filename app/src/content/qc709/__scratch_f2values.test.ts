import { describe, it } from 'vitest'
import { V } from './F2.values'

describe('f2 values scratch', () => {
  it('prints all V entries', () => {
    for (const [k, v] of Object.entries(V)) console.log(k, v)
  })
})
