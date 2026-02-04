import { Track } from '../types'

interface TrackListProps {
  tracks: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  onTrackSelect: (track: Track) => void
}

function getArtworkUrl(artwork?: string): string | undefined {
  if (!artwork) return undefined
  return `media://${encodeURIComponent(artwork)}`
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
        const artworkUrl = getArtworkUrl(track.artwork)
        return (
          <button
            key={track.id}
            className={`track-item ${isCurrentTrack ? 'active' : ''}`}
            onClick={() => onTrackSelect(track)}
          >
            <div className="track-artwork">
              {artworkUrl ? (
                <img src={artworkUrl} alt="" />
              ) : (
                <span className="track-icon">♪</span>
              )}
              {isCurrentTrack && isPlaying && (
                <span className="playing-indicator">▶</span>
              )}
            </div>
            <span className="track-title">{track.title}</span>
          </button>
        )
      })}
    </div>
  )
}
