import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLanguage } from '../context/LanguageContext'

const Dashboard = () => {
  const { t } = useLanguage()
  const { data: works = [], isLoading: loadingWorks } = useQuery({
    queryKey: ['technician-works'],
    queryFn: () => api.getMyWorks(),
  })
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['technician-orders'],
    queryFn: () => api.getMyOrders(),
  })

  const recentOrders = orders.slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t.orders.pending
      case 'approved': return t.orders.approved
      case 'rejected': return t.orders.rejected
      default: return status
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.dashboard.title}</h1>
        <p className="text-white/80">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">{t.dashboard.myWorks}</h2>
            <Link to="/works" className="text-sm text-primary hover:underline font-medium">
              {t.works.viewDetail}
            </Link>
          </div>
          {loadingWorks ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          ) : works.length === 0 ? (
            <p className="text-text-light text-sm">{t.dashboard.noWorks}</p>
          ) : (
            <ul className="space-y-2">
              {works.slice(0, 5).map((w) => (
                <li key={w.id}>
                  <Link
                    to={`/works/${w.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors"
                  >
                    <span className="font-medium truncate">{w.name}</span>
                    <span className="material-symbols-outlined text-text-light text-sm">chevron_right</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">{t.dashboard.recentOrders}</h2>
            <Link to="/orders" className="text-sm text-primary hover:underline font-medium">
              {t.orders.title}
            </Link>
          </div>
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-text-light text-sm">{t.dashboard.noOrders}</p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm text-text-light">
                    {new Date(o.created_at).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(o.status)}`}>
                    {getStatusText(o.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
