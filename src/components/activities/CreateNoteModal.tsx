'use client'

import { useState } from 'react'
import { FillButton } from '@/components/ui/buttons'
import { useActivities } from '@/hooks/useActivities'

interface CreateNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onNoteCreated?: () => void
  associatedLeadId?: number
  associatedCompanyId?: number
  associatedDealId?: number
}

export function CreateNoteModal({
  isOpen,
  onClose,
  onNoteCreated,
  associatedLeadId,
  associatedCompanyId,
  associatedDealId,
}: CreateNoteModalProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { createNote, isLoading } = useActivities()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!body.trim()) {
      setError('Le contenu de la note est obligatoire')
      return
    }

    setError(null)

    const result = await createNote({
      subject: subject.trim() || undefined,
      body: body.trim(),
      associated_lead_id: associatedLeadId,
      associated_company_id: associatedCompanyId,
      associated_deal_id: associatedDealId,
    })

    if (result) {
      // Reset form
      setSubject('')
      setBody('')
      onNoteCreated?.()
      onClose()
    } else {
      setError('Erreur lors de la creation de la note')
    }
  }

  const handleClose = () => {
    setSubject('')
    setBody('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D] sticky top-0 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
              Nouvelle note
            </h2>
          </div>
          <button
            onClick={handleClose}
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
            <label htmlFor="note-subject" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Sujet (optionnel)
            </label>
            <input
              id="note-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Point sur le projet"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* Body */}
          <div>
            <label htmlFor="note-body" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Contenu <span className="text-[#B42318]">*</span>
            </label>
            <textarea
              id="note-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ecrivez votre note ici..."
              rows={5}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annulér
            </button>
            <FillButton
              disabled={isLoading || !body.trim()}
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
                'Créer la note'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
