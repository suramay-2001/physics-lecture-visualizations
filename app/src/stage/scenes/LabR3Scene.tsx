/**
 * lab-r3 — the Stern–Gerlach bench (D-L1-scenes §3.1, §4; decisions #20–#22, #24–#25).
 *
 * Draws `f.state` (ResolvedLab: tilts, kept signs, exact fractions from benchTheory, gradient, model …)
 * and never decides physics: atom fates and deposit spots are seeded draws against the engine's fractions;
 * every number shown is either a state input (θ) or an engine output (Born %), or the drawn sample's count.
 *
 * Choreography (closed motion list, docs/roles/scene-specs/L1.md): atom flow (reader clock only), unit-entry
 * beam reveal, capsule ↔ atom morph, split strength, deposit growth over the hold, module slide-in/out,
 * pole morph, black-box cross-fade, tags, camera dollies inside beat windows (cuts when the lens jumps > 2 rows).
 * No idle motion: `f.clock` stands still unless the reader scrolls or clicks (decision #22).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { PASSPORT, type LabDevice, type LabState, type ViewSlot } from '../../content/stage'
import type { Anchor, LabShot } from '../../content/stageVocab'
import { resolve } from '../resolve'
import { sampleBeats } from '../sample'
import { stage, type StageLabel } from '../store'
import { hfovToVfov, physToThree, useLabelKey, useSharedEnv, useStageCamera, useStageFrame, useStageLabels, useView, writeReadout } from '../hooks'
import { INK, LIGHT_RIG, STAGE_BG } from '../tokens'
import type { Chip, ResolvedBench, ResolvedLab, SceneProps, StageFrame } from '../types'
import { clamp01, lensHfov, lensNeedsCut, lerp, smooth } from './common'
import { DevMeasure } from './devtools'
import { useSceneLabels, type LabelItem, type Rect } from './labels'
import { ATOMS, fateOf, updateAtoms, type BenchFlow, type Fate } from './lab/atoms'
import { DEPOSIT_MAX, depositPoints, SPOT } from './lab/deposit'
import { benchLayout, beamPoint, lerpFrame, matchModules, LAB, type BenchLayout, type ModuleFrame } from './lab/layout'
import { buildLabRig, disposeLabRig, MAX_BENCHES, MAX_DEVICES, type BenchRig, type LabRig, type ModuleRig, type PlateRig } from './lab/rig'
import { shotPose, type Pose } from './lab/shots'

const FLOOR_Z = -2.15
const TRACKED = 7 // the atom that carries the μ⃗ label and the single-atom flight
const TAGS = 12
const ROLLING = 300
// an old plate slides aside past the new module (plate half-width 1.15 + pole half-width 0.95 + margin)
const GHOST_DX = 2.6
const C_PLUS = new THREE.Color(INK.plus)
const C_MINUS = new THREE.Color(INK.minus)
const C_UNPOL = new THREE.Color(INK.unpol)

/* ------------------------------------------------------------------------------------------------ */
/* Label set (a fixed superset; the frame loop shows what the beat needs)                            */
/* ------------------------------------------------------------------------------------------------ */

const ket = (c: Chip): string => {
  if (c === 'oven') return ''
  if (c.named) return `|${c.named[0] === '-' ? '−' : '+'}${c.named[1]}⟩`
  return `|${c.sign === '-' ? '−' : '+'}n⟩`
}
const FRACS: [number, string][] = [
  [1, '1'],
  [0.5, '½'],
  [0.25, '¼'],
  [0.125, '⅛'],
  [0.0625, '1/16'],
  [0.75, '¾'],
  [0.375, '⅜'],
  [0, '0'],
]
const fracText = (x: number) => {
  for (const [v, s] of FRACS) if (Math.abs(x - v) < 5e-4) return s
  return x.toFixed(3)
}
const axisName = (tilt: number) => {
  const d = (tilt * 180) / Math.PI
  const m = ((d % 360) + 360) % 360
  if (Math.abs(m) < 0.5 || Math.abs(m - 360) < 0.5) return 'z'
  if (Math.abs(m - 90) < 0.5) return 'x'
  if (Math.abs(m - 180) < 0.5) return '−z'
  if (Math.abs(m - 270) < 0.5) return '−x'
  return 'n̂'
}

function baseLabels(): Record<string, StageLabel> {
  const L: Record<string, StageLabel> = {
    oven: { text: 'OVEN', tier: 'callout' },
    theta: { text: 'θ', tier: 'axis', tone: 'silver' },
    badge: { text: 'classical model — not what happens', tier: 'axis' },
    thetaMu: { text: '$\\theta_\\mu$', tier: 'axis', tone: 'silver' },
    muCos: { text: '$\\mu\\cos\\theta_\\mu$', tier: 'axis', tone: 'silver' },
    bandMinus: { text: '$-\\mu$', tier: 'axis', tone: 'silver' },
    bandPlus: { text: '$+\\mu$', tier: 'axis', tone: 'silver' },
    mu: { text: '$\\vec\\mu$', tier: 'axis', tone: 'silver' },
    mHat: { text: '$\\hat m$', tier: 'axis', tone: 'silver' },
    nHat: { text: '$\\hat n$', tier: 'axis', tone: 'silver' },
    winP: { text: 'σ = +1', tier: 'axis', tone: 'plus' },
    winM: { text: 'σ = −1', tier: 'axis', tone: 'minus' },
    gx: { text: PASSPORT['lab-r3'].axes[0], tier: 'axis' },
    gy: { text: PASSPORT['lab-r3'].axes[1], tier: 'axis' },
    gz: { text: PASSPORT['lab-r3'].axes[2], tier: 'axis' },
    rCount0: { text: '', tier: 'readout' },
    rBorn0: { text: '', tier: 'readout' },
    rCount1: { text: '', tier: 'readout' },
    rBorn1: { text: '', tier: 'readout' },
    rTheta: { text: '', tier: 'readout', tone: 'silver' },
    rAvg: { text: '', tier: 'readout' },
  }
  for (let b = 0; b < MAX_BENCHES; b++) {
    L[`plate${b}`] = { text: 'PLATE', tier: 'callout' }
    L[`sp${b}`] = { text: '+ħ/2', tier: 'axis', tone: 'plus' }
    L[`sm${b}`] = { text: '−ħ/2', tier: 'axis', tone: 'minus' }
    L[`bench${b}`] = { text: b === 0 ? 'z-first' : 'x-first', tier: 'callout' }
    for (let k = 0; k < MAX_DEVICES; k++) {
      L[`mag${b}${k}`] = { text: 'MAGNET', tier: 'callout' }
      L[`ax${b}${k}`] = { text: 'z', tier: 'axis', tone: 'silver' }
      L[`chip${b}${k}`] = { text: '|+z⟩', tier: 'chip', tone: 'state' }
      L[`frac${b}${k}`] = { text: '1', tier: 'axis' }
      if (k < MAX_DEVICES - 1) L[`stop${b}${k}`] = { text: 'block', tier: 'axis', tone: 'silver' }
    }
  }
  for (let i = 0; i < TAGS; i++) L[`tag${i}`] = { text: '↑', tier: 'axis', tone: 'silver' }
  return L
}

const PRIORITY: Record<string, number> = { g: 0, chip: 1, oven: 1, mag: 1, plate: 1, bench: 1, badge: 1, sp: 2, sm: 2, win: 2, theta: 2, stop: 3, ax: 3, frac: 3, tag: 4 }
function priorityOf(name: string): number {
  for (const [p, v] of Object.entries(PRIORITY)) if (name.startsWith(p)) return v
  return 3
}

/* ------------------------------------------------------------------------------------------------ */
/* Helpers on the resolved state                                                                     */
/* ------------------------------------------------------------------------------------------------ */

