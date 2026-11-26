import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type EntityType = 'leads' | 'companies' | 'deals' | 'contacts'

interface AssociationCreate {
  source_type: EntityType
  source_id: number
  target_type: EntityType
  target_id: number
}

/**
 * GET /api/associations?entity_type=deals&entity_id=123
 * List all associations for an entity
 */
export async function GET(request: Request) {
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

    const orgId = profile.organization_id

    // Parse query params
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entity_type') as EntityType | null
    const entityId = searchParams.get('entity_id')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, message: 'entity_type et entity_id requis' },
        { status: 400 }
      )
    }

    // Get associations using the database function
    const { data: rawAssociations, error: assocError } = await supabase
      .rpc('get_entity_associations', {
        p_org_id: orgId,
        p_entity_type: entityType,
        p_entity_id: parseInt(entityId),
      })

    if (assocError) {
      console.error('Association fetch error:', assocError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation' },
        { status: 500 }
      )
    }

    // Enrich with entity details
    const associations = await Promise.all(
      (rawAssociations || []).map(async (assoc: {
        id: number
        related_type: EntityType
        related_id: number
        direction: string
        created_by: string
        created_at: string
      }) => {
        let entityData = null

        if (assoc.related_type === 'leads') {
          const { data } = await supabase
            .from('leads')
            .select('uuid, first_name, last_name, email')
            .eq('id', assoc.related_id)
            .single()
          if (data) {
            entityData = {
              name: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Sans nom',
              subtitle: data.email,
              uuid: data.uuid,
            }
          }
        } else if (assoc.related_type === 'companies') {
          const { data } = await supabase
            .from('companies')
            .select('uuid, name, industry')
            .eq('id', assoc.related_id)
            .single()
          if (data) {
            entityData = {
              name: data.name,
              subtitle: data.industry,
              uuid: data.uuid,
            }
          }
        } else if (assoc.related_type === 'deals') {
          const { data } = await supabase
            .from('deals')
            .select('uuid, name, value, currency')
            .eq('id', assoc.related_id)
            .single()
          if (data) {
            entityData = {
              name: data.name,
              subtitle: data.value ? `${data.value.toLocaleString('fr-FR')} ${data.currency}` : undefined,
              uuid: data.uuid,
            }
          }
        }

        return {
          id: assoc.id,
          related_type: assoc.related_type,
          related_id: assoc.related_id,
          related_name: entityData?.name || 'Inconnu',
          related_subtitle: entityData?.subtitle,
          related_uuid: entityData?.uuid,
          direction: assoc.direction,
          created_at: assoc.created_at,
        }
      })
    )

    return NextResponse.json({
      success: true,
      associations,
    })
  } catch (error) {
    console.error('Association GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/associations
 * Create a new association
 */
export async function POST(request: Request) {
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

    const orgId = profile.organization_id

    // Parse body
    const body = await request.json()
    const { source_type, source_id, target_type, target_id } = body as AssociationCreate

    if (!source_type || !source_id || !target_type || !target_id) {
      return NextResponse.json(
        { success: false, message: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Insert association
    const { data, error: insertError } = await supabase
      .from('associations')
      .upsert({
        organization_id: orgId,
        source_type,
        source_id,
        target_type,
        target_id,
        created_by: user.id,
      }, {
        onConflict: 'organization_id,source_type,source_id,target_type,target_id',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Association insert error:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      association: data,
    })
  } catch (error) {
    console.error('Association POST error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/associations?id=123
 * Delete an association
 */
export async function DELETE(request: Request) {
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

    const orgId = profile.organization_id

    // Parse query params
    const { searchParams } = new URL(request.url)
    const associationId = searchParams.get('id')

    if (!associationId) {
      return NextResponse.json(
        { success: false, message: 'id requis' },
        { status: 400 }
      )
    }

    // Delete association
    const { error: deleteError } = await supabase
      .from('associations')
      .delete()
      .eq('id', parseInt(associationId))
      .eq('organization_id', orgId)

    if (deleteError) {
      console.error('Association delete error:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Association DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
