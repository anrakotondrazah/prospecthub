'use client'

import { Phone, Mail, FileText, Calendar, CheckSquare, Clock } from 'lucide-react'

export type ActivityType = 'all' | 'note' | 'call' | 'email' | 'meeting' | 'task' | 'other'

interface ActivityFiltersProps {
  selectedType: ActivityType
  onTypeChange: (type: ActivityType) => void
  counts: Record<ActivityType, number>
}

const FILTER_OPTIONS: Array<{
  type: ActivityType
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = [
  { type: 'all', label: 'Toutes', icon: Clock, color: '#9BA0A6' },
  { type: 'call', label: 'Appels', icon: Phone, color: '#147A3A' },
  { type: 'email', label: 'Emails', icon: Mail, color: '#E65100' },
  { type: 'note', label: 'Notes', icon: FileText, color: '#1565C0' },
  { type: 'meeting', label: 'Réunions', icon: Calendar, color: '#3949AB' },
  { type: 'task', label: 'Tâches', icon: CheckSquare, color: '#616161' },
]

export function ActivityFilters({ selectedType, onTypeChange, counts }: ActivityFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((option) => {
        const Icon = option.icon
        const count = counts[option.type] || 0
        const isSelected = selectedType === option.type

        return (
          <button
            key={option.type}
            onClick={() => onTypeChange(option.type)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all
              ${isSelected
                ? 'bg-[#17191F] text-white shadow-sm'
                : 'bg-white/60 text-[#4E525A] hover:bg-white/80 border border-[#E2E4E6]'
              }
            `}
          >
            <Icon
              className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`}
            />
            <span>{option.label}</span>
            {count > 0 && (
              <span className={`
                px-1.5 py-0.5 text-xs rounded-full min-w-[20px] text-center
                ${isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F5F7F9] text-[#4E525A]'
                }
              `}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
