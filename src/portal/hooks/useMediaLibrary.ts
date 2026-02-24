import { useState, useEffect, useCallback } from 'react'
import type { MediaItem, Category } from '../types/portal.types'
import { portalApi } from '../api/portalApi'
import { useWebSocket } from './useWebSocket'

type ActiveCategory = Category | 'all'

export function useMediaLibrary() {
  const [allItems, setAllItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const items = await portalApi.getMedia()
      setAllItems(items)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Auto-refresh when a new track is imported
  useWebSocket('download_complete', () => { refresh() })

  const items = allItems.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return item.title.toLowerCase().includes(q) || item.artist.toLowerCase().includes(q)
    }
    return true
  })

  const deleteItem = useCallback(async (id: number) => {
    await portalApi.deleteMedia(id)
    setAllItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateItem = useCallback(async (id: number, patch: Partial<Pick<MediaItem, 'title' | 'artist' | 'category'>>) => {
    const updated = await portalApi.updateMedia(id, patch)
    setAllItems(prev => prev.map(i => i.id === id ? updated : i))
  }, [])

  return {
    items,
    isLoading,
    activeCategory,
    setCategory: setActiveCategory,
    searchQuery,
    setSearchQuery,
    deleteItem,
    updateItem,
    refresh,
  }
}
