import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    const body = await request.json()
    const { name, description, trigger_type, status } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Nom de la sequence obligatoire' },
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
