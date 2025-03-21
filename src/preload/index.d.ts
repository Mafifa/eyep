import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  getInitialState: () => Promise<any>
  sendAction: (action: any) => void
  onUpdate: (callback: any) => Electron.IpcRenderer
  closeApp: () => void
  minimizeApp: () => void
  toggleTransparency: (isTransparent: any) => void
  onTransparencyChanged: (callback: any) => Electron.IpcRenderer
  setDraggable: (draggable: any) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
