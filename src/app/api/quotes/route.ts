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

    // Fetch quotes
    const { data: quotes, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_lines (*),
        company:companies(id, name),
        deal:deals(id, name)
      `)
      .eq('organization_id', profile.organization_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching quotes:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des devis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quotes: quotes || [],
    })
  } catch (error) {
    console.error('Quotes API error:', error)
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

    // Generate quote number
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .like('quote_number', `DEV-${year}-%`)

    const nextNumber = (count || 0) + 1
    const quoteNumber = `DEV-${year}-${String(nextNumber).padStart(4, '0')}`

    // Create quote
    const { data: quote, error: insertError } = await supabase
      .from('quotes')
      .insert({
        organization_id: profile.organization_id,
        quote_number: quoteNumber,
        name: body.name,
        status: 'draft',
        deal_id: body.deal_id || null,
        company_id: body.company_id || null,
        lead_id: body.lead_id || null,
        recipient_name: body.recipient_name || null,
        recipient_email: body.recipient_email || null,
        recipient_phone: body.recipient_phone || null,
        recipient_company: body.recipient_company || null,
        recipient_address: body.recipient_address || null,
        quote_date: body.quote_date || new Date().toISOString().split('T')[0],
        valid_until: body.valid_until || null,
        introduction: body.introduction || null,
        terms: body.terms || null,
        notes: body.notes || null,
        owner_id: user.id,
        created_by: user.id,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating quote:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation du devis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quote,
    })
  } catch (error) {
    console.error('Create quote API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
