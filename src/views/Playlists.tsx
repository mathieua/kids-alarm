import { Palette, Lang, Route, t, CORNER_RADIUS, SONG_GRADIENTS } from '../App'
import { useAudio } from '../hooks/useAudio'
import { CircleBtn, IconBack, IconChevronRight } from '../components/Icons'

interface PlaylistsProps {
  palette: Palette
  lang: Lang
  onNavigate: (r: Route) => void
}

const STATIC_PLAYLISTS = [
  { id: 'wakeup',    title: 'Wake Up',     subtitle: 'Morning energy', cover: 'linear-gradient(135deg, #fbbf24, #fb923c)', emoji: '☀️' },
  { id: 'adventure', title: 'Adventure',   subtitle: 'Big and bold',   cover: 'linear-gradient(135deg, #4ade80, #2dd4bf)', emoji: '🚀' },
  { id: 'calm',      title: 'Calm Down',   subtitle: 'Quiet time',     cover: 'linear-gradient(135deg, #60a5fa, #a78bfa)', emoji: '🌙' },
  { id: 'dance',     title: 'Dance Party', subtitle: 'Wiggle time',    cover: 'linear-gradient(135deg, #f472b6, #f87171)', emoji: '🎉' },
]

export function Playlists({ palette, lang, onNavigate }: PlaylistsProps) {
  const { tracks } = useAudio()
  const r = CORNER_RADIUS

  // One real "My Music" playlist + static ones for categorisation
  const myMusicCount = tracks.length
  const allPlaylists = [
    {
      id: 'mymusic',
      title: t(lang, 'myMusic'),
      subtitle: t(lang, 'allTracks'),
      cover: SONG_GRADIENTS[2],
      emoji: '🎵',
      count: myMusicCount,
    },
    ...STATIC_PLAYLISTS.map(p => ({ ...p, count: 4 })),
  ]

  return (
    <div style={{
      width: 800, height: 480, background: palette.music,
      display: 'flex', flexDirection: 'column', padding: 24, gap: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <CircleBtn size={56} onClick={() => onNavigate('clock')}><IconBack size={26} /></CircleBtn>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>{t(lang, 'playlists')}</h1>
        <div style={{ width: 56 }} />
      </div>

      {/* List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 4 }}>
        {allPlaylists.map(p => (
          <button key={p.id}
            onClick={() => onNavigate('music')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: r, padding: 14,
              display: 'flex', alignItems: 'center', gap: 16,
              cursor: 'pointer', textAlign: 'left', color: '#fff',
              transition: 'transform 0.12s ease, background 0.15s',
              flexShrink: 0, fontFamily: 'inherit',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{
              width: 72, height: 72, borderRadius: r - 10, background: p.cover,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: '0 8px 22px rgba(0,0,0,0.22)', flexShrink: 0,
            }}>{p.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.85 }}>
                {p.subtitle} · {p.count} {t(lang, 'songs')}
              </div>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IconChevronRight size={22} stroke="#fff" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
