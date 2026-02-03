import { Track } from '../types'

interface TrackListProps {
  tracks: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  onTrackSelect: (track: Track) => void
}

export function TrackList({ tracks, currentTrack, isPlaying, onTrackSelect }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="track-list-empty">
        <p>No music found</p>
        <p className="hint">Add MP3 files to ~/alarm-clock/media</p>
      </div>
    )
  }

  return (
    <div className="track-list">
      {tracks.map((track) => {
        const isCurrentTrack = currentTrack?.id === track.id
        return (
          <button
            key={track.id}
            className={`track-item ${isCurrentTrack ? 'active' : ''}`}
            onClick={() => onTrackSelect(track)}
          >
            <span className="track-icon">
              {isCurrentTrack && isPlaying ? '▶' : '♪'}
            </span>
            <span className="track-title">{track.title}</span>
          </button>
        )
      })}
    </div>
  )
}
