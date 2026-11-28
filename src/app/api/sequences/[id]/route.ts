import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Allowed values for sequence fields (match database constraints)
const ALLOWED_STATUS = ['draft', 'active', 'paused', 'archived'] as const
const ALLOWED_TRIGGER_TYPE = ['manual', 'enrollment', 'workflow'] as const

// Validation helper for PATCH (partial update)
function validateSequenceUpdate(
  data: Record<string, unknown>
): { valid: true } | { valid: false; message: string } {
  // Name validation (if supplied)
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      return { valid: false, message: 'Nom invalide (doit etre une string non vide)' }
    }
  }

  // Status validation (if supplied)
  if (data.status !== undefined) {
    if (!ALLOWED_STATUS.includes(data.status as typeof ALLOWED_STATUS[number])) {
      return { valid: false, message: `Status invalide (valeurs autorisees: ${ALLOWED_STATUS.join(', ')})` }
    }
  }

  // Trigger type validation (if supplied)
  if (data.trigger_type !== undefined) {
    if (!ALLOWED_TRIGGER_TYPE.includes(data.trigger_type as typeof ALLOWED_TRIGGER_TYPE[number])) {
      return { valid: false, message: `Type de declencheur invalide (valeurs autorisees: ${ALLOWED_TRIGGER_TYPE.join(', ')})` }
    }
  }

  // Description validation (if supplied, must be string or null)
  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    return { valid: false, message: 'Description invalide (doit etre une string ou null)' }
  }

  return { valid: true }
}

// GET - Fetch sequence by ID with steps
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Non authentifie' }, { status: 401 })
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

    // Fetch sequence with steps
    const { data: sequence, error: fetchError } = await supabase
      .from('sequences')
      .select(`
        *,
        steps:sequence_steps(*)
      `)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single()

    if (fetchError) {
      console.error('Error fetching sequence:', fetchError)
      // Distinguish between not found (PGRST116) and DB errors
      const isNotFound = fetchError.code === 'PGRST116' || fetchError.message?.includes('no rows')
      return NextResponse.json(
        { success: false, message: isNotFound ? 'Sequence non trouvee' : 'Erreur base de donnees' },
        { status: isNotFound ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sequence,
    })
  } catch (error) {
    console.error('Sequence API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Update sequence
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Non authentifie' }, { status: 401 })
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

    // Parse request body
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Corps de requete invalide' },
        { status: 400 }
      )
    }

    const { name, description, trigger_type, status, settings } = body

    // Validation using shared schema (partial update)
    const validation = validateSequenceUpdate(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (trigger_type !== undefined) updateData.trigger_type = trigger_type
    if (status !== undefined) updateData.status = status
    if (settings !== undefined) updateData.settings = settings

    // Update sequence
    const { data: sequence, error: updateError } = await supabase
      .from('sequences')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating sequence:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour de la sequence' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sequence,
    })
  } catch (error) {
    console.error('Sequence API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Delete sequence
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Non authentifie' }, { status: 401 })
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

    // Delete sequence (CASCADE will handle steps and enrollments)
    const { error: deleteError } = await supabase
      .from('sequences')
      .delete()
      .eq('id', id)
      .eq('organization_id', profile.organization_id)

    if (deleteError) {
      console.error('Error deleting sequence:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression de la sequence' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sequence supprimee avec succes',
    })
  } catch (error) {
    console.error('Sequence API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