const topoKey = (b: ResolvedBench | undefined) =>
  b ? `${b.source}|${b.showPrep}|${b.tilts.length}|${b.keep.join('')}|${b.openOther.map(Number).join('')}` : '-'

function layoutOf(b: ResolvedBench, benchCount: number, index: number): BenchLayout {
  const dz = benchCount === 2 ? (index === 0 ? LAB.benchDz : -LAB.benchDz) : 0
  return benchLayout(b.tilts, b.keep, { showPrep: b.showPrep, openOther: b.openOther, offset: [0, 0, dz] })
}

/**
 * True when a bench reconfiguration between two beats is NOT that beat's change (D §4.0 "Cuts"): the bench
 * count or a source changes, modules drop off the END, or the topology changes together with the model or
 * the field. A module added in place (l1-quantized:b4) or removed from the middle (l1-sequential:b6) animates.
 */
function reconfigCut(a: ResolvedLab, b: ResolvedLab): boolean {
  if (a.benches.length !== b.benches.length) return true
  return a.benches.some((ba, i) => {
    const bb = b.benches[i]
    if (topoKey(ba) === topoKey(bb)) return false
    if (ba.source !== bb.source || ba.showPrep !== bb.showPrep) return true
    const removedEnd = bb.tilts.length < ba.tilts.length && matchModules(ba.tilts, bb.tilts).every((m, j) => m === j)
    return removedEnd || a.model !== b.model || a.gradient !== b.gradient
  })
}

/** A device axis that is authored as a tilt (numeric or scrubbed): the protractor beats. */
const isTiltDevice = (d: LabDevice | undefined) => !!d && d.axis !== 'x' && d.axis !== 'z' && d.axis !== 'y'
const isSweep = (d: LabDevice | undefined) => !!d && typeof d.axis === 'object' && d.axis !== null && 'tiltDeg' in d.axis && typeof d.axis.tiltDeg === 'object'

/** First beat of the current deposit run (same bench topology + model, deposit not cleared, no sweep). */
function runStart(keys: readonly (LabState | null)[], beat: number, bench: number): number {
  const cur = keys[beat]
  if (!cur) return beat
  const sig = (s: LabState | null) => {
    const b = s?.benches[bench]
    return b ? `${b.source}|${!!b.showPrep}|${b.devices.length}|${b.devices.map((d) => d.keep ?? '').join('')}|${s!.model ?? 'quantum'}` : '-'
  }
  const me = sig(cur)
  let j = beat
  while (j > 0) {
    const p = keys[j - 1]
    if (!p || sig(p) !== me || p.deposit === 'clear' || p.benches[bench]?.devices.some(isSweep)) break
    j--
  }
  return j
}

