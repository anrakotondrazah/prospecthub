import { createClient } from '@/lib/supabase/server'

export const instant = false

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
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
          <a href="/companies" className="text-[#17191F] font-medium hover:underline">Reessayer</a>
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
          <p className="text-[#4E525A]">Completez votre onboarding pour acceder aux entreprises.</p>
        </div>
      </div>
    )
  }

  // Get companies
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, uuid, name, domain, industry, size, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (companiesError) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">Entreprises</h1>
            <p className="text-sm text-[#4E525A]">Base de donnees de vos entreprises</p>
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
            <p className="text-sm text-[#4E525A] mb-4">Impossible de charger les entreprises.</p>
            <a href="/companies" className="text-[#17191F] font-medium hover:underline">Reessayer</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">Entreprises</h1>
          <p className="text-sm text-[#4E525A]">
            Base de donnees de vos entreprises clientes et prospects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#9BA0A6] bg-white border border-[#E2E4E6] rounded-[10px] cursor-not-allowed"
            disabled
            title="Bientot disponible"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Importer
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/60 bg-[#17191F]/60 rounded-[10px] cursor-not-allowed"
            disabled
            title="Bientot disponible"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle entreprise
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[14px] border border-[#E2E4E6]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E4E6]">
          <div className="relative flex-1 sm:flex-none">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              className="w-full sm:w-80 h-9 pl-9 pr-3 text-sm border border-[#E2E4E6] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17191F] focus:border-transparent"
              aria-label="Rechercher une entreprise"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E4E6]">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]"
                    aria-label="Selectionner toutes les entreprises"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider hidden sm:table-cell">
                  Domaine
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider hidden md:table-cell">
                  Secteur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider hidden lg:table-cell">
                  Taille
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {!companies || companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#4E525A]">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-4 rounded-full bg-[#F5F7F9] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="font-medium mb-1">Aucune entreprise</p>
                      <p className="text-sm">Commencez par importer ou creer votre premiere entreprise.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const companyName = company.name || 'Sans nom'
                  const initial = companyName[0]?.toUpperCase() || '?'

                  return (
                    <tr key={company.id} className="border-b border-[#E2E4E6] hover:bg-[#F5F7F9] transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]"
                          aria-label={`Selectionner ${companyName}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#F5F7F9] flex items-center justify-center text-[#4E525A] text-xs font-medium flex-shrink-0">
                            {initial}
                          </div>
                          <span className="font-medium text-[#0D0F14] truncate">{companyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4E525A] truncate max-w-[150px] hidden sm:table-cell">
                        {company.domain || '-'}
                      </td>
                      <td className="px-4 py-3 text-[#4E525A] hidden md:table-cell">
                        {company.industry || '-'}
                      </td>
                      <td className="px-4 py-3 text-[#4E525A] hidden lg:table-cell">
                        {company.size || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="p-1 rounded hover:bg-[#E2E4E6]"
                          aria-label={`Actions pour ${companyName}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        {companies && companies.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-[#E2E4E6]">
            <p className="text-sm text-[#4E525A]">
              {companies.length} entreprise{companies.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1.5 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] cursor-not-allowed"
              >
                Precedent
              </button>
              <button
                disabled
                className="px-3 py-1.5 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
