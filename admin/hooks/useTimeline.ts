import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, TimelineEntry } from '../lib/api'

export const useTimeline = (workId: string) => {
  const queryClient = useQueryClient()
  
  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['timeline', workId],
    queryFn: () => api.getTimelineEntries(workId),
    enabled: !!workId,
  })
  
  const createMutation = useMutation({
    mutationFn: (data: { file: File; title: string; description: string; date: string; type: 'image' | 'video' }) =>
      api.uploadTimelineEntry(workId, data.file, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', workId] })
    },
  })
  
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TimelineEntry> }) =>
      api.updateTimelineEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', workId] })
    },
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTimelineEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', workId] })
    },
  })
  
  const reorderMutation = useMutation({
    mutationFn: (order: string[]) => api.reorderTimelineEntries(workId, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', workId] })
    },
  })
  
  return {
    entries,
    isLoading,
    error,
    createEntry: createMutation.mutateAsync,
    updateEntry: updateMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
    reorderEntries: reorderMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  }
}