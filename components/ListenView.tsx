"use client"

import { Square, Volume2 } from "lucide-react"
import { cn } from "cn"
import { days, spokenLines } from "@/lib/curriculum"
import { useProgress } from "@/lib/progress"
import { useSpeech } from "@/lib/speech"

export function ListenView() {
  const { state } = useProgress()
  const speech = useSpeech()

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header>
        <h1 className="text-[34px] leading-[1.12] font-semibold tracking-[-0.03em]">
          Voix
        </h1>
        <p className="mt-2 text-[17px] leading-6 text-[var(--label-2)]">
          Allemand de Suisse d’abord, allemand standard ensuite. Lent pour caler l’oreille, clair pour la phrase réelle.
        </p>
      </header>

      <div className="glass grid max-w-md grid-cols-2 gap-1 rounded-full p-1" role="group" aria-label="Vitesse">
        {[
          { rate: 0.78, label: "Lent" },
          { rate: 1, label: "Clair" },
        ].map((item) => {
          const active = speech.rate === item.rate
          return (
            <button
              key={item.label}
              type="button"
              className={cn(
                "press h-11 rounded-full text-[15px] font-medium",
                active ? "chip-on" : "text-[var(--label-2)]"
              )}
              aria-pressed={active}
              onClick={() => speech.setRate(item.rate)}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <p className="text-[13px] leading-5 text-[var(--label-2)]">
        {!speech.supported
          ? "Ce navigateur n’a pas de synthèse vocale. Lisez les phrases à voix haute : le texte reste la référence."
          : speech.german
            ? speech.voiceLabel
            : "Pas de voix allemande installée. La lecture part quand même : vérifiez ce que vous entendez."}
      </p>

      <div className="voice-days">
      {days.map((day) => {
        const lines = spokenLines(day, state.name)
        return (
          <section key={day.id}>
            <h2 className="mb-3 text-[20px] leading-6 font-semibold tracking-[-0.02em]">
              Jour {day.id} · {day.title}
            </h2>
            <ul className="inset divide-y divide-[var(--line)] px-3">
              {lines.map((line) => {
                const active = speech.speakingId === line.id
                return (
                  <li key={line.id} className="flex items-center gap-2 py-1.5">
                    <button
                      type="button"
                      className="press grid size-11 shrink-0 place-items-center rounded-full"
                      style={{ background: active ? "var(--signal)" : "var(--soft)", color: active ? "#fff" : "var(--ink)" }}
                      aria-label={active ? "Arrêter" : `Écouter : ${line.de}`}
                      disabled={!speech.supported}
                      onClick={() => (active ? speech.stop() : speech.speak(line.id, line.de))}
                    >
                      {active ? (
                        <Square className="size-3.5 fill-current" />
                      ) : (
                        <Volume2 className="size-[18px]" strokeWidth={1.8} />
                      )}
                    </button>
                    <span className="min-w-0 flex-1 py-1">
                      {line.label && (
                        <span className="block text-[13px] font-medium text-[var(--label-2)]">
                          {line.label}
                        </span>
                      )}
                      <span className="block text-[16px] leading-5 font-medium" lang="de-CH" translate="no">
                        {line.de}
                      </span>
                      <span className="block text-[13px] leading-5 text-[var(--label-2)]">{line.fr}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      </div>
    </div>
  )
}
