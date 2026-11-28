'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton, AnimatedCheckbox } from '@/components/ui/buttons'
import { Loader } from '@/components/ui/Loader'

interface SharedCompany {
  id: number
  siret: string
  siren: string
  company_name: string
  trade_name: string | null
  naf_code: string | null
  naf_label: string | null
  address_city: string | null
  address_postal_code: string | null
  phone: string | null
  email: string | null
  website: string | null
  employees_range: string | null
  is_rge: boolean
  quality_score: number
}

interface UnlockedLead {
  shared_company_id: number
}

const SCORE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  hot: { label: 'Chaud', bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]' },
  warm: { label: 'Tiede', bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
  cold: { label: 'Froid', bg: 'bg-[#F5F5F5]', text: 'text-[#616161]' },
}

function getScoreTier(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 80) return 'hot'
  if (score >= 50) return 'warm'
  return 'cold'
}

function getCreditCost(score: number): number {
  if (score >= 80) return 3
  if (score >= 50) return 2
  return 1
}

export default function BaseEntreprisesPage() {
  const [companies, setCompanies] = useState<SharedCompany[]>([])
  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set())
  const [creditsBalance, setCreditsBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    isRge: false,
    city: '',
  })
  const [totalCount, setTotalCount] = useState(0)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Non authentifie')
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        setError('Organisation non configurée')
        setLoading(false)
        return
      }

      const orgId = profile.organization_id

      const { data: org } = await supabase
        .from('organizations')
        .select('credits_balance')
        .eq('id', orgId)
        .single()

      setCreditsBalance(org?.credits_balance || 0)

      const { data: unlocked } = await supabase
        .from('unlocked_leads')
        .select('shared_company_id')
        .eq('organization_id', orgId)

      setUnlockedIds(new Set((unlocked || []).map((u: UnlockedLead) => u.shared_company_id)))

      let query = supabase
        .from('shared_companies')
        .select('id, siret, siren, company_name, trade_name, naf_code, naf_label, address_city, address_postal_code, phone, email, website, employees_range, is_rge, quality_score', { count: 'exact' })
        .order('quality_score', { ascending: false })
        .limit(50)

      if (filters.isRge) {
        query = query.eq('is_rge', true)
      }
      if (filters.city) {
        query = query.ilike('address_city', `%${filters.city}%`)
      }
      if (filters.search) {
        query = query.ilike('company_name', `%${filters.search}%`)
      }

      const { data: companiesData, count, error: fetchError } = await query

      if (fetchError) {
        setError('Erreur de chargement: ' + fetchError.message)
      } else {
        setCompanies(companiesData || [])
        setTotalCount(count || 0)
      }
    } catch (err) {
      setError('Erreur inattendue')
    }

    setLoading(false)
  }, [filters, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUnlock = async (company: SharedCompany) => {
    const cost = getCreditCost(company.quality_score)

    if (creditsBalance < cost) {
      alert(`Credits insuffisants. Vous avez ${creditsBalance} credits, il en faut ${cost}.`)
      return
    }

    if (!confirm(`Ajouter "${company.company_name}" a vos leads pour ${cost} credit(s)?`)) {
      return
    }

    setUnlocking(company.id)

    try {
      const response = await fetch('/api/leads/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shared_company_id: company.id }),
      })

      const result = await response.json()

      if (result.success) {
        setUnlockedIds(prev => new Set([...prev, company.id]))
        setCreditsBalance(result.new_balance)
      } else {
        alert(result.message || 'Erreur lors du deblocage')
      }
    } catch (err) {
      console.error('Erreur deblocage lead:', err)
      alert('Erreur réseau')
    }

    setUnlocking(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">
            Base Entreprises
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalCount.toLocaleString('fr-FR')} entreprises enrichies disponibles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-[10px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm font-medium text-foreground">{creditsBalance} credits</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[14px] border border-border mb-4">
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-border rounded-[8px] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <input
              type="text"
              placeholder="Ville..."
              value={filters.city}
              onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
              className="w-[150px] px-3 py-2 text-sm border border-border rounded-[8px] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="flex items-center px-3 py-2 bg-muted rounded-[8px]">
              <AnimatedCheckbox
                checked={filters.isRge}
                onChange={(checked) => setFilters(f => ({ ...f, isRge: checked }))}
                id="rge-filter"
                label="RGE uniquement"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#FDE8E5] text-[#B42318] p-4 rounded-[10px] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-card rounded-[14px] border border-border p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader size="md" />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-card rounded-[14px] border border-border p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <p className="font-medium text-foreground mb-1">Aucune entreprise trouvée</p>
            <p className="text-sm text-muted-foreground">Modifiez vos filtres ou attendez le prochain enrichissement</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-[14px] border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Entreprise</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Ville</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Secteur</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Score</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Contact</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const tier = getScoreTier(company.quality_score)
                  const badge = SCORE_BADGES[tier]
                  const cost = getCreditCost(company.quality_score)
                  const isUnlocked = unlockedIds.has(company.id)
                  const isUnlocking = unlocking === company.id

                  return (
                    <tr key={company.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground text-sm">{company.company_name}</p>
                          <p className="text-xs text-muted-foreground">SIRET: {company.siret}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {company.address_city || '-'}
                          {company.address_postal_code && ` (${company.address_postal_code.slice(0, 2)})`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {company.is_rge && (
                            <span className="inline-flex px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-[#E8F5E9] text-[#147A3A]">
                              RGE
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{company.naf_code || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                tier === 'hot' ? 'bg-[#C62828]' :
                                tier === 'warm' ? 'bg-[#E65100]' : 'bg-[#9BA0A6]'
                              }`}
                              style={{ width: `${company.quality_score}%` }}
                            />
                          </div>
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isUnlocked ? (
                          <div className="text-sm">
                            {company.phone && <p className="text-foreground">{company.phone}</p>}
                            {company.email && <p className="text-muted-foreground text-xs">{company.email}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Ajouter pour voir</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#147A3A] bg-[#E8F5E9] rounded-[8px]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Dans vos leads
                          </span>
                        ) : (
                          <FillButton
                            onClick={() => handleUnlock(company)}
                            disabled={isUnlocking || creditsBalance < cost}
                            className="h-8 px-3 text-xs"
                          >
                            <span className="flex items-center gap-1.5">
                              {isUnlocking ? (
                                <>
                                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                  Ajout...
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  {cost} credit{cost > 1 ? 's' : ''}
                                </>
                              )}
                            </span>
                          </FillButton>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
