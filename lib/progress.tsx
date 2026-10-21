"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  defaultProgress,
  loadProgress,
  PROGRESS_KEY,
} from "@/lib/storage"
import type { DayId, ProgressState } from "@/lib/types"

type ProgressApi = {
  state: ProgressState
  setName: (name: string) => void
  setActiveDay: (day: DayId) => void
  markOpened: (day: DayId) => void
  recordScore: (day: DayId, percent: number) => void
}

const ProgressContext = createContext<ProgressApi | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() =>
    typeof window === "undefined" ? defaultProgress : loadProgress()
  )

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state))
  }, [state])

  const api = useMemo<ProgressApi>(
    () => ({
      state,
      setName: (name) =>
        setState((current) => ({ ...current, name: name.slice(0, 24) })),
      setActiveDay: (day) =>
        setState((current) =>
          current.activeDay === day ? current : { ...current, activeDay: day }
        ),
      markOpened: (day) =>
        setState((current) =>
          current.opened.includes(day)
            ? current
            : { ...current, opened: [...current.opened, day], activeDay: day }
        ),
      recordScore: (day, percent) =>
        setState((current) => {
          const previous = current.best[day] ?? 0
          const next = Math.max(previous, Math.round(percent))
          return {
            ...current,
            activeDay: day,
            opened: current.opened.includes(day)
              ? current.opened
              : [...current.opened, day],
            best: { ...current.best, [day]: next },
          }
        }),
    }),
    [state]
  )

  return (
    <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
  )
}

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error("useProgress doit être utilisé dans ProgressProvider")
  return value
}
