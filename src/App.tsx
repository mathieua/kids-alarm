import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Navigation } from './components/Navigation'
import { Clock } from './views/Clock'
import { Media } from './views/Media'
import { Alarms } from './views/Alarms'
import { Sync } from './views/Sync'
import { DimmedClock } from './views/DimmedClock'
import { useSwipe } from './hooks/useSwipe'
import { useIdleTimer } from './hooks/useIdleTimer'
import { useAlarm } from './hooks/useAlarm'
import './types'

const BASE_VIEWS = ['clock', 'media', 'alarms'] as const
type BaseView = typeof BASE_VIEWS[number]
type View = BaseView | 'sync'
type Direction = 'left' | 'right'

const IDLE_TIMEOUT = 30 * 1000

function App() {
  const [activeView, setActiveView] = useState<View>('clock')
  const [slideDirection, setSlideDirection] = useState<Direction>('left')
  const [viewKey, setViewKey] = useState(0)
  const [hasUsbDevice, setHasUsbDevice] = useState(false)
  const appRef = useRef<HTMLDivElement>(null)
  const { isIdle, wake } = useIdleTimer(IDLE_TIMEOUT)
  const { alarm, isFiring, snooze, dismiss } = useAlarm()

  // Watch for USB device connect/disconnect
  useEffect(() => {
    window.electronAPI.sync.getDevice().then(dev => setHasUsbDevice(!!dev)).catch(() => {})
    return window.electronAPI.sync.onEvent((event) => {
      if (event === 'usb_connected') setHasUsbDevice(true)
      else if (event === 'usb_disconnected') setHasUsbDevice(false)
    })
  }, [])

  const views: View[] = useMemo(
    () => hasUsbDevice ? [...BASE_VIEWS, 'sync'] : [...BASE_VIEWS],
    [hasUsbDevice]
  )

  // Auto-navigate to sync on device connect; back to clock on disconnect
  useEffect(() => {
    if (hasUsbDevice) {
      navigateTo('sync', 'left')
    } else if (activeView === 'sync') {
      navigateTo('clock', 'right')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUsbDevice])

  const navigateTo = useCallback((newView: View, direction: Direction) => {
    setActiveView(prev => {
      if (newView !== prev) {
        setSlideDirection(direction)
        setViewKey(k => k + 1)
        return newView
      }
      return prev
    })
  }, [])

  const navigateNext = useCallback(() => {
    setActiveView(prev => {
      const currentIndex = views.indexOf(prev)
      if (currentIndex < views.length - 1) {
        setSlideDirection('left')
        setViewKey(k => k + 1)
        return views[currentIndex + 1]
      }
      return prev
    })
  }, [views])

  const navigatePrev = useCallback(() => {
    setActiveView(prev => {
      const currentIndex = views.indexOf(prev)
      if (currentIndex > 0) {
        setSlideDirection('right')
        setViewKey(k => k + 1)
        return views[currentIndex - 1]
      }
      return prev
    })
  }, [views])

  const handleViewChange = useCallback((view: string) => {
    setActiveView(prev => {
      const currentIndex = views.indexOf(prev as View)
      const newIndex = views.indexOf(view as View)
      const direction = newIndex > currentIndex ? 'left' : 'right'
      if (view !== prev) {
        setSlideDirection(direction)
        setViewKey(k => k + 1)
        return view as View
      }
      return prev
    })
  }, [views])

  useSwipe(appRef, {
    onSwipeLeft: navigateNext,
    onSwipeRight: navigatePrev,
  })

  if (isIdle) {
    return <DimmedClock onWake={wake} />
  }

  const renderView = () => {
    const className = `view-wrapper slide-from-${slideDirection}`
    switch (activeView) {
      case 'clock':   return <div key={viewKey} className={className}><Clock /></div>
      case 'media':   return <div key={viewKey} className={className}><Media /></div>
      case 'alarms':  return <div key={viewKey} className={className}><Alarms /></div>
      case 'sync':    return <div key={viewKey} className={className}><Sync /></div>
      default:        return <div key={viewKey} className={className}><Clock /></div>
    }
  }

  const navViews = [
    { id: 'clock', label: 'Clock' },
    { id: 'media', label: 'Media' },
    { id: 'alarms', label: 'Alarms' },
    ...(hasUsbDevice ? [{ id: 'sync', label: 'Sync' }] : []),
  ]

  return (
    <div className="app" ref={appRef}>
      <main className="main-content">
        {renderView()}
      </main>
      <Navigation views={navViews} activeView={activeView} onViewChange={handleViewChange} />

      {isFiring && (
        <div className="alarm-overlay">
          <div className="alarm-overlay-time">
            {alarm ? (() => {
              const [h, m] = alarm.time.split(':').map(Number)
              const period = h >= 12 ? 'PM' : 'AM'
              const dh = h % 12 || 12
              return `${dh}:${String(m).padStart(2, '0')} ${period}`
            })() : ''}
          </div>
          <div className="alarm-overlay-label">Wake Up!</div>
          <div className="alarm-overlay-actions">
            <button className="alarm-overlay-btn alarm-overlay-btn--snooze" onClick={snooze}>
              <span>Snooze</span>
              <span className="alarm-overlay-btn-sub">5 minutes</span>
            </button>
            <button className="alarm-overlay-btn alarm-overlay-btn--dismiss" onClick={dismiss}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
