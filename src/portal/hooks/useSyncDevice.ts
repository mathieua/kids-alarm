import { useState, useEffect, useCallback } from 'react'
import type { UsbDevice, SyncDiff, SyncProgress, SyncSummary, SyncStatus } from '../types/portal.types'
import { portalApi } from '../api/portalApi'
import { useWebSocket } from './useWebSocket'

export function useSyncDevice() {
  const [device, setDevice] = useState<UsbDevice | null>(null)
  const [diff, setDiff] = useState<SyncDiff | null>(null)
  const [isDiffLoading, setIsDiffLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [summary, setSummary] = useState<SyncSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDiff = useCallback(async () => {
    setIsDiffLoading(true)
    setDiff(null)
    try {
      const d = await portalApi.getDiff()
      setDiff(d)
      setSyncStatus(d.orphans.length > 0 ? 'reviewing' : 'idle')
    } catch (err: unknown) {
      setError((err as Error).message)
      setSyncStatus('error')
    } finally {
      setIsDiffLoading(false)
    }
  }, [])

  // Check for device on mount
  useEffect(() => {
    portalApi.getDevice().then(dev => {
      if (dev) {
        setDevice(dev)
        fetchDiff()
      }
    }).catch(() => { /* no device */ })
  }, [fetchDiff])

  const startSync = useCallback(async (deleteOrphans: string[]) => {
    setSyncStatus('syncing')
    setProgress(null)
    try {
      await portalApi.startSync({ deleteOrphans })
    } catch (err: unknown) {
      setError((err as Error).message)
      setSyncStatus('error')
    }
  }, [])

  const eject = useCallback(async () => {
    try {
      await portalApi.eject()
    } catch { /* ignore */ }
  }, [])

  const reset = useCallback(() => {
    setSyncStatus('idle')
    setDiff(null)
    setProgress(null)
    setSummary(null)
    setError(null)
  }, [])

  useWebSocket('usb_connected', (payload) => {
    setDevice(payload as unknown as UsbDevice)
    setSyncStatus('idle')
    fetchDiff()
  })

  useWebSocket('usb_disconnected', () => {
    setDevice(null)
    setDiff(null)
    setSyncStatus('idle')
    setProgress(null)
    setSummary(null)
  })

  useWebSocket('sync_progress', (payload) => {
    setProgress(payload as unknown as SyncProgress)
  })

  useWebSocket('sync_complete', (payload) => {
    setSummary(payload as unknown as SyncSummary)
    setSyncStatus('complete')
  })

  useWebSocket('sync_error', (payload) => {
    setError((payload as { error: string }).error)
    setSyncStatus('error')
  })

  return { device, diff, isDiffLoading, syncStatus, progress, summary, fetchDiff, startSync, eject, reset, error }
}
