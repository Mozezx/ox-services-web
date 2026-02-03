import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTimeline } from '../hooks/useTimeline'
import { resolveMediaUrl } from '../lib/api'

const TimelineEnhanced = () => {
  const { id } = useParams<{ id: string }>()
  const { entries, isLoading, deleteEntry, updateEntry, isDeleting, isUpdating } = useTimeline(id || '')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const handleEdit = (entry: any) => {
    setEditingId(entry.id)
    setEditTitle(entry.title)
    setEditDescription(entry.description)
  }

  const handleSave = async (entryId: string) => {
    if (!editTitle.trim()) {
      alert('Título é obrigatório')
      return
    }

    try {
      await updateEntry({
        id: entryId,
        updates: {
          title: editTitle,
          description: editDescription,
        },
      })
      setEditingId(null)
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      alert('Erro ao atualizar entrada')
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) {
      return
    }

    try {
      await deleteEntry(entryId)
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir entrada')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner"></div>
        <span className="ml-3">Carregando timeline...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Timeline da Obra</h1>
          <p className="text-text-light">Gerencie as atualizações visuais da obra</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/works/${id}/upload`} className="btn btn-primary">
            <span className="material-symbols-outlined">upload</span>
            Novo Upload
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Total de Entradas</p>
              <p className="text-2xl font-bold">{entries.length}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">photo_library</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Imagens</p>
              <p className="text-2xl font-bold">{entries.filter(e => e.type === 'image').length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">photo</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Vídeos</p>
              <p className="text-2xl font-bold">{entries.filter(e => e.type === 'video').length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">play_circle</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Última Atualização</p>
              <p className="text-lg font-bold">
                {entries.length > 0 
                  ? new Date(entries[entries.length - 1].date).toLocaleDateString('pt-BR')
                  : 'Nenhuma'
                }
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">schedule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="space-y-8">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-text-light mb-4">photo_library</span>
              <h3 className="text-lg font-medium mb-2">Nenhuma entrada na timeline</h3>
              <p className="text-text-light mb-6">Faça upload de imagens ou vídeos para começar</p>
              <Link to={`/works/${id}/upload`} className="btn btn-primary">
                Fazer Primeiro Upload
              </Link>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div key={entry.id} className="flex">
                {/* Timeline line */}
                <div className="flex flex-col items-center mr-6">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-border'}`} />
                  {index < entries.length - 1 && (
                    <div className="w-0.5 h-full bg-border flex-1 mt-3" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="bg-surface border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {entry.type === 'image' ? 'Imagem' : 'Vídeo'}
                          </span>
                          <span className="text-sm text-text-light">
                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        {editingId === entry.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              className="input"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Título"
                            />
                            <textarea
                              className="input min-h-[100px]"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Descrição"
                            />
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold">{entry.title}</h3>
                            <p className="text-text-light mt-2">{entry.description}</p>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {editingId === entry.id ? (
                          <>
                            <button
                              onClick={() => handleSave(entry.id)}
                              disabled={isUpdating}
                              className="p-2 hover:bg-background rounded text-green-600"
                            >
                              {isUpdating ? (
                                <div className="spinner w-4 h-4"></div>
                              ) : (
                                <span className="material-symbols-outlined">check</span>
                              )}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 hover:bg-background rounded"
                            >
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-2 hover:bg-background rounded"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              disabled={isDeleting}
                              className="p-2 hover:bg-background rounded text-red-600"
                            >
                              {isDeleting ? (
                                <div className="spinner w-4 h-4"></div>
                              ) : (
                                <span className="material-symbols-outlined">delete</span>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Media Preview */}
                    <div className="aspect-video bg-background rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      {entry.type === 'image' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-text-light text-6xl">photo</span>
                          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {entry.media_url.split('/').pop()}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-text-light text-6xl">play_circle</span>
                          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Vídeo
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-text-light">
                      <div className="flex items-center gap-4">
                        <span>ID: {entry.id.substring(0, 8)}...</span>
                        <span>Ordem: {entry.order}</span>
                      </div>
                      <a
                        href={resolveMediaUrl(entry.media_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Ver original
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Como funciona a Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary">upload</span>
            </div>
            <h3 className="font-medium mb-2">1. Upload</h3>
            <p className="text-sm text-text-light">Faça upload de imagens ou vídeos através da página de upload</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-green-600">auto_awesome</span>
            </div>
            <h3 className="font-medium mb-2">2. Organize</h3>
            <p className="text-sm text-text-light">Edite títulos, descrições e reorganize a ordem das entradas</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-amber-600">share</span>
            </div>
            <h3 className="font-medium mb-2">3. Compartilhe</h3>
            <p className="text-sm text-text-light">Compartilhe o token da obra com o cliente para visualização</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineEnhanced