import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  note: 'Note',
  call: 'Appel',
  email: 'Email',
  meeting: 'Reunion',
  task: 'Tache',
  other: 'Activite',
}

interface CompanyPageProps {
  params: Promise<{ id: string }>
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { id } = await params
  const companyId = parseInt(id, 10)

  if (isNaN(companyId)) {
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

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .eq('organization_id', profile.organization_id)
    .single()

  if (error || !company) {
    notFound()
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('id, uuid, first_name, last_name, email, status, score, is_hot')
    .eq('organization_id', profile.organization_id)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: deals } = await supabase
    .from('deals')
    .select('id, uuid, name, value, currency, stage_id')
    .eq('organization_id', profile.organization_id)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: activities } = await supabase
    .from('activities')
    .select('id, activity_type, subject, body, activity_date')
    .eq('organization_id', profile.organization_id)
    .eq('associated_company_id', companyId)
    .order('activity_date', { ascending: false })
    .limit(10)

  const initials = company.name?.slice(0, 2).toUpperCase() || 'CO'
  const createdDate = new Date(company.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-sm text-[#4E525A] hover:text-[#0D0F14] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux entreprises
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-[12px] bg-[#17191F] flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl lg:text-2xl font-semibold text-[#0D0F14]">{company.name}</h1>
                {company.industry && (
                  <p className="text-[#4E525A] mt-1">{company.industry}</p>
                )}
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1565C0] hover:underline mt-1 inline-block"
                  >
                    {company.website}
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] mb-1">Email</p>
                <p className="text-sm font-medium text-[#0D0F14]">{company.email || '-'}</p>
              </div>
              <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] mb-1">Telephone</p>
                <p className="text-sm font-medium text-[#0D0F14]">{company.phone || '-'}</p>
              </div>
              <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] mb-1">Ville</p>
                <p className="text-sm font-medium text-[#0D0F14]">
                  {company.address_city || '-'}
                  {company.address_postal_code && ` (${company.address_postal_code})`}
                </p>
              </div>
              <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] mb-1">Taille</p>
                <p className="text-sm font-medium text-[#0D0F14]">{company.employees_range || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0D0F14] uppercase tracking-wider">
                Contacts ({leads?.length || 0})
              </h2>
              <Link
                href={`/leads?company=${companyId}`}
                className="text-xs text-[#1565C0] hover:underline"
              >
                Voir tous
              </Link>
            </div>
            {(!leads || leads.length === 0) ? (
              <div className="text-center py-8 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-sm text-[#4E525A]">Aucun contact</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => {
                  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom'
                  return (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="flex items-center gap-3 p-3 bg-[#F5F7F9] rounded-[10px] hover:bg-[#EFF1F3] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#17191F] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {(lead.first_name?.[0] || '') + (lead.last_name?.[0] || '') || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0D0F14] truncate">{fullName}</p>
                        <p className="text-xs text-[#9BA0A6] truncate">{lead.email || '-'}</p>
                      </div>
                      {lead.is_hot && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FFEBEE] text-[#C62828]">
                          Chaud
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] uppercase tracking-wider mb-4">
              Historique des activites
            </h2>
            {(!activities || activities.length === 0) ? (
              <div className="text-center py-8 bg-[#F5F7F9] rounded-[10px]">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="text-sm text-[#4E525A]">Aucune activite</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 bg-[#F5F7F9] rounded-[10px]">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0D0F14]">{activity.subject || ACTIVITY_TYPE_LABELS[activity.activity_type] || 'Activite'}</p>
                      {activity.body && (
                        <p className="text-xs text-[#4E525A] mt-1 line-clamp-2">{activity.body}</p>
                      )}
                      <p className="text-xs text-[#9BA0A6] mt-1">
                        {new Date(activity.activity_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] uppercase tracking-wider mb-4">
              Affaires ({deals?.length || 0})
            </h2>
            {(!deals || deals.length === 0) ? (
              <div className="text-center py-6 bg-[#F5F7F9] rounded-[10px]">
                <p className="text-sm text-[#4E525A]">Aucune affaire</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href="/deals"
                    className="block p-3 bg-[#F5F7F9] rounded-[10px] hover:bg-[#EFF1F3] transition-colors"
                  >
                    <p className="text-sm font-medium text-[#0D0F14] truncate">{deal.name}</p>
                    <p className="text-xs text-[#4E525A] mt-1">
                      {deal.value?.toLocaleString('fr-FR')} {deal.currency}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] uppercase tracking-wider mb-4">
              Informations
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#9BA0A6]">Reference</p>
                <p className="text-sm text-[#4E525A]">{company.uuid.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6]">SIRET</p>
                <p className="text-sm text-[#0D0F14]">{company.siret || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6]">Code NAF</p>
                <p className="text-sm text-[#0D0F14]">{company.naf_code || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6]">Cree le</p>
                <p className="text-sm text-[#0D0F14]">{createdDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] uppercase tracking-wider mb-4">
              Adresse complete
            </h2>
            <div className="text-sm text-[#4E525A]">
              {company.address_street && <p>{company.address_street}</p>}
              <p>
                {company.address_postal_code && `${company.address_postal_code} `}
                {company.address_city}
              </p>
              {company.address_country && <p>{company.address_country}</p>}
              {!company.address_street && !company.address_city && <p>-</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
