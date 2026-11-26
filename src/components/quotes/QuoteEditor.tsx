'use client'

import { useState, useEffect } from 'react'
import { QuoteLineItem, type QuoteLine } from './QuoteLineItem'
import { QuoteSummary } from './QuoteSummary'
import { QuoteStatusBadge, type QuoteStatus } from './QuoteStatusBadge'
import { ProductPicker } from '@/components/products/ProductPicker'
import { PayButton, SaveButton, DownloadButton } from '@/components/ui/buttons'

export type Quote = {
  id?: number
  uuid?: string
  quote_number: string
  name: string
  status: QuoteStatus
  deal_id: number | null
  company_id: number | null
  lead_id: number | null
  recipient_name: string
  recipient_email: string
  recipient_phone: string
  recipient_company: string
  recipient_address: string
  quote_date: string
  valid_until: string
  subtotal: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  tax_amount: number
  total: number
  currency: string
  introduction: string
  terms: string
  notes: string
  lines: QuoteLine[]
}

export type Product = {
  id: number
  uuid: string
  sku: string | null
  name: string
  description: string | null
  unit_price: number
  currency: string
  unit: string
  tax_rate: number
  category: string | null
  is_recurring: boolean
  is_active: boolean
}

interface QuoteEditorProps {
  quote: Quote
  products: Product[]
  companies?: { id: number; name: string }[]
  deals?: { id: number; name: string }[]
  onSave: (quote: Quote) => Promise<void>
  onSend?: (quote: Quote) => Promise<void>
  onGeneratePdf?: (quote: Quote) => Promise<string>
  disabled?: boolean
}

