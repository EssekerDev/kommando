"use client"

import { useRef, useState } from "react"
import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { SpeakButton } from "@/components/SpeakButton"
import { dayById } from "@/lib/curriculum"
import { useProgress } from "@/lib/progress"
import { useSpeech } from "@/lib/speech"
import { learnerName } from "@/lib/storage"
import type { DayId } from "@/lib/types"

const segments = ["Fiches", "Script", "Mots"] as const

export function DayView({
  dayId,
  onDrill,
  onSelectDay,
}: {
  dayId: DayId
  onDrill: () => void
  onSelectDay: (day: DayId) => void
}) {
  const day = dayById(dayId)
  const { state } = useProgress()
  const speech = useSpeech()
  const [segment, setSegment] = useState<(typeof segments)[number]>("Fiches")
  const [copied, setCopied] = useState(false)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const lines = day.lines(state.name)
  const scriptId = `script-${day.id}`
  const mail = day.email?.(state.name)

  function go(step: 1 | -1) {
    const next = day.id + step
    if (next < 1 || next > 5) return
    setSegment("Fiches")
    onSelectDay(next as DayId)
  }

  async function copyMail() {
    if (!mail) return
    try {
      await navigator.clipboard.writeText(mail.body)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className="flex flex-col gap-4 pb-6"
      onTouchStart={(event) => {
        const touch = event.touches[0]
        swipe.current = { x: touch.clientX, y: touch.clientY }
      }}
      onTouchEnd={(event) => {
        const start = swipe.current
        swipe.current = null
        if (!start) return
        const touch = event.changedTouches[0]
        const dx = touch.clientX - start.x
        const dy = touch.clientY - start.y
        if (Math.abs(dx) < 72 || Math.abs(dy) > Math.abs(dx) * 0.5) return
        go(dx < 0 ? 1 : -1)
      }}
    >
      <header>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold tracking-[0.02em] text-[var(--label-2)] uppercase tabular-nums">
            Jour {day.id} sur 5 · {day.minutes} min
          </p>
          <div className="-mr-2 flex items-center" role="group" aria-label="Changer de jour">
            <button
              type="button"
              className="press grid size-11 place-items-center rounded-full text-[var(--signal)] disabled:text-[var(--label-3)]"
              aria-label="Jour précédent"
              disabled={day.id === 1}
              onClick={() => go(-1)}
            >
              <ChevronLeft className="size-6" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="press grid size-11 place-items-center rounded-full text-[var(--signal)] disabled:text-[var(--label-3)]"
              aria-label="Jour suivant"
              disabled={day.id === 5}
              onClick={() => go(1)}
            >
              <ChevronRight className="size-6" strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <h1 className="mt-0.5 text-[30px] leading-[1.12] font-semibold tracking-[-0.03em] text-balance">
          {day.title}
        </h1>
        <p className="mt-1 text-[15px] leading-5 text-[var(--label-2)]">{day.promise}</p>
        <ol className="mt-3 flex gap-1.5" aria-hidden="true">
          {([1, 2, 3, 4, 5] as DayId[]).map((id) => (
            <li
              key={id}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{
                background:
                  id === day.id
                    ? "var(--signal)"
                    : "color-mix(in oklab, var(--ink) 12%, var(--canvas))",
              }}
            />
          ))}
        </ol>
      </header>

      <details className="inset group px-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
          Objectifs du jour
          <ChevronDown className="size-[18px] text-[var(--label-3)] transition-transform group-open:rotate-180" />
        </summary>
        <ul className="flex flex-col gap-2 pb-3.5">
          {day.objectives.map((objective) => (
            <li key={objective} className="flex gap-3 text-[15px] leading-5">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{ background: "var(--signal)" }}
              />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </details>

      <div
        className="sticky-tools glass grid max-w-md grid-cols-3 gap-1 rounded-full p-1"
        role="tablist"
        aria-label="Contenu du jour"
      >
        {segments.map((item) => {
          const active = segment === item
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "press h-10 rounded-full text-[15px] font-medium",
                active ? "chip-on" : "text-[var(--label-2)]",
              )}
              onClick={() => setSegment(item)}
            >
              {item}
            </button>
          )
        })}
      </div>

      {segment === "Fiches" && (
        <div className="flex flex-col gap-3">
          {day.cards.map((card) => (
            <article key={card.id} className="inset p-4">
              <h2 className="text-[22px] leading-7 font-semibold tracking-[-0.02em]">
                {card.title}
                {!card.title
                  .toLocaleLowerCase("fr")
                  .includes(card.kicker.toLocaleLowerCase("fr")) && (
                  <span className="mt-1 block text-[15px] font-medium text-[var(--label-2)]">
                    {card.kicker}
                  </span>
                )}
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-[var(--label-2)]">{card.body}</p>

              {card.formula && (
                <ol className="mt-4 grid grid-cols-2 gap-2">
                  {card.formula.map((slot, index) => (
                    <li key={slot.label} className="rounded-2xl bg-[var(--soft)] px-3 py-2.5">
                      <p className="text-[13px] font-medium text-[var(--label-2)]">
                        {index + 1}. {slot.label}
                      </p>
                      <p className="mt-0.5 text-[17px] font-semibold" lang="de-CH" translate="no">
                        {slot.value}
                      </p>
                    </li>
                  ))}
                </ol>
              )}

              {card.pairs && (
                <ul className="mt-4 divide-y divide-[var(--line)]">
                  {card.pairs.map((pair) => (
                    <li key={pair.left} className="flex min-h-11 items-center gap-3 py-1.5">
                      <span
                        className="w-16 shrink-0 text-[14px] font-medium"
                        lang="de-CH"
                        translate="no"
                      >
                        {pair.left}
                      </span>
                      <span
                        className="min-w-0 flex-1 text-[15px] leading-5"
                        lang="de-CH"
                        translate="no"
                      >
                        {pair.right}
                      </span>
                      {pair.say && <SpeakButton id={`${card.id}-${pair.left}`} text={pair.say} />}
                    </li>
                  ))}
                </ul>
              )}

              {card.grid && (
                <ul className="mt-4 grid grid-cols-3 gap-1.5">
                  {card.grid.map((item) => (
                    <li
                      key={item.n}
                      className="min-h-11 rounded-2xl bg-[var(--soft)] px-2.5 py-1.5"
                    >
                      <span className="text-[12px] text-[var(--label-2)] tabular-nums">
                        {item.n}
                      </span>
                      <span
                        className="block text-[14px] leading-5 font-medium"
                        lang="de-CH"
                        translate="no"
                      >
                        {item.word}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {card.examples && (
                <ul className="mt-4 flex flex-col gap-2">
                  {card.examples.map((example) => (
                    <li
                      key={example.de}
                      className="flex items-center gap-2 rounded-2xl bg-[var(--soft)] py-1 pr-1 pl-3"
                    >
                      <span className="min-w-0 flex-1 py-1.5">
                        <span
                          className="block text-[16px] leading-5 font-medium"
                          lang="de-CH"
                          translate="no"
                        >
                          {example.de}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-5 text-[var(--label-2)]">
                          {example.fr}
                        </span>
                      </span>
                      <SpeakButton id={`${card.id}-${example.de}`} text={example.de} />
                    </li>
                  ))}
                </ul>
              )}

              {card.id === "mail" && mail && (
                <div className="mt-4">
                  <pre
                    className="overflow-x-auto rounded-2xl bg-[var(--soft)] p-3 font-sans text-[15px] leading-6 whitespace-pre-wrap"
                    lang="de-CH"
                    translate="no"
                  >
                    {mail.body}
                  </pre>
                  <Button
                    type="button"
                    variant="outline"
                    size="touch"
                    className="press mt-3 w-full bg-transparent"
                    onClick={copyMail}
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Message copié" : "Copier le message"}
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {segment === "Script" && (
        <section className="inset p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">À dire</h2>
            <Button
              type="button"
              variant="outline"
              className="press h-11 rounded-full bg-transparent px-4"
              disabled={!speech.supported}
              onClick={() =>
                speech.speakingId === scriptId
                  ? speech.stop()
                  : speech.speakAll(
                      scriptId,
                      lines.map((line) => line.de),
                    )
              }
            >
              {speech.speakingId === scriptId ? "Arrêter" : "Tout écouter"}
            </Button>
          </div>
          {!state.name.trim() && day.id === 1 && (
            <p className="mt-2 text-[13px] leading-5 text-[var(--label-2)]">
              Le script utilise {learnerName(state.name)} tant que le prénom est vide.
            </p>
          )}
          <ol className="mt-3 flex flex-col">
            {lines.map((line, index) => (
              <li
                key={line.de}
                className="flex items-center gap-2 border-t border-[var(--line)] py-2 first:border-t-0"
              >
                <span className="w-6 shrink-0 text-[13px] text-[var(--label-2)] tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-[17px] leading-6 font-medium"
                    lang="de-CH"
                    translate="no"
                  >
                    {line.de}
                  </span>
                  <span className="block text-[13px] leading-5 text-[var(--label-2)]">
                    {line.fr}
                  </span>
                </span>
                <SpeakButton id={`line-${day.id}-${index}`} text={line.de} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {segment === "Mots" && (
        <ul className="inset divide-y divide-[var(--line)] px-4">
          {day.lexicon.map((item) => (
            <li
              key={`${item.label ?? ""}-${item.de}`}
              className="flex min-h-14 items-center gap-3 py-2"
            >
              <span className="min-w-0 flex-1">
                {item.label && (
                  <span className="block text-[13px] font-medium text-[var(--label-2)]">
                    {item.label}
                  </span>
                )}
                <span
                  className="block text-[17px] leading-6 font-medium"
                  lang="de-CH"
                  translate="no"
                >
                  {item.de}
                </span>
                <span className="block text-[13px] leading-5 text-[var(--label-2)]">{item.fr}</span>
              </span>
              <SpeakButton id={`lex-${day.id}-${item.de}`} text={item.de} />
            </li>
          ))}
        </ul>
      )}

      <Button type="button" size="touch" className="press w-full" onClick={onDrill}>
        Drill du jour {day.id}
      </Button>
    </div>
  )
}
