'use client'

import { useState, useCallback } from 'react'
import { FillButton } from '@/components/ui/buttons'

interface AddStepModalProps {
  isOpen: boolean
  onClose: () => void
  sequenceId: number
  onStepAdded: () => void
}

type StepType = 'email' | 'task' | 'delay'

const STEP_TYPE_OPTIONS = [
  {
    value: 'email' as StepType,
    label: 'Email',
    description: 'Envoyer un email automatique',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    value: 'task' as StepType,
    label: 'Tâche',
    description: 'Créer une tâche manuelle',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    value: 'delay' as StepType,
    label: 'Délai',
    description: 'Attendre avant la prochaine étape',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

export function AddStepModal({
  isOpen,
  onClose,
  sequenceId,
  onStepAdded,
}: AddStepModalProps) {
  const [stepType, setStepType] = useState<StepType>('email')
  const [delayDays, setDelayDays] = useState(1)
  const [delayHours, setDelayHours] = useState(0)

  // Email fields
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // Task fields
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (stepType === 'email' && !subject.trim()) {
      setError('L\'objet de l\'email est requis')
      return
    }
    if (stepType === 'task' && !taskTitle.trim()) {
      setError('Le titre de la tâche est requis')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Use API endpoint for proper validation and step_order calculation
      const stepData: Record<string, unknown> = {
        step_type: stepType,
        delay_days: delayDays,
        delay_hours: delayHours,
      }

      if (stepType === 'email') {
        stepData.subject = subject.trim()
        stepData.body = body.trim() || null
      } else if (stepType === 'task') {
        stepData.task_title = taskTitle.trim()
        stepData.task_description = taskDescription.trim() || null
      }

      const response = await fetch(`/api/sequences/${sequenceId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de l\'ajout')
      }

      onStepAdded()
      handleClose()
    } catch (err) {
      console.error('Error adding step:', err)
      setError('Erreur lors de l\'ajout de l\'étape')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    sequenceId,
    stepType,
    delayDays,
    delayHours,
    subject,
    body,
    taskTitle,
    taskDescription,
    onStepAdded,
  ])

  const handleClose = useCallback(() => {
    setStepType('email')
    setDelayDays(1)
    setDelayHours(0)
    setSubject('')
    setBody('')
    setTaskTitle('')
    setTaskDescription('')
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
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                  Ajouter une étape
                </h2>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
                  Configurez le type et les parametres
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

            {/* Step Type */}
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
                Type d&apos;étape *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STEP_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      stepType === option.value
                        ? 'border-[#0066FF] bg-[#0066FF]/5'
                        : 'border-black/[0.08] dark:border-[#30363D] hover:border-black/[0.16] dark:hover:border-[#484F58]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="step_type"
                      value={option.value}
                      checked={stepType === option.value}
                      onChange={(e) => setStepType(e.target.value as StepType)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      stepType === option.value
                        ? 'bg-[#0066FF]/10 text-[#0066FF]'
                        : 'bg-[#F5F7F9] dark:bg-[#21262D] text-[#9BA0A6]'
                    }`}>
                      {option.icon}
                    </div>
                    <p className={`text-xs font-medium text-center ${
                      stepType === option.value
                        ? 'text-[#0066FF]'
                        : 'text-[#0D0F14] dark:text-[#E6EDF3]'
                    }`}>
                      {option.label}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Delay */}
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Délai avant cette étape
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Jours</label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={delayDays}
                    onChange={(e) => setDelayDays(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Heures</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={delayHours}
                    onChange={(e) => setDelayHours(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email fields */}
            {stepType === 'email' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                    Objet de l&apos;email *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Suivi de notre dernière conversation"
                    className="w-full px-4 py-3 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] placeholder-[#9BA0A6] dark:placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                    Corps de l&apos;email
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Rédigez le contenu de votre email..."
                    rows={5}
                    className="w-full px-4 py-3 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] placeholder-[#9BA0A6] dark:placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all resize-none"
                  />
                </div>
              </>
            )}

            {/* Task fields */}
            {stepType === 'task' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Ex: Appeler le prospect"
                    className="w-full px-4 py-3 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] placeholder-[#9BA0A6] dark:placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Détails de la tâche..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#F5F7F9] dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-[#0D0F14] dark:text-[#E6EDF3] placeholder-[#9BA0A6] dark:placeholder-[#8B949E] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all resize-none"
                  />
                </div>
              </>
            )}

            {/* Delay type info */}
            {stepType === 'delay' && (
              <div className="p-4 bg-[#E8F5E9] dark:bg-[#16A34A]/10 border border-[#A5D6A7] dark:border-[#16A34A]/30 rounded-xl">
                <p className="text-sm text-[#147A3A] dark:text-[#16A34A]">
                  Cette étape créera un délai d&apos;attente de {delayDays} jour(s) et {delayHours} heure(s) avant de passer à l&apos;étape suivante.
                </p>
              </div>
            )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ajout...
                </span>
              ) : (
                'Ajouter l\'étape'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
