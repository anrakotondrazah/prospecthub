import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CompaniesPageClient } from './CompaniesPageClient'

export const instant = false

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">Impossible de charger votre profil.</p>
          <Link href="/companies" className="text-foreground font-medium hover:underline">Réessayer</Link>
        </div>
      </div>
    )
  }

  const orgId = profile?.organization_id as number | null
  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Organisation non configurée</h2>
          <p className="text-muted-foreground">Complétez votre onboarding pour accéder aux entreprises.</p>
        </div>
      </div>
    )
  }

  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, uuid, name, website, industry, employees_count, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (companiesError) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">Entreprises</h1>
            <p className="text-sm text-muted-foreground">Base de données de vos entreprises</p>
          </div>
        </div>
        <div className="bg-card rounded-[14px] border border-border p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-foreground mb-2">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mb-4">Impossible de charger les entreprises.</p>
            <Link href="/companies" className="text-foreground font-medium hover:underline">Réessayer</Link>
          </div>
        </div>
      </div>
    )
  }

  return <CompaniesPageClient initialCompanies={companies || []} organizationId={orgId} />
}
