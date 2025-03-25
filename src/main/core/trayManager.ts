import { app, BrowserWindow, Tray, Menu } from 'electron'
import icon from '../resources/icon.png?asset'

export class TrayManager {
  private tray: Tray | null = null

  constructor(
    private mainWindow: BrowserWindow,
    private topWindow: BrowserWindow
  ) {}

  public createTray(): void {
    if (this.tray) return

    this.tray = new Tray(icon)
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Abrir', click: () => this.restoreWindow() },
      { type: 'separator' },
      { label: 'Salir', click: () => app.quit() }
    ])

    this.tray.setToolTip('Mi Aplicación')
    this.tray.setContextMenu(contextMenu)
    this.tray.on('double-click', () => this.restoreWindow())

    // Manejo de cierre
    app.on('before-quit', () => {
      this.tray?.destroy()
    })
  }

  private restoreWindow(): void {
    this.mainWindow.show()
    this.topWindow.show()
    this.tray?.destroy()
    this.tray = null
  }
}
