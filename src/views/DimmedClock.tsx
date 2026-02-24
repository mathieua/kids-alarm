import { useState, useEffect } from 'react'
import { useAlarm } from '../hooks/useAlarm'

interface DimmedClockProps {
  onWake: () => void
}

export function DimmedClock({ onWake }: DimmedClockProps) {
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

  const displayHours = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'

  return (
    <div className="dimmed-clock" onClick={onWake} onTouchStart={onWake}>
      <div className="dimmed-time">
        <span className="dimmed-hours">{displayHours}</span>
        <span className="dimmed-colon">:</span>
        <span className="dimmed-minutes">{minutes.toString().padStart(2, '0')}</span>
        <span className="dimmed-ampm">{ampm}</span>
      </div>
      {alarm?.enabled && (
        <div className="dimmed-alarm-badge">
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
