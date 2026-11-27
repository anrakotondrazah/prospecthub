'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { TicketStatusBadge, type TicketStatus } from './TicketStatusBadge'

export interface TicketData {
  id: number
  uuid: string
  subject: string
  description: string | null
  status: TicketStatus
  priority: string | null
  category: string | null
  source: string | null
  created_at: string
  lead?: { id: number; first_name: string; last_name: string } | null
  company?: { id: number; name: string } | null
  assigned_to_profile?: { id: string; full_name: string } | null
}

interface TicketCardProps {
  ticket: TicketData
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-[#FDE8E5] dark:bg-[#B42318]/20 text-[#B42318] dark:text-[#EF9A9A]',
  high: 'bg-[#FFEBEE] dark:bg-[#C62828]/20 text-[#C62828] dark:text-[#EF9A9A]',
  medium: 'bg-[#FFF3E0] dark:bg-[#E65100]/20 text-[#E65100] dark:text-[#FFCC80]',
  low: 'bg-[#F5F7F9] dark:bg-[#21262D] text-[#9BA0A6] dark:text-[#8B949E]',
}

const priorityLabels: Record<string, string> = {
  urgent: 'Urgent',
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Faible',
}

const sourceIcons: Record<string, ReactNode> = {
  email: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
  phone: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  chat: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  web: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  manual: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
}

export function TicketCard({ ticket }: TicketCardProps) {
  const createdDate = new Date(ticket.created_at)
  const timeAgo = getTimeAgo(createdDate)

  return (
    <Link
      href={`/tickets/${ticket.uuid}`}
      className="block p-4 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl hover:border-black/[0.12] dark:hover:border-[#30363D] transition-all duration-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
            {ticket.subject}
          </h3>
          {ticket.description && (
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E] line-clamp-2 mt-1">
              {ticket.description}
            </p>
          )}
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Priority */}
          {ticket.priority && (
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${priorityColors[ticket.priority] || priorityColors.medium}`}>
              {priorityLabels[ticket.priority] || ticket.priority}
            </span>
          )}

          {/* Category */}
          {ticket.category && (
            <span className="text-xs text-[#4E525A] dark:text-[#8B949E]">
              {ticket.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#9BA0A6] dark:text-[#8B949E]">
          {/* Source icon */}
          {ticket.source && sourceIcons[ticket.source] && (
            <span className="flex items-center gap-1" title={ticket.source}>
              {sourceIcons[ticket.source]}
            </span>
          )}

          {/* Company or Lead */}
          {(ticket.company || ticket.lead) && (
            <span className="flex items-center gap-1 max-w-[120px] truncate">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {ticket.company?.name || `${ticket.lead?.first_name} ${ticket.lead?.last_name}`}
            </span>
          )}

          {/* Time */}
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "A l'instant"
  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `${diffDays}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
