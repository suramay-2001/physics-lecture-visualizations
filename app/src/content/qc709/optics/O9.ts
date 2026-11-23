/**
 * Optics Lab page O9: one atom per trap (the experiment track, plan P-optics-experiment-track §4, rulings G1, G3, G5). A run sheet for loading, sorting, refilling and
 * the price of an image, on the array of Manetsch et al. (arXiv:2403.12021v4). The parity law is a MODEL (perfect pair loss) and the refill chances are MODEL INPUTS,
 * both stated; the loading probability 51.2 % and its 3.4 % spread, the 6,139 atoms, the vacuum lifetime and the imaging survival are reported inputs (claims
 * `o9Rep…`, copied as printed: pp. 2, 3, 4). Numbers: keyed claims of O9.values.ts (numpy twin claims_optics/o_track.py). Presets `parity-loading`, `sort-success`
 * and `refill-rounds`. Paraphrased; no text is copied from the paper.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from '../notes/kit'
import { V, claim, d, n0, near } from './O9.values'

export const O9: Lecture = notesLecture({
  collection: 'optics',
  number: 9,
  title: 'One atom per trap',
  book: 'Manetsch et al., a tweezer array of 6100 qubits, arXiv:2403.12021',
  topics: ['why a tweezer loads about half the time', 'how many sites fill a target', 'refilling an array after losses', 'what an image costs in atoms'],
  length: 'full',
  symbols: {
    '\\mu': 'o9-parity:b2',
    'P': 'o9-parity:b2',
    'e': 'o9-parity:b2',
    'N': 'o9-sort:b1',
    'M': 'o9-sort:b1',
    'p': 'o9-sort:b1',
    'q': 'o9-refill:b1',
    '\\epsilon': 'o9-refill:b1',
    '\\tau': 'o9-loss:b1',
    'S': 'o9-loss:b1',
  },
  sections: [
    {
      id: 'o9-parity',
      label: '§1',
      title: 'Why about half',
      pages: 'pp. 2–3',
      summary: 'In a tweezer small enough for collisions, atoms leave in pairs, so a trap ends with one atom or none, and about half the traps are full.',
      body: [
        {
          text: 'The tweezers are loaded from the cooled cloud with a short pulse of red-detuned light. Many tweezers catch more than one atom at first. In a trap this small, two atoms close together are driven apart by a [[qc-op-light-assisted-collision|light-assisted collision]] that gives both enough energy to leave. Set the loading time and the light; measure, with a camera image, which sites hold an atom (Manetsch et al., pp. 2–3). The atom is cesium, with its wavelength, linewidth and mass taken as standard values (Steck, alkali D-line data; NIST), stated here as inputs.',
        },
        {
          text: `Take pairs to leave together without fail. This is a model, and we label it so. An even number of atoms then ends as none and an odd number as one, which is the [[qc-op-parity-projection|parity projection]]. For a Poisson mean $\\mu$ of atoms caught, the chance of one is $P(1)=(1-e^{-2\\mu})/2$. At $\\mu=1$ it is ${d(V.o9P1Mu1, 4)} and the chance of none is ${d(V.o9P0Mu1, 4)}; without collisions the best chance of one atom, at that mean, is only ${d(V.o9PoissonMax, 4)}. At $\\mu=2$ it is ${d(V.o9P1Mu2, 4)}, and at $\\mu=5$ it is ${d(V.o9P1Mu5, 5)}: the model has a ceiling of exactly one half.`,
          claims: [
            claim('o9P1Mu1', 'with pair loss and a mean of one, the chance of one atom is 0.4323', () => near(V.o9P1Mu1, 0.4323, 0.00005)),
            claim('o9P0Mu1', 'the chance of none is 0.5677', () => near(V.o9P0Mu1, 0.5677, 0.00005)),
            claim('o9PoissonMax', 'without collisions the best chance of one atom is 0.3679', () => near(V.o9PoissonMax, 0.3679, 0.00005)),
            claim('o9P1Mu2', 'at a mean of two the chance of one atom is 0.4908', () => near(V.o9P1Mu2, 0.4908, 0.00005)),
            claim('o9P1Mu5', 'at a mean of five the chance of one atom is 0.49998', () => near(V.o9P1Mu5, 0.49998, 0.000005)),
          ],
          figure: {
            stage: { kind: 'plot', series: [{ fn: 'parityP1', params: { mode: 'parity' } }, { fn: 'parityP1', params: { mode: 'poisson' } }] },
            caption: 'The chance of exactly one atom in a trap against the mean number caught, with pair loss and with plain Poisson statistics.',
          },
        },
        {
          text: `What goes wrong is that a real array is not a model. The paper reports that each site loads with a probability of ${d(V.o9RepFill * 100, 1)} %, with a relative spread of ${d(V.o9RepSpread * 100, 1)} % across the sites (Manetsch et al., p. 3). That is just above the ceiling of one half of the model. We print the three numbers together, one computed and two reported, with no verdict: the model takes the loss as perfect, and the real one is not exactly so (<<qc-q8-mixed|the unit on ensembles>>). Try it. Slide the mean number caught.`,
          claims: [
            claim('o9RepFill', 'reported by Manetsch et al., p. 3: each site loads with a probability of 51.2 per cent', () => near(V.o9RepFill, 0.512, 1e-12)),
            claim('o9RepSpread', 'reported by Manetsch et al., p. 3: the relative spread across the sites is 3.4 per cent', () => near(V.o9RepSpread, 0.034, 1e-12)),
          ],
          widget: { kind: 'optics-bench', props: { preset: 'parity-loading' }, caption: 'The chance of one atom in a tweezer with and without pair loss.' },
        },
      ],
    },
    {
      id: 'o9-sort',
      label: '§2',
      title: 'Moving atoms into a target',
      pages: 'pp. 3–33',
      summary: 'A camera image finds the occupied sites and moving tweezers rearrange them, which works whenever at least as many sites are loaded as the target needs.',
      body: [
        {
          text: `After the image comes the [[qc-op-rearrangement|rearrangement]]: moving tweezers pick up atoms and put them down in the sites of a target pattern. A target of $M$ sites can be filled whenever at least $M$ of the $N$ sites are loaded, and with a loading chance $p$ for each site this is a binomial tail. For $M=100$ and the printed chance ${d(V.o9RepFill, 3)}, a chance of 99 per cent needs ${V.o9Sites100} sites; with a chance of exactly one half it needs ${V.o9Sites100p50}.`,
          claims: [
            claim('o9Sites100', 'filling 100 sites with a 99 per cent chance needs 229 sites at the printed loading chance', () => V.o9Sites100 === 229),
            claim('o9Sites100p50', 'at a loading chance of one half it needs 235 sites', () => V.o9Sites100p50 === 235),
            claim('o9RepFill', 'reported by Manetsch et al., p. 3: each site loads with a probability of 51.2 per cent', () => near(V.o9RepFill, 0.512, 1e-12)),
          ],
        },
        {
          text: `The chance rises steeply. With 200 sites the chance to fill the target is ${d(V.o9PCert200, 3)}, and with 220 sites it is ${d(V.o9PCert220, 3)}. A target of 50 sites needs ${V.o9Sites50} sites at the same chance. The array of the paper has about twelve thousand sites. At the printed chance it holds about ${n0(V.o9ExpAtoms)} atoms on average, next to the 6,139 the paper reports (p. 2). That is a number to count on, not a chance to hope for (<<qc-o-q25-atom-gates|the Q25 unit on gates between atoms>>).`,
          claims: [
            claim('o9PCert200', 'with 200 sites the chance to fill a target of 100 is 0.659', () => near(V.o9PCert200, 0.659, 0.0005)),
            claim('o9PCert220', 'with 220 sites it is 0.962', () => near(V.o9PCert220, 0.962, 0.0005)),
            claim('o9Sites50', 'a target of 50 sites needs 122 sites', () => V.o9Sites50 === 122),
            claim('o9ExpAtoms', 'twelve thousand sites hold 6,144 atoms on average', () => V.o9ExpAtoms === 6144),
          ],
        },
        {
          text: 'How long it takes is an estimate and is labelled so. The paper estimates about 137 ms to sort the array of twelve thousand sites in parallel. It estimates about 522 ms to sort its four quadrants one after another, from the time budget of its supplement (Manetsch et al., pp. 8 and 33). What goes wrong is that every move of an atom takes time, during which the other atoms wait and are lost to the vacuum. Try it. The bench draws the chance to fill the target against the number of sites.',
          widget: { kind: 'optics-bench', props: { preset: 'sort-success' }, caption: 'The chance that a target of atoms can be filled against the number of sites.' },
        },
      ],
    },
    {
      id: 'o9-refill',
      label: '§3',
      title: 'Keeping the array full',
      pages: 'pp. 3–33',
      summary: 'Each round refills some empty sites and loses a few atoms, and the empty fraction settles at a level set by the ratio of the two chances.',
      body: [
        {
          text: `A [[qc-op-reservoir|reservoir]] of loaded sites refills the array between rounds. Let each round lose an atom with a chance $\\epsilon$ and refill an empty site with a chance $q$. The empty fraction $e$ then becomes $e(1-q)+(1-e)\\epsilon$ in the next round and settles at $\\epsilon/(q+\\epsilon)$. These are model inputs and not data: a loss of one per cent a round and a refill of one half. From an empty array the empty fraction is ${d(V.o9Empty5, 4)} after five rounds, and the settled value is ${d(V.o9EmptyEq, 4)} (<<qc-q24-lindblad|the unit on rates and steady states>>).`,
          claims: [
            claim('o9Empty5', 'after five rounds the empty fraction is 0.0473', () => near(V.o9Empty5, 0.0473, 0.00005)),
            claim('o9EmptyEq', 'the settled empty fraction is 0.0196', () => near(V.o9EmptyEq, 0.0196, 0.00005)),
          ],
        },
        {
          text: `Why do you want more than a good fraction? An array is useful only if the whole target is full. A hundred sites that are each filled with the settled chance are all full with a chance of only ${d(V.o9AllFilled100, 3)}. That is the reason to move atoms in from a reservoir, to keep spare atoms beyond the target, and to check the occupation of every site before the next step. How you know the refill is enough is the settled value, and what goes wrong is a refill chance that is smaller than the loss.`,
          claims: [claim('o9AllFilled100', 'a hundred sites each filled at the settled chance are all full with chance 0.138', () => near(V.o9AllFilled100, 0.138, 0.0005))],
          widget: { kind: 'optics-bench', props: { preset: 'refill-rounds' }, caption: 'The empty fraction of a refilled array against the round.' },
        },
        {
          text: 'Try it. Slide the loss and the refill chance, and watch the empty fraction climb from zero to its settled level in a few rounds. A refill that is ten times the loss leaves about a tenth of the empty sites that a refill equal to the loss would. The settled value, and not the number of rounds, is the quantity to design for, because the number of rounds only decides how soon you arrive.',
        },
      ],
    },
    {
      id: 'o9-loss',
      label: '§4',
      title: 'The price of an image',
      pages: 'pp. 3–33',
      summary: 'Atoms are lost at a steady rate to the vacuum and in a small share with every image, and the reloading has to keep up with both.',
      body: [
        {
          text: `Every atom leaves at a rate $1/\\tau$ for the vacuum lifetime $\\tau$, and each image loses a share $1-S$ of the atoms for the survival chance $S$. The paper reports a lifetime of ${d(V.o9RepLifeMin, 1)} minutes and a survival of ${d(V.o9RepSurv * 100, 5)} % for each image (Manetsch et al., p. 4). With 6,139 atoms that is ${d(V.o9LossPerSec, 2)} atoms lost every second to the vacuum and ${d(V.o9LostPerImage, 3)} atoms lost with every image. These two are computed from the reported inputs (<<qc-q24-bloch-eq|the unit on where a decaying system settles>>).`,
          claims: [
            claim('o9RepLifeMin', 'reported by Manetsch et al., p. 4: the vacuum lifetime is 22.9 minutes', () => near(V.o9RepLifeMin, 22.9, 1e-12)),
            claim('o9RepSurv', 'reported by Manetsch et al., p. 4: an image leaves 99.98952 per cent of the atoms', () => near(V.o9RepSurv, 0.9998952, 1e-12)),
            claim('o9LossPerSec', 'with 6,139 atoms the vacuum takes 4.47 a second', () => near(V.o9LossPerSec, 4.47, 0.005)),
            claim('o9LostPerImage', 'each image loses 0.643 atoms', () => near(V.o9LostPerImage, 0.643, 0.0005)),
          ],
        },
        {
          text: 'The rule of continuous operation follows. The reload rate must match the loss rate times the size of the array, or the array runs down. What goes wrong is a long image, because the number lost grows with the time the atoms are lit; the next two pages are about the light that an image needs. Loss is also a third outcome of a measurement, next to bright and dark, and the later pages on readout in the error-correction cycle treat it so.',
        },
      ],
    },
  ],
})
