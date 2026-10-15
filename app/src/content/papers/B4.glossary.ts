/**
 * Glossary of the Papers background chapter B4 (magic states and Pauli-based computation). Ids pp-..., both tracks.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'pp-magic-state',
    term: 'magic state',
    gloss: 'A state outside the octahedron of stabilizer states. Used up, it gives a gate that Clifford gates cannot make.',
    formal: 'The state $T|{+}\\rangle=(|0\\rangle+e^{i\\pi/4}|1\\rangle)/\\sqrt2$ and its Clifford orbit of 12 points (BK05 $H$-type): a state with $L^1$ Bloch norm above 1.',
    first: 'b4-beyond-clifford:b2',
    introduces: 'notation',
  },
  {
    id: 'pp-pauli-rotation',
    term: 'Pauli rotation',
    gloss: 'A turn of the state about a Pauli axis, written with the angle in the exponent.',
    formal: '$P(\\varphi)=e^{i\\varphi P/2}$; $\\varphi=\\pm\\pi/2$ is Clifford and $\\varphi=\\pm\\pi/4$ is $T$-like.',
    first: 'b4-pbc:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-pbc',
    term: 'Pauli-based computation',
    gloss: 'A program made only of Pauli rotations and Pauli measurements.',
    formal: 'The Cliffords of a circuit commuted to the end, so $U=C_{\\rm final}\\prod_iP_i(\\pm\\pi/4)$ and the last Clifford only relabels outcomes (BSS16, Lit19a).',
    first: 'b4-pbc:b2',
  },
  {
    id: 'pp-t-count',
    term: 'T-count',
    gloss: 'The number of T gates in a circuit, the cost that is counted.',
    formal: 'The number of $T^{(\\dagger)}$ gates, equal to the number of $T$-like rotations after compiling; a rotation of accuracy $\\varepsilon$ costs about $3\\log_2(1/\\varepsilon)$ (RS16).',
    first: 'b4-pbc:b2',
  },
  {
    id: 'pp-measurement-absorb',
    term: 'a measurement absorbs a turn',
    gloss: 'A quarter turn right after a measurement is the same as another measurement.',
    formal: '$e^{i\\pi Q/4}\\,\\Pi_P^{s}=\\sqrt2\\,\\Pi_W^{+}\\Pi_P^{s}$ for anticommuting $P,Q$ and $W=isQP$.',
    first: 'b4-pbc:b5',
  },
  {
    id: 'pp-t-injection',
    term: 'T injection',
    gloss: 'Making a T-like turn by measuring the data together with a magic state.',
    formal: 'Measure $P\\otimes Z_m$, then $X_m$, on the data and a magic qubit: $P^{[t=-1]}P(-s\\pi/4)$.',
    first: 'b4-injection:b3',
    introduces: 'notation',
  },
  {
    id: 'pp-feed-forward',
    term: 'feed-forward',
    gloss: 'Later steps of a program depend on earlier readings.',
    formal: 'A pending Clifford $F$ changes the next planned axis $B$ into $FBF^\\dagger$.',
    first: 'b4-injection:b4',
  },
  {
    id: 'pp-fifteen-code',
    term: '15-qubit code',
    gloss: 'The code whose transversal T is one logical inverse T.',
    formal: 'The $[\\![15,1,3]\\!]$ Reed-Muller code with $d_X=7$ and $d_Z=3$.',
    first: 'b4-distill:b2',
  },
  {
    id: 'pp-distillation',
    term: '15-to-1 distillation',
    gloss: 'Fifteen noisy magic states in, one better one out.',
    formal: 'Accept iff $H_Xe=0$; the output error is $\\varepsilon_{\\rm out}\\approx35\\varepsilon^3$.',
    first: 'b4-distill:b3',
  },
  {
    id: 'pp-cultivation',
    term: 'cultivation',
    gloss: 'Growing and checking a magic state, and discarding the runs that raise an alarm.',
    formal: 'Injection, repeated checks and an escape onto a surface code, with discards at every stage (GSJ24).',
    first: 'b4-cultivate:b1',
  },
  {
    id: 'pp-postselection',
    term: 'post-selection',
    gloss: 'Throwing away the runs whose checks fired.',
    formal: 'Discarding a run on any detector event or when a confidence measure is low.',
    first: 'b4-cultivate:b1',
  },
  {
    id: 'pp-logical-gap',
    term: 'logical gap',
    gloss: 'How much more likely the decoder\'s answer is than its rival.',
    formal: 'The difference in cost between the best corrections in the two logical classes (Bom22; Gid25 §4).',
    first: 'b4-cultivate:b5',
  },
]
