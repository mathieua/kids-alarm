import { useEffect, useRef, useCallback } from 'react'

type Handler = (payload: Record<string, unknown>) => void

interface WsMessage {
  event: string
  [key: string]: unknown
}

// Singleton WebSocket shared across hooks
let socket: WebSocket | null = null
const listeners: Map<string, Set<Handler>> = new Map()

function getSocket(): WebSocket {
  if (socket && socket.readyState !== WebSocket.CLOSED) return socket

  const wsUrl = `ws://${window.location.hostname}:3000`
  socket = new WebSocket(wsUrl)

  socket.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data as string) as WsMessage
      const { event, ...payload } = msg
      listeners.get(event)?.forEach(h => h(payload as Record<string, unknown>))
    } catch {
      // ignore malformed messages
    }
  })

  socket.addEventListener('close', () => {
    // Reconnect after 2 seconds
    setTimeout(() => { socket = null }, 2000)
  })

  return socket
}

export function useWebSocket(event: string, handler: Handler): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const stableHandler = useCallback((payload: Record<string, unknown>) => {
    handlerRef.current(payload)
  }, [])

  useEffect(() => {
    getSocket() // ensure connection

    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event)!.add(stableHandler)

    return () => {
      listeners.get(event)?.delete(stableHandler)
    }
  }, [event, stableHandler])
}
