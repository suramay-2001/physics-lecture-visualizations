/**
 * operator-space — A = a₀I + a⃗·σ⃗ (D-L1-scenes §3.6; built for Lectures 3–5). Draws ONLY `f.state`
 * (ResolvedOperator: a₀, a⃗, eigenvalues a₀ ± |a⃗|, â, class flags, the optional sum — all from the engine).
 *   orchid arrow = a⃗ (orchid is reserved for operators) · dashed orchid line = the eigen-axis ±â, drawn through a
 *   GHOST Bloch sphere (wireframe, tagged "state space", so two spaces are never silently mixed) · amber / cobalt
 *   dots at +â / −â = the two eigenstates, labelled with their eigenvalues.
 *   a₀ lives on a separate gauge to the right (the 4th axis, drawn apart): orchid pointer at a₀, amber/cobalt ticks
 *   at the eigenvalues. Changing a₀ moves only the gauge: eigenstates do not care about a₀.
 * Arrows longer than 1.5 are drawn at half scale and the readout says "scale ½". No idle motion.
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { physToThree, useDomLabels, useLabelKey, useStageCamera, useStageFrame, useStageLabels, writeReadout, type LabelItem } from '../hooks'
import { INK } from '../tokens'
import type { SceneProps, V3 } from '../types'
import { classReadout, drawScale, eigReadout, opLines, signedNum } from './operator/opLabels'

const AXIS_LEN = 1.6
const FIT = 2.35 // axes + the gauge beside them
const GHOST_R = 1
const GAUGE_X = 2.05 // along the camera's right vector
const GAUGE_UNIT = 0.42 // gauge length per unit of a₀ (range −2 … +2)
const SHOTS = { 'O-STD': { az: 30, el: 22, d: 5 }, 'O-GAUGE': { az: 30, el: 22, d: 5.6 } } as const

function circle(axis: 'x' | 'y' | 'z', n = 72): THREE.BufferGeometry {
  return new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      const p: V3 = axis === 'z' ? [Math.cos(a), Math.sin(a), 0] : axis === 'x' ? [0, Math.cos(a), Math.sin(a)] : [Math.cos(a), 0, Math.sin(a)]
      return physToThree(p[0] * GHOST_R, p[1] * GHOST_R, p[2] * GHOST_R)
    }),
  )
}

/** An arrow built along +Y, re-aimed and re-sized every frame without new geometry. */
function makeArrow(mat: THREE.Material, shaftR: number, headR: number, headLen: number) {
  const g = new THREE.Group()
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(shaftR, shaftR, 1, 12), mat)
  const head = new THREE.Mesh(new THREE.ConeGeometry(headR, headLen, 18), mat)
  g.add(shaft, head)
  const up = new THREE.Vector3(0, 1, 0)
  const dir = new THREE.Vector3()
  return {
    group: g,
    set(from: THREE.Vector3, vec: THREE.Vector3) {
      const len = vec.length()
      g.visible = len > 1e-6
      if (!g.visible) return
      g.position.copy(from)
      g.quaternion.setFromUnitVectors(up, dir.copy(vec).divideScalar(len))
      const h = Math.min(headLen, len * 0.45)
      shaft.scale.set(1, Math.max(1e-4, len - h), 1)
      shaft.position.y = (len - h) / 2
      head.scale.set(h / headLen, h / headLen, h / headLen)
      head.position.y = len - h / 2
    },
  }
}

