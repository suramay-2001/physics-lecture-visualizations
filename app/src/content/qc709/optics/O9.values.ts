/**
 * Optics Lab page O9 numbers (one atom per trap: parity-projected loading, a binomial target, refilling, the price of an image), computed with the engine
 * (physics/optics/arrays.ts), each ROUNDED to the digits and unit the page prints. The parity law is a MODEL (perfect pair loss) and the refill chance and loss
 * chance are MODEL INPUTS, all stated on the page. REPORTED inputs (`o9Rep…`) are the paper's printed numbers (Manetsch et al., arXiv:2403.12021v4): the loading
 * probability 51.2 % with 3.4 % relative spread across the sites (p. 3, Ext. Data Fig. 2c), 6,139 atoms on average (p. 2, Fig. 1d caption), the per-image
 * survival 99.98952 % and the vacuum lifetime 22.9 min (p. 4). Numpy twin: pipeline/claims_optics/o_track.py -> physics/__fixtures__/claims-optics/o9.json.
 */
import { fillChance, lossBudget, parityDistribution, poissonP1, refillEquilibrium, refillTrace, sitesNeeded } from '../../../physics/optics/arrays'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const trace = refillTrace(5, 0.01, 0.5)
const eq = refillEquilibrium(0.01, 0.5)
const ATOMS = 6139 // the paper's printed mean number of loaded atoms (p. 2)
const TAU = 22.9 * 60 // s: the printed vacuum lifetime (p. 4)
const loss = lossBudget(ATOMS, TAU, 0.9998952)

export const V = {
  /* o9-parity */
  o9P1Mu1: r(parityDistribution(1).p1, 4),
  o9P0Mu1: r(parityDistribution(1).p0, 4),
  o9PoissonMax: r(poissonP1(1), 4), // the largest chance of one atom without the parity step (at μ = 1)
  o9P1Mu2: r(parityDistribution(2).p1, 4),
  o9P1Mu5: r(parityDistribution(5).p1, 5),
  /* o9-sort */
  o9Sites100: sitesNeeded(100, 0.512, 0.99), // sites for a 99 % chance of at least 100 loaded
  o9Sites100p50: sitesNeeded(100, 0.5, 0.99),
  o9Sites50: sitesNeeded(50, 0.512, 0.99),
  o9PCert200: r(fillChance(200, 100, 0.512), 3),
  o9PCert220: r(fillChance(220, 100, 0.512), 3),
  o9ExpAtoms: r(12000 * 0.512, 0), // atoms expected in 12,000 sites at the printed loading probability
  /* o9-refill */
  o9Empty5: r(trace[5], 4), // empty fraction after five rounds (ε = 0.01, q = ½, a model)
  o9EmptyEq: r(eq, 4), // the fixed point ε/(q + ε)
  o9RefillTenRatio: r(refillEquilibrium(0.01, 0.1) / refillEquilibrium(0.01, 0.01), 2), // empty fraction at refill 10 x loss over that at refill = loss
  o9AllFilled100: r((1 - eq) ** 100, 3), // the chance that 100 sites each filled at the equilibrium rate are all filled
  /* o9-loss */
  o9LossPerSec: r(loss.perSecond, 2), // atoms lost per second from 6,139 atoms at τ = 22.9 min
  o9LostPerImage: r(loss.perImage, 3), // atoms lost per image at the printed survival
  o9VacPerImage: r(ATOMS * (1 - Math.exp(-0.08 / TAU)), 3), // atoms: the vacuum alone over the 80 ms of an image, at the printed lifetime
  /* reported (Manetsch et al., arXiv:2403.12021v4) */
  o9RepFill: 0.512, // "loading probability of 51.2%", p. 3
  o9RepSpread: 0.034, // "relative standard deviation of 3.4% across the sites", p. 3
  o9RepSurv: 0.9998952, // "99.98952(1)%", per-image survival, p. 4
  o9RepLifeMin: 22.9, // "22.9(1) min", p. 4
  o9RepAtoms: 6139, // mean loaded atoms, p. 2 (Fig. 1d caption)
  o9RepSortParMs: 137, // "~137 ms", sorting in parallel, p. 8 and p. 33
  o9RepSortSeqMs: 522, // "~522 ms", the four quadrants one after another, p. 8 and p. 33
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
