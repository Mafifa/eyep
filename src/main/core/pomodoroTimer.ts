import { ipcMain, BrowserWindow } from 'electron'
import SettingsStore from './SettingsStore'

export default class PomodoroTimer {
  private settings: PomodoroSettings
  private state: PomodoroState
  private timerId: NodeJS.Timeout | null = null
  private lastTickTimestamp: number
  private settingsStore: SettingsStore

  constructor() {
    this.settingsStore = new SettingsStore()
    this.settings = this.settingsStore.getSettings()

    this.state = {
      timeLeft: this.settings.work,
      currentSession: 'work',
      isRunning: false,
      sessionsCompleted: 0,
      settings: this.settings
    }

    this.lastTickTimestamp = Date.now()
    this.setupIPC()
  }

  private setupIPC(): void {
    ipcMain.handle('get-initial-state', () => this.getState())

    ipcMain.on('pomodoro-action', (_, action: PomodoroAction) => {
      switch (action.type) {
        case 'START_STOP':
          this.toggleTimer()
          break
        case 'RESET':
          this.resetTimer()
          break
        case 'CHANGE_SESSION':
          if (this.isValidSession(action.payload)) {
            this.changeSession(action.payload)
          }
          break
        case 'UPDATE_SETTING':
          this.updateSettings(action.payload as Partial<PomodoroSettings>)
          break
      }
    })
  }

  private isValidSession(session: unknown): session is SessionType {
    return ['work', 'shortBreak', 'longBreak'].includes(session as string)
  }

  private toggleTimer(): void {
    this.state.isRunning ? this.stopTimer() : this.startTimer()
  }

  private startTimer(): void {
    if (!this.state.isRunning) {
      this.state.isRunning = true
      this.lastTickTimestamp = Date.now()
      this.timerId = setInterval(() => this.tick(), 1000)
      this.emitState()
    }
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
    this.state.isRunning = false
    this.emitState()
  }

  private resetTimer(): void {
    this.stopTimer()
    this.state = {
      ...this.state,
      timeLeft: this.settings.work,
      currentSession: 'work',
      sessionsCompleted: 0
    }
    this.emitState()
  }

  private tick(): void {
    const now = Date.now()
    const elapsed = Math.floor((now - this.lastTickTimestamp) / 1000)

    if (elapsed >= 1) {
      this.state.timeLeft -= elapsed
      this.lastTickTimestamp = now

      if (this.state.timeLeft <= 0) {
        this.handleSessionEnd()
      }

      this.emitState()
    }
  }

  private handleSessionEnd(): void {
    if (this.state.currentSession === 'work') {
      this.state.sessionsCompleted++
      this.state.currentSession =
        this.state.sessionsCompleted % 4 === 0 ? 'longBreak' : 'shortBreak'
    } else {
      this.state.currentSession = 'work'
    }

    this.state.timeLeft = this.settings[this.state.currentSession]

    if (!this.settings.autoStart && this.state.currentSession !== 'work') {
      this.stopTimer()
    } else {
      this.startTimer()
    }
  }

  private changeSession(session: SessionType): void {
    this.state.currentSession = session
    this.state.timeLeft = this.settings[session]
    this.emitState()
  }

  private updateSettings(newSettings: Partial<PomodoroSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.settingsStore.saveSettings(this.settings)

    if (this.state.currentSession === 'work') {
      this.state.timeLeft = this.settings.work
    }

    this.state.settings = this.settings
    this.emitState()
  }

  private emitState(): void {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send('pomodoro-update', this.getState())
      }
    })
  }

  public getState(): PomodoroState {
    return { ...this.state }
  }
}
