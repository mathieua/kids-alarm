import { useState, useEffect, useCallback } from 'react'
import type { UsbDevice, SyncDiff, SyncProgress, SyncSummary, SyncStatus } from '../types'

export function useSync() {
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
      const d = await window.electronAPI.sync.getDiff()
      setDiff(d)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setIsDiffLoading(false)
    }
  }, [])

  useEffect(() => {
    window.electronAPI.sync.getDevice().then(dev => {
      if (dev) {
        setDevice(dev)
        fetchDiff()
      }
    }).catch(() => {})

    const unsubscribe = window.electronAPI.sync.onEvent((event, payload) => {
      if (event === 'usb_connected') {
        setDevice(payload as UsbDevice)
        setSyncStatus('idle')
        setDiff(null)
        setProgress(null)
        setSummary(null)
        setError(null)
        fetchDiff()
      } else if (event === 'usb_disconnected') {
        setDevice(null)
        setDiff(null)
        setSyncStatus('idle')
        setProgress(null)
        setSummary(null)
      } else if (event === 'sync_progress') {
        setProgress(payload as SyncProgress)
      } else if (event === 'sync_complete') {
        setSummary(payload as SyncSummary)
        setSyncStatus('complete')
      } else if (event === 'sync_error') {
        setError((payload as { error: string }).error)
        setSyncStatus('error')
      }
    })
    return unsubscribe
  }, [fetchDiff])

  const startSync = useCallback(async () => {
    setSyncStatus('syncing')
    setProgress(null)
    try {
      await window.electronAPI.sync.startSync([])
    } catch (err: unknown) {
      setError((err as Error).message)
      setSyncStatus('error')
    }
  }, [])

  const eject = useCallback(async () => {
    try { await window.electronAPI.sync.eject() } catch { /* ignore */ }
  }, [])

  const reset = useCallback(() => {
    setSyncStatus('idle')
    setDiff(null)
    setProgress(null)
    setSummary(null)
    setError(null)
    if (device) fetchDiff()
  }, [device, fetchDiff])

  return { device, diff, isDiffLoading, syncStatus, progress, summary, startSync, eject, reset, error }
}
