'use client'

import { useState } from 'react'
import { FillButton } from '@/components/ui/buttons'
import { useActivities } from '@/hooks/useActivities'

interface LogCallModalProps {
  isOpen: boolean
  onClose: () => void
  onCallLogged?: () => void
  associatedLeadId?: number
  associatedCompanyId?: number
  associatedDealId?: number
}

const CALL_OUTCOMES = [
  { value: 'connected', label: 'Connecte', icon: 'M5 13l4 4L19 7', color: '#147A3A' },
  { value: 'no_answer', label: 'Pas de réponse', icon: 'M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728', color: '#B42318' },
  { value: 'left_voicemail', label: 'Message vocal', icon: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM7 10h10M7 14h6', color: '#E65100' },
  { value: 'busy', label: 'Occupe', icon: 'M12 8v4M12 16h.01', color: '#F59E0B' },
  { value: 'callback_scheduled', label: 'Rappel planifie', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#3949AB' },
]

export function LogCallModal({
  isOpen,
  onClose,
  onCallLogged,
  associatedLeadId,
  associatedCompanyId,
  associatedDealId,
}: LogCallModalProps) {
  const [subject, setSubject] = useState('')
  const [outcome, setOutcome] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { logCall, isLoading } = useActivities()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!outcome) {
      setError('Sélectionnez un résultat d\'appel')
      return
    }

    setError(null)

    const result = await logCall({
      subject: subject.trim() || 'Appel',
      outcome,
      duration_minutes: duration ? parseInt(duration, 10) : undefined,
      body: notes.trim() || undefined,
      associated_lead_id: associatedLeadId,
      associated_company_id: associatedCompanyId,
      associated_deal_id: associatedDealId,
    })

    if (result) {
      // Reset form
      setSubject('')
      setOutcome('')
      setDuration('')
      setNotes('')
      onCallLogged?.()
      onClose()
    } else {
      setError('Erreur lors de l\'enregistrement de l\'appel')
    }
  }

  const handleClose = () => {
    setSubject('')
    setOutcome('')
    setDuration('')
    setNotes('')
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
            <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
              Enregistrer un appel
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
            <label htmlFor="call-subject" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Sujet (optionnel)
            </label>
            <input
              id="call-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Appel de qualification"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* Outcome Selection */}
          <div>
            <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
              Résultat de l'appel <span className="text-[#B42318]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CALL_OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOutcome(o.value)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    outcome === o.value
                      ? 'bg-[#0066FF]/10 border-2 border-[#0066FF] text-[#0066FF]'
                      : 'bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={outcome === o.value ? '#0066FF' : o.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={o.icon} />
                  </svg>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="call-duration" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Duree (minutes)
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d.toString())}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    duration === d.toString()
                      ? 'bg-[#0066FF]/10 border-2 border-[#0066FF] text-[#0066FF]'
                      : 'bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  {d}m
                </button>
              ))}
              <input
                id="call-duration"
                type="number"
                min="1"
                max="480"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Autre"
                className="flex-1 px-4 py-2 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="call-notes" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Notes (optionnel)
            </label>
            <textarea
              id="call-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Résuméz la conversation..."
              rows={3}
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
              disabled={isLoading || !outcome}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Enregistrement...
                </span>
              ) : (
                'Enregistrer l\'appel'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
