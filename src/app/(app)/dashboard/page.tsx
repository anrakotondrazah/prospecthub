import { createClient } from '@/lib/supabase/server'

export const instant = false

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's profile and stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id as number | null

  // Get lead counts (if org exists)
  let leadStats = { total: 0, new: 0, qualified: 0, hot: 0 }
  if (orgId) {
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)

    const { count: newLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'new')

    const { count: qualifiedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'qualified')

    const { count: hotLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'hot')

    leadStats = {
      total: totalLeads || 0,
      new: newLeads || 0,
      qualified: qualifiedLeads || 0,
      hot: hotLeads || 0,
    }
  }

  const firstName = profile?.first_name || user.email?.split('@')[0] || 'Utilisateur'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">
          Bonjour, {firstName}
        </h1>
        <p className="text-sm text-[#4E525A]">
          Voici un apercu de vos performances
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total leads', value: leadStats.total.toString(), change: '+12%', up: true },
          { label: 'Nouveaux leads', value: leadStats.new.toString(), change: '+8%', up: true },
          { label: 'Leads qualifies', value: leadStats.qualified.toString(), change: '+5%', up: true },
          { label: 'Leads chauds', value: leadStats.hot.toString(), change: '+15%', up: true },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E2E4E6] p-5">
            <p className="text-sm text-[#4E525A] mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-[31.5px] font-semibold text-[#0D0F14] leading-[38px] tracking-[-0.4px]">
                {kpi.value}
              </span>
              <span className={`text-sm font-medium ${kpi.up ? 'text-[#147A3A]' : 'text-[#B42318]'}`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <a
          href="/leads"
          className="bg-white rounded-[14px] border border-[#E2E4E6] p-5 hover:border-[#17191F] transition-colors group"
        >
          <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center mb-3 group-hover:bg-[#17191F] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] group-hover:text-white transition-colors">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="font-semibold text-[#0D0F14] mb-1">Gerer les leads</h3>
          <p className="text-sm text-[#4E525A]">Voir et gerer tous vos prospects</p>
        </a>

        <a
          href="/companies"
          className="bg-white rounded-[14px] border border-[#E2E4E6] p-5 hover:border-[#17191F] transition-colors group"
        >
          <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center mb-3 group-hover:bg-[#17191F] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] group-hover:text-white transition-colors">
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="font-semibold text-[#0D0F14] mb-1">Entreprises</h3>
          <p className="text-sm text-[#4E525A]">Consulter votre base entreprises</p>
        </a>

        <a
          href="/tasks"
          className="bg-white rounded-[14px] border border-[#E2E4E6] p-5 hover:border-[#17191F] transition-colors group"
        >
          <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center mb-3 group-hover:bg-[#17191F] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] group-hover:text-white transition-colors">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-semibold text-[#0D0F14] mb-1">Taches</h3>
          <p className="text-sm text-[#4E525A]">Voir vos taches a faire</p>
        </a>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
        <h2 className="text-lg font-semibold text-[#0D0F14] mb-4">Activite recente</h2>
        {leadStats.total === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#F5F7F9] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-[#4E525A] mb-2">Aucune activite recente</p>
            <p className="text-sm text-[#9BA0A6]">
              Les activites apparaitront ici une fois que vous commencerez a utiliser ProspectHub.
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#4E525A]">
            Vous avez {leadStats.total} lead{leadStats.total > 1 ? 's' : ''} dans votre base.
          </p>
        )}
      </div>
    </div>
  )
}
