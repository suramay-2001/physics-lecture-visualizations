import { useCallback, useRef, type PointerEvent, type ReactNode, type RefObject } from 'react'

/**
 * Shared SVG plumbing for the 2D widgets: a square math-coordinate viewport (y up) and a
 * draggable-point helper that works with mouse, touch and pen.
 */
export interface Viewport {
  size: number
  scale: number // pixels per unit
  toPx: (x: number, y: number) => [number, number]
  fromPx: (px: number, py: number) => [number, number]
}

export function viewport(size: number, extent: number): Viewport {
  const scale = size / 2 / extent
  return {
    size,
    scale,
    toPx: (x, y) => [size / 2 + x * scale, size / 2 - y * scale],
    fromPx: (px, py) => [(px - size / 2) / scale, (size / 2 - py) / scale],
  }
}

export function useDrag(svgRef: RefObject<SVGSVGElement | null>, vp: Viewport, onMove: (x: number, y: number) => void) {
  const dragging = useRef(false)
  const toLocal = useCallback(
    (e: PointerEvent) => {
      const svg = svgRef.current
      if (!svg) return null
      const r = svg.getBoundingClientRect()
      const px = ((e.clientX - r.left) / r.width) * vp.size
      const py = ((e.clientY - r.top) / r.height) * vp.size
      return vp.fromPx(px, py)
    },
    [svgRef, vp],
  )
  return {
    onPointerDown: (e: PointerEvent) => {
      dragging.current = true
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
      const p = toLocal(e)
      if (p) onMove(p[0], p[1])
    },
    onPointerMove: (e: PointerEvent) => {
      if (!dragging.current) return
      const p = toLocal(e)
      if (p) onMove(p[0], p[1])
    },
    onPointerUp: () => {
      dragging.current = false
    },
  }
}

export function Grid({ vp, extent, step = 1, labels = true }: { vp: Viewport; extent: number; step?: number; labels?: boolean }) {
  const lines: ReactNode[] = []
  for (let v = -extent; v <= extent + 1e-9; v += step) {
    const [x] = vp.toPx(v, 0)
    const [, y] = vp.toPx(0, v)
    lines.push(<line key={`v${v}`} x1={x} x2={x} y1={0} y2={vp.size} className="grid-line" />)
    lines.push(<line key={`h${v}`} y1={y} y2={y} x1={0} x2={vp.size} className="grid-line" />)
  }
  const [ox, oy] = vp.toPx(0, 0)
  return (
    <g>
      {lines}
      <line x1={0} x2={vp.size} y1={oy} y2={oy} className="axis-line" />
      <line y1={0} y2={vp.size} x1={ox} x2={ox} className="axis-line" />
      {labels && (
        <>
          <text x={vp.size - 6} y={oy - 6} textAnchor="end" className="axis-text">Re</text>
          <text x={ox + 6} y={14} className="axis-text">Im</text>
        </>
      )}
    </g>
  )
}

export function Arrow({ vp, from = [0, 0], to, className = 'vec', label, labelOffset = [8, -8] }: {
  vp: Viewport
  from?: [number, number]
  to: [number, number]
  className?: string
  label?: ReactNode
  labelOffset?: [number, number]
}) {
  const [x1, y1] = vp.toPx(...from)
  const [x2, y2] = vp.toPx(...to)
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ux = len ? (x2 - x1) / len : 0
  const uy = len ? (y2 - y1) / len : 0
  const h = Math.min(10, len * 0.4)
  return (
    <g className={className}>
      <line x1={x1} y1={y1} x2={x2 - ux * h * 0.7} y2={y2 - uy * h * 0.7} />
      {len > 2 && (
        <polygon points={`${x2},${y2} ${x2 - ux * h - uy * h * 0.45},${y2 - uy * h + ux * h * 0.45} ${x2 - ux * h + uy * h * 0.45},${y2 - uy * h - ux * h * 0.45}`} />
      )}
      {label && (
        <foreignObject x={x2 + labelOffset[0] - 40} y={y2 + labelOffset[1] - 14} width={80} height={28} className="svg-label">
          <div>{label}</div>
        </foreignObject>
      )}
    </g>
  )
}
