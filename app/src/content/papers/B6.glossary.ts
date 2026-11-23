/**
 * Background chapter B6 glossary (the Papers section), merged into the lazy papers pack by file name (pack.ts). DATA ONLY, like the spec beside it: one `export const GLOSSARY`
 * literal. Ids start `pp-`; every entry has a Ground-up sentence (`gloss`, at most 25 words) and a Formal one (`formal`, at most 40), paraphrased, and a first use that
 * carries its tag in both tracks. The entries marked `introduces` are the notation beats of the chapter.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    "id": "pp-qec-round",
    "term": "QEC round",
    "gloss": "One pass of checking: gates, a move, the camera, then reset.",
    "formal": "Syndrome generation, readout and reset (and atom moves for atoms).",
    "first": "b6-cycle:b1"
  },
  {
    "id": "pp-readout-fraction",
    "term": "readout fraction",
    "gloss": "The part of a round spent reading.",
    "formal": "$f=t_r/T_{\\mathrm{round}}$: the exposure over the whole round.",
    "first": "b6-cycle:b3",
    "introduces": "notation"
  },
  {
    "id": "pp-idle-error",
    "term": "idle error",
    "gloss": "Damage done to an atom while it waits.",
    "formal": "A Pauli channel built from T₁ and T₂ over the wait.",
    "first": "b6-twirl:b1"
  },
  {
    "id": "pp-t1-t2",
    "term": "T₁, T₂",
    "gloss": "The two clocks of relaxation and of phase memory.",
    "formal": "Decay of the Bloch $z$ by $e^{-t/T_1}$ and of $x$, $y$ by $e^{-t/T_2}$.",
    "first": "b6-twirl:b1"
  },
  {
    "id": "pp-pauli-twirl",
    "term": "Pauli twirl",
    "gloss": "Replacing an error by the nearest X, Y, Z mix.",
    "formal": "Averaging over Pauli conjugations; it keeps the diagonal of the channel.",
    "first": "b6-twirl:b2",
    "introduces": "notation"
  },
  {
    "id": "pp-meas-error",
    "term": "measurement error",
    "gloss": "A reading that is wrong.",
    "formal": "The classifier error $p_m$; a time-like fault in the circuit-level model.",
    "first": "b6-ucurve:b1"
  },
  {
    "id": "pp-ucurve",
    "term": "U-shaped optimum",
    "gloss": "The total error is smallest at one reading time.",
    "formal": "$t^*=\\arg\\min_t[p_g+p_{\\mathrm{idle}}+p_m]$; independent of the distance.",
    "first": "b6-ucurve:b2",
    "introduces": "notation"
  },
  {
    "id": "pp-fault-exponent",
    "term": "exponent (d+1)/2",
    "gloss": "Failures need more than half the guards wrong.",
    "formal": "The fewest faults that fail a distance-$d$ code, $k=(d+1)/2$ for odd $d$.",
    "first": "b6-ucurve:b3"
  },
  {
    "id": "pp-pipelined",
    "term": "pipelined readout",
    "gloss": "Classifying one round while the next is photographed.",
    "formal": "$T=(g+r)+c+(d-1)\\max(g+r,c)$.",
    "first": "b6-pipelining:b2",
    "introduces": "notation"
  },
  {
    "id": "pp-loss-outcome",
    "term": "loss as an outcome",
    "gloss": "A third reading: the atom is gone.",
    "formal": "An atom that has left is a third result of a readout, beside bright and dark.",
    "first": "b6-loss-reset:b1"
  },
  {
    "id": "pp-erasure",
    "term": "erasure",
    "gloss": "An error whose place is known.",
    "formal": "A fault of known location; a distance-d vote needs d erasures to fail.",
    "first": "b6-loss-reset:b3"
  },
  {
    "id": "pp-reset-reload",
    "term": "reset, reload",
    "gloss": "Returning a helper atom to start, or fetching a new atom.",
    "formal": "Reset of the ancilla; replacement of a lost atom.",
    "first": "b6-loss-reset:b4"
  }
]
