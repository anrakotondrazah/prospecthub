'use client'

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FileText, Phone, Mail, Calendar, CheckSquare, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'task' | 'other'

export interface Activity {
  id: number
  activity_type: ActivityType
  subject: string | null
  body: string | null
  activity_date: string
  created_at: string
  user?: { full_name: string }
}

interface ActivityTimelineItemProps {
  activity: Activity
  isLast?: boolean
}

const ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  note: FileText,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
  other: MoreHorizontal,
}

const TYPE_COLORS: Record<ActivityType, { bg: string; icon: string }> = {
  note: { bg: 'bg-[#E3F2FD]', icon: 'text-[#1565C0]' },
  call: { bg: 'bg-[#E8F5E9]', icon: 'text-[#147A3A]' },
  email: { bg: 'bg-[#FFF3E0]', icon: 'text-[#E65100]' },
  meeting: { bg: 'bg-[#E8EAF6]', icon: 'text-[#3949AB]' },
  task: { bg: 'bg-[#FCE4EC]', icon: 'text-[#C2185B]' },
  other: { bg: 'bg-[#F5F5F5]', icon: 'text-[#616161]' },
}

const TYPE_LABELS: Record<ActivityType, string> = {
  note: 'Note',
  call: 'Appel',
  email: 'Email',
  meeting: 'Reunion',
  task: 'Tache',
  other: 'Autre',
}

export function ActivityTimelineItem({ activity, isLast = false }: ActivityTimelineItemProps) {
  const [expanded, setExpanded] = useState(false)

  const Icon = ICONS[activity.activity_type] || ICONS.other
  const colors = TYPE_COLORS[activity.activity_type] || TYPE_COLORS.other
  const typeLabel = TYPE_LABELS[activity.activity_type] || 'Activité'

  const relativeDate = formatDistanceToNow(new Date(activity.activity_date), {
    addSuffix: true,
    locale: fr,
  })

  const hasLongContent = activity.body && activity.body.length > 150
  const displayContent = expanded
    ? activity.body
    : activity.body?.slice(0, 150)

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Ligne verticale */}
      {!isLast && (
        <div
          className="absolute left-4 top-10 bottom-0 w-0.5 bg-[#E2E4E6]"
          aria-hidden="true"
        />
      )}

      {/* Point/Icone */}
      <div
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors.bg}`}
      >
        <Icon className={`w-4 h-4 ${colors.icon}`} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.icon}`}>
              {typeLabel}
            </span>
            {activity.user?.full_name && (
              <span className="text-xs text-[#9BA0A6]">
                par {activity.user.full_name}
              </span>
            )}
          </div>
          <time className="text-xs text-[#9BA0A6] flex-shrink-0" dateTime={activity.activity_date}>
            {relativeDate}
          </time>
        </div>

        {activity.subject && (
          <h4 className="text-sm font-medium text-[#0D0F14] mb-1">
            {activity.subject}
          </h4>
        )}

        {activity.body && (
          <div className="text-sm text-[#4E525A]">
            <p className="whitespace-pre-wrap break-words">
              {displayContent}
              {hasLongContent && !expanded && '...'}
            </p>
            {hasLongContent && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-[#1565C0] hover:text-[#0D47A1] mt-1 font-medium"
              >
                {expanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
