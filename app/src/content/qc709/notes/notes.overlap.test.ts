/**
 * Notes-only overlap guard (ruling R2 in docs/roles/decisions/qc709-notes.md; review item B3 and S13 in
 * docs/roles/audits/P-709-notes-pages-review.md). The instructor's notes are copyrighted and this repository is public, so a notes
 * page must restate an idea in its own words, not follow a source sentence with a few words changed. `verbatim.test.ts` allows one
 * shared 8-gram per literal and ignores everything else; that let near-copies such as "complex"/"although" inserts through. This test
 * is stricter and covers only the notes pages (`qc709/notes/N<k>.ts`): for each page it takes every prose string (paragraph text,
 * figure caption and section summary), drops TeX (`$…$`, `$$…$$`), link and gloss markup and emphasis, lower-cases it, keeps the
 * alphabetic words, and FAILS when any run of 7 consecutive words also occurs in `sources/qc709-n*\/text.md` (same normalisation on both
 * sides; a window made only of one-letter tokens is skipped, as in `verbatim.test.ts`, because it is algebra, not prose).
 *
 * Where sources live: `SPINLAB_SOURCES` if set, otherwise the nearest ancestor checkout that has `sources/` (so a worktree under
 * `.claude/worktrees/` finds the main checkout's copy). Absent (CI, a fresh clone) -> the check SKIPS with a printed reason, as
 * `verbatim.test.ts` does. Output names the page, the paragraph id and at most 8 of the shared words, never a longer source excerpt.
 *
 * Each page also prints its longest shared run (any length >= 2), so a pass shows how far from the line the prose is.
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, env, fs, path, walk } from '../../../security/node'
import type { Lecture } from '../../schema'
import { NOTES_CHAPTERS } from './index'

/** The run length that fails: 7 consecutive alphabetic words in common with a notes source. */
export const RUN = 7

/** Alphabetic words of a prose string: TeX, links (`<<id|label>>`), gloss tags (keep the shown words) and emphasis are dropped. */
export function words(text: string): string[] {
  const t = text
    .normalize('NFKC')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]*\$/g, ' ')
    .replace(/<<[^>]*>>/g, ' ')
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, ' $1 ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[*_]/g, ' ')
    .toLowerCase()
  return t.match(/[a-z]+(?:'[a-z]+)?/g) ?? []
}

/** Word n-grams, skipping a window made only of one-letter tokens (algebra symbols collide by chance). */
export function grams(w: string[], n: number): string[] {
  const out: string[] = []
  for (let i = 0; i + n <= w.length; i++) {
    const win = w.slice(i, i + n)
    if (win.every((t) => t.length === 1)) continue
    out.push(win.join(' '))
  }
  return out
}

/** The prose strings of a notes lecture: [where, text] for every section summary, paragraph and figure caption. */
export function proseOf(lecture: Lecture): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = []
  for (const u of lecture.units) {
    if (u.insight) out.push({ where: `${u.id}:summary`, text: u.insight })
    for (const b of u.story ?? []) {
      out.push({ where: b.id, text: b.text })
      if (b.caption) out.push({ where: `${b.id}:caption`, text: b.caption })
    }
  }
  return out
}

/** The longest run (in words, >= 2, 0 when none) that a prose string shares with the source n-gram sets, and one such run. */
export function longestShared(w: string[], srcSets: Map<number, Set<string>>, from = 2, to = 40): { len: number; run: string } {
  let best = { len: 0, run: '' }
  for (let n = from; n <= to; n++) {
    const set = srcSets.get(n)
    if (!set) continue
    const hit = grams(w, n).find((g) => set.has(g))
    if (!hit) break
    best = { len: n, run: hit }
  }
  return best
}

/** Every maximal run of >= RUN consecutive words a prose string shares with the source 7-gram set: [start index, length in words]. */
export function sharedRuns(w: string[], src7: Set<string>): { at: number; len: number }[] {
  const hit: boolean[] = []
  for (let i = 0; i + RUN <= w.length; i++) {
    const win = w.slice(i, i + RUN)
    hit.push(!win.every((t) => t.length === 1) && src7.has(win.join(' ')))
  }
  const runs: { at: number; len: number }[] = []
  for (let i = 0; i < hit.length; i++) {
    if (!hit[i]) continue
    let j = i
    while (j + 1 < hit.length && hit[j + 1]) j++
    runs.push({ at: i, len: j - i + RUN })
    i = j
  }
  return runs
}

