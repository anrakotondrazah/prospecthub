import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch a single template
export async function GET(
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

    // Fetch template
    const { data: template, error: fetchError } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', parseInt(id))
      .eq('organization_id', profile.organization_id)
      .single()

    if (fetchError) {
      console.error('Error fetching template:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Template non trouve' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    console.error('Template API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Update a template
export async function PUT(
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

    // Parse request body
    const body = await request.json()
    const { name, subject, body: templateBody, type, category, tokens, is_active } = body

    // Validation
    if (!name || !templateBody) {
      return NextResponse.json(
        { success: false, message: 'Nom et corps du message obligatoires' },
        { status: 400 }
      )
    }

    // Update template
    const { data: template, error: updateError } = await supabase
      .from('message_templates')
      .update({
        name,
        subject: subject || null,
        body: templateBody,
        type: type || 'email',
        category: category || null,
        tokens: JSON.stringify(tokens || []),
        is_active: is_active !== undefined ? is_active : true,
      })
      .eq('id', parseInt(id))
      .eq('organization_id', profile.organization_id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating template:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour du template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    console.error('Template API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Delete a template
export async function DELETE(
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

    // Delete template
    const { error: deleteError } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', parseInt(id))
      .eq('organization_id', profile.organization_id)

    if (deleteError) {
      console.error('Error deleting template:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression du template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Template supprime',
    })
  } catch (error) {
    console.error('Template API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
