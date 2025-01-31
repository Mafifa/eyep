import { ipcMain, BrowserWindow } from 'electron'
import handleStore from './SettingsStore'
interface IPomodoroTimer {
  startTimer(): void
  stopTimer(): void
  resetTimer(): void
  changeSession(session: SessionType): void
  updateSetting(newSettings: keyof PomodoroSettings, value: any): void
  getState(): PomodoroState
}

export default class PomodoroTimer implements IPomodoroTimer {
  private settings: PomodoroSettings
  private state: PomodoroState
  private timerId: NodeJS.Timeout | null = null
  private lastTickTimestamp: number
  private accumulatedTime: number = 0

  constructor() {
    const savedSettings = handleStore().getAllSettings()

    this.settings = {
      work: savedSettings.work,
      shortBreak: savedSettings.shortBreak,
      longBreak: savedSettings.longBreak,
      autoStart: savedSettings.autoStart
    }

    this.state = {
      timeLeft: this.settings.work,
      currentSession: 'work',
      isRunning: false,
      sessionsCompleted: 0,
      settings: this.settings
    }

    this.lastTickTimestamp = Date.now()
    this.setupIPC()
    console.log('PomodoroTimer initialized with settings:', this.settings)
  }

  private setupIPC(): void {
    ipcMain.handle('get-initial-settings', () => {
      console.log('Sending initial settings to renderer')
      return this.settings
    })

    ipcMain.on('pomodoro-action', (_, action: { type: string; payload?: any }) => {
      console.log('Received pomodoro action:', action)
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
          this.updateSetting(action.payload.key, action.payload.value)
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

  public startTimer(): void {
    if (!this.state.isRunning) {
      console.log('Starting timer')
      this.state.isRunning = true
      this.lastTickTimestamp = Date.now()
      this.accumulatedTime = 0
      this.timerId = setInterval(() => this.tick(), 100)
      this.emitState()
    }
  }

  public stopTimer(): void {
    if (this.timerId) {
      console.log('Stopping timer')
      clearInterval(this.timerId)
      this.timerId = null
    }
    this.state.isRunning = false
    this.emitState()
  }

  public resetTimer(): void {
    console.log('Resetting timer')
    this.stopTimer()
    this.state = {
      ...this.state,
      timeLeft: this.settings.work,
      currentSession: 'work',
      sessionsCompleted: 0,
      isRunning: false
    }
    this.emitState()
  }

  private tick(): void {
    const now = Date.now()
    const elapsed = now - this.lastTickTimestamp
    this.accumulatedTime += elapsed

    if (this.accumulatedTime >= 1000) {
      const secondsToSubtract = Math.floor(this.accumulatedTime / 1000)
      this.state.timeLeft = Math.max(0, this.state.timeLeft - secondsToSubtract)
      this.accumulatedTime %= 1000

      console.log(`Tick: ${this.state.currentSession}, Time left: ${this.state.timeLeft}`)

      if (this.state.timeLeft <= 0) {
        this.handleSessionEnd()
      }

      this.emitState()
    }

    this.lastTickTimestamp = now
  }

  private handleSessionEnd(): void {
    console.log(`Session ended: ${this.state.currentSession}`)
    if (this.state.currentSession === 'work') {
      this.state.sessionsCompleted++
      console.log(`Sessions completed: ${this.state.sessionsCompleted}`)
      if (this.state.sessionsCompleted % 4 === 0) {
        this.changeSession('longBreak')
      } else {
        this.changeSession('shortBreak')
      }
    } else {
      this.changeSession('work')
    }

    if (!this.settings.autoStart && this.state.currentSession !== 'work') {
      this.stopTimer()
    } else {
      this.startTimer()
    }
  }

  public changeSession(session: SessionType): void {
    console.log(`Changing session to: ${session}`)
    this.state.currentSession = session
    this.state.timeLeft = this.settings[session]
    this.emitState()
  }

  public updateSetting(newSettings: keyof PomodoroSettings, value: any): void {
    console.log('Updating setting:', newSettings)

    handleStore().saveSettings(newSettings, value)

    if (this.state.isRunning) {
      this.stopTimer()
    }

    this.state.timeLeft = this.settings[this.state.currentSession]
    this.state.settings = this.settings

    if (this.state.isRunning) {
      this.startTimer()
    } else {
      this.emitState()
    }
  }

  private emitState(): void {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send('pomodoro-update', this.state)
      }
    })
    console.log('Emitted state:', this.state)
  }

  public getState(): PomodoroState {
    return { ...this.state }
  }
}
