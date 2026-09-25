/**
 * "What this picture gets right / wrong" (PLAN Fidelity; D §2.4; decision #20): the passport is a button,
 * and this panel drops from it. Non-modal dialog, portalled to <body> (stacking z 20, story.css):
 *   - focus moves into the panel on open; Esc, the close button, a second passport click or a click
 *     outside closes it; focus returns to the passport;
 *   - three groups (✓ Exact · ≈ Schematic · ! Misleading on purpose), text from content/fidelity.ts;
 *   - items this beat flags (`Beat.fidelity`) are marked "relevant now".
 * Position follows the passport (fixed, re-measured on scroll/resize via rAF), so the sticky stage can move.
 * Visuals are D's (stage/overlay.css); story.css carries only layout.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { fidelityOf } from '../content/fidelity'
import type { FidelityItem, FidelityKey, StageKind } from '../content/stage'
import { stageCssVars } from '../stage/tokens'
import { Rich } from '../ui/Rich'

export interface FidelityDrawerProps {
  fidelityKey: FidelityKey
  /** The kind whose passport opened it (the panel carries that stage's colour tokens). */
  kind: StageKind
  /** Passport title (rich inline) for the heading. */
  title: string
  /** FidelityItem ids flagged by the current beat. */
  highlight: readonly string[]
  /** The passport button the panel drops from (focus returns here). */
  anchor: HTMLElement
  onClose: () => void
}

const GROUPS: { key: 'exact' | 'schematic' | 'misleading'; glyph: string; label: string }[] = [
  { key: 'exact', glyph: '✓', label: 'Exact' },
  { key: 'schematic', glyph: '≈', label: 'Schematic' },
  { key: 'misleading', glyph: '!', label: 'Misleading on purpose' },
]

function place(anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect()
  const box = anchor.closest<HTMLElement>('.story-stage')?.getBoundingClientRect()
  const width = Math.max(220, Math.min(380, (box?.width ?? 408) - 28))
  const maxHeight = Math.max(160, (box?.height ?? innerHeight) * 0.6)
  const left = Math.min(Math.max(8, r.left), innerWidth - width - 8)
  return { left, top: r.bottom + 6, width, maxHeight }
}

export function FidelityDrawer({ fidelityKey, kind, title, highlight, anchor, onClose }: FidelityDrawerProps) {
  const f = fidelityOf(fidelityKey)
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const [pos, setPos] = useState(() => place(anchor))

  // follow the passport while the page scrolls (the stage box is sticky, so it mostly stays put)
  useEffect(() => {
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setPos(place(anchor)))
    }
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', update)
      removeEventListener('resize', update)
    }
  }, [anchor])

  useLayoutEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])

  // Esc and outside clicks close; focus returns to the passport
  useEffect(() => {
    const close = (refocus: boolean) => {
      onClose()
      if (refocus) anchor.focus({ preventScroll: true })
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close(true)
      }
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node | null
      if (t && (ref.current?.contains(t) || anchor.contains(t))) return
      close(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [anchor, onClose])

  const item = (i: FidelityItem) => {
    const now = highlight.includes(i.id)
    return (
      <li key={i.id} data-fidelity={i.id} data-relevant={now ? 'true' : undefined}>
        <Rich as="span" text={i.text} />
        {now && <span className="fidelity-now"> · relevant now</span>}
      </li>
    )
  }

  return createPortal(
    <div
      ref={ref}
      className="fidelity-drawer"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      style={{ ...(stageCssVars(kind) as React.CSSProperties), position: 'fixed', left: pos.left, top: pos.top, width: pos.width, maxHeight: pos.maxHeight }}
    >
      <div className="fidelity-head">
        <p id={titleId} className="fidelity-title">
          What this picture gets right and wrong · <Rich as="span" text={title} />
        </p>
        <button
          type="button"
          className="fidelity-close"
          aria-label="Close"
          onClick={() => {
            onClose()
            anchor.focus({ preventScroll: true })
          }}
        >
          ×
        </button>
      </div>
      {GROUPS.map((g) => (
        <section key={g.key} className={`fidelity-group fidelity-${g.key}`} aria-label={g.label}>
          <p className="fidelity-group-title">
            <span aria-hidden>{g.glyph}</span> {g.label}
          </p>
          <ul>{f[g.key].map(item)}</ul>
        </section>
      ))}
    </div>,
    document.body,
  )
}
