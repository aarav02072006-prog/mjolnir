import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import * as auth from '../utils/a/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({children}){
  const [user,setUser]=useState(null)
  const [ready,setReady]=useState(false)

  useEffect(()=>{
    try{
      const session = JSON.parse(localStorage.getItem('session')||'null')
      if(session) setUser(session)
    }catch{}
    setReady(true)
  },[])

  const login = async (email,password)=>{
    const u = await auth.loginUser(email,password)
    setUser({name:u.name,email:u.email})
    return u
  }
  const signup = async (name,email,password)=>{
    const u = await auth.signupUser(name,email,password)
    setUser({name:u.name,email:u.email})
    return u
  }
  const logout = ()=>{
    try{localStorage.removeItem('session')}catch{}
    setUser(null)
  }
  const value = useMemo(()=>({user,login,signup,logout}),[user])
  if(!ready) return null
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){ const ctx = useContext(AuthContext); if(!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }
