"use client"

import { Play, Square, Volume2 } from "lucide-react"
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
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-[34px] leading-[1.12] font-semibold tracking-[-0.03em]">Voix</h1>
          <div
            className="glass grid grid-cols-2 gap-0.5 rounded-full p-0.5"
            role="group"
            aria-label="Vitesse"
          >
            {[
              { rate: 0.78, label: "Lent" },
              { rate: 1, label: "Normal" },
            ].map((item) => {
              const active = speech.rate === item.rate
              return (
                <button
                  key={item.label}
                  type="button"
                  className={cn(
                    "press h-9 rounded-full px-3 text-[13px] font-semibold",
                    active ? "chip-on" : "text-[var(--label-2)]",
                  )}
                  aria-pressed={active}
                  onClick={() => speech.setRate(item.rate)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
        <p className="mt-1 text-[15px] leading-5 text-[var(--label-2)]">
          Lent pour caler l’oreille, normal pour la phrase réelle.
        </p>
        <p className="mt-2 text-[12px] leading-4 text-[var(--label-3)]">
          {!speech.supported
            ? "Ce navigateur n’a pas de synthèse vocale. Lisez les phrases à voix haute : le texte reste la référence."
            : speech.german
              ? speech.voiceLabel
              : "Pas de voix allemande installée. La lecture part quand même : vérifiez ce que vous entendez."}
        </p>
      </header>

      <div className="voice-days">
        {days.map((day) => {
          const lines = spokenLines(day, state.name)
          return (
            <section key={day.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2 pl-1">
                <h2 className="min-w-0 truncate text-[13px] font-semibold tracking-[0.02em] text-[var(--label-2)] uppercase">
                  Jour {day.id} · {day.title}
                </h2>
                <button
                  type="button"
                  className="press -mr-1 flex h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-[15px] font-medium text-[var(--signal)]"
                  disabled={!speech.supported}
                  aria-label={
                    speech.speakingId === `all-${day.id}`
                      ? "Arrêter la lecture"
                      : `Tout écouter, jour ${day.id}`
                  }
                  onClick={() =>
                    speech.speakingId === `all-${day.id}`
                      ? speech.stop()
                      : speech.speakAll(
                          `all-${day.id}`,
                          lines.map((line) => line.de),
                        )
                  }
                >
                  {speech.speakingId === `all-${day.id}` ? (
                    <Square className="size-3 fill-current" />
                  ) : (
                    <Play className="size-3.5 fill-current" />
                  )}
                  {speech.speakingId === `all-${day.id}` ? "Arrêter" : "Tout écouter"}
                </button>
              </div>
              <ul className="inset divide-y divide-[var(--line)] px-3">
                {lines.map((line) => {
                  const active =
                    speech.speakingId === line.id ||
                    (speech.speakingId === `all-${day.id}` && speech.current === line.de)
                  return (
                    <li key={line.id} className="flex items-center gap-2 py-1">
                      <button
                        type="button"
                        className="press grid size-11 shrink-0 place-items-center rounded-full"
                        style={{
                          background: active ? "var(--signal)" : "var(--soft)",
                          color: active ? "#fff" : "var(--ink)",
                        }}
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
                        <span
                          className="block text-[16px] leading-5 font-medium"
                          lang="de-CH"
                          translate="no"
                        >
                          {line.de}
                        </span>
                        <span className="block text-[13px] leading-5 text-[var(--label-2)]">
                          {line.fr}
                        </span>
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
