export type DayId = 1 | 2 | 3 | 4 | 5

export type Phrase = {
  de: string
  fr: string
}

export type Pair = {
  left: string
  right: string
  say?: string
}

export type Slot = {
  label: string
  value: string
}

export type GridItem = {
  n: string
  word: string
}

export type Card = {
  id: string
  kicker: string
  title: string
  body: string
  formula?: Slot[]
  pairs?: Pair[]
  grid?: GridItem[]
  examples?: Phrase[]
}

export type LexItem = {
  label?: string
  de: string
  fr: string
}

export type ChoiceDrill = {
  id: string
  kind: "choice"
  prompt: string
  hint?: string
  speak?: string
  options: { id: string; label: string; de?: boolean }[]
  answer: string
  why: string
}

export type OrderDrill = {
  id: string
  kind: "order"
  prompt: string
  hint?: string
  answer: string[]
  why: string
}

export type Drill = ChoiceDrill | OrderDrill

export type Day = {
  id: DayId
  title: string
  promise: string
  minutes: number
  objectives: string[]
  cards: Card[]
  lexicon: LexItem[]
  drills: Drill[]
  lines: (name: string) => Phrase[]
  email?: (name: string) => { subject: string; body: string }
}

export type Tab = "home" | "lesson" | "drill" | "voice"

export type ProgressState = {
  name: string
  activeDay: DayId
  opened: DayId[]
  best: Partial<Record<DayId, number>>
}
