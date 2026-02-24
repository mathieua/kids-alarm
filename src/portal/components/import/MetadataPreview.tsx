import { useState } from 'react'
import type { YoutubePrefetch, Category } from '../../types/portal.types'

interface Props {
  data: YoutubePrefetch
  sourceUrl: string
  onImport: (params: { url: string; title: string; artist: string; category: Category }) => void
  onCancel: () => void
}

const CATEGORIES: Category[] = ['lullabies', 'music', 'audiobooks']

function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function MetadataPreview({ data, sourceUrl, onImport, onCancel }: Props) {
  const [title, setTitle] = useState(data.title)
  const [artist, setArtist] = useState(data.artist)
  const [category, setCategory] = useState<Category>('music')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onImport({ url: sourceUrl, title, artist, category })
  }

  return (
    <div style={styles.container}>
      <div style={styles.preview}>
        {data.thumbnailUrl && (
          <img src={data.thumbnailUrl} alt="" style={styles.thumbnail} />
        )}
        <div style={styles.duration}>Duration: {formatDuration(data.durationSeconds)}</div>
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Title
          <input value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
        </label>
        <label style={styles.label}>Artist
          <input value={artist} onChange={e => setArtist(e.target.value)} style={styles.input} required />
        </label>
        <label style={styles.label}>Category
          <select value={category} onChange={e => setCategory(e.target.value as Category)} style={styles.input}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
          <button type="submit" style={styles.importBtn}>Import</button>
        </div>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', gap: 32, flexWrap: 'wrap', maxWidth: 700 },
  preview: { flexShrink: 0 },
  thumbnail: { width: 240, borderRadius: 8, display: 'block', marginBottom: 8 },
  duration: { fontSize: 13, color: '#a6adc8' },
  form: { flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#a6adc8' },
  input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', fontSize: 14 },
  actions: { display: 'flex', gap: 8, marginTop: 8 },
  cancelBtn: { padding: '8px 16px', borderRadius: 6, border: '1px solid #45475a', background: 'none', color: '#a6adc8', cursor: 'pointer', fontSize: 14 },
  importBtn: { padding: '8px 24px', borderRadius: 6, border: 'none', background: '#a6e3a1', color: '#1e1e2e', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}
