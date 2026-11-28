import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppShell } from '@/components/layout/AppShell'

export const instant = false

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if onboarding is completed and get organization
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      first_name,
      last_name,
      organization_id,
      onboarding_completed,
      organization:organizations(name)
    `)
    .eq('id', user.id)
    .single()

  // Redirect to onboarding if not completed
  if (!profile?.organization_id || !profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null
  const orgData = profile.organization as { name: string } | { name: string }[] | null
  const organizationName = Array.isArray(orgData) ? orgData[0]?.name : orgData?.name

  return (
    <div className="min-h-screen bg-muted">
      <Sidebar
        user={{
          id: user.id,
          email: user.email,
          full_name: fullName || user.user_metadata?.full_name,
        }}
        organizationId={profile.organization_id}
        organizationName={organizationName || undefined}
        plan="Free"
      />
      <main className="lg:ml-[260px] p-4 lg:p-6">
        <AppShell userId={user.id} organizationId={profile.organization_id}>
          {children}
        </AppShell>
      </main>
    </div>
  )
}
