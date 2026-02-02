import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Tool } from '../lib/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

const backendOrigin =
  (import.meta as { env?: { VITE_API_ORIGIN?: string; DEV?: boolean } }).env?.VITE_API_ORIGIN ??
  ((import.meta as { env?: { DEV?: boolean } }).env?.DEV === true ? 'http://localhost:4000' : '')

function getImageSrc(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (backendOrigin && url.startsWith('/')) return backendOrigin + url
  return url
}

const Tools = () => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Tool | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tool | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formStock, setFormStock] = useState<string>('')
  const [formActive, setFormActive] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const { data: tools = [], isLoading } = useQuery<Tool[]>({
    queryKey: ['tools'],
    queryFn: () => api.getTools(),
  })

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description?: string; image_url?: string; stock_quantity?: number; active?: boolean }) =>
      api.createTool(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      addToast('success', 'Ferramenta criada com sucesso!')
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (err: Error) => {
      addToast('error', err.message || 'Erro ao criar ferramenta.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Tool> }) =>
      api.updateTool(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      addToast('success', 'Ferramenta atualizada com sucesso!')
      setEditing(null)
      resetForm()
    },
    onError: (err: Error) => {
      addToast('error', err.message || 'Erro ao atualizar ferramenta.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      addToast('success', 'Ferramenta removida com sucesso!')
      setDeleteTarget(null)
    },
    onError: () => {
      addToast('error', 'Erro ao remover ferramenta.')
    },
  })

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setFormImageUrl('')
    setFormStock('')
    setFormActive(true)
  }

  const openCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const openEdit = (t: Tool) => {
    setFormName(t.name)
    setFormDescription(t.description || '')
    setFormImageUrl(t.image_url || '')
    setFormStock(t.stock_quantity != null ? String(t.stock_quantity) : '')
    setFormActive(t.active)
    setEditing(t)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Selecione uma imagem (JPG, PNG, etc.)')
      return
    }
    setUploadingImage(true)
    try {
      const { url } = await api.uploadToolImage(file)
      setFormImageUrl(url)
      addToast('success', 'Foto enviada.')
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Erro ao enviar foto.')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      addToast('error', 'Nome é obrigatório.')
      return
    }
    await createMutation.mutateAsync({
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      image_url: formImageUrl.trim() || undefined,
      stock_quantity: formStock.trim() ? parseInt(formStock, 10) : undefined,
      active: formActive,
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    if (!formName.trim()) {
      addToast('error', 'Nome é obrigatório.')
      return
    }
    await updateMutation.mutateAsync({
      id: editing.id,
      body: {
        name: formName.trim(),
        description: formDescription.trim() || null,
        image_url: formImageUrl.trim() || null,
        stock_quantity: formStock.trim() ? parseInt(formStock, 10) : null,
        active: formActive,
      },
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        key="tool-image-input"
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ferramentas</h1>
          <p className="text-white/80">Gerencie o catálogo da loja para técnicos</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <span className="material-symbols-outlined">add</span>
          Nova ferramenta
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            <span className="material-symbols-outlined text-4xl mb-4 block">build</span>
            <p>Nenhuma ferramenta cadastrada.</p>
            <p className="text-sm mt-1">Clique em &quot;Nova ferramenta&quot; para adicionar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-text-light">
                  <th className="pb-3 font-medium">Imagem</th>
                  <th className="pb-3 font-medium">Nome</th>
                  <th className="pb-3 font-medium">Descrição</th>
                  <th className="pb-3 font-medium">Estoque</th>
                  <th className="pb-3 font-medium">Ativa</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-4">
                      {t.image_url ? (
                        <img src={getImageSrc(t.image_url)} alt="" className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-border flex items-center justify-center">
                          <span className="material-symbols-outlined text-text-light">build</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-medium">{t.name}</td>
                    <td className="py-4 text-text-light text-sm max-w-xs truncate">{t.description || '-'}</td>
                    <td className="py-4">{t.stock_quantity != null ? t.stock_quantity : '-'}</td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${t.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {t.active ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
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

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nova ferramenta" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nome *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="input w-full"
              required
              placeholder="Ex: Furadeira"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Descrição</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="input w-full min-h-[80px]"
              placeholder="Descrição opcional"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Foto da ferramenta</label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="btn btn-outline"
              >
                {uploadingImage ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">upload</span>
                )}
                {uploadingImage ? ' A enviar...' : ' Enviar foto'}
              </button>
              {formImageUrl && (
                <div className="flex items-center gap-2">
                  <img src={getImageSrc(formImageUrl)} alt="" className="w-16 h-16 object-cover rounded-lg border border-border" />
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('')}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-text-light mt-1">Ou colar URL da imagem (opcional):</p>
            <input
              type="text"
              value={formImageUrl}
              onChange={(e) => setFormImageUrl(e.target.value)}
              className="input w-full mt-0.5"
              placeholder="https://... ou deixe em branco"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Estoque (opcional)</label>
            <input
              type="number"
              min={0}
              value={formStock}
              onChange={(e) => setFormStock(e.target.value)}
              className="input w-full"
              placeholder="Quantidade"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="create-active"
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="create-active" className="text-sm text-text">Ativa (visível na loja)</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar ferramenta" size="md">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nome *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Descrição</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="input w-full min-h-[80px]"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Foto da ferramenta</label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="btn btn-outline"
              >
                {uploadingImage ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">upload</span>
                )}
                {uploadingImage ? ' A enviar...' : ' Enviar foto'}
              </button>
              {formImageUrl && (
                <div className="flex items-center gap-2">
                  <img src={getImageSrc(formImageUrl)} alt="" className="w-16 h-16 object-cover rounded-lg border border-border" />
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('')}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-text-light mt-1">Ou colar URL da imagem (opcional):</p>
            <input
              type="text"
              value={formImageUrl}
              onChange={(e) => setFormImageUrl(e.target.value)}
              className="input w-full mt-0.5"
              placeholder="https://... ou deixe em branco"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Estoque</label>
            <input
              type="number"
              min={0}
              value={formStock}
              onChange={(e) => setFormStock(e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-active"
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="edit-active" className="text-sm text-text">Ativa (visível na loja)</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">Cancelar</button>
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
        title="Excluir ferramenta"
        message={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.name}"?` : ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export default Tools
