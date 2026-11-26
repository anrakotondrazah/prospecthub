import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch all templates for the organization
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

    // Fetch templates
    const { data: templates, error: fetchError } = await supabase
      .from('message_templates')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching templates:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des templates' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
    })
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Create a new template
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
    const { name, subject, body: templateBody, type, category, tokens } = body

    // Validation
    if (!name || !templateBody) {
      return NextResponse.json(
        { success: false, message: 'Nom et corps du message obligatoires' },
        { status: 400 }
      )
    }

    // Insert template
    const { data: template, error: insertError } = await supabase
      .from('message_templates')
      .insert({
        organization_id: profile.organization_id,
        name,
        subject: subject || null,
        body: templateBody,
        type: type || 'email',
        category: category || null,
        tokens: JSON.stringify(tokens || []),
        created_by: user.id,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating template:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation du template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
