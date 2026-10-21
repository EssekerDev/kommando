"use client"

import { useEffect, useRef } from "react"
import { AudioLines, BookOpen, House, Target } from "lucide-react"
import type { Tab } from "@/lib/types"

const items: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Programme", icon: House },
  { id: "lesson", label: "Fiches", icon: BookOpen },
  { id: "drill", label: "Drill", icon: Target },
  { id: "voice", label: "Voix", icon: AudioLines },
]

const LENS = 92
const MAG = 1.92

function phoneBar() {
  const wide = window.matchMedia("(min-width: 1100px)").matches
  const desk = window.matchMedia("(min-width: 960px) and (pointer: fine)").matches
  return !(wide || desk)
}

export function Dock({
  tab,
  onChange,
}: {
  tab: Tab
  onChange: (tab: Tab) => void
}) {
  const dockRef = useRef<HTMLElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const fromPointer = useRef(false)
  const raf = useRef(0)
  const live = useRef({
    dragging: false,
    targetX: 0,
    homeX: 0,
    x: 0,
    vx: 0,
    scale: 0.58,
    scaleV: 0,
    targetScale: 0.58,
    opacity: 0,
    inner: 1,
    innerV: 0,
    targetInner: 1,
    warp: 0,
    flat: 0,
    flatV: 0,
    targetFlat: 0,
    melt: false,
  })

  function paint() {
    const lens = lensRef.current
    const dock = dockRef.current
    const motion = live.current
    if (!lens || !dock) return
    const rect = dock.getBoundingClientRect()
    lens.style.opacity = motion.opacity.toFixed(3)
    lens.style.visibility = motion.opacity < 0.02 ? "hidden" : "visible"
    lens.style.setProperty("--warp", Math.min(1, motion.warp / 14).toFixed(3))
    const flatY = 1 - motion.flat * 0.66
    lens.style.transform = `translate3d(${motion.x - LENS / 2}px, -62%, 0) scale(${motion.scale}, ${motion.scale * flatY})`

    const skew = Math.max(-9, Math.min(9, motion.vx * 0.34))
    const squash = 1 - Math.min(0.08, Math.abs(motion.vx) * 0.006)
    const ca = 2.2 + Math.min(5.5, Math.abs(motion.vx) * 0.32)
    const base = `scale(${motion.inner}) scaleY(${squash}) skewX(${skew}deg)`
    const focusY = rect.height * 0.4
    lens.querySelectorAll<HTMLElement>(".lens-clone").forEach((node) => {
      const shift = Number(node.dataset.shift || 0)
      node.style.width = `${rect.width}px`
      node.style.height = `${rect.height}px`
      node.style.left = `${LENS / 2 - motion.x}px`
      node.style.top = `${LENS / 2 - focusY}px`
      node.style.transformOrigin = `${motion.x}px ${focusY}px`
      node.style.transform = shift
        ? `translate3d(${shift * ca}px, ${shift * ca * 0.2}px, 0) ${base}`
        : base
    })

    const sheen = lens.querySelector<HTMLElement>(".lens-sheen")
    if (sheen) sheen.style.transform = `translate(${(-skew * 1.4).toFixed(2)}px, 0)`

    dock.querySelectorAll<HTMLElement>(":scope > button").forEach((button) => {
      if (motion.opacity < 0.02) {
        button.style.opacity = ""
        return
      }
      const box = button.getBoundingClientRect()
      const center = box.left + box.width / 2 - rect.left
      const cover = Math.max(0, 1 - Math.abs(center - motion.x) / (LENS * 0.58))
      button.style.opacity = (1 - cover * Math.min(1, motion.opacity)).toFixed(3)
    })
  }

  function frame() {
    const motion = live.current
    const stiff = motion.dragging ? 0.32 : 0.18
    const damp = motion.dragging ? 0.56 : 0.72
    motion.vx += (motion.targetX - motion.x) * stiff
    motion.vx *= damp
    motion.x += motion.vx

    motion.scaleV += (motion.targetScale - motion.scale) * 0.18
    motion.scaleV *= 0.7
    motion.scale += motion.scaleV

    const innerStiff = motion.dragging ? 0.14 : 0.32
    motion.innerV += (motion.targetInner - motion.inner) * innerStiff
    motion.innerV *= motion.dragging ? 0.72 : 0.62
    motion.inner += motion.innerV

    motion.flatV += (motion.targetFlat - motion.flat) * (motion.dragging ? 0.28 : 0.14)
    motion.flatV *= 0.72
    motion.flat += motion.flatV

    const speed = Math.abs(motion.vx)
    const targetWarp = motion.dragging ? Math.min(18, speed * 1.15) : 0
    motion.warp += (targetWarp - motion.warp) * 0.18

    let targetOpacity = 0
    if (motion.dragging) targetOpacity = 1
    else if (motion.melt) {
      const settled = motion.flat > 0.84 && Math.abs(motion.x - motion.homeX) < 8
      targetOpacity = settled ? 0 : 1
    }
    motion.opacity += (targetOpacity - motion.opacity) * (motion.dragging ? 0.28 : 0.12)

    paint()

    const alive =
      motion.dragging ||
      motion.opacity > 0.02 ||
      Math.abs(motion.vx) > 0.15 ||
      Math.abs(motion.scaleV) > 0.003 ||
      Math.abs(motion.innerV) > 0.003 ||
      Math.abs(motion.flatV) > 0.003
    if (alive) raf.current = requestAnimationFrame(frame)
    else {
      raf.current = 0
      motion.melt = false
      if (lensRef.current) lensRef.current.style.visibility = "hidden"
      dockRef.current?.querySelectorAll<HTMLElement>("scope > button").forEach((button) => {
        button.style.opacity = ""
      })
    }
  }

  function wake() {
    if (!raf.current) raf.current = requestAnimationFrame(frame)
  }

  useEffect(() => {
    return () => cancelAnimationFrame(raf.current)
  }, [])

  function localX(clientX: number) {
    const rect = dockRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return 0
    return Math.max(8, Math.min(rect.width - 8, clientX - rect.left))
  }

  function indexAt(x: number) {
    const width = dockRef.current?.getBoundingClientRect().width ?? 1
    return Math.max(0, Math.min(items.length - 1, Math.floor((x / width) * items.length)))
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0 || !phoneBar()) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const x = localX(event.clientX)
    const motion = live.current
    motion.dragging = true
    motion.melt = false
    motion.targetX = x
    motion.x = x
    motion.vx = 0
    motion.scale = Math.min(motion.scale, 0.72)
    motion.scaleV = 0.12
    motion.targetScale = 1
    motion.targetInner = MAG
    motion.targetFlat = 0
    motion.opacity = Math.max(motion.opacity, 0.04)
    event.currentTarget.setPointerCapture(event.pointerId)
    wake()
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!live.current.dragging) return
    live.current.targetX = localX(event.clientX)
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    const motion = live.current
    if (!motion.dragging) return
    motion.dragging = false
    const rect = dockRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = localX(event.clientX)
    const index = indexAt(x)
    const near = Math.abs(event.clientY - (rect.top + rect.height / 2)) < rect.height * 1.6
    motion.homeX = ((index + 0.5) * rect.width) / items.length
    motion.targetX = motion.homeX
    motion.targetInner = 1
    motion.targetFlat = 1
    motion.melt = true
    if (near && items[index].id !== tab) {
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
    motion.melt = true
    motion.targetInner = 1
    motion.targetFlat = 1
    motion.targetScale = 0.86
    motion.homeX = motion.x
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
          <span className="lens-label" style={{ visibility: "hidden" }}>
            {item.label}
          </span>
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
        <div className="lens-clone lens-ca" data-shift="1">
          {faces()}
        </div>
        <div className="lens-clone lens-ca" data-shift="-1">
          {faces()}
        </div>
        <div className="lens-clone">{faces()}</div>
        <div className="lens-sheen" />
        <div className="lens-rim" />
      </div>
    </nav>
  )
}
