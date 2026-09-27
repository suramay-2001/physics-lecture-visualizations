/**
 * The Grapher's fidelity notes (D-lab §2.4 "Fidelity"), one click from the passport: graph space (Surface, Curve) and
 * the Bloch path. Paraphrased, no source text. Checked by model.test.ts (every group filled, ids unique and distinct
 * from the lecture notes, TeX typesets).
 */
import type { Fidelity } from '../../../content/stage'

export const GRAPH_FIDELITY: Fidelity = {
  exact: [
    {
      id: 'lab-gr-samples',
      text: 'Every vertex is an exact sample of your expression, computed by the engine at evenly spaced points of your ranges (both ends included). The readouts at the cursor are exact values there, not read off the picture; a range (“from … to …”) is the smallest and largest sample, not the function’s extremes between samples.',
    },
    {
      id: 'lab-gr-compare',
      text: '“Compare the layers” counts the samples where $f = g$ to 12 digits of the picture’s size, the samples where $f < g$, and the grid cells whose corners have $f - g$ of both signs: the layers cross inside those cells, between samples.',
    },
    {
      id: 'lab-gr-gaps',
      text: 'Where a sample is not a finite number, or its size is above $10^6$, it is a gap: the surface has a hole there and a curve breaks. The readouts count the gaps.',
    },
    {
      id: 'lab-gr-shade',
      text: 'Shade is the only colour code: on a surface, darker is lower and lighter is higher (the surface is not lit, so there are no highlights); along a curve, dark is the start of $t$ and light its end. The wire layer is one tone.',
    },
  ],
  schematic: [
    {
      id: 'lab-gr-linear',
      text: 'Between samples the picture is straight: flat triangles on a surface, straight segments on a curve. Your function may do anything there; raise the resolution to look closer.',
    },
    {
      id: 'lab-gr-wire-on-top',
      text: 'Where the two layers are within a hair of each other, the wire is drawn on top of the solid, so a touch shows as a wire lying on the surface.',
    },
    {
      id: 'lab-gr-fit',
      text: 'Unless “equal scale” is ticked, each axis is fitted to the box separately, so how steep a slope looks depends on your ranges. With “equal scale” all three axes share one unit.',
    },
  ],
  misleading: [
    {
      id: 'lab-gr-not-a-place',
      text: '**Graph space is not a place.** Its axes are your inputs and your function’s values, with no units; nothing here moves in a lab.',
    },
    {
      id: 'lab-gr-asymptote',
      text: 'A steep jump between two samples (near an asymptote of $\\tan$, say) is drawn as a straight wall when both samples are finite: it is not part of the graph.',
    },
  ],
}

export const BLOCH_PATH_FIDELITY: Fidelity = {
  exact: [
    {
      id: 'lab-gr-bloch-point',
      text: 'Each point of the path is the engine’s Bloch vector of $\\cos(\\theta/2)|{+z}\\rangle + e^{i\\varphi}\\sin(\\theta/2)|{-z}\\rangle$ at your $\\theta(t)$ and $\\varphi(t)$, in radians. The near-white bead is the state at the cursor’s $t$.',
    },
    {
      id: 'lab-gr-bloch-gaps',
      text: 'Where $\\theta$ or $\\varphi$ is not a finite number (or above $10^6$) the path has a gap; the readouts count them.',
    },
  ],
  schematic: [
    {
      id: 'lab-gr-bloch-linear',
      text: 'Between samples the path is drawn as straight chords, and a hair outside the sphere so it stays visible over the great circles. Shade marks $t$: dark at the start, light at the end.',
    },
  ],
  misleading: [
    {
      id: 'lab-gr-bloch-angles',
      text: '$\\theta$ outside $0\\ldots\\pi$ still gives a state, but then the point’s own angles are not your $\\theta$ and $\\varphi$; a readout gives them. At a pole $\\varphi$ has no effect at all.',
    },
    {
      id: 'lab-gr-bloch-phase',
      text: '**The sphere hides the global phase.** Two kets that differ by an overall factor $e^{i\\chi}$ are one point here.',
    },
  ],
}
