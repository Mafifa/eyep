import { useState, useEffect, useRef } from "react"

interface EyesComponentProps {
  emotion: "normal" | "angry" | "suspicious" | "sleeping"
}

export default function EyesComponent ({ emotion }: EyesComponentProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMouseMoving, setIsMouseMoving] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseTimerRef = useRef<NodeJS.Timeout | null>(null)


  useEffect(() => {
    const handleCursorPosition = (_event, mousePosition) => {
      setMousePosition({ x: mousePosition.x, y: mousePosition.y })
      setIsMouseMoving(true)

      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current)
      }

      mouseTimerRef.current = setTimeout(() => {
        setIsMouseMoving(false)
      }, 500)
    }

    window.electron.ipcRenderer.on('cursor-position', handleCursorPosition)

    return () => {
      window.electron.ipcRenderer.removeListener('cursor-position', handleCursorPosition)
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current)
      }
    }
  }, [])

  const calculateEyePosition = (eyeRef: HTMLDivElement | null, isLeftEye: boolean) => {
    if (!eyeRef || !isMouseMoving || emotion === "sleeping") return { x: 0, y: 0 }

    const eyeRect = eyeRef.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 }

    const eyeCenterX = eyeRect.left - containerRect.left + eyeRect.width / 2
    const eyeCenterY = eyeRect.top - containerRect.top + eyeRect.height / 2

    // Calculate angle and distance
    const angle = Math.atan2(mousePosition.y - eyeCenterY, mousePosition.x - eyeCenterX)

    // Different max distances based on emotion
    let maxDistance = 14 // Default for normal eyes - increased for more freedom

    if (emotion === "angry") {
      maxDistance = 12
    } else if (emotion === "suspicious") {
      maxDistance = 10
    } else if (emotion === "sleeping") {
      maxDistance = 0
    }

    // Calculate distance with scaling factor - reduced divisor for more movement
    // Increase vertical movement by applying a multiplier to y-component
    const verticalMultiplier = 2 // Increase vertical movement, especially downward
    const distance = Math.min(maxDistance, Math.hypot(mousePosition.x - eyeCenterX, mousePosition.y - eyeCenterY) / 20)

    // Calculate position using angle and distance
    // Apply vertical multiplier for looking down (when sin(angle) is positive)
    const sinValue = Math.sin(angle)
    const verticalFactor = sinValue > 0 ? sinValue * verticalMultiplier : sinValue

    return {
      x: Math.cos(angle) * distance,
      y: verticalFactor * distance,
    }
  }

  return (
    <div className="flex items-center justify-center" ref={containerRef} style={{ background: "transparent" }}>
      <div className="flex gap-8">
        {/* Left Eye */}
        <Eye
          emotion={emotion}
          getPosition={(ref) => calculateEyePosition(ref, true)}
          isLeftEye={true}
          isMouseMoving={isMouseMoving}
        />

        {/* Right Eye */}
        <Eye
          emotion={emotion}
          getPosition={(ref) => calculateEyePosition(ref, false)}
          isLeftEye={false}
          isMouseMoving={isMouseMoving}
        />
      </div>
    </div>
  )
}

interface EyeProps {
  emotion: "normal" | "angry" | "suspicious" | "sleeping"
  getPosition: (ref: HTMLDivElement | null) => { x: number; y: number }
  isLeftEye: boolean
  isMouseMoving: boolean
}

