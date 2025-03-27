import type React from "react"

interface TransparentSessionStatusProps {
  isRunning: boolean
  currentSession: string
}

export const TransparentSessionStatus: React.FC<TransparentSessionStatusProps> = ({ isRunning, currentSession }) => {
  return (
    <div className="text-white text-center mb-2">
      {isRunning ? (
        <div className="flex flex-col items-center">
          <span className="font-extrabold text-xl tracking-wide">
            {currentSession.charAt(0).toUpperCase() + currentSession.slice(1)}
          </span>
          <span className="font-bold text-lg tracking-wide">in progress</span>
        </div>
      ) : (
        <span className="font-extrabold text-xl tracking-wide">Ready</span>
      )}
    </div>
  )
}

