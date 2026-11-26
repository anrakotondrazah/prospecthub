import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entity_type')

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
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

    // Build query
    let query = supabase
      .from('custom_properties')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('display_order', { ascending: true })

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    const { data: properties, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching properties:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des proprietes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      properties: properties || [],
    })
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
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

    // Validate required fields
    const { field_name, field_label, field_type, entity_type, options, default_value, is_required } = body

    if (!field_name?.trim() || !field_label?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Le nom et le label sont obligatoires' },
        { status: 400 }
      )
    }

    if (!entity_type) {
      return NextResponse.json(
        { success: false, message: 'Le type d\'entite est obligatoire' },
        { status: 400 }
      )
    }

    if (!field_type) {
      return NextResponse.json(
        { success: false, message: 'Le type de champ est obligatoire' },
        { status: 400 }
      )
    }

    // Get current max display_order
    const { data: maxOrder } = await supabase
      .from('custom_properties')
      .select('display_order')
      .eq('organization_id', profile.organization_id)
      .eq('entity_type', entity_type)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const displayOrder = (maxOrder?.display_order ?? -1) + 1

    // Insert property
    const { data: property, error: insertError } = await supabase
      .from('custom_properties')
      .insert({
        organization_id: profile.organization_id,
        entity_type,
        field_name: field_name.trim(),
        field_label: field_label.trim(),
        field_type,
        options: options || null,
        default_value: default_value || null,
        is_required: is_required || false,
        display_order: displayOrder,
      })
      .select('*')
      .single()

    if (insertError) {
      // Check for unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'Un champ avec ce nom existe deja' },
          { status: 400 }
        )
      }
      console.error('Error creating property:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation de la propriete' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      property,
    })
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, field_label, options, is_required, display_order } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID de propriete manquant' },
        { status: 400 }
      )
    }

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
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

    // Build update object
    const updates: Record<string, unknown> = {}
    if (field_label !== undefined) updates.field_label = field_label.trim()
    if (options !== undefined) updates.options = options
    if (is_required !== undefined) updates.is_required = is_required
    if (display_order !== undefined) updates.display_order = display_order

    // Update property
    const { data: property, error: updateError } = await supabase
      .from('custom_properties')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating property:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour de la propriete' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      property,
    })
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('id')

    if (!propertyId) {
      return NextResponse.json(
        { success: false, message: 'ID de propriete manquant' },
        { status: 400 }
      )
    }

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
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

    // Delete property (cascades to values)
    const { error: deleteError } = await supabase
      .from('custom_properties')
      .delete()
      .eq('id', propertyId)
      .eq('organization_id', profile.organization_id)

    if (deleteError) {
      console.error('Error deleting property:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression de la propriete' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Propriete supprimee',
    })
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
