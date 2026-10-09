import { memo } from 'react'
import { Link } from 'react-router-dom'
import Rating from '../ui/Rating.jsx'
import PriceTag from '../ui/PriceTag.jsx'

export default memo(function ProductTile({product}){
  return (
    <Link to={`/product/${product.id}`} className="tile">
      <img src={product.image} alt={product.name} loading="lazy" decoding="async" width="300" height="300" onError={e=>e.currentTarget.src='https://via.placeholder.com/300'} />
      <div className="tile-body">
        <div className="name">{product.name}</div>
        <Rating rating={product.rating} count={product.reviewCount}/>
        <PriceTag price={product.price} mrp={product.mrp}/>
      </div>
    </Link>
  )
})
