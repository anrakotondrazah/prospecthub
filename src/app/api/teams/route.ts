import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List organization teams
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Non authentifie' }, { status: 401 })
    }

    // Get user's organization
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

    // Fetch all teams with member count
    const { data: teams, error: fetchError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        description,
        manager_id,
        created_at,
        manager:profiles!teams_manager_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        members_count:team_members(count)
      `)
      .eq('organization_id', profile.organization_id)
      .order('name', { ascending: true })

    if (fetchError) {
      console.error('Error fetching teams:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des equipes' },
        { status: 500 }
      )
    }

    // Transform member count
    const transformedTeams = (teams || []).map(team => ({
      ...team,
      members_count: Array.isArray(team.members_count)
        ? team.members_count[0]?.count || 0
        : 0,
      manager: Array.isArray(team.manager) ? team.manager[0] : team.manager,
    }))

    return NextResponse.json({
      success: true,
      teams: transformedTeams,
    })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Create a new team
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Non authentifie' }, { status: 401 })
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, is_owner')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Corps de requete invalide' },
        { status: 400 }
      )
    }

    const { name, description, manager_id } = body

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Nom de l\'equipe obligatoire' },
        { status: 400 }
      )
    }

    // Validate manager_id if provided (must be in same organization)
    if (manager_id) {
      const { data: manager, error: managerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', manager_id)
        .eq('organization_id', profile.organization_id)
        .single()

      if (managerError || !manager) {
        return NextResponse.json(
          { success: false, message: 'Manager invalide' },
          { status: 400 }
        )
      }
    }

    // Create team
    const { data: team, error: insertError } = await supabase
      .from('teams')
      .insert({
        organization_id: profile.organization_id,
        name: name.trim(),
        description: description || null,
        manager_id: manager_id || null,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating team:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation de l\'equipe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      team,
    })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
