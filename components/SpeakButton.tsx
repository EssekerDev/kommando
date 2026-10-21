"use client"

import { Square, Volume2 } from "lucide-react"
import { useSpeech } from "@/lib/speech"

export function SpeakButton({
  id,
  text,
  label,
}: {
  id: string
  text: string
  label?: string
}) {
  const speech = useSpeech()
  const active = speech.speakingId === id
  const name = label ?? `Écouter : ${text}`

  return (
    <button
      type="button"
      className="press grid size-11 shrink-0 place-items-center rounded-full"
      style={{ background: "var(--soft)", color: "var(--ink)" }}
      aria-label={active ? "Arrêter la lecture" : name}
      aria-pressed={active}
      disabled={!speech.supported}
      onClick={() => {
        if (active) speech.stop()
        else speech.speak(id, text)
      }}
    >
      {active ? (
        <Square className="size-3.5 fill-current" />
      ) : (
        <Volume2 className="size-[18px]" strokeWidth={1.8} />
      )}
    </button>
  )
}
