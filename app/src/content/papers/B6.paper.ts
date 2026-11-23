/**
 * Background chapter B6 of the Papers section: readout in the error-correction cycle (rulings gandalf-batch.md G1-G3; plan P-B6-story). It teaches what one round of checks is made of and the share
 * the camera takes, the Pauli twirl of a waiting qubit, the U-shaped optimum of the reading time and why the logical error goes as the power (d+1)/2, a schedule that hides the classification,
 * atom loss as a third outcome and reset against no reset, in two tracks, for the paper lecture P2 and every later chapter that needs them. Sources were read online or from saved copies and are
 * paraphrased and cited by section: Tomita and Svore, Baranes et al., Gehér et al., and the GANDALF paper. Every number is either computed by a registered recipe (numpy twin:
 * pipeline/claims_papers/b6.py), reported from a source with its location, or a labelled input of our model (T1, T2, the photon rates and the gate error are ours, "model, not data").
 *
 * DATA ONLY: papers/specData.test.ts proves this file holds nothing but literals; papers/validate.ts checks it; papers/compile.ts turns it into a Lecture.
 */
import type { PaperSpec } from '../../papers/spec'

export const B6: PaperSpec = {
  "specVersion": 1,
  "id": "B6",
  "kind": "background",
  "title": "Readout in the error-correction cycle: time, idle noise and loss",
  "outcomes": [
    "List what a round contains and compute the readout share.",
    "Derive the three Pauli idle chances from T1 and T2 and check them against the damped Bloch vector.",
    "Write the effective error of a round as a sum and find its minimum over the reading time.",
    "Say why the best reading time does not depend on the code distance, while the cost of missing it does.",
    "Derive the exponent (d+1)/2 from the cheapest failing fault sets.",
    "Compute the plain and overlapped run times and the point where overlap stops helping.",
    "Count the expected atom losses per round and say what a known-place loss changes.",
    "State what the reset and loss studies do and do not show for atoms."
  ],
  "references": [
    {
      "id": "tom14",
      "label": "Tomita and Svore 2014",
      "arxiv": {
        "id": "1404.3747"
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "Section II, Eqs. 7 to 10, and the abstract",
      "why": "Gives the Pauli twirl of amplitude and phase damping, the three chances p_X, p_Y and p_Z that the paper uses for idling during measurement.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-twirl"
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
      "reliedOn": "Tables 1 and 6, Eqs. 2, 4 and 5, Sections 5.3 and 7.2",
      "why": "Argues that faster readout and a pipelined schedule shorten the error-correction cycle for neutral atoms; its own argument is the lecture P2.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-pipelining"
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
      "reliedOn": "The abstract",
      "why": "Detects atom loss and uses the delayed loss information in a decoder, which the paper cites as a reason that a reload can wait one round.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-loss-reset"
      }
    },
    {
      "id": "geh25",
      "label": "Gehér et al. 2024",
      "arxiv": {
        "id": "2408.00758"
      },
      "depth": 1,
      "status": "read",
      "reliedOn": "The abstract and the introduction",
      "why": "Compares resetting with not resetting the helper atoms in error correction, in a superconducting-like noise model.",
      "taughtIn": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-loss-reset"
      }
    }
  ],
  "prerequisites": [
    {
      "id": "qec-cycle-timing",
      "label": "The parts of an error-correction round and the readout share",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-cycle"
      },
      "needs": [
        "surface-code-logical",
        "neutral-atom-platform"
      ],
      "ref": "gdf25"
    },
    {
      "id": "pauli-twirl-idle",
      "label": "The Pauli twirl of a waiting qubit",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-twirl"
      },
      "needs": [
        "qec-cycle-timing",
        "kraus",
        "qec-basics"
      ],
      "ref": "tom14"
    },
    {
      "id": "readout-time-tradeoff",
      "label": "Reading error against waiting error",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-ucurve"
      },
      "needs": [
        "pauli-twirl-idle",
        "poisson-histogram"
      ],
      "ref": "gdf25"
    },
    {
      "id": "ucurve",
      "label": "The U-shaped optimum in the readout time",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-ucurve"
      },
      "needs": [
        "readout-time-tradeoff"
      ]
    },
    {
      "id": "fault-counting-exponent",
      "label": "Why the exponent is (d+1)/2",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-ucurve"
      },
      "needs": [
        "readout-time-tradeoff",
        "surface-code-logical"
      ]
    },
    {
      "id": "pipelined-schedule",
      "label": "A schedule that hides the classification",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-pipelining"
      },
      "needs": [
        "qec-cycle-timing"
      ],
      "ref": "gdf25"
    },
    {
      "id": "loss-third-outcome",
      "label": "Atom loss as a third reading outcome",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-loss-reset"
      },
      "needs": [
        "poisson-histogram",
        "neutral-atom-platform"
      ],
      "ref": "bar25"
    },
    {
      "id": "reset-vs-no-reset",
      "label": "Reset against no reset",
      "teach": {
        "course": "papers",
        "chapter": "B6",
        "unit": "b6-loss-reset"
      },
      "needs": [
        "loss-third-outcome",
        "qec-cycle-timing"
      ],
      "ref": "geh25"
    },
    {
      "id": "surface-code-logical",
      "label": "The rotated surface code and its logical error rate",
      "teach": {
        "course": "papers",
        "chapter": "B1",
        "unit": "b1-threshold"
      },
      "needs": []
    },
    {
      "id": "neutral-atom-platform",
      "label": "Neutral atoms as qubits: gates and moves",
      "teach": {
        "course": "qc709",
        "chapter": "Q25",
        "unit": "q25-atom-gates"
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
      "id": "kraus",
      "label": "Noise as a map on states",
      "teach": {
        "course": "qc709",
        "chapter": "Q13",
        "unit": "q13-depolarizing"
      },
      "needs": []
    },
    {
      "id": "qec-basics",
      "label": "Errors as combinations of X, Y and Z",
      "teach": {
        "course": "qc709",
        "chapter": "Q21",
        "unit": "q21-digitize"
      },
      "needs": []
    }
  ],
  "symbols": {
    "f": "b6-cycle",
    "t_r": "b6-cycle",
    "t_": "b6-cycle",
    "p_X": "b6-twirl:b3",
    "p_Y": "b6-twirl:b3",
    "e": "b6-twirl:b3",
    "t": "b6-twirl:b3",
    "T_1": "b6-twirl:b3",
    "p_Z": "b6-twirl:b3",
    "T_2": "b6-twirl:b3",
    "a": "b6-twirl:b3",
    "b": "b6-twirl:b3",
    "c": "b6-twirl:b3",
    "p_L": "b6-ucurve:b3",
    "d": "b6-ucurve:b3",
    "p": "b6-ucurve:b3",
    "k": "b6-ucurve:b3",
    "p_": "b6-ucurve",
    "p_g": "b6-ucurve",
    "p_m": "b6-ucurve",
    "A": "b6-ucurve",
    "\\Bigl": "b6-ucurve",
    "\\Bigr": "b6-ucurve",
    "T_": "b6-pipelining:b2",
    "g": "b6-pipelining:b2",
    "r": "b6-pipelining:b2",
    "\\bigl": "b6-pipelining:b2",
    "\\bigr": "b6-pipelining:b2",
    "n": "b6-loss-reset",
    "S": "b6-loss-reset",
    "P": "b6-loss-reset",
    "P_erasurevote": "b6-loss-reset"
  },
  "symbolsFormal": {
    "\\mu": "b6-cycle:b4",
    "T_": "b6-cycle",
    "\\rho": "b6-cycle",
    "e": "b6-twirl:b1",
    "t": "b6-twirl:b1",
    "T_1": "b6-twirl:b1",
    "T_2": "b6-twirl:b1",
    "p_X": "b6-twirl:b2",
    "p_Y": "b6-twirl:b2",
    "p_Z": "b6-twirl:b2",
    "I": "b6-twirl:b2",
    "X": "b6-twirl:b2",
    "Y": "b6-twirl:b2",
    "Z": "b6-twirl:b2",
    "\\lambda_x": "b6-twirl:b3",
    "\\lambda_y": "b6-twirl:b3",
    "\\lambda_z": "b6-twirl:b3",
    "\\ll": "b6-twirl:b4",
    "P_": "b6-ucurve:b3",
    "P": "b6-ucurve:b5",
    "n": "b6-ucurve:b6",
    "e_k": "b6-ucurve:b6",
    "p_1": "b6-ucurve:b6",
    "p_n": "b6-ucurve:b6",
    "\\bar p": "b6-ucurve:b6",
    "e_6": "b6-ucurve:b6",
    "g": "b6-pipelining:b1",
    "r": "b6-pipelining:b1",
    "T": "b6-pipelining:b2",
    "t_g": "b6-pipelining:b4",
    "t_c": "b6-pipelining:b4",
    "\\langle\\cdot\\rangle": "b6-loss-reset"
  },
  "units": [
    {
      "id": "b6-cycle",
      "title": "What one round is made of",
      "question": "How long does a round take, and what share of it is the camera?",
      "source": {
        "summary": "The paper compares gate and readout times of a neutral-atom machine with a superconducting one. It also lists typical durations of the parts of a round. Its Eq. 2 writes the cycle time as syndrome generation plus readout plus reset.",
        "where": "GANDALF §1, Table 1; §2.3, Eq. 2; §5.3, Table 6"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "round-bench"
        },
        "tryThis": [
          "Set the gate time to 2 microseconds and the exposure to 3 milliseconds, the typical row of Table 6, and watch the readout share.",
          "Lengthen the atom move. The share of the camera falls, but it stays above one half until the move is longer than the exposure."
        ]
      },
      "insight": "A round is gates, a move, a camera exposure and a reset. For atoms the exposure is thousands of times longer than a gate, so the camera sets the pace of a round.",
      "insightFormal": "One round is the sum of its parts. With a gate of 400 ns and an exposure of 1 ms the readout fraction is above 0.99 on our arithmetic; the printed shares of about 0.75 and 0.5 must include more of the cycle.",
      "claims": [
        {
          "key": "b6InLayers",
          "text": "the number of gate layers is 4",
          "from": {
            "recipe": "cycle-budget",
            "params": {
              "layers": 4,
              "tGateUs": 0.4,
              "tRead": 1
            }
          },
          "value": "layers"
        },
        {
          "key": "b6InMove",
          "text": "the move input is 0.2 ms (ours)",
          "from": {
            "recipe": "cycle-budget",
            "params": {
              "layers": 4,
              "tGateUs": 0.4,
              "tRead": 1,
              "tMove": 0.2
            }
          },
          "value": "tMove"
        }
      ],
      "story": [
        {
          "id": "b6-cycle:b1",
          "phase": "books",
          "text": "One round of checking has several steps. The gates run first, then the atoms move, then the camera takes its exposure, and last comes a reset or a reload. [[pp-qec-round|A round]] is these steps in order.",
          "formal": "One surface-code round has four layers of two-[[qubit|qubit]] gates with single-qubit gates (<<pp-b1-cycle|B1>>), atom moves, image acquisition, classification, and reset or reload. The paper's Eq. 2 splits the cycle time into syndrome generation, readout and reset; the atom moves are our own extra slot. A [[pp-qec-round|round]] is these steps in order.",
          "caption": "one round as boxes on a time axis (our times)",
          "captionFormal": "gates, move, exposure and reset on one axis (illustrative inputs, not data)",
          "stage": {
            "recipe": "cycle-budget",
            "params": {
              "layers": 4,
              "tGateUs": 0.4,
              "tRead": 1,
              "tMove": 0.2,
              "tReset": 0.1
            }
          },
          "reported": [
            {
              "id": "cyc-eq2",
              "text": "Eq. 2: the QEC cycle time is the sum of",
              "value": "Syndrome Generation + Readout + Reset",
              "source": "paper-gdf",
              "at": {
                "kind": "equation",
                "label": "2",
                "page": 4
              }
            }
          ],
          "trail": [
            {
              "ref": "gdf25",
              "at": "Section 2.3, page 4",
              "why": "The cycle time is the time to generate syndromes, read the atoms and reset them; for atoms the readout dominates."
            }
          ]
        },
        {
          "id": "b6-cycle:b2",
          "phase": "books",
          "text": "The paper's Table 1 lists a 400 ns atom gate and a 1 ms camera exposure. Divide the two: the camera is 2500 times slower than a gate. For Google's superconducting chip the same ratio is only 14.71.",
          "formal": "Table 1 as printed: neutral atom, two-qubit latency 400 ns, readout latency 1 ms; superconducting (Google), 34 ns and 500 ns. The ratios of readout to gate are $2500$ and $14.71$ (our arithmetic on the printed times).",
          "caption": "an atom round, four gate layers and a 1 ms exposure (our layers); the gates are too short to see",
          "captionFormal": "Table 1 times drawn to scale for the atom column; four layers (our choice)",
          "stage": {
            "recipe": "cycle-budget",
            "params": {
              "layers": 4,
              "tGateUs": 0.4,
              "tRead": 1
            }
          },
          "claims": [
            {
              "key": "b6RatioAtom",
              "text": "the camera exposure is 2500 times a gate",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 0.4,
                  "tRead": 1
                }
              },
              "value": "ratio"
            },
            {
              "key": "b6RatioSC",
              "text": "for the superconducting column the ratio is 14.71",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 0.034,
                  "tRead": 0.0005
                }
              },
              "value": "ratio"
            }
          ],
          "reported": [
            {
              "id": "t1-atom-lat",
              "text": "neutral atom: gate latency and readout latency",
              "value": "400 ns and 1 ms",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            },
            {
              "id": "t1-sc-lat",
              "text": "superconducting (Google): gate latency and readout latency",
              "value": "34 ns and 500 ns",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            }
          ]
        },
        {
          "id": "b6-cycle:b3",
          "phase": "books",
          "text": "Divide the camera time by the whole round time to get the [[pp-readout-fraction|readout fraction]]. Four gate layers of 400 ns and a 1 ms exposure give 0.9984. Adding a 0.2 ms move gives 0.8322. The same sum for the superconducting column gives 0.786. The paper prints about 0.75 and about 0.5. Our sums use only the times in the table, so they differ, and we draw no conclusion from that.",
          "formal": "The [[pp-readout-fraction|readout fraction]] is $f=t_r/(t_{\\mathrm{gates}}+t_{\\mathrm{move}}+t_r+t_{\\mathrm{reset}})$. Four layers of 400 ns last $0.0016$ ms, so $f=0.9984$; with a $0.2$ ms move, $f=0.8322$; for the superconducting column, $f=0.786$. Table 1 prints about $0.75$ and about $0.5$. They do not follow from the listed gate and readout times alone; the paper's cycle may include other items.",
          "caption": "the camera share of the round against the exposure time (our times)",
          "captionFormal": "$f$ against $t_r$ with four 400 ns layers and a 0.2 ms move (illustrative inputs)",
          "stage": {
            "recipe": "cycle-budget",
            "params": {
              "layers": 4,
              "tGateUs": 0.4,
              "tRead": 1,
              "tMove": 0.2,
              "view": "share"
            }
          },
          "introduces": [
            "pp-readout-fraction"
          ],
          "claims": [
            {
              "key": "b6GateTimeMs",
              "text": "four layers of 400 ns last 0.0016 ms",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 0.4,
                  "tRead": 1
                }
              },
              "value": "gateMs"
            },
            {
              "key": "b6ReadFrac",
              "text": "the camera is 0.9984 of an atom round with no move",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 0.4,
                  "tRead": 1
                }
              },
              "value": "readFrac"
            },
            {
              "key": "b6ReadFracMove",
              "text": "with a 0.2 ms move the share is 0.8322",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 0.4,
                  "tRead": 1,
                  "tMove": 0.2
                }
              },
              "value": "readFrac"
            },
            {
              "key": "b6ReadFracSC",
              "text": "for the superconducting column the share is 0.786",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 0.034,
                  "tRead": 0.0005
                }
              },
              "value": "readFrac"
            }
          ],
          "reported": [
            {
              "id": "t1-atom-share",
              "text": "neutral atom: the readout fraction in a QEC cycle",
              "value": "∼0.75",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            },
            {
              "id": "t1-sc-share",
              "text": "superconducting (Google): the readout fraction in a QEC cycle",
              "value": "∼0.5",
              "source": "paper-gdf",
              "at": {
                "kind": "table",
                "label": "1",
                "page": 1
              }
            }
          ]
        },
        {
          "id": "b6-cycle:b4",
          "phase": "books",
          "text": "Table 6 lists typical present-day numbers. A gate takes a few microseconds, an exposure a few milliseconds, and classification a few hundred microseconds. Preparing the array takes about 100 ms, once. Take midpoints of 2 µs gates, a 0.3 ms move and a 3 ms exposure (our choice, not printed). The camera is then 0.907 of the round.",
          "formal": "Table 6 (typical values): preparation about 100 ms once, a two-qubit gate a few $\\mu$s, acquisition a few ms, classification a few hundred $\\mu$s. Table 1 is the best case, Table 6 the typical one. With our midpoints of 2 $\\mu$s, $0.3$ ms and 3 ms (four gate layers) the readout fraction is $0.907$.",
          "caption": "a typical round (our midpoints of the printed ranges)",
          "captionFormal": "four 2 µs layers, a 0.3 ms move, a 3 ms exposure (midpoints, ours)",
          "stage": {
            "recipe": "cycle-budget",
            "params": {
              "layers": 4,
              "tGateUs": 2,
              "tMove": 0.3,
              "tRead": 3
            }
          },
          "claims": [
            {
              "key": "b6InMoveTyp",
              "text": "the typical move input is 0.3 ms (ours)",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 2,
                  "tMove": 0.3,
                  "tRead": 3
                }
              },
              "value": "tMove"
            },
            {
              "key": "b6TypFrac",
              "text": "in the typical round the camera is 0.907 of the time",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 2,
                  "tMove": 0.3,
                  "tRead": 3
                }
              },
              "value": "readFrac"
            }
          ],
          "reported": [
            {
              "id": "t6-times",
              "text": "typical durations: preparation once, a gate, image acquisition, classification",
              "value": "about 100 ms; few µs; few ms; few 100 µs",
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
          "id": "b6-cycle:b5",
          "phase": "clue",
          "text": "A round has six gate layers of 1 µs each, a 0.1 ms move and a 2 ms exposure. What share of the round is the exposure? What is the ratio of the exposure to one gate?",
          "formal": "A round has six gate layers of $1\\,\\mu$s, a $0.1$ ms move and a 2 ms exposure. Find the readout fraction and the ratio of the exposure to one gate.",
          "caption": "the clue round",
          "captionFormal": "six 1 µs layers, a 0.1 ms move and a 2 ms exposure",
          "stage": {
            "recipe": "cycle-budget",
            "params": {
              "layers": 6,
              "tGateUs": 1,
              "tMove": 0.1,
              "tRead": 2,
              "quiet": true
            }
          },
          "claims": [
            {
              "key": "b6ClueInMove",
              "text": "the clue move is 0.1 ms",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 6,
                  "tGateUs": 1,
                  "tMove": 0.1,
                  "tRead": 2
                }
              },
              "value": "tMove"
            }
          ],
          "reveal": {
            "caption": "the clue round, with its total",
            "captionFormal": "six 1 µs layers, a 0.1 ms move and a 2 ms exposure, with the total",
            "stage": {
              "recipe": "cycle-budget",
              "params": {
                "layers": 6,
                "tGateUs": 1,
                "tMove": 0.1,
                "tRead": 2
              }
            },
            "text": "The gates last 0.006 ms in all, so the share is 0.950. The exposure is 2000 times one gate.",
            "formal": "$f=2/(2+0.1+0.006)=0.950$; the ratio is $2000/1=2000$.",
            "claims": [
              {
                "key": "b6ClueGate",
                "text": "six layers of 1 µs last 0.006 ms",
                "from": {
                  "recipe": "cycle-budget",
                  "params": {
                    "layers": 6,
                    "tGateUs": 1,
                    "tMove": 0.1,
                    "tRead": 2
                  }
                },
                "value": "gateMs"
              },
              {
                "key": "b6ClueFrac",
                "text": "the exposure is 0.950 of the round",
                "from": {
                  "recipe": "cycle-budget",
                  "params": {
                    "layers": 6,
                    "tGateUs": 1,
                    "tMove": 0.1,
                    "tRead": 2
                  }
                },
                "value": "readFrac"
              },
              {
                "key": "b6ClueRatio",
                "text": "the exposure is 2000 times one gate",
                "from": {
                  "recipe": "cycle-budget",
                  "params": {
                    "layers": 6,
                    "tGateUs": 1,
                    "tMove": 0.1,
                    "tRead": 2
                  }
                },
                "value": "ratio"
              }
            ]
          }
        }
      ],
      "review": {
        "points": [
          "A round is gates, a move, a camera exposure and a reset or reload.",
          "For atoms the exposure is thousands of times longer than a gate.",
          "The readout fraction is the exposure divided by the whole round."
        ],
        "equations": "f=\\frac{t_r}{t_{\\mathrm{gates}}+t_{\\mathrm{move}}+t_r+t_{\\mathrm{reset}}}",
        "trap": "Treating the printed readout shares as sums of the two listed times: the paper does not say what else its cycle contains.",
        "formal": {
          "points": [
            "The cycle is syndrome generation, readout and reset (Eq. 2); atom moves are our extra slot.",
            "$f=t_r/T_{\\mathrm{round}}$ where $T_{\\mathrm{round}}$ is the sum of the parts.",
            "Table 1 is best case and Table 6 typical; the ratio of exposure to gate is a ratio of printed times."
          ],
          "equations": "f=\\frac{t_r}{t_{\\mathrm{gates}}+t_{\\mathrm{move}}+t_r+t_{\\mathrm{reset}}},\\quad \\rho=\\frac{t_r}{t_{\\mathrm{gate}}}",
          "trap": "Reading the printed shares of Table 1 as derived from its own gate and readout times."
        }
      },
      "play": [
        {
          "id": "b6-c-frac",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "The share of the camera",
          "prompt": "A round has four gate layers of 0.5 µs, a 0.3 ms move and a 3 ms exposure. What share of the round is the exposure?",
          "answerFrom": {
            "from": {
              "recipe": "cycle-budget",
              "params": {
                "layers": 4,
                "tGateUs": 0.5,
                "tMove": 0.3,
                "tRead": 3
              }
            },
            "value": "readFrac"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Add the parts of the round first."
            },
            {
              "text": "The gates last four times 0.5 microseconds."
            },
            {
              "text": "Divide the exposure by the sum."
            }
          ],
          "walkthrough": [
            {
              "text": "The gates last 4 × 0.5 µs = 0.002 ms."
            },
            {
              "text": "The round is 0.002 + 0.3 + 3 = 3.302 ms."
            },
            {
              "text": "The share is 3 / 3.302, about 0.909."
            }
          ]
        },
        {
          "id": "b6-c-ratio",
          "kind": "numeric",
          "tier": "core",
          "title": "A gate against the camera",
          "prompt": "One gate lasts 2 µs and the exposure lasts 3 ms. How many times longer is the exposure?",
          "answerFrom": {
            "from": {
              "recipe": "cycle-budget",
              "params": {
                "layers": 1,
                "tGateUs": 2,
                "tRead": 3
              }
            },
            "value": "ratio"
          },
          "tolerance": 0,
          "hints": [
            {
              "text": "Put both times in the same unit."
            },
            {
              "text": "3 ms is 3000 µs."
            },
            {
              "text": "Divide 3000 by 2."
            }
          ],
          "walkthrough": [
            {
              "text": "3 ms = 3000 µs."
            },
            {
              "text": "The ratio is 3000 / 2."
            },
            {
              "text": "That is 1500."
            }
          ]
        },
        {
          "id": "b6-c-which",
          "kind": "choice",
          "tier": "core",
          "title": "A longer move",
          "prompt": "The atoms are moved for longer, and nothing else changes. The readout fraction becomes…",
          "options": [
            {
              "text": "larger",
              "correct": false,
              "why": "The camera time is the same but the round is longer, so its share falls."
            },
            {
              "text": "smaller",
              "correct": true,
              "why": "The numerator is fixed and the denominator, the round time, grows."
            },
            {
              "text": "unchanged",
              "correct": false,
              "why": "The share is a ratio to the whole round, so a longer move changes it."
            }
          ],
          "hints": [
            {
              "text": "Think of the fraction as the camera time over the round time."
            },
            {
              "text": "The move adds to the round time."
            },
            {
              "text": "A bigger denominator makes the fraction smaller."
            }
          ],
          "walkthrough": [
            {
              "text": "f = t_r over the round time."
            },
            {
              "text": "The move adds to the round time but not to t_r."
            },
            {
              "text": "So f gets smaller."
            }
          ]
        }
      ],
      "pitfalls": [
        "Treating the printed shares as the sum of two listed times."
      ]
    },
    {
      "id": "b6-twirl",
      "title": "Waiting costs: idle error as three chances",
      "question": "What does a qubit lose while the camera works?",
      "source": {
        "summary": "The paper models idling during measurement by the Pauli twirling approximation, characterised by T1 and T2 times, but prints none of the values. Tomita and Svore give the three chances that the twirl produces.",
        "where": "GANDALF §7.2, pp. 12–13; Tomita and Svore §II.C, Eqs. 7–10"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "ucurve-lab"
        },
        "tryThis": [
          "Shorten T2 and watch the waiting error rise: the Z chance grows first, because dephasing is the faster clock.",
          "Set T1 to its largest value. Only the dephasing part is left, and the waiting curve is a straight line at small times."
        ]
      },
      "insight": "An atom that waits is not frozen. In our toy it slowly leans and slowly forgets its phase. A twirl turns that into three simple chances, with Z by far the likeliest.",
      "insightFormal": "The Pauli twirl of amplitude and phase damping is a Pauli channel with p_X = p_Y = (1 − e^{−t/T₁})/4 and p_Z = (1 − e^{−t/T₂})/2 − p_X. When T₂ is much smaller than T₁ the Z chance dominates.",
      "claims": [
        {
          "key": "b6InT1",
          "text": "the toy relaxation time is 10 s (ours)",
          "from": {
            "recipe": "idle-twirl",
            "params": {
              "T1": 10,
              "T2": 1,
              "tMs": 4
            }
          },
          "value": "T1"
        },
        {
          "key": "b6InT2",
          "text": "the toy dephasing time is 1 s (ours)",
          "from": {
            "recipe": "idle-twirl",
            "params": {
              "T1": 10,
              "T2": 1,
              "tMs": 4
            }
          },
          "value": "T2"
        }
      ],
      "story": [
        {
          "id": "b6-twirl:b1",
          "phase": "books",
          "text": "A waiting atom slowly leans towards its resting state, and it slowly forgets its phase. These two clocks are called [[pp-t1-t2|T₁ and T₂]], and the damage while waiting is [[pp-idle-error|idle error]]. In our toy T₁ is 10 s and T₂ is 1 s. After 4 ms the up-down part of the atom's arrow shrinks to 0.9996 and the sideways part to 0.996.",
          "formal": "Amplitude damping with time [[pp-t1-t2|$T_1$]] shrinks the Bloch $z$ component by $e^{-t/T_1}$ and pulls it to rest; dephasing with $T_2$ shrinks $x$ and $y$ by $e^{-t/T_2}$ (<<pp-q13-depolarizing|Q13>>; Tomita and Svore, Eq. 7). For our toy values and $t=4$ ms the factors are $0.9996$ and $0.996$. This is [[pp-idle-error|idle error]], the damage while a qubit waits.",
          "caption": "how much of the arrow is left after a wait (toy T₁ and T₂, a model, not data)",
          "captionFormal": "shrink factors against $t$ for $T_1=10$ s, $T_2=1$ s (model, not data)",
          "stage": {
            "recipe": "idle-twirl",
            "params": {
              "T1": 10,
              "T2": 1,
              "tMs": 4,
              "view": "shrink"
            }
          },
          "claims": [
            {
              "key": "b6ShrinkZ",
              "text": "the z component keeps 0.9996 of its length after 4 ms",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "shrinkZ"
            },
            {
              "key": "b6ShrinkXY",
              "text": "the x and y components keep 0.996 of their length after 4 ms",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "shrinkXY"
            }
          ],
          "trail": [
            {
              "ref": "tom14",
              "at": "Section II.B, Eq. 7",
              "why": "Amplitude and phase damping are written with the times T1 and T2 over a gate of duration t."
            }
          ]
        },
        {
          "id": "b6-twirl:b2",
          "phase": "books",
          "text": "The leaning is messy to follow. A [[pp-pauli-twirl|Pauli twirl]] replaces it by a simple model. The model has an X error, a Y error, a Z error or nothing, each with a fixed chance.",
          "formal": "A [[pp-pauli-twirl|Pauli twirl]] averages the channel over conjugations by the Pauli operators. It keeps only the diagonal of the channel in the Pauli basis, so the result is a Pauli channel with chances $(p_X,p_Y,p_Z)$ (<<pp-q21-digitize|Q21>>: any one-qubit error is a mix of $I,X,Y,Z$).",
          "caption": "the three chances of the simple model against the wait (toy, not data)",
          "captionFormal": "$p_X=p_Y$ and $p_Z$ against $t$ (model, not data)",
          "stage": {
            "recipe": "idle-twirl",
            "params": {
              "T1": 10,
              "T2": 1,
              "tMs": 4,
              "view": "chances"
            }
          },
          "introduces": [
            "pp-pauli-twirl"
          ],
          "trail": [
            {
              "ref": "tom14",
              "at": "Section II.C, Eq. 8",
              "why": "A Pauli channel approximates the decoherence channel by twirling, which removes the off-diagonal terms."
            }
          ]
        },
        {
          "id": "b6-twirl:b3",
          "phase": "books",
          "text": "Matching the two shrink factors gives the three chances. For a 4 ms wait the X and Y chances are each 9.998 × 10⁻⁵, and the Z chance is 1.896 × 10⁻³. Z is about 19 times likelier than X, so the total is 2.096 × 10⁻³.",
          "formal": "Matching the shrink factors gives $p_X=p_Y=(1-e^{-t/T_1})/4$ and $p_Z=(1-e^{-t/T_2})/2-p_X$ (Tomita and Svore, Eqs. 9–10). For $t=4$ ms: $p_X=p_Y=9.998\\times10^{-5}$, $p_Z=1.896\\times10^{-3}$, total $2.096\\times10^{-3}$, and $p_Z/p_X=18.96$.",
          "caption": "the three chances after 4 ms (toy, not data)",
          "captionFormal": "$p_X$, $p_Y$, $p_Z$ at $t=4$ ms (model, not data)",
          "stage": {
            "recipe": "idle-twirl",
            "params": {
              "T1": 10,
              "T2": 1,
              "tMs": 4
            }
          },
          "derivation": {
            "result": "p_X=p_Y=\\frac{1-e^{-t/T_1}}{4},\\quad p_Z=\\frac{1-e^{-t/T_2}}{2}-p_X",
            "ground": [
              {
                "tex": "z\\to e^{-t/T_1}z,\\quad x,y\\to e^{-t/T_2}\\,(x,y)",
                "why": "A waiting atom's arrow shrinks: the up-down part by one factor and the sideways part by another.",
                "view": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 10,
                    "T2": 1,
                    "tMs": 4,
                    "view": "shrink"
                  }
                },
                "viewCaption": "shrink of x, y, z"
              },
              {
                "tex": "z\\to(1-2(a+b))z,\\quad x\\to(1-2(b+c))x,\\quad y\\to(1-2(a+c))y",
                "why": "A model \"X with chance a, Y with chance b, Z with chance c\" also shrinks the arrow, by these factors.",
                "view": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 10,
                    "T2": 1,
                    "tMs": 4,
                    "view": "bars"
                  }
                },
                "viewCaption": "chances a, b, c"
              },
              {
                "tex": "1-2(a+b)=e^{-t/T_1}\\;\\Rightarrow\\;a+b=\\frac{1-e^{-t/T_1}}{2},\\quad a=b",
                "why": "Match the up-down shrink. By symmetry X and Y are equally likely, so a equals b.",
                "view": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 10,
                    "T2": 1,
                    "tMs": 4,
                    "view": "chances"
                  }
                },
                "viewCaption": "chances against t"
              },
              {
                "tex": "p_X=p_Y=\\frac{1-e^{-t/T_1}}{4},\\quad p_Z=\\frac{1-e^{-t/T_2}}{2}-p_X",
                "why": "Match the sideways shrink and solve for c, which is p_Z. The three chances are now known.",
                "view": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 10,
                    "T2": 1,
                    "tMs": 4,
                    "view": "line"
                  }
                },
                "viewCaption": "the total against t"
              }
            ],
            "formal": [
              {
                "tex": "\\lambda_x=1-2(p_Y+p_Z),\\;\\lambda_y=1-2(p_X+p_Z),\\;\\lambda_z=1-2(p_X+p_Y)",
                "why": "A Pauli channel multiplies the Bloch components by these transfer factors.",
                "view": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 10,
                    "T2": 1,
                    "tMs": 4,
                    "view": "bars"
                  }
                },
                "viewCaption": "chances a, b, c"
              },
              {
                "tex": "\\lambda_z=e^{-t/T_1},\\;\\lambda_x=\\lambda_y=e^{-t/T_2}\\;\\Rightarrow\\;p_X=p_Y",
                "why": "Set them equal to the damping factors; the two sideways factors agree, so p_X equals p_Y.",
                "view": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 10,
                    "T2": 1,
                    "tMs": 4,
                    "view": "shrink"
                  }
                },
                "viewCaption": "shrink of x, y, z"
              },
              {
                "tex": "p_X=\\frac{1-e^{-t/T_1}}{4},\\quad p_Z=\\frac{1-e^{-t/T_2}}{2}-p_X",
                "why": "Solve. The twirl keeps the diagonal of the channel and drops the part that pulls z towards rest.",
                "view": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 10,
                    "T2": 1,
                    "tMs": 4,
                    "view": "chances"
                  }
                },
                "viewCaption": "chances against t"
              }
            ]
          },
          "claims": [
            {
              "key": "b6PxPyM",
              "text": "the X and Y chances after 4 ms are each 9.998e-5 (mantissa)",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "pXM"
            },
            {
              "key": "b6PxPyE",
              "text": "the X and Y chances after 4 ms are each 9.998e-5 (exponent)",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "pXE"
            },
            {
              "key": "b6PzM",
              "text": "the Z chance after 4 ms is 1.896e-3 (mantissa)",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "pZM"
            },
            {
              "key": "b6PzE",
              "text": "the Z chance after 4 ms is 1.896e-3 (exponent)",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "pZE"
            },
            {
              "key": "b6IdleTotal4msM",
              "text": "the total idle chance after 4 ms is 2.096e-3 (mantissa)",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "totalM"
            },
            {
              "key": "b6IdleTotal4msE",
              "text": "the total idle chance after 4 ms is 2.096e-3 (exponent)",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "totalE"
            },
            {
              "key": "b6PzOverPx",
              "text": "Z is 18.96 times likelier than X",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "pzOverPx"
            }
          ],
          "reported": [
            {
              "id": "tom-eq9",
              "text": "Eq. 9: the chance of an X error, equal to that of a Y error",
              "value": "p_X = p_Y = (1 − e^(−t/T1))/4",
              "source": "tom14",
              "at": {
                "kind": "equation",
                "label": "9",
                "page": 6
              }
            },
            {
              "id": "tom-eq10",
              "text": "Eq. 10: the chance of a Z error",
              "value": "p_Z = (1 − e^(−t/T2))/2 − p_X",
              "source": "tom14",
              "at": {
                "kind": "equation",
                "label": "10",
                "page": 6
              }
            }
          ]
        },
        {
          "id": "b6-twirl:b4",
          "phase": "books",
          "text": "For short waits each chance grows in proportion to the time. The total is then the wait divided by 4T₁, plus the wait divided by 2T₂. Here that is 0.0021. The exact total is 0.998 of the straight-line value.",
          "formal": "For $t\\ll T_1,T_2$ the total is $p_X+p_Y+p_Z\\approx t/(4T_1)+t/(2T_2)=0.0021$ at 4 ms; the exact total is $0.998$ of this. Tomita and Svore find that twirling overstates the logical error compared with the full damping channel.",
          "caption": "exact total and the straight-line rule (toy, not data)",
          "captionFormal": "$p_X+p_Y+p_Z$ and $t/(4T_1)+t/(2T_2)$ against $t$ (model, not data)",
          "stage": {
            "recipe": "idle-twirl",
            "params": {
              "T1": 10,
              "T2": 1,
              "tMs": 4,
              "view": "line"
            }
          },
          "claims": [
            {
              "key": "b6IdleSmallT",
              "text": "the straight-line total after 4 ms is 0.0021",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "smallT"
            },
            {
              "key": "b6IdleSmallRatio",
              "text": "the exact total is 0.998 of the straight-line value",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 10,
                  "T2": 1,
                  "tMs": 4
                }
              },
              "value": "smallRatio"
            }
          ],
          "trail": [
            {
              "ref": "tom14",
              "at": "Abstract",
              "why": "The twirled channel overstates the logical error compared with full amplitude and phase damping; Tomita and Svore conclude that real devices may tolerate more noise than the twirled estimate."
            }
          ]
        },
        {
          "id": "b6-twirl:b5",
          "phase": "clue",
          "text": "Take T₁ = 2 s, T₂ = 0.4 s and a wait of 20 ms. What is the Z chance in percent? Now let T₁ be infinite, with T₂ = 1 s and a wait of 10 ms. What is the total idle chance in percent?",
          "formal": "Take $T_1=2$ s, $T_2=0.4$ s and $t=20$ ms: find $p_Z$ in percent. Then take $T_1\\to\\infty$, $T_2=1$ s, $t=10$ ms: find the total idle chance in percent.",
          "caption": "the clue inputs (toy)",
          "captionFormal": "two sets of toy inputs",
          "stage": {
            "recipe": "idle-twirl",
            "params": {
              "T1": 2,
              "T2": 0.4,
              "tMs": 20
            }
          },
          "claims": [
            {
              "key": "b6ClueInT2",
              "text": "the clue dephasing time is 0.4 s",
              "from": {
                "recipe": "idle-twirl",
                "params": {
                  "T1": 2,
                  "T2": 0.4,
                  "tMs": 20
                }
              },
              "value": "T2"
            }
          ],
          "reveal": {
            "text": "The Z chance is 2.19 %. With infinite T₁ the total is 0.498 %.",
            "formal": "$p_Z=(1-e^{-t/T_2})/2-(1-e^{-t/T_1})/4$ gives $2.19\\%$; with $T_1\\to\\infty$ only $p_Z=(1-e^{-t/T_2})/2$ is left, $0.498\\%$.",
            "claims": [
              {
                "key": "b6ClueTwPz",
                "text": "the Z chance is 2.19 percent",
                "from": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 2,
                    "T2": 0.4,
                    "tMs": 20
                  }
                },
                "value": "pZ"
              },
              {
                "key": "b6ClueTwInf",
                "text": "the total with infinite T1 is 0.498 percent",
                "from": {
                  "recipe": "idle-twirl",
                  "params": {
                    "T1": 1000000000000,
                    "T2": 1,
                    "tMs": 10
                  }
                },
                "value": "total"
              }
            ]
          }
        },
        {
          "id": "b6-twirl:b6",
          "phase": "deeper",
          "text": "The paper uses this model, characterised by T₁ and T₂, but it prints no values for them. It also prints no gate errors and no rule that turns a classifier error into a flip chance. Every curve in this chapter therefore uses our own toy values.",
          "formal": "GANDALF §7.2 (p. 12) models idling during measurement by the Pauli twirling approximation, characterised by $T_1$ and $T_2$ times. It prints none of those values, no gate errors, and no rule for how a classifier error enters the simulated circuit, so Fig. 14 cannot be reproduced from the paper alone. Every curve here is a model of ours.",
          "caption": "toy curves: ours, not the paper's",
          "captionFormal": "our model, labelled as such (ruling G3)",
          "stage": {
            "recipe": "idle-twirl",
            "params": {
              "T1": 10,
              "T2": 1,
              "tMs": 4,
              "view": "chances"
            }
          },
          "trail": [
            {
              "ref": "gdf25",
              "at": "Section 7.2, page 12",
              "why": "Idling errors during measurement are modelled by the Pauli twirling approximation characterised by T1 and T2; no values are printed there."
            }
          ]
        }
      ],
      "review": {
        "points": [
          "A waiting atom leans to rest and forgets its phase on two clocks, T₁ and T₂.",
          "A twirl turns that into the chances of an X, Y or Z error.",
          "When T₂ is much shorter than T₁ the Z error is the likeliest."
        ],
        "equations": "p_X=p_Y=\\frac{1-e^{-t/T_1}}{4},\\quad p_Z=\\frac{1-e^{-t/T_2}}{2}-p_X",
        "trap": "Calling our T₁ and T₂ the paper's: the paper prints none.",
        "formal": {
          "points": [
            "A Pauli channel multiplies the Bloch components by $\\lambda_x=1-2(p_Y+p_Z)$, $\\lambda_y=1-2(p_X+p_Z)$, $\\lambda_z=1-2(p_X+p_Y)$.",
            "Setting $\\lambda_z=e^{-t/T_1}$ and $\\lambda_x=\\lambda_y=e^{-t/T_2}$ gives Tomita and Svore's Eqs. 9–10.",
            "The twirl drops the non-unital part of the channel; it is a pessimistic approximation."
          ],
          "equations": "p_X=p_Y=\\frac{1-e^{-t/T_1}}{4},\\quad p_Z=\\frac{1-e^{-t/T_2}}{2}-p_X,\\quad p_X+p_Y+p_Z\\approx\\frac{t}{4T_1}+\\frac{t}{2T_2}",
          "trap": "Using T₂ larger than 2T₁, which would make p_Z negative."
        }
      },
      "play": [
        {
          "id": "b6-t-pz",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "The Z chance",
          "prompt": "With T₁ = 5 s and T₂ = 0.5 s, what is the Z chance, in percent, after a wait of 50 ms?",
          "answerFrom": {
            "from": {
              "recipe": "idle-twirl",
              "params": {
                "T1": 5,
                "T2": 0.5,
                "tMs": 50
              }
            },
            "value": "pZPct"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Use p_Z = (1 − e^{−t/T₂})/2 − (1 − e^{−t/T₁})/4."
            },
            {
              "text": "Put t in seconds: 0.05 s."
            },
            {
              "text": "Compute the two exponentials separately."
            }
          ],
          "walkthrough": [
            {
              "text": "(1 − e^{−0.1})/2 = 0.04758."
            },
            {
              "text": "(1 − e^{−0.01})/4 = 0.002488."
            },
            {
              "text": "The difference is 0.04509, which is 4.509 percent."
            }
          ]
        },
        {
          "id": "b6-t-inf",
          "kind": "numeric",
          "tier": "core",
          "title": "No relaxation",
          "prompt": "T₁ is infinite, T₂ = 0.25 s and the wait is 10 ms. What is the total idle chance, in percent?",
          "answerFrom": {
            "from": {
              "recipe": "idle-twirl",
              "params": {
                "T1": 1000000000000,
                "T2": 0.25,
                "tMs": 10
              }
            },
            "value": "totalPct"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "With T₁ infinite, p_X and p_Y are zero."
            },
            {
              "text": "Only p_Z is left."
            },
            {
              "text": "p_Z = (1 − e^{−t/T₂})/2."
            }
          ],
          "walkthrough": [
            {
              "text": "With T₁ infinite, 1 − e^{−t/T₁} is zero, so p_X = p_Y = 0."
            },
            {
              "text": "p_Z = (1 − e^{−0.04})/2 = 0.01961."
            },
            {
              "text": "That is 1.961 percent."
            }
          ]
        },
        {
          "id": "b6-t-dom",
          "kind": "choice",
          "tier": "core",
          "title": "Which error dominates",
          "prompt": "When T₂ is much shorter than T₁, which of the three Pauli errors is the likeliest?",
          "options": [
            {
              "text": "X",
              "correct": false,
              "why": "The X chance is set by T₁, the slow clock."
            },
            {
              "text": "Y",
              "correct": false,
              "why": "Y has the same chance as X."
            },
            {
              "text": "Z",
              "correct": true,
              "why": "The Z chance carries the fast dephasing clock T₂, minus the small X part."
            }
          ],
          "hints": [
            {
              "text": "Compare the sizes of 1 − e^{−t/T₁} and 1 − e^{−t/T₂}."
            },
            {
              "text": "The shorter time gives the bigger number."
            },
            {
              "text": "p_Z uses T₂."
            }
          ],
          "walkthrough": [
            {
              "text": "p_X = p_Y is a quarter of 1 − e^{−t/T₁}."
            },
            {
              "text": "p_Z is half of 1 − e^{−t/T₂}, minus p_X."
            },
            {
              "text": "When T₂ is much shorter, p_Z is far the largest."
            }
          ]
        }
      ],
      "pitfalls": [
        "Using the same time for T₁ and T₂: they are different clocks."
      ]
    },
    {
      "id": "b6-ucurve",
      "title": "Reading error against waiting error",
      "question": "Why is there a best reading time, and why is the exponent (d+1)/2?",
      "source": {
        "summary": "The paper finds that an intermediate readout time of about 4 ms gives the best logical error rate. Longer reading is more accurate but leaves the atoms waiting. The scaling of the logical error with distance is the published fit with exponent (d+1)/2 that B1 reports.",
        "where": "GANDALF §7.2, pp. 12–13, Fig. 14; B1 for the published fits"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "ucurve-lab"
        },
        "tryThis": [
          "Raise the bright rate and watch the best time move earlier. Then raise the gate error and watch the total lift without moving the lowest point.",
          "Change the distance d. The cost of missing the best time grows with d, but the best time itself does not move."
        ]
      },
      "insight": "Reading longer is more accurate but leaves every data atom waiting, so the total error has one lowest point. The distance sets how steeply the walls rise, never where the valley is.",
      "insightFormal": "The effective error p_eff(t) = p_g + p_idle(t) + p_m(t) has an interior minimum. Since p_L = A (p_eff/p_th)^((d+1)/2) is increasing in p_eff, the best time is the same for every d; d only sets how costly a miss is.",
      "claims": [
        {
          "key": "b6InRb",
          "text": "the bright rate input is 6 photons per ms (ours)",
          "from": {
            "recipe": "readout-ucurve",
            "params": {
              "rb": 6,
              "rg": 0.3,
              "pg": 0.002,
              "T1": 10,
              "T2": 1,
              "pth": 0.01,
              "A": 0.03,
              "d": 11
            }
          },
          "value": "rb"
        },
        {
          "key": "b6InRg",
          "text": "the background rate input is 0.3 photons per ms (ours)",
          "from": {
            "recipe": "readout-ucurve",
            "params": {
              "rb": 6,
              "rg": 0.3,
              "pg": 0.002,
              "T1": 10,
              "T2": 1,
              "pth": 0.01,
              "A": 0.03,
              "d": 11
            }
          },
          "value": "rg"
        },
        {
          "key": "b6InPg",
          "text": "the gate and move error input is 0.002 (ours)",
          "from": {
            "recipe": "readout-ucurve",
            "params": {
              "rb": 6,
              "rg": 0.3,
              "pg": 0.002,
              "T1": 10,
              "T2": 1,
              "pth": 0.01,
              "A": 0.03,
              "d": 11
            }
          },
          "value": "pg"
        },
        {
          "key": "b6InPth",
          "text": "the threshold input is 0.01 (the fit B1 reports)",
          "from": {
            "recipe": "readout-ucurve",
            "params": {
              "rb": 6,
              "rg": 0.3,
              "pg": 0.002,
              "T1": 10,
              "T2": 1,
              "pth": 0.01,
              "A": 0.03,
              "d": 11
            }
          },
          "value": "pth"
        },
        {
          "key": "b6InA",
          "text": "the prefactor input is 0.03 (the fit B1 reports)",
          "from": {
            "recipe": "readout-ucurve",
            "params": {
              "rb": 6,
              "rg": 0.3,
              "pg": 0.002,
              "T1": 10,
              "T2": 1,
              "pth": 0.01,
              "A": 0.03,
              "d": 11
            }
          },
          "value": "A"
        },
        {
          "key": "b6InP",
          "text": "the fault chance of one copy in the vote is 0.001",
          "from": {
            "recipe": "fault-counts",
            "params": {
              "d": 11,
              "p": 0.001
            }
          },
          "value": "p"
        }
      ],
      "story": [
        {
          "id": "b6-ucurve:b1",
          "phase": "books",
          "text": "A longer look at the atoms reads them more reliably, but every data atom waits longer too. Add the two errors and the total has a lowest point. In our toy a bright atom gives 6 photons per ms and a dark site 0.3 per ms. The [[pp-meas-error|reading error]] falls from 2.714 % at 1 ms to 0.282 % at 2 ms, and to 4.22 × 10⁻⁵ at 4 ms. Meanwhile the waiting error keeps rising.",
          "formal": "The effective error of a round is $p_{\\mathrm{eff}}(t)=p_g+p_{\\mathrm{idle}}(t)+p_m(t)$. The reading error $p_m$ is the Poisson error of the best cutoff on counts of mean $6t$ and $0.3\\,t$ (<<pp-o11-exposure|O11>>): $2.714\\%$, $0.282\\%$ and $4.22\\times10^{-5}$ at 1, 2 and 4 ms. The waiting error $p_{\\mathrm{idle}}$ is the twirl total and grows nearly in a straight line. A [[pp-meas-error|measurement error]] is a time-like fault (<<pp-b1-spacetime|B1>>).",
          "caption": "reading error, waiting error and their sum against the exposure (toy inputs, not data)",
          "captionFormal": "$p_m$, $p_{\\mathrm{idle}}$ and $p_{\\mathrm{eff}}$ against $t$ (model, not data)",
          "stage": {
            "recipe": "readout-ucurve",
            "params": {
              "rb": 6,
              "rg": 0.3,
              "pg": 0.002,
              "T1": 10,
              "T2": 1,
              "pth": 0.01,
              "A": 0.03,
              "d": 11,
              "view": "parts"
            }
          },
          "claims": [
            {
              "key": "b6PmAt1ms",
              "text": "the reading error at 1 ms is 2.714 percent",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "pm1"
            },
            {
              "key": "b6PmAt2ms",
              "text": "the reading error at 2 ms is 0.282 percent",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "pm2"
            },
            {
              "key": "b6PmAt4msM",
              "text": "the reading error at 4 ms is 4.22e-5 (mantissa)",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "pm4M"
            },
            {
              "key": "b6PmAt4msE",
              "text": "the reading error at 4 ms is 4.22e-5 (exponent)",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "pm4E"
            }
          ],
          "trail": [
            {
              "ref": "gdf25",
              "at": "Section 7.2, page 12",
              "why": "Longer readout gives better accuracy but more idling error against shorter readout with less idling error and lower accuracy."
            }
          ]
        },
        {
          "id": "b6-ucurve:b2",
          "phase": "books",
          "text": "The best reading time sits where one more millisecond buys no more than it costs. In our toy the total error is 0.5874 % at 2 ms, 0.4138 % at 4 ms and 0.7225 % at 10 ms. The lowest point, the [[pp-ucurve|U-shaped optimum]], is 0.3906 % at 2.95 ms. That is a property of our toy numbers. The paper's own best is about 4 ms, and the two positions prove nothing about each other.",
          "formal": "With our inputs $p_{\\mathrm{eff}}$ is $0.5874\\%$, $0.4138\\%$ and $0.7225\\%$ at 2, 4 and 10 ms. On a grid of 50 $\\mu$s the minimum is $0.3906\\%$ at $t^*=2.95$ ms, the [[pp-ucurve|U-shaped optimum]] $t^*=\\arg\\min_t[p_g+p_{\\mathrm{idle}}+p_m]$. The toy is not fitted to the paper, which reports a best readout of about 4 ms at 9 $\\mu$m spacing; the two positions prove nothing about each other.",
          "caption": "the lowest point of the total (toy inputs, not data)",
          "captionFormal": "$t^*$ and $p_{\\mathrm{eff}}(t^*)$ (model, not data)",
          "stage": {
            "recipe": "readout-ucurve",
            "params": {
              "rb": 6,
              "rg": 0.3,
              "pg": 0.002,
              "T1": 10,
              "T2": 1,
              "pth": 0.01,
              "A": 0.03,
              "d": 11,
              "view": "parts"
            }
          },
          "introduces": [
            "pp-ucurve"
          ],
          "claims": [
            {
              "key": "b6PeffAt2",
              "text": "the total error at 2 ms is 0.5874 percent",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "peff2"
            },
            {
              "key": "b6PeffAt4",
              "text": "the total error at 4 ms is 0.4138 percent",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "peff4"
            },
            {
              "key": "b6PeffAt10",
              "text": "the total error at 10 ms is 0.7225 percent",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "peff10"
            },
            {
              "key": "b6PeffStar",
              "text": "the lowest total error is 0.3906 percent",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "peffStar"
            },
            {
              "key": "b6TStar",
              "text": "the best exposure in our toy is 2.95 ms",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "tStar"
            }
          ],
          "reported": [
            {
              "id": "g-best",
              "text": "the readout duration that gives the best logical error rate, at 9 µm atom spacing",
              "value": "approximately 4ms",
              "source": "paper-gdf",
              "at": {
                "kind": "text",
                "page": 12
              }
            }
          ]
        },
        {
          "id": "b6-ucurve:b3",
          "phase": "books",
          "text": "A failure needs more than half of the d guards wrong at once. That is (d+1)/2 wrong guards, each costing a chance p, so the failure chance is about p to the power (d+1)/2. This is the [[pp-fault-exponent|exponent]] of the published fits. With p = 0.001 the exact vote is 0.9993, 0.9985, 0.9976, 0.9957 and 0.9948 of this leading term for d = 3, 5, 7, 11 and 13.",
          "formal": "The cheapest failing fault set has $k=(d+1)/2$ faults (odd $d$), so $p_L\\sim\\binom dk p^k$, the exponent of the <<pp-b1-threshold|published fits>>. For a vote of $d$ copies at $p=0.001$ the exact failure is $2.998\\times10^{-6}$, $9.985\\times10^{-9}$, $3.49\\times10^{-11}$, $4.60\\times10^{-16}$ and $1.71\\times10^{-18}$ for $d=3,5,7,11,13$, and the exact over the leading term is $0.9993$, $0.9985$, $0.9976$, $0.9957$, $0.9948$. The prefactor $A$ of the surface code comes from fits (B1), not from this count. The [[pp-fault-exponent|exponent]] counts faults of every kind alike.",
          "caption": "exact vote and its leading term (toy vote, not data)",
          "captionFormal": "exact failure and $\\binom dk p^k$ against $d$, $p=0.001$",
          "stage": {
            "recipe": "fault-counts",
            "params": {
              "d": 11,
              "p": 0.001
            }
          },
          "derivation": {
            "result": "p_L\\approx\\binom{d}{(d+1)/2}\\,p^{(d+1)/2}",
            "ground": [
              {
                "tex": "k\\ge\\frac{d+1}{2}",
                "why": "The d guards vote, and the code fails when more than half of them are wrong.",
                "view": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 11,
                    "p": 0.001
                  }
                },
                "viewCaption": "vote and failures"
              },
              {
                "tex": "\\binom{d}{(d+1)/2}",
                "why": "The cheapest way is exactly (d+1)/2 wrong guards. The number of ways to choose them is the binomial coefficient.",
                "view": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 5,
                    "p": 0.001
                  }
                },
                "viewCaption": "ways to fail"
              },
              {
                "tex": "\\binom{d}{(d+1)/2}\\,p^{(d+1)/2}",
                "why": "Each wrong guard costs a chance p, so each way has chance p to the power (d+1)/2.",
                "view": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 7,
                    "p": 0.001
                  }
                },
                "viewCaption": "exact against leading term"
              },
              {
                "tex": "p_L\\approx\\binom{d}{(d+1)/2}\\,p^{(d+1)/2}",
                "why": "So for a small p the failure is about this leading term, within one percent of the exact vote up to d = 13.",
                "view": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 11,
                    "p": 0.001,
                    "view": "ratio"
                  }
                },
                "viewCaption": "exact over leading"
              }
            ],
            "formal": [
              {
                "tex": "P_{\\mathrm{fail}}=\\sum_{k\\ge(d+1)/2}\\binom dk p^k(1-p)^{d-k}",
                "why": "The exact failure of the vote.",
                "view": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 11,
                    "p": 0.001
                  }
                },
                "viewCaption": "vote and failures"
              },
              {
                "tex": "\\binom{d}{(d+1)/2}p^{(d+1)/2}",
                "why": "The leading term: the ratio of the exact failure to it is close to 1 at small p.",
                "view": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 11,
                    "p": 0.001,
                    "view": "ratio"
                  }
                },
                "viewCaption": "exact over leading"
              },
              {
                "tex": "p_L\\approx\\binom{d}{(d+1)/2}\\,p^{(d+1)/2}",
                "why": "This is the leading term. With unequal rates it becomes the elementary symmetric polynomial, at most the Maclaurin bound.",
                "view": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 11,
                    "p": 0.001,
                    "view": "mixed",
                    "mixed": {
                      "n1": 5,
                      "p1": 0.001,
                      "n2": 6,
                      "p2": 0.005
                    }
                  }
                },
                "viewCaption": "mixed rates"
              }
            ]
          },
          "claims": [
            {
              "key": "b6Rep3M",
              "text": "the exact vote failure at d = 3 is 2.998e-6 (mantissa)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 3,
                  "p": 0.001
                }
              },
              "value": "exactM"
            },
            {
              "key": "b6Rep3E",
              "text": "the exact vote failure at d = 3 is 2.998e-6 (exponent)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 3,
                  "p": 0.001
                }
              },
              "value": "exactE"
            },
            {
              "key": "b6Rep5M",
              "text": "the exact vote failure at d = 5 is 9.985e-9 (mantissa)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 5,
                  "p": 0.001
                }
              },
              "value": "exactM"
            },
            {
              "key": "b6Rep5E",
              "text": "the exact vote failure at d = 5 is 9.985e-9 (exponent)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 5,
                  "p": 0.001
                }
              },
              "value": "exactE"
            },
            {
              "key": "b6Rep7M",
              "text": "the exact vote failure at d = 7 is 3.49e-11 (mantissa)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 7,
                  "p": 0.001
                }
              },
              "value": "exactM"
            },
            {
              "key": "b6Rep7E",
              "text": "the exact vote failure at d = 7 is 3.49e-11 (exponent)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 7,
                  "p": 0.001
                }
              },
              "value": "exactE"
            },
            {
              "key": "b6Rep11M",
              "text": "the exact vote failure at d = 11 is 4.60e-16 (mantissa)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001
                }
              },
              "value": "exactM"
            },
            {
              "key": "b6Rep11E",
              "text": "the exact vote failure at d = 11 is 4.60e-16 (exponent)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001
                }
              },
              "value": "exactE"
            },
            {
              "key": "b6Rep13M",
              "text": "the exact vote failure at d = 13 is 1.71e-18 (mantissa)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 13,
                  "p": 0.001
                }
              },
              "value": "exactM"
            },
            {
              "key": "b6Rep13E",
              "text": "the exact vote failure at d = 13 is 1.71e-18 (exponent)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 13,
                  "p": 0.001
                }
              },
              "value": "exactE"
            },
            {
              "key": "b6RepRatio3",
              "text": "at d = 3 the exact vote is 0.9993 of the leading term",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 3,
                  "p": 0.001
                }
              },
              "value": "ratio"
            },
            {
              "key": "b6RepRatio5",
              "text": "at d = 5 the ratio is 0.9985",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 5,
                  "p": 0.001
                }
              },
              "value": "ratio"
            },
            {
              "key": "b6RepRatio7",
              "text": "at d = 7 the ratio is 0.9976",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 7,
                  "p": 0.001
                }
              },
              "value": "ratio"
            },
            {
              "key": "b6RepRatio11",
              "text": "at d = 11 the ratio is 0.9957",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001
                }
              },
              "value": "ratio"
            },
            {
              "key": "b6RepRatio13",
              "text": "at d = 13 the ratio is 0.9948",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 13,
                  "p": 0.001
                }
              },
              "value": "ratio"
            }
          ]
        },
        {
          "id": "b6-ucurve:b4",
          "phase": "books",
          "text": "Raising d makes the dip deeper and the walls steeper. The lowest point stays put: it is 2.95 ms for d = 3, 11 and 25. Missing it by a factor of two costs a factor of 1.70 at d = 3 and 4.90 at d = 11. At d = 11 the logical error is 1.065 × 10⁻⁴ at the best time and 4.267 × 10⁻³ at 10 ms. The formula does not apply where the total error reaches the threshold, as it does at 1 ms, where it is 2.97 times the threshold.",
          "formal": "$p_L=A(p_{\\mathrm{eff}}/p_{\\mathrm{th}})^k$ increases with $p_{\\mathrm{eff}}$, so its minimum in $t$ is where $p_{\\mathrm{eff}}$ is smallest, for every $d$ (checked at $d=3,11,25$: $2.95$ ms). With $A=0.03$ and $p_{\\mathrm{th}}=0.01$ (the fit B1 reports; our inputs here), missing $t^*$ by a factor of 2 multiplies $p_L$ by $1.70$ at $d=3$ and $4.90$ at $d=11$. At $d=11$: $p_L(t^*)=1.065\\times10^{-4}$ and $p_L(10\\ \\mathrm{ms})=4.267\\times10^{-3}$. At 1 ms $p_{\\mathrm{eff}}/p_{\\mathrm{th}}=2.97$, where the formula does not apply; the stage leaves out those points.",
          "caption": "logical error against the exposure for three distances (toy inputs, not data; points where the formula does not apply are left out)",
          "captionFormal": "$p_L$ against $t$ for $d=3,11,25$ (model, not data), only where $p_{\\mathrm{eff}}<p_{\\mathrm{th}}$",
          "stage": {
            "recipe": "readout-ucurve",
            "params": {
              "rb": 6,
              "rg": 0.3,
              "pg": 0.002,
              "T1": 10,
              "T2": 1,
              "pth": 0.01,
              "A": 0.03,
              "d": 11,
              "view": "logical"
            }
          },
          "claims": [
            {
              "key": "b6TStarD11",
              "text": "the best exposure is 2.95 ms for every distance",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "tStarD"
            },
            {
              "key": "b6Amp2tstarD3",
              "text": "missing the best time by a factor of two costs 1.70 at d = 3",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 3
                }
              },
              "value": "amp2"
            },
            {
              "key": "b6Amp2tstarD11",
              "text": "missing the best time by a factor of two costs 4.90 at d = 11",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "amp2"
            },
            {
              "key": "b6PLStarD11M",
              "text": "the logical error at the best time for d = 11 is 1.065e-4 (mantissa)",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "pLStarM"
            },
            {
              "key": "b6PLStarD11E",
              "text": "the logical error at the best time for d = 11 is 1.065e-4 (exponent)",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "pLStarE"
            },
            {
              "key": "b6PLAt10msD11M",
              "text": "the logical error at 10 ms for d = 11 is 4.267e-3 (mantissa)",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "pLAt10M"
            },
            {
              "key": "b6PLAt10msD11E",
              "text": "the logical error at 10 ms for d = 11 is 4.267e-3 (exponent)",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "pLAt10E"
            },
            {
              "key": "b6Peff1OverPth",
              "text": "at 1 ms the total error is 2.97 times the threshold",
              "from": {
                "recipe": "readout-ucurve",
                "params": {
                  "rb": 6,
                  "rg": 0.3,
                  "pg": 0.002,
                  "T1": 10,
                  "T2": 1,
                  "pth": 0.01,
                  "A": 0.03,
                  "d": 11
                }
              },
              "value": "peff1OverPth"
            }
          ],
          "trail": [
            {
              "ref": "gdf25",
              "at": "Section 7.2, page 12",
              "why": "An intermediate readout of about 4 ms gives the best logical error rate; at longer times the gains from accuracy are outweighed by idling errors."
            }
          ]
        },
        {
          "id": "b6-ucurve:b5",
          "phase": "clue",
          "text": "(a) What is the exponent for d = 9? (b) By what factor does the logical error grow when the total error doubles at d = 5? (c) A vote of 3 guards has each wrong with chance 0.2. What is the chance the vote fails?",
          "formal": "(a) Find the exponent $(d+1)/2$ for $d=9$. (b) Find the factor $2^k$ by which $p_L$ grows when $p_{\\mathrm{eff}}$ doubles at $d=5$. (c) Find the failure of a vote of 3 copies with $p=0.2$.",
          "caption": "the clue vote",
          "captionFormal": "a vote of three copies, $p=0.2$",
          "stage": {
            "recipe": "fault-counts",
            "params": {
              "d": 3,
              "p": 0.2
            }
          },
          "claims": [
            {
              "key": "b6ClueInP",
              "text": "the clue fault chance is 0.2",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 3,
                  "p": 0.2
                }
              },
              "value": "p"
            }
          ],
          "reveal": {
            "text": "The exponent is 5. The factor is 8, because the exponent is 3 and 2 to the 3 is 8. The vote fails with chance 0.104.",
            "formal": "$k=(9+1)/2=5$; $2^{3}=8$ at $d=5$; $P=3p^2(1-p)+p^3=0.104$.",
            "claims": [
              {
                "key": "b6ClueExp9",
                "text": "the exponent at d = 9 is 5",
                "from": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 9,
                    "p": 0.001
                  }
                },
                "value": "k"
              },
              {
                "key": "b6ClueAmp5",
                "text": "the factor at d = 5 is 8",
                "from": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 5,
                    "p": 0.001
                  }
                },
                "value": "doubling"
              },
              {
                "key": "b6ClueVote",
                "text": "the vote of three fails with chance 0.104",
                "from": {
                  "recipe": "fault-counts",
                  "params": {
                    "d": 3,
                    "p": 0.2
                  }
                },
                "value": "exact"
              }
            ]
          }
        },
        {
          "id": "b6-ucurve:b6",
          "phase": "deeper",
          "text": "Rates may differ from place to place. Then the leading term is a sum over choices of faults. Take 5 places at 0.001 and 6 at 0.005, and a failure that needs 6 faults. The leading term is 2.300 × 10⁻¹³, the bound from the average rate is 4.794 × 10⁻¹³, and the exact failure is 2.278 × 10⁻¹³. The leading term is 0.480 of the bound. So an average rate gives a bound, not the answer. Our toy adds its three rates, which is a simplification. The lecture P2 reads the paper's own Fig. 14.",
          "formal": "With $n$ places of unequal rates the leading term is the elementary symmetric polynomial $e_k(p_1,\\dots,p_n)$, bounded by $\\binom nk\\bar p^{\\,k}$ (Maclaurin), with equality for equal rates. For 5 places at $0.001$ and 6 at $0.005$, $k=6$: $e_6=2.300\\times10^{-13}$, the bound is $4.794\\times10^{-13}$ (ratio $0.480$) and the exact failure is $2.278\\times10^{-13}$. Using the mean rate is therefore a bound, not the model; our toy $p_{\\mathrm{eff}}$ adds three rates and is labelled so. P2 reads the paper's Fig. 14.",
          "caption": "three numbers for unequal rates (toy rates)",
          "captionFormal": "$e_6$, Maclaurin bound and exact failure, 5 places at $0.001$ and 6 at $0.005$",
          "stage": {
            "recipe": "fault-counts",
            "params": {
              "d": 11,
              "p": 0.001,
              "view": "mixed",
              "mixed": {
                "n1": 5,
                "p1": 0.001,
                "n2": 6,
                "p2": 0.005
              }
            }
          },
          "claims": [
            {
              "key": "b6InP2",
              "text": "the higher fault chance is 0.005",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001,
                  "view": "mixed",
                  "mixed": {
                    "n1": 5,
                    "p1": 0.001,
                    "n2": 6,
                    "p2": 0.005
                  }
                }
              },
              "value": "p2"
            },
            {
              "key": "b6E6M",
              "text": "the leading term for mixed rates is 2.300e-13 (mantissa)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001,
                  "view": "mixed",
                  "mixed": {
                    "n1": 5,
                    "p1": 0.001,
                    "n2": 6,
                    "p2": 0.005
                  }
                }
              },
              "value": "eKM"
            },
            {
              "key": "b6E6E",
              "text": "the leading term for mixed rates is 2.300e-13 (exponent)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001,
                  "view": "mixed",
                  "mixed": {
                    "n1": 5,
                    "p1": 0.001,
                    "n2": 6,
                    "p2": 0.005
                  }
                }
              },
              "value": "eKE"
            },
            {
              "key": "b6MaclaurinBoundM",
              "text": "the bound from the mean rate is 4.794e-13 (mantissa)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001,
                  "view": "mixed",
                  "mixed": {
                    "n1": 5,
                    "p1": 0.001,
                    "n2": 6,
                    "p2": 0.005
                  }
                }
              },
              "value": "boundM"
            },
            {
              "key": "b6MaclaurinBoundE",
              "text": "the bound from the mean rate is 4.794e-13 (exponent)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001,
                  "view": "mixed",
                  "mixed": {
                    "n1": 5,
                    "p1": 0.001,
                    "n2": 6,
                    "p2": 0.005
                  }
                }
              },
              "value": "boundE"
            },
            {
              "key": "b6MaclaurinRatio",
              "text": "the leading term is 0.480 of the bound",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001,
                  "view": "mixed",
                  "mixed": {
                    "n1": 5,
                    "p1": 0.001,
                    "n2": 6,
                    "p2": 0.005
                  }
                }
              },
              "value": "boundRatio"
            },
            {
              "key": "b6MixedExactM",
              "text": "the exact failure is 2.278e-13 (mantissa)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001,
                  "view": "mixed",
                  "mixed": {
                    "n1": 5,
                    "p1": 0.001,
                    "n2": 6,
                    "p2": 0.005
                  }
                }
              },
              "value": "mixedExactM"
            },
            {
              "key": "b6MixedExactE",
              "text": "the exact failure is 2.278e-13 (exponent)",
              "from": {
                "recipe": "fault-counts",
                "params": {
                  "d": 11,
                  "p": 0.001,
                  "view": "mixed",
                  "mixed": {
                    "n1": 5,
                    "p1": 0.001,
                    "n2": 6,
                    "p2": 0.005
                  }
                }
              },
              "value": "mixedExactE"
            }
          ]
        }
      ],
      "review": {
        "points": [
          "A longer reading is more accurate but leaves the atoms waiting, so the total has a lowest point.",
          "A failure needs more than half of d guards wrong: the exponent is (d+1)/2.",
          "The best time does not depend on d; the cost of missing it does."
        ],
        "equations": "p_{\\mathrm{eff}}(t)=p_g+p_{\\mathrm{idle}}(t)+p_m(t),\\quad p_L\\approx A\\Bigl(\\frac{p_{\\mathrm{eff}}}{p_{\\mathrm{th}}}\\Bigr)^{(d+1)/2}",
        "trap": "Reading our best time as a match to the paper's 4 ms: it is a property of toy inputs.",
        "formal": {
          "points": [
            "$t^*=\\arg\\min_t p_{\\mathrm{eff}}(t)$ is independent of $d$ because $p_L$ is increasing in $p_{\\mathrm{eff}}$.",
            "The cheapest failing fault set has $(d+1)/2$ faults; the number of them is $\\binom{d}{(d+1)/2}$.",
            "The formula holds only where p_eff is below p_th; unequal rates give e_k, at most the Maclaurin bound."
          ],
          "equations": "p_L\\approx A\\Bigl(\\frac{p_{\\mathrm{eff}}}{p_{\\mathrm{th}}}\\Bigr)^{(d+1)/2},\\quad e_k\\le\\binom nk\\bar p^{\\,k}",
          "trap": "Applying the scaling formula where p_eff is above the threshold."
        }
      },
      "play": [
        {
          "id": "b6-u-exp",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "The exponent",
          "prompt": "What is the exponent (d + 1)/2 of the logical error for d = 15?",
          "answerFrom": {
            "from": {
              "recipe": "fault-counts",
              "params": {
                "d": 15,
                "p": 0.001
              }
            },
            "value": "k"
          },
          "tolerance": 0,
          "hints": [
            {
              "text": "Add 1 to d."
            },
            {
              "text": "Then halve."
            },
            {
              "text": "15 + 1 = 16."
            }
          ],
          "walkthrough": [
            {
              "text": "(15 + 1)/2 = 8."
            },
            {
              "text": "Eight wrong guards are the fewest that fail a vote of 15."
            },
            {
              "text": "The exponent is 8."
            }
          ]
        },
        {
          "id": "b6-u-amp",
          "kind": "numeric",
          "tier": "core",
          "title": "Doubling the error",
          "prompt": "At d = 7 the total error p_eff doubles. By what factor does the logical error grow?",
          "answerFrom": {
            "from": {
              "recipe": "fault-counts",
              "params": {
                "d": 7,
                "p": 0.001
              }
            },
            "value": "doubling"
          },
          "tolerance": 0,
          "hints": [
            {
              "text": "The logical error goes as p_eff to the power (d + 1)/2."
            },
            {
              "text": "Find the exponent for d = 7."
            },
            {
              "text": "Doubling p_eff multiplies by 2 to that power."
            }
          ],
          "walkthrough": [
            {
              "text": "The exponent is (7 + 1)/2 = 4."
            },
            {
              "text": "Doubling the base multiplies by 2^4."
            },
            {
              "text": "The factor is 16."
            }
          ]
        },
        {
          "id": "b6-u-rep",
          "kind": "numeric",
          "tier": "core",
          "title": "A vote of three",
          "prompt": "Three guards each go wrong with chance 0.1, and the vote fails when two or more are wrong. What is the failure chance?",
          "answerFrom": {
            "from": {
              "recipe": "fault-counts",
              "params": {
                "d": 3,
                "p": 0.1
              }
            },
            "value": "exact"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Count the patterns with exactly two wrong, and the pattern with three wrong."
            },
            {
              "text": "Exactly two wrong: 3 ways, each 0.1² × 0.9."
            },
            {
              "text": "Three wrong: 0.1³."
            }
          ],
          "walkthrough": [
            {
              "text": "Two wrong: 3 × 0.01 × 0.9 = 0.027."
            },
            {
              "text": "Three wrong: 0.001."
            },
            {
              "text": "The total is 0.028."
            }
          ]
        }
      ],
      "pitfalls": [
        "Reading the best time off a plot of the reading error alone: the waiting error moves it."
      ]
    },
    {
      "id": "b6-pipelining",
      "title": "Hiding the classical work",
      "question": "When does overlapping classification with the next round shorten a run?",
      "source": {
        "summary": "The paper overlaps the classification of one round with the gates and image acquisition of the next. Classification is then paid only after the last round. Its Eqs. 4 and 5 give the run time without and with the overlap; here they appear in a generic form.",
        "where": "GANDALF §5.3, p. 11, Fig. 11, Eqs. 4–5"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "pipeline-bench"
        },
        "tryThis": [
          "Make the classification slower than a round of gates and camera. The overlapped total starts to grow with c, and the saving stops growing.",
          "Set d to 1. With a single round there is nothing to overlap and the two totals agree."
        ]
      },
      "insight": "Overlapping hides the classification of each round behind the next round. Only the last classification adds time, unless the classifier is slower than a round.",
      "insightFormal": "T_pipe = (g + r) + c + (d − 1) max(g + r, c) against T_serial = d (g + r + c). The saving is (d − 1) min(c, g + r), so it grows with c only up to c = g + r.",
      "claims": [
        {
          "key": "b6InD11",
          "text": "the number of rounds is 11",
          "from": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 11,
              "g": 0.02,
              "r": 2,
              "c": 0.5
            }
          },
          "value": "d"
        },
        {
          "key": "b6InG",
          "text": "the gate time input is 0.02 ms (ours)",
          "from": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 11,
              "g": 0.02,
              "r": 2,
              "c": 0.5
            }
          },
          "value": "g"
        },
        {
          "key": "b6InR",
          "text": "the camera time input is 2 ms (ours)",
          "from": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 11,
              "g": 0.02,
              "r": 2,
              "c": 0.5
            }
          },
          "value": "r"
        },
        {
          "key": "b6InC",
          "text": "the classification time input is 0.5 ms (ours)",
          "from": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 11,
              "g": 0.02,
              "r": 2,
              "c": 0.5
            }
          },
          "value": "c"
        }
      ],
      "story": [
        {
          "id": "b6-pipelining:b1",
          "phase": "books",
          "text": "In the plain schedule each step waits for the one before: read, classify, then start the next round. For d rounds the time is d × (g + r + c), with gates g, camera r and classification c. With d = 11, g = 0.02 ms, r = 2 ms and c = 0.5 ms the run takes 27.72 ms.",
          "formal": "One after another, $T_{\\mathrm{serial}}=d(g+r+c)$, the generic form of the paper's Eq. 4. With $d=11$, $g=0.02$ ms, $r=2$ ms and $c=0.5$ ms the run takes $27.72$ ms.",
          "caption": "the plain schedule: gates and camera in one lane, classification in another (toy times)",
          "captionFormal": "$d=11$ rounds, each waiting for the classification before it (illustrative times)",
          "stage": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 11,
              "g": 0.02,
              "r": 2,
              "c": 0.5,
              "view": "serial"
            }
          },
          "claims": [
            {
              "key": "b6Serial",
              "text": "the plain run takes 27.72 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 11,
                  "g": 0.02,
                  "r": 2,
                  "c": 0.5
                }
              },
              "value": "serial"
            }
          ]
        },
        {
          "id": "b6-pipelining:b2",
          "phase": "books",
          "text": "Overlap the classical work. Classify round k while round k + 1 is already being gated and photographed. Only the last classification adds time. The same inputs now give 22.72 ms, which saves 5.00 ms. This is a [[pp-pipelined|pipelined]] schedule.",
          "formal": "With the classification of round $k$ overlapping the gates and acquisition of round $k+1$, $T_{\\mathrm{pipe}}=(g+r)+c+(d-1)\\max(g+r,c)$. The same inputs give $22.72$ ms, a saving of $(d-1)c=5.00$ ms; an event simulation of the schedule agrees. A [[pp-pipelined|pipelined]] run hides the classification behind the camera.",
          "caption": "plain and overlapped schedules (toy times)",
          "captionFormal": "the two schedules on one time axis, with the saving (illustrative times)",
          "stage": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 11,
              "g": 0.02,
              "r": 2,
              "c": 0.5,
              "view": "both"
            }
          },
          "introduces": [
            "pp-pipelined"
          ],
          "derivation": {
            "result": "T_{\\mathrm{pipe}}=(g+r)+c+(d-1)\\max(g+r,c)",
            "ground": [
              {
                "tex": "\\text{photograph }k\\text{ is done at }k\\,(g+r)",
                "why": "Round k is gated and photographed in time g plus r, back to back with the other rounds.",
                "view": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 11,
                    "g": 0.02,
                    "r": 2,
                    "c": 0.5,
                    "view": "pipelined"
                  }
                },
                "viewCaption": "rows of the schedule"
              },
              {
                "tex": "\\text{job }k\\text{ ends at }\\max\\bigl(k(g+r),\\ \\text{end of job }k-1\\bigr)+c",
                "why": "The classifier starts when the photograph is done and the previous job is finished; each job lasts c.",
                "view": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 7,
                    "g": 0.02,
                    "r": 2,
                    "c": 0.5,
                    "view": "pipelined"
                  }
                },
                "viewCaption": "seven rounds"
              },
              {
                "tex": "T_{\\mathrm{pipe}}=(g+r)+c+(d-1)\\max(g+r,c)",
                "why": "All rounds are done when the last job finishes.",
                "view": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 11,
                    "g": 0.02,
                    "r": 2,
                    "c": 0.5,
                    "view": "vsC"
                  }
                },
                "viewCaption": "time against classifier time"
              }
            ],
            "formal": [
              {
                "tex": "t^{\\mathrm{acq}}_k=k\\,(g+r)",
                "why": "Acquisition k ends at k times g plus r.",
                "view": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 11,
                    "g": 0.02,
                    "r": 2,
                    "c": 0.5,
                    "view": "pipelined"
                  }
                },
                "viewCaption": "rows of the schedule"
              },
              {
                "tex": "t^{\\mathrm{cls}}_k=\\max\\bigl(t^{\\mathrm{acq}}_k,\\ t^{\\mathrm{cls}}_{k-1}\\bigr)+c",
                "why": "Job k starts after its acquisition and after job k − 1.",
                "view": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 7,
                    "g": 0.02,
                    "r": 2,
                    "c": 0.5,
                    "view": "pipelined"
                  }
                },
                "viewCaption": "seven rounds"
              },
              {
                "tex": "T=t^{\\mathrm{cls}}_d=(g+r)+c+(d-1)\\max(g+r,c)",
                "why": "Induction gives the closed form; the saving over the plain schedule is (d − 1)c when c ≤ g + r.",
                "view": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 11,
                    "g": 0.02,
                    "r": 2,
                    "c": 0.5,
                    "view": "vsC"
                  }
                },
                "viewCaption": "time against classifier time"
              }
            ]
          },
          "claims": [
            {
              "key": "b6Pipe",
              "text": "the overlapped run takes 22.72 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 11,
                  "g": 0.02,
                  "r": 2,
                  "c": 0.5
                }
              },
              "value": "pipe"
            },
            {
              "key": "b6Saving",
              "text": "overlap saves 5.00 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 11,
                  "g": 0.02,
                  "r": 2,
                  "c": 0.5
                }
              },
              "value": "saving"
            }
          ]
        },
        {
          "id": "b6-pipelining:b3",
          "phase": "books",
          "text": "If classification is slower than a round of gates and camera, it becomes the bottleneck and a queue builds up. The pipeline then runs at one round per classification time. With r = 0.3 ms and c = 0.5 ms the plain run takes 9.02 ms and the overlapped run 5.82 ms. The saving stops growing once c reaches g + r, here 0.32 ms.",
          "formal": "For $c>g+r$ the classifier is the bottleneck and $T_{\\mathrm{pipe}}=(g+r)+dc$. With $r=0.3$ ms: plain $9.02$ ms, overlapped $5.82$ ms. The saving is $(d-1)\\min(c,g+r)$, so it stops growing at $c=g+r=0.32$ ms.",
          "caption": "total time against the classification time (toy times)",
          "captionFormal": "$T_{\\mathrm{serial}}$ and $T_{\\mathrm{pipe}}$ against $c$, with $r=0.3$ ms",
          "stage": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 11,
              "g": 0.02,
              "r": 0.3,
              "c": 0.5,
              "view": "vsC"
            }
          },
          "claims": [
            {
              "key": "b6InRSlow",
              "text": "the camera time of this example is 0.3 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 11,
                  "g": 0.02,
                  "r": 0.3,
                  "c": 0.5
                }
              },
              "value": "r"
            },
            {
              "key": "b6SerialSlow",
              "text": "the plain run takes 9.02 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 11,
                  "g": 0.02,
                  "r": 0.3,
                  "c": 0.5
                }
              },
              "value": "serial"
            },
            {
              "key": "b6PipeSlowClassifier",
              "text": "the overlapped run takes 5.82 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 11,
                  "g": 0.02,
                  "r": 0.3,
                  "c": 0.5
                }
              },
              "value": "pipe"
            },
            {
              "key": "b6BreakEvenSlow",
              "text": "the saving stops growing at c = 0.32 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 11,
                  "g": 0.02,
                  "r": 0.3,
                  "c": 0.5
                }
              },
              "value": "breakEven"
            }
          ]
        },
        {
          "id": "b6-pipelining:b4",
          "phase": "books",
          "text": "Overlap needs two things. The next round's gates must not wait for the result, which a Pauli frame allows. And the reload of a lost atom must wait one round, which the next unit discusses. The paper's Eq. 5 is this formula with c equal to the denoising plus classification time, when that is shorter than g + r. In our first example the camera stays the bottleneck until c passes 2.02 ms.",
          "formal": "Overlap needs the next round's gates not to depend on this round's classification (decoding is deferred through the Pauli frame, <<pp-b1-spacetime|B1>>) and the reload of an atom deferred by one round. The paper's Eq. 5, $d(t_r+t_g)+(t_{\\mathrm{den}}+t_c)$, is $T_{\\mathrm{pipe}}$ with $c=t_{\\mathrm{den}}+t_c$ when $c\\le g+r$; in our first example that holds up to $c=2.02$ ms. The lecture P2 reads the paper's own numbers.",
          "caption": "the same totals for the first example",
          "captionFormal": "$T_{\\mathrm{serial}}$ and $T_{\\mathrm{pipe}}$ against $c$ for $g=0.02$, $r=2$ ms",
          "stage": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 11,
              "g": 0.02,
              "r": 2,
              "c": 0.5,
              "view": "vsC"
            }
          },
          "claims": [
            {
              "key": "b6BreakEvenC",
              "text": "in the first example c may reach 2.02 ms before the classifier is the bottleneck",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 11,
                  "g": 0.02,
                  "r": 2,
                  "c": 0.5
                }
              },
              "value": "breakEven"
            }
          ],
          "reported": [
            {
              "id": "gdf-eq4",
              "text": "Eq. 4: the time of one unpipelined round, repeated d times",
              "value": "t_gate + t_readout + t_classification",
              "source": "paper-gdf",
              "at": {
                "kind": "equation",
                "label": "4",
                "page": 11
              }
            },
            {
              "id": "gdf-eq5a",
              "text": "Eq. 5, first term: d rounds of readout and gates",
              "value": "d × (t_readout + t_gate)",
              "source": "paper-gdf",
              "at": {
                "kind": "equation",
                "label": "5",
                "page": 11
              }
            },
            {
              "id": "gdf-eq5b",
              "text": "Eq. 5, second term: paid once after the last round",
              "value": "(t_denoise + t_classification)",
              "source": "paper-gdf",
              "at": {
                "kind": "equation",
                "label": "5",
                "page": 11
              }
            }
          ],
          "trail": [
            {
              "ref": "gdf25",
              "at": "Section 5.3, page 11",
              "why": "Classification is pipelined with acquisition: reload is deferred by one round, so classification overlaps the next measurement and only the last one is paid."
            }
          ]
        },
        {
          "id": "b6-pipelining:b5",
          "phase": "clue",
          "text": "For d = 7 rounds with g = 0.02 ms, r = 0.5 ms and c = 0.2 ms, find the plain and the overlapped totals. Then let c = 1 ms and find the overlapped total. At what c does the saving stop growing?",
          "formal": "For $d=7$, $g=0.02$ ms, $r=0.5$ ms and $c=0.2$ ms find $T_{\\mathrm{serial}}$ and $T_{\\mathrm{pipe}}$; then $T_{\\mathrm{pipe}}$ for $c=1$ ms, and the $c$ at which the saving stops growing.",
          "caption": "the clue schedule",
          "captionFormal": "seven rounds with the clue times",
          "stage": {
            "recipe": "pipeline-schedule",
            "params": {
              "d": 7,
              "g": 0.02,
              "r": 0.5,
              "c": 0.2,
              "view": "pipelined",
              "quiet": true
            }
          },
          "claims": [
            {
              "key": "b6ClueInR",
              "text": "the clue camera time is 0.5 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 7,
                  "g": 0.02,
                  "r": 0.5,
                  "c": 0.2
                }
              },
              "value": "r"
            },
            {
              "key": "b6ClueInC",
              "text": "the clue classification time is 0.2 ms",
              "from": {
                "recipe": "pipeline-schedule",
                "params": {
                  "d": 7,
                  "g": 0.02,
                  "r": 0.5,
                  "c": 0.2
                }
              },
              "value": "c"
            }
          ],
          "reveal": {
            "caption": "the clue schedule, plain and overlapped",
            "captionFormal": "seven rounds, one after another and overlapped",
            "stage": {
              "recipe": "pipeline-schedule",
              "params": {
                "d": 7,
                "g": 0.02,
                "r": 0.5,
                "c": 0.2
              }
            },
            "text": "The plain run takes 5.04 ms and the overlapped run 3.84 ms. With c = 1 ms the overlapped run takes 7.52 ms. The saving stops growing at c = 0.52 ms.",
            "formal": "$T_{\\mathrm{serial}}=7(g+r+c)=5.04$; $T_{\\mathrm{pipe}}=(g+r)+c+6(g+r)=3.84$; at $c=1$: $(g+r)+c+6c=7.52$; the saving stops growing at $c=g+r=0.52$ ms.",
            "claims": [
              {
                "key": "b6ClueSerial",
                "text": "the plain run takes 5.04 ms",
                "from": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 7,
                    "g": 0.02,
                    "r": 0.5,
                    "c": 0.2
                  }
                },
                "value": "serial"
              },
              {
                "key": "b6CluePipe",
                "text": "the overlapped run takes 3.84 ms",
                "from": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 7,
                    "g": 0.02,
                    "r": 0.5,
                    "c": 0.2
                  }
                },
                "value": "pipe"
              },
              {
                "key": "b6CluePipeSlow",
                "text": "with c = 1 ms the overlapped run takes 7.52 ms",
                "from": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 7,
                    "g": 0.02,
                    "r": 0.5,
                    "c": 1
                  }
                },
                "value": "pipe"
              },
              {
                "key": "b6ClueBreakEven",
                "text": "the saving stops growing at 0.52 ms",
                "from": {
                  "recipe": "pipeline-schedule",
                  "params": {
                    "d": 7,
                    "g": 0.02,
                    "r": 0.5,
                    "c": 0.2
                  }
                },
                "value": "breakEven"
              }
            ]
          }
        }
      ],
      "review": {
        "points": [
          "Plain: every step waits for the one before, d times (g + r + c).",
          "Overlapped: classify one round while the next is photographed; only the last classification adds time.",
          "A classifier slower than a round becomes the bottleneck."
        ],
        "equations": "T_{\\mathrm{serial}}=d(g+r+c),\\quad T_{\\mathrm{pipe}}=(g+r)+c+(d-1)\\max(g+r,c)",
        "trap": "Assuming overlap always saves (d − 1) c: it saves (d − 1) min(c, g + r).",
        "formal": {
          "points": [
            "The closed form follows from $t^{\\mathrm{cls}}_k=\\max(t^{\\mathrm{acq}}_k,t^{\\mathrm{cls}}_{k-1})+c$ by induction.",
            "The paper's Eq. 5 is the generic total with c equal to the denoising plus classification time, when that is at most g + r.",
            "Overlap needs deferred decoding (the Pauli frame) and a reload deferred by one round."
          ],
          "equations": "T_{\\mathrm{serial}}-T_{\\mathrm{pipe}}=(d-1)\\min(c,g+r)",
          "trap": "Using Eq. 5 when the classifier is slower than a round."
        }
      },
      "play": [
        {
          "id": "b6-p-ser",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "The plain schedule",
          "prompt": "There are d = 9 rounds with g = 0.01 ms, r = 1 ms and c = 0.4 ms, each waiting for the one before. What is the total, in ms?",
          "answerFrom": {
            "from": {
              "recipe": "pipeline-schedule",
              "params": {
                "d": 9,
                "g": 0.01,
                "r": 1,
                "c": 0.4
              }
            },
            "value": "serial"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Add the three times of one round."
            },
            {
              "text": "g + r + c = 1.41 ms."
            },
            {
              "text": "Multiply by 9."
            }
          ],
          "walkthrough": [
            {
              "text": "One round takes 0.01 + 1 + 0.4 = 1.41 ms."
            },
            {
              "text": "Nine rounds take 9 × 1.41."
            },
            {
              "text": "That is 12.69 ms."
            }
          ]
        },
        {
          "id": "b6-p-pipe",
          "kind": "numeric",
          "tier": "core",
          "title": "The overlapped schedule",
          "prompt": "The same inputs, but classification overlaps the next round. What is the total, in ms?",
          "answerFrom": {
            "from": {
              "recipe": "pipeline-schedule",
              "params": {
                "d": 9,
                "g": 0.01,
                "r": 1,
                "c": 0.4
              }
            },
            "value": "pipe"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Compare c with g + r."
            },
            {
              "text": "c = 0.4 is below g + r = 1.01, so the camera sets the pace."
            },
            {
              "text": "T = (g + r) + c + (d − 1)(g + r)."
            }
          ],
          "walkthrough": [
            {
              "text": "g + r = 1.01 ms and c = 0.4 ms is smaller."
            },
            {
              "text": "T = 1.01 + 0.4 + 8 × 1.01."
            },
            {
              "text": "That is 9.49 ms."
            }
          ]
        },
        {
          "id": "b6-p-slow",
          "kind": "numeric",
          "tier": "stretch",
          "title": "A slow classifier",
          "prompt": "Now c = 1.5 ms, with everything else as before. What is the overlapped total, in ms?",
          "answerFrom": {
            "from": {
              "recipe": "pipeline-schedule",
              "params": {
                "d": 9,
                "g": 0.01,
                "r": 1,
                "c": 1.5
              }
            },
            "value": "pipe"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Compare c with g + r again."
            },
            {
              "text": "Now c is larger, so the classifier sets the pace."
            },
            {
              "text": "T = (g + r) + c + (d − 1) c."
            }
          ],
          "walkthrough": [
            {
              "text": "g + r = 1.01 ms is below c = 1.5 ms."
            },
            {
              "text": "T = 1.01 + 1.5 + 8 × 1.5."
            },
            {
              "text": "That is 14.51 ms."
            }
          ]
        }
      ],
      "pitfalls": [
        "Believing that a faster classifier always shortens a pipelined run: once c is below g + r, only the camera and gates matter."
      ]
    },
    {
      "id": "b6-loss-reset",
      "title": "Atoms that leave; reset or not",
      "question": "What changes when a reading has three outcomes, and when can reset be skipped?",
      "source": {
        "summary": "The paper cites work on detecting lost atoms and on skipping reset as the reason a reload can be deferred by one round. Baranes and coauthors use delayed loss detection in the decoder; Gehér and coauthors compare reset and no reset.",
        "where": "GANDALF §5.3; Baranes abstract; Gehér abstract"
      },
      "tryIt": {
        "kind": "optics-bench",
        "props": {
          "preset": "loss-bench"
        },
        "tryThis": [
          "Raise the distance d. The atom count grows as 2d² − 1, so more atoms are lost per round and a loss-free run gets rarer.",
          "Compare the number of faults a vote needs to fail: (d + 1)/2 unknown flips against d known losses."
        ]
      },
      "insight": "A reading can say bright, dark or gone. A lost atom whose place is known costs far less than an unknown flip. Skipping reset trades time for a trace left in the next reading.",
      "insightFormal": "Atom loss is a third outcome and an erasure when its place is known: a distance-d repetition vote fails with d erasures against (d+1)/2 unknown flips. The reset study finds no benefit for memory and a no-reset advantage above about 100 ns and 10^−2.5 in its model.",
      "claims": [
        {
          "key": "b6InLossM",
          "text": "the loss per image input is 1.048e-4 (mantissa)",
          "from": {
            "recipe": "loss-budget",
            "params": {
              "d": 11,
              "loss": 0.0001048,
              "rounds": 11
            }
          },
          "value": "lossM"
        },
        {
          "key": "b6InLossE",
          "text": "the loss per image input is 1.048e-4 (exponent)",
          "from": {
            "recipe": "loss-budget",
            "params": {
              "d": 11,
              "loss": 0.0001048,
              "rounds": 11
            }
          },
          "value": "lossE"
        },
        {
          "key": "b6InSurv",
          "text": "the survival per image is 99.98952 percent",
          "from": {
            "recipe": "loss-budget",
            "params": {
              "d": 11,
              "loss": 0.0001048,
              "rounds": 11
            }
          },
          "value": "survival"
        },
        {
          "key": "b6AtomsD11",
          "text": "a distance-11 patch has 241 atoms",
          "from": {
            "recipe": "loss-budget",
            "params": {
              "d": 11,
              "loss": 0.0001048,
              "rounds": 11
            }
          },
          "value": "atoms"
        }
      ],
      "story": [
        {
          "id": "b6-loss-reset:b1",
          "phase": "books",
          "text": "A reading can say bright, dark or gone. A classifier trained only on bright and dark has no way to say gone, so it calls a lost atom dark. A decoder that is told which atoms were lost can do better, as in the loss-detection work the paper cites. Loss is an [[pp-loss-outcome|outcome of the reading]].",
          "formal": "Loss is an [[pp-loss-outcome|outcome of the reading]] next to bright and dark. A classifier trained on two labels maps a lost atom to dark, so the third outcome has to be added to the labels. Baranes et al. build a decoder that uses a late signal that an atom left, even if when it left is unknown.",
          "caption": "the chance that no atom is lost, against rounds (reported input, our arithmetic)",
          "captionFormal": "$S^{n r}$ against the number of rounds $r$",
          "stage": {
            "recipe": "loss-budget",
            "params": {
              "d": 11,
              "loss": 0.0001048,
              "rounds": 11
            }
          },
          "trail": [
            {
              "ref": "bar25",
              "at": "Abstract",
              "why": "A decoder that uses a late signal that an atom left, even if when it left is unknown."
            }
          ]
        },
        {
          "id": "b6-loss-reset:b2",
          "phase": "books",
          "text": "Our input is the best imaging survival reported on the Optics Lab page on loss: 99.98952 % per image, a loss of 1.048 × 10⁻⁴. A patch of distance 11 has 241 atoms, so 0.0253 atoms are lost per round and 0.278 over 11 rounds. No atom is lost in 11 rounds with chance 0.757. On average one atom leaves every 39.6 rounds.",
          "formal": "Take the survival per image of $99.98952\\%$ from <<pp-o9-loss|the Optics Lab page on loss>>, a loss of $1.048\\times10^{-4}$. A distance-11 patch has $2d^2-1=241$ atoms (<<pp-b1-planar|B1>>), so $n(1-S)=0.0253$ atoms are lost per round and $0.278$ over 11 rounds. The chance of none in 11 rounds is $S^{11n}=0.757$, and one atom is lost per $39.6$ rounds.",
          "caption": "chance of no loss against rounds, distance 11",
          "captionFormal": "$S^{nr}$ against $r$, $n=241$, loss $1.048\\times10^{-4}$",
          "stage": {
            "recipe": "loss-budget",
            "params": {
              "d": 11,
              "loss": 0.0001048,
              "rounds": 11
            }
          },
          "claims": [
            {
              "key": "b6LossPerRound",
              "text": "about 0.0253 atoms are lost per round",
              "from": {
                "recipe": "loss-budget",
                "params": {
                  "d": 11,
                  "loss": 0.0001048,
                  "rounds": 11
                }
              },
              "value": "lossPerRound"
            },
            {
              "key": "b6LossPer11Rounds",
              "text": "about 0.278 atoms are lost over 11 rounds",
              "from": {
                "recipe": "loss-budget",
                "params": {
                  "d": 11,
                  "loss": 0.0001048,
                  "rounds": 11
                }
              },
              "value": "lossOverRounds"
            },
            {
              "key": "b6NoLoss11Rounds",
              "text": "no atom is lost in 11 rounds with chance 0.757",
              "from": {
                "recipe": "loss-budget",
                "params": {
                  "d": 11,
                  "loss": 0.0001048,
                  "rounds": 11
                }
              },
              "value": "noLoss"
            },
            {
              "key": "b6RoundsToOneLoss",
              "text": "one atom is lost per 39.6 rounds",
              "from": {
                "recipe": "loss-budget",
                "params": {
                  "d": 11,
                  "loss": 0.0001048,
                  "rounds": 11
                }
              },
              "value": "roundsToLoss"
            }
          ]
        },
        {
          "id": "b6-loss-reset:b3",
          "phase": "books",
          "text": "If you know which guard is gone, you can still vote with the rest. A vote of d guards with only known losses fails only when all of them are gone, and then it is a coin flip. That chance is half of e to the power d. For d = 5 and e = 0.01 that is 5 × 10⁻¹¹. At d = 11 unknown flips need 6 faults to fail, while known losses need 11. A fault whose place is known is an [[pp-erasure|erasure]].",
          "formal": "A repetition code of $d$ bits with erasure chance $e$ and no other errors fails only when all $d$ bits are erased and the guess is wrong: $e^d/2$, here $5.000\\times10^{-11}$ for $d=5$, $e=0.01$. Unknown flips fail with $(d+1)/2=6$ faults at $d=11$; known [[pp-erasure|erasures]] need all $d=11$. This is standard counting, ours.",
          "caption": "failure chance of a known-place and an unknown-place vote (toy chances)",
          "captionFormal": "$e^d/2$ and the exact vote against $d$ (toy chances)",
          "stage": {
            "recipe": "erasure-vs-error",
            "params": {
              "d": 5,
              "e": 0.01,
              "p": 0.001
            }
          },
          "claims": [
            {
              "key": "b6InE",
              "text": "the erasure chance input is 0.01",
              "from": {
                "recipe": "erasure-vs-error",
                "params": {
                  "d": 5,
                  "e": 0.01,
                  "p": 0.001
                }
              },
              "value": "e"
            },
            {
              "key": "b6ErasureRep5M",
              "text": "the failure at d = 5 and e = 0.01 is 5e-11 (mantissa)",
              "from": {
                "recipe": "erasure-vs-error",
                "params": {
                  "d": 5,
                  "e": 0.01,
                  "p": 0.001
                }
              },
              "value": "erasureM"
            },
            {
              "key": "b6ErasureRep5E",
              "text": "the failure at d = 5 and e = 0.01 is 5e-11 (exponent)",
              "from": {
                "recipe": "erasure-vs-error",
                "params": {
                  "d": 5,
                  "e": 0.01,
                  "p": 0.001
                }
              },
              "value": "erasureE"
            },
            {
              "key": "b6MinFaultsUnknown11",
              "text": "at d = 11 unknown flips need 6 faults",
              "from": {
                "recipe": "erasure-vs-error",
                "params": {
                  "d": 11,
                  "e": 0.01,
                  "p": 0.001
                }
              },
              "value": "minFlip"
            },
            {
              "key": "b6MinFaultsErasure11",
              "text": "at d = 11 known losses need 11",
              "from": {
                "recipe": "erasure-vs-error",
                "params": {
                  "d": 11,
                  "e": 0.01,
                  "p": 0.001
                }
              },
              "value": "minErasure"
            }
          ],
          "trail": [
            {
              "ref": "bar25",
              "at": "Abstract",
              "why": "Loss information from delayed detection is used in decoding; the place of a loss that is known can be treated as an erasure."
            }
          ]
        },
        {
          "id": "b6-loss-reset:b4",
          "phase": "books",
          "text": "Skipping [[pp-reset-reload|reset]] saves time, but a wrong reading can leave a trace in the next one. For a memory, resetting gives no benefit. For logical operations, resetting can halve the time cost, unless reset is slow or noisy. In the study's model no reset wins when reset takes longer than about 100 ns and the physical error is above about 0.003. For atoms a reload takes milliseconds, so that threshold does not carry over. A 1 ms reload would cut the camera's share of the round to 0.454. The paper cites the work as a licence to defer reloads by one round, which is motivation, not proof.",
          "formal": "Gehér et al. find that for memory experiments [[pp-reset-reload|resetting]] gives no benefit. For logical operations unconditional reset can cut the duration by as much as half. No reset is superior above about 100 ns reset duration and a physical error of about $10^{-2.5}\\approx0.003$ in their noise model. That model is superconducting-like: atom reload takes milliseconds (a 1 ms reload cuts $f$ to $0.454$ with our $0.2$ ms move), so the threshold does not transfer. GANDALF cites it, with Baranes et al., as licence to defer reload by one round (§5.3), which is motivation, not proof.",
          "caption": "a round with a one-millisecond reload (our times)",
          "captionFormal": "four 400 ns layers, a 0.2 ms move, a 1 ms exposure and a 1 ms reload (illustrative)",
          "stage": {
            "recipe": "cycle-budget",
            "params": {
              "layers": 4,
              "tGateUs": 0.4,
              "tRead": 1,
              "tMove": 0.2,
              "tReset": 1
            }
          },
          "claims": [
            {
              "key": "b6InMoveReload",
              "text": "the move input of this round is 0.2 ms",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 0.4,
                  "tRead": 1,
                  "tMove": 0.2,
                  "tReset": 1
                }
              },
              "value": "tMove"
            },
            {
              "key": "b6ReadFracReload",
              "text": "with a 1 ms reload the camera is 0.454 of the round",
              "from": {
                "recipe": "cycle-budget",
                "params": {
                  "layers": 4,
                  "tGateUs": 0.4,
                  "tRead": 1,
                  "tMove": 0.2,
                  "tReset": 1
                }
              },
              "value": "readFrac"
            }
          ],
          "reported": [
            {
              "id": "reset-win-time",
              "text": "in their noise model no reset has the advantage beyond a reset duration of",
              "value": "approximately 100 ns",
              "source": "geh25",
              "at": {
                "kind": "text",
                "page": 1
              }
            },
            {
              "id": "reset-win-error",
              "text": "together with a physical error beyond",
              "value": "approximately 10−2.5 ≈ 0.003",
              "source": "geh25",
              "at": {
                "kind": "text",
                "page": 1
              }
            }
          ],
          "trail": [
            {
              "ref": "geh25",
              "at": "Abstract",
              "why": "For memory resetting gives no benefit; for logical operations it can halve the duration, but no reset wins above given reset durations and error rates."
            }
          ]
        },
        {
          "id": "b6-loss-reset:b5",
          "phase": "clue",
          "text": "A distance-5 patch has 49 atoms. If 2 × 10⁻⁴ of the atoms are lost per image, how many are lost in 50 rounds? A vote of 7 guards fails only when all are erased, with chance e = 0.2 each. What is the failure chance, in units of 10⁻⁶?",
          "formal": "A distance-5 patch has $2d^2-1=49$ atoms, each lost with chance $2\\times10^{-4}$ per image: how many are lost in 50 rounds? A repetition vote of 7 copies with erasure chance $e=0.2$ fails with chance $\\frac{e^{7}}{2}$: give it in units of $10^{-6}$.",
          "caption": "the clue inputs",
          "captionFormal": "two sets of inputs",
          "stage": {
            "recipe": "erasure-vs-error",
            "params": {
              "d": 7,
              "e": 0.2,
              "p": 0.001
            }
          },
          "claims": [
            {
              "key": "b6ClueInE",
              "text": "the clue erasure chance is 0.2",
              "from": {
                "recipe": "erasure-vs-error",
                "params": {
                  "d": 7,
                  "e": 0.2,
                  "p": 0.001
                }
              },
              "value": "e"
            }
          ],
          "reveal": {
            "text": "49 atoms times 2 × 10⁻⁴ times 50 rounds gives 0.49 atoms. The vote fails with chance 6.4 × 10⁻⁶.",
            "formal": "$49\\cdot2\\times10^{-4}\\cdot50=0.49$; $\\frac{e^{7}}{2}=6.4\\times10^{-6}$.",
            "claims": [
              {
                "key": "b6ClueAtoms5",
                "text": "a distance-5 patch has 49 atoms",
                "from": {
                  "recipe": "loss-budget",
                  "params": {
                    "d": 5,
                    "loss": 0.0002,
                    "rounds": 50
                  }
                },
                "value": "atoms"
              },
              {
                "key": "b6ClueLoss",
                "text": "the expected losses are 0.49",
                "from": {
                  "recipe": "loss-budget",
                  "params": {
                    "d": 5,
                    "loss": 0.0002,
                    "rounds": 50
                  }
                },
                "value": "lossOverRounds"
              },
              {
                "key": "b6ClueErasure7",
                "text": "the vote fails with chance 6.4 in units of 1e-6",
                "from": {
                  "recipe": "erasure-vs-error",
                  "params": {
                    "d": 7,
                    "e": 0.2,
                    "p": 0.001
                  }
                },
                "value": "erasureMicro"
              }
            ]
          }
        },
        {
          "id": "b6-loss-reset:b6",
          "phase": "deeper",
          "text": "Faster, brighter imaging heats the atoms and raises the chance of losing them. The experiment track weighs this against the reading error with a toy loss rate on <<pp-o11-loss|its page about loss in the exposure>>. This chapter only notes the coupling. The lecture P2 shows (<<pp-p2-pipeline|how the paper hides classification and reload>>) how the paper hides the classification and the reload behind the next round.",
          "formal": "Faster, brighter imaging raises heating and loss, which couples the reading error to the loss rate (experiment track, <<pp-o11-loss|O11>>, with its toy loss model). B6 only notes the coupling. The lecture P2 shows how the paper's pipelined schedule hides classification and a deferred reload behind the next round, and carries the reading error to a logical error (<<pp-p2-logical|from readout error to logical error>>).",
          "caption": "loss accumulates with every image (reported input)",
          "captionFormal": "the chance of no loss against rounds",
          "stage": {
            "recipe": "loss-budget",
            "params": {
              "d": 11,
              "loss": 0.0001048,
              "rounds": 11
            }
          }
        }
      ],
      "review": {
        "points": [
          "A reading can say bright, dark or gone; a classifier with two labels calls a lost atom dark.",
          "A lost atom whose place is known is an erasure and costs far less than an unknown flip.",
          "Skipping reset saves time but may leave a trace; the threshold in the study is for a superconducting-like model."
        ],
        "equations": "\\text{losses per round}=n(1-S),\\quad P(\\text{no loss in }r\\text{ rounds})=S^{nr},\\quad P_{\\text{erasure vote}}=\\frac{e^d}{2}",
        "trap": "Applying the reset study's 100 ns threshold to atoms, whose reload takes milliseconds.",
        "formal": {
          "points": [
            "Atoms in a distance-d patch: 2d² − 1 (as in B1); the loss per image is a reported input.",
            "A repetition vote with erasure chance e fails with e^d/2; unknown flips fail with (d+1)/2 faults.",
            "GANDALF cites the loss and reset papers as licence to defer reload one round: motivation, not proof."
          ],
          "equations": "n=2d^2-1,\\quad \\langle\\text{losses}\\rangle=n(1-S)r,\\quad P_{\\mathrm{fail}}=e^d/2",
          "trap": "Counting a known-place loss as if its place were unknown."
        }
      },
      "play": [
        {
          "id": "b6-l-loss",
          "kind": "numeric",
          "tier": "warm-up",
          "title": "Atoms lost over a run",
          "prompt": "A distance-7 patch has 97 atoms and each is lost with chance 10⁻⁴ per image. How many atoms are lost in 100 rounds, on average?",
          "answerFrom": {
            "from": {
              "recipe": "loss-budget",
              "params": {
                "d": 7,
                "loss": 0.0001,
                "rounds": 100
              }
            },
            "value": "lossOverRounds"
          },
          "tolerance": 0.005,
          "hints": [
            {
              "text": "Count the atoms first."
            },
            {
              "text": "A distance-7 patch has 2 × 49 − 1 atoms."
            },
            {
              "text": "Expected losses are atoms × chance × rounds."
            }
          ],
          "walkthrough": [
            {
              "text": "2 × 49 − 1 = 97 atoms."
            },
            {
              "text": "97 × 10⁻⁴ per round."
            },
            {
              "text": "Over 100 rounds that is 0.97 atoms."
            }
          ]
        },
        {
          "id": "b6-l-erase",
          "kind": "numeric",
          "tier": "core",
          "title": "A failed erasure vote",
          "prompt": "A vote of 5 guards fails only when all are erased, then half the time. Each is erased with chance e = 0.1. What is the failure chance, in units of 10⁻⁶?",
          "answerFrom": {
            "from": {
              "recipe": "erasure-vs-error",
              "params": {
                "d": 5,
                "e": 0.1,
                "p": 0.001
              }
            },
            "value": "erasureMicro"
          },
          "tolerance": 0,
          "hints": [
            {
              "text": "All five must be erased."
            },
            {
              "text": "That has chance e to the power 5."
            },
            {
              "text": "Then multiply by one half."
            }
          ],
          "walkthrough": [
            {
              "text": "0.1⁵ = 10⁻⁵."
            },
            {
              "text": "Half of it is 5 × 10⁻⁶."
            },
            {
              "text": "In units of 10⁻⁶ the answer is 5."
            }
          ]
        },
        {
          "id": "b6-l-min",
          "kind": "choice",
          "tier": "core",
          "title": "How many losses fail the vote",
          "prompt": "In a vote of 7 copies, every lost copy has a known place. How many known losses make the vote fail half the time?",
          "options": [
            {
              "text": "4",
              "correct": false,
              "why": "Four is the number of unknown flips that fail a vote of 7; with known places the rest can still vote."
            },
            {
              "text": "7",
              "correct": true,
              "why": "Only when every copy is lost is there nothing left to vote with, and then the guess is a coin flip."
            },
            {
              "text": "8",
              "correct": false,
              "why": "There are only 7 copies."
            },
            {
              "text": "14",
              "correct": false,
              "why": "There are only 7 copies."
            }
          ],
          "hints": [
            {
              "text": "A known loss does not mislead the vote, it just removes one voter."
            },
            {
              "text": "How many voters are needed to vote at all?"
            },
            {
              "text": "One."
            }
          ],
          "walkthrough": [
            {
              "text": "Known losses remove voters but do not add wrong votes."
            },
            {
              "text": "The vote still works while one copy is left."
            },
            {
              "text": "It fails when all 7 are lost."
            }
          ]
        }
      ],
      "pitfalls": [
        "Treating a lost atom as a wrong reading: its place is known, which makes it cheaper."
      ]
    }
  ]
}
