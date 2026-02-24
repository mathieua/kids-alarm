import { useState } from 'react'
import type { Category } from '../../types/portal.types'

interface Props {
  filename: string
  onSubmit: (meta: { title: string; artist: string; category: Category }) => void
  onCancel: () => void
  isUploading: boolean
  progress: number
}

const CATEGORIES: Category[] = ['lullabies', 'music', 'audiobooks']

function deslugify(name: string): string {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function UploadForm({ filename, onSubmit, onCancel, isUploading, progress }: Props) {
  const defaultTitle = deslugify(filename.replace(/\.mp3$/i, ''))
  const [title, setTitle] = useState(defaultTitle)
  const [artist, setArtist] = useState('')
  const [category, setCategory] = useState<Category>('music')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ title, artist, category })
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.file}>{filename}</div>
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
      {isUploading && (
        <div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <div style={styles.progressLabel}>{progress}%</div>
        </div>
      )}
      <div style={styles.actions}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn} disabled={isUploading}>Cancel</button>
        <button type="submit" style={styles.uploadBtn} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 },
  file: { fontSize: 13, color: '#585b70', background: '#181825', padding: '6px 10px', borderRadius: 6 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#a6adc8' },
  input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', fontSize: 14 },
  progressBar: { height: 6, background: '#313244', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', background: '#a6e3a1', transition: 'width 0.2s ease' },
  progressLabel: { fontSize: 12, color: '#a6adc8' },
  actions: { display: 'flex', gap: 8, marginTop: 8 },
  cancelBtn: { padding: '8px 16px', borderRadius: 6, border: '1px solid #45475a', background: 'none', color: '#a6adc8', cursor: 'pointer', fontSize: 14 },
  uploadBtn: { padding: '8px 24px', borderRadius: 6, border: 'none', background: '#a6e3a1', color: '#1e1e2e', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}
