import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  getInitialState: () => Promise<PomodoroState | null>
  sendAction: (action: Action) => void
  onUpdate: (
    callback: React.Dispatch<React.SetStateAction<PomodoroState | null>>
  ) => Electron.IpcRenderer
  closeApp: () => void
  minimizeApp: () => void
  toggleTransparency: (isTransparent: boolean) => void
  onTransparencyChanged: (
    callback: React.Dispatch<React.SetStateAction<boolean>>
  ) => Electron.IpcRenderer
  setDraggable: (draggable: boolean) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
