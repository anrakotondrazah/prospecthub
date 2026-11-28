import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Enroll leads in a sequence
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

    // Verify sequence belongs to organization and is active
    const { data: sequence, error: sequenceError } = await supabase
      .from('sequences')
      .select('id, status')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single()

    if (sequenceError || !sequence) {
      return NextResponse.json(
        { success: false, message: 'Sequence non trouvee' },
        { status: 404 }
      )
    }

    if (sequence.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'La sequence doit etre active pour inscrire des leads' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { lead_ids } = body

    // Validation
    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Liste de leads obligatoire' },
        { status: 400 }
      )
    }

    // Get first step to calculate next_step_at
    const { data: firstStep } = await supabase
      .from('sequence_steps')
      .select('delay_days, delay_hours')
      .eq('sequence_id', id)
      .eq('step_order', 1)
      .single()

    // Calculate next_step_at
    const now = new Date()
    const nextStepAt = new Date(now)
    if (firstStep) {
      nextStepAt.setDate(nextStepAt.getDate() + (firstStep.delay_days || 0))
      nextStepAt.setHours(nextStepAt.getHours() + (firstStep.delay_hours || 0))
    }

    // Prepare enrollments
    const enrollments = lead_ids.map(lead_id => ({
      sequence_id: parseInt(id),
      lead_id,
      status: 'active',
      current_step: 1,
      next_step_at: nextStepAt.toISOString(),
    }))

    // Insert enrollments (upsert to handle duplicates)
    const { data: insertedEnrollments, error: insertError } = await supabase
      .from('sequence_enrollments')
      .upsert(enrollments, {
        onConflict: 'sequence_id,lead_id',
        ignoreDuplicates: false,
      })
      .select('*')

    if (insertError) {
      console.error('Error enrolling leads:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de l\'inscription des leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrollments: insertedEnrollments,
      message: `${insertedEnrollments?.length || 0} lead(s) inscrit(s) avec succes`,
    })
  } catch (error) {
    console.error('Enroll API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
