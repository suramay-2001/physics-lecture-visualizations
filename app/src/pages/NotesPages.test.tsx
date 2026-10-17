/**
 * The 709 lecture-notes pages (pages/NotesPages.tsx; docs/roles/proposals/W-709-notes.md §6), server-rendered like Pages709.test.tsx:
 *   - the index: one row per built lecture with its date, printed pages, topics and the chapters it feeds, and its sections as links;
 *   - the lecture markup: section ids and `-title` ids (the return bar needs them), paragraphs as `data-beat` (the reading position needs
 *     it), a numbered figure drawn as SVG with `role="img"` and NO canvas, bridge chips into the chapters, the print footnotes, the figure count;
 *   - an unknown id answers in words, and `L<k>` is the owner's spelling of `N<k>` (it redirects).
 */
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import '../content/qc709/pack' // the 709 glossary, bridges and fidelity notes, as the page's pack load registers them
import '../stage/svg/kinds' // the SVG stage kinds, as a page whose lecture draws them has loaded
import { loadLecture } from '../content/load'
import { NOTES_CHAPTERS } from '../content/qc709/notes/index'
import { NOTES_META } from '../content/qc709/registry' // registers the notes listing, the reverse index and the generated bridges
import Notes709, { NotesBody, NotesIndex, feedsOf, figureKinds, fmtDate, notesFigureNumbers, sectionBridgeIds } from './NotesPages'

// the page waits for the course pack in the browser; here the pack module is imported above, so the hook says ready
vi.mock('./useQcPack', () => ({ useQcPack: () => ['ready', () => {}] }))

const first = NOTES_CHAPTERS[0]
const strip = (html: string) => html.replace(/<!-- -->/g, '')

beforeAll(async () => {
  await Promise.all(NOTES_CHAPTERS.map((l) => loadLecture(l.id)))
}, 60_000)

describe('the index', () => {
  const html = strip(renderToString(<MemoryRouter initialEntries={['/709/notes']}><NotesIndex /></MemoryRouter>))
  it('lists every built lecture: name, date, printed pages, the chapters it feeds, its topics', () => {
    expect(NOTES_META.length).toBeGreaterThan(0)
    for (const m of NOTES_META) {
      expect(html).toContain(`data-notes="${m.id}"`)
      expect(html).toContain(`Lecture ${m.number} notes`)
      expect(html).toContain(m.title)
      expect(html).toContain(fmtDate(m.date))
      expect(html).toContain(m.pages)
      for (const c of feedsOf(m)) expect(html).toContain(c)
      expect(html).toContain(`feeds ${feedsOf(m).join(', ')}`)
      for (const t of m.topics) expect(html).toContain(t)
      // and each section is a link into the lecture page at its anchor
      for (const u of m.units) {
        expect(html).toContain(`href="/709/notes/${m.id}#${u.id}"`)
        expect(html).toContain(u.pages)
      }
      expect(html).toContain(`href="/709/notes/${m.id}"`)
    }
    expect(html).toContain('Later lectures arrive after each class.')
  })
  it('reads the light registry only: it holds no paragraph text', () => {
    for (const l of NOTES_CHAPTERS) for (const u of l.units) for (const b of u.story ?? []) expect(html.includes(b.text.slice(0, 40)), b.id).toBe(false)
  })
})

