import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
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

    // Fetch products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching products:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des produits' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      products: products || [],
    })
  } catch (error) {
    console.error('Products API error:', error)
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

    // Validate required fields
    if (!body.name || body.unit_price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Nom et prix unitaire obligatoires' },
        { status: 400 }
      )
    }

    // Create product
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        organization_id: profile.organization_id,
        name: body.name,
        sku: body.sku || null,
        description: body.description || null,
        unit_price: body.unit_price,
        currency: body.currency || 'EUR',
        unit: body.unit || 'unit',
        tax_rate: body.tax_rate ?? 20,
        category: body.category || null,
        is_recurring: body.is_recurring || false,
        billing_frequency: body.billing_frequency || null,
        is_active: body.is_active ?? true,
        image_url: body.image_url || null,
        metadata: body.metadata || null,
        created_by: user.id,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating product:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation du produit' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Create product API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
