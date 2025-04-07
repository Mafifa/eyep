import { BrowserWindow, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { net } from 'electron'

// Variable to store the main window
let mainWindow: BrowserWindow | null = null

/**
 * Initializes the update manager.
 * @param window The main application window.
 */
export function initializeUpdater(window: BrowserWindow) {
  mainWindow = window

  // AutoUpdater configuration
  autoUpdater.autoDownload = false // Disable automatic download

  // Event when an update is available
  autoUpdater.on('update-available', async () => {
    const response = await showUpdateDialog(
      'Update Available',
      'A new version is available. Do you want to download it now?'
    )

    if (response === 0) {
      // User chose "Yes"
      autoUpdater.downloadUpdate()
    }
  })

  // Event when the update has been downloaded
  autoUpdater.on('update-downloaded', async () => {
    const response = await showUpdateDialog(
      'Update Ready',
      'The update has been downloaded. Do you want to install it now?'
    )

    if (response === 0) {
      // User chose "Yes"
      autoUpdater.quitAndInstall()
    }
  })

  // Error event
  autoUpdater.on('error', (error) => {
    console.error('Error checking for updates:', error)
    showErrorDialog(
      'Update Error',
      `An error occurred while checking for updates. ${error.message}`
    )
  })

  // Start checking for updates
  checkForUpdates()
}

/**
 * Shows a confirmation dialog to the user.
 * @param title Dialog title.
 * @param message Message to display.
 * @returns Promise resolving with the user's response (0 = Yes, 1 = No).
 */
async function showUpdateDialog(title: string, message: string): Promise<number> {
  if (!mainWindow) {
    throw new Error('Main window is not available.')
  }

  const options: Electron.MessageBoxOptions = {
    type: 'question',
    buttons: ['Yes', 'No'],
    defaultId: 0,
    title,
    message
  }

  return dialog.showMessageBox(mainWindow, options).then((result) => result.response)
}

/**
 * Displays an error dialog to the user.
 * @param title Dialog title.
 * @param message Message to display.
 */
function showErrorDialog(title: string, message: string): void {
  if (!mainWindow) {
    throw new Error('Main window is not available.')
  }

  dialog.showErrorBox(title, message)
}

/**
 * Checks if there is an active internet connection.
 * @returns A promise that resolves to true if there is a connection, false otherwise.
 */
async function checkInternetConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = net.request('https://www.google.com')
    request.on('response', (response) => {
      resolve(response.statusCode === 200)
    })
    request.on('error', () => {
      resolve(false)
    })
    request.end()
  })
}

/**
 * Checks for available updates only if there is an internet connection.
 */
async function checkForUpdates() {
  try {
    const isConnected = await checkInternetConnection()

    if (!isConnected) {
      console.log('No internet connection. Skipping update check.')
      showErrorDialog(
        'No Internet Connection',
        'Unable to check for updates. Please connect to the internet and try again.'
      )
      return
    }

    console.log('Checking for updates...')
    await autoUpdater.checkForUpdates()
  } catch (error) {
    console.error('Error during update check:', error)
    showErrorDialog(
      'Update Check Error',
      `An unexpected error occurred while checking for updates. ${error}`
    )
  }
}
