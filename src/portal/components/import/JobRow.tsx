import type { ImportJob } from '../../types/portal.types'

interface Props {
  job: ImportJob
}

export function JobRow({ job }: Props) {
  const statusColor: Record<string, string> = {
    pending: '#a6adc8',
    downloading: '#89b4fa',
    converting: '#f9e2af',
    complete: '#a6e3a1',
    error: '#f38ba8',
  }

  return (
    <div style={styles.row}>
      <div style={styles.url}>{job.youtube_url.replace('https://www.youtube.com/watch?v=', 'youtu.be/')}</div>
      <div style={{ ...styles.status, color: statusColor[job.status] ?? '#a6adc8' }}>
        {job.status}
      </div>
      {(job.status === 'downloading' || job.status === 'converting') && (
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${job.progress_percent}%` }} />
        </div>
      )}
      {job.status === 'error' && (
        <div style={styles.error}>{job.error_message}</div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  row: { padding: '10px 0', borderBottom: '1px solid #313244' },
  url: { fontSize: 12, color: '#a6adc8', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  status: { fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' },
  progressBar: { height: 4, background: '#313244', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#89b4fa', transition: 'width 0.3s ease' },
  error: { fontSize: 11, color: '#f38ba8', marginTop: 4 },
}
