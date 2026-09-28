/**
 * Story mode / Read mode (Phase 4a item 4): the same content either with the pinned 3D stage or as the plain
 * reading column. Shown only where the live stage is possible (narrow screens and WebGL failures already read).
 */
import { flushReadingProbe } from '../stage/readingPosition'
import { useLiveCapable } from '../stage/useLiveStage'
import { setReadMode, useReadMode } from '../ui/readModePref'

/**
 * `compact`: the copy in the sticky unit rail, in reach on the beat being read (the header's copy is at the top of
 * the page, where switching keeps only the top). Its buttons are named "Story mode here" / "Read mode here".
 */
export function ReadModeToggle({ compact = false }: { compact?: boolean }) {
  const capable = useLiveCapable()
  const read = useReadMode()
  if (!capable) return null
  const choose = (toRead: boolean) => {
    flushReadingProbe() // the place as it is now, before the page swaps
    setReadMode(toRead)
  }
  return (
    <div
      className={compact ? 'mode-toggle compact' : 'mode-toggle'}
      role="group"
      aria-label={compact ? 'Reading mode for this page, keeps your place' : 'How to read this lecture'}
    >
      <button type="button" aria-pressed={!read} aria-label={compact ? 'Story mode here' : undefined} onClick={() => choose(false)}>
        Story
      </button>
      <button type="button" aria-pressed={read} aria-label={compact ? 'Read mode here' : undefined} onClick={() => choose(true)}>
        Read
      </button>
    </div>
  )
}
