/**
 * Decor video (14-decor-clip; CLAUDE.md "Generated media (Higgsfield) is decoration only and never states a
 * physical result"): atmosphere-only background footage — a cryostat plate loop — behind reading content. It
 * carries no information a screen reader should announce (`aria-hidden`), so it is never given an `alt`/label of
 * its own.
 *
 * Falls back to the poster frame alone (no `<video>` element in the DOM at all) under `prefers-reduced-motion`,
 * the app's Motion toggle (`useStageFlag('motion')`, kept live by `useMotionSync()`), a viewport narrower than the
 * live stage's own 900 px floor (`stage/useLiveStage.ts` WIDE_QUERY), or a failed load. When it does play, it
 * plays only while its own box is on screen (IntersectionObserver) and pauses off screen.
 *
 * The caller positions the root box (a full-bleed row background, an opener-header fill, …); decorVideo.css only
 * fills that box, plus a scrim dark enough that a fully white frame still keeps every reserved Cryostat text token
 * at >= 4.5 : 1 over it (decorVideo.contrast.test.ts) — the actual footage varies frame to frame, so the scrim is
 * sized for the worst case, not the average one.
 */
import { useEffect, useRef, useState } from 'react'
import { useStageFlag } from '../stage/store'
import { useMedia, WIDE_QUERY } from '../stage/useLiveStage'
import './decorVideo.css'

/** One file per course plate that has a clip today (app/public/decor/qc709/). */
export type DecorClipId = 'plate-300k' | 'plate-50k' | 'plate-4k'

const BASE = '/decor/qc709'

export interface DecorVideoProps {
  clip: DecorClipId
  /** Extra class on the root box, for a caller that needs to override its default fill positioning. */
  className?: string
}

export default function DecorVideo({ clip, className }: DecorVideoProps) {
  const motion = useStageFlag('motion')
  const wide = useMedia(WIDE_QUERY)
  const [failed, setFailed] = useState(false)
  const [visible, setVisible] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const showVideo = motion && wide && !failed
  const poster = `${BASE}/${clip}.webp`

  // play only while the box is on screen; a browser without IntersectionObserver (none we support) just plays
  useEffect(() => {
    if (!showVideo) return
    const el = boxRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [showVideo])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !showVideo) return
    if (visible) void v.play().catch(() => {}) // a play() the browser refuses (no gesture yet) just leaves the poster showing
    else v.pause()
  }, [visible, showVideo])

  return (
    <div ref={boxRef} className={className ? `decor-video ${className}` : 'decor-video'} aria-hidden="true">
      {showVideo ? (
        <video ref={videoRef} className="decor-video-el" muted playsInline loop preload="none" poster={poster} aria-hidden="true" onError={() => setFailed(true)}>
          <source src={`${BASE}/${clip}.mp4`} type="video/mp4" />
        </video>
      ) : (
        <img className="decor-video-poster" src={poster} alt="" aria-hidden="true" width={1280} height={720} loading="lazy" decoding="async" />
      )}
      <div className="decor-scrim" aria-hidden="true" />
    </div>
  )
}
