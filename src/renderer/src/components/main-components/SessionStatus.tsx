import type React from "react"

interface SessionStatusProps {
  isRunning: boolean
  currentSession: string
}

export const SessionStatus: React.FC<SessionStatusProps> = ({ isRunning, currentSession }) => {
  return (
    <div className="absolute top-3 left-3 text-xs font-medium text-muted-foreground">
      {isRunning ? (
        <div className="flex flex-col items-center">
          <span>{currentSession.charAt(0).toUpperCase() + currentSession.slice(1)}</span>
          <span className="text-center">in progress</span>
        </div>
      ) : (
        "Ready"
      )}
    </div>
  )
}

