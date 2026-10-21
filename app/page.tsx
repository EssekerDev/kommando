"use client"

import dynamic from "next/dynamic"
import { BootScreen } from "@/components/BootScreen"

const App = dynamic(() => import("@/components/App").then((mod) => mod.App), {
  ssr: false,
  loading: () => <BootScreen />,
})

export default function Page() {
  return <App />
}
