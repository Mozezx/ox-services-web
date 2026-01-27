import { useAuth } from '@clerk/clerk-react'

// Usar caminho relativo para o proxy configurado no Vite
const API_BASE = '/api'

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
}

export const api = new AdminAPI()