/** A Physics 709 chapter (stub until the course outline and loaders land). */
import { Link, useParams } from 'react-router-dom'
import { coursePath } from '../paths'

export default function Chapter709Page() {
  const { id = '' } = useParams()
  return (
    <div className="page page-709">
      <p className="eyebrow">Chapter {id.slice(0, 8)}</p>
      <h1>Not written yet</h1>
      <p>
        <Link to={coursePath('qc709')}>Back to the chapter list</Link>
      </p>
    </div>
  )
}
