import { Palette, Lang, Route, t, CORNER_RADIUS, SONG_GRADIENTS } from '../App'
import { useAudio } from '../hooks/useAudio'
import { CircleBtn, IconBack, IconMusic, IconPlay, IconPause, IconSkipBack, IconSkipFwd, Equalizer } from '../components/Icons'

interface MusicPlayerProps {
  palette: Palette
  lang: Lang
  onNavigate: (r: Route) => void
}

export function MusicPlayer({ palette, lang, onNavigate }: MusicPlayerProps) {
  const { tracks, isPlaying, currentTrack, playTrack, togglePlayPause, next, previous } = useAudio()
  const r = CORNER_RADIUS

  const currentIndex = currentTrack ? tracks.findIndex(t => t.id === currentTrack.id) : 0
  const artGradient = SONG_GRADIENTS[Math.max(0, currentIndex) % SONG_GRADIENTS.length]

  return (
    <div style={{
      width: 800, height: 480, background: palette.music,
      display: 'flex', flexDirection: 'column', padding: 24, gap: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <CircleBtn size={56} onClick={() => onNavigate('playlists')}><IconBack size={26} /></CircleBtn>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: 0 }}>{t(lang, 'myMusic')}</h1>
        <div style={{ width: 56 }} />
      </div>

      {/* Two-column body */}
      <div style={{ flex: 1, display: 'flex', gap: 22, overflow: 'hidden' }}>

        {/* Left — Now Playing */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {/* Album art */}
          <div style={{
            width: 168, height: 168, borderRadius: r,
            background: artGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 14px 38px rgba(0,0,0,0.28)',
            marginBottom: 16,
            transform: isPlaying ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}>
            <IconMusic size={62} stroke="rgba(255,255,255,0.85)" />
          </div>

          {/* Track info */}
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, textAlign: 'center', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTrack?.title ?? 'No track'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, margin: '4px 0 18px' }}>
            Kids Music
          </p>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CircleBtn size={56} onClick={previous}><IconSkipBack size={26} /></CircleBtn>
            <CircleBtn size={76} bg="#fff" color={palette.accentPlay} shadow="0 8px 24px rgba(0,0,0,0.25)" onClick={togglePlayPause}>
              {isPlaying
                ? <IconPause size={36} stroke={palette.accentPlay} />
                : <div style={{ transform: 'translateX(2px)' }}><IconPlay size={36} stroke={palette.accentPlay} /></div>
              }
            </CircleBtn>
            <CircleBtn size={56} onClick={next}><IconSkipFwd size={26} /></CircleBtn>
          </div>
        </div>

        {/* Right — Playlist */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderRadius: r, padding: 16,
          border: '1px solid rgba(255,255,255,0.16)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '2px 0 10px', letterSpacing: '0.02em', flexShrink: 0 }}>
            {t(lang, 'myMusic')}
          </h3>

          {tracks.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 15, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>No tracks yet</div>
                <div>Add music via the parent portal</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
              {tracks.map((track, index) => {
                const active = currentTrack?.id === track.id
                return (
                  <div key={track.id} onClick={() => playTrack(track)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                    borderRadius: r - 8, cursor: 'pointer', transition: 'background 0.15s',
                    background: active ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.10)',
                    border: active ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid transparent',
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: SONG_GRADIENTS[index % SONG_GRADIENTS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && isPlaying ? <Equalizer /> : <IconMusic size={22} stroke="#fff" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.title}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Kids Music
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
