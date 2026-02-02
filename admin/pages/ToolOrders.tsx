import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ToolOrder, ToolOrderItem } from '../lib/api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const ToolOrders = () => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data: orders = [], isLoading } = useQuery<ToolOrder[]>({
    queryKey: ['tool-orders', statusFilter],
    queryFn: () => api.getToolOrders(statusFilter !== 'all' ? { status: statusFilter } : undefined),
  })

  const { data: detail, isLoading: isLoadingDetail } = useQuery<{
    order: ToolOrder & { technician_name?: string; technician_email?: string }
    items: ToolOrderItem[]
  } | null>({
    queryKey: ['tool-order', detailId],
    queryFn: () => (detailId ? api.getToolOrder(detailId) : Promise.resolve(null)),
    enabled: !!detailId,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'approved' | 'rejected' }) =>
      api.updateToolOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-orders'] })
      queryClient.invalidateQueries({ queryKey: ['tool-order', detailId] })
      addToast('success', 'Status atualizado!')
      setDetailId(null)
    },
    onError: () => {
      addToast('error', 'Erro ao atualizar status.')
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'approved': return 'Aprovado'
      case 'rejected': return 'Rejeitado'
      default: return status
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos de ferramentas</h1>
          <p className="text-white/80">Solicitações dos técnicos</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            <span className="material-symbols-outlined text-4xl mb-4 block">shopping_cart</span>
            <p>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-text-light">
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Técnico</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-4 text-sm">{formatDate(o.created_at)}</td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium">{o.technician_name || o.technician_email || '-'}</p>
                        {o.technician_email && (
                          <p className="text-xs text-text-light">{o.technician_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(o.status)}`}>
                        {getStatusText(o.status)}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailId(o.id)}
                        className="btn btn-outline text-sm"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        title="Detalhe do pedido"
        size="lg"
      >
        {detailId && (
          <>
            {isLoadingDetail || !detail ? (
              <div className="flex justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-light">Técnico</p>
                    <p className="font-medium">{detail.order.technician_name || '-'}</p>
                    <p className="text-sm text-text-light">{detail.order.technician_email || ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Data</p>
                    <p className="font-medium">{formatDate(detail.order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Status</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(detail.order.status)}`}>
                      {getStatusText(detail.order.status)}
                    </span>
                  </div>
                </div>
                {detail.order.notes && (
                  <div>
                    <p className="text-sm text-text-light mb-1">Observações</p>
                    <p className="text-text">{detail.order.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-text-light mb-2">Itens</p>
                  <ul className="border border-border rounded-lg divide-y divide-border">
                    {detail.items.map((item) => (
                      <li key={item.id} className="flex justify-between items-center px-4 py-3">
                        <div>
                          <p className="font-medium">{item.tool_name}</p>
                          {item.tool_description && (
                            <p className="text-xs text-text-light">{item.tool_description}</p>
                          )}
                        </div>
                        <span className="font-medium">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {detail.order.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutateAsync({ id: detail.order.id, status: 'approved' })}
                      className="btn btn-primary"
                      disabled={updateStatusMutation.isPending}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutateAsync({ id: detail.order.id, status: 'rejected' })}
                      className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50"
                      disabled={updateStatusMutation.isPending}
                    >
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}

export default ToolOrders
