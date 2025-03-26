import { BrowserWindow, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'

// Variable para almacenar la ventana principal
let mainWindow: BrowserWindow | null = null

/**
 * Inicializa el gestor de actualizaciones.
 * @param window La ventana principal de la aplicación.
 */
export function initializeUpdater(window: BrowserWindow) {
  mainWindow = window

  // Configuración del autoUpdater
  autoUpdater.autoDownload = false // Desactivamos la descarga automática

  // Evento cuando se encuentra una actualización disponible
  autoUpdater.on('update-available', async () => {
    const response = await showUpdateDialog(
      'Update Available',
      'A new version is available. Do you want to download it now?'
    )

    if (response === 0) {
      // Usuario eligió "Yes"
      autoUpdater.downloadUpdate()
    }
  })

  // Evento cuando la actualización ha sido descargada
  autoUpdater.on('update-downloaded', async () => {
    const response = await showUpdateDialog(
      'Update Ready',
      'The update has been downloaded. Do you want to install it now?'
    )

    if (response === 0) {
      // Usuario eligió "Yes"
      autoUpdater.quitAndInstall()
    }
  })

  // Evento de error
  autoUpdater.on('error', (error) => {
    console.error('Error checking for updates:', error)
    showErrorDialog('Update Error', 'An error occurred while checking for updates.')
  })

  // Comenzar la comprobación de actualizaciones
  checkForUpdates()
}

/**
 * Muestra un diálogo de confirmación al usuario.
 * @param title Título del diálogo.
 * @param message Mensaje a mostrar.
 * @returns Promesa que resuelve con la respuesta del usuario (0 = Yes, 1 = No).
 */
async function showUpdateDialog(title: string, message: string): Promise<number> {
  if (!mainWindow) {
    throw new Error('Main window is not available.')
  }

  const options: Electron.MessageBoxOptions = {
    type: 'question', // Especificamos el tipo explícitamente como 'question'
    buttons: ['Yes', 'No'],
    defaultId: 0,
    title,
    message
  }

  return dialog.showMessageBox(mainWindow, options).then((result) => result.response)
}

/**
 * Muestra un diálogo de error al usuario.
 * @param title Título del diálogo.
 * @param message Mensaje a mostrar.
 */
function showErrorDialog(title: string, message: string): void {
  if (!mainWindow) {
    throw new Error('Main window is not available.')
  }

  dialog.showErrorBox(title, message)
}

/**
 * Comprueba si hay actualizaciones disponibles.
 */
function checkForUpdates() {
  autoUpdater.checkForUpdates()
}
