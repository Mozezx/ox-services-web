import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()

  // Fetch appointment stats for badge
  const { data: appointmentStats } = useQuery({
    queryKey: ['appointments-stats'],
    queryFn: () => api.getAppointmentsStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const newAppointmentsCount = appointmentStats?.new || 0
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/appointments', label: 'Agendamentos', icon: 'calendar_month', badge: newAppointmentsCount },
    { path: '/works', label: 'Obras', icon: 'construction' },
  ]
  
  const isActive = (path: string) => location.pathname.startsWith(path)

  const closeSidebar = () => setIsSidebarOpen(false)
  
  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-primary text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-primary-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">construction</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg truncate">OX Services</h1>
              <p className="text-sm text-white/70">Admin Obras</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-secondary text-primary font-medium'
                      : 'hover:bg-primary-light'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-primary-light">
            <h3 className="px-4 text-sm font-medium text-white/70 mb-2">Ações Rápidas</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/works?action=create"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span>Nova Obra</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        
        {/* User */}
        <div className="p-4 border-t border-primary-light">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-sm text-white">person</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">Administrador</p>
              <p className="text-xs text-white/70 truncate">Painel de controle</p>
            </div>
            <button
              type="button"
              onClick={() => { closeSidebar(); logout(); }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Sair"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-background rounded-lg transition-colors"
              aria-label="Abrir menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg lg:text-xl font-semibold text-text truncate">
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-text-light hidden sm:block">Gerencie suas obras e timeline</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-background rounded-lg transition-colors hidden sm:flex">
                <span className="material-symbols-outlined text-text-light">notifications</span>
              </button>
              <button className="p-2 hover:bg-background rounded-lg transition-colors hidden md:flex items-center gap-2 text-sm text-text-light">
                <span className="material-symbols-outlined">help</span>
                <span className="hidden lg:inline">Ajuda</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
