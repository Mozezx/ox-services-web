import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLanguage } from '../context/LanguageContext'

const MyWorks = () => {
  const { t } = useLanguage()
  const { data: works = [], isLoading } = useQuery({
    queryKey: ['technician-works'],
    queryFn: () => api.getMyWorks(),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-600 text-white'
      case 'in_progress': return 'bg-amber-100 text-amber-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Planejadas'
      case 'in_progress': return 'Em andamento'
      case 'completed': return 'Concluído'
      default: return status
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.works.title}</h1>
        <p className="text-white/80">{t.works.myWorks}</p>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            <span className="material-symbols-outlined text-4xl mb-4 block">construction</span>
            <p>{t.works.noWorks}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((w) => (
              <Link
                key={w.id}
                to={`/works/${w.id}`}
                className="block p-4 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-text truncate flex-1">{w.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getStatusColor(w.status)}`}>
                    {getStatusLabel(w.status)}
                  </span>
                </div>
                {w.description && (
                  <p className="text-sm text-text-light line-clamp-2">{w.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2 text-sm text-primary font-medium">
                  <span>{t.works.viewDetail}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyWorks
