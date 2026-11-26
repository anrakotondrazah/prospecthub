'use client'

import { useState, useRef, useEffect } from 'react'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabBarProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
  variant?: 'pill' | 'underline' | 'dot'
}

export function TabBar({ tabs, defaultTab, onChange, className = '', variant = 'pill' }: TabBarProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const [pillStyle, setPillStyle] = useState({ width: 0, transform: 'translateX(0px)' })
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLLabelElement>>(new Map())

  const handleChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  useEffect(() => {
    const activeLabel = tabRefs.current.get(activeTab)
    if (activeLabel && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const labelRect = activeLabel.getBoundingClientRect()
      setPillStyle({
        width: labelRect.width,
        transform: `translateX(${labelRect.left - containerRect.left - 4}px)`
      })
    }
  }, [activeTab, tabs])

  if (variant === 'underline') {
    return (
      <div ref={containerRef} className={`tab-bar-underline ${className}`} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((tab) => (
          <div key={tab.id}>
            <input
              type="radio"
              name="tab-bar-underline"
              id={`tab-ul-${tab.id}`}
              checked={activeTab === tab.id}
              onChange={() => handleChange(tab.id)}
              className="sr-only peer"
            />
            <label
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
              htmlFor={`tab-ul-${tab.id}`}
              className="flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {tab.icon}
              <span>{tab.label}</span>
            </label>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'dot') {
    return (
      <div ref={containerRef} className={`tab-bar tab-bar-dot ${className}`} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((tab) => (
          <div key={tab.id}>
            <input
              type="radio"
              name="tab-bar-dot"
              id={`tab-dot-${tab.id}`}
              checked={activeTab === tab.id}
              onChange={() => handleChange(tab.id)}
              className="sr-only peer"
            />
            <label
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
              htmlFor={`tab-dot-${tab.id}`}
              className="relative flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {tab.icon}
              <span>{tab.label}</span>
            </label>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`tab-bar relative ${className}`} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      <div
        className="tab-bar-pill"
        style={{
          width: pillStyle.width,
          transform: pillStyle.transform,
        }}
      />
      {tabs.map((tab) => (
        <div key={tab.id}>
          <input
            type="radio"
            name="tab-bar-pill"
            id={`tab-pill-${tab.id}`}
            checked={activeTab === tab.id}
            onChange={() => handleChange(tab.id)}
            className="sr-only peer"
          />
          <label
            ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
            htmlFor={`tab-pill-${tab.id}`}
            className="flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </label>
        </div>
      ))}
    </div>
  )
}

// Version mobile bottom navigation
export function MobileTabBar({ tabs, defaultTab, onChange }: TabBarProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-300 ${
              activeTab === tab.id
                ? 'text-foreground bg-muted'
                : 'text-muted-foreground'
            }`}
          >
            <div className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-primary animate-scale-in" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
