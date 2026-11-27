'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/providers/ThemeProvider'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { TrustBadge } from '@/components/ui/TrustBadge'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: 'Inbox',
    href: '/inbox',
    icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z',
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    label: 'Listes',
    href: '/lists',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    label: 'Base B2B',
    href: '/base-entreprises',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  },
  {
    label: 'Entreprises',
    href: '/companies',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    label: 'Affaires',
    href: '/deals',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'Taches',
    href: '/tasks',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    label: 'Reunions',
    href: '/meetings',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    label: 'Sequences',
    href: '/sequences',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    label: 'Templates',
    href: '/templates',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: 'Produits',
    href: '/products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    label: 'Devis',
    href: '/quotes',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: 'Tickets',
    href: '/tickets',
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    label: 'Rapports',
    href: '/reports',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
]

const comingSoonItems = [
  {
    label: 'Campagnes',
    href: '/campaigns',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  {
    label: 'Formulaires',
    href: '/forms',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    label: 'Automations',
    href: '/automations',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
]

const bottomItems = [
  {
    label: 'Parametres',
    href: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

interface SidebarProps {
  user?: {
    id?: string
    email?: string
    full_name?: string
  }
  organizationId?: number
  plan?: string
}

export function Sidebar({ user, organizationId, plan = 'Free' }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  const planColors: Record<string, string> = {
    Free: 'bg-[#F5F7F9] text-[#4E525A]',
    Starter: 'bg-[#E8F5E9] text-[#147A3A]',
    Pro: 'bg-[#E3F2FD] text-[#1565C0]',
    Enterprise: 'bg-[#FFF3E0] text-[#E65100]',
  }

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-r border-black/[0.08] dark:border-[#30363D] flex flex-col transition-all duration-200 z-50 hidden lg:flex shadow-sm ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      role="navigation"
      aria-label="Navigation principale"
    >
      {/* Header */}
      <div className="p-5 border-b border-black/[0.06] dark:border-[#30363D]">
        <Link href="/dashboard" className="flex items-center gap-3 group" aria-label="ProspectHub - Accueil">
          <div className="w-9 h-9 bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
              <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
              <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
            </svg>
          </div>
          {!isCollapsed && (
            <>
              <span className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">ProspectHub</span>
              <span className={`ml-auto text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md ${planColors[plan]}`}>
                {plan}
              </span>
            </>
          )}
        </Link>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 py-3">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-xl text-[#9BA0A6] dark:text-[#8B949E] transition-all duration-200 border border-black/[0.06] dark:border-[#30363D]"
            aria-label="Ouvrir la recherche (Ctrl+K)"
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
              document.dispatchEvent(event)
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-sm">Rechercher...</span>
            <span className="ml-auto text-xs bg-white/80 dark:bg-[#161B22] px-1.5 py-0.5 rounded-md border border-black/[0.08] dark:border-[#30363D] shadow-sm">Ctrl+K</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto" aria-label="Menu principal">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={['/dashboard', '/leads', '/deals', '/inbox'].includes(item.href) ? undefined : false}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-black/[0.06] dark:bg-white/[0.1] text-[#0D0F14] dark:text-[#E6EDF3] font-medium shadow-sm'
                      : 'text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] active:scale-[0.98]'
                  }`}
                  aria-label={isCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={item.icon} />
                  </svg>
                  {!isCollapsed && (
                    <span>{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {!isCollapsed && (
          <>
            <div className="px-3 pt-4 pb-2">
              <p className="text-xs font-medium text-[#9BA0A6] dark:text-[#8B949E] uppercase tracking-wider">Bientot disponible</p>
            </div>
            <ul className="space-y-1">
              {comingSoonItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[#9BA0A6] dark:text-[#8B949E] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] opacity-60 cursor-default pointer-events-none"
                    aria-label={item.label}
                    title={`${item.label} - Bientot disponible`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-medium bg-[#FFF3E0] text-[#E65100] rounded-md">
                      Soon
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-2 border-t border-black/[0.06] dark:border-[#30363D]">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={false}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#F5F7F9] dark:bg-white/[0.1] text-[#0D0F14] dark:text-[#E6EDF3] font-medium'
                      : 'text-[#4E525A] dark:text-[#8B949E] hover:bg-[#F5F7F9] dark:hover:bg-white/[0.05] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3]'
                  }`}
                  aria-label={isCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={item.icon} />
                  </svg>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Notification Bell & Dark Mode */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2">
            {user?.id && organizationId && (
              <NotificationBell userId={user.id} organizationId={organizationId} />
            )}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] flex items-center justify-center transition-all duration-200 text-[#4E525A] dark:text-[#8B949E]"
              aria-label={`Basculer en mode ${resolvedTheme === 'dark' ? 'clair' : 'sombre'}`}
            >
              {resolvedTheme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Trust Badges */}
        {!isCollapsed && (
          <div className="px-3 py-3 space-y-2 border-t border-black/[0.06] dark:border-[#30363D]">
            <TrustBadge type="hosting" variant="light" className="dark:!text-[#8B949E]" />
            <TrustBadge type="rgpd" variant="light" className="dark:!text-[#8B949E]" />
            <TrustBadge type="encryption" variant="light" className="dark:!text-[#8B949E]" />
          </div>
        )}

        {/* User */}
        {!isCollapsed && user && (
          <div
            className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] cursor-pointer transition-all duration-200 active:scale-[0.98]"
            role="button"
            tabIndex={0}
            aria-label={`Profil de ${user.full_name || user.email}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] dark:from-[#58A6FF] dark:to-[#1F6FEB] flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                {user.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white/95 dark:bg-[#161B22]/95 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-[#161B22] hover:shadow-md transition-all duration-200 shadow-sm active:scale-95"
        aria-label={isCollapsed ? 'Agrandir la sidebar' : 'Reduire la sidebar'}
        aria-expanded={!isCollapsed}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-200 text-[#4E525A] dark:text-[#8B949E] ${isCollapsed ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </aside>
  )
}
