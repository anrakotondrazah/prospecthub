import Link from 'next/link'
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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">Impossible de charger votre profil.</p>
          <Link href="/companies" className="text-foreground font-medium hover:underline">Reessayer</Link>
        </div>
      </div>
    )
  }

  const orgId = profile?.organization_id as number | null
  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Organisation non configuree</h2>
          <p className="text-muted-foreground">Completez votre onboarding pour acceder aux entreprises.</p>
        </div>
      </div>
    )
  }

  // Get companies
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, uuid, name, website, industry, employees_count, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (companiesError) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">Entreprises</h1>
            <p className="text-sm text-muted-foreground">Base de donnees de vos entreprises</p>
          </div>
        </div>
        <div className="bg-card rounded-[14px] border border-border p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-foreground mb-2">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mb-4">Impossible de charger les entreprises.</p>
            <Link href="/companies" className="text-foreground font-medium hover:underline">Reessayer</Link>
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
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">Entreprises</h1>
          <p className="text-sm text-muted-foreground">
            Base de donnees de vos entreprises clientes et prospects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-[10px] cursor-not-allowed"
            disabled
            title="Bientot disponible"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Importer
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/60 bg-foreground/60 rounded-[10px] cursor-not-allowed"
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
      <div className="bg-card rounded-[14px] border border-border">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="relative flex-1 sm:flex-none">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              className="w-full sm:w-80 h-9 pl-9 pr-3 text-sm bg-background text-foreground border border-border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              aria-label="Rechercher une entreprise"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border accent-foreground"
                    aria-label="Selectionner toutes les entreprises"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Site web
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Secteur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Effectif
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {!companies || companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="font-medium text-foreground mb-1">Aucune entreprise</p>
                      <p className="text-sm">Commencez par importer ou creer votre premiere entreprise.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const companyName = company.name || 'Sans nom'
                  const initial = companyName[0]?.toUpperCase() || '?'

                  return (
                    <tr key={company.id} className="border-b border-border hover:bg-muted transition-colors group">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border accent-foreground"
                          aria-label={`Selectionner ${companyName}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/companies/${company.id}`} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium flex-shrink-0">
                            {initial}
                          </div>
                          <span className="font-medium text-foreground truncate group-hover:text-[#1565C0] transition-colors">{companyName}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[150px] hidden sm:table-cell">
                        {company.website || '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {company.industry || '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {company.employees_count || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/companies/${company.id}`}
                          className="p-1 rounded hover:bg-muted inline-flex"
                          aria-label={`Voir ${companyName}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {companies.length} entreprise{companies.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-[8px] cursor-not-allowed"
              >
                Precedent
              </button>
              <button
                disabled
                className="px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-[8px] cursor-not-allowed"
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
