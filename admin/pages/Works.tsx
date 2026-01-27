import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Work } from '../lib/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import WorkForm, { WorkFormData } from '../components/WorkForm'
import { WorkCardSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'

const Works = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [deleteWork, setDeleteWork] = useState<Work | null>(null)
  
  const isCreateModalOpen = searchParams.get('action') === 'create'
  const isEditModalOpen = selectedWork !== null

  // Fetch works from API
  const { data: works = [], isLoading, error } = useQuery<Work[]>({
    queryKey: ['works'],
    queryFn: () => api.getWorks(),
  })

  // Create work mutation
  const createMutation = useMutation({
    mutationFn: (data: WorkFormData) => api.createWork(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
      addToast('success', 'Obra criada com sucesso!')
      closeCreateModal()
    },
    onError: () => {
      addToast('error', 'Erro ao criar obra. Tente novamente.')
    },
  })

  // Update work mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Work> }) => 
      api.updateWork(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
      addToast('success', 'Obra atualizada com sucesso!')
      setSelectedWork(null)
    },
    onError: () => {
      addToast('error', 'Erro ao atualizar obra. Tente novamente.')
    },
  })

  // Delete work mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
      addToast('success', 'Obra excluída com sucesso!')
      setDeleteWork(null)
    },
    onError: () => {
      addToast('error', 'Erro ao excluir obra. Tente novamente.')
    },
  })

  const closeCreateModal = () => {
    searchParams.delete('action')
    setSearchParams(searchParams)
  }

  const openCreateModal = () => {
    setSearchParams({ action: 'create' })
  }

  const handleCreateWork = async (data: WorkFormData) => {
    await createMutation.mutateAsync(data)
  }

  const handleUpdateWork = async (data: WorkFormData) => {
    if (selectedWork) {
      await updateMutation.mutateAsync({ id: selectedWork.id, data })
    }
  }

  const handleDeleteWork = async () => {
    if (deleteWork) {
      await deleteMutation.mutateAsync(deleteWork.id)
    }
  }

  const copyAccessToken = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin.replace(':3001', ':5173')}/obra/${token}`)
    addToast('success', 'Link de acesso copiado!')
  }
  
  const filteredWorks = works.filter(work => {
    const matchesSearch = work.name?.toLowerCase().includes(search.toLowerCase()) ||
                         work.client_name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || work.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
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

  if (error) {
    return (
      <div className="card text-center py-12">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
        <h3 className="text-lg font-medium mb-2">Erro ao carregar obras</h3>
        <p className="text-text-light mb-6">Não foi possível conectar ao servidor</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['works'] })}
          className="btn btn-primary"
        >
          <span className="material-symbols-outlined">refresh</span>
          Tentar novamente
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Obras</h1>
          <p className="text-text-light">Gerencie todas as obras do sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Obra
        </button>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por nome ou cliente..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="planned">Planejado</option>
              <option value="in_progress">Em andamento</option>
              <option value="completed">Concluído</option>
              <option value="on_hold">Pausado</option>
            </select>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="text-2xl font-bold text-text">{works.length}</p>
            <p className="text-xs text-text-light">Total de Obras</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {works.filter(w => w.status === 'in_progress').length}
            </p>
            <p className="text-xs text-text-light">Em Andamento</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {works.filter(w => w.status === 'completed').length}
            </p>
            <p className="text-xs text-text-light">Concluídas</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {works.filter(w => w.status === 'planned').length}
            </p>
            <p className="text-xs text-text-light">Planejadas</p>
          </div>
        </div>
      </div>
      
      {/* Works Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <WorkCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="card text-center py-12">
          <span className="material-symbols-outlined text-4xl text-text-light mb-4">construction</span>
          <h3 className="text-lg font-medium mb-2">
            {search || statusFilter !== 'all' 
              ? 'Nenhuma obra encontrada' 
              : 'Nenhuma obra cadastrada'}
          </h3>
          <p className="text-text-light mb-6">
            {search || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Crie sua primeira obra para começar'}
          </p>
          {!search && statusFilter === 'all' && (
            <button onClick={openCreateModal} className="btn btn-primary">
              <span className="material-symbols-outlined">add</span>
              Criar Primeira Obra
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((work) => (
            <div 
              key={work.id} 
              className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
            >
              {/* Work Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{work.name}</h3>
                  <p className="text-sm text-text-light truncate">{work.client_name}</p>
                </div>
                <span className={`flex-shrink-0 ml-2 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(work.status)}`}>
                  {getStatusText(work.status)}
                </span>
              </div>
              
              {/* Work Description */}
              <p className="text-sm text-text-light mb-4 line-clamp-2 min-h-[40px]">
                {work.description || 'Sem descrição'}
              </p>
              
              {/* Work Dates */}
              <div className="flex items-center justify-between text-sm mb-6">
                <div>
                  <p className="text-text-light text-xs">Início</p>
                  <p className="font-medium">
                    {work.start_date 
                      ? new Date(work.start_date).toLocaleDateString('pt-BR')
                      : '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-text-light text-xs">Término</p>
                  <p className="font-medium">
                    {work.end_date 
                      ? new Date(work.end_date).toLocaleDateString('pt-BR')
                      : '-'}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/works/${work.id}`}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Detalhes
                  </Link>
                  <span className="text-border">•</span>
                  <Link
                    to={`/works/${work.id}/timeline`}
                    className="text-sm text-text-light hover:text-text"
                  >
                    Timeline
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => copyAccessToken(work.access_token)}
                    className="p-2 hover:bg-background rounded transition-colors"
                    title="Copiar link de acesso"
                  >
                    <span className="material-symbols-outlined text-text-light hover:text-primary">link</span>
                  </button>
                  <button 
                    onClick={() => setSelectedWork(work)}
                    className="p-2 hover:bg-background rounded transition-colors"
                    title="Editar obra"
                  >
                    <span className="material-symbols-outlined text-text-light hover:text-primary">edit</span>
                  </button>
                  <button 
                    onClick={() => setDeleteWork(work)}
                    className="p-2 hover:bg-background rounded transition-colors"
                    title="Excluir obra"
                  >
                    <span className="material-symbols-outlined text-text-light hover:text-red-600">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Work Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Criar Nova Obra"
        size="lg"
      >
        <WorkForm
          onSubmit={handleCreateWork}
          onCancel={closeCreateModal}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Work Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setSelectedWork(null)}
        title="Editar Obra"
        size="lg"
      >
        <WorkForm
          work={selectedWork}
          onSubmit={handleUpdateWork}
          onCancel={() => setSelectedWork(null)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteWork !== null}
        onClose={() => setDeleteWork(null)}
        onConfirm={handleDeleteWork}
        title="Excluir Obra"
        message={`Tem certeza que deseja excluir a obra "${deleteWork?.name}"? Esta ação não pode ser desfeita e todas as imagens da timeline serão perdidas.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export default Works