describe('a lecture page', () => {
  const html = strip(renderToString(<MemoryRouter initialEntries={[`/709/notes/${first.id}`]}><NotesBody lecture={first} /></MemoryRouter>))
  it('names the lecture, its date and printed pages, and lists its topics', () => {
    expect(html).toContain(`data-notes="${first.id}"`)
    expect(html).toContain(first.title)
    expect(html).toContain(fmtDate(first.date!))
    expect(html).toContain(NOTES_META.find((m) => m.id === first.id)!.pages)
    for (const o of first.outcomes) expect(html).toContain(o)
  })
  it('every section has its id, its labelled heading with the printed pages, and every paragraph is a data-beat', () => {
    for (const u of first.units) {
      expect(html).toContain(`<section id="${u.id}" class="notes-section" aria-labelledby="${u.id}-title">`)
      expect(html).toContain(`id="${u.id}-title"`)
      expect(html).toContain(u.title.split(' ')[0]) // the notes' own marker, verbatim
      expect(html).toContain(u.lecture.pages)
      for (const b of u.story ?? []) {
        expect(html).toContain(`class="notes-beat" id="${b.id}" data-beat="${b.id}"`)
      }
    }
  })
  it('draws a figure as SVG with role="img" and a numbered caption, and creates no canvas', () => {
    const numbers = notesFigureNumbers(first)
    expect(numbers.size).toBeGreaterThan(0)
    expect(html).toContain(`data-figures="${numbers.size}"`)
    for (const [beat, n] of numbers) {
      expect(html).toContain(`data-figure="${n}"`)
      expect(html).toContain(`Fig. ${n}`)
      expect(beat.startsWith('n')).toBe(true)
    }
    expect(html).toContain('class="svg-still"')
    expect(html).toMatch(/<svg[^>]*role="img"/)
    expect(html.includes('<canvas')).toBe(false)
    // the print figure rides beside it, one per figure
    expect(html.match(/class="print-figure"/g)).toHaveLength(numbers.size)
    expect(figureKinds(first)).toEqual(['amplitudes'])
  })
  it('the prose links into the chapters: bridge chips, a "Learn it in the chapter" row, and numbered print footnotes', () => {
    for (const u of first.units) {
      const ids = sectionBridgeIds(u)
      expect(ids.length, u.id).toBeGreaterThan(0)
      for (const id of ids) expect(html).toContain(`data-bridge="${id}"`)
    }
    expect(html).toContain('Learn it in the chapter')
    expect(html).toContain('aria-label="Bridges in this section"')
    expect(html).toContain('class="print-fn"')
  })
  it('renders no KaTeX error, no raw TeX source and no Formal-track furniture (one voice)', () => {
    expect(html.includes('katex-error')).toBe(false)
    expect(html.includes('tex-user-error')).toBe(false)
    // (KaTeX keeps each formula's source in an <annotation> for assistive technology: that is not raw TeX on the page)
    expect(html.replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/g, '').includes('\\tfrac')).toBe(false)
    expect(html.includes('track-toggle')).toBe(false)
    expect(html.includes('static-beat')).toBe(false)
  })
  it('ends with the notation slot and a pager that links the index', () => {
    expect(html).toContain('class="notation-key-slot"')
    expect(html).toContain('aria-label="Lecture notes"')
    expect(html).toContain('href="/709/notes"')
  })
})

describe('the route', () => {
  const at = (path: string) =>
    strip(
      renderToString(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/709/notes/:id?" element={<Notes709 />} />
          </Routes>
        </MemoryRouter>,
      ),
    )
  it('an unknown lecture answers in words and links back to the index', () => {
    const html = at('/709/notes/N99')
    expect(html).toContain('No lecture notes called “N99”')
    expect(html).toContain('href="/709/notes"')
    expect(at('/709/notes/Q1')).toContain('No lecture notes called “Q1”')
    expect(at(`/709/notes/${'x'.repeat(200)}`)).toContain(`“${'x'.repeat(40)}”`) // the echoed id is cut
  })
  it('a hostile id is only text', () => {
    const html = at('/709/notes/%3Cscript%3Ealert(1)%3C%2Fscript%3E')
    expect(html.includes('<script>')).toBe(false)
  })
})

describe('helpers', () => {
  it('fmtDate uses fixed words', () => {
    expect(fmtDate('2026-09-02')).toBe('2 Sep 2026')
    expect(fmtDate('2026-10-31')).toBe('31 Oct 2026')
    expect(fmtDate('nonsense')).toBe('nonsense')
  })
  it('figure numbers run N<k>.1, N<k>.2 over the paragraphs that have a figure, in the lecture order', () => {
    const numbers = notesFigureNumbers(first)
    expect([...numbers.values()]).toEqual(Array.from({ length: numbers.size }, (_, i) => `${first.id}.${i + 1}`))
    for (const [beat] of numbers) expect(first.units.flatMap((u) => u.story ?? []).find((b) => b.id === beat)!.caption).toBeDefined()
  })
})
