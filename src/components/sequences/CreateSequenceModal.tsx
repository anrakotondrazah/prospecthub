'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'

interface CreateSequenceModalProps {
  isOpen: boolean
  onClose: () => void
  onSequenceCreated: (sequence: CreatedSequence) => void
  organizationId: number
  userId: string
}

export interface CreatedSequence {
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
    bounced: number
  }
  created_at: string
  updated_at: string
}

const TRIGGER_OPTIONS = [
  {
    value: 'manual',
    label: 'Manuel',
    description: 'Inscrivez manuellement les leads dans cette sequence',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    value: 'lead_created',
    label: 'Nouveau lead',
    description: 'Automatiquement quand un nouveau lead est cree',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
  {
    value: 'deal_stage_changed',
    label: 'Changement etape deal',
    description: 'Quand un deal change de stage dans le pipeline',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
]

export function CreateSequenceModal({
  isOpen,
  onClose,
  onSequenceCreated,
  organizationId,
  userId,
}: CreateSequenceModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState<'manual' | 'lead_created' | 'deal_stage_changed'>('manual')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Le nom de la sequence est requis')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('sequences')
        .insert({
          organization_id: organizationId,
          created_by: userId,
          name: name.trim(),
          description: description.trim() || null,
          trigger_type: triggerType,
          status: 'draft',
          stats: { sent: 0, opened: 0, replied: 0, bounced: 0 },
        })
        .select()
        .single()

      if (insertError) throw insertError

      onSequenceCreated(data as CreatedSequence)
      handleClose()
    } catch (err) {
      console.error('Error creating sequence:', err)
      setError('Erreur lors de la creation de la sequence')
    } finally {
      setIsSubmitting(false)
    }
  }, [name, description, triggerType, organizationId, userId, onSequenceCreated])

  const handleClose = useCallback(() => {
    setName('')
    setDescription('')
    setTriggerType('manual')
    setError(null)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto bg-white dark:bg-[#161B22] rounded-2xl shadow-xl border border-black/[0.08] dark:border-[#30363D]"
      >
        {/* Header */}
        <div className="p-6 border-b border-black/[0.06] dark:border-[#30363D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                  Nouvelle sequence
                </h2>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
                  Creez une sequence d&apos;emails automatique
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="p-3 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#FECACA] dark:border-[#B42318]/30 rounded-xl">
                <p className="text-sm text-[#B42318]">{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Nom de la sequence *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Relance prospects froids"
                className="w-full px-4 py-3 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] placeholder-[#9BA0A6] dark:placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez l'objectif de cette sequence..."
                rows={3}
                className="w-full px-4 py-3 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] placeholder-[#9BA0A6] dark:placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all resize-none"
              />
            </div>

            {/* Trigger Type */}
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
                Declencheur
              </label>
              <div className="space-y-2">
                {TRIGGER_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      triggerType === option.value
                        ? 'border-[#0066FF] bg-[#0066FF]/5'
                        : 'border-black/[0.08] dark:border-[#30363D] hover:border-black/[0.16] dark:hover:border-[#484F58]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="trigger_type"
                      value={option.value}
                      checked={triggerType === option.value}
                      onChange={(e) => setTriggerType(e.target.value as typeof triggerType)}
                      className="sr-only"
                    />
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      triggerType === option.value
                        ? 'bg-[#0066FF]/10 text-[#0066FF]'
                        : 'bg-[#F5F7F9] dark:bg-[#21262D] text-[#9BA0A6]'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        triggerType === option.value
                          ? 'text-[#0066FF]'
                          : 'text-[#0D0F14] dark:text-[#E6EDF3]'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-[#4E525A] dark:text-[#8B949E] mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    {triggerType === option.value && (
                      <div className="flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-black/[0.06] dark:border-[#30363D] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-[#4E525A] dark:text-[#8B949E] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
            >
              Annuler
            </button>
            <FillButton
              onClick={() => {}}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creation...
                </span>
              ) : (
                'Creer la sequence'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
