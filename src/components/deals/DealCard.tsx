'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'

export interface Deal {
  id: number
  uuid: string
  name: string
  value: number
  currency: string
  stage_id: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  expected_close_date: string | null
  company_id: number | null
  company?: {
    name: string
  }
}

interface DealCardProps {
  deal: Deal
}

const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: 'bg-[#FDE8E5]', text: 'text-[#B42318]', label: 'Urgent' },
  high: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]', label: 'Haute' },
  medium: { bg: 'bg-[#FFF9E6]', text: 'text-[#F59E0B]', label: 'Moyenne' },
  low: { bg: 'bg-[#F5F7F9]', text: 'text-[#9BA0A6]', label: 'Faible' },
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = priorityConfig[deal.priority] || priorityConfig.low

  const closeDate = deal.expected_close_date
    ? new Date(deal.expected_close_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <Link href={`/deals/${deal.uuid}`}>
        <div className="p-3 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl hover:bg-white dark:hover:bg-[#161B22] hover:shadow-md hover:border-black/[0.12] dark:hover:border-[#30363D] transition-all duration-200 cursor-grab active:cursor-grabbing">
          {/* Header: Title + Priority */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="font-medium text-sm text-[#0D0F14] dark:text-[#E6EDF3] line-clamp-2 flex-1">
              {deal.name}
            </h4>
            <span
              className={`flex-shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${priority.bg} ${priority.text}`}
            >
              {priority.label}
            </span>
          </div>

          {/* Company */}
          {deal.company && (
            <div className="flex items-center gap-1.5 mb-3">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#9BA0A6] dark:text-[#8B949E]"
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-xs text-[#4E525A] dark:text-[#8B949E] truncate">
                {deal.company.name}
              </span>
            </div>
          )}

          {/* Footer: Value + Date */}
          <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-[#30363D]">
            <span className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
              {deal.value.toLocaleString('fr-FR')} {deal.currency}
            </span>
            {closeDate && (
              <div className="flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#9BA0A6] dark:text-[#8B949E]"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                  {closeDate}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