export function QuoteEditor({
  quote: initialQuote,
  products,
  companies = [],
  deals = [],
  onSave,
  onSend,
  onGeneratePdf,
  disabled = false,
}: QuoteEditorProps) {
  const [quote, setQuote] = useState<Quote>(initialQuote)
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'preview'>('details')

  useEffect(() => {
    setQuote(initialQuote)
  }, [initialQuote])

  const calculateTotals = (lines: QuoteLine[], discountType: 'percentage' | 'fixed', discountValue: number) => {
    const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)
    const taxAmount = lines.reduce((sum, line) => sum + line.tax_amount, 0)

    let discountAmount = 0
    if (discountType === 'percentage') {
      discountAmount = Math.round(subtotal * (discountValue / 100) * 100) / 100
    } else {
      discountAmount = discountValue
    }

    const total = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100

    return { subtotal, discountAmount, taxAmount, total }
  }

  const updateQuote = (updates: Partial<Quote>) => {
    const newQuote = { ...quote, ...updates }

    // Recalculate totals if lines or discount changed
    if (updates.lines || updates.discount_type !== undefined || updates.discount_value !== undefined) {
      const totals = calculateTotals(
        updates.lines || quote.lines,
        updates.discount_type ?? quote.discount_type,
        updates.discount_value ?? quote.discount_value
      )
      Object.assign(newQuote, totals)
    }

    setQuote(newQuote)
  }

  const addLine = (product?: Product) => {
    const newLine: QuoteLine = {
      product_id: product?.id ?? null,
      name: product?.name ?? '',
      description: product?.description ?? null,
      sku: product?.sku ?? null,
      quantity: 1,
      unit: product?.unit ?? 'unit',
      unit_price: product?.unit_price ?? 0,
      discount_type: 'percentage',
      discount_value: 0,
      discount_amount: 0,
      tax_rate: product?.tax_rate ?? 20,
      tax_amount: 0,
      subtotal: product?.unit_price ?? 0,
      total: product ? product.unit_price * (1 + product.tax_rate / 100) : 0,
      display_order: quote.lines.length,
    }

    updateQuote({ lines: [...quote.lines, newLine] })
    setIsProductPickerOpen(false)
  }

  const updateLine = (index: number, line: QuoteLine) => {
    const newLines = [...quote.lines]
    newLines[index] = line
    updateQuote({ lines: newLines })
  }

  const removeLine = (index: number) => {
    const newLines = quote.lines.filter((_, i) => i !== index)
    updateQuote({ lines: newLines })
  }

  const moveLineUp = (index: number) => {
    if (index === 0) return
    const newLines = [...quote.lines]
    ;[newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]]
    updateQuote({ lines: newLines })
  }

  const moveLineDown = (index: number) => {
    if (index === quote.lines.length - 1) return
    const newLines = [...quote.lines]
    ;[newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]]
    updateQuote({ lines: newLines })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(quote)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-[#0D0F14]">{quote.quote_number || 'Nouveau devis'}</h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <input
            type="text"
            value={quote.name}
            onChange={(e) => updateQuote({ name: e.target.value })}
            placeholder="Nom du devis"
            disabled={disabled}
            className="text-sm text-[#4E525A] bg-transparent border-none focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          {onGeneratePdf && (
            <DownloadButton
              onClick={() => onGeneratePdf(quote)}
              tooltip="Telecharger PDF"
            />
          )}
          {onSend && quote.status === 'draft' && (
            <PayButton onClick={() => onSend(quote)}>
              Envoyer
            </PayButton>
          )}
          <SaveButton onClick={handleSave}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </SaveButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F5F7F9] p-1 rounded-xl w-fit">
        {(['details', 'content', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-[#0D0F14] shadow-sm'
                : 'text-[#4E525A] hover:text-[#0D0F14]'
            }`}
          >
            {tab === 'details' ? 'Details' : tab === 'content' ? 'Contenu' : 'Apercu'}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E4E6] p-5">
              <h3 className="text-sm font-semibold text-[#0D0F14] mb-4">Informations</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#4E525A] mb-1.5">Date du devis</label>
                  <input
                    type="date"
                    value={quote.quote_date}
                    onChange={(e) => updateQuote({ quote_date: e.target.value })}
                    disabled={disabled}
                    className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E525A] mb-1.5">Valide jusqu&apos;au</label>
                  <input
                    type="date"
                    value={quote.valid_until}
                    onChange={(e) => updateQuote({ valid_until: e.target.value })}
                    disabled={disabled}
                    className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
                  />
                </div>
                {deals.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-[#4E525A] mb-1.5">Associer a un deal</label>
                    <select
                      value={quote.deal_id || ''}
                      onChange={(e) => updateQuote({ deal_id: e.target.value ? parseInt(e.target.value) : null })}
                      disabled={disabled}
                      className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
                    >
                      <option value="">Aucun</option>
                      {deals.map((deal) => (
                        <option key={deal.id} value={deal.id}>{deal.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E4E6] p-5">
              <h3 className="text-sm font-semibold text-[#0D0F14] mb-4">Destinataire</h3>
              <div className="space-y-4">
                {companies.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-[#4E525A] mb-1.5">Entreprise</label>
                    <select
                      value={quote.company_id || ''}
                      onChange={(e) => {
                        const companyId = e.target.value ? parseInt(e.target.value) : null
                        const company = companies.find((c) => c.id === companyId)
                        updateQuote({
                          company_id: companyId,
                          recipient_company: company?.name || '',
                        })
                      }}
                      disabled={disabled}
                      className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
                    >
                      <option value="">Selectionnez...</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#4E525A] mb-1.5">Nom du contact</label>
                  <input
                    type="text"
                    value={quote.recipient_name}
                    onChange={(e) => updateQuote({ recipient_name: e.target.value })}
                    placeholder="Jean Dupont"
                    disabled={disabled}
                    className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E525A] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={quote.recipient_email}
                    onChange={(e) => updateQuote({ recipient_email: e.target.value })}
                    placeholder="jean@entreprise.fr"
                    disabled={disabled}
                    className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E525A] mb-1.5">Telephone</label>
                  <input
                    type="tel"
                    value={quote.recipient_phone}
                    onChange={(e) => updateQuote({ recipient_phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                    disabled={disabled}
                    className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Lines */}
          <div className="col-span-2 space-y-4">
            {/* Introduction */}
            <div className="bg-white rounded-xl border border-[#E2E4E6] p-5">
              <label className="block text-sm font-semibold text-[#0D0F14] mb-3">Introduction</label>
              <textarea
                value={quote.introduction}
                onChange={(e) => updateQuote({ introduction: e.target.value })}
                placeholder="Message d'introduction du devis..."
                rows={3}
                disabled={disabled}
                className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors resize-none disabled:opacity-50"
              />
            </div>

            {/* Quote lines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0D0F14]">Lignes du devis</h3>
                <button
                  onClick={() => setIsProductPickerOpen(true)}
                  disabled={disabled}
                  className="px-3 py-1.5 bg-[#17191F] text-white rounded-lg text-sm font-medium hover:bg-[#2A2D35] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Ajouter
                </button>
              </div>

              {quote.lines.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-[#E2E4E6] p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#F5F7F9] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#4E525A] mb-3">Aucune ligne dans ce devis</p>
                  <button
                    onClick={() => setIsProductPickerOpen(true)}
                    disabled={disabled}
                    className="text-sm text-[#17191F] font-medium hover:underline disabled:opacity-50"
                  >
                    Ajouter un produit
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {quote.lines.map((line, index) => (
                    <QuoteLineItem
                      key={line.uuid || index}
                      line={line}
                      index={index}
                      onUpdate={updateLine}
                      onRemove={removeLine}
                      onMoveUp={moveLineUp}
                      onMoveDown={moveLineDown}
                      isFirst={index === 0}
                      isLast={index === quote.lines.length - 1}
                      disabled={disabled}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="bg-white rounded-xl border border-[#E2E4E6] p-5">
              <label className="block text-sm font-semibold text-[#0D0F14] mb-3">Conditions</label>
              <textarea
                value={quote.terms}
                onChange={(e) => updateQuote({ terms: e.target.value })}
                placeholder="Conditions de vente, modalites de paiement..."
                rows={3}
                disabled={disabled}
                className="w-full px-3 py-2.5 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors resize-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="col-span-1">
            <div className="sticky top-6">
              <QuoteSummary
                subtotal={quote.subtotal}
                discountType={quote.discount_type}
                discountValue={quote.discount_value}
                discountAmount={quote.discount_amount}
                taxAmount={quote.tax_amount}
                total={quote.total}
                currency={quote.currency}
                onDiscountTypeChange={(type) => updateQuote({ discount_type: type })}
                onDiscountValueChange={(value) => updateQuote({ discount_value: value })}
                editable={!disabled}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-xl border border-[#E2E4E6] p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-[#E2E4E6]">
              <div>
                <h2 className="text-2xl font-bold text-[#0D0F14] mb-1">{quote.name || 'Devis'}</h2>
                <p className="text-sm text-[#4E525A]">{quote.quote_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#4E525A]">Date: {new Date(quote.quote_date).toLocaleDateString('fr-FR')}</p>
                {quote.valid_until && (
                  <p className="text-sm text-[#4E525A]">
                    Valide jusqu&apos;au: {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

            {/* Recipient */}
            {(quote.recipient_name || quote.recipient_company) && (
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-[#9BA0A6] uppercase mb-2">Destinataire</h3>
                <p className="font-medium text-[#0D0F14]">{quote.recipient_name}</p>
                {quote.recipient_company && <p className="text-sm text-[#4E525A]">{quote.recipient_company}</p>}
                {quote.recipient_email && <p className="text-sm text-[#4E525A]">{quote.recipient_email}</p>}
              </div>
            )}

            {/* Introduction */}
            {quote.introduction && (
              <div className="mb-8">
                <p className="text-sm text-[#4E525A] whitespace-pre-wrap">{quote.introduction}</p>
              </div>
            )}

            {/* Lines table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-[#E2E4E6]">
                  <th className="text-left py-3 text-xs font-semibold text-[#9BA0A6] uppercase">Description</th>
                  <th className="text-right py-3 text-xs font-semibold text-[#9BA0A6] uppercase w-20">Qte</th>
                  <th className="text-right py-3 text-xs font-semibold text-[#9BA0A6] uppercase w-28">Prix unit.</th>
                  <th className="text-right py-3 text-xs font-semibold text-[#9BA0A6] uppercase w-28">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {quote.lines.map((line, i) => (
                  <tr key={i} className="border-b border-[#EFF1F3]">
                    <td className="py-3">
                      <p className="font-medium text-[#0D0F14]">{line.name}</p>
                      {line.description && <p className="text-sm text-[#4E525A] mt-0.5">{line.description}</p>}
                    </td>
                    <td className="py-3 text-right text-sm text-[#0D0F14]">{line.quantity}</td>
                    <td className="py-3 text-right text-sm text-[#0D0F14]">{line.unit_price.toLocaleString('fr-FR')} EUR</td>
                    <td className="py-3 text-right text-sm font-medium text-[#0D0F14]">{line.subtotal.toLocaleString('fr-FR')} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-[#4E525A]">Sous-total HT</span>
                  <span className="text-sm text-[#0D0F14]">{quote.subtotal.toLocaleString('fr-FR')} EUR</span>
                </div>
                {quote.discount_amount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-[#4E525A]">Remise</span>
                    <span className="text-sm text-[#B42318]">-{quote.discount_amount.toLocaleString('fr-FR')} EUR</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-sm text-[#4E525A]">TVA</span>
                  <span className="text-sm text-[#0D0F14]">{quote.tax_amount.toLocaleString('fr-FR')} EUR</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-[#E2E4E6] mt-2">
                  <span className="font-semibold text-[#0D0F14]">Total TTC</span>
                  <span className="text-lg font-bold text-[#0D0F14]">{quote.total.toLocaleString('fr-FR')} EUR</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            {quote.terms && (
              <div className="pt-6 border-t border-[#E2E4E6]">
                <h3 className="text-xs font-semibold text-[#9BA0A6] uppercase mb-2">Conditions</h3>
                <p className="text-sm text-[#4E525A] whitespace-pre-wrap">{quote.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      <ProductPicker
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        onSelect={addLine}
        onAddEmpty={() => addLine()}
        products={products}
      />
    </div>
  )
}
