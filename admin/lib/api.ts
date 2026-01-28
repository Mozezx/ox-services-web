const API_BASE = '/api'
const TOKEN_KEY = 'admin_token'

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
    const form = new FormData()
    form.append('file', file)
    form.append('title', metadata.title)
    form.append('description', metadata.description)
    form.append('date', metadata.date)
    form.append('type', metadata.type)
    const headers: Record<string, string> = {}
    const t = getToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
    const r = await adminFetch(`${API_BASE}/admin/works/${workId}/timeline/upload`, {
      method: 'POST',
      headers,
      body: form,
    })
    return r.json()
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
}

export const api = new AdminAPI()