function Eye ({ emotion, getPosition, isLeftEye, isMouseMoving }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })

  // Update target position when mouse moves
  useEffect(() => {
    if (eyeRef.current) {
      const newPosition = getPosition(eyeRef.current)
      setTargetPosition(newPosition)
    }
  }, [getPosition, isMouseMoving])

  // Animate position towards target
  useEffect(() => {
    const animatePosition = () => {
      setPosition((prev) => {
        // If not moving, gradually return to center
        if (!isMouseMoving) {
          return {
            x: prev.x * 0.9, // Gradually reduce x position
            y: prev.y * 0.9, // Gradually reduce y position
          }
        }

        // Otherwise, move towards target position
        return {
          x: prev.x + (targetPosition.x - prev.x) * 0.2,
          y: prev.y + (targetPosition.y - prev.y) * 0.2,
        }
      })
    }

    const interval = setInterval(animatePosition, 16) // ~60fps
    return () => clearInterval(interval)
  }, [targetPosition, isMouseMoving])

  // Get the eye container style
  const getEyeContainerStyle = () => {
    return "relative w-24 h-24"
  }

  // Get the eye style
  const getEyeStyle = () => {
    const baseStyle = "absolute inset-0"

    switch (emotion) {
      case "angry":
        return `${baseStyle} bg-white border-red-500 border-4`
      case "suspicious":
        return `${baseStyle} bg-white border-amber-500 border-4`
      case "sleeping":
        return `${baseStyle} bg-white border-gray-400 border-4 rounded-full`
      default:
        return `${baseStyle} bg-white border-gray-800 border-4 rounded-full`
    }
  }

  // Different pupil styles based on emotion
  const getPupilStyle = () => {
    switch (emotion) {
      case "angry":
        return "bg-red-900 w-8 h-8 rounded-full"
      case "suspicious":
        return "bg-amber-900 w-8 h-8 rounded-full"
      case "sleeping":
        return "bg-black w-8 h-8 rounded-full opacity-0" // Hidden when sleeping
      default:
        return "bg-black w-8 h-8 rounded-full"
    }
  }

  // Additional elements for emotions
  const getEmotionElements = () => {
    switch (emotion) {
      case "sleeping":
        return (
          <>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-400 border-b-2 border-gray-500 rounded-t-full z-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-400 border-t-2 border-gray-500 rounded-b-full z-10"></div>
          </>
        )
      default:
        return null
    }
  }

  // Get the CSS for the eye shape
  const getEyeShapeStyle = () => {
    if (emotion === "angry") {
      // Use the exact clip-path and border-radius requested for angry
      return isLeftEye
        ? {
          clipPath: "polygon(116% 84%, 0% 6%, 0% 100%, 100% 100%)",
          borderRadius: "0 0 10% 0",
          height: "100px",
          background: "white",
          border: "4px solid #ef4444",
        }
        : {
          clipPath: "polygon(-16% 84%, 100% 6%, 100% 100%, 0 100%)",
          borderRadius: "0 0 0 10%",
          height: "100px",
          background: "white",
          border: "4px solid #ef4444",
        }
    }

    if (emotion === "suspicious") {
      // Use the requested clip-path for suspicious with rounded corners
      return {
        clipPath: "polygon(0 59%, 100% 59%, 100% 100%, 0% 100%)",
        borderRadius: "10px",
        height: "100px",
        background: "white",
        border: "5px solid #f59e0b", // Thick amber border
        borderTop: "none", // Remove top border since it's clipped
      }
    }

    if (emotion === "sleeping") {
      return {
        borderRadius: "50%",
        height: "100px",
        background: "white",
        border: "4px solid #9ca3af",
      }
    }

    // Normal eyes
    return {
      borderRadius: "50%",
      height: "100px",
      background: "white",
      border: "4px solid #1f2937",
    }
  }

  // Get pupil vertical offset based on emotion
  const getPupilVerticalOffset = () => {
    switch (emotion) {
      case "angry":
        return 8 // Lower the pupils in angry state
      case "suspicious":
        return 12 // Lower the pupils even more in suspicious state
      default:
        return 0
    }
  }

  return (
    <div ref={eyeRef} className={getEyeContainerStyle()}>
      <div className={getEyeStyle()} style={getEyeShapeStyle()}>
        {getEmotionElements()}

        <div
          className={`absolute ${getPupilStyle()}`}
          style={{
            top: `calc(50% + ${getPupilVerticalOffset()}px)`,
            left: "50%",
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
            transition: isMouseMoving ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
            zIndex: 5,
          }}
        />
      </div>
    </div>
  )
}

