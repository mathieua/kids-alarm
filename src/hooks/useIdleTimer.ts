import { useState, useEffect, useCallback, useRef } from 'react'

export function useIdleTimer(timeoutMs: number = 30000) {
  const [isIdle, setIsIdle] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isIdleRef = useRef(false)

  const startTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      isIdleRef.current = true
      setIsIdle(true)
    }, timeoutMs)
  }, [timeoutMs])

  const handleActivity = useCallback(() => {
    // Only reset if not already idle - when idle, we want explicit wake
    if (!isIdleRef.current) {
      startTimer()
    }
  }, [startTimer])

  const wake = useCallback(() => {
    isIdleRef.current = false
    setIsIdle(false)
    startTimer()
  }, [startTimer])

  useEffect(() => {
    const events = ['mousedown', 'touchstart', 'keydown']

    // Start the timer
    startTimer()

    // Reset on any interaction
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [startTimer, handleActivity])

  return { isIdle, wake }
}
