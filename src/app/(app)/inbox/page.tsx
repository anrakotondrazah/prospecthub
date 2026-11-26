import { createClient } from '@/lib/supabase/server'

export const instant = false

interface Activity {
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

const ACTIVITY_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
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

const ACTIVITY_LABELS: Record<string, string> = {
  note: 'Note',
  call: 'Appel',
  email: 'Email',
  meeting: 'Reunion',
  task: 'Tache',
  other: 'Autre',
}

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">Erreur de chargement</h2>
          <p className="text-[#4E525A] mb-4">Impossible de charger votre profil.</p>
          <a href="/inbox" className="text-[#17191F] font-medium hover:underline">Reessayer</a>
        </div>
      </div>
    )
  }

  const orgId = profile?.organization_id as number | null
  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">Organisation non configuree</h2>
          <p className="text-[#4E525A]">Completez votre onboarding pour acceder a la boite de reception.</p>
        </div>
      </div>
    )
  }

  const { data: activities, error: activitiesError } = await supabase
    .from('activities')
    .select('id, uuid, activity_type, subject, body, outcome, duration_minutes, activity_date, associated_lead_id, associated_company_id, associated_deal_id, created_at')
    .eq('organization_id', orgId)
    .order('activity_date', { ascending: false })
    .limit(50)

  if (activitiesError) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">Boite de reception</h1>
            <p className="text-sm text-[#4E525A]">Vos activites recentes</p>
          </div>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-[#0D0F14] mb-2">Erreur de chargement</p>
            <p className="text-sm text-[#4E525A] mb-4">Impossible de charger les activites.</p>
            <a href="/inbox" className="text-[#17191F] font-medium hover:underline">Reessayer</a>
          </div>
        </div>
      </div>
    )
  }

  const groupedActivities = groupActivitiesByDate(activities || [])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">Boite de reception</h1>
          <p className="text-sm text-[#4E525A]">
            {(activities || []).length} activite{(activities || []).length !== 1 ? 's' : ''} recentes
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/60 bg-[#17191F]/60 rounded-[10px] cursor-not-allowed"
          disabled
          title="Bientot disponible"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle activite
        </button>
      </div>

      {(activities || []).length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#F5F7F9] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
              </svg>
            </div>
            <p className="font-medium text-[#0D0F14] mb-1">Aucune activite</p>
            <p className="text-sm text-[#4E525A]">Les activites de vos leads, entreprises et affaires apparaitront ici</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([dateLabel, dayActivities]) => (
            <div key={dateLabel}>
              <h2 className="text-sm font-semibold text-[#4E525A] uppercase tracking-wider mb-3">
                {dateLabel}
              </h2>
              <div className="bg-white rounded-[14px] border border-[#E2E4E6] divide-y divide-[#E2E4E6]">
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

function ActivityItem({ activity }: { activity: Activity }) {
  const config = ACTIVITY_ICONS[activity.activity_type] || ACTIVITY_ICONS.other
  const label = ACTIVITY_LABELS[activity.activity_type] || 'Activite'

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
            Resultat: {activity.outcome}
          </p>
        )}
        {activity.duration_minutes && (
          <p className="text-xs text-[#9BA0A6] mt-1">
            Duree: {activity.duration_minutes} min
          </p>
        )}
        <div className="flex gap-2 mt-2">
          {activity.associated_lead_id && (
            <a
              href={`/leads/${activity.associated_lead_id}`}
              className="text-xs text-[#1565C0] hover:underline"
            >
              Voir le lead
            </a>
          )}
          {activity.associated_company_id && (
            <a
              href={`/companies/${activity.associated_company_id}`}
              className="text-xs text-[#1565C0] hover:underline"
            >
              Voir l&apos;entreprise
            </a>
          )}
          {activity.associated_deal_id && (
            <a
              href={`/deals`}
              className="text-xs text-[#1565C0] hover:underline"
            >
              Voir l&apos;affaire
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const activity of activities) {
    const date = new Date(activity.activity_date)
    date.setHours(0, 0, 0, 0)

    let label: string
    if (date.getTime() === today.getTime()) {
      label = "Aujourd'hui"
    } else if (date.getTime() === yesterday.getTime()) {
      label = 'Hier'
    } else {
      label = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(activity)
  }

  return groups
}
