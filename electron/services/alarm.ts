import { EventEmitter } from 'events'
import { getAlarm, upsertAlarm, Alarm } from './database'

export class AlarmService extends EventEmitter {
  private checkInterval: NodeJS.Timeout | null = null
  private alarmActive = false
  private snoozeUntil: Date | null = null

  start(): void {
    this.checkInterval = setInterval(() => this.check(), 30_000)
    // Also check immediately on start (in case app starts right at alarm time)
    this.check()
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  getAlarm(): Alarm | null {
    return getAlarm() ?? null
  }

  setAlarm(time: string, enabled: boolean, soundPath?: string | null): Alarm {
    // If alarm changes while active, dismiss first
    if (this.alarmActive) {
      this.dismiss()
    }
    return upsertAlarm(time, enabled, soundPath)
  }

  snooze(): void {
    if (!this.alarmActive) return
    this.alarmActive = false
    this.snoozeUntil = new Date(Date.now() + 5 * 60_000)
    this.emit('snoozed')
  }

  dismiss(): void {
    this.alarmActive = false
    this.snoozeUntil = null
    this.emit('dismissed')
  }

  private check(): void {
    if (this.alarmActive) return

    const alarm = getAlarm()
    if (!alarm || !alarm.enabled) return

    const now = new Date()

    // Check snooze
    if (this.snoozeUntil && now < this.snoozeUntil) return

    const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number)
    if (now.getHours() === alarmHour && now.getMinutes() === alarmMinute) {
      this.alarmActive = true
      this.snoozeUntil = null
      this.emit('fired')
    }
  }
}
