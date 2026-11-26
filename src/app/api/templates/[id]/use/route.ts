import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Increment template usage count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Check template exists and belongs to organization
    const { data: existingTemplate } = await supabase
      .from('message_templates')
      .select('id, usage_count')
      .eq('id', parseInt(id))
      .eq('organization_id', profile.organization_id)
      .single()

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, message: 'Template non trouve' },
        { status: 404 }
      )
    }

    // Increment usage count
    const { data: template, error: updateError } = await supabase
      .from('message_templates')
      .update({
        usage_count: (existingTemplate.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating template usage:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    console.error('Template use API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
