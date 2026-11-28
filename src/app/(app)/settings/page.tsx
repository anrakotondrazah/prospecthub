import { createClient } from '@/lib/supabase/server'
import { ThemeSettings } from './ThemeSettings'
import { SettingsClient } from './SettingsClient'

export const instant = false

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, organization_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-red-900/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Erreur de chargement</h2>
          <p className="text-[#4E525A] dark:text-[#8B949E] mb-4">Impossible de charger votre profil.</p>
          <a href="/settings" className="text-[#17191F] dark:text-[#58A6FF] font-medium hover:underline">Réessayer</a>
        </div>
      </div>
    )
  }

  // Get organization separately
  const orgId = profile?.organization_id as number | null
  let organization = null
  if (orgId) {
    const { data, error } = await supabase
      .from('organizations')
      .select('name, industry')
      .eq('id', orgId)
      .single()
    if (!error) organization = data
  }

  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Non defini'
    : 'Non defini'

  const initials = (profile?.first_name?.[0] || user.email?.[0])?.toUpperCase() || '?'

  return (
    <SettingsClient
      fullName={fullName}
      email={user.email || ''}
      initials={initials}
      firstName={profile?.first_name || ''}
      lastName={profile?.last_name || ''}
      orgName={organization?.name || ''}
      orgIndustry={organization?.industry || ''}
    >
      <ThemeSettings />
    </SettingsClient>
  )
}
