import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch all steps for a sequence
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

    // Verify sequence belongs to organization
    const { data: sequence, error: sequenceError } = await supabase
      .from('sequences')
      .select('id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single()

    if (sequenceError || !sequence) {
      return NextResponse.json(
        { success: false, message: 'Sequence non trouvee' },
        { status: 404 }
      )
    }

    // Fetch steps
    const { data: steps, error: fetchError } = await supabase
      .from('sequence_steps')
      .select('*')
      .eq('sequence_id', id)
      .order('step_order', { ascending: true })

    if (fetchError) {
      console.error('Error fetching steps:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des etapes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      steps: steps || [],
    })
  } catch (error) {
    console.error('Steps API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Add a new step to sequence
export async function POST(
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

    // Verify sequence belongs to organization
    const { data: sequence, error: sequenceError } = await supabase
      .from('sequences')
      .select('id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single()

    if (sequenceError || !sequence) {
      return NextResponse.json(
        { success: false, message: 'Sequence non trouvee' },
        { status: 404 }
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

    const {
      step_type,
      step_order,
      delay_days,
      delay_hours,
      template_id,
      subject,
      body: stepBody,
      task_title,
      task_description,
    } = body

    // Validation
    if (!step_type) {
      return NextResponse.json(
        { success: false, message: 'Type d\'etape obligatoire' },
        { status: 400 }
      )
    }

    // SECURITY: Verify template_id belongs to user's organization if provided
    if (template_id) {
      const { data: template, error: templateError } = await supabase
        .from('message_templates')
        .select('id')
        .eq('id', template_id)
        .eq('organization_id', profile.organization_id)
        .maybeSingle()

      if (templateError || !template) {
        return NextResponse.json(
          { success: false, message: 'Template non trouve ou non autorise' },
          { status: 400 }
        )
      }
    }

    // Get max step_order if not provided (with proper error handling)
    let finalStepOrder = step_order
    if (!finalStepOrder) {
      const { data: maxStep, error: maxStepError } = await supabase
        .from('sequence_steps')
        .select('step_order')
        .eq('sequence_id', id)
        .order('step_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (maxStepError) {
        console.error('Error getting max step order:', maxStepError)
        return NextResponse.json(
          { success: false, message: 'Erreur lors de la recuperation de l\'ordre' },
          { status: 500 }
        )
      }

      finalStepOrder = (maxStep?.step_order || 0) + 1
    }

    // Insert step with retry on unique violation (race condition handling)
    let step = null
    let insertError = null
    let retries = 3

    while (retries > 0) {
      const result = await supabase
        .from('sequence_steps')
        .insert({
          sequence_id: parseInt(id),
          step_type,
          step_order: finalStepOrder,
          delay_days: delay_days || 0,
          delay_hours: delay_hours || 0,
          template_id: template_id || null,
          subject: subject || null,
          body: stepBody || null,
          task_title: task_title || null,
          task_description: task_description || null,
        })
        .select('*')
        .single()

      if (!result.error) {
        step = result.data
        break
      }

      // Check for unique violation (step_order conflict)
      if (result.error.code === '23505') {
        retries--
        finalStepOrder++
        continue
      }

      insertError = result.error
      break
    }

    if (insertError || !step) {
      console.error('Error creating step:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation de l\'etape' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      step,
    })
  } catch (error) {
    console.error('Steps API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Batch reorder steps
export async function PUT(
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

    // Verify sequence belongs to organization
    const { data: sequence, error: sequenceError } = await supabase
      .from('sequences')
      .select('id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single()

    if (sequenceError || !sequence) {
      return NextResponse.json(
        { success: false, message: 'Sequence non trouvee' },
        { status: 404 }
      )
    }

    // Parse request body - expects { stepIds: number[] }
    const body = await request.json().catch(() => null)
    if (!body || !Array.isArray(body.stepIds)) {
      return NextResponse.json(
        { success: false, message: 'stepIds array required' },
        { status: 400 }
      )
    }

    const { stepIds } = body as { stepIds: unknown[] }

    // Validate: all values must be integers
    if (!stepIds.every(id => Number.isInteger(id))) {
      return NextResponse.json(
        { success: false, message: 'stepIds must contain only integers' },
        { status: 400 }
      )
    }

    const validStepIds = stepIds as number[]

    // Validate: no duplicates
    if (new Set(validStepIds).size !== validStepIds.length) {
      return NextResponse.json(
        { success: false, message: 'stepIds must not contain duplicates' },
        { status: 400 }
      )
    }

    // Validate: must be exact permutation of existing step IDs
    const { data: existingSteps, error: existingError } = await supabase
      .from('sequence_steps')
      .select('id')
      .eq('sequence_id', parseInt(id))

    if (existingError) {
      console.error('Error fetching existing steps:', existingError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la verification' },
        { status: 500 }
      )
    }

    const existingIds = new Set((existingSteps || []).map(s => s.id))
    const providedIds = new Set(validStepIds)

    if (existingIds.size !== providedIds.size ||
        !validStepIds.every(id => existingIds.has(id))) {
      return NextResponse.json(
        { success: false, message: 'stepIds must be exact permutation of sequence steps' },
        { status: 400 }
      )
    }

    // Update each step with new order
    // Use negative numbers first to avoid unique constraint violations
    const tempOffset = -1000000

    // First pass: set temporary negative values
    for (let i = 0; i < validStepIds.length; i++) {
      const { error } = await supabase
        .from('sequence_steps')
        .update({ step_order: tempOffset - i })
        .eq('id', validStepIds[i])
        .eq('sequence_id', parseInt(id))

      if (error) {
        console.error('Error updating step order (temp):', error)
        return NextResponse.json(
          { success: false, message: 'Erreur lors du reordonnancement' },
          { status: 500 }
        )
      }
    }

    // Second pass: set final positive values
    for (let i = 0; i < validStepIds.length; i++) {
      const { error } = await supabase
        .from('sequence_steps')
        .update({ step_order: i + 1 })
        .eq('id', validStepIds[i])
        .eq('sequence_id', parseInt(id))

      if (error) {
        console.error('Error updating step order (final):', error)
        return NextResponse.json(
          { success: false, message: 'Erreur lors du reordonnancement' },
          { status: 500 }
        )
      }
    }

    // Fetch updated steps
    const { data: steps, error: fetchError } = await supabase
      .from('sequence_steps')
      .select('*')
      .eq('sequence_id', id)
      .order('step_order', { ascending: true })

    if (fetchError) {
      console.error('Error fetching updated steps:', fetchError)
    }

    return NextResponse.json({
      success: true,
      steps: steps || [],
    })
  } catch (error) {
    console.error('Steps reorder API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
