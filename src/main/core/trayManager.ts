import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron'
import icon from '../../../resources/tray.png?asset'
import PomodoroTimer from './pomodoroTimer'

interface PomodoroState {
  timeLeft: number
  currentSession: 'work' | 'shortBreak' | 'longBreak'
  isRunning: boolean
  workCount: number
  shortBreakCount: number
  longBreakCount: number
  settings: PomodoroSettings
}

export class TrayManager {
  private tray: Tray | null = null
  private currentMenu: Menu | undefined = undefined

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

  private updateMenu(state: PomodoroState = this.pomodoroTimer.getState()): void {
    const { timeLeft, currentSession, isRunning } = state
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

    const sessionText = {
      work: 'Work',
      shortBreak: 'Short Break',
      longBreak: 'Long Break'
    }[currentSession]

    const menuTemplate = [
      {
        label: `⏳ ${formattedTime}`,
        enabled: false,
        type: 'normal'
      },
      {
        label: ` ${isRunning ? '▶' : '❚❚'} ${sessionText}`,
        enabled: false,
        type: 'normal'
      },
      { type: 'separator' as const },
      {
        label: isRunning ? '❚❚ Pause' : '▶ Start',
        click: () => {
          this.pomodoroTimer.toggleTimer()
        },
        type: 'normal'
      },
      { type: 'separator' as const },
      {
        label: 'Open',
        click: () => this.restoreWindow(),
        type: 'normal'
      },
      { type: 'separator' as const },
      {
        label: 'Quit',
        click: () => app.quit(),
        type: 'normal'
      }
    ]

    this.currentMenu = Menu.buildFromTemplate(menuTemplate as Electron.MenuItemConstructorOptions[])
    this.tray?.setContextMenu(this.currentMenu)
  }

  private updateTooltip(state: PomodoroState): void {
    if (!this.tray) return

    const { timeLeft, currentSession, isRunning } = state
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

    const sessionText = {
      work: 'Work',
      shortBreak: 'Short Break',
      longBreak: 'Long Break'
    }[currentSession]

    const status = isRunning ? '▶ In progress' : '❚❚ Paused'
    const tooltip = `EyeP\n${formattedTime} - ${sessionText}\n${status}`

    this.tray.setToolTip(tooltip)
  }

  private restoreWindow(): void {
    this.mainWindow.show()
    this.tray?.destroy()
    this.tray = null
  }
}
