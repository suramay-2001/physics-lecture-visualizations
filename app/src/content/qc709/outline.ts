/**
 * Physics 709's semester outline (judged map: docs/roles/proposals/P-709-map.md, rulings in
 * docs/roles/decisions/qc709-map.md) arranged as the approved "Cryostat" descent (D-709-identity §6): six plates of a
 * dilution refrigerator, two Parts per plate, colder = later in the course. Foundations and the QM review share the
 * 300 K top flange. The plate is a metaphor for the order of the course: no text may say a topic "happens" at a
 * temperature.
 *
 * Chapter titles and topic lines are P's (paraphrased from the map, never copied from a source); `src` is the map's
 * source line (notes pages / Bergou sections with printed pages). A chapter's `status` is not authored: it is
 * 'built' exactly when the chapter is registered (meta.generated.ts, written by content/meta.test.ts from the files
 * `qc709/Q{n}.ts`), else 'planned'. Adding a chapter therefore never edits this file.
 *
 * Lazy: only 709 pages import this (chunk contract (h): no content/qc709/ in the entry closure).
 */
import { QC_META } from './meta.generated'

export type PlateId = '300K' | '50K' | '4K' | '800mK' | '100mK' | '10mK'
export type PartId = 'F' | 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X' | 'XI'
export type ChapterStatus = 'planned' | 'built'

export interface Plate {
  id: PlateId
  /** As printed on the plate: "800 mK". */
  temp: string
  /** For screen readers: "800 millikelvin". */
  spoken: string
  /** The stage of the refrigerator. */
  name: string
  /** What the course does on this plate (one sentence, D's copy). */
  why: string
  parts: readonly [PartId, PartId]
}

export interface OutlineChapter {
  id: string
  title: string
  /** Ground-up topic line (Foundations): what the chapter covers, in plain words (rich inline: `$…$` TeX). */
  topics?: string
  /** The map's main sources for a Q chapter (notes pages, Bergou sections and printed pages; F chapters draw on many). */
  src?: string
  status: ChapterStatus
}

export interface Part {
  id: PartId
  /** "Part IV" */
  label: string
  title: string
  plate: PlateId
  chapters: readonly OutlineChapter[]
}

export const PLATES: readonly Plate[] = [
  { id: '300K', temp: '300 K', spoken: '300 kelvin', name: 'Top flange', why: 'Room temperature: the maths and the quantum mechanics you arrive with. Spin Lab (448) lives here.', parts: ['F', 'I'] },
  { id: '50K', temp: '50 K', spoken: '50 kelvin', name: 'First pulse-tube stage', why: 'One qubit, then circuits, then states no single ket can describe.', parts: ['II', 'III'] },
  { id: '4K', temp: '4 K', spoken: '4 kelvin', name: 'Second pulse-tube stage', why: 'Pairs that share one state, and what touching a state does to it.', parts: ['IV', 'V'] },
  { id: '800mK', temp: '800 mK', spoken: '800 millikelvin', name: 'Still', why: 'Putting it to work: secret keys and quantum algorithms.', parts: ['VI', 'VII'] },
  { id: '100mK', temp: '100 mK', spoken: '100 millikelvin', name: 'Cold plate', why: 'Machines that process states, and the codes that protect them.', parts: ['VIII', 'IX'] },
  { id: '10mK', temp: '10 mK', spoken: '10 millikelvin', name: 'Mixing chamber', why: 'What a state can carry, and the hardware that sits on this plate.', parts: ['X', 'XI'] },
]

const built = new Set(QC_META.map((m) => m.id))
type Draft = Omit<OutlineChapter, 'status'>
const ch = (id: string, title: string, more: Omit<Draft, 'id' | 'title'> = {}): OutlineChapter => ({ id, title, ...more, status: built.has(id) ? 'built' : 'planned' })

