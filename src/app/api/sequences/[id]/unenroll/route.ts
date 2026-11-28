import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Unenroll leads from a sequence
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
    const { lead_ids, reason } = body

    // Validation
    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Liste de leads obligatoire' },
        { status: 400 }
      )
    }

    // Update enrollments to unenrolled status
    const { data: unenrolledLeads, error: updateError } = await supabase
      .from('sequence_enrollments')
      .update({
        status: 'unenrolled',
        unenrolled_at: new Date().toISOString(),
        unenroll_reason: reason || null,
      })
      .eq('sequence_id', id)
      .in('lead_id', lead_ids)
      .select('*')

    if (updateError) {
      console.error('Error unenrolling leads:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la desinscription des leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      unenrolled: unenrolledLeads,
      message: `${unenrolledLeads?.length || 0} lead(s) desinscrit(s) avec succes`,
    })
  } catch (error) {
    console.error('Unenroll API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
