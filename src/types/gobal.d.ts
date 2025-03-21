declare global {
  export type SessionType = 'work' | 'shortBreak' | 'longBreak'

  export type PomodoroAction = {
    type: 'START_STOP' | 'RESET' | 'CHANGE_SESSION' | 'UPDATE_SETTING'
    payload?: SessionType | Partial<PomodoroSettings>
  }

  export interface PomodoroSettings {
    work: number
    shortBreak: number
    longBreak: number
    autoStart: boolean
  }

  export interface PomodoroState {
    timeLeft: number
    currentSession: SessionType
    isRunning: boolean
    sessionsCompleted: number
    settings: PomodoroSettings
  }
}

export {}
