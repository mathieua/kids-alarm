import { EventEmitter } from 'events'
import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

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

export class AudioService extends EventEmitter {
  private player: ChildProcess | null = null
  private state: PlaybackState = {
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 70,
    queue: [],
    queueIndex: -1,
  }
  private positionInterval: NodeJS.Timeout | null = null
  private mediaDir: string

  constructor(mediaDir: string) {
    super()
    this.mediaDir = mediaDir
  }

  getState(): PlaybackState {
    return { ...this.state }
  }

  async scanMedia(): Promise<Track[]> {
    const tracks: Track[] = []
    const audioExtensions = ['.mp3', '.m4a', '.ogg', '.wav', '.flac']
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        return
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true })
      const files = entries.filter(e => !e.isDirectory()).map(e => e.name)

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanDir(fullPath)
        } else if (audioExtensions.includes(path.extname(entry.name).toLowerCase())) {
          const filename = entry.name
          const title = path.basename(filename, path.extname(filename))

          // Look for matching artwork
          const artwork = this.findArtwork(dir, title, files, imageExtensions)

          tracks.push({
            id: Buffer.from(fullPath).toString('base64'),
            filename,
            filepath: fullPath,
            title,
            artwork,
          })
        }
      }
    }

    scanDir(this.mediaDir)
    return tracks
  }

  private findArtwork(dir: string, title: string, files: string[], imageExtensions: string[]): string | undefined {
    const titleLower = title.toLowerCase()

    // First, try exact match (same name, different extension)
    for (const ext of imageExtensions) {
      const exactMatch = files.find(f => f.toLowerCase() === titleLower + ext)
      if (exactMatch) {
        return path.join(dir, exactMatch)
      }
    }

    // Then try partial match (artwork filename contains track title or vice versa)
    for (const file of files) {
      const fileLower = file.toLowerCase()
      const fileBase = path.basename(fileLower, path.extname(fileLower))
      if (imageExtensions.includes(path.extname(fileLower))) {
        if (fileBase.includes(titleLower.substring(0, 10)) || titleLower.includes(fileBase.substring(0, 10))) {
          return path.join(dir, file)
        }
      }
    }

    return undefined
  }

  async play(track?: Track): Promise<void> {
    if (track) {
      // Stop current playback
      await this.stop()

      this.state.currentTrack = track
      this.state.position = 0
    }

    if (!this.state.currentTrack) {
      return
    }

    // Use ffplay (comes with ffmpeg) for playback
    // -nodisp: no video window
    // -autoexit: exit when done
    // -loglevel quiet: suppress output
    // Volume is controlled via ALSA mixer, not ffplay
    this.player = spawn('ffplay', [
      '-nodisp',
      '-autoexit',
      '-loglevel', 'quiet',
      this.state.currentTrack.filepath,
    ])

    this.state.isPlaying = true
    this.emit('stateChange', this.getState())

    // Track position (approximate since ffplay doesn't report it easily)
    this.startPositionTracking()

    this.player.on('close', (code) => {
      this.stopPositionTracking()
      if (code === 0) {
        // Track finished naturally
        this.state.isPlaying = false
        this.state.position = 0
        this.emit('stateChange', this.getState())
        this.emit('trackEnded')

        // Auto-play next if in queue
        this.playNext()
      }
    })

    this.player.on('error', (err) => {
      console.error('Audio player error:', err)
      this.state.isPlaying = false
      this.emit('stateChange', this.getState())
    })
  }

  async pause(): Promise<void> {
    if (this.player && this.state.isPlaying) {
      this.player.kill('SIGSTOP')
      this.state.isPlaying = false
      this.stopPositionTracking()
      this.emit('stateChange', this.getState())
    }
  }

  async resume(): Promise<void> {
    if (this.player && !this.state.isPlaying) {
      this.player.kill('SIGCONT')
      this.state.isPlaying = true
      this.startPositionTracking()
      this.emit('stateChange', this.getState())
    }
  }

  async togglePlayPause(): Promise<void> {
    if (this.state.isPlaying) {
      await this.pause()
    } else if (this.player) {
      await this.resume()
    } else if (this.state.currentTrack) {
      await this.play()
    }
  }

  async stop(): Promise<void> {
    if (this.player) {
      this.player.kill('SIGKILL')
      this.player = null
    }
    this.state.isPlaying = false
    this.state.position = 0
    this.stopPositionTracking()
    this.emit('stateChange', this.getState())
  }

  async setVolume(volume: number): Promise<void> {
    this.state.volume = Math.max(0, Math.min(100, volume))

    // Use ALSA mixer for immediate volume control
    try {
      spawn('amixer', ['-c', 'USB', 'sset', 'PCM', `${volume}%`], {
        stdio: 'ignore',
      })
    } catch (err) {
      console.error('Failed to set volume:', err)
    }

    this.emit('stateChange', this.getState())
  }

  setQueue(tracks: Track[], startIndex: number = 0): void {
    this.state.queue = tracks
    this.state.queueIndex = startIndex
    if (tracks.length > 0 && startIndex < tracks.length) {
      this.play(tracks[startIndex])
    }
  }

  async playNext(): Promise<void> {
    if (this.state.queue.length === 0) return

    const nextIndex = this.state.queueIndex + 1
    if (nextIndex < this.state.queue.length) {
      this.state.queueIndex = nextIndex
      await this.play(this.state.queue[nextIndex])
    }
  }

  async playPrevious(): Promise<void> {
    if (this.state.queue.length === 0) return

    // If more than 3 seconds in, restart current track
    if (this.state.position > 3) {
      await this.play(this.state.currentTrack!)
      return
    }

    const prevIndex = this.state.queueIndex - 1
    if (prevIndex >= 0) {
      this.state.queueIndex = prevIndex
      await this.play(this.state.queue[prevIndex])
    }
  }

  private startPositionTracking(): void {
    this.stopPositionTracking()
    this.positionInterval = setInterval(() => {
      if (this.state.isPlaying) {
        this.state.position += 1
        this.emit('stateChange', this.getState())
      }
    }, 1000)
  }

  private stopPositionTracking(): void {
    if (this.positionInterval) {
      clearInterval(this.positionInterval)
      this.positionInterval = null
    }
  }
}
