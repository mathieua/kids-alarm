import { useState, useEffect, useCallback } from 'react'
import { Track, PlaybackState } from '../types'

const initialState: PlaybackState = {
  isPlaying: false,
  currentTrack: null,
  position: 0,
  duration: 0,
  volume: 70,
  queue: [],
  queueIndex: -1,
}

export function useAudio() {
  const [state, setState] = useState<PlaybackState>(initialState)
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial state
    window.electronAPI.audio.getState().then(setState)

    // Scan for media files
    window.electronAPI.audio.scanMedia().then((scannedTracks) => {
      setTracks(scannedTracks)
      setIsLoading(false)
    })

    // Subscribe to state changes
    const unsubscribe = window.electronAPI.audio.onStateChange((newState) => {
      setState(newState)
    })

    return unsubscribe
  }, [])

  const play = useCallback((track?: Track) => {
    return window.electronAPI.audio.play(track)
  }, [])

  const pause = useCallback(() => {
    return window.electronAPI.audio.pause()
  }, [])

  const resume = useCallback(() => {
    return window.electronAPI.audio.resume()
  }, [])

  const togglePlayPause = useCallback(() => {
    return window.electronAPI.audio.togglePlayPause()
  }, [])

  const stop = useCallback(() => {
    return window.electronAPI.audio.stop()
  }, [])

  const setVolume = useCallback((volume: number) => {
    return window.electronAPI.audio.setVolume(volume)
  }, [])

  const playTrack = useCallback((track: Track) => {
    // Set up queue with all tracks, starting at the selected one
    const index = tracks.findIndex((t) => t.id === track.id)
    window.electronAPI.audio.setQueue(tracks, index >= 0 ? index : 0)
  }, [tracks])

  const next = useCallback(() => {
    return window.electronAPI.audio.next()
  }, [])

  const previous = useCallback(() => {
    return window.electronAPI.audio.previous()
  }, [])

  const rescan = useCallback(async () => {
    setIsLoading(true)
    const scannedTracks = await window.electronAPI.audio.scanMedia()
    setTracks(scannedTracks)
    setIsLoading(false)
  }, [])

  return {
    ...state,
    tracks,
    isLoading,
    play,
    pause,
    resume,
    togglePlayPause,
    stop,
    setVolume,
    playTrack,
    next,
    previous,
    rescan,
  }
}
