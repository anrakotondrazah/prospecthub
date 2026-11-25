import { createClient } from '@/lib/supabase/server'

export const instant = false

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id as number | null

  // Get companies
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('organization_id', orgId || 0)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">Entreprises</h1>
          <p className="text-sm text-[#4E525A]">
            Base de donnees de vos entreprises clientes et prospects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4E525A] bg-white border border-[#E2E4E6] rounded-[10px] hover:bg-[#F5F7F9] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Importer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#17191F] rounded-[10px] hover:bg-[#2D3039] transition-colors">
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
          <div className="relative">
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
              className="w-80 h-9 pl-9 pr-3 text-sm border border-[#E2E4E6] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17191F] focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E4E6]">
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                  Domaine
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                  Leads
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {!companies || companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#4E525A]">
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
                companies.map((company) => (
                  <tr key={company.id} className="border-b border-[#E2E4E6] hover:bg-[#F5F7F9] transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#F5F7F9] flex items-center justify-center text-[#4E525A] text-xs font-medium">
                          {company.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-[#0D0F14]">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#4E525A]">{company.domain || '-'}</td>
                    <td className="px-4 py-3 text-[#4E525A]">{company.industry || '-'}</td>
                    <td className="px-4 py-3 text-[#4E525A]">{company.size || '-'}</td>
                    <td className="px-4 py-3 text-[#4E525A]">-</td>
                    <td className="px-4 py-3">
                      <button className="p-1 rounded hover:bg-[#E2E4E6]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
