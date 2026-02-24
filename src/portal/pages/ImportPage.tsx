import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useYoutubeImport } from '../hooks/useYoutubeImport'
import { UrlInput } from '../components/import/UrlInput'
import { MetadataPreview } from '../components/import/MetadataPreview'
import { DownloadProgress } from '../components/import/DownloadProgress'
import type { Category } from '../types/portal.types'

export function ImportPage() {
  const { stage, prefetchData, activeJob, prefetch, startImport, reset, error } = useYoutubeImport()
  const [sourceUrl, setSourceUrl] = useState('')

  function handleFetch(url: string) {
    setSourceUrl(url)
    prefetch(url)
  }

  return (
    <div>
      <h1 style={styles.heading}>Import from YouTube</h1>

      {(stage === 'idle' || stage === 'fetching' || stage === 'error') && (
        <>
          <p style={styles.sub}>Paste a YouTube URL to import the audio as MP3.</p>
          <UrlInput onFetch={handleFetch} isLoading={stage === 'fetching'} />
          {error && stage === 'error' && (
            <div style={styles.error}>{error}</div>
          )}
        </>
      )}

      {stage === 'preview' && prefetchData && (
        <>
          <div style={styles.stepLabel}>Step 2 — Confirm details</div>
          <MetadataPreview
            data={prefetchData}
            sourceUrl={sourceUrl}
            onImport={(params) => startImport(params as { url: string; title: string; artist: string; category: Category })}
            onCancel={reset}
          />
        </>
      )}

      {(stage === 'importing' || stage === 'done') && activeJob && (
        <>
          <div style={styles.stepLabel}>
            {stage === 'done' ? 'Import complete!' : 'Step 3 — Importing...'}
          </div>
          <DownloadProgress job={activeJob} />
          {stage === 'done' && (
            <div style={styles.doneActions}>
              <Link to="/portal" style={styles.libraryLink}>View in Library</Link>
              <button onClick={reset} style={styles.againBtn}>Import Another</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: '#cdd6f4' },
  sub: { color: '#a6adc8', marginBottom: 24, fontSize: 14 },
  stepLabel: { fontSize: 13, color: '#585b70', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  error: { marginTop: 12, padding: '10px 14px', background: '#2a1520', border: '1px solid #f38ba8', borderRadius: 8, color: '#f38ba8', fontSize: 14 },
  doneActions: { display: 'flex', gap: 12, marginTop: 24 },
  libraryLink: { padding: '10px 20px', background: '#cba6f7', color: '#1e1e2e', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 },
  againBtn: { padding: '10px 20px', background: 'none', border: '1px solid #45475a', color: '#a6adc8', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
}
