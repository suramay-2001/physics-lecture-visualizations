/**
 * The DOM overlay inside a sticky stage box (W-L1 §2.1, §2.7 z 2; D §2.2 positions). THREE-FREE.
 *   - passport per view slot, derived from the state (`passportOf`), as a button opening the fidelity drawer
 *   - axis-label slots: one hidden label per passport axis (`axis-0`, `axis-1` …); a scene shows one by
 *     anchoring that name in `useDomLabels` (a label the scene publishes under the same name wins)
 *   - labels and readouts each scene publishes (`useStageLabels`), moved / written without React
 *   - the caption of the current beat (the reveal's caption once a clue is revealed)
 * Reserved zones for the label layout pass (D §6.1) are marked `data-reserve`: passports, readouts,
 * caption, inset frame. Every text element carries `data-contrast` for `__stage.contrast()`.
 */
import { useCallback, useState } from 'react'
import { beatLayout, layoutSlots, passportOf, type Beat, type FidelityKey, type StageKind, type ViewSlot } from '../content/stage'
import { INSET, slotRect } from '../stage/drive'
import { reserveRef } from '../stage/labelLayout'
import { domRef, labelKey, useViewLabels, viewKey, type StageLabel } from '../stage/store'
import { Rich } from '../ui/Rich'
import { FidelityDrawer } from './FidelityDrawer'

/** Anchored labels of one view: passport axis slots + whatever the scene published. */
function ViewLabels({ unitId, kind, axes }: { unitId: string; kind: StageKind; axes: readonly string[] }) {
  const vKey = viewKey(unitId, kind)
  const published = useViewLabels(vKey)
  const all: [string, StageLabel][] = axes.map((text, i) => [`axis-${i}`, { text, tier: 'axis' }])
  for (const [name, l] of Object.entries(published)) {
    if (l.tier === 'readout') continue
    const at = all.findIndex(([n]) => n === name)
    if (at >= 0) all[at] = [name, l]
    else all.push([name, l])
  }
  return (
    <>
      {all.map(([name, l]) => (
        <span
          key={name}
          ref={domRef(labelKey(vKey, name))}
          className="stage-label"
          data-view={vKey}
          data-label={name}
          data-tier={l.tier ?? 'axis'}
          data-tone={l.tone ?? 'text'}
          data-contrast="label"
          data-hidden="1"
          style={{ opacity: 0 }}
        >
          <Rich as="span" text={l.text} />
        </span>
      ))}
    </>
  )
}

/** Readouts of one view (plain text, written each frame by writeReadout). */
function ViewReadouts({ unitId, kind }: { unitId: string; kind: StageKind }) {
  const vKey = viewKey(unitId, kind)
  const labels = useViewLabels(vKey)
  return (
    <>
      {Object.entries(labels)
        .filter(([, l]) => l.tier === 'readout')
        .map(([name, l]) => (
          <span key={name} ref={domRef(labelKey(vKey, name))} className="stage-readout" data-view={vKey} data-tone={l.tone ?? 'text'} data-contrast="readout">
            {l.text}
          </span>
        ))}
    </>
  )
}

/** Passport position per slot (D §2.2): top-left 14/14 px; the inset's title strip sits above its view. */
export function passportStyle(slot: ViewSlot, w: number, h: number): React.CSSProperties {
  const [x, y] = slotRect(slot, w, h)
  if (slot === 'inset') return { left: x, top: y - INSET.strip, width: INSET.w, height: INSET.strip }
  return { left: x + 14, top: y + 14 }
}

export interface StageOverlayProps {
  unitId: string
  /** Every kind the unit's story uses (labels of absent kinds stay hidden). */
  kinds: readonly StageKind[]
  beat: Beat
  revealed: boolean
  /** Stage box size in CSS px (passport positions follow the slot rects). */
  size: { w: number; h: number }
}

export function StageOverlay({ unitId, kinds, beat, revealed, size }: StageOverlayProps) {
  const layout = beatLayout(beat, revealed)
  const slots = layoutSlots(layout)
  const caption = revealed && beat.reveal?.caption ? beat.reveal.caption : beat.caption
  const highlight = [...(beat.fidelity ?? []), ...(revealed ? (beat.reveal?.fidelity ?? []) : [])]
  const [open, setOpen] = useState<{ key: FidelityKey; kind: StageKind; title: string; anchor: HTMLElement } | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const axesOf = (k: StageKind) => {
    const s = slots.find((x) => x.state.kind === k)?.state
    return s ? passportOf(s).axes : []
  }

  return (
    <div className="stage-overlay" data-unit={unitId}>
      {slots.map(({ slot, state }) => {
        const p = passportOf(state)
        const isOpen = open?.key === p.fidelityKey && open.anchor.dataset.slot === slot
        return (
          <button
            key={slot}
            ref={reserveRef(unitId, `passport-${slot}`)}
            type="button"
            className="stage-passport"
            data-contrast="passport"
            data-slot={slot}
            data-kind={state.kind}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            title="What this picture gets right and wrong"
            style={passportStyle(slot, size.w, size.h)}
            onClick={(e) => {
              const anchor = e.currentTarget
              setOpen((o) => (o && o.anchor === anchor ? null : { key: p.fidelityKey, kind: state.kind, title: p.title, anchor }))
            }}
          >
            <span className="passport-title">
              <Rich as="span" text={p.title} />
              <span className="passport-info" aria-hidden>
                ⓘ
              </span>
            </span>
            {slot !== 'inset' && <span className="passport-note">{p.note}</span>}
          </button>
        )
      })}
      {slots.some((s) => s.slot === 'inset') && (
        <div
          ref={reserveRef(unitId, 'inset')}
          className="stage-inset-frame"
          aria-hidden
          style={(() => {
            const [x, y, w, h] = slotRect('inset', size.w, size.h)
            return { left: x, top: y, width: w, height: h }
          })()}
        />
      )}
      {kinds.map((k) => (
        <ViewLabels key={k} unitId={unitId} kind={k} axes={axesOf(k)} />
      ))}
      <div className="stage-readouts" ref={reserveRef(unitId, 'readouts')}>
        {slots.map(({ state }) => (
          <ViewReadouts key={state.kind} unitId={unitId} kind={state.kind} />
        ))}
      </div>
      {caption && (
        <p className="stage-caption" data-contrast="caption" data-source={caption} ref={reserveRef(unitId, 'caption')}>
          <Rich as="span" text={caption} />
        </p>
      )}
      {open && <FidelityDrawer fidelityKey={open.key} kind={open.kind} title={open.title} highlight={highlight} anchor={open.anchor} onClose={close} />}
    </div>
  )
}
