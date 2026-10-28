/**
 * The 709 Optics Lab pages: the second notes collection, served by the same page code as the lecture notes (pages/NotesPages.tsx), server-rendered
 * like NotesPages.test.tsx:
 *   - the index (`#/709/optics`, "Optics Lab — cooling and trapping atoms"): one row per built page with its book chapter, printed pages,
 *     the chapters it feeds and its topics, no class date, its sections as links; the notes index lists none of them and keeps its own look;
 *   - an optics page: the same markup as a lecture (section ids, `data-beat`, bridge chips, no canvas), the Optics Lab's own words, and ONE
 *     paragraph widget drawn in place from a chunk that loaded before the page rendered (no placeholder);
 *   - the routes: an unknown or foreign id answers in the collection's own words; `L<k>` redirects only on the notes route.
 */
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import '../content/qc709/pack' // the 709 glossary, bridges and fidelity notes, as the page's pack load registers them
import '../stage/svg/kinds' // the SVG stage kinds, as a page whose lecture draws them has loaded
import { loadLecture } from '../content/load'
import { NOTES_CHAPTERS } from '../content/qc709/notes/index'
import { OPTICS_CHAPTERS } from '../content/qc709/optics/index'
import { NOTES_META, OPTICS_META } from '../content/qc709/registry' // registers both listings, the reverse indexes and the generated bridges
import { loadWidgets } from '../widgets/registry'
import Notes709, { NotesBody, NotesIndex, feedsOf, sectionBridgeIds, widgetKindsOf } from './NotesPages'

// the page waits for the course pack in the browser; here the pack module is imported above, so the hook says ready
vi.mock('./useQcPack', () => ({ useQcPack: () => ['ready', () => {}] }))

const strip = (html: string) => html.replace(/<!-- -->/g, '')
const page = OPTICS_CHAPTERS[0]
const lecture = NOTES_CHAPTERS[0]

beforeAll(async () => {
  await Promise.all([...NOTES_CHAPTERS, ...OPTICS_CHAPTERS].map((l) => loadLecture(l.id)))
  await loadWidgets(['optics-bench']) // the page loads its paragraph widgets before it renders; SSR then draws the real widget, not the placeholder
}, 60_000)

describe('the Optics Lab index', () => {
  const html = strip(renderToString(<MemoryRouter initialEntries={['/709/optics']}><NotesIndex collection="optics" /></MemoryRouter>))
  it('is headed "Optics Lab — cooling and trapping atoms" and lists every built page: name, book chapter, printed pages, the chapters it feeds, its topics', () => {
    expect(html).toContain('Optics Lab — cooling and trapping atoms')
    expect(OPTICS_META.length).toBeGreaterThan(0)
    for (const m of OPTICS_META) {
      expect(html).toContain(`data-notes="${m.id}"`)
      expect(html).toContain(`Optics Lab ${m.id}`)
      expect(html).toContain(m.title)
      expect(html).toContain(`${m.book} · ${m.pages}`)
      expect(html).toContain(`feeds ${feedsOf(m).join(', ')}`)
      for (const t of m.topics) expect(html).toContain(t)
      for (const u of m.units) {
        expect(html).toContain(`href="/709/optics/${m.id}#${u.id}"`)
        expect(html).toContain(u.pages)
      }
      expect(html).toContain(`href="/709/optics/${m.id}"`)
    }
    expect(html).toContain('data-collection="optics"')
    expect(html).toContain('More pages arrive as the lab is built.')
  })
  it('lists no lecture note and no class date; the notes index lists no optics page and keeps its own heading', () => {
    for (const m of NOTES_META) expect(html.includes(`data-notes="${m.id}"`), m.id).toBe(false)
    expect(html).not.toMatch(/\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20\d\d/)
    const notes = strip(renderToString(<MemoryRouter initialEntries={['/709/notes']}><NotesIndex /></MemoryRouter>))
    for (const m of OPTICS_META) expect(notes.includes(`data-notes="${m.id}"`), m.id).toBe(false)
    expect(notes).not.toContain('data-collection')
    expect(notes).toContain('<h1>Lecture notes</h1>')
    expect(notes).toContain('Later lectures arrive after each class.')
  })
  it('reads the light registry only: it holds no paragraph text', () => {
    for (const l of OPTICS_CHAPTERS) for (const u of l.units) for (const b of u.story ?? []) expect(html.includes(b.text.slice(0, 40)), b.id).toBe(false)
  })
})

