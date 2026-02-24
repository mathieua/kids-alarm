import { useState, useCallback } from 'react'
import type { YoutubePrefetch, ImportJob, Category } from '../types/portal.types'
import { portalApi } from '../api/portalApi'
import { useWebSocket } from './useWebSocket'

type Stage = 'idle' | 'fetching' | 'preview' | 'importing' | 'done' | 'error'

interface ImportParams {
  url: string
  title: string
  artist: string
  category: Category
}

export function useYoutubeImport() {
  const [stage, setStage] = useState<Stage>('idle')
  const [prefetchData, setPrefetchData] = useState<YoutubePrefetch | null>(null)
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const prefetch = useCallback(async (url: string) => {
    setStage('fetching')
    setError(null)
    try {
      const data = await portalApi.prefetch(url)
      setPrefetchData(data)
      setStage('preview')
    } catch (err: unknown) {
      setError((err as Error).message)
      setStage('error')
    }
  }, [])

  const startImport = useCallback(async (params: ImportParams) => {
    setStage('importing')
    setError(null)
    try {
      const { jobId } = await portalApi.startImport(params)
      const job = await portalApi.getJob(jobId)
      setActiveJob(job)
    } catch (err: unknown) {
      setError((err as Error).message)
      setStage('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStage('idle')
    setPrefetchData(null)
    setActiveJob(null)
    setError(null)
  }, [])

  useWebSocket('download_progress', ({ jobId, percent, status }) => {
    setActiveJob(prev => {
      if (!prev || prev.id !== (jobId as number)) return prev
      return { ...prev, progress_percent: percent as number, status: status as ImportJob['status'] }
    })
  })

  useWebSocket('download_complete', ({ jobId, mediaItem }) => {
    setActiveJob(prev => {
      if (!prev || prev.id !== (jobId as number)) return prev
      return { ...prev, status: 'complete', progress_percent: 100, media_item_id: (mediaItem as { id: number }).id }
    })
    setStage('done')
  })

  useWebSocket('download_error', ({ jobId, error: errMsg }) => {
    setActiveJob(prev => {
      if (!prev || prev.id !== (jobId as number)) return prev
      return { ...prev, status: 'error', error_message: errMsg as string }
    })
    setError(errMsg as string)
    setStage('error')
  })

  return {
    stage,
    prefetchData,
    activeJob,
    prefetch,
    startImport,
    reset,
    error,
  }
}
