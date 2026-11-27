import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LeadActions } from '@/components/activities/LeadActions'
import { ActivityTimeline } from '@/components/activities/ActivityTimeline'

export const instant = false

interface LeadPageProps {
  params: Promise<{ id: string }>
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]' },
  contacted: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
  qualified: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]' },
  unqualified: { bg: 'bg-[#F5F5F5]', text: 'text-[#616161]' },
  nurturing: { bg: 'bg-[#E8EAF6]', text: 'text-[#3949AB]' },
  converted: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]' },
  lost: { bg: 'bg-[#F5F5F5]', text: 'text-[#616161]' },
}

const SCORE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  hot: { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]', label: 'Chaud' },
  warm: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]', label: 'Tiede' },
  cold: { bg: 'bg-[#F5F5F5]', text: 'text-[#616161]', label: 'Froid' },
}

function getScoreTier(score: number | null): 'hot' | 'warm' | 'cold' {
  if (!score || score < 50) return 'cold'
  if (score < 80) return 'warm'
  return 'hot'
}

export default async function LeadDetailPage({ params }: LeadPageProps) {
  const { id } = await params
  const leadId = parseInt(id, 10)

  if (isNaN(leadId)) {
    notFound()
  }

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
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">Organisation non configuree</h2>
          <p className="text-[#4E525A]">Completez votre onboarding.</p>
        </div>
      </div>
    )
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('organization_id', profile.organization_id)
    .single()

  if (error || !lead) {
    notFound()
  }

  const { data: activities } = await supabase
    .from('activities')
    .select('id, activity_type, subject, body, activity_date, created_at')
    .eq('organization_id', profile.organization_id)
    .eq('associated_lead_id', leadId)
    .order('activity_date', { ascending: false })
    .limit(10)

  const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.new
  const scoreTier = getScoreTier(lead.score)
  const scoreStyle = SCORE_COLORS[scoreTier]
  const initials = `${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`.toUpperCase() || '?'
  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom'
  const createdDate = new Date(lead.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-sm text-[#4E525A] hover:text-[#0D0F14] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux leads
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#17191F] flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-[#0D0F14]">{fullName}</h1>
                    {lead.company_name && (
                      <p className="text-[#4E525A] mt-1">{lead.company_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}>
                      {lead.status.toUpperCase()}
                    </span>
                    {lead.is_hot && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#FFEBEE] text-[#C62828]">
                        Chaud
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <LeadActions leadId={lead.id} />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] mb-1">Email</p>
                <p className="text-sm font-medium text-[#0D0F14]">{lead.email || '-'}</p>
              </div>
              <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] mb-1">Telephone</p>
                <p className="text-sm font-medium text-[#0D0F14]">{lead.phone || '-'}</p>
              </div>
              <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] mb-1">Ville</p>
                <p className="text-sm font-medium text-[#0D0F14]">
                  {lead.address_city || '-'}
                  {lead.address_postal_code && ` (${lead.address_postal_code})`}
                </p>
              </div>
              <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] mb-1">Source</p>
                <p className="text-sm font-medium text-[#0D0F14]">{lead.source || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] uppercase tracking-wider mb-4">
              Historique des activites
            </h2>
            <ActivityTimeline
              activities={(activities || []).map((a) => ({
                id: a.id,
                activity_type: a.activity_type as 'note' | 'call' | 'email' | 'meeting' | 'task' | 'other',
                subject: a.subject,
                body: a.body,
                activity_date: a.activity_date,
                created_at: a.created_at,
              }))}
              emptyMessage="Aucune activite"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] uppercase tracking-wider mb-4">
              Score & Qualification
            </h2>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F5F7F9] mb-3">
                <span className="text-2xl font-bold text-[#0D0F14]">{lead.score ?? '-'}</span>
              </div>
              <p className={`inline-flex px-3 py-1 text-sm font-medium rounded ${scoreStyle.bg} ${scoreStyle.text}`}>
                {scoreStyle.label}
              </p>
            </div>
            <div className="w-full h-2 bg-[#E2E4E6] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  scoreTier === 'hot' ? 'bg-[#C62828]' :
                  scoreTier === 'warm' ? 'bg-[#E65100]' : 'bg-[#9BA0A6]'
                }`}
                style={{ width: `${lead.score || 0}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] uppercase tracking-wider mb-4">
              Informations
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#9BA0A6]">ID</p>
                <p className="text-sm font-mono text-[#4E525A]">{lead.uuid}</p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6]">SIRET</p>
                <p className="text-sm text-[#0D0F14]">{lead.company_siret || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6]">Cree le</p>
                <p className="text-sm text-[#0D0F14]">{createdDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6]">Derniere MAJ</p>
                <p className="text-sm text-[#0D0F14]">
                  {new Date(lead.updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {lead.shared_company_id && (
            <div className="bg-[#E8F5E9] rounded-[14px] border border-[#A5D6A7] p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-sm font-medium text-[#147A3A]">Lead debloque</p>
              </div>
              <p className="text-xs text-[#4E525A]">
                Ce lead provient de la Base Entreprises
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
