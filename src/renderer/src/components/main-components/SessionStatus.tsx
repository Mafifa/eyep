import type React from "react"

interface SessionStatusProps {
  isRunning: boolean
  currentSession: string
  isTransparent: boolean
}

export const SessionStatus: React.FC<SessionStatusProps> = ({ isRunning, currentSession, isTransparent }) => {
  // For non-transparent mode only - shown in the upper left corner
  if (!isTransparent) {
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
  // For transparent mode, we do not return anything here as it will be displayed elsewhere.
  return null
}

