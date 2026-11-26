import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { QuoteDetailClient } from './QuoteDetailClient'

export const instant = false

type Props = {
  params: Promise<{ uuid: string }>
}

export default async function QuoteDetailPage({ params }: Props) {
  const { uuid } = await params
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

  // Fetch quote with lines
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_lines (*)
    `)
    .eq('uuid', uuid)
    .eq('organization_id', profile.organization_id)
    .single()

  if (quoteError || !quote) {
    notFound()
  }

  // Fetch products for adding lines
  const { data: products } = await supabase
    .from('products')
    .select('id, uuid, sku, name, description, unit_price, currency, unit, tax_rate, category, is_recurring, is_active')
    .eq('organization_id', profile.organization_id)
    .eq('is_active', true)
    .order('name')

  // Fetch companies for edit
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('organization_id', profile.organization_id)
    .is('deleted_at', null)
    .order('name')

  // Fetch deals for edit
  const { data: deals } = await supabase
    .from('deals')
    .select('id, name')
    .eq('organization_id', profile.organization_id)
    .is('deleted_at', null)
    .order('name')

  return (
    <QuoteDetailClient
      quote={quote}
      products={products || []}
      companies={companies || []}
      deals={deals || []}
      organizationId={profile.organization_id}
      userId={user.id}
    />
  )
}
