'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type QuoteStatus = 'draft' | 'pending' | 'sent' | 'approved' | 'rejected' | 'expired'

export type QuoteLine = {
  id: number
  uuid: string
  quote_id: number
  product_id: number | null
  name: string
  description: string | null
  sku: string | null
  quantity: number
  unit: string
  unit_price: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  subtotal: number
  total: number
  display_order: number
}

export type Quote = {
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
  sent_at: string | null
  approved_at: string | null
  rejected_at: string | null
  subtotal: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  tax_amount: number
  total: number
  currency: string
  introduction: string | null
  terms: string | null
  notes: string | null
  pdf_url: string | null
  created_at: string
  quote_lines: QuoteLine[]
  company?: { id: number; name: string } | null
  deal?: { id: number; name: string } | null
}

export function useQuotes(organizationId: number | null) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchQuotes = useCallback(async () => {
    if (!organizationId) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_lines (*),
          company:companies(id, name),
          deal:deals(id, name)
        `)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setQuotes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quotes'))
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const createQuote = useCallback(async (quoteData: {
    name: string
    deal_id?: number | null
    company_id?: number | null
    recipient_name?: string
    recipient_email?: string
    valid_until?: string
  }, userId: string) => {
    if (!organizationId) throw new Error('No organization')

    const supabase = createClient()

    // Generate quote number
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .like('quote_number', `DEV-${year}-%`)

    const nextNumber = (count || 0) + 1
    const quoteNumber = `DEV-${year}-${String(nextNumber).padStart(4, '0')}`

    const { data, error } = await supabase
      .from('quotes')
      .insert({
        organization_id: organizationId,
        quote_number: quoteNumber,
        name: quoteData.name,
        status: 'draft',
        deal_id: quoteData.deal_id || null,
        company_id: quoteData.company_id || null,
        recipient_name: quoteData.recipient_name || null,
        recipient_email: quoteData.recipient_email || null,
        quote_date: new Date().toISOString().split('T')[0],
        valid_until: quoteData.valid_until || null,
        owner_id: userId,
        created_by: userId,
      })
      .select(`
        *,
        quote_lines (*),
        company:companies(id, name),
        deal:deals(id, name)
      `)
      .single()

    if (error) throw error

    setQuotes((prev) => [data, ...prev])
    return data
  }, [organizationId])

  const updateQuote = useCallback(async (uuid: string, updates: Partial<Quote>) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('uuid', uuid)
      .select(`
        *,
        quote_lines (*),
        company:companies(id, name),
        deal:deals(id, name)
      `)
      .single()

    if (error) throw error

    setQuotes((prev) => prev.map((q) => (q.uuid === uuid ? data : q)))
    return data
  }, [])

  const deleteQuote = useCallback(async (uuid: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('quotes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('uuid', uuid)

    if (error) throw error

    setQuotes((prev) => prev.filter((q) => q.uuid !== uuid))
  }, [])

  return {
    quotes,
    isLoading,
    error,
    refetch: fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
  }
}