/* ------------------------------------------------------------------------------------------------ */
/* The scene                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

export default function LabR3Scene({ keyframes, reveals }: SceneProps<'lab-r3'>) {
  const view = useView()
  useSharedEnv(LIGHT_RIG.env.lab)
  const cam = useMemo(() => new THREE.PerspectiveCamera(40, 1, 0.05, 150), [])
  useStageCamera(cam)
  const rig = useMemo<LabRig>(() => buildLabRig(), [])
  useEffect(() => () => disposeLabRig(rig), [rig])
  const root = useRef<THREE.Group>(null)

  // fog = the clear colour, distances follow the shot (so the floor fades into the stage, not into grey)
  useEffect(() => {
    const fog = new THREE.Fog(STAGE_BG['lab-r3'], 12, 40)
    view.scene.fog = fog
    return () => {
      if (view.scene.fog === fog) view.scene.fog = null
    }
  }, [view])

  // labels: a fixed superset; discrete text changes re-publish (rare: beat changes, axis renames)
  const [texts, setTexts] = useState<Record<string, string>>({})
  const textsRef = useRef(texts)
  const labels = useMemo(() => {
    const L = baseLabels()
    for (const [k, t] of Object.entries(texts)) if (L[k]) L[k] = { ...L[k], text: t }
    return L
  }, [texts])
  useStageLabels(labels)
  const items = useMemo(() => {
    const out: Record<string, LabelItem> = {}
    for (const name of Object.keys(baseLabels())) {
      if (name.startsWith('r')) continue // readouts are not anchored
      out[name] = {
        anchor: new THREE.Vector3(),
        alpha: 0,
        priority: name === 'gz' ? -2 : name === 'gy' ? -1 : priorityOf(name),
        screen: name === 'gx' || name === 'gy' || name === 'gz',
        fixed: name === 'gx' || name === 'gy' || name === 'gz',
        look: name.startsWith('g') && name.length === 2 ? 'gizmo' : name === 'badge' ? 'badge' : name.startsWith('win') ? 'window' : undefined,
      }
    }
    return out
  }, [])
  if (import.meta.env.DEV) (globalThis as { __labItems?: unknown }).__labItems = items
  const gizmoBox = useRef<Rect>([0, 0, 0, 0])
  useSceneLabels(items, root, () => [gizmoBox.current])
  const rCount = [useLabelKey('rCount0'), useLabelKey('rCount1')]
  const rBorn = [useLabelKey('rBorn0'), useLabelKey('rBorn1')]
  const rTheta = useLabelKey('rTheta')
  const rAvg = useLabelKey('rAvg')

  // per-frame scratch
  const S = useMemo(
    () => ({
      v: new THREE.Vector3(),
      w: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      depKey: ['', ''] as string[],
      ghostKey: ['', ''] as string[],
      captionTop: 0,
      captionRight: 0,
      frame: 0,
      lastFov: 0,
      lastOff: '',
      flows: [] as BenchFlow[],
    }),
    [],
  )

  useStageFrame<'lab-r3'>((f) => {
    const st = f.state
    const n = keyframes.length
    const smp = sampleBeats(f.u, n, f.motion)
    const beat = f.beat
    const beatObj = stage.units.get(f.unitId)?.beats[beat]
    const termAnchors = new Set<Anchor>()
    const terms = f.revealed ? { ...beatObj?.terms, ...beatObj?.reveal?.terms } : beatObj?.terms
    for (const t of Object.values(terms ?? {})) if (t.kind === 'lab-r3') termAnchors.add(t.anchor)
    const focus = f.focus

    // A bench reconfiguration that is not the beat's own change happens under a camera CUT (D §4.0):
    // then every transitional motion snaps at t = ½ instead of animating.
    const cut = !!f.from && f.t > 0 && f.t < 1 && reconfigCut(f.from, f.to)
    const t = cut ? (f.t < 0.5 ? 0 : 1) : f.t
    // discrete weights across the transition (W switches discrete fields at t = ½; D blends them)
    const wOf = (pred: (s: ResolvedLab) => boolean) => (f.from ? lerp(pred(f.from) ? 1 : 0, pred(f.to) ? 1 : 0, t) : pred(st) ? 1 : 0)
    const wClassical = wOf((s) => s.model === 'classical')
    const wBox = wOf((s) => s.model === 'black-box')
    const wHidden = wOf((s) => s.model === 'hidden-label')
    const gradient = f.from ? lerp(f.from.gradient, f.to.gradient, t) : st.gradient
    const dim = f.from ? lerp(f.from.dim, f.to.dim, t) : st.dim
    const inset = f.slot === 'inset'

    // streamlines: only on beats whose prose links the field (or while the field is uniform, b5a)
    const fieldOn = termAnchors.has('streamlines') || termAnchors.has('knife-edge') || focus === 'streamlines' || focus === 'knife-edge' ? 1 : 0
    const fieldAlpha = Math.max(fieldOn, 1 - gradient) * (focus === 'streamlines' || focus === 'knife-edge' ? 1 : 0.6)

    // unit-entry reveal (D §4.1 b1) + spoiler rule: a lab beat followed by a classical beat stops the beam
    // at the last magnet's exit, so the plate is not seen before the classical question is asked
    // (u 0 → 0.5: the first beat's hold ends at 0.65, so the beam reaches the plate inside that beat)
    const entry = keyframes[0] ? (f.motion ? smooth(f.u / 0.5) : 1) : 1
    const spoiler = (k: number) => {
      const cur = keyframes[k]
      const nxt = keyframes[k + 1]
      return !!cur && !!nxt && (cur.model ?? 'quantum') !== 'classical' && nxt.model === 'classical'
    }
    let toPlate = 1
    if (smp.a !== smp.b) toPlate = lerp(spoiler(smp.a) ? 0 : 1, spoiler(smp.b) ? 0 : 1, smp.t)
    else toPlate = spoiler(beat) ? 0 : 1

    /* ---------------- benches ---------------- */
    const benchCount = st.benches.length
    let flowIdx = 0
    S.flows.length = 0
    let firstLayout: BenchLayout | null = null
    let camFrom: BenchLayout | null = null
    let camTo: BenchLayout | null = null
    for (let b = 0; b < MAX_BENCHES; b++) {
      const br = rig.benches[b]
      const now = st.benches[b]
      if (!now) {
        br.group.visible = false
        continue
      }
      br.group.visible = true
      // two benches stack as panes: A on a shelf above B; each casts its shadows on its own floor
      const floorZ = FLOOR_Z + (benchCount === 2 ? (b === 0 ? LAB.benchDz : -LAB.benchDz) : 0)
      const fromB = f.from?.benches[b]
      const toB = f.to.benches[b] ?? now
      const topoChange = !!f.from && !!fromB && topoKey(fromB) !== topoKey(toB) && t > 0 && t < 1
      const Lnow = layoutOf(now, benchCount, b)
      const Lt = topoChange ? layoutOf(toB, benchCount, b) : Lnow
      const Lf = topoChange && fromB ? layoutOf(fromB, f.from!.benches.length, b) : Lnow
      if (b === 0) {
        firstLayout = Lt
        camFrom = f.from?.benches[0] ? layoutOf(f.from.benches[0], f.from.benches.length, 0) : Lnow
        camTo = layoutOf(f.to.benches[0] ?? now, f.to.benches.length, 0)
      }

      // modules: persistent (lerp), entering (slide in from −x), leaving (slide out along −x)
      const used: boolean[] = []
      const place = (mr: ModuleRig, frame: THREE.Matrix4, alpha: number, center: THREE.Vector3) => {
        mr.group.visible = alpha > 0.01
        mr.group.matrix.copy(frame)
        mr.group.matrixWorldNeedsUpdate = true
        setModuleLook(mr, alpha, gradient, wBox, fieldAlpha, focus === 'gradient-arrow')
        mr.shadow.visible = mr.group.visible
        mr.shadow.position.set(center.x, center.y, floorZ + 0.004)
        mr.shadow.scale.set(3.0, 4.2, 1)
        ;(mr.shadow.material as THREE.MeshBasicMaterial).opacity = 0.45 * alpha * (1 - 0.5 * dim)
      }
      const slide = (frame: THREE.Matrix4, dx: number) => S.m.makeTranslation(dx, 0, 0).multiply(frame)
      let slot = 0
      if (!topoChange) {
        Lnow.modules.forEach((m, k) => {
          place(br.modules[slot++], m.tilted, 1, m.center)
          used[k] = true
        })
      } else {
        const match = matchModules(fromB!.tilts, toB.tilts)
        const kept = new Set(match.filter((i) => i >= 0))
        Lt.modules.forEach((m, j) => {
          const i = match[j]
          const mr = br.modules[slot++]
          if (i >= 0) {
            const fm = lerpFrame(Lf.modules[i].tilted, m.tilted, t, new THREE.Matrix4())
            place(mr, fm, 1, S.v.setFromMatrixPosition(fm).clone())
          } else {
            const fm = slide(m.tilted, -3 * (1 - t)).clone()
            place(mr, fm, smooth(t * 1.4), S.v.setFromMatrixPosition(fm).clone())
          }
        })
        Lf.modules.forEach((m, i) => {
          if (kept.has(i) || slot >= MAX_DEVICES) return
          const fm = slide(m.tilted, -3 * t).clone()
          place(br.modules[slot++], fm, 1 - smooth(t * 1.4), S.v.setFromMatrixPosition(fm).clone())
        })
      }
      for (; slot < MAX_DEVICES; slot++) {
        br.modules[slot].group.visible = false
        br.modules[slot].shadow.visible = false
      }

      // prep module (greyed) + its stop
      const prepL = (topoChange && t < 0.5 ? Lf : Lt).prep
      br.prep.group.visible = !!prepL
      br.prep.shadow.visible = !!prepL
      br.prepStop.group.visible = !!prepL
      if (prepL) {
        br.prep.group.matrix.copy(prepL.tilted)
        br.prep.group.matrixWorldNeedsUpdate = true
        setModuleLook(br.prep, 1, 1, 0, 0, false)
        br.prep.shadow.position.set(prepL.center.x, prepL.center.y, floorZ + 0.004)
        br.prep.shadow.scale.set(3.0, 4.2, 1)
        const ps = (topoChange && t < 0.5 ? Lf : Lt).prepStop!
        br.prepStop.group.matrix.copy(ps.m)
        br.prepStop.group.matrixWorldNeedsUpdate = true
      }

      // stops (+ side plates for openOther)
      const stopsT = Lt.stops
      for (let k = 0; k < MAX_DEVICES - 1; k++) {
        const sr = br.stops[k]
        const s = stopsT[k]
        if (!s) {
          sr.group.visible = false
          continue
        }
        let alpha = 1
        let mat = s.m
        if (topoChange) {
          const i = matchModules(fromB!.tilts, toB.tilts)[k]
          const fs = i >= 0 ? Lf.stops[i] : undefined
          if (fs) mat = lerpFrame(fs.m, s.m, t, new THREE.Matrix4())
          else {
            mat = slide(s.m, -1.5 * (1 - t)).clone()
            alpha = smooth(t * 1.4)
          }
        }
        sr.group.visible = alpha > 0.01
        sr.group.matrix.copy(mat)
        sr.group.matrixWorldNeedsUpdate = true
        sr.mat.opacity = alpha
        sr.face.opacity = alpha
        sr.small.visible = s.open
        sr.group.children[0].visible = !s.open
        sr.group.children[1].visible = !s.open
      }

      // oven, pedestal, slit, rail follow the (current) first module
      const L0 = topoChange && t < 0.5 ? Lf : Lt
      const first = L0.prep ?? L0.modules[0]
      br.oven.position.copy(L0.oven)
      br.oven.quaternion.setFromRotationMatrix(S.m.extractRotation(first.base))
      br.ovenShadow.position.set(L0.oven.x, L0.oven.y - 0.5, floorZ + 0.004)
      br.ovenShadow.scale.set(1.4, 1.8, 1)
      S.v.set(0, -LAB.slitGap, 0).applyMatrix4(first.base)
      br.slit.position.copy(S.v)
      br.slit.quaternion.copy(br.oven.quaternion)
      const railLen = L0.oven.distanceTo(Lt.plateCenter) + 1.5
      br.rail.position.set(0, (L0.oven.y + Lt.plateCenter.y) / 2, floorZ + 0.08)
      br.rail.scale.set(1, railLen, 1)

      // plates: the new one appears; an old one slides aside (+x 1.2 u) and stays readable at 35 %
      const lastTilt = (m: BenchLayout) => m.modules[m.modules.length - 1].tilt
      const pPlusOf = (bb: ResolvedBench) => {
        const s = bb.theory.plus + bb.theory.minus
        return s > 0 ? bb.theory.plus / s : 0.5
      }
      const kfAt = (k: number): LabState | null => (k === beat && f.revealed ? reveals[k] : null) ?? keyframes[k] ?? null
      /** Deposit size of beat k at hold s (D §4.0): scroll-bound growth, persistent runs, rolling sweeps, batches. */
      const countFor = (k: number, s: number): number => {
        const kf = kfAt(k)
        const bk = kf?.benches[b]
        if (!kf || !bk || spoiler(k)) return 0
        if (kf.batches?.length) return Math.min(DEPOSIT_MAX, kf.batches[Math.min(kf.batches.length - 1, Math.floor(clamp01(s) * kf.batches.length))])
        if (kf.deposit === 'clear') return 0
        if (bk.devices.some(isSweep)) return ROLLING
        if (kf.deposit === 'hold' || runStart(keyframes, k, b) < k) return DEPOSIT_MAX
        return Math.round(DEPOSIT_MAX * clamp01(s))
      }
      const cur = kfAt(beat)
      let count: number
      if (topoChange) count = Math.round(countFor(smp.b, 0) * smooth(t))
      else if (smp.a !== smp.b) count = Math.round(lerp(countFor(smp.a, 1), countFor(smp.b, 0), t))
      else count = countFor(beat, f.hold)
      // nothing lands before the unit-entry beam front has reached the plate
      count = Math.round(count * clamp01((entry - 0.9) / 0.1))
      const plateAlpha = topoChange ? smooth(t) : 1
      updatePlate(br.plate, Lt.plate, lastTilt(Lt), plateAlpha, count, pPlusOf(topoChange ? toB : now), gradient, wClassical, st.ghostBand, S, b, 'depKey', focus === 'ghost-band', floorZ)
      // centroid overlay (readouts 'centroid'): m̂, n̂, the drop-line m̂ → n̂ and the tick at the average of
      // the ±1 readings, (plus − minus)/(plus + minus) — the engine's fractions, drawn at SPOT scale
      {
        const cOn = b === 0 && !inset && wOf((s) => s.readouts.includes('centroid')) > 0.01 ? wOf((s) => s.readouts.includes('centroid')) : 0
        const c = br.plate.centroid
        const tau = lastTilt(Lt)
        for (const m of c.mats) m.opacity = cOn * plateAlpha * (focus === 'centroid' || focus === 'drop-line' ? 1 : 0.9)
        c.mArrow.visible = c.nArrow.visible = c.tick.visible = c.drop.visible = cOn > 0.01
        const bb = topoChange ? toB : now
        const tot = bb.theory.plus + bb.theory.minus
        c.tick.position.z = tot > 0 ? ((bb.theory.plus - bb.theory.minus) / tot) * SPOT : 0
        const pz = Math.cos(tau) * SPOT
        c.drop.geometry.setFromPoints([new THREE.Vector3(0, -0.06, SPOT), new THREE.Vector3(pz * Math.sin(tau), -0.06, pz * Math.cos(tau))])
        c.drop.computeLineDistances()
        items.mHat.alpha = items.nHat.alpha = b === 0 ? cOn : items.mHat.alpha
        if (b === 0) {
          items.mHat.anchor.set(0, -0.06, 1.08).applyMatrix4(Lt.plate)
          items.nHat.anchor.set(1.08 * Math.sin(tau), -0.06, 1.08 * Math.cos(tau)).applyMatrix4(Lt.plate)
          items.mHat.focus = focus === 'axis-m' || focus === 'z-axis'
          items.nHat.focus = focus === 'axis-n' || focus === 'gradient-arrow'
        }
      }
      // the previous plate: sliding aside during the change, then parked at 35 % for the next beat
      const prevK = beat > 0 ? keyframes[beat - 1] : null
      const prevB = prevK?.benches[b]
      if (topoChange && fromB) {
        const gm = S.m.makeTranslation(GHOST_DX * t, 0, 0).multiply(Lf.plate).clone()
        updatePlate(br.ghost, gm, lastTilt(Lf), 1 - 0.65 * smooth(t), countFor(smp.a, 1), pPlusOf(fromB), 1, 0, 0, S, b, 'ghostKey', false, floorZ)
      } else if (prevK && prevB && smp.a === smp.b && prevB.devices.length !== now.tilts.length) {
        const pr = resolve(prevK, 1) as ResolvedLab
        const pb = pr.benches[b]
        const pl = layoutOf(pb, pr.benches.length, b)
        const gm = S.m.makeTranslation(GHOST_DX, 0, 0).multiply(pl.plate).clone()
        updatePlate(br.ghost, gm, lastTilt(pl), 0.35, countFor(beat - 1, 1), pPlusOf(pb), 1, 0, 0, S, b, 'ghostKey', false, floorZ)
      } else {
        br.ghost.group.visible = false
        br.ghost.shadow.visible = false
      }

      // protractor on a tilt device (l1-average): ring + ticks at the module entrance, arc z → n̂
      const tiltK = (cur?.benches[b]?.devices ?? []).findIndex(isTiltDevice)
      const protoOn = tiltK >= 0 && !inset ? 1 : 0
      const protoAlpha = f.from && smp.a !== smp.b ? lerp(protoOnFor(keyframes[smp.a], b), protoOnFor(keyframes[smp.b], b), t) : protoOn
      const pm = Lt.modules[Math.max(0, tiltK)] ?? Lt.modules[0]
      updateProtractor(br, pm, protoAlpha)

      // atoms for this bench; a bench authored with `fires: false` (W1, additive) draws none
      const firesOf = (k: number) => ((kfAt(k)?.benches[b] as { fires?: boolean } | undefined)?.fires === false ? 0 : 1)
      const firing = smp.a !== smp.b ? lerp(firesOf(smp.a), firesOf(smp.b), t) : firesOf(beat)
      const Lflow = topoChange ? (t < 0.5 ? Lf : Lt) : Lnow
      const bFlow = topoChange ? (t < 0.5 ? fromB! : toB) : now
      const per = Math.floor(ATOMS / benchCount)
      S.flows.push({
        layout: Lflow,
        theory: bFlow.theory,
        keep: bFlow.keep.map((k) => (k === '-' ? -1 : 1)),
        sourceSign: bFlow.source === 'oven' ? 0 : bFlow.source[0] === '-' ? -1 : 1,
        i0: flowIdx,
        i1: flowIdx + per,
        front: entry,
        toPlate: toPlate > 0.5,
        alpha: (topoChange ? Math.abs(2 * t - 1) : 1) * (st.flow === 'off' ? 0 : 1) * (1 - 0.5 * dim) * firing,
      })
      flowIdx += per

      // ---- labels for this bench ----
      labelBench(items, b, Lt, topoChange ? toB : now, st, {
        count,
        inset,
        wBox,
        benchCount,
        focus,
        terms: termAnchors,
        showFractions: st.readouts.includes('fractions'),
        showBlocked: st.readouts.includes('blocked'),
      })
      // readout: the plate's own tally (sample) next to the exact Born value (engine)
      const bb = topoChange ? toB : now
      // no ± tally without a split (uniform field) or for the classical overlay (no outcomes claimed)
      // (in a split pane the readout column belongs to the pair: the lab keeps only θ there)
      const paned = f.slot === 'top' || f.slot === 'bottom'
      if (count > 0 && toPlate > 0.5 && !inset && !paned && gradient > 0.5 && wClassical < 0.5) {
        const plus = S.depKey[b] ? Number(S.depKey[b].split('#')[1] ?? 0) : 0
        const minus = count - plus
        const born = pPlusOf(bb)
        const pre = benchCount === 2 ? `${b === 0 ? 'z-first' : 'x-first'} · ` : ''
        writeReadout(rCount[b], `${pre}+ ${plus} · − ${minus}`)
        writeReadout(rBorn[b], `${((100 * plus) / Math.max(1, count)).toFixed(1)}% + · Born ${(100 * born).toFixed(1)}%`)
      } else {
        writeReadout(rCount[b], '')
        writeReadout(rBorn[b], '')
      }
    }
    for (let b = benchCount; b < MAX_BENCHES; b++) {
      writeReadout(rCount[b], '')
      writeReadout(rBorn[b], '')
    }
    rig.floor.position.set(0, firstLayout ? firstLayout.mid.y : 0, FLOOR_Z - (benchCount === 2 ? LAB.benchDz : 0))
    rig.floor.scale.set(80, 120, 1)

    // θ readout on tilt beats; average readout on 'centroid' / 'fill-bar' beats (engine fractions only)
    const b0 = st.benches[0]
    const tiltBeat = (keyframes[beat]?.benches[0]?.devices ?? []).some(isTiltDevice)
    const lastT = b0.tilts[b0.tilts.length - 1]
    writeReadout(rTheta, tiltBeat && !inset ? `θ = ${((lastT * 180) / Math.PI).toFixed(0)}°` : '')
    if (st.readouts.includes('fill-bar') || st.readouts.includes('centroid')) {
      const s = b0.theory.plus + b0.theory.minus
      const p = s > 0 ? b0.theory.plus / s : 0
      writeReadout(rAvg, st.readouts.includes('fill-bar') ? `P(+) = ${p.toFixed(3)} · 2P(+) − 1 = ${(2 * p - 1).toFixed(3)}` : `⟨σₙ⟩ = ${(2 * p - 1).toFixed(3)}`)
    } else writeReadout(rAvg, '')

    /* ---------------- atoms ---------------- */
    const clock = f.clock
    const single = st.flow === 'single'
    updateAtoms(rig.seeds, S.flows, { clock, classical: wClassical, gradient, tracked: single ? TRACKED : -1, others: 0.25, speed: single ? 0.9 : 1.6 }, rig.atoms.pos.array as Float32Array, rig.atoms.col.array as Float32Array, rig.atoms.glow.array as Float32Array)
    rig.atoms.pos.needsUpdate = true
    rig.atoms.col.needsUpdate = true
    rig.atoms.glow.needsUpdate = true
    rig.atoms.material.uniforms.uOpacity.value = 1 - 0.92 * wClassical
    updateCapsules(rig, wClassical, S)
    updateSpecimen(rig, items, firstLayout, wClassical)
    updateGlints(rig, 1 - gradient, clock, f.motion)

    /* ---------------- camera ---------------- */
    const size = f.size
    const aspect = size.h > 0 ? size.w / size.h : 1
    const shotOf = (s: ResolvedLab): LabShot => s.shot ?? 'L-EST'
    const slotTo: ViewSlot | null = f.slot
    const pTo = shotPose(shotOf(f.to), camTo ?? firstLayout!, slotTo, size, f.to.benches.length)
    let pose: Pose = pTo
    if (f.from && t > 0 && t < 1) {
      const pFrom = shotPose(shotOf(f.from), camFrom ?? firstLayout!, slotTo, size, f.from.benches.length)
      if (cut || lensNeedsCut(pFrom.lens, pTo.lens) || !f.motion) pose = t < 0.5 ? pFrom : pTo
      else
        pose = {
          pos: pFrom.pos.clone().lerp(pTo.pos, t),
          target: pFrom.target.clone().lerp(pTo.target, t),
          lens: lerp(pFrom.lens, pTo.lens, t),
        }
    }
    cam.position.copy(physToThree(pose.pos.x, pose.pos.y, pose.pos.z))
    cam.up.set(0, 1, 0)
    cam.lookAt(physToThree(pose.target.x, pose.target.y, pose.target.z))
    const fov = hfovToVfov(lensHfov(pose.lens), aspect)
    // framing safe area (D §1.6): the subject sits between the passport (top) and the caption band (bottom)
    const dy = slotTo === 'top' ? -18 : slotTo === 'bottom' ? 8 : slotTo === 'inset' ? 0 : 30
    const offKey = `${size.w}|${size.h}|${dy}`
    if (Math.abs(fov - S.lastFov) > 1e-4 || offKey !== S.lastOff || Math.abs(cam.aspect - aspect) > 1e-4) {
      cam.fov = fov
      cam.aspect = aspect
      if (size.w > 0 && size.h > 0) cam.setViewOffset(size.w, size.h, 0, dy, size.w, size.h)
      cam.updateProjectionMatrix()
      S.lastFov = fov
      S.lastOff = offKey
    }
    cam.updateMatrixWorld()
    // a magnet the camera sits in (or brushes past) is ghosted so it never fills the frame (tilted modules
    // turn their yoke into side shots; the fit pull-back can land inside an upstream module)
    for (const br of rig.benches) if (br.group.visible) for (const mr of [br.prep, ...br.modules]) if (mr.group.visible) ghostNearCamera(mr, pose.pos)
    // end-on shots read the tilt as a clock hand (pole pair + gradient arrow): the C-yoke is ghosted there
    const endOn = (f.to.shot ?? 'L-EST') === 'L-END' ? (f.from && (f.from.shot ?? 'L-EST') !== 'L-END' ? t : 1) : f.from?.shot === 'L-END' ? 1 - t : 0
    if (endOn > 0.01)
      for (const br of rig.benches)
        for (const mr of br.modules) {
          mr.mats.yoke.transparent = true
          mr.mats.yoke.depthWrite = false
          mr.mats.yoke.opacity = Math.min(mr.mats.yoke.opacity, 1 - 0.72 * endOn)
        }
    // atom screen-size clamp (≤ 6 px diameter) needs CSS px per world unit at distance 1
    rig.atoms.material.uniforms.uPxPerUnit.value = size.h / 2 / Math.tan((fov * Math.PI) / 360)
    const d = pose.pos.distanceTo(pose.target)
    const fog = view.scene.fog as THREE.Fog | null
    if (fog) {
      fog.near = d * 1.25 + 3
      fog.far = d * 2.6 + 14
      fog.color.set(inset ? STAGE_BG.inset : STAGE_BG['lab-r3'])
    }
    // lights dim with the benches (l1-logic:b4) — the DOM tallies carry that beat
    ;(rig.lights[0] as THREE.DirectionalLight).intensity = LIGHT_RIG.key.intensity * (1 - 0.5 * dim)
    ;(rig.lights[1] as THREE.DirectionalLight).intensity = LIGHT_RIG.rim.intensity.lab * (1 - 0.5 * dim)

    /* ---------------- global labels ---------------- */
    labelGlobal(items, rig, f, st, {
      inset,
      wClassical,
      wHidden,
      gradient,
      terms: termAnchors,
      focus,
      protractor: rig.benches[0].protractor,
      tiltBeat,
      lastTilt: lastT,
      layout: firstLayout,
      caption: ((f.revealed && beatObj?.reveal?.caption) || beatObj?.caption || '').toLowerCase(),
    })
    placeGizmo(items, cam, size, gizmoBox, S, view.unitId, inset)

    // discrete text changes → one React publish
    const next = computeTexts(st, wBox, rig)
    let changed = false
    for (const k of Object.keys(next)) if (textsRef.current[k] !== next[k]) changed = true
    if (changed) {
      textsRef.current = next
      setTexts(next)
    }
  })

  return (
    <group>
      <primitive object={rig.root} ref={root} />
      <DevMeasure />
    </group>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Per-object updates                                                                                */
/* ------------------------------------------------------------------------------------------------ */

function protoOnFor(k: LabState | null | undefined, b: number): number {
  return (k?.benches[b]?.devices ?? []).some(isTiltDevice) ? 1 : 0
}

const _inv = new THREE.Matrix4()
const _cl = new THREE.Vector3()
/** Module-local box (poles, yoke, arms) expanded by a margin; fade the module when the camera is near it. */
function ghostNearCamera(mr: ModuleRig, camPhys: THREE.Vector3) {
  _cl.copy(camPhys).applyMatrix4(_inv.copy(mr.group.matrix).invert())
  const dx = Math.max(0, -1.8 - _cl.x, _cl.x - 1.2)
  const dy = Math.max(0, -0.3 - _cl.y, _cl.y - (LAB.L + 0.3))
  const dz = Math.max(0, -2.25 - _cl.z, _cl.z - 2.25)
  const d = Math.hypot(dx, dy, dz)
  if (d >= 0.8) return
  const g = 0.08 + 0.92 * smooth(d / 0.8)
  for (const m of [mr.mats.pole, mr.mats.yoke, mr.mats.arrow] as THREE.Material[]) {
    m.transparent = true
    m.depthWrite = false
    m.opacity = Math.min(m.opacity, g)
  }
  mr.mats.box.opacity = Math.min(mr.mats.box.opacity, g)
}

function setModuleLook(mr: ModuleRig, alpha: number, gradient: number, wBox: number, field: number, focusArrow: boolean) {
  const fade = alpha < 0.999
  const magnetAlpha = alpha // the magnet stays solid; the black box covers it
  for (const m of [mr.mats.pole, mr.mats.yoke] as THREE.Material[]) {
    m.transparent = fade
    m.opacity = magnetAlpha
    m.depthWrite = !fade
  }
  mr.knife.morphTargetInfluences![0] = 1 - gradient
  mr.groove.morphTargetInfluences![0] = 1 - gradient
  mr.knife.visible = mr.groove.visible = mr.yoke.visible = wBox < 0.98
  mr.box.visible = wBox > 0.01
  mr.mats.box.opacity = smooth(wBox) * alpha
  ;((mr.box.userData.edges as THREE.LineSegments).material as THREE.LineBasicMaterial).opacity = 0.9 * smooth(wBox) * alpha
  mr.mats.box.transparent = wBox < 0.999 || fade
  mr.arrow.visible = wBox < 0.5
  mr.mats.arrow.color.set(focusArrow ? '#dfe5ee' : INK.silver)
  const gm = mr.fieldGrad.userData.mat as THREE.MeshBasicMaterial
  const um = mr.fieldUni.userData.mat as THREE.MeshBasicMaterial
  gm.opacity = field * gradient * alpha * (1 - wBox)
  um.opacity = field * (1 - gradient) * alpha * (1 - wBox)
  mr.fieldGrad.visible = gm.opacity > 0.01
  mr.fieldUni.visible = um.opacity > 0.01
}

function updatePlate(
  pr: PlateRig,
  frame: THREE.Matrix4,
  tilt: number,
  alpha: number,
  count: number,
  pPlus: number,
  gradient: number,
  classical: number,
  band: number,
  S: { depKey: string[]; ghostKey: string[] },
  b: number,
  keyName: 'depKey' | 'ghostKey',
  bandFocus: boolean,
  floorZ: number,
) {
  pr.group.visible = alpha > 0.01
  pr.shadow.visible = pr.group.visible
  pr.group.matrix.copy(frame)
  pr.group.matrixWorldNeedsUpdate = true
  pr.pattern.rotation.set(0, tilt, 0)
  pr.glassMat.opacity = 0.16 * alpha
  pr.frameMat.opacity = alpha
  pr.frameMat.transparent = alpha < 0.999
  const c = new THREE.Vector3().setFromMatrixPosition(frame)
  pr.shadow.position.set(c.x, c.y, floorZ + 0.004)
  pr.shadow.scale.set(2.6, 1.0, 1)
  ;(pr.shadow.material as THREE.MeshBasicMaterial).opacity = 0.35 * alpha
  pr.deposit.material.uniforms.uOpacity.value = alpha
  pr.bandMat.opacity = Math.min(1, band * (bandFocus ? 1 : 0.85)) * alpha
  pr.band.visible = pr.bandMat.opacity > 0.01
  // deposit points: recompute only when an input changed (a count step, pPlus, morph)
  const key = `${count}|${pPlus.toFixed(5)}|${gradient.toFixed(3)}|${classical.toFixed(3)}`
  const prev = S[keyName][b]
  if (prev && prev.split('#')[0] === key) return
  const plus = depositPoints(pr.seeds, count, { pPlus, gradient, classical }, pr.pts)
  const off = pr.deposit.off.array as Float32Array
  const col = pr.deposit.col.array as Float32Array
  for (let i = 0; i < count; i++) {
    off[i * 2] = pr.pts[i * 3]
    off[i * 2 + 1] = pr.pts[i * 3 + 1]
    const s = pr.pts[i * 3 + 2]
    ;(s > 0 ? C_PLUS : s < 0 ? C_MINUS : C_UNPOL).toArray(col, i * 3)
  }
  pr.deposit.off.needsUpdate = true
  pr.deposit.col.needsUpdate = true
  ;(pr.deposit.mesh.geometry as THREE.InstancedBufferGeometry).instanceCount = count
  S[keyName][b] = `${key}#${plus}`
}

function updateProtractor(br: BenchRig, m: ModuleFrame, alpha: number) {
  const p = br.protractor
  p.visible = alpha > 0.01
  if (!p.visible) return
  p.matrix.copy(m.base)
  p.matrixWorldNeedsUpdate = true
  for (const mat of p.userData.mats as THREE.Material[]) mat.opacity = alpha
  // arc z → n̂ in the entrance plane (radius 1.1)
  const arr = br.protractorArc.geometry.getAttribute('position') as THREE.BufferAttribute
  const N = arr.count
  for (let i = 0; i < N; i++) {
    const a = (m.tilt * i) / (N - 1)
    arr.setXYZ(i, 1.1 * Math.sin(a), 0, 1.1 * Math.cos(a))
  }
  arr.needsUpdate = true
}

const _mm = new THREE.Matrix4()
const _qq = new THREE.Quaternion()
const _up = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _pp = new THREE.Vector3()
const _sc = new THREE.Vector3()
function updateCapsules(rig: LabRig, w: number, _S: unknown) {
  const caps = rig.capsules
  if (w < 0.01) {
    caps.count = 0
    return
  }
  caps.count = ATOMS
  const pos = rig.atoms.pos.array as Float32Array
  const col = rig.atoms.col.array as Float32Array
  ;(caps.material as THREE.MeshStandardMaterial).opacity = w
  for (let i = 0; i < ATOMS; i++) {
    const a = col[i * 4 + 3]
    const c = rig.seeds.cos[i]
    const s = Math.sqrt(Math.max(0, 1 - c * c))
    _dir.set(s * Math.cos(rig.seeds.az[i]), s * Math.sin(rig.seeds.az[i]), c)
    _qq.setFromUnitVectors(_up, _dir)
    _pp.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
    const k = a > 0.05 ? 1 : 0
    _sc.set(k, k, k)
    _mm.compose(_pp, _qq, _sc)
    caps.setMatrixAt(i, _mm)
  }
  caps.instanceMatrix.needsUpdate = true
}

function updateSpecimen(rig: LabRig, items: Record<string, LabelItem>, L: BenchLayout | null, w: number) {
  const sp = rig.specimen
  sp.visible = w > 0.01 && !!L
  items.thetaMu.alpha = 0
  items.muCos.alpha = 0
  if (!sp.visible || !L) return
  const m = L.modules[L.modules.length - 1]
  // frozen specimen between the magnet exit and the plate, beside the beam (+x), moment at θ_μ = 50°
  const c = beamPoint(m, LAB.L + 1.0, 0, new THREE.Vector3()).add(new THREE.Vector3(0.55, 0, 0.3))
  sp.position.copy(c)
  const th = (50 * Math.PI) / 180
  const dir = new THREE.Vector3(Math.sin(th), 0, Math.cos(th))
  const u = sp.userData as { caps: THREE.Mesh; arc: THREE.Line; drop: THREE.Line; zAxis: THREE.Line }
  u.caps.quaternion.setFromUnitVectors(_up, dir)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 24; i++) {
    const a = (th * i) / 24
    pts.push(new THREE.Vector3(0.24 * Math.sin(a), 0, 0.24 * Math.cos(a)))
  }
  u.arc.geometry.setFromPoints(pts)
  const tip = dir.clone().multiplyScalar(0.2)
  u.drop.geometry.setFromPoints([tip, new THREE.Vector3(0, 0, tip.z)])
  u.drop.computeLineDistances()
  for (const o of [u.caps, u.arc, u.drop, u.zAxis]) ((o as THREE.Mesh).material as THREE.Material).opacity = w
  items.thetaMu.anchor.copy(c).add(new THREE.Vector3(0.26 * Math.sin(th / 2) + 0.06, 0, 0.26 * Math.cos(th / 2) + 0.06))
  items.thetaMu.alpha = w
  items.muCos.anchor.copy(c).add(new THREE.Vector3(0.1, 0, tip.z + 0.07))
  items.muCos.alpha = w
}

