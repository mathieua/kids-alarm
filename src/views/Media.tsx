import { TrackList } from '../components/TrackList'
import { PlaybackControls } from '../components/PlaybackControls'
import { useAudio } from '../hooks/useAudio'

export function Media() {
  const {
    tracks,
    isLoading,
    currentTrack,
    isPlaying,
    volume,
    playTrack,
    togglePlayPause,
    next,
    previous,
    setVolume,
  } = useAudio()

  if (isLoading) {
    return (
      <div className="media-view">
        <div className="loading">Loading media...</div>
      </div>
    )
  }

  return (
    <div className="media-view">
      <TrackList
        tracks={tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTrackSelect={playTrack}
      />
      <PlaybackControls
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        volume={volume}
        onTogglePlayPause={togglePlayPause}
        onNext={next}
        onPrevious={previous}
        onVolumeChange={setVolume}
      />
    </div>
  )
}
