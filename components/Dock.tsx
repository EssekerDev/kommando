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

const LENS = 96
const MAG = 1.72

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
  const cloneRef = useRef<HTMLDivElement>(null)
  const glintRef = useRef<HTMLDivElement>(null)
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)
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
    melt: false,
  })

  function paint() {
    const lens = lensRef.current
    const clone = cloneRef.current
    const dock = dockRef.current
    const motion = live.current
    if (!lens || !clone || !dock) return
    const rect = dock.getBoundingClientRect()
    lens.style.opacity = motion.opacity.toFixed(3)
    lens.style.visibility = motion.opacity < 0.02 ? "hidden" : "visible"
    lens.style.setProperty("--warp", Math.min(1, motion.warp / 14).toFixed(3))
    lens.style.transform = `translate3d(${motion.x - LENS / 2}px, -54%, 0) scale(${motion.scale})`
    clone.style.width = `${rect.width}px`
    clone.style.height = `${rect.height}px`
    clone.style.left = `${LENS / 2 - motion.x}px`
    clone.style.top = `${LENS / 2 - rect.height / 2}px`
    clone.style.transformOrigin = `${motion.x}px ${rect.height / 2}px`
    const skew = Math.max(-7, Math.min(7, motion.vx * 0.32))
    clone.style.transform = `scale(${motion.inner}) skewX(${skew}deg)`
    dispRef.current?.setAttribute("scale", motion.warp.toFixed(2))
    if (glintRef.current) {
      glintRef.current.style.transform = `translate(${(-skew * 1.6).toFixed(2)}px, 0)`
    }
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

    motion.innerV += (motion.targetInner - motion.inner) * 0.14
    motion.innerV *= 0.72
    motion.inner += motion.innerV

    const speed = Math.abs(motion.vx)
    const targetWarp = motion.dragging ? Math.min(18, speed * 1.2) : 0
    motion.warp += (targetWarp - motion.warp) * 0.18

    let targetOpacity = 0
    if (motion.dragging) targetOpacity = 1
    else if (motion.melt) {
      const settled = Math.abs(motion.inner - 1) < 0.06 && Math.abs(motion.x - motion.homeX) < 8
      targetOpacity = settled ? 0 : 1
      if (settled) motion.targetScale = 0.78
    }
    motion.opacity += (targetOpacity - motion.opacity) * (motion.dragging ? 0.28 : 0.12)

    paint()

    const alive =
      motion.dragging ||
      motion.opacity > 0.02 ||
      Math.abs(motion.vx) > 0.15 ||
      Math.abs(motion.scaleV) > 0.003 ||
      Math.abs(motion.innerV) > 0.003
    if (alive) raf.current = requestAnimationFrame(frame)
    else {
      raf.current = 0
      motion.melt = false
      if (lensRef.current) lensRef.current.style.visibility = "hidden"
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
    motion.targetScale = 0.7
    motion.homeX = motion.x
    wake()
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
        <div className="lens-clone" ref={cloneRef}>
          {items.map((item) => {
            const active = tab === item.id
            const Icon = item.icon
            return (
              <span key={item.id} className="flex flex-col items-center justify-center gap-0.5">
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
              </span>
            )
          })}
        </div>
        <div className="lens-glint" ref={glintRef} />
        <div className="lens-rim" />
      </div>
      <svg className="dock-filter" aria-hidden="true">
        <filter id="dock-water" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.014 0.026" numOctaves="2" seed="4" result="noise">
            <animate
              attributeName="baseFrequency"
              values="0.012 0.02;0.02 0.032;0.012 0.02"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </nav>
  )
}
