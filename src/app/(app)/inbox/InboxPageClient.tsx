'use client'

import { useState, useMemo } from 'react'
import { Activity, ActivityItem } from '@/components/inbox/ActivityItem'
import { ActivityFilters, ActivityType } from '@/components/inbox/ActivityFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { FillButton } from '@/components/ui/buttons'

interface InboxPageClientProps {
  initialActivities: Activity[]
}

export function InboxPageClient({ initialActivities }: InboxPageClientProps) {
  const [selectedType, setSelectedType] = useState<ActivityType>('all')

  // Filter activities by type
  const filteredActivities = useMemo(() => {
    if (selectedType === 'all') return initialActivities
    return initialActivities.filter((activity) => activity.activity_type === selectedType)
  }, [initialActivities, selectedType])

  // Count activities by type
  const counts = useMemo(() => {
    const result: Record<ActivityType, number> = {
      all: initialActivities.length,
      note: 0,
      call: 0,
      email: 0,
      meeting: 0,
      task: 0,
      other: 0,
    }

    for (const activity of initialActivities) {
      result[activity.activity_type] = (result[activity.activity_type] || 0) + 1
    }

    return result
  }, [initialActivities])

  // Group activities by date
  const groupedActivities = useMemo(() => {
    return groupActivitiesByDate(filteredActivities)
  }, [filteredActivities])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">
            Boite de reception
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredActivities.length} activité{filteredActivities.length !== 1 ? 's' : ''}
            {selectedType !== 'all' && ' filtrees'}
          </p>
        </div>
        <FillButton disabled title="Fonctionnalite bientot disponible">
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle activité
          </span>
        </FillButton>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ActivityFilters
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          counts={counts}
        />
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white dark:bg-[#0D1117] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D]">
          <EmptyState type="inbox" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([dateLabel, dayActivities]) => (
            <div key={dateLabel}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {dateLabel}
              </h2>
              <div className="bg-card rounded-[14px] border border-border divide-y divide-border">
                {dayActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  for (const activity of activities) {
    const date = new Date(activity.activity_date)
    date.setHours(0, 0, 0, 0)

    let label: string
    if (date.getTime() === today.getTime()) {
      label = "Aujourd'hui"
    } else if (date.getTime() === yesterday.getTime()) {
      label = 'Hier'
    } else if (date.getTime() > weekAgo.getTime()) {
      label = 'Cette semaine'
    } else {
      label = 'Plus ancien'
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(activity)
  }

  return groups
}
