import { useState } from 'react'
import type { MediaItem } from '../../types/portal.types'
import { TrackEditModal } from './TrackEditModal'

interface Props {
  item: MediaItem
  onDelete: (id: number) => void
  onUpdate: (id: number, patch: Partial<Pick<MediaItem, 'title' | 'artist' | 'category'>>) => void
}

function formatDuration(s: number): string {
  if (!s) return '--:--'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function TrackCard({ item, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [audioEl] = useState(() => typeof Audio !== 'undefined' ? new Audio() : null)
  const [playing, setPlaying] = useState(false)

  function togglePlay() {
    if (!audioEl) return
    if (playing) {
      audioEl.pause()
      setPlaying(false)
    } else {
      const filename = item.file_path.split('/').pop() ?? ''
      const category = item.category
      const artist = item.artist
      audioEl.src = `/media/${category}/${encodeURIComponent(artist)}/${encodeURIComponent(filename)}`
      audioEl.play().catch(console.error)
      audioEl.onended = () => setPlaying(false)
      setPlaying(true)
    }
  }

  function handleDelete() {
    if (confirm(`Delete "${item.title}"?`)) {
      if (playing && audioEl) { audioEl.pause(); setPlaying(false) }
      onDelete(item.id)
    }
  }

  const thumbnailSrc = item.thumbnail_url
    ? item.thumbnail_url.startsWith('/') ? item.thumbnail_url : `/media/.thumbnails/${item.thumbnail_url}`
    : null

  return (
    <div style={styles.card}>
      <div style={{ ...styles.thumb, background: thumbnailSrc ? 'transparent' : categoryColor(item.category) }}>
        {thumbnailSrc
          ? <img src={thumbnailSrc} alt="" style={styles.thumbImg} />
          : <span style={styles.thumbInitial}>{item.title[0]?.toUpperCase()}</span>
        }
      </div>
      <div style={styles.info}>
        <div style={styles.title}>{item.title}</div>
        <div style={styles.meta}>{item.artist} · {formatDuration(item.duration_seconds)}</div>
      </div>
      <div style={styles.actions}>
        {item.source_url && <span style={styles.ytBadge}>YT</span>}
        <button onClick={togglePlay} style={styles.btn} title={playing ? 'Pause' : 'Play'}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => setEditing(true)} style={styles.btn} title="Edit">✏️</button>
        <button onClick={handleDelete} style={{ ...styles.btn, color: '#f38ba8' }} title="Delete">🗑</button>
      </div>
      {editing && (
        <TrackEditModal
          item={item}
          onSave={patch => { onUpdate(item.id, patch); setEditing(false) }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

function categoryColor(cat: string): string {
  const colors: Record<string, string> = {
    lullabies: '#45475a',
    music: '#313244',
    audiobooks: '#3d3d52',
  }
  return colors[cat] ?? '#313244'
}

const styles: Record<string, React.CSSProperties> = {
  card: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #313244' },
  thumb: { width: 44, height: 44, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbInitial: { fontSize: 18, color: '#cdd6f4', fontWeight: 700 },
  info: { flex: 1, minWidth: 0 },
  title: { fontWeight: 600, fontSize: 14, color: '#cdd6f4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { fontSize: 12, color: '#a6adc8', marginTop: 2 },
  actions: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  ytBadge: { fontSize: 10, background: '#f38ba8', color: '#1e1e2e', borderRadius: 3, padding: '1px 4px', fontWeight: 700 },
  btn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 16, color: '#a6adc8', borderRadius: 4 },
}
