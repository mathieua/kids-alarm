import type { ImportJob } from '../../types/portal.types'

interface Props {
  job: ImportJob
}

const statusLabel: Record<string, string> = {
  pending: 'Waiting...',
  downloading: 'Downloading audio...',
  converting: 'Converting to MP3...',
  complete: 'Complete!',
  error: 'Failed',
}

export function DownloadProgress({ job }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.label}>{statusLabel[job.status] ?? job.status}</div>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${job.progress_percent}%` }} />
      </div>
      <div style={styles.percent}>{job.progress_percent}%</div>
      <div style={styles.note}>You can navigate away — the import will continue in the background.</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 480 },
  label: { fontSize: 16, fontWeight: 600, color: '#cdd6f4', marginBottom: 12 },
  progressBar: { height: 8, background: '#313244', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', background: '#89b4fa', transition: 'width 0.3s ease' },
  percent: { fontSize: 13, color: '#a6adc8', marginBottom: 20 },
  note: { fontSize: 12, color: '#585b70' },
}