export const PARTS: readonly Part[] = [
  {
    id: 'F',
    label: 'Part F',
    title: 'Foundations',
    plate: '300K',
    chapters: [
      ch('F1', 'Numbers that turn', { topics: 'complex numbers, $e^{i\\varphi}$' }),
      ch('F2', 'Arrows with many parts', { topics: 'vectors, inner products, Gram–Schmidt' }),
      ch('F3', 'Machines that move arrows', { topics: 'matrices, linear maps, change of basis' }),
      ch('F4', 'Special directions', { topics: 'eigen, Hermitian, unitary, spectral theorem' }),
      ch('F5', 'Chance with numbers', { topics: 'probability, averages, spread, surprise' }),
      ch('F6', 'Many at once', { topics: 'tensor and Kronecker products' }),
      ch('F7', 'Bits and logic that can run backwards', { topics: 'Boolean logic, reversibility, GF(2), cost' }),
      ch('F8', 'Hidden rhythms', { topics: 'modular arithmetic, roots of unity, Fourier sums' }),
    ],
  },
  {
    id: 'I',
    label: 'Part I',
    title: 'QM review',
    plate: '300K',
    chapters: [
      ch('Q1', 'Stern–Gerlach and the rules of the game', { src: 'notes L1, pp. 2–5' }),
      ch('Q2', 'Coordinates, bases and turning frames', { src: 'notes L2, pp. 6–10' }),
      ch('Q3', 'Measurement, the Bloch sphere and uncertainty', { src: 'notes L3, pp. 11–17' }),
    ],
  },
  {
    id: 'II',
    label: 'Part II',
    title: 'Qubits and circuits',
    plate: '50K',
    chapters: [
      ch('Q4', 'The qubit, gates and circuits', { src: 'Bergou §1.1–1.3, pp. 1–5' }),
      ch('Q5', 'Deutsch’s trick and interference', { src: 'Bergou §1.4–1.7, pp. 5–10' }),
    ],
  },
  {
    id: 'III',
    label: 'Part III',
    title: 'The density matrix',
    plate: '50K',
    chapters: [
      ch('Q6', 'Ensembles, mixtures and the Bloch ball', { src: 'Bergou §2.1 (ensembles), 2.2–2.4, pp. 15–24' }),
      ch('Q7', 'GHZ and Mermin: certainty without instructions', { src: 'notes L6 pp. 29–32, L7 pp. 33–34; Bergou §3.9, pp. 57–58' }),
    ],
  },
  {
    id: 'IV',
    label: 'Part IV',
    title: 'Entanglement',
    plate: '4K',
    chapters: [
      ch('Q8', 'Entanglement, no signalling and Bell’s inequality', { src: 'Bergou §3.1–3.3, pp. 31–37' }),
      ch('Q9', 'Using entanglement: dense coding, teleportation, swapping', { src: 'Bergou §3.4, pp. 37–40' }),
      ch('Q10', 'Detecting and measuring entanglement', { src: 'Bergou §3.5–3.9, pp. 40–59' }),
    ],
  },
  {
    id: 'V',
    label: 'Part V',
    title: 'Dynamics and measurement',
    plate: '4K',
    chapters: [
      ch('Q11', 'Open-system maps: Kraus operators and impossible machines', { src: 'Bergou Ch. 4, pp. 65–75' }),
      ch('Q12', 'Generalized measurements and telling states apart', { src: 'Bergou Ch. 5, pp. 77–104' }),
    ],
  },
  {
    id: 'VI',
    label: 'Part VI',
    title: 'Cryptography',
    plate: '800mK',
    chapters: [ch('Q13', 'Secret keys from quantum rules', { src: 'Bergou Ch. 6, pp. 105–114' })],
  },
  {
    id: 'VII',
    label: 'Part VII',
    title: 'Algorithms',
    plate: '800mK',
    chapters: [
      ch('Q14', 'One query, many answers: Deutsch–Jozsa and Bernstein–Vazirani', { src: 'Bergou §7.1–7.2, pp. 117–120' }),
      ch('Q15', 'Searching an unsorted list: Grover', { src: 'Bergou §7.3, pp. 120–125' }),
      ch('Q16', 'Hidden periods: Simon, the QFT and phase estimation', { src: 'Bergou §7.4–7.5, pp. 126–130' }),
      ch('Q17', 'Walks, simulation and hybrid algorithms', { src: 'Bergou §7.6–7.8, pp. 130–142' }),
    ],
  },
  {
    id: 'VIII',
    label: 'Part VIII',
    title: 'Machines',
    plate: '100mK',
    chapters: [ch('Q18', 'Quantum machines: cloners, U-NOT, programmable processors', { src: 'Bergou Ch. 8, pp. 145–158' })],
  },
  {
    id: 'IX',
    label: 'Part IX',
    title: 'Error correction',
    plate: '100mK',
    chapters: [
      ch('Q19', 'Protecting qubits from noise', { src: 'Bergou §9.1, §9.3, pp. 161–170, 175–177' }),
      ch('Q20', 'Stabilizers, CSS codes and Gottesman–Knill', { src: 'Bergou §9.2 + Ch. 10, pp. 170–175, 179–187' }),
    ],
  },
  {
    id: 'X',
    label: 'Part X',
    title: 'Information',
    plate: '10mK',
    chapters: [ch('Q21', 'Measuring information: distances, entropies and Holevo', { src: 'Bergou pp. 189–200, 48–51, 26–28' })],
  },
  {
    id: 'XI',
    label: 'Part XI',
    title: 'Hardware',
    plate: '10mK',
    chapters: [
      ch('Q22', 'Controlling a real qubit: Lindblad, Bloch equations, Rabi and Ramsey', { src: 'Bergou Ch. 12, pp. 201–218' }),
      ch('Q23', 'Qubits made of atoms: neutral atoms and trapped ions', { src: 'Bergou Ch. 13, pp. 221–249' }),
      ch('Q24', 'Qubits made of light: photons and linear optics', { src: 'Bergou Ch. 14 + §1.5, pp. 253–267, 7–8' }),
      ch('Q25', 'Qubits in chips: transmons and quantum dots', { src: 'Bergou Ch. 15, pp. 269–298' }),
    ],
  },
]

/** Every chapter in course order (Foundations first, then Q1…Q25). */
export const OUTLINE_CHAPTERS: readonly OutlineChapter[] = PARTS.flatMap((p) => p.chapters)

const partOfChapter = new Map(PARTS.flatMap((p) => p.chapters.map((c) => [c.id.toUpperCase(), p] as const)))

/** Where a chapter sits: its Part and plate (case-insensitive id), or undefined for an id the outline does not list. */
export function placeOf(id: string): { chapter: OutlineChapter; part: Part; plate: Plate } | undefined {
  const part = partOfChapter.get(id.toUpperCase())
  if (!part) return undefined
  const chapter = part.chapters.find((c) => c.id.toUpperCase() === id.toUpperCase())!
  return { chapter, part, plate: PLATES.find((p) => p.id === part.plate)! }
}

export const partsOn = (plate: PlateId): Part[] => PARTS.filter((p) => p.plate === plate)
