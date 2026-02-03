interface NavigationProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const views = [
    { id: 'clock', label: 'Clock' },
    { id: 'media', label: 'Media' },
    { id: 'alarms', label: 'Alarms' },
  ]

  return (
    <nav className="navigation">
      {views.map((view) => (
        <button
          key={view.id}
          className={`nav-button ${activeView === view.id ? 'active' : ''}`}
          onClick={() => onViewChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  )
}
