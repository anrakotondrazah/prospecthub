import Link from 'next/link'

export interface Activity {
  id: number
  uuid: string
  activity_type: 'note' | 'call' | 'email' | 'meeting' | 'task' | 'other'
  subject: string | null
  body: string | null
  outcome: string | null
  duration_minutes: number | null
  activity_date: string
  associated_lead_id: number | null
  associated_company_id: number | null
  associated_deal_id: number | null
  created_at: string
}

export const ACTIVITY_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  note: {
    icon: 'M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z',
    bg: 'bg-[#E3F2FD]',
    color: '#1565C0',
  },
  call: {
    icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
    bg: 'bg-[#E8F5E9]',
    color: '#147A3A',
  },
  email: {
    icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    bg: 'bg-[#FFF3E0]',
    color: '#E65100',
  },
  meeting: {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    bg: 'bg-[#E8EAF6]',
    color: '#3949AB',
  },
  task: {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    bg: 'bg-[#F5F5F5]',
    color: '#616161',
  },
  other: {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: 'bg-[#F5F5F5]',
    color: '#9BA0A6',
  },
}

export const ACTIVITY_LABELS: Record<string, string> = {
  note: 'Note',
  call: 'Appel',
  email: 'Email',
  meeting: 'Reunion',
  task: 'Tache',
  other: 'Autre',
}

interface ActivityItemProps {
  activity: Activity
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const config = ACTIVITY_ICONS[activity.activity_type] || ACTIVITY_ICONS.other
  const label = ACTIVITY_LABELS[activity.activity_type] || 'Activité'

  const time = new Date(activity.activity_date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex gap-4 p-4 hover:bg-[#F5F7F9]/50 transition-colors">
      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={config.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={config.icon} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-medium text-[#9BA0A6] uppercase">{label}</span>
            {activity.subject && (
              <p className="font-medium text-[#0D0F14] mt-0.5">{activity.subject}</p>
            )}
          </div>
          <span className="text-xs text-[#9BA0A6] flex-shrink-0">{time}</span>
        </div>
        {activity.body && (
          <p className="text-sm text-[#4E525A] mt-1 line-clamp-2">{activity.body}</p>
        )}
        {activity.outcome && (
          <p className="text-xs text-[#9BA0A6] mt-1">
            Résultat: {activity.outcome}
          </p>
        )}
        {activity.duration_minutes && (
          <p className="text-xs text-[#9BA0A6] mt-1">
            Duree: {activity.duration_minutes} min
          </p>
        )}
        <div className="flex gap-2 mt-2">
          {activity.associated_lead_id && (
            <Link
              href={`/leads/${activity.associated_lead_id}`}
              className="text-xs text-[#1565C0] hover:underline"
            >
              Voir le lead
            </Link>
          )}
          {activity.associated_company_id && (
            <Link
              href={`/companies/${activity.associated_company_id}`}
              className="text-xs text-[#1565C0] hover:underline"
            >
              Voir l&apos;entreprise
            </Link>
          )}
          {activity.associated_deal_id && (
            <Link
              href="/deals"
              className="text-xs text-[#1565C0] hover:underline"
            >
              Voir l&apos;affaire
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
