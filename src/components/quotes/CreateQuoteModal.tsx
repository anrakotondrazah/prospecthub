'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'

type CreateQuoteModalProps = {
  isOpen: boolean
  onClose: () => void
  onQuoteCreated: (quote: { id: number; uuid: string; quote_number: string; name: string }) => void
  organizationId: number
  userId: string
  companies?: { id: number; name: string }[]
  deals?: { id: number; name: string }[]
}

export function CreateQuoteModal({
  isOpen,
  onClose,
  onQuoteCreated,
  organizationId,
  userId,
  companies = [],
  deals = [],
}: CreateQuoteModalProps) {
  const [name, setName] = useState('')
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [dealId, setDealId] = useState<number | null>(null)
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Le nom est obligatoire')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Generate quote number
      const year = new Date().getFullYear()
      const { count } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .like('quote_number', `DEV-${year}-%`)

      const nextNumber = (count || 0) + 1
      const quoteNumber = `DEV-${year}-${String(nextNumber).padStart(4, '0')}`

      const selectedCompany = companies.find(c => c.id === companyId)

      const { data, error: insertError } = await supabase
        .from('quotes')
        .insert({
          organization_id: organizationId,
          quote_number: quoteNumber,
          name: name.trim(),
          status: 'draft',
          deal_id: dealId,
          company_id: companyId,
          recipient_name: recipientName.trim() || null,
          recipient_email: recipientEmail.trim() || null,
          recipient_company: selectedCompany?.name || null,
          quote_date: new Date().toISOString().split('T')[0],
          valid_until: validUntil,
          owner_id: userId,
          created_by: userId,
        })
        .select('id, uuid, quote_number, name')
        .single()

      if (insertError) throw insertError

      // Reset form
      setName('')
      setCompanyId(null)
      setDealId(null)
      setRecipientName('')
      setRecipientEmail('')

      onQuoteCreated(data)
    } catch (err: unknown) {
      console.error('Error creating quote:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la creation du devis'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D]">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">Créer un devis</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#B42318]/20 rounded-xl flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#B42318] dark:text-[#F87171]">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-[#B42318] dark:text-[#F87171]">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="quote-name" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Nom du devis <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="quote-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Proposition commerciale Q4"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* Company select */}
          {companies.length > 0 && (
            <div>
              <label htmlFor="quote-company" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Entreprise
              </label>
              <select
                id="quote-company"
                value={companyId || ''}
                onChange={(e) => setCompanyId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              >
                <option value="">Sélectionnez une entreprise...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Deal select */}
          {deals.length > 0 && (
            <div>
              <label htmlFor="quote-deal" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Associer a un deal
              </label>
              <select
                id="quote-deal"
                value={dealId || ''}
                onChange={(e) => setDealId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              >
                <option value="">Aucun deal</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>{deal.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Recipient fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="recipient-name" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Contact
              </label>
              <input
                id="recipient-name"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="recipient-email" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Email
              </label>
              <input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="jean@entreprise.fr"
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Valid until */}
          <div>
            <label htmlFor="valid-until" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Valide jusqu&apos;au
            </label>
            <input
              id="valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annuler
            </button>
            <FillButton
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Création...
                </span>
              ) : (
                'Créer le devis'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
