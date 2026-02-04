import { useState, useCallback, useRef } from 'react'
import { Navigation } from './components/Navigation'
import { Clock } from './views/Clock'
import { Media } from './views/Media'
import { Alarms } from './views/Alarms'
import { DimmedClock } from './views/DimmedClock'
import { useSwipe } from './hooks/useSwipe'
import { useIdleTimer } from './hooks/useIdleTimer'
import './types'

const views = ['clock', 'media', 'alarms'] as const
type View = typeof views[number]
type Direction = 'left' | 'right'

// Idle timeout in milliseconds (30 seconds for testing, increase for production)
const IDLE_TIMEOUT = 30 * 1000

function App() {
  const [activeView, setActiveView] = useState<View>('clock')
  const [slideDirection, setSlideDirection] = useState<Direction>('left')
  const [viewKey, setViewKey] = useState(0)
  const appRef = useRef<HTMLDivElement>(null)
  const { isIdle, wake } = useIdleTimer(IDLE_TIMEOUT)

  const navigateTo = useCallback((newView: View, direction: Direction) => {
    if (newView !== activeView) {
      setSlideDirection(direction)
      setActiveView(newView)
      setViewKey(k => k + 1)
    }
  }, [activeView])

  const navigateNext = useCallback(() => {
    const currentIndex = views.indexOf(activeView)
    if (currentIndex < views.length - 1) {
      navigateTo(views[currentIndex + 1], 'left')
    }
  }, [activeView, navigateTo])

  const navigatePrev = useCallback(() => {
    const currentIndex = views.indexOf(activeView)
    if (currentIndex > 0) {
      navigateTo(views[currentIndex - 1], 'right')
    }
  }, [activeView, navigateTo])

  const handleViewChange = useCallback((view: string) => {
    const currentIndex = views.indexOf(activeView)
    const newIndex = views.indexOf(view as View)
    const direction = newIndex > currentIndex ? 'left' : 'right'
    navigateTo(view as View, direction)
  }, [activeView, navigateTo])

  useSwipe(appRef, {
    onSwipeLeft: navigateNext,
    onSwipeRight: navigatePrev,
  })

  // Show dimmed clock when idle
  if (isIdle) {
    return <DimmedClock onWake={wake} />
  }

  const renderView = () => {
    const className = `view-wrapper slide-from-${slideDirection}`
    switch (activeView) {
      case 'clock':
        return <div key={viewKey} className={className}><Clock /></div>
      case 'media':
        return <div key={viewKey} className={className}><Media /></div>
      case 'alarms':
        return <div key={viewKey} className={className}><Alarms /></div>
      default:
        return <div key={viewKey} className={className}><Clock /></div>
    }
  }

  return (
    <div className="app" ref={appRef}>
      <main className="main-content">
        {renderView()}
      </main>
      <Navigation activeView={activeView} onViewChange={handleViewChange} />
    </div>
  )
}

export default App
