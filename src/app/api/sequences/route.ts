import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Allowed values for sequence fields (match database constraints)
const ALLOWED_STATUS = ['draft', 'active', 'paused', 'archived'] as const
const ALLOWED_TRIGGER_TYPE = ['manual', 'enrollment', 'workflow'] as const

// Validation helper
function validateSequenceFields(
  data: Record<string, unknown>,
  isCreate: boolean
): { valid: true } | { valid: false; message: string } {
  // Name validation
  if (isCreate) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      return { valid: false, message: 'Nom de la sequence obligatoire (string non vide)' }
    }
  } else if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      return { valid: false, message: 'Nom invalide (doit etre une string non vide)' }
    }
  }

  // Status validation
  if (data.status !== undefined) {
    if (!ALLOWED_STATUS.includes(data.status as typeof ALLOWED_STATUS[number])) {
      return { valid: false, message: `Status invalide (valeurs autorisees: ${ALLOWED_STATUS.join(', ')})` }
    }
  }

  // Trigger type validation
  if (data.trigger_type !== undefined) {
    if (!ALLOWED_TRIGGER_TYPE.includes(data.trigger_type as typeof ALLOWED_TRIGGER_TYPE[number])) {
      return { valid: false, message: `Type de declencheur invalide (valeurs autorisees: ${ALLOWED_TRIGGER_TYPE.join(', ')})` }
    }
  }

  // Description validation (must be string or null/undefined)
  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    return { valid: false, message: 'Description invalide (doit etre une string ou null)' }
  }

  return { valid: true }
}

// GET - Fetch all sequences for the organization
export async function GET() {
  try {
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

    // Fetch sequences with counts
    const { data: sequences, error: fetchError } = await supabase
      .from('sequences')
      .select(`
        *,
        steps_count:sequence_steps(count),
        enrollments_count:sequence_enrollments(count)
      `)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching sequences:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des sequences' },
        { status: 500 }
      )
    }

    // Transform counts from array to number
    const transformedSequences = (sequences || []).map(seq => ({
      ...seq,
      steps_count: seq.steps_count?.[0]?.count || 0,
      enrollments_count: seq.enrollments_count?.[0]?.count || 0,
    }))

    return NextResponse.json({
      success: true,
      sequences: transformedSequences,
    })
  } catch (error) {
    console.error('Sequences API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Create a new sequence
export async function POST(request: NextRequest) {
  try {
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

    const { name, description, trigger_type, status } = body

    // Validation using shared schema
    const validation = validateSequenceFields(body, true)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      )
    }

    // Insert sequence
    const { data: sequence, error: insertError } = await supabase
      .from('sequences')
      .insert({
        organization_id: profile.organization_id,
        created_by: user.id,
        name,
        description: description || null,
        trigger_type: trigger_type || 'manual',
        status: status || 'draft',
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating sequence:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation de la sequence' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sequence,
    })
  } catch (error) {
    console.error('Sequences API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
