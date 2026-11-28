import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH - Update a step
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id, stepId } = await params
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

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (step_type !== undefined) updateData.step_type = step_type
    if (step_order !== undefined) updateData.step_order = step_order
    if (delay_days !== undefined) updateData.delay_days = delay_days
    if (delay_hours !== undefined) updateData.delay_hours = delay_hours
    if (template_id !== undefined) updateData.template_id = template_id
    if (subject !== undefined) updateData.subject = subject
    if (stepBody !== undefined) updateData.body = stepBody
    if (task_title !== undefined) updateData.task_title = task_title
    if (task_description !== undefined) updateData.task_description = task_description

    // Update step
    const { data: step, error: updateError } = await supabase
      .from('sequence_steps')
      .update(updateData)
      .eq('id', stepId)
      .eq('sequence_id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating step:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour de l\'etape' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      step,
    })
  } catch (error) {
    console.error('Step API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Delete a step
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id, stepId } = await params
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

    // Delete step
    const { error: deleteError } = await supabase
      .from('sequence_steps')
      .delete()
      .eq('id', stepId)
      .eq('sequence_id', id)

    if (deleteError) {
      console.error('Error deleting step:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression de l\'etape' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Etape supprimee avec succes',
    })
  } catch (error) {
    console.error('Step API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
