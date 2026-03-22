import { useEffect, useState } from 'react'

// ── Displayed on the physical 7" screen when the Pi is in AP / setup mode ────
// The parent joins the leo-clock-setup hotspot on their phone and visits the
// URL shown here. Everything happens in the phone browser — this screen is
// just a clear set of instructions.

export function WifiSetup() {
  const [hotspotIp, setHotspotIp] = useState<string>('10.42.0.1')
  const [dots, setDots]           = useState('.')

  useEffect(() => {
    window.electronAPI.wifi.getStatus().then(s => {
      if (s.hotspotIp) setHotspotIp(s.hotspotIp)
    }).catch(() => {})
  }, [])

  // Animated ellipsis to indicate the clock is waiting
  useEffect(() => {
    const id = setInterval(() =>
      setDots(d => d.length >= 3 ? '.' : d + '.'), 700)
    return () => clearInterval(id)
  }, [])

  const url = `http://${hotspotIp}:3000/setup`

  return (
    <div className="wifi-setup">
      <div className="wifi-setup__icon">📡</div>
      <h1 className="wifi-setup__title">WiFi Setup Needed</h1>
      <p className="wifi-setup__sub">Waiting for connection{dots}</p>

      <div className="wifi-setup__steps">
        <div className="wifi-setup__step">
          <span className="wifi-setup__num">1</span>
          <span>
            On your phone, join the WiFi network{' '}
            <strong className="wifi-setup__ssid">leo-clock-setup</strong>
          </span>
        </div>
        <div className="wifi-setup__step">
          <span className="wifi-setup__num">2</span>
          <span>
            Open your browser and go to{' '}
            <strong className="wifi-setup__url">{url}</strong>
          </span>
        </div>
        <div className="wifi-setup__step">
          <span className="wifi-setup__num">3</span>
          <span>Choose your home WiFi and enter the password</span>
        </div>
      </div>
    </div>
  )
}
