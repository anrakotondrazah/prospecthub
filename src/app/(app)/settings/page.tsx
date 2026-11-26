import { createClient } from '@/lib/supabase/server'
import { ThemeSettings } from './ThemeSettings'

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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">Erreur de chargement</h2>
          <p className="text-[#4E525A] mb-4">Impossible de charger votre profil.</p>
          <a href="/settings" className="text-[#17191F] font-medium hover:underline">Reessayer</a>
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
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">Parametres</h1>
        <p className="text-sm text-[#4E525A]">
          Gerez votre compte et vos preferences
        </p>
      </div>

      {/* Responsive: stack on mobile, grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile - full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Profil</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 lg:w-16 h-14 lg:h-16 rounded-full bg-[#17191F] dark:bg-[#58A6FF] flex items-center justify-center text-white text-lg lg:text-xl font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">{fullName}</p>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] truncate">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Prenom</label>
                <input
                  id="firstName"
                  type="text"
                  defaultValue={profile?.first_name || ''}
                  className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-[#F5F7F9] dark:bg-[#0D1117] text-[#9BA0A6] dark:text-[#8B949E] cursor-not-allowed"
                  disabled
                  aria-describedby="firstName-hint"
                />
                <p id="firstName-hint" className="sr-only">Modification non disponible</p>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Nom</label>
                <input
                  id="lastName"
                  type="text"
                  defaultValue={profile?.last_name || ''}
                  className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-[#F5F7F9] dark:bg-[#0D1117] text-[#9BA0A6] dark:text-[#8B949E] cursor-not-allowed"
                  disabled
                  aria-describedby="lastName-hint"
                />
                <p id="lastName-hint" className="sr-only">Modification non disponible</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Organisation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Nom</label>
                <input
                  id="orgName"
                  type="text"
                  defaultValue={organization?.name || ''}
                  className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-[#F5F7F9] dark:bg-[#0D1117] text-[#9BA0A6] dark:text-[#8B949E] cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label htmlFor="orgIndustry" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Secteur</label>
                <input
                  id="orgIndustry"
                  type="text"
                  defaultValue={organization?.industry || ''}
                  className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-[#F5F7F9] dark:bg-[#0D1117] text-[#9BA0A6] dark:text-[#8B949E] cursor-not-allowed"
                  disabled
                />
              </div>
            </div>
          </div>

          <ThemeSettings />
        </div>

        {/* Sidebar - reorder on mobile */}
        <div className="space-y-6 order-first lg:order-last">
          {/* Quick Links */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Configuration</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/settings/properties"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
                  </svg>
                  <span>Proprietes personnalisees</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Plan actuel</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-[#0D0F14] dark:text-[#E6EDF3]">Free</span>
              <span className="px-2 py-1 text-xs font-semibold uppercase rounded bg-[#F5F7F9] dark:bg-[#0D1117] text-[#4E525A] dark:text-[#8B949E]">
                Actuel
              </span>
            </div>
            <ul className="space-y-2 text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                50 leads/mois
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                1 utilisateur
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Export CSV
              </li>
            </ul>
            <button
              className="w-full h-10 text-sm font-medium text-white/60 bg-[#17191F]/60 rounded-[10px] cursor-not-allowed"
              disabled
              title="Bientot disponible"
            >
              Passer a Pro
            </button>
          </div>

          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Danger Zone</h2>
            <button
              className="w-full h-10 text-sm font-medium text-[#B42318]/60 border border-[#B42318]/60 rounded-[10px] cursor-not-allowed"
              disabled
              title="Bientot disponible"
            >
              Supprimer le compte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
