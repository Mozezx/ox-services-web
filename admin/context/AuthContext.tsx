import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

const STORAGE_KEY = 'admin_token'

type AuthContextType = {
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setToken: (t: string | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  }, [token])

  const setToken = useCallback((t: string | null) => {
    setTokenState(t)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Falha no login')
    if (!data.token) throw new Error('Resposta inválida')
    setTokenState(data.token)
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      window.location.href = '/login'
    }
  }, [])

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    setToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}
