'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    label: 'Entreprises',
    href: '/companies',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    label: 'Taches',
    href: '/tasks',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    label: 'Rapports',
    href: '/reports',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
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
    email?: string
    full_name?: string
  }
  plan?: string
}

export function Sidebar({ user, plan = 'Free' }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const planColors: Record<string, string> = {
    Free: 'bg-[#F5F7F9] text-[#4E525A]',
    Starter: 'bg-[#E8F5E9] text-[#147A3A]',
    Pro: 'bg-[#E3F2FD] text-[#1565C0]',
    Enterprise: 'bg-[#FFF3E0] text-[#E65100]',
  }

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-[#E2E4E6] flex flex-col transition-all duration-200 z-50 ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-[#EFF1F3]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#17191F] rounded-[10px] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
              <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
              <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
            </svg>
          </div>
          {!isCollapsed && (
            <>
              <span className="text-lg font-semibold text-[#0D0F14]">ProspectHub</span>
              <span className={`ml-auto text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${planColors[plan]}`}>
                {plan}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F7F9] rounded-[10px] text-[#9BA0A6]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-sm">Rechercher...</span>
            <span className="ml-auto text-xs bg-white px-1.5 py-0.5 rounded border border-[#E2E4E6]">/</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors ${
                    isActive
                      ? 'bg-[#F5F7F9] text-[#0D0F14] font-medium'
                      : 'text-[#4E525A] hover:bg-[#F5F7F9] hover:text-[#0D0F14]'
                  }`}
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
                  >
                    <path d={item.icon} />
                  </svg>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-2 border-t border-[#EFF1F3]">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors ${
                    isActive
                      ? 'bg-[#F5F7F9] text-[#0D0F14] font-medium'
                      : 'text-[#4E525A] hover:bg-[#F5F7F9] hover:text-[#0D0F14]'
                  }`}
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
                  >
                    <path d={item.icon} />
                  </svg>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* User */}
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-[10px] hover:bg-[#F5F7F9] cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#17191F] flex items-center justify-center text-white text-sm font-medium">
              {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0D0F14] truncate">
                {user.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-[#9BA0A6] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-[#E2E4E6] rounded-full flex items-center justify-center hover:bg-[#F5F7F9] transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4E525A"
          strokeWidth="2"
          className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </aside>
  )
}
