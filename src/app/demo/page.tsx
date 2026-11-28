'use client'

import { useState } from 'react'
import Link from 'next/link'

const DEMO_LEADS = [
  { id: 1, first_name: 'Marie', last_name: 'Dupont', email: 'marie.dupont@techcorp.fr', company: 'TechCorp SAS', status: 'qualified', score: 9, is_hot: true, source: 'LinkedIn' },
  { id: 2, first_name: 'Pierre', last_name: 'Martin', email: 'p.martin@conseilpro.com', company: 'ConseilPro', status: 'new', score: 7, is_hot: false, source: 'Site web' },
  { id: 3, first_name: 'Sophie', last_name: 'Bernard', email: 'sophie.b@agencedigitale.fr', company: 'AgenceDigitale', status: 'contacted', score: 8, is_hot: true, source: 'Referral' },
  { id: 4, first_name: 'Jean', last_name: 'Leroy', email: 'j.leroy@innovcorp.com', company: 'InnovCorp', status: 'new', score: 5, is_hot: false, source: 'Google Ads' },
  { id: 5, first_name: 'Claire', last_name: 'Moreau', email: 'claire.moreau@startuplab.io', company: 'StartupLab', status: 'qualified', score: 9, is_hot: true, source: 'Salon' },
  { id: 6, first_name: 'Thomas', last_name: 'Garcia', email: 't.garcia@buildtech.fr', company: 'BuildTech', status: 'nurturing', score: 6, is_hot: false, source: 'Site web' },
  { id: 7, first_name: 'Emma', last_name: 'Petit', email: 'emma.petit@dataflow.com', company: 'DataFlow', status: 'new', score: 4, is_hot: false, source: 'LinkedIn' },
  { id: 8, first_name: 'Lucas', last_name: 'Roux', email: 'l.roux@greenenergie.fr', company: 'GreenEnergie', status: 'contacted', score: 7, is_hot: false, source: 'Pappers' },
]

const DEMO_STATS = {
  total: 847,
  new: 124,
  qualified: 89,
  hot: 23,
}