function updateGlints(rig: LabRig, w: number, clock: number, motion: boolean) {
  const g = rig.glints
  if (w < 0.01) {
    g.count = 0
    return
  }
  g.count = 24
  ;(g.material as THREE.MeshBasicMaterial).opacity = 0.8 * w
  const pos = rig.atoms.pos.array as Float32Array
  const col = rig.atoms.col.array as Float32Array
  for (let i = 0; i < 24; i++) {
    const a = 40 + i * 83
    _pp.set(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2])
    const vis = col[a * 4 + 3] > 0.05 ? 1 : 0
    // precession about z: 1 rev/s in full motion, frozen otherwise
    _qq.setFromAxisAngle(new THREE.Vector3(0, 0, 1), motion ? clock * Math.PI * 2 : 0.6)
    _qq.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.2))
    _sc.setScalar(vis)
    _mm.compose(_pp, _qq, _sc)
    g.setMatrixAt(i, _mm)
  }
  g.instanceMatrix.needsUpdate = true
}

/* ------------------------------------------------------------------------------------------------ */
/* Labels                                                                                            */
/* ------------------------------------------------------------------------------------------------ */

interface BenchLabelOpts {
  count: number
  inset: boolean
  wBox: number
  benchCount: number
  focus: Anchor | null
  terms: Set<Anchor>
  showFractions: boolean
  showBlocked: boolean
}

