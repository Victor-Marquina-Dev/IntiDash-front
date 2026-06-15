"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  darkMode?: boolean
  accentColor?: string
}

const VercelTabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, tabs, activeTab, onTabChange, darkMode = false, accentColor, ...props }, ref) => {
    const initialIndex = activeTab
      ? Math.max(0, tabs.findIndex(t => t.id === activeTab))
      : 0

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [activeIndex, setActiveIndex] = useState(initialIndex)
    const [hoverStyle, setHoverStyle] = useState({})
    const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
    const tabRefs = useRef<(HTMLDivElement | null)[]>([])

    // Sync external activeTab → internal index
    useEffect(() => {
      if (activeTab === undefined) return
      const idx = tabs.findIndex(t => t.id === activeTab)
      if (idx !== -1) setActiveIndex(idx)
    }, [activeTab, tabs])

    useEffect(() => {
      if (hoveredIndex !== null) {
        const el = tabRefs.current[hoveredIndex]
        if (el) setHoverStyle({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` })
      }
    }, [hoveredIndex])

    useEffect(() => {
      const el = tabRefs.current[activeIndex]
      if (el) setActiveStyle({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` })
    }, [activeIndex])

    useEffect(() => {
      requestAnimationFrame(() => {
        const el = tabRefs.current[activeIndex]
        if (el) setActiveStyle({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const hoverBg       = darkMode ? 'rgba(255,255,255,0.09)' : 'rgba(14,15,17,0.067)'
    const indicatorBg   = accentColor ?? (darkMode ? 'rgba(255,255,255,0.80)' : '#0e0f11')
    const activeTextC   = darkMode ? 'rgba(255,255,255,0.90)' : '#0e0e10'
    const inactiveTextC = darkMode ? 'rgba(255,255,255,0.42)' : 'rgba(14,15,25,0.55)'

    return (
      <div ref={ref} className={cn("relative overflow-x-auto", className)} {...props}>
        <div className="relative">
          {/* Hover highlight */}
          <div
            className="absolute h-[28px] transition-all duration-300 ease-out rounded-[6px]"
            style={{ ...hoverStyle, background: hoverBg, opacity: hoveredIndex !== null ? 1 : 0 }}
          />

          {/* Active underline indicator */}
          <div
            className="absolute bottom-[-5px] h-[2px] transition-all duration-300 ease-out"
            style={{ ...activeStyle, background: indicatorBg }}
          />

          {/* Tab items */}
          <div className="relative flex items-center gap-[2px]">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                ref={el => { tabRefs.current[index] = el }}
                className="px-3 py-1.5 cursor-pointer h-[28px] transition-colors duration-300 whitespace-nowrap select-none"
                style={{ color: index === activeIndex ? activeTextC : inactiveTextC }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  setActiveIndex(index)
                  onTabChange?.(tab.id)
                }}
              >
                <div className="text-[11px] font-bold leading-none flex items-center justify-center h-full">
                  {tab.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
VercelTabs.displayName = "VercelTabs"

export { VercelTabs }
export type { Tab, TabsProps }
