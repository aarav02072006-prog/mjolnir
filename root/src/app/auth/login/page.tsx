'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  
  const setUser = useAuthStore((s) => s.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
      } else {
        setUser(data.user)
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your Meesho account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5 shadow-sm">
        {registered && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm px-4 py-3 rounded-lg">
            Account created successfully! Please sign in below.
          </div>
        )}
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ring transition-colors placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ring transition-colors placeholder:text-muted-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground text-background font-semibold py-3 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-foreground hover:opacity-80 transition-opacity">
            Create one
          </Link>
        </div>
      </form>

      <div className="mt-6 bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Demo credentials</p>
        <p className="text-sm text-foreground font-mono">demo@meesho.com / demo123</p>
        <button
          type="button"
          onClick={() => { setEmail('demo@meesho.com'); setPassword('demo123') }}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Fill demo credentials
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
