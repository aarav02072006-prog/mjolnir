import { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [theme,setTheme]=useState(()=>localStorage.getItem('theme')||'light')
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme)
    localStorage.setItem('theme',theme)
  },[theme])
  return (
    <button className="theme-toggle" aria-label="Toggle theme" onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>
      {theme==='light'?'🌙':'☀️'}
    </button>
  )
}