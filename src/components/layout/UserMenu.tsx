'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserMenuProps {
  user: {
    id?: string
    email?: string
    full_name?: string
  }
  organizationName?: string
}

export function UserMenu({ user, organizationName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    buttonRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeMenu])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    {
      label: 'Parametres',
      href: '/settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      label: 'Proprietes',
      href: '/settings/properties',
      icon: 'M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18',
    },
  ]

  const initials = user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'
  const displayName = user.full_name || user.email?.split('@')[0] || 'Utilisateur'

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all duration-200 active:scale-[0.98] text-left"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Menu de ${displayName}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] dark:from-[#58A6FF] dark:to-[#1F6FEB] flex items-center justify-center text-white text-sm font-medium shadow-sm">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
            {displayName}
          </p>
          {organizationName && (
            <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] truncate">{organizationName}</p>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-[#9BA0A6] dark:text-[#8B949E] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute bottom-full left-0 right-0 mb-2 py-1 bg-white dark:bg-[#161B22] rounded-xl border border-black/[0.08] dark:border-[#30363D] shadow-lg z-50"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-black/[0.06] dark:border-[#30363D]">
            <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">{displayName}</p>
            <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
              >
                <svg
                  width="16"
                  height="16"
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
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-black/[0.06] dark:border-[#30363D] py-1">
            <button
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#D93025] hover:bg-[#D93025]/[0.08] transition-colors disabled:opacity-50"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {isLoggingOut ? 'Deconnexion...' : 'Se deconnecter'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
