/**
 * The widget registry is lazy (build/chunks.test.ts rule (p)): a widget that has not loaded shows a placeholder of about its
 * own height inside the same Suspense; every kind has a loader and a placeholder size; a kind that has loaded renders directly.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LECTURES } from '../content/index'
import { QC_CHAPTERS } from '../content/qc709/index'
import type { Lecture, WidgetKind } from '../content/schema'
import { lectureWidgetKinds } from '../stage/lectureWidgets'
import { Widget, WidgetPlaceholder, widgetKinds, widgetsLoaded } from './registry'

// every kind in the schema's union (the Records in registry.tsx are typed by it, so tsc already refuses a missing one)
const KINDS: WidgetKind[] = [
  'sg-lab', 'complex-plane', 'real-vs-complex', 'amplitude-bars', 'projector', 'operator-action', 'operator-builder', 'basis-translator', 'bloch', 'phase-dial',
  'deposit-stats', 'logic-order', 'pair-grid', 'polarization-dial', 'bb84-bench', 'two-spin', 'ghz-game', 'two-clocks', 'bit-table', 'oracle-bench',
]

describe('widgets/registry', () => {
  it('knows every widget kind of the schema', () => {
    expect([...widgetKinds].sort()).toEqual([...KINDS].sort())
  })

  it('the placeholder is a div.widget.widget-loading that reserves the widget’s height at a wide window and at a phone', () => {
    for (const kind of KINDS) {
      const html = renderToString(<WidgetPlaceholder kind={kind} />)
      expect(html, kind).toContain('class="widget widget-loading"')
      expect(html, kind).toContain(`data-widget-loading="${kind}"`)
      const wide = Number(/--wph:(\d+)px/.exec(html)?.[1])
      const narrow = Number(/--wph-narrow:(\d+)px/.exec(html)?.[1])
      expect(wide, `${kind} wide`).toBeGreaterThanOrEqual(200)
      expect(wide, `${kind} wide`).toBeLessThanOrEqual(1100)
      expect(narrow, `${kind} narrow`).toBeGreaterThanOrEqual(300)
      expect(narrow, `${kind} narrow`).toBeLessThanOrEqual(1500)
    }
  })

  it('the placeholder keeps the loading line each kind had before the registry was lazy', () => {
    expect(renderToString(<WidgetPlaceholder kind="bloch" />)).toContain('Loading the 3D view…')
    expect(renderToString(<WidgetPlaceholder kind="oracle-bench" />)).toContain('Loading the picture…')
    expect(renderToString(<WidgetPlaceholder kind="sg-lab" />)).toContain('Loading the table…')
  })

  it('the lecture page waits for the widgets a lecture shows, except the Bloch sphere (it brings three.js)', () => {
    const chapters: Lecture[] = [...LECTURES, ...QC_CHAPTERS]
    expect(chapters.length).toBeGreaterThanOrEqual(30)
    expect(lectureWidgetKinds(undefined)).toEqual([])
    const all = new Set<WidgetKind>()
    for (const l of chapters) {
      const kinds = lectureWidgetKinds(l)
      expect(new Set(kinds).size, `${l.id} lists each kind once`).toBe(kinds.length)
      expect(kinds, `${l.id} never waits for the Bloch sphere`).not.toContain('bloch')
      for (const u of l.units) {
        // each unit's Try-it is awaited (the one lazy exception aside)
        if (u.visual.kind !== 'bloch') expect(kinds, `${l.id}/${u.id}`).toContain(u.visual.kind)
        for (const c of u.clues) if (c.show && c.show.kind !== 'bloch') expect(kinds, `${l.id}/${u.id} clue`).toContain(c.show.kind)
        for (const c of u.play) {
          if (c.widget && c.widget.kind !== 'bloch') expect(kinds, `${l.id}/${c.id} widget`).toContain(c.widget.kind)
          for (const w of c.walkthrough) if (w.show && w.show.kind !== 'bloch') expect(kinds, `${l.id}/${c.id} walkthrough`).toContain(w.show.kind)
        }
      }
      for (const k of kinds) all.add(k)
    }
    // sanity: the course uses most kinds, so the checks above measured something
    expect(all.size).toBeGreaterThanOrEqual(15)
    expect(widgetsLoaded([...all])).toBe(false) // nothing has been fetched in this test file
    expect(widgetsLoaded([])).toBe(true)
  })

  it('a widget whose chunk has not arrived renders the placeholder, not nothing', () => {
    const html = renderToString(<Widget spec={{ kind: 'amplitude-bars', props: {} }} />)
    expect(html).toContain('widget-loading')
    expect(html).toContain('data-widget-loading="amplitude-bars"')
  })
})
