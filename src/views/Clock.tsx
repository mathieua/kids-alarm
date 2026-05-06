import { useState, useEffect } from 'react'
import { Palette, Lang, Route, t, DATE_LABELS, CORNER_RADIUS } from '../App'
import { Alarm, Track } from '../types'
import { CircleBtn, IconAlarm, IconMusic, IconPlay, IconPause, IconSettings } from '../components/Icons'

interface ClockProps {
  palette: Palette
  lang: Lang
  alarm: Alarm | null
  isPlaying: boolean
  currentTrack: Track | null
  onTogglePlay: () => void
  onNavigate: (r: Route) => void
}

export function Clock({ palette, lang, alarm, isPlaying, currentTrack, onTogglePlay, onNavigate }: ClockProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  const labels = DATE_LABELS[lang] ?? DATE_LABELS.en
  const dateStr = labels.fmt(now, labels.days, labels.months)
  const r = CORNER_RADIUS

  const cardBase: React.CSSProperties = {
    flex: 1, background: 'rgba(255,255,255,0.22)',
    backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
    borderRadius: r, padding: 18, display: 'flex', alignItems: 'center', gap: 14,
    cursor: 'pointer', border: '1px solid rgba(255,255,255,0.18)',
    transition: 'background 0.15s ease',
  }
  const pill = (bg: string): React.CSSProperties => ({
    width: 60, height: 60, borderRadius: '50%', background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
  })

  return (
    <div style={{
      width: 800, height: 480, background: palette.clock,
      display: 'flex', flexDirection: 'column', padding: 24, gap: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Settings gear — top right */}
      <button onClick={() => onNavigate('settings')} style={{
        position: 'absolute', top: 18, right: 18,
        width: 48, height: 48, borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, zIndex: 2, transition: 'transform 0.12s ease',
      }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <IconSettings size={24} />
      </button>

      {/* Time + date */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 4,
      }}>
        <div style={{
          fontSize: 132, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.04em', lineHeight: 0.95,
          textShadow: '0 6px 24px rgba(0,0,0,0.18)', fontVariantNumeric: 'tabular-nums',
        }}>{timeStr}</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginTop: 8 }}>
          {dateStr}
        </div>
      </div>

      {/* Bottom cards */}
      <div style={{ display: 'flex', gap: 18 }}>
        {/* Alarm card */}
        <div onClick={() => onNavigate('alarms')} style={cardBase}
          onMouseDown={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.30)')}
          onMouseUp={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.22)')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.22)')}
        >
          <div style={pill('#facc15')}><IconAlarm size={30} stroke="#fff" /></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {alarm?.enabled ? (
              <>
                <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {t(lang, 'nextAlarm')}
                </div>
                <div style={{ color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                  {alarm.time}
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{t(lang, 'setAlarm')}</div>
                <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13 }}>{t(lang, 'tapAdd')}</div>
              </>
            )}
          </div>
        </div>

        {/* Music card */}
        <div onClick={() => onNavigate('playlists')} style={cardBase}
          onMouseDown={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.30)')}
          onMouseUp={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.22)')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.22)')}
        >
          <div style={pill('#22c55e')}><IconMusic size={28} stroke="#fff" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isPlaying && currentTrack ? (
              <>
                <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {t(lang, 'nowPlaying')}
                </div>
                <div style={{ color: '#fff', fontSize: 19, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack.title}
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Music</div>
                <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13 }}>{t(lang, 'tapBrowse')}</div>
              </>
            )}
          </div>
          <CircleBtn size={56} bg="#fff" color={palette.accentPlay} shadow="0 6px 18px rgba(0,0,0,0.18)"
            onClick={e => { e.stopPropagation(); onTogglePlay() }}
          >
            {isPlaying
              ? <IconPause size={26} />
              : <div style={{ transform: 'translateX(2px)' }}><IconPlay size={26} /></div>
            }
          </CircleBtn>
        </div>
      </div>
    </div>
  )
}
