import type React from "react"

interface TitleBarProps {
  isTransparent: boolean
}

export const TitleBar: React.FC<TitleBarProps> = ({ isTransparent }) => {
  return (
    <div
      className={`w-full h-10 flex items-center justify-between px-4 ${isTransparent ? "bg-transparent" : "bg-primary/10"
        } drag`}
    >
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${isTransparent ? "bg-white/0" : "bg-primary"} mr-2`}></div>
        <span className={`text-sm font-medium ${isTransparent ? "text-white/0" : "text-primary"}`}>
          Pomodoro Timer
        </span>
      </div>

      <div className="flex space-x-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        {isTransparent ? (
          <>
          </>
        ) : (
          <>
            <button
              onClick={() => window.api.minimizeApp()}
              className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-colors duration-200"
            >
              <span className="sr-only">Minimize</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-yellow-900"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => window.api.closeApp()}
              className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-red-900"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

