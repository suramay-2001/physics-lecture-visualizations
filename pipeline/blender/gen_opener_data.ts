/**
 * Writes the JSON the Blender opener scripts draw (decision P3 #4: Blender computes no physics).
 * Run from the repo root:  node pipeline/blender/gen_opener_data.ts
 * Output (git-ignored, regenerable): pipeline/blender/data/{hopf,belt,grover}.json
 * The numbers come from app/src/openers/openerData.ts, which app/src/openers/openerData.test.ts checks.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// the engine is written for Vite (extensionless relative imports, e.g. physics/qc/grover.ts); let Node's type stripping load it as-is
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (e) {
      if (/^\.\.?\//.test(specifier) && !extname(specifier)) return nextResolve(`${specifier}.ts`, context)
      throw e
    }
  },
})
const { OPENER_FRAMES, beltOpenerFrame, hopfBead, hopfOpenerFibers, HOPF_OPENER, GROVER_OPENER, groverOpenerFrame } = await import('../../app/src/openers/openerData.ts')
const { INK } = await import('../../app/src/stage/tokens.ts')

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'data')
mkdirSync(out, { recursive: true })

const r5 = (x: number) => Math.round(x * 1e5) / 1e5
const v = (p: readonly number[]) => p.map(r5)
const frames = Array.from({ length: OPENER_FRAMES }, (_, f) => f)

const hopf = {
  frames: OPENER_FRAMES,
  firstRing: HOPF_OPENER.firstRing,
  fibers: hopfOpenerFibers().map((f) => ({ ...f, phi: r5(f.phi), points: f.points.map(v) })),
  bead: frames.map((f) => v(hopfBead(f))),
}
const belt = {
  frames: frames.map((f) => {
    const b = beltOpenerFrame(f)
    return { ...b, alphaDeg: r5(b.alphaDeg), u: r5(b.u), block: v(b.block), points: b.points.map(v), widths: b.widths.map(v) }
  }),
}
// Grover: the stage ground and the inks come from tokens.ts too, so the script types no colour of the app's palette
const grover = {
  ground: GROVER_OPENER.ground,
  ink: { state: INK.state, silver: INK.silver, silver2: INK.silver2, silver3: INK.silver3, text: INK.text },
  marked: GROVER_OPENER.marked,
  frames: frames.map((f) => {
    const g = groverOpenerFrame(f)
    return { f, steps: r5(g.steps), plane: v(g.plane), angleDeg: r5(g.angleDeg), bars: v(g.bars), trail: g.trail.map(v) }
  }),
}

writeFileSync(join(out, 'hopf.json'), JSON.stringify(hopf))
writeFileSync(join(out, 'belt.json'), JSON.stringify(belt))
writeFileSync(join(out, 'grover.json'), JSON.stringify(grover))
console.log(`wrote ${hopf.fibers.length} fibers, ${belt.frames.length} belt frames and ${grover.frames.length} Grover frames to ${out}`)
