'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'connected' | 'disconnected' | 'coming_soon'
  category: 'email' | 'calendar' | 'crm' | 'communication' | 'automation'
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'smtp',
    name: 'Serveur SMTP',
    description: 'Envoyez des emails depuis votre propre serveur',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    status: 'disconnected',
    category: 'email',
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Synchronisez vos reunions et disponibilites',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    status: 'coming_soon',
    category: 'calendar',
  },
  {
    id: 'outlook_calendar',
    name: 'Outlook Calendar',
    description: 'Integrez votre calendrier Microsoft',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    status: 'coming_soon',
    category: 'calendar',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Recevez des notifications dans vos canaux',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" />
        <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" />
        <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" />
        <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" />
        <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
        <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" />
        <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" />
      </svg>
    ),
    status: 'coming_soon',
    category: 'communication',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Envoyez des donnees vers vos applications',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    status: 'disconnected',
    category: 'automation',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connectez 5000+ applications',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    status: 'coming_soon',
    category: 'automation',
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  email: 'Email',
  calendar: 'Calendrier',
  crm: 'CRM',
  communication: 'Communication',
  automation: 'Automatisation',
}

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(INTEGRATIONS.map(i => i.category)))
  const filteredIntegrations = selectedCategory
    ? INTEGRATIONS.filter(i => i.category === selectedCategory)
    : INTEGRATIONS

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-[#DCFCE7] dark:bg-[#16A34A]/10 text-[#16A34A] rounded-md">
            Connecte
          </span>
        )
      case 'disconnected':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-[#F5F7F9] dark:bg-[#21262D] text-[#6B7280] dark:text-[#8B949E] rounded-md">
            Non connecte
          </span>
        )
      case 'coming_soon':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-[#FFF3E0] dark:bg-[#E65100]/10 text-[#E65100] rounded-md">
            Bientot
          </span>
        )
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[#4E525A] dark:text-[#8B949E] mb-2">
          <Link href="/settings" className="hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors">
            Parametres
          </Link>
          <span>/</span>
          <span className="text-[#0D0F14] dark:text-[#E6EDF3]">Integrations</span>
        </div>
        <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
          Integrations
        </h1>
        <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
          Connectez ProspectHub a vos outils favoris
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            selectedCategory === null
              ? 'bg-[#0066FF] text-white'
              : 'bg-[#F5F7F9] dark:bg-[#0D1117] text-[#4E525A] dark:text-[#8B949E] hover:bg-[#E8EAED] dark:hover:bg-[#161B22]'
          }`}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              selectedCategory === cat
                ? 'bg-[#0066FF] text-white'
                : 'bg-[#F5F7F9] dark:bg-[#0D1117] text-[#4E525A] dark:text-[#8B949E] hover:bg-[#E8EAED] dark:hover:bg-[#161B22]'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className={`bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5 transition-all ${
              integration.status !== 'coming_soon'
                ? 'hover:border-[#0066FF] hover:shadow-md cursor-pointer'
                : 'opacity-70'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                integration.status === 'connected'
                  ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/10 text-[#16A34A]'
                  : 'bg-[#F5F7F9] dark:bg-[#0D1117] text-[#4E525A] dark:text-[#8B949E]'
              }`}>
                {integration.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                    {integration.name}
                  </h3>
                  {getStatusBadge(integration.status)}
                </div>
                <p className="text-xs text-[#4E525A] dark:text-[#8B949E]">
                  {integration.description}
                </p>
              </div>
            </div>
            {integration.status === 'disconnected' && (
              <button className="mt-4 w-full px-4 py-2 text-sm font-medium text-[#0066FF] border border-[#0066FF] rounded-xl hover:bg-[#0066FF]/5 transition-colors">
                Configurer
              </button>
            )}
            {integration.status === 'connected' && (
              <button className="mt-4 w-full px-4 py-2 text-sm font-medium text-[#4E525A] dark:text-[#8B949E] border border-[#E2E4E6] dark:border-[#30363D] rounded-xl hover:bg-[#F5F7F9] dark:hover:bg-[#0D1117] transition-colors">
                Gerer
              </button>
            )}
          </div>
        ))}
      </div>

      {/* API Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">
          API et Developpement
        </h2>
        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0D1117] dark:bg-[#F5F7F9] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white dark:text-[#0D1117]">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
                Cles API
              </h3>
              <p className="text-xs text-[#4E525A] dark:text-[#8B949E] mb-4">
                Generez des cles API pour integrer ProspectHub dans vos applications
              </p>
              <button
                className="px-4 py-2 text-sm font-medium text-[#9BA0A6] border border-[#E2E4E6] dark:border-[#30363D] rounded-xl cursor-not-allowed"
                disabled
                title="Bientot disponible"
              >
                Generer une cle API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
