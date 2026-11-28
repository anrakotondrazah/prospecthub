import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TemplatesPageClient } from './TemplatesPageClient'

export default async function TemplatesPage() {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get profile with organization_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.organization_id) {
    redirect('/onboarding')
  }

  // Fetch templates
  const { data: templates, error: templatesError } = await supabase
    .from('message_templates')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  if (templatesError) {
    console.error('Error fetching templates:', templatesError)
  }

  // Fetch catégories
  const { data: catégories, error: catégoriesError } = await supabase
    .from('template_catégories')
    .select('id, name, color')
    .eq('organization_id', profile.organization_id)
    .order('display_order', { ascending: true })

  if (catégoriesError) {
    console.error('Error fetching catégories:', catégoriesError)
  }

  return (
    <TemplatesPageClient
      initialTemplates={templates || []}
      initialCatégories={catégories || []}
      organizationId={profile.organization_id}
      userId={user.id}
    />
  )
}
