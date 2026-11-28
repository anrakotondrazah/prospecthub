'use client'

export type QuoteStatus = 'draft' | 'pending' | 'sent' | 'approved' | 'rejected' | 'expired'

const statusConfig: Record<QuoteStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-[#F5F7F9]', text: 'text-[#4E525A]', label: 'Brouillon' },
  pending: { bg: 'bg-[#FFF9E6]', text: 'text-[#F59E0B]', label: 'En attente' },
  sent: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', label: 'Envoyé' },
  approved: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]', label: 'Approuve' },
  rejected: { bg: 'bg-[#FDE8E5]', text: 'text-[#B42318]', label: 'Refusé' },
  expired: { bg: 'bg-[#F3E5F5]', text: 'text-[#7B1FA2]', label: 'Expiré' },
}

interface QuoteStatusBadgeProps {
  status: QuoteStatus
  size?: 'sm' | 'md'
}

export function QuoteStatusBadge({ status, size = 'md' }: QuoteStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`}></span>
      {config.label}
    </span>
  )
}
