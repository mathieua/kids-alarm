import { useState, useCallback } from 'react'
import type { MediaItem, Category } from '../types/portal.types'
import { portalApi } from '../api/portalApi'

interface UploadMeta {
  title: string
  artist: string
  category: Category
}

export function useUpload() {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File, meta: UploadMeta): Promise<MediaItem> => {
    setIsUploading(true)
    setProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', meta.title)
    formData.append('artist', meta.artist)
    formData.append('category', meta.category)

    try {
      const item = await portalApi.uploadXhr(formData, setProgress)
      return item
    } catch (err: unknown) {
      const msg = (err as Error).message
      setError(msg)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  return { upload, progress, isUploading, error }
}
