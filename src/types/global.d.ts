declare global {
  type Action =
    | { type: 'CHANGE_SESSION'; payload: SessionType } // Cambiar sesión
    | { type: 'UPDATE_SETTING'; payload: Partial<PomodoroSettings> } // Actualizar configuración
    | { type: 'START_STOP' } // Iniciar o detener el temporizador
    | { type: 'RESET' } // Reiniciar el temporizador
  export type SessionType = 'work' | 'shortBreak' | 'longBreak'

  export type Emotion = 'normal' | 'angry' | 'suspicious' | 'sleeping'

  export type PomodoroAction = {
    type: 'START_STOP' | 'RESET' | 'CHANGE_SESSION' | 'UPDATE_SETTING'
    payload?: SessionType | Partial<PomodoroSettings>
  }
  export interface PomodoroSettings {
    work: number
    shortBreak: number
    longBreak: number
    autoStart: boolean
    darkMode: boolean
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
