'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'
import type { PipelineStage } from '@/components/deals/KanbanColumn'

type CreateDealModalProps = {
  isOpen: boolean
  onClose: () => void
  onDealCreated: (deal: any) => void
  organizationId: number
  userId: string
  stages: PipelineStage[]
}

export function CreateDealModal({
  isOpen,
  onClose,
  onDealCreated,
  organizationId,
  userId,
  stages,
}: CreateDealModalProps) {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [stageId, setStageId] = useState<number>(stages[0]?.id || 1)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [expectedCloseDate, setExpectedCloseDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Le nom est obligatoire')
      return
    }

    if (!value || parseFloat(value) <= 0) {
      setError('La valeur doit être supérieure à 0')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('deals')
        .insert({
          organization_id: organizationId,
          name: name.trim(),
          value: parseFloat(value),
          currency: 'EUR',
          stage_id: stageId,
          priority,
          expected_close_date: expectedCloseDate || null,
          notes: notes.trim() || null,
          created_by: userId,
          owner_id: userId,
        })
        .select('id, uuid, name, value, currency, stage_id, priority, expected_close_date')
        .single()

      if (insertError) throw insertError

      // Reset form
      setName('')
      setValue('')
      setPriority('medium')
      setExpectedCloseDate('')
      setNotes('')

      // Call parent callback
      onDealCreated(data)
      onClose()
    } catch (err: any) {
      console.error('Error creating deal:', err)
      setError(err.message || 'Erreur lors de la création de l\'affaire')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const priorityOptions = [
    { value: 'low', label: 'Faible', color: 'bg-[#F5F7F9] text-[#9BA0A6]' },
    { value: 'medium', label: 'Moyenne', color: 'bg-[#FFF9E6] text-[#F59E0B]' },
    { value: 'high', label: 'Haute', color: 'bg-[#FFF3E0] text-[#E65100]' },
    { value: 'urgent', label: 'Urgent', color: 'bg-[#FDE8E5] text-[#B42318]' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D] sticky top-0 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl z-10">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            Nouvelle affaire
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#B42318]/20 rounded-xl flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-[#B42318]">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="deal-name" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Nom de l'affaire <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="deal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Contrat annuel Acme Corp"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* Value */}
          <div>
            <label htmlFor="deal-value" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Montant (EUR) <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="deal-value"
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
            />
          </div>

          {/* Stage */}
          <div>
            <label htmlFor="deal-stage" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Étape du pipeline
            </label>
            <select
              id="deal-stage"
              value={stageId}
              onChange={(e) => setStageId(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
            >
              {stages.filter(s => !s.is_lost && !s.is_won).map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name} ({stage.probability}%)
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
              Priorité
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value as any)}
                  disabled={isLoading}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    priority === option.value
                      ? `${option.color} border-2 border-current shadow-sm`
                      : 'bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Close Date */}
          <div>
            <label htmlFor="deal-close-date" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Date de clôture estimée
            </label>
            <input
              id="deal-close-date"
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="deal-notes" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Notes (optionnel)
            </label>
            <textarea
              id="deal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes sur cette affaire..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annuler
            </button>
            <FillButton
              disabled={isLoading || !name.trim() || !value}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Création...
                </span>
              ) : (
                'Créer l\'affaire'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