const _a = new THREE.Vector3()
function labelBench(items: Record<string, LabelItem>, b: number, L: BenchLayout, bench: ResolvedBench, st: ResolvedLab, o: BenchLabelOpts) {
  const on = (x: boolean) => (x && !o.inset ? 1 : 0)
  const n = L.modules.length
  // bench tag (two panes)
  items[`bench${b}`].alpha = on(o.benchCount === 2)
  items[`bench${b}`].anchor.copy(L.oven).add(_a.set(0, -0.6, 1.0))
  // callouts
  if (b === 0) {
    items.oven.alpha = on(true)
    items.oven.anchor.copy(L.oven).add(_a.set(0, -0.5, 0.75))
  }
  for (let k = 0; k < MAX_DEVICES; k++) {
    const m = L.modules[k]
    const mag = items[`mag${b}${k}`]
    const ax = items[`ax${b}${k}`]
    const chip = items[`chip${b}${k}`]
    const frac = items[`frac${b}${k}`]
    if (!m) {
      mag.alpha = ax.alpha = chip.alpha = frac.alpha = 0
      continue
    }
    mag.alpha = on(o.wBox < 0.5 && n <= 3)
    mag.anchor.set(0, LAB.L / 2, 2.25).applyMatrix4(m.base)
    // gradient-axis arrow label at the arrow tip (turns with the module)
    ax.alpha = on(o.wBox < 0.5)
    ax.anchor.set(-1.555, LAB.L / 2, 0.62).applyMatrix4(m.tilted)
    ax.focus = o.focus === 'gradient-arrow' || o.focus === 'z-axis'
    // state chips: chips[k] labels the beam entering module k (k = 0: the source, if it is a ket)
    const c = bench.chips[k]
    const hasChip = c !== undefined && c !== 'oven' && (k > 0 || bench.source !== 'oven')
    chip.alpha = on(hasChip)
    if (hasChip) {
      const prev = k === 0 ? null : L.modules[k - 1]
      const beamAt = prev ? beamPoint(prev, LAB.L + (LAB.spacing - LAB.L) / 2, bench.keep[k - 1] === '-' ? -1 : 1, new THREE.Vector3()) : new THREE.Vector3(0, -1.1, 0).applyMatrix4(m.base)
      chip.leaderAnchor = beamAt.clone()
      chip.anchor.copy(beamAt).add(_a.set(0, 0, 0.75))
      chip.focus = o.focus === `chip-${k}`
    }
    // segment fractions (readouts: 'fractions')
    frac.alpha = on(o.showFractions)
    if (o.showFractions) {
      frac.anchor.copy(k === 0 ? new THREE.Vector3(0, -1.0, 0).applyMatrix4(m.base) : beamPoint(L.modules[k - 1], LAB.L + 1.3, bench.keep[k - 1] === '-' ? -1 : 1, new THREE.Vector3())).add(_a.set(0, 0, -0.45))
    }
  }
  for (let k = 0; k < MAX_DEVICES - 1; k++) {
    const s = L.stops[k]
    const it = items[`stop${b}${k}`]
    it.alpha = on(!!s && (o.terms.has('beam-stop') || o.focus === 'beam-stop' || o.showBlocked))
    if (s) it.anchor.copy(s.pos).add(_a.set(0.3, 0.1, -0.35))
    it.focus = o.focus === 'beam-stop'
  }
  // plate + spot labels
  const pl = items[`plate${b}`]
  pl.alpha = on(true)
  pl.anchor.set(0, 0, 1.45).applyMatrix4(L.plate)
  const tilt = L.modules[n - 1].tilt
  // end-on shots look down the beam: the plate hides behind the magnet, so its spots are not labelled
  const spotOn = o.count > 30 && st.gradient > 0.5 && st.model !== 'classical' && st.shot !== 'L-END'
  const sp = items[`sp${b}`]
  const sm = items[`sm${b}`]
  sp.alpha = sm.alpha = on(spotOn)
  sp.anchor.set(0.62 * Math.cos(tilt) + SPOT * Math.sin(tilt), -0.05, -0.62 * Math.sin(tilt) + SPOT * Math.cos(tilt)).applyMatrix4(L.plate)
  sm.anchor.set(0.62 * Math.cos(tilt) - SPOT * Math.sin(tilt), -0.05, -0.62 * Math.sin(tilt) - SPOT * Math.cos(tilt)).applyMatrix4(L.plate)
  sp.focus = o.focus === 'spot-plus'
  sm.focus = o.focus === 'spot-minus'
  // black-box windows on the last module's exit face
  const lm = L.modules[n - 1]
  if (b === 0) {
    items.winP.alpha = items.winM.alpha = on(o.wBox > 0.5)
    items.winP.anchor.set(0, LAB.L + 0.02, 0.55).applyMatrix4(lm.tilted)
    items.winM.anchor.set(0, LAB.L + 0.02, -0.55).applyMatrix4(lm.tilted)
    items.winP.focus = items.winM.focus = o.focus === 'box-readout'
  }
}

