'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface SequenceData {
  id: number
  uuid: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'paused' | 'archived'
  trigger_type: 'manual' | 'lead_created' | 'deal_stage_changed'
  stats: {
    sent: number
    opened: number
    replied: number
    bounced?: number
  }
  steps_count?: number
  enrollments_count?: number
  created_at: string
  updated_at: string
}

interface SequenceCardProps {
  sequence: SequenceData
  onEdit?: (sequence: SequenceData) => void
  onToggleStatus?: (sequence: SequenceData) => void
  onDelete?: (sequence: SequenceData) => void
  onViewDetails?: (sequence: SequenceData) => void
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; darkBg: string }> = {
  draft: {
    label: 'Brouillon',
    bg: 'bg-[#F5F7F9]',
    text: 'text-[#6B7280]',
    darkBg: 'dark:bg-[#21262D]',
  },
  active: {
    label: 'Active',
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#16A34A]',
    darkBg: 'dark:bg-[#16A34A]/10',
  },
  paused: {
    label: 'En pause',
    bg: 'bg-[#FFF3E0]',
    text: 'text-[#E65100]',
    darkBg: 'dark:bg-[#E65100]/10',
  },
  archived: {
    label: 'Archivee',
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#9CA3AF]',
    darkBg: 'dark:bg-[#374151]/20',
  },
}

const TRIGGER_LABELS: Record<string, string> = {
  manual: 'Manuel',
  lead_created: 'Nouveau lead',
  deal_stage_changed: 'Changement etape',
}

export function SequenceCard({
  sequence,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewDetails,
}: SequenceCardProps) {
  const statusConfig = STATUS_CONFIG[sequence.status] || STATUS_CONFIG.draft

  const openRate = sequence.stats.sent > 0
    ? Math.round((sequence.stats.opened / sequence.stats.sent) * 100)
    : 0

  const replyRate = sequence.stats.sent > 0
    ? Math.round((sequence.stats.replied / sequence.stats.sent) * 100)
    : 0

  return (
    <div className="group p-4 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl hover:bg-white dark:hover:bg-[#161B22] hover:shadow-md hover:border-black/[0.12] dark:hover:border-[#30363D] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0066FF]/10 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0066FF"
              strokeWidth="1.5"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          {/* Title & Description */}
          <div className="min-w-0">
            <h4 className="font-medium text-sm text-[#0D0F14] dark:text-[#E6EDF3] line-clamp-1">
              {sequence.name}
            </h4>
            {sequence.description && (
              <p className="text-xs text-[#4E525A] dark:text-[#8B949E] line-clamp-1 mt-0.5">
                {sequence.description}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span className={`flex-shrink-0 px-2 py-1 rounded-md text-[10px] font-semibold uppercase ${statusConfig.bg} ${statusConfig.darkBg} ${statusConfig.text}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="text-center p-2 rounded-lg bg-[#F5F7F9] dark:bg-[#0D1117]">
          <p className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {sequence.steps_count || 0}
          </p>
          <p className="text-[10px] text-[#9BA0A6] dark:text-[#8B949E] uppercase">Étapes</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#F5F7F9] dark:bg-[#0D1117]">
          <p className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {sequence.enrollments_count || 0}
          </p>
          <p className="text-[10px] text-[#9BA0A6] dark:text-[#8B949E] uppercase">Inscrits</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#F5F7F9] dark:bg-[#0D1117]">
          <p className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {openRate}%
          </p>
          <p className="text-[10px] text-[#9BA0A6] dark:text-[#8B949E] uppercase">Ouverture</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#F5F7F9] dark:bg-[#0D1117]">
          <p className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {replyRate}%
          </p>
          <p className="text-[10px] text-[#9BA0A6] dark:text-[#8B949E] uppercase">Reponse</p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="mt-4 flex items-center gap-4 text-xs text-[#4E525A] dark:text-[#8B949E]">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>{TRIGGER_LABELS[sequence.trigger_type] || sequence.trigger_type}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{format(new Date(sequence.created_at), 'd MMM yyyy', { locale: fr })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          <span>{sequence.stats.sent} envoyés</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-[#30363D] flex items-center justify-between">
        <button
          onClick={() => onViewDetails?.(sequence)}
          className="text-xs font-medium text-[#0066FF] hover:text-[#0052CC] transition-colors"
        >
          Voir les details
        </button>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {sequence.status !== 'archived' && (
            <>
              <button
                onClick={() => onToggleStatus?.(sequence)}
                className="p-1.5 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
                title={sequence.status === 'active' ? 'Mettre en pause' : 'Activer'}
              >
                {sequence.status === 'active' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#E65100]">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#16A34A]">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(sequence)}
                  className="p-1.5 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
                  title="Modifier"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </>
          )}
          <button
            onClick={() => onDelete?.(sequence)}
            className="p-1.5 rounded-lg hover:bg-[#FDE8E5] transition-colors"
            title="Supprimer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
