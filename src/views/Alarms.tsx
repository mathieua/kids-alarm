import { useState, useEffect } from 'react'
import { useAlarm } from '../hooks/useAlarm'
import { DrumRollPicker } from '../components/DrumRollPicker'
import { Track } from '../types'

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 || 12
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

function getNextAlarmLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const now = new Date()
  const alarmToday = new Date(now)
  alarmToday.setHours(h, m, 0, 0)
  const diff = alarmToday.getTime() - now.getTime()
  const label = diff > 0 ? 'Today' : 'Tomorrow'
  return `${label}, ${formatTime(time)}`
}

export function Alarms() {
  const { alarm, setAlarmTime } = useAlarm()
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showSoundPicker, setShowSoundPicker] = useState(false)
  const [pickerHours, setPickerHours] = useState(7)
  const [pickerMinutes, setPickerMinutes] = useState(0)
  const [tracks, setTracks] = useState<Track[]>([])

  // Load tracks when sound picker opens
  useEffect(() => {
    if (showSoundPicker && tracks.length === 0) {
      window.electronAPI.audio.scanMedia().then(setTracks).catch(console.error)
    }
  }, [showSoundPicker, tracks.length])

  const openTimePicker = () => {
    if (alarm) {
      const [h, m] = alarm.time.split(':').map(Number)
      setPickerHours(h)
      setPickerMinutes(m)
    }
    setShowTimePicker(true)
  }

  const saveTimePicker = () => {
    const time = `${String(pickerHours).padStart(2, '0')}:${String(pickerMinutes).padStart(2, '0')}`
    setAlarmTime(time, alarm?.enabled ?? false, alarm?.sound_path)
    setShowTimePicker(false)
  }

  const toggleEnabled = () => {
    if (!alarm) return
    setAlarmTime(alarm.time, !alarm.enabled, alarm.sound_path)
  }

  const selectSound = (soundPath: string | null) => {
    if (!alarm) return
    setAlarmTime(alarm.time, alarm.enabled, soundPath)
    setShowSoundPicker(false)
  }

  const soundLabel = alarm?.sound_path
    ? (tracks.find(t => t.filepath === alarm.sound_path)?.title ?? alarm.sound_path.split('/').pop() ?? 'Selected track')
    : 'Random'

  const displayTime = alarm ? formatTime(alarm.time) : '7:00 AM'

  return (
    <div className="alarms-view">
      <h2 className="alarms-title">Wake-up Alarm</h2>

      <button className="alarm-time-display" onClick={openTimePicker} aria-label="Edit alarm time">
        {displayTime}
      </button>

      <div className="alarm-toggle-row">
        <span className="alarm-toggle-label">{alarm?.enabled ? 'On' : 'Off'}</span>
        <button
          className={`alarm-toggle${alarm?.enabled ? ' alarm-toggle--on' : ''}`}
          onClick={toggleEnabled}
          aria-pressed={alarm?.enabled}
          aria-label="Toggle alarm"
        >
          <span className="alarm-toggle-thumb" />
        </button>
      </div>

      <button className="alarm-sound-btn" onClick={() => setShowSoundPicker(true)}>
        <span className="alarm-sound-btn-label">Sound</span>
        <span className="alarm-sound-btn-value">{soundLabel} ›</span>
      </button>

      {alarm?.enabled && (
        <p className="alarm-next-label">Next: {getNextAlarmLabel(alarm.time)}</p>
      )}

      {/* Time picker modal */}
      {showTimePicker && (
        <div className="alarm-modal-backdrop" onClick={() => setShowTimePicker(false)}>
          <div className="alarm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="alarm-modal-title">Set Wake-up Time</h3>
            <DrumRollPicker
              hours={pickerHours}
              minutes={pickerMinutes}
              onChange={(h, m) => { setPickerHours(h); setPickerMinutes(m) }}
            />
            <div className="alarm-modal-actions">
              <button className="alarm-btn alarm-btn--secondary" onClick={() => setShowTimePicker(false)}>
                Cancel
              </button>
              <button className="alarm-btn alarm-btn--primary" onClick={saveTimePicker}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sound picker modal */}
      {showSoundPicker && (
        <div className="alarm-modal-backdrop" onClick={() => setShowSoundPicker(false)}>
          <div className="alarm-modal alarm-sound-modal" onClick={e => e.stopPropagation()}>
            <h3 className="alarm-modal-title">Alarm Sound</h3>
            <div className="alarm-sound-list">
              <button
                className={`alarm-sound-item${!alarm?.sound_path ? ' alarm-sound-item--selected' : ''}`}
                onClick={() => selectSound(null)}
              >
                <span className="alarm-sound-item-name">Random</span>
                <span className="alarm-sound-item-sub">Pick a random song</span>
                {!alarm?.sound_path && <span className="alarm-sound-item-check">✓</span>}
              </button>
              {tracks.map(track => (
                <button
                  key={track.id}
                  className={`alarm-sound-item${alarm?.sound_path === track.filepath ? ' alarm-sound-item--selected' : ''}`}
                  onClick={() => selectSound(track.filepath)}
                >
                  <span className="alarm-sound-item-name">{track.title}</span>
                  {alarm?.sound_path === track.filepath && <span className="alarm-sound-item-check">✓</span>}
                </button>
              ))}
              {tracks.length === 0 && (
                <p className="alarm-sound-empty">No tracks in library yet</p>
              )}
            </div>
            <button className="alarm-btn alarm-btn--secondary" style={{ width: '100%' }} onClick={() => setShowSoundPicker(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
