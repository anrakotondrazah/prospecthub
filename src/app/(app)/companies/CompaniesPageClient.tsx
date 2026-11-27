'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DownloadButton, UploadButton, FillButton, AnimatedCheckbox } from '@/components/ui/buttons'
import { ImportCSVModal, COMPANY_FIELD_LABELS } from '@/components/modals/ImportCSVModal'
import { generateCSV, downloadCSV } from '@/lib/utils/csv'

interface Company {
  id: number
  uuid: string
  name: string | null
  website: string | null
  industry: string | null
  employees_count: number | null
  created_at: string
}

interface CompaniesPageClientProps {
  initialCompanies: Company[]
  organizationId: number
}

export function CompaniesPageClient({ initialCompanies, organizationId }: CompaniesPageClientProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const supabase = createClient()

  const handleImport = useCallback(async (importedCompanies: Record<string, string>[]) => {
    let success = 0
    let errors = 0

    for (const company of importedCompanies) {
      const { error } = await supabase.from('companies').insert({
        organization_id: organizationId,
        name: company.name || null,
        website: company.website || null,
        industry: company.industry || null,
        employees_count: company.employees_count ? parseInt(company.employees_count) : null,
        phone: company.phone || null,
        email: company.email || null,
        address_street: company.address_street || null,
        address_city: company.address_city || null,
        address_postal_code: company.address_postal_code || null,
      })

      if (error) {
        errors++
      } else {
        success++
      }
    }

    if (success > 0) {
      const { data: newCompanies } = await supabase
        .from('companies')
        .select('id, uuid, name, website, industry, employees_count, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (newCompanies) {
        setCompanies(newCompanies)
      }
    }

    return { success, errors }
  }, [organizationId, supabase])

  const handleExport = useCallback(async () => {
    setIsExporting(true)

    try {
      const { data: allCompanies, error } = await supabase
        .from('companies')
        .select('name, website, industry, employees_count, phone, email, address_street, address_city, address_postal_code, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur export entreprises:', error)
        alert('Erreur lors de l\'export. Veuillez reessayer.')
        return
      }

      if (allCompanies && allCompanies.length > 0) {
        const headers = ['name', 'website', 'industry', 'employees_count', 'phone', 'email', 'address_street', 'address_city', 'address_postal_code', 'created_at']
        const csv = generateCSV(headers, allCompanies)
        const filename = `entreprises_export_${new Date().toISOString().split('T')[0]}.csv`
        downloadCSV(filename, csv)
      }
    } catch (err) {
      console.error('Erreur export entreprises:', err)
      alert('Erreur lors de l\'export. Veuillez reessayer.')
    } finally {
      setIsExporting(false)
    }
  }, [organizationId, supabase])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === companies.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(companies.map(c => c.id)))
    }
  }, [companies, selectedIds.size])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">Entreprises</h1>
          <p className="text-sm text-muted-foreground">
            Base de donnees de vos entreprises clientes et prospects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UploadButton
            onClick={() => setIsImportModalOpen(true)}
            tooltip="Importer CSV"
          />
          <DownloadButton
            onClick={handleExport}
            tooltip="Exporter CSV"
            disabled={isExporting || companies.length === 0}
          />
          <FillButton disabled title="Bientot disponible">
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nouvelle entreprise
            </span>
          </FillButton>
        </div>
      </div>

      <div className="bg-card rounded-[14px] border border-border">
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-12 px-4 py-3">
                  <AnimatedCheckbox
                    checked={companies.length > 0 && selectedIds.size === companies.length}
                    onChange={toggleSelectAll}
                    id="select-all-companies"
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
              {companies.length === 0 ? (
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
                        <AnimatedCheckbox
                          checked={selectedIds.has(company.id)}
                          onChange={() => toggleSelect(company.id)}
                          id={`company-${company.id}`}
                          aria-label={`Selectionner ${companyName}`}
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

        {companies.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {companies.length} entreprise{companies.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <FillButton disabled className="h-9 px-4 text-sm">
                Precedent
              </FillButton>
              <FillButton disabled className="h-9 px-4 text-sm">
                Suivant
              </FillButton>
            </div>
          </div>
        )}
      </div>

      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        fieldLabels={COMPANY_FIELD_LABELS}
        title="Importer des entreprises"
      />
    </div>
  )
}
