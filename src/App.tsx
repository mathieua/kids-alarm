import { useState, useEffect } from 'react'

function App() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const displayHours = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="app">
      <div className="clock-container">
        <div className="time">
          <span className="hours">{displayHours.toString().padStart(2, '0')}</span>
          <span className="colon">:</span>
          <span className="minutes">{minutes.toString().padStart(2, '0')}</span>
          <span className="seconds">{seconds.toString().padStart(2, '0')}</span>
          <span className="ampm">{ampm}</span>
        </div>
        <div className="date">{dateStr}</div>
      </div>
    </div>
  )
}

export default App
