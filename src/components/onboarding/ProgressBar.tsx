'use client'

interface ProgressBarProps {
  currentStep: 1 | 2 | 3 | 4
  totalSteps?: number
}

export function ProgressBar({ currentStep, totalSteps = 4 }: ProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-3 px-6 py-8">
      {steps.map((step, index) => {
        const isCompleted = step < currentStep
        const isActive = step === currentStep
        const isFuture = step > currentStep

        return (
          <div key={step} className="flex items-center">
            {/* Cercle de progression */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted ? 'bg-[#147A3A] text-white' : ''}
                ${isActive ? 'bg-[#17191F] text-white ring-4 ring-[#17191F]/10' : ''}
                ${isFuture ? 'bg-white border-2 border-[#E2E4E6] text-[#9BA0A6]' : ''}
              `}
            >
              {isCompleted ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">{step}</span>
              )}
            </div>

            {/* Ligne de connexion */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-16 h-1 mx-1 transition-all duration-300
                  ${step < currentStep ? 'bg-[#147A3A]' : 'bg-[#E2E4E6]'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
