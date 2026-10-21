"use client"

import { useEffect, useRef, useState } from "react"
import { Moon, Square, Sun } from "lucide-react"
import { cn } from "cn"
import { Dashboard } from "@/components/Dashboard"
import { DayView } from "@/components/DayView"
import { Dock } from "@/components/Dock"
import { ExerciseView } from "@/components/ExerciseView"
import { ListenView } from "@/components/ListenView"
import { dayById } from "@/lib/curriculum"
import { ProgressProvider, useProgress } from "@/lib/progress"
import { SpeechProvider, useSpeech } from "@/lib/speech"
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
      className="press grid size-11 place-items-center rounded-full text-[var(--label-2)]"
      aria-label="Changer l’apparence"
      onClick={toggleTheme}
    >
      <Sun className="col-start-1 row-start-1 hidden size-5 dark:block" strokeWidth={1.8} />
      <Moon className="col-start-1 row-start-1 size-5 dark:hidden" strokeWidth={1.8} />
    </button>
  )
}

function MiniPlayer() {
  const speech = useSpeech()
  if (!speech.speakingId) return null
  const slow = speech.rate < 1
  return (
    <div className="mini-player glass" role="status" aria-live="polite">
      <span className="wave" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <p className="min-w-0 flex-1 truncate text-[15px] font-medium" lang="de-CH" translate="no">
        {speech.current}
      </p>
      <button
        type="button"
        className="press h-11 shrink-0 rounded-full px-2.5 text-[13px] font-semibold tabular-nums text-[var(--signal)]"
        aria-label={slow ? "Passer en vitesse normale" : "Passer en vitesse lente"}
        onClick={() => speech.setRate(slow ? 1 : 0.78)}
      >
        {slow ? "Lent" : "Normal"}
      </button>
      <button
        type="button"
        className="press grid size-11 shrink-0 place-items-center rounded-full bg-[var(--signal)] text-white"
        aria-label="Arrêter la lecture"
        onClick={speech.stop}
      >
        <Square className="size-3.5 fill-current" />
      </button>
    </div>
  )
}

const tabTitles: Record<Tab, string> = {
  home: "Programme",
  lesson: "Fiches",
  drill: "Drill",
  voice: "Voix",
}

function Stage() {
  const { state, setActiveDay, markOpened } = useProgress()
  const speech = useSpeech()
  const [tab, setTab] = useState<Tab>("home")
  const dayId = state.activeDay
  const scrollerRef = useRef<HTMLDivElement>(null)
  const title = tab === "lesson" ? dayById(dayId).title : tabTitles[tab]

  function onScroll() {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.classList.toggle("is-scrolled", scroller.scrollTop > 48)
  }

  useEffect(() => {
    window.speechSynthesis?.cancel()
    scrollerRef.current?.scrollTo(0, 0)
    scrollerRef.current?.classList.remove("is-scrolled")
  }, [tab, dayId])

  function openDay(id: DayId) {
    setActiveDay(id)
    markOpened(id)
    setTab("lesson")
  }

  function changeTab(next: Tab) {
    if (next === "lesson") markOpened(dayId)
    setTab(next)
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
        <div
          className={cn("scroller", speech.speakingId && "has-player")}
          ref={scrollerRef}
          onScroll={onScroll}
        >
          <div className="phone-bar">
            <span className="size-11" aria-hidden="true" />
            <p
              className="phone-title truncate text-[17px] font-semibold tracking-[-0.02em]"
              aria-hidden="true"
            >
              {title}
            </p>
            <ThemeButton />
          </div>
          <div className="sheet">
            {tab === "home" && <Dashboard onOpenDay={openDay} />}
            {tab === "lesson" && (
              <DayView dayId={dayId} onSelectDay={openDay} onDrill={() => changeTab("drill")} />
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
        <MiniPlayer />
      </div>
    </div>
  )
}
