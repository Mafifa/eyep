import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import PomodoroTimer from './core/pomodoroTimer'

let mainWindow: BrowserWindow | null = null
let topWindow: BrowserWindow | null = null
let cursorTrackingInterval: NodeJS.Timeout | null = null
let lastMousePos = { x: 0, y: 0 }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pomodoroTimer = new PomodoroTimer()

function createWindow(): void {
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
}

function createTopWindow(): void {
  const { width } = screen.getPrimaryDisplay().workAreaSize

  topWindow = new BrowserWindow({
    width: 540,
    height: 310,
    skipTaskbar: true,
    alwaysOnTop: true,
    frame: true,
    transparent: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    topWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/eyes.html`)
  } else {
    topWindow.loadFile(join(__dirname, '../renderer/eyes.html'))
  }
  // start the following
  topWindow.webContents.on('did-finish-load', () => {
    startCursorTracking()
  })
}

// Función para iniciar el seguimiento del cursor
function startCursorTracking(): void {
  console.log('Iniciando seguimiento del cursor')

  cursorTrackingInterval = setInterval(() => {
    if (topWindow && !topWindow.isDestroyed()) {
      try {
        const mousePos = screen.getCursorScreenPoint()

        if (mousePos.x !== lastMousePos.x || mousePos.y !== lastMousePos.y) {
          lastMousePos = mousePos

          const windowBounds = topWindow.getBounds()
          const relativePos = {
            x: mousePos.x - windowBounds.x,
            y: mousePos.y - windowBounds.y,
            isInWindow:
              mousePos.x >= windowBounds.x &&
              mousePos.x <= windowBounds.x + windowBounds.width &&
              mousePos.y >= windowBounds.y &&
              mousePos.y <= windowBounds.y + windowBounds.height,
            globalX: mousePos.x,
            globalY: mousePos.y
          }

          topWindow.webContents.send('cursor-position', relativePos)
          mainWindow?.webContents.send('cursor-position', relativePos)
          console.log(relativePos)
        }
      } catch (error) {
        console.error('Error al rastrear el cursor:', error)
      }
    }
  }, 16)

  app.on('before-quit', () => {
    if (cursorTrackingInterval) {
      clearInterval(cursorTrackingInterval)
      cursorTrackingInterval = null
    }
  })
}

// Update app.whenReady() block
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTopWindow() // Add this line
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (cursorTrackingInterval) {
    clearInterval(cursorTrackingInterval)
    cursorTrackingInterval = null
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
