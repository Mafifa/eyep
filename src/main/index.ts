import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import PomodoroTimer from './core/pomodoroTimer'
import { screen } from 'electron'

let mainWindow: BrowserWindow | null = null
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let topWindow: BrowserWindow | null = null

function createTopWindow(): void {
  const { width } = screen.getPrimaryDisplay().workAreaSize
  const windowWidth = 300
  const windowHeight = 60

  topWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor((width - windowWidth) / 2),
    y: 20,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  const filePath = join(__dirname, '../../src/renderer/eyes/index.html')

  console.log(filePath)

  topWindow.loadFile(filePath)
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
