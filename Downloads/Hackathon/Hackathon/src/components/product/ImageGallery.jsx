import { useState } from 'react'

export default function ImageGallery({baseId}){
  const [active,setActive]=useState(0)
  const thumbs=[1,2,3]
  return (
    <div className="gallery">
      <img src={`https://picsum.photos/seed/${baseId}-${active+1}/600/600`} alt="" width="600" height="600" loading="eager" decoding="async"/>
      <div className="thumbs">
        {thumbs.map((n,i)=>(
          <button key={n} aria-label={`View image ${n}`} aria-current={i===active} onClick={()=>setActive(i)} className={i===active?'active':''}>
            <img src={`https://picsum.photos/seed/${baseId}-${n}/120/120`} alt="" width="120" height="120" loading="lazy" decoding="async"/>
          </button>
        ))}
      </div>
    </div>
  )
}
