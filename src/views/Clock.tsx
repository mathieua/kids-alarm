import { useState, useEffect } from 'react'
import { useAlarm } from '../hooks/useAlarm'

export function Clock() {
  const [time, setTime] = useState(new Date())
  const { alarm } = useAlarm()

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const displayHours = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="clock-view">
      <div className="time">
        <span className="hours">{displayHours.toString().padStart(2, '0')}</span>
        <span className="colon">:</span>
        <span className="minutes">{minutes.toString().padStart(2, '0')}</span>
        <span className="seconds">{seconds.toString().padStart(2, '0')}</span>
        <span className="ampm">{ampm}</span>
      </div>
      <div className="date">{dateStr}</div>
      {alarm?.enabled && (
        <div className="alarm-badge">
          &#9201; {(() => {
            const [h, m] = alarm.time.split(':').map(Number)
            const period = h >= 12 ? 'PM' : 'AM'
            const dh = h % 12 || 12
            return `${dh}:${String(m).padStart(2, '0')} ${period}`
          })()}
        </div>
      )}
    </div>
  )
}
