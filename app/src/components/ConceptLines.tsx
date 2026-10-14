/**
 * The concept-map picture (Phase 4a item 6, D-nav-story §3.3), shared by Spin Lab's Concept map (pages/MapPage.tsx) and the
 * Papers section's prerequisite maps (pages/PapersPages.tsx, rulings papers.md R2): lines (a lecture, or a chapter that
 * teaches an idea) carrying stations (ideas). A station that has a teaching unit links into it; one that does not is said to
 * be "in preparation". Focus or hover a station: silver lines are drawn from what it builds on (solid) and to what builds on
 * it (dashed), and the same relations are said in words (polite live region) — the picture is never the only channel.
 * Lazy: only those two pages import it.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface ConceptLine {
  id: string
  /** The line's element id (its anchor: `map-L2`). */
  anchor: string
  /** The short number at the start of the line ("2", "Q6"). */
  num: string
  title: ReactNode
  /** The chapter is written (its title links when `to` is set); otherwise the line says "in preparation". */
  built: boolean
  to?: string
}

export interface ConceptStation {
  id: string
  line: string
  label: string
  /** The teaching unit's in-app path; without one the station is "in preparation". */
  to?: string
  /** Ids of the stations it builds on. */
  needs: readonly string[]
}

interface Edge {
  d: string
  kind: 'needs' | 'leads'
}

export function ConceptLines({ lines, stations }: { lines: readonly ConceptLine[]; stations: readonly ConceptStation[] }) {
  const root = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [edges, setEdges] = useState<Edge[]>([])
  const byId = useMemo(() => new Map(stations.map((s) => [s.id, s])), [stations])
  const leadsTo = useCallback((id: string) => stations.filter((s) => s.needs.includes(id)), [stations])

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
    const c = byId.get(focus)
    if (!c) return setEdges([])
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
  }, [focus, byId, leadsTo])

  useLayoutEffect(draw, [draw])
  useEffect(() => {
    addEventListener('resize', draw)
    return () => removeEventListener('resize', draw)
  }, [draw])

  const f = focus ? byId.get(focus) : undefined
  const label = (id: string) => byId.get(id)?.label ?? id
  const say = f
    ? `${f.label}. Builds on: ${f.needs.map(label).join('; ') || 'nothing earlier'}. Leads to: ${leadsTo(f.id).map((n) => n.label).join('; ') || 'nothing yet'}.`
    : ''

  const station = (c: ConceptStation) => {
    const props = {
      'data-concept': c.id,
      'data-rel': !focus ? undefined : c.id === focus ? 'focus' : f?.needs.includes(c.id) ? 'needs' : leadsTo(focus).some((n) => n.id === c.id) ? 'leads' : 'other',
      onMouseEnter: () => setFocus(c.id),
      onFocus: () => setFocus(c.id),
      className: 'map-station',
    }
    return c.to ? (
      <Link {...props} to={c.to}>
        {c.label}
      </Link>
    ) : (
      <span {...props} tabIndex={0} aria-label={`${c.label} (in preparation)`}>
        {c.label}
      </span>
    )
  }

  return (
    <>
      <div ref={root} className="map" onMouseLeave={() => setFocus(null)}>
        <svg className="map-edges" aria-hidden="true">
          {edges.map((e, i) => (
            <path key={i} d={e.d} data-kind={e.kind} />
          ))}
        </svg>
        <ol className="map-lines">
          {lines.map((l) => (
            <li key={l.id} id={l.anchor} className="map-line" data-built={l.built}>
              <div className="map-lecture">
                <span className="map-num">{l.num}</span>
                <span className="map-title">
                  {l.built && l.to ? <Link to={l.to}>{l.title}</Link> : l.title}
                  {!l.built && <span className="map-prep"> · in preparation</span>}
                </span>
              </div>
              <ol className="map-stations">
                {stations
                  .filter((c) => c.line === l.id)
                  .map((c) => (
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
    </>
  )
}
