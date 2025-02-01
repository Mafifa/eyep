import Store from 'electron-store'

const schema: PomodoroSettings = {
  work: 1500,
  shortBreak: 300,
  longBreak: 900,
  autoStart: true
}

export default class SettingsStore {
  private store: Store<PomodoroSettings>

  constructor() {
    this.store = new Store<PomodoroSettings>({
      defaults: schema
    })
  }

  getSettings(): PomodoroSettings {
    return this.store.store
  }

  saveSettings(settings: Partial<PomodoroSettings>): void {
    this.store.set(settings)
  }
}
