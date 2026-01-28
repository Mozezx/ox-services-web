import { useState } from 'react'
import { useUploadQueue } from '../context/UploadQueueContext'
import type { UploadJob } from '../context/UploadQueueContext'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function JobRow({ job, onRemove }: { job: UploadJob; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5">
      <span className="material-symbols-outlined text-lg text-white/80">
        {job.type === 'video' ? 'videocam' : 'image'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{job.file.name}</p>
        <p className="text-xs text-white/60">{formatSize(job.file.size)}</p>
        {job.status === 'uploading' && (
          <div className="mt-1 h-1 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        )}
        {job.status === 'done' && (
          <p className="text-xs text-emerald-400 mt-0.5">Enviado</p>
        )}
        {job.status === 'error' && (
          <p className="text-xs text-red-400 mt-0.5 truncate">{job.error || 'Erro'}</p>
        )}
      </div>
      {(job.status === 'done' || job.status === 'error') && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white"
          aria-label="Remover"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}
    </div>
  )
}

export default function UploadQueueBar() {
  const { jobs, removeJob, clearDone } = useUploadQueue()
  const [collapsed, setCollapsed] = useState(false)

  const active = jobs.filter((j) => j.status === 'pending' || j.status === 'uploading')
  const doneOrError = jobs.filter((j) => j.status === 'done' || j.status === 'error')

  if (jobs.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-white/10 shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-2 text-white font-medium"
          >
            <span className="material-symbols-outlined">
              {collapsed ? 'expand_more' : 'expand_less'}
            </span>
            Uploads em segundo plano
            {active.length > 0 && (
              <span className="text-sm text-white/70">
                ({active.length} enviando...)
              </span>
            )}
          </button>
          {doneOrError.length > 0 && (
            <button
              type="button"
              onClick={clearDone}
              className="text-sm text-white/70 hover:text-white"
            >
              Limpar concluídos
            </button>
          )}
        </div>
        {!collapsed && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onRemove={() => removeJob(job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
