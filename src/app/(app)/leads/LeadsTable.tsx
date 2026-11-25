'use client'

import { useState } from 'react'

interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
  score: number | null
  source: string | null
  created_at: string
  companies?: { name: string; domain: string | null } | null
  profiles?: { full_name: string } | null
}

interface LeadsTableProps {
  leads: Lead[]
}

const TABS = [
  { id: 'all', label: 'Tous', count: 0 },
  { id: 'new', label: 'Nouveaux', count: 0 },
  { id: 'hot', label: 'Chauds', count: 0 },
  { id: 'qualified', label: 'Qualifies', count: 0 },
  { id: 'assigned', label: 'Assignes', count: 0 },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]' },
  contacted: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
  qualified: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]' },
  hot: { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]' },
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
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  // Calculate tab counts
  const tabCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    hot: leads.filter((l) => l.status === 'hot').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    assigned: leads.filter((l) => l.profiles).length,
  }

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    if (activeTab === 'new' && lead.status !== 'new') return false
    if (activeTab === 'hot' && lead.status !== 'hot') return false
    if (activeTab === 'qualified' && lead.status !== 'qualified') return false
    if (activeTab === 'assigned' && !lead.profiles) return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase()
      return (
        fullName.includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.companies?.name?.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="bg-white rounded-[14px] border border-[#E2E4E6]">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-4 border-b border-[#E2E4E6]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E4E6]">
        <div className="flex items-center gap-3">
          {/* Search */}
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
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 pl-9 pr-3 text-sm border border-[#E2E4E6] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17191F] focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <button className="flex items-center gap-2 h-9 px-3 text-sm text-[#4E525A] border border-[#E2E4E6] rounded-[8px] hover:bg-[#F5F7F9]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filtres
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <button className="flex items-center gap-2 h-9 px-3 text-sm text-[#4E525A] border border-[#E2E4E6] rounded-[8px] hover:bg-[#F5F7F9]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Exporter
          </button>

          {/* Columns */}
          <button className="flex items-center gap-2 h-9 px-3 text-sm text-[#4E525A] border border-[#E2E4E6] rounded-[8px] hover:bg-[#F5F7F9]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Colonnes
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
                  checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]"
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
                Assigne a
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
                <td colSpan={9} className="px-4 py-12 text-center text-[#4E525A]">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-4 rounded-full bg-[#F5F7F9] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <p className="font-medium mb-1">Aucun lead trouve</p>
                    <p className="text-sm">Commencez par importer ou creer votre premier lead.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.new
                const scoreTier = getScoreTier(lead.score)
                const scoreStyle = SCORE_COLORS[scoreTier]
                const initials = `${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`.toUpperCase()

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
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#17191F] flex items-center justify-center text-white text-xs font-medium">
                          {initials}
                        </div>
                        <span className="font-medium text-[#0D0F14]">
                          {lead.first_name} {lead.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#4E525A]">
                      {lead.companies?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-[#4E525A]">{lead.email}</td>
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
                      {lead.profiles?.full_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-[#4E525A]">
                      {lead.source || '-'}
                    </td>
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
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E4E6]">
          <p className="text-sm text-[#4E525A]">
            {filteredLeads.length} lead{filteredLeads.length > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] disabled:opacity-50"
            >
              Precedent
            </button>
            <button
              disabled
              className="px-3 py-1.5 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
