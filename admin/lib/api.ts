const API_BASE = '/api'
// Em desenvolvimento, upload de foto de ferramenta vai direto ao backend (evita 404 do proxy).
const BACKEND_ORIGIN =
  (import.meta as { env?: { DEV?: boolean; VITE_API_ORIGIN?: string } }).env?.VITE_API_ORIGIN ??
  ((import.meta as { env?: { DEV?: boolean } }).env?.DEV === true ? 'http://localhost:4000' : '')
const TOKEN_KEY = 'admin_token'

/** Resolve URL de mídia/imagem: URLs relativas (/uploads/...) são prefixadas com a origem do backend para carregar no admin. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (BACKEND_ORIGIN && url.startsWith('/')) return BACKEND_ORIGIN + url
  return url
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function clearTokenAndRedirect(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  window.location.href = '/login'
}

async function adminFetch(
  url: string,
  opts: RequestInit & { skipAuth?: boolean } = {}
): Promise<Response> {
  const { skipAuth, ...rest } = opts
  const headers = new Headers(rest.headers as HeadersInit)
  if (!skipAuth) {
    const t = getToken()
    if (t) headers.set('Authorization', `Bearer ${t}`)
  }
  if (!headers.has('Content-Type') && rest.body && typeof rest.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(url, { ...rest, headers })
  if (res.status === 401 && url.indexOf('/auth/login') === -1) {
    clearTokenAndRedirect()
    throw new Error('Sessão expirada')
  }
  return res
}

function uploadTimelineEntryWithProgress(
  workId: string,
  file: File,
  metadata: { title: string; description: string; date: string; type: 'image' | 'video' },
  onProgress: (pct: number) => void
): Promise<TimelineEntry> {
  const form = new FormData()
  form.append('file', file)
  form.append('title', metadata.title)
  form.append('description', metadata.description)
  form.append('date', metadata.date)
  form.append('type', metadata.type)
  const token = getToken()
  const url = `${API_BASE}/admin/works/${workId}/timeline/upload`
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.onload = () => {
      if (xhr.status === 401) {
        clearTokenAndRedirect()
        reject(new Error('Sessão expirada'))
        return
      }
      if (xhr.status === 413) {
        reject(new Error('Arquivo muito grande. Imagens: máx 20 MB; vídeos: máx 300 MB.'))
        return
      }
      try {
        const data = JSON.parse(xhr.responseText || '{}')
        if (xhr.status >= 200 && xhr.status < 300) resolve(data as TimelineEntry)
        else reject(new Error(data.error || `Erro ${xhr.status}`))
      } catch {
        reject(new Error('Resposta inválida'))
      }
    }
    xhr.onerror = () => reject(new Error('Erro de rede'))
    xhr.send(form)
  })
}

/** URL pública da página da obra para o cliente */
export function getClientWorkPageUrl(token: string): string {
  const base = (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (base) return `${base}/obra/${token}`
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    return `${window.location.origin.replace(':3001', ':3000')}/obra/${token}`
  }
  return `https://oxservices.org/obra/${token}`
}

export interface Work {
  id: string
  name: string
  description: string
  client_name: string
  client_email: string
  start_date: string
  end_date: string
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold'
  cover_image_url: string
  access_token: string
  created_at: string
}

export interface TimelineEntry {
  id: string
  work_id: string
  type: 'image' | 'video'
  media_url: string
  thumbnail_url: string | null
  title: string
  description: string
  date: string
  order: number
}

export interface Appointment {
  id: string
  fullName: string
  company: string | null
  email: string
  phone: string | null
  message: string | null
  status: 'new' | 'read' | 'contacted' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface AppointmentStats {
  total: number
  new: number
  read: number
  contacted: number
  completed: number
}

export interface Technician {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export interface TechnicianInventoryItem {
  technician_id: string
  technician_name: string
  tools: Array<{ tool_id: string; tool_name: string; quantity: number }>
  total_items: number
}

export interface WorkAssignment {
  id: string
  work_id: string
  technician_id: string
  assigned_at: string
  email: string
  full_name: string | null
}

export interface Tool {
  id: string
  name: string
  description: string | null
  image_url: string | null
  stock_quantity: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface ToolOrderItem {
  id: string
  tool_id: string
  tool_name: string
  tool_description: string | null
  quantity: number
}

export interface ToolOrder {
  id: string
  technician_id: string
  technician_name?: string
  technician_email?: string
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
}

class AdminAPI {
  private authHeaders(): HeadersInit {
    const t = getToken()
    const h: Record<string, string> = {}
    if (t) h['Authorization'] = `Bearer ${t}`
    h['Content-Type'] = 'application/json'
    return h
  }

