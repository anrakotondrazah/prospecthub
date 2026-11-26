import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Props = {
  params: Promise<{ uuid: string }>
}

// HTML escape function to prevent XSS
function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// PDF generation helper function
function generatePdfHtml(quote: {
  quote_number: string
  name: string
  recipient_name: string | null
  recipient_company: string | null
  recipient_email: string | null
  recipient_address: string | null
  quote_date: string
  valid_until: string | null
  introduction: string | null
  terms: string | null
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  currency: string
  quote_lines: Array<{
    name: string
    description: string | null
    quantity: number
    unit_price: number
    subtotal: number
    tax_rate: number
  }>
}, organization: {
  name: string
  website: string | null
  billing_email: string | null
  billing_address: string | null
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: quote.currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(quote.quote_number)} - ${escapeHtml(quote.name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #0D0F14;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #E2E4E6;
    }
    .company-info h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .company-info p { color: #4E525A; font-size: 13px; }
    .quote-info { text-align: right; }
    .quote-info h2 { font-size: 28px; font-weight: 700; color: #17191F; }
    .quote-info .number { font-size: 14px; color: #4E525A; margin-top: 4px; }
    .quote-info .dates { margin-top: 12px; font-size: 13px; color: #4E525A; }
    .recipient { margin-bottom: 30px; }
    .recipient h3 { font-size: 11px; text-transform: uppercase; color: #9BA0A6; margin-bottom: 8px; }
    .recipient p { color: #0D0F14; }
    .introduction { margin-bottom: 30px; padding: 16px; background: #F5F7F9; border-radius: 8px; }
    .introduction p { color: #4E525A; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #E2E4E6; font-size: 11px; text-transform: uppercase; color: #9BA0A6; }
    th:last-child { text-align: right; }
    td { padding: 16px 8px; border-bottom: 1px solid #EFF1F3; }
    td:last-child { text-align: right; font-weight: 600; }
    .item-name { font-weight: 500; }
    .item-desc { font-size: 12px; color: #4E525A; margin-top: 4px; }
    .summary { width: 280px; margin-left: auto; margin-bottom: 30px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .summary-row span:first-child { color: #4E525A; }
    .summary-row.discount span:last-child { color: #B42318; }
    .summary-row.total { border-top: 2px solid #E2E4E6; margin-top: 8px; padding-top: 16px; }
    .summary-row.total span:first-child { font-weight: 600; }
    .summary-row.total span:last-child { font-size: 20px; font-weight: 700; }
    .terms { padding-top: 20px; border-top: 1px solid #EFF1F3; }
    .terms h3 { font-size: 11px; text-transform: uppercase; color: #9BA0A6; margin-bottom: 8px; }
    .terms p { color: #4E525A; font-size: 13px; white-space: pre-wrap; }
    .footer { margin-top: 40px; text-align: center; color: #9BA0A6; font-size: 12px; }
    @media print {
      body { padding: 20px; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>${escapeHtml(organization.name)}</h1>
      ${organization.billing_address ? `<p>${escapeHtml(organization.billing_address)}</p>` : ''}
      ${organization.billing_email ? `<p>${escapeHtml(organization.billing_email)}</p>` : ''}
      ${organization.website ? `<p>${escapeHtml(organization.website)}</p>` : ''}
    </div>
    <div class="quote-info">
      <h2>DEVIS</h2>
      <div class="number">${escapeHtml(quote.quote_number)}</div>
      <div class="dates">
        <p>Date: ${formatDate(quote.quote_date)}</p>
        ${quote.valid_until ? `<p>Valide jusqu'au: ${formatDate(quote.valid_until)}</p>` : ''}
      </div>
    </div>
  </div>

  ${quote.recipient_name || quote.recipient_company ? `
  <div class="recipient">
    <h3>Destinataire</h3>
    ${quote.recipient_name ? `<p><strong>${escapeHtml(quote.recipient_name)}</strong></p>` : ''}
    ${quote.recipient_company ? `<p>${escapeHtml(quote.recipient_company)}</p>` : ''}
    ${quote.recipient_email ? `<p>${escapeHtml(quote.recipient_email)}</p>` : ''}
    ${quote.recipient_address ? `<p>${escapeHtml(quote.recipient_address)}</p>` : ''}
  </div>
  ` : ''}

  ${quote.introduction ? `
  <div class="introduction">
    <p>${escapeHtml(quote.introduction)}</p>
  </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        <th style="width: 50%">Description</th>
        <th style="width: 10%">Qte</th>
        <th style="width: 15%">Prix unit. HT</th>
        <th style="width: 10%">TVA</th>
        <th style="width: 15%">Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${quote.quote_lines.map(line => `
      <tr>
        <td>
          <div class="item-name">${escapeHtml(line.name)}</div>
          ${line.description ? `<div class="item-desc">${escapeHtml(line.description)}</div>` : ''}
        </td>
        <td>${line.quantity}</td>
        <td>${formatCurrency(line.unit_price)}</td>
        <td>${line.tax_rate}%</td>
        <td>${formatCurrency(line.subtotal)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row">
      <span>Sous-total HT</span>
      <span>${formatCurrency(quote.subtotal)}</span>
    </div>
    ${quote.discount_amount > 0 ? `
    <div class="summary-row discount">
      <span>Remise</span>
      <span>-${formatCurrency(quote.discount_amount)}</span>
    </div>
    ` : ''}
    <div class="summary-row">
      <span>TVA</span>
      <span>${formatCurrency(quote.tax_amount)}</span>
    </div>
    <div class="summary-row total">
      <span>Total TTC</span>
      <span>${formatCurrency(quote.total)}</span>
    </div>
  </div>

  ${quote.terms ? `
  <div class="terms">
    <h3>Conditions</h3>
    <p>${escapeHtml(quote.terms)}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>${escapeHtml(organization.name)} - ${escapeHtml(quote.quote_number)}</p>
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest, { params }: Props) {
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

    // Get profile with organization
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

    // Fetch organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('name, website, billing_email, billing_address')
      .eq('id', profile.organization_id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 404 }
      )
    }

    // Fetch quote with lines
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        quote_number,
        name,
        recipient_name,
        recipient_company,
        recipient_email,
        recipient_address,
        quote_date,
        valid_until,
        introduction,
        terms,
        subtotal,
        discount_amount,
        tax_amount,
        total,
        currency,
        quote_lines (
          name,
          description,
          quantity,
          unit_price,
          subtotal,
          tax_rate
        )
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

    // Generate HTML for PDF
    const html = generatePdfHtml(quote, organization)

    // For now, return HTML that can be printed to PDF
    // In production, you would use a service like Puppeteer, wkhtmltopdf, or a PDF API
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${quote.quote_number}.html"`,
      },
    })

    // Alternative: Return data URL for client-side PDF generation
    // const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    // return NextResponse.json({ success: true, url: dataUrl })

  } catch (error) {
    console.error('PDF generation API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
