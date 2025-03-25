import { useState, useEffect } from "react"
interface SettingsWindowProps {
  isOpen: boolean
  onClose: () => void
  settings: PomodoroSettings
  onSave: (newSettings: PomodoroSettings) => void
}

export function SettingsWindow ({ isOpen, onClose, settings, onSave }: SettingsWindowProps) {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  if (!isOpen) return null

  const handleTimeChange = (
    key: keyof Pick<PomodoroSettings, "work" | "shortBreak" | "longBreak">,
    value: number
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value * 60, // Convert minutes to seconds
    }))
  }

  const handleToggle = (key: "autoStart") => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="fixed bg-transparent inset-0 z-50 flex items-center justify-center">
      <div className="bg-card text-card-foreground w-[540px] h-[310px] p-6 rounded-3xl shadow-lg border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            {(["work", "shortBreak", "longBreak"] as const).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {key === "work" ? "Work" : key === "shortBreak" ? "Short Break" : "Long Break"}
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={Math.floor(localSettings[key] / 60)}
                    onChange={(e) => handleTimeChange(key, Number(e.target.value))}
                    className="w-12 px-1 py-0.5 bg-muted text-foreground rounded-md text-center text-sm"
                    min={1}
                    max={120}
                  />
                  <span className="text-xs">min</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-start breaks</span>
              <button
                onClick={() => handleToggle("autoStart")}
                className={`w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background ${localSettings.autoStart ? "bg-primary dark:bg-primary/80" : "bg-muted dark:bg-muted/30"
                  }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${localSettings.autoStart ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => onSave(localSettings)}
            className="w-full py-3 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-primary/80 dark:hover:bg-primary/70 dark:focus:ring-offset-background"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}