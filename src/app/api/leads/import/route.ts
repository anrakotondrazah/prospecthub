import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface LeadImportData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  company_name?: string
  company_siret?: string
  address_city?: string
  address_postal_code?: string
  source?: string
}

function validateEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePhone(phone: string): boolean {
  if (!phone) return false
  const cleanPhone = phone.replace(/[\s.-]/g, '')
  return cleanPhone.length >= 10 && /^\+?[\d]+$/.test(cleanPhone)
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s.-]/g, '')
}

function validateLead(lead: LeadImportData): { valid: boolean; error?: string } {
  if (!lead.first_name && !lead.last_name && !lead.company_name) {
    return { valid: false, error: 'Au moins un nom ou entreprise requis' }
  }

  if (lead.email && !validateEmail(lead.email)) {
    return { valid: false, error: `Email invalide: ${lead.email}` }
  }

  if (lead.phone && !validatePhone(lead.phone)) {
    return { valid: false, error: `Telephone invalide: ${lead.phone}` }
  }

  return { valid: true }
}

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

    // Parse request body
    const body = await request.json()
    const { leads } = body as { leads: LeadImportData[] }

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Aucune donnee a importer' },
        { status: 400 }
      )
    }

    // Validate and prepare leads for insertion
    const validLeads: LeadImportData[] = []
    const errors: string[] = []

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i]
      const validation = validateLead(lead)

      if (!validation.valid) {
        errors.push(`Ligne ${i + 1}: ${validation.error}`)
        continue
      }

      validLeads.push({
        ...lead,
        phone: lead.phone ? normalizePhone(lead.phone) : undefined,
      })
    }

    // Insert in batches of 50
    const BATCH_SIZE = 50
    let successCount = 0
    const insertErrors: string[] = []

    for (let i = 0; i < validLeads.length; i += BATCH_SIZE) {
      const batch = validLeads.slice(i, i + BATCH_SIZE)
      const insertData = batch.map(lead => ({
        organization_id: orgId,
        owner_id: user.id,
        first_name: lead.first_name || null,
        last_name: lead.last_name || null,
        email: lead.email || null,
        phone: lead.phone || null,
        company_name: lead.company_name || null,
        company_siret: lead.company_siret || null,
        address_city: lead.address_city || null,
        address_postal_code: lead.address_postal_code || null,
        source: lead.source || 'import_csv',
        status: 'new',
        score: 0,
        is_hot: false,
      }))

      const { data, error: insertError } = await supabase
        .from('leads')
        .insert(insertData)
        .select('id')

      if (insertError) {
        insertErrors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`)
        continue
      }

      successCount += data?.length || 0
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      errors: errors.length + insertErrors.length,
      details: {
        validation_errors: errors,
        insert_errors: insertErrors,
      },
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
