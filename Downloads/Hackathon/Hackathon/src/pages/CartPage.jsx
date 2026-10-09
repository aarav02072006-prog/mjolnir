import { Link } from 'react-router-dom'
import { useCart,useCartTotals } from '../context/CartContext.jsx'
import QuantityStepper from '../components/ui/QuantityStepper.jsx'
import { formatPrice } from '../utils/a/formatPrice.js'
import usePageTitle from '../hooks/a/usePageTitle.js'
import { useMemo } from 'react'

export default function CartPage(){
  usePageTitle('Cart')
  const {items,removeItem,updateQty}=useCart()
  const {subtotal}=useCartTotals()
  const delivery = subtotal>=499?0:49
  const total = subtotal+delivery

  const rows = useMemo(()=>items.map(i=>({...i})),[items])

  if(rows.length===0){
    return (
      <div className="cart empty">
        <h1>Your cart is empty</h1>
        <Link to="/products" className="btn">Continue shopping</Link>
      </div>
    )
  }

  return (
    <div className="cart">
      <h1>Cart</h1>
      <div className="cart-grid">
        <div>
          {rows.map(i=>(
            <div key={i.id} className="cart-item">
              <img src={i.image} alt={i.name} width="100" height="100" loading="lazy" decoding="async" onError={e=>e.currentTarget.src='https://via.placeholder.com/100'}/>
              <div>
                <div className="name">{i.name}</div>
                <div className="price">{formatPrice(i.price)}</div>
                <QuantityStepper value={i.qty} onChange={q=>updateQty(i.id,q)} min={1} max={10}/>
                <button onClick={()=>removeItem(i.id)}>Remove</button>
              </div>
              <div className="line">{formatPrice(i.price*i.qty)}</div>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h2>Order summary</h2>
          <div>Subtotal: {formatPrice(subtotal)}</div>
          <div>Savings: {formatPrice(0)}</div>
          <div>Delivery: {delivery===0?'FREE':formatPrice(delivery)}</div>
          <div className="total">Total: {formatPrice(total)}</div>
          <Link to="/checkout" className="btn">Proceed to checkout</Link>
        </aside>
      </div>
    </div>
  )
}
