'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'

interface EnrollLeadsModalProps {
  isOpen: boolean
  onClose: () => void
  sequenceId: number
  organizationId: number
  onLeadsEnrolled: () => void
}

interface Lead {
  id: number
  first_name: string | null
  last_name: string | null
  email: string | null
  company_name: string | null
  status: string
}

export function EnrollLeadsModal({
  isOpen,
  onClose,
  sequenceId,
  organizationId,
  onLeadsEnrolled,
}: EnrollLeadsModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available leads
  useEffect(() => {
    if (!isOpen) return

    const fetchLeads = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()

        // Get leads that are not already enrolled in this sequence
        const { data: enrolledLeadIds } = await supabase
          .from('sequence_enrollments')
          .select('lead_id')
          .eq('sequence_id', sequenceId)

        const enrolledIds = new Set((enrolledLeadIds || []).map(e => e.lead_id))

        const { data: allLeads, error: leadsError } = await supabase
          .from('leads')
          .select('id, first_name, last_name, email, company_name, status')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(100)

        if (leadsError) throw leadsError

        // Filter out already enrolled leads
        const availableLeads = (allLeads || []).filter(lead => !enrolledIds.has(lead.id))
        setLeads(availableLeads)
      } catch (err) {
        console.error('Error fetching leads:', err)
        setError('Erreur lors du chargement des leads')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [isOpen, sequenceId, organizationId])

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase()
    const email = (lead.email || '').toLowerCase()
    const company = (lead.company_name || '').toLowerCase()
    return fullName.includes(query) || email.includes(query) || company.includes(query)
  })

  const toggleLead = (leadId: number) => {
    setSelectedLeadIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(leadId)) {
        newSet.delete(leadId)
      } else {
        newSet.add(leadId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const allSelected = filteredLeads.length > 0 && filteredLeads.every(lead => selectedLeadIds.has(lead.id))
    if (allSelected) {
      // Deselect all filtered leads
      const newSet = new Set(selectedLeadIds)
      filteredLeads.forEach(lead => newSet.delete(lead.id))
      setSelectedLeadIds(newSet)
    } else {
      // Select all filtered leads
      const newSet = new Set(selectedLeadIds)
      filteredLeads.forEach(lead => newSet.add(lead.id))
      setSelectedLeadIds(newSet)
    }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedLeadIds.size === 0) {
      setError('Sélectionnez au moins un lead')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const enrollments = Array.from(selectedLeadIds).map((leadId) => ({
        sequence_id: sequenceId,
        lead_id: leadId,
        status: 'active',
        current_step: 1,
        next_step_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabase
        .from('sequence_enrollments')
        .insert(enrollments)

      if (insertError) throw insertError

      onLeadsEnrolled()
      handleClose()
    } catch (err) {
      console.error('Error enrolling leads:', err)
      setError('Erreur lors de l\'inscription des leads')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedLeadIds, sequenceId, onLeadsEnrolled])

  const handleClose = useCallback(() => {
    setSearchQuery('')
    setSelectedLeadIds(new Set())
    setError(null)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden bg-white dark:bg-[#161B22] rounded-2xl shadow-xl border border-black/[0.08] dark:border-[#30363D] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-black/[0.06] dark:border-[#30363D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                  Inscrire des leads
                </h2>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
                  {selectedLeadIds.size > 0 ? `${selectedLeadIds.size} lead(s) sélectionné(s)` : 'Sélectionnez les leads à inscrire'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Error */}
            {error && (
              <div className="p-3 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#FECACA] dark:border-[#B42318]/30 rounded-xl">
                <p className="text-sm text-[#B42318]">{error}</p>
              </div>
            )}

            {/* Search */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un lead (nom, email, entreprise)..."
                className="w-full px-4 py-3 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] placeholder-[#9BA0A6] dark:placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all"
              />
            </div>

            {/* Select all */}
            {filteredLeads.length > 0 && (
              <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06] dark:border-[#30363D]">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={filteredLeads.length > 0 && filteredLeads.every(lead => selectedLeadIds.has(lead.id))}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#0066FF] border-black/[0.16] dark:border-[#30363D] rounded focus:ring-[#0066FF]/30"
                />
                <label htmlFor="select-all" className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] cursor-pointer">
                  Tout sélectionner ({filteredLeads.length})
                </label>
              </div>
            )}

            {/* Leads list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-[#0066FF]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F5F7F9] dark:bg-[#0D1117] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="1.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                  </svg>
                </div>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
                  {searchQuery ? 'Aucun lead trouvé' : 'Tous les leads sont déjà inscrits ou il n\'y a pas de leads disponibles'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.has(lead.id)
                  const leadName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom'

                  return (
                    <label
                      key={lead.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0066FF] bg-[#0066FF]/5'
                          : 'border-black/[0.08] dark:border-[#30363D] hover:border-black/[0.16] dark:hover:border-[#484F58]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleLead(lead.id)}
                        className="w-4 h-4 text-[#0066FF] border-black/[0.16] dark:border-[#30363D] rounded focus:ring-[#0066FF]/30"
                      />
                      <div className="w-10 h-10 rounded-full bg-[#17191F] dark:bg-[#21262D] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {lead.first_name?.[0] || lead.last_name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                          {leadName}
                        </p>
                        <p className="text-xs text-[#4E525A] dark:text-[#8B949E] truncate">
                          {lead.email || lead.company_name || '-'}
                        </p>
                      </div>
                      <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E] flex-shrink-0">
                        {lead.status}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-black/[0.06] dark:border-[#30363D] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-[#4E525A] dark:text-[#8B949E] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
            >
              Annuler
            </button>
            <FillButton
              disabled={isSubmitting || selectedLeadIds.size === 0}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Inscription...
                </span>
              ) : (
                `Inscrire ${selectedLeadIds.size} lead(s)`
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