const TABS = [
  { id: 'all', label: 'Tous', count: DEMO_LEADS.length },
  { id: 'new', label: 'Nouveaux', count: DEMO_LEADS.filter(l => l.status === 'new').length },
  { id: 'hot', label: 'Chauds', count: DEMO_LEADS.filter(l => l.is_hot).length },
  { id: 'qualified', label: 'Qualifiés', count: DEMO_LEADS.filter(l => l.status === 'qualified').length },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]' },
  contacted: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
  qualified: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]' },
  nurturing: { bg: 'bg-[#E8EAF6]', text: 'text-[#3949AB]' },
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  nurturing: 'En maturation',
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '#', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: false },
  { label: 'Leads', href: '#', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', active: true },
  { label: 'Entreprises', href: '#', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', active: false },
  { label: 'Tâches', href: '#', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', active: false },
]

export default function DémoPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])

  const filteredLeads = DEMO_LEADS.filter((lead) => {
    if (activeTab === 'new') return lead.status === 'new'
    if (activeTab === 'hot') return lead.is_hot
    if (activeTab === 'qualified') return lead.status === 'qualified'
    return true
  })

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Démo Banner */}
      <div className="bg-[#1565C0] text-white py-2 px-4 text-center text-sm">
        <span className="font-medium">Mode Démo</span>
        <span className="mx-2">-</span>
        <span>Données fictives pour demonstration.</span>
        <Link href="/auth/register" className="ml-3 underline font-medium hover:no-underline">
          Créer un compte gratuit
        </Link>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[260px] bg-white border-r border-[#E2E4E6] min-h-[calc(100vh-36px)] hidden lg:block relative">
          <div className="p-5 border-b border-[#EFF1F3]">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#17191F] rounded-[10px] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
                  <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
                  <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-[#0D0F14]">ProspectHub</span>
              <span className="ml-auto text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#E3F2FD] text-[#1565C0]">
                Démo
              </span>
            </Link>
          </div>

          <nav className="p-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors ${
                      item.active
                        ? 'bg-[#F5F7F9] text-[#0D0F14] font-medium'
                        : 'text-[#4E525A] hover:bg-[#F5F7F9]'
                    }`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-[#F5F7F9] rounded-[12px]">
              <p className="text-sm font-medium text-[#0D0F14] mb-2">Passer en production ?</p>
              <p className="text-xs text-[#4E525A] mb-3">Creez votre compte pour sauvegarder vos données.</p>
              <Link
                href="/auth/register"
                className="block w-full py-2 text-center text-sm font-medium text-white bg-[#17191F] rounded-[8px] hover:bg-[#2D3039]"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            {[
              { label: 'Total leads', value: DEMO_STATS.total },
              { label: 'Nouveaux', value: DEMO_STATS.new },
              { label: 'Qualifiés', value: DEMO_STATS.qualified },
              { label: 'Chauds', value: DEMO_STATS.hot },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-[14px] border border-[#E2E4E6] p-4 lg:p-5">
                <p className="text-xs lg:text-sm text-[#4E525A] mb-1">{stat.label}</p>
                <span className="text-2xl lg:text-[31.5px] font-semibold text-[#0D0F14]">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Leads Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">Leads</h1>
              <p className="text-sm text-[#4E525A]">Gérez et suivez vos prospects</p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#17191F] rounded-[10px] opacity-60 cursor-not-allowed"
              disabled
              title="Creez un compte pour ajouter des leads"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nouveau lead
            </button>
          </div>

          {/* Leads Table */}
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
                  <span className={`px-1.5 py-0.5 text-xs rounded ${
                    activeTab === tab.id ? 'bg-[#17191F] text-white' : 'bg-[#F5F7F9] text-[#4E525A]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E4E6]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-64 h-9 pl-9 pr-3 text-sm border border-[#E2E4E6] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17191F]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E4E6]">
                    <th className="w-12 px-4 py-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase">Entreprise</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase hidden lg:table-cell">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4E525A] uppercase hidden lg:table-cell">Source</th>
                    <th className="w-12 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => {
                    const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.new
                    const initials = `${lead.first_name[0]}${lead.last_name[0]}`
                    const scoreColor = lead.score >= 8 ? 'bg-[#E8F5E9] text-[#147A3A]' : lead.score >= 5 ? 'bg-[#FFF3E0] text-[#E65100]' : 'bg-[#FFEBEE] text-[#C62828]'

                    return (
                      <tr key={lead.id} className="border-b border-[#E2E4E6] hover:bg-[#F5F7F9] transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => setSelectedLeads(prev =>
                              prev.includes(lead.id) ? prev.filter(id => id !== lead.id) : [...prev, lead.id]
                            )}
                            className="w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#17191F] flex items-center justify-center text-white text-xs font-medium">
                              {initials}
                            </div>
                            <div>
                              <span className="font-medium text-[#0D0F14]">
                                {lead.first_name} {lead.last_name}
                              </span>
                              {lead.is_hot && (
                                <span className="ml-2 text-xs text-[#C62828]">Chaud</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#4E525A]">{lead.company}</td>
                        <td className="px-4 py-3 text-[#4E525A] hidden md:table-cell">{lead.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}>
                            {STATUS_LABELS[lead.status] || 'Nouveau'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${scoreColor}`}>
                            {lead.score}/10
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#4E525A] hidden lg:table-cell">{lead.source}</td>
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
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E4E6]">
              <p className="text-sm text-[#4E525A]">{filteredLeads.length} leads</p>
              <div className="flex items-center gap-2">
                <button disabled className="px-3 py-1.5 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] cursor-not-allowed">
                  Précédent
                </button>
                <button disabled className="px-3 py-1.5 text-sm text-[#9BA0A6] border border-[#E2E4E6] rounded-[8px] cursor-not-allowed">
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
