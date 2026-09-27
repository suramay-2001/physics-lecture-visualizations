/**
 * The Concept map (Phase 4a item 6, D-nav-story §3.3): the course as beamlines. Each lecture is a row, its concepts
 * are stations on that row's line; built concepts link into their chapter, planned ones say "in preparation".
 * Focus or hover a station: silver lines are drawn from what it builds on (solid) and to what builds on it
 * (dashed), and the same relations are said in words (polite live region) — the picture is never the only channel.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LECTURES } from '../content'
import { COURSE_LECTURES, CONCEPTS, conceptById, leadsTo, type Concept } from '../content/concepts'

interface Edge {
  d: string
  kind: 'needs' | 'leads'
}

export function MapPage() {
  const root = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [edges, setEdges] = useState<Edge[]>([])
  const built = new Set(LECTURES.map((l) => l.id))

  const draw = useCallback(() => {
    const el = root.current
    if (!el || !focus) return setEdges([])
    const box = el.getBoundingClientRect()
    const at = (id: string) => {
      const r = el.querySelector<HTMLElement>(`[data-concept="${id}"]`)?.getBoundingClientRect()
      return r ? { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, h: r.height } : null
    }
    const me = at(focus)
    if (!me) return setEdges([])
    const curve = (a: { x: number; y: number; h: number }, b: { x: number; y: number; h: number }) => {
      const dy = b.y - a.y
      // stations on the same line: an arc under the row, so the line never crosses the stations between them
      if (Math.abs(dy) < a.h / 2) {
        const y0 = a.y + a.h / 2
        const y1 = b.y + b.h / 2
        const dip = 26 + Math.min(40, Math.abs(b.x - a.x) * 0.08)
        return `M${a.x.toFixed(1)},${y0.toFixed(1)} C${a.x.toFixed(1)},${(y0 + dip).toFixed(1)} ${b.x.toFixed(1)},${(y1 + dip).toFixed(1)} ${b.x.toFixed(1)},${y1.toFixed(1)}`
      }
      const bend = Math.max(30, Math.abs(dy) * 0.45)
      return `M${a.x.toFixed(1)},${(a.y + (dy > 0 ? a.h / 2 : -a.h / 2)).toFixed(1)} C${a.x.toFixed(1)},${(a.y + Math.sign(dy || 1) * bend).toFixed(1)} ${b.x.toFixed(1)},${(b.y - Math.sign(dy || 1) * bend).toFixed(1)} ${b.x.toFixed(1)},${(b.y + (dy > 0 ? -b.h / 2 : b.h / 2)).toFixed(1)}`
    }
    const c = conceptById(focus)!
    const out: Edge[] = []
    for (const n of c.needs) {
      const p = at(n)
      if (p) out.push({ d: curve(p, me), kind: 'needs' })
    }
    for (const n of leadsTo(focus)) {
      const p = at(n.id)
      if (p) out.push({ d: curve(me, p), kind: 'leads' })
    }
    setEdges(out)
  }, [focus])

  useLayoutEffect(draw, [draw])
  useEffect(() => {
    addEventListener('resize', draw)
    return () => removeEventListener('resize', draw)
  }, [draw])

  const f = focus ? conceptById(focus) : undefined
  const say = f
    ? `${f.label}. Builds on: ${f.needs.map((n) => conceptById(n)!.label).join('; ') || 'nothing earlier'}. Leads to: ${leadsTo(f.id).map((n) => n.label).join('; ') || 'nothing yet'}.`
    : ''

  const station = (c: Concept) => {
    const props = {
      'data-concept': c.id,
      'data-rel': !focus ? undefined : c.id === focus ? 'focus' : f?.needs.includes(c.id) ? 'needs' : leadsTo(focus).some((n) => n.id === c.id) ? 'leads' : 'other',
      onMouseEnter: () => setFocus(c.id),
      onFocus: () => setFocus(c.id),
      className: 'map-station',
    }
    return c.unit && built.has(c.lecture) ? (
      <Link {...props} to={`/lecture/${c.lecture}#${c.unit}`}>
        {c.label}
      </Link>
    ) : (
      <span {...props} tabIndex={0} aria-label={`${c.label} (in preparation)`}>
        {c.label}
      </span>
    )
  }

  return (
    <div className="page map-page">
      <p className="eyebrow">Concept map</p>
      <h1>Concept map</h1>
      <p className="section-lede">
        The course as beamlines: each lecture a line, each idea a station. Hover or focus a station to see what it builds on (solid) and what builds on it (dashed).
        {COURSE_LECTURES.some((l) => !built.has(l.id)) && ' Dashed stations belong to lectures still in preparation.'}
      </p>
      <div ref={root} className="map" onMouseLeave={() => setFocus(null)}>
        <svg className="map-edges" aria-hidden="true">
          {edges.map((e, i) => (
            <path key={i} d={e.d} data-kind={e.kind} />
          ))}
        </svg>
        <ol className="map-lines">
          {COURSE_LECTURES.map((l) => (
            <li key={l.id} id={`map-${l.id}`} className="map-line" data-built={built.has(l.id)}>
              <div className="map-lecture">
                <span className="map-num">{l.number}</span>
                <span className="map-title">
                  {built.has(l.id) ? <Link to={`/lecture/${l.id}`}>{l.title}</Link> : l.title}
                  {!built.has(l.id) && <span className="map-prep"> · in preparation</span>}
                </span>
              </div>
              <ol className="map-stations">
                {CONCEPTS.filter((c) => c.lecture === l.id).map((c) => (
                  <li key={c.id}>{station(c)}</li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
      <p className="map-say" aria-live="polite">
        {say}
      </p>
    </div>
  )
}
