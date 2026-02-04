import { useState, useEffect } from 'react'

interface DimmedClockProps {
  onWake: () => void
}

export function DimmedClock({ onWake }: DimmedClockProps) {
  const [time, setTime] = useState(new Date())

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
    </div>
  )
}
