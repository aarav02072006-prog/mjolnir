import { formatPrice } from '../../utils/a/formatPrice.js'
export default function PriceTag({price,mrp}){
  const off = mrp>price ? Math.round((1-price/mrp)*100) : 0
  return (
    <div>
      <span className="price">{formatPrice(price)}</span>
      {mrp>price && <><span className="mrp">{formatPrice(mrp)}</span><span className="off">{off}% off</span></>}
    </div>
  )
}
