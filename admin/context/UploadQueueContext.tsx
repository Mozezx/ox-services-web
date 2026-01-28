import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '../components/Toast'
import { api } from '../lib/api'

export type UploadJobStatus = 'pending' | 'uploading' | 'done' | 'error'

export interface UploadJob {
  id: string
  workId: string
  workName?: string
  file: File
  title: string
  description: string
  date: string
  type: 'image' | 'video'
  progress: number
  status: UploadJobStatus
  error?: string
}

type UploadQueueContextValue = {
  jobs: UploadJob[]
  addJobs: (
    workId: string,
    workName: string | undefined,
    files: File[],
    meta: { title: string; description: string; date: string }
  ) => void
  removeJob: (id: string) => void
  clearDone: () => void
}

const UploadQueueContext = createContext<UploadQueueContextValue | null>(null)

export function useUploadQueue() {
  const ctx = useContext(UploadQueueContext)
  if (!ctx) throw new Error('useUploadQueue must be used within UploadQueueProvider')
  return ctx
}

function nextId() {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function UploadQueueProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<UploadJob[]>([])
  const processing = useRef(false)
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const addJobs = useCallback(
    (
      workId: string,
      workName: string | undefined,
      files: File[],
      meta: { title: string; description: string; date: string }
    ) => {
      const newJobs: UploadJob[] = files.map((file, i) => ({
        id: nextId(),
        workId,
        workName,
        file,
        title: files.length === 1 ? meta.title : `${meta.title} (${i + 1}/${files.length})`,
        description: meta.description,
        date: meta.date,
        type: file.type.startsWith('video') ? 'video' : 'image',
        progress: 0,
        status: 'pending',
      }))
      setJobs((prev) => [...prev, ...newJobs])
    },
    []
  )

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  const clearDone = useCallback(() => {
    setJobs((prev) => prev.filter((j) => j.status !== 'done' && j.status !== 'error'))
  }, [])

  const updateJob = useCallback((id: string, updates: Partial<UploadJob>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
    )
  }, [])

  useEffect(() => {
    if (processing.current) return
    const pending = jobs.find((j) => j.status === 'pending')
    if (!pending) return

    processing.current = true
    updateJob(pending.id, { status: 'uploading', progress: 0 })

    api
      .uploadTimelineEntryWithProgress(
        pending.workId,
        pending.file,
        {
          title: pending.title,
          description: pending.description,
          date: pending.date,
          type: pending.type,
        },
        (pct) => updateJob(pending.id, { progress: pct })
      )
      .then(() => {
        updateJob(pending.id, { status: 'done', progress: 100 })
        queryClient.invalidateQueries({ queryKey: ['timeline', pending.workId] })
        addToast('success', `Enviado: ${pending.file.name}`)
      })
      .catch((err) => {
        updateJob(pending.id, {
          status: 'error',
          error: err?.message || 'Erro no upload',
        })
        addToast('error', `Falha: ${pending.file.name}`)
      })
      .finally(() => {
        processing.current = false
      })
  }, [jobs, updateJob, queryClient, addToast])

  return (
    <UploadQueueContext.Provider value={{ jobs, addJobs, removeJob, clearDone }}>
      {children}
    </UploadQueueContext.Provider>
  )
}
