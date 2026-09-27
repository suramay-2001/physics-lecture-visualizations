/**
 * Writes the JSON the Blender opener scripts draw (decision P3 #4: Blender computes no physics).
 * Run from the repo root:  node pipeline/blender/gen_opener_data.ts
 * Output (git-ignored, regenerable): pipeline/blender/data/{hopf,belt}.json
 * The numbers come from app/src/openers/openerData.ts, which app/src/openers/openerData.test.ts checks.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { OPENER_FRAMES, beltOpenerFrame, hopfBead, hopfOpenerFibers, HOPF_OPENER } from '../../app/src/openers/openerData.ts'

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

writeFileSync(join(out, 'hopf.json'), JSON.stringify(hopf))
writeFileSync(join(out, 'belt.json'), JSON.stringify(belt))
console.log(`wrote ${hopf.fibers.length} fibers and ${belt.frames.length} belt frames to ${out}`)
