import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type RouteParams = {
  params: Promise<{ id: string }>
}

type BulkAction = 'remove' | 'copy_to_list' | 'move_to_list' | 'export'

interface BulkRequestBody {
  action: BulkAction
  member_ids?: number[]
  lead_ids?: number[]
  target_list_id?: number
  export_format?: 'csv' | 'json'
}

type MemberWithLead = {
  id: number
  lead_id: number
  added_at: string
  leads: {
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
}

/**
 * POST /api/lists/[id]/members/bulk
 * Bulk operations on list members
 *
 * Actions:
 * - remove: Remove members from the list
 * - copy_to_list: Copy leads to another list (requires target_list_id)
 * - move_to_list: Move leads to another list (requires target_list_id)
 * - export: Export member data (server-side, returns download URL)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const listId = parseInt(id, 10)

    if (isNaN(listId)) {
      return NextResponse.json(
        { success: false, message: 'ID de liste invalide' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
    }

    // Get organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 400 }
      )
    }

    // Verify list belongs to organization
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('id, name, organization_id, type')
      .eq('id', listId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (listError || !list) {
      return NextResponse.json(
        { success: false, message: 'Liste non trouvee' },
        { status: 404 }
      )
    }

    // Parse body
    const body: BulkRequestBody = await request.json()
    const { action, member_ids, lead_ids, target_list_id, export_format } = body

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'action requise' },
        { status: 400 }
      )
    }

    if (!member_ids?.length && !lead_ids?.length) {
      return NextResponse.json(
        { success: false, message: 'member_ids ou lead_ids requis' },
        { status: 400 }
      )
    }

    // Get the members to operate on
    let membersQuery = supabase
      .from('list_members')
      .select(`
        id,
        lead_id,
        added_at,
        leads!inner (
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

    if (member_ids?.length) {
      membersQuery = membersQuery.in('id', member_ids)
    } else if (lead_ids?.length) {
      membersQuery = membersQuery.in('lead_id', lead_ids)
    }

    const { data: membersData, error: membersError } = await membersQuery
    const members = membersData as MemberWithLead[] | null

    if (membersError) throw membersError

    if (!members?.length) {
      return NextResponse.json(
        { success: false, message: 'Aucun membre trouve' },
        { status: 404 }
      )
    }

    // Execute action
    switch (action) {
      case 'remove': {
        if (list.type !== 'static') {
          return NextResponse.json(
            { success: false, message: 'Impossible de retirer des membres d\'une liste dynamique' },
            { status: 400 }
          )
        }

        const { error: deleteError } = await supabase
          .from('list_members')
          .delete()
          .eq('list_id', listId)
          .in('id', members.map(m => m.id))

        if (deleteError) throw deleteError

        return NextResponse.json({
          success: true,
          action: 'remove',
          message: `${members.length} membre(s) retire(s)`,
          count: members.length,
        })
      }

      case 'copy_to_list': {
        if (!target_list_id) {
          return NextResponse.json(
            { success: false, message: 'target_list_id requis pour copy_to_list' },
            { status: 400 }
          )
        }

        // Verify target list
        const { data: targetList, error: targetError } = await supabase
          .from('lists')
          .select('id, type')
          .eq('id', target_list_id)
          .eq('organization_id', profile.organization_id)
          .single()

        if (targetError || !targetList) {
          return NextResponse.json(
            { success: false, message: 'Liste cible non trouvee' },
            { status: 404 }
          )
        }

        if (targetList.type !== 'static') {
          return NextResponse.json(
            { success: false, message: 'Impossible d\'ajouter a une liste dynamique' },
            { status: 400 }
          )
        }

        // Get existing members in target list
        const { data: existingInTarget, error: existingError } = await supabase
          .from('list_members')
          .select('lead_id')
          .eq('list_id', target_list_id)
          .in('lead_id', members.map(m => m.lead_id))

        if (existingError) throw existingError

        const existingLeadIds = new Set(existingInTarget?.map(m => m.lead_id) || [])
        const newLeadIds = members.filter(m => !existingLeadIds.has(m.lead_id))

        if (newLeadIds.length === 0) {
          return NextResponse.json({
            success: true,
            action: 'copy_to_list',
            message: 'Tous les leads sont deja dans la liste cible',
            added: 0,
            skipped: members.length,
          })
        }

        const { error: insertError } = await supabase
          .from('list_members')
          .insert(newLeadIds.map(m => ({
            list_id: target_list_id,
            lead_id: m.lead_id,
            added_by: user.id,
          })))

        if (insertError) throw insertError

        return NextResponse.json({
          success: true,
          action: 'copy_to_list',
          message: `${newLeadIds.length} membre(s) copie(s)`,
          added: newLeadIds.length,
          skipped: existingLeadIds.size,
        })
      }

      case 'move_to_list': {
        if (!target_list_id) {
          return NextResponse.json(
            { success: false, message: 'target_list_id requis pour move_to_list' },
            { status: 400 }
          )
        }

        if (list.type !== 'static') {
          return NextResponse.json(
            { success: false, message: 'Impossible de deplacer depuis une liste dynamique' },
            { status: 400 }
          )
        }

        // Verify target list
        const { data: targetList, error: targetError } = await supabase
          .from('lists')
          .select('id, type')
          .eq('id', target_list_id)
          .eq('organization_id', profile.organization_id)
          .single()

        if (targetError || !targetList) {
          return NextResponse.json(
            { success: false, message: 'Liste cible non trouvee' },
            { status: 404 }
          )
        }

        if (targetList.type !== 'static') {
          return NextResponse.json(
            { success: false, message: 'Impossible de deplacer vers une liste dynamique' },
            { status: 400 }
          )
        }

        // Get existing members in target list
        const { data: existingInTarget, error: existingError } = await supabase
          .from('list_members')
          .select('lead_id')
          .eq('list_id', target_list_id)
          .in('lead_id', members.map(m => m.lead_id))

        if (existingError) throw existingError

        const existingLeadIds = new Set(existingInTarget?.map(m => m.lead_id) || [])
        const newLeadIds = members.filter(m => !existingLeadIds.has(m.lead_id))

        // Add to target list (only new ones)
        if (newLeadIds.length > 0) {
          const { error: insertError } = await supabase
            .from('list_members')
            .insert(newLeadIds.map(m => ({
              list_id: target_list_id,
              lead_id: m.lead_id,
              added_by: user.id,
            })))

          if (insertError) throw insertError
        }

        // Remove from source list
        const { error: deleteError } = await supabase
          .from('list_members')
          .delete()
          .eq('list_id', listId)
          .in('id', members.map(m => m.id))

        if (deleteError) throw deleteError

        return NextResponse.json({
          success: true,
          action: 'move_to_list',
          message: `${members.length} membre(s) deplace(s)`,
          moved: newLeadIds.length,
          skipped: existingLeadIds.size,
          removed_from_source: members.length,
        })
      }

      case 'export': {
        const format = export_format || 'csv'

        // Build export data
        const exportData = members.map(m => ({
          first_name: m.leads.first_name || '',
          last_name: m.leads.last_name || '',
          email: m.leads.email || '',
          phone: m.leads.phone || '',
          company_name: m.leads.company_name || '',
          job_title: m.leads.job_title || '',
          status: m.leads.status || '',
          score: m.leads.score,
          is_hot: m.leads.is_hot,
          added_at: m.added_at,
        }))

        if (format === 'json') {
          return NextResponse.json({
            success: true,
            action: 'export',
            format: 'json',
            count: exportData.length,
            data: exportData,
          })
        }

        // CSV format
        const headers = ['Prenom', 'Nom', 'Email', 'Telephone', 'Entreprise', 'Poste', 'Statut', 'Score', 'Hot', 'Ajoute le']
        const rows = exportData.map(d => [
          d.first_name,
          d.last_name,
          d.email,
          d.phone,
          d.company_name,
          d.job_title,
          d.status,
          d.score.toString(),
          d.is_hot ? 'Oui' : 'Non',
          new Date(d.added_at).toLocaleDateString('fr-FR'),
        ])

        const csvContent = [
          headers.join(';'),
          ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';')),
        ].join('\n')

        return NextResponse.json({
          success: true,
          action: 'export',
          format: 'csv',
          count: exportData.length,
          data: csvContent,
          filename: `${list.name.replace(/[^a-zA-Z0-9]/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`,
        })
      }

      default:
        return NextResponse.json(
          { success: false, message: `Action inconnue: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in bulk operation:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
