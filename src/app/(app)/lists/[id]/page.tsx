import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ListDetailClient } from './ListDetailClient'

export const instant = false

type PageProps = {
  params: Promise<{ id: string }>
}

type Lead = {
  id: number
  uuid: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  company_name: string | null
  job_title: string | null
  status: string
  score: number
  is_hot: boolean
}

type SupabaseMember = {
  id: number
  lead_id: number
  added_at: string
  leads: Lead[]
}

type Member = {
  id: number
  lead_id: number
  added_at: string
  leads: Lead
}

export default async function ListDetailPage({ params }: PageProps) {
  const { id } = await params
  const listId = parseInt(id, 10)

  if (isNaN(listId)) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.organization_id) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">
            Erreur de chargement
          </h2>
          <p className="text-[#4E525A]">Impossible de charger votre profil.</p>
        </div>
      </div>
    )
  }

  const orgId = profile.organization_id as number

  // Get list details
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id, uuid, name, description, type, member_count, created_at, updated_at')
    .eq('id', listId)
    .eq('organization_id', orgId)
    .single()

  if (listError || !list) {
    notFound()
  }

  // Get list members with lead details
  const { data: supabaseMembers, error: membersError } = await supabase
    .from('list_members')
    .select(`
      id,
      lead_id,
      added_at,
      leads (
        id,
        uuid,
        first_name,
        last_name,
        email,
        phone,
        company_name,
        job_title,
        status,
        score,
        is_hot
      )
    `)
    .eq('list_id', listId)
    .order('added_at', { ascending: false })

  if (membersError) {
    console.error('Error loading members:', membersError)
  }

  const members: Member[] = (supabaseMembers as SupabaseMember[] || []).map(member => ({
    ...member,
    leads: member.leads?.[0]
  })).filter(m => m.leads)

  // Get all leads for adding to list
  const { data: allLeads, error: leadsError } = await supabase
    .from('leads')
    .select('id, uuid, first_name, last_name, email, company_name, status')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (leadsError) {
    console.error('Error loading leads:', leadsError)
  }

  return (
    <ListDetailClient
      list={list}
      initialMembers={members}
      availableLeads={allLeads || []}
      organizationId={orgId}
      userId={user.id}
    />
  )
}