export default function OperatorSpaceScene(_: SceneProps<'operator-space'>) {
  const cam = useMemo(() => new THREE.PerspectiveCamera(40, 1, 0.1, 60), [])
  useStageCamera(cam)
  const shotRef = useRef('')
  const root = useRef<THREE.Group>(null)
  const gauge = useRef<THREE.Group>(null)
  const plusDot = useRef<THREE.Mesh>(null)
  const minusDot = useRef<THREE.Mesh>(null)
  const right = useMemo(() => new THREE.Vector3(), [])

  const mats = useMemo(
    () => ({
      op: new THREE.MeshStandardMaterial({ color: INK.op, emissive: INK.op, emissiveIntensity: 0.35 }),
      opFaint: new THREE.MeshStandardMaterial({ color: INK.op, emissive: INK.op, emissiveIntensity: 0.25, transparent: true, opacity: 0.5 }),
      axes: new THREE.LineBasicMaterial({ color: INK.silver, transparent: true, opacity: 0.75 }),
      ghost: new THREE.LineBasicMaterial({ color: INK.silver3, transparent: true, opacity: 0.35 }),
      eigen: new THREE.LineDashedMaterial({ color: INK.op, dashSize: 0.07, gapSize: 0.05 }),
      gauge: new THREE.LineBasicMaterial({ color: INK.silver }),
    }),
    [],
  )
  const arrows = useMemo(
    () => ({ a: makeArrow(mats.op, 0.022, 0.06, 0.16), add: makeArrow(mats.opFaint, 0.018, 0.05, 0.13), first: makeArrow(mats.opFaint, 0.018, 0.05, 0.13) }),
    [mats],
  )
  const geo = useMemo(
    () => ({
      axes: (['x', 'y', 'z'] as const).map((a) => {
        const v = a === 'x' ? [1, 0, 0] : a === 'y' ? [0, 1, 0] : [0, 0, 1]
        return new THREE.BufferGeometry().setFromPoints([physToThree(-v[0] * AXIS_LEN, -v[1] * AXIS_LEN, -v[2] * AXIS_LEN), physToThree(v[0] * AXIS_LEN, v[1] * AXIS_LEN, v[2] * AXIS_LEN)])
      }),
      ghost: [circle('z'), circle('x'), circle('y')],
      gaugeBar: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -2 * GAUGE_UNIT, 0), new THREE.Vector3(0, 2 * GAUGE_UNIT, 0)]),
      gaugeTicks: new THREE.BufferGeometry().setFromPoints(
        [-2, -1, 0, 1, 2].flatMap((k) => [new THREE.Vector3(-0.04, k * GAUGE_UNIT, 0), new THREE.Vector3(0.04, k * GAUGE_UNIT, 0)]),
      ),
    }),
    [],
  )
  const eigenLine = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    const l = new THREE.Line(g, mats.eigen)
    l.frustumCulled = false
    return l
  }, [mats])
  const gaugeMarks = useMemo(() => {
    const mk = (color: string, w: number, h: number) => new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), new THREE.MeshBasicMaterial({ color }))
    return { a0: mk(INK.op, 0.2, 0.035), plus: mk(INK.plus, 0.13, 0.022), minus: mk(INK.minus, 0.13, 0.022) }
  }, [])

  const item = (anchor: THREE.Vector3, priority: number, alpha = 1): LabelItem => ({ anchor, alpha, priority })
  const anchors = useMemo(
    () => ({
      ax0: item(physToThree(AXIS_LEN + 0.14, 0, 0), 3),
      ax1: item(physToThree(0, AXIS_LEN + 0.14, 0), 3),
      ax2: item(physToThree(0.14, 0, AXIS_LEN + 0.04), 3),
      ghost: item(physToThree(-0.55, -0.55, -0.9), 4),
      plus: item(new THREE.Vector3(), 1),
      minus: item(new THREE.Vector3(), 1),
      a0: item(new THREE.Vector3(), 2),
    }),
    [],
  )
  const labels = useMemo(
    () => ({
      ax0: { text: '$a_x$', tier: 'axis' as const, tone: 'silver' as const },
      ax1: { text: '$a_y$', tier: 'axis' as const, tone: 'silver' as const },
      ax2: { text: '$a_z$', tier: 'axis' as const, tone: 'silver' as const },
      ghost: { text: 'ghost Bloch sphere · state space', tier: 'axis' as const, tone: 'silver' as const },
      plus: { text: '', tier: 'chip' as const, tone: 'plus' as const },
      minus: { text: '', tier: 'chip' as const, tone: 'minus' as const },
      a0: { text: '$a_0$', tier: 'axis' as const, tone: 'op' as const },
      op0: { text: '', tier: 'readout' as const, tone: 'op' as const },
      op1: { text: '', tier: 'readout' as const, tone: 'op' as const },
      eig: { text: '', tier: 'readout' as const, tone: 'text' as const },
      cls: { text: '', tier: 'readout' as const, tone: 'text' as const },
    }),
    [],
  )
  useStageLabels(labels)
  const rOp0 = useLabelKey('op0')
  const rOp1 = useLabelKey('op1')
  const rEig = useLabelKey('eig')
  const rCls = useLabelKey('cls')
  const lPlus = useLabelKey('plus')
  const lMinus = useLabelKey('minus')
  const tmpA = useMemo(() => new THREE.Vector3(), [])
  const tmpB = useMemo(() => new THREE.Vector3(), [])
  const origin = useMemo(() => new THREE.Vector3(), [])

  useStageFrame<'operator-space'>((f) => {
    const s = f.state
    const shot = SHOTS[s.shot ?? 'O-STD']
    const vf = (cam.fov * Math.PI) / 360
    const half = Math.min(vf, Math.atan(Math.tan(vf) * cam.aspect))
    const d = Math.max(shot.d, FIT / Math.sin(half))
    const key = `${s.shot ?? 'O-STD'}:${d.toFixed(2)}`
    if (shotRef.current !== key) {
      shotRef.current = key
      const az = (shot.az * Math.PI) / 180
      const el = (shot.el * Math.PI) / 180
      cam.position.copy(physToThree(d * Math.cos(el) * Math.cos(az), d * Math.cos(el) * Math.sin(az), d * Math.sin(el)))
      cam.up.set(0, 1, 0)
      cam.lookAt(0, 0, 0)
      cam.updateMatrixWorld()
      right.setFromMatrixColumn(cam.matrixWorld, 0).normalize()
      gauge.current?.position.copy(right).multiplyScalar(GAUGE_X)
      gauge.current?.quaternion.copy(cam.quaternion)
    }
    const k = drawScale([Math.hypot(...s.a), ...(s.add ? [Math.hypot(...s.add.a), Math.hypot(...s.sum!.a)] : [])])
    const shown = s.sum ?? { a0: s.a0, a: s.a, eig: s.eig }
    // arrows: a⃗ alone, or a⃗ then b⃗ tip-to-tail (faint) and the resultant (solid)
    const va = physToThree(s.a[0] * k, s.a[1] * k, s.a[2] * k)
    if (s.add && s.sum) {
      arrows.first.set(origin, va)
      arrows.add.set(va, physToThree(s.add.a[0] * k, s.add.a[1] * k, s.add.a[2] * k))
      arrows.a.set(origin, physToThree(s.sum.a[0] * k, s.sum.a[1] * k, s.sum.a[2] * k))
    } else {
      arrows.first.group.visible = arrows.add.group.visible = false
      arrows.a.set(origin, va)
    }
    // eigen-axis ±â through the ghost sphere, eigenstate dots and their eigenvalues
    const len = Math.hypot(...shown.a)
    const on = s.eigen > 0.5 && len > 1e-9
    eigenLine.visible = on
    if (plusDot.current && minusDot.current) plusDot.current.visible = minusDot.current.visible = on
    anchors.plus.alpha = anchors.minus.alpha = on ? 1 : 0
    if (on) {
      const h: V3 = [shown.a[0] / len, shown.a[1] / len, shown.a[2] / len]
      tmpA.copy(physToThree(h[0] * 1.25, h[1] * 1.25, h[2] * 1.25))
      tmpB.copy(tmpA).negate()
      const pos = eigenLine.geometry.getAttribute('position') as THREE.BufferAttribute
      pos.setXYZ(0, tmpB.x, tmpB.y, tmpB.z)
      pos.setXYZ(1, tmpA.x, tmpA.y, tmpA.z)
      pos.needsUpdate = true
      eigenLine.computeLineDistances()
      plusDot.current?.position.copy(physToThree(h[0] * GHOST_R, h[1] * GHOST_R, h[2] * GHOST_R))
      minusDot.current?.position.copy(physToThree(-h[0] * GHOST_R, -h[1] * GHOST_R, -h[2] * GHOST_R))
      anchors.plus.anchor.copy(physToThree(h[0] * 1.2, h[1] * 1.2, h[2] * 1.2 + 0.1))
      anchors.minus.anchor.copy(physToThree(-h[0] * 1.2, -h[1] * 1.2, -h[2] * 1.2 - 0.1))
      writeReadout(lPlus, signedNum(shown.eig[0]))
      writeReadout(lMinus, signedNum(shown.eig[1]))
    }
    // the a₀ gauge (4th axis, apart): pointer at a₀, ticks at the eigenvalues, clamped to the drawn range ±2
    const cl = (x: number) => Math.max(-2, Math.min(2, x)) * GAUGE_UNIT
    gaugeMarks.a0.position.y = cl(shown.a0)
    gaugeMarks.plus.position.y = cl(shown.eig[0])
    gaugeMarks.minus.position.y = cl(shown.eig[1])
    gaugeMarks.plus.visible = gaugeMarks.minus.visible = s.gauge > 0.5 && len > 1e-9
    if (gauge.current) {
      gauge.current.visible = s.gauge > 0.5
      anchors.a0.alpha = gauge.current.visible ? 1 : 0
      gauge.current.updateMatrixWorld()
      anchors.a0.anchor.copy(gaugeMarks.a0.position).add(new THREE.Vector3(-0.22, 0, 0)).applyMatrix4(gauge.current.matrixWorld)
    }
    const [l0, l1] = s.valid ? opLines(shown.a0, shown.a) : ['not Hermitian', '']
    writeReadout(rOp0, l0 + (k < 1 ? ' · scale ½' : ''))
    writeReadout(rOp1, l1)
    writeReadout(rEig, s.valid ? eigReadout(shown.eig, shown.a) : '')
    writeReadout(rCls, s.valid ? classReadout(s.cls) : '')
    if (root.current) root.current.visible = f.weight > 0
  })
  useDomLabels(anchors, root)

  return (
    <group ref={root}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} />
      {geo.axes.map((g, i) => (
        <lineSegments key={i} geometry={g} material={mats.axes} />
      ))}
      {geo.ghost.map((g, i) => (
        <lineLoop key={i} geometry={g} material={mats.ghost} />
      ))}
      <primitive object={eigenLine} />
      <primitive object={arrows.first.group} />
      <primitive object={arrows.add.group} />
      <primitive object={arrows.a.group} />
      <mesh ref={plusDot}>
        <sphereGeometry args={[0.05, 16, 10]} />
        <meshStandardMaterial color={INK.plus} emissive={INK.plus} emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={minusDot}>
        <sphereGeometry args={[0.05, 16, 10]} />
        <meshStandardMaterial color={INK.minus} emissive={INK.minus} emissiveIntensity={0.4} />
      </mesh>
      <group ref={gauge}>
        <lineSegments geometry={geo.gaugeBar} material={mats.gauge} />
        <lineSegments geometry={geo.gaugeTicks} material={mats.gauge} />
        <primitive object={gaugeMarks.a0} />
        <primitive object={gaugeMarks.plus} />
        <primitive object={gaugeMarks.minus} />
      </group>
    </group>
  )
}
