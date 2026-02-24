import { contextBridge, ipcRenderer } from 'electron'

export interface Track {
  id: string
  filename: string
  filepath: string
  title: string
  artwork?: string
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

  // Alarm controls
  alarm: {
    getAlarm: () => ipcRenderer.invoke('alarm:getAlarm'),
    setAlarm: (time: string, enabled: boolean, soundPath?: string | null) => ipcRenderer.invoke('alarm:setAlarm', time, enabled, soundPath),
    snooze: () => ipcRenderer.invoke('alarm:snooze'),
    dismiss: () => ipcRenderer.invoke('alarm:dismiss'),
    onFired: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('alarm:fired', listener)
      return () => ipcRenderer.removeListener('alarm:fired', listener)
    },
    onDismissed: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('alarm:dismissed', listener)
      return () => ipcRenderer.removeListener('alarm:dismissed', listener)
    },
    onUpdated: (callback: (alarm: unknown) => void) => {
      const listener = (_: Electron.IpcRendererEvent, alarm: unknown) => callback(alarm)
      ipcRenderer.on('alarm:updated', listener)
      return () => ipcRenderer.removeListener('alarm:updated', listener)
    },
  },

  // Sync controls
  sync: {
    getDevice: () => ipcRenderer.invoke('sync:getDevice'),
    getDiff: () => ipcRenderer.invoke('sync:getDiff'),
    startSync: (deleteOrphans: string[]) => ipcRenderer.invoke('sync:startSync', deleteOrphans),
    eject: () => ipcRenderer.invoke('sync:eject'),
    onEvent: (callback: (event: string, payload: unknown) => void) => {
      const listener = (_: Electron.IpcRendererEvent, data: { event: string; payload: unknown }) => {
        callback(data.event, data.payload)
      }
      ipcRenderer.on('sync:event', listener)
      return () => ipcRenderer.removeListener('sync:event', listener)
    },
  },
})
