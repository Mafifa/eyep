import type React from "react"

interface TimerDisplayProps {
  timeLeft: number
  formatTime: (seconds: number) => string
  isTransparent: boolean
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, formatTime, isTransparent }) => {
  return <div className={`text-8xl font-normal ${isTransparent ? "text-white" : ""}`}>{formatTime(timeLeft)}</div>
}

