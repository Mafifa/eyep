declare global {
  type SessionType = 'work' | 'shortBreak' | 'longBreak'

  type PomodoroAction = {
    type: 'START_STOP' | 'RESET' | 'CHANGE_SESSION' | 'UPDATE_SETTING'
    payload?: SessionType | Partial<PomodoroSettings>
  }

  interface PomodoroSettings {
    work: number
    shortBreak: number
    longBreak: number
    autoStart: boolean
  }

  interface PomodoroState {
    timeLeft: number
    currentSession: SessionType
    isRunning: boolean
    sessionsCompleted: number
    settings: PomodoroSettings
  }
}

export {}
