import type { DayId, ProgressState } from "@/lib/types"

export const PROGRESS_KEY = "kommando-progress"
export const THEME_KEY = "kommando-theme"

export const defaultProgress: ProgressState = {
  name: "",
  activeDay: 1,
  opened: [],
  best: {},
}

const DAYS: DayId[] = [1, 2, 3, 4, 5]

function isDayId(value: unknown): value is DayId {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return defaultProgress
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    const opened = Array.isArray(parsed.opened)
      ? parsed.opened.filter(isDayId)
      : []
    const best: ProgressState["best"] = {}
    if (parsed.best && typeof parsed.best === "object") {
      for (const day of DAYS) {
        const score = parsed.best[day]
        if (typeof score === "number" && score >= 0 && score <= 100) {
          best[day] = Math.round(score)
        }
      }
    }
    return {
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 24) : "",
      activeDay: isDayId(parsed.activeDay) ? parsed.activeDay : 1,
      opened,
      best,
    }
  } catch {
    return defaultProgress
  }
}

export function learnerName(name: string) {
  const trimmed = name.trim()
  return trimmed.length > 0 ? trimmed : "Alex"
}

export function solidScore(score: number | undefined) {
  return (score ?? -1) >= 75
}
