import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  getInitialState: () => Promise<any>
  sendAction: (action: any) => void
  onUpdate: (callback: any) => Electron.IpcRenderer
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
