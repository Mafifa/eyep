import { useState, useEffect } from "react"
import { SettingsWindow } from "./components/SettingsWindow"
import { Tooltip } from "./components/Tooltip"

export const PRESETS = {
  SHORT: {
    work: 15 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  },
  CLASSIC: {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  },
  LONG: {
    work: 50 * 60,
    shortBreak: 15 * 60,
    longBreak: 30 * 60,
  },
}

type PresetKey = keyof typeof PRESETS
type TimerMode = "work" | "shortBreak" | "longBreak"

export default function App () {
  const [preset, setPreset] = useState<PresetKey>("CLASSIC")
  const [mode, setMode] = useState<TimerMode>("work")
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(PRESETS.CLASSIC.work)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [settings, setSettings] = useState({
    workTime: { minutes: 25, seconds: 0 },
    shortBreakTime: { minutes: 5, seconds: 0 },
    longBreakTime: { minutes: 15, seconds: 0 },
    soundEnabled: true,
    autoStartBreaks: false,
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDarkMode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handlePresetChange = (newPreset: PresetKey) => {
    setPreset(newPreset)
    setMode("work")
    setIsRunning(false)
    setTime(PRESETS[newPreset].work)
  }

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    setTime(PRESETS[preset][newMode])
  }

  const handleSettingsSave = (newSettings: typeof settings) => {
    setSettings(newSettings)
    setIsSettingsOpen(false)
    // Update current timer if needed
    if (mode === "work") setTime(newSettings.workTime.minutes * 60 + newSettings.workTime.seconds)
    else if (mode === "shortBreak")
      setTime(newSettings.shortBreakTime.minutes * 60 + newSettings.shortBreakTime.seconds)
    else if (mode === "longBreak") setTime(newSettings.longBreakTime.minutes * 60 + newSettings.longBreakTime.seconds)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="w-[540px] h-[310px] bg-card text-card-foreground rounded-3xl shadow-lg p-8 flex flex-col items-center justify-between relative">
        <div className="flex justify-center space-x-4 w-full">
          {(Object.keys(PRESETS) as PresetKey[]).map((presetKey) => (
            <Tooltip
              key={presetKey}
              content={
                <div className="text-xs">
                  <p>Work: {formatTime(PRESETS[presetKey].work)}</p>
                  <p>Short Break: {formatTime(PRESETS[presetKey].shortBreak)}</p>
                  <p>Long Break: {formatTime(PRESETS[presetKey].longBreak)}</p>
                </div>
              }
            >
              <button
                onClick={() => handlePresetChange(presetKey)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${preset === presetKey
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {presetKey}
              </button>
            </Tooltip>
          ))}
        </div>

        <div className="text-8xl font-light my-8">{formatTime(time)}</div>

        <div className="flex justify-center space-x-4 w-full">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            {isRunning ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              setIsRunning(false)
              handleModeChange(mode)
            }}
            className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
            </svg>
          </button>
          <button
            onClick={() => handleModeChange(mode === "work" ? "shortBreak" : "work")}
            className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
        >
          {isDarkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="absolute top-4 left-4 text-sm font-medium text-muted-foreground">
          {isRunning ? `${mode.charAt(0).toUpperCase() + mode.slice(1)} in progress` : "Ready"}
        </div>
      </div>

      <SettingsWindow
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  )
}

