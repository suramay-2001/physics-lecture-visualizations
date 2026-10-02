/**
 * The DOM overlay inside a sticky stage box (W-L1 §2.1, §2.7 z 2; D §2.2 positions). THREE-FREE.
 *   - passport per view slot, derived from the state (`passportOf`), as a button opening the fidelity drawer
 *   - axis-label slots: one hidden label per passport axis (`axis-0`, `axis-1` …); a scene shows one by
 *     anchoring that name in `useDomLabels` (a label the scene publishes under the same name wins)
 *   - labels and readouts each scene publishes (`useStageLabels`), moved / written without React
 *   - the caption of the current beat (the reveal's caption once a clue is revealed)
 * Reserved zones for the label layout pass (D §6.1) are marked `data-reserve`: passports, readouts,
 * caption, inset frame. Every text element carries `data-contrast` for `__stage.contrast()`.
 *
 * Hooks D's overlay.css styles (interface change D6; checked by e2e/story.spec.ts): `.stage-passport[data-slot]`
 * with `aria-expanded` (D's CSS draws the ⓘ glyph from it, so the markup has none, Round 3 #9) and
 * `data-relevant="1"` when the beat flags one of its fidelity items; `.stage-readouts`, `.stage-caption`,
 * `.stage-label[data-tier][data-tone]`; the drawer's hooks are in FidelityDrawer.
 *
 * Truth guard (Round 3 #5, stage/readoutGuard.ts): a view whose state claims no quantum outcomes (a lab beat
 * under the classical model) gets `data-outcomes="off"` on its readouts (writeReadout blanks ± text there),
 * loses its outcome labels, and the readout column says CLASSICAL_NOTE instead.
 */
import { useCallback, useLayoutEffect, useState } from 'react'
import { beatLayout, layoutSlots, passportOf, type Beat, type FidelityKey, type StageKind, type StageState, type ViewSlot } from '../content/stage'
import { INSET, slotRect } from '../stage/drive'
import { reserveRef } from '../stage/labelLayout'
import { CLASSICAL_NOTE, isOutcomeText, outcomesAllowed } from '../stage/readoutGuard'
import { domRef, labelKey, stage, useDerivCaption, useDerivLayout, useViewLabels, viewKey } from '../stage/store'
import { Rich } from '../ui/Rich'
import { courseOfId } from '../content/courses'
import { wheelWedges } from '../stage/phaseHue'
import { fidelityOf } from '../content/fidelity'
import { FidelityDrawer } from './FidelityDrawer'
import { anchoredLabels, keepMathTogether, passportRelevant } from './overlayText'

