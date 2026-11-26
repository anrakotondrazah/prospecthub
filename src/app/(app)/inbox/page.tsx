import { createClient } from '@/lib/supabase/server'
import { InboxPageClient } from './InboxPageClient'
import { type Activity, ACTIVITY_ICONS, ACTIVITY_LABELS } from '@/components/inbox/ActivityItem'

export const instant = false

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

  const { data: activities } = await supabase
    .from('activities')
    .select('id, uuid, activity_type, subject, body, outcome, duration_minutes, activity_date, associated_lead_id, associated_company_id, associated_deal_id, created_at')
    .eq('organization_id', orgId)
    .order('activity_date', { ascending: false })
    .limit(100)

  return <InboxPageClient initialActivities={activities || []} />
}
