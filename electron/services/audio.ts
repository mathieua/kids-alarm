import { EventEmitter } from 'events'
import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

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
    const extensions = ['.mp3', '.m4a', '.ogg', '.wav', '.flac']

    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        return
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanDir(fullPath)
        } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
          const filename = entry.name
          const title = path.basename(filename, path.extname(filename))
          tracks.push({
            id: Buffer.from(fullPath).toString('base64'),
            filename,
            filepath: fullPath,
            title,
          })
        }
      }
    }

    scanDir(this.mediaDir)
    return tracks
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
    this.player = spawn('ffplay', [
      '-nodisp',
      '-autoexit',
      '-loglevel', 'quiet',
      '-volume', String(this.state.volume),
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
    // ffplay doesn't support runtime volume change, will apply on next track
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
