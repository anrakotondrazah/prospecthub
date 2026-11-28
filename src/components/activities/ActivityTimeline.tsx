'use client'

import { ActivityTimelineItem, type Activity } from './ActivityTimelineItem'

interface ActivityTimelineProps {
  activities: Activity[]
  loading?: boolean
  emptyMessage?: string
}

export function ActivityTimeline({
  activities,
  loading = false,
  emptyMessage = 'Aucune activité',
}: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-[#E2E4E6] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#E2E4E6] rounded w-24" />
              <div className="h-3 bg-[#E2E4E6] rounded w-full" />
              <div className="h-3 bg-[#E2E4E6] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 bg-[#F5F7F9] rounded-[10px]">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9BA0A6"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="text-sm text-[#4E525A]">{emptyMessage}</p>
        <p className="text-xs text-[#9BA0A6] mt-1">Les actions apparaitront ici.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {activities.map((activity, index) => (
        <ActivityTimelineItem
          key={activity.id}
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  )
}
