"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

type SpeechApi = {
  supported: boolean
  voiceLabel: string | null
  german: boolean
  rate: number
  setRate: (rate: number) => void
  speakingId: string | null
  speak: (id: string, text: string) => void
  speakAll: (id: string, lines: string[]) => void
  stop: () => void
}

const SpeechContext = createContext<SpeechApi | null>(null)

function rankVoice(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.toLowerCase()
  if (lang.startsWith("de-ch")) return 0
  if (lang.startsWith("de-de")) return 1
  if (lang.startsWith("de")) return 2
  return 9
}

function pickVoice(synth: SpeechSynthesis) {
  return synth
    .getVoices()
    .filter((voice) => rankVoice(voice) < 9)
    .sort((a, b) => rankVoice(a) - rankVoice(b))[0]
}

function configure(utterance: SpeechSynthesisUtterance, rate: number) {
  const synth = window.speechSynthesis
  const voice = pickVoice(synth)
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  } else {
    utterance.lang = "de-CH"
  }
  utterance.rate = rate
  utterance.pitch = 1
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [supported, setSupported] = useState(false)
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null)
  const [german, setGerman] = useState(false)
  const [rate, setRate] = useState(1)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const rateRef = useRef(rate)

  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const refresh = () => {
      setSupported(true)
      const voice = pickVoice(synth)
      setGerman(Boolean(voice))
      setVoiceLabel(voice ? `${voice.name} · ${voice.lang}` : null)
    }
    refresh()
    synth.addEventListener("voiceschanged", refresh)
    return () => synth.removeEventListener("voiceschanged", refresh)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeakingId(null)
  }, [])

  const speakAll = useCallback((id: string, lines: string[]) => {
    const synth = window.speechSynthesis
    if (!synth || lines.length === 0) return
    setSpeakingId(id)
    synth.cancel()
    if (synth.paused) synth.resume()
    lines.forEach((text, index) => {
      const utterance = new SpeechSynthesisUtterance(text)
      configure(utterance, rateRef.current)
      if (index === lines.length - 1) {
        utterance.onend = () =>
          setSpeakingId((current) => (current === id ? null : current))
        utterance.onerror = (event) => {
          if (event.error === "canceled" || event.error === "interrupted") {
            setSpeakingId((current) => (current === id ? null : current))
            return
          }
          setSpeakingId(null)
        }
      }
      synth.speak(utterance)
    })
  }, [])

  const speak = useCallback((id: string, text: string) => speakAll(id, [text]), [speakAll])

  const api = useMemo<SpeechApi>(
    () => ({
      supported,
      voiceLabel,
      german,
      rate,
      setRate,
      speakingId,
      speak,
      speakAll,
      stop,
    }),
    [german, rate, speak, speakAll, speakingId, stop, supported, voiceLabel]
  )

  return <SpeechContext.Provider value={api}>{children}</SpeechContext.Provider>
}

export function useSpeech() {
  const value = useContext(SpeechContext)
  if (!value) throw new Error("useSpeech doit être utilisé dans SpeechProvider")
  return value
}
