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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 dark:text-red-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Erreur de chargement
          </h2>
          <p className="text-muted-foreground mb-4">
            Impossible de charger votre profil.
          </p>
          <Link href="/leads" className="text-foreground font-medium hover:underline">
            Réessayer
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
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Organisation non configurée
          </h2>
          <p className="text-muted-foreground">
            Complétez votre onboarding pour accéder aux leads.
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
            <h1 className="text-[23.5px] font-semibold text-foreground mb-1">Leads</h1>
            <p className="text-sm text-muted-foreground">Gérez et suivez vos prospects</p>
          </div>
        </div>
        <div className="bg-card rounded-[14px] border border-border p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 dark:text-red-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-foreground mb-2">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mb-4">Impossible de charger les leads.</p>
            <Link href="/leads" className="text-foreground font-medium hover:underline">
              Réessayer
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <LeadsPageClient initialLeads={leads || []} organizationId={orgId} />
}
