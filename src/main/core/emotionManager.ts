import { BrowserWindow } from 'electron'

type EmotionState = 'normal' | 'suspicious' | 'angry' | 'sleeping'

export class EmotionManager {
  private current: EmotionState = 'normal'
  private source: EmotionState | null = null
  private escalationTimer: NodeJS.Timeout | null = null
  private stepDownTimer: NodeJS.Timeout | null = null
  private lastMovement: number = Date.now()
  private stepDownInitiated: boolean = false
  private isBreakActive: boolean = false // Nuevo estado

  constructor(
    private mainWindow: BrowserWindow,
    private topWindow: BrowserWindow
  ) {
    this.updateEmotion('normal', 'normal')
  }

  // Nuevo método para sincronizar con Pomodoro
  public setPomodoroState(session: string): void {
    const isBreak = ['shortBreak', 'longBreak'].includes(session)

    if (isBreak && !this.isBreakActive) {
      this.isBreakActive = true
      this.forceEmotion('sleeping')
    } else if (!isBreak && this.isBreakActive) {
      this.isBreakActive = false
      this.resetToNormal()
    }
  }

  private forceEmotion(emotion: EmotionState): void {
    this.cancelAllTimers()
    this.current = emotion
    this.sendEmotion(emotion)
  }

  public manageEmotions(mouseMoved: boolean): void {
    if (this.isBreakActive) return // Ignorar durante descansos

    const now = Date.now()
    if (mouseMoved) {
      this.handleMovement(now)
    } else {
      this.handleInactivity(now)
    }
  }

  private cancelAllTimers(): void {
    this.cancelEscalation()
    clearTimeout(this.stepDownTimer!)
  }

  private resetToNormal(): void {
    this.forceEmotion('normal')
    this.lastMovement = Date.now() // Reiniciar temporizadores
  }

  private handleMovement(timestamp: number): void {
    this.lastMovement = timestamp
    this.cancelEscalation()

    switch (this.current) {
      case 'angry':
        if (!this.stepDownInitiated) {
          this.stepDownInitiated = true
          this.stepDownTimer = setTimeout(() => {
            this.updateEmotion('suspicious', 'angry')
            this.stepDownInitiated = false
          }, 10000)
        }
        break
      case 'suspicious':
        if (!this.stepDownInitiated) {
          this.stepDownInitiated = true
          this.stepDownTimer = setTimeout(() => {
            this.updateEmotion('normal', 'suspicious')
            this.stepDownInitiated = false
          }, 10000)
        }
        break
    }
  }

  private handleInactivity(timestamp: number): void {
    const inactiveTime = timestamp - this.lastMovement

    switch (this.current) {
      case 'normal':
        if (inactiveTime >= 60000) this.updateEmotion('suspicious', 'normal')
        break
      case 'suspicious':
        if (inactiveTime >= 90000) this.updateEmotion('angry', 'suspicious')
        break
    }
  }

  private updateEmotion(newEmotion: EmotionState, source: EmotionState): void {
    if (this.current === newEmotion) return

    this.cancelEscalation()
    this.stepDownInitiated = false

    this.current = newEmotion
    this.source = source

    if (newEmotion === 'suspicious') {
      this.escalationTimer = setTimeout(() => {
        this.updateEmotion('angry', 'suspicious')
      }, 90000)
    }

    this.sendEmotion(newEmotion)
  }

  private sendEmotion(emotion: EmotionState): void {
    this.mainWindow?.webContents.send('emotion-change', emotion)
    this.topWindow?.webContents.send('emotion-change', emotion)
  }

  private cancelEscalation(): void {
    if (this.escalationTimer) {
      clearTimeout(this.escalationTimer)
      this.escalationTimer = null
    }
  }
}
