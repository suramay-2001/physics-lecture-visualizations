/**
 * TEST-ONLY access to Node built-ins from tests under src/ (owner: S). The app program (tsconfig.app.json) is
 * typed with `vite/client` only; adding @types/node there would change DOM typings for every role (e.g.
 * `setTimeout` would return NodeJS.Timeout). So the few security tests that must read files outside the Vite
 * graph (dist/, the git-ignored sources/) get narrowly typed handles through `process.getBuiltinModule`
 * (Node ≥ 22.3). Never import this from application code: it throws outside Node.
 */
export interface DirEntry {
  name: string
  isFile(): boolean
  isDirectory(): boolean
}
export interface NodeFs {
  existsSync(p: string): boolean
  readFileSync(p: string, enc: 'utf8'): string
  readFileSync(p: string): Uint8Array
  readdirSync(p: string, o: { withFileTypes: true }): DirEntry[]
  statSync(p: string): { isDirectory(): boolean; isFile(): boolean; size: number; mtimeMs: number }
}
export interface NodePath {
  resolve(...p: string[]): string
  join(...p: string[]): string
  dirname(p: string): string
  relative(from: string, to: string): string
  sep: string
}
interface Proc {
  getBuiltinModule(id: string): unknown
  env: Record<string, string | undefined>
}

const proc = (globalThis as unknown as { process?: Proc }).process
if (!proc?.getBuiltinModule) throw new Error('security/node.ts is test-only (Node ≥ 22.3)')

export const fs = proc.getBuiltinModule('node:fs') as NodeFs
export const path = proc.getBuiltinModule('node:path') as NodePath
export const env = proc.env

/** Absolute path of a file URL (handles %20 in "physics lectures and visualizations"). */
export const fromUrl = (u: string | URL) => decodeURIComponent(new URL(u).pathname)
/** The app/ directory (this file lives in app/src/security/). */
export const APP_DIR = fromUrl(new URL('../../', import.meta.url)).replace(/\/$/, '')

/** Every file under `dir` (recursive), as absolute paths. Never descends into node_modules or dot-directories. */
export function walk(dir: string, keep: (file: string) => boolean = () => true): string[] {
  const out: string[] = []
  const visit = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) {
        if (e.name !== 'node_modules' && !e.name.startsWith('.')) visit(p)
      } else if (e.isFile() && keep(p)) out.push(p)
    }
  }
  if (fs.existsSync(dir)) visit(dir)
  return out.sort()
}
