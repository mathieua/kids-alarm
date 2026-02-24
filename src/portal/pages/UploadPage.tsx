import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUpload } from '../hooks/useUpload'
import { DropZone } from '../components/upload/DropZone'
import { UploadForm } from '../components/upload/UploadForm'
import type { MediaItem, Category } from '../types/portal.types'

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [done, setDone] = useState<MediaItem | null>(null)
  const { upload, progress, isUploading, error } = useUpload()

  async function handleUpload(meta: { title: string; artist: string; category: Category }) {
    if (!file) return
    const item = await upload(file, meta)
    setDone(item)
  }

  function reset() {
    setFile(null)
    setDone(null)
  }

  if (done) {
    return (
      <div>
        <h1 style={styles.heading}>Upload Complete</h1>
        <p style={styles.success}>"{done.title}" has been added to your library.</p>
        <div style={styles.actions}>
          <Link to="/portal" style={styles.libraryLink}>View in Library</Link>
          <button onClick={reset} style={styles.againBtn}>Upload Another</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={styles.heading}>Upload MP3</h1>
      {!file ? (
        <>
          <p style={styles.sub}>Upload an MP3 file to add it to your media library.</p>
          <DropZone onFile={setFile} />
        </>
      ) : (
        <>
          <UploadForm
            filename={file.name}
            onSubmit={handleUpload}
            onCancel={() => setFile(null)}
            isUploading={isUploading}
            progress={progress}
          />
          {error && <div style={styles.error}>{error}</div>}
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: '#cdd6f4' },
  sub: { color: '#a6adc8', marginBottom: 24, fontSize: 14 },
  success: { color: '#a6e3a1', fontSize: 16, marginBottom: 24 },
  actions: { display: 'flex', gap: 12 },
  libraryLink: { padding: '10px 20px', background: '#cba6f7', color: '#1e1e2e', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 },
  againBtn: { padding: '10px 20px', background: 'none', border: '1px solid #45475a', color: '#a6adc8', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  error: { marginTop: 16, padding: '10px 14px', background: '#2a1520', border: '1px solid #f38ba8', borderRadius: 8, color: '#f38ba8', fontSize: 14 },
}
