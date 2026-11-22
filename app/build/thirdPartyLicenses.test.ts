import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectThirdPartyLicenses, THIRD_PARTY_FILE, thirdPartyLicenses } from './thirdPartyLicenses.ts'

const root = resolve(import.meta.dirname, '..')

describe('third-party licence notices (audit L3)', () => {
  const text = collectThirdPartyLicenses(root)

  it('lists the shipped packages with their licence text, and no dev-only tooling', () => {
    expect(text.length).toBeGreaterThan(10_000)
    for (const name of ['react', 'react-dom', 'react-router-dom', 'three', '@react-three/fiber', '@babylonjs/core', 'katex'])
      expect(text, name).toContain(`\n${name} `)
    expect(text).toContain('Permission is hereby granted')
    expect(text).not.toMatch(/^(vite|vitest|wrangler|@playwright\/test) \d/m)
  })

  it('the build plugin emits it as dist/licenses/third-party.txt', () => {
    const emitted: { fileName: string; source: string }[] = []
    const plugin = thirdPartyLicenses() as unknown as { configResolved(c: { root: string }): void; generateBundle(this: unknown): void }
    plugin.configResolved({ root })
    plugin.generateBundle.call({ emitFile: (f: { fileName: string; source: string }) => emitted.push(f) })
    expect(emitted).toHaveLength(1)
    expect(emitted[0].fileName).toBe(THIRD_PARTY_FILE)
    expect(emitted[0].source.length).toBeGreaterThan(10_000)
  })
})
