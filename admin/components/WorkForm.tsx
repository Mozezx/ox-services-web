import { useState, useEffect } from 'react'
import { Work } from '../lib/api'

interface WorkFormProps {
  work?: Work | null
  onSubmit: (data: WorkFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface WorkFormData {
  name: string
  description: string
  client_name: string
  client_email: string
  start_date: string
  end_date: string
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold'
  cover_image_url: string
}

const WorkForm = ({ work, onSubmit, onCancel, isLoading = false }: WorkFormProps) => {
  const [formData, setFormData] = useState<WorkFormData>({
    name: '',
    description: '',
    client_name: '',
    client_email: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'planned',
    cover_image_url: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof WorkFormData, string>>>({})

  useEffect(() => {
    if (work) {
      setFormData({
        name: work.name || '',
        description: work.description || '',
        client_name: work.client_name || '',
        client_email: work.client_email || '',
        start_date: work.start_date?.split('T')[0] || '',
        end_date: work.end_date?.split('T')[0] || '',
        status: work.status || 'planned',
        cover_image_url: work.cover_image_url || '',
      })
    }
  }, [work])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof WorkFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da obra é obrigatório'
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Nome do cliente é obrigatório'
    }

    if (formData.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'E-mail inválido'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Data de início é obrigatória'
    }

    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'Data de término deve ser após a data de início'
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

  const handleChange = (field: keyof WorkFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const statusOptions = [
    { value: 'planned', label: 'Planejado', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'Em andamento', color: 'bg-amber-100 text-amber-800' },
    { value: 'completed', label: 'Concluído', color: 'bg-green-100 text-green-800' },
    { value: 'on_hold', label: 'Pausado', color: 'bg-red-100 text-red-800' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome da Obra */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Nome da Obra <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`input ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
          placeholder="Ex: Reforma Residencial - Casa Silva"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Descrição
        </label>
        <textarea
          className="input min-h-[100px] resize-none"
          placeholder="Descreva os detalhes da obra..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      {/* Cliente - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Nome do Cliente <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.client_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
            placeholder="Nome completo do cliente"
            value={formData.client_name}
            onChange={(e) => handleChange('client_name', e.target.value)}
          />
          {errors.client_name && <p className="text-red-500 text-sm mt-1">{errors.client_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            E-mail do Cliente
          </label>
          <input
            type="email"
            className={`input ${errors.client_email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
            placeholder="cliente@email.com"
            value={formData.client_email}
            onChange={(e) => handleChange('client_email', e.target.value)}
          />
          {errors.client_email && <p className="text-red-500 text-sm mt-1">{errors.client_email}</p>}
        </div>
      </div>

      {/* Datas - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Data de Início <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={`input ${errors.start_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
          {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Data de Término (Prevista)
          </label>
          <input
            type="date"
            className={`input ${errors.end_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
          />
          {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Status
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('status', option.value)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                formData.status === option.value
                  ? option.color + ' ring-2 ring-offset-2 ring-primary/30'
                  : 'bg-background text-text-light hover:bg-border'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* URL da Imagem de Capa */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          URL da Imagem de Capa
        </label>
        <input
          type="url"
          className="input"
          placeholder="https://exemplo.com/imagem.jpg"
          value={formData.cover_image_url}
          onChange={(e) => handleChange('cover_image_url', e.target.value)}
        />
        {formData.cover_image_url && (
          <div className="mt-3">
            <img
              src={formData.cover_image_url}
              alt="Preview da capa"
              className="w-full h-32 object-cover rounded-lg border border-border"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
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
              {work ? 'Atualizar Obra' : 'Criar Obra'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default WorkForm
