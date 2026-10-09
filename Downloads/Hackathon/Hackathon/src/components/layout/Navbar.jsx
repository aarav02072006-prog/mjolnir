import { Link } from 'react-router-dom'
import { useCartTotals } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useState } from 'react'

export default function Navbar(){
  const {count}=useCartTotals()
  const {user,logout}=useAuth()
  const [open,setOpen]=useState(false)
  return (
    <>
      <div className="topbar" style={{background:'var(--card)',color:'var(--dark)',fontWeight:600}}>STYLIST OUTFITS AND NEW TRENDS</div>
      <nav aria-label="Primary">
        <div className="nav-inner">
          <Link to="/" className="logo" aria-label="Home" style={{fontSize:'1.1rem'}}>STYLIST</Link>
          <button className="hamburger" aria-expanded={open} aria-controls="navlinks" onClick={()=>setOpen(o=>!o)} aria-label="Toggle menu">☰</button>
          <div id="navlinks" className={`nav-links ${open?'open':''}`}>
            <Link to="/">Home</Link>
            <Link to="/products">Shop</Link>
            <Link to="/products?category=Women%20Ethnic">Women</Link>
            <Link to="/products?category=Men%20Fashion">Men</Link>
            <Link to="/cart" className="cart-link" aria-label={`Cart, ${count} items`}>Cart <span className="badge">{count}</span></Link>
            {user ? (
              <>
                <span className="name">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={logout}>Logout</button>
              </>
            ):(
              <Link to="/login">Sign in</Link>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
