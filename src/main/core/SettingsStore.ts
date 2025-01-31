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

const store = new Store({ schema })

export default function handleStore() {
  const getAllSettings = () => {
    return store.store
  }

  const saveSettings = (key: keyof storeType, value: any) => {
    return store.set(key, value)
  }

  const getSetting = (key: keyof storeType) => {
    return store.get(key)
  }

  return { getSetting, saveSettings, getAllSettings }
}
