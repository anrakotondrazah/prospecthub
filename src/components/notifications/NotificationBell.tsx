'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Activity {
  id: number
  activity_type: string
  subject: string | null
  activity_date: string
  associated_lead_id: number | null
  associated_company_id: number | null
  associated_deal_id: number | null
}

interface NotificationBellProps {
  organizationId: number | null
}

const ACTIVITY_ICONS: Record<string, string> = {
  note: 'M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z',
  call: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
  email: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  meeting: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  other: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'A l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins}m`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return past.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function NotificationBell({ organizationId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchActivities = useCallback(async () => {
    if (!organizationId) return

    setIsLoading(true)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('activities')
      .select('id, activity_type, subject, activity_date, associated_lead_id, associated_company_id, associated_deal_id')
      .eq('organization_id', organizationId)
      .gte('activity_date', twentyFourHoursAgo)
      .order('activity_date', { ascending: false })
      .limit(10)

    if (!error && data) {
      setActivities(data)
      setUnreadCount(data.length)
    }

    setIsLoading(false)
  }, [organizationId, supabase])

  useEffect(() => {
    fetchActivities()
    const interval = setInterval(fetchActivities, 30000)
    return () => clearInterval(interval)
  }, [fetchActivities])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-[8px] hover:bg-[#F5F7F9] transition-colors"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-semibold text-white bg-[#B42318] rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[14px] shadow-2xl border border-[#E2E4E6] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#E2E4E6]">
            <h3 className="font-semibold text-[#0D0F14]">Notifications</h3>
            <p className="text-xs text-[#9BA0A6]">Activites des dernieres 24h</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-6 h-6 mx-auto border-2 border-[#9BA0A6] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#F5F7F9] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  </svg>
                </div>
                <p className="text-sm text-[#9BA0A6]">Aucune activite recente</p>
              </div>
            ) : (
              <div>
                {activities.map((activity) => {
                  const icon = ACTIVITY_ICONS[activity.activity_type] || ACTIVITY_ICONS.other
                  let href = '/inbox'
                  if (activity.associated_lead_id) href = `/leads/${activity.associated_lead_id}`
                  else if (activity.associated_company_id) href = `/companies/${activity.associated_company_id}`

                  return (
                    <a
                      key={activity.id}
                      href={href}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#F5F7F9] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F5F7F9] flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
                          <path d={icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0D0F14] truncate">
                          {activity.subject || activity.activity_type}
                        </p>
                        <p className="text-xs text-[#9BA0A6]">
                          {getRelativeTime(activity.activity_date)}
                        </p>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-[#E2E4E6] bg-[#F5F7F9]">
            <a
              href="/inbox"
              className="text-xs font-medium text-[#1565C0] hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Voir toutes les activites
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
