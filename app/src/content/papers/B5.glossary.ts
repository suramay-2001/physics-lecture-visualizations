/**
 * Background chapter B5 glossary (the Papers section), merged into the lazy papers pack by file name (pack.ts). DATA ONLY, like the spec beside it: one `export const GLOSSARY`
 * literal. Ids start `pp-`; every entry has a Ground-up sentence (`gloss`, at most 25 words) and a Formal one (`formal`, at most 40), paraphrased, and a first use that
 * carries its tag in both tracks. The entries marked `introduces` are the notation beats of the chapter.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    "id": "pp-roi",
    "term": "region of interest",
    "gloss": "The box of pixels you add up for one atom.",
    "formal": "A set of pixels around a site; the statistic is $S=\\sum$ of the counts over the set.",
    "first": "b5-roi:b3",
    "introduces": "notation"
  },
  {
    "id": "pp-psf",
    "term": "point-spread function",
    "gloss": "The soft spot one point of light makes on the camera.",
    "formal": "The image of a point source; here a Gaussian of width σ pixels.",
    "first": "b5-roi:b1"
  },
  {
    "id": "pp-crosstalk",
    "term": "crosstalk",
    "gloss": "Light from one atom landing in its neighbour's box.",
    "formal": "The share of site A's photons that falls inside the window around site B.",
    "first": "b5-roi:b4"
  },
  {
    "id": "pp-llr-weights",
    "term": "likelihood-ratio weights",
    "gloss": "How much each pixel's count should count.",
    "formal": "$w_i=\\ln(1+s_i/b_i)$; decide bright when $\\sum_i w_i n_i>\\sum_i s_i$.",
    "first": "b5-matched-filter:b2",
    "introduces": "notation"
  },
  {
    "id": "pp-matched-filter",
    "term": "matched filter",
    "gloss": "A weighted sum whose weights follow the expected spot.",
    "formal": "A linear statistic whose weights are proportional to the template divided by the noise level.",
    "first": "b5-matched-filter:b2"
  },
  {
    "id": "pp-dprime",
    "term": "separation d′",
    "gloss": "How many noise widths apart the bright and dark totals are.",
    "formal": "$d\\prime^2=\\sum_i s_i^2/b_i$ in the weak-signal, Gaussian approximation.",
    "first": "b5-matched-filter:b4"
  },
  {
    "id": "pp-learned-filter",
    "term": "learned filter",
    "gloss": "Weights fitted from labelled shots.",
    "formal": "Least-squares weights $W=YX^{\\mathsf T}(XX^{\\mathsf T}+\\alpha I)^{-1}$ fitted to the labels.",
    "first": "b5-cnn:b1"
  },
  {
    "id": "pp-receptive-field",
    "term": "receptive field",
    "gloss": "How many input pixels one output can see.",
    "formal": "The side of the input patch one output depends on, built layer by layer: $r\\leftarrow(r-1)\\,\\text{stride}+k$.",
    "first": "b5-cnn:b4"
  },
  {
    "id": "pp-fidelity-cf",
    "term": "fidelity, cross-fidelity",
    "gloss": "How often a site's bit is right, and how often errors travel together.",
    "formal": "$F=1-\\tfrac12[P(B\\mid D)+P(D\\mid B)]$; $F_{CF}$ averages $P(D_k\\mid B_l)+P(B_k\\mid D_l)$ over site pairs.",
    "first": "b5-cnn:b6"
  },
  {
    "id": "pp-wiener",
    "term": "Wiener smoother",
    "gloss": "A cleaner that shrinks each pixel towards what the prior says a clean frame looks like.",
    "formal": "$\\hat x=C_s(C_s+C_n)^{-1}(x-\\mu)+\\mu$ with signal and noise covariances $C_s$, $C_n$.",
    "first": "b5-wiener:b3",
    "introduces": "notation"
  },
  {
    "id": "pp-cgan",
    "term": "conditional GAN",
    "gloss": "A network pair: one draws, one judges, and both see the noisy picture.",
    "formal": "$G$ minimises and $D$ maximises $L_{GAN}(G,D)+\\lambda L_1$, conditioned on the input $x$.",
    "first": "b5-pix2pix:b1"
  },
  {
    "id": "pp-unet-patchgan",
    "term": "U-Net, PatchGAN",
    "gloss": "Skip links that carry detail past a narrow middle; a judge that scores small patches.",
    "formal": "Skip concatenation between encoder and decoder layers; a discriminator scoring N by N patches (70 by 70 in Isola et al.).",
    "first": "b5-pix2pix:b3"
  },
  {
    "id": "pp-hallucination",
    "term": "hallucination",
    "gloss": "A cleaner inventing a feature the data do not hold.",
    "formal": "Output driven by the training prior rather than by the input.",
    "first": "b5-pix2pix:b5"
  }
]
