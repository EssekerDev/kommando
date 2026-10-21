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

function Ring({ value }: { value: number }) {
  const r = 19
  const c = 2 * Math.PI * r
  return (
    <span className="relative grid size-12 shrink-0 place-items-center" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-12 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--soft)" strokeWidth="5" />
        {value > 0 && (
          <circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke="var(--signal)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${(c * value) / 5} ${c}`}
            className="transition-[stroke-dasharray] duration-500"
          />
        )}
      </svg>
      <span className="text-[15px] font-semibold tabular-nums">{value}</span>
    </span>
  )
}

export function Dashboard({ onOpenDay }: { onOpenDay: (day: DayId) => void }) {
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
        <p className="mt-1 max-w-[42rem] text-[15px] leading-5 text-[var(--label-2)]">
          Cinq jours d’allemand suisse, à la forme Sie.
        </p>
      </header>

      <section
        className="home-status inset flex items-center gap-3.5 p-3.5"
        aria-labelledby="solid-heading"
      >
        <Ring value={solid} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[var(--label-2)]">
            {finished ? "Programme terminé" : solid === 0 ? "Pour commencer" : "Reprendre"}
          </p>
          <h2
            id="solid-heading"
            className="line-clamp-2 text-[17px] leading-[1.3] font-semibold tracking-[-0.01em]"
          >
            {finished ? "Les cinq jours sont solides" : `Jour ${next.id} · ${next.title}`}
          </h2>
          <p className="text-[13px] leading-5 text-[var(--label-2)]">
            {solid} sur 5 solides · 6/8 au drill pour valider
          </p>
        </div>
        <Button
          type="button"
          size="touch"
          className="press h-11 shrink-0 rounded-full px-4"
          onClick={() => onOpenDay(finished ? 5 : next.id)}
        >
          {finished ? "Revoir" : "Ouvrir"}
        </Button>
      </section>

      <section className="home-days" aria-labelledby="days-heading">
        <h2
          id="days-heading"
          className="mb-2 px-1 text-[13px] font-semibold tracking-[0.02em] text-[var(--label-2)] uppercase"
        >
          Les cinq jours
        </h2>
        <ol className="inset">
          {days.map((day) => {
            const score = state.best[day.id]
            const opened = state.opened.includes(day.id)
            const solidDay = solidScore(score)
            const status = solidDay
              ? `${score} %`
              : score !== undefined
                ? `${score} %`
                : opened
                  ? "Ouvert"
                  : `${day.minutes} min`
            const statusLabel = solidDay
              ? `solide, ${score} %`
              : score !== undefined
                ? `en cours, ${score} %`
                : opened
                  ? "fiche ouverte"
                  : `pas encore ouvert, ${day.minutes} minutes`
            return (
              <li key={day.id} className="border-t border-[var(--line)] first:border-t-0">
                <button
                  type="button"
                  className="row press flex min-h-[60px] w-full items-center gap-3 px-3 py-2 text-left"
                  aria-label={`Jour ${day.id}, ${day.title}, ${statusLabel}`}
                  onClick={() => onOpenDay(day.id)}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-[15px] font-semibold tabular-nums"
                    style={{
                      background: solidDay ? "var(--signal)" : "var(--soft)",
                      color: solidDay ? "#fff" : "var(--ink)",
                    }}
                  >
                    {day.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] leading-[1.35] font-semibold tracking-[-0.01em]">
                      {day.title}
                    </span>
                    <span className="block truncate text-[13px] leading-5 text-[var(--label-2)]">
                      {day.promise}
                    </span>
                  </span>
                  <span
                    className="shrink-0 text-[13px] font-medium tabular-nums"
                    style={{
                      color: solidDay ? "var(--good)" : "var(--label-2)",
                    }}
                  >
                    {status}
                  </span>
                  <ChevronRight
                    className="-ml-1 size-[18px] shrink-0 text-[var(--label-3)]"
                    aria-hidden="true"
                  />
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
