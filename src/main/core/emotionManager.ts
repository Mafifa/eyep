import { BrowserWindow } from 'electron'

type EmotionState = 'normal' | 'suspicious' | 'angry'

export class EmotionManager {
  private current: EmotionState = 'normal'
  private source: EmotionState | null = null
  private escalationTimer: NodeJS.Timeout | null = null
  private stepDownTimer: NodeJS.Timeout | null = null
  private lastMovement: number = Date.now()
  private stepDownInitiated: boolean = false

  constructor(
    private mainWindow: BrowserWindow,
    private topWindow: BrowserWindow
  ) {
    this.updateEmotion('normal', 'normal')
  }

  public manageEmotions(mouseMoved: boolean): void {
    const now = Date.now()

    if (mouseMoved) {
      this.handleMovement(now)
    } else {
      this.handleInactivity(now)
    }
  }

  private handleMovement(timestamp: number): void {
    this.lastMovement = timestamp

    switch (this.current) {
      case 'angry':
        this.cancelEscalation()
        if (!this.stepDownInitiated) {
          this.stepDownInitiated = true
          this.stepDownTimer = setTimeout(() => {
            this.updateEmotion('suspicious', 'angry')
            this.stepDownInitiated = false
          }, 10000)
        }
        break
      case 'suspicious':
        this.cancelEscalation()
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
        if (inactiveTime >= 60000) {
          this.updateEmotion('suspicious', 'normal')
        }
        break
      case 'suspicious':
        if (this.source === 'normal' && inactiveTime >= 90000) {
          this.updateEmotion('angry', 'suspicious')
        }
        break
    }
  }

  private updateEmotion(newEmotion: EmotionState, source: EmotionState): void {
    if (this.current === newEmotion) return

    this.cancelAllTimers()
    this.stepDownInitiated = false

    this.current = newEmotion
    this.source = source

    if (newEmotion === 'suspicious' && source === 'normal') {
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

  private cancelAllTimers(): void {
    clearTimeout(this.escalationTimer!)
    clearTimeout(this.stepDownTimer!)
  }

  private cancelEscalation(): void {
    clearTimeout(this.escalationTimer!)
    this.escalationTimer = null
  }
}
