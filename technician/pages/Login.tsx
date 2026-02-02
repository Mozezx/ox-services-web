import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../components/Toast'

const Login = () => {
  const { login } = useAuth()
  const { t } = useLanguage()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      addToast('error', t.login.error)
      return
    }
    setIsLoading(true)
    try {
      await login(email.trim(), password)
      window.location.href = '/dashboard'
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : t.login.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md card animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="OX Technician" className="w-12 h-12 object-contain rounded-lg bg-primary/5" />
          <h1 className="text-2xl font-bold text-text">{t.login.title}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t.login.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t.login.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                {t.common.loading}
              </>
            ) : (
              t.login.submit
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