interface GlobalLabelOpts {
  inset: boolean
  wClassical: number
  wHidden: number
  gradient: number
  terms: Set<Anchor>
  focus: Anchor | null
  protractor: THREE.Group
  tiltBeat: boolean
  lastTilt: number
  layout: BenchLayout | null
  /** The beat's caption (lower case): a badge that repeats it is not drawn twice. */
  caption: string
}

function labelGlobal(items: Record<string, LabelItem>, rig: LabRig, f: StageFrame<'lab-r3'>, st: ResolvedLab, o: GlobalLabelOpts) {
  const L = o.layout
  const on = (x: number) => (o.inset ? 0 : x)
  // badge: classical / uniform / hypothesis (one at a time)
  const badge = items.badge
  const wUni = 1 - o.gradient
  const said = (k: string) => o.caption.includes(k)
  const wBadge = Math.max(said('classical model') ? 0 : o.wClassical, said('uniform field') ? 0 : wUni, said('hypothesis') ? 0 : o.wHidden)
  badge.alpha = on(wBadge)
  if (L) badge.anchor.set(0, 0, 1.75).applyMatrix4(L.plate)
  if (L && wUni > o.wClassical && wUni > o.wHidden) badge.anchor.copy(L.modules[0].center).add(_a.set(0, 0, 2.5))
  // ghost band ends −μ … +μ
  const band = st.ghostBand
  items.bandMinus.alpha = items.bandPlus.alpha = on(band > 0.5 ? band : 0)
  if (L) {
    const tilt = L.modules[L.modules.length - 1].tilt
    items.bandPlus.anchor.set(-0.7 * Math.cos(tilt) + 0.95 * Math.sin(tilt), -0.05, 0.7 * Math.sin(tilt) + 0.95 * Math.cos(tilt)).applyMatrix4(L.plate)
    items.bandMinus.anchor.set(-0.7 * Math.cos(tilt) - 0.95 * Math.sin(tilt), -0.05, 0.7 * Math.sin(tilt) - 0.95 * Math.cos(tilt)).applyMatrix4(L.plate)
    items.bandPlus.focus = items.bandMinus.focus = o.focus === 'ghost-band'
  }
  // θ on the protractor arc
  items.theta.alpha = on(o.tiltBeat ? 1 : 0)
  if (o.protractor.visible) items.theta.anchor.set(1.35 * Math.sin(o.lastTilt / 2), 0, 1.35 * Math.cos(o.lastTilt / 2)).applyMatrix4(o.protractor.matrix)
  items.theta.focus = o.focus === 'tilt-arc'
  // μ⃗ on one atom (term-linked: l1-quantized:b1)
  const pos = rig.atoms.pos.array as Float32Array
  const col = rig.atoms.col.array as Float32Array
  const muOn = (o.terms.has('atom-moment') || o.focus === 'atom-moment') && col[TRACKED * 4 + 3] > 0.3
  items.mu.alpha = on(muOn ? 1 : 0)
  items.mu.anchor.set(pos[TRACKED * 3], pos[TRACKED * 3 + 1], pos[TRACKED * 3 + 2] + 0.35)
  items.mu.leaderAnchor = new THREE.Vector3(pos[TRACKED * 3], pos[TRACKED * 3 + 1], pos[TRACKED * 3 + 2])
  items.mu.focus = o.focus === 'atom-moment'
  // hidden-label tags on 12 sampled atoms
  for (let i = 0; i < TAGS; i++) {
    const a = 101 + i * 157
    const it = items[`tag${i}`]
    const vis = col[a * 4 + 3] > 0.3
    it.alpha = on(o.wHidden > 0.5 && vis ? o.wHidden : 0)
    it.anchor.set(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2] + 0.18)
  }
  void f
}

