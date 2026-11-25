import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Sidebar placeholder */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#E2E4E6]">
        <div className="p-5 border-b border-[#EFF1F3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#17191F] rounded-[10px] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff"/>
                <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2"/>
                <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-[#0D0F14]">ProspectHub</span>
            <span className="ml-auto text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#E2F4E6] text-[#147A3A]">
              Pro
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[260px] p-6">
        <div className="mb-8">
          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">
            Bonjour, {user.email?.split('@')[0]}
          </h1>
          <p className="text-sm text-[#4E525A]">
            Voici un apercu de vos performances
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Nouveaux leads', value: '124', change: '+12%', up: true },
            { label: 'Leads qualifies', value: '47', change: '+8%', up: true },
            { label: 'Deals en cours', value: '23', change: '-3%', up: false },
            { label: 'Revenu pipeline', value: '847K', change: '+15%', up: true },
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

        {/* Recent Activity */}
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
          <h2 className="text-lg font-semibold text-[#0D0F14] mb-4">Activite recente</h2>
          <p className="text-sm text-[#4E525A]">
            Les activites apparaitront ici une fois que vous commencerez a utiliser ProspectHub.
          </p>
        </div>
      </main>
    </div>
  )
}
