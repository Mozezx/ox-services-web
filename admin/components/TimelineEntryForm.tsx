import { useState, useEffect } from 'react'
import { TimelineEntry, resolveMediaUrl } from '../lib/api'

interface TimelineEntryFormProps {
  entry?: TimelineEntry | null
  onSubmit: (data: TimelineEntryFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface TimelineEntryFormData {
  title: string
  description: string
  date: string
}

const TimelineEntryForm = ({ entry, onSubmit, onCancel, isLoading = false }: TimelineEntryFormProps) => {
  const [formData, setFormData] = useState<TimelineEntryFormData>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TimelineEntryFormData, string>>>({})

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        description: entry.description || '',
        date: entry.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      })
    }
  }, [entry])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TimelineEntryFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit(formData)
    }
  }

  const handleChange = (field: keyof TimelineEntryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Preview da mídia atual */}
      {entry && (
        <div className="p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
              {entry.type === 'image' ? (
                <img
                  src={resolveMediaUrl(entry.media_url)}
                  alt={entry.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">play_circle</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  entry.type === 'image' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {entry.type === 'image' ? 'Imagem' : 'Vídeo'}
                </span>
                <span className="text-xs text-text-light">
                  Ordem: {entry.order}
                </span>
              </div>
              <p className="text-sm text-text-light truncate">{entry.media_url}</p>
            </div>
          </div>
        </div>
      )}

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`input ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
          placeholder="Ex: Demolição da parede"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Descrição
        </label>
        <textarea
          className="input min-h-[100px] resize-none"
          placeholder="Descreva esta atualização da obra..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      {/* Data */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Data <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className={`input ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn btn-outline"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <>
              <div className="spinner !w-4 !h-4" />
              Salvando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">save</span>
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default TimelineEntryForm
