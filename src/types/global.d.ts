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

  interface PomodoroState {
    timeLeft: number
    currentSession: SessionType
    isRunning: boolean
    workCount: number
    shortBreakCount: number
    longBreakCount: number
    settings: PomodoroSettings
  }
}
export {}
