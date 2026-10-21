"use client"

import { flushSync } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Dashboard } from "@/components/Dashboard"
import { DayView } from "@/components/DayView"
import { Dock } from "@/components/Dock"
import { ExerciseView } from "@/components/ExerciseView"
import { ListenView } from "@/components/ListenView"
import { ProgressProvider, useProgress } from "@/lib/progress"
import { SpeechProvider } from "@/lib/speech"
import { THEME_KEY } from "@/lib/storage"
import type { DayId, Tab } from "@/lib/types"

export function App() {
  return (
    <ProgressProvider>
      <SpeechProvider>
        <Stage />
      </SpeechProvider>
    </ProgressProvider>
  )
}

function transition(update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (!reduce && typeof document.startViewTransition === "function") {
    document.startViewTransition(() => {
      flushSync(update)
    })
    return
  }
  update()
}

function ThemeButton() {
  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", next)
    document.documentElement.style.colorScheme = next ? "dark" : "light"
    document.documentElement.style.background = next ? "#000000" : "#F3F1EC"
    localStorage.setItem(THEME_KEY, next ? "dark" : "light")
  }

  return (
    <button
      type="button"
      className="press grid size-11 place-items-center rounded-full"
      style={{ background: "var(--soft)" }}
      aria-label="Changer l’apparence"
      onClick={toggleTheme}
    >
      <Sun className="col-start-1 row-start-1 hidden size-5 dark:block" strokeWidth={1.8} />
      <Moon className="col-start-1 row-start-1 size-5 dark:hidden" strokeWidth={1.8} />
    </button>
  )
}

function Stage() {
  const { state, setActiveDay, markOpened } = useProgress()
  const [tab, setTab] = useState<Tab>("home")
  const dayId = state.activeDay
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.speechSynthesis?.cancel()
    scrollerRef.current?.scrollTo(0, 0)
  }, [tab, dayId])

  function openDay(id: DayId) {
    transition(() => {
      setActiveDay(id)
      markOpened(id)
      setTab("lesson")
    })
  }

  function changeTab(next: Tab) {
    transition(() => {
      if (next === "lesson") markOpened(dayId)
      setTab(next)
    })
  }

  return (
    <div className="stage">
      <div className="shell">
        <aside className="rail">
          <div className="rail-head">
            <p className="text-[17px] font-semibold tracking-[-0.03em]">Kommando</p>
            <ThemeButton />
          </div>
          <Dock tab={tab} onChange={changeTab} />
          <p className="rail-foot">Allemand suisse, forme Sie, cinq jours.</p>
        </aside>
        <div className="scroller" ref={scrollerRef}>
          <div className="phone-bar">
            <p className="text-[15px] font-semibold tracking-[-0.03em]">Kommando</p>
            <ThemeButton />
          </div>
          <div className="sheet">
            {tab === "home" && <Dashboard onOpenDay={openDay} />}
            {tab === "lesson" && (
              <DayView
                dayId={dayId}
                onSelectDay={openDay}
                onDrill={() => changeTab("drill")}
              />
            )}
            {tab === "drill" && (
              <ExerciseView
                key={dayId}
                dayId={dayId}
                onLesson={() => changeTab("lesson")}
                onNextDay={() => openDay((dayId + 1) as DayId)}
              />
            )}
            {tab === "voice" && <ListenView />}
          </div>
        </div>
      </div>
    </div>
  )
}
