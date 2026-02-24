import { useRef, useEffect, useCallback } from 'react'

const ITEM_HEIGHT = 64
const VISIBLE_ITEMS = 5

interface ColumnProps {
  values: string[]
  selectedIndex: number
  onSelect: (index: number) => void
}

function DrumRollColumn({ values, selectedIndex, onSelect }: ColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to selected item on mount and when selectedIndex changes externally
  useEffect(() => {
    if (isScrollingRef.current) return
    const container = containerRef.current
    if (!container) return
    container.scrollTo({ top: selectedIndex * ITEM_HEIGHT, behavior: 'smooth' })
  }, [selectedIndex])

  const handleScroll = useCallback(() => {
    isScrollingRef.current = true
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false
      const container = containerRef.current
      if (!container) return
      const index = Math.round(container.scrollTop / ITEM_HEIGHT)
      const clamped = Math.max(0, Math.min(index, values.length - 1))
      // Snap to nearest item
      container.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' })
      onSelect(clamped)
    }, 100)
  }, [values.length, onSelect])

  return (
    <div className="drum-roll-column-wrapper">
      <div
        ref={containerRef}
        className="drum-roll-column"
        onScroll={handleScroll}
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
      >
        {/* Padding items so first/last values can be centered */}
        <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
        {values.map((val, i) => (
          <div
            key={val}
            className={`drum-roll-item${i === selectedIndex ? ' selected' : ''}`}
            style={{ height: ITEM_HEIGHT }}
          >
            {val}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
      </div>
      {/* Selection highlight band */}
      <div className="drum-roll-selection-band" style={{
        top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        height: ITEM_HEIGHT,
      }} />
    </div>
  )
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

interface DrumRollPickerProps {
  hours: number
  minutes: number
  onChange: (hours: number, minutes: number) => void
}

export function DrumRollPicker({ hours, minutes, onChange }: DrumRollPickerProps) {
  const handleHourSelect = useCallback((index: number) => {
    onChange(index, minutes)
  }, [minutes, onChange])

  const handleMinuteSelect = useCallback((index: number) => {
    onChange(hours, index)
  }, [hours, onChange])

  return (
    <div className="drum-roll-picker">
      <DrumRollColumn values={HOURS} selectedIndex={hours} onSelect={handleHourSelect} />
      <div className="drum-roll-separator">:</div>
      <DrumRollColumn values={MINUTES} selectedIndex={minutes} onSelect={handleMinuteSelect} />
    </div>
  )
}