/** Screen-fixed orientation gizmo (D §6.1 item 2): 72 × 72 at the view's bottom-right, above the caption. */
const GIZMO_LABEL: Record<string, [number, number]> = { gx: [18, 19], gy: [72, 19], gz: [152, 19] }
function placeGizmo(items: Record<string, LabelItem>, cam: THREE.Camera, size: { w: number; h: number }, box: { current: Rect }, S: { frame: number; captionTop: number; captionRight: number }, unitId: string, inset: boolean) {
  const names = ['gx', 'gy', 'gz'] as const
  if (inset || size.w < 240) {
    for (const n of names) items[n].alpha = 0
    box.current = [0, 0, 0, 0]
    return
  }
  // keep clear of a wide caption: read its rect every 4th frame (two offset reads; no per-frame layout reads)
  if (S.frame++ % 4 === 0) {
    const cap = stage.units.get(unitId)?.box?.querySelector<HTMLElement>('.stage-caption')
    S.captionTop = cap ? cap.offsetTop : 1e9
    S.captionRight = cap ? cap.offsetLeft + cap.offsetWidth : 0
  }
  // origin far enough from the edge that the longest label ("z · field gradient") fits centred above it
  const ox = size.w - 14 - 84
  let oy = size.h - 14 - 40
  if (S.captionRight > ox - 90 && S.captionTop < size.h) oy = Math.min(oy, S.captionTop - 64)
  box.current = [ox - 40, oy - 40, 80, 80]
  const axes: [number, number, number][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]
  names.forEach((n, i) => {
    const d = physToThree(...axes[i]).transformDirection(cam.matrixWorldInverse)
    let dx = d.x
    let dy = -d.y
    const len = Math.hypot(dx, dy)
    const it = items[n]
    it.alpha = 1
    it.leaderTo = [ox, oy]
    if (len < 0.3) {
      // pointing at / away from the viewer: park the label beside the origin, no line
      dx = -0.8
      dy = 0.6
      it.leaderTo = null
    } else {
      dx /= len
      dy /= len
    }
    it.slide = [dx, dy]
    const tip = 30 * Math.min(1, Math.max(0.45, len))
    const [lw, lh] = GIZMO_LABEL[n]
    const half = Math.abs(dx) * (lw / 2) + Math.abs(dy) * (lh / 2) + 4
    it.anchor.set(ox + dx * (tip + half), oy + dy * (tip + half), 0)
  })
}

