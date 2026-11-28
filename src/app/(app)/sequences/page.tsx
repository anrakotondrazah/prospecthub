import { createClient } from '@/lib/supabase/server'
import { SequencesPageClient } from './SequencesPageClient'

export const instant = false

interface SequenceRow {
  id: number
  uuid: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'paused' | 'archived'
  trigger_type: 'manual' | 'lead_created' | 'deal_stage_changed'
  stats: {
    sent: number
    opened: number
    replied: number
    bounced?: number
  }
  created_at: string
  updated_at: string
  steps_count: { count: number }[]
  enrollments_count: { count: number }[]
}

export default async function SequencesPage() {
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
            {profileError ? 'Erreur de chargement' : 'Organisation non configurée'}
          </h2>
          <p className="text-[#4E525A] dark:text-[#8B949E]">
            {profileError ? 'Impossible de charger votre profil.' : 'Complétez votre onboarding pour accéder aux sequences.'}
          </p>
        </div>
      </div>
    )
  }

  const orgId = profile.organization_id as number

  // Fetch sequences with counts
  const { data: sequencesRaw, error: sequencesError } = await supabase
    .from('sequences')
    .select(`
      id,
      uuid,
      name,
      description,
      status,
      trigger_type,
      stats,
      created_at,
      updated_at,
      steps_count:sequence_steps(count),
      enrollments_count:sequence_enrollments(count)
    `)
    .eq('organization_id', orgId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(500)

  // Transform data to include counts
  const sequences = (sequencesRaw as unknown as SequenceRow[] || []).map((seq) => ({
    id: seq.id,
    uuid: seq.uuid,
    name: seq.name,
    description: seq.description,
    status: seq.status,
    trigger_type: seq.trigger_type,
    stats: seq.stats || { sent: 0, opened: 0, replied: 0, bounced: 0 },
    created_at: seq.created_at,
    updated_at: seq.updated_at,
    steps_count: seq.steps_count?.[0]?.count || 0,
    enrollments_count: seq.enrollments_count?.[0]?.count || 0,
  }))

  return (
    <SequencesPageClient
      initialSequences={sequences}
      organizationId={orgId}
      userId={user.id}
      error={sequencesError?.message}
    />
  )
}
