import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Props = {
  params: Promise<{ uuid: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { uuid } = await params
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

    // Fetch quote with lines
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_lines (*),
        company:companies(id, name),
        deal:deals(id, name)
      `)
      .eq('uuid', uuid)
      .eq('organization_id', profile.organization_id)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json(
        { success: false, message: 'Devis non trouve' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      quote,
    })
  } catch (error) {
    console.error('Get quote API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { uuid } = await params
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

    // Update quote
    const { data: quote, error: updateError } = await supabase
      .from('quotes')
      .update({
        name: body.name,
        status: body.status,
        deal_id: body.deal_id,
        company_id: body.company_id,
        lead_id: body.lead_id,
        recipient_name: body.recipient_name,
        recipient_email: body.recipient_email,
        recipient_phone: body.recipient_phone,
        recipient_company: body.recipient_company,
        recipient_address: body.recipient_address,
        quote_date: body.quote_date,
        valid_until: body.valid_until,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        introduction: body.introduction,
        terms: body.terms,
        notes: body.notes,
        ...(body.status === 'sent' && { sent_at: new Date().toISOString() }),
        ...(body.status === 'approved' && { approved_at: new Date().toISOString() }),
        ...(body.status === 'rejected' && { rejected_at: new Date().toISOString() }),
      })
      .eq('uuid', uuid)
      .eq('organization_id', profile.organization_id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating quote:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour du devis' },
        { status: 500 }
      )
    }

    // Update lines if provided
    if (body.lines) {
      // Delete existing lines
      await supabase
        .from('quote_lines')
        .delete()
        .eq('quote_id', quote.id)

      // Insert new lines
      if (body.lines.length > 0) {
        const linesToInsert = body.lines.map((line: {
          product_id: number | null
          name: string
          description: string | null
          sku: string | null
          quantity: number
          unit: string
          unit_price: number
          discount_type: string
          discount_value: number
          tax_rate: number
          display_order: number
        }, index: number) => ({
          quote_id: quote.id,
          product_id: line.product_id,
          name: line.name,
          description: line.description,
          sku: line.sku,
          quantity: line.quantity,
          unit: line.unit,
          unit_price: line.unit_price,
          discount_type: line.discount_type,
          discount_value: line.discount_value,
          tax_rate: line.tax_rate,
          display_order: index,
        }))

        await supabase
          .from('quote_lines')
          .insert(linesToInsert)
      }
    }

    return NextResponse.json({
      success: true,
      quote,
    })
  } catch (error) {
    console.error('Update quote API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { uuid } = await params
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

    // Soft delete
    const { error: deleteError } = await supabase
      .from('quotes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('uuid', uuid)
      .eq('organization_id', profile.organization_id)

    if (deleteError) {
      console.error('Error deleting quote:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression du devis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Devis supprime',
    })
  } catch (error) {
    console.error('Delete quote API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
