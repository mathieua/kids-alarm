import { Outlet } from 'react-router-dom'
import { PortalNav } from './PortalNav'
import { JobsPanel } from '../import/JobsPanel'

export function PortalLayout() {
  return (
    <div style={styles.root}>
      <PortalNav />
      <div style={styles.content}>
        <Outlet />
      </div>
      <JobsPanel />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#1e1e2e',
    color: '#cdd6f4',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 24,
  },
}
