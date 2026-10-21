"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { days } from "@/lib/curriculum"
import { useProgress } from "@/lib/progress"
import { learnerName, solidScore } from "@/lib/storage"
import type { DayId } from "@/lib/types"

function greeting(hour: number) {
  if (hour < 11) return "Guten Morgen"
  if (hour < 18) return "Guten Tag"
  return "Guten Abend"
}

export function Dashboard({
  onOpenDay,
}: {
  onOpenDay: (day: DayId) => void
}) {
  const { state, setName } = useProgress()
  const hour = new Date().getHours()

  const solid = days.filter((day) => solidScore(state.best[day.id])).length
  const next = days.find((day) => !solidScore(state.best[day.id])) ?? days[4]
  const hello = greeting(hour)
  const name = state.name.trim()
  const finished = solid === 5

  return (
    <div className="home pb-4">
      <header className="home-head">
        <h1
          className="text-[34px] leading-[1.15] font-semibold tracking-[-0.03em] text-balance"
          suppressHydrationWarning
        >
          {hello}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 max-w-[42rem] text-[17px] leading-6 text-[var(--label-2)]">
          Cinq jours d’allemand suisse, à la forme Sie.
        </p>
      </header>

      <section className="home-status" aria-labelledby="solid-heading">
        <ol className="flex gap-1.5" aria-label={`${solid} jour${solid > 1 ? "s" : ""} solide${solid > 1 ? "s" : ""} sur 5`}>
          {days.map((day) => {
            const on = solidScore(state.best[day.id])
            return (
              <li
                key={day.id}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: on ? "var(--signal)" : "color-mix(in oklab, var(--ink) 12%, var(--canvas))" }}
              />
            )
          })}
        </ol>
        <h2 id="solid-heading" className="mt-4 text-[22px] leading-7 font-semibold tracking-[-0.02em]">
          {finished
            ? "Les cinq jours sont solides."
            : solid === 0
              ? "Aucun jour solide."
              : `${solid} jour${solid > 1 ? "s" : ""} solide${solid > 1 ? "s" : ""}.`}
        </h2>
        <p className="mt-1 text-[15px] leading-5 text-[var(--label-2)]">
          {finished
            ? "Les fiches restent ouvertes si une phrase accroche."
            : `Six bonnes réponses sur huit rendent un jour solide. Le prochain est le jour ${next.id}.`}
        </p>
        <Button
          type="button"
          size="touch"
          className="press mt-4 h-11 px-4"
          onClick={() => onOpenDay(finished ? 5 : next.id)}
        >
          {finished ? "Revoir le jour 5" : `Ouvrir le jour ${next.id}`}
        </Button>
      </section>

      <section className="home-days" aria-labelledby="days-heading">
        <h2 id="days-heading" className="mb-3 text-[22px] leading-7 font-semibold tracking-[-0.02em]">
          Les cinq jours
        </h2>
        <ol className="inset">
          {days.map((day) => {
            const score = state.best[day.id]
            const opened = state.opened.includes(day.id)
            const solidDay = solidScore(score)
            const status = solidDay
              ? `Solide, ${score} %`
              : opened
                ? score !== undefined
                  ? `En cours, ${score} %`
                  : "Fiche ouverte"
                : "Pas encore ouvert"
            return (
              <li key={day.id} className="border-t border-[var(--line)] first:border-t-0">
                <button
                  type="button"
                  className="row press flex min-h-[76px] w-full items-center gap-3 px-3.5 py-3 text-left"
                  onClick={() => onOpenDay(day.id)}
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-2xl text-[17px] font-semibold tabular-nums"
                    style={{
                      background: solidDay ? "var(--signal)" : "var(--soft)",
                      color: solidDay ? "#fff" : "var(--ink)",
                    }}
                  >
                    {day.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] leading-6 font-semibold tracking-[-0.01em]">
                      {day.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-[var(--label-2)]">
                      {day.promise}
                    </span>
                    <span
                      className="mt-1 block text-[13px] font-medium"
                      style={{ color: solidDay ? "var(--good)" : "var(--label-2)" }}
                    >
                      {status} · {day.minutes} min
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-[var(--label-3)]" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="home-name inset p-4">
        <label className="block" htmlFor="learner-name">
          <span className="text-[15px] font-medium">Prénom dans le script</span>
          <input
            id="learner-name"
            value={state.name}
            maxLength={24}
            autoComplete="given-name"
            placeholder="Alex"
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl bg-[var(--canvas)] px-3 text-[17px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
          />
        </label>
        <p className="mt-3 text-[13px] leading-5 text-[var(--label-2)]">
          {name
            ? `Le script dit « Ich heisse ${learnerName(state.name)} ».`
            : "Sans prénom, le script utilise Alex. En Suisse, on écrit heisse, avec ss."}
        </p>
      </section>
    </div>
  )
}
