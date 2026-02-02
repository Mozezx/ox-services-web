import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLanguage } from '../context/LanguageContext'

const WorkDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useLanguage()
  const { data, isLoading, error } = useQuery({
    queryKey: ['technician-work', id],
    queryFn: () => api.getWork(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="card text-center py-12">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
        <h3 className="text-lg font-medium mb-2">{t.common.error}</h3>
        <p className="text-text-light mb-6">{t.works.noWorks}</p>
        <Link to="/works" className="btn btn-primary">
          <span className="material-symbols-outlined">arrow_back</span>
          {t.common.back}
        </Link>
      </div>
    )
  }

  const { work, timeline } = data

  return (
    <div className="space-y-6 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-white">
        <Link to="/works" className="text-white hover:text-white/90">{t.works.myWorks}</Link>
        <span className="material-symbols-outlined text-xs text-white">chevron_right</span>
        <span className="text-white">{work.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{work.name}</h1>
          {work.description && <p className="text-white/80 mt-1">{work.description}</p>}
        </div>
        <Link to={`/works/${id}/upload`} className="btn btn-primary">
          <span className="material-symbols-outlined">upload</span>
          {t.works.uploadPhoto}
        </Link>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-text-light text-sm">No entries yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeline.map((entry) => (
              <div key={entry.id} className="rounded-lg overflow-hidden border border-border">
                {entry.type === 'image' ? (
                  <img
                    src={entry.media_url}
                    alt={entry.title}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-border flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-text-light">videocam</span>
                  </div>
                )}
                <div className="p-2">
                  <p className="font-medium text-sm truncate">{entry.title}</p>
                  <p className="text-xs text-text-light">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkDetail
