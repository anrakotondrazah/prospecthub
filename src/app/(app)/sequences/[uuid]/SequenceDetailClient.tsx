'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'
import { SequenceTimeline } from '@/components/sequences/SequenceTimeline'
import { AddStepModal } from '@/components/sequences/AddStepModal'
import { EnrollLeadsModal } from '@/components/sequences/EnrollLeadsModal'

interface SequenceStep {
  id: number
  step_order: number
  step_type: 'email' | 'task' | 'delay'
  delay_days: number
  delay_hours: number
  subject: string | null
  body: string | null
  task_title: string | null
  task_description: string | null
  template_id: number | null
  created_at: string
}

interface Enrollment {
  id: number
  status: string
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

interface SequenceDetailClientProps {
  sequence: {
    id: number
    uuid: string
    name: string
    description: string | null
    status: 'draft' | 'active' | 'paused' | 'archived'
    trigger_type: string
    stats: {
      sent: number
      opened: number
      replied: number
      bounced: number
    }
    created_at: string
    updated_at: string
    enrollments_count: number
    steps: SequenceStep[]
  }
  enrollments: Enrollment[]
  completedCount: number
  organizationId: number
  userId: string
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
    label: 'Archivée',
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#9CA3AF]',
    darkBg: 'dark:bg-[#374151]/20',
  },
}

export function SequenceDetailClient({
  sequence,
  enrollments,
  completedCount,
  organizationId,
  userId,
}: SequenceDetailClientProps) {
  const router = useRouter()
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const statusConfig = STATUS_CONFIG[sequence.status] || STATUS_CONFIG.draft

  const openRate = sequence.stats.sent > 0
    ? Math.round((sequence.stats.opened / sequence.stats.sent) * 100)
    : 0

  const replyRate = sequence.stats.sent > 0
    ? Math.round((sequence.stats.replied / sequence.stats.sent) * 100)
    : 0

  const handleToggleStatus = async () => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      const newStatus = sequence.status === 'active' ? 'paused' : 'active'

      const { error } = await supabase
        .from('sequences')
        .update({ status: newStatus })
        .eq('id', sequence.id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error('Error toggling status:', err)
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séquence ? Cette action est irréversible.')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sequences')
        .delete()
        .eq('id', sequence.id)

      if (error) throw error

      router.push('/sequences')
    } catch (err) {
      console.error('Error deleting sequence:', err)
      alert('Erreur lors de la suppression de la séquence')
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/sequences"
          className="inline-flex items-center gap-2 text-sm text-[#4E525A] dark:text-[#8B949E] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux séquences
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                      {sequence.name}
                    </h1>
                    {sequence.description && (
                      <p className="text-[#4E525A] dark:text-[#8B949E] mt-1">{sequence.description}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold uppercase rounded ${statusConfig.bg} ${statusConfig.darkBg} ${statusConfig.text}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mb-6">
              {sequence.status !== 'archived' && (
                <>
                  <FillButton
                    onClick={handleToggleStatus}
                    disabled={isUpdating}
                    className="flex items-center gap-2"
                  >
                    {sequence.status === 'active' ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                        Mettre en pause
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                        Activer
                      </>
                    )}
                  </FillButton>
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="px-4 py-2.5 text-sm font-medium text-[#0066FF] hover:bg-[#0066FF]/5 rounded-xl transition-colors"
                  >
                    Inscrire des leads
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                className="ml-auto p-2.5 text-[#B42318] hover:bg-[#FDE8E5] rounded-xl transition-colors"
                title="Supprimer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-4 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Inscrits</p>
                <p className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                  {sequence.enrollments_count}
                </p>
              </div>
              <div className="p-4 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Terminés</p>
                <p className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                  {completedCount}
                </p>
              </div>
              <div className="p-4 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Taux ouverture</p>
                <p className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                  {openRate}%
                </p>
              </div>
              <div className="p-4 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-[10px]">
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Taux réponse</p>
                <p className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                  {replyRate}%
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] uppercase tracking-wider">
                Étapes de la séquence
              </h2>
              <button
                onClick={() => setShowAddStepModal(true)}
                className="px-3 py-1.5 text-xs font-medium text-[#0066FF] hover:bg-[#0066FF]/5 rounded-lg transition-colors"
              >
                + Ajouter une étape
              </button>
            </div>
            <SequenceTimeline steps={sequence.steps} />
          </div>

          {/* Enrollments list */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] uppercase tracking-wider mb-4">
              Leads inscrits ({enrollments.length})
            </h2>
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Aucun lead inscrit</p>
              </div>
            ) : (
              <div className="space-y-2">
                {enrollments.map((enrollment) => {
                  const lead = enrollment.lead
                  if (!lead) return null

                  const leadName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom'

                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F7F9] dark:hover:bg-[#0D1117] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#17191F] dark:bg-[#21262D] flex items-center justify-center text-white text-sm font-semibold">
                          {lead.first_name?.[0] || lead.last_name?.[0] || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                            {leadName}
                          </p>
                          <p className="text-xs text-[#4E525A] dark:text-[#8B949E] truncate">
                            {lead.email || lead.company_name || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                          Étape {enrollment.current_step}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          enrollment.status === 'completed' ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/10 text-[#16A34A]' :
                          enrollment.status === 'active' ? 'bg-[#E3F2FD] dark:bg-[#0066FF]/10 text-[#0066FF]' :
                          'bg-[#F5F7F9] dark:bg-[#21262D] text-[#6B7280]'
                        }`}>
                          {enrollment.status === 'completed' ? 'Terminé' :
                           enrollment.status === 'active' ? 'Actif' :
                           enrollment.status === 'paused' ? 'En pause' : enrollment.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] uppercase tracking-wider mb-4">
              Informations
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Référence</p>
                <p className="text-sm text-[#4E525A] dark:text-[#E6EDF3]">
                  {sequence.uuid.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Type de déclenchement</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {sequence.trigger_type === 'manual' ? 'Manuel' :
                   sequence.trigger_type === 'lead_created' ? 'Nouveau lead' :
                   sequence.trigger_type === 'deal_stage_changed' ? 'Changement étape' :
                   sequence.trigger_type}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Nombre d&apos;étapes</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {sequence.steps.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Créée le</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {new Date(sequence.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Dernière mise à jour</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {new Date(sequence.updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] uppercase tracking-wider mb-4">
              Statistiques
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Emails envoyés</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {sequence.stats.sent}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Emails ouverts</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {sequence.stats.opened}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Réponses</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {sequence.stats.replied}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Bounced</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {sequence.stats.bounced}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddStepModal && (
        <AddStepModal
          isOpen={showAddStepModal}
          onClose={() => setShowAddStepModal(false)}
          sequenceId={sequence.id}
          onStepAdded={() => {
            router.refresh()
            setShowAddStepModal(false)
          }}
        />
      )}

      {showEnrollModal && (
        <EnrollLeadsModal
          isOpen={showEnrollModal}
          onClose={() => setShowEnrollModal(false)}
          sequenceId={sequence.id}
          organizationId={organizationId}
          onLeadsEnrolled={() => {
            router.refresh()
            setShowEnrollModal(false)
          }}
        />
      )}
    </div>
  )
}
