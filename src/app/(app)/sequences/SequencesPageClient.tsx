'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SequenceCard, type SequenceData } from '@/components/sequences/SequenceCard'
import { CreateSequenceModal, type CreatedSequence } from '@/components/sequences/CreateSequenceModal'
import { FillButton } from '@/components/ui/buttons'
import { createClient } from '@/lib/supabase/client'

interface SequencesPageClientProps {
  initialSequences: SequenceData[]
  organizationId: number
  userId: string
  error?: string
}

interface SequenceStats {
  active: number
  paused: number
  totalEnrolled: number
}

export function SequencesPageClient({
  initialSequences,
  organizationId,
  userId,
  error,
}: SequencesPageClientProps) {
  const router = useRouter()
  const [sequences, setSequences] = useState<SequenceData[]>(initialSequences)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all')

  // Calculate stats
  const stats: SequenceStats = {
    active: sequences.filter((s) => s.status === 'active').length,
    paused: sequences.filter((s) => s.status === 'paused').length,
    totalEnrolled: sequences.reduce((sum, s) => sum + (s.enrollments_count || 0), 0),
  }

  const filteredSequences = filter === 'all'
    ? sequences
    : sequences.filter((s) => s.status === filter)

  const handleSequenceCreated = useCallback((newSequence: CreatedSequence) => {
    const sequenceData: SequenceData = {
      ...newSequence,
      steps_count: 0,
      enrollments_count: 0,
    }
    setSequences((prev) => [sequenceData, ...prev])
  }, [])

  const handleToggleStatus = useCallback(async (sequence: SequenceData) => {
    const newStatus = sequence.status === 'active' ? 'paused' : 'active'
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('sequences')
      .update({ status: newStatus })
      .eq('id', sequence.id)

    if (!updateError) {
      setSequences((prev) =>
        prev.map((s) =>
          s.id === sequence.id ? { ...s, status: newStatus } : s
        )
      )
    }
  }, [])

  const handleDelete = useCallback(async (sequence: SequenceData) => {
    if (!confirm(`Supprimer la sequence "${sequence.name}" ? Cette action est irreversible.`)) {
      return
    }

    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('sequences')
      .delete()
      .eq('id', sequence.id)

    if (!deleteError) {
      setSequences((prev) => prev.filter((s) => s.id !== sequence.id))
    }
  }, [])

  const handleViewDetails = useCallback((sequence: SequenceData) => {
    router.push(`/sequences/${sequence.uuid}`)
  }, [router])

  if (error) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
              Sequences
            </h1>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
              Automatisez vos campagnes de prospection par email
            </p>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-2xl p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Erreur de chargement</p>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
            Sequences
          </h1>
          <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
            Automatisez vos campagnes de prospection par email
          </p>
        </div>
        <FillButton onClick={() => setIsModalOpen(true)}>
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Créer une sequence
          </span>
        </FillButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#4E525A] dark:text-[#8B949E]">Actives</span>
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] dark:bg-[#16A34A]/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {stats.active}
          </span>
        </div>

        <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#4E525A] dark:text-[#8B949E]">En pause</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] dark:bg-[#E65100]/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {stats.paused}
          </span>
        </div>

        <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#4E525A] dark:text-[#8B949E]">Total inscrits</span>
            <div className="w-8 h-8 rounded-lg bg-[#E3F2FD] dark:bg-[#1565C0]/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {stats.totalEnrolled}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'active', 'paused', 'draft'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab
                ? 'bg-[#0D0F14] dark:bg-[#E6EDF3] text-white dark:text-[#0D0F14]'
                : 'bg-[#F5F7F9] dark:bg-[#21262D] text-[#4E525A] dark:text-[#8B949E] hover:bg-[#E5E7EB] dark:hover:bg-[#30363D]'
            }`}
          >
            {tab === 'all' && 'Toutes'}
            {tab === 'active' && 'Actives'}
            {tab === 'paused' && 'En pause'}
            {tab === 'draft' && 'Brouillons'}
            {tab !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                ({sequences.filter((s) => s.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sequences List */}
      {filteredSequences.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-2xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] dark:bg-[#21262D] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#9BA0A6] dark:text-[#8B949E]">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p className="text-[#0D0F14] dark:text-[#E6EDF3] font-medium mb-2">
              {filter === 'all' ? 'Aucune sequence creee' : `Aucune sequence ${filter === 'active' ? 'active' : filter === 'paused' ? 'en pause' : 'en brouillon'}`}
            </p>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
              {filter === 'all'
                ? 'Creez votre première sequence pour automatiser vos emails de prospection'
                : 'Modifiez le filtre ou creez une nouvelle sequence'
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0066FF] hover:bg-[#0066FF]/10 rounded-xl transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Créer une sequence
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSequences.map((sequence) => (
            <SequenceCard
              key={sequence.id}
              sequence={sequence}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Create Sequence Modal */}
      <CreateSequenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSequenceCreated={handleSequenceCreated}
        organizationId={organizationId}
        userId={userId}
      />
    </div>
  )
}
