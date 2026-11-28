'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Enrollment {
  id: number
  status: string // 'active' | 'paused' | 'completed' | 'failed' | 'unenrolled'
  current_step: number
  next_step_at: string | null
  enrolled_at: string
  completed_at: string | null
  lead: {
    id: number
    first_name: string | null
    last_name: string | null
    email: string | null
    company_name: string | null
    status: string
  } | null
}

interface EnrollmentRowProps {
  enrollment: Enrollment
  totalSteps: number
  sequenceId: number
  onStatusChange: () => void
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; darkBg: string }> = {
  active: {
    label: 'Actif',
    bg: 'bg-[#E3F2FD]',
    text: 'text-[#0066FF]',
    darkBg: 'dark:bg-[#0066FF]/10',
  },
  paused: {
    label: 'En pause',
    bg: 'bg-[#FFF3E0]',
    text: 'text-[#E65100]',
    darkBg: 'dark:bg-[#E65100]/10',
  },
  completed: {
    label: 'Termine',
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#16A34A]',
    darkBg: 'dark:bg-[#16A34A]/10',
  },
  failed: {
    label: 'Echec',
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    darkBg: 'dark:bg-[#DC2626]/10',
  },
  unenrolled: {
    label: 'Desinscrit',
    bg: 'bg-[#F5F7F9]',
    text: 'text-[#6B7280]',
    darkBg: 'dark:bg-[#21262D]',
  },
}

export function EnrollmentRow({
  enrollment,
  totalSteps,
  sequenceId,
  onStatusChange,
}: EnrollmentRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const lead = enrollment.lead
  if (!lead) return null

  const leadName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom'
  const statusConfig = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.active
  const progress = totalSteps > 0 ? (enrollment.current_step / totalSteps) * 100 : 0

  const handleTogglePause = async () => {
    if (isUpdating) return
    setIsUpdating(true)

    const currentStatus = enrollment.status
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'

    try {
      const supabase = createClient()

      // Optimistic locking: only update if status matches expected
      const { data, error } = await supabase
        .from('sequence_enrollments')
        .update({ status: newStatus })
        .eq('id', enrollment.id)
        .eq('status', currentStatus)
        .select('id')
        .maybeSingle()

      if (error) throw error

      if (!data) {
        alert('Le statut a ete modifie par ailleurs. Veuillez rafraichir.')
        onStatusChange()
        return
      }

      onStatusChange()
    } catch (err) {
      console.error('Error toggling pause:', err)
      alert('Erreur lors de la mise a jour du statut')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnenroll = async () => {
    if (isUpdating) return

    if (!confirm(`Êtes-vous sûr de vouloir desinscrire ${leadName} de cette sequence ?`)) {
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/sequences/${sequenceId}/unenroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_ids: [lead.id],
          reason: 'Manuel',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la desinscription')
      }

      onStatusChange()
    } catch (err) {
      console.error('Error unenrolling:', err)
      alert(err instanceof Error ? err.message : 'Erreur lors de la desinscription')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="border border-black/[0.08] dark:border-[#30363D] rounded-lg overflow-hidden bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#161B22] transition-all">
      {/* Main Row */}
      <div className="flex items-center gap-3 p-3">
        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 w-6 h-6 rounded-md hover:bg-black/[0.06] dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          aria-label={isExpanded ? 'Reduire' : 'Etendre'}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-[#9BA0A6] dark:text-[#8B949E] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0066FF]/20 to-[#0066FF]/5 dark:from-[#0066FF]/30 dark:to-[#0066FF]/10 flex items-center justify-center border border-[#0066FF]/20">
          <span className="text-sm font-semibold text-[#0066FF]">
            {lead.first_name?.[0] || lead.last_name?.[0] || '?'}
          </span>
        </div>

        {/* Lead Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
            {leadName}
          </p>
          <p className="text-xs text-[#4E525A] dark:text-[#8B949E] truncate">
            {lead.email || lead.company_name || '-'}
          </p>
        </div>

        {/* Progress */}
        <div className="hidden md:flex flex-col items-end gap-1 w-32">
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-1.5 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-[#9BA0A6] dark:text-[#8B949E] w-8 text-right">
              {Math.round(progress)}%
            </span>
          </div>
          <span className="text-[10px] text-[#9BA0A6] dark:text-[#8B949E]">
            Etape {enrollment.current_step}/{totalSteps}
          </span>
        </div>

        {/* Status Badge */}
        <span
          className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-md ${statusConfig.bg} ${statusConfig.darkBg} ${statusConfig.text}`}
        >
          {statusConfig.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Pause/Resume */}
          {(enrollment.status === 'active' || enrollment.status === 'paused') && (
            <button
              onClick={handleTogglePause}
              disabled={isUpdating}
              className="p-1.5 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
              title={enrollment.status === 'active' ? 'Mettre en pause' : 'Reprendre'}
            >
              {enrollment.status === 'active' ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#E65100]"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#16A34A]"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
          )}

          {/* Unenroll */}
          {enrollment.status !== 'unenrolled' && enrollment.status !== 'completed' && (
            <button
              onClick={handleUnenroll}
              disabled={isUpdating}
              className="p-1.5 rounded-lg hover:bg-[#FDE8E5] dark:hover:bg-[#DC2626]/10 disabled:opacity-50 transition-colors"
              title="Desinscrire"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-black/[0.08] dark:border-[#30363D] bg-[#F5F7F9]/50 dark:bg-[#0D1117]/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeline Info */}
            <div>
              <h4 className="text-xs font-semibold text-[#9BA0A6] dark:text-[#8B949E] uppercase tracking-wider mb-2">
                Progression
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4E525A] dark:text-[#8B949E]">Inscrit le</span>
                  <span className="font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
                    {format(new Date(enrollment.enrolled_at), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
                {enrollment.next_step_at && enrollment.status === 'active' && (
                  <div className="flex justify-between">
                    <span className="text-[#4E525A] dark:text-[#8B949E]">Prochaine etape</span>
                    <span className="font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
                      {format(new Date(enrollment.next_step_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                )}
                {enrollment.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-[#4E525A] dark:text-[#8B949E]">Termine le</span>
                    <span className="font-medium text-[#16A34A]">
                      {format(new Date(enrollment.completed_at), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Details */}
            <div>
              <h4 className="text-xs font-semibold text-[#9BA0A6] dark:text-[#8B949E] uppercase tracking-wider mb-2">
                Informations lead
              </h4>
              <div className="space-y-2 text-sm">
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[#9BA0A6] dark:text-[#8B949E] flex-shrink-0"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span className="text-[#0D0F14] dark:text-[#E6EDF3] truncate">{lead.email}</span>
                  </div>
                )}
                {lead.company_name && (
                  <div className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[#9BA0A6] dark:text-[#8B949E] flex-shrink-0"
                    >
                      <path d="M3 21h18M3 7v14M21 7v14M9 21V7M15 21V7M5 7h14a2 2 0 0 1 2 2v12H3V9a2 2 0 0 1 2-2z" />
                    </svg>
                    <span className="text-[#0D0F14] dark:text-[#E6EDF3] truncate">{lead.company_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-[#9BA0A6] dark:text-[#8B949E] flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span className="text-[#0D0F14] dark:text-[#E6EDF3]">
                    Statut lead: <span className="font-medium">{lead.status}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
