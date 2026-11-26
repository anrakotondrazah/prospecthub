import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
    }

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

    const body = await request.json()
    const { shared_company_id } = body

    if (!shared_company_id || typeof shared_company_id !== 'number') {
      return NextResponse.json(
        { success: false, message: 'shared_company_id requis' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('unlocked_leads')
      .select('id')
      .eq('organization_id', orgId)
      .eq('shared_company_id', shared_company_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Lead deja debloque' },
        { status: 400 }
      )
    }

    const { data: sharedCompany, error: companyError } = await supabase
      .from('shared_companies')
      .select('*')
      .eq('id', shared_company_id)
      .single()

    if (companyError || !sharedCompany) {
      return NextResponse.json(
        { success: false, message: 'Entreprise non trouvee' },
        { status: 404 }
      )
    }

    const cost = getCreditCost(sharedCompany.quality_score)

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('credits_balance')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 400 }
      )
    }

    if (org.credits_balance < cost) {
      return NextResponse.json(
        {
          success: false,
          message: `Credits insuffisants (${org.credits_balance}/${cost})`,
          credits_needed: cost,
          credits_balance: org.credits_balance,
        },
        { status: 400 }
      )
    }

    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        organization_id: orgId,
        shared_company_id: shared_company_id,
        company_name: sharedCompany.company_name,
        company_siret: sharedCompany.siret,
        phone: sharedCompany.phone,
        email: sharedCompany.email,
        address_city: sharedCompany.address_city,
        address_postal_code: sharedCompany.address_postal_code,
        address_country: sharedCompany.address_country || 'FR',
        source: 'base_entreprises',
        status: 'new',
        score: sharedCompany.quality_score,
      })
      .select('id')
      .single()

    if (leadError) {
      return NextResponse.json(
        { success: false, message: 'Erreur creation lead: ' + leadError.message },
        { status: 500 }
      )
    }

    const newBalance = org.credits_balance - cost

    const { error: updateError } = await supabase
      .from('organizations')
      .update({ credits_balance: newBalance })
      .eq('id', orgId)

    if (updateError) {
      await supabase.from('leads').delete().eq('id', newLead.id)
      return NextResponse.json(
        { success: false, message: 'Erreur mise a jour credits' },
        { status: 500 }
      )
    }

    await supabase.from('credit_transactions').insert({
      organization_id: orgId,
      type: 'spend',
      amount: -cost,
      balance_after: newBalance,
      description: `Deblocage lead: ${sharedCompany.company_name}`,
      reference_type: 'lead',
      reference_id: newLead.id.toString(),
    })

    await supabase.from('unlocked_leads').insert({
      organization_id: orgId,
      shared_company_id: shared_company_id,
      lead_id: newLead.id,
      credits_spent: cost,
      unlocked_by: user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Lead debloque avec succes',
      lead_id: newLead.id,
      credits_spent: cost,
      new_balance: newBalance,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

function getCreditCost(qualityScore: number): number {
  if (qualityScore >= 80) return 3
  if (qualityScore >= 50) return 2
  return 1
}
