import { useState, useEffect, useRef } from "react"
import EyesComponent from "./components/eyes-components/eyes-component"

type EmotionState = "normal" | "angry" | "suspicious" | "sleeping"

export function App () {
  const [emotion, setEmotion] = useState<"normal" | "angry" | "suspicious" | "sleeping">("normal")
  const emotionRef = useRef(emotion);

  useEffect(() => {
    emotionRef.current = emotion;
  }, [emotion]);

  useEffect(() => {
    const handleEmotionChange = (_event, newEmotion: EmotionState) => {
      setEmotion(prev => {
        // Forzar re-render incluso si el estado es el mismo
        if (prev === newEmotion) return `${newEmotion}-force` as typeof emotion;
        return newEmotion;
      });
    };

    window.electron.ipcRenderer.on('emotion-change', handleEmotionChange);

    return () => {
      window.electron.ipcRenderer.removeListener('emotion-change', handleEmotionChange);
    };
  }, []);

  return (
    <main className="flex flex-col items-center justify-center p-12 scale-75">
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
    </main>
  )
}

