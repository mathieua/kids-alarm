import { Track } from '../types'

interface PlaybackControlsProps {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  onTogglePlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onVolumeChange: (volume: number) => void
}

export function PlaybackControls({
  currentTrack,
  isPlaying,
  volume,
  onTogglePlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
}: PlaybackControlsProps) {
  return (
    <div className="playback-controls">
      <div className="now-playing-info">
        {currentTrack ? (
          <span className="current-track-title">{currentTrack.title}</span>
        ) : (
          <span className="no-track">No track selected</span>
        )}
      </div>

      <div className="control-buttons">
        <button
          className="control-button"
          onClick={onPrevious}
          disabled={!currentTrack}
        >
          ⏮
        </button>
        <button
          className="control-button play-pause"
          onClick={onTogglePlayPause}
          disabled={!currentTrack}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="control-button"
          onClick={onNext}
          disabled={!currentTrack}
        >
          ⏭
        </button>
      </div>

      <div className="volume-control">
        <span className="volume-icon">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="volume-slider"
        />
        <span className="volume-value">{volume}</span>
      </div>
    </div>
  )
}
