import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DealsPageClient } from './DealsPageClient'

export const instant = false

interface PipelineStage {
  id: number
  name: string
  code: string
  color: string
  probability: number
  is_won: boolean
  is_lost: boolean
  display_order: number
}

interface Deal {
  id: number
  uuid: string
  name: string
  value: number
  currency: string
  stage_id: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  expected_close_date: string | null
  company_id: number | null
}

const DEFAULT_STAGES: PipelineStage[] = [
  { id: 1, name: 'Prospection', code: 'prospection', color: '#6B7280', probability: 10, is_won: false, is_lost: false, display_order: 1 },
  { id: 2, name: 'Qualification', code: 'qualification', color: '#3B82F6', probability: 25, is_won: false, is_lost: false, display_order: 2 },
  { id: 3, name: 'Proposition', code: 'proposition', color: '#8B5CF6', probability: 50, is_won: false, is_lost: false, display_order: 3 },
  { id: 4, name: 'Negociation', code: 'negociation', color: '#F59E0B', probability: 75, is_won: false, is_lost: false, display_order: 4 },
  { id: 5, name: 'Gagne', code: 'won', color: '#10B981', probability: 100, is_won: true, is_lost: false, display_order: 5 },
  { id: 6, name: 'Perdu', code: 'lost', color: '#EF4444', probability: 0, is_won: false, is_lost: true, display_order: 6 },
]

export default async function DealsPage() {
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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Erreur de chargement</h2>
          <p className="text-[#4E525A] dark:text-[#8B949E] mb-4">Impossible de charger votre profil.</p>
          <Link href="/deals" className="text-[#17191F] dark:text-[#E6EDF3] font-medium hover:underline">Reessayer</Link>
        </div>
      </div>
    )
  }

  const orgId = profile?.organization_id as number | null
  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Organisation non configuree</h2>
          <p className="text-[#4E525A] dark:text-[#8B949E]">Completez votre onboarding pour acceder aux affaires.</p>
        </div>
      </div>
    )
  }

  const { data: stagesData } = await supabase
    .from('pipeline_stages')
    .select('id, name, code, color, probability, is_won, is_lost, display_order')
    .eq('organization_id', orgId)
    .order('display_order')

  const stages: PipelineStage[] = stagesData && stagesData.length > 0 ? stagesData : DEFAULT_STAGES

  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('id, uuid, name, value, currency, stage_id, priority, expected_close_date, company_id')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('expected_close_date', { ascending: true })

  if (dealsError) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">Affaires</h1>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Gerez votre pipeline commercial</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0D1117] rounded-2xl border border-[#E2E4E6] dark:border-[#30363D] p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Erreur de chargement</p>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">Impossible de charger les affaires.</p>
            <Link href="/deals" className="text-[#17191F] dark:text-[#E6EDF3] font-medium hover:underline">Reessayer</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DealsPageClient
      initialDeals={deals || []}
      initialStages={stages}
      organizationId={orgId}
      userId={user.id}
    />
  )
}
