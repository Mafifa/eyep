import Store from 'electron-store'

const schema = {
  work: 1500,
  shortBreak: 300,
  longBreak: 900,
  autoStart: true
}

const store = new Store({ defaults: schema })

export default function handleStore() {
  const getAllSettings = () => {
    return store.store
  }

  const saveSettings = (key: keyof PomodoroSettings, value: any) => {
    return store.set(key, value)
  }

  const getSetting = (key: keyof PomodoroSettings) => {
    return store.get(key)
  }

  return { getSetting, saveSettings, getAllSettings }
}
