interface NavView {
  id: string
  label: string
}

interface NavigationProps {
  views: NavView[]
  activeView: string
  onViewChange: (view: string) => void
}

export function Navigation({ views, activeView, onViewChange }: NavigationProps) {
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
