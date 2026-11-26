'use client'

import { useState } from 'react'

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
}

export function TabBar({ tabs, defaultTab, onChange, className = '' }: TabBarProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <div
      className={`tab-bar ${className}`}
      data-tabs={tabs.length}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
    >
      {tabs.map((tab, index) => (
        <div key={tab.id}>
          <input
            type="radio"
            name="tab-bar"
            id={`tab-${tab.id}`}
            checked={activeTab === tab.id}
            onChange={() => handleChange(tab.id)}
          />
          <label htmlFor={`tab-${tab.id}`} className="flex items-center justify-center gap-1.5">
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border safe-area-pb">
      <div className="tab-bar mx-4 my-2" data-tabs={tabs.length} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((tab) => (
          <div key={tab.id}>
            <input
              type="radio"
              name="mobile-tab"
              id={`mobile-tab-${tab.id}`}
              checked={activeTab === tab.id}
              onChange={() => handleChange(tab.id)}
            />
            <label htmlFor={`mobile-tab-${tab.id}`} className="flex flex-col items-center gap-0.5 py-1">
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </label>
          </div>
        ))}
      </div>
    </nav>
  )
}
