import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

const STORAGE_KEY = 'technician_token'

type AuthContextType = {
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
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

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/technician/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Login failed')
    if (!data.token) throw new Error('Invalid response')
    setTokenState(data.token)
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      window.location.href = '/login'
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}
