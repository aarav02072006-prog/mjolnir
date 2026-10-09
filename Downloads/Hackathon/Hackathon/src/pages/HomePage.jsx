import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/a/usePageTitle.js'
import { getProducts } from '../data/api.js'
import ProductTile from '../components/product/ProductTile.jsx'

export default function HomePage(){
  usePageTitle('Home')
  const [products,setProducts]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    let alive=true
    getProducts().then(data=>{
      if(alive){
        setProducts(Array.isArray(data)?data:[])
        setLoading(false)
      }
    }).catch(e=>{
      if(alive){
        console.error(e)
        setError('Failed to load')
        setLoading(false)
      }
    })
    return ()=>{alive=false}
  },[])

  const topRated = useMemo(()=>[...products].sort((a,b)=>b.rating-a.rating).slice(0,8),[products])
  const bestDeals = useMemo(()=>[...products].sort((a,b)=>(b.mrp-b.price)/(b.mrp||1)-(a.mrp-a.price)/(a.mrp||1)).slice(0,8),[products])

  if(loading) return <div>Loading...</div>
  if(error) return <div>{error} <button onClick={()=>window.location.reload()}>Retry</button></div>

  return (
    <div>
      <section className="hero" aria-label="Hero">
        <div className="hero-content">
          <div>
            <h2 style={{fontSize:14,letterSpacing:'3px',opacity:.8,marginBottom:8}}>NEW ARRIVALS</h2>
            <h1 style={{fontSize:'clamp(3rem,8vw,6rem)',lineHeight:.9,margin:'8px 0'}}>50%<span style={{fontSize:'2rem'}}> OFF</span></h1>
            <p style={{maxWidth:420}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi elementum massa quis nulla aliquet, in euismod arcu porttitor.</p>
            <Link to="/products" className="btn" style={{background:'#fff',color:'var(--pink-ink)',marginTop:16}} >SHOP NOW</Link>
          </div>
          <div style={{display:'grid',placeItems:'center'}}>
            <div style={{width:'100%',height:320,background:'radial-gradient(circle at 30% 30%, rgba(255,255,255,.6), transparent), url(https://picsum.photos/seed/hero/600/600) center/cover no-repeat',borderRadius:12}}/>
          </div>
        </div>
      </section>
      <section className="section" style={{paddingTop:48,paddingBottom:48}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <h2 style={{display:'inline-flex',alignItems:'center',gap:16,fontSize:22,letterSpacing:'.5px'}}> <span style={{width:60,height:1,background:'var(--border)',display:'inline-block'}}/> BEST CHOICES <span style={{width:60,height:1,background:'var(--border)',display:'inline-block'}}/> </h2>
        </div>
        <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
          {topRated.slice(0,3).map(p=>(
            <div key={p.id} className="tile" style={{position:'relative'}}>
              <img src={p.image} alt={p.name}/>
              <div style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',background:'var(--pink)',color:'#fff',padding:'8px 20px',fontWeight:700}}>
                ${p.price}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{background:'var(--peach)',padding:'64px var(--space)'}}>
        <div style={{maxWidth:'var(--max)',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',alignItems:'center',gap:32}}>
          <div style={{background:'#fff',padding:40}}>
            <div style={{fontSize:12,letterSpacing:'2px',color:'var(--muted)',marginBottom:8}}>LOREM IPSUM</div>
            <h2 style={{fontSize:'clamp(2.5rem,5vw,4rem)',lineHeight:.9,margin:'8px 0'}}>WEEKLY<br/>DEALS</h2>
            <p style={{color:'var(--muted)',maxWidth:320}}>Lorem ipsum dolor sit amet, consectetuer adipiscing.</p>
            <Link to="/products" className="btn ghost" style={{borderColor:'var(--pink)',color:'var(--pink)',marginTop:20}}>READ MORE</Link>
          </div>
          <div>
            <div style={{aspectRatio:'4/3',background:'url(https://picsum.photos/seed/weekly/800/600) center/cover no-repeat',borderRadius:12}}/>
          </div>
        </div>
      </section>
      <section className="section" style={{paddingTop:48}}>
        <h2>Best Deals</h2>
        <div className="grid">{bestDeals.map(p=><ProductTile key={p.id} product={p}/>)}</div>
      </section>
    </div>
  )
}
