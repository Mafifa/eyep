import { useState, useEffect, useRef } from "react"
import EyesComponent from "./components/eyes-components/eyes-component"


export function App () {
  const [emotion, setEmotion] = useState<Emotion>("normal")
  const emotionRef = useRef(emotion);
  const [isDraggable, setIsDraggable] = useState(false)

  useEffect(() => {
    emotionRef.current = emotion;
  }, [emotion]);

  // Handle Emotion
  useEffect(() => {
    const handleEmotionChange = (_event, newEmotion: Emotion) => {

      setEmotion(prev => {
        // Forzar re-render incluso si el estado es el mismo
        if (prev === newEmotion) return `${newEmotion}` as typeof emotion;
        return newEmotion;
      });
    };

    window.electron.ipcRenderer.on('emotion-change', handleEmotionChange);

    return () => {
      window.electron.ipcRenderer.removeListener('emotion-change', handleEmotionChange);
    };
  }, []);

  useEffect(() => {
    const handleDraggableUpdate = (_, newDraggableState) => {
      setIsDraggable(newDraggableState)
    }

    window.electron.ipcRenderer.on('update-draggable-state', handleDraggableUpdate)
    return () => {
      window.electron.ipcRenderer.removeListener('update-draggable-state', handleDraggableUpdate)
    }
  }, [])


  return (
    <main className="flex flex-col items-center justify-center scale-75">
      <div className="relative">
        {/* Eyebrows for different emotions */}
        {(emotion === "angry" || emotion === "suspicious") && (
          <div className="absolute top-0 left-0 w-full flex justify-center gap-8">
            <div
              className="w-20 h-5 bg-black rounded-t-md rounded-b-xl"
              style={{
                transform: emotion === "angry" ? "rotate(15deg) translateX(4px)" : "rotate(15deg) translateX(2px)",
              }}
            ></div>
            <div
              className="w-20 h-5 bg-black rounded-t-md rounded-b-xl"
              style={{
                transform: emotion === "angry" ? "rotate(-15deg) translateX(-4px)" : "rotate(-15deg) translateX(-2px)",
              }}
            ></div>
          </div>
        )}

        {/* Eyes Component */}
        <EyesComponent emotion={emotion} />
      </div>
      {isDraggable && (
        <div
          style={{
            position: 'fixed',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '2px solid #333',
            borderRadius: 4,
            cursor: 'pointer',
            WebkitAppRegion: 'drag',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#333',
            fontWeight: "bold"
          } as React.CSSProperties}
        >
          hold & drag
        </div>
      )}
    </main>
  )
}

