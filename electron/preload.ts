import { contextBridge, ipcRenderer } from 'electron'

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

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // Audio controls
  audio: {
    getState: (): Promise<PlaybackState> => ipcRenderer.invoke('audio:getState'),
    scanMedia: (): Promise<Track[]> => ipcRenderer.invoke('audio:scanMedia'),
    play: (track?: Track): Promise<void> => ipcRenderer.invoke('audio:play', track),
    pause: (): Promise<void> => ipcRenderer.invoke('audio:pause'),
    resume: (): Promise<void> => ipcRenderer.invoke('audio:resume'),
    togglePlayPause: (): Promise<void> => ipcRenderer.invoke('audio:togglePlayPause'),
    stop: (): Promise<void> => ipcRenderer.invoke('audio:stop'),
    setVolume: (volume: number): Promise<void> => ipcRenderer.invoke('audio:setVolume', volume),
    setQueue: (tracks: Track[], startIndex: number): void => {
      ipcRenderer.invoke('audio:setQueue', tracks, startIndex)
    },
    next: (): Promise<void> => ipcRenderer.invoke('audio:next'),
    previous: (): Promise<void> => ipcRenderer.invoke('audio:previous'),

    // Event listeners
    onStateChange: (callback: (state: PlaybackState) => void) => {
      const listener = (_: Electron.IpcRendererEvent, state: PlaybackState) => callback(state)
      ipcRenderer.on('audio:stateChange', listener)
      return () => ipcRenderer.removeListener('audio:stateChange', listener)
    },
    onTrackEnded: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('audio:trackEnded', listener)
      return () => ipcRenderer.removeListener('audio:trackEnded', listener)
    },
  },
})