  async getWorks(): Promise<Work[]> {
    const r = await adminFetch(`${API_BASE}/admin/works`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.works || []
  }

  async getWork(id: string): Promise<Work> {
    const r = await adminFetch(`${API_BASE}/admin/works/${id}`, { headers: this.authHeaders() })
    return r.json()
  }

  async createWork(work: Omit<Work, 'id' | 'access_token' | 'created_at'>): Promise<Work> {
    const r = await adminFetch(`${API_BASE}/admin/works`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(work),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || `Erro ${r.status}`)
    }
    return r.json()
  }

  async updateWork(id: string, updates: Partial<Work>): Promise<Work> {
    const r = await adminFetch(`${API_BASE}/admin/works/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify(updates),
    })
    return r.json()
  }

  async deleteWork(id: string): Promise<void> {
    await adminFetch(`${API_BASE}/admin/works/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    })
  }

  async getTimelineEntries(workId: string): Promise<TimelineEntry[]> {
    const r = await adminFetch(`${API_BASE}/admin/works/${workId}/timeline`, {
      headers: this.authHeaders(),
    })
    const data = await r.json()
    return data.entries || []
  }

  async uploadTimelineEntry(
    workId: string,
    file: File,
    metadata: { title: string; description: string; date: string; type: 'image' | 'video' }
  ): Promise<TimelineEntry> {
    return uploadTimelineEntryWithProgress(workId, file, metadata, () => {})
  }

  uploadTimelineEntryWithProgress(
    workId: string,
    file: File,
    metadata: { title: string; description: string; date: string; type: 'image' | 'video' },
    onProgress: (pct: number) => void
  ): Promise<TimelineEntry> {
    return uploadTimelineEntryWithProgress(workId, file, metadata, onProgress)
  }

  async deleteTimelineEntry(entryId: string): Promise<void> {
    await adminFetch(`${API_BASE}/admin/timeline/${entryId}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    })
  }

  async updateTimelineEntry(
    entryId: string,
    updates: Partial<TimelineEntry>
  ): Promise<TimelineEntry> {
    const r = await adminFetch(`${API_BASE}/admin/timeline/${entryId}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify(updates),
    })
    return r.json()
  }

  async reorderTimelineEntries(workId: string, order: string[]): Promise<void> {
    await adminFetch(`${API_BASE}/admin/works/${workId}/timeline/reorder`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify({ order }),
    })
  }

  async getAppointments(status?: string): Promise<Appointment[]> {
    const url = status
      ? `${API_BASE}/admin/appointments?status=${status}`
      : `${API_BASE}/admin/appointments`
    const r = await adminFetch(url, { headers: this.authHeaders() })
    const data = await r.json()
    return data.appointments || []
  }

  async getAppointment(id: string): Promise<Appointment> {
    const r = await adminFetch(`${API_BASE}/admin/appointments/${id}`, {
      headers: this.authHeaders(),
    })
    return r.json()
  }

  async getAppointmentsStats(): Promise<AppointmentStats> {
    const r = await adminFetch(`${API_BASE}/admin/appointments/stats`, {
      headers: this.authHeaders(),
    })
    return r.json()
  }

