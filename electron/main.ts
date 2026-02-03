import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { AudioService, Track } from './services/audio'

const isDev = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | null = null
let audioService: AudioService

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    fullscreen: !isDev,
    frame: isDev,
    kiosk: !isDev,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Hide cursor in production (kiosk mode)
  if (!isDev) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow?.webContents.insertCSS('* { cursor: none !important; }')
    })
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function setupAudioService() {
  const mediaDir = isDev
    ? path.join(__dirname, '../../media')
    : path.join(app.getPath('home'), 'alarm-clock/media')

  audioService = new AudioService(mediaDir)

  // Forward state changes to renderer
  audioService.on('stateChange', (state) => {
    mainWindow?.webContents.send('audio:stateChange', state)
  })

  audioService.on('trackEnded', () => {
    mainWindow?.webContents.send('audio:trackEnded')
  })
}

function setupIpcHandlers() {
  ipcMain.handle('audio:getState', () => {
    return audioService.getState()
  })

  ipcMain.handle('audio:scanMedia', async () => {
    return await audioService.scanMedia()
  })

  ipcMain.handle('audio:play', async (_, track?: Track) => {
    await audioService.play(track)
  })

  ipcMain.handle('audio:pause', async () => {
    await audioService.pause()
  })

  ipcMain.handle('audio:resume', async () => {
    await audioService.resume()
  })

  ipcMain.handle('audio:togglePlayPause', async () => {
    await audioService.togglePlayPause()
  })

  ipcMain.handle('audio:stop', async () => {
    await audioService.stop()
  })

  ipcMain.handle('audio:setVolume', async (_, volume: number) => {
    await audioService.setVolume(volume)
  })

  ipcMain.handle('audio:setQueue', (_, tracks: Track[], startIndex: number) => {
    audioService.setQueue(tracks, startIndex)
  })

  ipcMain.handle('audio:next', async () => {
    await audioService.playNext()
  })

  ipcMain.handle('audio:previous', async () => {
    await audioService.playPrevious()
  })
}

app.whenReady().then(() => {
  setupAudioService()
  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
