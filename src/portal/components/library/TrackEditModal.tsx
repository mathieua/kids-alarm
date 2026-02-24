import { useState } from 'react'
import type { MediaItem, Category } from '../../types/portal.types'

interface Props {
  item: MediaItem
  onSave: (patch: Partial<Pick<MediaItem, 'title' | 'artist' | 'category'>>) => void
  onClose: () => void
}

const CATEGORIES: Category[] = ['lullabies', 'music', 'audiobooks']

export function TrackEditModal({ item, onSave, onClose }: Props) {
  const [title, setTitle] = useState(item.title)
  const [artist, setArtist] = useState(item.artist)
  const [category, setCategory] = useState<Category>(item.category)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ title, artist, category })
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>Edit Track</div>
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
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.saveBtn}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#181825', borderRadius: 12, padding: 24, width: 400, border: '1px solid #313244' },
  header: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#cdd6f4' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#a6adc8' },
  input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #45475a', background: '#1e1e2e', color: '#cdd6f4', fontSize: 14 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  cancelBtn: { padding: '8px 16px', borderRadius: 6, border: '1px solid #45475a', background: 'none', color: '#a6adc8', cursor: 'pointer', fontSize: 14 },
  saveBtn: { padding: '8px 20px', borderRadius: 6, border: 'none', background: '#cba6f7', color: '#1e1e2e', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}
