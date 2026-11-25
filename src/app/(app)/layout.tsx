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

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

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
      <main className="ml-[260px] p-6">
        {children}
      </main>
    </div>
  )
}