function findSources(): { dir: string | null; why: string } {
  const fromEnv = env.SPINLAB_SOURCES
  if (fromEnv !== undefined) return fs.existsSync(fromEnv) ? { dir: fromEnv, why: 'SPINLAB_SOURCES' } : { dir: null, why: `SPINLAB_SOURCES=${JSON.stringify(fromEnv)} does not exist` }
  let d = path.dirname(APP_DIR)
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'sources')) && fs.existsSync(path.join(d, 'pipeline', 'course.config.json'))) return { dir: path.join(d, 'sources'), why: 'nearest checkout with sources/' }
    const up = path.dirname(d)
    if (up === d) break
    d = up
  }
  return { dir: null, why: 'no sources/ folder in this checkout or any ancestor checkout' }
}

describe('notes overlap guard: normalisation (always on)', () => {
  it('drops TeX, links, emphasis and keeps the words of a gloss tag, lower-cased', () => {
    expect(words('The **State** $|\\psi\\rangle$ is a [[qc-mixture|mixture]] (see <<qc-q8-pure-rho|Unit 8.2>>) and $$x^2$$ it’s.')).toEqual(['the', 'state', 'is', 'a', 'mixture', 'see', 'and', "it's"])
  })
  it('skips windows made only of one-letter tokens', () => {
    expect(grams(words('a b c d e f g h'), 7)).toEqual([])
    expect(grams(words('the state a b c d e'), 7)).toEqual(['the state a b c d e'])
  })
  it('reads the prose of every notes lecture', () => {
    expect(NOTES_CHAPTERS.length).toBeGreaterThanOrEqual(11)
    for (const l of NOTES_CHAPTERS) expect(proseOf(l).length).toBeGreaterThan(3)
  })
})

const { dir: SOURCES, why } = findSources()
const SOURCE_FILES = SOURCES
  ? walk(SOURCES, (f) => /[/\\]qc709-n\d+[/\\]text\.md$/i.test(f)).sort()
  : []
if (!SOURCES || SOURCE_FILES.length === 0) console.log(`sources/qc709-n* absent, notes overlap check skipped (${why})`)

describe.skipIf(!SOURCES || SOURCE_FILES.length === 0)('notes overlap guard vs sources/qc709-n*/text.md', () => {
  const srcSets = new Map<number, Set<string>>()
  const srcWords: string[] = []
  for (const f of SOURCE_FILES) srcWords.push(...words(fs.readFileSync(f, 'utf8')))
  // lazily widen the n-gram sets only as far as a page needs (the longest run is reported up to 40 words)
  for (let n = 2; n <= 40; n++) srcSets.set(n, new Set(grams(srcWords, n)))

  it('reads the eleven notes sources', () => {
    expect(SOURCE_FILES.length).toBe(11)
    expect(srcWords.length).toBeGreaterThan(10_000)
  })

  it('self-check: a copied source run IS caught (and only 8 words are reported)', () => {
    const run = srcWords.slice(Math.floor(srcWords.length / 2), Math.floor(srcWords.length / 2) + 10)
    const r = longestShared(words(`In our own words we say that ${run.join(' ')} and then move on.`), srcSets)
    expect(r.len).toBeGreaterThanOrEqual(RUN)
    // a text that shares only scattered words is clean
    expect(sharedRuns(words(`Fresh ${run.join(' ')} words`), srcSets.get(RUN)!).length).toBeGreaterThan(0)
    expect(longestShared(words('Quantum spin lab pages restate ideas in fresh sentences.'), srcSets).len).toBeLessThan(RUN)
  })

  for (const lecture of NOTES_CHAPTERS) {
    it(`${lecture.id}: no run of ${RUN} words shared with the notes sources`, () => {
      const offenders: string[] = []
      let longest = { len: 0, where: '' }
      for (const p of proseOf(lecture)) {
        const w = words(p.text)
        const r = longestShared(w, srcSets)
        if (r.len > longest.len) longest = { len: r.len, where: p.where }
        for (const run of sharedRuns(w, srcSets.get(RUN)!)) offenders.push(`${p.where}: ${run.len} shared words, starting "${w.slice(run.at, run.at + 8).join(' ')}"`)
      }
      console.log(`notes overlap ${lecture.id}: longest shared run ${longest.len} words${longest.len ? ` (${longest.where})` : ''}`)
      expect(offenders).toEqual([])
    })
  }
})
