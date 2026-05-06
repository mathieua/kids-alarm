import { useState } from 'react'
import { Palette, Lang, Route, t, CORNER_RADIUS, DAYS_EN, DAYS_FR } from '../App'
import { useAlarm } from '../hooks/useAlarm'
import { CircleBtn, IconBack } from '../components/Icons'

interface AlarmsProps {
  palette: Palette
  lang: Lang
  onNavigate: (r: Route) => void
}

function Stepper({ value, onInc, onDec }: { value: number; onInc: () => void; onDec: () => void }) {
  const btn: React.CSSProperties = {
    width: 64, height: 40, borderRadius: 12,
    background: '#ede9fe', color: '#7c3aed', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0, fontFamily: 'inherit',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#f3f4f6', borderRadius: 18, padding: '8px 6px' }}>
      <button style={btn} onClick={onInc}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6"/></svg>
      </button>
      <div style={{ fontSize: 48, fontWeight: 900, color: '#7c3aed', lineHeight: 1, fontVariantNumeric: 'tabular-nums', minWidth: 76, textAlign: 'center' }}>
        {String(value).padStart(2, '0')}
      </div>
      <button style={btn} onClick={onDec}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 56, height: 32, borderRadius: 16,
      background: checked ? '#22c55e' : '#cbd5e1',
      border: 'none', padding: 0, cursor: 'pointer', position: 'relative',
      transition: 'background 0.2s ease', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: checked ? 27 : 3,
        width: 26, height: 26, borderRadius: '50%', background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        transition: 'left 0.2s ease', display: 'block',
      }} />
    </button>
  )
}

export function Alarms({ palette, lang, onNavigate }: AlarmsProps) {
  const { alarm, setAlarmTime } = useAlarm()
  const [editHour, setEditHour] = useState(alarm ? parseInt(alarm.time.split(':')[0]) : 7)
  const [editMinute, setEditMinute] = useState(alarm ? parseInt(alarm.time.split(':')[1]) : 0)
  const [editing, setEditing] = useState(false)
  const [activeDays, setActiveDays] = useState<string[]>(['Mon','Tue','Wed','Thu','Fri'])

  const r = CORNER_RADIUS
  const days = lang === 'fr' ? DAYS_FR : DAYS_EN

  const bumpHour = (delta: number) => setEditHour(h => (h + delta + 24) % 24)
  const bumpMinute = (delta: number) => {
    setEditMinute(m => {
      const next = m + delta
      if (next >= 60) { bumpHour(1); return next - 60 }
      if (next < 0)  { bumpHour(-1); return next + 60 }
      return next
    })
  }

  const openEdit = () => {
    if (alarm) { setEditHour(parseInt(alarm.time.split(':')[0])); setEditMinute(parseInt(alarm.time.split(':')[1])) }
    setEditing(true)
  }

  const save = () => {
    const time = `${String(editHour).padStart(2,'0')}:${String(editMinute).padStart(2,'0')}`
    setAlarmTime(time, true, alarm?.sound_path)
    setEditing(false)
  }

  const toggleEnabled = () => { if (alarm) setAlarmTime(alarm.time, !alarm.enabled, alarm.sound_path) }
  const toggleDay = (d: string) => setActiveDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  return (
    <div style={{
      width: 800, height: 480, background: palette.alarms,
      display: 'flex', flexDirection: 'column', padding: 24, gap: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <CircleBtn size={56} onClick={() => onNavigate('clock')}><IconBack size={26} /></CircleBtn>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>{t(lang, 'alarms')}</h1>
        {alarm && !editing ? (
          <CircleBtn size={56} bg="#facc15" color="#fff" onClick={openEdit}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </CircleBtn>
        ) : <div style={{ width: 56 }} />}
      </div>

      {/* Time stepper (edit mode) */}
      {editing && (
        <div style={{ background: '#fff', borderRadius: r - 4, padding: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <Stepper value={editHour}   onInc={() => bumpHour(1)}   onDec={() => bumpHour(-1)} />
            <div style={{ fontSize: 44, fontWeight: 900, color: '#7c3aed', lineHeight: 1, padding: '0 4px' }}>:</div>
            <Stepper value={editMinute} onInc={() => bumpMinute(5)} onDec={() => bumpMinute(-5)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', padding: '12px 0', borderRadius: 14, fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{t(lang, 'save')}</button>
            <button onClick={() => setEditing(false)} style={{ flex: 1, background: 'transparent', color: '#374151', border: '2px solid #e5e7eb', padding: '12px 0', borderRadius: 14, fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{t(lang, 'cancel')}</button>
          </div>
        </div>
      )}

      {/* Alarm row (view mode) */}
      {!editing && alarm && (
        <div style={{ background: '#fff', borderRadius: r - 4, padding: 16, opacity: alarm.enabled ? 1 : 0.55, transition: 'opacity 0.2s ease', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={openEdit} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#7c3aed', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{alarm.time}</div>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Switch checked={alarm.enabled} onChange={toggleEnabled} />
              <button onClick={() => setAlarmTime(alarm.time, false, alarm.sound_path)} style={{
                background: '#fee2e2', border: 'none', color: '#dc2626', width: 44, height: 44,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS_EN.map((d, i) => {
              const active = activeDays.includes(d)
              return (
                <button key={d} onClick={() => toggleDay(d)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 12, border: 'none',
                  fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  background: active ? '#3b82f6' : '#e5e7eb', color: active ? '#fff' : '#9ca3af',
                  transition: 'background 0.15s',
                }}>{days[i]}</button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state + add button */}
      {!editing && !alarm && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: r, padding: 28, textAlign: 'center', color: 'rgba(255,255,255,0.95)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{t(lang, 'noAlarms')}</div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>{t(lang, 'addFirst')}</div>
          </div>
          <CircleBtn size={56} bg="#facc15" color="#fff" onClick={openEdit}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </CircleBtn>
        </div>
      )}
    </div>
  )
}
