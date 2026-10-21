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
  const radius = 28
  const circ = 2 * Math.PI * radius
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true" className="shrink-0">
      <circle
        cx="38"
        cy="38"
        r={radius}
        fill="none"
        stroke="var(--ink)"
        strokeOpacity="0.12"
        strokeWidth="6"
      />
      <circle
        cx="38"
        cy="38"
        r={radius}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - value)}
        transform="rotate(-90 38 38)"
      />
    </svg>
  )
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

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header>
        <p className="text-[12px] font-medium tracking-[0.16em] text-[var(--label-2)] uppercase">
          Programme commando
        </p>
        <h1
          className="mt-1 text-[34px] leading-[1.15] font-semibold tracking-[-0.03em]"
          suppressHydrationWarning
        >
          {hello}
        </h1>
        <p className="mt-1 text-[17px] leading-6 text-[var(--label-2)]">
          {name ? `${name} · ` : ""}Cinq jours, orthographe suisse, forme Sie.
        </p>
      </header>

      <section className="glass flex items-center gap-4 rounded-3xl p-4">
        <Ring value={solid / 5} />
        <div className="min-w-0">
          <p className="text-[22px] leading-7 font-semibold tracking-[-0.02em]">
            {solid === 0 ? "Rien n’est solide." : `${solid} jour${solid > 1 ? "s" : ""} solide${solid > 1 ? "s" : ""}.`}
          </p>
          <p className="mt-1 text-[15px] leading-5 text-[var(--label-2)]">
            Un jour est solide à partir de 6/8 au drill. Le prochain : jour {next.id}.
          </p>
          <Button
            type="button"
            size="touch"
            className="press mt-3 h-11 px-4"
            onClick={() => onOpenDay(next.id)}
          >
            Ouvrir le jour {next.id}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-medium tracking-[0.08em] text-[var(--label-3)] uppercase">
          Les cinq jours
        </h2>
        <ol className="flex flex-col gap-2">
          {days.map((day) => {
            const score = state.best[day.id]
            const opened = state.opened.includes(day.id)
            const solidDay = solidScore(score)
            const status = solidDay
              ? `Solide · ${score}%`
              : opened
                ? score !== undefined
                  ? `En cours · ${score}%`
                  : "Fiche ouverte"
                : "À ouvrir"
            return (
              <li key={day.id}>
                <button
                  type="button"
                  className="press glass flex min-h-[76px] w-full items-center gap-3 rounded-3xl px-3.5 py-3 text-left"
                  onClick={() => onOpenDay(day.id)}
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-2xl font-mono text-[15px] font-medium tabular-nums"
                    style={{
                      background: solidDay ? "var(--signal)" : "var(--soft)",
                      color: solidDay ? "#fff" : "var(--ink)",
                    }}
                  >
                    0{day.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] leading-6 font-semibold tracking-[-0.01em]">
                      {day.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-[var(--label-2)]">
                      {day.promise}
                    </span>
                    <span
                      className="mt-1 block text-[12px] font-medium"
                      style={{ color: solidDay ? "var(--good)" : "var(--label-3)" }}
                    >
                      {status} · {day.minutes} min
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-[var(--label-3)]" />
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="glass rounded-3xl p-4">
        <label className="block" htmlFor="learner-name">
          <span className="text-[13px] font-medium text-[var(--label-2)]">
            Prénom dans le script
          </span>
          <input
            id="learner-name"
            value={state.name}
            maxLength={24}
            autoComplete="given-name"
            placeholder="Alex"
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl bg-[var(--soft)] px-3 text-[17px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
          />
        </label>
        <p className="mt-3 text-[13px] leading-5 text-[var(--label-2)]">
          {state.name.trim()
            ? `Le script dit « Ich heisse ${learnerName(state.name)} ».`
            : "Sans prénom, le script utilise Alex. L’orthographe reste suisse : heisse, avec ss."}
        </p>
      </section>
    </div>
  )
}
