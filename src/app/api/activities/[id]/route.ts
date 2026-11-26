import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activityId = parseInt(id, 10)

    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, message: 'ID invalide' },
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

    // Fetch activity
    const { data: activity, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .eq('organization_id', profile.organization_id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !activity) {
      return NextResponse.json(
        { success: false, message: 'Activite non trouvee' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      activity,
    })
  } catch (error) {
    console.error('Activity GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activityId = parseInt(id, 10)

    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, message: 'ID invalide' },
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

    const body = await request.json()

    // Validate activity_type if provided
    if (body.activity_type && !['note', 'call', 'email', 'meeting', 'task', 'other'].includes(body.activity_type)) {
      return NextResponse.json(
        { success: false, message: 'Type d\'activite invalide' },
        { status: 400 }
      )
    }

    // Build update object (only allowed fields)
    const updateData: Record<string, unknown> = {}
    const allowedFields = ['activity_type', 'subject', 'body', 'outcome', 'duration_minutes', 'activity_date', 'metadata']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Aucune donnee a mettre a jour' },
        { status: 400 }
      )
    }

    // Update activity
    const { data: activity, error: updateError } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', activityId)
      .eq('organization_id', profile.organization_id)
      .is('deleted_at', null)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating activity:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour' },
        { status: 500 }
      )
    }

    if (!activity) {
      return NextResponse.json(
        { success: false, message: 'Activite non trouvee' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      activity,
    })
  } catch (error) {
    console.error('Activity PATCH error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activityId = parseInt(id, 10)

    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, message: 'ID invalide' },
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

    // Soft delete (set deleted_at)
    const { error: deleteError } = await supabase
      .from('activities')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', activityId)
      .eq('organization_id', profile.organization_id)
      .is('deleted_at', null)

    if (deleteError) {
      console.error('Error deleting activity:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Activite supprimee',
    })
  } catch (error) {
    console.error('Activity DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
