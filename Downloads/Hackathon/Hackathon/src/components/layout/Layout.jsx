import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function Layout(){
  return (
    <div className="layout">
      <a href="#main" className="skip-link">Skip to main content</a>
      <header><Navbar/></header>
      <main id="main"><Outlet/></main>
      <footer><Footer/></footer>
    </div>
  )
}
