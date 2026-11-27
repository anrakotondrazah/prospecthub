'use client'

import { useRouter } from 'next/navigation'
import { FillButton } from '@/components/ui/buttons'

export function FindLeadsButton() {
  const router = useRouter()

  return (
    <FillButton variant="success" onClick={() => router.push('/base-entreprises')}>
      <span className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Trouver leads
      </span>
    </FillButton>
  )
}
