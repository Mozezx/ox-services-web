import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Work, TimelineEntry, resolveMediaUrl } from '../lib/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import TimelineEntryForm, { TimelineEntryFormData } from '../components/TimelineEntryForm'
import ImageGallery from '../components/ImageGallery'
import { TimelineEntrySkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'

type ViewMode = 'timeline' | 'gallery'

const Timeline = () => {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [editEntry, setEditEntry] = useState<TimelineEntry | null>(null)
  const [deleteEntry, setDeleteEntry] = useState<TimelineEntry | null>(null)

  // Fetch work details
  const { data: work } = useQuery<Work>({
    queryKey: ['work', id],
    queryFn: () => api.getWork(id!),
    enabled: !!id,
  })

  // Fetch timeline entries
  const { data: entries = [], isLoading, error } = useQuery<TimelineEntry[]>({
    queryKey: ['timeline', id],
    queryFn: () => api.getTimelineEntries(id!),
    enabled: !!id,
  })

  // Update entry mutation
  const updateMutation = useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: TimelineEntryFormData }) => 
      api.updateTimelineEntry(entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', id] })
      addToast('success', 'Entrada atualizada com sucesso!')
      setEditEntry(null)
    },
    onError: () => {
      addToast('error', 'Erro ao atualizar entrada. Tente novamente.')
    },
  })

  // Delete entry mutation
  const deleteMutation = useMutation({
    mutationFn: (entryId: string) => api.deleteTimelineEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', id] })
      addToast('success', 'Entrada excluída com sucesso!')
      setDeleteEntry(null)
    },
    onError: () => {
      addToast('error', 'Erro ao excluir entrada. Tente novamente.')
    },
  })

  const handleUpdateEntry = async (data: TimelineEntryFormData) => {
    if (editEntry) {
      await updateMutation.mutateAsync({ entryId: editEntry.id, data })
    }
  }

  const handleDeleteEntry = async () => {
    if (deleteEntry) {
      await deleteMutation.mutateAsync(deleteEntry.id)
    }
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
        <h3 className="text-lg font-medium mb-2">Erro ao carregar timeline</h3>
        <p className="text-text-light mb-6">Não foi possível carregar os registros</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['timeline', id] })}
          className="btn btn-primary"
        >
          <span className="material-symbols-outlined">refresh</span>
          Tentar novamente
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white">
        <Link to="/works" className="text-white hover:text-white/90">Obras</Link>
        <span className="material-symbols-outlined text-xs text-white">chevron_right</span>
        <Link to={`/works/${id}`} className="text-white hover:text-white/90">{work?.name || 'Detalhes'}</Link>
        <span className="material-symbols-outlined text-xs text-white">chevron_right</span>
        <span className="text-white">Timeline</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Timeline da Obra</h1>
          <p className="text-white/80">
            {entries.length} {entries.length === 1 ? 'registro' : 'registros'} na timeline
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* View Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-primary border border-primary'
                  : 'bg-background text-text-light hover:bg-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg align-middle mr-1">timeline</span>
              Timeline
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'gallery'
                  ? 'bg-white text-primary border border-primary'
                  : 'bg-background text-text-light hover:bg-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg align-middle mr-1">grid_view</span>
              Galeria
            </button>
          </div>
          <Link to={`/works/${id}/upload`} className="btn btn-primary">
            <span className="material-symbols-outlined">add</span>
            Nova Entrada
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-text">{entries.length}</p>
          <p className="text-xs text-text-light">Total de Registros</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {entries.filter(e => e.type === 'image').length}
          </p>
          <p className="text-xs text-text-light">Imagens</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {entries.filter(e => e.type === 'video').length}
          </p>
          <p className="text-xs text-text-light">Vídeos</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {entries.length > 0
              ? new Date(entries[entries.length - 1].date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
              : '-'}
          </p>
          <p className="text-xs text-text-light">Última Atualização</p>
        </div>
      </div>
      
      {/* Content */}
      {isLoading ? (
        <div className="card">
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <TimelineEntrySkeleton key={i} />
            ))}
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-12">
          <span className="material-symbols-outlined text-4xl text-text-light mb-4">photo_library</span>
          <h3 className="text-lg font-medium mb-2">Timeline vazia</h3>
          <p className="text-text-light mb-6">Adicione fotos e vídeos para documentar o progresso da obra</p>
          <Link to={`/works/${id}/upload`} className="btn btn-primary">
            <span className="material-symbols-outlined">add</span>
            Adicionar Primeiro Registro
          </Link>
        </div>
      ) : viewMode === 'gallery' ? (
        <div className="card">
          <ImageGallery
            entries={entries}
            onEdit={(entry) => setEditEntry(entry)}
            onDelete={(entry) => setDeleteEntry(entry)}
          />
        </div>
      ) : (
        <div className="card">
          <div className="space-y-8">
            {entries.map((entry, index) => (
              <div key={entry.id} className="flex">
                {/* Timeline line */}
                <div className="flex flex-col items-center mr-4 md:mr-6">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${index === 0 ? 'bg-primary' : 'bg-border'}`} />
                  {index < entries.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-3" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-8 min-w-0">
                  <div className="bg-surface border border-border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            entry.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {entry.type === 'image' ? 'Imagem' : 'Vídeo'}
                          </span>
                          <span className="text-sm text-text-light">
                            {new Date(entry.date).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold truncate">{entry.title}</h3>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => setEditEntry(entry)}
                          className="p-2 hover:bg-background rounded transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-text-light hover:text-primary">edit</span>
                        </button>
                        <button 
                          onClick={() => setDeleteEntry(entry)}
                          className="p-2 hover:bg-background rounded transition-colors"
                          title="Excluir"
                        >
                          <span className="material-symbols-outlined text-text-light hover:text-red-600">delete</span>
                        </button>
                      </div>
                    </div>
                    
                    {entry.description && (
                      <p className="text-text-light mb-4">{entry.description}</p>
                    )}
                    
                    {/* Media Preview */}
                    <div className="rounded-lg overflow-hidden bg-background max-w-lg">
                      {entry.type === 'image' ? (
                        <img
                          src={resolveMediaUrl(entry.media_url)}
                          alt={entry.title}
                          className="w-full h-48 md:h-64 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.png'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-48 md:h-64">
                          <video
                            src={resolveMediaUrl(entry.media_url)}
                            controls
                            className="w-full h-full object-cover"
                            poster={(entry.thumbnail_url || entry.media_url) ? resolveMediaUrl(entry.thumbnail_url || entry.media_url) : undefined}
                            onError={(e) => {
                              const target = e.currentTarget
                              target.style.display = 'none'
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                          <div className="absolute inset-0 hidden items-center justify-center bg-primary/10" style={{ display: 'none' }}>
                            <span className="material-symbols-outlined text-4xl text-primary">play_circle</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-text-light">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Ordem: {entry.order}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">link</span>
                        <span className="truncate max-w-[200px]">{entry.media_url}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tips */}
      {entries.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Dicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary">photo</span>
              </div>
              <h3 className="font-medium mb-2">Formatos Suportados</h3>
              <p className="text-sm text-text-light">JPG, PNG, GIF, MP4, MOV • Imagens até 20MB, vídeos até 300MB</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-green-600">auto_awesome</span>
              </div>
              <h3 className="font-medium mb-2">Otimização Automática</h3>
              <p className="text-sm text-text-light">Imagens são redimensionadas e comprimidas</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-amber-600">security</span>
              </div>
              <h3 className="font-medium mb-2">Privacidade</h3>
              <p className="text-sm text-text-light">Apenas clientes com link podem visualizar</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      <Modal
        isOpen={editEntry !== null}
        onClose={() => setEditEntry(null)}
        title="Editar Entrada"
        size="md"
      >
        <TimelineEntryForm
          entry={editEntry}
          onSubmit={handleUpdateEntry}
          onCancel={() => setEditEntry(null)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteEntry !== null}
        onClose={() => setDeleteEntry(null)}
        onConfirm={handleDeleteEntry}
        title="Excluir Entrada"
        message={`Tem certeza que deseja excluir "${deleteEntry?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export default Timeline
