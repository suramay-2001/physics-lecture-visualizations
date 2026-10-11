/**
 * Where "Notation in this chapter" goes at the end of a lecture (components/NotationKey.tsx), and when its chunk is fetched
 * (notation explainers, review #27). The key, the dictionary and the pre-processor weigh about 70 KB, and a reader who never
 * scrolls to the end of the chapter, or has the cards off, does not need them: they load when
 *   - the slot comes within a screen or two of the viewport (an IntersectionObserver with a margin, so the key is there
 *     before the reader reaches it);
 *   - a print starts: `beforeprint`, the print media query turning on, the browser's print shortcut, and the "Print notes"
 *     button (components/PrintNotes.tsx), which waits for the key before it prints. The key is printed open.
 * The slot itself is a few lines in the entry chunk; the import is dynamic (rule (o) of build/chunks.test.ts).
 */
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { CourseId, Track } from '../content/courses'
import type { Lecture } from '../content/schema'

const loadKey = () => import('./NotationKey')
const NotationKey = lazy(loadKey)

/** How far below the viewport the slot is when the key starts loading. */
const MARGIN = '1500px 0px'

const slots = new Set<() => void>()

/**
 * Put the key on the page and resolve once it is there (or after a second and a half: a failed fetch resolves too, and the print
 * then goes without it). Used by a print that is about to start. Nothing to wait for when the key is already on the page.
 */
export async function wantNotationKey(): Promise<void> {
  if (!slots.size) return
  slots.forEach((want) => want())
  await loadKey().catch(() => undefined)
  for (let i = 0; i < 90 && !document.querySelector('.notation-key'); i++) await new Promise<void>((r) => requestAnimationFrame(() => r()))
}

export function NotationKeySlot({ lecture, track, course }: { lecture: Lecture; track: Track; course: CourseId }) {
  const [near, setNear] = useState(typeof IntersectionObserver === 'undefined')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (near) return
    const want = () => flushSync(() => setNear(true))
    slots.add(want)
    const onPrint = () => {
      void loadKey().catch(() => undefined)
      want()
    }
    const print = typeof matchMedia === 'function' ? matchMedia('print') : null
    const onMedia = () => print?.matches && onPrint()
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') void loadKey().catch(() => undefined) // the print starts a moment later
    }
    addEventListener('beforeprint', onPrint)
    print?.addEventListener('change', onMedia)
    addEventListener('keydown', onKey)
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { rootMargin: MARGIN })
    if (ref.current) io.observe(ref.current)
    return () => {
      slots.delete(want)
      removeEventListener('beforeprint', onPrint)
      print?.removeEventListener('change', onMedia)
      removeEventListener('keydown', onKey)
      io.disconnect()
    }
  }, [near])
  return (
    <div ref={ref} className="notation-key-slot">
      {near && (
        <Suspense fallback={null}>
          <NotationKey lecture={lecture} track={track} course={course} />
        </Suspense>
      )}
    </div>
  )
}
