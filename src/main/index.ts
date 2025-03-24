import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import PomodoroTimer from './core/pomodoroTimer'
import { startCursorTracking } from './core/cursorTracker'
import { EmotionManager } from './core/emotionManager'
let mainWindow: BrowserWindow
let topWindow: BrowserWindow

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pomodoroTimer = new PomodoroTimer()

function createMainWindow(): Promise<BrowserWindow> {
  return new Promise((resolve) => {
    mainWindow = new BrowserWindow({
      width: 540,
      height: 310,
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
      mainWindow!.show()
      resolve(mainWindow)
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

    // IPC handlers
    ipcMain.on('close-app', () => {
      app.quit()
    })

    ipcMain.on('minimize-app', () => {
      mainWindow?.minimize()
    })

    ipcMain.on('toggle-transparency', (_event, isTransparent) => {
      if (mainWindow) {
        mainWindow.setIgnoreMouseEvents(isTransparent)
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
      width: 330,
      height: 250,
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

    // Hacer la ventana clickeable a través de ella
    topWindow.setIgnoreMouseEvents(true, { forward: true })

    // Center the window at the top of the screen
    const x = Math.round((width - 330) / 2)
    const y = -50
    topWindow.setPosition(x, y)

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      topWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/eyes.html`)
    } else {
      topWindow.loadFile(join(__dirname, '../renderer/eyes.html'))
    }

    topWindow.webContents.on('did-finish-load', () => {})

    topWindow.on('ready-to-show', () => {
      resolve(topWindow)
    })
  })
}

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 1. Crear ambas ventanas y esperar a que estén listas
  mainWindow = await createMainWindow()
  topWindow = await createTopWindow()

  const emotionManager = new EmotionManager(mainWindow, topWindow)

  startCursorTracking({
    topWindow: topWindow,
    onActivity: (mouseMoved) => {
      emotionManager.manageEmotions(mouseMoved)
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
