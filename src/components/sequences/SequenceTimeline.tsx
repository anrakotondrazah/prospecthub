'use client'

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

interface SequenceTimelineProps {
  steps: SequenceStep[]
}

const STEP_TYPE_CONFIG = {
  email: {
    label: 'Email',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    color: 'bg-[#0066FF]',
    lightColor: 'bg-[#0066FF]/10',
  },
  task: {
    label: 'Tâche',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    color: 'bg-[#E65100]',
    lightColor: 'bg-[#E65100]/10',
  },
  delay: {
    label: 'Délai',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: 'bg-[#9BA0A6]',
    lightColor: 'bg-[#9BA0A6]/10',
  },
}

export function SequenceTimeline({ steps }: SequenceTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F5F7F9] dark:bg-[#0D1117] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Aucune étape configurée</p>
        <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mt-1">
          Ajoutez une étape pour commencer
        </p>
      </div>
    )
  }

  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order)

  const formatDelay = (days: number, hours: number): string => {
    if (days === 0 && hours === 0) return 'Immédiatement'
    const parts: string[] = []
    if (days > 0) parts.push(`${days}j`)
    if (hours > 0) parts.push(`${hours}h`)
    return parts.join(' ')
  }

  return (
    <div className="space-y-1">
      {sortedSteps.map((step, index) => {
        const config = STEP_TYPE_CONFIG[step.step_type]
        const isLast = index === sortedSteps.length - 1

        return (
          <div key={step.id}>
            {/* Step item */}
            <div className="relative flex gap-4 pb-1">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-[#E2E4E6] dark:bg-[#30363D]" />
              )}

              {/* Icon */}
              <div className={`relative z-10 w-10 h-10 rounded-full ${config.lightColor} flex items-center justify-center flex-shrink-0`}>
                <div className="text-[#0D0F14] dark:text-[#E6EDF3]">
                  {config.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                {/* Delay indicator before step */}
                {(step.delay_days > 0 || step.delay_hours > 0) && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Attendre {formatDelay(step.delay_days, step.delay_hours)}, puis</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${config.lightColor} text-[#0D0F14] dark:text-[#E6EDF3]`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                        Étape {step.step_order}
                      </span>
                    </div>

                    {step.step_type === 'email' && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] line-clamp-1">
                          {step.subject || 'Sans objet'}
                        </p>
                        {step.body && (
                          <p className="text-xs text-[#4E525A] dark:text-[#8B949E] line-clamp-2 mt-1">
                            {step.body}
                          </p>
                        )}
                        {step.template_id && (
                          <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mt-1">
                            Utilise le template #{step.template_id}
                          </p>
                        )}
                      </div>
                    )}

                    {step.step_type === 'task' && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] line-clamp-1">
                          {step.task_title || 'Sans titre'}
                        </p>
                        {step.task_description && (
                          <p className="text-xs text-[#4E525A] dark:text-[#8B949E] line-clamp-2 mt-1">
                            {step.task_description}
                          </p>
                        )}
                      </div>
                    )}

                    {step.step_type === 'delay' && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
                          Attendre {formatDelay(step.delay_days, step.delay_hours)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
