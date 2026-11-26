'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { QuoteEditor, type Quote, type Product } from '@/components/quotes/QuoteEditor'
import { type QuoteLine } from '@/components/quotes/QuoteLineItem'
import { type QuoteStatus } from '@/components/quotes/QuoteStatusBadge'

type QuoteDetailClientProps = {
  quote: {
    id: number
    uuid: string
    quote_number: string
    name: string
    status: QuoteStatus
    deal_id: number | null
    company_id: number | null
    lead_id: number | null
    recipient_name: string | null
    recipient_email: string | null
    recipient_phone: string | null
    recipient_company: string | null
    recipient_address: string | null
    quote_date: string
    valid_until: string | null
    subtotal: number
    discount_type: string
    discount_value: number
    discount_amount: number
    tax_amount: number
    total: number
    currency: string
    introduction: string | null
    terms: string | null
    notes: string | null
    quote_lines: Array<{
      id: number
      uuid: string
      product_id: number | null
      name: string
      description: string | null
      sku: string | null
      quantity: number
      unit: string
      unit_price: number
      discount_type: string
      discount_value: number
      discount_amount: number
      tax_rate: number
      tax_amount: number
      subtotal: number
      total: number
      display_order: number
    }>
  }
  products: Product[]
  companies: { id: number; name: string }[]
  deals: { id: number; name: string }[]
  organizationId: number
  userId: string
}

export function QuoteDetailClient({
  quote: initialQuote,
  products,
  companies,
  deals,
}: QuoteDetailClientProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  // Transform to editor format
  const editorQuote: Quote = {
    id: initialQuote.id,
    uuid: initialQuote.uuid,
    quote_number: initialQuote.quote_number,
    name: initialQuote.name,
    status: initialQuote.status,
    deal_id: initialQuote.deal_id,
    company_id: initialQuote.company_id,
    lead_id: initialQuote.lead_id,
    recipient_name: initialQuote.recipient_name || '',
    recipient_email: initialQuote.recipient_email || '',
    recipient_phone: initialQuote.recipient_phone || '',
    recipient_company: initialQuote.recipient_company || '',
    recipient_address: initialQuote.recipient_address || '',
    quote_date: initialQuote.quote_date,
    valid_until: initialQuote.valid_until || '',
    subtotal: initialQuote.subtotal,
    discount_type: initialQuote.discount_type as 'percentage' | 'fixed',
    discount_value: initialQuote.discount_value,
    discount_amount: initialQuote.discount_amount,
    tax_amount: initialQuote.tax_amount,
    total: initialQuote.total,
    currency: initialQuote.currency,
    introduction: initialQuote.introduction || '',
    terms: initialQuote.terms || '',
    notes: initialQuote.notes || '',
    lines: initialQuote.quote_lines.map((line) => ({
      id: line.id,
      uuid: line.uuid,
      product_id: line.product_id,
      name: line.name,
      description: line.description,
      sku: line.sku,
      quantity: line.quantity,
      unit: line.unit,
      unit_price: line.unit_price,
      discount_type: line.discount_type as 'percentage' | 'fixed',
      discount_value: line.discount_value,
      discount_amount: line.discount_amount,
      tax_rate: line.tax_rate,
      tax_amount: line.tax_amount,
      subtotal: line.subtotal,
      total: line.total,
      display_order: line.display_order,
    })).sort((a, b) => a.display_order - b.display_order),
  }

  const handleSave = async (quote: Quote) => {
    setIsSaving(true)
    try {
      const supabase = createClient()

      // Update quote
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          name: quote.name,
          deal_id: quote.deal_id,
          company_id: quote.company_id,
          recipient_name: quote.recipient_name || null,
          recipient_email: quote.recipient_email || null,
          recipient_phone: quote.recipient_phone || null,
          recipient_company: quote.recipient_company || null,
          recipient_address: quote.recipient_address || null,
          quote_date: quote.quote_date,
          valid_until: quote.valid_until || null,
          discount_type: quote.discount_type,
          discount_value: quote.discount_value,
          introduction: quote.introduction || null,
          terms: quote.terms || null,
          notes: quote.notes || null,
        })
        .eq('id', quote.id)

      if (quoteError) throw quoteError

      // Delete existing lines
      await supabase
        .from('quote_lines')
        .delete()
        .eq('quote_id', quote.id)

      // Insert new lines
      if (quote.lines.length > 0) {
        const linesToInsert = quote.lines.map((line: QuoteLine, index: number) => ({
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

        const { error: linesError } = await supabase
          .from('quote_lines')
          .insert(linesToInsert)

        if (linesError) throw linesError
      }

      router.refresh()
    } catch (error) {
      console.error('Error saving quote:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async (quote: Quote) => {
    try {
      // Save pending edits first
      await handleSave(quote)

      // Update status to sent
      const supabase = createClient()
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', quote.id)

      if (error) {
        throw error
      }

      router.refresh()
    } catch (error) {
      console.error('Error sending quote:', error)
      alert('Erreur lors de l\'envoi du devis')
    }
  }

  const handleGeneratePdf = async (): Promise<string> => {
    // Call PDF generation API
    const response = await fetch(`/api/quotes/${initialQuote.uuid}/pdf`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }

    const { url } = await response.json()
    window.open(url, '_blank')
    return url
  }

  return (
    <div>
      {/* Back link */}
      <div className="mb-4">
        <Link
          href="/quotes"
          className="inline-flex items-center gap-2 text-sm text-[#4E525A] hover:text-[#0D0F14] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux devis
        </Link>
      </div>

      {/* Editor */}
      <QuoteEditor
        quote={editorQuote}
        products={products}
        companies={companies}
        deals={deals}
        onSave={handleSave}
        onSend={handleSend}
        onGeneratePdf={handleGeneratePdf}
        disabled={isSaving || initialQuote.status !== 'draft'}
      />
    </div>
  )
}
