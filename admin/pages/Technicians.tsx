import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Technician, TechnicianInventoryItem, Work } from '../lib/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

const Technicians = () => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Technician | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Technician | null>(null)
  const [toolsModalTechnician, setToolsModalTechnician] = useState<Technician | null>(null)
  const [returnForm, setReturnForm] = useState<{
    technician_id: string
    tool_id: string
    tool_name: string
    maxQuantity: number
  } | null>(null)
  const [returnQtyStr, setReturnQtyStr] = useState('1')
  const [returnNotes, setReturnNotes] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formName, setFormName] = useState('')

  const { data: technicians = [], isLoading } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: () => api.getTechnicians(),
  })

  const { data: inventory = [] } = useQuery<TechnicianInventoryItem[]>({
    queryKey: ['technician-inventory'],
    queryFn: () => api.getTechnicianInventory(),
  })

  const { data: technicianAssignments = [] } = useQuery<{ work_id: string; work_name: string }[]>({
    queryKey: ['technician-assignments', worksModalTechnician?.id],
    queryFn: () => api.getTechnicianAssignments(worksModalTechnician!.id),
    enabled: !!worksModalTechnician?.id,
  })

  const { data: works = [] } = useQuery<Work[]>({
    queryKey: ['works'],
    queryFn: () => api.getWorks(),
    enabled: !!worksModalTechnician?.id,
  })

  const createMutation = useMutation({
    mutationFn: (body: { email: string; password: string; full_name?: string }) =>
      api.createTechnician(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] })
      addToast('success', 'Técnico criado com sucesso!')
      setIsCreateOpen(false)
      setFormEmail('')
      setFormPassword('')
      setFormName('')
    },
    onError: (err: Error) => {
      addToast('error', err.message || 'Erro ao criar técnico.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { email?: string; full_name?: string; password?: string } }) =>
      api.updateTechnician(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] })
      addToast('success', 'Técnico atualizado com sucesso!')
      setEditing(null)
      setFormEmail('')
      setFormPassword('')
      setFormName('')
    },
    onError: (err: Error) => {
      addToast('error', err.message || 'Erro ao atualizar técnico.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTechnician(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] })
      addToast('success', 'Técnico removido com sucesso!')
      setDeleteTarget(null)
    },
    onError: () => {
      addToast('error', 'Erro ao remover técnico.')
    },
  })

  const returnMutation = useMutation({
    mutationFn: (body: { technician_id: string; tool_id: string; quantity: number; notes?: string }) =>
      api.recordToolReturn(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-inventory'] })
      addToast('success', 'Devolução registada. A ferramenta foi descontada do técnico.')
      setReturnForm(null)
      setReturnQtyStr('1')
      setReturnNotes('')
    },
    onError: (err: Error) => {
      addToast('error', err.message || 'Erro ao registar devolução.')
    },
  })

  const bulkReturnMutation = useMutation({
    mutationFn: (body: { technician_id: string; notes?: string }) => api.recordToolReturnBulk(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['technician-inventory'] })
      addToast('success', data.message || 'Devolução registada.')
      setToolsModalTechnician(null)
    },
    onError: (err: Error) => {
      addToast('error', err.message || 'Erro ao registar devolução.')
    },
  })

  const addAssignmentMutation = useMutation({
    mutationFn: ({ workId, technicianId }: { workId: string; technicianId: string }) =>
      api.addWorkAssignment(workId, technicianId),
    onSuccess: (_, { workId }) => {
      queryClient.invalidateQueries({ queryKey: ['technician-assignments', worksModalTechnician?.id] })
      queryClient.invalidateQueries({ queryKey: ['work-assignments', workId] })
      addToast('success', 'Obra atribuída com sucesso!')
      setAssignWorkId('')
    },
    onError: (err: Error) => {
      addToast('error', err.message || 'Erro ao atribuir obra.')
    },
  })

  const openCreate = () => {
    setFormEmail('')
    setFormPassword('')
    setFormName('')
    setIsCreateOpen(true)
  }

  const openEdit = (t: Technician) => {
    setFormEmail(t.email)
    setFormPassword('')
    setFormName(t.full_name || '')
    setEditing(t)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formEmail.trim() || !formPassword.trim()) {
      addToast('error', 'E-mail e senha são obrigatórios.')
      return
    }
    await createMutation.mutateAsync({
      email: formEmail.trim(),
      password: formPassword,
      full_name: formName.trim() || undefined,
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const body: { email?: string; full_name?: string; password?: string } = {
      email: formEmail.trim(),
      full_name: formName.trim() || undefined,
    }
    if (formPassword.trim()) body.password = formPassword
    await updateMutation.mutateAsync({ id: editing.id, body })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Técnicos</h1>
          <p className="text-white/80">Crie e gerencie contas de técnicos</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <span className="material-symbols-outlined">person_add</span>
          Criar técnico
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            <span className="material-symbols-outlined text-4xl mb-4 block">engineering</span>
            <p>Nenhum técnico cadastrado.</p>
            <p className="text-sm mt-1">Clique em &quot;Criar técnico&quot; para adicionar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-text-light">
                  <th className="pb-3 font-medium">Nome</th>
                  <th className="pb-3 font-medium">Criado em</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-4 font-medium">{t.full_name || '-'}</td>
                    <td className="py-4 text-text-light text-sm">
                      {new Date(t.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setWorksModalTechnician(t)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        title="Obras atribuídas"
                      >
                        <span className="material-symbols-outlined text-text-light">construction</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setToolsModalTechnician(t)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        title="Ver ferramentas"
                      >
                        <span className="material-symbols-outlined text-text-light">build</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-text-light">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(t)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: ferramentas do técnico */}
      <Modal
        isOpen={!!toolsModalTechnician}
        onClose={() => {
          setToolsModalTechnician(null)
          setReturnForm(null)
        }}
        title={
          returnForm
            ? `Marcar como devolvido`
            : toolsModalTechnician
              ? `Ferramentas de ${toolsModalTechnician.full_name || 'Técnico'}`
              : ''
        }
        size="md"
      >
        {toolsModalTechnician &&
          (returnForm ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = Math.min(Math.max(1, parseInt(returnQtyStr, 10) || 1), returnForm.maxQuantity)
                returnMutation.mutate({
                  technician_id: returnForm.technician_id,
                  tool_id: returnForm.tool_id,
                  quantity: q,
                  notes: returnNotes.trim() || undefined,
                })
              }}
              className="space-y-4"
            >
              <p className="text-text-light">
                Ferramenta: <strong>{returnForm.tool_name}</strong> (máx. {returnForm.maxQuantity} un.)
              </p>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Quantidade a devolver *</label>
                <input
                  type="number"
                  min={1}
                  max={returnForm.maxQuantity}
                  step={1}
                  value={returnQtyStr}
                  onChange={(e) => setReturnQtyStr(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="input w-full"
                  placeholder="Ex: ferramenta em bom estado"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReturnForm(null)} className="btn btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={returnMutation.isPending}>
                  {returnMutation.isPending ? 'A registar...' : 'Marcar como devolvido'}
                </button>
              </div>
            </form>
          ) : (() => {
            const inv = inventory.find((i) => i.technician_id === toolsModalTechnician.id)
            const tools = inv?.tools ?? []
            const total = inv?.total_items ?? 0
            return (
              <div className="space-y-4">
                {tools.length === 0 ? (
                  <p className="text-text-light">Este técnico ainda não possui ferramentas (nenhum pedido aprovado).</p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-text-light">Total: {total} item(ns). Marque como devolvido quando o técnico devolver.</p>
                      <button
                        type="button"
                        onClick={() => bulkReturnMutation.mutate({ technician_id: toolsModalTechnician.id })}
                        disabled={bulkReturnMutation.isPending}
                        className="text-sm btn btn-primary py-1.5 px-2"
                      >
                        <span className="material-symbols-outlined text-sm align-middle mr-1">reply_all</span>
                        {bulkReturnMutation.isPending ? 'A registar...' : 'Devolver tudo'}
                      </button>
                    </div>
                    <ul className="list-none space-y-2">
                      {tools.map((item) => (
                        <li key={item.tool_id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <span>{item.tool_name}</span>
                          <span className="flex items-center gap-2">
                            <span className="font-medium text-primary">× {item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setReturnForm({
                                  technician_id: toolsModalTechnician.id,
                                  tool_id: item.tool_id,
                                  tool_name: item.tool_name,
                                  maxQuantity: item.quantity,
                                })
                                setReturnQtyStr(String(item.quantity))
                                setReturnNotes('')
                              }}
                              className="text-sm btn btn-outline py-1 px-2"
                            >
                              Devolver
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setToolsModalTechnician(null)}
                    className="btn btn-outline"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )
          })())}
      </Modal>

      {/* Modal: obras do técnico */}
      <Modal
        isOpen={!!worksModalTechnician}
        onClose={() => {
          setWorksModalTechnician(null)
          setAssignWorkId('')
        }}
        title={worksModalTechnician ? `Obras de ${worksModalTechnician.full_name || 'Técnico'}` : ''}
        size="md"
      >
        {worksModalTechnician && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text mb-2">Obras atribuídas</h3>
              {technicianAssignments.length === 0 ? (
                <p className="text-sm text-text-light">Nenhuma obra atribuída.</p>
              ) : (
                <ul className="list-none space-y-1">
                  {technicianAssignments.map((a) => (
                    <li key={a.work_id} className="text-sm text-text flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">construction</span>
                      {a.work_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-text mb-2">Atribuir obra</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (assignWorkId) {
                    addAssignmentMutation.mutate({
                      workId: assignWorkId,
                      technicianId: worksModalTechnician.id,
                    })
                  }
                }}
                className="flex flex-wrap gap-2 items-end"
              >
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-text-light mb-1">Obra</label>
                  <select
                    value={assignWorkId}
                    onChange={(e) => setAssignWorkId(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Selecione uma obra</option>
                    {works
                      .filter((w) => !technicianAssignments.some((a) => a.work_id === w.id))
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!assignWorkId || addAssignmentMutation.isPending}
                  className="btn btn-primary"
                >
                  {addAssignmentMutation.isPending ? 'A atribuir...' : 'Atribuir'}
                </button>
              </form>
              {works.length > 0 && works.filter((w) => !technicianAssignments.some((a) => a.work_id === w.id)).length === 0 && (
                <p className="text-xs text-text-light mt-2">Todas as obras já estão atribuídas a este técnico.</p>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setWorksModalTechnician(null)}
                className="btn btn-outline"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Criar técnico" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">E-mail *</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="input w-full"
              required
              placeholder="tecnico@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Senha *</label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className="input w-full"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nome completo</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="input w-full"
              placeholder="Nome do técnico"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar técnico" size="md">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">E-mail *</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nova senha (deixe em branco para manter)</label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className="input w-full"
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nome completo</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutateAsync(deleteTarget.id)}
        title="Excluir técnico"
        message={deleteTarget ? `Tem certeza que deseja excluir o técnico "${deleteTarget.full_name || deleteTarget.email}"? As atribuições e pedidos associados também serão afetados.` : ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export default Technicians
