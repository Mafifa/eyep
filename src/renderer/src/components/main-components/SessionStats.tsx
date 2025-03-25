import type React from "react"

interface SessionStatsProps {
  workCount: number
  shortBreakCount: number
  longBreakCount: number
}

export const SessionStats: React.FC<SessionStatsProps> = ({ workCount, shortBreakCount, longBreakCount }) => {
  return (
    <div className="flex justify-center space-x-4 text-xs mb-3">
      <div className="flex flex-col items-center">
        <span className="font-medium text-primary">{workCount}</span>
        <span className="text-muted-foreground">Work</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-medium text-primary">{shortBreakCount}</span>
        <span className="text-muted-foreground">Short</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-medium text-primary">{longBreakCount}</span>
        <span className="text-muted-foreground">Long</span>
      </div>
    </div>
  )
}

