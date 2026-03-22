import { useState, useEffect } from 'react'
import { useAlarm } from '../hooks/useAlarm'
import { useAudio } from '../hooks/useAudio'

interface ClockProps {
  onNavigate?: (view: string) => void
}

export function Clock({ onNavigate }: ClockProps) {
  const [time, setTime] = useState(new Date())
  const { alarm } = useAlarm()
  const { isPlaying, togglePlayPause } = useAudio()

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const alarmTime = alarm?.time || '07:00'
  const [alarmH, alarmM] = alarmTime.split(':')

  return (
    <div className="clock-view-new">
      <div className="clock-time-container">
        <div className="clock-time">
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
        </div>
        <div className="clock-date">{dateStr}</div>
      </div>

      <div className="clock-cards">
        <button className="clock-card" onClick={() => onNavigate?.('alarms')}>
          <div className="clock-card-icon clock-card-icon--alarm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C14.1217 22 16.1566 21.1571 17.6569 19.6569C19.1571 18.1566 20 16.1217 20 14C20 11.8783 19.1571 9.84344 17.6569 8.34315C16.1566 6.84285 14.1217 6 12 6C9.87827 6 7.84344 6.84285 6.34315 8.34315C4.84285 9.84344 4 11.8783 4 14C4 16.1217 4.84285 18.1566 6.34315 19.6569C7.84344 21.1571 9.87827 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 10V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 4L7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 4L17 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18.5 18.5L20 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5.5 18.5L4 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="clock-card-content">
            <span className="clock-card-label">Next Alarm</span>
            <span className="clock-card-value">{alarmH}:{alarmM}</span>
          </div>
        </button>

        <button className="clock-card" onClick={() => onNavigate?.('media')}>
          <div className="clock-card-icon clock-card-icon--music">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V5L21 3V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div className="clock-card-content">
            <span className="clock-card-value">Music</span>
          </div>
          <div
            className="clock-play-btn"
            onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
            role="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="4" width="4" height="16" rx="1" fill="#c27aff"/>
                <rect x="14" y="4" width="4" height="16" rx="1" fill="#c27aff"/>
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" fill="#c27aff"/>
              </svg>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
