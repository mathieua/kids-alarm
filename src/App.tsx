import { useState } from 'react'
import { Navigation } from './components/Navigation'
import { Clock } from './views/Clock'
import { Media } from './views/Media'
import { Alarms } from './views/Alarms'
import './types'

function App() {
  const [activeView, setActiveView] = useState('clock')

  const renderView = () => {
    switch (activeView) {
      case 'clock':
        return <Clock />
      case 'media':
        return <Media />
      case 'alarms':
        return <Alarms />
      default:
        return <Clock />
    }
  }

  return (
    <div className="app">
      <main className="main-content">{renderView()}</main>
      <Navigation activeView={activeView} onViewChange={setActiveView} />
    </div>
  )
}

export default App
