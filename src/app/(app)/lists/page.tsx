import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ListsPageClient } from './ListsPageClient'

export const instant = false

export default async function ListsPage() {
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
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Erreur de chargement
          </h2>
          <p className="text-muted-foreground mb-4">
            Impossible de charger votre profil.
          </p>
          <Link href="/lists" className="text-foreground font-medium hover:underline">
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
            Complétez votre onboarding pour accéder aux listes.
          </p>
        </div>
      </div>
    )
  }

  // Get lists with member count
  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select('id, uuid, name, description, type, member_count, created_at, updated_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  // Handle lists query error
  if (listsError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[23.5px] font-semibold text-foreground mb-1">Listes</h1>
            <p className="text-sm text-muted-foreground">Organisez vos leads en listes</p>
          </div>
        </div>
        <div className="bg-card rounded-[14px] border border-border p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-foreground mb-2">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mb-4">Impossible de charger les listes.</p>
            <Link href="/lists" className="text-foreground font-medium hover:underline">
              Réessayer
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <ListsPageClient initialLists={lists || []} organizationId={orgId} userId={user.id} />
}
