import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron'
import icon from '../../../resources/icon.png?asset'
import PomodoroTimer from './pomodoroTimer'

export class TrayManager {
  private tray: Tray | null = null
  private currentMenu: Menu | null = null

  constructor(
    private mainWindow: BrowserWindow,
    private pomodoroTimer: PomodoroTimer
  ) {}

  public createTray(): void {
    if (this.tray) return

    this.tray = new Tray(icon)
    this.updateMenu()

    ipcMain.on('pomodoro-update', (_, state) => {
      this.updateMenu(state)
      this.updateTooltip(state)
    })

    this.tray.on('right-click', () => {
      this.updateMenu(this.pomodoroTimer.getState())
      this.tray?.popUpContextMenu(this.currentMenu)
    })

    this.tray.on('double-click', () => this.restoreWindow())
    this.updateTooltip(this.pomodoroTimer.getState())

    app.on('before-quit', () => {
      this.tray?.destroy()
    })
  }

  private updateMenu(state: any = this.pomodoroTimer.getState()): void {
    const { timeLeft, currentSession, isRunning } = state
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

    const sessionText = {
      work: 'Trabajo',
      shortBreak: 'Descanso Corto',
      longBreak: 'Descanso Largo'
    }[currentSession]

    const menuTemplate = [
      {
        label: `⏳ ${formattedTime}`,
        enabled: false
      },
      {
        label: ` ${isRunning ? '▶' : '❚❚'} ${sessionText}`,
        enabled: false
      },
      { type: 'separator' },
      {
        label: isRunning ? '❚❚ Pausar' : '▶ Iniciar',
        click: () => {
          this.pomodoroTimer.toggleTimer()
        }
      },
      { type: 'separator' },
      {
        label: 'Abrir',
        click: () => this.restoreWindow()
      },
      { type: 'separator' },
      {
        label: 'Salir',
        click: () => app.quit()
      }
    ]

    this.currentMenu = Menu.buildFromTemplate(menuTemplate)
    this.tray?.setContextMenu(this.currentMenu)
  }

  private updateTooltip(state: any): void {
    if (!this.tray) return

    const { timeLeft, currentSession, isRunning } = state
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

    const sessionText = {
      work: 'Trabajo',
      shortBreak: 'Descanso Corto',
      longBreak: 'Descanso Largo'
    }[currentSession]

    const status = isRunning ? '▶ En curso' : '❚❚ Pausado'
    const tooltip = `Pomodoro\n${formattedTime} - ${sessionText}\n${status}`

    this.tray.setToolTip(tooltip)
  }

  private restoreWindow(): void {
    this.mainWindow.show()
    this.tray?.destroy()
    this.tray = null
  }
}
