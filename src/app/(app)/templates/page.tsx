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

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('template_categories')
    .select('id, name, color')
    .eq('organization_id', profile.organization_id)
    .order('display_order', { ascending: true })

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
  }

  return (
    <TemplatesPageClient
      initialTemplates={templates || []}
      initialCategories={categories || []}
      organizationId={profile.organization_id}
      userId={user.id}
    />
  )
}
