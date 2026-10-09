export default function QuantityStepper({value,onChange,min=1,max=10}){
  return (
    <div className="stepper" role="group" aria-label="Quantity">
      <button aria-label="Decrease" onClick={()=>onChange(Math.max(min,value-1))}>-</button>
      <span>{value}</span>
      <button aria-label="Increase" onClick={()=>onChange(Math.min(max,value+1))}>+</button>
    </div>
  )
}
