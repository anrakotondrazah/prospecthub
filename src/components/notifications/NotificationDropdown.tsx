'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { NotificationItem, NotificationType } from './NotificationItem'

interface Notification {
  id: number
  type: NotificationType
  title: string
  message?: string | null
  link?: string | null
  is_read: boolean
  created_at: string
}

interface NotificationDropdownProps {
  notifications: Notification[]
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (id: number) => void
  onMarkAllAsRead: () => void
}

export function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-[380px] bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border border-black/[0.08] dark:border-[#30363D] rounded-2xl shadow-xl overflow-hidden z-50"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-[#30363D]">
        <h3 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 bg-black/[0.03] dark:bg-white/[0.05] rounded-full flex items-center justify-center mb-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#9BA0A6] dark:text-[#8B949E]"
                aria-hidden="true"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#9BA0A6] dark:text-[#8B949E]">Aucune notification</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-black/[0.06] dark:border-[#30363D] px-4 py-3">
          <Link
            href="/notifications"
            className="block text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            onClick={onClose}
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  )
}
