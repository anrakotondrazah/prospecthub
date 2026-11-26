'use client'

import { GlobalSearch } from '@/components/search/GlobalSearch'
import { NotificationBell } from '@/components/notifications/NotificationBell'

interface AppShellProps {
  children: React.ReactNode
  userId: string
  organizationId: number | null
}

export function AppShell({ children, userId, organizationId }: AppShellProps) {
  return (
    <>
      <GlobalSearch organizationId={organizationId} />
      {organizationId && (
        <div className="fixed top-4 right-4 z-30 lg:right-6">
          <NotificationBell userId={userId} organizationId={organizationId} />
        </div>
      )}
      {children}
    </>
  )
}
