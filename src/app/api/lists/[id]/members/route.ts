import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/lists/[id]/members
 * Fetch all members of a list with pagination
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
      .select('id, organization_id')
      .eq('id', listId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (listError || !list) {
      return NextResponse.json(
        { success: false, message: 'Liste non trouvee' },
        { status: 404 }
      )
    }

    // Parse query params for pagination
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = (page - 1) * limit

    // Fetch members with leads data
    const { data: members, error: membersError, count } = await supabase
      .from('list_members')
      .select(`
        id,
        list_id,
        lead_id,
        added_at,
        added_by,
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
      `, { count: 'exact' })
      .eq('list_id', listId)
      .order('added_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (membersError) throw membersError

    return NextResponse.json({
      success: true,
      data: members || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching list members:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lists/[id]/members
 * Add leads to a list
 * Body: { lead_ids: number[] }
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

    // Verify list belongs to organization and is static
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('id, organization_id, type')
      .eq('id', listId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (listError || !list) {
      return NextResponse.json(
        { success: false, message: 'Liste non trouvee' },
        { status: 404 }
      )
    }

    if (list.type !== 'static') {
      return NextResponse.json(
        { success: false, message: 'Impossible d\'ajouter des membres a une liste dynamique' },
        { status: 400 }
      )
    }

    // Parse body
    const body = await request.json()
    const { lead_ids } = body as { lead_ids: number[] }

    if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'lead_ids requis et doit etre un tableau non vide' },
        { status: 400 }
      )
    }

    // Check leads belong to organization
    const { data: validLeads, error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .in('id', lead_ids)

    if (leadsError) throw leadsError

    const validLeadIds = new Set(validLeads?.map(l => l.id) || [])
    const invalidLeadIds = lead_ids.filter(id => !validLeadIds.has(id))

    if (invalidLeadIds.length > 0) {
      return NextResponse.json(
        { success: false, message: `Leads invalides ou inaccessibles: ${invalidLeadIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Get existing members to avoid duplicates
    const { data: existingMembers, error: existingError } = await supabase
      .from('list_members')
      .select('lead_id')
      .eq('list_id', listId)
      .in('lead_id', lead_ids)

    if (existingError) throw existingError

    const existingLeadIds = new Set(existingMembers?.map(m => m.lead_id) || [])
    const newLeadIds = lead_ids.filter(id => !existingLeadIds.has(id))

    if (newLeadIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tous les leads sont deja dans la liste',
        added: 0,
        skipped: lead_ids.length,
        data: [],
      })
    }

    // Insert new members
    const membersToInsert = newLeadIds.map(leadId => ({
      list_id: listId,
      lead_id: leadId,
      added_by: user.id,
    }))

    const { data: newMembers, error: insertError } = await supabase
      .from('list_members')
      .insert(membersToInsert)
      .select(`
        id,
        list_id,
        lead_id,
        added_at,
        added_by,
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

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      message: `${newMembers?.length || 0} lead(s) ajoute(s) a la liste`,
      added: newMembers?.length || 0,
      skipped: existingLeadIds.size,
      data: newMembers || [],
    })
  } catch (error) {
    console.error('Error adding list members:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/lists/[id]/members
 * Remove leads from a list
 * Body: { member_ids: number[] } or { lead_ids: number[] }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      .select('id, organization_id, type')
      .eq('id', listId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (listError || !list) {
      return NextResponse.json(
        { success: false, message: 'Liste non trouvee' },
        { status: 404 }
      )
    }

    if (list.type !== 'static') {
      return NextResponse.json(
        { success: false, message: 'Impossible de retirer des membres d\'une liste dynamique' },
        { status: 400 }
      )
    }

    // Parse body
    const body = await request.json()
    const { member_ids, lead_ids } = body as { member_ids?: number[]; lead_ids?: number[] }

    if (!member_ids && !lead_ids) {
      return NextResponse.json(
        { success: false, message: 'member_ids ou lead_ids requis' },
        { status: 400 }
      )
    }

    // Count members to delete first
    let countQuery = supabase
      .from('list_members')
      .select('id', { count: 'exact', head: true })
      .eq('list_id', listId)

    if (member_ids && member_ids.length > 0) {
      countQuery = countQuery.in('id', member_ids)
    } else if (lead_ids && lead_ids.length > 0) {
      countQuery = countQuery.in('lead_id', lead_ids)
    }

    const { count } = await countQuery

    // Delete members
    let deleteQuery = supabase
      .from('list_members')
      .delete()
      .eq('list_id', listId)

    if (member_ids && member_ids.length > 0) {
      deleteQuery = deleteQuery.in('id', member_ids)
    } else if (lead_ids && lead_ids.length > 0) {
      deleteQuery = deleteQuery.in('lead_id', lead_ids)
    }

    const { error: deleteError } = await deleteQuery

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: `${count || 0} membre(s) retire(s) de la liste`,
      removed: count || 0,
    })
  } catch (error) {
    console.error('Error removing list members:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
