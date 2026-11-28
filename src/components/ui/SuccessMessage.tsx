'use client'

import { useEffect, useState } from 'react'

export type SuccèssMessageType =
  | 'lead_revealed'
  | 'first_email'
  | 'deal_won'
  | 'list_created'
  | 'import_completed'

interface SuccèssMessageProps {
  type: SuccèssMessageType
  message?: string
  details?: string
  duration?: number
  onClose?: () => void
}

const SUCCESS_CONFIG = {
  lead_revealed: {
    defaultMessage: "Lead révélé!",
    defaultDetails: "+1 contact dans votre pipeline",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#10B981]">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  first_email: {
    defaultMessage: "Premier email envoyé",
    defaultDetails: "La prospection commence!",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#10B981]">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 8l8 5 8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  deal_won: {
    defaultMessage: "Deal gagné!",
    defaultDetails: "Ajouté à votre CA",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#10B981]">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
        <path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16l-6.5 5 2-7.5L2 9h7l3-7z" fill="currentColor"/>
      </svg>
    )
  },
  list_created: {
    defaultMessage: "Liste créée",
    defaultDetails: "Prête à recevoir vos leads",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#10B981]">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  import_completed: {
    defaultMessage: "Import terminé",
    defaultDetails: "Vos leads sont prêts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#10B981]">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
        <path d="M12 15V3M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
}

export function SuccèssMessage({
  type,
  message,
  details,
  duration = 3000,
  onClose
}: SuccèssMessageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const config = SUCCESS_CONFIG[type]
  const finalMessage = message || config.defaultMessage
  const finalDetails = details || config.defaultDetails

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setIsVisible(true), 10)

    // Start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, duration - 300)

    // Complete removal
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(exitTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : '-translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#161B22] border border-[#E2E4E6] dark:border-[#30363D] shadow-lg backdrop-blur-sm">
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {finalMessage}
          </p>
          {finalDetails && (
            <p className="text-xs text-[#4E525A] dark:text-[#8B949E] mt-0.5">
              {finalDetails}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setIsExiting(true)
            setTimeout(() => onClose?.(), 300)
          }}
          className="flex-shrink-0 text-[#4E525A] dark:text-[#8B949E] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// Hook pour faciliter l'utilisation
export function useSuccèssMessage() {
  const [message, setMessage] = useState<SuccèssMessageProps | null>(null)

  const show = (props: Omit<SuccèssMessageProps, 'onClose'>) => {
    setMessage(props)
  }

  const hide = () => {
    setMessage(null)
  }

  return {
    show,
    hide,
    SuccèssMessageComponent: message ? (
      <SuccèssMessage {...message} onClose={hide} />
    ) : null
  }
}
