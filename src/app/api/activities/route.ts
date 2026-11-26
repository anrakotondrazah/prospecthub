import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
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

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entity_type') // 'lead' | 'deal' | 'company'
    const entityId = searchParams.get('entity_id')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Build query
    let query = supabase
      .from('activities')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .is('deleted_at', null)
      .order('activity_date', { ascending: false })
      .limit(limit)

    // Apply entity filter
    if (entityType && entityId) {
      const entityIdNum = parseInt(entityId, 10)
      if (isNaN(entityIdNum)) {
        return NextResponse.json(
          { success: false, message: 'entity_id invalide' },
          { status: 400 }
        )
      }

      switch (entityType) {
        case 'lead':
          query = query.eq('associated_lead_id', entityIdNum)
          break
        case 'deal':
          query = query.eq('associated_deal_id', entityIdNum)
          break
        case 'company':
          query = query.eq('associated_company_id', entityIdNum)
          break
        default:
          return NextResponse.json(
            { success: false, message: 'entity_type invalide (lead, deal, company)' },
            { status: 400 }
          )
      }
    }

    const { data: activities, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching activities:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des activites' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      activities: activities || [],
    })
  } catch (error) {
    console.error('Activities API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
    }

    // Get organization_id and user_id
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

    // Get user_id from users table (integer id)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('uuid', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouve' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const { activity_type, subject, body: activityBody, outcome, duration_minutes, activity_date, associated_lead_id, associated_company_id, associated_deal_id, metadata } = body

    if (!activity_type || !['note', 'call', 'email', 'meeting', 'task', 'other'].includes(activity_type)) {
      return NextResponse.json(
        { success: false, message: 'Type d\'activite invalide' },
        { status: 400 }
      )
    }

    // Insert activity
    const { data: activity, error: insertError } = await supabase
      .from('activities')
      .insert({
        organization_id: profile.organization_id,
        user_id: userData.id,
        activity_type,
        subject: subject || null,
        body: activityBody || null,
        outcome: outcome || null,
        duration_minutes: duration_minutes || null,
        activity_date: activity_date || new Date().toISOString(),
        associated_lead_id: associated_lead_id || null,
        associated_company_id: associated_company_id || null,
        associated_deal_id: associated_deal_id || null,
        metadata: metadata || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating activity:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation de l\'activite' },
        { status: 500 }
      )
    }

    // Update last_activity_at on the associated entity
    if (associated_lead_id) {
      await supabase
        .from('leads')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', associated_lead_id)
        .eq('organization_id', profile.organization_id)
    }

    return NextResponse.json({
      success: true,
      activity,
    }, { status: 201 })
  } catch (error) {
    console.error('Activities API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
