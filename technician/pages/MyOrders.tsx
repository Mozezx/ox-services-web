import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLanguage } from '../context/LanguageContext'
import Modal from '../components/Modal'

const MyOrders = () => {
  const { t } = useLanguage()
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['technician-orders'],
    queryFn: () => api.getMyOrders(),
  })

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['technician-order', detailId],
    queryFn: () => (detailId ? api.getOrder(detailId) : Promise.resolve(null)),
    enabled: !!detailId,
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
      case 'pending': return t.orders.pending
      case 'approved': return t.orders.approved
      case 'rejected': return t.orders.rejected
      default: return status
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.orders.title}</h1>
        <p className="text-white/80">{t.orders.noOrders}</p>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            <span className="material-symbols-outlined text-4xl mb-4 block">receipt_long</span>
            <p>{t.orders.noOrders}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-text-light">
                  <th className="pb-3 font-medium">{t.orders.requestedAt}</th>
                  <th className="pb-3 font-medium">{t.orders.status}</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-4 text-sm">{formatDate(o.created_at)}</td>
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
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!detailId} onClose={() => setDetailId(null)} title="Order detail" size="lg">
        {detailId && (
          <>
            {loadingDetail || !detail ? (
              <div className="flex justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-light">
                  {t.orders.requestedAt}: {formatDate(detail.order.created_at)}
                </p>
                <p className="text-sm">
                  <span className="text-text-light">{t.orders.status}: </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(detail.order.status)}`}>
                    {getStatusText(detail.order.status)}
                  </span>
                </p>
                {detail.order.notes && (
                  <p className="text-sm text-text-light">Notes: {detail.order.notes}</p>
                )}
                <div>
                  <p className="text-sm font-medium text-text mb-2">Items</p>
                  <ul className="border border-border rounded-lg divide-y divide-border">
                    {detail.items.map((item) => (
                      <li key={item.id} className="flex justify-between items-center px-4 py-3">
                        <span>{item.tool_name}</span>
                        <span className="font-medium">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}

export default MyOrders
