import { ReactNode, useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { UploadQueueProvider, useUploadQueue } from '../context/UploadQueueContext'
import { useToast } from './Toast'
import UploadQueueBar from './UploadQueueBar'
import { api } from '../lib/api'
import { setupPushNotifications, playNotificationSound } from '../lib/push'

interface LayoutProps {
  children: ReactNode
}

function LayoutInner({ children }: LayoutProps) {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const { jobs } = useUploadQueue()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const pushSetupDone = useRef(false)

  // Push: setup (apenas quando logado) e listener para novo agendamento
  useEffect(() => {
    if (pushSetupDone.current) return
    pushSetupDone.current = true
    setTimeout(() => setupPushNotifications(), 1000)
  }, [])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'PUSH_APPOINTMENT') {
        const payload = e.data.payload
        if (payload?.data?.toolOrderId) {
          playNotificationSound()
          addToast('info', 'Novo pedido de ferramentas! Abra Pedidos para ver.')
          queryClient.invalidateQueries({ queryKey: ['tool-orders'] })
        } else {
          playNotificationSound()
          addToast('info', 'Novo agendamento! Abra Agendamentos para ver.')
          queryClient.invalidateQueries({ queryKey: ['appointments-stats'] })
          queryClient.invalidateQueries({ queryKey: ['appointments'] })
        }
      }
    }
    navigator.serviceWorker?.addEventListener?.('message', onMessage)
    return () => navigator.serviceWorker?.removeEventListener?.('message', onMessage)
  }, [addToast, queryClient])

  // Fetch appointment stats for badge
  const { data: appointmentStats } = useQuery({
    queryKey: ['appointments-stats'],
    queryFn: () => api.getAppointmentsStats(),
    refetchInterval: 30000,
  })

  // Fetch pending tool orders count for badge
  const { data: pendingToolOrders = [] } = useQuery({
    queryKey: ['tool-orders', 'pending'],
    queryFn: () => api.getToolOrders({ status: 'pending' }),
    refetchInterval: 30000,
  })

  const newAppointmentsCount = appointmentStats?.new || 0
  const pendingToolOrdersCount = pendingToolOrders.length

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/appointments', label: 'Agendamentos', icon: 'calendar_month', badge: newAppointmentsCount },
    { path: '/works', label: 'Obras', icon: 'construction' },
    { path: '/technicians', label: 'Técnicos', icon: 'engineering' },
    { path: '/inventory', label: 'Inventário', icon: 'inventory_2' },
    { path: '/tools', label: 'Ferramentas', icon: 'build' },
    { path: '/tool-orders', label: 'Pedidos de ferramentas', icon: 'shopping_cart', badge: pendingToolOrdersCount },
  ]
  
  const isActive = (path: string) => location.pathname.startsWith(path)

  const closeSidebar = () => setIsSidebarOpen(false)
  
  const hasQueue = jobs.length > 0

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
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
            <img
              src="/logo.png"
              alt="OX Services"
              className="w-10 h-10 object-contain flex-shrink-0 rounded-lg bg-white/5"
            />
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
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary"
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
        
        {/* Content - fundo azul; títulos e descrições brancos (layout-content) */}
        <div className={`layout-content flex-1 p-4 lg:p-8 overflow-x-hidden ${hasQueue ? 'pb-32' : ''}`}>
          {children}
        </div>
      </main>
      <UploadQueueBar />
    </div>
  )
}

export default function Layout(props: LayoutProps) {
  return (
    <UploadQueueProvider>
      <LayoutInner {...props} />
    </UploadQueueProvider>
  )
}
