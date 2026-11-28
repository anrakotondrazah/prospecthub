import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List organization members
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
      .select('organization_id, is_owner')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 400 }
      )
    }

    // Fetch all members of the organization
    const { data: members, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        job_title,
        is_owner,
        is_active,
        created_at,
        role:roles(id, code, name)
      `)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching members:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des membres' },
        { status: 500 }
      )
    }

    // Get user emails from auth (requires service role in production)
    // For now, we'll need to join with auth.users or store email in profiles

    return NextResponse.json({
      success: true,
      members: members || [],
      currentUserIsOwner: profile.is_owner,
    })
  } catch (error) {
    console.error('Members API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Invite a new member
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

    // Get user's organization and check if owner
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

    if (!profile.is_owner) {
      return NextResponse.json(
        { success: false, message: 'Seul le proprietaire peut inviter des membres' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Corps de requete invalide' },
        { status: 400 }
      )
    }

    const { email, role_id, first_name, last_name } = body

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email invalide' },
        { status: 400 }
      )
    }

    // Check if user already exists in organization
    // Note: This would need to check auth.users which requires service role
    // For now, we'll create an invitation record

    // In a real implementation:
    // 1. Send invitation email via Supabase Auth inviteUserByEmail
    // 2. Store pending invitation
    // 3. When user accepts, link to organization

    // Placeholder response - invitation system needs service role
    return NextResponse.json({
      success: true,
      message: 'Invitation envoyee (fonctionnalite en cours de developpement)',
      invitation: {
        email,
        role_id,
        first_name,
        last_name,
        status: 'pending',
      },
    })
  } catch (error) {
    console.error('Members API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
