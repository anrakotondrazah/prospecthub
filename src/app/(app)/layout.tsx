import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

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

  // Check if onboarding is completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, organization_id, onboarding_completed')
    .eq('id', user.id)
    .single()

  // Redirect to onboarding if not completed
  if (!profile?.organization_id || !profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <Sidebar
        user={{
          email: user.email,
          full_name: fullName || user.user_metadata?.full_name,
        }}
        plan="Free"
      />
      {/* Responsive: hidden sidebar on mobile, 260px offset on desktop */}
      <main className="lg:ml-[260px] p-4 lg:p-6">
        {children}
      </main>
    </div>
  )
}
