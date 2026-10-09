// STUB - replace with Dev B's version. DO NOT COMMIT.
import { getProducts } from '../data/api.js'
import { useEffect,useState } from 'react'
export default function ProductListingPage(){
  const [list,setList]=useState([])
  useEffect(()=>{ getProducts().then(setList).catch(()=>{}) },[])
  return (
    <div>
      <h1>Products (Dev B)</h1>
      <ul>{list.map(p=><li key={p.id}>{p.name}</li>)}</ul>
    </div>
  )
}
