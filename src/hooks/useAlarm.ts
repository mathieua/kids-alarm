import { useState, useEffect, useCallback } from 'react'
import { Alarm } from '../types'

export function useAlarm() {
  const [alarm, setAlarm] = useState<Alarm | null>(null)
  const [isFiring, setIsFiring] = useState(false)

  useEffect(() => {
    window.electronAPI.alarm.getAlarm().then(setAlarm).catch(console.error)

    const unsubFired = window.electronAPI.alarm.onFired(() => setIsFiring(true))
    const unsubDismissed = window.electronAPI.alarm.onDismissed(() => setIsFiring(false))
    const unsubUpdated = window.electronAPI.alarm.onUpdated(setAlarm)

    return () => {
      unsubFired()
      unsubDismissed()
      unsubUpdated()
    }
  }, [])

  const setAlarmTime = useCallback(async (time: string, enabled: boolean, soundPath?: string | null) => {
    const updated = await window.electronAPI.alarm.setAlarm(time, enabled, soundPath)
    setAlarm(updated)
  }, [])

  const snooze = useCallback(async () => {
    await window.electronAPI.alarm.snooze()
    setIsFiring(false)
  }, [])

  const dismiss = useCallback(async () => {
    await window.electronAPI.alarm.dismiss()
    setIsFiring(false)
  }, [])

  return { alarm, isFiring, setAlarmTime, snooze, dismiss }
}