  async updateAppointment(id: string, status: string): Promise<Appointment> {
    const r = await adminFetch(`${API_BASE}/admin/appointments/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify({ status }),
    })
    return r.json()
  }

  async deleteAppointment(id: string): Promise<void> {
    await adminFetch(`${API_BASE}/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    })
  }

  async getVapidPublicKey(): Promise<string | null> {
    try {
      const r = await fetch(`${API_BASE}/push/vapid-public-key`)
      if (!r.ok) return null
      const d = await r.json()
      return d.publicKey || null
    } catch {
      return null
    }
  }

  async subscribePush(subscription: PushSubscription): Promise<void> {
    const j = subscription.toJSON()
    await adminFetch(`${API_BASE}/admin/push/subscribe`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ endpoint: j.endpoint, keys: j.keys }),
    })
  }

  async unsubscribePush(endpoint: string): Promise<void> {
    await adminFetch(`${API_BASE}/admin/push/unsubscribe`, {
      method: 'DELETE',
      headers: this.authHeaders(),
      body: JSON.stringify({ endpoint }),
    })
  }

  async testPushNotification(): Promise<void> {
    await adminFetch(`${API_BASE}/admin/push/test`, {
      method: 'POST',
      headers: this.authHeaders(),
    })
  }

  async uploadCoverImage(file: File): Promise<{ url: string }> {
    const form = new FormData()
    form.append('cover', file)
    const headers: Record<string, string> = {}
    const t = getToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
    const r = await adminFetch(`${API_BASE}/admin/upload/cover`, {
      method: 'POST',
      headers,
      body: form,
    })
    if (!r.ok) throw new Error('Erro ao fazer upload da imagem')
    return r.json()
  }

  async uploadToolImage(file: File): Promise<{ url: string }> {
    const form = new FormData()
    form.append('image', file)
    const headers: Record<string, string> = {}
    const t = getToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
    // Em dev usa o backend direto (BACKEND_ORIGIN) para evitar 404 do proxy
    const uploadUrl = BACKEND_ORIGIN
      ? `${BACKEND_ORIGIN.replace(/\/$/, '')}/admin/upload/tool-image`
      : `${API_BASE}/admin/upload/tool-image`
    const r = await fetch(uploadUrl, {
      method: 'POST',
      headers,
      body: form,
    })
    if (r.status === 401) {
      clearTokenAndRedirect()
      throw new Error('Sessão expirada')
    }
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || 'Erro ao fazer upload da foto')
    }
    return r.json()
  }

  // Technicians
  async getTechnicians(): Promise<Technician[]> {
    const r = await adminFetch(`${API_BASE}/admin/technicians`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.technicians || []
  }

  async getTechnicianInventory(): Promise<TechnicianInventoryItem[]> {
    const r = await adminFetch(`${API_BASE}/admin/technicians/inventory`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.technicians || []
  }

  async recordToolReturn(body: { technician_id: string; tool_id: string; quantity: number; notes?: string }): Promise<void> {
    const r = await adminFetch(`${API_BASE}/admin/tool-returns`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || 'Erro ao registar devolução')
    }
  }

  async createTechnician(body: { email: string; password: string; full_name?: string }): Promise<Technician> {
    const r = await adminFetch(`${API_BASE}/admin/technicians`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || 'Erro ao criar técnico')
    }
    return r.json()
  }

  async getTechnician(id: string): Promise<Technician> {
    const r = await adminFetch(`${API_BASE}/admin/technicians/${id}`, { headers: this.authHeaders() })
    return r.json()
  }

  async updateTechnician(id: string, body: { email?: string; full_name?: string; password?: string }): Promise<Technician> {
    const r = await adminFetch(`${API_BASE}/admin/technicians/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    })
    return r.json()
  }

  async deleteTechnician(id: string): Promise<void> {
    await adminFetch(`${API_BASE}/admin/technicians/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    })
  }

  // Work assignments
  async getWorkAssignments(workId: string): Promise<WorkAssignment[]> {
    const r = await adminFetch(`${API_BASE}/admin/works/${workId}/assignments`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.assignments || []
  }

  async addWorkAssignment(workId: string, technicianId: string): Promise<WorkAssignment> {
    const r = await adminFetch(`${API_BASE}/admin/works/${workId}/assignments`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ technician_id: technicianId }),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || 'Erro ao atribuir')
    }
    return r.json()
  }

  async removeWorkAssignment(workId: string, technicianId: string): Promise<void> {
    await adminFetch(`${API_BASE}/admin/works/${workId}/assignments/${technicianId}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    })
  }

  // Tools
  async getTools(active?: boolean): Promise<Tool[]> {
    const q = active !== undefined ? `?active=${active}` : ''
    const r = await adminFetch(`${API_BASE}/admin/tools${q}`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.tools || []
  }

  async createTool(body: { name: string; description?: string; image_url?: string; stock_quantity?: number; active?: boolean }): Promise<Tool> {
    const r = await adminFetch(`${API_BASE}/admin/tools`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || 'Erro ao criar ferramenta')
    }
    return r.json()
  }

  async getTool(id: string): Promise<Tool> {
    const r = await adminFetch(`${API_BASE}/admin/tools/${id}`, { headers: this.authHeaders() })
    return r.json()
  }

  async updateTool(id: string, body: Partial<Tool>): Promise<Tool> {
    const r = await adminFetch(`${API_BASE}/admin/tools/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    })
    return r.json()
  }

  async deleteTool(id: string): Promise<void> {
    await adminFetch(`${API_BASE}/admin/tools/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    })
  }

  // Tool orders
  async getToolOrders(params?: { status?: string; technician_id?: string }): Promise<ToolOrder[]> {
    const search = new URLSearchParams()
    if (params?.status && params.status !== 'all') search.set('status', params.status)
    if (params?.technician_id) search.set('technician_id', params.technician_id)
    const q = search.toString() ? `?${search.toString()}` : ''
    const r = await adminFetch(`${API_BASE}/admin/tool-orders${q}`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.orders || []
  }

  async getToolOrder(id: string): Promise<{ order: ToolOrder & { technician_name?: string; technician_email?: string }; items: ToolOrderItem[] }> {
    const r = await adminFetch(`${API_BASE}/admin/tool-orders/${id}`, { headers: this.authHeaders() })
    return r.json()
  }

  async updateToolOrderStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<ToolOrder> {
    const r = await adminFetch(`${API_BASE}/admin/tool-orders/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify({ status }),
    })
    return r.json()
  }
}

export const api = new AdminAPI()
