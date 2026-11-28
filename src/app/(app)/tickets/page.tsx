import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TicketsPageClient } from './TicketsPageClient'

export const instant = false

export default async function TicketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
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
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Erreur de chargement</h2>
          <p className="text-[#4E525A] dark:text-[#8B949E] mb-4">Impossible de charger votre profil.</p>
          <Link href="/tickets" className="text-[#17191F] dark:text-[#E6EDF3] font-medium hover:underline">Réessayer</Link>
        </div>
      </div>
    )
  }

  const orgId = profile?.organization_id as number | null
  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Organisation non configurée</h2>
          <p className="text-[#4E525A] dark:text-[#8B949E]">Complétez votre onboarding pour accéder aux tickets.</p>
        </div>
      </div>
    )
  }

  // Get tickets with related data
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select(`
      id,
      uuid,
      subject,
      description,
      status,
      priority,
      category,
      source,
      created_at,
      lead_id,
      company_id,
      assigned_to
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(500)

  // Fetch related data separately to avoid FK issues
  let leadsMap: Record<number, { id: number; first_name: string; last_name: string }> = {}
  let companiesMap: Record<number, { id: number; name: string }> = {}
  let profilesMap: Record<string, { id: string; full_name: string }> = {}

  if (tickets && tickets.length > 0) {
    const leadIds = Array.from(new Set(tickets.map((t: any) => t.lead_id).filter(Boolean))) as number[]
    const companyIds = Array.from(new Set(tickets.map((t: any) => t.company_id).filter(Boolean))) as number[]
    const assignedIds = Array.from(new Set(tickets.map((t: any) => t.assigned_to).filter(Boolean))) as string[]

    if (leadIds.length > 0) {
      const { data: leads } = await supabase
        .from('leads')
        .select('id, first_name, last_name')
        .in('id', leadIds)
      if (leads) {
        leadsMap = Object.fromEntries(leads.map(l => [l.id, l]))
      }
    }

    if (companyIds.length > 0) {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds)
      if (companies) {
        companiesMap = Object.fromEntries(companies.map(c => [c.id, c]))
      }
    }

    if (assignedIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', assignedIds)
      if (profiles) {
        profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]))
      }
    }
  }

  if (ticketsError) {
    return (
      <TicketsPageClient
        initialTickets={[]}
        organizationId={orgId}
        userId={user.id}
        error="Impossible de charger les tickets."
      />
    )
  }

  // Transform the data for the client component
  const transformedTickets = (tickets || []).map((ticket: any) => ({
    id: ticket.id,
    uuid: ticket.uuid,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    source: ticket.source,
    created_at: ticket.created_at,
    lead: ticket.lead_id ? leadsMap[ticket.lead_id] || null : null,
    company: ticket.company_id ? companiesMap[ticket.company_id] || null : null,
    assigned_to_profile: ticket.assigned_to ? profilesMap[ticket.assigned_to] || null : null,
  }))

  return (
    <TicketsPageClient
      initialTickets={transformedTickets}
      organizationId={orgId}
      userId={user.id}
    />
  )
}
