/**
 * Background chapter B3 of the Papers section: measuring logical operators, from lattice surgery to gauging (rulings papers-B3B4.md; plan P-B3-story). It teaches the Pauli
 * product measurement and the update rule, lattice surgery (merge, split, a CNOT from three measurements), the gauging measurement on a graph, what keeps the distance
 * (the Cheeger constant, repeated rounds) and bridges and adapters between code blocks, in two tracks, for the paper lecture P1 and every later paper that needs them.
 * Sources were read online and are paraphrased and cited by section: Horsman et al., Litinski, Williamson and Yoder, Cross et al., Swaroop et al. Every number is either
 * computed by a registered recipe (numpy twin: pipeline/claims_papers/b3.py) or reported from a source with its location.
 *
 * DATA ONLY: papers/specData.test.ts proves this file holds nothing but literals; papers/validate.ts checks it; papers/compile.ts turns it into a Lecture.
 */
import type { PaperSpec } from '../../papers/spec'

export const B3: PaperSpec = {
  specVersion: 1,
  id: 'B3',
  kind: 'background',
  title: 'Measuring logical operators: from lattice surgery to gauging',
  outcomes: [
    'Apply the measurement update rule to a stabilizer state and to a code, and tell which of its three cases happens.',
    'Say why measuring a Pauli product keeps what two single measurements destroy.',
    'List the new checks of a lattice-surgery merge and explain why only their product is data.',
    'Compute the Pauli fixes of a CNOT built from three measurements.',
    'Build the gauging graph of a logical operator (dot checks, loop checks, link qubits) and count its loops.',
    'Compute a graph’s Cheeger constant and see it fix the deformed distance on a small family.',
    'Explain why about d rounds guard the readout, and join two measurement graphs with a bridge or an adapter.',
  ],
  references: [
    {
      id: 'hor12',
      label: 'Horsman et al. 2012',
      arxiv: { id: '1111.4022' },
      depth: 1,
      status: 'read',
      reliedOn: 'Sections 3.1, 3.2 and 4.1',
      why: 'Merges and splits two surface-code patches along a seam to measure a product of their logical operators, and builds a CNOT from such measurements.',
      taughtIn: { course: 'papers', chapter: 'B3', unit: 'b3-surgery' },
    },
    {
      id: 'lit19a',
      label: 'Litinski 2019',
      arxiv: { id: '1808.02892' },
      depth: 1,
      status: 'read',
      reliedOn: 'Introduction and Figs. 4 to 7',
      why: 'Treats the Pauli product measurement as the one basic move of a surface-code computer.',
      taughtIn: { course: 'papers', chapter: 'B3', unit: 'b3-logical-measure' },
    },
    {
      id: 'wy24',
      label: 'Williamson and Yoder 2024',
      arxiv: { id: '2410.02213' },
      depth: 1,
      status: 'read',
      reliedOn: 'Algorithm 1, Theorems 1, 2 and 4, Lemma 2, Fig. 1b',
      why: 'Measures any logical Pauli of a code by attaching a graph of new qubits, and says which graphs keep the distance.',
      taughtIn: { course: 'papers', chapter: 'B3', unit: 'b3-gauging' },
    },
    {
      id: 'cro24',
      label: 'Cross et al. 2024',
      arxiv: { id: '2407.18393' },
      depth: 1,
      status: 'read',
      reliedOn: 'Sections 2.2, 3.1 to 3.8 and 4',
      why: 'Joins the measurement graphs of two code blocks by a bridge and applies the idea to the gross code.',
      taughtIn: { course: 'papers', chapter: 'B3', unit: 'b3-bridges' },
    },
    {
      id: 'sjy24',
      label: 'Swaroop et al. 2024',
      arxiv: { id: '2410.03628' },
      depth: 1,
      status: 'read',
      reliedOn: 'Sections II.2, II.3 and IV, first half',
      why: 'Allows a matching between different codes, an adapter, and keeps the distance by relative expansion.',
      taughtIn: { course: 'papers', chapter: 'B3', unit: 'b3-bridges' },
    },
  ],
  prerequisites: [
    {
      id: 'logical-pauli-measurement',
      label: 'Measuring a logical Pauli',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-logical-measure' },
      needs: ['stabilizer-measurement-update', 'logical-operators'],
    },
    {
      id: 'pauli-product-measurement',
      label: 'Pauli product measurement',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-logical-measure' },
      needs: ['stabilizer-of-state', 'commuting-pauli-products', 'logical-pauli-measurement'],
    },
    {
      id: 'code-deformation',
      label: 'Code deformation',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-surgery' },
      needs: ['pauli-product-measurement', 'surface-code-patch'],
    },
    {
      id: 'lattice-surgery',
      label: 'Lattice surgery',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-surgery' },
      needs: ['code-deformation', 'pauli-product-measurement', 'pauli-frame', 'cnot'],
    },
    {
      id: 'graph-cycle-basis',
      label: 'Graphs and cycle bases',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-gauging' },
      needs: ['gf2-linear-algebra'],
    },
    {
      id: 'gauging-measurement',
      label: 'Gauging measurement',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-gauging' },
      needs: ['graph-cycle-basis', 'logical-pauli-measurement', 'css-stabilizer'],
      ref: 'wy24',
    },
    {
      id: 'expansion',
      label: 'Expansion and the Cheeger constant',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-distance' },
      needs: ['graph-cycle-basis', 'code-distance'],
      ref: 'wy24',
    },
    {
      id: 'subsystem-code',
      label: 'Gauge qubits and subsystem codes',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-distance' },
      needs: ['gauging-measurement'],
      ref: 'cro24',
    },
    {
      id: 'space-time-like-errors',
      label: 'Time-like failures and repeated rounds',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-distance' },
      needs: ['detector', 'binomial', 'gauging-measurement'],
      ref: 'wy24',
    },
    {
      id: 'bridge-system',
      label: 'Bridges between measurement graphs',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-bridges' },
      needs: ['gauging-measurement', 'expansion'],
      ref: 'cro24',
    },
    {
      id: 'adapter',
      label: 'Adapters between different codes',
      teach: { course: 'papers', chapter: 'B3', unit: 'b3-bridges' },
      needs: ['bridge-system', 'css-stabilizer'],
      ref: 'sjy24',
    },
    {
      id: 'stabilizer-measurement-update',
      label: 'The measurement update rule',
      teach: { course: 'qc709', chapter: 'Q22', unit: 'q22-clifford' },
      needs: [],
    },
    {
      id: 'logical-operators',
      label: 'Logical operators',
      teach: { course: 'qc709', chapter: 'Q22', unit: 'q22-check-matrix' },
      needs: [],
    },
    {
      id: 'code-distance',
      label: 'Code distance',
      teach: { course: 'qc709', chapter: 'Q22', unit: 'q22-check-matrix' },
      needs: [],
    },
    {
      id: 'css-stabilizer',
      label: 'CSS codes',
      teach: { course: 'qc709', chapter: 'Q22', unit: 'q22-css' },
      needs: [],
    },
    {
      id: 'surface-code-patch',
      label: 'The surface-code patch',
      teach: { course: 'papers', chapter: 'B1', unit: 'b1-planar' },
      needs: [],
    },
    {
      id: 'detector',
      label: 'Detectors',
      teach: { course: 'papers', chapter: 'B1', unit: 'b1-spacetime' },
      needs: [],
    },
    {
      id: 'pauli-frame',
      label: 'Pauli frames',
      teach: { course: 'papers', chapter: 'B1', unit: 'b1-spacetime' },
      needs: [],
    },
    {
      id: 'gf2-linear-algebra',
      label: 'Linear algebra over GF(2)',
      teach: { course: 'qc709', chapter: 'F7', unit: 'f7-gf2' },
      needs: [],
    },
    {
      id: 'stabilizer-of-state',
      label: 'Stabilizers of a state',
      teach: { course: 'qc709', chapter: 'Q6', unit: 'q6-parities' },
      needs: [],
    },
    {
      id: 'commuting-pauli-products',
      label: 'Commuting Pauli products',
      teach: { course: 'qc709', chapter: 'Q7', unit: 'q7-observables' },
      needs: [],
    },
    {
      id: 'cnot',
      label: 'The CNOT gate',
      teach: { course: 'qc709', chapter: 'Q4', unit: 'q4-cnot' },
      needs: [],
    },
    {
      id: 'binomial',
      label: 'The binomial distribution',
      teach: { course: 'qc709', chapter: 'F5', unit: 'f5-spread' },
      needs: [],
    },
  ],
  symbols: {
    '|\\cdot\\rangle': 'b3-logical-measure:b1',
    '|++\\rangle': 'b3-logical-measure:b1',
    P: 'b3-logical-measure:b3',
    Z: 'b3-logical-measure:b3',
    '\\bar Z_1': 'b3-logical-measure:b4',
    '\\bar Z_2': 'b3-logical-measure:b4',
    I: 'b3-logical-measure:b4',
    '\\bar X_1': 'b3-logical-measure:b5',
    '\\bar X_2': 'b3-logical-measure:b5',
    X: 'b3-logical-measure:b5',
    '\\Pi_P': 'b3-logical-measure',
    s: 'b3-logical-measure',
    '|0\\rangle': 'b3-surgery:b1',
    '|+\\rangle': 'b3-surgery:b4',
    Z_c: 'b3-surgery:b4',
    Z_a: 'b3-surgery:b4',
    X_a: 'b3-surgery:b4',
    X_t: 'b3-surgery:b4',
    M_m: 'b3-surgery:b4',
    m_2: 'b3-surgery:b4',
    m_1: 'b3-surgery:b4',
    m_3: 'b3-surgery:b4',
    '\\Pi_Z_cZ_a': 'b3-surgery:b4',
    a: 'b3-surgery:b4',
    '\\Pi_X_aX_t': 'b3-surgery:b4',
    '\\langle\\cdot|': 'b3-surgery:b4',
    '|m_3\\rangle': 'b3-surgery:b4',
    '\\Pi_Z_a': 'b3-surgery:b4',
    m_i: 'b3-surgery',
    '\\bar X_A': 'b3-surgery',
    '\\bar X_B': 'b3-surgery',
    '\\bar X': 'b3-gauging:b1',
    A_v: 'b3-gauging:b2',
    L: 'b3-gauging:b2',
    X_v: 'b3-gauging:b2',
    X_e: 'b3-gauging:b2',
    e: 'b3-gauging:b2',
    A_u: 'b3-gauging:b2',
    V: 'b3-gauging:b3',
    E: 'b3-gauging:b3',
    h: 'b3-distance:b2',
    'P_\\rmfail': 'b3-distance:b4',
    R: 'b3-distance:b4',
    p: 'b3-distance:b4',
    m: 'b3-distance:b4',
    '\\iff': 'b3-distance:b4',
    d: 'b3-distance:b5',
    G: 'b3-distance',
    '\\partial': 'b3-distance',
    S: 'b3-distance',
    w: 'b3-bridges:b1',
    E_A: 'b3-bridges',
    V_A: 'b3-bridges',
    E_B: 'b3-bridges',
    V_B: 'b3-bridges',
  },
  symbolsFormal: {
    Z: 'b3-logical-measure:b1',
    Z_1: 'b3-logical-measure:b1',
    Z_2: 'b3-logical-measure:b1',
    '|00\\rangle': 'b3-logical-measure:b1',
    '|11\\rangle': 'b3-logical-measure:b1',
    S: 'b3-logical-measure:b3',
    '\\langle\\cdot\\rangle': 'b3-logical-measure:b3',
    X: 'b3-logical-measure:b3',
    I: 'b3-logical-measure:b3',
    L: 'b3-logical-measure:b4',
    N: 'b3-logical-measure:b4',
    '\\setminus': 'b3-logical-measure:b4',
    k: 'b3-logical-measure:b4',
    d: 'b3-surgery:b1',
    n: 'b3-surgery:b1',
    '|\\bar0\\bar0\\rangle': 'b3-surgery:b2',
    '\\bar Z_A': 'b3-surgery:b3',
    '\\bar Z_B': 'b3-surgery:b3',
    m: 'b3-surgery:b3',
    '\\dagger': 'b3-surgery:b4',
    G: 'b3-gauging:b1',
    V: 'b3-gauging:b1',
    E: 'b3-gauging:b1',
    B_c: 'b3-gauging:b2',
    Z_e: 'b3-gauging:b2',
    v: 'b3-gauging:b2',
    X_0: 'b3-gauging:b2',
    X_3: 'b3-gauging:b2',
    X_6: 'b3-gauging:b2',
    R: 'b3-gauging:b4',
    '\\sigma': 'b3-gauging:b4',
    d_X: 'b3-gauging:b5',
    d_Z: 'b3-gauging:b5',
    'k_\\rmtotal': 'b3-distance:b3',
    q: 'b3-distance:b4',
    j: 'b3-distance:b4',
    G_A: 'b3-bridges:b1',
    G_B: 'b3-bridges:b1',
    B: 'b3-bridges:b1',
  },
  units: [
    {
      id: 'b3-logical-measure',
      title: 'Measuring a product, not its factors',
      question: 'How is one joint fact read without reading the qubits?',
      source: {
        summary: 'Litinski builds a whole computer from one move, measuring a product of Pauli operators. Horsman and coauthors measure such products with a helper qubit.',
        where: 'Lit19a Introduction; Hor12 §3',
      },
      tryIt: {
        kind: 'bit-table',
        props: { mode: 'strings', a: '00000110', b: '00001100', combine: 'dot' },
        tryThis: [
          'Write a Pauli as its $x$ bits and then its $z$ bits; for the second row swap the two halves. Then the dot product counts clashes. The rows start as $IZZI$ and $XXII$ swapped: the readout says a·b = 1, one clash, so they anticommute.',
          'Change the second row to 00000110, which is $IXXI$ swapped. The readout now says a·b = 0: the two products commute and can be read together.',
        ],
      },
      insight: 'A Pauli product can be read without reading its parts. The reading keeps what the parts alone would destroy, and the update rule says which checks survive.',
      insightFormal: 'Measuring $Z_1Z_2$ through a helper projects onto one eigenspace of the product and leaves the superposition inside it, unlike measuring $Z_1$ then $Z_2$. The update rule gives the new check list; a logical product costs one stored qubit.',
      story: [
        {
          id: 'b3-logical-measure:b1',
          phase: 'books',
          text: 'Two [[qubit|qubits]] start as $|{+}{+}\\rangle$, each 0 or 1 at random. Ask only whether they agree. The chance of agreeing is 0.5, and a helper qubit gathers that parity; only the helper is read.',
          formal: 'Two CNOTs from the data onto a helper, then a $Z$ readout of the helper, measure $Z_1Z_2$ (<<pp-q6-parities|parity checks>>) without reading either data [[qubit]]. On $|{+}{+}\\rangle$ the outcome $+1$ has chance $\\tfrac12$ and leaves $(|00\\rangle + |11\\rangle)/\\sqrt2$.',
          stage: {
            recipe: 'product-measure',
            params: { product: 'ZZ', mode: 'product', outcome: 0, upTo: 3 },
          },
          caption: 'the helper reads the agreement; the data keep their [[superposition]]',
          captionFormal: '$Z_1Z_2 = +1$: chance $\\tfrac12$, post-state $(|00\\rangle+|11\\rangle)/\\sqrt2$',
          claims: [
            {
              key: 'b3EvenProb',
              text: 'the two qubits agree with chance one half',
              from: {
                recipe: 'product-measure',
                params: { product: 'ZZ', mode: 'product', outcome: 0, upTo: 3 },
              },
              value: 'pEven',
            },
            {
              key: 'b3BellAmp',
              text: 'each nonzero amplitude after the readout has size 0.7071',
              from: {
                recipe: 'product-measure',
                params: { product: 'ZZ', mode: 'product', outcome: 0, upTo: 3 },
              },
              value: 'ampSame',
            },
          ],
          trail: [
            { ref: 'lit19a', at: 'Introduction', why: 'A Pauli product measurement is the basic move of the surface-code game.' },
          ],
        },
        {
          id: 'b3-logical-measure:b2',
          phase: 'books',
          text: 'Reading qubit 1, then qubit 2, also tells you whether they agree. But it leaves one definite string, each with chance a quarter. The [[pp-product-measurement|parity measurement]] keeps the entanglement.',
          formal: 'Measuring $Z_1$ then $Z_2$ projects onto one basis string, chance $\\tfrac14$ each, a product state. Measuring the [[pp-product-measurement|product]] $Z_1Z_2$ projects only onto its $\\pm1$ eigenspace, so the post-state is maximally entangled and the [[superposition]] inside the eigenspace survives.',
          stage: {
            recipe: 'product-measure',
            params: { product: 'ZZ', mode: 'separate', outcome: 0, upTo: 2 },
          },
          caption: 'four strings at a quarter each, against two kept at a half',
          captionFormal: '$Z_1$ then $Z_2$: four outcomes $\\tfrac14$; $Z_1Z_2$: two outcomes $\\tfrac12$',
          claims: [
            {
              key: 'b3SepProb',
              text: 'reading the qubits one by one gives each string with chance one quarter',
              from: {
                recipe: 'product-measure',
                params: { product: 'ZZ', mode: 'separate', outcome: 0, upTo: 2 },
              },
              value: 'pSep',
            },
            {
              key: 'b3Concurrence',
              text: 'the post-state of the product reading is maximally entangled',
              from: {
                recipe: 'product-measure',
                params: { product: 'ZZ', mode: 'product', outcome: 0, upTo: 3 },
              },
              value: 'concurrence',
            },
            {
              key: 'b3EvenProb2',
              text: 'the product reading has two outcomes of chance one half each',
              from: {
                recipe: 'product-measure',
                params: { product: 'ZZ', mode: 'product', outcome: 0, upTo: 3 },
              },
              value: 'pEven',
            },
          ],
        },
        {
          id: 'b3-logical-measure:b3',
          phase: 'books',
          introduces: ['pp-stabilizer-update'],
          text: 'A rule for stabilizer states. Measure a Pauli $P$. If $P$ is already a check, the answer is fixed. Otherwise the answer is a coin flip, and $P$ joins the checks, pushing out any check it clashes with. This is the [[pp-stabilizer-update|update rule]].',
          formal: 'Measuring $P$ on a stabilizer group $S$ follows the [[pp-stabilizer-update|update rule]] (<<pp-q22-clifford|Q22>>): if $\\pm P \\in S$ the outcome is fixed. Otherwise it is a fair coin and $P$ joins $S$, replacing one generator that anticommutes with it; the other anticommuting generators are multiplied by that one.',
          stage: {
            recipe: 'stab-update',
            params: {
              generators: ['XI', 'IX'],
              measure: 'ZZ',
            },
          },
          caption: '$ZZ$ clashes with both checks of $|{+}{+}\\rangle$; one goes, their product stays',
          captionFormal: '$\\langle XI, IX\\rangle \\to \\langle \\pm ZZ, XX\\rangle$',
          claims: [
            {
              key: 'b3KeptXX',
              text: 'one old check survives, as the product XX',
              from: {
                recipe: 'stab-update',
                params: {
                  generators: ['XI', 'IX'],
                  measure: 'ZZ',
                },
              },
              value: 'kept',
            },
            {
              key: 'b3BellFixed',
              text: 'on a Bell state three of the fifteen non-identity Paulis have a fixed outcome',
              from: {
                recipe: 'stab-update',
                params: {
                  generators: ['XX', 'ZZ'],
                  measure: 'ZZ',
                },
              },
              value: 'censusFixed',
            },
            {
              key: 'b3BellRandom',
              text: 'on a Bell state twelve of the fifteen non-identity Paulis give a coin flip',
              from: {
                recipe: 'stab-update',
                params: {
                  generators: ['XX', 'ZZ'],
                  measure: 'ZZ',
                },
              },
              value: 'censusRandom',
            },
          ],
          trail: [
            { ref: 'hor12', at: '§3.1', why: 'The merge is this rule applied to the seam checks.' },
          ],
        },
        {
          id: 'b3-logical-measure:b4',
          phase: 'books',
          text: 'A logical operator commutes with every check but is not one. It acts on the stored qubits. In the four-qubit code with two stored qubits, the product $\\bar Z_1\\bar Z_2$ is just $IZZI$. Measuring it learns the pair\'s agreement and nothing else. This is a [[pp-logical-measurement|logical measurement]].',
          formal: 'A logical Pauli $L \\in N(S)\\setminus S$ (<<pp-q22-check-matrix|logical operators>>) commutes with every generator, so [[pp-logical-measurement|measuring it]] is the second case of the rule: $\\pm L$ joins $S$ and $k$ drops by one. In the $[\\![4,2,2]\\!]$ code with $\\bar Z_1=ZIZI$, $\\bar Z_2=ZZII$, the product $\\bar Z_1\\bar Z_2 = IZZI$ takes $k$ from 2 to 1.',
          stage: {
            recipe: 'code-measure-logical',
            params: { code: 'c422', measure: 'IZZI' },
          },
          caption: 'the checks of the 4-qubit code, and the string IZZI beside them',
          captionFormal: '$XXXX$, $ZZZZ$ and the measured row $IZZI$: commutes with both, not in the group, $k$: $2 \\to 1$',
          claims: [
            {
              key: 'b3LogicalK1',
              text: 'before the measurement the code stores 2 qubits',
              from: {
                recipe: 'code-measure-logical',
                params: { code: 'c422', measure: 'IZZI' },
              },
              value: 'kBefore',
            },
            {
              key: 'b3LogicalK2',
              text: 'after measuring IZZI the code stores 1 qubit',
              from: {
                recipe: 'code-measure-logical',
                params: { code: 'c422', measure: 'IZZI' },
              },
              value: 'kAfter',
            },
            {
              key: 'b3ProductWeight',
              text: 'the product IZZI touches 2 qubits',
              from: {
                recipe: 'code-measure-logical',
                params: { code: 'c422', measure: 'IZZI' },
              },
              value: 'weight',
            },
          ],
        },
        {
          id: 'b3-logical-measure:b5',
          phase: 'clue',
          text: 'In the four-qubit code, can $\\bar Z_1\\bar Z_2 = IZZI$ be measured together with $\\bar X_1\\bar X_2 = IXXI$? And with $\\bar X_1 = XXII$?',
          formal: 'Which of $\\bar X_1\\bar X_2$ and $\\bar X_1$ commutes with $\\bar Z_1\\bar Z_2$? Count the qubits on which each pair clashes.',
          stage: {
            recipe: 'stab-update',
            params: {
              generators: ['IXXI'],
              measure: 'IZZI',
            },
          },
          caption: 'the checks after measuring IZZI on a state stabilized by IXXI',
          captionFormal: 'measuring $IZZI$ on the group $\\langle IXXI\\rangle$',
          reveal: {
            text: 'The first pair clashes on two qubits; the two clashes cancel, so both can be read. The second clashes on one qubit, so reading one erases the other. Two products can be read together exactly when they commute.',
            formal: '$IZZI$ and $IXXI$ anticommute at qubits 2 and 3, hence commute; $IZZI$ and $XXII$ anticommute at qubit 2 only, hence anticommute. Commuting products are compatible (<<pp-q7-observables|observables that commute>>): the pair $\\{\\bar Z_1\\bar Z_2, \\bar X_1\\bar X_2\\}$ is a logical Bell measurement.',
            caption: 'against XXII: one clash, so the first reading is erased',
            captionFormal: '$IZZI$ against $XXII$: one clash, anticommuting',
            stage: {
              recipe: 'stab-update',
              params: {
                generators: ['XXII'],
                measure: 'IZZI',
              },
            },
            claims: [
              {
                key: 'b3Clash12',
                text: 'IZZI and IXXI clash on 2 qubits',
                from: {
                  recipe: 'stab-update',
                  params: {
                    generators: ['IXXI'],
                    measure: 'IZZI',
                  },
                },
                value: 'clashes',
              },
              {
                key: 'b3Clash1',
                text: 'IZZI and XXII clash on 1 qubit',
                from: {
                  recipe: 'stab-update',
                  params: {
                    generators: ['XXII'],
                    measure: 'IZZI',
                  },
                },
                value: 'clashes',
              },
            ],
          },
        },
      ],
      review: {
        claims: [
          {
            key: 'b3EvenProbR',
            text: 'the two qubits agree with chance one half',
            from: {
              recipe: 'product-measure',
              params: { product: 'ZZ', mode: 'product', outcome: 0, upTo: 3 },
            },
            value: 'pEven',
          },
        ],
        points: [
          'A helper qubit lets you read whether two qubits agree without reading either one.',
          'Reading the product keeps the superposition that reading each qubit would destroy.',
          'The update rule says what happens to the checks: a fixed answer, a swapped check, or a new check.',
          'A logical product commutes with every check, so measuring it costs one stored qubit.',
        ],
        equations: '\\Pi_P^{s} = \\tfrac{1+sP}{2}',
        trap: 'Thinking that measuring the product measures each qubit.',
        formal: {
          points: [
            '$\\Pi_P^{s}=(1+sP)/2$ projects onto the eigenvalue $s$ of $P$; the three cases of the update rule are a clash, a member and a non-member that commutes.',
            'Measuring $Z_1Z_2$ on $|{+}{+}\\rangle$ gives $\\pm1$ with chance $\\tfrac12$ and a maximally entangled post-state.',
            'Two Pauli products can be measured together exactly when they commute.',
          ],
          equations: '\\langle XI, IX\\rangle \\to \\langle \\pm ZZ, XX\\rangle',
          trap: 'Taking the measurement of a product for a measurement of each factor: the factors are never read.',
        },
      },
      play: [
        {
          id: 'b3-m-even',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Do they agree?',
          prompt: 'Two qubits are both in the state |+>. A helper reads whether they agree. What is the chance that they do?',
          answerFrom: {
            from: {
              recipe: 'product-measure',
              params: { product: 'ZZ', mode: 'product', outcome: 0, upTo: 3 },
            },
            value: 'pEven',
          },
          tolerance: 0.005,
          hints: [
            { text: 'List the four equally likely strings of the two qubits.' },
            { text: 'They agree on 00 and on 11.' },
            { text: 'Add the chances of those two strings.' },
          ],
          walkthrough: [
            { text: 'The four strings 00, 01, 10, 11 each have chance a quarter.' },
            { text: 'The qubits agree on 00 and 11, so the chance is a quarter plus a quarter.' },
            { text: 'That is one half.' },
          ],
        },
        {
          id: 'b3-m-pair',
          kind: 'choice',
          tier: 'core',
          title: 'Read together',
          prompt: 'In the four-qubit code, which pair of products can be read together?',
          options: [
            {
              text: 'the first two logical Z operators multiplied, and the first two logical X operators multiplied',
              correct: true,
              why: 'IZZI and IXXI clash on two qubits, so they commute and can be measured together.',
            },
            {
              text: 'IZZI and XXII',
              correct: false,
              why: 'They clash on exactly one qubit, so they anticommute: reading one erases the other.',
            },
            {
              text: 'IZZI and IXII',
              correct: false,
              why: 'They clash on one qubit, so reading one erases the other.',
            },
            {
              text: 'No pair: any two measurements disturb each other',
              correct: false,
              why: 'Commuting Pauli products never disturb each other.',
            },
          ],
          hints: [
            { text: 'Two Pauli products can be read together exactly when they commute.' },
            { text: 'Count the qubits where one has X and the other has Z.' },
            { text: 'An even number of clashes means the products commute.' },
          ],
          walkthrough: [
            { text: 'IZZI and IXXI clash on qubits 2 and 3: two clashes, an even number.' },
            { text: 'So they commute and can be read together.' },
            { text: 'IZZI and XXII clash on qubit 2 only, an odd number, so they anticommute.' },
          ],
        },
        {
          id: 'b3-m-logical',
          kind: 'numeric',
          tier: 'core',
          title: 'Logical operators of the bit-flip code',
          prompt: 'The three-qubit bit-flip code has checks ZZI and IZZ. Of the 63 non-identity Paulis on three qubits, how many commute with both checks but are not in the group?',
          answerFrom: {
            from: {
              recipe: 'stab-update',
              params: {
                generators: ['ZZI', 'IZZ'],
                measure: 'ZZI',
              },
            },
            value: 'censusLogical',
          },
          tolerance: 0.005,
          hints: [
            { text: 'The Paulis that commute with both checks form a group; count it.' },
            { text: 'That group has 16 elements including the identity.' },
            { text: 'Remove the identity and the 3 elements of the check group.' },
          ],
          walkthrough: [
            { text: 'The Paulis commuting with both checks number 16, including the identity.' },
            { text: 'Three of the non-identity ones are in the check group: ZZI, IZZ and ZIZ.' },
            { text: 'That leaves 16 - 1 - 3 = 12.' },
          ],
        },
      ],
      pitfalls: ['Reading a product by reading each factor: that gives the same agreement but destroys the entanglement.'],
    },
    {
      id: 'b3-surgery',
      title: 'Lattice surgery: merge, then split',
      question: 'How do two patches measure a joint logical by joining?',
      source: {
        summary: 'Horsman and coauthors join two surface-code patches along a seam, read the new checks, and cut the seam again. The same moves build a CNOT.',
        where: 'Hor12 §3.1-3.2 and §4.1',
      },
      tryIt: {
        kind: 'bit-table',
        props: {
          mode: 'reduce',
          rows: ['100', '110', '011', '001'],
        },
        tryThis: [
          'These rows are the four new checks, cut down to the three seam qubits. Press Step to the end: the rank is 3 for four rows, so one combination of the four leaves nothing on the seam.',
          'That combination is the product of all four new checks. It is the only part of the readout that is data.',
        ],
      },
      insight: 'Joining two patches adds checks that are random one by one; only their product is a fact about the stored qubits. Splitting again leaves a sign that software tracks.',
      insightFormal: 'The $d+1$ new $X$ checks of the merge are fair coins, their product is $\\bar X_A\\bar X_B$ times old checks, and the split is a seam readout whose outcomes set a tracked Pauli frame. Three such measurements make a CNOT.',
      story: [
        {
          id: 'b3-surgery:b1',
          phase: 'books',
          text: 'Put two patches side by side with three fresh qubits between them, each in $|0\\rangle$. Measure the checks of one big patch. Four are new. Two old edge checks simply grow to reach the seam. This is [[pp-lattice-surgery|lattice surgery]], a [[pp-code-deformation|code deformation]].',
          formal: 'In [[pp-lattice-surgery|lattice surgery]], a [[pp-code-deformation|code deformation]], two distance-3 rotated patches (<<pp-b1-planar|rotated patch>>) and a column of $d = 3$ seam qubits in $|0\\rangle$ form a $3\\times7$ rotated patch, $n = 21$, $k = 1$. Against the old checks, $d + 1 = 4$ $X$ checks are new and $d - 1 = 2$ boundary $Z$ checks widen into the seam (Hor12 §3.1).',
          stage: {
            recipe: 'surgery-merge-split',
            params: {
              d: 3,
              step: 'merged',
              show: ['new', 'widened', 'seam'],
            },
          },
          caption: 'two patches, the seam between them, the four new checks lit',
          captionFormal: '$n = 21$: new $X$ checks (lit), widened $Z$ checks (outlined)',
          fidelity: ['qc-code-surgery-schematic'],
          claims: [
            {
              key: 'b3SeamQubits',
              text: 'the seam has 3 qubits',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'merged',
                  show: ['new', 'widened', 'seam'],
                },
              },
              value: 'seam',
            },
            {
              key: 'b3MergedN',
              text: 'the merged patch has 21 qubits',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'merged',
                  show: ['new', 'widened', 'seam'],
                },
              },
              value: 'n',
            },
            {
              key: 'b3NewXChecks',
              text: 'the merge adds 4 new checks',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'merged',
                  show: ['new', 'widened', 'seam'],
                },
              },
              value: 'newChecks',
            },
            {
              key: 'b3WidenZ',
              text: 'two old boundary checks widen into the seam',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'merged',
                  show: ['new', 'widened', 'seam'],
                },
              },
              value: 'widened',
            },
          ],
          trail: [
            {
              ref: 'hor12',
              at: '§3.1',
              why: 'The seam qubits start in the zero state for a merge that measures the product of the two X logicals.',
            },
          ],
        },
        {
          id: 'b3-surgery:b2',
          phase: 'books',
          text: 'Each new check, read alone, is a coin flip. All 16 patterns of the four flips have chance 0.0625 each, and the product is plus one with chance 0.5. Multiply all four and every seam qubit cancels. What is left is the product of the two patches\' logical $X$ strings: the answer.',
          formal: 'On $|\\bar0\\bar0\\rangle$ the four new $X$ checks give each of the 16 outcome patterns with chance $\\tfrac1{16}$. Their product, seam qubits cancelling, equals $\\bar X_A\\bar X_B$ times old checks. The product of the four outcomes is the measured value, $+1$ with chance $\\tfrac12$ (Hor12 §3.1).',
          stage: {
            recipe: 'surgery-merge-split',
            params: {
              d: 3,
              step: 'merged',
              show: ['new', 'product'],
            },
          },
          caption: 'four coin flips; their product is the joint X',
          captionFormal: 'pattern chance $\\tfrac1{16}$; $\\prod m_i = \\bar X_A\\bar X_B$',
          claims: [
            {
              key: 'b3PatternProb',
              text: 'each of the 16 outcome patterns of the four new checks has chance one sixteenth',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'merged',
                  show: ['new', 'product'],
                },
              },
              value: 'pPattern',
            },
            {
              key: 'b3MeasProb',
              text: 'the joint X reads plus one with chance one half on the two zero states',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'merged',
                  show: ['new', 'product'],
                },
              },
              value: 'pProduct',
            },
            {
              key: 'b3PlusPlusProb',
              text: 'the joint X reads plus one with certainty on the two plus states',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'merged',
                  show: ['new', 'product'],
                  prep: 'plus',
                },
              },
              value: 'pProduct',
            },
          ],
          trail: [
            { ref: 'hor12', at: '§3.1', why: 'The product of the seam stabilizers is the joint logical operator.' },
          ],
        },
        {
          id: 'b3-surgery:b3',
          phase: 'books',
          text: 'To split, read each seam qubit in $Z$ and set it aside. The patches stand alone again. The measured product stays fixed. One sign depends on the seam readings, and software tracks it.',
          formal: 'Measuring the seam qubits in $Z$ returns the two patches. Starting from $|\\bar0\\bar0\\rangle$, afterwards $\\langle\\bar X_A\\bar X_B\\rangle$ equals the merge outcome and $\\langle\\bar Z_A\\bar Z_B\\rangle = (-1)^{z}$ with $z$ the readout of the top seam qubit, while each patch alone is random: a logical Bell pair up to a tracked sign (<<pp-b1-spacetime|Pauli frame>>; Hor12 §3.2).',
          stage: {
            recipe: 'surgery-merge-split',
            params: {
              d: 3,
              step: 'split',
              show: ['seam'],
            },
          },
          caption: 'after the split: the pair agrees in X and each patch alone is a coin flip',
          captionFormal: '$\\langle\\bar X_A\\bar X_B\\rangle = m$, $\\langle\\bar Z_A\\bar Z_B\\rangle = (-1)^z$, $\\langle\\bar Z_A\\rangle = 0$',
          claims: [
            {
              key: 'b3SplitProb',
              text: 'each of the 8 seam outcomes has chance one eighth',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'split',
                  show: ['seam'],
                },
              },
              value: 'pSplit',
            },
            {
              key: 'b3FrameSign',
              text: '4 of the 8 seam outcomes flip the sign of the joint Z',
              from: {
                recipe: 'surgery-merge-split',
                params: {
                  d: 3,
                  step: 'split',
                  show: ['seam'],
                },
              },
              value: 'frameSigns',
            },
          ],
          trail: [
            { ref: 'hor12', at: '§3.2', why: 'A split measures out the seam; the random outcomes are tracked as a frame.' },
          ],
        },
        {
          id: 'b3-surgery:b4',
          phase: 'books',
          text: 'A CNOT needs no gate. Add a helper in $|{+}\\rangle$. Measure $Z_cZ_a$, then $X_aX_t$, then $Z_a$. Each outcome triple has chance an eighth, and two Pauli fixes, chosen from the outcomes, finish the job.',
          formal: 'Our three-measurement version of Hor12 §4.1\'s CNOT: measure $Z_cZ_a$ ($m_1$), $X_aX_t$ ($m_2$), $Z_a$ ($m_3$) on control, helper and target (<<pp-q4-cnot|the CNOT>>). The result is CNOT up to $Z_c^{[m_2=-1]}X_t^{[m_1m_3=-1]}$, and every triple occurs with chance $\\tfrac18$ for every input.',
          stage: {
            recipe: 'cnot-by-measurement',
            params: { upTo: 3 },
          },
          caption: 'three measurements on three wires',
          captionFormal: '$\\Pi_{Z_a}^{m_3}\\Pi_{X_aX_t}^{m_2}\\Pi_{Z_cZ_a}^{m_1}|{+}\\rangle_a \\propto Z_c^{[m_2]}X_t^{[m_1m_3]}\\mathrm{CNOT}$',
          derivation: {
            result: 'M_m = \\frac{1}{\\sqrt8}Z_c^{[m_2]}X_t^{[m_1m_3]}\\mathrm{CNOT}',
            ground: [
              {
                tex: '\\Pi_{Z_cZ_a}^{m_1}|{+}\\rangle_a',
                why: 'Measuring $Z_cZ_a$ ties the helper to the control: the helper now copies the control\'s $Z$ value.',
                view: {
                  recipe: 'cnot-by-measurement',
                  params: { upTo: 1, only: 'program' },
                },
                viewCaption: 'after $Z_cZ_a$',
              },
              {
                tex: '\\Pi_{X_aX_t}^{m_2}',
                why: 'Measuring $X_aX_t$ ties the target\'s $X$ value to the helper\'s.',
                view: {
                  recipe: 'cnot-by-measurement',
                  params: { upTo: 2, only: 'amplitudes' },
                },
                viewCaption: 'after $X_aX_t$',
              },
              {
                tex: '\\langle m_3|_a\\Pi_{Z_a}^{m_3}',
                why: 'Reading the helper in $Z$ leaves only the control and the target.',
                view: {
                  recipe: 'cnot-by-measurement',
                  params: { upTo: 3, only: 'program' },
                },
                viewCaption: 'helper read out',
              },
              {
                tex: 'M_m = \\frac{1}{\\sqrt8}Z_c^{[m_2]}X_t^{[m_1m_3]}\\mathrm{CNOT}',
                why: 'Compare the output with CNOT for an input and any outcome triple: after the fixes they agree.',
                view: {
                  recipe: 'cnot-by-measurement',
                  params: { upTo: 3, fixed: true, only: 'amplitudes' },
                },
                viewCaption: 'output equals CNOT',
              },
            ],
            formal: [
              {
                tex: 'M_m = \\langle m_3|_a\\Pi_{Z_a}^{m_3}\\Pi_{X_aX_t}^{m_2}\\Pi_{Z_cZ_a}^{m_1}|{+}\\rangle_a',
                why: 'Compose the three projections and drop the helper.',
                view: {
                  recipe: 'cnot-by-measurement',
                  params: { upTo: 3, only: 'program' },
                },
                viewCaption: 'helper read out',
              },
              { tex: 'M_m^\\dagger M_m = \\tfrac18 I', why: 'Every triple occurs with the same chance for every input.' },
              {
                tex: 'M_m = \\frac{1}{\\sqrt8}Z_c^{[m_2]}X_t^{[m_1m_3]}\\mathrm{CNOT}',
                why: 'Up to a phase the operator is CNOT followed by the two Pauli fixes.',
                view: {
                  recipe: 'cnot-by-measurement',
                  params: { upTo: 3, fixed: true, only: 'amplitudes' },
                },
                viewCaption: 'output equals CNOT',
              },
            ],
          },
          claims: [
            {
              key: 'b3CnotProb',
              text: 'each outcome triple has chance one eighth',
              from: {
                recipe: 'cnot-by-measurement',
                params: { upTo: 3 },
              },
              value: 'pTriple',
            },
            {
              key: 'b3CnotNoFix',
              text: '2 of the 8 outcome triples need no fix',
              from: {
                recipe: 'cnot-by-measurement',
                params: { upTo: 3 },
              },
              value: 'noFix',
            },
            {
              key: 'b3CnotZFix',
              text: '4 of the 8 outcome triples need a Z on the control',
              from: {
                recipe: 'cnot-by-measurement',
                params: { upTo: 3 },
              },
              value: 'zFix',
            },
            {
              key: 'b3CnotXFix',
              text: '4 of the 8 outcome triples need an X on the target',
              from: {
                recipe: 'cnot-by-measurement',
                params: { upTo: 3 },
              },
              value: 'xFix',
            },
          ],
          trail: [
            {
              ref: 'hor12',
              at: '§4.1, Fig. 7',
              why: 'The paper builds the CNOT from a merge, a split, a merge and a split. Ours: the same idea as three Pauli measurements, with the Kraus form and the chance of an eighth.',
            },
          ],
        },
        {
          id: 'b3-surgery:b5',
          phase: 'clue',
          text: 'Merge two distance-5 patches the same way. How many qubits does the big patch have, and how many checks are new?',
          formal: 'For $d = 5$, what are $n$ of the merged rotated patch, the number of new $X$ checks, and the number of widened $Z$ checks?',
          stage: {
            recipe: 'surgery-merge-split',
            params: { d: 5, step: 'separate' },
          },
          caption: 'two distance-5 patches, apart',
          captionFormal: 'two $d = 5$ patches before the merge',
          reveal: {
            text: 'Five rows and eleven columns: 55 qubits. Six new $X$ checks and four widened $Z$ checks. Their product is still the joint $X$.',
            formal: '$n = d(2d+1) = 55$, $d + 1 = 6$ new $X$ checks, $d - 1 = 4$ widened $Z$ checks, $k = 1$; the product relation holds for $d = 3, 5, 7$ ($n = 21, 55, 105$).',
            caption: 'the 5 by 11 patch, new checks lit',
            captionFormal: 'the $5\\times11$ patch, new checks lit',
            stage: {
              recipe: 'surgery-merge-split',
              params: {
                d: 5,
                step: 'merged',
                show: ['new', 'widened'],
              },
            },
            claims: [
              {
                key: 'b3MergeN5',
                text: 'the merged distance-5 patch has 55 qubits',
                from: {
                  recipe: 'surgery-merge-split',
                  params: {
                    d: 5,
                    step: 'merged',
                    show: ['new', 'widened'],
                  },
                },
                value: 'n',
              },
              {
                key: 'b3NewX5',
                text: 'the distance-5 merge has 6 new checks',
                from: {
                  recipe: 'surgery-merge-split',
                  params: {
                    d: 5,
                    step: 'merged',
                    show: ['new', 'widened'],
                  },
                },
                value: 'newChecks',
              },
              {
                key: 'b3WidenZ5',
                text: 'the distance-5 merge widens 4 checks',
                from: {
                  recipe: 'surgery-merge-split',
                  params: {
                    d: 5,
                    step: 'merged',
                    show: ['new', 'widened'],
                  },
                },
                value: 'widened',
              },
            ],
          },
        },
      ],
      review: {
        points: [
          'A seam of fresh qubits joins two patches into one bigger patch with four new checks.',
          'Each new check is a coin flip; only the product of all of them is data.',
          'Splitting measures the seam; the remaining sign is tracked by software, not applied.',
          'Three Pauli measurements and two Pauli fixes make a CNOT.',
        ],
        equations: '\\prod_i m_i = \\bar X_A\\bar X_B',
        trap: 'Believing each new check is a measurement of the logical operator.',
        formal: {
          points: [
            'The merge of two $d\\times d$ patches along a seam of $d$ qubits is the $d\\times(2d+1)$ rotated patch: $d+1$ new checks, $d-1$ widened ones (Hor12 §3.1).',
            'The product of the new checks is $\\bar X_A\\bar X_B$ up to old checks; the merge outcome is its eigenvalue.',
            'The split leaves $\\langle\\bar Z_A\\bar Z_B\\rangle = (-1)^z$, a Pauli frame, and the three-measurement CNOT has Kraus operators $\\tfrac1{\\sqrt8}Z_c^{[m_2]}X_t^{[m_1m_3]}\\mathrm{CNOT}$.',
          ],
          equations: '\\prod_{i=1}^{d+1} m_i = \\bar X_A\\bar X_B',
          trap: 'Reading one new check as the logical measurement: its chance of +1 is a half for every input.',
        },
      },
      play: [
        {
          id: 'b3-s-seam',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'The seam of a bigger patch',
          prompt: 'Two distance-5 patches are merged along a seam. How many fresh qubits does the seam need?',
          answerFrom: {
            from: {
              recipe: 'surgery-merge-split',
              params: { d: 5, step: 'separate' },
            },
            value: 'seam',
          },
          tolerance: 0.005,
          hints: [
            { text: 'The seam is one column of qubits between the patches.' },
            { text: 'It is as tall as a patch.' },
            { text: 'A distance-5 patch has 5 rows.' },
          ],
          walkthrough: [
            { text: 'The seam is one column as tall as a patch.' },
            { text: 'A distance-5 patch has 5 rows, so the seam has 5 qubits.' },
          ],
        },
        {
          id: 'b3-s-n',
          kind: 'numeric',
          tier: 'core',
          title: 'Qubits of the merged patch',
          prompt: 'How many qubits does the merged patch of two distance-5 patches have?',
          answerFrom: {
            from: {
              recipe: 'surgery-merge-split',
              params: {
                d: 5,
                step: 'merged',
                show: ['new', 'widened'],
              },
            },
            value: 'n',
          },
          tolerance: 0.005,
          hints: [
            { text: 'The merged patch has 5 rows.' },
            { text: 'It has two patches of 5 columns and a seam of 1 column.' },
            { text: 'Multiply rows by columns.' },
          ],
          walkthrough: [
            { text: 'Columns: 5 + 1 + 5 = 11.' },
            { text: 'Rows: 5.' },
            { text: 'So 5 times 11 = 55 qubits.' },
          ],
        },
        {
          id: 'b3-s-all',
          kind: 'numeric',
          tier: 'stretch',
          title: 'All four checks read plus one',
          prompt: 'Merge two distance-3 patches that start as logical zero states. What is the chance that all four new checks read +1?',
          answerFrom: {
            from: {
              recipe: 'surgery-merge-split',
              params: {
                d: 3,
                step: 'merged',
                show: ['new', 'product'],
              },
            },
            value: 'pPattern',
          },
          tolerance: 0.005,
          hints: [
            { text: 'Each of the 16 outcome patterns of the four checks is equally likely.' },
            { text: 'The pattern "all plus" is one of them.' },
            { text: 'One pattern out of 16.' },
          ],
          walkthrough: [
            { text: 'Four independent coin flips have 16 outcome patterns.' },
            { text: 'Each pattern has the same chance.' },
            { text: 'So the chance of all plus is 1/16 = 0.0625.' },
          ],
        },
      ],
      pitfalls: ['Treating the seam qubits as part of the answer: they are set aside again when the patches split.'],
    },
    {
      id: 'b3-gauging',
      title: 'Gauging: any logical, on a graph',
      question: 'Which extra qubits and checks measure a chosen logical in any code?',
      source: {
        summary: 'Williamson and Yoder give a recipe that measures any logical Pauli. It attaches a graph of new qubits to the qubits where the logical acts.',
        where: 'WY24 Algorithm 1, Theorem 1, Fig. 1b; Cro24 §3.1',
      },
      tryIt: {
        kind: 'bit-table',
        props: {
          mode: 'reduce',
          rows: ['1001', '1100', '0110', '0011'],
        },
        tryThis: [
          'The four rows are the dots of a square graph, written against its four links. Press Step to the end: the rank is 3, which is the number of dots minus one.',
          'The null space lists 0000 and 1111: the one loop that uses all four links. Links minus dots plus one is 4 - 4 + 1 = 1.',
        ],
      },
      insight: 'A connected graph on the logical support turns any logical measurement into local checks: a check at every dot and one at every loop. The dot checks multiply to the logical.',
      insightFormal: 'Gauging adds one qubit per edge and measures the vertex checks $A_v$ and cycle checks $B_c$; $\\prod_vA_v = L$ gives the outcome, and $E-V+1$ cycle checks keep the code consistent. The old $Z$ checks are deformed along paths.',
      story: [
        {
          id: 'b3-gauging:b1',
          phase: 'books',
          text: 'Take the qubits where the logical acts. They become the dots of a graph, and each link will be a new qubit. For the $\\bar X$ column of one patch the graph is a path of three dots. This is a [[pp-gauging|gauging measurement]] on an [[pp-aux-graph|auxiliary graph]].',
          formal: '[[pp-gauging|Gauging]] (WY24 Algorithm 1) measures $L = \\bar X$ through a connected [[pp-aux-graph|auxiliary graph]] $G = (V, E)$ whose vertices are the qubits of its support; each edge is a new qubit in $|0\\rangle$. A $Z$ check meeting the support in two qubits forces an edge or path between them: here $(0,3)$ and $(3,6)$ of the $d = 3$ patch.',
          stage: {
            recipe: 'gauge-graph',
            params: {
              host: 'patch3-x',
              show: ['vertices', 'edges'],
            },
          },
          caption: 'three dots, two links, on the patch column',
          captionFormal: '$V = 3$, $E = 2$, no cycle',
          fidelity: ['qc-graph-one-choice'],
          claims: [
            {
              key: 'b3GaugeV',
              text: 'the graph on one patch column has 3 dots',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patch3-x',
                  show: ['vertices', 'edges'],
                },
              },
              value: 'V',
            },
            {
              key: 'b3GaugeE',
              text: 'the graph on one patch column has 2 links',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patch3-x',
                  show: ['vertices', 'edges'],
                },
              },
              value: 'E',
            },
          ],
          trail: [
            { ref: 'wy24', at: 'Algorithm 1', why: 'The graph on the support and the edge qubits in the zero state.' },
          ],
        },
        {
          id: 'b3-gauging:b2',
          phase: 'books',
          introduces: ['pp-vertex-check', 'pp-cycle-check'],
          text: 'Add a [[pp-vertex-check|dot check]] for each dot: $X$ on the dot and on its links. Add a [[pp-cycle-check|loop check]] for each loop of links: $Z$ on the loop. Multiply the dot checks and every link cancels, leaving the logical.',
          formal: '[[pp-vertex-check|Vertex checks]] $A_v = X_v\\prod_{e\\ni v}X_e$ and [[pp-cycle-check|cycle checks]] $B_c = \\prod_{e\\in c}Z_e$ for a cycle basis; each original $Z$ check on the support is deformed by $Z$ along its path. Every edge lies in two $A_v$, so $\\prod_vA_v = L$ (WY24 Theorem 1).',
          stage: {
            recipe: 'gauge-graph',
            params: {
              host: 'patch3-x',
              show: ['vertices', 'edges'],
              focus: { vertex: 1 },
            },
          },
          caption: 'the dot check on the middle dot; all dot checks multiplied: only the dots\' X remain',
          captionFormal: '$A_v$ on $v = 3$; $\\prod_vA_v = X_0X_3X_6$',
          derivation: {
            result: '\\prod_v A_v = L',
            ground: [
              {
                tex: 'A_v = X_v\\prod_{e\\ni v}X_e',
                why: 'One dot check lights a dot and the links that touch it.',
                view: {
                  recipe: 'gauge-graph',
                  params: {
                    host: 'patch3-x',
                    show: ['vertices', 'edges'],
                    focus: { vertex: 1 },
                  },
                },
                viewCaption: 'one dot check',
              },
              {
                tex: 'e \\in A_u \\text{ and } e \\in A_v',
                why: 'Every link touches exactly two dots, so it sits in exactly two dot checks.',
                view: {
                  recipe: 'gauge-graph',
                  params: {
                    host: 'patch3-x',
                    show: ['vertices', 'edges'],
                    product: true,
                  },
                },
                viewCaption: 'every link twice',
              },
              { tex: 'X_eX_e = I', why: 'In the product each link appears twice and cancels.' },
              {
                tex: '\\prod_v A_v = \\prod_v X_v = L',
                why: 'Only the dots\' $X$ remain: that is $L$.',
                view: {
                  recipe: 'gauge-graph',
                  params: {
                    host: 'patch3-x',
                    show: ['vertices'],
                  },
                },
                viewCaption: 'the dots remain',
              },
            ],
            formal: [
              {
                tex: 'A_v = X_v\\prod_{e\\ni v}X_e',
                why: 'The vertex check of one dot.',
                view: {
                  recipe: 'gauge-graph',
                  params: {
                    host: 'patch3-x',
                    show: ['vertices', 'edges'],
                    focus: { vertex: 1 },
                  },
                },
                viewCaption: 'one dot check',
              },
              {
                tex: '\\prod_v A_v = \\prod_v X_v \\prod_e X_e^{2}',
                why: 'Each edge belongs to the vertex checks of its two ends.',
                view: {
                  recipe: 'gauge-graph',
                  params: {
                    host: 'patch3-x',
                    show: ['vertices', 'edges'],
                    product: true,
                  },
                },
                viewCaption: 'every link twice',
              },
              {
                tex: '\\prod_v A_v = L',
                why: 'The squares are the identity, and the product of the dots is $L$.',
                view: {
                  recipe: 'gauge-graph',
                  params: {
                    host: 'patch3-x',
                    show: ['vertices'],
                  },
                },
                viewCaption: 'the dots remain',
              },
            ],
          },
          claims: [
            {
              key: 'b3ProdGauss',
              text: 'the dot checks multiply to the logical operator',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patch3-x',
                  show: ['vertices', 'edges'],
                },
              },
              value: 'productOk',
            },
          ],
          trail: [
            { ref: 'wy24', at: 'Theorem 1', why: 'The product of the vertex outcomes is the measured value.' },
          ],
        },
        {
          id: 'b3-gauging:b3',
          phase: 'books',
          introduces: ['pp-cycle-basis'],
          text: 'For both patches, join their two paths with three rungs. The graph is a ladder with seven links and two square loops. The code grows from 18 qubits to 25, which is 39 % more. The deformed code is the code with the new qubits and checks. A graph with $V$ dots and $E$ links has $E - V + 1$ independent loops. A list of independent loops that builds all others is a [[pp-cycle-basis|cycle basis]].',
          formal: 'A connected graph has cycle rank $E - V + 1$, the size of a [[pp-cycle-basis|cycle basis]] (<<pp-f7-gf2|null space over GF(2)>>). For $\\bar X_A\\bar X_B$ on two $d=3$ patches the ladder has $V = 6$, $E = 7$, so 2 cycle checks; the deformed code has $n = 18 + 7 = 25$, a growth of $7/18 \\approx 0.39$, and $k = 2 \\to 1$ (WY24 Fig. 1b).',
          stage: {
            recipe: 'gauge-graph',
            params: {
              host: 'patches3-xx',
              rungs: 3,
              show: ['vertices', 'edges', 'cycles'],
            },
          },
          caption: 'the ladder on the six dots next to the seam',
          captionFormal: '$V=6$, $E=7$, cycle rank $2$; $n=25$, $k: 2\\to1$',
          fidelity: ['qc-graph-one-choice'],
          claims: [
            {
              key: 'b3CycleRank',
              text: 'the ladder has 2 independent loops',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patches3-xx',
                  rungs: 3,
                  show: ['vertices', 'edges', 'cycles'],
                },
              },
              value: 'cycles',
            },
            {
              key: 'b3GaugedN',
              text: 'the deformed code has 25 qubits',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patches3-xx',
                  rungs: 3,
                  show: ['vertices', 'edges', 'cycles'],
                },
              },
              value: 'n',
            },
            {
              key: 'b3GaugedK',
              text: 'the deformed code stores 1 qubit',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patches3-xx',
                  rungs: 3,
                  show: ['vertices', 'edges', 'cycles'],
                },
              },
              value: 'k',
            },
            {
              key: 'b3GaugeGrowth',
              text: 'the ladder adds 7 qubits to the 18 of the two patches, which is 39 percent more',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patches3-xx',
                  rungs: 3,
                  show: ['vertices', 'edges', 'cycles'],
                },
              },
              value: 'growth',
            },
          ],
          trail: [
            { ref: 'wy24', at: 'Fig. 1b', why: 'Gauging on a ladder graph recovers lattice surgery.' },
          ],
        },
        {
          id: 'b3-gauging:b4',
          phase: 'books',
          text: 'Measure all dot and loop checks for several rounds. The logical\'s value is the product of the dot readings. Then read every link in $Z$. A path rule says which $X$ correction to track, never apply.',
          formal: 'Measure all checks for $R$ rounds; $\\sigma = \\prod_vA_v$ is the outcome. Then measure $Z_e$ on every edge: the sign of $\\prod Z_e$ along a path from a root to $v$ fixes a byproduct $X_v$, tracked as a frame (WY24 Algorithm 1, steps 2 to 4).',
          stage: {
            recipe: 'gauge-graph',
            params: {
              host: 'patches3-xx',
              rungs: 3,
              show: ['vertices', 'edges', 'checks'],
            },
          },
          caption: 'round after round: the dot readings multiply to the answer; then the links are read out',
          captionFormal: '$\\sigma = \\prod_vA_v$ over $R$ rounds; then $Z_e$ on every edge',
          trail: [
            {
              ref: 'wy24',
              at: 'Algorithm 1, steps 2 to 4',
              why: 'Repeated checks, the product of the vertex outcomes, then the edge readout and its byproduct.',
            },
          ],
        },
        {
          id: 'b3-gauging:b5',
          phase: 'clue',
          text: 'The seam used 3 new qubits; the ladder uses 7. Do they measure the same thing? Do they keep the same distance?',
          formal: 'Compare the lattice-surgery seam with the ladder gauging graph for $\\bar X_A\\bar X_B$: new qubits, deformed $X$- and $Z$-distances.',
          stage: {
            recipe: 'surgery-merge-split',
            params: { d: 3, step: 'merged' },
          },
          caption: 'the merged patch of lattice surgery',
          captionFormal: 'the merged $3\\times7$ patch',
          reveal: {
            text: 'Same operator, same distances, 3 and 7. The surgery seam is one thrifty choice; gauging is the general recipe, and its graph may have loops.',
            formal: 'Both leave deformed distances $(d_X, d_Z) = (3, 7)$ and measure $\\bar X_A\\bar X_B$; the seam qubits are the edges of a 4-vertex path whose vertices are the four new checks, the ladder keeps one vertex per support qubit.',
            caption: 'seam: 21 qubits; ladder: 25 qubits; distances 3 and 7 for both',
            captionFormal: 'seam $n=21$, ladder $n=25$; $(d_X,d_Z)=(3,7)$ for both',
            stage: {
              layout: 'split',
              top: {
                recipe: 'surgery-merge-split',
                params: { d: 3, step: 'merged' },
              },
              bottom: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 3 },
              },
            },
            claims: [
              {
                key: 'b3EdgeQubits1',
                text: 'lattice surgery uses 3 new qubits',
                from: {
                  recipe: 'gauge-graph',
                  params: { host: 'seam3' },
                },
                value: 'E',
              },
              {
                key: 'b3EdgeQubits2',
                text: 'the ladder gauging uses 7 new qubits',
                from: {
                  recipe: 'gauge-graph',
                  params: { host: 'patches3-xx', rungs: 3 },
                },
                value: 'E',
              },
              {
                key: 'b3MergedDist1',
                text: 'the merged patch has X-distance 3',
                from: {
                  recipe: 'gauge-graph',
                  params: { host: 'seam3' },
                },
                value: 'dX',
              },
              {
                key: 'b3MergedDist2',
                text: 'the merged patch has Z-distance 7',
                from: {
                  recipe: 'gauge-graph',
                  params: { host: 'seam3' },
                },
                value: 'dZ',
              },
              {
                key: 'b3LadderDist1',
                text: 'the ladder code has X-distance 3',
                from: {
                  recipe: 'gauge-graph',
                  params: { host: 'patches3-xx', rungs: 3 },
                },
                value: 'dX',
              },
              {
                key: 'b3LadderDist2',
                text: 'the ladder code has Z-distance 7',
                from: {
                  recipe: 'gauge-graph',
                  params: { host: 'patches3-xx', rungs: 3 },
                },
                value: 'dZ',
              },
            ],
          },
        },
      ],
      review: {
        points: [
          'Gauging measures a logical by giving its support a graph: dots are the support qubits, links are new qubits.',
          'A check at every dot multiplies to the logical; a check at every independent loop keeps the code consistent.',
          'A graph with V dots and E links has E - V + 1 independent loops.',
          'Lattice surgery is one particular choice of graph; gauging allows many.',
        ],
        equations: 'A_v = X_v\\prod_{e\\ni v}X_e',
        trap: 'Assuming the graph can be any tree: a thin tree such as one rung can weaken the code.',
        formal: {
          points: [
            'Algorithm 1 adds edge qubits in $|0\\rangle$, measures $A_v$ and $B_c$ for rounds, and reads $\\sigma=\\prod_vA_v$ (WY24).',
            'The deformed $Z$ checks multiply the old ones by $Z$ along a path of the graph; the cycle rank $E-V+1$ counts the independent $B_c$.',
            'On two $d=3$ patches the ladder gives $n=25$, $k:2\\to1$ and deformed distances $(3,7)$, as lattice surgery does.',
          ],
          equations: 'A_v=X_v\\prod_{e\\ni v}X_e,\\quad B_c=\\prod_{e\\in c}Z_e',
          trap: 'Taking any connected graph to be as good as any other: the distance depends on its expansion.',
        },
      },
      play: [
        {
          id: 'b3-g-rank',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Links of the path',
          prompt: 'The logical X of one distance-3 patch acts on a column of three qubits. The path graph on those three dots has how many links, that is, how many new qubits?',
          answerFrom: {
            from: {
              recipe: 'gauge-graph',
              params: {
                host: 'patch3-x',
                show: ['vertices', 'edges'],
              },
            },
            value: 'E',
          },
          tolerance: 0.005,
          hints: [
            { text: 'A path joins its dots one after another.' },
            { text: 'Three dots in a row have gaps between neighbours.' },
            { text: 'Two gaps.' },
          ],
          walkthrough: [
            { text: 'A path through three dots has one link between the first two and one between the last two.' },
            { text: 'That is 2 links, so 2 new qubits.' },
          ],
        },
        {
          id: 'b3-g-ladder',
          kind: 'numeric',
          tier: 'core',
          title: 'Loops of a ladder',
          prompt: 'Join the two paths of the two patches with only two rungs. How many independent loops does the graph have?',
          answerFrom: {
            from: {
              recipe: 'gauge-graph',
              params: { host: 'patches3-xx', rungs: 2 },
            },
            value: 'cycles',
          },
          tolerance: 0.005,
          hints: [
            { text: 'Count dots and links first.' },
            { text: 'Six dots; four path links plus the rungs.' },
            { text: 'Links minus dots plus one.' },
          ],
          walkthrough: [
            { text: 'Six dots, and 4 + 2 = 6 links.' },
            { text: 'Loops: 6 - 6 + 1 = 1.' },
          ],
        },
        {
          id: 'b3-g-k',
          kind: 'choice',
          tier: 'core',
          title: 'Stored qubits after gauging',
          prompt: 'Two patches store two qubits. Gauging their joint logical X changes the number of stored qubits to...',
          options: [
            { text: '0', correct: false, why: 'Only one logical is measured, so one stored qubit remains.' },
            { text: '1', correct: true, why: 'The measured logical product is no longer free: one stored qubit is used up.' },
            { text: '2', correct: false, why: 'A measured logical operator joins the check list, so k must drop.' },
            { text: '3', correct: false, why: 'The new qubits are fixed by the new checks; none of them stores data.' },
          ],
          hints: [
            { text: 'Measuring a logical operator adds one new check.' },
            { text: 'Each independent check removes one stored qubit.' },
            { text: 'Two minus one.' },
          ],
          walkthrough: [
            { text: 'The ladder adds 7 qubits and 8 independent checks: 6 dot checks and 2 loop checks.' },
            { text: 'So the deformed code stores 2 + 7 - 8 = 1 qubit.' },
          ],
        },
      ],
      pitfalls: [
        'Thinking the new link qubits store data: the new checks fix them, and they carry only the bookkeeping of the measurement.',
      ],
    },
    {
      id: 'b3-distance',
      title: 'Keeping the distance while measuring',
      question: 'What must graph and rounds satisfy so measuring does not weaken the code?',
      source: {
        summary: 'Williamson and Yoder show that a well-connected graph and about d rounds of checks keep the distance of the code during the measurement.',
        where: 'WY24 Theorem 2, Lemma 2, Theorem 4; Cro24 Def. 3',
      },
      tryIt: {
        kind: 'bit-table',
        props: { mode: 'strings', a: '0100100', b: '0000000', combine: 'xor' },
        tryThis: [
          'Read the first row as seven rounds of the product reading, with a 1 wherever a misread flipped it. The readout says the rows differ in 2 places.',
          'The majority vote is wrong only when 4 or more of the 7 rounds are wrong. Flip two more places in the first row to reach 4 and see the count change.',
        ],
      },
      insight: 'A thin graph lets a single error slip through the measurement, and a single wrong reading can flip the answer. Wide bridges and repeated rounds guard both.',
      insightFormal: 'The deformed distance obeys $d\'\\ge\\min(h,1)\\,d$ with $h$ the Cheeger constant of the graph (WY24 Lemma 2); about $d$ rounds guard the readout so that time-like and space-like faults both need $d$ faults.',
      story: [
        {
          id: 'b3-distance:b1',
          phase: 'books',
          text: 'Use one rung instead of three. The graph is still connected and measures the same logical. But the deformed code now has distance 1: a single error can slip through.',
          formal: 'With the forced path edges and one bridge edge the graph is a tree, $k\' = 1$, yet the deformed $X$-distance is 1; two rungs give 2 and three give 3, with $Z$-distance 7 throughout. Connectivity alone does not protect the distance. This family of ladders is our teaching family, not the paper\'s.',
          stage: {
            recipe: 'gauge-graph',
            params: {
              host: 'patches3-xx',
              rungs: 1,
              readouts: ['cycles', 'distance'],
            },
          },
          caption: 'one rung, two rungs, three rungs: the distance climbs 1, 2, 3',
          captionFormal: 'rungs 1, 2, 3: deformed $X$-distance 1, 2, 3; loops 0, 1, 2',
          fidelity: ['qc-graph-one-choice'],
          claims: [
            {
              key: 'b3DistTable1',
              text: 'with one rung the deformed X-distance is 1',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 1 },
              },
              value: 'dX',
            },
            {
              key: 'b3DistTable2',
              text: 'with two rungs the deformed X-distance is 2',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 2 },
              },
              value: 'dX',
            },
            {
              key: 'b3DistTable3',
              text: 'with three rungs the deformed X-distance is 3',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 3 },
              },
              value: 'dX',
            },
            {
              key: 'b3Cycles1',
              text: 'one rung leaves 0 loops',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 1 },
              },
              value: 'cycles',
            },
            {
              key: 'b3Cycles2',
              text: 'two rungs make 1 loop',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 2 },
              },
              value: 'cycles',
            },
            {
              key: 'b3Cycles3',
              text: 'three rungs make 2 loops',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 3 },
              },
              value: 'cycles',
            },
          ],
          trail: [
            { ref: 'wy24', at: 'Theorem 2', why: 'The graph conditions that keep the distance.' },
          ],
        },
        {
          id: 'b3-distance:b2',
          phase: 'books',
          introduces: ['pp-cheeger'],
          text: 'Measure a graph\'s bottleneck. For a set of at most half the dots, count the links leaving it and divide by the set\'s size. The smallest such ratio is the [[pp-cheeger|Cheeger constant]] $h$. One rung gives $\\tfrac13$; the ladder gives 1.',
          formal: 'The [[pp-cheeger|Cheeger constant]] is $h(G) = \\min_{0<|S|\\le|V|/2}|\\partial S|/|S|$, with $\\partial S$ the edges leaving $S$. WY24 Lemma 2 bounds the deformed distance below by $\\min(h,1)\\,d$; here $h = \\tfrac13, \\tfrac23, 1$ and the distance is exactly $d\\,h = 1, 2, 3$, so the bound is tight on this family.',
          stage: {
            recipe: 'gauge-graph',
            params: {
              host: 'patches3-xx',
              rungs: 1,
              subset: 'worst',
              readouts: ['cheeger'],
            },
          },
          caption: 'the worst set of dots (shaded) and the links leaving it',
          captionFormal: 'the worst set $S$ and its boundary $\\partial S$',
          claims: [
            {
              key: 'b3Cheeger1',
              text: 'with one rung the Cheeger constant is one third',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 1 },
              },
              value: 'h',
            },
            {
              key: 'b3Cheeger2',
              text: 'with two rungs the Cheeger constant is two thirds',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 2 },
              },
              value: 'h',
            },
            {
              key: 'b3Cheeger3',
              text: 'with three rungs the Cheeger constant is 1',
              from: {
                recipe: 'gauge-graph',
                params: { host: 'patches3-xx', rungs: 3 },
              },
              value: 'h',
            },
          ],
          trail: [
            { ref: 'wy24', at: 'Lemma 2', why: 'The distance is at least min(h, 1) d.' },
            { ref: 'cro24', at: 'Def. 3 and Theorem 6', why: 'The same idea for layered systems.' },
          ],
        },
        {
          id: 'b3-distance:b3',
          phase: 'books',
          text: 'Drop a loop check and the code gains a spare qubit that nothing constrains: a [[pp-gauge-qubit|gauge qubit]]. It carries no data. Dropping both loop checks of the ladder leaves two spare qubits.',
          formal: 'Omitting a cycle check enlarges the unfixed gauge group of this subsystem code: the ladder with 2, 1, 0 cycle checks has $k_{\\rm total} = 1, 2, 3$; the extras are [[pp-gauge-qubit|gauge qubits]] and the data count stays one. Which cycles to keep is a design choice that trades check weight against protection (the Tour de gross paper keeps only some).',
          stage: {
            recipe: 'gauge-graph',
            params: {
              host: 'patches3-xx',
              rungs: 3,
              show: ['cycles'],
              drop: 1,
            },
          },
          caption: 'cycle checks kept: 2, 1, 0; spare qubits: 0, 1, 2',
          captionFormal: 'cycle checks kept $2,1,0$: $k_{\\rm total}=1,2,3$',
          claims: [
            {
              key: 'b3GaugeQubits1',
              text: 'with both loop checks there are 0 spare qubits',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patches3-xx',
                  rungs: 3,
                  show: ['cycles'],
                  drop: 0,
                },
              },
              value: 'gaugeQubits',
            },
            {
              key: 'b3GaugeQubits2',
              text: 'with one loop check dropped there is 1 spare qubit',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patches3-xx',
                  rungs: 3,
                  show: ['cycles'],
                  drop: 1,
                },
              },
              value: 'gaugeQubits',
            },
            {
              key: 'b3GaugeQubits3',
              text: 'with both loop checks dropped there are 2 spare qubits',
              from: {
                recipe: 'gauge-graph',
                params: {
                  host: 'patches3-xx',
                  rungs: 3,
                  show: ['cycles'],
                  drop: 2,
                },
              },
              value: 'gaugeQubits',
            },
          ],
          trail: [
            { ref: 'cro24', at: '§3.1', why: 'Gauge degrees of freedom made into stabilizers by added checks.' },
          ],
        },
        {
          id: 'b3-distance:b4',
          phase: 'books',
          text: 'A reading can lie. If a seam check misreads, the product flips. With four checks each misreading two times in a hundred, the product lies about 7.5 % of the time. Read it again and again, and vote. A lying reading is a [[pp-time-like|time-like failure]].',
          formal: 'With $m = 4$ checks, each reading flipped independently with $q = 2\\times10^{-2}$, the product reading flips with chance $(1-(1-2q)^m)/2 = 0.0753$. The vote over $R$ rounds fails when more than half are wrong: $\\sum_{j>R/2}\\binom Rj p^j(1-p)^{R-j}$, a toy for the [[pp-time-like|time-like]] half of the argument (WY24 Theorem 4).',
          stage: {
            recipe: 'product-repeat',
            params: {
              checks: 4,
              rounds: 7,
              q: 0.02,
              faults: [
                { round: 2, check: 3 },
                { round: 5, check: 1 },
                { round: 5, check: 4 },
              ],
              plot: true,
            },
          },
          caption: 'seven rounds of readings; flipped ones marked; the vote',
          captionFormal: '$p = 0.0753$; $R = 1,3,5,7,9,11$: failure 0.0753, 0.0162, 0.0038, 0.00094, 0.00024, 0.00006',
          fidelity: ['qc-spacetime-toy'],
          derivation: {
            result: '\\lim_{R\\to\\infty}\\frac{P_{\\rm fail}(R+2)}{P_{\\rm fail}(R)} = 4p(1-p)',
            ground: [
              {
                tex: 'p = P(\\text{an odd number of the } m \\text{ readings flip})',
                why: 'Four checks, each misreading now and then: the product reading flips when an odd number of them flip.',
                view: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    show: ['readings'],
                  },
                },
                viewCaption: 'readings, flips marked',
              },
              {
                tex: '\\text{vote wrong} \\iff \\text{more than } R/2 \\text{ rounds wrong}',
                why: 'The vote fails when more than half of the rounds read the product wrongly.',
                view: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    show: ['readings', 'product', 'vote'],
                  },
                },
                viewCaption: 'the vote',
              },
              {
                tex: '\\lim_{R\\to\\infty}\\frac{P_{\\rm fail}(R+2)}{P_{\\rm fail}(R)} = 4p(1-p)',
                why: 'Two more rounds multiply the failure chance by a factor that settles near 0.28.',
                view: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    only: 'plot',
                  },
                },
                viewCaption: 'failure against rounds',
              },
            ],
            formal: [
              {
                tex: 'p = \\frac{1-(1-2q)^m}{2}',
                why: 'Sum over the 16 flip patterns with an odd number of flips.',
                view: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    show: ['readings'],
                  },
                },
                viewCaption: 'readings, flips marked',
              },
              {
                tex: 'P_{\\rm fail}(R) = \\sum_{j>R/2}\\binom Rj p^j(1-p)^{R-j}',
                why: 'The binomial tail for a majority of wrong rounds.',
                view: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    show: ['readings', 'product', 'vote'],
                  },
                },
                viewCaption: 'the vote',
              },
              {
                tex: '\\lim_{R\\to\\infty}\\frac{P_{\\rm fail}(R+2)}{P_{\\rm fail}(R)} = 4p(1-p)',
                why: 'The ratio of consecutive tails tends to this factor.',
                view: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    only: 'plot',
                  },
                },
                viewCaption: 'failure against rounds',
              },
            ],
          },
          claims: [
            {
              key: 'b3ProdFlip',
              text: 'the product of four readings is wrong with chance 0.0753',
              from: {
                recipe: 'product-repeat',
                params: {
                  checks: 4,
                  rounds: 7,
                  q: 0.02,
                  faults: [
                    { round: 2, check: 3 },
                    { round: 5, check: 1 },
                    { round: 5, check: 4 },
                  ],
                  plot: true,
                },
              },
              value: 'pProd',
            },
            {
              key: 'b3RoundsFail1',
              text: 'one round fails with chance 0.0753',
              from: {
                recipe: 'product-repeat',
                params: {
                  checks: 4,
                  rounds: 7,
                  q: 0.02,
                  faults: [
                    { round: 2, check: 3 },
                    { round: 5, check: 1 },
                    { round: 5, check: 4 },
                  ],
                  plot: true,
                },
              },
              value: 'fail1',
            },
            {
              key: 'b3RoundsFail2',
              text: 'three rounds fail with chance 0.0162',
              from: {
                recipe: 'product-repeat',
                params: {
                  checks: 4,
                  rounds: 7,
                  q: 0.02,
                  faults: [
                    { round: 2, check: 3 },
                    { round: 5, check: 1 },
                    { round: 5, check: 4 },
                  ],
                  plot: true,
                },
              },
              value: 'fail2',
            },
            {
              key: 'b3RoundsFail3',
              text: 'five rounds fail with chance 0.0038',
              from: {
                recipe: 'product-repeat',
                params: {
                  checks: 4,
                  rounds: 7,
                  q: 0.02,
                  faults: [
                    { round: 2, check: 3 },
                    { round: 5, check: 1 },
                    { round: 5, check: 4 },
                  ],
                  plot: true,
                },
              },
              value: 'fail3',
            },
            {
              key: 'b3RoundsFail4',
              text: 'seven rounds fail with chance 0.00094',
              from: {
                recipe: 'product-repeat',
                params: {
                  checks: 4,
                  rounds: 7,
                  q: 0.02,
                  faults: [
                    { round: 2, check: 3 },
                    { round: 5, check: 1 },
                    { round: 5, check: 4 },
                  ],
                  plot: true,
                },
              },
              value: 'fail4',
            },
            {
              key: 'b3RoundsFail5',
              text: 'nine rounds fail with chance 0.00024',
              from: {
                recipe: 'product-repeat',
                params: {
                  checks: 4,
                  rounds: 7,
                  q: 0.02,
                  faults: [
                    { round: 2, check: 3 },
                    { round: 5, check: 1 },
                    { round: 5, check: 4 },
                  ],
                  plot: true,
                },
              },
              value: 'fail5',
            },
            {
              key: 'b3RoundsFail6',
              text: 'eleven rounds fail with chance 0.00006',
              from: {
                recipe: 'product-repeat',
                params: {
                  checks: 4,
                  rounds: 7,
                  q: 0.02,
                  faults: [
                    { round: 2, check: 3 },
                    { round: 5, check: 1 },
                    { round: 5, check: 4 },
                  ],
                  plot: true,
                },
              },
              value: 'fail6',
            },
            {
              key: 'b3VoteRatio',
              text: 'for many rounds, two more rounds multiply the failure chance by about 0.28 (the limit 4p(1−p))',
              from: {
                recipe: 'product-repeat',
                params: {
                  checks: 4,
                  rounds: 7,
                  q: 0.02,
                  faults: [
                    { round: 2, check: 3 },
                    { round: 5, check: 1 },
                    { round: 5, check: 4 },
                  ],
                  plot: true,
                },
              },
              value: 'ratio',
            },
          ],
          trail: [
            {
              ref: 'wy24',
              at: 'Theorem 4',
              why: 'About d rounds before, during and after the measurement; the vote here is our toy model, not the theorem.',
            },
          ],
        },
        {
          id: 'b3-distance:b5',
          phase: 'clue',
          text: 'With the same misreads, how many rounds (odd) make the vote fail less than once in a thousand?',
          formal: 'Find the least odd $R$ with vote failure below $10^{-3}$ for $p = 0.0753$.',
          stage: {
            recipe: 'product-repeat',
            params: {
              checks: 4,
              rounds: 7,
              q: 0.02,
              faults: [
                { round: 2, check: 3 },
                { round: 5, check: 1 },
                { round: 5, check: 4 },
              ],
              show: ['readings', 'product', 'vote'],
            },
          },
          caption: 'seven rounds of readings, as before',
          captionFormal: 'seven rounds, the product readings and the vote',
          reveal: {
            text: 'Seven rounds: failure 0.00094. Five rounds give 0.0038. The real theorem asks about $d$ rounds so that time-like and space-like failures both need $d$ faults.',
            formal: '$R = 7$: 0.00094; $R = 5$: 0.0038. Each two extra rounds multiply failure by about $4p(1-p) = 0.28$ asymptotically. The theorem\'s $d$ rounds make time-like and space-like faults equally costly.',
            caption: 'failure against rounds, with the 1-in-1000 line',
            captionFormal: 'failure against rounds, with the line at $10^{-3}$',
            stage: {
              recipe: 'product-repeat',
              params: {
                checks: 4,
                rounds: 7,
                q: 0.02,
                faults: [
                  { round: 2, check: 3 },
                  { round: 5, check: 1 },
                  { round: 5, check: 4 },
                ],
                plot: true,
              },
            },
            claims: [
              {
                key: 'b3RoundsFor1e3',
                text: 'seven is the least odd number of rounds with failure below one in a thousand',
                from: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    plot: true,
                  },
                },
                value: 'roundsFor1e3',
              },
              {
                key: 'b3RoundsFail4b',
                text: 'seven rounds fail with chance 0.00094',
                from: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    plot: true,
                  },
                },
                value: 'fail4',
              },
              {
                key: 'b3RoundsFail3b',
                text: 'five rounds fail with chance 0.0038',
                from: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    plot: true,
                  },
                },
                value: 'fail3',
              },
              {
                key: 'b3VoteRatio2',
                text: 'for many rounds, two more rounds multiply the failure chance by about 0.28 (the limit 4p(1−p))',
                from: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    plot: true,
                  },
                },
                value: 'ratio',
              },
              {
                key: 'b3ProdFlip2',
                text: 'the product of four readings is wrong with chance 0.0753',
                from: {
                  recipe: 'product-repeat',
                  params: {
                    checks: 4,
                    rounds: 7,
                    q: 0.02,
                    faults: [
                      { round: 2, check: 3 },
                      { round: 5, check: 1 },
                      { round: 5, check: 4 },
                    ],
                    plot: true,
                  },
                },
                value: 'pProd',
              },
            ],
          },
        },
      ],
      review: {
        claims: [
          {
            key: 'b3CheegerR1',
            text: 'with one rung the Cheeger constant is one third',
            from: {
              recipe: 'gauge-graph',
              params: { host: 'patches3-xx', rungs: 1 },
            },
            value: 'h',
          },
          {
            key: 'b3CheegerR2',
            text: 'with two rungs the Cheeger constant is two thirds',
            from: {
              recipe: 'gauge-graph',
              params: { host: 'patches3-xx', rungs: 2 },
            },
            value: 'h',
          },
        ],
        points: [
          'A graph that is connected but thin can let one error through: the distance can drop to 1.',
          'The Cheeger constant measures the worst bottleneck; the distance stays near min(h, 1) times the old distance.',
          'Dropping a loop check turns that loop into a spare gauge qubit that carries no data.',
          'A lying reading is repaired by repeating the measurement for about d rounds and voting.',
        ],
        equations: 'h(G) = \\min |\\partial S| / |S|',
        trap: 'Believing that a connected graph is enough.',
        formal: {
          points: [
            'WY24 Lemma 2: the deformed distance is at least $\\min(h,1)\\,d$, with $h$ the Cheeger constant; here $h=\\tfrac13,\\tfrac23,1$ gives distances $1,2,3$.',
            'Omitting a cycle check enlarges the gauge group of the subsystem code without changing the data count.',
            'The product reading flips with chance $(1-(1-2q)^m)/2$; the vote of $R$ readings fails with the binomial tail, falling by about $4p(1-p)$ per two rounds.',
          ],
          equations: 'd\'\\ge\\min(h,1)\\,d',
          trap: 'Treating the vote as the theorem: the real argument counts d rounds so that both kinds of fault cost d faults.',
        },
      },
      play: [
        {
          id: 'b3-d-h',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'The ladder bottleneck',
          prompt: 'The three-rung ladder has six dots. What is its Cheeger constant?',
          answerFrom: {
            from: {
              recipe: 'gauge-graph',
              params: { host: 'patches3-xx', rungs: 3 },
            },
            value: 'h',
          },
          tolerance: 0.005,
          hints: [
            { text: 'Try the set of the three dots of one patch.' },
            { text: 'Three links leave it, and its size is 3.' },
            { text: 'No set of at most three dots does worse.' },
          ],
          walkthrough: [
            { text: 'The three dots of one patch have 3 links leaving them.' },
            { text: 'The ratio is 3/3 = 1, and no smaller ratio exists.' },
          ],
        },
        {
          id: 'b3-d-two',
          kind: 'numeric',
          tier: 'core',
          title: 'Two rungs',
          prompt: 'With two rungs between the patches, what is the deformed X-distance?',
          answerFrom: {
            from: {
              recipe: 'gauge-graph',
              params: { host: 'patches3-xx', rungs: 2 },
            },
            value: 'dX',
          },
          tolerance: 0.005,
          hints: [
            { text: 'The distance equals d times the Cheeger constant on this family.' },
            { text: 'Two rungs give a Cheeger constant of two thirds.' },
            { text: 'Three times two thirds.' },
          ],
          walkthrough: [
            { text: 'The Cheeger constant is 2/3.' },
            { text: 'The distance is 3 times 2/3 = 2.' },
          ],
        },
        {
          id: 'b3-d-rounds',
          kind: 'numeric',
          tier: 'core',
          title: 'How many rounds',
          prompt: 'The product reading is wrong with chance 0.0753 in each round. What is the least odd number of rounds whose majority vote fails less than once in a thousand?',
          answerFrom: {
            from: {
              recipe: 'product-repeat',
              params: {
                checks: 4,
                rounds: 7,
                q: 0.02,
                faults: [
                  { round: 2, check: 3 },
                  { round: 5, check: 1 },
                  { round: 5, check: 4 },
                ],
                plot: true,
              },
            },
            value: 'roundsFor1e3',
          },
          tolerance: 0.005,
          hints: [
            { text: 'Compute the vote failure for 1, 3, 5, 7 rounds.' },
            { text: 'Five rounds fail with chance 0.0038, which is too large.' },
            { text: 'Try seven rounds.' },
          ],
          walkthrough: [
            { text: 'Five rounds fail with chance 0.0038, above one in a thousand.' },
            { text: 'Seven rounds fail with chance 0.00094, below it.' },
          ],
        },
      ],
      pitfalls: [
        'Reading the vote as proof of the distance theorem: it models only the time-like half, with independent flips.',
      ],
    },
    {
      id: 'b3-bridges',
      title: 'Bridges and adapters between blocks',
      question: 'How do two codes measure a product of their logicals?',
      source: {
        summary: 'Cross and coauthors join the measurement graphs of two code blocks with a bridge; Swaroop and coauthors allow a matching between different codes, an adapter.',
        where: 'Cro24 §3.6-3.8 and §4; SJY24 Defs. 1-2, Theorem 5, Def. 8',
      },
      tryIt: {
        kind: 'bit-table',
        props: {
          mode: 'reduce',
          rows: ['1010', '1001', '0110', '0101'],
        },
        tryThis: [
          'Two graphs with one link each, joined by two bridge links: the rows are the four dots written against the four links. Press Step to the end: the rank is 3.',
          'The null space lists 0000 and 1111: one loop, which is w - 1 for w = 2 bridge links.',
        ],
      },
      insight: 'Two measurement graphs joined by w links have w - 1 extra loops, and the joined code keeps distance when the bridge is wide enough. An adapter does the same between different codes.',
      insightFormal: 'The joined graph has cycle rank $(E_A-V_A+1)+(E_B-V_B+1)+w-1$; a bridge or adapter of width $w$ gives deformed distance $\\min(w,d)$ on the teaching family. An adapter needs no common code on the two sides (Cro24 Lemmas 15 and 16; SJY24 Def. 8).',
      story: [
        {
          id: 'b3-bridges:b1',
          phase: 'books',
          text: 'To measure a product across two blocks, join their two graphs with extra links, the [[pp-bridge|bridge]]. Each extra link beyond the first adds one loop: $w$ links add $w - 1$.',
          formal: 'Joining graphs $G_A$, $G_B$ by a [[pp-bridge|bridge]] of $w$ edges gives a connected graph of cycle rank $(E_A - V_A + 1) + (E_B - V_B + 1) + w - 1$; a bridge of $|B|$ qubits needs $|B| - 1$ new cycle checks and the joined code has $k - 1$ logical qubits (Cro24 §3.6).',
          stage: {
            recipe: 'bridge-join',
            params: { w: 2 },
          },
          caption: 'two paths, one to three bridge links: loops 0, 1, 2',
          captionFormal: '$w$ bridge edges: $w-1$ new cycles',
          fidelity: ['qc-graph-one-choice'],
          claims: [
            {
              key: 'b3BridgeCycles1',
              text: 'a bridge of 1 link adds 0 loops',
              from: {
                recipe: 'bridge-join',
                params: { w: 1 },
              },
              value: 'cycles',
            },
            {
              key: 'b3BridgeCycles2',
              text: 'a bridge of 2 links adds 1 loop',
              from: {
                recipe: 'bridge-join',
                params: { w: 2 },
              },
              value: 'cycles',
            },
            {
              key: 'b3BridgeCycles3',
              text: 'a bridge of 3 links adds 2 loops',
              from: {
                recipe: 'bridge-join',
                params: { w: 3 },
              },
              value: 'cycles',
            },
            {
              key: 'b3BridgeChecks',
              text: 'a bridge of 3 links needs 2 new loop checks',
              from: {
                recipe: 'bridge-join',
                params: { w: 3 },
              },
              value: 'checks',
            },
          ],
          trail: [
            { ref: 'cro24', at: '§3.6, Lemmas 15 and 16', why: 'The bridge and its checks.' },
          ],
        },
        {
          id: 'b3-bridges:b2',
          phase: 'books',
          text: 'Two patches joined by three bridge links form the ladder. With one link the distance drops to 1, with two to 2, with three it is 3. The bridge must be at least as wide as the code is protected.',
          formal: 'For the ladder of Unit 3 the deformed distance is $w$ for $w = 1,2,3$ and then saturates at $d = 3$. Cro24 Theorem 24 is the general statement: joining two systems whose supports are minimum-weight representatives keeps the fault distance at $d$ when the merged code is measured for at least $d$ rounds.',
          stage: {
            recipe: 'bridge-join',
            params: { w: 3 },
          },
          caption: 'bridge width 1, 2, 3; distance 1, 2, 3',
          captionFormal: '$w=1,2,3$: deformed distance $1,2,3$',
          claims: [
            {
              key: 'b3BridgeDist1',
              text: 'a bridge of 1 link gives distance 1',
              from: {
                recipe: 'bridge-join',
                params: { w: 1 },
              },
              value: 'dist',
            },
            {
              key: 'b3BridgeDist2',
              text: 'a bridge of 2 links gives distance 2',
              from: {
                recipe: 'bridge-join',
                params: { w: 2 },
              },
              value: 'dist',
            },
            {
              key: 'b3BridgeDist3',
              text: 'a bridge of 3 links gives distance 3',
              from: {
                recipe: 'bridge-join',
                params: { w: 3 },
              },
              value: 'dist',
            },
          ],
          trail: [
            {
              ref: 'cro24',
              at: '§3.8, Theorem 24',
              why: 'Joining keeps the fault distance when the supports are minimum weight and the rounds are at least d.',
            },
          ],
        },
        {
          id: 'b3-bridges:b3',
          phase: 'books',
          text: 'The two blocks need not be the same code. In our example, take a surface-code patch and a seven-qubit Steane block. Each has its own path of three dots. Match the dots one to one: that matching is an [[pp-adapter|adapter]].',
          formal: 'An [[pp-adapter|adapter]] (SJY24 Def. 8) is a one-to-one matching between equal-size vertex subsets of two graphs. Our example (not from SJY24): take $\\bar X$ of a $d=3$ patch and the weight-3 $\\bar X$ of the Steane code (<<pp-q22-css|CSS code>>, qubits 1, 2, 3). The joined graph is again a ladder: $n\' = 16 + 7 = 23$, $k: 2 \\to 1$, $h = 1$, distance 3.',
          stage: {
            recipe: 'bridge-join',
            params: { w: 3, host: 'patch3-steane' },
          },
          caption: 'a patch\'s path and Steane\'s path, three matching links',
          captionFormal: '$k:2\\to1$, $n\'=23$, 2 cycles, $h=1$, $d\'=3$',
          fidelity: ['qc-graph-one-choice'],
          claims: [
            {
              key: 'b3AdapterN',
              text: 'the joint code of a patch and a Steane block has 23 qubits',
              from: {
                recipe: 'bridge-join',
                params: { w: 3, host: 'patch3-steane' },
              },
              value: 'n',
            },
            {
              key: 'b3AdapterK',
              text: 'the joint code stores 1 qubit',
              from: {
                recipe: 'bridge-join',
                params: { w: 3, host: 'patch3-steane' },
              },
              value: 'k',
            },
            {
              key: 'b3AdapterCycles',
              text: 'the joined graph has 2 loops',
              from: {
                recipe: 'bridge-join',
                params: { w: 3, host: 'patch3-steane' },
              },
              value: 'cycles',
            },
            {
              key: 'b3AdapterDist',
              text: 'the joint code has distance 3',
              from: {
                recipe: 'bridge-join',
                params: { w: 3, host: 'patch3-steane' },
              },
              value: 'dist',
            },
          ],
          trail: [
            {
              ref: 'sjy24',
              at: 'Def. 8 and Lemma 9',
              why: 'The adapter itself, which joins graphs of different codes and keeps the distance when both graphs have relative expansion at least 1. The 23-qubit example is ours.',
            },
          ],
        },
        {
          id: 'b3-bridges:b4',
          phase: 'books',
          text: 'Keep only two matching links and the bottleneck ratio is 0.67, so the distance is 2. Keep one and the ratio is 0.33, so the distance is 1. The same rule as the bridge. With three dots, every order of the three links works equally well.',
          formal: 'Adapter size $w = 1,2,3$ gives $h = \\tfrac13,\\tfrac23,1$ and deformed distance $1,2,3$, exactly as for a bridge. All $3! = 6$ orders of the matching give $h = 1$ and distance 3, so a mismatch of order is harmless at this size (relative expansion, SJY24 Def. 2, is the general tool).',
          stage: {
            recipe: 'bridge-join',
            params: { w: 2, host: 'patch3-steane' },
          },
          caption: 'adapter links 1, 2, 3 and the six orderings',
          captionFormal: '$w=1,2,3$: $h=\\tfrac13,\\tfrac23,1$, distance $1,2,3$; six orders, all $h=1$',
          claims: [
            {
              key: 'b3AdapterSize1',
              text: 'an adapter of 1 link gives distance 1',
              from: {
                recipe: 'bridge-join',
                params: { w: 1, host: 'patch3-steane' },
              },
              value: 'dist',
            },
            {
              key: 'b3AdapterSize2',
              text: 'an adapter of 2 links gives distance 2',
              from: {
                recipe: 'bridge-join',
                params: { w: 2, host: 'patch3-steane' },
              },
              value: 'dist',
            },
            {
              key: 'b3AdapterSize3',
              text: 'an adapter of 3 links gives distance 3',
              from: {
                recipe: 'bridge-join',
                params: { w: 3, host: 'patch3-steane' },
              },
              value: 'dist',
            },
            {
              key: 'b3AdapterH1',
              text: 'an adapter of 1 link has Cheeger constant one third',
              from: {
                recipe: 'bridge-join',
                params: { w: 1, host: 'patch3-steane' },
              },
              value: 'h',
            },
            {
              key: 'b3AdapterH2',
              text: 'an adapter of 2 links has Cheeger constant two thirds',
              from: {
                recipe: 'bridge-join',
                params: { w: 2, host: 'patch3-steane' },
              },
              value: 'h',
            },
            {
              key: 'b3AdapterH3',
              text: 'an adapter of 3 links has Cheeger constant 1',
              from: {
                recipe: 'bridge-join',
                params: { w: 3, host: 'patch3-steane' },
              },
              value: 'h',
            },
            {
              key: 'b3AdapterOrders',
              text: 'all 6 orders of the three links give Cheeger constant 1 and distance 3',
              from: {
                recipe: 'bridge-join',
                params: { w: 3, host: 'patch3-steane' },
              },
              value: 'orders',
            },
          ],
          trail: [
            { ref: 'sjy24', at: 'Def. 2 and Lemma 3', why: 'Relative expansion is the general tool.' },
          ],
        },
        {
          id: 'b3-bridges:b5',
          phase: 'deeper',
          text: 'Real numbers come from real papers. The authors of the bridge paper built the ancilla system for the gross code. It adds 103 qubits and measures eight different logical Paulis.',
          formal: 'Cro24 §4 reports an ancilla system for the gross code with 103 extra qubits, 54 data and 49 check qubits. It has eight measurable logical Paulis, and 8 × 36 = 288 logical measurements with the shift automorphisms. The sum 54 + 49 is ours; the 8 × 36 = 288 is printed on pp. 35 to 36. The other numbers are the authors\' (Reported).',
          stage: {
            recipe: 'gauge-graph',
            params: { host: 'patches3-xx', rungs: 3 },
          },
          caption: 'a reminder of the ladder; the gross-code system has no picture here',
          captionFormal: 'reported numbers only; the picture is the teaching ladder',
          reported: [
            {
              id: 'cro24-gross-system',
              text: 'an ancilla system for the gross code with 103 extra qubits, 54 data qubits and 49 check qubits',
              value: '103 qubits (54 data, 49 check)',
              source: 'cro24',
              at: { kind: 'section', label: '4', page: 29 },
            },
            {
              id: 'cro24-measurements',
              text: 'eight measurable logical Pauli operators',
              value: '8 measurements',
              source: 'cro24',
              at: { kind: 'figure', label: '7', page: 30 },
            },
            {
              id: 'cro24-automorphisms',
              text: 'a group of 36 automorphisms, which gives 8 × 36 = 288 logical measurements',
              value: '36 automorphisms',
              source: 'cro24',
              at: { kind: 'section', label: '4.3', page: 35 },
            },
          ],
          trail: [
            { ref: 'cro24', at: '§4', why: 'The gross-code ancilla system.' },
          ],
        },
      ],
      review: {
        points: [
          'Joining two measurement graphs by w links adds w - 1 loops.',
          'The joined code keeps its distance when the bridge is as wide as the code is protected.',
          'An adapter matches dots between different codes, so the two blocks need not match.',
          'Published systems report their own sizes: a quoted number is the authors, not ours.',
        ],
        equations: '(E_A-V_A+1)+(E_B-V_B+1)+w-1',
        trap: 'Thinking an adapter needs the same code on both sides.',
        formal: {
          points: [
            'A bridge of $w$ edges between connected graphs adds $w-1$ cycle checks and leaves the joined code with $k-1$ logical qubits (Cro24 §3.6).',
            'On the teaching family bridge or adapter width $w$ gives $h=w/3$ and deformed distance $w$ up to $d=3$; six orders of the matching all give $h=1$.',
            'Cro24 §4 reports 103 extra qubits for the gross code\'s system, a reported number.',
          ],
          equations: '(E_A-V_A+1)+(E_B-V_B+1)+w-1',
          trap: 'Assuming the two blocks must be copies of one code: the adapter of SJY24 Def. 8 joins different graphs.',
        },
      },
      play: [
        {
          id: 'b3-b-cyc',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Loops of a wide bridge',
          prompt: 'Two paths are joined by a bridge of three links. How many loops does the joined graph have?',
          answerFrom: {
            from: {
              recipe: 'bridge-join',
              params: { w: 3 },
            },
            value: 'cycles',
          },
          tolerance: 0.005,
          hints: [
            { text: 'The first link joins the graphs into one connected graph.' },
            { text: 'Each further link adds one loop.' },
            { text: 'Two further links.' },
          ],
          walkthrough: [
            { text: 'The first link makes the graph connected without any loop.' },
            { text: 'Each of the other 2 links closes one loop, so there are 2 loops.' },
          ],
        },
        {
          id: 'b3-b-n',
          kind: 'numeric',
          tier: 'core',
          title: 'Qubits of the joint code',
          prompt: 'A distance-3 patch has 9 qubits and a Steane block 7. The joint measurement uses the three-link adapter graph with 7 links. How many qubits does the deformed joint code have?',
          answerFrom: {
            from: {
              recipe: 'bridge-join',
              params: { w: 3, host: 'patch3-steane' },
            },
            value: 'n',
          },
          tolerance: 0.005,
          hints: [
            { text: 'Start from the qubits of the two blocks.' },
            { text: 'Each link is a new qubit.' },
            { text: '9 + 7 + 7.' },
          ],
          walkthrough: [
            { text: 'The blocks have 9 + 7 = 16 qubits.' },
            { text: 'The 7 links add 7 qubits: 23 in all.' },
          ],
        },
        {
          id: 'b3-b-two',
          kind: 'choice',
          tier: 'core',
          title: 'A narrow adapter',
          prompt: 'An adapter with only two matching links gives deformed distance...',
          options: [
            { text: '1', correct: false, why: 'One matching link gives distance 1; two links do better.' },
            { text: '2', correct: true, why: 'On this family the distance equals the number of matching links.' },
            { text: '3', correct: false, why: 'Distance 3 needs all three matching links.' },
            { text: '7', correct: false, why: 'Seven is the Z-distance of the joint code, not the one the adapter limits.' },
          ],
          hints: [
            { text: 'Think of the bridge: distance equals width.' },
            { text: 'The adapter obeys the same rule.' },
            { text: 'Two links, distance two.' },
          ],
          walkthrough: [
            { text: 'The Cheeger constant with two links is 2/3.' },
            { text: 'The distance is 3 times 2/3 = 2.' },
          ],
        },
      ],
      pitfalls: [
        'Treating a quoted system size as something this chapter computed: the numbers in the last beat are the authors\' own.',
      ],
    },
  ],
}
