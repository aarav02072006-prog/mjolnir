import { useParams, useNavigate } from 'react-router-dom'
import { useEffect,useState,useMemo } from 'react'
import usePageTitle from '../hooks/a/usePageTitle.js'
import { getProducts } from '../data/api.js'
import ImageGallery from '../components/product/ImageGallery.jsx'
import Rating from '../components/ui/Rating.jsx'
import PriceTag from '../components/ui/PriceTag.jsx'
import QuantityStepper from '../components/ui/QuantityStepper.jsx'
import ReviewList from '../components/product/ReviewList.jsx'
import ProductTile from '../components/product/ProductTile.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function ProductDetailPage(){
  const {id}=useParams()
  const navigate=useNavigate()
  const [product,setProduct]=useState(null)
  const [qty,setQty]=useState(1)
  const {addItem}=useCart()

  usePageTitle(product?.name)

  useEffect(()=>{
    let alive=true
    getProducts().then(list=>{ const p=list.find(x=>x.id===id); if(alive) { setProduct(p||null); if(p) setQty(1) } }).catch(()=>{})
    return ()=>{alive=false}
  },[id])

  const similar = useMemo(()=>{
    if(!product) return []
    return null
  },[product])

  // fetch similar later
  const [similarList,setSimilarList]=useState([])
  useEffect(()=>{
    if(!product) return
    getProducts().then(list=> setSimilarList(list.filter(p=>p.category===product.category && p.id!==product.id).slice(0,4)))
  },[product])

  if(!product) return <div>Product not found</div>
  const outOfStock = product.stock<=0
  const maxQty = Math.min(product.stock,10)||1
  const handleAdd=()=>{
    addItem(product,qty)
  }
  const handleBuy=()=>{
    addItem(product,qty)
    navigate('/checkout')
  }

  return (
    <div className="product-detail">
      <div className="grid two">
        <ImageGallery baseId={product.id}/>
        <div>
          <h1>{product.name}</h1>
          <Rating rating={product.rating} count={product.reviewCount}/>
          <PriceTag price={product.price} mrp={product.mrp}/>
          <div className="stock">{outOfStock?'Out of stock': product.stock<=5?`Only ${product.stock} left`:'In stock'}</div>
          <p>{product.name} in {product.category}. Great quality and comfort.</p>
          {!outOfStock && (
            <>
              <label>Qty</label>
              <QuantityStepper value={qty} onChange={setQty} min={1} max={maxQty}/>
              <div className="actions">
                <button onClick={handleAdd} disabled={outOfStock}>Add to cart</button>
                <button onClick={handleBuy} disabled={outOfStock}>Buy now</button>
              </div>
            </>
          )}
        </div>
      </div>
      <ReviewList productId={product.id}/>
      <section>
        <h2>Similar products</h2>
        <div className="grid">{similarList.map(p=><ProductTile key={p.id} product={p}/>)}</div>
      </section>
    </div>
  )
}
