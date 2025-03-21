import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getInitialState: () => ipcRenderer.invoke('get-initial-state'),
  sendAction: (action) => ipcRenderer.send('pomodoro-action', action),
  onUpdate: (callback) => ipcRenderer.on('pomodoro-update', (_, state) => callback(state)),
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  toggleTransparency: (isTransparent) => ipcRenderer.send('toggle-transparency', isTransparent),
  onTransparencyChanged: (callback) =>
    ipcRenderer.on('transparency-changed', (_, isTransparent) => callback(isTransparent)),
  setDraggable: (draggable) => ipcRenderer.send('set-draggable', draggable)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