/** Anchored labels of one view: passport axis slots + whatever the scene published. */
function ViewLabels({ unitId, kind, axes, outcomes }: { unitId: string; kind: StageKind; axes: readonly string[]; outcomes: boolean }) {
  const vKey = viewKey(unitId, kind)
  const published = useViewLabels(vKey)
  return (
    <>
      {anchoredLabels(axes, published, outcomes).map(([name, l]) => (
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
function ViewReadouts({ unitId, kind, outcomes }: { unitId: string; kind: StageKind; outcomes: boolean }) {
  const vKey = viewKey(unitId, kind)
  const labels = useViewLabels(vKey)
  const names = Object.entries(labels)
    .filter(([, l]) => l.tier === 'readout')
    .map(([name]) => name)
  // text written before the view turned classical is cleared at once (writeReadout guards the next writes)
  useLayoutEffect(() => {
    if (outcomes) return
    for (const name of names) {
      const el = stage.dom.get(labelKey(vKey, name))
      if (el && isOutcomeText(el.textContent)) el.textContent = ''
    }
  })
  return (
    <>
      {!outcomes && (
        <span className="stage-readout" data-view={vKey} data-tone="text" data-contrast="readout" data-model-note="classical">
          {CLASSICAL_NOTE}
        </span>
      )}
      {names.map((name) => (
        <span
          key={name}
          ref={domRef(labelKey(vKey, name))}
          className="stage-readout"
          data-view={vKey}
          data-tone={labels[name].tone ?? 'text'}
          data-contrast="readout"
          data-outcomes={outcomes ? undefined : 'off'}
        >
          {labels[name].text}
        </span>
      ))}
    </>
  )
}

/** The passport legend of the 709 kinds that colour a number by its phase (stage/phaseHue.ts): the hue wheel. */
function PhaseLegend() {
  return (
    <span className="passport-legend" data-legend="phase">
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        {wheelWedges().map((w, k) => (
          <path key={k} d={w.d} fill={w.fill} />
        ))}
      </svg>
      hue = phase
    </span>
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
  // "derivations drive the stage" (W-709 #11): while a line's view is active, it stands in for the beat's own
  // layout and caption here too, so the passport and the caption stay in sync with the drawn view (not just the
  // readouts, which already come from the resolved state the Driver feeds the scene).
  const derivLayout = useDerivLayout(unitId)
  const derivCaption = useDerivCaption(unitId)
  const layout = derivLayout ?? beatLayout(beat, revealed)
  const slots = layoutSlots(layout)
  const caption = derivLayout ? (derivCaption ?? beat.caption) : revealed && beat.reveal?.caption ? beat.reveal.caption : beat.caption
  const highlight = [...(beat.fidelity ?? []), ...(revealed ? (beat.reveal?.fidelity ?? []) : [])]
  const [open, setOpen] = useState<{ key: FidelityKey; kind: StageKind; title: string; anchor: HTMLElement } | null>(null)
  const close = useCallback(() => setOpen(null), [])
  // a course may label a shared kind its own way (709: |0⟩ = |+z⟩) and add fidelity notes to its drawer
  const course = courseOfId(unitId)
  const stateOf = (k: StageKind): StageState | undefined => slots.find((x) => x.state.kind === k)?.state
  const axesOf = (k: StageKind) => {
    const s = stateOf(k)
    return s ? passportOf(s, course).axes : []
  }
  const outcomesOf = (k: StageKind) => {
    const s = stateOf(k)
    return s ? outcomesAllowed(s) : true
  }

  return (
    <div className="stage-overlay" data-unit={unitId}>
      {slots.map(({ slot, state }) => {
        const p = passportOf(state, course)
        const title = keepMathTogether(p.title)
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
            data-relevant={passportRelevant(p.fidelityKey, highlight, course) ? '1' : undefined}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            title="What this picture gets right and wrong"
            style={passportStyle(slot, size.w, size.h)}
            onClick={(e) => {
              const anchor = e.currentTarget
              setOpen((o) => (o && o.anchor === anchor ? null : { key: p.fidelityKey, kind: state.kind, title, anchor }))
            }}
          >
            <span className="passport-title">
              <Rich as="span" text={title} />
            </span>
            {slot !== 'inset' && <span className="passport-note">{keepMathTogether(p.note)}</span>}
            {p.legend === 'phase' && slot !== 'inset' && <PhaseLegend />}
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
        <ViewLabels key={k} unitId={unitId} kind={k} axes={axesOf(k)} outcomes={outcomesOf(k)} />
      ))}
      <div className="stage-readouts" ref={reserveRef(unitId, 'readouts')}>
        {slots
          .filter(({ slot }) => slot !== 'bottom')
          .map(({ state }) => (
            <ViewReadouts key={state.kind} unitId={unitId} kind={state.kind} outcomes={outcomesAllowed(state)} />
          ))}
      </div>
      {/* a split's lower view reads out beside itself, so its numbers are never taken for the upper view's (L6 QA) */}
      {slots.some(({ slot }) => slot === 'bottom') && (
        <div
          className="stage-readouts"
          data-slot="bottom"
          ref={reserveRef(unitId, 'readouts-bottom')}
          style={{ top: slotRect('bottom', size.w, size.h)[1] + 14 }}
        >
          {slots
            .filter(({ slot }) => slot === 'bottom')
            .map(({ state }) => (
              <ViewReadouts key={state.kind} unitId={unitId} kind={state.kind} outcomes={outcomesAllowed(state)} />
            ))}
        </div>
      )}
      {caption && (
        <p className="stage-caption" data-contrast="caption" data-source={caption} ref={reserveRef(unitId, 'caption')}>
          <Rich as="span" text={caption} />
        </p>
      )}
      {open && (
        <FidelityDrawer
          fidelityKey={open.key}
          kind={open.kind}
          title={open.title}
          highlight={highlight}
          anchor={open.anchor}
          onClose={close}
          fidelity={course === 'sl448' ? undefined : fidelityOf(open.key, course)}
        />
      )}
    </div>
  )
}
