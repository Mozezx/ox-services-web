import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../components/Toast'

const Upload = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const { addToast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [file, setFile] = useState<File | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!id || !file) throw new Error('Missing work or file')
      const type = file.type.startsWith('image') ? 'image' : 'video'
      return api.uploadPhoto(id, file, {
        title,
        description,
        date,
        type: type as 'image' | 'video',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-work', id] })
      queryClient.invalidateQueries({ queryKey: ['technician-works'] })
      addToast('success', 'Upload successful!')
      navigate(`/works/${id}`)
    },
    onError: (err: Error) => {
      addToast('error', err.message || t.common.error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      addToast('error', 'Title is required')
      return
    }
    if (!file) {
      addToast('error', 'Please select a file')
      return
    }
    uploadMutation.mutate()
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <nav className="flex items-center gap-2 text-sm text-white">
        <Link to="/works" className="text-white hover:text-white/90">{t.works.myWorks}</Link>
        <span className="material-symbols-outlined text-xs text-white">chevron_right</span>
        <Link to={`/works/${id}`} className="text-white hover:text-white/90">Work</Link>
        <span className="material-symbols-outlined text-xs text-white">chevron_right</span>
        <span className="text-white">{t.works.uploadPhoto}</span>
      </nav>

      <h1 className="text-2xl font-bold text-white">{t.works.uploadPhoto}</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input w-full"
            required
            placeholder="e.g. Progress photo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full min-h-[80px]"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">File (image or video) *</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="input w-full"
            required
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Link to={`/works/${id}`} className="btn btn-outline">{t.common.cancel}</Link>
          <button type="submit" className="btn btn-primary" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                {t.common.loading}
              </>
            ) : (
              t.works.uploadPhoto
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Upload
