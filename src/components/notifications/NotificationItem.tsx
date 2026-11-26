'use client'

import { useRouter } from 'next/navigation'

export type NotificationType = 'lead_assigned' | 'task_due' | 'deal_won' | 'mention'

interface NotificationItemProps {
  id: number
  type: NotificationType
  title: string
  message?: string | null
  link?: string | null
  is_read: boolean
  created_at: string
  onMarkAsRead: (id: number) => void
}

const notificationIcons: Record<NotificationType, string> = {
  lead_assigned: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  task_due: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  deal_won: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  mention: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
}

const notificationColors: Record<NotificationType, { bg: string; text: string }> = {
  lead_assigned: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
  task_due: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
  deal_won: { bg: 'bg-green-500/10 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400' },
  mention: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const created = new Date(date)
  const diff = now.getTime() - created.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'A l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return created.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function NotificationItem({
  id,
  type,
  title,
  message,
  link,
  is_read,
  created_at,
  onMarkAsRead,
}: NotificationItemProps) {
  const router = useRouter()
  const colors = notificationColors[type]

  const handleClick = () => {
    if (!is_read) {
      onMarkAsRead(id)
    }
    if (link) {
      router.push(link)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all duration-200 cursor-pointer border-b border-black/[0.06] dark:border-[#30363D] last:border-0 ${
        !is_read ? 'bg-blue-50/50 dark:bg-blue-900/5' : ''
      }`}
      role="button"
      tabIndex={0}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center`}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={colors.text}
          aria-hidden="true"
        >
          <path d={notificationIcons[type]} />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${!is_read ? 'text-[#0D0F14] dark:text-[#E6EDF3]' : 'text-[#4E525A] dark:text-[#8B949E]'}`}>
            {title}
          </p>
          {!is_read && (
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full mt-1" aria-label="Non lu" />
          )}
        </div>
        {message && (
          <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mt-0.5 line-clamp-2">
            {message}
          </p>
        )}
        <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mt-1">
          {getRelativeTime(created_at)}
        </p>
      </div>
    </div>
  )
}
