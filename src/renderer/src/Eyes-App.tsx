import { useState } from "react"
import { Angry, Meh } from "lucide-react"
import EyesComponent from "./components/eyes-components/eyes-component"
import { Button } from "./components/eyes-components/custom-buttom"
import { SuspiciousIcon } from "./components/eyes-components/icons/suspicious-icon"
import { SleepingIcon } from "./components/eyes-components/icons/sleeping-ico"

export function App () {
  const [emotion, setEmotion] = useState<"normal" | "angry" | "suspicious" | "sleeping">("normal")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="mb-8 relative">
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

      <div className="flex gap-2 mt-8">
        <Button
          onClick={() => setEmotion("normal")}
          variant={emotion === "normal" ? "default" : "outline"}
          className="flex gap-2"
        >
          <Meh className="h-4 w-4" /> Normal
        </Button>
        <Button
          onClick={() => setEmotion("angry")}
          variant={emotion === "angry" ? "default" : "outline"}
          className="flex gap-2"
        >
          <Angry className="h-4 w-4" /> Molesto
        </Button>
        <Button
          onClick={() => setEmotion("suspicious")}
          variant={emotion === "suspicious" ? "default" : "outline"}
          className="flex gap-2"
        >
          <SuspiciousIcon /> Sospechando
        </Button>
        <Button
          onClick={() => setEmotion("sleeping")}
          variant={emotion === "sleeping" ? "default" : "outline"}
          className="flex gap-2"
        >
          <SleepingIcon /> Descansando
        </Button>
      </div>
    </main>
  )
}

