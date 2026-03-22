import { useAudio } from '../hooks/useAudio'

// Gradient colors for track icons
const TRACK_GRADIENTS = [
  'linear-gradient(135deg, #fdc700 0%, #ff8904 100%)',
  'linear-gradient(135deg, #05df72 0%, #00d5be 100%)',
  'linear-gradient(135deg, #51a2ff 0%, #c27aff 100%)',
  'linear-gradient(135deg, #fb64b6 0%, #ff6467 100%)',
]

interface MediaProps {
  onNavigate?: (view: string) => void
}

export function Media({ onNavigate }: MediaProps) {
  const {
    tracks,
    isLoading,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    next,
    previous,
  } = useAudio()

  if (isLoading) {
    return (
      <div className="media-view-new">
        <div className="media-loading">Loading media...</div>
      </div>
    )
  }

  const currentIndex = currentTrack ? tracks.findIndex(t => t.id === currentTrack.id) : 0
  const currentGradient = TRACK_GRADIENTS[currentIndex % TRACK_GRADIENTS.length]

  return (
    <div className="media-view-new">
      {/* Header */}
      <div className="media-header">
        <button className="media-back-btn" onClick={() => onNavigate?.('clock')} aria-label="Back">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="media-title">Music Player</h1>
      </div>

      {/* Content */}
      <div className="media-content">
        {/* Now Playing Section */}
        <div className="media-now-playing">
          <div className="media-artwork" style={{ background: currentGradient }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V5L21 3V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="media-track-title">{currentTrack?.title || 'No Track Selected'}</h2>
          <p className="media-track-artist">Kids Music</p>

          {/* Controls */}
          <div className="media-controls">
            <button className="media-control-btn" onClick={previous} aria-label="Previous">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 20L9 12L19 4V20Z" fill="white"/>
                <rect x="5" y="4" width="2" height="16" fill="white"/>
              </svg>
            </button>
            <button className="media-play-btn" onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="#8B5CF6"/>
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="#8B5CF6"/>
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" fill="#8B5CF6"/>
                </svg>
              )}
            </button>
            <button className="media-control-btn" onClick={next} aria-label="Next">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4L15 12L5 20V4Z" fill="white"/>
                <rect x="17" y="4" width="2" height="16" fill="white"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="media-playlist">
          <h3 className="media-playlist-title">Playlist</h3>
          <div className="media-playlist-items">
            {tracks.length === 0 ? (
              <div className="media-playlist-empty">
                <p>No tracks found</p>
                <p className="media-playlist-hint">Add music via USB sync</p>
              </div>
            ) : (
              tracks.map((track, index) => (
                <button
                  key={track.id}
                  className={`media-playlist-item ${currentTrack?.id === track.id ? 'media-playlist-item--active' : ''}`}
                  onClick={() => playTrack(track)}
                >
                  <div
                    className="media-playlist-icon"
                    style={{ background: TRACK_GRADIENTS[index % TRACK_GRADIENTS.length] }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18V5L21 3V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
                      <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="media-playlist-info">
                    <span className="media-playlist-item-title">{track.title}</span>
                    <span className="media-playlist-item-artist">Kids Music</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
