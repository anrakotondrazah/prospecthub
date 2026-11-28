import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SequenceDetailClient } from './SequenceDetailClient'

export const instant = false

interface SequencePageProps {
  params: Promise<{ uuid: string }>
}

export default async function SequenceDetailPage({ params }: SequencePageProps) {
  const { uuid } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Organisation non configurée</h2>
          <p className="text-[#4E525A] dark:text-[#8B949E]">Complétez votre onboarding.</p>
        </div>
      </div>
    )
  }

  // Fetch sequence with steps and enrollments count
  const { data: sequence, error } = await supabase
    .from('sequences')
    .select(`
      *,
      steps:sequence_steps(
        id,
        step_order,
        step_type,
        delay_days,
        delay_hours,
        subject,
        body,
        task_title,
        task_description,
        template_id,
        created_at
      ),
      enrollments_count:sequence_enrollments(count)
    `)
    .eq('uuid', uuid)
    .eq('organization_id', profile.organization_id)
    .single()

  if (error || !sequence) {
    notFound()
  }

  // Transform enrollments count
  const enrollmentsCountData = sequence.enrollments_count as unknown as { count: number }[]
  const enrollmentsCount = enrollmentsCountData?.[0]?.count || 0

  // Fetch completed enrollments count (separate query to avoid limit issue)
  const { count: completedCount } = await supabase
    .from('sequence_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('sequence_id', sequence.id)
    .eq('status', 'completed')

  // Fetch enrollments with lead details
  const { data: rawEnrollments } = await supabase
    .from('sequence_enrollments')
    .select(`
      id,
      status,
      current_step,
      next_step_at,
      enrolled_at,
      completed_at,
      lead:leads(
        id,
        first_name,
        last_name,
        email,
        company_name,
        status
      )
    `)
    .eq('sequence_id', sequence.id)
    .order('enrolled_at', { ascending: false })
    .limit(50)

  // Transform lead array to single object (Supabase returns array for relations)
  const enrollments = (rawEnrollments || []).map((e) => ({
    ...e,
    lead: Array.isArray(e.lead) ? e.lead[0] : e.lead,
  }))

  return (
    <SequenceDetailClient
      sequence={{
        ...sequence,
        enrollments_count: enrollmentsCount,
      }}
      enrollments={enrollments}
      completedCount={completedCount || 0}
      organizationId={profile.organization_id}
      userId={user.id}
    />
  )
}
