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
      .from('saved_views')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .or(`user_id.eq.${user.id},is_shared.eq.true`)
      .order('created_at', { ascending: false })

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    const { data: views, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching views:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des vues' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      views: views || [],
    })
  } catch (error) {
    console.error('Views API error:', error)
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
    const { name, entity_type, filters, columns, sort_by, sort_order, is_default, is_shared } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Le nom est obligatoire' },
        { status: 400 }
      )
    }

    if (!entity_type) {
      return NextResponse.json(
        { success: false, message: 'Le type d\'entite est obligatoire' },
        { status: 400 }
      )
    }

    // Insert view
    const { data: view, error: insertError } = await supabase
      .from('saved_views')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        name: name.trim(),
        entity_type,
        filters: filters || {},
        columns: columns || [],
        sort_by: sort_by || null,
        sort_order: sort_order || 'asc',
        is_default: is_default || false,
        is_shared: is_shared || false,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating view:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation de la vue' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      view,
    })
  } catch (error) {
    console.error('Views API error:', error)
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
    const viewId = searchParams.get('id')

    if (!viewId) {
      return NextResponse.json(
        { success: false, message: 'ID de vue manquant' },
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

    // Check ownership
    const { data: view, error: viewError } = await supabase
      .from('saved_views')
      .select('user_id')
      .eq('id', viewId)
      .single()

    if (viewError || !view) {
      return NextResponse.json(
        { success: false, message: 'Vue non trouvee' },
        { status: 404 }
      )
    }

    if (view.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Non autorise' },
        { status: 403 }
      )
    }

    // Delete view
    const { error: deleteError } = await supabase
      .from('saved_views')
      .delete()
      .eq('id', viewId)

    if (deleteError) {
      console.error('Error deleting view:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression de la vue' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Vue supprimee',
    })
  } catch (error) {
    console.error('Views API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
