/**
 * `[[gloss]]` → a focusable button with a one-sentence popover (W-L1 §1.3; the "meeting it cold" layer).
 * W0 version: inline popover, click/Enter/Space toggles, Esc closes and keeps focus on the button,
 * `aria-describedby` points at the popover while open. W1 portals the popover to <body> (no reflow,
 * stacking z 20) and adds hover intent — same props, so Rich.tsx does not change.
 */
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { GLOSSARY } from '../content/glossary'
import { Rich } from '../ui/Rich'

export function Gloss({ id, children }: { id: string; children: ReactNode }) {
  const entry = GLOSSARY.get(id)
  const [open, setOpen] = useState(false)
  const popId = useId()
  if (!entry) return <span className="gloss gloss-missing">{children}</span>
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
    }
  }
  return (
    <span className="gloss-wrap">
      <button
        type="button"
        className="gloss"
        data-gloss={id}
        aria-expanded={open}
        aria-describedby={open ? popId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        onBlur={() => setOpen(false)}
      >
        {children}
      </button>
      {open && (
        <span role="tooltip" id={popId} className="gloss-pop">
          <Rich as="span" text={`**${entry.term}**: ${entry.gloss}`} />
        </span>
      )}
    </span>
  )
}
