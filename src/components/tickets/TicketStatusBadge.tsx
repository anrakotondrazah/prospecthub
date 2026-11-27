'use client'

export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed'

interface TicketStatusBadgeProps {
  status: TicketStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<TicketStatus, { label: string; classes: string }> = {
  open: {
    label: 'Ouvert',
    classes: 'bg-[#F5F7F9] dark:bg-[#21262D] text-[#4E525A] dark:text-[#8B949E]',
  },
  pending: {
    label: 'En attente',
    classes: 'bg-[#FFF9E6] dark:bg-[#F59E0B]/10 text-[#B8860B] dark:text-[#F59E0B]',
  },
  in_progress: {
    label: 'En cours',
    classes: 'bg-[#E8F4FD] dark:bg-[#1565C0]/10 text-[#1565C0] dark:text-[#58A6FF]',
  },
  resolved: {
    label: 'Resolu',
    classes: 'bg-[#E8F5E9] dark:bg-[#147A3A]/10 text-[#147A3A] dark:text-[#3FB950]',
  },
  closed: {
    label: 'Ferme',
    classes: 'bg-[#E5E7EB] dark:bg-[#374151] text-[#374151] dark:text-[#9CA3AF]',
  },
}

export function TicketStatusBadge({ status, size = 'sm' }: TicketStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.open

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold uppercase rounded-full ${config.classes} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}
