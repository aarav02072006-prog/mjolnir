import { memo } from 'react'
export default memo(function Rating({rating,count}){
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5-Math.round(rating))
  return <div aria-label={`${rating} out of 5 stars`}>{stars} <span>({count})</span></div>
})
