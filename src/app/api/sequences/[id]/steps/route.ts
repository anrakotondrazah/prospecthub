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
    const body = await request.json()
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

    // Get max step_order if not provided
    let finalStepOrder = step_order
    if (!finalStepOrder) {
      const { data: maxStep } = await supabase
        .from('sequence_steps')
        .select('step_order')
        .eq('sequence_id', id)
        .order('step_order', { ascending: false })
        .limit(1)
        .single()

      finalStepOrder = (maxStep?.step_order || 0) + 1
    }

    // Insert step
    const { data: step, error: insertError } = await supabase
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

    if (insertError) {
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
