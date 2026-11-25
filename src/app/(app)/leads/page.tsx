import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from './LeadsTable'

export const instant = false

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id as number | null
  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">
            Organisation non configuree
          </h2>
          <p className="text-[#4E525A]">
            Completez votre onboarding pour acceder aux leads.
          </p>
        </div>
      </div>
    )
  }

  // Get leads
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      *,
      companies(name, domain),
      profiles!leads_assigned_to_fkey(full_name)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">Leads</h1>
          <p className="text-sm text-[#4E525A]">
            Gerez et suivez vos prospects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4E525A] bg-white border border-[#E2E4E6] rounded-[10px] hover:bg-[#F5F7F9] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Importer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#17191F] rounded-[10px] hover:bg-[#2D3039] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau lead
          </button>
        </div>
      </div>

      <LeadsTable leads={leads || []} />
    </div>
  )
}
