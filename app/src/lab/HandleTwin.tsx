/**
 * The DOM twin of an in-scene drag handle (decisions/lab.md ruling 2): focusable, arrow keys nudge (Shift = fine), a
 * screen reader hears its name and value. Focus is reported so the scene can highlight the handle. The twin writes
 * the same store action as the drag; the store drives the scene.
 */
import { useId } from 'react'
import { type Dims, NUDGE_HELP, type Nudge, nudgeOf } from './nudge'

export interface HandleTwinProps {
  label: string
  /** The handle's current value in words (engine values, formatted by the page). */
  valueText: string
  dims: Dims
  disabled?: boolean
  /** Why it cannot move right now (shown and announced when disabled). */
  disabledText?: string
  /** 1-axis twins are sliders: their range and value. */
  slider?: { now: number; min: number; max: number }
  onNudge(n: Nudge): void
  onFocusChange?(focused: boolean): void
}

export function HandleTwin({ label, valueText, dims, disabled, disabledText, slider, onNudge, onFocusChange }: HandleTwinProps) {
  const help = useId()
  return (
    <div
      className="lab-twin"
      role={dims === 1 ? 'slider' : 'group'}
      aria-roledescription="drag handle"
      aria-label={label}
      aria-describedby={help}
      aria-disabled={disabled || undefined}
      aria-valuetext={dims === 1 ? valueText : undefined}
      aria-valuenow={dims === 1 ? slider?.now : undefined}
      aria-valuemin={dims === 1 ? slider?.min : undefined}
      aria-valuemax={dims === 1 ? slider?.max : undefined}
      tabIndex={0}
      data-disabled={disabled ? '1' : undefined}
      onKeyDown={(e) => {
        const n = nudgeOf(e.key, dims, e.shiftKey)
        if (!n) return
        e.preventDefault()
        if (!disabled) onNudge(n)
      }}
      onFocus={() => onFocusChange?.(true)}
      onBlur={() => onFocusChange?.(false)}
    >
      <span className="lab-twin-name">{label}</span>
      <span className="lab-twin-value mono">{disabled && disabledText ? disabledText : valueText}</span>
      <span id={help} className="visually-hidden">
        {NUDGE_HELP[dims]}
      </span>
    </div>
  )
}
