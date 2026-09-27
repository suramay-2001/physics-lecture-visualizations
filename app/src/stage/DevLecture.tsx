/**
 * DEV-only route `#/dev/lecture/demo` (and `demo-island`, with a 3D widget): the real LecturePage (StoryStage, scroll wiring, overlay, reveal,
 * StaticStory below 900 px) over the demo story fixture. e2e/story.spec.ts drives it until P's L1 story
 * lands. Registered only when `import.meta.env.DEV`, so production builds drop it and the fixture.
 */
import { useParams } from 'react-router-dom'
import { DEMO, DEMO_ISLAND, DEMO_SPACES } from '../content/__fixtures__/demoStory'
import { lectureById } from '../content'
import { LecturePage } from '../pages/LecturePage'

export default function DevLecture() {
  const { id = 'demo' } = useParams()
  const lecture = id === 'demo' ? DEMO : id === 'demo-island' ? DEMO_ISLAND : id === 'demo-spaces' ? DEMO_SPACES : lectureById(id)
  return <LecturePage key={lecture?.id ?? id} lecture={lecture} />
}
