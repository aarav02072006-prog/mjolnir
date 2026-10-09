export default function Footer(){
  return (
    <footer className="footer">
      <div className="inner">
        <div><strong>THESTYLE</strong><br/><span style={{color:'var(--muted)'}}>Minimal fashion for everyday.</span></div>
        <div><strong>Shop</strong><br/><a href="/products">All Products</a><br/><a href="/products?category=Women%20Ethnic">Women</a><br/><a href="/products?category=Men%20Fashion">Men</a></div>
        <div><strong>Help</strong><br/><a href="#">Shipping</a><br/><a href="#">Returns</a><br/><a href="#">Contact</a></div>
        <div><strong>© {new Date().getFullYear()} THESTYLE</strong><br/>Follow us on:</div>
      </div>
      <div className="social">
        <a aria-label="Facebook" href="#">f</a>
        <a aria-label="Instagram" href="#">in</a>
        <a aria-label="Twitter" href="#">t</a>
      </div>
    </footer>
  )
}
