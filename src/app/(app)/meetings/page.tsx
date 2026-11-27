import { createClient } from '@/lib/supabase/server'
import { MeetingsPageClient } from './MeetingsPageClient'

export const instant = false

export default async function MeetingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.organization_id) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
            {profileError ? 'Erreur de chargement' : 'Organisation non configuree'}
          </h2>
          <p className="text-[#4E525A] dark:text-[#8B949E]">
            {profileError ? 'Impossible de charger votre profil.' : 'Completez votre onboarding pour acceder aux reunions.'}
          </p>
        </div>
      </div>
    )
  }

  const orgId = profile.organization_id as number

  // Get upcoming meetings
  const { data: meetings, error: meetingsError } = await supabase
    .from('meetings')
    .select(`
      id,
      uuid,
      title,
      description,
      meeting_type,
      start_time,
      end_time,
      duration_minutes,
      location,
      video_link,
      status,
      color,
      organizer_id,
      associated_company_id,
      associated_deal_id
    `)
    .eq('organization_id', orgId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(50)

  return (
    <MeetingsPageClient
      initialMeetings={meetings || []}
      organizationId={orgId}
      userId={user.id}
      error={meetingsError?.message}
    />
  )
}
