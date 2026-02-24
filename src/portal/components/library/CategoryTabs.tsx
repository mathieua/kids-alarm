import type { Category } from '../../types/portal.types'

type ActiveCategory = Category | 'all'

interface Props {
  active: ActiveCategory
  onChange: (cat: ActiveCategory) => void
}

const TABS: { value: ActiveCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lullabies', label: 'Lullabies' },
  { value: 'music', label: 'Music' },
  { value: 'audiobooks', label: 'Audiobooks' },
]

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div style={styles.tabs}>
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          style={{ ...styles.tab, ...(active === tab.value ? styles.activeTab : {}) }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: {
    padding: '8px 20px',
    borderRadius: 8,
    border: '1px solid #45475a',
    background: 'none',
    color: '#a6adc8',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  activeTab: { background: '#cba6f7', color: '#1e1e2e', border: '1px solid #cba6f7' },
}
