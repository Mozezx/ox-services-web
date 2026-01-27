import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Work, TimelineEntry } from '../lib/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import WorkForm, { WorkFormData } from '../components/WorkForm'
import ImageGallery from '../components/ImageGallery'
import { DetailSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'

const WorkDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch work details
  const { data: work, isLoading: isLoadingWork, error: workError } = useQuery<Work>({
    queryKey: ['work', id],
    queryFn: () => api.getWork(id!),
    enabled: !!id,
  })

  // Fetch timeline entries
  const { data: timelineEntries = [], isLoading: isLoadingTimeline } = useQuery<TimelineEntry[]>({
    queryKey: ['timeline', id],
    queryFn: () => api.getTimelineEntries(id!),
    enabled: !!id,
  })

  // Update work mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Work>) => api.updateWork(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work', id] })
      queryClient.invalidateQueries({ queryKey: ['works'] })
      addToast('success', 'Obra atualizada com sucesso!')
      setIsEditModalOpen(false)
    },
    onError: () => {
      addToast('error', 'Erro ao atualizar obra. Tente novamente.')
    },
  })

  // Delete work mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.deleteWork(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
      addToast('success', 'Obra excluída com sucesso!')
      navigate('/works')
    },
    onError: () => {
      addToast('error', 'Erro ao excluir obra. Tente novamente.')
    },
  })

  const handleUpdateWork = async (data: WorkFormData) => {
    await updateMutation.mutateAsync(data)
  }

  const handleDeleteWork = async () => {
    await deleteMutation.mutateAsync()
  }

  const copyAccessLink = () => {
    if (work) {
      const baseUrl = window.location.origin.replace(':3001', ':5173')
      navigator.clipboard.writeText(`${baseUrl}/obra/${work.access_token}`)
      addToast('success', 'Link de acesso copiado!')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-amber-100 text-amber-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Planejado'
      case 'in_progress': return 'Em andamento'
      case 'completed': return 'Concluído'
      case 'on_hold': return 'Pausado'
      default: return status
    }
  }

  if (isLoadingWork) {
    return <DetailSkeleton />
  }

  if (workError || !work) {
    return (
      <div className="card text-center py-12">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
        <h3 className="text-lg font-medium mb-2">Erro ao carregar obra</h3>
        <p className="text-text-light mb-6">Não foi possível encontrar a obra solicitada</p>
        <Link to="/works" className="btn btn-primary">
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar para Obras
        </Link>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-light">
        <Link to="/works" className="hover:text-primary">Obras</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-text">{work.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text">{work.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(work.status)}`}>
              {getStatusText(work.status)}
            </span>
          </div>
          <p className="text-text-light">Detalhes e gerenciamento da obra</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={`/works/${id}/timeline`} className="btn btn-outline">
            <span className="material-symbols-outlined">photo_library</span>
            Timeline
          </Link>
          <Link to={`/works/${id}/upload`} className="btn btn-primary">
            <span className="material-symbols-outlined">upload</span>
            Upload
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Info Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Informações da Obra</h2>
                <p className="text-text-light text-sm">Dados principais e descrição</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-outline text-sm"
              >
                <span className="material-symbols-outlined">edit</span>
                Editar
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-sm text-text-light mb-2">Descrição</h3>
                <p className="text-text">{work.description || 'Nenhuma descrição informada'}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-text-light mb-1">Data de Início</p>
                  <p className="font-medium">
                    {work.start_date 
                      ? new Date(work.start_date).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Não informada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-light mb-1">Data de Término</p>
                  <p className="font-medium">
                    {work.end_date 
                      ? new Date(work.end_date).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Não informada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Gallery */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Galeria da Timeline</h2>
                <p className="text-text-light text-sm">
                  {timelineEntries.length} {timelineEntries.length === 1 ? 'registro' : 'registros'} na timeline
                </p>
              </div>
              <Link 
                to={`/works/${id}/timeline`} 
                className="text-sm text-primary hover:underline font-medium"
              >
                Ver Timeline Completa
              </Link>
            </div>
            
            {isLoadingTimeline ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-border rounded-lg animate-skeleton" />
                ))}
              </div>
            ) : (
              <ImageGallery 
                entries={timelineEntries.slice(0, 8)} 
              />
            )}
            
            {timelineEntries.length > 8 && (
              <div className="text-center mt-4 pt-4 border-t border-border">
                <Link 
                  to={`/works/${id}/timeline`}
                  className="text-sm text-primary hover:underline"
                >
                  Ver mais {timelineEntries.length - 8} registros
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Informações do Cliente</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-light">Nome</p>
                <p className="font-medium">{work.client_name || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-text-light">E-mail</p>
                {work.client_email ? (
                  <a 
                    href={`mailto:${work.client_email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {work.client_email}
                  </a>
                ) : (
                  <p className="font-medium text-text-light">Não informado</p>
                )}
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-text-light mb-2">Link de Acesso do Cliente</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background px-3 py-2 rounded text-xs font-mono truncate">
                    {work.access_token}
                  </code>
                  <button 
                    onClick={copyAccessLink}
                    className="p-2 hover:bg-background rounded transition-colors"
                    title="Copiar link"
                  >
                    <span className="material-symbols-outlined text-primary">content_copy</span>
                  </button>
                </div>
                <p className="text-xs text-text-light mt-2">
                  Compartilhe este link com o cliente para acessar a página da obra
                </p>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{timelineEntries.length}</p>
                <p className="text-xs text-text-light">Registros</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {timelineEntries.filter(e => e.type === 'image').length}
                </p>
                <p className="text-xs text-text-light">Fotos</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {timelineEntries.filter(e => e.type === 'video').length}
                </p>
                <p className="text-xs text-text-light">Vídeos</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {work.start_date && work.end_date
                    ? Math.ceil((new Date(work.end_date).getTime() - new Date(work.start_date).getTime()) / (1000 * 60 * 60 * 24))
                    : '-'}
                </p>
                <p className="text-xs text-text-light">Dias</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-background transition-colors"
              >
                <span className="material-symbols-outlined text-text-light">edit</span>
                <span>Editar Obra</span>
              </button>
              <Link
                to={`/works/${id}/upload`}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-background transition-colors"
              >
                <span className="material-symbols-outlined text-text-light">cloud_upload</span>
                <span>Adicionar Mídia</span>
              </Link>
              <button 
                onClick={copyAccessLink}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-background transition-colors"
              >
                <span className="material-symbols-outlined text-text-light">share</span>
                <span>Copiar Link de Acesso</span>
              </button>
              <button 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full flex items-center gap-3 p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                <span className="material-symbols-outlined">delete</span>
                <span>Excluir Obra</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Work Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Obra"
        size="lg"
      >
        <WorkForm
          work={work}
          onSubmit={handleUpdateWork}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteWork}
        title="Excluir Obra"
        message={`Tem certeza que deseja excluir a obra "${work.name}"? Esta ação não pode ser desfeita e todos os registros da timeline serão perdidos.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export default WorkDetail
