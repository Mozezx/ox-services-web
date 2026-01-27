import { useAuth } from '@clerk/clerk-react'

// Usar caminho relativo para o proxy configurado no Vite
const API_BASE = '/api'

/** URL pública da página da obra para o cliente */
export function getClientWorkPageUrl(token: string): string {
  // Se tiver variável de ambiente configurada, usa ela
  const base = (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (base) return `${base}/obra/${token}`
  
  // Em desenvolvimento (localhost), usa porta 3000
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    return `${window.location.origin.replace(':3001', ':3000')}/obra/${token}`
  }
  
  // Em produção, sempre usa o domínio principal
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
  private getAuthHeader(): HeadersInit {
    // Em desenvolvimento, usar token fixo
    // Em produção, obter do Clerk
    const token = 'test-token' // Para desenvolvimento
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  // Works
  async getWorks(): Promise<Work[]> {
    const response = await fetch(`${API_BASE}/admin/works`, {
      headers: this.getAuthHeader(),
    })
    const data = await response.json()
    return data.works || []
  }

  async getWork(id: string): Promise<Work> {
    const response = await fetch(`${API_BASE}/admin/works/${id}`, {
      headers: this.getAuthHeader(),
    })
    return response.json()
  }

  async createWork(work: Omit<Work, 'id' | 'access_token' | 'created_at'>): Promise<Work> {
    const response = await fetch(`${API_BASE}/admin/works`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(work),
    })
    return response.json()
  }

  async updateWork(id: string, updates: Partial<Work>): Promise<Work> {
    const response = await fetch(`${API_BASE}/admin/works/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(updates),
    })
    return response.json()
  }

  async deleteWork(id: string): Promise<void> {
    await fetch(`${API_BASE}/admin/works/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
  }

  // Timeline
  async getTimelineEntries(workId: string): Promise<TimelineEntry[]> {
    const response = await fetch(`${API_BASE}/admin/works/${workId}/timeline`, {
      headers: this.getAuthHeader(),
    })
    const data = await response.json()
    return data.entries || []
  }

  async uploadTimelineEntry(
    workId: string,
    file: File,
    metadata: {
      title: string
      description: string
      date: string
      type: 'image' | 'video'
    }
  ): Promise<TimelineEntry> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', metadata.title)
    formData.append('description', metadata.description)
    formData.append('date', metadata.date)
    formData.append('type', metadata.type)

    const response = await fetch(`${API_BASE}/admin/works/${workId}/timeline/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer test-token`,
      },
      body: formData,
    })
    return response.json()
  }

  async deleteTimelineEntry(entryId: string): Promise<void> {
    await fetch(`${API_BASE}/admin/timeline/${entryId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
  }

  async updateTimelineEntry(entryId: string, updates: Partial<TimelineEntry>): Promise<TimelineEntry> {
    const response = await fetch(`${API_BASE}/admin/timeline/${entryId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(updates),
    })
    return response.json()
  }

  async reorderTimelineEntries(workId: string, order: string[]): Promise<void> {
    await fetch(`${API_BASE}/admin/works/${workId}/timeline/reorder`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ order }),
    })
  }

  // Appointments
  async getAppointments(status?: string): Promise<Appointment[]> {
    const url = status 
      ? `${API_BASE}/admin/appointments?status=${status}`
      : `${API_BASE}/admin/appointments`
    const response = await fetch(url, {
      headers: this.getAuthHeader(),
    })
    const data = await response.json()
    return data.appointments || []
  }

  async getAppointment(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/admin/appointments/${id}`, {
      headers: this.getAuthHeader(),
    })
    return response.json()
  }

  async getAppointmentsStats(): Promise<AppointmentStats> {
    const response = await fetch(`${API_BASE}/admin/appointments/stats`, {
      headers: this.getAuthHeader(),
    })
    return response.json()
  }

  async updateAppointment(id: string, status: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/admin/appointments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ status }),
    })
    return response.json()
  }

  async deleteAppointment(id: string): Promise<void> {
    await fetch(`${API_BASE}/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    })
  }

  // Push Notifications
  async getVapidPublicKey(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE}/push/vapid-public-key`)
      if (!response.ok) return null
      const data = await response.json()
      return data.publicKey || null
    } catch {
      return null
    }
  }

  async subscribePush(subscription: PushSubscription): Promise<void> {
    const subscriptionJson = subscription.toJSON()
    await fetch(`${API_BASE}/admin/push/subscribe`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({
        endpoint: subscriptionJson.endpoint,
        keys: subscriptionJson.keys,
      }),
    })
  }

  async unsubscribePush(endpoint: string): Promise<void> {
    await fetch(`${API_BASE}/admin/push/unsubscribe`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ endpoint }),
    })
  }

  async testPushNotification(): Promise<void> {
    await fetch(`${API_BASE}/admin/push/test`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    })
  }

  // Upload de imagem de capa
  async uploadCoverImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('cover', file)

    const response = await fetch(`${API_BASE}/admin/upload/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer test-token`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da imagem')
    }

    return response.json()
  }
}

export const api = new AdminAPI()