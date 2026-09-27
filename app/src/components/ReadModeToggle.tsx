/**
 * Story mode / Read mode (Phase 4a item 4): the same content either with the pinned 3D stage or as the plain
 * reading column. Shown only where the live stage is possible (narrow screens and WebGL failures already read).
 */
import { useLiveCapable } from '../stage/useLiveStage'
import { setReadMode, useReadMode } from '../ui/readModePref'

export function ReadModeToggle() {
  const capable = useLiveCapable()
  const read = useReadMode()
  if (!capable) return null
  return (
    <div className="mode-toggle" role="group" aria-label="How to read this lecture">
      <button type="button" aria-pressed={!read} onClick={() => setReadMode(false)}>
        Story
      </button>
      <button type="button" aria-pressed={read} onClick={() => setReadMode(true)}>
        Read
      </button>
    </div>
  )
}
