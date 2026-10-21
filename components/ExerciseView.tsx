"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SpeakButton } from "@/components/SpeakButton"
import { dayById } from "@/lib/curriculum"
import { useProgress } from "@/lib/progress"
import type { DayId, Drill } from "@/lib/types"

function shuffle<T>(list: T[]) {
  const next = [...list]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  if (next.length > 1 && next.every((item, index) => item === list[index])) {
    ;[next[0], next[1]] = [next[1], next[0]]
  }
  return next
}

export function ExerciseView({
  dayId,
  onLesson,
  onNextDay,
}: {
  dayId: DayId
  onLesson: () => void
  onNextDay: () => void
}) {
  const day = dayById(dayId)
  const { state, recordScore } = useProgress()
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [placed, setPlaced] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [misses, setMisses] = useState<{ prompt: string; why: string }[]>([])
  const [done, setDone] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const drill = day.drills[index]
  const bank = useMemo(
    () => (drill?.kind === "order" ? shuffle(drill.answer) : []),
    [drill]
  )

  function resetQuestion() {
    setPicked(null)
    setPlaced([])
    setChecked(false)
  }

  function finish(correct: number, missed: { prompt: string; why: string }[]) {
    const percent = Math.round((correct / day.drills.length) * 100)
    recordScore(day.id, percent)
    setCorrectCount(correct)
    setMisses(missed)
    setDone(true)
  }

  function advance(wasCorrect: boolean) {
    const nextCorrect = correctCount + (wasCorrect ? 1 : 0)
    const nextMisses = wasCorrect || !drill
      ? misses
      : [...misses, { prompt: drill.prompt, why: drill.why }]
    if (index === day.drills.length - 1) {
      finish(nextCorrect, nextMisses)
      return
    }
    setCorrectCount(nextCorrect)
    setMisses(nextMisses)
    setIndex((current) => current + 1)
    resetQuestion()
  }

  function grade(wasCorrect: boolean) {
    if (checked) return
    setChecked(true)
    if (!wasCorrect) {
      try {
        navigator.vibrate?.(12)
      } catch {
        /* haptics are optional */
      }
    }
  }

  function restart() {
    setIndex(0)
    setCorrectCount(0)
    setMisses([])
    setDone(false)
    setAttempt((value) => value + 1)
    resetQuestion()
  }

  if (done) {
    const percent = Math.round((correctCount / day.drills.length) * 100)
    const solid = correctCount >= 6
    const best = state.best[day.id] ?? percent
    return (
      <div className="flex flex-col gap-5 pb-4">
        <header>
          <p className="text-[12px] font-medium tracking-[0.16em] text-[var(--label-2)] uppercase">
            Drill · Jour {day.id}
          </p>
          <h1 className="mt-1 text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
            {correctCount}
            <span className="text-[22px] font-medium text-[var(--label-2)]">/{day.drills.length}</span>
          </h1>
          <p className="mt-3 text-[17px] leading-6">
            {solid
              ? "Jour solide. Les fiches restent là si une phrase accroche."
              : "Pas encore solide. Relisez la fiche, puis recommencez."}
          </p>
          <p className="mt-1 text-[13px] text-[var(--label-2)]">
            Cette passe : {percent}%. Meilleur score : {best}%.
          </p>
        </header>

        {misses.length > 0 && (
          <ul className="flex flex-col gap-2">
            {misses.map((miss) => (
              <li key={miss.prompt} className="glass rounded-3xl px-4 py-3">
                <p className="text-[15px] font-medium">{miss.prompt}</p>
                <p className="mt-1 text-[13px] leading-5 text-[var(--label-2)]">{miss.why}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          {solid && day.id < 5 && (
            <Button type="button" size="touch" className="press w-full" onClick={onNextDay}>
              Jour {day.id + 1}
            </Button>
          )}
          <Button type="button" variant="outline" size="touch" className="press w-full bg-transparent" onClick={restart}>
            Refaire le drill
          </Button>
          <Button type="button" variant="ghost" size="touch" className="press w-full" onClick={onLesson}>
            Retour aux fiches
          </Button>
        </div>
      </div>
    )
  }

  if (!drill) return null

  const orderCorrect =
    drill.kind === "order" &&
    placed.length === drill.answer.length &&
    placed.every((token, tokenIndex) => token === drill.answer[tokenIndex])
  const choiceCorrect = drill.kind === "choice" && picked === drill.answer
  const isCorrect = drill.kind === "order" ? orderCorrect : choiceCorrect

  return (
    <div className="flex flex-col gap-4 pb-4" key={attempt}>
      <header>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[12px] font-medium tracking-[0.16em] text-[var(--label-2)] uppercase">
            Jour {day.id} · {day.title}
          </p>
          <p className="font-mono text-[13px] text-[var(--label-2)] tabular-nums">
            {index + 1}/{day.drills.length}
          </p>
        </div>
        <Progress
          value={(index / day.drills.length) * 100}
          aria-label="Avancement du drill"
          className="mt-3"
        />
      </header>

      <Question
        drill={drill}
        bank={bank}
        placed={placed}
        picked={picked}
        checked={checked}
        onPick={(id) => {
          if (checked || drill.kind !== "choice") return
          setPicked(id)
          grade(id === drill.answer)
        }}
        onPlace={(token) => {
          if (checked) return
          setPlaced((current) => [...current, token])
        }}
        onRemove={(tokenIndex) => {
          if (checked) return
          setPlaced((current) => current.filter((_, itemIndex) => itemIndex !== tokenIndex))
        }}
      />

      {checked && (
        <div
          role="status"
          className="rounded-3xl px-4 py-3"
          style={{
            background: isCorrect
              ? "color-mix(in oklab, var(--good) 16%, transparent)"
              : "color-mix(in oklab, var(--bad) 14%, transparent)",
          }}
        >
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase" style={{ color: isCorrect ? "var(--good)" : "var(--bad)" }}>
            {isCorrect ? "Juste" : "À revoir"}
          </p>
          <p className="mt-1 text-[15px] leading-6">{drill.why}</p>
        </div>
      )}

      {drill.kind === "order" && !checked && (
        <Button
          type="button"
          size="touch"
          className="press sticky bottom-[calc(var(--sab)+5.1rem)] w-full"
          disabled={placed.length !== drill.answer.length}
          onClick={() => grade(orderCorrect)}
        >
          Vérifier
        </Button>
      )}

      {checked && (
        <Button
          type="button"
          size="touch"
          className="press sticky bottom-[calc(var(--sab)+5.1rem)] w-full"
          onClick={() => advance(isCorrect)}
        >
          {index === day.drills.length - 1 ? "Voir le score" : "Continuer"}
        </Button>
      )}
    </div>
  )
}

function Question({
  drill,
  bank,
  placed,
  picked,
  checked,
  onPick,
  onPlace,
  onRemove,
}: {
  drill: Drill
  bank: string[]
  placed: string[]
  picked: string | null
  checked: boolean
  onPick: (id: string) => void
  onPlace: (token: string) => void
  onRemove: (index: number) => void
}) {
  const remaining = drill.kind === "order" ? [...bank] : []
  if (drill.kind === "order") {
    for (const token of placed) {
      const index = remaining.indexOf(token)
      if (index >= 0) remaining.splice(index, 1)
    }
  }

  return (
    <div>
      <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.02em]">{drill.prompt}</h1>
      {drill.hint && <p className="mt-1 text-[15px] text-[var(--label-2)]">{drill.hint}</p>}
      {drill.kind === "choice" && drill.speak && (
        <div className="mt-3 flex items-center gap-3">
          <SpeakButton id={drill.id} text={drill.speak} label="Écouter la phrase" />
          <span className="text-[13px] text-[var(--label-2)]">Écoutez, puis choisissez.</span>
        </div>
      )}

      {drill.kind === "choice" && (
        <div className="mt-4 flex flex-col gap-2" role="group" aria-label="Réponses">
          {drill.options.map((option) => {
            const selected = picked === option.id
            const showCorrect = checked && option.id === drill.answer
            const showWrong = checked && selected && option.id !== drill.answer
            return (
              <button
                key={option.id}
                type="button"
                className="press min-h-14 rounded-2xl border px-4 py-3 text-left text-[17px] leading-6 font-medium"
                style={{
                  borderColor: showCorrect ? "var(--good)" : showWrong ? "var(--bad)" : "var(--line)",
                  background: showCorrect
                    ? "color-mix(in oklab, var(--good) 16%, transparent)"
                    : showWrong
                      ? "color-mix(in oklab, var(--bad) 14%, transparent)"
                      : "var(--fill)",
                }}
                lang={option.de ? "de-CH" : undefined}
                translate={option.de ? "no" : undefined}
                aria-pressed={selected}
                onClick={() => onPick(option.id)}
              >
                {(showCorrect || showWrong) && (
                  <span
                    className="mr-2 text-[12px] font-semibold tracking-[0.08em] uppercase"
                    style={{ color: showCorrect ? "var(--good)" : "var(--bad)" }}
                  >
                    {showCorrect ? "Juste" : "Non"}
                  </span>
                )}
                {option.label}
              </button>
            )
          })}
        </div>
      )}

      {drill.kind === "order" && (
        <div className="mt-4">
          <div
            className="flex min-h-[4.5rem] flex-wrap gap-2 rounded-3xl border border-dashed p-3"
            style={{ borderColor: "var(--line)" }}
          >
            {placed.length === 0 && (
              <p className="self-center text-[15px] text-[var(--label-3)]">
                Touchez les mots dans l’ordre.
              </p>
            )}
            {placed.map((token, tokenIndex) => (
              <button
                key={`${token}-${tokenIndex}`}
                type="button"
                className="press h-11 rounded-full bg-[var(--signal)] px-3 text-[16px] font-medium text-white"
                lang="de-CH"
                translate="no"
                onClick={() => onRemove(tokenIndex)}
              >
                {token}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {remaining.map((token) => (
              <button
                key={token}
                type="button"
                className="press h-11 rounded-full border px-3 text-[16px] font-medium"
                style={{ borderColor: "var(--line)", background: "var(--fill)" }}
                lang="de-CH"
                translate="no"
                onClick={() => onPlace(token)}
              >
                {token}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
