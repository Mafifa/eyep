import Store from 'electron-store'

const schema = {
  work: 1500,
  shortBreak: 300,
  longBreak: 900,
  autoStart: true
}

interface storeType {
  work: number
  shortBreak: number
  longBreak: number
  autoStart: number
}

function handleStore() {
  const getSettings = () => {}

  const saveSettings = () => {}

  return { getSettings, saveSettings }
}

export default class SettingsStore {
  store: Store

  constructor() {
    this.store = new Store<storeType>({
      default: schema
    })
  }

  // No se por queda estos errores en teoria deberia de estar bien

  getSettings(): typeof schema {
    return this.store.get(key)
  }

  saveSettings(settings: Partial<typeof schema>): void {
    this.store.set(settings)
  }
}
