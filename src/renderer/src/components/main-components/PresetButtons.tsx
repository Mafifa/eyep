"use client"

import type React from "react"
import { Tooltip } from "./Tooltip"
import { type PresetKey } from '../../App'

interface PresetButtonsProps {
  presets: Record<string, { work: number; shortBreak: number; longBreak: number }>
  currentSettings: { work: number; shortBreak: number; longBreak: number }
  onPresetChange: (preset: PresetKey) => void
  formatTime: (seconds: number) => string
}

export const PresetButtons: React.FC<PresetButtonsProps> = ({
  presets,
  currentSettings,
  onPresetChange,
  formatTime,
}) => {
  return (
    <div className="flex justify-center space-x-3 w-full mb-3">
      {Object.keys(presets).map((presetKey) => (
        <Tooltip
          key={presetKey}
          content={
            <div className="text-xs">
              <p>Work: {formatTime(presets[presetKey].work)}</p>
              <p>Short Break: {formatTime(presets[presetKey].shortBreak)}</p>
              <p>Long Break: {formatTime(presets[presetKey].longBreak)}</p>
            </div>
          }
        >
          <button
            onClick={() => onPresetChange(presetKey as PresetKey)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${currentSettings.work === presets[presetKey].work &&
              currentSettings.shortBreak === presets[presetKey].shortBreak &&
              currentSettings.longBreak === presets[presetKey].longBreak
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
          >
            {presetKey}
          </button>
        </Tooltip>
      ))}
    </div>
  )
}

