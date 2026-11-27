'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'
import type { TicketData } from './TicketCard'

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onTicketCreated: (ticket: TicketData) => void
  organizationId: number
  userId: string
}

const categories = [
  'Support technique',
  'Facturation',
  'Demande de fonctionnalite',
  'Bug',
  'Question generale',
  'Autre',
]

const priorities = [
  { value: 'low', label: 'Faible', color: 'bg-[#F5F7F9] text-[#9BA0A6]' },
  { value: 'medium', label: 'Moyenne', color: 'bg-[#FFF9E6] text-[#F59E0B]' },
  { value: 'high', label: 'Haute', color: 'bg-[#FFF3E0] text-[#E65100]' },
  { value: 'urgent', label: 'Urgent', color: 'bg-[#FDE8E5] text-[#B42318]' },
]

export function CreateTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
  organizationId,
  userId,
}: CreateTicketModalProps) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim()) {
      setError('Le sujet est obligatoire')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('tickets')
        .insert({
          organization_id: organizationId,
          created_by: userId,
          subject: subject.trim(),
          description: description.trim() || null,
          priority,
          category: category || null,
          status: 'open',
          source: 'manual',
        })
        .select('id, uuid, subject, description, status, priority, category, source, created_at')
        .single()

      if (insertError) throw insertError

      // Reset form
      setSubject('')
      setDescription('')
      setPriority('medium')
      setCategory('')

      // Call parent callback
      onTicketCreated(data as TicketData)
      onClose()
    } catch (err: any) {
      console.error('Error creating ticket:', err)
      setError(err.message || 'Erreur lors de la creation du ticket')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-ticket-modal-title"
        className="relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D] sticky top-0 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl z-10">
          <h2 id="create-ticket-modal-title" className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            Nouveau ticket
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

          {/* Subject */}
          <div>
            <label htmlFor="ticket-subject" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Sujet <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="ticket-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Probleme de connexion"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="ticket-description" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Description
            </label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Decrivez le probleme en detail..."
              rows={4}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
              Priorite
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((option) => (
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

          {/* Category */}
          <div>
            <label htmlFor="ticket-category" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Categorie
            </label>
            <select
              id="ticket-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
            >
              <option value="">Selectionner une categorie</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
              disabled={isLoading || !subject.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Creation...
                </span>
              ) : (
                'Creer le ticket'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
