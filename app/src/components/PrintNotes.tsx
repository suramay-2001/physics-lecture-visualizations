/**
 * Print notes (W-709-platform "Print notes"; the notes ARE the Read mode): a button that switches the page to the
 * reading version (flushed synchronously, so the static story with its numbered figures is on the page), waits for the
 * fonts, prints, and puts the reader's mode back. A print started from the browser (Cmd/Ctrl+P) does the same through
 * `beforeprint` / `afterprint` (usePrintFlush, on every lecture page of both courses). styles/print.css lays it out.
 */
import { useEffect } from 'react'
import { flushSync } from 'react-dom'
import { getReadMode, setReadMode } from '../ui/readModePref'

let viaButton = false

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

/** Read mode on, fonts in, print, previous mode back. */
export async function printNotes(): Promise<void> {
  const was = getReadMode()
  viaButton = true
  try {
    if (!was) flushSync(() => setReadMode(true))
    await document.fonts?.ready
    await nextFrame()
    await nextFrame()
    window.print()
  } finally {
    viaButton = false
    if (!was) setReadMode(false)
  }
}

/** A browser-started print gets the same notes: Read mode for the print, the reader's mode after it. */
export function usePrintFlush(): void {
  useEffect(() => {
    let was: boolean | null = null
    const before = () => {
      if (viaButton) return
      was = getReadMode()
      if (!was) flushSync(() => setReadMode(true))
    }
    const after = () => {
      if (was === false) setReadMode(false)
      was = null
    }
    addEventListener('beforeprint', before)
    addEventListener('afterprint', after)
    return () => {
      removeEventListener('beforeprint', before)
      removeEventListener('afterprint', after)
    }
  }, [])
}

export function PrintNotes() {
  return (
    <button type="button" className="print-notes-btn" onClick={() => void printNotes()}>
      Print notes
    </button>
  )
}
