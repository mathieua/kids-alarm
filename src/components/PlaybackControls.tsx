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

function getArtworkUrl(artwork?: string): string | undefined {
  if (!artwork) return undefined
  return `media://${encodeURIComponent(artwork)}`
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
  const artworkUrl = getArtworkUrl(currentTrack?.artwork)

  return (
    <div className="playback-controls">
      <div className="now-playing">
        <div className="now-playing-artwork">
          {artworkUrl ? (
            <img src={artworkUrl} alt="" />
          ) : (
            <span className="artwork-placeholder">♪</span>
          )}
        </div>
        <div className="now-playing-info">
          {currentTrack ? (
            <span className="current-track-title">{currentTrack.title}</span>
          ) : (
            <span className="no-track">No track selected</span>
          )}
        </div>
      </div>

      <div className="controls-row">
        <div className="control-buttons">
          <button
            className="control-button"
            onClick={onPrevious}
            disabled={!currentTrack}
          >
            ◀◀
          </button>
          <button
            className="control-button play-pause"
            onClick={onTogglePlayPause}
            disabled={!currentTrack}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            className="control-button"
            onClick={onNext}
            disabled={!currentTrack}
          >
            ▶▶
          </button>
        </div>

        <div className="volume-control">
          <svg className="volume-icon" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  )
}
