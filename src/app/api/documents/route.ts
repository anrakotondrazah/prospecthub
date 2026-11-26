import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entity_type') // 'lead' | 'deal' | 'company'
    const entityId = searchParams.get('entity_id')
    const fileType = searchParams.get('file_type')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query
    let query = supabase
      .from('documents')
      .select(`
        id,
        uuid,
        name,
        description,
        file_url,
        file_type,
        file_size,
        mime_type,
        visibility,
        version,
        created_at,
        uploaded_by (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('organization_id', profile.organization_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply entity filter
    if (entityType && entityId) {
      const entityIdNum = parseInt(entityId, 10)
      if (isNaN(entityIdNum)) {
        return NextResponse.json(
          { success: false, message: 'entity_id invalide' },
          { status: 400 }
        )
      }

      switch (entityType) {
        case 'lead':
          query = query.eq('associated_lead_id', entityIdNum)
          break
        case 'deal':
          query = query.eq('associated_deal_id', entityIdNum)
          break
        case 'company':
          query = query.eq('associated_company_id', entityIdNum)
          break
        default:
          return NextResponse.json(
            { success: false, message: 'entity_type invalide (lead, deal, company)' },
            { status: 400 }
          )
      }
    }

    // Filter by file type
    if (fileType) {
      query = query.eq('file_type', fileType.toLowerCase())
    }

    const { data: documents, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching documents:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
    })
  } catch (error) {
    console.error('Documents API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    const body = await request.json()

    const {
      name,
      description,
      file_url,
      file_type,
      file_size,
      mime_type,
      storage_path,
      visibility,
      associated_lead_id,
      associated_company_id,
      associated_deal_id,
      tags,
      metadata,
    } = body

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Le nom est obligatoire' },
        { status: 400 }
      )
    }

    if (!file_url?.trim()) {
      return NextResponse.json(
        { success: false, message: 'L\'URL du fichier est obligatoire' },
        { status: 400 }
      )
    }

    // Insert document
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        organization_id: profile.organization_id,
        name: name.trim(),
        description: description?.trim() || null,
        file_url,
        file_type: file_type?.toLowerCase() || null,
        file_size: file_size || 0,
        mime_type: mime_type || null,
        storage_path: storage_path || null,
        visibility: visibility || 'organization',
        associated_lead_id: associated_lead_id || null,
        associated_company_id: associated_company_id || null,
        associated_deal_id: associated_deal_id || null,
        tags: tags || null,
        metadata: metadata || null,
        uploaded_by: user.id,
      })
      .select(`
        id,
        uuid,
        name,
        description,
        file_url,
        file_type,
        file_size,
        mime_type,
        visibility,
        version,
        created_at
      `)
      .single()

    if (insertError) {
      console.error('Error creating document:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation du document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document,
    }, { status: 201 })
  } catch (error) {
    console.error('Documents API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: 'ID du document requis' },
        { status: 400 }
      )
    }

    // Get document to check ownership and get storage path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, storage_path')
      .eq('id', parseInt(documentId))
      .eq('organization_id', profile.organization_id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { success: false, message: 'Document non trouve' },
        { status: 404 }
      )
    }

    // Soft delete the document
    const { error: deleteError } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', document.id)

    if (deleteError) {
      console.error('Error deleting document:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression du document' },
        { status: 500 }
      )
    }

    // Optionally delete from storage (commented out for now - keep files for recovery)
    // if (document.storage_path) {
    //   await supabase.storage.from('documents').remove([document.storage_path])
    // }

    return NextResponse.json({
      success: true,
      message: 'Document supprime',
    })
  } catch (error) {
    console.error('Documents API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
