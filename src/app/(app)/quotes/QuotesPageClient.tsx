'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QuoteStatusBadge, type QuoteStatus } from '@/components/quotes/QuoteStatusBadge'
import { CreateQuoteModal } from '@/components/quotes/CreateQuoteModal'
import { FillButton } from '@/components/ui/buttons'

type Quote = {
  id: number
  uuid: string
  quote_number: string
  name: string
  status: QuoteStatus
  recipient_name: string | null
  recipient_company: string | null
  quote_date: string
  valid_until: string | null
  total: number
  currency: string
  created_at: string
  company: { id: number; name: string } | null
  deal: { id: number; name: string } | null
}

type QuotesPageClientProps = {
  initialQuotes: Quote[]
  companies: { id: number; name: string }[]
  deals: { id: number; name: string }[]
  organizationId: number
  userId: string
}

const statusFilters = [
  { value: 'all', label: 'Tous' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'sent', label: 'Envoyes' },
  { value: 'approved', label: 'Approuves' },
  { value: 'rejected', label: 'Refuses' },
  { value: 'expired', label: 'Expires' },
]

export function QuotesPageClient({
  initialQuotes,
  companies,
  deals,
  organizationId,
  userId,
}: QuotesPageClientProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = searchQuery === '' ||
      quote.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.recipient_company?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleQuoteCreated = (newQuote: { id: number; uuid: string; quote_number: string; name: string }) => {
    const quote: Quote = {
      ...newQuote,
      status: 'draft',
      recipient_name: null,
      recipient_company: null,
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: null,
      total: 0,
      currency: 'EUR',
      created_at: new Date().toISOString(),
      company: null,
      deal: null,
    }
    setQuotes([quote, ...quotes])
    setIsCreateModalOpen(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Stats
  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    sent: quotes.filter((q) => q.status === 'sent').length,
    approved: quotes.filter((q) => q.status === 'approved').length,
    totalValue: quotes.reduce((sum, q) => sum + q.total, 0),
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">Devis</h1>
          <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
            Creez et envoyez des devis professionnels
          </p>
        </div>
        <FillButton onClick={() => setIsCreateModalOpen(true)}>
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Creer un devis
          </span>
        </FillButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] dark:bg-[#21262D] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#17191F] dark:text-[#E6EDF3]">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{stats.total}</p>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Total devis</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#FFF9E6] dark:bg-[#F59E0B]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{stats.draft}</p>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Brouillons</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E8F5E9] dark:bg-[#147A3A]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{stats.approved}</p>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Approuves</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E3F2FD] dark:bg-[#1565C0]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{formatCurrency(stats.totalValue, 'EUR')}</p>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Valeur totale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6] dark:text-[#8B949E]"
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
            placeholder="Rechercher un devis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E6] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] placeholder:text-[#9BA0A6] dark:placeholder:text-[#8B949E] focus:outline-none focus:border-[#17191F] dark:focus:border-[#58A6FF] transition-colors"
          />
        </div>

        <div className="flex gap-1 bg-[#F5F7F9] dark:bg-[#21262D] p-1 rounded-xl">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === filter.value
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Table */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] dark:bg-[#21262D] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#4E525A] dark:text-[#8B949E]">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              {searchQuery || statusFilter !== 'all' ? 'Aucun devis trouve' : 'Aucun devis'}
            </h3>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Essayez avec d\'autres criteres de recherche'
                : 'Creez votre premier devis pour commencer'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <FillButton onClick={() => setIsCreateModalOpen(true)}>
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Creer un devis
                </span>
              </FillButton>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFF1F3] dark:border-[#30363D]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] dark:text-[#8B949E] uppercase tracking-wide">
                  Numero
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] dark:text-[#8B949E] uppercase tracking-wide">
                  Nom
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] dark:text-[#8B949E] uppercase tracking-wide">
                  Destinataire
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] dark:text-[#8B949E] uppercase tracking-wide">
                  Statut
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#4E525A] dark:text-[#8B949E] uppercase tracking-wide">
                  Montant
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] dark:text-[#8B949E] uppercase tracking-wide">
                  Date
                </th>
                <th className="w-12 px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF1F3] dark:divide-[#30363D]">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-[#F5F7F9] dark:hover:bg-[#21262D] transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/quotes/${quote.uuid}`} className="text-sm font-medium text-[#17191F] dark:text-[#58A6FF] hover:underline">
                      {quote.quote_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/quotes/${quote.uuid}`} className="block">
                      <p className="font-medium text-[#0D0F14] dark:text-[#E6EDF3]">{quote.name}</p>
                      {quote.deal && (
                        <p className="text-xs text-[#4E525A] dark:text-[#8B949E] mt-0.5">Deal: {quote.deal.name}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">{quote.recipient_name || '-'}</p>
                    {quote.recipient_company && (
                      <p className="text-xs text-[#4E525A] dark:text-[#8B949E]">{quote.recipient_company}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <QuoteStatusBadge status={quote.status} size="sm" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                      {formatCurrency(quote.total, quote.currency)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#4E525A] dark:text-[#8B949E]">
                    {formatDate(quote.quote_date)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/quotes/${quote.uuid}`}
                      className="text-[#4E525A] dark:text-[#8B949E] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Quote Modal */}
      <CreateQuoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQuoteCreated={handleQuoteCreated}
        organizationId={organizationId}
        userId={userId}
        companies={companies}
        deals={deals}
      />
    </div>
  )
}
