'use client'

import { useState, useCallback } from 'react'
import { FillButton } from '@/components/ui/buttons'
import { TicketCard, type TicketData } from '@/components/tickets/TicketCard'
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'

interface TicketsPageClientProps {
  initialTickets: TicketData[]
  organizationId: number
  userId: string
  error?: string
}

export function TicketsPageClient({
  initialTickets,
  organizationId,
  userId,
  error,
}: TicketsPageClientProps) {
  const [tickets, setTickets] = useState<TicketData[]>(initialTickets)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const handleTicketCreated = useCallback((newTicket: TicketData) => {
    setTickets((prev) => [newTicket, ...prev])
  }, [])

  // Calculate stats
  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress' || t.status === 'pending').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length

  // Filter tickets
  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter((t) => {
        if (filterStatus === 'active') return ['open', 'pending', 'in_progress'].includes(t.status)
        if (filterStatus === 'resolved') return ['resolved', 'closed'].includes(t.status)
        return t.status === filterStatus
      })

  if (error) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">
              Tickets
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerez les demandes de support client
            </p>
          </div>
          <FillButton onClick={() => setIsModalOpen(true)}>
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nouveau ticket
            </span>
          </FillButton>
        </div>
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 dark:text-red-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-foreground mb-2">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>

        {/* Create Ticket Modal - also needed in error state */}
        <CreateTicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTicketCreated={handleTicketCreated}
          organizationId={organizationId}
          userId={userId}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">
            Tickets
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerez les demandes de support client
          </p>
        </div>
        <FillButton onClick={() => setIsModalOpen(true)}>
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau ticket
          </span>
        </FillButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{openCount}</p>
              <p className="text-sm text-muted-foreground">Ouverts</p>
            </div>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </div>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
              <p className="text-sm text-muted-foreground">Resolus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'Tous', count: tickets.length },
          { value: 'active', label: 'Actifs', count: openCount + inProgressCount },
          { value: 'open', label: 'Ouverts', count: openCount },
          { value: 'resolved', label: 'Resolus', count: resolvedCount },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              filterStatus === tab.value
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              filterStatus === tab.value
                ? 'bg-background/20'
                : 'bg-foreground/10'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 mx-auto mb-5 rounded-[14px] bg-muted flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filterStatus === 'all' ? 'Aucun ticket' : 'Aucun ticket dans cette categorie'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {filterStatus === 'all'
                ? 'Creez votre premier ticket pour commencer a gerer vos demandes de support.'
                : 'Essayez de modifier les filtres pour voir plus de tickets.'}
            </p>
            {filterStatus === 'all' && (
              <FillButton onClick={() => setIsModalOpen(true)}>
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Creer un ticket
                </span>
              </FillButton>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
        organizationId={organizationId}
        userId={userId}
      />
    </div>
  )
}
