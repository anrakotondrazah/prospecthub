import { Badge } from './Badge'

interface VerificationBadgeProps {
  type: 'verified' | 'source' | 'bloctel'
  date?: Date | string
  source?: string
  className?: string
}

export function VerificationBadge({ type, date, source, className }: VerificationBadgeProps) {
  if (type === 'verified' && date) {
    const formattedDate = typeof date === 'string'
      ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

    return (
      <Badge variant="success" className={className}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Verifie le {formattedDate}
      </Badge>
    )
  }

  if (type === 'source') {
    const sourceLabel = source || 'Registre public'
    return (
      <Badge variant="neutral" className={className}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Source: {sourceLabel}
      </Badge>
    )
  }

  if (type === 'bloctel') {
    return (
      <Badge variant="info" className={className}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0-6 0" />
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
        </svg>
        Bloctel verifie
      </Badge>
    )
  }

  return null
}
