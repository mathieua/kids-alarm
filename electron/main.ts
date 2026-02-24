import { app, BrowserWindow, ipcMain, protocol, net } from 'electron'
import path from 'path'
import { AudioService, Track } from './services/audio'
import { createApiService } from './services/api'
import { getMediaItems } from './services/database'
import fs from 'fs'

const isDev = process.env.NODE_ENV !== 'production'
const isKiosk = !isDev && process.platform === 'linux'

let mainWindow: BrowserWindow | null = null
let audioService: AudioService

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    fullscreen: isKiosk,
    frame: !isKiosk,
    kiosk: isKiosk,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Hide cursor in production (kiosk mode)
  if (isKiosk) {
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
  const mediaDir = isKiosk
    ? path.join(app.getPath('home'), 'alarm-clock/media')
    : path.join(__dirname, '../../media')

  audioService = new AudioService(mediaDir)

  // Forward state changes to renderer
  audioService.on('stateChange', (state) => {
    mainWindow?.webContents.send('audio:stateChange', state)
  })

  audioService.on('trackEnded', () => {
    mainWindow?.webContents.send('audio:trackEnded')
  })
}

function setupIpcHandlers(mediaDir: string) {
  ipcMain.handle('audio:getState', () => {
    return audioService.getState()
  })

  ipcMain.handle('audio:scanMedia', async () => {
    const tracks = await audioService.scanMedia()
    const dbItems = getMediaItems()
    const dbByPath = new Map(dbItems.map(item => [item.file_path, item]))
    return tracks.map(track => {
      const dbItem = dbByPath.get(track.filepath)
      if (!dbItem) return track
      const artwork = dbItem.thumbnail_url
        ? path.join(mediaDir, dbItem.thumbnail_url.replace(/^\/media\//, ''))
        : track.artwork
      return { ...track, title: dbItem.title, artwork }
    })
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
  // Register protocol for serving local media files
  protocol.handle('media', (request) => {
    const filePath = decodeURIComponent(request.url.replace('media://', ''))
    return net.fetch('file://' + filePath)
  })

  const mediaDir = isKiosk
    ? path.join(app.getPath('home'), 'alarm-clock/media')
    : path.join(__dirname, '../../media')
  const dataDir = isKiosk
    ? path.join(app.getPath('home'), 'alarm-clock/data')
    : path.join(__dirname, '../../data')
  fs.mkdirSync(dataDir, { recursive: true })

  const apiService = createApiService(mediaDir, dataDir)
  apiService.start(3000)

  // Forward sync/USB events to renderer
  apiService.sync.onEvent((event, payload) => {
    mainWindow?.webContents.send('sync:event', { event, payload })
  })

  ipcMain.handle('sync:getDevice', () => apiService.sync.getDevice())
  ipcMain.handle('sync:getDiff', () => apiService.sync.getDiff())
  ipcMain.handle('sync:startSync', (_, deleteOrphans: string[]) => {
    apiService.sync.startSync(deleteOrphans)
  })
  ipcMain.handle('sync:eject', () => apiService.sync.eject())

  setupAudioService()
  setupIpcHandlers(mediaDir)
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
