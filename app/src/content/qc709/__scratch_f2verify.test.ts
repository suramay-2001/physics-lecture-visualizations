import { describe, it } from 'vitest'
import { KET } from '../../physics/spin'
import { vec, vadd, vsub, vscale, norm, norm2, bilinear, diag2, mat, apply } from '../../physics/linalg'
import { inner, weightedInner, angleBetween, isIndependent, components, orthonormalize, outer, madd, eigh } from '../../physics/qc/cmat'
import { abs2, abs, I } from '../../physics/complex'

const fmt = (z: any) => (typeof z === 'number' ? z.toFixed(4) : `(${z.re.toFixed(4)}, ${z.im.toFixed(4)})`)

describe('f2 scratch verify', () => {
  it('prints values', () => {
    console.log('f2PlusXAmps', KET['+x'].map(fmt))
    console.log('f2SumZX norm', norm(vadd(KET['+z'], KET['+x'])).toFixed(4))
    console.log('f2PlusZAmps', KET['+z'].map(fmt))
    console.log('f2MinusXAmps', KET['-x'].map(fmt))
    console.log('f2DepThree isIndependent', isIndependent([vec(1, 0), vec(0, 1), vec(1, 1)]))

    console.log('f2InnerZX', fmt(inner(KET['+z'], KET['+x'])))
    console.log('f2InnerXY', fmt(inner(KET['+x'], KET['+y'])))
    console.log('f2InnerYX', fmt(inner(KET['+y'], KET['+x'])))
    console.log('f2InnerYY', fmt(inner(KET['+y'], KET['+y'])))
    console.log('f2BilinearYY', fmt(bilinear(KET['+y'], KET['+y'])))
    console.log('f2WeightedXZ', fmt(weightedInner(diag2(2, 1), KET['+x'], KET['+z'])))
    console.log('f2InnerXYabs2', abs2(inner(KET['+x'], KET['+y'])).toFixed(4))

    console.log('f2NormZplusX', norm(vadd(KET['+z'], KET['+x'])).toFixed(4))
    console.log('f2NormPlusX', norm(KET['+x']).toFixed(4))
    console.log('f2OrthXmX', fmt(inner(KET['+x'], KET['-x'])))
    console.log('f2OrthZmZ', fmt(inner(KET['+z'], KET['-z'])))
    console.log('f2PythVal', norm2(vadd(KET['+x'], KET['-x'])).toFixed(4))
    console.log('f2AngleZX deg', ((angleBetween(KET['+z'], KET['+x']) * 180) / Math.PI).toFixed(4))
    console.log('f2CS', abs(inner(KET['+z'], KET['+x'])).toFixed(4))
    console.log('f2TriStrict', norm(vadd(KET['+z'], KET['-z'])).toFixed(4))
    console.log('f2TriEqual', norm(vadd(vec(1, 0), vec(2, 0))).toFixed(4))

    console.log('f2IndepZmZ', isIndependent([KET['+z'], KET['-z']]))
    console.log('f2IndepXZ', isIndependent([KET['+x'], KET['+z']]))
    console.log('f2IndepFalse', isIndependent([vec(1, 1), vec(2, 2)]))

    const psi = vec(0.6, 0.8)
    console.log('f2CompZ', [inner(KET['+z'], psi), inner(KET['-z'], psi)].map(fmt))
    console.log('f2CompX', [inner(KET['+x'], psi), inner(KET['-x'], psi)].map(fmt))
    const dPlus = inner(KET['+x'], psi).re
    const dMinus = inner(KET['-x'], psi).re
    console.log('f2ParsevalX', (dPlus * dPlus + dMinus * dMinus).toFixed(4))

    console.log('f2Completeness', JSON.stringify(madd(outer(KET['+z'], KET['+z']), outer(KET['-z'], KET['-z']))))

    console.log('f2GsUnitShadow', fmt(inner(KET['+x'], KET['+z'])))
    const resid = vsub(KET['+z'], vscale(KET['+x'], inner(KET['+x'], KET['+z'])))
    console.log('f2GsUnitResid', resid.map(fmt))
    const on1 = orthonormalize([KET['+x'], KET['+z']])
    console.log('f2GsUnitE1', on1[0].map(fmt))
    console.log('f2GsUnitE2', on1[1].map(fmt))

    const onC = orthonormalize([vec(1, I), vec(1, 0)])
    console.log('f2GsCE1', onC[0].map(fmt))
    console.log('f2GsCE2', onC[1].map(fmt))
    console.log('f2GsCOrtho', fmt(inner(onC[0], onC[1])))

    console.log('f2GsDepLen', orthonormalize([vec(1, 1), vec(2, 2)]).length)

    console.log('components skew test', components(psi, [KET['+x'], KET['+z']])?.map(fmt))

    const r3 = 1 / Math.sqrt(2)
    const SX1 = mat([
      [0, r3, 0],
      [r3, 0, r3],
      [0, r3, 0],
    ])
    const e = eigh(SX1)
    console.log('spin1 Sx eigenvalues', e.values)
    console.log('spin1 Sx eigenvectors', e.vectors.map((v) => v.map(fmt)))
    // plus-x and minus-x spin-1 eigenvectors by the standard formula, and the GS residual against them
    const p1x = vec(0.5, r3, 0.5)
    const m1x = vec(0.5, -r3, 0.5)
    console.log('p1x normalized?', norm(p1x))
    console.log('m1x normalized?', norm(m1x))
    console.log('p1x . m1x', fmt(inner(p1x, m1x)))
    const onSpin1 = orthonormalize([p1x, m1x, vec(1, 0, 0)])
    console.log('GS third vector', onSpin1[2]?.map(fmt))
    console.log('Sx eigenvalue of GS third vector', fmt(inner(onSpin1[2], apply(SX1, onSpin1[2]))))
  })
})
