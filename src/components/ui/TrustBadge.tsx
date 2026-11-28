interface TrustBadgeProps {
  type: 'hosting' | 'rgpd' | 'encryption' | 'unsubscribe'
  variant?: 'light' | 'dark'
  className?: string
}

export function TrustBadge({ type, variant = 'light', className = '' }: TrustBadgeProps) {
  const isLight = variant === 'light'
  const textColor = isLight ? 'text-[#4E525A]' : 'text-white/80'
  const iconColor = isLight ? '#4E525A' : '#FFFFFF'

  const badges = {
    hosting: {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      text: 'Hébergement France',
    },
    rgpd: {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      text: 'RGPD Intégré',
    },
    encryption: {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      text: 'Données chiffrées',
    },
    unsubscribe: {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      text: 'Désinscription intégrée',
    },
  }

  const badge = badges[type]

  return (
    <div className={`inline-flex items-center gap-2 ${textColor} ${className}`}>
      {badge.icon}
      <span className="text-sm font-medium">{badge.text}</span>
    </div>
  )
}
