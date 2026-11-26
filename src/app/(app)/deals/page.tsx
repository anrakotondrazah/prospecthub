import { createClient } from '@/lib/supabase/server'

export const instant = false

interface PipelineStage {
  id: number
  name: string
  code: string
  color: string
  probability: number
  is_won: boolean
  is_lost: boolean
}

interface Deal {
  id: number
  uuid: string
  name: string
  value: number
  currency: string
  stage_id: number
  priority: 'low' | 'medium' | 'high'
  expected_close_date: string | null
  company_id: number | null
}

const DEFAULT_STAGES: PipelineStage[] = [
  { id: 1, name: 'Prospection', code: 'prospection', color: '#6B7280', probability: 10, is_won: false, is_lost: false },
  { id: 2, name: 'Qualification', code: 'qualification', color: '#3B82F6', probability: 25, is_won: false, is_lost: false },
  { id: 3, name: 'Proposition', code: 'proposition', color: '#8B5CF6', probability: 50, is_won: false, is_lost: false },
  { id: 4, name: 'Negociation', code: 'negociation', color: '#F59E0B', probability: 75, is_won: false, is_lost: false },
  { id: 5, name: 'Gagne', code: 'won', color: '#10B981', probability: 100, is_won: true, is_lost: false },
  { id: 6, name: 'Perdu', code: 'lost', color: '#EF4444', probability: 0, is_won: false, is_lost: true },
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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">Erreur de chargement</h2>
          <p className="text-[#4E525A] mb-4">Impossible de charger votre profil.</p>
          <a href="/deals" className="text-[#17191F] font-medium hover:underline">Reessayer</a>
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
          <p className="text-[#4E525A]">Completez votre onboarding pour acceder aux affaires.</p>
        </div>
      </div>
    )
  }

  const { data: stagesData } = await supabase
    .from('pipeline_stages')
    .select('id, name, code, color, probability, is_won, is_lost')
    .eq('organization_id', orgId)
    .order('display_order')

  const stages: PipelineStage[] = stagesData && stagesData.length > 0 ? stagesData : DEFAULT_STAGES

  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('id, uuid, name, value, currency, stage_id, priority, expected_close_date, company_id')
    .eq('organization_id', orgId)
    .order('expected_close_date', { ascending: true })

  if (dealsError) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">Affaires</h1>
            <p className="text-sm text-[#4E525A]">Gerez votre pipeline commercial</p>
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
            <p className="text-sm text-[#4E525A] mb-4">Impossible de charger les affaires.</p>
            <a href="/deals" className="text-[#17191F] font-medium hover:underline">Reessayer</a>
          </div>
        </div>
      </div>
    )
  }

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = (deals || []).filter(d => d.stage_id === stage.id)
    return acc
  }, {} as Record<number, Deal[]>)

  const totalValue = (deals || []).reduce((sum, d) => sum + (d.value || 0), 0)
  const weightedValue = (deals || []).reduce((sum, d) => {
    const stage = stages.find(s => s.id === d.stage_id)
    return sum + (d.value || 0) * ((stage?.probability || 0) / 100)
  }, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">Affaires</h1>
          <p className="text-sm text-[#4E525A]">
            {(deals || []).length} affaire{(deals || []).length !== 1 ? 's' : ''} - {totalValue.toLocaleString('fr-FR')} EUR total ({weightedValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} EUR pondere)
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
          Nouvelle affaire
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {stages.filter(s => !s.is_lost).map((stage) => {
          const stageDeals = dealsByStage[stage.id] || []
          const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-[280px] bg-white rounded-[14px] border border-[#E2E4E6]"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#E2E4E6]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-[#0D0F14]">{stage.name}</h3>
                  <span className="text-sm text-[#9BA0A6]">{stageDeals.length}</span>
                </div>
                <span className="text-xs text-[#9BA0A6]">{stage.probability}%</span>
              </div>
              <div className="p-2 border-b border-[#E2E4E6] bg-[#F5F7F9]">
                <p className="text-xs text-[#4E525A] text-center">
                  {stageTotal.toLocaleString('fr-FR')} EUR
                </p>
              </div>
              <div className="p-4 space-y-3 min-h-[300px]">
                {stageDeals.length === 0 ? (
                  <p className="text-sm text-[#9BA0A6] text-center py-8">Aucune affaire</p>
                ) : (
                  stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))
                )}
              </div>
            </div>
          )
        })}

        {stages.filter(s => s.is_lost).map((stage) => {
          const stageDeals = dealsByStage[stage.id] || []
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-[200px] bg-[#F5F5F5] rounded-[14px] border border-[#E2E4E6] opacity-60"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#E2E4E6]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="font-semibold text-[#616161]">{stage.name}</h3>
                  <span className="text-sm text-[#9BA0A6]">{stageDeals.length}</span>
                </div>
              </div>
              <div className="p-4 space-y-2 min-h-[200px]">
                {stageDeals.length === 0 ? (
                  <p className="text-sm text-[#9BA0A6] text-center py-4">-</p>
                ) : (
                  stageDeals.slice(0, 3).map((deal) => (
                    <div key={deal.id} className="p-2 bg-white rounded-[8px] text-xs text-[#616161]">
                      {deal.name}
                    </div>
                  ))
                )}
                {stageDeals.length > 3 && (
                  <p className="text-xs text-[#9BA0A6] text-center">+{stageDeals.length - 3} autres</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DealCard({ deal }: { deal: Deal }) {
  const priorityColors: Record<string, string> = {
    high: 'bg-[#FFEBEE] text-[#C62828]',
    medium: 'bg-[#FFF3E0] text-[#E65100]',
    low: 'bg-[#F5F5F5] text-[#616161]',
  }

  const closeDate = deal.expected_close_date
    ? new Date(deal.expected_close_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    : null

  return (
    <div
      className="p-3 bg-[#F5F7F9] rounded-[10px] hover:bg-[#EFF1F3] transition-colors cursor-pointer"
      role="article"
      aria-label={`Affaire: ${deal.name}`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="font-medium text-[#0D0F14] text-sm line-clamp-2">{deal.name}</p>
        {deal.priority && (
          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ml-2 flex-shrink-0 ${priorityColors[deal.priority] || priorityColors.low}`}>
            {deal.priority === 'high' ? 'Urgent' : deal.priority === 'medium' ? 'Normal' : 'Faible'}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#0D0F14]">
          {deal.value.toLocaleString('fr-FR')} {deal.currency}
        </span>
        {closeDate && (
          <span className="text-xs text-[#9BA0A6]">{closeDate}</span>
        )}
      </div>
    </div>
  )
}
