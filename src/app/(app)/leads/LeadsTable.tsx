'use client'

import { useState } from 'react'

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
  { id: 'qualified', label: 'Qualifies' },
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

export function LeadsTable({ leads }: LeadsTableProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])

  // Calculate tab counts using is_hot for hot leads
  const tabCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    hot: leads.filter((l) => l.is_hot).length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
  }

  // Filter leads
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

  // Check if all visible leads are selected
  const allVisibleSelected = filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeads.includes(l.id))

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      // Deselect all visible
      setSelectedLeads((prev) => prev.filter((id) => !filteredLeads.some((l) => l.id === id)))
    } else {
      // Select all visible (add to existing selection)
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
    <div className="bg-white rounded-[14px] border border-[#E2E4E6] overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-4 border-b border-[#E2E4E6] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-[#0D0F14] border-[#17191F]'
                : 'text-[#4E525A] border-transparent hover:text-[#0D0F14]'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 text-xs rounded ${
                activeTab === tab.id
                  ? 'bg-[#17191F] text-white'
                  : 'bg-[#F5F7F9] text-[#4E525A]'
              }`}
            >
              {tabCounts[tab.id as keyof typeof tabCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-[#E2E4E6]">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
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
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-9 pl-9 pr-3 text-sm border border-[#E2E4E6] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17191F] focus:border-transparent"
              aria-label="Rechercher des leads"
            />
          </div>

          {/* Filters */}
          <button
            className="hidden sm:flex items-center gap-2 h-9 px-3 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] cursor-not-allowed"
            disabled
            title="Bientot disponible"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filtres
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <button
            className="flex items-center gap-2 h-9 px-3 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] cursor-not-allowed"
            disabled
            title="Bientot disponible"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Exporter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E4E6]">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]"
                  aria-label="Selectionner tous les leads visibles"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase tracking-wider">
                Source
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[#4E525A]">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-4 rounded-full bg-[#F5F7F9] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <p className="font-medium mb-1">Aucun lead trouve</p>
                    <p className="text-sm">
                      {searchQuery ? 'Essayez une autre recherche.' : 'Commencez par importer ou creer votre premier lead.'}
                    </p>
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
                    className="border-b border-[#E2E4E6] hover:bg-[#F5F7F9] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]"
                        aria-label={`Selectionner ${fullName}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#17191F] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-[#0D0F14] block truncate">
                            {fullName}
                          </span>
                          {lead.is_hot && (
                            <span className="text-xs text-[#C62828]">Chaud</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#4E525A] truncate max-w-[150px]">
                      {lead.company_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-[#4E525A] truncate max-w-[200px]">
                      {lead.email || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {lead.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-[#4E525A]">
                      {lead.source || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="p-1 rounded hover:bg-[#E2E4E6]"
                        aria-label={`Actions pour ${fullName}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-[#E2E4E6]">
          <p className="text-sm text-[#4E525A]">
            {selectedLeads.length > 0
              ? `${selectedLeads.length} selectionne(s) sur ${filteredLeads.length}`
              : `${filteredLeads.length} lead${filteredLeads.length > 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] cursor-not-allowed"
            >
              Precedent
            </button>
            <button
              disabled
              className="px-3 py-1.5 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
