import React, { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api, Work } from '../lib/api'
import { useToast } from '../components/Toast'
import { useUploadQueue } from '../context/UploadQueueContext'

const MAX_IMAGE_MB = 20
const MAX_VIDEO_MB = 250

const Upload = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { addJobs } = useUploadQueue()
  
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isDragOver, setIsDragOver] = useState(false)

  // Fetch work details
  const { data: work } = useQuery<Work>({
    queryKey: ['work', id],
    queryFn: () => api.getWork(id!),
    enabled: !!id,
  })
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    addFiles(selectedFiles)
  }

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        addToast('warning', `${file.name}: Formato não suportado`)
        return false
      }
      const isVideo = file.type.startsWith('video/')
      const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB
      if (file.size > maxMb * 1024 * 1024) {
        addToast('warning', `${file.name}: Máx ${maxMb} MB`)
        return false
      }
      return true
    })
    setFiles(prev => [...prev, ...validFiles])
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])
  
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleUpload = () => {
    if (files.length === 0) {
      addToast('warning', 'Selecione pelo menos um arquivo')
      return
    }
    if (!title.trim()) {
      addToast('warning', 'Digite um título para a atualização')
      return
    }
    if (!id) {
      addToast('error', 'ID da obra não encontrado')
      return
    }
    addJobs(id, work?.name, files, { title, description, date })
    addToast('info', `${files.length} arquivo(s) na fila. Enviando em segundo plano. Pode navegar.`)
    setFiles([])
    setTitle('')
    setDescription('')
    navigate(`/works/${id}/timeline`)
  }
  
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return 'photo'
    if (file.type.startsWith('video/')) return 'play_circle'
    return 'description'
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return null
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-light">
        <Link to="/works" className="hover:text-primary">Obras</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link to={`/works/${id}`} className="hover:text-primary">{work?.name || 'Detalhes'}</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-text">Upload</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Upload de Mídia</h1>
          <p className="text-text-light">Adicione imagens e vídeos à timeline</p>
        </div>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || !title.trim()}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">cloud_upload</span>
          Enviar em segundo plano {files.length > 0 && `(${files.length})`}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Arquivos</h2>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                isDragOver ? 'bg-primary/20' : 'bg-primary/10'
              }`}>
                <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
              </div>
              <h3 className="font-medium mb-2">Arraste e solte arquivos aqui</h3>
              <p className="text-text-light mb-4">ou</p>
              <label className="btn btn-outline cursor-pointer">
                <span className="material-symbols-outlined">folder_open</span>
                Selecionar Arquivos
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="text-sm text-text-light mt-4">
                JPG, PNG, GIF, MP4, MOV • Imagens até 20MB, vídeos até 300MB
              </p>
            </div>
          </div>
          
          {/* File List */}
          {files.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Arquivos Selecionados ({files.length})
                </h2>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover todos
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 border border-border rounded-lg group hover:border-primary/30 transition-colors"
                  >
                    {/* Preview */}
                    <div className="w-14 h-14 bg-background rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={getFilePreview(file)!} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-purple-600">
                          {getFileIcon(file)}
                        </span>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-text-light">
                        {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                      </p>
                    </div>
                    
                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover"
                    >
                      <span className="material-symbols-outlined text-red-600 text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar - Metadata */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Informações</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Demolição da parede"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Descrição</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="Descreva esta atualização..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Data</label>
                <input
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Dicas</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                <span className="text-text-light">Use fotos bem iluminadas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                <span className="text-text-light">Vídeos curtos carregam mais rápido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                <span className="text-text-light">Adicione descrições detalhadas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                <span className="text-text-light">Mantenha as datas organizadas</span>
              </li>
            </ul>
          </div>

          {/* Work Info */}
          {work && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Obra</h2>
              <div className="space-y-2">
                <p className="font-medium">{work.name}</p>
                <p className="text-sm text-text-light">{work.client_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Upload
