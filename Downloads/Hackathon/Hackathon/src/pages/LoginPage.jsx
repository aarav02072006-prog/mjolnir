import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { isValidEmail,isValidPassword,isValidName } from '../utils/a/validators.js'
import usePageTitle from '../hooks/a/usePageTitle.js'

export default function LoginPage(){
  usePageTitle('Login')
  const [mode,setMode]=useState('login')
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const {login,signup}=useAuth()
  const navigate=useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const submit = async e=>{
    e.preventDefault()
    setError('')
    if(!isValidEmail(email)){ setError('Invalid email'); return }
    if(!isValidPassword(password)){ setError('Password must be >=8 chars with a number'); return }
    if(mode==='signup' && !isValidName(name)){ setError('Invalid name'); return }
    try{
      if(mode==='login') await login(email,password)
      else await signup(name,email,password)
      navigate(from,{replace:true})
    }catch(err){ setError('Invalid email or password') }
  }

  return (
    <div className="auth">
      <h1>{mode==='login'?'Login':'Sign up'}</h1>
      <form onSubmit={submit} noValidate>
        {mode==='signup' && (
          <label>Name <input value={name} onChange={e=>setName(e.target.value)} required aria-invalid={error?'true':'false'}/></label>
        )}
        <label>Email <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required aria-invalid={error?'true':'false'} aria-describedby="err"/></label>
        <label>Password <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required aria-invalid={error?'true':'false'}/></label>
        {error && <div id="err" role="alert">{error}</div>}
        <button type="submit">{mode==='login'?'Login':'Create account'}</button>
      </form>
      <div>
        {mode==='login'?<span>New here? <button type="button" onClick={()=>setMode('signup')}>Sign up</button></span>
         :<span>Already have account? <button type="button" onClick={()=>setMode('login')}>Login</button></span>}
        <div><Link to="/">Home</Link></div>
      </div>
    </div>
  )
}
