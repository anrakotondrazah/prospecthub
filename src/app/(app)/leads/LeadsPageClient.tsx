'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { LeadsTable } from './LeadsTable'
import { ImportCSVModal } from '@/components/modals/ImportCSVModal'
import { generateCSV, downloadCSV } from '@/lib/utils/csv'
import { createClient } from '@/lib/supabase/client'
import { DownloadButton, UploadButton, FillButton } from '@/components/ui/buttons'

interface Lead {
  id: number
  uuid: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  status: string
  score: number | null
  is_hot: boolean
  source: string | null
  company_name: string | null
  created_at: string
  owner_id: number | null
}

interface LeadsPageClientProps {
  initialLeads: Lead[]
  organizationId: number
}

export function LeadsPageClient({ initialLeads, organizationId }: LeadsPageClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const supabase = createClient()

  const handleImport = useCallback(async (importedLeads: Record<string, string>[]) => {
    let success = 0
    let errors = 0

    for (const lead of importedLeads) {
      const { error } = await supabase.from('leads').insert({
        organization_id: organizationId,
        first_name: lead.first_name || null,
        last_name: lead.last_name || null,
        email: lead.email || null,
        phone: lead.phone || null,
        company_name: lead.company_name || null,
        company_siret: lead.company_siret || null,
        address_city: lead.address_city || null,
        address_postal_code: lead.address_postal_code || null,
        source: lead.source || 'import_csv',
        status: 'new',
      })

      if (error) {
        errors++
      } else {
        success++
      }
    }

    if (success > 0) {
      const { data: newLeads } = await supabase
        .from('leads')
        .select('id, uuid, first_name, last_name, email, phone, status, score, is_hot, source, company_name, created_at, owner_id')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (newLeads) {
        setLeads(newLeads)
      }
    }

    return { success, errors }
  }, [organizationId, supabase])

  const handleExport = useCallback(async () => {
    setIsExporting(true)

    try {
      const { data: allLeads } = await supabase
        .from('leads')
        .select('first_name, last_name, email, phone, company_name, company_siret, address_city, address_postal_code, status, score, source, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (allLeads && allLeads.length > 0) {
        const headers = ['first_name', 'last_name', 'email', 'phone', 'company_name', 'company_siret', 'address_city', 'address_postal_code', 'status', 'score', 'source', 'created_at']
        const csv = generateCSV(headers, allLeads)
        const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
        downloadCSV(filename, csv)
      }
    } catch (err) {
      console.error('Erreur export leads:', err)
      alert('Erreur lors de l\'export')
    }

    setIsExporting(false)
  }, [organizationId, supabase])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[23.5px] font-semibold text-foreground mb-1">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {leads.length} lead{leads.length !== 1 ? 's' : ''}
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
            disabled={isExporting || leads.length === 0}
          />
          <Link href="/base-entreprises">
            <FillButton>
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Trouver leads
              </span>
            </FillButton>
          </Link>
        </div>
      </div>

      <LeadsTable leads={leads} />

      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  )
}
