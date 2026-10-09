import { useMemo } from 'react'
import { mockReviews } from '../../utils/a/mockReviews.js'

export default function ReviewList({productId}){
  const reviews = useMemo(()=>mockReviews(productId),[productId])
  const breakdown = useMemo(()=>{
    const map={5:0,4:0,3:0,2:0,1:0}
    reviews.forEach(r=>map[r.stars]+=1)
    const total = reviews.length ||1
    return Object.entries(map).map(([s,c])=>({s:+s,percent:Math.round(c/total*100)}))
  },[reviews])
  return (
    <section aria-label="Reviews">
      <h2>Reviews</h2>
      <div className="breakdown">
        {breakdown.map(b=>(
          <div key={b.s}>
            <span>{b.s}★</span>
            <div className="bar"><div style={{width:`${b.percent}%`}}/></div>
            <span>{b.percent}%</span>
          </div>
        ))}
      </div>
      <ul>
        {reviews.map((r,i)=>(
          <li key={i}>
            <strong>{r.name}</strong> <span>{r.stars}★</span>
            <div>{r.comment}</div>
            <small>{r.date}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}