function computeTexts(st: ResolvedLab, wBox: number, rig: LabRig): Record<string, string> {
  const out: Record<string, string> = {}
  st.benches.forEach((bench, b) => {
    bench.tilts.forEach((tl, k) => {
      out[`ax${b}${k}`] = axisName(tl)
      out[`mag${b}${k}`] = 'MAGNET'
    })
    bench.chips.forEach((c, k) => {
      if (c !== 'oven') out[`chip${b}${k}`] = ket(c)
    })
    let alive = 1
    bench.tilts.forEach((_, k) => {
      if (k > 0) alive -= bench.theory.blocked[k - 1] ?? 0
      out[`frac${b}${k}`] = fracText(alive)
    })
    const box = wBox > 0.5
    out[`sp${b}`] = st.readouts.includes('fractions') ? `+ ${fracText(bench.theory.plus)}` : box ? '+1' : '+ħ/2'
    out[`sm${b}`] = st.readouts.includes('fractions') ? `− ${fracText(bench.theory.minus)}` : box ? '−1' : '−ħ/2'
    for (let k = 0; k < bench.tilts.length - 1; k++) out[`stop${b}${k}`] = st.readouts.includes('blocked') ? `block · ${fracText(bench.theory.blocked[k])}` : 'block'
  })
  out.badge = st.model === 'classical' ? 'classical model — not what happens' : st.model === 'hidden-label' ? 'hypothesis' : st.gradient < 0.5 ? 'uniform field — no push' : 'classical model — not what happens'
  // hidden-label tags: the outcome each sampled atom is heading for (its seeded fate)
  const b0 = st.benches[0]
  const p = b0.theory.plus + b0.theory.minus > 0 ? b0.theory.plus / (b0.theory.plus + b0.theory.minus) : 0.5
  const keep = b0.keep.map((k) => (k === '-' ? -1 : 1))
  const fate: Fate = { end: -1, signs: [] }
  for (let i = 0; i < TAGS; i++) {
    fateOf(rig.seeds.fate[101 + i * 157], b0.theory, keep, b0.tilts.length, fate)
    out[`tag${i}`] = (fate.signs[0] ?? 1) > 0 ? '↑' : '↓'
  }
  void p
  return out
}
