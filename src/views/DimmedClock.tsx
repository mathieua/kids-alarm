import { useState, useEffect } from 'react'
import { Lang, t } from '../App'
import { Alarm, Track } from '../types'
import { IconAlarm, IconMusic } from '../components/Icons'

interface DimmedClockProps {
  alarm: Alarm | null
  isPlaying: boolean
  currentTrack: Track | null
  lang: Lang
  onWake: () => void
}

export function DimmedClock({ alarm, isPlaying, currentTrack, lang, onWake }: DimmedClockProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  return (
    <div onClick={onWake} style={{
      width: 800, height: 480, background: '#000',
      color: 'rgba(255,255,255,0.55)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', padding: 24, gap: 14, position: 'relative',
    }}>
      <div style={{
        fontSize: 180, fontWeight: 200,
        letterSpacing: '-0.04em', lineHeight: 0.95,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {timeStr}
      </div>

      <div style={{ display: 'flex', gap: 28, marginTop: 8, fontSize: 16, fontWeight: 600, opacity: 0.7 }}>
        {alarm?.enabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlarm size={18} stroke="rgba(255,255,255,0.5)" />
            <span>{alarm.time}</span>
          </div>
        )}
        {isPlaying && currentTrack && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 360, overflow: 'hidden' }}>
            <IconMusic size={18} stroke="rgba(255,255,255,0.5)" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.title}
            </span>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 22,
        fontSize: 12, opacity: 0.35, letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        {t(lang, 'tapToWake')}
      </div>
    </div>
  )
}
