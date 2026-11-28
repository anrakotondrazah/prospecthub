'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VerificationBadge } from '@/components/ui/VerificationBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnimatedCheckbox } from '@/components/ui/buttons'

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

interface LeadsTableProps {
  leads: Lead[]
}

const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'new', label: 'Nouveaux' },
  { id: 'hot', label: 'Chauds' },
  { id: 'qualified', label: 'Qualifiés' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]' },
  contacted: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
  qualified: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]' },
  unqualified: { bg: 'bg-[#F5F5F5]', text: 'text-[#616161]' },
  nurturing: { bg: 'bg-[#E8EAF6]', text: 'text-[#3949AB]' },
  converted: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]' },
  lost: { bg: 'bg-[#F5F5F5]', text: 'text-[#616161]' },
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  unqualified: 'Non qualifié',
  nurturing: 'En maturation',
  converted: 'Converti',
  lost: 'Perdu',
}

const SCORE_COLORS: Record<string, { bg: string; text: string }> = {
  poor: { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]' },
  fair: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
  good: { bg: 'bg-[#F1F8E9]', text: 'text-[#558B2F]' },
  excellent: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]' },
}

function getScoreTier(score: number | null): string {
  if (!score) return 'poor'
  if (score <= 2) return 'poor'
  if (score <= 5) return 'fair'
  if (score <= 8) return 'good'
  return 'excellent'
}

function LeadDetailPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.new
  const scoreTier = getScoreTier(lead.score)
  const scoreStyle = SCORE_COLORS[scoreTier]
  const initials = `${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`.toUpperCase() || '?'
  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom'
  const createdDate = new Date(lead.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Detail du lead</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-[8px] hover:bg-muted transition-colors"
            aria-label="Fermer le panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#17191F] flex items-center justify-center text-white text-xl font-semibold">
              {initials}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{fullName}</h3>
              {lead.company_name && (
                <p className="text-muted-foreground">{lead.company_name}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}>
                  {STATUS_LABELS[lead.status] || 'Nouveau'}
                </span>
                {lead.is_hot && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-[#FFEBEE] text-[#C62828]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Chaud
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-[10px] hover:bg-muted transition-colors"
              disabled
              title="Bientôt disponible"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-[10px] hover:bg-muted transition-colors"
              disabled
              title="Bientôt disponible"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Appeler
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-[10px] hover:bg-muted transition-colors"
              disabled
              title="Bientôt disponible"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              RDV
            </button>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
              Informations de contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-muted flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{lead.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-muted flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="text-sm text-foreground truncate">{lead.phone || '-'}</p>
                  {lead.phone && (
                    <div className="mt-1">
                      <VerificationBadge type="bloctel" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-muted flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entreprise</p>
                  <p className="text-sm text-foreground">{lead.company_name || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Info */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
              Informations lead
            </h4>

            {/* Badges de verification */}
            <div className="flex flex-wrap gap-2 mb-4">
              <VerificationBadge type="vérifiéd" date={lead.created_at} />
              <VerificationBadge type="source" source={lead.source || undefined} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-[10px]">
                <p className="text-xs text-muted-foreground mb-1">Score</p>
                {lead.score !== null ? (
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded ${scoreStyle.bg} ${scoreStyle.text}`}>
                    {lead.score}/10
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
              <div className="p-3 bg-muted rounded-[10px]">
                <p className="text-xs text-muted-foreground mb-1">Source</p>
                <p className="text-sm font-medium text-foreground">{lead.source || '-'}</p>
              </div>
              <div className="p-3 bg-muted rounded-[10px]">
                <p className="text-xs text-muted-foreground mb-1">Créé le</p>
                <p className="text-sm font-medium text-foreground">{createdDate}</p>
              </div>
              <div className="p-3 bg-muted rounded-[10px]">
                <p className="text-xs text-muted-foreground mb-1">Reference</p>
                <p className="text-sm text-muted-foreground truncate">{lead.uuid.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Timeline placeholder */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
              Activité
            </h4>
            <div className="text-center py-8 bg-muted rounded-[10px]">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-card flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Aucune activité</p>
              <p className="text-xs text-muted-foreground mt-1">Les actions apparaitront ici.</p>
            </div>
          </div>

          {/* View Full Detail Button */}
          <div className="mt-6 pt-6 border-t border-border">
            <Link
              href={`/leads/${lead.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-white bg-[#17191F] rounded-[10px] hover:bg-[#2D3038] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Voir le detail complet
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const tabCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    hot: leads.filter((l) => l.is_hot).length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
  }

  const filteredLeads = leads.filter((lead) => {
    if (activeTab === 'new' && lead.status !== 'new') return false
    if (activeTab === 'hot' && !lead.is_hot) return false
    if (activeTab === 'qualified' && lead.status !== 'qualified') return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase()
      return (
        fullName.includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.company_name?.toLowerCase().includes(query)
      )
    }

    return true
  })

  const allVisibleSelected = filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeads.includes(l.id))

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedLeads((prev) => prev.filter((id) => !filteredLeads.some((l) => l.id === id)))
    } else {
      const visibleIds = filteredLeads.map((l) => l.id)
      setSelectedLeads((prev) => [...new Set([...prev, ...visibleIds])])
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <>
      <div className="bg-card rounded-[14px] border border-border overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 text-xs rounded ${
                  activeTab === tab.id
                    ? 'bg-background/20'
                    : 'bg-foreground/10'
                }`}
              >
                {tabCounts[tab.id as keyof typeof tabCounts]}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
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
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 h-9 pl-9 pr-3 text-sm bg-background border border-border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                aria-label="Rechercher des leads"
              />
            </div>
            <button
              className="hidden sm:flex items-center gap-2 h-9 px-3 text-sm text-muted-foreground border border-border rounded-[8px] cursor-not-allowed"
              disabled
              title="Bientôt disponible"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filtres
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-12 px-4 py-3">
                  <AnimatedCheckbox
                    checked={allVisibleSelected}
                    onChange={() => toggleSelectAll()}
                    id="select-all-leads"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Source
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 && !searchQuery ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState type="leads" />
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#4E525A] dark:text-[#8B949E]">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-4 rounded-full bg-[#F5F7F9] dark:bg-[#161B22] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <path d="M21 21l-4.35-4.35" />
                        </svg>
                      </div>
                      <p className="font-medium mb-1 text-[#0D0F14] dark:text-[#E6EDF3]">Aucun résultat</p>
                      <p className="text-sm">Essayez une autre recherche.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.new
                  const scoreTier = getScoreTier(lead.score)
                  const scoreStyle = SCORE_COLORS[scoreTier]
                  const initials = `${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`.toUpperCase() || '?'
                  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom'

                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-border hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-border accent-foreground"
                          aria-label={`Selectionner ${fullName}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-medium flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-foreground block truncate">
                              {fullName}
                            </span>
                            {lead.is_hot && (
                              <span className="text-xs text-red-600 dark:text-red-400">Chaud</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[150px]">
                        {lead.company_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px] hidden md:table-cell">
                        {lead.email || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {STATUS_LABELS[lead.status] || 'Nouveau'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {lead.score !== null ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${scoreStyle.bg} ${scoreStyle.text}`}
                          >
                            {lead.score}/10
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {lead.source || '-'}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="p-1 rounded hover:bg-muted"
                          aria-label={`Actions pour ${fullName}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
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

        {/* Pagination */}
        {filteredLeads.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {selectedLeads.length > 0
                ? `${selectedLeads.length} selectionne(s) sur ${filteredLeads.length}`
                : `${filteredLeads.length} entreprise${filteredLeads.length > 1 ? 's correspondent' : ' correspond'} a votre recherche`}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-[8px] cursor-not-allowed"
              >
                Précédent
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

      {/* Lead Detail Panel */}
      {selectedLead && (
        <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </>
  )
}
