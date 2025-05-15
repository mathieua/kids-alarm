import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import type { Alarm, Theme as ThemeType } from 'shared/types'

// Import components (to be created)
import Clock from './components/Clock'
import AlarmDisplay from './components/AlarmDisplay'
import WeatherWidget from './components/WeatherWidget'
import ImportantDates from './components/ImportantDates'
import LullabyControls from './components/LullabyControls'
import ThemeSelector from './components/ThemeSelector'

function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>({
    id: 'default',
    name: 'Default',
    primaryColor: '#4A90E2',
    secondaryColor: '#50E3C2',
    backgroundColor: '#FFFFFF',
    textColor: '#333333'
  })

  const theme = createTheme({
    palette: {
      primary: {
        main: currentTheme.primaryColor,
      },
      secondary: {
        main: currentTheme.secondaryColor,
      },
      background: {
        default: currentTheme.backgroundColor,
        paper: currentTheme.backgroundColor,
      },
      text: {
        primary: currentTheme.textColor,
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Clock />
          <WeatherWidget />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <AlarmDisplay />
          <ImportantDates />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <LullabyControls />
          <ThemeSelector onThemeChange={setCurrentTheme} />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
