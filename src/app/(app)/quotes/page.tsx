import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuotesPageClient } from './QuotesPageClient'

export const instant = false

export default async function QuotesPage() {
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

  // Fetch quotes
  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      id,
      uuid,
      quote_number,
      name,
      status,
      recipient_name,
      recipient_company,
      quote_date,
      valid_until,
      total,
      currency,
      created_at,
      company:companies(id, name),
      deal:deals(id, name)
    `)
    .eq('organization_id', profile.organization_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Fetch companies for create modal
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('organization_id', profile.organization_id)
    .is('deleted_at', null)
    .order('name')

  // Fetch deals for create modal
  const { data: deals } = await supabase
    .from('deals')
    .select('id, name')
    .eq('organization_id', profile.organization_id)
    .is('deleted_at', null)
    .order('name')

  // Transform quotes to handle Supabase array relations
  const transformedQuotes = (quotes || []).map(quote => ({
    ...quote,
    company: Array.isArray(quote.company) ? quote.company[0] || null : quote.company,
    deal: Array.isArray(quote.deal) ? quote.deal[0] || null : quote.deal,
  }))

  return (
    <QuotesPageClient
      initialQuotes={transformedQuotes}
      companies={companies || []}
      deals={deals || []}
      organizationId={profile.organization_id}
      userId={user.id}
    />
  )
}