describe('an optics page', () => {
  // rendered after the widget chunk has loaded (the file-level beforeAll), as the page itself waits for it
  let html = ''
  beforeAll(() => {
    html = strip(renderToString(<MemoryRouter initialEntries={[`/709/optics/${page.id}`]}><NotesBody lecture={page} /></MemoryRouter>))
  })
  it('names the page, its book chapter and printed pages, lists its topics, and links the Optics Lab (not the notes)', () => {
    const meta = OPTICS_META.find((m) => m.id === page.id)!
    expect(html).toContain(`data-notes="${page.id}"`)
    expect(html).toContain('data-collection="optics"')
    expect(html).toContain(page.title)
    expect(html).toContain(`${meta.book} · ${meta.pages}`)
    expect(html).toContain(`Optics Lab ${page.id}`)
    for (const o of page.outcomes) expect(html).toContain(o)
    expect(html).toContain('href="/709/optics"')
    expect(html).not.toContain('href="/709/notes"')
    expect(html).toContain('aria-label="Optics Lab"') // the pager
    expect(html).toContain('All optics pages')
    expect(html).not.toContain('of the notes') // the notes' own fact line
  })
  it('every section has its id, its labelled heading with the printed pages, and every paragraph is a data-beat; bridges lead into chapters', () => {
    for (const u of page.units) {
      expect(html).toContain(`<section id="${u.id}" class="notes-section" aria-labelledby="${u.id}-title">`)
      expect(html).toContain(`id="${u.id}-title"`)
      expect(html).toContain(u.lecture.pages)
      for (const b of u.story ?? []) expect(html).toContain(`class="notes-beat" id="${b.id}" data-beat="${b.id}"`)
      const ids = sectionBridgeIds(u)
      expect(ids.length, u.id).toBeGreaterThan(0)
      for (const id of ids) expect(html).toContain(`data-bridge="${id}"`)
    }
  })
  it('draws a paragraph widget in place, once, under its paragraph; the page creates no canvas', () => {
    const beats = page.units.flatMap((u) => u.story ?? []).filter((b) => b.widget)
    expect(beats.length).toBeGreaterThan(0)
    expect(widgetKindsOf(page)).toEqual(['optics-bench'])
    expect((html.match(/class="notes-widget"/g) ?? []).length).toBe(beats.length)
    expect(html).toContain('data-widget="optics-bench"')
    // O1 (the content page) opens with the `slower-force` bench and later draws `zeeman-slower`; the demo `lorentzian` is no longer on a page
    expect(html).toContain('data-optics-preset="slower-force"')
    expect(html).toContain('data-optics-preset="zeeman-slower"')
    expect(html).toMatch(/<svg class="ob-plot"[^>]*role="img"/)
    expect(html).not.toContain('data-widget-loading') // loaded before the page renders: no placeholder
    // each widget sits after its own paragraph (a page may carry several widgets: the k-th beat precedes the k-th widget)
    const at = [...html.matchAll(/class="notes-widget"/g)].map((m) => m.index as number)
    beats.forEach((b, k) => expect(html.indexOf(`id="${b.id}"`), b.id).toBeLessThan(at[k]))
    expect(html.includes('<canvas')).toBe(false)
  })
  it('a notes lecture draws no widget: nothing of the widget machinery without one', () => {
    const notes = strip(renderToString(<MemoryRouter initialEntries={[`/709/notes/${lecture.id}`]}><NotesBody lecture={lecture} /></MemoryRouter>))
    expect(notes).not.toContain('notes-widget')
    expect(notes).not.toContain('data-collection')
    expect(widgetKindsOf(lecture)).toEqual([])
    expect(widgetKindsOf(undefined)).toEqual([])
  })
})

describe('the routes of both collections', () => {
  const at = (path: string) =>
    strip(
      renderToString(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/709/notes/:id?" element={<Notes709 />} />
            <Route path="/709/optics/:id?" element={<Notes709 />} />
          </Routes>
        </MemoryRouter>,
      ),
    )
  it('/709/optics is the optics index and /709/notes the notes index', () => {
    expect(at('/709/optics')).toContain('Optics Lab — cooling and trapping atoms')
    expect(at('/709/notes')).toContain('<h1>Lecture notes</h1>')
  })
  it('an unknown or foreign id answers in the collection’s own words and links back to its index', () => {
    const html = at('/709/optics/O99')
    expect(html).toContain('No optics page called “O99”')
    expect(html).toContain('href="/709/optics"')
    expect(at('/709/optics/N1')).toContain('No optics page called “N1”') // a lecture note is not an optics page
    expect(at('/709/optics/Q1')).toContain('No optics page called “Q1”')
    expect(at('/709/optics/L1')).toContain('No optics page called “L1”') // L<k> redirects only on the notes route
    expect(at('/709/notes/O1')).toContain('No lecture notes called “O1”') // and an optics page is not a lecture note
    expect(at(`/709/optics/${'x'.repeat(200)}`)).toContain(`“${'x'.repeat(40)}”`)
    expect(at('/709/optics/%3Cscript%3Ealert(1)%3C%2Fscript%3E').includes('<script>')).toBe(false)
  })
})
