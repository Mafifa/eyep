import { useState, useEffect, useCallback } from "react"
import { SettingsWindow } from "./components/main-components/SettingsWindow"
import { TitleBar } from "./components/main-components/TitleBar"
import { PresetButtons } from "./components/main-components/PresetButtons"
import { TimerDisplay } from "./components/main-components/TimerDisplay"
import { SessionStats } from "./components/main-components/SessionStats"
import { ControlButtons } from "./components/main-components/ControlButtons"
import { UtilityButtons } from "./components/main-components/UtilityButtons"
import { SessionStatus } from "./components/main-components/SessionStatus"
import { TransparentSessionStatus } from "./components/main-components/TransparentSessionStatus"

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

export type PresetKey = keyof typeof PRESETS

export function App () {
  const [state, setState] = useState<PomodoroState | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isTransparent, setIsTransparent] = useState(false)
  const [isTopDraggable, setIsTopDraggable] = useState(false)

  const toggleTransparency = useCallback(() => {
    setIsTransparent((prev) => {
      const newState = !prev
      window.api.toggleTransparency(newState)
      return newState
    })
  }, [])

  useEffect(() => {
    window.api.getInitialState().then((state) => {
      setState(state)
      setIsDarkMode(state?.settings.darkMode as boolean)
    })
    window.api.onUpdate(setState)
    window.api.onTransparencyChanged(setIsTransparent)

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'KeyP') {
        toggleTransparency()
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [toggleTransparency])

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDarkMode])

  useEffect(() => {
    window.api.setDraggable(!isTransparent)
  }, [isTransparent])


  useEffect(() => {
    const handleKeyDown = (e) => {
      // Use e.code to detect the physical key
      if (e.ctrlKey && e.code === 'KeyQ') {
        e.preventDefault()
        const newState = !isTopDraggable
        setIsTopDraggable(newState)
        console.log('se ejecuto esta accion', newState)
        window.electron.ipcRenderer.send('set-top-draggable', newState)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTopDraggable])


  if (!state) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handlePresetChange = (newPreset: PresetKey) => {
    window.api.sendAction({ type: "UPDATE_SETTING", payload: PRESETS[newPreset] })
  }

  const handleModeChange = () => {
    window.api.sendAction({
      type: "CHANGE_SESSION",
      payload: state.currentSession === "work" ? "shortBreak" : "work",
    })
  }

  const handleSettingsSave = (newSettings: PomodoroSettings) => {
    window.api.sendAction({ type: "UPDATE_SETTING", payload: newSettings })
    setIsSettingsOpen(false)
  }

  const handleStartStop = () => {
    window.api.sendAction({ type: "START_STOP" })
  }

  const handleReset = () => {
    window.api.sendAction({ type: "RESET" })
  }

  return (
    <div
      className={`flex flex-col items-center text-card-foreground w-[540px] h-[310px] rounded-3xl ${isTransparent ? "bg-transparent border-transparent shadow-none" : "bg-background border border-border shadow-lg"
        } text-foreground transition-all duration-300 overflow-hidden`}
    >
      <TitleBar isTransparent={isTransparent} />

      <div
        className={`w-full h-full flex flex-col items-center p-2 justify-center relative overflow-hidden ${isTransparent ? "bg-opacity-30 backdrop-blur-sm" : "bg-card"} transition-all duration-300`}
      >
        {!isTransparent && (
          <PresetButtons
            presets={PRESETS}
            currentSettings={state.settings}
            onPresetChange={handlePresetChange}
            formatTime={formatTime}
          />
        )}

        <div className="flex flex-col items-center justify-center flex-1 space-y-2">
          {isTransparent && (
            <TransparentSessionStatus isRunning={state.isRunning} currentSession={state.currentSession} />
          )}

          <TimerDisplay timeLeft={state.timeLeft} formatTime={formatTime} isTransparent={isTransparent} />

          {!isTransparent && (
            <SessionStats
              workCount={state.workCount}
              shortBreakCount={state.shortBreakCount}
              longBreakCount={state.longBreakCount}
            />
          )}

          {!isTransparent && (
            <ControlButtons
              isRunning={state.isRunning}
              currentSession={state.currentSession}
              onStartStop={handleStartStop}
              onReset={handleReset}
              onChangeMode={handleModeChange}
            />
          )}
        </div>

        {!isTransparent && (
          <UtilityButtons
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        <SessionStatus
          isRunning={state.isRunning}
          currentSession={state.currentSession}
          isTransparent={isTransparent}
        />
      </div>

      <SettingsWindow
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.settings}
        onSave={handleSettingsSave}
      />
    </div>
  )
}

