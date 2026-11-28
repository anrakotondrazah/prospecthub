'use client'

import Link from 'next/link'
import { FillButton } from '@/components/ui/buttons'

interface EmptyStateProps {
  type: 'pipeline' | 'inbox' | 'leads' | 'tasks' | 'lists'
  action?: () => void
  actionLabel?: string
  actionHref?: string
}

const EMPTY_STATE_CONFIG = {
  pipeline: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#8B949E] dark:text-[#6E7681]">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 9l-5 5-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Votre premier deal n'attend que vous",
    description: "Commencez par ajouter un lead dans votre pipeline pour suivre vos opportunités.",
    defaultAction: "Explorer le catalogue",
    defaultHref: "/leads"
  },
  inbox: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#8B949E] dark:text-[#6E7681]">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Aucune activité... pour l'instant",
    description: "Lancez votre première sequence pour commencer à interagir avec vos prospects.",
    defaultAction: "Créer une sequence",
    defaultHref: "/sequences"
  },
  leads: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#8B949E] dark:text-[#6E7681]">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Explorez le catalogue pour trouvér vos premiers leads",
    description: "Des milliers d'entreprises françaises vérifiées vous attendent.",
    defaultAction: "Voir le catalogue",
    defaultHref: "/base-entreprises"
  },
  tasks: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#8B949E] dark:text-[#6E7681]">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Rien à faire? C'est le moment de prospecter",
    description: "Toutes vos tâches sont terminées. Profitez-en pour explorer de nouveaux leads.",
    defaultAction: "Explorer",
    defaultHref: "/leads"
  },
  lists: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#8B949E] dark:text-[#6E7681]">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="2"/>
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Cette liste est vide",
    description: "Ajoutez des leads depuis le catalogue ou importez-les depuis un fichier CSV.",
    defaultAction: "Ajouter des leads",
    defaultHref: "/leads"
  }
}

export function EmptyState({ type, action, actionLabel, actionHref }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type]
  const finalActionLabel = actionLabel || config.defaultAction
  const finalActionHref = actionHref || config.defaultHref

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center mb-6">
          {config.icon}
        </div>
        <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
          {config.title}
        </h3>
        <p className="text-[#4E525A] dark:text-[#8B949E] mb-6">
          {config.description}
        </p>
        {action ? (
          <FillButton onClick={action}>
            <span className="flex items-center gap-2">
              {finalActionLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </FillButton>
        ) : (
          <Link
            href={finalActionHref}
            className="relative inline-flex items-center justify-center h-[42px] px-6 border-none rounded-[15px] z-[1] font-bold text-[17px] shadow-md transition-all duration-[250ms] ease-out overflow-hidden bg-muted text-foreground before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[15px] before:bg-foreground before:z-[-1] before:shadow-md before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full hover:text-background active:scale-95"
          >
            <span className="flex items-center gap-2">
              {finalActionLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
