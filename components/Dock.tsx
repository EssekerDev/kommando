"use client"

import { AudioLines, BookOpen, House, Target } from "lucide-react"
import type { Tab } from "@/lib/types"

const items: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Programme", icon: House },
  { id: "lesson", label: "Fiches", icon: BookOpen },
  { id: "drill", label: "Drill", icon: Target },
  { id: "voice", label: "Voix", icon: AudioLines },
]

export function Dock({
  tab,
  onChange,
}: {
  tab: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav className="dock" aria-label="Sections">
      {items.map((item) => {
        const active = tab === item.id
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            className="press flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full"
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(item.id)}
          >
            <Icon
              className="size-[22px]"
              strokeWidth={active ? 2.1 : 1.7}
              color={active ? "var(--signal)" : "var(--label-2)"}
            />
            <span
              className="text-[10px] font-medium tracking-tight"
              style={{ color: active ? "var(--signal)" : "var(--label-2)" }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
