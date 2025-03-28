import { app as electronApp, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp as electronToolkitApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import PomodoroTimer from './core/pomodoroTimer'
import { startCursorTracking } from './core/cursorTracker'
import { EmotionManager } from './core/emotionManager'
import { TrayManager } from './core/trayManager'
import { initializeUpdater } from './update/updateManager'

interface ExtendedApp extends Electron.App {
  isQuiting: boolean
}

const app: ExtendedApp = Object.assign(electronApp, {
  isQuiting: false
})

let mainWindow: BrowserWindow
let topWindow: BrowserWindow
const pomodoroTimer = new PomodoroTimer()
let trayManager: TrayManager

function createMainWindow(): Promise<BrowserWindow> {
  return new Promise((resolve) => {
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

    const windowWidth = 540
    const windowHeight = 310

    const x = Math.round((screenWidth - windowWidth) / 2)
    const y = Math.round((screenHeight - windowHeight) / 2)

    mainWindow = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: x,
      y: y,
      maxHeight: 310,
      maxWidth: 540,
      show: false,
      frame: false,
      fullscreen: true,
      transparent: true,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
      resolve(mainWindow)
    })

    mainWindow.on('close', (event) => {
      if (!app.isQuiting) {
        event.preventDefault()
        mainWindow.hide()
        trayManager.createTray()
      }
      return false
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    ipcMain.on('close-app', () => {
      app.isQuiting = true
      app.quit()
    })

    ipcMain.on('minimize-app', () => {
      mainWindow?.hide()
      trayManager.createTray()
    })

    ipcMain.on('toggle-transparency', (_event, isTransparent) => {
      if (mainWindow) {
        mainWindow.setIgnoreMouseEvents(isTransparent)
        mainWindow.setAlwaysOnTop(isTransparent) // Mantener siempre al frente si es transparente
        mainWindow.webContents.send('transparency-changed', isTransparent)
      }
    })

    ipcMain.on('set-draggable', (_, draggable) => {
      if (mainWindow) {
        mainWindow.setMovable(draggable)
      }
    })
  })
}

function createTopWindow(): Promise<BrowserWindow> {
  return new Promise((resolve) => {
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width } = primaryDisplay.workAreaSize

    topWindow = new BrowserWindow({
      width: 230,
      height: 105,
      skipTaskbar: true,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      resizable: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    topWindow.setIgnoreMouseEvents(true, { forward: true })

    const x = Math.round((width - 330) / 2)
    const y = 0
    topWindow.setPosition(x, y)

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      topWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/eyes.html`)
    } else {
      topWindow.loadFile(join(__dirname, '../renderer/eyes.html'))
    }

    topWindow.on('ready-to-show', () => {
      resolve(topWindow)
    })
  })
}

app.whenReady().then(async () => {
  electronToolkitApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  mainWindow = await createMainWindow()
  topWindow = await createTopWindow()

  initializeUpdater(mainWindow)

  trayManager = new TrayManager(mainWindow, pomodoroTimer)
  const emotionManager = new EmotionManager(mainWindow, topWindow)

  startCursorTracking({
    topWindow: topWindow,
    onActivity: (mouseMoved) => {
      emotionManager.manageEmotions(mouseMoved)
    }
  })

  ipcMain.on('pomodoro-update', (_, state) => {
    emotionManager.setPomodoroState(state.currentSession)
  })

  ipcMain.on('set-top-draggable', (_, draggable) => {
    if (topWindow) {
      topWindow.setMovable(draggable)
      topWindow.setIgnoreMouseEvents(!draggable, { forward: !draggable })

      // Notify topWindow to update its state
      topWindow.webContents.send('update-draggable-state', draggable)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  mainWindow?.destroy()
  topWindow?.destroy()
})
