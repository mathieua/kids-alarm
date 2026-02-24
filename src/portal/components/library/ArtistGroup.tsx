import { useState } from 'react'
import type { MediaItem } from '../../types/portal.types'
import { TrackCard } from './TrackCard'

interface Props {
  artist: string
  tracks: MediaItem[]
  onDelete: (id: number) => void
  onUpdate: (id: number, patch: Partial<Pick<MediaItem, 'title' | 'artist' | 'category'>>) => void
}

export function ArtistGroup({ artist, tracks, onDelete, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={styles.group}>
      <button onClick={() => setExpanded(v => !v)} style={styles.header}>
        <span style={styles.arrow}>{expanded ? '▾' : '▸'}</span>
        <span style={styles.name}>{artist}</span>
        <span style={styles.count}>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
      </button>
      {expanded && (
        <div style={styles.tracks}>
          {tracks.map(track => (
            <TrackCard key={track.id} item={track} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  group: { marginBottom: 8 },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    background: '#181825',
    border: 'none',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  arrow: { color: '#a6adc8', fontSize: 14, width: 16 },
  name: { flex: 1, fontWeight: 600, color: '#cdd6f4', fontSize: 15 },
  count: { fontSize: 12, color: '#585b70' },
  tracks: { padding: '0 14px' },
}
