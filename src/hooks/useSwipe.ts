import { useRef, useCallback, useEffect } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipe(
  ref: React.RefObject<HTMLElement>,
  { onSwipeLeft, onSwipeRight }: SwipeHandlers
) {
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const minSwipeDistance = 50

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return
    }

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const deltaX = touchEndX - touchStartX.current
    const deltaY = touchEndY - touchStartY.current

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }, [onSwipeLeft, onSwipeRight])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, handleTouchStart, handleTouchEnd])
}
