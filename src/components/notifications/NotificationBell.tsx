'use client'

import { useState, useEffect } from 'react'
import { NotificationDropdown } from './NotificationDropdown'

interface Notification {
  id: number
  type: 'lead_assigned' | 'task_due' | 'deal_won' | 'mention'
  title: string
  message?: string | null
  link?: string | null
  is_read: boolean
  created_at: string
}

interface NotificationBellProps {
  userId?: string
  organizationId: number | null
}

export function NotificationBell({ userId, organizationId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    if (isLoading || !organizationId) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark as read
  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Animation pulse when new notifications
  const [shouldPulse, setShouldPulse] = useState(false)
  useEffect(() => {
    if (unreadCount > 0) {
      setShouldPulse(true)
      const timeout = setTimeout(() => setShouldPulse(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [unreadCount])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] flex items-center justify-center transition-all duration-200 ${
          shouldPulse ? 'animate-pulse' : ''
        }`}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
        aria-expanded={isOpen}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#4E525A] dark:text-[#8B949E]"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#B42318] text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        notifications={notifications}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  )
}
