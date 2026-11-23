/**
 * The Papers lecture P2 on the GANDALF paper (arXiv:2510.25982v2; rulings gandalf-batch.md G1-G4; plan P-P2-story). It teaches why reading the atoms is the slow step of error correction, the paper's
 * two-path dataset, its conditional-GAN denoiser and the small classifiers that follow it, Eqs. 4 and 5 and the bars of Fig. 15, how readout time enters the logical error rate twice, and which of the
 * paper's numbers reproduce, in two tracks. The paper is paraphrased and cited by section, page, table and figure; no figure is republished. Every number is either computed by a registered recipe
 * (numpy twin: pipeline/claims_papers/p2.py), reported from the paper exactly as printed with its location (checked on the page images), or a labelled input of our toy models. Corrections and
 * neutral notes follow rulings G4: E1 is a neutral note (1.24 and 1.25 against the abstract's 1.6), E2 is a Correction (the text's 0.19 s to 0.152 s matches no bar of Fig. 15).
 *
 * DATA ONLY: papers/specData.test.ts proves this file holds nothing but literals; papers/validate.ts checks it; papers/compile.ts turns it into a Lecture.
 */
import type { PaperSpec } from '../../papers/spec'

export const P2: PaperSpec = {
  "specVersion": 1,
  "id": "P2",
  "kind": "paper",
  "title": "GANDALF: reading atoms faster by cleaning the picture first",
  "paper": {
    "shortTitle": "GANDALF",
    "authors": [
      "Mude",
      "Phuttitarn",
      "Maurya",
      "Sinha",
      "Saffman",
      "Tannu"
    ],
    "arxiv": {
      "id": "2510.25982",
      "version": 2
    },
    "date": "2025-12",
    "institution": "University of Wisconsin–Madison (Saffman also Infleqtion)",
    "source": "paper-gdf",
    "licence": "CC BY 4.0 (as shown on the arXiv page). This lecture paraphrases and cites by section, page, figure or table and republishes no figure; attribution: Mude et al., arXiv:2510.25982v2."
  },
  "outcomes": [
    "State the readout bottleneck from the paper’s Tables 1 and 6.",
    "Explain the two-path dataset and why “1.5 ms” is an equivalent exposure, not a timed one.",
    "Describe the GANDALF loss, its architecture and its failure modes.",
    "Compare the FNN, MF+NN and CNN classifiers by η, size and time, and turn η into a factor.",
    "Apply Eqs. 4 and 5 and recover the classification time implied by Fig. 15.",
    "Explain the U-shaped logical-error curve and what Fig. 14 can and cannot support.",
    "List the numbers that do not reconcile, and what the paper leaves unmodelled."
  ],
  "references": [
    {
      "id": "phu24",
      "label": "Phuttitarn et al. 2024",
      "arxiv": {
        "id": "2311.12217"
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "Section IV and Appendix A.1",
      "why": "The experiment whose 3 by 3 cesium images and CNN baselines the paper reuses; the dataset counts and spacings come from here.",
      "taughtIn": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-dataset"
      }
    },
    {
      "id": "iso17",
      "label": "Isola et al. 2017",
      "arxiv": {
        "id": "1611.07004"
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "the conditional objective, Sections 3 and 4",
      "why": "Defines the conditional adversarial network and its L1-plus-adversarial objective that the paper adapts.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-pix2pix"
      }
    },
    {
      "id": "ken25",
      "label": "Kent et al. 2025",
      "arxiv": {
        "id": "2504.08170",
        "version": 1
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "Eqs. 1-5 and Tables I-II",
      "why": "A matched filter fitted from labelled shots as a cheap alternative to a CNN; the paper’s MF+NN builds on it.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-matched-filter"
      }
    },
    {
      "id": "tom14",
      "label": "Tomita and Svore 2014",
      "arxiv": {
        "id": "1404.3747"
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "Eqs. 9 and 10, p. 6",
      "why": "The Pauli-twirl form of idle noise with T1 and T2 that the paper uses for waiting error; B6 teaches the twirl.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-twirl"
      }
    },
    {
      "id": "goo24",
      "label": "Google Quantum AI 2024",
      "arxiv": {
        "id": "2408.13687"
      },
      "depth": 1,
      "status": "cited",
      "why": "Cited as the source of the superconducting column of Table 1; we did not find the printed numbers in the text we could read."
    },
    {
      "id": "win23",
      "label": "Wintersperger et al. 2023",
      "depth": 1,
      "status": "cited",
      "why": "Cited as the source of the neutral-atom column of Table 1; abstract only (arXiv 2304.14360), because the full source was not available to us.",
      "taughtIn": {
        "course": "qc709",
        "chapter": "Q25",
        "unit": "q25-readout"
      }
    },
    {
      "id": "bar25",
      "label": "Baranes et al. 2025",
      "arxiv": {
        "id": "2502.20558"
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "Abstract and pp. 7-8",
      "why": "Cited for tolerating atom loss when reloading is deferred by one round; B6 treats loss as a third outcome.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-loss-reset"
      }
    },
    {
      "id": "geh25",
      "label": "Gehér et al. 2025",
      "arxiv": {
        "id": "2408.00758"
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "Abstract, p. 5 and Table I",
      "why": "Cited for the claim that reset can be skipped or deferred; the paper does not simulate reset.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-loss-reset"
      }
    },
    {
      "id": "gid25",
      "label": "Gidney 2025",
      "arxiv": {
        "id": "2505.15917"
      },
      "depth": 1,
      "status": "cited",
      "why": "Cited for the scale of a fault-tolerant run behind Eq. 1; the RSA example is B6’s and is not used here."
    },
    {
      "id": "sti21",
      "label": "Gidney 2021 (Stim)",
      "doi": "10.22331/q-2021-07-06-497",
      "depth": 1,
      "status": "cited",
      "why": "The simulator the paper uses for logical error rates; not run here."
    },
    {
      "id": "gyg24",
      "label": "Gyger et al. 2024",
      "doi": "10.1103/PhysRevResearch.6.033104",
      "depth": 1,
      "status": "cited",
      "why": "Cited with the Norcia entry for continuous reloading of atoms, the motivation for fast readout."
    },
    {
      "id": "nor24",
      "label": "Norcia et al. 2024 (entries [28] and [29])",
      "doi": "10.1103/PRXQuantum.5.030316",
      "depth": 1,
      "status": "cited",
      "why": "The paper’s reference list prints two entries, [28] and [29], for this one paper (pp. 14–15); we note it and change nothing."
    }
  ],
  "prerequisites": [
    {
      "id": "qec-basics",
      "label": "Errors digitised into flips; guards that vote",
      "teach": {
        "course": "qc709",
        "chapter": "Q21",
        "unit": "q21-digitize"
      },
      "needs": []
    },
    {
      "id": "surface-code-logical",
      "label": "Distance, threshold and logical error rate",
      "teach": {
        "course": "papers",
        "chapter": "B1",
        "unit": "b1-threshold"
      },
      "needs": [
        "qec-basics"
      ]
    },
    {
      "id": "qec-cycle",
      "label": "What one round is made of: gates, reading, reset",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-cycle"
      },
      "needs": [
        "qec-basics"
      ]
    },
    {
      "id": "pauli-twirl-idle",
      "label": "Waiting noise as a Pauli channel (the twirl)",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-twirl"
      },
      "needs": [
        "qec-basics"
      ]
    },
    {
      "id": "neutral-atom-platform",
      "label": "Atoms in tweezers and their gates",
      "teach": {
        "course": "qc709",
        "chapter": "Q25",
        "unit": "q25-atom-gates"
      },
      "needs": []
    },
    {
      "id": "fluorescence-photon-budget",
      "label": "How many photons an atom gives a camera",
      "teach": {
        "course": "qc709",
        "chapter": "O10",
        "unit": "o10-need"
      },
      "needs": [
        "neutral-atom-platform"
      ]
    },
    {
      "id": "poisson-histogram",
      "label": "Bright and dark counts, and a cutoff",
      "teach": {
        "course": "qc709",
        "chapter": "O11",
        "unit": "o11-hist"
      },
      "needs": [
        "fluorescence-photon-budget"
      ]
    },
    {
      "id": "site-classification",
      "label": "A region of pixels per atom",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-roi"
      },
      "needs": [
        "poisson-histogram"
      ]
    },
    {
      "id": "matched-filter",
      "label": "Likelihood-ratio weights and the matched filter",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-matched-filter"
      },
      "needs": [
        "site-classification"
      ]
    },
    {
      "id": "linear-denoiser",
      "label": "A linear cleaner adds nothing to the best weights",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-wiener"
      },
      "needs": [
        "matched-filter"
      ]
    },
    {
      "id": "cnn-classifier",
      "label": "A small convolutional classifier",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-cnn"
      },
      "needs": [
        "matched-filter"
      ]
    },
    {
      "id": "pix2pix-loss",
      "label": "The conditional-GAN objective and its risk",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-pix2pix"
      },
      "needs": [
        "site-classification"
      ]
    },
    {
      "id": "readout-bottleneck",
      "label": "Why readout sets the cycle time",
      "teach": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-bottleneck"
      },
      "needs": [
        "qec-cycle",
        "neutral-atom-platform"
      ],
      "ref": "win23"
    },
    {
      "id": "dual-path-dataset",
      "label": "Two optical paths and an equivalent exposure",
      "teach": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-dataset"
      },
      "needs": [
        "poisson-histogram",
        "site-classification"
      ],
      "ref": "phu24"
    },
    {
      "id": "gandalf-network",
      "label": "The GANDALF loss, network and failure modes",
      "teach": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-denoiser"
      },
      "needs": [
        "pix2pix-loss",
        "linear-denoiser"
      ],
      "ref": "iso17"
    },
    {
      "id": "eta",
      "label": "η, the share of baseline errors removed",
      "teach": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-classifiers"
      },
      "needs": [
        "gandalf-network",
        "cnn-classifier"
      ]
    },
    {
      "id": "pipelining-eqs",
      "label": "Eqs. 4 and 5",
      "teach": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-pipeline"
      },
      "needs": [
        "readout-bottleneck"
      ]
    },
    {
      "id": "reading-fig15",
      "label": "Reading times back from the bars of Fig. 15",
      "teach": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-pipeline"
      },
      "needs": [
        "pipelining-eqs"
      ]
    },
    {
      "id": "readout-logical-trade",
      "label": "Reading error against waiting error",
      "teach": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-logical"
      },
      "needs": [
        "pipelining-eqs",
        "surface-code-logical",
        "pauli-twirl-idle"
      ],
      "ref": "tom14"
    },
    {
      "id": "trust-ledger",
      "label": "The ledger of what reproduces",
      "teach": {
        "course": "papers",
        "chapter": "P2",
        "unit": "p2-trust"
      },
      "needs": [
        "reading-fig15",
        "eta",
        "readout-logical-trade"
      ]
    }
  ],
  "symbols": {
    "T_run": "p2-bottleneck",
    "N_T": "p2-bottleneck",
    "t_cycle": "p2-bottleneck",
    "t_reset": "p2-bottleneck",
    "N_sites": "p2-dataset",
    "L_G": "p2-denoiser",
    "L_GAN": "p2-denoiser",
    "\\lambda_L1": "p2-denoiser",
    "G": "p2-denoiser",
    "\\delta_method": "p2-classifiers",
    "\\delta_CNN(Site)": "p2-classifiers",
    "T_unp": "p2-pipeline:b2",
    "T_pip": "p2-pipeline:b2",
    "t_den": "p2-pipeline:b2",
    "p_L": "p2-logical:b1",
    "A": "p2-logical:b1",
    "p_eff": "p2-logical:b1",
    "p_th": "p2-logical:b1",
    "p_g": "p2-logical:b1",
    "p_idle": "p2-logical:b1",
    "p_m": "p2-logical:b1",
    "p_X": "p2-logical:b1",
    "p_Y": "p2-logical:b1",
    "e": "p2-logical:b1",
    "t": "p2-logical:b1",
    "T_1": "p2-logical:b1",
    "p_Z": "p2-logical:b1",
    "T_2": "p2-logical:b1",
    "P": "p2-logical:b1",
    "N_b": "p2-logical:b1",
    "k": "p2-logical:b1",
    "N_d": "p2-logical:b1"
  },
  "symbolsFormal": {
    "N_T": "p2-bottleneck:b2",
    "t_cycle": "p2-bottleneck:b2",
    "t_den": "p2-bottleneck:b2",
    "\\tau": "p2-bottleneck:b3",
    "N": "p2-bottleneck:b3",
    "k": "p2-bottleneck",
    "A": "p2-dataset",
    "t_eq": "p2-dataset",
    "t_long": "p2-dataset",
    "L_G": "p2-denoiser:b3",
    "L_GAN": "p2-denoiser:b3",
    "G": "p2-denoiser:b3",
    "D": "p2-denoiser:b3",
    "\\lambda_L1": "p2-denoiser:b3",
    "\\mathbb": "p2-denoiser:b3",
    "E_x,y": "p2-denoiser:b3",
    "\\beta_1": "p2-denoiser:b3",
    "\\beta_2": "p2-denoiser:b3",
    "E": "p2-denoiser",
    "\\delta_method": "p2-classifiers:b2",
    "\\delta_CNN(Site)": "p2-classifiers:b2",
    "s": "p2-results:b3",
    "t_base": "p2-results",
    "t_GANDALF": "p2-results"
  },
  "units": [
    {
      "id": "p2-bottleneck",
      "title": "Readout is the slow step",
      "question": "Why does reading the atoms set the speed of error correction?",
      "source": {
        "summary": "The introduction and background name the bottleneck: gates take microseconds or less, a reading takes milliseconds, and every error-correction round needs one. Table 1 sets the two platforms side by side, Eqs. 1 and 2 turn the cycle time into a run time, and Table 6 lists the other typical durations.",
        "where": "§1–2.3, pp. 1–4; Tables 1, 6"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "pipeline-lab"
        },
        "tryThis": [
          "Move the readout time t_r down from 3 ms and watch both times fall almost in step: the run is a thousand-fold readout, not gates.",
          "Set the gate time to its largest value. Even then the readout is most of every round, which is the paper’s point."
        ]
      },
      "insight": "Gates are quick and the reading is slow. Error correction reads in every round, so the reading decides how long a whole computation takes.",
      "insightFormal": "Run time is $N_T\\,d\\,t_{\\text{cycle}}$ and the cycle is gates plus readout plus reset, so a readout a thousand times slower than the gates sets $t_{\\text{cycle}}$ and with it the whole run. The paper tests none of the side benefits it lists.",
      "pitfalls": [
        "As reported: Table 1 prints a readout share of about 0.75 for atoms. Gate and readout alone give 0.9996, so the cycle must hold other steps it does not size."
      ],
      "story": [
        {
          "id": "p2-bottleneck:b1",
          "phase": "lecture",
          "text": "The [[pp-readout-bottleneck|readout bottleneck]] is easy to state. A gate on two [[qubit|qubits]] takes under a microsecond, but reading the atoms takes about a millisecond. Every round of error correction needs a reading, so the slow step sets the speed.",
          "formal": "Table 1 (p. 1) sets a neutral-atom machine (gate 400 ns, readout 1 ms) beside a superconducting one (34 ns, 500 ns). The [[pp-readout-bottleneck|bottleneck]] is the readout-to-gate ratio: $2500$ for atoms and $14.7$ for the superconducting machine (our arithmetic on the printed times).",
          "caption": "gate time and readout time, atoms against a superconducting machine",
          "captionFormal": "Table 1: gate and readout latency, log time axis (values as printed)",
          "stage": {
            "recipe": "platform-gap",
            "params": {},
            "uses": [
              "t1-gate-na",
              "t1-ro-na",
              "t1-gate-sc",
              "t1-ro-sc"
            ]
          },
          "claims": [
            {
              "key": "p2GapNA",
              "text": "the neutral-atom readout is 2500 gate times long (1 ms over 400 ns)",
              "from": {
                "recipe": "platform-gap",
                "params": {},
                "uses": [
                  "t1-gate-na",
                  "t1-ro-na",
                  "t1-gate-sc",
                  "t1-ro-sc"
                ]
              },
              "value": "gapNA"
            },
            {
              "key": "p2GapSC",
              "text": "the superconducting readout is 14.7 gate times long (500 ns over 34 ns)",
              "from": {
                "recipe": "platform-gap",
                "params": {},
                "uses": [
                  "t1-gate-na",
                  "t1-ro-na",
                  "t1-gate-sc",
                  "t1-ro-sc"
                ]
              },
              "value": "gapSC"
            }
          ],
          "reported": [
            {
              "id": "t1-gate-na",
              "text": "Neutral-atom entangling gate latency in Table 1",
              "value": "400 ns",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            },
            {
              "id": "t1-ro-na",
              "text": "Neutral-atom readout latency in Table 1",
              "value": "1 ms",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            },
            {
              "id": "t1-gate-sc",
              "text": "Superconducting entangling gate latency in Table 1",
              "value": "34 ns",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            },
            {
              "id": "t1-ro-sc",
              "text": "Superconducting readout latency in Table 1",
              "value": "500 ns",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            }
          ],
          "trail": [
            {
              "ref": "win23",
              "at": "the neutral-atom column of Table 1",
              "why": "The paper takes its neutral-atom times from this review; we have seen the citation only, not the source."
            },
            {
              "ref": "goo24",
              "at": "the Google column of Table 1",
              "why": "The paper takes its superconducting times from this experiment; the numbers were not found in the text we could read."
            }
          ]
        },
        {
          "id": "p2-bottleneck:b2",
          "phase": "lecture",
          "text": "A program runs for the number of T gates, times the [[pp-cycle-times|rounds $d$ per gate]], times the length of one [[pp-qec-cycle|cycle]]. A cycle is gates, then reading, then reset. Make the cycle a thousand times longer and the run is a thousand times longer. B6 takes the cycle apart (<<pp-b6-cycle|what one round is made of>>).",
          "formal": "Eq. 1 (p. 4) approximates the run time by $N_T\\,d\\,t_{\\text{cycle}}$ for $N_T$ T gates, $d$ rounds and one [[pp-qec-cycle|cycle]]; Eq. 2 splits the cycle into syndrome gates, readout and reset. Name the [[pp-cycle-times|times]] $t_g$, $t_r$ (readout, acquisition), $t_c$ (classification), $t_{\\text{den}}$ (denoising) and the rounds $d$. A cycle $1000$ times longer lengthens the run $1000$ times.",
          "caption": "one cycle: gates, reading, reset (illustrative widths)",
          "captionFormal": "Eq. 2: $t_{\\text{cycle}}$ as three boxes (our illustrative widths, not data)",
          "stage": {
            "recipe": "readout-timeline",
            "params": {
              "mode": "cycle",
              "drawn": 1,
              "d": 1,
              "tg": 0.3,
              "tr": 1,
              "tden": 0,
              "tc": 0,
              "treset": 0.2
            }
          },
          "introduces": [
            "pp-cycle-times"
          ],
          "claims": [
            {
              "key": "p2RuntimeScale",
              "text": "a cycle 1000 times longer lengthens a run by the factor 1000 (Eq. 1)",
              "from": {
                "recipe": "platform-gap",
                "params": {
                  "slower": 1000
                },
                "uses": [
                  "t1-gate-na",
                  "t1-ro-na",
                  "t1-gate-sc",
                  "t1-ro-sc"
                ]
              },
              "value": "scale"
            }
          ],
          "trail": [
            {
              "ref": "gid25",
              "at": "the T-gate bullet under Eq. 1, §2.3, p. 4",
              "why": "The paper’s Eq. 1 is a rough product; the RSA-scale example behind it is B6’s, not used here."
            }
          ]
        },
        {
          "id": "p2-bottleneck:b3",
          "phase": "lecture",
          "text": "An atom can scatter only so many photons each second, and the lens catches a small share. More laser power heats the atom and can throw it out of its trap. So we wait longer instead.",
          "formal": "Photons collected $=$ scattering rate $\\times$ collection efficiency $\\times$ exposure $\\tau$ (pp. 1–3). Power is capped by heating and loss, so $\\tau$ grows (<<pp-o10-collect|how many photons reach the camera>>). A Poisson count of mean $N\\propto\\tau$ has noise $\\sqrt N$, so the signal-to-noise ratio is $\\sqrt N\\propto\\sqrt\\tau$ (§3.2, p. 5): a tenfold exposure gives $3.16$ times the ratio (our arithmetic, $\\sqrt{10}$).",
          "caption": "chance of a wrong bit against exposure (illustrative Poisson model, not the dataset)",
          "captionFormal": "toy Poisson overlap error against exposure, log axes (our inputs, not the dataset)",
          "stage": {
            "recipe": "dual-path",
            "params": {
              "attenuation": 10,
              "view": "overlap"
            }
          },
          "claims": [
            {
              "key": "p2SnrSqrt",
              "text": "ten times the exposure gives √10 = 3.16 times the signal-to-noise ratio",
              "from": {
                "recipe": "dual-path",
                "params": {
                  "attenuation": 10,
                  "view": "overlap"
                }
              },
              "value": "snrLoss"
            }
          ],
          "trail": [
            {
              "ref": "phu24",
              "at": "the photon-counting argument behind the dataset",
              "why": "The same shot-noise reasoning limits the camera of the experiment whose data the paper reuses; the quantities are taught in the experiment track."
            }
          ]
        },
        {
          "id": "p2-bottleneck:b4",
          "phase": "lecture",
          "text": "Fast reading helps elsewhere too. Loading atoms, moving them into a perfect array, starting a code and checking helper atoms all need images. The paper lists these as reasons and does not test them.",
          "formal": "§2.3 (p. 4) adds atom loading and rearrangement, code start-up and syndrome verification, and fewer parallel traps for reloading: motivation, not results. Table 6 (p. 11) gives typical durations as orders of magnitude only: about 100 ms for one-time preparation, a few microseconds for a gate, a few milliseconds for imaging, a few hundred microseconds for classification. As reported: Table 1's 400 ns and 1 ms and Table 6's few microseconds and few milliseconds differ in scale (best case against typical, our reading; no verdict).",
          "caption": "the same two platforms again; Table 6 is words, so no new points",
          "captionFormal": "Table 1 again; Table 6 gives orders of magnitude in words, so it adds no points",
          "stage": {
            "recipe": "platform-gap",
            "params": {},
            "uses": [
              "t1-gate-na",
              "t1-ro-na",
              "t1-gate-sc",
              "t1-ro-sc"
            ]
          },
          "reported": [
            {
              "id": "t6-prep",
              "text": "One-time state preparation in Table 6",
              "value": "~100 ms",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "6",
                "page": 11
              }
            },
            {
              "id": "t6-gate",
              "text": "Entangling gate in Table 6",
              "value": "few µs",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "6",
                "page": 11
              }
            },
            {
              "id": "t6-img",
              "text": "Image acquisition in Table 6",
              "value": "few ms",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "6",
                "page": 11
              }
            },
            {
              "id": "t6-class",
              "text": "Classification in Table 6",
              "value": "few 100 µs",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "6",
                "page": 11
              }
            }
          ]
        },
        {
          "id": "p2-bottleneck:b5",
          "phase": "clue",
          "text": "Table 1 gives a gate of 400 ns and a reading of 1 ms. What share of one gate plus one reading is the reading?",
          "formal": "With the printed times, what is $t_r/(t_g+t_r)$ for the atoms and for the superconducting machine?",
          "caption": "think of the two times as lengths laid end to end",
          "captionFormal": "a share of $t_g + t_r$",
          "stage": {
            "recipe": "platform-gap",
            "params": {},
            "uses": [
              "t1-gate-na",
              "t1-ro-na",
              "t1-gate-sc",
              "t1-ro-sc"
            ]
          },
          "reveal": {
            "text": "The reading is $0.9996$ of the pair, and $0.936$ for the superconducting machine. The paper prints about 0.75 and about 0.5 because its cycle holds other steps as well.",
            "formal": "Our arithmetic: with $t_g=400$ ns and $t_r=1$ ms, $t_r/(t_g+t_r)=0.9996$; with $34$ ns and $500$ ns, $0.936$. The paper prints about $0.75$ and about $0.5$ for the share in a full cycle; the cycle's composition is not printed, so this is a neutral note (N1), not a correction.",
            "caption": "the reading is nearly the whole of a gate-plus-reading pair",
            "captionFormal": "$t_r/(t_g+t_r)$ from Table 1's times",
            "claims": [
              {
                "key": "p2ReadFracNA",
                "text": "the reading is 0.9996 of a neutral-atom gate plus reading",
                "from": {
                  "recipe": "platform-gap",
                  "params": {},
                  "uses": [
                    "t1-gate-na",
                    "t1-ro-na",
                    "t1-gate-sc",
                    "t1-ro-sc"
                  ]
                },
                "value": "fracNA"
              },
              {
                "key": "p2ReadFracSC",
                "text": "the reading is 0.936 of a superconducting gate plus reading",
                "from": {
                  "recipe": "platform-gap",
                  "params": {},
                  "uses": [
                    "t1-gate-na",
                    "t1-ro-na",
                    "t1-gate-sc",
                    "t1-ro-sc"
                  ]
                },
                "value": "fracSC"
              }
            ]
          },
          "reported": [
            {
              "id": "t1-frac-na",
              "text": "Neutral-atom readout fraction of a QEC cycle in Table 1",
              "value": "~0.75",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            },
            {
              "id": "t1-frac-sc",
              "text": "Superconducting readout fraction of a QEC cycle in Table 1",
              "value": "~0.5",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            }
          ]
        }
      ],
      "review": {
        "points": [
          "A gate takes under a microsecond; a reading takes about a millisecond.",
          "Every round of error correction needs a reading, so it sets the cycle time.",
          "A cycle 1000 times longer makes the whole run 1000 times longer.",
          "Table 1 and Table 6 differ in scale; both are printed, neither is ours."
        ],
        "equations": "T_{\\text{run}}\\approx N_T\\,d\\,t_{\\text{cycle}},\\quad t_{\\text{cycle}}=t_g+t_r+t_{\\text{reset}}",
        "trap": "Reading the paper’s printed share, about three quarters, as gate over reading. It is the readout’s part of a whole cycle.",
        "formal": {
          "points": [
            "Eq. 1 is a product of three factors, so a factor $k$ in the cycle is a factor $k$ in the run.",
            "Eq. 2: the cycle is syndrome gates, readout and reset.",
            "Readout over gate is $2500$ for atoms and about fifteen for the superconducting machine."
          ],
          "equations": "T_{\\text{run}}\\approx N_T\\,d\\,t_{\\text{cycle}},\\quad \\frac{t_r}{t_g}=2500\\ (\\text{atoms})",
          "trap": "Comparing Table 1 with Table 6: the first is a best case, the second typical; the gap is a difference of scale, not an error."
        },
        "claims": []
      }
    },
    {
      "id": "p2-dataset",
      "title": "Two cameras, one array",
      "question": "What data tests a denoiser, and what does “1.5 ms” mean here?",
      "source": {
        "summary": "Section 3.1 and the methodology describe an earlier experiment’s dataset. Nine cesium atoms sit in a square. Two optical paths reach one camera: a bright path for labels and a tenfold dimmer path for the test images. The counts and splits are given too.",
        "where": "§3, pp. 5–6; §6, p. 11; Figs. 3–5"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "exposure-bench"
        },
        "tryThis": [
          "Move the exposure up from 1 and watch the error fall much faster than a normal estimate from d′ suggests at small signals.",
          "This is the question the dim path asks: how bad is a reading at one tenth of the exposure?"
        ]
      },
      "insight": "The data pairs a bright picture, used to label the atoms, with a dim copy of the same shot. The dim copy stands in for a short exposure; nobody actually took a 1.5 ms exposure.",
      "insightFormal": "One camera exposure is split between a primary path (full signal, labels by thresholding) and a secondary path attenuated tenfold. The secondary image is an equivalent exposure of a tenth of the primary one, with the long exposure’s photon statistics but not a timed short exposure’s atom motion and loss.",
      "pitfalls": [
        "As reported: p. 11 says 27000 images for each duration. Fourteen durations would make 378000, but p. 5 gives 27000 in all."
      ],
      "story": [
        {
          "id": "p2-dataset:b1",
          "phase": "lecture",
          "text": "The data come from nine cesium atoms in a three-by-three square, held in light traps. A camera sees the glow of the bright atoms. The array was imaged at two atom spacings.",
          "formal": "§3.1 (p. 5) and §6 (p. 11): a $3\\times3$ array of Cs atoms in tweezers, imaged by an EMCCD camera. The spacings are 5 and 9 micrometres, giving $28\\times28$ and $32\\times32$ pixel images. The data are those of an earlier experiment (Phuttitarn et al.). The picture here is a simulated frame, not the dataset.",
          "caption": "a simulated 3 by 3 array (our illustration)",
          "captionFormal": "simulated $3\\times3$ frame (illustrative; the dataset’s images are not redrawn)",
          "stage": {
            "recipe": "dual-path",
            "params": {
              "attenuation": 10,
              "view": "frames"
            },
            "uses": [
              "ds-attn",
              "ds-range"
            ]
          },
          "reported": [
            {
              "id": "ds-array",
              "text": "The array of the dataset",
              "value": "3 x 3 cesium atoms",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "3.1",
                "page": 5
              }
            },
            {
              "id": "ds-px5",
              "text": "Image size at 5 micrometre spacing",
              "value": "28 x 28 pixels",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "6",
                "page": 11
              }
            },
            {
              "id": "ds-px9",
              "text": "Image size at 9 micrometre spacing",
              "value": "32 x 32 pixels",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "6",
                "page": 11
              }
            }
          ],
          "trail": [
            {
              "ref": "phu24",
              "at": "the dataset, §II–IV and Appendix A.1",
              "why": "The paper reuses this experiment’s images and its CNN baselines; its counts and spacings are the ones used here."
            }
          ]
        },
        {
          "id": "p2-dataset:b2",
          "phase": "lecture",
          "text": "The light goes down two paths onto the same camera. The [[pp-dual-path|bright path]] tells the truth: it labels each atom. The dim path, a tenth as bright, is the picture to be read.",
          "formal": "The [[pp-dual-path|two paths]] of Fig. 3 (p. 5): the primary path keeps the whole signal (exposures $15$–$100$ ms) and labels atoms by thresholding; the secondary path is attenuated tenfold and plays the short exposures $1.5$–$10$ ms. Dividing the long exposures by the attenuation gives $1.5$ and $10$ ms (our arithmetic on the printed numbers).",
          "caption": "where the atoms are, the dim path’s mean light, and one noisy dim frame (simulated, tenfold dimmer)",
          "captionFormal": "simulated: occupancy, mean photons at attenuation 10, one Poisson draw",
          "stage": {
            "recipe": "dual-path",
            "params": {
              "attenuation": 10,
              "view": "frames"
            },
            "uses": [
              "ds-attn",
              "ds-range"
            ]
          },
          "claims": [
            {
              "key": "p2ExpLo",
              "text": "the shortest equivalent exposure is 15 ms over 10, so 1.5 ms",
              "from": {
                "recipe": "dual-path",
                "params": {
                  "attenuation": 10,
                  "view": "frames",
                  "images": 3000,
                  "atoms": 9,
                  "durations": 14,
                  "longMin": 15,
                  "longMax": 100,
                  "split": [
                    65,
                    15,
                    20
                  ]
                },
                "uses": [
                  "ds-attn",
                  "ds-range",
                  "ds-count",
                  "ds-14",
                  "ds-split"
                ]
              },
              "value": "expLo"
            },
            {
              "key": "p2ExpHi",
              "text": "the longest equivalent exposure is 100 ms over 10, so 10 ms",
              "from": {
                "recipe": "dual-path",
                "params": {
                  "attenuation": 10,
                  "view": "frames",
                  "images": 3000,
                  "atoms": 9,
                  "durations": 14,
                  "longMin": 15,
                  "longMax": 100,
                  "split": [
                    65,
                    15,
                    20
                  ]
                },
                "uses": [
                  "ds-attn",
                  "ds-range",
                  "ds-count",
                  "ds-14",
                  "ds-split"
                ]
              },
              "value": "expHi"
            }
          ],
          "reported": [
            {
              "id": "ds-attn",
              "text": "Signal attenuation of the secondary optical path",
              "value": "10x",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "3",
                "page": 5
              }
            },
            {
              "id": "ds-range",
              "text": "Exposure ranges of the two paths, in ms",
              "value": "1.5 to 10 (15 to 100)",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "3.1",
                "page": 5
              }
            }
          ]
        },
        {
          "id": "p2-dataset:b3",
          "phase": "lecture",
          "text": "There are 3000 readout images, each of nine sites, so 27000 pictures of a single site. They are split into training, checking and testing sets in the shares 65, 15 and 20 percent.",
          "formal": "§3.1 (p. 5): $3000$ images of $3\\times3$ sites give $3000\\times9=27000$ single-site images; §6 (p. 11) splits train, validation and test in the shares $65$, $15$ and $20\\,\\%$, which sum to $100$. As reported: p. 11 says the $27000$ hold \"for each duration\"; $14$ durations would make $378000$, which does not match p. 5 (neutral note N3).",
          "caption": "counting the images",
          "captionFormal": "counts from the printed numbers; the note on p. 11 is unreconciled",
          "stage": {
            "recipe": "dual-path",
            "params": {
              "attenuation": 10,
              "view": "overlap",
              "images": 3000,
              "atoms": 9,
              "durations": 14,
              "longMin": 15,
              "longMax": 100,
              "split": [
                65,
                15,
                20
              ]
            },
            "uses": [
              "ds-attn",
              "ds-range",
              "ds-count",
              "ds-14",
              "ds-split"
            ]
          },
          "claims": [
            {
              "key": "p2Sites",
              "text": "three thousand images of nine sites make 27000 single-site images",
              "from": {
                "recipe": "dual-path",
                "params": {
                  "attenuation": 10,
                  "view": "frames",
                  "images": 3000,
                  "atoms": 9,
                  "durations": 14,
                  "longMin": 15,
                  "longMax": 100,
                  "split": [
                    65,
                    15,
                    20
                  ]
                },
                "uses": [
                  "ds-attn",
                  "ds-range",
                  "ds-count",
                  "ds-14",
                  "ds-split"
                ]
              },
              "value": "sites"
            },
            {
              "key": "p2Split",
              "text": "the shares 65, 15 and 20 add to 100",
              "from": {
                "recipe": "dual-path",
                "params": {
                  "attenuation": 10,
                  "view": "frames",
                  "images": 3000,
                  "atoms": 9,
                  "durations": 14,
                  "longMin": 15,
                  "longMax": 100,
                  "split": [
                    65,
                    15,
                    20
                  ]
                },
                "uses": [
                  "ds-attn",
                  "ds-range",
                  "ds-count",
                  "ds-14",
                  "ds-split"
                ]
              },
              "value": "split"
            },
            {
              "key": "p2Sites14",
              "text": "fourteen durations of 27000 would be 378000, not what p. 5 gives",
              "from": {
                "recipe": "dual-path",
                "params": {
                  "attenuation": 10,
                  "view": "frames",
                  "images": 3000,
                  "atoms": 9,
                  "durations": 14,
                  "longMin": 15,
                  "longMax": 100,
                  "split": [
                    65,
                    15,
                    20
                  ]
                },
                "uses": [
                  "ds-attn",
                  "ds-range",
                  "ds-count",
                  "ds-14",
                  "ds-split"
                ]
              },
              "value": "sitesAllDurations"
            }
          ],
          "reported": [
            {
              "id": "ds-count",
              "text": "Single-site images from 3000 readout images",
              "value": "27000",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "3.1",
                "page": 5
              }
            },
            {
              "id": "ds-each",
              "text": "The 27000 images are said to hold for each duration",
              "value": "27000 for each duration",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "6",
                "page": 11
              }
            },
            {
              "id": "ds-14",
              "text": "Number of readout durations",
              "value": "14",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "6",
                "page": 11
              }
            },
            {
              "id": "ds-split",
              "text": "Train, validation and test split",
              "value": "65-15-20 %",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "6",
                "page": 11
              }
            }
          ]
        },
        {
          "id": "p2-dataset:b4",
          "phase": "lecture",
          "text": "A dimmed long picture is only like a short exposure. It keeps the long exposure’s photon statistics. A truly timed short exposure would also see less atom motion and loss. So the [[pp-exposure-equivalent|equivalent exposure]] of 1.5 ms is a tenfold-dimmed long exposure.",
          "formal": "The honest reading: attenuating a long image keeps the statistics of the long exposure. A timed short exposure differs in atom motion and depumping (taught in the experiment track). So the paper's [[pp-exposure-equivalent|equivalent exposure]] of $1.5$ ms is a tenfold-dimmed $15$ ms image, and nobody ran a $1.5$ ms exposure (our reading; neutral note N4, no verdict on the result).",
          "caption": "two paths, one shot: what the dim picture is and is not",
          "captionFormal": "equivalent exposure: attenuated long exposure, not a timed short one",
          "stage": {
            "recipe": "dual-path",
            "params": {
              "attenuation": 10,
              "view": "frames"
            },
            "uses": [
              "ds-attn",
              "ds-range"
            ]
          },
          "claims": [
            {
              "key": "p2Atten15",
              "text": "a tenfold attenuation of 15 ms is 1.5 ms",
              "from": {
                "recipe": "dual-path",
                "params": {
                  "attenuation": 10,
                  "view": "frames",
                  "longMin": 15
                },
                "uses": [
                  "ds-attn",
                  "ds-range"
                ]
              },
              "value": "expLo"
            }
          ]
        },
        {
          "id": "p2-dataset:b5",
          "phase": "lecture",
          "text": "At the shortest exposures, the counts from bright and dark sites overlap, so a plain threshold errs. At the long ones they separate. The curve shows this for a simple model of ours, not for the dataset.",
          "formal": "Figs. 4–5 (text layer; pp. 5–6): at the shortest exposures the bright and dark histograms overlap, at the long ones they separate. The curve is a toy Poisson model with bright and dark rates of ours (illustrative), not the dataset; the denoiser's effect on one site is printed in the next unit.",
          "caption": "wrong-bit chance against exposure (toy model, ours)",
          "captionFormal": "toy Poisson overlap error against exposure (illustrative rates; not the dataset)",
          "stage": {
            "recipe": "dual-path",
            "params": {
              "attenuation": 10,
              "view": "overlap"
            }
          }
        }
      ],
      "review": {
        "points": [
          "One shot, two paths: a bright path labels, a dim path is tested.",
          "The dim path is a tenth as bright, an “equivalent exposure” of a tenth.",
          "3000 images of nine sites make 27000 single-site pictures.",
          "Nobody ran a timed exposure that short."
        ],
        "equations": "N_{\\text{sites}}=3000\\times9=27000",
        "trap": "Treating the shortest exposure as a timed one: it is a tenfold dimmed long one.",
        "formal": {
          "points": [
            "Attenuation $A=10$ maps each long exposure to a tenth of its length.",
            "The splits $65$, $15$, $20$ sum to $100$.",
            "Photon statistics are those of the long exposure; atom motion and depumping are not."
          ],
          "equations": "t_{\\text{eq}}=t_{\\text{long}}/A,\\quad N_{\\text{sites}}=3000\\times9",
          "trap": "Multiplying 27000 by 14 durations: p. 5 gives 27000 in all."
        },
        "claims": []
      }
    },
    {
      "id": "p2-denoiser",
      "title": "Denoise first, classify second",
      "question": "What does GANDALF learn, and how is it trained?",
      "source": {
        "summary": "Section 4 splits the problem in two. A conditional GAN, trained on pairs of dim and bright pictures, recovers the bright picture. A light classifier then decides. It gives the loss, the architecture of Table 2, the training settings and the failure modes.",
        "where": "§4, pp. 6–8; Figs. 6–7; Table 2"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "prior-bench"
        },
        "tryThis": [
          "Set the frame’s log-likelihood ratio to a value that favours dark, then move the prior up: a cleaner trained on mostly bright frames starts to see an atom that the frame does not support.",
          "Find the prior at which the frame is a coin flip. Beyond it, the training prior outvotes the evidence."
        ]
      },
      "insight": "Clean the picture first, then decide. The cleaner is learned from pairs of dim and bright pictures. One term asks for realism, and a heavily weighted term asks for pixel-by-pixel agreement.",
      "insightFormal": "The generator minimises $\\mathcal L_{\\text{GAN}}+\\lambda_{L1}\\|G(x)-y\\|_1$ with $\\lambda_{L1}=200$, a pix2pix-style objective on paired short- and long-exposure frames; the failure modes are hallucinated or suppressed sites and mode collapse, which the training choices target but cannot exclude.",
      "pitfalls": [
        "As reported: the paper never tests a Wiener or matched-filter baseline (neutral note N5). The 15 percent and 4 percent of Fig. 7 are for one site and one run."
      ],
      "story": [
        {
          "id": "p2-denoiser:b1",
          "phase": "lecture",
          "text": "First clean the picture, then decide bright or dark. The [[pp-denoiser|denoiser]] learns the clean-up from pairs: a dim picture and the bright picture of the same shot. A small, fast classifier then reads the cleaned picture.",
          "formal": "§1–4 (pp. 2, 6–7): signal recovery is separated from classification. A [[pp-denoiser|denoiser]], a conditional GAN ([[pp-cgan|cGAN]]; the objective is taught in <<pp-b5-pix2pix|B5's pix2pix unit>>), maps a short-exposure image to its long-exposure partner and a light classifier then decides per site. The picture is a stand-in: our linear Wiener smoother, live, against the sharp truth; the paper's network is not run here.",
          "caption": "noisy, linearly cleaned and true frames (simulated; the paper’s network is not run here)",
          "captionFormal": "left to right: Poisson counts, Wiener-smoothed counts, truth (simulated stand-in, not the paper’s network)",
          "stage": {
            "recipe": "linear-denoise",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "view": "frame"
            }
          },
          "trail": [
            {
              "ref": "iso17",
              "at": "§3 and §4, the conditional objective",
              "why": "The paper adopts this image-to-image framework and its L1-plus-adversarial loss; our beat paraphrases only the paper’s use of it."
            }
          ]
        },
        {
          "id": "p2-denoiser:b2",
          "phase": "lecture",
          "text": "Why not just smooth the picture? At low light the noise is as large as the signal. Smoothing blurs the spot and removes detail a decision needs. A blur, then reading the middle pixel, keeps only 0.86 of the separation.",
          "formal": "Gaussian, median and Wiener filtering blur sharp features at low photon counts (§4, p. 6). The paper does not test any of them, nor a matched filter (neutral note N5). With B5's linear tools (<<pp-b5-wiener|B5: a linear cleaner adds nothing>>), blur then the centre pixel keeps $0.86$ of the raw best separation. A linear cleaner followed by a linear decision cannot beat the best linear decision on the raw pixels.",
          "caption": "five linear pipelines on a seven-pixel strip (our model): what each keeps of the separation",
          "captionFormal": "output separation $d^2$ of five linear pipelines (our model, B5’s recipe)",
          "stage": {
            "recipe": "linear-denoise",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "view": "bars"
            }
          },
          "claims": [
            {
              "key": "p2BlurFrac",
              "text": "blur then the centre pixel keeps 0.86 of the raw separation (our model)",
              "from": {
                "recipe": "linear-denoise",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "view": "bars"
                }
              },
              "value": "blurFrac"
            }
          ]
        },
        {
          "id": "p2-denoiser:b3",
          "phase": "lecture",
          "text": "The generator’s [[pp-l1-gan-loss|loss]] has two demands. One asks the picture to look real. The other asks every pixel to match the bright picture, weighted 200 times. A mean pixel error of 0.0362 then counts as 7.24, against 0.69 for the realness term at its balance point.",
          "formal": "[[pp-l1-gan-loss|The generator loss]] (Eq. 3, p. 8) is $\\mathcal L_G=\\mathcal L_{\\text{GAN}}(G,D)+\\lambda_{L1}\\,\\mathbb E_{x,y}\\|G(x)-y\\|_1$ with $\\lambda_{L1}=200$. Training: Adam with $\\beta_1=0.5$, $\\beta_2=0.999$, rate $0.0002$, batch $16$, $30$ epochs. For the printed mean L1 of $0.0362$ (Table 3, 4×4) the weighted term is $7.24$; the realness term at the balance point $D=\\tfrac12$ is $\\ln 2=0.69$ (our arithmetic).",
          "caption": "the two terms of the loss on one scale (our arithmetic on printed settings)",
          "captionFormal": "weighted L1 term (reported inputs) against the GAN term at the balance point",
          "stage": {
            "recipe": "cgan-terms",
            "params": {
              "D": 0.5,
              "lambda": 200,
              "l1": 0.0362,
              "l1Reported": true
            },
            "uses": [
              "t3-l1",
              "d-lambda"
            ]
          },
          "introduces": [
            "pp-l1-gan-loss"
          ],
          "claims": [
            {
              "key": "p2L1Scaled",
              "text": "the weighted L1 term is 200 times 0.0362, which is 7.24",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.5,
                  "lambda": 200,
                  "l1": 0.0362,
                  "l1Reported": true
                },
                "uses": [
                  "t3-l1",
                  "d-lambda"
                ]
              },
              "value": "l1Scaled"
            },
            {
              "key": "p2GanEq",
              "text": "the GAN term at the balance point D = 1/2 is ln 2 = 0.69",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.5,
                  "lambda": 200,
                  "l1": 0.0362,
                  "l1Reported": true
                },
                "uses": [
                  "t3-l1",
                  "d-lambda"
                ]
              },
              "value": "ganEq"
            }
          ],
          "reported": [
            {
              "id": "d-lambda",
              "text": "Weight of the L1 term in the generator loss",
              "value": "200",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.2",
                "page": 8
              }
            },
            {
              "id": "d-adam",
              "text": "Adam moment parameters",
              "value": "0.5 and 0.999",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.2",
                "page": 8
              }
            },
            {
              "id": "d-lr",
              "text": "Learning rate",
              "value": "0.0002",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.2",
                "page": 8
              }
            },
            {
              "id": "d-batch",
              "text": "Batch size",
              "value": "16",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.2",
                "page": 8
              }
            },
            {
              "id": "d-epochs",
              "text": "Training epochs",
              "value": "30",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.2",
                "page": 8
              }
            },
            {
              "id": "t3-l1",
              "text": "Mean L1 loss at 4x4, 8x8, 32x32, 64x64",
              "value": "0.0362, 0.0365, 0.03701, 0.0367",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "3",
                "page": 10
              }
            }
          ]
        },
        {
          "id": "p2-denoiser:b4",
          "phase": "lecture",
          "text": "The generator squeezes the picture to find features, refines them in three [[pp-residual-block|residual blocks]], and expands it again, with shortcuts from early layers. Adding up the printed filters gives 4.7 million weights if each block holds two convolutions.",
          "formal": "Table 2 (p. 8): encoder $64\\to128\\to256$ channels, three [[pp-residual-block|residual blocks]] of $3\\times3\\times256\\times256$, a decoder with skip connections; the discriminator has four stride-2 convolutions. Counting the printed shapes with B5's layer counter: $4\\,695\\,744$ weights if each block holds two convolutions (the printed 4.7 million, p. 10), $2\\,926\\,272$ if one, and $1\\,549\\,376$ for the discriminator (our arithmetic; biases not counted). Table 2 prints one convolution per block (neutral note N6).",
          "caption": "weights per layer of the generator, counted from the printed filter shapes",
          "captionFormal": "weights per layer from Table 2’s shapes (two convolutions per block; our count)",
          "stage": {
            "recipe": "conv-stack",
            "params": {
              "layers": [
                {
                  "k": 3,
                  "cin": 1,
                  "cout": 64,
                  "bias": false
                },
                {
                  "k": 3,
                  "cin": 64,
                  "cout": 128,
                  "bias": false
                },
                {
                  "k": 3,
                  "cin": 128,
                  "cout": 256,
                  "bias": false
                },
                {
                  "k": 3,
                  "cin": 256,
                  "cout": 256,
                  "bias": false,
                  "repeat": 6
                },
                {
                  "k": 4,
                  "cin": 256,
                  "cout": 128,
                  "bias": false
                },
                {
                  "k": 4,
                  "cin": 256,
                  "cout": 64,
                  "bias": false
                },
                {
                  "k": 3,
                  "cin": 128,
                  "cout": 1,
                  "bias": false
                }
              ],
              "view": "numbers"
            },
            "uses": [
              "d-t2-res"
            ]
          },
          "claims": [
            {
              "key": "p2GenParams2",
              "text": "two convolutions per block give 4695744 weights",
              "from": {
                "recipe": "conv-stack",
                "params": {
                  "layers": [
                    {
                      "k": 3,
                      "cin": 1,
                      "cout": 64,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 64,
                      "cout": 128,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 128,
                      "cout": 256,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 256,
                      "cout": 256,
                      "bias": false,
                      "repeat": 6
                    },
                    {
                      "k": 4,
                      "cin": 256,
                      "cout": 128,
                      "bias": false
                    },
                    {
                      "k": 4,
                      "cin": 256,
                      "cout": 64,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 128,
                      "cout": 1,
                      "bias": false
                    }
                  ],
                  "view": "numbers"
                },
                "uses": [
                  "d-t2-res"
                ]
              },
              "value": "params"
            },
            {
              "key": "p2GenParams1",
              "text": "one convolution per block gives 2926272 weights",
              "from": {
                "recipe": "conv-stack",
                "params": {
                  "layers": [
                    {
                      "k": 3,
                      "cin": 1,
                      "cout": 64,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 64,
                      "cout": 128,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 128,
                      "cout": 256,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 256,
                      "cout": 256,
                      "bias": false,
                      "repeat": 3
                    },
                    {
                      "k": 4,
                      "cin": 256,
                      "cout": 128,
                      "bias": false
                    },
                    {
                      "k": 4,
                      "cin": 256,
                      "cout": 64,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 128,
                      "cout": 1,
                      "bias": false
                    }
                  ],
                  "view": "numbers"
                },
                "uses": [
                  "d-t2-res"
                ]
              },
              "value": "params"
            },
            {
              "key": "p2DiscParams",
              "text": "the discriminator has 1549376 weights",
              "from": {
                "recipe": "conv-stack",
                "params": {
                  "layers": [
                    {
                      "k": 3,
                      "cin": 1,
                      "cout": 64,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 64,
                      "cout": 128,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 128,
                      "cout": 256,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 256,
                      "cout": 512,
                      "bias": false
                    },
                    {
                      "k": 1,
                      "cin": 512,
                      "cout": 1,
                      "bias": false
                    }
                  ],
                  "view": "numbers"
                }
              },
              "value": "params"
            }
          ],
          "reported": [
            {
              "id": "d-t2-res",
              "text": "Filter shape printed for each residual block",
              "value": "3x3x256x256",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "2",
                "page": 8
              }
            },
            {
              "id": "d-params",
              "text": "Parameters of the generator",
              "value": "4.7 million",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "5.2",
                "page": 10
              }
            }
          ]
        },
        {
          "id": "p2-denoiser:b5",
          "phase": "lecture",
          "text": "A cleaner can fool you. It may invent an atom or erase a faint one, or [[pp-mode-collapse|collapse]] into always drawing bright or always dark. The paper counters this with smoothed labels, fewer discriminator updates, dropout, a falling learning rate and early stopping.",
          "formal": "§4.3–4.4 (p. 8): the failure modes are hallucinated or suppressed sites and [[pp-mode-collapse|mode collapse]]. Remedies: smoothed labels ($0.9$ for real, $0.1$ for fake), fewer discriminator than generator updates, discriminator dropout, a cosine-annealed rate, early stopping on validation L1. Why it matters: a training prior can flip a faint frame (<<pp-b5-pix2pix|B5>>), shown for a frame that favours dark.",
          "caption": "chance of an atom after a faint frame, against the training prior (toy, B5)",
          "captionFormal": "posterior against prior for a frame with log-likelihood ratio $-1$ (toy argument)",
          "stage": {
            "recipe": "prior-posterior",
            "params": {
              "llr": -1,
              "prior": 0.5
            }
          },
          "reported": [
            {
              "id": "d-smooth",
              "text": "Label smoothing targets for real and fake",
              "value": "0.9 and 0.1",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.4",
                "page": 8
              }
            }
          ]
        },
        {
          "id": "p2-denoiser:b6",
          "phase": "lecture",
          "text": "In one printed test, about 15 percent of a site’s images landed in the wrong quadrant without denoising, and about 4 percent with it. That is 3.75 times fewer. It is one site and one run.",
          "formal": "Fig. 7 (caption, p. 7), one site of the dataset: about 15 % of images land in the wrong quadrant (false positives in Q4, false negatives in Q2) without denoising and about 4 % with it. The ratio is $15/4=3.75$ (our arithmetic on rounded printed values); text only, one run, no error bar.",
          "caption": "the two printed shares (reported, not recomputed)",
          "captionFormal": "Fig. 7 caption values, as printed",
          "stage": {
            "recipe": "printed-ratio",
            "params": {
              "a": 15,
              "b": 4,
              "aLabel": "without denoising",
              "bLabel": "with denoising",
              "yLabel": "wrong quadrant (%)"
            },
            "uses": [
              "f7-mis-before",
              "f7-mis-after"
            ]
          },
          "claims": [
            {
              "key": "p2MisRatio",
              "text": "about 15 over about 4 is 3.75",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 15,
                  "b": 4,
                  "aLabel": "without denoising",
                  "bLabel": "with denoising",
                  "yLabel": "wrong quadrant (%)"
                },
                "uses": [
                  "f7-mis-before",
                  "f7-mis-after"
                ]
              },
              "value": "ratio"
            }
          ],
          "reported": [
            {
              "id": "f7-mis-before",
              "text": "Wrong-quadrant share without denoising (one site)",
              "value": "~15 %",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "7",
                "page": 7
              }
            },
            {
              "id": "f7-mis-after",
              "text": "Wrong-quadrant share with denoising (one site)",
              "value": "~4 %",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "7",
                "page": 7
              }
            }
          ]
        }
      ],
      "review": {
        "points": [
          "The denoiser is trained on pairs of dim and bright pictures of the same shot.",
          "The loss asks for a real-looking picture and, weighted 200 times, a pixel match.",
          "Adding up the printed filters gives about five million weights, if each block holds two convolutions.",
          "A cleaner can invent or erase an atom."
        ],
        "equations": "\\mathcal L_G=\\mathcal L_{\\text{GAN}}+\\lambda_{L1}\\|G(x)-y\\|_1,\\quad \\lambda_{L1}=200",
        "trap": "Reading the cleaned picture as a measurement: it is a guess from a model, and a faint atom may have been invented or removed.",
        "formal": {
          "points": [
            "The weighted L1 term at the printed mean L1 is much larger than the GAN term at balance.",
            "Table 2’s shapes sum to $4\\,695\\,744$ weights with two convolutions per block.",
            "Label smoothing, dropout and early stopping reduce, but do not exclude, collapse and hallucination."
          ],
          "equations": "\\mathcal L_G=\\mathcal L_{\\text{GAN}}(G,D)+\\lambda_{L1}\\,\\mathbb E\\|G(x)-y\\|_1",
          "trap": "Taking the Fig. 7 shares as a result for the whole dataset: the caption is for one site."
        },
        "claims": []
      },
      "play": [
        {
          "id": "p2-ch-params",
          "kind": "numeric",
          "tier": "core",
          "title": "Weights in one encoder layer",
          "prompt": "Enc3 of Table 2 has a filter shape of 3 × 3 × 128 × 256. How many weights does it hold (biases not counted)?",
          "answerFrom": {
            "from": {
              "recipe": "conv-stack",
              "params": {
                "layers": [
                  {
                    "k": 3,
                    "cin": 128,
                    "cout": 256,
                    "bias": false
                  }
                ],
                "view": "numbers"
              }
            },
            "value": "params"
          },
          "tolerance": 0,
          "hints": [
            {
              "text": "A convolution has one weight for every position of the filter, every input channel and every output channel."
            },
            {
              "text": "Multiply the four numbers of the filter shape."
            },
            {
              "text": "Nine positions times 128 times 256."
            }
          ],
          "walkthrough": [
            {
              "text": "The shape 3 × 3 × 128 × 256 multiplies out to 9 × 128 × 256."
            },
            {
              "text": "128 × 256 = 32768, and 9 × 32768 = 294912 weights."
            }
          ]
        }
      ]
    },
    {
      "id": "p2-classifiers",
      "title": "Small classifiers on clean pictures",
      "question": "Which classifier follows the denoiser, and at what cost?",
      "source": {
        "summary": "Section 4.5 and Fig. 9 compare three light classifiers on the denoised patches. They are a feedforward net, a matched filter with a small net, and a CNN. The comparison is by the share of baseline errors removed, parameters and inference time.",
        "where": "§4.5, p. 9; Figs. 8–9"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "eta-calc"
        },
        "tryThis": [
          "Set η to 62 percent and watch the factor: the error is divided by about 2.6, not by 6.",
          "Raise η to 90 percent. The factor is 10, but the error left is a tenth of the baseline, which is why a small η gain near the top is a big factor."
        ]
      },
      "insight": "Once the picture is clean, a small per-site classifier does as well as a big CNN does on the raw picture. η says what share of the baseline’s errors vanishes; 1/(1 − η) is the factor.",
      "insightFormal": "On denoised site patches FNN, MF+NN and CNN all remove over 60 % of the baseline CNN(Site)’s errors (Fig. 9); $\\eta$ converts to a factor $1/(1-\\eta)$, and the lightest model has $17.75$ times fewer parameters than the baseline. The paper does not compare with a tuned matched filter on the raw pixels.",
      "pitfalls": [
        "As reported: “up to 16.5 times smaller” is the paper’s figure. The printed bar labels give 17.75 for the MF-NN against 355 k (neutral note N8)."
      ],
      "story": [
        {
          "id": "p2-classifiers:b1",
          "phase": "lecture",
          "text": "After cleaning, each site gets its own small classifier. Two read the patch flattened into a list of numbers: a plain [[pp-fnn|feedforward net]] and a [[pp-mf-nn|matched filter with a small net]]. The third, a CNN, reads the patch as a picture.",
          "formal": "One model per site (§4.5, p. 9, Fig. 8): the [[pp-fnn|FNN]] and the [[pp-mf-nn|MF+NN]] take a flattened site patch (MF+NN adds matched-filter features, see <<pp-b5-matched-filter|B5's likelihood-ratio weights>>); the CNN takes the 2-D patch. The frame is a simulated site with its 3×3 box (illustration).",
          "caption": "one site’s patch (simulated), the box a classifier reads",
          "captionFormal": "simulated site and ROI; flatten for FNN and MF+NN, 2-D for the CNN",
          "stage": {
            "recipe": "pixel-frame",
            "params": {
              "rows": 5,
              "cols": 5,
              "sites": [
                [
                  2,
                  2
                ]
              ],
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "noise": "poisson",
              "seed": 3,
              "roi": 3,
              "show": "counts"
            }
          }
        },
        {
          "id": "p2-classifiers:b2",
          "phase": "lecture",
          "text": "To compare them the paper uses [[pp-eta|η]]. It says what share of the baseline’s errors disappears. If η is 62.1 %, the error is divided by 2.64.",
          "formal": "[[pp-eta|Relative infidelity reduction]] $\\eta=1-\\delta_{\\text{method}}/\\delta_{\\text{CNN(Site)}}$ with $\\delta$ the classification inaccuracy (p. 9). The error is divided by $1/(1-\\eta)$: an $\\eta$ of 60.9 % gives $2.56$, 62.1 % gives $2.64$ and 66.1 % gives $2.95$ (our arithmetic on the bar labels of Fig. 9).",
          "caption": "η as a factor: the error is divided by 1/(1 − η)",
          "captionFormal": "$\\eta\\to1/(1-\\eta)$, with the chosen $\\eta$ marked",
          "stage": {
            "recipe": "eta-factor",
            "params": {
              "eta": 62.1
            },
            "uses": [
              "f9-eta-cnn"
            ]
          },
          "introduces": [
            "pp-eta"
          ],
          "claims": [
            {
              "key": "p2EtaMF",
              "text": "η of 60.9 percent divides the error by 2.56",
              "from": {
                "recipe": "eta-factor",
                "params": {
                  "eta": 60.9
                },
                "uses": [
                  "f9-eta-mf"
                ]
              },
              "value": "factor"
            },
            {
              "key": "p2EtaCNN",
              "text": "η of 62.1 percent divides the error by 2.64",
              "from": {
                "recipe": "eta-factor",
                "params": {
                  "eta": 62.1
                },
                "uses": [
                  "f9-eta-cnn"
                ]
              },
              "value": "factor"
            },
            {
              "key": "p2EtaFNN",
              "text": "η of 66.1 percent divides the error by 2.95",
              "from": {
                "recipe": "eta-factor",
                "params": {
                  "eta": 66.1
                },
                "uses": [
                  "f9-eta-fnn"
                ]
              },
              "value": "factor"
            }
          ],
          "reported": [
            {
              "id": "f9-eta-mf",
              "text": "Improvement eta of MF-NN",
              "value": "60.9 %",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            },
            {
              "id": "f9-eta-cnn",
              "text": "Improvement eta of CNN",
              "value": "62.1 %",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            },
            {
              "id": "f9-eta-fnn",
              "text": "Improvement eta of FNN",
              "value": "66.1 %",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            }
          ]
        },
        {
          "id": "p2-classifiers:b3",
          "phase": "lecture",
          "text": "The paper also plots size and speed. In units of a hundred thousand, the matched-filter net has 0.2, the CNN 1.6 and the feedforward net 12.7. Inference takes 11.2, 21.9 and 16.2 microseconds.",
          "formal": "Fig. 9 (p. 9): parameters in units of $100$ K: MF-NN $0.2$, CNN $1.6$, FNN $12.7$; inference time in µs: $11.2$, $21.9$, $16.2$. Against the baseline's 355 k (p. 6) the MF-NN is $17.75$ times smaller and the FNN $3.58$ times larger (our arithmetic); the text says up to 16.5 times smaller (neutral note N8). The denoiser has $13.2$ times the baseline's parameters and is not in Fig. 9.",
          "caption": "the lightest classifier against the baseline: parameters",
          "captionFormal": "baseline single-site CNN against the MF-NN (printed parameter counts)",
          "stage": {
            "recipe": "printed-ratio",
            "params": {
              "a": 355000,
              "b": 20000,
              "aLabel": "baseline 355 k",
              "bLabel": "MF-NN 20 k",
              "yLabel": "parameters",
              "log": "log"
            },
            "uses": [
              "p6-cnn-site",
              "f9-par-mf"
            ]
          },
          "claims": [
            {
              "key": "p2ParRatioMF",
              "text": "355 k over 20 k is 17.75",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 355000,
                  "b": 20000,
                  "aLabel": "baseline 355 k",
                  "bLabel": "MF-NN 20 k",
                  "yLabel": "parameters",
                  "log": "log"
                },
                "uses": [
                  "p6-cnn-site",
                  "f9-par-mf"
                ]
              },
              "value": "ratio"
            },
            {
              "key": "p2ParRatioFNN",
              "text": "12.7 hundred thousand over 355 k is 3.58",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 1270000,
                  "b": 355000,
                  "aLabel": "FNN 1.27 M",
                  "bLabel": "baseline 355 k",
                  "yLabel": "parameters",
                  "log": "log"
                },
                "uses": [
                  "f9-par-fnn",
                  "p6-cnn-site"
                ]
              },
              "value": "ratio"
            },
            {
              "key": "p2DenoiserRatio",
              "text": "the denoiser’s 4.7 million over 355 k is 13.2",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 4700000,
                  "b": 355000,
                  "aLabel": "denoiser 4.7 M",
                  "bLabel": "baseline 355 k",
                  "yLabel": "parameters",
                  "log": "log"
                },
                "uses": [
                  "d-params",
                  "p6-cnn-site"
                ]
              },
              "value": "ratio"
            }
          ],
          "reported": [
            {
              "id": "f9-par-mf",
              "text": "Parameters of MF-NN, in units of 100 K",
              "value": "0.2",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            },
            {
              "id": "f9-par-cnn",
              "text": "Parameters of CNN, in units of 100 K",
              "value": "1.6",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            },
            {
              "id": "f9-par-fnn",
              "text": "Parameters of FNN, in units of 100 K",
              "value": "12.7",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            },
            {
              "id": "f9-inf-mf",
              "text": "Inference time of MF-NN, in microseconds",
              "value": "11.2",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            },
            {
              "id": "f9-inf-cnn",
              "text": "Inference time of CNN, in microseconds",
              "value": "21.9",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            },
            {
              "id": "f9-inf-fnn",
              "text": "Inference time of FNN, in microseconds",
              "value": "16.2",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "9",
                "page": 9
              }
            },
            {
              "id": "p6-cnn-site",
              "text": "Parameters of the baseline single-site CNN",
              "value": "355k",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "3.3",
                "page": 6
              }
            },
            {
              "id": "f9-165",
              "text": "Model-size reduction quoted in the text",
              "value": "up to 16.5x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.5",
                "page": 9
              }
            }
          ]
        },
        {
          "id": "p2-classifiers:b4",
          "phase": "lecture",
          "text": "A matched filter is itself a weighted sum of pixels. So the strong simple rival is not the CNN the paper compares with. The paper itself notes that MF+NN matches the feedforward net with far fewer parameters.",
          "formal": "A matched filter is a pixel-weighted total (<<pp-b5-matched-filter|B5>>), which Kent et al. fit from labelled shots at a small fraction of a CNN's cost. The paper compares with CNN baselines only (neutral note N9); a tuned weighted sum on the raw pixels is not in its figures. It does note that MF+NN matches the FNN's accuracy with fewer parameters (p. 9). The plot is B5's exact error of four weighted sums in our model.",
          "caption": "wrong-bit chance of four weighted sums of a pixel box (our model)",
          "captionFormal": "exact errors of centre, flat, Gaussian-shaped and likelihood-ratio sums (B5’s recipe; our model)",
          "stage": {
            "recipe": "filter-compare",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "tau": 1,
              "view": "errors"
            }
          },
          "trail": [
            {
              "ref": "ken25",
              "at": "the matched-filter results and the cost comparison",
              "why": "A fitted matched filter replaces a CNN at a small fraction of the cost; the paper’s MF+NN uses such filters but compares with CNNs."
            }
          ]
        }
      ],
      "review": {
        "points": [
          "After cleaning, each site gets a small classifier of its own.",
          "η is the share of the baseline’s errors that disappears; the error is divided by 1/(1 − η).",
          "A 62 percent η is a factor between two and three.",
          "The lightest model has about 18 times fewer parameters than the baseline."
        ],
        "equations": "\\eta=1-\\frac{\\delta_{\\text{method}}}{\\delta_{\\text{CNN(Site)}}},\\quad \\text{factor}=(1-\\eta)^{-1}",
        "trap": "Reading a 62 percent reduction as “sixty percent as good as the baseline”: it means the errors fall by that share.",
        "formal": {
          "points": [
            "$\\eta=1-\\delta_{\\text{method}}/\\delta_{\\text{CNN(Site)}}$, so $\\delta_{\\text{method}}=(1-\\eta)\\,\\delta_{\\text{CNN(Site)}}$.",
            "The factor is $1/(1-\\eta)$ and grows quickly near $\\eta=1$.",
            "Parameter ratios use the printed bar labels, which are rounded."
          ],
          "equations": "\\delta_{\\text{method}}=(1-\\eta)\\,\\delta_{\\text{CNN(Site)}}",
          "trap": "Comparing a fitted matched filter on raw pixels with nothing: the paper’s baseline is a CNN, not a weighted sum."
        },
        "claims": []
      },
      "play": [
        {
          "id": "p2-ch-eta",
          "kind": "numeric",
          "tier": "core",
          "title": "The error that is left",
          "prompt": "A baseline classifier errs on 4.0 percent of images. A method with η = 62.1 percent is used instead. What percent of images does it get wrong?",
          "answerFrom": {
            "from": {
              "recipe": "eta-factor",
              "params": {
                "eta": 62.1,
                "base": 4
              }
            },
            "value": "newErr"
          },
          "tolerance": 0.005,
          "unit": "percent",
          "hints": [
            {
              "text": "η is the share of the baseline’s errors that disappears."
            },
            {
              "text": "What stays is one minus η of the baseline’s error."
            },
            {
              "text": "Multiply 4.0 by one minus 0.621."
            }
          ],
          "walkthrough": [
            {
              "text": "Errors left: 1 − 0.621 = 0.379 of the baseline’s."
            },
            {
              "text": "4.0 × 0.379 = 1.516, about 1.52 percent."
            }
          ]
        }
      ]
    },
    {
      "id": "p2-results",
      "title": "Accuracy and scaling",
      "question": "How much faster can readout be, and does the denoiser scale?",
      "source": {
        "summary": "Sections 5 and 7.1 report error against readout time, the headline factors and the post-selected best case. They also show how the denoiser’s quality and latency grow with array size, batch size and parallel models (Figs. 10, 12–13; Tables 3–5).",
        "where": "§5.1–5.2, §7.1, pp. 9–12; Figs. 10, 12–13; Tables 3–5"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "exposure-bench"
        },
        "tryThis": [
          "The paper’s question in one picture: how little exposure still gives a small error? Raise the exposure and watch where the box error crosses a level you choose.",
          "Compare the flat-box line with the best-weights line: a better rule moves the crossing to a shorter exposure, which is what the denoiser claims to do."
        ]
      },
      "insight": "A denoiser lets the error stay below one percent at a shorter readout than the baseline: a little, not a lot, by the printed numbers. The headline factors are for different conditions.",
      "insightFormal": "From the printed sub-one-percent durations the readout can be shortened by $1.24$ (5 µm) and $1.25$ (9 µm); the abstract’s $1.6$ and the headline error factors ($2.8$ at $1.5$ ms, “up to $2.5$”) answer other comparisons. Post-selection and scaling are separate claims, each with its own caveat.",
      "pitfalls": [
        "As reported: the 2.5× and the 2.8× are quoted for different conditions, and the abstract’s 1.6× has no printed comparison (neutral notes N7 and E1)."
      ],
      "story": [
        {
          "id": "p2-results:b1",
          "phase": "lecture",
          "text": "The paper shows curves of error against exposure; we redraw only the printed crossings. GANDALF stays below one percent error down to 2.9 ms at 5 µm spacing and 3.2 ms at 9 µm. The baseline reaches that level at 3.6 and 4 ms.",
          "formal": "§7.1 (p. 12): the error stays below one percent up to 2.9 ms (5 µm) and 3.2 ms (9 µm) for GANDALF, against 3.6 and 4 ms for the baseline. The ratios are $3.6/2.9=1.24$ and $4/3.2=1.25$ (our arithmetic). The abstract says up to 1.6 times shorter readout. From the sub-one-percent durations printed in §7.1 we find 1.24 and 1.25 times; the paper does not print the comparison behind 1.6 (neutral note E1). The curves of Fig. 12 are not redrawn.",
          "caption": "the four printed crossing times (no curve, only what the text states)",
          "captionFormal": "sub-one-percent limits of §7.1 as printed, GANDALF against the baseline at two spacings",
          "stage": {
            "kind": "plot",
            "points": [
              {
                "x": 5,
                "y": 2.9,
                "label": "GANDALF",
                "status": "reported",
                "group": "GANDALF"
              },
              {
                "x": 9,
                "y": 3.2,
                "label": "GANDALF",
                "status": "reported",
                "group": "GANDALF"
              },
              {
                "x": 5,
                "y": 3.6,
                "label": "baseline",
                "status": "reported",
                "group": "baseline"
              },
              {
                "x": 9,
                "y": 4,
                "label": "baseline",
                "status": "reported",
                "group": "baseline"
              }
            ],
            "xLabel": "spacing (µm)",
            "yLabel": "sub-1 % limit (ms)"
          },
          "claims": [
            {
              "key": "p2CrossRatio5",
              "text": "3.6 over 2.9 is 1.24",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 3.6,
                  "b": 2.9,
                  "aLabel": "baseline 5 µm",
                  "bLabel": "GANDALF 5 µm",
                  "yLabel": "longest readout (ms)"
                },
                "uses": [
                  "f12-x-5b",
                  "f12-x-5g"
                ]
              },
              "value": "ratio"
            },
            {
              "key": "p2CrossRatio9",
              "text": "4 over 3.2 is 1.25",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 4,
                  "b": 3.2,
                  "aLabel": "baseline 9 µm",
                  "bLabel": "GANDALF 9 µm",
                  "yLabel": "longest readout (ms)"
                },
                "uses": [
                  "f12-x-9b",
                  "f12-x-9g"
                ]
              },
              "value": "ratio"
            }
          ],
          "reported": [
            {
              "id": "f12-x-5g",
              "text": "Sub-1 % limit of GANDALF at 5 micrometre, in ms",
              "value": "2.9",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            },
            {
              "id": "f12-x-5b",
              "text": "Sub-1 % limit of the baseline at 5 micrometre, in ms",
              "value": "3.6",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            },
            {
              "id": "f12-x-9g",
              "text": "Sub-1 % limit of GANDALF at 9 micrometre, in ms",
              "value": "3.2",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            },
            {
              "id": "f12-x-9b",
              "text": "Sub-1 % limit of the baseline at 9 micrometre, in ms",
              "value": "4",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            },
            {
              "id": "r-short",
              "text": "Shorter readout time claimed in the abstract",
              "value": "up to 1.6x",
              "source": "paper-gdf",
              "at": {
                "kind": "text",
                "page": 1
              }
            }
          ]
        },
        {
          "id": "p2-results:b2",
          "phase": "lecture",
          "text": "The headline is a 2.8 times lower error at 1.5 ms. Elsewhere the paper says up to 2.5 times. The averaged η is about 64 % at 5 µm and 53 % at 9 µm, which are factors of 2.78 and 2.13.",
          "formal": "§7.1 (p. 12) and p. 9: a $2.8$ times lower error than CNN(Site) at $1.5$ ms, and “up to $2.5$ times” at the shortest durations. The averaged $\\eta$ is about 64 % (5 µm) and about 53 % (9 µm). In our arithmetic these are factors of $2.78$ and $2.13$. Neutral note N7: the paper quotes the $2.5$ and the $2.8$ for different conditions, which it does not spell out.",
          "caption": "η of about 64 percent as a factor of the baseline’s error",
          "captionFormal": "$\\eta=64\\,\\%$ marked on $1/(1-\\eta)$",
          "stage": {
            "recipe": "eta-factor",
            "params": {
              "eta": 64
            },
            "uses": [
              "r-eta5"
            ]
          },
          "claims": [
            {
              "key": "p2Eta5",
              "text": "η of 64 percent divides the error by 2.78",
              "from": {
                "recipe": "eta-factor",
                "params": {
                  "eta": 64
                },
                "uses": [
                  "r-eta5"
                ]
              },
              "value": "factor"
            },
            {
              "key": "p2Eta9",
              "text": "η of 53 percent divides the error by 2.13",
              "from": {
                "recipe": "eta-factor",
                "params": {
                  "eta": 53
                },
                "uses": [
                  "r-eta9"
                ]
              },
              "value": "factor"
            }
          ],
          "reported": [
            {
              "id": "r-factor-1p5",
              "text": "Error reduction at the 1.5 ms exposure",
              "value": "2.8x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            },
            {
              "id": "r-factor-abs",
              "text": "Error reduction at the shortest durations in the abstract-level summary",
              "value": "up to 2.5x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.5",
                "page": 9
              }
            },
            {
              "id": "r-eta5",
              "text": "Average eta at 5 micrometre spacing",
              "value": "~64 %",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            },
            {
              "id": "r-eta9",
              "text": "Average eta at 9 micrometre spacing",
              "value": "~53 %",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            },
            {
              "id": "r-at-1p5",
              "text": "The short exposure of the headline comparison, in ms",
              "value": "1.5",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            }
          ]
        },
        {
          "id": "p2-results:b3",
          "phase": "lecture",
          "text": "The data are imperfect, so the paper builds a cleaner best case. It fits two bumps to the classifier’s scores and keeps only confident images. In a toy of ours with a plain error of 0.023, the cut keeps 0.84 of the images and the error falls to 0.0016.",
          "formal": "§7.1 (p. 12, Fig. 13): two overlapping Gaussian bumps are fitted to the decision scores and only confident images are kept; the paper reports below one percent inaccuracy even at the shortest duration. It prints no kept fraction (neutral note N10). Toy of ours: scores $N(\\mp2,1)$, keep $|s|\\ge1$: plain error $0.023$, kept share $0.84$, error of the kept ones $0.0016$ (not the paper’s data).",
          "caption": "toy post-selection: error of the kept images and the share kept, against the cut-off (ours)",
          "captionFormal": "toy two-bump scores $N(\\mp2,1)$: kept share and error against the cut on $|s|$ (our inputs)",
          "stage": {
            "recipe": "post-select",
            "params": {
              "sep": 2,
              "cut": 1
            }
          },
          "claims": [
            {
              "key": "p2PlainErr",
              "text": "the toy’s plain error is 0.023",
              "from": {
                "recipe": "post-select",
                "params": {
                  "sep": 2,
                  "cut": 1
                }
              },
              "value": "errAll"
            },
            {
              "key": "p2KeepFrac",
              "text": "the toy keeps 0.84 of the images",
              "from": {
                "recipe": "post-select",
                "params": {
                  "sep": 2,
                  "cut": 1
                }
              },
              "value": "keep"
            },
            {
              "key": "p2KeptErr",
              "text": "the error of the kept images is 0.0016",
              "from": {
                "recipe": "post-select",
                "params": {
                  "sep": 2,
                  "cut": 1
                }
              },
              "value": "errKept"
            }
          ]
        },
        {
          "id": "p2-results:b4",
          "phase": "lecture",
          "text": "A fully convolutional denoiser accepts any size. From 4 by 4 to 64 by 64 atoms the pixels grow 256 times, but the time only 166.6 times. The cost per site falls from 12.6 to 8.2 microseconds, while image quality (scored by [[pp-psnr|PSNR]] and [[pp-ssim|SSIM]]) barely changes.",
          "formal": "Table 3 (p. 10): [[pp-psnr|PSNR]] $25.17\\to24.86$ dB, [[pp-ssim|SSIM]] almost unchanged, latency $0.201\\to33.490$ ms from $4\\times4$ to $64\\times64$. Pixels grow $\\times256$ and latency $\\times166.6$, so the cost per site goes from $12.6$ to $8.2$ µs (our arithmetic): sublinear. The set-up is a denoiser trained on $3\\times3$ arrays and tested on stitched single-atom images.",
          "caption": "printed latency against pixels, and what it would be if cost were proportional",
          "captionFormal": "Table 3 latencies against the proportional line from 4×4 (log–log)",
          "stage": {
            "recipe": "latency-tp",
            "params": {
              "view": "table3"
            },
            "uses": [
              "t3-lat"
            ]
          },
          "claims": [
            {
              "key": "p2PixelRatio",
              "text": "64 by 64 has 256 times the pixels of 4 by 4",
              "from": {
                "recipe": "latency-tp",
                "params": {
                  "view": "table3"
                },
                "uses": [
                  "t3-lat"
                ]
              },
              "value": "pixelRatio"
            },
            {
              "key": "p2LatRatio",
              "text": "the latency grows 166.6 times",
              "from": {
                "recipe": "latency-tp",
                "params": {
                  "view": "table3"
                },
                "uses": [
                  "t3-lat"
                ]
              },
              "value": "latRatio"
            },
            {
              "key": "p2PerSite4",
              "text": "the cost per site at 4 by 4 is 12.6 µs",
              "from": {
                "recipe": "latency-tp",
                "params": {
                  "view": "table3"
                },
                "uses": [
                  "t3-lat"
                ]
              },
              "value": "perSite4"
            },
            {
              "key": "p2PerSite64",
              "text": "the cost per site at 64 by 64 is 8.2 µs",
              "from": {
                "recipe": "latency-tp",
                "params": {
                  "view": "table3"
                },
                "uses": [
                  "t3-lat"
                ]
              },
              "value": "perSite64"
            }
          ],
          "reported": [
            {
              "id": "t3-psnr",
              "text": "PSNR in dB at 4x4, 8x8, 32x32, 64x64",
              "value": "25.17, 25.06, 24.79, 24.86",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "3",
                "page": 10
              }
            },
            {
              "id": "t3-lat",
              "text": "Latency in ms at 4x4, 8x8, 32x32, 64x64",
              "value": "0.201, 0.514, 9.091, 33.490",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "3",
                "page": 10
              }
            }
          ]
        },
        {
          "id": "p2-results:b5",
          "phase": "lecture",
          "text": "The printed [[pp-throughput-latency|latency]] is the inverse of throughput. One 3 by 3 image alone takes 2.174 ms, longer than the shortest exposure, while a full batch of 128 takes 10.07 ms. Table 3’s 0.201 ms and this 2.174 ms are not reconciled.",
          "formal": "Table 4 (p. 10): [[pp-throughput-latency|latency]] is $1000/\\mathrm{TP}$ ms per image; it reproduces all five printed entries to their digits, the largest gap being $0.0004$ ms (our arithmetic). A batch of 128 at 12711.4 images per second takes $10.07$ ms. The single $3\\times3$ image of Table 4 ($2.174$ ms) and Table 3’s $4\\times4$ ($0.201$ ms) are $10.8$ times apart and the paper does not reconcile them (neutral note N11). Table 5: 80–90 µs with parallel models.",
          "caption": "printed latency per image and 1000 over the printed throughput, by batch size",
          "captionFormal": "Table 4: printed latency and $1000/\\mathrm{TP}$ (log–log)",
          "stage": {
            "recipe": "latency-tp",
            "params": {
              "view": "table4"
            },
            "uses": [
              "t4-tp",
              "t4-lat"
            ]
          },
          "claims": [
            {
              "key": "p2LatTP",
              "text": "the largest gap between 1000 over TP and the printed latency is 0.0004 ms",
              "from": {
                "recipe": "latency-tp",
                "params": {
                  "view": "table4"
                },
                "uses": [
                  "t4-tp",
                  "t4-lat"
                ]
              },
              "value": "latTp"
            },
            {
              "key": "p2BatchTime",
              "text": "a batch of 128 at 12711.4 images per second takes 10.07 ms",
              "from": {
                "recipe": "latency-tp",
                "params": {
                  "view": "table4"
                },
                "uses": [
                  "t4-tp",
                  "t4-lat"
                ]
              },
              "value": "batch128"
            },
            {
              "key": "p2Lat34",
              "text": "2.174 over 0.201 is 10.8",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 2.174,
                  "b": 0.201,
                  "aLabel": "3x3, batch 1 (Table 4)",
                  "bLabel": "4x4 (Table 3)",
                  "yLabel": "latency (ms)"
                },
                "uses": [
                  "t4-lat",
                  "t3-lat4"
                ]
              },
              "value": "ratio"
            }
          ],
          "reported": [
            {
              "id": "t4-tp",
              "text": "Throughput in images per second, batch 1, 8, 32, 64, 128",
              "value": "460.0, 3330.3, 9225.0, 11721.4, 12711.4",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "4",
                "page": 10
              }
            },
            {
              "id": "t4-lat",
              "text": "Latency in ms, batch 1, 8, 32, 64, 128",
              "value": "2.174, 0.300, 0.108, 0.085, 0.079",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "4",
                "page": 10
              }
            },
            {
              "id": "t5-lat",
              "text": "Latency in ms with 4, 8, 16, 32 parallel models",
              "value": "0.094, 0.089, 0.085, 0.083",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "5",
                "page": 10
              }
            },
            {
              "id": "t3-lat4",
              "text": "Latency at 4x4, in ms",
              "value": "0.201",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "3",
                "page": 10
              }
            }
          ]
        },
        {
          "id": "p2-results:b6",
          "phase": "deeper",
          "text": "How good could any classifier be? Physics sets a floor. For Poisson counts at a given exposure, no rule beats the likelihood-ratio rule. The paper does not show how close its classifiers come to that floor.",
          "formal": "A Bayes bound from the Poisson model of the experiment track (<<pp-q25-readout|reading by counting photons>>, <<pp-o11-hist|two histograms and a cutoff>>) and B5's likelihood-ratio sum (<<pp-b5-matched-filter|B5>>) gives the least error of any classifier at an exposure. The paper does not compute it, so how near its classifiers get is open. The picture is B5's error against exposure in our model.",
          "caption": "wrong-bit chance of four weighted sums against exposure (our model)",
          "captionFormal": "exact errors against exposure; the likelihood-ratio line is the Bayes error (our model)",
          "stage": {
            "recipe": "filter-compare",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "tau": 1,
              "view": "tau"
            }
          }
        }
      ],
      "review": {
        "points": [
          "The printed crossings show GANDALF keeping the error below one percent at a shorter readout than the baseline, at both spacings.",
          "From these the readout can be shortened by about a quarter.",
          "Post-selection keeps only confident images and is a best case.",
          "The denoiser’s cost per site falls as the array grows."
        ],
        "equations": "\\text{latency per image}=1000\\,\\mathrm{ms}/\\mathrm{TP}",
        "trap": "Taking one of the headline factors as the speed-up: they answer different questions.",
        "formal": {
          "points": [
            "The sub-one-percent durations give ratios of about one and a quarter; the abstract’s figure has no printed comparison.",
            "Post-selection discards uncertain images, so its error is for a subset.",
            "Latency per site falls between $4\\times4$ and $64\\times64$ arrays."
          ],
          "equations": "\\text{latency}=1000\\,\\mathrm{ms}/\\mathrm{TP},\\quad \\text{ratio}=t_{\\text{base}}/t_{\\text{GANDALF}}",
          "trap": "Comparing Table 3’s latency for 4×4 with Table 4’s for 3×3 batch 1: the paper does not reconcile them."
        },
        "claims": []
      },
      "play": [
        {
          "id": "p2-ch-batch",
          "kind": "numeric",
          "tier": "core",
          "title": "A batch of 128",
          "prompt": "A denoiser runs at 12711.4 images per second with a batch of 128. How many milliseconds does one batch take?",
          "answerFrom": {
            "from": {
              "recipe": "latency-tp",
              "params": {
                "view": "table4"
              }
            },
            "value": "batch128"
          },
          "tolerance": 0.005,
          "unit": "ms",
          "hints": [
            {
              "text": "Throughput is images per second."
            },
            {
              "text": "Time = number of images divided by throughput."
            },
            {
              "text": "128 over 12711.4, in seconds, then in milliseconds."
            }
          ],
          "walkthrough": [
            {
              "text": "128 / 12711.4 = 0.01007 s."
            },
            {
              "text": "That is 10.07 ms for the batch."
            }
          ]
        },
        {
          "id": "p2-ch-spot",
          "kind": "choice",
          "tier": "stretch",
          "title": "Which printed numbers disagree?",
          "prompt": "The abstract says up to 1.6 times shorter readout. Section 7.1 prints sub-one-percent limits of 2.9 and 3.6 ms (5 µm). What do the printed limits alone give?",
          "options": [
            {
              "text": "About 1.24 times, not 1.6: the comparison behind 1.6 is not printed.",
              "correct": true,
              "why": "3.6 / 2.9 = 1.24 (and 4 / 3.2 = 1.25 at 9 µm); the paper may have another comparison we cannot see."
            },
            {
              "text": "Exactly 1.6 times.",
              "correct": false,
              "why": "3.6 / 2.9 is 1.24, not 1.6."
            },
            {
              "text": "About 2.8 times.",
              "correct": false,
              "why": "2.8 is the error reduction at 1.5 ms, a different quantity."
            }
          ],
          "hints": [
            {
              "text": "Divide the baseline’s limit by GANDALF’s."
            },
            {
              "text": "Use 3.6 and 2.9."
            },
            {
              "text": "The result is a little above one and a quarter."
            }
          ],
          "walkthrough": [
            {
              "text": "3.6 / 2.9 = 1.24."
            },
            {
              "text": "The same at 9 µm gives 4 / 3.2 = 1.25, so the printed limits do not give 1.6."
            }
          ]
        }
      ]
    },
    {
      "id": "p2-pipeline",
      "title": "Hiding the classical work",
      "question": "How do Eqs. 4 and 5 take the denoising and classification off the critical path?",
      "source": {
        "summary": "Section 5.3 argues that denoising and classification can overlap the next acquisition if atom reloading waits one round; Eqs. 4 and 5 give the two run times. Section 7.3 and Fig. 15 report 100-round totals at three error tolerances.",
        "where": "§5.3, p. 11, Fig. 11; §7.3, p. 13, Fig. 15"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "fig15-readback"
        },
        "tryThis": [
          "Read the three tolerance groups with the slider: the classification time of the baseline comes out the same at every group, and it is the 500 µs the paper quotes for a 3 by 3 array.",
          "Change the assumed denoiser-plus-classifier time. The GANDALF readout-plus-gate time moves; that assumption is ours, not printed."
        ]
      },
      "insight": "Done in a row the stages add up. Overlap them and only the last round’s classical work shows. The printed bars of Fig. 15 hide a classification time of half a millisecond, and the 1.77 is the best of three bars.",
      "insightFormal": "Eq. 4: $T_{\\text{unp}}=d(t_g+t_r+t_c)$; Eq. 5: $T_{\\text{pip}}=d(t_r+t_g)+(t_{\\text{den}}+t_c)$, valid while $t_{\\text{den}}+t_c\\le t_r+t_g$; the saving is $(d-1)t_c-t_{\\text{den}}$. Fig. 15 implies $t_c=0.5$ ms; at one readout time pipelining alone gains little, the large gain being the shorter readout.",
      "pitfalls": [
        "As reported: the 1.77× is the two-percent pair’s ratio, the best of three. The text’s 0.19 s to 0.152 s matches no bar (Correction E2). Loss and reload are not simulated (note N13)."
      ],
      "story": [
        {
          "id": "p2-pipeline:b1",
          "phase": "lecture",
          "text": "Draw gates, acquisition, denoising and classification on a time line. Done one after another, they add up. [[pp-pipelined-readout|Overlap]] them, and only the last round’s classical work still shows.",
          "formal": "Fig. 11 (p. 11): (a) the baseline, sequential with a long acquisition; (b) unpipelined with the denoiser, a shorter acquisition plus the denoising time; (c) [[pp-pipelined-readout|pipelined]]: the denoising and classification of round $k$ overlap the acquisition of round $k+1$. The boxes are drawn by the engine from illustrative widths of ours, not the paper’s. Eqs. 4 and 5 follow.",
          "caption": "three schedules for three rounds (illustrative widths)",
          "captionFormal": "Fig. 11 as boxes: baseline, unpipelined with denoiser, pipelined (our widths)",
          "stage": {
            "recipe": "readout-timeline",
            "params": {
              "mode": "abc",
              "drawn": 3,
              "d": 100,
              "tg": 0.5,
              "tr": 3,
              "tden": 0.4,
              "tc": 0.6
            }
          }
        },
        {
          "id": "p2-pipeline:b2",
          "phase": "lecture",
          "text": "Add up one round and repeat it $d$ times: that is [[pp-pipeline-times|the unpipelined time]]. If the classical work hides behind the next look, a round costs only gates and look. The classical work is paid once at the end. B6 builds the same schedule from the bottom (<<pp-b6-pipelining|hiding the classical work>>).",
          "formal": "[[pp-pipeline-times|Eq. 4]]: $T_{\\text{unp}}=d\\,(t_g+t_r+t_c)$. Eq. 5: $T_{\\text{pip}}=d\\,(t_r+t_g)+(t_{\\text{den}}+t_c)$. Their difference is $T_{\\text{unp}}-T_{\\text{pip}}=(d-1)\\,t_c-t_{\\text{den}}$ (derivation below). With illustrative inputs of ours for 100 rounds ($t_g=10$ µs, $t_r=3$ ms, $t_{\\text{den}}=100$ µs, $t_c=400$ µs) the totals are $341.0$ and $301.5$ ms and the saving $39.5$ ms.",
          "caption": "baseline against pipelined for 100 rounds (the lab’s inputs; only three rounds are drawn)",
          "captionFormal": "Eqs. 4 and 5 at $d=100$ (three rounds drawn); totals from the engine",
          "stage": {
            "recipe": "readout-timeline",
            "params": {
              "mode": "ac",
              "drawn": 3,
              "d": 100,
              "tg": 0.01,
              "tr": 3,
              "tden": 0.1,
              "tc": 0.4
            }
          },
          "introduces": [
            "pp-pipeline-times"
          ],
          "claims": [
            {
              "key": "p2TUnp",
              "text": "Eq. 4 gives 341.0 ms",
              "from": {
                "recipe": "readout-timeline",
                "params": {
                  "mode": "ac",
                  "drawn": 3,
                  "d": 100,
                  "tg": 0.01,
                  "tr": 3,
                  "tden": 0.1,
                  "tc": 0.4
                }
              },
              "value": "tUnp"
            },
            {
              "key": "p2TPip",
              "text": "Eq. 5 gives 301.5 ms",
              "from": {
                "recipe": "readout-timeline",
                "params": {
                  "mode": "ac",
                  "drawn": 3,
                  "d": 100,
                  "tg": 0.01,
                  "tr": 3,
                  "tden": 0.1,
                  "tc": 0.4
                }
              },
              "value": "tPip"
            },
            {
              "key": "p2Saving",
              "text": "pipelining saves 39.5 ms",
              "from": {
                "recipe": "readout-timeline",
                "params": {
                  "mode": "ac",
                  "drawn": 3,
                  "d": 100,
                  "tg": 0.01,
                  "tr": 3,
                  "tden": 0.1,
                  "tc": 0.4
                }
              },
              "value": "saving"
            }
          ],
          "derivation": {
            "result": "T_{\\text{unp}}-T_{\\text{pip}}=(d-1)\\,t_c-t_{\\text{den}}",
            "ground": [
              {
                "tex": "t_g+t_r+t_c",
                "why": "One round with no overlap: add the three times.",
                "view": {
                  "recipe": "readout-timeline",
                  "params": {
                    "mode": "a",
                    "drawn": 2,
                    "d": 100,
                    "tg": 0.5,
                    "tr": 3,
                    "tden": 0.4,
                    "tc": 0.6
                  }
                },
                "viewCaption": "one round after another (illustrative widths)"
              },
              {
                "tex": "T_{\\text{unp}}=d\\,(t_g+t_r+t_c)",
                "why": "Repeat the round d times: multiply.",
                "view": {
                  "recipe": "readout-timeline",
                  "params": {
                    "mode": "b",
                    "drawn": 3,
                    "d": 100,
                    "tg": 0.5,
                    "tr": 3,
                    "tden": 0.4,
                    "tc": 0.6
                  }
                }
              },
              {
                "tex": "t_r+t_g",
                "why": "Overlap: the next look can start while the last picture is processed, so a round costs only the gates and the look.",
                "view": {
                  "recipe": "readout-timeline",
                  "params": {
                    "mode": "c",
                    "drawn": 3,
                    "d": 100,
                    "tg": 0.5,
                    "tr": 3,
                    "tden": 0.4,
                    "tc": 0.6
                  }
                },
                "viewCaption": "the classical row runs beside the look"
              },
              {
                "tex": "T_{\\text{pip}}=d\\,(t_r+t_g)+(t_{\\text{den}}+t_c)",
                "why": "Only the last round has no look to hide behind: add its classical work once.",
                "view": {
                  "recipe": "readout-timeline",
                  "params": {
                    "mode": "c",
                    "drawn": 3,
                    "d": 100,
                    "tg": 0.5,
                    "tr": 3,
                    "tden": 0.4,
                    "tc": 0.6
                  }
                }
              },
              {
                "tex": "T_{\\text{unp}}-T_{\\text{pip}}=(d-1)\\,t_c-t_{\\text{den}}",
                "why": "Subtract: what hiding saves.",
                "view": {
                  "recipe": "fig15-readback",
                  "params": {
                    "tol": 1,
                    "view": "bars"
                  }
                },
                "viewCaption": "the saving as a gap between printed bars (Fig. 15a)"
              }
            ],
            "formal": [
              {
                "tex": "T_{\\text{unp}}=d\\,(t_g+t_r+t_c)",
                "why": "Eq. 4: d rounds of gates, acquisition and classification in a row.",
                "view": {
                  "recipe": "readout-timeline",
                  "params": {
                    "mode": "a",
                    "drawn": 3,
                    "d": 100,
                    "tg": 0.5,
                    "tr": 3,
                    "tden": 0.4,
                    "tc": 0.6
                  }
                }
              },
              {
                "tex": "T_{\\text{pip}}=d\\,(t_r+t_g)+(t_{\\text{den}}+t_c)",
                "why": "Eq. 5: the classical work of all but the last round hides behind acquisition.",
                "view": {
                  "recipe": "readout-timeline",
                  "params": {
                    "mode": "c",
                    "drawn": 3,
                    "d": 100,
                    "tg": 0.5,
                    "tr": 3,
                    "tden": 0.4,
                    "tc": 0.6
                  }
                }
              },
              {
                "tex": "t_{\\text{den}}+t_c\\le t_r+t_g",
                "why": "The condition for the classical work to hide; the paper does not state it.",
                "view": {
                  "recipe": "readout-timeline",
                  "params": {
                    "mode": "c",
                    "drawn": 3,
                    "d": 100,
                    "tg": 0.5,
                    "tr": 3,
                    "tden": 0.4,
                    "tc": 0.6
                  }
                }
              },
              {
                "tex": "T_{\\text{unp}}-T_{\\text{pip}}=(d-1)\\,t_c-t_{\\text{den}}",
                "why": "Subtract the two totals, with no denoising in the baseline.",
                "view": {
                  "recipe": "fig15-readback",
                  "params": {
                    "tol": 1,
                    "view": "bars"
                  }
                }
              }
            ]
          }
        },
        {
          "id": "p2-pipeline:b3",
          "phase": "lecture",
          "text": "Fig. 15 prints nine totals for 100 rounds. Unpipelined bars read 451.0, 371.0 and 271.0 ms; pipelined 401.5, 321.5 and 221.5. The gap is 49.5 ms every time, which is 10.98 % of the first bar. The printed axis says cycle time, but the caption and the values are 100-round totals.",
          "formal": "Fig. 15 (p. 13; the axis is labelled cycle time, the caption and values say 100-round totals), tolerances $1$, $2$, $3\\,$ percent: unpipelined $451.0$, $371.0$, $271.0$ ms; pipelined baseline $401.5$, $321.5$, $221.5$ ms. The gap is $49.5$ ms at each, which is 10.98 % of 451.0 (“over 10 %”, p. 13). With $t_{\\text{den}}=0$ for the baseline, $(d-1)\\,t_c=49.5$ gives $t_c=0.5$ ms: the “500 µs for a 3×3 array” of p. 11, a consistency check that passes if Fig. 15’s baseline is that classifier. Then $t_r+t_g=4.01$, $3.21$ and $2.21$ ms.",
          "caption": "the printed totals of Fig. 15 (reported)",
          "captionFormal": "Fig. 15 bars as printed: unpipelined, pipelined baseline and GANDALF, three tolerances",
          "stage": {
            "recipe": "fig15-readback",
            "params": {
              "tol": 1,
              "view": "bars"
            },
            "uses": [
              "f15-unp-1",
              "f15-pip-1",
              "f15-gan-1"
            ]
          },
          "claims": [
            {
              "key": "p2Save",
              "text": "the gap between the unpipelined and pipelined bars is 49.5 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 1,
                  "view": "bars"
                }
              },
              "value": "save"
            },
            {
              "key": "p2SavePct",
              "text": "the gap is 10.98 % of the first bar",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 1,
                  "view": "bars"
                }
              },
              "value": "savePct"
            },
            {
              "key": "p2TclImplied",
              "text": "a gap of 49.5 ms over 99 rounds implies a classification time of 0.5 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 1,
                  "view": "bars"
                }
              },
              "value": "tc"
            },
            {
              "key": "p2TroImplied1",
              "text": "at tolerance 1 percent, t_r + t_g is 4.01 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 1,
                  "view": "readback"
                }
              },
              "value": "trgBase"
            },
            {
              "key": "p2TroImplied2",
              "text": "at tolerance 2 percent, t_r + t_g is 3.21 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 2,
                  "view": "readback"
                }
              },
              "value": "trgBase"
            },
            {
              "key": "p2TroImplied3",
              "text": "at tolerance 3 percent, t_r + t_g is 2.21 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "readback"
                }
              },
              "value": "trgBase"
            }
          ],
          "reported": [
            {
              "id": "f15-unp-1",
              "text": "Fig. 15a unpipelined, 1 % tolerance, in ms",
              "value": "451.0",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-unp-2",
              "text": "Fig. 15a unpipelined, 2 % tolerance, in ms",
              "value": "371.0",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-unp-3",
              "text": "Fig. 15a unpipelined, 3 % tolerance, in ms",
              "value": "271.0",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-pip-1",
              "text": "Fig. 15 pipelined baseline, 1 % tolerance, in ms",
              "value": "401.5",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-pip-2",
              "text": "Fig. 15 pipelined baseline, 2 % tolerance, in ms",
              "value": "321.5",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-pip-3",
              "text": "Fig. 15 pipelined baseline, 3 % tolerance, in ms",
              "value": "221.5",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-10",
              "text": "Saving from pipelining claimed in the text",
              "value": "over 10 % (50 ms)",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.3",
                "page": 13
              }
            },
            {
              "id": "f15-500",
              "text": "Classification time for a 3x3 array of the baseline",
              "value": "500 µs",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "5.3",
                "page": 11
              }
            }
          ]
        },
        {
          "id": "p2-pipeline:b4",
          "phase": "lecture",
          "text": "Fig. 15b gives GANDALF’s totals: 291.1, 181.1 and 151.1 ms. If its denoiser plus classifier takes 0.1 ms, which the paper does not print, these imply 2.91, 1.81 and 1.51 ms of readout plus gates. The best bar ratio is 1.775 (printed as 1.77), the 2 percent pair.",
          "formal": "Fig. 15b (p. 13): $291.1$, $181.1$, $151.1$ ms. Assuming $t_{\\text{den}}+t_c=0.1$ ms (ours, not printed) these give $t_r+t_g=2.91$, $1.81$, $1.51$ ms, so the one-percent bar goes with the printed $2.9$ ms. The ratios of the pipelined baseline's bars to GANDALF's are $1.38$, $1.775$ and $1.47$; the paper's “up to $1.77$” is the two-percent pair, the best of three (neutral note N12).",
          "caption": "readout plus gate time implied by the bars, with the denoiser-plus-classifier time assumed",
          "captionFormal": "$t_r+t_g$ from the bars: baseline ($t_c$ read back) and GANDALF (assumed $t_{\\text{den}}+t_c$)",
          "stage": {
            "recipe": "fig15-readback",
            "params": {
              "tol": 1,
              "view": "readback"
            }
          },
          "claims": [
            {
              "key": "p2TdcAssumed",
              "text": "the assumed denoiser-plus-classifier time is 0.1 ms (ours)",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 1,
                  "view": "readback"
                }
              },
              "value": "tdc"
            },
            {
              "key": "p2GanTro1",
              "text": "at tolerance 1 percent GANDALF’s t_r + t_g is 2.91 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 1,
                  "view": "readback"
                }
              },
              "value": "ganTrg"
            },
            {
              "key": "p2GanTro2",
              "text": "at tolerance 2 percent it is 1.81 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 2,
                  "view": "readback"
                }
              },
              "value": "ganTrg"
            },
            {
              "key": "p2GanTro3",
              "text": "at tolerance 3 percent it is 1.51 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "readback"
                }
              },
              "value": "ganTrg"
            },
            {
              "key": "p2Ratio1",
              "text": "the pipelined-baseline to GANDALF ratio at 1 percent is 1.38",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 1,
                  "view": "readback"
                }
              },
              "value": "ratio"
            },
            {
              "key": "p2Ratio2",
              "text": "at 2 percent it is 1.775",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 2,
                  "view": "readback"
                }
              },
              "value": "ratio"
            },
            {
              "key": "p2Ratio3",
              "text": "at 3 percent it is 1.47",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "readback"
                }
              },
              "value": "ratio"
            }
          ],
          "reported": [
            {
              "id": "f15-gan-1",
              "text": "Fig. 15b GANDALF, 1 % tolerance, in ms",
              "value": "291.1",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-gan-2",
              "text": "Fig. 15b GANDALF, 2 % tolerance, in ms",
              "value": "181.1",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-gan-3",
              "text": "Fig. 15b GANDALF, 3 % tolerance, in ms",
              "value": "151.1",
              "source": "paper-gdf",
              "at": {
                "kind": "figure",
                "label": "15",
                "page": 13
              }
            },
            {
              "id": "f15-177",
              "text": "Reduction of the pipelined baseline claimed for GANDALF",
              "value": "up to 1.77x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.3",
                "page": 13
              }
            }
          ]
        },
        {
          "id": "p2-pipeline:b5",
          "phase": "lecture",
          "text": "At one fixed readout time of 1.5 ms, a pipelined baseline and GANDALF differ by only 0.4 ms. The large gain comes from reaching the accuracy at a shorter readout, not from the schedule. The text’s 0.19 s to 0.152 s matches no bar.",
          "formal": "With the same $t_r=1.5$ ms for both, the pipelined baseline takes $151.5$ ms and GANDALF $151.1$ ms, a difference of $0.4$ ms (our derived model, with its labelled fit). The gain of Fig. 15 therefore comes from the shorter readout the denoiser permits, not from the schedule. The text of §7.3 (p. 13) says “0.19 s to 0.152 s” at that readout time. No bar equals 0.19 s (the nearest is $8.9$ ms away), and $0.19/0.152=1.25$ is not the factor of the same paragraph. Also 0.152 s lies near the three-percent bar. See the correction below.",
          "caption": "the nine printed bars and the two numbers of the text",
          "captionFormal": "Fig. 15 bars and the text’s 0.19 s and 0.152 s at tolerance three percent (the text’s numbers are placed by us)",
          "stage": {
            "recipe": "fig15-readback",
            "params": {
              "tol": 3,
              "view": "text"
            },
            "uses": [
              "f15-gan-3",
              "f15-text"
            ]
          },
          "claims": [
            {
              "key": "p2TrFixed",
              "text": "the fixed readout time is 1.5 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "text"
                }
              },
              "value": "trFixed"
            },
            {
              "key": "p2EqualBase",
              "text": "a pipelined baseline at that readout takes 151.5 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "text"
                }
              },
              "value": "equalBase"
            },
            {
              "key": "p2EqualGan",
              "text": "GANDALF takes 151.1 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "text"
                }
              },
              "value": "equalGan"
            },
            {
              "key": "p2EqualTro",
              "text": "they differ by 0.4 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "text"
                }
              },
              "value": "equalDiff"
            },
            {
              "key": "p2TextGap190",
              "text": "no bar is within 8.9 ms of the text’s 190 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "text"
                }
              },
              "value": "gap190"
            },
            {
              "key": "p2TextRatio",
              "text": "0.19 over 0.152 is 1.25",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 3,
                  "view": "text"
                }
              },
              "value": "textRatio"
            }
          ],
          "reported": [
            {
              "id": "f15-text",
              "text": "Execution time of 100 rounds at 1.5 ms in the text",
              "value": "0.19 s to 0.152 s",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.3",
                "page": 13
              }
            }
          ]
        },
        {
          "id": "p2-pipeline:b6",
          "phase": "lecture",
          "text": "Classification can overlap the next acquisition if reloading atoms waits one round. The paper says this is safe because losing an atom is rare and does not create new correlated errors. Neither loss nor reload is simulated.",
          "formal": "§5.3 (p. 11), citing two references: reset and atom loss can be tolerated, so reloading is deferred by one round and classification overlaps the next measurement. Neither loss nor reload is simulated in the paper (neutral note N13); treating a lost atom as a third outcome is B6's subject (<<pp-b6-loss-reset|atoms that leave, and reset or not>>).",
          "caption": "the pipelined schedule again: classical row beside the gates and acquisitions",
          "captionFormal": "pipelined boxes (illustrative widths); no loss or reload drawn",
          "stage": {
            "recipe": "readout-timeline",
            "params": {
              "mode": "c",
              "drawn": 4,
              "d": 100,
              "tg": 0.5,
              "tr": 3,
              "tden": 0.4,
              "tc": 0.6
            }
          },
          "trail": [
            {
              "ref": "geh25",
              "at": "the reset-or-not analysis",
              "why": "The paper cites it for deferring reset; its model is closer to a superconducting setting, and the paper does not simulate reset."
            },
            {
              "ref": "bar25",
              "at": "the loss analysis",
              "why": "The paper cites it for tolerating atom loss; a decoder that uses loss flags needs an output the paper’s classifier does not give."
            }
          ]
        }
      ],
      "review": {
        "points": [
          "Unpipelined, the stages add up; pipelined, only the last round’s classical work shows.",
          "Fig. 15’s bar gap implies a classification time of half a millisecond.",
          "The paper’s headline factor is the best of three bar ratios.",
          "At one readout time, pipelining adds little; the gain is the shorter readout."
        ],
        "equations": "T_{\\text{unp}}-T_{\\text{pip}}=(d-1)\\,t_c-t_{\\text{den}}",
        "trap": "Reading the text’s two execution times as two bars of Fig. 15: neither is a printed bar.",
        "formal": {
          "points": [
            "Eq. 5 holds while $t_{\\text{den}}+t_c\\le t_r+t_g$; otherwise the classical stage stalls the schedule.",
            "$t_c=(T_{\\text{unp}}-T_{\\text{pip}})/(d-1)$ with $t_{\\text{den}}=0$ gives half a millisecond.",
            "The ratio of the pipelined bars is largest at the two-percent tolerance."
          ],
          "equations": "t_c=\\frac{T_{\\text{unp}}-T_{\\text{pip}}}{d-1},\\quad t_r+t_g=\\frac{T_{\\text{unp}}}{d}-t_c",
          "trap": "Using the assumed denoiser-plus-classifier time as if it were printed: it is ours."
        },
        "claims": []
      },
      "play": [
        {
          "id": "p2-ch-eq5",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "Eq. 5 in numbers",
          "prompt": "For d = 100 rounds with t_r = 3 ms, t_g = 0.01 ms, t_den = 0.1 ms and t_c = 0.4 ms, what is the pipelined total of Eq. 5 in milliseconds?",
          "answerFrom": {
            "from": {
              "recipe": "readout-timeline",
              "params": {
                "mode": "ac",
                "drawn": 3,
                "d": 100,
                "tg": 0.01,
                "tr": 3,
                "tden": 0.1,
                "tc": 0.4
              }
            },
            "value": "tPip"
          },
          "tolerance": 0.005,
          "unit": "ms",
          "hints": [
            {
              "text": "Eq. 5 is d times (t_r + t_g), plus the classical work once."
            },
            {
              "text": "The classical work is t_den + t_c."
            },
            {
              "text": "100 × 3.01, then add 0.5."
            }
          ],
          "walkthrough": [
            {
              "text": "d (t_r + t_g) = 100 × 3.01 = 301 ms."
            },
            {
              "text": "Add t_den + t_c = 0.5 ms: 301.5 ms."
            }
          ]
        },
        {
          "id": "p2-ch-saving",
          "kind": "numeric",
          "tier": "core",
          "title": "What pipelining saves",
          "prompt": "With the same inputs, the unpipelined total of Eq. 4 is 341.0 ms. How many milliseconds does pipelining save?",
          "answerFrom": {
            "from": {
              "recipe": "readout-timeline",
              "params": {
                "mode": "ac",
                "drawn": 3,
                "d": 100,
                "tg": 0.01,
                "tr": 3,
                "tden": 0.1,
                "tc": 0.4
              }
            },
            "value": "saving"
          },
          "tolerance": 0.005,
          "unit": "ms",
          "hints": [
            {
              "text": "Subtract the pipelined total from the unpipelined one."
            },
            {
              "text": "Or use (d − 1) t_c − t_den."
            },
            {
              "text": "99 × 0.4 − 0.1."
            }
          ],
          "walkthrough": [
            {
              "text": "341.0 − 301.5 = 39.5 ms."
            },
            {
              "text": "The formula agrees: 99 × 0.4 − 0.1 = 39.5."
            }
          ]
        },
        {
          "id": "p2-ch-tc",
          "kind": "numeric",
          "tier": "core",
          "title": "The classification time hidden in Fig. 15",
          "prompt": "Fig. 15 prints 451.0 ms unpipelined and 401.5 ms pipelined for 100 rounds, with no denoiser in the baseline. What classification time t_c in milliseconds does the gap imply?",
          "answerFrom": {
            "from": {
              "recipe": "fig15-readback",
              "params": {
                "tol": 1,
                "view": "bars"
              }
            },
            "value": "tc"
          },
          "tolerance": 0.005,
          "unit": "ms",
          "hints": [
            {
              "text": "The gap is the saving."
            },
            {
              "text": "With no denoiser, the saving is (d − 1) t_c."
            },
            {
              "text": "49.5 divided by 99."
            }
          ],
          "walkthrough": [
            {
              "text": "451.0 − 401.5 = 49.5 ms."
            },
            {
              "text": "49.5 / 99 = 0.5 ms, the 500 µs the paper quotes for a 3 by 3 array."
            }
          ]
        }
      ]
    },
    {
      "id": "p2-logical",
      "title": "From readout error to logical error",
      "question": "Why does the readout time enter the logical error rate twice?",
      "source": {
        "summary": "Section 7.2 and Fig. 14 report logical error rates of a surface code and a bivariate bicycle code at three readout times. Waiting noise is modelled by a Pauli twirl. The best readout time lies in between, and the gains are largest at the shortest time.",
        "where": "§7.2, pp. 12–13; Fig. 14"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "exposure-bench"
        },
        "tryThis": [
          "This is the reading half of the trade: raise the exposure and the error of the reading falls fast.",
          "The waiting half is the opposite: every extra millisecond adds waiting error on every data atom. The two halves meet at a best readout time."
        ]
      },
      "insight": "A longer look makes the reading more accurate and makes every data atom wait longer. The total error has a best readout time in between, and a worse classifier hurts most when the look is short.",
      "insightFormal": "With $p_{\\text{eff}}=p_g+p_{\\text{idle}}(t_r)+p_m(t_r)$ and $p_L\\propto(p_{\\text{eff}}/p_{\\text{th}})^{(d+1)/2}$, the reading error falls and the waiting error rises with $t_r$, so $p_L(t_r)$ has an interior minimum. The paper prints no $T_1$, $T_2$ or gate errors, so its Fig. 14 cannot be reproduced from the paper.",
      "pitfalls": [
        "As reported: Fig. 14’s bar values are graphical and are not read here. The abstract says 35 times where the text says up to 35.8 (neutral note N14)."
      ],
      "story": [
        {
          "id": "p2-logical:b1",
          "phase": "lecture",
          "text": "A longer look is more accurate, but every data atom waits longer. [[pp-idle-error|Waiting]] adds errors, and a wrong reading adds errors. Both change the final result, so readout time enters the logical error twice. The trade is worked as a curve in <<pp-b6-ucurve|reading error against waiting error>>.",
          "formal": "Idle noise is modelled by a Pauli twirl with $T_1$ and $T_2$ ([[pp-idle-error|waiting error]]; p. 12, Tomita and Svore; the twirl is B6's subject: <<pp-b6-twirl|waiting costs as three chances>>). The paper prints no $T_1$, $T_2$, gate errors or rule that turns classifier errors into flips, so Fig. 14 cannot be reproduced from the paper. The curves here are a toy of ours with illustrative inputs: waiting rises, reading falls, their sum.",
          "caption": "toy chances per cycle against readout time: waiting, reading and their sum (illustrative inputs, ours)",
          "captionFormal": "toy $p_{\\text{idle}}$, $p_m$ and $p_{\\text{eff}}$ against $t_r$ (our inputs; not fitted to the paper)",
          "stage": {
            "recipe": "trade-toy",
            "params": {
              "view": "parts",
              "d": 11
            }
          },
          "derivation": {
            "result": "p_L=A\\left(\\frac{p_{\\text{eff}}}{p_{\\text{th}}}\\right)^{(d+1)/2}",
            "ground": [
              {
                "tex": "p_{\\text{eff}}=p_g+p_{\\text{idle}}(t_r)+p_m(t_r)",
                "why": "A data atom can fail from its gates, from waiting or from a wrong reading: add the three chances.",
                "view": {
                  "recipe": "trade-toy",
                  "params": {
                    "view": "parts",
                    "d": 11
                  }
                },
                "viewCaption": "the three parts and their sum (toy)"
              },
              {
                "tex": "p_X=p_Y=\\frac{1-e^{-t/T_1}}{4},\\quad p_Z=\\frac{1-e^{-t/T_2}}{2}-p_X",
                "why": "Waiting longer raises the chance of a flip; the Pauli twirl gives three chances that grow with time.",
                "view": {
                  "recipe": "trade-toy",
                  "params": {
                    "view": "parts",
                    "d": 11
                  }
                }
              },
              {
                "tex": "p_m=\\min_k\\frac{P(N_b<k)+P(N_d\\ge k)}{2}",
                "why": "Reading longer collects more photons, so the chance of a wrong reading falls.",
                "view": {
                  "recipe": "dual-path",
                  "params": {
                    "attenuation": 10,
                    "view": "overlap"
                  }
                },
                "viewCaption": "error of the reading against exposure (toy Poisson model)"
              },
              {
                "tex": "\\frac{\\mathrm{d}\\,p_{\\text{eff}}}{\\mathrm{d}\\,t_r}=0",
                "why": "The best readout time is where the falling and the rising parts balance in the sum.",
                "view": {
                  "recipe": "trade-toy",
                  "params": {
                    "view": "parts",
                    "d": 11
                  }
                }
              },
              {
                "tex": "p_L=A\\left(\\frac{p_{\\text{eff}}}{p_{\\text{th}}}\\right)^{(d+1)/2}",
                "why": "A failure needs more than half the guards wrong at once, so the exponent magnifies both effects and keeps the minimum where it is.",
                "view": {
                  "recipe": "trade-toy",
                  "params": {
                    "view": "logical",
                    "d": 11
                  }
                },
                "viewCaption": "toy logical rate against readout time"
              }
            ],
            "formal": [
              {
                "tex": "p_{\\text{eff}}=p_g+p_{\\text{idle}}(t_r)+p_m(t_r)",
                "why": "The effective fault rate of one data atom in a cycle with readout time $t_r$.",
                "view": {
                  "recipe": "trade-toy",
                  "params": {
                    "view": "parts",
                    "d": 11
                  }
                }
              },
              {
                "tex": "p_X=p_Y=\\frac{1-e^{-t/T_1}}{4},\\quad p_Z=\\frac{1-e^{-t/T_2}}{2}-p_X",
                "why": "Twirled idling (Tomita and Svore, Eqs. 9 and 10): grows with $t$; $p_m$ falls as the Poisson overlap shrinks.",
                "view": {
                  "recipe": "dual-path",
                  "params": {
                    "attenuation": 10,
                    "view": "overlap"
                  }
                }
              },
              {
                "tex": "p_L=A\\left(\\frac{p_{\\text{eff}}}{p_{\\text{th}}}\\right)^{(d+1)/2}",
                "why": "The suppression law raises the sum to the power $(d+1)/2$, so the minimum of $p_{\\text{eff}}$ is the minimum of $p_L$.",
                "view": {
                  "recipe": "trade-toy",
                  "params": {
                    "view": "logical",
                    "d": 11
                  }
                }
              }
            ]
          },
          "trail": [
            {
              "ref": "tom14",
              "at": "the idle-noise equations, p. 6 there",
              "why": "The paper cites this for modelling waiting error by a Pauli twirl with T1 and T2; the equations are taught in B6."
            }
          ]
        },
        {
          "id": "p2-logical:b2",
          "phase": "lecture",
          "text": "Added up, the error has a smallest point. Waiting dominates at long readout and wrong readings at short. In our toy the best readout lies inside the range. The paper’s best is about 4 ms at 9 µm; our toy is not fitted to it.",
          "formal": "The toy $p_L(t_r)$ has an interior minimum (the claim records 1 when the minimiser lies strictly inside the range) for illustrative inputs of ours. The paper’s best is about 4 ms for the 9 µm spacing (§7.2, p. 12); our inputs are not fitted to it, so a match of positions would prove nothing. Published surface-code fits are in <<pp-b1-threshold|B1's threshold unit>>; the paper's twirl and the U-shaped optimum are B6's subject.",
          "caption": "toy logical rate against readout time: a U shape (our inputs)",
          "captionFormal": "toy $p_L$, $d=11$, log scale (our inputs, not fitted to Fig. 14)",
          "stage": {
            "recipe": "trade-toy",
            "params": {
              "view": "logical",
              "d": 11
            }
          },
          "claims": [
            {
              "key": "p2UMin",
              "text": "the toy’s minimum lies strictly inside the range (1 means yes)",
              "from": {
                "recipe": "trade-toy",
                "params": {
                  "view": "logical",
                  "d": 11
                }
              },
              "value": "interior"
            }
          ],
          "reported": [
            {
              "id": "f14-best",
              "text": "Readout time with the best logical error rate at 9 micrometre",
              "value": "~4 ms",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.2",
                "page": 12
              }
            }
          ]
        },
        {
          "id": "p2-logical:b3",
          "phase": "lecture",
          "text": "Fig. 14 shows bars for three readout times. We read no values from the bars. The text prints two factors. The surface code’s logical error is 5 times lower at 4 ms. The BB code’s is up to 35.8 times lower at the shortest time.",
          "formal": "Fig. 14 (p. 12): bars for the surface code ($d=11$) and the BB code ($d=12$) at three readout times, graphical, so no value is read from them. Printed in the text (p. 13): 5 times for the surface code, measured at 4 ms, and up to 35.8 times for the BB code at its shortest readout; the abstract says 35 times (neutral note N14). At long readout the gains are outweighed by idling.",
          "caption": "the two printed factors only (no bar values read)",
          "captionFormal": "printed factors of §7.2: surface code 5× at 4 ms, BB code up to 35.8× at the shortest time",
          "stage": {
            "kind": "plot",
            "points": [
              {
                "x": 4,
                "y": 5,
                "label": "surface code, 5x",
                "status": "reported",
                "group": "surface code"
              },
              {
                "x": 1.5,
                "y": 35.8,
                "label": "BB code, up to 35.8x",
                "status": "reported",
                "group": "BB code"
              }
            ],
            "xLabel": "readout time (ms)",
            "yLabel": "error reduction (x)"
          },
          "reported": [
            {
              "id": "f14-5x",
              "text": "Surface-code error reduction, 4 ms readout",
              "value": "5x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.2",
                "page": 12
              }
            },
            {
              "id": "f14-35",
              "text": "BB-code error reduction, 1.5 ms readout",
              "value": "up to 35.8x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.2",
                "page": 13
              }
            }
          ]
        },
        {
          "id": "p2-logical:b4",
          "phase": "lecture",
          "text": "A worse classifier hurts most when the look is short. Both printed gains compare with the CNN baseline at short readouts: 4 ms for the surface code, the shortest time for the BB code. There reading error, not only waiting, still matters. In our toy the penalty shrinks as the readout grows.",
          "formal": "Both gains are against CNN(Site) at the shorter readout times (4 ms for the surface code, 1500 µs for the BB code), where reading error rather than idling still matters. Toy of ours: for a classifier worse by a fixed factor, the ratio of toy $p_L$ is largest at short readout and tends to one at long readout. The claim records 1 when the ratios at the three times decrease and stay above one.",
          "caption": "toy penalty of a worse classifier against readout time (ours)",
          "captionFormal": "toy ratio of $p_L$ for a worse classifier to a better one, log scale (our inputs)",
          "stage": {
            "recipe": "trade-toy",
            "params": {
              "view": "ratio",
              "d": 11
            }
          },
          "claims": [
            {
              "key": "p2RatioGrows",
              "text": "in the toy the penalty of a worse classifier falls with readout time (1 means yes)",
              "from": {
                "recipe": "trade-toy",
                "params": {
                  "view": "ratio",
                  "d": 11
                }
              },
              "value": "grows"
            }
          ]
        }
      ],
      "review": {
        "points": [
          "A longer look reads better but makes every data atom wait longer.",
          "The total error has a best readout time between the two extremes.",
          "The paper’s best is about 4 ms; our toy is not fitted to it.",
          "The big factors compare with the baseline at short readout."
        ],
        "equations": "p_{\\text{eff}}=p_g+p_{\\text{idle}}(t_r)+p_m(t_r)",
        "trap": "Reading a toy’s best time as a prediction: our inputs are illustrative, not the paper’s.",
        "formal": {
          "points": [
            "$p_{\\text{idle}}$ rises and $p_m$ falls with $t_r$, so $p_{\\text{eff}}$ has a minimum.",
            "The exponent $(d+1)/2$ keeps the minimum where it is.",
            "Fig. 14’s bar values are graphical and are not read here."
          ],
          "equations": "p_L\\propto\\left(\\frac{p_{\\text{eff}}}{p_{\\text{th}}}\\right)^{(d+1)/2}",
          "trap": "Using the toy to explain why the paper’s best is about 4 ms: the paper’s T1, T2 and gate errors are not printed."
        },
        "claims": []
      },
      "play": [
        {
          "id": "p2-ch-idle",
          "kind": "choice",
          "tier": "stretch",
          "title": "What dominates at long readout",
          "prompt": "In the toy trade-off, which error dominates at a long readout time such as 10 ms?",
          "options": [
            {
              "text": "Waiting (idle) error: the reading error has become negligible.",
              "correct": true,
              "why": "At long readout the reading collects plenty of photons and its error is tiny, while the waiting error keeps growing with time."
            },
            {
              "text": "Reading error: the atoms are not bright enough.",
              "correct": false,
              "why": "Reading error falls with time; it dominates at short readout."
            },
            {
              "text": "Gate error, because gates take longer.",
              "correct": false,
              "why": "The gate time does not grow with the readout time."
            }
          ],
          "hints": [
            {
              "text": "Think of what grows and what falls with the readout time."
            },
            {
              "text": "The reading collects more photons as time passes."
            },
            {
              "text": "Waiting error is the part that keeps growing."
            }
          ],
          "walkthrough": [
            {
              "text": "The reading error falls with the readout time."
            },
            {
              "text": "The waiting error rises, so at long times it is the larger part."
            }
          ]
        }
      ]
    },
    {
      "id": "p2-trust",
      "title": "What to trust",
      "question": "Which of the paper’s claims survive our arithmetic, and which stay open?",
      "source": {
        "summary": "A ledger of the paper’s numbers against our recomputation from its own printed values. It shows what reproduces, what is derived consistently, what is unreconciled, and what the paper does not model.",
        "where": "the whole paper; pp. 1–13"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "pipeline-lab"
        },
        "tryThis": [
          "Set the readout time to the same value for both schedules and compare: the schedule alone saves very little.",
          "Raise the denoiser plus classifier time until it exceeds the gate-plus-readout time: the classical stage then stalls the schedule and the saving formula no longer applies."
        ]
      },
      "insight": "Most of the arithmetic reproduces. The headline factors answer different questions, one sentence matches no bar, and the paper tests one denoiser against one baseline on one small dataset.",
      "insightFormal": "Reproduced: 1.775 for the two-percent pair, $t_c=0.5$ ms, the 4.7 million parameters (with two convolutions per block), latency as $1000/\\mathrm{TP}$. Not reproduced or unreconciled: 1.6 against $1.24$ and $1.25$, the text’s 0.19 s, 16.5 against 17.75, Table 3 against Table 4. Open: loss, reload, crosstalk-induced correlations, $T_1$ and $T_2$, real-time decoding.",
      "pitfalls": [
        "As reported: the paper’s reference list prints [28] and [29] for what is one paper (Norcia et al. 2024); noted, not corrected."
      ],
      "story": [
        {
          "id": "p2-trust:b1",
          "phase": "lecture",
          "text": "We checked the paper’s arithmetic on its own printed numbers. Most of it reproduces. The headline of up to 1.6 times shorter readout does not follow from the printed limits, which give 1.24 and 1.25. The text’s 0.19 s to 0.152 s matches no bar.",
          "formal": "Ledger. Abstract: up to 1.6 times shorter readout; the printed sub-one-percent durations give $1.24$ and $1.25$ (note E1: not reproduced, comparison not printed). Headline $2.5$ and $2.8$: different conditions (N7). Fig. 15: the “up to 1.77” reproduces as the ratio of the two-percent bars, $1.775$. Text 0.19 s to 0.152 s: no bar within $8.9$ ms (Correction E2). Parameters: 4.7 million reproduces as $4\\,695\\,744$ with two convolutions per block, while Table 2 prints one (N6); “16.5 times smaller” against our $17.75$ (N8). Tables 1 and 6 differ in scale (N2); the dataset counts: $378000$ would not match p. 5 (N3). The reference list prints [28] and [29] for one paper.",
          "caption": "the ledger’s sharpest case: the text’s numbers against the printed bars",
          "captionFormal": "Fig. 15 bars and the text’s 0.19 s and 0.152 s",
          "stage": {
            "recipe": "fig15-readback",
            "params": {
              "tol": 2,
              "view": "text"
            },
            "uses": [
              "f15-text-t"
            ]
          },
          "claims": [
            {
              "key": "p2TrustCross5",
              "text": "3.6 over 2.9 is 1.24",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 3.6,
                  "b": 2.9,
                  "aLabel": "baseline 5 µm",
                  "bLabel": "GANDALF 5 µm",
                  "yLabel": "longest readout (ms)"
                },
                "uses": [
                  "f12-x-5b",
                  "f12-x-5g"
                ]
              },
              "value": "ratio"
            },
            {
              "key": "p2TrustCross9",
              "text": "4 over 3.2 is 1.25",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 4,
                  "b": 3.2,
                  "aLabel": "baseline 9 µm",
                  "bLabel": "GANDALF 9 µm",
                  "yLabel": "longest readout (ms)"
                },
                "uses": [
                  "f12-x-9b",
                  "f12-x-9g"
                ]
              },
              "value": "ratio"
            },
            {
              "key": "p2TrustRatio2",
              "text": "the 2 percent bars give 321.5 over 181.1, which is 1.775",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 2,
                  "view": "readback"
                }
              },
              "value": "ratio"
            },
            {
              "key": "p2TrustTextGap",
              "text": "no bar is within 8.9 ms of the text’s 190 ms",
              "from": {
                "recipe": "fig15-readback",
                "params": {
                  "tol": 2,
                  "view": "text"
                },
                "uses": [
                  "f15-text-t"
                ]
              },
              "value": "gap190"
            },
            {
              "key": "p2TrustParMF",
              "text": "355 k over 20 k is 17.75",
              "from": {
                "recipe": "printed-ratio",
                "params": {
                  "a": 355000,
                  "b": 20000,
                  "aLabel": "baseline 355 k",
                  "bLabel": "MF-NN 20 k",
                  "yLabel": "parameters",
                  "log": "log"
                },
                "uses": [
                  "p6-cnn-site",
                  "f9-par-mf"
                ]
              },
              "value": "ratio"
            },
            {
              "key": "p2TrustGen2",
              "text": "two convolutions per block give 4695744 weights",
              "from": {
                "recipe": "conv-stack",
                "params": {
                  "layers": [
                    {
                      "k": 3,
                      "cin": 1,
                      "cout": 64,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 64,
                      "cout": 128,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 128,
                      "cout": 256,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 256,
                      "cout": 256,
                      "bias": false,
                      "repeat": 6
                    },
                    {
                      "k": 4,
                      "cin": 256,
                      "cout": 128,
                      "bias": false
                    },
                    {
                      "k": 4,
                      "cin": 256,
                      "cout": 64,
                      "bias": false
                    },
                    {
                      "k": 3,
                      "cin": 128,
                      "cout": 1,
                      "bias": false
                    }
                  ],
                  "view": "numbers"
                }
              },
              "value": "params"
            },
            {
              "key": "p2TrustSites14",
              "text": "fourteen durations of 27000 would be 378000",
              "from": {
                "recipe": "dual-path",
                "params": {
                  "attenuation": 10,
                  "view": "frames",
                  "images": 3000,
                  "atoms": 9,
                  "durations": 14
                }
              },
              "value": "sitesAllDurations"
            }
          ],
          "reported": [
            {
              "id": "r-short-t",
              "text": "Shorter readout time claimed in the abstract",
              "value": "up to 1.6x",
              "source": "paper-gdf",
              "at": {
                "kind": "text",
                "page": 1
              }
            },
            {
              "id": "r-factor-abs-t",
              "text": "Error reduction at the shortest durations in the abstract-level summary",
              "value": "up to 2.5x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.5",
                "page": 9
              }
            },
            {
              "id": "r-factor-1p5-t",
              "text": "Error reduction at the 1.5 ms exposure",
              "value": "2.8x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.1",
                "page": 12
              }
            },
            {
              "id": "f15-177-t",
              "text": "Reduction of the pipelined baseline claimed for GANDALF",
              "value": "up to 1.77x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.3",
                "page": 13
              }
            },
            {
              "id": "f15-text-t",
              "text": "Execution time of 100 rounds at 1.5 ms in the text",
              "value": "0.19 s to 0.152 s",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "7.3",
                "page": 13
              }
            },
            {
              "id": "f9-165-t",
              "text": "Model-size reduction quoted in the text",
              "value": "up to 16.5x",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "4.5",
                "page": 9
              }
            },
            {
              "id": "d-params-t",
              "text": "Parameters of the generator",
              "value": "4.7 million",
              "source": "paper-gdf",
              "at": {
                "kind": "section",
                "label": "5.2",
                "page": 10
              }
            }
          ]
        },
        {
          "id": "p2-trust:b2",
          "phase": "lecture",
          "text": "The paper does not model atom loss or reloading. It does not model crosstalk that makes errors in neighbours at once, the details of waiting noise, or the time a real decoder needs. A lost atom is simply read as dark.",
          "formal": "Not modelled (§7.2–7.3, pp. 11–13): atom loss and reload; correlated errors from crosstalk; the details of $T_1$ and $T_2$; real-time decoding latency. A classifier that maps a lost atom to “dark” hides the loss as a bit flip, a gap shared with the experiment track and with B6's treatment of loss as a third outcome.",
          "caption": "one cycle as boxes: loss and reload are not among them",
          "captionFormal": "cycle boxes (illustrative widths); loss, reload and decoding are not modelled",
          "stage": {
            "recipe": "readout-timeline",
            "params": {
              "mode": "cycle",
              "drawn": 1,
              "d": 1,
              "tg": 0.3,
              "tr": 1,
              "tden": 0,
              "tc": 0,
              "treset": 0.2
            }
          }
        },
        {
          "id": "p2-trust:b3",
          "phase": "books",
          "text": "Photons, heating and depumping set the floor. The paper tests one denoiser against one baseline, on one 3 by 3 cesium set from one group. It shows that learning can recover information a fixed mask throws away. It does not show a limit.",
          "formal": "The physical floor is set by photons, heating and depumping (the experiment track). The claim tested is one denoiser against one CNN baseline on one $3\\times3$ Cs dataset from one group. GANDALF is shown to recover information that a fixed mask discards; a bound is not shown (our reading of the conclusion).",
          "caption": "the floor from physics: wrong-bit chance against exposure for four weighted sums (our model)",
          "captionFormal": "exact errors against exposure; the likelihood-ratio line is the Bayes error (B5; our model)",
          "stage": {
            "recipe": "filter-compare",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "tau": 1,
              "view": "tau"
            }
          },
          "trail": [
            {
              "ref": "phu24",
              "at": "the experiment and its CNN baselines",
              "why": "The only dataset and the only baseline of the paper come from this experiment; a result here says nothing about other arrays or species."
            }
          ]
        },
        {
          "id": "p2-trust:b4",
          "phase": "deeper",
          "text": "What would a lab measure next? Real short exposures, a bound from physics, a plain linear baseline, larger arrays, and loss as a third outcome. Each answers a question this paper leaves open.",
          "formal": "A checklist: timed short exposures against attenuated long ones; a Bayes bound from the Poisson model; a Wiener and a matched-filter baseline (<<pp-b5-wiener|B5>>); arrays beyond $3\\times3$ with real atoms; loss as a third outcome (B6).",
          "caption": "exposure again: where a real short exposure would test the dim-path stand-in",
          "captionFormal": "toy Poisson overlap error against exposure (illustrative rates)",
          "stage": {
            "recipe": "dual-path",
            "params": {
              "attenuation": 10,
              "view": "overlap"
            }
          }
        }
      ],
      "review": {
        "points": [
          "Most arithmetic reproduces: the bar ratio, the classification time, the parameter count.",
          "The headline factors answer different questions.",
          "One sentence about Fig. 15 matches no bar.",
          "Loss, reload and correlated errors are not modelled."
        ],
        "equations": "\\text{ledger}=\\{\\text{reproduces},\\ \\text{derived},\\ \\text{unreconciled},\\ \\text{open}\\}",
        "trap": "Calling a mismatch an error: a different comparison we cannot see may explain it.",
        "formal": {
          "points": [
            "A mismatch is a statement about printed numbers, not about intent.",
            "Reproduces: bar ratio, $t_c$, parameter count with two convolutions per block.",
            "Open: loss, reload, crosstalk-induced correlations, $T_1$ and $T_2$, decoding latency."
          ],
          "equations": "\\text{verdict}\\in\\{\\text{reproduces},\\ \\text{derived},\\ \\text{unreconciled},\\ \\text{open}\\}",
          "trap": "Treating the toy trade-off as evidence for the paper’s Fig. 14: its inputs are not printed."
        },
        "claims": []
      }
    }
  ],
  "corrections": [
    {
      "claim": "p2TextGap190",
      "printed": 0.19,
      "location": {
        "kind": "section",
        "label": "7.3",
        "page": 13
      },
      "says": "At the shortest readout (1.5 ms), 100 rounds take 0.19 s for the baseline and 0.152 s once the denoiser and pipelining are used.",
      "shouldSay": "Comparing the tables, we find no bar of Fig. 15 equal to 190 ms: the nearest is 8.9 ms away. The ratio 0.19 / 0.152 = 1.25 is not the 1.77 of the same paragraph, though that 1.77 is measured against the pipelined baseline, so the two need not agree. The plotted two-percent pair gives 321.5 / 181.1 = 1.775, and 0.152 s lies near the three-percent bar, 151.1 ms. Our model’s pipelined baseline at 1.5 ms is 151.5 ms, which also rounds to 0.152 s, so the 0.152 s does not say which schedule it is."
    }
  ]
}
