import { createClient } from '@/lib/supabase/server'

export const instant = false

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get organization separately
  const orgId = profile?.organization_id as number | null
  const { data: organization } = orgId
    ? await supabase.from('organizations').select('*').eq('id', orgId).single()
    : { data: null }

  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Non defini'
    : 'Non defini'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">Parametres</h1>
        <p className="text-sm text-[#4E525A]">
          Gerez votre compte et vos preferences
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Profile */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F14] mb-4">Profil</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#17191F] flex items-center justify-center text-white text-xl font-semibold">
                {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#0D0F14]">{fullName}</p>
                <p className="text-sm text-[#4E525A]">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] mb-2">Prenom</label>
                <input
                  type="text"
                  defaultValue={profile?.first_name || ''}
                  className="w-full h-10 px-3 border border-[#E2E4E6] rounded-[10px] text-sm"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] mb-2">Nom</label>
                <input
                  type="text"
                  defaultValue={profile?.last_name || ''}
                  className="w-full h-10 px-3 border border-[#E2E4E6] rounded-[10px] text-sm"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F14] mb-4">Organisation</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] mb-2">Nom</label>
                <input
                  type="text"
                  defaultValue={organization?.name || ''}
                  className="w-full h-10 px-3 border border-[#E2E4E6] rounded-[10px] text-sm"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] mb-2">Secteur</label>
                <input
                  type="text"
                  defaultValue={organization?.industry || ''}
                  className="w-full h-10 px-3 border border-[#E2E4E6] rounded-[10px] text-sm"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F14] mb-4">Plan actuel</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-[#0D0F14]">Free</span>
              <span className="px-2 py-1 text-xs font-semibold uppercase rounded bg-[#F5F7F9] text-[#4E525A]">
                Actuel
              </span>
            </div>
            <ul className="space-y-2 text-sm text-[#4E525A] mb-4">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                50 leads/mois
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                1 utilisateur
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Export CSV
              </li>
            </ul>
            <button className="w-full h-10 text-sm font-medium text-white bg-[#17191F] rounded-[10px] hover:bg-[#2D3039] transition-colors">
              Passer a Pro
            </button>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F14] mb-4">Danger Zone</h2>
            <button className="w-full h-10 text-sm font-medium text-[#B42318] border border-[#B42318] rounded-[10px] hover:bg-[#FDE8E5] transition-colors">
              Supprimer le compte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
