import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/a/usePageTitle.js'
export default function NotFoundPage(){
  usePageTitle('Not found')
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/">Go home</Link>
    </div>
  )
}
