import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductsPageClient } from './ProductsPageClient'

export const instant = false

export default async function ProductsPage() {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get profile with organization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.organization_id) {
    redirect('/onboarding')
  }

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  return (
    <ProductsPageClient
      initialProducts={products || []}
      organizationId={profile.organization_id}
      userId={user.id}
    />
  )
}
