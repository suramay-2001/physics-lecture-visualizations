/**
 * The 709 Formulas and Help pages, on the real chapter data (all twenty written chapters):
 *  - the boards: every chapter has a section, every line links to a beat or review card that exists, and the track
 *    changes what the page shows;
 *  - the Help page lists every challenge, grouped by chapter;
 *  - the homework guard: a challenge marked `assigned` opens to its three hints and never to a walkthrough, even if
 *    its data carried steps (the row in pages/Reading709.tsx decides).
 */
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { loadLecture, loadQcPack } from '../content/load'
import { boardFor } from '../content/qc709/boards'
import { QC_CHAPTERS } from '../content/qc709/index'
import type { Challenge } from '../content/schema'
import { placeFromSearch } from '../stage/readingPosition'
import { Formulas709, Help709, HelpChallenge709 as HelpChallenge } from './Reading709'

// the page waits for the course pack in the browser; here the pack is loaded in beforeAll, so the hook says ready
vi.mock('./useQcPack', () => ({ useQcPack: () => ['ready', () => {}] }))

beforeAll(async () => {
  await loadQcPack()
  await Promise.all(QC_CHAPTERS.map((l) => loadLecture(l.id)))
  // the walkthrough component is a lazy import: render a row once to start it, then let it arrive (a later render shows it)
  const first = challenges.find((x) => !x.c.assigned)!
  row(first.c, first.chapter)
  await new Promise((resolve) => setTimeout(resolve, 200))
}, 120_000)

const at = (path: string) =>
  renderToString(<MemoryRouter initialEntries={[path]}>{path.includes('help') ? <Help709 /> : <Formulas709 />}</MemoryRouter>).replace(/<!-- -->/g, '')
const challenges = QC_CHAPTERS.flatMap((l) => l.units.flatMap((u) => u.play.map((c) => ({ chapter: l.id, unit: u, c }))))
const row = (c: Challenge, chapter = 'F1') =>
  renderToString(
    <MemoryRouter>
      <ul>
        <HelpChallenge c={c} chapter={chapter} unit={{ id: 'f1-x', title: 'A unit' }} open onToggle={() => {}} />
      </ul>
    </MemoryRouter>,
  )

describe('709 boards', () => {
  it('every written chapter has a board in both tracks, each line pointing at a beat or review card that exists', () => {
    expect(QC_CHAPTERS.length).toBeGreaterThanOrEqual(20)
    for (const l of QC_CHAPTERS)
      for (const track of ['ground', 'formal'] as const) {
        const board = boardFor(l, track)
        expect(board.length, `${l.id} ${track}`).toBeGreaterThan(0)
        for (const u of board)
          for (const line of u.lines) {
            expect(line.tex.trim(), `${u.id}`).not.toBe('')
            if (line.kind === 'review') continue
            expect(placeFromSearch(`?at=${line.beat}`, l.units.map((x) => x.id)), `${l.id}: ${line.beat}`).not.toBeNull()
            expect(line.steps, `${line.beat}`).toBeGreaterThan(0)
          }
      }
  })

  it('the page lists every chapter and every board line, and the track changes what it shows', () => {
    const ground = at('/709/formulas')
    const formal = at('/709/formulas?track=formal')
    for (const l of QC_CHAPTERS) expect(ground, l.id).toContain(`id="formulas-${l.id}"`)
    const lines = (html: string) => html.match(/class="formula-line"/g)?.length ?? 0
    const expected = (track: 'ground' | 'formal') => QC_CHAPTERS.reduce((n, l) => n + boardFor(l, track).reduce((m, u) => m + u.lines.length, 0), 0)
    expect(lines(ground)).toBe(expected('ground'))
    expect(lines(formal)).toBe(expected('formal'))
    expect(ground).toContain('Showing the Ground-up track')
    expect(formal).toContain('Showing the Formal track')
    expect(ground).toContain('data-track="ground"')
    expect(formal).toContain('data-track="formal"')
    expect(ground).toContain('?at=')
    // the track's own review lines and derivation lengths: some board line differs between the tracks
    const board = (track: 'ground' | 'formal') => JSON.stringify(QC_CHAPTERS.map((l) => boardFor(l, track)))
    expect(board('ground')).not.toBe(board('formal'))
  })
})

describe('709 help', () => {
  it('lists every challenge of every chapter, grouped by chapter, closed until opened', () => {
    const html = at('/709/help')
    for (const l of QC_CHAPTERS) expect(html, l.id).toContain(`id="help-${l.id}"`)
    expect(html.match(/class="help-toggle"/g)?.length).toBe(challenges.length)
    expect(html).not.toContain('class="help-body"')
  })

  it('assigned homework opens to its three hints only, never a walkthrough, even if the data carried steps', () => {
    const assigned = challenges.filter((x) => x.c.assigned)
    expect(assigned.length, 'the 709 data has an assigned challenge to test').toBeGreaterThan(0)
    for (const { chapter, c } of assigned) {
      for (const probe of [c, { ...c, walkthrough: [{ text: 'POISON-WALKTHROUGH-STEP' }] } as Challenge]) {
        const html = row(probe, chapter)
        expect(html, c.id).toContain('assigned-note')
        expect(html, c.id).not.toContain('class="walkthrough"')
        expect(html, c.id).not.toContain('POISON-WALKTHROUGH-STEP')
        expect(html.match(/<li>/g)?.length, `${c.id}: three hints (plus the row itself)`).toBe(4)
      }
    }
  })

  it('a challenge that is not assigned opens to its walkthrough', () => {
    const plain = challenges.find((x) => !x.c.assigned && x.c.walkthrough.length > 0 && x.c.walkthrough.every((s) => !s.show))!
    const html = row(plain.c, plain.chapter)
    expect(html).toContain('class="walkthrough"')
    expect(html).not.toContain('assigned-note')
  })
})
