/**
 * Third-party licence notices (public-launch audit L3): MIT, BSD and Apache-2.0 all require the notice to travel with
 * copies of the code, and Vite strips the licence comments from the bundles. After a build this writes
 * `dist/licenses/third-party.txt`: for every non-dev package in package-lock.json, its name, version, licence id and the
 * text of its LICENSE / NOTICE / COPYING files, read from node_modules (no network). Dev-only tooling (Vite, Vitest,
 * Playwright, wrangler) never ships, so it is not listed. The page footer links to the file.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

export const THIRD_PARTY_FILE = 'licenses/third-party.txt'

interface LockPackage { version?: string; license?: string; dev?: boolean; link?: boolean }

const NOTICE_FILE = /^(licen[cs]e|notice|copying|copyright)(\..+)?$/i

/** The notice text of every non-dev package in the lockfile under `root`, as one plain-text document. */
export function collectThirdPartyLicenses(root: string): string {
  const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8')) as { packages: Record<string, LockPackage> }
  const rows = Object.entries(lock.packages)
    .filter(([key, p]) => key.startsWith('node_modules/') && !p.dev && !p.link)
    .map(([key, p]) => ({ key, name: key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length), p }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.key.localeCompare(b.key))
  const out: string[] = [
    'Third-party software in Spin Lab',
    '',
    'The packages below ship in the built site (production dependencies and everything they pull in). Each entry gives the',
    'package, its version and licence, and the licence / notice files it distributes. The self-hosted font families and the',
    'KaTeX fonts carry their own SIL Open Font License texts in /licenses/fonts/.',
    `${rows.length} packages.`,
    '',
  ]
  for (const { key, name, p } of rows) {
    const dir = resolve(root, key)
    out.push('='.repeat(78), `${name} ${p.version ?? ''}  [${p.license ?? 'licence not declared in the lockfile'}]`, '='.repeat(78))
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => NOTICE_FILE.test(f)).sort() : []
    if (!files.length) out.push('(no licence file is distributed with this package; see the licence id above)')
    for (const f of files) out.push(`--- ${f} ---`, readFileSync(join(dir, f), 'utf8').replace(/\r\n/g, '\n').trimEnd())
    out.push('')
  }
  return out.join('\n')
}

export function thirdPartyLicenses(): Plugin {
  let root = ''
  return {
    name: 'spin-lab:third-party-licenses',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: THIRD_PARTY_FILE, source: collectThirdPartyLicenses(root) })
    },
  }
}
