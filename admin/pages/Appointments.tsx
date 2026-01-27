import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Appointment } from '../lib/api'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

const Appointments = () => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null)

  // Fetch appointments from API
  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments', statusFilter],
    queryFn: () => api.getAppointments(statusFilter !== 'all' ? statusFilter : undefined),
  })

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['appointments-stats'],
    queryFn: () => api.getAppointmentsStats(),
  })

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.updateAppointment(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments-stats'] })
      addToast('success', 'Status atualizado com sucesso!')
    },
    onError: () => {
      addToast('error', 'Erro ao atualizar status. Tente novamente.')
    },
  })

  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments-stats'] })
      addToast('success', 'Agendamento excluído com sucesso!')
      setDeleteAppointment(null)
      setSelectedAppointment(null)
    },
    onError: () => {
      addToast('error', 'Erro ao excluir agendamento. Tente novamente.')
    },
  })

  const handleStatusChange = async (id: string, status: string) => {
    await updateMutation.mutateAsync({ id, status })
  }

  const handleDelete = async () => {
    if (deleteAppointment) {
      await deleteMutation.mutateAsync(deleteAppointment.id)
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.email?.toLowerCase().includes(search.toLowerCase()) ||
      apt.company?.toLowerCase().includes(search.toLowerCase()) ||
      apt.phone?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-yellow-100 text-yellow-800'
      case 'contacted': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Novo'
      case 'read': return 'Lido'
      case 'contacted': return 'Contatado'
      case 'completed': return 'Concluído'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return 'mark_email_unread'
      case 'read': return 'drafts'
      case 'contacted': return 'phone_in_talk'
      case 'completed': return 'check_circle'
      default: return 'help'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return formatDate(dateStr)
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
        <h3 className="text-lg font-medium mb-2">Erro ao carregar agendamentos</h3>
        <p className="text-text-light mb-6">Não foi possível conectar ao servidor</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['appointments'] })}
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
          <h1 className="text-2xl font-bold text-text">Agendamentos</h1>
          <p className="text-text-light">Gerencie os leads do formulário de contato</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Novos</p>
              <p className="text-2xl font-bold text-blue-700">{stats?.new || 0}</p>
            </div>
            <span className="material-symbols-outlined text-blue-400 text-3xl">mark_email_unread</span>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 font-medium">Lidos</p>
              <p className="text-2xl font-bold text-yellow-700">{stats?.read || 0}</p>
            </div>
            <span className="material-symbols-outlined text-yellow-400 text-3xl">drafts</span>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Contatados</p>
              <p className="text-2xl font-bold text-purple-700">{stats?.contacted || 0}</p>
            </div>
            <span className="material-symbols-outlined text-purple-400 text-3xl">phone_in_talk</span>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Concluídos</p>
              <p className="text-2xl font-bold text-green-700">{stats?.completed || 0}</p>
            </div>
            <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-700">{stats?.total || 0}</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-3xl">calendar_month</span>
          </div>
        </div>
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
                placeholder="Buscar por nome, email, empresa ou telefone..."
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
              <option value="new">Novos</option>
              <option value="read">Lidos</option>
              <option value="contacted">Contatados</option>
              <option value="completed">Concluídos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-1 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="card text-center py-12">
              <span className="material-symbols-outlined text-4xl text-text-light mb-4">inbox</span>
              <h3 className="text-lg font-medium mb-2">
                {search || statusFilter !== 'all' 
                  ? 'Nenhum agendamento encontrado' 
                  : 'Nenhum agendamento ainda'}
              </h3>
              <p className="text-text-light">
                {search || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Os leads do formulário aparecerão aqui'}
              </p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => {
                  setSelectedAppointment(apt)
                  // Auto-mark as read when clicking on a new appointment
                  if (apt.status === 'new') {
                    handleStatusChange(apt.id, 'read')
                  }
                }}
                className={`card cursor-pointer transition-all hover:shadow-md ${
                  selectedAppointment?.id === apt.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : ''
                } ${apt.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm truncate flex-1">{apt.fullName}</h3>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(apt.status)}`}>
                    {getStatusText(apt.status)}
                  </span>
                </div>
                <p className="text-xs text-text-light truncate mb-1">{apt.email}</p>
                {apt.company && (
                  <p className="text-xs text-text-light truncate mb-1">{apt.company}</p>
                )}
                <p className="text-xs text-text-light">{formatTimeAgo(apt.createdAt)}</p>
              </div>
            ))
          )}
        </div>

        {/* Appointment Detail */}
        <div className="lg:col-span-2">
          {selectedAppointment ? (
            <div className="card sticky top-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`material-symbols-outlined ${
                      selectedAppointment.status === 'new' ? 'text-blue-500' :
                      selectedAppointment.status === 'read' ? 'text-yellow-500' :
                      selectedAppointment.status === 'contacted' ? 'text-purple-500' :
                      'text-green-500'
                    }`}>
                      {getStatusIcon(selectedAppointment.status)}
                    </span>
                    <h2 className="text-xl font-bold truncate">{selectedAppointment.fullName}</h2>
                  </div>
                  <p className="text-sm text-text-light">
                    Recebido em {formatDate(selectedAppointment.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 hover:bg-background rounded-lg transition-colors lg:hidden"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="material-symbols-outlined text-primary">email</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text-light">Email</p>
                    <a 
                      href={`mailto:${selectedAppointment.email}`}
                      className="text-sm font-medium text-primary hover:underline truncate block"
                    >
                      {selectedAppointment.email}
                    </a>
                  </div>
                </div>
                {selectedAppointment.phone && (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <span className="material-symbols-outlined text-primary">phone</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-light">Telefone</p>
                      <a 
                        href={`tel:${selectedAppointment.phone}`}
                        className="text-sm font-medium text-primary hover:underline truncate block"
                      >
                        {selectedAppointment.phone}
                      </a>
                    </div>
                  </div>
                )}
                {selectedAppointment.company && (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <span className="material-symbols-outlined text-primary">business</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-light">Empresa</p>
                      <p className="text-sm font-medium truncate">{selectedAppointment.company}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message */}
              {selectedAppointment.message && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-text-light mb-2">Mensagem</h3>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedAppointment.message}</p>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-light mb-3">Atualizar Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['new', 'read', 'contacted', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedAppointment.id, status)}
                      disabled={updateMutation.isPending}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedAppointment.status === status
                          ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-current'
                          : 'bg-background hover:bg-gray-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{getStatusIcon(status)}</span>
                      {getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <a
                  href={`mailto:${selectedAppointment.email}`}
                  className="btn btn-primary"
                >
                  <span className="material-symbols-outlined">mail</span>
                  Enviar Email
                </a>
                {selectedAppointment.phone && (
                  <a
                    href={`tel:${selectedAppointment.phone}`}
                    className="btn btn-secondary"
                  >
                    <span className="material-symbols-outlined">call</span>
                    Ligar
                  </a>
                )}
                {selectedAppointment.phone && (
                  <a
                    href={`https://wa.me/${selectedAppointment.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-green-500 hover:bg-green-600 text-white"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    WhatsApp
                  </a>
                )}
                <button
                  onClick={() => setDeleteAppointment(selectedAppointment)}
                  className="btn bg-red-50 hover:bg-red-100 text-red-600 ml-auto"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Excluir
                </button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <span className="material-symbols-outlined text-6xl text-text-light mb-4">contact_mail</span>
              <h3 className="text-lg font-medium mb-2">Selecione um agendamento</h3>
              <p className="text-text-light">
                Clique em um agendamento na lista para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteAppointment !== null}
        onClose={() => setDeleteAppointment(null)}
        onConfirm={handleDelete}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir o agendamento de "${deleteAppointment?.fullName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export default Appointments
