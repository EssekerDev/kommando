"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { AudioLines, BookOpen, House, Target } from "lucide-react"
import type { Tab } from "@/lib/types"

const items: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Programme", icon: House },
  { id: "lesson", label: "Fiches", icon: BookOpen },
  { id: "drill", label: "Drill", icon: Target },
  { id: "voice", label: "Voix", icon: AudioLines },
]

const MAG = 1.42

function phoneBar() {
  const wide = window.matchMedia("(min-width: 1100px)").matches
  const desk = window.matchMedia("(min-width: 960px) and (pointer: fine)").matches
  return !(wide || desk)
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function smooth(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export function Dock({
  tab,
  onChange,
}: {
  tab: Tab
  onChange: (tab: Tab) => void
}) {
  const dockRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const tabRef = useRef(tab)
  const fromPointer = useRef(false)
  const raf = useRef(0)
  const live = useRef({
    ready: false,
    dragging: false,
    x: 0,
    vx: 0,
    targetX: 0,
    lift: 0,
    liftV: 0,
    hot: -1,
  })

  function centers() {
    const dock = dockRef.current
    if (!dock) return []
    const left = dock.getBoundingClientRect().left
    return Array.from(dock.querySelectorAll<HTMLElement>("button")).map((button) => {
      const box = button.getBoundingClientRect()
      return box.left + box.width / 2 - left
    })
  }

  function activeIndex() {
    return Math.max(0, items.findIndex((item) => item.id === tabRef.current))
  }

  function paint() {
    const dock = dockRef.current
    const pill = pillRef.current
    const lens = lensRef.current
    if (!dock || !pill || !lens) return
    const motion = live.current
    const rect = dock.getBoundingClientRect()
    const buttons = Array.from(dock.querySelectorAll<HTMLElement>("button"))
    const tabW = buttons[0]?.getBoundingClientRect().width ?? rect.width / items.length

    const up = Math.max(0, motion.lift)
    const down = Math.max(0, -motion.lift)
    const stretch = Math.min(0.3, Math.abs(motion.vx) * 0.02) * Math.min(1, up + 0.35)
    let w = tabW - 6 + 50 * up
    let h = rect.height - 10 + 18 * up
    w *= (1 + stretch) * (1 + down * 0.55)
    h *= (1 - stretch * 0.45) * (1 - down * 0.4)

    const place = `translate3d(${(motion.x - w / 2).toFixed(2)}px, -50%, 0)`
    const glass = smooth(0.06, 0.62, up)

    pill.style.width = `${w}px`
    pill.style.height = `${h}px`
    pill.style.transform = place
    pill.style.opacity = (1 - glass).toFixed(3)

    lens.style.width = `${w}px`
    lens.style.height = `${h}px`
    lens.style.transform = place
    lens.style.opacity = glass.toFixed(3)
    lens.style.visibility = glass < 0.01 ? "hidden" : "visible"
    dock.style.setProperty("--press", Math.min(1.2, up).toFixed(3))

    const focusY = rect.height / 2
    const shear = Math.max(-6, Math.min(6, motion.vx * 0.22))
    const fringe = (0.6 + Math.min(1.6, Math.abs(motion.vx) * 0.1)) * Math.sign(motion.vx || 1)
    lens.querySelectorAll<HTMLElement>(".lens-clone").forEach((node) => {
      const k = Number(node.dataset.mag || 1)
      const side = Number(node.dataset.side || 0)
      const mag = (1 + (MAG - 1) * up) * (1 + (k - 1) * up)
      node.style.width = `${rect.width}px`
      node.style.height = `${rect.height}px`
      node.style.left = `${w / 2 - motion.x}px`
      node.style.top = `${h / 2 - focusY}px`
      node.style.transformOrigin = `${motion.x}px ${focusY}px`
      node.style.transform = `translateX(${(side * fringe).toFixed(2)}px) scale(${mag.toFixed(4)}) skewX(${shear.toFixed(2)}deg)`
    })

    const lit = motion.hot >= 0 ? motion.hot : activeIndex()
    const tint = (node: Element, on: boolean) => {
      const color = on ? "var(--signal)" : "var(--label-2)"
      const icon = node.querySelector("svg")
      const label = node.querySelector("span")
      if (icon instanceof SVGElement) {
        icon.style.color = color
        icon.style.stroke = color
      }
      if (label instanceof HTMLElement) label.style.color = color
    }

    buttons.forEach((button, index) => {
      tint(button, index === lit)
      const box = button.getBoundingClientRect()
      const center = box.left + box.width / 2 - rect.left
      const cover = 1 - smooth(w * 0.34, w * 0.6, Math.abs(center - motion.x))
      button.style.opacity = glass < 0.01 ? "" : (1 - cover * glass).toFixed(3)
    })
    lens.querySelectorAll(".lens-face").forEach((face, index) => {
      tint(face, index % items.length === lit)
    })
  }

  function settle() {
    const motion = live.current
    motion.x = motion.targetX
    motion.vx = 0
    motion.lift = 0
    motion.liftV = 0
    motion.hot = -1
    paint()
    const lit = activeIndex()
    dockRef.current?.querySelectorAll<HTMLElement>("button").forEach((button, index) => {
      button.style.opacity = ""
      const color = index === lit ? "var(--signal)" : "var(--label-2)"
      const icon = button.querySelector("svg")
      const label = button.querySelector("span")
      if (icon instanceof SVGElement) {
        icon.style.removeProperty("stroke")
        icon.style.color = color
      }
      if (label instanceof HTMLElement) label.style.color = color
    })
  }

  function frame() {
    const motion = live.current
    const stiff = motion.dragging ? 0.3 : 0.15
    const damp = motion.dragging ? 0.6 : 0.76
    motion.vx += (motion.targetX - motion.x) * stiff
    motion.vx *= damp
    motion.x += motion.vx

    const travelling = Math.abs(motion.targetX - motion.x) > 12
    const targetLift = motion.dragging ? 1 : travelling ? 0.5 : 0
    motion.liftV += (targetLift - motion.lift) * (targetLift > motion.lift ? 0.24 : 0.16)
    motion.liftV *= 0.7
    motion.lift += motion.liftV

    paint()

    const moving =
      motion.dragging ||
      Math.abs(motion.vx) > 0.04 ||
      Math.abs(motion.targetX - motion.x) > 0.3 ||
      Math.abs(motion.liftV) > 0.002 ||
      Math.abs(motion.lift) > 0.004
    if (moving) raf.current = requestAnimationFrame(frame)
    else {
      raf.current = 0
      settle()
    }
  }

  function wake() {
    if (!raf.current) raf.current = requestAnimationFrame(frame)
  }

  useLayoutEffect(() => {
    tabRef.current = tab
    const motion = live.current
    const target = centers()[activeIndex()]
    if (target === undefined) return
    motion.targetX = target
    if (!motion.ready || reducedMotion()) {
      motion.ready = true
      settle()
      return
    }
    if (!motion.dragging) {
      motion.hot = activeIndex()
      wake()
    }
  })

  useEffect(() => {
    function onResize() {
      const target = centers()[activeIndex()]
      if (target === undefined) return
      live.current.targetX = target
      if (!raf.current) settle()
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  function clampX(clientX: number) {
    const dock = dockRef.current
    const list = centers()
    if (!dock || list.length === 0) return 0
    const x = clientX - dock.getBoundingClientRect().left
    return Math.max(list[0], Math.min(list[list.length - 1], x))
  }

  function nearest(x: number) {
    const list = centers()
    let best = 0
    list.forEach((center, index) => {
      if (Math.abs(center - x) < Math.abs(list[best] - x)) best = index
    })
    return best
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0 || !phoneBar() || reducedMotion()) return
    const motion = live.current
    const x = clampX(event.clientX)
    motion.dragging = true
    motion.targetX = x
    motion.hot = nearest(x)
    motion.liftV += 0.06
    event.currentTarget.setPointerCapture(event.pointerId)
    wake()
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    const motion = live.current
    if (!motion.dragging) return
    const x = clampX(event.clientX)
    motion.targetX = x
    motion.hot = nearest(x)
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    const motion = live.current
    if (!motion.dragging) return
    motion.dragging = false
    const rect = dockRef.current?.getBoundingClientRect()
    if (!rect) return
    const near = Math.abs(event.clientY - (rect.top + rect.height / 2)) < rect.height * 1.6
    const index = near ? nearest(clampX(event.clientX)) : activeIndex()
    motion.hot = index
    motion.targetX = centers()[index] ?? motion.targetX
    if (items[index].id !== tabRef.current) {
      fromPointer.current = true
      onChange(items[index].id)
      window.setTimeout(() => {
        fromPointer.current = false
      }, 0)
    }
    wake()
  }

  function onPointerCancel() {
    const motion = live.current
    if (!motion.dragging) return
    motion.dragging = false
    motion.hot = -1
    motion.targetX = centers()[activeIndex()] ?? motion.targetX
    wake()
  }

  function faces() {
    return items.map((item) => {
      const active = tab === item.id
      const Icon = item.icon
      return (
        <span key={item.id} className="lens-face">
          <Icon
            className="size-[22px]"
            strokeWidth={active ? 2.15 : 1.7}
            color={active ? "var(--signal)" : "var(--label-2)"}
          />
          <span className="lens-label">{item.label}</span>
        </span>
      )
    })
  }

  return (
    <nav
      ref={dockRef}
      className="dock"
      aria-label="Sections"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="pill" ref={pillRef} aria-hidden="true" />
      {items.map((item) => {
        const active = tab === item.id
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full"
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (fromPointer.current) {
                fromPointer.current = false
                return
              }
              onChange(item.id)
            }}
          >
            <Icon
              className="size-[22px]"
              strokeWidth={active ? 2.15 : 1.7}
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
      <div className="lens" ref={lensRef} aria-hidden="true">
        <div className="lens-layer">
          <div className="lens-clone">{faces()}</div>
        </div>
        <div className="lens-layer lens-edge">
          <div className="lens-clone" data-mag="1.08">
            {faces()}
          </div>
        </div>
        <div className="lens-layer lens-ca lens-red">
          <div className="lens-clone" data-mag="1.03" data-side="1">
            {faces()}
          </div>
        </div>
        <div className="lens-layer lens-ca lens-blue">
          <div className="lens-clone" data-mag="1.01" data-side="-1">
            {faces()}
          </div>
        </div>
        <div className="lens-sheen" />
        <div className="lens-iris" />
        <div className="lens-rim" />
      </div>
    </nav>
  )
}
