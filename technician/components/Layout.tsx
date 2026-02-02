import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'

interface LayoutProps {
  children: ReactNode
}

const LANG_OPTIONS: { code: 'en' | 'es' | 'pt' | 'fr' | 'nl'; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
  { code: 'nl', label: 'NL' },
]

function LayoutInner({ children }: LayoutProps) {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { cartCount } = useCart()

  const navItems = [
    { path: '/dashboard', label: t.dashboard.title, icon: 'dashboard' },
    { path: '/works', label: t.works.myWorks, icon: 'construction' },
    { path: '/shop', label: t.shop.title, icon: 'build' },
    { path: '/cart', label: t.cart.title, icon: 'shopping_cart', badge: cartCount },
    { path: '/orders', label: t.orders.title, icon: 'receipt_long' },
  ]

  const isActive = (path: string) => location.pathname.startsWith(path)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-primary text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-primary-light">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="OX Technician" className="w-10 h-10 object-contain flex-shrink-0 rounded-lg bg-white/5" />
            <div className="min-w-0">
              <h1 className="font-bold text-lg truncate">OX Technician</h1>
              <p className="text-sm text-white/70">{t.common.myWorksAndTools}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path) ? 'bg-secondary text-primary font-medium' : 'hover:bg-primary-light'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-primary-light space-y-2">
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="material-symbols-outlined text-lg">language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'pt' | 'fr' | 'nl')}
              className="flex-1 bg-white/10 text-white border-0 rounded text-sm py-1 px-2 focus:ring-2 focus:ring-secondary"
            >
              {LANG_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code} className="text-text">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-sm text-white">person</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">Technician</p>
            </div>
            <button
              type="button"
              onClick={() => { closeSidebar(); logout(); }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={t.common.logout}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg lg:text-xl font-semibold text-text truncate">
                {navItems.find((item) => isActive(item.path))?.label ?? t.dashboard.title}
              </h2>
            </div>
          </div>
        </header>
        <div className="layout-content flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</div>
      </main>

      {/* Carrinho flutuante */}
      <Link
        to="/cart"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-light hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        title={t.cart.title}
        aria-label={t.cart.title}
      >
        <span className="material-symbols-outlined text-3xl">shopping_cart</span>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </Link>
    </div>
  )
}

export default function Layout(props: LayoutProps) {
  return <LayoutInner {...props} />
}
