import { useState, useEffect, useCallback } from 'react'
import type { ImportJob } from '../types/portal.types'
import { portalApi } from '../api/portalApi'
import { useWebSocket } from './useWebSocket'

export function useImportJobs() {
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const refresh = useCallback(async () => {
    const data = await portalApi.getJobs()
    setJobs(data)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useWebSocket('download_progress', ({ jobId, percent, status }) => {
    setJobs(prev => prev.map(j =>
      j.id === (jobId as number)
        ? { ...j, progress_percent: percent as number, status: status as ImportJob['status'] }
        : j
    ))
  })

  useWebSocket('download_complete', ({ jobId, mediaItem }) => {
    setJobs(prev => prev.map(j =>
      j.id === (jobId as number)
        ? { ...j, status: 'complete' as const, progress_percent: 100, media_item_id: (mediaItem as { id: number }).id }
        : j
    ))
  })

  useWebSocket('download_error', ({ jobId, error }) => {
    setJobs(prev => prev.map(j =>
      j.id === (jobId as number)
        ? { ...j, status: 'error' as const, error_message: error as string }
        : j
    ))
  })

  const activeCount = jobs.filter(j => j.status === 'pending' || j.status === 'downloading' || j.status === 'converting').length

  return {
    jobs,
    activeCount,
    isOpen,
    togglePanel: () => setIsOpen(v => !v),
    refresh,
  }
}
