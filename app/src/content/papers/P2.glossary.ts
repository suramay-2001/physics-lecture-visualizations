/**
 * Papers lecture P2 glossary (the GANDALF paper), merged into the lazy papers pack by file name (pack.ts). DATA ONLY, like the spec beside it: one `export const GLOSSARY` literal. Ids start `pp-`;
 * every entry has a Ground-up sentence (`gloss`, at most 25 words) and a Formal one (`formal`, at most 40), paraphrased, and a first use that carries its tag in both tracks. The entries marked
 * `introduces` are the notation beats of the lecture.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    "id": "pp-readout-bottleneck",
    "term": "readout bottleneck",
    "gloss": "The slow step that sets the pace: reading the atoms takes far longer than a gate.",
    "formal": "The readout-to-gate ratio is thousands for atoms, so readout time dominates the QEC cycle.",
    "first": "p2-bottleneck:b1"
  },
  {
    "id": "pp-qec-cycle",
    "term": "QEC cycle",
    "gloss": "One round of error correction: gates, then a reading, then a reset.",
    "formal": "Eq. 2: $t_{\\text{cycle}}$ = syndrome generation + readout + reset; a run takes $N_T\\,d\\,t_{\\text{cycle}}$.",
    "first": "p2-bottleneck:b2"
  },
  {
    "id": "pp-cycle-times",
    "term": "the times of a round",
    "gloss": "We call the gate time t_g, the reading time t_r, the classification time t_c, the denoising time t_den and the number of rounds d.",
    "formal": "Notation: $t_g$ gates, $t_r$ readout (acquisition), $t_c$ classification, $t_{\\text{den}}$ denoising, $d$ rounds; $t_r$ is the paper’s $t_{\\text{readout}}$.",
    "first": "p2-bottleneck:b2",
    "introduces": "notation",
    "symbols": [
      "t_g",
      "t_r",
      "t_c",
      "t_{\\text{den}}",
      "d"
    ]
  },
  {
    "id": "pp-dual-path",
    "term": "two optical paths",
    "gloss": "Light from the same atoms goes to a bright path, used for labels, and a tenfold dimmer path, used as the test picture.",
    "formal": "Primary path: full signal and long exposure, labels by thresholding; secondary path: attenuated tenfold, standing for a tenth of the exposure.",
    "first": "p2-dataset:b2"
  },
  {
    "id": "pp-exposure-equivalent",
    "term": "equivalent exposure",
    "gloss": "The exposure a dimmed long picture stands for, a tenth of its length. It is not a timed short exposure.",
    "formal": "An attenuated long exposure keeps the long exposure’s photon statistics; a timed exposure of the same length also differs in atom motion and depumping.",
    "first": "p2-dataset:b4"
  },
  {
    "id": "pp-denoiser",
    "term": "denoiser",
    "gloss": "A trained network that turns a dim, noisy picture into a clean one before the decision.",
    "formal": "A conditional GAN generator that maps a short-exposure frame to the paired long-exposure frame.",
    "first": "p2-denoiser:b1"
  },
  {
    "id": "pp-l1-gan-loss",
    "term": "generator loss",
    "gloss": "The two demands on the generator: look real, and match the bright picture pixel by pixel, weighted 200 times.",
    "formal": "Notation: $\\mathcal L_G=\\mathcal L_{\\text{GAN}}(G,D)+\\lambda_{L1}\\,\\mathbb E\\|G(x)-y\\|_1$ with $\\lambda_{L1}=200$ (Eq. 3).",
    "first": "p2-denoiser:b3",
    "introduces": "notation",
    "symbols": [
      "\\mathcal L_G",
      "\\lambda_{L1}"
    ]
  },
  {
    "id": "pp-residual-block",
    "term": "residual block",
    "gloss": "A layer that adds its input back to its output, so it refines features without losing them.",
    "formal": "A convolutional block whose output is added to its input; the generator has three at its bottleneck.",
    "first": "p2-denoiser:b4"
  },
  {
    "id": "pp-mode-collapse",
    "term": "mode collapse",
    "gloss": "A generator that gives the same few pictures, such as always bright or always dark, whatever it is shown.",
    "formal": "A generator output that satisfies the discriminator while ignoring the input’s occupancy pattern.",
    "first": "p2-denoiser:b5"
  },
  {
    "id": "pp-fnn",
    "term": "feedforward network (FNN)",
    "gloss": "A plain neural net that reads the patch flattened into a list of numbers.",
    "formal": "A fully connected network on the flattened site patch, one model per site.",
    "first": "p2-classifiers:b1"
  },
  {
    "id": "pp-mf-nn",
    "term": "matched filter with a small net (MF+NN)",
    "gloss": "A weighted sum of the patch pixels fed, with the pixels, to a small neural net.",
    "formal": "Matched-filter features added to the flattened patch before a small network.",
    "first": "p2-classifiers:b1"
  },
  {
    "id": "pp-eta",
    "term": "relative infidelity reduction η",
    "gloss": "The share of the baseline’s errors that a method removes. The error is divided by one over one minus η.",
    "formal": "Notation: $\\eta=1-\\delta_{\\text{method}}/\\delta_{\\text{CNN(Site)}}$ with $\\delta$ the classification inaccuracy.",
    "first": "p2-classifiers:b2",
    "introduces": "notation",
    "symbols": [
      "\\eta",
      "\\delta"
    ]
  },
  {
    "id": "pp-psnr",
    "term": "PSNR",
    "gloss": "A score of how close a cleaned picture is to the reference, in decibels; higher is closer.",
    "formal": "Peak signal-to-noise ratio of the denoised image against the long-exposure image, in dB.",
    "first": "p2-results:b4"
  },
  {
    "id": "pp-ssim",
    "term": "SSIM",
    "gloss": "A score of how well the structure of a cleaned picture matches the reference; one is perfect.",
    "formal": "The structural similarity index between the denoised and long-exposure images.",
    "first": "p2-results:b4"
  },
  {
    "id": "pp-throughput-latency",
    "term": "latency and throughput",
    "gloss": "Throughput is images per second; the latency per image is its inverse.",
    "formal": "Latency per image in ms is $1000/\\mathrm{TP}$ for a throughput TP in images per second.",
    "first": "p2-results:b5"
  },
  {
    "id": "pp-pipelined-readout",
    "term": "pipelined readout",
    "gloss": "Doing the classical work of one round while the next round is gated and photographed.",
    "formal": "Denoising and classification of round $k$ overlap the acquisition of round $k+1$, so only the last round’s classical work adds time.",
    "first": "p2-pipeline:b1"
  },
  {
    "id": "pp-pipeline-times",
    "term": "the two run times",
    "gloss": "The unpipelined time adds every stage of every round. The pipelined time pays the classical work once at the end.",
    "formal": "Notation: $T_{\\text{unp}}=d(t_g+t_r+t_c)$ (Eq. 4) and $T_{\\text{pip}}=d(t_r+t_g)+(t_{\\text{den}}+t_c)$ (Eq. 5).",
    "first": "p2-pipeline:b2",
    "introduces": "notation",
    "symbols": [
      "T_{\\text{unp}}",
      "T_{\\text{pip}}"
    ]
  }
]
