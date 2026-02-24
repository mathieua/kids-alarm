import { useImportJobs } from '../../hooks/useImportJobs'
import { JobRow } from './JobRow'

export function JobsPanel() {
  const { jobs, isOpen } = useImportJobs()

  if (!isOpen) return null

  return (
    <div style={styles.panel}>
      <div style={styles.header}>Recent Imports</div>
      <div style={styles.list}>
        {jobs.length === 0 && <div style={styles.empty}>No import jobs yet</div>}
        {jobs.map(job => <JobRow key={job.id} job={job} />)}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    top: 56,
    right: 0,
    width: 360,
    maxHeight: 'calc(100vh - 56px)',
    background: '#181825',
    borderLeft: '1px solid #313244',
    overflowY: 'auto',
    zIndex: 100,
    boxShadow: '-4px 0 16px rgba(0,0,0,0.4)',
  },
  header: {
    padding: '14px 20px',
    fontWeight: 700,
    color: '#cdd6f4',
    borderBottom: '1px solid #313244',
    fontSize: 14,
  },
  list: { padding: '0 20px' },
  empty: { padding: '24px 0', color: '#585b70', textAlign: 'center', fontSize: 13 },
}
