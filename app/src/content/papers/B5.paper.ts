/**
 * Background chapter B5 of the Papers section: from pixels to bits (rulings gandalf-batch.md G1-G3; plan P-B5-story). It teaches where an atom's light lands on a camera (the spot, a region of
 * interest, crosstalk), the likelihood-ratio weights and the matched filter, a filter learned from labelled shots and a small convolutional network, why a linear cleaner followed by a
 * threshold adds nothing, and the conditional-GAN objective with the risk that a training prior invents an atom, in two tracks, for the paper lecture P2 and every later chapter that needs them.
 * Sources were read online or from saved copies and are paraphrased and cited by section: Phuttitarn et al., Kent et al., Isola et al., and the GANDALF paper. Every number is either computed by
 * a registered recipe (numpy twin: pipeline/claims_papers/b5.py), reported from a source with its location, or a labelled input of our model.
 *
 * DATA ONLY: papers/specData.test.ts proves this file holds nothing but literals; papers/validate.ts checks it; papers/compile.ts turns it into a Lecture.
 */
import type { PaperSpec } from '../../papers/spec'

export const B5: PaperSpec = {
  "specVersion": 1,
  "id": "B5",
  "kind": "background",
  "title": "From pixels to bits: classifying and denoising array images",
  "outcomes": [
    "Place an atom's light on pixels and say what a neighbour adds.",
    "Compute the chance of a wrong bit for a flat box, a Gaussian-shaped sum and the likelihood-ratio sum.",
    "Derive the weights ln(1 + s/b) and say why a filter is a weighted pixel sum.",
    "Explain why a learned filter gives a negative weight to a bright neighbour.",
    "Show that a linear denoiser followed by a threshold adds nothing beyond the best weights.",
    "Count the parameters and the receptive field of a small convolutional network.",
    "Write the pix2pix objective and say what each term does.",
    "Show with Bayes' rule how a training prior can flip a faint frame."
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
      "reliedOn": "Sections II to IV, Tables I and II",
      "why": "Measures a neutral-atom array with a convolutional network per site and per array, and compares it with Gaussian and square thresholds at two atom spacings.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-cnn"
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
      "reliedOn": "Abstract and the filter equations",
      "why": "Replaces the network by a matched filter whose weights are fitted from labelled shots, and compares the cost and the error.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-cnn"
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
      "reliedOn": "Sections 3 and 4",
      "why": "Defines the conditional adversarial network, its objective with an L1 term, the U-Net generator and the patch discriminator.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-pix2pix"
      }
    },
    {
      "id": "gdf25",
      "label": "the GANDALF paper (2025)",
      "arxiv": {
        "id": "2510.25982",
        "version": 2
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "Section 4, pages 6 to 10",
      "why": "Trains a conditional GAN to denoise short-exposure atom images and lists the risks of doing so; its own argument is the lecture P2.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-pix2pix"
      }
    }
  ],
  "prerequisites": [
    {
      "id": "roi-integration",
      "label": "The region of interest and its sum",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-roi"
      },
      "needs": [
        "probability",
        "poisson-histogram"
      ]
    },
    {
      "id": "psf-crosstalk",
      "label": "The point-spread function and crosstalk",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-roi"
      },
      "needs": [
        "roi-integration",
        "fluorescence-photon-budget"
      ]
    },
    {
      "id": "likelihood-ratio-filter",
      "label": "Likelihood-ratio weights and the matched filter",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-matched-filter"
      },
      "needs": [
        "psf-crosstalk",
        "variance"
      ]
    },
    {
      "id": "learned-matched-filter",
      "label": "A filter learned from labelled shots",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-cnn"
      },
      "needs": [
        "likelihood-ratio-filter",
        "matrix-vector"
      ],
      "ref": "ken25"
    },
    {
      "id": "cnn-classifier",
      "label": "A convolutional classifier and its receptive field",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-cnn"
      },
      "needs": [
        "learned-matched-filter"
      ],
      "ref": "phu24"
    },
    {
      "id": "linear-denoiser",
      "label": "A linear denoiser and why it adds nothing",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-wiener"
      },
      "needs": [
        "likelihood-ratio-filter",
        "matrix-vector"
      ]
    },
    {
      "id": "cgan-objective",
      "label": "The conditional-GAN objective",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-pix2pix"
      },
      "needs": [
        "cnn-classifier"
      ],
      "ref": "iso17"
    },
    {
      "id": "denoiser-risk",
      "label": "How a learned cleaner can invent an atom",
      "teach": {
        "course": "papers",
        "chapter": "B5",
        "unit": "b5-pix2pix"
      },
      "needs": [
        "cgan-objective",
        "linear-denoiser"
      ],
      "ref": "gdf25"
    },
    {
      "id": "probability",
      "label": "Chances and how they combine",
      "teach": {
        "course": "qc709",
        "chapter": "F5",
        "unit": "f5-probability"
      },
      "needs": []
    },
    {
      "id": "variance",
      "label": "Spread and the square-root law",
      "teach": {
        "course": "qc709",
        "chapter": "F5",
        "unit": "f5-spread"
      },
      "needs": []
    },
    {
      "id": "matrix-vector",
      "label": "A matrix acting on a list of numbers",
      "teach": {
        "course": "qc709",
        "chapter": "F3",
        "unit": "f3-matrix-of-map"
      },
      "needs": []
    },
    {
      "id": "poisson-histogram",
      "label": "Counting photons against a cutoff",
      "teach": {
        "course": "qc709",
        "chapter": "Q25",
        "unit": "q25-readout"
      },
      "needs": []
    },
    {
      "id": "fluorescence-photon-budget",
      "label": "How many photons an atom gives",
      "teach": {
        "course": "qc709",
        "chapter": "Q25",
        "unit": "q25-readout"
      },
      "needs": []
    }
  ],
  "symbols": {
    "S": "b5-roi",
    "n_ij": "b5-roi",
    "P_1": "b5-matched-filter:b2",
    "P_0": "b5-matched-filter:b2",
    "w_i": "b5-matched-filter:b2",
    "n_i": "b5-matched-filter:b2",
    "s_i": "b5-matched-filter:b2",
    "P": "b5-matched-filter:b2",
    "n": "b5-matched-filter:b2",
    "m": "b5-matched-filter:b2",
    "e": "b5-matched-filter:b2",
    "s": "b5-matched-filter:b2",
    "\\Bigl": "b5-matched-filter:b2",
    "b": "b5-matched-filter:b2",
    "\\Bigr": "b5-matched-filter:b2",
    "b_i": "b5-matched-filter:b2",
    "W_i": "b5-cnn:b2",
    "p": "b5-cnn:b2",
    "\\mu_i": "b5-cnn:b2",
    "\\langle\\cdot\\rangle": "b5-cnn:b2",
    "W": "b5-cnn:b2",
    "a": "b5-cnn:b2",
    "H": "b5-wiener",
    "c": "b5-wiener",
    "H_cj": "b5-wiener",
    "n_j": "b5-wiener",
    "L": "b5-pix2pix",
    "L_GAN": "b5-pix2pix",
    "\\lambda": "b5-pix2pix",
    "L_1": "b5-pix2pix"
  },
  "symbolsFormal": {
    "\\sigma": "b5-roi:b1",
    "N": "b5-roi:b1",
    "b": "b5-roi:b1",
    "k": "b5-roi:b2",
    "f": "b5-roi:b3",
    "s_x": "b5-roi",
    "s_y": "b5-roi",
    "s": "b5-roi",
    "m": "b5-roi",
    "n": "b5-matched-filter:b1",
    "w": "b5-matched-filter:b2",
    "\\iff": "b5-matched-filter:b2",
    "\\ll": "b5-matched-filter:b3",
    "d": "b5-matched-filter:b4",
    "\\tau": "b5-matched-filter:b4",
    "\\prime": "b5-matched-filter",
    "W": "b5-cnn:b1",
    "Y": "b5-cnn:b1",
    "X": "b5-cnn:b1",
    "\\mathsf": "b5-cnn:b1",
    "T": "b5-cnn:b1",
    "\\alpha": "b5-cnn:b1",
    "I": "b5-cnn:b1",
    "\\mu": "b5-cnn:b2",
    "q": "b5-cnn:b2",
    "D": "b5-cnn:b2",
    "c_in": "b5-cnn:b5",
    "c_out": "b5-cnn:b5",
    "r": "b5-cnn:b5",
    "W_4": "b5-cnn:b5",
    "W_1": "b5-cnn:b5",
    "F": "b5-cnn:b6",
    "F_CF": "b5-cnn:b6",
    "D_k": "b5-cnn:b6",
    "B_l": "b5-cnn:b6",
    "B_k": "b5-cnn:b6",
    "D_l": "b5-cnn:b6",
    "\\eta": "b5-cnn:b6",
    "F_base": "b5-cnn:b6",
    "k_\\ell": "b5-cnn",
    "\\Delta": "b5-wiener:b2",
    "\\Sigma": "b5-wiener:b2",
    "\\hat x": "b5-wiener:b3",
    "C_s": "b5-wiener:b3",
    "C_n": "b5-wiener:b3",
    "v": "b5-wiener:b3",
    "u": "b5-wiener:b4",
    "G": "b5-pix2pix:b1",
    "\\lambda_L1": "b5-pix2pix:b1",
    "p_m": "b5-pix2pix:b7",
    "\\mathbb": "b5-pix2pix",
    "E": "b5-pix2pix"
  },
  "units": [
    {
      "id": "b5-roi",
      "title": "A spot on a grid of pixels",
      "question": "What does one atom look like on the camera, and what does a neighbour do to it?",
      "source": {
        "summary": "Phuttitarn and coauthors image tweezer arrays and read each site from the pixels around it. Kent and coauthors do the same with a fitted filter. The spot size and the atom spacing decide how much light a neighbour adds.",
        "where": "Phuttitarn §II-IV; Kent §II"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "filter-lab"
        },
        "tryThis": [
          "Move the spot width up and down. A wider spot puts less light in the middle pixel, so every way of reading the box gets worse.",
          "Compare the flat box with the centre pixel. The box wins because it adds the light the middle pixel misses; the dashed estimate from d′ alone lies far below the truth."
        ]
      },
      "insight": "One atom is a soft spot over several pixels, counted by chance. A box of pixels catches most of the light, and a neighbour that is too close leaks light into it.",
      "insightFormal": "The point-spread function spreads one atom over several pixels, each Poisson counted. A box sum is Poisson, so the single-site threshold error applies; crosstalk is the share of a neighbour's light inside the box.",
      "claims": [
        {
          "key": "b5RoiSigma",
          "text": "the spot width input is 0.9 pixel (our model)",
          "from": {
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
              "background": 0.4
            }
          },
          "value": "sigma"
        },
        {
          "key": "b5RoiBackground",
          "text": "the background input is 0.4 photons per pixel (our model)",
          "from": {
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
              "background": 0.4
            }
          },
          "value": "background"
        }
      ],
      "story": [
        {
          "id": "b5-roi:b1",
          "phase": "books",
          "text": "One atom's light does not land on a single pixel. It spreads into a soft spot, so the camera shows a smear. Each pixel counts its photons by chance. In our model the middle pixel gets 18 % of the light, an edge pixel 10 % and a corner pixel 6 %. [[pp-psf|The spot]] is a model of ours: width 0.9 pixel, 20 photons in all.",
          "formal": "A point source images to the [[pp-psf|point-spread function]], here a Gaussian of width $\\sigma = 0.9$ pixel. The mean in a pixel is $N$ times a difference of two error functions per axis, plus the background $b$; the count is Poisson. The shares are $0.1776$, $0.1018$ and $0.0583$, which for $N=20$ means $3.553$, $2.035$ and $1.166$ photons in the three kinds of pixel.",
          "caption": "one atom spread over the grid (our model, not data)",
          "captionFormal": "mean photons per pixel, $N=20$, $\\sigma=0.9$ (illustrative inputs)",
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
              "background": 0.4
            }
          },
          "claims": [
            {
              "key": "b5PsfCenter",
              "text": "the middle pixel holds 0.1776 of the light",
              "from": {
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
                  "background": 0.4
                }
              },
              "value": "share0"
            },
            {
              "key": "b5PsfEdge",
              "text": "an edge pixel holds 0.1018 of the light",
              "from": {
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
                  "background": 0.4
                }
              },
              "value": "shareEdge"
            },
            {
              "key": "b5PsfCorner",
              "text": "a corner pixel holds 0.0583 of the light",
              "from": {
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
                  "background": 0.4
                }
              },
              "value": "shareCorner"
            },
            {
              "key": "b5SigC",
              "text": "the middle pixel gets 3.553 photons on average (N = 20)",
              "from": {
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
                  "background": 0.4
                }
              },
              "value": "sigC"
            },
            {
              "key": "b5SigE",
              "text": "an edge pixel gets 2.036 photons on average",
              "from": {
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
                  "background": 0.4
                }
              },
              "value": "sigE"
            },
            {
              "key": "b5SigK",
              "text": "a corner pixel gets 1.166 photons on average",
              "from": {
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
                  "background": 0.4
                }
              },
              "value": "sigK"
            }
          ],
          "trail": [
            {
              "ref": "phu24",
              "at": "Section III, the dataset and the spot sizes",
              "why": "The camera images of the array are spots a few pixels wide; the width is the one number the model needs."
            }
          ]
        },
        {
          "id": "b5-roi:b2",
          "phase": "books",
          "text": "Add up the pixels in a box around the atom. A 3 by 3 box holds 82 % of the light and a 5 by 5 box 99 %. The photon count of the whole spot comes from the experiment track of the Optics Lab (<<pp-o10-need|unit O10: how many photons make a bright atom>>).",
          "formal": "The mean light in a $k\\times k$ box is $N$ times the product of two one-axis sums of shares: $0.8180$ of $N$ for $3\\times3$ and $0.9891$ for $5\\times5$. $N$ itself is the photon budget of the Optics Lab experiment track (<<pp-o10-need|O10: the photons of a bright atom>>).",
          "caption": "the 3 by 3 box around the atom",
          "captionFormal": "ROI $3\\times3$: $0.8180$ of $N$",
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
              "roi": 3
            }
          },
          "claims": [
            {
              "key": "b5PsfRoi3",
              "text": "a 3 by 3 box holds 0.8180 of the light",
              "from": {
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
                  "roi": 3
                }
              },
              "value": "roi3"
            },
            {
              "key": "b5PsfRoi5",
              "text": "a 5 by 5 box holds 0.9891 of the light",
              "from": {
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
                  "roi": 3
                }
              },
              "value": "roi5"
            }
          ]
        },
        {
          "id": "b5-roi:b3",
          "phase": "books",
          "text": "Add the counts in the box and call the atom \"there\" when the total reaches a cut. The box and its total are the [[pp-roi|region of interest]]. At the best cut a flat 3 by 3 box misreads the atom 0.46 % of the time.",
          "formal": "The statistic is $S=\\sum_{ij\\in\\mathrm{ROI}} n_{ij}$ over the [[pp-roi|region of interest]]. A sum of Poisson counts is Poisson, with dark mean $9b$ and bright mean $9b+N f$, so the single-site threshold of <<pp-q25-readout|Q25>> applies unchanged (<<pp-o11-hist|two Poisson histograms and a cutoff>>): at the best cut the error is $0.457\\%$.",
          "caption": "one simulated frame of counts; the box is outlined",
          "captionFormal": "one seeded draw of Poisson counts (illustrative), ROI outlined",
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
              "roi": 3,
              "noise": "poisson",
              "seed": 7
            }
          },
          "introduces": [
            "pp-roi"
          ],
          "claims": [
            {
              "key": "b5SquarePoisson",
              "text": "the flat box misreads the atom with chance 0.457 percent at its best cut",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "errors"
                }
              },
              "value": "squarePoisson"
            }
          ],
          "trail": [
            {
              "ref": "ken25",
              "at": "Abstract",
              "why": "A conventional readout thresholds a Gaussian or square mask over the pixels; the matched filter replaces the mask."
            }
          ],
          "fidelity": [
            "camera-frame-draw"
          ]
        },
        {
          "id": "b5-roi:b4",
          "phase": "books",
          "text": "A second bright atom two pixels away leaks light into your box; four pixels away it hardly does. A neighbour at two pixels puts 29 % of its light in the three-pixel window around your atom, at four pixels 0.27 %. That leaked light is [[pp-crosstalk|crosstalk]]. In a measured array the nearest-neighbour cross-fidelity went from 0.0138 at 9 µm to 0.0428 at 5 µm.",
          "formal": "[[pp-crosstalk|Crosstalk]] is the share of atom A's light inside the window around atom B: $0.2892$ at separation 2 pixels and $0.0027$ at 4 pixels. Phuttitarn et al. report the average nearest-neighbour cross-fidelity of a square mask rising from 0.0138 to 0.0428 as the spacing shrinks from 9 µm to 5 µm.",
          "caption": "two atoms two pixels apart: each box catches the other's light",
          "captionFormal": "separation 2 pixels: $0.2892$ of A's light in B's window",
          "stage": {
            "recipe": "pixel-frame",
            "params": {
              "rows": 5,
              "cols": 7,
              "sites": [
                [
                  2,
                  2
                ],
                [
                  2,
                  4
                ]
              ],
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4
            }
          },
          "claims": [
            {
              "key": "b5CrossFrac2",
              "text": "a neighbour two pixels away puts 0.2892 of its light in the window",
              "from": {
                "recipe": "pixel-frame",
                "params": {
                  "rows": 5,
                  "cols": 7,
                  "sites": [
                    [
                      2,
                      2
                    ],
                    [
                      2,
                      4
                    ]
                  ],
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4
                }
              },
              "value": "cross"
            },
            {
              "key": "b5CrossFrac4",
              "text": "a neighbour four pixels away puts 0.0027 of its light in the window",
              "from": {
                "recipe": "pixel-frame",
                "params": {
                  "rows": 5,
                  "cols": 9,
                  "sites": [
                    [
                      2,
                      2
                    ],
                    [
                      2,
                      6
                    ]
                  ],
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4
                }
              },
              "value": "cross"
            }
          ],
          "reported": [
            {
              "id": "phu-xfid",
              "text": "nearest-neighbour cross-fidelity, square mask, 9 and 5 micrometre spacing",
              "value": "0.0138 to 0.0428",
              "source": "phu24",
              "at": {
                "kind": "section",
                "label": "IV"
              }
            }
          ],
          "trail": [
            {
              "ref": "phu24",
              "at": "Section IV, Tables III and IV",
              "why": "Shows crosstalk growing as the atoms are packed closer; our figure is the geometry that explains it."
            }
          ]
        },
        {
          "id": "b5-roi:b5",
          "phase": "clue",
          "text": "How much of the light falls outside a 3 by 3 box if the spot is narrower, width 0.6 pixel, or wider, width 1.2 pixels?",
          "formal": "Compute $1-\\text{(box share)}$ for $\\sigma=0.6$ and for $\\sigma=1.2$ pixels, the box being $3\\times3$.",
          "caption": "a narrow spot (width 0.6 pixel)",
          "captionFormal": "$\\sigma=0.6$ pixel",
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
              "sigma": 0.6,
              "photons": 20,
              "background": 0.4,
              "roi": 3
            }
          },
          "claims": [
            {
              "key": "b5InSigmaA",
              "text": "the narrow spot width input is 0.6 pixel",
              "from": {
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
                  "sigma": 0.6,
                  "photons": 20,
                  "background": 0.4,
                  "roi": 3
                }
              },
              "value": "sigma"
            },
            {
              "key": "b5InSigmaB",
              "text": "the wide spot width input is 1.2 pixels",
              "from": {
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
                  "sigma": 1.2,
                  "photons": 20,
                  "background": 0.4,
                  "roi": 3
                }
              },
              "value": "sigma"
            }
          ],
          "reveal": {
            "text": "A narrow spot leaks little: 2.5 % falls outside the box. A wide spot leaks a lot: 38 %.",
            "formal": "$1-\\text{box share}$ is $0.0247$ for $\\sigma=0.6$ and $0.378$ for $\\sigma=1.2$.",
            "caption": "a wide spot (width 1.2 pixels)",
            "captionFormal": "$\\sigma=1.2$ pixels",
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
                "sigma": 1.2,
                "photons": 20,
                "background": 0.4,
                "roi": 3
              }
            },
            "claims": [
              {
                "key": "b5OutsideSig06",
                "text": "a narrow spot leaves 0.0247 of its light outside the 3 by 3 box",
                "from": {
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
                    "sigma": 0.6,
                    "photons": 20,
                    "background": 0.4,
                    "roi": 3
                  }
                },
                "value": "out3"
              },
              {
                "key": "b5OutsideSig12",
                "text": "a wide spot leaves 0.378 of its light outside the 3 by 3 box",
                "from": {
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
                    "sigma": 1.2,
                    "photons": 20,
                    "background": 0.4,
                    "roi": 3
                  }
                },
                "value": "out3"
              }
            ]
          }
        },
        {
          "id": "b5-roi:b6",
          "phase": "deeper",
          "text": "Why is the spot a Gaussian? A real lens makes a ring pattern with a bright core, and a Gaussian is a good stand-in for the core. The choice only shapes the weights, so we treat it as a modelling input.",
          "formal": "Diffraction gives an Airy pattern whose core a Gaussian approximates. The width $\\sigma$ is a modelling input here; the optics that fix it belong to the Optics Lab experiment track (<<pp-o10-collect|O10: how many photons reach the camera>>), and nothing below depends on the tails.",
          "caption": "the spot shape is an input, not a result",
          "captionFormal": "Gaussian stand-in for the Airy core",
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
              "background": 0.4
            }
          }
        }
      ],
      "review": {
        "points": [
          "One atom spreads over several pixels, and each pixel counts by chance.",
          "A box around the atom catches most of the light; a bigger box adds background faster than light.",
          "A neighbour too close puts its light in your box: crosstalk."
        ],
        "equations": "S=\\sum_{ij\\in\\mathrm{ROI}} n_{ij}",
        "trap": "Treating the spot as one pixel: the share in the middle pixel is well under half, so one pixel alone is a poor readout.",
        "formal": {
          "points": [
            "The mean in a pixel is $N\\,s_x s_y+b$ with $s$ the one-axis share of the Gaussian.",
            "A sum of Poisson counts over a ROI is Poisson, so the single-site threshold error applies.",
            "Crosstalk is the share of a neighbour's spot inside the window around the site."
          ],
          "equations": "S=\\sum_{ij\\in\\mathrm{ROI}} n_{ij},\\quad S\\sim\\mathrm{Poisson}(m)",
          "trap": "Using d′ alone to judge a small signal: Poisson tails are fatter than the normal's."
        }
      },
      "play": [
        {
          "id": "b5-r-centre",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "The middle pixel of a narrow spot",
          "prompt": "For a spot of width 0.6 pixel, what share of the light falls in the central pixel?",
          "answerFrom": {
            "from": {
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
                "sigma": 0.6,
                "photons": 20,
                "background": 0.4
              }
            },
            "value": "share0"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "The share in a pixel is the product of a row share and a column share."
            },
            {
              "text": "One axis: the Gaussian inside plus or minus half a pixel."
            },
            {
              "text": "Square the one-axis share."
            }
          ],
          "walkthrough": [
            {
              "text": "In one axis the share within half a pixel of the centre is 0.5943."
            },
            {
              "text": "The central pixel gets the product of the row and column shares."
            },
            {
              "text": "0.5943 squared is 0.3532, about 0.354."
            }
          ]
        },
        {
          "id": "b5-r-roi5",
          "kind": "numeric",
          "tier": "core",
          "title": "A 5 by 5 box on a wide spot",
          "prompt": "For a spot of width 1.2 pixels, what share of the light lies inside a 5 by 5 box around the atom?",
          "answerFrom": {
            "from": {
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
                "sigma": 1.2,
                "photons": 20,
                "background": 0.4
              }
            },
            "value": "roi5"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Sum the five one-axis shares, then square the sum."
            },
            {
              "text": "The one-axis shares are for offsets -2 to 2."
            },
            {
              "text": "The five shares add to about 0.963."
            }
          ],
          "walkthrough": [
            {
              "text": "One axis: the shares at offsets 0, 1, 2 are about 0.3, 0.24 and 0.06 (both signs)."
            },
            {
              "text": "Their sum over five pixels is about 0.963."
            },
            {
              "text": "Squared: 0.927."
            }
          ]
        },
        {
          "id": "b5-r-dim",
          "kind": "numeric",
          "tier": "core",
          "title": "Dim corners",
          "prompt": "Our spot has width 0.9 pixel. In a 5 by 5 box, how many pixels hold less than 1 percent of the light?",
          "answerFrom": {
            "from": {
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
                "background": 0.4
              }
            },
            "value": "dim5"
          },
          "tolerance": 0,
          "hints": [
            {
              "text": "Compute the one-axis shares at offsets 0 to 2."
            },
            {
              "text": "A pixel share is the product of a row share and a column share."
            },
            {
              "text": "Count the pixels whose product is below 0.01."
            }
          ],
          "walkthrough": [
            {
              "text": "The one-axis shares are about 0.43 (offset 0), 0.23 (offset 1), 0.05 (offset 2)."
            },
            {
              "text": "Pixels with both offsets 2 hold 0.003; with one offset 2 and one offset 1 or 0 they hold about 0.011 or 0.02."
            },
            {
              "text": "Only the four corners are below 1 percent: the answer is 4."
            }
          ]
        }
      ],
      "pitfalls": [
        "Reading the middle pixel alone: it holds less than a fifth of the light here."
      ]
    },
    {
      "id": "b5-matched-filter",
      "title": "Weighting pixels: the best sum",
      "question": "Which weights on the pixels give the fewest wrong answers?",
      "source": {
        "summary": "Kent and coauthors replace a Gaussian mask by a weighted sum of the pixels fitted to data. The best weights for Poisson counts follow from the likelihood ratio, which is our own derivation, standard in detection theory.",
        "where": "Kent Eqs. 1-3; our derivation"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "exposure-bench"
        },
        "tryThis": [
          "Raise the exposure and watch the flat-box error fall much faster than the estimate from d′ suggests at small signals.",
          "Read d′(τ) over d′(1) at τ = 3: it is the square root of 3, not 3."
        ]
      },
      "insight": "Weights ln(1 + s/b) give the fewest wrong bits, and the flat box is nearly as good when the spot stands well above the background. The separation grows as the square root of the exposure.",
      "insightFormal": "For independent Poisson pixels the likelihood-ratio statistic Σ w_i n_i with w_i = ln(1+s_i/b_i) reaches the Bayes error. In the weak-signal limit d′² = Σ s_i²/b_i, so d′ grows as the square root of the exposure.",
      "claims": [
        {
          "key": "b5MfSigma",
          "text": "the spot width input is 0.9 pixel (our model)",
          "from": {
            "recipe": "filter-compare",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "tau": 1,
              "view": "dprime"
            }
          },
          "value": "sigma"
        },
        {
          "key": "b5MfBackground",
          "text": "the background input is 0.4 photons per pixel (our model)",
          "from": {
            "recipe": "filter-compare",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "tau": 1,
              "view": "dprime"
            }
          },
          "value": "background"
        }
      ],
      "story": [
        {
          "id": "b5-matched-filter:b1",
          "phase": "books",
          "text": "One pixel carries evidence. A bright atom adds 1.2 photons on average to a pixel with background 0.4, and the pixel shows 3 counts. The evidence for \"bright\" is then 2.96. More counts mean more evidence.",
          "formal": "For one pixel the log-likelihood ratio is $-s+n\\ln(1+s/b)$. With $s=1.2$, $b=0.4$ and $n=3$ it is $2.9589$.",
          "caption": "evidence against counts in one pixel",
          "captionFormal": "$-s+n\\ln(1+s/b)$ against $n$ (illustrative $s=1.2$, $b=0.4$)",
          "stage": {
            "recipe": "filter-compare",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "tau": 1,
              "view": "llr-line",
              "pixelS": 1.2,
              "pixelN": 3
            }
          },
          "claims": [
            {
              "key": "b5LlrOnePixel",
              "text": "one pixel with three counts gives 2.9589 of evidence for bright",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "llr-line",
                  "pixelS": 1.2,
                  "pixelN": 3
                }
              },
              "value": "llrPixel"
            },
            {
              "key": "b5MfPixelS",
              "text": "the atom adds 1.2 photons to this pixel on average (an input)",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "llr-line",
                  "pixelS": 1.2,
                  "pixelN": 3
                }
              },
              "value": "pixelS"
            }
          ],
          "trail": [
            {
              "ref": "ken25",
              "at": "the matched-filter section",
              "why": "A matched filter weights pixels by how much evidence each carries."
            }
          ]
        },
        {
          "id": "b5-matched-filter:b2",
          "phase": "books",
          "text": "Add every pixel's evidence. Each count gets its own [[pp-llr-weights|weight]], and one fixed amount is taken off. The weights are 2.29 in the middle, 1.81 on an edge and 1.36 in a corner. Call the atom \"there\" when the weighted total beats 16.4. This is a [[pp-matched-filter|matched filter]].",
          "formal": "The statistic is $\\mathrm{LLR}=\\sum_i w_i n_i-\\sum_i s_i$ with [[pp-llr-weights|weights]] $w_i=\\ln(1+s_i/b_i)$. Decide \"bright\" when $S=\\sum w_i n_i$ exceeds $\\sum s_i=16.36$. For the $3\\times3$ box: $w=2.291,\\ 1.806,\\ 1.365$. A [[pp-matched-filter|matched filter]] is a weighted sum with weights following the template.",
          "caption": "the box, and the weights that read it best",
          "captionFormal": "ROI and its weights $w_i=\\ln(1+s_i/b_i)$ (our model)",
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
              "roi": 3,
              "panels": [
                {
                  "show": "photons"
                },
                {
                  "show": "weights",
                  "filter": "llr"
                }
              ]
            }
          },
          "introduces": [
            "pp-llr-weights"
          ],
          "derivation": {
            "result": "\\ln\\frac{P_1}{P_0}=\\sum_i w_i n_i-\\sum_i s_i",
            "ground": [
              {
                "tex": "P(n)=\\frac{m^{n}e^{-m}}{n!}",
                "why": "One pixel: the chance of n counts when the mean is m, drawn for a dark pixel and for a bright one.",
                "view": {
                  "recipe": "filter-compare",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "tau": 1,
                    "view": "pmf"
                  }
                },
                "viewCaption": "one pixel's counts"
              },
              {
                "tex": "\\frac{P_1(n)}{P_0(n)}=e^{-s}\\Bigl(1+\\frac{s}{b}\\Bigr)^{n}",
                "why": "The ratio of bright to dark chances: each count multiplies the odds by 1 plus s over b.",
                "view": {
                  "recipe": "filter-compare",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "tau": 1,
                    "view": "llr-line"
                  }
                },
                "viewCaption": "odds per count"
              },
              {
                "tex": "\\ln\\frac{P_1}{P_0}=\\sum_i n_i\\ln\\Bigl(1+\\frac{s_i}{b_i}\\Bigr)-\\sum_i s_i",
                "why": "Pixels are independent, so the ratios multiply and their logarithms add.",
                "view": {
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
                    "roi": 3,
                    "panels": [
                      {
                        "show": "photons"
                      },
                      {
                        "show": "weights",
                        "filter": "llr"
                      }
                    ]
                  }
                },
                "viewCaption": "weights on the frame"
              },
              {
                "tex": "w_i=\\ln\\Bigl(1+\\frac{s_i}{b_i}\\Bigr)\\ \\Rightarrow\\ \\ln\\frac{P_1}{P_0}=\\sum_i w_i n_i-\\sum_i s_i",
                "why": "For a weak signal the weight follows the spot; for a strong one the logarithm flattens the middle.",
                "view": {
                  "recipe": "filter-compare",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "tau": 1,
                    "view": "wsx"
                  }
                },
                "viewCaption": "log against s over b"
              }
            ],
            "formal": [
              {
                "tex": "\\ln\\frac{P_1(n)}{P_0(n)}=-\\sum_i s_i+\\sum_i n_i\\ln\\Bigl(1+\\frac{s_i}{b_i}\\Bigr)",
                "why": "Independent Poisson pixels: the log-likelihood ratio is a weighted sum of counts minus a constant.",
                "view": {
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
                    "roi": 3,
                    "panels": [
                      {
                        "show": "photons"
                      },
                      {
                        "show": "weights",
                        "filter": "llr"
                      }
                    ]
                  }
                }
              },
              {
                "tex": "\\text{decide bright}\\iff \\ln\\frac{P_1}{P_0}>0",
                "why": "With equal priors this rule has the least error of any rule (Neyman-Pearson, Bayes).",
                "view": {
                  "recipe": "filter-compare",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "tau": 1,
                    "view": "errors"
                  }
                }
              },
              {
                "tex": "w_i=\\ln(1+s_i/b_i),\\quad \\ln\\frac{P_1}{P_0}=\\sum_i w_i n_i-\\sum_i s_i",
                "why": "Enumerating the three symmetry classes shows its error equals the Bayes error.",
                "view": {
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
            ]
          },
          "claims": [
            {
              "key": "b5WLlrC",
              "text": "the middle pixel weight is 2.291",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "llr-line"
                }
              },
              "value": "wLlrC"
            },
            {
              "key": "b5WLlrE",
              "text": "an edge pixel weight is 1.806",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "llr-line"
                }
              },
              "value": "wLlrE"
            },
            {
              "key": "b5WLlrK",
              "text": "a corner pixel weight is 1.365",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "llr-line"
                }
              },
              "value": "wLlrK"
            },
            {
              "key": "b5LlrThreshold",
              "text": "the cut on the weighted total is 16.36",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "llr-line"
                }
              },
              "value": "threshold"
            }
          ]
        },
        {
          "id": "b5-matched-filter:b3",
          "phase": "books",
          "text": "On the same frames the best sum makes the fewest mistakes. Reading one pixel is wrong 7.8 % of the time, a flat box 0.46 %, a Gaussian-shaped sum 0.49 % and the best weights 0.42 %. Here the flat box beats the Gaussian shape because the middle pixel stands far above the background.",
          "formal": "Exact errors with equal priors, our inputs: centre pixel $7.83\\%$, Gaussian-shaped sum (weights $\\propto s$) $0.487\\%$, flat box $0.457\\%$, likelihood ratio $0.416\\%$, which equals the Bayes error $0.416\\%$ by full enumeration. Weights $\\propto s$ are the weak-signal form ($s\\ll b$).",
          "caption": "four ways to read the same box",
          "captionFormal": "exact error of each sum, equal priors (our model)",
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
          "claims": [
            {
              "key": "b5ErrCenter",
              "text": "the centre pixel alone is wrong with chance 0.0783",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "errors"
                }
              },
              "value": "errCentre"
            },
            {
              "key": "b5ErrSquare3",
              "text": "the flat 3 by 3 box is wrong with chance 0.00457",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "errors"
                }
              },
              "value": "errSquare"
            },
            {
              "key": "b5ErrGauss",
              "text": "the Gaussian-shaped sum is wrong with chance 0.00487",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "errors"
                }
              },
              "value": "errGauss"
            },
            {
              "key": "b5ErrLlr",
              "text": "the likelihood-ratio sum is wrong with chance 0.00416",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "errors"
                }
              },
              "value": "errLlr"
            },
            {
              "key": "b5ErrBayes",
              "text": "the Bayes error by full enumeration is 0.00416, equal to the likelihood-ratio error",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "errors"
                }
              },
              "value": "errBayes"
            }
          ],
          "trail": [
            {
              "ref": "ken25",
              "at": "the comparison of mask and fitted filter",
              "why": "The paper compares a Gaussian threshold with fitted weights; our exact numbers are for our model and not its data."
            }
          ]
        },
        {
          "id": "b5-matched-filter:b4",
          "phase": "books",
          "text": "More light helps by a square root. Double the light and the background together and the errors fall; four times the exposure doubles the separation (2.00). With twice the exposure the best weights err 0.0095 % of the time, with half the exposure 3.1 %. The flat box at twice the exposure errs 0.0124 %. The [[pp-dprime|separation d′]] alone predicts an error of 1.6 in ten to the 6 here, far too small: use the exact sum.",
          "formal": "In the weak-signal limit $d'^2=\\sum_i s_i^2/b_i=86.6$ ([[pp-dprime|separation]]). Scaling $s$ and $b$ by $\\tau$ gives $d'\\propto\\sqrt\\tau$ (<<pp-f5-spread|the square-root law of spread>>): the ratio at $\\tau=4$ is $2.00$. Likelihood-ratio error: $3.11\\%$ at half the exposure, $0.0095\\%$ at twice; flat box at twice $0.0124\\%$. The normal estimate is $1.64\\times10^{-6}$: Poisson tails are fatter. The Optics Lab works the same trade on the camera: <<pp-o11-exposure|more light, fewer errors>>, and <<pp-o11-camera|the camera's own noise>>.",
          "caption": "error against exposure: flat box, Gaussian shape, best weights",
          "captionFormal": "exact error against $\\tau$ (photons and background $\\times\\tau$), our model",
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
          "claims": [
            {
              "key": "b5Dprime2",
              "text": "d prime squared of the 3 by 3 box is 86.59",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "dprime"
                }
              },
              "value": "dprime2"
            },
            {
              "key": "b5DprimeRatio4",
              "text": "four times the exposure doubles d prime",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 4,
                  "view": "dprime"
                }
              },
              "value": "dprimeRatio"
            },
            {
              "key": "b5ErrLlrTauHalf",
              "text": "at half the exposure the best weights are wrong with chance 0.0311",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 0.5,
                  "view": "errors"
                }
              },
              "value": "errLlr"
            },
            {
              "key": "b5ErrLlrTau2",
              "text": "at twice the exposure the best weights are wrong with chance 0.0000946",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 2,
                  "view": "errors"
                }
              },
              "value": "errLlr"
            },
            {
              "key": "b5ErrSquareTau2",
              "text": "at twice the exposure the flat box is wrong with chance 0.000124",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 2,
                  "view": "errors"
                }
              },
              "value": "errSquare"
            },
            {
              "key": "b5NormalErrM",
              "text": "the normal estimate from d prime has mantissa 1.64",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "dprime"
                }
              },
              "value": "normalErrM"
            },
            {
              "key": "b5NormalErrE",
              "text": "the normal estimate from d prime is of order ten to the minus six",
              "from": {
                "recipe": "filter-compare",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "tau": 1,
                  "view": "dprime"
                }
              },
              "value": "normalErrE"
            }
          ],
          "trail": [
            {
              "ref": "ken25",
              "at": "the matched-filter discussion",
              "why": "The square-root growth of the separation with exposure is the reason longer readouts help; our exact errors show the size of the gain."
            }
          ]
        },
        {
          "id": "b5-matched-filter:b5",
          "phase": "clue",
          "text": "What weight does a pixel get if the atom adds 3 counts to a background of 1? What is d′² for two pixels with signals 4 and 1, both on a background of 1? How much does d′ grow if the exposure grows ninefold?",
          "formal": "Compute $w=\\ln(1+s/b)$ for $s=3$, $b=1$; $d'^2=\\sum s^2/b$ for $s=(4,1)$, $b=(1,1)$; and the growth of $d'$ for $\\tau=9$.",
          "caption": "evidence per count when the atom adds 3 to a background of 1",
          "captionFormal": "$-s+n\\ln(1+s/b)$ with $s=3$, $b=1$",
          "stage": {
            "recipe": "filter-compare",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 1,
              "tau": 1,
              "view": "llr-line",
              "pixelS": 3,
              "pixelN": 0
            }
          },
          "reveal": {
            "text": "The weight is ln 4, 1.39. The d′ squared is 16 + 1, 17. A ninefold exposure grows d′ threefold, the square root of nine.",
            "formal": "$w=\\ln 4=1.386$; $d'^2=16+1=17$; $d'\\propto\\sqrt\\tau$ gives a factor $3$.",
            "claims": [
              {
                "key": "b5ClueW",
                "text": "the weight is the natural log of 4, 1.386",
                "from": {
                  "recipe": "filter-compare",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 1,
                    "tau": 1,
                    "view": "llr-line",
                    "pixelS": 3,
                    "pixelN": 0
                  }
                },
                "value": "llrPixelWeight"
              },
              {
                "key": "b5ClueD2",
                "text": "d prime squared for signals 4 and 1 on backgrounds 1 and 1 is 17",
                "from": {
                  "recipe": "filter-compare",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 1,
                    "tau": 1,
                    "view": "llr-line",
                    "pairS": [
                      4,
                      1
                    ],
                    "pairB": [
                      1,
                      1
                    ]
                  }
                },
                "value": "pairD2"
              },
              {
                "key": "b5ClueRatio9",
                "text": "a ninefold exposure grows d prime threefold",
                "from": {
                  "recipe": "filter-compare",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 1,
                    "tau": 9,
                    "view": "dprime"
                  }
                },
                "value": "dprimeRatio"
              }
            ]
          }
        },
        {
          "id": "b5-matched-filter:b6",
          "phase": "deeper",
          "text": "No reading of the pixels can beat the Bayes error of the true image model. What a cleaner plus a threshold could still gain is information the sum ignores. Examples are crosstalk from neighbours, vanished atoms and camera noise that is not Poisson.",
          "formal": "A classifier sees only the pixels, so none beats the Bayes error of the true image law (here equal to the likelihood-ratio error above). A denoise-then-classify pipeline can gain only where the true law departs from the model: crosstalk, atom loss, non-Poisson camera noise, or a better prior.",
          "caption": "the ceiling is the likelihood-ratio bar",
          "captionFormal": "no sum of the pixels goes below the Bayes error (our model)",
          "stage": {
            "recipe": "filter-compare",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "tau": 1,
              "view": "errors"
            }
          }
        }
      ],
      "review": {
        "points": [
          "One pixel's evidence is ln(1 + s/b) times its counts, less s.",
          "Add the evidence of every pixel: a weighted sum with weights ln(1 + s/b).",
          "This weighted sum has the fewest wrong bits; a flat box is close when the spot stands above the background.",
          "The separation grows as the square root of the exposure."
        ],
        "equations": "\\mathrm{LLR}=\\sum_i w_in_i-\\sum_i s_i",
        "trap": "Using the Gaussian-shaped weights (proportional to the spot) for a bright spot: the logarithm flattens the middle and the flat box can do better.",
        "formal": {
          "points": [
            "Independent Poisson pixels: $\\mathrm{LLR}=\\sum_i n_i\\ln(1+s_i/b_i)-\\sum_i s_i$.",
            "With equal priors the rule LLR > 0 attains the Bayes error, so no weighted sum of the pixels beats it.",
            "$d\\prime^2=\\sum s_i^2/b_i$ in the weak-signal limit; scaling $s$, $b$ by $\\tau$ scales $d\\prime$ by $\\sqrt\\tau$."
          ],
          "equations": "w_i=\\ln(1+s_i/b_i),\\quad d\\prime^2=\\sum_i s_i^2/b_i",
          "trap": "Judging a small signal by the normal estimate Q(d′/2): the exact Poisson tail is much fatter."
        }
      },
      "play": [
        {
          "id": "b5-m-w",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "One pixel's weight",
          "prompt": "A bright atom adds 3 photons to a pixel with background 1. What is the weight ln(1 + s/b) of that pixel?",
          "answerFrom": {
            "from": {
              "recipe": "filter-compare",
              "params": {
                "sigma": 0.9,
                "photons": 20,
                "background": 1,
                "tau": 1,
                "view": "llr-line",
                "pixelS": 3,
                "pixelN": 0
              }
            },
            "value": "llrPixelWeight"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "The weight is the natural logarithm of 1 + s/b."
            },
            {
              "text": "Here s = 3 and b = 1."
            },
            {
              "text": "Compute ln 4."
            }
          ],
          "walkthrough": [
            {
              "text": "The ratio s/b is 3."
            },
            {
              "text": "The weight is ln(1 + 3) = ln 4."
            },
            {
              "text": "ln 4 is about 1.386."
            }
          ]
        },
        {
          "id": "b5-m-d2",
          "kind": "numeric",
          "tier": "core",
          "title": "Separation of two pixels",
          "prompt": "Two pixels have bright signals 4 and 1 on backgrounds 1 and 1. What is d′² = Σ s²/b?",
          "answerFrom": {
            "from": {
              "recipe": "filter-compare",
              "params": {
                "sigma": 0.9,
                "photons": 20,
                "background": 1,
                "tau": 1,
                "view": "llr-line",
                "pairS": [
                  4,
                  1
                ],
                "pairB": [
                  1,
                  1
                ]
              }
            },
            "value": "pairD2"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Compute s²/b for each pixel."
            },
            {
              "text": "The first pixel gives 16 over 1."
            },
            {
              "text": "Add the two pixels."
            }
          ],
          "walkthrough": [
            {
              "text": "Pixel one: 4 squared over 1 is 16."
            },
            {
              "text": "Pixel two: 1 squared over 1 is 1."
            },
            {
              "text": "Sum: 17."
            }
          ]
        },
        {
          "id": "b5-m-ratio",
          "kind": "numeric",
          "tier": "core",
          "title": "Nine times the light",
          "prompt": "If the exposure grows ninefold (signal and background together), by what factor does d′ grow?",
          "answerFrom": {
            "from": {
              "recipe": "filter-compare",
              "params": {
                "sigma": 0.9,
                "photons": 20,
                "background": 1,
                "tau": 9,
                "view": "dprime"
              }
            },
            "value": "dprimeRatio"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "d′ squared is a sum of s squared over b."
            },
            {
              "text": "Scaling s and b by tau scales d′ squared by tau."
            },
            {
              "text": "Take the square root of nine."
            }
          ],
          "walkthrough": [
            {
              "text": "d′² scales with tau because s² grows as tau² and b as tau."
            },
            {
              "text": "So d′ scales as the square root of tau."
            },
            {
              "text": "The square root of 9 is 3."
            }
          ]
        }
      ],
      "pitfalls": [
        "Reading d′ as a probability of error: it is a distance; the error needs the exact tails."
      ]
    },
    {
      "id": "b5-cnn",
      "title": "Learning the weights, then a small network",
      "question": "Can weights be learned from labelled shots, and what do networks add?",
      "source": {
        "summary": "Kent and coauthors fit a matched filter to labelled shots by least squares; Phuttitarn and coauthors train a convolutional network per site and per array. Both are compared with a Gaussian threshold.",
        "where": "Kent §III, App. A; Phuttitarn Tables I-II"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "filter-lab"
        },
        "tryThis": [
          "The best weights are the bottom bar of the readout: no learned filter, linear or not, can read the box below that error in our model.",
          "Make the background large: the likelihood-ratio weights and the flat box come together, which is why a fitted filter can look like a plain box."
        ]
      },
      "insight": "A filter can be fitted from labelled shots instead of derived. For one atom it comes out as the spot divided by the local brightness. With a close neighbour it learns to subtract the neighbour's pixels. A network adds a bend and a wider view, at a large cost in parameters.",
      "insightFormal": "The population least-squares filter is W = Cov(n)^{-1} Cov(n, a); for one atom it is ∝ s/(b + ps), and with a neighbour it is negative on the neighbour's pixels. A CNN adds nonlinearity and receptive field at about 10² times the parameters.",
      "claims": [
        {
          "key": "b5CnSigma",
          "text": "the spot width input is 0.9 pixel (our model)",
          "from": {
            "recipe": "learned-filter",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "spacing": 2,
              "view": "profile"
            }
          },
          "value": "sigma"
        },
        {
          "key": "b5CnBackground",
          "text": "the background input is 0.4 photons per pixel (our model)",
          "from": {
            "recipe": "learned-filter",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "spacing": 2,
              "view": "profile"
            }
          },
          "value": "background"
        }
      ],
      "story": [
        {
          "id": "b5-cnn:b1",
          "phase": "books",
          "text": "If you do not know the spot, collect labelled shots and let the computer fit the weights. Pick the weights whose sum best predicts the right answer, bright or dark. The result is a [[pp-learned-filter|learned filter]].",
          "formal": "Kent et al. fit $W=YX^{\\mathsf T}(XX^{\\mathsf T}+\\alpha I)^{-1}$ with $X$ the flattened pixels of a box plus a constant and $Y$ the zero-or-one labels from a long exposure. The fit is convex: one linear solve gives the [[pp-learned-filter|learned filter]].",
          "caption": "the box, and a filter fitted to shots of it (illustrative)",
          "captionFormal": "ROI and its population least-squares weights (our model)",
          "stage": {
            "recipe": "learned-filter",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "spacing": 4,
              "view": "frame"
            }
          },
          "trail": [
            {
              "ref": "ken25",
              "at": "Appendix A",
              "why": "The fitted filter is a ridge regression of the label on the pixel counts, solved in one step."
            }
          ]
        },
        {
          "id": "b5-cnn:b2",
          "phase": "books",
          "text": "For an isolated atom the fitted weights look like the spot divided by the local brightness. Bright pixels near the middle get a little less than the spot alone would say. The total evidence per pixel, summed, is 33.9.",
          "formal": "With prior $p$ one half, $\\mathrm{Cov}(n)=\\mathrm{diag}(\\mu)+p(1-p)ss^{\\mathsf T}$ and $\\mu=b+ps$. Sherman-Morrison gives $W\\propto s_i/\\mu_i$, with $q=s^{\\mathsf T}D^{-1}s=33.89$ on our strip.",
          "caption": "weights along a strip of pixels, isolated atom",
          "captionFormal": "$W_i\\propto s_i/(b+ps_i)$, strip of 7 pixels, atom at pixel 2",
          "stage": {
            "recipe": "learned-filter",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "spacing": 2,
              "view": "profile"
            }
          },
          "derivation": {
            "result": "W_i\\propto\\frac{s_i}{b+p\\,s_i}",
            "ground": [
              {
                "tex": "\\mu_i=b+p\\,s_i",
                "why": "Each pixel has a mean count that mixes the dark and bright cases by the chance p that the atom is there.",
                "view": {
                  "recipe": "learned-filter",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "p": 0.5,
                    "spacing": 2,
                    "view": "profile"
                  }
                },
                "viewCaption": "weights, isolated atom"
              },
              {
                "tex": "W=\\arg\\min_W\\ \\langle(a-W\\cdot n)^2\\rangle",
                "why": "Least squares asks for the combination of pixels that best predicts the label, 1 for bright and 0 for dark.",
                "view": {
                  "recipe": "learned-filter",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "p": 0.5,
                    "spacing": 4,
                    "view": "frame"
                  }
                },
                "viewCaption": "weights on the frame"
              },
              {
                "tex": "W_i\\propto\\frac{s_i}{b+p\\,s_i}",
                "why": "The solution is the spot divided by the brightness of each pixel; a second atom changes the brightness and turns its pixels negative.",
                "view": {
                  "recipe": "learned-filter",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "p": 0.5,
                    "spacing": 2,
                    "view": "profile"
                  }
                },
                "viewCaption": "with a neighbour"
              }
            ],
            "formal": [
              {
                "tex": "\\mathrm{Cov}(n)=D+p(1-p)\\,ss^{\\mathsf T},\\quad D=\\mathrm{diag}(b+ps)",
                "why": "Counts are Poisson given the atom, plus a rank-one bump from the atom being there or not.",
                "view": {
                  "recipe": "learned-filter",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "p": 0.5,
                    "spacing": 2,
                    "view": "profile"
                  }
                }
              },
              {
                "tex": "W=\\mathrm{Cov}(n)^{-1}\\mathrm{Cov}(n,a)=\\frac{p(1-p)}{1+p(1-p)q}\\,D^{-1}s,\\quad q=s^{\\mathsf T}D^{-1}s",
                "why": "Sherman and Morrison invert a diagonal plus a rank-one matrix in closed form.",
                "view": {
                  "recipe": "learned-filter",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "p": 0.5,
                    "spacing": 4,
                    "view": "frame"
                  }
                }
              },
              {
                "tex": "W_i\\propto\\frac{s_i}{b+p\\,s_i}",
                "why": "The weights are the template over the local mean; a neighbour adds a second rank-one term and its pixels go negative.",
                "view": {
                  "recipe": "learned-filter",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "p": 0.5,
                    "spacing": 2,
                    "view": "profile"
                  }
                }
              }
            ]
          },
          "claims": [
            {
              "key": "b5Q",
              "text": "the sum of s squared over the mean count along the strip is 33.89",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "q"
            }
          ]
        },
        {
          "id": "b5-cnn:b3",
          "phase": "books",
          "text": "When a second atom sits two pixels away, the filter learns to subtract the pixels that belong to it. Scaled so the largest weight is 1, the weights along the strip are 0.62, 1.00, 0.96, 0.41, then −0.13, −0.23 and −0.15. Without the neighbour the same pixels get 0.58 and 0.07, all positive.",
          "formal": "With atoms at pixels 2 and 4 and $p$ one half, the population filter (largest weight 1) is $0.624,\\ 1.000,\\ 0.957,\\ 0.414,\\ -0.131,\\ -0.230,\\ -0.149$. The sign at the neighbour's centre is negative; the isolated atom gives $0.580$ and $0.069$ there. A sampled regression of many simulated shots agrees closely.",
          "caption": "weights with and without a neighbour; the frame view in two dimensions",
          "captionFormal": "strip: atoms at 2 and 4; frame: learned weights over the ROI (our model)",
          "stage": {
            "layout": "split",
            "top": {
              "recipe": "learned-filter",
              "params": {
                "sigma": 0.9,
                "photons": 20,
                "background": 0.4,
                "p": 0.5,
                "spacing": 2,
                "view": "profile"
              }
            },
            "bottom": {
              "recipe": "learned-filter",
              "params": {
                "sigma": 0.9,
                "photons": 20,
                "background": 0.4,
                "p": 0.5,
                "spacing": 2,
                "view": "frame"
              }
            }
          },
          "claims": [
            {
              "key": "b5XtW0",
              "text": "the weight at pixel 0 with a neighbour is 0.624",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "xtW0"
            },
            {
              "key": "b5XtW1",
              "text": "the weight at pixel 1 with a neighbour is 1",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "xtW1"
            },
            {
              "key": "b5XtW2",
              "text": "the weight at pixel 2 with a neighbour is 0.957",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "xtW2"
            },
            {
              "key": "b5XtW3",
              "text": "the weight at pixel 3 with a neighbour is 0.414",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "xtW3"
            },
            {
              "key": "b5XtN4",
              "text": "the weight at pixel 4, the neighbour, is negative with size 0.131",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "xtN4"
            },
            {
              "key": "b5XtN5",
              "text": "the weight at pixel 5 is negative with size 0.230",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "xtN5"
            },
            {
              "key": "b5XtN6",
              "text": "the weight at pixel 6 is negative with size 0.149",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "xtN6"
            },
            {
              "key": "b5XtIso4",
              "text": "without the neighbour the weight at pixel 4 is 0.580",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "iso4"
            },
            {
              "key": "b5XtIso5",
              "text": "without the neighbour the weight at pixel 5 is 0.0689",
              "from": {
                "recipe": "learned-filter",
                "params": {
                  "sigma": 0.9,
                  "photons": 20,
                  "background": 0.4,
                  "p": 0.5,
                  "spacing": 2,
                  "view": "profile"
                }
              },
              "value": "iso5"
            }
          ],
          "trail": [
            {
              "ref": "ken25",
              "at": "the array model and its filter plots",
              "why": "The array filter uses its neighbours to cancel crosstalk; our strip shows the mechanism, not their data."
            }
          ]
        },
        {
          "id": "b5-cnn:b4",
          "phase": "books",
          "text": "A small network can bend the rule with a nonlinear step and look at neighbours at once. The price is many parameters. One site's network counts 355202 of them, and each output sees a 7 by 7 patch of pixels, its [[pp-receptive-field|receptive field]]. A fitted matched filter came within 3.5 % of the error of the array network with two orders of magnitude fewer parameters.",
          "formal": "Phuttitarn et al.'s per-site CNN stacks three valid $3\\times3$ convolutions (32, 64, 128 filters) on $10\\times10$ pixels, a dense layer of 128 and 2 outputs: our count from the listed layers is $355202$, the printed total. The [[pp-receptive-field|receptive field]] of three $3\\times3$ layers is $7$ pixels. Kent et al. report the matched filter within 3.5 % of the array network's error with two orders of magnitude fewer parameters.",
          "caption": "the pixels one output of a three-layer network can see",
          "captionFormal": "receptive field of three $3\\times3$ layers on the $10\\times10$ patch",
          "stage": {
            "recipe": "conv-stack",
            "params": {
              "layers": [
                {
                  "k": 3,
                  "cin": 1,
                  "cout": 32
                },
                {
                  "k": 3,
                  "cin": 32,
                  "cout": 64
                },
                {
                  "k": 3,
                  "cin": 64,
                  "cout": 128
                }
              ],
              "dense": [
                128,
                2
              ],
              "input": 10,
              "view": "frame"
            }
          },
          "claims": [
            {
              "key": "b5CnnSiteParams",
              "text": "our layer-by-layer count of the per-site network is 355202 parameters",
              "from": {
                "recipe": "conv-stack",
                "params": {
                  "layers": [
                    {
                      "k": 3,
                      "cin": 1,
                      "cout": 32
                    },
                    {
                      "k": 3,
                      "cin": 32,
                      "cout": 64
                    },
                    {
                      "k": 3,
                      "cin": 64,
                      "cout": 128
                    }
                  ],
                  "dense": [
                    128,
                    2
                  ],
                  "input": 10,
                  "view": "numbers"
                }
              },
              "value": "params"
            },
            {
              "key": "b5RfCnn",
              "text": "three 3 by 3 layers see 7 pixels along a side",
              "from": {
                "recipe": "conv-stack",
                "params": {
                  "layers": [
                    {
                      "k": 3,
                      "cin": 1,
                      "cout": 32
                    },
                    {
                      "k": 3,
                      "cin": 32,
                      "cout": 64
                    },
                    {
                      "k": 3,
                      "cin": 64,
                      "cout": 128
                    }
                  ],
                  "dense": [
                    128,
                    2
                  ],
                  "input": 10,
                  "view": "numbers"
                }
              },
              "value": "rf"
            }
          ],
          "reported": [
            {
              "id": "phu-cnn-site",
              "text": "trainable parameters of the per-site network",
              "value": "355,202",
              "source": "phu24",
              "at": {
                "kind": "table",
                "label": "I"
              }
            },
            {
              "id": "phu-cnn-array",
              "text": "trainable parameters of the array network",
              "value": "74,782,034",
              "source": "phu24",
              "at": {
                "kind": "table",
                "label": "II"
              }
            },
            {
              "id": "ken-cost",
              "text": "increase in error of the array filter against the network, with two orders of magnitude fewer parameters",
              "value": "3.5%",
              "source": "ken25",
              "at": {
                "kind": "section",
                "label": "Abstract"
              }
            }
          ],
          "trail": [
            {
              "ref": "phu24",
              "at": "Tables I and II",
              "why": "The layer lists let us recount the parameters and the receptive field ourselves."
            }
          ]
        },
        {
          "id": "b5-cnn:b5",
          "phase": "clue",
          "text": "How many parameters does one 3 by 3 convolution layer from 16 to 32 channels have, counting a bias per output channel? How big is the receptive field of four 3 by 3 layers? What is the ratio of the learned weights s/(b + ps) at two pixels? One has s = 4 and the other s = 1, both with b = 1 and p one half.",
          "formal": "Count $k^2c_{in}c_{out}+c_{out}$ for $k=3$, $16\\to32$; the receptive field of four $3\\times3$ layers; and $W_i\\propto s_i/(b+ps_i)$ at $s=4$ against $s=1$ with $b=1$ and $p$ one half.",
          "caption": "a stack of four layers",
          "captionFormal": "four $3\\times3$ layers",
          "stage": {
            "recipe": "conv-stack",
            "params": {
              "layers": [
                {
                  "k": 3,
                  "cin": 16,
                  "cout": 32
                },
                {
                  "k": 3,
                  "cin": 32,
                  "cout": 32
                },
                {
                  "k": 3,
                  "cin": 32,
                  "cout": 32
                },
                {
                  "k": 3,
                  "cin": 32,
                  "cout": 32
                }
              ],
              "view": "numbers"
            }
          },
          "reveal": {
            "text": "The layer has 3 × 3 × 16 × 32 + 32 = 4640 parameters. Four layers see a 9 by 9 patch. The weights are in the ratio 2.",
            "formal": "$3^2\\cdot16\\cdot32+32=4640$; $r=1+4\\cdot2=9$; $W_4/W_1=2$."
          }
        },
        {
          "id": "b5-cnn:b6",
          "phase": "deeper",
          "text": "Papers score a readout by its fidelity: one minus the average of the two kinds of misread. [[pp-fidelity-cf|Cross-fidelity]] counts errors that travel together between two sites. The improvement is often reported as a reduction against a baseline, and the baseline differs from paper to paper.",
          "formal": "Fidelity $F$ is one minus the mean of the two misreads, $P(\\text{read bright}\\mid\\text{dark})$ and $P(\\text{read dark}\\mid\\text{bright})$ (our single-site \"error\" is their half-sum). [[pp-fidelity-cf|Cross-fidelity]] $F_{CF}$ averages $P(D_k\\mid B_l)+P(B_k\\mid D_l)$ over site pairs. The reduction $\\eta=1-(1-F)/(1-F_{\\text{base}})$ takes a Gaussian mask as its baseline in Phuttitarn and Kent but the per-site network in the GANDALF paper.",
          "caption": "fidelity compares a readout with a baseline",
          "captionFormal": "$F$, $F_{CF}$ and $\\eta$ need a named baseline",
          "stage": {
            "recipe": "conv-stack",
            "params": {
              "layers": [
                {
                  "k": 3,
                  "cin": 1,
                  "cout": 32
                },
                {
                  "k": 3,
                  "cin": 32,
                  "cout": 64
                },
                {
                  "k": 3,
                  "cin": 64,
                  "cout": 128
                }
              ],
              "dense": [
                128,
                2
              ],
              "input": 10,
              "view": "frame"
            }
          }
        }
      ],
      "review": {
        "points": [
          "A filter can be fitted from labelled shots: a least-squares fit of the label on the pixels.",
          "For one atom the fitted weights are the spot over the local brightness.",
          "A close neighbour makes the fit subtract the neighbour's pixels: negative weights.",
          "A network bends the rule and sees a wider patch, for a very large number of parameters."
        ],
        "equations": "W\\propto s_i/(b+ps_i)",
        "trap": "Reading a negative weight as an error: it is the filter cancelling a neighbour's light.",
        "formal": {
          "points": [
            "$W=\\mathrm{Cov}(n)^{-1}\\mathrm{Cov}(n,a)$; for one atom $W\\propto s/(b+ps)$ by Sherman-Morrison.",
            "A neighbour adds a rank-one term to Cov(n), and the weights on the neighbour's pixels turn negative.",
            "Receptive field $r=\\sum(k_\\ell-1)\\prod\\text{strides}+1$; parameters $k^2c_{in}c_{out}+c_{out}$ per layer."
          ],
          "equations": "W=\\mathrm{Cov}(n)^{-1}\\mathrm{Cov}(n,a)",
          "trap": "Comparing reductions across papers without checking the baseline: Gaussian mask in one, per-site network in another."
        }
      },
      "play": [
        {
          "id": "b5-c-conv",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "Parameters of one layer",
          "prompt": "How many parameters does a 3 by 3 convolution from 16 to 32 channels have, counting one bias per output channel?",
          "answerFrom": {
            "from": {
              "recipe": "conv-stack",
              "params": {
                "layers": [
                  {
                    "k": 3,
                    "cin": 16,
                    "cout": 32
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
              "text": "Each output channel has a 3 by 3 filter per input channel."
            },
            {
              "text": "Weights: 3 times 3 times 16 times 32."
            },
            {
              "text": "Add 32 biases."
            }
          ],
          "walkthrough": [
            {
              "text": "The weights number 3 × 3 × 16 × 32 = 4608."
            },
            {
              "text": "There is one bias per output channel: 32."
            },
            {
              "text": "The total is 4640."
            }
          ]
        },
        {
          "id": "b5-c-rf",
          "kind": "numeric",
          "tier": "core",
          "title": "A deeper stack",
          "prompt": "What is the receptive field (pixels along a side) of four stacked 3 by 3 convolutions with stride 1?",
          "answerFrom": {
            "from": {
              "recipe": "conv-stack",
              "params": {
                "layers": [
                  {
                    "k": 3,
                    "cin": 1,
                    "cout": 1
                  },
                  {
                    "k": 3,
                    "cin": 1,
                    "cout": 1
                  },
                  {
                    "k": 3,
                    "cin": 1,
                    "cout": 1
                  },
                  {
                    "k": 3,
                    "cin": 1,
                    "cout": 1
                  }
                ],
                "view": "numbers"
              }
            },
            "value": "rf"
          },
          "tolerance": 0,
          "hints": [
            {
              "text": "One layer sees 3 pixels."
            },
            {
              "text": "Each further 3 by 3 layer adds 2 pixels."
            },
            {
              "text": "Four layers: 3 plus three times 2."
            }
          ],
          "walkthrough": [
            {
              "text": "One layer: 3."
            },
            {
              "text": "Each extra layer adds k − 1 = 2."
            },
            {
              "text": "Four layers: 3 + 2 + 2 + 2 = 9."
            }
          ]
        },
        {
          "id": "b5-c-wratio",
          "kind": "numeric",
          "tier": "core",
          "title": "Ratio of learned weights",
          "prompt": "With background 1 and prior one half, the learned weight is proportional to s/(b + ps). What is the ratio of the weight at a pixel with s = 4 to that at a pixel with s = 1?",
          "answerFrom": {
            "from": {
              "recipe": "learned-filter",
              "params": {
                "sigma": 0.9,
                "photons": 20,
                "background": 1,
                "p": 0.5,
                "spacing": 2,
                "view": "profile",
                "ratio": [
                  4,
                  1
                ]
              }
            },
            "value": "wRatio"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Compute s/(b + p s) for each pixel."
            },
            {
              "text": "For s = 4: 4 over 1 + 2 = 3."
            },
            {
              "text": "For s = 1: 1 over 1.5."
            }
          ],
          "walkthrough": [
            {
              "text": "At s = 4: 4/(1 + 0.5 × 4) = 4/3."
            },
            {
              "text": "At s = 1: 1/(1 + 0.5) = 2/3."
            },
            {
              "text": "The ratio is 2."
            }
          ]
        }
      ],
      "pitfalls": [
        "Counting a layer's parameters without the biases, or a receptive field as the sum of kernel sizes."
      ]
    },
    {
      "id": "b5-wiener",
      "title": "Cleaning a picture with a linear filter",
      "question": "Why can smoothing then thresholding not beat the right weighted sum?",
      "source": {
        "summary": "The GANDALF paper says that Gaussian, median and Wiener filters blur sites at low photon counts; it shows no experiment for it. We show here what a linear cleaner can and cannot do in our model.",
        "where": "GANDALF §4, p. 6; our derivation"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "exposure-bench"
        },
        "tryThis": [
          "Move the exposure up. The best weights and the Wiener cleaner stay together: the cleaner's output is the best weighted sum times a template.",
          "The flat box is a linear pipeline too, so it never goes below the likelihood-ratio line in the readout."
        ]
      },
      "insight": "A linear cleaner followed by a linear statistic is one linear statistic, and the best linear statistic is the matched filter. A Wiener smoother at best equals it; a blur followed by the centre pixel is worse.",
      "insightFormal": "For a linear map H, (Hn)_c is a weighted sum of the raw pixels, so no H and no downstream linear statistic beat the Bayes weights. The Wiener smoother with a rank-one prior is the matched statistic times a template.",
      "claims": [
        {
          "key": "b5WiSigma",
          "text": "the spot width input is 0.9 pixel (our model)",
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
          "value": "sigma"
        },
        {
          "key": "b5WiBackground",
          "text": "the background input is 0.4 photons per pixel (our model)",
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
          "value": "background"
        }
      ],
      "story": [
        {
          "id": "b5-wiener:b1",
          "phase": "books",
          "text": "Blur the frame so each pixel mixes with its neighbours, then read the middle pixel. That is the same as one weighted sum of the raw pixels. A blur of a quarter, a half and a quarter gives the middle pixel a weight of one half.",
          "formal": "For a linear map $H$, $(Hn)_c=\\sum_j H_{cj}n_j$: a row of weights. (<<pp-f3-matrix-of-map|a matrix is a table of weights>>). A blur with kernel $(1,2,1)/4$ followed by reading the centre pixel has weights $(1,2,1)/4$ on the raw pixels.",
          "caption": "five linear pipelines on one strip (the bars come next)",
          "captionFormal": "a pipeline of linear steps is one weight vector",
          "stage": {
            "recipe": "linear-denoise",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "view": "bars"
            }
          }
        },
        {
          "id": "b5-wiener:b2",
          "phase": "books",
          "text": "On the same strip a blur then the centre pixel is worse than the best weights. A smart linear cleaner can at best equal them. The separation d² is 33.9 for the best weights and 33.9 for a Wiener cleaner. Blur then centre gives 29.2, which is 86 % of the best. A three-pixel crop gives 32.0 and the centre pixel alone 15.4.",
          "formal": "Gaussian-approximation separation $d^2=\\Delta^{\\mathsf T}\\Sigma^{-1}\\Delta$ of each pipeline's output: raw (best weights) $33.89$; Wiener smoother $33.89$ (equal: its rank-one output is the matched statistic); blur then centre $29.19$ ($0.861$ of the best); crop to 3 pixels $31.97$; centre alone $15.40$.",
          "caption": "separation d² of five linear pipelines (our model)",
          "captionFormal": "$d^2$ of the output of each linear pipeline, strip of 7 pixels, atom at pixel 2",
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
              "key": "b5D2Raw",
              "text": "the best weights on the raw pixels reach d squared 33.89",
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
              "value": "d2Raw"
            },
            {
              "key": "b5D2Wiener",
              "text": "the Wiener smoother reaches the same d squared, 33.89",
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
              "value": "d2Wiener"
            },
            {
              "key": "b5D2BlurCentre",
              "text": "blur then the centre pixel reaches d squared 29.19",
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
              "value": "d2BlurCentre"
            },
            {
              "key": "b5D2Crop3",
              "text": "a three-pixel crop reaches d squared 31.97",
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
              "value": "d2Crop3"
            },
            {
              "key": "b5D2Centre",
              "text": "the centre pixel alone reaches d squared 15.40",
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
              "value": "d2Centre"
            },
            {
              "key": "b5BlurFrac",
              "text": "blur then centre keeps 0.861 of the best separation",
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
          "id": "b5-wiener:b3",
          "phase": "books",
          "text": "The [[pp-wiener|Wiener smoother]] shrinks each pixel towards what the prior says a clean frame looks like. Here the prior knows one pattern, the atom's spot. The result is the spot times one number: the best weighted sum again. With a single atom the shrink factor is 0.89.",
          "formal": "The [[pp-wiener|Wiener smoother]] is $\\hat x=C_s(C_s+C_n)^{-1}(x-\\mu)+\\mu$ with $C_s=p(1-p)ss^{\\mathsf T}$ and $C_n=\\mathrm{diag}(\\mu)$. It has rank one: $\\hat x-\\mu=s\\,v^{\\mathsf T}(x-\\mu)$ with $v\\propto C_n^{-1}s$, the matched filter. The shrink factor is $0.894$.",
          "caption": "one simulated frame: counts, a Wiener-type cleaner of the platform, the truth (illustrative)",
          "captionFormal": "one seeded draw; the platform smoother assumes a known spot and white noise",
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
          "introduces": [
            "pp-wiener"
          ],
          "claims": [
            {
              "key": "b5LsShrink",
              "text": "the shrink factor of the Wiener smoother for one atom is 0.894",
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
              "value": "shrink"
            }
          ],
          "fidelity": [
            "camera-frame-draw"
          ]
        },
        {
          "id": "b5-wiener:b4",
          "phase": "books",
          "text": "Two linear steps make one linear step. A threshold on the result is a threshold on a weighted sum, which the best weights already beat. So a linear cleaner followed by a threshold adds nothing beyond the best weights.",
          "formal": "By data processing, a linear map followed by a linear statistic is $(H^{\\mathsf T}u)^{\\mathsf T}x$ for some $u$; no $u$ beats the Bayes weights, with equality when $H^{\\mathsf T}u$ spans them. The GANDALF paper (<<pp-p2-denoiser|the lecture on it>>) says fixed filters (Gaussian, median, Wiener) blur sites at low counts; it shows no experiment, so this is our statement about linear pipelines, not a test of its claim.",
          "caption": "no pipeline of linear steps goes above the first bar",
          "captionFormal": "a linear cascade is one linear statistic",
          "stage": {
            "recipe": "linear-denoise",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "view": "bars"
            }
          }
        },
        {
          "id": "b5-wiener:b5",
          "phase": "clue",
          "text": "For a single atom the shrink factor is p(1 − p) q over 1 + p(1 − p) q. What is it for q = 3 and p one half? And what weight does the middle pixel get after the blur above?",
          "formal": "Compute $p(1-p)q/(1+p(1-p)q)$ for $q=3$ and $p$ one half, and the centre entry of the kernel $(1,2,1)/4$.",
          "caption": "the five pipelines again",
          "captionFormal": "the bars above, for reference",
          "stage": {
            "recipe": "linear-denoise",
            "params": {
              "sigma": 0.9,
              "photons": 20,
              "background": 0.4,
              "p": 0.5,
              "view": "bars",
              "q": 3
            }
          },
          "reveal": {
            "text": "The shrink factor is 0.43. The middle pixel keeps a weight of 0.5.",
            "formal": "with $k=p(1-p)q$, the factor $k/(1+k)=0.429$; the centre entry is $0.5$.",
            "claims": [
              {
                "key": "b5ClueShrink3",
                "text": "the shrink factor for q = 3 and p one half is 0.4286",
                "from": {
                  "recipe": "linear-denoise",
                  "params": {
                    "sigma": 0.9,
                    "photons": 20,
                    "background": 0.4,
                    "p": 0.5,
                    "view": "bars",
                    "q": 3
                  }
                },
                "value": "shrinkQ"
              },
              {
                "key": "b5BlurCentreW",
                "text": "the centre entry of the blur kernel is 0.5",
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
                "value": "kernelCentre"
              }
            ]
          }
        }
      ],
      "review": {
        "points": [
          "Blurring then reading the centre pixel is one weighted sum of the raw pixels.",
          "A Wiener smoother with one known pattern is the matched filter times a template.",
          "Two linear steps make one linear step, and a threshold on it cannot beat the best weights."
        ],
        "equations": "(Hn)_c=\\sum_j H_{cj}n_j",
        "trap": "Expecting a smoother to add information: a linear cleaner can only re-weight the pixels it was given.",
        "formal": {
          "points": [
            "A linear pipeline $u^{\\mathsf T}Hn$ is a weighted sum of the raw pixels with weights $H^{\\mathsf T}u$.",
            "The Wiener smoother $\\hat x=C_s(C_s+C_n)^{-1}(x-\\mu)+\\mu$ has rank one when $C_s$ does, and equals $s\\,v^{\\mathsf T}$ with $v\\propto C_n^{-1}s$.",
            "Hence the Wiener output is a template times the matched statistic: the same d² as the raw best weights."
          ],
          "equations": "\\hat x-\\mu=s\\,v^{\\mathsf T}(x-\\mu),\\quad v\\propto C_n^{-1}s",
          "trap": "Reading the GANDALF paper's remark about fixed filters as a theorem: it concerns fixed filters before a nonlinear task, and is not shown there."
        }
      },
      "play": [
        {
          "id": "b5-w-centre",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "The middle pixel after a blur",
          "prompt": "A blur has kernel (1, 2, 1) over 4. Reading the middle pixel after the blur is a weighted sum of the raw pixels. What is the weight on the middle raw pixel?",
          "answerFrom": {
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
            "value": "kernelCentre"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Write the blur as three weights that add to 1."
            },
            {
              "text": "The kernel is 1/4, 2/4, 1/4."
            },
            {
              "text": "The middle raw pixel gets the middle weight."
            }
          ],
          "walkthrough": [
            {
              "text": "The three weights are 1/4, 1/2 and 1/4."
            },
            {
              "text": "The middle pixel of the output takes half from the middle raw pixel."
            },
            {
              "text": "The weight is 0.5."
            }
          ]
        },
        {
          "id": "b5-w-shrink",
          "kind": "numeric",
          "tier": "core",
          "title": "The shrink factor",
          "prompt": "For a single atom the shrink factor is p(1 − p) q divided by 1 + p(1 − p) q. What is it for p = one half and q = 3?",
          "answerFrom": {
            "from": {
              "recipe": "linear-denoise",
              "params": {
                "sigma": 0.9,
                "photons": 20,
                "background": 0.4,
                "p": 0.5,
                "view": "bars",
                "q": 3
              }
            },
            "value": "shrinkQ"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "With p = one half, p(1 − p) = 1/4."
            },
            {
              "text": "The numerator is 3/4."
            },
            {
              "text": "Divide 3/4 by 1 + 3/4."
            }
          ],
          "walkthrough": [
            {
              "text": "p(1 − p) q = 0.75."
            },
            {
              "text": "The factor is 0.75 / 1.75."
            },
            {
              "text": "That is 0.4286, about 0.429."
            }
          ]
        },
        {
          "id": "b5-w-lin",
          "kind": "choice",
          "tier": "core",
          "title": "A cascade of linear steps",
          "prompt": "A linear filter followed by a linear statistic is…",
          "options": [
            {
              "text": "one linear statistic of the raw pixels",
              "correct": true,
              "why": "A linear map of a linear map is linear, so the whole pipeline is a weighted sum of the raw pixels."
            },
            {
              "text": "a better statistic, because the filter removes noise",
              "correct": false,
              "why": "A linear filter only re-weights the pixels; the best weights are already the matched filter."
            },
            {
              "text": "a nonlinear statistic",
              "correct": false,
              "why": "Linear steps compose into a linear step."
            }
          ],
          "hints": [
            {
              "text": "What does a linear map do to a weighted sum?"
            },
            {
              "text": "Compose the weights: (Hᵀu)."
            },
            {
              "text": "The result is again a row of weights on the raw pixels."
            }
          ],
          "walkthrough": [
            {
              "text": "Write the filter as a matrix H and the statistic as a row u."
            },
            {
              "text": "The pipeline is u H n, a weighted sum of n with weights Hᵀu."
            },
            {
              "text": "So it is one linear statistic."
            }
          ]
        }
      ],
      "pitfalls": [
        "Smoothing the frame \"to reduce noise\" before a threshold: the sum of the pixels already averages it, and a blur also mixes in the background."
      ]
    },
    {
      "id": "b5-pix2pix",
      "title": "Picture-to-picture learning, and its risks",
      "question": "What does a conditional GAN learn, and how can it invent an atom?",
      "source": {
        "summary": "Isola and coauthors define the conditional adversarial network for picture-to-picture translation. The GANDALF paper trains one to denoise short-exposure atom images and lists the risks of doing so.",
        "where": "Isola §3-4; GANDALF §4 pp. 6-9"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "prior-bench"
        },
        "tryThis": [
          "Set the frame's evidence to -1 and slide the prior to the right: the chance of an atom crosses a half at the flip prior.",
          "Move the evidence to -3: the flip prior moves close to 1, so only a very atom-rich training set would make the cleaner invent an atom."
        ]
      },
      "insight": "A conditional GAN learns to turn a noisy picture into a clean one. It has a drawing network and a judging network, and an L1 term keeps the result near the target. A cleaner trained mostly on atoms can turn a faint frame into an atom, as Bayes' rule shows in a toy case.",
      "insightFormal": "The conditional GAN minimises L_GAN + λ L1 over G against D. Bayes' rule gives posterior odds = likelihood ratio × prior odds, so a cleaner whose implicit prior favours atoms flips a faint frame; the paper names such failures and reports no rate.",
      "story": [
        {
          "id": "b5-pix2pix:b1",
          "phase": "books",
          "text": "Show a network pairs of a noisy picture and a clean one, and train it to turn the first into the second. A second network judges whether a clean-looking picture is real. This pair is a [[pp-cgan|conditional GAN]].",
          "formal": "In a [[pp-cgan|conditional GAN]] a generator $G:x\\mapsto y$ is trained against a discriminator $D(x,y)$ on the objective $L=L_{GAN}+\\lambda L_1$. Isola et al. use $\\lambda=100$; the GANDALF paper uses $\\lambda_{L1}=200$.",
          "caption": "a noisy frame, a cleaner's output, and the target (illustrative; a linear stand-in)",
          "captionFormal": "noisy $x$, a platform smoother in place of $G(x)$, the target $y$",
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
          "reported": [
            {
              "id": "iso-lambda",
              "text": "weight of the L1 term in the objective",
              "value": "100",
              "source": "iso17",
              "at": {
                "kind": "section",
                "label": "4.1"
              }
            },
            {
              "id": "gdf-lambda",
              "text": "weight of the L1 term in the paper's generator loss",
              "value": "200",
              "source": "paper-gdf",
              "at": {
                "kind": "text",
                "page": 8
              }
            }
          ],
          "trail": [
            {
              "ref": "iso17",
              "at": "Sections 3 and 4.1",
              "why": "The objective is the adversarial term plus an L1 term; the weight of the second is a choice made by experiment."
            }
          ],
          "fidelity": [
            "camera-frame-draw"
          ]
        },
        {
          "id": "b5-pix2pix:b2",
          "phase": "books",
          "text": "The L1 term keeps the picture close to the target on average; the adversarial term makes it sharp. With the paper's mean L1 of 0.0362, 200 times that is 7.24, against a GAN term near 0.69 when the judge is undecided. The L1 term sets the scale. A fake scored 0.2 by the judge costs 1.61.",
          "formal": "With the reported mean L1 $0.0362$, $\\lambda L_1=7.24$ against $-\\ln D=\\ln2=0.693$ at $D$ one half: the L1 term sets the scale. A fake scored $D=0.2$ gives $-\\ln D=1.609$.",
          "caption": "the two terms of the generator loss",
          "captionFormal": "$\\lambda L_1$ (from a reported $L_1$) beside $-\\ln D$",
          "stage": {
            "recipe": "cgan-terms",
            "params": {
              "D": 0.2,
              "lambda": 200,
              "l1": 0.0362,
              "l1Reported": true
            },
            "uses": [
              "gdf-l1"
            ]
          },
          "claims": [
            {
              "key": "b5L1Scaled",
              "text": "lambda times the reported L1 is 7.24",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.2,
                  "lambda": 200,
                  "l1": 0.0362,
                  "l1Reported": true
                },
                "uses": [
                  "gdf-l1"
                ]
              },
              "value": "l1Scaled"
            },
            {
              "key": "b5GanEq",
              "text": "the adversarial term at D one half is the natural log of 2, 0.693",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.5,
                  "lambda": 200,
                  "l1": 0.0362
                }
              },
              "value": "ganTerm"
            },
            {
              "key": "b5GanFake02",
              "text": "a fake scored 0.2 costs 1.609",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.2,
                  "lambda": 200,
                  "l1": 0.0362
                }
              },
              "value": "ganTerm"
            },
            {
              "key": "b5GanInD",
              "text": "the judge's score for the fake is 0.2 (an input)",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.2,
                  "lambda": 200,
                  "l1": 0.0362
                }
              },
              "value": "D"
            }
          ],
          "reported": [
            {
              "id": "gdf-l1",
              "text": "mean L1 loss of the denoiser on a 4 by 4 array",
              "value": "0.0362",
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
          "id": "b5-pix2pix:b3",
          "phase": "books",
          "text": "Skip links carry fine detail past the narrow middle of the generator, a shape called a [[pp-unet-patchgan|U-Net]]. The judge looks at small patches, which is a PatchGAN. Five 4 by 4 layers see a 70 by 70 patch. The paper's generator, counted with two convolutions in each block, has 4,695,744 weights against its printed 4.7 million; with one convolution only 2,926,272.",
          "formal": "A [[pp-unet-patchgan|U-Net generator and PatchGAN discriminator]]: five $4\\times4$ layers (strides 2, 2, 2, 1, 1) see $70$ pixels along a side, as in Isola et al. For the GANDALF Table 2 generator our weight count is $4{,}695{,}744$ with two $3\\times3$ convolutions per residual block and $2{,}926{,}272$ with one, against the printed 4.7 million; its four stride-2 $3\\times3$ discriminator layers see $31$ pixels. The table does not say whether the discriminator output is patchwise.",
          "caption": "weights per layer of the paper's generator (our count)",
          "captionFormal": "parameters per layer, bias-free convolutions; residual convolutions counted six times",
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
            }
          },
          "claims": [
            {
              "key": "b5Rf70",
              "text": "five 4 by 4 layers with strides 2, 2, 2, 1, 1 see 70 pixels",
              "from": {
                "recipe": "conv-stack",
                "params": {
                  "layers": [
                    {
                      "k": 4,
                      "cin": 1,
                      "cout": 1,
                      "stride": 2
                    },
                    {
                      "k": 4,
                      "cin": 1,
                      "cout": 1,
                      "stride": 2
                    },
                    {
                      "k": 4,
                      "cin": 1,
                      "cout": 1,
                      "stride": 2
                    },
                    {
                      "k": 4,
                      "cin": 1,
                      "cout": 1,
                      "stride": 1
                    },
                    {
                      "k": 4,
                      "cin": 1,
                      "cout": 1,
                      "stride": 1
                    }
                  ],
                  "view": "numbers"
                }
              },
              "value": "rf"
            },
            {
              "key": "b5RfGdfD",
              "text": "four stride-2 3 by 3 layers see 31 pixels",
              "from": {
                "recipe": "conv-stack",
                "params": {
                  "layers": [
                    {
                      "k": 3,
                      "cin": 1,
                      "cout": 1,
                      "stride": 2,
                      "repeat": 4
                    }
                  ],
                  "view": "numbers"
                }
              },
              "value": "rf"
            },
            {
              "key": "b5GenParams2",
              "text": "with two convolutions per block the generator has 4695744 weights",
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
              "key": "b5GenParams1",
              "text": "with one convolution per block it has 2926272 weights",
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
                }
              },
              "value": "params"
            }
          ],
          "reported": [
            {
              "id": "iso-patch",
              "text": "patch size of the discriminator in the main experiments",
              "value": "70×70",
              "source": "iso17",
              "at": {
                "kind": "table",
                "label": "3"
              }
            },
            {
              "id": "gdf-gen",
              "text": "parameters of the paper's generator",
              "value": "4.7 million",
              "source": "paper-gdf",
              "at": {
                "kind": "text",
                "page": 10
              }
            }
          ]
        },
        {
          "id": "b5-pix2pix:b4",
          "phase": "books",
          "text": "Tell the judge that \"real\" is 0.9, not 1, so it does not grow overconfident. Then even a perfect judge pays at least 0.325, never zero. The paper also updates the judge less often than the generator, adds dropout, and stops early when the validation L1 stops improving.",
          "formal": "With soft target $0.9$ the cross-entropy bottoms out at the entropy $H(0.9)=0.325$, not $0$. The paper also trains the discriminator less often than the generator, uses dropout and a cosine learning-rate schedule, and stops early on the validation L1.",
          "caption": "the floor of a smoothed cross-entropy",
          "captionFormal": "$H(0.9)$ as the least cost",
          "stage": {
            "recipe": "cgan-terms",
            "params": {
              "D": 0.5,
              "lambda": 200,
              "l1": 0.0362,
              "target": 0.9
            }
          },
          "claims": [
            {
              "key": "b5SmoothFloor",
              "text": "the least cross-entropy with target 0.9 is 0.325",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.5,
                  "lambda": 200,
                  "l1": 0.0362,
                  "target": 0.9
                }
              },
              "value": "smoothFloor"
            }
          ],
          "reported": [
            {
              "id": "gdf-smooth",
              "text": "label smoothing of the discriminator: real and fake targets",
              "value": "0.9 and 0.1",
              "source": "paper-gdf",
              "at": {
                "kind": "text",
                "page": 8
              }
            }
          ]
        },
        {
          "id": "b5-pix2pix:b5",
          "phase": "books",
          "text": "If the network saw atoms in most training shots, a faint frame can look like an atom to it. Take a frame that favours \"dark\" a little. At even odds the chance of an atom is 0.27; with a prior of 0.9 it is 0.77. The flip comes at a prior of 0.73. This is a [[pp-hallucination|hallucination]], shown here as a toy argument, not as a measurement of the paper's denoiser.",
          "formal": "Bayes' rule: posterior odds equal the likelihood ratio times the prior odds. A frame with $\\mathrm{LLR}=-1$ gives posterior $0.269$ at an even prior and $0.768$ at prior $0.9$, flipping at prior $0.731$; the log-odds shift from a prior of one half to one tenth is $\\ln9=2.197$. A [[pp-hallucination|hallucination]] is output driven by the training prior. The paper names hallucinated or erased sites as risks and prints no rate.",
          "caption": "the chance of an atom after one faint frame, against the prior (toy)",
          "captionFormal": "posterior against prior for $\\mathrm{LLR}=-1$ (our toy argument)",
          "stage": {
            "recipe": "prior-posterior",
            "params": {
              "llr": -1,
              "prior": 0.9
            }
          },
          "claims": [
            {
              "key": "b5PostEqual",
              "text": "at an even prior the chance of an atom after the frame is 0.269",
              "from": {
                "recipe": "prior-posterior",
                "params": {
                  "llr": -1,
                  "prior": 0.5
                }
              },
              "value": "posterior"
            },
            {
              "key": "b5PostPrior90",
              "text": "at prior 0.9 the chance of an atom after the frame is 0.768",
              "from": {
                "recipe": "prior-posterior",
                "params": {
                  "llr": -1,
                  "prior": 0.9
                }
              },
              "value": "posterior"
            },
            {
              "key": "b5FlipPrior",
              "text": "the frame is a coin flip at prior 0.731",
              "from": {
                "recipe": "prior-posterior",
                "params": {
                  "llr": -1,
                  "prior": 0.9
                }
              },
              "value": "flip"
            },
            {
              "key": "b5ShiftLogit",
              "text": "moving the prior from one half to one tenth shifts the log-odds by the log of 9",
              "from": {
                "recipe": "prior-posterior",
                "params": {
                  "llr": -1,
                  "prior": 0.5,
                  "prior2": 0.1
                }
              },
              "value": "shift"
            },
            {
              "key": "b5HalPrior90",
              "text": "the high prior input is 0.9",
              "from": {
                "recipe": "prior-posterior",
                "params": {
                  "llr": -1,
                  "prior": 0.9
                }
              },
              "value": "prior"
            }
          ],
          "trail": [
            {
              "ref": "gdf25",
              "at": "Section 4.3, page 8",
              "why": "The paper lists hallucinated or erased sites, mode collapse and memorised noise as risks of the denoiser and reports no rate."
            }
          ]
        },
        {
          "id": "b5-pix2pix:b6",
          "phase": "clue",
          "text": "What does the GAN term −ln D cost when the judge scores a fake D = 0.25? What is 200 times a mean L1 of 0.02? What is the chance of an atom after a frame with log-likelihood ratio −2 at a prior of 0.8?",
          "formal": "Compute $-\\ln D$ for $D=0.25$; $\\lambda L_1$ for $\\lambda=200$, $L_1=0.02$; and the posterior for $\\mathrm{LLR}=-2$ at prior $0.8$.",
          "caption": "the terms at D = 0.25, L1 = 0.02",
          "captionFormal": "$-\\ln D$ and $\\lambda L_1$ for the clue's inputs",
          "stage": {
            "recipe": "cgan-terms",
            "params": {
              "D": 0.25,
              "lambda": 200,
              "l1": 0.02
            }
          },
          "claims": [
            {
              "key": "b5ClueInD",
              "text": "the judge's score input is 0.25",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.25,
                  "lambda": 200,
                  "l1": 0.02
                }
              },
              "value": "D"
            },
            {
              "key": "b5ClueInL1",
              "text": "the mean L1 input is 0.02",
              "from": {
                "recipe": "cgan-terms",
                "params": {
                  "D": 0.25,
                  "lambda": 200,
                  "l1": 0.02
                }
              },
              "value": "l1"
            },
            {
              "key": "b5ClueInPrior",
              "text": "the prior input is 0.8",
              "from": {
                "recipe": "prior-posterior",
                "params": {
                  "llr": -2,
                  "prior": 0.8
                }
              },
              "value": "prior"
            }
          ],
          "reveal": {
            "text": "The GAN term costs 1.39. The L1 term is 4. The chance of an atom is 0.35.",
            "formal": "$-\\ln0.25=1.386$; $200\\cdot0.02=4$; posterior $=\\sigma(-2+\\ln4)=0.351$.",
            "claims": [
              {
                "key": "b5ClueGan",
                "text": "the adversarial term at D = 0.25 is 1.386",
                "from": {
                  "recipe": "cgan-terms",
                  "params": {
                    "D": 0.25,
                    "lambda": 200,
                    "l1": 0.02
                  }
                },
                "value": "ganTerm"
              },
              {
                "key": "b5ClueL1",
                "text": "the weighted L1 term is 4",
                "from": {
                  "recipe": "cgan-terms",
                  "params": {
                    "D": 0.25,
                    "lambda": 200,
                    "l1": 0.02
                  }
                },
                "value": "l1Scaled"
              },
              {
                "key": "b5CluePost",
                "text": "the posterior chance of an atom is 0.351",
                "from": {
                  "recipe": "prior-posterior",
                  "params": {
                    "llr": -2,
                    "prior": 0.8
                  }
                },
                "value": "posterior"
              }
            ]
          }
        },
        {
          "id": "b5-pix2pix:b7",
          "phase": "deeper",
          "text": "See it in the paper: the lecture P2 shows the GANDALF denoiser and its pipeline. The cycle in which a classifier's error enters the logical error is in B6, where the readout time sets the error.",
          "formal": "In the lecture P2 the denoiser appears with its training and its tables; in B6 a classifier's error enters the error-correction cycle (<<pp-b1-cycle|one round of checks>>) as the measurement error $p_m$ and the readout time has an optimum.",
          "caption": "where this chapter is used",
          "captionFormal": "the denoiser in P2; the readout error in the cycle of B6",
          "stage": {
            "recipe": "prior-posterior",
            "params": {
              "llr": -1,
              "prior": 0.5
            }
          }
        }
      ],
      "review": {
        "points": [
          "A conditional GAN turns a noisy picture into a clean one: a drawing network and a judging network.",
          "The L1 term keeps the output near the target; the adversarial term sharpens it.",
          "A prior learned from the training set can flip a faint frame: posterior odds are likelihood ratio times prior odds."
        ],
        "equations": "L=L_{GAN}+\\lambda L_1",
        "trap": "Calling a denoised site \"measured\": the cleaner's output carries its training prior as well as the data.",
        "formal": {
          "points": [
            "$L=L_{GAN}(G,D)+\\lambda\\,\\mathbb E\\lVert G(x)-y\\rVert_1$ (Isola Eqs. 1-4; GANDALF Eq. 3).",
            "A PatchGAN scores N by N patches; the receptive field of a layer stack is built layer by layer.",
            "Posterior odds = likelihood ratio × prior odds: a toy argument for hallucination, not a measured rate."
          ],
          "equations": "\\frac{P(\\text{atom}\\mid x)}{P(\\text{dark}\\mid x)}=\\mathrm{LR}\\times\\frac{p}{1-p}",
          "trap": "Reading the toy flip prior as a property of the GANDALF denoiser: the paper reports no hallucination rate."
        }
      },
      "play": [
        {
          "id": "b5-p-gan",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "The adversarial term",
          "prompt": "What is −ln D for a fake scored D = 0.25?",
          "answerFrom": {
            "from": {
              "recipe": "cgan-terms",
              "params": {
                "D": 0.25,
                "lambda": 200,
                "l1": 0.02
              }
            },
            "value": "ganTerm"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "The term is the negative natural logarithm of D."
            },
            {
              "text": "D = 0.25 is one quarter."
            },
            {
              "text": "ln 4 is the answer."
            }
          ],
          "walkthrough": [
            {
              "text": "−ln 0.25 = ln 4."
            },
            {
              "text": "ln 4 = 2 ln 2."
            },
            {
              "text": "That is 1.386."
            }
          ]
        },
        {
          "id": "b5-p-l1",
          "kind": "numeric",
          "tier": "core",
          "title": "The weighted L1 term",
          "prompt": "The weight is λ = 200 and the mean L1 is 0.02. What is λ times the L1 value?",
          "answerFrom": {
            "from": {
              "recipe": "cgan-terms",
              "params": {
                "D": 0.25,
                "lambda": 200,
                "l1": 0.02
              }
            },
            "value": "l1Scaled"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Multiply the weight by the mean L1."
            },
            {
              "text": "200 times 0.02."
            },
            {
              "text": "0.02 is 2 hundredths."
            }
          ],
          "walkthrough": [
            {
              "text": "200 × 0.02 = 4."
            },
            {
              "text": "The weight scales a small number up."
            },
            {
              "text": "So the L1 term sets the scale of the loss."
            }
          ]
        },
        {
          "id": "b5-p-post",
          "kind": "numeric",
          "tier": "stretch",
          "title": "A prior flips a frame",
          "prompt": "A frame has log-likelihood ratio −2 (it favours \"dark\"). At a prior chance of 0.8 for an atom, what is the chance of an atom after the frame?",
          "answerFrom": {
            "from": {
              "recipe": "prior-posterior",
              "params": {
                "llr": -2,
                "prior": 0.8
              }
            },
            "value": "posterior"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Posterior odds are the likelihood ratio times the prior odds."
            },
            {
              "text": "The likelihood ratio is e to the minus 2; the prior odds are 4."
            },
            {
              "text": "Convert odds to a chance: odds over 1 + odds."
            }
          ],
          "walkthrough": [
            {
              "text": "Odds = e^{-2} × 4 = 0.5413."
            },
            {
              "text": "Chance = 0.5413 / 1.5413."
            },
            {
              "text": "That is 0.351."
            }
          ]
        }
      ],
      "pitfalls": [
        "Taking the cleaner's output as more data: it is the data plus the training prior."
      ]
    }
  ]
}
