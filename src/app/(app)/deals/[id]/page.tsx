import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false

interface DealStage {
  id: number
  name: string
  color: string
}

interface DealOwner {
  id: string
  first_name: string
  last_name: string
}

interface DealCompany {
  id: number
  name: string
}

interface Deal {
  id: number
  uuid: string
  name: string
  value: number
  currency: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  expected_close_date: string | null
  actual_close_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  stage: DealStage | DealStage[] | null
  owner: DealOwner | DealOwner[] | null
  company: DealCompany | DealCompany[] | null
}

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id as number | null
  if (!orgId) return notFound()

  // Fetch deal with relations
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      id,
      uuid,
      name,
      value,
      currency,
      priority,
      expected_close_date,
      actual_close_date,
      notes,
      created_at,
      updated_at,
      stage:pipeline_stages(id, name, color),
      owner:profiles!deals_owner_id_fkey(id, first_name, last_name),
      company:companies(id, name)
    `)
    .eq('uuid', id)
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .single()

  if (error || !deal) {
    return notFound()
  }

  // Normalize relations (Supabase can return arrays for relations)
  const stage = Array.isArray(deal.stage) ? deal.stage[0] : deal.stage
  const owner = Array.isArray(deal.owner) ? deal.owner[0] : deal.owner
  const company = Array.isArray(deal.company) ? deal.company[0] : deal.company

  if (!stage) return notFound()

  const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
    urgent: { bg: 'bg-[#FDE8E5]', text: 'text-[#B42318]', label: 'Urgent' },
    high: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]', label: 'Haute' },
    medium: { bg: 'bg-[#FFF9E6]', text: 'text-[#F59E0B]', label: 'Moyenne' },
    low: { bg: 'bg-[#F5F7F9]', text: 'text-[#9BA0A6]', label: 'Faible' },
  }

  const priority = priorityConfig[deal.priority] || priorityConfig.low

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/deals"
          className="w-9 h-9 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
          aria-label="Retour aux affaires"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
            {deal.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#4E525A] dark:text-[#8B949E]">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span>{stage.name}</span>
            </div>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${priority.bg} ${priority.text}`}>
              {priority.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Value Card */}
          <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm">
            <h2 className="text-sm font-medium text-[#9BA0A6] dark:text-[#8B949E] mb-2">Montant</h2>
            <p className="text-3xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
              {deal.value.toLocaleString('fr-FR')} {deal.currency}
            </p>
          </div>

          {/* Notes */}
          {deal.notes && (
            <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm">
              <h2 className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">Notes</h2>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E] whitespace-pre-wrap">
                {deal.notes}
              </p>
            </div>
          )}

          {/* Coming Soon: Activities, Tasks, etc. */}
          <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-12 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#F5F7F9] dark:bg-white/[0.05] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
                Activités et tâches à venir
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">
              Détails
            </h2>

            {/* Company */}
            {company && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Entreprise</p>
                <Link
                  href={`/companies/${company.id}`}
                  className="text-sm font-medium text-[#0066FF] hover:underline"
                >
                  {company.name}
                </Link>
              </div>
            )}

            {/* Owner */}
            {owner && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Responsable</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {owner.first_name} {owner.last_name}
                </p>
              </div>
            )}

            {/* Expected Close Date */}
            {deal.expected_close_date && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Date de clôture estimée</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {new Date(deal.expected_close_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Actual Close Date */}
            {deal.actual_close_date && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Date de clôture réelle</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {new Date(deal.actual_close_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Created At */}
            <div>
              <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Créée le</p>
              <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                {new Date(deal.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Updated At */}
            <div>
              <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Modifiée le</p>
              <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                {new Date(deal.updated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">
              Actions
            </h2>
            <div className="space-y-2">
              <button
                disabled
                className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-[#30363D] text-[#9BA0A6] dark:text-[#8B949E] rounded-xl text-sm font-medium cursor-not-allowed"
              >
                Modifier
              </button>
              <button
                disabled
                className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-[#30363D] text-[#9BA0A6] dark:text-[#8B949E] rounded-xl text-sm font-medium cursor-not-allowed"
              >
                Supprimer
              </button>
            </div>
            <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mt-3 text-center">
              Bientôt disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
