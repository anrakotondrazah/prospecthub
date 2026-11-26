'use client'

import { ReactNode } from 'react'

interface OnboardingStepProps {
  step: 1 | 2 | 3 | 4
  title: string
  description: string
  children: ReactNode
}

export function OnboardingStep({ title, description, children }: OnboardingStepProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* En-tête de l'étape */}
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-bold text-[#0D0F14] mb-3">
          {title}
        </h1>
        <p className="text-lg text-[#4E525A] max-w-xl mx-auto">
          {description}
        </p>
      </div>

      {/* Contenu de l'étape */}
      <div className="mt-8">
        {children}
      </div>
    </div>
  )
}
