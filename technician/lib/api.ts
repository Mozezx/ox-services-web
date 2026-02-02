const API_BASE = '/api'
const TOKEN_KEY = 'technician_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function clearTokenAndRedirect(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  window.location.href = '/login'
}

async function technicianFetch(url: string, opts: RequestInit & { skipAuth?: boolean } = {}): Promise<Response> {
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
    throw new Error('Session expired')
  }
  return res
}

export interface TechnicianWork {
  id: string
  name: string
  description: string | null
  client_name: string | null
  client_email: string | null
  start_date: string | null
  end_date: string | null
  status: string
  cover_image_url: string | null
  access_token: string
}

export interface TechnicianTimelineEntry {
  id: string
  work_id: string
  type: string
  media_url: string
  thumbnail_url: string | null
  title: string
  description: string
  date: string
  order: number
}

export interface TechnicianTool {
  id: string
  name: string
  description: string | null
  image_url: string | null
  stock_quantity: number | null
  active: boolean
}

export interface TechnicianToolOrder {
  id: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TechnicianToolOrderDetail {
  order: TechnicianToolOrder
  items: { id: string; tool_id: string; tool_name: string; tool_description: string | null; quantity: number }[]
}

class TechnicianAPI {
  private authHeaders(): HeadersInit {
    const t = getToken()
    const h: Record<string, string> = {}
    if (t) h['Authorization'] = `Bearer ${t}`
    h['Content-Type'] = 'application/json'
    return h
  }

  async getMyWorks(): Promise<TechnicianWork[]> {
    const r = await technicianFetch(`${API_BASE}/technician/works`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.works || []
  }

  async getWork(id: string): Promise<{ work: TechnicianWork; timeline: TechnicianTimelineEntry[] }> {
    const r = await technicianFetch(`${API_BASE}/technician/works/${id}`, { headers: this.authHeaders() })
    const data = await r.json()
    return { work: data.work, timeline: data.timeline || [] }
  }

  async uploadPhoto(
    workId: string,
    file: File,
    metadata: { title: string; description: string; date: string; type: 'image' | 'video' }
  ): Promise<TechnicianTimelineEntry> {
    const form = new FormData()
    form.append('file', file)
    form.append('title', metadata.title)
    form.append('description', metadata.description)
    form.append('date', metadata.date)
    form.append('type', metadata.type)
    const t = getToken()
    const headers: Record<string, string> = {}
    if (t) headers['Authorization'] = `Bearer ${t}`
    const r = await technicianFetch(`${API_BASE}/technician/works/${workId}/timeline/upload`, {
      method: 'POST',
      headers,
      body: form,
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || `Upload failed ${r.status}`)
    }
    const data = await r.json()
    return data.entry
  }

  async getTools(): Promise<TechnicianTool[]> {
    const r = await technicianFetch(`${API_BASE}/technician/tools`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.tools || []
  }

  async createToolOrder(items: { tool_id: string; quantity: number }[], notes?: string): Promise<{ order: { id: string; status: string; created_at: string } }> {
    const r = await technicianFetch(`${API_BASE}/technician/tool-orders`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ items, notes: notes || null }),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error || 'Failed to create order')
    }
    return r.json()
  }

  async getMyOrders(): Promise<TechnicianToolOrder[]> {
    const r = await technicianFetch(`${API_BASE}/technician/tool-orders`, { headers: this.authHeaders() })
    const data = await r.json()
    return data.orders || []
  }

  async getOrder(id: string): Promise<TechnicianToolOrderDetail> {
    const r = await technicianFetch(`${API_BASE}/technician/tool-orders/${id}`, { headers: this.authHeaders() })
    return r.json()
  }
}

export const api = new TechnicianAPI()
