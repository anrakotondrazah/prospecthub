import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LeadsPageClient } from './LeadsPageClient'

export const instant = false

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  // Handle profile lookup error
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
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">
            Erreur de chargement
          </h2>
          <p className="text-[#4E525A] mb-4">
            Impossible de charger votre profil.
          </p>
          <Link href="/leads" className="text-[#17191F] font-medium hover:underline">
            Reessayer
          </Link>
        </div>
      </div>
    )
  }

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

  // Get leads with valid columns only (no invalid foreign key relations)
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id, uuid, first_name, last_name, email, phone, status, score, is_hot, source, company_name, created_at, owner_id')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50)

  // Handle leads query error
  if (leadsError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">Leads</h1>
            <p className="text-sm text-[#4E525A]">Gerez et suivez vos prospects</p>
          </div>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-[#0D0F14] mb-2">Erreur de chargement</p>
            <p className="text-sm text-[#4E525A] mb-4">Impossible de charger les leads.</p>
            <Link href="/leads" className="text-[#17191F] font-medium hover:underline">
              Reessayer
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <LeadsPageClient initialLeads={leads || []} organizationId={orgId} />
}
