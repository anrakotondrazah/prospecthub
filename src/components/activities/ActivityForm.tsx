'use client'

import { useState } from 'react'
import type { ActivityType } from '@/hooks/useActivities'

interface ActivityFormProps {
  activityType: ActivityType
  initialSubject?: string
  initialBody?: string
  initialOutcome?: string
  initialDuration?: number
  onSubmit: (data: {
    subject: string
    body: string
    outcome?: string
    duration_minutes?: number
  }) => void
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const CALL_OUTCOMES = [
  { value: 'connected', label: 'Connecte' },
  { value: 'no_answer', label: 'Pas de réponse' },
  { value: 'left_voicemail', label: 'Message vocal' },
  { value: 'busy', label: 'Occupe' },
  { value: 'wrong_number', label: 'Mauvais numéro' },
  { value: 'callback_scheduled', label: 'Rappel planifie' },
]

export function ActivityForm({
  activityType,
  initialSubject = '',
  initialBody = '',
  initialOutcome = '',
  initialDuration,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Enregistrer',
}: ActivityFormProps) {
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const [outcome, setOutcome] = useState(initialOutcome)
  const [duration, setDuration] = useState(initialDuration?.toString() || '')

  const isCallType = activityType === 'call'
  const isMeetingType = activityType === 'meeting'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data: {
      subject: string
      body: string
      outcome?: string
      duration_minutes?: number
    } = {
      subject: subject.trim(),
      body: body.trim(),
    }

    if (isCallType || isMeetingType) {
      if (outcome) data.outcome = outcome
      if (duration) data.duration_minutes = parseInt(duration, 10)
    }

    onSubmit(data)
  }

  const isValid = body.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject */}
      <div>
        <label htmlFor="activity-subject" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
          Sujet
        </label>
        <input
          id="activity-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={isCallType ? 'Appel de suivi' : 'Sujet de la note'}
          className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
          disabled={isLoading}
          maxLength={255}
        />
      </div>

      {/* Body / Notes */}
      <div>
        <label htmlFor="activity-body" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
          {isCallType ? 'Notes de l\'appel' : 'Contenu'} <span className="text-[#B42318]">*</span>
        </label>
        <textarea
          id="activity-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={isCallType ? 'Résumez la conversation...' : 'Ecrivez votre note...'}
          rows={4}
          className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D] resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Call-specific fields */}
      {isCallType && (
        <>
          {/* Outcome */}
          <div>
            <label htmlFor="activity-outcome" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Résultat de l'appel
            </label>
            <select
              id="activity-outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
            >
              <option value="">Sélectionnez un résultat</option>
              {CALL_OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="activity-duration" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Duree (minutes)
            </label>
            <input
              id="activity-duration"
              type="number"
              min="1"
              max="480"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="flex-1 px-4 py-2.5 bg-[#0066FF] text-white rounded-xl font-medium hover:bg-[#0052CC] shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              En cours...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}
