import type React from "react"

interface TimerDisplayProps {
  timeLeft: number
  formatTime: (seconds: number) => string
  isTransparent: boolean
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, formatTime, isTransparent }) => {
  return <div className={`text-7xl font-light ${isTransparent ? "text-white/50" : ""}`}>{formatTime(timeLeft)}</div>
}

