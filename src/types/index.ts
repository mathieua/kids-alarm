export interface Track {
  id: string
  filename: string
  filepath: string
  title: string
  duration?: number
}

export interface PlaybackState {
  isPlaying: boolean
  currentTrack: Track | null
  position: number
  duration: number
  volume: number
  queue: Track[]
  queueIndex: number
}

export interface ElectronAPI {
  platform: string
  audio: {
    getState: () => Promise<PlaybackState>
    scanMedia: () => Promise<Track[]>
    play: (track?: Track) => Promise<void>
    pause: () => Promise<void>
    resume: () => Promise<void>
    togglePlayPause: () => Promise<void>
    stop: () => Promise<void>
    setVolume: (volume: number) => Promise<void>
    setQueue: (tracks: Track[], startIndex: number) => void
    next: () => Promise<void>
    previous: () => Promise<void>
    onStateChange: (callback: (state: PlaybackState) => void) => () => void
    onTrackEnded: (callback: () => void) => () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
